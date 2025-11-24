# 요구사항 정의

## 1. 기능 요구사항

### 1.1 크로스 브라우저 테스트 (P0 - 필수)

#### 테스트 항목
- **브라우저 지원**: Chromium, Firefox, WebKit (Safari 엔진)
- **렌더링 일관성**: 동일한 HTML이 브라우저별로 동일하게 표시되는지 확인
- **CSS 호환성**: Flexbox, Grid, Custom Properties 등의 브라우저 지원 확인
- **JavaScript 호환성**: ES6+ 기능 브라우저 지원 확인

#### 성공 기준
- 3개 브라우저 모두 페이지 로드 성공
- 콘솔 에러 0건
- 레이아웃 브레이크 없음
- 주요 기능 동일하게 동작

#### 검증 방법
```typescript
// 각 브라우저에서 실행
for (const browserType of ['chromium', 'firefox', 'webkit']) {
  const browser = await playwright[browserType].launch();
  const page = await browser.newPage();
  await page.goto(url);

  // 콘솔 에러 수집
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // 스크린샷 비교
  await page.screenshot({ path: `${browserType}-screenshot.png` });

  // 레이아웃 검증
  const layoutMetrics = await page.evaluate(() => {
    return {
      documentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight,
      viewportHeight: window.innerHeight
    };
  });
}
```

---

### 1.2 링크 무결성 검증 (P0 - 필수)

#### 테스트 항목
- **내부 링크**: 사이트 내 모든 `<a href>` 링크의 유효성
- **외부 링크**: 외부 도메인으로의 링크 접근 가능성
- **이미지 링크**: `<img src>` 리소스 로드 성공 여부
- **리소스 링크**: CSS, JS, 폰트 등의 로드 성공 여부
- **앵커 링크**: 페이지 내 해시 링크 (#section) 유효성

#### 성공 기준
- 모든 링크 HTTP 상태 코드 200〜399
- 404, 500 등 에러 응답 0건
- 리다이렉트는 허용하되 과도한 체인(3회 초과) 경고

#### 검증 방법
```typescript
async function checkLinks(page: Page) {
  // 모든 링크 수집
  const links = await page.$$eval('a[href]', anchors =>
    anchors.map(a => ({
      href: a.href,
      text: a.textContent?.trim(),
      isExternal: !a.href.startsWith(window.location.origin)
    }))
  );

  // 각 링크 검증
  const results = [];
  for (const link of links) {
    try {
      const response = await page.request.head(link.href);
      results.push({
        url: link.href,
        status: response.status(),
        ok: response.ok()
      });
    } catch (error) {
      results.push({
        url: link.href,
        error: error.message,
        ok: false
      });
    }
  }

  return results;
}
```

---

### 1.3 UI/UX 검증 (P0 - 필수)

#### 테스트 항목
- **레이아웃 브레이크포인트**: 주요 뷰포트 크기에서 레이아웃 무결성
  - 모바일: 375px, 414px
  - 태블릿: 768px, 1024px
  - 데스크톱: 1280px, 1920px
- **터치 타겟**: 클릭/터치 가능 요소의 최소 크기 (44x44px)
- **텍스트 가독성**: 최소 폰트 크기 (본문 16px, 캡션 14px)
- **컬러 대비**: WCAG AA 기준 (4.5:1 본문, 3:1 대형 텍스트)
- **오버플로우**: 콘텐츠 넘침 현상 확인

#### 성공 기준
- 모든 브레이크포인트에서 레이아웃 무결성 유지
- 터치 타겟 크기 기준 100% 충족
- 텍스트 크기 기준 100% 충족
- 색상 대비 기준 95% 이상 충족

#### 검증 방법
```typescript
async function validateUI(page: Page) {
  // 브레이크포인트별 테스트
  const breakpoints = [375, 768, 1024, 1280, 1920];

  for (const width of breakpoints) {
    await page.setViewportSize({ width, height: 1080 });

    // 오버플로우 체크
    const hasOverflow = await page.evaluate(() => {
      const body = document.body;
      return body.scrollWidth > window.innerWidth;
    });

    // 터치 타겟 크기 체크
    const smallTargets = await page.$$eval('a, button, input, select', elements => {
      return elements
        .filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        })
        .map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 50),
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height
        }));
    });

    // 폰트 크기 체크
    const smallFonts = await page.$$eval('p, span, div, li', elements => {
      return elements
        .filter(el => {
          const fontSize = parseFloat(getComputedStyle(el).fontSize);
          return fontSize < 14;
        })
        .map(el => ({
          tag: el.tagName,
          fontSize: getComputedStyle(el).fontSize,
          text: el.textContent?.trim().slice(0, 30)
        }));
    });
  }
}
```

---

### 1.4 콘텐츠 품질 검증 (P1 - 중요)

#### 테스트 항목
- **맞춤법/오탈자**: 한국어, 영어, 일본어 맞춤법 검사
- **텍스트 가독성**: Flesch Reading Ease 점수
- **메타데이터**: title, description, keywords 완성도
- **중복 콘텐츠**: 동일한 텍스트 반복 감지
- **공백/특수문자**: 과도한 공백, 이상한 특수문자

#### 성공 기준
- 맞춤법 오류 0건 (경고는 허용)
- 메타 title 60자 이내
- 메타 description 150〜160자
- 중복 콘텐츠 없음

#### 검증 방법
```typescript
async function validateContent(page: Page) {
  // 메타데이터 검증
  const metadata = await page.evaluate(() => {
    const title = document.querySelector('title')?.textContent;
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');

    return { title, description, ogTitle };
  });

  // 본문 텍스트 추출
  const bodyText = await page.$eval('body', el => el.innerText);

  // 맞춤법 검사 (외부 API 또는 라이브러리 사용)
  const spellCheckResults = await checkSpelling(bodyText);

  // 중복 텍스트 감지
  const duplicates = findDuplicateText(bodyText, 50); // 50자 이상 중복

  return {
    metadata,
    spellCheck: spellCheckResults,
    duplicates
  };
}
```

---

### 1.5 인터랙션 테스트 (P0 - 필수)

#### 테스트 항목
- **클릭 이벤트**: 버튼, 링크 클릭 시 예상 동작 수행
- **호버 이벤트**: 마우스 오버 시 스타일 변경, 툴팁 표시
- **폼 검증**: 입력 필드 유효성 검사 동작
- **키보드 네비게이션**: Tab, Enter, Esc 키 동작
- **애니메이션**: 전환 효과, 로딩 인디케이터 동작

#### 성공 기준
- 모든 인터랙티브 요소 클릭 가능
- 호버 효과 즉시 반응
- 폼 검증 메시지 정상 표시
- 키보드만으로 주요 기능 사용 가능

#### 검증 방법
```typescript
async function testInteractions(page: Page) {
  // 모든 버튼 찾기
  const buttons = await page.$$('button, [role="button"], input[type="submit"]');

  for (const button of buttons) {
    const buttonText = await button.textContent();

    // 클릭 이벤트 리스너 존재 확인
    const hasListener = await button.evaluate(el => {
      const listeners = getEventListeners(el);
      return listeners.click?.length > 0;
    });

    // 실제 클릭 테스트
    const navigationPromise = page.waitForNavigation({ timeout: 1000 }).catch(() => null);
    await button.click();
    await navigationPromise;

    // 클릭 후 상태 변화 확인
    const stateChanged = await page.evaluate(() => {
      // URL 변경, 모달 표시, 콘텐츠 변경 등 감지
      return document.querySelector('[aria-modal="true"]') !== null;
    });
  }

  // 호버 이벤트 테스트
  const hoverElements = await page.$$('a, button, [data-hover]');
  for (const element of hoverElements) {
    const initialStyle = await element.evaluate(el => getComputedStyle(el).backgroundColor);
    await element.hover();
    const hoverStyle = await element.evaluate(el => getComputedStyle(el).backgroundColor);

    // 스타일 변경 확인
    const hasHoverEffect = initialStyle !== hoverStyle;
  }
}
```

---

### 1.6 이미지 최적화 검증 (P1 - 중요)

#### 테스트 항목
- **렌더링 사이즈 vs 내추럴 사이즈**: 실제 표시 크기와 원본 이미지 크기 비교
- **포맷 최적화**: WebP, AVIF 등 최신 포맷 사용 권장
- **지연 로딩**: `loading="lazy"` 속성 사용 확인
- **반응형 이미지**: `srcset`, `sizes` 속성 사용
- **Alt 텍스트**: 모든 이미지에 대체 텍스트 존재

#### 성공 기준
- 렌더링 사이즈의 2배 이상 큰 원본 이미지 0건
- Alt 텍스트 누락 0건
- 지연 로딩 적용률 80% 이상
- WebP/AVIF 사용률 50% 이상

#### 검증 방법
```typescript
async function validateImages(page: Page) {
  const images = await page.$$eval('img', imgs =>
    imgs.map(img => {
      const rect = img.getBoundingClientRect();
      return {
        src: img.src,
        alt: img.alt,
        loading: img.loading,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: rect.width,
        renderedHeight: rect.height,
        format: img.src.split('.').pop()?.split('?')[0]
      };
    })
  );

  const issues = [];

  for (const img of images) {
    // Alt 텍스트 체크
    if (!img.alt) {
      issues.push({
        type: 'missing-alt',
        src: img.src,
        message: 'Alt 텍스트가 없습니다.'
      });
    }

    // 사이즈 비율 체크
    const widthRatio = img.naturalWidth / img.renderedWidth;
    const heightRatio = img.naturalHeight / img.renderedHeight;

    if (widthRatio > 2 || heightRatio > 2) {
      issues.push({
        type: 'oversized-image',
        src: img.src,
        message: `원본 이미지가 ${Math.round(Math.max(widthRatio, heightRatio))}배 더 큽니다.`,
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        rendered: `${Math.round(img.renderedWidth)}x${Math.round(img.renderedHeight)}`
      });
    }

    // 포맷 체크
    if (!['webp', 'avif'].includes(img.format || '')) {
      issues.push({
        type: 'format-optimization',
        src: img.src,
        message: 'WebP 또는 AVIF 포맷 사용을 권장합니다.',
        currentFormat: img.format
      });
    }

    // 지연 로딩 체크
    if (img.loading !== 'lazy') {
      issues.push({
        type: 'lazy-loading',
        src: img.src,
        message: 'loading="lazy" 속성 추가를 권장합니다.'
      });
    }
  }

  return { images, issues };
}
```

---

### 1.7 접근성 (a11y) 검증 (P0 - 필수)

#### 테스트 항목
- **WCAG 2.1 준수**: AA 레벨 (가능하면 AAA)
- **키보드 네비게이션**: 모든 기능을 키보드만으로 사용 가능
- **스크린 리더**: ARIA 속성, 시맨틱 HTML 사용
- **색상 대비**: 텍스트와 배경의 충분한 대비
- **포커스 인디케이터**: 포커스 상태 시각적으로 명확
- **폼 레이블**: 모든 입력 필드에 연결된 레이블

#### 성공 기준
- Axe-core 자동 검사 0건 오류
- 키보드 네비게이션 100% 가능
- 색상 대비 AA 레벨 100% 충족
- 모든 인터랙티브 요소에 포커스 인디케이터

#### 검증 방법
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

async function validateAccessibility(page: Page) {
  // Axe-core 주입
  await injectAxe(page);

  // 자동 검사 실행
  const results = await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  });

  // 키보드 네비게이션 테스트
  const focusableElements = await page.$$('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

  for (const element of focusableElements) {
    await page.keyboard.press('Tab');
    const isFocused = await element.evaluate(el => document.activeElement === el);

    // 포커스 인디케이터 확인
    const focusStyle = await element.evaluate(el => {
      const style = getComputedStyle(el);
      return {
        outline: style.outline,
        boxShadow: style.boxShadow
      };
    });

    const hasFocusIndicator =
      focusStyle.outline !== 'none' ||
      focusStyle.boxShadow !== 'none';
  }

  // ARIA 속성 검증
  const ariaIssues = await page.$$eval('[role], [aria-label], [aria-labelledby]', elements => {
    return elements
      .filter(el => {
        const role = el.getAttribute('role');
        const label = el.getAttribute('aria-label');
        const labelledby = el.getAttribute('aria-labelledby');

        // role이 있지만 label이 없는 경우
        if (role && !label && !labelledby) {
          return true;
        }

        return false;
      })
      .map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        text: el.textContent?.trim().slice(0, 50)
      }));
  });

  return {
    axeResults: results,
    keyboardNav: { /* ... */ },
    ariaIssues
  };
}
```

---

### 1.8 SEO 검증 (P1 - 중요)

#### 테스트 항목
- **메타 태그**: title, description, keywords
- **Open Graph**: og:title, og:description, og:image
- **Twitter Card**: twitter:card, twitter:title, twitter:image
- **구조화된 데이터**: Schema.org JSON-LD
- **Canonical URL**: 중복 콘텐츠 방지
- **로봇 메타태그**: robots, googlebot
- **사이트맵**: sitemap.xml 존재 및 유효성
- **성능**: Lighthouse 성능 점수

#### 성공 기준
- 모든 필수 메타 태그 존재
- Open Graph 이미지 1200x630px 이상
- 구조화된 데이터 검증 통과
- Lighthouse SEO 점수 90점 이상

#### 검증 방법
```typescript
import lighthouse from 'lighthouse';

async function validateSEO(page: Page) {
  // 메타 태그 검증
  const metaTags = await page.evaluate(() => {
    return {
      title: document.querySelector('title')?.textContent,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content')
    };
  });

  // 구조화된 데이터 검증
  const structuredData = await page.$$eval('script[type="application/ld+json"]', scripts => {
    return scripts.map(script => {
      try {
        return JSON.parse(script.textContent || '');
      } catch {
        return null;
      }
    }).filter(Boolean);
  });

  // Lighthouse 실행
  const lighthouseResults = await lighthouse(page.url(), {
    port: new URL(page.context().browser()!.wsEndpoint()).port,
    output: 'json',
    onlyCategories: ['performance', 'seo', 'accessibility']
  });

  return {
    metaTags,
    structuredData,
    lighthouse: lighthouseResults
  };
}
```

---

### 1.9 모바일 반응형 검증 (P0 - 필수)

#### 테스트 항목
- **뷰포트 설정**: `<meta name="viewport">` 존재
- **터치 제스처**: 스와이프, 핀치 줌 동작
- **터치 타겟**: 최소 44x44px
- **폰트 크기**: 모바일에서 최소 16px
- **가로 스크롤**: 가로 스크롤 없음
- **미디어 쿼리**: 적절한 브레이크포인트 사용

#### 성공 기준
- 모든 모바일 뷰포트에서 가로 스크롤 없음
- 터치 타겟 크기 100% 충족
- 텍스트 가독성 유지

#### 검증 방법
```typescript
async function validateMobileResponsive(page: Page) {
  // 모바일 디바이스 에뮬레이션
  const devices = [
    playwright.devices['iPhone 12'],
    playwright.devices['iPhone 12 Pro'],
    playwright.devices['Pixel 5'],
    playwright.devices['Galaxy S9+']
  ];

  for (const device of devices) {
    await page.setViewportSize(device.viewport);
    await page.setUserAgent(device.userAgent);

    // 뷰포트 메타태그 체크
    const hasViewportMeta = await page.$('meta[name="viewport"]') !== null;

    // 가로 스크롤 체크
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    // 터치 타겟 크기 체크
    const touchTargets = await page.$$eval('a, button, input', elements => {
      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          width: rect.width,
          height: rect.height,
          tooSmall: rect.width < 44 || rect.height < 44
        };
      });
    });

    // 스크린샷
    await page.screenshot({ path: `mobile-${device.name}.png` });
  }
}
```

---

## 2. 비기능 요구사항

### 2.1 성능 요구사항
- **테스트 실행 시간**: 전체 테스트 5분 이내
- **병렬 실행**: 브라우저별 병렬 테스트 지원
- **리소스 사용**: CPU 80% 이하, 메모리 4GB 이하

### 2.2 사용성 요구사항
- **단일 커맨드**: `/test-page <url>` 하나로 모든 테스트 실행
- **진행 상황 표시**: 실시간 진행률 표시
- **직관적인 결과**: 한눈에 파악 가능한 요약 리포트

### 2.3 확장성 요구사항
- **커스텀 룰**: 프로젝트별 검증 규칙 추가 가능
- **플러그인 시스템**: 새로운 테스트 타입 추가 가능
- **설정 파일**: `.page-test.config.js` 설정 지원

### 2.4 유지보수성 요구사항
- **모듈화**: 각 검증 항목을 독립적인 모듈로 분리
- **타입 안전성**: TypeScript로 작성
- **테스트 커버리지**: 테스트 코드 자체의 커버리지 80% 이상

---

## 3. 우선순위

### P0 (필수 - MVP)
1. 크로스 브라우저 테스트
2. 링크 무결성 검증
3. UI/UX 기본 검증
4. 인터랙션 테스트
5. 접근성 검증
6. 모바일 반응형 검증

### P1 (중요 - Phase 2)
1. 콘텐츠 품질 검증
2. 이미지 최적화 검증
3. SEO 검증
4. 상세 성능 분석

### P2 (선택 - Phase 3)
1. 시각적 회귀 테스트
2. 보안 취약점 스캔
3. 다국어 콘텐츠 검증
4. CI/CD 통합

---

## 4. 제약사항

### 4.1 기술적 제약
- Playwright 지원 브라우저만 테스트 가능 (Chromium, Firefox, WebKit)
- JavaScript가 필요한 페이지만 완전 테스트 가능
- 외부 API 의존성이 있는 경우 모킹 필요

### 4.2 환경적 제약
- Node.js 18 이상 필요
- Playwright 브라우저 바이너리 설치 필요 (~500MB)
- 최소 4GB RAM 권장

### 4.3 비용적 제약
- 외부 API (맞춤법 검사, 이미지 분석 등) 사용 시 비용 발생 가능
- CI/CD 환경에서 실행 시 빌드 시간 증가

---

## 5. 성공 지표

### 5.1 품질 지표
- 버그 발견율: 수동 테스트 대비 200% 향상
- 버그 재발율: 50% 감소
- 접근성 준수율: 95% 이상

### 5.2 효율성 지표
- 테스트 시간: 수동 테스트 대비 80% 단축
- 인력 절감: 테스터 1인 기준 50% 시간 절감
- 배포 속도: 테스트 자동화로 배포 주기 2배 단축

### 5.3 사용자 만족도
- 개발자 만족도: 4.5/5.0 이상
- 도입률: 팀 내 80% 이상 사용
- 지속 사용률: 3개월 후 70% 이상 유지

---

**다음 단계**: [아키텍처 설계](./02-architecture.md)
