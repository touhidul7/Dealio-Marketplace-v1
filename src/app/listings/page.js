'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, INDUSTRIES, PROVINCES } from '@/lib/constants';
import styles from './listings.module.css';

function ListingsContent() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', industry: '', province: '', priceMin: '', priceMax: '', sortBy: 'newest' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [error, setError] = useState('');

  // Read URL params and trigger a fetch whenever they change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const industry = searchParams.get('industry') || '';
    setFilters(f => {
      const updated = { ...f, q, industry };
      // Fetch immediately with the new values (can't rely on state update timing)
      fetchListingsWithFilters(updated);
      return updated;
    });
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [filters.sortBy]);

  // Core fetch function — accepts explicit filter values to avoid stale closure issues
  const fetchListingsWithFilters = async (f) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('Supabase credentials are missing. Please check your Vercel environment variables.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) {
        setError('Database connection timeout.');
        setLoading(false);
      }
    }, 12000);

    try {
      let query = supabase.from('listings').select('*').eq('status', 'active');

      if (f.industry) query = query.eq('industry', f.industry);
      if (f.province) query = query.eq('province_state', f.province);
      if (f.priceMin) query = query.gte('asking_price', Number(f.priceMin));
      if (f.priceMax) query = query.lte('asking_price', Number(f.priceMax));
      if (f.q) query = query.or(`title.ilike.%${f.q}%,short_summary.ilike.%${f.q}%,industry.ilike.%${f.q}%`);

      if (f.sortBy === 'newest') query = query.order('created_at', { ascending: false });
      else if (f.sortBy === 'price_low') query = query.order('asking_price', { ascending: true });
      else if (f.sortBy === 'price_high') query = query.order('asking_price', { ascending: false });

      const { data, error: fetchError } = await query.limit(50);

      finished = true;
      clearTimeout(timeout);
      if (fetchError) throw fetchError;
      
      // Sort: Featured/Premium listings appear first, then apply user's sort
      const sorted = (data || []).sort((a, b) => {
        // Featured listings always first
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        // Then by package tier
        const tierOrder = { full_advisory: 3, premium: 2, pro: 1, basic: 0 };
        const tierDiff = (tierOrder[b.package_type] || 0) - (tierOrder[a.package_type] || 0);
        if (tierDiff !== 0) return tierDiff;
        return 0; // Let Supabase order handle the rest
      });
      
      setListings(sorted);
    } catch (err) {
      console.error('Listings fetch failed:', err);
      setError(`Failed to load listings: ${err.message || 'Unknown error'}`);
    } finally {
      if (finished) setLoading(false);
    }
  };

  // Wrapper that uses current state (for button clicks)
  const fetchListings = () => fetchListingsWithFilters(filters);

  const handleSearch = (e) => { e.preventDefault(); fetchListings(); };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Browse Businesses for Sale</h1>
          <p className={styles.subtitle}>Discover acquisition opportunities across Canada</p>
        </div>
      </div>
      <div className="container">
        <div className={styles.toolbar}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Search businesses..." value={filters.q} onChange={e => setFilters(f => ({...f, q: e.target.value}))} className={styles.searchInput} />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
            <button type="button" className="btn btn-secondary" onClick={() => setFiltersOpen(!filtersOpen)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>
              Filters
            </button>
          </form>
          <div className={styles.sortWrap}>
            <span className={styles.count}>{listings.length} listings</span>
            <select value={filters.sortBy} onChange={e => setFilters(f => ({...f, sortBy: e.target.value}))} className="form-select" style={{width: 'auto', padding: '8px 36px 8px 12px'}}>
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {error && (
          <div style={{ padding: '20px 30px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, marginBottom: 24, textAlign: 'center' }}>
            <p style={{ color: '#B91C1C', marginBottom: 12 }}>{error}</p>
            <button className="btn btn-secondary btn-sm" onClick={fetchListings}>🔄 Try Again</button>
          </div>
        )}

        {filtersOpen && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGrid}>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select className="form-select" value={filters.industry} onChange={e => setFilters(f => ({...f, industry: e.target.value}))}>
                  <option value="">All Industries</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Province</label>
                <select className="form-select" value={filters.province} onChange={e => setFilters(f => ({...f, province: e.target.value}))}>
                  <option value="">All Provinces</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Min Price</label>
                <input type="number" className="form-input" placeholder="$0" value={filters.priceMin} onChange={e => setFilters(f => ({...f, priceMin: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Price</label>
                <input type="number" className="form-input" placeholder="No max" value={filters.priceMax} onChange={e => setFilters(f => ({...f, priceMax: e.target.value}))} />
              </div>
            </div>
            <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
              <button className="btn btn-primary btn-sm" onClick={fetchListings}>Apply Filters</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({q:'',industry:'',province:'',priceMin:'',priceMax:'',sortBy:'newest'}); }}>Clear</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.grid}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className={styles.skeletonCard}>
                <div className="skeleton" style={{height: 200}}></div>
                <div style={{padding: 20}}>
                  <div className="skeleton" style={{height: 14, width: '40%', marginBottom: 12}}></div>
                  <div className="skeleton" style={{height: 18, width: '80%', marginBottom: 8}}></div>
                  <div className="skeleton" style={{height: 14, width: '100%', marginBottom: 16}}></div>
                  <div className="skeleton" style={{height: 22, width: '35%'}}></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className={styles.grid}>
            {listings.map(listing => (
              <Link href={`/listings/${listing.id}`} key={listing.id} className={styles.card}>
                <div className={styles.cardImage}>
                  {listing.featured_image_url ? (
                    <img src={listing.featured_image_url} alt={listing.title} />
                  ) : (
                    <div className={styles.cardImagePlaceholder}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </div>
                  )}
                  {listing.is_featured && <span className={styles.featured}>⭐ Featured</span>}
                  {listing.is_verified && <span className={styles.confBadge} style={{background: 'var(--accent)', color: 'white', left: listing.is_featured ? 'auto' : 12, right: listing.is_featured ? 12 : 'auto'}}>✓ Verified</span>}
                  {listing.confidentiality_mode === 'confidential' && <span className={styles.confBadge}>🔒 Confidential</span>}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className="badge badge-primary">{listing.industry || 'Business'}</span>
                    {listing.confidentiality_mode !== 'confidential' && listing.city && (
                      <span className={styles.location}>📍 {listing.city}{listing.province_state ? `, ${listing.province_state}` : ''}</span>
                    )}
                  </div>
                  <h3 className={styles.cardTitle}>{listing.title}</h3>
                  <p className={styles.cardSummary}>{listing.short_summary?.substring(0, 120)}{listing.short_summary?.length > 120 ? '...' : ''}</p>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardPrice}>{formatCurrency(listing.asking_price)}</div>
                    <span className="btn btn-sm btn-primary">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3 className="empty-state-title">No listings found</h3>
            <p className="empty-state-text">Try adjusting your search filters or check back later for new listings.</p>
            <button className="btn btn-primary" onClick={() => { setFilters({q:'',industry:'',province:'',priceMin:'',priceMax:'',sortBy:'newest'}); fetchListings(); }}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="container" style={{padding: '100px 0', textAlign: 'center'}}><div className="spinner"></div><p>Loading listings...</p></div>}>
      <ListingsContent />
    </Suspense>
  );
}
