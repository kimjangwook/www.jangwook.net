# Chapter 3: 첫 번째 에이전트 작업

이 챕터에서는 Claude Code를 사용하여 실제 개발 작업을 수행하는 방법을 배웁니다. 각 레시피는 독립적으로 실행할 수 있으며, 실무에서 즉시 활용 가능한 패턴을 제공합니다.

---

## Recipe 3.1: 코드 생성하기

### 문제 (Problem)

새로운 기능을 구현해야 하는데, 보일러플레이트 코드 작성에 시간이 많이 소요됩니다. 특히 타입 정의, 에러 핸들링, 테스트 코드까지 작성하려면 반복적인 작업이 많습니다.

예를 들어, 블로그 애플리케이션에 "태그별 포스트 필터링" 기능을 추가한다고 가정해봅시다. 다음 작업이 필요합니다:

- API 엔드포인트 생성
- 타입 정의
- 에러 핸들링
- 테스트 코드 작성
- 문서 작성

### 해결책 (Solution)

Claude Code에게 명확한 요구사항을 전달하여 코드를 생성합니다. 핵심은 **컨텍스트 제공 → 구체적 요청 → 검증 → 개선** 사이클을 따르는 것입니다.

#### 단계 1: 프로젝트 컨텍스트 제공

```
현재 Astro 기반 블로그 프로젝트를 작업 중입니다.
src/content/blog/ 디렉토리에 마크다운 포스트들이 있고,
각 포스트는 frontmatter에 tags 배열을 가지고 있습니다.

예시:
---
title: "TypeScript 5.0 새로운 기능"
tags: ["typescript", "javascript", "programming"]
pubDate: "2025-01-15"
---
```

#### 단계 2: 구체적인 요청

```
태그별로 포스트를 필터링하는 기능을 추가하고 싶습니다.

요구사항:
1. /tags/[tag] 라우트에서 특정 태그의 포스트 목록 표시
2. /tags 페이지에서 모든 태그와 포스트 개수 표시
3. 각 블로그 포스트 하단에 태그 클릭 가능하게 표시
4. TypeScript 타입 안전성 보장

관련 파일을 읽고 구현해주세요.
```

#### 단계 3: Claude의 탐색 및 구현 관찰

Claude Code는 다음과 같이 작업합니다:

1. 관련 파일 탐색 (`src/content.config.ts`, `src/pages/blog/` 등)
2. 기존 패턴 분석
3. 새 파일 생성 또는 기존 파일 수정
4. 타입 체크 실행

#### 단계 4: 검증 및 개선 요청

```
잘 작동합니다! 몇 가지 개선 요청:
1. 태그는 알파벳 순으로 정렬해주세요
2. 포스트가 없는 태그는 표시하지 마세요
3. SEO를 위한 메타태그도 추가해주세요
```

### 코드/예시 (Code)

#### 생성된 파일 1: `src/pages/tags/index.astro`

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

// 모든 블로그 포스트에서 태그 추출
const posts = await getCollection('blog');
const tagMap = new Map<string, number>();

posts.forEach(post => {
  const tags = post.data.tags || [];
  tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    tagMap.set(lowerTag, (tagMap.get(lowerTag) || 0) + 1);
  });
});

// 태그를 알파벳 순으로 정렬
const tagCounts: TagCount[] = Array.from(tagMap.entries())
  .map(([tag, count]) => ({ tag, count }))
  .filter(({ count }) => count > 0)  // 포스트가 있는 태그만
  .sort((a, b) => a.tag.localeCompare(b.tag));

const totalPosts = posts.length;
---

<!DOCTYPE html>
<html lang="ko">
  <head>
    <BaseHead
      title="모든 태그 - 블로그"
      description={`${tagCounts.length}개의 태그로 분류된 ${totalPosts}개의 포스트를 탐색하세요`}
    />
  </head>
  <body>
    <Header />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">모든 태그</h1>
      <p class="text-gray-600 mb-6">
        총 {tagCounts.length}개의 태그, {totalPosts}개의 포스트
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

#### 생성된 파일 2: `src/pages/tags/[tag].astro`

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

  // 모든 고유 태그 수집
  posts.forEach(post => {
    const tags = post.data.tags || [];
    tags.forEach(tag => tagSet.add(tag.toLowerCase()));
  });

  // 각 태그별로 경로 생성
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
      title={`태그: ${tag} - 블로그`}
      description={`"${tag}" 태그가 달린 ${posts.length}개의 포스트`}
    />
  </head>
  <body>
    <Header />
    <main class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">
          태그: <span class="text-blue-600">#{tag}</span>
        </h1>
        <p class="text-gray-600">{posts.length}개의 포스트</p>
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

#### 수정된 파일: `src/layouts/BlogPost.astro` (하단에 태그 추가)

```astro
---
// ... 기존 코드 ...
const { title, description, pubDate, updatedDate, heroImage, tags } = Astro.props;
---

<!-- ... 기존 HTML ... -->

<article>
  <!-- 포스트 내용 -->
  <slot />

  <!-- 태그 섹션 추가 -->
  {tags && tags.length > 0 && (
    <div class="mt-8 pt-8 border-t">
      <h3 class="text-lg font-semibold mb-3">태그</h3>
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

### 설명 (Explanation)

#### 1. 정적 경로 생성 (Static Path Generation)

```typescript
export async function getStaticPaths() {
  // 빌드 시 모든 가능한 경로를 미리 생성
  const posts = await getCollection('blog');
  const tagSet = new Set<string>();

  // 태그 수집 및 정규화 (소문자 변환)
  posts.forEach(post => {
    (post.data.tags || []).forEach(tag => tagSet.add(tag.toLowerCase()));
  });

  // 각 태그별 경로 및 props 반환
  return Array.from(tagSet).map(tag => ({
    params: { tag },           // URL 파라미터
    props: { posts, tag },     // 페이지에 전달할 데이터
  }));
}
```

Astro의 정적 사이트 생성(SSG) 특성상, 빌드 시 모든 경로를 미리 생성해야 합니다. `getStaticPaths()`는 `/tags/typescript`, `/tags/javascript` 같은 모든 가능한 URL을 생성합니다.

#### 2. 타입 안전성

```typescript
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'blog'>[];  // 타입 체크
  tag: string;
}

const { posts, tag } = Astro.props;  // 자동완성 지원
```

TypeScript를 사용하여 컴파일 시점에 오류를 잡습니다. `CollectionEntry<'blog'>`는 Astro가 자동으로 생성한 타입으로, `title`, `description`, `pubDate` 등의 필드를 보장합니다.

#### 3. SEO 최적화

```astro
<BaseHead
  title={`태그: ${tag} - 블로그`}
  description={`"${tag}" 태그가 달린 ${posts.length}개의 포스트`}
/>
```

각 태그 페이지마다 고유한 메타데이터를 생성하여 검색 엔진 최적화를 개선합니다.

#### 4. 사용자 경험 (UX)

- **시각적 피드백**: 현재 태그는 파란색으로 강조
- **호버 효과**: 마우스 오버 시 색상 변경 및 그림자 효과
- **반응형 디자인**: 화면 크기에 따라 그리드 열 수 조정

### 변형 (Variations)

#### 변형 1: 인기 태그 표시

```astro
---
// 상위 10개 인기 태그만 표시
const popularTags = tagCounts
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);
---

<section class="mb-8">
  <h2 class="text-2xl font-bold mb-4">인기 태그</h2>
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

**사용 시나리오**: 홈페이지나 사이드바에서 인기 있는 주제를 빠르게 보여주고 싶을 때.

#### 변형 2: 검색 기능 추가

```astro
---
// src/pages/tags/index.astro에 검색 기능 추가
---

<div class="mb-6">
  <input
    type="text"
    id="tag-search"
    placeholder="태그 검색..."
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

**사용 시나리오**: 태그가 50개 이상으로 많아졌을 때 사용자가 원하는 태그를 빠르게 찾을 수 있게 합니다.

#### 변형 3: 관련 태그 추천

```typescript
// 태그 간 연관성 계산 (같은 포스트에 등장한 빈도 기반)
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
// src/pages/tags/[tag].astro에서 사용
const relatedTags = getRelatedTags(tag, allPosts);
---

{relatedTags.length > 0 && (
  <aside class="mt-8 p-6 bg-gray-100 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">관련 태그</h3>
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

**사용 시나리오**: 사용자가 관심 있는 주제의 다른 측면을 탐색하도록 유도합니다. 예를 들어 "TypeScript" 태그를 보는 사용자에게 "JavaScript", "Node.js" 태그를 추천할 수 있습니다.

---

## Recipe 3.2: 버그 수정하기

### 문제 (Problem)

프로덕션 환경에서 간헐적으로 발생하는 버그가 있습니다. 로그를 보니 특정 조건에서 `undefined`를 참조하여 에러가 발생합니다. 코드베이스가 크고 여러 파일에 걸쳐 있어서 원인을 찾기 어렵습니다.

**에러 메시지**:
```
TypeError: Cannot read property 'heroImage' of undefined
    at BlogPost.astro:15:23
```

**재현 조건**:
- 특정 블로그 포스트 (주로 오래된 포스트)에서 발생
- heroImage 필드가 없는 포스트에서 발생
- 빌드는 성공하지만 런타임 에러 발생

### 해결책 (Solution)

Claude Code를 사용하여 버그를 체계적으로 추적하고 수정합니다. 핵심은 **에러 컨텍스트 제공 → 원인 분석 → 수정 → 검증** 프로세스를 따르는 것입니다.

#### 단계 1: 에러 정보 제공

```
다음 에러가 발생하고 있습니다:

TypeError: Cannot read property 'heroImage' of undefined
    at BlogPost.astro:15:23

증상:
- heroImage가 없는 오래된 포스트에서 발생
- 빌드는 성공하지만 페이지 로드 시 에러
- 모든 포스트가 아닌 일부에서만 발생

관련 파일을 읽고 원인을 찾아주세요.
```

#### 단계 2: Claude의 디버깅 프로세스 관찰

Claude는 다음 순서로 작업합니다:

1. **에러 발생 파일 읽기**: `src/layouts/BlogPost.astro:15` 확인
2. **관련 컴포넌트 탐색**: 이미지 처리 로직 확인
3. **Content Collections 스키마 검토**: `heroImage`가 선택적 필드인지 확인
4. **문제 원인 식별**: Optional chaining 누락 발견

#### 단계 3: 수정 사항 확인

```
원인을 찾았습니다!
heroImage는 선택적 필드인데 코드에서 항상 존재한다고 가정하고 있습니다.

수정 방법:
1. Optional chaining 사용 (?.연산자)
2. 기본 이미지 제공
3. 조건부 렌더링

어떤 방식을 선호하시나요?
```

#### 단계 4: 수정 적용

```
기본 이미지를 제공하는 방식으로 수정해주세요.
기본 이미지는 /public/default-hero.jpg를 사용하겠습니다.
```

### 코드/예시 (Code)

#### 수정 전 (버그 있는 코드)

```astro
---
// src/layouts/BlogPost.astro
import { Image } from 'astro:assets';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  heroImage?: ImageMetadata;  // 선택적 필드
}

const { title, description, pubDate, heroImage } = Astro.props;
---

<article>
  <!-- 문제: heroImage가 없을 때 에러 발생 -->
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

#### 수정 후 (안전한 코드)

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

// 기본 이미지 처리
const displayImage = heroImage || defaultHeroImage;
---

<article>
  <!-- 안전: 항상 유효한 이미지 표시 -->
  <Image
    src={displayImage}
    alt={title}
    width={1020}
    height={510}
    class={heroImage ? '' : 'opacity-50'}
  />

  {!heroImage && (
    <p class="text-sm text-gray-500 mt-2">
      * 기본 이미지가 표시되고 있습니다
    </p>
  )}

  <h1>{title}</h1>
  <p>{description}</p>
</article>
```

#### 추가 방어 코드: Content Collections 스키마 업데이트

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1, '제목은 필수입니다'),
    description: z.string().min(10, '설명은 최소 10자 이상이어야 합니다'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // 개선: 기본값 제공 또는 검증 강화
    heroImage: image().optional().default('./default-hero.jpg'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

### 설명 (Explanation)

#### 1. Optional Chaining의 한계

```typescript
// 이 방식은 에러를 방지하지만 이미지가 렌더링되지 않음
<Image src={heroImage?.src} alt={title} />  // ❌ heroImage가 undefined면 src도 undefined
```

Optional chaining만으로는 부족합니다. `heroImage`가 `undefined`일 때 `Image` 컴포넌트에 `undefined`를 전달하면 여전히 에러가 발생합니다.

#### 2. Fallback 패턴 (권장)

```typescript
const displayImage = heroImage || defaultHeroImage;
```

이 패턴은:
- **안전성**: 항상 유효한 이미지 제공
- **사용자 경험**: 빈 공간 대신 기본 이미지 표시
- **명확성**: 코드 의도가 분명함

#### 3. 스키마 레벨 방어

```typescript
heroImage: image().optional().default('./default-hero.jpg'),
```

Content Collections 스키마에서 기본값을 제공하면:
- frontmatter에서 `heroImage`를 생략해도 자동으로 기본 이미지 할당
- 타입 시스템이 `heroImage`를 항상 존재하는 것으로 취급
- 런타임 에러 가능성 제거

#### 4. 방어적 프로그래밍 (Defensive Programming)

```astro
{!heroImage && (
  <p class="text-sm text-gray-500 mt-2">
    * 기본 이미지가 표시되고 있습니다
  </p>
)}
```

사용자에게 명확한 피드백을 제공하여:
- 개발자가 문제를 인지할 수 있음
- 사용자가 혼란스러워하지 않음

### 변형 (Variations)

#### 변형 1: 동적 기본 이미지 (카테고리별)

```astro
---
import techHero from '../assets/heroes/tech.jpg';
import designHero from '../assets/heroes/design.jpg';
import blogHero from '../assets/heroes/blog.jpg';

const { title, heroImage, tags = [] } = Astro.props;

// 태그 기반으로 기본 이미지 선택
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

**사용 시나리오**: 카테고리별로 시각적으로 구분되는 기본 이미지를 제공하여 더 나은 사용자 경험 제공.

#### 변형 2: 이미지 검증 및 에러 리포팅

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
    console.warn(`[BlogPost] "${title}": heroImage가 제공되지 않음. 기본 이미지 사용.`);
    return {
      isValid: false,
      error: 'No hero image provided',
      fallback: defaultHeroImage,
    };
  }

  // 이미지 크기 검증 (권장 비율: 2:1)
  const { width, height } = heroImage;
  const aspectRatio = width / height;

  if (Math.abs(aspectRatio - 2) > 0.1) {  // 2:1 비율에서 10% 이상 벗어남
    console.warn(
      `[BlogPost] "${title}": 이미지 비율이 권장 사항(2:1)과 다릅니다. ` +
      `현재: ${aspectRatio.toFixed(2)}:1`
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
    <p class="font-bold">개발 모드 경고</p>
    <p>이 포스트에 heroImage가 없습니다. 기본 이미지가 표시됩니다.</p>
  </div>
)}
```

**사용 시나리오**: 개발 중에 이미지 관련 문제를 조기에 발견하고, 프로덕션에서는 자동으로 복구.

#### 변형 3: 자동 이미지 생성 (AI 기반)

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

  // 이미지가 이미 존재하는지 확인
  try {
    await fs.access(outputPath);
    return outputPath;  // 이미 있으면 스킵
  } catch {
    // 파일이 없으면 생성
  }

  // Gemini API를 사용한 이미지 생성
  const prompt = `
    Create a modern, professional hero image for a blog post.
    Title: ${title}
    Topics: ${tags.join(', ')}
    Style: Clean, tech-focused, 2:1 aspect ratio
  `;

  // 실제 API 호출 (예시)
  // const imageUrl = await callGeminiAPI(prompt);
  // await downloadImage(imageUrl, outputPath);

  console.log(`[Auto] "${title}"의 히어로 이미지 생성 완료: ${outputPath}`);
  return outputPath;
}
```

```astro
---
// 빌드 시 자동으로 이미지 생성
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

**사용 시나리오**: 대량의 포스트를 작성할 때 히어로 이미지를 일일이 만들 필요 없이 자동 생성.

---

## Recipe 3.3: 리팩토링 요청하기

### 문제 (Problem)

코드가 점점 복잡해지고 있습니다. 여러 컴포넌트에서 중복된 로직이 발견되고, 테스트 작성도 어려워졌습니다. 특히 블로그 포스트 목록을 가져오는 로직이 여러 곳에 산재되어 있습니다.

**현재 문제점**:
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

같은 로직이 3번 반복됩니다!

### 해결책 (Solution)

Claude Code를 사용하여 중복 코드를 추출하고 재사용 가능한 유틸리티 함수로 리팩토링합니다.

#### 단계 1: 리팩토링 범위 지정

```
블로그 포스트를 가져오는 로직이 여러 파일에 중복되어 있습니다.

문제점:
1. 언어 필터링 로직 중복 (ko/ 체크)
2. 정렬 로직 중복 (pubDate 기준)
3. 수정 시 여러 곳을 변경해야 함

요청사항:
src/utils/ 폴더에 재사용 가능한 유틸리티 함수를 만들어주세요.
타입 안전성을 보장하고, 테스트 작성이 쉬운 구조로 만들어주세요.
```

#### 단계 2: Claude의 리팩토링 계획 확인

Claude는 다음과 같이 계획을 제시합니다:

```
리팩토링 계획:

1. src/utils/blog.ts 생성
   - getBlogPosts(): 기본 포스트 조회
   - getPostsByLanguage(): 언어별 필터링
   - getRecentPosts(): 최신 포스트 조회
   - getPostsByTag(): 태그별 필터링

2. 타입 정의 개선
   - SupportedLanguage 타입 추가
   - SortOrder 타입 추가

3. 기존 파일 수정
   - index.astro, blog/index.astro, tags/[tag].astro
   - 중복 코드 제거, 유틸리티 함수 사용

4. 테스트 작성 (선택사항)
   - src/utils/blog.test.ts

진행할까요?
```

#### 단계 3: 구현 확인 및 피드백

```
좋습니다! 몇 가지 추가 요청:
1. 캐싱 기능 추가 (같은 요청 반복 시 성능 개선)
2. 에러 처리 강화
3. JSDoc 주석으로 문서화
```

### 코드/예시 (Code)

#### 생성된 파일: `src/utils/blog.ts`

```typescript
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

/**
 * 지원하는 언어 코드
 */
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

/**
 * 정렬 순서
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 블로그 포스트 조회 옵션
 */
export interface GetPostsOptions {
  language?: SupportedLanguage;
  limit?: number;
  sortBy?: 'pubDate' | 'updatedDate' | 'title';
  sortOrder?: SortOrder;
  includeDrafts?: boolean;
}

/**
 * 캐시 저장소 (빌드 시 성능 개선)
 */
const postsCache = new Map<string, CollectionEntry<'blog'>[]>();

/**
 * 모든 블로그 포스트를 가져옵니다 (캐싱 적용)
 *
 * @returns 전체 블로그 포스트 배열
 * @throws Error 포스트 로드 실패 시
 *
 * @example
 * ```typescript
 * const posts = await getBlogPosts();
 * console.log(`총 ${posts.length}개의 포스트`);
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
    console.error('[getBlogPosts] 포스트 로드 실패:', error);
    throw new Error('블로그 포스트를 불러올 수 없습니다');
  }
}

/**
 * 특정 언어의 블로그 포스트를 가져옵니다
 *
 * @param language - 언어 코드 (ko, en, ja, zh)
 * @param options - 추가 옵션 (정렬, 제한 등)
 * @returns 필터링 및 정렬된 포스트 배열
 *
 * @example
 * ```typescript
 * // 한국어 포스트 최신 5개
 * const posts = await getPostsByLanguage('ko', { limit: 5 });
 *
 * // 영어 포스트 제목순 정렬
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

  // 언어 필터링
  posts = posts.filter(post => post.id.startsWith(`${language}/`));

  // 드래프트 제외 (선택)
  if (!includeDrafts) {
    posts = posts.filter(post => !post.data.draft);
  }

  // 정렬
  posts = sortPosts(posts, sortBy, sortOrder);

  // 제한
  if (limit !== undefined && limit > 0) {
    posts = posts.slice(0, limit);
  }

  return posts;
}

/**
 * 최신 포스트를 가져옵니다
 *
 * @param language - 언어 코드 (선택사항, 지정하지 않으면 전체)
 * @param limit - 최대 포스트 수 (기본: 10)
 * @returns 최신 포스트 배열
 *
 * @example
 * ```typescript
 * // 전체 언어에서 최신 10개
 * const recent = await getRecentPosts();
 *
 * // 한국어 최신 5개
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
 * 특정 태그의 포스트를 가져옵니다
 *
 * @param tag - 태그 (대소문자 무시)
 * @param language - 언어 코드 (선택사항)
 * @returns 태그가 일치하는 포스트 배열
 *
 * @example
 * ```typescript
 * // 'typescript' 태그의 모든 포스트
 * const posts = await getPostsByTag('typescript');
 *
 * // 한국어 'typescript' 포스트만
 * const posts = await getPostsByTag('typescript', 'ko');
 * ```
 */
export async function getPostsByTag(
  tag: string,
  language?: SupportedLanguage
): Promise<CollectionEntry<'blog'>[]> {
  const normalizedTag = tag.toLowerCase();
  let posts = await getBlogPosts();

  // 언어 필터링
  if (language) {
    posts = posts.filter(post => post.id.startsWith(`${language}/`));
  }

  // 태그 필터링
  posts = posts.filter(post =>
    (post.data.tags || [])
      .map(t => t.toLowerCase())
      .includes(normalizedTag)
  );

  // 최신순 정렬
  return sortPosts(posts, 'pubDate', 'desc');
}

/**
 * 포스트 배열을 정렬합니다
 *
 * @param posts - 정렬할 포스트 배열
 * @param sortBy - 정렬 기준 필드
 * @param sortOrder - 정렬 순서 (asc/desc)
 * @returns 정렬된 포스트 배열
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
 * 특정 포스트의 관련 포스트를 가져옵니다
 *
 * @param currentSlug - 현재 포스트의 slug
 * @param limit - 최대 관련 포스트 수
 * @returns 관련 포스트 배열
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

  // 같은 언어, 같은 태그를 가진 포스트 찾기
  const related = posts
    .filter(post =>
      post.id !== currentSlug &&  // 자기 자신 제외
      post.id.startsWith(`${language}/`) &&  // 같은 언어
      (post.data.tags || []).some(tag =>
        currentTags.includes(tag.toLowerCase())
      )  // 태그 중복 있음
    )
    .map(post => {
      // 태그 중복 개수로 관련성 점수 계산
      const postTags = (post.data.tags || []).map(t => t.toLowerCase());
      const commonTags = currentTags.filter(tag => postTags.includes(tag));
      return { post, score: commonTags.length };
    })
    .sort((a, b) => b.score - a.score)  // 점수 높은 순
    .slice(0, limit)
    .map(({ post }) => post);

  return related;
}
```

#### 수정된 파일: `src/pages/index.astro`

```astro
---
import { getRecentPosts } from '../utils/blog';

// 리팩토링 전:
// const posts = (await getCollection('blog'))
//   .filter(post => post.id.startsWith('ko/'))
//   .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
//   .slice(0, 5);

// 리팩토링 후:
const posts = await getRecentPosts('ko', 5);
---

<h2>최신 포스트</h2>
{posts.map(post => (
  <article>
    <h3>{post.data.title}</h3>
  </article>
))}
```

#### 수정된 파일: `src/pages/tags/[tag].astro`

```astro
---
import { getPostsByTag } from '../../utils/blog';

export async function getStaticPaths() {
  // ... 태그 목록 생성 로직 ...

  return Array.from(tagSet).map(tag => ({
    params: { tag },
    props: {
      // 리팩토링 전: 복잡한 필터링 로직
      // 리팩토링 후: 한 줄
      posts: await getPostsByTag(tag, 'ko'),
      tag,
    },
  }));
}

const { posts, tag } = Astro.props;
---
```

### 설명 (Explanation)

#### 1. 단일 책임 원칙 (Single Responsibility Principle)

각 함수는 하나의 명확한 책임을 가집니다:
- `getBlogPosts()`: 포스트 로드 및 캐싱
- `getPostsByLanguage()`: 언어 필터링
- `getPostsByTag()`: 태그 필터링
- `sortPosts()`: 정렬

이렇게 분리하면:
- **테스트 용이성**: 각 함수를 독립적으로 테스트
- **재사용성**: 필요한 함수만 조합하여 사용
- **유지보수성**: 버그 수정 시 한 곳만 변경

#### 2. 타입 안전성 강화

```typescript
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

// 사용 시 자동완성 및 타입 체크
const posts = await getPostsByLanguage('ko');  // ✓
const posts = await getPostsByLanguage('fr');  // ✗ 컴파일 에러
```

#### 3. 캐싱을 통한 성능 최적화

```typescript
const postsCache = new Map<string, CollectionEntry<'blog'>[]>();

if (postsCache.has(cacheKey)) {
  return postsCache.get(cacheKey)!;  // 캐시된 결과 즉시 반환
}
```

빌드 시 여러 페이지에서 `getCollection('blog')`를 반복 호출하면 느려집니다. 캐싱으로 첫 호출 후 결과를 재사용합니다.

#### 4. JSDoc을 통한 문서화

```typescript
/**
 * 특정 언어의 블로그 포스트를 가져옵니다
 *
 * @param language - 언어 코드 (ko, en, ja, zh)
 * @param options - 추가 옵션 (정렬, 제한 등)
 * @returns 필터링 및 정렬된 포스트 배열
 *
 * @example
 * ```typescript
 * const posts = await getPostsByLanguage('ko', { limit: 5 });
 * ```
 */
```

IDE에서 자동완성 시 문서가 함께 표시되어 사용법을 쉽게 파악할 수 있습니다.

### 변형 (Variations)

#### 변형 1: 검색 기능 추가

```typescript
/**
 * 포스트를 검색합니다 (제목 및 설명 기반)
 *
 * @param query - 검색어
 * @param language - 언어 코드 (선택사항)
 * @returns 검색 결과 포스트 배열
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

#### 변형 2: 페이지네이션 지원

```typescript
export interface PaginatedPosts {
  posts: CollectionEntry<'blog'>[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 페이지네이션된 포스트를 가져옵니다
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

사용 예:
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
  {hasPrev && <a href={`/blog/${currentPage - 1}`}>이전</a>}
  <span>{currentPage} / {totalPages}</span>
  {hasNext && <a href={`/blog/${currentPage + 1}`}>다음</a>}
</div>
```

#### 변형 3: 통계 및 분석 함수

```typescript
/**
 * 블로그 통계를 반환합니다
 */
export async function getBlogStats(language?: SupportedLanguage) {
  const posts = language
    ? await getPostsByLanguage(language)
    : await getBlogPosts();

  // 태그별 포스트 수
  const tagCounts = new Map<string, number>();
  posts.forEach(post => {
    (post.data.tags || []).forEach(tag => {
      const lower = tag.toLowerCase();
      tagCounts.set(lower, (tagCounts.get(lower) || 0) + 1);
    });
  });

  // 월별 포스트 수
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

사용 예:
```astro
---
// src/pages/stats.astro
import { getBlogStats } from '../utils/blog';

const stats = await getBlogStats('ko');
---

<h1>블로그 통계</h1>
<ul>
  <li>총 포스트: {stats.totalPosts}개</li>
  <li>총 태그: {stats.totalTags}개</li>
  <li>포스트당 평균 태그: {stats.averageTagsPerPost.toFixed(1)}개</li>
</ul>

<h2>인기 태그</h2>
{stats.popularTags.map(([tag, count]) => (
  <span>#{tag} ({count})</span>
))}
```

---

## 핵심 정리 (Key Takeaways)

### Recipe 3.1: 코드 생성하기
- **명확한 요구사항 제공**이 핵심입니다
- **컨텍스트 → 요청 → 검증 → 개선** 사이클을 따르세요
- 생성된 코드는 항상 **타입 체크와 빌드 테스트**를 거쳐야 합니다

### Recipe 3.2: 버그 수정하기
- **에러 메시지와 재현 조건**을 함께 제공하세요
- Claude는 **관련 파일을 탐색하며 원인을 분석**합니다
- **방어적 프로그래밍 패턴**을 적용하여 재발을 방지하세요

### Recipe 3.3: 리팩토링 요청하기
- **중복 코드 식별**은 리팩토링의 시작입니다
- **단일 책임 원칙**을 따르는 유틸리티 함수로 분리하세요
- **JSDoc 문서화**로 팀원과의 협업을 개선하세요

### 공통 패턴

모든 레시피에서 다음 패턴이 반복됩니다:

1. **문제 명확화**: 해결하려는 문제를 구체적으로 설명
2. **컨텍스트 제공**: Claude가 프로젝트 구조를 이해하도록 도움
3. **점진적 개선**: 한 번에 완벽한 코드보다 반복적인 개선
4. **검증 및 테스트**: 빌드 및 타입 체크로 안정성 확보

### 다음 단계

Chapter 4에서는 더 고급 기능을 다룹니다:
- 여러 파일에 걸친 복잡한 리팩토링
- 테스트 주도 개발 (TDD) 워크플로우
- 성능 최적화 및 프로파일링
- 서브에이전트를 활용한 전문화된 작업

---

**예제 코드 저장소**: 이 챕터의 모든 예제는 [GitHub 저장소](https://github.com/example/claude-code-cookbook)에서 확인할 수 있습니다.

**피드백**: 더 궁금한 레시피가 있다면 [이슈를 남겨주세요](https://github.com/example/claude-code-cookbook/issues).
