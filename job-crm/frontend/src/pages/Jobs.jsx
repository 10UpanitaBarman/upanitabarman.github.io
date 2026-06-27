import { useState, useEffect, useCallback } from 'react';
import { jobsApi, contactsApi, exportApi } from '../utils/api';
import { Plus, Search, Edit2, Trash2, ExternalLink, FileDown, FileSpreadsheet, AlertCircle, X } from 'lucide-react';
import { APPLICATION_STATUSES, PRIORITIES, STATUS_COLORS, PRIORITY_COLORS, calcOutreachScore } from '../utils/constants';

const EMPTY = {
  company_name: '', job_title: '', job_url: '', location: '', salary: '',
  visa_sponsorship: false, priority: 'Medium', date_found: '', date_applied: '',
  application_status: 'Saved', cv_tailored: false, cover_letter_tailored: false,
  portfolio_sent: false, loom_sent: false, referral_received: false,
  notes: '', next_action: '', next_follow_up_date: ''
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || {};
  return <span className="badge" style={{ background: c.bg, color: c.text, borderColor: c.border }}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const c = PRIORITY_COLORS[priority] || {};
  return (
    <span className="badge" style={{ background: c.bg, color: c.text, gap: 4 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {priority}
    </span>
  );
}

function ScoreBar({ score }) {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#22C55E' : score >= 25 ? '#EAB308' : '#EF4444';
  return (
    <div className="score-bar-wrap">
      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 32 }}>{score}</span>
    </div>
  );
}

function JobForm({ job, onClose, onSaved }) {
  const [form, setForm] = useState(job ? {
    ...job, visa_sponsorship: !!job.visa_sponsorship, cv_tailored: !!job.cv_tailored,
    cover_letter_tailored: !!job.cover_letter_tailored, portfolio_sent: !!job.portfolio_sent,
    loom_sent: !!job.loom_sent, referral_received: !!job.referral_received
  } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.company_name.trim()) e.company_name = 'Required';
    if (!form.job_title.trim()) e.job_title = 'Required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(er => { const n = { ...er }; delete n[name]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (job?.id) await jobsApi.update(job.id, form);
      else await jobsApi.create(form);
      onSaved();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  const CHECKBOXES = [
    { name: 'cv_tailored', label: 'CV Tailored' },
    { name: 'cover_letter_tailored', label: 'Cover Letter' },
    { name: 'portfolio_sent', label: 'Portfolio Sent' },
    { name: 'loom_sent', label: 'Loom Video' },
    { name: 'referral_received', label: 'Referral' },
    { name: 'visa_sponsorship', label: 'Visa Sponsorship' },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{job ? 'Edit Job' : 'Add Job Opportunity'}</h3>
          <button className="btn btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && <div className="alert alert-error"><AlertCircle size={15} />{errors.submit}</div>}
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name *</label>
                <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="e.g. Stripe" />
                {errors.company_name && <span className="error-msg">{errors.company_name}</span>}
              </div>
              <div className="form-group">
                <label>Job Title *</label>
                <input name="job_title" value={form.job_title} onChange={handleChange} placeholder="e.g. Senior PM" />
                {errors.job_title && <span className="error-msg">{errors.job_title}</span>}
              </div>
              <div className="form-group">
                <label>Job URL</label>
                <input type="url" name="job_url" value={form.job_url} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. London, UK" />
              </div>
              <div className="form-group">
                <label>Salary / Compensation</label>
                <input name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. £90k–£110k" />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Application Status</label>
                <select name="application_status" value={form.application_status} onChange={handleChange}>
                  {APPLICATION_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date Found</label>
                <input type="date" name="date_found" value={form.date_found} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Date Applied</label>
                <input type="date" name="date_applied" value={form.date_applied} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Next Follow-up Date</label>
                <input type="date" name="next_follow_up_date" value={form.next_follow_up_date} onChange={handleChange} />
              </div>
              <div className="form-group span-2">
                <label>Next Action</label>
                <input name="next_action" value={form.next_action} onChange={handleChange} placeholder="e.g. Send follow-up email to recruiter" />
              </div>
              <div className="form-group span-2">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes about this opportunity..." />
              </div>
              <div className="form-group span-2">
                <label>Application Checklist</label>
                <div className="checkbox-row">
                  {CHECKBOXES.map(({ name, label }) => (
                    <label key={name} className="checkbox-item">
                      <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : job ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const [jRes, cRes] = await Promise.all([jobsApi.getAll(params), contactsApi.getAll()]);
      setJobs(jRes.data);
      setContacts(cRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    await jobsApi.delete(id);
    load();
  };

  const handleSaved = () => { setShowForm(false); setEditing(null); load(); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Job Applications</h2>
          <p>{jobs.length} opportunities tracked</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportApi.csvJobs()}>
            <FileDown size={14} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportApi.excel()}>
            <FileSpreadsheet size={14} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={15} /> Add Job
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="filters-bar">
          <div className="search-wrap">
            <Search size={15} />
            <input placeholder="Search company, title, notes..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ minWidth: 160 }}>
            <option value="">All Statuses</option>
            {APPLICATION_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))} style={{ minWidth: 130 }}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          {(filters.search || filters.status || filters.priority) && (
            <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ search: '', status: '', priority: '' })}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {error && <div className="alert alert-error"><AlertCircle size={15} />{error}</div>}

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <AlertCircle />
              <h3>No jobs found</h3>
              <p>Add your first job opportunity to get started</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Outreach Score</th>
                    <th>Applied</th>
                    <th>Follow-up</th>
                    <th>Next Action</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => {
                    const score = calcOutreachScore(job, contacts);
                    const followUpDate = job.next_follow_up_date;
                    const isOverdue = followUpDate && new Date(followUpDate) < new Date();
                    return (
                      <tr key={job.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{job.company_name}</div>
                          {job.location && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.location}</div>}
                        </td>
                        <td>
                          <div>{job.job_title}</div>
                          {job.salary && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.salary}</div>}
                        </td>
                        <td><StatusBadge status={job.application_status} /></td>
                        <td><PriorityBadge priority={job.priority} /></td>
                        <td><ScoreBar score={score} /></td>
                        <td style={{ color: job.date_applied ? 'var(--text)' : 'var(--text-muted)' }}>
                          {job.date_applied || '—'}
                        </td>
                        <td style={{ color: isOverdue ? 'var(--danger)' : 'var(--text)', fontWeight: isOverdue ? 600 : 400 }}>
                          {followUpDate || '—'}
                          {isOverdue && <span style={{ fontSize: 11, display: 'block', color: 'var(--danger)' }}>Overdue</span>}
                        </td>
                        <td title={job.next_action}>{job.next_action ? job.next_action.slice(0, 40) + (job.next_action.length > 40 ? '...' : '') : '—'}</td>
                        <td className="td-actions">
                          <div style={{ display: 'flex', gap: 4 }}>
                            {job.job_url && (
                              <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="btn btn-icon" title="Open job">
                                <ExternalLink size={14} />
                              </a>
                            )}
                            <button className="btn btn-icon" title="Edit" onClick={() => { setEditing(job); setShowForm(true); }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn btn-icon btn-danger" title="Delete" onClick={() => handleDelete(job.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showForm && <JobForm job={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={handleSaved} />}
    </div>
  );
}
