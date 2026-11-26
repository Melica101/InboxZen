import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { X } from 'lucide-react';

export default function Topbar() {
  const { state, navigate, setSpace, notice, setNotice } = useApp();

  const initials = state.user.name
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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
              {label}
            </button>
          ))}
        </div>
        <div className="row">
          <span className="chip green">● Demo mode</span>
          <button
            type="button"
            className="avatar avatar-button"
            aria-label="Profile settings"
            onClick={() => navigate('Profile')}
          >
            {state.user.avatar ? <img src={state.user.avatar} className="avatar" alt="" /> : initials}
          </button>
        </div>
      </header>
      {notice && (
        <div className="toast" style={{ margin: '16px 32px 0' }}>
          <span>{notice}</span>
          <button className="btn btn-link" style={{ color: '#fff', flexShrink: 0 }} onClick={() => setNotice('')}>
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
