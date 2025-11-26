import type { RequestHandler } from './$types';

const site = 'https://agent-effi-flow.jangwook.net';

// 除外するディレクトリ
const EXCLUDED_DIRS = ['api', 'agents', 'auth', 'login'];

// ルート優先度のルールベース設定
function getPriority(path: string): number {
	if (path === '') return 1.0; // ホームページ
	if (path.startsWith('services')) return 0.9; // サービスページ
	if (path === 'pricing' || path.startsWith('pricing')) return 0.8; // 料金ページ
	if (path.startsWith('legal')) return 0.5; // 法的ページ
	return 0.7; // その他
}

function getChangeFreq(path: string): string {
	if (path === '' || path.startsWith('services')) return 'weekly';
	if (path === 'pricing' || path.startsWith('pricing')) return 'monthly';
	if (path.startsWith('legal')) return 'yearly';
	return 'monthly';
}

// +page.svelteファイルから動的にルートを検出
const modules = import.meta.glob('/src/routes/**/+page.svelte', { eager: true });

function getRoutes(): { path: string; priority: number; changefreq: string }[] {
	const routes: { path: string; priority: number; changefreq: string }[] = [];

	for (const modulePath in modules) {
		// /src/routes/xxx/+page.svelte から xxx を抽出
		let routePath = modulePath
			.replace('/src/routes/', '')
			.replace(/\+page\.svelte$/, '') // 末尾の+page.svelteを削除
			.replace(/\/$/, ''); // 末尾のスラッシュを削除

		// 除外ディレクトリチェック
		const pathSegments = routePath.split('/').filter(Boolean);
		const shouldExclude = pathSegments.some((segment) => EXCLUDED_DIRS.includes(segment));

		if (shouldExclude) continue;

		// 空文字列はルートパス（ホームページ）
		const normalizedPath = routePath;

		routes.push({
			path: normalizedPath,
			priority: getPriority(normalizedPath),
			changefreq: getChangeFreq(normalizedPath)
		});
	}

	// 優先度でソート（高い順）
	return routes.sort((a, b) => b.priority - a.priority);
}

export const GET: RequestHandler = () => {
	const routes = getRoutes();
	const today = new Date().toISOString().split('T')[0];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map(
		(route) => `  <url>
    <loc>${site}/${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
