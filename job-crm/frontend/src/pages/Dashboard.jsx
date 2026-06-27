import { useState, useEffect } from 'react';
import { dashboardApi, followUpsApi } from '../utils/api';
import { AlertCircle, TrendingUp, Users, Calendar, CheckCircle, Clock, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

const STATUS_PIE_COLORS = {
  'Saved': '#A5B4FC', 'Preparing': '#FCA5A5', 'Applied': '#93C5FD',
  'Recruiter Screen': '#6EE7B7', 'Interview 1': '#FDE68A', 'Interview 2': '#FCD34D',
  'Final': '#C4B5FD', 'Offer': '#86EFAC', 'Rejected': '#FCA5A5', 'Ghosted': '#D1D5DB'
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [m, t] = await Promise.all([dashboardApi.getMetrics(), dashboardApi.getToday()]);
      setMetrics(m.data);
      setToday(t.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleComplete = async (id) => {
    await followUpsApi.complete(id);
    load();
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard...</div>;
  if (error) return <div className="page-body"><div className="alert alert-error"><AlertCircle size={16} />{error}</div></div>;

  const m = metrics;

  const METRIC_CARDS = [
    { label: 'Jobs Saved', value: m.totalSaved, color: '#4F46E5' },
    { label: 'Applied', value: m.totalApplied, color: '#2563EB' },
    { label: 'Interviews', value: m.totalInterviews, color: '#D97706' },
    { label: 'Offers', value: m.totalOffers, color: '#16A34A' },
    { label: 'Rejected', value: m.totalRejected, color: '#DC2626' },
    { label: 'Ghosted', value: m.totalGhosted, color: '#6B7280' },
    { label: 'Recruiter Contacts', value: m.recruiterContacts, color: '#0891B2' },
    { label: 'HM Contacts', value: m.hiringManagerContacts, color: '#7C3AED' },
    { label: 'Employee Contacts', value: m.employeeContacts, color: '#059669' },
  ];

  const RATE_CARDS = [
    { label: 'LinkedIn Response Rate', value: `${m.linkedInResponseRate}%`, sub: 'of messages sent', color: '#0A66C2' },
    { label: 'Email Response Rate', value: `${m.emailResponseRate}%`, sub: 'of emails sent', color: '#EA4335' },
    { label: 'App → Interview', value: `${m.appToInterviewRate}%`, sub: 'conversion rate', color: '#D97706' },
    { label: 'Interview → Offer', value: `${m.interviewToOfferRate}%`, sub: 'conversion rate', color: '#16A34A' },
    { label: 'Follow-ups This Week', value: m.followUpThisWeek, sub: 'pending tasks', color: '#7C3AED' },
    { label: 'Overdue', value: m.overdueFollowUps, sub: 'overdue follow-ups', color: '#DC2626' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Your job search at a glance</p>
        </div>
      </div>
      <div className="page-body">

        {/* Today's Actions */}
        {(today?.todayFollowUps?.length > 0 || today?.overdueFollowUps?.length > 0 || today?.upcomingInterviews?.length > 0) && (
          <div style={{ marginBottom: 24 }}>
            <div className="section-title"><Zap size={18} color="var(--warning)" /> Today's Actions</div>

            {today.overdueFollowUps?.length > 0 && today.overdueFollowUps.map(f => (
              <div key={f.id} className="today-item overdue">
                <div>
                  <strong>{f.company_name}</strong> — {f.follow_up_type}
                  {f.contact_name && <span className="text-muted"> · {f.contact_name}</span>}
                  <div className="text-muted text-sm">Overdue: {f.due_date}</div>
                </div>
                <button className="btn btn-success btn-sm" onClick={() => handleComplete(f.id)}>
                  <CheckCircle size={13} /> Done
                </button>
              </div>
            ))}

            {today.todayFollowUps?.map(f => (
              <div key={f.id} className="today-item upcoming">
                <div>
                  <strong>{f.company_name}</strong> — {f.follow_up_type}
                  {f.contact_name && <span className="text-muted"> · {f.contact_name}</span>}
                  <div className="text-muted text-sm">Due today · {f.notes}</div>
                </div>
                <button className="btn btn-success btn-sm" onClick={() => handleComplete(f.id)}>
                  <CheckCircle size={13} /> Done
                </button>
              </div>
            ))}

            {today.upcomingInterviews?.map(i => (
              <div key={i.id} className="today-item" style={{ borderLeft: '3px solid var(--primary)' }}>
                <div>
                  <strong>{i.company_name}</strong> — {i.interview_stage}
                  <div className="text-muted text-sm"><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{i.interview_date} · {i.interviewer_name}</div>
                </div>
                <span className="badge" style={{ background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE' }}>Upcoming Interview</span>
              </div>
            ))}
          </div>
        )}

        {/* Main Metrics */}
        <div className="metrics-grid">
          {METRIC_CARDS.map(c => (
            <div className="metric-card" key={c.label}>
              <div className="metric-label">{c.label}</div>
              <div className="metric-value" style={{ color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Rate Metrics */}
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {RATE_CARDS.map(c => (
            <div className="metric-card" key={c.label}>
              <div className="metric-label">{c.label}</div>
              <div className="metric-value" style={{ color: c.color, fontSize: 24 }}>{c.value}</div>
              <div className="metric-sub">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header"><h3>Applications by Status</h3></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={m.statusBreakdown} dataKey="count" nameKey="application_status" cx="50%" cy="50%" outerRadius={80} label={({ application_status, count }) => `${application_status} (${count})`} labelLine={false} fontSize={11}>
                    {m.statusBreakdown.map((entry) => (
                      <Cell key={entry.application_status} fill={STATUS_PIE_COLORS[entry.application_status] || '#D1D5DB'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Jobs by Priority</h3></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={m.priorityBreakdown} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
