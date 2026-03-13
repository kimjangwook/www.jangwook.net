---
title: mcp2cli — 用CLI按需发现工具，将MCP令牌成本削减96〜99%
description: >-
  接入MCP服务器时，每轮对话都会注入全部工具schema——120个工具25轮对话将浪费362,000个token。mcp2cli通过CLI按需发现机制将这一成本削减96〜99%。本文解析其工作原理、实测数据与落地策略。
pubDate: '2026-03-12'
heroImage: ../../../assets/blog/mcp2cli-token-cost-optimization-hero.jpg
tags:
  - mcp
  - llm-cost
  - ai-agent
relatedPosts:
  - slug: mcp-servers-toolkit-introduction
    score: 0.95
    reason:
      ko: MCP 서버 연동의 기초를 다루며, mcp2cli 도입 전 필수 배경 지식을 제공합니다.
      ja: MCP サーバー連携の基礎を扱い、mcp2cli 導入前の必須背景知識を提供します。
      en: Covers MCP server integration basics, providing essential background before adopting mcp2cli.
      zh: 涵盖MCP服务器集成基础知识，是采用mcp2cli前的必读内容。
  - slug: mcp-code-execution-practical-implementation
    score: 0.92
    reason:
      ko: MCP 코드 실행 실전 구현 사례로, 토큰 최적화와 함께 읽으면 시너지가 높습니다.
      ja: MCP コード実行の実践実装事例で、トークン最適化と合わせて読むと相乗効果が高いです。
      en: Practical MCP code execution case study that pairs well with token optimization strategies.
      zh: MCP代码执行实践案例，与token优化策略结合阅读效果更佳。
  - slug: context-engineering-production-ai-agents
    score: 0.90
    reason:
      ko: 프로덕션 AI 에이전트의 컨텍스트 엔지니어링 전략으로, 토큰 관리의 큰 그림을 제공합니다.
      ja: プロダクション AI エージェントのコンテキストエンジニアリング戦略で、トークン管理の全体像を提供します。
      en: Context engineering strategies for production AI agents, offering the big picture of token management.
      zh: 生产AI代理的上下文工程策略，提供token管理的全局视图。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.88
    reason:
      ko: LLM 비용 최적화의 다른 축인 추론 토큰 관리 전략을 다룹니다.
      ja: LLM コスト最適化の別の軸である推論トークン管理戦略を扱います。
      en: Addresses reasoning token management, another key axis of LLM cost optimization.
      zh: 涉及推理token管理策略，是LLM成本优化的另一重要维度。
  - slug: anthropic-code-execution-mcp
    score: 0.86
    reason:
      ko: Anthropic MCP 코드 실행 효율화 사례로, mcp2cli와 함께 MCP 최적화의 전체 그림을 완성합니다.
      ja: Anthropic MCP コード実行の効率化事例で、mcp2cli と合わせて MCP 最適化の全体像を完成させます。
      en: Anthropic MCP code execution efficiency case that completes the full picture of MCP optimization with mcp2cli.
      zh: Anthropic MCP代码执行效率案例，与mcp2cli共同构成MCP优化的完整图景。
---

## 概述

随着Model Context Protocol（MCP）成为AI智能体生态系统的标准，一个新的瓶颈浮现出来：**工具schema的token浪费**。

接入MCP服务器后，每轮对话都会将所有工具的JSON schema注入到LLM的上下文窗口中，无论模型在该轮是否实际使用这些工具。30个工具每轮约消耗3,600个token，120个工具经过25轮对话则会有362,000个token仅用于schema注入。

**mcp2cli**通过CLI按需发现机制解决了这一问题。它不再预加载所有schema，而是让模型在需要时才通过`--list`和`--help`发现工具，将token浪费削减96〜99%。

## 问题：每轮全量schema注入的代价

### 传统MCP集成方式

```
[对话开始]
系统提示词 + 全部工具schema (30个工具 × 121 token = 3,630 token)
│
第1轮: 用户消息 + 全量schema重新注入
第2轮: 用户消息 + 全量schema重新注入
第3轮: 用户消息 + 全量schema重新注入
...
第15轮: 用户消息 + 全量schema重新注入
```

30个工具 × 15轮 = **54,450个token**仅消耗在schema上，无论模型在该轮是否调用了任何工具。

### 实测数据（基于mcp2cli）

| 场景 | 原生MCP | mcp2cli | 节省率 |
|------|---------|---------|-------|
| 30个工具，15轮 | 54,525 token | 2,309 token | <strong>96%</strong> |
| 80个工具，20轮 | 193,240 token | 3,871 token | <strong>98%</strong> |
| 120个工具，25轮 | 362,350 token | 5,181 token | <strong>99%</strong> |
| 200个端点API，25轮 | 358,425 token | 3,925 token | <strong>99%</strong> |

工具越多、对话越长，节省效果越显著。在企业级MCP环境中，这将彻底改变成本结构。

## mcp2cli的工作原理

### 核心思路：schema预加载 → 按需发现

```
[传统方式]
全部工具schema → 始终存在于上下文中

[mcp2cli方式]
仅工具列表（约16 token/工具）→ 模型仅在需要时调用 --help（约120 token/工具）
```

LLM通过`mcp2cli --list`只接收工具名称和简短描述，只有当它实际需要使用某个工具时，才调用`mcp2cli [tool-name] --help`获取详细schema。

### 四阶段处理流水线

```
1. 加载规范
   读取MCP服务器URL / OpenAPI规范文件

2. 提取工具定义
   从schema中解析工具名、参数、描述

3. 生成参数解析器
   为每个工具动态生成CLI命令（无代码生成，运行时处理）

4. 执行
   以HTTP或tool-call请求转发到MCP服务器
```

### 安装与基本用法

```bash
# 安装
pip install mcp2cli

# 查看MCP服务器工具列表（约16 token/工具）
mcp2cli --mcp https://server.url/sse --list

# 查看特定工具详情（约120 token，仅在需要时）
mcp2cli --mcp https://server.url/sse search-files --help

# 使用OpenAPI规范
mcp2cli --spec api.json --base-url https://api.com list-items

# TOON格式（Token优化输出表示法）输出
mcp2cli --mcp https://server.url/sse search-files --toon
```

### 零代码生成的意义

mcp2cli在运行时读取规范并动态生成CLI，这意味着：

- MCP服务器新增工具后，下次调用时自动反映
- 无需提交规范文件
- 具有1小时TTL的智能缓存，防止不必要的重新加载

## 工程管理视角：落地策略

### 业务影响测算

假设团队运营一个集成了100个MCP工具的AI智能体。

```
原生MCP（每天1,000次对话，平均20轮）：
  100工具 × 121 token × 20轮 × 1,000次对话 = 242,000,000 token/天

应用mcp2cli后（节省98%）：
  约4,840,000 token/天

差值：237,160,000 token/天
以Claude Sonnet 4.6定价（$3/MTok）：每天节省约$711，每月约$21,000
```

除成本外，保持上下文窗口整洁直接影响**模型推理质量和延迟**。

### 理解权衡取舍

mcp2cli并非万能。Hacker News讨论（133个赞，92条评论）中提出了核心顾虑：

**额外往返次数**：模型第一次使用工具时需要单独调用`--help`，对于短任务反而可能更慢。

**发现错误风险**：模型可能尝试错误的工具名，或误解`--help`输出。

**最佳适用场景**：工具数量20个以上、对话轮数10轮以上、且每轮大多数工具未被使用的场景。

### 落地路线图

```
第一步：测量
   统计当前AI智能体实际的工具schema token消耗
   （从对话日志中检查系统提示的token数量）

第二步：试点
   在集成MCP工具最多的一个智能体上应用mcp2cli
   A/B测试：对比成本、准确率、延迟

第三步：分析
   分析哪些工具被实际频繁使用
   考虑混合策略：频繁使用的工具预加载，其余按需加载

第四步：推广
   验证效果后推广至所有智能体
```

## Hacker News社区的反响

对这款获得133个赞、92条评论的工具，社区反应呈现分歧。

**正面声音**：
- "将懒加载模式应用于LLM工具发现，设计优雅"
- "在大规模MCP环境中的成本节省可能是颠覆性的"

**批评声音**：
- "token节省不自动保证更好的输出质量"
- "工具发现的额外往返会增加延迟，引入潜在错误"
- "基准测试偏向理想场景"

在实际工作中，应以实际工作负载验证，而非盲目信任基准数据。

## 生产环境注意事项

### MCP服务器类型兼容性

```
✅ HTTP/SSE MCP服务器：完全支持
✅ stdio MCP服务器：支持
✅ OpenAPI JSON/YAML：支持
⚠️  需要认证的服务器：内置OAuth支持，需要配置
```

### 缓存策略

```bash
# 默认缓存：1小时TTL
mcp2cli --mcp server.url --cache-ttl 3600 --list

# 强制刷新
mcp2cli --mcp server.url --no-cache --list
```

在规范频繁变化的开发环境中使用`--no-cache`；在稳定的生产环境中适当延长TTL以提高效率。

## 总结

mcp2cli解决的问题简单但实际。随着MCP生态系统的成熟，集成的服务器和工具数量不断增加，schema注入成本不是线性增长，而是指数级增长。

- <strong>30个工具</strong>：可能不需要改变
- <strong>80个以上工具</strong>：月度成本差异开始变得显著
- <strong>120个以上工具</strong>：这已成为生存策略，而非单纯的优化

除了节省token，保持上下文窗口整洁对模型的实际推理质量也有积极影响。减少填充上下文窗口的噪声，与提示词工程同等重要的时代已经到来。

---

**参考资料**

- [mcp2cli GitHub](https://github.com/knowsuchagency/mcp2cli)
- [Show HN: mcp2cli — One CLI for every API, 96-99% fewer tokens](https://news.ycombinator.com/item?id=47305149)
- [Speakeasy: Reducing MCP token usage by 100x](https://www.speakeasy.com/blog/how-we-reduced-token-usage-by-100x-dynamic-toolsets-v2)
