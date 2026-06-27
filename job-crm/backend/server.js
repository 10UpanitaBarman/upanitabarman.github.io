const express = require('express');
const cors = require('cors');
const path = require('path');

const jobsRouter = require('./routes/jobs');
const contactsRouter = require('./routes/contacts');
const followUpsRouter = require('./routes/followups');
const interviewsRouter = require('./routes/interviews');
const dashboardRouter = require('./routes/dashboard');
const exportRouter = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/jobs', jobsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/follow-ups', followUpsRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/export', exportRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Job CRM API running on http://localhost:${PORT}`);
});

module.exports = app;
