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
  const { state, setState, setNotice, resetDemo } = useApp();
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
        <div className="eyebrow">ACCOUNT SETTINGS</div>
        <h1 className="page-title">Your profile</h1>
        <p className="page-desc">Manage your personal details, notifications, and privacy preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: avatar + tab nav */}
        <div className="stack" style={{ gap: 14 }}>
          {/* Avatar card */}
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #edeaff' }} />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e3deff, #c5b8f9)',
                  color: '#5d49c7', display: 'grid', placeItems: 'center',
                  fontSize: 28, fontWeight: 750,
                }}>
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: '#6a55dc', color: '#fff',
                  border: '2px solid #fff', borderRadius: '50%',
                  width: 26, height: 26, display: 'grid', placeItems: 'center',
                  cursor: 'pointer',
                }}
                title="Change avatar"
              >
                <Camera size={12} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{user.role || 'Demo account'}</div>
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
                  border: 0, background: tab === key ? '#edeaff' : 'none',
                  color: tab === key ? '#5d49c7' : '#6b6f88',
                  fontWeight: tab === key ? 650 : 400,
                  borderRadius: 8, fontSize: 13,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background .15s',
                }}
              >
                <Icon size={15} />
                <span style={{ flex: 1 }}>{label}</span>
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
                <h2>General information</h2>
                <div className="form-group" style={{ marginTop: 10 }}>
                  <label className="form-label">Full name</label>
                  <input className="field" value={user.name} onChange={e => updateUser({ name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input className="field" type="email" value={user.email} onChange={e => updateUser({ email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role / job title</label>
                  <input className="field" placeholder="e.g. Product Manager" value={user.role || ''} onChange={e => updateUser({ role: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="field" value={user.timezone} onChange={e => updateUser({ timezone: e.target.value })}>
                    {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
                  </select>
                </div>
                <div className="row between" style={{ marginTop: 6 }}>
                  <div />
                  <button type="submit" className={`btn ${saved ? 'btn-success' : 'btn-primary'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
                    {saved ? <><Check size={14} /> Saved!</> : 'Save changes'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {tab === 'notifs' && (
            <div className="card">
              <h2>Notification preferences</h2>
              <p className="muted" style={{ marginBottom: 20 }}>Choose how InboxZen keeps you informed.</p>
              {[
                { key: 'email',   label: 'Email digests',       desc: 'Receive a daily summary to your inbox.' },
                { key: 'browser', label: 'Browser notifications', desc: 'Real-time alerts for high-priority items.' },
                { key: 'weekly',  label: 'Weekly review',        desc: 'A Friday afternoon recap of commitments and risks.' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="item row between">
                  <div>
                    <h3>{label}</h3>
                    <span className="muted">{desc}</span>
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
              <h2>Privacy & data</h2>
              <div className="privacy-note" style={{ marginBottom: 20 }}>
                🔒 InboxZen never sells your data. Work and personal spaces are always processed separately.
              </div>
              {[
                { label: 'Allow cross-workspace coordination', desc: 'Let the AI suggest availability hints between work and personal calendars.', key: 2 },
                { label: 'Analyze work emails', desc: 'Extract commitments and risks from your work inbox.', key: 0 },
                { label: 'Analyze personal emails', desc: 'Extract reminders and appointments from your personal inbox.', key: 1 },
              ].map(({ label, desc, key }) => (
                <div key={label} className="item row between">
                  <div>
                    <h3>{label}</h3>
                    <span className="muted">{desc}</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!!state.settings[key]}
                      onChange={() => setState(s => ({
                        ...s,
                        settings: s.settings.map((v, j) => j === key ? !v : v),
                      }))}
                    />
                    <span className="slider" />
                  </label>
                </div>
              ))}
              <div className="item">
                <h3>Export my data</h3>
                <span className="muted">Download a JSON archive of all your InboxZen settings and activity.</span>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: 10 }}
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'inboxzen-export.json'; a.click();
                    URL.revokeObjectURL(url);
                    setNotice('Data exported.');
                  }}
                >
                  Export data
                </button>
              </div>
            </div>
          )}

          {tab === 'danger' && (
            <div className="card">
              <h2>Danger zone</h2>
              <div className="item">
                <h3>Reset demo</h3>
                <span className="muted">Clears all demo state and returns everything to defaults.</span>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-secondary" onClick={resetDemo}>Reset demo</button>
                </div>
              </div>
              <div className="item">
                <h3>Sign out</h3>
                <span className="muted">End your session. (Demo only — no real auth.)</span>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setNotice('Sign-out is demo-only. No real session exists.')}>
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
              <div className="item">
                <h3 style={{ color: '#c0404a' }}>Delete account</h3>
                <span className="muted">Permanently delete your account and all associated data. This cannot be undone.</span>
                <div style={{ marginTop: 12 }}>
                  {!delConfirm ? (
                    <button className="btn btn-danger" onClick={() => setDelConfirm(true)}>Delete account</button>
                  ) : (
                    <div style={{ background: '#fff5f5', border: '1.5px solid #fbd3d5', borderRadius: 11, padding: 16 }}>
                      <p style={{ color: '#c0404a', fontWeight: 650, marginBottom: 10 }}>
                        Are you sure? This action cannot be undone in a real app.
                      </p>
                      <div className="row" style={{ gap: 10 }}>
                        <button className="btn btn-danger" onClick={() => { setNotice('Account deletion is demo-only.'); setDelConfirm(false); }}>Yes, delete everything</button>
                        <button className="btn btn-secondary" onClick={() => setDelConfirm(false)}>Cancel</button>
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
