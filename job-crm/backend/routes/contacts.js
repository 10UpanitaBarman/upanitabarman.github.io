const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/schema');

const contactValidation = [
  body('company_name').notEmpty().withMessage('Company name is required'),
  body('contact_name').notEmpty().withMessage('Contact name is required'),
  body('role_type').optional().isIn(['Recruiter','Hiring Manager','Team Member','Director','VP','Alumni','Other']),
];

router.get('/', (req, res) => {
  const db = getDb();
  const { job_id, role_type, company, search } = req.query;

  let sql = `
    SELECT c.*, j.job_title, j.application_status as job_status
    FROM contacts c
    LEFT JOIN jobs j ON c.job_id = j.id
    WHERE 1=1
  `;
  const params = [];

  if (job_id) { sql += ' AND c.job_id = ?'; params.push(job_id); }
  if (role_type) { sql += ' AND c.role_type = ?'; params.push(role_type); }
  if (company) { sql += ' AND c.company_name LIKE ?'; params.push(`%${company}%`); }
  if (search) { sql += ' AND (c.contact_name LIKE ? OR c.company_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  sql += ' ORDER BY c.created_at DESC';

  try {
    const contacts = db.prepare(sql).all(...params);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const contact = db.prepare(`
    SELECT c.*, j.job_title, j.company_name as job_company
    FROM contacts c
    LEFT JOIN jobs j ON c.job_id = j.id
    WHERE c.id = ?
  `).get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

router.post('/', contactValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const {
    job_id, company_name, contact_name, role_type = 'Other',
    linkedin_url, email, linkedin_connected = 0, linkedin_message_sent = 0,
    email_sent = 0, response_received = 0, response_notes,
    last_contacted_date, next_follow_up_date
  } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO contacts (job_id, company_name, contact_name, role_type, linkedin_url, email,
        linkedin_connected, linkedin_message_sent, email_sent, response_received, response_notes,
        last_contacted_date, next_follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(job_id || null, company_name, contact_name, role_type, linkedin_url, email,
      linkedin_connected ? 1 : 0, linkedin_message_sent ? 1 : 0, email_sent ? 1 : 0,
      response_received ? 1 : 0, response_notes, last_contacted_date, next_follow_up_date);

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', contactValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM contacts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact not found' });

  const {
    job_id, company_name, contact_name, role_type,
    linkedin_url, email, linkedin_connected, linkedin_message_sent,
    email_sent, response_received, response_notes,
    last_contacted_date, next_follow_up_date
  } = req.body;

  try {
    db.prepare(`
      UPDATE contacts SET job_id=?, company_name=?, contact_name=?, role_type=?,
        linkedin_url=?, email=?, linkedin_connected=?, linkedin_message_sent=?,
        email_sent=?, response_received=?, response_notes=?, last_contacted_date=?, next_follow_up_date=?
      WHERE id=?
    `).run(job_id || null, company_name, contact_name, role_type,
      linkedin_url, email, linkedin_connected ? 1 : 0, linkedin_message_sent ? 1 : 0,
      email_sent ? 1 : 0, response_received ? 1 : 0, response_notes,
      last_contacted_date, next_follow_up_date, req.params.id);

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM contacts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact not found' });
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Contact deleted' });
});

module.exports = router;
