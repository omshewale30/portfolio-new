from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from settings.config import settings
from state import JarvisState
from tools.web_search import web_search
from llm.clients import specialist_llm
from prompts import WEATHER_SYSTEM_PROMPT
weather_graph = create_agent(
    model=specialist_llm,
    tools=[web_search],
    state_modifier=WEATHER_SYSTEM_PROMPT,
)

async def weather_agent_node(state: JarvisState) -> dict:
    result = await weather_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": [result["messages"][-1]], "active_agent": "weather"}
