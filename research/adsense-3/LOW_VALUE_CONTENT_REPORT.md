# jangwook.net AdSense "Low Value Content" 심층 분석 보고서

**분석일:** 2026-02-03
**사이트:** https://jangwook.net
**기술 스택:** Astro 5.16.3, Tailwind CSS, GitHub Pages
**규모:** 83 포스트 × 4개 언어(ko/en/ja/zh) = 332 콘텐츠 파일

---

## 1. Executive Summary

### 🚨 핵심 발견사항

| 우선순위 | 문제 | 영향도 |
|---------|------|--------|
| **CRITICAL** | **URL 라우팅 결함으로 996개 유령 페이지 생성** — `[...slug].astro`가 모든 포스트 × 모든 언어 조합(332×4=1,328개)을 생성하여, 996개의 언어 불일치 페이지가 존재 | AdSense 거절의 **가장 유력한 원인** |
| **CRITICAL** | **사이트맵이 404 페이지를 가리킴** — 사이트맵은 `/ko/blog/slug/` 형식이지만 실제 페이지는 `/ko/blog/ko/slug/` 형식. 사이트맵의 모든 블로그 URL이 404 반환 | Google 크롤링/인덱싱 완전 실패 |
| **CRITICAL** | **기계번역 콘텐츠 패턴 명백** — 83개 포스트 전량이 4개 언어로 동일 슬러그 존재. 32개 포스트는 H2/H3/코드블록/줄수가 4개 언어 모두 완벽히 동일. ko-zh 구조 동일 56/83(67%) | "자동 생성 콘텐츠" 판정 가능성 |
| **HIGH** | **주제 편중 심각** — 전체 포스트의 81%가 AI/LLM 또는 블로그 자체 메타 분석 주제. 15%가 블로그 자체 운영 리포트(애널리틱스, AdSense 거절 분석 등) | 콘텐츠 다양성 부족 |
| **HIGH** | **루트 홈페이지(/) JavaScript 의존** — 언어 감지 및 모든 콘텐츠를 클라이언트 JS로 동적 렌더링. 크롤러가 빈 페이지로 인식 | 크롤러 접근성 저하 |

---

## 2. 항목별 상세 분석

### 2.1 자동 생성/AI 생성 콘텐츠 감지

#### 📊 정량 분석

| 지표 | 결과 |
|------|------|
| 4개 언어 모두 **완벽히 동일한 구조** (H2/H3/코드블록/줄수) | **32/83 포스트 (39%)** |
| ko-zh 구조 동일 | **56/83 (67%)** |
| ko-ja 구조 동일 | **40/83 (48%)** |
| 모든 포스트가 4개 언어에 동일 슬러그로 존재 | **83/83 (100%)** |

#### 🔍 샘플 분석: `claude-code-best-practices.md`

| 언어 | H2 | H3 | 코드블록 | 줄수 |
|------|----|----|---------|------|
| ko | 15 | 32 | 16 | 344 |
| en | 15 | 32 | 16 | 344 |
| ja | 15 | 32 | 16 | 344 |
| zh | 15 | 32 | 16 | 344 |

**4개 언어 모두 완벽히 동일한 구조** — 이는 한 언어로 작성 후 AI/기계번역으로 나머지 3개 언어를 생성했음을 명확히 보여줍니다.

#### 🔍 번역 품질 샘플

```
ko: "AI 코딩 어시스턴트는 이제 개발자의 필수 도구가 되었습니다."
en: "AI coding assistants have become essential tools for modern developers."
ja: "AIコーディングアシスタントは、今や開発者の必須ツールとなりました。"
zh: "AI 编程助手现已成为开发者的必备工具。"
```

번역 자체는 자연스러우나, **구조적 동일성** 때문에 Google은 이를 "자동 생성 콘텐츠"로 판단할 가능성이 높습니다.

#### ⚠️ Google의 관점에서의 문제

- Google은 AI 콘텐츠 자체를 금지하지 않으나, **"사람에게 먼저 가치를 제공하는 콘텐츠"**를 요구
- 83개 포스트를 4개 언어로 **일괄 기계번역**한 패턴은 "대규모 자동 콘텐츠 생성"으로 인식될 수 있음
- 특히 en/ja/zh 버전이 해당 언어 사용자에게 **원어민 수준의 자연스러운 콘텐츠**인지 의문

### 2.2 Thin Content 페이지 식별

#### 📊 블로그 포스트 단어 수 분포

| 언어 | 최소 | 최대 | 평균 | < 1,000 | 1,000-2,000 | 2,000-5,000 | 5,000+ |
|------|------|------|------|---------|-------------|-------------|--------|
| ko | 1,162 | 12,529 | 4,536 | 0 | 5 | 50 | 28 |
| en | 665 | 5,571 | 2,484 | 4 | 25 | 51 | 3 |
| ja | 1,349 | 10,469 | 4,576 | 0 | 5 | 48 | 30 |
| zh | 1,025 | 11,065 | 3,972 | 0 | 9 | 56 | 18 |

> ✅ 블로그 포스트 자체는 Thin Content가 아닙니다. 모두 500단어 이상.

#### ⚠️ Thin Content 정적 페이지

| 페이지 | URL | 문제 |
|--------|-----|------|
| **Social** | `/[lang]/social` | 소셜 링크 3개와 이메일뿐. 실질적 콘텐츠 없음 (122줄의 Astro 코드, 대부분 SVG 아이콘) |
| **Contact** | `/[lang]/contact` | 폼만 존재 (174줄) |
| **Terms** | `/[lang]/terms` | 이용약관만 (329줄) |
| **Privacy** | `/[lang]/privacy` | 개인정보처리방침만 (405줄) |
| **Improvement History** | `/[lang]/improvement-history` | 개발 이력 로그 — 일반 사용자에게 가치 없음 (721줄) |

#### ⚠️ 메타/자기참조 블로그 포스트 (13/83 = 16%)

| 포스트 | 문제 |
|--------|------|
| `weekly-analytics-2025-10-14.md` | 블로그 자체 분석 리포트 |
| `three-week-analytics-2025-11-04.md` | 블로그 자체 분석 리포트 |
| `45-day-analytics-report-2025-11.md` | 블로그 자체 분석 리포트 |
| `monthly-analytics-2025-12.md` | 블로그 자체 분석 리포트 |
| `blog-launch-analysis-report.md` | 블로그 런칭 분석 |
| `adsense-rejection-ai-analysis-improvement.md` | AdSense 거절 분석 |
| `ai-content-recommendation-system.md` | 추천 시스템 자체 분석 |
| `metadata-based-recommendation-optimization.md` | 추천 시스템 최적화 |
| `recommendation-system-v3.md` | 추천 시스템 v3 |
| `prompt-engineering-agent-improvements.md` | 자체 에이전트 개선 |
| `multi-agent-orchestration-improvement.md` | 자체 에이전트 개선 |

> 이 포스트들은 **블로그 운영자에게만 의미 있는 콘텐츠**이며, AdSense 심사관이 보기에 "자기 참조적 저가치 콘텐츠"로 판단될 수 있습니다.

### 2.3 중복 콘텐츠 분석

#### 🚨 CRITICAL: 996개 유령 페이지 (URL 라우팅 결함)

**`src/pages/[lang]/blog/[...slug].astro`의 getStaticPaths:**

```javascript
return posts.flatMap((post) => {
    return langs.map((lang) => ({
        params: { lang, slug: post.id },  // post.id = "ko/slug-name"
        props: post,
    }));
});
```

이 코드는 **모든 포스트 × 모든 언어 = 332 × 4 = 1,328개** URL을 생성합니다.

**예: `ko/claude-code-best-practices` 포스트:**

| URL | 콘텐츠 | 상태 |
|-----|--------|------|
| `/ko/blog/ko/claude-code-best-practices/` | 한국어 콘텐츠 + 한국어 UI | ✅ 정상 |
| `/en/blog/ko/claude-code-best-practices/` | **한국어 콘텐츠** + 영어 UI | ❌ 유령 |
| `/ja/blog/ko/claude-code-best-practices/` | **한국어 콘텐츠** + 일본어 UI | ❌ 유령 |
| `/zh/blog/ko/claude-code-best-practices/` | **한국어 콘텐츠** + 중국어 UI | ❌ 유령 |

**결과:**
- 정상 URL: 332개 (콘텐츠 언어 = URL 언어)
- 유령 URL: **996개** (콘텐츠 언어 ≠ URL 언어)
- Google에서 이 996개 페이지를 발견하면 → **대규모 중복/저품질 콘텐츠**로 판정

**실제 확인:**
```
/en/blog/ko/claude-code-best-practices/ → 200 (한국어 콘텐츠가 영어 URL에 표시!)
/ko/blog/en/claude-code-best-practices/ → 200 (영어 콘텐츠가 한국어 URL에 표시!)
```

#### 🚨 CRITICAL: 사이트맵 URL 전체 불일치

| 구분 | URL 형식 | HTTP 상태 |
|------|----------|-----------|
| **사이트맵** | `https://jangwook.net/ko/blog/claude-code-best-practices/` | **404** |
| **실제 페이지** | `https://jangwook.net/ko/blog/ko/claude-code-best-practices/` | 200 |

사이트맵의 `slug` 생성 코드:
```javascript
const slug = post.id.replace(`${LANG}/`, '');
// 결과: /ko/blog/claude-code-best-practices/ (실제로는 존재하지 않는 URL)
```

실제 라우팅의 `slug`:
```javascript
params: { lang, slug: post.id }
// 결과: /ko/blog/ko/claude-code-best-practices/ (실제 URL)
```

**사이트맵의 모든 블로그 URL(332개)이 404를 반환**하므로, Google은 블로그 콘텐츠를 제대로 크롤링하지 못합니다.

#### 🔶 hreflang x-default 오류

```html
<link rel="alternate" hreflang="x-default" 
      href="https://jangwook.net/en/blog/ko/claude-code-best-practices/">
```

x-default가 `/en/blog/ko/slug/`를 가리키는데, 이 URL은 **한국어 콘텐츠**를 보여줍니다. x-default는 영어 콘텐츠 URL(`/en/blog/en/slug/`)을 가리켜야 합니다.

#### 📊 4개 언어 간 콘텐츠 중복

- 모든 83개 포스트가 4개 언어에 동일 슬러그로 존재
- 번역이지만, Google은 이를 다른 콘텐츠로 인정하려면 **올바른 hreflang 설정**이 필요
- 현재 hreflang은 올바른 URL을 가리키지만, **996개 유령 페이지** 때문에 효과가 상쇄

### 2.4 크롤러 가독성 점검

#### web_fetch 테스트 결과

| 페이지 | 크롤러 접근성 | 문제 |
|--------|-------------|------|
| **루트 `/`** | ⚠️ 부분적 | JavaScript 의존. 크롤러가 보는 내용: "Welcome to EffiFlow" + 기본 영어 텍스트만. 블로그 카드/프로젝트 등은 JS로 렌더링 |
| **`/ko/about`** | ✅ 양호 | SSR로 모든 콘텐츠 렌더링 |
| **`/ko/blog`** | ✅ 양호 | SSR로 모든 포스트 카드 렌더링. 단, 83개 포스트가 한 페이지에 전부 표시 |
| **`/ko/blog/ko/slug`** | ✅ 양호 | SSR로 전체 콘텐츠 렌더링 |

#### ⚠️ 루트 홈페이지 JavaScript 의존 문제

`src/pages/index.astro`의 핵심 섹션들:

```html
<!-- 다음 요소들은 JavaScript가 없으면 빈 상태: -->
<div id="about-desc-container" class="space-y-4">
    <!-- Content will be updated by JavaScript -->
</div>
<div id="personal-projects-container">
    <!-- Content will be updated by JavaScript -->
</div>
<div id="professional-works-container">
    <!-- Content will be updated by JavaScript -->
</div>
```

크롤러(Googlebot 포함)가 이 페이지를 방문하면:
- 블로그 카드는 SSR로 렌더링됨 ✅
- About, Projects, Experience 섹션은 **빈 상태** ❌
- 언어 감지/전환도 JS 필수 ❌

#### ✅ 양호한 점

- Astro SSG(Static Site Generation) 사용 — 대부분의 콘텐츠 페이지는 빌드 시 HTML 생성
- `<noscript>` 폰트 폴백 존재
- 이미지는 `<Image>` 컴포넌트로 최적화 (WebP, lazy loading)

### 2.5 사이트 구조/네비게이션

#### Header 네비게이션

| 항목 | 존재 여부 | 비고 |
|------|----------|------|
| 홈 | ✅ | |
| 블로그 | ✅ | |
| 소개 | ✅ | |
| 연락처 | ✅ | |
| 소셜 | ✅ | AdSense에 불필요한 네비게이션 항목 |
| 개선 이력 | ✅ | **삭제 권장** — 일반 사용자에게 가치 없음 |

#### Footer 네비게이션

| 항목 | 존재 여부 |
|------|----------|
| 홈/블로그/소개/연락처/소셜 | ✅ |
| 개인정보처리방침 | ✅ |
| 이용약관 | ✅ |

#### 🔴 404 페이지 없음

`src/pages/404.astro` 파일이 **존재하지 않습니다**. GitHub Pages 기본 404가 표시됩니다.

사이트맵의 모든 블로그 URL이 404를 반환하는 상황에서, 커스텀 404 페이지 부재는 UX와 크롤러 경험 모두에 악영향을 미칩니다.

#### Breadcrumb

- **구조화 데이터(JSON-LD)로만 존재** — BreadcrumbList schema는 올바르게 구현됨
- **시각적 breadcrumb 미존재** — 사용자가 볼 수 있는 breadcrumb UI가 없음

#### 블로그 목록 페이지 페이지네이션

- **페이지네이션 없음** — 83개 포스트가 한 페이지에 전부 표시
- 로딩 성능에는 문제 없으나 (SSG), 사용자 경험 관점에서 개선 여지

### 2.6 메타데이터 품질

#### ✅ 양호한 항목

| 항목 | 상태 |
|------|------|
| title | 83/83 포스트 모두 존재 ✅ |
| description | 83/83 포스트 모두 존재 ✅ |
| pubDate | 83/83 포스트 모두 존재 ✅ |
| heroImage | 83/83 포스트 모두 존재 ✅ |
| tags | 83/83 포스트 모두 존재 ✅ |
| Open Graph (og:title, og:description, og:image) | ✅ 완전 |
| Twitter Card | ✅ 완전 |
| Schema.org (BlogPosting, Person, Organization) | ✅ 풍부함 |
| hreflang (ko/en/ja/zh) | ✅ 존재 (단 x-default 오류) |

#### ⚠️ 문제점

| 항목 | 문제 |
|------|------|
| **Canonical URL** | `https://jangwook.net/ko/blog/ko/slug/` — 이중 언어 접두사가 canonical에 포함 |
| **hreflang x-default** | `/en/blog/ko/slug/` → 한국어 콘텐츠를 가리킴 (잘못됨) |
| **title/description 언어 불일치** | 유령 페이지(`/en/blog/ko/slug/`)에서 한국어 title이 영어 URL에 표시 |
| **중국어 RSS 피드 hreflang 누락** | RSS에 zh hreflang이 없음 |

#### 이미지 alt 태그

- ko 포스트 기준: 28개 인라인 이미지 중 27개 alt 존재 (96%)
- heroImage는 `<Image>` 컴포넌트에서 `alt={title}`로 자동 설정 ✅

### 2.7 페이지 유형별 분석

#### 홈페이지 (`/`)

| 항목 | 상태 | 비고 |
|------|------|------|
| 콘텐츠 밀도 | ⚠️ 보통 | SSR 부분은 풍부하나, 핵심 섹션 JS 의존 |
| 최신 포스트 표시 | ✅ | 언어별 4개씩 표시 |
| 통계 섹션 | ✅ | "320+ Articles, 4 Languages, 8+ Topics" |
| About 섹션 | ⚠️ | JS 의존 — 크롤러에게 빈 상태 |
| Projects 섹션 | ⚠️ | JS 의존 |

#### 홈페이지 (`/[lang]/`)

| 항목 | 상태 | 비고 |
|------|------|------|
| Hero Section | ✅ | SSR 렌더링 |
| 최신 포스트 6개 | ✅ | BlogCard 컴포넌트로 SSR |
| FAQ 섹션 | ✅ | AEO 최적화 FAQ + Schema.org |

#### About 페이지 (`/[lang]/about`)

| 항목 | 상태 | 비고 |
|------|------|------|
| 자기소개 | ⚠️ | 3문단의 짧은 소개. E-E-A-T에 불충분 |
| 경력 | ❌ | **회사명만 나열, 기간/직책/업무 내용 없음** |
| 포트폴리오 | ✅ | 7개 프로젝트 상세 설명 |
| 전문성 증명 | ⚠️ | 구체적 수치/성과 부족 |

**E-E-A-T 관점 주요 문제:**
- Careers 섹션에 SPIKA Inc., Bravance Technologies Inc., Connecty Inc. 이름만 있고 **기간, 직책, 업무 내용이 전혀 없음**
- 프로필 사진 없음
- "10+ years of experience" 같은 구체적 수치가 Schema.org에만 있고 페이지 본문에 없음

#### Blog 목록 페이지

| 항목 | 상태 | 비고 |
|------|------|------|
| 페이지네이션 | ❌ | 83개 포스트 한 번에 표시 |
| 카드 정보 | ✅ | 제목, 설명, 날짜, 태그, 읽기 시간 |
| 카테고리/필터링 | ❌ | 없음 |

#### 개별 블로그 포스트

| 항목 | 상태 | 비고 |
|------|------|------|
| 콘텐츠 깊이 | ✅ | 평균 4,500+ 단어(ko), 코드 예시 풍부 |
| AuthorBox | ✅ | 저자 정보 박스 |
| BuyMeACoffee | ✅ | 후원 링크 |
| Related Posts | ✅ | 관련 포스트 추천 |
| Language Switcher | ✅ | 다른 언어 버전 링크 |
| Reading Progress | ✅ | 읽기 진행률 바 |
| 시각적 Breadcrumb | ❌ | Schema.org만 존재 |

#### Portfolio 페이지 (`/[lang]/portfolio/shadow-dash`)

| 항목 | 상태 |
|------|------|
| 존재 | ✅ |
| 콘텐츠 | ⚠️ 단일 프로젝트만 |

---

## 3. 구체적인 문제 페이지 목록

### 🚨 CRITICAL — 즉시 해결 필요

| URL 패턴 | 개수 | 문제 |
|----------|------|------|
| `/{lang}/blog/{다른lang}/slug/` | **996개** | 언어 불일치 유령 페이지 (한국어 콘텐츠가 영어 URL에 등) |
| 사이트맵 내 `/{lang}/blog/slug/` | **332개** | 전부 404 반환 |
| `/en/blog/ko/*` (x-default) | **83개** | hreflang x-default가 잘못된 콘텐츠를 가리킴 |

### 🔶 HIGH — 빠른 해결 권장

| URL | 문제 |
|-----|------|
| `/` (루트 홈페이지) | About/Projects/Experience 섹션 JS 의존 → 크롤러에 빈 콘텐츠 |
| `/[lang]/about` | E-E-A-T 불충분 — 경력 상세정보 없음 |
| `/[lang]/social` | Thin content — 링크 3개뿐 |
| `/[lang]/improvement-history` | 일반 사용자에게 가치 없는 개발 이력 |

### 🔸 MEDIUM — 개선 권장

| URL | 문제 |
|-----|------|
| `/ko/blog/weekly-analytics-2025-10-14` | 블로그 자체 1주 분석 — 낮은 사용자 가치 |
| `/ko/blog/three-week-analytics-2025-11-04` | 블로그 자체 3주 분석 |
| `/ko/blog/45-day-analytics-report-2025-11` | 블로그 자체 45일 분석 |
| `/ko/blog/monthly-analytics-2025-12` | 블로그 자체 월간 분석 |
| `/ko/blog/blog-launch-analysis-report` | 블로그 런칭 분석 |
| `/ko/blog/adsense-rejection-ai-analysis-improvement` | AdSense 거절 분석 (아이러니) |
| `robots.txt` | 유령 페이지에 대한 Disallow 규칙 없음 |

---

## 4. 우선순위별 개선 권장사항

### 🚨 Critical (AdSense 재신청 전 반드시 해결)

#### C1. URL 라우팅 수정 — 유령 페이지 제거

**현재:**
```javascript
// [lang]/blog/[...slug].astro
return posts.flatMap((post) => {
    return langs.map((lang) => ({
        params: { lang, slug: post.id },  // post.id = "ko/slug"
        props: post,
    }));
});
```

**수정안:**
```javascript
return posts.flatMap((post) => {
    // post.id에서 언어 코드 추출
    const [postLang, ...slugParts] = post.id.split('/');
    const slug = slugParts.join('/');
    
    // 해당 언어의 URL에만 생성
    return {
        params: { lang: postLang, slug },
        props: post,
    };
});
```

**결과:** 1,328개 → 332개 URL. 996개 유령 페이지 완전 제거.

> ⚠️ 이 변경은 URL 구조를 `/ko/blog/ko/slug/` → `/ko/blog/slug/`로 바꿉니다. 기존 URL에서의 리디렉트가 필요합니다.

#### C2. 사이트맵 URL 수정

사이트맵은 이미 `/ko/blog/slug/` 형식을 사용하므로, C1 수정 후 사이트맵과 실제 URL이 자동으로 일치합니다.

#### C3. robots.txt에 유령 페이지 차단 (C1 배포 전 임시 조치)

```
User-agent: *
Allow: /

# Block cross-language ghost pages
Disallow: /ko/blog/en/
Disallow: /ko/blog/ja/
Disallow: /ko/blog/zh/
Disallow: /en/blog/ko/
Disallow: /en/blog/ja/
Disallow: /en/blog/zh/
Disallow: /ja/blog/ko/
Disallow: /ja/blog/en/
Disallow: /ja/blog/zh/
Disallow: /zh/blog/ko/
Disallow: /zh/blog/en/
Disallow: /zh/blog/ja/

Sitemap: https://jangwook.net/sitemap-index.xml
```

#### C4. 다국어 콘텐츠 전략 재검토

**옵션 A (권장): 주력 언어로 축소**
- ko + en만 유지 (ja, zh는 noindex 또는 삭제)
- 83 × 2 = 166개로 축소
- 이유: Google은 "질보다 양"의 다국어 사이트를 부정적으로 봄

**옵션 B: 번역 품질 차별화**
- 각 언어 버전에 **해당 언어 고유의 예시, 참고 자료, 문화적 맥락** 추가
- 구조를 의도적으로 다르게 변경 (섹션 순서, 추가 설명 등)
- en 버전은 이미 일부 포스트에서 다른 구조를 가짐 → 전체로 확장

### 🔶 High (1주 내 해결 권장)

#### H1. 404 커스텀 페이지 생성

`src/pages/404.astro` 생성:
- 다국어 안내 메시지
- 블로그 목록/홈으로의 네비게이션 링크
- 검색 기능 (있다면)

#### H2. About 페이지 E-E-A-T 강화

```
필수 추가 항목:
- [ ] 프로필 사진
- [ ] 각 회사별 근무 기간 (예: 2018-2020)
- [ ] 직책 (예: Full-Stack Developer)
- [ ] 주요 업무 및 성과 (2-3줄)
- [ ] 기술 스택/자격증/수상 경력
- [ ] "이 블로그를 운영하는 이유" 섹션
```

#### H3. 루트 홈페이지 SSR 전환

`src/pages/index.astro`의 About/Projects 섹션을 SSR로 렌더링:
- Accept-Language 헤더 또는 기본 언어(en)로 서버 사이드 렌더링
- 또는 루트를 기본 언어(`/en/`)로 301 리디렉트

#### H4. 블로그 자체 메타 포스트 정리

다음 포스트들을 `noindex` 설정하거나 삭제/통합:
- `weekly-analytics-*`
- `three-week-analytics-*`
- `45-day-analytics-report-*`
- `blog-launch-analysis-report`
- `adsense-rejection-ai-analysis-improvement`

#### H5. hreflang x-default 수정

BaseHead.astro에서:
```javascript
// 현재 (잘못됨)
const xDefaultUrl = `${siteUrl}/en${pathWithoutLang}`;
// pathWithoutLang이 /blog/ko/slug/일 때 → /en/blog/ko/slug/ (한국어 콘텐츠)

// 수정안 (C1 적용 후)
const xDefaultUrl = `${siteUrl}/en${pathWithoutLang}`;
// pathWithoutLang이 /blog/slug/일 때 → /en/blog/slug/ (영어 콘텐츠) ✅
```

### 🔸 Medium (2주 내 해결 권장)

#### M1. Social 페이지 통합 또는 noindex

- About 페이지에 소셜 링크 섹션 추가 → Social 페이지 삭제
- 또는 `<meta name="robots" content="noindex">`

#### M2. Improvement History 페이지 noindex

- 일반 사용자에게 가치 없는 개발 이력
- Header 네비게이션에서 제거
- `noindex` 설정

#### M3. 블로그 목록 페이지네이션 추가

- 10-12개씩 페이지네이션
- 또는 무한 스크롤 (SSR 호환)

#### M4. 시각적 Breadcrumb 추가

BlogPost 레이아웃에 시각적 breadcrumb 추가:
```
홈 > 블로그 > [포스트 제목]
```

### 🔵 Low (여유 있을 때 개선)

#### L1. 주제 다양성 확보

- 현재 81%가 AI/LLM + 블로그 메타
- 웹 개발, 프론트엔드, 백엔드, DevOps 등 다양한 주제 추가 권장

#### L2. 중국어 RSS hreflang 추가

```html
<link rel="alternate" type="application/rss+xml" 
      title="EffiFlow - 中文" 
      href="https://jangwook.net/rss-zh.xml" hreflang="zh" />
```

#### L3. og:type 수정

블로그 포스트에서 `og:type`이 `website`으로 설정 → `article`로 변경

---

## 5. 개선 작업 체크리스트

### Phase 1: 긴급 수정 (AdSense 재신청 전)

- [ ] **C1**: `[...slug].astro` 라우팅 수정 → 유령 페이지 996개 제거
- [ ] **C3**: robots.txt에 유령 페이지 차단 규칙 추가 (C1 배포 전 임시)
- [ ] **C4**: ja/zh 콘텐츠 noindex 설정 또는 삭제 결정
- [ ] **H1**: 404.astro 커스텀 페이지 생성
- [ ] **H4**: 메타 분석 포스트(5-6개) noindex 설정
- [ ] **H5**: hreflang x-default URL 수정
- [ ] C1 배포 후 Google Search Console에서 사이트맵 재제출
- [ ] Google Search Console에서 커버리지 리포트 확인

### Phase 2: 품질 개선 (1-2주)

- [ ] **H2**: About 페이지 E-E-A-T 정보 보강
- [ ] **H3**: 루트 홈페이지 SSR 전환 또는 301 리디렉트
- [ ] **M1**: Social 페이지 통합/noindex
- [ ] **M2**: Improvement History noindex + 네비 제거
- [ ] **M4**: 시각적 Breadcrumb 추가

### Phase 3: 장기 개선

- [ ] **M3**: 블로그 페이지네이션
- [ ] **C4-B**: 남긴 언어 버전의 번역 품질 차별화
- [ ] **L1**: 주제 다양성 확보 (새 포스트)
- [ ] **L2**: 중국어 RSS hreflang
- [ ] **L3**: og:type 수정

### 완료 후 검증

- [ ] `site:jangwook.net` 검색으로 인덱싱 상태 확인
- [ ] Google Search Console 커버리지에서 404 에러 감소 확인
- [ ] 유령 페이지 URL이 인덱스에서 제거되었는지 확인
- [ ] AdSense 재신청

---

## 부록: 분석 데이터 요약

### 블로그 포스트 전체 목록 (83개)

<details>
<summary>접기/펼치기</summary>

| # | Slug | 유형 |
|---|------|------|
| 1 | 45-day-analytics-report-2025-11 | 📊 메타 분석 |
| 2 | adding-chinese-support | 📊 메타 |
| 3 | adsense-rejection-ai-analysis-improvement | 📊 메타 |
| 4 | aeo-implementation-experience | 🤖 AI/SEO |
| 5 | agent-effi-flow-pivot-omotenashi-bot | 🤖 AI/프로젝트 |
| 6 | ai-agent-collaboration-patterns | 🤖 AI |
| 7 | ai-agent-notion-mcp-automation | 🤖 AI |
| 8 | ai-agent-persona-analysis | 🤖 AI |
| 9 | ai-content-recommendation-system | 📊 메타/AI |
| 10 | ai-era-career-advice-for-juniors | 💬 칼럼 |
| 11 | ai-presentation-automation | 🤖 AI |
| 12 | anthropic-agent-skills-practical-guide | 🤖 AI |
| 13 | anthropic-agent-skills-standard | 🤖 AI |
| 14 | anthropic-code-execution-mcp | 🤖 AI |
| 15 | astro-scheduled-publishing | 💻 웹개발 |
| 16 | banana-x-image-prompt-guide | 🤖 AI |
| 17 | bigquery-mcp-prefix-filtering | 🤖 AI |
| 18 | blog-launch-analysis-report | 📊 메타 |
| 19 | chrome-devtools-mcp-performance | 🤖 AI |
| 20 | claude-code-best-practices | 🤖 AI |
| 21 | claude-code-cli-migration-guide | 🤖 AI |
| 22 | claude-code-hooks-workflow | 🤖 AI |
| 23 | claude-code-parallel-testing | 🤖 AI |
| 24 | claude-code-plugins-complete-guide | 🤖 AI |
| 25 | claude-code-verbalized-sampling | 🤖 AI |
| 26 | claude-code-web-automation | 🤖 AI |
| 27 | claude-skills-implementation-guide | 🤖 AI |
| 28 | data-driven-pm-framework | 💼 PM |
| 29 | deep-agents-architecture-optimization | 🤖 AI |
| 30 | dena-llm-study-part1-fundamentals | 🤖 AI |
| 31 | dena-llm-study-part2-structured-output | 🤖 AI |
| 32 | dena-llm-study-part3-model-training | 🤖 AI |
| 33 | dena-llm-study-part4-rag | 🤖 AI |
| 34 | dena-llm-study-part5-agent-design | 🤖 AI |
| 35 | e2e-page-test-automation-claude-code | 🤖 AI |
| 36 | effiflow-automation-analysis-part1 | 🤖 AI |
| 37 | effiflow-automation-analysis-part2 | 🤖 AI |
| 38 | effiflow-automation-analysis-part3 | 🤖 AI |
| 39 | enterprise-ai-adoption-topdown | 🤖 AI |
| 40 | figma-mcp-web-components-sync | 🤖 AI |
| 41 | gcloud-mcp-infrastructure-audit | 🤖 AI |
| 42 | google-analytics-mcp-automation | 📊 메타/AI |
| 43 | google-code-wiki-guide | 💻 웹개발 |
| 44 | google-gemini-file-search-rag-tutorial | 🤖 AI |
| 45 | greptile-ai-coding-report-2025-review | 🤖 AI |
| 46 | individual-developer-ai-saas-journey | 🤖 AI/프로젝트 |
| 47 | iterative-review-cycle-methodology | 🤖 AI |
| 48 | jules-autocoding | 🤖 AI |
| 49 | langgraph-multi-agent | 🤖 AI |
| 50 | llm-blog-automation | 🤖 AI |
| 51 | llm-consumer-research-ssr | 🤖 AI |
| 52 | llm-page-migration-standardization | 🤖 AI |
| 53 | llm-pm-workflow-automation | 🤖 AI |
| 54 | llm-seo-aeo-practical-implementation | 🤖 AI/SEO |
| 55 | mcp-code-execution-practical-implementation | 🤖 AI |
| 56 | mcp-servers-toolkit-introduction | 🤖 AI |
| 57 | metadata-based-recommendation-optimization | 📊 메타/AI |
| 58 | monthly-analytics-2025-12 | 📊 메타 분석 |
| 59 | multi-agent-orchestration-improvement | 📊 메타/AI |
| 60 | n8n-rss-automation | 🤖 AI/자동화 |
| 61 | notion-backlog-slack-claude-project-management | 🤖 AI |
| 62 | openai-agentkit-tutorial-part1 | 🤖 AI |
| 63 | openai-agentkit-tutorial-part2 | 🤖 AI |
| 64 | openclaw-advanced-usage | 🤖 AI |
| 65 | openclaw-installation-tutorial | 🤖 AI |
| 66 | openclaw-introduction-guide | 🤖 AI |
| 67 | playwright-ai-testing | 🤖 AI |
| 68 | prompt-engineering-agent-improvements | 📊 메타/AI |
| 69 | recommendation-system-v3 | 📊 메타/AI |
| 70 | self-healing-ai-systems | 🤖 AI |
| 71 | slack-mcp-team-communication | 🤖 AI |
| 72 | specification-driven-development | 💻 개발방법론 |
| 73 | ssr-survey-analysis | 🤖 AI/데이터 |
| 74 | tailwind-layoffs-opensource-ai-crisis | 💬 칼럼 |
| 75 | tauri-ios-admob-rewarded-ads | 💻 모바일개발 |
| 76 | tauri-pixijs-ios-game-development | 💻 모바일개발 |
| 77 | terraform-ai-batch-infrastructure | ☁️ 인프라 |
| 78 | three-week-analytics-2025-11-04 | 📊 메타 분석 |
| 79 | ux-psychology-frontend-design-skill | 💻 UX |
| 80 | ux-psychology-implementation-case-study | 💻 UX |
| 81 | verbalized-sampling-llm-diversity | 🤖 AI |
| 82 | vertex-ai-search-site-implementation | 🤖 AI |
| 83 | weekly-analytics-2025-10-14 | 📊 메타 분석 |

</details>

### 주제별 분포

| 카테고리 | 개수 | 비율 |
|---------|------|------|
| 🤖 AI/LLM | 55 | 66% |
| 📊 블로그 메타 분석 | 12 | 14% |
| 💻 웹/모바일 개발 | 8 | 10% |
| 💬 칼럼/에세이 | 2 | 2% |
| 💼 PM/방법론 | 2 | 2% |
| ☁️ 인프라 | 1 | 1% |
| 기타 | 3 | 5% |

---

*보고서 작성: 2026-02-03*
*분석 범위: 소스 코드 + 실제 사이트(jangwook.net) + 사이트맵 + robots.txt*
