import base64
import logging
import random
import ssl
import time
from email.mime.text import MIMEText
from typing import Optional

from googleapiclient.errors import HttpError
from integrations.gmail_auth import get_gmail_service
from langchain_core.tools import tool

_gmail_service = None
logger = logging.getLogger(__name__)

RETRYABLE_HTTP_STATUS = {408, 409, 425, 429, 500, 502, 503, 504}
TRANSIENT_GMAIL_EXCEPTIONS = (ssl.SSLError, TimeoutError, OSError)

def _get_gmail_service():
    global _gmail_service
    if _gmail_service is None:
        _gmail_service = get_gmail_service()
    return _gmail_service


def _is_retryable_http_error(exc: HttpError) -> bool:
    status = getattr(getattr(exc, "resp", None), "status", None)
    return status in RETRYABLE_HTTP_STATUS


def _execute_gmail(operation: str, request_factory, attempts: int = 4, base_delay: float = 1.0):
    """
    Execute a Gmail API request with retry/backoff and structured diagnostics.

    request_factory must return a new request object for each attempt.
    """
    for attempt in range(1, attempts + 1):
        try:
            return request_factory().execute()
        except HttpError as exc:
            retryable = _is_retryable_http_error(exc)
            if not retryable or attempt == attempts:
                logger.exception(
                    "Gmail API failed: op=%s attempt=%s/%s retryable=%s",
                    operation,
                    attempt,
                    attempts,
                    retryable,
                )
                raise
            delay = base_delay * (2 ** (attempt - 1)) + random.uniform(0, 0.25)
            logger.warning(
                "Transient Gmail HttpError: op=%s attempt=%s/%s status=%s; retrying in %.2fs",
                operation,
                attempt,
                attempts,
                getattr(getattr(exc, "resp", None), "status", None),
                delay,
            )
            time.sleep(delay)
        except TRANSIENT_GMAIL_EXCEPTIONS as exc:
            if attempt == attempts:
                logger.exception(
                    "Transient Gmail transport error persisted: op=%s attempt=%s/%s type=%s",
                    operation,
                    attempt,
                    attempts,
                    type(exc).__name__,
                )
                raise
            delay = base_delay * (2 ** (attempt - 1)) + random.uniform(0, 0.25)
            logger.warning(
                "Transient Gmail transport error: op=%s attempt=%s/%s type=%s; retrying in %.2fs",
                operation,
                attempt,
                attempts,
                type(exc).__name__,
                delay,
            )
            time.sleep(delay)


@tool
def get_unread_emails(max_results: int = 10) -> str:
    """Fetch unread emails from the inbox.
    
    Args:
        max_results: Maximum number of emails to return (default 10)
    
    Returns:
        List of unread email summaries with id, thread_id, subject, from, and snippet
    """
    results = _execute_gmail(
        "messages.list.unread",
        lambda: _get_gmail_service().users().messages().list(
            userId="me",
            q="is:unread",
            maxResults=max_results,
        ),
    )

    messages = results.get("messages", [])
    if not messages:
        return "No unread emails."

    emails = []
    for msg in messages:
        msg_data = _execute_gmail(
            "messages.get.metadata",
            lambda m=msg: _get_gmail_service().users().messages().get(
                userId="me",
                id=m["id"],
                format="metadata",
                metadataHeaders=["Subject", "From", "Date"],
            ),
        )

        headers = {h["name"]: h["value"] for h in msg_data.get("payload", {}).get("headers", [])}
        emails.append({
            "id": msg["id"],
            "thread_id": msg["threadId"],
            "subject": headers.get("Subject", "(No Subject)"),
            "from": headers.get("From", ""),
            "date": headers.get("Date", ""),
            "snippet": msg_data.get("snippet", "")
        })

    lines = [f"📧 {len(emails)} unread email(s):"]
    for e in emails:
        lines.append(f"  • [ID: {e['id']}] From: {e['from']}")
        lines.append(f"    Subject: {e['subject']}")
        lines.append(f"    Preview: {e['snippet'][:100]}...")
    return "\n".join(lines)


@tool
def get_email_thread(thread_id: str) -> str:
    """Read a specific email thread by its ID.
    
    Args:
        thread_id: The Gmail thread ID
    
    Returns:
        Thread details including all messages with their content
    """
    thread = _execute_gmail(
        "threads.get.full",
        lambda: _get_gmail_service().users().threads().get(
            userId="me",
            id=thread_id,
            format="full",
        ),
    )

    messages = []
    for msg in thread.get("messages", []):
        headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
        body = _extract_body(msg.get("payload", {}))
        messages.append({
            "id": msg["id"],
            "subject": headers.get("Subject", "(No Subject)"),
            "from": headers.get("From", ""),
            "to": headers.get("To", ""),
            "date": headers.get("Date", ""),
            "body": body
        })

    lines = [f"📧 Thread {thread_id} ({len(messages)} message(s)):"]
    for m in messages:
        lines.append(f"\n--- Message from {m['from']} ---")
        lines.append(f"Date: {m['date']}")
        lines.append(f"Subject: {m['subject']}")
        lines.append(f"To: {m['to']}")
        lines.append(f"\n{m['body'][:2000]}")
    return "\n".join(lines)


def _extract_body(payload: dict) -> str:
    """Extract plain text body from email payload."""
    if payload.get("mimeType") == "text/plain" and payload.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8")

    for part in payload.get("parts", []):
        if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
            return base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8")
        if part.get("parts"):
            result = _extract_body(part)
            if result:
                return result

    return ""


@tool
def draft_email(to: str, subject: str, body: str) -> str:
    """Create a draft email.
    
    Args:
        to: Recipient email address
        subject: Email subject
        body: Email body content (plain text)
    
    Returns:
        Draft details including id and message info
    """
    message = MIMEText(body)
    message["to"] = to
    message["subject"] = subject

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    draft = _execute_gmail(
        "drafts.create",
        lambda: _get_gmail_service().users().drafts().create(
            userId="me",
            body={"message": {"raw": raw}},
        ),
    )

    return f"✅ Draft created (ID: {draft['id']})\n  To: {to}\n  Subject: {subject}"


@tool
def send_email(to: str, subject: str, body: str, thread_id: Optional[str] = None) -> str:
    """Send an email or reply to a thread.
    
    Args:
        to: Recipient email address
        subject: Email subject
        body: Email body content (plain text)
        thread_id: Optional thread ID if replying to an existing thread
    
    Returns:
        Sent message details including id and thread_id
    """
    message = MIMEText(body)
    message["to"] = to
    message["subject"] = subject

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    body_data = {"raw": raw}

    if thread_id:
        body_data["threadId"] = thread_id

    sent = _execute_gmail(
        "messages.send",
        lambda: _get_gmail_service().users().messages().send(
            userId="me",
            body=body_data,
        ),
    )

    return f"✅ Email sent successfully!\n  To: {to}\n  Subject: {subject}\n  Message ID: {sent['id']}"


@tool
def search_emails(
    query: Optional[str] = None,
    sender: Optional[str] = None,
    after: Optional[str] = None,
    before: Optional[str] = None,
    label: Optional[str] = None,
    max_results: int = 10
) -> str:
    """Search inbox by keyword, sender, date range, or label.
    
    Args:
        query: Search keywords
        sender: Filter by sender email
        after: Filter emails after this date (YYYY/MM/DD)
        before: Filter emails before this date (YYYY/MM/DD)
        label: Filter by Gmail label
        max_results: Maximum number of results (default 10)
    
    Returns:
        List of matching email summaries
    """
    q_parts = []
    if query:
        q_parts.append(query)
    if sender:
        q_parts.append(f"from:{sender}")
    if after:
        q_parts.append(f"after:{after}")
    if before:
        q_parts.append(f"before:{before}")
    if label:
        q_parts.append(f"label:{label}")

    q = " ".join(q_parts) if q_parts else ""

    results = _execute_gmail(
        "messages.list.search",
        lambda: _get_gmail_service().users().messages().list(
            userId="me",
            q=q,
            maxResults=max_results,
        ),
    )

    messages = results.get("messages", [])
    if not messages:
        return f"No emails found matching: {q or '(all)'}"

    emails = []
    for msg in messages:
        msg_data = _execute_gmail(
            "messages.get.metadata",
            lambda m=msg: _get_gmail_service().users().messages().get(
                userId="me",
                id=m["id"],
                format="metadata",
                metadataHeaders=["Subject", "From", "Date"],
            ),
        )

        headers = {h["name"]: h["value"] for h in msg_data.get("payload", {}).get("headers", [])}
        emails.append({
            "id": msg["id"],
            "thread_id": msg["threadId"],
            "subject": headers.get("Subject", "(No Subject)"),
            "from": headers.get("From", ""),
            "date": headers.get("Date", ""),
            "snippet": msg_data.get("snippet", "")
        })

    lines = [f"🔍 Found {len(emails)} email(s):"]
    for e in emails:
        lines.append(f"  • [ID: {e['id']}] From: {e['from']}")
        lines.append(f"    Subject: {e['subject']}")
        lines.append(f"    Preview: {e['snippet'][:100]}...")
    return "\n".join(lines)


@tool
def archive_email(message_id: str) -> str:
    """Archive an email by removing it from inbox.
    
    Args:
        message_id: The Gmail message ID
    
    Returns:
        Status of the archive operation
    """
    _execute_gmail(
        "messages.modify.archive",
        lambda: _get_gmail_service().users().messages().modify(
            userId="me",
            id=message_id,
            body={"removeLabelIds": ["INBOX"]},
        ),
    )

    return f"✅ Email archived (ID: {message_id})"


@tool
def mark_as_read(message_id: str) -> str:
    """Mark an email as read.
    
    Args:
        message_id: The Gmail message ID
    
    Returns:
        Status of the operation
    """
    _execute_gmail(
        "messages.modify.mark_read",
        lambda: _get_gmail_service().users().messages().modify(
            userId="me",
            id=message_id,
            body={"removeLabelIds": ["UNREAD"]},
        ),
    )

    return f"✅ Email marked as read (ID: {message_id})"



GMAIL_TOOLS = [
    get_unread_emails,
    get_email_thread,
    draft_email,
    send_email,
    search_emails,
    archive_email,
    mark_as_read,
]