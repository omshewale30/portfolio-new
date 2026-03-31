from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from prompts import NEWS_SYSTEM_PROMPT
from settings.config import settings
from state import JarvisState
from tools.web_search import web_search
news_graph = create_agent(
    model=ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key),
    tools=[web_search],
    system_prompt=NEWS_SYSTEM_PROMPT,
)



async def news_agent_node(state: JarvisState) -> dict:
    result = await news_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": [result["messages"][-1]]}
