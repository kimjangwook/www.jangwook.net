# Post Recommendation Command

## Description

Analyzes existing blog posts and current web trends to recommend 10 next blog post topics that align with your content strategy and audience interests. Uses AI-powered trend analysis and semantic understanding to suggest high-impact content ideas.

## Usage

```bash
/post-recommendation [options]
```

## Options

- `--count <number>`: Number of recommendations to generate (default: 10, max: 20)
- `--category <name>`: Focus on specific category (automation, web-development, ai-ml, devops, architecture)
- `--difficulty <level>`: Target difficulty level (1-5)
- `--language <code>`: Output language for recommendations (ko, ja, en, default: ko)

## Examples

```bash
# Generate 10 topic recommendations (default)
/post-recommendation

# Generate 15 recommendations focused on AI/ML
/post-recommendation --count 15 --category ai-ml

# Generate intermediate-level web development topics
/post-recommendation --difficulty 3 --category web-development

# Generate recommendations in English
/post-recommendation --language en
```

## Implementation Instructions

### Step 1: Load Post Metadata

Read `post-metadata.json` to understand existing content:

```typescript
import fs from 'fs/promises';

const metadataFile = await fs.readFile('post-metadata.json', 'utf-8');
const postMetadata = JSON.parse(metadataFile);
```

**Extract**:
- Existing topics and themes (from mainTopics)
- Technology coverage (from techStack)
- Category distribution (from categoryScores)
- Difficulty level spread
- Publication frequency

**Analyze Gaps**:
- Underrepresented categories (low total scores)
- Missing tech stack coverage
- Difficulty imbalances (too many beginner or expert posts)
- Topic clusters that could be expanded

### Step 2: Invoke Trend Analyzer Skill

**IMPORTANT**: This step uses the `trend-analyzer` skill to research current web trends efficiently while minimizing context consumption.

**Skill Invocation**:

```bash
# Activate trend-analyzer skill
@trend-analyzer
```

The skill will automatically:
1. Research current trending topics in tech (AI/ML, web dev, DevOps, etc.)
2. Identify popular frameworks, libraries, and tools
3. Find emerging best practices and methodologies
4. Discover high-engagement content themes
5. Return structured trend data with minimal token usage

**Skill Input Parameters** (passed via context):

```json
{
  "focus_areas": ["automation", "web-development", "ai-ml", "devops", "architecture"],
  "existing_topics": [...], // From post-metadata.json mainTopics
  "existing_tech": [...],   // From post-metadata.json techStack
  "target_language": "ko",  // Or ja, en based on --language option
  "search_depth": "medium"  // Balance between thoroughness and speed
}
```

**Expected Skill Output**:

```json
{
  "trending_topics": [
    {
      "topic": "Topic Name",
      "category": "ai-ml",
      "popularity_score": 0.85,
      "trend": "rising",
      "sources": ["url1", "url2"],
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "emerging_technologies": [
    {
      "name": "Technology Name",
      "adoption_rate": "growing",
      "relevance_to_blog": 0.8,
      "use_cases": ["use case 1", "use case 2"]
    }
  ],
  "content_gaps": [
    {
      "gap_type": "missing_category",
      "description": "Description of gap",
      "opportunity_score": 0.9
    }
  ],
  "search_summary": {
    "total_searches": 15,
    "processing_time": "45s",
    "confidence_level": "high"
  }
}
```

**Token Optimization**:
- Skill handles all web searches internally
- Returns only essential trend data (not full search results)
- Estimated token savings: 70-80% vs. direct search in main context

### Step 3: Generate Topic Recommendations

Combine post metadata analysis with trend data to generate recommendations.

**Recommendation Criteria**:

1. **Relevance** (0.0-1.0):
   - Aligns with trending topics (0.4 weight)
   - Fills content gaps (0.3 weight)
   - Matches blog expertise areas (0.3 weight)

2. **Impact Potential** (0.0-1.0):
   - SEO opportunity (0.3 weight)
   - Audience interest (0.4 weight)
   - Uniqueness (0.3 weight)

3. **Feasibility** (0.0-1.0):
   - Information availability (0.4 weight)
   - Writing complexity (0.3 weight)
   - Time to research (0.3 weight)

**Scoring Logic**:

```typescript
function calculateTopicScore(topic, metadata, trends) {
  const relevance =
    (topic.trendScore * 0.4) +
    (topic.gapFillingScore * 0.3) +
    (topic.expertiseMatchScore * 0.3);

  const impact =
    (topic.seoScore * 0.3) +
    (topic.audienceInterestScore * 0.4) +
    (topic.uniquenessScore * 0.3);

  const feasibility =
    (topic.infoAvailabilityScore * 0.4) +
    (topic.writingComplexityScore * 0.3) +
    (topic.researchTimeScore * 0.3);

  return (relevance + impact + feasibility) / 3;
}
```

**Diversity Enforcement**:
- Ensure recommendations span multiple categories
- Balance difficulty levels
- Mix evergreen and trending topics
- Avoid clustering in single tech stack

### Step 4: Use Content Planner Agent for Strategic Refinement

**Agent Delegation**:

```bash
@content-planner "[Provide trend data and candidate topics for strategic refinement]"
```

**Agent Input**:
- Top 20 candidate topics (ranked by score)
- Trend analysis summary
- Content gap analysis
- Category distribution goals

**Agent Output**:
- Refined list of 10 topics
- Strategic rationale for each
- Suggested publication order
- SEO keyword suggestions

**Integration Pattern**:

```typescript
const candidateTopics = generateCandidateTopics(metadata, trends);
const refinedTopics = await contentPlannerAgent.refine({
  candidates: candidateTopics.slice(0, 20),
  trends: trendData,
  gaps: contentGaps,
  constraints: {
    count: options.count || 10,
    category: options.category,
    difficulty: options.difficulty
  }
});
```

### Step 5: Format and Output Recommendations

**Output Structure**:

```markdown
# 📊 블로그 포스트 추천 (생성일: YYYY-MM-DD)

## 📈 콘텐츠 현황 분석

**기존 포스트**: {totalPosts}개
**카테고리 분포**:
- Automation: {count}개 (평균 점수: {avgScore})
- Web Development: {count}개 (평균 점수: {avgScore})
- AI/ML: {count}개 (평균 점수: {avgScore})
- DevOps: {count}개 (평균 점수: {avgScore})
- Architecture: {count}개 (평균 점수: {avgScore})

**난이도 분포**:
- Level 1-2 (초급): {count}개
- Level 3 (중급): {count}개
- Level 4-5 (고급): {count}개

**최근 트렌드**: {top 3 trending topics}

---

## 🎯 추천 주제 (우선순위 순)

### 1. {Topic Title}

**카테고리**: {category}
**예상 난이도**: {difficulty}/5
**추천 이유**:
- 현재 {trend percentage}% 증가 중인 트렌드
- {specific gap} 콘텐츠 갭 해소
- SEO 기회: {keyword} 검색량 증가

**주요 키워드**: {keyword1}, {keyword2}, {keyword3}
**예상 기술 스택**: {tech1}, {tech2}, {tech3}

**콘텐츠 개요**:
{2-3 sentence description of potential content}

**참고 자료**:
- {source1}
- {source2}

**예상 작성 시간**: {hours}시간
**SEO 잠재력**: ⭐️⭐️⭐️⭐️ (4/5)

---

### 2. {Next Topic}
...

---

## 💡 추가 인사이트

### 트렌드 요약
{Summary of current trends and how they relate to blog strategy}

### 콘텐츠 전략 제안
1. {Strategic recommendation 1}
2. {Strategic recommendation 2}
3. {Strategic recommendation 3}

### 주의사항
- {Important consideration 1}
- {Important consideration 2}

---

## 📅 제안 발행 일정

| 순위 | 주제 | 카테고리 | 난이도 | 제안 발행일 |
|------|------|----------|--------|-------------|
| 1    | ... | ... | ... | {date} |
| 2    | ... | ... | ... | {date} |

*발행일은 주 1회 게시 기준으로 산정*

---

## 🔍 생성 정보

- **분석 대상**: {totalPosts}개 포스트
- **트렌드 검색**: {searchCount}회
- **처리 시간**: {duration}
- **신뢰도**: {confidence level}

```

### Step 6: Save Recommendations (Optional)

**Output File**: `content-recommendations-{YYYY-MM-DD}.md`

```typescript
const filename = `content-recommendations-${new Date().toISOString().split('T')[0]}.md`;
await fs.writeFile(filename, recommendationsMarkdown, 'utf-8');
```

**Git Tracking** (optional):
```bash
git add content-recommendations-*.md
git commit -m "chore: generate content recommendations [auto]"
```

## Workflow Summary

```mermaid
graph TB
    Start[/post-recommendation command] --> LoadMeta[Load post-metadata.json]
    LoadMeta --> AnalyzeGaps[Analyze content gaps]
    AnalyzeGaps --> InvokeTrend[Invoke trend-analyzer skill]
    InvokeTrend --> SearchWeb[Web trend research]
    SearchWeb --> TrendData[Return trend data]
    TrendData --> GenCandidates[Generate candidate topics]
    GenCandidates --> ScoreTopics[Score and rank topics]
    ScoreTopics --> InvokePlanner[Invoke content-planner agent]
    InvokePlanner --> RefinedTopics[Refine top 10 topics]
    RefinedTopics --> FormatOutput[Format markdown output]
    FormatOutput --> Display[Display to user]
    FormatOutput --> SaveFile[Save to file]
    SaveFile --> End[Done]
```

## Performance Optimization

### Token Usage Targets

- **Post Metadata Loading**: ~5,000 tokens (reads compressed metadata, not full posts)
- **Trend Analyzer Skill**: ~15,000 tokens (handles web searches internally)
- **Content Planner Agent**: ~8,000 tokens (receives pre-processed data)
- **Output Formatting**: ~3,000 tokens

**Total Estimated**: ~31,000 tokens per run
**Comparison**: Direct approach would use ~80,000+ tokens (60% savings)

### Execution Time

- Load metadata: ~1s
- Trend analysis (skill): ~45-60s (handles 12-15 web searches)
- Topic generation: ~5s
- Content planning: ~15-20s
- Output formatting: ~2s

**Total**: ~70-90 seconds

### Caching Strategy

**Cache trend data** for 24 hours:
```typescript
const cacheFile = '.cache/trend-data.json';
const cacheAge = Date.now() - fs.statSync(cacheFile).mtimeMs;
if (cacheAge < 24 * 60 * 60 * 1000) {
  // Use cached trend data
  trendData = JSON.parse(await fs.readFile(cacheFile, 'utf-8'));
} else {
  // Refresh trend data
  trendData = await trendAnalyzerSkill.analyze();
  await fs.writeFile(cacheFile, JSON.stringify(trendData), 'utf-8');
}
```

## Error Handling

### Missing post-metadata.json

```
❌ Error: post-metadata.json not found
💡 Solution: Run /analyze-posts first to generate metadata
```

### Trend Analysis Failure

```
⚠️ Warning: Unable to fetch current trends
📊 Falling back to content gap analysis only
```

### Agent Timeout

```
⚠️ Warning: Content planner timed out
✅ Using direct scoring algorithm for topic ranking
```

## Quality Checks

Before finalizing recommendations:

1. **Diversity Check**: Ensure topics span at least 3 categories
2. **Difficulty Balance**: Mix of 40% intermediate, 30% beginner, 30% advanced
3. **Originality**: No topic too similar to existing posts (>70% semantic overlap)
4. **Feasibility**: All topics have sufficient online resources
5. **Trend Validation**: At least 50% of topics align with current trends

## Integration with Other Commands

### Create Post from Recommendation

After generating recommendations, easily create a post:

```bash
# 1. Generate recommendations
/post-recommendation

# 2. Choose a topic and create post
/write-post "Recommended Topic Title" --tags keyword1,keyword2,keyword3
```

### Analyze After Publishing

After publishing new posts:

```bash
# 1. Publish posts and update metadata
/analyze-posts

# 2. Regenerate recommendations with updated context
/post-recommendation
```

## Advanced Usage

### Seasonal Content Planning

```bash
# Q1 2025 (Jan-Mar): Focus on year-end reviews, new year trends
/post-recommendation --category ai-ml

# Q2 2025 (Apr-Jun): Focus on emerging technologies
/post-recommendation --difficulty 4

# Q3 2025 (Jul-Sep): Focus on practical tutorials
/post-recommendation --difficulty 2-3

# Q4 2025 (Oct-Dec): Focus on advanced topics, year-end summaries
/post-recommendation --category architecture --difficulty 4-5
```

### Category-Specific Planning

```bash
# Build out AI/ML content pillar
/post-recommendation --category ai-ml --count 15

# Strengthen DevOps coverage
/post-recommendation --category devops --count 10
```

## Maintenance

### Weekly Review

Run weekly to stay aligned with trends:
```bash
# Every Monday
/post-recommendation
```

### Monthly Deep Analysis

Monthly comprehensive review:
```bash
# First day of month
/analyze-posts --force
/post-recommendation --count 20
```

### Quarterly Strategy

Quarterly strategic planning:
```bash
# Review all categories
for category in automation web-development ai-ml devops architecture; do
  /post-recommendation --category $category --count 5
done
```

## Notes

- **Context Efficiency**: Uses skills and agents to minimize token consumption
- **Trend Accuracy**: Web searches are performed by specialized skill
- **Strategic Alignment**: Content planner ensures recommendations match blog strategy
- **Actionable Output**: Each recommendation includes enough detail to start writing immediately
- **Flexible**: Options allow customization for different content strategies
- **Automated**: Can be integrated into CI/CD or scheduled tasks

## Related Files

- Skill: `.claude/skills/trend-analyzer/SKILL.md`
- Agent: `.claude/agents/content-planner.md`
- Input: `post-metadata.json`
- Output: `content-recommendations-{date}.md`
- Cache: `.cache/trend-data.json`

## Troubleshooting

### "No trends found"

- **Issue**: Brave Search returned no results
- **Solution**: Check internet connection, verify Brave Search API key
- **Fallback**: Use content gap analysis only

### "All recommendations too similar to existing posts"

- **Issue**: Blog has comprehensive coverage
- **Solution**:
  - Try `--difficulty 5` for expert-level topics
  - Focus on emerging technologies
  - Consider cross-category hybrid topics

### "Token usage too high"

- **Issue**: Exceeding token budget
- **Solution**:
  - Enable trend data caching (24-hour TTL)
  - Reduce `--count` to 5-8 topics
  - Use `--category` to narrow scope

## Future Enhancements

- [ ] Audience persona-based recommendations
- [ ] Competitor content analysis integration
- [ ] Historical performance-based scoring
- [ ] Multi-language trend analysis
- [ ] Automated A/B testing suggestions
- [ ] Social media trend integration
- [ ] Keyword difficulty analysis
- [ ] Content cluster planning
