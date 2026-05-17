// ============================================
// Dealio Marketplace - Requests Module Constants
// ============================================

// --- Request Types with Dynamic Field Definitions ---
export const REQUEST_TYPES = [
  {
    id: 'buyer_seeking_business',
    label: 'Buyer Seeking Business',
    icon: '🏢',
    description: 'Looking to acquire an existing business',
    color: '#0F52BA',
    fields: [
      { name: 'budget_min', label: 'Minimum Budget', type: 'number', placeholder: 'e.g. 100000' },
      { name: 'budget_max', label: 'Maximum Budget', type: 'number', placeholder: 'e.g. 500000' },
      { name: 'experience_level', label: 'Acquisition Experience', type: 'select', options: ['First-time Buyer', '1-2 Acquisitions', '3-5 Acquisitions', '5+ Acquisitions'] },
      { name: 'ideal_business_size', label: 'Ideal Business Size (Employees)', type: 'select', options: ['1-5', '6-15', '16-50', '50-100', '100+'] },
      { name: 'financing_available', label: 'Financing Pre-approved?', type: 'select', options: ['Yes', 'No', 'In Process'] },
      { name: 'additional_details', label: 'Additional Details', type: 'textarea', placeholder: 'Describe your ideal acquisition...' },
    ],
  },
  {
    id: 'owner_seeking_operator',
    label: 'Owner Seeking Operator',
    icon: '🤝',
    description: 'Business owner looking for an operator or manager',
    color: '#10B981',
    fields: [
      { name: 'business_industry', label: 'Business Industry', type: 'select', useIndustries: true },
      { name: 'business_location', label: 'Business Location', type: 'text', placeholder: 'City, Province/State' },
      { name: 'role_description', label: 'Operator Role Description', type: 'textarea', placeholder: 'What would the operator be responsible for?' },
      { name: 'compensation_structure', label: 'Compensation Structure', type: 'select', options: ['Salary Only', 'Salary + Equity', 'Equity Only', 'Revenue Share', 'To Be Discussed'] },
      { name: 'experience_required', label: 'Experience Required', type: 'textarea', placeholder: 'What experience should the operator have?' },
      { name: 'business_stage', label: 'Business Stage', type: 'select', options: ['Startup', 'Growth', 'Established', 'Turnaround'] },
    ],
  },
  {
    id: 'operator_seeking_opportunity',
    label: 'Operator Seeking Opportunity',
    icon: '🎯',
    description: 'Experienced operator looking for a business to run',
    color: '#F59E0B',
    fields: [
      { name: 'years_experience', label: 'Years of Management Experience', type: 'select', options: ['1-3 years', '3-5 years', '5-10 years', '10+ years'] },
      { name: 'industries_of_interest', label: 'Industries of Interest', type: 'text', placeholder: 'e.g. SaaS, Manufacturing, Retail' },
      { name: 'investment_capacity', label: 'Can You Co-Invest?', type: 'select', options: ['Yes - Under $50K', 'Yes - $50K-$150K', 'Yes - $150K+', 'No - Sweat Equity Only'] },
      { name: 'management_style', label: 'Management Style', type: 'select', options: ['Hands-on Operator', 'Strategic Oversight', 'Turnaround Specialist', 'Growth Focused'] },
      { name: 'availability', label: 'Availability', type: 'select', options: ['Immediately', 'Within 30 Days', 'Within 90 Days', 'Flexible'] },
      { name: 'background_summary', label: 'Professional Background', type: 'textarea', placeholder: 'Brief summary of your experience and strengths...' },
    ],
  },
  {
    id: 'strategic_partner',
    label: 'Strategic Partner Request',
    icon: '🔗',
    description: 'Seeking a strategic partner for growth or collaboration',
    color: '#8B5CF6',
    fields: [
      { name: 'partnership_type', label: 'Partnership Type', type: 'select', options: ['Joint Venture', 'Distribution Partner', 'Technology Partner', 'Marketing Partner', 'Supply Chain Partner', 'Other'] },
      { name: 'resources_offered', label: 'Resources You Offer', type: 'textarea', placeholder: 'What do you bring to the partnership?' },
      { name: 'resources_sought', label: 'Resources You Seek', type: 'textarea', placeholder: 'What are you looking for in a partner?' },
      { name: 'geographic_scope', label: 'Geographic Scope', type: 'select', options: ['Local', 'Provincial/State', 'National', 'North America', 'International'] },
      { name: 'partnership_timeline', label: 'Partnership Timeline', type: 'select', options: ['Immediate', '1-3 Months', '3-6 Months', '6-12 Months', 'Ongoing Search'] },
      { name: 'company_overview', label: 'Company Overview', type: 'textarea', placeholder: 'Brief overview of your company and goals...' },
    ],
  },
];

// --- Request Status Definitions ---
export const REQUEST_STATUSES = {
  pending_review: { label: 'Pending Review', color: 'warning', icon: '⏳' },
  approved: { label: 'Approved', color: 'accent', icon: '✅' },
  rejected: { label: 'Rejected', color: 'danger', icon: '❌' },
  flagged: { label: 'Flagged', color: 'danger', icon: '🚩' },
  archived: { label: 'Archived', color: 'gray', icon: '📦' },
};

// --- Response Intent Options ---
export const RESPONSE_INTENTS = [
  { value: 'interested_buyer', label: 'Interested Buyer' },
  { value: 'potential_operator', label: 'Potential Operator' },
  { value: 'strategic_partner', label: 'Strategic Partner' },
  { value: 'general_inquiry', label: 'General Inquiry' },
  { value: 'offer_services', label: 'Offering Professional Services' },
];

// --- Compliance Checkbox Text ---
export const COMPLIANCE_CHECKBOX_TEXT =
  'I confirm this request is not soliciting capital, offering securities, advertising an investment opportunity, or promising financial returns.';

// --- Verification Levels ---
export const VERIFICATION_LEVELS = [
  { value: 'unverified', label: 'Unverified', icon: '⚪' },
  { value: 'basic', label: 'Basic Verified', icon: '🔵' },
  { value: 'verified', label: 'Verified', icon: '✅' },
  { value: 'premium', label: 'Premium Verified', icon: '⭐' },
];

// --- Prohibited Keywords ---
const PROHIBITED_KEYWORDS = [
  // Capital / Investment solicitation
  'invest now', 'invest today', 'investment opportunity', 'investment offering',
  'capital raise', 'raising capital', 'raise capital', 'raise funds',
  'fund this deal', 'fund this opportunity', 'commit capital',
  'back this opportunity', 'back this deal',
  // Securities
  'securities', 'securities offering', 'security offering',
  'offering memorandum', 'private placement',
  'reg d', 'reg cf', 'regulation d', 'regulation cf', 'regulation a',
  // Instruments
  'promissory note', 'promissory notes',
  'convertible note', 'convertible notes', 'convertible debt',
  'safe agreement', 'simple agreement for future equity',
  // Returns / ROI
  'guaranteed roi', 'guaranteed return', 'guaranteed returns',
  'annual returns', 'monthly returns', 'projected returns',
  'passive returns', 'passive income guaranteed',
  'fixed return', 'fixed returns',
  // Crowdfunding / Token
  'equity crowdfunding', 'crowdfunding offering', 'crowdfund',
  'token offering', 'token sale', 'ico', 'initial coin offering',
  'crypto offering', 'cryptocurrency offering',
  'nft offering', 'digital asset offering',
  // Accredited
  'accredited investor', 'accredited investors only',
  'qualified investor', 'qualified purchaser',
  // Other prohibited phrases
  'limited partnership units', 'lp units', 'lp interests',
  'syndication', 'real estate syndication',
  'passive investment', 'passive equity',
  'cash on cash return', 'irr projection',
  'preferred return', 'preferred equity',
  'minimum investment', 'minimum commitment',
];

// --- Forbidden CTA Labels ---
export const FORBIDDEN_CTAS = [
  'invest now',
  'fund this deal',
  'commit capital',
  'back this opportunity',
];

/**
 * Scans text for prohibited investment/fundraising keywords.
 * Returns an array of matched keywords found in the text.
 */
export function scanForProhibitedKeywords(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = [];

  for (const keyword of PROHIBITED_KEYWORDS) {
    // Use word boundary matching for short keywords to reduce false positives
    if (keyword.length <= 4) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lower)) {
        found.push(keyword);
      }
    } else {
      if (lower.includes(keyword)) {
        found.push(keyword);
      }
    }
  }

  return [...new Set(found)]; // deduplicate
}

/**
 * Checks if text contains any prohibited keywords.
 * Returns { clean: boolean, flaggedKeywords: string[] }
 */
export function checkCompliance(text) {
  const flaggedKeywords = scanForProhibitedKeywords(text);
  return {
    clean: flaggedKeywords.length === 0,
    flaggedKeywords,
  };
}

/**
 * Scans all text fields of a request for prohibited keywords.
 */
export function scanRequestForKeywords(request) {
  const textsToScan = [
    request.title,
    request.description,
    ...(request.dynamic_fields ? Object.values(request.dynamic_fields).filter(v => typeof v === 'string') : []),
  ].filter(Boolean);

  const allText = textsToScan.join(' ');
  return scanForProhibitedKeywords(allText);
}
