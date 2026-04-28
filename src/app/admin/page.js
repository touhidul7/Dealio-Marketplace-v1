'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, timeAgo, LISTING_STATUSES } from '@/lib/constants';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, listings: 0, activeListings: 0, inquiries: 0 });
  const [pendingListings, setPendingListings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      // For a real production app, this should be done via a secure server action
      // or edge function using the service_role key to bypass RLS.
      // Assuming RLS allows admin users to read all rows.
      
      const [
        { count: usersCount },
        { count: listingsCount },
        { count: activeListingsCount },
        { count: inquiriesCount },
        { data: pending },
        { data: users }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*').eq('status', 'pending_review').order('created_at', { ascending: false }).limit(5),
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      setStats({
        users: usersCount || 0,
        listings: listingsCount || 0,
        activeListings: activeListingsCount || 0,
        inquiries: inquiriesCount || 0
      });
      setPendingListings(pending || []);
      setRecentUsers(users || []);
      setLoading(false);
    };
    load();
  }, []);

  const updateListingStatus = async (id, status) => {
    await supabase.from('listings').update({ status }).eq('id', id);
    setPendingListings(prev => prev.filter(l => l.id !== id));
  };

  if (loading) return <div><div className={styles.statsGrid}>{[1,2,3,4].map(i => <div key={i} className="stat-card skeleton" style={{height: 100}}></div>)}</div></div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className="page-title">Admin Console</h1>
          <p className="page-subtitle">Platform overview and moderation</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.users}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Listings</div>
          <div className="stat-value">{stats.listings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Listings</div>
          <div className="stat-value">{stats.activeListings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Inquiries</div>
          <div className="stat-value">{stats.inquiries}</div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Pending Listings */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Listings Pending Review</h2>
            <Link href="/admin/listings" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {pendingListings.length === 0 ? (
            <div style={{padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)'}}>
              No listings pending review.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Listing</th><th>Package</th><th>Submitted</th><th>Actions</th></tr></thead>
                <tbody>
                  {pendingListings.map(l => (
                    <tr key={l.id}>
                      <td><strong>{l.title}</strong><br/><span style={{fontSize:12,color:'var(--text-tertiary)'}}>{l.industry}</span></td>
                      <td style={{textTransform:'capitalize'}}>{l.package_type}</td>
                      <td style={{fontSize:13,color:'var(--text-tertiary)'}}>{timeAgo(l.created_at)}</td>
                      <td>
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn btn-sm btn-primary" onClick={() => updateListingStatus(l.id, 'active')}>Approve</button>
                          <Link href={`/listings/${l.id}`} target="_blank" className="btn btn-sm btn-secondary">Review</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Registrations</h2>
            <Link href="/admin/users" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {recentUsers.length === 0 ? (
            <div style={{padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)'}}>
              No users found.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>User</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.full_name || 'No Name'}</strong><br/><span style={{fontSize:12,color:'var(--text-tertiary)'}}>{u.email}</span></td>
                      <td style={{textTransform:'capitalize'}}><span className={`badge ${u.role === 'admin' ? 'badge-warning' : u.role === 'seller' ? 'badge-primary' : 'badge-accent'}`}>{u.role}</span></td>
                      <td style={{fontSize:13,color:'var(--text-tertiary)'}}>{timeAgo(u.created_at)}</td>
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
