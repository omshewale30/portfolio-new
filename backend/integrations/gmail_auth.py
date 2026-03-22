import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from settings.config import settings

def get_gmail_service():
    """Reconstructs Gmail credentials entirely from Environment Variables."""
    
    # Pull these from Render / Docker env vars
    client_id = settings.gmail_client_id
    client_secret = settings.gmail_client_secret
    refresh_token = settings.gmail_refresh_token

    if not all([client_id, client_secret, refresh_token]):
        raise ValueError("Missing Gmail OAuth environment variables.")

    # Build the credentials object in-memory
    creds = Credentials(
        token=None, # It will automatically fetch a new one using the refresh token
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret
    )

    # Initialize the service
    service = build('gmail', 'v1', credentials=creds)
    return service