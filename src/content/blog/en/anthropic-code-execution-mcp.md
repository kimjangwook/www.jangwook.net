---
title: 'Anthropic''s Code Execution with MCP: A Paradigm Shift in AI Tool Integration'
description: >-
  Explore how Anthropic's Code Execution with MCP achieves 98.7% token reduction
  and 60% faster execution through sandboxed code-based tool orchestration.
pubDate: '2025-11-18'
heroImage: ../../../assets/blog/anthropic-code-execution-mcp-hero.jpg
tags:
  - mcp
  - anthropic
  - ai-agent
  - automation
relatedPosts:
  - slug: openai-agentkit-tutorial-part2
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
  - slug: langgraph-multi-agent
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
  - slug: google-analytics-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
  - slug: specification-driven-development
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
  - slug: bigquery-mcp-prefix-filtering
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
---

## Overview

In November 2025, Anthropic unveiled a groundbreaking innovation that fundamentally changes how AI agents interact with external tools and systems. <strong>Code Execution with MCP (Model Context Protocol)</strong> represents a paradigm shift from traditional sequential tool calling to code-based orchestration, achieving remarkable efficiency gains: a <strong>98.7% reduction in token consumption</strong> (from 150,000 to just 2,000 tokens) and <strong>60% faster execution</strong> in complex multi-tool workflows.

This innovation addresses one of the most critical bottlenecks in AI agent systems: the exponential growth of context window consumption as agents orchestrate multiple tools. By allowing AI models to write and execute code that calls tools directly within a secure sandbox, Anthropic has effectively solved the "context explosion" problem that has plagued enterprise AI implementations.

For developers building production AI systems, this represents more than just an optimization—it's a fundamental architectural shift that enables entirely new classes of applications, from complex data processing pipelines to privacy-preserving enterprise workflows.

## What is the Model Context Protocol (MCP)?

Before diving into Code Execution, it's essential to understand the foundation: the <strong>Model Context Protocol</strong>.

Launched in November 2024, MCP is an open-source standard created by Anthropic to provide a unified interface for connecting AI models to external data sources, tools, and systems. Think of it as a "USB-C for AI"—a universal connector that eliminates the need for custom integrations for each tool or data source.

The protocol standardizes how AI assistants discover, authenticate, and interact with external systems through three core primitives:

- <strong>Resources</strong>: Data sources (files, databases, APIs) that models can read
- <strong>Tools</strong>: Functions that models can execute to take actions
- <strong>Prompts</strong>: Reusable templates for common interactions

MCP quickly gained traction, with over <strong>10,000 community-built servers</strong> and integration into major platforms including Zed, Replit, Codeium, and Sourcegraph. However, as usage scaled, a critical limitation became apparent: the traditional tool-calling approach simply couldn't scale efficiently for complex, multi-step workflows.

## Limitations of Traditional Tool Calling

To understand why Code Execution represents such a breakthrough, we need to examine the fundamental limitations of traditional tool calling.

### The Sequential Call Problem

In the conventional approach, when an AI model needs to use multiple tools, it follows this pattern:

1. Model analyzes the task and decides which tool to call
2. Model sends the tool call request to the application
3. Application executes the tool and returns results
4. Results are added to the conversation context
5. Model reads all previous context plus new results
6. Model decides on the next action
7. Repeat for each tool call

For a simple task requiring 15 tool calls, this creates a cascade of problems:

<strong>Token Explosion</strong>: Each tool's output is added to the context window, which must be re-read on every subsequent call. A workflow that processes 100 database records can balloon to 150,000 tokens—consuming the entire context window of most models.

<strong>Latency Multiplication</strong>: Each tool call requires a full model inference cycle. With network latency and processing time, 15 tool calls can take 30-45 seconds, making real-time applications impossible.

<strong>Context Pollution</strong>: Intermediate results (like individual database rows or file contents) permanently occupy context space, even when only summary information is needed for the final output.

<strong>Control Flow Limitations</strong>: Complex logic like loops, conditionals, and error handling must be implemented through sequential model decisions, which is both slow and unreliable.

### The Real-World Impact

In production environments, these limitations manifest in critical ways:

- <strong>Cost</strong>: Processing large datasets can cost hundreds of dollars in API calls due to repeated context processing
- <strong>Reliability</strong>: Long chains of sequential calls increase failure points exponentially
- <strong>Privacy</strong>: All intermediate data must pass through the model provider's API, creating compliance issues for sensitive data
- <strong>Scalability</strong>: Context window limits create hard caps on workflow complexity

These aren't theoretical problems—they're the primary reasons why many ambitious AI agent projects fail to reach production.

## The Core Innovation of Code Execution with MCP

Code Execution with MCP introduces a fundamentally different approach: <strong>instead of the model making sequential tool calls, it writes code that orchestrates the tools, and that code executes in a secure sandbox</strong>.

Here's the revolutionary workflow:

1. <strong>Tool Discovery</strong>: Available tools are discovered from the filesystem, not registered through API calls
2. <strong>Code Generation</strong>: The AI model writes Python or TypeScript code that uses the tools
3. <strong>Sandboxed Execution</strong>: Code runs in an isolated environment with access to tool wrappers
4. <strong>Summary Return</strong>: Only the final summary or result is returned to the model—not intermediate outputs

This seemingly simple change unlocks massive benefits:

### Progressive Disclosure

Tools are loaded on-demand as the code imports them, rather than all tools being described upfront. For a system with 100 available tools, only the 3-5 actually used consume context tokens.

### Local Control Flow

Loops, conditionals, error handling, and complex logic execute locally in code—not through sequential model decisions. This is both faster and more reliable.

```python
# Traditional approach: 15+ model calls to process 100 records
# Code Execution approach: Single code generation, local execution

for record in database.query("SELECT * FROM users LIMIT 100"):
    if record['status'] == 'active':
        result = api.update_user(record['id'], {'last_checked': now()})
        if result.error:
            log_error(result.error)
        else:
            success_count += 1

return f"Updated {success_count} active users"
```

### Privacy Preservation

Intermediate data (like individual database records or file contents) never leaves the sandbox. Only the final summary is sent to the model provider, enabling compliant processing of sensitive data.

### State Persistence

Variables and data structures persist within the execution session, enabling complex multi-stage workflows without re-fetching data.

## Technical Architecture

Understanding the technical implementation reveals how Anthropic achieved these dramatic improvements while maintaining security and developer ergonomics.

### Filesystem-Based Tool Discovery

Traditional MCP servers register tools through API declarations. Code Execution instead uses <strong>filesystem-based discovery</strong>:

```
mcp-server/
├── tools/
│   ├── database/
│   │   ├── query.ts
│   │   └── update.ts
│   ├── api/
│   │   └── fetch.ts
│   └── file/
│       ├── read.ts
│       └── write.ts
└── index.ts
```

Each `.ts` file exports a function with standardized metadata:

```typescript
// tools/database/query.ts
export async function query(sql: string): Promise<Record[]> {
  // Implementation
}

query.description = "Execute SQL query and return records";
query.parameters = {
  sql: { type: "string", description: "SQL query to execute" }
};
```

This approach enables <strong>progressive loading</strong>: tools are only loaded when imported, reducing initial context consumption by 60-80%.

### Tool Wrapper Generation

When code execution begins, the sandbox automatically generates lightweight wrappers for each tool:

```typescript
// Auto-generated wrapper for database.query
import { mcp } from '@anthropic/sandbox-runtime';

export async function query(sql: string): Promise<Record[]> {
  return await mcp.callTool('database.query', { sql });
}
```

These wrappers provide a native programming interface while routing calls through the MCP protocol under the hood. Developers write normal code; the sandbox handles protocol translation.

### Sandboxed Execution Environment

Security is paramount when executing AI-generated code. Anthropic's sandbox runtime provides multiple layers of isolation:

<strong>Process Isolation</strong>: Uses bubblewrap (Linux) or seatbelt (macOS) to create a restricted process namespace

<strong>Filesystem Restrictions</strong>: Code can only access whitelisted paths, preventing unauthorized file access

<strong>Network Control</strong>: Outbound connections are limited to approved MCP servers

<strong>Resource Limits</strong>: CPU, memory, and execution time are capped to prevent resource exhaustion

<strong>API Rate Limiting</strong>: Tool calls are throttled to prevent abuse

Example sandbox configuration:

```typescript
import { createSandbox } from '@anthropic/sandbox-runtime';

const sandbox = createSandbox({
  runtime: 'node',
  timeout: 30000,  // 30 second max execution
  memory: '512MB',
  filesystem: {
    readOnly: ['/tools'],
    readWrite: ['/tmp']
  },
  network: {
    allowedHosts: ['mcp.example.com']
  }
});

const result = await sandbox.execute(code, {
  tools: ['database', 'api']
});
```

## Dramatic Performance Improvements

Anthropic's benchmarks demonstrate the real-world impact of this architectural shift.

### 98.7% Token Reduction

In a representative workflow processing 100 database records with filtering and API updates:

<strong>Traditional Tool Calling</strong>:
- Initial context: 5,000 tokens
- 100 database reads: 50,000 tokens (500 tokens per record)
- 15 API updates: 15,000 tokens
- Model reasoning between calls: 80,000 tokens
- <strong>Total: 150,000 tokens</strong>

<strong>Code Execution</strong>:
- Initial context: 1,000 tokens
- Generated code: 500 tokens
- Final summary: 500 tokens
- <strong>Total: 2,000 tokens</strong>

This 98.7% reduction translates directly to:
- <strong>75x lower API costs</strong> ($7.50 vs $0.10 per workflow at Claude 3.5 Sonnet pricing)
- <strong>Ability to process 75x more data</strong> within the same context window
- <strong>Support for longer conversations</strong> without context overflow

### 60% Faster Execution

Latency improvements are equally dramatic:

<strong>Traditional Approach</strong>:
- 15 sequential tool calls × 2 seconds each = 30 seconds
- Plus network latency and queuing: <strong>35-45 seconds total</strong>

<strong>Code Execution</strong>:
- Code generation: 3 seconds
- Local execution: 10 seconds (tools called in parallel/locally)
- Summary generation: 2 seconds
- <strong>Total: 15 seconds (60% faster)</strong>

For user-facing applications, this transforms experiences that feel broken (45-second waits) into responsive interactions (15 seconds).

## Key Features and Benefits

Beyond raw performance, Code Execution with MCP enables capabilities that were previously impractical or impossible.

### Progressive Tool Loading

Instead of describing all available tools upfront, tools are loaded only when imported:

```typescript
// Only loads and describes the 'database' tool
import { query } from './tools/database';

const records = await query("SELECT * FROM users");
```

For enterprise systems with hundreds of available tools, this reduces initial context consumption by <strong>80-95%</strong>, making comprehensive tool libraries practical.

### Local Control Flow

Complex programming constructs execute locally without model involvement:

```typescript
// This entire loop executes locally—not 100 sequential model calls
const results = [];
for (const user of users) {
  try {
    if (user.status === 'active' && user.lastLogin < thirtyDaysAgo) {
      const updated = await api.updateUser(user.id, {
        status: 'inactive'
      });
      results.push(updated);
    }
  } catch (error) {
    logger.error(`Failed to update user ${user.id}: ${error.message}`);
  }
}

return `Deactivated ${results.length} inactive users`;
```

This is not only faster but also more reliable—control flow is deterministic code execution, not probabilistic model decisions.

### Privacy Preservation

Sensitive data never leaves the sandbox:

```typescript
// Medical records are processed locally, only counts are returned
import { queryDatabase } from './tools/database';
import { encryptData } from './tools/crypto';

const patients = await queryDatabase("SELECT * FROM patients WHERE condition = 'diabetes'");

// Patient data stays in sandbox
const encrypted = patients.map(p => encryptData(p.medicalRecord));

// Only summary is returned to model
return {
  totalPatients: patients.length,
  avgAge: patients.reduce((sum, p) => sum + p.age, 0) / patients.length,
  encryptedRecordsStored: encrypted.length
};
```

This enables HIPAA, GDPR, and other compliance requirements that prohibit sending sensitive data to third-party APIs.

### State Persistence

Variables persist across the execution session:

```typescript
// First execution: Load and cache data
const productCatalog = await database.loadProducts();
return "Loaded 10,000 products";

// Second execution: Reuse cached data (no re-fetch)
const filteredProducts = productCatalog.filter(p => p.price < 100);
return `Found ${filteredProducts.length} products under $100`;
```

This enables multi-turn conversations that build on previous work without redundant data fetching.

## Real-World Use Cases

Early adopters have deployed Code Execution with MCP across diverse domains.

### Development Tool Integration

<strong>Zed Editor</strong>: Uses Code Execution to implement "AI Pair Programmer" that can refactor entire codebases. By generating code that traverses file trees, applies transformations, and runs tests, Zed achieves complex refactoring in seconds rather than minutes.

<strong>Replit</strong>: Enables "natural language deployments" where users describe infrastructure requirements and the AI generates Terraform code that provisions resources, all within a secure sandbox.

<strong>Sourcegraph</strong>: Implements semantic code search across millions of repositories by generating code that queries their graph database and post-processes results locally.

### Enterprise Data Processing

<strong>Block (formerly Square)</strong>: Processes financial transactions for fraud detection. Code Execution allows their AI to analyze thousands of transactions locally, apply custom business logic, and return only risk scores—keeping transaction details private.

<strong>Apollo GraphQL</strong>: Generates API integration code that queries GraphQL endpoints, transforms data, and updates internal systems—automating workflows that previously required manual engineering work.

<strong>Cognizant</strong>: Built an "Intelligent Document Processor" that extracts data from invoices, validates against business rules, and updates ERP systems—processing 100+ documents per run with 98% token savings.

### Document and Database Operations

A common pattern is the "cross-system workflow":

```typescript
// Read from Google Drive
import { listFiles, readFile } from './tools/google-drive';

const invoices = await listFiles({ folder: 'Invoices', since: '2025-01-01' });

// Process and transform
const processed = [];
for (const invoice of invoices) {
  const content = await readFile(invoice.id);
  const data = parseInvoice(content);

  if (data.amount > 10000) {
    // Write to Salesforce
    const sfRecord = await salesforce.createOpportunity({
      name: `Large Invoice ${data.invoiceNumber}`,
      amount: data.amount,
      stage: 'Proposal'
    });
    processed.push(sfRecord);
  }
}

return `Processed ${invoices.length} invoices, created ${processed.length} opportunities`;
```

This workflow would require 200+ tool calls traditionally (list files, read each, create records). With Code Execution, it's a single code generation plus local execution.

## Security Considerations

Executing AI-generated code introduces significant security challenges that must be addressed systematically.

### Key Risk Factors

Anthropic's security research identified critical vulnerabilities:

<strong>Command Injection (43% vulnerability rate)</strong>: AI models frequently generate code vulnerable to injection attacks:

```typescript
// Vulnerable code AI might generate
const userInput = request.params.filename;
await exec(`cat ${userInput}`);  // Can execute arbitrary commands

// Secure version
const allowedFiles = ['data.csv', 'report.txt'];
if (!allowedFiles.includes(userInput)) {
  throw new Error('Invalid file');
}
await readFile(userInput);
```

<strong>Context Window Attacks</strong>: Malicious tool descriptions can inject code into the generation process

<strong>Data Leakage</strong>: Without proper sandboxing, code could exfiltrate sensitive data

<strong>Resource Exhaustion</strong>: Infinite loops or memory-intensive operations can DoS the system

### Essential Security Measures

Anthropic recommends a defense-in-depth approach:

<strong>Sandbox Isolation</strong>: Mandatory for production deployments

```typescript
const sandbox = createSandbox({
  runtime: 'deno',  // Secure-by-default runtime
  permissions: {
    read: ['/app/data'],
    write: ['/tmp'],
    net: ['mcp.example.com'],
    env: false,
    run: false  // No subprocess execution
  }
});
```

<strong>Input Validation</strong>: All tool parameters must be validated before execution

```typescript
export async function query(sql: string): Promise<Record[]> {
  // Whitelist-based validation
  if (!sql.match(/^SELECT .+ FROM (users|products|orders)$/i)) {
    throw new Error('Invalid SQL query');
  }
  return executeQuery(sql);
}
```

<strong>Rate Limiting</strong>: Prevent abuse through API quotas

```typescript
const limiter = createRateLimiter({
  toolCalls: { max: 100, window: '1m' },
  execution: { max: 10, window: '1m' },
  tokens: { max: 1000000, window: '1h' }
});
```

<strong>Audit Logging</strong>: All tool calls and code executions must be logged for security monitoring

<strong>Centralized Governance</strong>: MCP server registry with approved tools only

## Implementation Guide

Getting started with Code Execution requires setting up both server and client components.

### Setting Up MCP Server

Create a basic MCP server with filesystem-based tools:

```typescript
// server/index.ts
import { MCPServer } from '@anthropic/mcp-sdk';
import { loadTools } from '@anthropic/mcp-tools';

const server = new MCPServer({
  name: 'enterprise-tools',
  version: '1.0.0'
});

// Automatically load tools from filesystem
const tools = await loadTools('./tools');

server.registerTools(tools);

server.listen(3000);
```

### Creating Tool Wrappers

Define tools with proper metadata:

```typescript
// tools/database/query.ts
import { z } from 'zod';
import { createTool } from '@anthropic/mcp-tools';

export const query = createTool({
  name: 'database.query',
  description: 'Execute SQL query against production database',

  parameters: z.object({
    sql: z.string().describe('SQL SELECT query'),
    limit: z.number().max(1000).default(100)
  }),

  async execute({ sql, limit }) {
    // Validate query
    if (!sql.toUpperCase().startsWith('SELECT')) {
      throw new Error('Only SELECT queries allowed');
    }

    // Execute with safety limits
    const results = await db.query(sql + ` LIMIT ${limit}`);

    return results;
  }
});
```

### Enabling Sandboxing

Configure the sandbox runtime:

```typescript
// client/sandbox.ts
import { createSandbox } from '@anthropic/sandbox-runtime';
import Anthropic from '@anthropic/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const sandbox = createSandbox({
  runtime: 'node',
  timeout: 30000,
  memory: '1GB',

  filesystem: {
    readOnly: ['/tools', '/node_modules'],
    readWrite: ['/tmp', '/workspace']
  },

  network: {
    allowedHosts: [
      'mcp.company.com',
      'api.internal.company.com'
    ]
  },

  env: {
    NODE_ENV: 'production',
    MCP_SERVER_URL: 'http://mcp.company.com'
  }
});

// Execute AI-generated code
const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  messages: [{
    role: 'user',
    content: 'Query the database for all active users and update their last_checked timestamp'
  }],
  tools: [{
    type: 'code_execution',
    sandbox: sandbox.config
  }]
});

// Extract and execute code
const codeBlock = response.content.find(c => c.type === 'code');
const result = await sandbox.execute(codeBlock.code);

console.log(result.output);
```

## Current Limitations

While Code Execution represents a major advancement, several limitations exist in the current implementation:

<strong>Infrastructure Complexity</strong>: Running sandboxed execution requires additional infrastructure (container runtime, resource management) compared to simple API-based tool calling. This increases operational overhead.

<strong>Performance Overhead for Simple Cases</strong>: For workflows requiring only 1-2 tool calls, the code generation and sandbox setup overhead can make Code Execution slower than direct tool calling.

<strong>Security Vulnerabilities</strong>: Despite sandboxing, AI-generated code has a 43% vulnerability rate in Anthropic's testing. Production deployments require additional security measures beyond the sandbox.

<strong>Remote Server Limitations</strong>: Currently, Code Execution works best with local MCP servers. Remote server support (planned for 2025) requires additional authentication and networking complexity.

<strong>Debugging Challenges</strong>: When generated code fails, debugging requires examining AI-generated code, which can be complex and non-idiomatic.

<strong>Language Support</strong>: Initial release supports Python and TypeScript/Node.js. Other languages (Go, Rust, Java) are planned but not yet available.

## Future Outlook

Anthropic's roadmap for Code Execution and MCP indicates significant expansion in 2025-2026.

### 2025 Roadmap

<strong>Remote Server Support</strong>: Full support for remote MCP servers with OAuth 2.1 authentication, enabling enterprise SaaS integrations.

<strong>Multi-Language Execution</strong>: SDKs for Go, Rust, and Java are in development, enabling code generation in the best language for each task.

<strong>Enhanced Sandboxing</strong>: Integration with Firecracker and gVisor for improved isolation and performance.

<strong>Enterprise Features</strong>:
- Centralized tool governance and approval workflows
- Audit logging and compliance reporting
- Role-based access control for tools
- Cost management and chargeback

<strong>Observability</strong>: Distributed tracing, metrics, and debugging tools for production deployments.

### Industry Adoption

Early indicators suggest rapid adoption:

- <strong>10,000+ MCP servers</strong> built by the community
- <strong>Major IDE integrations</strong>: Zed, Replit, Codeium, Cursor
- <strong>Enterprise partnerships</strong>: Block, Apollo, Cognizant, BrowserBase
- <strong>Analyst predictions</strong>: Gartner forecasts 60% of enterprise AI projects will use code execution patterns by end of 2026

The protocol's open-source nature and compelling performance benefits suggest it could become the de facto standard for AI-system integration—similar to how REST APIs became ubiquitous for web services.

## Conclusion

Anthropic's Code Execution with MCP represents a fundamental paradigm shift in how AI agents interact with tools and external systems. By moving from sequential tool calling to sandboxed code orchestration, it achieves:

- <strong>98.7% token reduction</strong>, slashing costs by 75x
- <strong>60% faster execution</strong> for complex workflows
- <strong>Privacy preservation</strong> through local data processing
- <strong>Enhanced reliability</strong> via deterministic control flow
- <strong>Progressive scaling</strong> from simple to complex tool ecosystems

For developers and enterprises building production AI systems, this innovation removes critical bottlenecks that previously limited agent capabilities. Workflows that were impossible due to context limits or cost prohibitive due to token consumption are now practical.

However, success requires careful attention to security (sandboxing, input validation, rate limiting), thoughtful tool design (clear interfaces, proper error handling), and operational maturity (monitoring, debugging, governance).

As the ecosystem matures and remote server support arrives in 2025, Code Execution with MCP has the potential to become the foundational layer for AI-powered automation—enabling the next generation of intelligent applications that seamlessly orchestrate complex, multi-system workflows while maintaining security, privacy, and cost-efficiency.

For teams considering adoption, the recommendation is clear: start with well-defined, high-value use cases (data processing, cross-system workflows), implement robust sandboxing and monitoring, and progressively expand as the platform matures. The performance benefits alone justify the investment, and the architectural advantages position you for the AI-native future.

## References

- [Anthropic Official Announcement: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [Model Context Protocol Official Documentation](https://modelcontextprotocol.io)
- [MCP Specification (GitHub)](https://github.com/modelcontextprotocol/specification)
- [Sandbox Runtime Implementation](https://github.com/anthropic-experimental/sandbox-runtime)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Security Best Practices for Code Execution](https://www.anthropic.com/security/code-execution)
- [Community MCP Servers Registry](https://github.com/modelcontextprotocol/servers)
