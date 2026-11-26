import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function AgentActivity() {
  const { state, visible } = useApp();
  const logs = state.logs.filter(l => visible(l.space) || state.space === 'All').slice().reverse();

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">THURSDAY, NOVEMBER 26 · DEMO WORKSPACE</div>
        <h1 className="page-title">Agent activity</h1>
        <p className="page-desc">Review every simulated action.</p>
      </div>

      <div className="card">
        <h2>Activity log</h2>
        <div className="timeline" style={{ marginTop: 10 }}>
          {logs.length === 0 && <p className="muted">No activity yet.</p>}
          {logs.map((l, i) => (
            <div key={i} className="item">
              <h3>{l.text}</h3>
              <span className="muted">{l.space} · Demo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
