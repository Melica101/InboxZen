import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api.js';
import { X } from 'lucide-react';

export default function ActionModal() {
  const { modal, setModal, act } = useApp();
  if (!modal) return null;

  const isConflict = modal.type === 'RESCHEDULE';
  const close = () => setModal(null);

  // approve/reject the backend draft; a backend refusal (e.g. recommendations-only mode) shows as the notice
  const decide = (verb, msg) => { const m = modal; close(); act(async () => { await api(`/actions/${m.id}/${verb}`, 'POST'); return msg; }); };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="row between" style={{ marginBottom: 18 }}>
          <h2>{isConflict ? 'Resolve scheduling conflict' : 'Review escalation'}</h2>
          <button className="btn btn-link" onClick={close}><X size={18} /></button>
        </div>
        <div className="email-tile">
          <strong>To: {modal.recipients}</strong>
          <p style={{ marginTop: 8 }}><b>{modal.subject}</b></p>
          <p style={{ marginTop: 8, color: '#555', whiteSpace: 'pre-wrap' }}>{modal.body}</p>
        </div>
        <div className="privacy-note">
          {isConflict
            ? 'Only free/busy information used. No personal details included.'
            : 'Sources: linked work emails. No personal data included.'}
        </div>
        <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => decide('reject', 'Draft discarded.')}>Discard</button>
          {modal.status === 'DRAFT' && (
            <button className="btn btn-primary" onClick={() => decide('approve', isConflict ? 'Meeting moved. No real calendar changed.' : 'Escalation approved. No real email sent.')}>
              Approve simulated {isConflict ? 'reschedule' : 'send'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
