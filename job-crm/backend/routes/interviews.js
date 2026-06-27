const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/schema');

const interviewValidation = [
  body('job_id').notEmpty().withMessage('Job ID is required'),
  body('interview_stage').notEmpty().withMessage('Interview stage is required'),
];

router.get('/', (req, res) => {
  const db = getDb();
  const { job_id } = req.query;

  let sql = `
    SELECT i.*, j.company_name, j.job_title, j.application_status
    FROM interviews i
    LEFT JOIN jobs j ON i.job_id = j.id
    WHERE 1=1
  `;
  const params = [];

  if (job_id) { sql += ' AND i.job_id = ?'; params.push(job_id); }

  sql += ' ORDER BY i.interview_date ASC';

  try {
    const interviews = db.prepare(sql).all(...params);
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', interviewValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const { job_id, interview_stage, interview_date, interviewer_name, interview_notes, preparation_done = 0, outcome, next_steps } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO interviews (job_id, interview_stage, interview_date, interviewer_name, interview_notes, preparation_done, outcome, next_steps)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(job_id, interview_stage, interview_date, interviewer_name, interview_notes, preparation_done ? 1 : 0, outcome, next_steps);

    const interview = db.prepare(`
      SELECT i.*, j.company_name, j.job_title
      FROM interviews i LEFT JOIN jobs j ON i.job_id = j.id
      WHERE i.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', interviewValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM interviews WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Interview not found' });

  const { job_id, interview_stage, interview_date, interviewer_name, interview_notes, preparation_done, outcome, next_steps } = req.body;

  try {
    db.prepare(`
      UPDATE interviews SET job_id=?, interview_stage=?, interview_date=?, interviewer_name=?,
        interview_notes=?, preparation_done=?, outcome=?, next_steps=?
      WHERE id=?
    `).run(job_id, interview_stage, interview_date, interviewer_name, interview_notes, preparation_done ? 1 : 0, outcome, next_steps, req.params.id);

    const interview = db.prepare(`
      SELECT i.*, j.company_name, j.job_title
      FROM interviews i LEFT JOIN jobs j ON i.job_id = j.id
      WHERE i.id = ?
    `).get(req.params.id);
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM interviews WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Interview not found' });
  db.prepare('DELETE FROM interviews WHERE id = ?').run(req.params.id);
  res.json({ message: 'Interview deleted' });
});

module.exports = router;
