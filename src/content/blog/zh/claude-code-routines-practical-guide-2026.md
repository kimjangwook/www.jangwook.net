---
title: "Claude Code Routines 实战指南 — 用定时任务、API 和 GitHub 事件实现 AI 全天候自动化"
description: "Claude Code Routines 只需一次配置提示词、代码库和连接器，即可在 Anthropic 基础设施上自主运行。本指南详解定时调度、API 调用、GitHub 事件三种触发方式的设置步骤，并分享从 PR 审查自动化到文档漂移检测的实战用例。"
pubDate: '2026-04-22'
heroImage: '../../../assets/blog/claude-code-routines-practical-guide-2026-hero.jpg'
tags:
  - ClaudeCode
  - 自动化
  - AI代理
relatedPosts:
  - slug: claude-code-agentic-workflow-patterns-5-types
    score: 0.95
    reason:
      ko: Routines가 어떤 에이전틱 패턴에 해당하는지 이해하고 싶다면, 이 글에서 다룬 자율 에이전트 패턴 5가지가 직접적인 배경 지식이 됩니다.
      ja: RoutinesがどのエージェンティックパターンになるかをClaudeの5つのワークフローパターンと照らし合わせて理解できます。
      en: Understanding which agentic pattern Routines represent is much clearer after reading this breakdown of Claude Code's five workflow patterns.
      zh: 了解 Routines 对应哪种代理模式，可以参考这篇对 Claude Code 五种工作流模式的详细解析。
  - slug: mcp-server-build-practical-guide-2026
    score: 0.90
    reason:
      ko: Routines의 커넥터가 MCP 기반이므로, MCP 서버를 직접 구축해본 경험이 있다면 커넥터 생태계를 더 깊이 활용할 수 있습니다.
      ja: RoutinesのコネクタはMCPベースなので、MCPサーバーを実際に構築した経験があればコネクタエコシステムをより深く活用できます。
      en: Since Routines connectors are MCP-based, hands-on MCP server experience lets you extend and customize the connector ecosystem beyond the defaults.
      zh: 由于 Routines 连接器基于 MCP，拥有 MCP 服务器构建经验可以让你更深层地定制连接器生态系统。
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.87
    reason:
      ko: Git Worktree로 Claude Code를 병렬 실행하는 패턴을 익혔다면, Routines는 그 병렬성을 시간 축으로 확장하는 자연스러운 다음 단계입니다.
      ja: Git Worktreeを使った並列Claude Codeセッションを習得していれば、Routinesはその並列性を時間軸に拡張する自然な次のステップです。
      en: If you've already set up parallel Claude Code sessions with git worktrees, Routines are the natural next step—extending that parallelism across time rather than space.
      zh: 如果你已掌握用 Git Worktree 并行运行 Claude Code，Routines 是将这种并行性延伸到时间维度的自然下一步。
  - slug: claude-managed-agents-production-deployment-guide
    score: 0.82
    reason:
      ko: Routines는 단순 자동화이고 Managed Agents는 더 복잡한 멀티 에이전트 조율을 다룹니다. 두 접근법의 차이와 적합한 사용 시나리오를 비교하면 선택이 쉬워집니다.
      ja: RoutinesはシンプルなスケジュールタスクでManaged Agentsはより複雑なマルチエージェント調整に対応します。両アプローチの違いを把握することで適切な選択ができます。
      en: Routines handle scheduled automation while Managed Agents coordinate complex multi-agent workflows. Comparing the two helps you pick the right tool for each scenario.
      zh: Routines 处理计划任务，而 Managed Agents 负责更复杂的多代理编排。比较两者的差异有助于为不同场景选择合适的工具。
---

上周，一位团队成员说"昨晚 PR 被自动审查了"，我愣了一下。明明没有人提交审查请求，但 Claude 在夜里自动打开了 PR，按照团队的编码规范留下了内联注释，还附上了总结。那是我第一次真正接触 Claude Code Routines。

Anthropic 于 2026 年 4 月 14 日以研究预览版形式发布了 Routines。尽管仍处于测试阶段，它确实改变了自动化重复工作的方式。本文将基于实际使用经验，介绍 Routines 的工作原理、设置方法，以及坦率地说在哪些地方会遇到局限。

## Claude Code Routines 是什么？— Prompt + Repository + Connector 三要素

官方文档这样描述："Routine 是已保存的 Claude Code 配置：提示词、一个或多个代码库，以及一组连接器，一次打包、自动运行。"

简单来说，有三个组成部分。

**提示词（Prompt）**：Claude 每次运行时遵循的指令。关键在于，提示词必须完全自给自足（self-contained）。"按上次的方式做"行不通——每次执行都从零开始，没有对之前运行的记忆。

**代码库（Repository）**：Claude 克隆并操作的 GitHub 仓库，支持指定多个。默认从主分支开始工作。有一个重要限制：默认情况下，Routines 只能推送到以 `claude/` 为前缀的分支，防止意外修改受保护分支。

**连接器（Connector）**：基于 MCP（模型上下文协议）的外部服务集成，目前支持 Slack、Linear、Google Drive、GitHub 等。连接器让 Routine 不仅能操作代码，还能读写外部系统。

三个要素结合，就得到了一个"在 Anthropic 服务器上自主运行的 AI 代理"，无需保持本地电脑开启或维护自己的服务器。

## 开始前的准备

使用 Routines 需要以下条件：

- 已在 Web 上启用 Claude Code 的 Pro、Max、Team 或 Enterprise 计划
- GitHub 账号（用于代码库集成）
- 提前配置好要使用的 MCP 连接器（Slack、Linear 等）

**各计划每日运行上限**：

| 计划 | 每日 Routine 运行次数 |
|------|-------------------|
| Pro | 5次 |
| Max | 15次 |
| Team | 25次 |
| Enterprise | 25次 |

坦白说，Pro 计划的每日 5 次有些紧张。对于每天 PR 超过 10 个的团队来说，很快就会触达上限。要认真使用 Routines，Team 计划以上才是现实可行的起点。

## Step 1 — 创建第一个 Routine

有三种创建方式。

### Web UI 方式（最直观）

1. 进入 `claude.ai/code/routines`
2. 点击"New routine"
3. 输入名称并编写提示词
4. 选择 GitHub 代码库
5. 选择云环境（控制网络访问、环境变量、启动脚本）
6. 选择触发器：定时/API/GitHub 事件
7. 检查连接器配置
8. 创建

最关键的是**提示词编写**。需要具体、自给自足：

```
你是这个代码库的代码审查员。

找到今天新建的 PR，并执行以下操作：
1. 确认 PR 标题和描述符合 [仓库名] 的规范
2. 检查变更文件中是否存在明显的 Bug 或安全问题
3. 确认测试覆盖率是否充足（每个新函数至少一个测试）
4. 将发现的问题以内联注释形式留在代码中，并在 PR 添加总结评论

审查完成后，向 Slack #code-review 频道发送"审查完成：[PR 标题]"
```

避免使用模糊表达（"适当审查"、"按团队风格"）。Routine 不会回头追问。

### CLI 方式

在 Claude Code 会话中使用 `/schedule` 命令创建：

```bash
/schedule daily PR review at 9am
```

Claude 会通过对话引导完成设置。创建后的管理命令：

```bash
/schedule list          # 查看所有 Routine
/schedule update        # 修改已有 Routine
/schedule run           # 立即执行（用于测试）
```

### 桌面应用方式

菜单选择 Schedule → New task → New remote task，跳转到 Web UI。

## Step 2 — 配置触发器

Routines 支持三种触发器，单个 Routine 可以同时设置多种触发器。

### 定时触发器

设置重复周期，可选：
- 每小时/每天/工作日/每周
- 自定义 cron 表达式

```
# 每天上午 9 点运行（本地时区自动转换）
cron: 0 9 * * *

# 每周一上午 10 点
cron: 0 10 * * 1
```

最小间隔为 1 小时，不支持分钟级轮询。

我用周期调度器测试了文档漂移检测 Routine，每周一早上扫描上周合并的 PR，自动开启过期 API 文档的更新 PR。整体运行顺畅，但 Claude 偶尔会遗漏仅在代码注释中体现但未同步到文档的变更。更具体的提示词是解决之道。

### API 触发器

每个 Routine 拥有专属 HTTP 端点，使用 Routine 专属的 Bearer Token 认证。

```bash
# 通过 API 触发 Routine
curl -X POST \
  https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire \
  -H "Authorization: Bearer {routine_token}" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -H "Content-Type: application/json" \
  -d '{"text": "本次部署修改了 api/users 端点，需要核查相关文档。"}'
```

`text` 字段可传入每次运行的特定上下文。监控系统在检测到异常时附带警报内容触发 Routine，是常见的使用模式。

如果你[曾亲手构建过 MCP 服务器](/zh/blog/zh/mcp-server-build-practical-guide-2026)，就已经体会过这个连接器生态的扩展能力。Routines 将相同的连接器带入了自动化执行环境。

### GitHub 事件触发器

这是最强大的触发器类型。PR 或 Release 事件发生时，Routine 自动启动。

支持的事件：
- PR：opened, closed, assigned, labeled, synchronized, updated
- Release：created, published, edited, deleted

过滤选项非常精细，可按 PR 作者、标题/正文文本、分支名、标签、草稿状态、合并状态或正则表达式进行过滤。

```yaml
# PR 审查 Routine 的 GitHub 事件配置示例
trigger:
  type: github_event
  event: pull_request.opened
  filters:
    - author_not_in: ["dependabot[bot]", "renovate[bot]"]  # 排除 Bot PR
    - base_branch: "main"
    - labels_not_contains: ["skip-review"]
```

## Step 3 — 通过 MCP 连接器集成外部服务

连接器是 Routine 与外部系统通信的通道。目前支持：

- **Slack**：读写频道消息
- **Linear**：创建/更新 Issue
- **Google Drive**：读写文档
- **GitHub**：PR 评论、Issue 管理（默认包含）

创建 Routine 时，所有已连接的 MCP 连接器默认包含其中。建议移除不需要的连接器，最小化 Routine 的访问范围——这是基本的安全习惯。

实战集成示例：

```
[Slack + Linear 联动的 Issue 分类 Routine]

读取 Slack #bug-reports 频道过去 24 小时的新消息，并：
1. 判断是否为可复现的 Bug 报告
2. 如果是 Bug，在 Linear 创建 Issue（严重程度：从内容推断）
3. 在 Slack 线程中回复 Linear Issue 链接
4. 信息不明确时，发送消息请求补充信息
```

如果你了解 [Claude Code 的五种代理工作流模式](/zh/blog/zh/claude-code-agentic-workflow-patterns-5-types)，Routines 最接近其中的"自主代理（Autonomous Agent）"模式——在云端按计划执行，而非交互式运行。

## 四个实战用例

以下是我发现在实践中效果较好的 Routine 类型。

### 用例一：PR 自动审查

效果最立竿见影的用例。在 `pull_request.opened` 事件上设置触发器，将团队编码规范写入提示词，Claude 就会在每个 PR 打开时自动开始审查。

```
[PR 审查 Routine 提示词核心部分]

参考 CONTRIBUTING.md 中的风格指南：
- 检查变量名是否符合 camelCase 或 snake_case 规范
- 检查公共 API 变更时是否更新了 CHANGELOG.md
- 确认新端点是否添加了 OpenAPI 规范

将具体问题以 GitHub 内联注释形式留存，整体总结作为 PR 评论
不要做"LGTM"或"Request Changes"的最终判定——那是人类的决策
```

最后一行很重要。赋予 Claude 最终裁决权会让团队成员感到不适。保持 Routine 在"发现+说明"的角色，决策交给人类。

### 用例二：夜间 Backlog 分类

每晚对新建 Issue 进行分类的 Routine。

```
每天午夜执行：
1. 获取今天打开的所有 GitHub Issue
2. 添加类型标签（bug, feature-request, question, documentation）
3. 按代码区域自动分配负责人（参考 CODEOWNERS 文件）
4. 将分类结果创建为 Linear Issue（同时向 Slack #triage 发送摘要）
```

直接使用的经验告诉我：CODEOWNERS 文件如果未及时更新，Routine 会将任务分配给错误的人。Routines 不能凭空创造良好的自动化——它在现有基础数据质量好的时候才能发挥应有效果。

### 用例三：部署后烟雾测试

在 CD 流水线最后通过 API 触发 Routine。

```bash
# 部署完成后执行
curl -X POST \
  https://api.anthropic.com/v1/claude_code/routines/{smoke_test_routine_id}/fire \
  -H "Authorization: Bearer {token}" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -d '{
    "text": "v2.3.4 部署完成。环境：production。部署时间：2026-04-22T14:30:00Z"
  }'
```

Routine 调用关键 API 端点，扫描错误日志，并向 #releases 频道发送 go/no-go 判断。

之前详细介绍过[如何将 MCP 服务器部署到 Kubernetes 生产环境](/zh/blog/zh/mcp-server-production-deployment-kubernetes-guide)。将此烟雾测试 Routine 作为该流水线的最后步骤，两者自然衔接。

### 用例四：每周文档漂移检测

每周一早上扫描上周合并的 PR，找出 API 文档与代码不一致的地方，自动开启更新 PR。

说实话，这个用例给我留下了最深的印象。每周人工检查代码变更与文档之间的差距对大多数团队来说并不现实。让 Routine 持续处理这项工作，是提升文档质量的有效手段。重要提醒：Claude 生成的更新 PR 不能自动合并，必须保留人工审查步骤。

## 坦率评估 — 局限与注意事项

Routines 确实令人印象深刻，但研究预览阶段的标签不应被低估。

**还不适合用于生产关键路径。** API 要求 `experimental-cc-routine-2026-04-01` 头部本身就说明了成熟度问题。API 接口可能会变化，且仅保证前两个版本的兼容性。关键自动化需要更多验证时间。

**审计跟踪不足。** 很难追溯 Claude 做出特定决策的原因。当 Routine 自动留下评论或创建 Issue 时，从日志中完整还原决策依据目前几乎不可能。

**没有审批检查点。** Routine 完全自主运行。错误可能在提交到代码库后才被发现。默认的分支推送限制（`claude/` 前缀）提供了一定保护，但错误变更仍可能在此范围内累积。

**GitHub 事件处理量有限制。** 研究预览期间，GitHub 事件受到每个 Routine、每个账号的每小时限制。对高 PR 量的 Monorepo 设置事件触发器，可能导致事件被丢弃。

**无法复用会话状态。** GitHub 事件触发两次就会启动两个独立会话，没有办法将一次运行的上下文传递给下一次。

如果你已[掌握使用 git worktree 并行运行 Claude Code 的方法](/zh/blog/zh/claude-code-parallel-sessions-git-worktree)，可以将 Routines 理解为将并行性延伸到时间维度——当你在做某件事时，Routine 正在另一个代码库中处理另一件事。

我的原则：Routines 只用于"即使失败也无关紧要的工作"——出错后人类可以轻松回滚的任务，失败后下次运行自然修正的任务。在这个范围内，它始终能提供稳定价值。

## 结论 — 适合哪些团队

坦率地说，Routines 目前最适合**已经习惯 AI 自动化的团队作为实验性工具**使用。

建议从三类工作开始：

<strong>第一</strong>，人类需要定期完成但规则明确的重复性工作（Backlog 分类、标签整理）。
<strong>第二</strong>，失败后下次运行自然弥补的工作（文档漂移检测）。
<strong>第三</strong>，输出结果仍需人工最终确认的工作（审查草稿、更新 PR 草稿）。

Anthropic 持续加大对 Routines 的投入显而易见。日志强化、GitHub 事件处理量提升、会话连续性支持很可能近期落地。现在以低风险用例开始试验，找到适合团队的模式，等功能稳定后再扩展已验证的 Routine，是更明智的路径。

---

**参考链接**：
- [Claude Code Routines 官方文档](https://code.claude.com/docs/en/routines)
- [Anthropic 官方博客：介绍 Routines](https://claude.com/blog/introducing-routines-in-claude-code)
