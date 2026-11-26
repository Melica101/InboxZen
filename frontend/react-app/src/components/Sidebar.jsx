import React from 'react';
import logo from '../assets/inboxzen-logo.jpg';
import mark from '../assets/inboxzen-mark.jpg';
import { useApp } from '../context/AppContext.jsx';
import {
  LayoutDashboard, Mail, CheckSquare, AlertTriangle,
  Calendar, Activity, Shield, Plug, User, LogOut,
} from 'lucide-react';

const NAV = [
  { key: 'Daily briefing',  Icon: LayoutDashboard, label: 'Daily briefing' },
  { key: 'Smart inbox',     Icon: Mail,            label: 'Smart inbox',    badge: 7 },
  { key: 'Commitments',     Icon: CheckSquare,     label: 'Commitments' },
  { key: 'Risk radar',      Icon: AlertTriangle,   label: 'Risk radar',     badge: 1 },
  { key: 'Calendar',        Icon: Calendar,        label: 'Calendar' },
  { key: 'Agent activity',  Icon: Activity,        label: 'Agent activity' },
  { key: 'Privacy center',  Icon: Shield,          label: 'Privacy center' },
];

const BOTTOM_NAV = [
  { key: 'Connect mail',    Icon: Plug,            label: 'Connect mail' },
  { key: 'Profile',         Icon: User,            label: 'Profile' },
];

export default function Sidebar() {
  const { state, navigate } = useApp();

  const initials = state.user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="sidebar">
      {/* Brand */}
      <picture className="brand">
        <source media="(max-width: 860px)" srcSet={mark} />
        <img src={logo} alt="InboxZen" />
      </picture>

      {/* Main nav */}
      <div className="sidebar-label">WORKSPACE</div>
      <nav>
        {NAV.map(({ key, Icon, label, badge }) => (
          <button
            key={key}
            className={`nav-btn ${state.page === key ? 'active' : ''}`}
            onClick={() => navigate(key)}
            title={label}
          >
            <Icon className="nav-icon" size={17} />
            <span>{label}</span>
            {badge ? <span className="nav-badge">{badge}</span> : null}
          </button>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="sidebar-label" style={{ marginTop: 20 }}>ACCOUNT</div>
      <nav>
        {BOTTOM_NAV.map(({ key, Icon, label }) => (
          <button
            key={key}
            className={`nav-btn ${state.page === key ? 'active' : ''}`}
            onClick={() => navigate(key)}
            title={label}
          >
            <Icon className="nav-icon" size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Profile footer */}
      <div className="sidebar-footer">
        <div className="profile-block" onClick={() => navigate('Profile')}>
          {state.user.avatar ? (
            <img src={state.user.avatar} alt="avatar" className="avatar" />
          ) : (
            <div className="avatar">{initials}</div>
          )}
          <div>
            <div style={{ fontWeight: 650, fontSize: 13 }}>{state.user.name}</div>
            <div className="muted" style={{ fontSize: 11 }}>{state.user.role || 'Demo account'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
