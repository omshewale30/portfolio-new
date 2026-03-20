import logging
from openai import AsyncOpenAI
from tools.calendar_tools import get_todays_events
from tools.task_tools import _list_overdue_tasks, _list_due_today_tasks
from integrations.telegram import send_message
from config import settings
from jarvis_agents.runner import run_agent
from db.connection import get_async_session
logger = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=settings.openai_api_key)

BRIEFING_SYSTEM_PROMPT = """
You are Jarvis, a personal assistant delivering a morning briefing.
You will receive calendar events, current weather, overdue tasks, and tasks due today.
Write a concise, friendly morning briefing in plain text (no markdown headers).
Structure it as:
1. A brief greeting with the date
2. Schedule overview — highlight key events, note any back-to-back meetings or conflicts
3. Task snapshot — call out overdue tasks and anything due today, grouped by project if there are multiple
4. One closing practical note if relevant (e.g., early start, no meetings today, rain expected)

Keep the total under 250 words. Conversational, not corporate.
"""

async def send_morning_briefing() -> None:
    """
    Fetches calendar + weather + task data, synthesizes a morning briefing,
    and sends it proactively to the user's Telegram.
    Called by APScheduler at the configured briefing time.
    """
    logger.info("Running morning briefing...")

    try:
        async with get_async_session() as db_session:
            calendar_weather_context = await run_agent(
                settings.telegram_chat_id,
                "Get the calendar events and current weather for today",
                db_session=db_session,
            )

        overdue_context = await _list_overdue_tasks()
        due_today_context = await _list_due_today_tasks()

        full_context = "\n\n".join([
            calendar_weather_context,
            overdue_context,
            due_today_context,
        ])

        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": BRIEFING_SYSTEM_PROMPT},
                {"role": "user", "content": full_context}
            ],
            max_tokens=500,
            temperature=0.7,
        )

        briefing_text = response.choices[0].message.content
        await send_message(settings.telegram_chat_id, briefing_text)
        logger.info("Morning briefing sent successfully.")

    except Exception as e:
        logger.error(f"Morning briefing failed: {e}", exc_info=True)
        await send_message(
            settings.telegram_chat_id,
            "⚠️ Jarvis couldn't generate your morning briefing. Check the logs."
        )