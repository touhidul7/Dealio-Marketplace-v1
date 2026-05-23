export const clusters = {
  sell: {
    name: 'Sell My Business & Valuation',
    links: [
      { text: 'Sell My Business in Canada', href: '/sell-my-business/canada' },
      { text: 'Business Valuation Calculator', href: '/business-valuation-calculator' },
      { text: 'Best Websites to Sell a Business', href: '/best-websites-to-sell-a-business-in-canada' }
    ]
  },
  buy: {
    name: 'Buy a Business & Financing',
    links: [
      { text: 'Buy a Business in Canada', href: '/buy-a-business/canada' },
      { text: 'Businesses for Sale in Canada', href: '/businesses-for-sale/canada' },
      { text: 'Best Websites to Buy a Business', href: '/best-websites-to-buy-a-business-in-canada' },
      { text: 'Featured Businesses for Sale', href: '/featured-listings' },
      { text: 'New Businesses for Sale', href: '/new-listings' }
    ]
  },
  financial: {
    name: 'Financial & Deal Quality Filters',
    links: [
      { text: 'Seller Financing Available', href: '/seller-financing-available' },
      { text: 'Businesses Under $250k', href: '/businesses-for-sale/under-250k' },
      { text: 'Businesses Under $500k', href: '/businesses-for-sale/under-500k' },
      { text: 'Businesses Under $1 Million', href: '/businesses-for-sale/under-1-million' },
      { text: 'Revenue Over $1 Million', href: '/businesses-for-sale/revenue-over-1-million' },
      { text: 'Cash Flow Over $250k', href: '/businesses-for-sale/cash-flow-over-250k' },
      { text: 'Profitable Businesses', href: '/businesses-for-sale/profitable-businesses' }
    ]
  },
  broker: {
    name: 'Broker Directory & Partnership',
    links: [
      { text: 'Business Brokers in Canada', href: '/brokers' },
      { text: 'Broker Listing Platform Canada', href: '/business-broker-listing-platform-canada' }
    ]
  },
  comparison: {
    name: 'Platform Comparisons',
    links: [
      { text: 'BizBuySell Alternatives Canada', href: '/bizbuysell-alternatives-canada' },
      { text: 'BusinessesForSale Alternatives', href: '/businessesforsale-alternatives-canada' }
    ]
  }
};

export function getRelatedLinksForPage(slug, type) {
  const allLinks = [];
  
  if (type === 'core' || slug.includes('sell-my-business')) {
    allLinks.push(...clusters.sell.links);
    allLinks.push(...clusters.buy.links);
  } else if (type === 'financial' || slug.includes('under-') || slug.includes('revenue-') || slug.includes('cash-flow-') || slug.includes('profitable-')) {
    allLinks.push(...clusters.financial.links);
    allLinks.push(...clusters.buy.links);
  } else if (type === 'broker') {
    allLinks.push(...clusters.broker.links);
    allLinks.push(...clusters.sell.links);
  } else if (type === 'comparison') {
    allLinks.push(...clusters.comparison.links);
    allLinks.push(...clusters.buy.links);
  } else if (type === 'location' || type === 'industry' || type === 'industry-location') {
    allLinks.push(...clusters.buy.links);
    allLinks.push(...clusters.financial.links);
  } else {
    allLinks.push(...clusters.buy.links);
    allLinks.push(...clusters.sell.links);
  }
  
  // Filter out link pointing to the current page itself, map to href/text format
  const currentPath = slug.startsWith('/') ? slug : `/${slug}`;
  return allLinks
    .filter(link => link.href !== currentPath)
    .map(link => link.href)
    .slice(0, 4); // return top 4 related link paths
}
