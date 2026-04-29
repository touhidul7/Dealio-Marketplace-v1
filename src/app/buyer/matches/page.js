'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/constants';

export default function BuyerMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: bp } = await supabase.from('buyer_profiles').select('id').eq('user_id', user.id).single();
      if (bp) {
        const { data } = await supabase.from('matches').select('*, listings(id, title, industry, city, province_state, asking_price, featured_image_url)').eq('buyer_profile_id', bp.id).order('total_score', { ascending: false });
        setMatches(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Matched Listings</h1>
        <p className="page-subtitle">Listings tailored to your acquisition criteria</p>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 12 }}></div>
      ) : matches.length === 0 ? (
        <div className="empty-state">No matches found. Update your profile criteria to get more matches.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {matches.map(m => (
            <Link key={m.id} href={`/listings/${m.listings?.id}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ height: 160, background: 'var(--gray-100)', position: 'relative' }}>
                {m.listings?.featured_image_url && <img src={m.listings.featured_image_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />}
                <span style={{ position: 'absolute', top: 8, right: 8, background: m.total_score >= 80 ? 'var(--accent)' : 'var(--cta)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>{m.total_score}% Match</span>
              </div>
              <div style={{ padding: 'var(--space-4)' }}>
                <span className="badge badge-primary" style={{marginBottom:8}}>{m.listings?.industry}</span>
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:4}}>{m.listings?.title}</h3>
                <span style={{fontSize:20,fontWeight:800,color:'var(--primary)'}}>{formatCurrency(m.listings?.asking_price)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
