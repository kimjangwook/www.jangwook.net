# Chapter 3: First Agent Tasks

In this chapter, you'll learn how to perform actual development tasks using Claude Code. Each recipe can be executed independently and provides patterns that are immediately applicable in real-world scenarios.

---

## Recipe 3.1: Generating Code

### Problem

When implementing new features, writing boilerplate code takes a significant amount of time. Writing type definitions, error handling, and test code involves many repetitive tasks.

For example, let's say you're adding a "filter posts by tag" feature to a blog application. You need:

- API endpoint creation
- Type definitions
- Error handling
- Test code writing
- Documentation

### Solution

Generate code by providing clear requirements to Claude Code. The key is to follow the **provide context → specific request → validate → improve** cycle.

#### Step 1: Provide Project Context

```
I'm currently working on an Astro-based blog project.
There are markdown posts in the src/content/blog/ directory,
and each post has a tags array in the frontmatter.

Example:
---
title: "TypeScript 5.0 New Features"
tags: ["typescript", "javascript", "programming"]
pubDate: "2025-01-15"
---
```

#### Step 2: Specific Request

```
I want to add a feature to filter posts by tag.

Requirements:
1. Display list of posts for a specific tag at /tags/[tag] route
2. Display all tags and post counts on /tags page
3. Make tags clickable at the bottom of each blog post
4. Ensure TypeScript type safety

Please read the relevant files and implement this.
```

#### Step 3: Observe Claude's Exploration and Implementation

Claude Code works in the following order:

1. Explore related files (`src/content.config.ts`, `src/pages/blog/`, etc.)
2. Analyze existing patterns
3. Create new files or modify existing files
4. Run type checks

#### Step 4: Validation and Improvement Requests

```
It works well! A few improvement requests:
1. Sort tags alphabetically
2. Don't display tags with no posts
3. Add meta tags for SEO
```

### Code

#### Generated File 1: `src/pages/tags/index.astro`

```astro
---
import { getCollection } from 'astro:content';
import BaseHead from '../../components/BaseHead.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';

interface TagCount {
  tag: string;
  count: number;
}

// Extract tags from all blog posts
const posts = await getCollection('blog');
const tagMap = new Map<string, number>();

posts.forEach(post => {
  const tags = post.data.tags || [];
  tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    tagMap.set(lowerTag, (tagMap.get(lowerTag) || 0) + 1);
  });
});

// Sort tags alphabetically
const tagCounts: TagCount[] = Array.from(tagMap.entries())
  .map(([tag, count]) => ({ tag, count }))
  .filter(({ count }) => count > 0)  // Only tags with posts
  .sort((a, b) => a.tag.localeCompare(b.tag));

const totalPosts = posts.length;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <BaseHead
      title="All Tags - Blog"
      description={`Explore ${totalPosts} posts categorized by ${tagCounts.length} tags`}
    />
  </head>
  <body>
    <Header />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">All Tags</h1>
      <p class="text-gray-600 mb-6">
        {tagCounts.length} tags, {totalPosts} posts
      </p>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tagCounts.map(({ tag, count }) => (
          <a
            href={`/tags/${tag}`}
            class="flex justify-between items-center p-4 border rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <span class="font-medium">#{tag}</span>
            <span class="text-sm text-gray-500">{count}</span>
          </a>
        ))}
      </div>
    </main>
    <Footer />
  </body>
</html>
```

#### Generated File 2: `src/pages/tags/[tag].astro`

```astro
---
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import BaseHead from '../../components/BaseHead.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import FormattedDate from '../../components/FormattedDate.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const tagSet = new Set<string>();

  // Collect all unique tags
  posts.forEach(post => {
    const tags = post.data.tags || [];
    tags.forEach(tag => tagSet.add(tag.toLowerCase()));
  });

  // Generate paths for each tag
  return Array.from(tagSet).map(tag => ({
    params: { tag },
    props: {
      posts: posts
        .filter(post =>
          (post.data.tags || [])
            .map(t => t.toLowerCase())
            .includes(tag)
        )
        .sort((a, b) =>
          b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
        ),
      tag,
    },
  }));
}

interface Props {
  posts: CollectionEntry<'blog'>[];
  tag: string;
}

const { posts, tag } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <BaseHead
      title={`Tag: ${tag} - Blog`}
      description={`${posts.length} posts tagged with "${tag}"`}
    />
  </head>
  <body>
    <Header />
    <main class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">
          Tag: <span class="text-blue-600">#{tag}</span>
        </h1>
        <p class="text-gray-600">{posts.length} posts</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <article class="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 class="text-xl font-bold mb-2">
              <a href={`/blog/${post.slug}`} class="hover:text-blue-600">
                {post.data.title}
              </a>
            </h2>
            <FormattedDate date={post.data.pubDate} class="text-sm text-gray-500 mb-3" />
            <p class="text-gray-700 mb-4">{post.data.description}</p>
            <div class="flex flex-wrap gap-2">
              {(post.data.tags || []).map(postTag => (
                <a
                  href={`/tags/${postTag.toLowerCase()}`}
                  class={`text-xs px-2 py-1 rounded ${
                    postTag.toLowerCase() === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  #{postTag}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
    <Footer />
  </body>
</html>
```

#### Modified File: `src/layouts/BlogPost.astro` (Add tags at bottom)

```astro
---
// ... existing code ...
const { title, description, pubDate, updatedDate, heroImage, tags } = Astro.props;
---

<!-- ... existing HTML ... -->

<article>
  <!-- Post content -->
  <slot />

  <!-- Tags section added -->
  {tags && tags.length > 0 && (
    <div class="mt-8 pt-8 border-t">
      <h3 class="text-lg font-semibold mb-3">Tags</h3>
      <div class="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <a
            href={`/tags/${tag.toLowerCase()}`}
            class="px-3 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white rounded-full text-sm transition-colors"
          >
            #{tag}
          </a>
        ))}
      </div>
    </div>
  )}
</article>
```

### Explanation

#### 1. Static Path Generation

```typescript
export async function getStaticPaths() {
  // Pre-generate all possible paths at build time
  const posts = await getCollection('blog');
  const tagSet = new Set<string>();

  // Collect and normalize tags (convert to lowercase)
  posts.forEach(post => {
    (post.data.tags || []).forEach(tag => tagSet.add(tag.toLowerCase()));
  });

  // Return path and props for each tag
  return Array.from(tagSet).map(tag => ({
    params: { tag },           // URL parameter
    props: { posts, tag },     // Data to pass to page
  }));
}
```

Due to Astro's Static Site Generation (SSG) nature, all paths must be pre-generated at build time. `getStaticPaths()` generates all possible URLs like `/tags/typescript`, `/tags/javascript`.

#### 2. Type Safety

```typescript
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'blog'>[];  // Type checking
  tag: string;
}

const { posts, tag } = Astro.props;  // Autocomplete support
```

Using TypeScript catches errors at compile time. `CollectionEntry<'blog'>` is a type auto-generated by Astro, ensuring fields like `title`, `description`, `pubDate` exist.

#### 3. SEO Optimization

```astro
<BaseHead
  title={`Tag: ${tag} - Blog`}
  description={`${posts.length} posts tagged with "${tag}"`}
/>
```

Unique metadata for each tag page improves search engine optimization.

#### 4. User Experience (UX)

- **Visual Feedback**: Current tag highlighted in blue
- **Hover Effects**: Color change and shadow on mouse over
- **Responsive Design**: Grid columns adjust based on screen size

### Variations

#### Variation 1: Popular Tags Display

```astro
---
// Show only top 10 popular tags
const popularTags = tagCounts
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);
---

<section class="mb-8">
  <h2 class="text-2xl font-bold mb-4">Popular Tags</h2>
  <div class="flex flex-wrap gap-3">
    {popularTags.map(({ tag, count }) => (
      <a
        href={`/tags/${tag}`}
        class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-shadow"
        style={`font-size: ${Math.min(1 + count * 0.1, 2)}rem`}
      >
        #{tag} <span class="text-xs">({count})</span>
      </a>
    ))}
  </div>
</section>
```

**Use Case**: Quickly show popular topics on homepage or sidebar.

#### Variation 2: Add Search Functionality

```astro
---
// Add search functionality to src/pages/tags/index.astro
---

<div class="mb-6">
  <input
    type="text"
    id="tag-search"
    placeholder="Search tags..."
    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

<div id="tag-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {tagCounts.map(({ tag, count }) => (
    <a
      href={`/tags/${tag}`}
      class="tag-item flex justify-between items-center p-4 border rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
      data-tag={tag}
    >
      <span class="font-medium">#{tag}</span>
      <span class="text-sm text-gray-500">{count}</span>
    </a>
  ))}
</div>

<script>
  const searchInput = document.getElementById('tag-search') as HTMLInputElement;
  const tagItems = document.querySelectorAll('.tag-item');

  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();

    tagItems.forEach((item) => {
      const tag = item.getAttribute('data-tag') || '';
      if (tag.includes(query)) {
        (item as HTMLElement).style.display = 'flex';
      } else {
        (item as HTMLElement).style.display = 'none';
      }
    });
  });
</script>
```

**Use Case**: When there are 50+ tags, helps users quickly find the tags they want.

#### Variation 3: Related Tag Recommendations

```typescript
// Calculate tag relationships (based on co-occurrence frequency in same posts)
function getRelatedTags(targetTag: string, posts: CollectionEntry<'blog'>[], limit = 5) {
  const relatedTagCounts = new Map<string, number>();

  posts.forEach(post => {
    const tags = (post.data.tags || []).map(t => t.toLowerCase());
    if (tags.includes(targetTag)) {
      tags.forEach(tag => {
        if (tag !== targetTag) {
          relatedTagCounts.set(tag, (relatedTagCounts.get(tag) || 0) + 1);
        }
      });
    }
  });

  return Array.from(relatedTagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}
```

```astro
---
// Use in src/pages/tags/[tag].astro
const relatedTags = getRelatedTags(tag, allPosts);
---

{relatedTags.length > 0 && (
  <aside class="mt-8 p-6 bg-gray-100 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">Related Tags</h3>
    <div class="flex flex-wrap gap-2">
      {relatedTags.map(relatedTag => (
        <a
          href={`/tags/${relatedTag}`}
          class="px-3 py-1 bg-white border rounded-full hover:bg-blue-600 hover:text-white transition-colors"
        >
          #{relatedTag}
        </a>
      ))}
    </div>
  </aside>
)}
```

**Use Case**: Guide users to explore other aspects of topics they're interested in. For example, recommend "JavaScript", "Node.js" tags to users viewing "TypeScript" tag.

---

## Recipe 3.2: Fixing Bugs

### Problem

There's a bug that intermittently occurs in production. Looking at the logs, errors occur when referencing `undefined` under certain conditions. The codebase is large and spans multiple files, making it difficult to find the cause.

**Error Message**:
```
TypeError: Cannot read property 'heroImage' of undefined
    at BlogPost.astro:15:23
```

**Reproduction Conditions**:
- Occurs on certain blog posts (mainly older posts)
- Occurs on posts without heroImage field
- Build succeeds but runtime error occurs

### Solution

Use Claude Code to systematically track and fix the bug. The key is to follow the **provide error context → analyze cause → fix → validate** process.

#### Step 1: Provide Error Information

```
I'm getting the following error:

TypeError: Cannot read property 'heroImage' of undefined
    at BlogPost.astro:15:23

Symptoms:
- Occurs on older posts without heroImage
- Build succeeds but error on page load
- Only occurs on some posts, not all

Please read relevant files and find the cause.
```

#### Step 2: Observe Claude's Debugging Process

Claude works in the following order:

1. **Read error location file**: Check `src/layouts/BlogPost.astro:15`
2. **Explore related components**: Check image processing logic
3. **Review Content Collections schema**: Check if `heroImage` is optional field
4. **Identify problem cause**: Discover missing optional chaining

#### Step 3: Confirm Fix

```
I found the cause!
heroImage is an optional field but the code assumes it always exists.

Fix methods:
1. Use optional chaining (?. operator)
2. Provide default image
3. Conditional rendering

Which approach do you prefer?
```

#### Step 4: Apply Fix

```
Please fix using default image approach.
Use /public/default-hero.jpg as the default image.
```

### Code

#### Before Fix (Buggy Code)

```astro
---
// src/layouts/BlogPost.astro
import { Image } from 'astro:assets';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  heroImage?: ImageMetadata;  // Optional field
}

const { title, description, pubDate, heroImage } = Astro.props;
---

<article>
  <!-- Problem: Error when heroImage doesn't exist -->
  <Image
    src={heroImage}
    alt={title}
    width={1020}
    height={510}
  />

  <h1>{title}</h1>
  <p>{description}</p>
</article>
```

#### After Fix (Safe Code)

```astro
---
// src/layouts/BlogPost.astro
import { Image } from 'astro:assets';
import defaultHeroImage from '../assets/default-hero.jpg';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  heroImage?: ImageMetadata;
}

const { title, description, pubDate, heroImage } = Astro.props;

// Handle default image
const displayImage = heroImage || defaultHeroImage;
---

<article>
  <!-- Safe: Always display valid image -->
  <Image
    src={displayImage}
    alt={title}
    width={1020}
    height={510}
    class={heroImage ? '' : 'opacity-50'}
  />

  {!heroImage && (
    <p class="text-sm text-gray-500 mt-2">
      * Default image is being displayed
    </p>
  )}

  <h1>{title}</h1>
  <p>{description}</p>
</article>
```

#### Additional Defensive Code: Update Content Collections Schema

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Improvement: Provide default value or strengthen validation
    heroImage: image().optional().default('./default-hero.jpg'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

### Explanation

#### 1. Limitations of Optional Chaining

```typescript
// This approach prevents errors but image doesn't render
<Image src={heroImage?.src} alt={title} />  // ❌ If heroImage is undefined, src is also undefined
```

Optional chaining alone is insufficient. Passing `undefined` to the `Image` component when `heroImage` is `undefined` still causes errors.

#### 2. Fallback Pattern (Recommended)

```typescript
const displayImage = heroImage || defaultHeroImage;
```

This pattern:
- **Safety**: Always provides valid image
- **User Experience**: Shows default image instead of blank space
- **Clarity**: Code intention is clear

#### 3. Schema Level Defense

```typescript
heroImage: image().optional().default('./default-hero.jpg'),
```

Providing default value in Content Collections schema:
- Automatically assigns default image even if `heroImage` is omitted from frontmatter
- Type system treats `heroImage` as always existing
- Eliminates runtime error possibility

#### 4. Defensive Programming

```astro
{!heroImage && (
  <p class="text-sm text-gray-500 mt-2">
    * Default image is being displayed
  </p>
)}
```

Providing clear feedback to users:
- Developers can recognize the issue
- Users aren't confused

### Variations

#### Variation 1: Dynamic Default Image (By Category)

```astro
---
import techHero from '../assets/heroes/tech.jpg';
import designHero from '../assets/heroes/design.jpg';
import blogHero from '../assets/heroes/blog.jpg';

const { title, heroImage, tags = [] } = Astro.props;

// Choose default image based on tags
function getDefaultHero(tags: string[]) {
  if (tags.some(tag => ['typescript', 'javascript', 'programming'].includes(tag.toLowerCase()))) {
    return techHero;
  }
  if (tags.some(tag => ['design', 'ui', 'ux'].includes(tag.toLowerCase()))) {
    return designHero;
  }
  return blogHero;
}

const displayImage = heroImage || getDefaultHero(tags);
---
```

**Use Case**: Provide visually distinctive default images by category for better user experience.

#### Variation 2: Image Validation and Error Reporting

```astro
---
interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  fallback: ImageMetadata;
}

function validateHeroImage(
  heroImage: ImageMetadata | undefined,
  title: string
): ImageValidationResult {
  if (!heroImage) {
    console.warn(`[BlogPost] "${title}": No heroImage provided. Using default image.`);
    return {
      isValid: false,
      error: 'No hero image provided',
      fallback: defaultHeroImage,
    };
  }

  // Validate image dimensions (recommended ratio: 2:1)
  const { width, height } = heroImage;
  const aspectRatio = width / height;

  if (Math.abs(aspectRatio - 2) > 0.1) {  // More than 10% off from 2:1 ratio
    console.warn(
      `[BlogPost] "${title}": Image ratio differs from recommendation (2:1). ` +
      `Current: ${aspectRatio.toFixed(2)}:1`
    );
  }

  return {
    isValid: true,
    fallback: heroImage,
  };
}

const validation = validateHeroImage(heroImage, title);
const displayImage = validation.fallback;
---

{!validation.isValid && import.meta.env.DEV && (
  <div class="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
    <p class="font-bold">Development Mode Warning</p>
    <p>This post has no heroImage. Default image is being displayed.</p>
  </div>
)}
```

**Use Case**: Detect image-related issues early during development, automatically recover in production.

#### Variation 3: Automatic Image Generation (AI-based)

```typescript
// src/utils/generateHeroImage.ts
import fs from 'fs/promises';
import path from 'path';

interface GenerateImageOptions {
  title: string;
  tags: string[];
  outputPath: string;
}

export async function generateHeroImageIfMissing(
  options: GenerateImageOptions
): Promise<string> {
  const { title, tags, outputPath } = options;

  // Check if image already exists
  try {
    await fs.access(outputPath);
    return outputPath;  // Skip if already exists
  } catch {
    // Generate if file doesn't exist
  }

  // Image generation using Gemini API
  const prompt = `
    Create a modern, professional hero image for a blog post.
    Title: ${title}
    Topics: ${tags.join(', ')}
    Style: Clean, tech-focused, 2:1 aspect ratio
  `;

  // Actual API call (example)
  // const imageUrl = await callGeminiAPI(prompt);
  // await downloadImage(imageUrl, outputPath);

  console.log(`[Auto] Hero image for "${title}" generated: ${outputPath}`);
  return outputPath;
}
```

```astro
---
// Automatically generate image at build time
if (!heroImage && import.meta.env.PROD) {
  const generatedPath = await generateHeroImageIfMissing({
    title,
    tags: tags || [],
    outputPath: `./src/assets/blog/generated/${slug}.jpg`,
  });
  heroImage = generatedPath;
}
---
```

**Use Case**: No need to manually create hero images when writing large volumes of posts.

---

## Recipe 3.3: Requesting Refactoring

### Problem

Code is getting increasingly complex. Duplicate logic is found in multiple components, and test writing has become difficult. Particularly, logic for fetching blog posts is scattered across multiple locations.

**Current Issues**:
```astro
---
// src/pages/index.astro
const posts = (await getCollection('blog'))
  .filter(post => post.id.startsWith('ko/'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 5);
---

---
// src/pages/blog/index.astro
const posts = (await getCollection('blog'))
  .filter(post => post.id.startsWith('ko/'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

---
// src/pages/tags/[tag].astro
const allPosts = (await getCollection('blog'))
  .filter(post => post.id.startsWith('ko/'));
const posts = allPosts
  .filter(post => post.data.tags?.includes(tag))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
```

The same logic is repeated 3 times!

### Solution

Use Claude Code to extract duplicate code and refactor into reusable utility functions.

#### Step 1: Specify Refactoring Scope

```
Logic for fetching blog posts is duplicated across multiple files.

Issues:
1. Language filtering logic duplication (ko/ check)
2. Sorting logic duplication (pubDate-based)
3. Must change multiple places when modifying

Request:
Create reusable utility functions in src/utils/ folder.
Ensure type safety and make structure easy to test.
```

#### Step 2: Confirm Claude's Refactoring Plan

Claude presents a plan:

```
Refactoring Plan:

1. Create src/utils/blog.ts
   - getBlogPosts(): Basic post retrieval
   - getPostsByLanguage(): Language filtering
   - getRecentPosts(): Recent posts retrieval
   - getPostsByTag(): Tag filtering

2. Improve type definitions
   - Add SupportedLanguage type
   - Add SortOrder type

3. Modify existing files
   - index.astro, blog/index.astro, tags/[tag].astro
   - Remove duplicate code, use utility functions

4. Write tests (optional)
   - src/utils/blog.test.ts

Shall I proceed?
```

#### Step 3: Implementation Confirmation and Feedback

```
Good! A few additional requests:
1. Add caching functionality (performance improvement for repeated requests)
2. Strengthen error handling
3. Document with JSDoc comments
```

### Code

#### Generated File: `src/utils/blog.ts`

```typescript
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

/**
 * Supported language codes
 */
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Blog post retrieval options
 */
export interface GetPostsOptions {
  language?: SupportedLanguage;
  limit?: number;
  sortBy?: 'pubDate' | 'updatedDate' | 'title';
  sortOrder?: SortOrder;
  includeDrafts?: boolean;
}

/**
 * Cache storage (performance improvement at build time)
 */
const postsCache = new Map<string, CollectionEntry<'blog'>[]>();

/**
 * Get all blog posts (with caching)
 *
 * @returns Array of all blog posts
 * @throws Error if post loading fails
 *
 * @example
 * ```typescript
 * const posts = await getBlogPosts();
 * console.log(`Total ${posts.length} posts`);
 * ```
 */
export async function getBlogPosts(): Promise<CollectionEntry<'blog'>[]> {
  const cacheKey = 'all-posts';

  if (postsCache.has(cacheKey)) {
    return postsCache.get(cacheKey)!;
  }

  try {
    const posts = await getCollection('blog');
    postsCache.set(cacheKey, posts);
    return posts;
  } catch (error) {
    console.error('[getBlogPosts] Post loading failed:', error);
    throw new Error('Unable to load blog posts');
  }
}

/**
 * Get blog posts for a specific language
 *
 * @param language - Language code (ko, en, ja, zh)
 * @param options - Additional options (sort, limit, etc.)
 * @returns Filtered and sorted post array
 *
 * @example
 * ```typescript
 * // Latest 5 Korean posts
 * const posts = await getPostsByLanguage('ko', { limit: 5 });
 *
 * // English posts sorted by title
 * const posts = await getPostsByLanguage('en', {
 *   sortBy: 'title',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export async function getPostsByLanguage(
  language: SupportedLanguage,
  options: Omit<GetPostsOptions, 'language'> = {}
): Promise<CollectionEntry<'blog'>[]> {
  const {
    limit,
    sortBy = 'pubDate',
    sortOrder = 'desc',
    includeDrafts = false,
  } = options;

  let posts = await getBlogPosts();

  // Language filtering
  posts = posts.filter(post => post.id.startsWith(`${language}/`));

  // Exclude drafts (optional)
  if (!includeDrafts) {
    posts = posts.filter(post => !post.data.draft);
  }

  // Sorting
  posts = sortPosts(posts, sortBy, sortOrder);

  // Limit
  if (limit !== undefined && limit > 0) {
    posts = posts.slice(0, limit);
  }

  return posts;
}

/**
 * Get recent posts
 *
 * @param language - Language code (optional, all if not specified)
 * @param limit - Maximum number of posts (default: 10)
 * @returns Recent post array
 *
 * @example
 * ```typescript
 * // Latest 10 from all languages
 * const recent = await getRecentPosts();
 *
 * // Latest 5 Korean posts
 * const recentKo = await getRecentPosts('ko', 5);
 * ```
 */
export async function getRecentPosts(
  language?: SupportedLanguage,
  limit = 10
): Promise<CollectionEntry<'blog'>[]> {
  if (language) {
    return getPostsByLanguage(language, { limit, sortOrder: 'desc' });
  }

  const posts = await getBlogPosts();
  return sortPosts(posts, 'pubDate', 'desc').slice(0, limit);
}

/**
 * Get posts with a specific tag
 *
 * @param tag - Tag (case insensitive)
 * @param language - Language code (optional)
 * @returns Posts matching the tag
 *
 * @example
 * ```typescript
 * // All posts with 'typescript' tag
 * const posts = await getPostsByTag('typescript');
 *
 * // Only Korean 'typescript' posts
 * const posts = await getPostsByTag('typescript', 'ko');
 * ```
 */
export async function getPostsByTag(
  tag: string,
  language?: SupportedLanguage
): Promise<CollectionEntry<'blog'>[]> {
  const normalizedTag = tag.toLowerCase();
  let posts = await getBlogPosts();

  // Language filtering
  if (language) {
    posts = posts.filter(post => post.id.startsWith(`${language}/`));
  }

  // Tag filtering
  posts = posts.filter(post =>
    (post.data.tags || [])
      .map(t => t.toLowerCase())
      .includes(normalizedTag)
  );

  // Sort by latest
  return sortPosts(posts, 'pubDate', 'desc');
}

/**
 * Sort post array
 *
 * @param posts - Post array to sort
 * @param sortBy - Sort criterion field
 * @param sortOrder - Sort order (asc/desc)
 * @returns Sorted post array
 */
function sortPosts(
  posts: CollectionEntry<'blog'>[],
  sortBy: 'pubDate' | 'updatedDate' | 'title',
  sortOrder: SortOrder
): CollectionEntry<'blog'>[] {
  const sorted = [...posts].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'pubDate':
        comparison = a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
        break;
      case 'updatedDate':
        const aDate = a.data.updatedDate || a.data.pubDate;
        const bDate = b.data.updatedDate || b.data.pubDate;
        comparison = aDate.valueOf() - bDate.valueOf();
        break;
      case 'title':
        comparison = a.data.title.localeCompare(b.data.title);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Get related posts for a specific post
 *
 * @param currentSlug - Current post's slug
 * @param limit - Maximum number of related posts
 * @returns Related posts array
 *
 * @example
 * ```typescript
 * const related = await getRelatedPosts('ko/typescript-basics', 3);
 * ```
 */
export async function getRelatedPosts(
  currentSlug: string,
  limit = 3
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getBlogPosts();
  const currentPost = posts.find(p => p.id === currentSlug);

  if (!currentPost) {
    return [];
  }

  const currentTags = (currentPost.data.tags || []).map(t => t.toLowerCase());
  const language = currentSlug.split('/')[0] as SupportedLanguage;

  // Find posts with same language and same tags
  const related = posts
    .filter(post =>
      post.id !== currentSlug &&  // Exclude self
      post.id.startsWith(`${language}/`) &&  // Same language
      (post.data.tags || []).some(tag =>
        currentTags.includes(tag.toLowerCase())
      )  // Tag overlap exists
    )
    .map(post => {
      // Calculate relevance score by tag overlap count
      const postTags = (post.data.tags || []).map(t => t.toLowerCase());
      const commonTags = currentTags.filter(tag => postTags.includes(tag));
      return { post, score: commonTags.length };
    })
    .sort((a, b) => b.score - a.score)  // Sort by high score
    .slice(0, limit)
    .map(({ post }) => post);

  return related;
}
```

#### Modified File: `src/pages/index.astro`

```astro
---
import { getRecentPosts } from '../utils/blog';

// Before refactoring:
// const posts = (await getCollection('blog'))
//   .filter(post => post.id.startsWith('ko/'))
//   .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
//   .slice(0, 5);

// After refactoring:
const posts = await getRecentPosts('ko', 5);
---

<h2>Recent Posts</h2>
{posts.map(post => (
  <article>
    <h3>{post.data.title}</h3>
  </article>
))}
```

#### Modified File: `src/pages/tags/[tag].astro`

```astro
---
import { getPostsByTag } from '../../utils/blog';

export async function getStaticPaths() {
  // ... tag list generation logic ...

  return Array.from(tagSet).map(tag => ({
    params: { tag },
    props: {
      // Before refactoring: complex filtering logic
      // After refactoring: one line
      posts: await getPostsByTag(tag, 'ko'),
      tag,
    },
  }));
}

const { posts, tag } = Astro.props;
---
```

### Explanation

#### 1. Single Responsibility Principle

Each function has one clear responsibility:
- `getBlogPosts()`: Load and cache posts
- `getPostsByLanguage()`: Language filtering
- `getPostsByTag()`: Tag filtering
- `sortPosts()`: Sorting

This separation:
- **Testability**: Test each function independently
- **Reusability**: Combine only needed functions
- **Maintainability**: Change only one place for bug fixes

#### 2. Strengthened Type Safety

```typescript
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

// Autocomplete and type check during use
const posts = await getPostsByLanguage('ko');  // ✓
const posts = await getPostsByLanguage('fr');  // ✗ Compile error
```

#### 3. Performance Optimization Through Caching

```typescript
const postsCache = new Map<string, CollectionEntry<'blog'>[]>();

if (postsCache.has(cacheKey)) {
  return postsCache.get(cacheKey)!;  // Return cached result immediately
}
```

Repeated `getCollection('blog')` calls slow down builds. Caching reuses results after first call.

#### 4. Documentation via JSDoc

```typescript
/**
 * Get blog posts for a specific language
 *
 * @param language - Language code (ko, en, ja, zh)
 * @param options - Additional options (sort, limit, etc.)
 * @returns Filtered and sorted post array
 *
 * @example
 * ```typescript
 * const posts = await getPostsByLanguage('ko', { limit: 5 });
 * ```
 */
```

Documentation appears alongside autocomplete in IDE, making usage easy to understand.

### Variations

#### Variation 1: Add Search Functionality

```typescript
/**
 * Search posts (based on title and description)
 *
 * @param query - Search term
 * @param language - Language code (optional)
 * @returns Search result posts array
 */
export async function searchPosts(
  query: string,
  language?: SupportedLanguage
): Promise<CollectionEntry<'blog'>[]> {
  const normalizedQuery = query.toLowerCase();
  let posts = await getBlogPosts();

  if (language) {
    posts = posts.filter(post => post.id.startsWith(`${language}/`));
  }

  return posts.filter(post => {
    const title = post.data.title.toLowerCase();
    const description = post.data.description.toLowerCase();
    const tags = (post.data.tags || []).map(t => t.toLowerCase()).join(' ');

    return (
      title.includes(normalizedQuery) ||
      description.includes(normalizedQuery) ||
      tags.includes(normalizedQuery)
    );
  });
}
```

#### Variation 2: Pagination Support

```typescript
export interface PaginatedPosts {
  posts: CollectionEntry<'blog'>[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Get paginated posts
 */
export async function getPaginatedPosts(
  language: SupportedLanguage,
  page = 1,
  postsPerPage = 10
): Promise<PaginatedPosts> {
  const allPosts = await getPostsByLanguage(language, { sortOrder: 'desc' });
  const totalPages = Math.ceil(allPosts.length / postsPerPage);
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;

  return {
    posts: allPosts.slice(start, end),
    currentPage: page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
```

Usage example:
```astro
---
// src/pages/blog/[page].astro
export async function getStaticPaths() {
  const language = 'ko';
  const postsPerPage = 10;
  const allPosts = await getPostsByLanguage(language);
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  return Array.from({ length: totalPages }, (_, i) => ({
    params: { page: String(i + 1) },
    props: await getPaginatedPosts(language, i + 1, postsPerPage),
  }));
}

const { posts, currentPage, totalPages, hasNext, hasPrev } = Astro.props;
---

<div class="pagination">
  {hasPrev && <a href={`/blog/${currentPage - 1}`}>Previous</a>}
  <span>{currentPage} / {totalPages}</span>
  {hasNext && <a href={`/blog/${currentPage + 1}`}>Next</a>}
</div>
```

#### Variation 3: Statistics and Analysis Functions

```typescript
/**
 * Return blog statistics
 */
export async function getBlogStats(language?: SupportedLanguage) {
  const posts = language
    ? await getPostsByLanguage(language)
    : await getBlogPosts();

  // Post count per tag
  const tagCounts = new Map<string, number>();
  posts.forEach(post => {
    (post.data.tags || []).forEach(tag => {
      const lower = tag.toLowerCase();
      tagCounts.set(lower, (tagCounts.get(lower) || 0) + 1);
    });
  });

  // Post count per month
  const monthCounts = new Map<string, number>();
  posts.forEach(post => {
    const month = post.data.pubDate.toISOString().slice(0, 7);  // YYYY-MM
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  });

  return {
    totalPosts: posts.length,
    totalTags: tagCounts.size,
    popularTags: Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    postsByMonth: Array.from(monthCounts.entries())
      .sort((a, b) => b[0].localeCompare(a[0])),
    averageTagsPerPost: posts.reduce(
      (sum, post) => sum + (post.data.tags?.length || 0),
      0
    ) / posts.length,
  };
}
```

Usage example:
```astro
---
// src/pages/stats.astro
import { getBlogStats } from '../utils/blog';

const stats = await getBlogStats('ko');
---

<h1>Blog Statistics</h1>
<ul>
  <li>Total posts: {stats.totalPosts}</li>
  <li>Total tags: {stats.totalTags}</li>
  <li>Average tags per post: {stats.averageTagsPerPost.toFixed(1)}</li>
</ul>

<h2>Popular Tags</h2>
{stats.popularTags.map(([tag, count]) => (
  <span>#{tag} ({count})</span>
))}
```

---

## Key Takeaways

### Recipe 3.1: Generating Code
- **Providing clear requirements** is key
- Follow the **context → request → validate → improve** cycle
- Generated code must always go through **type checking and build testing**

### Recipe 3.2: Fixing Bugs
- Provide **error messages and reproduction conditions** together
- Claude **explores related files and analyzes the cause**
- Apply **defensive programming patterns** to prevent recurrence

### Recipe 3.3: Requesting Refactoring
- **Identifying duplicate code** is the start of refactoring
- Separate into utility functions following the **Single Responsibility Principle**
- Improve team collaboration with **JSDoc documentation**

### Common Patterns

The following patterns repeat across all recipes:

1. **Clarify Problem**: Specifically describe the problem to solve
2. **Provide Context**: Help Claude understand project structure
3. **Incremental Improvement**: Iterative improvement rather than perfect code at once
4. **Validate and Test**: Ensure stability with builds and type checks

### Next Steps

Chapter 4 covers more advanced features:
- Complex refactoring across multiple files
- Test-Driven Development (TDD) workflow
- Performance optimization and profiling
- Specialized tasks using sub-agents

---

**Example Code Repository**: All examples from this chapter can be found at [GitHub Repository](https://github.com/example/claude-code-cookbook).

**Feedback**: If you have more recipe requests, please [leave an issue](https://github.com/example/claude-code-cookbook/issues).
