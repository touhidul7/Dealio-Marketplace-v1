'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { formatCurrency, LISTING_STATUSES } from '@/lib/constants';

export default function BrokerDashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBrokerData = async () => {
      const [listingsRes, inquiriesRes] = await Promise.all([
        supabase
          .from('listings')
          .select('*')
          .eq('owner_user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('inquiries')
          .select('*, listings(title)')
          .in('listing_id', (
             await supabase.from('listings').select('id').eq('owner_user_id', user.id)
          ).data?.map(l => l.id) || [])
          .order('created_at', { ascending: false })
      ]);

      if (listingsRes.data) setListings(listingsRes.data);
      if (inquiriesRes.data) setInquiries(inquiriesRes.data);
      setLoading(false);
    };

    fetchBrokerData();
  }, [user, supabase]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;
  }

  const activeListings = listings.filter(l => l.status === 'active').length;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Broker Dashboard</h1>
          <p className="page-subtitle">Manage your client listings and their inquiries.</p>
        </div>
        <Link href="/broker/listings/new" className="btn btn-primary">
          + New Client Listing
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Total Listings</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{listings.length}</div>
        </div>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Active Listings</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>{activeListings}</div>
        </div>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Total Inquiries</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{inquiries.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Listings Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>Recent Client Listings</h2>
            <Link href="/broker/listings" style={{ fontSize: 13, color: 'var(--primary)' }}>View All</Link>
          </div>
          {listings.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No listings found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.slice(0, 5).map(listing => (
                    <tr key={listing.id}>
                      <td style={{ fontSize: 13, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {listing.title}
                      </td>
                      <td style={{ fontSize: 13 }}>{formatCurrency(listing.asking_price)}</td>
                      <td>
                        <span className={`badge`} style={{ backgroundColor: `var(--${LISTING_STATUSES[listing.status]?.color || 'gray'}-50)`, color: `var(--${LISTING_STATUSES[listing.status]?.color || 'gray'}-600)` }}>
                          {LISTING_STATUSES[listing.status]?.label || listing.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inquiries Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>Recent Inquiries</h2>
            <Link href="/broker/inquiries" style={{ fontSize: 13, color: 'var(--primary)' }}>View All</Link>
          </div>
          {inquiries.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No inquiries found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.slice(0, 5).map(inq => (
                    <tr key={inq.id}>
                      <td style={{ fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inq.listings?.title || 'Unknown'}
                      </td>
                      <td style={{ fontSize: 13 }}>{inq.anonymous_name || 'Anonymous'}</td>
                      <td><span className="badge badge-secondary">{inq.inquiry_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
