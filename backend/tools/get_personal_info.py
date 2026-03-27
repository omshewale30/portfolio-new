from langchain_core.tools import tool
from settings.config import settings

from openai import AsyncOpenAI

openai_client = AsyncOpenAI()
VECTOR_STORE_ID = settings.vector_store_id

@tool
async def get_personal_info(query: str, top_k: int = 8) -> str:
    """
    Search Jarvis's personal knowledge base for Om's personal information and relevant context about Om.
    Use this for questions about Om's personal information and relevant context about Om.
    
    Args:
        query: The search query to look up Om's personal information and relevant context about Om.
        top_k: Number of results to retrieve (default 8)
    """
    response = await openai_client.responses.create(
        model="gpt-4o-mini",  # cheap model just for retrieval
        input=query,
        tools=[{
            "type": "file_search",
            "vector_store_ids": [VECTOR_STORE_ID],
            "max_num_results": top_k
        }]
    )
    # Extract text content from response
    results = []
    for item in response.output:
        if hasattr(item, "content"):
            for block in item.content:
                if hasattr(block, "text"):
                    results.append(block.text)
    return "\n\n---\n\n".join(results) if results else "No relevant documents found."
