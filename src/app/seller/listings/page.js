'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, timeAgo, LISTING_STATUSES } from '@/lib/constants';

export default function SellerListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('listings').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false });
      setListings(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div><h1 className="page-title">My Listings</h1><p className="page-subtitle">Manage your businesses for sale</p></div>
        <Link href="/seller/listings/new" className="btn btn-primary">➕ Create New Listing</Link>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
        {loading ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }}></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3 className="empty-state-title">No listings yet</h3>
            <p className="empty-state-text">Create your first business listing to start receiving buyer inquiries.</p>
            <Link href="/seller/listings/new" className="btn btn-primary">Create Your First Listing</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Title</th><th>Status</th><th>Package</th><th>Price</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {listings.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.title}</strong><br/><span style={{fontSize:12,color:'var(--text-tertiary)'}}>{l.industry}</span></td>
                    <td><span className={`badge badge-${LISTING_STATUSES[l.status]?.color || 'gray'}`}>{LISTING_STATUSES[l.status]?.label || l.status}</span></td>
                    <td style={{textTransform:'capitalize'}}>{l.package_type}</td>
                    <td>{formatCurrency(l.asking_price)}</td>
                    <td style={{fontSize:13,color:'var(--text-tertiary)'}}>{timeAgo(l.created_at)}</td>
                    <td>
                      <div style={{display:'flex',gap:8}}>
                        <Link href={`/seller/listings/${l.id}/edit`} className="btn btn-sm btn-secondary">Edit</Link>
                        <Link href={`/listings/${l.id}`} className="btn btn-sm btn-ghost">View</Link>
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
