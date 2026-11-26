import React from 'react';
import { useApp } from '../context/AppContext.jsx';

const DEMO_DRAFTS = [
  { action: 'escalate', title: 'Review escalation' },
  { action: 'conflict', title: 'Resolve scheduling conflict' },
];

export default function ReplyDrafts() {
  const { t, state, visible, setModal } = useApp();
  const drafts = visible('Work') ? DEMO_DRAFTS.filter(({ action }) => (
    action === 'conflict' ? state.space === 'All' && state.settings[2] && !state.moved : !state.approved && !state.resolved
  )) : [];

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('AI Reply Drafts')}</h1>
        <p className="page-desc">{t('Review the reply drafts available in the demo.')}</p>
      </header>
      <section className="card" aria-label={t('AI Reply Drafts')}>
        {drafts.length === 0 ? <p className="muted">{t('No reply drafts in this workspace.')}</p> : drafts.map(({ action, title }) => (
          <article className="item row between" key={action}>
            <h3>{t(title)}</h3>
            <button className="btn btn-secondary" onClick={() => setModal(action)}>{t('Review draft')}</button>
          </article>
        ))}
      </section>
    </div>
  );
}
