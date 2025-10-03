import React from 'react';

export default function StatusBadge({ status }){
  const map = {
    pending: { bg: 'var(--color-gray-100)', color: 'var(--color-gray-800)', label: 'Pending' },
    accepted: { bg: 'rgba(30,165,9,0.12)', color: 'var(--color-green)', label: 'Accepted' },
    transit: { bg: 'rgba(255,165,0,0.14)', color: '#b26b00', label: 'In Transit' },
    delivered: { bg: 'rgba(30,165,9,0.12)', color: 'var(--color-green)', label: 'Delivered' },
    cancelled: { bg: 'rgba(176,0,32,0.12)', color: '#b00020', label: 'Cancelled' },
    refunded: { bg: 'rgba(176,0,32,0.12)', color: '#b00020', label: 'Refunded' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: '9999px', padding: '0.15rem 0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{s.label}</span>
  );
}





