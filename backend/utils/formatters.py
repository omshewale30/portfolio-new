import re
from settings.logging import get_logger
from langchain_core.messages import AIMessage, HumanMessage, RemoveMessage, ToolMessage
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
logger = get_logger(__name__)

_graph = None

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


async def _remove_dangling_tool_calls(config: dict) -> bool:
    """Strip AIMessages whose tool_calls have no matching ToolMessage from the thread.

    Returns True if anything was removed (caller should retry with the same thread).
    """
    try:
        state = await _graph.aget_state(config)
    except Exception:
        return False

    messages = list(state.values.get("messages", []))
    if not messages:
        return False

    responded_ids: set[str] = {
        msg.tool_call_id
        for msg in messages
        if isinstance(msg, ToolMessage) and getattr(msg, "tool_call_id", None)
    }

    to_remove = [
        RemoveMessage(id=msg.id)
        for msg in messages
        if isinstance(msg, AIMessage)
        and getattr(msg, "tool_calls", None)
        and any(tc["id"] not in responded_ids for tc in msg.tool_calls)
    ]

    if not to_remove:
        return False

    await _graph.aupdate_state(config, {"messages": to_remove})
    logger.info("Removed %d dangling tool-call message(s) for thread %s", len(to_remove), config["configurable"]["thread_id"])
    return True

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