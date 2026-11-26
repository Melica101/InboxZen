import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api, cap, hm } from '../api.js';

export default function CalendarPage() {
  const { t: translate, demoDate, data, act, setModal } = useApp();
  const { schedule, conflicts } = data.briefing;
  const conflict = conflicts[0];
  const commitments = data.commitments;
  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{demoDate} · {translate("DEMO WORKSPACE")}</div>
        <h1 className="page-title">{translate("Meeting Assistant")}</h1>
        <p className="page-desc">{translate("One view, separate privacy boundaries.")}</p>
      </div>

      <div className="card">
        <h2>{demoDate}</h2>
        {schedule.length === 0 && <p className="muted">{translate("Nothing scheduled.")}</p>}
        {schedule.map((e) => (
          <div key={e.id} className="item">
            <span className="muted">{hm(e.startAt)}–{hm(e.endAt)}</span>
            <h3>{e.title}{e.space === 'PERSONAL' ? ' 🔒' : ''} <span className="chip" style={{ marginLeft: 8 }}>{translate(cap(e.space))}</span></h3>
          </div>
        ))}
        {conflict && (
          <div className="email-tile" style={{ marginTop: 14 }}>
            <h3>{translate("Calendar conflict detected")}</h3>
            <p className="muted" style={{ marginBottom: 8 }}>{translate("{title} overlaps a private appointment.", { title: conflict.workEvent.title })}</p>
            <button className="btn btn-primary" style={{ fontSize: 12 }}
              onClick={() => act(async () => { setModal(await api(`/calendar/events/${conflict.workEvent.id}/reschedule-draft`, 'POST')); })}>
              {translate("Resolve privately")}
            </button>
          </div>
        )}
      </div>
      {commitments.length > 0 && (
        <section className="card" style={{ marginTop: 20 }} aria-labelledby="calendar-deadlines">
          <h2 id="calendar-deadlines">{translate("Commitment deadlines")}</h2>
          {commitments.map(task => (
            <div key={task.id} className="item row between" style={{ flexWrap: 'wrap' }}>
              <div>
                <h3>{task.title}</h3>
                <span className="muted">{task.due} · {translate(cap(task.space))} · {task.owner}</span>
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
