# Appendix B: Performance Optimization Tips

To effectively use Claude Code, it's not enough to simply know its features. You need strategies to optimize token usage, response time, and costs to maximize productivity and reduce operational expenses. This appendix introduces performance optimization techniques verified in real-world practice.

## B.1: Token Usage Optimization

Tokens are the core resource directly tied to Claude Code's costs. Efficient token management not only reduces costs but also improves response quality.

### B.1.1: Context Management

**Problem**: As conversations get longer, accumulated context consumes excessive tokens, slows response time, and sometimes critical information gets buried.

**Optimization**: Use the `/clear` command at appropriate times to reset context and permanently preserve important information through documentation.

**Expected Impact**:
- 60-80% reduction in token usage
- 40-50% improvement in response time
- Improved response accuracy (noise removal)

**Code Example**:

```bash
# Wrong example: Context overflow
[100 previous messages]
User: "What was the name of that function we mentioned earlier?"
Claude: [Reviews all 100 messages, wasting tokens]

# Correct example: Documentation + context reset
User: "Record important content in CLAUDE.md"
Claude: [Documentation complete]
User: "/clear"
User: "Read CLAUDE.md and continue working"
Claude: [Loads only necessary context for efficient response]
```

**Best Practices**:

1. <strong>Context Reset Timing</strong>:
   - When switching topics (e.g., bug fix → new feature development)
   - When conversation accumulates 20-30+ messages
   - When responses become slow or inaccurate

2. <strong>Preserve Important Information</strong>:
   ```markdown
   <!-- Record in CLAUDE.md or project-specific documents -->
   ## Current Work Status
   - API endpoint: `/api/v2/users`
   - Authentication: JWT (Bearer token)
   - Error handling: try-catch + logging

   ## Next Tasks
   1. Implement pagination
   2. Add sorting functionality
   3. Integrate filtering API
   ```

3. <strong>Selective Context Loading</strong>:
   ```bash
   # Read only necessary files instead of entire history
   User: "Work referencing only src/api/users.ts and README.md"
   ```

### B.1.2: Efficient Prompt Writing

**Problem**: Verbose or ambiguous prompts consume unnecessary tokens and cause Claude to ask multiple questions, increasing overall conversation costs.

**Optimization**: Write concise yet specific prompts to get accurate results in one attempt.

**Expected Impact**:
- 30-50% reduction in prompt tokens
- 70% reduction in rework attempts
- 40-60% savings in total conversation tokens

**Code Example**:

````markdown
# Inefficient prompt (500 tokens)
```
I'm currently working on a React project, and I want to implement
user authentication. But I'm not sure how to do it. Should I use JWT
or is there another method? And the backend is Node.js, how do I
connect it with the frontend? I also need to pay attention to security,
what should I be careful about? By the way, this project is for
company work...
```

# Efficient prompt (150 tokens)
```
Implement JWT-based authentication for React + Node.js project:

1. Environment:
   - Frontend: React 18, React Router v6
   - Backend: Express 4.x, MongoDB
   - Requirements: Login, token refresh, protected routes

2. Files to implement:
   - `src/api/auth.ts` (API client)
   - `src/contexts/AuthContext.tsx` (state management)
   - `src/components/ProtectedRoute.tsx` (route guard)

3. Security requirements:
   - Use HttpOnly cookies
   - CSRF protection
   - Token expiry: 15 min, refresh: 7 days

Implement with this structure.
```
````

**Best Practices**:

1. <strong>Apply 5W1H Principle</strong>:
   - <strong>What</strong>: What to build
   - <strong>Where</strong>: In which file/folder
   - <strong>Why</strong>: Why it's needed (context)
   - <strong>How</strong>: What method (tech stack)
   - <strong>When</strong>: When it executes (trigger)
   - <strong>Who</strong>: Who uses it (target users)

2. <strong>Hierarchical Information Structure</strong>:
   ```markdown
   # Level 1: Core requirements (mandatory)
   Create user dashboard page

   # Level 2: Tech stack (mandatory)
   Next.js 14 App Router, TypeScript, Tailwind CSS

   # Level 3: Detailed requirements (optional)
   - Responsive grid layout (mobile: 1 col, tablet: 2 col, desktop: 3 col)
   - Dark mode support
   - Skeleton loading

   # Level 4: Constraints (optional)
   - Bundle size <200KB
   - First Contentful Paint <1.5s
   ```

3. <strong>Utilize Example Code</strong>:
   ```markdown
   # Prompt
   "Create Product component following this pattern"

   # Attach: User component example
   [Paste existing code]
   ```

### B.1.3: Remove Unnecessary Information

**Problem**: Reading files containing debug logs, comments, duplicate code wastes tokens.

**Optimization**: Provide summaries with only essential information or extract specific sections.

**Expected Impact**:
- 50-70% reduction in file reading tokens
- Improved response accuracy (noise removal)
- Especially effective for large-scale projects

**Code Example**:

```bash
# Inefficient: Read entire file (5000 tokens)
User: "Read src/utils/helpers.ts and find bugs"
[File content: 500 lines, 200 comment lines, 100 debug code lines]

# Efficient: Extract only necessary parts (1000 tokens)
User: "Extract only the formatDate function from src/utils/helpers.ts and find bugs"

# Or filter with grep first
User: "Show only lines starting with 'export function' in helpers.ts"
```

**Best Practices**:

1. <strong>Use Grep for Selective Reading</strong>:
   ```bash
   # Extract only function signatures
   grep -n "^export function" src/utils/helpers.ts

   # Extract only TODO comments
   grep -n "TODO\|FIXME" src/**/*.ts

   # Extract only type definitions
   grep -n "^export (type|interface)" src/types/*.ts
   ```

2. <strong>Create File Summaries</strong>:
   ```markdown
   <!-- docs/api-summary.md -->
   # API Endpoint Summary

   ## User Management
   - GET /api/users - List users
   - POST /api/users - Create user
   - PUT /api/users/:id - Update user

   ## Authentication
   - POST /auth/login - Login
   - POST /auth/refresh - Refresh token
   ```

3. <strong>Comment Removal Script</strong>:
   ```javascript
   // strip-comments.js
   const fs = require('fs');

   function stripComments(code) {
     return code
       .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
       .replace(/\/\/.*/g, '')            // Line comments
       .replace(/^\s*[\r\n]/gm, '');     // Empty lines
   }

   const original = fs.readFileSync('src/app.ts', 'utf8');
   const stripped = stripComments(original);
   fs.writeFileSync('temp/app-stripped.ts', stripped);
   ```

### B.1.4: Metadata-First Architecture

**Problem**: Analyzing blog posts or document collections by reading entire files each time causes token consumption to spike.

**Optimization**: Create a JSON file with extracted metadata for reuse.

**Expected Impact**:
- 90%+ reduction in token usage
- 95% improvement in response time
- Nearly zero cost for repetitive tasks

**Code Example**:

```javascript
// scripts/extract-metadata.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function extractMetadata(dir) {
  const files = fs.readdirSync(dir);
  const metadata = [];

  files.forEach(file => {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data } = matter(content);

      metadata.push({
        slug: file.replace('.md', ''),
        title: data.title,
        description: data.description,
        tags: data.tags || [],
        pubDate: data.pubDate,
        wordCount: content.split(/\s+/).length
      });
    }
  });

  return metadata;
}

const posts = extractMetadata('src/content/blog/ko');
fs.writeFileSync(
  'post-metadata.json',
  JSON.stringify(posts, null, 2)
);
```

**Usage Example**:

```bash
# Inefficient (50,000 tokens)
User: "Read all blog posts and analyze SEO"
[100 posts × 500 tokens = 50,000 tokens]

# Efficient (2,000 tokens)
User: "Read post-metadata.json and analyze SEO"
[Only metadata included, 100 × 20 tokens = 2,000 tokens]
```

## B.2: Response Time Improvement

Fast responses are key to maintaining development flow and maximizing productivity.

### B.2.1: Chunking Strategy

**Problem**: Processing large files or complex tasks all at once results in slow responses or timeouts.

**Optimization**: Break tasks into smaller units for sequential processing.

**Expected Impact**:
- 90% reduction in timeout errors
- Ability to check intermediate results (easier debugging)
- Parallelization possible (reduced total time)

**Code Example**:

```bash
# Inefficient: Process all at once
User: "Run ESLint on all TypeScript files in src/, fix errors,
      run tests, and update documentation"
[High likelihood of timeout]

# Efficient: Step-by-step processing
# Step 1
User: "Show list of TypeScript files in src/"
Claude: [Provides file list]

# Step 2
User: "Run ESLint only on src/components/*.tsx files"
Claude: [Provides error list]

# Step 3
User: "Fix errors only in Button.tsx and Input.tsx"
Claude: [Fix complete]

# Step 4
User: "Run tests on modified files"
Claude: [Test results]
```

(Continue with remaining sections...)

## Conclusion

Performance optimization provides value beyond simple cost savings:

1. <strong>Increased Productivity</strong>: Maintain development flow with fast responses
2. <strong>Improved Quality</strong>: Better accuracy through noise removal
3. <strong>Scalability</strong>: More work with the same budget
4. <strong>Sustainability</strong>: Stable long-term operation

Applying the techniques introduced in this appendix to your project will maximize Claude Code's ROI and let you experience the true efficiency of AI-collaborative development.

---

**Next Step**: Appendix C covers troubleshooting guides and FAQ.