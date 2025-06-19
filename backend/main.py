import os
from typing import Union
from app import invoke_llm
from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app import setup_conversation_chain
from contextlib import asynccontextmanager
from azure.identity import ClientSecretCredential
from azure.ai.projects import AIProjectClient
from azure.ai.agents.models import ListSortOrder

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan for the FastAPI app.
    """
    print("Starting up...")
    project_client = set_up_azure_client()
    app.state.project_client = project_client
    yield
    print("Shutting down...")
    app.state.project_client.close()


class ChatRequest(BaseModel):
    """
    Request model for chat endpoint.
    """
    user_id: str
    user_input: str

app = FastAPI(
    title="Azure AI Project API",
    description="API for Azure AI Project",
    version="1.0.0",
    lifespan=lifespan
)
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
users_threads={}
def set_up_azure_client():
    """
    Set up the Azure client using service principal authentication.
    """
    project_endpoint = os.getenv("AZURE_AI_ENDPOINT")
    tenant_id = os.getenv("AZURE_TENANT_ID")
    client_id = os.getenv("AZURE_CLIENT_ID")
    client_secret = os.getenv("AZURE_CLIENT_SECRET")
    
    # Check for missing environment variables
    missing_vars = []
    if not project_endpoint:
        missing_vars.append("AZURE_AI_ENDPOINT")
    if not tenant_id:
        missing_vars.append("AZURE_TENANT_ID")
    if not client_id:
        missing_vars.append("AZURE_CLIENT_ID")
    if not client_secret:
        missing_vars.append("AZURE_CLIENT_SECRET")
    
    if missing_vars:
        error_msg = f"Missing required Azure environment variables: {', '.join(missing_vars)}"
        print(f"ERROR: {error_msg}")
        raise ValueError(error_msg)
    
    try:
        credential = ClientSecretCredential(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret
        )
        
        project_client = AIProjectClient(
            credential=credential,
            endpoint=project_endpoint
        )
        
        print(f"Successfully created Azure AI Project client with endpoint: {project_endpoint}")
        return project_client
        
    except Exception as e:
        error_msg = f"Failed to create Azure client: {str(e)}"
        print(f"ERROR: {error_msg}")
        raise Exception(error_msg)

def get_agent(project_client):
    """
    Get the agent.
    """
    agent_id = os.getenv("AZURE_AGENT_ID")
    if not agent_id:
        error_msg = "Missing required environment variable: AZURE_AGENT_ID"
        print(f"ERROR: {error_msg}")
        raise ValueError(error_msg)
    
    try:
        agent = project_client.agents.get_agent(agent_id)
        print(f"Successfully retrieved agent with ID: {agent_id}")
        return agent
    except Exception as e:
        error_msg = f"Failed to get agent with ID {agent_id}: {str(e)}"
        print(f"ERROR: {error_msg}")
        raise Exception(error_msg)




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
    project_client = app.state.project_client  # Use the client from app state
    agent = get_agent(project_client)
    thread = users_threads.get(user_id)
    if thread is None:
        thread = project_client.agents.threads.create()
        users_threads[user_id] = thread
    else:
        thread = users_threads.get(user_id)

    message = project_client.agents.messages.create(
        thread_id=thread.id,
        role="user",
        content=request.user_input
    )
    
    run = project_client.agents.runs.create_and_process(
        thread_id=thread.id,
        agent_id=agent.id
    )
    
    if run.status == "failed":
        print(f"Run failed: {run.last_error}")
        return {"response": f"Error: {run.last_error}"}
    else:
        messages = project_client.agents.messages.list(thread_id=thread.id, order=ListSortOrder.ASCENDING)
        
        # Extract the latest assistant message
        assistant_messages = [msg for msg in messages if msg.role == "assistant"]
        if assistant_messages:
            latest_response = assistant_messages[-1].content[0].text.value if assistant_messages[-1].content else "No response generated"
        else:
            latest_response = "No response generated"
        
        return {"response": latest_response}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    










