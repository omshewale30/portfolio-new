from langchain_openai import ChatOpenAI
from settings.config import settings


orchestrator_llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key, temperature=0)
specialist_llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key, temperature=0)
