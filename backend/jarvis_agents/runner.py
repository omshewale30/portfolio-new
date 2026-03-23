from agents import Runner, RunConfig, SessionSettings
from agents.extensions.memory import SQLAlchemySession
import re
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.orm import Session
from jarvis_agents.orchestrator import get_orchestrator
from openai import BadRequestError
from settings.logging import get_logger
from settings.config import settings

logger = get_logger(__name__)


def _to_async_db_url(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


MEMORY_ENGINE: AsyncEngine = create_async_engine(
    _to_async_db_url(settings.database_url),
    pool_pre_ping=True,
)


def _clean_telegram_output(text: str) -> str:
    """Strip citation artifacts/markdown noise before sending to Telegram."""
    text = re.sub(r"【[^】]+】", "", text)  # Remove 【citation】 markers
    text = text.replace("**", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


async def run_agent(chat_id: str | int, user_message: str, db_session: Session) -> str:
    """
    Run the orchestrator agent and return the final text response.
    Session is keyed per Telegram chat.
    """
    _ = db_session
    # The agents SDK memory backend requires an AsyncEngine.
    # Keep this decoupled from the app's request/session engine.
    session = SQLAlchemySession(str(chat_id), engine=MEMORY_ENGINE, create_tables=False)
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
