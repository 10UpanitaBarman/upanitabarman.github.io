const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const { getDb } = require('../db/schema');

function getJobsData(db) {
  return db.prepare(`
    SELECT id, company_name, job_title, job_url, location, salary,
      CASE visa_sponsorship WHEN 1 THEN 'Yes' ELSE 'No' END as visa_sponsorship,
      priority, date_found, date_applied, application_status,
      CASE cv_tailored WHEN 1 THEN 'Yes' ELSE 'No' END as cv_tailored,
      CASE cover_letter_tailored WHEN 1 THEN 'Yes' ELSE 'No' END as cover_letter_tailored,
      CASE portfolio_sent WHEN 1 THEN 'Yes' ELSE 'No' END as portfolio_sent,
      CASE loom_sent WHEN 1 THEN 'Yes' ELSE 'No' END as loom_sent,
      CASE referral_received WHEN 1 THEN 'Yes' ELSE 'No' END as referral_received,
      notes, next_action, next_follow_up_date, created_at, updated_at
    FROM jobs ORDER BY created_at DESC
  `).all();
}

function getContactsData(db) {
  return db.prepare(`
    SELECT c.id, c.company_name, c.contact_name, c.role_type, j.job_title,
      c.linkedin_url, c.email,
      CASE c.linkedin_connected WHEN 1 THEN 'Yes' ELSE 'No' END as linkedin_connected,
      CASE c.linkedin_message_sent WHEN 1 THEN 'Yes' ELSE 'No' END as linkedin_message_sent,
      CASE c.email_sent WHEN 1 THEN 'Yes' ELSE 'No' END as email_sent,
      CASE c.response_received WHEN 1 THEN 'Yes' ELSE 'No' END as response_received,
      c.response_notes, c.last_contacted_date, c.next_follow_up_date
    FROM contacts c LEFT JOIN jobs j ON c.job_id = j.id
    ORDER BY c.created_at DESC
  `).all();
}

router.get('/csv/jobs', (req, res) => {
  const db = getDb();
  const jobs = getJobsData(db);

  if (jobs.length === 0) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="jobs.csv"');
    return res.send('No data found');
  }

  const headers = Object.keys(jobs[0]);
  const csvRows = [
    headers.join(','),
    ...jobs.map(row =>
      headers.map(h => {
        const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    )
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="jobs.csv"');
  res.send(csvRows.join('\n'));
});

router.get('/csv/contacts', (req, res) => {
  const db = getDb();
  const contacts = getContactsData(db);

  if (contacts.length === 0) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    return res.send('No data found');
  }

  const headers = Object.keys(contacts[0]);
  const csvRows = [
    headers.join(','),
    ...contacts.map(row =>
      headers.map(h => {
        const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    )
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
  res.send(csvRows.join('\n'));
});

router.get('/excel', (req, res) => {
  const db = getDb();
  const jobs = getJobsData(db);
  const contacts = getContactsData(db);

  const followUps = db.prepare(`
    SELECT f.id, j.company_name, j.job_title, c.contact_name, f.follow_up_type,
      f.due_date, CASE f.completed WHEN 1 THEN 'Yes' ELSE 'No' END as completed, f.notes
    FROM follow_ups f
    LEFT JOIN jobs j ON f.job_id = j.id
    LEFT JOIN contacts c ON f.contact_id = c.id
    ORDER BY f.due_date ASC
  `).all();

  const interviews = db.prepare(`
    SELECT i.id, j.company_name, j.job_title, i.interview_stage, i.interview_date,
      i.interviewer_name, i.interview_notes,
      CASE i.preparation_done WHEN 1 THEN 'Yes' ELSE 'No' END as preparation_done,
      i.outcome, i.next_steps
    FROM interviews i LEFT JOIN jobs j ON i.job_id = j.id
    ORDER BY i.interview_date ASC
  `).all();

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(jobs), 'Jobs');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(contacts), 'Contacts');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(followUps), 'Follow-ups');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(interviews), 'Interviews');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="job-crm-export.xlsx"');
  res.send(buf);
});

module.exports = router;
