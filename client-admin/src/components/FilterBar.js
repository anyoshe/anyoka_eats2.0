import React from 'react';

export default function FilterBar({ children }){
  return (
    <div style={{ position: 'sticky', top: '3.2rem', zIndex: 200, background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container filter-bar" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-2)', 
        padding: 'var(--space-3) 0',
        flexWrap: 'wrap'
      }}>
        {children}
      </div>
    </div>
  );
}





