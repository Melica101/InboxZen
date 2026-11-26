import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { dateLabel } from '../api.js';

const PERMISSIONS = [
  'Analyze work communications',
  'Analyze personal communications',
  'Cross-calendar coordination',
  'Automatic work follow-ups (roadmap)',
  'Automatic personal replies (roadmap)',
  'Process attachments (roadmap)',
];

export default function PrivacyCenter() {
  const { state, data, toggleSetting, setMode, resetDemo, navigate } = useApp();

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{dateLabel(data)}</div>
        <h1 className="page-title">Privacy center</h1>
        <p className="page-desc">Your data. Your boundaries. Your decisions.</p>
      </div>

      {/* Connected accounts — links to Connect mail page */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row between" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>Connected accounts</h2>
          <button className="btn btn-secondary" style={{ fontSize: 11 }} onClick={() => navigate('Connect mail')}>
            Manage →
          </button>
        </div>
        {state.mailAccounts.map(acc => (
          <div key={acc.id} className="item row between">
            <div>
              <h3>{acc.label}</h3>
              <span className="muted">{acc.email} · {acc.status}</span>
            </div>
            <span className={`chip ${acc.status === 'connected' ? 'green' : 'red'}`}>{acc.space}</span>
          </div>
        ))}
      </div>

      {/* Agent permissions */}
      <div className="card">
        <h2>Agent permissions</h2>
        {PERMISSIONS.map((perm, i) => (
          <div key={perm} className="item row between">
            <h3>{perm}</h3>
            <label className="switch">
              <input
                type="checkbox"
                checked={!!state.settings[i]}
                disabled={i > 2}
                onChange={() => toggleSetting(i)}
              />
              <span className="slider" />
            </label>
          </div>
        ))}

        <div className="item">
          <h3>Autonomy level</h3>
          <select
            className="field"
            value={state.mode}
            onChange={e => setMode(e.target.value)}
            style={{ marginTop: 8, maxWidth: 300 }}
          >
            {['Recommendations only', 'Approval required'].map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="privacy-note">Demo settings only; not a production security boundary.</div>
        <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={resetDemo}>
          Reset demo
        </button>
      </div>
    </div>
  );
}
