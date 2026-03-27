from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from tools.calendar_tools import CALENDAR_TOOLS
from prompts import CALENDAR_SYSTEM_PROMPT
from settings.config import settings
from state import JarvisState

calendar_graph = create_react_agent(
    model=ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key),
    tools=CALENDAR_TOOLS,
    prompt=CALENDAR_SYSTEM_PROMPT,
)

async def calendar_agent_node(state: JarvisState) -> dict:
    result = await calendar_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": [result["messages"][-1]], "active_agent": "calendar"}