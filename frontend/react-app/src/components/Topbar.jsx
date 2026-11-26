import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { languages } from '../i18n/messages.js';
import { ChevronDown, X } from 'lucide-react';

export default function Topbar() {
  const { t: translate, state, language, setLanguage, navigate, setSpace, notice, setNotice } = useApp();

  const initials = state.user.name
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const noticeValues = notice?.message === 'Analysis complete: {results}.'
    ? { results: notice.values.results.map(mode => translate(mode)).join(', ') }
    : notice?.values;

  return (
    <>
      <header className="topbar">
        <div className="segment">
          {[['All', 'My day'], ['Work', 'Work'], ['Personal', 'Personal']].map(([val, label]) => (
            <button
              key={val}
              className={`segment-btn ${state.space === val ? 'active' : ''}`}
              onClick={() => setSpace(val)}
            >
              {translate(label)}
            </button>
          ))}
        </div>
        <div className="row topbar-tools">
          <div className="language-control">
            <select className="language-select" aria-label={translate("Language")} value={language}
              onChange={event => setLanguage(event.target.value)}>
              {Object.entries(languages).map(([code, label]) => (
                <option key={code} value={code} lang={code}>{label}</option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </div>
          <span className="chip green">{translate("● Demo mode")}</span>
          <button
            type="button"
            className="avatar avatar-button"
            aria-label={translate("Profile settings")}
            onClick={() => navigate('Profile')}
          >
            {state.user.avatar ? <img src={state.user.avatar} className="avatar" alt="" /> : initials}
          </button>
        </div>
      </header>
      {notice && (
        <div className="toast" style={{ margin: '16px 32px 0' }}>
          <span role="status">{translate(notice.message, noticeValues)}</span>
          <button className="btn btn-link" style={{ color: '#fff', flexShrink: 0 }} aria-label={translate("Dismiss notification")} onClick={() => setNotice('')}>
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
