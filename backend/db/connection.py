from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from config import settings

DATABASE_URL = settings.database_url

engine = create_async_engine(DATABASE_URL, poolclass=NullPool)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


@asynccontextmanager
async def get_async_session() -> AsyncIterator[AsyncSession]:
    """
    Yield a request-scoped AsyncSession.
    Each webhook/task should open its own session to avoid cross-request reuse.
    """
    async with AsyncSessionLocal() as session:
        yield session