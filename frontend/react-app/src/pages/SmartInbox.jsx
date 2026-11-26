import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { cap, dateLabel } from '../api.js';

function priorityClass(p) {
  if (p === 'Critical') return 'red';
  if (p === 'Due today') return 'orange';
  if (p === 'Low priority') return 'grey';
  return '';
}

export default function SmartInbox() {
  const { data } = useApp();
  const shown = data.emails.slice(0, 50); // ponytail: no pagination, backend seeds ~150

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{dateLabel(data)}</div>
        <h1 className="page-title">Smart inbox</h1>
        <p className="page-desc">Priorities based on business impact and deadlines.</p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 0 }}>Communications</h2>
        {shown.length === 0 && <p className="muted" style={{ padding: '20px 0', textAlign: 'center' }}>No messages in this view.</p>}
        {shown.map(e => (
          <div key={e.id} className="item row" style={{ gap: 14 }}>
            <div className="icon-tile">✉</div>
            <div style={{ flex: 1 }}>
              <div className="row between" style={{ marginBottom: 3 }}>
                <h3>{e.subject}</h3>
                <span className={`chip ${priorityClass(e.priority)}`}>{e.priority}</span>
              </div>
              <span className="muted">{e.sender} · {cap(e.space)}</span>
              <p style={{ marginTop: 4, color: '#555' }}>{e.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
