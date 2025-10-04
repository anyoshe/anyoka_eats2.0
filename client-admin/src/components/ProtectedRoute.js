import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-gray-50)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-6)',
          background: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--color-gray-200)',
            borderTop: '4px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto var(--space-4)'
          }}></div>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
