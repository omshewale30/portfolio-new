from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str = ""
    openai_vector_store_id: str = ""
    openai_chat_model: str = "gpt-4o"
    cors_allowed_origins: str = ""


settings = Settings()