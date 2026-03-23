import os
import json
from google.oauth2 import service_account
from settings.config import settings
SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events"
]

def get_calendar_credentials():
    """Returns valid Google Calendar Service Account credentials from ENV."""
    # Assuming you stored the JSON string in an env var called GOOGLE_SA_JSON
    sa_json_string = settings.google_sa_json
    
    if not sa_json_string:
        raise ValueError("GOOGLE_SA_JSON environment variable is not set.")

    sa_info = json.loads(sa_json_string)
    return service_account.Credentials.from_service_account_info(
        sa_info, scopes=SCOPES
    )