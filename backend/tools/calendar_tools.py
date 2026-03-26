from datetime import datetime, timedelta
import logging
import ssl
import time
from socket import timeout as SocketTimeout
import pytz
from googleapiclient.discovery import build
from agents import function_tool
from integrations.google_auth import get_calendar_credentials
from settings.config import settings

CALENDAR_ID = "fb99434f2a7786e7e3a03319f0d9d33069ea1d0093a28d1d9574a7b8bb17277d@group.calendar.google.com"

_calendar_service = None
logger = logging.getLogger(__name__)

def _get_service():
    """Returns the Google Calendar service, building it only once."""
    global _calendar_service
    if _calendar_service is None:
        creds = get_calendar_credentials()
        # Disable discovery file cache to avoid oauth2client file_cache path.
        # This also removes the discovery_cache warning seen before local crashes.
        _calendar_service = build(
            "calendar",
            "v3",
            credentials=creds,
            cache_discovery=False,
        )
    return _calendar_service

def _local_tz():
    return pytz.timezone(settings.timezone)


def _execute_with_retry(request_factory, action: str, attempts: int = 3):
    """
    Execute a Google API request with a small retry budget for transient TLS/network errors.
    Rebuilds the cached service between attempts to avoid stale underlying connections.
    """
    global _calendar_service
    for attempt in range(1, attempts + 1):
        try:
            return request_factory().execute(num_retries=2)
        except (ssl.SSLError, ConnectionResetError, TimeoutError, SocketTimeout) as exc:
            if attempt == attempts:
                raise
            logger.warning(
                "Transient transport error during %s (attempt %s/%s): %s",
                action,
                attempt,
                attempts,
                exc,
            )
            _calendar_service = None
            time.sleep(min(2 ** attempt, 5))


def _parse_google_datetime(value: str) -> datetime:
    """Parse Google datetime strings, including trailing Z."""
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _normalize_event(event: dict, tz) -> dict:
    """Return deterministic structured event shape for agent consumption."""
    start_raw = event.get("start", {}).get("dateTime") or event.get("start", {}).get("date")
    end_raw = event.get("end", {}).get("dateTime") or event.get("end", {}).get("date")
    is_all_day = "date" in event.get("start", {})

    if is_all_day:
        start_local = tz.localize(datetime.strptime(start_raw, "%Y-%m-%d"))
        end_local = tz.localize(datetime.strptime(end_raw, "%Y-%m-%d"))
        start_iso = start_local.isoformat()
        end_iso = end_local.isoformat()
    else:
        start_iso = _parse_google_datetime(start_raw).astimezone(tz).isoformat()
        end_iso = _parse_google_datetime(end_raw).astimezone(tz).isoformat()

    return {
        "id": event.get("id"),
        "title": event.get("summary", "Untitled"),
        "start_iso": start_iso,
        "end_iso": end_iso,
        "is_all_day": is_all_day,
        "location": event.get("location"),
        "html_link": event.get("htmlLink"),
    }

@function_tool
def get_todays_events() -> dict:
    """
    Returns today's calendar events in a deterministic structured format.
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
    normalized = [_normalize_event(event, tz) for event in events]

    return {
        "success": True,
        "date": now.strftime("%Y-%m-%d"),
        "timezone": settings.timezone,
        "count": len(normalized),
        "events": normalized,
    }

@function_tool
def get_events_for_date(date_str: str) -> dict:
    """
    Returns calendar events for a specific date in structured format.
    date_str must be in YYYY-MM-DD format (e.g., '2025-04-10').
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
    normalized = [_normalize_event(event, tz) for event in events]

    return {
        "success": True,
        "date": date_str,
        "timezone": settings.timezone,
        "count": len(normalized),
        "events": normalized,
    }

@function_tool
def create_calendar_event(title: str, start_iso: str, duration_minutes: int = 60) -> dict:
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

    Returns a structured result with the created event details.
    """
    tz = _local_tz()
    now = datetime.now(tz)
    start_dt = datetime.fromisoformat(start_iso).astimezone(tz)
    
    # Reject events more than 1 hour in the past
    if start_dt < now - timedelta(hours=1):
        return {
            "success": False,
            "error_code": "EVENT_IN_PAST",
            "message": "Cannot create event in the past.",
            "attempted_start_iso": start_dt.isoformat(),
            "current_now_iso": now.isoformat(),
        }
    
    end_dt = start_dt + timedelta(minutes=duration_minutes)

    event = _execute_with_retry(
        lambda: _get_service().events().insert(
            calendarId=CALENDAR_ID,
            body={
                "summary": title,
                "start": {"dateTime": start_dt.isoformat(), "timeZone": settings.timezone},
                "end": {"dateTime": end_dt.isoformat(), "timeZone": settings.timezone},
            },
        ),
        action="create_calendar_event",
    )

    return {
        "success": True,
        "action": "create",
        "event": _normalize_event(event, tz),
        "duration_minutes": duration_minutes,
    }

@function_tool
def update_event_time(event_title_hint: str, new_start_iso: str, duration_minutes: int = 60) -> dict:
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
        return {
            "success": False,
            "error_code": "EVENT_IN_PAST",
            "message": "Cannot reschedule event to the past.",
            "attempted_start_iso": new_start.isoformat(),
            "current_now_iso": now.isoformat(),
        }
    
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
        return {
            "success": False,
            "error_code": "EVENT_NOT_FOUND",
            "message": f"No upcoming event found matching '{event_title_hint}'.",
            "event_title_hint": event_title_hint,
        }

    # Take the first match
    event = events[0]
    event_id = event["id"]
    old_title = event.get("summary", "Untitled")

    new_end = new_start + timedelta(minutes=duration_minutes)

    event["start"] = {"dateTime": new_start.isoformat(), "timeZone": settings.timezone}
    event["end"] = {"dateTime": new_end.isoformat(), "timeZone": settings.timezone}

    updated_event = service.events().update(
        calendarId=CALENDAR_ID,
        eventId=event_id,
        body=event
    ).execute()

    return {
        "success": True,
        "action": "update",
        "matched_title": old_title,
        "event": _normalize_event(updated_event, tz),
        "duration_minutes": duration_minutes,
    }

@function_tool
def delete_event(event_title_hint: str) -> dict:
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
        return {
            "success": False,
            "error_code": "EVENT_NOT_FOUND",
            "message": f"No upcoming event found matching '{event_title_hint}'.",
            "event_title_hint": event_title_hint,
        }

    event = events[0]
    normalized_event = _normalize_event(event, tz)
    service.events().delete(calendarId=CALENDAR_ID, eventId=event["id"]).execute()

    return {
        "success": True,
        "action": "delete",
        "event": normalized_event,
    }