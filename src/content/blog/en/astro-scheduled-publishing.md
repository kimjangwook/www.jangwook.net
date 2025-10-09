---
title: 'Implementing Scheduled Publishing on Static Sites: Automating Astro + GitHub Actions'
description: 'A practical guide to implementing WordPress-like scheduled post publishing on static blogs using Astro and GitHub Pages. Complete automation with pubDate filtering and scheduled workflows'
pubDate: '2025-10-13'
heroImage: '../../../assets/blog/scheduled-publishing-hero.jpg'
tags: ['astro', 'github-actions', 'automation', 'static-site', 'ci-cd']
---

## The Static Site Dilemma: Scheduled Publishing

Running a blog with Astro + GitHub Pages offers clear advantages: blazing-fast page loads, zero server costs, and excellent SEO optimization. However, one feature I missed from WordPress and other CMSs was **scheduled post publishing**.

I wanted to write multiple posts during my free time and have them automatically publish at 9 AM every day. But static site generators only deploy files that exist at build time. Posts with future dates? They get generated as HTML during the build and publish immediately.

In this post, I'll show you how to combine **Astro's Content Collections with GitHub Actions' scheduled workflows** to implement a complete scheduled publishing system for static sites. The code examples are based on what I actually use on my blog, so you can apply them immediately.

## Solution Overview: Three Core Components

The key to implementing scheduled publishing consists of three elements:

### 1. pubDate-Based Content Filtering

Define a `pubDate` field in Astro's Content Collections schema and filter out posts with dates in the future during the build process.

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(), // Automatically converts string to Date object
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

### 2. Smart Filtering Utility

In production builds, show only posts with dates on or before today; in development, show all posts.

```typescript
// src/lib/content.ts
import type { CollectionEntry } from 'astro:content';

/**
 * Get current date in JST (Japan timezone)
 * GitHub Actions runs in UTC, so we explicitly convert to JST
 */
function getJSTDate(): Date {
  const now = new Date();
  const jstOffset = 9 * 60; // JST = UTC+9
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jstTime = new Date(utcTime + (jstOffset * 60000));
  return jstTime;
}

/**
 * Convert Date to YYYY-MM-DD format
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Filter blog posts by publication date
 * - Production: Only posts with pubDate <= today (JST)
 * - Development/Test: All posts (when TEST_FLG=true)
 */
export function filterPostsByDate(
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] {
  // Show all posts if test flag is set
  if (import.meta.env.TEST_FLG === 'true') {
    return posts;
  }

  const today = toDateString(getJSTDate());
  return posts.filter((post) => {
    const postDate = toDateString(post.data.pubDate);
    return postDate <= today;
  });
}
```

**Key Points**:
- **Timezone consistency**: GitHub Actions runs in UTC, so we explicitly convert to JST (UTC+9)
- **Date comparison**: Comparing times is complex, so we simplify to YYYY-MM-DD format
- **Development exception**: Setting `TEST_FLG=true` allows previewing future posts

### 3. GitHub Actions Scheduled Workflow

Automatically rebuild the site at a specific time each day to publish that day's posts.

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:
  # Auto-build daily at midnight KST (3 PM UTC previous day)
  schedule:
    - cron: "0 15 * * *"

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      TZ: 'Asia/Tokyo' # Explicit JST timezone
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install, build, and upload site
        uses: withastro/action@v3
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Workflow Explanation**:
- **push trigger**: Deploys immediately when committing to `main` branch
- **workflow_dispatch**: Allows manual execution from GitHub UI
- **schedule trigger**: Runs automatically daily at UTC 15:00 (JST midnight next day)

## Practical Implementation: Step-by-Step Guide

### Step 1: Define Content Collections Schema

First, define the type schema for blog posts.

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Load Markdown/MDX files
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),

  // Frontmatter schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(), // "2025-10-13" → Date object
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

Now when writing blog posts, use frontmatter like this:

```markdown
---
title: 'Scheduled Publishing Test Post'
description: 'This post will be published tomorrow'
pubDate: '2025-10-14' # Set to future date
heroImage: '../../../assets/blog/test-hero.jpg'
tags: ['test', 'scheduled']
---

## This post will go live on October 14, 2025!
```

### Step 2: Create Filtering Utility

Write filtering logic in `src/lib/content.ts` to reuse across all pages.

```typescript
// src/lib/content.ts
import type { CollectionEntry } from 'astro:content';

/**
 * Check TEST_FLG environment variable
 * Shows future posts in development/test mode
 */
export function shouldShowFuturePost(): boolean {
  return import.meta.env.TEST_FLG === 'true';
}

/**
 * Return current date in JST (Asia/Tokyo)
 */
function getJSTDate(): Date {
  const now = new Date();
  const jstOffset = 9 * 60; // UTC+9 timezone
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jstTime = new Date(utcTime + (jstOffset * 60000));
  return jstTime;
}

/**
 * Convert Date object to YYYY-MM-DD string
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Filter blog posts by date
 * - Production: pubDate <= today (JST)
 * - Test: All posts
 */
export function filterPostsByDate(
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] {
  if (shouldShowFuturePost()) {
    return posts;
  }

  const today = toDateString(getJSTDate());
  return posts.filter((post) => {
    const postDate = toDateString(post.data.pubDate);
    return postDate <= today;
  });
}
```

### Step 3: Update Blog Index Page

Apply the filtering function to show only published posts.

```astro
---
// src/pages/[lang]/blog/index.astro
import { getCollection } from 'astro:content';
import { filterPostsByDate } from '../../../lib/content';
import BlogCard from '../../../components/BlogCard.astro';

// Get all blog posts
const allPosts = await getCollection('blog');

// Date filtering + language filtering + sorting
const posts = filterPostsByDate(allPosts)
  .filter((post) => post.id.startsWith(`${lang}/`))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<main>
  <h1>Blog</h1>
  <div class="grid">
    {posts.map((post) => (
      <BlogCard
        href={`/${lang}/blog/${post.id}/`}
        title={post.data.title}
        description={post.data.description}
        pubDate={post.data.pubDate}
        heroImage={post.data.heroImage}
        tags={post.data.tags}
      />
    ))}
  </div>
</main>
```

### Step 4: Update Dynamic Post Pages

Apply the same filtering to individual post pages.

```astro
---
// src/pages/[lang]/blog/[...slug].astro
import { type CollectionEntry, getCollection, render } from 'astro:content';
import { filterPostsByDate } from '../../../lib/content';
import BlogPost from '../../../layouts/BlogPost.astro';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const posts = filterPostsByDate(allPosts); // Apply filtering
  const langs = ['ko', 'ja', 'en'];

  return posts.flatMap((post) => {
    return langs.map((lang) => ({
      params: { lang, slug: post.id },
      props: post,
    }));
  });
}

type Props = CollectionEntry<'blog'>;

const { lang } = Astro.params;
const post = Astro.props;
const { Content } = await render(post);
---

<BlogPost {...post.data} lang={lang}>
  <Content />
</BlogPost>
```

**Important**: If you don't filter in `getStaticPaths()`, paths for future posts will be generated and accessible via direct URL. Always filter here too.

### Step 5: Configure GitHub Actions Workflow

Create a `.github/workflows/deploy.yml` file.

```yaml
name: Deploy to GitHub Pages

on:
  # Deploy on push to main branch
  push:
    branches: [main]

  # Allow manual execution
  workflow_dispatch:

  # Schedule: Daily at JST midnight (UTC 15:00 previous day)
  schedule:
    - cron: "0 15 * * *"

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      TZ: 'Asia/Tokyo' # Explicit timezone
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install, build, and upload site
        uses: withastro/action@v3
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Cron Syntax Explained**:
```
"0 15 * * *"
 │  │  │ │ │
 │  │  │ │ └─ Day of week (0-6, Sun-Sat)
 │  │  │ └─── Month (1-12)
 │  │  └───── Day of month (1-31)
 │  └──────── Hour (0-23, UTC)
 └─────────── Minute (0-59)
```

- `"0 15 * * *"` = Daily at UTC 15:00 (JST midnight next day)
- `"0 9 * * *"` = Daily at UTC 09:00 (JST 18:00)
- `"0 0 * * 1"` = Every Monday at UTC 00:00 (JST 09:00)

### Step 6: Local Testing

Create a future post and test locally.

```bash
# 1. Create future-dated post
# src/content/blog/en/future-post.md
# pubDate: '2025-10-20'

# 2. Run dev server in test mode (shows all posts)
TEST_FLG=true npm run dev

# 3. Test production build (filtering applied)
npm run build
npm run preview

# 4. Verify: Future post should not be visible
```

**Expected Behavior**:
- `TEST_FLG=true`: Future post visible ✓
- Production build: Future post hidden ✓

### Step 7: GitHub Pages Setup

1. **GitHub Repository Settings**:
   - Settings → Pages → Change Source to "GitHub Actions"

2. **First Deployment**:
   ```bash
   git add .
   git commit -m "feat: add scheduled publishing"
   git push origin main
   ```

3. **Verify Deployment in Actions Tab**:
   - Check "Deploy to GitHub Pages" workflow execution
   - After success, visit site and confirm future posts aren't visible

4. **Verify Schedule**:
   - Actions tab → "Deploy to GitHub Pages" → Right menu → "View workflow runs"
   - Check next execution time

## Advanced Tips

### Timezone-Specific Configuration

**Korea Time (KST = UTC+9)**:
```yaml
schedule:
  - cron: "0 15 * * *" # Daily at KST 00:00
```

**US Eastern Time (EST = UTC-5)**:
```yaml
schedule:
  - cron: "0 14 * * *" # Daily at EST 09:00
```

**Central European Time (CET = UTC+1)**:
```yaml
schedule:
  - cron: "0 8 * * *" # Daily at CET 09:00
```

### Multiple Daily Builds

Build multiple times per day for more precise scheduling:

```yaml
schedule:
  - cron: "0 0 * * *"   # JST 09:00 (morning)
  - cron: "0 6 * * *"   # JST 15:00 (afternoon)
  - cron: "0 12 * * *"  # JST 21:00 (evening)
```

**Note**: GitHub Actions free tier has a 2,000 minutes/month limit. If builds take 5 minutes, 3 daily builds = 450 minutes/month (plenty of room).

### RSS Feed Filtering

Apply filtering to RSS feed too:

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { filterPostsByDate } from '../lib/content';

export async function GET(context) {
  const allPosts = await getCollection('blog');
  const posts = filterPostsByDate(allPosts) // Apply filtering
    .filter((post) => post.id.startsWith('en/'))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Blog Title',
    description: 'Blog Description',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/en/blog/${post.id}/`,
    })),
  });
}
```

### Sitemap Filtering

Astro's `@astrojs/sitemap` integration automatically adds generated pages to the sitemap. Filtering in `getStaticPaths()` automatically filters the sitemap.

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourdomain.com',
  integrations: [
    sitemap(), // Automatically includes only filtered pages
  ],
});
```

## Troubleshooting

### Issue 1: Future Posts Publish Immediately

**Cause**: Filtering not applied

**Solution**:
1. Verify `filterPostsByDate()` applied to both `getStaticPaths()` and `getCollection()` calls
2. Check build logs:
   ```bash
   npm run build
   # Check post count in output
   ```

### Issue 2: Schedule Doesn't Run

**Cause**: GitHub Actions configuration issue

**Solution**:
1. **Verify repository activation**: Is Actions tab enabled?
2. **Validate cron syntax**: Check on [Crontab.guru](https://crontab.guru)
3. **Check last commit date**: Schedules auto-pause after 60 days of no commits
   - Fix: Push a dummy commit or manually trigger

### Issue 3: Wrong Timezone

**Cause**: UTC and local timezone confusion

**Solution**:
1. **Check workflow `env.TZ`**:
   ```yaml
   env:
     TZ: 'Asia/Tokyo'
   ```

2. **Check filtering function timezone**:
   ```typescript
   function getJSTDate(): Date {
     const now = new Date();
     const jstOffset = 9 * 60; // JST = UTC+9
     // ...
   }
   ```

3. **Test**:
   ```bash
   # Check build time in GitHub Actions logs
   date (verify execution time is in correct timezone)
   ```

### Issue 4: Future Posts Not Visible in Development

**Cause**: `TEST_FLG` environment variable not set

**Solution**:
```bash
# Create .env file
echo "TEST_FLG=true" > .env

# Or pass directly in command
TEST_FLG=true npm run dev
```

## Performance and Cost

### GitHub Actions Cost

**Free Tier**:
- 2,000 minutes/month free
- Build time: ~2-5 minutes (depends on project size)
- Daily builds: 60-150 minutes/month used
- **Conclusion**: Free tier is sufficient ✓

**Paid Plans**:
- Team: $4/month, 3,000 minutes/month
- Enterprise: Custom pricing

### Build Optimization

Ways to reduce Astro build time:

```javascript
// astro.config.mjs
export default defineConfig({
  // 1. Parallel image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  // 2. Build caching (automatic on Vercel/Netlify)
  build: {
    inlineStylesheets: 'auto',
  },
});
```

**Additional Optimizations**:
- **Dependency caching**: Use `actions/cache`
- **Incremental builds**: Supported in Astro 4.0+

```yaml
# Dependency caching example
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## Comparison with Other Approaches

### Approach 1: Netlify/Vercel Scheduled Builds

**Pros**:
- Configurable via GUI
- Platform-integrated caching

**Cons**:
- Platform lock-in
- Free tier limits (Netlify: 300 minutes/month)

### Approach 2: External Cron Service (e.g., cron-job.org)

**Pros**:
- Doesn't consume GitHub Actions quota

**Cons**:
- Requires webhook setup
- Security token management
- Additional service dependency

### Approach 3: Serverless Functions (e.g., Cloudflare Workers)

**Pros**:
- Real-time filtering possible

**Cons**:
- No longer a static site
- Increased complexity
- Additional service required

**Recommendation**: **GitHub Actions approach is simplest, free, and perfectly integrated with GitHub Pages**

## Conclusion

By combining Astro and GitHub Actions, you can build a **fully automated scheduled publishing system** for static blogs, just like WordPress.

### Key Takeaways

✅ **Define pubDate in Content Collections schema**
✅ **Create date filtering utility** (explicit JST timezone)
✅ **Apply filtering to all pages** (index, dynamic pages, RSS)
✅ **Configure GitHub Actions scheduled workflow** (cron expressions)
✅ **Local testing** (TEST_FLG=true)
✅ **Production deployment and verification**

### Benefits of This Approach

1. **Zero Cost**: GitHub Actions free tier is sufficient
2. **Fully Automated**: Set it once, works forever
3. **Timezone Control**: Precise publishing in your desired timezone
4. **Developer-Friendly**: Test mode for previewing
5. **Platform-Independent**: Works anywhere beyond GitHub Pages—Netlify, Vercel, etc.

Now you can write posts ahead of time and automatically deliver fresh content to readers every morning. Enjoy the speed of static sites with the convenience of WordPress!

## References

- [Astro Content Collections Official Docs](https://docs.astro.build/en/guides/content-collections/)
- [GitHub Actions Schedule Events](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Cron Expression Guide](https://crontab.guru)
- [Astro Official GitHub Actions](https://github.com/withastro/action)
- [GitHub Pages Deployment Guide](https://docs.github.com/en/pages)
