'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency, timeAgo, LISTING_STATUSES } from '@/lib/constants';

function ListingsList() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();

  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const verifyAndLoad = async () => {
      setLoading(true);
      setError('');
      try {
        const sessionId = searchParams.get('session_id');
        if (sessionId && searchParams.get('checkout') === 'success') {
          setVerifying(true);
          await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
          setVerifying(false);
        }
        const { data, error: fetchError } = await supabase.from('listings').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false });
        if (fetchError) throw fetchError;
        setListings(data || []);
      } catch (err) {
        console.error('Seller listings load failed:', err);
        setError('Could not load your listings. Please refresh.');
      } finally {
        setLoading(false);
        setVerifying(false);
      }
    };
    verifyAndLoad();
  }, [user, searchParams]);

  const [isDeleting, setIsDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const handleDeleteListing = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirmId !== id) {
      setConfirmId(id);
      // Auto-reset after 10 seconds
      setTimeout(() => setConfirmId(null), 10000);
      return;
    }
    
    setIsDeleting(id);
    try {
      console.log('Attempting to delete listing:', id);
      const { error: delErr } = await supabase.from('listings').delete().eq('id', id);
      
      if (delErr) {
        console.error('Supabase Delete Error:', delErr);
        throw delErr;
      }
      
      setListings(prev => prev.filter(l => l.id !== id));
      setConfirmId(null);
    } catch (err) {
      console.error('Delete operation failed:', err);
      alert('Delete failed. Error: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(null);
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
                        <button 
                          onClick={(e) => handleDeleteListing(e, l.id)} 
                          className="btn btn-sm" 
                          style={{
                            minWidth: 100,
                            color: confirmId === l.id ? '#ffffff' : 'var(--error)',
                            background: confirmId === l.id ? '#dc2626' : 'transparent',
                            border: confirmId === l.id ? '1px solid #dc2626' : '1px solid transparent',
                            fontWeight: confirmId === l.id ? '600' : '400',
                            transition: 'all 0.2s ease'
                          }}
                          disabled={isDeleting === l.id}
                        >
                          {isDeleting === l.id ? 'Deleting...' : (confirmId === l.id ? 'Click to Confirm' : 'Delete')}
                        </button>
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
