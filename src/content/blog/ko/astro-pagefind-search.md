---
title: Astro 블로그에 Pagefind 검색 추가하기
description: astro-pagefind로 정적 사이트에 빠르고 가볍운 클라이언트 사이드 검색 기능을 구현하는 방법
pubDate: '2025-11-07'
heroImage: ../../../assets/blog/astro-pagefind-search-hero.jpg
tags:
  - astro
  - pagefind
  - search
  - static-site
  - performance
relatedPosts:
  - slug: chrome-devtools-mcp-performance
    score: 0.83
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development topics.
  - slug: claude-code-web-automation
    score: 0.82
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development topics.
  - slug: astro-scheduled-publishing
    score: 0.81
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development topics.
  - slug: weekly-analytics-2025-10-14
    score: 0.8
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
  - slug: playwright-ai-testing
    score: 0.8
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development topics.
---

## 개요

정적 사이트 생성기(SSG)로 블로그를 운영하면 속도와 보안 면에서 많은 이점을 얻을 수 있지만, 한 가지 큰 과제가 있습니다. 바로 **검색 기능**입니다. 전통적인 검색 솔루션은 서버나 외부 서비스를 필요로 하는데, 이는 정적 사이트의 단순함을 해칩니다.

<strong>Pagefind</strong>는 이 문제를 해결하는 혁신적인 라이브러리입니다. 빌드 시 정적 인덱스를 생성하고, 클라이언트 측에서 즉시 검색을 수행하며, 최소한의 대역폭만 사용합니다. Astro 사용자라면 <strong>astro-pagefind</strong> 통합을 통해 더욱 쉽게 구현할 수 있습니다.

## Pagefind란?

[Pagefind](https://pagefind.app/)는 CloudCannon에서 개발한 Rust 기반의 정적 검색 라이브러리입니다. 주요 특징은:

- <strong>정적 인덱싱</strong>: 빌드 시 검색 인덱스 생성
- <strong>저대역폭</strong>: 초기 로드 시 최소한의 JavaScript만 다운로드
- <strong>점진적 로딩</strong>: 검색 시 필요한 데이터만 요청
- <strong>서버 불필요</strong>: 완전한 클라이언트 사이드 검색
- <strong>다국어 지원</strong>: 여러 언어의 콘텐츠 인덱싱 가능
- <strong>커스터마이징</strong>: UI와 검색 동작 완벽 제어

CloudCannon 블로그에 따르면 <strong>MDN 전체를 300KB 미만으로 검색</strong>할 수 있을 정도로 효율적입니다.

## astro-pagefind 설치 및 구성

### 1. 패키지 설치

먼저 필요한 패키지를 설치합니다:

```bash
npm install astro-pagefind
```

### 2. Astro 설정 파일 수정

`astro.config.ts` 또는 `astro.config.mjs`에 통합을 추가합니다:

```typescript
// astro.config.ts
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";

export default defineConfig({
  build: {
    format: "file", // 중요: 각 페이지를 개별 HTML 파일로 생성
  },
  integrations: [pagefind()],
});
```

<strong>중요</strong>: `build.format: "file"` 설정이 필수입니다. 이 옵션이 없으면 Pagefind가 페이지를 올바르게 인덱싱하지 못할 수 있습니다.

### 3. 검색 컴포넌트 추가

검색 기능을 원하는 페이지에 컴포넌트를 추가합니다:

```astro
---
// src/components/Search.astro 또는 직접 페이지에 추가
import Search from "astro-pagefind/components/Search";
---

<Search
  id="search"
  className="pagefind-ui"
  uiOptions={{
    showImages: false,
    excerptLength: 15,
    resetStyles: false,
  }}
/>
```

## UI 옵션 커스터마이징

Pagefind UI는 다양한 설정 옵션을 제공합니다:

### 기본 옵션

```typescript
{
  // 검색창 설정
  showImages: false,        // 검색 결과에 이미지 표시 여부
  showSubResults: false,    // 하위 결과 표시
  excerptLength: 30,        // 발췌문 단어 수

  // 성능 설정
  debounceTimeoutMs: 300,   // 검색 지연 시간 (밀리초)

  // UI 커스터마이징
  resetStyles: true,        // 기본 스타일 초기화

  // 다국어 설정
  translations: {
    placeholder: "검색어를 입력하세요",
    zero_results: "[SEARCH_TERM]에 대한 결과가 없습니다"
  }
}
```

### CSS 커스터마이징

Pagefind UI는 CSS 커스텀 속성(CSS Variables)을 사용하여 스타일을 조정할 수 있습니다:

```css
:root {
  --pagefind-ui-scale: 1;
  --pagefind-ui-primary: #034ad8;
  --pagefind-ui-text: #393939;
  --pagefind-ui-background: #ffffff;
  --pagefind-ui-border: #eeeeee;
  --pagefind-ui-border-width: 1px;
  --pagefind-ui-border-radius: 8px;
  --pagefind-ui-image-border-radius: 4px;
  --pagefind-ui-font: inherit;
}
```

## 다국어 지원

Pagefind는 기본적으로 다국어 사이트를 지원합니다. 언어별로 다른 인덱스를 생성하려면:

### 1. 언어별 페이지 구조

```
src/content/
├── blog/
│   ├── ko/
│   │   └── post-1.md
│   ├── en/
│   │   └── post-1.md
│   └── ja/
│       └── post-1.md
```

### 2. 페이지에 언어 필터 메타 태그 추가

각 페이지의 `<head>` 섹션에 언어 필터를 추가하여 Pagefind가 언어별로 검색 결과를 필터링할 수 있도록 합니다:

```astro
<!-- src/layouts/BlogPost.astro -->
<html lang={lang}>
  <head>
    <!-- 다른 메타 태그들... -->
    <meta name="pagefind-filter-lang" content={lang} />
  </head>
</html>
```

이렇게 설정하면 검색 UI에서 다음과 같은 언어 필터를 사용할 수 있습니다:
- `lang: ko` (한국어)
- `lang: en` (영어)
- `lang: ja` (일본어)

### 3. Pagefind 설정 (선택사항)

```yaml
# pagefind.yml (선택사항)
site: dist
glob: "**/*.html"

# 언어별 인덱스
languages:
  - code: ko
    path: /ko/
  - code: en
    path: /en/
  - code: ja
    path: /ja/
```

## 성능 및 이점

### 1. 정적 인덱싱

Pagefind는 빌드 시 모든 콘텐츠를 인덱싱하므로:

- <strong>런타임 오버헤드 없음</strong>: 검색 인덱스가 사전 생성됨
- <strong>빠른 초기 로드</strong>: 약 20KB의 핵심 JavaScript만 로드
- <strong>CDN 친화적</strong>: 모든 파일이 정적이므로 CDN 캐싱 가능

### 2. 점진적 로딩

```javascript
// Pagefind의 점진적 로딩 방식
// 1. 초기 로드: 20KB (핵심 검색 로직)
// 2. 검색 시작: 관련 인덱스 청크만 다운로드
// 3. 결과 표시: 필요한 콘텐츠만 가져옴
```

이로 인해:

- <strong>초기 페이지 로드 속도 개선</strong>
- <strong>대역폭 절약</strong>: 실제로 검색할 때만 데이터 전송
- <strong>확장성</strong>: 수천 개의 페이지도 빠르게 검색

### 3. 디바운싱 검색

Pagefind는 기본적으로 300ms의 디바운싱을 적용하여:

- 불필요한 검색 요청 방지
- 타이핑 중 부드러운 사용자 경험
- 리소스 효율적 동작

## 실전 예제

### 전체 검색 페이지 구현

```astro
---
// src/pages/search.astro
import Layout from '../layouts/Layout.astro';
import Search from 'astro-pagefind/components/Search';
---

<Layout title="검색 - 내 블로그">
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">블로그 검색</h1>

    <Search
      id="search"
      className="pagefind-ui"
      uiOptions={{
        showImages: true,
        excerptLength: 20,
        debounceTimeoutMs: 300,
        translations: {
          placeholder: "검색어를 입력하세요...",
          clear_search: "지우기",
          load_more: "더 보기",
          zero_results: "[SEARCH_TERM]에 대한 결과를 찾을 수 없습니다"
        }
      }}
    />
  </main>
</Layout>

<style>
  /* Pagefind UI 커스터마이징 */
  :global(.pagefind-ui) {
    --pagefind-ui-primary: #ff5d01;
    --pagefind-ui-border-radius: 12px;
    --pagefind-ui-font: 'Pretendard', sans-serif;
  }

  :global(.pagefind-ui__search-input) {
    padding: 1rem;
    font-size: 1.125rem;
    border: 2px solid var(--pagefind-ui-border);
    transition: border-color 0.2s;
  }

  :global(.pagefind-ui__search-input:focus) {
    border-color: var(--pagefind-ui-primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 93, 1, 0.1);
  }
</style>
```

### 네비게이션에 검색 모달 추가

```astro
---
// src/components/Header.astro
---

<header>
  <nav>
    <!-- 다른 네비게이션 항목들 -->
    <button id="search-toggle" class="search-button">
      🔍 검색
    </button>
  </nav>
</header>

<!-- 검색 모달 -->
<div id="search-modal" class="modal hidden">
  <div class="modal-content">
    <button id="close-modal" class="close-button">✕</button>
    <Search
      id="search"
      className="pagefind-ui"
      uiOptions={{ showImages: false, excerptLength: 15 }}
    />
  </div>
</div>

<script>
  // 모달 토글 로직
  const modal = document.getElementById('search-modal');
  const toggleBtn = document.getElementById('search-toggle');
  const closeBtn = document.getElementById('close-modal');

  toggleBtn?.addEventListener('click', () => {
    modal?.classList.remove('hidden');
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });

  // ESC 키로 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal?.classList.add('hidden');
    }
  });
</script>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal.hidden {
    display: none;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }

  .close-button:hover {
    color: #000;
  }
</style>
```

## 빌드 및 개발 워크플로우

### 빌드 스크립트

astro-pagefind 통합을 사용하면 빌드 프로세스가 자동화됩니다:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview"
  }
}
```

Pagefind 인덱스는 `astro build` 실행 시 자동으로 생성됩니다.

### 개발 모드에서 검색 테스트

개발 중에 검색 기능을 테스트하려면:

1. 먼저 프로덕션 빌드 실행: `npm run build`
2. 미리보기 서버 실행: `npm run preview`
3. 검색 기능 확인

<strong>참고</strong>: 개발 모드(`npm run dev`)에서는 Pagefind 인덱스가 생성되지 않으므로 검색이 작동하지 않습니다.

## 고급 사용법

### 특정 콘텐츠만 인덱싱

HTML 데이터 속성을 사용하여 인덱싱 동작을 제어할 수 있습니다:

```astro
<!-- 이 영역만 인덱싱 -->
<article data-pagefind-body>
  <h1>포스트 제목</h1>
  <p>인덱싱될 콘텐츠...</p>

  <!-- 이 부분은 제외 -->
  <div data-pagefind-ignore>
    광고나 관련 없는 콘텐츠
  </div>
</article>

<!-- 이 영역은 인덱싱되지 않음 -->
<footer>
  푸터 콘텐츠
</footer>
```

### 메타데이터 필터링

검색 결과를 필터링할 수 있는 메타데이터를 추가할 수 있습니다:

```astro
<article
  data-pagefind-body
  data-pagefind-filter="category:tech"
  data-pagefind-filter="tag:astro,javascript"
>
  <!-- 콘텐츠 -->
</article>
```

## 문제 해결

### 검색 결과가 나오지 않는 경우

1. <strong>빌드 확인</strong>: `dist/_pagefind/` 디렉토리가 생성되었는지 확인
2. <strong>format 설정</strong>: `astro.config.ts`에 `build.format: "file"` 추가
3. <strong>data-pagefind-body</strong>: 콘텐츠에 이 속성이 있는지 확인

### 개발 모드에서 검색이 작동하지 않는 경우

이는 정상입니다. Pagefind는 빌드된 정적 파일에서만 작동합니다. `npm run build && npm run preview`로 테스트하세요.

### 한글 검색이 제대로 작동하지 않는 경우

Pagefind는 기본적으로 한글을 지원하지만, 더 나은 검색 결과를 위해 언어 설정을 명시할 수 있습니다:

```yaml
# pagefind.yml
languages:
  - code: ko
```

## 결론

<strong>astro-pagefind</strong>는 정적 Astro 사이트에 빠르고 효율적인 검색 기능을 추가하는 완벽한 솔루션입니다. 주요 이점은:

✓ <strong>제로 서버 비용</strong>: 완전한 클라이언트 사이드 검색
✓ <strong>뛰어난 성능</strong>: 점진적 로딩과 최소 대역폭
✓ <strong>쉬운 구현</strong>: Astro 통합으로 간단한 설정
✓ <strong>커스터마이징</strong>: UI와 동작 완벽 제어
✓ <strong>확장성</strong>: 수천 개의 페이지도 빠르게 검색

단 몇 줄의 코드로 전문적인 검색 기능을 추가할 수 있습니다. 사용자 경험을 크게 개선하면서도 정적 사이트의 단순함과 성능을 유지할 수 있는 이상적인 솔루션입니다.

## 참고 자료

- [Pagefind 공식 문서](https://pagefind.app/)
- [astro-pagefind GitHub](https://github.com/shishkin/astro-pagefind)
- [Pagefind UI 설정 옵션](https://pagefind.app/docs/ui/)
- [CloudCannon: Introducing Pagefind](https://cloudcannon.com/blog/introducing-pagefind/)
