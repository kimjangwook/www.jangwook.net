# Chapter 1: Introducing Claude Code

For developers in the AI era, the most important question is not "how to code" but "how to collaborate with AI." Claude Code is not just an autocomplete tool—it's an AI pair programmer that revolutionizes your entire development workflow. In this chapter, you'll understand the core concepts and value of Claude Code, and learn when and how to use it.

---

## Recipe 1.1: What is Claude Code

### Problem

Developers are confused about which AI coding tool to choose among many options like GitHub Copilot, ChatGPT, and Cursor. Without clearly understanding the differences and strengths of each, it's impossible to use the tools effectively.

"What exactly is Claude Code, and how is it different from other AI tools?"

### Solution

A 3-step approach to understanding Claude Code:

#### Step 1: Understand the Definition

Claude Code is an AI pair programmer developed by Anthropic with these characteristics:

- <strong>Conversational Development Environment</strong>: Request in natural language to write, modify, and analyze code
- <strong>Context-Aware</strong>: Understands the entire project and generates consistent code
- <strong>Tool Integration</strong>: Can use various tools like Bash, Git, file system, MCP servers
- <strong>Agent System</strong>: Automatically decomposes and executes complex tasks

#### Step 2: Understand Core Components

Claude Code consists of the following elements:

```
Claude Code System
├── LLM Engine (Claude Opus 4.5)
│   └── Natural language understanding and code generation
├── Tool System
│   ├── Bash (command execution)
│   ├── Read/Write/Edit (file manipulation)
│   ├── Grep/Glob (search)
│   └── Git (version control)
├── Context Management
│   ├── CLAUDE.md (project guide)
│   ├── Sub-agents (.claude/agents/)
│   └── Custom commands (.claude/commands/)
└── MCP Integration
    ├── Notion API
    ├── Playwright
    ├── Chrome DevTools
    └── Context7
```

#### Step 3: Experience How It Actually Works

When Claude Code receives a request, it operates as follows:

1. <strong>Understand</strong>: Read CLAUDE.md and project files to grasp context
2. <strong>Plan</strong>: Break down tasks with TodoWrite tool
3. <strong>Execute</strong>: Perform step-by-step tasks using tools
4. <strong>Verify</strong>: Check results with tests and builds
5. <strong>Report</strong>: Clearly explain performed tasks and results

### Code/Example

#### Example 1: Simple Feature Addition Request

```
User: "Please add tag filtering feature to the blog post list."

Claude Code workflow:
1. [Explore] Read src/pages/blog/index.astro file
2. [Explore] Analyze src/content/blog/ structure
3. [Plan] Create Todos:
   - [pending] Implement tag extraction logic
   - [pending] Create filter UI component
   - [pending] Implement filtering function
   - [pending] Test and verify
4. [Execute] Write and modify code
5. [Verify] Run npm run astro check
6. [Report] "Tag filtering feature has been added. Modified 3 files..."
```

#### Example 2: Complex Architecture Decision

```
User: "Apply multi-language SEO optimization to the blog."

Claude Code workflow:
1. [Activate Think Mode] Complex decision-making required
2. [Analyze]
   - Current structure: Language folders (ko/, en/, ja/, zh/)
   - SEO requirements: hreflang, canonical URL, sitemap
   - Identify metadata consistency issues
3. [Design]
   - Add hreflang to BaseHead.astro
   - Generate language-specific sitemaps
   - Customize Open Graph tags per language
4. [Implement] Write code step by step
5. [Verify] Test with Google Search Console
```

### Explanation

#### How Claude Code Works

Claude Code is fundamentally different from traditional code autocomplete:

<strong>1. Context-Based Understanding</strong>

While general autocomplete tools only see a few lines of the current file, Claude Code understands the entire project.

```typescript
// GitHub Copilot: Predicts next line based on current line
function calculateTotal(items: Item[]) {
  // Autocomplete suggestion at cursor position
}

// Claude Code: Understands project context
/*
- Recognizes Item type is defined in src/types/index.ts
- Knows price calculations in this project always include 10% tax
- Tests written in Jest and located in __tests__/ folder
- Function names follow camelCase, types follow PascalCase convention
*/
function calculateTotal(items: Item[]): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  return subtotal + tax;
}
```

<strong>2. Tool Utilization Capability</strong>

Claude Code doesn't just generate code—it can perform all tasks a developer does:

```bash
# File search
Search for all uses of "createUser" function with Grep tool

# Build and test
Execute "npm run build && npm test" with Bash tool

# Git operations
Execute "git add . && git commit -m 'feat: add user authentication'" with Bash tool

# File modification
Exact string replacement with Edit tool (line number based)
```

<strong>3. Iterative Improvement</strong>

Claude Code's goal isn't to generate perfect code in one attempt, but to derive optimal results through iteration:

```
1st attempt: Basic implementation
→ User feedback: "More specific"

2nd attempt: Detailed implementation
→ User feedback: "Needs SEO optimization"

3rd attempt: Applied SEO optimization
→ User feedback: "Performance improvement"

4th attempt: Optimized final version
→ Satisfied and commit
```

### Variations

#### Variation 1: Sub-agent Delegation

Delegate complex tasks to specialized agents:

```bash
# General request
"Write a blog post"

# Using sub-agents
@writing-assistant "Write blog about TypeScript 5.0 decorator feature"
@seo-optimizer "Optimize SEO for the written post"
@image-generator "Generate hero image"
@editor "Review grammar and style"
```

<strong>Benefits</strong>:
- Improved context focus (each agent focuses on specific domain only)
- Increased token efficiency (excludes unnecessary information)
- Clear separation of responsibilities

#### Variation 2: Using Think Mode

For complex decision-making:

```bash
"Use Think mode to design a database schema for this application
and suggest relationships between tables and indexing strategies."
```

<strong>Performance Improvement</strong>:
- Airline domain: 54% relative performance improvement
- SWE-bench: Average 1.6% improvement
- Particularly effective for complex reasoning tasks

#### Variation 3: MCP Server Integration

Integrate with external tools:

```bash
# Context7: Query latest documentation
"Use Context7 to query Astro 5.0 image optimization features"

# Playwright: Web automation
"Generate blog post OG images with Playwright"

# Notion: Database integration
"Read 'Blog Ideas in Progress' database from Notion"
```

---

## Recipe 1.2: Traditional IDE vs Claude Code (Differences and Advantages)

### Problem

Developers already use powerful IDEs like VSCode and IntelliJ IDEA, and are familiar with AI tools like GitHub Copilot. We need to clearly answer "What makes Claude Code better than existing tools?"

### Solution

Understand key differences through a comparison matrix.

#### Step 1: Feature Comparison Table

| Feature | VSCode + Copilot | Cursor | Claude Code |
|---------|-----------------|--------|-------------|
| <strong>Code Autocomplete</strong> | ✅ Excellent | ✅ Excellent | ⚠️ Limited |
| <strong>Whole Project Understanding</strong> | ⚠️ Limited | ✅ Good | ✅ Excellent |
| <strong>Natural Language Dialogue</strong> | ⚠️ Limited | ✅ Good | ✅ Excellent |
| <strong>Tool Utilization</strong> | ❌ Not possible | ⚠️ Limited | ✅ Excellent |
| <strong>Workflow Automation</strong> | ❌ Not possible | ⚠️ Limited | ✅ Excellent |
| <strong>Context Management</strong> | ❌ None | ⚠️ Basic | ✅ CLAUDE.md |
| <strong>Sub-agents</strong> | ❌ None | ❌ None | ✅ Full support |
| <strong>MCP Integration</strong> | ❌ None | ❌ None | ✅ Native |

#### Step 2: Real-World Task Scenario Comparison

<strong>Scenario 1: "Writing a Blog Post"</strong>

```bash
# VSCode + Copilot
1. Create file: src/content/blog/ko/new-post.md
2. Manually write frontmatter
3. Write content (Copilot autocompletes some sentences)
4. Manually create and upload images
5. Write English/Japanese versions separately
6. Manually optimize SEO metadata
7. Test build
8. Git commit
→ Time required: About 2〜3 hours

# Claude Code
1. Request: "/write-post TypeScript 5.0 decorator feature"
2. Claude automatically:
   - Creates 4 language versions (ko, en, ja, zh)
   - Generates hero image (Gemini API)
   - Optimizes SEO metadata
   - Recommends related posts (relatedPosts)
   - Verifies build (npm run build)
   - Git commit (feat(blog): add typescript decorators post)
→ Time required: About 10〜15 minutes
```

<strong>Scenario 2: "Performance Optimization"</strong>

```bash
# VSCode + Copilot
1. Manually run Chrome DevTools
2. Analyze performance issues
3. Manually modify code
4. Re-measure
5. Repeat
→ Problem: Unclear where to start

# Claude Code
Request: "Please optimize website performance"

Claude workflow:
1. [Analyze] Profile performance with Chrome DevTools MCP
2. [Report]
   - LCP (Largest Contentful Paint): 3.2s → Needs improvement
   - CLS (Cumulative Layout Shift): 0.15 → Good
   - Bottleneck: Hero image loading (1.8MB)
3. [Suggest]
   - Convert images to WebP
   - Apply lazy loading
   - Add font preload
4. [Implement] Automatically modify code
5. [Verify] Re-measure (LCP: 3.2s → 1.4s)
```

#### Step 3: Clarify Pros and Cons

<strong>Claude Code's Strengths</strong>:

1. <strong>Full Workflow Automation</strong>
   - Code writing + testing + building + committing all at once
   - Developers say "what," Claude handles "how"

2. <strong>Project Context Understanding</strong>
   - Reads CLAUDE.md and automatically follows project rules
   - Maintains consistent code style
   - Automatically learns existing patterns

3. <strong>Complex Task Decomposition</strong>
   - Automatically breaks down abstract requests like "multi-language blog SEO optimization"
   - Tracks progress with TodoWrite

4. <strong>Tool Integration</strong>
   - Uses all tools like code: Bash, Git, MCP servers
   - Capable of API calls, web automation, data analysis

<strong>Claude Code's Limitations</strong>:

1. <strong>Lack of Real-time Autocomplete</strong>
   - Copilot is superior for instant suggestions while typing
   - Solution: Use alongside Copilot in VSCode

2. <strong>Initial Setup Required</strong>
   - Needs CLAUDE.md writing
   - Time required for custom configuration per project

3. <strong>Cost</strong>
   - Token-based pricing (costs increase for large-scale tasks)
   - Copilot is monthly flat rate

### Code/Example

#### Example 1: Autocomplete vs Workflow Automation

```typescript
// GitHub Copilot strength: Real-time autocomplete
function fetchUserData(userId: string) {
  // [cursor position]
  // Copilot suggestion: return fetch(`/api/users/${userId}`).then(res => res.json());
}

// Claude Code strength: Full workflow
"Create a User API endpoint. Include authentication, error handling, types, and tests."

→ Claude generates:
1. src/types/user.ts (type definitions)
2. src/api/users.ts (API logic)
3. src/middleware/auth.ts (authentication)
4. src/utils/error.ts (error handling)
5. __tests__/api/users.test.ts (tests)
6. All files follow project conventions
```

#### Example 2: Difference in Context Understanding

```bash
# Copilot: Suggests based only on current file
// src/components/BlogCard.astro
<div class="card">
  <h2>{title}</h2>
  <!-- Copilot: Suggests <p>{description}</p> (common pattern) -->
</div>

# Claude Code: Follows project rules by reading CLAUDE.md
/*
Rules learned from CLAUDE.md:
- Use Tailwind CSS (no inline styles)
- Class order: layout → typography → color
- Responsive-first (mobile → desktop)
- Description 150 char limit (SEO)
*/

<div class="flex flex-col gap-4 p-6 rounded-lg bg-white hover:shadow-lg transition-shadow">
  <h2 class="text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
  <p class="text-base text-gray-600 line-clamp-3">{description}</p>
</div>
```

### Explanation

#### Why Claude Code is Different

<strong>1. Difference in Abstraction Level</strong>

```
GitHub Copilot: "Next line prediction" (line-level)
Cursor: "Function completion" (function-level)
Claude Code: "Task completion" (workflow-level)
```

Example:
```bash
# Same request, different results
Request: "Add login feature"

Copilot:
→ Creates one login function in current file

Cursor:
→ Generates login form component + authentication logic

Claude Code:
→ Login form + authentication logic + JWT token management +
  session storage + error handling + redirect +
  tests + security validation (CSRF, XSS prevention)
```

<strong>2. Difference in Learning Capability</strong>

Copilot learned from GitHub's public code, but doesn't know your project rules.

Claude Code learns project-specific rules through CLAUDE.md:

```markdown
## CLAUDE.md Example

### Git Commit Messages
**Format**: <type>(<scope>): <subject>

**Types**:
- feat: New feature
- fix: Bug fix

→ Claude now writes all commits following these rules
```

<strong>3. Tool Usage Capability</strong>

Copilot only generates code, but Claude Code uses tools like a developer:

```bash
# Tasks Claude Code can perform
1. Search for "TODO" comments with Grep
2. Analyze discovered TODO items
3. Establish implementation plan for each item
4. Write and modify code
5. Run tests (npm test)
6. Verify build (npm run build)
7. Git commit (feat: implement pending TODOs)
8. Write change summary report
```

### Variations

#### Variation 1: Hybrid Approach (VSCode + Copilot + Claude Code)

Optimal combination for productivity:

```bash
# Real-time coding: VSCode + Copilot
- Use autocomplete when writing functions
- Rapid prototyping

# Complex tasks: Claude Code
- Architecture design
- Multi-file refactoring
- Workflow automation
- Documentation generation

# Combined use case
1. Write draft with Copilot (fast)
2. Ask Claude Code to "refactor this code according to project conventions"
3. Complete optimal code
```

#### Variation 2: Tool Selection by Task Type

| Task Type | Recommended Tool | Reason |
|---------|----------|------|
| One-line code | Copilot | Best real-time autocomplete |
| Function writing | Copilot | Fast and accurate |
| Refactoring | Claude Code | Needs full context understanding |
| Adding new feature | Claude Code | Requires multi-file modifications |
| Debugging | Claude Code | Log analysis + root cause tracking capability |
| Writing tests | Claude Code | Edge case consideration |
| Writing documentation | Claude Code | Needs project understanding |

---

## Recipe 1.3: When to Use Claude Code

### Problem

Using Claude Code for every task is inefficient. We need clear criteria for when to use Claude Code and when to use existing tools.

### Solution

Use a decision-making framework by task type.

#### Step 1: Decision Flowchart

````mermaid
graph TD
    A[Start Task] --> B{Simple Repetitive?}
    B -->|Yes| C[Use Traditional Tools<br/>e.g., Copilot, macros]
    B -->|No| D{Project Context<br/>Needed?}
    D -->|No| E[Use ChatGPT<br/>e.g., Algorithm questions]
    D -->|Yes| F{Multi-file Modification?}
    F -->|No| G[Use Copilot<br/>e.g., Function writing]
    F -->|Yes| H[<strong>Use Claude Code</strong>]

    H --> I{Task Complexity?}
    I -->|Low| J[Direct Request]
    I -->|High| K[Use Sub-agents]
    I -->|Very High| L[Activate Think Mode]
````

#### Step 2: Suitability Checklist

<strong>Claude Code is suitable when</strong> (3 or more checked):

- [ ] Must follow project rules
- [ ] Must modify multiple files simultaneously
- [ ] Need workflow automation like test/build/deploy
- [ ] Complex decision-making required
- [ ] Must follow existing code patterns
- [ ] Need automatic git commit message generation
- [ ] Documentation creation or update needed
- [ ] External tool integration needed (API, DB, MCP)

<strong>Other tools are better when</strong>:

- [ ] Simple code autocomplete (→ Copilot)
- [ ] General knowledge questions (→ ChatGPT)
- [ ] Visual design work (→ Figma + AI plugins)
- [ ] Data analysis (→ Python + Jupyter)

#### Step 3: Practical Scenario Guide

<strong>Scenario A: Adding New Feature</strong>

```bash
Task: "Add user profile page"

Checklist:
✅ Must follow project structure (layouts, components, pages)
✅ Multi-file modification (route, component, types)
✅ Need test writing
✅ Need git commit

→ Conclusion: Use Claude Code
```

<strong>Scenario B: Bug Fix</strong>

```bash
Task: "Fix type error occurring during login"

Question 1: Modify only one file?
- No (need to check auth.ts, types/user.ts, login.tsx)

Question 2: Need context understanding?
- Yes (need to understand entire authentication flow)

→ Conclusion: Use Claude Code
```

<strong>Scenario C: Simple Function Writing</strong>

```bash
Task: "Utility function to remove duplicates from array"

Question 1: Project-specific logic?
- No (general JavaScript function)

Question 2: Multi-file modification?
- No (just add one function to utils.ts)

→ Conclusion: Use Copilot (faster)
```

### Code/Example

#### Example 1: When Claude Code Shines

<strong>Task: "Add search functionality to blog"</strong>

```bash
# Request to Claude Code
"Add full-text search functionality to the blog.
Must be able to search titles, content, and tags,
supporting Korean/English/Japanese."

# Claude workflow

1. [Explore]
   - Analyze src/content/blog/ structure
   - Check existing search-related code (Grep)
   - Understand Content Collections schema

2. [Plan]
   ✓ Create search index (title, description, tags)
   ✓ Write search API endpoint
   ✓ Create search UI component
   ✓ Implement multi-language tokenization logic
   ✓ Write tests

3. [Implement]
   Files created/modified:
   - src/utils/search.ts (search logic)
   - src/pages/api/search.ts (API)
   - src/components/SearchBar.astro (UI)
   - src/components/SearchResults.astro (result display)
   - __tests__/search.test.ts (tests)

4. [Verify]
   - npm run astro check (type check)
   - npm run build (build success)
   - Provide manual testing guide

5. [Commit]
   git commit -m "feat(blog): add multi-language search functionality

   - Implement search index with title, content, and tags
   - Add search API endpoint with language support
   - Create search UI components
   - Add unit tests

   🤖 Generated with Claude Code"
```

<strong>Time required</strong>:
- Manual work: 3〜4 hours
- Claude Code: 15〜20 minutes

#### Example 2: When Other Tools Are Better

<strong>Task: "Simple CSS style adjustment"</strong>

```css
/* Simple task: Change button color */
.button {
  background-color: #3b82f6; /* Blue → Need to change to green */
}

/* In this case */
1. Direct modification in VSCode (5 seconds)
2. Or ask Copilot "change to green" (10 seconds)

/* If using Claude Code */
1. Write and send request (20 seconds)
2. Claude reads file (5 seconds)
3. Modification suggestion (10 seconds)
4. Confirm and apply (10 seconds)
→ Total 45 seconds (actually slower)
```

<strong>Conclusion</strong>: Direct or Copilot use is more efficient for simple tasks

#### Example 3: Finding the Threshold

<strong>Threshold criterion</strong>: Claude Code is advantageous when 3 or more tasks are combined

```bash
# 1 task: Direct or Copilot
"Write a function" → Copilot

# 2 tasks: Copilot or Claude Code possible
"Write function + test" → Copilot also possible

# 3+ tasks: Claude Code recommended
"Write function + test + documentation + type definition" → Claude Code

# 5+ tasks: Claude Code essential
"New feature + multi-file + tests + documentation + commit" → Only Claude Code possible
```

### Explanation

#### Optimal Claude Code Usage Timing

<strong>1. Complexity Curve</strong>

```
Productivity
  ↑
  |                    Claude Code dominance zone
  |                 ╱
  |              ╱
  |    Copilot ╱
  |    zone   ╱
  |         ╱
  |       ╱
  |     ╱___________________
  +-------------------------→ Task Complexity
      Simple  Medium  Complex
```

- <strong>Simple tasks</strong> (complexity 1〜2): Copilot is faster
- <strong>Medium tasks</strong> (complexity 3〜5): Choose based on situation
- <strong>Complex tasks</strong> (complexity 6+): Claude Code essential

<strong>2. ROI (Return on Investment) Analysis</strong>

```typescript
// ROI calculation by task

interface TaskROI {
  setup: number;      // Initial setup time
  execution: number;  // Execution time
  quality: number;    // Output quality (1-10)
}

const copilot: TaskROI = {
  setup: 0,           // No setup needed
  execution: 10,      // Very fast
  quality: 7          // Pretty good
};

const claudeCode: TaskROI = {
  setup: 60,          // Write CLAUDE.md (one-time)
  execution: 30,      // Fast even for complex tasks
  quality: 9          // Very high
};

// Single task ROI
copilot.execution < claudeCode.execution
→ Copilot wins

// Full project ROI (10 tasks)
(copilot.execution * 10) vs (claudeCode.setup + claudeCode.execution * 10)
100 vs 360 → Copilot wins

// Full project ROI (100 tasks, considering quality)
(copilot.execution * 100 * copilot.quality) vs
(claudeCode.setup + claudeCode.execution * 100 * claudeCode.quality)
7000 vs 27060 → Claude Code overwhelmingly wins
```

<strong>Conclusion</strong>: Claude Code's ROI is much higher long-term

<strong>3. Optimal Tools by Task Type</strong>

| Task Type | Recommended Tool | Reason |
|---------|----------|------|
| <strong>Prototyping</strong> | Copilot | Fast draft writing |
| <strong>Production Code</strong> | Claude Code | Quality and consistency |
| <strong>Refactoring</strong> | Claude Code | Need full context |
| <strong>Bug Fixing</strong> | Claude Code | Root cause analysis capability |
| <strong>Test Writing</strong> | Claude Code | Edge case consideration |
| <strong>Documentation</strong> | Claude Code | Need project understanding |
| <strong>Simple Function</strong> | Copilot | Fastest |
| <strong>CSS Adjustment</strong> | Direct | Fastest |

### Variations

#### Variation 1: Gradual Adoption Strategy

When first using Claude Code, start small:

<strong>Phase 1</strong>: Start with documentation generation
```bash
"Write README.md. Include project structure, installation, and usage."
→ Low risk, immediate impact
```

<strong>Phase 2</strong>: Test writing
```bash
"Write tests for src/utils/format.ts."
→ No existing code modification, quality improvement
```

<strong>Phase 3</strong>: Refactoring
```bash
"Convert this component to TypeScript and change PropTypes to interface."
→ Medium difficulty, clear goal
```

<strong>Phase 4</strong>: New feature development
```bash
"Add user dashboard page. Include authentication, API, and UI."
→ High difficulty, maximum impact
```

#### Variation 2: Strategy by Team Size

<strong>Individual Developer</strong>:
- Use Claude Code for all complex tasks
- Invest time saved in learning and experimentation

<strong>Small Team (2〜5 people)</strong>:
- Write and share common CLAUDE.md
- Delegate roles with sub-agents (frontend, backend, DevOps)
- Use Claude for code review

<strong>Medium-Large Team (10+ people)</strong>:
- Build custom agents per project
- Integrate Claude into CI/CD pipeline
- Automate onboarding (explain project to new developers)

---

## Wrap-up: Core Principles of Using Claude Code

Through this chapter, you've understood the essence of Claude Code. Finally, let's summarize the core principles.

### 3 Core Principles

<strong>1. Context is Everything</strong>

```markdown
"Claude Code is only as smart as the context you provide."

Invest in:
- Writing CLAUDE.md (1 hour investment → 100 hours saved)
- Clear requests (abstract → specific)
- Visual references (mock, screenshots, examples)
```

<strong>2. Iteration Creates Perfection</strong>

```markdown
"First attempts don't need to be perfect."

1st: Basic implementation
2nd: Incorporate feedback
3rd: Optimization
4th: Completion

→ Claude learns and improves through iteration.
```

<strong>3. Use Tools as Tools Should Be Used</strong>

```markdown
"Claude Code is not a silver bullet."

Right tool for the right job:
- Complex tasks → Claude Code
- Simple repetition → Copilot or direct
- Learning → ChatGPT or documentation

→ Understand and combine tool strengths.
```

### Next Chapter Preview

In Chapter 2, we'll cover how to actually install and configure Claude Code. You'll learn practical setup step-by-step: writing CLAUDE.md, building sub-agents, integrating MCP servers, and more.

<strong>Topics in next chapter</strong>:
- Recipe 2.1: Claude Code Installation and Initial Setup
- Recipe 2.2: CLAUDE.md Writing Best Practices
- Recipe 2.3: Project-Specific Customization

---

## Summary

### What is Claude Code?
- Anthropic's AI pair programmer
- Automates entire workflow beyond code writing
- Understands project context and generates consistent code
- Infinitely extensible with tool integration and agent systems

### Differences from Traditional IDEs
- <strong>Abstraction level</strong>: Workflow-level, not line-level
- <strong>Context understanding</strong>: Learns project rules through CLAUDE.md
- <strong>Tool utilization</strong>: Can use all tools: Bash, Git, MCP
- <strong>Automation</strong>: Test → build → commit all at once

### When to Use?
- <strong>Suitable</strong>: Complex tasks, multi-file modifications, workflow automation
- <strong>Unsuitable</strong>: Simple autocomplete, one-line edits
- <strong>Threshold</strong>: Claude Code is overwhelmingly better when 3+ tasks are combined

### Key Lessons
1. Invest in context (CLAUDE.md)
2. Don't fear iteration
3. Use the right tool for each job

---

**Word count**: Approximately 4,200 words
**Page count**: Approximately 10 pages (A4 size)
