import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from './pricing.module.css';

const packages = [
  {
    id: 'basic', name: 'Basic', price: 0, period: 'Free forever',
    color: '#64748B', tag: null,
    features: ['1 business listing', 'Standard listing page', 'Basic search placement', 'Direct buyer interest inquires', '*Buyer contact details will not be provided until you upgrade plan*'],
    cta: 'Get Started Free', href: '/signup?role=seller',
  },
  {
    id: 'pro', name: 'Pro', price: 49, period: '/month',
    strikethrough: true,
    promoText: '*Lock in early access before paid plans begin. Free until Jan 1, 2027.',
    color: '#0F52BA', tag: 'Most Popular',
    features: ['Direct buyer inquiries', 'Inquiry screening', 'Performance analytics', 'Email notifications', 'PDF teaser download'],
    cta: 'Start Pro', href: '/signup?role=seller&package=pro',
  },
  {
    id: 'full_advisory', name: 'Full Advisory', price: null, period: 'Custom pricing',
    color: '#D97706', tag: 'White Glove',
    features: ['Full Advisor representation', 'Proprietary buyer sourcing', 'Deal management', 'Negotiation support', 'Due diligence coordination', 'Closing & transition support', 'Success fee structure available'],
    cta: 'Talk to Dealio', href: '/#contact',
  },
];

const addons = [
  { name: 'Teaser / Executive Summary', price: 99, desc: 'Professional one-page teaser created by our team' },
  { name: 'CIM Creation', price: 599, desc: 'Full Confidential Information Memorandum + Proforma' },
  { name: 'Valuation Guidance', price: 999, desc: 'Market-based valuation range with comparable transactions' },
  { name: 'Buyer Outreach Campaign', price: 699, desc: 'We build a targeted buyer lead list and execute direct outreach campaigns to buyers' },
  { name: 'Deal-Readiness Review', price: 499, desc: 'Advisor-led review of your business readiness to sell' },
  { name: 'Paid Promotion', price: 699, desc: <>Feature your listing in email newsletters and social campaigns.<br />*Includes 3 months of paid advertising campaigns across social platforms.</> },
];

export const metadata = { title: 'Pricing – Dealio Marketplace', description: 'Choose the right listing package for your business sale. From free basic listings to full advisory representation.' };

export default async function PricingPage({ searchParams }) {
  const supabase = await createClient();
  const params = await searchParams;
  const upgradeId = params?.upgrade;

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

  // Fetch listings if seller
  let userListings = [];
  let userPlan = null;
  if (user && role === 'seller') {
    const { data } = await supabase.from('listings').select('id, title').eq('owner_user_id', user.id);
    userListings = data || [];
    
    const { data: profile } = await supabase.from('users').select('package_type, package_expiry').eq('id', user.id).single();
    if (profile) {
       const isExpired = profile.package_expiry && new Date(profile.package_expiry) < new Date();
       userPlan = isExpired ? 'basic' : (profile.package_type || 'basic');
    }
  }

  const getHref = (pkg) => {
    if (pkg.id === 'full_advisory') return '/#contact';
    
    if (user && (role === 'seller' || role === 'admin')) {
      // Direct to account-level checkout
      return `/checkout?package=${pkg.id}`;
    }
    return pkg.href;
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Simple, Transparent Pricing</h1>
          <p className={styles.heroSub}>Choose the plan that fits your business sale goals. Upgrade or downgrade any time.</p>
          {userPlan && (
            <div style={{ marginTop: '1.5rem', display: 'inline-block', background: 'var(--surface)', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', boxShadow: 'var(--shadow-sm)' }}>
              Your active plan: <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'capitalize' }}>{userPlan}</span>
            </div>
          )}
        </div>
      </div>

      <div className="container">
        {/* Packages */}
        <div className={styles.packagesGrid}>
          {packages.map(pkg => (
            <div key={pkg.id} className={`${styles.pkgCard} ${pkg.tag === 'Most Popular' ? styles.pkgPopular : ''}`}>
              {pkg.tag && <div className={styles.pkgTag} style={{ background: pkg.color }}>{pkg.tag}</div>}
              <div className={styles.pkgHeader} style={{ borderTopColor: pkg.color }}>
                <h2 className={styles.pkgName}>{pkg.name}</h2>
                <div className={styles.pkgPrice}>
                  {pkg.price !== null ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div>
                        {pkg.strikethrough ? (
                           <><span className={styles.pkgAmount} style={{ textDecoration: 'line-through', color: '#9CA3AF' }}>${pkg.price.toLocaleString()}</span><span className={styles.pkgPeriod} style={{ textDecoration: 'line-through', color: '#9CA3AF' }}>{pkg.period}</span></>
                        ) : (
                           <><span className={styles.pkgAmount}>${pkg.price.toLocaleString()}</span><span className={styles.pkgPeriod}>{pkg.period}</span></>
                        )}
                      </div>
                      {pkg.promoText && (
                        <div style={{ fontSize: '0.85rem', color: '#0F52BA', marginTop: '0.5rem', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.4 }}>
                          {pkg.promoText}
                        </div>
                      )}
                    </div>
                  ) : (
                    <><span className={styles.pkgAmount} style={{ fontSize: 24 }}>Custom</span><span className={styles.pkgPeriod}>{pkg.period}</span></>
                  )}
                </div>
              </div>
              <ul className={styles.pkgFeatures}>
                {pkg.features.map((f, i) => (
                  <li key={i} className={styles.pkgFeature}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill={pkg.color} opacity="0.15"/><path d="M5 8l2 2 4-4" stroke={pkg.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={getHref(pkg)} className={styles.pkgCta} style={{ background: pkg.id !== 'basic' ? pkg.color : 'transparent', color: pkg.id === 'basic' ? pkg.color : '#fff', borderColor: pkg.color }}>
                {pkg.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className={styles.addonsSection}>
          <div className={styles.addonsHeader}>
            <h2 className={styles.addonsTitle}>Service Add-ons</h2>
            <p className={styles.addonsSub}>Available with any listing package. Accelerate your sale with expert support.</p>
          </div>
          <div className={styles.addonsGrid}>
            {addons.map((a, i) => (
              <div key={i} className={styles.addonCard}>
                <div className={styles.addonTop}>
                  <h3 className={styles.addonName}>{a.name}</h3>
                  <span className={styles.addonPrice}>${a.price.toLocaleString()}</span>
                </div>
                <p className={styles.addonDesc}>{a.desc}</p>
                <Link href="/signup?role=seller" className="btn btn-secondary btn-sm">Request Service</Link>
              </div>
            ))}
          </div>
        </div>


        {/* FAQ */}
        <div className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            {[
              { q: 'Can I upgrade my plan later?', a: 'Yes. You can upgrade your listing package at any time from your seller dashboard.' },
              { q: 'Is my business information kept confidential?', a: 'Absolutely. You control confidentiality settings. You can hide your location, name, and contact details until you approve a buyer.' },
              { q: 'How long does it take to go live?', a: 'Basic listings go live immediately. Pro and Premium listings are reviewed within 24 hours to ensure quality.' },
              { q: 'What is the success fee for Full Advisory?', a: 'Our Full Advisory service is structured on a success-fee basis. Contact us for custom pricing based on your deal size.' },
            ].map((faq, i) => (
              <div key={i} className={styles.faqItem}>
                <h3 className={styles.faqQ}>{faq.q}</h3>
                <p className={styles.faqA}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
