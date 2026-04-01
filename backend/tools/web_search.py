from langchain_core.tools import tool
from openai import AsyncOpenAI

client = AsyncOpenAI()

@tool
async def web_search(query: str) -> str:
    """Search the web and return a concise summary with citations."""
    response = await client.responses.create(
        model="gpt-4o",
        input=query,
        tools=[{"type": "web_search"}],
    )
    return (response.output_text or "").strip() or "No web results available."