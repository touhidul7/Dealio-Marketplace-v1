import Link from 'next/link';
import styles from './pricing.module.css';

const packages = [
  {
    id: 'basic', name: 'Basic', price: 0, period: 'Free forever',
    color: '#64748B', tag: null,
    features: ['1 business listing', 'Standard listing page', 'Direct buyer inquiries', 'Basic search placement', '30-day listing'],
    cta: 'Get Started Free', href: '/signup?role=seller',
  },
  {
    id: 'pro', name: 'Pro', price: 149, period: '/month',
    color: '#0F52BA', tag: 'Most Popular',
    features: ['Enhanced listing page', 'Priority search placement', 'Inquiry screening', 'Performance analytics', 'Email notifications', '90-day listing', 'PDF teaser download'],
    cta: 'Start Pro', href: '/signup?role=seller&package=pro',
  },
  {
    id: 'premium', name: 'Premium', price: 399, period: '/month',
    color: '#10B981', tag: 'Best Value',
    features: ['Featured listing badge', 'Top search placement', 'Buyer outreach campaigns', 'CIM creation support', 'Dedicated advisor support', '180-day listing', 'Verified seller badge', 'Advanced analytics'],
    cta: 'Start Premium', href: '/signup?role=seller&package=premium',
  },
  {
    id: 'full_advisory', name: 'Full Advisory', price: null, period: 'Custom pricing',
    color: '#D97706', tag: 'White Glove',
    features: ['Full Dealio representation', 'Proprietary buyer sourcing', 'Deal management', 'Negotiation support', 'Due diligence coordination', 'Closing & transition support', 'Success fee structure available'],
    cta: 'Talk to Dealio', href: '/#contact',
  },
];

const addons = [
  { name: 'Teaser / Executive Summary', price: 299, desc: 'Professional one-page teaser created by our team' },
  { name: 'CIM Creation', price: 999, desc: 'Full Confidential Information Memorandum written by advisors' },
  { name: 'Valuation Guidance', price: 499, desc: 'Market-based valuation range with comparable transactions' },
  { name: 'Buyer Outreach Campaign', price: 699, desc: 'Targeted outreach to our network of qualified buyers' },
  { name: 'Deal-Readiness Review', price: 349, desc: 'Advisor-led review of your business readiness to sell' },
  { name: 'Paid Promotion', price: 199, desc: 'Feature your listing in email newsletters and social campaigns' },
];

export const metadata = { title: 'Pricing – Dealio Marketplace', description: 'Choose the right listing package for your business sale. From free basic listings to full advisory representation.' };

export default function PricingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Simple, Transparent Pricing</h1>
          <p className={styles.heroSub}>Choose the plan that fits your business sale goals. Upgrade or downgrade any time.</p>
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
                    <><span className={styles.pkgAmount}>${pkg.price.toLocaleString()}</span><span className={styles.pkgPeriod}>{pkg.period}</span></>
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
              <Link href={pkg.href} className={styles.pkgCta} style={{ background: pkg.id !== 'basic' ? pkg.color : 'transparent', color: pkg.id === 'basic' ? pkg.color : '#fff', borderColor: pkg.color }}>
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

        {/* Buyer Section */}
        <div className={styles.buyerSection}>
          <div className={styles.buyerCard}>
            <div>
              <span className={styles.buyerLabel}>For Buyers</span>
              <h2 className={styles.buyerTitle}>Browse and Inquire for Free</h2>
              <p className={styles.buyerDesc}>Creating a buyer profile and browsing listings is completely free. Get matched with businesses that fit your criteria automatically.</p>
              <ul className={styles.buyerList}>
                <li>✅ Free buyer profile</li>
                <li>✅ Unlimited listing browsing</li>
                <li>✅ Automatic match notifications</li>
                <li>✅ Save up to 50 listings</li>
                <li>✅ Direct seller inquiries</li>
              </ul>
            </div>
            <div className={styles.buyerCtas}>
              <Link href="/signup?role=buyer" className="btn btn-primary btn-lg">Create Buyer Profile</Link>
              <Link href="/listings" className="btn btn-secondary btn-lg">Browse Listings</Link>
            </div>
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
