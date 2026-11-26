import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function CalendarPage() {
  const { t: translate, demoDate, state, setModal, visible, formatDueDate } = useApp();
  const events = [
    { title: 'Product alignment', time: '10:00–10:30', space: 'Work' },
    { title: 'Acme presentation', time: state.moved ? '16:30–17:30' : '15:00–16:00', space: 'Work' },
    { title: 'Private appointment 🔒', time: '15:00–15:30', space: 'Personal' },
  ].sort((a, b) => a.time.localeCompare(b.time));

  const commitments = state.tasks.filter(task => visible(task.space));
  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{demoDate} · {translate("DEMO WORKSPACE")}</div>
        <h1 className="page-title">{translate("Meeting Assistant")}</h1>
        <p className="page-desc">{translate("One view, separate privacy boundaries.")}</p>
      </div>

      <div className="card">
        <h2>{demoDate}</h2>
        {events.filter(event => visible(event.space)).map(event => (
          <div key={event.title} className="item">
            <span className="muted">{event.time}</span>
            <h3>{translate(event.title)} <span className="chip">{translate(event.space)}</span></h3>
          </div>
        ))}
        {state.space === 'All' && state.settings[2] && (
          <div className="email-tile" style={{ marginTop: 14 }}>
            <h3>{state.moved ? translate("✓ Conflict resolved") : translate("Calendar conflict detected")}</h3>
            <p className="muted" style={{ marginBottom: 8 }}>
              {state.moved ? translate("Meeting moved in demo.") : translate("A work meeting overlaps your private appointment.")}
            </p>
            {!state.moved && (
              <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setModal('conflict')}>{translate("Resolve privately")}</button>
            )}
          </div>
        )}
      </div>
      {commitments.length > 0 && (
        <section className="card" style={{ marginTop: 20 }} aria-labelledby="calendar-deadlines">
          <h2 id="calendar-deadlines">{translate("Commitment deadlines")}</h2>
          {commitments.map(task => (
            <div key={task.title} className="item row between" style={{ flexWrap: 'wrap' }}>
              <div>
                <h3>{translate(task.title)}</h3>
                <span className="muted">{formatDueDate(task.due)} · {translate(task.space)} · {translate(task.owner)}</span>
              </div>
              <span className={`chip ${task.done ? 'green' : task.status === 'Blocked' ? 'red' : ''}`}>
                {translate(task.done ? "Done" : task.status)}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
