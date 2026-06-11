---
title: Claude Code 2026年6月更新分析 — Safe Mode、Opus 4.8默认、限制翻倍
description: 整理了2026年6月Claude Code的核心变化：Safe Mode、/cd命令、Opus 4.8默认化、/usage细分、速率限制翻倍。
pubDate: '2026-06-11'
heroImage: >-
  ../../../assets/blog/claude-code-june-2026-new-features-changelog-developer-guide-hero.png
tags:
  - claude-code
  - ai-tools
  - developer-tools
relatedPosts:
  - slug: ai-agent-cost-reality
    score: 0.95
    reason:
      ko: '요금 한도가 2배가 됐지만, 에이전트 세션에서 실제 비용이 어떻게 쌓이는지를 이해해야 한다. 이 글은 멀티 에이전트 워크플로우의 실제 비용 구조를 분석한다.'
      ja: レート制限が2倍になったが、エージェントセッションで実際のコストがどう積み重なるか理解が必要だ。この記事はマルチエージェントワークフローの実コスト構造を分析する。
      en: 'Rate limits doubled, but understanding how costs accumulate in agentic sessions matters just as much. This post breaks down the real cost structure of multi-agent workflows.'
      zh: 速率限制翻倍了，但了解agent会话中实际成本如何累积同样重要。这篇文章分析了多agent工作流的实际成本结构。
  - slug: dena-perl-go-migration-ai-agents
    score: 0.95
    reason:
      ko: 'Dynamic Workflows를 현업에서 어떻게 활용하는지 궁금하다면, DeNA가 레거시 코드베이스 마이그레이션에 AI 에이전트를 투입한 실제 사례가 좋은 비교 대상이다.'
      ja: Dynamic Workflowsを実業務でどう活用するか気になるなら、DeNAがレガシーコードベース移行にAIエージェントを投入した実際の事例が良い比較対象だ。
      en: "Wondering how Dynamic Workflows plays out in real production work? DeNA's AI-agent-driven legacy migration is a grounded comparison case."
      zh: 好奇Dynamic Workflows在真实工作中如何落地？DeNA利用AI agent进行遗留代码迁移的案例是很好的参照。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '/usage 세분화로 스킬별 토큰 사용량이 보이기 시작했다. Anthropic 에이전트 스킬의 구조를 이해하면 어떤 스킬이 왜 많은 토큰을 쓰는지 해석하는 데 직접 도움이 된다.'
      ja: /usage細分化でスキル別のトークン使用量が見えるようになった。Anthropicエージェントスキルの構造を理解すると、どのスキルがなぜ多くのトークンを使うか解釈するのに直接役立つ。
      en: '/usage now shows per-skill token consumption. Understanding the Anthropic agent skills structure helps you interpret why certain skills are driving your usage.'
      zh: /usage细分化让每个技能的token用量变得可见。了解Anthropic agent技能结构，有助于解读为什么某些技能消耗较多token。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: 'Claude Code가 Anthropic 에이전트 스킬 표준 위에서 동작한다. Safe Mode로 커스텀 스킬을 끄면 어떤 스킬이 기본인지 알 수 있는데, 이 글이 그 표준을 설명한다.'
      ja: Claude CodeはAnthropicエージェントスキル標準の上で動作する。Safe Modeでカスタムスキルをオフにするとデフォルトのスキルがわかるが、この記事がその標準を説明している。
      en: 'Claude Code runs on top of the Anthropic agent skills standard. Safe Mode strips custom skills. This post explains what the underlying standard actually defines.'
      zh: Claude Code建立在Anthropic agent技能标准之上。Safe Mode关闭自定义技能后，这篇文章解释了底层标准实际定义了什么。
  - slug: claude-agent-teams-guide
    score: 0.94
    reason:
      ko: 'Dynamic Workflows는 백그라운드에서 수십 개의 에이전트를 조율한다. Claude 에이전트 팀 가이드는 그 멀티 에이전트 조율의 기본 패턴을 다루고 있어 이해의 기반이 된다.'
      ja: Dynamic Workflowsはバックグラウンドで数十のエージェントを調整する。Claudeエージェントチームガイドは、そのマルチエージェント調整の基本パターンを扱っており理解の基盤になる。
      en: 'Dynamic Workflows coordinates dozens of agents in the background. The Claude agent teams guide covers the foundational patterns behind that multi-agent orchestration.'
      zh: Dynamic Workflows在后台协调数十个agent。Claude agent团队指南涵盖了这种多agent编排的基础模式，是理解的基础。
---

6月初，Claude Code进行了相当多的改动。某天运行 `claude --version` 显示2.1.172，打开发布说明发现Safe Mode、/cd命令、Opus 4.8默认化、/usage细分化一并进来了。每项变化单独来看不算大，但叠加起来就不一样了。

这篇文章不是简单转述发布说明。我通过CLI直接验证了每个功能——亲自运行了 `claude --safe-mode`，确认了 `claude agents --help` 的输出，并核实了npm上最新版本为2.1.173。以下是真正重要的和不那么重要的内容。

---

## 先说一句话总结

<strong>对重度用户意义重大，轻度用户难以察觉。</strong>

Safe Mode和/cd是在配置出问题时用的，/usage细分在运行多个插件和MCP服务器的团队中大放异彩。速率限制翻倍影响最大——但前提是你之前确实经常触发限制。

Opus 4.8成为默认会立即影响所有用户——但这是模型更新，更接近于模型策略变更而非Claude Code功能变化。

也有令人失望的地方。/cd命令虽然宣称"切换目录不会破坏提示缓存"，但复杂的多仓库配置下还是建议开新会话更安全。Safe Mode则让人纳闷"为什么现在才出现"。2025年全年"MCP配置冲突导致启动失败"的问题反复出现，解决方案来得这么晚实在令人遗憾。

---

## Safe Mode与/cd — 配置损坏时的救命稻草

Safe Mode通过一个flag启动：

```bash
claude --safe-mode
```

会禁用什么？CLAUDE.md、技能(skills)、插件(plugins)、钩子(hooks)、MCP服务器、自定义命令、agents、输出样式、工作流、主题、键绑定——简而言之，用户添加的所有自定义项。认证和模型选择正常运行。也可以通过 `CLAUDE_CODE_SAFE_MODE=1` 环境变量设置。

这是从 `claude --help` 实际输出中确认的内容：

```
  --safe-mode     Start with all customizations
                  (CLAUDE.md, skills, plugins, hooks, MCP
                  servers, custom commands and agents,
                  output styles, workflows, custom themes,
                  keybindings, and more) disabled — useful
                  for troubleshooting a broken
                  configuration. Sets CLAUDE_CODE_SAFE_MODE=1.
```

我的设置连接了多个MCP服务器，还配置了几个hooks。有时某个MCP服务器配置有误或hook出现意外行为，导致会话从启动就开始报错。以前必须逐一注释掉配置文件，或者备份 `.claude/settings.json` 然后临时清空。现在用 `--safe-mode` 就能立即进入诊断模式。

重要提示：管理员策略设置在Safe Mode下仍然有效。团队和企业环境的安全规则不会被绕过。Safe Mode和 `--bare` 看起来类似但不同——`--bare` 是连OAuth认证都禁用的极端最小模式，Safe Mode只关闭自定义项，认证和模型选择正常工作。

<strong>/cd命令</strong>允许在会话中途更改工作目录而不破坏提示缓存。方向是对的，但在复杂的多仓库设置中，我个人仍然倾向于为每个仓库开独立会话来避免上下文混淆。

---

## Opus 4.8默认化与Dynamic Workflows

Opus 4.8于5月28日发布，Claude Code在6月9日（v2.1.170）将其设为默认模型。

根据Anthropic的官方说明，相比Opus 4.7在编码、agent任务和专业工作上有所改进。"适度但可感知的提升"是多数评测的描述。我亲自使用下来，复杂重构和多文件修改时错误确实少了一些，但没有让人眼前一亮的感觉。

[Claude Code agent工作流5种模式](/zh/blog/zh/claude-code-agentic-workflow-patterns-5-types)中介绍的并行agent模式与Opus 4.8的Dynamic Workflows直接相关。

Dynamic Workflows是让Claude把任务编排成工作流，协调数十到数百个agent在后台处理大规模工作。Anthropic重点强调了两点：

- Fast Mode下Opus 4.8的速度是上一代模型的2.5倍
- Opus 4.8的Fast Mode价格降至之前约三分之一

Fast Mode降价比看起来更有意义——Opus系列之前即便在快速模式下也很贵，这次下调幅度相当可观。不过Dynamic Workflows本身对个人开发者来说实用场景还比较窄，需要有同时协调数十个agent的工作量才能体现价值。

---

## /usage细分化 — 终于看清楚token花在哪里了

这是本次更新中我认为最立竿见影的改变。5月第21周引入，6月版本完全稳定。

以前的 `/usage` 命令只显示总量——"本月用了X个token"。配置了多个插件和MCP服务器时，完全不知道哪里在消耗token。

现在 `/usage` 按类别细分：

- 按技能(skill)的用量
- 按子agent的用量
- 按插件的用量
- 按各个MCP服务器的用量

[Claude Code插件完整指南](/zh/blog/zh/claude-code-plugins-complete-guide)详细介绍了插件结构——一个插件可以捆绑技能、hooks和MCP服务器。现在可以看到插件内部哪个组件在消耗token，而不只是插件整体。

在我的配置中，发现Google Analytics MCP服务器消耗的token远超预期——因为自动调用太频繁。这一点现在清晰可见，于是立即调整了MCP服务器配置来降低调用频率。之前完全不知道这个情况。

另外 `/extra-usage` 改名为 `/usage-credits`。细节改动，但"extra"一词容易让人联想到超额使用，改成"credits"更清晰。

---

## 速率限制翻倍 — SpaceX合作的实质意义

5月6日，Anthropic与SpaceX签署了计算基础设施合作协议，获得了位于孟菲斯Colossus 1数据中心超过300MW容量和22万张以上NVIDIA GPU的访问权。

这次合作的直接结果是速率限制全面翻倍：

![Claude Code速率限制变更对比](../../../assets/blog/claude-code-june-2026-new-features-changelog-developer-guide-rate-limits.png)

数字层面，API Tier 1每分钟输入token从3万飙升到50万。Pro、Max、Team、Enterprise的5小时滚动窗口限制全部翻倍，Pro和Max的高峰时段限流也被取消。

要体感到这个变化需要满足两个条件：之前确实碰到过限制，且经常使用长时间agent会话。两个条件都满足的人，这是本次发布中影响最大的变化。

对我个人来说，取消高峰时段限流比单纯的数字翻倍更实际。工作时间（上午10〜12点）使用Claude Code偶尔会遇到限速导致会话卡顿，现在这个摩擦消失了。

API直接用户也受益明显：Tier 1每分钟从3万提升到50万，小团队运行多agent流水线基本不会触及上限。

---

## Safe Mode实战场景 — 什么时候用，什么时候不用

Safe Mode有正确的使用场景，也有不该用的场景。

<strong>适合使用的情况：</strong>添加新MCP服务器后启动报错；怀疑CLAUDE.md干扰了Claude的行为；插件更新后出现意外行为需要排查是哪个插件的问题。

<strong>不适合使用的情况：</strong>日常开发工作。Safe Mode会清除CLAUDE.md定义的项目上下文、禁用所有配置的技能和MCP工具——这些都是你精心配置来让Claude Code在项目中有效工作的东西。Safe Mode是诊断模式，不是日常模式。

技巧：如果问题在Safe Mode下无法复现，说明原因在某处自定义配置中。接下来逐一禁用插件来缩小范围。Safe Mode是起点，不是完整的诊断过程。

---

## Hooks进化：MCP工具直接调用与MessageDisplay

之前介绍过的[Claude Code Hooks工作流](/zh/blog/zh/claude-code-hooks-workflow)在本次更新中得到了扩展。有两点值得关注。

<strong>MCP工具类型hook</strong>

现在hook中可以使用 `type: "mcp_tool"` 直接调用已连接MCP服务器的工具：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "mcp_tool",
        "server": "my-validation-server",
        "tool": "validate_before_edit"
      }
    ]
  }
}
```

以前hook需要先spawn一个外部进程才能访问MCP服务器。现在直接复用已建立的连接，性能提升明显，配置也更简洁。代码编辑前调用lint服务器、Bash命令执行前调用安全验证服务器——这些场景的实现都更干净了。

<strong>MessageDisplay hook事件</strong>

可以在助手消息显示前拦截并变换或隐藏内容。v2.1.152新增的功能。

```json
{
  "hooks": {
    "MessageDisplay": [
      {
        "type": "command",
        "command": "message-filter.sh"
      }
    ]
  }
}
```

适合团队环境：过滤特定输出内容、将消息转发到Slack等。个人开发者可能暂时用不上，但对于将Claude Code融入团队工作流的场景来说是个强力hook点。

---

## 容易忽略的小改动

`claude agents --json --all` 是新增选项。`--json` 默认只显示活跃session，加上 `--all` 后包含已完成的session。从实际的 `claude agents --help` 输出确认：

```
  --all    With --json: include completed sessions
           (the full agent view list)
```

```bash
# 只显示当前运行中的后台agent
claude agents --json

# 包含已完成的session
claude agents --json --all
```

对脚本化监控agent状态很有用。

启动时的"bash命令将在沙箱中运行"提示横幅被移除了。沙箱状态仍可通过 `/status` 查看，命令被阻止时也依然会显示。每次启动都弹出的横幅消失后，终端清爽多了。

一个因后端短暂中断导致session永久卡死的bug被修复了。JetBrains IDE终端闪烁问题也一并解决。

---

## 我的评价：好的、遗憾的、希望看到的

<strong>好的：</strong>

Safe Mode虽然来得晚，但总算来了。/usage细分功能立即派上了用场——发现了一个MCP服务器悄悄消耗大量token。取消高峰时段限流对工作时间的效率有直接改善。

<strong>遗憾的：</strong>

Safe Mode本应在2025年就出现。MCP配置冲突的问题那时已经反复出现并有充分记录。Dynamic Workflows是个令人兴奋的方向，但个人开发者的日常使用场景还不够适配——需要有同时协调数十个agent的工作量，这对大多数人来说并不常见。

<strong>希望看到的：</strong>

/usage有了细分之后，下一个自然的步骤是"为特定MCP服务器或插件设置token预算"。现在能看到某个MCP服务器消耗了40%的token，但无法限制它。这个功能要是上线，会比/usage细分更有实用价值。

总体而言，这次6月更新是"安静但磨砺实务"的更新。重度使用Claude Code的人会感受到改变；期待重量级新功能的人打开发布说明可能会失望。这就是本次更新的定位。

想持续跟踪更新，官方文档的 [What's new](https://code.claude.com/docs/en/whats-new) 页面是最可靠的来源。npm上 `@anthropic-ai/claude-code` 我查到的最新版本是2.1.173。运行 `claude update` 即可自动更新。

值得一提的是，本次更新的共同点是"使用量越多越需要的功能"。一年前刚开始用Claude Code时，Safe Mode这样的功能几乎不需要——那时只连了1〜2个MCP服务器，没有插件也没有hooks。现在配置复杂了，诊断工具和监控功能的价值也随之提升。这些更新体现了Claude Code走向成熟的方向。
