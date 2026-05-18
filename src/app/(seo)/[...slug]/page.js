import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSEOPageConfig, getListingsForSEOPage } from '@/lib/seo/seo-utils';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// Templates
import LocationSEOPage from '@/components/seo/templates/LocationSEOPage';
import IndustrySEOPage from '@/components/seo/templates/IndustrySEOPage';
import FinancialFilterSEOPage from '@/components/seo/templates/FinancialFilterSEOPage';
import CoreSEOPage from '@/components/seo/templates/CoreSEOPage';
import ComparisonSEOPage from '@/components/seo/templates/ComparisonSEOPage';
import BrokerSEOPage from '@/components/seo/templates/BrokerSEOPage';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const page = getSEOPageConfig(resolvedParams.slug);
  
  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: `/${resolvedParams.slug.join('/')}`
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `/${resolvedParams.slug.join('/')}`,
      type: 'website'
    }
  };
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
      case 'financial':
        return <FinancialFilterSEOPage page={page} listings={listings} />;
      case 'core':
        return <CoreSEOPage page={page} listings={listings} />;
      case 'comparison':
        return <ComparisonSEOPage page={page} />;
      case 'broker':
        return <BrokerSEOPage page={page} />;
      default:
        return <CoreSEOPage page={page} listings={listings} />;
    }
  };

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
            "url": `https://dealiomarketplace.com/${resolvedParams.slug.join('/')}`
          })
        }}
      />
    </main>
  );
}
