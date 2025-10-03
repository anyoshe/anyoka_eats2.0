import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import SlideOver from '../components/SlideOver';
import Chip from '../components/Chip';
import Pagination from '../components/Pagination';
import ResponsiveList from '../components/ResponsiveList';
import EmptyState from '../components/EmptyState';
import { drivers as mockDrivers } from '../mocks/data';

export default function Drivers(){
  const [query, setQuery] = useState('');
  const [onlineFilter, setOnlineFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = mockDrivers.filter(d => {
    const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase()) || d.id.includes(query);
    const matchesOnline = onlineFilter === 'all' || (onlineFilter === 'online' && d.online) || (onlineFilter === 'offline' && !d.online);
    return matchesQuery && matchesOnline;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice((page-1)*pageSize, page*pageSize);

  const columns = [
    { key: 'id', label: 'Driver ID' },
    { key: 'name', label: 'Name' },
    { key: 'online', label: 'Online', render: v => (
      <span style={{ 
        background: v ? 'rgba(30,165,9,0.12)' : 'rgba(176,0,32,0.12)', 
        color: v ? 'var(--color-green)' : '#b00020',
        borderRadius: '9999px', 
        padding: '0.15rem 0.5rem', 
        fontSize: '0.85rem', 
        fontWeight: 600 
      }}>{v ? 'Online' : 'Offline'}</span>
    )},
    { key: 'currentOrder', label: 'Current Order' },
    { key: 'completionRate', label: 'Completion' },
    { key: 'rating', label: 'Rating' },
  ];

  return (
    <section className="stack section">
      <h2>Drivers</h2>
      <FilterBar>
        <input className="input" placeholder="Search drivers" value={query} onChange={e=>setQuery(e.target.value)} style={{ maxWidth: 320 }} />
        <div className="chips">
          <Chip active={onlineFilter==='all'} onClick={()=>setOnlineFilter('all')}>All</Chip>
          <Chip active={onlineFilter==='online'} onClick={()=>setOnlineFilter('online')}>Online</Chip>
          <Chip active={onlineFilter==='offline'} onClick={()=>setOnlineFilter('offline')}>Offline</Chip>
        </div>
        <button className="btn btn--primary">Export CSV</button>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState 
          title="No drivers found" 
          subtitle="Try adjusting your search or filters."
          action={<button className="btn btn--emphasis" onClick={()=>{setQuery('');setOnlineFilter('all');}}>Clear filters</button>}
        />
      ) : (
        <>
          <div className="hide-sm">
            <DataTable
              columns={columns}
              rows={pageRows}
              renderActions={row => (
                <div className="cluster">
                  <button className="btn" onClick={()=>setSelected(row)} style={{ background: 'var(--color-gray-100)' }}>View</button>
                  <button className="btn btn--emphasis">Disable</button>
                </div>
              )}
            />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </div>

          <div className="hide-lg">
            <ResponsiveList
              items={pageRows}
              renderCard={(row)=>(
                <div className="card-row">
                  <div><strong>{row.name}</strong><div className="muted">{row.id}</div></div>
                  <div style={{ justifySelf: 'end' }}>
                    <span style={{ 
                      background: row.online ? 'rgba(30,165,9,0.12)' : 'rgba(176,0,32,0.12)', 
                      color: row.online ? 'var(--color-green)' : '#b00020',
                      borderRadius: '9999px', 
                      padding: '0.15rem 0.5rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 600 
                    }}>{row.online ? 'Online' : 'Offline'}</span>
                  </div>
                  <div><small className="muted">Current order</small><div>{row.currentOrder}</div></div>
                  <div><small className="muted">Completion</small><div>{row.completionRate}</div></div>
                  <div><small className="muted">Rating</small><div>{row.rating}</div></div>
                  <div><button className="btn" onClick={()=>setSelected(row)} style={{ background: 'var(--color-gray-100)' }}>View</button></div>
                </div>
              )}
            />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </div>
        </>
      )}

      <SlideOver open={!!selected} title={selected?.name} onClose={()=>setSelected(null)}>
        {selected && (
          <div className="stack">
            <div className="card"><strong>Driver ID:</strong> {selected.id}</div>
            <div className="card"><strong>Status:</strong> {selected.online ? 'Online' : 'Offline'}</div>
            <div className="card"><strong>Current order:</strong> {selected.currentOrder}</div>
            <div className="card"><strong>Completion rate:</strong> {selected.completionRate}</div>
            <div className="card"><strong>Rating:</strong> {selected.rating}</div>
            <div className="card">
              <strong>Actions:</strong>
              <div className="cluster" style={{ marginTop: 'var(--space-2)' }}>
                <button className="btn btn--emphasis">Disable driver</button>
                <button className="btn" style={{ background: 'var(--color-gray-100)' }}>Assign training</button>
                <button className="btn" style={{ background: 'var(--color-gray-100)' }}>View trips</button>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </section>
  );
}


