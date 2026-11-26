import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { EMAILS } from '../data/demoEmails.js';

const ACME_EMAILS = ['W3', 'W2', 'W1'].map(id => EMAILS.find(email => email.id === id));

export default function RiskRadar() {
  const { t: translate, demoDate, state, setState, setModal, setNotice, visible } = useApp();

  function simulateResolve() {
    setState(s => s.resolved ? s : ({
      ...s,
      resolved: true,
      tasks: s.tasks.map(task => {
        if (task.space !== 'Work') return task;
        if (task.title === 'Deliver IT specifications') return { ...task, status: 'On track', due: 'Nov 26' };
        if (task.title === 'Deliver Acme proposal') return { ...task, status: 'On track' };
        return task;
      }),
      logs: [...s.logs, { space: 'Work', text: 'Received simulated IT response; risk reduced' }],
    }));
    setNotice('Dependency updated.');
  }

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{demoDate} · {translate("DEMO WORKSPACE")}</div>
        <h1 className="page-title">{translate("Risk radar")}</h1>
        <p className="page-desc">{translate("High-risk emails and what to do next.")}</p>
      </div>

      {visible('Work') ? (
        <div className="stack">
          <section className="card" aria-labelledby="acme-risk-title">
            <span className={`chip ${state.resolved ? 'green' : 'red'}`}>
              {translate(state.resolved ? "Mitigated" : "High risk")}
            </span>
            <h2 id="acme-risk-title" style={{ margin: '8px 0 4px' }}>
              {translate(state.resolved ? "Acme contract back on track" : "Acme contract at risk")}
            </h2>
            <p>{translate(state.resolved
              ? "IT confirmed earlier delivery. Engineering can finish the proposal for Friday."
              : "IT expects to deliver on Monday. Engineering needs the specifications to submit Friday’s proposal.")}</p>
            <strong className={state.resolved ? 'green' : 'red'}>
              {translate(state.resolved ? "Risk reduced" : "€150,000 opportunity exposed")}
            </strong>

            <div className="email-tile" style={{ marginBottom: 0 }}>
              <h3>{translate(state.resolved ? "Simulated response" : "Recommended next step")}</h3>
              <p style={{ marginTop: 4 }}>{translate(state.resolved
                ? "IT: We can deliver the specifications today instead."
                : "Ask IT for the specifications today. If they can’t deliver, agree on a backup plan with Engineering.")}</p>
              {!state.resolved && (
                <div className="row" style={{ flexWrap: 'wrap', marginTop: 12 }}>
                  {state.approved
                    ? <span className="chip green">{translate("✓ Escalation approved")}</span>
                    : <button className="btn btn-primary" onClick={() => setModal('escalate')}>{translate("Review follow-up")}</button>}
                  <button className="btn btn-secondary" onClick={simulateResolve}>{translate("Simulate IT response")}</button>
                </div>
              )}
            </div>
          </section>

          <section className="card" aria-labelledby="acme-emails-title">
            <h2 id="acme-emails-title" style={{ marginBottom: 0 }}>
              {translate(state.resolved ? "Emails linked to this risk" : "Emails behind this high risk")}
            </h2>
            {ACME_EMAILS.map(email => (
              <article key={email.id} className="item">
                <h3>{translate(email.subject)}</h3>
                <div className="muted">{translate(email.from)}</div>
                <p style={{ marginTop: 4 }}>{translate(email.body)}</p>
              </article>
            ))}
          </section>
        </div>
      ) : (
        <div className="card">
          <h2>{translate("No business data")}</h2>
          <p className="muted">{translate("Work risks are hidden in your personal view.")}</p>
        </div>
      )}
    </div>
  );
}
