# Claude Code Testing Implementation Guide
## Practical Examples for Large-Scale Page Migration Testing

**Purpose**: Step-by-step guide to implement parallel test generation and execution using Claude Code
**Context**: Testing the "LLM Page Migration Standardization" blog post examples
**Tools**: Claude Code agents, commands, MCP servers

---

## 🎯 Quick Start

### Prerequisites

```bash
# 1. Install dependencies
npm install --save-dev @playwright/test
npm install --save-dev @axe-core/playwright
npm install --save-dev playwright-lighthouse
npm install --save-dev @open-wc/testing
npm install --save-dev web-vitals

# 2. Install Playwright browsers
npx playwright install --with-deps

# 3. Initialize Playwright config
npx playwright init
```

### Project Structure Setup

```bash
# Create test directories
mkdir -p tests/{components,e2e,accessibility,performance,seo}
mkdir -p test-results
mkdir -p scripts

# Create configuration files
touch playwright.config.ts
touch .playwright/
```

---

## 🚀 Implementation Steps

### Step 1: Configure Parallel Test Execution

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Enable full parallel execution
  fullyParallel: true,

  // Configure workers (adjust based on your system)
  workers: process.env.CI ? 4 : undefined,

  // Timeout configurations
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // Retry configuration
  retries: process.env.CI ? 2 : 0,

  // Test projects for different categories
  projects: [
    {
      name: 'components',
      testMatch: /.*components.*\.spec\.ts/,
      timeout: 10000,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'e2e-chrome',
      testMatch: /.*e2e.*\.spec\.ts/,
      timeout: 60000,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'e2e-firefox',
      testMatch: /.*e2e.*\.spec\.ts/,
      timeout: 60000,
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'accessibility',
      testMatch: /.*accessibility.*\.spec\.ts/,
      timeout: 30000,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'performance',
      testMatch: /.*performance.*\.spec\.ts/,
      timeout: 120000,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--remote-debugging-port=9222'],
        },
      },
    },
    {
      name: 'seo',
      testMatch: /.*seo.*\.spec\.ts/,
      timeout: 20000,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // Web server for local testing
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

### Step 2: Generate Tests with Claude Code Agents

#### Option A: Interactive Command

```bash
# Use Claude Code CLI
claude "Generate comprehensive test suite for the blog post
        at src/content/blog/en/llm-page-migration-standardization.md.

        Requirements:
        1. Analyze the blog post content (lines 78-1051)
        2. Identify all code examples and testable concepts
        3. Generate 5 parallel test suites:
           - Web Component tests (Lit & Stencil)
           - E2E workflow tests (Playwright)
           - Accessibility tests (axe-core)
           - Performance tests (Lighthouse + web-vitals)
           - SEO/AEO tests (Schema.org validation)

        4. Use parallel agent execution:
           - Delegate to test-engineer agent (3 instances)
           - Delegate to web-accessibility-checker agent (1 instance)
           - Delegate to seo-analyzer agent (1 instance)

        5. Output tests to:
           tests/components/*.spec.ts
           tests/e2e/*.spec.ts
           tests/accessibility/*.spec.ts
           tests/performance/*.spec.ts
           tests/seo/*.spec.ts

        Execute all 5 agents in parallel using single message with
        multiple Task tool calls."
```

#### Option B: Custom Slash Command

Create `.claude/commands/generate-tests.md`:

```markdown
# /generate-tests Command

## Description
Generates comprehensive test suites for blog post content using parallel agent execution.

## Usage
/generate-tests <blog-post-path>

## Implementation

When this command is invoked:

1. Read the blog post at the specified path
2. Analyze content to identify:
   - Code examples (lines with triple backticks)
   - Technical concepts requiring validation
   - User workflows and interactions
   - Performance-critical sections
   - SEO/accessibility requirements

3. Delegate to specialized agents IN PARALLEL (single message, 5 Task tool calls):

   **Task 1: Component Tests (test-engineer)**
   ```
   Generate Web Component tests for Lit and Stencil examples.
   Target: Lines 78-266
   Output: tests/components/
   Include: unit tests, integration tests, Shadow DOM tests
   ```

   **Task 2: E2E Tests (test-engineer)**
   ```
   Generate Playwright E2E tests for migration workflows.
   Target: Lines 360-421, 675-688
   Output: tests/e2e/
   Include: user flows, link validation, form interactions
   ```

   **Task 3: Accessibility Tests (web-accessibility-checker)**
   ```
   Generate axe-core accessibility tests.
   Target: Lines 461-483
   Output: tests/accessibility/
   Include: WCAG 2.1/2.2 compliance, keyboard navigation, ARIA
   ```

   **Task 4: Performance Tests (test-engineer)**
   ```
   Generate Lighthouse and Core Web Vitals tests.
   Target: Lines 485-527
   Output: tests/performance/
   Include: LCP, FID, CLS, TTFB, FCP measurements
   ```

   **Task 5: SEO Tests (seo-analyzer)**
   ```
   Generate Schema.org and meta tag validation tests.
   Target: Lines 529-577
   Output: tests/seo/
   Include: structured data, Open Graph, Twitter Cards, FAQ schema
   ```

4. Wait for all agents to complete
5. Validate generated test files
6. Output summary of created tests
```

#### Option C: Script-Based Generation

Create `scripts/generate-tests.js`:

```javascript
#!/usr/bin/env node

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const blogPostPath = process.argv[2] || 'src/content/blog/en/llm-page-migration-standardization.md';

async function generateTests() {
  console.log(`Generating tests for: ${blogPostPath}`);

  // Read blog post
  const content = readFileSync(blogPostPath, 'utf8');

  // Identify testable sections
  const sections = analyzeContent(content);

  // Generate test suite specifications
  const testSpecs = createTestSpecs(sections);

  // Use Claude Code MCP to generate tests in parallel
  await generateTestsInParallel(testSpecs);

  console.log('Test generation complete!');
}

function analyzeContent(content) {
  const sections = {
    components: extractCodeBlocks(content, 'Web Components', 78, 266),
    e2e: extractWorkflows(content, 360, 688),
    accessibility: extractAccessibilityRequirements(content, 461, 483),
    performance: extractPerformanceMetrics(content, 485, 527),
    seo: extractSEORequirements(content, 529, 577),
  };

  return sections;
}

function extractCodeBlocks(content, section, startLine, endLine) {
  const lines = content.split('\n').slice(startLine - 1, endLine);
  const codeBlocks = [];
  let inCodeBlock = false;
  let currentBlock = [];
  let language = '';

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        language = line.substring(3).trim();
      } else {
        codeBlocks.push({ language, code: currentBlock.join('\n') });
        currentBlock = [];
        inCodeBlock = false;
      }
    } else if (inCodeBlock) {
      currentBlock.push(line);
    }
  }

  return codeBlocks;
}

function createTestSpecs(sections) {
  return {
    components: {
      agent: 'test-engineer',
      prompt: `Generate Web Component tests for the following code examples:
               ${JSON.stringify(sections.components, null, 2)}

               Requirements:
               - Test Shadow DOM encapsulation
               - Test reactive property updates
               - Test event handling
               - Test slot-based composition
               - Output to tests/components/`,
      outputDir: 'tests/components',
    },
    e2e: {
      agent: 'test-engineer',
      prompt: `Generate E2E Playwright tests for migration workflows:
               ${JSON.stringify(sections.e2e, null, 2)}

               Requirements:
               - Test full migration pipeline
               - Test link validation
               - Test form interactions
               - Test visual regression
               - Output to tests/e2e/`,
      outputDir: 'tests/e2e',
    },
    accessibility: {
      agent: 'web-accessibility-checker',
      prompt: `Generate accessibility tests using axe-core:
               ${JSON.stringify(sections.accessibility, null, 2)}

               Requirements:
               - WCAG 2.1/2.2 compliance checks
               - Keyboard navigation tests
               - Color contrast validation
               - ARIA attribute verification
               - Output to tests/accessibility/`,
      outputDir: 'tests/accessibility',
    },
    performance: {
      agent: 'test-engineer',
      prompt: `Generate performance tests for Core Web Vitals:
               ${JSON.stringify(sections.performance, null, 2)}

               Requirements:
               - Lighthouse audit tests
               - LCP, FID, CLS measurements
               - TTFB and FCP tests
               - Bundle size analysis
               - Output to tests/performance/`,
      outputDir: 'tests/performance',
    },
    seo: {
      agent: 'seo-analyzer',
      prompt: `Generate SEO/AEO validation tests:
               ${JSON.stringify(sections.seo, null, 2)}

               Requirements:
               - Schema.org structured data validation
               - Open Graph meta tags
               - Twitter Cards
               - FAQ schema verification
               - Output to tests/seo/`,
      outputDir: 'tests/seo',
    },
  };
}

async function generateTestsInParallel(testSpecs) {
  // In practice, this would use Claude Code MCP
  // For now, we'll simulate with execSync

  const categories = Object.keys(testSpecs);

  console.log(`Generating ${categories.length} test suites in parallel...`);

  // Execute all agents in parallel
  const promises = categories.map(async (category) => {
    const spec = testSpecs[category];
    console.log(`  - ${category}: Delegating to ${spec.agent} agent`);

    // This would be replaced with actual MCP call
    // For demonstration:
    await simulateAgentExecution(spec);

    console.log(`  ✓ ${category}: Tests generated`);
  });

  await Promise.all(promises);
}

async function simulateAgentExecution(spec) {
  // Simulate agent processing time
  return new Promise(resolve => setTimeout(resolve, 2000));
}

// Helper functions
function extractWorkflows(content, startLine, endLine) {
  // Implementation
  return [];
}

function extractAccessibilityRequirements(content, startLine, endLine) {
  // Implementation
  return [];
}

function extractPerformanceMetrics(content, startLine, endLine) {
  // Implementation
  return [];
}

function extractSEORequirements(content, startLine, endLine) {
  // Implementation
  return [];
}

// Run
generateTests().catch(console.error);
```

Make it executable:
```bash
chmod +x scripts/generate-tests.js
```

### Step 3: Execute Tests in Parallel

Add npm scripts to `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:components": "playwright test --project=components",
    "test:e2e": "playwright test --project=e2e-chrome --project=e2e-firefox",
    "test:a11y": "playwright test --project=accessibility",
    "test:performance": "playwright test --project=performance",
    "test:seo": "playwright test --project=seo",
    "test:parallel": "playwright test --workers=8",
    "test:debug": "playwright test --debug",
    "test:headed": "playwright test --headed",
    "test:report": "playwright show-report test-results/html",
    "generate-tests": "node scripts/generate-tests.js"
  }
}
```

### Step 4: Analyze Results with Claude Code

Create `scripts/analyze-results.js`:

```javascript
#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function analyzeResults() {
  console.log('Analyzing test results...');

  // Read test results
  const resultsPath = 'test-results/results.json';
  const results = JSON.parse(readFileSync(resultsPath, 'utf8'));

  // Prepare analysis prompt
  const prompt = `
    Analyze the following Playwright test results and provide:

    1. Overall pass/fail summary with percentages
    2. Category-wise breakdown (components, e2e, accessibility, performance, seo)
    3. Critical failures that must be addressed before deployment
    4. Performance bottlenecks and optimization opportunities
    5. Accessibility violations with severity levels
    6. SEO issues and recommendations
    7. Actionable next steps prioritized by impact

    Test Results:
    ${JSON.stringify(results, null, 2)}

    Format the response as a markdown report with:
    - Executive summary
    - Detailed findings by category
    - Priority recommendations
    - Test coverage metrics
  `;

  // Call Claude Code via MCP (placeholder)
  console.log('Delegating analysis to data-analyst agent...');
  const analysis = await analyzeWithClaudeAgent(prompt);

  // Save analysis report
  writeFileSync('test-results/analysis-report.md', analysis);
  console.log('Analysis report saved to: test-results/analysis-report.md');

  // Generate visual dashboard (optional)
  await generateDashboard(results, analysis);
}

async function analyzeWithClaudeAgent(prompt) {
  // In practice, this would use Claude Code MCP
  // For demonstration, we'll return a template

  return `
# Test Results Analysis Report

**Generated**: ${new Date().toISOString()}
**Total Tests**: [TOTAL]
**Overall Pass Rate**: [PASS_RATE]%

---

## Executive Summary

[Summary provided by Claude Code data-analyst agent]

---

## Category Breakdown

### Web Components
- Total: [COUNT]
- Passed: [PASSED]
- Failed: [FAILED]
- Pass Rate: [RATE]%

### E2E Tests
- Total: [COUNT]
- Passed: [PASSED]
- Failed: [FAILED]
- Pass Rate: [RATE]%

### Accessibility
- Total: [COUNT]
- Passed: [PASSED]
- Failed: [FAILED]
- Pass Rate: [RATE]%

### Performance
- Total: [COUNT]
- Passed: [PASSED]
- Failed: [FAILED]
- Pass Rate: [RATE]%

### SEO
- Total: [COUNT]
- Passed: [PASSED]
- Failed: [FAILED]
- Pass Rate: [RATE]%

---

## Critical Failures

[List of blocking issues]

---

## Recommendations

1. [Priority 1 recommendation]
2. [Priority 2 recommendation]
3. [Priority 3 recommendation]

---

## Next Steps

- [ ] Address critical failures
- [ ] Optimize performance bottlenecks
- [ ] Fix accessibility violations
- [ ] Improve SEO scores
  `;
}

async function generateDashboard(results, analysis) {
  // Generate HTML dashboard
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Results Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }
    .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
    .card h3 { margin-top: 0; }
    .pass { color: green; }
    .fail { color: red; }
  </style>
</head>
<body>
  <h1>Test Results Dashboard</h1>
  <div class="summary">
    <div class="card">
      <h3>Components</h3>
      <p class="pass">✓ Passed: [COUNT]</p>
      <p class="fail">✗ Failed: [COUNT]</p>
    </div>
    <div class="card">
      <h3>E2E</h3>
      <p class="pass">✓ Passed: [COUNT]</p>
      <p class="fail">✗ Failed: [COUNT]</p>
    </div>
    <div class="card">
      <h3>Accessibility</h3>
      <p class="pass">✓ Passed: [COUNT]</p>
      <p class="fail">✗ Failed: [COUNT]</p>
    </div>
    <div class="card">
      <h3>Performance</h3>
      <p class="pass">✓ Passed: [COUNT]</p>
      <p class="fail">✗ Failed: [COUNT]</p>
    </div>
    <div class="card">
      <h3>SEO</h3>
      <p class="pass">✓ Passed: [COUNT]</p>
      <p class="fail">✗ Failed: [COUNT]</p>
    </div>
  </div>
</body>
</html>
  `;

  writeFileSync('test-results/dashboard.html', html);
  console.log('Dashboard saved to: test-results/dashboard.html');
}

analyzeResults().catch(console.error);
```

---

## 🎮 Usage Examples

### Example 1: Generate and Run All Tests

```bash
# Step 1: Generate tests using Claude Code
/generate-tests src/content/blog/en/llm-page-migration-standardization.md

# Step 2: Run all tests in parallel
npm run test:parallel

# Step 3: Analyze results
node scripts/analyze-results.js

# Step 4: View HTML report
npm run test:report
```

### Example 2: Test-Driven Migration Workflow

```bash
# 1. Generate tests for specific section
claude "Generate E2E tests for the migration workflow
        described in lines 675-688 of
        src/content/blog/en/llm-page-migration-standardization.md.

        Focus on:
        - HTML extraction (Playwright)
        - DOM structure analysis
        - LLM transformation validation
        - Automated testing pipeline

        Output to tests/e2e/migration-workflow.spec.ts"

# 2. Run the generated test
npm run test:e2e

# 3. If tests fail, iterate with Claude
claude "The migration workflow test failed at the LLM transformation step.
        Error: Timeout waiting for transformation completion.

        Please:
        1. Analyze the test code
        2. Identify the timeout issue
        3. Suggest improvements
        4. Update the test with better wait conditions"

# 4. Re-run tests
npm run test:e2e
```

### Example 3: Accessibility Audit

```bash
# Generate accessibility tests
claude "Generate comprehensive accessibility tests for the
        Web Components section (lines 78-266).

        Use web-accessibility-checker agent to:
        1. Test WCAG 2.1/2.2 compliance
        2. Validate ARIA attributes
        3. Test keyboard navigation
        4. Check color contrast

        Output to tests/accessibility/"

# Run accessibility tests
npm run test:a11y

# Analyze violations
node scripts/analyze-results.js

# Generate fix recommendations
claude "Based on the accessibility test results in
        test-results/results.json, provide:

        1. List of violations with severity
        2. Code examples to fix each violation
        3. Best practices to prevent future issues
        4. WCAG guidelines references"
```

### Example 4: Performance Optimization Loop

```bash
# Initial performance test
npm run test:performance

# Analyze baseline
node scripts/analyze-results.js

# Ask Claude for optimization suggestions
claude "Analyze the performance test results and suggest
        optimizations for:
        - LCP (currently 3.2s, target <2.5s)
        - FID (currently 150ms, target <100ms)
        - CLS (currently 0.15, target <0.1)

        Consider:
        - Image optimization strategies
        - JavaScript bundle splitting
        - Critical CSS inlining
        - Resource preloading"

# Implement optimizations
# ...

# Re-run performance tests
npm run test:performance

# Compare results
claude "Compare the before/after performance metrics:

        Before: [paste previous results]
        After: [paste current results]

        Provide:
        1. Improvement percentages
        2. Remaining optimization opportunities
        3. Next steps to reach targets"
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test-migration.yml`:

```yaml
name: Migration Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  generate-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Generate tests (if needed)
        run: |
          if [ ! -d "tests" ]; then
            node scripts/generate-tests.js
          fi

      - name: Run tests in parallel
        run: npm run test:parallel

      - name: Analyze results
        run: node scripts/analyze-results.js

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('test-results/analysis-report.md', 'utf8');

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Test Results\n\n${report}`
            });
```

---

## 📊 Monitoring & Continuous Improvement

### Test Metrics Tracking

Create `scripts/track-metrics.js`:

```javascript
import { readFileSync, writeFileSync, existsSync } from 'fs';

function trackMetrics() {
  const resultsPath = 'test-results/results.json';
  const metricsPath = 'test-results/metrics-history.json';

  const currentResults = JSON.parse(readFileSync(resultsPath, 'utf8'));

  let history = [];
  if (existsSync(metricsPath)) {
    history = JSON.parse(readFileSync(metricsPath, 'utf8'));
  }

  const metrics = {
    timestamp: new Date().toISOString(),
    totalTests: currentResults.suites.length,
    passed: currentResults.passed,
    failed: currentResults.failed,
    passRate: (currentResults.passed / currentResults.totalTests * 100).toFixed(2),
    categories: {
      components: extractCategoryMetrics(currentResults, 'components'),
      e2e: extractCategoryMetrics(currentResults, 'e2e'),
      accessibility: extractCategoryMetrics(currentResults, 'accessibility'),
      performance: extractCategoryMetrics(currentResults, 'performance'),
      seo: extractCategoryMetrics(currentResults, 'seo'),
    },
  };

  history.push(metrics);

  // Keep last 50 runs
  if (history.length > 50) {
    history = history.slice(-50);
  }

  writeFileSync(metricsPath, JSON.stringify(history, null, 2));

  console.log('Metrics tracked successfully');
  console.log(`Total tests: ${metrics.totalTests}`);
  console.log(`Pass rate: ${metrics.passRate}%`);
}

function extractCategoryMetrics(results, category) {
  // Implementation
  return { passed: 0, failed: 0, total: 0 };
}

trackMetrics();
```

Add to npm scripts:
```json
{
  "scripts": {
    "test:track": "npm run test && node scripts/track-metrics.js"
  }
}
```

---

## 🎓 Best Practices Summary

### 1. Test Generation
- ✅ Use parallel agent execution (single message, multiple Task calls)
- ✅ Provide clear, structured prompts to agents
- ✅ Specify exact output locations and file formats
- ✅ Include code examples from blog post in prompts

### 2. Test Execution
- ✅ Configure appropriate worker counts
- ✅ Set realistic timeouts per test category
- ✅ Enable retries for flaky tests
- ✅ Use cross-browser testing for E2E

### 3. Result Analysis
- ✅ Delegate analysis to data-analyst agent
- ✅ Generate actionable recommendations
- ✅ Track metrics over time
- ✅ Automate report generation

### 4. Continuous Improvement
- ✅ Iterate on test failures with Claude
- ✅ Update tests as blog content evolves
- ✅ Monitor test execution time
- ✅ Optimize parallel execution

---

**Last Updated**: 2025-10-29
**Author**: Claude Code Implementation Guide
