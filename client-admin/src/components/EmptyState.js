import React from 'react';

export default function EmptyState({ title='Nothing here yet', subtitle='Try adjusting filters or check back later.', action }){
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: 'var(--space-2)' }}>{title}</h2>
      <p className="muted">{subtitle}</p>
      {action}
    </div>
  );
}





