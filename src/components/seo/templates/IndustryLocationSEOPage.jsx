import SEOHero from '../SEOHero';
import SEOListingGrid from '../SEOListingGrid';
import SEOCTA from '../SEOCTA';
import RelatedLinks from '../RelatedLinks';
import FAQSection from '../FAQSection';

export default function IndustryLocationSEOPage({ page, listings }) {
  const industry = page.filters.industry;
  const location = page.filters.city || page.filters.province;

  const faqs = [
    {
      question: `How do I buy a ${industry.toLowerCase()} business in ${location}?`,
      answer: `To buy a ${industry.toLowerCase()} business in ${location}, start by reviewing our active listings, setting up a buyer profile, and reaching out to the listing broker or owner for confidential financials.`
    },
    {
      question: `Are there profitable ${industry.toLowerCase()} opportunities in ${location}?`,
      answer: `Yes, we host a variety of active and confidential listings. You can browse active operations, verify historical cash flows, and contact sellers directly.`
    }
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
