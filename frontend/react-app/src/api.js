// All data comes from the Spring backend (/api/*, proxied by server.mjs). Only the JWT + local UI prefs live in localStorage.
const KEY = 'inboxzen-token';
const ls = {
  get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
  set: (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* ignore */ } },
};
let token = ls.get();
export const getToken = () => token;
export const setToken = (t) => { token = t; ls.set(t); };

export async function api(path, method = 'GET', body) {
  const r = await fetch('/api' + path, {
    method,
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  let j = null;
  try { j = t ? JSON.parse(t) : null; } catch { /* non-JSON body */ }
  if (r.status === 401 && !path.startsWith('/auth/')) throw Error('unauthorized');
  if (!r.ok) throw Error(j?.detail || j?.title || `Request failed (${r.status})`);
  return j;
}

// backend enums are UPPERCASE (WORK), UI labels are Title case (Work)
export const cap = (x) => (x ? x[0] + x.slice(1).toLowerCase() : '');
export const hm = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
export const dateLabel = (data) =>
  (data ? new Date(data.briefing.date + 'T12:00:00') : new Date())
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase() + ' · DEMO WORKSPACE';
