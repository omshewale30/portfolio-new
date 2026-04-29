from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from psycopg import AsyncConnection
from psycopg import OperationalError as PsycopgOperationalError
from psycopg.rows import dict_row
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver


@asynccontextmanager
async def _checkpointer_from_conn_string(db_url: str) -> AsyncIterator[AsyncPostgresSaver]:
    """Create a checkpointer with prepared statements disabled for PgBouncer compatibility."""
    async with await AsyncConnection.connect(
        db_url,
        autocommit=True,
        prepare_threshold=None,
        row_factory=dict_row,
    ) as conn:
        yield AsyncPostgresSaver(conn=conn)


def _is_closed_connection_error(exc: Exception) -> bool:
    """Detect transient psycopg connection-closed failures."""
    return isinstance(exc, PsycopgOperationalError) and "connection is closed" in str(exc).lower()

