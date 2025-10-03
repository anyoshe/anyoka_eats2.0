import React from 'react';

export default function FilterBar({ children }){
  return (
    <div style={{ position: 'sticky', top: '3.2rem', zIndex: 200, background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '0.5rem 0' }}>
        {children}
      </div>
    </div>
  );
}





