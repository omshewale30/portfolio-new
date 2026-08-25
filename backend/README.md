# Portfolio Jarvis API

Public, read-only API used by the embedded portfolio chat and the secondary
Jarvis interface. Deploy this directory as the root of the
`portfolio-jarvis-api` Vercel project.

The service is stateless: clients send `previous_response_id` and receive the
next `response_id`. It intentionally contains no Telegram or privileged
integration code.

It uses the OpenAI Responses API directly with the hosted `file_search` tool.
Create a public-only vector store, upload reviewed portfolio material, and set
`OPENAI_VECTOR_STORE_ID`. The service sends the public instructions on every
request because instructions are not inherited through `previous_response_id`.

Chat responses are capped at 300 output tokens and file search returns at most
four results. These defaults keep portfolio answers focused while reducing the
two main latency contributors: generation time and retrieved context size.

Copy `.env.example` to `.env` for local development, then run:

```sh
uvicorn main:app --reload
```

Required runtime configuration:

- `OPENAI_API_KEY`
- `OPENAI_VECTOR_STORE_ID`
- `OPENAI_CHAT_MODEL` (defaults to `gpt-4o`)
- `CORS_ALLOWED_ORIGINS`
- `CHAT_RATE_LIMIT_REQUESTS` (defaults to `10`)
- `CHAT_RATE_LIMIT_WINDOW_SECONDS` (defaults to `60`)

`POST /chat` applies a per-client-IP sliding-window rate limit. Successful
responses include `RateLimit-*` headers; rejected requests return `429` with a
`Retry-After` header. The limiter is process-local, which is appropriate for a
small single-instance deployment. Use a shared store such as Redis if the API
is scaled across multiple long-lived instances and needs a global quota.

The compatibility response currently returns `output_text` and `response_id`.
File-search citations are structured annotations in the OpenAI response and
are not yet exposed by this API contract.
