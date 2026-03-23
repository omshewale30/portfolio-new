from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from agents import function_tool
from settings.config import settings


@function_tool
def get_current_datetime() -> str:
    """
    Returns the current local date/time in the configured user timezone.
    Use this for questions like "what time is it", "what is today", and "what is tomorrow".
    """
    now = datetime.now(ZoneInfo(settings.timezone))
    tomorrow = now + timedelta(days=1)
    return (
        f"timezone={settings.timezone}\n"
        f"now_iso={now.isoformat()}\n"
        f"today={now.strftime('%A, %B %d, %Y')}\n"
        f"tomorrow={tomorrow.strftime('%A, %B %d, %Y')}\n"
        f"time={now.strftime('%-I:%M %p')}"
    )
