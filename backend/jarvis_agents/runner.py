from agents import Runner, RunConfig, SessionSettings
from agents.extensions.memory import SQLAlchemySession
import re
from sqlalchemy.ext.asyncio import AsyncSession, AsyncEngine
from jarvis_agents.orchestrator import get_orchestrator


def _clean_telegram_output(text: str) -> str:
    """Strip citation artifacts/markdown noise before sending to Telegram."""
    text = re.sub(r"cite[^]+", "", text)
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
        raise RuntimeError("AsyncSession is not bound to an AsyncEngine")

    session = SQLAlchemySession(str(chat_id), engine=memory_engine, create_tables=False)

    local_orchestrator = get_orchestrator()

    result = await Runner.run(
        local_orchestrator,
        user_message,
        session=session,
        run_config=RunConfig(session_settings=SessionSettings(limit=40))
    )
    return _clean_telegram_output(result.final_output)
