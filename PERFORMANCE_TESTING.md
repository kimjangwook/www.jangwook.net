# Performance Testing & Core Web Vitals Guide

## 🎯 Core Web Vitals 목표

| Metric | Target | Good | Needs Improvement | Poor |
|--------|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | <2.5s | <2.5s | 2.5-4s | >4s |
| **CLS** (Cumulative Layout Shift) | <0.1 | <0.1 | 0.1-0.25 | >0.25 |
| **INP** (Interaction to Next Paint) | <200ms | <200ms | 200-500ms | >500ms |
| **FCP** (First Contentful Paint) | <1.8s | <1.8s | 1.8-3s | >3s |
| **TTFB** (Time to First Byte) | <600ms | <600ms | 600-1800ms | >1800ms |

## 📊 측정 방법

### A. 개발 환경 (localhost)

#### 1. 브라우저 콘솔에서 실시간 확인
```bash
# 1. 개발 서버 실행
npm run dev

# 2. Chrome에서 http://localhost:4322/ko 열기
# 3. F12 (DevTools) → Console 탭
# 4. 페이지 새로고침
# 5. [Web Vitals] 로그 확인
```

Web Vitals 라이브러리가 자동으로 측정하여 콘솔에 출력합니다.

#### 2. Chrome DevTools Lighthouse

**Desktop 테스트:**
1. Chrome DevTools (F12) → **Lighthouse** 탭
2. Device: **Desktop** 선택
3. Categories: Performance, Accessibility, Best Practices, SEO 체크
4. **Analyze page load** 클릭
5. 결과 확인:
   - Performance Score (목표: 90+)
   - Core Web Vitals 섹션 확인

**Mobile 테스트:**
1. Device: **Mobile** 선택
2. 나머지 동일
3. 모바일 점수는 보통 Desktop보다 낮음 (목표: 80+)

#### 3. Chrome DevTools Performance 탭

**상세 분석:**
1. DevTools (F12) → **Performance** 탭
2. 녹화 버튼 클릭 (⚫️)
3. 페이지 새로고침
4. 로딩 완료 후 녹화 중지
5. 분석:
   - **Main thread activity**: JavaScript 실행 시간
   - **Network waterfall**: 리소스 로딩 순서
   - **Layout shifts**: CLS 원인 파악
   - **Long tasks**: 50ms 이상 작업 식별

### B. 프로덕션 환경

#### 1. Google PageSpeed Insights
```
https://pagespeed.web.dev/
```
- URL 입력 → Analyze
- Mobile & Desktop 모두 측정
- Field Data (실사용자 데이터) + Lab Data (실험실 데이터)

#### 2. Google Search Console
- Core Web Vitals 리포트
- 28일 동안의 실사용자 데이터

#### 3. Google Analytics 4
- 사이트에 이미 Web Vitals 자동 전송 설정됨
- GA4 → Events → Web Vitals 필터
- 이벤트: CLS, LCP, FCP, INP, TTFB

## 🚀 최적화 체크리스트

### 🖼️ LCP 최적화 (Largest Contentful Paint)

**원인:**
- 큰 이미지/비디오
- 느린 서버 응답
- 렌더링 차단 리소스 (CSS, JS)
- 클라이언트 사이드 렌더링

**해결책:**
- [ ] **이미지 최적화**
  - WebP/AVIF 형식 사용
  - 적절한 크기로 리사이징
  - `loading="lazy"` 속성 (below-the-fold 이미지)
  - `<Image>` 컴포넌트 사용 (Astro 자동 최적화)

- [ ] **Critical CSS 인라인**
  ```html
  <style>
    /* Above-the-fold critical styles */
  </style>
  ```

- [ ] **폰트 최적화**
  ```html
  <link rel="preload" href="/fonts/font.woff2" as="font" type="font/woff2" crossorigin>
  ```

- [ ] **Hero Image 우선 로딩**
  ```html
  <link rel="preload" as="image" href="/hero.webp">
  ```

### 📐 CLS 최적화 (Cumulative Layout Shift)

**원인:**
- 크기 없는 이미지/iframe/광고
- 동적 삽입 콘텐츠
- Web Fonts (FOIT/FOUT)

**해결책:**
- [ ] **이미지/비디오에 width, height 명시**
  ```html
  <img src="image.jpg" width="600" height="400" alt="...">
  ```

- [ ] **폰트 로딩 최적화**
  ```css
  @font-face {
    font-family: 'MyFont';
    font-display: swap; /* FOUT 허용, CLS 방지 */
  }
  ```

- [ ] **skeleton UI 또는 placeholder**
  - 콘텐츠 로딩 중 공간 예약

- [ ] **iframe에 aspect-ratio 설정**
  ```css
  iframe {
    aspect-ratio: 16 / 9;
    width: 100%;
  }
  ```

### ⚡ INP/FID 최적화 (Interaction to Next Paint)

**원인:**
- Heavy JavaScript
- Long tasks (>50ms)
- 메인 스레드 blocking

**해결책:**
- [ ] **JavaScript 분할 및 지연 로딩**
  ```html
  <script type="module" src="app.js"></script>
  ```

- [ ] **Code splitting**
  - Astro Islands 활용
  - 필요한 부분만 hydration

- [ ] **Long tasks 분리**
  ```javascript
  // Bad: Long task
  for (let i = 0; i < 10000; i++) {
    heavyWork(i);
  }

  // Good: Chunked
  async function processChunks() {
    for (let i = 0; i < 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 0));
      heavyWork(i);
    }
  }
  ```

- [ ] **requestIdleCallback 사용**
  ```javascript
  requestIdleCallback(() => {
    // Non-critical work
  });
  ```

### 🌐 TTFB 최적화 (Time to First Byte)

**원인:**
- 느린 서버
- CDN 미사용
- 데이터베이스 쿼리 지연

**해결책:**
- [ ] **CDN 사용** (Vercel, Netlify, Cloudflare)
- [ ] **정적 사이트 생성** (Astro SSG - 이미 사용 중 ✅)
- [ ] **HTTP/2 or HTTP/3**
- [ ] **서버 캐싱**

## 🎨 Astro 특화 최적화

### 1. 이미지 최적화 (이미 적용 중)
```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<Image
  src={heroImage}
  alt="Hero"
  width={1020}
  height={510}
  loading="eager"  <!-- Above-the-fold -->
  format="webp"
/>
```

### 2. Critical CSS 추출
- Tailwind의 JIT 모드 (이미 사용 중 ✅)
- 사용하지 않는 CSS 제거

### 3. JavaScript 최소화
- Astro Islands로 필요한 부분만 hydration
- `client:load`, `client:idle`, `client:visible` 지시자 활용

### 4. 폰트 최적화
```astro
<!-- BaseHead.astro -->
<link rel="preload" href="/fonts/font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

## 📈 측정 → 분석 → 최적화 워크플로우

### 1주차: 베이스라인 설정
```bash
# 1. 주요 페이지 측정
- Homepage (/)
- Blog List (/blog)
- Blog Post (/blog/sample-post)
- About (/about)

# 2. 결과 기록
- Lighthouse 점수 스크린샷
- Core Web Vitals 값 기록
- 문제 영역 식별
```

### 2주차: 우선순위 개선
```
High Priority:
- LCP > 4s인 페이지 → 이미지 최적화
- CLS > 0.25 → layout shift 원인 제거

Medium Priority:
- INP > 500ms → JavaScript 최적화
- FCP > 3s → Critical CSS

Low Priority:
- Accessibility 점수 향상
- SEO 미세 조정
```

### 3주차: 재측정 및 비교
```
- 개선 전후 비교
- improvement-history.astro에 결과 기록
- GA4에서 실사용자 데이터 확인
```

## 🔧 자동화 도구

### GitHub Actions (배포 시 자동 측정)
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:4321/
            http://localhost:4321/blog
          uploadArtifacts: true
```

### 로컬 빌드 테스트
```bash
# 1. Production 빌드
npm run build

# 2. Preview
npm run preview

# 3. Lighthouse 측정 (preview 서버 대상)
# Chrome DevTools Lighthouse 사용
```

## 📱 모바일 테스트

### 실제 디바이스 테스트
```bash
# 1. 개발 서버를 --host 옵션으로 실행
npm run dev -- --host

# 2. 같은 WiFi에 연결된 스마트폰에서 접속
http://<your-local-ip>:4322

# 예시
http://192.168.0.33:4322/ko
```

### Chrome DevTools Device Mode
1. F12 → Device Toggle (Cmd+Shift+M)
2. 다양한 디바이스 프리셋 선택
3. Throttling 설정 (Slow 4G, Fast 3G 등)

## 🎯 월간 성능 리포트 템플릿

```markdown
# 성능 측정 리포트 - YYYY-MM

## 📊 Core Web Vitals (Desktop)

| Page | LCP | CLS | INP | Score |
|------|-----|-----|-----|-------|
| Home | 1.2s ✅ | 0.05 ✅ | 45ms ✅ | 95 |
| Blog | 1.5s ✅ | 0.08 ✅ | 67ms ✅ | 92 |
| Post | 2.1s ✅ | 0.12 ⚠️ | 89ms ✅ | 88 |

## 📱 Core Web Vitals (Mobile)

| Page | LCP | CLS | INP | Score |
|------|-----|-----|-----|-------|
| Home | 2.3s ✅ | 0.06 ✅ | 78ms ✅ | 87 |
| Blog | 2.8s ⚠️ | 0.09 ✅ | 102ms ✅ | 84 |
| Post | 3.2s ⚠️ | 0.15 ⚠️ | 145ms ✅ | 79 |

## 🚀 이번 달 개선사항

1. **이미지 최적화** (완료)
   - WebP 형식 전환
   - 평균 LCP 30% 개선

2. **폰트 로딩 개선** (완료)
   - font-display: swap 적용
   - CLS 0.15 → 0.08로 감소

## 🎯 다음 달 목표

- [ ] Mobile LCP < 2.5s (현재 2.8s)
- [ ] 모든 페이지 CLS < 0.1
- [ ] Lighthouse 점수 전체 90+ 달성
```

## 🔗 참고 자료

- [Web.dev - Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring Calculator](https://googlechrome.github.io/lighthouse/scorecalc/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Astro Performance](https://docs.astro.build/en/guides/performance/)
