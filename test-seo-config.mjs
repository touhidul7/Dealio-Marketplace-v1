import seoPages from './src/lib/seo/seo-pages.js';
import { getSEOPageConfig } from './src/lib/seo/seo-utils.js';

console.log('Total seoPages count:', seoPages.length);

const testSlugs = [
  'seller-document-checklist',
  'ebitda-vs-sde',
  'businesses-for-sale/ontario/hvac'
];

testSlugs.forEach(slug => {
  const slugArray = slug.split('/');
  const config = getSEOPageConfig(slugArray);
  console.log(`Config for [${slug}]:`, config ? { slug: config.slug, type: config.type, title: config.title } : 'NOT FOUND');
});
