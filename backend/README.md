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
You can override the safe defaults with `OPENAI_SYSTEM_INSTRUCTIONS`.

Copy `.env.example` to `.env` for local development, then run:

```sh
uvicorn main:app --reload
```

Required runtime configuration:

- `OPENAI_API_KEY`
- `OPENAI_VECTOR_STORE_ID`
- `OPENAI_CHAT_MODEL` (defaults to `gpt-4o`)
- `CORS_ALLOWED_ORIGINS`

The compatibility response currently returns `output_text` and `response_id`.
File-search citations are structured annotations in the OpenAI response and
are not yet exposed by this API contract.
