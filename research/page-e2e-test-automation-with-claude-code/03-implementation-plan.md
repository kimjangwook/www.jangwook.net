# 구현 계획

## 1. 개발 단계

### Phase 1: MVP (P0 기능) - 2주

**목표**: 핵심 기능 구현 및 기본 동작 검증

#### Week 1: 기반 구조
- [ ] 프로젝트 초기화 및 의존성 설치
- [ ] Test Orchestrator 골격 구현
- [ ] Test Module 인터페이스 정의
- [ ] Playwright 통합
- [ ] 콘솔 리포터 구현

#### Week 2: 핵심 테스트 모듈
- [ ] BrowserCompatibilityModule
- [ ] LinkIntegrityModule
- [ ] AccessibilityModule (Axe-core 통합)
- [ ] ImageOptimizationModule
- [ ] Claude Code 통합 (커맨드)

**완료 기준**:
- `/test-page` 커맨드 동작
- 5개 핵심 모듈 실행
- 콘솔에 결과 출력

---

### Phase 2: 확장 기능 (P1 기능) - 2주

**목표**: 추가 테스트 항목 및 리포팅 강화

#### Week 3: 추가 테스트 모듈
- [ ] UIQualityModule
- [ ] InteractionModule
- [ ] MobileResponsiveModule
- [ ] SEOModule (Lighthouse 통합)
- [ ] ContentQualityModule

#### Week 4: 리포팅 및 개선
- [ ] HTML 리포트 생성
- [ ] JSON 결과 내보내기
- [ ] AI 분석 통합 (Claude)
- [ ] 개선 제안 자동 생성
- [ ] 에이전트 구현

**완료 기준**:
- 9개 전체 모듈 동작
- HTML 리포트 생성
- AI 개선 제안 제공

---

### Phase 3: 최적화 및 통합 (P2 기능) - 1주

**목표**: 성능 최적화, CI/CD 통합, 고급 기능

#### Week 5: 최적화 및 확장
- [ ] 병렬 실행 최적화
- [ ] 캐싱 구현
- [ ] 시각적 회귀 테스트
- [ ] CI/CD 통합 (GitHub Actions)
- [ ] Notion/Slack 통합
- [ ] 설정 파일 지원
- [ ] 문서화

**완료 기준**:
- 테스트 실행 시간 5분 이내
- CI/CD 파이프라인 동작
- 완전한 문서 제공

---

## 2. 파일 구조

```
.claude/
├── commands/
│   └── test-page.md              # /test-page 슬래시 커맨드
├── agents/
│   └── page-tester.md            # 페이지 테스터 에이전트
└── skills/
    └── page-test.md              # 재사용 가능한 스킬

src/
├── page-tester/
│   ├── index.ts                  # 메인 엔트리 포인트
│   ├── orchestrator/
│   │   ├── test-orchestrator.ts  # 테스트 오케스트레이터
│   │   ├── registry.ts           # 모듈 레지스트리
│   │   └── config.ts             # 설정 관리
│   ├── modules/
│   │   ├── base.ts               # TestModule 인터페이스
│   │   ├── browser-compatibility.ts
│   │   ├── link-integrity.ts
│   │   ├── ui-quality.ts
│   │   ├── content-quality.ts
│   │   ├── interaction.ts
│   │   ├── image-optimization.ts
│   │   ├── accessibility.ts
│   │   ├── seo.ts
│   │   └── mobile-responsive.ts
│   ├── reporters/
│   │   ├── base.ts               # Reporter 인터페이스
│   │   ├── console-reporter.ts   # 콘솔 출력
│   │   ├── html-reporter.ts      # HTML 리포트
│   │   ├── json-reporter.ts      # JSON 출력
│   │   ├── notion-reporter.ts    # Notion 통합
│   │   └── slack-reporter.ts     # Slack 통합
│   ├── analyzers/
│   │   ├── claude-analyzer.ts    # Claude 결과 분석
│   │   └── recommendation-engine.ts
│   ├── utils/
│   │   ├── browser-pool.ts       # 브라우저 풀 관리
│   │   ├── cache.ts              # 캐싱 유틸리티
│   │   ├── logger.ts             # 로깅
│   │   └── helpers.ts            # 헬퍼 함수
│   └── types/
│       ├── config.ts             # 설정 타입
│       ├── results.ts            # 결과 타입
│       └── modules.ts            # 모듈 타입

test-results/                     # 테스트 결과 저장
├── report-2025-11-21-143022.html
├── report-2025-11-21-143022.json
└── screenshots/

.page-test.config.js              # 프로젝트별 설정 파일

package.json
tsconfig.json
```

---

## 3. 주요 파일 구현

### 3.1 메인 엔트리 포인트

```typescript
// src/page-tester/index.ts
import { TestOrchestrator } from './orchestrator/test-orchestrator';
import { loadConfig } from './orchestrator/config';
import type { TestOptions, TestResults } from './types';

/**
 * 메인 테스트 함수
 */
export async function testPage(
  url: string,
  options: Partial<TestOptions> = {}
): Promise<TestResults> {
  // 설정 로드
  const config = await loadConfig();

  // 옵션 병합
  const mergedOptions: TestOptions = {
    browsers: options.browsers || config.browsers || ['chromium', 'firefox', 'webkit'],
    skipA11y: options.skipA11y || false,
    skipSeo: options.skipSeo || false,
    mobileOnly: options.mobileOnly || false,
    verbose: options.verbose || false,
    outputDir: options.outputDir || './test-results',
    ...options
  };

  // 오케스트레이터 생성 및 실행
  const orchestrator = new TestOrchestrator(config);
  const results = await orchestrator.runTests(url, mergedOptions);

  return results;
}

/**
 * CLI 실행
 */
export async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: page-tester <url> [options]');
    process.exit(1);
  }

  const url = args[0];
  const options = parseCliOptions(args.slice(1));

  try {
    const results = await testPage(url, options);
    process.exit(results.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('테스트 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

function parseCliOptions(args: string[]): Partial<TestOptions> {
  const options: Partial<TestOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--browsers' && args[i + 1]) {
      options.browsers = args[++i].split(',') as BrowserType[];
    } else if (arg === '--mobile-only') {
      options.mobileOnly = true;
    } else if (arg === '--skip-a11y') {
      options.skipA11y = true;
    } else if (arg === '--skip-seo') {
      options.skipSeo = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--output-dir' && args[i + 1]) {
      options.outputDir = args[++i];
    }
  }

  return options;
}

// CLI로 실행된 경우
if (require.main === module) {
  main();
}
```

---

### 3.2 Test Orchestrator

```typescript
// src/page-tester/orchestrator/test-orchestrator.ts
import { TestModuleRegistry } from './registry';
import { ConsoleReporter } from '../reporters/console-reporter';
import { HTMLReporter } from '../reporters/html-reporter';
import { JSONReporter } from '../reporters/json-reporter';
import { ClaudeAnalyzer } from '../analyzers/claude-analyzer';
import type {
  TestConfig,
  TestOptions,
  TestResults,
  ModuleResult
} from '../types';

export class TestOrchestrator {
  private config: TestConfig;
  private registry: TestModuleRegistry;
  private consoleReporter: ConsoleReporter;
  private htmlReporter: HTMLReporter;
  private jsonReporter: JSONReporter;
  private claudeAnalyzer: ClaudeAnalyzer;

  constructor(config: TestConfig) {
    this.config = config;
    this.registry = new TestModuleRegistry();
    this.consoleReporter = new ConsoleReporter();
    this.htmlReporter = new HTMLReporter();
    this.jsonReporter = new JSONReporter();
    this.claudeAnalyzer = new ClaudeAnalyzer();
  }

  async runTests(url: string, options: TestOptions): Promise<TestResults> {
    const startTime = Date.now();

    // 시작 메시지
    this.consoleReporter.printHeader(url);

    // 테스트 계획 수립
    const modules = this.selectModules(options);

    // 병렬 실행
    const results: ModuleResult[] = [];
    let completed = 0;

    for (const module of modules) {
      for (const browser of options.browsers) {
        try {
          const result = await module.run(url, browser);
          results.push({
            module: module.name,
            browser,
            ...result
          });

          completed++;
          this.consoleReporter.printProgress(
            completed,
            modules.length * options.browsers.length,
            module.name,
            result
          );
        } catch (error) {
          console.error(`❌ ${module.name} (${browser}) 실패:`, error);
          results.push({
            module: module.name,
            browser,
            status: 'failed',
            message: error.message,
            duration: 0
          });
        }
      }
    }

    // 결과 집계
    const summary = this.summarizeResults(results);

    // Claude 분석
    const analysis = await this.claudeAnalyzer.analyze(summary);

    // 최종 결과
    const testResults: TestResults = {
      url,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        warned: results.filter(r => r.status === 'warned').length,
        failed: results.filter(r => r.status === 'failed').length
      },
      moduleResults: results,
      issues: this.collectIssues(results),
      recommendations: analysis.recommendations
    };

    // 리포트 생성
    await this.generateReports(testResults, options);

    // 요약 출력
    this.consoleReporter.printSummary(testResults);

    return testResults;
  }

  private selectModules(options: TestOptions) {
    let modules = this.registry.getModules();

    // 필터링
    if (options.skipA11y) {
      modules = modules.filter(m => m.name !== 'accessibility');
    }
    if (options.skipSeo) {
      modules = modules.filter(m => m.name !== 'seo');
    }
    if (options.mobileOnly) {
      modules = modules.filter(m => m.supportsMobile);
    }

    // 우선순위 정렬
    return modules.sort((a, b) => a.priority - b.priority);
  }

  private summarizeResults(results: ModuleResult[]) {
    // 브라우저별 결과 그룹핑
    const byBrowser = new Map<string, ModuleResult[]>();

    for (const result of results) {
      if (!byBrowser.has(result.browser)) {
        byBrowser.set(result.browser, []);
      }
      byBrowser.get(result.browser)!.push(result);
    }

    return {
      results,
      byBrowser: Object.fromEntries(byBrowser)
    };
  }

  private collectIssues(results: ModuleResult[]) {
    return results.flatMap(r => r.issues || []);
  }

  private async generateReports(
    results: TestResults,
    options: TestOptions
  ) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = options.outputDir || './test-results';

    // HTML 리포트
    const htmlPath = `${outputDir}/report-${timestamp}.html`;
    await this.htmlReporter.generate(results, htmlPath);
    console.log(`\n📄 HTML 리포트: ${htmlPath}`);

    // JSON 리포트
    const jsonPath = `${outputDir}/report-${timestamp}.json`;
    await this.jsonReporter.generate(results, jsonPath);
    console.log(`📄 JSON 리포트: ${jsonPath}`);
  }
}
```

---

### 3.3 예시 테스트 모듈 (Browser Compatibility)

```typescript
// src/page-tester/modules/browser-compatibility.ts
import { chromium, firefox, webkit } from 'playwright';
import type { TestModule, TestResult, BrowserType } from '../types';

export class BrowserCompatibilityModule implements TestModule {
  name = 'browser-compatibility';
  description = '크로스 브라우저 호환성 검증';
  priority = 10;
  supportsMobile = true;

  async run(url: string, browserType: BrowserType): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // 브라우저 시작
      const browser = await this.launchBrowser(browserType);
      const page = await browser.newPage();

      // 콘솔 에러 수집
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // 페이지 로드
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response || !response.ok()) {
        throw new Error(`페이지 로드 실패: ${response?.status()}`);
      }

      // 레이아웃 메트릭 수집
      const metrics = await page.evaluate(() => {
        return {
          documentHeight: document.documentElement.scrollHeight,
          bodyHeight: document.body.scrollHeight,
          viewportHeight: window.innerHeight,
          viewportWidth: window.innerWidth
        };
      });

      // 스크린샷
      await page.screenshot({
        path: `./test-results/screenshots/${browserType}-desktop.png`,
        fullPage: false
      });

      await browser.close();

      // 결과 판정
      const issues = [];

      if (consoleErrors.length > 0) {
        issues.push({
          type: 'console-error',
          severity: 'major',
          message: `${consoleErrors.length}개의 콘솔 에러 발견`,
          location: url,
          actual: consoleErrors
        });
      }

      return {
        status: issues.length === 0 ? 'passed' : 'warned',
        message: `${browserType} 테스트 완료 (${consoleErrors.length}개 에러)`,
        duration: Date.now() - startTime,
        data: { metrics, consoleErrors },
        issues
      };
    } catch (error) {
      return {
        status: 'failed',
        message: `${browserType} 테스트 실패: ${error.message}`,
        duration: Date.now() - startTime,
        issues: [{
          type: 'browser-error',
          severity: 'critical',
          message: error.message,
          location: url
        }]
      };
    }
  }

  private async launchBrowser(type: BrowserType) {
    switch (type) {
      case 'chromium':
        return await chromium.launch({ headless: true });
      case 'firefox':
        return await firefox.launch({ headless: true });
      case 'webkit':
        return await webkit.launch({ headless: true });
      default:
        throw new Error(`지원하지 않는 브라우저: ${type}`);
    }
  }
}
```

---

### 3.4 콘솔 리포터

```typescript
// src/page-tester/reporters/console-reporter.ts
import chalk from 'chalk';
import type { TestResults, TestResult } from '../types';

export class ConsoleReporter {
  printHeader(url: string) {
    console.log('\n' + chalk.blue('🔍 페이지 테스트 시작:'), chalk.cyan(url));
    console.log(chalk.gray('─'.repeat(60)) + '\n');
  }

  printProgress(
    current: number,
    total: number,
    moduleName: string,
    result: TestResult
  ) {
    const emoji = result.status === 'passed' ? '✅' :
                  result.status === 'warned' ? '⚠️' : '❌';

    const prefix = chalk.gray(`[${current}/${total}]`);
    const name = chalk.bold(moduleName);
    const message = result.message;

    console.log(`${prefix} ${emoji} ${name}: ${message}`);
  }

  printSummary(results: TestResults) {
    console.log('\n' + chalk.gray('─'.repeat(60)));
    console.log(
      chalk.bold('\n📊 총 ') +
      chalk.cyan(`${results.summary.total}개`) +
      chalk.bold(' 카테고리, ') +
      chalk.green(`${results.summary.passed}개`) +
      chalk.bold(' 통과, ') +
      chalk.yellow(`${results.summary.warned}개`) +
      chalk.bold(' 개선 필요')
    );

    if (results.summary.failed > 0) {
      console.log(chalk.red(`   ${results.summary.failed}개 실패`));
    }

    // 주요 이슈 출력
    if (results.issues.length > 0) {
      console.log(chalk.yellow('\n⚠️  개선이 필요한 항목:'));

      const criticalIssues = results.issues.filter(i => i.severity === 'critical');
      const majorIssues = results.issues.filter(i => i.severity === 'major');

      if (criticalIssues.length > 0) {
        console.log(chalk.red('\n  🚨 심각:'));
        criticalIssues.slice(0, 3).forEach((issue, i) => {
          console.log(chalk.red(`    ${i + 1}. ${issue.message}`));
          if (issue.location) {
            console.log(chalk.gray(`       위치: ${issue.location}`));
          }
        });
      }

      if (majorIssues.length > 0) {
        console.log(chalk.yellow('\n  ⚠️  중요:'));
        majorIssues.slice(0, 3).forEach((issue, i) => {
          console.log(chalk.yellow(`    ${i + 1}. ${issue.message}`));
          if (issue.location) {
            console.log(chalk.gray(`       위치: ${issue.location}`));
          }
        });
      }

      if (results.issues.length > 6) {
        console.log(chalk.gray(`\n  ... 외 ${results.issues.length - 6}개 항목`));
      }
    }

    // 개선 제안
    if (results.recommendations.length > 0) {
      console.log(chalk.blue('\n💡 개선 제안:'));
      results.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(chalk.blue(`  ${i + 1}. ${rec.suggestion}`));
      });
    }

    console.log(chalk.gray('\n─'.repeat(60)));
    console.log(chalk.gray(`⏱  실행 시간: ${(results.duration / 1000).toFixed(2)}초\n`));
  }
}
```

---

### 3.5 HTML 리포터

```typescript
// src/page-tester/reporters/html-reporter.ts
import fs from 'fs/promises';
import path from 'path';
import type { TestResults } from '../types';

export class HTMLReporter {
  async generate(results: TestResults, outputPath: string) {
    const html = this.generateHTML(results);

    // 디렉토리 생성
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // 파일 쓰기
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  private generateHTML(results: TestResults): string {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 테스트 리포트 - ${new Date(results.timestamp).toLocaleString('ko-KR')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    h1 { color: #2563eb; margin-bottom: 10px; }
    .meta { color: #666; font-size: 14px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 { font-size: 14px; color: #666; margin-bottom: 10px; }
    .summary-card .value { font-size: 32px; font-weight: bold; }
    .passed { color: #10b981; }
    .warned { color: #f59e0b; }
    .failed { color: #ef4444; }
    .results {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .module-result {
      border-left: 4px solid #e5e7eb;
      padding: 15px;
      margin-bottom: 15px;
      background: #f9fafb;
    }
    .module-result.passed { border-left-color: #10b981; }
    .module-result.warned { border-left-color: #f59e0b; }
    .module-result.failed { border-left-color: #ef4444; }
    .module-name { font-weight: bold; margin-bottom: 5px; }
    .module-message { color: #666; }
    .issues {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .issue {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      border-left: 4px solid;
    }
    .issue.critical { background: #fef2f2; border-left-color: #ef4444; }
    .issue.major { background: #fffbeb; border-left-color: #f59e0b; }
    .issue.minor { background: #f0f9ff; border-left-color: #3b82f6; }
    .recommendations {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .recommendation {
      padding: 15px;
      background: #f0f9ff;
      border-radius: 4px;
      margin-bottom: 10px;
      border-left: 4px solid #3b82f6;
    }
  </style>
</head>
<body>
  <header>
    <h1>페이지 테스트 리포트</h1>
    <div class="meta">
      <div>URL: <strong>${results.url}</strong></div>
      <div>실행 시간: ${new Date(results.timestamp).toLocaleString('ko-KR')}</div>
      <div>소요 시간: ${(results.duration / 1000).toFixed(2)}초</div>
    </div>
  </header>

  <div class="summary">
    <div class="summary-card">
      <h3>총 테스트</h3>
      <div class="value">${results.summary.total}</div>
    </div>
    <div class="summary-card">
      <h3>통과</h3>
      <div class="value passed">${results.summary.passed}</div>
    </div>
    <div class="summary-card">
      <h3>개선 필요</h3>
      <div class="value warned">${results.summary.warned}</div>
    </div>
    <div class="summary-card">
      <h3>실패</h3>
      <div class="value failed">${results.summary.failed}</div>
    </div>
  </div>

  <div class="results">
    <h2>테스트 결과</h2>
    ${results.moduleResults.map(r => `
      <div class="module-result ${r.status}">
        <div class="module-name">${r.module} (${r.browser})</div>
        <div class="module-message">${r.message}</div>
      </div>
    `).join('')}
  </div>

  ${results.issues.length > 0 ? `
    <div class="issues">
      <h2>발견된 이슈</h2>
      ${results.issues.map(issue => `
        <div class="issue ${issue.severity}">
          <strong>${issue.message}</strong>
          ${issue.location ? `<div>위치: ${issue.location}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${results.recommendations.length > 0 ? `
    <div class="recommendations">
      <h2>개선 제안</h2>
      ${results.recommendations.map(rec => `
        <div class="recommendation">
          <strong>${rec.suggestion}</strong>
        </div>
      `).join('')}
    </div>
  ` : ''}
</body>
</html>
    `.trim();
  }
}
```

---

## 4. 의존성 설치

### 4.1 package.json

```json
{
  "name": "page-tester",
  "version": "1.0.0",
  "description": "웹 페이지 품질 자동 테스트 도구",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "dev": "ts-node src/page-tester/index.ts",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "playwright": "^1.40.0",
    "axe-core": "^4.8.0",
    "axe-playwright": "^2.0.0",
    "lighthouse": "^11.4.0",
    "chalk": "^5.3.0",
    "commander": "^11.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.55.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
```

---

## 5. 타입 정의

```typescript
// src/page-tester/types/index.ts
export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export interface TestConfig {
  browsers: BrowserType[];
  viewports: Viewport[];
  thresholds: {
    performance: number;
    accessibility: number;
    seo: number;
  };
  skipTests: string[];
  customModules?: any[];
}

export interface TestOptions {
  browsers: BrowserType[];
  skipA11y: boolean;
  skipSeo: boolean;
  mobileOnly: boolean;
  verbose: boolean;
  outputDir: string;
}

export interface TestModule {
  name: string;
  description: string;
  priority: number;
  supportsMobile: boolean;
  run(url: string, browser: BrowserType): Promise<TestResult>;
}

export interface TestResult {
  status: 'passed' | 'warned' | 'failed';
  message: string;
  duration?: number;
  data?: any;
  issues?: Issue[];
}

export interface ModuleResult extends TestResult {
  module: string;
  browser: BrowserType;
}

export interface Issue {
  type: string;
  severity: 'critical' | 'major' | 'minor';
  message: string;
  location?: string;
  expected?: any;
  actual?: any;
}

export interface TestResults {
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

export interface Recommendation {
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  code?: string;
}

export interface Viewport {
  width: number;
  height: number;
  name: string;
}
```

---

## 6. 설정 파일 예시

```javascript
// .page-test.config.js
module.exports = {
  // 테스트할 브라우저
  browsers: ['chromium', 'firefox', 'webkit'],

  // 뷰포트 설정
  viewports: [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1280, height: 720, name: 'Desktop' },
    { width: 1920, height: 1080, name: 'Desktop HD' }
  ],

  // 임계값
  thresholds: {
    performance: 90,
    accessibility: 95,
    seo: 90
  },

  // 건너뛸 테스트
  skipTests: [],

  // 커스텀 모듈
  customModules: [
    // require('./custom-modules/security-check')
  ],

  // 출력 디렉토리
  outputDir: './test-results',

  // 리포터 설정
  reporters: {
    console: true,
    html: true,
    json: true,
    notion: false,
    slack: false
  },

  // Notion 설정 (선택)
  notion: {
    apiKey: process.env.NOTION_API_KEY,
    databaseId: process.env.NOTION_DATABASE_ID
  },

  // Slack 설정 (선택)
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL
  }
};
```

---

## 7. 실행 방법

### 7.1 개발 환경

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 테스트 실행
npm run dev https://example.com

# 또는 직접 실행
node dist/index.js https://example.com --browsers chromium,firefox
```

### 7.2 Claude Code 통합

```bash
# 슬래시 커맨드로 실행
/test-page https://example.com

# 에이전트로 실행
@page-tester "https://example.com 테스트해줘"

# 현재 개발 서버 테스트
/test-page http://localhost:4321/blog/my-post
```

---

## 8. 다음 단계

1. [사용 가이드](./04-usage-guide.md) 작성
2. 각 테스트 모듈 상세 구현
3. CI/CD 통합 가이드
4. 커스텀 모듈 개발 가이드

---

**준비 완료!** 이제 구현을 시작할 수 있습니다.
