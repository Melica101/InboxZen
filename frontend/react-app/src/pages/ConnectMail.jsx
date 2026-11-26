import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Mail, RefreshCw, Trash2, CheckCircle, XCircle,
  AlertCircle, Plus, ChevronDown, Eye, EyeOff, Loader,
} from 'lucide-react';

// Provider metadata
const PROVIDERS = [
  { id: 'gmail',   label: 'Gmail',   color: '#EA4335', logo: '📧', authType: 'oauth',  hint: 'Connects via Google OAuth — no password stored.' },
  { id: 'outlook', label: 'Outlook', color: '#0078D4', logo: '📨', authType: 'oauth',  hint: 'Connects via Microsoft OAuth — no password stored.' },
  { id: 'yahoo',   label: 'Yahoo Mail', color: '#6001D2', logo: '📩', authType: 'oauth', hint: 'Connects via Yahoo OAuth — no password stored.' },
  { id: 'imap',    label: 'IMAP / SMTP', color: '#52525b', logo: '🖧',  authType: 'imap', hint: 'Enter your IMAP/SMTP server details and app password.' },
];

const SPACES = ['Work', 'Personal'];

function ProviderLogo({ provider, size = 32 }) {
  const p = PROVIDERS.find(x => x.id === provider);
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: p?.color || 'var(--brand-primary)',
      display: 'grid', placeItems: 'center',
      fontSize: size * 0.5, flexShrink: 0,
      color: '#fff',
    }}>
      {p?.logo || '📧'}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'connected')   return <span className="chip green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11} /> Connected</span>;
  if (status === 'error')       return <span className="chip red"   style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={11} /> Error</span>;
  if (status === 'syncing')     return <span className="chip orange" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Loader size={11} className="spin" /> Syncing…</span>;
  return <span className="chip grey" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11} /> Disconnected</span>;
}

export default function ConnectMail() {
  const { state, setState, setNotice } = useApp();
  const [showAdd, setShowAdd]       = useState(false);
  const [step, setStep]             = useState('choose');   // 'choose' | 'configure'
  const [chosen, setChosen]         = useState(null);
  const [form, setForm]             = useState({ label: '', space: 'Work', email: '', password: '', host: '', port: '993', tls: true });
  const [showPw, setShowPw]         = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  function handleProviderChoose(p) {
    setChosen(p);
    setForm(f => ({ ...f, label: p.label }));
    setStep('configure');
  }

  async function handleConnect(e) {
    e.preventDefault();
    if (!form.email.trim()) { setNotice('Please enter an email address.'); return; }
    setConnecting(true);
    // Simulate OAuth / IMAP handshake delay
    await new Promise(r => setTimeout(r, 1400));
    const newAcc = {
      id: `ma-${Date.now()}`,
      provider: chosen.id,
      label: form.label || chosen.label,
      email: form.email,
      space: form.space,
      status: 'connected',
      syncEnabled: true,
      lastSync: 'just now',
    };
    setState(s => ({ ...s, mailAccounts: [...s.mailAccounts, newAcc] }));
    setConnecting(false);
    setShowAdd(false);
    setStep('choose');
    setForm({ label: '', space: 'Work', email: '', password: '', host: '', port: '993', tls: true });
    setNotice(`${newAcc.label} connected successfully.`);
  }

  function handleRemove(id) {
    setState(s => ({ ...s, mailAccounts: s.mailAccounts.filter(a => a.id !== id) }));
    setNotice('Account disconnected.');
  }

  function handleToggleSync(id) {
    setState(s => ({
      ...s,
      mailAccounts: s.mailAccounts.map(a => a.id === id ? { ...a, syncEnabled: !a.syncEnabled } : a),
    }));
  }

  function handleResync(id) {
    setState(s => ({
      ...s,
      mailAccounts: s.mailAccounts.map(a => a.id === id ? { ...a, status: 'syncing', lastSync: 'syncing…' } : a),
    }));
    setTimeout(() => {
      setState(s => ({
        ...s,
        mailAccounts: s.mailAccounts.map(a => a.id === id ? { ...a, status: 'connected', lastSync: 'just now' } : a),
      }));
      setNotice('Sync complete.');
    }, 1800);
  }

  const accounts = state.mailAccounts;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="eyebrow">ACCOUNT SETTINGS</div>
        <h1 className="page-title">Connect mail</h1>
        <p className="page-desc">Link your email accounts so InboxZen can surface what matters across all your inboxes.</p>
      </div>

      {/* Overview metrics */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card metric-card">
          <div className="muted">Connected accounts</div>
          <div className="metric-value purple">{accounts.filter(a => a.status === 'connected').length}</div>
          <div className="muted">of {accounts.length} total</div>
        </div>
        <div className="card metric-card">
          <div className="muted">Work inboxes</div>
          <div className="metric-value">{accounts.filter(a => a.space === 'Work').length}</div>
          <div className="muted">Syncing separately</div>
        </div>
        <div className="card metric-card">
          <div className="muted">Personal inboxes</div>
          <div className="metric-value">{accounts.filter(a => a.space === 'Personal').length}</div>
          <div className="muted">Privacy-isolated</div>
        </div>
      </div>

      {/* Connected accounts list */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row between" style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Your mail accounts</h2>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => { setShowAdd(true); setStep('choose'); }}>
            <Plus size={14} /> Add account
          </button>
        </div>

        {accounts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Mail size={36} style={{ color: '#c0c2d8', marginBottom: 12 }} />
            <p className="muted">No mail accounts connected yet.</p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { setShowAdd(true); setStep('choose'); }}>
              Connect your first account
            </button>
          </div>
        )}

        {accounts.map(acc => (
          <div key={acc.id} className="item">
            <div className="row between">
              <div className="row" style={{ gap: 14 }}>
                <ProviderLogo provider={acc.provider} size={40} />
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <h3 style={{ fontSize: 15 }}>{acc.label}</h3>
                    <span className={`chip ${acc.space === 'Work' ? '' : 'green'}`}>{acc.space}</span>
                  </div>
                  <div className="muted" style={{ marginTop: 2 }}>{acc.email}</div>
                </div>
              </div>
              <div className="row" style={{ gap: 10 }}>
                <StatusBadge status={acc.status} />
                <button
                  className="btn btn-link"
                  title="Expand settings"
                  onClick={() => setExpandedId(expandedId === acc.id ? null : acc.id)}
                >
                  <ChevronDown size={16} style={{ transform: expandedId === acc.id ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
                </button>
              </div>
            </div>

            {/* Expanded row */}
            {expandedId === acc.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #eeeef5' }}>
                <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
                  <div>
                    <div className="form-label" style={{ marginBottom: 4, display: 'block', fontSize: 11, fontWeight: 650, letterSpacing: .4, color: '#575a72' }}>Last sync</div>
                    <span className="muted">{acc.lastSync}</span>
                  </div>
                  <div>
                    <div className="form-label" style={{ marginBottom: 4, display: 'block', fontSize: 11, fontWeight: 650, letterSpacing: .4, color: '#575a72' }}>Auto-sync</div>
                    <label className="switch">
                      <input type="checkbox" checked={!!acc.syncEnabled} onChange={() => handleToggleSync(acc.id)} />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => handleResync(acc.id)}>
                    <RefreshCw size={13} /> Re-sync now
                  </button>
                  <button className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => handleRemove(acc.id)}>
                    <Trash2 size={13} /> Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Privacy note */}
      <div className="privacy-note">
        🔒 InboxZen processes your mail locally. OAuth tokens are never stored in plain text.
        Work and personal inboxes are always analyzed in separate, isolated requests.
        You can disconnect an account at any time.
      </div>

      {/* ── Add account modal ── */}
      {showAdd && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            {/* Choose provider */}
            {step === 'choose' && (
              <>
                <div className="row between" style={{ marginBottom: 20 }}>
                  <div>
                    <h2>Connect an account</h2>
                    <p className="muted" style={{ marginTop: 4 }}>Choose your mail provider to get started.</p>
                  </div>
                  <button className="btn btn-link" onClick={() => setShowAdd(false)}>✕</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {PROVIDERS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleProviderChoose(p)}
                      style={{
                        border: '1.5px solid var(--brand-line)',
                        borderRadius: 14,
                        padding: '18px 16px',
                        background: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'border-color .15s, box-shadow .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-focus)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--brand-line)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <ProviderLogo provider={p.id} size={40} />
                      <span style={{ fontWeight: 650, fontSize: 13 }}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Configure */}
            {step === 'configure' && chosen && (
              <form onSubmit={handleConnect}>
                <div className="row between" style={{ marginBottom: 20 }}>
                  <div className="row" style={{ gap: 12 }}>
                    <ProviderLogo provider={chosen.id} size={36} />
                    <div>
                      <h2 style={{ fontSize: 18 }}>Connect {chosen.label}</h2>
                      <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>{chosen.hint}</p>
                    </div>
                  </div>
                  <button type="button" className="btn btn-link" onClick={() => setStep('choose')}>← Back</button>
                </div>

                <div className="form-group">
                  <label className="form-label">Account label</label>
                  <input className="field" placeholder={`e.g. My ${chosen.label}`} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input className="field" type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign to workspace</label>
                  <select className="field" value={form.space} onChange={e => setForm(f => ({ ...f, space: e.target.value }))}>
                    {SPACES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {chosen.authType === 'imap' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">App password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="field"
                          type={showPw ? 'text' : 'password'}
                          placeholder="Your app-specific password"
                          value={form.password}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          style={{ paddingRight: 44 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(v => !v)}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                        >
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid-2" style={{ gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">IMAP host</label>
                        <input className="field" placeholder="imap.example.com" value={form.host} onChange={e => setForm(f => ({ ...f, host: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Port</label>
                        <input className="field" placeholder="993" value={form.port} onChange={e => setForm(f => ({ ...f, port: e.target.value }))} />
                      </div>
                    </div>
                  </>
                )}

                {chosen.authType === 'oauth' && (
                  <div className="privacy-note" style={{ marginBottom: 16 }}>
                    Clicking "Connect" will open a secure {chosen.label} OAuth window. No password is stored by InboxZen.
                  </div>
                )}

                <div className="row" style={{ justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={connecting} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {connecting ? <><Loader size={14} className="spin" /> Connecting…</> : `Connect ${chosen.label}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin .9s linear infinite; display: inline-block; }
      `}</style>
    </div>
  );
}
