import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import SlideOver from '../components/SlideOver';
import Chip from '../components/Chip';
import Pagination from '../components/Pagination';
import ResponsiveList from '../components/ResponsiveList';
import EmptyState from '../components/EmptyState';
import { vendors as mockVendors } from '../mocks/data';

export default function Vendors(){
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = mockVendors.filter(v => {
    const matchesQuery = v.name.toLowerCase().includes(query.toLowerCase()) || v.id.includes(query);
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesKyc = kycFilter === 'all' || v.kyc === kycFilter;
    return matchesQuery && matchesStatus && matchesKyc;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice((page-1)*pageSize, page*pageSize);

  const columns = [
    { key: 'id', label: 'Vendor ID' },
    { key: 'name', label: 'Name' },
    { key: 'kyc', label: 'KYC', render: (v) => (
      <span style={{ 
        background: v === 'verified' ? 'rgba(30,165,9,0.12)' : 'rgba(255,165,0,0.14)', 
        color: v === 'verified' ? 'var(--color-green)' : '#b26b00',
        borderRadius: '9999px', 
        padding: '0.15rem 0.5rem', 
        fontSize: '0.85rem', 
        fontWeight: 600 
      }}>{v}</span>
    )},
    { key: 'products', label: 'Products' },
    { key: 'orders7d', label: 'Orders (7d)' },
    { key: 'rating', label: 'Rating' },
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
      <h2>Vendors</h2>
      <FilterBar>
        <input className="input" placeholder="Search vendors" value={query} onChange={e=>setQuery(e.target.value)} style={{ maxWidth: 320 }} />
        <div className="chips">
          <Chip active={statusFilter==='all'} onClick={()=>setStatusFilter('all')}>All</Chip>
          <Chip active={statusFilter==='active'} onClick={()=>setStatusFilter('active')}>Active</Chip>
          <Chip active={statusFilter==='suspended'} onClick={()=>setStatusFilter('suspended')}>Suspended</Chip>
        </div>
        <div className="chips">
          <Chip active={kycFilter==='all'} onClick={()=>setKycFilter('all')}>All KYC</Chip>
          <Chip active={kycFilter==='verified'} onClick={()=>setKycFilter('verified')}>Verified</Chip>
          <Chip active={kycFilter==='pending'} onClick={()=>setKycFilter('pending')}>Pending</Chip>
        </div>
        <button className="btn btn--primary">Export CSV</button>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState 
          title="No vendors found" 
          subtitle="Try adjusting your search or filters."
          action={<button className="btn btn--emphasis" onClick={()=>{setQuery('');setStatusFilter('all');setKycFilter('all');}}>Clear filters</button>}
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
                  <div><small className="muted">KYC</small><div>
                    <span style={{ 
                      background: row.kyc === 'verified' ? 'rgba(30,165,9,0.12)' : 'rgba(255,165,0,0.14)', 
                      color: row.kyc === 'verified' ? 'var(--color-green)' : '#b26b00',
                      borderRadius: '9999px', 
                      padding: '0.15rem 0.5rem', 
                      fontSize: '0.85rem', 
                      fontWeight: 600 
                    }}>{row.kyc}</span>
                  </div></div>
                  <div><small className="muted">Products</small><div>{row.products}</div></div>
                  <div><small className="muted">Orders (7d)</small><div>{row.orders7d}</div></div>
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
            <div className="card"><strong>Vendor ID:</strong> {selected.id}</div>
            <div className="card"><strong>KYC Status:</strong> {selected.kyc}</div>
            <div className="card"><strong>Status:</strong> {selected.status}</div>
            <div className="card"><strong>Products:</strong> {selected.products}</div>
            <div className="card"><strong>Orders (7d):</strong> {selected.orders7d}</div>
            <div className="card"><strong>Rating:</strong> {selected.rating}</div>
            <div className="card">
              <strong>Actions:</strong>
              <div className="cluster" style={{ marginTop: 'var(--space-2)' }}>
                <button className="btn btn--emphasis">{selected.kyc === 'verified' ? 'Feature vendor' : 'Verify KYC'}</button>
                <button className="btn" style={{ background: 'var(--color-gray-100)' }}>{selected.status === 'active' ? 'Suspend' : 'Reactivate'}</button>
                <button className="btn" style={{ background: 'var(--color-gray-100)' }}>View storefront</button>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </section>
  );
}


