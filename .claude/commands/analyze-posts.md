# Analyze Posts Command

Automatically analyze all blog posts and generate structured metadata for optimized content recommendation.

## Description

This command uses the Post Analyzer agent to extract meaningful metadata from blog posts, reducing token usage in the recommendation system by 60-70%. Metadata is stored in `post-metadata.json` and cached for reuse.

## Usage

```bash
/analyze-posts [options]
```

## Options

- `--force`: Regenerate ALL metadata, overwriting existing data (default: only process new/updated posts)
- `--post <slug>`: Analyze a specific post only (e.g., "llm-blog-automation")
- `--verify`: Verify existing metadata without regeneration

**Note**: The `--language` option has been deprecated. The command always analyzes Korean (ko) posts only, as content is identical across language versions.

## Examples

```bash
# Analyze all new or updated posts (incremental)
/analyze-posts

# Force regenerate all metadata
/analyze-posts --force

# Analyze a specific post
/analyze-posts --post llm-blog-automation

# Verify metadata integrity
/analyze-posts --verify
```

## Implementation Instructions

### Step 1: Collect Blog Posts

**IMPORTANT**: 포스트는 동일한 파일명(slug)의 경우 언어만 다르고 내용은 동일하므로, **한국어(ko) 포스트만 분석**합니다. 이는 불필요한 중복 분석을 방지하고 비용을 3배 절감합니다.

1. **Use Astro's Content Collections**:
   ```typescript
   import { getCollection } from 'astro:content';
   const allPosts = await getCollection('blog');
   // Filter to Korean posts only (content is identical across languages)
   const posts = allPosts.filter(post => post.id.startsWith('ko/'));
   ```

2. **Extract metadata for each post**:
   - `slug`: Base post ID without language prefix (e.g., "post-name")
   - `fullId`: Full content ID with language (e.g., "ko/post-name")
   - `title`: Post title
   - `description`: SEO description
   - `tags`: Tags array
   - `pubDate`: Publication date
   - `updatedDate`: Last update date (optional)
   - `language`: Extracted from fullId (ko/ja/en)
   - `content`: Full markdown content (via `post.body`)
   - `contentHash`: SHA-256 hash of content for change detection

3. **Filter by options**:
   - `--language` option is deprecated (always uses ko only)
   - If `--post` specified, analyze only that specific Korean post
   - Use content hash to skip unchanged posts (unless `--force`)

4. **Load existing metadata** (if not `--force`):
   ```typescript
   let existingMetadata = {};
   try {
     const data = await fs.readFile('post-metadata.json', 'utf-8');
     existingMetadata = JSON.parse(data).metadata;
   } catch (e) {
     // File doesn't exist yet, start fresh
   }
   ```

5. **Identify posts to process**:
   ```typescript
   const postsToAnalyze = posts.filter(post => {
     const existing = existingMetadata[post.slug];
     if (!existing) return true; // New post

     const currentHash = hashContent(post.body);
     return existing.contentHash !== currentHash; // Content changed
   });
   ```

### Step 2: Invoke Post Analyzer Agent

For each post to analyze:

**Prompt Template**:

```markdown
You are the Post Analyzer agent. Analyze this blog post and extract structured metadata.

## Post Information

**Slug**: {post.slug}
**Language**: {post.language}
**Publication Date**: {post.data.pubDate.toISOString().split('T')[0]}
**Title**: {post.data.title}
**Description**: {post.data.description}
**Tags**: {post.data.tags?.join(', ') || 'None'}

## Full Content

```markdown
{post.body}
```

## Requirements

1. Extract metadata following the Post Analyzer agent guidelines
2. Generate a 200-character summary in the post's language
3. Identify 5 main topics that capture the post's essence
4. List 5 specific technologies/frameworks used or discussed
5. Rate difficulty on 1-5 scale
6. Score relevance to 5 predefined categories (0.0-1.0)
7. Calculate content hash: {contentHash}

## Output

Return ONLY valid JSON in this exact format:

```json
{
  "slug": "{post.slug}",
  "language": "{post.language}",
  "pubDate": "{post.data.pubDate.toISOString().split('T')[0]}",
  "title": "{post.data.title}",
  "summary": "200자 이내의 핵심 요약...",
  "mainTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "techStack": ["tech1", "tech2", "tech3", "tech4", "tech5"],
  "difficulty": 3,
  "categoryScores": {
    "automation": 0.8,
    "web-development": 0.7,
    "ai-ml": 0.9,
    "devops": 0.5,
    "architecture": 0.6
  },
  "contentHash": "{contentHash}"
}
```

NO markdown code fences, NO explanatory text—JUST the JSON.
```

**IMPORTANT**:
- Read the full `post.body` content, not just a preview
- Pass the complete markdown to the agent for deep analysis
- This is a one-time cost that will optimize future recommendation generations

### Step 3: Aggregate and Save Metadata

**Data Structure** (`post-metadata.json`):

```json
{
  "metadata": {
    "post-slug": {
      "slug": "post-slug",
      "language": "ko",
      "pubDate": "2025-10-05",
      "title": "포스트 제목",
      "summary": "200자 이내의 핵심 요약...",
      "mainTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
      "techStack": ["tech1", "tech2", "tech3", "tech4", "tech5"],
      "difficulty": 3,
      "categoryScores": {
        "automation": 0.8,
        "web-development": 0.7,
        "ai-ml": 0.9,
        "devops": 0.5,
        "architecture": 0.6
      },
      "generatedAt": "2025-10-13T10:30:00Z",
      "contentHash": "sha256-hash"
    }
  },
  "version": "1.0",
  "lastUpdated": "2025-10-13T10:30:00Z",
  "generation": {
    "totalPosts": 13,
    "processedPosts": 13,
    "skippedPosts": 0,
    "totalDuration": "125s",
    "averageTimePerPost": "9.6s"
  }
}
```

**Important Notes**:
- Keys use base slugs WITHOUT language prefix (e.g., "chrome-devtools-mcp-performance")
- Metadata for different language versions is stored separately (each has its own slug)
- Content hash is used to detect changes (SHA-256 of post.body)
- Generation timestamp tracks when metadata was created

### Step 4: Validation

Before saving, validate metadata:

1. **Schema Validation**:
   - All required fields present
   - Summary under 200 characters
   - Exactly 5 main topics and 5 tech stack items
   - Difficulty between 1-5
   - Category scores between 0.0-1.0
   - Valid content hash

2. **Quality Checks**:
   - Summary is meaningful (not just repeating title)
   - Main topics are specific (not generic terms like "programming")
   - Tech stack contains actual technologies (not "tools", "software")
   - Category scores sum to reasonable total (typically 2.5-4.5)

3. **Report Issues**:
   ```
   ⚠️ Validation Warnings:
   - post-1: Summary exceeds 200 characters (truncated)
   - post-2: Generic main topic "programming" (kept, but review recommended)
   - post-3: Category scores sum to 5.2 (unusually high, verify)
   ```

### Step 5: Save and Report

1. **Write to file**:
   ```typescript
   await fs.writeFile(
     'post-metadata.json',
     JSON.stringify(metadata, null, 2),
     'utf-8'
   );
   ```

2. **Git commit** (optional but recommended):
   ```bash
   git add post-metadata.json
   git commit -m "chore: update post metadata [auto-generated]"
   ```

3. **Output Summary**:
   ```
   ✅ Post Metadata Generated

   📊 Statistics:
   - Total posts: 13
   - Processed: 5 (new or updated)
   - Skipped: 8 (unchanged)
   - Processing time: 48s

   🎯 Quality Metrics:
   - Average difficulty: 3.2
   - Most common category: AI/ML (avg score 0.82)
   - Validation passed: 5/5

   📁 Output:
   - File: post-metadata.json (45KB)
   - Status: ✅ Saved

   💡 Next Steps:
   1. Review metadata: cat post-metadata.json | jq '.metadata'
   2. Generate recommendations: /generate-recommendations
   3. Build: npm run build
   ```

## Performance Optimization

### Incremental Updates (Default)

When `--force` is NOT used:

1. Load existing `post-metadata.json`
2. For each post, check content hash
3. Only process posts with changed content or new posts
4. Merge new metadata with existing

**Expected Time** (Korean posts only):
- New post only: ~8-12 seconds
- 5 new posts: ~50 seconds
- Full regeneration (13 unique posts): ~2 minutes

### Parallel Processing (Future Enhancement)

```typescript
// Process in batches of 3 posts simultaneously
const BATCH_SIZE = 3;
const batches = chunk(postsToAnalyze, BATCH_SIZE);

for (const batch of batches) {
  const results = await Promise.all(
    batch.map(post => analyzePost(post))
  );
  // Merge results
}
```

**Time Savings**: 2 minutes → 45-60 seconds

## Error Handling

### Invalid JSON from Agent

If the Post Analyzer returns invalid JSON:
1. Log the raw response for debugging
2. Attempt to extract JSON from markdown code fences
3. If extraction fails, retry once with emphasized instructions
4. If still fails, skip that post and log error
5. Continue with remaining posts

### Missing or Corrupted Metadata File

If `post-metadata.json` is missing or corrupted:
1. Start fresh (treat as `--force`)
2. Analyze all posts
3. Generate new metadata file

### Content Hash Mismatch

If content hash changes but metadata seems unchanged:
1. Log warning about potential false positive
2. Regenerate metadata (conservative approach)
3. Update hash in stored metadata

## Content Hash Calculation

```typescript
import crypto from 'crypto';

function hashContent(content: string): string {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
    .substring(0, 16); // First 16 chars for brevity
}
```

## Testing

After generating metadata:

```bash
# 1. Verify JSON is valid
node -e "JSON.parse(require('fs').readFileSync('post-metadata.json', 'utf-8'))"

# 2. Check file size
ls -lh post-metadata.json

# 3. Preview metadata for a post
node -e "const m = require('./post-metadata.json'); console.log(JSON.stringify(m.metadata['llm-blog-automation'], null, 2))"

# 4. Validate schema
npm run validate-metadata # (if implemented)
```

## Maintenance

### When to Regenerate

**Automatic triggers** (implement via Git hooks or manual):
- New blog post published
- Existing post updated (content changed)
- Tags modified significantly

**Manual triggers**:
- After improving Post Analyzer agent prompt
- To improve metadata quality
- When adding new category types

### Monitoring Metadata Quality

Track these metrics:
1. **Summary Quality**: Are summaries informative and concise?
2. **Topic Relevance**: Do main topics accurately represent the post?
3. **Tech Stack Accuracy**: Are listed technologies actually used in the post?
4. **Category Balance**: Are category scores distributed reasonably?

**Periodic Review** (monthly):
- Sample 5-10 posts manually
- Compare generated metadata with expected results
- Refine Post Analyzer agent if needed

## Integration with Recommendation System

After generating metadata:

1. **Update generate-recommendations command**:
   - Load `post-metadata.json` instead of reading full content
   - Pass only metadata to Content Recommender agent
   - Reduce token usage by 60-70%

2. **Build time**: Metadata file is committed to Git
3. **Runtime**: No performance impact (metadata pre-computed)

## Cost Analysis

**One-time metadata generation** (Korean posts only):
- 13 unique posts × 7,000 tokens/post = 91,000 tokens
- Cost: ~$0.09 (Claude Sonnet 3.5)
- Note: 3x cost reduction by analyzing only Korean posts (content identical across languages)

**Savings per recommendation generation**:
- Before: 78,000 tokens (full content)
- After: 28,600 tokens (metadata only)
- Savings: 49,400 tokens (~$0.49 per run)

**Break-even**: After 2 recommendation runs
**Ongoing savings**: ~$0.49 per recommendation generation

## Troubleshooting

### "Agent returned invalid JSON"
- Check: Agent definition is correct
- Try: Add `--verify` to see raw responses
- Fix: Update agent prompt to emphasize JSON-only output

### "Content hash mismatch on every run"
- Issue: Line endings or whitespace differences
- Solution: Normalize content before hashing
- Fix: Use `content.trim().replace(/\r\n/g, '\n')`

### "Processing too slow"
- Try: Process specific post `--post post-name`
- Future: Implement parallel processing (already optimized by processing only ko posts)

## Notes

- **Cost**: ~$0.09 for initial generation, $0.49 saved per recommendation run
- **Frequency**: Run on new post publish or content update
- **Caching**: `post-metadata.json` should be committed to Git
- **Zero Runtime Cost**: Pre-computed metadata means no impact on build time

## Related Files

- Agent: `.claude/agents/post-analyzer.md`
- Output: `post-metadata.json`
- Integration: `.claude/commands/generate-recommendations.md`
- Optimization Report: `working_history/modify_recommendation.md`
