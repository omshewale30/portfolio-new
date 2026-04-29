'''
This agent is responsible for handling all Gmail related operations.
It will be used to fetch unread emails, read a specific email thread, draft and send replies or new emails from natural language.
It will also be used to search inbox by keyword, sender, date range, or label.
It will also be used to archive or mark emails as read.
'''

from langchain.agents import create_agent
from tools.gmail_tools import GMAIL_TOOLS
from prompts import GMAIL_SYSTEM_PROMPT
from state import JarvisState
from llm.clients import specialist_llm
from tools.time_tools import get_current_datetime

gmail_graph = create_agent(
    model=specialist_llm,
    tools=GMAIL_TOOLS + [get_current_datetime],
    system_prompt=GMAIL_SYSTEM_PROMPT,
)


async def gmail_agent_node(state: JarvisState) -> dict:
    # Keep specialist context intentionally tight to reduce cross-turn drift.
    relevant_messages = list(state["messages"])[-3:]
    result = await gmail_graph.ainvoke({"messages": relevant_messages}, config={"recursion_limit": 10})
    return {"messages": [result["messages"][-1]]}

