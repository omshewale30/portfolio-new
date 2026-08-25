from time import perf_counter
from typing import Any

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import APIError, AsyncOpenAI, BadRequestError, NotFoundError
from open_ai_client import OpenAIClient
from settings import settings
from prompts import PUBLIC_JARVIS_INSTRUCTIONS
from logging_config import configure_logging, get_logger
from analytics_router import router as analytics_router
from notes_router import router as notes_router
from pricing import calculate_cost_usd
from rate_limiter import SlidingWindowRateLimiter
from request_utils import client_identifier
from schemas import ChatRequest, ChatResponse, error_detail
from schemas.chat import ChatUsage, SourceRef

configure_logging()
logger = get_logger(__name__)

DEFAULT_ALLOWED_ORIGINS = (
    "https://omshewale.me",
    "http://localhost:5173",
    "https://jarvis-interface.vercel.app",
)

FILE_SEARCH_MAX_RESULTS = 4

chat_rate_limiter = SlidingWindowRateLimiter(
    limit=settings.chat_rate_limit_requests,
    window_seconds=settings.chat_rate_limit_window_seconds,
)


def _field(value: Any, name: str, default: Any = None) -> Any:
    if isinstance(value, dict):
        return value.get(name, default)
    return getattr(value, name, default)


def _extract_sources(output: Any) -> list[SourceRef]:
    sources: list[SourceRef] = []
    seen_file_ids: set[str] = set()

    for item in output or []:
        for content in _field(item, "content", []) or []:
            for annotation in _field(content, "annotations", []) or []:
                if _field(annotation, "type") != "file_citation":
                    continue

                file_id = _field(annotation, "file_id")
                filename = _field(annotation, "filename")
                if not file_id or not filename or file_id in seen_file_ids:
                    continue

                quote = _field(annotation, "quote")
                sources.append(
                    SourceRef(
                        id=file_id,
                        filename=filename,
                        quote=quote if isinstance(quote, str) and quote.strip() else None,
                    )
                )
                seen_file_ids.add(file_id)

    return sources


def _extract_usage(response_usage: Any) -> ChatUsage | None:
    if response_usage is None:
        return None

    input_tokens = _field(response_usage, "input_tokens")
    output_tokens = _field(response_usage, "output_tokens")
    total_tokens = _field(response_usage, "total_tokens")
    if input_tokens is None or output_tokens is None or total_tokens is None:
        return None

    return ChatUsage(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
    )


def _allowed_origins() -> list[str]:
    configured = settings.cors_allowed_origins
    if not configured.strip():
        return list(DEFAULT_ALLOWED_ORIGINS)
    return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]


app = FastAPI(
    title="Portfolio Jarvis API",
    description="Public, read-only Jarvis chat API for Om Shewale's portfolio",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    expose_headers=[
        "RateLimit-Limit",
        "RateLimit-Remaining",
        "RateLimit-Reset",
        "RateLimit-Policy",
        "Retry-After",
    ],
)

app.include_router(notes_router)
app.include_router(analytics_router)

_openai_client: OpenAIClient | None = None


def _client() -> AsyncOpenAI:
    global _openai_client
    api_key = settings.openai_api_key
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail=error_detail("configuration_error", "Jarvis is not configured."),
        )
    if _openai_client is None:
        _openai_client = OpenAIClient(api_key)
    return _openai_client.client


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_, exc: RequestValidationError):
    fields = sorted({str(error["loc"][-1]) for error in exc.errors() if error.get("loc")})
    return JSONResponse(
        status_code=422,
        content={
            "detail": {
                "code": "invalid_request",
                "message": "The chat request is invalid.",
                "fields": fields,
            }
        },
    )




@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, http_request: Request, response: Response):
    rate_limit = chat_rate_limiter.check(client_identifier(http_request))
    rate_limit_headers = rate_limit.headers(chat_rate_limiter.window_seconds)
    if not rate_limit.allowed:
        logger.info("chat_rejected reason=rate_limited")
        raise HTTPException(
            status_code=429,
            detail=error_detail(
                "rate_limit_exceeded",
                "Too many requests. Please wait before asking Jarvis again.",
            ),
            headers={
                **rate_limit_headers,
                "Retry-After": str(rate_limit.reset_after_seconds),
            },
        )
    response.headers.update(rate_limit_headers)

    _, vector_store_id, model, instructions = (
        settings.openai_api_key,
        settings.openai_vector_store_id,
        settings.openai_chat_model,
        PUBLIC_JARVIS_INSTRUCTIONS,
    )
    if not vector_store_id:
        raise HTTPException(
            status_code=503,
            detail=error_detail("configuration_error", "Jarvis is not configured."),
        )

    call: dict[str, Any] = {
        "model": model,
        "instructions": instructions,
        "input": [{"role": "user", "content": request.user_input}],
        "tools": [
            {
                "type": "file_search",
                "vector_store_ids": [vector_store_id],
                "max_num_results": FILE_SEARCH_MAX_RESULTS,
            }
        ],
        "max_output_tokens": MAX_OUTPUT_TOKENS,
        "store": True,
    }
    if request.previous_response_id:
        call["previous_response_id"] = request.previous_response_id

    try:
        client = _client()
        started_at = perf_counter()
        response = await client.responses.create(**call)
    except (BadRequestError, NotFoundError) as exc:
        is_stale_conversation = request.previous_response_id and (
            isinstance(exc, NotFoundError) or "previous_response_id" in str(exc).lower()
        )
        if is_stale_conversation:
            logger.info("chat_rejected reason=conversation_expired")
            raise HTTPException(
                status_code=409,
                detail=error_detail(
                    "conversation_expired",
                    "This conversation has expired. Start a new conversation and try again.",
                ),
            ) from exc
        logger.warning("chat_failed provider_error=%s", type(exc).__name__)
        raise HTTPException(
            status_code=502,
            detail=error_detail("provider_error", "Jarvis is temporarily unavailable."),
        ) from exc
    except APIError as exc:
        logger.warning("chat_failed provider_error=%s", type(exc).__name__)
        raise HTTPException(
            status_code=502,
            detail=error_detail("provider_error", "Jarvis is temporarily unavailable."),
        ) from exc
    except Exception as exc:
        logger.exception("chat_failed provider_error=unexpected")
        raise HTTPException(
            status_code=502,
            detail=error_detail("provider_error", "Jarvis is temporarily unavailable."),
        ) from exc
    latency_ms = round((perf_counter() - started_at) * 1000)

    response_status = _field(response, "status")
    incomplete_reason = _field(_field(response, "incomplete_details"), "reason")
    if response_status == "incomplete":
        logger.warning(
            "chat_failed provider_error=incomplete_response reason=%s latency_ms=%s",
            incomplete_reason or "unknown",
            latency_ms,
        )
        raise HTTPException(
            status_code=502,
            detail=error_detail(
                "incomplete_response",
                "Jarvis could not finish that response. Please try again.",
            ),
        )

    output_text = (_field(response, "output_text", "") or "").strip()
    response_id = _field(response, "id")
    if not output_text or not response_id:
        logger.warning("chat_failed provider_error=empty_response")
        raise HTTPException(
            status_code=502,
            detail=error_detail("provider_error", "Jarvis returned an empty response."),
        )

    sources = _extract_sources(_field(response, "output", []))
    usage = _extract_usage(_field(response, "usage"))
    cost_usd = (
        calculate_cost_usd(model, usage.input_tokens, usage.output_tokens)
        if usage is not None
        else None
    )

    logger.info(
        "chat_completed response_id=%s latency_ms=%s source_count=%s",
        response_id,
        latency_ms,
        len(sources),
    )
    return ChatResponse(
        response=output_text,
        response_id=response_id,
        model=model,
        sources=sources,
        latency_ms=latency_ms,
        usage=usage,
        cost_usd=cost_usd,
    )


@app.get("/", include_in_schema=False)
@app.get("/health")
async def health():
    api_key = settings.openai_api_key
    vector_store_id = settings.openai_vector_store_id
    configured = bool(api_key and vector_store_id)

    return JSONResponse(
        status_code=200 if configured else 503,
        content={
            "status": "ok" if configured else "degraded",
            "service": "portfolio-jarvis-api",
        },
    )

