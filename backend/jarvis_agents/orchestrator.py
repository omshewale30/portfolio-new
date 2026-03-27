"""LangGraph orchestrator for the Telegram route."""

from __future__ import annotations

from typing import Any, Annotated

from langchain_core.messages import AIMessage, SystemMessage, ToolMessage, trim_messages
from langchain_core.tools import InjectedToolCallId, tool
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import InjectedState, ToolNode
from langgraph.types import Command
from prompts import ORCHESTRATOR_SYSTEM_PROMPT
from state import JarvisState

from tools.get_personal_info import get_personal_info
from tools.time_tools import get_current_datetime
from jarvis_agents.gmail_agent import gmail_agent_node
from jarvis_agents.planning_agent import planning_agent_node
from jarvis_agents.news_agent import news_agent_node
from jarvis_agents.task_agent import task_agent_node
from llm.clients import orchestrator_llm
from jarvis_agents.calendar_agent import calendar_agent_node

@tool
def transfer_to_gmail(
    tool_call_id: Annotated[str, InjectedToolCallId],
    state: Annotated[JarvisState, InjectedState],
) -> Command:
    """Transfer control to the Gmail specialist for email operations."""
    del state
    return Command(
        update={
            "active_agent": "gmail_agent",
            "messages": [
                ToolMessage(
                    content="Transferred to Gmail specialist.",
                    name="transfer_to_gmail",
                    tool_call_id=tool_call_id,
                )
            ],
        }
    )


@tool
def transfer_to_planning(
    tool_call_id: Annotated[str, InjectedToolCallId],
    state: Annotated[JarvisState, InjectedState],
) -> Command:
    """Transfer control to the planning specialist for day planning and scheduling."""
    del state
    return Command(
        update={
            "active_agent": "planning_agent",
            "messages": [
                ToolMessage(
                    content="Transferred to planning specialist.",
                    name="transfer_to_planning",
                    tool_call_id=tool_call_id,
                )
            ],
        }
    )


@tool
def transfer_to_calendar(
    tool_call_id: Annotated[str, InjectedToolCallId],
    state: Annotated[JarvisState, InjectedState],
) -> Command:
    """Transfer control to the calendar specialist for calendar operations."""
    del state
    return Command(
        update={
            "active_agent": "calendar_agent",
            "messages": [
                ToolMessage(
                    content="Transferred to calendar specialist.",
                    name="transfer_to_calendar",
                    tool_call_id=tool_call_id,
                )
            ],
        }
    )


@tool
def transfer_to_news(
    tool_call_id: Annotated[str, InjectedToolCallId],
    state: Annotated[JarvisState, InjectedState],
) -> Command:
    """Transfer control to the AI news specialist."""
    del state
    return Command(
        update={
            "active_agent": "news_agent",
            "messages": [
                ToolMessage(
                    content="Transferred to news specialist.",
                    name="transfer_to_news",
                    tool_call_id=tool_call_id,
                )
            ],
        }
    )


@tool
def transfer_to_task(
    tool_call_id: Annotated[str, InjectedToolCallId],
    state: Annotated[JarvisState, InjectedState],
) -> Command:
    """Transfer control to the task specialist for task operations."""
    del state
    return Command(
        update={
            "active_agent": "task_agent",
            "messages": [
                ToolMessage(
                    content="Transferred to task specialist.",
                    name="transfer_to_task",
                    tool_call_id=tool_call_id,
                )
            ],
        }
    )



ROUTING_TOOLS = [transfer_to_gmail, transfer_to_news, transfer_to_planning, transfer_to_calendar, transfer_to_task]

ORCHESTRATOR_EXECUTION_TOOLS = [
    get_current_datetime,
    get_personal_info,
]
ORCHESTRATOR_LLM_TOOLS = [*ORCHESTRATOR_EXECUTION_TOOLS, *ROUTING_TOOLS]

def _safe_content(message: Any) -> str:
    content = getattr(message, "content", "")
    if isinstance(content, list):
        return " ".join(str(part) for part in content)
    return str(content or "")


def orchestrator_node(state: JarvisState) -> dict:
    message_window = trim_messages(
        list(state["messages"]),
        strategy="last",
        max_tokens=7000,
        token_counter=orchestrator_llm,
        allow_partial=False,
    )
    response = orchestrator_llm.bind_tools(ORCHESTRATOR_LLM_TOOLS).invoke(
        [SystemMessage(content=ORCHESTRATOR_SYSTEM_PROMPT), *message_window]
    )
    return {"messages": [response], "active_agent": "orchestrator"}


def route_orchestrator(state: JarvisState) -> str:
    last = state["messages"][-1]
    if not isinstance(last, AIMessage) or not last.tool_calls:
        return END
    return "orchestrator_tools"


def route_after_orchestrator_tools(state: JarvisState) -> str:
    active_agent = state.get("active_agent")
    if active_agent == "gmail_agent":
        return "gmail_agent"
    if active_agent == "news_agent":
        return "news_agent"
    if active_agent == "planning_agent":
        return "planning_agent"
    if active_agent == "calendar_agent":
        return "calendar_agent"
    if active_agent == "task_agent":
        return "task_agent"
    return "orchestrator"



def _specialist_back_edge(state: JarvisState) -> str:
    """
    End specialist execution after one specialist turn.
    If no final text exists, fall back to orchestrator for recovery.
    """
    last = state["messages"][-1]
    return END if _safe_content(last).strip() else "orchestrator"


def build_orchestrator_graph(checkpointer):
    graph_builder = StateGraph(JarvisState)
    graph_builder.add_node("orchestrator", orchestrator_node)
    graph_builder.add_node("orchestrator_tools", ToolNode(ORCHESTRATOR_LLM_TOOLS))
    graph_builder.add_node("gmail_agent", gmail_agent_node)
    graph_builder.add_node("news_agent", news_agent_node)
    graph_builder.add_node("planning_agent", planning_agent_node)
    graph_builder.add_node("calendar_agent", calendar_agent_node)
    graph_builder.add_node("task_agent", task_agent_node)

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
            "gmail_agent": "gmail_agent",
            "news_agent": "news_agent",
            "planning_agent": "planning_agent",
            "calendar_agent": "calendar_agent",
            "task_agent": "task_agent",
            "orchestrator": "orchestrator",
        },
    )
    graph_builder.add_conditional_edges("gmail_agent", _specialist_back_edge, {"orchestrator": "orchestrator", END: END})
    graph_builder.add_conditional_edges("news_agent", _specialist_back_edge, {"orchestrator": "orchestrator", END: END})
    graph_builder.add_conditional_edges("planning_agent", _specialist_back_edge, {"orchestrator": "orchestrator", END: END})
    graph_builder.add_conditional_edges("calendar_agent", _specialist_back_edge, {"orchestrator": "orchestrator", END: END})
    graph_builder.add_conditional_edges("task_agent", _specialist_back_edge, {"orchestrator": "orchestrator", END: END})
    return graph_builder.compile(checkpointer=checkpointer)
