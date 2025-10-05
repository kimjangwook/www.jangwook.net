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
 * Gets current date in JST (Asia/Tokyo) timezone
 * Returns Date object representing current JST time
 */
function getJSTDate(): Date {
	// Get current time in JST (UTC+9)
	const now = new Date();
	const jstOffset = 9 * 60; // JST is UTC+9 hours in minutes
	const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
	const jstTime = new Date(utcTime + (jstOffset * 60000));
	return jstTime;
}

/**
 * Converts a Date to YYYY-MM-DD format
 */
function toDateString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Filters blog posts based on publication date
 * - In production: only shows posts with pubDate <= today (JST timezone)
 * - In test mode (TEST_FLG=true): shows all posts including future ones
 *
 * Note: Uses JST (Asia/Tokyo) timezone for consistency across deployments
 */
export function filterPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
	if (shouldShowFuturePost()) {
		return posts;
	}

	const today = toDateString(getJSTDate());
	return posts.filter((post) => {
		const postDate = toDateString(post.data.pubDate);
		return postDate <= today;
	});
}
