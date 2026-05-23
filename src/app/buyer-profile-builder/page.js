import ProfileBuilderClient from './ProfileBuilderClient';

export const metadata = {
  title: 'Buyer Profile Builder | Find Your Ideal Business | Dealio Marketplace',
  description: 'Build your ideal buyer profile on Dealio Marketplace. Define your industry preferences, deal size, location, and acquisition timeline to get matched with the perfect Canadian business.',
  alternates: {
    canonical: 'https://www.dealiomarketplace.com/buyer-profile-builder'
  },
  openGraph: {
    title: 'Buyer Profile Builder | Find Your Ideal Business | Dealio Marketplace',
    description: 'Build your ideal buyer profile on Dealio Marketplace. Define your industry preferences, deal size, location, and acquisition timeline to get matched with the perfect Canadian business.',
    url: 'https://www.dealiomarketplace.com/buyer-profile-builder',
    type: 'website'
  }
};

export default function BuyerProfileBuilderPage() {
  return (
    <>
      <ProfileBuilderClient />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Buyer Profile Builder | Find Your Ideal Business | Dealio Marketplace",
            "description": "Build your ideal buyer profile on Dealio Marketplace. Define your industry preferences, deal size, location, and acquisition timeline to get matched with the perfect Canadian business.",
            "url": "https://www.dealiomarketplace.com/buyer-profile-builder"
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
                "name": "Buyer Profile Builder",
                "item": "https://www.dealiomarketplace.com/buyer-profile-builder"
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
                "name": "What is a buyer profile builder?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A buyer profile builder is an interactive tool that helps prospective business buyers define their acquisition criteria—including preferred industries, deal sizes, locations, and financing plans. This helps marketplaces like Dealio match buyers with suitable, high-quality businesses for sale."
                }
              },
              {
                "@type": "Question",
                "name": "How does defining a buyer profile help me buy a business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "By clearly defining your buyer profile, you receive targeted listings that match your criteria, saving you hours of manual searching. It also demonstrates to sellers, brokers, and financing partners that you are a serious, organized, and qualified acquirer."
                }
              },
              {
                "@type": "Question",
                "name": "What criteria should I include in my buyer profile?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your buyer profile should outline your buyer type (e.g. individual operator, strategic acquirer), target industries (e.g. HVAC, SaaS), budget and deal size constraints, geographical location preferences, and your acquisition timeline."
                }
              }
            ]
          })
        }}
      />
    </>
  );
}
