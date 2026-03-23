
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

from settings.config import settings

def _to_sync_db_url(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql://", 1)
    return url


DATABASE_URL = _to_sync_db_url(settings.database_url)

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



def get_db():
    """
    Dependency that provides a database session per request.
    Automatically rolls back on exceptions, then closes.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()  # Rollback uncommitted changes on any error
        raise
    finally:
        db.close()


@contextmanager
def db_session_scope():
    """Context manager wrapper for non-FastAPI call sites."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()