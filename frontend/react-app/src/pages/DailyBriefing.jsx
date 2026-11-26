import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api, cap, hm, dateLabel } from '../api.js';
import { TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export default function DailyBriefing() {
  const { state, data, act, busy } = useApp();
  const { metrics } = data.briefing;
  const hasRisk = metrics.activeRisks > 0;

  const analyzeEmails = () => act(async () => {
    const q = state.space === 'All' ? '' : '?space=' + state.space.toLowerCase();
    const rs = await api('/ai/analyze' + q, 'POST');
    return rs.length ? `Analysis complete: ${rs.map(r => `${cap(r.space)} ${r.mode}`).join(', ')}.` : 'No enabled workspace to analyze.';
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="eyebrow">{dateLabel(data)}</div>
        <h1 className="page-title">Good morning, {data.briefing.name.split(' ')[0]}.</h1>
        <p className="page-desc">A little less noise. A lot more clarity.</p>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">✦ YOUR AI BRIEFING</div>
        <h2>Here's what really matters today.</h2>
        <p>{state.space === 'Personal' ? 'Your private appointments and commitments.' : 'Focus on decisions, not the inbox.'}</p>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={analyzeEmails} disabled={busy}>
          {busy ? 'Analyzing…' : 'Analyze emails'}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card metric-card">
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckSquareIcon size={13} /> Open commitments
          </div>
          <div className="metric-value">{metrics.openCommitments}</div>
          <div className="muted">Across selected spaces</div>
        </div>
        <div className="card metric-card">
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} /> Active risks
          </div>
          <div className={`metric-value ${hasRisk ? 'red' : 'green'}`}>{metrics.activeRisks}</div>
          <div className="muted">Dependency intelligence</div>
        </div>
        <div className="card metric-card">
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} /> Time reclaimed
          </div>
          <div className="metric-value purple">25m</div>
          <div className="muted">Illustrative estimate</div>
        </div>
      </div>

      {/* Split layout */}
      <div className="split">
        <div className="stack">
          <RiskCard />
          <CommitmentsCard />
        </div>
        <div className="stack">
          <ScheduleCard />
          <AgentActionsCard />
        </div>
      </div>

      <div className="privacy-note" style={{ marginTop: 20 }}>
        ♧ Separate work and personal content. Only authorized availability is used for coordination.
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function CheckSquareIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}

function RiskCard() {
  const { data, act, navigate } = useApp();
  const r = data.risks.slice().sort((a, b) => (a.status === 'OPEN' ? 0 : 1) - (b.status === 'OPEN' ? 0 : 1))[0];
  if (!r) return <div className="card"><h2>Risk radar</h2><p className="muted">No risks detected.</p></div>;
  const open = r.status === 'OPEN';
  return (
    <div className="card">
      <h2>Risk radar</h2>
      <div className="risk-block">
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className={`chip ${open ? (r.severity === 'High' ? 'red' : '') : 'green'}`}>{open ? `${r.severity} priority` : 'Mitigated'}</span>
          <span className="muted">{r.sourceIds.length} linked emails</span>
        </div>
        <h3 style={{ fontSize: 15, marginBottom: 4 }}>{r.title}</h3>
        <p className="muted" style={{ marginBottom: 12 }}>{r.explanation}</p>
        <div className="row between">
          <strong className={open ? 'red' : 'green'}>{open ? r.exposure : 'Risk reduced'}</strong>
          <div className="row" style={{ gap: 8 }}>
            {open && (
              <button className="btn btn-secondary" style={{ fontSize: 11 }}
                onClick={() => act(async () => { await api(`/risks/${r.id}/resolve`, 'POST', { note: 'IT: We can deliver the specifications today instead.' }); return 'Dependency updated.'; })}>Simulate IT fix</button>
            )}
            <button className="btn btn-link" onClick={() => navigate('Risk radar')}>View evidence →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommitmentsCard() {
  const { data, act } = useApp();
  const shown = data.commitments;
  return (
    <div className="card">
      <h2>Your commitments</h2>
      {shown.length === 0 && <p className="muted" style={{ padding: '20px 0', textAlign: 'center' }}>No commitments.</p>}
      {shown.map((t) => (
        <div key={t.id} className="item row">
          <input
            type="checkbox"
            checked={!!t.done}
            style={{ accentColor: 'var(--brand-primary)', width: 16, height: 16 }}
            onChange={() => act(() => api('/commitments/' + t.id, 'PATCH', { done: !t.done }))}
          />
          <div style={{ flex: 1 }}>
            <h3 style={t.done ? { textDecoration: 'line-through', opacity: .5 } : {}}>{t.title}</h3>
            <span className="muted">{cap(t.space)} · {t.due} · {t.owner}</span>
          </div>
          <span className={`chip ${t.done ? 'green' : t.status === 'Blocked' ? 'red' : ''}`}>
            {t.done ? 'Done' : t.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScheduleCard() {
  const { data, act, setModal } = useApp();
  const { schedule, conflicts } = data.briefing;
  const conflict = conflicts[0];
  return (
    <div className="card">
      <h2>Your schedule</h2>
      {schedule.length === 0 && <p className="muted">Nothing scheduled.</p>}
      {schedule.map((e) => (
        <div key={e.id} className="item"><span className="muted">{hm(e.startAt)}–{hm(e.endAt)}</span><h3>{e.title}{e.space === 'PERSONAL' ? ' 🔒' : ''}</h3></div>
      ))}
      {conflict && (
        <div className="email-tile" style={{ marginTop: 10 }}>
          <h3>Calendar conflict</h3>
          <p className="muted" style={{ marginBottom: 8 }}>{conflict.workEvent.title} overlaps a private appointment.</p>
          <button className="btn btn-link" style={{ padding: 0 }}
            onClick={() => act(async () => { setModal(await api(`/calendar/events/${conflict.workEvent.id}/reschedule-draft`, 'POST')); })}>
            Resolve privately →
          </button>
        </div>
      )}
    </div>
  );
}

function AgentActionsCard() {
  const { state, data, act, setModal } = useApp();
  const list = data.actions.filter(a => a.status !== 'REJECTED').slice(0, 3);
  return (
    <div className="card">
      <h2>Agent actions</h2>
      {list.length === 0 && <p className="muted">No actions yet.</p>}
      {list.map((a) => (
        <div key={a.id} className="item">
          <h3>{a.status === 'APPROVED' ? '✓ Approved: ' : ''}{a.subject}</h3>
          <p className="muted">{a.recipients}</p>
          {a.status === 'DRAFT' && (
            <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => setModal(a)}>Review draft</button>
          )}
        </div>
      ))}
      <div className="muted" style={{ marginTop: 8 }}>{state.mode}</div>
    </div>
  );
}
