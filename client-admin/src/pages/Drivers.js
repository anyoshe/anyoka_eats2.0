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
import { drivers as mockDrivers } from '../mocks/data';

export default function Drivers(){
  const [query, setQuery] = useState('');
  const [onlineFilter, setOnlineFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { user } = useAuth();

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [onlineFilter, query]);

  // Use real API call when authenticated
  const { data: driversData, loading, error, refetch } = useApi(() => apiService.getDrivers());
  
  // Use real data when authenticated, fallback to mock data
  const allDrivers = driversData?.drivers || driversData || mockDrivers;

  const filtered = allDrivers.filter(d => {
    const matchesQuery = (d.name || d.username || '').toLowerCase().includes(query.toLowerCase()) || 
                        (d.id || d._id || '').includes(query) ||
                        (d.email || '').toLowerCase().includes(query.toLowerCase());
    const matchesOnline = onlineFilter === 'all' || 
                         (onlineFilter === 'online' && (d.online || d.status === 'online')) || 
                         (onlineFilter === 'offline' && !(d.online || d.status === 'online'));
    return matchesQuery && matchesOnline;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice((page-1)*pageSize, page*pageSize);

  const columns = [
    { key: 'id', label: 'Driver ID', render: (v, row) => row.id || row._id || 'N/A' },
    { key: 'name', label: 'Name', render: (v, row) => row.name || row.username || 'N/A' },
    { key: 'online', label: 'Online', render: (v, row) => {
      const isOnline = row.online || row.status === 'online';
      return (
        <span style={{ 
          background: isOnline ? 'rgba(30,165,9,0.12)' : 'rgba(176,0,32,0.12)', 
          color: isOnline ? 'var(--color-green)' : '#b00020',
          borderRadius: '9999px', 
          padding: '0.15rem 0.5rem', 
          fontSize: '0.85rem', 
          fontWeight: 600 
        }}>{isOnline ? 'Online' : 'Offline'}</span>
      );
    }},
    { key: 'currentOrder', label: 'Current Order', render: (v, row) => row.currentOrder || row.activeOrder || 'N/A' },
    { key: 'completionRate', label: 'Completion', render: (v, row) => row.completionRate || row.completionPercentage || 'N/A' },
    { key: 'rating', label: 'Rating', render: (v, row) => row.rating || row.averageRating || 'N/A' },
  ];

  if (loading) {
    return (
      <section className="stack section">
        <h2>Drivers</h2>
        <div className="card">
          <p>Loading drivers...</p>
        </div>
      </section>
    );
  }

  // Show error if we can't load data
  if (error) {
    return (
      <section className="stack section">
        <h2>Drivers</h2>
        <div className="card">
          <h3>Error loading drivers</h3>
          <p>Could not connect to drivers endpoint: {error}</p>
          <button className="btn btn--primary" onClick={refetch}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack section">
      <h2>Drivers {!user && <small style={{ color: 'var(--color-text-muted)', fontWeight: 'normal' }}>(demo data - requires authentication for real data)</small>}</h2>
      <FilterBar>
        {/* Search input - always visible */}
        <input 
          className="input" 
          placeholder="Search drivers..." 
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: '1', minWidth: '200px', maxWidth: '400px' }} 
        />
        
        {/* Status dropdown - mobile only */}
        <select 
          className="input hide-lg" 
          value={onlineFilter} 
          onChange={e=>setOnlineFilter(e.target.value)} 
          style={{ minWidth: '140px', maxWidth: '180px' }}
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        
        {/* Status chips - desktop only */}
        <div className="chips hide-sm" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Chip active={onlineFilter === 'all'} onClick={() => setOnlineFilter('all')}>All</Chip>
          <Chip active={onlineFilter === 'online'} onClick={() => setOnlineFilter('online')}>Online</Chip>
          <Chip active={onlineFilter === 'offline'} onClick={() => setOnlineFilter('offline')}>Offline</Chip>
        </div>
        
        {/* Action buttons */}
        <div className="cluster" style={{ flexShrink: 0 }}>
          <button 
            className="btn" 
            onClick={() => { setOnlineFilter('all'); setQuery(''); }}
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
          Showing {pageRows.length} of {filtered.length} drivers
          {onlineFilter !== 'all' && ` (filtered by ${onlineFilter})`}
          {query && ` (searching for "${query}")`}
        </small>
      </div>

      {filtered.length === 0 && !loading ? (
        <EmptyState 
          title="No drivers found" 
          subtitle={query || onlineFilter !== 'all' ? "Try adjusting your search or filters." : "No drivers available."}
          action={
            (query || onlineFilter !== 'all') ? (
              <button 
                className="btn btn--emphasis" 
                onClick={() => { setOnlineFilter('all'); setQuery(''); }}
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
                  <div><strong>{row.name || row.username || 'N/A'}</strong><div className="muted">{row.id || row._id || 'N/A'}</div></div>
                  <div style={{ justifySelf: 'end' }}>
                    <span style={{ 
                      background: (row.online || row.status === 'online') ? 'rgba(30,165,9,0.12)' : 'rgba(176,0,32,0.12)', 
                      color: (row.online || row.status === 'online') ? 'var(--color-green)' : '#b00020',
                      borderRadius: '9999px', 
                      padding: '0.15rem 0.5rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 600 
                    }}>{(row.online || row.status === 'online') ? 'Online' : 'Offline'}</span>
                  </div>
                  <div><small className="muted">Current order</small><div>{row.currentOrder || row.activeOrder || 'N/A'}</div></div>
                  <div><small className="muted">Completion</small><div>{row.completionRate || row.completionPercentage || 'N/A'}</div></div>
                  <div><small className="muted">Rating</small><div>{row.rating || row.averageRating || 'N/A'}</div></div>
                  <div><button className="btn" onClick={()=>setSelected(row)} style={{ background: 'var(--color-gray-100)' }}>View</button></div>
                </div>
              )}
            />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </div>
        </>
      )}

      <SlideOver open={!!selected} title={selected?.name || selected?.username || 'Driver Details'} onClose={()=>setSelected(null)}>
        {selected && (
          <div className="stack">
            <div className="card"><strong>Driver ID:</strong> {selected.id || selected._id || 'N/A'}</div>
            <div className="card"><strong>Name:</strong> {selected.name || selected.username || 'N/A'}</div>
            <div className="card"><strong>Status:</strong> {(selected.online || selected.status === 'online') ? 'Online' : 'Offline'}</div>
            <div className="card"><strong>Current order:</strong> {selected.currentOrder || selected.activeOrder || 'N/A'}</div>
            <div className="card"><strong>Completion rate:</strong> {selected.completionRate || selected.completionPercentage || 'N/A'}</div>
            <div className="card"><strong>Rating:</strong> {selected.rating || selected.averageRating || 'N/A'}</div>
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


