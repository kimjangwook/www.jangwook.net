---
title: 我使用的MCP服务器工具包完整指南
description: 通过7个MCP服务器最大化Claude Code开发生产力。分享Serena、Context7、Sequential Thinking等实战经验
pubDate: '2025-11-23'
heroImage: ../../../assets/blog/mcp-servers-toolkit-introduction-hero.jpg
tags:
  - mcp
  - claude-code
  - productivity
relatedPosts:
  - slug: openai-agentkit-tutorial-part1
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: jules-autocoding
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: n8n-rss-automation
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: claude-code-best-practices
    score: 0.92
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

## 概述

MCP（Model Context Protocol）是Anthropic开发的开放协议，旨在标准化AI模型与外部数据源和工具之间的连接方式。在Claude Code等AI编程代理中，MCP服务器扮演着至关重要的角色——它们扩展了AI的能力边界，使其能够访问实时数据、执行代码分析、进行浏览器自动化等操作。

传统的AI助手受限于训练数据的截止日期和固定的功能集。而通过MCP服务器，我们可以：

- 获取最新的库文档和API信息
- 进行精确的代码导航和语义分析
- 执行浏览器自动化和性能测试
- 实现复杂的多步骤推理过程

本文将详细介绍我在日常开发中使用的7个MCP服务器，分享每个工具的配置方法和实战经验。

## 我使用的MCP服务器

### 2.1 Serena（代码分析）

<strong>角色</strong>：语义代码分析，基于LSP（Language Server Protocol）的符号导航

Serena是一个强大的代码分析MCP服务器，它通过LSP提供精确的代码导航能力。与传统的文本搜索不同，Serena理解代码的语义结构，能够准确找到函数定义、类型引用、符号使用等。

<strong>使用原因</strong>：

- <strong>节省token</strong>：只返回需要的代码片段，而非整个文件
- <strong>精确导航</strong>：通过符号名直接定位，避免模糊搜索
- <strong>跨文件分析</strong>：轻松追踪函数调用和类型依赖

<strong>配置示例</strong>：

```json
{
  "serena": {
    "command": "uvx",
    "args": ["serena-mcp"],
    "env": {
      "SERENA_LSP_SERVERS_CONFIG": "/path/to/lsp_servers.json",
      "SERENA_PROJECTS_CONFIG": "/path/to/projects.json"
    }
  }
}
```

<strong>实际使用</strong>：

```bash
# 查找符号定义
find_symbol "BlogPost" --depth 1

# 获取文件符号概览
get_symbols_overview "src/components/Header.astro"

# 查找引用
find_referencing_symbols "getCollection" --relative_path "src/pages"
```

### 2.2 Context7（文档检索）

<strong>角色</strong>：最新库文档检索

Context7解决了AI模型训练数据截止的问题，它能够实时检索各种库和框架的最新文档。当你需要了解新发布的API或最新的最佳实践时，Context7是不可或缺的工具。

<strong>使用原因</strong>：

- <strong>防止hallucination</strong>：获取真实的、最新的文档内容
- <strong>最新API信息</strong>：不再受限于训练数据截止日期
- <strong>多库支持</strong>：支持数千个流行的库和框架

<strong>配置示例</strong>：

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

<strong>"use context7"使用方法</strong>：

在提问时只需添加"use context7"指令：

```
查询Astro 5.0的Content Collections新语法，use context7
```

Context7会自动：
1. 解析库名称并获取Context7兼容的库ID
2. 检索相关文档内容
3. 返回结构化的、最新的信息

### 2.3 Sequential Thinking（问题解决）

<strong>角色</strong>：逐步思考过程

Sequential Thinking MCP服务器提供了一个结构化的思考工具，帮助AI进行动态和反思性的问题解决。它特别适合处理复杂的、需要多步骤推理的任务。

<strong>使用原因</strong>：

- <strong>复杂问题分解</strong>：将大问题拆分为可管理的步骤
- <strong>假设验证</strong>：生成假设并验证
- <strong>思路回溯</strong>：支持修改和重新审视之前的思考

<strong>基于Docker运行</strong>：

```json
{
  "sequentialthinking": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "mcp/sequentialthinking"
    ]
  }
}
```

<strong>关键特性</strong>：

- 可以动态调整总思考步骤数
- 支持分支思考和回溯
- 在满意之前持续验证假设

### 2.4 Chrome DevTools MCP（性能分析）

<strong>角色</strong>：浏览器性能追踪，网络分析

Chrome DevTools MCP将Chrome开发者工具的强大功能带入了Claude Code。它能够进行性能追踪、网络请求分析、控制台日志检查等操作。

<strong>使用原因</strong>：

- <strong>Core Web Vitals测量</strong>：LCP、FID、CLS等指标
- <strong>实时调试</strong>：查看控制台日志和网络请求
- <strong>性能分析</strong>：识别性能瓶颈和优化机会

<strong>配置示例</strong>：

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["@anthropic-ai/mcp-server-chrome-devtools@latest"]
  }
}
```

<strong>主要功能</strong>：

- 页面导航和截图
- 性能追踪（支持自动停止）
- 网络请求列表和详情
- 控制台消息检索
- 元素交互（点击、填写、悬停等）

### 2.5 Playwright MCP（浏览器自动化）

<strong>角色</strong>：跨浏览器测试，截图

Playwright MCP提供了强大的浏览器自动化能力，支持Chromium、Firefox和WebKit三大浏览器引擎。

<strong>使用原因</strong>：

- <strong>E2E测试</strong>：完整的用户流程测试
- <strong>功能自动化</strong>：表单填写、点击、导航等
- <strong>跨浏览器兼容性</strong>：确保在不同浏览器中的一致性

<strong>配置示例</strong>：

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@anthropic-ai/mcp-server-playwright@latest"]
  }
}
```

<strong>与Chrome DevTools的区别</strong>：

| 特性 | Chrome DevTools MCP | Playwright MCP |
|------|---------------------|----------------|
| 浏览器支持 | 仅Chrome | Chromium/Firefox/WebKit |
| 主要用途 | 性能分析、调试 | 自动化测试、截图 |
| 性能追踪 | ✓ | ✗ |
| 跨浏览器测试 | ✗ | ✓ |
| 代码生成 | ✗ | ✓ |

<strong>选择建议</strong>：

- 性能分析和调试 → Chrome DevTools MCP
- E2E测试和跨浏览器验证 → Playwright MCP

### 2.6 Gemini CLI MCP（AI搜索/分析）

<strong>角色</strong>：Google搜索，文件分析，对话

Gemini CLI MCP整合了Google的Gemini AI能力，提供搜索、文件分析和对话功能。

<strong>使用原因</strong>：

- <strong>1M token上下文</strong>：处理超长文档
- <strong>多模态分析</strong>：图片、PDF、文本等多种格式
- <strong>Google搜索集成</strong>：获取最新网络信息

<strong>配置示例</strong>：

```json
{
  "gemini-cli": {
    "command": "npx",
    "args": ["-y", "gemini-cli-mcp@latest"]
  }
}
```

<strong>支持的文件类型</strong>：

- 图片：PNG、JPG、JPEG、GIF、WebP、SVG、BMP
- 文本：TXT、MD
- 文档：PDF

<strong>推荐模型</strong>：

- `gemini-2.5-pro`（默认）
- `gemini-2.5-flash`

### 2.7 Gemini Google Search

<strong>角色</strong>：专用网络搜索

这是一个专注于网络搜索的MCP服务器，通过Gemini API提供Google搜索功能。

<strong>使用原因</strong>：

- <strong>最新信息检索</strong>：突破训练数据截止限制
- <strong>简洁配置</strong>：单一功能，配置简单
- <strong>可靠性</strong>：直接使用Google搜索后端

<strong>配置示例</strong>：

```json
{
  "gemini-google-search": {
    "command": "npx",
    "args": ["-y", "gemini-google-search-mcp"]
  }
}
```

## 实际配置示例

以下是完整的`mcpServers`配置（敏感信息已掩码）：

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["serena-mcp"],
      "env": {
        "SERENA_LSP_SERVERS_CONFIG": "/path/to/config/lsp_servers.json",
        "SERENA_PROJECTS_CONFIG": "/path/to/config/projects.json"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "sequentialthinking": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/sequentialthinking"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-chrome-devtools@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-playwright@latest"]
    },
    "gemini-cli": {
      "command": "npx",
      "args": ["-y", "gemini-cli-mcp@latest"]
    },
    "gemini-google-search": {
      "command": "npx",
      "args": ["-y", "gemini-google-search-mcp"]
    }
  }
}
```

<strong>配置文件位置</strong>：

- macOS/Linux：`~/.claude/settings.json`
- Windows：`%APPDATA%\Claude\settings.json`

## 组合使用案例

### 案例1：代码分析 + 文档检索组合

<strong>场景</strong>：重构使用旧API的代码

```
1. Serena：分析当前代码结构，找到所有使用旧API的位置
   → find_symbol "oldApiFunction"
   → find_referencing_symbols "oldApiFunction"

2. Context7：检索新API的文档和迁移指南
   → 查询library migration guide，use context7

3. 结合两者信息，生成重构计划和代码
```

### 案例2：浏览器测试 + 性能分析组合

<strong>场景</strong>：验证新功能并确保性能

```
1. Playwright：执行E2E测试流程
   → 导航到页面
   → 执行用户操作
   → 截图验证结果

2. Chrome DevTools：分析性能指标
   → 启动性能追踪
   → 重新加载页面
   → 分析Core Web Vitals

3. 综合报告：功能正确性 + 性能数据
```

### 案例3：复杂问题解决工作流

<strong>场景</strong>：调试神秘的性能问题

```
1. Sequential Thinking：分解问题
   → 思考步骤1：列出可能的原因
   → 思考步骤2：设计验证方案
   → 思考步骤3：确定优先级

2. Chrome DevTools：收集数据
   → 性能追踪
   → 网络请求分析
   → 控制台日志检查

3. Serena：定位相关代码
   → 找到性能热点对应的代码
   → 分析调用链

4. Gemini Search：查找解决方案
   → 搜索类似问题和最佳实践

5. Context7：验证解决方案
   → 确认API用法正确
```

## 结论

MCP服务器显著扩展了Claude Code的能力边界。通过合理配置和组合使用这些工具，我实现了：

- <strong>代码分析效率提升</strong>：Serena的符号导航比文本搜索快3〜5倍
- <strong>信息准确性提高</strong>：Context7消除了过时文档的困扰
- <strong>调试时间缩短</strong>：Chrome DevTools的性能追踪快速定位瓶颈
- <strong>测试覆盖增强</strong>：Playwright的自动化测试提高了信心

<strong>推荐入门服务器</strong>：

如果你刚开始使用MCP服务器，建议按以下顺序逐步添加：

1. <strong>Context7</strong>：最容易上手，立即获得最新文档
2. <strong>Serena</strong>：显著提升代码导航效率
3. <strong>Sequential Thinking</strong>：处理复杂问题时很有帮助
4. <strong>Chrome DevTools</strong>：Web开发必备

MCP生态系统正在快速发展，越来越多的工具正在加入。我建议关注[MCP官方仓库](https://github.com/modelcontextprotocol)以获取最新的服务器列表和更新。

通过这些工具的组合使用，Claude Code从一个智能助手进化成为一个真正的开发伙伴，能够理解代码、获取信息、执行测试、分析性能——几乎涵盖了开发工作流的各个方面。
