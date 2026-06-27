import { useState, useEffect, useCallback } from 'react';
import { contactsApi, jobsApi, exportApi } from '../utils/api';
import { Plus, Search, Edit2, Trash2, Link, Mail, AlertCircle, X, FileDown, CheckCircle, XCircle } from 'lucide-react';
import { ROLE_TYPES } from '../utils/constants';

const EMPTY = {
  job_id: '', company_name: '', contact_name: '', role_type: 'Recruiter',
  linkedin_url: '', email: '', linkedin_connected: false, linkedin_message_sent: false,
  email_sent: false, response_received: false, response_notes: '',
  last_contacted_date: '', next_follow_up_date: ''
};

const ROLE_COLORS = {
  'Recruiter': { bg: '#EFF6FF', text: '#1D4ED8' },
  'Hiring Manager': { bg: '#FDF4FF', text: '#7E22CE' },
  'Team Member': { bg: '#F0FDFA', text: '#0F766E' },
  'Director': { bg: '#FFF7ED', text: '#C2410C' },
  'VP': { bg: '#FEF2F2', text: '#BE123C' },
  'Alumni': { bg: '#FEFCE8', text: '#A16207' },
  'Other': { bg: '#F9FAFB', text: '#6B7280' },
};

function Bool({ val }) {
  return val ? <CheckCircle size={15} color="var(--success)" /> : <XCircle size={15} color="#D1D5DB" />;
}

function ContactForm({ contact, jobs, onClose, onSaved }) {
  const [form, setForm] = useState(contact ? {
    ...contact, linkedin_connected: !!contact.linkedin_connected,
    linkedin_message_sent: !!contact.linkedin_message_sent,
    email_sent: !!contact.email_sent, response_received: !!contact.response_received
  } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(er => { const n = { ...er }; delete n[name]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.company_name.trim()) e.company_name = 'Required';
    if (!form.contact_name.trim()) e.contact_name = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (contact?.id) await contactsApi.update(contact.id, form);
      else await contactsApi.create(form);
      onSaved();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  const CHECKS = [
    { name: 'linkedin_connected', label: 'LinkedIn Connected' },
    { name: 'linkedin_message_sent', label: 'LinkedIn Message Sent' },
    { name: 'email_sent', label: 'Email Sent' },
    { name: 'response_received', label: 'Response Received' },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{contact ? 'Edit Contact' : 'Add Contact'}</h3>
          <button className="btn btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && <div className="alert alert-error"><AlertCircle size={15} />{errors.submit}</div>}
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name *</label>
                <input name="company_name" value={form.company_name} onChange={handleChange} />
                {errors.company_name && <span className="error-msg">{errors.company_name}</span>}
              </div>
              <div className="form-group">
                <label>Contact Name *</label>
                <input name="contact_name" value={form.contact_name} onChange={handleChange} />
                {errors.contact_name && <span className="error-msg">{errors.contact_name}</span>}
              </div>
              <div className="form-group">
                <label>Role Type</label>
                <select name="role_type" value={form.role_type} onChange={handleChange}>
                  {ROLE_TYPES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Linked Job</label>
                <select name="job_id" value={form.job_id} onChange={handleChange}>
                  <option value="">— Not linked —</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.company_name} · {j.job_title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input type="url" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Contacted</label>
                <input type="date" name="last_contacted_date" value={form.last_contacted_date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Next Follow-up Date</label>
                <input type="date" name="next_follow_up_date" value={form.next_follow_up_date} onChange={handleChange} />
              </div>
              <div className="form-group span-2">
                <label>Outreach Status</label>
                <div className="checkbox-row">
                  {CHECKS.map(({ name, label }) => (
                    <label key={name} className="checkbox-item">
                      <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group span-2">
                <label>Response Notes</label>
                <textarea name="response_notes" value={form.response_notes} onChange={handleChange} placeholder="What did they say?" rows={3} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : contact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ search: '', role_type: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.role_type) params.role_type = filters.role_type;
      const [cRes, jRes] = await Promise.all([contactsApi.getAll(params), jobsApi.getAll()]);
      setContacts(cRes.data);
      setJobs(jRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    await contactsApi.delete(id);
    load();
  };

  const handleSaved = () => { setShowForm(false); setEditing(null); load(); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Contacts / Outreach</h2>
          <p>{contacts.length} contacts tracked</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportApi.csvContacts()}>
            <FileDown size={14} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={15} /> Add Contact
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="filters-bar">
          <div className="search-wrap">
            <Search size={15} />
            <input placeholder="Search name or company..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          <select value={filters.role_type} onChange={e => setFilters(f => ({ ...f, role_type: e.target.value }))} style={{ minWidth: 160 }}>
            <option value="">All Role Types</option>
            {ROLE_TYPES.map(r => <option key={r}>{r}</option>)}
          </select>
          {(filters.search || filters.role_type) && (
            <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ search: '', role_type: '' })}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {error && <div className="alert alert-error"><AlertCircle size={15} />{error}</div>}

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <AlertCircle />
              <h3>No contacts yet</h3>
              <p>Start tracking your outreach by adding contacts</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Company / Job</th>
                    <th>LinkedIn</th>
                    <th>Email</th>
                    <th>Response</th>
                    <th>Last Contact</th>
                    <th>Follow-up</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(c => {
                    const rc = ROLE_COLORS[c.role_type] || {};
                    const isOverdue = c.next_follow_up_date && new Date(c.next_follow_up_date) < new Date();
                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.contact_name}</div>
                          {c.email && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email}</div>}
                        </td>
                        <td>
                          <span className="badge" style={{ background: rc.bg, color: rc.text }}>{c.role_type}</span>
                        </td>
                        <td>
                          <div>{c.company_name}</div>
                          {c.job_title && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.job_title}</div>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <Bool val={c.linkedin_message_sent} />
                            {c.linkedin_url && (
                              <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-icon" title="Open LinkedIn">
                                <Link size={13} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td><Bool val={c.email_sent} /></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Bool val={c.response_received} />
                            {c.response_received && c.response_notes && (
                              <span title={c.response_notes} style={{ fontSize: 11, color: 'var(--success)', cursor: 'help' }}>✓</span>
                            )}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.last_contacted_date || '—'}</td>
                        <td style={{ color: isOverdue ? 'var(--danger)' : 'var(--text)', fontWeight: isOverdue ? 600 : 400, fontSize: 13 }}>
                          {c.next_follow_up_date || '—'}
                        </td>
                        <td className="td-actions">
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-icon" onClick={() => { setEditing(c); setShowForm(true); }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn btn-icon btn-danger" onClick={() => handleDelete(c.id)}>
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

      {showForm && <ContactForm contact={editing} jobs={jobs} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={handleSaved} />}
    </div>
  );
}
