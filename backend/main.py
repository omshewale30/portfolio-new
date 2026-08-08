from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import APIError, AsyncOpenAI, BadRequestError, NotFoundError
from open_ai_client import OpenAIClient
from settings import settings
from prompts import PUBLIC_JARVIS_INSTRUCTIONS
from logging_config import configure_logging, get_logger
from schemas import ChatRequest, ChatResponse, error_detail

configure_logging()
logger = get_logger(__name__)

DEFAULT_ALLOWED_ORIGINS = (
    "https://omshewale.me",
    "http://localhost:5173",
    "https://jarvis-interface.vercel.app",
)

FILE_SEARCH_MAX_RESULTS = 8



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
)

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
async def chat(request: ChatRequest):
    _, vector_store_id, model, instructions = settings.openai_api_key, settings.openai_vector_store_id, settings.openai_chat_model, PUBLIC_JARVIS_INSTRUCTIONS
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
        "store": True,
    }
    if request.previous_response_id:
        call["previous_response_id"] = request.previous_response_id

    try:
        response = await _client().responses.create(**call)
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

    output_text = (response.output_text or "").strip()
    if not output_text or not response.id:
        logger.warning("chat_failed provider_error=empty_response")
        raise HTTPException(
            status_code=502,
            detail=error_detail("provider_error", "Jarvis returned an empty response."),
        )

    logger.info("chat_completed response_id=%s", response.id)
    return ChatResponse(response=output_text, response_id=response.id)


@app.get("/health")
async def health():
    api_key, vector_store_id, _, _ = settings.openai_api_key, settings.openai_vector_store_id, settings.openai_chat_model, PUBLIC_JARVIS_INSTRUCTIONS
    configured = bool(api_key and vector_store_id)
    return JSONResponse(
        status_code=200 if configured else 503,
        content={
            "status": "ok" if configured else "degraded",
            "service": "portfolio-jarvis-api",
        },
    )
