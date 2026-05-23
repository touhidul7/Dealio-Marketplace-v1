import { getRelatedLinksForPage } from './internal-linking.js';

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
  { slug: 'sell-my-business/canada', type: 'core', h1: 'Sell My Business in Canada', ctaType: 'seller' },
  { slug: 'buy-a-business/canada', type: 'core', h1: 'Buy a Business in Canada', ctaType: 'buyer' },
  { slug: 'brokers', type: 'broker', h1: 'Business Brokers in Canada', ctaType: 'buyer' },
  { slug: 'buyer-alerts', type: 'core', h1: 'Business Buyer Alerts', ctaType: 'buyer-alert' },
  { slug: 'featured-listings', type: 'core', h1: 'Featured Businesses for Sale', filters: { featured: true } },
  { slug: 'new-listings', type: 'core', h1: 'New Businesses for Sale', filters: { new_listings: true } },
  { slug: 'confidential-listings', type: 'core', h1: 'Confidential Business Listings', filters: { confidential: true } },
  { slug: 'owner-listed-businesses', type: 'core', h1: 'Owner-Listed Businesses for Sale', filters: { listing_source: 'owner' } },
  { slug: 'brokered-businesses', type: 'core', h1: 'Brokered Businesses for Sale', filters: { listing_source: 'broker' } },
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
    relatedLinks: getRelatedLinksForPage(page.slug, page.type),
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
    relatedLinks: getRelatedLinksForPage(`businesses-for-sale/${slugify(province)}`, 'location'),
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
      relatedLinks: getRelatedLinksForPage(`businesses-for-sale/${slugify(province)}/${slugify(city)}`, 'location'),
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
    relatedLinks: getRelatedLinksForPage(`businesses-for-sale/${slugify(industry)}`, 'industry'),
    indexable: true
  });
});

// Target Combined Industry + Location Pages
const combinedLocations = [
  { name: 'Ontario', type: 'province', filters: { province: 'Ontario' }, slugPart: 'ontario' },
  { name: 'Toronto', type: 'city', filters: { province: 'Ontario', city: 'Toronto' }, slugPart: 'ontario/toronto' },
  { name: 'British Columbia', type: 'province', filters: { province: 'British Columbia' }, slugPart: 'british-columbia' },
  { name: 'Alberta', type: 'province', filters: { province: 'Alberta' }, slugPart: 'alberta' }
];

combinedLocations.forEach(loc => {
  industries.forEach(industry => {
    const slug = `businesses-for-sale/${loc.slugPart}/${slugify(industry)}`;
    seoPages.push({
      slug,
      type: 'industry-location',
      title: `${industry} for Sale in ${loc.name}, ${loc.type === 'city' ? 'ON' : 'Canada'} | Dealio Marketplace`,
      metaDescription: `Find ${industry.toLowerCase()} for sale in ${loc.name}. Browse local listings, confidential sales, and owner-financed deals.`,
      h1: `${industry} for Sale in ${loc.name}`,
      intro: `Explore premier ${industry.toLowerCase()} acquisition opportunities in ${loc.name}.`,
      filters: { ...loc.filters, industry },
      ctaType: 'buyer-alert',
      relatedLinks: getRelatedLinksForPage(slug, 'industry-location'),
      indexable: true // Overridden dynamically by noindex logic if listings count is 0
    });
  });
});

// Financial Pages
const financialPages = [
  { slug: 'businesses-for-sale/under-250k', h1: 'Businesses for Sale Under $250k', filters: { max_price: 250000 } },
  { slug: 'businesses-for-sale/cash-flow-over-250k', h1: 'Businesses for Sale with Cash Flow Over $250k', filters: { min_cash_flow: 250000 } },
  { slug: 'businesses-for-sale/absentee-owner', h1: 'Absentee Owner Businesses for Sale', filters: { absentee_owner: true }, partial: true },
  { slug: 'businesses-for-sale/recurring-revenue', h1: 'Recurring Revenue Businesses for Sale', filters: { recurring_revenue: true }, partial: true },
  { slug: 'businesses-for-sale/cash-flow-businesses', h1: 'High Cash Flow Businesses for Sale', filters: { min_cash_flow: 100000 } },
  { slug: 'businesses-for-sale/profitable-businesses', h1: 'Profitable Businesses for Sale', filters: { profitable: true } }
];

financialPages.forEach(page => {
  seoPages.push({
    slug: page.slug,
    type: 'financial',
    title: `${page.h1} | Dealio Marketplace`,
    metaDescription: `Browse ${page.h1.toLowerCase()} in Canada. Find verified listings with detailed financial performance data.`,
    h1: page.h1,
    intro: `Explore top verified listings for ${page.h1.toLowerCase()} across Canada.`,
    filters: page.filters,
    ctaType: 'buyer-alert',
    partial: page.partial || false,
    relatedLinks: getRelatedLinksForPage(page.slug, 'financial'),
    indexable: true,
    faqs: [
      {
        question: `How are financial metrics verified for ${page.h1.toLowerCase()}?`,
        answer: "We aggregate financial details directly from owners and verified broker listings. We encourage buyers to conduct rigorous financial due diligence and review tax filings before making an offer."
      },
      {
        question: "Can I get financing to buy these businesses?",
        answer: "Yes, many of these businesses qualify for SBA/CSBFL loans, seller financing, or conventional acquisition loans depending on SDE size and buyer background."
      }
    ]
  });
});

// Comparison Pages (Phases 1-3 & Phase 5 additions)
const comparisonPages = [
  { slug: 'bizbuysell-alternatives-canada', h1: 'BizBuySell Alternatives Canada' },
  { slug: 'businessesforsale-alternatives-canada', h1: 'BusinessesForSale Alternatives Canada' },
  { slug: 'best-websites-to-buy-a-business-in-canada', h1: 'Best Websites to Buy a Business in Canada' },
  { slug: 'best-websites-to-sell-a-business-in-canada', h1: 'Best Websites to Sell a Business in Canada' },
  { slug: 'business-broker-listing-platform-canada', h1: 'Business Broker Listing Platform Canada' },
  {
    slug: 'flippa-alternatives-canada',
    h1: 'Flippa Alternatives in Canada',
    intro: 'Flippa is a global marketplace, but it lacks local Canadian support, escrow, and brick-and-mortar integrations. Discover why Canadian buyers and sellers choose Dealio.',
    contentSections: [
      {
        title: 'Why Choose Dealio Over Flippa?',
        bulletPoints: [
          'Tailored specifically for Canadian business transactions, currency, and tax regulations.',
          'Verifies physical and digital businesses with local validation protocols.',
          'Direct local broker connections and legal advisory networks in Canada.',
          'Zero buyer fees and transparent transaction pricing.'
        ]
      }
    ]
  },
  {
    slug: 'empire-flippers-alternatives-canada',
    h1: 'Empire Flippers Alternatives in Canada',
    intro: 'Empire Flippers charges high listing fees and is tailored for global e-commerce deals. Dealio Marketplace offers a local, cost-effective alternative for Canadian digital and brick-and-mortar businesses.',
    contentSections: [
      {
        title: 'The Local Canadian Advantage',
        text: 'Unlike global platforms, Dealio bridges the gap between digital SaaS operations and local brick-and-mortar service industries in Canada, facilitating secure, localized business transitions at a fraction of the cost.'
      }
    ]
  }
];

comparisonPages.forEach(page => {
  seoPages.push({
    slug: page.slug,
    type: 'comparison',
    title: `${page.h1} | Dealio Marketplace`,
    metaDescription: `Looking for ${page.h1.toLowerCase()}? Learn why Dealio Marketplace is the premier choice in Canada.`,
    h1: page.h1,
    intro: page.intro || `Discover the top choices for ${page.h1.toLowerCase()} and see how Dealio Marketplace stands out.`,
    ctaType: 'buyer',
    contentSections: page.contentSections || null,
    relatedLinks: getRelatedLinksForPage(page.slug, 'comparison'),
    indexable: true,
    faqs: [
      {
        question: `Why choose Dealio Marketplace over other platforms?`,
        answer: "Dealio is built specifically for the Canadian small business market. We offer verified listings, direct buyer-seller messaging, modern interfaces, and zero buyer fees."
      },
      {
        question: "Is Dealio Marketplace free for buyers?",
        answer: "Yes. Searching, filtering, and contacting sellers/brokers is completely free for buyers on Dealio Marketplace."
      }
    ]
  });
});

// Informational & Guide Pages (Phase 5)
const informationalPages = [
  {
    slug: 'best-time-to-sell-business',
    type: 'informational',
    h1: 'When is the Best Time to Sell a Business?',
    metaDescription: 'Learn how to identify the perfect window to sell your Canadian business to maximize your valuation and ensure a clean, structured transition.',
    intro: 'Timing is everything in business acquisitions. Discover the key indicators—both internal and macroeconomic—that signal the optimal window to exit your company.',
    ctaType: 'seller',
    contentSections: [
      {
        title: '1. The Rule of Personal Exit Readiness',
        text: 'Many owners wait until they are burnt out or experiencing health issues to sell. The best time to sell is when the business is thriving and you are personally energized to assist with a smooth transition. Selling at peak financial performance commands the highest multiple.'
      },
      {
        title: '2. Macroeconomic Trends & Interest Rates',
        text: 'A strong economy with low interest rates creates a fertile environment for buyers. High cost-of-capital environments can lower the price a buyer can pay. Monitor business cycle metrics to secure buyer financing availability.'
      },
      {
        title: '3. Financial Performance Cycle',
        text: 'Buyers evaluate your trailing 3 years of financial records. An exit is best planned after at least two consecutive years of revenue and profit growth.'
      },
      {
        title: 'Summary Timeline Recommendation',
        bulletPoints: [
          'Plan your exit at least 12 to 24 months in advance.',
          'Organize your CPA compiled statements (Notice to Reader) beforehand.',
          'Document all operational workflows to prove transferability.'
        ]
      }
    ],
    faqs: [
      { question: 'What is the average timeline to sell a small business?', answer: 'The selling process typically takes between 6 to 10 months from the initial listing to finalized closing documents.' },
      { question: 'Should I sell my business during a slow season?', answer: 'It is highly recommended to list your business when you can show strong trailing twelve months (TTM) performance, regardless of seasonality.' }
    ]
  },
  {
    slug: 'sell-business-online-canada',
    type: 'informational',
    h1: 'How to Sell a Business Online in Canada',
    metaDescription: 'Step-by-step guide to listing, marketing, and selling your Canadian business online while maintaining strict operational confidentiality.',
    intro: 'Digital platforms have revolutionized business acquisitions. Learn how to securely list, market, and sell your Canadian business online while protecting your brand.',
    ctaType: 'seller',
    contentSections: [
      {
        title: '1. Prepare the Dynamic Documentation',
        text: 'Before going online, compile all key financials, corporate structures, customer risk assessments, and lease transfer documentation. Package this into a Confidential Information Memorandum (CIM).'
      },
      {
        title: '2. Design a Blind Profile',
        text: 'To protect your business confidentiality, create an online profile that details the industry, region, revenue, and cash flow, but excludes the business name, exact address, or any defining brand assets.'
      },
      {
        title: '3. Screen Buyers Virtually',
        text: 'Utilize Dealio\'s direct messaging tools to screen buyers, verify their acquisition budget, and execute standard Non-Disclosure Agreements (NDAs) before sharing the CIM.'
      }
    ],
    faqs: [
      { question: 'How do I maintain confidentiality when selling a business online?', answer: 'Use a blind listing—describing the business characteristics and financials without revealing the name or precise location until a signed NDA is executed.' },
      { question: 'Can I sell my Canadian business online without a broker?', answer: 'Yes, platforms like Dealio Marketplace empower owners to list For Sale By Owner (FSBO), communicate directly with verified buyers, and save on broker fees.' }
    ]
  },
  {
    slug: 'list-business-for-sale-canada',
    type: 'informational',
    h1: 'How to List a Business for Sale in Canada',
    metaDescription: 'Learn how to list a business for sale in Canada. Master listing structure, valuation benchmarks, and buyer screening procedures.',
    intro: 'Listing your business is more than posting an ad. It requires structuring a compelling value proposition that commands buyer attention and passes due diligence.',
    ctaType: 'seller',
    contentSections: [
      {
        title: '1. Set an Accurate Asking Price',
        text: 'An unrealistic price is the #1 reason business listings stagnate. Use an EBITDA or SDE valuation multiple based on comparable transaction history in your Canadian province.'
      },
      {
        title: '2. Write a Compelling blind Listing',
        text: 'Highlight key business highlights such as recurring revenue, long-term staff, premier location, or exclusive vendor partnerships in your blind profile.'
      },
      {
        title: '3. Leverage Multi-Channel Exposure',
        text: 'Deploy your listing on specialized Canadian marketplaces like Dealio to reach verified local and international buyers actively searching for acquisitions.'
      }
    ],
    faqs: [
      { question: 'What details are required to list my business?', answer: 'You need key financial metrics (annual revenue, SDE/EBITDA), operational details (staff count, owner hours), physical assets valuation, and lease parameters.' }
    ]
  },
  {
    slug: 'sell-business-without-broker',
    type: 'informational',
    h1: 'How to Sell a Business Without a Broker in Canada',
    metaDescription: 'Save up to 10% in commissions. Learn how to list, negotiate, and close the sale of your Canadian business on your own terms.',
    intro: 'Selling a business without a broker (FSBO) allows you to keep 100% of your transaction proceeds. Discover the step-by-step operational blueprint to sell independently.',
    ctaType: 'seller',
    contentSections: [
      {
        title: '1. Understand the Role of a Broker',
        text: 'Brokers specialize in packaging documents, finding buyers, and managing negotiations. When going DIY, you must take charge of screening buyers, preparing the CIM, and coordinating with a corporate lawyer for transaction closing.'
      },
      {
        title: '2. Save on Commission Fees',
        text: 'Business broker commissions typically range from 8% to 12% of the final sale price. On a $500k sale, selling independently saves you up to $50,000 in transaction costs.'
      },
      {
        title: '3. Partner with an M&A Lawyer',
        text: 'While you can manage marketing and buyer vetting yourself, always hire an experienced transaction lawyer to draft the Letter of Intent (LOI) response and the final Asset or Share Purchase Agreement.'
      }
    ],
    faqs: [
      { question: 'Is it legal to sell my business without a broker in Canada?', answer: 'Absolutely. Business owners have full legal rights to list, negotiate, and sell their corporate assets directly to any buyer.' }
    ]
  },
  {
    slug: 'best-businesses-to-buy-in-canada',
    type: 'informational',
    h1: 'Best Businesses to Buy in Canada',
    metaDescription: 'Explore the top-rated small businesses and franchises to buy in Canada based on stability, cash flow, and market growth trends.',
    intro: 'Choosing the right business to acquire determines your future success. Explore the highly recommended business categories across Canada based on cash-flow resilience and growth.',
    ctaType: 'buyer',
    contentSections: [
      {
        title: '1. Essential Service Verticals',
        text: 'Home services (HVAC, plumbing, electrical) are highly resilient to economic downturns. They provide essential, non-discretionary services with high local demand.'
      },
      {
        title: '2. B2B Commercial Contracts',
        text: 'Commercial cleaning, landscaping, and waste management businesses boast recurring contract revenue, providing stable, predictable cash flows.'
      },
      {
        title: '3. Professional Services & Clinics',
        text: 'Dental, physiotherapy, and chiropractic practices feature high barrier-to-entry, recurring patient bases, and premium margins.'
      }
    ],
    faqs: [
      { question: 'What is the most profitable business to buy?', answer: 'Resilient, service-based businesses with high recurring revenue (like HVAC or SaaS) typically yield the highest returns on investment.' }
    ]
  },
  {
    slug: 'what-type-of-business-should-i-buy',
    type: 'informational',
    h1: 'What Type of Business Should I Buy?',
    metaDescription: 'Struggling to choose? Our diagnostic profiling guide matches your operational background, budget, and lifestyle goals with the ideal acquisition.',
    intro: 'Acquiring a business is a major lifestyle and financial commitment. Align your personal strengths, capital constraints, and daily preferences with the correct sector.',
    ctaType: 'buyer',
    contentSections: [
      {
        title: '1. Assess Your Operational Strengths',
        text: 'Are you a strong sales leader, a technical expert, or a systems manager? Match your vocational strengths to the business model—SaaS requires tech product mastery, whereas retail demands high consumer engagement.'
      },
      {
        title: '2. Capital and Financing Limits',
        text: 'Determine your liquid capital. An acquisition typically requires 15% to 25% of the purchase price in cash, with the remainder funded via bank financing or seller notes.'
      },
      {
        title: '3. Lifestyle & Time Commitments',
        text: 'Decide whether you want an owner-operator role (demanding 40+ hours per week) or an absentee/semi-absentee investment managed by a general manager.'
      }
    ],
    faqs: [
      { question: 'Should I buy a business in an industry I have no experience in?', answer: 'While experience is helpful, many buyers succeed in new fields by retaining the existing management team and securing seller transition training.' }
    ]
  },
  {
    slug: 'buying-a-business-vs-starting-one',
    type: 'informational',
    h1: 'Buying a Business vs Starting One',
    metaDescription: 'Compare buying an existing cash-flowing business vs launching a startup. Analyze risk profile, cash flow timelines, and acquisition financing advantages.',
    intro: 'Discover why acquiring an established business has a 90%+ success rate compared to the high-failure rate of launching a brand new startup.',
    ctaType: 'buyer',
    contentSections: [
      {
        title: 'Comparison Analysis',
        table: {
          headers: ['Feature', 'Buying Existing', 'Starting New'],
          rows: [
            ['Immediate Cash Flow', 'Yes, from day one', 'No, takes months or years'],
            ['Success Rate', 'Over 90% after 5 years', 'Under 20% after 5 years'],
            ['Acquisition Financing', 'Eligible for SBA/CSBFL loans', 'Extremely difficult to secure'],
            ['Established Systems', 'Yes (staff, SOPs, brand)', 'No, must build from scratch'],
            ['Customer Base', 'Active, loyal customer relationships', 'None, must acquire manually']
          ]
        }
      },
      {
        title: '1. Why Existing Cash Flow Rules',
        text: 'An existing business has customer traction, trained employees, operational premises, and proven historical profits. This dramatically reduces investment risk and allows you to cover debt service from operational cash flow.'
      }
    ],
    faqs: [
      { question: 'Why is buying a business safer than starting one?', answer: 'Established operations have verified cash flow, customer demand, and active marketing channels, eliminating early-stage market validation risks.' }
    ]
  },
  {
    slug: 'best-industries-to-buy-business-canada',
    type: 'informational',
    h1: 'Best Industries to Buy a Business in Canada',
    metaDescription: 'Learn about the top performing Canadian business sectors, including service trades, medical clinics, B2B services, and digital businesses.',
    intro: 'Discover the top Canadian business sectors based on cash-flow resilience, barrier-to-entry, growth runway, and availability of bank financing.',
    ctaType: 'buyer',
    contentSections: [
      {
        title: '1. Service Trades (HVAC, Plumbing, Electrical)',
        text: 'Trades are in high demand across Canada due to infrastructure growth and housing demand. These businesses are highly fragmented, making them prime targets for roll-up acquisitions.'
      },
      {
        title: '2. Health & Medical Clinics',
        text: 'Physiotherapy, dental, and medical spas offer high margins, highly recurring customer lists, and resilient healthcare demand.'
      },
      {
        title: '3. Professional & Business Services (B2B)',
        text: 'Accounting firms, commercial cleaning, and IT services benefit from high client loyalty, corporate contracts, and steady recurring revenue.'
      }
    ],
    faqs: [
      { question: 'What is a fragmented industry?', answer: 'An industry with many small local competitors and no single dominant corporation. Fragmented sectors are ideal for buy-and-build consolidation strategies.' }
    ]
  },
  {
    slug: 'ebitda-vs-sde',
    type: 'informational',
    h1: 'EBITDA vs SDE Explained',
    metaDescription: 'Confused by business valuation terms? Learn the exact differences between EBITDA and SDE, how to calculate them, and when to use each metric.',
    intro: 'EBITDA and SDE are the two primary profit metrics used to value small-to-medium enterprises. Understand how they are calculated, how they differ, and when to apply them.',
    ctaType: 'buyer',
    contentSections: [
      {
        title: 'Quick Comparison',
        table: {
          headers: ['Metric', 'Definition', 'Target Business Size'],
          rows: [
            ['SDE (Seller Discretionary Earnings)', 'Net profit + owner salary + personal benefits + non-recurring expenses', 'Under $1 Million in enterprise value (owner-operated)'],
            ['EBITDA', 'Earnings Before Interest, Taxes, Depreciation, and Amortization', 'Over $1 Million in value (management-run)']
          ]
        }
      },
      {
        title: '1. SDE: Owner-Operator Valuation',
        text: 'SDE calculates the total financial benefit available to a single full-time owner-operator. It adds back the owner\'s compensation, personal vehicle expenses, health insurance, and one-time capital expenditures to the bottom-line net income.'
      },
      {
        title: '2. EBITDA: Corporate Valuation',
        text: 'EBITDA measures a business\'s operational profitability independent of its capital structure, tax environment, or non-cash accounting policies. It is used when a business is run by a management team without daily owner involvement.'
      }
    ],
    faqs: [
      { question: 'Why do buyers use SDE instead of net profit?', answer: 'Net profits on tax returns are minimized for tax purposes. SDE reveals the true cash flow generated by the business for an active owner.' }
    ]
  },
  
  // Interactive Lead Magnet Download Pages (Phase 5)
  {
    slug: 'seller-document-checklist',
    type: 'guide',
    h1: 'Seller Document Checklist',
    metaDescription: 'Preparing to sell your Canadian business? Use our interactive checklist to track and organize all necessary legal, financial, and operational files required for due diligence.',
    intro: 'Due diligence can make or break a business sale. Use our interactive document tracker to compile and organize everything before meeting potential buyers.',
    ctaType: 'seller',
    interactiveType: 'checklist',
    checklistItems: [
      'CPA-compiled financial statements for the past 3 years (compiled or reviewed)',
      'Detailed list of corporate assets, equipment, inventory, and intellectual property',
      'Active customer lists showing revenue concentration metrics',
      'Active commercial lease agreements, extensions, and landlord consents',
      'Active employee contracts, organization charts, and payroll registry',
      'Incorporation documents, corporate registers, and active business licenses',
      'Standard Operating Procedures (SOPs) for all key business workflows'
    ]
  },
  {
    slug: 'buyer-due-diligence-checklist',
    type: 'guide',
    h1: 'Buyer Due Diligence Checklist',
    metaDescription: 'Acquiring a business? Use our interactive due diligence checklist to systematically audit the financial, operational, and legal health of your target company.',
    intro: 'Perform due diligence like a professional private equity firm. Track and check off each investigative audit step using our interactive dashboard.',
    ctaType: 'buyer',
    interactiveType: 'checklist',
    checklistItems: [
      'Reconcile bank statements against QuickBooks or ledger entries',
      'Verify tax filings (CRA corporate tax returns and GST/HST payments)',
      'Review customer concentration: verify top customer billing records',
      'Interview key employees to confirm operational continuity plans',
      'Inspect physical assets, inventory counts, and equipment conditions',
      'Audit customer contracts, supplier agreements, and commercial leases',
      'Confirm no active legal disputes, worker compensation claims, or tax liens'
    ]
  },
  {
    slug: 'loi-template-download',
    type: 'guide',
    h1: 'LOI Template Download',
    metaDescription: 'Structure your deal professionally. Download our free, lawyer-reviewed Letter of Intent (LOI) template designed for Canadian business acquisitions.',
    intro: 'Submit a structured, highly credible offer. Enter your credentials below to download our lawyer-compiled Letter of Intent (LOI) template.',
    ctaType: 'buyer',
    interactiveType: 'download',
    contentSections: [
      {
        title: 'What is a Letter of Intent (LOI)?',
        text: 'A Letter of Intent is a formal document drafted by a buyer to outline the proposed transaction price, deal structure (cash, debt, seller note), due diligence timeline, and exclusivity periods. It serves as the foundation for the binding purchase agreement.'
      }
    ]
  },
  {
    slug: 'cim-teaser-template',
    type: 'guide',
    h1: 'CIM Teaser Template',
    metaDescription: 'Package your business for sale. Download our professional blind teaser template to capture buyer interest while protecting your operational confidentiality.',
    intro: 'Structure your marketing package securely. Download our professional blind business teaser template to engage serious buyer interest.',
    ctaType: 'seller',
    interactiveType: 'download',
    contentSections: [
      {
        title: 'The Power of a Professional Teaser',
        text: 'A blind teaser or one-pager outlines key financial benchmarks, business highlights, and location characteristics without revealing the name of the company. It is the primary marketing document used to attract buyers before signing an NDA.'
      }
    ]
  },
  {
    slug: 'confidential-sale-guide',
    type: 'guide',
    h1: 'Confidential Sale Guide',
    metaDescription: 'Protect your business reputation. Download our comprehensive guide outlining exactly how to market and sell your business without alerting competitors or staff.',
    intro: 'Maintain strict operational secrecy. Download our full-length guide detailing how to list and navigate a business transition quietly.',
    ctaType: 'seller',
    interactiveType: 'download',
    contentSections: [
      {
        title: 'Why Confidentiality is Critical',
        text: 'An unmanaged leak of a business sale can lead to staff turnover, customer defection, and competitor attacks. Learn the structured protocols to manage information flow securely.'
      }
    ]
  },
  {
    slug: 'broker-vs-diy-comparison-guide',
    type: 'guide',
    h1: 'Broker vs DIY Comparison Guide',
    metaDescription: 'Analyze your options. Download our guide comparing the costs, timelines, and success parameters of selling with a broker vs selling independently (FSBO).',
    intro: 'Should you list independently or hire a professional? Download our structural analysis outlining commissions, timelines, and execution parameters.',
    ctaType: 'seller',
    interactiveType: 'download',
    contentSections: [
      {
        title: 'Weighing Your Exit Options',
        text: 'Understand the trade-offs between pay-on-close broker representation and direct For Sale By Owner (FSBO) marketing. Make an informed decision based on your deal size and operational bandwidth.'
      }
    ]
  },
  {
    slug: 'acquisition-financing-guide',
    type: 'guide',
    h1: 'Acquisition Financing Guide',
    metaDescription: 'Unlock acquisition capital. Download our guide detailing SBA loans, Canada Small Business Financing Program (CSBFL), equity structures, and VTBs.',
    intro: 'Leverage other people\'s capital. Download our complete acquisition financing handbook and structure loans for your business purchase.',
    ctaType: 'buyer',
    interactiveType: 'download',
    contentSections: [
      {
        title: 'Funding Your Acquisition in Canada',
        text: 'Learn how to leverage bank loans, equity partners, and creative seller financing notes to acquire businesses valued up to $5 Million with as little as 10% cash down.'
      }
    ]
  },

  // Broker Partner Pages (Phase 6)
  {
    slug: 'broker-lead-generation',
    type: 'broker',
    h1: 'Lead Generation for Business Brokers',
    metaDescription: 'Accelerate your brokerage deals. List on Dealio Marketplace to generate highly-qualified buyer leads and secure off-market listing visibility.',
    intro: 'Generate verified buyer interest, manage NDAs securely, and close deals faster by syndicating your business listings on Canada\'s premier digital platform.',
    ctaType: 'seller',
    contentSections: [
      {
        title: 'Accelerate Your Listing Velocity',
        text: 'Dealio provides Canadian business brokers with advanced lead management pipelines, digital NDA workflows, secure data rooms, and targeted buyer alerts to match your listings instantly.'
      }
    ],
    faqs: [
      { question: 'Does Dealio charge brokers listing fees?', answer: 'We offer flexible listing and premium subscription options tailored for small-to-large business brokerages. Contact our sales team for details.' }
    ]
  },
  {
    slug: 'broker-growth-partnership',
    type: 'broker',
    h1: 'Broker Growth & Partnership Program',
    metaDescription: 'Partner with Dealio. Gain exclusive marketing benefits, co-branded valuation widgets, and qualified seller leads in your territory.',
    intro: 'Join Canada\'s fastest-growing business transition network. Gain access to qualified local seller leads, advanced deal rooms, and collaborative broker marketing tools.',
    ctaType: 'seller',
    contentSections: [
      {
        title: 'Why Partner with Dealio Marketplace?',
        bulletPoints: [
          'Exclusive territory-based seller valuation leads.',
          'Co-branded interactive valuation calculators for your brokerage website.',
          'Premium listing placement and priority notification to active buyers.',
          'Dedicated deal rooms with integrated electronic signatures and secure files.'
        ]
      }
    ],
    faqs: [
      { question: 'How are qualified seller leads generated?', answer: 'We qualify sellers via our interactive business valuation calculator and exit readiness scorecards, and route them to local partner brokers.' }
    ]
  }
];

informationalPages.forEach(page => {
  seoPages.push({
    ...page,
    title: `${page.h1} | Dealio Marketplace`,
    relatedLinks: getRelatedLinksForPage(page.slug, page.type),
    indexable: true
  });
});

export default seoPages;
