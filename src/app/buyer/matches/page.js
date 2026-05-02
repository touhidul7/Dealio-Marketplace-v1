'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency } from '@/lib/constants';

function computeMatch(listing, profile) {
  let score = 0;
  let reasons = [];

  // Industry match (40 points)
  const industries = profile.preferred_industries || [];
  if (industries.length === 0 || industries.includes(listing.industry)) {
    score += 40;
    if (industries.includes(listing.industry)) reasons.push(`${listing.industry} industry`);
  }

  // Location match (30 points)
  const locations = profile.preferred_locations || [];
  const listingLocation = listing.province_state || '';
  if (locations.length === 0 || locations.some(l => listingLocation.toLowerCase().includes(l.toLowerCase()) || l.toLowerCase().includes(listingLocation.toLowerCase()))) {
    score += 30;
    if (locations.length > 0) reasons.push(`${listingLocation} location`);
  }

  // Deal size match (30 points)
  const price = listing.asking_price || 0;
  const minDeal = profile.min_deal_size || 0;
  const maxDeal = profile.max_deal_size || Infinity;
  if (price >= minDeal && (maxDeal === 0 || price <= maxDeal)) {
    score += 30;
    if (minDeal > 0 || maxDeal > 0) reasons.push('within deal size');
  }

  return { score, reasons };
}

export default function BuyerMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Fetch buyer profile
      const { data: bp } = await supabase
        .from('buyer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!bp) {
        setProfileMissing(true);
        setLoading(false);
        return;
      }

      // Fetch all active listings
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, industry, city, province_state, asking_price, featured_image_url, revenue, ebitda')
        .eq('status', 'active');

      if (!listings || listings.length === 0) {
        setLoading(false);
        return;
      }

      // Score each listing against the buyer profile
      const scored = listings
        .map(listing => ({ listing, ...computeMatch(listing, bp) }))
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score);

      setMatches(scored);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 className="page-title">Matched Listings</h1>
          <p className="page-subtitle">Listings tailored to your acquisition criteria</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 12 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Matched Listings</h1>
          <p className="page-subtitle">Listings tailored to your acquisition criteria</p>
        </div>
        {matches.length > 0 && (
          <span style={{ fontSize: 14, color: 'var(--text-secondary)', background: 'var(--gray-100)', padding: '6px 14px', borderRadius: 99, fontWeight: 500 }}>
            {matches.length} match{matches.length !== 1 ? 'es' : ''} found
          </span>
        )}
      </div>

      {profileMissing ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <h3 className="empty-state-title">Complete your buyer profile</h3>
          <p className="empty-state-text">Set your industry, location, and deal size criteria to see matched listings.</p>
          <Link href="/buyer/profile" className="btn btn-primary" style={{ marginTop: 16 }}>Set Up Profile</Link>
        </div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">No matches yet</h3>
          <p className="empty-state-text">We couldn&apos;t find active listings matching your current criteria. Try broadening your industry or location preferences.</p>
          <Link href="/buyer/profile" className="btn btn-secondary" style={{ marginTop: 16 }}>Update Criteria</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {matches.map(({ listing, score, reasons }) => {
            const badgeColor = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#6b7280';
            return (
              <Link key={listing.id} href={`/listings/${listing.id}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'box-shadow 0.2s', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ height: 160, background: 'var(--gray-100)', position: 'relative' }}>
                  {listing.featured_image_url
                    ? <img src={listing.featured_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏢</div>
                  }
                  <span style={{ position: 'absolute', top: 10, right: 10, background: badgeColor, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>
                    {score}% Match
                  </span>
                </div>
                <div style={{ padding: 'var(--space-4)' }}>
                  {listing.industry && <span className="badge badge-primary" style={{ marginBottom: 8, fontSize: 11 }}>{listing.industry}</span>}
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, marginTop: 0 }}>{listing.title}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                    📍 {[listing.city, listing.province_state].filter(Boolean).join(', ')}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
                    {formatCurrency(listing.asking_price)}
                  </div>
                  {reasons.length > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {reasons.map(r => (
                        <span key={r} style={{ background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 99 }}>✓ {r}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
