import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from contextlib import asynccontextmanager

openai_client = None

PROMPT_ID = "pmpt_69ae2f5b1f988195a348525fe1a475f50f270f2f5fb69a34"

@asynccontextmanager
async def lifespan(app: FastAPI):
    global openai_client
    load_dotenv()  # ✅ FIX: Load .env inside lifespan, before reading env vars
    print("Starting up...")
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set. Check your .env file.")
    openai_client = OpenAI(api_key=api_key)
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
    allow_origins=["*"],
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


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
