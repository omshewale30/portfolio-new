import unittest
from types import SimpleNamespace
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient
from openai import NotFoundError

import main
from rate_limiter import SlidingWindowRateLimiter


class FakeResponses:
    def __init__(self):
        self.calls = []

    async def create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(
            id="resp_test",
            output_text="Hello from Jarvis",
            output=[
                SimpleNamespace(
                    content=[
                        SimpleNamespace(
                            annotations=[
                                SimpleNamespace(
                                    type="file_citation",
                                    file_id="file_resume",
                                    filename="Om_Shewale.pdf",
                                    quote="Om leads applied AI strategy.",
                                ),
                                SimpleNamespace(
                                    type="file_citation",
                                    file_id="file_resume",
                                    filename="Om_Shewale.pdf",
                                    quote="Duplicate citation",
                                ),
                                SimpleNamespace(type="url_citation"),
                            ]
                        )
                    ]
                )
            ],
            usage=SimpleNamespace(
                input_tokens=1000,
                output_tokens=500,
                total_tokens=1500,
            ),
        )


class ExpiredResponses:
    async def create(self, **_):
        response = httpx.Response(
            404,
            request=httpx.Request("POST", "https://api.openai.com/v1/responses"),
        )
        raise NotFoundError("previous_response_id was not found", response=response, body={})


class PublicApiContractTests(unittest.TestCase):
    def setUp(self):
        main.chat_rate_limiter.clear()
        self.setting_patches = [
            patch.object(main.settings, "openai_api_key", "test-key"),
            patch.object(main.settings, "openai_vector_store_id", "vs_public"),
            patch.object(main.settings, "openai_chat_model", "gpt-4o"),
            patch.object(main, "PUBLIC_JARVIS_INSTRUCTIONS", "Test public instructions"),
        ]
        for setting_patch in self.setting_patches:
            setting_patch.start()

        self.fake = SimpleNamespace(responses=FakeResponses())
        self.openai = patch.object(
            main, "_openai_client", SimpleNamespace(client=self.fake)
        )
        self.openai.start()
        self.client = TestClient(main.app)

    def tearDown(self):
        main.chat_rate_limiter.clear()
        self.openai.stop()
        for setting_patch in reversed(self.setting_patches):
            setting_patch.stop()

    def test_new_conversation_contract(self):
        with patch.object(main, "perf_counter", side_effect=[10.0, 10.25]):
            response = self.client.post(
                "/chat", json={"user_id": "browser", "user_input": "Hello"}
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["ratelimit-limit"], "10")
        self.assertEqual(response.headers["ratelimit-remaining"], "9")
        self.assertEqual(response.headers["ratelimit-policy"], "10;w=60")
        self.assertEqual(
            response.json(),
            {
                "response": "Hello from Jarvis",
                "response_id": "resp_test",
                "model": "gpt-4o",
                "sources": [
                    {
                        "id": "file_resume",
                        "filename": "Om_Shewale.pdf",
                        "quote": "Om leads applied AI strategy.",
                    }
                ],
                "latency_ms": 250,
                "usage": {
                    "input_tokens": 1000,
                    "output_tokens": 500,
                    "total_tokens": 1500,
                },
                "cost_usd": 0.0075,
            },
        )
        call = self.fake.responses.calls[0]
        self.assertNotIn("previous_response_id", call)
        self.assertNotIn("prompt", call)
        self.assertEqual(call["instructions"], "Test public instructions")
        self.assertEqual(
            call["tools"],
            [
                {
                    "type": "file_search",
                    "vector_store_ids": ["vs_public"],
                    "max_num_results": 4,
                }
            ],
        )
        self.assertEqual(call["max_output_tokens"], 300)
        self.assertTrue(call["store"])

    def test_chained_conversation_forwards_response_id(self):
        response = self.client.post(
            "/chat",
            json={
                "user_id": "browser",
                "user_input": "Continue",
                "previous_response_id": "resp_previous",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            self.fake.responses.calls[0]["previous_response_id"], "resp_previous"
        )
        self.assertEqual(self.fake.responses.calls[0]["instructions"], "Test public instructions")

    def test_rejects_blank_and_oversized_messages(self):
        blank = self.client.post("/chat", json={"user_id": "browser", "user_input": "   "})
        oversized = self.client.post(
            "/chat", json={"user_id": "browser", "user_input": "x" * 2001}
        )

        self.assertEqual(blank.status_code, 422)
        self.assertEqual(blank.json()["detail"]["code"], "invalid_request")
        self.assertEqual(oversized.status_code, 422)

    def test_stale_conversation_has_stable_error(self):
        expired_client = SimpleNamespace(client=SimpleNamespace(responses=ExpiredResponses()))
        with patch.object(main, "_openai_client", expired_client):
            response = self.client.post(
                "/chat",
                json={
                    "user_id": "browser",
                    "user_input": "Continue",
                    "previous_response_id": "resp_expired",
                },
            )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["detail"]["code"], "conversation_expired")

    def test_health_reflects_configuration(self):
        self.assertEqual(
            self.client.get("/health").json(),
            {"status": "ok", "service": "portfolio-jarvis-api"},
        )

        with patch.object(main.settings, "openai_vector_store_id", ""):
            degraded = self.client.get("/health")

        self.assertEqual(degraded.status_code, 503)
        self.assertEqual(degraded.json()["status"], "degraded")

    def test_private_routes_are_not_exposed(self):
        self.assertEqual(self.client.post("/webhook", json={}).status_code, 404)

    def test_cors_allows_only_configured_public_clients(self):
        allowed_origin = main._allowed_origins()[0]
        allowed = self.client.options(
            "/chat",
            headers={"Origin": allowed_origin, "Access-Control-Request-Method": "POST"},
        )
        denied = self.client.options(
            "/chat",
            headers={"Origin": "https://example.com", "Access-Control-Request-Method": "POST"},
        )

        self.assertEqual(allowed.headers["access-control-allow-origin"], allowed_origin)
        self.assertNotIn("access-control-allow-origin", denied.headers)

    def test_unknown_model_omits_cost_without_failing(self):
        with patch.object(main.settings, "openai_chat_model", "unpriced-model"):
            response = self.client.post(
                "/chat", json={"user_id": "browser", "user_input": "Hello"}
            )

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["cost_usd"])

    def test_chat_rate_limit_rejects_excess_requests_per_client_ip(self):
        limiter = SlidingWindowRateLimiter(limit=2, window_seconds=60)
        client_headers = {"X-Forwarded-For": "203.0.113.10"}

        with patch.object(main, "chat_rate_limiter", limiter):
            first = self.client.post(
                "/chat",
                json={"user_id": "browser", "user_input": "First"},
                headers=client_headers,
            )
            second = self.client.post(
                "/chat",
                json={"user_id": "browser", "user_input": "Second"},
                headers=client_headers,
            )
            rejected = self.client.post(
                "/chat",
                json={"user_id": "browser", "user_input": "Third"},
                headers=client_headers,
            )
            other_client = self.client.post(
                "/chat",
                json={"user_id": "browser", "user_input": "Independent"},
                headers={"X-Forwarded-For": "203.0.113.11"},
            )

        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.headers["ratelimit-remaining"], "1")
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.headers["ratelimit-remaining"], "0")
        self.assertEqual(rejected.status_code, 429)
        self.assertEqual(rejected.json()["detail"]["code"], "rate_limit_exceeded")
        self.assertEqual(rejected.headers["retry-after"], "60")
        self.assertEqual(rejected.headers["ratelimit-remaining"], "0")
        self.assertEqual(other_client.status_code, 200)
        self.assertEqual(len(self.fake.responses.calls), 3)


class SlidingWindowRateLimiterTests(unittest.TestCase):
    def test_requests_are_allowed_again_after_the_window(self):
        limiter = SlidingWindowRateLimiter(limit=2, window_seconds=60)

        self.assertTrue(limiter.check("client", now=0).allowed)
        self.assertTrue(limiter.check("client", now=1).allowed)
        self.assertFalse(limiter.check("client", now=2).allowed)

        reset = limiter.check("client", now=61)
        self.assertTrue(reset.allowed)
        self.assertEqual(reset.remaining, 1)


if __name__ == "__main__":
    unittest.main()
