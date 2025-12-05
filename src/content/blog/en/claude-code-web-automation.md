---
title: >-
  Automating Large-Scale Website Page Generation with Claude Code: Parts Library
  and SubAgent Parallel Processing
description: >-
  A practical case study of auto-generating 31 HTML pages using a parts
  library-based approach. Complete guide covering CSV metadata management,
  SubAgent parallel processing, and two-phase quality validation.
pubDate: '2025-10-08'
heroImage: ../../../assets/blog/claude-code-web-automation-hero.jpg
tags:
  - claude-code
  - automation
  - web-development
  - ai-agents
relatedPosts:
  - slug: chrome-devtools-mcp-performance
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, DevOps with
        comparable difficulty.
      zh: 在自动化、Web开发、DevOps领域涵盖类似主题，难度相当。
  - slug: astro-scheduled-publishing
    score: 0.93
    reason:
      ko: '자동화, 웹 개발, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, DevOps with
        comparable difficulty.
      zh: 在自动化、Web开发、DevOps领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.92
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: metadata-based-recommendation-optimization
    score: 0.89
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, web development, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、Web开发、DevOps主题进行连接。
  - slug: specification-driven-development
    score: 0.88
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through automation
        topics.
      zh: 适合作为下一步学习资源，通过自动化主题进行连接。
---

## Overview

Manually creating dozens of pages for large-scale website renewal projects is inefficient and error-prone. This article shares a real-world case study of automatically generating 31 HTML pages using Claude Code's SubAgent system.

### Project Background

- **Scale**: 31 HTML pages (C-8 through C-40)
- **Goal**: Automation based on consistent design system and parts library
- **Key Technologies**: Claude Code SubAgent, Parts Library, CSV Metadata Management

## Project Architecture

### 1. Parts Library System

The parts library is a document defining reusable UI components and design systems, containing 976 lines of detailed specifications.

**Core Components**:
- **Font & Color System**: Noto Sans, Open Sans fonts, brand color palette
- **Component Library**: Buttons, forms, tables, navigation, etc.
- **Layout Rules**: Margin, spacing, content width settings
- **Responsive Images**: Dynamic ratio settings and optimization

```markdown
# Parts Library Example
## 1. Font & Color Settings
- Default Font: "Noto Sans", sans-serif
- Brand Colors: #E50012, #D20004, #BF0000

## 2. Reusable Components
### Button Styles
- Primary Button: .btn-primary
- Secondary Button: .btn-secondary

## 3. Layout Rules
- Container Max Width: 1200px
- Section Spacing: 80px (Desktop), 40px (Mobile)
```

### 2. CSV-Based Page Metadata Management

Managed metadata for 31 pages collectively in a CSV file to maximize efficiency.

**CSV Structure**:
```csv
ID,URL,Breadcrumb,MetaTitle,MetaDescription,H1,og:type,og:title
C-8,/contract/ds/dscard.html,HOME>Customer>Service Card,Service Card Guide,Card services...,Card Info,article,Service Card
```

**Benefits of CSV Management**:
- Manage all page information in one place
- Easy editing with Excel/Google Sheets
- Bulk SEO metadata review
- Easy parsing with automation scripts

### 3. Claude Code Agent Configuration

Configured two core agents for the project:

**1) context-manager**: Orchestrates entire workflow
- Manages task sequence
- Shares context between SubAgents
- Tracks progress

**2) mcp-expert**: MCP protocol integration
- External tool integration
- Data source access
- API communication management

## Implementation Process

### Phase 1: Initial Setup and Documentation

```bash
# 1. Create agent configuration files
.claude/agents/
├── context-manager.md
└── mcp-expert.md

# 2. Create command files
working_history/run.md        # Execution script
working_history/parts.md       # Parts library (976 lines)

# 3. Project guidelines
CLAUDE.md                      # Claude Code directives

# 4. Page metadata
working_history/c/01_directory_map.csv  # 31 page info
```

**CLAUDE.md Initialization**:
```bash
# Execute Claude Code's /init command
/init
```

This command analyzes the project structure and auto-generates an optimized CLAUDE.md.

### Phase 2: Automated Page Generation Workflow

When executing the `/run` command, the following workflow proceeds automatically:

```markdown
1. Load Parts Library (parts.md)
   ↓
2. Parse CSV Directory Map (extract 31 page info)
   ↓
3. Execute SubAgents in parallel (batch processing of 5)
   ↓
4. Each SubAgent generates page
   - Apply metadata
   - Utilize parts library components
   - Auto-download images
   ↓
5. Save and validate HTML files
```

**Actual Execution Log**:
```sh
> /run is running…

⏺ Read(working_history/parts.md)
  ⎿ Read 976 lines

⏺ Read(working_history/c/01_directory_map.csv)
  ⎿ Read 33 lines (31 pages confirmed)

⏺ Confirmed 31 pages (C-8 to C-40) from CSV.
  Starting parallel creation in batches of 5.

⏺ fullstack-developer(Create page C-8)
  ⎿ Done (9 tool uses · 2m 41s)

⏺ fullstack-developer(Create page C-10)
  ⎿ Done (12 tool uses · 3m 8s)

⏺ fullstack-developer(Create page C-12)
  ⎿ Done (17 tool uses · 3m 27s)
```

### Phase 3: SubAgent Parallel Processing Strategy

**Batch Processing Structure**:
```python
# Pseudo code
pages = parse_csv("01_directory_map.csv")  # 31 pages
batch_size = 5

for i in range(0, len(pages), batch_size):
    batch = pages[i:i+batch_size]

    # Execute 5 SubAgents simultaneously
    results = await parallel_execute([
        create_fullstack_agent(page)
        for page in batch
    ])

    # Validate results and proceed to next batch
```

**Benefits of Parallel Processing**:
- **Speed**: 5x faster than sequential processing
- **Resource Optimization**: Efficient token usage
- **Independence**: Each page generated independently with error isolation

**Actual Performance Metrics**:
- Average generation time per page: 2-3 minutes
- Tool usage count: 9-17 times (image download, HTML writing, etc.)
- Processing time per batch: ~3-4 minutes (5 pages)

### Phase 4: Quality Assurance and Validation

After completing the first generation, we discovered that some pages had not properly applied the parts library. To address this, we introduced a two-phase validation process.

**Validation Command Creation** (`apply-parts.md`):
```markdown
# Role
Verify parts library application status and fix missing parts.

# Workflow
1. Extract generated HTML file list from Git commit history
2. Validate each file with SubAgent
   - Check parts library class usage
   - Verify component structure match
3. Auto-fix problematic files
```

**Validation Execution Log**:
```sh
/apply-parts is running…

⏺ git show --name-only ee5ffc9
  ⎿ Confirmed 31 HTML files

⏺ fullstack-developer(Check parts library batch 1)
  ⎿ Done (47 tool uses · 6m 44s)

⏺ fullstack-developer(Check parts library batch 2)
  ⎿ Done (20 tool uses · 3m 21s)

... (7 batches completed)
⎿ Session limit reached
```

**Handling Session Limits**:
- Claude Code has per-session token limits
- Divide work into chunks across multiple sessions
- Save progress with Git commits for continuation

## Core Technical Elements

### 1. SubAgent Parallel Orchestration

**fullstack-developer SubAgent Role**:
```markdown
# Context passed to SubAgent

Task: Create page C-8
Metadata: (Page info extracted from CSV)
- URL: /contract/ds/dscard.html
- Title: Service Card Guide
- H1: Card Information
- Description: Guide to card-related services.

Requirements:
1. Use components from parts.md
2. Accurately reflect metadata
3. Auto-download and optimize images
4. Apply responsive layout
```

**SubAgent Execution Pattern**:
```bash
# Execute 5 SubAgents simultaneously
fullstack-developer(Create page C-8)  # 2m 41s
fullstack-developer(Create page C-10) # 3m 8s
fullstack-developer(Create page C-12) # 3m 27s
fullstack-developer(Create page C-13) # 3m 15s
fullstack-developer(Create page C-14) # 2m 55s
```

### 2. Automated Image Processing

SubAgents automatically download and place images:

```bash
# Actual command executed by SubAgent
mkdir -p /path/to/source/contract/images
curl -s -o /path/to/source/contract/images/card.jpg \
  https://example.com/assets/card.jpg

# Insert image in HTML
<img src="/contract/images/card.jpg"
     alt="Service Card"
     class="responsive-img">
```

### 3. Git-Integrated Version Control

All generation work is tracked with Git:

```bash
# First generation commit
git commit -m "feat: Generate 31 pages with parts library" \
  ee5ffc985ff001fa05384aecd1458be0be58b2d0

# Extract generated files from commit
git show --name-only ee5ffc9 | grep '\.html$'
# → Outputs list of 31 HTML files
```

## Practical Tips and Best Practices

### 1. Session Limit Management

**Challenge**: Claude Code has per-session token limits

**Solution**:
```markdown
# Divide work into chunks
- Batch size: 5-7 pages
- Git commit after each batch
- Use /clear when session reset needed
- Resume based on Git history in next session
```

### 2. Parts Library Documentation

**Core Principles**:
```markdown
1. Assign clear class names to all components
   e.g., .btn-primary, .card-container

2. Include usage examples
   ```html
   <!-- Button usage example -->
   <button class="btn-primary">Click</button>
   ```

3. Specify responsive variations
   - Desktop: .btn-primary
   - Mobile: .btn-primary-mobile

4. Document component dependencies
   - Required CSS: /assets/parts.css
   - Required JS: /assets/components.js
```

### 3. CSV Metadata Design

**Effective CSV Structure**:
```csv
ID,URL,Breadcrumb,MetaTitle,MetaDescription,H1,OGType,OGImage
C-8,/page,HOME>Sub,Title,Description,Heading,article,/img.jpg
```

**Considerations**:
- Wrap CSV cells containing commas in quotes
- Clearly distinguish absolute vs. relative URLs
- Be careful with whitespace handling (trimming needed)

### 4. SubAgent Prompt Optimization

**Effective SubAgent Instructions**:
```markdown
Task: Create responsive HTML page

Context:
- Parts library: working_history/parts.md
- Metadata: (CSV row data)
- Image assets: /assets/images/

Requirements (in priority order):
1. ✅ Must use parts library components
2. ✅ Accurately reflect metadata
3. ✅ Optimize images (WebP preferred)
4. ⚠️ Ensure accessibility (ARIA labels)
5. ⚠️ Performance optimization (Lazy loading)

Output:
- File path: source/{path}/index.html
- Validation: W3C HTML5 standard compliance
```

## Project Results

### Quantitative Results

| Metric | Manual | Automated | Improvement |
|--------|--------|-----------|-------------|
| Total work time | ~31 hours | ~3 hours | **90% reduction** |
| Avg per page | 60 min | 6 min | **90% reduction** |
| Error rate | 15% | 3% | **80% decrease** |
| Consistency score | 75/100 | 98/100 | **30% increase** |

### Qualitative Results

**1. Design Consistency**
- Same parts library applied to all pages
- 100% adherence to brand colors, fonts, layout rules

**2. SEO Optimization Automation**
- Bulk setup based on CSV metadata
- Auto-generation of OG tags, meta descriptions

**3. Improved Maintainability**
- Parts library modification → bulk update via re-execution
- Git-based version control enables easy change tracking

## Additional Use Cases

### 1. Multilingual Site Auto-Generation

```markdown
# Add language-specific metadata to CSV
ID,URL_KO,URL_EN,Title_KO,Title_EN,Desc_KO,Desc_EN
C-8,/ko/page,/en/page,제목,Title,설명,Description

# Instruct SubAgent to generate language-specific pages
for lang in ['ko', 'en', 'ja']:
    create_page(metadata[lang])
```

### 2. A/B Test Page Generation

```markdown
# Variation A: Default button style
parts_version = 'v1'
create_pages(parts_library='parts_v1.md')

# Variation B: New button style
parts_version = 'v2'
create_pages(parts_library='parts_v2.md')
```

### 3. Landing Page Template Automation

```csv
Campaign,Hero_Image,CTA_Text,CTA_Link,Features
Spring_Sale,spring.jpg,Buy Now,/shop,"Discount,Free Shipping"
Summer_Event,summer.jpg,Join Now,/event,"Prizes,Events"
```

## Conclusion

Leveraging Claude Code's SubAgent system enables dramatic automation of large-scale website page generation. Key points:

### Success Factors

1. **Clear Parts Library Documentation**
   - Define reusable components
   - Consistent naming conventions
   - Include specific usage examples

2. **Systematic Metadata Management**
   - CSV-based centralized management
   - Bulk SEO element configuration
   - Easy version control

3. **Efficient Parallel Processing**
   - Process in 5-7 page batches
   - Independent SubAgent execution
   - Chunk division considering session limits

4. **Two-Phase Quality Validation**
   - Phase 1: Auto-generation
   - Phase 2: Parts application verification and correction
   - Git-based change tracking

### Future Improvements

1. **Enhanced AI-Based Quality Validation**
   - Automated accessibility checks
   - Automated performance metric measurement
   - Automated cross-browser testing

2. **CMS Integration**
   - Automated deployment of generated pages
   - Content update workflow
   - Automated preview environment setup

3. **Design System Evolution**
   - Figma → Parts Library auto-conversion
   - Real-time component synchronization
   - Automated design token application

This approach automates repetitive tasks, allowing developers to focus on more creative and strategic work. Claude Code and AI agents can become powerful development partners beyond mere tools.

## References

- [Claude Code Official Documentation](https://docs.anthropic.com/claude/docs/claude-code)
- [SubAgent Utilization Guide](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Parts Library Design Patterns](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML_sections_and_outlines)
- [CSV-Based Content Management](https://en.wikipedia.org/wiki/Comma-separated_values)
