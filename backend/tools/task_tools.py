from datetime import date
from typing import Optional

from agents import function_tool

from db.supabase_client import get_client

VALID_PROJECTS = {"Jarvis", "Charlotte", "Heelper", "Startup", "Research", "UNC"}
VALID_PRIORITIES = {"low", "normal", "high"}
VALID_STATUSES = {"open", "done", "cancelled"}
PRIORITY_ICON = {"high": "🔴", "normal": "🟡", "low": "🟢"}
PRIORITY_ORDER = {"high": 1, "normal": 2, "low": 3}


def _fmt_task(row: dict, show_due: bool = True) -> str:
    icon = PRIORITY_ICON.get(row["priority"], "")
    due_str = f" (due {row['due_date']})" if show_due and row.get("due_date") else ""
    return f"  #{row['id']} {icon} [{row['project']}] {row['description']}{due_str}"


def _sort_tasks(rows: list[dict]) -> list[dict]:
    return sorted(rows, key=lambda r: (PRIORITY_ORDER.get(r["priority"], 2), r.get("due_date") or "9999", r["id"]))


# ---------------------------------------------------------------------------
# Raw async helpers — used by both function_tools and briefing/runner.py
# ---------------------------------------------------------------------------

async def _create_task(
    project: str,
    description: str,
    priority: str = "normal",
    due_date: Optional[str] = None,
) -> str:
    if project not in VALID_PROJECTS:
        return f"Invalid project '{project}'. Must be one of: {', '.join(sorted(VALID_PROJECTS))}."
    if priority not in VALID_PRIORITIES:
        return f"Invalid priority '{priority}'. Must be one of: low, normal, high."
    if due_date:
        try:
            date.fromisoformat(due_date)
        except ValueError:
            return f"Invalid due_date '{due_date}'. Use YYYY-MM-DD format."

    client = await get_client()
    payload = {"project": project, "description": description, "priority": priority}
    if due_date:
        payload["due_date"] = due_date

    result = await client.table("tasks").insert(payload).execute()
    task_id = result.data[0]["id"]

    due_str = f", due {due_date}" if due_date else ""
    return f"✅ Task #{task_id} created [{project} / {priority}]{due_str}: {description}"


async def _list_tasks(project: Optional[str] = None, status: str = "open") -> str:
    if status not in VALID_STATUSES:
        return f"Invalid status '{status}'. Must be one of: open, done, cancelled."

    client = await get_client()
    query = client.table("tasks").select("id, project, description, priority, due_date").eq("status", status)
    if project:
        query = query.eq("project", project)

    result = await query.execute()
    rows = _sort_tasks(result.data)

    if not rows:
        scope = f"[{project}]" if project else "all projects"
        return f"No {status} tasks for {scope}."

    scope_label = f"[{project}]" if project else "all projects"
    lines = [f"📋 {status.capitalize()} tasks — {scope_label}:"]
    lines += [_fmt_task(r) for r in rows]
    return "\n".join(lines)


async def _complete_task(task_id: int) -> str:
    client = await get_client()
    result = (
        await client.table("tasks")
        .update({"status": "done"})
        .eq("id", task_id)
        .eq("status", "open")
        .execute()
    )

    if not result.data:
        return f"Task #{task_id} not found or already closed."

    row = result.data[0]
    return f"✅ Task #{task_id} [{row['project']}] marked done: {row['description']}"


async def _list_overdue_tasks() -> str:
    today = date.today().isoformat()

    client = await get_client()
    result = (
        await client.table("tasks")
        .select("id, project, description, priority, due_date")
        .eq("status", "open")
        .lt("due_date", today)
        .order("due_date")
        .execute()
    )
    rows = result.data

    if not rows:
        return "No overdue tasks."

    lines = ["⚠️ Overdue tasks:"]
    for row in rows:
        icon = PRIORITY_ICON.get(row["priority"], "")
        lines.append(f"  #{row['id']} {icon} [{row['project']}] {row['description']} (was due {row['due_date']})")
    return "\n".join(lines)


async def _list_due_today_tasks() -> str:
    today = date.today().isoformat()

    client = await get_client()
    result = (
        await client.table("tasks")
        .select("id, project, description, priority")
        .eq("status", "open")
        .eq("due_date", today)
        .execute()
    )
    rows = _sort_tasks(result.data)

    if not rows:
        return "No tasks due today."

    lines = ["📌 Tasks due today:"]
    lines += [_fmt_task(r, show_due=False) for r in rows]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# function_tool wrappers for the agents SDK
# ---------------------------------------------------------------------------

@function_tool
async def create_task(
    project: str,
    description: str,
    priority: str = "normal",
    due_date: Optional[str] = None,
) -> str:
    """
    Creates a new task in the task tracker.

    Args:
        project: Project tag. Must be one of: Jarvis, Charlotte, Heelper, Startup, Research, UNC.
        description: What needs to be done.
        priority: Task priority — low, normal, or high. Defaults to normal.
        due_date: Optional due date in YYYY-MM-DD format.

    Returns a confirmation with the new task ID.
    """
    return await _create_task(project, description, priority, due_date)


@function_tool
async def list_tasks(project: Optional[str] = None, status: str = "open") -> str:
    """
    Lists tasks, optionally filtered by project and/or status.

    Args:
        project: Optional project filter (Jarvis, Charlotte, Heelper, Startup, Research, UNC).
                 Omit to list tasks across all projects.
        status: Filter by status — open, done, or cancelled. Defaults to open.

    Returns a formatted list of matching tasks.
    """
    return await _list_tasks(project, status)


@function_tool
async def complete_task(task_id: int) -> str:
    """
    Marks a task as done.

    Args:
        task_id: The numeric ID of the task to mark complete.

    Returns a confirmation or an error if the task was not found.
    """
    return await _complete_task(task_id)


@function_tool
async def list_overdue_tasks() -> str:
    """
    Returns all open tasks whose due date is strictly before today.
    Use this during the morning briefing or when the user asks about overdue work.
    """
    return await _list_overdue_tasks()
