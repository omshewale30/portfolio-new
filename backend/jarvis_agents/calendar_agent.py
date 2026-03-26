from agents import Agent
from settings.config import settings
from pydantic import BaseModel, Field
from tools.calendar_tools import (
    get_todays_events,
    get_events_for_date,
    create_calendar_event,
    update_event_time,
    delete_event,
)
from tools.time_tools import get_current_datetime

calendar_agent = Agent(
    name="CalendarAgent",
    instructions=f"""
You are Jarvis's calendar manager. You have full access to the user's Google Calendar.
User timezone: {settings.timezone}

Your responsibilities:
- Read events for today or any specific date
- Create new calendar events from natural language descriptions
- Move or reschedule existing events
- Delete events on request

CRITICAL DATE/TIME RULES:
1. ALWAYS call get_current_datetime() FIRST before creating or updating any event.
   You do NOT know the current date from memory - you MUST use the tool.
2. The current year is 2026. Never use dates from 2024 or 2025.
3. After calling get_current_datetime(), use the returned `now_iso` and `today` values
   to compute the correct date for the user's request.
4. Double-check: if the user says "today" or "tomorrow", verify your computed date
   matches what get_current_datetime() returned.

Other rules:
- When creating events, derive a precise ISO 8601 datetime with timezone offset.
  If the user says "3 PM tomorrow", first get today's date, then add one day.
- When updating events, search by title hint. If multiple match, pick the soonest.
- If an operation succeeds, confirm with the ACTUAL date you created it for.
- Never invent events. If you can't find a match, say so.
- Respond concisely. No markdown formatting.
""",
    tools=[
        get_current_datetime,
        get_todays_events,
        get_events_for_date,
        create_calendar_event,
        update_event_time,
        delete_event,
    ],
)

class CalendarActionInput(BaseModel):
    action: str = Field(description="read_today or create or update or delete")
    title: str | None = None
    start_iso: str | None = None
    end_iso: str | None = None

calendar_tool = calendar_agent.as_tool(tool_name="calendar_tool",
tool_description="Handles all Google Calendar operations: reading, creating, updating, and deleting events.",
 parameters=CalendarActionInput,
 include_input_schema=True)