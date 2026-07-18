# Follow-Up Drafter

Every morning: pulls Kim's overdue HubSpot tasks, resolves each prospect's
context from a Notion page or a logged HubSpot email, drafts a short
follow-up with OpenAI, checks it against a style rubric, and puts every
draft on one dashboard. Nothing is ever sent automatically.

## Run it (demo mode, no credentials needed)

```
npm install
npm start
```

Open **http://localhost:3000**. You'll see 3 example prospects with
pre-written drafts, so you can see the whole thing work before connecting
anything real.

## Connect HubSpot

1. In HubSpot: **Settings** (gear icon) -> **Integrations** -> **Private Apps**.
2. Click **Create a private app**, give it a name (e.g. "Follow-Up Drafter").
3. Under **Scopes**, add:
   - `crm.objects.tasks.read`
   - `crm.objects.tasks.write`
   - `crm.objects.contacts.read`
   - `crm.objects.emails.read`
4. Save. Copy the access token it shows you (you only see it once).
5. Put it in `.env` as `HUBSPOT_TOKEN`.
6. Find Kim's HubSpot user/owner ID: **Settings** -> **Users & Teams** ->
   click her name -> the ID is in the page URL. Put it in `.env` as
   `HUBSPOT_OWNER_ID`.
7. On any task you want this to pick up, add two custom properties (one-time
   setup in **Settings -> Properties -> Task properties**):
   - `context_source` (a dropdown or text field: `notion`, `hubspot_email`,
     or `manual`)
   - `context_ref` (text field: a Notion page ID, or a HubSpot logged email's
     engagement ID)

   Set both when you log the task. This is what tells the app where to find
   that prospect's context.

## Connect Notion

1. Go to **notion.so/my-integrations** and log in.
2. Click **New integration**. Name it, pick the workspace.
3. Under **Capabilities**, check only **Read content**.
4. Click **Submit**, then copy the **Internal Integration Secret**. Put it
   in `.env` as `NOTION_TOKEN`.
5. **Important:** an integration can't see any page until you share that page
   with it. Open the specific page with the prospect's context, click
   **•••** -> **Connections** (or **Add connections**), and add your
   integration by name. Do this for every page you want the app to read.
6. Get the page ID from the page's URL: it's the 32-character string right
   before any `?`, e.g. `notion.so/Priya-Notes-1a2b3c4d5e6f7g8h...` — the
   `1a2b3c4d...` part is the ID. That's the `context_ref` value for that task.

## Connect OpenAI

1. **platform.openai.com/api-keys** -> **Create new secret key**.
2. Put it in `.env` as `OPENAI_API_KEY`. Note this needs billing set up on
   the OpenAI account (separate page under Settings -> Billing).

## Full setup

```
cp .env.example .env
# open .env and fill in HUBSPOT_TOKEN, HUBSPOT_OWNER_ID, NOTION_TOKEN, OPENAI_API_KEY
npm install
npm start
```

Once all three tokens are set, the app automatically switches from demo mode
to live mode, no code changes needed.

## Making it actually run every morning by itself

**Recommended for this repo: `../.github/workflows/daily-followup-drafts.yml`.**
It runs `npm run generate` (calls `run-once.js`, a one-shot headless run —
no server, no process to keep alive) on GitHub's own scheduler, and posts
the result to Slack. Nothing to host, nothing that can silently stop
because a laptop went to sleep. See the top-level `followup-drafter/README.md`
for the repo secrets it needs.

If you'd rather run the Express app itself continuously (e.g. for the live
dashboard with the **Regenerate now** button), the schedule is already in
the code too (`node-cron`, default `0 7 * * 1-5` — 7am, Monday to Friday).
**The one requirement: the server has to stay running.** A laptop that goes
to sleep, or a terminal window you close, stops the schedule. Ways to keep
it running:

- **Simplest — your own machine, always on:** run `npm start` inside a
  process manager like `pm2` (`npm install -g pm2`, then `pm2 start
  server.js`, `pm2 save`, `pm2 startup`), so it survives reboots and
  terminal closes.
- **Small cloud host:** deploy to Railway, Render, or Fly.io (all have free
  or near-free tiers for something this light). Push this folder, set the
  environment variables in their dashboard, done.
- **Change the schedule:** edit `CRON_SCHEDULE` in `.env` if 7am doesn't
  suit you, e.g. `0 6 * * 1-5` for 6am weekdays. Format is
  `minute hour day-of-month month day-of-week`.

Kim just opens the same URL each morning. The dashboard shows whatever the
last scheduled run produced, and has a **Regenerate now** button if she
wants a fresh pull mid-day (e.g. after adding a new task).

## What's still a stub vs. what's real

Everything that calls HubSpot, Notion, or OpenAI makes real HTTP requests.
The pipeline itself (`fetchOverdueTasks`, context resolution, the OpenAI
call, validation) lives in `lib/pipeline.js`, shared by `server.js` (the
Express app + in-process cron) and `run-once.js` (the headless entrypoint
GitHub Actions calls). The only assumption baked in is the two custom
HubSpot task properties (`context_source`, `context_ref`) described above —
replace that logic in `fetchOverdueTasks()` in `lib/pipeline.js` if you'd
rather resolve the linked contact and context a different way (e.g. via
HubSpot's associations API directly).
