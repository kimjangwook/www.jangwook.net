---
title: 'ADL: The OpenAPI of AI Agent Governance'
description: 'Explore ADL for declarative agent definition and standardization, with governance strategies for engineering leaders and CTOs.'
pubDate: '2026-03-07'
heroImage: ../../../assets/blog/adl-agent-definition-language-governance-hero.jpg
tags:
  - ai-agent
  - governance
  - adl
relatedPosts:
  - slug: nist-ai-agent-security-standards
    score: 0.92
    reason:
      ko: 'AI 에이전트 표준화와 거버넌스를 다루는 점에서 직접적으로 관련됩니다.'
      ja: 'AIエージェントの標準化とガバナンスを扱う点で直接的に関連します。'
      en: 'Directly related in covering AI agent standardization and governance.'
      zh: '在AI智能体标准化和治理方面直接相关。'
  - slug: anthropic-agent-skills-standard
    score: 0.88
    reason:
      ko: 'AI 에이전트 역량 정의와 표준화라는 공통 주제를 다룹니다.'
      ja: 'AIエージェントの能力定義と標準化という共通テーマを扱います。'
      en: 'Shares the common theme of AI agent capability definition and standardization.'
      zh: '共同探讨AI智能体能力定义和标准化主题。'
  - slug: specification-driven-development
    score: 0.85
    reason:
      ko: '선언적 사양 기반 개발이라는 패러다임을 공유합니다.'
      ja: '宣言的な仕様ベース開発というパラダイムを共有します。'
      en: 'Shares the paradigm of declarative specification-driven development.'
      zh: '共享声明式规范驱动开发的范式。'
  - slug: dena-llm-study-part5-agent-design
    score: 0.82
    reason:
      ko: '에이전트 설계 패턴과 멀티 에이전트 오케스트레이션에서 연결됩니다.'
      ja: 'エージェント設計パターンとマルチエージェントオーケストレーションで繋がります。'
      en: 'Connected through agent design patterns and multi-agent orchestration.'
      zh: '通过智能体设计模式和多智能体编排相连。'
  - slug: ai-agent-collaboration-patterns
    score: 0.80
    reason:
      ko: 'AI 에이전트 간 협업과 역할 정의라는 주제에서 관련됩니다.'
      ja: 'AIエージェント間の協業と役割定義というテーマで関連します。'
      en: 'Related through the topic of AI agent collaboration and role definition.'
      zh: '通过AI智能体协作和角色定义主题相关。'
---

## Overview

The AI agent ecosystem is exploding in 2026, but one critical problem persists: <strong>agent definitions are scattered across code, prompts, and configuration files, making it impossible to understand exactly what an agent can do at a glance</strong>.

<strong>Agent Definition Language (ADL)</strong>, released by Next Moca under Apache 2.0 license, addresses this head-on. Just as OpenAPI (Swagger) declaratively defined "what an API does" in the API world, ADL is a vendor-neutral standard that declaratively defines "what an AI agent does."

This article breaks down ADL's core architecture, its relationship to existing standards (MCP, OpenAPI, A2A), and governance strategies that Engineering Managers and CTOs should prioritize.

## The Problems ADL Solves

Currently, most organizations manage AI agents in a fragmented state:

```mermaid
graph TD
    subgraph CurrentState["Current: Scattered Agent Definitions"]
        A["Prompts<br/>(system prompt)"] ~~~ B["Code<br/>(Python/TypeScript)"]
        B ~~~ C["Config Files<br/>(.env, config)"]
        C ~~~ D["Undocumented<br/>Implicit Assumptions"]
    end
    subgraph AfterADL["After ADL: Single Definition"]
        E["agent.adl.json<br/>Declarative Definition File"]
    end
    CurrentState -->|"ADL Standardization"| AfterADL
```

Specifically, ADL solves these problems:

- <strong>Lack of Visibility</strong>: Impossible to quickly understand what tools an agent accesses and what data it uses
- <strong>Governance Gaps</strong>: Security teams cannot pre-audit agent permissions
- <strong>Reproducibility Issues</strong>: Cannot track "which version was deployed with which configuration"
- <strong>Cross-team Communication Breakdown</strong>: Development, security, and compliance teams cannot discuss agents in a common language

## ADL's Core Architecture

ADL is JSON Schema-based and declaratively defines agents through six modules:

```mermaid
graph TD
    Agent["Agent Definition<br/>(agent.adl.json)"]
    Agent --> Meta["1. Metadata<br/>Name, Role, Version"]
    Agent --> LLM["2. LLM Configuration<br/>Model, Temperature"]
    Agent --> Tools["3. Tool Definitions<br/>Functions, APIs, MCP"]
    Agent --> RAG["4. RAG Input<br/>Documents, Code, Vector DB"]
    Agent --> Perms["5. Permission Boundaries<br/>Network, Files, Env Vars"]
    Agent --> Deps["6. Dependencies<br/>Packages, Code References"]
```

### 1. Agent Metadata

```json
{
  "name": "code-review-agent",
  "displayName": "Code Review Assistant",
  "description": "Agent for automated code review on pull requests",
  "role": "Code quality inspection and improvement suggestions",
  "version": "2.1.0",
  "owner": "platform-team@company.com",
  "created": "2026-01-15T09:00:00Z",
  "modified": "2026-02-28T14:30:00Z"
}
```

Through semantic versioning and owner information, you can immediately grasp <strong>who manages this agent and which version is running in production</strong>.

### 2. LLM Configuration

```json
{
  "llm": {
    "provider": "anthropic",
    "model": "claude-opus-4-6",
    "parameters": {
      "temperature": 0.3,
      "maxTokens": 4096
    }
  }
}
```

By explicitly declaring the LLM provider and model, you can track change history when swapping models and detect performance regressions.

### 3. Tool Definitions

```json
{
  "tools": [
    {
      "name": "github_pr_review",
      "description": "Retrieves changes from a GitHub PR and creates review comments",
      "invocationType": "mcp",
      "category": "Code Review",
      "parameters": [
        {
          "name": "pr_url",
          "type": "string",
          "description": "URL of the PR to review",
          "required": true
        },
        {
          "name": "review_depth",
          "type": "string",
          "description": "Review depth (quick|standard|deep)",
          "required": false
        }
      ],
      "returnType": "ReviewResult"
    }
  ]
}
```

By specifying each tool's invocation method (Python function, HTTP, MCP, etc.) and parameters, security teams can pre-review <strong>the complete list of external systems an agent can access</strong>.

### 4. Permission Boundaries

```json
{
  "permissions": {
    "networkAccess": {
      "allowed": true,
      "domainWhitelist": [
        "api.github.com",
        "api.anthropic.com"
      ]
    },
    "fileAccess": {
      "readPaths": ["/workspace/src/**"],
      "writePaths": ["/workspace/reviews/**"]
    },
    "environmentVariables": {
      "exposed": ["GITHUB_TOKEN", "ANTHROPIC_API_KEY"]
    },
    "sandbox": {
      "enabled": true,
      "constraints": ["no-internet-except-whitelist"]
    }
  }
}
```

This is ADL's most powerful feature. By defining network access, filesystem, and environment variable exposure scope through <strong>declarative specifications instead of code</strong>, automatic validation becomes possible in CI/CD pipelines.

## ADL and Existing Standards

ADL does not replace existing standards but rather complements them as a <strong>"definition layer"</strong>:

```mermaid
graph TD
    subgraph DefinitionLayer["Definition Layer"]
        ADL["ADL<br/>Defines what the agent is"]
    end
    subgraph CommunicationLayer["Communication Layer"]
        MCP["MCP<br/>Tool invocation protocol"]
        A2A["A2A<br/>Agent-to-agent communication"]
    end
    subgraph APILayer["API Layer"]
        OpenAPI["OpenAPI<br/>REST API definition"]
    end
    subgraph ExecutionLayer["Execution Layer"]
        WF["Workflow Engine<br/>Execution orchestration"]
    end
    ADL -->|"What tools it uses"| MCP
    ADL -->|"What APIs it accesses"| OpenAPI
    ADL -->|"How it collaborates"| A2A
    ADL -->|"In what order it executes"| WF
```

| Standard | Role | Relationship to ADL |
|----------|------|-------------------|
| <strong>OpenAPI</strong> | REST API definition | API tool specs that ADL references |
| <strong>MCP</strong> | Tool invocation protocol | ADL declares "which MCP servers it uses" |
| <strong>A2A</strong> | Agent-to-agent communication | ADL defines "which agents it collaborates with" |
| <strong>Workflow Engine</strong> | Execution order management | ADL handles static definition only; runtime is separate |

The key difference is that <strong>ADL is a static specification, not a runtime protocol</strong>. It provides the "blueprint" for an agent, while actual execution is handled by runtime protocols like MCP or A2A.

## From EM/CTO Perspective: ADL-Based Governance Strategy

### 1. Integrate ADL Validation into CI/CD Pipelines

```mermaid
graph TD
    Dev["Developer<br/>Writes agent.adl.json"] --> PR["Pull Request"]
    PR --> Lint["ADL Lint<br/>Schema Validation"]
    Lint --> Sec["Security Review<br/>Permission Scope Check"]
    Sec --> Approve["Approve/Reject"]
    Approve -->|Approved| Deploy["Deploy"]
    Approve -->|Rejected| Dev
```

Using ADL's JSON Schema, you can automatically validate before agent deployment:

- Whether the network whitelist complies with policy
- Whether file access scope adheres to least privilege principle
- Whether the LLM model is on an approved list
- Whether all required metadata (owner, version) are provided

### 2. Build an Agent Catalog

By managing ADL definitions of all agents in your organization in a central repository, you can automatically build an <strong>agent catalog</strong>:

```json
{
  "catalog": [
    {
      "name": "code-review-agent",
      "version": "2.1.0",
      "owner": "platform-team",
      "tools": ["github_pr_review", "jira_comment"],
      "llm": "claude-opus-4-6",
      "riskLevel": "medium"
    },
    {
      "name": "deployment-agent",
      "version": "1.0.3",
      "owner": "devops-team",
      "tools": ["kubectl_apply", "slack_notify"],
      "llm": "gpt-5.3-codex",
      "riskLevel": "high"
    }
  ]
}
```

This enables CTOs to see at a glance via dashboard: "How many agents are currently running in our organization, and what system access permissions does each have?"

### 3. Change History and Rollback

Since ADL files are version-controlled in Git:

- <strong>Change History</strong>: Diff shows "when this agent's permissions were expanded"
- <strong>Rollback</strong>: Recover instantly to a previous ADL definition if issues arise
- <strong>Audit Trail</strong>: Gather evidence for compliance requirements

## Real-World Scenario: Defining a Code Review Agent

A complete example of defining a code review agent with ADL in an actual organization:

```json
{
  "name": "code-review-agent",
  "displayName": "Code Review Agent",
  "description": "Automatically detects code quality issues, security vulnerabilities, and performance problems in pull requests",
  "role": "senior-code-reviewer",
  "version": "2.1.0",
  "owner": "platform-team@company.com",
  "llm": {
    "provider": "anthropic",
    "model": "claude-opus-4-6",
    "parameters": {
      "temperature": 0.2,
      "maxTokens": 8192
    }
  },
  "tools": [
    {
      "name": "github_pr_diff",
      "invocationType": "mcp",
      "category": "Code Review",
      "parameters": [
        {"name": "pr_number", "type": "integer", "required": true}
      ]
    },
    {
      "name": "sonarqube_scan",
      "invocationType": "http",
      "category": "Code Quality",
      "parameters": [
        {"name": "project_key", "type": "string", "required": true}
      ]
    }
  ],
  "rag": [
    {
      "name": "coding-standards",
      "type": "documents",
      "location": "s3://company-docs/coding-standards/",
      "description": "Company coding standards documentation"
    }
  ],
  "permissions": {
    "networkAccess": {
      "allowed": true,
      "domainWhitelist": [
        "api.github.com",
        "sonarqube.internal.company.com"
      ]
    },
    "fileAccess": {
      "readPaths": ["/workspace/**"],
      "writePaths": []
    },
    "sandbox": {"enabled": true}
  },
  "dependencies": {
    "packages": ["pygithub>=2.0", "requests>=2.31"]
  },
  "governance": {
    "created": "2026-01-15T09:00:00Z",
    "createdBy": "kim.jangwook@company.com",
    "modified": "2026-02-28T14:30:00Z",
    "modifiedBy": "kim.jangwook@company.com",
    "changeLog": "v2.1.0: Added SonarQube integration, expanded security scan coverage"
  }
}
```

## Adoption Roadmap

Since ADL is still in early stages, a phased adoption approach is realistic:

```mermaid
graph TD
    P1["Phase 1: Documentation<br/>Document existing agents<br/>in ADL format"] --> P2["Phase 2: Validation<br/>Integrate ADL lint<br/>into CI/CD"]
    P2 --> P3["Phase 3: Governance<br/>Build agent catalog<br/>dashboard"]
    P3 --> P4["Phase 4: Automation<br/>Auto-generate agent<br/>scaffolding from ADL"]
```

- <strong>Phase 1</strong> (1-2 weeks): Document currently running agents in ADL format
- <strong>Phase 2</strong> (2-4 weeks): Add JSON Schema validation to CI pipeline
- <strong>Phase 3</strong> (1-2 months): Build agent catalog and permission dashboard
- <strong>Phase 4</strong> (3-6 months): Auto-generate agent scaffolding from ADL definitions

## Conclusion

ADL adds an important layer of <strong>"declarative definition separate from code"</strong> to AI agent development. Just as OpenAPI standardized the REST API ecosystem, ADL has the potential to solve visibility, governance, and reproducibility problems in the agent ecosystem.

For Engineering Managers and CTOs particularly:

- <strong>Security Governance</strong>: Pre-audit agent permissions like code reviews
- <strong>Organizational Visibility</strong>: Enterprise-wide AI asset understanding through agent catalog
- <strong>Change Management</strong>: Git-based version control enables audit trails and rollback support

Though still in early stages, it's a good time to start paying attention to and considering pilot deployments of this Apache 2.0-licensed open source standard.

## References

- [ADL GitHub Repository (Next Moca)](https://github.com/nextmoca/adl)
- [ADL Official Blog — Next Moca](https://www.nextmoca.com/blogs/agent-definition-language-adl-the-open-source-standard-for-defining-ai-agents)
- [InfoQ — Next Moca Releases Agent Definition Language](https://www.infoq.com/news/2026/02/agent-definition-language/)
- [TechCrunch — Guide Labs Debuts Interpretable LLM](https://techcrunch.com/2026/02/23/guide-labs-debuts-a-new-kind-of-interpretable-llm/)
