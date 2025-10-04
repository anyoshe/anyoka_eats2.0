import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import DebugInfo from './components/DebugInfo';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Vendors from './pages/Vendors';
import Drivers from './pages/Drivers';
import System from './pages/System';
import AdminHeader from './components/AdminHeader';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DebugInfo />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div>
              <AdminHeader />
              <main className="container stack" style={{ padding: 'var(--space-6) 0' }}>
                <Dashboard />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <div>
              <AdminHeader />
              <main className="container stack" style={{ padding: 'var(--space-6) 0' }}>
                <Orders />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <div>
              <AdminHeader />
              <main className="container stack" style={{ padding: 'var(--space-6) 0' }}>
                <Users />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/vendors" element={
          <ProtectedRoute>
            <div>
              <AdminHeader />
              <main className="container stack" style={{ padding: 'var(--space-6) 0' }}>
                <Vendors />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/drivers" element={
          <ProtectedRoute>
            <div>
              <AdminHeader />
              <main className="container stack" style={{ padding: 'var(--space-6) 0' }}>
                <Drivers />
              </main>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/system" element={
          <ProtectedRoute>
            <div>
              <AdminHeader />
              <main className="container stack" style={{ padding: 'var(--space-6) 0' }}>
                <System />
              </main>
            </div>
          </ProtectedRoute>
        } />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;


