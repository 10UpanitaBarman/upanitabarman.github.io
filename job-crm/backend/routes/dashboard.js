const express = require('express');
const router = express.Router();
const { getDb } = require('../db/schema');

router.get('/metrics', (req, res) => {
  const db = getDb();

  try {
    const totalSaved = db.prepare("SELECT COUNT(*) as count FROM jobs").get().count;
    const totalApplied = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE application_status NOT IN ('Saved','Preparing')").get().count;
    const totalInterviews = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE application_status IN ('Interview 1','Interview 2','Final')").get().count;
    const totalOffers = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE application_status = 'Offer'").get().count;
    const totalRejected = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE application_status = 'Rejected'").get().count;
    const totalGhosted = db.prepare("SELECT COUNT(*) as count FROM jobs WHERE application_status = 'Ghosted'").get().count;

    const recruiterContacts = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE role_type = 'Recruiter'").get().count;
    const hiringManagerContacts = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE role_type = 'Hiring Manager'").get().count;
    const employeeContacts = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE role_type IN ('Team Member','Director','VP','Alumni')").get().count;

    const linkedInTotal = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE linkedin_message_sent = 1").get().count;
    const linkedInResponded = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE linkedin_message_sent = 1 AND response_received = 1").get().count;
    const emailTotal = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE email_sent = 1").get().count;
    const emailResponded = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE email_sent = 1 AND response_received = 1").get().count;

    const linkedInResponseRate = linkedInTotal > 0 ? Math.round((linkedInResponded / linkedInTotal) * 100) : 0;
    const emailResponseRate = emailTotal > 0 ? Math.round((emailResponded / emailTotal) * 100) : 0;
    const appToInterviewRate = totalApplied > 0 ? Math.round((totalInterviews / totalApplied) * 100) : 0;
    const interviewToOfferRate = totalInterviews > 0 ? Math.round((totalOffers / totalInterviews) * 100) : 0;

    const followUpThisWeek = db.prepare(`
      SELECT COUNT(*) as count FROM follow_ups
      WHERE due_date BETWEEN date('now') AND date('now', '+7 days') AND completed = 0
    `).get().count;

    const overdueFollowUps = db.prepare(`
      SELECT COUNT(*) as count FROM follow_ups
      WHERE due_date < date('now') AND completed = 0
    `).get().count;

    const statusBreakdown = db.prepare(`
      SELECT application_status, COUNT(*) as count FROM jobs GROUP BY application_status
    `).all();

    const priorityBreakdown = db.prepare(`
      SELECT priority, COUNT(*) as count FROM jobs GROUP BY priority
    `).all();

    const recentActivity = db.prepare(`
      SELECT 'job' as type, company_name as title, job_title as subtitle, created_at
      FROM jobs ORDER BY created_at DESC LIMIT 5
    `).all();

    res.json({
      totalSaved, totalApplied, totalInterviews, totalOffers, totalRejected, totalGhosted,
      recruiterContacts, hiringManagerContacts, employeeContacts,
      linkedInResponseRate, emailResponseRate, appToInterviewRate, interviewToOfferRate,
      followUpThisWeek, overdueFollowUps,
      statusBreakdown, priorityBreakdown, recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/today', (req, res) => {
  const db = getDb();

  try {
    const todayFollowUps = db.prepare(`
      SELECT f.*, j.company_name, j.job_title, c.contact_name
      FROM follow_ups f
      LEFT JOIN jobs j ON f.job_id = j.id
      LEFT JOIN contacts c ON f.contact_id = c.id
      WHERE f.due_date = date('now') AND f.completed = 0
      ORDER BY f.follow_up_type
    `).all();

    const overdueFollowUps = db.prepare(`
      SELECT f.*, j.company_name, j.job_title, c.contact_name
      FROM follow_ups f
      LEFT JOIN jobs j ON f.job_id = j.id
      LEFT JOIN contacts c ON f.contact_id = c.id
      WHERE f.due_date < date('now') AND f.completed = 0
      ORDER BY f.due_date ASC
      LIMIT 10
    `).all();

    const upcomingInterviews = db.prepare(`
      SELECT i.*, j.company_name, j.job_title
      FROM interviews i
      LEFT JOIN jobs j ON i.job_id = j.id
      WHERE i.interview_date >= date('now') AND i.outcome IS NULL
      ORDER BY i.interview_date ASC
      LIMIT 5
    `).all();

    res.json({ todayFollowUps, overdueFollowUps, upcomingInterviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
