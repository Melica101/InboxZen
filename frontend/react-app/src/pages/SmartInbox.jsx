import React from 'react';
import { useApp } from '../context/AppContext.jsx';

const EMAILS = [
  { id: 'W1', space: 'Work', from: 'Elena · Acme', subject: 'Final proposal by Friday', body: 'Please deliver the final proposal by November 27 to proceed with the €150,000 opportunity.', priority: 'Critical' },
  { id: 'W2', space: 'Work', from: 'Marco · Engineering', subject: 'Proposal dependency', body: 'We cannot finish the proposal until IT delivers infrastructure specifications.', priority: 'Action required' },
  { id: 'W3', space: 'Work', from: 'Luca · IT', subject: 'Infrastructure delay', body: 'Specifications will not be available until Monday, November 30.', priority: 'Risk signal' },
  { id: 'W4', space: 'Work', from: 'Finance', subject: 'Budget approval', body: 'Please approve the €25,000 budget by 17:00 today.', priority: 'Due today' },
  { id: 'W5', space: 'Work', from: 'CEO office', subject: 'Annual company dinner', body: 'Join us for our annual celebration next month.', priority: 'Low priority' },
  { id: 'P1', space: 'Personal', from: 'Private clinic', subject: 'Appointment confirmation', body: 'Your private appointment is today from 15:00 to 15:30.', priority: 'Appointment' },
  { id: 'P2', space: 'Personal', from: 'Energy provider', subject: 'Electricity bill', body: 'Your bill is due November 27.', priority: 'Reminder' },
];

function priorityClass(p) {
  if (p === 'Critical') return 'red';
  if (p === 'Due today') return 'orange';
  if (p === 'Low priority') return 'grey';
  return '';
}

export default function SmartInbox() {
  const { visible } = useApp();
  const shown = EMAILS.filter(e => visible(e.space));

  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">THURSDAY, NOVEMBER 26 · DEMO WORKSPACE</div>
        <h1 className="page-title">Smart inbox</h1>
        <p className="page-desc">Priorities based on business impact and deadlines.</p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 0 }}>Simulated communications</h2>
        {shown.length === 0 && <p className="muted" style={{ padding: '20px 0', textAlign: 'center' }}>No messages in this view.</p>}
        {shown.map(e => (
          <div key={e.id} className="item row" style={{ gap: 14 }}>
            <div className="icon-tile">✉</div>
            <div style={{ flex: 1 }}>
              <div className="row between" style={{ marginBottom: 3 }}>
                <h3>{e.subject}</h3>
                <span className={`chip ${priorityClass(e.priority)}`}>{e.priority}</span>
              </div>
              <span className="muted">{e.from} · {e.space}</span>
              <p style={{ marginTop: 4, color: '#555' }}>{e.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
