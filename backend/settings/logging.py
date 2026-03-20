"""Central logging setup for the backend."""

from __future__ import annotations

import logging
import os
import sys

_DEFAULT_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
_DEFAULT_DATEFMT = "%Y-%m-%d %H:%M:%S"


def _resolve_level(level: str | int | None) -> int:
    if isinstance(level, int):
        return level
    name = (level or os.getenv("LOG_LEVEL", "INFO")).upper()
    resolved = logging.getLevelName(name)
    if isinstance(resolved, int):
        return resolved
    return logging.INFO


def configure_logging(
    level: str | int | None = None,
    *,
    fmt: str = _DEFAULT_FORMAT,
    datefmt: str = _DEFAULT_DATEFMT,
) -> None:
    """
    Configure the root logger (stdout). Safe to call more than once.

    Level: pass explicitly, or set env ``LOG_LEVEL`` (default ``INFO``).
    """
    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(_resolve_level(level))

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt=fmt, datefmt=datefmt))
    root.addHandler(handler)

    # Typical noise from HTTP clients / ASGI
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("apscheduler").setLevel(logging.INFO)
