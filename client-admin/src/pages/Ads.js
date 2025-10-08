import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import apiService from '../services/api';

export default function Ads(){
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(() => apiService.request('/api/admin/ads', { headers: { ...(apiService.hasToken() ? { 'Authorization': `Bearer ${apiService.adminToken}` } : {}) } }));
  const [items, setItems] = useState([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (data?.items) setItems(data.items);
  }, [data]);

  const handleAdd = (type='text') => setItems(prev => [...prev, { type, content: '', mediaUrl: '', link: '', active: true, placement: 'top_marquee' }]);
  const handleChange = (i, field, val) => setItems(prev => prev.map((m, idx) => idx===i ? { ...m, [field]: val } : m));
  const handleRemove = (i) => setItems(prev => prev.filter((_, idx) => idx!==i));

  const handleSave = async () => {
    setPending(true);
    try {
      await apiService.request('/api/admin/ads', {
        method: 'PUT',
        headers: { ...(apiService.hasToken() ? { 'Authorization': `Bearer ${apiService.adminToken}` } : {}), 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      await refetch();
    } finally {
      setPending(false);
    }
  };

  if (loading) return (
    <section className="stack section"><h2>Ads</h2><div className="card">Loading ads...</div></section>
  );
  if (error) return (
    <section className="stack section"><h2>Ads</h2><div className="card">Failed to load ads. <button className="btn btn--primary" onClick={refetch}>Retry</button></div></section>
  );

  return (
    <section className="stack section">
      <h2>Ads {!user && <small style={{ color: 'var(--color-text-muted)', fontWeight: 'normal' }}>(requires authentication)</small>}</h2>
      <div className="card" style={{ display: 'grid', gap: 'var(--space-3)' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <div className="cluster">
              <select className="input" value={item.type} onChange={e=>handleChange(i, 'type', e.target.value)} style={{ minWidth: 120 }}>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <select className="input" value={item.placement || 'hero_top_marquee'} onChange={e=>handleChange(i, 'placement', e.target.value)} style={{ minWidth: 160 }}>
                <option value="hero_top_marquee">Hero top marquee</option>
                <option value="hero_left">Hero left</option>
                <option value="hero_right">Hero right</option>
              </select>
              <label className="cluster" style={{ gap: 'var(--space-1)' }}>
                <input type="checkbox" checked={item.active !== false} onChange={e=>handleChange(i, 'active', e.target.checked)} /> Active
              </label>
              <button className="btn" style={{ background: 'var(--color-gray-100)', marginLeft: 'auto' }} onClick={()=>handleRemove(i)}>Remove</button>
            </div>
            {item.type === 'text' ? (
              <input className="input" value={item.content || ''} onChange={e=>handleChange(i, 'content', e.target.value)} placeholder={`Text content`} />
            ) : (
              <>
                <input className="input" value={item.mediaUrl || ''} onChange={e=>handleChange(i, 'mediaUrl', e.target.value)} placeholder={`${item.type==='image'?'Image':'Video'} URL`} />
                <input className="input" value={item.content || ''} onChange={e=>handleChange(i, 'content', e.target.value)} placeholder={`Caption (optional)`} />
              </>
            )}
            <input className="input" value={item.link || ''} onChange={e=>handleChange(i, 'link', e.target.value)} placeholder="Link (optional)" />
            <div className="cluster">
              <input className="input" type="datetime-local" value={item.startsAt ? new Date(item.startsAt).toISOString().slice(0,16) : ''} onChange={e=>handleChange(i, 'startsAt', e.target.value)} placeholder="Start time" />
              <input className="input" type="datetime-local" value={item.endsAt ? new Date(item.endsAt).toISOString().slice(0,16) : ''} onChange={e=>handleChange(i, 'endsAt', e.target.value)} placeholder="End time" />
            </div>
          </div>
        ))}
        <div className="cluster" style={{ justifyContent: 'flex-start' }}>
          <button className="btn" style={{ background: 'var(--color-gray-100)' }} onClick={()=>handleAdd('text')}>Add text</button>
          <button className="btn" style={{ background: 'var(--color-gray-100)' }} onClick={()=>handleAdd('image')}>Add image</button>
          <button className="btn" style={{ background: 'var(--color-gray-100)' }} onClick={()=>handleAdd('video')}>Add video</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={pending}>{pending ? 'Saving...' : 'Save changes'}</button>
        </div>
      </div>
    </section>
  );
}


