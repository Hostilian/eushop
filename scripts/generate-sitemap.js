/**
 * Sitemap generator for EUshop static export.
 * Run via: node scripts/generate-sitemap.js
 * Output: apps/web/public/sitemap.xml
 *
 * For a live backend, replace staticProductIds with a real API call.
 * COMPLIANCE-REVIEW: Do not include admin, GDPR, or login pages in sitemap.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://hostilian.github.io/eushop';

// Static pages
const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/search/', changefreq: 'daily', priority: '0.9' },
  { url: '/become-seller/', changefreq: 'monthly', priority: '0.7' },
  { url: '/android/', changefreq: 'monthly', priority: '0.6' },
  { url: '/privacy/', changefreq: 'yearly', priority: '0.3' },
  { url: '/terms/', changefreq: 'yearly', priority: '0.3' },
];

// In production, fetch product IDs from the API
// For static export, use the fallback product IDs from services.ts
const staticProductIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const productPages = staticProductIds.map(id => ({
  url: `/food/${id}/`,
  changefreq: 'weekly',
  priority: '0.8',
}));

const allPages = [...staticPages, ...productPages];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

const outputPath = path.join(__dirname, '../apps/web/public/sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf8');
console.log(`✅ Sitemap written to ${outputPath} (${allPages.length} URLs)`);
