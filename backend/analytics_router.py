import re

from fastapi import APIRouter, HTTPException, Request, Response

from logging_config import get_logger
from rate_limiter import SlidingWindowRateLimiter
from request_utils import client_identifier
from schemas import PageViewRequest, ViewCountResponse, error_detail
from settings import settings
from supabase_client import get_supabase_client

logger = get_logger(__name__)

router = APIRouter(tags=["analytics"])

SLUG_PATTERN = re.compile(r"^[a-z0-9-]{1,80}$")

pageview_rate_limiter = SlidingWindowRateLimiter(
    limit=settings.pageview_rate_limit_requests,
    window_seconds=settings.pageview_rate_limit_window_seconds,
)


def _validate_slug(slug: str) -> None:
    if not SLUG_PATTERN.match(slug):
        raise HTTPException(
            status_code=422,
            detail=error_detail("invalid_slug", "Note slug is invalid."),
        )


@router.post("/events/pageview", status_code=204)
async def track_pageview(
    payload: PageViewRequest, http_request: Request, response: Response
) -> Response:
    result = pageview_rate_limiter.check(client_identifier(http_request))
    response.headers.update(result.headers(pageview_rate_limiter.window_seconds))
    if not result.allowed:
        raise HTTPException(
            status_code=429,
            detail=error_detail("rate_limit_exceeded", "Too many requests. Please slow down."),
            headers={
                **result.headers(pageview_rate_limiter.window_seconds),
                "Retry-After": str(result.reset_after_seconds),
            },
        )

    if payload.note_slug is not None:
        _validate_slug(payload.note_slug)

    client = get_supabase_client()
    client.table("page_views").insert(
        {"path": payload.path, "note_slug": payload.note_slug}
    ).execute()

    logger.info("pageview_tracked path=%s note_slug=%s", payload.path, payload.note_slug)
    return Response(status_code=204)


@router.get("/notes/{slug}/views", response_model=ViewCountResponse)
async def get_note_view_count(slug: str) -> ViewCountResponse:
    _validate_slug(slug)
    client = get_supabase_client()

    result = (
        client.table("page_views")
        .select("id", count="exact")
        .eq("note_slug", slug)
        .execute()
    )
    view_count = result.count if result.count is not None else len(result.data or [])
    return ViewCountResponse(view_count=view_count)
