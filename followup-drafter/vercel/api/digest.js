/**
 * api/digest.js
 *
 * Serves whatever the last run of /api/generate produced. Read-only, fast,
 * safe to call every time the dashboard loads. Without a KV store connected
 * (KV_REST_API_URL/KV_REST_API_TOKEN unset), there is nowhere to have
 * cached a digest, so this always reports "not generated yet" -- click
 * "Regenerate now" to see output computed fresh for that one request.
 */

const kvAvailable = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

module.exports = async (req, res) => {
  if (!kvAvailable) {
    res.status(200).json({ generatedAt: null, liveMode: false, tasks: [] });
    return;
  }

  try {
    const { kv } = require('@vercel/kv');
    const digest = await kv.get('digest');
    res.status(200).json(digest || { generatedAt: null, liveMode: false, tasks: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
