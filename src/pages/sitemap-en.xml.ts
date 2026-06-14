import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { filterIndexablePosts } from '../lib/content';

const SITE = 'https://jangwook.net';
const LANG = 'en';

// Static pages for English
const staticPages = [
  { path: '/en', priority: 1.0, changefreq: 'weekly' },
  { path: '/en/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/en/blog', priority: 0.9, changefreq: 'daily' },
  { path: '/en/contact', priority: 0.7, changefreq: 'monthly' },
  { path: '/en/social', priority: 0.7, changefreq: 'monthly' },
  { path: '/en/improvement-history', priority: 0.6, changefreq: 'weekly' },
  { path: '/en/privacy', priority: 0.5, changefreq: 'yearly' },
  { path: '/en/terms', priority: 0.5, changefreq: 'yearly' },
  { path: '/en/portfolio/shadow-dash', priority: 0.7, changefreq: 'monthly' },
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
  const langPosts = filterIndexablePosts(allPosts).filter(post => post.id.startsWith(`${LANG}/`));

  // 정적 페이지 lastmod는 "빌드 시각"이 아니라 "가장 최근 발행글 날짜"를 사용한다.
  // new Date()를 쓰면 매일 도는 CI 빌드에서 모든 정적 페이지가 "오늘 수정됨"으로
  // 표시되어 거짓 신선도(스팸) 신호가 된다. 실제 콘텐츠가 갱신될 때만 lastmod가 움직인다.
  const latestMod = langPosts
    .map(post => (post.data.updatedDate || post.data.pubDate).toISOString().split('T')[0])
    .sort()
    .at(-1) || new Date().toISOString().split('T')[0];

  // Generate URLs
  const urls = [
    // Static pages
    ...staticPages.map(page => ({
      loc: `${SITE}${page.path}`,
      lastmod: latestMod,
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
