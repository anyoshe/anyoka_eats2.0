import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import SlideOver from '../components/SlideOver';
import Chip from '../components/Chip';
import Pagination from '../components/Pagination';
import ResponsiveList from '../components/ResponsiveList';
import EmptyState from '../components/EmptyState';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { users as mockUsers } from '../mocks/data';

export default function Users(){
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { user } = useAuth();

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, query]);

  // Use real API call when authenticated
  const { data: usersData, loading, error, refetch } = useApi(() => apiService.getUsers());
  
  // Use real data when authenticated, fallback to mock data
  const allUsers = usersData?.users || usersData || mockUsers;

  const filtered = allUsers.filter(u => {
    const matchesQuery = (u.names || u.name || u.username || '').toLowerCase().includes(query.toLowerCase()) || 
                        (u.id || u._id || '').includes(query) ||
                        (u.email || '').toLowerCase().includes(query.toLowerCase()) ||
                        (u.phoneNumber || '').includes(query);
    const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice((page-1)*pageSize, page*pageSize);

  const columns = [
    { key: 'id', label: 'User ID', render: (v, row) => row.id || row._id || 'N/A' },
    { key: 'name', label: 'Name', render: (v, row) => row.names || row.name || row.username || 'N/A' },
    { key: 'contact', label: 'Contact', render: (v, row) => row.email || row.phoneNumber || row.contact || 'N/A' },
    { key: 'orders', label: 'Orders', render: (v, row) => row.ordersCount || row.orders || 0 },
    { key: 'lastOrder', label: 'Last Order', render: (v, row) => row.lastOrder || row.lastOrderDate || 'N/A' },
    { key: 'status', label: 'Status', render: (v, row) => {
      const status = row.status || 'active';
      return (
        <span style={{ 
          background: status === 'active' ? 'rgba(30,165,9,0.12)' : 'rgba(176,0,32,0.12)', 
          color: status === 'active' ? 'var(--color-green)' : '#b00020',
          borderRadius: '9999px', 
          padding: '0.15rem 0.5rem', 
          fontSize: '0.85rem', 
          fontWeight: 600 
        }}>{status}</span>
      );
    }},
  ];

  if (loading) {
    return (
      <section className="stack section">
        <h2>Users</h2>
        <div className="card">
          <p>Loading users...</p>
        </div>
      </section>
    );
  }

  // Show error if we can't load data
  if (error) {
    return (
      <section className="stack section">
        <h2>Users</h2>
        <div className="card">
          <h3>Error loading users</h3>
          <p>Could not connect to users endpoint: {error}</p>
          <button className="btn btn--primary" onClick={refetch}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack section">
      <h2>Users {!user && <small style={{ color: 'var(--color-text-muted)', fontWeight: 'normal' }}>(demo data - requires authentication for real data)</small>}</h2>
      <FilterBar>
        {/* Search input - always visible */}
        <input 
          className="input" 
          placeholder="Search users..." 
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: '1', minWidth: '200px', maxWidth: '400px' }} 
        />
        
        {/* Status dropdown - mobile only */}
        <select 
          className="input hide-lg" 
          value={statusFilter} 
          onChange={e=>setStatusFilter(e.target.value)} 
          style={{ minWidth: '140px', maxWidth: '180px' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        
        {/* Status chips - desktop only */}
        <div className="chips hide-sm" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Chip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</Chip>
          <Chip active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>Active</Chip>
          <Chip active={statusFilter === 'suspended'} onClick={() => setStatusFilter('suspended')}>Suspended</Chip>
        </div>
        
        {/* Action buttons */}
        <div className="cluster" style={{ flexShrink: 0 }}>
          <button 
            className="btn" 
            onClick={() => { setStatusFilter('all'); setQuery(''); }}
            style={{ background: 'var(--color-gray-100)' }}
          >
            Clear
          </button>
          <button className="btn btn--primary">Export CSV</button>
        </div>
      </FilterBar>

      {/* Results count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <small className="muted">
          Showing {pageRows.length} of {filtered.length} users
          {statusFilter !== 'all' && ` (filtered by ${statusFilter})`}
          {query && ` (searching for "${query}")`}
        </small>
      </div>

      {filtered.length === 0 && !loading ? (
        <EmptyState 
          title="No users found" 
          subtitle={query || statusFilter !== 'all' ? "Try adjusting your search or filters." : "No users available."}
          action={
            (query || statusFilter !== 'all') ? (
              <button 
                className="btn btn--emphasis" 
                onClick={() => { setStatusFilter('all'); setQuery(''); }}
              >
                Clear filters
              </button>
            ) : null
          }
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
                  <div><strong>{row.names || row.name || row.username || 'N/A'}</strong><div className="muted">{row.id || row._id || 'N/A'}</div></div>
                  <div style={{ justifySelf: 'end' }}>
                    <span style={{ 
                      background: (row.status || 'active') === 'active' ? 'rgba(30,165,9,0.12)' : 'rgba(176,0,32,0.12)', 
                      color: (row.status || 'active') === 'active' ? 'var(--color-green)' : '#b00020',
                      borderRadius: '9999px', 
                      padding: '0.15rem 0.5rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 600 
                    }}>{row.status || 'active'}</span>
                  </div>
                  <div><small className="muted">Contact</small><div>{row.email || row.phoneNumber || row.contact || 'N/A'}</div></div>
                  <div><small className="muted">Orders</small><div>{row.ordersCount || row.orders || 0}</div></div>
                  <div><small className="muted">Last order</small><div>{row.lastOrder || row.lastOrderDate || 'N/A'}</div></div>
                  <div><button className="btn" onClick={()=>setSelected(row)} style={{ background: 'var(--color-gray-100)' }}>View</button></div>
                </div>
              )}
            />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </div>
        </>
      )}

      <SlideOver open={!!selected} title={selected?.name || selected?.username || 'User Details'} onClose={()=>setSelected(null)}>
        {selected && (
          <div className="stack">
            <div className="card"><strong>User ID:</strong> {selected.id || selected._id || 'N/A'}</div>
            <div className="card"><strong>Name:</strong> {selected.name || selected.username || 'N/A'}</div>
            <div className="card"><strong>Contact:</strong> {selected.email || selected.contact || 'N/A'}</div>
            <div className="card"><strong>Status:</strong> {selected.status || 'active'}</div>
            <div className="card"><strong>Total orders:</strong> {selected.ordersCount || selected.orders || 0}</div>
            <div className="card"><strong>Last order:</strong> {selected.lastOrder || selected.lastOrderDate || 'N/A'}</div>
            <div className="card">
              <strong>Actions:</strong>
              <div className="cluster" style={{ marginTop: 'var(--space-2)' }}>
                <button className="btn btn--emphasis">{(selected.status || 'active') === 'active' ? 'Suspend account' : 'Reactivate account'}</button>
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


