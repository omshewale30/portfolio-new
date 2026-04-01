import logging
from datetime import datetime

import pytz
from langchain_core.messages import HumanMessage, AIMessage

from integrations.telegram import send_message
from jarvis_agents.planning_agent import planning_graph
from settings.config import settings

logger = logging.getLogger(__name__)

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
        if isinstance(msg, AIMessage):
            content = msg.content
            if isinstance(content, str) and content.strip():
                return content.strip()
            if isinstance(content, list):
                for item in content:
                    if isinstance(item, dict) and item.get("text"):
                        return str(item["text"]).strip()
    return ""


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
        result = await planning_graph.ainvoke({
            "messages": [HumanMessage(content=MORNING_BRIEFING_MESSAGE)]
        })

        briefing_text = _extract_final_response(result.get("messages", []))

        if not briefing_text:
            briefing_text = (
                "Good morning! I encountered an issue generating your briefing today. "
                "Please check your calendar and tasks manually."
            )
            logger.warning("Empty briefing response from planning agent")

        await send_message(settings.telegram_chat_id, briefing_text)
        logger.info("Morning briefing sent successfully")

    except Exception as e:
        logger.exception("Failed to generate morning briefing: %s", e)
        await send_message(
            settings.telegram_chat_id,
            "Good morning! I encountered an error while preparing your briefing. "
            "Please check your calendar and tasks manually."
        )

