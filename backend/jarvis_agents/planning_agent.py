from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from settings.config import settings
from prompts import PLANNING_SYSTEM_PROMPT
from tools.calendar_tools import CALENDAR_TOOLS
from tools.task_tools import TASK_TOOLS
from tools.time_tools import get_current_datetime
from state import JarvisState
from tools.briefing_tool import generate_morning_briefing

planning_graph = create_agent(
    model=ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key),
    tools=[
        *CALENDAR_TOOLS,
        *TASK_TOOLS,
        get_current_datetime,
        generate_morning_briefing,
    ],
    system_prompt=PLANNING_SYSTEM_PROMPT,
)

async def planning_agent_node(state: JarvisState) -> dict:
    result = await planning_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": [result["messages"][-1]]}
