import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ADMIN_CREDENTIALS } from '../config/adminCredentials';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: ADMIN_CREDENTIALS.email, password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Login attempt with:', { 
      username: credentials.username, 
      password: credentials.password 
    });

    try {
      const result = await login(credentials.username, credentials.password);
      console.log('Login successful:', result);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 'var(--space-4)'
    }}>
      <div style={{
        background: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: 'var(--color-text)', 
            margin: 0 
          }}>
            Anyoka Eats Admin
          </h1>
          <p style={{ 
            color: 'var(--color-text-muted)', 
            margin: 'var(--space-2) 0 0 0' 
          }}>
            Sign in to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-2)'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="input"
              placeholder="Enter admin email address"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-2)'
            }}>
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="input"
              placeholder="Enter admin password"
              required
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn--primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: '#f9fafb',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <strong>Official Admin Credentials:</strong><br />
          Email: <code>{ADMIN_CREDENTIALS.email}</code><br />
          Password: <code>{ADMIN_CREDENTIALS.password}</code>
        </div>

        <div style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: '#fef3c7',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
          color: '#92400e',
          border: '1px solid #f59e0b'
        }}>
          <strong>Quick Test:</strong><br />
          Current form values: {JSON.stringify(credentials)}<br />
          <button
            type="button"
            onClick={() => {
              setCredentials({
                username: ADMIN_CREDENTIALS.email,
                password: ADMIN_CREDENTIALS.password
              });
            }}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              marginTop: '4px'
            }}
          >
            Fill Form Now
          </button>
        </div>

        <div style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: '#f3f4f6',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setCredentials({
                  username: ADMIN_CREDENTIALS.email,
                  password: ADMIN_CREDENTIALS.password
                });
              }}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Auto-Fill Credentials
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Current form values:', credentials);
                console.log('Expected credentials:', ADMIN_CREDENTIALS);
                console.log('Email match:', credentials.username === ADMIN_CREDENTIALS.email);
                console.log('Password match:', credentials.password === ADMIN_CREDENTIALS.password);
              }}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Debug Login (Check Console)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
