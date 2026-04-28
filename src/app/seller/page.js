'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, timeAgo, LISTING_STATUSES, INQUIRY_STATUSES } from '@/lib/constants';
import styles from './seller.module.css';

export default function SellerDashboard() {
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: l }, { data: i }] = await Promise.all([
        supabase.from('listings').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('inquiries').select('*, listings(title)').in('listing_id',
          (await supabase.from('listings').select('id').eq('owner_user_id', user.id)).data?.map(x => x.id) || []
        ).order('created_at', { ascending: false }).limit(10),
      ]);
      setListings(l || []);
      setInquiries(i || []);
      setLoading(false);
    };
    load();
  }, []);

  const active = listings.filter(l => l.status === 'active').length;
  const draft = listings.filter(l => l.status === 'draft').length;
  const newInquiries = inquiries.filter(i => i.inquiry_status === 'new').length;

  if (loading) return (
    <div>
      <div className={styles.statsGrid}>
        {[1,2,3,4].map(i => <div key={i} className="stat-card skeleton" style={{height: 100}}></div>)}
      </div>
    </div>
  );

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Seller Dashboard</h1>
          <p className="page-subtitle">Manage your listings and buyer inquiries</p>
        </div>
        <Link href="/seller/listings/new" className="btn btn-primary">➕ Create New Listing</Link>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-label">Active Listings</div>
          <div className="stat-value">{active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Draft Listings</div>
          <div className="stat-value">{draft}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">New Inquiries</div>
          <div className="stat-value" style={{color: newInquiries > 0 ? 'var(--accent)' : undefined}}>{newInquiries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Inquiries</div>
          <div className="stat-value">{inquiries.length}</div>
        </div>
      </div>

      {/* Listings */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Listings</h2>
          <Link href="/seller/listings" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {listings.length === 0 ? (
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
                {listings.slice(0, 5).map(l => (
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

      {/* Recent Inquiries */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Inquiries</h2>
          <Link href="/seller/inquiries" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {inquiries.length === 0 ? (
          <div style={{padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)'}}>
            No inquiries yet. Once buyers contact you, they'll appear here.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Listing</th><th>Buyer</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
              <tbody>
                {inquiries.slice(0, 5).map(inq => (
                  <tr key={inq.id}>
                    <td style={{fontSize:13}}>{inq.listings?.title || '—'}</td>
                    <td style={{fontSize:13}}>{inq.anonymous_name || inq.buyer_user_id?.substring(0,8) || 'Anonymous'}<br/><span style={{color:'var(--text-tertiary)',fontSize:11}}>{inq.anonymous_email}</span></td>
                    <td><span className={`badge badge-${INQUIRY_STATUSES[inq.inquiry_status]?.color || 'gray'}`}>{INQUIRY_STATUSES[inq.inquiry_status]?.label || inq.inquiry_status}</span></td>
                    <td style={{fontSize:12,color:'var(--text-tertiary)'}}>{timeAgo(inq.created_at)}</td>
                    <td><Link href="/seller/inquiries" className="btn btn-sm btn-primary">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upsell Panel */}
      <div className={styles.upsellGrid}>
        {[
          { icon: '📄', title: 'Get a Professional Teaser', desc: 'Our advisors write a compelling one-page business summary to attract serious buyers.', cta: 'Request Teaser ($299)', href: '/seller/services' },
          { icon: '🎯', title: 'Buyer Outreach Campaign', desc: 'We proactively contact our network of qualified buyers on your behalf.', cta: 'Start Campaign ($699)', href: '/seller/services' },
          { icon: '💼', title: 'Full Advisory Support', desc: 'Get a dedicated Dealio advisor to manage your entire sale process.', cta: 'Talk to an Advisor', href: '/seller/services' },
        ].map((u, i) => (
          <div key={i} className={styles.upsellCard}>
            <div className={styles.upsellIcon}>{u.icon}</div>
            <h3 className={styles.upsellTitle}>{u.title}</h3>
            <p className={styles.upsellDesc}>{u.desc}</p>
            <Link href={u.href} className="btn btn-outline btn-sm">{u.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
