import os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from settings.config import settings

SCOPES = [
    "https://www.googleapis.com/auth/calendar",        # Full calendar access
    "https://www.googleapis.com/auth/calendar.events"  # Event-level access
]

def get_calendar_credentials() -> Credentials:
    """
    Returns valid Google Calendar credentials.
    On first run, opens a browser for OAuth consent.
    On subsequent runs, refreshes the token silently.
    """
    creds = None

    if os.path.exists(settings.google_token_path):
        creds = Credentials.from_authorized_user_file(settings.google_token_path, SCOPES)


    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                settings.google_credentials_path, SCOPES
            )
            creds = flow.run_local_server(port=0)

        # Persist token for future runs
        with open(settings.google_token_path, "w") as f:
            f.write(creds.to_json())

    return creds