/**
 * Dealio Marketplace — Role & Capability System
 * 
 * Roles are capabilities, not rigid identities.
 * Users can hold multiple roles simultaneously.
 * 
 * Behavioral states (NOT roles):
 *   - Request Owner / Request Responder
 *   - Listing Owner / Listing Responder
 */

// ─── All Valid Roles ──────────────────────────────────────────────
export const ALL_ROLES = [
  'buyer',
  'seller',
  'business_owner',
  'operator',
  'strategic_partner',
  'advisor',
  'broker',
  'admin',
];

// ─── Human-Readable Role Labels ───────────────────────────────────
export const ROLE_LABELS = {
  buyer: 'Buyer',
  seller: 'Seller',
  business_owner: 'Business Owner',
  operator: 'Operator',
  strategic_partner: 'Strategic Partner',
  advisor: 'Advisor',
  broker: 'Broker',
  admin: 'Admin',
};

// ─── Signup Intents ──────────────────────────────────────────────
// "What are you here to do?" — maps user intents to capability roles
export const SIGNUP_INTENTS = [
  {
    id: 'buy_business',
    label: 'Buy a business',
    description: 'Browse and acquire businesses',
    icon: '🔍',
    roles: ['buyer'],
  },
  {
    id: 'sell_business',
    label: 'Sell a business',
    description: 'List your business for sale',
    icon: '🏢',
    roles: ['seller'],
  },
  {
    id: 'find_operator',
    label: 'Find an operator',
    description: 'Find someone to run your business',
    icon: '👤',
    roles: ['business_owner'],
  },
  {
    id: 'become_operator',
    label: 'Become an operator',
    description: 'Operate or manage a business',
    icon: '⚙️',
    roles: ['operator'],
  },
  {
    id: 'find_partner',
    label: 'Find a strategic partner',
    description: 'Partner with other businesses',
    icon: '🤝',
    roles: ['strategic_partner'],
  },
  {
    id: 'respond_opportunities',
    label: 'Respond to opportunities',
    description: 'Browse and respond to listings & requests',
    icon: '📢',
    roles: ['buyer'],
  },
  {
    id: 'advise_clients',
    label: 'Advise clients',
    description: 'Provide M&A advisory services',
    icon: '💼',
    roles: ['advisor'],
  },
  {
    id: 'broker_transactions',
    label: 'Broker transactions',
    description: 'Broker business deals',
    icon: '📊',
    roles: ['broker'],
  },
];

// ─── Portal ↔ Role Mapping ───────────────────────────────────────
// Which roles grant access to which portal/dashboard
export const PORTAL_ROLES = {
  buyer: ['buyer', 'operator', 'strategic_partner'],
  seller: ['seller', 'business_owner'],
  advisor: ['advisor'],
  broker: ['broker'],
  admin: ['admin'],
};

// Reverse: which portal does a given role map to
export const ROLE_TO_PORTAL = {
  buyer: 'buyer',
  seller: 'seller',
  business_owner: 'seller',
  operator: 'buyer',
  strategic_partner: 'buyer',
  advisor: 'advisor',
  broker: 'broker',
  admin: 'admin',
};

export const PORTAL_LABELS = {
  buyer: 'Buyer Portal',
  seller: 'Seller Portal',
  advisor: 'Advisor Portal',
  broker: 'Broker Portal',
  admin: 'Admin Console',
};

// ─── Helper Functions ────────────────────────────────────────────

/**
 * Check if a roles array grants access to a specific portal
 */
export function canAccessPortal(userRoles, portal) {
  if (!userRoles?.length) return false;
  if (userRoles.includes('admin')) return true;
  return PORTAL_ROLES[portal]?.some(r => userRoles.includes(r)) || false;
}

/**
 * Get the default dashboard link for a user based on their roles
 * Priority: admin > advisor > broker > seller/business_owner > buyer/operator/strategic_partner
 */
export function getDashboardPath(userRoles) {
  if (!userRoles?.length) return '/buyer';
  if (userRoles.includes('admin')) return '/admin';
  if (userRoles.includes('advisor')) return '/advisor';
  if (userRoles.includes('broker')) return '/broker';
  if (userRoles.includes('seller') || userRoles.includes('business_owner')) return '/seller';
  return '/buyer';
}

/**
 * Get all portals a user can access
 */
export function getAccessiblePortals(userRoles) {
  if (!userRoles?.length) return [];
  if (userRoles.includes('admin')) return Object.keys(PORTAL_ROLES);
  return Object.entries(PORTAL_ROLES)
    .filter(([_, roles]) => roles.some(r => userRoles.includes(r)))
    .map(([portal]) => portal);
}

/**
 * Derive unique roles from selected signup intents
 */
export function intentsToRoles(intentIds) {
  const roles = new Set();
  for (const id of intentIds) {
    const intent = SIGNUP_INTENTS.find(i => i.id === id);
    if (intent) intent.roles.forEach(r => roles.add(r));
  }
  return [...roles];
}

/**
 * Get the first available portal path to redirect to
 * when user tries to access a portal they don't have access to
 */
export function getFirstAvailablePortal(userRoles) {
  const portals = getAccessiblePortals(userRoles);
  if (portals.length === 0) return '/buyer';
  // Priority order
  const priority = ['admin', 'advisor', 'broker', 'seller', 'buyer'];
  for (const p of priority) {
    if (portals.includes(p)) return `/${p}`;
  }
  return `/${portals[0]}`;
}
