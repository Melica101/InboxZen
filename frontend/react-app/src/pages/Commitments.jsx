import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Commitments() {
  const { t: translate, demoDate, state, setState, visible, formatDueDate } = useApp();
  const shown = state.tasks.filter(t => visible(t.space));

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{demoDate} · {translate("DEMO WORKSPACE")}</div>
        <h1 className="page-title">{translate("Task Extraction")}</h1>
        <p className="page-desc">{translate("Every promise, owner and deadline in one place.")}</p>
      </div>

      <div className="card">
        <h2>{translate("Commitments")}</h2>
        {shown.length === 0 && <p className="muted" style={{ padding: '20px 0', textAlign: 'center' }}>{translate("No commitments.")}</p>}
        {shown.map((t) => {
          const i = state.tasks.indexOf(t);
          return (
            <div key={t.title} className="item row">
              <input
                type="checkbox"
                checked={!!t.done}
                style={{ accentColor: 'var(--brand-primary)', width: 16, height: 16 }}
                onChange={() => setState(s => ({
                  ...s,
                  tasks: s.tasks.map((x, j) => j === i ? { ...x, done: !x.done } : x),
                }))}
              />
              <div style={{ flex: 1 }}>
                <h3 style={t.done ? { textDecoration: 'line-through', opacity: .5 } : {}}>{translate(t.title)}</h3>
                <span className="muted">{translate(t.space)} · {formatDueDate(t.due)} · {translate(t.owner)}</span>
              </div>
              <span className={`chip ${t.done ? 'green' : t.status === 'Blocked' ? 'red' : ''}`}>
                {t.done ? translate("Done") : translate(t.status)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
