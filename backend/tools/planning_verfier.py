from __future__ import annotations

from typing import Any

from langchain_core.tools import tool

from tools.calendar_tools import get_todays_events


def _normalize_title(value: str) -> str:
    return (value or "").strip().lower()


def _extract_blocks(payload: list[dict[str, Any]]) -> list[dict[str, str]]:
    blocks: list[dict[str, str]] = []
    for item in payload:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", "")).strip()
        start_iso = str(item.get("start_iso", "")).strip()
        end_iso = str(item.get("end_iso", "")).strip()
        if title and start_iso and end_iso:
            blocks.append({"title": title, "start_iso": start_iso, "end_iso": end_iso})
    return blocks


@tool
def planning_verifier_tool(date: str, scheduled_blocks: list[dict[str, Any]]) -> dict:
    """
    Verify that planned blocks were actually written to today's calendar.

    Args:
        date: Plan date in YYYY-MM-DD.
        scheduled_blocks: List of objects with keys title, start_iso, end_iso.
    """
    planned = _extract_blocks(scheduled_blocks)
    calendar_result = get_todays_events.invoke({})
    if not isinstance(calendar_result, dict):
        return {
            "success": False,
            "missing_blocks": [b["title"] for b in planned],
            "notes": "Calendar verification failed: invalid calendar payload.",
        }

    calendar_events = calendar_result.get("events", []) or []
    indexed = {
        (_normalize_title(e.get("title", "")), e.get("start_iso", ""), e.get("end_iso", "")): True
        for e in calendar_events
        if isinstance(e, dict)
    }

    missing: list[str] = []
    for block in planned:
        key = (_normalize_title(block["title"]), block["start_iso"], block["end_iso"])
        if key not in indexed:
            missing.append(block["title"])

    return {
        "success": len(missing) == 0,
        "missing_blocks": missing,
        "notes": f"Verified {len(planned) - len(missing)}/{len(planned)} planned blocks for {date}.",
    }
