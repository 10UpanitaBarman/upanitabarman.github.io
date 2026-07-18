/**
 * api/digest.js
 *
 * Serves whatever the last run of /api/generate produced. Read-only, fast,
 * safe to call every time the dashboard loads.
 */

const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  try {
    const digest = await kv.get('digest');
    res.status(200).json(digest || { generatedAt: null, liveMode: false, tasks: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
