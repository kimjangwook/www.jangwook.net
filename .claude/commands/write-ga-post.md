# Write GA Analysis Post Command

## Description
Automatically generates comprehensive Google Analytics analysis reports as blog posts with multi-language support. This command orchestrates the Analytics Reporter and Improvement Tracker agents to create data-driven, publication-ready analytics posts.

## Usage

```bash
/write-ga-post <analysis-date> [options]
```

## Parameters

### Required
- `analysis-date` (YYYY-MM-DD): The end date of the analysis period. The command will automatically determine the analysis period based on the previous report.

### Optional
- `--period` (string): Override automatic period detection (e.g., "weekly", "monthly", "quarterly")
  - `weekly`: Last 7 days
  - `monthly`: Last 30 days
  - `quarterly`: Last 90 days
  - `custom`: Requires --start-date parameter
- `--start-date` (YYYY-MM-DD): Start date for custom period (requires --period custom)
- `--languages` (string): Comma-separated language codes (default: "ko,ja,en")
- `--skip-improvement-tracking` (boolean): Skip automatic TODO creation from action plan

## Examples

```bash
# Basic usage (weekly report)
/write-ga-post 2025-10-14

# Monthly report
/write-ga-post 2025-10-31 --period monthly

# Custom period
/write-ga-post 2025-10-14 --period custom --start-date 2025-10-01

# Korean only
/write-ga-post 2025-10-14 --languages ko

# Skip TODO creation (just generate report)
/write-ga-post 2025-10-14 --skip-improvement-tracking
```

## Workflow

### Phase 1: Period Determination and Data Collection

#### 1.1 Determine Analysis Period
```markdown
Algorithm:
1. Read all existing analytics reports from src/content/blog/ko/
2. Find the most recent report by pubDate
3. Calculate period:
   - If no previous report: Use blog launch date (2025-10-06) as start
   - If weekly/monthly specified: Use fixed period
   - If custom: Use provided --start-date
   - Default: From (previous report pubDate + 1 day) to analysis-date
```

#### 1.2 Invoke Analytics Reporter Agent
```markdown
Delegate to @analytics-reporter with context:

Context:
- Analysis Period: [start-date] to [analysis-date]
- Report Type: [weekly/monthly/quarterly/custom]
- Previous Report: [path to last report, if exists]
- Property ID: 395101361 (www.jangwook.net)

Task:
1. Collect GA4 data for the period using MCP tools
2. Run all essential queries (8 queries from agent guidelines):
   - Period Overview
   - Top Content Performance
   - Traffic Sources
   - Geographic Distribution
   - Device & Browser
   - New vs Returning
   - Landing Pages
   - Real-time Activity (optional)

3. Analyze data:
   - Compare vs previous period (week-over-week, month-over-month)
   - Compare vs KPI targets from analytics-strategy.md
   - Identify wins, warnings, insights, opportunities

4. Generate comprehensive analysis report with:
   - Executive Summary
   - KPI Performance (with status indicators)
   - Traffic Analysis
   - Content Performance
   - Audience Insights
   - Key Insights (3-5 insights with data, analysis, implications, recommendations)
   - Action Plan (High/Medium/Strategic priority)
   - Next Report Preview

5. Return structured data for blog post generation
```

**Expected Response from Analytics Reporter**:
```json
{
  "period": {
    "start": "2025-10-07",
    "end": "2025-10-14",
    "type": "weekly"
  },
  "summary": {
    "totalUsers": 1234,
    "totalSessions": 1567,
    "pageViews": 3456,
    "avgEngagementTime": "3:42",
    "bounceRate": 45.2,
    "organicPercentage": 52.3
  },
  "kpis": [
    {
      "name": "Monthly Active Readers (MAR)",
      "target": 500,
      "actual": 432,
      "status": "warning",
      "trend": "up",
      "change": "+15%"
    }
    // ... more KPIs
  ],
  "insights": [
    {
      "title": "Organic Search Traffic Exceeded Target",
      "data": "Organic traffic reached 52% (target: 30%)",
      "analysis": "SEO improvements from last month are working",
      "implication": "Blog is becoming discoverable via search",
      "recommendation": "Double down on SEO-optimized content"
    }
    // ... 2-4 more insights
  ],
  "actionPlan": {
    "high": [
      "Optimize mobile UX for top 3 posts (bounce 68% → <50%)",
      "Add internal links to underperforming posts"
    ],
    "medium": [
      "Update old content (>6 months)",
      "Improve meta descriptions for SEO"
    ],
    "strategic": [
      "Launch newsletter CTA",
      "Develop content series strategy"
    ]
  },
  "topContent": [
    {
      "title": "Blog Post Title",
      "path": "/ko/blog/ko/post-slug",
      "pageViews": 234,
      "engagementTime": "4:32"
    }
    // ... top 10 posts
  ],
  "trafficSources": {
    "organic": 52.3,
    "direct": 30.1,
    "social": 12.4,
    "referral": 5.2
  }
}
```

### Phase 2: Context Gathering

#### 2.1 Read Improvement History
```markdown
Task:
1. Read src/pages/[lang]/improvement-history.astro
2. Filter improvements by completedDate within analysis period
3. Extract:
   - Completed improvements (with before/after metrics)
   - Impact summary (percentage changes)
   - Categories (SEO, UX, Technical, Content, Traffic)
   - Lessons learned
```

**Extracted Data Structure**:
```json
{
  "improvements": [
    {
      "date": "2025-10-12",
      "completedDate": "2025-10-12",
      "title": "Mobile UX Optimization",
      "category": "UX",
      "before": {"metric": "Mobile Bounce Rate", "value": "68%"},
      "after": {"metric": "Mobile Bounce Rate", "value": "47%"},
      "impact": "-31%",
      "effort": "Medium",
      "roi": "High"
    }
    // ... more improvements
  ],
  "summary": {
    "total": 5,
    "categories": {"UX": 2, "SEO": 2, "Technical": 1},
    "avgImpact": "+23%"
  }
}
```

#### 2.2 Read Blog Post Activity
```markdown
Task:
1. Read README.md
2. Filter blog posts by pubDate within analysis period
3. Extract:
   - New posts published
   - Post titles and descriptions
   - Tags and categories
   - Post slugs
```

**Extracted Data Structure**:
```json
{
  "newPosts": [
    {
      "title": "AI 에이전트 협업 패턴",
      "pubDate": "2025-10-16",
      "description": "5개 전문 에이전트로 풀스택 앱 구축",
      "tags": ["AI", "Agents", "Architecture"],
      "slug": "ai-agent-collaboration-patterns"
    }
    // ... more posts
  ],
  "summary": {
    "total": 3,
    "topTags": ["AI", "React", "TypeScript"]
  }
}
```

### Phase 3: Blog Post Generation

#### 3.1 Synthesize Analysis Report

**Combine Data Sources**:
```markdown
Structure:
1. Executive Summary
   - Period overview
   - Key highlights (from Analytics Reporter)
   - Overall assessment (traffic light: 🟢🟡🔴)

2. KPI Performance
   - Primary KPIs table (from Analytics Reporter)
   - Secondary KPIs table
   - Comparison vs targets and previous period

3. Traffic Analysis
   - Period trend (chart/table)
   - Channel breakdown
   - Top sources with analysis
   - Geographic insights

4. Content Performance
   - Top 10 posts by pageviews (from Analytics Reporter)
   - New posts published this period (from README.md)
   - Content distribution analysis (80/20 rule)
   - Post-specific insights (which new posts performed well?)

5. Site Improvements Impact
   - Completed improvements this period (from improvement-history.astro)
   - Before/after metrics
   - Correlation with traffic changes
   - Lessons learned

6. Audience Insights
   - Device & browser breakdown
   - New vs Returning behavior
   - User journey patterns

7. Key Insights (3-5 from Analytics Reporter)
   - Data observation
   - Analysis (root cause)
   - Implication
   - Recommendation

8. Action Plan
   - High Priority (this week) - from Analytics Reporter
   - Medium Priority (this month)
   - Strategic (long-term)

9. Next Report Preview
   - What to track next period
   - Expected improvements
   - Experiments to run
```

#### 3.2 Generate Frontmatter

**Publication Date Calculation**:
```markdown
Algorithm:
1. Find most recent blog post across all languages in src/content/blog/
2. Extract latest pubDate
3. Add 1 day → new post's pubDate
4. Format: 'YYYY-MM-DD' (single quotes required)
```

**Frontmatter Template**:
```yaml
---
title: "[기간] 블로그 분석 리포트: [핵심 인사이트 요약]"
description: "[기간] GA 데이터 분석, 콘텐츠 성과, 개선 효과 - 투명하게 공유하는 블로그 성장 기록"
pubDate: '[YYYY-MM-DD]'  # Latest post + 1 day
heroImage: "../../../assets/blog/ga-analytics-report-hero.png"
tags: ["Analytics", "Report", "Data"]
---
```

#### 3.3 Generate Content for Each Language

**Delegation Pattern**:
```markdown
For each language in --languages (default: ko, ja, en):

Context to Writing Assistant:
- Analysis data (from Analytics Reporter)
- Improvement data (from improvement-history.astro)
- Blog post data (from README.md)
- Report structure (from Phase 3.1)
- Frontmatter template (from Phase 3.2)
- Target language: [ko/ja/en]

Task:
1. Generate complete blog post in target language
2. Follow analytics report structure
3. Include all data tables and charts
4. Translate insights and recommendations appropriately
5. Maintain technical term consistency
6. Add language-specific formatting

Output:
- File path: src/content/blog/[lang]/[report-type]-analytics-[date].md
  - Weekly: weekly-analytics-2025-10-14.md
  - Monthly: monthly-analytics-2025-10.md
  - Quarterly: quarterly-analytics-Q4-2025.md
```

**Content Style Guidelines**:
- **Data-driven**: Every claim backed by GA4 data
- **Transparent**: Show both wins and failures
- **Actionable**: Focus on next steps
- **Educational**: Explain insights for learning
- **Visual**: Use tables, charts, and comparisons
- **Professional**: Technical but accessible

### Phase 4: Hero Image Generation

**Image Prompt Generation**:
```markdown
Context: Analytics report for [period]

Generate prompt based on:
1. Report type (weekly/monthly/quarterly)
2. Key insight (biggest win or learning)
3. Visual metaphor (growth, analysis, optimization)

Example Prompt:
"A modern data analytics dashboard visualization showing upward growth trends and key metrics.
Style: Clean, professional, data-focused illustration with chart elements.
Composition: Central dashboard with multiple metric cards, trend graphs showing positive growth.
Colors: Primary blue (#3178C6), green for positive trends, white background.
Elements: Line charts trending upward, bar charts, metric cards with numbers, abstract data visualizations.
Atmosphere: Professional, optimistic, data-driven.
No text overlay."
```

**Image Specifications**:
- Dimensions: 1020x510px (2:1 ratio)
- Format: WebP or JPG
- Naming: `[report-type]-analytics-[date]-hero.[ext]`
- Location: `src/assets/blog/`

### Phase 5: File Operations and Updates

#### 5.1 Save Blog Post Files
```markdown
Save to:
- Korean: src/content/blog/ko/[report-slug].md
- Japanese: src/content/blog/ja/[report-slug].md
- English: src/content/blog/en/[report-slug].md

Validate:
- [ ] Frontmatter schema compliance
- [ ] All required fields present
- [ ] Hero image path correct
- [ ] Markdown formatting valid
- [ ] Data tables render correctly
```

#### 5.2 Update README.md
```markdown
Task:
1. Read README.md
2. Update "블로그 포스트 현황":
   - Increment total post count
   - Add new report to top of list
   - Update "최신 포스트 날짜"
3. Update "정기 분석 리포트" section:
   - Mark this report as completed
   - Add actual publish date
4. Update "Last Updated" timestamp
5. Write updated README.md
```

#### 5.3 Invoke Improvement Tracker (if not skipped)
```markdown
If --skip-improvement-tracking is NOT set:

Delegate to @improvement-tracker:

Context:
- Action Plan from Analytics Report
- Report source: [path to generated report]
- Analysis period: [start-date] to [end-date]

Task:
1. Convert action plan to structured TODOs
2. Create entries in improvement-tracking/active-todos.md
3. Set priorities, deadlines, and metrics
4. Link back to source report
5. Return summary of created TODOs

User will be prompted:
"✅ Analytics report generated successfully!

Action Plan identified [N] improvement items:
- High Priority: [X] items
- Medium Priority: [Y] items
- Strategic: [Z] items

Would you like to:
1. Create TODOs from action plan (recommended)
2. Review action plan first
3. Skip TODO creation"
```

### Phase 6: Output and Next Steps

#### 6.1 Display Summary
```markdown
✅ Google Analytics Report Generated Successfully!

📊 Report Details:
- Period: [start-date] to [end-date] ([N] days)
- Report Type: [weekly/monthly/quarterly]
- Analysis Date: [analysis-date]

📈 Key Metrics:
- Total Users: [X] ([+/-]Y% vs previous)
- Organic Traffic: [Z]% (Target: [A]%)
- Avg Engagement: [B] min ([+/-]C% vs previous)

📝 Generated Files:
- Korean: src/content/blog/ko/[slug].md
- Japanese: src/content/blog/ja/[slug].md
- English: src/content/blog/en/[slug].md

🖼️ Hero Image:
- src/assets/blog/[slug]-hero.[ext]

📚 Context Analyzed:
- GA4 Data: 8 query types
- Improvements: [N] completed in period
- New Posts: [M] published in period

🎯 Action Plan:
- High Priority: [X] items
- Medium Priority: [Y] items
- Strategic: [Z] items

📋 Next Steps:
1. Review generated report content
2. Verify data accuracy
3. Run: npm run astro check
4. Preview: npm run dev
5. Create TODOs from action plan
6. Schedule next report: [next-date]
```

#### 6.2 Recommended Post-Generation Actions
```bash
# 1. Type check
npm run astro check

# 2. Preview locally
npm run dev
# Visit: http://localhost:4321/ko/blog/ko/[slug]

# 3. Review and edit if needed
code src/content/blog/ko/[slug].md

# 4. Create improvement TODOs
@improvement-tracker "이번 주 리포트의 액션 플랜을 TODO로 변환해줘"

# 5. Build and deploy
npm run build
npm run preview
```

## Integration with Other Agents

### Analytics Reporter Agent
- **Primary data collector and analyzer**
- Executes all GA4 MCP queries
- Performs comparative analysis
- Generates insights and recommendations
- Returns structured analysis data

### Improvement Tracker Agent
- **Receives action plan** from Analytics Reporter
- Converts to trackable TODOs
- Links improvements to metrics
- Tracks implementation progress
- Updates improvement history page

### Writing Assistant Agent
- **Generates multilingual content** from analysis data
- Maintains consistent tone across languages
- Formats data tables and charts
- Ensures SEO optimization

### Image Generator Agent
- **Creates custom hero images** for each report
- Generates context-aware prompts
- Ensures brand consistency

### Backlink Manager Agent (Optional)
- **Links new report** to previous reports
- Creates series navigation if applicable
- Maintains report timeline

## Quality Checklist

Before finalizing, ensure:
- [ ] All GA4 data is from MCP (not fabricated)
- [ ] Metrics match definitions in analytics-strategy.md
- [ ] Insights are specific and actionable
- [ ] Action items are measurable with baselines
- [ ] Comparison data (vs previous period) included
- [ ] Benchmarks referenced where applicable
- [ ] Improvements correlated with traffic changes
- [ ] New posts mentioned and analyzed
- [ ] Language is clear and concise
- [ ] Markdown formatting correct (tables, charts, lists)
- [ ] Frontmatter follows Content Collections schema
- [ ] Hero image generated and path correct
- [ ] README.md updated
- [ ] Files saved to correct locations

## Report Types and Scheduling

### Weekly Report
- **Frequency**: Every Monday
- **Period**: Previous 7 days
- **Focus**: Immediate wins/losses, quick adjustments
- **Action Plan**: High priority items (1-week timeline)
- **Filename**: `weekly-analytics-YYYY-MM-DD.md`

### Monthly Report
- **Frequency**: First of each month
- **Period**: Previous 30 days
- **Focus**: Trend analysis, content performance, strategic adjustments
- **Action Plan**: Medium priority (1-month timeline)
- **Filename**: `monthly-analytics-YYYY-MM.md`

### Quarterly Report
- **Frequency**: End of quarter (Mar, Jun, Sep, Dec)
- **Period**: Previous 90 days
- **Focus**: Strategic review, goal assessment, roadmap planning
- **Action Plan**: Strategic initiatives (3-month timeline)
- **Filename**: `quarterly-analytics-QX-YYYY.md`

### Custom Report
- **Frequency**: On-demand
- **Period**: User-specified
- **Focus**: Special events, campaigns, experiments
- **Action Plan**: Context-dependent
- **Filename**: `custom-analytics-[start]-to-[end].md`

## Recommended Schedule

Based on README.md "향후 콘텐츠 플랜":

```markdown
October 2025:
- 2025-10-14: Weekly Report (블로그 런칭 일주일 후)
- 2025-10-21: Weekly Report
- 2025-10-28: Weekly Report

November 2025:
- 2025-11-07: Monthly Report (블로그 런칭 한달 후)
- 2025-11-14: Weekly Report
- 2025-11-21: Weekly Report
- 2025-11-28: Weekly Report

December 2025:
- 2025-12-05: Weekly Report
- 2025-12-12: Weekly Report
- 2025-12-19: Weekly Report
- 2025-12-31: Quarterly Report (Q4 2025)

January 2026:
- 2026-01-07: Monthly Report (분기 회고 및 2026년 전략)
```

## Error Handling

### Common Issues

1. **Invalid date format**:
   ```
   Error: Date must be in YYYY-MM-DD format
   Solution: Use format like 2025-10-14
   ```

2. **No previous report found**:
   ```
   Warning: No previous report detected. Using blog launch date (2025-10-06) as baseline.
   → Proceeds with blog launch date as start of period
   ```

3. **GA4 MCP connection failure**:
   ```
   Error: Cannot connect to GA4 MCP
   Solution: Check MCP configuration and API permissions
   ```

4. **Insufficient data for period**:
   ```
   Warning: Less than 7 days of data available
   → Generates report with available data and notes limitations
   ```

5. **Improvement history not found**:
   ```
   Warning: improvement-history.astro not found or empty
   → Generates report without improvement section
   ```

### Validation Checks
- Date is valid YYYY-MM-DD format
- End date is not in the future
- Period has sufficient data (>= 1 day)
- Language codes are valid (ko, ja, en)
- GA4 Property ID is correct (395101361)
- MCP tools are accessible

## Advanced Usage

### Custom Period Analysis
```bash
# Analyze specific campaign period
/write-ga-post 2025-10-31 --period custom --start-date 2025-10-15

# Compare two specific weeks
/write-ga-post 2025-10-21 --period custom --start-date 2025-10-14
```

### Language-Specific Reports
```bash
# Korean only (for quick review)
/write-ga-post 2025-10-14 --languages ko

# English + Japanese (for international audience)
/write-ga-post 2025-10-14 --languages en,ja
```

### Skip TODO Creation (Report Only)
```bash
# Generate report without action tracking
/write-ga-post 2025-10-14 --skip-improvement-tracking

# Useful for:
# - Monthly executive summaries
# - Historical analysis
# - Data exploration without action items
```

## Configuration

### Default Settings
- Property ID: 395101361 (www.jangwook.net)
- Default Languages: ko, ja, en
- Default Period: Since last report (or blog launch date)
- Default Report Type: Weekly (if <= 14 days), Monthly (if <= 45 days), Quarterly (if > 45 days)

### Customization
Future enhancements may include:
- Custom KPI targets per report
- A/B test result integration
- Campaign-specific analysis
- Automated report scheduling
- Email/Slack notifications

## Notes

- **All dates must use 'YYYY-MM-DD' format with single quotes**
- Report slug generated from period and type
- Analysis always compares vs previous period
- Action plan automatically prioritized by impact/effort
- Improvements are correlated with traffic changes
- New posts are highlighted and analyzed
- Generated content should be reviewed before publishing
- Reports follow transparent, educational style
- Data is the hero, not vanity metrics

## Troubleshooting

### Report Not Generating
- Check GA4 MCP connection
- Verify Property ID (395101361)
- Ensure date format is correct (YYYY-MM-DD)
- Check if previous report exists for period calculation

### Missing Data Sections
- Verify improvement-history.astro is accessible
- Check README.md exists and is formatted correctly
- Ensure GA4 has data for the specified period

### Build Errors
- Run `npm run astro check` to validate schema
- Check frontmatter format (YAML syntax)
- Verify hero image path is correct
- Ensure all required frontmatter fields present

### Incorrect Period Calculation
- Manually specify period with --period and --start-date
- Check previous report pubDate is correct
- Verify blog launch date (2025-10-06) if no previous reports

---

**Your Goal**: Create transparent, data-driven analytics reports that educate readers while tracking blog growth systematically.
