---
name: Recommendation Generator
description: Generate semantic content recommendations for blog posts using LLM-based similarity analysis. Identifies prerequisite, related, and next-step posts with multi-language reasoning. Use when running /generate-recommendations command or after creating new blog posts.
allowed-tools: Read, Write
---

# Recommendation Generator

This Skill generates contextually relevant content recommendations using Claude's semantic understanding, replacing traditional TF-IDF approaches with LLM-based similarity analysis.

## Core Features

1. **Semantic Similarity Analysis**: Deep understanding of content relationships beyond keyword matching
2. **Learning Path Construction**: Identify prerequisite → current → next-step progression
3. **Multi-language Reasoning**: Generate explanations in Korean, Japanese, and English
4. **Relationship Classification**: Categorize recommendations by type (prerequisite, related-concept, next-step, alternative-approach)
5. **Score Calibration**: Provide similarity scores (0.0-1.0) based on contextual relevance

## Why LLM-based vs TF-IDF?

### TF-IDF Approach (Traditional)
- ❌ Keyword frequency based
- ❌ Misses semantic relationships
- ❌ No understanding of prerequisites vs advanced topics
- ❌ Cannot explain *why* posts are related
- ✅ Fast and deterministic

### LLM-based Approach (Claude)
- ✅ Deep semantic understanding
- ✅ Identifies conceptual relationships
- ✅ Understands learning progression
- ✅ Generates human-readable reasoning
- ✅ Multi-language explanations
- ⚠️ Requires more tokens (but offset by metadata optimization)

## Workflow

### 1. Load Metadata

```bash
# Read post metadata
cat post-metadata.json

# Read existing recommendations
cat recommendations.json
```

Check which posts need new recommendations.

### 2. For Each Post Needing Recommendations

**Identify the target post**:
- New posts (no recommendations yet)
- Updated posts (content hash changed)

**Load post context**:
- Title, summary, main topics
- Tech stack, difficulty level
- Category scores
- Publication date

### 3. Find Candidate Posts

**Filter criteria**:
- Same language (ko/en/ja)
- Published before target post (for prerequisites)
- Published after target post (for next-steps)
- Exclude the target post itself

### 4. Semantic Analysis

For each candidate post, analyze:

**Similarity Dimensions**:
1. **Topic Overlap**: How many main topics are shared?
2. **Tech Stack Alignment**: Common technologies mentioned?
3. **Category Relevance**: Similar category scores?
4. **Difficulty Progression**: Prerequisite (lower) vs next-step (higher)?
5. **Conceptual Relationship**: Are they part of the same learning path?

**Similarity Score (0.0-1.0)**:
- **0.90-1.00**: Nearly identical topics, strong prerequisite/continuation
- **0.80-0.89**: Highly related, same domain, complementary
- **0.70-0.79**: Related concepts, shared tech stack
- **0.60-0.69**: Tangential relationship, some overlap
- **0.50-0.59**: Weak connection, minimal overlap
- **< 0.50**: Not recommended (filter out)

### 5. Classify Relationship Type

**prerequisite**: Foundation knowledge needed to understand target post
- Published before target post
- Lower or equal difficulty
- Covers foundational concepts
- Example: "TypeScript Basics" → "Advanced TypeScript Patterns"

**related-concept**: Similar topic, complementary knowledge
- Published around same time or before
- Similar difficulty
- Different angle on same domain
- Example: "React Hooks" ↔ "React Context API"

**next-step**: Advanced application or continuation
- Published after target post OR higher difficulty
- Builds on target post concepts
- More advanced techniques
- Example: "REST API Basics" → "GraphQL Advanced Patterns"

**alternative-approach**: Different solution to same problem
- Similar difficulty
- Different technologies or methodologies
- Comparable use cases
- Example: "State Management with Redux" ↔ "State Management with Zustand"

### 6. Generate Multi-language Reasoning

For each recommendation, explain **why** it's related:

**Korean (ko)**:
```
"[Prerequisite/Related/Next-step] 포스트의 핵심 개념을 다루며, [specific connection]."
```

**Japanese (ja)**:
```
"[Prerequisite/Related/Next-step]の核心概念を扱い、[specific connection]。"
```

**English (en)**:
```
"Covers [prerequisite/related/next-step] core concepts, [specific connection]."
```

**Reasoning Guidelines**:
- Be specific about the connection (not generic)
- Mention concrete topics or technologies
- Explain the learning relationship
- Keep under 100 characters per language

**Example**:

```json
{
  "slug": "claude-code-best-practices",
  "score": 0.88,
  "reason": {
    "ko": "Claude Code의 핵심 기능과 베스트 프랙티스를 다루며, Agent Skills는 이러한 실무 패턴을 구조화하는 발전된 방식입니다.",
    "ja": "Claude Codeの核心機能とベストプラクティスを扱い、Agent Skillsはこれらの実務パターンを構造化する進化した方法です。",
    "en": "Covers Claude Code core features and best practices, with Agent Skills being an evolved way to structure these practical patterns."
  },
  "type": "prerequisite"
}
```

### 7. Select Top Recommendations

**Selection Criteria**:
- Minimum similarity score: 0.60
- Maximum recommendations per post: 5
- Diverse relationship types (mix of prerequisite, related, next-step)
- Sort by score (descending)

**Balanced Distribution** (ideal):
- 1-2 prerequisites (if available)
- 2-3 related concepts
- 1-2 next steps (if available)

### 8. Save to recommendations.json

```json
{
  "claude-skills-implementation-guide": {
    "related": [
      {
        "slug": "claude-code-best-practices",
        "score": 0.88,
        "reason": { "ko": "...", "ja": "...", "en": "..." },
        "type": "prerequisite"
      },
      {
        "slug": "llm-blog-automation",
        "score": 0.85,
        "reason": { "ko": "...", "ja": "...", "en": "..." },
        "type": "prerequisite"
      },
      {
        "slug": "ai-agent-collaboration-patterns",
        "score": 0.82,
        "reason": { "ko": "...", "ja": "...", "en": "..." },
        "type": "related-concept"
      }
    ]
  },
  ...
}
```

## Semantic Analysis Prompt Pattern

When analyzing similarity, use this mental framework:

```
Given two blog posts:

Post A (target):
- Title: [title]
- Topics: [topics]
- Tech: [tech]
- Difficulty: [level]
- Categories: [scores]

Post B (candidate):
- Title: [title]
- Topics: [topics]
- Tech: [tech]
- Difficulty: [level]
- Categories: [scores]

Questions to assess:
1. Do they share core concepts? (high weight)
2. Is there a learning dependency? (prerequisite vs next-step)
3. Do they use similar technologies? (medium weight)
4. Are they in the same problem domain? (high weight)
5. Would a reader benefit from reading both? (high weight)

Similarity score: [0.0-1.0]
Relationship type: [prerequisite|related-concept|next-step|alternative-approach]
Reasoning: [specific explanation of connection]
```

## Best Practices

### 1. Incremental Processing

Only generate recommendations for:
- New posts (no recommendations yet)
- Posts with changed content (different contentHash)
- Posts affected by new additions (recalculate when new related content added)

### 2. Quality Over Quantity

- Better to have 3 highly relevant recommendations than 5 mediocre ones
- Filter out weak connections (score < 0.60)
- Ensure diversity in relationship types

### 3. Learning Path Coherence

Recommendations should form a coherent learning path:
```
[Prerequisite] → [Current Post] → [Next Step]
       ↓
  [Related Concepts]
```

### 4. Multi-language Consistency

- Reasoning should convey the same meaning across languages
- Use natural phrasing for each language
- Avoid direct translation; localize the explanation

### 5. Score Calibration

**High confidence (0.85+)**:
- Direct prerequisite or continuation
- Very similar topics and tech stack
- Clear learning relationship

**Medium confidence (0.70-0.84)**:
- Related domain, some shared concepts
- Complementary knowledge
- Beneficial to read together

**Low confidence (0.60-0.69)**:
- Tangential relationship
- Shared category but different focus
- May be useful for some readers

## Integration with Content Analyzer

The Recommendation Generator relies on metadata from the Content Analyzer Skill:

**Input** (from post-metadata.json):
- Post summaries
- Main topics
- Tech stack
- Difficulty levels
- Category scores

**Output** (to recommendations.json):
- Related post slugs
- Similarity scores
- Multi-language reasoning
- Relationship types

**Token Efficiency**:
- Using metadata instead of full content: **60-70% token reduction**
- 1,500 tokens per post analysis (vs 5,000+ with full content)
- Enables incremental updates without corpus-wide reprocessing

## Example Usage

When you need to generate recommendations:

1. **User runs `/generate-recommendations`** command
2. **Recommendation Generator Skill activates** automatically
3. **Process**:
   - Load post-metadata.json and recommendations.json
   - Identify posts needing recommendations
   - For each post, analyze similarity with all candidates
   - Generate top 5 recommendations with reasoning
   - Save to recommendations.json
4. **Output**: Summary report with statistics

## Quality Metrics

Track recommendation quality:

**Coverage**:
- % of posts with recommendations: 95%+
- Average recommendations per post: 3-5

**Relevance**:
- Average similarity score: 0.75+
- % with score ≥ 0.80: 60%+

**Diversity**:
- Mix of prerequisite, related, next-step types
- Variety in tech stack and categories

## Error Handling

- **No candidates found**: Return empty array, log info
- **Insufficient metadata**: Skip post, log warning
- **Invalid recommendations.json**: Create new file from scratch
- **LLM analysis failure**: Retry once, then skip post

## Performance Targets

- **Processing speed**: ~3-5 seconds per post
- **Token usage**: ~1,500-2,000 tokens per post
- **Recommendation quality**: >80% user satisfaction (based on click-through)
