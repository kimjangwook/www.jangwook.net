import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { filterPostsByDate } from '../lib/content';

const SITE = 'https://jangwook.net';
const LANG = 'zh';

// Static pages for Chinese
const staticPages = [
  { path: '/zh', priority: 1.0, changefreq: 'weekly' },
  { path: '/zh/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/zh/blog', priority: 0.9, changefreq: 'daily' },
  { path: '/zh/contact', priority: 0.7, changefreq: 'monthly' },
  { path: '/zh/social', priority: 0.7, changefreq: 'monthly' },
  { path: '/zh/improvement-history', priority: 0.6, changefreq: 'weekly' },
];

function generateSitemapXml(urls: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `
    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority !== undefined ? `
    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;
}

export const GET: APIRoute = async () => {
  // Get all blog posts for this language
  const allPosts = await getCollection('blog');
  const langPosts = filterPostsByDate(allPosts).filter(post => post.id.startsWith(`${LANG}/`));

  // Generate URLs
  const urls = [
    // Static pages
    ...staticPages.map(page => ({
      loc: `${SITE}${page.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority,
    })),
    // Blog posts
    ...langPosts.map(post => {
      return {
        loc: `${SITE}/${LANG}/blog/${post.id}/`,
        lastmod: (post.data.updatedDate || post.data.pubDate).toISOString().split('T')[0],
        changefreq: 'monthly' as const,
        priority: 0.7,
      };
    }),
  ];

  return new Response(generateSitemapXml(urls), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
