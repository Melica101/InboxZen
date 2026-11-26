import italian from './it.json';

const catalogs = { en: {}, it: italian };
export const languages = { en: 'English', it: 'Italiano' };

export function loadLanguage() {
  try {
    const saved = localStorage.getItem('inboxzen-language');
    if (Object.hasOwn(languages, saved)) return saved;
  } catch {
    // Fall back to the browser language when storage is unavailable.
  }
  return navigator.language.toLowerCase().split('-')[0] === 'it' ? 'it' : 'en';
}

export function translateMessage(language, message, values = {}) {
  const catalog = catalogs[language];
  const template = Object.hasOwn(catalog, message) ? catalog[message] : message;
  return template.replace(/\{(\w+)\}/g, (token, key) => Object.hasOwn(values, key) ? values[key] : token);
}

const demoDate = new Date(Date.UTC(2026, 10, 26));
const demoDueDates = { 'Nov 26': 26, 'Nov 27': 27, 'Nov 30': 30 };

export function formatDemoDate(language) {
  return new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(demoDate);
}

export function formatDemoDueDate(language, due) {
  if (!Object.hasOwn(demoDueDates, due)) return translateMessage(language, due);
  return new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(2026, 10, demoDueDates[due])));
}
