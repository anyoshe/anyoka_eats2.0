import React from 'react';

export default function KpiCard({ label, value, hint, tone='default' }){
  const toneStyles = {
    default: {},
    success: { outline: '1px solid rgba(30,165,9,0.25)' },
    warning: { outline: '1px solid rgba(255,165,0,0.35)' },
    danger: { outline: '1px solid rgba(176,0,32,0.25)' },
  }[tone] || {};

  return (
    <div className="card" style={toneStyles}>
      <small style={{ color: 'var(--color-text-muted)' }}>{label}</small>
      <h2 style={{ margin: '0.25rem 0' }}>{value}</h2>
      {hint && <small>{hint}</small>}
    </div>
  );
}





