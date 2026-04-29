
import time
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.messages import HumanMessage
from langgraph.errors import GraphRecursionError
from jarvis_agents.orchestrator import build_orchestrator_graph
from settings.config import settings
from settings.logging import get_logger
from utils.formatters import _extract_message_text, _clean_telegram_output, _remove_dangling_tool_calls
from utils.db_utils import _checkpointer_from_conn_string, _is_closed_connection_error
logger = get_logger(__name__)

_graph = None
_checkpointer_cm = None





async def _invoke_with_closed_connection_retry(
    initial_state: dict,
    config: dict,
    *,
    retry_label: str,
) -> dict:
    """Invoke graph and rebuild runtime once if checkpoint connection is stale."""
    global _graph
    try:
        return await _graph.ainvoke(initial_state, config=config)
    except Exception as exc:
        if not _is_closed_connection_error(exc):
            raise
        logger.warning("Detected closed Postgres connection; rebuilding LangGraph runtime")
        await shutdown_agent_runtime()
        await init_agent_runtime()
        retry_config = {
            **config,
            "configurable": {"thread_id": f"{config['configurable']['thread_id']}_{retry_label}_{int(time.time())}"},
        }
        return await _graph.ainvoke(initial_state, config=retry_config)


async def init_agent_runtime() -> None:
    global _graph, _checkpointer_cm
    if _graph is not None:
        return

    db_url = settings.database_url
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
        "recursion_limit": 100
    }
    initial_state = {
        "messages": [HumanMessage(content=user_message)],
        "chat_id": str(chat_id),
    }
    try:
        result = await _invoke_with_closed_connection_retry(initial_state, config, retry_label="reconnect")
        final_text = _clean_telegram_output(_extract_message_text(result["messages"][-1]))
        return final_text or "I couldn't generate a response. Please try again."
    except GraphRecursionError:
        logger.warning("Graph recursion limit reached for chat_id=%s; retrying with fresh thread", chat_id)
        retry_config = {
            **config,
            "configurable": {"thread_id": f"{chat_id}_retry_{int(time.time())}"},
        }
        result = await _invoke_with_closed_connection_retry(initial_state, retry_config, retry_label="reconnect")
        final_text = _clean_telegram_output(_extract_message_text(result["messages"][-1]))
        return final_text or "I couldn't generate a response. Please try again."
    except Exception as e:
        error_text = str(e)
        if _is_closed_connection_error(e):
            logger.warning("Closed Postgres connection surfaced in recovery path; retrying once")
            result = await _invoke_with_closed_connection_retry(initial_state, config, retry_label="reconnect")
            final_text = _clean_telegram_output(_extract_message_text(result["messages"][-1]))
            return final_text or "I couldn't generate a response. Please try again."
        invalid_tool_history = (
            "must be followed by tool messages" in error_text
            or "do not have a corresponding ToolMessage" in error_text
        )
        if not invalid_tool_history:
            raise
        logger.warning(
            "Invalid tool-call history for chat_id=%s; attempting in-place repair: %s",
            chat_id,
            error_text,
        )
        fixed = await _remove_dangling_tool_calls(config)
        retry_config = config if fixed else {
            **config,
            "configurable": {"thread_id": f"{chat_id}_recovered_{int(time.time())}"},
        }
        if not fixed:
            logger.warning("Could not repair thread for chat_id=%s; falling back to fresh thread", chat_id)
        result = await _invoke_with_closed_connection_retry(initial_state, retry_config, retry_label="reconnect")
        final_text = _clean_telegram_output(_extract_message_text(result["messages"][-1]))
        return final_text or "I couldn't generate a response. Please try again."
