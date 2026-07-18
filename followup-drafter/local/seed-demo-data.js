/**
 * seed-demo-data.js
 *
 * One-time setup script: creates 3 realistic (fictional) contacts and 3
 * overdue tasks in your real HubSpot portal, so `npm run generate` (or the
 * daily GitHub Actions run) has something real to pull instead of running
 * in demo mode. The context note is written straight into the task's own
 * Notes field (hs_task_body) -- a standard field on every portal, no
 * custom properties required (those are gated behind paid HubSpot tiers
 * for Task/engagement objects, and a free/trial portal will not offer
 * them at all).
 *
 * Why this exists as a script rather than being done by hand: HubSpot
 * write access is scoped to your own private app token, which only you
 * hold. Nothing outside your account (including this script's author) can
 * create records in your portal without it.
 *
 * Requires HUBSPOT_TOKEN and HUBSPOT_OWNER_ID (same private app token and
 * scopes as everything else in this project -- see ../README.md -- plus
 * `crm.objects.contacts.write`, which this script needs but
 * run-once.js/server.js do not).
 *
 * Usage: node seed-demo-data.js
 * Safe to run more than once for the contacts (looked up by email first).
 * Re-running creates additional tasks each time though, since tasks have
 * no natural unique key here -- delete the old ones in HubSpot if you
 * reseed.
 */

require('dotenv').config();

const { HUBSPOT_TOKEN, HUBSPOT_OWNER_ID } = process.env;

if (!HUBSPOT_TOKEN || !HUBSPOT_OWNER_ID) {
  console.error('Set HUBSPOT_TOKEN and HUBSPOT_OWNER_ID (in .env, or as env vars) before running this.');
  process.exit(1);
}

function headers() {
  return { 'content-type': 'application/json', authorization: `Bearer ${HUBSPOT_TOKEN}` };
}

async function hubspotFetch(method, url, body) {
  const res = await fetch(url, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

// ---------------------------------------------------------------------------
// The 3 example prospects, as real contacts + real overdue tasks this time.
// Same people as the built-in demo mode, so the live output is directly
// comparable to what demo mode already showed.
// ---------------------------------------------------------------------------

const PROSPECTS = [
  {
    email: 'priya.anand@northlakebio.example',
    firstname: 'Priya', lastname: 'Anand', company: 'Northlake Bio', jobtitle: 'Senior Scientist, Analytical Development',
    taskSubject: 'Follow up: Priya Anand, ELISA turnaround pain (BPI West)',
    contextNote: "Priya flagged 'hot' after BPI West. Pain point: ELISA turnaround (48h) vs. need for same-day titer data during clone selection. Wants Amperia throughput comparison. Budget conversation expected in Q3.",
  },
  {
    email: 'marcus.feld@solaratx.example',
    firstname: 'Marcus', lastname: 'Feld', company: 'Solara Therapeutics', jobtitle: 'Director, Bioprocess Development',
    taskSubject: 'Follow up: Marcus Feld, viral vector titer bottleneck',
    contextNote: "Subject: 'Viral vector titer bottleneck'. Marcus said his team's downstream scale-up runs are held up waiting two days for titer results from an outside lab. Asked whether Amperia handles viral vector samples directly.",
  },
  {
    email: 'elena.vasquez@brightpathbio.example',
    firstname: 'Elena', lastname: 'Vasquez', company: 'BrightPath Biologics', jobtitle: 'Group Leader, Protein Analytics',
    taskSubject: 'Follow up: Elena Vasquez, plate loading question',
    contextNote: "Elena asked in a call whether Amperia removes manual sample prep entirely or still needs a technician to load plates. Comparing it against a competitor's walk-away system.",
  },
];

// ---------------------------------------------------------------------------
// Contact: reuse by email if it already exists, otherwise create.
// ---------------------------------------------------------------------------

async function findContactByEmail(email) {
  const result = await hubspotFetch('POST', 'https://api.hubapi.com/crm/v3/objects/contacts/search', {
    filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
    properties: ['email'],
    limit: 1,
  });
  return (result.results || [])[0] || null;
}

async function upsertContact(p) {
  const existing = await findContactByEmail(p.email);
  if (existing) {
    console.log(`Contact already exists: ${p.firstname} ${p.lastname} (${existing.id})`);
    return existing.id;
  }
  const created = await hubspotFetch('POST', 'https://api.hubapi.com/crm/v3/objects/contacts', {
    properties: { email: p.email, firstname: p.firstname, lastname: p.lastname, company: p.company, jobtitle: p.jobtitle },
  });
  console.log(`Created contact: ${p.firstname} ${p.lastname} (${created.id})`);
  return created.id;
}

// ---------------------------------------------------------------------------
// Task: overdue (due yesterday), owned by HUBSPOT_OWNER_ID, carrying the
// context note directly in hs_task_body (parsed as contextSource: manual
// by lib/pipeline.js), then associated to the contact via HubSpot's real
// task-contact association.
// ---------------------------------------------------------------------------

async function createOverdueTask(p, contactId) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();
  const created = await hubspotFetch('POST', 'https://api.hubapi.com/crm/v3/objects/tasks', {
    properties: {
      hs_task_subject: p.taskSubject,
      hs_task_body: p.contextNote,
      hs_task_status: 'NOT_STARTED',
      hs_task_priority: 'MEDIUM',
      hs_timestamp: String(yesterday),
      hubspot_owner_id: HUBSPOT_OWNER_ID,
    },
  });
  console.log(`Created task: ${p.taskSubject} (${created.id})`);

  await hubspotFetch('PUT', `https://api.hubapi.com/crm/v4/objects/tasks/${created.id}/associations/default/contacts/${contactId}`);
  console.log(`Associated task ${created.id} -> contact ${contactId}`);

  return created.id;
}

async function main() {
  for (const p of PROSPECTS) {
    const contactId = await upsertContact(p);
    await createOverdueTask(p, contactId);
  }
  console.log('\nDone. Run `npm run generate` (or wait for the daily GitHub Actions run) to draft follow-ups for these.');
}

main().catch(err => {
  console.error('seed-demo-data failed:', err.message);
  process.exit(1);
});
