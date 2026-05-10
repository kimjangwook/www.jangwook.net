---
title: "Claude Code 实战大师班 #1 — 用斜线命令·Hook·子代理三步实现工作流自动化"
description: '通过斜线命令(.claude/commands/)定义任务，用settings.json Hook连接事件，委托给子代理(.claude/agents/)执行。本文通过实际博客自动化系统，详解Claude Code三步自动化模式。'
pubDate: '2026-05-10'
heroImage: '../../../assets/blog/claude-code-masterclass-series-1-prompt-to-agent-hero.jpg'
tags:
  - ClaudeCode
  - 自动化
  - 子代理
  - 工作流
relatedPosts:
  - slug: "claude-code-hooks-workflow"
    score: 0.92
    reason:
      ko: "훅을 코드 리뷰 자동화에 적용한 구체적인 사례입니다. Step 2에서 다룬 PostToolUse·Stop 훅이 실제로 어떻게 쓰이는지 확인할 수 있습니다."
      ja: "フックをコードレビュー自動化に適用した具体的なケースです。Step 2で扱ったPostToolUse・Stopフックが実際にどう使われるか確認できます。"
      en: "A concrete example of applying hooks to code review automation. Shows how the PostToolUse and Stop hooks from Step 2 work in a real project."
      zh: "将Hook应用于代码审查自动化的具体案例，展示Step 2中PostToolUse和Stop Hook在实际项目中的应用。"
  - slug: "claude-agent-teams-guide"
    score: 0.88
    reason:
      ko: "서브에이전트를 5개 전문 팀으로 조직하는 방법입니다. Step 3에서 소개한 에이전트 위임 패턴을 팀 단위로 확장한 버전입니다."
      ja: "サブエージェントを5つの専門チームに組織する方法です。Step 3で紹介したエージェント委任パターンをチーム規模に拡張したバージョンです。"
      en: "Organizing subagents into 5 specialized teams — extends the agent delegation pattern from Step 3 to a team-scale structure."
      zh: "将子代理组织为5个专业团队，是Step 3中代理委托模式的团队级扩展版本。"
  - slug: "claude-code-agentic-workflow-patterns-5-types"
    score: 0.81
    reason:
      ko: "이 마스터클래스에서 만든 파이프라인이 5가지 에이전틱 패턴 중 어디에 속하는지 파악하는 데 도움이 됩니다."
      ja: "このマスタークラスで作ったパイプラインが5つのエージェントパターンのどれに当たるか把握するのに役立ちます。"
      en: "Helps identify where the pipeline built in this masterclass fits among the 5 agentic workflow patterns."
      zh: "帮助了解本教程构建的管道属于5种代理工作流模式中的哪种。"
  - slug: "claude-code-plugins-complete-guide"
    score: 0.76
    reason:
      ko: "슬래시 명령어와 에이전트를 플러그인 형태로 재사용하는 방법입니다. 이 글에서 다룬 `.claude/commands/` 구조를 외부 레포에서 공유하는 다음 단계입니다."
      ja: "スラッシュコマンドとエージェントをプラグイン形式で再利用する方法です。この記事で扱った`.claude/commands/`構造を外部リポジトリで共有する次のステップです。"
      en: "How to reuse slash commands and agents as plugins. The next step after mastering the .claude/commands/ structure covered here."
      zh: "以插件形式重用斜线命令和代理的方法，是本文.claude/commands/结构的外部共享进阶。"
---

你现在读到的这篇文章，很可能是今天早上11点30分自动触发的launchd任务唤醒了Claude Code，执行了`/daily-tech-blog`斜线命令，再由多个子代理分工完成研究和翻译后生成的。

过去几个月，我一直在亲手构建和运维这套自动化管道。它并不完美——有时会触发超时，有时构建失败，有时只生成了某一种语言的版本就结束了。但如果没有这套系统，每天用4种语言发布文章根本不可能实现。

这个系列记录的就是这一过程中学到的东西。第1篇聚焦最核心的三步：<strong>斜线命令</strong>、<strong>Hook</strong>、<strong>子代理</strong>——从零开始构建的方法。

## Step 1：斜线命令 — `.claude/commands/` 文件夹就是全部

在Claude Code中创建`/commit`、`/review`、`/deploy`这类命令的方法出奇地简单：只需在`.claude/commands/`目录下放一个`.md`文件。

文件名就是命令名：

```
.claude/
└── commands/
    ├── commit.md          → /commit
    ├── daily-review.md    → /daily-review
    └── publish.md         → /publish
```

文件内容是自然语言指令。看起来像Markdown，但行为像代码：

```markdown
# Publish Command

Validate and publish the blog post to production.

## Usage
/publish <slug>

## Workflow
1. Run npm run validate:publishing
2. Run npm run build
3. Run git add and commit with the slug
4. Run git push origin main

Report errors clearly with the step number.
```

就这些。在Claude Code会话中输入`/publish my-post-slug`，上面定义的工作流就会执行。Claude将每个步骤解释后转换为工具调用。

第一次看到这个结构时，让我惊讶的是"不需要编程语言"。用文本写下流程，Claude就会按情况自行执行。当然，有时解释结果和意图有偏差——这种不可预测性至今仍是挑战。

### 编写命令的技巧

与其只写"做什么"，加入"为什么是这个顺序"和"哪些情况下要有不同行为"会精确得多：

```markdown
# Daily Tech Blog

Research, write, validate, and publish one daily article.

## Context
- Today's date: use `date +%F`
- Blog repo: ~/Documents/workspace/www.jangwook.net
- Content types: how-to (Mon-Wed), news (Thu-Fri), series (Sat-Sun)

## Failure Handling
- If sandbox test fails: switch to Source Review lane
- If build fails 3 times: stop and report
- Never ask the user — this runs unattended
```

"Never ask the user"这一行是实现自主运行模式的关键。没有它，Claude在遇到不确定情况时就会停下来询问确认。在定时任务中这是致命的。

## Step 2：settings.json Hook — 事件驱动的自动化

如果斜线命令定义"做什么"，Hook定义的就是"什么时候自动触发"。

在`.claude/settings.json`的`hooks`字段中注册事件-命令对：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/send-telegram.sh 'Claude已完成任务'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[audit] $(date) — 文件写入发生\" >> ~/.claude/audit.log"
          }
        ]
      }
    ]
  }
}
```

### 4种Hook类型

| 类型 | 触发时机 | 常见用途 |
|------|---------|---------|
| `PreToolUse` | Claude调用工具的<strong>前一刻</strong> | 拦截危险命令、审计日志 |
| `PostToolUse` | 工具调用<strong>完成后</strong> | 文件保存后执行lint、提交后通知 |
| `Stop` | Claude<strong>完全停止</strong>响应时 | 完成通知、清理工作 |
| `SessionStart` | Claude会话<strong>启动时</strong> | 注入时间上下文、环境设置 |

在我的配置中最有用的是`Stop` Hook。长时间自动化任务（30分钟〜1小时）完成后，会收到Telegram通知。设置好这个之后，我就彻底摆脱了盯着终端看"结束了没有"的习惯。

### permissions配置 — 基于白名单的安全控制

与Hook一起必须配置的是`permissions`。默认情况下，Claude Code在执行每条Bash命令前都会请求用户审批。在自动化环境中，这个行为会阻断整个管道。

预先注册允许执行的命令，就能跳过审批提示直接执行：

```json
{
  "permissions": {
    "allow": [
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(npm run build:*)",
      "Bash(npm run validate:*)"
    ]
  }
}
```

<strong>注意</strong>：白名单设置过宽（如`Bash(*)`）可能导致意外命令执行。只注册实际需要的命令模式才是安全做法。

在实际代码审查管道中应用Hook的详细案例，可以参考[用Claude Code Hook构建自动化代码审查系统](/zh/blog/zh/claude-code-hooks-workflow)。

## Step 3：子代理委托 — `.claude/agents/` 专业化AI

让单个Claude实例同时处理研究 + 写作 + SEO优化 + 翻译 + 构建，会降低每项任务的专注度，也浪费Token上下文。

子代理是为每个角色创建独立Claude实例的概念。在`.claude/agents/`文件夹中，用带frontmatter的Markdown文件来定义：

```markdown
---
name: writing-assistant
description: Technical blog post writer. Use when creating multilingual (ko/ja/en/zh) developer content.
tools: Read, Write, WebSearch
---

You are a technical writer specializing in developer-focused content.

Core rules:
- Write for developers who will actually run the code
- Include at least 3 first-person experience references
- Verify technical claims before writing
- Never fabricate benchmarks or logs
```

frontmatter中的`description`字段最为关键。编排器Claude在判断"什么时候该用哪个代理"时会参考这个字段。写得含糊，就会调用错误的代理，或者完全被忽略。

`tools`字段只列出该代理实际需要的工具。没有`Write`权限的研究代理就不会意外修改文件。这是同时实现角色专业化和权限限制的方法。

这个博客目前运行着19个代理：

- `writing-assistant` — 4种语言文章写作
- `seo-optimizer` — 元标签、内链优化
- `web-researcher` — 趋势研究和事实核查
- `content-recommender` — 生成relatedPosts
- `image-generator` — 撰写英雄图片简报

关于将代理组织成团队的更复杂模式，可以参考[Claude Code代理团队完整指南](/zh/blog/zh/claude-agent-teams-guide)。

## 三步整合：实际自动化管道

比起理论，直接看运行中的管道更直观。这个博客每日自动化的流程如下：

```
macOS launchd (每天11:30)
    ↓
daily-tech-blog.sh
    ↓
claude --dangerously-skip-permissions "/daily-tech-blog"
    ↓
/daily-tech-blog 斜线命令执行
    ├── 趋势研究（子代理：web-researcher）
    ├── 沙盒测试（mktemp）
    ├── 4语言文章写作（子代理：writing-assistant）
    ├── npm run validate:publishing
    ├── npm run build
    └── git push origin main
    ↓
Stop Hook → send-telegram.sh → Telegram通知
```

最关键的文件是`daily-tech-blog.sh`。调用Claude的核心部分：

```bash
run_with_timeout "$MAX_TIMEOUT" claude --dangerously-skip-permissions \
  "/daily-tech-blog" \
  < /dev/null >> "$LOG_FILE" 2>&1 || CLAUDE_EC=$?
```

`--dangerously-skip-permissions`跳过所有权限提示。如名字所示，这是危险的。只有在白名单定义完善的状态下才能使用，个人自动化项目之外不建议使用。

`< /dev/null`关闭stdin，防止Claude无限等待交互式输入。在cron任务中这是必须的。

实际执行日志长这样：

![daily-tech-blog实际执行日志截图](../../../assets/blog/claude-code-masterclass-series-1-log-capture.jpg)

launchd plist的配置也值得参考：

```xml
<key>StartCalendarInterval</key>
<dict>
    <key>Hour</key>
    <integer>11</integer>
    <key>Minute</key>
    <integer>30</integer>
</dict>
<key>StandardOutPath</key>
<string>/Users/jangwook/logs/launchd-daily-tech-blog.log</string>
```

将日志重定向到文件，在调试"为什么今天的文章没有发布"时帮助极大。

## 实际入门 — 5分钟最小配置

为刚开始尝试三步走的人整理了最简工作示例，可以直接应用到现有项目。

**1. 创建文件夹结构**

```bash
mkdir -p .claude/commands .claude/agents
```

**2. 第一个斜线命令** (`.claude/commands/review.md`)

```markdown
# Review Command

Review recent changes before committing.

## Steps
1. Run git diff --staged to see staged changes
2. Check for: hardcoded secrets, console.log, TODO comments
3. Suggest improvements or approve with "LGTM"

For detailed security analysis, delegate to @checker agent.
```

**3. 完成通知Hook配置** (`.claude/settings.json`)

```json
{
  "permissions": {
    "allow": ["Bash(git:*)", "Bash(npm:*)"]
  },
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "say 'Claude已完成任务'"
      }]
    }]
  }
}
```

**4. 第一个代理定义** (`.claude/agents/checker.md`)

```markdown
---
name: checker
description: Code quality reviewer. Use when checking files for issues before commit.
tools: Read, Grep
---

Review the provided files for syntax errors, obvious bugs, and security issues.
Rate: SAFE / CAUTION / CRITICAL
```

这4个文件是最小工作单元。有了这些，`/review`就能分析暂存的变更，工作完成后收到语音通知，需要详细检查时委托给`checker`代理。

## 诚实的评价 — 哪些地方不好用

运行这套系统三个月后，我遇到了一些现实的限制。

<strong>成本问题</strong>：每天自动生成4种语言、2500字以上的文章，月度API费用累积得比预期快。我靠Anthropic Max订阅勉强控制，但不接受这个成本就无法维持这个规模的自动化。

<strong>超时处理</strong>：构建慢或子代理链条太长，就会触发60分钟超时。文章只生成到一半就中断。如果没有超时检测后的清理逻辑，仓库状态会变得混乱。

<strong>代理质量的非确定性</strong>：同一个命令执行两次，结果可能不同。文章质量、内链位置、relatedPosts选择——每天都不一样。这是LLM的特性，无法消除，只能通过QA循环（validate:publishing、astro check、build）来保证最低质量标准。

说实话，把这套系统称为"生产就绪"还为时过早。按我的标准，它是"对个人自动化来说足够稳定的水平"。在团队规模使用，需要更健壮地设计错误恢复、状态管理和审计日志。

如果需要系统性地分析代理工作流的框架，[Claude Code代理工作流5种模式](/zh/blog/zh/claude-code-agentic-workflow-patterns-5-types)是很好的参考。

## 下一篇：#2 MCP服务器集成

第1篇涵盖了在`.claude/`文件夹内完结的自动化。

第2篇更进一步——<strong>从头构建MCP服务器，将Claude Code连接到外部工具</strong>。读取Notion数据库、发送Slack消息、查询PostgreSQL——这些外部系统集成都可以通过一条斜线命令完成。

如果已经尝试过MCP服务器构建，[MCP服务器从零构建实践指南](/zh/blog/zh/mcp-server-build-practical-guide-2026)是很好的预备阅读材料。

---

*本文中的`.claude/`目录结构和Shell脚本示例均直接取自jangwook.net博客自动化系统的实际运行版本。*
