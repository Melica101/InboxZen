import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

import { formatDemoDate, formatDemoDueDate, loadLanguage, translateMessage } from '../i18n/messages.js';

const AppContext = createContext(null);

const INITIAL_STATE = {
  page: 'Daily briefing',
  space: 'All',
  resolved: false,
  moved: false,
  approved: false,
  settings: [true, true, true, false, false, false],
  mode: 'Approval required',
  tasks: [
    { title: 'Deliver Acme proposal', owner: 'Marco', due: 'Nov 27', space: 'Work', status: 'Blocked' },
    { title: 'Approve project budget', owner: 'You', due: 'Today', space: 'Work', status: 'Due today' },
    { title: 'Deliver IT specifications', owner: 'Luca', due: 'Nov 30', space: 'Work', status: 'Delayed' },
    { title: 'Pay electricity bill', owner: 'You', due: 'Nov 27', space: 'Personal', status: 'Upcoming' },
  ],
  logs: [
    { space: 'Work', text: 'Detected proposal dependency across three messages' },
    { space: 'Personal', text: 'Extracted private appointment' },
  ],
  analysis: {},
  // User profile
  user: {
    name: 'Alex Morgan',
    email: 'alex@company.example',
    role: 'Product Manager',
    timezone: 'Europe/Rome',
    avatar: null,
    notifications: { email: true, browser: true, weekly: false },
    theme: 'light',
  },
  // Connected mail accounts
  mailAccounts: [
    { id: 'ma-1', provider: 'gmail', label: 'Personal Gmail', email: 'alex.personal@example.com', space: 'Personal', status: 'connected', syncEnabled: true, lastSync: '2 min ago' },
    { id: 'ma-2', provider: 'outlook', label: 'Corporate Outlook', email: 'alex@company.example', space: 'Work', status: 'connected', syncEnabled: true, lastSync: '5 min ago' },
  ],
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('inboxzen-state') || '{}');
    return { ...structuredClone(INITIAL_STATE), ...saved, page: INITIAL_STATE.page };
  } catch {
    return structuredClone(INITIAL_STATE);
  }
}

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(loadLanguage);
  const [state, setStateRaw] = useState(loadState);
  const [notice, setNoticeRaw] = useState(null);
  const [modal, setModal] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem('inboxzen-language', language);
    } catch {
      // The language remains available for the current session.
    }
  }, [language]);

  const translate = useCallback((message, values) => translateMessage(language, message, values), [language]);
  const setNotice = useCallback((message, values) => {
    setNoticeRaw(message ? { message, values } : null);
  }, []);

  const setState = useCallback((updater) => {
    setStateRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem('inboxzen-state', JSON.stringify(next));
      return next;
    });
  }, []);

  const navigate = useCallback((page) => {
    setState((s) => ({ ...s, page }));
    setNotice('');
    setModal('');
  }, [setState]);

  const setSpace = useCallback((space) => {
    setState((s) => ({ ...s, space }));
    setNotice('');
    setModal('');
  }, [setState]);

  const resetDemo = useCallback(() => {
    const fresh = structuredClone(INITIAL_STATE);
    localStorage.setItem('inboxzen-state', JSON.stringify(fresh));
    setStateRaw(fresh);
    setNotice('Demo reset.');
    setModal('');
  }, []);

  const visible = useCallback((sp) => state.space === 'All' || state.space === sp, [state.space]);

  return (
    <AppContext.Provider value={{
      state, setState, navigate, setSpace, resetDemo,
      language, setLanguage, t: translate, demoDate: formatDemoDate(language),
      formatDueDate: due => formatDemoDueDate(language, due),
      notice, setNotice, modal, setModal, busy, setBusy,
      visible,
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
