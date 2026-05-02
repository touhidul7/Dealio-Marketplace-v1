'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { formatCurrency, LISTING_STATUSES, INQUIRY_STATUSES } from '@/lib/constants';

export default function BrokerDashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBrokerData = async () => {
      const { data: myListings } = await supabase
        .from('listings').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false });

      const ids = myListings?.map(l => l.id) || [];
      const { data: myInquiries } = ids.length > 0
        ? await supabase.from('inquiries').select('*, listings(title)').in('listing_id', ids).order('created_at', { ascending: false })
        : { data: [] };

      setListings(myListings || []);
      setInquiries(myInquiries || []);
      setLoading(false);
    };
    fetchBrokerData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <div className="skeleton" style={{ height: 40, width: 240, borderRadius: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 12 }} />)}
        </div>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active').length;
  const pendingListings = listings.filter(l => l.status === 'pending').length;
  const newInquiries = inquiries.filter(i => i.inquiry_status === 'new').length;

  const statCards = [
    { label: 'Total Listings', value: listings.length, icon: '📋', color: 'var(--primary)' },
    { label: 'Active Listings', value: activeListings, icon: '✅', color: '#16a34a' },
    { label: 'Pending Review', value: pendingListings, icon: '⏳', color: '#d97706' },
    { label: 'New Inquiries', value: newInquiries, icon: '🔔', color: '#dc2626' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Broker Dashboard</h1>
          <p className="page-subtitle">Manage your client listings and their inquiries.</p>
        </div>
        <Link href="/broker/listings/new" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
          ➕ New Client Listing
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>

        {/* Recent Listings */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Client Listings</h2>
            <Link href="/broker/listings" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>View All →</Link>
          </div>
          {listings.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>No listings yet.</p>
              <Link href="/broker/listings/new" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-block' }}>Create First Listing</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {listings.slice(0, 5).map(listing => {
                const st = LISTING_STATUSES[listing.status];
                return (
                  <div key={listing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{listing.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{formatCurrency(listing.asking_price)}</div>
                    </div>
                    <span className="badge" style={{ fontSize: 11, backgroundColor: `var(--${st?.color || 'gray'}-50)`, color: `var(--${st?.color || 'gray'}-600)`, flexShrink: 0 }}>
                      {st?.label || listing.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent Inquiries</h2>
            <Link href="/broker/inquiries" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>View All →</Link>
          </div>
          {inquiries.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📬</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>No inquiries yet. They will appear once buyers contact you.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {inquiries.slice(0, 5).map(inq => {
                const st = INQUIRY_STATUSES[inq.inquiry_status];
                return (
                  <div key={inq.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--gray-50)', border: '1px solid var(--border)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{inq.anonymous_name || 'Anonymous Buyer'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{inq.listings?.title || 'Unknown listing'}</div>
                    </div>
                    <span className={`badge badge-${st?.color || 'gray'}`} style={{ fontSize: 11, flexShrink: 0 }}>{st?.label || inq.inquiry_status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
