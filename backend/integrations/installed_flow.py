import os
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

from dotenv import load_dotenv
load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send",
]

BASE_DIR = Path(__file__).resolve().parent.parent
CLIENT_SECRETS_FILE = BASE_DIR / "credentials" / "google_oauth.json"
TOKEN_FILE = BASE_DIR / "credentials" / "gmail_token.json"


def get_gmail_credentials() -> Credentials:
    creds = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CLIENT_SECRETS_FILE),
                SCOPES,
            )
            creds = flow.run_local_server(port=0)

        TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())

    return creds


if __name__ == "__main__":
    creds = get_gmail_credentials()
    print("Token saved to:", TOKEN_FILE)
    print("Refresh token:", creds.refresh_token)