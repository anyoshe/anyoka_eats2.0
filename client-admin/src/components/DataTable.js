import React from 'react';

export default function DataTable({ columns, rows, rowKey='id', renderActions, getRowStyle }){
  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-gray-50)', position: 'sticky', top: 0 }}>{col.label}</th>
              ))}
              {renderActions && <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-gray-50)', position: 'sticky', top: 0 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row[rowKey] ?? idx} style={{ background: idx % 2 ? 'transparent' : 'rgba(0,0,0,0.015)', ...(getRowStyle ? (getRowStyle(row) || {}) : {}) }}>
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
                {renderActions && (
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}





