import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api, cap, hm, dateLabel } from '../api.js';

export default function CalendarPage() {
  const { data, act, setModal } = useApp();
  const { schedule, conflicts } = data.briefing;
  const conflict = conflicts[0];
  const day = new Date(data.briefing.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">{dateLabel(data)}</div>
        <h1 className="page-title">Your calendar</h1>
        <p className="page-desc">One view, separate privacy boundaries.</p>
      </div>

      <div className="card">
        <h2>{day}</h2>
        {schedule.length === 0 && <p className="muted">Nothing scheduled.</p>}
        {schedule.map((e) => (
          <div key={e.id} className="item">
            <span className="muted">{hm(e.startAt)}–{hm(e.endAt)}</span>
            <h3>{e.title}{e.space === 'PERSONAL' ? ' 🔒' : ''} <span className="chip" style={{ marginLeft: 8 }}>{cap(e.space)}</span></h3>
          </div>
        ))}
        {conflict && (
          <div className="email-tile" style={{ marginTop: 14 }}>
            <h3>Calendar conflict detected</h3>
            <p className="muted" style={{ marginBottom: 8 }}>{conflict.workEvent.title} overlaps a private appointment.</p>
            <button className="btn btn-primary" style={{ fontSize: 12 }}
              onClick={() => act(async () => { setModal(await api(`/calendar/events/${conflict.workEvent.id}/reschedule-draft`, 'POST')); })}>
              Resolve privately
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
