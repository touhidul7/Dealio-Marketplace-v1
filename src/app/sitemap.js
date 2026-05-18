import fs from 'fs';
import path from 'path';
import seoPages from '@/lib/seo/seo-pages';
import { createAdminClient } from '@/lib/supabase/admin';

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

export default async function sitemap() {
  const baseUrl = 'https://dealiomarketplace.com';

  // Base routes - Dynamic
  const appDir = path.join(process.cwd(), 'src/app');
  const dynamicRoutes = getAppRoutes(appDir).filter(route => route !== '/requests/new');
  
  const routes = dynamicRoutes.map((route) => ({
    url: `${baseUrl}${route === '/' ? '' : route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '/' ? 1 : 0.8,
  }));

  // SEO programmatic routes
  const seoRoutes = seoPages
    .filter(page => page.indexable)
    .map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  // Blog dynamic routes
  let blogRoutes = [];
  let requestRoutes = [];
  try {
    const supabase = createAdminClient();
    
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

  return [...routes, ...seoRoutes, ...blogRoutes, ...requestRoutes];
}
