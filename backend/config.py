from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openai_api_key: str
    telegram_bot_token: str
    telegram_chat_id: int
    webhook_base_url: str = ""
    google_credentials_path: str = "credentials/google_oauth.json"
    google_token_path: str = "credentials/google_token.json"
    weather_location: str
    database_url: str
    briefing_hour: int = 8
    briefing_minute: int = 0
    timezone: str = "America/New_York"
    vector_store_id: str
    supabase_url: str
    supabase_key: str


settings = Settings()
