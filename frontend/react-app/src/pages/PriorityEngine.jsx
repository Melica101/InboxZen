import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { EMAILS } from '../data/demoEmails.js';

const PRIORITY_ORDER = ['Critical', 'Due today', 'Risk signal', 'Action required', 'Appointment', 'Reminder', 'Low priority'];

function comparePriority(a, b) {
  return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
}

const FILTERS = {
  all: { label: 'All messages', matches: () => true, compare: comparePriority },
  deadline: {
    label: 'Deadline (earliest first)',
    matches: email => Boolean(email.deadline),
    compare: (a, b) => a.deadline.localeCompare(b.deadline) || comparePriority(a, b),
  },
  leadership: {
    label: 'CEO or manager',
    matches: email => email.senderRole === 'CEO office' || email.senderRole === 'Manager',
    compare: comparePriority,
  },
};

export default function PriorityEngine() {
  const { t, demoDate, visible } = useApp();
  const [filter, setFilter] = useState('all');
  const { matches, compare } = FILTERS[filter];
  const messages = EMAILS.filter(email => visible(email.space) && matches(email)).sort(compare);

  return (
    <div>
      <header className="page-header">
        <div className="eyebrow">{demoDate} · {t('DEMO WORKSPACE')}</div>
        <h1 className="page-title">{t('Priority Engine')}</h1>
        <p className="page-desc">{t('Review demo messages by priority, deadline, or sender.')}</p>
      </header>
      <section className="card" aria-label={t('Simulated communications')}>
        <label className="priority-filter">
          {t('Filter by')}
          <span className="language-control">
            <select className="language-select" value={filter} onChange={event => setFilter(event.target.value)}>
              {Object.entries(FILTERS).map(([value, { label }]) => (
                <option key={value} value={value}>{t(label)}</option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </span>
        </label>
        {messages.length === 0 && <p className="muted" role="status">{t('No matching messages in this workspace.')}</p>}
        {messages.map(email => (
          <article key={email.id} className="item">
            <div className="row between">
              <h3>{t(email.subject)}</h3>
              <span className="chip">{t(email.priority)}</span>
            </div>
            <div className="muted">
              {t(email.from)} · {t(email.space)}
              {filter === 'leadership' && email.senderRole === 'Manager' && <> · {t('Manager')}</>}
            </div>
            <p>{t(email.body)}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
