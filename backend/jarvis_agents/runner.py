from agents import Runner, RunConfig, SessionSettings
from agents.extensions.memory import SQLAlchemySession
import re
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from jarvis_agents.orchestrator import get_orchestrator
from openai import BadRequestError
from settings.logging import get_logger

logger = get_logger(__name__)


def _clean_telegram_output(text: str) -> str:
    """Strip citation artifacts/markdown noise before sending to Telegram."""
    text = re.sub(r"【[^】]+】", "", text)  # Remove 【citation】 markers
    text = text.replace("**", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


async def run_agent(chat_id: str | int, user_message: str, db_session: AsyncSession) -> str:
    """
    Run the orchestrator agent and return the final text response.
    Session is keyed per Telegram chat.
    """
    memory_engine = db_session.bind
    if not isinstance(memory_engine, AsyncEngine):
        raise RuntimeError(f"AsyncEngine expected, got {memory_engine}")

    session = SQLAlchemySession(str(chat_id), engine=memory_engine, create_tables=False)
    local_orchestrator = get_orchestrator()

    try:
        result = await Runner.run(
            local_orchestrator,
            user_message,
            session=session,
            run_config=RunConfig(session_settings=SessionSettings(limit=100))
        )
        return _clean_telegram_output(result.final_output)
    except BadRequestError as e:
        if "No tool call found for function call output" in str(e):
            logger.warning(f"Corrupted history for chat {chat_id}, clearing and retrying...")
            await session.clear_session()
            result = await Runner.run(
                local_orchestrator,
                user_message,
                session=session,
                run_config=RunConfig(session_settings=SessionSettings(limit=100))
            )
            return _clean_telegram_output(result.final_output)
        raise
