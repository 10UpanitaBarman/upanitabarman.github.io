import { useState, useEffect, useCallback } from 'react';
import { interviewsApi, jobsApi } from '../utils/api';
import { Plus, Edit2, Trash2, AlertCircle, X, CalendarCheck, CheckCircle } from 'lucide-react';

const EMPTY = {
  job_id: '', interview_stage: '', interview_date: '', interviewer_name: '',
  interview_notes: '', preparation_done: false, outcome: '', next_steps: ''
};

const STAGES = ['Phone Screen', 'Technical Interview', 'Hiring Manager Interview', 'Panel Interview', 'Case Study', 'Final Round', 'Offer Discussion'];

const OUTCOMES = ['', 'Passed', 'Failed', 'Pending', 'Withdrawn'];

const OUTCOME_COLORS = {
  'Passed': { bg: '#F0FDF4', text: '#16A34A' },
  'Failed': { bg: '#FFF1F2', text: '#BE123C' },
  'Pending': { bg: '#FEFCE8', text: '#A16207' },
  'Withdrawn': { bg: '#F9FAFB', text: '#6B7280' },
};

function InterviewForm({ interview, jobs, onClose, onSaved }) {
  const [form, setForm] = useState(interview ? {
    ...interview, preparation_done: !!interview.preparation_done
  } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!form.job_id) e.job_id = 'Required';
    if (!form.interview_stage.trim()) e.interview_stage = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (interview?.id) await interviewsApi.update(interview.id, form);
      else await interviewsApi.create(form);
      onSaved();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{interview ? 'Edit Interview' : 'Add Interview'}</h3>
          <button className="btn btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && <div className="alert alert-error"><AlertCircle size={15} />{errors.submit}</div>}
            <div className="form-grid">
              <div className="form-group span-2">
                <label>Job *</label>
                <select name="job_id" value={form.job_id} onChange={handleChange}>
                  <option value="">Select a job...</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.company_name} · {j.job_title}</option>)}
                </select>
                {errors.job_id && <span className="error-msg">{errors.job_id}</span>}
              </div>
              <div className="form-group">
                <label>Interview Stage *</label>
                <input list="stages-list" name="interview_stage" value={form.interview_stage} onChange={handleChange} placeholder="e.g. Technical Interview" />
                <datalist id="stages-list">{STAGES.map(s => <option key={s} value={s} />)}</datalist>
                {errors.interview_stage && <span className="error-msg">{errors.interview_stage}</span>}
              </div>
              <div className="form-group">
                <label>Interview Date</label>
                <input type="date" name="interview_date" value={form.interview_date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Interviewer Name</label>
                <input name="interviewer_name" value={form.interviewer_name} onChange={handleChange} placeholder="e.g. Sarah Chen" />
              </div>
              <div className="form-group">
                <label>Outcome</label>
                <select name="outcome" value={form.outcome} onChange={handleChange}>
                  {OUTCOMES.map(o => <option key={o} value={o}>{o || '— Pending —'}</option>)}
                </select>
              </div>
              <div className="form-group span-2">
                <label>Interview Notes</label>
                <textarea name="interview_notes" value={form.interview_notes} onChange={handleChange} placeholder="What was discussed? Key topics covered..." rows={3} />
              </div>
              <div className="form-group span-2">
                <label>Next Steps</label>
                <input name="next_steps" value={form.next_steps} onChange={handleChange} placeholder="e.g. Final round scheduled for next week" />
              </div>
              <div className="form-group span-2">
                <label className="checkbox-item">
                  <input type="checkbox" name="preparation_done" checked={form.preparation_done} onChange={handleChange} />
                  Preparation Done
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : interview ? 'Save Changes' : 'Add Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, jRes] = await Promise.all([interviewsApi.getAll(), jobsApi.getAll()]);
      setInterviews(iRes.data);
      setJobs(jRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this interview?')) return;
    await interviewsApi.delete(id);
    load();
  };

  const handleSaved = () => { setShowForm(false); setEditing(null); load(); };

  const upcoming = interviews.filter(i => !i.outcome && i.interview_date && new Date(i.interview_date) >= new Date());
  const past = interviews.filter(i => i.outcome || !i.interview_date || new Date(i.interview_date) < new Date());

  const InterviewTable = ({ items, title }) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">{title}</div>
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company / Job</th>
                  <th>Stage</th>
                  <th>Date</th>
                  <th>Interviewer</th>
                  <th>Prep Done</th>
                  <th>Outcome</th>
                  <th>Next Steps</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => {
                  const oc = OUTCOME_COLORS[i.outcome] || {};
                  return (
                    <tr key={i.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{i.company_name}</div>
                        {i.job_title && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{i.job_title}</div>}
                      </td>
                      <td>{i.interview_stage}</td>
                      <td>{i.interview_date || '—'}</td>
                      <td>{i.interviewer_name || '—'}</td>
                      <td>{i.preparation_done ? <CheckCircle size={15} color="var(--success)" /> : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No</span>}</td>
                      <td>
                        {i.outcome
                          ? <span className="badge" style={{ background: oc.bg, color: oc.text }}>{i.outcome}</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Pending</span>}
                      </td>
                      <td title={i.next_steps}>{i.next_steps ? i.next_steps.slice(0, 40) + (i.next_steps.length > 40 ? '...' : '') : '—'}</td>
                      <td className="td-actions">
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-icon" onClick={() => { setEditing(i); setShowForm(true); }}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-icon btn-danger" onClick={() => handleDelete(i.id)}>
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
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Interview Tracker</h2>
          <p>{upcoming.length} upcoming · {past.length} completed</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus size={15} /> Add Interview
        </button>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : interviews.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <CalendarCheck />
              <h3>No interviews yet</h3>
              <p>Track your interviews here to monitor your pipeline</p>
            </div>
          </div>
        ) : (
          <>
            <InterviewTable items={upcoming} title="📅 Upcoming Interviews" />
            <InterviewTable items={past} title="📋 Past Interviews" />
          </>
        )}
      </div>

      {showForm && <InterviewForm interview={editing} jobs={jobs} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={handleSaved} />}
    </div>
  );
}
