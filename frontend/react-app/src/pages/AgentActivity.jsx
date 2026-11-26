import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function AgentActivity() {
  const { t: translate, demoDate, state, visible } = useApp();
  const logs = state.logs.filter(l => visible(l.space) || state.space === 'All').slice().reverse();

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{demoDate} · {translate("DEMO WORKSPACE")}</div>
        <h1 className="page-title">{translate("Agent activity")}</h1>
        <p className="page-desc">{translate("Review every simulated action.")}</p>
      </div>

      <div className="card">
        <h2>{translate("Activity log")}</h2>
        <div className="timeline" style={{ marginTop: 10 }}>
          {logs.length === 0 && <p className="muted">{translate("No activity yet.")}</p>}
          {logs.map((l, i) => (
            <div key={i} className="item">
              <h3>{translate(l.text)}</h3>
              <span className="muted">{translate(l.space)}{translate("· Demo")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
