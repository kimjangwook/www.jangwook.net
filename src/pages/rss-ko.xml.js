import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_META } from '../consts';

export async function GET(context) {
	const now = new Date();

	// Only include Korean blog posts from Content Collection (excludes About, Contact, etc.)
	const posts = (await getCollection('blog'))
		.filter((post) => post.id.startsWith('ko/') && post.data.pubDate <= now)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return rss({
		title: SITE_META.ko.title,
		description: SITE_META.ko.description,
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
		customData: `<language>ko</language>`,
	});
}
