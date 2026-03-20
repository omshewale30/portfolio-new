from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
load_dotenv()


class Settings(BaseSettings):
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    telegram_chat_id: int = int(os.getenv("TELEGRAM_CHAT_ID", "0"))
    webhook_base_url: str = os.getenv("WEBHOOK_BASE_URL", "")
    google_credentials_path: str = "credentials/google_oauth.json"
    google_token_path: str = "credentials/google_token.json"
    # If unset, writable path is auto-picked (e.g. /tmp on Render when token is under /etc/secrets).
    google_token_write_path: str = os.getenv("GOOGLE_TOKEN_WRITE_PATH", "")
    weather_location: str = os.getenv("WEATHER_LOCATION", "Chapel Hill,US")
    database_url: str = os.getenv("DATABASE_URL", "")
    briefing_hour: int = int(os.getenv("BRIEFING_HOUR", "7"))
    briefing_minute: int = int(os.getenv("BRIEFING_MINUTE", "0"))
    timezone: str = os.getenv("TIMEZONE", "America/New_York")
    vector_store_id: str = os.getenv("VECTOR_STORE_ID", "")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_KEY", "")


settings = Settings()
