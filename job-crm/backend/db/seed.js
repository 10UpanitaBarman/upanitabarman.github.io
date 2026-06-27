const { getDb } = require('./schema');

const db = getDb();

const jobs = [
  {
    company_name: 'Stripe', job_title: 'Senior Product Manager', job_url: 'https://stripe.com/jobs',
    location: 'London, UK', salary: '£120,000 - £150,000', visa_sponsorship: 1,
    priority: 'Dream', date_found: '2024-01-10', date_applied: '2024-01-15',
    application_status: 'Interview 1', cv_tailored: 1, cover_letter_tailored: 1,
    portfolio_sent: 1, loom_sent: 1, referral_received: 0,
    notes: 'Great culture, strong engineering team', next_action: 'Prepare for interview',
    next_follow_up_date: '2024-01-20'
  },
  {
    company_name: 'Monzo', job_title: 'Product Manager - Growth', job_url: 'https://monzo.com/careers',
    location: 'London, UK', salary: '£90,000 - £110,000', visa_sponsorship: 1,
    priority: 'High', date_found: '2024-01-08', date_applied: '2024-01-12',
    application_status: 'Recruiter Screen', cv_tailored: 1, cover_letter_tailored: 1,
    portfolio_sent: 0, loom_sent: 0, referral_received: 1,
    notes: 'Referred by Sarah from growth team', next_action: 'Follow up with recruiter',
    next_follow_up_date: '2024-01-18'
  },
  {
    company_name: 'Revolut', job_title: 'Lead Product Manager', job_url: 'https://revolut.com/careers',
    location: 'Remote', salary: '£100,000 - £130,000', visa_sponsorship: 0,
    priority: 'High', date_found: '2024-01-05', date_applied: '2024-01-09',
    application_status: 'Applied', cv_tailored: 1, cover_letter_tailored: 0,
    portfolio_sent: 0, loom_sent: 0, referral_received: 0,
    notes: 'Fast growing, good equity', next_action: 'Send follow-up email',
    next_follow_up_date: '2024-01-16'
  },
  {
    company_name: 'Wise', job_title: 'Product Manager - International', job_url: 'https://wise.com/careers',
    location: 'London, UK', salary: '£85,000 - £105,000', visa_sponsorship: 1,
    priority: 'Medium', date_found: '2024-01-03', date_applied: null,
    application_status: 'Preparing', cv_tailored: 0, cover_letter_tailored: 0,
    portfolio_sent: 0, loom_sent: 0, referral_received: 0,
    notes: 'Tailoring CV for fintech focus', next_action: 'Finish tailored CV',
    next_follow_up_date: '2024-01-17'
  },
  {
    company_name: 'Deliveroo', job_title: 'Senior PM - Marketplace', job_url: 'https://deliveroo.co.uk/careers',
    location: 'London, UK', salary: '£95,000 - £115,000', visa_sponsorship: 0,
    priority: 'Medium', date_found: '2023-12-28', date_applied: '2024-01-02',
    application_status: 'Rejected', cv_tailored: 1, cover_letter_tailored: 1,
    portfolio_sent: 0, loom_sent: 0, referral_received: 0,
    notes: 'Rejected at application stage - no feedback', next_action: null,
    next_follow_up_date: null
  },
  {
    company_name: 'Bumble', job_title: 'PM - User Growth', job_url: 'https://bumble.com/careers',
    location: 'London, UK', salary: '£80,000 - £100,000', visa_sponsorship: 0,
    priority: 'Low', date_found: '2024-01-11', date_applied: null,
    application_status: 'Saved', cv_tailored: 0, cover_letter_tailored: 0,
    portfolio_sent: 0, loom_sent: 0, referral_received: 0,
    notes: 'Interesting role, lower priority', next_action: 'Apply when time permits',
    next_follow_up_date: null
  }
];

const insertJob = db.prepare(`
  INSERT INTO jobs (company_name, job_title, job_url, location, salary, visa_sponsorship, priority,
    date_found, date_applied, application_status, cv_tailored, cover_letter_tailored,
    portfolio_sent, loom_sent, referral_received, notes, next_action, next_follow_up_date)
  VALUES (@company_name, @job_title, @job_url, @location, @salary, @visa_sponsorship, @priority,
    @date_found, @date_applied, @application_status, @cv_tailored, @cover_letter_tailored,
    @portfolio_sent, @loom_sent, @referral_received, @notes, @next_action, @next_follow_up_date)
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) insertJob.run(row);
});

const existing = db.prepare('SELECT COUNT(*) as count FROM jobs').get();
if (existing.count === 0) {
  insertMany(jobs);

  const contactsData = [
    { job_id: 1, company_name: 'Stripe', contact_name: 'James Wilson', role_type: 'Recruiter', linkedin_url: 'https://linkedin.com/in/jameswilson', email: 'james.wilson@stripe.com', linkedin_connected: 1, linkedin_message_sent: 1, email_sent: 1, response_received: 1, response_notes: 'Positive response, moving forward', last_contacted_date: '2024-01-14', next_follow_up_date: '2024-01-21' },
    { job_id: 1, company_name: 'Stripe', contact_name: 'Sarah Chen', role_type: 'Hiring Manager', linkedin_url: 'https://linkedin.com/in/sarahchen', email: null, linkedin_connected: 1, linkedin_message_sent: 1, email_sent: 0, response_received: 0, response_notes: null, last_contacted_date: '2024-01-13', next_follow_up_date: '2024-01-22' },
    { job_id: 2, company_name: 'Monzo', contact_name: 'Tom Baker', role_type: 'Recruiter', linkedin_url: 'https://linkedin.com/in/tombaker', email: 'tom.baker@monzo.com', linkedin_connected: 1, linkedin_message_sent: 1, email_sent: 1, response_received: 1, response_notes: 'Scheduled a call for next week', last_contacted_date: '2024-01-11', next_follow_up_date: '2024-01-18' },
    { job_id: 3, company_name: 'Revolut', contact_name: 'Anna Smith', role_type: 'Hiring Manager', linkedin_url: 'https://linkedin.com/in/annasmith', email: null, linkedin_connected: 0, linkedin_message_sent: 1, email_sent: 0, response_received: 0, response_notes: null, last_contacted_date: '2024-01-08', next_follow_up_date: '2024-01-16' }
  ];

  const insertContact = db.prepare(`
    INSERT INTO contacts (job_id, company_name, contact_name, role_type, linkedin_url, email,
      linkedin_connected, linkedin_message_sent, email_sent, response_received, response_notes,
      last_contacted_date, next_follow_up_date)
    VALUES (@job_id, @company_name, @contact_name, @role_type, @linkedin_url, @email,
      @linkedin_connected, @linkedin_message_sent, @email_sent, @response_received, @response_notes,
      @last_contacted_date, @next_follow_up_date)
  `);
  const insertContacts = db.transaction((rows) => { for (const row of rows) insertContact.run(row); });
  insertContacts(contactsData);

  const followUpsData = [
    { job_id: 1, contact_id: 1, follow_up_type: 'Interview', due_date: '2024-01-20', completed: 0, notes: 'Confirm interview details' },
    { job_id: 2, contact_id: 3, follow_up_type: 'Email', due_date: '2024-01-18', completed: 0, notes: 'Follow up on recruiter screen timing' },
    { job_id: 3, contact_id: 4, follow_up_type: 'LinkedIn', due_date: '2024-01-16', completed: 0, notes: 'Send follow-up message to hiring manager' },
    { job_id: 4, contact_id: null, follow_up_type: 'Application', due_date: '2024-01-17', completed: 0, notes: 'Submit application once CV is ready' }
  ];

  const insertFollowUp = db.prepare(`
    INSERT INTO follow_ups (job_id, contact_id, follow_up_type, due_date, completed, notes)
    VALUES (@job_id, @contact_id, @follow_up_type, @due_date, @completed, @notes)
  `);
  const insertFollowUps = db.transaction((rows) => { for (const row of rows) insertFollowUp.run(row); });
  insertFollowUps(followUpsData);

  const interviewsData = [
    { job_id: 1, interview_stage: 'Phone Screen', interview_date: '2024-01-18', interviewer_name: 'James Wilson', interview_notes: 'Introductory call with recruiter, 30 mins', preparation_done: 1, outcome: 'Passed', next_steps: 'Technical interview scheduled' },
    { job_id: 1, interview_stage: 'Technical Interview', interview_date: '2024-01-22', interviewer_name: 'Sarah Chen', interview_notes: 'Product case study + metrics deep dive', preparation_done: 0, outcome: null, next_steps: null }
  ];

  const insertInterview = db.prepare(`
    INSERT INTO interviews (job_id, interview_stage, interview_date, interviewer_name, interview_notes, preparation_done, outcome, next_steps)
    VALUES (@job_id, @interview_stage, @interview_date, @interviewer_name, @interview_notes, @preparation_done, @outcome, @next_steps)
  `);
  const insertInterviews = db.transaction((rows) => { for (const row of rows) insertInterview.run(row); });
  insertInterviews(interviewsData);

  console.log('Database seeded successfully.');
} else {
  console.log('Database already has data, skipping seed.');
}
