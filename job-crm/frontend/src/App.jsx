import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, Bell, CalendarCheck, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Contacts from './pages/Contacts';
import FollowUps from './pages/FollowUps';
import Interviews from './pages/Interviews';
import Settings from './pages/Settings';
import './index.css';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Job Applications' },
  { to: '/contacts', icon: Users, label: 'Contacts / Outreach' },
  { to: '/follow-ups', icon: Bell, label: 'Follow-ups' },
  { to: '/interviews', icon: CalendarCheck, label: 'Interview Tracker' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>🎯 Job CRM</h1>
            <span>Your job search pipeline</span>
          </div>
          <nav className="sidebar-nav">
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <Icon /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
