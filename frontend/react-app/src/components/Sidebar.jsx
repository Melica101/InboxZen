import React from 'react';
import logo from '../assets/inboxzen-logo.jpg';
import mark from '../assets/inboxzen-mark.jpg';
import { useApp } from '../context/AppContext.jsx';
import {
  LayoutDashboard, Mail, CheckSquare, AlertTriangle,
  Calendar, Activity, Shield, Plug, User, ListOrdered, FileText, PencilLine,
} from 'lucide-react';

const NAV = [
  { key: 'Daily briefing',   Icon: LayoutDashboard, label: 'Daily Briefing' },
  { key: 'Smart inbox',      Icon: Mail,            label: 'Smart Inbox' },
  { key: 'Priority Engine',  Icon: ListOrdered,     label: 'Priority Engine' },
  { key: 'AI Email Summary', Icon: FileText,        label: 'AI Email Summary' },
  { key: 'Commitments',      Icon: CheckSquare,     label: 'Task Extraction' },
  { key: 'Calendar',         Icon: Calendar,        label: 'Meeting Assistant' },
  { key: 'Risk radar',       Icon: AlertTriangle,   label: 'Follow-up Tracker' },
  { key: 'AI Reply Drafts',  Icon: PencilLine,      label: 'AI Reply Drafts' },
  { key: 'Privacy center',   Icon: Shield,          label: 'Autonomy Center' },
  { key: 'Agent activity',   Icon: Activity,        label: 'Activity & Alert Center' },
];

const BOTTOM_NAV = [
  { key: 'Connect mail',    Icon: Plug,            label: 'Connect mail' },
  { key: 'Profile',         Icon: User,            label: 'Profile' },
];

export default function Sidebar() {
  const { t: translate, state, navigate } = useApp();

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
      <div className="sidebar-label">{translate("WORKSPACE")}</div>
      <nav>
        {NAV.map(({ key, Icon, label }) => (
          <button
            key={key}
            className={`nav-btn ${state.page === key ? 'active' : ''}`}
            onClick={() => navigate(key)}
            title={translate(label)}
            aria-label={translate(label)}
            aria-current={state.page === key ? 'page' : undefined}
          >
            <Icon className="nav-icon" size={17} />
            <span>{translate(label)}</span>
          </button>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="sidebar-label" style={{ marginTop: 20 }}>{translate("ACCOUNT")}</div>
      <nav>
        {BOTTOM_NAV.map(({ key, Icon, label }) => (
          <button
            key={key}
            className={`nav-btn ${state.page === key ? 'active' : ''}`}
            onClick={() => navigate(key)}
            title={translate(label)}
            aria-label={translate(label)}
            aria-current={state.page === key ? 'page' : undefined}
          >
            <Icon className="nav-icon" size={17} />
            <span>{translate(label)}</span>
          </button>
        ))}
      </nav>

      {/* Profile footer */}
      <div className="sidebar-footer">
        <div className="profile-block" onClick={() => navigate('Profile')}>
          {state.user.avatar ? (
            <img src={state.user.avatar} alt={translate("avatar")} className="avatar" />
          ) : (
            <div className="avatar">{initials}</div>
          )}
          <div>
            <div style={{ fontWeight: 650, fontSize: 13 }}>{state.user.name}</div>
            <div className="muted" style={{ fontSize: 11 }}>{state.user.role || translate("Demo account")}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
