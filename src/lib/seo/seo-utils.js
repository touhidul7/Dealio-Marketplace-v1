import seoPages from './seo-pages.js';

export function getSEOPageConfig(slugArray) {
  const slug = slugArray.join('/');
  return seoPages.find(page => page.slug === slug) || null;
}

export async function getListingsForSEOPage(filters, supabase) {
  if (!filters) return [];

  // Gracefully return empty listing array for missing database fields to activate the empty state CTA
  if (filters.absentee_owner || filters.recurring_revenue) {
    console.log('[SEO] Gracefully bypassing listing query for pending DB fields (absentee/recurring)');
    return [];
  }

  try {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .limit(20);

    // country: 'Canada' — all listings are Canadian, no extra filter needed

    if (filters.province) {
      query = query.ilike('province_state', `%${filters.province}%`);
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.industry) {
      query = query.ilike('industry', `%${filters.industry}%`);
    }
    if (filters.max_price) {
      query = query.lte('asking_price', filters.max_price);
    }
    // Fixed: change database query from 'revenue' to 'annual_revenue'
    if (filters.min_revenue) {
      query = query.gte('annual_revenue', filters.min_revenue);
    }
    if (filters.min_cash_flow) {
      query = query.gte('cash_flow', filters.min_cash_flow);
    }
    if (filters.profitable) {
      query = query.gt('cash_flow', 0);
    }
    if (filters.seller_financing_available) {
      query = query.eq('seller_financing_available', true);
    }
    if (filters.featured) {
      query = query.eq('is_featured', true);
    }
    if (filters.confidential) {
      query = query.eq('confidentiality_mode', 'confidential');
    }
    if (filters.listing_source) {
      query = query.eq('listing_source', filters.listing_source);
    }
    if (filters.new_listings) {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error('[SEO] Supabase query error:', error.message, error.code, error.details);
      return [];
    }

    console.log(`[SEO] Query returned ${data?.length || 0} listings for filters:`, JSON.stringify(filters));
    return data || [];
  } catch (err) {
    console.error('SEO listing fetch exception:', err);
    return [];
  }
}
