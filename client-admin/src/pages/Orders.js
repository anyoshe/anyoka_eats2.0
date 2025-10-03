import React, { useState } from 'react';
import FilterBar from '../components/FilterBar';
import Chip from '../components/Chip';
import Pagination from '../components/Pagination';
import ResponsiveList from '../components/ResponsiveList';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import SlideOver from '../components/SlideOver';
import EmptyState from '../components/EmptyState';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';

export default function Orders(){
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Since orders require authentication, let's show products as a demo
  // You can change this back to orders once authentication is implemented
  const { data: productsData, loading, error, refetch } = useApi(() => 
    apiService.getAllProducts(), 
    [status, page]
  );

  const allProducts = productsData?.products || productsData || [];
  const filtered = allProducts.slice((page-1)*pageSize, page*pageSize);
  const total = allProducts.length;

  // Temporarily showing products instead of orders (demo purposes)
  const columns = [
    { key: 'productId', label: 'Product ID' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'shop', label: 'Shop', render: (v, row) => row.shop?.shopName || 'N/A' },
    { key: 'price', label: 'Price', render: (v) => `Ksh ${v || 'N/A'}` },
    { key: 'quantity', label: 'Quantity' },
    { key: 'inventory', label: 'Stock', render: (v) => v || 'N/A' },
  ];
  const pageCount = Math.ceil(total / pageSize);
  const pageRows = filtered;

  if (loading) {
    return (
      <section className="stack section">
        <h2>Orders</h2>
        <div className="card">
          <p>Loading orders...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="stack section">
        <h2>Products (Demo - Orders require auth)</h2>
        <div className="card">
          <h3>Error loading products</h3>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={refetch}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack section">
      <h2>Products (Demo - Orders require auth)</h2>
      <FilterBar>
        <select className="input" value={status} onChange={e=>setStatus(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="transit">In transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <input className="input" placeholder="Search order ID or customer" style={{ maxWidth: 320 }} />
        <div className="chips hide-sm">
          <Chip>Today</Chip>
          <Chip>Last 7d</Chip>
          <Chip>High value</Chip>
        </div>
        <button className="btn btn--primary">Export CSV</button>
      </FilterBar>

      <div className="hide-sm">
      <DataTable
        columns={columns}
        rows={pageRows}
        renderActions={row => (
          <div className="cluster">
            <button className="btn" onClick={()=>setSelected(row)} style={{ background: 'var(--color-gray-100)' }}>View</button>
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
              <div><strong>{row.id}</strong><div className="muted">{row.created}</div></div>
              <div style={{ justifySelf: 'end' }}><StatusBadge status={row.status} /></div>
              <div><small className="muted">Customer</small><div>{row.customer}</div></div>
              <div><small className="muted">Vendor</small><div>{row.vendor}</div></div>
              <div><small className="muted">Driver</small><div>{row.driver}</div></div>
              <div><small className="muted">Amount</small><div>{row.amount}</div></div>
              <div><button className="btn" onClick={()=>setSelected(row)} style={{ background: 'var(--color-gray-100)' }}>View</button></div>
            </div>
          )}
        />
        <Pagination page={page} pageCount={pageCount} onPage={setPage} />
      </div>

      <SlideOver open={!!selected} title={selected?.id} onClose={()=>setSelected(null)}>
        {selected && (
          <div className="stack">
            <div className="card"><strong>Status:</strong> <StatusBadge status={selected.status} /></div>
            <div className="card"><strong>Customer:</strong> {selected.customer}</div>
            <div className="card"><strong>Vendor:</strong> {selected.vendor}</div>
            <div className="card"><strong>Driver:</strong> {selected.driver}</div>
            <div className="card"><strong>Amount:</strong> {selected.amount}</div>
          </div>
        )}
      </SlideOver>
    </section>
  );
}


