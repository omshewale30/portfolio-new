"""LangGraph orchestrator for the Telegram route."""

from __future__ import annotations

from typing import Any, Annotated

from langchain_core.messages import AIMessage, SystemMessage, ToolMessage, trim_messages
from langchain_core.tools import InjectedToolCallId, StructuredTool
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import InjectedState, ToolNode

from langgraph.types import Command
from prompts import ORCHESTRATOR_SYSTEM_PROMPT
from state import JarvisState

from tools.get_personal_info import get_personal_info
from tools.time_tools import get_current_datetime
from tools.task_tools import TASK_TOOLS
from jarvis_agents.gmail_agent import gmail_agent_node
from jarvis_agents.planning_agent import planning_agent_node
from llm.clients import orchestrator_llm
from jarvis_agents.calendar_agent import calendar_agent_node
from tools.web_search import web_search


def create_handoff_tool(agent_name: str, description: str | None = None):
    def handoff_tool(tool_call_id: Annotated[str, InjectedToolCallId]) -> Command:
        return Command(
            goto=agent_name,
            update={"messages": [ToolMessage(
                content=f"Transferred to {agent_name}.",
                tool_call_id=tool_call_id,
            )]}
        )
    return StructuredTool.from_function(
        func=handoff_tool,
        name=f"transfer_to_{agent_name}",
        description=description or f"Transfer control to the {agent_name} specialist.",
    )

ROUTING_TOOLS = [
    create_handoff_tool("gmail_agent", "Transfer to Gmail specialist for email operations."),
    create_handoff_tool("planning_agent", "Transfer to planning specialist."),
    create_handoff_tool("calendar_agent", "Transfer to calendar specialist."),
]

ORCHESTRATOR_EXECUTION_TOOLS = [
    get_current_datetime,
    get_personal_info,
    *TASK_TOOLS,
    web_search,
]
ORCHESTRATOR_LLM_TOOLS = [*ORCHESTRATOR_EXECUTION_TOOLS, *ROUTING_TOOLS]


_orchestrator_llm = orchestrator_llm.bind_tools(ORCHESTRATOR_LLM_TOOLS)

def orchestrator_node(state: JarvisState) -> dict:
    message_window = trim_messages(
        state["messages"],
        strategy="last",
        max_tokens=7000,
        token_counter=orchestrator_llm,  # or "approximate"
        start_on="human",
        include_system=False,            # you inject SystemMessage separately
        allow_partial=False,
    )
    response = _orchestrator_llm.invoke(
        [SystemMessage(content=ORCHESTRATOR_SYSTEM_PROMPT), *message_window]
    )
    return {"messages": [response]}


def route_orchestrator(state: JarvisState) -> str:
    last = state["messages"][-1]
    if not isinstance(last, AIMessage) or not last.tool_calls:
        return END
    return "orchestrator_tools"


def route_after_orchestrator_tools(state: JarvisState) -> str:
    """Route transfer-tool results to specialists; otherwise continue orchestration."""
    transfer_map = {
        "transfer_to_gmail_agent": "gmail_agent",
        "transfer_to_planning_agent": "planning_agent",
        "transfer_to_calendar_agent": "calendar_agent",
    }
    messages = list(state["messages"])
    last_ai_with_tools = next(
        (msg for msg in reversed(messages) if isinstance(msg, AIMessage) and msg.tool_calls),
        None,
    )
    if last_ai_with_tools is None:
        return "orchestrator"
    tool_name = last_ai_with_tools.tool_calls[-1]["name"]
    return transfer_map.get(tool_name, "orchestrator")





def build_orchestrator_graph(checkpointer):
    graph_builder = StateGraph(JarvisState)
    graph_builder.add_node("orchestrator", orchestrator_node)
    graph_builder.add_node("orchestrator_tools", ToolNode(ORCHESTRATOR_LLM_TOOLS))
    graph_builder.add_node("gmail_agent", gmail_agent_node)
    graph_builder.add_node("planning_agent", planning_agent_node)
    graph_builder.add_node("calendar_agent", calendar_agent_node)
    graph_builder.set_entry_point("orchestrator")
    graph_builder.add_conditional_edges(
        "orchestrator",
        route_orchestrator,
        {
            "orchestrator_tools": "orchestrator_tools",
            END: END,
        },
    )
    graph_builder.add_conditional_edges(
        "orchestrator_tools",
        route_after_orchestrator_tools,
        {
            "orchestrator": "orchestrator",
            "gmail_agent": "gmail_agent",
            "planning_agent": "planning_agent",
            "calendar_agent": "calendar_agent",
        },
    )
    for agent in ["gmail_agent", "planning_agent", "calendar_agent"]:
        graph_builder.add_edge(agent, END)
    return graph_builder.compile(checkpointer=checkpointer)
