# 빠른 시작 가이드

## 5분 안에 시작하기

### 1단계: 설치 (1분)

```bash
# Playwright 설치
npx playwright install

# 프로젝트 의존성 설치
npm install
```

### 2단계: 첫 테스트 실행 (1분)

```bash
# Claude Code에서 실행
/test-page https://example.com

# 또는 현재 개발 서버
/test-page http://localhost:4321
```

### 3단계: 결과 확인 (3분)

```bash
# 콘솔 출력 확인
# HTML 리포트 열기
open ./test-results/report-TIMESTAMP.html
```

---

## 자주 사용하는 명령어

```bash
# 기본 테스트 (모든 브라우저)
/test-page https://example.com

# Chromium만 테스트 (빠름)
/test-page https://example.com --browsers chromium

# 모바일만 테스트
/test-page https://example.com --mobile-only

# SEO 건너뛰기
/test-page https://example.com --skip-seo

# 상세 로그
/test-page https://example.com --verbose
```

---

## 테스트 항목 체크리스트

| 항목 | 설명 | 우선순위 |
|------|------|----------|
| ✅ 브라우저 호환성 | Chrome, Firefox, Safari | P0 |
| ✅ 링크 무결성 | 깨진 링크 없음 | P0 |
| ✅ 접근성 (a11y) | WCAG 2.1 AA | P0 |
| ✅ 모바일 반응형 | 가로 스크롤 없음 | P0 |
| ⚠️ 이미지 최적화 | WebP, 적절한 사이즈 | P1 |
| ⚠️ SEO | 메타 태그, Lighthouse | P1 |
| ⚠️ 성능 | LCP, CLS, FID | P1 |

---

## 결과 해석

### 상태 아이콘
- ✅ **통과**: 문제 없음
- ⚠️ **개선 필요**: 동작하지만 최적화 가능
- ❌ **실패**: 수정 필요

### 심각도
- 🚨 **Critical**: 즉시 수정
- ⚠️ **Major**: 배포 전 수정 권장
- ℹ️ **Minor**: 시간날 때 개선

---

## 일반적인 이슈 및 해결

### 이미지 과다 사이즈
```
⚠️  hero.jpg: 원본 이미지가 4배 더 큽니다
```

**해결**:
```bash
# 이미지 리사이징 및 WebP 변환
npm run optimize-images
# 또는 수동으로
convert hero.jpg -resize 800x533 hero.webp
```

---

### Alt 텍스트 누락
```
⚠️  3개 이미지에 alt 텍스트 없음
```

**해결**:
```html
<!-- Before -->
<img src="/image.jpg" />

<!-- After -->
<img src="/image.jpg" alt="설명" />
```

---

### LCP 느림
```
⚠️  LCP: 2.8s (권장: 2.5s)
```

**해결**:
```html
<!-- 히어로 이미지에 우선순위 부여 -->
<img src="/hero.webp" fetchpriority="high" />

<!-- 폰트 프리로드 -->
<link rel="preload" href="/fonts/main.woff2" as="font" />
```

---

### 접근성 위반
```
❌ 색상 대비 부족: 3.2:1 (최소: 4.5:1)
```

**해결**:
```css
/* 텍스트 색상 어둡게 */
color: #1a1a1a; /* 기존: #666 */
```

---

## 다음 단계

1. **설정 파일 생성** (선택사항)
   ```bash
   cp .page-test.config.example.js .page-test.config.js
   ```

2. **CI/CD 통합**
   - [GitHub Actions 가이드](./04-usage-guide.md#53-cicd-통합)

3. **커스텀 모듈 개발**
   - [커스텀 모듈 예제](./05-examples.md#3-커스텀-모듈-예제)

4. **상세 문서 읽기**
   - [요구사항 정의](./01-requirements.md)
   - [아키텍처 설계](./02-architecture.md)
   - [구현 계획](./03-implementation-plan.md)
   - [사용 가이드](./04-usage-guide.md)
   - [실전 예제](./05-examples.md)

---

## 도움말

```bash
# 도움말 보기
/test-page --help

# Claude Code 에이전트로 질문
@page-tester "어떻게 사용하나요?"
```

---

**Happy Testing! 🚀**

더 자세한 내용은 [전체 문서](./README.md)를 참고하세요.
