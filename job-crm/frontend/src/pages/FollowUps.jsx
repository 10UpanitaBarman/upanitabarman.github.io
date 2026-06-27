import { useState, useEffect, useCallback } from 'react';
import { followUpsApi, jobsApi, contactsApi } from '../utils/api';
import { Plus, CheckCircle, Trash2, AlertCircle, X, Clock, Edit2 } from 'lucide-react';
import { FOLLOW_UP_TYPES } from '../utils/constants';
import { format, isPast, isToday } from 'date-fns';

const EMPTY = { job_id: '', contact_id: '', follow_up_type: 'Email', due_date: '', completed: false, notes: '' };

const TYPE_COLORS = {
  'LinkedIn': { bg: '#EFF6FF', text: '#1D4ED8' },
  'Email':    { bg: '#FEF2F2', text: '#DC2626' },
  'Application': { bg: '#F0FDFA', text: '#0F766E' },
  'Interview': { bg: '#FEFCE8', text: '#A16207' },
  'Referral': { bg: '#FDF4FF', text: '#7E22CE' },
};

function FollowUpForm({ followUp, jobs, contacts, onClose, onSaved }) {
  const [form, setForm] = useState(followUp ? { ...followUp, completed: !!followUp.completed } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!form.job_id) e.job_id = 'Required';
    if (!form.due_date) e.due_date = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (followUp?.id) await followUpsApi.update(followUp.id, form);
      else await followUpsApi.create(form);
      onSaved();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  const jobContacts = form.job_id ? contacts.filter(c => String(c.job_id) === String(form.job_id)) : contacts;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>{followUp ? 'Edit Follow-up' : 'Add Follow-up'}</h3>
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
                <label>Contact (optional)</label>
                <select name="contact_id" value={form.contact_id} onChange={handleChange}>
                  <option value="">— None —</option>
                  {jobContacts.map(c => <option key={c.id} value={c.id}>{c.contact_name} ({c.role_type})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="follow_up_type" value={form.follow_up_type} onChange={handleChange}>
                  {FOLLOW_UP_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date *</label>
                <input type="date" name="due_date" value={form.due_date} onChange={handleChange} />
                {errors.due_date && <span className="error-msg">{errors.due_date}</span>}
              </div>
              <div className="form-group" style={{ justifyContent: 'center', paddingTop: 20 }}>
                <label className="checkbox-item">
                  <input type="checkbox" name="completed" checked={form.completed} onChange={handleChange} />
                  Mark as Completed
                </label>
              </div>
              <div className="form-group span-2">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="What needs to be done?" rows={3} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : followUp ? 'Save Changes' : 'Add Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { completed: showCompleted ? 'true' : 'false' };
      const [fRes, jRes, cRes] = await Promise.all([
        followUpsApi.getAll(params), jobsApi.getAll(), contactsApi.getAll()
      ]);
      setFollowUps(fRes.data);
      setJobs(jRes.data);
      setContacts(cRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [showCompleted]);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async (id) => {
    await followUpsApi.complete(id);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this follow-up?')) return;
    await followUpsApi.delete(id);
    load();
  };

  const handleSaved = () => { setShowForm(false); setEditing(null); load(); };

  const overdue = followUps.filter(f => !f.completed && f.due_date && isPast(new Date(f.due_date)) && !isToday(new Date(f.due_date)));
  const dueToday = followUps.filter(f => !f.completed && f.due_date && isToday(new Date(f.due_date)));
  const upcoming = followUps.filter(f => !f.completed && f.due_date && !isPast(new Date(f.due_date)) && !isToday(new Date(f.due_date)));
  const completed = followUps.filter(f => f.completed);

  const Section = ({ title, items, color }) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ color }}>{title} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>({items.length})</span></div>
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company / Job</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(f => {
                  const tc = TYPE_COLORS[f.follow_up_type] || {};
                  return (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{f.company_name}</div>
                        {f.job_title && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.job_title}</div>}
                      </td>
                      <td>{f.contact_name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                      <td><span className="badge" style={{ background: tc.bg, color: tc.text }}>{f.follow_up_type}</span></td>
                      <td style={{ fontWeight: 600, color }}>{f.due_date}</td>
                      <td title={f.notes}>{f.notes ? f.notes.slice(0, 50) + (f.notes.length > 50 ? '...' : '') : '—'}</td>
                      <td className="td-actions">
                        <div style={{ display: 'flex', gap: 4 }}>
                          {!f.completed && (
                            <button className="btn btn-success btn-sm" onClick={() => handleComplete(f.id)} title="Mark complete">
                              <CheckCircle size={13} /> Done
                            </button>
                          )}
                          <button className="btn btn-icon" onClick={() => { setEditing(f); setShowForm(true); }}>
                            <Edit2 size={13} />
                          </button>
                          <button className="btn btn-icon btn-danger" onClick={() => handleDelete(f.id)}>
                            <Trash2 size={13} />
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
          <h2>Follow-ups</h2>
          <p>{overdue.length} overdue · {dueToday.length} due today · {upcoming.length} upcoming</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label className="checkbox-item" style={{ cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} />
            Show Completed
          </label>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={15} /> Add Follow-up
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : (
          <>
            <Section title="⚠️ Overdue" items={overdue} color="var(--danger)" />
            <Section title="📅 Due Today" items={dueToday} color="var(--warning)" />
            <Section title="🔜 Upcoming" items={upcoming} color="var(--primary)" />
            {showCompleted && <Section title="✅ Completed" items={completed} color="var(--success)" />}
            {followUps.length === 0 && (
              <div className="card">
                <div className="empty-state">
                  <Clock />
                  <h3>No follow-ups yet</h3>
                  <p>Add follow-up tasks to stay on top of your applications</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && <FollowUpForm followUp={editing} jobs={jobs} contacts={contacts} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={handleSaved} />}
    </div>
  );
}
