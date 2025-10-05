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
- Research current information using WebFetch (if needed)
- Create content structure and outline
- Identify code examples and technical details needed

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
1. Research topic and create detailed outline
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
title: string (required, max 60 chars recommended)
description: string (required, 150-160 chars for SEO)
pubDate: string (required, format: 'YYYY-MM-DD' only, single quotes)
heroImage: string (optional, relative path from content file: ../../../assets/blog/[image])
tags: array (optional, lowercase, alphanumeric + hyphens)
updatedDate: string (optional, format: 'YYYY-MM-DD' only, single quotes)
---
```

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
The Writing Assistant should generate prompts like:
```
A modern, professional illustration representing [topic].
Style: Clean, technical, developer-focused.
Colors: [brand colors or tech-themed palette].
Elements: [specific visual elements related to topic].
No text overlay.
```

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

### Writing Assistant
- Primary executor of content generation
- Handles research, writing, and multi-language translation

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
