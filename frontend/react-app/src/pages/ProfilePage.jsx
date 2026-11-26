import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  User, Mail, Globe, Bell, Shield, Trash2,
  Camera, Check, LogOut, ChevronRight, Moon, Sun,
} from 'lucide-react';

const TIMEZONES = [
  'Europe/Rome', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney',
];

const TABS = [
  { key: 'general',  label: 'General',       Icon: User },
  { key: 'notifs',   label: 'Notifications', Icon: Bell },
  { key: 'privacy',  label: 'Privacy',       Icon: Shield },
  { key: 'danger',   label: 'Danger zone',   Icon: Trash2 },
];

export default function ProfilePage() {
  const { t: translate, state, setState, setNotice, resetDemo, toggleSetting, logout } = useApp();
  const [tab, setTab]           = useState('general');
  const [saved, setSaved]       = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const fileRef                 = useRef(null);

  const user = state.user;

  function updateUser(patch) {
    setState(s => ({ ...s, user: { ...s.user, ...patch } }));
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setNotice('Profile saved.');
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateUser({ avatar: ev.target.result });
    reader.readAsDataURL(file);
  }

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="eyebrow">{translate("ACCOUNT SETTINGS")}</div>
        <h1 className="page-title">{translate("Your profile")}</h1>
        <p className="page-desc">{translate("Manage your personal details, notifications, and privacy preferences.")}</p>
      </div>

      <div className="profile-layout">
        {/* Left: avatar + tab nav */}
        <div className="stack" style={{ gap: 14 }}>
          {/* Avatar card */}
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
              {user.avatar ? (
                <img src={user.avatar} alt={translate("avatar")} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-blue-tint)' }} />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'var(--brand-avatar)',
                  color: 'var(--brand-blue-ink)', display: 'grid', placeItems: 'center',
                  fontSize: 28, fontWeight: 750,
                }}>
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: 'var(--brand-primary)', color: '#fff',
                  border: '2px solid #fff', borderRadius: '50%',
                  width: 26, height: 26, display: 'grid', placeItems: 'center',
                  cursor: 'pointer',
                }}
                title={translate("Change avatar")}
              >
                <Camera size={12} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{user.role || translate("Demo account")}</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{user.email}</div>
          </div>

          {/* Tab nav */}
          <div className="card" style={{ padding: '8px 0' }}>
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 16px',
                  border: 0, background: tab === key ? 'var(--brand-blue-tint)' : 'none',
                  color: tab === key ? 'var(--brand-blue-ink)' : '#6b6f88',
                  fontWeight: tab === key ? 650 : 400,
                  borderRadius: 8, fontSize: 13,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background .15s',
                }}
              >
                <Icon size={15} />
                <span style={{ flex: 1 }}>{translate(label)}</span>
                <ChevronRight size={13} style={{ opacity: .4 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: tab content */}
        <div>
          {tab === 'general' && (
            <form onSubmit={handleSave}>
              <div className="card">
                <h2>{translate("General information")}</h2>
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label className="form-label">{translate("Full name")}</label>
                  <input className="field" value={user.name} onChange={e => updateUser({ name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{translate("Email address")}</label>
                  <input className="field" type="email" value={user.email} onChange={e => updateUser({ email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{translate("Role / job title")}</label>
                  <input className="field" placeholder={translate("e.g. Product Manager")} value={user.role || ''} onChange={e => updateUser({ role: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{translate("Timezone")}</label>
                  <select className="field" value={user.timezone} onChange={e => updateUser({ timezone: e.target.value })}>
                    {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
                  </select>
                </div>
                <div className="row between" style={{ marginTop: 6 }}>
                  <div />
                  <button type="submit" className={`btn ${saved ? 'btn-success' : 'btn-primary'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
                    {saved ? <><Check size={14} />{translate("Saved!")}</> : translate("Save changes")}
                  </button>
                </div>
              </div>
            </form>
          )}

          {tab === 'notifs' && (
            <div className="card">
              <h2>{translate("Notification preferences")}</h2>
              <p className="muted" style={{ marginBottom: 20 }}>{translate("Choose how InboxZen keeps you informed.")}</p>
              {[
                { key: 'email',   label: 'Email digests',       desc: 'Receive a daily summary to your inbox.' },
                { key: 'browser', label: 'Browser notifications', desc: 'Real-time alerts for high-priority items.' },
                { key: 'weekly',  label: 'Weekly review',        desc: 'A Friday afternoon recap of commitments and risks.' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="item row between">
                  <div>
                    <h3>{translate(label)}</h3>
                    <span className="muted">{translate(desc)}</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!!user.notifications?.[key]}
                      onChange={() => updateUser({
                        notifications: { ...user.notifications, [key]: !user.notifications?.[key] },
                      })}
                    />
                    <span className="slider" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {tab === 'privacy' && (
            <div className="card">
              <h2>{translate("Privacy & data")}</h2>
              <div className="privacy-note" style={{ marginBottom: 20 }}>{translate("🔒 InboxZen never sells your data. Work and personal spaces are always processed separately.")}</div>
              {[
                { label: 'Allow cross-workspace coordination', desc: 'Let the AI suggest availability hints between work and personal calendars.', key: 2 },
                { label: 'Analyze work emails', desc: 'Extract commitments and risks from your work inbox.', key: 0 },
                { label: 'Analyze personal emails', desc: 'Extract reminders and appointments from your personal inbox.', key: 1 },
              ].map(({ label, desc, key }) => (
                <div key={label} className="item row between">
                  <div>
                    <h3>{translate(label)}</h3>
                    <span className="muted">{translate(desc)}</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!!state.settings[key]}
                      onChange={() => toggleSetting(key)}
                    />
                    <span className="slider" />
                  </label>
                </div>
              ))}
              <div className="item row between profile-export">
                <div>
                  <h3>{translate("Export my data")}</h3>
                  <span className="muted">{translate("Download a JSON archive of all your InboxZen settings and activity.")}</span>
                </div>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'inboxzen-export.json'; a.click();
                    URL.revokeObjectURL(url);
                    setNotice('Data exported.');
                  }}
                >{translate("Export data")}</button>
              </div>
            </div>
          )}

          {tab === 'danger' && (
            <div className="card">
              <h2>{translate("Danger zone")}</h2>
              <div className="item">
                <h3>{translate("Reset demo")}</h3>
                <span className="muted">{translate("Clears all demo state and returns everything to defaults.")}</span>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-secondary" onClick={resetDemo}>{translate("Reset demo")}</button>
                </div>
              </div>
              <div className="item">
                <h3>{translate("Sign out")}</h3>
                <span className="muted">{translate("End your session.")}</span>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => logout()}>
                    <LogOut size={14} />{translate("Sign out")}</button>
                </div>
              </div>
              <div className="item">
                <h3 style={{ color: '#c0404a' }}>{translate("Delete account")}</h3>
                <span className="muted">{translate("Permanently delete your account and all associated data. This cannot be undone.")}</span>
                <div style={{ marginTop: 12 }}>
                  {!delConfirm ? (
                    <button className="btn btn-danger" onClick={() => setDelConfirm(true)}>{translate("Delete account")}</button>
                  ) : (
                    <div style={{ background: '#fff5f5', border: '1.5px solid #fbd3d5', borderRadius: 11, padding: 16 }}>
                      <p style={{ color: '#c0404a', fontWeight: 650, marginBottom: 10 }}>{translate("Are you sure? This action cannot be undone in a real app.")}</p>
                      <div className="row" style={{ gap: 10 }}>
                        <button className="btn btn-danger" onClick={() => { setNotice('Account deletion is demo-only.'); setDelConfirm(false); }}>{translate("Yes, delete everything")}</button>
                        <button className="btn btn-secondary" onClick={() => setDelConfirm(false)}>{translate("Cancel")}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
