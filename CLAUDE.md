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
├── agents/         # Claude Code 서브에이전트 정의 (17개)
├── commands/       # 슬래시 커맨드 정의 (6개, /commit, /write-post 등)
├── skills/         # 자동 발견 스킬 (4개: blog-writing, content-analyzer, recommendation-generator, trend-analyzer)
├── guidelines/     # 가이드라인 (implementation-status.md 포함)
├── patterns/       # 코드 실행 및 로딩 패턴
└── security/       # 보안 설정 및 샌드박스 구성
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
  relatedPosts: Array<{   // 필수 (V3: 관련 포스트 추천)
    slug: string
    score: number         // 0~1 사이의 유사도 점수
    reason: {
      ko: string
      ja: string
      en: string
      zh: string          // 중국어 추천 이유 (v3.0 추가)
    }
  }>
}
```

**중요**:

- 블로그 포스트는 언어별 폴더에 위치: `src/content/blog/<ko|en|ja|zh>/`
- 각 언어 폴더에 동일한 파일명으로 저장 (예: `ko/post-title.md`, `en/post-title.md`, `zh/post-title.md`)
- Frontmatter는 반드시 위 스키마를 준수해야 함
- `getCollection('blog')`로 모든 포스트 조회, `.filter(post => post.id.startsWith('ko/'))`로 언어별 필터링
- `render()` 함수로 Markdown/MDX 콘텐츠를 렌더링
- Astro v5에서는 `glob` loader를 사용하여 콘텐츠를 로드

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
2. **@astrojs/tailwind**: Tailwind CSS 통합
3. **@astrojs/sitemap**: 자동 사이트맵 생성 (SEO) - 패키지 설치됨
4. **@astrojs/rss**: RSS 피드 생성 - 패키지 설치됨

**참고**: sitemap과 rss는 패키지가 설치되어 있으나 astro.config.mjs에 명시적으로 추가되지 않았습니다. 필요시 설정 파일에 추가할 수 있습니다.

## 블로그 포스트 작성 워크플로우

### 1. 새 포스트 생성

```markdown
---
title: "포스트 제목"
description: "포스트 설명 (SEO에 중요)"
pubDate: "2025-11-09" # 필수: YYYY-MM-DD 형식만 사용
heroImage: "../../../assets/blog/image.png" # 선택사항
tags: ["tag1", "tag2", "tag3"] # 선택사항
---

# 포스트 내용

Markdown 또는 MDX 형식으로 작성...
```

**중요 규칙 - 다국어 파일 구조**:

- **파일 위치**: `src/content/blog/<언어코드>/[파일명].md`
  - 한국어: `src/content/blog/ko/post-title.md`
  - 영어: `src/content/blog/en/post-title.md`
  - 일본어: `src/content/blog/ja/post-title.md`
  - 중국어: `src/content/blog/zh/post-title.md`
- **블로그 URL 형식**: `/{lang}/blog/{lang}/{slug}`
  - 예: `/ko/blog/ko/post-title`, `/en/blog/en/post-title`
  - 언어 코드가 URL에 두 번 포함됨 (라우팅 구조상)
- **동일한 파일명**: 모든 언어 버전은 각 언어 폴더에 같은 파일명으로 저장
- **언어 자동 인식**: 폴더 경로(`ko/`, `en/`, `ja/`, `zh/`)로 언어 자동 식별
- Frontmatter의 모든 필수 필드 포함 필요
- 이미지는 `src/assets/blog/`에 저장하고 상대 경로로 참조
- 다국어 포스트는 동일한 이미지를 공유 (모든 언어 버전에서 같은 heroImage 경로 사용)
- **pubDate는 반드시 'YYYY-MM-DD' 형식 사용** (예: '2025-10-07') - 작은따옴표 사용
- tags는 배열 형태로 작성 (선택사항, 최대 3개가 카드에 표시됨)
- **relatedPosts는 필수**: 모든 포스트에 관련 포스트 추천 정보 포함 (아래 `/write-post` 커맨드 참조)

### /write-post 커맨드 필수 요구사항

블로그 포스트 작성 시 반드시 다음 사항을 준수:

1. **4개 언어 동시 작성**: 한국어(ko), 일본어(ja), 영어(en), 중국어(zh) 모든 버전 작성
2. **언어별 포스트 수 일치 확인**: 작성 완료 후 각 언어 폴더의 포스트 수가 동일한지 검증
   ```bash
   # 검증 방법
   ls src/content/blog/ko/*.md | wc -l  # 한국어
   ls src/content/blog/ja/*.md | wc -l  # 일본어
   ls src/content/blog/en/*.md | wc -l  # 영어
   ls src/content/blog/zh/*.md | wc -l  # 중국어
   ```
3. **누락된 번역 자동 생성**: 포스트 수가 불일치하면 누락된 언어 버전 자동 생성
4. **relatedPosts 필수 추가**: 모든 포스트에 `relatedPosts` frontmatter 포함 (v3.0: 4개 언어 필수)
   ```yaml
   relatedPosts:
     - slug: "related-post-slug"
       score: 0.85  # 0~1 사이 유사도 점수
       reason:
         ko: "한국어 추천 이유"
         ja: "日本語の推薦理由"
         en: "English recommendation reason"
         zh: "中文推荐理由"  # v3.0 필수
   ```
   > **중요**: v3.0부터 zh(중국어) 추천 이유가 필수입니다. validate_frontmatter.py 스크립트가 자동 검증합니다.
5. **빌드 검증**: `npm run build` 실행하여 모든 언어 버전이 정상 빌드되는지 확인

### 2. 렌더링 프로세스

`src/pages/blog/[...slug].astro`가 모든 블로그 포스트 렌더링 담당:

```astro
---
import { getCollection } from 'astro:content';

// 1. 빌드 시 모든 블로그 포스트의 정적 경로 생성
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },  // post.id = 언어코드/파일명 (예: ko/post-title)
    props: post,
  }));
}

// 2. 현재 포스트 데이터 가져오기
const post = Astro.props;
const { Content } = await post.render();  // Markdown -> 컴포넌트 변환 (Astro v5)
---

<!-- 3. 레이아웃에 포스트 데이터 전달 -->
<BlogPost {...post.data}>
  <Content />  <!-- 실제 Markdown 콘텐츠 렌더링 -->
</BlogPost>
```

**Astro v5 변경사항**:
- `render()` 함수 대신 `post.render()` 메서드 사용
- glob loader를 통한 더 유연한 콘텐츠 로딩
- 타입 안전성 개선

### 3. SEO 메타데이터

`src/components/BaseHead.astro`가 모든 메타태그 처리:

- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- Canonical URLs
- RSS 피드 링크

포스트의 `title`, `description`, `heroImage`가 자동으로 메타태그에 반영됨.

## 서브에이전트 시스템

`.claude/agents/` 디렉토리에 블로그 자동화를 위한 전문 에이전트 정의:

**콘텐츠 관리**:
- **content-planner.md**: 콘텐츠 전략 및 주제 계획
- **writing-assistant.md**: 블로그 포스트 작성 지원
- **editor.md**: 문법, 스타일, 메타데이터 검토
- **content-recommender.md**: Claude LLM 기반 의미론적 콘텐츠 추천 시스템 (TF-IDF 대신 딥러닝 활용)
- **image-generator.md**: 블로그 히어로 이미지 생성

**연구 및 분석**:
- **web-researcher.md**: Brave Search MCP를 활용한 웹 리서치, 기술 검증, 최신 정보 수집
- **post-analyzer.md**: 블로그 포스트 분석 및 개선 제안
- **analytics.md**: 실시간 트래픽 분석, 즉석 인사이트 (비공식, 대화형 응답)
- **analytics-reporter.md**: 공식 리포트 생성, 발행용 분석 문서 (월간/분기 리포트)

> **역할 구분**: analytics.md는 "오늘 조회수가 가장 높은 포스트?"와 같은 즉석 질문용, analytics-reporter.md는 "지난 달 성과 리포트 작성"과 같은 공식 문서 생성용

**SEO 및 마케팅**:
- **seo-optimizer.md**: 사이트맵, 메타태그, 내부 링크 최적화
- **backlink-manager.md**: 백링크 전략 및 관리
- **social-media-manager.md**: 소셜 미디어 공유 자동화

**운영 및 관리**:
- **site-manager.md**: Astro 빌드, 배포, 성능 최적화
- **portfolio-curator.md**: 프로젝트 포트폴리오 관리
- **learning-tracker.md**: 학습 목표 및 기술 트렌드 추적
- **improvement-tracker.md**: 지속적 개선 사항 추적
- **prompt-engineer.md**: AI 프롬프트 최적화

필요한 작업에 맞는 에이전트를 참조하여 컨텍스트를 얻을 것.

### 콘텐츠 추천 시스템

**구현 방식**: Claude LLM 기반 의미론적 분석

**주요 컴포넌트**:
- `.claude/agents/content-recommender.md`: 추천 알고리즘 로직
- `.claude/commands/generate-recommendations.md`: `/generate-recommendations` 슬래시 커맨드
- `src/components/RelatedPosts.astro`: 추천 포스트 표시 컴포넌트
- `recommendations.json`: 사전 생성된 추천 데이터

**사용법**:
```bash
# 모든 포스트에 대한 추천 자동 생성
/generate-recommendations

# 또는 에이전트 직접 호출
@content-recommender "모든 블로그 포스트에 대한 의미론적 추천 생성"
```

**TF-IDF vs Claude LLM**:
- TF-IDF: 키워드 빈도 기반, 빠르지만 의미 이해 부족
- Claude LLM: 의미론적 이해, 맥락 고려, 더 정교한 추천 가능
- 프로젝트는 Claude LLM 방식 채택 (품질 > 속도)

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

## Testing Guidelines

### 타입 체크 및 검증

```bash
# Astro 타입 체크 (권장: 코드 작성 후 항상 실행)
npm run astro check

# 프로덕션 빌드 테스트
npm run build

# 빌드 결과 미리보기
npm run preview
```

### Content Collections 검증

```bash
# 빌드 시 자동 검증:
# - Frontmatter 스키마 준수 여부
# - 필수 필드 누락 여부
# - 타입 불일치 오류
npm run build
```

### 테스트 체크리스트

새로운 콘텐츠나 기능 추가 시:

1. ✓ `npm run astro check` 통과
2. ✓ `npm run build` 성공
3. ✓ `npm run preview`로 로컬 확인
4. ✓ Content Collections 스키마 준수
5. ✓ 이미지 경로 검증 (상대 경로 올바른지)
6. ✓ 다국어 버전 일관성 (동일한 파일명, heroImage)
7. ✓ SEO 메타데이터 완성도 (title 60자, description 150-160자)

## Repository Etiquette

### Git Commit Messages

**형식**: `<type>(<scope>): <subject>`

**Types**:

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

**예시**:

```bash
feat(blog): add claude code best practices post
fix(seo): correct og:image path in BaseHead
docs(claude): update workflow guidelines
style(components): format BlogCard with prettier
```

### Pull Request Guidelines

1. **명확한 제목**: 변경 사항을 한 줄로 요약
2. **상세한 설명**:
   - 변경 이유
   - 주요 변경 사항
   - 테스트 방법
3. **체크리스트**:
   - [ ] `npm run astro check` 통과
   - [ ] `npm run build` 성공
   - [ ] 로컬에서 테스트 완료
   - [ ] 문서 업데이트 (필요 시)

### Branch Strategy

```bash
main              # 프로덕션 브랜치 (항상 배포 가능 상태)
├── feature/*     # 새 기능 개발
├── fix/*         # 버그 수정
└── docs/*        # 문서 업데이트
```

## Environment Setup

### 필수 환경

```bash
# Node.js 버전
node >= 18.0.0

# 패키지 매니저
npm >= 9.0.0
```

### 환경 변수 설정

**`.env` 파일 생성** (선택사항):

```bash
# 이미지 생성 API 키 (Image Generator 에이전트 사용 시)
GEMINI_API_KEY=your_api_key_here

# Analytics (향후 추가 가능)
# GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

**중요**: `.env` 파일은 `.gitignore`에 포함되어 있으므로 커밋되지 않음

### 초기 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd jangwook.net

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 확인
# http://localhost:4321
```

### 추천 VSCode Extensions

- **Astro**: Astro 파일 문법 하이라이팅 및 IntelliSense
- **Tailwind CSS IntelliSense**: Tailwind 클래스 자동완성
- **MDX**: MDX 파일 지원
- **Prettier**: 코드 포맷팅

## Claude Code Workflow Best Practices

### Explore → Plan → Code → Commit 워크플로우

이 프로젝트에서 권장하는 작업 흐름:

#### 1. Explore (탐색)

```bash
# 관련 파일 읽기 (코딩하기 전)
- CLAUDE.md 읽기
- 관련 컴포넌트/페이지 읽기
- Content Collections 스키마 확인
- 기존 블로그 포스트 구조 파악
```

**목적**: 코드베이스 이해, 기존 패턴 파악, 변경 영향 범위 확인

#### 2. Plan (계획)

```bash
# 작업 계획 수립
- 변경 사항 목록 작성
- 파일 수정 순서 결정
- 테스트 계획 수립
- 잠재적 문제점 식별
```

**도구**:

- TodoWrite 도구로 작업 항목 추적
- Think 모드로 복잡한 문제 분석
- 서브에이전트에게 계획 검토 요청 가능

#### 3. Code (구현)

```bash
# 코드 작성 및 수정
- 한 번에 하나의 작업에 집중
- 자주 astro check 실행
- 점진적으로 빌드 테스트
```

**모범 사례**:

- 작은 단위로 작업 (파일 단위, 기능 단위)
- 각 변경 후 즉시 검증
- 에러 발생 시 즉시 수정

#### 4. Commit (커밋)

```bash
# 변경 사항 커밋
git add .
git commit -m "feat(blog): add new post about TypeScript"

# 또는 Claude에게 커밋 요청
"이 변경 사항을 커밋해주세요"
```

### Think 도구 활용 가이드

**언제 사용하는가**:

- 복잡한 아키텍처 결정이 필요할 때
- 다중 파일 수정이 필요한 경우
- 순차적 의사결정이 요구되는 작업
- 정책이 복잡한 환경 (예: SEO 최적화, 다국어 처리)

**예시**:

```
"Think 모드를 사용하여 블로그 포스트의 SEO를 최적화하는
전략을 수립하고, 각 언어별로 최적의 메타데이터를 제안해주세요."
```

### 서브에이전트 활용 전략

**전문화된 작업은 서브에이전트에게 위임**:

```bash
# 콘텐츠 작성
@writing-assistant "TypeScript 5.0 기능에 대한 블로그 포스트 작성"

# SEO 최적화
@seo-optimizer "최근 포스트들의 내부 링크 최적화"

# 이미지 생성
@image-generator "블로그 히어로 이미지 생성"

# 분석 리포트
@analytics "지난 달 블로그 트래픽 분석"
```

**이점**:

- 컨텍스트 집중 (각 에이전트는 특정 도메인에 전문화)
- 토큰 효율성 (불필요한 컨텍스트 제외)
- 명확한 책임 분리

### /clear 명령어 사용 가이드

**언제 사용하는가**:

- 대화가 길어져 컨텍스트가 과부하될 때
- 주제가 완전히 바뀔 때
- 이전 작업과 무관한 새 작업 시작 시

**주의**:

- 진행 중인 작업이 있다면 완료 후 사용
- 중요한 컨텍스트는 CLAUDE.md나 코드에 문서화

### 반복적 개선 (Iteration)

**Claude Code는 반복을 통해 최고의 결과 도출**:

1. **첫 번째 시도**: 기본 구현
2. **피드백 제공**: "더 구체적으로", "SEO 최적화", "성능 개선"
3. **재시도**: Claude가 개선된 버전 생성
4. **반복**: 만족할 때까지 계속

**예시**:

```
1차: "블로그 포스트 작성해줘"
2차: "description을 더 SEO 친화적으로 수정해줘"
3차: "코드 예제에 주석을 추가해줘"
4차: "일본어 버전의 기술 용어를 더 자연스럽게 조정해줘"
```

## Code Style Guidelines

### TypeScript/JavaScript

```typescript
// 타입 명시 (특히 함수 매개변수와 반환값)
function getPost(slug: string): CollectionEntry<"blog"> | undefined {
  // ...
}

// 명확한 변수명 (약어 지양)
const blogPosts = await getCollection("blog"); // ✓
const bp = await getCollection("blog"); // ✗

// 비구조화 할당 선호
const { title, description, pubDate } = post.data; // ✓

// Early return 패턴
if (!post) return null;
// ... 계속 진행
```

### Astro 컴포넌트

```astro
---
// Props 타입 정의
interface Props {
  title: string;
  description?: string;  // 선택적 prop은 ?로 표시
}

const { title, description = '기본값' } = Astro.props;
---

<!-- 명확한 시맨틱 HTML -->
<article>
  <h1>{title}</h1>
  {description && <p>{description}</p>}
</article>

<style>
  /* 스코프 스타일 (컴포넌트 내부만 영향) */
  article {
    /* Tailwind 사용하므로 최소한의 커스텀 CSS만 */
  }
</style>
```

### Markdown/MDX (블로그 포스트)

```markdown
---
# Frontmatter는 간결하게
title: "명확하고 간결한 제목 (60자 이하)"
description: "SEO를 고려한 설명 (150-160자 권장)"
pubDate: "2025-11-09" # 필수: YYYY-MM-DD 형식, 작은따옴표 사용
heroImage: "../../../assets/blog/image.jpg"
tags: ["tag1", "tag2", "tag3"] # 최대 3-5개 권장
---

## 명확한 제목 계층 구조

### 하위 섹션

**강조**와 _이탤릭_ 적절히 사용

\`\`\`typescript
// 코드 블록은 언어 지정 (문법 하이라이팅)
const example = "코드";
\`\`\`

- 리스트는 간결하게
- 각 항목은 한 문장으로
```

**마크다운 작성 시 주의사항**:

1. **볼드 텍스트 포맷팅**: `**텍스트**` 대신 `<strong>텍스트</strong>` HTML 태그를 사용할 것
   - ✓ 올바른 예: `<strong>강조된 텍스트</strong> 이어지는 내용`
   - ✗ 잘못된 예: `**강조된 텍스트** 이어지는 내용`
2. **범위 표기**: 물결표(`~`)가 아닌 전각 틸드(`〜`)를 사용할 것
   - ✓ 올바른 예: `1〜10개`, `2025년 1월〜3월`
   - ✗ 잘못된 예: `1~10개`, `2025년 1월~3월`
3. **중첩된 코드 블록 (Nested Code Blocks)**: 코드 블록 안에 다른 코드 블록을 표시해야 할 때는 **백틱 개수를 다르게** 사용
   - 기본 규칙: 외부 코드 블록의 백틱 수는 내부 코드 블록보다 항상 많아야 함
   - 1단계 중첩: 외부 ```` (4개), 내부 ``` (3개)
   - 2단계 중첩: 외부 ````` (5개), 중간 ```` (4개), 내부 ``` (3개)
   - 3단계 중첩: 외부 `````` (6개), 다음 ````` (5개), 그 다음 ```` (4개), 최내부 ``` (3개)
   - ✓ 올바른 예: 외부 ````markdown, 내부 ```yaml
   - ✗ 잘못된 예: 외부 ```markdown, 내부 ```yaml (같은 백틱 수 - 렌더링 깨짐)
4. **Mermaid 다이어그램 작성 시 주의사항**: Mermaid ESM 모듈 (`mermaid@11`)은 특수 문자 처리에 엄격함

   **레이아웃 방향 (필수: 세로 우선)**:
   - ✓ **`TD` (Top-Down) 또는 `TB` (Top-Bottom) 권장**: 세로로 긴 다이어그램은 모바일/반응형에서 가로 스크롤 없이 표시됨
   - ✗ **`LR` (Left-Right) 지양**: 가로로 긴 다이어그램은 모바일에서 잘리거나 가로 스크롤 필요
   - 예외: 3〜4개 이하의 짧은 흐름은 `LR` 사용 가능
   ```mermaid
   # ✓ 권장: 세로 방향
   graph TD
       A[시작] --> B[처리]
       B --> C[종료]

   # ✗ 지양: 가로 방향 (노드가 많을 때)
   graph LR
       A --> B --> C --> D --> E --> F
   ```

   **다이어그램 타입 선택 가이드**:
   | 용도 | 타입 | 예시 |
   |------|------|------|
   | 프로세스/워크플로우 | `flowchart TD` | 작업 흐름, CI/CD 파이프라인 |
   | 시퀀스/통신 | `sequenceDiagram` | API 호출, 메시지 흐름 |
   | 상태 변화 | `stateDiagram-v2` | 상태 머신, 라이프사이클 |
   | 클래스 구조 | `classDiagram` | 객체 관계, 상속 구조 |
   | ER 다이어그램 | `erDiagram` | 데이터베이스 관계 |
   | 간트 차트 | `gantt` | 프로젝트 일정, 타임라인 |
   | 파이 차트 | `pie` | 비율, 분포 |
   | 마인드맵 | `mindmap` | 개념 정리, 브레인스토밍 |

   **반응형/렌더링 문제 대응**:
   - **가로 오버플로우 방지**: `TD`/`TB` 방향 사용, 노드당 텍스트 20자 이하
   - **노드 수 제한**: 한 다이어그램에 15개 이하 노드 권장 (복잡하면 분할)
   - **긴 텍스트 줄바꿈**: `<br/>` 태그 사용
     ```mermaid
     graph TD
         A["긴 텍스트는<br/>줄바꿈 처리"]
     ```
   - **subgraph로 그룹화**: 복잡한 다이어그램은 논리적 그룹으로 분할
     ```mermaid
     graph TD
         subgraph 입력단계
             A[입력] --> B[검증]
         end
         subgraph 처리단계
             C[처리] --> D[저장]
         end
         B --> C
     ```
   - **subgraph 내 독립 노드 정렬**: 내부 노드들 간 관계가 없을 때 `~~~` (invisible link)로 정렬 개선
     ```mermaid
     graph TD
         subgraph 도구모음
             A[검색] ~~~ B[편집] ~~~ C[저장]
         end
         subgraph 설정
             D[테마] ~~~ E[언어] ~~~ F[알림]
         end
     ```
     - `~~~`: 보이지 않는 연결선으로 노드 간 간격과 정렬 유지
     - 관계 없는 항목들을 나열할 때 레이아웃 깨짐 방지

   **특수 문자 처리**:
   - **슬래시(`/`) 문제**: `[/text]`는 사다리꼴(trapezoid) 노드 문법으로 인식됨
     - ✗ 잘못된 예: `A[/write-post]` → Lexical error 발생
     - ✓ 올바른 예: `A["/write-post"]` → 따옴표로 감싸서 일반 텍스트로 처리
   - **노드 모양 특수 문법** (의도치 않게 사용하지 않도록 주의):
     - `[text]` - 사각형 (기본)
     - `(text)` - 둥근 사각형
     - `{text}` - 다이아몬드 (조건 분기)
     - `[/text/]` - 사다리꼴 (위가 좁음)
     - `[\text\]` - 사다리꼴 (아래가 좁음)
     - `[[text]]` - 서브루틴
     - `[(text)]` - 실린더 (데이터베이스)
     - `((text))` - 원
   - **특수 문자 이스케이프**: 괄호, 꺾쇠, 앰퍼샌드 등은 따옴표로 감싸기
     - ✗ 잘못된 예: `A[click <here>]`
     - ✓ 올바른 예: `A["click <here>"]`
   - **예약어 충돌**: `end`, `click`, `class`, `style`, `graph`, `subgraph` 등은 노드 ID로 사용 금지
     - ✗ 잘못된 예: `end --> start`
     - ✓ 올바른 예: `endNode --> startNode`

   **화살표 문법 정리**:
   - `-->` 기본 화살표
   - `-.->` 점선 화살표
   - `==>` 두꺼운 화살표
   - `--text-->` 텍스트 포함 화살표
   - `-.text.->` 점선 + 텍스트

### Tailwind CSS

```astro
<!-- 일관된 클래스 순서: 레이아웃 → 타이포그래피 → 색상 → 기타 -->
<div class="flex flex-col gap-4 text-lg font-bold text-gray-800 hover:text-blue-600">
  <!-- 내용 -->
</div>

<!-- 반응형 우선 (모바일 → 데스크톱) -->
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- 작은 화면: 100%, 중간: 50%, 큰: 33.3% -->
</div>
```

### 파일 및 폴더 명명 규칙

```
kebab-case           # 파일명, 폴더명
PascalCase           # React/Astro 컴포넌트
camelCase            # 변수, 함수명
UPPER_SNAKE_CASE     # 상수
```

## MCP Server Integration

현재 프로젝트에서 사용 가능한 MCP 서버:

### 1. Context7

**용도**: 최신 라이브러리 문서 조회

```bash
# 사용 예시
"Context7를 사용해서 Astro 5.0의 최신 이미지 최적화 기능을 조회해줘"
"Next.js 15 문서에서 App Router 사용법 가져와줘"
```

**활용 시나리오**:

- 최신 프레임워크 기능 학습
- 라이브러리 업그레이드 시 변경사항 파악
- 블로그 포스트 작성 시 정확한 기술 정보 확보

### 2. Notion API

**용도**: Notion 데이터베이스 연동 (향후 확장 가능)

**권한 설정**: `.claude/settings.local.json`에서 관리

- `API-post-search`: 검색 (허용됨)
- `API-get-self`: 사용자 정보 (허용됨)
- `API-get-block-children`: 블록 내용 (허용됨)

**향후 활용 계획**:

- 블로그 아이디어 Notion 데이터베이스 연동
- 포트폴리오 자동 동기화
- 학습 트래커 통합

### 3. Playwright (Browser Automation)

**용도**: 웹 자동화, 스크린샷, 테스트

**활용 시나리오**:

- 블로그 포스트 미리보기 자동 생성
- OG 이미지 자동 캡처
- 반응형 디자인 테스트
- 라이트하우스 성능 측정

### 4. Chrome DevTools

**용도**: 성능 분석, 네트워크 디버깅

**활용 시나리오**:

- Core Web Vitals 측정
- 이미지 최적화 검증
- CSS/JS 번들 크기 분석
- 페이지 로딩 성능 프로파일링

### 5. Google Analytics (MCP)

**용도**: 블로그 트래픽 분석

**활용 시나리오**:

- 인기 포스트 식별
- 트래픽 소스 분석
- 사용자 행동 패턴 파악
- 콘텐츠 전략 수립

## Advanced Topics

### 이미지 생성 자동화

프로젝트에 포함된 `generate_image.js`:

```bash
# Gemini API를 사용한 이미지 생성
node generate_image.js <output-path> <prompt>

# 예시
node generate_image.js src/assets/blog/hero.jpg "Modern tech blog hero image with TypeScript theme"
```

**통합 방법**:

- Writing Assistant 에이전트가 자동으로 호출
- `/write-post` 명령어에서 자동 실행
- GEMINI_API_KEY 환경 변수 필요

### 다국어 콘텐츠 전략

**파일 구조**:

```
src/content/blog/
├── ko/post-name.md    # 한국어
├── en/post-name.md    # 영어
├── ja/post-name.md    # 일본어
└── zh/post-name.md    # 중국어 (간체)
```

**베스트 프랙티스**:

1. **동시 작성**: 모든 언어 버전을 함께 작성 (번역이 아닌 현지화)
2. **일관성 유지**: 파일명, heroImage, pubDate 동일하게
3. **언어별 최적화**: SEO 메타데이터는 각 언어에 맞게
4. **상호 링크**: 언어 전환 링크 제공

### CI/CD 파이프라인 (GitHub Actions)

**자동화된 워크플로우**:

- Push 시 자동 빌드 및 배포
- Content Collections 스키마 검증
- 타입 체크 자동 실행
- 사이트맵 자동 생성

**로컬 검증**:

```bash
# 배포 전 반드시 실행
npm run astro check && npm run build
```

## 트러블슈팅 가이드

### 자주 발생하는 문제

#### 1. Content Collections 스키마 오류

```
Error: Invalid frontmatter in blog/ko/post.md
```

**해결**:

- `src/content.config.ts`의 스키마 확인
- 모든 필수 필드 (title, description, pubDate) 포함 여부
- 날짜 형식 확인 (YYYY-MM-DD 또는 MMM DD YYYY)

#### 2. 이미지 경로 오류

```
Error: Could not find image at ../../../assets/blog/image.jpg
```

**해결**:

- 이미지 파일이 `src/assets/blog/`에 실제로 존재하는지 확인
- 상대 경로 계산: content 파일 → assets (항상 `../../../assets/`)
- 파일 확장자 정확히 입력 (.jpg, .png, .webp 등)

#### 3. 빌드 실패

```
Error: getStaticPaths() required for dynamic routes
```

**해결**:

- 동적 라우트 파일 (`[param].astro`)에 `getStaticPaths()` 함수 추가
- 모든 가능한 경로를 반환하는지 확인

#### 4. 타입 오류

```
Type 'string' is not assignable to type 'Date'
```

**해결**:

- Content Collections는 자동으로 string을 Date로 변환
- frontmatter에서 날짜는 문자열로 입력
- TypeScript 코드에서는 Date 객체로 취급

### 디버깅 팁

```bash
# 상세한 에러 로그 확인
npm run dev  # 개발 모드에서 더 자세한 오류 메시지

# 빌드 캐시 제거 후 재시도
rm -rf .astro node_modules/.astro
npm run build

# 특정 페이지만 확인
# http://localhost:4321/blog/[slug] 직접 접속
```

### 성능 문제

**느린 빌드**:

- 이미지 수가 많은 경우 정상 (Astro가 모든 이미지 최적화)
- `astro.config.mjs`에서 이미지 최적화 레벨 조정 가능

**큰 번들 크기**:

- 개발자 도구 Network 탭에서 확인
- 불필요한 JavaScript 제거
- 이미지 최적화 (Astro가 자동 처리)

## 구현 상태

구현 상태에 대한 자세한 정보는 `.claude/guidelines/implementation-status.md`를 참조하세요.

**요약**:
- ✅ **활성**: 17개 에이전트, 4개 스킬, 6개 커맨드, MCP 통합, 메타데이터 아키텍처
- ⚠️ **부분 구현**: 보안 샌드박스 (기본 허용 목록만 활성)
- ❌ **이론적/계획**: 상태 관리 시스템, 계획 프로토콜, 복구 프로토콜

**토큰 절감 성과**: 60-70% 비용 절감 달성
- 메타데이터 우선 아키텍처 (post-metadata.json 재사용)
- 증분 처리 (콘텐츠 해시 비교)
- 3계층 캐싱 시스템

## UX 심리학 기반 개선 워크플로우

프론트엔드 디자인이나 UI/UX 개선 작업 시 다음 워크플로우를 따릅니다.

### 워크플로우 단계

```
분석 (Analysis) → 과제 도출 (Issue Identification) → 요건 정의 (Requirements) → 설계 (Design) → 구현 (Implementation)
```

### 1. 분석 단계

- `research/ux-psychology/` 폴더의 문서 참조
- 현재 구현 상태와 UX 심리학 원칙 비교
- 누락된 원칙 및 개선 가능 영역 식별

### 2. 과제 도출

우선순위별로 개선 항목 분류:

| 우선순위 | 카테고리 | 핵심 원칙 |
|---------|---------|----------|
| 1 (필수) | 응답성 | 도허티 임계값, 스켈레톤 로딩, 피드백 |
| 2 (중요) | 인지 부하 | 밀러의 법칙, 청킹, 단계적 공개 |
| 3 (중요) | 사용자 심리 | 사회적 증명, 희소성, 앵커 효과 |
| 4 (권장) | 동기 부여 | 목표 기울기, 자이가르닉, 피크-엔드 |
| 5 (권장) | 접근성 | WCAG AA, 키보드 내비게이션 |

### 3. 요건 정의

각 과제별로 다음 항목 정의:
- 필수 구현 사항 (코드 예시 포함)
- 선택적 구현 사항
- 측정 가능한 성과 지표

### 4. 설계 & 구현

- `frontend-design` 스킬 활용 (`/skill frontend-design`)
- 페이지 타입별 체크리스트 확인
- Review → Revision 사이클 적용

### 관련 리소스

| 파일 | 내용 |
|------|------|
| `research/ux-psychology/01-core-concepts.md` | 40개 UX 심리학 핵심 개념 |
| `research/ux-psychology/02-laws-of-ux.md` | 30개 Laws of UX |
| `research/ux-psychology/03-practical-applications.md` | 기업별 적용 사례 |
| `research/ux-psychology/04-implementation-guide.md` | 구현 가이드 |
| `research/ux-psychology/05-references.md` | 참고 자료 |
| `research/ux-psychology/06-skill-improvement-plan.md` | 스킬 개선 계획 |
| `.claude/skills/frontend-design/SKILL.md` | UX 심리학 통합 스킬 |

## 참고 자료

### 공식 문서

- [Astro 공식 문서](https://docs.astro.build)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Claude Code 문서](https://docs.claude.com/claude-code)
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering)

### Best Practices 출처

- [Claude Code Best Practices (Anthropic)](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Writing Effective Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [The Think Tool](https://www.anthropic.com/engineering/claude-think-tool)

### 커뮤니티 리소스

- Astro Discord
- GitHub Discussions
- Stack Overflow (태그: astro, claude-code)

---

**마지막 업데이트**: 2025-12-01
**작성자**: Claude Code with Best Practices Integration
**버전**: v3.0.1 - Mermaid 다이어그램 가이드라인 추가

## 변경 로그

### v3.0.1 (2025-12-01)
- **Code Style**: Mermaid 다이어그램 종합 가이드라인 추가
  - 세로 방향(TD/TB) 우선 사용 권장 (모바일 반응형 대응)
  - 다이어그램 타입 선택 가이드 (flowchart, sequenceDiagram, stateDiagram 등)
  - 반응형/렌더링 문제 대응 (노드 수 제한, subgraph 그룹화, 줄바꿈)
  - 특수 문자 처리 (슬래시 이스케이프, 노드 모양 문법, 예약어 충돌)
- **Blog Posts**: multi-agent-orchestration-improvement.md Mermaid 에러 수정 (ko, en 버전)

### v3.0 (2025-12-01)
- **Agents**: image-generator.md 경로 이식성 개선, orchestrator.md 실제 예제 3개 추가, analytics/analytics-reporter 역할 경계 명확화, editor.md 워크플로우 통합 문서화
- **Commands**: commit.md 완전 재작성 (12줄→528줄), write-post.md 4개 언어 표준화, write-post-ko.md 중복 제거, 워크플로우 의존성 문서화
- **Skills**: relatedPosts 필수 필드 추가, Python 스크립트 버그 수정, 중국어(zh) SEO 가이드라인 추가
- **Guidelines**: implementation-status.md 신규 생성, 구현 상태 명확화, 토큰 절감 메커니즘 문서화

### v2.1 (2025-11-XX)
- 다국어 번역 일치 검증 추가
- relatedPosts 필수화
