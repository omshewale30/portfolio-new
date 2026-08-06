# LangGraph Migration Plan — Jarvis Backend

## Overview

This document covers migrating the **Telegram-triggered agentic path** from the OpenAI Agents SDK (`openai-agents`) to LangGraph. The `/chat` (Responses API) path is out of scope and can coexist unchanged.

---

## 1. Current Architecture Audit

### Two Parallel AI Stacks (only Telegram path is migrated)

| Path | Entry Point | Engine | Memory |
|---|---|---|---|
| **Telegram** | `POST /webhook` → `run_agent()` | OpenAI Agents SDK (`Runner.run`) | `SQLAlchemySession` (PostgreSQL, per `chat_id`) |
| **Web Chat** | `POST /chat` | OpenAI Responses API | In-memory dict `users_previous_response_id` |

---

### Agent Hierarchy (Telegram path)

```
Jarvis (Orchestrator)                              orchestrator.py
├── tools=[get_current_datetime, get_personal_info,
│          calendar_tool*, task_tool*, WebSearchTool]
└── handoffs=[gmail_agent, ai_news_agent, planning_agent]

calendar_tool*  ← CalendarAgent.as_tool()          calendar_agent.py
task_tool*      ← TaskAgent.as_tool()               task_agent.py

planning_agent (handoff target)                    planning_agent.py
└── tools=[get_current_datetime, get_todays_events, list_overdue_tasks,
           list_tasks, create_calendar_event, planning_verifier_tool*]

planning_verifier_tool*  ← PlanningVerifier.as_tool()   tools/planning_verfier.py

gmail_agent (handoff target)                       gmail_agent.py
└── tools=[get_unread_emails, get_email_thread, draft_email, send_email,
           search_emails, archive_email, mark_as_read]

ai_news_agent (handoff target)                     news_agent.py
└── tools=[WebSearchTool]
```

**Structural notes:**
- `calendar_agent` and `task_agent` are **not** in `handoffs` — exposed via `agent.as_tool()`, called inline within the orchestrator's ReAct loop.
- `planning_agent`, `gmail_agent`, `ai_news_agent` are **handoffs** — full control transfer with their own ReAct loops.
- `PlanningVerifier` is a nested sub-agent inside `planning_agent`, also via `as_tool()`.
- `weather_agent` is defined but unused at runtime.

### Memory / State

```python
# jarvis_agents/runner.py
session = SQLAlchemySession(str(chat_id), engine=memory_engine, create_tables=False)
run_config = RunConfig(session_settings=SessionSettings(limit=100))
```

- Per-`chat_id` persistent conversation history in PostgreSQL.
- SDK auto-trims to 100 messages.
- Error recovery: `BadRequestError` with `"No tool call found for function call output"` → `session.clear_session()` + retry.

### Scheduled Workflow (`briefing/runner.py`)

```
APScheduler (cron) → send_morning_briefing()
  1. Runner.run(planning_agent, PLANNING_REQUEST)   ← Agents SDK
  2. _list_overdue_tasks() + _list_due_today_tasks()
  3. client.chat.completions.create(...)            ← raw Chat Completions
  4. send_message(telegram_chat_id, briefing_text)
```

---

## 2. Component Translation Table

| Current (OpenAI Agents SDK) | File | LangGraph Equivalent |
|---|---|---|
| `Agent("Jarvis")` w/ tools + handoffs | `orchestrator.py` | `orchestrator_node` — `ChatOpenAI.bind_tools(all_tools)` + routing conditional edge |
| `CalendarAgent.as_tool()` | `calendar_agent.py` | Inline `ToolNode([calendar_tools...])` within orchestrator graph |
| `TaskAgent.as_tool()` | `task_agent.py` | Inline `ToolNode([task_tools...])` within orchestrator graph |
| `GmailAgent` (handoff) | `gmail_agent.py` | `gmail_node` — `create_react_agent` subgraph, routed via conditional edge |
| `AiNewsAgent` (handoff) | `news_agent.py` | `news_node` — `create_react_agent` subgraph with web search |
| `PlanningAgent` (handoff) | `planning_agent.py` | `planning_subgraph` — custom `StateGraph` with verifier cycle |
| `PlanningVerifier.as_tool()` | `planning_verfier.py` | `verifier_node` inside `planning_subgraph` |
| `@function_tool` | `tools/*.py` | `@tool` from `langchain_core.tools` |
| `WebSearchTool()` | SDK built-in | `TavilySearchResults` or `DuckDuckGoSearchRun` |
| `Runner.run(agent, msg, session=..., run_config=...)` | `runner.py` | `graph.ainvoke(state, config={"configurable": {"thread_id": chat_id}})` |
| `SQLAlchemySession(chat_id, engine=...)` | `runner.py` | `AsyncPostgresSaver.from_conn_string(DATABASE_URL)` |
| `SessionSettings(limit=100)` | `runner.py` | `trim_messages()` pre-node step or custom state reducer |
| `session.clear_session()` | `runner.py` | `checkpointer.adelete_thread(thread_id)` then retry |
| `handoffs=[gmail_agent, ...]` | `orchestrator.py` | `route_orchestrator()` conditional edge + transfer tools |
| `Runner.run(planning_agent, ...)` in briefing | `briefing/runner.py` | `planning_graph.ainvoke(state)` (no checkpointer needed) |

---

## 3. Migration Steps

### Phase 1 — Add Dependencies

```bash
pip install langgraph langchain-openai langchain-core langgraph-checkpoint-postgres tavily-python
```

Add to `requirements.txt`:
```
langgraph
langchain-openai
langchain-core
langgraph-checkpoint-postgres
tavily-python
```

Remove `openai-agents` once migration is complete (keep `openai` — still needed for `/chat` and `get_personal_info`).

---

### Phase 2 — Convert `@function_tool` → `@tool`

In every file under `tools/`, replace the decorator:

```python
# BEFORE
from agents import function_tool

@function_tool
def create_task(title: str, ...) -> str:
    """Create a new task."""
    ...
```

```python
# AFTER
from langchain_core.tools import tool

@tool
def create_task(title: str, ...) -> str:
    """Create a new task."""
    ...
```

`@tool` reads the docstring for the description and type hints for the schema — same pattern as `@function_tool`.

**Breaking change:** If any tool uses `RunContextWrapper` from the SDK (e.g., `ctx.context`), remove that dependency — `@tool` functions receive only their declared arguments.

---

### Phase 3 — Define the Shared State Schema

Create `jarvis_agents/state.py`:

```python
from typing import TypedDict, Annotated, Sequence, Literal
from langchain_core.messages import BaseMessage
import operator

class JarvisState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    chat_id: str
    active_agent: str
```

The `operator.add` reducer means each node **appends** to `messages` rather than overwriting — this is how LangGraph accumulates conversation history across nodes.

---

### Phase 4 — Build Leaf Agent Subgraphs

Use `create_react_agent` for agents with straightforward tool loops:

```python
from langgraph.prebuilt import create_react_agent

gmail_graph = create_react_agent(
    model=ChatOpenAI(model="gpt-4o"),
    tools=GMAIL_TOOLS,
    state_modifier=GMAIL_SYSTEM_PROMPT,
)

news_graph = create_react_agent(
    model=ChatOpenAI(model="gpt-4o-mini"),
    tools=NEWS_TOOLS,
    state_modifier=NEWS_SYSTEM_PROMPT,
)
```

`create_react_agent` is LangGraph's prebuilt ReAct loop: LLM node → `ToolNode` → LLM node until no more tool calls.

---

### Phase 5 — Build Planning Subgraph (Custom — Needs Verifier Cycle)

`PlanningAgent` has a retry loop: plan → schedule → verify → if `success=false` → re-plan (once). This requires a real cycle in the graph:

```
planning_llm_node → planning_tools → [verifier_node → verifier_tools → back to planning_llm_node]
```

Build as a separate `StateGraph` with a `retry_count` field in state to enforce the one-retry limit. See the full pseudocode in Section 4.

---

### Phase 6 — Build Orchestrator Node + Routing

Replace SDK `handoffs` with explicit **transfer tools** — `@tool` functions the LLM can call to signal routing intent:

```python
@tool
def transfer_to_gmail() -> str:
    """Transfer control to the Gmail agent for all email operations."""
    return "transfer_to_gmail"

@tool
def transfer_to_planning() -> str:
    """Transfer to PlanningAgent for day planning and scheduling."""
    return "transfer_to_planning"

@tool
def transfer_to_news() -> str:
    """Transfer to AiNewsAgent for top AI industry news."""
    return "transfer_to_news"
```

The conditional edge function inspects the last tool call name and routes accordingly.

---

### Phase 7 — Replace `SQLAlchemySession` with `AsyncPostgresSaver`

```python
# db/connection.py (addition)
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

async def get_checkpointer():
    async with AsyncPostgresSaver.from_conn_string(settings.database_url) as checkpointer:
        await checkpointer.setup()  # creates LangGraph checkpoint tables (run once)
        yield checkpointer
```

In `main.py` lifespan, initialise the checkpointer once and inject into `run_agent`.

---

### Phase 8 — Update `runner.py`

```python
async def run_agent(chat_id: str | int, user_message: str, graph) -> str:
    config = {
        "configurable": {"thread_id": str(chat_id)},
        "recursion_limit": 100,
    }
    state = {
        "messages": [HumanMessage(content=user_message)],
        "chat_id": str(chat_id),
        "active_agent": "orchestrator",
    }
    try:
        result = await graph.ainvoke(state, config=config)
        return _clean_telegram_output(result["messages"][-1].content)
    except GraphRecursionError:
        # Equivalent of corrupted history — start fresh thread
        config["configurable"]["thread_id"] = f"{chat_id}_retry_{int(time.time())}"
        result = await graph.ainvoke(state, config=config)
        return _clean_telegram_output(result["messages"][-1].content)
```

---

### Phase 9 — Update `briefing/runner.py`

Replace `Runner.run(planning_agent, PLANNING_REQUEST)` with:

```python
planning_result = await planning_graph.ainvoke(
    {"messages": [HumanMessage(content=PLANNING_REQUEST)],
     "chat_id": "briefing",
     "active_agent": "planning"},
    config={"recursion_limit": 50},
)
```

No checkpointer needed for the briefing (stateless per run). Keep `client.chat.completions.create` for synthesis as-is, or swap to `ChatOpenAI(...).ainvoke(messages)`.

---

## 4. Hypothetical LangGraph Workflow

```python
# jarvis_agents/graph.py

from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode, create_react_agent
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
import operator

from tools.time_tools import get_current_datetime
from tools.get_personal_info import get_personal_info
from tools.calendar_tools import (
    get_todays_events, get_events_for_date,
    create_calendar_event, update_event_time, delete_event,
)
from tools.task_tools import create_task, list_tasks, complete_task, list_overdue_tasks
from tools.gmail_tools import (
    get_unread_emails, get_email_thread, draft_email,
    send_email, search_emails, archive_email, mark_as_read,
)
from settings.config import settings


# ── State ──────────────────────────────────────────────────────────────────

class JarvisState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    chat_id: str
    active_agent: str


# ── Routing transfer tools (replace SDK `handoffs`) ────────────────────────

@tool
def transfer_to_gmail() -> str:
    """Transfer to GmailAgent for all email operations."""
    return "transfer_to_gmail"

@tool
def transfer_to_news() -> str:
    """Transfer to AiNewsAgent for top AI industry news."""
    return "transfer_to_news"

@tool
def transfer_to_planning() -> str:
    """Transfer to PlanningAgent for day planning and scheduling."""
    return "transfer_to_planning"


# ── Models ─────────────────────────────────────────────────────────────────

orchestrator_llm = ChatOpenAI(model="gpt-4o",      api_key=settings.openai_api_key)
specialist_llm   = ChatOpenAI(model="gpt-4o",      api_key=settings.openai_api_key)
mini_llm         = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key)


# ── Tool lists ─────────────────────────────────────────────────────────────

ORCHESTRATOR_TOOLS = [
    get_current_datetime, get_personal_info,
    # Calendar tools inline (previously CalendarAgent.as_tool())
    get_todays_events, get_events_for_date,
    create_calendar_event, update_event_time, delete_event,
    # Task tools inline (previously TaskAgent.as_tool())
    create_task, list_tasks, complete_task, list_overdue_tasks,
    # Routing (previously handoffs)
    transfer_to_gmail, transfer_to_news, transfer_to_planning,
    # TavilySearchResults() replaces WebSearchTool()
    # TavilySearchResults(max_results=5),
]

GMAIL_TOOLS    = [get_unread_emails, get_email_thread, draft_email,
                  send_email, search_emails, archive_email, mark_as_read]
NEWS_TOOLS     = []  # TavilySearchResults(max_results=5) — add after installing tavily-python
PLANNING_TOOLS = [get_current_datetime, get_todays_events,
                  list_overdue_tasks, list_tasks, create_calendar_event]
VERIFIER_TOOLS = [get_current_datetime, get_todays_events]


# ── Prebuilt ReAct subgraphs for leaf agents ───────────────────────────────

GMAIL_SYSTEM_PROMPT = """
You are Jarvis's Gmail manager. You have full access to the user's Gmail.
Your responsibilities: fetch unread emails, read threads, draft and send replies,
search inbox, archive or mark emails as read. Respond concisely. Plain text only.
"""

NEWS_SYSTEM_PROMPT = """
You are Jarvis's AI news reporter. Fetch the top 3 AI industry news items for today
using the search tool. Summarize conversationally. Plain text only, no citations.
"""

gmail_graph = create_react_agent(specialist_llm, tools=GMAIL_TOOLS,
                                 state_modifier=GMAIL_SYSTEM_PROMPT)
news_graph  = create_react_agent(mini_llm, tools=NEWS_TOOLS,
                                 state_modifier=NEWS_SYSTEM_PROMPT)


# ── Planning subgraph (custom — needs verifier cycle) ─────────────────────

class PlanningState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    retry_count: int  # enforces one-retry limit on verifier failure


def planning_llm_node(state: PlanningState) -> dict:
    llm = mini_llm.bind_tools(PLANNING_TOOLS + VERIFIER_TOOLS)
    response = llm.invoke(state["messages"])
    return {"messages": [response]}


def should_use_tools_or_verify(state: PlanningState) -> str:
    last = state["messages"][-1]
    if not hasattr(last, "tool_calls") or not last.tool_calls:
        return END
    tool_name = last.tool_calls[0]["name"]
    if tool_name in {t.name for t in VERIFIER_TOOLS}:
        return "verifier_tools"
    return "planning_tools"


def should_replan(state: PlanningState) -> str:
    """After verifier tools run, check if we need to re-plan."""
    if state.get("retry_count", 0) >= 1:
        return END  # enforce one-retry limit
    last_content = state["messages"][-1].content
    if '"success": false' in last_content or "'success': False" in last_content:
        return "planning_llm"
    return END


planning_sg = StateGraph(PlanningState)
planning_sg.add_node("planning_llm",    planning_llm_node)
planning_sg.add_node("planning_tools",  ToolNode(PLANNING_TOOLS))
planning_sg.add_node("verifier_tools",  ToolNode(VERIFIER_TOOLS))
planning_sg.set_entry_point("planning_llm")
planning_sg.add_conditional_edges("planning_llm", should_use_tools_or_verify,
    {"planning_tools": "planning_tools", "verifier_tools": "verifier_tools", END: END})
planning_sg.add_edge("planning_tools", "planning_llm")
planning_sg.add_conditional_edges("verifier_tools", should_replan,
    {"planning_llm": "planning_llm", END: END})
planning_graph = planning_sg.compile()


# ── Main orchestrator node ─────────────────────────────────────────────────

ORCHESTRATOR_SYSTEM = f"""
You are Jarvis, a sharp and efficient personal assistant communicating via Telegram.

Capabilities: calendar management, task/TODO management, Gmail operations,
AI news, day planning, weather (via web search), general conversation.

Routing rules:
- Calendar events / schedules / appointments → use calendar tools directly.
- Tasks / TODOs / project work → use task tools directly.
- Gmail / email operations → call transfer_to_gmail.
- AI news → call transfer_to_news.
- Day planning / "plan my day" → call transfer_to_planning.
- Current date/time → call get_current_datetime.
- Om's personal info → call get_personal_info.
- Greetings / general → respond directly.

Personality: concise, direct, friendly. No markdown. No sycophantic openers.
Timezone: {settings.timezone}
"""


def orchestrator_node(state: JarvisState) -> dict:
    llm = orchestrator_llm.bind_tools(ORCHESTRATOR_TOOLS)
    messages = [SystemMessage(content=ORCHESTRATOR_SYSTEM)] + list(state["messages"])
    response = llm.invoke(messages)
    return {"messages": [response], "active_agent": "orchestrator"}


def route_orchestrator(state: JarvisState) -> str:
    last = state["messages"][-1]
    if not hasattr(last, "tool_calls") or not last.tool_calls:
        return END
    tool_name = last.tool_calls[0]["name"]
    routing = {
        "transfer_to_gmail":    "gmail_agent",
        "transfer_to_news":     "news_agent",
        "transfer_to_planning": "planning_agent",
    }
    return routing.get(tool_name, "orchestrator_tools")


# ── Subgraph wrapper nodes ─────────────────────────────────────────────────

async def gmail_agent_node(state: JarvisState) -> dict:
    result = await gmail_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": result["messages"], "active_agent": "gmail"}


async def news_agent_node(state: JarvisState) -> dict:
    result = await news_graph.ainvoke({"messages": list(state["messages"])})
    return {"messages": result["messages"], "active_agent": "news"}


async def planning_agent_node(state: JarvisState) -> dict:
    result = await planning_graph.ainvoke({
        "messages": list(state["messages"]),
        "retry_count": 0,
    })
    return {"messages": result["messages"], "active_agent": "planning"}


# ── Assemble main graph ────────────────────────────────────────────────────

def build_graph(checkpointer: AsyncPostgresSaver):
    builder = StateGraph(JarvisState)

    builder.add_node("orchestrator",       orchestrator_node)
    builder.add_node("orchestrator_tools", ToolNode(ORCHESTRATOR_TOOLS))
    builder.add_node("gmail_agent",        gmail_agent_node)
    builder.add_node("news_agent",         news_agent_node)
    builder.add_node("planning_agent",     planning_agent_node)

    builder.set_entry_point("orchestrator")

    builder.add_conditional_edges("orchestrator", route_orchestrator, {
        "orchestrator_tools": "orchestrator_tools",
        "gmail_agent":        "gmail_agent",
        "news_agent":         "news_agent",
        "planning_agent":     "planning_agent",
        END:                  END,
    })
    builder.add_edge("orchestrator_tools", "orchestrator")  # tool results → back to LLM
    builder.add_edge("gmail_agent",        END)
    builder.add_edge("news_agent",         END)
    builder.add_edge("planning_agent",     END)

    return builder.compile(checkpointer=checkpointer)


# ── Updated runner.py sketch ───────────────────────────────────────────────

import re
import time
from langchain_core.messages import HumanMessage
from langgraph.errors import GraphRecursionError


def _clean_telegram_output(text: str) -> str:
    text = re.sub(r"【[^】]+】", "", text)
    text = text.replace("**", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


async def run_agent(chat_id: str | int, user_message: str, graph) -> str:
    config = {
        "configurable": {"thread_id": str(chat_id)},
        "recursion_limit": 100,
    }
    state = {
        "messages":     [HumanMessage(content=user_message)],
        "chat_id":      str(chat_id),
        "active_agent": "orchestrator",
    }
    try:
        result = await graph.ainvoke(state, config=config)
        return _clean_telegram_output(result["messages"][-1].content)
    except GraphRecursionError:
        # Equivalent of corrupted history — switch to a fresh thread
        config["configurable"]["thread_id"] = f"{chat_id}_retry_{int(time.time())}"
        result = await graph.ainvoke(state, config=config)
        return _clean_telegram_output(result["messages"][-1].content)
```

---

## 5. Risks & Gotchas

### `agent.as_tool()` has no direct LangGraph equivalent
The SDK's `as_tool()` runs a full sub-agent (with its own LLM ReAct loop) as a single tool invocation. LangGraph has no built-in equivalent. The recommended approach (used above) is to promote sub-agents to proper nodes/subgraphs and use routing. This means the orchestrator can no longer call `CalendarAgent` mid-turn as a tool — calendar actions become direct tool calls within the orchestrator's own `ToolNode`. This is actually cleaner and avoids the extra LLM hop.

### `handoffs` pass full conversation context automatically — LangGraph does not
In the SDK, handoffs transfer the full conversation history transparently. With conditional edges, you control this explicitly by passing `state["messages"]` into each subgraph (as shown above). Ensure each subgraph node prepends its own system prompt internally — don't rely on the outer graph's system message.

### `SQLAlchemySession` vs `AsyncPostgresSaver` — schema mismatch
The SDK stores messages in its own schema. `AsyncPostgresSaver` uses different tables (`checkpoints`, `checkpoint_writes`, etc.). **Existing conversation history will not migrate.** Users will lose prior context on cutover. Plan for a hard cutover date.

### `SessionSettings(limit=100)` trimming is not automatic
You must add explicit message trimming. Use LangGraph's `trim_messages()` utility in the orchestrator node before the LLM call, or implement a custom state reducer that drops older messages beyond a threshold:

```python
from langchain_core.messages import trim_messages

def orchestrator_node(state: JarvisState) -> dict:
    trimmed = trim_messages(state["messages"], max_tokens=8000, strategy="last",
                            token_counter=orchestrator_llm)
    ...
```

Without this, long conversations will eventually exceed the model's context window.

### `BadRequestError` / corrupted history retry
`runner.py` catches `BadRequestError` and calls `session.clear_session()`. In LangGraph the equivalent is starting a fresh `thread_id` (as shown in Phase 8) or deleting the thread's checkpoints via `checkpointer.adelete_thread(thread_id)`. Neither is as seamless as the SDK's method — the user loses prior context on reset.

### PlanningAgent verifier retry loop requires a state counter
`PlanningAgent`'s instructions say "at most one re-plan pass." In the SDK this is a prompt-level constraint the LLM may or may not honour. In LangGraph you enforce it with `retry_count` in `PlanningState` (shown above) — this is actually more reliable.

### `WebSearchTool()` is OpenAI-SDK-specific
Replace with `TavilySearchResults` (requires `TAVILY_API_KEY` env var) or `DuckDuckGoSearchRun` from `langchain-community` (free, no key). This affects both the orchestrator and `AiNewsAgent`.

### `get_personal_info` uses Responses API file_search
`tools/get_personal_info.py` calls `AsyncOpenAI().responses.create` with `file_search` and `vector_store_ids`. This is OpenAI-specific but does **not** depend on `openai-agents` — it uses the base `openai` package directly. No change needed; just update the `@function_tool` decorator to `@tool`.

### APScheduler is unaffected
`scheduler.py` uses `AsyncIOScheduler` — this is unchanged. `send_morning_briefing()` just needs `Runner.run()` replaced with `planning_graph.ainvoke()`. Everything else in `briefing/runner.py` (retry logic, `chat.completions.create`, `send_message`) stays the same.

### `/chat` (Responses API) is architecturally separate
`main.py`'s `/chat` endpoint uses `openai_client.responses.create()` with `previous_response_id` chaining. This has zero overlap with the Agents SDK stack. **Do not migrate this** — it can coexist with a LangGraph Telegram stack indefinitely.

---

## 6. File Change Summary

| File | Change |
|---|---|
| `requirements.txt` | Add `langgraph`, `langchain-openai`, `langchain-core`, `langgraph-checkpoint-postgres`, `tavily-python`; remove `openai-agents` |
| `tools/*.py` | `@function_tool` → `@tool`; remove `RunContextWrapper` usage |
| `jarvis_agents/state.py` | **New** — `JarvisState` TypedDict |
| `jarvis_agents/graph.py` | **New** — full graph definition (replaces `orchestrator.py`, `*_agent.py`) |
| `jarvis_agents/runner.py` | Replace `Runner.run` + `SQLAlchemySession` with `graph.ainvoke` + checkpointer config |
| `jarvis_agents/orchestrator.py` | Absorbed into `graph.py` — delete after migration |
| `jarvis_agents/*_agent.py` | Absorbed into `graph.py` — delete after migration |
| `db/connection.py` | Add `get_checkpointer()` async context manager |
| `main.py` | Initialise checkpointer in lifespan; pass `graph` into `run_agent` |
| `briefing/runner.py` | Replace `Runner.run(planning_agent, ...)` with `planning_graph.ainvoke(...)` |
| `scheduler.py` | No change |
| `integrations/*.py` | No change |
| `settings/config.py` | Add `tavily_api_key` field if using Tavily |
