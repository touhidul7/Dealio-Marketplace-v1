import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/constants';

export async function generateMetadata({ params }) {
  const supabase = createClient();
  
  // Fetch the listing data
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!listing) {
    return {
      title: 'Listing Not Found | Dealio Marketplace',
      description: 'The requested business listing could not be found.',
    };
  }

  // Handle confidential listings
  const isConfidential = listing.confidentiality_mode === 'confidential';
  
  // Create descriptive title
  const title = `${listing.title} - ${listing.industry} Business For Sale | Dealio`;
  
  // Create description showing price and location if public
  const location = isConfidential ? 'Confidential Location' : `${listing.city || ''}, ${listing.province_state || ''}`.trim();
  const price = formatCurrency(listing.asking_price);
  
  const description = `${listing.industry} business for sale. Asking price: ${price}. Location: ${location}. ${listing.short_summary || ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://dealiomarketplace.com/listings/${params.id}`,
      images: [
        {
          url: listing.featured_image_url || 'https://dealiomarketplace.com/og-default.jpg', // Replace with your actual default OG image URL
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
      siteName: 'Dealio Marketplace',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [listing.featured_image_url || 'https://dealiomarketplace.com/og-default.jpg'],
    },
  };
}

export default function ListingLayout({ children }) {
  return <>{children}</>;
}
