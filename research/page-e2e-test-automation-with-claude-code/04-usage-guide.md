# 사용 가이드

## 1. 시작하기

### 1.1 초기 설정

```bash
# 1. Playwright 설치 (브라우저 바이너리 포함)
npx playwright install

# 2. 설정 파일 생성 (선택사항)
cp .page-test.config.example.js .page-test.config.js

# 3. 환경 변수 설정 (필요한 경우)
echo "NOTION_API_KEY=your-key" >> .env
echo "SLACK_WEBHOOK_URL=your-webhook" >> .env
```

### 1.2 빠른 시작

```bash
# Claude Code에서 슬래시 커맨드 실행
/test-page https://example.com

# 또는 에이전트 호출
@page-tester "https://example.com을 테스트해줘"

# 현재 개발 서버 테스트
/test-page http://localhost:4321
```

---

## 2. 기본 사용법

### 2.1 전체 테스트 실행

```bash
# 모든 브라우저, 모든 테스트 항목 실행
/test-page https://example.com
```

**실행 시간**: 약 3〜5분
**테스트 항목**: 9개 카테고리 (브라우저 호환성, 링크, UI, 이미지, 접근성, SEO 등)

### 2.2 특정 브라우저만 테스트

```bash
# Chromium만 테스트
/test-page https://example.com --browsers chromium

# Chromium과 Firefox만 테스트
/test-page https://example.com --browsers chromium,firefox
```

**실행 시간**: 약 1〜2분 (브라우저당)

### 2.3 모바일 테스트

```bash
# 모바일 뷰포트만 테스트
/test-page https://example.com --mobile-only
```

**테스트 디바이스**:
- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- Pixel 5 (393x851)
- Galaxy S9+ (412x846)

### 2.4 특정 테스트 건너뛰기

```bash
# 접근성 테스트 건너뛰기
/test-page https://example.com --skip-a11y

# SEO 테스트 건너뛰기
/test-page https://example.com --skip-seo

# 둘 다 건너뛰기
/test-page https://example.com --skip-a11y --skip-seo
```

---

## 3. 결과 해석

### 3.1 콘솔 출력 이해하기

```
🔍 페이지 테스트 시작: https://example.com
────────────────────────────────────────────────────────────

[1/9] ✅ browser-compatibility: chromium 테스트 완료 (0개 에러)
[2/9] ✅ link-integrity: 28/28 링크 정상
[3/9] ⚠️  image-optimization: 2개 문제 발견
[4/9] ✅ accessibility: WCAG AA 준수 (0개 위반)
[5/9] ✅ seo: Lighthouse SEO 95점
[6/9] ⚠️  performance: LCP 2.8s (권장: 2.5s)
[7/9] ✅ ui-quality: 모든 브레이크포인트 정상
[8/9] ✅ interaction: 모든 이벤트 정상
[9/9] ✅ mobile-responsive: 가로 스크롤 없음

────────────────────────────────────────────────────────────

📊 총 9개 카테고리, 7개 통과, 2개 개선 필요

⚠️  개선이 필요한 항목:
  1. hero-image.jpg: 원본 이미지가 4배 더 큽니다 (2400x1600 → 600x400)
  2. LCP 2.8s (권장: 2.5s 이하)

💡 개선 제안:
  1. 이미지 리사이징: hero-image.jpg를 800x533px로 변환 후 WebP 포맷 사용
  2. LCP 개선: 히어로 이미지에 fetchpriority="high" 속성 추가

────────────────────────────────────────────────────────────
⏱  실행 시간: 4.32초

📄 상세 리포트: ./test-results/report-2025-11-21-143022.html
```

#### 상태 아이콘
- ✅ **통과**: 문제 없음, 모든 기준 충족
- ⚠️ **개선 필요**: 동작하지만 최적화 가능
- ❌ **실패**: 심각한 문제, 수정 필요

---

### 3.2 HTML 리포트

HTML 리포트는 `./test-results/` 디렉토리에 저장됩니다.

**포함 내용**:
- 📊 **요약 대시보드**: 전체 테스트 통계
- 📋 **상세 결과**: 각 테스트 항목별 상세 정보
- 🐛 **이슈 목록**: 발견된 문제 전체 리스트
- 💡 **개선 제안**: AI 기반 자동 제안
- 📸 **스크린샷**: 브라우저별 캡처 이미지

**리포트 열기**:
```bash
open ./test-results/report-2025-11-21-143022.html
```

---

### 3.3 JSON 결과

프로그래밍 방식으로 결과를 처리하려면 JSON 파일을 사용하세요.

```json
{
  "url": "https://example.com",
  "timestamp": "2025-11-21T14:30:22.000Z",
  "duration": 245000,
  "summary": {
    "total": 9,
    "passed": 7,
    "warned": 2,
    "failed": 0
  },
  "moduleResults": [
    {
      "module": "browser-compatibility",
      "browser": "chromium",
      "status": "passed",
      "message": "chromium 테스트 완료 (0개 에러)",
      "duration": 1234,
      "data": { /* 상세 데이터 */ }
    }
  ],
  "issues": [
    {
      "type": "oversized-image",
      "severity": "major",
      "message": "원본 이미지가 4배 더 큽니다",
      "location": "https://example.com/hero.jpg"
    }
  ],
  "recommendations": [
    {
      "issue": "이미지 최적화",
      "suggestion": "hero-image.jpg를 800x533px로 리사이징",
      "priority": "high"
    }
  ]
}
```

---

## 4. 일반적인 사용 시나리오

### 4.1 개발 후 품질 체크

**상황**: 새 페이지 개발 완료, 배포 전 최종 검증

```bash
# 1. 로컬 개발 서버 시작
npm run dev

# 2. 전체 테스트 실행
/test-page http://localhost:4321/new-page

# 3. 결과 확인 및 이슈 수정

# 4. 재테스트
/test-page http://localhost:4321/new-page

# 5. 모든 테스트 통과 후 배포
```

---

### 4.2 기존 페이지 개선

**상황**: 성능 최적화 또는 접근성 개선

```bash
# 1. 현재 상태 벤치마크
/test-page https://example.com/old-page

# 2. 개선 작업 수행 (이미지 최적화, a11y 수정 등)

# 3. 개선 후 재테스트
/test-page http://localhost:4321/old-page

# 4. 개선 전후 비교 (JSON 파일 활용)
```

---

### 4.3 크로스 브라우저 검증

**상황**: 특정 브라우저에서 버그 리포트

```bash
# 문제가 보고된 브라우저만 테스트
/test-page https://example.com --browsers firefox

# 또는 모든 브라우저에서 테스트하여 비교
/test-page https://example.com

# 스크린샷 비교
open ./test-results/screenshots/chromium-desktop.png
open ./test-results/screenshots/firefox-desktop.png
open ./test-results/screenshots/webkit-desktop.png
```

---

### 4.4 모바일 반응형 검증

**상황**: 모바일 레이아웃 개발 후 검증

```bash
# 모바일 전용 테스트
/test-page https://example.com --mobile-only

# 특정 디바이스 크기 확인
# (설정 파일에 커스텀 뷰포트 추가 가능)
```

---

### 4.5 SEO 최적화

**상황**: 검색 엔진 최적화 작업

```bash
# SEO 중점 테스트
/test-page https://example.com

# 리포트에서 SEO 섹션 확인:
# - 메타 태그 완성도
# - Open Graph 데이터
# - 구조화된 데이터
# - Lighthouse SEO 점수
```

---

## 5. 고급 사용법

### 5.1 커스텀 설정 파일

`.page-test.config.js` 파일로 프로젝트별 설정을 커스터마이징할 수 있습니다.

```javascript
// .page-test.config.js
module.exports = {
  // 항상 사용할 브라우저
  browsers: ['chromium', 'firefox'],

  // 커스텀 뷰포트 (회사 디자인 시스템에 맞게)
  viewports: [
    { width: 360, height: 640, name: 'Small Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1440, height: 900, name: 'Desktop' }
  ],

  // 더 엄격한 기준
  thresholds: {
    performance: 95,
    accessibility: 100,
    seo: 95
  },

  // 특정 테스트 항상 건너뛰기
  skipTests: ['content-quality'], // 베타 기능 제외

  // 결과 저장 위치
  outputDir: './qa-reports',

  // 리포터 설정
  reporters: {
    console: true,
    html: true,
    json: true,
    slack: true // Slack 알림 활성화
  },

  // Slack 웹훅
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    channel: '#qa-alerts',
    onlyFailures: false // 모든 결과 전송
  }
};
```

---

### 5.2 커스텀 테스트 모듈

프로젝트 고유의 검증 룰을 추가할 수 있습니다.

```javascript
// custom-modules/brand-compliance.js
const { TestModule } = require('page-tester');

class BrandComplianceModule extends TestModule {
  name = 'brand-compliance';
  description = '브랜드 가이드라인 준수 확인';
  priority = 50;
  supportsMobile = true;

  async run(url, browser) {
    const browserInstance = await playwright[browser].launch();
    const page = await browserInstance.newPage();
    await page.goto(url);

    // 브랜드 컬러 체크
    const primaryColor = await page.$eval('body', el =>
      getComputedStyle(el).getPropertyValue('--primary-color')
    );

    const issues = [];

    // 회사 브랜드 컬러가 아닌 경우
    if (primaryColor !== '#1e40af') {
      issues.push({
        type: 'brand-color',
        severity: 'major',
        message: `Primary color가 브랜드 가이드와 다릅니다: ${primaryColor}`,
        expected: '#1e40af',
        actual: primaryColor
      });
    }

    await browserInstance.close();

    return {
      status: issues.length === 0 ? 'passed' : 'warned',
      message: `브랜드 준수 검사 완료`,
      issues
    };
  }
}

module.exports = BrandComplianceModule;
```

**설정 파일에 추가**:
```javascript
// .page-test.config.js
module.exports = {
  customModules: [
    require('./custom-modules/brand-compliance')
  ]
};
```

---

### 5.3 CI/CD 통합

#### GitHub Actions

```yaml
# .github/workflows/page-test.yml
name: Page Quality Test

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm ci
          npx playwright install --with-deps

      - name: Build site
        run: npm run build

      - name: Start server
        run: npm run preview &
        # 서버 시작 대기
        timeout-minutes: 1

      - name: Run page tests
        run: |
          /test-page http://localhost:4321 --browsers chromium,firefox

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: ./test-results/

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(
              fs.readFileSync('./test-results/report-latest.json', 'utf8')
            );

            const comment = `
            ## 페이지 품질 테스트 결과

            - ✅ 통과: ${results.summary.passed}
            - ⚠️ 개선 필요: ${results.summary.warned}
            - ❌ 실패: ${results.summary.failed}

            [상세 리포트 보기](링크)
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

### 5.4 Notion 통합

테스트 결과를 Notion 데이터베이스에 자동 저장할 수 있습니다.

**설정**:
```javascript
// .page-test.config.js
module.exports = {
  reporters: {
    notion: true
  },
  notion: {
    apiKey: process.env.NOTION_API_KEY,
    databaseId: process.env.NOTION_DATABASE_ID
  }
};
```

**결과**:
- 각 테스트 실행이 Notion 페이지로 생성됨
- URL, 날짜, 통과/실패 상태 자동 기록
- 이슈 및 개선 제안 리스트업
- 시간에 따른 품질 추세 추적 가능

---

## 6. 문제 해결

### 6.1 자주 발생하는 오류

#### "브라우저 시작 실패"

```bash
Error: Failed to launch chromium
```

**해결**:
```bash
# Playwright 브라우저 재설치
npx playwright install
```

---

#### "타임아웃 오류"

```bash
Error: Navigation timeout of 30000ms exceeded
```

**해결**:
1. 네트워크 연결 확인
2. 페이지 로딩 시간이 너무 긴 경우 설정 변경:

```javascript
// .page-test.config.js
module.exports = {
  timeout: 60000 // 60초로 연장
};
```

---

#### "메모리 부족 오류"

```bash
Error: Page crashed!
```

**해결**:
1. 브라우저 수 줄이기:
```bash
/test-page https://example.com --browsers chromium
```

2. 병렬 실행 제한:
```javascript
// .page-test.config.js
module.exports = {
  maxConcurrent: 2 // 최대 2개 동시 실행
};
```

---

### 6.2 결과가 기대와 다를 때

#### 접근성 위반이 과도하게 보고됨

일부 라이브러리나 서드파티 위젯에서 발생하는 위반은 무시할 수 있습니다.

```javascript
// .page-test.config.js
module.exports = {
  a11y: {
    ignore: [
      'color-contrast', // 서드파티 위젯
      'landmark-one-main' // SPA 특성상 어려움
    ]
  }
};
```

---

#### 이미지 최적화 경고가 과도함

CDN에서 자동 최적화하는 경우 무시 가능:

```javascript
// .page-test.config.js
module.exports = {
  imageOptimization: {
    ignorePatterns: [
      'https://cdn.example.com/*' // CDN 이미지 제외
    ]
  }
};
```

---

## 7. 베스트 프랙티스

### 7.1 개발 워크플로우 통합

```bash
# 1. 기능 개발 시작
git checkout -b feature/new-page

# 2. 개발 중 주기적으로 로컬 테스트
/test-page http://localhost:4321/new-page --browsers chromium

# 3. 개발 완료 후 전체 테스트
/test-page http://localhost:4321/new-page

# 4. 모든 테스트 통과 후 커밋
git add .
git commit -m "feat: add new page"

# 5. PR 생성 시 자동 테스트 (CI/CD)
git push origin feature/new-page
```

---

### 7.2 정기적인 품질 체크

**주간 품질 보고서**:
```bash
# cron job 또는 GitHub Actions로 주간 실행
/test-page https://example.com
/test-page https://example.com/blog
/test-page https://example.com/about

# 결과를 Notion에 자동 저장
# 시간에 따른 품질 추세 확인
```

---

### 7.3 팀 협업

**Pull Request 체크리스트**:
```markdown
## PR 체크리스트

- [ ] 로컬에서 `/test-page` 실행 완료
- [ ] 모든 테스트 통과 또는 개선 필요 항목 해결
- [ ] HTML 리포트 검토 완료
- [ ] 크로스 브라우저 테스트 완료
- [ ] 모바일 반응형 확인 완료
```

---

## 8. 참고 자료

### 8.1 테스트 항목 상세 가이드

각 테스트 모듈의 상세 기준:
- [크로스 브라우저 호환성](./modules/browser-compatibility.md)
- [링크 무결성](./modules/link-integrity.md)
- [이미지 최적화](./modules/image-optimization.md)
- [접근성 (WCAG 2.1)](./modules/accessibility.md)
- [SEO 최적화](./modules/seo.md)

### 8.2 외부 문서

- [Playwright 공식 문서](https://playwright.dev)
- [Axe-core 가이드](https://www.deque.com/axe/)
- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse 성능 가이드](https://developers.google.com/web/tools/lighthouse)

---

## 9. FAQ

### Q: 프로덕션 사이트를 테스트해도 안전한가요?

**A**: 네, 안전합니다. 이 도구는 읽기 전용으로 페이지를 분석합니다. 폼 제출이나 데이터 변경 작업은 수행하지 않습니다.

---

### Q: 얼마나 자주 테스트해야 하나요?

**A**: 권장 빈도:
- **배포 전**: 필수 (100%)
- **개발 중**: 주요 변경 후마다
- **정기 검사**: 주 1회 (프로덕션)

---

### Q: 테스트 시간을 단축할 수 있나요?

**A**: 네, 여러 방법이 있습니다:
1. 브라우저 수 줄이기 (`--browsers chromium`)
2. 특정 테스트 건너뛰기 (`--skip-seo`)
3. 모바일만 또는 데스크톱만 테스트
4. 캐싱 활용 (외부 링크 검증 결과)

---

### Q: CI/CD에서 실행 시 비용이 많이 드나요?

**A**: GitHub Actions 무료 플랜 기준:
- 테스트 1회: 약 5분 소요
- 월 2000분 무료 제공
- 하루 10회 실행해도 월 1500분으로 충분

---

### Q: 커스텀 테스트 룰을 만들 수 있나요?

**A**: 네, `.page-test.config.js`에서 커스텀 모듈을 추가할 수 있습니다. [커스텀 모듈 가이드](#52-커스텀-테스트-모듈) 참조.

---

## 10. 지원 및 피드백

- **GitHub Issues**: [버그 리포트 및 기능 요청](https://github.com/your-repo/issues)
- **Discord**: [커뮤니티 채널](https://discord.gg/your-channel)
- **Email**: support@example.com

---

**Happy Testing! 🚀**
