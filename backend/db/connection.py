from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from config import settings

engine = create_async_engine(
    settings.database_url,
    poolclass=NullPool,
)