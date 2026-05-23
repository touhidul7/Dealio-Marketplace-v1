import ScorecardClient from './ScorecardClient';

export const metadata = {
  title: 'Exit Readiness Scorecard | Are You Ready to Sell? | Dealio Marketplace',
  description: 'Take Dealio\'s free Exit Readiness Scorecard to assess whether your Canadian business is prepared for a successful sale. Get a personalized readiness score and next steps.',
  alternates: {
    canonical: 'https://www.dealiomarketplace.com/exit-readiness-scorecard'
  },
  openGraph: {
    title: 'Exit Readiness Scorecard | Are You Ready to Sell? | Dealio Marketplace',
    description: 'Take Dealio\'s free Exit Readiness Scorecard to assess whether your Canadian business is prepared for a successful sale. Get a personalized readiness score and next steps.',
    url: 'https://www.dealiomarketplace.com/exit-readiness-scorecard',
    type: 'website'
  }
};

export default function ExitReadinessScorecardPage() {
  return (
    <>
      <ScorecardClient />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Exit Readiness Scorecard | Are You Ready to Sell? | Dealio Marketplace",
            "description": "Take Dealio's free Exit Readiness Scorecard to assess whether your Canadian business is prepared for a successful sale.",
            "url": "https://www.dealiomarketplace.com/exit-readiness-scorecard"
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
                "name": "Exit Readiness Scorecard",
                "item": "https://www.dealiomarketplace.com/exit-readiness-scorecard"
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
                "name": "What is an exit readiness scorecard?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "An exit readiness scorecard is a self-assessment tool that helps business owners evaluate how prepared their company is for a successful sale. It examines key areas like financial documentation, owner dependency, customer concentration, growth trends, team strength, and legal compliance."
                }
              },
              {
                "@type": "Question",
                "name": "How long does it take to become exit-ready?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most business owners need 12 to 24 months to fully prepare for an exit. Key preparation steps include organizing financial records, reducing owner dependency, diversifying revenue sources, building a management team, and resolving any legal or compliance issues."
                }
              },
              {
                "@type": "Question",
                "name": "Why should I assess my exit readiness before listing my business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Assessing exit readiness helps you identify weaknesses that could reduce your business value or scare off buyers. Addressing these issues before listing can significantly increase your sale price, speed up the transaction, and improve the likelihood of a successful closing."
                }
              }
            ]
          })
        }}
      />
    </>
  );
}
