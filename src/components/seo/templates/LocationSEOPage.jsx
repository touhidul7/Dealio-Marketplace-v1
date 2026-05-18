import SEOHero from '../SEOHero';
import SEOListingGrid from '../SEOListingGrid';
import SEOCTA from '../SEOCTA';
import RelatedLinks from '../RelatedLinks';
import FAQSection from '../FAQSection';

export default function LocationSEOPage({ page, listings }) {
  const faqs = [
    { question: `How do I buy a business in ${page.filters.city || page.filters.province}?`, answer: `To buy a business in ${page.filters.city || page.filters.province}, start by browsing our active listings, creating a buyer profile, and reaching out to the sellers or brokers for confidential details.` },
    { question: `Are there seller-financed businesses in ${page.filters.city || page.filters.province}?`, answer: `Yes, many owners offer seller financing. You can filter our listings to find seller-financed opportunities in your desired location.` }
  ];

  return (
    <>
      <SEOHero title={page.h1} intro={page.intro} />
      <div className="container" style={{ paddingBottom: '80px' }}>
        <SEOListingGrid listings={listings} />
        <RelatedLinks links={page.relatedLinks} />
        <FAQSection faqs={faqs} />
        <SEOCTA ctaType={page.ctaType} />
      </div>
    </>
  );
}
