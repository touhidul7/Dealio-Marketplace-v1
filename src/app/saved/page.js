'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency } from '@/lib/constants';

export default function SavedListingsPage() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from('saved_listings').select('*, listings(id, title, industry, city, province_state, asking_price, featured_image_url)').eq('user_id', user.id).order('created_at', { ascending: false });
      setSaved(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Saved Listings</h1>
        <p className="page-subtitle">Listings you've bookmarked for later</p>
      </div>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 12 }} />)}
        </div>
      ) : saved.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>♥</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No saved listings yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Browse the marketplace and save listings you're interested in.</p>
          <Link href="/listings" className="btn btn-primary">Browse Listings</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {saved.map(s => (
            <Link key={s.id} href={`/listings/${s.listings?.id}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'box-shadow 0.2s', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ height: 160, background: 'var(--gray-100)', position: 'relative' }}>
                {s.listings?.featured_image_url
                  ? <img src={s.listings.featured_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏢</div>
                }
              </div>
              <div style={{ padding: 'var(--space-4)' }}>
                {s.listings?.industry && <span className="badge badge-primary" style={{ marginBottom: 8, fontSize: 11 }}>{s.listings.industry}</span>}
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, marginTop: 0 }}>{s.listings?.title}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                  📍 {[s.listings?.city, s.listings?.province_state].filter(Boolean).join(', ')}
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(s.listings?.asking_price)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
