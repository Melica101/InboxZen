import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api, cap, dateLabel } from '../api.js';

export default function Commitments() {
  const { data, act } = useApp();
  const shown = data.commitments;

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{dateLabel(data)}</div>
        <h1 className="page-title">Commitment center</h1>
        <p className="page-desc">Every promise, owner and deadline in one place.</p>
      </div>

      <div className="card">
        <h2>Commitments</h2>
        {shown.length === 0 && <p className="muted" style={{ padding: '20px 0', textAlign: 'center' }}>No commitments.</p>}
        {shown.map((t) => (
          <div key={t.id} className="item row">
            <input
              type="checkbox"
              checked={!!t.done}
              style={{ accentColor: 'var(--brand-primary)', width: 16, height: 16 }}
              onChange={() => act(() => api('/commitments/' + t.id, 'PATCH', { done: !t.done }))}
            />
            <div style={{ flex: 1 }}>
              <h3 style={t.done ? { textDecoration: 'line-through', opacity: .5 } : {}}>{t.title}</h3>
              <span className="muted">{cap(t.space)} · {t.due} · {t.owner}</span>
            </div>
            <span className={`chip ${t.done ? 'green' : t.status === 'Blocked' ? 'red' : ''}`}>
              {t.done ? 'Done' : t.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
