'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, timeAgo, LISTING_STATUSES } from '@/lib/constants';

export default function AdminListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('listings').select('*, users!owner_user_id(email)').order('created_at', { ascending: false });
      setListings(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/listings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">All Listings</h1>
        <p className="page-subtitle">Manage all listings across the marketplace</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
        {loading ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }}></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">No listings found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Listing</th><th>Owner</th><th>Status</th><th>Price</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {listings.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.title}</strong><br/><span style={{fontSize:12,color:'var(--text-tertiary)'}}>{l.industry}</span></td>
                    <td style={{fontSize:13}}>{l.users?.email}</td>
                    <td><span className={`badge badge-${LISTING_STATUSES[l.status]?.color || 'gray'}`}>{LISTING_STATUSES[l.status]?.label || l.status}</span></td>
                    <td>{formatCurrency(l.asking_price)}</td>
                    <td style={{fontSize:13,color:'var(--text-tertiary)'}}>{timeAgo(l.created_at)}</td>
                    <td>
                      <div style={{display:'flex',gap:8}}>
                        <select className="form-select" style={{padding:'4px 8px',fontSize:12,height:'auto'}} value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)}>
                          {Object.entries(LISTING_STATUSES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <Link href={`/listings/${l.id}`} target="_blank" className="btn btn-sm btn-ghost">View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
