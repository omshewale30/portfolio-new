import asyncio
import logging
from openai import AsyncOpenAI, RateLimitError
from typing import Any
from tools.task_tools import _list_overdue_tasks, _list_due_today_tasks
from integrations.telegram import send_message
from settings.config import settings
from jarvis_agents.weather_agent import weather_agent
from jarvis_agents.news_agent import ai_news_agent
from jarvis_agents.planning_agent import planning_agent
from agents import Runner
import json

logger = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=settings.openai_api_key)

BRIEFING_SYSTEM_PROMPT = """
You are Jarvis, a personal assistant delivering a morning briefing.
You will receive overdue tasks, tasks due today, and a planning result.
Write a concise, friendly morning briefing in plain text (no markdown headers).
Structure it as:
1. A brief greeting with the date, like "Good morning, Sir! Here's your morning briefing for today."
2. Schedule overview — highlight key events, note any back-to-back meetings or conflicts
3. Task snapshot — call out overdue tasks and anything due today, grouped by project if there are multiple
4. Planning actions — summarize what was scheduled vs left unscheduled; if planning stayed draft-only, mention warnings clearly
5. One closing practical note if relevant (e.g., early start, no meetings today)

Keep the total under 250 words. Conversational, not corporate.
"""

PLANNING_REQUEST = (
    "Plan my day for the remainder of today using my existing calendar, today's and overdue "
    "tasks"
)




def _trim(label: str, text: str, max_chars: int) -> str:
    cleaned = (text or "").strip()
    if len(cleaned) <= max_chars:
        return cleaned
    return f"{cleaned[:max_chars]}\n...[{label} truncated for brevity]"


def _to_jsonable(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(k): _to_jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_to_jsonable(v) for v in value]

    # Pydantic v2
    if hasattr(value, "model_dump"):
        try:
            return _to_jsonable(value.model_dump())
        except Exception:
            pass

    # Pydantic v1 or similar objects
    if hasattr(value, "dict"):
        try:
            return _to_jsonable(value.dict())
        except Exception:
            pass

    return str(value)


def _planning_context_json(run_result: Any) -> str:
    final_output = getattr(run_result, "final_output", run_result)
    jsonable = _to_jsonable(final_output)
    return json.dumps(jsonable, indent=2, ensure_ascii=True)


async def _run_with_retry(coro_factory, label: str, attempts: int = 4) -> object:
    for attempt in range(1, attempts + 1):
        try:
            return await coro_factory()
        except RateLimitError:
            if attempt == attempts:
                raise
            delay_seconds = 2 * attempt
            logger.warning(
                "Rate limited during %s (attempt %s/%s); retrying in %ss",
                label,
                attempt,
                attempts,
                delay_seconds,
            )
            await asyncio.sleep(delay_seconds)

async def send_morning_briefing() -> None:
    """
    Fetches calendar + weather + task data, runs day planning, synthesizes a morning briefing,
    and sends it proactively to the user's Telegram.
    Called by APScheduler at the configured briefing time.
    """
    logger.info("Running morning briefing...")

    try:
        planning_run = await _run_with_retry(
            lambda: Runner.run(planning_agent, PLANNING_REQUEST),
            "planning",
        )

        overdue_context = await _list_overdue_tasks()
        due_today_context = await _list_due_today_tasks()

        full_context = "\n\n".join([
            _trim("Overdue tasks", overdue_context, 1200),
            _trim("Due today tasks", due_today_context, 1200),
            f"Planning result:\n{_trim('Planning', _planning_context_json(planning_run), 2200)}"
        ])

        response = await _run_with_retry(
            lambda: client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": BRIEFING_SYSTEM_PROMPT},
                    {"role": "user", "content": full_context},
                ],
                max_tokens=320,
                temperature=0.5,
            ),
            "briefing synthesis",
        )

        briefing_text = (response.choices[0].message.content or "").strip()
        if not briefing_text:
            briefing_text = "Good morning. I couldn't compile a full briefing, but your systems are online."
        await send_message(settings.telegram_chat_id, briefing_text)
        logger.info("Morning briefing sent successfully.")

    except Exception as e:
        logger.error(f"Morning briefing failed: {e}", exc_info=True)
        await send_message(
            settings.telegram_chat_id,
            "⚠️ Jarvis couldn't generate your morning briefing. Check the logs."
        )