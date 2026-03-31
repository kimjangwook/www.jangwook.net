---
title: AI编程代理泄露了2900万个密钥 — MCP配置文件安全的盲区
description: >-
  根据GitGuardian
  2026报告，使用AI编程工具的仓库密钥泄露率是GitHub平均水平的2倍。仅MCP配置文件就暴露了超过24,000个凭证。本文整理了实际排查方法和应对措施。
pubDate: '2026-03-30'
heroImage: ../../../assets/blog/ai-coding-secrets-sprawl-mcp-config-security-hero.jpg
tags:
  - security
  - mcp
  - ai-coding
  - secrets
  - devops
relatedPosts:
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: terraform-ai-batch-infrastructure
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: cursor-agent-trace-ai-code-attribution
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: roguepilot-copilot-prompt-injection-security
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-firefox-22-cves-ai-security-audit
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

上周翻阅GitGuardian发布的 *State of Secrets Sprawl 2026* 报告时，我的手停了下来。GitHub上一年内检测到的密钥数量达到了**2900万个**。但真正让我紧张的是下一句话——使用AI编程工具的仓库，密钥泄露率是GitHub整体平均水平的**2倍**。

我每天都在用Claude Code连接MCP服务器工作。说实话，读完这份报告后我第一时间就去检查了自己的 `.claude/` 目录和MCP配置文件。最终没发现问题，但我确实搞明白了"为什么AI编程工具会加速密钥泄露"这个问题背后的结构性原因。

## AI编程工具为什么让密钥泄露翻倍

在普通开发中，密钥泄露的路径相对简单：`.env` 文件没加到 `.gitignore`，或者在测试代码里硬编码了API key。但一旦开始用AI编程代理，泄露路径就急剧增多了。

**第一个问题是上下文注入。** 当你让AI代理"帮我调这个API"时，代理生成的代码有时会包含实际的API key。尤其是代理用内联值代替环境变量的情况其实挺多的。人写代码时会本能地想"这个得抽到环境变量里"，但AI的首要目标是生成"能跑的代码"。

**第二个问题更严重——MCP配置文件。** Claude Code、Cursor、Windsurf这些工具连接MCP服务器时使用的配置文件里，数据库连接信息、API key、OAuth token都是明文存储的。据GitGuardian统计，仅公开仓库的MCP配置文件中就发现了**24,008个**独立密钥。

```json
// 这样的配置文件被直接commit的案例数以万计
{
  "mcpServers": {
    "database": {
      "command": "mcp-server-postgres",
      "args": ["postgresql://admin:P@ssw0rd123@prod-db.example.com:5432/main"]
    },
    "slack": {
      "command": "mcp-server-slack",
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

如果这个文件没有被加入 `.gitignore`，一次 `git add -A` 就能把生产环境的数据库凭证推到GitHub上。AI编程代理问你"要不要commit这个文件"时，大多数人的回答都是"好"——这就是现实。

## 我实际做了排查

以我自己的工作环境为准，分享一下我检查的项目。

**1. 确认MCP配置文件位置**

```bash
# Claude Code的MCP配置文件位置
ls -la ~/.claude/mcp_settings.json 2>/dev/null
ls -la ./.claude/settings.local.json 2>/dev/null

# 搜索项目内的MCP相关配置
grep -r "mcpServers" . --include="*.json" -l
```

**2. 检查 .gitignore**

```bash
# 确认MCP配置文件是否包含在gitignore中
grep -E "mcp|settings\.local" .gitignore
```

我的情况是 `.claude/settings.local.json` 已经在 `.gitignore` 里了，但项目中还有单独的MCP配置JSON文件，那个文件漏掉了。发现后立刻补上了。

**3. 在Git历史中搜索已泄露的密钥**

```bash
# 检查过去的commit中是否包含过密钥
git log --all --diff-filter=A -- '*.json' | head -20
git log -p --all -S 'SLACK_BOT_TOKEN' -- '*.json'
git log -p --all -S 'postgresql://' -- '*.json'
```

这里有个关键点：即使加入了 `.gitignore`，已经commit过的文件仍然存在于历史记录中。只要密钥被commit过一次，轮换密钥就是唯一的解决方案。

## GitHub MCP Server的密钥扫描功能

3月17日，GitHub为MCP Server添加了密钥扫描功能的公开预览版。当AI编程代理通过GitHub MCP Server工作时，会在push之前自动检测密钥。

配置方式：在GitHub仓库的 Settings > Code security and analysis 中启用"Secret scanning"和"Push protection"即可。已经启用的仓库，通过MCP Server的操作也会自动覆盖。

我个人看好这个功能的原因在于，它能在**代理工作流内部**捕获AI代理生成代码中的密钥泄露。在人工review之前系统先拦截，这很符合"代理commit的代码由我来review"这一现实工作流。

## 但光靠这个还不够

坦白讲，GitHub的密钥扫描只能检测**已知模式的密钥**。自定义内部API key或非标准格式的token可能会被遗漏。而且对于使用GitHub以外仓库（GitLab、Bitbucket、自建托管）的团队也不适用。

还有一点，MCP配置文件的凭证管理目前还没有统一标准。Anthropic和MCP社区都没有发布"密钥应该这样管理"的官方指南，各团队只能自行决定是抽到环境变量里，还是对接密钥管理器。

我认为MCP生态要走向成熟，就必须建立配置文件中凭证引用的标准。就像Docker Compose的 `secrets:` block，或者Kubernetes的 `secretKeyRef` 那样的模式，应该引入到MCP配置中。目前MCP配置中通过 `env:` block引用环境变量是可以的，但与密钥管理器（HashiCorp Vault、AWS Secrets Manager等）的集成，每个MCP服务器实现都各不相同。

## Checklist：AI编程代理密钥安全

这些是我实际在执行的项目。

- 确认 `.claude/settings.local.json` 已加入 `.gitignore`
- MCP配置文件中使用环境变量引用代替明文凭证（`"env": {"KEY": "环境变量名"}`）
- 启用GitHub Push Protection（Settings > Code security）
- 用 `git add <文件名>` 代替 `git add -A` 进行显式暂存
- commit前确认AI代理生成的代码中没有硬编码的密钥
- 每季度进行Git历史密钥扫描（使用gitleaks或truffleHog）
- 对MCP服务器连接使用的token应用最小权限原则

## 写在最后

2900万这个数字确实吓人，但其实大多数密钥泄露并非源于复杂的攻击，而是"忘了就commit了"这种级别的失误。AI编程代理正在提高这类失误的发生频率——这就是这份报告的核心要点。

对我触动最大的教训是：用AI代理提高了代码生成速度，**安全review的速度也必须跟上**。代理10秒生成的代码，不到30秒就commit的习惯是最危险的。至少跑一遍 `git diff` 吧——尤其是当暂存区里有 `.json`、`.yaml`、`.env` 扩展名的文件时。
