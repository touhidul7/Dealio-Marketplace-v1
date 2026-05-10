export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Manufacturing', 'Retail', 'Food & Beverage',
  'Construction', 'Transportation', 'Professional Services', 'Real Estate',
  'Hospitality', 'Education', 'Agriculture', 'Energy', 'Financial Services',
  'Automotive', 'Media & Entertainment', 'Wholesale & Distribution',
  'Home Services', 'Fitness & Wellness', 'E-Commerce', 'Other'
];

export const PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon'
];

export const COUNTRIES = ['Canada', 'United States'];

export const BUYER_TYPES = [
  { value: 'individual', label: 'Individual Buyer' },
  { value: 'search_fund', label: 'Search Fund' },
  { value: 'PE', label: 'Private Equity' },
  { value: 'strategic', label: 'Strategic Acquirer' },
  { value: 'operator', label: 'Owner/Operator' },
  { value: 'investor', label: 'Passive Investor' },
];

export const PACKAGES = [
  {
    id: 'basic', name: 'Basic', price: 0, period: 'Free',
    features: ['1 business listing', 'Basic listing page', 'Direct inquiries', 'Standard visibility'],
    color: 'var(--gray-600)',
    listingLimit: 1, isFeatured: false, isVerified: false, prioritySort: 0, listingDays: 30,
  },
  {
    id: 'pro', name: 'Pro', price: 0, period: '/month',
    features: ['Up to 5 business listings', 'Enhanced listing page', 'Priority placement', 'Inquiry screening', 'Performance stats', 'Email notifications'],
    color: 'var(--primary)', popular: true,
    listingLimit: 5, isFeatured: false, isVerified: true, prioritySort: 1, listingDays: 90,
  },
  {
    id: 'premium', name: 'Premium', price: 399, period: '/month',
    features: ['Unlimited listings', 'Featured listing badge', 'Top search placement', 'Buyer outreach', 'Dedicated support', 'Advanced analytics', 'CIM creation', 'Verified seller badge'],
    color: 'var(--accent)',
    listingLimit: Infinity, isFeatured: true, isVerified: true, prioritySort: 2, listingDays: 180,
  },
  {
    id: 'full_advisory', name: 'Full Advisory', price: null, period: 'Custom',
    features: ['Full Dealio representation', 'Buyer sourcing', 'Deal management', 'Negotiation support', 'Due diligence coordination', 'Closing support'],
    color: 'var(--cta-dark)',
    listingLimit: Infinity, isFeatured: true, isVerified: true, prioritySort: 3, listingDays: 365,
  },
];

export const INQUIRY_STATUSES = {
  new: { label: 'New', color: 'primary' },
  routed: { label: 'Routed', color: 'warning' },
  opened: { label: 'Opened', color: 'primary' },
  contacted: { label: 'Contacted', color: 'accent' },
  qualified: { label: 'Qualified', color: 'accent' },
  unqualified: { label: 'Unqualified', color: 'gray' },
  converted: { label: 'Converted', color: 'accent' },
  archived: { label: 'Archived', color: 'gray' },
};

export const LISTING_STATUSES = {
  draft: { label: 'Draft', color: 'gray' },
  pending_review: { label: 'Pending Review', color: 'warning' },
  active: { label: 'Active', color: 'accent' },
  paused: { label: 'Paused', color: 'warning' },
  sold: { label: 'Sold', color: 'primary' },
  archived: { label: 'Archived', color: 'gray' },
};

export function formatCurrency(amount) {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
  for (const [unit, val] of Object.entries(intervals)) {
    const count = Math.floor(seconds / val);
    if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

export function truncate(str, len = 120) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

export function getMatchLabel(score) {
  if (score >= 80) return { text: 'Strong Match', color: 'accent' };
  if (score >= 60) return { text: 'Good Match', color: 'warning' };
  return { text: 'Possible Match', color: 'gray' };
}
