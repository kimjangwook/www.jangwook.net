# Trend Analyzer Search Templates

This file contains optimized search query templates for different trend research scenarios.

## Category-Specific Templates

### AI/ML Trends

```
# General
- "trending AI tools 2025"
- "LLM framework popularity 2025"
- "AI agent development best practices"
- "machine learning automation 2025"

# Korean
- "인기 AI 도구 2025"
- "LLM 프레임워크 트렌드"
- "AI 에이전트 개발"

# Japanese
- "人気AIツール 2025"
- "LLMフレームワーク トレンド"
- "AIエージェント開発"
```

### Web Development Trends

```
# General
- "popular JavaScript frameworks 2025"
- "frontend development trends"
- "React vs Next.js vs Astro 2025"
- "web performance optimization 2025"

# Korean
- "인기 자바스크립트 프레임워크 2025"
- "프론트엔드 개발 트렌드"
- "웹 성능 최적화"

# Japanese
- "人気JavaScriptフレームワーク 2025"
- "フロントエンド開発トレンド"
- "Web パフォーマンス最適化"
```

### DevOps Trends

```
# General
- "DevOps tools trending 2025"
- "Kubernetes best practices 2025"
- "CI/CD pipeline optimization"
- "container orchestration trends"

# Korean
- "DevOps 도구 트렌드 2025"
- "쿠버네티스 베스트 프랙티스"
- "CI/CD 파이프라인"

# Japanese
- "DevOpsツール トレンド 2025"
- "Kubernetes ベストプラクティス"
- "CI/CDパイプライン"
```

### Automation Trends

```
# General
- "workflow automation tools 2025"
- "API automation best practices"
- "test automation frameworks 2025"
- "developer productivity tools"

# Korean
- "워크플로우 자동화 2025"
- "API 자동화"
- "테스트 자동화 프레임워크"

# Japanese
- "ワークフロー自動化 2025"
- "API自動化"
- "テスト自動化フレームワーク"
```

### Architecture Trends

```
# General
- "software architecture patterns 2025"
- "microservices best practices"
- "system design trends 2025"
- "serverless architecture"

# Korean
- "소프트웨어 아키텍처 패턴 2025"
- "마이크로서비스 베스트 프랙티스"
- "시스템 설계 트렌드"

# Japanese
- "ソフトウェアアーキテクチャパターン 2025"
- "マイクロサービス ベストプラクティス"
- "システム設計トレンド"
```

## Platform-Specific Templates

### Dev.to

```
- "site:dev.to trending tags 2025"
- "site:dev.to {category} popular"
- "site:dev.to most read articles"
```

### Stack Overflow

```
- "site:stackoverflow.com {category} trending questions"
- "site:stackoverflow.com newest {technology}"
- "site:stackoverflow.com most voted {topic}"
```

### Reddit

```
- "site:reddit.com/r/webdev hot topics"
- "site:reddit.com/r/reactjs trending"
- "site:reddit.com/r/programming popular"
```

### GitHub

```
- "site:github.com trending {language}"
- "site:github.com {framework} awesome list"
- "site:github.com most starred {category}"
```

## Temporal Templates

### Current Week

```
- "{topic} trends this week"
- "latest {technology} updates"
- "what's new in {category}"
```

### Current Month

```
- "{topic} trending this month"
- "{technology} January 2025"
- "new {category} tools 2025"
```

### Past Quarter

```
- "{topic} Q1 2025 trends"
- "{technology} updates 2025"
- "best {category} tools 2025"
```

## Content Type Templates

### Tutorials

```
- "popular {topic} tutorial 2025"
- "learn {technology} guide"
- "{framework} getting started"
```

### Comparisons

```
- "{tech1} vs {tech2} 2025"
- "best {category} tools comparison"
- "{framework} alternatives"
```

### Best Practices

```
- "{topic} best practices 2025"
- "{technology} optimization tips"
- "how to {task} efficiently"
```

## SEO-Focused Templates

### High Search Volume

```
- "how to {task}"
- "{topic} tutorial"
- "what is {technology}"
- "{framework} example"
```

### Long-tail Keywords

```
- "{technology} for {use case}"
- "how to optimize {specific task}"
- "{framework} vs {alternative} for {scenario}"
```

### Question-Based

```
- "why use {technology}"
- "when to use {pattern}"
- "should I learn {framework}"
```

## Advanced Search Operators

### Date Range

```
- "{query} after:2024-01-01"
- "{query} before:2025-12-31"
```

### Exact Match

```
- "\"{exact phrase}\""
```

### Exclude Terms

```
- "{query} -deprecated"
- "{query} -outdated"
```

### File Type

```
- "{query} filetype:pdf"
- "{query} filetype:md"
```

## Usage Example

```typescript
// Select template based on category
const category = "ai-ml";
const templates = getTrendTemplates(category);

// Execute searches with 2-second delay
for (const template of templates) {
  const query = template.replace("{year}", "2025");
  const results = await brave_web_search({ query, freshness: "pm" });
  await sleep(2000);  // CRITICAL: 2-second delay
  processResults(results);
}
```
