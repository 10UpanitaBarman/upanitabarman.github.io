/**
 * lib/pipeline.js
 *
 * All the actual work: pull overdue HubSpot tasks, resolve each prospect's
 * context (Notion page or logged HubSpot email), draft with OpenAI, validate.
 * Shared by api/generate.js (writes a fresh digest) and callable from
 * anywhere else that needs it. No Express, no cron here -- those are
 * handled by Vercel's own routing and Cron Jobs feature.
 */

const {
  HUBSPOT_TOKEN,
  HUBSPOT_OWNER_ID,
  NOTION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

// ---------------------------------------------------------------------------
// Prompt + validation
// Cold-email principles applied: signal-based personalization (one real
// detail from the context note, not a generic recap), pain over features,
// one CTA, no closed loop / no hard sell, short and plain.
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You write short follow-up emails for a life-sciences instrument company's commercial team, to a working scientist. Rules, strictly enforced:
- 60-90 words. Plain text only, no markdown, no emoji, no HTML.
- Lead with the prospect's specific pain from the context note, not product features.
- End with one specific call to action: ask the recipient to pick a date and time for a short Teams call to discuss further. Propose the call directly, do not offer to just send a document or use a generic "let me know" close.
- Peer-to-peer tone: one scientist writing to another, not sales copy.
- No filler openers ("I hope this finds you well", "Just wanted to follow up").
- No buzzwords ("synergy", "solutions", "leverage", "excited to share").
- Do not use em dashes anywhere in the email. Use commas or separate sentences instead.
- Do not use contractions. Write full words instead: do not, you are, it is, I am, cannot, that is.
- Leave the door open, do not force urgency or imply this is a last chance.
- Sign off with just the sender's first name.`;

const BUZZWORDS = ['synergy', 'leverage', 'excited to', 'solutions', 'circle back',
  'touch base', 'reach out', 'hope this finds you well', 'in this day and age',
  'last chance', "don't miss out"];

const CONTRACTIONS = ["don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't",
  "can't", "couldn't", "won't", "wouldn't", "shouldn't", "i'm", "i've", "i'll", "i'd",
  "you're", "you've", "you'll", "you'd", "we're", "we've", "we'll", "we'd",
  "they're", "they've", "they'll", "it's", "that's", "there's", "who's", "what's",
  "let's", "here's"];

function buildUserPrompt(task) {
  const c = task.contact;
  return `Draft a follow-up email.

Recipient: ${c.firstName} ${c.lastName}, ${c.jobTitle} at ${c.company}
Sender: Kim, SVP Commercial at Abselion
Product under discussion: Amperia

Context note (source: ${task.contextSource}):
${task.contextNote}

Output only the email body text. Start with "Hi ${c.firstName},".`;
}

function validateDraft(draft, firstName) {
  const issues = [];
  const wordCount = draft.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 45 || wordCount > 105) issues.push(`length out of range (${wordCount} words, target 60-90)`);
  if (!draft.includes(firstName)) issues.push('recipient first name missing from draft');
  const lowered = draft.toLowerCase();
  const hits = BUZZWORDS.filter(b => lowered.includes(b));
  if (hits.length) issues.push(`buzzwords/filler detected: ${hits.join(', ')}`);
  if (lowered.includes('dear ') || lowered.includes('to whom it may concern')) {
    issues.push('overly formal opener');
  }
  if (draft.includes('\u2014') || draft.includes('--')) {
    issues.push('em dash used (not allowed)');
  }
  const contractionHits = CONTRACTIONS.filter(c => lowered.includes(c));
  if (contractionHits.length) issues.push(`contractions used: ${contractionHits.join(', ')}`);
  if (!/teams call|call to discuss|schedule a call|pick a (date|time)/i.test(lowered)) {
    issues.push('no Teams call scheduling ask detected');
  }
  return issues;
}

// ---------------------------------------------------------------------------
// HubSpot -- real calls, active once HUBSPOT_TOKEN is set
// ---------------------------------------------------------------------------

function hubspotHeaders() {
  return { 'content-type': 'application/json', authorization: `Bearer ${HUBSPOT_TOKEN}` };
}

async function hubspotFetch(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: hubspotHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HubSpot ${method} ${url} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function fetchOverdueTasks() {
  // Assumes two custom task properties: context_source ("notion" |
  // "hubspot_email" | "manual") and context_ref (a Notion page id or a
  // HubSpot email engagement id). Set these when the task is logged.
  const body = {
    filterGroups: [{
      filters: [
        { propertyName: 'hs_task_status', operator: 'NEQ', value: 'COMPLETED' },
        { propertyName: 'hubspot_owner_id', operator: 'EQ', value: HUBSPOT_OWNER_ID },
      ],
    }],
    properties: ['hs_task_subject', 'associated_contact_id', 'context_source', 'context_ref'],
  };
  const result = await hubspotFetch('POST', 'https://api.hubapi.com/crm/v3/objects/tasks/search', body);
  const tasks = [];
  for (const r of result.results || []) {
    const p = r.properties;
    if (!p.associated_contact_id) continue;
    const contact = await fetchContact(p.associated_contact_id);
    tasks.push({
      taskId: r.id,
      contact,
      contextSource: p.context_source || 'manual',
      contextRef: p.context_ref || '',
    });
  }
  return tasks;
}

async function fetchContact(contactId) {
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,company,jobtitle`;
  const result = await hubspotFetch('GET', url);
  const p = result.properties || {};
  return {
    firstName: p.firstname || '',
    lastName: p.lastname || '',
    company: p.company || '',
    jobTitle: p.jobtitle || '',
  };
}

async function fetchContextFromHubSpotEmail(engagementId) {
  const url = `https://api.hubapi.com/crm/v3/objects/emails/${engagementId}?properties=hs_email_text,hs_email_subject`;
  const result = await hubspotFetch('GET', url);
  const p = result.properties || {};
  const text = (p.hs_email_text || '').split(/\n--\s*\n|On .* wrote:/)[0].trim();
  return `Subject: '${p.hs_email_subject || ''}'. ${text}`;
}

async function logDraftBackToHubSpot(task) {
  // Sets hs_task_body to the draft, leaves status NOT_STARTED. Never
  // auto-sent, never auto-completed -- Kim reviews and sends from HubSpot.
  const url = `https://api.hubapi.com/crm/v3/objects/tasks/${task.taskId}`;
  await hubspotFetch('PATCH', url, { properties: { hs_task_body: task.draft, hs_task_status: 'NOT_STARTED' } });
}

// ---------------------------------------------------------------------------
// Notion -- real calls, active once NOTION_TOKEN is set
// ---------------------------------------------------------------------------

async function fetchContextFromNotion(pageId) {
  const url = `https://api.notion.com/v1/blocks/${pageId}/children`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' },
  });
  if (!res.ok) throw new Error(`Notion GET ${url} -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const result = await res.json();
  const chunks = [];
  for (const block of result.results || []) {
    const rt = (block[block.type] && block[block.type].rich_text) || [];
    const text = rt.map(r => r.plain_text).join('');
    if (text) chunks.push(text);
  }
  return chunks.join(' ') || '[Notion page had no readable text blocks]';
}

async function resolveContext(task) {
  if (task.contextSource === 'notion') return fetchContextFromNotion(task.contextRef);
  if (task.contextSource === 'hubspot_email') return fetchContextFromHubSpotEmail(task.contextRef);
  return task.contextRef || 'No additional context provided.';
}

// ---------------------------------------------------------------------------
// OpenAI
// ---------------------------------------------------------------------------

async function callOpenAI(systemPrompt, userPrompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      temperature: 0.6,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI -> ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ---------------------------------------------------------------------------
// Demo mode -- 3 example prospects, no credentials needed
// ---------------------------------------------------------------------------

function demoTasks() {
  return [
    {
      taskId: 'TASK-4471',
      contact: { firstName: 'Priya', lastName: 'Anand', company: 'Northlake Bio', jobTitle: 'Senior Scientist, Analytical Development' },
      contextSource: 'notion',
      contextRef: 'notion-page-abc123',
      contextNote: "Priya flagged 'hot' after BPI West. Pain point: ELISA turnaround (48h) vs. need for same-day titer data during clone selection. Wants Amperia throughput comparison. Budget conversation expected in Q3.",
      draft: "Hi Priya, good talking at BPI West. You mentioned your ELISA titer turnaround is the bottleneck during clone selection, and 48 hours is a long wait when you are screening daily. Amperia runs the same titer measurement in about a minute per sample, directly from crude supernatant. Would you be open to a short Teams call this week? Pick a date and time that works and I will send the invite. Kim",
    },
    {
      taskId: 'TASK-4502',
      contact: { firstName: 'Marcus', lastName: 'Feld', company: 'Solara Therapeutics', jobTitle: 'Director, Bioprocess Development' },
      contextSource: 'hubspot_email',
      contextRef: 'eng-77291',
      contextNote: "Subject: 'Viral vector titer bottleneck'. Marcus said his team's downstream scale-up runs are held up waiting two days for titer results from an outside lab. Asked whether Amperia handles viral vector samples directly.",
      draft: "Hi Marcus, thanks for flagging the titer bottleneck on your downstream scale up runs. Waiting two days on an outside lab for results is a real drag on a schedule that is already tight. Amperia measures viral vector titer directly, no outside lab, results in about a minute per sample. Could we set up a short Teams call to walk through the data? Pick a time that suits you. Kim",
    },
    {
      taskId: 'TASK-4519',
      contact: { firstName: 'Elena', lastName: 'Vasquez', company: 'BrightPath Biologics', jobTitle: 'Group Leader, Protein Analytics' },
      contextSource: 'manual',
      contextRef: '',
      contextNote: "Elena asked in a call whether Amperia removes manual sample prep entirely or still needs a technician to load plates. Comparing it against a competitor's walk-away system.",
      draft: "Hi Elena, good question on plate loading. Amperia still needs a technician to load the plate, it is not a walk away system end to end, but the run itself is fully automated and takes about a minute per sample once loaded. I would rather show you than describe it. Are you free for a short Teams call this week to pick a date and time and see it in action? Kim",
    },
  ];
}

// ---------------------------------------------------------------------------
// The pipeline itself
// ---------------------------------------------------------------------------

async function runPipeline() {
  const liveMode = Boolean(HUBSPOT_TOKEN && OPENAI_API_KEY);
  let tasks;

  if (liveMode) {
    tasks = await fetchOverdueTasks();
    for (const task of tasks) {
      task.contextNote = await resolveContext(task);
      const userPrompt = buildUserPrompt(task);
      task.draft = await callOpenAI(SYSTEM_PROMPT, userPrompt);
      task.issues = validateDraft(task.draft, task.contact.firstName);
      await logDraftBackToHubSpot(task);
    }
  } else {
    tasks = demoTasks();
    for (const task of tasks) {
      task.issues = validateDraft(task.draft, task.contact.firstName);
    }
  }

  return { generatedAt: new Date().toISOString(), liveMode, tasks };
}

module.exports = { runPipeline };
