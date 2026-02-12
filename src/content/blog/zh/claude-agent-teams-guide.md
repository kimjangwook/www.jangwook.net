---
title: Claude Code Agent Teams 完全指南 — 从 OpenClaw 团队搭建到实战运营
description: 基于在 OpenClaw 环境中启用 Claude Code Agent Teams、组建 5 个专业团队并实际运营的经验，编写的实战指南。
pubDate: '2026-02-07'
heroImage: ../../../assets/blog/claude-agent-teams-guide-hero.png
tags:
  - claude-code
  - agent-teams
  - openclaw
  - multi-agent
  - tmux
  - automation
relatedPosts:
  - slug: claude-code-cli-migration-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: effiflow-automation-analysis-part3
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-plugins-complete-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

## 什么是 Agent Teams

2026 年 2 月 5 日，Anthropic 发布了 Claude Code 的全新实验性功能 <strong>Agent Teams</strong>。与此前只能在单一会话内返回结果的子代理（subagent）不同，Agent Teams 由多个完全独立的 Claude Code 实例组成，它们能够<strong>直接相互通信、协同工作</strong>。

核心区别如下：

| 维度 | 子代理 | Agent Teams |
|------|--------|-------------|
| 上下文 | 在主会话内部 | 各自拥有独立的上下文窗口 |
| 通信 | 仅向主代理返回结果 | 队友之间直接收发消息 |
| 协调 | 主代理统一管理 | 通过共享任务列表自主协调 |
| Token 成本 | 相对较低 | 随队友数量线性增长 |

发布当天，我决定在 OpenClaw 环境中立即测试这一功能。本文记录了从环境搭建到实际运营的完整过程。

## 前置准备 — OpenClaw dev 构建

使用 Agent Teams 需要最新版 Claude Code。当时 OpenClaw stable 频道存在 cron 任务的 bug，正好需要切换到 dev 频道。（[相关文章](/zh/blog/zh/openclaw-cron-fix-guide/)）

### 启用 pnpm

```bash
corepack enable pnpm
```

### 切换 dev 频道并源码构建

```bash
export OPENCLAW_GIT_DIR=~/openclaw
openclaw update --channel dev
```

如果自动更新失败，手动构建：

```bash
cd ~/openclaw
pnpm install && pnpm build && npm install -g .
```

### 重启网关

```bash
openclaw gateway restart
```

完成后即可使用 dev 频道的 v2026.2.4 版本，其中包含支持 Agent Teams 的 Claude Code。

## 启用 Agent Teams

Agent Teams 默认处于禁用状态。有两种启用方式：

### 方式一：直接设置环境变量

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### 方式二：在 settings.json 中持久化

`~/.claude/settings.json`：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### 在 OpenClaw LaunchAgent 中配置

如果你通过 macOS LaunchAgent 运行 OpenClaw，需要在 plist 文件的 `EnvironmentVariables` 中添加该变量，确保网关重启后依然生效：

```xml
<key>EnvironmentVariables</key>
<dict>
    <key>CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS</key>
    <string>1</string>
</dict>
```

我选择了 settings.json 方案。环境变量会随会话消失，而 settings.json 在每次 Claude Code 启动时自动加载。

## 配置 teammateMode

Agent Teams 支持三种显示模式：

- <strong>in-process</strong>：所有队友在主终端内运行，用 `Shift+↑/↓` 选择队友。
- <strong>tmux</strong>：每个队友在独立的 tmux 分屏窗格中运行，一屏总览所有输出。
- <strong>iTerm2</strong>：使用 iTerm2 时自动分屏。

默认为 `auto`——在 tmux 会话内自动使用分屏，否则使用 in-process。

我显式设置了 <strong>tmux 模式</strong>：

```json
{
  "teammateMode": "tmux"
}
```

理由很简单：同时运营 5 个团队时，必须在<strong>同一屏幕上实时</strong>看到每个队友的工作状态，才能快速发现瓶颈。

如果尚未安装 tmux：

```bash
brew install tmux
```

## 团队设计 — 5 个专业团队

以下是本次组建的 5 个团队及其设计思路。

### 1. ops（运维）

负责基础设施检查、网关状态监控、cron 任务验证。dev 频道切换后这个团队尤为重要。

### 2. branding（品牌）

负责博客撰写、封面图生成、多语言内容管理。该团队同时以 4 种语言（中/韩/日/英）生产技术内容。

### 3. invest（投资）

并行处理市场分析、投资组合审查和风险评估。

### 4. dev（开发）

负责代码审查、重构、测试编写和功能开发。关键在于明确划分每个队友的模块职责，避免文件冲突。

### 5. social（社交）

负责社交媒体文案起草、趋势分析和社区监控。

团队构建提示词示例：

```
创建 5 个代理团队：
- ops：基础设施运维与监控
- branding：内容生产与多语言管理
- invest：市场分析与投资研究
- dev：代码编写与审查
- social：社交媒体与社区管理
每个团队分配 2 名成员，使用 Sonnet 模型。
```

## 任务列表与依赖管理

Agent Teams 的核心机制之一是<strong>共享任务列表</strong>。团队主管创建任务，队友自主认领（claim）并执行。

### 任务状态

- <strong>pending</strong>：等待认领
- <strong>in progress</strong>：执行中
- <strong>completed</strong>：已完成

### 依赖关系

设置任务间的依赖关系后，前置任务未完成时，后续任务无法被认领。

实际示例：

```
任务列表：
1. [ops] 网关健康检查
2. [ops] cron 任务验证（→ 依赖 #1）
3. [branding] 博客初稿撰写
4. [branding] 封面图生成
5. [branding] 多语言翻译（→ 依赖 #3）
6. [dev] 推荐系统重构
7. [dev] 测试编写（→ 依赖 #6）
```

任务认领通过文件锁机制防止竞争条件，多个队友同时尝试认领同一任务也不会冲突。

## 实战运营

### Delegate 模式

默认情况下团队主管也可以直接执行任务，但启用 <strong>Delegate 模式</strong>后，主管只负责协调：

- 创建/关闭队友
- 转发消息
- 管理任务

启用方式：`Shift+Tab`

运营大规模团队时强烈建议使用 Delegate 模式。主管一旦开始写代码，协调就会出现空档。

### 直接与队友对话

可以绕过主管，直接向某个队友发送指令：

- <strong>in-process</strong>：`Shift+↑/↓` 选择队友后输入消息
- <strong>tmux</strong>：点击对应窗格直接交互

### 计划审批

对于关键任务，可以要求队友先制定计划，经主管审批后再执行：

```
为认证模块重构创建一个 architect 队友。
要求在执行变更前必须通过计划审批。
```

主管审核后批准或附带反馈驳回。

## OpenClaw × Agent Teams — 协同效应

有趣的是，OpenClaw 自身的多代理能力与 Agent Teams 运行在<strong>不同层级</strong>。

### OpenClaw 多代理

- 在 <strong>频道层级</strong>（Telegram、Discord 等）管理代理
- 每个代理拥有独立的人设和配置
- 支持 cron 任务、心跳等<strong>自动化调度</strong>

### Claude Code Agent Teams

- 在<strong>会话层级</strong>实现多个 Claude Code 实例的协作
- 共享任务列表和消息系统
- 专为代码工作优化的并行处理

将两个层级组合：

```
OpenClaw 代理（频道层级）
  └─ Claude Code 会话
       └─ Agent Team（会话层级）
            ├─ 队友 A (ops)
            ├─ 队友 B (branding)
            └─ 队友 C (dev)
```

实现路径：OpenClaw 主代理接收 Telegram 消息，生成子代理，子代理组建 Agent Team 并行处理复杂任务，最终将结果通过 Telegram 返回。

## 最佳实践

### 1. 防止文件冲突

最大的坑是<strong>多个队友同时修改同一文件</strong>。

- 明确划分每个队友的目录/文件职责
- 通过任务依赖确保共享文件只有一个写入者
- 在 `.claude/teams/` 目录中查看团队配置

### 2. 上下文传递

队友会自动加载 CLAUDE.md、MCP 服务器和技能，但<strong>不会继承主管的对话历史</strong>。因此：

- 在 spawn 提示中包含充足的上下文
- 明确指定相关文件路径
- 必要时在 CLAUDE.md 中添加团队公共信息

### 3. Token 管理

每个队友使用独立的上下文窗口，Token 消耗会急剧增加。

- 简单任务用子代理就够了
- Agent Teams 应聚焦于<strong>讨论、审查和并行探索</strong>
- 广播消息的成本与团队规模成正比 → 尽量少用

### 4. 权限管理

队友继承主管的权限设置。如果主管使用 `--dangerously-skip-permissions` 启动，所有队友同样拥有完全权限。务必谨慎。

## 局限与注意事项

1. <strong>实验性功能</strong>：环境变量名中的 `EXPERIMENTAL` 说明一切。API 随时可能变更。

2. <strong>Token 成本</strong>：5 人团队意味着至少 5 倍的 Token 消耗。需要评估投入产出比。

3. <strong>调试困难</strong>：多个队友同时工作时，问题定位变得复杂。

4. <strong>顺序任务效率低</strong>：依赖关系密集的工作最终还是串行执行，没必要动用团队。

5. <strong>同文件编辑风险</strong>：目前不支持文件级锁定，只能通过任务设计来规避。

6. <strong>tmux 几乎是必需的</strong>：用 in-process 模式监控 5 个团队非常吃力，tmux 才是正解。

## 总结

Agent Teams 虽然还在实验阶段，但潜力已经显而易见。与 OpenClaw 的多代理架构结合后，能实现频道层级自动化 + 会话层级并行协作的双层体系。

但现阶段将 Agent Teams 应用于所有任务并不划算。应聚焦于<strong>并行探索、代码审查、竞争假设验证</strong>等场景——独立工作居多、队友间讨论能创造实际价值的场景。

环境搭建 30 分钟就能搞定。真正的难点在于<strong>如何划分团队、如何拆解任务</strong>这个设计问题。这种直觉，只能在实践中打磨。
