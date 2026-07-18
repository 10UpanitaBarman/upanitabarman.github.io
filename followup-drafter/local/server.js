/**
 * server.js
 *
 * Runs every morning on a schedule (node-cron), and also on demand from the
 * "Regenerate now" button in the UI. Pulls every overdue HubSpot task owned
 * by Kim, resolves each prospect's context from wherever it actually lives
 * (a Notion page or a logged HubSpot email), drafts a follow-up with OpenAI,
 * validates it, writes the result to digest.json, and serves it to the
 * frontend. Nothing is ever auto-sent.
 *
 * All the actual pull/draft/validate work lives in lib/pipeline.js, shared
 * with run-once.js (the headless entrypoint used by the GitHub Actions
 * daily cron -- see ../.github/workflows/daily-followup-drafts.yml).
 *
 * Setup:
 *   npm install
 *   cp .env.example .env        (then fill in your tokens)
 *   npm start
 *   open http://localhost:3000
 *
 * With no HUBSPOT_TOKEN/OPENAI_API_KEY set, it runs in demo mode automatically.
 */

require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { runPipeline } = require('./lib/pipeline');

const { PORT = 3000, CRON_SCHEDULE = '0 7 * * 1-5' } = process.env;

const DIGEST_PATH = path.join(__dirname, 'digest.json');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function runAndPersist() {
  const digest = await runPipeline();
  fs.writeFileSync(DIGEST_PATH, JSON.stringify(digest, null, 2));
  return digest;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get('/api/digest', (req, res) => {
  if (fs.existsSync(DIGEST_PATH)) {
    res.json(JSON.parse(fs.readFileSync(DIGEST_PATH, 'utf-8')));
  } else {
    res.json({ generatedAt: null, liveMode: false, tasks: [] });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const digest = await runAndPersist();
    res.json(digest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Schedule -- this is what makes it run every morning by itself, as long as
// this process stays alive (pm2, Railway, Render, a VPS...). If you would
// rather not keep a process running 24/7, use the GitHub Actions workflow
// (../.github/workflows/daily-followup-drafts.yml) or the vercel/ folder
// instead -- both fire the same pipeline on a schedule with nothing to keep
// alive yourself.
// ---------------------------------------------------------------------------

cron.schedule(CRON_SCHEDULE, () => {
  console.log(`[cron] running scheduled digest (${CRON_SCHEDULE})...`);
  runAndPersist()
    .then(d => console.log(`[cron] done, ${d.tasks.length} drafts generated`))
    .catch(err => console.error('[cron] failed:', err.message));
});

app.listen(PORT, () => {
  console.log(`Follow-up drafter running at http://localhost:${PORT}`);
  console.log(`Scheduled to auto-run: ${CRON_SCHEDULE} (server must stay running)`);
});
