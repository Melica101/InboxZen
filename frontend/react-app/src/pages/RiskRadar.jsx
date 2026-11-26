import React from 'react';
import { useApp } from '../context/AppContext.jsx';

const EMAILS = [
  { id: 'W1', from: 'Elena · Acme', body: 'Please deliver the final proposal by November 27 to proceed with the €150,000 opportunity.' },
  { id: 'W2', from: 'Marco · Engineering', body: 'We cannot finish the proposal until IT delivers infrastructure specifications.' },
  { id: 'W3', from: 'Luca · IT', body: 'Specifications will not be available until Monday, November 30.' },
];

export default function RiskRadar() {
  const { state, setState, setModal, setNotice, visible } = useApp();

  function simulateResolve() {
    setState(s => ({
      ...s,
      resolved: true,
      tasks: s.tasks.map((t, i) => i === 0 ? { ...t, status: 'On track' } : i === 2 ? { ...t, status: 'On track', due: 'Nov 26' } : t),
      logs: [...s.logs, { space: 'Work', text: 'Received simulated IT response; risk reduced' }],
    }));
    setNotice('Dependency updated.');
  }

  if (!visible('Work')) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Risk radar</h1>
        </div>
        <div className="card">
          <h2>No business data</h2>
          <p className="muted">Work risks are hidden in your personal view.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">THURSDAY, NOVEMBER 26 · DEMO WORKSPACE</div>
        <h1 className="page-title">Risk radar</h1>
        <p className="page-desc">See the downstream consequences of delayed commitments.</p>
      </div>

      <div className="card">
        <h2>Business risk</h2>
        <div className="risk-block">
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className={`chip ${state.resolved ? 'green' : 'red'}`}>{state.resolved ? 'Mitigated' : 'High priority'}</span>
            <span className="muted">3 linked emails</span>
          </div>
          <h3 style={{ fontSize: 16 }}>Acme contract {state.resolved ? 'back on track' : 'at risk'}</h3>
          <p className="muted" style={{ margin: '6px 0 12px' }}>
            {state.resolved ? 'IT confirmed earlier delivery.' : 'IT specifications are delayed beyond the client deadline.'}
          </p>
          <strong className={state.resolved ? 'green' : 'red'}>
            {state.resolved ? 'Risk reduced' : '€150,000 opportunity exposed'}
          </strong>
        </div>

        {/* Dependency graph */}
        <div className="dep-graph" style={{ marginTop: 20 }}>
          <div className="dep-node" style={{ background: state.resolved ? '#e6f5ee' : '#ffefef' }}>
            <h3>IT specifications</h3>
            <p className="muted" style={{ marginTop: 4 }}>{state.resolved ? 'Confirmed Thursday' : 'Delayed until Monday'}</p>
          </div>
          <span className="muted">↓</span>
          <div className="dep-node" style={{ background: 'var(--brand-orange-tint)' }}>
            <h3>Engineering proposal</h3>
            <p className="muted" style={{ marginTop: 4 }}>{state.resolved ? 'Ready to proceed' : 'Blocked by IT'}</p>
          </div>
          <span className="muted">↓</span>
          <div className="dep-node">
            <h3>Acme client submission</h3>
            <p className="muted" style={{ marginTop: 4 }}>Friday · €150,000 opportunity</p>
          </div>
        </div>

        {/* Source emails */}
        <h3 style={{ marginTop: 20, marginBottom: 10 }}>Source evidence</h3>
        {EMAILS.map(e => (
          <div key={e.id} className="email-tile">
            <strong>{e.from}</strong>
            <p style={{ marginTop: 6, color: '#555' }}>{e.body}</p>
          </div>
        ))}
        {state.resolved && (
          <div className="email-tile" style={{ borderColor: '#b6e3cc' }}>
            <span className="chip green" style={{ marginBottom: 6 }}>Simulated response</span>
            <p>IT: We can deliver the specifications today instead.</p>
          </div>
        )}

        <div className="row" style={{ marginTop: 20, gap: 10 }}>
          {!state.approved && (
            <button className="btn btn-primary" onClick={() => setModal('escalate')}>Review escalation</button>
          )}
          {!state.resolved && (
            <button className="btn btn-secondary" onClick={simulateResolve}>Simulate IT response</button>
          )}
        </div>
      </div>
    </div>
  );
}
