const provinces = [
  'Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 
  'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland', 
  'Prince Edward Island', 'Yukon', 'Northwest Territories', 'Nunavut'
];

const citiesByProvince = {
  'Ontario': ['Toronto', 'Mississauga', 'Ottawa', 'Hamilton', 'London', 'Vaughan', 'Markham', 'Brampton'],
  'British Columbia': ['Vancouver', 'Surrey', 'Victoria'],
  'Alberta': ['Calgary', 'Edmonton'],
  'Quebec': ['Montreal', 'Quebec City'],
  'Manitoba': ['Winnipeg'],
  'Saskatchewan': ['Saskatoon', 'Regina'],
  'Nova Scotia': ['Halifax'],
  'New Brunswick': ['Moncton']
};

const industries = [
  'HVAC', 'Cleaning Businesses', 'Restaurants', 'Dental Practices', 
  'Physiotherapy Clinics', 'Med Spas', 'Ecommerce', 'Shopify Stores', 
  'Manufacturing', 'Landscaping', 'Plumbing', 'Electrical', 'Auto Repair', 
  'Accounting Firms', 'Law Firms', 'Childcare Centres', 'Senior Care', 
  'Franchises', 'SaaS', 'Distribution', 'Convenience Stores', 
  'Gas Stations', 'Fitness Studios', 'Construction', 'Digital Businesses'
];

const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

const seoPages = [];

// Core Pages
const corePages = [
  { slug: 'businesses-for-sale/canada', type: 'core', h1: 'Businesses for Sale in Canada', filters: { country: 'Canada' } },
  { slug: 'sell-my-business/canada', type: 'core', h1: 'Sell My Business in Canada', ctaType: 'seller', relatedLinks: ['/business-valuation-calculator', '/best-websites-to-sell-a-business-in-canada'] },
  { slug: 'buy-a-business/canada', type: 'core', h1: 'Buy a Business in Canada', ctaType: 'buyer' },
  { slug: 'brokers', type: 'broker', h1: 'Business Brokers in Canada', ctaType: 'buyer' },
  { slug: 'buyer-alerts', type: 'core', h1: 'Business Buyer Alerts', ctaType: 'buyer-alert' },
  { slug: 'featured-listings', type: 'core', h1: 'Featured Businesses for Sale', filters: { featured: true } },
  { slug: 'new-listings', type: 'core', h1: 'New Businesses for Sale', filters: { new_listings: true } },
  { slug: 'confidential-listings', type: 'core', h1: 'Confidential Business Listings', filters: { confidential: true }, relatedLinks: ['/business-valuation-calculator', '/owner-listed-businesses'] },
  { slug: 'owner-listed-businesses', type: 'core', h1: 'Owner-Listed Businesses for Sale', filters: { listing_source: 'owner' }, relatedLinks: ['/business-valuation-calculator', '/businesses-for-sale/canada'] },
  { slug: 'brokered-businesses', type: 'core', h1: 'Brokered Businesses for Sale', filters: { listing_source: 'broker' }, relatedLinks: ['/business-valuation-calculator', '/businesses-for-sale/canada'] },
  { slug: 'seller-financing-available', type: 'financial', h1: 'Businesses with Seller Financing Available', filters: { seller_financing_available: true } },
  { slug: 'businesses-for-sale/under-500k', type: 'financial', h1: 'Businesses for Sale Under $500k', filters: { max_price: 500000 } },
  { slug: 'businesses-for-sale/under-1-million', type: 'financial', h1: 'Businesses for Sale Under $1 Million', filters: { max_price: 1000000 } },
  { slug: 'businesses-for-sale/revenue-over-1-million', type: 'financial', h1: 'Businesses with Revenue Over $1 Million', filters: { min_revenue: 1000000 } }
];

corePages.forEach(page => {
  seoPages.push({
    ...page,
    title: `${page.h1} | Dealio Marketplace`,
    metaDescription: `Explore ${page.h1.toLowerCase()} on Dealio Marketplace. Find acquisition opportunities, confidential listings, and more.`,
    intro: `Discover top opportunities for ${page.h1.toLowerCase()}.`,
    relatedLinks: page.relatedLinks || ['/businesses-for-sale/canada', '/businesses-for-sale/ontario', '/businesses-for-sale/under-500k'],
    indexable: true
  });
});

// Province Pages
provinces.forEach(province => {
  seoPages.push({
    slug: `businesses-for-sale/${slugify(province)}`,
    type: 'location',
    title: `Businesses for Sale in ${province} | Dealio Marketplace`,
    metaDescription: `Browse businesses for sale in ${province}, including owner-listed, brokered, confidential, and seller-financed opportunities.`,
    h1: `Businesses for Sale in ${province}`,
    intro: `Find acquisition opportunities across ${province}.`,
    filters: { province },
    ctaType: 'buyer-alert',
    relatedLinks: ['/businesses-for-sale/canada', '/seller-financing-available'],
    indexable: true
  });
});

// City Pages
Object.entries(citiesByProvince).forEach(([province, cities]) => {
  cities.forEach(city => {
    seoPages.push({
      slug: `businesses-for-sale/${slugify(province)}/${slugify(city)}`,
      type: 'location',
      title: `Businesses for Sale in ${city}, ${province} | Dealio Marketplace`,
      metaDescription: `Browse businesses for sale in ${city}, ${province}. Discover acquisition opportunities in ${city}.`,
      h1: `Businesses for Sale in ${city}`,
      intro: `Explore businesses for sale in ${city}, ${province}.`,
      filters: { province, city },
      ctaType: 'buyer-alert',
      relatedLinks: [`/businesses-for-sale/${slugify(province)}`, '/businesses-for-sale/canada'],
      indexable: true
    });
  });
});

// Industry Pages
industries.forEach(industry => {
  seoPages.push({
    slug: `businesses-for-sale/${slugify(industry)}`,
    type: 'industry',
    title: `${industry} for Sale in Canada | Dealio Marketplace`,
    metaDescription: `Browse ${industry.toLowerCase()} for sale across Canada.`,
    h1: `${industry} for Sale`,
    intro: `Find top ${industry.toLowerCase()} for sale. Explore confidential and brokered listings.`,
    filters: { industry },
    ctaType: 'buyer-alert',
    relatedLinks: ['/businesses-for-sale/canada', '/businesses-for-sale/ontario'],
    indexable: true
  });
});

// Comparison Pages
const comparisonPages = [
  'bizbuysell-alternatives-canada',
  'businessesforsale-alternatives-canada',
  'best-websites-to-buy-a-business-in-canada',
  'best-websites-to-sell-a-business-in-canada',
  'business-broker-listing-platform-canada'
];

comparisonPages.forEach(slug => {
  const h1 = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  seoPages.push({
    slug,
    type: 'comparison',
    title: `${h1} | Dealio Marketplace`,
    metaDescription: `Looking for ${h1.toLowerCase()}? Learn why Dealio Marketplace is the premier choice in Canada.`,
    h1,
    intro: `Discover the top choices for ${h1.toLowerCase()} and see how Dealio Marketplace stands out.`,
    ctaType: 'buyer',
    relatedLinks: slug === 'best-websites-to-sell-a-business-in-canada' ? ['/business-valuation-calculator', '/sell-my-business/canada'] : ['/buy-a-business/canada', '/sell-my-business/canada'],
    indexable: true
  });
});

export default seoPages;
