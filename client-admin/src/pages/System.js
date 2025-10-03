import React from 'react';
import KpiCard from '../components/KpiCard';
import { system as sys } from '../mocks/data';

export default function System(){
  return (
    <section className="stack section">
      <h2>System</h2>
      <div className="grid-auto">
        <KpiCard label="API Latency" value={`${sys.latencyMs}ms`} hint="p95 response time" />
        <KpiCard label="Error Rate" value={sys.errorRatePct} hint="last 24h" tone="warning" />
        <KpiCard label="Uptime" value={`${sys.uptimeDays} days`} hint="since last restart" tone="success" />
        <KpiCard label="Queue Depth" value={sys.queueDepth} hint="pending jobs" />
      </div>

      <div className="grid-2-1">
        <div className="card">
          <h3 className="card-title">Recent System Logs</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {sys.logs.map((l, idx) => (
              <div key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    background: l.level === 'info' ? 'rgba(30,165,9,0.12)' : 'rgba(255,165,0,0.14)', 
                    color: l.level === 'info' ? 'var(--color-green)' : '#b26b00',
                    borderRadius: '9999px', 
                    padding: '0.15rem 0.5rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 600 
                  }}>{l.level}</span>
                  <small className="muted">{l.ts}</small>
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{l.msg}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">System Actions</h3>
          <div className="stack">
            <button className="btn btn--emphasis">Clear cache</button>
            <button className="btn" style={{ background: 'var(--color-gray-100)' }}>Restart services</button>
            <button className="btn" style={{ background: 'var(--color-gray-100)' }}>View full logs</button>
            <button className="btn" style={{ background: 'var(--color-gray-100)' }}>Download diagnostics</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Service Status</h3>
        <div className="grid-auto">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
            <strong>API Gateway</strong>
            <div className="muted">Healthy</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
            <strong>Database</strong>
            <div className="muted">Connected</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟡</div>
            <strong>Email Service</strong>
            <div className="muted">Degraded</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
            <strong>Payment Gateway</strong>
            <div className="muted">Operational</div>
          </div>
        </div>
      </div>
    </section>
  );
}


