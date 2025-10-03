import React, { useState } from 'react';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiService.login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>Admin Sign In</h2>
        <form className="stack" onSubmit={onSubmit}>
          <input className="input" placeholder="Identifier (username/phone/business/contact)" value={identifier} onChange={e=>setIdentifier(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <div className="muted" style={{ color: 'crimson' }}>{error}</div>}
          <button className="btn btn--primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </section>
  );
}


