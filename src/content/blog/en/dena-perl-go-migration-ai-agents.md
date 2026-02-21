---
title: 'DeNA''s Perl-to-Go Migration: Two AI Agent Types Cut 6 Months Down to 1 Month'
description: >-
  How DeNA migrated 6,000 lines of Perl to Go using two specialized AI agents —
  one for conversion, one for verification — completing a 6-month project in
  just 1 month.
pubDate: '2026-02-11'
heroImage: ../../../assets/blog/dena-perl-go-migration-ai-agents-hero.png
tags:
  - ai-agent
  - legacy-migration
  - go
  - perl
  - dena
  - case-study
relatedPosts:
  - slug: ai-agent-cost-reality
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-agent-teams-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

## Overview

Migrating large-scale legacy code to modern languages is a challenge every organization recognizes as important but keeps pushing down the priority list. DeNA solved this problem dramatically using AI agents. When migrating a server asset management API written in 6,000 lines of Perl to Go, they deployed two types of AI agents — a <strong>conversion agent</strong> and a <strong>verification agent</strong> — in parallel, completing what would normally take six months in <strong>just one month</strong>.

## Background: Why Migration Was Necessary

DeNA's server asset management API was built in Perl in 2018, managing information such as server names, purposes, and IP addresses for thousands of servers across the company's services.

While the system had no major defects, the switch to a modern language was necessary for several reasons:

- <strong>Perl's future outlook</strong>: Concerns about the language's longevity and shrinking community
- <strong>Maintainability</strong>: Difficulty recruiting developers with Perl experience
- <strong>Resource constraints</strong>: Despite recognizing the need, the migration kept being deprioritized due to the significant effort required

Keisuke Koike, Deputy Director of the IT Infrastructure Division at DeNA, explained: "It was clear the project would require significant effort, so we just couldn't prioritize it."

## DeNA's "AI All-In" Strategy

In February 2025, DeNA founder and chairperson Tomoko Namba announced the company's <strong>"AI All-In" declaration</strong> — a commitment to leveraging AI extensively to boost productivity and build an organization capable of running existing businesses with half the workforce.

As part of this strategy, the server asset management API modernization was selected as one of several AI-powered pilot projects.

## Core Strategy: Two-Agent Division of Labor

The most innovative aspect of this project was the decision to <strong>deploy two types of AI agents with distinct specializations</strong>.

```mermaid
graph LR
    A[Perl Source Code<br/>6,000 lines] --> B[Conversion AI Agent]
    B --> C[Go Code Generated<br/>~10,000 lines]
    C --> D[Verification AI Agent]
    D -->|Issues Found| B
    D -->|Verification Passed| E[Production Deploy]
```

### 1. Conversion AI Agent

- <strong>Role</strong>: Transform Perl code into Go code
- <strong>Specialization</strong>: Optimized for code generation
- <strong>Output</strong>: ~6,000 lines of Perl → ~10,000 lines of Go

### 2. Verification AI Agent

- <strong>Role</strong>: Validate the accuracy of converted Go code
- <strong>Specialization</strong>: Optimized for testing and quality verification
- <strong>Process</strong>: Feeds issues back to the conversion agent when problems are found

This two-agent system enabled rapid iteration of the <strong>conversion → verification → correction</strong> cycle, compressing what would take over six months manually into a single month.

## Project Timeline

| Period | Activity |
|--------|----------|
| Late Oct – Late Nov 2025 | Perl-to-Go migration execution (1 month) |
| Dec 2025 – Jan 2026 | Development environment validation (~2 months) |
| Late Jan 2026 | Production deployment |

## Insights: How to Apply AI to Legacy Migration

### The Power of Agent Specialization

Rather than asking a single AI to "convert and verify," the key was <strong>clearly separating roles</strong> to maximize each agent's strengths.

```mermaid
graph TD
    subgraph Traditional Approach
        H[Developer] --> I[Code Analysis]
        I --> J[Manual Conversion]
        J --> K[Write Tests]
        K --> L[Debug]
        L -->|Repeat| J
    end

    subgraph AI Agent Approach
        M[Conversion Agent] --> N[Automated Conversion]
        O[Verification Agent] --> P[Automated Verification]
        N --> P
        P -->|Feedback| N
    end
```

### Applicable Scenarios

This case study is particularly relevant for:

1. <strong>Legacy-to-modern language migrations</strong>: COBOL→Java, PHP→Go, Ruby→Rust, etc.
2. <strong>Large-scale codebase transformations</strong>: Projects involving thousands to tens of thousands of lines
3. <strong>Resolving technical debt blocked by resource constraints</strong>: AI dramatically improves the cost-benefit equation

### Important Considerations

- Note that DeNA allocated a <strong>separate 2-month verification period</strong>. Even AI-converted code requires thorough validation before production deployment.
- The design of agent role assignments was critical to success — carefully architect your agent configuration to match project requirements.

## Conclusion

DeNA's case demonstrates that AI agents can serve not just as coding assistants but as <strong>strategic project-level resources</strong>. Three key takeaways:

1. <strong>Agent role separation</strong>: Splitting conversion and verification maximizes quality in both areas
2. <strong>Automated iteration cycles</strong>: AI handles the conversion → verification → correction loop automatically
3. <strong>Adequate validation periods</strong>: Human final verification of AI-converted results remains essential

As Deputy Director Koike put it: "If AI can deliver this level of efficiency, we can start tackling projects that were previously impossible due to resource constraints." AI agents represent a genuine breakthrough for resolving technical debt.

## References

- [DeNA Migrates 6,000 Lines of Perl to Go in 1 Month Using AI Agents - Nikkei xTECH](https://xtech.nikkei.com/atcl/nxt/column/18/00001/11469/)
