---
draft: true
title: 'Claude Agent SDK Subagent Orchestration Tutorial — Parallel Multi-Agent Processing in Practice'
description: 'claude-agent-sdk 0.2.82 validated: AgentDefinition structure, parallel subagent spawning, and TaskBudget cost control. Full Python code walkthrough included.'
pubDate: '2026-05-18'
heroImage: '../../../assets/blog/claude-agent-sdk-subagents-orchestration-tutorial-2026/hero.png'
tags: ['Claude', 'Anthropic SDK', 'Subagents', 'Multi-Agent', 'Python']
relatedPosts:
  - slug: 'claude-agent-sdk-tool-use-complete-guide-2026'
    score: 0.95
    reason:
      ko: 'Tool Use 가이드에서 단일 도구 호출 루프를 구현했다면, 이 글은 그 다음 단계인 서브에이전트 위임과 병렬 처리 패턴을 다룬다. 두 글을 순서대로 읽으면 단일 에이전트에서 멀티 에이전트로의 전환이 자연스럽다.'
      ja: 'Tool UseガイドでシングルツールコールループIPを実装したなら、この記事はその次のステップであるサブエージェント委任と並列処理パターンを扱う。2つの記事を順に読むと、単一エージェントからマルチエージェントへの移行が自然になる。'
      en: 'If you implemented a single tool call loop in the Tool Use guide, this article covers the next step: subagent delegation and parallel execution patterns. Reading them in order makes the transition from single to multi-agent feel natural.'
      zh: '如果在Tool Use指南中实现了单一工具调用循环，本文涵盖下一步：子代理委托和并行处理模式。按顺序阅读两篇文章，从单一代理到多代理的过渡会更加自然。'
  - slug: 'ai-agent-collaboration-patterns'
    score: 0.88
    reason:
      ko: '5개 전문 에이전트로 풀스택 앱을 구축하는 협업 패턴을 다룬 이 글은, SDK 레벨 서브에이전트 구현의 상위 개념인 "어떤 구조로 에이전트를 나눌까"에 대한 답을 준다.'
      ja: '5つの専門エージェントでフルスタックアプリを構築する協調パターンを扱うこの記事は、SDKレベルのサブエージェント実装の上位概念である「どんな構造でエージェントを分けるか」への回答を提供する。'
      en: 'This post on collaboration patterns for building a full-stack app with five specialized agents answers the higher-level question of "how to structure agent division" — the conceptual layer above SDK subagent implementation.'
      zh: '这篇关于用5个专业代理构建全栈应用协作模式的文章，回答了"如何划分代理结构"这一更高层次的问题——SDK子代理实现的概念层之上。'
  - slug: 'claude-managed-agents-dreaming-outcomes-code-with-claude-2026'
    score: 0.82
    reason:
      ko: 'SDK 서브에이전트가 로컬 Python 코드에서 에이전트를 스폰한다면, Managed Agents는 Anthropic 클라우드에서 같은 일을 한다. 두 접근법의 차이를 이 글과 함께 읽으면 선택 기준이 명확해진다.'
      ja: 'SDKサブエージェントがローカルPythonコードでエージェントをスポーンするなら、Managed AgentsはAnthropicクラウドで同じことを行う。この記事と合わせて読むと、2つのアプローチの選択基準が明確になる。'
      en: "If SDK subagents spawn agents from local Python code, Managed Agents do the same from Anthropic's cloud. Reading this alongside that article clarifies when to choose each approach."
      zh: 'SDK子代理从本地Python代码生成代理，而Managed Agents在Anthropic云端执行相同操作。与该文章一起阅读，选择标准会变得清晰。'
  - slug: 'anthropic-agent-skills-practical-guide'
    score: 0.75
    reason:
      ko: '서브에이전트에 skills를 연결하면 반복 능력을 재사용할 수 있다. AgentDefinition.skills 필드 활용법을 더 깊게 이해하고 싶다면 이 글이 도움이 된다.'
      ja: 'サブエージェントにスキルを接続すると繰り返し能力を再利用できる。AgentDefinition.skillsフィールドの活用法をより深く理解したいなら、この記事が役立つ。'
      en: 'Connecting skills to subagents lets you reuse recurring capabilities. This guide helps you understand the AgentDefinition.skills field more deeply.'
      zh: '将技能连接到子代理可以重用重复能力。如果想更深入理解AgentDefinition.skills字段的用法，这篇文章会有所帮助。'
---

After I published the [Tool Use guide](/en/blog/en/claude-agent-sdk-tool-use-complete-guide-2026), a comment came in fairly quickly: "I get single agents now, but how do I run a code reviewer, security scanner, and doc writer at the same time?" I was actually mid-experiment at that point myself.

Installing `claude-agent-sdk 0.2.82` directly, I found the answer. One `AgentDefinition` dataclass and the `ClaudeAgentOptions.agents` dict is all it takes. I created the objects and explored the type structure hands-on. No API key meant I couldn't run actual queries, but the code structure and type system were fully testable.

This post is that exploration.

## Where Single Agents Hit a Wall

The Tool Use loop is powerful. But there are three situations where it shows limits.

**Context contamination.** When a single agent handles code quality, security vulnerabilities, and test coverage in one PR review, the context window fills with intermediate results from all three tasks mixed together. The agent sees its earlier reasoning while forming later judgments — the fact that it spotted a code smell early can subtly shade the security analysis.

**No parallelism.** Code review takes 30 seconds, security scan 20 seconds, doc generation 25 seconds. Single agent: 75 seconds. Three concurrent agents: 30 seconds. There's no reason to run independent tasks serially.

**Role bleed.** An agent that "thinks like a reviewer then thinks like a security expert" does both jobs worse than dedicated specialists. This is true for human teams too.

The subagent pattern solves these three problems structurally.

## Installing claude-agent-sdk 0.2.82 — SDK Structure I Verified Directly

```bash
pip install claude-agent-sdk
```

Version confirmed after install:

```
Successfully installed claude-agent-sdk-0.2.82
```

Running `dir(claude_agent_sdk)` in a temporary sandbox, the subagent-relevant classes that stood out:

```python
import claude_agent_sdk as sdk

sdk.AgentDefinition          # Subagent configuration dataclass
sdk.ClaudeAgentOptions       # Full options including agents dict
sdk.TaskBudget               # Token budget control
sdk.SubagentStartHookInput   # Hook for subagent start events
sdk.SubagentStopHookInput    # Hook for subagent stop events
sdk.list_subagents           # List subagents in a session
sdk.get_subagent_messages    # Retrieve a specific subagent's messages
```

I read the `AgentDefinition` source directly with `inspect.getsource()`. This is the actual dataclass in 0.2.82:

```python
@dataclass
class AgentDefinition:
    description: str          # How the orchestrator identifies this agent
    prompt: str               # Subagent system prompt
    tools: list[str] | None = None
    disallowedTools: list[str] | None = None
    model: str | None = None  # "sonnet", "opus", "haiku", "inherit", or full model ID
    skills: list[str] | None = None
    memory: Literal["user", "project", "local"] | None = None
    mcpServers: list[str | dict[str, Any]] | None = None
    initialPrompt: str | None = None
    maxTurns: int | None = None  # Max loop count for this subagent
    background: bool | None = None
    effort: EffortLevel | int | None = None
    permissionMode: PermissionMode | None = None
```

One thing I noticed in the `tools` field comment: "Deprecated: passing 'Skill' here is deprecated; use `skills` instead." I hadn't seen that in the documentation. The separate `skills` field is the right place now.

## Defining Subagents with AgentDefinition — A PR Review Pipeline

Here's the actual code. A PR auto-review pipeline needs three roles:

```python
import asyncio
import claude_agent_sdk as sdk

# Define each role as a specialized subagent
code_reviewer = sdk.AgentDefinition(
    description="Python code quality and design review specialist",
    prompt=(
        "You're a Python senior engineer with 10 years of experience. "
        "Review code quality, readability, and design patterns. "
        "Provide concrete improvement suggestions in markdown format."
    ),
    tools=["Read", "Grep"],
    model="sonnet",
    maxTurns=8,
)

security_scanner = sdk.AgentDefinition(
    description="Security vulnerability scanner — injection risks, exposed secrets, unsafe operations",
    prompt=(
        "You're a security engineer. "
        "Find SQL injection risks, hardcoded secrets, unsafe eval/exec, "
        "and permission issues. Report each with severity level."
    ),
    tools=["Read", "Grep", "Bash"],
    model="sonnet",
    maxTurns=6,
)

doc_writer = sdk.AgentDefinition(
    description="Docstring and README writer — reads code and generates clear documentation",
    prompt=(
        "You're a technical writer. "
        "Write Google Style docstrings for functions and classes, "
        "and create usage examples for the README."
    ),
    tools=["Read", "Write", "Edit"],
    model="haiku",   # haiku is sufficient for docs and cheaper
    maxTurns=5,
)

# Orchestrator options
opts = sdk.ClaudeAgentOptions(
    system_prompt=(
        "You're a PR review orchestrator. "
        "Call code-reviewer, security-scanner, and doc-writer in parallel "
        "and compile a comprehensive review report from all results."
    ),
    allowed_tools=["Agent", "Read"],  # Agent tool is how subagents are invoked
    agents={
        "code-reviewer": code_reviewer,
        "security-scanner": security_scanner,
        "doc-writer": doc_writer,
    },
    permission_mode="bypassPermissions",
)
```

The dict keys in `ClaudeAgentOptions.agents` are the names the orchestrator uses when calling subagents. When the system prompt says "call code-reviewer," Claude invokes that agent via the `Agent` tool.

## Parallel Execution Pattern — Running Three Agents Simultaneously

The most important line in the SDK documentation:

> "Multiple subagents can run concurrently. When Claude identifies independent subtasks, it spawns multiple agents simultaneously using multiple Task tool calls in a single message."

When the orchestrator calls multiple `Agent` tools in a single message, they run in parallel. You don't write `asyncio.gather()` yourself. Tell the orchestrator to "call these agents in parallel" and the SDK handles it.

Actual query flow:

```python
async def review_pr(pr_diff: str):
    results = []

    async for message in sdk.query(
        prompt=(
            f"Review this PR diff:\n\n{pr_diff}\n\n"
            "Run code-reviewer, security-scanner, and doc-writer simultaneously "
            "to analyze each domain in parallel, then compile a unified review report."
        ),
        options=opts,
    ):
        if isinstance(message, sdk.AssistantMessage):
            for block in message.content:
                if hasattr(block, "text"):
                    results.append(block.text)
        elif isinstance(message, sdk.ResultMessage):
            print(f"Total cost: ${message.total_cost_usd:.4f}")
            print(f"Duration: {message.duration_ms}ms")
            break

    return "\n".join(results)
```

Each subagent's context window starts fresh. From the official docs:

> "A subagent's context window starts fresh, and the only channel from parent to subagent is the Agent tool's prompt string."

The orchestrator only sees the final result, not the intermediate reasoning. That's what prevents context contamination.

## Controlling Costs with TaskBudget

Running three subagents concurrently doesn't just triple costs — it can amplify them unpredictably. Each agent might make redundant tool calls trying to do thorough work.

`TaskBudget` is the API-level fix:

```python
opts = sdk.ClaudeAgentOptions(
    # ... same as above ...
    task_budget=sdk.TaskBudget(total=50000),  # 50K token budget
)
```

Actual class structure from `inspect.getsource(sdk.TaskBudget)`:

```python
class TaskBudget(TypedDict):
    """API-side task budget in tokens.

    When set, the model is made aware of its remaining token budget so it can
    pace tool use and wrap up before the limit. Sent as
    output_config.task_budget with the task-budgets-2026-03-13 beta header.
    """

    total: int
```

The `task-budgets-2026-03-13` beta header is attached automatically. The agent becomes aware of its remaining budget and decides internally when to pace down and wrap up. Much cleaner than an external timeout that forces mid-task termination.

Combine with `AgentDefinition.maxTurns` for a two-tier safety net:

```python
security_scanner = sdk.AgentDefinition(
    # ...
    maxTurns=6,  # Subagent level: max 6 tool calls
)

opts = sdk.ClaudeAgentOptions(
    # ...
    task_budget=sdk.TaskBudget(total=100000),  # Global level: 100K token ceiling
)
```

## Subagent Hooks — Tracking Start and Stop Events

`SubagentStartHookInput` and `SubagentStopHookInput` let you detect exactly when each subagent starts and finishes:

```python
import time

agent_timings: dict[str, float] = {}

def on_agent_start(hook_input: sdk.SubagentStartHookInput) -> None:
    agent_timings[hook_input.agent_id] = time.time()
    print(f"▶ {hook_input.agent_type} started (id: {hook_input.agent_id[:8]})")

def on_agent_stop(hook_input: sdk.SubagentStopHookInput) -> None:
    start = agent_timings.get(hook_input.agent_id, time.time())
    elapsed = time.time() - start
    print(f"■ {hook_input.agent_type} done ({elapsed:.1f}s)")
    # hook_input.agent_transcript_path has the full subagent conversation log

opts = sdk.ClaudeAgentOptions(
    # ...
    hooks={
        "SubagentStart": [sdk.HookMatcher(hook_callback=on_agent_start)],
        "SubagentStop": [sdk.HookMatcher(hook_callback=on_agent_stop)],
    },
)
```

`agent_transcript_path` from `SubagentStopHookInput` is invaluable for production debugging. If a subagent produces unexpected output, that's where you look first.

Also worth knowing: multiple hook matchers on the same event run **concurrently**, not sequentially. The docs explicitly state this. Design each hook to be independent.

## When to Use Subagents (and When Not To)

I want to be direct here: subagents aren't always the right choice.

**Use them when:**
- You have 3+ independent tasks, each taking 10+ seconds
- Different tasks need different tool access (security scanner doesn't need Write)
- You've verified that context contamination actually hurts result quality

**They're overkill when:**
- You have 2 tasks where task B depends on task A's output
- Total runtime would be under 5 seconds (spawn overhead exceeds benefit)
- It's a simple question-answer pattern

The same tradeoff comes up in the [A2A + MCP hybrid architecture post](/en/blog/en/a2a-mcp-hybrid-architecture-production-guide): multi-agent structure adds complexity. More failure points, harder debugging, less predictable costs. Don't add subagents to a problem that a single agent can handle.

My personal threshold: "three or more independent tasks, each likely to consume 10K+ tokens with Opus." Below that, I stick with a single agent.

## What I Couldn't Test

No API key meant I couldn't capture actual execution logs showing the three agents running in parallel. The object construction and type validation worked, but "what does the console output look like when three agents actually spawn concurrently" — I can't show you that from this run.

The `fork_session` function also caught my attention but didn't fit in this post. `fork_session(session_id, up_to_message_id)` lets you branch a session from a specific point. Useful when subagents want to try different strategies from the same base context without repeating earlier work.

## Summary

The core of subagent orchestration in `claude-agent-sdk 0.2.82`:

1. **`AgentDefinition`**: Separate role, prompt, tools, and model per subagent
2. **`ClaudeAgentOptions.agents`**: Register subagent names for the orchestrator to call
3. **`Agent` tool + parallel prompt instruction**: Orchestrator spawns multiple subagents at once

Add `TaskBudget` and `SubagentStartHookInput`/`SubagentStopHookInput` for cost control and execution tracking.

Start with a single agent. Move to subagents when your task fits "independent, parallelizable, three or more."

---

**References:**
- [Subagents in the SDK — Claude API official docs](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Building agents with the Claude Agent SDK — Anthropic engineering blog](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- `claude-agent-sdk==0.2.82` PyPI package — direct install and source inspection (2026-05-18)
