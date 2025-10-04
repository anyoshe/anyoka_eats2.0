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
import { vendors as mockVendors } from '../mocks/data';

export default function Vendors(){
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { user } = useAuth();

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, kycFilter, query]);

  // Use real API call when authenticated
  const { data: partnersData, loading, error, refetch } = useApi(() => apiService.getPartners());
  
  // Use real data when authenticated, fallback to mock data
  const allVendors = partnersData?.partners || partnersData || mockVendors;

  const filtered = allVendors.filter(v => {
    const matchesQuery = (v.name || v.shopName || '').toLowerCase().includes(query.toLowerCase()) || (v.id || v._id || '').includes(query);
    const matchesStatus = statusFilter === 'all' || (v.status || 'active') === statusFilter;
    const matchesKyc = kycFilter === 'all' || (v.kyc || 'verified') === kycFilter;
    return matchesQuery && matchesStatus && matchesKyc;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice((page-1)*pageSize, page*pageSize);

  const columns = [
    { key: 'id', label: 'Vendor ID', render: (v, row) => row.id || row._id || 'N/A' },
    { key: 'name', label: 'Name', render: (v, row) => row.name || row.shopName || 'N/A' },
    { key: 'kyc', label: 'KYC', render: (v) => {
      const kycStatus = v || 'verified';
      return (
        <span style={{ 
          background: kycStatus === 'verified' ? 'rgba(30,165,9,0.12)' : 'rgba(255,165,0,0.14)', 
          color: kycStatus === 'verified' ? 'var(--color-green)' : '#b26b00',
          borderRadius: '9999px', 
          padding: '0.15rem 0.5rem', 
          fontSize: '0.85rem', 
          fontWeight: 600 
        }}>{kycStatus}</span>
      );
    }},
    { key: 'products', label: 'Products', render: (v) => v || 'N/A' },
    { key: 'orders7d', label: 'Orders (7d)', render: (v) => v || 'N/A' },
    { key: 'rating', label: 'Rating', render: (v) => v || 'N/A' },
    { key: 'status', label: 'Status', render: (v) => {
      const status = v || 'active';
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
        <h2>Vendors</h2>
        <div className="card">
          <p>Loading vendors...</p>
        </div>
      </section>
    );
  }

  // Show error if we can't load data
  if (error) {
    return (
      <section className="stack section">
        <h2>Vendors</h2>
        <div className="card">
          <h3>Error loading vendors</h3>
          <p>Could not connect to vendors endpoint: {error}</p>
          <button className="btn btn--primary" onClick={refetch}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack section">
      <h2>Vendors {!user && <small style={{ color: 'var(--color-text-muted)', fontWeight: 'normal' }}>(demo data - requires authentication for real data)</small>}</h2>
      <FilterBar>
        {/* Search input - always visible */}
        <input 
          className="input" 
          placeholder="Search vendors..." 
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
        
        {/* KYC dropdown - mobile only */}
        <select 
          className="input hide-lg" 
          value={kycFilter} 
          onChange={e=>setKycFilter(e.target.value)} 
          style={{ minWidth: '120px', maxWidth: '160px' }}
        >
          <option value="all">All KYC</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
        
        {/* Status chips - desktop only */}
        <div className="chips hide-sm" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Chip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</Chip>
          <Chip active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>Active</Chip>
          <Chip active={statusFilter === 'suspended'} onClick={() => setStatusFilter('suspended')}>Suspended</Chip>
        </div>
        
        {/* KYC chips - desktop only */}
        <div className="chips hide-sm" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Chip active={kycFilter === 'all'} onClick={() => setKycFilter('all')}>All KYC</Chip>
          <Chip active={kycFilter === 'verified'} onClick={() => setKycFilter('verified')}>Verified</Chip>
          <Chip active={kycFilter === 'pending'} onClick={() => setKycFilter('pending')}>Pending</Chip>
        </div>
        
        {/* Action buttons */}
        <div className="cluster" style={{ flexShrink: 0 }}>
          <button 
            className="btn" 
            onClick={() => { setStatusFilter('all'); setKycFilter('all'); setQuery(''); }}
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
          Showing {pageRows.length} of {filtered.length} vendors
          {statusFilter !== 'all' && ` (filtered by ${statusFilter})`}
          {kycFilter !== 'all' && ` (KYC: ${kycFilter})`}
          {query && ` (searching for "${query}")`}
        </small>
      </div>

      {filtered.length === 0 && !loading ? (
        <EmptyState 
          title="No vendors found" 
          subtitle={query || statusFilter !== 'all' || kycFilter !== 'all' ? "Try adjusting your search or filters." : "No vendors available."}
          action={
            (query || statusFilter !== 'all' || kycFilter !== 'all') ? (
              <button 
                className="btn btn--emphasis" 
                onClick={() => { setStatusFilter('all'); setKycFilter('all'); setQuery(''); }}
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
                  <button className="btn btn--emphasis">{row.kyc === 'verified' ? 'Feature' : 'Verify KYC'}</button>
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
                  <div><strong>{row.name || row.shopName || 'N/A'}</strong><div className="muted">{row.id || row._id || 'N/A'}</div></div>
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
                  <div><small className="muted">KYC</small><div>
                    <span style={{ 
                      background: (row.kyc || 'verified') === 'verified' ? 'rgba(30,165,9,0.12)' : 'rgba(255,165,0,0.14)', 
                      color: (row.kyc || 'verified') === 'verified' ? 'var(--color-green)' : '#b26b00',
                      borderRadius: '9999px', 
                      padding: '0.15rem 0.5rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 600 
                    }}>{row.kyc || 'verified'}</span>
                  </div></div>
                  <div><small className="muted">Products</small><div>{row.products || 'N/A'}</div></div>
                  <div><small className="muted">Orders (7d)</small><div>{row.orders7d || 'N/A'}</div></div>
                  <div><small className="muted">Rating</small><div>{row.rating || 'N/A'}</div></div>
                  <div><button className="btn" onClick={()=>setSelected(row)} style={{ background: 'var(--color-gray-100)' }}>View</button></div>
                </div>
              )}
            />
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </div>
        </>
      )}

      <SlideOver open={!!selected} title={selected?.name || selected?.shopName || 'Vendor Details'} onClose={()=>setSelected(null)}>
        {selected && (
          <div className="stack">
            <div className="card"><strong>Vendor ID:</strong> {selected.id || selected._id || 'N/A'}</div>
            <div className="card"><strong>Name:</strong> {selected.name || selected.shopName || 'N/A'}</div>
            <div className="card"><strong>KYC Status:</strong> {selected.kyc || 'verified'}</div>
            <div className="card"><strong>Status:</strong> {selected.status || 'active'}</div>
            <div className="card"><strong>Products:</strong> {selected.products || selected.productsCount || 'N/A'}</div>
            <div className="card"><strong>Orders (7d):</strong> {selected.orders7d || selected.recentOrders || 'N/A'}</div>
            <div className="card"><strong>Rating:</strong> {selected.rating || selected.averageRating || 'N/A'}</div>
            <div className="card">
              <strong>Actions:</strong>
              <div className="cluster" style={{ marginTop: 'var(--space-2)' }}>
                <button className="btn btn--emphasis">{(selected.kyc || 'verified') === 'verified' ? 'Feature vendor' : 'Verify KYC'}</button>
                <button className="btn" style={{ background: 'var(--color-gray-100)' }}>{(selected.status || 'active') === 'active' ? 'Suspend' : 'Reactivate'}</button>
                <button className="btn" style={{ background: 'var(--color-gray-100)' }}>View storefront</button>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </section>
  );
}


