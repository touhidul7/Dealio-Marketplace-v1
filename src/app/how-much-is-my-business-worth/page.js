import CalculatorClient from '@/app/business-valuation-calculator/CalculatorClient';

export const metadata = {
  title: 'How Much is My Business Worth? | Free Business Valuation | Dealio Marketplace',
  description: 'Find out how much your Canadian business is worth with Dealio\'s free valuation calculator. Get an instant estimate based on revenue, EBITDA, industry, and growth factors.',
  alternates: {
    canonical: 'https://www.dealiomarketplace.com/how-much-is-my-business-worth'
  },
  openGraph: {
    title: 'How Much is My Business Worth? | Free Business Valuation | Dealio Marketplace',
    description: 'Find out how much your Canadian business is worth with Dealio\'s free valuation calculator. Get an instant estimate based on revenue, EBITDA, industry, and growth factors.',
    url: 'https://www.dealiomarketplace.com/how-much-is-my-business-worth',
    type: 'website'
  }
};

export default function HowMuchIsMyBusinessWorthPage() {
  return (
    <>
      <CalculatorClient />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "How Much is My Business Worth? | Free Business Valuation | Dealio Marketplace",
            "description": "Find out how much your Canadian business is worth with Dealio's free valuation calculator. Get an instant estimate based on revenue, EBITDA, industry, and growth factors.",
            "url": "https://www.dealiomarketplace.com/how-much-is-my-business-worth"
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.dealiomarketplace.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "How Much is My Business Worth",
                "item": "https://www.dealiomarketplace.com/how-much-is-my-business-worth"
              }
            ]
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I find out how much my business is worth?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The most common approach is to use earnings multiples — applying an industry-specific multiple to your SDE (seller discretionary earnings) or EBITDA. You can also benchmark against comparable sales in your industry and region. For a quick starting point, use Dealio's free valuation calculator. For higher-value transactions or complex businesses, a professional business valuator or broker can provide a formal opinion of value."
                }
              },
              {
                "@type": "Question",
                "name": "What is the most common way to value a small business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The most common method is the earnings multiple approach. For smaller owner-operated businesses, buyers typically apply a multiple to SDE (seller discretionary earnings). For larger businesses with management teams, EBITDA multiples are more common. The specific multiple depends on industry, growth trajectory, recurring revenue, customer concentration, and how transferable the business is without the current owner."
                }
              },
              {
                "@type": "Question",
                "name": "How much is a business worth with $500k in revenue?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Revenue alone doesn't determine business value — what matters most is profitability. A business with $500,000 in revenue and $150,000 in SDE could be worth $300,000 to $600,000 depending on the industry, growth trend, and earnings multiple. A business with the same revenue but only $50,000 in earnings would be valued much lower. Use Dealio's calculator to enter your specific earnings and industry for a tailored estimate."
                }
              },
              {
                "@type": "Question",
                "name": "Should I get a professional business valuation?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A professional valuation is recommended when your business is valued above $500,000, when there are complex assets or liabilities involved, during partnership disputes or divorce proceedings, for estate and tax planning, or before entering serious negotiations with buyers. For an initial estimate or early-stage planning, Dealio's free calculator can give you a useful starting range before investing in a formal valuation."
                }
              }
            ]
          })
        }}
      />
    </>
  );
}
