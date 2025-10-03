import React from 'react';

export default function Chip({ children, active=false, onClick }){
  const style = active
    ? { background: 'rgba(255,165,0,0.15)', color: 'var(--color-orange)', border: '1px solid rgba(255,165,0,0.35)' }
    : { background: 'var(--color-white)', border: '1px solid var(--color-border)' };
  return (
    <button className="btn" onClick={onClick} style={{ ...style, borderRadius: '9999px' }}>{children}</button>
  );
}





