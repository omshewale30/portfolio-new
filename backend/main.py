import asyncio
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from contextlib import asynccontextmanager
from settings.config import settings
from settings.logging import configure_logging, get_logger
from integrations.telegram import parse_inbound, send_message
from jarvis_agents.runner import run_agent
from fastapi.responses import JSONResponse
from integrations.telegram import set_webhook
from scheduler import start_scheduler
from db.connection import get_async_session

openai_client = None
logger = get_logger(__name__)
PROMPT_ID = "pmpt_69ae2f5b1f988195a348525fe1a475f50f270f2f5fb69a34"

@asynccontextmanager
async def lifespan(app: FastAPI):
    global openai_client
    load_dotenv()  # ✅ FIX: Load .env inside lifespan, before reading env vars
    configure_logging(level="INFO") 
    print("Starting up...")
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set. Check your .env file.")
    openai_client = OpenAI(api_key=api_key)

    if settings.webhook_base_url:
        webhook_url = f"{settings.webhook_base_url}/webhook"
        result = await set_webhook(webhook_url)
        logger.info(f"Webhook registered: {result}")

    start_scheduler()
    logger.info("Scheduler started")
    yield
    print("Shutting down...")


class ChatRequest(BaseModel):
    user_id: str
    user_input: str


app = FastAPI(
    title="OpenAI Responses API",
    description="API for OpenAI Responses",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://omshewale.me","http://localhost:5173","https://jarvis-interface.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ FIX: Store previous_response_id per user, NOT a conversation object
users_previous_response_id: dict[str, str | None] = {}


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/chat")
def chat(request: ChatRequest):
    user_id = request.user_id
    user_input = request.user_input

    # Get the last response ID for this user (None on first turn)
    previous_response_id = users_previous_response_id.get(user_id, None)

    try:
        # ✅ FIX: Use previous_response_id for multi-turn, not conversations.create()
        response = openai_client.responses.create(
            model="gpt-4o",
            prompt={"id": PROMPT_ID},
            input=[{"role": "user", "content": user_input}],
            previous_response_id=previous_response_id,  # None = fresh conversation
            store=True  # Required for previous_response_id chaining to work
        )

        # Save the new response ID for the next turn
        users_previous_response_id[user_id] = response.id

        latest_response = response.output_text
        print(f"Response for user {user_id}: {latest_response}")

        return {"response": latest_response}

    except Exception as e:
        print(f"Error calling OpenAI Responses API: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/webhook")
async def telegram_webhook(request: Request):
    """
    Receives inbound Telegram updates.
    Telegram expects a 200 response quickly — run agent async.
    """
    update = await request.json()
    parsed = parse_inbound(update)

    if parsed is None:
        return Response(status_code=200)

    chat_id, user_message = parsed

    if chat_id != settings.telegram_chat_id:
        logger.warning(f"Ignored message from unknown chat_id: {chat_id}")
        return Response(status_code=200)

    logger.info(f"Received from {chat_id}: {user_message}")

    async def _handle():
        try:
            async with get_async_session() as db_session:
                response_text = await run_agent(chat_id, user_message, db_session=db_session)
            await send_message(chat_id, response_text)
        except Exception as e:
            logger.error(f"Agent error: {e}", exc_info=True)
            await send_message(chat_id, "⚠️ Something went wrong. Please try again.")

    asyncio.create_task(_handle())
    return Response(status_code=200)

@app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
