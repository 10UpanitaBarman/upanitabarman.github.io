# Follow-Up Drafter

Every morning: pulls Kim's overdue HubSpot tasks, resolves each prospect's
context from a Notion page or a logged HubSpot email, drafts a short
follow-up with OpenAI (following cold-email best practice: signal-based
personalization, pain over features, one soft CTA, no closed loop), checks
it against a style rubric (60-90 words, no em dashes, no contractions, asks
to schedule a Teams call), and puts every draft on one dashboard. Nothing
is ever sent automatically -- Kim reviews and sends herself.

## Three ways to run the daily schedule, pick one

- **`local/` + GitHub Actions (what this repo actually uses)** -- the
  `local/` Node app, plus `../.github/workflows/daily-followup-drafts.yml`,
  which runs `npm run generate` (a headless one-shot, no Express, no
  process to keep alive) on a cron schedule using GitHub's own runners.
  Zero extra hosting: it lives in this repo and fires for free on GitHub's
  scheduler. Delivery is a Slack message (set `SLACK_WEBHOOK_URL`) plus a
  private, access-controlled build artifact -- the digest is deliberately
  **never committed to git**, since this repo is public and a live digest
  contains real prospect names and pain points. See the workflow file
  itself for exact setup (which repo secrets to add, how to pick the UTC
  cron time for Kim's timezone).

- **`local/` on its own** -- run it with `npm start`, keep it running with
  `pm2` or deploy it to Railway/Render/a VPS, and let its built-in
  `node-cron` schedule fire the same pipeline plus serve the interactive
  dashboard (`/`, with a "Regenerate now" button) at all times. More to
  keep alive than the GitHub Actions route, but gives you a live, editable
  dashboard rather than a static Slack message.

- **`vercel/`** -- the same pipeline logic, restructured for Vercel:
  serverless functions instead of an Express server, Vercel's native Cron
  Jobs instead of `node-cron`, Vercel KV instead of a local file for
  caching the digest between runs. No server to keep alive yourself,
  Vercel handles that, at the cost of a Vercel account + a KV store.

Each folder has its own README with exact setup steps for that path.

## Shared setup, either way

### Connect HubSpot

1. HubSpot -> **Settings** -> **Integrations** -> **Private Apps** ->
   **Create a private app**.
2. Scopes tab, add:
   - `crm.objects.tasks.read`
   - `crm.objects.tasks.write`
   - `crm.objects.contacts.read`
   - `crm.objects.emails.read`
3. Save, copy the access token (only shown once) -> this is `HUBSPOT_TOKEN`.
4. Find Kim's owner ID: **Settings** -> **Users & Teams** -> click her name
   -> the ID is in the URL -> this is `HUBSPOT_OWNER_ID`.
5. Create two custom task properties, one time, in **Settings ->
   Properties -> Task properties**:
   - `context_source` -- text or dropdown: `notion`, `hubspot_email`, or
     `manual`
   - `context_ref` -- text: a Notion page ID, or a HubSpot logged email's
     engagement ID
   Set both whenever you log a follow-up task, so the app knows where to
   pull that prospect's context from.

### Connect Notion

1. **notion.so/my-integrations** -> **New integration** -> name it, pick
   the workspace.
2. Capabilities: only **Read content** checked.
3. Copy the **Internal Integration Secret** -> this is `NOTION_TOKEN`.
4. Open each specific page with a prospect's context, click **•••** ->
   **Connections** (or **Add connections**) -> add your integration by
   name. An integration cannot read a page it has not been explicitly
   shared with -- this step is easy to miss.
5. Get the page ID from the page's URL: the 32-character string right
   before any `?`. That is the `context_ref` value for that task.

### Connect OpenAI

1. **platform.openai.com/api-keys** -> **Create new secret key** -> this
   is `OPENAI_API_KEY`. Needs billing set up on the OpenAI account
   (Settings -> Billing).

### Connect Slack (only needed for the GitHub Actions path)

1. **api.slack.com/apps** -> **Create New App** -> **From scratch** -> pick
   the workspace.
2. **Incoming Webhooks** -> toggle on -> **Add New Webhook to Workspace**
   -> pick the channel Kim's digest should land in.
3. Copy the webhook URL (`https://hooks.slack.com/services/...`) -> this is
   `SLACK_WEBHOOK_URL`.

### Wiring it into GitHub Actions

The four HubSpot/Notion/OpenAI values above, plus `SLACK_WEBHOOK_URL`, need
to exist as **repo secrets**, not a `.env` file, for the scheduled workflow
to see them: this repo's **Settings** -> **Secrets and variables** ->
**Actions** -> **New repository secret**, once for each of `HUBSPOT_TOKEN`,
`HUBSPOT_OWNER_ID`, `NOTION_TOKEN`, `OPENAI_API_KEY`, `SLACK_WEBHOOK_URL`.
Until they're set, the scheduled workflow still runs successfully every day
in demo mode, so you can confirm the schedule itself fires correctly before
connecting real accounts.

## How to verify a token works, without wiring up the whole app

```
curl -H "Authorization: Bearer YOUR_HUBSPOT_TOKEN" \
  "https://api.hubapi.com/crm/v3/objects/contacts?limit=1"
```

A contact record back means the token and scopes are good. A 401 means the
token or scopes are wrong.

## What triggers live mode vs. demo mode

The app checks for `HUBSPOT_TOKEN` AND `OPENAI_API_KEY` together. Missing
either one means it falls back to 3 example prospects (Priya, Marcus,
Elena) so you can always see it working. If a specific task's
`context_source` is `notion` but `NOTION_TOKEN` is not set, that one task's
context resolution will fail even though HubSpot and OpenAI are working.

## Validation rules baked into every draft

- 60-90 words, plain text only
- Leads with the prospect's actual pain from the context note, not product
  features
- Ends by asking to pick a date and time for a short Teams call
- No em dashes
- No contractions
- No buzzwords, no filler openers, no hard-sell closing

All of this lives in `SYSTEM_PROMPT` (in `server.js` for the local version,
`lib/pipeline.js` for the Vercel version) -- edit it there if the tone or
rules need to change.
