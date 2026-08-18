import re

from fastapi import APIRouter, HTTPException, Request, Response

from logging_config import get_logger
from rate_limiter import SlidingWindowRateLimiter
from request_utils import client_identifier
from schemas import (
    CommentListResponse,
    CommentOut,
    CommentRequest,
    ReactionRequest,
    ReactionSummary,
    error_detail,
)
from settings import settings
from supabase_client import get_supabase_client

logger = get_logger(__name__)

router = APIRouter(prefix="/notes", tags=["notes"])

SLUG_PATTERN = re.compile(r"^[a-z0-9-]{1,80}$")
SPAM_URL_THRESHOLD = 2
SPAM_REPEAT_CHAR_PATTERN = re.compile(r"(.)\1{9,}")
SPAM_DENYLIST = (
    "viagra",
    "casino",
    "crypto giveaway",
    "click here",
    "free followers",
)

comment_rate_limiter = SlidingWindowRateLimiter(
    limit=settings.comment_rate_limit_requests,
    window_seconds=settings.comment_rate_limit_window_seconds,
)
comment_ip_rate_limiter = SlidingWindowRateLimiter(
    limit=settings.comment_ip_rate_limit_requests,
    window_seconds=settings.comment_ip_rate_limit_window_seconds,
)
reaction_rate_limiter = SlidingWindowRateLimiter(
    limit=settings.reaction_rate_limit_requests,
    window_seconds=settings.reaction_rate_limit_window_seconds,
)


def _validate_slug(slug: str) -> None:
    if not SLUG_PATTERN.match(slug):
        raise HTTPException(
            status_code=422,
            detail=error_detail("invalid_slug", "Note slug is invalid."),
        )


def _looks_like_spam(body: str) -> bool:
    lowered = body.lower()
    if any(term in lowered for term in SPAM_DENYLIST):
        return True
    if lowered.count("http://") + lowered.count("https://") > SPAM_URL_THRESHOLD:
        return True
    if SPAM_REPEAT_CHAR_PATTERN.search(body):
        return True
    return False


def _rate_limit_or_raise(limiter: SlidingWindowRateLimiter, key: str, response: Response) -> None:
    result = limiter.check(key)
    response.headers.update(result.headers(limiter.window_seconds))
    if not result.allowed:
        raise HTTPException(
            status_code=429,
            detail=error_detail("rate_limit_exceeded", "Too many requests. Please slow down."),
            headers={
                **result.headers(limiter.window_seconds),
                "Retry-After": str(result.reset_after_seconds),
            },
        )


@router.get("/{slug}/reactions", response_model=ReactionSummary)
async def get_reactions(slug: str, anon_id: str | None = None) -> ReactionSummary:
    _validate_slug(slug)
    client = get_supabase_client()

    result = (
        client.table("note_reactions")
        .select("anon_id,reaction")
        .eq("note_slug", slug)
        .execute()
    )
    rows = result.data or []

    like_count = sum(1 for row in rows if row["reaction"] == "like")
    dislike_count = sum(1 for row in rows if row["reaction"] == "dislike")
    your_reaction = None
    if anon_id:
        your_reaction = next(
            (row["reaction"] for row in rows if row["anon_id"] == anon_id), None
        )

    return ReactionSummary(
        like_count=like_count,
        dislike_count=dislike_count,
        your_reaction=your_reaction,
    )


@router.post("/{slug}/reactions", response_model=ReactionSummary)
async def submit_reaction(
    slug: str, payload: ReactionRequest, response: Response
) -> ReactionSummary:
    _validate_slug(slug)
    _rate_limit_or_raise(reaction_rate_limiter, payload.anon_id, response)
    client = get_supabase_client()

    existing = (
        client.table("note_reactions")
        .select("id,reaction")
        .eq("note_slug", slug)
        .eq("anon_id", payload.anon_id)
        .execute()
    )
    existing_row = (existing.data or [None])[0]

    if existing_row and existing_row["reaction"] == payload.reaction:
        client.table("note_reactions").delete().eq("id", existing_row["id"]).execute()
    elif existing_row:
        client.table("note_reactions").update({"reaction": payload.reaction}).eq(
            "id", existing_row["id"]
        ).execute()
    else:
        client.table("note_reactions").insert(
            {"note_slug": slug, "anon_id": payload.anon_id, "reaction": payload.reaction}
        ).execute()

    logger.info("reaction_submitted note_slug=%s reaction=%s", slug, payload.reaction)
    return await get_reactions(slug, payload.anon_id)


@router.get("/{slug}/comments", response_model=CommentListResponse)
async def get_comments(slug: str) -> CommentListResponse:
    _validate_slug(slug)
    client = get_supabase_client()

    result = (
        client.table("note_comments")
        .select("id,author_name,body,created_at")
        .eq("note_slug", slug)
        .eq("status", "visible")
        .order("created_at", desc=True)
        .execute()
    )
    comments = [CommentOut(**row) for row in (result.data or [])]
    return CommentListResponse(comments=comments)


@router.post("/{slug}/comments", response_model=CommentOut, status_code=201)
async def submit_comment(
    slug: str, payload: CommentRequest, http_request: Request, response: Response
) -> CommentOut:
    _validate_slug(slug)
    _rate_limit_or_raise(comment_rate_limiter, payload.anon_id, response)
    _rate_limit_or_raise(comment_ip_rate_limiter, client_identifier(http_request), response)

    if len(payload.body) > settings.comment_max_length:
        raise HTTPException(
            status_code=422,
            detail=error_detail("invalid_request", "Comment is too long."),
        )

    status = "hidden" if _looks_like_spam(payload.body) else "visible"
    client = get_supabase_client()

    result = (
        client.table("note_comments")
        .insert(
            {
                "note_slug": slug,
                "anon_id": payload.anon_id,
                "author_name": payload.author_name,
                "body": payload.body,
                "status": status,
            }
        )
        .execute()
    )
    row = result.data[0]

    logger.info("comment_submitted note_slug=%s status=%s", slug, status)
    return CommentOut(
        id=row["id"],
        author_name=row["author_name"],
        body=row["body"],
        created_at=row["created_at"],
    )
