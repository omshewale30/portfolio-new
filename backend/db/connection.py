from tkinter import N
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from config import settings

DATABASE_URL = settings.database_url

engine = create_async_engine(DATABASE_URL, poolclass=NullPool)