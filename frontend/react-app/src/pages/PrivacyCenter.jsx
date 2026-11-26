import React from 'react';
import { useApp } from '../context/AppContext.jsx';

const PERMISSIONS = [
  'Analyze work communications',
  'Analyze personal communications',
  'Cross-calendar coordination',
  'Automatic work follow-ups (roadmap)',
  'Automatic personal replies (roadmap)',
  'Process attachments (roadmap)',
];

export default function PrivacyCenter() {
  const { t: translate, demoDate, state, setState, resetDemo, navigate } = useApp();

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{demoDate} · {translate("DEMO WORKSPACE")}</div>
        <h1 className="page-title">{translate("Privacy center")}</h1>
        <p className="page-desc">{translate("Your data. Your boundaries. Your decisions.")}</p>
      </div>

      {/* Connected accounts — links to Connect mail page */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row between" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>{translate("Connected accounts")}</h2>
          <button className="btn btn-secondary" style={{ fontSize: 11 }} onClick={() => navigate('Connect mail')}>{translate("Manage →")}</button>
        </div>
        {state.mailAccounts.map(acc => (
          <div key={acc.id} className="item row between">
            <div>
              <h3>{acc.label}</h3>
              <span className="muted">{acc.email} · {translate(acc.status)}</span>
            </div>
            <span className={`chip ${acc.status === 'connected' ? 'green' : 'red'}`}>{translate(acc.space)}</span>
          </div>
        ))}
      </div>

      {/* Agent permissions */}
      <div className="card">
        <h2>{translate("Agent permissions")}</h2>
        {PERMISSIONS.map((perm, i) => (
          <div key={perm} className="item row between">
            <h3>{translate(perm)}</h3>
            <label className="switch">
              <input
                aria-label={translate(perm)}
                type="checkbox"
                checked={!!state.settings[i]}
                disabled={i > 2}
                onChange={() => {
                  if (i < 3) setState(s => ({
                    ...s,
                    settings: s.settings.map((v, j) => j === i ? !v : v),
                  }));
                }}
              />
              <span className="slider" />
            </label>
          </div>
        ))}

        <div className="item">
          <h3>{translate("Autonomy level")}</h3>
          <select
            className="field"
            aria-label={translate("Autonomy level")}
            value={state.mode}
            onChange={e => setState(s => ({ ...s, mode: e.target.value }))}
            style={{ marginTop: 8, maxWidth: 300 }}
          >
            {['Recommendations only', 'Approval required'].map(m => (
              <option key={m} value={m}>{translate(m)}</option>
            ))}
          </select>
        </div>

        <div className="privacy-note">{translate("Demo settings only; not a production security boundary.")}</div>
        <button className="btn btn-secondary" style={{ marginTop: 14 }} onClick={resetDemo}>{translate("Reset demo")}</button>
      </div>
    </div>
  );
}
