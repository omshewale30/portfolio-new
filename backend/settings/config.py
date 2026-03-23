from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
load_dotenv()


class Settings(BaseSettings):
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    telegram_chat_id: int = int(os.getenv("TELEGRAM_CHAT_ID", "0"))
    webhook_base_url: str = os.getenv("WEBHOOK_BASE_URL", "")
    google_sa_json: str = os.getenv("GOOGLE_SA_JSON", "")
    database_url: str = os.getenv("DATABASE_URL", "")
    briefing_hour: int = int(os.getenv("BRIEFING_HOUR", "7"))
    briefing_minute: int = int(os.getenv("BRIEFING_MINUTE", "0"))
    timezone: str = os.getenv("TIMEZONE", "America/New_York")
    vector_store_id: str = os.getenv("VECTOR_STORE_ID", "")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")
    notion_api_key: str = os.getenv("NOTION_API_KEY", "")
    notion_data_source_id: str = os.getenv("NOTION_DATA_SOURCE_ID", "")
    gmail_client_id: str = os.getenv("GMAIL_CLIENT_ID", "")
    gmail_client_secret: str = os.getenv("GMAIL_CLIENT_SECRET", "")
    gmail_refresh_token: str = os.getenv("GMAIL_REFRESH_TOKEN", "")


settings = Settings()
