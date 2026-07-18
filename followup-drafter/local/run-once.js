/**
 * run-once.js
 *
 * Headless entrypoint: runs the pipeline exactly once and exits. No Express,
 * no node-cron -- this is what the GitHub Actions daily workflow calls
 * (../.github/workflows/daily-followup-drafts.yml), and what any other
 * external scheduler (a VPS crontab, a Render/Railway cron job) can call
 * too. Same lib/pipeline.js as server.js, so live vs. demo mode and the
 * validation rules behave identically either way.
 *
 * Writes digest.json next to this file (committed back to the repo by the
 * workflow so today's drafts are visible without re-running anything), and
 * posts a short summary to Slack if SLACK_WEBHOOK_URL is set.
 *
 * Usage: node run-once.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { runPipeline } = require('./lib/pipeline');

const { SLACK_WEBHOOK_URL } = process.env;
const DIGEST_PATH = path.join(__dirname, 'digest.json');

function formatSlackMessage(digest) {
  const mode = digest.liveMode ? 'live' : 'demo data';
  if (!digest.tasks.length) {
    return `*Follow-up drafts (${mode})* -- no overdue tasks this morning. Nothing to draft.`;
  }
  const lines = digest.tasks.map(t => {
    const flag = t.issues && t.issues.length ? `:warning: ${t.issues.join('; ')}` : ':white_check_mark: passed checks';
    return `*${t.contact.firstName} ${t.contact.lastName}* (${t.contact.jobTitle}, ${t.contact.company}) -- ${flag}\n${t.draft}`;
  });
  return `*Follow-up drafts (${mode}), ${digest.tasks.length} total. Review and send yourself, nothing here has been sent.*\n\n${lines.join('\n\n')}`;
}

async function postToSlack(digest) {
  if (!SLACK_WEBHOOK_URL) return;
  const res = await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: formatSlackMessage(digest) }),
  });
  if (!res.ok) {
    console.error(`Slack post failed: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  const digest = await runPipeline();
  fs.writeFileSync(DIGEST_PATH, JSON.stringify(digest, null, 2));
  console.log(JSON.stringify(digest, null, 2));

  const flagged = digest.tasks.filter(t => t.issues && t.issues.length);
  console.log(`\n${digest.tasks.length} draft(s) generated, ${flagged.length} flagged for review, liveMode=${digest.liveMode}`);

  await postToSlack(digest);
}

main().catch(err => {
  console.error('run-once failed:', err.message);
  process.exit(1);
});
