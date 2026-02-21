---
title: Anthropic Agent Skills标准：扩展AI代理能力的开放新标准
description: Anthropic的Agent Skills标准提供了一种通用方法，使AI代理能够获取和利用新功能，从而推动整个AI行业的开发和创新。
pubDate: '2025-12-25'
heroImage: ../../../assets/blog/anthropic-agent-skills-standard-hero.png
tags:
  - AI
  - Agent
  - Anthropic
  - Standard
  - Agent-Skills
lang: zh
alternates:
  ko: /ko/blog/ko/anthropic-agent-skills-standard
  ja: /ja/blog/ja/anthropic-agent-skills-standard
  en: /en/blog/en/anthropic-agent-skills-standard
relatedPosts:
  - slug: claude-skills-implementation-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: enterprise-ai-adoption-topdown
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: slack-mcp-team-communication
    score: 0.95
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
  - slug: effiflow-automation-analysis-part3
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

## 概述

2025年12月18日，Anthropic正式发布了<strong>Agent Skills标准</strong>，这是一个旨在显著扩展AI代理能力的革命性开放标准。该标准引入了一种通用方法，使AI代理能够获取和利用新功能，延续了Anthropic通过Model Context Protocol (MCP)构建基础行业基础设施的战略。所有相关规范和SDK均在`agentskills.io`上公开。

该标准定义了模块化能力，使代理能够与特定工具交互、自主执行复杂任务并理解重复性工作流程。预计这将提高AI代理的实用性并加速其发展。

## 核心内容

### 1. 什么是Agent Skills标准？

Anthropic Agent Skills标准定义了一系列模块化的“技能”，AI代理可以根据需要动态发现和加载。每个技能都结构为一个目录，其中包含自己的指令、脚本、资源以及核心`SKILL.md`文件。`SKILL.md`文件结合了YAML和Markdown，清晰地描述了技能名称、提供分步说明和使用示例。

### 2. 主要特点与优势

- <strong>开放标准</strong>：该标准设计为独立于特定平台的开放规范，允许任何AI平台自由采用和集成。这将显著提高AI代理生态系统内的互操作性。
- <strong>广泛的行业采用</strong>：微软、OpenAI、Atlassian、Figma、Cursor和GitHub等领先科技公司已采用该标准。此外，Canva、Stripe、Notion和Zapier等合作伙伴已基于该标准开发了各种预构建技能，扩展了代理的应用范围。
- <strong>强大的功能性</strong>：技能赋予AI代理执行专业任务、理解可重复工作流程、甚至有效与新软件交互的能力。技能设计为易于共享、易于实现、功能强大且可在不同环境中移植。
- <strong>智能上下文管理（渐进式披露）</strong>：为解决LLM上下文窗口的限制，该标准采用了名为“渐进式披露”（Progressive Disclosure）的创新方法。代理首先预加载所有已安装技能的元数据。然后，只有当用户的当前请求与特定技能的领域对齐时，代理才会加载该技能的完整`SKILL.md`文件。这通过高效利用所需信息，最大程度地减少了上下文窗口的限制。

### 3. 企业功能

针对使用Claude Team和Enterprise计划的企业客户，Anthropic推出了组织范围内的技能集中管理功能。这使得企业能够高效地部署和控制AI代理能力，并根据特定的业务需求进行定制。

### 4. 背景与意义

Agent Skills标准最初于2025年10月作为开发者功能推出，并在两个月后的12月转变为开放标准。这表明AI代理技术正在超越特定的开发者社区，成为广泛的行业标准。通过提供一种标准化方法，使AI代理能够与工具交互并自主执行复杂任务，该标准将成为加速代理AI发展和普及的关键里程碑。

## 使用方法

### 1. 面向开发者的Agent Skills SDK

开发者可以利用`agentskills.io`上提供的Agent Skills SDK开发自定义技能。`SKILL.md`文件结合了基于YAML的元数据和基于Markdown的详细说明，帮助代理轻松理解技能的目的和用法。这为代理与新工具和服务的无缝集成铺平了道路。

### 2. Agent Skills在企业应用中的使用

企业可以基于Agent Skills标准集中管理和部署AI代理能力，以自动化工作流程。通过将各种内部系统和外部服务封装为Agent Skills，AI代理可以在客户服务、数据分析、内容生成等广泛的业务领域中得到更强大和灵活的应用。

## 结论

Anthropic的Agent Skills标准代表了AI代理技术成熟度的显著提升。这一开放标准促进了AI代理生态系统内的互操作性，并为开发者构建更强大、更智能的代理提供了基础。它指明了未来AI代理的发展方向，并将在使AI更深入地融入我们的日常生活和业务中发挥核心作用。

## 参考文献

- [thenewstack.io](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEpmFz_yAN-W2nzkMD3W4Zx4ICcqrJ8zs1qBK5JTYYR2ZLKzuGTt-qnd7tKpXNX_1blK0wnGH4FDqxiesuQy9ZgIkvfuaJgMSmiNX-rtdycCy0TrXdfTcpgN0UdYjgtLwYkntq1raSYc1vgCWqjmZDPfuURK5B5vdJ9meN_yszzJjZWx-UDmPHFxS4=)
- [techradar.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHiMxTlhYQwwdk4qJGwjIG4oSsi7x7UqqzqlWHLlNxP9WlvvPUHyXI2EeY9b9QtsRGZ-GeccqpkgI09IajOMXVSapgQbfwd9j3x7q10_XSdk9G15QU4YHfGZcdtIG9w7L6m4khTOiyZoN3ZQ8eZQig7k6zI-Q9eHR8v712TNdqAQ_tgxHqCk00pVZRVJSbE6fveW5P6q4HkPGyXjUwf-dzSCe-1Oy32CWB3WwUe8CyOWhKntLifuA==)
- [anthropic.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFbd-NYwEyU1bJnaHx4k64rq54251vzGiCr9QEfvdhoxULY8E4JtmquJYTB-DRAWpXrv-3wFzDJcUjJTpLbkN0MSUDlg1l2Iw2zT9d09aBwU-MOcyqt1rRUV5CS2E_hatArLFvyqgzXOvGHLgKLZk8klIm6hZakt8yehX-Ld8fOYUw4cfjahIu_HcLeZLr5Yy-BT6ZM=)
- [skillsmp.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHf2iiMfYZIzS-6l-cDPofoU5a17PQlAuTu2WFWrQuMlS7IHJuoiodKCfPLsrPvAEjpMYV_xyEvB-A329JJuiPgtsmZGBnO3KJgCE-1P97a2w==)
