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
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { orders as mockOrders } from '../mocks/data';

export default function Orders(){
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { user } = useAuth();

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [status, searchQuery]);

  // Use real API call for admin
  const { data: ordersData, loading, error, refetch } = useApi(() => apiService.request('/api/admin/orders'));
  // Fetch users once to map user IDs -> readable names/usernames
  const { data: usersData } = useApi(() => apiService.getUsers(), []);

  const usersArray = usersData?.users || usersData || [];
  const usersById = Array.isArray(usersArray)
    ? usersArray.reduce((acc, u) => {
        const id = u._id || u.id;
        if (id) acc[id] = u;
        return acc;
      }, {})
    : {};

  // Normalize various backend shapes into flat rows for the table
  const normalizeOrders = (data) => {
    if (!data) return [];
    const source = Array.isArray(data)
      ? data
      : Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
            ? data.items
            : [];

    return source.map((o) => {
      const id = o.id || o._id || o.orderId || o.reference || o.code || '';
      const createdIso = o.createdAt || o.created_on || o.date || o.created || o.timestamp;
      const created = createdIso ? new Date(createdIso).toLocaleString() : '';
      // Customer: backend OrderSchema stores ref in `user` (not populated on /admin/orders)
      // Try populated shapes first, then fall back to identifier
      let customer = '';
      if (o.customer) {
        customer = o.customer.name || o.customer.fullName || o.customer.username || o.customer.names || '';
      } else if (o.user) {
        if (typeof o.user === 'object') {
          customer = o.user.names || o.user.name || o.user.fullName || o.user.username || o.user.email || '';
        } else {
          const uid = String(o.user);
          const u = usersById[uid];
          customer = (u && (u.names || u.username || u.email)) || uid; // map id -> readable
        }
      }
      if (!customer) customer = o.customerName || o.customer_email || o.customerPhone || '';

      // Vendor: admin endpoint doesn't populate partner; derive from items' embedded shopName
      let vendor = '';
      if (Array.isArray(o.items) && o.items.length) {
        const names = Array.from(new Set(
          o.items
            .map((i) => i?.shop?.shopName)
            .filter(Boolean)
        ));
        vendor = names.slice(0, 2).join(', ') + (names.length > 2 ? ` +${names.length - 2}` : '');
      }
      // Fallback: if subOrders are populated with shop docs containing businessName
      if (!vendor && Array.isArray(o.subOrders) && o.subOrders.length) {
        const names = Array.from(new Set(
          o.subOrders
            .map((so) => so?.shop?.businessName || so?.shop?.shopName)
            .filter(Boolean)
        ));
        vendor = names.slice(0, 2).join(', ') + (names.length > 2 ? ` +${names.length - 2}` : '');
      }
      if (!vendor) vendor = o.vendorName || '';
      const driver = (o.driver && (o.driver.name || o.driver.fullName))
        || (o.rider && (o.rider.name || o.rider.fullName))
        || (o.courier && (o.courier.name || o.courier.fullName))
        || o.driverName || 'Unassigned';
      const itemsCount = Array.isArray(o.items) ? o.items.length : (o.itemsCount || o.totalItems || (typeof o.items === 'number' ? o.items : 0));
      const rawAmount = o.total || o.amount || o.totalAmount || o.price || 0;
      const currency = o.currency || 'Ksh';
      const amount = typeof rawAmount === 'number' ? `${currency} ${rawAmount.toFixed(2)}` : String(rawAmount);
      const status = String((o.status || o.orderStatus || o.state || 'pending')).toLowerCase();
      return {
        id,
        created,
        customer,
        vendor,
        driver,
        items: itemsCount,
        amount,
        status,
        _raw: o,
      };
    });
  };

  // Use normalized real data when available, else fallback to mock data
  const allOrders = (ordersData ? normalizeOrders(ordersData) : mockOrders);
  
  // Apply filters
  const filteredOrders = allOrders.filter(order => {
    // Status filter
    const statusMatch = status === 'all' || order.status === status;
    
    // Search filter (search in order ID, customer, vendor, driver)
    const searchMatch = searchQuery === '' || 
      (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customer && order.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.vendor && order.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.driver && order.driver.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return statusMatch && searchMatch;
  });
  
  // Pagination
  const paginatedOrders = filteredOrders.slice((page-1)*pageSize, page*pageSize);
  const total = filteredOrders.length;

  // Order columns
  const columns = [
    { key: 'id', label: 'Order ID' },
    { key: 'created', label: 'Created' },
    { key: 'customer', label: 'Customer' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'driver', label: 'Driver' },
    { key: 'items', label: 'Items' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  ];
  const pageCount = Math.ceil(total / pageSize);

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

  // Show error if we can't load data
  if (error) {
    return (
      <section className="stack section">
        <h2>Orders</h2>
        <div className="card">
          <h3>Error loading orders</h3>
          <p>Could not connect to orders endpoint: {error}</p>
          <button className="btn btn--primary" onClick={refetch}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack section">
      <h2>Orders {!user && <small style={{ color: 'var(--color-text-muted)', fontWeight: 'normal' }}>(demo data - requires authentication for real data)</small>}</h2>
      <FilterBar>
        {/* Search input - always visible */}
        <input 
          className="input" 
          placeholder="Search orders..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: '1', minWidth: '200px', maxWidth: '400px' }} 
        />
        
        {/* Status dropdown - mobile only */}
        <select 
          className="input hide-lg" 
          value={status} 
          onChange={e=>setStatus(e.target.value)} 
          style={{ minWidth: '140px', maxWidth: '180px' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        
        {/* Status chips - desktop only */}
        <div className="chips hide-sm" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Chip active={status === 'all'} onClick={() => setStatus('all')}>All</Chip>
          <Chip active={status === 'pending'} onClick={() => setStatus('pending')}>Pending</Chip>
          <Chip active={status === 'accepted'} onClick={() => setStatus('accepted')}>Accepted</Chip>
          <Chip active={status === 'transit'} onClick={() => setStatus('transit')}>Transit</Chip>
          <Chip active={status === 'delivered'} onClick={() => setStatus('delivered')}>Delivered</Chip>
          <Chip active={status === 'cancelled'} onClick={() => setStatus('cancelled')}>Cancelled</Chip>
          <Chip active={status === 'refunded'} onClick={() => setStatus('refunded')}>Refunded</Chip>
        </div>
        
        {/* Action buttons */}
        <div className="cluster" style={{ flexShrink: 0 }}>
          <button 
            className="btn" 
            onClick={() => { setStatus('all'); setSearchQuery(''); }}
            style={{ background: 'var(--color-gray-100)' }}
          >
            Clear
          </button>
          <button className="btn btn--primary">Export</button>
        </div>
      </FilterBar>

      {/* Results count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <small className="muted">
          Showing {paginatedOrders.length} of {total} orders
          {status !== 'all' && ` (filtered by ${status})`}
          {searchQuery && ` (searching for "${searchQuery}")`}
        </small>
      </div>

      {paginatedOrders.length === 0 && !loading ? (
        <EmptyState 
          title="No orders found" 
          subtitle={searchQuery || status !== 'all' ? "Try adjusting your search or filters." : "No orders available."}
          action={
            (searchQuery || status !== 'all') ? (
              <button 
                className="btn btn--emphasis" 
                onClick={() => { setStatus('all'); setSearchQuery(''); }}
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
        rows={paginatedOrders}
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
              items={paginatedOrders}
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
        </>
      )}

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


