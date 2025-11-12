---
title: '静态博客的定时发布实现：Astro + GitHub Actions 自动化'
description: '使用 Astro 和 GitHub Pages 的静态博客中，如何像 WordPress 一样实现文章定时发布。利用 pubDate 过滤和定时工作流的完全自动化解决方案'
pubDate: '2025-10-13'
heroImage: ../../../assets/blog/scheduled-publishing-hero.jpg
tags:
  - astro
  - github-actions
  - automation
  - static-site
  - ci-cd
relatedPosts:
  - slug: metadata-based-recommendation-optimization
    score: 0.86
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, 웹 개발, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、Web開発、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, web development, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、Web开发、DevOps、架构主题进行关联。
  - slug: self-healing-ai-systems
    score: 0.75
    reason:
      ko: '자동화, DevOps, 아키텍처 관점에서 보완적인 내용을 제공합니다.'
      ja: 自動化、DevOps、アーキテクチャの観点から補完的な内容を提供します。
      en: >-
        Provides complementary content from automation, DevOps, architecture
        perspective.
      zh: 从自动化、DevOps、架构角度提供补充内容。
  - slug: ai-agent-collaboration-patterns
    score: 0.71
    reason:
      ko: '자동화, 아키텍처 관점에서 보완적인 내용을 제공합니다.'
      ja: 自動化、アーキテクチャの観点から補完的な内容を提供します。
      en: >-
        Provides complementary content from automation, architecture
        perspective.
      zh: 从自动化、架构角度提供补充内容。
---

## 静态网站的困境：定时发布

使用 Astro + GitHub Pages 运营博客的优势很明显：页面加载快速、零服务器成本、出色的 SEO 优化。但是，像 WordPress 这样的 CMS 中理所当然的<strong>文章定时发布功能</strong>的缺失让人不便。

想在空闲时间提前写好多篇文章，然后每天早上 9 点自动发布，但静态网站生成器只会部署构建时的文件。未来日期的文章呢？在构建时就已经生成为 HTML 并立即发布了。

本文将介绍如何通过<strong>结合 Astro 的 Content Collections 和 GitHub Actions 的定时工作流</strong>，在静态网站上实现完整的定时发布系统。基于实际应用在我博客上的代码进行说明，可以直接使用。

## 解决方案概述：三个核心要素

实现定时发布的核心在于以下三点：

### 1. 基于 pubDate 的内容过滤

在 Astro 的 Content Collections 模式（schema）中定义 `pubDate` 字段，构建时过滤掉日期晚于当前日期的文章。

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(), // 将字符串自动转换为 Date 对象
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

### 2. 智能过滤工具

在生产构建中只显示今天之前的文章，在开发环境中显示所有文章。

```typescript
// src/lib/content.ts
import type { CollectionEntry } from 'astro:content';

/**
 * 获取 JST（日本时区）基准的当前日期
 * GitHub Actions 以 UTC 运行，因此显式转换为 JST
 */
function getJSTDate(): Date {
  const now = new Date();
  const jstOffset = 9 * 60; // JST = UTC+9
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jstTime = new Date(utcTime + (jstOffset * 60000));
  return jstTime;
}

/**
 * 将 Date 转换为 YYYY-MM-DD 格式
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 按发布日期过滤博客文章
 * - 生产环境：仅 pubDate <= 今天（JST）的文章
 * - 开发/测试环境：所有文章（TEST_FLG=true）
 */
export function filterPostsByDate(
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] {
  // 设置测试标志时显示所有文章
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

<strong>核心要点</strong>：
- <strong>时区一致性</strong>：GitHub Actions 以 UTC 运行，因此显式转换为 JST（UTC+9）
- <strong>日期比较</strong>：比较到时间会很复杂，因此简化为 YYYY-MM-DD 格式
- <strong>开发模式例外</strong>：设置 `TEST_FLG=true` 可预览未来文章

### 3. GitHub Actions 定时工作流

每天在固定时间自动重新构建网站，发布当天的文章。

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:
  # 每天韩国时间 00:00（UTC 前一天 15:00）自动构建
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
      TZ: 'Asia/Tokyo' # 明确指定 JST 时区
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

<strong>工作流说明</strong>：
- <strong>push 触发器</strong>：提交到 `main` 分支时立即部署
- <strong>workflow_dispatch</strong>：可在 GitHub UI 中手动执行
- <strong>schedule 触发器</strong>：每天 UTC 15:00（JST 次日 00:00）自动执行

## 实战实现：分步指南

### 第 1 步：定义 Content Collections 模式

首先定义博客文章的类型模式。

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // 加载 Markdown/MDX 文件
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),

  // Frontmatter 模式
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(), // "2025-10-13" → 转换为 Date 对象
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

现在编写博客文章时使用以下 frontmatter：

```markdown
---
title: '定时发布测试文章'
description: '明天将发布的文章'
pubDate: '2025-10-14' # 设置为未来日期
heroImage: '../../../assets/blog/test-hero.jpg'
tags: ['test', 'scheduled']
---

## 这篇文章将于 2025 年 10 月 14 日发布！
```

### 第 2 步：创建过滤工具

在 `src/lib/content.ts` 中编写在所有页面重用的过滤逻辑。

```typescript
// src/lib/content.ts
import type { CollectionEntry } from 'astro:content';

/**
 * 检查 TEST_FLG 环境变量
 * 开发/测试模式下也显示未来文章
 */
export function shouldShowFuturePost(): boolean {
  return import.meta.env.TEST_FLG === 'true';
}

/**
 * 返回基于 JST（Asia/Tokyo）的当前日期
 */
function getJSTDate(): Date {
  const now = new Date();
  const jstOffset = 9 * 60; // UTC+9 时区
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jstTime = new Date(utcTime + (jstOffset * 60000));
  return jstTime;
}

/**
 * 将 Date 对象转换为 YYYY-MM-DD 字符串
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 博客文章日期过滤
 * - 生产环境：pubDate <= 今天（JST）
 * - 测试环境：所有文章
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

### 第 3 步：更新博客索引页面

应用过滤函数，仅显示已发布的文章。

```astro
---
// src/pages/[lang]/blog/index.astro
import { getCollection } from 'astro:content';
import { filterPostsByDate } from '../../../lib/content';
import BlogCard from '../../../components/BlogCard.astro';

// 获取所有博客文章
const allPosts = await getCollection('blog');

// 日期过滤 + 语言过滤 + 排序
const posts = filterPostsByDate(allPosts)
  .filter((post) => post.id.startsWith(`${lang}/`))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<main>
  <h1>博客</h1>
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

### 第 4 步：更新动态文章页面

单个文章页面也同样进行过滤。

```astro
---
// src/pages/[lang]/blog/[...slug].astro
import { type CollectionEntry, getCollection, render } from 'astro:content';
import { filterPostsByDate } from '../../../lib/content';
import BlogPost from '../../../layouts/BlogPost.astro';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const posts = filterPostsByDate(allPosts); // 应用过滤
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

<strong>重要</strong>：如果不在 `getStaticPaths()` 中过滤，也会生成未来文章的路径，可以直接通过 URL 访问。必须在这里也进行过滤。

### 第 5 步：设置 GitHub Actions 工作流

创建 `.github/workflows/deploy.yml` 文件。

```yaml
name: Deploy to GitHub Pages

on:
  # 推送到 main 分支时部署
  push:
    branches: [main]

  # 可手动执行
  workflow_dispatch:

  # 定时执行：每天 JST 00:00（UTC 前一天 15:00）
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
      TZ: 'Asia/Tokyo' # 明确指定时区
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

<strong>Cron 语法说明</strong>：
```
"0 15 * * *"
 │  │  │ │ │
 │  │  │ │ └─ 星期（0-6，周日-周六）
 │  │  │ └─── 月份（1-12）
 │  │  └───── 日期（1-31）
 │  └──────── 小时（0-23，UTC）
 └─────────── 分钟（0-59）
```

- `"0 15 * * *"` = 每天 UTC 15:00（JST 次日 00:00）
- `"0 9 * * *"` = 每天 UTC 09:00（JST 18:00）
- `"0 0 * * 1"` = 每周一 UTC 00:00（JST 09:00）

### 第 6 步：本地测试

编写未来文章并在本地进行测试。

```bash
# 1. 编写未来日期的文章
# src/content/blog/ko/future-post.md
# pubDate: '2025-10-20'

# 2. 以测试模式运行开发服务器（显示所有文章）
TEST_FLG=true npm run dev

# 3. 生产构建测试（应用过滤）
npm run build
npm run preview

# 4. 检查构建结果：确认未来文章不显示
```

<strong>预期行为</strong>：
- `TEST_FLG=true`：显示未来文章 ✓
- 生产构建：隐藏未来文章 ✓

### 第 7 步：配置 GitHub Pages

1. <strong>GitHub 仓库设置</strong>：
   - Settings → Pages → 将 Source 改为 "GitHub Actions"

2. <strong>首次部署</strong>：
   ```bash
   git add .
   git commit -m "feat: add scheduled publishing"
   git push origin main
   ```

3. <strong>在 Actions 标签中确认部署</strong>：
   - 确认 "Deploy to GitHub Pages" 工作流执行
   - 成功后访问网站确认未来文章不显示

4. <strong>确认计划</strong>：
   - Actions 标签 → "Deploy to GitHub Pages" → 右侧菜单 → "View workflow runs"
   - 确认下次执行时间

## 高级使用技巧

### 按时区定制设置

<strong>基于韩国时间（KST = UTC+9）</strong>：
```yaml
schedule:
  - cron: "0 15 * * *" # 每天 KST 00:00
```

<strong>基于美国东部时间（EST = UTC-5）</strong>：
```yaml
schedule:
  - cron: "0 14 * * *" # 每天 EST 09:00
```

<strong>基于欧洲中部时间（CET = UTC+1）</strong>：
```yaml
schedule:
  - cron: "0 8 * * *" # 每天 CET 09:00
```

### 多时区构建

一天多次构建以实现更精确的定时发布：

```yaml
schedule:
  - cron: "0 0 * * *"   # JST 09:00（早上）
  - cron: "0 6 * * *"   # JST 15:00（下午）
  - cron: "0 12 * * *"  # JST 21:00（晚上）
```

<strong>注意</strong>：GitHub Actions 免费计划每月限制 2,000 分钟。如果构建时间为 5 分钟，一天构建 3 次，每月使用 450 分钟（有余量）。

### RSS Feed 过滤

RSS feed 也应用过滤：

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { filterPostsByDate } from '../lib/content';

export async function GET(context) {
  const allPosts = await getCollection('blog');
  const posts = filterPostsByDate(allPosts) // 过滤
    .filter((post) => post.id.startsWith('ko/'))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: '博客标题',
    description: '博客描述',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/ko/blog/${post.id}/`,
    })),
  });
}
```

### Sitemap 过滤

Astro 的 `@astrojs/sitemap` 集成会自动将生成的页面添加到 sitemap。在 `getStaticPaths()` 中过滤后，sitemap 也会自动过滤。

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourdomain.com',
  integrations: [
    sitemap(), // 自动仅包含过滤后的页面
  ],
});
```

## 问题排查（Troubleshooting）

### 问题 1：未来文章立即发布

<strong>原因</strong>：未应用过滤

<strong>解决</strong>：
1. 确认在 `getStaticPaths()` 和 `getCollection()` 调用中都应用了 `filterPostsByDate()`
2. 检查构建日志：
   ```bash
   npm run build
   # 在输出中确认文章数量
   ```

### 问题 2：计划未执行

<strong>原因</strong>：GitHub Actions 设置问题

<strong>解决</strong>：
1. <strong>确认仓库激活</strong>：Actions 标签是否已激活
2. <strong>验证 cron 语法</strong>：在 [Crontab.guru](https://crontab.guru) 中确认
3. <strong>最后提交日期</strong>：如果 60 天以上没有提交，计划会自动停止
   - 解决：推送虚拟提交或手动执行

### 问题 3：时区不匹配

<strong>原因</strong>：UTC 和本地时区混淆

<strong>解决</strong>：
1. <strong>确认工作流 `env.TZ`</strong>：
   ```yaml
   env:
     TZ: 'Asia/Tokyo'
   ```

2. <strong>确认过滤函数时区</strong>：
   ```typescript
   function getJSTDate(): Date {
     const now = new Date();
     const jstOffset = 9 * 60; // JST = UTC+9
     // ...
   }
   ```

3. <strong>测试</strong>：
   ```bash
   # 在 GitHub Actions 日志中确认构建时间
   date（执行时间是否为正确的时区）
   ```

### 问题 4：开发模式下未来文章不显示

<strong>原因</strong>：未设置 `TEST_FLG` 环境变量

<strong>解决</strong>：
```bash
# 创建 .env 文件
echo "TEST_FLG=true" > .env

# 或直接在命令中传递
TEST_FLG=true npm run dev
```

## 性能与成本

### GitHub Actions 成本

<strong>免费计划</strong>：
- 每月 2,000 分钟免费
- 构建时间：约 2-5 分钟（根据项目大小）
- 每天构建 1 次：每月使用 60-150 分钟
- <strong>结论</strong>：免费计划足够 ✓

<strong>付费计划</strong>：
- Team：每月 $4，3,000 分钟/月
- Enterprise：定制费用

### 构建优化

减少 Astro 构建时间的方法：

```javascript
// astro.config.mjs
export default defineConfig({
  // 1. 图像优化并行处理
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  // 2. 构建缓存（Vercel/Netlify 中自动）
  build: {
    inlineStylesheets: 'auto',
  },
});
```

<strong>额外优化</strong>：
- <strong>依赖缓存</strong>：使用 `actions/cache`
- <strong>增量构建</strong>：Astro 4.0+ 支持

```yaml
# 依赖缓存示例
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## 与其他方法比较

### 方法 1：Netlify/Vercel 定时构建

<strong>优点</strong>：
- 可在 GUI 中设置
- 平台集成缓存

<strong>缺点</strong>：
- 平台依赖
- 免费计划限制（Netlify：每月 300 分钟）

### 方法 2：外部 Cron 服务（例如：cron-job.org）

<strong>优点</strong>：
- 不消耗 GitHub Actions 配额

<strong>缺点</strong>：
- 需要 Webhook 设置
- 安全令牌管理
- 依赖额外服务

### 方法 3：Serverless 函数（例如：Cloudflare Workers）

<strong>优点</strong>：
- 可实现实时过滤

<strong>缺点</strong>：
- 不再是静态网站
- 复杂度增加
- 需要额外服务

<strong>推荐</strong>：<strong>GitHub Actions 方式最简单且免费，与 GitHub Pages 完美集成</strong>

## 结论

结合 Astro 和 GitHub Actions，即使在静态博客中也能像 WordPress 一样构建<strong>完全自动化的定时发布系统</strong>。

### 核心要点总结

✅ <strong>在 Content Collections 模式中定义 pubDate</strong>
✅ <strong>编写日期过滤工具</strong>（明确指定 JST 时区）
✅ <strong>在所有页面应用过滤</strong>（索引、动态页面、RSS）
✅ <strong>设置 GitHub Actions 定时工作流</strong>（cron 表达式）
✅ <strong>本地测试</strong>（TEST_FLG=true）
✅ <strong>生产部署和验证</strong>

### 这种方式的优点

1. <strong>零成本</strong>：GitHub Actions 免费计划足够
2. <strong>完全自动化</strong>：设置一次即可永久运行
3. <strong>时区控制</strong>：按所需时区精确发布
4. <strong>开发友好</strong>：可在测试模式下预览
5. <strong>平台独立</strong>：除 GitHub Pages 外，在 Netlify、Vercel 等任何平台都可运行

现在可以在空闲时间提前写好文章，每天早上自动为读者献上新文章。同时享受静态网站的速度和 WordPress 的便利性！

## 参考资料

- [Astro Content Collections 官方文档](https://docs.astro.build/en/guides/content-collections/)
- [GitHub Actions 定时事件](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Cron 表达式指南](https://crontab.guru)
- [Astro 官方 GitHub Actions](https://github.com/withastro/action)
- [GitHub Pages 部署指南](https://docs.github.com/en/pages)
