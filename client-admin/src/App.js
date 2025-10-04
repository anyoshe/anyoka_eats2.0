import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Vendors from './pages/Vendors';
import Drivers from './pages/Drivers';
import System from './pages/System';
import AdminHeader from './components/AdminHeader';

function App() {
  return (
    <div>
      <AdminHeader />

      <main className="container stack" style={{ padding: 'var(--space-6) 0' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/system" element={<System />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


