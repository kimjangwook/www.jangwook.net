---
title: "Claude Code Routines Practical Guide — How to Automate AI Tasks 24/7 with Schedules, APIs, and GitHub Events"
description: "Claude Code Routines lets you configure a prompt, repository, and connectors once, then runs autonomously on Anthropic's infrastructure. This guide covers all three trigger types—schedules, API calls, and GitHub events—with real setup steps and practical use cases from PR review automation to documentation drift detection."
pubDate: '2026-04-22'
heroImage: '../../../assets/blog/claude-code-routines-practical-guide-2026-hero.jpg'
tags:
  - ClaudeCode
  - Automation
  - AIAgents
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

Last week, a teammate mentioned that a PR had been reviewed automatically overnight. Nobody had requested a review—Claude had opened the PR during the night, left inline comments aligned with our team's coding conventions, and added a summary. That was my first real encounter with Claude Code Routines.

Anthropic released Routines as a research preview on April 14, 2026. It's still in beta, but it genuinely changes how you think about automating recurring work. In this guide, I'll walk through how Routines actually work, how to set them up, and—honestly—where they fall short. This is based on direct experience, not just reading the docs.

## What Is Claude Code Routines? — The Prompt + Repository + Connector Model

The official documentation puts it this way: "A routine is a saved Claude Code configuration: a prompt, one or more repositories, and a set of connectors, packaged once and run automatically."

In practice, there are three pieces:

**Prompt**: The instructions Claude follows on each run. The key constraint is that this prompt must be completely self-contained. "Do what we did last time" won't work—every execution starts fresh with no memory of previous runs.

**Repository**: The GitHub repository (or repositories) Claude clones and works in. It starts from the default branch. There's one important restriction: by default, Routines can only push to branches prefixed with `claude/`. This is a deliberate safety guard against accidentally modifying protected branches.

**Connectors**: External service integrations built on MCP (Model Context Protocol). Slack, Linear, Google Drive, and GitHub are currently supported. Connectors are what allow routines to read from and write to external systems—not just manipulate code.

Put these three together and you get an AI agent that runs on Anthropic's infrastructure without needing your laptop open or your own servers running.

## Prerequisites

To use Routines, you'll need:

- A Pro, Max, Team, or Enterprise plan with Claude Code enabled on the web
- A GitHub account for repository integration
- Any MCP connectors (Slack, Linear, etc.) pre-configured before creating routines

**Daily run limits by plan**:

| Plan | Daily Routine Runs |
|------|-------------------|
| Pro | 5 runs/day |
| Max | 15 runs/day |
| Team | 25 runs/day |
| Enterprise | 25 runs/day |

Honestly, the Pro plan's 5 runs/day feels tight. A team with more than 10 PRs a day will hit that ceiling quickly. For serious use, Team plan or above is the realistic starting point.

## Step 1 — Creating Your First Routine

Three methods are available.

### Web UI (Most Intuitive)

1. Navigate to `claude.ai/code/routines`
2. Click "New routine"
3. Name the routine and write the prompt
4. Select one or more GitHub repositories
5. Choose a cloud environment (controls network access, env vars, setup scripts)
6. Select trigger(s): Schedule / API / GitHub Event
7. Review connector configuration
8. Create

The **prompt** is the most critical part. Write it specifically and self-containedly:

```
You are a code reviewer for this repository.

Find PRs opened today and perform the following:
1. Verify the PR title and description follow [repository name] conventions
2. Check changed files for obvious bugs or security issues
3. Confirm test coverage is adequate (at least one test per new function)
4. Leave inline comments for specific issues and a summary comment on the PR

After completing the review, send "Review complete: [PR title]" to the Slack #code-review channel
```

Avoid vague phrases like "review appropriately" or "in team style." Routines don't ask follow-up questions.

### CLI Method

From within a Claude Code session, use the `/schedule` command:

```bash
/schedule daily PR review at 9am
```

Claude walks through the setup conversationally. Management commands afterward:

```bash
/schedule list          # View all routines
/schedule update        # Edit an existing routine
/schedule run           # Run immediately (for testing)
```

### Desktop App Method

Go to Schedule → New task → New remote task. This redirects to the web UI.

## Step 2 — Configuring Triggers

Routines support three trigger types, and a single routine can combine all three simultaneously.

### Schedule Triggers

Set a recurring cadence. Options:
- Hourly / Daily / Weekdays / Weekly
- Custom cron expressions

```
# Run daily at 9am (local timezone, auto-converted)
cron: 0 9 * * *

# Every Monday at 10am
cron: 0 10 * * 1
```

The minimum interval is one hour—no per-minute polling.

I tested a weekly schedule for documentation drift detection, running every Monday morning to scan the previous week's merged PRs and open update PRs for stale API docs. It worked reasonably well, though Claude occasionally missed cases where API changes were only reflected in code comments. More specific prompts are the fix.

### API Triggers

Each routine gets a dedicated HTTP endpoint with per-routine bearer token authentication.

```bash
# Trigger a routine via API
curl -X POST \
  https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire \
  -H "Authorization: Bearer {routine_token}" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -H "Content-Type: application/json" \
  -d '{"text": "api/users endpoint changed in this deploy. Docs verification needed."}'
```

The `text` field lets you pass run-specific context. This is particularly useful for monitoring systems that trigger routines when anomalies are detected.

For example: when a Sentry alert fires, it could trigger a routine that analyzes the stack trace, correlates it with recent commits, and opens a draft fix PR. CD pipelines can trigger smoke test routines via API after each deployment.

If you've [built an MCP server from scratch before](/en/blog/en/mcp-server-build-practical-guide-2026), you already understand how this connector ecosystem extends. Routines bring those same connectors into an automated execution environment.

### GitHub Event Triggers

This is the most powerful trigger type. Routines run automatically when PR or release events occur.

Supported events:
- PR: opened, closed, assigned, labeled, synchronized, updated
- Release: created, published, edited, deleted

Filtering options are granular—by PR author, title/body text, branch name, labels, draft status, merge status, or regex pattern.

```yaml
# GitHub event trigger config for PR review routine
trigger:
  type: github_event
  event: pull_request.opened
  filters:
    - author_not_in: ["dependabot[bot]", "renovate[bot]"]  # Exclude bots
    - base_branch: "main"
    - labels_not_contains: ["skip-review"]
```

## Step 3 — Integrating External Services with MCP Connectors

Connectors are how routines communicate with the outside world. Currently supported:

- **Slack**: Read/write channel messages
- **Linear**: Create/update issues
- **Google Drive**: Read/write documents
- **GitHub**: PR comments, issue management (included by default)

All currently connected MCP connectors are included by default when you create a routine. Remove connectors you don't need to limit the routine's access scope—this is a basic security hygiene practice.

A practical integration example:

```
[Slack + Linear issue triage routine]

Read new messages from Slack #bug-reports from the last 24 hours and:
1. Determine if it's a reproducible bug report
2. If it's a bug, create a Linear issue (severity: infer from content)
3. Reply in the Slack thread with the Linear issue link
4. For unclear cases, send a message asking for more information
```

If you're already familiar with [Claude Code's five agentic workflow patterns](/en/blog/en/claude-code-agentic-workflow-patterns-5-types), Routines map most cleanly onto the "Autonomous Agent" pattern—running on cloud infrastructure on a schedule rather than interactively.

## Four Real-World Use Cases

Here are the Routine types I've found to work well in practice.

### Case 1: Automated PR Review

The use case with the most immediate impact. Set a trigger on `pull_request.opened`, put your team's coding conventions in the prompt, and Claude starts reviewing every PR automatically.

```
[Core PR review routine prompt]

Referencing the style guide in CONTRIBUTING.md:
- Verify variable names follow camelCase or snake_case conventions
- Check for CHANGELOG.md updates when public APIs change
- Confirm OpenAPI spec additions for new endpoints

Leave specific issues as GitHub inline comments, overall summary as PR comment
Do NOT leave "LGTM" or "Request Changes" verdicts—that decision belongs to humans
```

That last line matters. Giving Claude final approval authority makes team members uncomfortable and erodes trust in the review process. Keep Routines in the "find and explain" role; let humans decide.

### Case 2: Nightly Backlog Triage

A routine that classifies newly opened issues every night.

```
Run daily at midnight:
1. Fetch all GitHub issues opened today
2. Add type tags (bug, feature-request, question, documentation)
3. Auto-assign by code area (reference CODEOWNERS file)
4. Create Linear issues with results (send summary to Slack #triage)
```

One thing I learned from running this: if CODEOWNERS isn't kept up to date, the routine assigns to the wrong people. Routines don't create good automation out of thin air—they amplify whatever quality your underlying data already has.

### Case 3: Post-Deploy Smoke Test

Trigger a routine via API at the end of your CD pipeline.

```bash
# Trigger after deploy completes
curl -X POST \
  https://api.anthropic.com/v1/claude_code/routines/{smoke_test_routine_id}/fire \
  -H "Authorization: Bearer {token}" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -d '{
    "text": "v2.3.4 deployed. Environment: production. Deploy time: 2026-04-22T14:30:00Z"
  }'
```

The routine calls key API endpoints, scans error logs, and posts a go/no-go verdict to #releases.

I covered [how to deploy MCP servers to Kubernetes in production](/en/blog/en/mcp-server-production-deployment-kubernetes-guide) previously. Adding this smoke test routine as the final step in that pipeline connects the two setups cleanly.

### Case 4: Weekly Documentation Drift Detection

Every Monday morning, scan last week's merged PRs, find where API documentation has diverged from code, and open update PRs.

This one genuinely impressed me. Manually catching the gap between code changes and documentation updates every week is unrealistic for most teams. Having a routine handle this continuously is a meaningful quality improvement. The important caveat: never auto-merge Claude's generated update PRs. Always keep a human review step.

## Honest Assessment — Limitations and Cautions

Routines are genuinely useful, but the research preview status shouldn't be dismissed.

**It's too early for production-critical paths.** The API requiring the `experimental-cc-routine-2026-04-01` header signals exactly where this feature stands. The API surface can change, with only the previous two versions maintaining compatibility. Critical automation needs more validation time.

**Audit trails are insufficient.** Tracing why Claude made a specific decision is difficult. When a routine leaves a comment or creates an issue automatically, reconstructing the full reasoning from logs is currently close to impossible. Teams operating in regulated environments or requiring strong accountability should wait.

**No approval checkpoints.** Routines run fully autonomously. Mistakes can be committed to the repository before anyone notices. The default branch push restriction (`claude/` prefix) provides some protection, but bad changes can still accumulate within those branches.

**GitHub event processing has rate limits.** During the research preview, GitHub events are subject to per-routine and per-account hourly caps. Attaching event triggers to high-volume monorepos can cause events to be dropped.

**No session continuity.** Two GitHub events mean two independent sessions. There's no way to carry context from one execution to the next.

My personal rule: I only use Routines for work where it doesn't matter if the run fails or produces an imperfect result. Tasks where mistakes are easily reversible. Tasks where failures are naturally corrected by the next execution. That's where Routines consistently deliver value.

If you've [mastered parallel Claude Code sessions with git worktrees](/en/blog/en/claude-code-parallel-sessions-git-worktree), think of Routines as extending that parallelism across time—while you're doing one thing, a routine is handling something else in a different repository.

## Conclusion — Which Teams Should Try This?

My honest position: Routines are currently best suited as an **experimental tool for teams already comfortable with AI automation**.

Start with three categories of work:

<strong>First</strong>, repetitive tasks humans need to do regularly but where the rules are clear (backlog triage, label classification).
<strong>Second</strong>, tasks where failures are naturally corrected by the next run (documentation drift detection).
<strong>Third</strong>, tasks whose outputs still go through human review before taking effect (review drafts, update PR drafts).

Anthropic's investment in Routines is clearly accelerating. Better logging, higher GitHub event throughput, and session continuity support are likely coming soon. Starting now with lower-stakes use cases lets you find the patterns that work for your team—so when the feature stabilizes, you already have validated routines ready to expand.

---

**Reference Links**:
- [Claude Code Routines Official Documentation](https://code.claude.com/docs/en/routines)
- [Introducing Routines in Claude Code (Anthropic Blog)](https://claude.com/blog/introducing-routines-in-claude-code)
