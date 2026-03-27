from langchain_core.tools import tool
from settings.config import settings
from llm.clients import orchestrator_llm

@tool
async def web_search(query: str) -> str:
    """Search the web and return a concise text summary."""
    response = await orchestrator_llm.responses.create(
        model="gpt-4o",
        input=query,
        tools=[{"type": "web_search_preview"}],
    )
    return (response.output_text or "").strip() or "No web results available."


