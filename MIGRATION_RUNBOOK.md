# Jarvis Decoupling Cutover Runbook

The code split is complete locally. The portfolio repository contains only the
public API, and `/Users/omshewale/code/jarvis-telegram-service` contains the
private Telegram service. Complete these external steps in order.

## 1. Public OpenAI resources

1. Create a dedicated OpenAI project for public portfolio traffic.
2. Upload only reviewed public resume, experience, education, skill, and project
   material. Do not copy transcripts, email, calendar, tasks, or personal notes.
3. Recreate the hosted prompt and verify that citations still use the format
   consumed by `src/utils/responseParser.js`.
4. Create a project-scoped API key, budget, and usage alerts.
5. Record the new prompt ID and model for the Vercel configuration below.
6. Revoke or rotate the former `VITE_OPENAI_API_KEY` and
   `VITE_GOOGLE_API_KEY` values if they were ever deployed; Vite variables are
   browser-visible and the local obsolete entries have been removed.

## 2. Public API Vercel project

Create a Vercel project named `portfolio-jarvis-api` from this repository with
`backend` as its root directory. Configure:

- `OPENAI_API_KEY`
- `OPENAI_PROMPT_ID`
- `OPENAI_CHAT_MODEL=gpt-4o`
- `CORS_ALLOWED_ORIGINS=https://omshewale.me,http://localhost:5173,https://jarvis-interface.vercel.app`

Deploy a preview and verify `GET /health` and `POST /chat`. Configure the
frontend project and the secondary Jarvis UI with:

```text
VITE_JARVIS_API_URL=https://<portfolio-jarvis-api-domain>
```

The secondary UI remains compatible with the old request fields, but it must
store `response_id` and send it as `previous_response_id` to retain multi-turn
behavior.

Add a Vercel Firewall rate-limit rule for `POST /chat` at 10 requests per minute
per source IP before production promotion.

## 3. Private repository and Azure

1. Create a private GitHub repository named `jarvis-telegram-service` and push
   the local repository at `/Users/omshewale/code/jarvis-telegram-service`.
2. Configure repository secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and
   `AZURE_SUBSCRIPTION_ID` for the included deployment workflow.
3. Set `TELEGRAM_WEBHOOK_SECRET` in the ignored private `.env`; generate a
   high-entropy value with `openssl rand -hex 32`.
4. Run `deploy_aca.sh` once to bind the existing private values as Azure
   Container App secret references. The script keeps `jarvis-backend` at exactly
   one replica while APScheduler remains in-process.
5. Verify the existing Azure hostname is still configured in `WEBHOOK_BASE_URL`,
   then confirm Telegram webhook status after deployment.

For durable processing, provision an Azure Service Bus queue named
`telegram-updates` with duplicate detection enabled, add
`AZURE_SERVICE_BUS_CONNECTION_STRING`, and deploy the same image as a private
`jarvis-worker` Container App with command `python worker.py`. The webhook uses
direct background handling until this variable is configured.

## 4. Cutover and rollback

1. Promote the public API and update both public clients.
2. Confirm successful multi-turn chat, citations, reset behavior, and the
   portfolio `/`, `/projects`, and `/experience` routes.
3. Confirm the old Azure `/chat` endpoint receives no traffic.
4. Deploy the Telegram-only revision to `jarvis-backend` and test an authorized
   message, checkpoint continuity, read-only integrations, task lookup, and a
   non-mutating briefing dry run.
5. Keep the previous combined Azure revision inactive for seven days.

Rollback the public side by restoring the previous client deployment/API URL.
Rollback Telegram independently by reactivating the prior Azure revision.

## 5. Cleanup after seven days

- Retire the combined Azure revision and remove obsolete app secrets.
- Confirm Vercel contains no Telegram, Google, Notion, Supabase, or database
  secrets.
- Confirm Azure contains no public hosted-prompt configuration.
- If the portfolio repository is public, coordinate a `git filter-repo` history
  rewrite to purge the deleted raw knowledge documents; the current working tree
  no longer contains them, but normal deletion does not erase Git history.
