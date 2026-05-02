'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { formatCurrency, timeAgo } from '@/lib/constants';
import styles from './buyer.module.css';

function computeMatch(listing, profile) {
  let score = 0;
  let reasons = [];

  const industries = profile.industry_focus || [];
  const listingIndustry = listing.industry || '';
  if (industries.length === 0 || industries.some(ind => listingIndustry.toLowerCase().includes(ind.toLowerCase()) || ind.toLowerCase().includes(listingIndustry.toLowerCase()))) {
    score += 40;
    if (industries.length > 0 && listingIndustry) reasons.push(`${listingIndustry} industry`);
  }

  const locations = profile.geographic_focus || [];
  const listingProvince = (listing.province_state || '').toLowerCase();
  const listingCity = (listing.city || '').toLowerCase();
  const locationMatches = locations.length === 0 || locations.some(loc => {
    const l = loc.toLowerCase();
    return listingProvince.includes(l) || l.includes(listingProvince) || listingCity.includes(l) || l.includes(listingCity);
  });
  if (locationMatches) {
    score += 30;
    if (locations.length > 0 && listingProvince) reasons.push(`${listing.province_state} location`);
  }

  const price = listing.asking_price || 0;
  const minDeal = Number(profile.deal_size_min) || 0;
  const maxDeal = Number(profile.deal_size_max) || 0;
  const withinSize = (minDeal === 0 || price >= minDeal) && (maxDeal === 0 || price <= maxDeal);
  if (withinSize) {
    score += 30;
    if (minDeal > 0 || maxDeal > 0) reasons.push('within deal size range');
  }

  return { score, reasons };
}

export default function BuyerDashboard() {
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: bp }, { data: sv }, { data: inq }] = await Promise.all([
        supabase.from('buyer_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('saved_listings').select('*, listings(id, title, industry, city, province_state, asking_price, featured_image_url, status)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
        supabase.from('inquiries').select('*, listings(title)').eq('buyer_user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setProfile(bp);
      setSaved((sv || []).filter(s => s.listings?.status === 'active'));
      setInquiries(inq || []);
      if (bp) {
        const { data: listingsData } = await supabase.from('listings').select('id, title, industry, city, province_state, asking_price, featured_image_url').eq('status', 'active');
        if (listingsData) {
          const scored = listingsData
            .map(l => {
              const match = computeMatch(l, bp);
              return { listings: l, total_score: match.score, reasons: match.reasons };
            })
            .filter(m => m.total_score > 0)
            .sort((a, b) => b.total_score - a.total_score)
            .slice(0, 6);
          setMatches(scored);
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const completion = profile?.profile_completion_percent || 0;

  if (loading) return <div><div className={styles.statsGrid}>{[1,2,3,4].map(i=><div key={i} className="stat-card skeleton" style={{height:100}}></div>)}</div></div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div><h1 className="page-title">Buyer Dashboard</h1><p className="page-subtitle">Find and track your next acquisition</p></div>
        <Link href="/listings" className="btn btn-primary">🔍 Browse Listings</Link>
      </div>

      {/* Profile completion banner */}
      {completion < 80 && (
        <div className={styles.completionBanner}>
          <div className={styles.completionInfo}>
            <strong>Complete your buyer profile</strong>
            <span>A complete profile gets matched with better listings</span>
          </div>
          <div className={styles.completionBar}>
            <div className={styles.completionFill} style={{ width: `${completion}%` }}></div>
          </div>
          <span className={styles.completionPct}>{completion}%</span>
          <Link href="/buyer/profile" className="btn btn-primary btn-sm">Complete Profile →</Link>
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className="stat-card"><div className="stat-label">Saved Listings</div><div className="stat-value">{saved.length}</div></div>
        <div className="stat-card"><div className="stat-label">Inquiries Sent</div><div className="stat-value">{inquiries.length}</div></div>
        <div className="stat-card"><div className="stat-label">Matched Listings</div><div className="stat-value">{matches.length}</div></div>
        <div className="stat-card"><div className="stat-label">Profile Complete</div><div className="stat-value">{completion}%</div></div>
      </div>

      {/* Matched Listings */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🎯 Matched Listings</h2>
          <Link href="/buyer/matches" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {matches.length === 0 ? (
          <div style={{textAlign:'center',padding:'var(--space-8)',color:'var(--text-tertiary)'}}>
            <p style={{marginBottom:12}}>No matches yet. Complete your buyer profile to get matched.</p>
            <Link href="/buyer/profile" className="btn btn-primary btn-sm">Set Up Profile</Link>
          </div>
        ) : (
          <div className={styles.listingsGrid}>
            {matches.slice(0, 3).map(m => (
              <Link key={m.id} href={`/listings/${m.listings?.id}`} className={styles.matchCard}>
                <div className={styles.matchImg}>
                  {m.listings?.featured_image_url ? <img src={m.listings.featured_image_url} alt="" /> : <div className={styles.matchImgPlaceholder}>🏢</div>}
                  <span className={styles.matchScore} style={{ background: m.total_score >= 80 ? 'var(--accent)' : m.total_score >= 60 ? 'var(--cta)' : 'var(--gray-500)' }}>{m.total_score}% match</span>
                </div>
                <div className={styles.matchBody}>
                  <span className="badge badge-primary" style={{marginBottom:6}}>{m.listings?.industry}</span>
                  <h3 style={{fontSize:15,fontWeight:700,marginBottom:4}}>{m.listings?.title}</h3>
                  <span style={{fontSize:18,fontWeight:800,color:'var(--primary)'}}>{formatCurrency(m.listings?.asking_price)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Saved Listings */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>♥ Saved Listings</h2>
          <Link href="/buyer/saved" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {saved.length === 0 ? (
          <p style={{color:'var(--text-tertiary)',fontSize:14,padding:'var(--space-4) 0'}}>No saved listings. Browse listings and save the ones you're interested in.</p>
        ) : (
          <div className={styles.listingsGrid}>
            {saved.slice(0, 3).map(s => (
              <Link key={s.id} href={`/listings/${s.listings?.id}`} className={styles.matchCard}>
                <div className={styles.matchImg}>
                  {s.listings?.featured_image_url ? <img src={s.listings.featured_image_url} alt="" /> : <div className={styles.matchImgPlaceholder}>🏢</div>}
                </div>
                <div className={styles.matchBody}>
                  <span className="badge badge-primary" style={{marginBottom:6}}>{s.listings?.industry}</span>
                  <h3 style={{fontSize:15,fontWeight:700,marginBottom:4}}>{s.listings?.title}</h3>
                  <span style={{fontSize:18,fontWeight:800,color:'var(--primary)'}}>{formatCurrency(s.listings?.asking_price)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
