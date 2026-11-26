import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { X } from 'lucide-react';

export default function ActionModal() {
  const { t: translate, modal, setModal, state, setState, setNotice } = useApp();
  if (!modal) return null;

  const isConflict = modal === 'conflict';

  function handleConfirm() {
    if (state.mode === 'Recommendations only') {
      setNotice('Enable approval mode to execute simulated actions.');
      setModal('');
      return;
    }
    if (isConflict) {
      setState(s => ({
        ...s,
        moved: true,
        logs: [...s.logs, { space: 'Work', text: 'Approved simulated reschedule to 16:30' }],
      }));
      setNotice('Demo meeting moved. No real calendar changed.');
    } else {
      setState(s => ({
        ...s,
        approved: true,
        logs: [...s.logs, { space: 'Work', text: 'Approved simulated escalation' }],
      }));
      setNotice('Demo escalation approved. No real email sent.');
    }
    setModal('');
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModal('')}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="action-title">
        <div className="row between" style={{ marginBottom: 18 }}>
          <h2 id="action-title">{isConflict ? translate("Resolve scheduling conflict") : translate("Review escalation")}</h2>
          <button className="btn btn-link" aria-label={translate("Close")} onClick={() => setModal('')}><X size={18} /></button>
        </div>
        <div className="email-tile">
          <strong>{translate("To: {recipient}", { recipient: translate(isConflict ? "Acme project team" : "Engineering and IT") })}</strong>
          <p style={{ marginTop: 8, color: '#555' }}>
            {isConflict
              ? translate("Hi everyone, I am unavailable at 15:00. Would 16:30 work instead?")
              : translate("Hi team, the IT delay threatens Friday's client proposal. Can we agree on an accelerated delivery or contingency plan today?")}
          </p>
        </div>
        <div className="privacy-note">
          {isConflict
            ? translate("Only free/busy information used. No personal details included.")
            : translate("Sources: three work emails. No personal data included.")}
        </div>
        <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setModal('')}>{translate("Cancel")}</button>
          <button className="btn btn-primary" onClick={handleConfirm}>{translate(isConflict ? "Approve simulated reschedule" : "Approve simulated send")}
          </button>
        </div>
      </div>
    </div>
  );
}
