import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// V3: Related Post schema (all 4 languages required)
const relatedPostSchema = z.object({
	slug: z.string(),
	score: z.number().min(0).max(1),
	reason: z.object({
		ko: z.string(),
		ja: z.string(),
		en: z.string(),
		zh: z.string(),
	}),
});

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tags: z.array(z.string()).optional(),
			// V3: Related posts (optional)
			relatedPosts: z.array(relatedPostSchema).optional(),
			noindex: z.boolean().optional(),
			draft: z.boolean().optional(),
			// GEO/AEO: 글 본문 근거의 실제 FAQ (FAQPage 스키마 + 가시적 FAQ 섹션)
			faq: z
				.array(
					z.object({
						question: z.string(),
						answer: z.string(),
					})
				)
				.optional(),
		}),
});

export const collections = { blog };
