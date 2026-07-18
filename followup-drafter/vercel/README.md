# Follow-Up Drafter — Vercel version

Same app, restructured for Vercel: Express -> plain serverless functions,
`node-cron` -> Vercel Cron Jobs, local `digest.json` file -> Vercel KV
(so the cached digest survives between invocations, since Vercel's
filesystem doesn't persist).

## 1. Push this folder to a GitHub repo

Vercel deploys from a git repo (or `vercel` CLI directly). Easiest path:
create a new GitHub repo, push this folder to it.

```
git init
git add .
git commit -m "follow-up drafter"
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Import the project on Vercel

1. **vercel.com** -> **Add New** -> **Project** -> import that GitHub repo.
2. Framework preset: leave as **Other** (no build step needed, it's just
   static files + serverless functions).
3. Deploy. It will build successfully even without any env vars set yet --
   it just runs in demo mode until you add credentials.

## 3. Add a Vercel KV store (this replaces the local digest.json file)

1. In your Vercel project -> **Storage** tab -> **Create Database** ->
   **KV**.
2. Create it, then **Connect** it to this project. Vercel automatically
   adds the `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars for you --
   nothing to copy manually.

## 4. Add your credentials

Project -> **Settings** -> **Environment Variables**. Add:

| Name | Value |
|---|---|
| `HUBSPOT_TOKEN` | from HubSpot private app (see main README for how to get it) |
| `HUBSPOT_OWNER_ID` | Kim's HubSpot user/owner ID |
| `NOTION_TOKEN` | from your Notion integration |
| `OPENAI_API_KEY` | from platform.openai.com |

Redeploy after adding these (Vercel doesn't hot-reload env vars into an
already-deployed build). The app automatically switches to live mode once
`HUBSPOT_TOKEN` and `OPENAI_API_KEY` are both present.

## 5. The schedule

`vercel.json` already has:

```json
{ "crons": [{ "path": "/api/generate", "schedule": "0 7 * * 1-5" }] }
```

This is the part that replaces `node-cron` -- Vercel itself calls
`/api/generate` on this schedule, no always-on server required. A few
things worth knowing:

- **Check your plan's cron limits before relying on this.** Vercel's cron
  behavior and limits (frequency, number of cron jobs, exact-time
  guarantees) have changed between plan tiers over time -- confirm current
  limits on Vercel's pricing/docs page for your plan before you depend on
  it firing at exactly 7am every day.
- Cron invocations are unauthenticated GET requests to that path by
  default. If you want to restrict who can trigger `/api/generate`
  manually (the "Regenerate now" button uses POST to the same path), you
  can add a shared secret check inside `api/generate.js` for POST requests
  specifically, or put the route behind Vercel's deployment protection.

## 6. Open it

Vercel gives you a URL like `your-project.vercel.app`. That's the
dashboard -- same UI as the local version, "Regenerate now" button and all.
Kim bookmarks that URL and opens it each morning.

## Local testing before you deploy

```
npm install -g vercel
npm install
vercel dev
```

`vercel dev` emulates the serverless + KV environment locally. You'll need
to run `vercel link` (connects this folder to your Vercel project) and
`vercel env pull` (pulls the KV and credential env vars down to a local
`.env.local`) first, since KV isn't something you can fully fake without
Vercel's infrastructure behind it.

## What's different from the local/Express version

| | Local (Express) version | This Vercel version |
|---|---|---|
| Server | Always-on Node process | Serverless functions, spin up per request |
| Schedule | `node-cron` inside the process | Vercel Cron Jobs (native) |
| Cached digest | `digest.json` on local disk | Vercel KV |
| Where it runs | Your machine / a VPS / Railway etc | Vercel's infrastructure |
| Keeping it running | Your job (pm2, systemd, etc) | Vercel's job |

The actual logic -- HubSpot search, Notion/HubSpot context resolution,
OpenAI drafting, validation rules -- is identical in `lib/pipeline.js` to
the local version. Same HubSpot/Notion connection steps apply; see the main
README for those.
