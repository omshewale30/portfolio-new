from pydantic_settings import BaseSettings

import os
from dotenv import load_dotenv
load_dotenv()

class Settings(BaseSettings):
    openai_api_key: str = os.getenv("OPENAI_API_KEY")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN")
    telegram_chat_id: int = os.getenv("TELEGRAM_CHAT_ID")
    webhook_base_url: str = os.getenv("WEBHOOK_BASE_URL")
    google_credentials_path: str = "credentials/google_oauth.json"
    google_token_path: str = "credentials/google_token.json"
    weather_location: str = os.getenv("WEATHER_LOCATION")
    database_url: str = os.getenv("DATABASE_URL")
    briefing_hour: int = int(os.getenv("BRIEFING_HOUR"))
    briefing_minute: int = int(os.getenv("BRIEFING_MINUTE"))
    timezone: str = os.getenv("TIMEZONE")
    vector_store_id: str = os.getenv("VECTOR_STORE_ID")
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_key: str = os.getenv("SUPABASE_KEY")

settings = Settings()