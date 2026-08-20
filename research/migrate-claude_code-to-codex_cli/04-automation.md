# 자동화 및 고급 기능 가이드

## 목차

1. [개요](#개요)
2. [비대화형 모드 (codex exec)](#비대화형-모드-codex-exec)
3. [TypeScript SDK](#typescript-sdk)
4. [GitHub Actions 통합](#github-actions-통합)
5. [실전 자동화 예제](#실전-자동화-예제)
6. [베스트 프랙티스](#베스트-프랙티스)

## 개요

### Claude Code의 한계

Claude Code는 주로 **대화형 인터페이스**에 최적화:
- 수동 명령 실행
- 대화 기반 워크플로우
- 제한적인 자동화 기능

### Codex CLI의 강점

Codex CLI는 **자동화 우선** 설계:
- **비대화형 모드**: `codex exec`로 백그라운드 작업 실행
- **TypeScript SDK**: 프로그래밍 방식 제어
- **GitHub Actions**: CI/CD 파이프라인 통합
- **JSON 출력**: 기계 판독 가능한 이벤트 스트림

**핵심 이점**:

| 기능 | Claude Code | Codex CLI |
|------|-------------|-----------|
| **대화형 모드** | ✅ 주요 기능 | ✅ 지원 |
| **비대화형 실행** | ❌ 제한적 | ✅ `codex exec` |
| **프로그래밍 API** | ❌ 없음 | ✅ TypeScript SDK |
| **CI/CD 통합** | 🔶 수동 | ✅ GitHub Action |
| **JSON 이벤트** | ❌ 없음 | ✅ `--json` 플래그 |
| **자동 승인** | 제한적 | ✅ `--full-auto` |

## 비대화형 모드 (codex exec)

### 기본 사용법

**명령어 형식**:
```bash
codex exec "<task description>"
# 또는 축약형
codex e "<task>"
```

**특징**:
- 작업 완료 시까지 실행 (승인 대기 없음)
- 진행 상황을 stderr에 출력
- 최종 결과만 stdout에 출력
- 스크립트 및 CI 환경에 최적화

### 기본 예제

**1. 타입 체크 및 빌드**:
```bash
codex exec "Run npm run astro check and npm run build. Report any errors."
```

**2. 테스트 실행**:
```bash
codex exec "Run all tests and fix any failures"
```

**3. 파일 분석**:
```bash
codex exec "Analyze all Markdown files in src/content/blog/ and generate a summary"
```

### 권한 제어

**기본 모드** (읽기 전용):
```bash
codex exec "Analyze the codebase structure"
```
- 파일 읽기만 가능
- 수정 불가
- 네트워크 요청 불가

**워크스페이스 쓰기 허용**:
```bash
codex exec --full-auto "Fix all TypeScript errors"
```
- 파일 수정 허용
- 워크스페이스 내 파일만 변경 가능
- 네트워크 요청 여전히 불가

**전체 권한**:
```bash
codex exec --sandbox danger-full-access "Deploy to production"
```
- 모든 파일 수정 가능
- 네트워크 요청 허용
- **주의**: 위험한 작업 가능

**권한 옵션 비교**:

| 옵션 | 파일 읽기 | 파일 쓰기 | 네트워크 | 용도 |
|------|----------|----------|---------|------|
| (기본값) | ✅ | ❌ | ❌ | 분석, 리포트 |
| `--full-auto` | ✅ | ✅ (워크스페이스) | ❌ | 코드 수정, 리팩토링 |
| `--sandbox danger-full-access` | ✅ | ✅ (전체) | ✅ | 배포, API 호출 |

### JSON 출력 모드

**기본 출력** (텍스트):
```bash
codex exec "List all blog posts"
```
출력:
```
[진행 상황 로그들...]
Found 120 blog posts:
- ko/astro-5-features.md
- en/typescript-5.md
...
```

**JSON 모드**:
```bash
codex exec --json "List all blog posts"
```
출력 (newline-delimited JSON):
```json
{"type":"progress","message":"Reading blog directory..."}
{"type":"progress","message":"Found 120 files"}
{"type":"result","data":{"posts":[{"lang":"ko","slug":"astro-5-features"},...]}}
```

**JSON + 최종 메시지**:
```bash
codex exec --json --output-last-message "Analyze blog posts"
```
- 이벤트 스트림 (JSON): stderr
- 최종 요약 (텍스트): stdout
- CI 파이프라인에서 유용

### 세션 재개

**마지막 세션 재개**:
```bash
codex exec resume --last
```

**특정 세션 재개**:
```bash
# 세션 ID 확인
codex exec --json "Task 1" > session.log
# session.log에서 threadId 추출

# 재개
codex exec resume --thread-id <thread-id>
```

**활용 사례**:
- 장시간 작업 중단 후 재개
- 이전 컨텍스트 유지하며 추가 작업
- 여러 단계로 나눠진 워크플로우

### 실전 예제

#### 예제 1: 블로그 포스트 검증

`scripts/validate-posts.sh`:
```bash
#!/bin/bash

# 모든 블로그 포스트 검증
echo "Validating blog posts..."

result=$(codex exec --json "
Validate all blog posts in src/content/blog/:
1. Check frontmatter schema compliance
2. Verify pubDate format (YYYY-MM-DD)
3. Check heroImage paths exist
4. Validate multi-language consistency
5. Report any issues found
" 2>&1)

# JSON에서 에러 추출
errors=$(echo "$result" | jq -r 'select(.type=="error") | .message')

if [ -n "$errors" ]; then
  echo "Validation failed:"
  echo "$errors"
  exit 1
else
  echo "All posts valid!"
  exit 0
fi
```

#### 예제 2: SEO 일괄 감사

`scripts/seo-audit.sh`:
```bash
#!/bin/bash

# SEO 감사 실행 및 보고서 생성
codex exec --full-auto --json --output-last-message "
Perform SEO audit on all blog posts:
1. Check title length (50-60 chars)
2. Check description length (150-160 chars)
3. Verify alt attributes on images
4. Check internal linking (2-3 per post)
5. Generate markdown report: reports/seo-audit-$(date +%Y-%m-%d).md
" > seo-audit.log 2>&1

# 보고서 위치 출력
grep -o "reports/seo-audit-[0-9-]*.md" seo-audit.log | tail -1
```

#### 예제 3: 자동 번역 워크플로우

`scripts/translate-post.sh`:
```bash
#!/bin/bash

POST_SLUG=$1
SOURCE_LANG=$2
TARGET_LANG=$3

if [ -z "$POST_SLUG" ] || [ -z "$SOURCE_LANG" ] || [ -z "$TARGET_LANG" ]; then
  echo "Usage: $0 <post-slug> <source-lang> <target-lang>"
  exit 1
fi

echo "Translating $POST_SLUG from $SOURCE_LANG to $TARGET_LANG..."

codex exec --full-auto "
Translate blog post:
- Source: src/content/blog/$SOURCE_LANG/$POST_SLUG.md
- Target: src/content/blog/$TARGET_LANG/$POST_SLUG.md

Guidelines:
1. Preserve frontmatter structure (same heroImage, tags)
2. Update pubDate to current date
3. Translate title and description naturally (not literal)
4. Translate content preserving code blocks and technical terms
5. Maintain markdown formatting
6. Use appropriate technical terminology for $TARGET_LANG audience
"

echo "Translation complete!"
```

**사용**:
```bash
./scripts/translate-post.sh astro-5-features ko ja
```

## TypeScript SDK

### 설치

```bash
npm install @openai/codex-sdk
```

**요구사항**:
- Node.js v18+
- 서버 측 사용 (브라우저 환경 ❌)

### 기본 사용

**1. 초기화 및 실행**:
```typescript
import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = codex.startThread();

// 작업 실행
const result = await thread.run(
  "Analyze the blog post structure and suggest improvements"
);

console.log(result);
```

**2. 대화 컨텍스트 유지**:
```typescript
const thread = codex.startThread();

// 첫 번째 작업
await thread.run("Read all blog posts in src/content/blog/ko/");

// 같은 스레드에서 후속 작업 (이전 컨텍스트 유지)
const analysis = await thread.run(
  "Based on the posts you just read, identify the top 3 topics"
);

// 추가 작업
const recommendations = await thread.run(
  "Suggest 5 new post topics based on the current portfolio"
);
```

**3. 세션 재개**:
```typescript
// threadId 저장
const thread1 = codex.startThread();
const result1 = await thread1.run("Start analysis");
const threadId = thread1.id; // 저장 필요

// 나중에 재개
const thread2 = codex.resumeThread(threadId);
const result2 = await thread2.run("Continue where we left off");
```

### 고급 기능

#### 이벤트 스트리밍

```typescript
const thread = codex.startThread();

// 이벤트 리스너 등록
thread.on("progress", (event) => {
  console.log("Progress:", event.message);
});

thread.on("file_change", (event) => {
  console.log("File changed:", event.path);
});

thread.on("error", (event) => {
  console.error("Error:", event.message);
});

// 작업 실행
await thread.run("Refactor all components to use TypeScript");
```

#### 권한 제어

```typescript
const codex = new Codex({
  sandboxMode: "workspace-write", // or "danger-full-access"
  approvalPolicy: "never",         // 자동 승인
});

const thread = codex.startThread();
await thread.run("Fix all TypeScript errors");
```

#### 타임아웃 및 중단

```typescript
const thread = codex.startThread();

// 타임아웃 설정 (10분)
const promise = thread.run("Long task", { timeout: 600000 });

// 조기 중단
setTimeout(() => {
  thread.abort();
}, 300000); // 5분 후 중단

try {
  await promise;
} catch (error) {
  console.error("Task aborted or timed out");
}
```

### 실전 예제

#### 예제 1: 블로그 자동화 스크립트

`scripts/blog-automation.ts`:
```typescript
import { Codex } from "@openai/codex-sdk";
import * as fs from "fs";

interface BlogPost {
  slug: string;
  lang: string;
  title: string;
  seoScore?: number;
}

async function auditBlogSEO(): Promise<BlogPost[]> {
  const codex = new Codex({
    sandboxMode: "read-only",
  });

  const thread = codex.startThread();

  // SEO 감사 실행
  const result = await thread.run(`
    Analyze all blog posts for SEO:
    1. Read all posts in src/content/blog/
    2. For each post, calculate SEO score (0-100) based on:
       - Title length (60 chars ideal)
       - Description length (150-160 chars ideal)
       - Image alt attributes
       - Internal links (2-3 ideal)
    3. Return JSON array: [{slug, lang, title, seoScore}, ...]
  `);

  // JSON 파싱 (실제로는 결과 형식에 따라 조정 필요)
  const posts: BlogPost[] = JSON.parse(result);

  return posts;
}

async function fixLowSEOPosts(posts: BlogPost[]) {
  const lowSEOPosts = posts.filter(post => (post.seoScore || 0) < 70);

  if (lowSEOPosts.length === 0) {
    console.log("All posts have good SEO!");
    return;
  }

  console.log(`Found ${lowSEOPosts.length} posts with low SEO scores.`);

  const codex = new Codex({
    sandboxMode: "workspace-write",
    approvalPolicy: "never",
  });

  for (const post of lowSEOPosts) {
    console.log(`Fixing ${post.lang}/${post.slug}...`);

    const thread = codex.startThread();
    await thread.run(`
      Improve SEO for blog post: src/content/blog/${post.lang}/${post.slug}.md
      1. Optimize title to 50-60 characters (keep meaning)
      2. Optimize description to 150-160 characters
      3. Add internal links to related posts (2-3)
      4. Ensure all images have descriptive alt attributes
      5. Save changes
    `);

    console.log(`✓ Fixed ${post.slug}`);
  }
}

async function main() {
  console.log("Starting SEO audit...");
  const posts = await auditBlogSEO();

  console.log(`Audited ${posts.length} posts.`);

  await fixLowSEOPosts(posts);

  console.log("Done!");
}

main().catch(console.error);
```

**실행**:
```bash
npx tsx scripts/blog-automation.ts
```

#### 예제 2: 자동 콘텐츠 추천 생성

`scripts/generate-recommendations.ts`:
```typescript
import { Codex } from "@openai/codex-sdk";
import * as fs from "fs";

async function generateRecommendations() {
  const codex = new Codex({
    sandboxMode: "workspace-write",
  });

  const thread = codex.startThread();

  console.log("Analyzing blog posts for semantic similarity...");

  const result = await thread.run(`
    Generate semantic content recommendations:

    1. Read all blog posts from src/content/blog/
    2. For each post, identify 3-5 related posts based on:
       - Semantic similarity of content
       - Shared topics and tags
       - Complementary information (prerequisites, next steps)
    3. Generate recommendations.json with structure:
       {
         "<lang>/<slug>": {
           "relatedPosts": [
             {
               "slug": "<lang>/<slug>",
               "score": 0.0-1.0,
               "reason": {
                 "ko": "Korean explanation",
                 "en": "English explanation",
                 "ja": "Japanese explanation"
               }
             }
           ]
         }
       }
    4. Save to recommendations.json
  `);

  console.log("Recommendations generated!");

  // 검증
  const recommendations = JSON.parse(
    fs.readFileSync("recommendations.json", "utf-8")
  );

  const totalPosts = Object.keys(recommendations).length;
  console.log(`Generated recommendations for ${totalPosts} posts.`);
}

generateRecommendations().catch(console.error);
```

#### 예제 3: CI/CD 통합 - 빌드 전 검증

`scripts/pre-build-check.ts`:
```typescript
import { Codex } from "@openai/codex-sdk";

interface ValidationResult {
  success: boolean;
  errors: string[];
}

async function validateBeforeBuild(): Promise<ValidationResult> {
  const codex = new Codex({
    sandboxMode: "read-only",
  });

  const thread = codex.startThread();

  console.log("Running pre-build validation...");

  try {
    await thread.run(`
      Validate project before build:
      1. Run 'npm run astro check' - must have 0 errors
      2. Check all blog posts have required frontmatter
      3. Verify all heroImage paths exist
      4. Check no broken internal links
      5. Validate multi-language post consistency

      If any errors, list them clearly.
      If all pass, output "VALIDATION PASSED"
    `);

    return { success: true, errors: [] };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}

async function main() {
  const result = await validateBeforeBuild();

  if (result.success) {
    console.log("✓ All validations passed!");
    process.exit(0);
  } else {
    console.error("✗ Validation failed:");
    result.errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
}

main().catch(console.error);
```

**package.json에 추가**:
```json
{
  "scripts": {
    "prebuild": "tsx scripts/pre-build-check.ts",
    "build": "astro build"
  }
}
```

## GitHub Actions 통합

### Codex Action 사용

**기본 설정**:

`.github/workflows/codex-ci.yml`:
```yaml
name: Codex CI Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  codex-check:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run Codex validation
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: |
            Validate the codebase:
            1. Run npm run astro check
            2. Check all blog posts for schema compliance
            3. Report any issues found
          sandbox: read-only
```

### 자동 수정 워크플로우

`.github/workflows/codex-autofix.yml`:
```yaml
name: Codex Auto-Fix

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-fix:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.workflow_run.head_branch }}

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run Codex auto-fix
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: |
            The CI build failed. Analyze the errors and make minimal fixes:
            1. Read the repository
            2. Run the test suite to identify failures
            3. Make minimal, surgical changes to fix failures
            4. Re-run tests to verify fixes
            5. Stop when all tests pass
          sandbox: workspace-write
          auto-approve: true

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: "fix: auto-fix CI failures with Codex"
          title: "🤖 Auto-fix: CI failures"
          body: |
            ## Auto-generated fix

            This PR was automatically created by Codex CLI to fix CI failures.

            **Original workflow**: ${{ github.event.workflow_run.name }}
            **Failed run**: ${{ github.event.workflow_run.html_url }}

            Please review the changes carefully before merging.

            🤖 Generated with Codex CLI
          branch: codex-autofix-${{ github.run_number }}
```

### SEO 자동 감사

`.github/workflows/seo-audit.yml`:
```yaml
name: Weekly SEO Audit

on:
  schedule:
    # 매주 월요일 오전 9시 (UTC)
    - cron: '0 9 * * 1'
  workflow_dispatch:

jobs:
  seo-audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run SEO Audit
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: |
            Perform comprehensive SEO audit:
            1. Analyze all blog posts in src/content/blog/
            2. Check SEO criteria (title, description, images, links)
            3. Generate markdown report: reports/seo-audit-${{ github.run_number }}.md
            4. Include:
               - SEO scores per post
               - Top 10 issues
               - Actionable recommendations
          sandbox: workspace-write
          output-json: true

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: seo-audit-report
          path: reports/seo-audit-*.md

      - name: Comment on Issue
        if: always()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('reports/seo-audit-${{ github.run_number }}.md', 'utf8');

            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `SEO Audit Report - ${new Date().toISOString().split('T')[0]}`,
              body: report,
              labels: ['seo', 'automated']
            });
```

### 콘텐츠 추천 자동 생성

`.github/workflows/generate-recommendations.yml`:
```yaml
name: Generate Content Recommendations

on:
  push:
    paths:
      - 'src/content/blog/**/*.md'
  workflow_dispatch:

jobs:
  generate-recommendations:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Generate Recommendations
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: |
            Generate semantic content recommendations:
            1. Analyze all blog posts
            2. Compute semantic similarity
            3. Generate recommendations.json
            4. Update RelatedPosts component data
          sandbox: workspace-write

      - name: Commit Changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add recommendations.json
          git commit -m "chore: update content recommendations" || echo "No changes"
          git push
```

## 실전 자동화 예제

### 예제 1: 완전 자동화된 블로그 발행 파이프라인

`scripts/publish-workflow.ts`:
```typescript
import { Codex } from "@openai/codex-sdk";

interface PublishConfig {
  topic: string;
  languages: string[];
  scheduledDate: string;
}

async function publishWorkflow(config: PublishConfig) {
  const codex = new Codex({
    sandboxMode: "workspace-write",
    approvalPolicy: "never",
  });

  console.log(`Starting publish workflow for: ${config.topic}`);

  // Phase 1: Research
  console.log("Phase 1: Research");
  const researchThread = codex.startThread();
  await researchThread.run(`
    Research topic: "${config.topic}"
    Use Brave Search MCP to gather:
    - Latest developments
    - Code examples
    - Best practices
    - Related resources
    Save research notes to .cache/research-${Date.now()}.md
  `);

  // Phase 2: Write (각 언어별)
  console.log("Phase 2: Writing");
  for (const lang of config.languages) {
    const writeThread = codex.startThread();
    await writeThread.run(`
      Write blog post about "${config.topic}" in ${lang}:
      1. Read research notes from .cache/
      2. Create engaging post following AGENTS.md guidelines
      3. Generate frontmatter with pubDate: '${config.scheduledDate}'
      4. Save to src/content/blog/${lang}/<slug>.md
    `);
    console.log(`  ✓ Written (${lang})`);
  }

  // Phase 3: Images
  console.log("Phase 3: Generating images");
  const imageThread = codex.startThread();
  await imageThread.run(`
    Generate hero image for "${config.topic}":
    1. Create appropriate image prompt
    2. Run: node generate_image.js src/assets/blog/<slug>-hero.jpg "<prompt>"
    3. Update all language versions with heroImage path
  `);

  // Phase 4: SEO
  console.log("Phase 4: SEO optimization");
  const seoThread = codex.startThread();
  await seoThread.run(`
    Optimize all ${config.languages.join(", ")} versions for SEO:
    - Verify title/description lengths
    - Add internal links
    - Check image alt attributes
  `);

  // Phase 5: Validation
  console.log("Phase 5: Validation");
  const validationThread = codex.startThread();
  await validationThread.run(`
    Validate all posts:
    1. Run npm run astro check
    2. Run npm run build
    3. Report any issues
  `);

  console.log("✓ Publish workflow complete!");
}

// 사용
publishWorkflow({
  topic: "Astro 5.0 Performance Improvements",
  languages: ["ko", "en", "ja"],
  scheduledDate: "2025-11-20",
}).catch(console.error);
```

### 예제 2: 스마트 코드 리뷰 봇

`.github/workflows/smart-review.yml`:
```yaml
name: Smart Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  code-review:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # 전체 히스토리

      - name: Get Changed Files
        id: changed-files
        uses: tj-actions/changed-files@v35

      - name: Smart Review
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: |
            Review this pull request:
            Changed files: ${{ steps.changed-files.outputs.all_changed_files }}

            Review criteria:
            1. Code quality and best practices
            2. TypeScript type safety
            3. Astro component patterns
            4. SEO considerations (for blog posts)
            5. Performance implications
            6. Accessibility (WCAG compliance)

            Provide:
            - Summary (2-3 sentences)
            - Strengths (bullet list)
            - Issues (bullet list with severity: high/medium/low)
            - Suggestions (actionable items)
          sandbox: read-only

      - name: Post Review Comment
        uses: actions/github-script@v6
        with:
          script: |
            // Codex 결과를 PR에 코멘트로 추가
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## 🤖 Smart Code Review\n\n${process.env.CODEX_RESULT}`
            });
```

## 베스트 프랙티스

### 1. 권한 최소화 원칙

```typescript
// ✓ Good: 읽기만 필요한 경우
const codex = new Codex({ sandboxMode: "read-only" });

// ✗ Bad: 불필요하게 높은 권한
const codex = new Codex({ sandboxMode: "danger-full-access" });
```

### 2. 명확한 작업 지시

```bash
# ✓ Good: 구체적이고 단계별
codex exec "
1. Read all blog posts in src/content/blog/ko/
2. Extract title and description from each
3. Calculate average title length
4. Report statistics in JSON format
"

# ✗ Bad: 모호함
codex exec "Analyze blog posts"
```

### 3. 에러 처리

```typescript
// TypeScript SDK
try {
  const result = await thread.run("Complex task");
  console.log("Success:", result);
} catch (error) {
  console.error("Failed:", error);
  // 대체 방법 또는 재시도
}

// Bash script
if ! codex exec "Task"; then
  echo "Task failed!"
  exit 1
fi
```

### 4. 타임아웃 설정

```typescript
const result = await thread.run("Long task", {
  timeout: 600000, // 10분
});
```

```bash
# Bash에서 timeout 명령 사용
timeout 600 codex exec "Long task"
```

### 5. 로깅 및 감사

```typescript
const thread = codex.startThread();

// 모든 이벤트 로깅
thread.on("*", (event) => {
  fs.appendFileSync(
    "codex-audit.log",
    `${new Date().toISOString()} ${JSON.stringify(event)}\n`
  );
});

await thread.run("Task");
```

### 6. CI/CD에서 실패 처리

```yaml
- name: Run Codex Task
  id: codex
  continue-on-error: true  # 실패해도 워크플로우 계속
  uses: openai/codex-action@v1
  with:
    task: "..."

- name: Handle Failure
  if: steps.codex.outcome == 'failure'
  run: |
    echo "Codex task failed, notifying team..."
    # Slack notification, etc.
```

### 7. 점진적 자동화

**Phase 1**: 수동 실행 (검증)
```bash
codex exec "Task"  # 결과 검토
```

**Phase 2**: 스크립트화
```bash
./scripts/automated-task.sh  # 로컬에서 테스트
```

**Phase 3**: CI/CD 통합
```yaml
# GitHub Actions에 추가 (수동 트리거)
on: workflow_dispatch
```

**Phase 4**: 완전 자동화
```yaml
# 자동 트리거 (push, schedule 등)
on:
  push:
  schedule:
```

## 마이그레이션 체크리스트

### Phase 1: 로컬 자동화 (2-3시간)

- [ ] 자주 실행하는 작업 식별 (타입 체크, 빌드, 테스트 등)
- [ ] `codex exec` 스크립트 작성 (3-5개)
- [ ] 로컬에서 테스트 및 검증
- [ ] 권한 수준 조정 (최소 권한 원칙)

### Phase 2: TypeScript SDK 통합 (3-4시간)

- [ ] `@openai/codex-sdk` 설치
- [ ] 복잡한 워크플로우를 TypeScript로 작성
- [ ] 에러 처리 및 로깅 추가
- [ ] `package.json` 스크립트 추가

### Phase 3: GitHub Actions (4-5시간)

- [ ] `OPENAI_API_KEY` 시크릿 추가
- [ ] 기본 Codex Action 워크플로우 생성
- [ ] Auto-fix 워크플로우 설정
- [ ] 스케줄 작업 (SEO audit 등) 추가

### Phase 4: 고급 자동화 (선택, 5-8시간)

- [ ] 스마트 코드 리뷰 봇 구현
- [ ] 자동 번역 파이프라인
- [ ] 콘텐츠 추천 자동 생성
- [ ] 성능 모니터링 및 알림

### Total: 약 14-20시간

## 다음 단계

자동화 설정이 완료되었습니다. 마지막 가이드를 참조하세요:

**[Complete Example](./05-complete-example.md)**: 전체 마이그레이션 종합 예제

---

**마지막 업데이트**: 2025-11-13
**이전 문서**: [03-agent-system.md](./03-agent-system.md)
**다음 문서**: [05-complete-example.md](./05-complete-example.md)
