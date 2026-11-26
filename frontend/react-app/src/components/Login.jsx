import React, { useState } from 'react';
import logo from '../assets/inboxzen-logo.jpg';
import { useApp } from '../context/AppContext.jsx';

export default function Login() {
  const { login, authErr } = useApp();
  const [mode, setMode] = useState('login');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const reg = mode === 'register';

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await login(mode, Object.fromEntries(new FormData(e.target))); } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <form className="card" onSubmit={submit} style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <picture className="brand"><img src={logo} alt="InboxZen" /></picture>
        <h2 style={{ marginBottom: 0 }}>{reg ? 'Create account' : 'Sign in'}</h2>
        {(err || authErr) && <div className="toast">{err || authErr}</div>}
        {reg && <input className="field" name="name" placeholder="Name" required maxLength={100} />}
        <input className="field" name="email" type="email" placeholder="Email" required />
        <input className="field" name="password" type="password" placeholder="Password" required minLength={reg ? 8 : undefined} maxLength={72} />
        <button className="btn btn-primary" disabled={busy}>{busy ? '…' : reg ? 'Create account' : 'Sign in'}</button>
        <button type="button" className="btn btn-link" onClick={() => { setMode(reg ? 'login' : 'register'); setErr(''); }}>
          {reg ? 'Have an account? Sign in' : 'New here? Create account'}
        </button>
      </form>
    </div>
  );
}
