import type { CollectionEntry } from 'astro:content';
import { filterPostsByDate } from './content';
import { languages, type Language } from './i18n/languages';

export const BLOG_PAGE_SIZE = 12;

export type BlogPost = CollectionEntry<'blog'>;

export interface TagEntry {
	label: string;
	slug: string;
	count: number;
	posts: BlogPost[];
}

export interface LocaleLink {
	lang: Language;
	url: string;
}

/**
 * Keep archive ordering stable when two posts share a publication date.
 * The ID is the content loader's stable locale/slug key, so a rebuild cannot
 * move equal-date cards around between pages.
 */
export function sortPosts(posts: BlogPost[]): BlogPost[] {
	return [...posts].sort((a, b) => {
		const dateOrder = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
		if (dateOrder) return dateOrder;
		return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
	});
}

export function getPostLanguage(post: BlogPost): Language | null {
	const [candidate] = post.id.split('/');
	return candidate && candidate in languages ? (candidate as Language) : null;
}

export function getPublishedPosts(allPosts: BlogPost[], lang?: Language): BlogPost[] {
	const published = filterPostsByDate(allPosts);
	return sortPosts(lang ? published.filter((post) => getPostLanguage(post) === lang) : published);
}

export function getPageCount(postCount: number, pageSize = BLOG_PAGE_SIZE): number {
	return Math.max(1, Math.ceil(postCount / pageSize));
}

export function getPagePosts(
	posts: BlogPost[],
	page: number,
	pageSize = BLOG_PAGE_SIZE,
): BlogPost[] {
	const safePage = Math.max(1, Math.floor(page));
	const start = (safePage - 1) * pageSize;
	return posts.slice(start, start + pageSize);
}

export function getArchivePath(lang: Language, page: number): string {
	return page <= 1 ? `/${lang}/blog/` : `/${lang}/blog/page/${page}/`;
}

export function getPostPath(lang: Language, post: BlogPost): string {
	// Preserve the site's established /{lang}/blog/{post.id}/ URLs.
	return `/${lang}/blog/${post.id}/`;
}

/**
 * Normalize a label for matching and for the first, human-readable part of a
 * tag URL. Unicode letters/digits remain intact; punctuation becomes a dash.
 */
export function normalizeTagLabel(value: string): string {
	return value.normalize('NFKC').trim().toLowerCase();
}

export function getTagBaseSlug(value: string): string {
	const base = normalizeTagLabel(value)
		.normalize('NFKD')
		.replace(/\p{Mark}/gu, '')
		.replace(/[^\p{Letter}\p{Number}]+/gu, '-')
		.replace(/^-+|-+$/g, '');
	// NFKD decomposes Hangul into Jamo; restore NFC before it becomes a URL
	// parameter so Astro's route normalization compares the same code points.
	return (base || 'tag').normalize('NFC');
}

/** Small deterministic hash used only when two labels would share a URL. */
function getTagHash(value: string): string {
	let hash = 2166136261;
	for (const character of normalizeTagLabel(value)) {
		hash ^= character.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(36);
}

/**
 * Generate a stable slug for one canonical label. Safe labels stay readable;
 * labels that need punctuation/diacritic folding carry a deterministic suffix.
 * The suffix is based only on the label, so adding a later tag can never move
 * an existing tag to a new URL.
 */
export function getStableTagSlug(value: string): string {
	const canonical = normalizeTagLabel(value);
	const base = getTagBaseSlug(canonical);
	const safe = /^[\p{Letter}\p{Number}]+(?:-[\p{Letter}\p{Number}]+)*$/u.test(canonical);
	return safe && canonical === base ? base : `${base}--${getTagHash(canonical)}`;
}

/** Build stable slugs for all raw labels in a locale. Case-only variants share a URL. */
export function buildTagSlugMap(tagLabels: Iterable<string>): Map<string, string> {
	const result = new Map<string, string>();
	for (const label of new Set(tagLabels)) result.set(label, getStableTagSlug(label));
	return result;
}

export function getTagSlug(value: string, allLabels?: Iterable<string>): string {
	if (allLabels) return buildTagSlugMap(allLabels).get(value) ?? getTagBaseSlug(value);
	return getStableTagSlug(value);
}

export function getTagPath(lang: Language, slug: string): string {
	return `/${lang}/tags/${encodeURIComponent(slug)}/`;
}

export function getTagEntries(posts: BlogPost[]): TagEntry[] {
	const postsByCanonical = new Map<string, { label: string; posts: BlogPost[]; rawLabels: Set<string> }>();
	for (const post of posts) {
		for (const rawLabel of post.data.tags ?? []) {
			const label = rawLabel.trim();
			if (!label) continue;
			const canonical = normalizeTagLabel(label);
			const group = postsByCanonical.get(canonical) ?? {
				label,
				posts: [],
				rawLabels: new Set<string>(),
			};
			group.rawLabels.add(label);
			if (!group.posts.some((candidate) => candidate.id === post.id)) group.posts.push(post);
			postsByCanonical.set(canonical, group);
		}
	}

	const slugMap = buildTagSlugMap(
		[...postsByCanonical.values()].flatMap((entry) => [...entry.rawLabels]),
	);
	return [...postsByCanonical.values()]
		.map((entry) => ({
			label: entry.label,
			slug: slugMap.get(entry.label) ?? getStableTagSlug(entry.label),
			count: entry.posts.length,
			posts: sortPosts(entry.posts),
		}))
		.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }) || a.slug.localeCompare(b.slug));
}

export function getTagSlugMap(posts: BlogPost[]): Map<string, string> {
	return buildTagSlugMap(posts.flatMap((post) => post.data.tags ?? []));
}

export function getArchiveLocaleLinks(
	allPosts: BlogPost[],
	page: number,
	origin = 'https://jangwook.net',
): LocaleLink[] {
	return (Object.keys(languages) as Language[])
		.map((lang) => {
			const postCount = getPublishedPosts(allPosts, lang).length;
			return { lang, pageCount: getPageCount(postCount) };
		})
		.filter(({ pageCount }) => page <= pageCount)
		.map(({ lang }) => ({ lang, url: new URL(getArchivePath(lang, page), origin).toString() }));
}

export function getTagLocaleLinks(
	allPosts: BlogPost[],
	tagSlug: string,
	origin = 'https://jangwook.net',
): LocaleLink[] {
	return (Object.keys(languages) as Language[])
		.map((lang) => ({
			lang,
			entry: getTagEntries(getPublishedPosts(allPosts, lang)).find((tag) => tag.slug === tagSlug),
		}))
		.filter(({ entry }) => Boolean(entry))
		.map(({ lang, entry }) => ({
			lang,
			url: new URL(getTagPath(lang, entry!.slug), origin).toString(),
		}));
}

export function getFallbackArchiveLinks(_page: number): Record<Language, string> {
	return Object.fromEntries(
		(Object.keys(languages) as Language[]).map((lang) => [lang, `/${lang}/blog/`]),
	) as Record<Language, string>;
}

export function getFallbackTagLinks(): Record<Language, string> {
	return Object.fromEntries(
		(Object.keys(languages) as Language[]).map((lang) => [lang, `/${lang}/tags/`]),
	) as Record<Language, string>;
}

export function getArchiveSwitcherLinks(
	allPosts: BlogPost[],
	page: number,
	origin = 'https://jangwook.net',
): Record<Language, string> {
	const links = getFallbackArchiveLinks(page);
	for (const link of getArchiveLocaleLinks(allPosts, page, origin)) {
		links[link.lang] = new URL(link.url).pathname;
	}
	return links;
}

export function getTagSwitcherLinks(
	allPosts: BlogPost[],
	tagSlug: string,
	origin = 'https://jangwook.net',
): Record<Language, string> {
	const links = getFallbackTagLinks();
	for (const link of getTagLocaleLinks(allPosts, tagSlug, origin)) {
		links[link.lang] = new URL(link.url).pathname;
	}
	return links;
}
