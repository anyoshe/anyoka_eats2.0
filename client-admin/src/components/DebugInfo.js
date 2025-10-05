import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function DebugInfo() {
  const { user, loading } = useAuth();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Debug Info:</strong></div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>User: {user ? user.name : 'None'}</div>
      <div>Auth Token: {user ? 'Present' : 'None'}</div>
      <div>LocalStorage: {localStorage.getItem('admin_user') ? 'Present' : 'Empty'}</div>
    </div>
  );
}
