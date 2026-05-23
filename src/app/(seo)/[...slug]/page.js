import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSEOPageConfig, getListingsForSEOPage } from '@/lib/seo/seo-utils';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// Templates
import LocationSEOPage from '@/components/seo/templates/LocationSEOPage';
import IndustrySEOPage from '@/components/seo/templates/IndustrySEOPage';
import IndustryLocationSEOPage from '@/components/seo/templates/IndustryLocationSEOPage';
import FinancialFilterSEOPage from '@/components/seo/templates/FinancialFilterSEOPage';
import CoreSEOPage from '@/components/seo/templates/CoreSEOPage';
import ComparisonSEOPage from '@/components/seo/templates/ComparisonSEOPage';
import BrokerSEOPage from '@/components/seo/templates/BrokerSEOPage';
import InformationalSEOPage from '@/components/seo/templates/InformationalSEOPage';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const page = getSEOPageConfig(resolvedParams.slug);
  
  if (!page) {
    return {};
  }

  const metadata = {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `https://www.dealiomarketplace.com/${resolvedParams.slug.join('/')}`
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `https://www.dealiomarketplace.com/${resolvedParams.slug.join('/')}`,
      type: 'website'
    }
  };

  // Dynamic noindex logic for industry-location pages if they have zero active listings
  if (page.type === 'industry-location') {
    try {
      const supabase = await createClient();
      const listings = await getListingsForSEOPage(page.filters, supabase);
      if (!listings || listings.length === 0) {
        metadata.robots = {
          index: false,
          follow: true
        };
      }
    } catch (err) {
      console.error('Error checking listings for metadata noindex:', err);
    }
  }

  return metadata;
}

function getFAQsForPage(page) {
  if (page.faqs) return page.faqs;
  
  const location = page.filters?.city || page.filters?.province;
  const industry = page.filters?.industry;
  
  if (page.type === 'industry-location' && industry && location) {
    return [
      {
        question: `How do I buy a ${industry.toLowerCase()} business in ${location}?`,
        answer: `To buy a ${industry.toLowerCase()} business in ${location}, start by reviewing our active listings, setting up a buyer profile, and reaching out to the listing broker or owner for confidential financials.`
      },
      {
        question: `Are there profitable ${industry.toLowerCase()} opportunities in ${location}?`,
        answer: `Yes, we host a variety of active and confidential listings. You can browse active operations, verify historical cash flows, and contact sellers directly.`
      }
    ];
  }
  
  if (page.type === 'location' && location) {
    return [
      { 
        question: `How do I buy a business in ${location}?`, 
        answer: `To buy a business in ${location}, start by browsing our active listings, creating a buyer profile, and reaching out to the sellers or brokers for confidential details.` 
      },
      { 
        question: `Are there seller-financed businesses in ${location}?`, 
        answer: `Yes, many owners offer seller financing. You can filter our listings to find seller-financed opportunities in your desired location.` 
      }
    ];
  }
  
  if (page.type === 'industry' && industry) {
    return [
      { 
        question: `Why should I buy a ${industry.toLowerCase()}?`, 
        answer: `${industry} businesses often provide stable cash flow and growth opportunities. Browse our marketplace for active listings.` 
      },
      { 
        question: `How much does a ${industry.toLowerCase()} cost?`, 
        answer: `Valuations vary widely based on revenue, cash flow, and assets. Create a free Dealio account to view asking prices and financial data.` 
      }
    ];
  }
  
  return [];
}

export default async function SEOPage({ params }) {
  const resolvedParams = await params;
  const page = getSEOPageConfig(resolvedParams.slug);

  if (!page) {
    notFound();
  }

  const supabase = await createClient();
  const listings = await getListingsForSEOPage(page.filters, supabase);

  const renderTemplate = () => {
    switch (page.type) {
      case 'location':
        return <LocationSEOPage page={page} listings={listings} />;
      case 'industry':
        return <IndustrySEOPage page={page} listings={listings} />;
      case 'industry-location':
        return <IndustryLocationSEOPage page={page} listings={listings} />;
      case 'financial':
        return <FinancialFilterSEOPage page={page} listings={listings} />;
      case 'core':
        return <CoreSEOPage page={page} listings={listings} />;
      case 'comparison':
        return page.contentSections ? <InformationalSEOPage page={page} /> : <ComparisonSEOPage page={page} />;
      case 'broker':
        return page.contentSections ? <InformationalSEOPage page={page} /> : <BrokerSEOPage page={page} />;
      case 'informational':
      case 'guide':
        return <InformationalSEOPage page={page} />;
      default:
        return <CoreSEOPage page={page} listings={listings} />;
    }
  };

  // Breadcrumbs Schema JSON-LD
  const breadcrumbsJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.dealiomarketplace.com"
      },
      ...resolvedParams.slug.map((slugPart, index) => {
        const href = `https://www.dealiomarketplace.com/${resolvedParams.slug.slice(0, index + 1).join('/')}`;
        const name = slugPart.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return {
          "@type": "ListItem",
          "position": index + 2,
          "name": name,
          "item": href
        };
      })
    ]
  };

  // FAQ Schema JSON-LD
  const faqs = getFAQsForPage(page);
  const faqJson = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // ItemList Schema JSON-LD (if listings exist)
  const itemListJson = listings && listings.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": listings.length,
    "itemListElement": listings.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.title,
      "url": `https://www.dealiomarketplace.com/listings/${item.id}`
    }))
  } : null;

  return (
    <main style={{ backgroundColor: 'var(--background)' }}>
      <div className="container">
        <Breadcrumbs slugArray={resolvedParams.slug} />
      </div>
      {renderTemplate()}
      
      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": page.title,
            "description": page.metaDescription,
            "url": `https://www.dealiomarketplace.com/${resolvedParams.slug.join('/')}`
          })
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsJson)
        }}
      />

      {faqJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJson)
          }}
        />
      )}

      {itemListJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListJson)
          }}
        />
      )}
    </main>
  );
}
