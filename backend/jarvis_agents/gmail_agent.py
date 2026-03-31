'''
This agent is responsible for handling all Gmail related operations.
It will be used to fetch unread emails, read a specific email thread, draft and send replies or new emails from natural language.
It will also be used to search inbox by keyword, sender, date range, or label.
It will also be used to archive or mark emails as read.
'''

from langchain.agents import create_agent
from tools.gmail_tools import GMAIL_TOOLS
from langchain_openai import ChatOpenAI
from prompts import GMAIL_SYSTEM_PROMPT
from state import JarvisState

gmail_graph = create_agent(
    model=ChatOpenAI(model="gpt-4o"),
    tools=GMAIL_TOOLS,
    system_prompt=GMAIL_SYSTEM_PROMPT,
)


async def gmail_agent_node(state: JarvisState) -> dict:
    result = await gmail_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": [result["messages"][-1]]}

