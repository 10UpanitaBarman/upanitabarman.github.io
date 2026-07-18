/**
 * api/generate.js
 *
 * Runs the full pipeline and caches the result in Vercel KV so /api/digest
 * can serve it instantly without re-running everything on every page load.
 *
 * Called two ways:
 *   - Automatically, every morning, by the Vercel Cron entry in vercel.json
 *     (Vercel Cron sends a GET request).
 *   - On demand, by the "Regenerate now" button in the UI (sends POST).
 */

const { kv } = require('@vercel/kv');
const { runPipeline } = require('../lib/pipeline');

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const digest = await runPipeline();
    await kv.set('digest', digest);
    res.status(200).json(digest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
