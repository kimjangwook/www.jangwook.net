---
name: Trend Analyzer
description: Research current web trends in technology, frameworks, and best practices to inform content strategy. Use when analyzing trending topics or running /post-recommendation command.
allowed-tools: mcp__brave-search__brave_web_search, mcp__brave-search__brave_news_search, mcp__brave-search__brave_video_search, Bash, Write, Read
---

# Trend Analyzer

Specialized skill for researching current technology trends, popular frameworks, and emerging best practices using Brave Search API. Designed to minimize token consumption while maximizing trend insight quality.

## Core Capabilities

1. **Technology Trend Research**: Identify trending frameworks, libraries, and tools
2. **Content Popularity Analysis**: Find high-engagement topics and themes
3. **Emerging Best Practices**: Discover new methodologies and patterns
4. **Competitive Intelligence**: Analyze popular content in tech blogging
5. **Keyword Discovery**: Extract trending keywords and search terms

## Workflow

### Phase 1: Define Research Scope

Based on input parameters, determine search focus:

```typescript
interface ResearchScope {
  focus_areas: string[];        // ["automation", "web-development", "ai-ml", "devops", "architecture"]
  existing_topics: string[];    // Topics already covered (to avoid duplicates)
  existing_tech: string[];      // Tech stack already covered
  target_language: string;      // "ko" | "ja" | "en"
  search_depth: string;         // "quick" | "medium" | "thorough"
}
```

**Search Depth Settings**:

- **Quick** (5-8 searches, ~30s): High-level trends only
- **Medium** (10-15 searches, ~45-60s): Balanced coverage (recommended)
- **Thorough** (20-25 searches, ~90-120s): Comprehensive analysis

### Phase 2: Execute Trend Searches

**CRITICAL**: Implement 2-second delay between consecutive search requests using `sleep 2` bash command.

#### Category 1: Emerging Technologies

Search for new frameworks, libraries, and tools:

```bash
# AI/ML Trends
brave_web_search: "trending AI tools 2025"
sleep 2
brave_web_search: "LLM framework popularity 2025"
sleep 2

# Web Development Trends
brave_web_search: "popular JavaScript frameworks 2025"
sleep 2
brave_news_search: "React Next.js Astro trends"
sleep 2

# DevOps Trends
brave_web_search: "DevOps tools trending 2025"
sleep 2
brave_web_search: "container orchestration best practices"
sleep 2
```

**Search Parameters**:
```json
{
  "count": 10,
  "freshness": "pw",  // Past week for trends
  "safesearch": "moderate"
}
```

#### Category 2: Popular Content Topics

Identify high-engagement topics:

```bash
# Blog topic trends
brave_web_search: "popular tech blog topics 2025"
sleep 2
brave_web_search: "developer tutorial trending topics"
sleep 2

# Video content trends (for inspiration)
brave_video_search: "tech tutorial popular 2025"
sleep 2

# News trends
brave_news_search: "software development trending"
sleep 2
```

#### Category 3: Best Practices & Methodologies

Find emerging patterns:

```bash
# Architecture patterns
brave_web_search: "modern web architecture patterns 2025"
sleep 2
brave_web_search: "microservices best practices"
sleep 2

# Development practices
brave_web_search: "AI-assisted development workflow"
sleep 2
brave_web_search: "automated testing trends 2025"
sleep 2
```

#### Category 4: Keyword Research

Discover trending search terms:

```bash
# SEO keywords
brave_web_search: "site:dev.to popular tags 2025"
sleep 2
brave_web_search: "site:stackoverflow.com trending questions"
sleep 2

# Community discussions
brave_web_search: "site:reddit.com/r/webdev hot topics"
sleep 2
```

### Phase 3: Parse and Structure Results

Extract key information from search results:

**For Each Search Result**:

1. **Extract metadata**:
   - Title
   - URL
   - Description/snippet
   - Publication date
   - Source reliability score

2. **Identify trending topics**:
   - Extract mentioned technologies
   - Identify keywords and phrases
   - Note popularity indicators (upvotes, views, shares)

3. **Categorize content**:
   - Map to blog categories (automation, web-dev, ai-ml, devops, architecture)
   - Assign difficulty level (1-5)
   - Tag with relevant keywords

**Example Extraction**:

```typescript
interface TrendItem {
  topic: string;
  category: string;
  popularity_score: number;  // 0.0-1.0
  trend: "rising" | "stable" | "declining";
  sources: string[];
  keywords: string[];
  technologies: string[];
  difficulty_estimate: number;  // 1-5
  content_type: "tutorial" | "guide" | "analysis" | "news";
}
```

### Phase 4: Analyze Content Gaps

Compare trends with existing blog content:

```typescript
function analyzeGaps(trends: TrendItem[], existing: PostMetadata[]) {
  const gaps = [];

  for (const trend of trends) {
    // Check if topic already covered
    const covered = existing.some(post =>
      semanticSimilarity(trend.topic, post.mainTopics) > 0.7
    );

    if (!covered) {
      gaps.push({
        gap_type: "missing_topic",
        topic: trend.topic,
        opportunity_score: trend.popularity_score,
        reason: `Trending but not covered: ${trend.topic}`
      });
    }

    // Check technology coverage
    const techGaps = trend.technologies.filter(tech =>
      !existing.some(post => post.techStack.includes(tech))
    );

    if (techGaps.length > 0) {
      gaps.push({
        gap_type: "missing_technology",
        technologies: techGaps,
        opportunity_score: trend.popularity_score * 0.8,
        reason: `Trending tech not covered: ${techGaps.join(", ")}`
      });
    }
  }

  return gaps.sort((a, b) => b.opportunity_score - a.opportunity_score);
}
```

### Phase 5: Generate Structured Output

Return minimal, high-value data:

```json
{
  "trending_topics": [
    {
      "topic": "AI Code Review Automation",
      "category": "ai-ml",
      "popularity_score": 0.92,
      "trend": "rising",
      "sources": [
        "https://dev.to/ai-code-review-2025",
        "https://news.ycombinator.com/item?id=..."
      ],
      "keywords": ["AI", "code review", "automation", "GitHub Copilot"],
      "technologies": ["OpenAI", "Claude API", "GitHub Actions"],
      "difficulty_estimate": 3,
      "content_type": "tutorial",
      "seo_potential": 0.85
    }
  ],
  "emerging_technologies": [
    {
      "name": "Bun 1.0",
      "category": "web-development",
      "adoption_rate": "growing",
      "relevance_to_blog": 0.88,
      "use_cases": [
        "JavaScript runtime",
        "Package manager replacement",
        "Build tool optimization"
      ],
      "comparison_keywords": ["Bun vs Node", "Bun vs Deno"],
      "difficulty_to_cover": 2
    }
  ],
  "content_gaps": [
    {
      "gap_type": "missing_category",
      "category": "devops",
      "description": "Underrepresented in blog (only 15% of posts)",
      "opportunity_score": 0.78,
      "suggested_topics": [
        "Kubernetes best practices 2025",
        "CI/CD with GitHub Actions",
        "Docker multi-stage builds"
      ]
    },
    {
      "gap_type": "missing_technology",
      "technologies": ["Astro", "Bun", "Turbopack"],
      "description": "Trending but not covered",
      "opportunity_score": 0.85,
      "estimated_search_volume": "high"
    }
  ],
  "keyword_opportunities": [
    {
      "keyword": "AI coding assistant comparison",
      "search_intent": "informational",
      "competition": "medium",
      "relevance": 0.9,
      "suggested_angle": "Compare Claude Code vs GitHub Copilot vs Cursor"
    }
  ],
  "search_summary": {
    "total_searches": 15,
    "processing_time": "48s",
    "confidence_level": "high",
    "cache_until": "2025-01-16T10:00:00Z",  // 24 hours from now
    "sources_analyzed": 150
  }
}
```

## Token Optimization Strategies

### 1. Search Result Filtering

Only extract essential information:

```typescript
// ❌ BAD: Return full search results (high token cost)
return searchResults;  // 50,000+ tokens

// ✅ GOOD: Extract and compress (low token cost)
return {
  topic: extractTopicName(result.title),
  score: calculatePopularityScore(result),
  keywords: extractKeywords(result.description).slice(0, 5),
  url: result.url
};  // ~500 tokens
```

### 2. Deduplication

Remove redundant information:

```typescript
function deduplicateTopics(topics: TrendItem[]): TrendItem[] {
  const seen = new Set();
  return topics.filter(topic => {
    const key = topic.topic.toLowerCase().replace(/\s+/g, '-');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

### 3. Aggregation

Combine similar trends:

```typescript
function aggregateSimilarTopics(topics: TrendItem[]): TrendItem[] {
  const clusters = clusterBySemanticSimilarity(topics, threshold: 0.8);
  return clusters.map(cluster => ({
    topic: cluster[0].topic,  // Use most popular as representative
    popularity_score: average(cluster.map(t => t.popularity_score)),
    sources: cluster.flatMap(t => t.sources).slice(0, 3),
    keywords: unique(cluster.flatMap(t => t.keywords)).slice(0, 8)
  }));
}
```

### 4. Progressive Loading

Cache intermediate results:

```typescript
const cacheFile = '.cache/trend-data.json';

// Save after each category
await saveCategoryResults(category, results);

// Resume from cache if interrupted
const cachedResults = await loadCachedResults();
```

## Search Query Templates

### Technology Trends

```typescript
const techQueries = [
  "trending {category} tools 2025",
  "{category} framework popularity 2025",
  "best {category} libraries 2025",
  "{category} tools comparison 2025"
];
```

### Content Trends

```typescript
const contentQueries = [
  "popular {category} blog topics",
  "{category} tutorial trending",
  "most searched {category} questions",
  "site:dev.to {category} popular"
];
```

### Best Practice Trends

```typescript
const practiceQueries = [
  "{category} best practices 2025",
  "modern {category} architecture",
  "{category} optimization techniques",
  "{category} performance tips"
];
```

### Multi-Language Queries

```typescript
// Korean
const koQueries = [
  "인기있는 {category} 튜토리얼 2025",
  "{category} 트렌드 2025"
];

// Japanese
const jaQueries = [
  "人気の{category}チュートリアル 2025",
  "{category}トレンド 2025"
];

// English
const enQueries = [
  "popular {category} tutorials 2025",
  "{category} trends 2025"
];
```

## Quality Validation

Before returning results, validate:

### 1. Freshness Check

```typescript
function isFresh(date: string): boolean {
  const publishDate = new Date(date);
  const monthsOld = (Date.now() - publishDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
  return monthsOld < 6;  // Published within last 6 months
}
```

### 2. Source Reliability

```typescript
const reliableSources = [
  "github.com",
  "dev.to",
  "medium.com",
  "hackernoon.com",
  "css-tricks.com",
  "smashingmagazine.com",
  "stackoverflow.com",
  "official documentation sites"
];

function calculateSourceScore(url: string): number {
  for (const source of reliableSources) {
    if (url.includes(source)) return 0.9;
  }
  return 0.5;  // Unknown source
}
```

### 3. Relevance Scoring

```typescript
function calculateRelevance(
  trend: TrendItem,
  blogCategories: string[]
): number {
  const categoryMatch = blogCategories.includes(trend.category) ? 0.5 : 0;
  const keywordMatch = calculateKeywordOverlap(trend.keywords, blogTopics) * 0.3;
  const difficultyFit = isDifficultyAppropriate(trend.difficulty_estimate) ? 0.2 : 0;

  return categoryMatch + keywordMatch + difficultyFit;
}
```

## Error Handling

### Rate Limiting

If rate limited by Brave Search:

```typescript
let retryCount = 0;
const MAX_RETRIES = 3;

async function searchWithRetry(query: string) {
  try {
    return await brave_web_search({ query });
  } catch (error) {
    if (error.code === 'RATE_LIMIT' && retryCount < MAX_RETRIES) {
      retryCount++;
      await sleep(5000);  // Wait 5 seconds
      return searchWithRetry(query);
    }
    throw error;
  }
}
```

### No Results Found

```typescript
if (searchResults.length === 0) {
  console.warn(`No results for query: ${query}`);
  return {
    trending_topics: [],
    message: "No current trends found. Using cached data or falling back to content gap analysis."
  };
}
```

### Network Failures

```typescript
try {
  const trends = await performTrendAnalysis();
} catch (error) {
  console.error("Trend analysis failed:", error);
  return {
    trending_topics: [],
    content_gaps: analyzeGapsOnly(existingPosts),
    search_summary: {
      total_searches: 0,
      error: error.message,
      fallback_mode: "content_gap_analysis_only"
    }
  };
}
```

## Integration Examples

### Called by /post-recommendation

```typescript
// In post-recommendation command
const trendData = await invokeTrendAnalyzer({
  focus_areas: ["ai-ml", "web-development", "automation"],
  existing_topics: extractTopics(postMetadata),
  existing_tech: extractTechStack(postMetadata),
  target_language: "ko",
  search_depth: "medium"
});

// Use trend data to generate recommendations
const recommendations = generateRecommendations(postMetadata, trendData);
```

### Direct Invocation

```bash
# User wants to research trends manually
@trend-analyzer "AI automation tools 트렌드를 조사해주세요"
```

## Performance Metrics

### Token Usage

- **Input**: ~2,000 tokens (parameters + existing post metadata)
- **Processing**: ~12,000 tokens (web searches)
- **Output**: ~3,000 tokens (structured trend data)
- **Total**: ~17,000 tokens per run

**Comparison**: Direct search in main context would use 40,000+ tokens (58% savings)

### Execution Time

- **Quick**: 30 seconds (5-8 searches)
- **Medium**: 45-60 seconds (10-15 searches)
- **Thorough**: 90-120 seconds (20-25 searches)

### Cache Duration

- **Trend data**: 24 hours (trends change daily)
- **Technology data**: 7 days (frameworks change weekly)
- **Keyword data**: 48 hours (search patterns shift quickly)

## Best Practices

1. **Always implement 2-second delay** between search requests
2. **Cache results** for 24 hours to avoid redundant searches
3. **Filter by freshness** (preferably within last 6 months)
4. **Prioritize official sources** for technical accuracy
5. **Extract only essential data** to minimize token usage
6. **Deduplicate and aggregate** similar topics
7. **Validate relevance** before returning results

## Output File (Optional)

Save trend data for manual review:

```bash
# .cache/trend-data-{YYYY-MM-DD}.json
{
  "generated_at": "2025-01-15T10:30:00Z",
  "expires_at": "2025-01-16T10:30:00Z",
  "trending_topics": [...],
  "emerging_technologies": [...],
  "content_gaps": [...],
  "keyword_opportunities": [...]
}
```

## Notes

- **CRITICAL**: Always implement 2-second delay between consecutive Brave Search API calls
- Designed for efficiency: minimal token usage, maximal insight value
- Results are compressed and deduplicated for token optimization
- Cache aggressively to avoid redundant searches
- Prioritize recent content (published within last 6 months)
- Extract only actionable data (no full search result dumps)

## Related Files

- Command: `.claude/commands/post-recommendation.md`
- Agent: `.claude/agents/web-researcher.md`
- Cache: `.cache/trend-data.json`
