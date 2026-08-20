# Generate Recommendations Command

Automatically generate intelligent content recommendations for all blog posts using the Content Recommender agent and Claude's semantic understanding.

## Description

This command analyzes all blog posts and generates a `recommendations.json` file containing semantically similar and complementary content suggestions. It leverages Claude's LLM capabilities to understand article meaning, difficulty level, technical stack, and contextual relationships.

**⚡ Performance Optimization**: This command now uses pre-computed metadata from `post-metadata.json` instead of analyzing full content, reducing token usage by 60-70% and execution time by 50%.

## Usage

```bash
/generate-recommendations [options]
```

## Options

- `--force`: Regenerate ALL recommendations, overwriting existing data (default: only process new/updated posts)
- `--language <ko|ja|en>`: Process specific language only (default: all languages)
- `--post <slug>`: Regenerate recommendations for a specific post only (e.g., "ko/chrome-devtools-mcp-performance")
- `--threshold <0.0-1.0>`: Minimum similarity threshold for recommendations (default: 0.3)
- `--count <n>`: Maximum number of recommendations per post (default: 5)
- `--explain`: Include detailed dimensional analysis in output (for debugging)

## Examples

```bash
# Generate recommendations for all new posts
/generate-recommendations

# Force regenerate everything
/generate-recommendations --force

# Process only Korean posts
/generate-recommendations --language ko

# Regenerate specific post with explanations
/generate-recommendations --post ko/ai-content-recommendation-system --explain

# Use stricter threshold (higher quality, fewer recommendations)
/generate-recommendations --threshold 0.5

# Get more recommendation candidates (still display top 3)
/generate-recommendations --count 8
```

## Implementation Instructions

### Step 1: Load Post Metadata

1. **Load pre-computed metadata from `post-metadata.json`**:
   ```typescript
   const metadataFile = await fs.readFile('post-metadata.json', 'utf-8');
   const postMetadata = JSON.parse(metadataFile).metadata;
   ```

2. **Fallback to Content Collections if metadata missing**:
   ```typescript
   // If post-metadata.json doesn't exist, show error and suggest running /analyze-posts
   if (!postMetadata) {
     throw new Error('post-metadata.json not found. Run /analyze-posts first.');
   }
   ```

3. Extract metadata for each post from postMetadata:
   - `slug`: Base post ID without language prefix (e.g., "post-name")
   - `language`: Language code (ko/ja/en)
   - `title`: Post title
   - `summary`: 200-character summary (from metadata)
   - `mainTopics`: 5 key topics (from metadata)
   - `techStack`: 5 technologies (from metadata)
   - `difficulty`: 1-5 difficulty level (from metadata)
   - `categoryScores`: Category relevance scores (from metadata)
   - `pubDate`: Publication date (critical for temporal filtering)

3. **Filter by options**:
   - If `--language` specified, filter posts by language
   - If `--post` specified, set that as the only source post but analyze against all candidates
   - **Important**: Use base slug (without language prefix) for recommendation keys

4. **CRITICAL: Temporal Filtering**:
   - Determine the **cutoff date** as: `max(sourcePost.pubDate, commandExecutionDate)`
   - For each source post, filter candidate posts to include ONLY those published BEFORE the cutoff date
   - This ensures:
     - If regenerating old posts: recommendations reflect what was available when originally written
     - If generating for new posts: recommendations include all posts up to today
   - **Example 1**: Source post published 2025-10-05, command run on 2025-10-12
     - Cutoff: 2025-10-12 (command date is later)
     - Include: posts with pubDate < 2025-10-12
   - **Example 2**: Source post published 2025-10-10, command run on 2025-10-08 (regenerating old post)
     - Cutoff: 2025-10-10 (source post date is later)
     - Include: posts with pubDate < 2025-10-10

5. **Load existing recommendations** (if `--force` not used):
   - Read `recommendations.json` if it exists
   - Identify posts that already have recommendations
   - Only process new or updated posts (compare `pubDate` with `generatedAt`)

### Step 2: Invoke Content Recommender Agent

For each source post to process:

**Prompt Template**:

```markdown
You are the Content Recommender agent. Analyze this blog post and recommend the most relevant related posts.

## Source Post

**Slug**: {sourcePost.slug} (base slug without language prefix)
**Language**: {sourcePost.language}
**Publication Date**: {sourcePost.pubDate}
**Title**: {sourcePost.title}
**Summary**: {sourcePost.summary}
**Main Topics**: {sourcePost.mainTopics.join(', ')}
**Tech Stack**: {sourcePost.techStack.join(', ')}
**Difficulty**: {sourcePost.difficulty}/5
**Category Scores**:
- Automation: {sourcePost.categoryScores.automation}
- Web Development: {sourcePost.categoryScores['web-development']}
- AI/ML: {sourcePost.categoryScores['ai-ml']}
- DevOps: {sourcePost.categoryScores.devops}
- Architecture: {sourcePost.categoryScores.architecture}

## Temporal Context

**Command Execution Date**: {commandExecutionDate.toISOString().split('T')[0]}
**Source Post Publication Date**: {sourcePost.pubDate.toISOString().split('T')[0]}
**Cutoff Date**: {cutoffDate.toISOString().split('T')[0]} (max of above two dates)

## Candidate Posts

Below are all blog posts published BEFORE {cutoffDate.toISOString().split('T')[0]} that you should consider for recommendations.

**IMPORTANT**: These candidates are already filtered by the cutoff date. Only recommend from this list.

{candidatePosts.map(post => `
### Candidate: {post.slug} (base slug)
- **Title**: {post.title}
- **Summary**: {post.summary}
- **Main Topics**: {post.mainTopics.join(', ')}
- **Tech Stack**: {post.techStack.join(', ')}
- **Difficulty**: {post.difficulty}/5
- **Language**: {post.language}
- **Published**: {post.pubDate}
- **Category Scores**: Automation {post.categoryScores.automation}, Web Dev {post.categoryScores['web-development']}, AI/ML {post.categoryScores['ai-ml']}, DevOps {post.categoryScores.devops}, Architecture {post.categoryScores.architecture}
`).join('\n')}

## Requirements

1. Analyze the source post against ALL candidate posts
2. **CRITICAL TEMPORAL CONSTRAINT**:
   - ALL candidate posts are already filtered to be published BEFORE the cutoff date (max of command execution date and source post publication date)
   - NEVER recommend a post that doesn't exist in the candidate list
   - This ensures temporal consistency while allowing new posts to include recent recommendations
3. Calculate similarity scores using the multi-dimensional framework with metadata:
   - **Topic Similarity (35%)**: Compare mainTopics arrays (exact matches and semantic similarity)
   - **Technical Stack (25%)**: Compare techStack arrays (shared technologies)
   - **Category Alignment (20%)**: Compare categoryScores (cosine similarity or weighted overlap)
   - **Difficulty Match (10%)**: Penalize large difficulty gaps (prefer ±1 level)
   - **Complementary Relationship (10%)**: Identify prerequisite/next-step relationships

4. Return the top {count} recommendations with:
   - Overall similarity score (0.0-1.0)
   - Clear reasoning in **ALL THREE LANGUAGES** (ko, ja, en)
   - Recommendation type classification
   - Dimensional breakdown scores

5. Apply filters:
   - Minimum threshold: {threshold}
   - Language preference: Prioritize same-language posts
   - Diversity: Mix different recommendation types

6. Output format: Valid JSON matching the schema in your agent definition
   - **IMPORTANT**: Use base slugs WITHOUT language prefix (e.g., "claude-code-web-automation" not "ko/claude-code-web-automation")

## Output

Return ONLY valid JSON in this exact format:

```json
{
  "sourceSlug": "{sourcePost.slug}",
  "recommendations": [
    {
      "slug": "claude-code-web-automation",
      "score": 0.92,
      "reason": {
        "ko": "두 글 모두 MCP 서버를 활용한 브라우저 자동화 워크플로우를 다루며, Chrome DevTools와 Playwright의 연계성을 보여줍니다.",
        "ja": "両記事ともMCPサーバーを活用したブラウザ自動化ワークフローを扱い、Chrome DevToolsとPlaywrightの連携を示しています。",
        "en": "Both posts cover MCP server-based browser automation workflows and demonstrate the integration between Chrome DevTools and Playwright."
      },
      "type": "similar-topic",
      "dimensions": {
        "topic": 0.95,
        "techStack": 0.89,
        "purpose": 0.88,
        "complementary": 0.75
      }
    }
  ]
}
```

NO markdown code fences, NO explanatory text—JUST the JSON.
```

### Step 3: Aggregate Results into recommendations.json

**Data Structure**:

```json
{
  "recommendations": {
    "post-slug": {
      "related": [
        {
          "slug": "related-post",
          "score": 0.92,
          "reason": {
            "ko": "두 글 모두 MCP 서버를 활용한 브라우저 자동화 워크플로우를 다룹니다.",
            "ja": "両記事ともMCPサーバーを活用したブラウザ自動化ワークフローを扱います。",
            "en": "Both posts cover MCP server-based browser automation workflows."
          },
          "type": "similar-topic"
        }
      ],
      "generatedAt": "2025-10-12T10:30:00Z",
      "evaluatedBy": "claude-sonnet-4.5"
    }
  },
  "metadata": {
    "totalPosts": 30,
    "lastGenerated": "2025-10-12T10:30:00Z",
    "modelVersion": "claude-sonnet-4.5",
    "minThreshold": 0.3,
    "maxRecommendations": 5,
    "generation": {
      "processedPosts": 30,
      "skippedPosts": 0,
      "averageRecommendations": 4.2,
      "totalDuration": "125s"
    }
  }
}
```

**Important Notes**:
- Keys use base slugs WITHOUT language prefix (e.g., "chrome-devtools-mcp-performance")
- Slug values also use base format (e.g., "claude-code-web-automation")
- Reason field contains all three language versions (ko, ja, en)
- Same recommendation data applies to all language versions of the post

### Step 4: Save and Report

1. **Write to file**:
   - Save to `recommendations.json` in project root
   - Use pretty printing (2-space indent) for readability
   - Ensure valid JSON format

2. **Git commit** (optional but recommended):
   ```bash
   git add recommendations.json
   git commit -m "chore: update content recommendations [auto-generated]"
   ```

3. **Output Summary**:
   ```
   ✅ Content Recommendations Generated

   📊 Statistics:
   - Total posts analyzed: 30
   - Recommendations generated: 142
   - Average recommendations per post: 4.7
   - Processing time: 2m 5s

   🎯 Quality Metrics:
   - Average similarity score: 0.68
   - High-quality matches (>0.8): 45
   - Medium matches (0.5-0.8): 78
   - Low matches (0.3-0.5): 19

   📁 Output:
   - File: recommendations.json (85KB)
   - Status: ✅ Committed to git

   🔄 Next Steps:
   1. Review recommendations: cat recommendations.json
   2. Test locally: npm run dev
   3. Build: npm run build
   ```

## Performance Optimization

### Metadata-based Processing (NEW)

**Token Usage Reduction**:

**Before (Content Preview)**:
- Source post: 100 + 250 tokens (metadata + 1000 char preview)
- 12 candidates × 350 tokens = 4,200 tokens
- Prompt overhead: 800 tokens
- **Total input: ~5,350 tokens per post**
- **13 posts: ~70,000 tokens**

**After (Metadata Only)**:
- Source post: 82 tokens (structured metadata)
- 12 candidates × 82 tokens = 984 tokens
- Prompt overhead: 500 tokens
- **Total input: ~1,566 tokens per post**
- **13 posts: ~20,000 tokens**

**Savings**: ~50,000 tokens (71% reduction) per full generation

### Incremental Updates (Default)

When `--force` is NOT used:

1. Load existing `recommendations.json`
2. For each post, check if:
   - Post exists in recommendations already
   - `post.updatedDate` (or `pubDate`) is newer than `recommendations[slug].generatedAt`
3. Only process posts that are new or updated
4. Merge new recommendations with existing ones

**Expected Time**:
- New post only: ~3-4 seconds (was ~5 seconds)
- 5 new posts: ~15-20 seconds (was ~25 seconds)
- Full regeneration (13 posts): ~45-60 seconds (was ~2 minutes)
- Full regeneration (30 posts): ~1.5-2 minutes (was ~5-7 minutes)

### Parallel Processing (Future Enhancement)

```typescript
// Process in batches of 3 posts simultaneously
const BATCH_SIZE = 3;
const batches = chunk(postsToProcess, BATCH_SIZE);

for (const batch of batches) {
  const results = await Promise.all(
    batch.map(post => generateRecommendationsForPost(post))
  );
  // Merge results
}
```

**Time Savings**: 2-3 minutes → 40-60 seconds

## Error Handling

### Invalid JSON from Agent

If the Content Recommender returns invalid JSON:
1. Log the raw response for debugging
2. Attempt to extract JSON from markdown code fences
3. If extraction fails, retry once
4. If still fails, skip that post and log error
5. Continue with remaining posts

### Missing Posts

If a recommended `slug` doesn't exist:
1. Log warning
2. Remove from recommendations
3. Continue processing

### Rate Limits

If hitting API rate limits:
1. Implement exponential backoff (1s, 2s, 4s, 8s)
2. Show progress indicator
3. Resume from last successful post

## Validation

Before saving `recommendations.json`:

1. **Schema Validation**:
   - All required fields present
   - Scores are numbers between 0.0 and 1.0
   - Types are valid enum values
   - Slugs match existing posts

2. **Quality Checks**:
   - No post recommends itself
   - No duplicate recommendations for same post
   - Recommendations are sorted by score (descending)
   - All slugs reference actual blog posts

3. **Temporal Consistency Checks** (CRITICAL):
   - For each source post, calculate cutoff date: `max(sourcePost.pubDate, commandExecutionDate)`
   - Verify ALL recommended posts have `pubDate` < cutoff date
   - Remove any recommendations that violate temporal constraint
   - Report violations as errors (should never happen if Step 1 filtering is correct)

4. **Report Issues**:
   ```
   ⚠️ Validation Warnings:
   - post-1: Recommended itself (removed)
   - post-2: Invalid slug "non-existent" (removed)
   - post-3: Duplicate recommendation (deduplicated)

   ❌ Temporal Violations (CRITICAL):
   - post-4: Recommended "post-5" (pub: 2025-10-15) but cutoff was 2025-10-12 (removed)
     Source: 2025-10-05, Command: 2025-10-12 → Cutoff: 2025-10-12
   ```

## Testing

After generating recommendations:

```bash
# 1. Verify JSON is valid
node -e "JSON.parse(require('fs').readFileSync('recommendations.json', 'utf-8'))"

# 2. Check file size
ls -lh recommendations.json

# 3. Preview a few recommendations
node -e "const r = require('./recommendations.json'); console.log(JSON.stringify(r.recommendations['ko/claude-code-best-practices'], null, 2))"

# 4. Test in Astro dev server
npm run dev
# Visit: http://localhost:4321/blog/ko/any-post
```

## Maintenance

### When to Regenerate

**Automatic triggers** (implement via Git hooks or CI/CD):
- New blog post published
- Existing post updated (`updatedDate` changed)
- Tags modified

**Manual triggers**:
- After content strategy changes
- To improve recommendation quality
- When adding new recommendation types

### Monitoring Recommendation Quality

Track these metrics over time:
1. **Click-Through Rate (CTR)**: % of readers clicking recommendations
2. **Session Depth**: Pages per session increase
3. **Time on Site**: Average session duration increase

**Target Metrics** (industry benchmarks):
- CTR: 18-25%
- Session depth: +30-50%
- Time on site: +40-60%

## Advanced Usage

### Custom Scoring Weights

Modify the Content Recommender agent to adjust weights:
- For tutorial-heavy blog: Increase `purposeAlignment` weight
- For tech-specific blog: Increase `techStack` weight
- For series content: Increase `complementary` weight

### A/B Testing

Generate two sets of recommendations:
```bash
# Variant A: LLM-based (current)
/generate-recommendations --force

# Variant B: Tag-based fallback
# (Implement alternative algorithm, save to recommendations-variant-b.json)
```

Track performance to validate LLM approach superiority.

## Troubleshooting

### "No recommendations generated"
- Check: Are there enough posts? (Need at least 4-5 for meaningful recommendations)
- Check: Is threshold too high? Try `--threshold 0.2`

### "All recommendations below threshold"
- Issue: Posts are too different from each other
- Solution: Diversify content or lower threshold

### "Processing too slow"
- Try: Process by language `--language ko`
- Try: Process specific post `--post ko/post-name`
- Future: Implement parallel processing

### "Agent returns invalid JSON"
- Check: Agent definition is correct
- Try: Add `--explain` to see full agent response
- Fix: Update agent prompt to emphasize JSON-only output

## Notes

- **Prerequisites**: Must run `/analyze-posts` first to generate `post-metadata.json`
- **Cost**: ~$0.02-0.03 per full generation (was ~$0.07-0.08) - 60-70% reduction
- **Frequency**: Run on each new post publish, or weekly for quality improvements
- **Caching**: Both `post-metadata.json` and `recommendations.json` should be committed to Git
- **Zero Runtime Cost**: Pre-computed recommendations mean no performance impact on readers
- **Workflow**: `/analyze-posts` (once or on content change) → `/generate-recommendations` (fast)

## Workflow Dependencies

This command is the **second step** in the V3 content recommendation system. Understanding the dependency chain is critical for proper execution.

### Execution Order

```mermaid
graph TD
    A[/analyze-posts] --> B[post-metadata.json]
    B --> C[/generate-recommendations<br/>THIS COMMAND]
    C --> D[relatedPosts in Frontmatter]
    D --> E[Astro Build]
    E --> F[RelatedPosts.astro Renders]
```

### Prerequisites

**CRITICAL - Must run /analyze-posts first**:

This command **REQUIRES** `post-metadata.json` to exist and contain valid metadata for all posts.

**Before running /generate-recommendations**:
```bash
# 1. Verify post-metadata.json exists
ls -lh post-metadata.json

# 2. Verify it contains metadata for your post
cat post-metadata.json | jq '.metadata["your-post-slug"]'

# 3. If missing, run analysis first:
/analyze-posts
```

**What /generate-recommendations requires from post-metadata.json**:
- `pubDate`: Publication date (for temporal filtering)
- `difficulty`: Difficulty rating 1-5 (20% of similarity score)
- `categoryScores`: 5 category scores (80% of similarity score)

**Error if prerequisite missing**:
```
❌ Error: post-metadata.json not found

This command requires post metadata to be generated first.

Run: /analyze-posts
Then retry: /generate-recommendations
```

### Data Flow

**V3 System Architecture**:
```
┌─────────────────────┐
│  /analyze-posts     │ ← ONE-TIME per post (or on content change)
└──────────┬──────────┘
           │ Produces
           ▼
┌─────────────────────┐
│ post-metadata.json  │ ← Committed to Git (3 fields per post)
│ - pubDate           │
│ - difficulty        │
│ - categoryScores    │
└──────────┬──────────┘
           │ Consumed by
           ▼
┌─────────────────────┐
│/generate-           │ ← FAST (metadata only, no full content)
│ recommendations     │
│ (THIS COMMAND)      │
└──────────┬──────────┘
           │ Produces
           ▼
┌─────────────────────┐
│ Post Frontmatter    │ ← Directly written to .md files
│ relatedPosts:       │
│   - slug            │
│   - score           │
│   - reason (ko/ja/en)│
└──────────┬──────────┘
           │ Consumed by
           ▼
┌─────────────────────┐
│ Astro Build Process │
└──────────┬──────────┘
           │ Renders
           ▼
┌─────────────────────┐
│ RelatedPosts.astro  │ ← Component in blog layout
└─────────────────────┘
```

### Workflow Integration

**Complete Workflow for New Post**:

1. **Create Post**: `/write-post "Topic"`
   - Generates 4 language versions (ko, ja, en, zh)
   - Creates markdown files with frontmatter

2. **Analyze Post** (first-time setup): `/analyze-posts --post new-post-slug`
   - Extracts metadata: difficulty, categoryScores, pubDate
   - Adds to `post-metadata.json`
   - **Cost**: ~$0.007 per post (one-time)

3. **Generate Recommendations** (this command): `/generate-recommendations`
   - Reads all metadata from `post-metadata.json`
   - Calculates similarity scores (difficulty 20% + categories 80%)
   - Writes `relatedPosts` to frontmatter of **all language versions**
   - **Cost**: ~$0.02 for all posts (60% cheaper than V2)

4. **Build**: `npm run build`
   - Astro processes frontmatter
   - RelatedPosts.astro renders recommendations
   - Zero runtime cost (pre-computed)

**Incremental Workflow** (daily usage):

```bash
# Only for new/updated posts
/analyze-posts                    # Analyzes changed posts only (~2-10s)
/generate-recommendations         # Updates all related posts (~20-40s)
npm run build                     # Deploy
```

### When to Run

**Run /generate-recommendations when**:
- ✅ After running `/analyze-posts` for new posts
- ✅ When improving recommendation quality
- ✅ After changing recommendation algorithm parameters
- ✅ Weekly/monthly to refresh recommendations with latest posts

**Skip /generate-recommendations when**:
- ❌ Making non-content changes (CSS, components)
- ❌ Fixing typos or minor edits (unless they affect topics/categories)
- ❌ Working on draft posts not yet published

### Performance Characteristics

**V3 vs V2 Comparison**:

| Metric | V2 (Full Content) | V3 (Metadata Only) | Improvement |
|--------|-------------------|---------------------|-------------|
| Token usage per run | ~70,000 | ~20,000 | **71% reduction** |
| Cost per run | $0.07-0.08 | $0.02-0.03 | **60-70% savings** |
| Execution time | 2-3 minutes | 45-60 seconds | **50% faster** |
| File I/O operations | High (read all .md) | Low (one JSON) | **100% reduction** |

**When to use --force**:
- After algorithm improvements
- Monthly quality refresh
- Fixing recommendation quality issues
- After bulk metadata updates

**When to use incremental** (default):
- Daily operations
- After new post publish
- After content updates

## Related Files

- **Prerequisite Command**: `.claude/commands/analyze-posts.md` ← **MUST RUN FIRST**
- **Metadata Agent**: `.claude/agents/post-analyzer.md`
- **Metadata File**: `post-metadata.json` ← **REQUIRED INPUT**
- **Recommender Agent**: `.claude/agents/content-recommender.md`
- **V3 Script**: `scripts/generate-recommendations-v3.js`
- **Component**: `src/components/RelatedPosts.astro`
- **Integration**: `src/layouts/BlogPost.astro`
- **Optimization Report**: `working_history/modify_recommendation.md`
- **V3 Documentation**: `research/post-recommendation-v3/README.md`
