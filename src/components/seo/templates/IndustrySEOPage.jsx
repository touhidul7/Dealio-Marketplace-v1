import SEOHero from '../SEOHero';
import SEOListingGrid from '../SEOListingGrid';
import SEOCTA from '../SEOCTA';
import RelatedLinks from '../RelatedLinks';
import FAQSection from '../FAQSection';

export default function IndustrySEOPage({ page, listings }) {
  const faqs = [
    { question: `Why should I buy a ${page.filters.industry.toLowerCase()}?`, answer: `${page.filters.industry} businesses often provide stable cash flow and growth opportunities. Browse our marketplace for active listings.` },
    { question: `How much does a ${page.filters.industry.toLowerCase()} cost?`, answer: `Valuations vary widely based on revenue, cash flow, and assets. Create a free Dealio account to view asking prices and financial data.` }
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
