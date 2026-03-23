"""
Local development runner.
Uses python-telegram-bot's polling instead of webhooks.
Run with: python dev.py

Do not wrap Application.run_polling() in asyncio.run() — PTB runs its own
event loop internally; nesting causes "event loop is already running".
"""
from telegram import Update
from telegram.ext import Application, MessageHandler, filters, ContextTypes
from jarvis_agents.runner import run_agent
from scheduler import start_scheduler
from settings.config import settings
from db.connection import db_session_scope
from settings.logging import configure_logging

configure_logging()


async def post_init(application: Application) -> None:
    """AsyncIOScheduler needs a running event loop — start after PTB initializes."""
    start_scheduler()


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text
    print(f"[{settings.telegram_chat_id}] You: {user_message}")

    try:
        with db_session_scope() as db_session:
            response = await run_agent(update.effective_chat.id, user_message, db_session=db_session)
        await update.message.reply_text(response)
        print(f"[{settings.telegram_chat_id}] Jarvis: {response}")
    except Exception as e:
        await update.message.reply_text("⚠️ Something went wrong.")
        print(f"Error: {e}")

def main():
    app = (
        Application.builder()
        .token(settings.telegram_bot_token)
        .post_init(post_init)
        .build()
    )
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("Jarvis is running (long-polling). Send a message on Telegram.")
    app.run_polling()


if __name__ == "__main__":
    main()