import React from 'react';
import KpiCard from '../components/KpiCard';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { users as mockUsers, drivers as mockDrivers } from '../mocks/data';

export default function Dashboard(){
  const { user } = useAuth();
  
  // Use real API calls for all data when authenticated
  const { data: products, loading: productsLoading, error: productsError } = useApi(() => apiService.getAllProducts());
  const { data: partners, loading: partnersLoading, error: partnersError } = useApi(() => apiService.getPartners());
  const { data: users, loading: usersLoading, error: usersError } = useApi(() => apiService.getUsers());
  const { data: drivers, loading: driversLoading, error: driversError } = useApi(() => apiService.getDrivers());
  
  const loading = productsLoading || partnersLoading || usersLoading || driversLoading;
  const statsError = productsError || partnersError || usersError || driversError;
  
  // Process real data
  const productsArray = products?.products || products || [];
  const partnersArray = partners?.partners || partners?.data || partners || [];
  const usersArray = users?.users || users || [];
  const driversArray = drivers?.drivers || drivers || [];
  
  // Calculate stats from real data
  const stats = {
    totalUsers: usersArray.length,
    totalPartners: partnersArray.length,
    totalProducts: productsArray.length,
    totalDrivers: driversArray.length,
    activeDrivers: driversArray.filter(d => d.status === 'Available' || d.online === true).length,
    systemStatus: 'Connected'
  };

  if (loading) {
    return (
      <section className="stack section">
        <div className="grid-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ minHeight: '120px', background: 'var(--color-gray-50)' }}>
              <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>Loading...</div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (statsError) {
    return (
      <section className="stack section">
        <div className="card">
          <h2>Error loading dashboard</h2>
          <p>Could not connect to admin endpoint: {statsError}</p>
          <p><small>This might be due to authentication. Admin endpoints require proper tokens.</small></p>
        </div>
      </section>
    );
  }
  
  const kpis = stats;

  // Helpers to compute top/bottom items safely
  const getNumeric = (obj, keys, defaultValue = 0) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (typeof value === 'number' && isFinite(value)) return value;
    }
    return defaultValue;
  };

  const getName = (obj, keys, fallback = 'Unknown') => {
    for (const key of keys) {
      const value = obj?.[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
    return fallback;
  };

  // Ranking logic
  const rankByRating = (items, ratingKeys) => {
    return [...items]
      .map((it) => ({ it, r: getNumeric(it, ratingKeys, 0) }))
      .sort((a, b) => b.r - a.r)
      .map(({ it }) => it);
  };


  // Prepare rankings for products, vendors, drivers
  const productsByRating = rankByRating(productsArray.map(p => ({
    ...p,
    // normalize rating to a top-level numeric if nested
    rating: (p.ratings && p.ratings.average) ?? p.averageRating ?? p.ratingsAverage ?? p.rating,
  })), ['rating']);
  const partnersByRating = rankByRating(partnersArray.map(v => ({
    ...v,
    rating: (v.ratings && v.ratings.average) ?? v.averageRating ?? v.ratingsAverage ?? v.rating,
  })), ['rating']);
  const driversByRating = rankByRating(driversArray.map(d => ({
    ...d,
    rating: d.averageRating ?? d.ratingsAverage ?? d.rating ?? 0,
  })), ['rating']);

  const top5 = (arr) => arr.slice(0, 5);
  const bottom5 = (arr) => arr.slice(-5).reverse();

  return (
    <section className="stack section">
      {/* Categorized KPI sections */}
      <h2 className="section-title">Overview</h2>
      {/* Compact KPI row horizontally */}
      <div className="kpi-row">
        <KpiCard label="Total Users" value={kpis.totalUsers} hint="all users" tone="success" />
        <KpiCard label="Customers" value={kpis.totalUsers} hint="registered" />
        <KpiCard label="Drivers" value={kpis.totalDrivers} hint="registered" />
        <KpiCard label="Vendors" value={kpis.totalPartners} hint="registered" />
        <KpiCard label="Total Products" value={kpis.totalProducts} hint="in catalog" />
        <KpiCard label="System Status" value={kpis.systemStatus} hint="backend" />
      </div>


      {/* Financial Overview (placeholders for now) */}
      <h2 className="section-title">Financial</h2>
      <div className="grid-auto">
        <KpiCard label="Total Sales" value={"Ksh 0"} hint="lifetime" tone="success" />
        <KpiCard label="Today's Sales" value={"Ksh 0"} hint="last 24 hrs" />
        <KpiCard label="Orders Today" value={0} hint="count" />
        <KpiCard label="Avg Order Value" value={"Ksh 0"} hint="AOV" />
        <KpiCard label="Refunds Today" value={0} hint="count" tone="warning" />
      </div>

      {/* Rankings: Top 5 and Bottom 5 */}
      <h2 className="section-title">Top & Bottom Performance</h2>
      <div className="grid-3">
        <div className="card">
          <h3 className="subsection-title">Products</h3>
          <div className="grid-2-1">
            <div>
              <h4 className="card-title">Top 5</h4>
              {productsArray.length ? (
                <ul className="performance-list">
                  {top5(productsByRating).map((p, idx) => (
                    <li key={p._id || `p-top-${idx}`} className="performance-item">
                      <span className="rank-badge">{idx + 1}</span>
                      <div>
                        <div className="item-title">{getName(p, ['name'])}</div>
                        <div className="item-meta">{p.shop?.shopName || 'Unknown Shop'}</div>
                      </div>
                      <span className="rating-badge rating-badge--good">⭐ {getNumeric(p, ['rating'], 0)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>No data</p>}
            </div>
            <div>
              <h4 className="card-title">Bottom 5</h4>
              {productsArray.length ? (
                <ul className="performance-list">
                  {bottom5(productsByRating).map((p, idx) => (
                    <li key={p._id || `p-bot-${idx}`} className="performance-item">
                      <span className="rank-badge">{idx + 1}</span>
                      <div>
                        <div className="item-title">{getName(p, ['name'])}</div>
                        <div className="item-meta">{p.shop?.shopName || 'Unknown Shop'}</div>
                      </div>
                      <span className="rating-badge rating-badge--bad">⭐ {getNumeric(p, ['rating'], 0)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>No data</p>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="subsection-title">Vendors</h3>
          <div className="grid-2-1">
            <div>
              <h4 className="card-title">Top 5</h4>
              {partnersArray.length ? (
                <ul className="performance-list">
                  {top5(partnersByRating).map((v, idx) => (
                    <li key={v._id || `v-top-${idx}`} className="performance-item">
                      <span className="rank-badge">{idx + 1}</span>
                      <div className="item-title">{getName(v, ['businessName','shopName','name'])}</div>
                      <span className="rating-badge rating-badge--good">⭐ {getNumeric(v, ['rating'], 0)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>No data</p>}
            </div>
            <div>
              <h4 className="card-title">Bottom 5</h4>
              {partnersArray.length ? (
                <ul className="performance-list">
                  {bottom5(partnersByRating).map((v, idx) => (
                    <li key={v._id || `v-bot-${idx}`} className="performance-item">
                      <span className="rank-badge">{idx + 1}</span>
                      <div className="item-title">{getName(v, ['businessName','shopName','name'])}</div>
                      <span className="rating-badge rating-badge--bad">⭐ {getNumeric(v, ['rating'], 0)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>No data</p>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="subsection-title">Drivers</h3>
          <div className="grid-2-1">
            <div>
              <h4 className="card-title">Top 5</h4>
              {driversArray.length ? (
                <ul className="performance-list">
                  {top5(driversByRating).map((d, idx) => (
                    <li key={d._id || `d-top-${idx}`} className="performance-item">
                      <span className="rank-badge">{idx + 1}</span>
                      <div className="item-title">{getName(d, ['username','name','fullName','driverName'])}</div>
                      <span className="rating-badge rating-badge--good">⭐ {getNumeric(d, ['rating'], 0)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>No data</p>}
            </div>
            <div>
              <h4 className="card-title">Bottom 5</h4>
              {driversArray.length ? (
                <ul className="performance-list">
                  {bottom5(driversByRating).map((d, idx) => (
                    <li key={d._id || `d-bot-${idx}`} className="performance-item">
                      <span className="rank-badge">{idx + 1}</span>
                      <div className="item-title">{getName(d, ['username','name','fullName','driverName'])}</div>
                      <span className="rating-badge rating-badge--bad">⭐ {getNumeric(d, ['rating'], 0)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>No data</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent and system sections */}
      <div className="grid-3">
        <div className="card">
          <h2>Recent Products</h2>
          {productsArray && productsArray.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              {productsArray.slice(0, 5).map((product, idx) => (
                <li key={product._id || idx}>
                  {product.name} - {product.shop?.shopName || 'Unknown Shop'} - Ksh {product.price || 'N/A'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No products found</p>
          )}
        </div>
        <div className="card">
          <h2>System Products</h2>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            <li>🛍️ Marketplace products</li>
            <li>🏪 Vendor management</li>
            <li>🚚 Driver delivery network</li>
            <li>👤 Customer accounts</li>
            <li>💳 Orders and payments</li>
          </ul>
        </div>
        <div className="card">
          <h2>System Status</h2>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            <li>✅ Backend connected</li>
            <li>✅ Database accessible</li>
            <li>✅ Admin panel operational</li>
          </ul>
        </div>
      </div>
    </section>
  );
}


