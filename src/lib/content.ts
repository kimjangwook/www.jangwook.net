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
 * Filters blog posts based on publication date
 * - In production: only shows posts with pubDate <= now
 * - In test mode (TEST_FLG=true): shows all posts including future ones
 */
export function filterPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
	if (shouldShowFuturePost()) {
		return posts;
	}

	const now = new Date();
	return posts.filter((post) => post.data.pubDate <= now);
}
