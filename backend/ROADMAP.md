# Jarvis Roadmap

---

## Task & Project Tracker Agent

A lightweight, Telegram-native task inbox backed by PostgreSQL. Eliminates the
cognitive overhead of tracking TODOs across five concurrent workstreams
(Jarvis, Charlotte, Heelper, Startup, Research/UNC) — capture and retrieval
happen in the same Telegram thread, zero context switch.

### Features

- Create, list, complete, and prioritize tasks via natural language
- Tag tasks by project: `Jarvis | Charlotte | Heelper | Startup | Research | UNC`
- Set optional due dates; overdue tasks surface automatically in the morning briefing
- Query by project: "What's open on Charlotte?" or "What's due this week?"

### Data Model

```sql
CREATE TABLE tasks (
    id          SERIAL PRIMARY KEY,
    project     TEXT NOT NULL,
    description TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'open',   -- open | done | cancelled
    priority    TEXT NOT NULL DEFAULT 'normal', -- low | normal | high
    due_date    DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Implementation Plan

1. **`tools/task_tools.py`** — `@function_tool` wrappers:
   `create_task`, `list_tasks`, `complete_task`, `list_overdue_tasks`
2. **`jarvis_agents/task_agent.py`** — `Agent` with `handoff_description` and task tools
3. **`jarvis_agents/orchestrator.py`** — add `task_agent` to `handoffs[]`, add routing rule
4. **`briefing/runner.py`** — enhance morning briefing to include overdue/due-today tasks per project

### Orchestrator Routing Rule

```
For anything involving tasks, TODOs, action items, or project work →
hand off to TaskAgent.
```

### Stack

- PostgreSQL via existing `db/connection.py` + SQLAlchemy
- No external APIs required for v1
- Optional v2: sync to Linear (GraphQL API) or GitHub Issues

---

## Gmail Email Agent

A Telegram-native Gmail interface that handles inbox triage, drafting, sending,
and searching — without opening a browser. Builds directly on the existing
Google OAuth infrastructure used by `CalendarAgent`, extending `google_auth.py`
with Gmail scopes and a new credential flow.

### Features

- Fetch unread emails (with optional sender/subject filters)
- Read a specific email thread in full
- Draft and send replies or new emails from natural language
- Search inbox by keyword, sender, date range, or label
- Archive or mark emails as read

### Auth Extension

The existing `integrations/google_auth.py` already handles token persistence and
refresh. Gmail requires one additional scope:

```python
SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/gmail.modify",  # read + send + archive
]
```

A new `get_gmail_credentials()` function (or a unified `get_google_credentials()`)
is all that's needed — the token file and refresh logic are identical.

### Implementation Plan

1. **`integrations/google_auth.py`** — add Gmail scope; expose `get_gmail_credentials()`
   (or unify into a single `get_google_credentials(scopes)` helper)
2. **`tools/email_tools.py`** — `@function_tool` wrappers using `googleapiclient`:
   `get_unread_emails`, `get_email_thread`, `send_email`, `reply_to_email`,
   `search_emails`, `archive_email`, `mark_as_read`
3. **`jarvis_agents/email_agent.py`** — `Agent` with `handoff_description` and email tools
4. **`jarvis_agents/orchestrator.py`** — add `email_agent` to `handoffs[]`, add routing rule
5. **`briefing/runner.py`** — optionally surface unread count or flagged emails
   in the morning briefing

### Orchestrator Routing Rule

```
For anything involving email, inbox, unread messages, drafting, sending,
or Gmail → hand off to EmailAgent.
```

### Key API Calls (`gmail` v1 via `googleapiclient`)

| Tool | API Call |
|---|---|
| `get_unread_emails` | `GET /gmail/v1/users/me/messages?q=is:unread` |
| `get_email_thread` | `GET /gmail/v1/users/me/threads/{id}` |
| `send_email` | `POST /gmail/v1/users/me/messages/send` |
| `search_emails` | `GET /gmail/v1/users/me/messages?q={query}` |
| `archive_email` | `POST /gmail/v1/users/me/messages/{id}/modify` (remove INBOX label) |

### Stack

- `google-api-python-client` (already installed for Calendar)
- `google-auth`, `google-auth-oauthlib` (already installed)
- `base64` (stdlib) for encoding/decoding message bodies
- No new dependencies required
