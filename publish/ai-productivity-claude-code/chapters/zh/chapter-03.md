# Chapter 3: 第一个代理任务

本章将学习如何使用 Claude Code 执行实际的开发工作。每个 Recipe 都可以独立运行,提供可在实际工作中立即应用的模式。

---

## Recipe 3.1: 生成代码

### 问题 (Problem)

需要实现新功能,但编写样板代码(boilerplate code)需要大量时间。特别是从类型定义、错误处理到测试代码的编写,需要重复大量工作。

例如,假设要在博客应用中添加"按标签筛选文章"功能。需要进行以下工作:

- 创建 API 端点
- 定义类型
- 错误处理
- 编写测试代码
- 编写文档

### 解决方案 (Solution)

向 Claude Code 提供明确的需求来生成代码。核心是遵循**提供上下文(context) → 具体请求 → 验证 → 改进**的循环。

#### 步骤 1: 提供项目上下文

```
目前正在开发基于 Astro 的博客项目。
src/content/blog/ 目录中有 Markdown 文章,
每篇文章的 frontmatter 中都有 tags 数组。

示例:
---
title: "TypeScript 5.0 新功能"
tags: ["typescript", "javascript", "programming"]
pubDate: "2025-01-15"
---
```

#### 步骤 2: 具体请求

```
希望添加按标签筛选文章的功能。

需求:
1. 在 /tags/[tag] 路由中显示特定标签的文章列表
2. 在 /tags 页面显示所有标签和文章数量
3. 在每篇博客文章底部可点击显示标签
4. 保证 TypeScript 类型安全

请读取相关文件并实现。
```

#### 步骤 3: 观察 Claude 的探索和实现

Claude Code 按以下方式工作:

1. 探索相关文件 (`src/content.config.ts`, `src/pages/blog/` 等)
2. 分析现有模式
3. 创建新文件或修改现有文件
4. 执行类型检查

#### 步骤 4: 验证和改进请求

```
运行良好!几个改进请求:
1. 请按字母顺序排序标签
2. 不显示没有文章的标签
3. 请添加 SEO 的 meta 标签
```

### 代码/示例 (Code)

#### 生成的文件 1: `src/pages/tags/index.astro`

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

// 从所有博客文章中提取标签
const posts = await getCollection('blog');
const tagMap = new Map<string, number>();

posts.forEach(post => {
  const tags = post.data.tags || [];
  tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    tagMap.set(lowerTag, (tagMap.get(lowerTag) || 0) + 1);
  });
});

// 按字母顺序排序标签
const tagCounts: TagCount[] = Array.from(tagMap.entries())
  .map(([tag, count]) => ({ tag, count }))
  .filter(({ count }) => count > 0)  // 仅包含有文章的标签
  .sort((a, b) => a.tag.localeCompare(b.tag));

const totalPosts = posts.length;
---

<!DOCTYPE html>
<html lang="ko">
  <head>
    <BaseHead
      title="所有标签 - 博客"
      description={`浏览 ${tagCounts.length} 个标签分类的 ${totalPosts} 篇文章`}
    />
  </head>
  <body>
    <Header />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">所有标签</h1>
      <p class="text-gray-600 mb-6">
        共 {tagCounts.length} 个标签, {totalPosts} 篇文章
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

#### 生成的文件 2: `src/pages/tags/[tag].astro`

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

  // 收集所有唯一标签
  posts.forEach(post => {
    const tags = post.data.tags || [];
    tags.forEach(tag => tagSet.add(tag.toLowerCase()));
  });

  // 为每个标签生成路径
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
<html lang="ko">
  <head>
    <BaseHead
      title={`标签: ${tag} - 博客`}
      description={`带有 "${tag}" 标签的 ${posts.length} 篇文章`}
    />
  </head>
  <body>
    <Header />
    <main class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">
          标签: <span class="text-blue-600">#{tag}</span>
        </h1>
        <p class="text-gray-600">{posts.length} 篇文章</p>
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

#### 修改的文件: `src/layouts/BlogPost.astro` (底部添加标签)

```astro
---
// ... 现有代码 ...
const { title, description, pubDate, updatedDate, heroImage, tags } = Astro.props;
---

<!-- ... 现有 HTML ... -->

<article>
  <!-- 文章内容 -->
  <slot />

  <!-- 添加标签部分 -->
  {tags && tags.length > 0 && (
    <div class="mt-8 pt-8 border-t">
      <h3 class="text-lg font-semibold mb-3">标签</h3>
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

### 说明 (Explanation)

#### 1. 静态路径生成 (Static Path Generation)

```typescript
export async function getStaticPaths() {
  // 构建时预先生成所有可能的路径
  const posts = await getCollection('blog');
  const tagSet = new Set<string>();

  // 收集并规范化标签(转换为小写)
  posts.forEach(post => {
    (post.data.tags || []).forEach(tag => tagSet.add(tag.toLowerCase()));
  });

  // 返回每个标签的路径和 props
  return Array.from(tagSet).map(tag => ({
    params: { tag },           // URL 参数
    props: { posts, tag },     // 传递给页面的数据
  }));
}
```

由于 Astro 的静态站点生成(SSG)特性,需要在构建时预先生成所有路径。`getStaticPaths()` 会生成所有可能的 URL,如 `/tags/typescript`、`/tags/javascript` 等。

#### 2. 类型安全

```typescript
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'blog'>[];  // 类型检查
  tag: string;
}

const { posts, tag } = Astro.props;  // 支持自动完成
```

使用 TypeScript 在编译时捕获错误。`CollectionEntry<'blog'>` 是 Astro 自动生成的类型,保证包含 `title`、`description`、`pubDate` 等字段。

#### 3. SEO 优化

```astro
<BaseHead
  title={`标签: ${tag} - 博客`}
  description={`带有 "${tag}" 标签的 ${posts.length} 篇文章`}
/>
```

为每个标签页生成唯一的元数据,改善搜索引擎优化。

#### 4. 用户体验 (UX)

- **视觉反馈**: 当前标签用蓝色高亮显示
- **悬停效果**: 鼠标悬停时改变颜色并显示阴影效果
- **响应式设计**: 根据屏幕大小调整网格列数

### 变体 (Variations)

#### 变体 1: 显示热门标签

```astro
---
// 仅显示前 10 个热门标签
const popularTags = tagCounts
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);
---

<section class="mb-8">
  <h2 class="text-2xl font-bold mb-4">热门标签</h2>
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

**使用场景**: 在首页或侧边栏快速展示热门主题时。

#### 变体 2: 添加搜索功能

```astro
---
// 在 src/pages/tags/index.astro 中添加搜索功能
---

<div class="mb-6">
  <input
    type="text"
    id="tag-search"
    placeholder="搜索标签..."
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

**使用场景**: 当标签超过 50 个时,帮助用户快速找到所需标签。

#### 变体 3: 推荐相关标签

```typescript
// 计算标签间的关联性(基于在同一文章中出现的频率)
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
// 在 src/pages/tags/[tag].astro 中使用
const relatedTags = getRelatedTags(tag, allPosts);
---

{relatedTags.length > 0 && (
  <aside class="mt-8 p-6 bg-gray-100 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">相关标签</h3>
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

**使用场景**: 引导用户探索感兴趣主题的其他方面。例如,向查看"TypeScript"标签的用户推荐"JavaScript"、"Node.js"标签。

---

## Recipe 3.2: 修复 Bug

### 问题 (Problem)

生产环境中偶尔发生 Bug。查看日志后发现在特定条件下引用了 `undefined` 导致错误。由于代码库较大且跨越多个文件,很难找到原因。

**错误信息**:
```
TypeError: Cannot read property 'heroImage' of undefined
    at BlogPost.astro:15:23
```

**重现条件**:
- 在特定博客文章(主要是旧文章)中发生
- 在没有 heroImage 字段的文章中发生
- 构建成功但运行时错误

### 解决方案 (Solution)

使用 Claude Code 系统地跟踪和修复 Bug。核心是遵循**提供错误上下文 → 分析原因 → 修复 → 验证**的流程。

#### 步骤 1: 提供错误信息

```
发生了以下错误:

TypeError: Cannot read property 'heroImage' of undefined
    at BlogPost.astro:15:23

症状:
- 在没有 heroImage 的旧文章中发生
- 构建成功但页面加载时出错
- 只在部分文章中发生,不是所有文章

请读取相关文件并找出原因。
```

#### 步骤 2: 观察 Claude 的调试过程

Claude 按以下顺序工作:

1. **读取错误发生文件**: 检查 `src/layouts/BlogPost.astro:15`
2. **探索相关组件**: 检查图像处理逻辑
3. **审查 Content Collections 架构**: 确认 `heroImage` 是否为可选字段
4. **识别问题原因**: 发现缺少 Optional chaining

#### 步骤 3: 确认修复内容

```
找到原因了!
heroImage 是可选字段,但代码中假设它始终存在。

修复方法:
1. 使用 Optional chaining (?. 运算符)
2. 提供默认图像
3. 条件渲染

您更喜欢哪种方式?
```

#### 步骤 4: 应用修复

```
请使用提供默认图像的方式修复。
默认图像使用 /public/default-hero.jpg。
```

### 代码/示例 (Code)

#### 修复前 (有 Bug 的代码)

```astro
---
// src/layouts/BlogPost.astro
import { Image } from 'astro:assets';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  heroImage?: ImageMetadata;  // 可选字段
}

const { title, description, pubDate, heroImage } = Astro.props;
---

<article>
  <!-- 问题: heroImage 不存在时会出错 -->
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

#### 修复后 (安全代码)

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

// 处理默认图像
const displayImage = heroImage || defaultHeroImage;
---

<article>
  <!-- 安全: 始终显示有效图像 -->
  <Image
    src={displayImage}
    alt={title}
    width={1020}
    height={510}
    class={heroImage ? '' : 'opacity-50'}
  />

  {!heroImage && (
    <p class="text-sm text-gray-500 mt-2">
      * 正在显示默认图像
    </p>
  )}

  <h1>{title}</h1>
  <p>{description}</p>
</article>
```

#### 额外防御代码: 更新 Content Collections 架构

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1, '标题是必需的'),
    description: z.string().min(10, '描述至少需要 10 个字符'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // 改进: 提供默认值或加强验证
    heroImage: image().optional().default('./default-hero.jpg'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

### 说明 (Explanation)

#### 1. Optional Chaining 的局限性

```typescript
// 这种方式可以防止错误,但图像不会被渲染
<Image src={heroImage?.src} alt={title} />  // ❌ heroImage 为 undefined 时 src 也是 undefined
```

仅使用 Optional chaining 是不够的。当 `heroImage` 为 `undefined` 时,向 `Image` 组件传递 `undefined` 仍会导致错误。

#### 2. Fallback 模式 (推荐)

```typescript
const displayImage = heroImage || defaultHeroImage;
```

这种模式:
- **安全性**: 始终提供有效图像
- **用户体验**: 显示默认图像而不是空白空间
- **清晰性**: 代码意图明确

#### 3. 架构级防御

```typescript
heroImage: image().optional().default('./default-hero.jpg'),
```

在 Content Collections 架构中提供默认值:
- 即使在 frontmatter 中省略 `heroImage`,也会自动分配默认图像
- 类型系统将 `heroImage` 视为始终存在
- 消除运行时错误的可能性

#### 4. 防御式编程 (Defensive Programming)

```astro
{!heroImage && (
  <p class="text-sm text-gray-500 mt-2">
    * 正在显示默认图像
  </p>
)}
```

向用户提供明确的反馈:
- 开发人员可以识别问题
- 用户不会感到困惑

### 变体 (Variations)

#### 变体 1: 动态默认图像 (按类别)

```astro
---
import techHero from '../assets/heroes/tech.jpg';
import designHero from '../assets/heroes/design.jpg';
import blogHero from '../assets/heroes/blog.jpg';

const { title, heroImage, tags = [] } = Astro.props;

// 根据标签选择默认图像
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

**使用场景**: 为不同类别提供视觉上有区分的默认图像,提供更好的用户体验。

#### 变体 2: 图像验证和错误报告

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
    console.warn(`[BlogPost] "${title}": 未提供 heroImage。使用默认图像。`);
    return {
      isValid: false,
      error: 'No hero image provided',
      fallback: defaultHeroImage,
    };
  }

  // 验证图像尺寸(推荐比例: 2:1)
  const { width, height } = heroImage;
  const aspectRatio = width / height;

  if (Math.abs(aspectRatio - 2) > 0.1) {  // 偏离 2:1 比例超过 10%
    console.warn(
      `[BlogPost] "${title}": 图像比例与推荐值(2:1)不同。` +
      `当前: ${aspectRatio.toFixed(2)}:1`
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
    <p class="font-bold">开发模式警告</p>
    <p>此文章没有 heroImage。将显示默认图像。</p>
  </div>
)}
```

**使用场景**: 在开发过程中及早发现图像相关问题,在生产环境中自动恢复。

#### 变体 3: 自动图像生成 (基于 AI)

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

  // 检查图像是否已存在
  try {
    await fs.access(outputPath);
    return outputPath;  // 已存在则跳过
  } catch {
    // 文件不存在则生成
  }

  // 使用 Gemini API 生成图像
  const prompt = `
    Create a modern, professional hero image for a blog post.
    Title: ${title}
    Topics: ${tags.join(', ')}
    Style: Clean, tech-focused, 2:1 aspect ratio
  `;

  // 实际 API 调用 (示例)
  // const imageUrl = await callGeminiAPI(prompt);
  // await downloadImage(imageUrl, outputPath);

  console.log(`[Auto] "${title}" 的 hero 图像生成完成: ${outputPath}`);
  return outputPath;
}
```

```astro
---
// 构建时自动生成图像
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

**使用场景**: 批量创建文章时无需逐一制作 hero 图像,可自动生成。

---

## Recipe 3.3: 请求重构

### 问题 (Problem)

代码变得越来越复杂。在多个组件中发现了重复逻辑,编写测试也变得困难。特别是获取博客文章列表的逻辑分散在多个地方。

**当前问题**:
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

相同的逻辑重复了 3 次!

### 解决方案 (Solution)

使用 Claude Code 提取重复代码并重构为可重用的工具函数。

#### 步骤 1: 指定重构范围

```
获取博客文章的逻辑在多个文件中重复。

问题点:
1. 语言过滤逻辑重复 (ko/ 检查)
2. 排序逻辑重复 (基于 pubDate)
3. 修改时需要更改多个地方

请求:
在 src/utils/ 文件夹中创建可重用的工具函数。
保证类型安全,并使其易于编写测试。
```

#### 步骤 2: 确认 Claude 的重构计划

Claude 提出以下计划:

```
重构计划:

1. 创建 src/utils/blog.ts
   - getBlogPosts(): 基本文章查询
   - getPostsByLanguage(): 按语言过滤
   - getRecentPosts(): 查询最新文章
   - getPostsByTag(): 按标签过滤

2. 改进类型定义
   - 添加 SupportedLanguage 类型
   - 添加 SortOrder 类型

3. 修改现有文件
   - index.astro, blog/index.astro, tags/[tag].astro
   - 删除重复代码,使用工具函数

4. 编写测试 (可选)
   - src/utils/blog.test.ts

是否继续?
```

#### 步骤 3: 确认实现并提供反馈

```
很好!几个额外请求:
1. 添加缓存功能 (重复请求时提高性能)
2. 加强错误处理
3. 使用 JSDoc 注释编写文档
```

### 代码/示例 (Code)

#### 生成的文件: `src/utils/blog.ts`

```typescript
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

/**
 * 支持的语言代码
 */
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

/**
 * 排序顺序
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 博客文章查询选项
 */
export interface GetPostsOptions {
  language?: SupportedLanguage;
  limit?: number;
  sortBy?: 'pubDate' | 'updatedDate' | 'title';
  sortOrder?: SortOrder;
  includeDrafts?: boolean;
}

/**
 * 缓存存储 (构建时性能改进)
 */
const postsCache = new Map<string, CollectionEntry<'blog'>[]>();

/**
 * 获取所有博客文章 (应用缓存)
 *
 * @returns 完整博客文章数组
 * @throws Error 文章加载失败时
 *
 * @example
 * ```typescript
 * const posts = await getBlogPosts();
 * console.log(`共 ${posts.length} 篇文章`);
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
    console.error('[getBlogPosts] 文章加载失败:', error);
    throw new Error('无法加载博客文章');
  }
}

/**
 * 获取特定语言的博客文章
 *
 * @param language - 语言代码 (ko, en, ja, zh)
 * @param options - 额外选项 (排序、限制等)
 * @returns 过滤和排序后的文章数组
 *
 * @example
 * ```typescript
 * // 韩语最新 5 篇文章
 * const posts = await getPostsByLanguage('ko', { limit: 5 });
 *
 * // 英语文章按标题排序
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

  // 语言过滤
  posts = posts.filter(post => post.id.startsWith(`${language}/`));

  // 排除草稿 (可选)
  if (!includeDrafts) {
    posts = posts.filter(post => !post.data.draft);
  }

  // 排序
  posts = sortPosts(posts, sortBy, sortOrder);

  // 限制
  if (limit !== undefined && limit > 0) {
    posts = posts.slice(0, limit);
  }

  return posts;
}

/**
 * 获取最新文章
 *
 * @param language - 语言代码 (可选,未指定则为全部)
 * @param limit - 最大文章数 (默认: 10)
 * @returns 最新文章数组
 *
 * @example
 * ```typescript
 * // 所有语言的最新 10 篇
 * const recent = await getRecentPosts();
 *
 * // 韩语最新 5 篇
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
 * 获取特定标签的文章
 *
 * @param tag - 标签 (不区分大小写)
 * @param language - 语言代码 (可选)
 * @returns 标签匹配的文章数组
 *
 * @example
 * ```typescript
 * // 'typescript' 标签的所有文章
 * const posts = await getPostsByTag('typescript');
 *
 * // 仅韩语 'typescript' 文章
 * const posts = await getPostsByTag('typescript', 'ko');
 * ```
 */
export async function getPostsByTag(
  tag: string,
  language?: SupportedLanguage
): Promise<CollectionEntry<'blog'>[]> {
  const normalizedTag = tag.toLowerCase();
  let posts = await getBlogPosts();

  // 语言过滤
  if (language) {
    posts = posts.filter(post => post.id.startsWith(`${language}/`));
  }

  // 标签过滤
  posts = posts.filter(post =>
    (post.data.tags || [])
      .map(t => t.toLowerCase())
      .includes(normalizedTag)
  );

  // 按最新排序
  return sortPosts(posts, 'pubDate', 'desc');
}

/**
 * 对文章数组进行排序
 *
 * @param posts - 要排序的文章数组
 * @param sortBy - 排序基准字段
 * @param sortOrder - 排序顺序 (asc/desc)
 * @returns 排序后的文章数组
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
 * 获取特定文章的相关文章
 *
 * @param currentSlug - 当前文章的 slug
 * @param limit - 最大相关文章数
 * @returns 相关文章数组
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

  // 查找相同语言、相同标签的文章
  const related = posts
    .filter(post =>
      post.id !== currentSlug &&  // 排除自身
      post.id.startsWith(`${language}/`) &&  // 相同语言
      (post.data.tags || []).some(tag =>
        currentTags.includes(tag.toLowerCase())
      )  // 有标签重复
    )
    .map(post => {
      // 根据标签重复数计算相关性分数
      const postTags = (post.data.tags || []).map(t => t.toLowerCase());
      const commonTags = currentTags.filter(tag => postTags.includes(tag));
      return { post, score: commonTags.length };
    })
    .sort((a, b) => b.score - a.score)  // 按分数降序
    .slice(0, limit)
    .map(({ post }) => post);

  return related;
}
```

#### 修改的文件: `src/pages/index.astro`

```astro
---
import { getRecentPosts } from '../utils/blog';

// 重构前:
// const posts = (await getCollection('blog'))
//   .filter(post => post.id.startsWith('ko/'))
//   .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
//   .slice(0, 5);

// 重构后:
const posts = await getRecentPosts('ko', 5);
---

<h2>最新文章</h2>
{posts.map(post => (
  <article>
    <h3>{post.data.title}</h3>
  </article>
))}
```

#### 修改的文件: `src/pages/tags/[tag].astro`

```astro
---
import { getPostsByTag } from '../../utils/blog';

export async function getStaticPaths() {
  // ... 标签列表生成逻辑 ...

  return Array.from(tagSet).map(tag => ({
    params: { tag },
    props: {
      // 重构前: 复杂的过滤逻辑
      // 重构后: 一行
      posts: await getPostsByTag(tag, 'ko'),
      tag,
    },
  }));
}

const { posts, tag } = Astro.props;
---
```

### 说明 (Explanation)

#### 1. 单一职责原则 (Single Responsibility Principle)

每个函数都有一个明确的职责:
- `getBlogPosts()`: 文章加载和缓存
- `getPostsByLanguage()`: 语言过滤
- `getPostsByTag()`: 标签过滤
- `sortPosts()`: 排序

这样分离的好处:
- **易于测试**: 独立测试每个函数
- **可重用性**: 仅组合所需函数使用
- **可维护性**: 修复 Bug 时只需更改一处

#### 2. 加强类型安全

```typescript
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

// 使用时支持自动完成和类型检查
const posts = await getPostsByLanguage('ko');  // ✓
const posts = await getPostsByLanguage('fr');  // ✗ 编译错误
```

#### 3. 通过缓存优化性能

```typescript
const postsCache = new Map<string, CollectionEntry<'blog'>[]>();

if (postsCache.has(cacheKey)) {
  return postsCache.get(cacheKey)!;  // 立即返回缓存结果
}
```

构建时在多个页面中重复调用 `getCollection('blog')` 会变慢。通过缓存在首次调用后重用结果。

#### 4. 通过 JSDoc 编写文档

```typescript
/**
 * 获取特定语言的博客文章
 *
 * @param language - 语言代码 (ko, en, ja, zh)
 * @param options - 额外选项 (排序、限制等)
 * @returns 过滤和排序后的文章数组
 *
 * @example
 * ```typescript
 * const posts = await getPostsByLanguage('ko', { limit: 5 });
 * ```
 */
```

在 IDE 中自动完成时会显示文档,便于理解使用方法。

### 变体 (Variations)

#### 变体 1: 添加搜索功能

```typescript
/**
 * 搜索文章 (基于标题和描述)
 *
 * @param query - 搜索词
 * @param language - 语言代码 (可选)
 * @returns 搜索结果文章数组
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

#### 变体 2: 支持分页

```typescript
export interface PaginatedPosts {
  posts: CollectionEntry<'blog'>[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 获取分页文章
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

使用示例:
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
  {hasPrev && <a href={`/blog/${currentPage - 1}`}>上一页</a>}
  <span>{currentPage} / {totalPages}</span>
  {hasNext && <a href={`/blog/${currentPage + 1}`}>下一页</a>}
</div>
```

#### 变体 3: 统计和分析函数

```typescript
/**
 * 返回博客统计信息
 */
export async function getBlogStats(language?: SupportedLanguage) {
  const posts = language
    ? await getPostsByLanguage(language)
    : await getBlogPosts();

  // 按标签统计文章数
  const tagCounts = new Map<string, number>();
  posts.forEach(post => {
    (post.data.tags || []).forEach(tag => {
      const lower = tag.toLowerCase();
      tagCounts.set(lower, (tagCounts.get(lower) || 0) + 1);
    });
  });

  // 按月统计文章数
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

使用示例:
```astro
---
// src/pages/stats.astro
import { getBlogStats } from '../utils/blog';

const stats = await getBlogStats('ko');
---

<h1>博客统计</h1>
<ul>
  <li>总文章数: {stats.totalPosts}篇</li>
  <li>总标签数: {stats.totalTags}个</li>
  <li>每篇文章平均标签: {stats.averageTagsPerPost.toFixed(1)}个</li>
</ul>

<h2>热门标签</h2>
{stats.popularTags.map(([tag, count]) => (
  <span>#{tag} ({count})</span>
))}
```

---

## 核心要点 (Key Takeaways)

### Recipe 3.1: 生成代码
- **提供明确的需求**是核心
- 遵循**上下文 → 请求 → 验证 → 改进**的循环
- 生成的代码必须经过**类型检查和构建测试**

### Recipe 3.2: 修复 Bug
- 一起提供**错误信息和重现条件**
- Claude **探索相关文件并分析原因**
- 应用**防御式编程模式**防止再次发生

### Recipe 3.3: 请求重构
- **识别重复代码**是重构的起点
- 拆分为遵循**单一职责原则**的工具函数
- 通过 **JSDoc 文档**改善团队协作

### 通用模式

所有 Recipe 中都重复以下模式:

1. **明确问题**: 具体描述要解决的问题
2. **提供上下文**: 帮助 Claude 理解项目结构
3. **渐进改进**: 重复改进而不是一次性完美的代码
4. **验证和测试**: 通过构建和类型检查确保稳定性

### 下一步

第 4 章将介绍更高级的功能:
- 跨多个文件的复杂重构
- 测试驱动开发 (TDD) 工作流
- 性能优化和性能分析
- 利用子代理进行专门化工作

---

**示例代码仓库**: 本章的所有示例可以在 [GitHub 仓库](https://github.com/example/claude-code-cookbook) 中查看。

**反馈**: 如果有更多想了解的 Recipe,请[留下 Issue](https://github.com/example/claude-code-cookbook/issues)。
