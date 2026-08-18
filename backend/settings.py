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
    chat_rate_limit_requests: int = 10
    chat_rate_limit_window_seconds: int = 60

    supabase_url: str = ""
    supabase_key: str = ""
    comment_max_length: int = 1000
    comment_rate_limit_requests: int = 5
    comment_rate_limit_window_seconds: int = 300
    comment_ip_rate_limit_requests: int = 10
    comment_ip_rate_limit_window_seconds: int = 300
    reaction_rate_limit_requests: int = 20
    reaction_rate_limit_window_seconds: int = 60

    pageview_rate_limit_requests: int = 60
    pageview_rate_limit_window_seconds: int = 60


settings = Settings()
