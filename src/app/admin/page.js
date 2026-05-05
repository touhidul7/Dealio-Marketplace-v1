'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, timeAgo } from '@/lib/constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, listings: 0, activeListings: 0, inquiries: 0, revenue: 0, serviceRequests: 0 });
  const [chartData, setChartData] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) {
        setError('Admin data is taking too long to load.');
        setLoading(false);
      }
    }, 12000);

    const load = async () => {
      try {
        setLoading(true);
        const [
          { count: usersCount, data: allUsers, error: uErr },
          { count: listingsCount, data: allListings, error: lErr },
          { count: activeListingsCount },
          { count: inquiriesCount },
          { count: serviceRequestsCount },
          { data: purchases },
          { data: pending },
          { data: users }
        ] = await Promise.all([
          supabase.from('users').select('created_at', { count: 'exact' }),
          supabase.from('listings').select('created_at', { count: 'exact' }),
          supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('inquiries').select('*', { count: 'exact', head: true }),
          supabase.from('service_requests').select('*', { count: 'exact', head: true }),
          supabase.from('package_purchases').select('amount').eq('payment_status', 'completed'),
          supabase.from('listings').select('*').eq('status', 'pending_review').order('created_at', { ascending: false }).limit(5),
          supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5)
        ]);

        if (uErr || lErr) throw uErr || lErr;

        const totalRevenue = purchases ? purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) : 0;

        setStats({
          users: usersCount || 0,
          listings: listingsCount || 0,
          activeListings: activeListingsCount || 0,
          inquiries: inquiriesCount || 0,
          serviceRequests: serviceRequestsCount || 0,
          revenue: totalRevenue
        });
        
        // Process Chart Data (Last 6 months)
        const monthCounts = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const label = d.toLocaleString('default', { month: 'short' });
          monthCounts[label] = { name: label, Users: 0, Listings: 0 };
        }
        
        allUsers?.forEach(u => {
          const date = new Date(u.created_at);
          const label = date.toLocaleString('default', { month: 'short' });
          if (monthCounts[label]) monthCounts[label].Users += 1;
        });

        allListings?.forEach(l => {
          const date = new Date(l.created_at);
          const label = date.toLocaleString('default', { month: 'short' });
          if (monthCounts[label]) monthCounts[label].Listings += 1;
        });

        setChartData(Object.values(monthCounts));
        setPendingListings(pending || []);
        setRecentUsers(users || []);
        finished = true;
        clearTimeout(timeout);
      } catch (err) {
        console.error('Admin load failed:', err);
        setError('Dashboard error: ' + (err.message || 'Check your RLS policies'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase]);

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

      {error && (
        <div style={{ padding: 20, background: '#FEF2F2', color: '#B91C1C', borderRadius: 12, marginBottom: 24, border: '1px solid #FCA5A5' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{color: 'var(--accent)'}}>{formatCurrency(stats.revenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Listings</div>
          <div className="stat-value">{stats.activeListings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Service Requests</div>
          <div className="stat-value">{stats.serviceRequests}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Inquiries</div>
          <div className="stat-value">{stats.inquiries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Listings</div>
          <div className="stat-value">{stats.listings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.users}</div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className={styles.section} style={{ background: 'var(--surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 24 }}>Growth Analytics (6 Months)</h2>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-tertiary)', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-tertiary)', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
                itemStyle={{ fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="Users" stroke="var(--primary)" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
              <Area type="monotone" dataKey="Listings" stroke="var(--accent)" fillOpacity={1} fill="url(#colorListings)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
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
