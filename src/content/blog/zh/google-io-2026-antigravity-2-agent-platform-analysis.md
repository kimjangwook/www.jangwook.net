---
draft: true
title: 'Google I/O 2026: Antigravity 2.0 — Gemini CLI终止与智能体IDE之战'
description: 'Google 在 I/O 2026 发布 Antigravity 2.0，并将于 6 月 18 日终止 Gemini CLI。深度分析已安装应用的扩展结构和 Gemini 3.5 Flash API，并与 Claude Code 对比，解析 Agent IDE 竞争格局的变化。'
pubDate: '2026-05-21'
heroImage: ../../../assets/blog/google-io-2026-antigravity-hero.png
tags:
  - google
  - antigravity
  - ai
  - developer-tools
  - gemini
relatedPosts:
  - slug: cursor-3-vs-claude-code-vs-windsurf-2026
    score: 0.92
    reason:
      ko: AI 코딩 IDE 3파전(Cursor, Claude Code, Windsurf)을 다룬 이 글을 읽었다면, Antigravity 2.0이 새 경쟁자로 어떻게 자리잡는지 맥락이 생긴다.
      ja: AIコーディングIDE 3社対決(Cursor, Claude Code, Windsurf)を扱った記事を読んでいれば、Antigravity 2.0が新たな競合としてどう位置づけられるかの文脈が生まれる。
      en: If you read this piece on the three-way AI coding IDE battle (Cursor, Claude Code, Windsurf), Antigravity 2.0's entry as a new contender makes much more sense in context.
      zh: 如果你读过这篇关于AI编码IDE三强争霸（Cursor、Claude Code、Windsurf）的文章，就能更好理解Antigravity 2.0作为新竞争者的定位。
  - slug: gemini-31-pro-release
    score: 0.88
    reason:
      ko: Gemini 3.1 Pro를 분석한 이 글과 이어서 읽으면, Gemini 모델이 3.1→3.5로 이동하면서 API 가격과 성능이 어떻게 변화했는지 추적할 수 있다.
      ja: Gemini 3.1 Proを分析したこの記事と併せて読むと、Geminiモデルが3.1→3.5へ移行する中でAPIの価格と性能がどう変化したか追跡できる。
      en: Read alongside this Gemini 3.1 Pro analysis to track how the model's API pricing and performance evolved from 3.1 to 3.5.
      zh: 与这篇Gemini 3.1 Pro分析文章一起阅读，可以追踪Gemini模型从3.1到3.5的API价格和性能变化。
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.85
    reason:
      ko: Claude Code로 병렬 에이전트를 실행하는 방법을 이미 알고 있다면, Antigravity 2.0의 parallel subagent 설계가 어디서 다르고 어디서 비슷한지 더 정확히 판단할 수 있다.
      ja: Claude Codeで並列エージェントを実行する方法を知っていれば、Antigravity 2.0のparallel subagent設計がどこで違いどこで似ているかをより正確に判断できる。
      en: If you already know how to run parallel agents in Claude Code, you can more precisely judge where Antigravity 2.0's parallel subagent design diverges and where it converges.
      zh: 如果你已经了解如何在Claude Code中运行并行代理，就能更准确地判断Antigravity 2.0的并行子代理设计在哪里不同、哪里相似。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.83
    reason:
      ko: 2026년 주요 LLM API 가격을 비교한 이 글과 함께 보면, Gemini 3.5 Flash의 $1.50/MTok이 경쟁 가격 대비 어떤 위치인지 직접 숫자로 비교할 수 있다.
      ja: 2026年の主要LLM API価格を比較したこの記事と合わせると、Gemini 3.5 Flashの$1.50/MTokが競合価格対比でどの位置にあるか直接数字で比較できる。
      en: Read alongside this 2026 LLM API pricing comparison to place Gemini 3.5 Flash's $1.50/MTok in direct numerical context against competitors.
      zh: 与这篇2026年主要LLM API价格对比文章一起看，可以直接用数字比较Gemini 3.5 Flash的$1.50/MTok在竞争价格中的位置。
  - slug: multi-agent-orchestration-routing
    score: 0.81
    reason:
      ko: 멀티 에이전트 오케스트레이션 라우팅 패턴을 다룬 이 글의 개념들이 Antigravity 2.0의 parallel subagent 설계에 그대로 적용된다.
      ja: マルチエージェントオーケストレーションのルーティングパターンを扱ったこの記事の概念が、Antigravity 2.0のparallel subagent設計にそのまま適用される。
      en: The multi-agent orchestration routing patterns covered here map directly onto Antigravity 2.0's parallel subagent design.
      zh: 本文中关于多代理编排路由模式的概念直接适用于Antigravity 2.0的并行子代理设计。
---

Google I/O 2026 结束已经两天了。我在重看主题演讲视频时，突然想到——Antigravity 是不是已经装在我机器上了？

```bash
$ defaults read /Applications/Antigravity.app/Contents/Info.plist CFBundleShortVersionString
1.23.2
```

果然已经安装了。版本 1.23.2。于是我就直接打开来看看。这篇文章记录了我在这个过程中发现的内容。

## Antigravity 2.0 是什么 — 一句话总结

Google I/O 2026 发布的 Antigravity 2.0 是"以智能体为优先的开发平台"。它将桌面 IDE、CLI（`agy`）、SDK、Managed Agents API 层级以及通过 Gemini Enterprise Agent Platform 的企业部署路径整合为一套产品。

如果说早期的 Antigravity 基本上只是一个挂着 Gemini 的 Cursor 克隆，那么 2.0 版本的目标是在平台层面整合多智能体编排。

而 Gemini CLI 将于 2026 年 6 月 18 日停止服务。AI Pro、AI Ultra 和免费用户都在此列。Google 将开源工具替换为有使用配额限制的闭源软件，并设定了强制迁移截止日期。

### 三件真正重要的事

我差点把这篇写成"又一个 Cursor 克隆换了个皮"，但有三点让我改变了想法。

**Gemini CLI 终止**：Gemini CLI 是开源的。数以万计的开发者贡献了它、fork 了它、在它上面构建工具。用闭源产品取而代之，是一个战略性信号——Google 正在将开发者工具纳入其变现体系。

**GEMINI.md 和 `.agents/` 目录**：如果你用过 Claude Code，对 `CLAUDE.md` 和 `.claude/agents/` 一定不陌生。Antigravity 采用了完全相同的模式。智能体定义文件放在项目目录中，像构建系统一样运行。这个约定正在跨平台收敛。

**Gemini 3.5 Flash 定价**：输入 $1.50/MTok，输出 $9.00/MTok。100 万 token 上下文窗口。这张价格表决定了 Antigravity 是否真正具有成本竞争力。

## 我直接打开来看：从扩展结构读取架构

Antigravity 是基于 VS Code 1.107 的 Electron 应用。

```bash
$ cat /Applications/Antigravity.app/Contents/Resources/app/product.json
# version: 1.107.0
# nameShort: Antigravity
```

扩展列表中值得注意的内容：

```
/extensions/antigravity/              ← 核心智能体扩展 (v0.2.0)
/extensions/antigravity-code-executor/    ← 执行 Cascade 生成的代码
/extensions/antigravity-dev-containers/   ← 远程容器支持
/extensions/antigravity-remote-openssh/   ← SSH 远程工作
```

`package.json` 中的 `jsonValidation` 条目最有意思：

```json
{
  "fileMatch": "**/mcp_config.json",
  "url": "./schemas/mcp_config.schema.json"
}
```

内置了 MCP 配置文件的 schema 验证。这意味着 Antigravity 原生支持 MCP 生态系统，可以通过 MCP 扩展智能体工具。

命令列表中还有值得关注的条目：

```
antigravity.importCursorSettings
antigravity.importWindsurfSettings
antigravity.importVSCodeSettings
antigravity.importCiderSettings
```

四个竞品的设置开箱即可导入。"消除迁移摩擦"的意图非常明确。

Antigravity CLI（`agy`）截至 2026 年 5 月 21 日尚未公开发布。npm 上没有 `@google/antigravity` 包，Homebrew Cask 只能安装桌面应用。以下内容切换到 Source Review 进行分析。

## Antigravity 2.0 发布内容 — 基于官方文档和公开示例

### 多智能体并行执行

一个主导智能体接受高层目标并分派给多个专业子智能体并行执行。每个子智能体拥有独立的上下文窗口、模型、提示和工具集。Google 公开示例中提到的子智能体类型：

- **Architect Agent**：架构和设计模式
- **Coding Agent**：实现细节
- **Testing Agent**：单元测试和回归测试
- **Documentation Agent**：自动更新技术文档

这本质上与[用 Claude Code 的 Git worktree 并行运行智能体](/zh/blog/zh/claude-code-parallel-sessions-git-worktree)是相同的模式。区别在于 Google 用 GUI 将这一切包装起来，可以可视化看到智能体并行工作。

### GEMINI.md 和 .agents/ 目录

在项目根目录放置 `GEMINI.md` 后，所有智能体都会参照共同规则。在 `.agents/agents.md` 中定义子智能体行为，在 `.agents/skills.md` 中声明可复用的技能。

[多智能体编排路由模式](/zh/blog/zh/multi-agent-orchestration-routing)中整理的概念在这里同样直接适用。业界似乎正在收敛于这种基于文件的智能体配置模型。

### Antigravity CLI（agy）— 已发布但尚未部署

Google 发布了 `agy` 作为 Gemini CLI 的替代品。理论上你可以在终端输入 `agy new-agent` 来创建 Antigravity 智能体。Gemini CLI 的 Agent Skills、Hooks、Subagents 和 Extensions 功能都会继承过来。

问题是它还不存在于任何公共包管理器中。The Register 的标题一针见血："[Bye-bye, Gemini CLI; Google nudges devs toward Antigravity](https://www.theregister.com/ai-ml/2026/05/20/bye-bye-gemini-cli-google-nudges-devs-toward-antigravity/5243605)。"功能替代还没准备好，但关闭日期已经定了。

## Gemini 3.5 Flash API — 价格分析

驱动 Antigravity 2.0 的引擎是 Gemini 3.5 Flash，于 2026 年 5 月 19 日正式 GA。

| 指标 | 数值 |
|------|------|
| 输入价格 | $1.50 / 百万 token |
| 输出价格 | $9.00 / 百万 token |
| 上下文窗口 | 1,048,576 token（约 786K 单词）|
| 最大输出 | 65,536 token |
| 速度 | 比同类前沿模型快约 4 倍 |

与 Claude Opus 4.7（$15/$75 per MTok）相比，输入端便宜 10 倍。模型能力差距是存在的，但 Gemini 3.5 Flash 在五项基准测试上超过了 Gemini 3.1 Pro：Terminal-Bench 2.1（76.2%）、MCP Atlas（83.6%）等。

对于需要大量小型调用的编码智能体——写测试、修复 lint 错误、生成样板代码——Gemini 3.5 Flash 的价格具有竞争力。我认为这是 Antigravity 生态系统真正核心的竞争优势所在。

## GEMINI.md vs CLAUDE.md — 相同的模式，不同的生态

我日常使用 Claude Code。`CLAUDE.md` / `.claude/agents/` / `.claude/skills/` 的结构是我的正常工作流。Antigravity 的 `GEMINI.md` / `.agents/` / `skills.md` 在结构上完全相同。

主要差异在于执行模型：

**Claude Code**：以终端为中心的 CLI 工具。没有 GUI，通过代码和提示词来组合智能体，透明度高。

**Antigravity**：以 GUI 为中心的 IDE。并行智能体在界面中可视化显示，对非终端用户更友好。

**MCP 支持**：两个平台都支持 MCP，但 Antigravity 在扩展层面内置了 schema 验证。从我看到的文件结构来看，这比 Claude Code 中的集成更原生。

## Cascade 同名并非巧合

Antigravity 的智能体面板叫 Cascade。Windsurf 的 AI 智能体功能也叫 Cascade。我在两个产品的官方文档中都确认了这一点。这不可能是巧合。

Windsurf（原 Codeium）正是靠 Cascade 建立了市场地位——通过智能体编码与 Cursor 的自动补全形成差异化。Antigravity 使用相同的名称，是在直接瞄准 Windsurf 的用户群。内置命令列表中出现 `antigravity.importWindsurfSettings` 也印证了这一意图。

[当我比较 Cursor、Claude Code 和 Windsurf 时](/zh/blog/zh/cursor-3-vs-claude-code-vs-windsurf-2026)，分析的是三方竞争。现在那篇分析需要更新了——IDE 战争迎来了由 Google 基础设施和 Gemini 模型定价支撑的第四个严肃玩家。

## 企业用户获得豁免

一个重要的例外：使用 Gemini Code Assist Standard 或 Enterprise 许可证的组织不受 Gemini CLI 关闭影响。通过 Google Cloud 的 Gemini Code Assist for GitHub 同样不受影响。

这说明 Google 的优先级很清楚——企业合同收入受到保护。迁移压力落在个人开发者、小团队和初创公司身上，恰恰是那些构建了 Gemini CLI 开源社区的人群。

## 批评：终止 Gemini CLI 是一个错误

说实话，这是最让我不舒服的地方。

Gemini CLI 是开源的。开发者们为它贡献代码、fork 它、在上面构建工具。现在用闭源软件取而代之，同时设定 6 月 18 日的截止日期，这是信任问题。

更严重的是使用量限制。社区反馈显示周配额消耗很快。那些在 Gemini CLI 上几乎无限制使用的人，迁移到 Antigravity CLI 后会撞上这堵墙。

技术上再优秀，用这种方式推动迁移也会损害开发者社区的信任。Google 有低估这种代价的倾向，而历史已经多次证明，一旦失去开发者信任，重新建立需要很长时间。

## 最终判断 — Google 认真了，但还有差距

Antigravity 2.0 是一个认真的产品，早期版本做不到这一点。将多智能体编排集成到 IDE 层面，搭载价格有竞争力的 Gemini 3.5 Flash，并通过 MCP 连接外部工具——方向是正确的。

问题出在执行上。在替代品没准备好的情况下关闭 Gemini CLI，设置使用量限制，CLI 还没发布就定好截止日期——这是战略跑在产品前面的状态。

我的计划是：不会把 Claude Code 作为主要工具切换掉。但我会立即开始在对成本敏感的流水线中使用 Gemini 3.5 Flash API——输入 $1.50/MTok 在大量调用场景下很难反驳。Antigravity 2.0 本身等 `agy` 发布、使用量政策稳定后再重新评估。

Google 认真进入智能体 IDE 市场对开发者来说终究是好事。Claude Code、Cursor、Windsurf 和现在的 Antigravity 之间的竞争意味着这四者都会持续改进。但进入的方式很重要。开源政策的退步是一个错误，即使产品最终被证明很出色，这种代价也需要时间来弥补。

---

**可执行性判断（Source Review 标准）：**

- Antigravity 2.0 桌面应用：已安装确认（v1.23.2），直接分析了内部结构
- `agy` CLI：截至 2026-05-21 尚未公开发布
- Gemini 3.5 Flash API：通过 Google DeepMind 官方确认定价（$1.50/$9.00 per MTok）
- 多智能体功能：基于官方发布和 Google Codelabs，未直接执行

**参考来源：**
- [Google I/O 2026 开发者亮点](https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/)
- [Gemini CLI → Antigravity 官方迁移指南](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)
- [Gemini 3.5 Flash — Google DeepMind](https://deepmind.google/models/gemini/flash/)
- [Google Cloud：I/O 2026 智能体开发者专题](https://cloud.google.com/blog/topics/developers-practitioners/io26-news-for-agent-developers-on-google-cloud)
