'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, INDUSTRIES } from '@/lib/constants';
import styles from './page.module.css';

export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndustry, setSearchIndustry] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('listings')
        .select('id, title, short_summary, industry, city, province_state, asking_price, featured_image_url, is_featured, confidentiality_mode')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);
      if (data) setFeaturedListings(data);
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchIndustry) params.set('industry', searchIndustry);
    window.location.href = `/listings?${params.toString()}`;
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🚀 Canada's Premium Business Marketplace</div>
          <h1 className={styles.heroTitle}>
            Buy, Sell & Invest in<br />
            <span className={styles.heroGradient}>Canadian Businesses</span>
          </h1>
          <p className={styles.heroSub}>
            Dealio connects business owners, qualified buyers, and trusted advisors in one powerful deal-flow platform.
          </p>
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <div className={styles.searchInputs}>
              <div className={styles.searchField}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input type="text" placeholder="Search businesses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={styles.searchInput} />
              </div>
              <div className={styles.searchDivider}></div>
              <select value={searchIndustry} onChange={(e) => setSearchIndustry(e.target.value)} className={styles.searchSelect}>
                <option value="">All Industries</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <button type="submit" className={styles.searchBtn}>Search</button>
            </div>
          </form>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><strong>500+</strong><span>Active Listings</span></div>
            <div className={styles.heroStat}><strong>1,200+</strong><span>Verified Buyers</span></div>
            <div className={styles.heroStat}><strong>$2B+</strong><span>Deal Volume</span></div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Featured Businesses</h2>
              <p className={styles.sectionSub}>Discover premium opportunities across Canada</p>
            </div>
            <Link href="/listings" className="btn btn-outline">View All Listings →</Link>
          </div>
          <div className={styles.listingsGrid}>
            {featuredListings.length > 0 ? featuredListings.map(listing => (
              <Link href={`/listings/${listing.id}`} key={listing.id} className={styles.listingCard}>
                <div className={styles.listingImage}>
                  {listing.featured_image_url ? (
                    <img src={listing.featured_image_url} alt={listing.title} />
                  ) : (
                    <div className={styles.listingImagePlaceholder}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </div>
                  )}
                  {listing.is_featured && <span className={styles.featuredBadge}>⭐ Featured</span>}
                </div>
                <div className={styles.listingBody}>
                  <div className={styles.listingMeta}>
                    <span className="badge badge-primary">{listing.industry || 'Business'}</span>
                    {listing.confidentiality_mode !== 'confidential' && listing.city && (
                      <span className={styles.listingLocation}>📍 {listing.city}, {listing.province_state}</span>
                    )}
                  </div>
                  <h3 className={styles.listingTitle}>{listing.title}</h3>
                  <p className={styles.listingSummary}>{listing.short_summary?.substring(0, 100)}{listing.short_summary?.length > 100 ? '...' : ''}</p>
                  <div className={styles.listingPrice}>{formatCurrency(listing.asking_price)}</div>
                </div>
              </Link>
            )) : (
              /* Demo cards if no listings */
              [
                { title: 'Profitable SaaS Company', industry: 'Technology', city: 'Toronto', province: 'ON', price: 2500000, summary: 'Established SaaS platform with recurring revenue and strong growth trajectory.' },
                { title: 'Restaurant Chain – 3 Locations', industry: 'Food & Beverage', city: 'Vancouver', province: 'BC', price: 1800000, summary: 'Well-known restaurant brand with loyal customer base and profitable operations.' },
                { title: 'Manufacturing Business', industry: 'Manufacturing', city: 'Calgary', province: 'AB', price: 4200000, summary: 'Specialized manufacturing company with long-term contracts and modern facilities.' },
              ].map((demo, i) => (
                <div key={i} className={`${styles.listingCard} ${styles.demoCard}`}>
                  <div className={styles.listingImage}>
                    <div className={styles.listingImagePlaceholder}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </div>
                    <span className={styles.featuredBadge}>⭐ Featured</span>
                  </div>
                  <div className={styles.listingBody}>
                    <div className={styles.listingMeta}>
                      <span className="badge badge-primary">{demo.industry}</span>
                      <span className={styles.listingLocation}>📍 {demo.city}, {demo.province}</span>
                    </div>
                    <h3 className={styles.listingTitle}>{demo.title}</h3>
                    <p className={styles.listingSummary}>{demo.summary}</p>
                    <div className={styles.listingPrice}>{formatCurrency(demo.price)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <div className={styles.sectionHeader} style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <h2 className={styles.sectionTitle}>How Dealio Works</h2>
              <p className={styles.sectionSub}>From listing to closing, we make the process simple and secure</p>
            </div>
          </div>
          <div className={styles.stepsGrid}>
            {[
              { icon: '📝', title: 'Create Your Listing', desc: 'Build a compelling business profile with our guided wizard. Choose your confidentiality level and listing package.' },
              { icon: '🔍', title: 'Get Discovered', desc: 'Our matching engine connects your listing with qualified, pre-screened buyers actively looking for businesses like yours.' },
              { icon: '🤝', title: 'Manage Inquiries', desc: 'Receive and manage buyer inquiries through your dashboard. Screen leads and control who gets access to details.' },
              { icon: '🎯', title: 'Close the Deal', desc: 'Work directly with buyers or get Dealio advisory support for negotiations, due diligence, and closing.' },
            ].map((step, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitBlock}>
              <span className={styles.benefitLabel}>For Sellers</span>
              <h2 className={styles.benefitTitle}>Sell Your Business with Confidence</h2>
              <ul className={styles.benefitList}>
                <li>✅ Professional listing with confidentiality controls</li>
                <li>✅ Matched with qualified, pre-screened buyers</li>
                <li>✅ Inquiry management and lead screening</li>
                <li>✅ Optional advisory support at every stage</li>
                <li>✅ Premium upgrades for maximum visibility</li>
              </ul>
              <Link href="/signup?role=seller" className="btn btn-primary btn-lg">List Your Business →</Link>
            </div>
            <div className={styles.benefitBlock}>
              <span className={styles.benefitLabel}>For Buyers</span>
              <h2 className={styles.benefitTitle}>Find Your Next Acquisition</h2>
              <ul className={styles.benefitList}>
                <li>✅ Browse hundreds of verified business listings</li>
                <li>✅ AI-powered matching based on your criteria</li>
                <li>✅ Save and track opportunities</li>
                <li>✅ Acquisition support and deal advisory</li>
                <li>✅ Financing and operator matching</li>
              </ul>
              <Link href="/signup?role=buyer" className="btn btn-accent btn-lg">Create Buyer Profile →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
            <p className={styles.ctaSub}>Join Canada's fastest-growing business marketplace today.</p>
            <div className={styles.ctaActions}>
              <Link href="/signup?role=seller" className="btn btn-cta btn-lg">List Your Business</Link>
              <Link href="/signup?role=buyer" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>Find a Business</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
