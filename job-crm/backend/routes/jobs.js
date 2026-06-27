const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { getDb } = require('../db/schema');

const jobValidation = [
  body('company_name').notEmpty().withMessage('Company name is required'),
  body('job_title').notEmpty().withMessage('Job title is required'),
  body('priority').optional().isIn(['Low','Medium','High','Dream']),
  body('application_status').optional().isIn([
    'Saved','Preparing','Applied','Recruiter Screen','Interview 1','Interview 2','Final','Offer','Rejected','Ghosted'
  ]),
];

router.get('/', (req, res) => {
  const db = getDb();
  const { status, priority, company, search, follow_up_from, follow_up_to, sort = 'created_at', order = 'desc' } = req.query;

  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];

  if (status) { sql += ' AND application_status = ?'; params.push(status); }
  if (priority) { sql += ' AND priority = ?'; params.push(priority); }
  if (company) { sql += ' AND company_name LIKE ?'; params.push(`%${company}%`); }
  if (search) { sql += ' AND (company_name LIKE ? OR job_title LIKE ? OR notes LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (follow_up_from) { sql += ' AND next_follow_up_date >= ?'; params.push(follow_up_from); }
  if (follow_up_to) { sql += ' AND next_follow_up_date <= ?'; params.push(follow_up_to); }

  const allowedSorts = ['company_name','job_title','priority','application_status','date_applied','next_follow_up_date','created_at'];
  const safeSort = allowedSorts.includes(sort) ? sort : 'created_at';
  const safeOrder = order === 'asc' ? 'ASC' : 'DESC';
  sql += ` ORDER BY ${safeSort} ${safeOrder}`;

  try {
    const jobs = db.prepare(sql).all(...params);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

router.post('/', jobValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const {
    company_name, job_title, job_url, location, salary, visa_sponsorship = 0,
    priority = 'Medium', date_found, date_applied, application_status = 'Saved',
    cv_tailored = 0, cover_letter_tailored = 0, portfolio_sent = 0, loom_sent = 0,
    referral_received = 0, notes, next_action, next_follow_up_date
  } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO jobs (company_name, job_title, job_url, location, salary, visa_sponsorship,
        priority, date_found, date_applied, application_status, cv_tailored, cover_letter_tailored,
        portfolio_sent, loom_sent, referral_received, notes, next_action, next_follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(company_name, job_title, job_url, location, salary, visa_sponsorship ? 1 : 0,
      priority, date_found, date_applied, application_status,
      cv_tailored ? 1 : 0, cover_letter_tailored ? 1 : 0, portfolio_sent ? 1 : 0,
      loom_sent ? 1 : 0, referral_received ? 1 : 0, notes, next_action, next_follow_up_date);

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', jobValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM jobs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Job not found' });

  const {
    company_name, job_title, job_url, location, salary, visa_sponsorship,
    priority, date_found, date_applied, application_status,
    cv_tailored, cover_letter_tailored, portfolio_sent, loom_sent,
    referral_received, notes, next_action, next_follow_up_date
  } = req.body;

  try {
    db.prepare(`
      UPDATE jobs SET company_name=?, job_title=?, job_url=?, location=?, salary=?,
        visa_sponsorship=?, priority=?, date_found=?, date_applied=?, application_status=?,
        cv_tailored=?, cover_letter_tailored=?, portfolio_sent=?, loom_sent=?,
        referral_received=?, notes=?, next_action=?, next_follow_up_date=?
      WHERE id=?
    `).run(company_name, job_title, job_url, location, salary, visa_sponsorship ? 1 : 0,
      priority, date_found, date_applied, application_status,
      cv_tailored ? 1 : 0, cover_letter_tailored ? 1 : 0, portfolio_sent ? 1 : 0,
      loom_sent ? 1 : 0, referral_received ? 1 : 0, notes, next_action, next_follow_up_date,
      req.params.id);

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM jobs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Job not found' });
  db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
  res.json({ message: 'Job deleted' });
});

module.exports = router;
