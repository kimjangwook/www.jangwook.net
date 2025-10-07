# Generate Recommendations Command

Automatically generate intelligent content recommendations for all blog posts using the Content Recommender agent and Claude's semantic understanding.

## Description

This command analyzes all blog posts and generates a `recommendations.json` file containing semantically similar and complementary content suggestions. It leverages Claude's LLM capabilities to understand article meaning, difficulty level, technical stack, and contextual relationships.

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

### Step 1: Collect All Blog Posts

1. Use Astro's `getCollection` to fetch all blog posts
2. Extract metadata for each post:
   - `slug`: Base post ID without language prefix (e.g., "post-name")
   - `fullId`: Full content ID with language (e.g., "ko/post-name") for getCollection
   - `title`: Post title
   - `description`: SEO description
   - `tags`: Tags array
   - `pubDate`: Publication date (critical for temporal filtering)
   - `updatedDate`: Last update date (optional)
   - `language`: Extracted from fullId (ko/ja/en)
   - `contentPreview`: First 1000 characters of markdown content

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
**Publication Date**: {sourcePost.pubDate.toISOString().split('T')[0]}
**Title**: {sourcePost.title}
**Description**: {sourcePost.description}
**Tags**: {sourcePost.tags.join(', ')}
**Content Preview** (first 1000 chars):
```
{sourcePost.contentPreview}
```

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
- **Description**: {post.description}
- **Tags**: {post.tags.join(', ')}
- **Language**: {post.language}
- **Published**: {post.pubDate.toISOString().split('T')[0]}
- **Content Preview**:
```
{post.contentPreview}
```
`).join('\n')}

## Requirements

1. Analyze the source post against ALL candidate posts
2. **CRITICAL TEMPORAL CONSTRAINT**:
   - ALL candidate posts are already filtered to be published BEFORE the cutoff date (max of command execution date and source post publication date)
   - NEVER recommend a post that doesn't exist in the candidate list
   - This ensures temporal consistency while allowing new posts to include recent recommendations
3. Calculate similarity scores using the multi-dimensional framework:
   - Topic Similarity (40%)
   - Technical Stack (25%)
   - Difficulty Match (15%)
   - Purpose Alignment (10%)
   - Complementary Relationship (10%)

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

### Incremental Updates (Default)

When `--force` is NOT used:

1. Load existing `recommendations.json`
2. For each post, check if:
   - Post exists in recommendations already
   - `post.updatedDate` (or `pubDate`) is newer than `recommendations[slug].generatedAt`
3. Only process posts that are new or updated
4. Merge new recommendations with existing ones

**Expected Time**:
- New post only: ~5 seconds
- 5 new posts: ~25 seconds
- Full regeneration (30 posts): ~2-3 minutes

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

- **Cost**: ~$0.01-0.05 per full generation (depends on post count and content length)
- **Frequency**: Run on each new post publish, or weekly for quality improvements
- **Caching**: `recommendations.json` should be committed to Git for build-time usage
- **Zero Runtime Cost**: Pre-computed recommendations mean no performance impact on readers

## Related Files

- Agent: `.claude/agents/content-recommender.md`
- Component: `src/components/RelatedPosts.astro`
- Output: `recommendations.json`
- Integration: `src/layouts/BlogPost.astro`
