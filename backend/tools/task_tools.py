from datetime import date
from typing import Optional
import logging

from langchain_core.tools import tool

from db.supabase_client import get_client
from integrations.notion import sync_task_to_notion

logger = logging.getLogger(__name__)

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


def _normalize_task(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "project": row.get("project"),
        "description": row.get("description"),
        "priority": row.get("priority"),
        "status": row.get("status"),
        "due_date": row.get("due_date"),
    }


# ---------------------------------------------------------------------------
# Raw async helpers — used by both function_tools and briefing/runner.py
# ---------------------------------------------------------------------------

async def _create_task(project: str, description: str, priority: str = "normal", due_date: Optional[str] = None) -> str:
    result = await _create_task_structured(project, description, priority, due_date)
    if not result["success"]:
        return result["message"]

    task_id = result["task"]["id"]
    due_str = f", due {due_date}" if due_date else ""
    return f"✅ Task #{task_id} created [{project} / {priority}]{due_str}: {description}"


async def _create_task_structured(
    project: str,
    description: str,
    priority: str = "normal",
    due_date: Optional[str] = None,
) -> dict:
    if project not in VALID_PROJECTS:
        return {
            "success": False,
            "error_code": "INVALID_PROJECT",
            "message": f"Invalid project '{project}'. Must be one of: {', '.join(sorted(VALID_PROJECTS))}.",
            "valid_projects": sorted(VALID_PROJECTS),
        }
    if priority not in VALID_PRIORITIES:
        return {
            "success": False,
            "error_code": "INVALID_PRIORITY",
            "message": f"Invalid priority '{priority}'. Must be one of: low, normal, high.",
            "valid_priorities": sorted(VALID_PRIORITIES),
        }
    if due_date:
        try:
            date.fromisoformat(due_date)
        except ValueError:
            return {
                "success": False,
                "error_code": "INVALID_DUE_DATE",
                "message": f"Invalid due_date '{due_date}'. Use YYYY-MM-DD format.",
                "due_date": due_date,
            }

    client = await get_client()
    payload = {"project": project, "description": description, "priority": priority}
    if due_date:
        payload["due_date"] = due_date

    result = await client.table("tasks").insert(payload).execute()
    task = result.data[0]
    task_id = task["id"]

    try:
        sync_task_to_notion(task)
    except Exception as e:
        logger.warning(f"Failed to sync task #{task_id} to Notion: {e}")

    return {
        "success": True,
        "action": "create",
        "task": _normalize_task(task),
    }


async def _list_tasks(project: Optional[str] = None, status: str = "open", due_date: Optional[str] = None) -> str:
    result = await _list_tasks_structured(project, status, due_date)
    if not result["success"]:
        return result["message"]

    rows = result["tasks"]
    if not rows:
        scope = f"[{project}]" if project else "all projects"
        return f"No {status} tasks for {scope}."

    scope_label = f"[{project}]" if project else "all projects"
    lines = [f"📋 {status.capitalize()} tasks — {scope_label}:"]
    lines += [_fmt_task(r) for r in rows]
    return "\n".join(lines)


async def _list_tasks_structured(
    project: Optional[str] = None, status: str = "open", due_date: Optional[str] = None
) -> dict:
    if status not in VALID_STATUSES:
        return {
            "success": False,
            "error_code": "INVALID_STATUS",
            "message": f"Invalid status '{status}'. Must be one of: open, done, cancelled.",
            "valid_statuses": sorted(VALID_STATUSES),
        }
    if due_date:
        try:
            date.fromisoformat(due_date)
        except ValueError:
            return {
                "success": False,
                "error_code": "INVALID_DUE_DATE",
                "message": f"Invalid due_date '{due_date}'. Use YYYY-MM-DD format.",
                "due_date": due_date,
            }

    client = await get_client()
    query = (
        client.table("tasks")
        .select("id, project, description, priority, status, due_date")
        .eq("status", status)
    )
    if project:
        query = query.eq("project", project)
    if due_date:
        query = query.eq("due_date", due_date)
    result = await query.execute()
    rows = _sort_tasks(result.data)

    return {
        "success": True,
        "status_filter": status,
        "project_filter": project,
        "due_date_filter": due_date,
        "count": len(rows),
        "tasks": [_normalize_task(r) for r in rows],
    }


async def _complete_task(task_id: int) -> str:
    result = await _complete_task_structured(task_id)
    if not result["success"]:
        return result["message"]
    task = result["task"]
    return f"✅ Task #{task_id} [{task['project']}] marked done: {task['description']}"


async def _complete_task_structured(task_id: int) -> dict:
    client = await get_client()
    result = (
        await client.table("tasks")
        .update({"status": "done"})
        .eq("id", task_id)
        .eq("status", "open")
        .execute()
    )

    if not result.data:
        return {
            "success": False,
            "error_code": "TASK_NOT_OPEN",
            "message": f"Task #{task_id} not found or already closed.",
            "task_id": task_id,
        }

    task = result.data[0]
    
    try:
        sync_task_to_notion(task)
    except Exception as e:
        logger.warning(f"Failed to sync task #{task_id} completion to Notion: {e}")

    return {
        "success": True,
        "action": "complete",
        "task": _normalize_task(task),
    }


async def _list_overdue_tasks() -> str:
    result = await _list_overdue_tasks_structured()
    if not result["success"]:
        return result["message"]
    rows = result["tasks"]
    if not rows:
        return "No overdue tasks."
    lines = ["⚠️ Overdue tasks:"]
    for row in rows:
        icon = PRIORITY_ICON.get(row["priority"], "")
        lines.append(f"  #{row['id']} {icon} [{row['project']}] {row['description']} (was due {row['due_date']})")
    return "\n".join(lines)


async def _list_overdue_tasks_structured() -> dict:
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

    return {
        "success": True,
        "date": today,
        "count": len(rows),
        "tasks": [_normalize_task(r) for r in rows],
    }


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

@tool
async def create_task(
    project: str,
    description: str,
    priority: str = "normal",
    due_date: Optional[str] = None,
) -> dict:
    """
    Creates a new task in the task tracker.

    Args:
        project: Project tag. Must be one of: Jarvis, Charlotte, Heelper, Startup, Research, UNC.
        description: What needs to be done.
        priority: Task priority — low, normal, or high. Defaults to normal.
        due_date: Optional due date in YYYY-MM-DD format.

    Returns a structured result with success/error and task details.
    """
    return await _create_task_structured(project, description, priority, due_date)


@tool
async def list_tasks(project: Optional[str] = None, status: str = "open", due_date: Optional[str] = None) -> dict:
    """
    Lists tasks, optionally filtered by project and/or status and/or due date.

    Args:
        project: Optional project filter (Jarvis, Charlotte, Heelper, Startup, Research, UNC).
                 Omit to list tasks across all projects.
        status: Filter by status — open, done, or cancelled. Defaults to open.
        due_date: Optional due date in YYYY-MM-DD format.
        Omit to list tasks across all due dates.
    Returns a structured result with deterministic task entries.
    """
    return await _list_tasks_structured(project, status, due_date)


@tool
async def complete_task(task_id: int) -> dict:
    """
    Marks a task as done.

    Args:
        task_id: The numeric ID of the task to mark complete.

    Returns a structured success/error result.
    """
    return await _complete_task_structured(task_id)


@tool
async def list_overdue_tasks() -> dict:
    """
    Returns all open tasks whose due date is strictly before today.
    Use this during the morning briefing or when the user asks about overdue work.
    """
    return await _list_overdue_tasks_structured()

TASK_TOOLS = [
    create_task,
    list_tasks,
    complete_task,
    list_overdue_tasks,
]