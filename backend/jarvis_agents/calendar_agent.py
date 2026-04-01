from langchain.agents import create_agent
from tools.calendar_tools import CALENDAR_TOOLS
from prompts import CALENDAR_SYSTEM_PROMPT
from state import JarvisState
from llm.clients import specialist_llm
from tools.time_tools import get_current_datetime
from langchain_core.messages import trim_messages


calendar_graph = create_agent(
    model=specialist_llm,
    tools=[*CALENDAR_TOOLS, get_current_datetime],
    system_prompt=CALENDAR_SYSTEM_PROMPT,
)

async def calendar_agent_node(state: JarvisState) -> dict:
    # Keep specialist context intentionally tight to reduce cross-turn drift.
    relevant_messages = trim_messages(
        list(state["messages"]),
        strategy="last",
        max_tokens=12,          # counts messages because token_counter=len
        token_counter=len,
        start_on="human",
        include_system=False,   # system prompt already comes from create_agent(...)
        allow_partial=False,
    )
    result = await calendar_graph.ainvoke({"messages": relevant_messages})
    return {"messages": [result["messages"][-1]]}