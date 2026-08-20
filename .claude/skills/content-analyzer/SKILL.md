---
name: Content Analyzer
description: Generate structured metadata for blog posts including summaries, topics, tech stack, difficulty levels, and category scores. Use when analyzing blog posts for the recommendation system or when running /analyze-posts command.
allowed-tools: Read, Write, Grep, Glob
---

# Content Analyzer

This Skill extracts structured metadata from blog posts to enable token-efficient content recommendations and semantic analysis.

## Core Features

1. **Content Summarization**: Generate concise 100-150 character summaries
2. **Topic Extraction**: Identify 5 main topics/themes from content
3. **Tech Stack Detection**: Extract technologies and frameworks mentioned
4. **Difficulty Assessment**: Calculate content difficulty level (1-5 scale)
5. **Category Scoring**: Generate scores for automation, web-dev, ai-ml, devops, architecture
6. **Change Tracking**: Compute content hash for incremental updates

## Workflow

### 1. Load Existing Metadata

```bash
# Read current metadata file
cat post-metadata.json
```

Check which posts already have metadata and which need analysis.

### 2. Analyze New or Updated Posts

For each post without metadata or with changed content:

1. **Read the blog post content**
2. **Extract frontmatter** (title, description, pubDate, tags)
3. **Analyze content** to identify:
   - Main topics and themes
   - Technologies mentioned
   - Content complexity
   - Category relevance

### 3. Generate Metadata Structure

```json
{
  "slug": "post-slug",
  "language": "ko",
  "pubDate": "2025-10-22",
  "title": "Post Title",
  "summary": "Concise summary (100-150 chars)",
  "mainTopics": [
    "Topic 1",
    "Topic 2",
    "Topic 3",
    "Topic 4",
    "Topic 5"
  ],
  "techStack": ["Tech1", "Tech2", "Tech3"],
  "difficulty": 3,
  "categoryScores": {
    "automation": 0.85,
    "web-development": 0.6,
    "ai-ml": 0.3,
    "devops": 0.4,
    "architecture": 0.7
  },
  "contentHash": "8-digit-hex"
}
```

### 4. Save to post-metadata.json

Update the metadata file with new entries, preserving existing ones.

## Analysis Guidelines

### Summary Generation

- **Length**: 100-150 characters
- **Focus**: Main value proposition and key takeaway
- **Style**: Clear, concise, action-oriented
- **Language**: Match the post's language (ko/ja/en)

**Example**:
```
"Claude Agent Skills의 Progressive Disclosure 아키텍처부터 실전 구현, 5가지 시행착오 해결책, 토큰 44% 절감 성과까지."
```

### Main Topics Extraction

Identify **5 key themes** from the content:

1. Primary topic (main focus)
2. Secondary topics (supporting concepts)
3. Technical patterns or methodologies
4. Tools or technologies discussed
5. Outcomes or benefits

**Example**:
```json
[
  "Agent Skills 아키텍처",
  "Progressive Disclosure 시스템",
  "SKILL.md 작성법",
  "시행착오 해결 (YAML, 권한, 경로)",
  "토큰 최적화 (44% 절감)"
]
```

### Tech Stack Detection

Extract all technologies, frameworks, and tools mentioned:

- Programming languages (Python, TypeScript, JavaScript)
- Frameworks (Astro, React, Next.js, Vue)
- Tools (Claude Code, Git, Docker)
- Platforms (Vercel, AWS, GitHub)

Limit to **top 5 most relevant** technologies.

### Difficulty Level (1-5 Scale)

**1 - Beginner**: Basic concepts, introductory tutorials
- No prior knowledge required
- Step-by-step explanations
- Simple examples

**2 - Elementary**: Fundamental concepts with some depth
- Basic familiarity assumed
- Clear explanations with examples
- Limited complexity

**3 - Intermediate**: Practical implementation knowledge
- Moderate experience expected
- Real-world scenarios
- Some complex concepts

**4 - Advanced**: Deep technical knowledge
- Significant experience required
- Complex architectures
- Performance optimization

**5 - Expert**: Cutting-edge techniques and patterns
- Expert-level knowledge needed
- Novel approaches
- System-level thinking

### Category Scores (0.0-1.0)

Score each category based on content relevance:

**automation** (0.0-1.0):
- AI/ML automation, workflow automation
- CI/CD pipelines, task automation
- Agent systems, autonomous processes

**web-development** (0.0-1.0):
- Frontend frameworks (React, Vue, Astro)
- Backend development (Node.js, APIs)
- Web performance, SEO

**ai-ml** (0.0-1.0):
- Machine learning, deep learning
- LLMs, AI agents
- Data science, model training

**devops** (0.0-1.0):
- Infrastructure, deployment
- Containers, orchestration
- Monitoring, observability

**architecture** (0.0-1.0):
- System design, patterns
- Scalability, reliability
- Microservices, distributed systems

**Scoring Logic**:
- 0.9-1.0: Primary focus of the post
- 0.7-0.89: Major topic, extensively covered
- 0.5-0.69: Moderate coverage, supporting topic
- 0.3-0.49: Mentioned, but not main focus
- 0.0-0.29: Minimal or no coverage

### Content Hash Generation

Generate an **8-character hex hash** from the post content for change detection:

```python
import hashlib

content = post_markdown_content
hash_object = hashlib.sha256(content.encode('utf-8'))
content_hash = hash_object.hexdigest()[:8]
```

This enables:
- Incremental updates (only analyze changed posts)
- Version tracking
- Cache invalidation

## Output Format

Save all metadata to `post-metadata.json`:

```json
{
  "posts": [
    {
      "slug": "claude-skills-implementation-guide",
      "language": "ko",
      "pubDate": "2025-10-22",
      "title": "Claude Skills 완벽 가이드",
      "summary": "...",
      "mainTopics": [...],
      "techStack": [...],
      "difficulty": 3,
      "categoryScores": {...},
      "contentHash": "02d759fa"
    },
    ...
  ],
  "metadata": {
    "lastUpdated": "2025-10-22T10:30:00Z",
    "totalPosts": 19,
    "version": "1.0.0"
  }
}
```

## Best Practices

1. **Incremental Processing**: Only analyze new or changed posts (compare contentHash)
2. **Batch Efficiency**: Process multiple posts in one session when possible
3. **Consistency**: Use consistent scoring criteria across all posts
4. **Language Awareness**: Respect the post's language for summary and topics
5. **Hash Caching**: Store content hash to avoid reprocessing unchanged posts

## Integration with Recommendation System

The generated metadata enables:

- **60-70% token reduction** vs. analyzing full post content
- **Faster similarity analysis** using pre-computed category scores
- **Incremental updates** without reprocessing entire corpus
- **Semantic clustering** by topics and tech stack

This metadata feeds into the `/generate-recommendations` command for efficient content recommendation generation.

## Example Usage

When you need to analyze blog posts:

1. **User runs `/analyze-posts`** command
2. **Content Analyzer Skill activates** automatically
3. **Process**:
   - Load existing metadata
   - Find new or updated posts (by content hash)
   - Analyze each post
   - Generate structured metadata
   - Save to post-metadata.json
4. **Output**: Summary report with processing statistics

## Error Handling

- **Missing posts**: Skip and log warning
- **Invalid frontmatter**: Skip and report error
- **Empty content**: Mark as error, skip analysis
- **File read errors**: Log and continue with next post

## Performance Targets

- **Processing speed**: ~2-3 seconds per post
- **Token usage**: ~1,000-2,000 tokens per post analysis
- **Accuracy**: Manual review shows >90% relevance in topic extraction
