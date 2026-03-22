'''
This agent is responsible for handling all Gmail related operations.
It will be used to fetch unread emails, read a specific email thread, draft and send replies or new emails from natural language.
It will also be used to search inbox by keyword, sender, date range, or label.
It will also be used to archive or mark emails as read.
'''

from agents import Agent
from tools.gmail_tools import get_unread_emails, get_email_thread, draft_email, send_email, search_emails, archive_email, mark_as_read

gmail_agent = Agent(
    name="GmailAgent",
    handoff_description="Handles all Gmail operations: fetching unread emails, reading a specific email thread, drafting and sending replies or new emails from natural language, searching inbox by keyword, sender, date range, or label, archiving or marking emails as read.",
    instructions="""
    You are Jarvis's Gmail manager. You have full access to the user's Gmail.
    Your responsibilities:
    - Fetch unread emails
    - Read a specific email thread
    - Draft and send replies or new emails from natural language
    - Search inbox by keyword, sender, date range, or label
    - Archive or mark emails as read
    """,
    tools=[
        get_unread_emails,
        get_email_thread,
        draft_email,
        send_email,
        search_emails,
        archive_email,
        mark_as_read,
    ],
)