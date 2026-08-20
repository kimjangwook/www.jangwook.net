# 실전 예제

## 1. 일반적인 사용 시나리오

### 1.1 블로그 포스트 배포 전 체크

```bash
# 시나리오: 새 블로그 포스트 작성 완료
# 목표: SEO, 접근성, 이미지 최적화 확인

# 1. 로컬 개발 서버에서 테스트
npm run dev

# 2. 전체 테스트 실행
/test-page http://localhost:4321/blog/my-new-post

# 예상 결과:
# ✅ SEO: 메타 태그 완성도, Open Graph 확인
# ✅ 접근성: 이미지 alt, 제목 계층 구조
# ⚠️  이미지: hero-image.jpg 원본 크기 경고
# ✅ 링크: 모든 참고 링크 정상

# 3. 이미지 최적화
npm run optimize-images

# 4. 재테스트
/test-page http://localhost:4321/blog/my-new-post

# 5. 모두 통과하면 배포
npm run build
npm run deploy
```

---

### 1.2 랜딩 페이지 성능 최적화

```bash
# 시나리오: 랜딩 페이지 전환율 개선
# 목표: Core Web Vitals 최적화, 이미지 지연 로딩

# 1. 현재 상태 벤치마크
/test-page https://example.com/landing --verbose > before.txt

# 결과 확인:
# ⚠️  LCP: 3.2s (목표: 2.5s)
# ⚠️  CLS: 0.15 (목표: 0.1)
# ⚠️  이미지: 5개 원본 크기 과다

# 2. 개선 작업
# - 히어로 이미지 WebP 변환 및 사이즈 조정
# - fetchpriority="high" 추가
# - loading="lazy" 추가 (below-the-fold 이미지)
# - CSS 최적화 (layout shift 방지)

# 3. 개선 후 재테스트
/test-page http://localhost:4321/landing --verbose > after.txt

# 4. 전후 비교
diff before.txt after.txt

# 결과:
# ✅ LCP: 2.1s (34% 개선)
# ✅ CLS: 0.05 (67% 개선)
# ✅ 이미지: 모든 이미지 최적화됨
```

---

### 1.3 다국어 사이트 일관성 체크

```bash
# 시나리오: 한국어, 영어, 일본어 사이트 동시 운영
# 목표: 모든 언어 버전 품질 균일성 확인

# 각 언어 버전 테스트
/test-page https://example.com/ko --browsers chromium
/test-page https://example.com/en --browsers chromium
/test-page https://example.com/ja --browsers chromium

# 또는 스크립트로 자동화
for lang in ko en ja; do
  echo "Testing $lang version..."
  /test-page https://example.com/$lang
done

# 결과 비교:
# - 메타 태그: 각 언어에 맞게 설정되었는지
# - 폰트: 한글/영어/일본어 가독성
# - 레이아웃: 텍스트 길이 차이로 인한 깨짐 확인
```

---

### 1.4 e-커머스 제품 페이지 검증

```bash
# 시나리오: 제품 상세 페이지 품질 보증
# 목표: 구조화된 데이터, 이미지 최적화, 접근성

/test-page https://shop.example.com/products/item-123

# 중요 체크 항목:
# ✅ Schema.org Product 데이터: 가격, 재고, 리뷰
# ✅ 이미지 갤러리: alt, srcset, loading
# ✅ 버튼: "장바구니 담기" 클릭 이벤트
# ✅ 폼: 수량 선택, 옵션 선택 검증
# ✅ 접근성: 키보드 네비게이션, 스크린 리더

# 특히 주의할 이슈:
# - 가격 정보 누락 또는 불일치
# - 제품 이미지 alt 텍스트 없음
# - "장바구니 담기" 버튼 터치 타겟 작음
```

---

## 2. 에이전트 활용 예제

### 2.1 자동 개선 제안 받기

```
User: @page-tester "https://example.com/blog/post를 테스트하고 개선 방안을 알려줘"

Agent: 페이지 테스트를 시작합니다...

[테스트 실행 중...]

분석 완료! 다음과 같은 개선이 필요합니다:

**긴급 (P0)**
1. 이미지 최적화: hero.jpg가 4배 큰 원본 사용 중
   - 현재: 2400x1600
   - 권장: 800x533 (WebP)
   - 예상 절감: 1.2MB → 180KB (85% 감소)

2. Alt 텍스트 누락: 3개 이미지에 대체 텍스트 없음

**중요 (P1)**
3. LCP 개선: 현재 2.8s → 목표 2.5s
   - 히어로 이미지에 fetchpriority="high" 추가
   - 폰트 프리로드 추가

**선택 (P2)**
4. 메타 description 길이: 172자 (권장: 150-160자)

개선 코드를 생성할까요? (yes/no)

User: yes

Agent: 다음과 같이 수정하세요:

```html
<!-- Before -->
<img src="/hero.jpg" />

<!-- After -->
<img
  src="/hero.webp"
  alt="블로그 포스트 히어로 이미지"
  width="800"
  height="533"
  fetchpriority="high"
  loading="eager"
/>
```

추가로 이미지 생성이 필요하면 알려주세요!
```

---

### 2.2 CI/CD 통합 시뮬레이션

```
User: @page-tester "GitHub Actions에서 PR마다 자동 테스트하도록 설정해줘"

Agent: GitHub Actions 워크플로우를 생성합니다.

`.github/workflows/page-quality.yml` 파일을 생성했습니다:

```yaml
name: Page Quality Check

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm ci
          npx playwright install --with-deps

      - name: Build
        run: npm run build

      - name: Test pages
        run: |
          npm run preview &
          sleep 5
          /test-page http://localhost:4321 --browsers chromium,firefox

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: ./test-results/

      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('./test-results/report-latest.json'));

            const status = results.summary.failed > 0 ? '❌' : '✅';
            const body = `
            ${status} **페이지 품질 테스트 결과**

            - 통과: ${results.summary.passed}
            - 개선 필요: ${results.summary.warned}
            - 실패: ${results.summary.failed}

            ${results.issues.length > 0 ? `**발견된 이슈 (${results.issues.length}개)**\n${results.issues.slice(0, 3).map(i => `- ${i.message}`).join('\n')}` : ''}
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });
```

이제 PR을 생성할 때마다 자동으로 테스트가 실행됩니다!
```

---

## 3. 커스텀 모듈 예제

### 3.1 브랜드 컬러 검증

```typescript
// custom-modules/brand-colors.ts
import { TestModule, TestResult } from '../src/page-tester/types';
import { Page } from 'playwright';

export class BrandColorModule implements TestModule {
  name = 'brand-colors';
  description = '브랜드 컬러 가이드라인 준수 확인';
  priority = 50;
  supportsMobile = true;

  private BRAND_COLORS = {
    primary: '#1e40af',
    secondary: '#f59e0b',
    accent: '#10b981'
  };

  async run(url: string, browser: BrowserType): Promise<TestResult> {
    const browserInstance = await playwright[browser].launch();
    const page = await browserInstance.newPage();
    await page.goto(url);

    // CSS 변수 추출
    const colors = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        primary: styles.getPropertyValue('--color-primary').trim(),
        secondary: styles.getPropertyValue('--color-secondary').trim(),
        accent: styles.getPropertyValue('--color-accent').trim()
      };
    });

    await browserInstance.close();

    const issues = [];

    // 각 컬러 검증
    for (const [name, expected] of Object.entries(this.BRAND_COLORS)) {
      const actual = colors[name];

      if (actual !== expected) {
        issues.push({
          type: 'brand-color-mismatch',
          severity: 'major',
          message: `${name} 컬러가 브랜드 가이드와 다릅니다`,
          expected,
          actual: actual || 'undefined'
        });
      }
    }

    return {
      status: issues.length === 0 ? 'passed' : 'warned',
      message: `브랜드 컬러 검증 완료 (${issues.length}개 불일치)`,
      data: { colors },
      issues
    };
  }
}
```

**사용법**:
```javascript
// .page-test.config.js
module.exports = {
  customModules: [
    require('./custom-modules/brand-colors')
  ]
};
```

---

### 3.2 타사 스크립트 성능 모니터링

```typescript
// custom-modules/third-party-scripts.ts
import { TestModule, TestResult } from '../src/page-tester/types';

export class ThirdPartyScriptsModule implements TestModule {
  name = 'third-party-scripts';
  description = '타사 스크립트 성능 영향 분석';
  priority = 70;
  supportsMobile = true;

  async run(url: string, browser: BrowserType): Promise<TestResult> {
    const browserInstance = await playwright[browser].launch();
    const page = await browserInstance.newPage();

    // 네트워크 요청 모니터링
    const requests: any[] = [];
    page.on('request', req => {
      requests.push({
        url: req.url(),
        resourceType: req.resourceType(),
        isThirdParty: !req.url().startsWith(new URL(url).origin)
      });
    });

    await page.goto(url, { waitUntil: 'networkidle' });

    // 타사 스크립트 분석
    const thirdPartyScripts = requests.filter(
      r => r.isThirdParty && r.resourceType === 'script'
    );

    await browserInstance.close();

    const issues = [];

    // 과도한 타사 스크립트 경고
    if (thirdPartyScripts.length > 5) {
      issues.push({
        type: 'excessive-third-party',
        severity: 'minor',
        message: `타사 스크립트가 ${thirdPartyScripts.length}개로 과도합니다 (권장: 5개 이하)`,
        actual: thirdPartyScripts.map(s => s.url)
      });
    }

    return {
      status: issues.length === 0 ? 'passed' : 'warned',
      message: `타사 스크립트 ${thirdPartyScripts.length}개 발견`,
      data: { thirdPartyScripts },
      issues
    };
  }
}
```

---

### 3.3 GDPR 쿠키 배너 검증

```typescript
// custom-modules/gdpr-compliance.ts
import { TestModule, TestResult } from '../src/page-tester/types';

export class GDPRComplianceModule implements TestModule {
  name = 'gdpr-compliance';
  description = 'GDPR 쿠키 배너 및 개인정보 처리방침 확인';
  priority = 80;
  supportsMobile = true;

  async run(url: string, browser: BrowserType): Promise<TestResult> {
    const browserInstance = await playwright[browser].launch();
    const page = await browserInstance.newPage();
    await page.goto(url);

    const issues = [];

    // 쿠키 배너 존재 확인
    const cookieBanner = await page.$(
      '[role="dialog"][aria-label*="cookie"], .cookie-banner, #cookie-consent'
    );

    if (!cookieBanner) {
      issues.push({
        type: 'missing-cookie-banner',
        severity: 'critical',
        message: '쿠키 동의 배너를 찾을 수 없습니다 (GDPR 필수)'
      });
    } else {
      // "거부" 버튼 존재 확인 (GDPR 요구사항)
      const rejectButton = await cookieBanner.$(
        'button:has-text("거부"), button:has-text("Reject"), button:has-text("拒否")'
      );

      if (!rejectButton) {
        issues.push({
          type: 'missing-reject-button',
          severity: 'major',
          message: '쿠키 거부 버튼이 없습니다 (GDPR 위반 가능성)'
        });
      }
    }

    // 개인정보 처리방침 링크 확인
    const privacyLink = await page.$(
      'a[href*="privacy"], a:has-text("개인정보"), a:has-text("Privacy")'
    );

    if (!privacyLink) {
      issues.push({
        type: 'missing-privacy-policy',
        severity: 'major',
        message: '개인정보 처리방침 링크를 찾을 수 없습니다'
      });
    }

    await browserInstance.close();

    return {
      status: issues.length === 0 ? 'passed' : issues.some(i => i.severity === 'critical') ? 'failed' : 'warned',
      message: `GDPR 준수 검사 완료 (${issues.length}개 이슈)`,
      issues
    };
  }
}
```

---

## 4. 결과 분석 예제

### 4.1 시간에 따른 성능 추적

```javascript
// scripts/track-performance.js
const fs = require('fs');
const { testPage } = require('../src/page-tester');

async function trackPerformance() {
  const url = 'https://example.com';
  const results = await testPage(url, { browsers: ['chromium'] });

  // 성능 데이터 추출
  const performance = {
    date: new Date().toISOString(),
    lcp: results.moduleResults.find(m => m.module === 'performance')?.data?.lcp,
    fid: results.moduleResults.find(m => m.module === 'performance')?.data?.fid,
    cls: results.moduleResults.find(m => m.module === 'performance')?.data?.cls,
    lighthouse: results.moduleResults.find(m => m.module === 'seo')?.data?.lighthouse?.performance
  };

  // 기록 누적
  const historyFile = './performance-history.json';
  const history = fs.existsSync(historyFile)
    ? JSON.parse(fs.readFileSync(historyFile))
    : [];

  history.push(performance);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  console.log('성능 데이터 기록 완료');
  console.log(`LCP: ${performance.lcp}s`);
  console.log(`CLS: ${performance.cls}`);
  console.log(`Lighthouse: ${performance.lighthouse}/100`);
}

trackPerformance();
```

**Cron Job 설정** (매일 자동 실행):
```bash
# crontab -e
0 2 * * * cd /path/to/project && node scripts/track-performance.js
```

---

### 4.2 여러 페이지 일괄 테스트

```javascript
// scripts/bulk-test.js
const { testPage } = require('../src/page-tester');

const pages = [
  'https://example.com',
  'https://example.com/blog',
  'https://example.com/about',
  'https://example.com/contact'
];

async function bulkTest() {
  console.log(`${pages.length}개 페이지 테스트 시작...\n`);

  const results = [];

  for (const url of pages) {
    console.log(`\n테스트 중: ${url}`);
    const result = await testPage(url, {
      browsers: ['chromium'],
      skipA11y: false
    });

    results.push({
      url,
      passed: result.summary.passed,
      warned: result.summary.warned,
      failed: result.summary.failed,
      issues: result.issues.length
    });
  }

  // 결과 요약
  console.log('\n\n=== 전체 테스트 요약 ===\n');
  results.forEach(r => {
    const status = r.failed > 0 ? '❌' : r.warned > 0 ? '⚠️' : '✅';
    console.log(`${status} ${r.url}`);
    console.log(`   통과: ${r.passed}, 경고: ${r.warned}, 실패: ${r.failed}, 이슈: ${r.issues}`);
  });

  // 전체 통과율
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalTests = results.reduce((sum, r) => sum + r.passed + r.warned + r.failed, 0);
  const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

  console.log(`\n전체 통과율: ${passRate}%`);
}

bulkTest();
```

---

### 4.3 Slack 알림 통합

```javascript
// scripts/test-and-notify.js
const { testPage } = require('../src/page-tester');
const axios = require('axios');

async function testAndNotify(url) {
  const results = await testPage(url);

  // Slack 메시지 포맷
  const color = results.summary.failed > 0 ? 'danger' :
                results.summary.warned > 0 ? 'warning' : 'good';

  const message = {
    attachments: [{
      color,
      title: '페이지 품질 테스트 결과',
      fields: [
        {
          title: 'URL',
          value: url,
          short: false
        },
        {
          title: '통과',
          value: results.summary.passed.toString(),
          short: true
        },
        {
          title: '경고',
          value: results.summary.warned.toString(),
          short: true
        },
        {
          title: '실패',
          value: results.summary.failed.toString(),
          short: true
        },
        {
          title: '이슈',
          value: results.issues.length.toString(),
          short: true
        }
      ],
      footer: 'Page Tester',
      ts: Math.floor(Date.now() / 1000)
    }]
  };

  // 주요 이슈 추가
  if (results.issues.length > 0) {
    const topIssues = results.issues
      .filter(i => i.severity === 'critical' || i.severity === 'major')
      .slice(0, 3)
      .map(i => `• ${i.message}`)
      .join('\n');

    if (topIssues) {
      message.attachments[0].fields.push({
        title: '주요 이슈',
        value: topIssues,
        short: false
      });
    }
  }

  // Slack 전송
  await axios.post(process.env.SLACK_WEBHOOK_URL, message);
  console.log('Slack 알림 전송 완료');
}

testAndNotify(process.argv[2] || 'https://example.com');
```

**GitHub Actions에서 실행**:
```yaml
- name: Test and notify
  run: node scripts/test-and-notify.js https://example.com
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 5. 디버깅 예제

### 5.1 Verbose 모드로 상세 로그 확인

```bash
# 일반 실행
/test-page https://example.com

# Verbose 모드 (디버깅용)
/test-page https://example.com --verbose
```

**Verbose 출력 예시**:
```
[DEBUG] Test Orchestrator 초기화
[DEBUG] 설정 파일 로드: .page-test.config.js
[DEBUG] 등록된 모듈: 9개
[DEBUG] 테스트 계획:
  - 브라우저: chromium, firefox, webkit
  - 모듈: 9개
  - 예상 소요 시간: 3~5분

[INFO] [1/27] browser-compatibility (chromium) 시작...
[DEBUG]   브라우저 시작 중...
[DEBUG]   페이지 로드 중: https://example.com
[DEBUG]   콘솔 에러 수집 중...
[DEBUG]   스크린샷 촬영 중...
[INFO] [1/27] ✅ browser-compatibility (chromium): 통과 (1.2s)

...
```

---

### 5.2 특정 모듈만 실행

```javascript
// scripts/test-single-module.js
const { BrowserCompatibilityModule } = require('../src/page-tester/modules/browser-compatibility');

async function testSingleModule() {
  const module = new BrowserCompatibilityModule();
  const result = await module.run('https://example.com', 'chromium');

  console.log('결과:', result);
  console.log('상세 데이터:', JSON.stringify(result.data, null, 2));
}

testSingleModule();
```

---

## 6. 고급 시나리오

### 6.1 A/B 테스트 변형 비교

```javascript
// scripts/ab-test-compare.js
const { testPage } = require('../src/page-tester');

async function compareVariants() {
  console.log('A/B 테스트 변형 비교 시작...\n');

  // 변형 A (기존)
  const variantA = await testPage('https://example.com?variant=a');

  // 변형 B (새 디자인)
  const variantB = await testPage('https://example.com?variant=b');

  // 비교 리포트
  console.log('=== 비교 결과 ===\n');

  console.log('성능:');
  console.log(`  변형 A LCP: ${variantA.moduleResults.find(m => m.module === 'performance')?.data?.lcp}s`);
  console.log(`  변형 B LCP: ${variantB.moduleResults.find(m => m.module === 'performance')?.data?.lcp}s`);

  console.log('\n접근성:');
  console.log(`  변형 A 위반: ${variantA.issues.filter(i => i.type.includes('a11y')).length}개`);
  console.log(`  변형 B 위반: ${variantB.issues.filter(i => i.type.includes('a11y')).length}개`);

  console.log('\n이미지 최적화:');
  console.log(`  변형 A 이슈: ${variantA.issues.filter(i => i.type.includes('image')).length}개`);
  console.log(`  변형 B 이슈: ${variantB.issues.filter(i => i.type.includes('image')).length}개`);

  // 승자 결정
  const scoreA = variantA.summary.passed - variantA.summary.failed * 2;
  const scoreB = variantB.summary.passed - variantB.summary.failed * 2;

  console.log(`\n종합 점수: 변형 A (${scoreA}점) vs 변형 B (${scoreB}점)`);
  console.log(`추천: 변형 ${scoreA >= scoreB ? 'A' : 'B'}`);
}

compareVariants();
```

---

### 6.2 프로덕션 vs 스테이징 비교

```bash
# 프로덕션과 스테이징 동시 테스트
/test-page https://example.com --browsers chromium > prod-results.txt &
/test-page https://staging.example.com --browsers chromium > staging-results.txt &

wait

# 결과 비교
diff prod-results.txt staging-results.txt
```

---

이 예제들을 통해 다양한 실전 시나리오에서 페이지 테스터를 활용할 수 있습니다. 필요에 따라 커스터마이징하여 사용하세요!
