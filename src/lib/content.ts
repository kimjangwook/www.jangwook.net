import type { CollectionEntry } from "astro:content";

/**
 * Checks if future posts should be displayed
 * Returns true if TEST_FLG environment variable is set to 'true'
 * Used for local development and testing
 */
export function shouldShowFuturePost(): boolean {
  return import.meta.env.TEST_FLG == 1;
}

/**
 * Gets current date in JST (Asia/Tokyo) timezone
 * Returns Date object representing current JST time
 */
function getJSTDate(): Date {
  // Get current time in JST (UTC+9)
  const now = new Date();
  const jstOffset = 9 * 60; // JST is UTC+9 hours in minutes
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const jstTime = new Date(utcTime + jstOffset * 60000);
  return jstTime;
}

/**
 * Converts a Date to YYYY-MM-DD format
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Filters blog posts based on publication date
 * - In production: only shows posts with pubDate <= today (JST timezone)
 * - In test mode (TEST_FLG=true): shows all posts including future ones
 *
 * Note: Uses JST (Asia/Tokyo) timezone for consistency across deployments
 */
export function filterPostsByDate(
  posts: CollectionEntry<"blog">[]
): CollectionEntry<"blog">[] {
  if (shouldShowFuturePost()) {
    return posts;
  }

  const today = toDateString(getJSTDate());
  return posts.filter((post) => {
    const postDate = toDateString(post.data.pubDate);
    return postDate <= today;
  });
}

/**
 * Calculates estimated reading time from markdown content
 * Uses different WPM rates for different character types:
 * - English/Latin: ~200 WPM
 * - CJK (Chinese, Japanese, Korean): ~400 characters per minute
 *
 * @param content Raw markdown content
 * @returns Estimated reading time in minutes (minimum 1)
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;

  // Remove code blocks (```...```)
  let cleanContent = content.replace(/```[\s\S]*?```/g, "");

  // Remove inline code (`...`)
  cleanContent = cleanContent.replace(/`[^`]+`/g, "");

  // Remove HTML tags
  cleanContent = cleanContent.replace(/<[^>]+>/g, "");

  // Remove markdown links [text](url) but keep text
  cleanContent = cleanContent.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove markdown images ![alt](url)
  cleanContent = cleanContent.replace(/!\[[^\]]*\]\([^)]+\)/g, "");

  // Remove markdown formatting (**bold**, *italic*, etc.)
  cleanContent = cleanContent.replace(/[*_~`#]+/g, "");

  // Remove frontmatter (---...---)
  cleanContent = cleanContent.replace(/^---[\s\S]*?---/m, "");

  // Count CJK characters (Chinese, Japanese, Korean)
  const cjkRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;
  const cjkMatches = cleanContent.match(cjkRegex) || [];
  const cjkCount = cjkMatches.length;

  // Remove CJK characters for word count
  const nonCjkContent = cleanContent.replace(cjkRegex, " ");

  // Count words in non-CJK content
  const words = nonCjkContent.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time
  // English: ~200 words per minute
  // CJK: ~400 characters per minute (reading is faster per character)
  const englishMinutes = wordCount / 200;
  const cjkMinutes = cjkCount / 400;

  const totalMinutes = englishMinutes + cjkMinutes;

  return Math.max(1, Math.ceil(totalMinutes));
}
