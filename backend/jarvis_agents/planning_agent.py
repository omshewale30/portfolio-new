
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from settings.config import settings
from prompts import PLANNING_SYSTEM_PROMPT
from tools.calendar_tools import CALENDAR_TOOLS
from tools.task_tools import TASK_TOOLS
from tools.time_tools import get_current_datetime
from state import JarvisState

planning_graph = create_react_agent(
    model=ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key),
    tools=[
        *CALENDAR_TOOLS,
        *TASK_TOOLS,
        get_current_datetime,
    ],
    prompt=PLANNING_SYSTEM_PROMPT,
)

async def planning_agent_node(state: JarvisState) -> dict:
    result = await planning_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": [result["messages"][-1]], "active_agent": "planning"}
