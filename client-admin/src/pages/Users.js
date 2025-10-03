import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import SlideOver from '../components/SlideOver';
import Chip from '../components/Chip';
import Pagination from '../components/Pagination';
import ResponsiveList from '../components/ResponsiveList';
import EmptyState from '../components/EmptyState';
import { users as mockUsers } from '../mocks/data';

export default function Users(){
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = mockUsers.filter(u => {
    const matchesQuery = u.name.toLowerCase().includes(query.toLowerCase()) || u.id.includes(query);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice((page-1)*pageSize, page*pageSize);

  const columns = [
    { key: 'id', label: 'User ID' },
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'orders', label: 'Orders' },
    { key: 'lastOrder', label: 'Last Order' },
    { key: 'status', label: 'Status', render: (v) => (
      <span style={{ 
        background: v === 'active' ? 'rgba(30,165,9,0.12)' : 'rgba(176,0,32,0.12)', 
        color: v === 'active' ? 'var(--color-green)' : '#b00020',
        borderRadius: '9999px', 
        padding: '0.15rem 0.5rem', 
        fontSize: '0.85rem', 
        fontWeight: 600 
      }}>{v}</span>
    )},
  ];

  return (
    <section className="stack section">
      <h2>Users</h2>
      <FilterBar>
        <input className="input" placeholder="Search users" value={query} onChange={e=>setQuery(e.target.value)} style={{ maxWidth: 320 }} />
        <div className="chips">
          <Chip active={statusFilter==='all'} onClick={()=>setStatusFilter('all')}>All</Chip>
          <Chip active={statusFilter==='active'} onClick={()=>setStatusFilter('active')}>Active</Chip>
          <Chip active={statusFilter==='suspended'} onClick={()=>setStatusFilter('suspended')}>Suspended</Chip>
        </div>
        <button className="btn btn--primary">Export CSV</button>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState 
          title="No users found" 
          subtitle="Try adjusting your search or filters."
          action={<button className="btn btn--emphasis" onClick={()=>{setQuery('');setStatusFilter('all');}}>Clear filters</button>}
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
                  <button className="btn btn--emphasis">{row.status === 'active' ? 'Suspend' : 'Reactivate'}</button>
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
                      background: row.status === 'active' ? 'rgba(30,165,9,0.12)' : 'rgba(176,0,32,0.12)', 
                      color: row.status === 'active' ? 'var(--color-green)' : '#b00020',
                      borderRadius: '9999px', 
                      padding: '0.15rem 0.5rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 600 
                    }}>{row.status}</span>
                  </div>
                  <div><small className="muted">Contact</small><div>{row.contact}</div></div>
                  <div><small className="muted">Orders</small><div>{row.orders}</div></div>
                  <div><small className="muted">Last order</small><div>{row.lastOrder}</div></div>
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
            <div className="card"><strong>User ID:</strong> {selected.id}</div>
            <div className="card"><strong>Contact:</strong> {selected.contact}</div>
            <div className="card"><strong>Status:</strong> {selected.status}</div>
            <div className="card"><strong>Total orders:</strong> {selected.orders}</div>
            <div className="card"><strong>Last order:</strong> {selected.lastOrder}</div>
            <div className="card">
              <strong>Actions:</strong>
              <div className="cluster" style={{ marginTop: 'var(--space-2)' }}>
                <button className="btn btn--emphasis">{selected.status === 'active' ? 'Suspend account' : 'Reactivate account'}</button>
                <button className="btn" style={{ background: 'var(--color-gray-100)' }}>Reset password</button>
                <button className="btn" style={{ background: 'var(--color-gray-100)' }}>View activity</button>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </section>
  );
}


