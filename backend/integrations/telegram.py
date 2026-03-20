import httpx
from config import settings

TELEGRAM_BASE = f"https://api.telegram.org/bot{settings.telegram_bot_token}"

async def send_message(chat_id: int, text: str) -> None:
    """Send a text message to a Telegram chat."""
    # Telegram messages max out at 4096 chars — split if needed
    chunks = [text[i:i+4000] for i in range(0, len(text), 4000)]
    async with httpx.AsyncClient() as client:
        for chunk in chunks:
            await client.post(
                f"{TELEGRAM_BASE}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": chunk,
                    "parse_mode": "Markdown"  # Allows *bold* and `code` formatting
                }
            )

async def set_webhook(url: str) -> dict:
    """Register the webhook URL with Telegram."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{TELEGRAM_BASE}/setWebhook",
            json={"url": url, "allowed_updates": ["message"]}
        )
        return resp.json()

async def delete_webhook() -> dict:
    """Remove the registered webhook (used when switching to polling in dev)."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{TELEGRAM_BASE}/deleteWebhook")
        return resp.json()

def parse_inbound(update: dict) -> tuple[int, str] | None:
    """
    Extract chat_id and message text from a Telegram update payload.
    Returns None if the update doesn't contain a text message.
    """
    message = update.get("message", {})
    text = message.get("text")
    chat_id = message.get("chat", {}).get("id")
    if not text or not chat_id:
        return None
    return chat_id, text