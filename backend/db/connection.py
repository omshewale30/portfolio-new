from sqlalchemy.ext.asyncio import create_async_engine

from config import settings

DATABASE_URL = (
    settings.database_url
    .replace("postgresql://", "postgresql+asyncpg://")
    .replace("sslmode=require", "ssl=require")
)

engine = create_async_engine(DATABASE_URL)

print("Connection successful!")