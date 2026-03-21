from datetime import datetime, timedelta, timezone
import pytz
from googleapiclient.discovery import build
from agents import function_tool
from integrations.google_auth import get_calendar_credentials
from settings.config import settings

CALENDAR_ID = "fb99434f2a7786e7e3a03319f0d9d33069ea1d0093a28d1d9574a7b8bb17277d@group.calendar.google.com"

_calendar_service = None

def _get_service():
    """Returns the Google Calendar service, building it only once."""
    global _calendar_service
    if _calendar_service is None:
        creds = get_calendar_credentials()
        # The service object handles token refreshing automatically
        _calendar_service = build("calendar", "v3", credentials=creds)
    return _calendar_service

def _local_tz():
    return pytz.timezone(settings.timezone)

@function_tool
def get_todays_events() -> str:
    """
    Returns all of the user's Google Calendar events for today,
    formatted as a readable list. Use this when the user asks what's
    on their calendar today or what their schedule looks like.
    """
    tz = _local_tz()
    now = datetime.now(tz)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)

    service = _get_service()
    result = service.events().list(
        calendarId=CALENDAR_ID,
        timeMin=start_of_day.isoformat(),
        timeMax=end_of_day.isoformat(),
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    events = result.get("items", [])
    if not events:
        return "No events scheduled for today."

    lines = [f"📅 Events for {now.strftime('%A, %B %d')}:"]
    for event in events:
        start = event["start"].get("dateTime", event["start"].get("date"))
        summary = event.get("summary", "Untitled")

        # Format time if it's a datetime (not all-day)
        if "T" in start:
            dt = datetime.fromisoformat(start).astimezone(tz)
            time_str = dt.strftime("%-I:%M %p")
        else:
            time_str = "All day"

        location = event.get("location", "")
        loc_str = f" @ {location}" if location else ""
        lines.append(f"  • {time_str} — {summary}{loc_str}")

    return "\n".join(lines)

@function_tool
def get_events_for_date(date_str: str) -> str:
    """
    Returns calendar events for a specific date.
    date_str must be in YYYY-MM-DD format (e.g., '2025-04-10').
    Use this when the user asks about a day other than today.
    """
    tz = _local_tz()
    naive_target = datetime.strptime(date_str, "%Y-%m-%d")
    # With pytz, use localize() instead of replace(tzinfo=...) to avoid incorrect offsets.
    target = tz.localize(naive_target)
    start = target.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)

    service = _get_service()
    result = service.events().list(
        calendarId=CALENDAR_ID,
        timeMin=start.isoformat(),
        timeMax=end.isoformat(),
        timeZone=settings.timezone,
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    events = result.get("items", [])
    if not events:
        return f"No events scheduled for {target.strftime('%A, %B %d')}."

    lines = [f"📅 Events for {target.strftime('%A, %B %d')}:"]
    for event in events:
        start_raw = event["start"].get("dateTime", event["start"].get("date"))
        summary = event.get("summary", "Untitled")
        if "T" in start_raw:
            dt = datetime.fromisoformat(start_raw).astimezone(tz)
            time_str = dt.strftime("%-I:%M %p")
        else:
            time_str = "All day"
        lines.append(f"  • {time_str} — {summary}")

    return "\n".join(lines)

@function_tool
def create_calendar_event(title: str, start_iso: str, duration_minutes: int = 60) -> str:
    """
    Creates a new event on the user's Google Calendar.

    IMPORTANT: Before calling this, you MUST know the current date/time.
    Call get_current_datetime() first if you haven't already in this conversation turn.

    Args:
        title: The name of the event (e.g., 'Dentist appointment').
        start_iso: The start time in ISO 8601 format including timezone offset,
                   e.g., '2025-04-10T15:00:00-04:00'. The YEAR MUST be correct
                   (currently 2026). Derive this from the user's message and
                   their local timezone.
        duration_minutes: Length of the event in minutes. Default is 60.

    Returns a confirmation string with the event title and time.
    """
    tz = _local_tz()
    now = datetime.now(tz)
    start_dt = datetime.fromisoformat(start_iso).astimezone(tz)
    
    # Reject events more than 1 hour in the past
    if start_dt < now - timedelta(hours=1):
        return (
            f"❌ Cannot create event in the past.\n"
            f"   You tried to create an event for: {start_dt.strftime('%A, %B %d, %Y at %-I:%M %p')}\n"
            f"   Current date/time is: {now.strftime('%A, %B %d, %Y at %-I:%M %p')}\n"
            f"   Please use the correct date. Today is {now.strftime('%Y-%m-%d')}."
        )
    
    end_dt = start_dt + timedelta(minutes=duration_minutes)

    service = _get_service()
    event = service.events().insert(
        calendarId=CALENDAR_ID,
        body={
            "summary": title,
            "start": {"dateTime": start_dt.isoformat(), "timeZone": settings.timezone},
            "end": {"dateTime": end_dt.isoformat(), "timeZone": settings.timezone},
        }
    ).execute()

    link = event.get("htmlLink", "")
    return (
        f"✅ Created: '{title}'\n"
        f"   {start_dt.strftime('%A, %B %d, %Y at %-I:%M %p')} "
        f"({duration_minutes} min)\n"
        f"   {link}"
    )

@function_tool
def update_event_time(event_title_hint: str, new_start_iso: str, duration_minutes: int = 60) -> str:
    """
    Moves an existing calendar event to a new time.
    Searches for the event by title (case-insensitive partial match) within
    the next 7 days, then updates its start and end time.

    IMPORTANT: Call get_current_datetime() first to know the current date.

    Args:
        event_title_hint: Part of the event title to search for.
        new_start_iso: New start time in ISO 8601 format with timezone offset.
                       The YEAR MUST be correct (currently 2026).
        duration_minutes: New duration in minutes. Defaults to 60.
    """
    tz = _local_tz()
    now = datetime.now(tz)
    
    new_start = datetime.fromisoformat(new_start_iso).astimezone(tz)
    
    # Reject rescheduling to more than 1 hour in the past
    if new_start < now - timedelta(hours=1):
        return (
            f"❌ Cannot reschedule event to the past.\n"
            f"   You tried to reschedule to: {new_start.strftime('%A, %B %d, %Y at %-I:%M %p')}\n"
            f"   Current date/time is: {now.strftime('%A, %B %d, %Y at %-I:%M %p')}\n"
            f"   Please use the correct date. Today is {now.strftime('%Y-%m-%d')}."
        )
    
    search_end = now + timedelta(days=7)

    service = _get_service()
    result = service.events().list(
        calendarId=CALENDAR_ID,
        timeMin=now.isoformat(),
        timeMax=search_end.isoformat(),
        singleEvents=True,
        orderBy="startTime",
        q=event_title_hint  # Google's full-text search
    ).execute()

    events = result.get("items", [])
    if not events:
        return f"No upcoming event found matching '{event_title_hint}'."

    # Take the first match
    event = events[0]
    event_id = event["id"]
    old_title = event.get("summary", "Untitled")

    new_end = new_start + timedelta(minutes=duration_minutes)

    event["start"] = {"dateTime": new_start.isoformat(), "timeZone": settings.timezone}
    event["end"] = {"dateTime": new_end.isoformat(), "timeZone": settings.timezone}

    service.events().update(
        calendarId=CALENDAR_ID,
        eventId=event_id,
        body=event
    ).execute()

    return (
        f"✅ Moved '{old_title}' to "
        f"{new_start.strftime('%A, %B %d, %Y at %-I:%M %p')}."
    )

@function_tool
def delete_event(event_title_hint: str) -> str:
    """
    Deletes an upcoming calendar event matching the given title hint.
    Searches within the next 7 days.

    Args:
        event_title_hint: Part of the event title to search for.
    """
    tz = _local_tz()
    now = datetime.now(tz)
    search_end = now + timedelta(days=7)

    service = _get_service()
    result = service.events().list(
        calendarId=CALENDAR_ID,
        timeMin=now.isoformat(),
        timeMax=search_end.isoformat(),
        singleEvents=True,
        q=event_title_hint
    ).execute()

    events = result.get("items", [])
    if not events:
        return f"No upcoming event found matching '{event_title_hint}'."

    event = events[0]
    title = event.get("summary", "Untitled")
    service.events().delete(calendarId=CALENDAR_ID, eventId=event["id"]).execute()

    return f"🗑️ Deleted event: '{title}'."