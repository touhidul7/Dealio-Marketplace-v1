import SEOHero from '../SEOHero';
import SEOListingGrid from '../SEOListingGrid';
import SEOCTA from '../SEOCTA';
import RelatedLinks from '../RelatedLinks';

export default function FinancialFilterSEOPage({ page, listings }) {
  return (
    <>
      <SEOHero title={page.h1} intro={page.intro} />
      <div className="container" style={{ paddingBottom: '80px' }}>
        <SEOListingGrid listings={listings} />
        <RelatedLinks links={page.relatedLinks} />
        <SEOCTA ctaType={page.ctaType} />
      </div>
    </>
  );
}
