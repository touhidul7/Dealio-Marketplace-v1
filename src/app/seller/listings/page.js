'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, timeAgo, LISTING_STATUSES } from '@/lib/constants';

function ListingsList() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [error, setError] = useState('');

  useEffect(() => {
    const verifyAndLoad = async () => {
      setLoading(true);
      setError('');
      
      const timeout = setTimeout(() => {
        if (loading) {
          setError('Database connection is slow. Please refresh.');
          setLoading(false);
        }
      }, 6000);

      try {
        const sessionId = searchParams.get('session_id');
        if (sessionId && searchParams.get('checkout') === 'success') {
          setVerifying(true);
          await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
          setVerifying(false);
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Not authenticated');
        
        const { data, error: fetchError } = await supabase.from('listings').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false });
        if (fetchError) throw fetchError;
        
        setListings(data || []);
        clearTimeout(timeout);
      } catch (err) {
        console.error('Seller listings load failed:', err);
        setError('Could not load your listings. Please refresh.');
      } finally {
        setLoading(false);
        setVerifying(false);
      }
    };
    verifyAndLoad();
  }, [searchParams]);

  const handleDeleteListing = async (id) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    
    try {
      const { error: delErr } = await supabase.from('listings').delete().eq('id', id);
      if (delErr) throw delErr;
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete listing: ' + err.message);
    }
  };

  if (verifying) {
    return (
      <div style={{ padding: 60, textAlign: 'center', background: 'var(--surface)', borderRadius: 20 }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        <h3>Confirming your purchase...</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Just a moment while we update your account.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div><h1 className="page-title">My Listings</h1><p className="page-subtitle">Manage your businesses for sale</p></div>
        <Link href="/seller/listings/new" className="btn btn-primary">➕ Create New Listing</Link>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
        {error && (
          <div style={{ padding: 20, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, marginBottom: 24, textAlign: 'center', color: '#B91C1C' }}>
            {error}
          </div>
        )}
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
                        <button onClick={() => handleDeleteListing(l.id)} className="btn btn-sm btn-ghost" style={{color: 'var(--error)'}}>Delete</button>
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

export default function SellerListingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>}>
      <ListingsList />
    </Suspense>
  );
}
