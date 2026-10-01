import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_META } from '../consts';
import { filterIndexablePosts } from '../lib/content';

export async function GET(context) {
	// Only include Chinese blog posts from Content Collection (excludes About, Contact, etc.)
	const posts = filterIndexablePosts(await getCollection('blog'))
		.filter((post) => post.id.startsWith('zh/'))
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: SITE_META.zh.title,
		description: SITE_META.zh.description,
		site: context.site,
		items: posts.map((post) => {
			const [lang, ...slugParts] = post.id.split('/');
			const slug = slugParts.join('/');
			return {
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				link: `/${lang}/blog/${lang}/${slug}/`,
			};
		}),
		customData: `<language>zh</language>`,
	});
}
