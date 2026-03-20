from agents import Runner, RunConfig, SessionSettings
from agents.extensions.memory import SQLAlchemySession
import re
from db.connection import engine
from jarvis_agents.orchestrator import orchestrator


def _clean_telegram_output(text: str) -> str:
    """Strip citation artifacts/markdown noise before sending to Telegram."""
    text = re.sub(r"cite[^]+", "", text)
    text = text.replace("**", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


async def run_agent(chat_id: str | int, user_message: str) -> str:
    """
    Run the orchestrator agent and return the final text response.
    Session is keyed per Telegram chat.
    """
    session = SQLAlchemySession(str(chat_id), engine=engine, create_tables=True)

    result = await Runner.run(
        orchestrator,
        user_message,
        session=session,
        run_config=RunConfig(session_settings=SessionSettings(limit=40))
    )
    return _clean_telegram_output(result.final_output)
