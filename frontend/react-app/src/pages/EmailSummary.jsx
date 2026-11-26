import React from 'react';
import { useApp } from '../context/AppContext.jsx';

const WORKSPACES = ['Work', 'Personal'];

export default function EmailSummary() {
  const { t, data, visible, navigate } = useApp();

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('AI Email Summary')}</h1>
        <p className="page-desc">{t('Workspace summaries from email analysis.')}</p>
      </header>
      <div className="stack">
        {WORKSPACES.filter(visible).map(space => (
          <section className="card" key={space}>
            <h2>{t(space)}</h2>
            <p>{data.briefing.summaries?.[space.toUpperCase()] || t('No summary for this workspace yet.')}</p>
          </section>
        ))}
        <div>
          <button className="btn btn-secondary" onClick={() => navigate('Daily briefing')}>
            {t('Daily Briefing')}
          </button>
        </div>
      </div>
    </div>
  );
}
