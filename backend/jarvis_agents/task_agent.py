from prompts import TASK_SYSTEM_PROMPT
from tools.task_tools import TASK_TOOLS
from state import JarvisState
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from settings.config import settings
from llm.clients import specialist_llm
from tools.time_tools import get_current_datetime
task_graph = create_react_agent(
    model=specialist_llm,
    tools=[
        *TASK_TOOLS,
        get_current_datetime,
    ],
    prompt=TASK_SYSTEM_PROMPT,
)

async def task_agent_node(state: JarvisState) -> dict:
    result = await task_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": [result["messages"][-1]], "active_agent": "task"}