import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export default function DailyBriefing() {
  const { t: translate, demoDate, state, setState, setNotice, busy, setBusy, visible } = useApp();

  const openTasks = state.tasks.filter(t => visible(t.space) && !t.done).length;
  const hasRisk   = visible('Work') && !state.resolved;

  async function analyzeEmails() {
    if (busy) return;
    setBusy(true);
    setNotice('');
    try {
      const emails = [
      { id: 'W1', space: 'Work', from: 'Elena · Acme', subject: 'Final proposal by Friday', body: 'Please deliver the final proposal by November 27 to proceed with the €150,000 opportunity.', priority: 'Critical' },
      { id: 'W2', space: 'Work', from: 'Marco · Engineering', subject: 'Proposal dependency', body: 'We cannot finish the proposal until IT delivers infrastructure specifications.', priority: 'Action required' },
      { id: 'W3', space: 'Work', from: 'Luca · IT', subject: 'Infrastructure delay', body: 'Specifications will not be available until Monday, November 30.', priority: 'Risk signal' },
      ];
      let results = [];
      for (const [i, space] of ['Work', 'Personal'].entries()) {
        if (!visible(space) || !state.settings[i]) continue;
        const r = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ space, emails: emails.filter(e => e.space === space) }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        if (j.mode === 'live') setState(s => ({ ...s, analysis: { ...s.analysis, [space]: j.analysis } }));
        results.push(j.mode);
        setState(s => ({ ...s, logs: [...s.logs, { space, text: `${j.mode === 'live' ? 'Live AI' : 'Demo'} analysis completed` }] }));
      }
      if (results.length) {
        setNotice('Analysis complete: {results}.', { results });
      } else {
        setNotice('No enabled workspace to analyze.');
      }
    } catch {
      setNotice('Analysis failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="eyebrow">{demoDate} · {translate("DEMO WORKSPACE")}</div>
        <h1 className="page-title">{translate("Good morning, {name}.", { name: state.user.name.split(' ')[0] })}</h1>
        <p className="page-desc">{translate("A little less noise. A lot more clarity.")}</p>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">{translate("✦ YOUR AI BRIEFING")}</div>
        <h2>{translate("Here's what really matters today.")}</h2>
        <p>{state.space === 'Personal' ? translate("Your private appointments and commitments.") : translate("Focus on decisions, not the inbox.")}</p>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={analyzeEmails} disabled={busy}>
          {busy ? translate("Analyzing…") : translate("Analyze emails")}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="card metric-card">
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckSquareIcon size={13} />{translate("Open commitments")}</div>
          <div className="metric-value">{openTasks}</div>
          <div className="muted">{translate("Across selected spaces")}</div>
        </div>
        <div className="card metric-card">
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} />{translate("Active risks")}</div>
          <div className={`metric-value ${hasRisk ? 'red' : 'green'}`}>{hasRisk ? 1 : 0}</div>
          <div className="muted">{translate("Dependency intelligence")}</div>
        </div>
        <div className="card metric-card">
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} />{translate("Time reclaimed")}</div>
          <div className="metric-value purple">{translate("25m")}</div>
          <div className="muted">{translate("Illustrative estimate")}</div>
        </div>
      </div>

      {/* Split layout */}
      <div className="split">
        <div className="stack">
          {visible('Work') && <RiskCard />}
          <CommitmentsCard />
        </div>
        <div className="stack">
          <ScheduleCard />
          {visible('Work') && <AgentActionsCard />}
        </div>
      </div>

      <div className="privacy-note" style={{ marginTop: 20 }}>{translate("♧ Separate work and personal content. Only authorized availability is used for coordination.")}</div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function CheckSquareIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}

function RiskCard() {
  const { t: translate, state, setState, setNotice, navigate } = useApp();
  const resolved = state.resolved;
  function simulateResolve() {
    setState(s => ({
      ...s,
      resolved: true,
      tasks: s.tasks.map((t, i) => i === 0 ? { ...t, status: 'On track' } : i === 2 ? { ...t, status: 'On track', due: 'Nov 26' } : t),
      logs: [...s.logs, { space: 'Work', text: 'Received simulated IT response; risk reduced' }],
    }));
    setNotice('Dependency updated.');
  }
  return (
    <div className="card">
      <h2>{translate("Risk radar")}</h2>
      <div className="risk-block">
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className={`chip ${resolved ? 'green' : 'red'}`}>{resolved ? translate("Mitigated") : translate("High priority")}</span>
          <span className="muted">{translate("3 linked emails")}</span>
        </div>
        <h3 style={{ fontSize: 15, marginBottom: 4 }}>{translate(resolved ? "Acme contract back on track" : "Acme contract at risk")}</h3>
        <p className="muted" style={{ marginBottom: 12 }}>
          {resolved ? translate("IT confirmed earlier delivery.") : translate("IT specifications are delayed beyond the client deadline.")}
        </p>
        <div className="row between">
          <strong className={resolved ? 'green' : 'red'}>{resolved ? translate("Risk reduced") : translate("€150,000 opportunity exposed")}</strong>
          <div className="row" style={{ gap: 8 }}>
            {!resolved && (
              <button className="btn btn-secondary" style={{ fontSize: 11 }} onClick={simulateResolve}>{translate("Simulate IT fix")}</button>
            )}
            <button className="btn btn-link" onClick={() => navigate('Risk radar')}>{translate("View evidence →")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommitmentsCard() {
  const { t: translate, state, setState, visible, formatDueDate } = useApp();
  const shown = state.tasks.filter(t => visible(t.space));
  return (
    <div className="card">
      <h2>{translate("Your commitments")}</h2>
      {shown.length === 0 && <p className="muted" style={{ padding: '20px 0', textAlign: 'center' }}>{translate("No commitments.")}</p>}
      {shown.map(t => {
        const i = state.tasks.indexOf(t);
        return (
          <div key={t.title} className="item row">
            <input
              type="checkbox"
              checked={!!t.done}
              style={{ accentColor: 'var(--brand-primary)', width: 16, height: 16 }}
              onChange={() => setState(s => ({ ...s, tasks: s.tasks.map((x, j) => j === i ? { ...x, done: !x.done } : x) }))}
            />
            <div style={{ flex: 1 }}>
              <h3 style={t.done ? { textDecoration: 'line-through', opacity: .5 } : {}}>{translate(t.title)}</h3>
              <span className="muted">{translate(t.space)} · {formatDueDate(t.due)} · {translate(t.owner)}</span>
            </div>
            <span className={`chip ${t.done ? 'green' : t.status === 'Blocked' ? 'red' : ''}`}>
              {t.done ? translate("Done") : translate(t.status)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ScheduleCard() {
  const { t: translate, state, setModal, visible } = useApp();
  return (
    <div className="card">
      <h2>{translate("Your schedule")}</h2>
      {visible('Work') && <>
        <div className="item"><span className="muted">10:00–10:30</span><h3>{translate("Product alignment")}</h3></div>
        <div className="item"><span className="muted">{state.moved ? '16:30–17:30' : '15:00–16:00'}</span><h3>{translate("Acme presentation")}</h3></div>
      </>}
      {visible('Personal') && (
        <div className="item"><span className="muted">15:00–15:30</span><h3>{translate("Private appointment 🔒")}</h3></div>
      )}
      {state.space === 'All' && state.settings[2] && (
        <div className="email-tile" style={{ marginTop: 10 }}>
          <h3>{state.moved ? translate("✓ Conflict resolved") : translate("Calendar conflict")}</h3>
          <p className="muted" style={{ marginBottom: 8 }}>
            {state.moved ? translate("Meeting moved in demo.") : translate("A work meeting overlaps a private appointment.")}
          </p>
          {!state.moved && (
            <button className="btn btn-link" style={{ padding: 0 }} onClick={() => setModal('conflict')}>{translate("Resolve privately →")}</button>
          )}
        </div>
      )}
    </div>
  );
}

function AgentActionsCard() {
  const { t: translate, state, setModal } = useApp();
  return (
    <div className="card">
      <h2>{translate("Agent actions")}</h2>
      <div className="item">
        <h3>{state.approved ? translate("✓ Escalation approved") : translate("Follow-up ready")}</h3>
        <p className="muted">{translate("Engineering + IT")}</p>
        {!state.approved && (
          <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => setModal('escalate')}>{translate("Review draft")}</button>
        )}
      </div>
      <div className="muted" style={{ marginTop: 8 }}>{translate(state.mode)}</div>
    </div>
  );
}
