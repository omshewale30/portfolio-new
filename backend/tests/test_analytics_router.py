import unittest
import uuid
from unittest.mock import patch

from fastapi.testclient import TestClient

import analytics_router
import main


class FakeResult:
    def __init__(self, data, count=None):
        self.data = data
        self.count = count


class FakeQuery:
    def __init__(self, table, op, payload=None):
        self.table = table
        self.op = op
        self.payload = payload
        self.filters = {}
        self.want_count = False

    def eq(self, col, val):
        self.filters[col] = val
        return self

    def execute(self):
        return self.table._execute(self)


class FakeTable:
    def __init__(self, rows, log):
        self.rows = rows
        self.log = log

    def select(self, *_args, count=None, **_kwargs):
        query = FakeQuery(self, "select")
        query.want_count = count == "exact"
        return query

    def insert(self, payload):
        return FakeQuery(self, "insert", payload)

    def _matches(self, row, filters):
        return all(row.get(key) == value for key, value in filters.items())

    def _execute(self, query):
        self.log.append((query.op, dict(query.filters), query.payload))

        if query.op == "select":
            result_rows = [row for row in self.rows if self._matches(row, query.filters)]
            count = len(result_rows) if query.want_count else None
            return FakeResult(result_rows, count=count)

        if query.op == "insert":
            new_row = dict(query.payload)
            new_row.setdefault("id", str(uuid.uuid4()))
            new_row.setdefault("created_at", "2026-01-01T00:00:00Z")
            self.rows.append(new_row)
            return FakeResult([new_row])

        raise AssertionError(f"unsupported op {query.op}")


class FakeSupabaseClient:
    def __init__(self):
        self._tables: dict[str, list[dict]] = {}
        self.log: list[tuple] = []

    def table(self, name: str) -> FakeTable:
        self._tables.setdefault(name, [])
        return FakeTable(self._tables[name], self.log)


class AnalyticsRouterTests(unittest.TestCase):
    def setUp(self):
        analytics_router.pageview_rate_limiter.clear()

        self.fake_client = FakeSupabaseClient()
        self.supabase_patch = patch.object(
            analytics_router, "get_supabase_client", return_value=self.fake_client
        )
        self.supabase_patch.start()
        self.client = TestClient(main.app)

    def tearDown(self):
        analytics_router.pageview_rate_limiter.clear()
        self.supabase_patch.stop()

    def test_track_pageview_inserts_row_and_returns_204(self):
        response = self.client.post(
            "/events/pageview", json={"path": "/notes/my-note", "note_slug": "my-note"}
        )

        self.assertEqual(response.status_code, 204)
        rows = self.fake_client._tables["page_views"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["path"], "/notes/my-note")
        self.assertEqual(rows[0]["note_slug"], "my-note")

    def test_track_pageview_without_note_slug(self):
        response = self.client.post("/events/pageview", json={"path": "/"})

        self.assertEqual(response.status_code, 204)
        rows = self.fake_client._tables["page_views"]
        self.assertEqual(rows[0]["note_slug"], None)

    def test_track_pageview_rejects_blank_path(self):
        response = self.client.post("/events/pageview", json={"path": "   "})

        self.assertEqual(response.status_code, 422)

    def test_track_pageview_rejects_invalid_note_slug(self):
        response = self.client.post(
            "/events/pageview", json={"path": "/notes/x", "note_slug": "Not Valid!"}
        )

        self.assertEqual(response.status_code, 422)

    def test_track_pageview_rate_limited(self):
        analytics_router.pageview_rate_limiter.limit = 1
        try:
            first = self.client.post("/events/pageview", json={"path": "/"})
            second = self.client.post("/events/pageview", json={"path": "/"})

            self.assertEqual(first.status_code, 204)
            self.assertEqual(second.status_code, 429)
            self.assertIn("Retry-After", second.headers)
        finally:
            analytics_router.pageview_rate_limiter.limit = (
                analytics_router.settings.pageview_rate_limit_requests
            )

    def test_get_note_view_count_zero(self):
        response = self.client.get("/notes/my-note/views")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"view_count": 0})

    def test_get_note_view_count_counts_only_matching_slug(self):
        self.fake_client.table("page_views").insert(
            {"path": "/notes/my-note", "note_slug": "my-note"}
        ).execute()
        self.fake_client.table("page_views").insert(
            {"path": "/notes/my-note", "note_slug": "my-note"}
        ).execute()
        self.fake_client.table("page_views").insert(
            {"path": "/notes/other-note", "note_slug": "other-note"}
        ).execute()

        response = self.client.get("/notes/my-note/views")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"view_count": 2})

    def test_get_note_view_count_rejects_invalid_slug(self):
        response = self.client.get("/notes/Not Valid!/views")

        self.assertEqual(response.status_code, 422)

    def test_track_pageview_supabase_misconfigured(self):
        self.supabase_patch.stop()
        with patch.object(analytics_router.settings, "supabase_url", ""):
            response = self.client.post("/events/pageview", json={"path": "/"})
        self.assertEqual(response.status_code, 503)
        self.supabase_patch.start()


if __name__ == "__main__":
    unittest.main()
