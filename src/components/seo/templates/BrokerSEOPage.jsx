import SEOHero from '../SEOHero';
import SEOCTA from '../SEOCTA';
import RelatedLinks from '../RelatedLinks';

export default function BrokerSEOPage({ page }) {
  return (
    <>
      <SEOHero title={page.h1} intro={page.intro} />
      <div className="container" style={{ paddingBottom: '80px', paddingTop: '40px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
          <h2>Connecting with Business Brokers</h2>
          <p>
            Finding the right business broker in Canada is critical to ensuring a successful transaction. 
            On Dealio Marketplace, you can browse listings directly represented by professional brokers and M&A advisors.
          </p>
        </div>
        <RelatedLinks links={page.relatedLinks} />
        <SEOCTA ctaType={page.ctaType} />
      </div>
    </>
  );
}
