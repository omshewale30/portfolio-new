import unittest
import uuid
from unittest.mock import patch

from fastapi.testclient import TestClient

import main
import notes_router
import supabase_client


class FakeResult:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self, table, op, payload=None):
        self.table = table
        self.op = op
        self.payload = payload
        self.filters = {}
        self.order_by = None
        self.desc = False

    def eq(self, col, val):
        self.filters[col] = val
        return self

    def order(self, col, desc=False):
        self.order_by = col
        self.desc = desc
        return self

    def execute(self):
        return self.table._execute(self)


class FakeTable:
    def __init__(self, rows, log):
        self.rows = rows
        self.log = log

    def select(self, *_):
        return FakeQuery(self, "select")

    def insert(self, payload):
        return FakeQuery(self, "insert", payload)

    def update(self, payload):
        return FakeQuery(self, "update", payload)

    def delete(self):
        return FakeQuery(self, "delete")

    def _matches(self, row, filters):
        return all(row.get(key) == value for key, value in filters.items())

    def _execute(self, query):
        self.log.append((query.op, dict(query.filters), query.payload))

        if query.op == "select":
            result_rows = [row for row in self.rows if self._matches(row, query.filters)]
            if query.order_by:
                result_rows = sorted(
                    result_rows, key=lambda row: row[query.order_by], reverse=query.desc
                )
            return FakeResult(list(result_rows))

        if query.op == "insert":
            new_row = dict(query.payload)
            new_row.setdefault("id", str(uuid.uuid4()))
            new_row.setdefault("created_at", "2026-01-01T00:00:00Z")
            new_row.setdefault("author_name", new_row.get("author_name"))
            self.rows.append(new_row)
            return FakeResult([new_row])

        if query.op == "update":
            updated = [row for row in self.rows if self._matches(row, query.filters)]
            for row in updated:
                row.update(query.payload)
            return FakeResult(updated)

        if query.op == "delete":
            deleted = [row for row in self.rows if self._matches(row, query.filters)]
            for row in deleted:
                self.rows.remove(row)
            return FakeResult(deleted)

        raise AssertionError(f"unsupported op {query.op}")


class FakeSupabaseClient:
    def __init__(self):
        self._tables: dict[str, list[dict]] = {}
        self.log: list[tuple] = []

    def table(self, name: str) -> FakeTable:
        self._tables.setdefault(name, [])
        return FakeTable(self._tables[name], self.log)


class NotesRouterTests(unittest.TestCase):
    def setUp(self):
        notes_router.comment_rate_limiter.clear()
        notes_router.comment_ip_rate_limiter.clear()
        notes_router.reaction_rate_limiter.clear()

        self.fake_client = FakeSupabaseClient()
        self.supabase_patch = patch.object(
            notes_router, "get_supabase_client", return_value=self.fake_client
        )
        self.supabase_patch.start()
        self.client = TestClient(main.app)

    def tearDown(self):
        notes_router.comment_rate_limiter.clear()
        notes_router.comment_ip_rate_limiter.clear()
        notes_router.reaction_rate_limiter.clear()
        self.supabase_patch.stop()

    def test_get_reactions_without_anon_id_returns_counts_only(self):
        self.fake_client.table("note_reactions").insert(
            {"note_slug": "my-note", "anon_id": "a1", "reaction": "like"}
        ).execute()
        self.fake_client.table("note_reactions").insert(
            {"note_slug": "my-note", "anon_id": "a2", "reaction": "dislike"}
        ).execute()

        response = self.client.get("/notes/my-note/reactions")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"like_count": 1, "dislike_count": 1, "your_reaction": None},
        )

    def test_get_reactions_with_matching_anon_id_reports_your_reaction(self):
        self.fake_client.table("note_reactions").insert(
            {"note_slug": "my-note", "anon_id": "a1", "reaction": "like"}
        ).execute()

        response = self.client.get("/notes/my-note/reactions", params={"anon_id": "a1"})

        self.assertEqual(response.json()["your_reaction"], "like")

    def test_submit_reaction_inserts_when_no_prior_vote(self):
        response = self.client.post(
            "/notes/my-note/reactions", json={"anon_id": "a1", "reaction": "like"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"like_count": 1, "dislike_count": 0, "your_reaction": "like"})

    def test_submit_reaction_toggles_off_on_repeat_same_reaction(self):
        self.client.post("/notes/my-note/reactions", json={"anon_id": "a1", "reaction": "like"})

        response = self.client.post(
            "/notes/my-note/reactions", json={"anon_id": "a1", "reaction": "like"}
        )

        self.assertEqual(response.json(), {"like_count": 0, "dislike_count": 0, "your_reaction": None})

    def test_submit_reaction_switches_from_like_to_dislike(self):
        self.client.post("/notes/my-note/reactions", json={"anon_id": "a1", "reaction": "like"})

        response = self.client.post(
            "/notes/my-note/reactions", json={"anon_id": "a1", "reaction": "dislike"}
        )

        self.assertEqual(
            response.json(), {"like_count": 0, "dislike_count": 1, "your_reaction": "dislike"}
        )

    def test_get_comments_only_returns_visible(self):
        table = self.fake_client.table("note_comments")
        table.insert(
            {
                "note_slug": "my-note",
                "anon_id": "a1",
                "author_name": "Ada",
                "body": "Great note!",
                "status": "visible",
            }
        ).execute()
        table.insert(
            {
                "note_slug": "my-note",
                "anon_id": "a2",
                "author_name": None,
                "body": "spam",
                "status": "hidden",
            }
        ).execute()

        response = self.client.get("/notes/my-note/comments")

        self.assertEqual(response.status_code, 200)
        bodies = [comment["body"] for comment in response.json()["comments"]]
        self.assertEqual(bodies, ["Great note!"])

    def test_submit_comment_happy_path(self):
        response = self.client.post(
            "/notes/my-note/comments",
            json={"anon_id": "a1", "author_name": "Ada", "body": "Loved this."},
        )

        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body["author_name"], "Ada")
        self.assertEqual(body["body"], "Loved this.")

    def test_submit_comment_rejects_blank_body(self):
        response = self.client.post(
            "/notes/my-note/comments", json={"anon_id": "a1", "body": "   "}
        )
        self.assertEqual(response.status_code, 422)

    def test_submit_comment_rejects_oversized_body(self):
        response = self.client.post(
            "/notes/my-note/comments", json={"anon_id": "a1", "body": "x" * 1001}
        )
        self.assertEqual(response.status_code, 422)

    def test_submit_comment_spam_body_is_hidden_but_still_returned(self):
        response = self.client.post(
            "/notes/my-note/comments",
            json={
                "anon_id": "a1",
                "body": "check http://a.co http://b.co http://c.co now",
            },
        )

        self.assertEqual(response.status_code, 201)
        stored_row = self.fake_client._tables["note_comments"][0]
        self.assertEqual(stored_row["status"], "hidden")

        listing = self.client.get("/notes/my-note/comments")
        self.assertEqual(listing.json()["comments"], [])

    def test_comment_rate_limit_exceeded_returns_429(self):
        limiter = notes_router.SlidingWindowRateLimiter(limit=1, window_seconds=60)
        with patch.object(notes_router, "comment_rate_limiter", limiter):
            first = self.client.post(
                "/notes/my-note/comments", json={"anon_id": "a1", "body": "Hi"}
            )
            second = self.client.post(
                "/notes/my-note/comments", json={"anon_id": "a1", "body": "Hi again"}
            )

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 429)
        self.assertEqual(second.json()["detail"]["code"], "rate_limit_exceeded")
        self.assertIn("retry-after", second.headers)

    def test_supabase_misconfigured_returns_503(self):
        self.supabase_patch.stop()
        config_patch = patch.multiple(
            main.settings, supabase_url="", supabase_key=""
        )
        config_patch.start()
        try:
            with patch.object(supabase_client, "_supabase_client", None):
                response = self.client.get("/notes/my-note/reactions")
        finally:
            config_patch.stop()
            self.supabase_patch.start()

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["detail"]["code"], "configuration_error")


if __name__ == "__main__":
    unittest.main()
