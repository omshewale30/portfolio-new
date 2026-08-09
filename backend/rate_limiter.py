from collections import deque
from dataclasses import dataclass
from math import ceil
from threading import Lock
from time import monotonic


@dataclass(frozen=True)
class RateLimitResult:
    allowed: bool
    limit: int
    remaining: int
    reset_after_seconds: int

    def headers(self, window_seconds: int) -> dict[str, str]:
        return {
            "RateLimit-Limit": str(self.limit),
            "RateLimit-Remaining": str(self.remaining),
            "RateLimit-Reset": str(self.reset_after_seconds),
            "RateLimit-Policy": f"{self.limit};w={window_seconds}",
        }


class SlidingWindowRateLimiter:
    """In-process sliding-window limiter for a small public API."""

    def __init__(self, limit: int, window_seconds: int):
        if limit <= 0 or window_seconds <= 0:
            raise ValueError("Rate-limit values must be positive integers.")

        self.limit = limit
        self.window_seconds = window_seconds
        self._requests: dict[str, deque[float]] = {}
        self._lock = Lock()
        self._last_cleanup = 0.0

    def check(self, key: str, now: float | None = None) -> RateLimitResult:
        timestamp = monotonic() if now is None else now
        cutoff = timestamp - self.window_seconds

        with self._lock:
            if timestamp - self._last_cleanup >= self.window_seconds:
                self._remove_expired_keys(cutoff)
                self._last_cleanup = timestamp

            requests = self._requests.setdefault(key, deque())
            while requests and requests[0] <= cutoff:
                requests.popleft()

            if len(requests) >= self.limit:
                return RateLimitResult(
                    allowed=False,
                    limit=self.limit,
                    remaining=0,
                    reset_after_seconds=max(
                        1,
                        ceil(requests[0] + self.window_seconds - timestamp),
                    ),
                )

            requests.append(timestamp)
            return RateLimitResult(
                allowed=True,
                limit=self.limit,
                remaining=self.limit - len(requests),
                reset_after_seconds=max(
                    1,
                    ceil(requests[0] + self.window_seconds - timestamp),
                ),
            )

    def clear(self) -> None:
        """Clear all counters. Intended for tests and process lifecycle resets."""
        with self._lock:
            self._requests.clear()
            self._last_cleanup = 0.0

    def _remove_expired_keys(self, cutoff: float) -> None:
        expired_keys = []
        for key, requests in self._requests.items():
            while requests and requests[0] <= cutoff:
                requests.popleft()
            if not requests:
                expired_keys.append(key)

        for key in expired_keys:
            del self._requests[key]
