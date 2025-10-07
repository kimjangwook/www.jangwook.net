# Write Post Command

## Description
Automatically generates blog posts with multi-language support, SEO optimization, and hero image generation. This command orchestrates the Writing Assistant agent to create complete, publication-ready blog posts.

## Usage

```bash
/write-post <topic> [options]
```

## Parameters

### Required
- `topic` (string): The main topic/subject of the blog post

### Optional
- `--tags` (string): Comma-separated list of tags (e.g., "nextjs,react,typescript")
- `--languages` (string): Comma-separated language codes (default: "ko,ja,en")
  - Available: ko (Korean), ja (Japanese), en (English)
- `--description` (string): SEO-optimized description (150-160 characters recommended)

## Examples

```bash
# Basic usage (generates Korean, Japanese, and English versions)
/write-post "Next.js 15의 새로운 기능"

# With tags
/write-post "React 커스텀 훅 가이드" --tags react,hooks,javascript

# With specific languages
/write-post "TypeScript 고급 타입 활용법" --tags typescript,types --languages ko,ja

# With custom description
/write-post "Astro로 블로그 만들기" --tags astro,blog --description "Astro 프레임워크를 사용하여 고성능 블로그를 구축하는 완벽 가이드"

# All options combined
/write-post "Tailwind CSS 최적화 전략" --tags tailwind,css,performance --languages ko,ja,en --description "Tailwind CSS를 사용한 프로젝트에서 성능을 극대화하는 실전 최적화 기법"
```

## Workflow

### 1. Input Parsing
- Parse topic and all optional parameters
- Validate language codes (ko, ja, en)
- Sanitize tags (lowercase, alphanumeric, hyphens only)
- Generate default description if not provided

### 2. Writing Assistant Invocation
The command delegates to the Writing Assistant agent with the following tasks:

#### Phase 1: Research & Planning
- Analyze the topic and identify key points
- **Research current information using Web Researcher agent**:
  - Use Brave Search MCP to gather latest information
  - Verify technical accuracy from official documentation
  - Identify trending discussions and best practices
  - Collect code examples from reliable sources
- Create content structure and outline based on research findings
- Identify additional code examples and technical details needed

#### Phase 2: Image Generation
- Generate hero image prompt based on topic
- Call Image Generator agent to create hero image
- Save image to appropriate path: `src/assets/blog/[slug]-hero.[ext]`
- Store image metadata for frontmatter

#### Phase 3: Content Generation
For each language in `--languages`:
- Generate complete blog post in target language
- Include proper Astro frontmatter:
  ```yaml
  ---
  title: [Generated Title]
  description: [SEO Description]
  pubDate: 'YYYY-MM-DD'  # Must use single quotes and YYYY-MM-DD format
  heroImage: ../../../assets/blog/[slug]-hero.[ext]
  tags: [tag1, tag2, ...]
  ---
  ```
- Apply language-specific tone and style
- Maintain technical term consistency across languages
- Include code examples with syntax highlighting
- Add proper headings, lists, and formatting

#### Phase 4: File Operations
- Generate URL-friendly slug from topic
- Save files to appropriate paths:
  - Korean: `/src/content/blog/[slug].md`
  - Japanese: `/src/content/blog/[slug].ja.md`
  - English: `/src/content/blog/[slug].en.md`
- Ensure Content Collections schema compliance
- Validate frontmatter required fields

### 3. Quality Checks
- Verify all files created successfully
- Check frontmatter format (title, description, pubDate required)
- Validate image path references
- Ensure proper Markdown formatting

### 4. Output Summary
Display creation results:
```
✓ Blog post created successfully!

Generated Files:
  - /src/content/blog/[slug].md (Korean)
  - /src/content/blog/[slug].ja.md (Japanese)
  - /src/content/blog/[slug].en.md (English)

Hero Image:
  - src/assets/blog/[slug]-hero.[ext]

Metadata:
  - Title: [Generated Title]
  - Tags: [tag1, tag2, ...]
  - Publish Date: [YYYY-MM-DD]

Next Steps:
  1. Review generated content
  2. Run: npm run astro check
  3. Preview: npm run dev
```

## Writing Assistant Delegation

### Context Provided to Agent
```markdown
Task: Generate blog post
Topic: [user-provided topic]
Tags: [tag1, tag2, ...]
Languages: [language codes]
Description: [SEO description or "Generate appropriate description"]

Requirements:
1. Research topic using Web Researcher agent:
   - Delegate to Web Researcher for comprehensive research
   - Gather latest information, official documentation, and examples
   - Verify technical accuracy and current best practices
   - Create detailed outline based on research findings
2. Generate hero image:
   - Create descriptive image prompt
   - Call Image Generator agent
   - Save to src/assets/blog/[slug]-hero.[ext]
   - Use path ../../../assets/blog/[slug]-hero.[ext] in frontmatter
3. Write complete blog post for each language:
   - Follow Astro Content Collections schema
   - Include frontmatter (title, description, pubDate, heroImage, tags)
   - Use technical blog tone and style
   - Include code examples where appropriate
   - Add proper headings and structure
4. Save files:
   - Korean: /src/content/blog/[slug].md
   - Japanese: /src/content/blog/[slug].ja.md
   - English: /src/content/blog/[slug].en.md
5. Generate URL-friendly slug from topic
6. Return file paths and metadata
```

### Expected Agent Response Format
```json
{
  "success": true,
  "files": [
    {
      "language": "ko",
      "path": "/src/content/blog/[slug].md",
      "title": "[Korean Title]"
    },
    {
      "language": "ja",
      "path": "/src/content/blog/[slug].ja.md",
      "title": "[Japanese Title]"
    },
    {
      "language": "en",
      "path": "/src/content/blog/[slug].en.md",
      "title": "[English Title]"
    }
  ],
  "heroImage": "../../../assets/blog/[slug]-hero.[ext]",
  "slug": "[generated-slug]",
  "tags": ["tag1", "tag2"],
  "pubDate": "[YYYY-MM-DD]"
}
```

## Content Guidelines

### Frontmatter Schema (Must Follow)
```yaml
---
title: string (required, see SEO guidelines for optimal length)
description: string (required, see SEO guidelines for optimal length)
pubDate: string (required, format: 'YYYY-MM-DD' only, single quotes)
heroImage: string (optional, relative path from content file: ../../../assets/blog/[image])
tags: array (optional, lowercase, alphanumeric + hyphens)
updatedDate: string (optional, format: 'YYYY-MM-DD' only, single quotes)
---
```

**SEO 최적화 가이드라인**: `.claude/guidelines/seo-title-description-guidelines.md` 참조

**Title 권장 길이**:
- 한국어: 25-30자
- 영어: 50-60자
- 일본어: 30-35자

**Description 권장 길이**:
- 한국어: 70-80자
- 영어: 150-160자
- 일본어: 80-90자

### Content Structure
```markdown
## 개요 / Overview / 概要
[Introduction paragraph - context and problem statement]

## 핵심 내용 / Key Concepts / 主要内容
### [Subtopic 1]
[Detailed explanation]

### [Subtopic 2]
[Detailed explanation]

## 코드 예제 / Code Examples / コード例
```language
[Working code example]
```

## 실전 활용 / Practical Application / 実践活用
[Real-world use cases]

## 결론 / Conclusion / 結論
[Summary and key takeaways]

## 참고 자료 / References / 参考資料
- [Link 1]
- [Link 2]
```

### Style Guidelines
- Use clear, professional technical writing
- Explain technical terms on first use
- Include working code examples
- Use active voice
- Keep paragraphs concise (2-4 sentences)
- Use bullet points for lists
- Add code comments in target language

### Language-Specific Notes
- **Korean**: Use 존댓말 (formal polite), mix Korean and English technical terms naturally
- **Japanese**: Use です/ます体 (polite form), use katakana for technical terms
- **English**: Use American English spelling, standard technical documentation style

## Image Generation Integration

### Hero Image Requirements
- Dimensions: 1020x510px (2:1 ratio) recommended
- Format: WebP, AVIF, or JPG
- File naming: `[slug]-hero.[ext]`
- Location: `src/assets/blog/`
- Frontmatter path: `../../../assets/blog/[slug]-hero.[ext]` (relative to content file)

### Image Prompt Guidelines

**IMPORTANT**: The Writing Assistant MUST generate context-aware, detailed image prompts that reflect the specific content and theme of the blog post, NOT generic templates.

#### Prompt Generation Process:
1. **Analyze the blog post content** to identify:
   - Main theme and key concepts
   - Technical domain (e.g., web dev, AI, data science, DevOps)
   - Mood/tone (e.g., innovative, problem-solving, educational)
   - Specific visual metaphors that represent the content

2. **Create a detailed, unique prompt** that includes:
   - **Subject**: Specific visual representation of the main concept
   - **Style**: Art style matching the content (e.g., isometric for architecture, diagram-style for processes, futuristic for AI, minimal for performance)
   - **Composition**: Layout and perspective
   - **Colors**: Palette that matches the content mood
   - **Details**: Specific elements that symbolize key concepts
   - **Atmosphere**: Overall feeling (professional, dynamic, clean, innovative)

#### Examples of Good vs. Bad Prompts:

**❌ BAD (Generic)**:
```
A modern, professional illustration representing TypeScript.
Style: Clean, technical, developer-focused.
```

**✅ GOOD (Context-Aware)**:
```
An isometric illustration of interconnected TypeScript code blocks forming a strong type-safe architecture.
Style: Modern tech illustration with geometric shapes, blueprint aesthetic.
Composition: Central TypeScript "T" logo radiating type definitions to surrounding code modules.
Colors: TypeScript blue (#3178C6) as primary, white and light gray for code blocks, subtle gradients.
Elements: Type annotations floating as labels, connected nodes showing type flow, shield symbols for type safety.
Atmosphere: Structured, reliable, professional.
No text overlay.
```

#### Domain-Specific Prompt Templates:

**For AI/ML topics**:
- Neural network visualizations, brain-computer interfaces, data streams
- Futuristic, high-tech aesthetic with neon accents
- Abstract representations of learning/intelligence

**For Performance/Optimization topics**:
- Speed metaphors (rockets, lightning, streamlined shapes)
- Before/after comparisons, optimization graphs
- Minimal, clean design emphasizing efficiency

**For Architecture/System Design topics**:
- Isometric building blocks, blueprint style
- Connected systems, data flow diagrams
- Professional blueprint or technical drawing aesthetic

**For Process/Workflow topics**:
- Timeline or flowchart representations
- Step-by-step visual progression
- Organized, structured layout with clear hierarchy

**For Security topics**:
- Lock, shield, fortress metaphors
- Layered protection visualization
- Dark theme with trust-building elements

**For Web Development topics**:
- Browser windows, responsive layouts
- HTML/CSS/JS visual representations
- Colorful, modern web design aesthetic

#### Additional Requirements:
- **Always avoid text in the image** (no code snippets, no labels)
- **Match the blog post's complexity level** (simple for beginner content, sophisticated for advanced)
- **Consider cultural context** for multi-language posts (use universal visual language)
- **Ensure brand consistency** while being creative
- **Think about thumbnail appeal** (will it look good at small sizes?)

## Error Handling

### Common Issues
1. **Invalid language code**: Show available options (ko, ja, en)
2. **Missing topic**: Display usage instructions
3. **File write failure**: Check directory permissions
4. **Schema validation error**: Verify frontmatter format
5. **Image generation failure**: Fall back to default placeholder

### Validation Checks
- Topic is not empty
- Language codes are valid
- Tags contain only alphanumeric and hyphens
- Generated slug is URL-safe
- All required frontmatter fields present

## Post-Generation Tasks

### Recommended Next Steps
1. **Review Content**:
   ```bash
   # Open generated files in editor
   code src/content/blog/[slug].md
   ```

2. **Type Check**:
   ```bash
   npm run astro check
   ```

3. **Preview Locally**:
   ```bash
   npm run dev
   # Visit http://localhost:4321/blog/[slug]
   ```

4. **Edit if Needed**:
   - Refine technical details
   - Adjust code examples
   - Update SEO description
   - Crop/replace hero image

5. **Build & Deploy**:
   ```bash
   npm run build
   npm run preview
   ```

## Integration with Other Agents

### Web Researcher
- **Primary research executor** for content accuracy
- Uses Brave Search MCP to gather latest information
- Verifies technical details from official sources
- Provides structured research report to Writing Assistant
- Identifies trending topics and best practices

### Writing Assistant
- Primary executor of content generation
- Delegates research to Web Researcher agent
- Handles writing and multi-language translation based on research findings

### Image Generator
- Called by Writing Assistant for hero image creation
- Receives prompt and returns image path

### SEO Optimizer
- Can be called after post creation for additional optimization
- Reviews metadata, internal links, and keyword usage

### Editor
- Can be used for post-creation review
- Checks grammar, style, and formatting

## Advanced Usage

### Chaining Commands
```bash
# Create post, then optimize SEO
/write-post "GraphQL 최적화 기법" --tags graphql,api
# Then run:
/optimize-seo src/content/blog/graphql-optimization.md
```

### Batch Processing
```bash
# Generate multiple related posts
/write-post "React 훅 시리즈 1: useState" --tags react,hooks
/write-post "React 훅 시리즈 2: useEffect" --tags react,hooks
/write-post "React 훅 시리즈 3: useContext" --tags react,hooks
```

## Configuration

### Default Settings (can be customized in future)
- Default languages: ko, ja, en
- Default image style: Technical/Developer-focused
- Default tone: Professional but friendly
- Default structure: Overview → Content → Examples → Conclusion

### Customization Options
Future enhancements may include:
- Custom templates
- Brand voice profiles
- Keyword density targets
- Readability level settings

## Notes

- **All dates MUST use 'YYYY-MM-DD' format with single quotes** (e.g., '2025-10-07')
- Slug generation removes special characters and uses hyphens
- Tags are automatically lowercased and sanitized
- Images in src/assets/ are automatically optimized by Astro (WebP conversion, responsive sizes, etc.)
- Generated content should be reviewed before publishing
- The command respects Astro Content Collections schema defined in `src/content.config.ts`

## Troubleshooting

### Post Not Appearing
- Check frontmatter syntax (YAML format)
- Verify required fields (title, description, pubDate)
- Run `npm run astro check` for validation errors
- Ensure file is in correct directory (`src/content/blog/`)

### Image Not Loading
- Verify image path is relative: `../../../assets/blog/[image]`
- Check file exists in `src/assets/blog/`
- Ensure correct file extension
- Astro will optimize images from src/assets/ automatically

### Build Errors
- Validate Content Collections schema compliance
- Check for TypeScript errors in frontmatter
- Verify all imports and file references
