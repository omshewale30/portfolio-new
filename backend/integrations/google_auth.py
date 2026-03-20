import os
import tempfile
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from settings.config import settings

SCOPES = [
    "https://www.googleapis.com/auth/calendar",        # Full calendar access
    "https://www.googleapis.com/auth/calendar.events"  # Event-level access
]


def _resolve_token_write_path() -> str:
    """Where to save refreshed tokens. Render's /etc/secrets is read-only."""
    if settings.google_token_write_path:
        return settings.google_token_write_path
    read_path = os.path.abspath(os.path.expanduser(settings.google_token_path))
    parent = os.path.dirname(read_path)
    if parent and os.path.isdir(parent) and os.access(parent, os.W_OK):
        return read_path
    return os.path.join(tempfile.gettempdir(), "google_token.json")


def _token_read_paths() -> list[str]:
    """Prefer refreshed cache, then bootstrap (e.g. Render secret file)."""
    write = os.path.abspath(os.path.expanduser(_resolve_token_write_path()))
    bootstrap = os.path.abspath(os.path.expanduser(settings.google_token_path))
    out: list[str] = []
    for p in (write, bootstrap):
        if p not in out:
            out.append(p)
    return out


def _load_stored_credentials() -> Credentials | None:
    for path in _token_read_paths():
        if os.path.isfile(path):
            return Credentials.from_authorized_user_file(path, SCOPES)
    return None


def _persist_token(creds: Credentials) -> None:
    path = _resolve_token_write_path()
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(creds.to_json())


def get_calendar_credentials() -> Credentials:
    """
    Returns valid Google Calendar credentials.
    On first run, opens a browser for OAuth consent.
    On subsequent runs, refreshes the token silently.
    """
    creds = _load_stored_credentials()

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                settings.google_credentials_path, SCOPES
            )
            creds = flow.run_local_server(port=0)

        _persist_token(creds)

    return creds