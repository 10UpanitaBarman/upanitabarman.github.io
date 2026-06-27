# 🎯 Job Application CRM

A local web app to manage your job search like a sales CRM pipeline.

## Features

- **Dashboard** — metrics, conversion rates, and today's action items
- **Job Applications** — full pipeline tracking with status colour tags and outreach completeness scores
- **Contacts / Outreach** — recruiter, hiring manager, and employee networking tracker
- **Follow-ups** — overdue, today, and upcoming tasks organised by urgency
- **Interview Tracker** — stage-by-stage interview log with outcomes
- **Export** — CSV and Excel export for all data
- **Outreach Completeness Score** — automated 0–100 score per job

## Tech Stack

| Layer    | Tech                  |
|----------|-----------------------|
| Frontend | React + Vite          |
| Backend  | Node.js / Express     |
| Database | SQLite (better-sqlite3) |
| Charts   | Recharts              |
| Icons    | Lucide React          |
| Export   | xlsx                  |

## Setup

### Prerequisites
- Node.js 18+

### 1. Install backend dependencies

```bash
cd job-crm/backend
npm install
```

### 2. Seed the database (optional — adds example data)

```bash
node db/seed.js
```

### 3. Start the backend

```bash
node server.js
# or for auto-reload:
npm run dev
```

The API runs on **http://localhost:3001**

### 4. Install frontend dependencies

```bash
cd job-crm/frontend
npm install
```

### 5. Start the frontend

```bash
npm run dev
```

The app runs on **http://localhost:3000**

## Database

SQLite file is stored at `backend/db/crm.db`. It is created automatically on first run.

### Tables

- `jobs` — job opportunities and application tracking
- `contacts` — outreach contacts linked to jobs
- `follow_ups` — scheduled follow-up tasks
- `interviews` — interview stages and outcomes

## Outreach Completeness Score

Each job gets an automatic score out of 100:

| Action                         | Points |
|-------------------------------|--------|
| Recruiter contacted            | 25     |
| Hiring Manager contacted       | 25     |
| Team Member contacted          | 20     |
| Follow-up date set             | 15     |
| Portfolio or Loom video sent   | 15     |

## Job Strategy Rules

**Dream / High priority:** Contact 1 recruiter, 1 hiring manager, 2 team members, 1 senior leader or alumni.

**Medium priority:** Contact 1 recruiter, 1 hiring manager.

**Low priority:** Apply directly or recruiter contact only.

## API Endpoints

| Method | Path                         | Description           |
|--------|------------------------------|-----------------------|
| GET    | /api/jobs                    | List jobs (filterable)|
| POST   | /api/jobs                    | Create job            |
| PUT    | /api/jobs/:id                | Update job            |
| DELETE | /api/jobs/:id                | Delete job            |
| GET    | /api/contacts                | List contacts         |
| POST   | /api/contacts                | Create contact        |
| GET    | /api/follow-ups              | List follow-ups       |
| PATCH  | /api/follow-ups/:id/complete | Mark complete         |
| GET    | /api/interviews              | List interviews       |
| GET    | /api/dashboard/metrics       | Dashboard metrics     |
| GET    | /api/dashboard/today         | Today's action items  |
| GET    | /api/export/csv/jobs         | Export jobs as CSV    |
| GET    | /api/export/csv/contacts     | Export contacts CSV   |
| GET    | /api/export/excel            | Export all as Excel   |
