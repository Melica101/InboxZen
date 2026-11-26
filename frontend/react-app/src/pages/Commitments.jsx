import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Commitments() {
  const { state, setState, visible } = useApp();
  const shown = state.tasks.filter(t => visible(t.space));

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">THURSDAY, NOVEMBER 26 · DEMO WORKSPACE</div>
        <h1 className="page-title">Commitment center</h1>
        <p className="page-desc">Every promise, owner and deadline in one place.</p>
      </div>

      <div className="card">
        <h2>Commitments</h2>
        {shown.length === 0 && <p className="muted" style={{ padding: '20px 0', textAlign: 'center' }}>No commitments.</p>}
        {shown.map((t) => {
          const i = state.tasks.indexOf(t);
          return (
            <div key={t.title} className="item row">
              <input
                type="checkbox"
                checked={!!t.done}
                style={{ accentColor: '#6a55dc', width: 16, height: 16 }}
                onChange={() => setState(s => ({
                  ...s,
                  tasks: s.tasks.map((x, j) => j === i ? { ...x, done: !x.done } : x),
                }))}
              />
              <div style={{ flex: 1 }}>
                <h3 style={t.done ? { textDecoration: 'line-through', opacity: .5 } : {}}>{t.title}</h3>
                <span className="muted">{t.space} · {t.due} · {t.owner}</span>
              </div>
              <span className={`chip ${t.done ? 'green' : t.status === 'Blocked' ? 'red' : ''}`}>
                {t.done ? 'Done' : t.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
