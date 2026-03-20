from sqlalchemy.ext.asyncio import create_engine
from sqlalchemy.pool import NullPool

from config import settings

DATABASE_URL = settings.database_url

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)