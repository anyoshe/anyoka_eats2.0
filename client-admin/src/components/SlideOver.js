import React from 'react';

export default function SlideOver({ open, title, onClose, children }){
  if (!open) return null;
  return (
    <div>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 99999 }} onClick={onClose} />
      <aside style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(96vw, 520px)', background: 'var(--color-white)', boxShadow: 'var(--shadow-lg)', zIndex: 100000, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong>{title}</strong>
          <button className="btn" onClick={onClose} style={{ background: 'var(--color-gray-100)' }}>Close</button>
        </div>
        <div style={{ padding: '1rem', overflow: 'auto' }}>
          {children}
        </div>
      </aside>
    </div>
  );
}





