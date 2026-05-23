import CalculatorClient from './CalculatorClient';

export const metadata = {
  title: 'Business Valuation Calculator Canada | Dealio Marketplace',
  description: 'Estimate the value of a Canadian small business using revenue, EBITDA, SDE, industry, growth, and owner involvement. Get a rough valuation range and next steps for selling your business.',
  alternates: {
    canonical: 'https://www.dealiomarketplace.com/business-valuation-calculator'
  },
  openGraph: {
    title: 'Business Valuation Calculator Canada | Dealio Marketplace',
    description: 'Estimate the value of a Canadian small business using revenue, EBITDA, SDE, industry, growth, and owner involvement. Get a rough valuation range and next steps for selling your business.',
    url: 'https://www.dealiomarketplace.com/business-valuation-calculator',
    type: 'website'
  }
};

export default function BusinessValuationCalculatorPage() {
  return (
    <>
      <CalculatorClient />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Business Valuation Calculator Canada | Dealio Marketplace",
            "description": "Estimate the value of a Canadian small business using revenue, EBITDA, SDE, industry, growth, and owner involvement.",
            "url": "https://www.dealiomarketplace.com/business-valuation-calculator"
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
                "name": "How accurate is this business valuation calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It provides a rough educational estimate only. A formal valuation requires detailed financials, add-backs, assets, liabilities, working capital, market demand, and deal structure review."
                }
              },
              {
                "@type": "Question",
                "name": "What is SDE?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Seller discretionary earnings represent the financial benefit available to one owner-operator after adjusting for certain owner-related or discretionary expenses."
                }
              },
              {
                "@type": "Question",
                "name": "What is EBITDA?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "EBITDA means earnings before interest, taxes, depreciation, and amortization. It is often used to compare operating performance across businesses."
                }
              },
              {
                "@type": "Question",
                "name": "What multiple should I use to value my business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The multiple depends on industry, size, profitability, growth, transferability, recurring revenue, customer concentration, and buyer demand."
                }
              },
              {
                "@type": "Question",
                "name": "Can I list my business after using the calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. After estimating a rough value, owners can create a seller profile and list their business on Dealio Marketplace."
                }
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
                "name": "Business Valuation Calculator",
                "item": "https://www.dealiomarketplace.com/business-valuation-calculator"
              }
            ]
          })
        }}
      />
    </>
  );
}
