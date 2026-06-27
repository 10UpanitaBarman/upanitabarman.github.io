import { exportApi } from '../utils/api';
import { FileDown, FileSpreadsheet, Database, Info } from 'lucide-react';

export default function Settings() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Export data and manage your CRM</p>
        </div>
      </div>
      <div className="page-body" style={{ maxWidth: 640 }}>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3><FileDown size={16} style={{ display: 'inline', marginRight: 6 }} />Export Data</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 8 }}>
              Export your data at any time. CSV files can be opened in Excel or Google Sheets. The Excel export includes all sheets in one file.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => exportApi.csvJobs()}>
                <FileDown size={15} /> Export Jobs (CSV)
              </button>
              <button className="btn btn-secondary" onClick={() => exportApi.csvContacts()}>
                <FileDown size={15} /> Export Contacts (CSV)
              </button>
              <button className="btn btn-primary" onClick={() => exportApi.excel()}>
                <FileSpreadsheet size={15} /> Export All (Excel)
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3><Database size={16} style={{ display: 'inline', marginRight: 6 }} />Job Strategy Rules</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
              <div>
                <div style={{ fontWeight: 700, color: '#7E22CE', marginBottom: 4 }}>🌟 Dream / High Priority Jobs</div>
                <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  <li>Contact 1 Recruiter</li>
                  <li>Contact 1 Hiring Manager</li>
                  <li>Contact 2 Team Members</li>
                  <li>Contact 1 Senior Leader or Alumni (if available)</li>
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#1D4ED8', marginBottom: 4 }}>🔵 Medium Priority Jobs</div>
                <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  <li>Contact 1 Recruiter</li>
                  <li>Contact 1 Hiring Manager</li>
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>⚪ Low Priority Jobs</div>
                <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  <li>Apply directly or contact Recruiter only</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3><Info size={16} style={{ display: 'inline', marginRight: 6 }} />Outreach Completeness Score</h3></div>
          <div className="card-body">
            <table style={{ fontSize: 13.5 }}>
              <tbody>
                {[
                  ['Recruiter contacted', '25 points'],
                  ['Hiring Manager contacted', '25 points'],
                  ['Team Member contacted', '20 points'],
                  ['Follow-up date set', '15 points'],
                  ['Portfolio or Loom sent', '15 points'],
                ].map(([label, pts]) => (
                  <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--text)' }}>{label}</td>
                    <td style={{ padding: '10px 0', fontWeight: 700, color: 'var(--primary)', textAlign: 'right' }}>{pts}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '10px 0', fontWeight: 700 }}>Total</td>
                  <td style={{ padding: '10px 0', fontWeight: 700, color: 'var(--primary)', textAlign: 'right' }}>100 points</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
