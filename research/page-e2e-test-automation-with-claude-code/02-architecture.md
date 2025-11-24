# 아키텍처 설계

## 1. 시스템 개요

### 1.1 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                        Claude Code                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Command    │  │    Agent     │  │    Skill     │     │
│  │ /test-page   │  │ page-tester  │  │ page-test    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Test Orchestrator                         │
│                   (TypeScript Core)                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Test Runner Engine                     │    │
│  │  • 테스트 계획 수립                                  │    │
│  │  • 병렬 실행 관리                                    │    │
│  │  • 결과 수집 및 집계                                 │    │
│  └────────────────┬───────────────────────────────────┘    │
│                   │                                          │
│  ┌────────────────┴───────────────────────────────────┐    │
│  │           Test Module Registry                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │ Browser  │ │  Links   │ │    UI    │ ...       │    │
│  │  │  Tests   │ │  Tests   │ │  Tests   │           │    │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘           │    │
│  └───────┼────────────┼────────────┼──────────────────┘    │
└──────────┼────────────┼────────────┼───────────────────────┘
           │            │            │
           ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Playwright                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Chromium   │  │   Firefox    │  │    WebKit    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │            External Integrations                  │      │
│  │  • Axe-core (a11y)                               │      │
│  │  • Lighthouse (Performance/SEO)                  │      │
│  │  • PixelMatch (Visual Regression)                │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Result Reporter                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Console Out  │  │  HTML Report │  │  JSON Report │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │      Optional Integrations                        │      │
│  │  • Notion (결과 저장)                             │      │
│  │  • Slack (알림)                                   │      │
│  │  • GitHub (PR 코멘트)                             │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Claude Code 통합

### 2.1 Commands (슬래시 커맨드)

**파일 위치**: `.claude/commands/test-page.md`

```markdown
# Test Page Command

웹 페이지의 품질을 자동으로 검증합니다.

## Usage

/test-page <url> [options]

## Options

- `--browsers`: 테스트할 브라우저 (기본: chromium,firefox,webkit)
- `--mobile-only`: 모바일 테스트만 수행
- `--skip-a11y`: 접근성 테스트 건너뛰기
- `--skip-seo`: SEO 테스트 건너뛰기
- `--verbose`: 상세 로그 출력

## Examples

```bash
# 기본 테스트
/test-page https://example.com

# 현재 개발 서버 테스트
/test-page http://localhost:4321/blog/my-post

# Chromium만 테스트
/test-page https://example.com --browsers chromium

# 모바일만 테스트
/test-page https://example.com --mobile-only
```

## Implementation

이 커맨드는 page-tester 에이전트를 호출하여 테스트를 실행합니다.
```

**구현 로직**:

```typescript
// .claude/commands/test-page.ts (pseudocode)
export async function executeTestPageCommand(args: string[]) {
  const url = args[0];
  const options = parseOptions(args.slice(1));

  // page-tester 에이전트 호출
  const agent = await loadAgent('page-tester');
  const results = await agent.test({
    url,
    browsers: options.browsers || ['chromium', 'firefox', 'webkit'],
    skipA11y: options.skipA11y || false,
    skipSeo: options.skipSeo || false,
    mobileOnly: options.mobileOnly || false,
    verbose: options.verbose || false
  });

  // 결과 포맷팅 및 출력
  return formatResults(results);
}
```

---

### 2.2 Agents (서브에이전트)

**파일 위치**: `.claude/agents/page-tester.md`

```markdown
# Page Tester Agent

웹 페이지의 모든 품질 항목을 자동으로 검증하는 전문 에이전트입니다.

## 역할

1. 테스트 실행 계획 수립
2. Playwright 테스트 스크립트 실행
3. 결과 분석 및 해석
4. 개선 제안 생성
5. 상세 리포트 작성

## 테스트 항목

- ✅ 크로스 브라우저 호환성
- ✅ 링크 무결성
- ✅ UI/UX 품질
- ✅ 콘텐츠 검증
- ✅ 인터랙션 테스트
- ✅ 이미지 최적화
- ✅ 접근성 (a11y)
- ✅ SEO
- ✅ 모바일 반응형

## 워크플로우

1. **초기화**: 테스트 환경 설정 및 브라우저 시작
2. **계획 수립**: 테스트 항목 우선순위 결정
3. **테스트 실행**: 각 모듈별 병렬 실행
4. **결과 수집**: 모든 테스트 결과 집계
5. **분석**: Claude를 사용한 결과 분석 및 인사이트 도출
6. **리포트**: HTML/JSON 리포트 생성 및 콘솔 출력

## 도구 사용

- **Playwright MCP**: 브라우저 자동화
- **Chrome DevTools MCP**: 성능 분석
- **파일 시스템**: 리포트 저장
- **Bash**: Lighthouse 실행

## 출력 형식

### 콘솔 출력
```
🔍 페이지 테스트 시작: https://example.com

[1/9] ✅ 크로스 브라우저 테스트 (3/3 통과)
[2/9] ✅ 링크 무결성 (28/28 정상)
[3/9] ⚠️  이미지 최적화 (2개 문제 발견)
[4/9] ✅ 접근성 (WCAG AA 통과)
[5/9] ✅ SEO (95/100점)
[6/9] ⚠️  성능 (LCP 2.8s)
[7/9] ✅ UI/UX (모든 브레이크포인트 정상)
[8/9] ✅ 인터랙션 (모든 이벤트 정상)
[9/9] ✅ 모바일 반응형 (가로 스크롤 없음)

📊 총 9개 카테고리, 7개 통과, 2개 개선 필요

⚠️  개선이 필요한 항목:
  1. hero-image.jpg: 원본 이미지가 4배 더 큽니다 (2400x1600 → 600x400)
  2. LCP 2.8s (권장: 2.5s 이하)

💡 개선 제안:
  • 이미지 리사이징: hero-image.jpg를 800x533px로 변환 후 WebP 포맷 사용
  • LCP 개선: 히어로 이미지에 fetchpriority="high" 속성 추가
  • 폰트 최적화: 폰트 프리로드 추가 고려

📄 상세 리포트: ./test-results/report-2025-11-21-143022.html
```

### JSON 출력
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
  "results": { /* 상세 결과 */ },
  "recommendations": [ /* 개선 제안 */ ]
}
```

## 설정

`.page-test.config.js` 파일로 커스터마이징 가능:

```javascript
module.exports = {
  browsers: ['chromium', 'firefox', 'webkit'],
  viewports: [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ],
  thresholds: {
    performance: 90,
    accessibility: 95,
    seo: 90
  },
  skipTests: [],
  customRules: []
};
```
```

---

### 2.3 Skills (재사용 가능 기능)

**파일 위치**: `.claude/skills/page-test.md`

```markdown
# Page Test Skill

페이지 테스트 로직을 캡슐화한 재사용 가능한 스킬입니다.

## 제공 기능

### 1. 브라우저 테스트
- `testBrowser(url, browserType)`: 특정 브라우저에서 페이지 로드
- `compareBrowsers(url)`: 브라우저 간 스크린샷 비교

### 2. 링크 검증
- `checkLinks(page)`: 페이지의 모든 링크 검증
- `checkExternalLinks(page)`: 외부 링크 접근성 검사

### 3. 이미지 분석
- `analyzeImages(page)`: 이미지 최적화 검증
- `checkImageAlt(page)`: Alt 텍스트 검증

### 4. 접근성 검증
- `runA11yAudit(page)`: Axe-core 감사 실행
- `checkKeyboardNav(page)`: 키보드 네비게이션 테스트

### 5. 성능 분석
- `runLighthouse(url)`: Lighthouse 감사 실행
- `measureCoreWebVitals(page)`: Core Web Vitals 측정

## 사용 예시

```typescript
import {
  testBrowser,
  checkLinks,
  analyzeImages,
  runA11yAudit
} from '.claude/skills/page-test';

async function testPage(url: string) {
  // 브라우저 테스트
  const browserResults = await testBrowser(url, 'chromium');

  // 링크 검증
  const linkResults = await checkLinks(browserResults.page);

  // 이미지 분석
  const imageResults = await analyzeImages(browserResults.page);

  // 접근성 검증
  const a11yResults = await runA11yAudit(browserResults.page);

  return {
    browser: browserResults,
    links: linkResults,
    images: imageResults,
    a11y: a11yResults
  };
}
```
```

---

## 3. 핵심 컴포넌트 설계

### 3.1 Test Orchestrator

**역할**: 전체 테스트 실행 흐름 관리

```typescript
// src/test-orchestrator/index.ts
export class TestOrchestrator {
  private config: TestConfig;
  private registry: TestModuleRegistry;
  private reporter: ResultReporter;

  constructor(config: TestConfig) {
    this.config = config;
    this.registry = new TestModuleRegistry();
    this.reporter = new ResultReporter();
  }

  /**
   * 메인 테스트 실행 함수
   */
  async runTests(url: string, options: TestOptions): Promise<TestResults> {
    console.log(`🔍 페이지 테스트 시작: ${url}\n`);

    // 1. 테스트 계획 수립
    const plan = this.createTestPlan(options);

    // 2. 병렬 실행
    const results = await this.executeTestPlan(plan, url);

    // 3. 결과 집계
    const summary = this.summarizeResults(results);

    // 4. 리포트 생성
    await this.reporter.generate(summary);

    return summary;
  }

  /**
   * 테스트 계획 수립
   */
  private createTestPlan(options: TestOptions): TestPlan {
    const modules = this.registry.getModules();

    // 옵션에 따라 필터링
    const filteredModules = modules.filter(module => {
      if (options.skipA11y && module.name === 'accessibility') return false;
      if (options.skipSeo && module.name === 'seo') return false;
      if (options.mobileOnly && !module.supportsMobile) return false;
      return true;
    });

    return {
      modules: filteredModules,
      browsers: options.browsers || ['chromium', 'firefox', 'webkit'],
      parallel: true
    };
  }

  /**
   * 테스트 계획 실행 (병렬)
   */
  private async executeTestPlan(
    plan: TestPlan,
    url: string
  ): Promise<ModuleResult[]> {
    const tasks: Promise<ModuleResult>[] = [];

    for (const module of plan.modules) {
      for (const browser of plan.browsers) {
        const task = this.runModule(module, url, browser);
        tasks.push(task);
      }
    }

    // 병렬 실행
    const results = await Promise.allSettled(tasks);

    return results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<ModuleResult>).value);
  }

  /**
   * 개별 모듈 실행
   */
  private async runModule(
    module: TestModule,
    url: string,
    browser: BrowserType
  ): Promise<ModuleResult> {
    const startTime = Date.now();

    try {
      const result = await module.run(url, browser);
      const duration = Date.now() - startTime;

      console.log(this.formatModuleResult(module.name, result));

      return {
        module: module.name,
        browser,
        status: result.status,
        duration,
        data: result.data,
        issues: result.issues
      };
    } catch (error) {
      console.error(`❌ ${module.name} 실패:`, error);
      return {
        module: module.name,
        browser,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * 모듈 결과 포맷팅
   */
  private formatModuleResult(
    moduleName: string,
    result: TestResult
  ): string {
    const emoji = result.status === 'passed' ? '✅' :
                  result.status === 'warned' ? '⚠️' : '❌';

    return `${emoji} ${moduleName}: ${result.message}`;
  }

  /**
   * 결과 요약
   */
  private summarizeResults(results: ModuleResult[]): TestSummary {
    const passed = results.filter(r => r.status === 'passed').length;
    const warned = results.filter(r => r.status === 'warned').length;
    const failed = results.filter(r => r.status === 'failed').length;

    // 모든 이슈 수집
    const allIssues = results.flatMap(r => r.issues || []);

    return {
      total: results.length,
      passed,
      warned,
      failed,
      results,
      issues: allIssues,
      recommendations: this.generateRecommendations(allIssues)
    };
  }

  /**
   * AI 기반 개선 제안 생성
   */
  private generateRecommendations(issues: Issue[]): Recommendation[] {
    // Claude를 사용하여 이슈 분석 및 개선 제안 생성
    // 여기서는 간단한 룰 기반 추천
    return issues.map(issue => ({
      issue: issue.message,
      suggestion: this.getSuggestion(issue.type),
      priority: issue.severity
    }));
  }
}
```

---

### 3.2 Test Module Registry

**역할**: 테스트 모듈 등록 및 관리

```typescript
// src/test-orchestrator/registry.ts
export class TestModuleRegistry {
  private modules: Map<string, TestModule> = new Map();

  constructor() {
    this.registerDefaultModules();
  }

  /**
   * 기본 테스트 모듈 등록
   */
  private registerDefaultModules() {
    this.register(new BrowserCompatibilityModule());
    this.register(new LinkIntegrityModule());
    this.register(new UIQualityModule());
    this.register(new ContentQualityModule());
    this.register(new InteractionModule());
    this.register(new ImageOptimizationModule());
    this.register(new AccessibilityModule());
    this.register(new SEOModule());
    this.register(new MobileResponsiveModule());
  }

  /**
   * 모듈 등록
   */
  register(module: TestModule) {
    this.modules.set(module.name, module);
  }

  /**
   * 모듈 조회
   */
  get(name: string): TestModule | undefined {
    return this.modules.get(name);
  }

  /**
   * 모든 모듈 반환
   */
  getModules(): TestModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * 커스텀 모듈 로드 (설정 파일에서)
   */
  async loadCustomModules(configPath: string) {
    const config = await import(configPath);
    if (config.customModules) {
      for (const CustomModule of config.customModules) {
        this.register(new CustomModule());
      }
    }
  }
}
```

---

### 3.3 Test Module 인터페이스

**역할**: 모든 테스트 모듈의 공통 인터페이스

```typescript
// src/test-modules/base.ts
export interface TestModule {
  /** 모듈 이름 */
  name: string;

  /** 모듈 설명 */
  description: string;

  /** 우선순위 (낮을수록 먼저 실행) */
  priority: number;

  /** 모바일 지원 여부 */
  supportsMobile: boolean;

  /**
   * 테스트 실행
   */
  run(url: string, browser: BrowserType): Promise<TestResult>;

  /**
   * 설정 검증
   */
  validateConfig?(config: any): boolean;
}

export interface TestResult {
  /** 테스트 상태 */
  status: 'passed' | 'warned' | 'failed';

  /** 결과 메시지 */
  message: string;

  /** 상세 데이터 */
  data?: any;

  /** 발견된 이슈 */
  issues?: Issue[];
}

export interface Issue {
  /** 이슈 타입 */
  type: string;

  /** 심각도 */
  severity: 'critical' | 'major' | 'minor';

  /** 이슈 메시지 */
  message: string;

  /** 이슈 위치 (URL, 선택자 등) */
  location?: string;

  /** 예상 값 */
  expected?: any;

  /** 실제 값 */
  actual?: any;
}
```

---

### 3.4 예시: Image Optimization Module

```typescript
// src/test-modules/image-optimization.ts
import { TestModule, TestResult, Issue } from './base';
import { Page } from 'playwright';

export class ImageOptimizationModule implements TestModule {
  name = 'image-optimization';
  description = '이미지 최적화 검증';
  priority = 60;
  supportsMobile = true;

  async run(url: string, browser: BrowserType): Promise<TestResult> {
    const browserInstance = await playwright[browser].launch();
    const page = await browserInstance.newPage();

    try {
      await page.goto(url);

      // 이미지 분석
      const images = await this.analyzeImages(page);

      // 이슈 탐지
      const issues = this.detectIssues(images);

      await browserInstance.close();

      return {
        status: issues.length === 0 ? 'passed' : 'warned',
        message: `${images.length}개 이미지 검사, ${issues.length}개 문제 발견`,
        data: { images },
        issues
      };
    } catch (error) {
      await browserInstance.close();
      throw error;
    }
  }

  private async analyzeImages(page: Page) {
    return await page.$$eval('img', imgs =>
      imgs.map(img => {
        const rect = img.getBoundingClientRect();
        return {
          src: img.src,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          renderedWidth: rect.width,
          renderedHeight: rect.height,
          loading: img.loading,
          format: img.src.split('.').pop()?.split('?')[0]
        };
      })
    );
  }

  private detectIssues(images: any[]): Issue[] {
    const issues: Issue[] = [];

    for (const img of images) {
      // Alt 텍스트 체크
      if (!img.alt) {
        issues.push({
          type: 'missing-alt',
          severity: 'major',
          message: `이미지에 alt 텍스트가 없습니다`,
          location: img.src
        });
      }

      // 사이즈 체크
      const widthRatio = img.naturalWidth / img.renderedWidth;
      const heightRatio = img.naturalHeight / img.renderedHeight;
      const maxRatio = Math.max(widthRatio, heightRatio);

      if (maxRatio > 2) {
        issues.push({
          type: 'oversized-image',
          severity: maxRatio > 4 ? 'major' : 'minor',
          message: `원본 이미지가 ${Math.round(maxRatio)}배 더 큽니다`,
          location: img.src,
          expected: `${Math.round(img.renderedWidth)}x${Math.round(img.renderedHeight)}`,
          actual: `${img.naturalWidth}x${img.naturalHeight}`
        });
      }

      // 포맷 체크
      if (!['webp', 'avif'].includes(img.format || '')) {
        issues.push({
          type: 'format-optimization',
          severity: 'minor',
          message: 'WebP 또는 AVIF 포맷 사용을 권장합니다',
          location: img.src,
          actual: img.format
        });
      }
    }

    return issues;
  }
}
```

---

## 4. 데이터 흐름

### 4.1 실행 흐름

```
1. 사용자 → Claude Code
   /test-page https://example.com

2. Claude Code → Test Orchestrator
   { url, options }

3. Test Orchestrator → Test Modules (병렬)
   ┌─ BrowserModule
   ├─ LinkModule
   ├─ ImageModule
   ├─ A11yModule
   └─ SEOModule

4. Test Modules → Playwright
   브라우저 자동화 실행

5. Playwright → 테스트 대상 웹페이지
   페이지 로드, 스크립트 실행

6. Test Modules → Test Orchestrator
   결과 수집

7. Test Orchestrator → Result Reporter
   리포트 생성

8. Result Reporter → 사용자
   콘솔 출력 + HTML 리포트
```

### 4.2 데이터 구조

```typescript
// 테스트 설정
interface TestConfig {
  url: string;
  browsers: BrowserType[];
  viewports: Viewport[];
  thresholds: {
    performance: number;
    accessibility: number;
    seo: number;
  };
  skipTests: string[];
  customRules: CustomRule[];
}

// 테스트 결과
interface TestResults {
  url: string;
  timestamp: string;
  duration: number;
  summary: {
    total: number;
    passed: number;
    warned: number;
    failed: number;
  };
  moduleResults: ModuleResult[];
  issues: Issue[];
  recommendations: Recommendation[];
}

// 개선 제안
interface Recommendation {
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  code?: string; // 수정 코드 예시
}
```

---

## 5. 확장 포인트

### 5.1 커스텀 테스트 모듈 추가

```typescript
// .page-test.config.js
const { TestModule } = require('./node_modules/page-tester');

class CustomSecurityModule extends TestModule {
  name = 'custom-security';
  description = '보안 취약점 검사';
  priority = 100;

  async run(url, browser) {
    // 커스텀 로직
    return {
      status: 'passed',
      message: '보안 검사 완료'
    };
  }
}

module.exports = {
  customModules: [CustomSecurityModule]
};
```

### 5.2 커스텀 리포터 추가

```typescript
// custom-reporter.ts
import { ResultReporter } from './src/reporters/base';

export class SlackReporter extends ResultReporter {
  async generate(results: TestResults) {
    // Slack 웹훅으로 결과 전송
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(this.formatForSlack(results))
    });
  }
}
```

### 5.3 AI 분석 통합

```typescript
// Claude를 사용한 결과 분석
async function analyzeWithClaude(results: TestResults): Promise<string> {
  const prompt = `
다음 페이지 테스트 결과를 분석하고 개선 제안을 해주세요:

${JSON.stringify(results, null, 2)}

주요 문제점과 우선순위별 개선 방안을 제시해주세요.
  `;

  // Claude API 호출
  const analysis = await callClaudeAPI(prompt);
  return analysis;
}
```

---

## 6. 성능 최적화

### 6.1 병렬 실행

- 브라우저별 독립 실행
- 테스트 모듈 간 의존성 없이 병렬 실행
- Worker 스레드 활용

### 6.2 캐싱

```typescript
// 외부 링크 검증 결과 캐싱 (1시간)
const linkCache = new Map<string, { status: number, timestamp: number }>();

async function checkExternalLink(url: string): Promise<number> {
  const cached = linkCache.get(url);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.status;
  }

  const status = await fetchStatus(url);
  linkCache.set(url, { status, timestamp: Date.now() });
  return status;
}
```

### 6.3 리소스 제한

```typescript
// 동시 브라우저 인스턴스 제한
const MAX_CONCURRENT_BROWSERS = 3;
const browserPool = new BrowserPool(MAX_CONCURRENT_BROWSERS);

// 메모리 사용 모니터링
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('브라우저 인스턴스를 정리합니다...');
    browserPool.cleanup();
  }
});
```

---

**다음 단계**: [구현 계획](./03-implementation-plan.md)
