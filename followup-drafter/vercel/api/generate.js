/**
 * api/generate.js
 *
 * Runs the full pipeline and caches the result in Vercel KV so /api/digest
 * can serve it instantly without re-running everything on every page load.
 * KV is optional: without KV_REST_API_URL/KV_REST_API_TOKEN set (e.g. no KV
 * store provisioned yet), this still runs the pipeline and returns the
 * digest, it just cannot cache it -- so /api/digest will not show it until
 * a KV store is connected. That is what lets demo mode work immediately
 * after deploy, before provisioning anything.
 *
 * Called two ways:
 *   - Automatically, every morning, by the Vercel Cron entry in vercel.json
 *     (Vercel Cron sends a GET request).
 *   - On demand, by the "Regenerate now" button in the UI (sends POST).
 */

const { runPipeline } = require('../lib/pipeline');

const kvAvailable = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const digest = await runPipeline();
    if (kvAvailable) {
      const { kv } = require('@vercel/kv');
      await kv.set('digest', digest);
    }
    res.status(200).json(digest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
