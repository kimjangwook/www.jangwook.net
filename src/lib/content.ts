import type { CollectionEntry } from 'astro:content';

/**
 * Checks if future posts should be displayed
 * Returns true if TEST_FLG environment variable is set to 'true'
 * Used for local development and testing
 */
export function shouldShowFuturePost(): boolean {
	return import.meta.env.TEST_FLG === 'true';
}

/**
 * Converts a Date to YYYY-MM-DD format (local timezone)
 */
function toDateString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Filters blog posts based on publication date
 * - In production: only shows posts with pubDate <= today (ignores time component)
 * - In test mode (TEST_FLG=true): shows all posts including future ones
 *
 * Note: Compares dates only (YYYY-MM-DD), ignoring time to avoid timezone issues
 */
export function filterPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
	if (shouldShowFuturePost()) {
		return posts;
	}

	const today = toDateString(new Date());
	return posts.filter((post) => {
		const postDate = toDateString(post.data.pubDate);
		return postDate <= today;
	});
}
