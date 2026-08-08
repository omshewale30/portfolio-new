import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient
from openai import NotFoundError

import main


class FakeResponses:
    def __init__(self):
        self.calls = []

    async def create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(id="resp_test", output_text="Hello from Jarvis")


class ExpiredResponses:
    async def create(self, **_):
        response = httpx.Response(404, request=httpx.Request("POST", "https://api.openai.com/v1/responses"))
        raise NotFoundError("previous_response_id was not found", response=response, body={})


class PublicApiContractTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(
            os.environ,
            {"OPENAI_API_KEY": "test-key", "OPENAI_PROMPT_ID": "pmpt_public"},
        )
        self.env.start()
        self.fake = SimpleNamespace(responses=FakeResponses())
        self.openai = patch.object(main, "_openai_client", self.fake)
        self.openai.start()
        self.client = TestClient(main.app)

    def tearDown(self):
        self.openai.stop()
        self.env.stop()

    def test_new_conversation_contract(self):
        response = self.client.post("/chat", json={"user_id": "browser", "user_input": "Hello"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"response": "Hello from Jarvis", "response_id": "resp_test"})
        self.assertNotIn("previous_response_id", self.fake.responses.calls[0])

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
        self.assertEqual(self.fake.responses.calls[0]["previous_response_id"], "resp_previous")

    def test_rejects_blank_and_oversized_messages(self):
        blank = self.client.post("/chat", json={"user_id": "browser", "user_input": "   "})
        oversized = self.client.post("/chat", json={"user_id": "browser", "user_input": "x" * 2001})

        self.assertEqual(blank.status_code, 422)
        self.assertEqual(blank.json()["detail"]["code"], "invalid_request")
        self.assertEqual(oversized.status_code, 422)

    def test_stale_conversation_has_stable_error(self):
        with patch.object(main, "_openai_client", SimpleNamespace(responses=ExpiredResponses())):
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

        with patch.dict(os.environ, {"OPENAI_PROMPT_ID": ""}):
            degraded = self.client.get("/health")

        self.assertEqual(degraded.status_code, 503)
        self.assertEqual(degraded.json()["status"], "degraded")

    def test_private_routes_are_not_exposed(self):
        self.assertEqual(self.client.post("/webhook", json={}).status_code, 404)

    def test_cors_allows_only_configured_public_clients(self):
        allowed = self.client.options(
            "/chat",
            headers={"Origin": "https://omshewale.me", "Access-Control-Request-Method": "POST"},
        )
        denied = self.client.options(
            "/chat",
            headers={"Origin": "https://example.com", "Access-Control-Request-Method": "POST"},
        )

        self.assertEqual(allowed.headers["access-control-allow-origin"], "https://omshewale.me")
        self.assertNotIn("access-control-allow-origin", denied.headers)


if __name__ == "__main__":
    unittest.main()
