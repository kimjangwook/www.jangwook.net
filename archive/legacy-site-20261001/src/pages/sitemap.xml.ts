import type { APIRoute } from 'astro';

const SITE = 'https://jangwook.net';

// List of language-specific sitemaps
const sitemaps = [
  'sitemap-ko.xml',
  'sitemap-en.xml',
  'sitemap-ja.xml',
  'sitemap-zh.xml',
];

function generateSitemapIndexXml(sitemaps: { loc: string; lastmod: string }[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

export const GET: APIRoute = async () => {
  const lastmod = new Date().toISOString().split('T')[0];

  const sitemapEntries = sitemaps.map(sitemap => ({
    loc: `${SITE}/${sitemap}`,
    lastmod,
  }));

  return new Response(generateSitemapIndexXml(sitemapEntries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
