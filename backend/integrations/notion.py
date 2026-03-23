from notion_client import Client

from settings.config import settings

notion = Client(auth=settings.notion_api_key)
NOTION_DATABASE_ID = settings.notion_data_source_id


def notion_props(task):
    return {
        "Name": {
            "title": [{"text": {"content": task["description"]}}]
        },
        "Project": {"select": {"name": task["project"]}},
        "Priority": {"select": {"name": task["priority"]}},
        "Status": {"status": {"name": task["status"]}},
        "Due Date": {"date": {"start": task["due_date"]}} if task.get("due_date") else {"date": None},
        "Task ID": {"number": task["id"]},
    }


def _query_tasks_by_id(task_id: int) -> dict:
    """
    Query Notion for pages matching a task ID.
    Supports both legacy databases API and newer data sources API.
    """
    task_filter = {"property": "Task ID", "number": {"equals": task_id}}

    if hasattr(notion, "data_sources") and hasattr(notion.data_sources, "query"):
        return notion.data_sources.query(
            data_source_id=NOTION_DATABASE_ID,
            filter=task_filter,
        )

    if hasattr(notion, "databases") and hasattr(notion.databases, "query"):
        return notion.databases.query(
            database_id=NOTION_DATABASE_ID,
            filter=task_filter,
        )

    raise RuntimeError("Notion client does not support querying data sources or databases.")


def _create_task_page(properties: dict) -> dict:
    """Create a task page in Notion using the available parent type."""
    if hasattr(notion, "data_sources"):
        return notion.pages.create(
            parent={"data_source_id": NOTION_DATABASE_ID},
            properties=properties,
        )

    return notion.pages.create(
        parent={"database_id": NOTION_DATABASE_ID},
        properties=properties,
    )


def find_notion_page_by_task_id(task_id: int) -> str | None:
    """Find a Notion page by Task ID property. Returns page_id or None."""
    results = _query_tasks_by_id(task_id)
    pages = results.get("results", [])
    return pages[0]["id"] if pages else None


def sync_task_to_notion(task: dict) -> dict:
    """
    Sync a task to Notion. Creates a new page or updates existing one.
    
    Args:
        task: dict with id, description, project, priority, status, due_date
    
    Returns:
        Notion API response
    """
    notion_page_id = find_notion_page_by_task_id(task["id"])
    
    if notion_page_id:
        return notion.pages.update(
            page_id=notion_page_id,
            properties=notion_props(task)
        )
    return _create_task_page(notion_props(task))
