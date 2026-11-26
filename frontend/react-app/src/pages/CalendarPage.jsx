import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function CalendarPage() {
  const { state, setModal, visible } = useApp();
  return (
    <div>
      <div className="page-header">
        <div className="eyebrow">THURSDAY, NOVEMBER 26 · DEMO WORKSPACE</div>
        <h1 className="page-title">Your calendar</h1>
        <p className="page-desc">One view, separate privacy boundaries.</p>
      </div>

      <div className="card">
        <h2>Thursday, November 26</h2>
        {visible('Work') && <>
          <div className="item">
            <span className="muted">10:00–10:30</span>
            <h3>Product alignment <span className="chip" style={{ marginLeft: 8 }}>Work</span></h3>
          </div>
          <div className="item">
            <span className="muted">{state.moved ? '16:30–17:30' : '15:00–16:00'}</span>
            <h3>Acme presentation <span className="chip" style={{ marginLeft: 8 }}>Work</span></h3>
          </div>
        </>}
        {visible('Personal') && (
          <div className="item">
            <span className="muted">15:00–15:30</span>
            <h3>Private appointment 🔒 <span className="chip" style={{ marginLeft: 8 }}>Personal</span></h3>
          </div>
        )}
        {state.space === 'All' && state.settings[2] && (
          <div className="email-tile" style={{ marginTop: 14 }}>
            <h3>{state.moved ? '✓ Conflict resolved' : 'Calendar conflict detected'}</h3>
            <p className="muted" style={{ marginBottom: 8 }}>
              {state.moved ? 'Meeting moved in demo.' : 'A work meeting overlaps your private appointment.'}
            </p>
            {!state.moved && (
              <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setModal('conflict')}>
                Resolve privately
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
