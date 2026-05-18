import SEOHero from '../SEOHero';
import SEOCTA from '../SEOCTA';
import RelatedLinks from '../RelatedLinks';

export default function ComparisonSEOPage({ page }) {
  return (
    <>
      <SEOHero title={page.h1} intro={page.intro} />
      <div className="container" style={{ paddingBottom: '80px', paddingTop: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
          <h2>Why Dealio Marketplace?</h2>
          <p>
            When considering alternatives for buying or selling a business in Canada, 
            Dealio Marketplace provides a modern, fast, and transparent platform tailored for the Canadian market.
          </p>
          <ul style={{ marginTop: '20px', marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><strong>Verified Listings:</strong> Quality over quantity.</li>
            <li><strong>Confidentiality First:</strong> Protect your brand while finding buyers.</li>
            <li><strong>Direct Communication:</strong> Speak directly with sellers and buyers.</li>
          </ul>
        </div>
        <RelatedLinks links={page.relatedLinks} />
        <SEOCTA ctaType={page.ctaType} />
      </div>
    </>
  );
}
