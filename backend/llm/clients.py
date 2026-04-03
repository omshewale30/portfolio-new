from langchain_openai import ChatOpenAI
from settings.config import settings


# Higher max_retries helps transient 429s inside a single completion; briefing also retries at runner level.
orchestrator_llm = ChatOpenAI(
    model="gpt-4o",
    api_key=settings.openai_api_key,
    temperature=0,
    max_retries=8,
)
specialist_llm = ChatOpenAI(
    model="gpt-4o-mini",
    api_key=settings.openai_api_key,
    temperature=0,
    max_retries=8,
)
