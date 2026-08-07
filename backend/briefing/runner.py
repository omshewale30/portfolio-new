import asyncio
import logging
import random
import re
import ssl
from datetime import datetime
from socket import timeout as SocketTimeout

import pytz
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langgraph.errors import GraphRecursionError
from openai import RateLimitError

from integrations.telegram import send_message
from jarvis_agents.planning_agent import planning_graph
from settings.config import settings

logger = logging.getLogger(__name__)

# Morning briefing runs many agent steps; org TPM can be saturated. Outer retries with
# backoff that can span minute boundaries recover where SDK-only retries do not.
_BRIEFING_RATE_LIMIT_ATTEMPTS = 10
_RETRY_MS_RE = re.compile(r"try again in ([\d.]+)\s*ms", re.IGNORECASE)
_NETWORK_EXCEPTIONS = (ssl.SSLError, ConnectionResetError, TimeoutError, SocketTimeout, ConnectionError)

MORNING_BRIEFING_MESSAGE = """
Generate a complete morning briefing by following these steps in order:

1. Get current datetime to anchor today's date
2. Fetch today's calendar events
3. Fetch open tasks (due today and overdue)
4. Plan the day by scheduling appropriate time blocks for tasks and routine activities
5. Verify the scheduled blocks using the planning_verifier_tool
6. Generate the morning briefing using generate_morning_briefing tool with the planning result

Return the final briefing text.
"""


def _extract_final_response(messages: list) -> str:
    """Extract the final AI response text from message list."""
    for msg in reversed(messages):
        if isinstance(msg, ToolMessage) and msg.name == "generate_morning_briefing":
            content = msg.content
            if isinstance(content, str) and content.strip():
                return content.strip()
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and item.get("text"):
                        return str(item["text"]).strip()

    for msg in reversed(messages):
        if isinstance(msg, AIMessage):
            content = msg.content
            if isinstance(content, str) and content.strip():
                return content.strip()
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and item.get("text"):
                        return str(item["text"]).strip()
    return ""


def _rate_limit_backoff_seconds(attempt: int, exc: RateLimitError) -> float:
    """Sleep long enough for TPM rolling window to recover; API 'try again in Xms' is often too short."""
    msg = str(exc)
    m = _RETRY_MS_RE.search(msg)
    hint_sec = float(m.group(1)) / 1000.0 if m else 0.0
    # Escalate: 4s, 8s, 16s, ... capped so we can cross into the next minute under heavy TPM use.
    floor = min(120.0, 2.0 ** (attempt + 2))
    return max(hint_sec + random.uniform(0, 0.5), floor)


async def _run_planning_briefing():
    for attempt in range(_BRIEFING_RATE_LIMIT_ATTEMPTS):
        try:
            logger.info(
                "Morning briefing phase=planning_invoke_start attempt=%s/%s recursion_limit=%s",
                attempt + 1,
                _BRIEFING_RATE_LIMIT_ATTEMPTS,
                50,
            )
            return await planning_graph.ainvoke({
                "messages": [HumanMessage(content=MORNING_BRIEFING_MESSAGE)],
            }, config={"recursion_limit": 50})
        except RateLimitError as e:
            if attempt >= _BRIEFING_RATE_LIMIT_ATTEMPTS - 1:
                raise
            delay = _rate_limit_backoff_seconds(attempt, e)
            logger.warning(
                "Morning briefing rate limited (attempt %s/%s); retrying in %.1fs: %s",
                attempt + 1,
                _BRIEFING_RATE_LIMIT_ATTEMPTS,
                delay,
                e,
            )
            await asyncio.sleep(delay)


async def send_morning_briefing() -> None:
    """
    Runs the morning briefing workflow:
    1. Invokes the planning agent to plan the day
    2. Planning agent schedules events in calendar
    3. Planning agent verifies the schedule
    4. Planning agent generates the briefing
    5. Sends briefing to user via Telegram

    Called by APScheduler at the configured briefing time.
    """
    tz = pytz.timezone(settings.timezone)
    now = datetime.now(tz)
    logger.info("Running morning briefing for %s...", now.strftime("%Y-%m-%d %H:%M"))

    try:
        logger.info("Morning briefing phase=planning_invoke")
        result = await _run_planning_briefing()
        logger.info(
            "Morning briefing phase=planning_invoke_done message_count=%s",
            len(result.get("messages", [])),
        )

        logger.info("Morning briefing phase=extract_final_response")
        briefing_text = _extract_final_response(result.get("messages", []))

        if not briefing_text:
            briefing_text = (
                "Good morning! I encountered an issue generating your briefing today. "
                "Please check your calendar and tasks manually."
            )
            logger.warning(
                "Morning briefing phase=extract_final_response_empty message_count=%s",
                len(result.get("messages", [])),
            )

        logger.info("Morning briefing phase=telegram_send")
        await send_message(settings.telegram_chat_id, briefing_text)
        logger.info("Morning briefing phase=done status=success")

    except GraphRecursionError as e:
        logger.exception("Morning briefing failed: recursion limit reached: %s", e)
        await send_message(
            settings.telegram_chat_id,
            "Good morning! I hit a planning recursion limit while preparing your briefing. "
            "Please check your calendar and tasks manually."
        )
    except _NETWORK_EXCEPTIONS as e:
        logger.exception("Morning briefing failed: network/transport error: %s", e)
        await send_message(
            settings.telegram_chat_id,
            "Good morning! A network error occurred while preparing your briefing. "
            "Please check your calendar and tasks manually."
        )
    except Exception as e:
        logger.exception("Failed to generate morning briefing: %s", e)
        await send_message(
            settings.telegram_chat_id,
            "Good morning! I encountered an error while preparing your briefing. "
            "Please check your calendar and tasks manually."
        )

