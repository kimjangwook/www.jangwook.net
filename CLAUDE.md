# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Astro 기반의 블로그 및 커리어 관리 자동화 프로젝트입니다. 기술 블로그 운영, SEO 최적화, 콘텐츠 관리, 포트폴리오 큐레이션을 포함한 종합적인 개발자 블로그 시스템입니다.

## 명령어

```bash
# 개발 서버 실행 (localhost:4321)
npm run dev

# 프로덕션 빌드 (./dist/ 출력)
npm run build

# 빌드 미리보기
npm run preview

# Astro CLI 명령
npm run astro -- --help
npm run astro check  # 타입 체크 및 오류 검사
npm run astro add [integration]  # 통합 추가
```

## 아키텍처

### Astro 프레임워크 특성

이 프로젝트는 Astro 5.14.1을 사용하며, 다음 핵심 개념을 따릅니다:

1. **Islands Architecture**: 기본적으로 정적 HTML을 생성하며, 필요한 부분만 JavaScript로 상호작용 추가
2. **Content Collections**: `src/content/` 디렉토리에서 타입 안전한 콘텐츠 관리
3. **File-based Routing**: `src/pages/` 디렉토리 구조가 URL 구조를 정의

### 디렉토리 구조

```
src/
├── assets/          # 이미지 등 정적 자산 (Astro가 최적화)
├── components/      # 재사용 가능한 Astro 컴포넌트
├── content/         # Content Collections (타입 안전한 콘텐츠)
│   └── blog/       # 블로그 포스트 (Markdown/MDX)
├── layouts/         # 페이지 레이아웃 템플릿
├── pages/          # 파일 기반 라우팅 (각 파일 = 하나의 라우트)
├── styles/         # 전역 CSS
├── consts.ts       # 전역 상수 (사이트 제목, 설명 등)
└── content.config.ts  # Content Collections 스키마 정의

public/             # 정적 파일 (빌드 시 그대로 복사)
.claude/
└── agents/         # Claude Code 서브에이전트 정의
```

### Content Collections 시스템

**핵심 파일**: `src/content.config.ts`

```typescript
// 블로그 컬렉션은 다음 스키마를 따름:
{
  title: string           // 필수
  description: string     // 필수
  pubDate: Date          // 필수 (자동 변환)
  updatedDate?: Date     // 선택
  heroImage?: ImageMetadata  // 선택 (Astro 이미지 최적화)
  tags?: string[]        // 선택 (태그 배열)
}
```

**중요**:
- 블로그 포스트는 언어별 폴더에 위치: `src/content/blog/<ko|en|ja>/`
- 각 언어 폴더에 동일한 파일명으로 저장 (예: `ko/post-title.md`, `en/post-title.md`)
- Frontmatter는 반드시 위 스키마를 준수해야 함
- `getCollection('blog')`로 모든 포스트 조회, `.filter(post => post.id.startsWith('ko/'))`로 언어별 필터링
- `render()` 함수로 Markdown/MDX 콘텐츠를 렌더링

## Astro 페이지 작성 시 주의사항

### 1. Frontmatter와 템플릿 구분

Astro 파일은 세 부분으로 구성:

```astro
---
// 1. Frontmatter (서버에서만 실행)
import Component from '../components/Component.astro';
const data = await fetchData();
---

<!-- 2. 템플릿 (HTML 출력) -->
<div>{data}</div>

<script>
// 3. 클라이언트 스크립트 (브라우저에서 실행)
</script>
```

### 2. 동적 라우팅

**파일명**: `[param].astro` 또는 `[...slug].astro` (catch-all)

```astro
---
// getStaticPaths() 반드시 필요 (SSG 모드)
export async function getStaticPaths() {
  return [
    { params: { slug: 'post-1' }, props: { data } },
    { params: { slug: 'post-2' }, props: { data } }
  ];
}

const { slug } = Astro.params;  // URL 파라미터
const { data } = Astro.props;   // getStaticPaths에서 전달한 props
---
```

### 3. 이미지 처리

**중요**: Astro의 이미지 최적화 사용

```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/image.jpg';  // 상대 경로 import
---

<!-- 자동 최적화 (WebP 변환, 반응형 등) -->
<Image src={myImage} alt="설명" width={600} height={400} />

<!-- public/ 폴더 이미지는 최적화 안 됨 -->
<img src="/public-image.jpg" alt="설명" />
```

### 4. Layouts와 Slots

```astro
---
// layouts/Base.astro
const { title } = Astro.props;
---
<html>
  <head><title>{title}</title></head>
  <body>
    <slot />  <!-- 자식 콘텐츠가 여기 삽입 -->
  </body>
</html>
```

사용:
```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="페이지 제목">
  <p>여기 콘텐츠</p>
</Base>
```

### 5. 스타일 스코핑

```astro
<style>
  /* 기본: 컴포넌트 스코프 (자동 격리) */
  h1 { color: red; }
</style>

<style is:global>
  /* 전역 스타일 */
  body { margin: 0; }
</style>
```

### 6. 환경 변수

- `Astro.site`: astro.config.mjs에 정의된 사이트 URL
- `Astro.url`: 현재 페이지 URL
- `Astro.params`: 동적 라우트 파라미터
- `Astro.props`: getStaticPaths에서 전달된 props

## 통합 모듈

현재 사용 중인 Astro 통합:

1. **@astrojs/mdx**: MDX (JSX in Markdown) 지원
2. **@astrojs/sitemap**: 자동 사이트맵 생성 (SEO)
3. **@astrojs/rss**: RSS 피드 생성

## 블로그 포스트 작성 워크플로우

### 1. 새 포스트 생성

```markdown
---
title: '포스트 제목'
description: '포스트 설명 (SEO에 중요)'
pubDate: '2025-10-03'  # 또는 'Oct 03 2025'
heroImage: '../../assets/blog/image.png'  # 선택사항
tags: ['tag1', 'tag2', 'tag3']  # 선택사항
---

# 포스트 내용

Markdown 또는 MDX 형식으로 작성...
```

**중요 규칙 - 다국어 파일 구조**:
- **파일 위치**: `src/content/blog/<언어코드>/[파일명].md`
  - 한국어: `src/content/blog/ko/post-title.md`
  - 영어: `src/content/blog/en/post-title.md`
  - 일본어: `src/content/blog/ja/post-title.md`
- **동일한 파일명**: 모든 언어 버전은 각 언어 폴더에 같은 파일명으로 저장
- **언어 자동 인식**: 폴더 경로(`ko/`, `en/`, `ja/`)로 언어 자동 식별
- Frontmatter의 모든 필수 필드 포함 필요
- 이미지는 `src/assets/blog/`에 저장하고 상대 경로로 참조
- 다국어 포스트는 동일한 이미지를 공유 (모든 언어 버전에서 같은 heroImage 경로 사용)
- pubDate는 자동으로 Date 객체로 변환됨
- tags는 배열 형태로 작성 (선택사항, 최대 3개가 카드에 표시됨)

### 2. 렌더링 프로세스

`src/pages/blog/[...slug].astro`가 모든 블로그 포스트 렌더링 담당:

```astro
---
import { getCollection, render } from 'astro:content';

// 1. 빌드 시 모든 블로그 포스트의 정적 경로 생성
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },  // post.id = 파일명 (확장자 제외)
    props: post,
  }));
}

// 2. 현재 포스트 데이터 가져오기
const post = Astro.props;
const { Content } = await render(post);  // Markdown -> 컴포넌트 변환
---

<!-- 3. 레이아웃에 포스트 데이터 전달 -->
<BlogPost {...post.data}>
  <Content />  <!-- 실제 Markdown 콘텐츠 렌더링 -->
</BlogPost>
```

### 3. SEO 메타데이터

`src/components/BaseHead.astro`가 모든 메타태그 처리:
- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- Canonical URLs
- RSS 피드 링크

포스트의 `title`, `description`, `heroImage`가 자동으로 메타태그에 반영됨.

## 서브에이전트 시스템

`.claude/agents/` 디렉토리에 블로그 자동화를 위한 전문 에이전트 정의:

- **content-planner.md**: 콘텐츠 전략 및 주제 계획
- **writing-assistant.md**: 블로그 포스트 작성 지원
- **editor.md**: 문법, 스타일, 메타데이터 검토
- **site-manager.md**: Astro 빌드, 배포, 성능 최적화
- **seo-optimizer.md**: 사이트맵, 메타태그, 내부 링크 최적화
- **analytics.md**: 트래픽 분석 및 성과 측정
- **social-media-manager.md**: 소셜 미디어 공유 자동화
- **portfolio-curator.md**: 프로젝트 포트폴리오 관리
- **learning-tracker.md**: 학습 목표 및 기술 트렌드 추적

필요한 작업에 맞는 에이전트를 참조하여 컨텍스트를 얻을 것.

## 타입 안전성

- TypeScript strict 모드 활성화 (`tsconfig.json`)
- Content Collections는 자동으로 타입 생성 (`.astro/types.d.ts`)
- `CollectionEntry<'blog'>` 타입으로 포스트 데이터 타입 체크

## 빌드 및 배포

```bash
# 빌드 전 타입 체크 권장
npm run astro check

# 프로덕션 빌드
npm run build

# 빌드 결과: ./dist/
# - 정적 HTML 파일
# - 최적화된 자산 (이미지, CSS, JS)
# - 사이트맵 (sitemap-index.xml)
```

**배포 노트**:
- `astro.config.mjs`의 `site` 필드를 실제 도메인으로 변경 필요
- 정적 사이트이므로 Vercel, Netlify, GitHub Pages 등 어디서나 호스팅 가능

## 성능 최적화

Astro는 기본적으로 최적화되어 있지만:

1. **이미지**: 항상 `<Image>` 컴포넌트 사용 (자동 최적화)
2. **클라이언트 JS**: 최소화 (Islands Architecture)
3. **폰트 프리로드**: `BaseHead.astro`에 설정됨
4. **빌드 시 렌더링**: 모든 페이지가 빌드 시 HTML로 변환 (초고속 로딩)

## 디버깅

```bash
# 개발 모드에서 상세한 오류 메시지 제공
npm run dev

# 타입 오류 확인
npm run astro check

# 빌드 오류는 보통 다음 원인:
# 1. Content Collections 스키마 불일치
# 2. getStaticPaths() 누락 (동적 라우트)
# 3. 이미지 경로 오류
```

## 모범 사례

### 콘텐츠 작성
- 블로그 포스트의 `description`은 150-160자 권장 (SEO)
- `heroImage`는 1020x510 비율 권장
- 파일명은 URL-friendly하게 (소문자, 하이픈 사용)

### 컴포넌트 개발
- 재사용 가능한 컴포넌트는 `src/components/`
- 레이아웃은 `src/layouts/`
- Props 타입은 TypeScript interface로 명시

### 성능
- 이미지는 WebP/AVIF 형식 선호
- 불필요한 클라이언트 JavaScript 지양
- Critical CSS는 인라인, 나머지는 외부 파일

### SEO
- 모든 페이지에 고유한 `title`과 `description`
- 이미지에는 항상 `alt` 속성
- 내부 링크는 상대 경로 사용
- 사이트맵과 RSS 피드는 자동 생성됨
