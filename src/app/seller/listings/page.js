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

  useEffect(() => {
    const verifyAndLoad = async () => {
      const sessionId = searchParams.get('session_id');
      
      // If we just came back from Stripe, verify the session manually
      if (sessionId && searchParams.get('checkout') === 'success') {
        setVerifying(true);
        try {
          await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        } catch (err) {
          console.error('Verification failed:', err);
        }
        setVerifying(false);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('listings').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false });
      setListings(data || []);
      setLoading(false);
    };
    verifyAndLoad();
  }, [searchParams]);

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

export default function SellerListingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>}>
      <ListingsList />
    </Suspense>
  );
}
