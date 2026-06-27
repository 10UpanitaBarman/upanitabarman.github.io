const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/schema');

const followUpValidation = [
  body('job_id').notEmpty().withMessage('Job ID is required'),
  body('due_date').notEmpty().withMessage('Due date is required'),
  body('follow_up_type').optional().isIn(['LinkedIn','Email','Application','Interview','Referral']),
];

router.get('/', (req, res) => {
  const db = getDb();
  const { job_id, completed, overdue, this_week } = req.query;

  let sql = `
    SELECT f.*, j.company_name, j.job_title, c.contact_name, c.role_type
    FROM follow_ups f
    LEFT JOIN jobs j ON f.job_id = j.id
    LEFT JOIN contacts c ON f.contact_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (job_id) { sql += ' AND f.job_id = ?'; params.push(job_id); }
  if (completed !== undefined) { sql += ' AND f.completed = ?'; params.push(completed === 'true' ? 1 : 0); }
  if (overdue === 'true') { sql += " AND f.due_date < date('now') AND f.completed = 0"; }
  if (this_week === 'true') { sql += " AND f.due_date BETWEEN date('now') AND date('now', '+7 days') AND f.completed = 0"; }

  sql += ' ORDER BY f.due_date ASC';

  try {
    const followUps = db.prepare(sql).all(...params);
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', followUpValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const { job_id, contact_id, follow_up_type = 'Email', due_date, completed = 0, notes } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO follow_ups (job_id, contact_id, follow_up_type, due_date, completed, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(job_id, contact_id || null, follow_up_type, due_date, completed ? 1 : 0, notes);

    const followUp = db.prepare(`
      SELECT f.*, j.company_name, j.job_title, c.contact_name
      FROM follow_ups f
      LEFT JOIN jobs j ON f.job_id = j.id
      LEFT JOIN contacts c ON f.contact_id = c.id
      WHERE f.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json(followUp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM follow_ups WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Follow-up not found' });

  const { job_id, contact_id, follow_up_type, due_date, completed, notes } = req.body;

  try {
    db.prepare(`
      UPDATE follow_ups SET job_id=?, contact_id=?, follow_up_type=?, due_date=?, completed=?, notes=?
      WHERE id=?
    `).run(job_id, contact_id || null, follow_up_type, due_date, completed ? 1 : 0, notes, req.params.id);

    const followUp = db.prepare(`
      SELECT f.*, j.company_name, j.job_title, c.contact_name
      FROM follow_ups f
      LEFT JOIN jobs j ON f.job_id = j.id
      LEFT JOIN contacts c ON f.contact_id = c.id
      WHERE f.id = ?
    `).get(req.params.id);
    res.json(followUp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/complete', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM follow_ups WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Follow-up not found' });
  db.prepare('UPDATE follow_ups SET completed = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Follow-up marked complete' });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM follow_ups WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Follow-up not found' });
  db.prepare('DELETE FROM follow_ups WHERE id = ?').run(req.params.id);
  res.json({ message: 'Follow-up deleted' });
});

module.exports = router;
