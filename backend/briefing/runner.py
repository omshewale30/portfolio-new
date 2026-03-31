import asyncio
import logging
from openai import AsyncOpenAI, RateLimitError
from typing import Any
from langchain_core.messages import HumanMessage
from tools.task_tools import _list_overdue_tasks, _list_due_today_tasks
from integrations.telegram import send_message
from settings.config import settings
from jarvis_agents.runner import run_agent

logger = logging.getLogger(__name__)




async def send_morning_briefing() -> None:
    """
    Fetches calendar + weather + task data, runs day planning, synthesizes a morning briefing,
    and sends it proactively to the user's Telegram.
    Called by APScheduler at the configured briefing time.
    """
    logger.info("Running morning briefing...")
    response = await run_agent(settings.telegram_chat_id, "Generate a morning briefing.")
    await send_message(settings.telegram_chat_id, response)

    
