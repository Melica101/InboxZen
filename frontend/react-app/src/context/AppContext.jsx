import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { api, getToken, setToken } from '../api.js';

const AppContext = createContext(null);
const AUTONOMY = { 'Recommendations only': 'RECOMMENDATIONS_ONLY', 'Approval required': 'APPROVAL_REQUIRED' };
const SETTING_KEYS = ['analyzeWork', 'analyzePersonal', 'crossCalendar'];

// Local-only UI state. Business data (emails, commitments, risks, ...) comes from the backend.
const INITIAL_STATE = {
  page: 'Daily briefing',
  space: 'All',
  // ponytail: no backend endpoint for profile edits / mail accounts yet, these stay local demo state
  user: {
    name: '',
    email: '',
    role: 'Product Manager',
    timezone: 'Europe/Rome',
    avatar: null,
    notifications: { email: true, browser: true, weekly: false },
    theme: 'light',
  },
  mailAccounts: [
    { id: 'ma-1', provider: 'gmail', label: 'Personal Gmail', email: 'alex.personal@example.com', space: 'Personal', status: 'connected', syncEnabled: true, lastSync: '2 min ago' },
    { id: 'ma-2', provider: 'outlook', label: 'Corporate Outlook', email: 'alex@company.example', space: 'Work', status: 'connected', syncEnabled: true, lastSync: '5 min ago' },
  ],
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('inboxzen-state') || '{}');
    return { ...structuredClone(INITIAL_STATE), page: saved.page, space: saved.space, user: { ...INITIAL_STATE.user, ...saved.user }, mailAccounts: saved.mailAccounts || INITIAL_STATE.mailAccounts };
  } catch {
    return structuredClone(INITIAL_STATE);
  }
}

export function AppProvider({ children }) {
  const [local, setLocalRaw] = useState(() => {
    const s = loadState();
    return { ...s, page: s.page || INITIAL_STATE.page, space: s.space || INITIAL_STATE.space };
  });
  const [token, setTokenState] = useState(getToken());
  const [data, setData] = useState(null);
  const [notice, setNotice] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [modal, setModal] = useState(null); // an AgentAction draft from the backend
  const [busy, setBusyState] = useState(false);
  const busyRef = useRef(false);
  const seq = useRef(0);
  const spaceRef = useRef(local.space);

  const setState = useCallback((updater) => {
    setLocalRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try { localStorage.setItem('inboxzen-state', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const logout = useCallback((msg = '') => {
    setToken(null); setTokenState(null); setData(null); setModal(null); setNotice(''); setAuthErr(msg);
    setLocalRaw(structuredClone(INITIAL_STATE));
    try { localStorage.removeItem('inboxzen-state'); } catch { /* ignore */ }
    spaceRef.current = 'All';
  }, []);

  const load = useCallback(async () => {
    const my = ++seq.current;
    const s = spaceRef.current === 'All' ? '' : '?space=' + spaceRef.current.toLowerCase();
    const [briefing, emails, commitments, risks, activity, settings, actions, me] = await Promise.all(
      ['/briefing' + s, '/emails' + s, '/commitments' + s, '/risks' + s, '/activity' + s, '/settings', '/actions' + s, '/me'].map((p) => api(p)),
    );
    const evidence = {};
    await Promise.all(risks.map(async (r) => { evidence[r.id] = (await api('/risks/' + r.id)).evidence; }));
    if (my === seq.current) setData({ briefing, emails, commitments, risks, activity, settings, actions, me, evidence });
  }, []);

  const fail = useCallback((e) => {
    if (e.message === 'unauthorized') logout('Session expired, please sign in again.');
    else setNotice(e.message);
  }, [logout]);

  // run a mutation, then reload everything. fn may return a notice string (anything else is ignored).
  const act = useCallback(async (fn) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusyState(true); setNotice('');
    try { const n = await fn(); if (typeof n === 'string' && n) setNotice(n); } catch (e) { fail(e); busyRef.current = false; setBusyState(false); return; }
    try { await load(); } catch (e) { fail(e); }
    busyRef.current = false; setBusyState(false);
  }, [load, fail]);

  useEffect(() => { if (token) act(async () => {}); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // the account name/email come from the backend
  useEffect(() => {
    const me = data?.me;
    if (me) setState((s) => (s.user.name === me.name && s.user.email === me.email ? s : { ...s, user: { ...s.user, name: me.name, email: me.email } }));
  }, [data?.me, setState]);

  const login = useCallback(async (mode, form) => {
    const r = await api('/auth/' + mode, 'POST', form);
    setToken(r.token); setAuthErr(''); setTokenState(r.token);
  }, []);

  const navigate = useCallback((page) => { setState((s) => ({ ...s, page })); setNotice(''); setModal(null); }, [setState]);

  const setSpace = useCallback((space) => {
    setState((s) => ({ ...s, space })); spaceRef.current = space; setNotice(''); setModal(null);
    load().catch(fail);
  }, [setState, load, fail]);

  const resetDemo = useCallback(() => act(async () => { await api('/demo/reset', 'POST'); return 'Demo reset.'; }), [act]);

  const toggleSetting = useCallback((i) => {
    if (i < 3) act(async () => { await api('/settings', 'PUT', { ...data.settings, [SETTING_KEYS[i]]: !data.settings[SETTING_KEYS[i]] }); });
  }, [act, data]);
  const setMode = useCallback((label) => act(async () => { await api('/settings', 'PUT', { ...data.settings, autonomy: AUTONOMY[label] }); }), [act, data]);

  const visible = useCallback((sp) => local.space === 'All' || local.space.toUpperCase() === String(sp).toUpperCase(), [local.space]);

  // legacy shape the pages/profile read: settings as a flag array, mode as a label
  const state = useMemo(() => {
    const st = data?.settings;
    return {
      ...local,
      settings: st ? [st.analyzeWork, st.analyzePersonal, st.crossCalendar, false, false, false] : [],
      mode: st ? Object.keys(AUTONOMY).find((k) => AUTONOMY[k] === st.autonomy) : 'Approval required',
    };
  }, [local, data?.settings]);

  return (
    <AppContext.Provider value={{
      state, setState, data, token, login, logout, authErr, act, api,
      navigate, setSpace, resetDemo, toggleSetting, setMode,
      notice, setNotice, modal, setModal, busy, visible,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
