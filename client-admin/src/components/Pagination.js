import React from 'react';

export default function Pagination({ page, pageCount, onPage }){
  const prev = () => onPage(Math.max(1, page-1));
  const next = () => onPage(Math.min(pageCount, page+1));
  return (
    <div className="cluster" style={{ justifyContent: 'flex-end' }}>
      <button className="btn" onClick={prev} disabled={page===1} style={{ background: 'var(--color-gray-100)' }}>Prev</button>
      <small>Page {page} of {pageCount}</small>
      <button className="btn" onClick={next} disabled={page===pageCount} style={{ background: 'var(--color-gray-100)' }}>Next</button>
    </div>
  );
}





