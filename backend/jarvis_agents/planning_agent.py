from langchain.agents import create_agent
from prompts import PLANNING_SYSTEM_PROMPT
from tools.calendar_tools import CALENDAR_TOOLS
from tools.task_tools import TASK_TOOLS
from tools.time_tools import get_current_datetime
from state import JarvisState
from tools.briefing_tool import generate_morning_briefing
from llm.clients import specialist_llm

planning_graph = create_agent(
    model=specialist_llm,
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
