from typing import Union
from app import invoke_llm
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app import setup_conversation_chain


class ChatRequest(BaseModel):
    """
    Request model for chat endpoint.
    """
    user_id: str
    user_input: str

app = FastAPI()
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
users={}



@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/chat")
def chat(request:ChatRequest):
    """
    Endpoint to handle chat requests.
    :param request:
    :return: The response from the LLM.
    """
    # Call the invoke_llm function from app.py
    user_id = request.user_id

    if user_id not in users:
        # Initialize the conversation chain for the user
        conversation_chain = setup_conversation_chain()
        users[user_id] = conversation_chain
    conversation_chain = users[user_id]

    user_input = request.user_input
    response = invoke_llm(conversation_chain,user_input)
    return {"response": response}








