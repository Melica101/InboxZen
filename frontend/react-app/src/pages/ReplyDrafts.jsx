import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ReplyDrafts() {
  const { t, data, setModal } = useApp();
  const drafts = data.actions.filter(a => a.status === 'DRAFT');

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('AI Reply Drafts')}</h1>
        <p className="page-desc">{t('Review the reply drafts available in the demo.')}</p>
      </header>
      <section className="card" aria-label={t('AI Reply Drafts')}>
        {drafts.length === 0 ? <p className="muted">{t('No reply drafts in this workspace.')}</p> : drafts.map(a => (
          <article className="item row between" key={a.id}>
            <h3>{a.subject}</h3>
            <button className="btn btn-secondary" onClick={() => setModal(a)}>{t('Review draft')}</button>
          </article>
        ))}
      </section>
    </div>
  );
}
