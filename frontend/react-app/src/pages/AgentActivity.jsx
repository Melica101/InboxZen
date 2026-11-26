import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { cap, hm, dateLabel } from '../api.js';

export default function AgentActivity() {
  const { data } = useApp();
  const logs = data.activity;

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{dateLabel(data)}</div>
        <h1 className="page-title">Agent activity</h1>
        <p className="page-desc">Review every simulated action.</p>
      </div>

      <div className="card">
        <h2>Activity log</h2>
        <div className="timeline" style={{ marginTop: 10 }}>
          {logs.length === 0 && <p className="muted">No activity yet.</p>}
          {logs.map((l) => (
            <div key={l.id} className="item">
              <h3>{l.text}</h3>
              <span className="muted">{cap(l.space)} · {hm(l.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
