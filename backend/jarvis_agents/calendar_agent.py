from langchain.agents import create_agent
from tools.calendar_tools import CALENDAR_TOOLS
from prompts import CALENDAR_SYSTEM_PROMPT
from settings.config import settings
from state import JarvisState
from llm.clients import specialist_llm

calendar_graph = create_agent(
    model=specialist_llm,
    tools=CALENDAR_TOOLS,
    system_prompt=CALENDAR_SYSTEM_PROMPT,
)

async def calendar_agent_node(state: JarvisState) -> dict:
    result = await calendar_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": [result["messages"][-1]]}