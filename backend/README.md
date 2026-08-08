# Portfolio Jarvis API

Public, read-only API used by the embedded portfolio chat and the secondary
Jarvis interface. Deploy this directory as the root of the
`portfolio-jarvis-api` Vercel project.

The service is stateless: clients send `previous_response_id` and receive the
next `response_id`. It intentionally contains no Telegram or privileged
integration code.

Copy `.env.example` to `.env` for local development, then run:

```sh
uvicorn main:app --reload
```
