import fs from 'fs';
import path from 'path';
import seoPages from '@/lib/seo/seo-pages';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

function getAppRoutes(dir, basePath = '') {
  let routes = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const excludedDirs = [
          'api', 'admin', 'advisor', 'broker', 'buyer', 'seller',
          'settings', 'saved', 'checkout', 'update-password',
          'auth', 'forgot-password', 'login', 'signup', '(seo)'
        ];

        if (!excludedDirs.includes(entry.name) && !entry.name.startsWith('[') && !entry.name.startsWith('(')) {
          routes.push(...getAppRoutes(path.join(dir, entry.name), `${basePath}/${entry.name}`));
        }
      } else if (entry.isFile() && (entry.name === 'page.js' || entry.name === 'page.tsx' || entry.name === 'page.jsx')) {
        routes.push(basePath === '' ? '/' : basePath);
      }
    }
  } catch (err) {
    console.error('Error reading app routes:', err);
  }
  return routes;
}

function hasListingsForFilters(filters, listings) {
  if (!listings) return false;
  return listings.some(item => {
    if (filters.province && (!item.province_state || !item.province_state.toLowerCase().includes(filters.province.toLowerCase()))) {
      return false;
    }
    if (filters.city && (!item.city || !item.city.toLowerCase().includes(filters.city.toLowerCase()))) {
      return false;
    }
    if (filters.industry && (!item.industry || !item.industry.toLowerCase().includes(filters.industry.toLowerCase()))) {
      return false;
    }
    return true;
  });
}

export default async function sitemap() {
  const baseUrl = 'https://www.dealiomarketplace.com';

  // Base routes - Dynamic
  const appDir = path.join(process.cwd(), 'src/app');
  const dynamicRoutes = getAppRoutes(appDir).filter(route => route !== '/requests/new');

  const routes = dynamicRoutes.map((route) => ({
    url: `${baseUrl}${route === '/' ? '' : route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '/' ? 1 : 0.8,
  }));

  // Fetch all active listings in memory once to filter out empty combined pages
  let activeListings = [];
  let blogRoutes = [];
  let requestRoutes = [];
  
  try {
    const supabase = createAdminClient();

    // Fetch listings
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('province_state, city, industry')
      .eq('status', 'active');

    if (!listingsError && listings) {
      activeListings = listings;
    } else if (listingsError) {
      console.error('[SITEMAP] Error fetching active listings:', listingsError.message);
    }

    // Fetch blogs
    const { data: blogs, error: blogError } = await supabase
      .from('blogs')
      .select('slug, created_at')
      .eq('published', true);

    if (!blogError && blogs) {
      blogRoutes = blogs.map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: blog.created_at ? new Date(blog.created_at).toISOString() : new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }

    // Fetch requests
    const { data: requestsData, error: reqError } = await supabase
      .from('requests')
      .select('id, created_at')
      .eq('status', 'approved');

    if (!reqError && requestsData) {
      requestRoutes = requestsData.map((req) => ({
        url: `${baseUrl}/requests/${req.id}`,
        lastModified: req.created_at ? new Date(req.created_at).toISOString() : new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
    }
  } catch (err) {
    console.error('Error fetching dynamic data for sitemap:', err);
  }

  // SEO programmatic routes
  const seoRoutes = seoPages
    .filter(page => {
      if (!page.indexable) return false;
      // Filter out industry-location combined pages with 0 active listings
      if (page.type === 'industry-location') {
        return hasListingsForFilters(page.filters, activeListings);
      }
      return true;
    })
    .map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [...routes, ...seoRoutes, ...blogRoutes, ...requestRoutes];
}
