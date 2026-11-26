import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { cap, hm } from '../api.js';

export default function AgentActivity() {
  const { t: translate, demoDate, data } = useApp();
  const logs = data.activity;

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{demoDate} · {translate("DEMO WORKSPACE")}</div>
        <h1 className="page-title">{translate("Activity & Alert Center")}</h1>
        <p className="page-desc">{translate("Review every simulated action.")}</p>
      </div>

      <div className="card">
        <h2>{translate("Activity log")}</h2>
        <div className="timeline" style={{ marginTop: 10 }}>
          {logs.length === 0 && <p className="muted">{translate("No activity yet.")}</p>}
          {logs.map((l) => (
            <div key={l.id} className="item">
              <h3>{l.text}</h3>
              <span className="muted">{translate(cap(l.space))} · {hm(l.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
