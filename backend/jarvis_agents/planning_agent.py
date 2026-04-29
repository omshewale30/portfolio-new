from langchain.agents import create_agent
from prompts import PLANNING_SYSTEM_PROMPT
from tools.calendar_tools import CALENDAR_TOOLS
from tools.task_tools import TASK_TOOLS
from tools.time_tools import get_current_datetime
from state import JarvisState
from tools.briefing_tool import generate_morning_briefing
from llm.clients import orchestrator_llm
from langchain_core.messages import trim_messages
from tools.planning_verfier import planning_verifier_tool

planning_graph = create_agent(
    model=orchestrator_llm,
    tools=[
        *CALENDAR_TOOLS,
        *TASK_TOOLS,
        get_current_datetime,
        generate_morning_briefing,
        planning_verifier_tool,
    ],
    system_prompt=PLANNING_SYSTEM_PROMPT,
)

async def planning_agent_node(state: JarvisState) -> dict:
    relevant_messages = trim_messages(
        list(state["messages"]),
        strategy="last",
        max_tokens=50,          # counts messages because token_counter=len
        token_counter=len,
        start_on="human",
        include_system=False,   # system prompt already comes from create_agent(...)
        allow_partial=False,
    )
    result = await planning_graph.ainvoke({"messages": relevant_messages}, config={"recursion_limit": 10})
    return {"messages": [result["messages"][-2]]}
