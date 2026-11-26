import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api, cap, dateLabel } from '../api.js';

export default function RiskRadar() {
  const { data, act, setModal, state } = useApp();
  const risks = data.risks.slice().sort((a, b) => (a.status === 'OPEN' ? 0 : 1) - (b.status === 'OPEN' ? 0 : 1));

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{dateLabel(data)}</div>
        <h1 className="page-title">Risk radar</h1>
        <p className="page-desc">See the downstream consequences of delayed commitments.</p>
      </div>

      {risks.length === 0 && (
        <div className="card">
          <h2>No business data</h2>
          <p className="muted">{state.space === 'Personal' ? 'Work risks are hidden in your personal view.' : 'No risks detected.'}</p>
        </div>
      )}

      {risks.map((r) => {
        const open = r.status === 'OPEN', ok = r.status === 'MITIGATED';
        return (
          <div key={r.id} className="card" style={{ marginBottom: 20 }}>
            <h2>{cap(r.space)} risk</h2>
            <div className="risk-block">
              <div className="row between" style={{ marginBottom: 8 }}>
                <span className={`chip ${ok ? 'green' : r.severity === 'High' ? 'red' : ''}`}>{open ? `${r.severity} priority` : 'Mitigated'}</span>
                <span className="muted">{r.sourceIds.length} linked emails</span>
              </div>
              <h3 style={{ fontSize: 16 }}>{r.title}</h3>
              <p className="muted" style={{ margin: '6px 0 12px' }}>{r.explanation}</p>
              <strong className={ok ? 'green' : 'red'}>{ok ? 'Risk reduced' : r.exposure}</strong>
            </div>

            <div className="dep-graph" style={{ marginTop: 20 }}>
              {r.chain.map((n, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="muted">↓</span>}
                  <div className="dep-node" style={{ background: ok ? '#e6f5ee' : i === r.chain.length - 1 ? undefined : 'var(--brand-orange-tint)' }}>
                    <h3>{n.title}</h3>
                    <p className="muted" style={{ marginTop: 4 }}>{n.detail}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <h3 style={{ marginTop: 20, marginBottom: 10 }}>Source evidence</h3>
            {(data.evidence[r.id] || []).map((e) => (
              <div key={e.id} className="email-tile">
                <strong>{e.sender}</strong>
                <p style={{ marginTop: 6, color: '#555' }}>{e.body}</p>
              </div>
            ))}
            {r.resolution && (
              <div className="email-tile" style={{ borderColor: '#b6e3cc' }}>
                <span className="chip green" style={{ marginBottom: 6 }}>Simulated response</span>
                <p>{r.resolution}</p>
              </div>
            )}

            {open && (
              <div className="row" style={{ marginTop: 20, gap: 10 }}>
                <button className="btn btn-primary" onClick={() => act(async () => { setModal(await api(`/risks/${r.id}/escalation-draft`, 'POST')); })}>Review escalation</button>
                <button className="btn btn-secondary" onClick={() => act(async () => { await api(`/risks/${r.id}/resolve`, 'POST', { note: 'IT: We can deliver the specifications today instead.' }); return 'Dependency updated.'; })}>Simulate IT response</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
