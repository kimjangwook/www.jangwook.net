---
title: '정적 블로그의 예약 공개 구현법: Astro + GitHub Actions로 자동화하기'
description: >-
  Astro와 GitHub Pages를 사용한 정적 블로그에서 WordPress처럼 포스트 예약 공개를 구현하는 실전 가이드. pubDate
  필터링과 스케줄 워크플로우를 활용한 완전 자동화 솔루션
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
      zh: 适合作为下一步学习资源，通过自动化、Web开发、DevOps、架构主题进行连接。
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

## 정적 사이트의 딜레마: 예약 공개

Astro + GitHub Pages로 블로그를 운영하면서 얻는 장점은 명확합니다. 빠른 페이지 로딩, 제로 서버 비용, 뛰어난 SEO 최적화. 하지만 WordPress 같은 CMS에서 당연하게 사용하던 <strong>포스트 예약 공개 기능</strong>이 없다는 것이 불편했습니다.

여유 시간에 미리 여러 글을 작성하고, 매일 오전 9시에 자동으로 공개하고 싶은데, 정적 사이트 생성기는 빌드 시점의 파일만 배포합니다. 미래 날짜의 포스트는? 빌드 시점에 이미 HTML로 생성되어 즉시 공개됩니다.

이 글에서는 <strong>Astro의 Content Collections와 GitHub Actions의 스케줄 워크플로우를 조합하여</strong> 정적 사이트에서 완전한 예약 공개 시스템을 구현하는 방법을 다룹니다. 실제로 제 블로그에 적용한 코드를 기반으로 설명하니, 바로 적용할 수 있습니다.

## 해결책 개요: 세 가지 핵심 요소

예약 공개를 구현하는 핵심은 다음 세 가지입니다:

### 1. pubDate 기반 콘텐츠 필터링

Astro의 Content Collections 스키마에 `pubDate` 필드를 정의하고, 빌드 시 현재 날짜보다 미래인 포스트를 필터링합니다.

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(), // 문자열을 Date 객체로 자동 변환
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

### 2. 스마트 필터링 유틸리티

프로덕션 빌드에서는 오늘 날짜 이전 포스트만 보여주고, 개발 환경에서는 모든 포스트를 보여줍니다.

```typescript
// src/lib/content.ts
import type { CollectionEntry } from 'astro:content';

/**
 * JST(일본 시간대) 기준 현재 날짜 가져오기
 * GitHub Actions는 UTC로 실행되므로 명시적으로 JST로 변환
 */
function getJSTDate(): Date {
  const now = new Date();
  const jstOffset = 9 * 60; // JST = UTC+9
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jstTime = new Date(utcTime + (jstOffset * 60000));
  return jstTime;
}

/**
 * Date를 YYYY-MM-DD 형식으로 변환
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 블로그 포스트를 공개 날짜 기준으로 필터링
 * - 프로덕션: pubDate <= 오늘(JST) 인 포스트만
 * - 개발/테스트: 모든 포스트 (TEST_FLG=true)
 */
export function filterPostsByDate(
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] {
  // 테스트 플래그가 설정되면 모든 포스트 표시
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

<strong>핵심 포인트</strong>:
- <strong>시간대 일관성</strong>: GitHub Actions는 UTC로 실행되므로, JST(UTC+9)로 명시적 변환
- <strong>날짜 비교</strong>: 시간까지 비교하면 복잡하므로 YYYY-MM-DD 형식으로 단순화
- <strong>개발 모드 예외</strong>: `TEST_FLG=true`로 설정하면 미래 포스트도 미리보기 가능

### 3. GitHub Actions 스케줄 워크플로우

매일 정해진 시간에 자동으로 사이트를 재빌드하여 해당 날짜의 포스트를 공개합니다.

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:
  # 매일 한국 시간 00:00 (UTC 15:00 전날)에 자동 빌드
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
      TZ: 'Asia/Tokyo' # JST 시간대 명시
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

<strong>워크플로우 설명</strong>:
- <strong>push 트리거</strong>: `main` 브랜치에 커밋 시 즉시 배포
- <strong>workflow_dispatch</strong>: GitHub UI에서 수동 실행 가능
- <strong>schedule 트리거</strong>: 매일 UTC 15:00 (JST 다음날 00:00)에 자동 실행

## 실전 구현: 단계별 가이드

### 1단계: Content Collections 스키마 정의

먼저 블로그 포스트의 타입 스키마를 정의합니다.

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Markdown/MDX 파일 로드
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),

  // Frontmatter 스키마
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(), // "2025-10-13" → Date 객체로 변환
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

이제 블로그 포스트를 작성할 때 다음과 같은 frontmatter를 사용합니다:

```markdown
---
title: '예약 공개 테스트 포스트'
description: '내일 공개될 포스트입니다'
pubDate: '2025-10-14' # 미래 날짜로 설정
heroImage: '../../../assets/blog/test-hero.jpg'
tags: ['test', 'scheduled']
---

## 이 포스트는 2025년 10월 14일에 공개됩니다!
```

### 2단계: 필터링 유틸리티 생성

모든 페이지에서 재사용할 필터링 로직을 `src/lib/content.ts`에 작성합니다.

```typescript
// src/lib/content.ts
import type { CollectionEntry } from 'astro:content';

/**
 * TEST_FLG 환경 변수 확인
 * 개발/테스트 모드에서는 미래 포스트도 표시
 */
export function shouldShowFuturePost(): boolean {
  return import.meta.env.TEST_FLG === 'true';
}

/**
 * JST(Asia/Tokyo) 기준 현재 날짜 반환
 */
function getJSTDate(): Date {
  const now = new Date();
  const jstOffset = 9 * 60; // UTC+9 시간대
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jstTime = new Date(utcTime + (jstOffset * 60000));
  return jstTime;
}

/**
 * Date 객체를 YYYY-MM-DD 문자열로 변환
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 블로그 포스트 날짜 필터링
 * - 프로덕션: pubDate <= 오늘(JST)
 * - 테스트: 모든 포스트
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

### 3단계: 블로그 인덱스 페이지 업데이트

필터링 함수를 적용하여 공개된 포스트만 표시합니다.

```astro
---
// src/pages/[lang]/blog/index.astro
import { getCollection } from 'astro:content';
import { filterPostsByDate } from '../../../lib/content';
import BlogCard from '../../../components/BlogCard.astro';

// 모든 블로그 포스트 가져오기
const allPosts = await getCollection('blog');

// 날짜 필터링 + 언어 필터링 + 정렬
const posts = filterPostsByDate(allPosts)
  .filter((post) => post.id.startsWith(`${lang}/`))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<main>
  <h1>블로그</h1>
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

### 4단계: 동적 포스트 페이지 업데이트

개별 포스트 페이지도 동일하게 필터링합니다.

```astro
---
// src/pages/[lang]/blog/[...slug].astro
import { type CollectionEntry, getCollection, render } from 'astro:content';
import { filterPostsByDate } from '../../../lib/content';
import BlogPost from '../../../layouts/BlogPost.astro';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const posts = filterPostsByDate(allPosts); // 필터링 적용
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

<strong>중요</strong>: `getStaticPaths()`에서 필터링하지 않으면, 미래 포스트의 경로도 생성되어 직접 URL로 접근 가능합니다. 반드시 여기서도 필터링해야 합니다.

### 5단계: GitHub Actions 워크플로우 설정

`.github/workflows/deploy.yml` 파일을 생성합니다.

```yaml
name: Deploy to GitHub Pages

on:
  # main 브랜치 푸시 시 배포
  push:
    branches: [main]

  # 수동 실행 가능
  workflow_dispatch:

  # 스케줄 실행: 매일 JST 00:00 (UTC 15:00 전날)
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
      TZ: 'Asia/Tokyo' # 타임존 명시
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

<strong>Cron 문법 설명</strong>:
```
"0 15 * * *"
 │  │  │ │ │
 │  │  │ │ └─ 요일 (0-6, 일-토)
 │  │  │ └─── 월 (1-12)
 │  │  └───── 일 (1-31)
 │  └──────── 시 (0-23, UTC)
 └─────────── 분 (0-59)
```

- `"0 15 * * *"` = 매일 UTC 15:00 (JST 다음날 00:00)
- `"0 9 * * *"` = 매일 UTC 09:00 (JST 18:00)
- `"0 0 * * 1"` = 매주 월요일 UTC 00:00 (JST 09:00)

### 6단계: 로컬 테스트

미래 포스트를 작성하고 로컬에서 테스트합니다.

```bash
# 1. 미래 날짜 포스트 작성
# src/content/blog/ko/future-post.md
# pubDate: '2025-10-20'

# 2. 테스트 모드로 개발 서버 실행 (모든 포스트 표시)
TEST_FLG=true npm run dev

# 3. 프로덕션 빌드 테스트 (필터링 적용)
npm run build
npm run preview

# 4. 빌드 결과 확인: 미래 포스트가 안 보이는지 체크
```

<strong>예상 동작</strong>:
- `TEST_FLG=true`: 미래 포스트 표시 ✓
- 프로덕션 빌드: 미래 포스트 숨김 ✓

### 7단계: GitHub Pages 설정

1. <strong>GitHub 저장소 설정</strong>:
   - Settings → Pages → Source를 "GitHub Actions"로 변경

2. <strong>첫 배포</strong>:
   ```bash
   git add .
   git commit -m "feat: add scheduled publishing"
   git push origin main
   ```

3. <strong>Actions 탭에서 배포 확인</strong>:
   - "Deploy to GitHub Pages" 워크플로우 실행 확인
   - 성공 시 사이트 접속하여 미래 포스트가 안 보이는지 확인

4. <strong>스케줄 확인</strong>:
   - Actions 탭 → "Deploy to GitHub Pages" → 오른쪽 메뉴 → "View workflow runs"
   - 다음 실행 시간 확인

## 고급 활용 팁

### 시간대별 맞춤 설정

<strong>한국 시간 기준 (KST = UTC+9)</strong>:
```yaml
schedule:
  - cron: "0 15 * * *" # 매일 KST 00:00
```

<strong>미국 동부 시간 기준 (EST = UTC-5)</strong>:
```yaml
schedule:
  - cron: "0 14 * * *" # 매일 EST 09:00
```

<strong>유럽 중부 시간 기준 (CET = UTC+1)</strong>:
```yaml
schedule:
  - cron: "0 8 * * *" # 매일 CET 09:00
```

### 여러 시간대 빌드

하루에 여러 번 빌드하여 더 정확한 예약 공개:

```yaml
schedule:
  - cron: "0 0 * * *"   # JST 09:00 (아침)
  - cron: "0 6 * * *"   # JST 15:00 (오후)
  - cron: "0 12 * * *"  # JST 21:00 (저녁)
```

<strong>주의</strong>: GitHub Actions 무료 플랜은 월 2,000분 제한이 있습니다. 빌드 시간이 5분이라면, 하루 3회 빌드 시 월 450분 사용 (여유 있음).

### RSS 피드 필터링

RSS 피드도 필터링 적용:

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { filterPostsByDate } from '../lib/content';

export async function GET(context) {
  const allPosts = await getCollection('blog');
  const posts = filterPostsByDate(allPosts) // 필터링
    .filter((post) => post.id.startsWith('ko/'))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: '블로그 제목',
    description: '블로그 설명',
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

### 사이트맵 필터링

Astro의 `@astrojs/sitemap` 통합은 자동으로 생성된 페이지를 사이트맵에 추가합니다. `getStaticPaths()`에서 필터링하면 사이트맵도 자동으로 필터링됩니다.

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourdomain.com',
  integrations: [
    sitemap(), // 자동으로 필터링된 페이지만 포함
  ],
});
```

## 문제 해결 (Troubleshooting)

### 문제 1: 미래 포스트가 즉시 공개됨

<strong>원인</strong>: 필터링이 적용되지 않음

<strong>해결</strong>:
1. `getStaticPaths()`와 `getCollection()` 호출 모두에 `filterPostsByDate()` 적용 확인
2. 빌드 로그 확인:
   ```bash
   npm run build
   # 출력에서 포스트 개수 확인
   ```

### 문제 2: 스케줄이 실행되지 않음

<strong>원인</strong>: GitHub Actions 설정 문제

<strong>해결</strong>:
1. <strong>저장소 활성화 확인</strong>: Actions 탭이 활성화되어 있는지
2. <strong>cron 문법 검증</strong>: [Crontab.guru](https://crontab.guru)에서 확인
3. <strong>마지막 커밋 날짜</strong>: 60일 이상 커밋이 없으면 스케줄 자동 중지
   - 해결: 더미 커밋 푸시 또는 수동 실행

### 문제 3: 시간대가 안 맞음

<strong>원인</strong>: UTC와 로컬 시간대 혼동

<strong>해결</strong>:
1. **워크플로우 `env.TZ` 확인**:
   ```yaml
   env:
     TZ: 'Asia/Tokyo'
   ```

2. <strong>필터링 함수 시간대 확인</strong>:
   ```typescript
   function getJSTDate(): Date {
     const now = new Date();
     const jstOffset = 9 * 60; // JST = UTC+9
     // ...
   }
   ```

3. <strong>테스트</strong>:
   ```bash
   # GitHub Actions 로그에서 빌드 시간 확인
   date (실행 시간이 올바른 시간대인지)
   ```

### 문제 4: 개발 모드에서 미래 포스트가 안 보임

<strong>원인</strong>: `TEST_FLG` 환경 변수 미설정

<strong>해결</strong>:
```bash
# .env 파일 생성
echo "TEST_FLG=true" > .env

# 또는 명령어에 직접 전달
TEST_FLG=true npm run dev
```

## 성능 및 비용

### GitHub Actions 비용

<strong>무료 플랜</strong>:
- 월 2,000분 무료
- 빌드 시간: 약 2-5분 (프로젝트 크기에 따라)
- 하루 1회 빌드: 월 60-150분 사용
- <strong>결론</strong>: 무료 플랜으로 충분 ✓

<strong>유료 플랜</strong>:
- Team: 월 $4, 3,000분/월
- Enterprise: 커스텀 요금

### 빌드 최적화

Astro 빌드 시간을 줄이는 방법:

```javascript
// astro.config.mjs
export default defineConfig({
  // 1. 이미지 최적화 병렬 처리
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  // 2. 빌드 캐싱 (Vercel/Netlify에서 자동)
  build: {
    inlineStylesheets: 'auto',
  },
});
```

<strong>추가 최적화</strong>:
- <strong>의존성 캐싱</strong>: `actions/cache` 사용
- <strong>증분 빌드</strong>: Astro 4.0+ 지원

```yaml
# 의존성 캐싱 예시
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## 다른 접근법과 비교

### 방법 1: Netlify/Vercel 스케줄 빌드

<strong>장점</strong>:
- GUI에서 설정 가능
- 플랫폼 통합 캐싱

<strong>단점</strong>:
- 플랫폼 종속
- 무료 플랜 제한 (Netlify: 월 300분)

### 방법 2: 외부 Cron 서비스 (예: cron-job.org)

<strong>장점</strong>:
- GitHub Actions 한도 소비 안 함

<strong>단점</strong>:
- Webhook 설정 필요
- 보안 토큰 관리
- 추가 서비스 의존

### 방법 3: 서버리스 함수 (예: Cloudflare Workers)

<strong>장점</strong>:
- 실시간 필터링 가능

<strong>단점</strong>:
- 정적 사이트가 아니게 됨
- 복잡도 증가
- 추가 서비스 필요

<strong>추천</strong>: <strong>GitHub Actions 방식이 가장 간단하고 무료이며, GitHub Pages와 완벽한 통합</strong>

## 결론

Astro와 GitHub Actions를 조합하면, 정적 블로그에서도 WordPress처럼 <strong>완전 자동화된 예약 공개 시스템</strong>을 구축할 수 있습니다.

### 핵심 포인트 정리

✅ <strong>Content Collections 스키마에 pubDate 정의</strong>
✅ <strong>날짜 필터링 유틸리티 작성</strong> (JST 시간대 명시)
✅ <strong>모든 페이지에 필터링 적용</strong> (인덱스, 동적 페이지, RSS)
✅ <strong>GitHub Actions 스케줄 워크플로우 설정</strong> (cron 표현식)
✅ <strong>로컬 테스트</strong> (TEST_FLG=true)
✅ <strong>프로덕션 배포 및 검증</strong>

### 이 방식의 장점

1. <strong>제로 비용</strong>: GitHub Actions 무료 플랜으로 충분
2. <strong>완전 자동화</strong>: 한 번 설정하면 영구적으로 작동
3. <strong>타임존 제어</strong>: 원하는 시간대로 정확한 공개
4. <strong>개발 친화적</strong>: 테스트 모드로 미리보기 가능
5. <strong>플랫폼 독립적</strong>: GitHub Pages 외에도 Netlify, Vercel 등 어디서나 작동

이제 여유 시간에 미리 포스트를 작성하고, 매일 아침 자동으로 독자들에게 새 글을 선사할 수 있습니다. 정적 사이트의 속도와 WordPress의 편의성을 동시에 누리세요!

## 참고 자료

- [Astro Content Collections 공식 문서](https://docs.astro.build/en/guides/content-collections/)
- [GitHub Actions 스케줄 이벤트](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Cron 표현식 가이드](https://crontab.guru)
- [Astro 공식 GitHub Actions](https://github.com/withastro/action)
- [GitHub Pages 배포 가이드](https://docs.github.com/en/pages)
