const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'crm.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      job_url TEXT,
      location TEXT,
      salary TEXT,
      visa_sponsorship INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low','Medium','High','Dream')),
      date_found TEXT,
      date_applied TEXT,
      application_status TEXT DEFAULT 'Saved' CHECK(application_status IN (
        'Saved','Preparing','Applied','Recruiter Screen','Interview 1','Interview 2','Final','Offer','Rejected','Ghosted'
      )),
      cv_tailored INTEGER DEFAULT 0,
      cover_letter_tailored INTEGER DEFAULT 0,
      portfolio_sent INTEGER DEFAULT 0,
      loom_sent INTEGER DEFAULT 0,
      referral_received INTEGER DEFAULT 0,
      notes TEXT,
      next_action TEXT,
      next_follow_up_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
      company_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      role_type TEXT DEFAULT 'Other' CHECK(role_type IN (
        'Recruiter','Hiring Manager','Team Member','Director','VP','Alumni','Other'
      )),
      linkedin_url TEXT,
      email TEXT,
      linkedin_connected INTEGER DEFAULT 0,
      linkedin_message_sent INTEGER DEFAULT 0,
      email_sent INTEGER DEFAULT 0,
      response_received INTEGER DEFAULT 0,
      response_notes TEXT,
      last_contacted_date TEXT,
      next_follow_up_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      follow_up_type TEXT DEFAULT 'Email' CHECK(follow_up_type IN (
        'LinkedIn','Email','Application','Interview','Referral'
      )),
      due_date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      interview_stage TEXT NOT NULL,
      interview_date TEXT,
      interviewer_name TEXT,
      interview_notes TEXT,
      preparation_done INTEGER DEFAULT 0,
      outcome TEXT,
      next_steps TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS jobs_updated_at
      AFTER UPDATE ON jobs
      BEGIN
        UPDATE jobs SET updated_at = datetime('now') WHERE id = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS contacts_updated_at
      AFTER UPDATE ON contacts
      BEGIN
        UPDATE contacts SET updated_at = datetime('now') WHERE id = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS follow_ups_updated_at
      AFTER UPDATE ON follow_ups
      BEGIN
        UPDATE follow_ups SET updated_at = datetime('now') WHERE id = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS interviews_updated_at
      AFTER UPDATE ON interviews
      BEGIN
        UPDATE interviews SET updated_at = datetime('now') WHERE id = NEW.id;
      END;
  `);
}

module.exports = { getDb };
