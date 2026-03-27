import re
import time
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from psycopg import AsyncConnection
from psycopg.rows import dict_row
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.errors import GraphRecursionError
from jarvis_agents.orchestrator import build_orchestrator_graph
from settings.config import settings
from settings.logging import get_logger

logger = get_logger(__name__)

_graph = None
_checkpointer_cm = None


def _extract_message_text(message) -> str:
    content = getattr(message, "content", "")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict):
                text = item.get("text")
                if text:
                    parts.append(str(text))
            else:
                parts.append(str(item))
        return " ".join(parts)
    return str(content or "")


def _clean_telegram_output(text: str) -> str:
    """Strip citation artifacts/markdown noise before sending to Telegram."""
    text = re.sub(r"【[^】]+】", "", text)  # Remove 【citation】 markers
    text = text.replace("**", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _to_sync_postgres_url(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql://", 1)
    return url


def _normalize_postgres_url_for_psycopg(url: str) -> str:
    """libpq/psycopg reject most `ssl=` URI params; use standard `sslmode` instead."""
    parsed = urlparse(url)
    if not parsed.query:
        return url
    pairs = parse_qsl(parsed.query, keep_blank_values=True)
    params = {k.lower(): v for k, v in pairs}
    if "ssl" not in params:
        return url
    ssl_val = (params.pop("ssl") or "").lower()
    if "sslmode" not in params:
        sslmode_map = {
            "true": "require",
            "1": "require",
            "false": "disable",
            "0": "disable",
            "require": "require",
            "disable": "disable",
            "allow": "allow",
            "prefer": "prefer",
            "verify-ca": "verify-ca",
            "verify-full": "verify-full",
        }
        params["sslmode"] = sslmode_map.get(ssl_val, "require")
    new_query = urlencode(sorted(params.items()))
    return urlunparse(parsed._replace(query=new_query))


@asynccontextmanager
async def _checkpointer_from_conn_string(db_url: str) -> AsyncIterator[AsyncPostgresSaver]:
    """Create a checkpointer with prepared statements disabled for PgBouncer compatibility."""
    async with await AsyncConnection.connect(
        db_url,
        autocommit=True,
        prepare_threshold=None,
        row_factory=dict_row,
    ) as conn:
        yield AsyncPostgresSaver(conn=conn)


async def init_agent_runtime() -> None:
    global _graph, _checkpointer_cm
    if _graph is not None:
        return

    db_url = _normalize_postgres_url_for_psycopg(_to_sync_postgres_url(settings.database_url))
    _checkpointer_cm = _checkpointer_from_conn_string(db_url)
    checkpointer = await _checkpointer_cm.__aenter__()
    await checkpointer.setup()
    _graph = build_orchestrator_graph(checkpointer)
    logger.info("LangGraph runtime initialized for Telegram route")


async def shutdown_agent_runtime() -> None:
    global _checkpointer_cm, _graph
    if _checkpointer_cm is None:
        return
    await _checkpointer_cm.__aexit__(None, None, None)
    _checkpointer_cm = None
    _graph = None
    logger.info("LangGraph runtime shut down")


async def run_agent(chat_id: str | int, user_message: str, db_session: AsyncSession | None = None) -> str:
    del db_session  # kept for backwards-compatible call sites
    if _graph is None:
        await init_agent_runtime()

    config = {
        "configurable": {"thread_id": str(chat_id)},
        "recursion_limit": 100,
    }
    initial_state = {
        "messages": [HumanMessage(content=user_message)],
        "chat_id": str(chat_id),
        "active_agent": "orchestrator",
    }
    try:
        result = await _graph.ainvoke(initial_state, config=config)
        final_text = _clean_telegram_output(_extract_message_text(result["messages"][-1]))
        return final_text or "I couldn't generate a response. Please try again."
    except GraphRecursionError:
        logger.warning("Graph recursion limit reached for chat_id=%s; retrying with fresh thread", chat_id)
        retry_config = {
            **config,
            "configurable": {"thread_id": f"{chat_id}_retry_{int(time.time())}"},
        }
        result = await _graph.ainvoke(initial_state, config=retry_config)
        final_text = _clean_telegram_output(_extract_message_text(result["messages"][-1]))
        return final_text or "I couldn't generate a response. Please try again."
    except Exception as e:
        error_text = str(e)
        invalid_tool_history = (
            "must be followed by tool messages" in error_text
            or "do not have a corresponding ToolMessage" in error_text
        )
        if not invalid_tool_history:
            raise
        logger.warning(
            "Invalid tool-call history for chat_id=%s; retrying with a fresh thread: %s",
            chat_id,
            error_text,
        )
        retry_config = {
            **config,
            "configurable": {"thread_id": f"{chat_id}_recovered_{int(time.time())}"},
        }
        result = await _graph.ainvoke(initial_state, config=retry_config)
        final_text = _clean_telegram_output(_extract_message_text(result["messages"][-1]))
        return final_text or "I couldn't generate a response. Please try again."
