import React from 'react';

export default function StatTrend({ label, value, delta, positive=true }){
  return (
    <div className="card">
      <div className="card-title"><strong>{label}</strong></div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <h2 style={{ margin: 0 }}>{value}</h2>
        <small style={{ color: positive ? 'var(--color-green)' : '#b00020' }}>{positive ? '+' : ''}{delta}</small>
      </div>
    </div>
  );
}





