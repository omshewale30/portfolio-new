import logging
import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import APIError, AsyncOpenAI, BadRequestError, NotFoundError
from pydantic import BaseModel, Field, field_validator


load_dotenv()
logger = logging.getLogger("portfolio_jarvis_api")

DEFAULT_ALLOWED_ORIGINS = (
    "https://omshewale.me",
    "http://localhost:5173",
    "https://jarvis-interface.vercel.app",
)


def _allowed_origins() -> list[str]:
    configured = os.getenv("CORS_ALLOWED_ORIGINS", "")
    if not configured.strip():
        return list(DEFAULT_ALLOWED_ORIGINS)
    return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]


class ChatRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=128)
    user_input: str = Field(min_length=1, max_length=2000)
    previous_response_id: str | None = Field(default=None, min_length=1, max_length=200)

    @field_validator("user_id", "user_input")
    @classmethod
    def reject_blank_values(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class ChatResponse(BaseModel):
    response: str
    response_id: str


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

_openai_client: AsyncOpenAI | None = None


def _error_detail(code: str, message: str) -> dict[str, str]:
    return {"code": code, "message": message}


def _configuration() -> tuple[str, str, str]:
    return (
        os.getenv("OPENAI_API_KEY", "").strip(),
        os.getenv("OPENAI_PROMPT_ID", "").strip(),
        os.getenv("OPENAI_CHAT_MODEL", "gpt-4o").strip() or "gpt-4o",
    )


def _client() -> AsyncOpenAI:
    global _openai_client
    api_key, _, _ = _configuration()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail=_error_detail("configuration_error", "Jarvis is not configured."),
        )
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=api_key)
    return _openai_client


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
    _, prompt_id, model = _configuration()
    if not prompt_id:
        raise HTTPException(
            status_code=503,
            detail=_error_detail("configuration_error", "Jarvis is not configured."),
        )

    call: dict[str, Any] = {
        "model": model,
        "prompt": {"id": prompt_id},
        "input": [{"role": "user", "content": request.user_input}],
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
                detail=_error_detail(
                    "conversation_expired",
                    "This conversation has expired. Start a new conversation and try again.",
                ),
            ) from exc
        logger.warning("chat_failed provider_error=%s", type(exc).__name__)
        raise HTTPException(
            status_code=502,
            detail=_error_detail("provider_error", "Jarvis is temporarily unavailable."),
        ) from exc
    except APIError as exc:
        logger.warning("chat_failed provider_error=%s", type(exc).__name__)
        raise HTTPException(
            status_code=502,
            detail=_error_detail("provider_error", "Jarvis is temporarily unavailable."),
        ) from exc
    except Exception as exc:
        logger.exception("chat_failed provider_error=unexpected")
        raise HTTPException(
            status_code=502,
            detail=_error_detail("provider_error", "Jarvis is temporarily unavailable."),
        ) from exc

    output_text = (response.output_text or "").strip()
    if not output_text or not response.id:
        logger.warning("chat_failed provider_error=empty_response")
        raise HTTPException(
            status_code=502,
            detail=_error_detail("provider_error", "Jarvis returned an empty response."),
        )

    logger.info("chat_completed response_id=%s", response.id)
    return ChatResponse(response=output_text, response_id=response.id)


@app.get("/health")
async def health():
    api_key, prompt_id, _ = _configuration()
    configured = bool(api_key and prompt_id)
    return JSONResponse(
        status_code=200 if configured else 503,
        content={
            "status": "ok" if configured else "degraded",
            "service": "portfolio-jarvis-api",
        },
    )
