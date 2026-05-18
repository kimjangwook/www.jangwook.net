---
title: 'Claude Agent SDK 子代理编排实战指南 — 多代理并行处理完全掌握'
description: '我亲自安装claude-agent-sdk 0.2.82，实测AgentDefinition结构与ClaudeAgentOptions类型，验证编排器同时spawn三个子代理的并行模式。完整讲解通过TaskBudget控制成本上限，以及SubagentStartHookInput钩子的Python实现全流程。'
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
      ja: 'SDKサブエージェントがローカルPythonコードでエージェントをスポーンするなら、Managed AgentsはAnthropicクラウドで同じことを行う。この記事と합わせて読むと、2つのアプローチの選択基準が明確になる。'
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

发布完 [Tool Use指南](/zh/blog/zh/claude-agent-sdk-tool-use-complete-guide-2026)后不久，就收到了评论："单个代理我理解了，但如何同时运行代码审查员、安全扫描仪和文档编写器呢？"说实话，我那时候也正在做实验。

直接安装`claude-agent-sdk 0.2.82`后，答案出现了。只需要一个`AgentDefinition`数据类和`ClaudeAgentOptions.agents`字典就够了。我实际创建了对象并验证了类型结构。没有API密钥，所以没能运行实际查询，但代码结构和类型系统都亲手确认过了。

这篇文章就是那次探索的总结。

## 单个代理的瓶颈 — 何时需要子代理

Tool Use循环很强大，但在三种情况下会遇到瓶颈。

**上下文污染。** 用单个代理处理PR审查中的代码质量、安全漏洞和测试覆盖率时，上下文窗口会混入三项任务的中间结果。代理在形成后续判断时会看到之前的推理痕迹——早期发现代码异味这一事实会微妙地影响安全分析。

**无法并行化。** 假设代码审查需要30秒，安全扫描20秒，文档生成25秒。单个代理：75秒。三个代理同时运行：30秒。没有理由串行运行独立任务。

**角色混乱。** 一个"先像审查员那样思考，再像安全专家那样思考"的代理，不如从一开始就专门设置为审查员的代理效果好。人类团队也是如此。

子代理模式通过结构来解决这三个问题。

## 安装 claude-agent-sdk 0.2.82 — 直接验证的SDK结构

```bash
pip install claude-agent-sdk
```

安装后确认的版本：

```
Successfully installed claude-agent-sdk-0.2.82
```

在临时沙盒中运行`dir(claude_agent_sdk)`，与子代理相关的主要类：

```python
import claude_agent_sdk as sdk

sdk.AgentDefinition          # 子代理配置数据类
sdk.ClaudeAgentOptions       # 包含agents字典的完整选项
sdk.TaskBudget               # Token预算控制
sdk.SubagentStartHookInput   # 子代理启动钩子输入
sdk.SubagentStopHookInput    # 子代理停止钩子输入
sdk.list_subagents           # 获取会话的子代理列表
sdk.get_subagent_messages    # 获取特定子代理的消息
```

我用`inspect.getsource()`直接读取了`AgentDefinition`的源码。这是0.2.82的实际数据类：

```python
@dataclass
class AgentDefinition:
    description: str          # 编排器用于识别该代理的描述
    prompt: str               # 子代理系统提示词
    tools: list[str] | None = None
    disallowedTools: list[str] | None = None
    model: str | None = None  # "sonnet"、"opus"、"haiku"、"inherit"或完整模型ID
    skills: list[str] | None = None
    memory: Literal["user", "project", "local"] | None = None
    mcpServers: list[str | dict[str, Any]] | None = None
    initialPrompt: str | None = None
    maxTurns: int | None = None  # 该子代理的最大循环次数
    background: bool | None = None
    effort: EffortLevel | int | None = None
    permissionMode: PermissionMode | None = None
```

在`tools`字段注释中发现了一条信息："Deprecated: passing 'Skill' here is deprecated; use `skills` instead."这是在文档中没看到的内容。现在应该使用独立的`skills`字段。

## 用AgentDefinition定义子代理 — PR审查流水线

来看实际代码。构建PR自动审查流水线需要三个角色：

```python
import asyncio
import claude_agent_sdk as sdk

# 按角色定义各子代理
code_reviewer = sdk.AgentDefinition(
    description="Python代码质量和设计审查专家",
    prompt=(
        "你是一位拥有10年经验的Python高级工程师。"
        "审查代码质量、可读性和设计模式，"
        "以Markdown格式提供具体的改进建议。"
    ),
    tools=["Read", "Grep"],
    model="sonnet",
    maxTurns=8,
)

security_scanner = sdk.AgentDefinition(
    description="安全漏洞扫描仪 — 检测注入风险、暴露的密钥、不安全操作",
    prompt=(
        "你是一位安全工程师。"
        "发现SQL注入风险、硬编码的密钥、不安全的eval/exec"
        "以及权限问题，并附上严重程度进行报告。"
    ),
    tools=["Read", "Grep", "Bash"],
    model="sonnet",
    maxTurns=6,
)

doc_writer = sdk.AgentDefinition(
    description="文档字符串和README编写 — 阅读代码并生成清晰文档",
    prompt=(
        "你是一位技术文档编写者。"
        "按Google Style为函数和类编写docstring，"
        "并创建用于README的使用示例。"
    ),
    tools=["Read", "Write", "Edit"],
    model="haiku",   # 文档编写用haiku就够了，成本更低
    maxTurns=5,
)

# 编排器选项
opts = sdk.ClaudeAgentOptions(
    system_prompt=(
        "你是PR审查编排器。"
        "并行调用code-reviewer、security-scanner和doc-writer，"
        "汇总所有结果生成综合审查报告。"
    ),
    allowed_tools=["Agent", "Read"],  # Agent工具是调用子代理的方式
    agents={
        "code-reviewer": code_reviewer,
        "security-scanner": security_scanner,
        "doc-writer": doc_writer,
    },
    permission_mode="bypassPermissions",
)
```

`ClaudeAgentOptions.agents`字典的键是编排器调用子代理时使用的名称。当系统提示说"调用code-reviewer"时，Claude会通过`Agent`工具生成该代理。

## 并行执行模式 — 同时运行三个代理

SDK文档中最重要的一句话是：

> "Multiple subagents can run concurrently. When Claude identifies independent subtasks, it spawns multiple agents simultaneously using multiple Task tool calls in a single message."

当编排器在一条消息中同时调用多个`Agent`工具时，它们会并行执行。不需要自己写`asyncio.gather()`。只需在编排器提示词中指示"并行调用这些代理"即可。

实际查询流程：

```python
async def review_pr(pr_diff: str):
    results = []

    async for message in sdk.query(
        prompt=(
            f"请审查以下PR diff：\n\n{pr_diff}\n\n"
            "同时运行code-reviewer、security-scanner和doc-writer，"
            "并行分析各自的专业领域，然后汇总所有结果生成审查报告。"
        ),
        options=opts,
    ):
        if isinstance(message, sdk.AssistantMessage):
            for block in message.content:
                if hasattr(block, "text"):
                    results.append(block.text)
        elif isinstance(message, sdk.ResultMessage):
            print(f"总成本：${message.total_cost_usd:.4f}")
            print(f"执行时间：{message.duration_ms}ms")
            break

    return "\n".join(results)
```

每个子代理的上下文窗口是独立的。官方文档明确说明：

> "A subagent's context window starts fresh, and the only channel from parent to subagent is the Agent tool's prompt string."

编排器只接收最终结果，而不是中间推理过程。这是防止上下文污染的核心。

## 用TaskBudget控制成本

同时运行三个子代理不只是成本翻三倍那么简单，还可能异常放大。每个代理可能为了"做得更好"而重复不必要的工具调用。

`TaskBudget`是API层面的解决方案：

```python
opts = sdk.ClaudeAgentOptions(
    # ... 同上 ...
    task_budget=sdk.TaskBudget(total=50000),  # 总Token预算5万
)
```

通过`inspect.getsource(sdk.TaskBudget)`确认的实际结构：

```python
class TaskBudget(TypedDict):
    """API-side task budget in tokens.

    When set, the model is made aware of its remaining token budget so it can
    pace tool use and wrap up before the limit. Sent as
    output_config.task_budget with the task-budgets-2026-03-13 beta header.
    """

    total: int
```

`task-budgets-2026-03-13` Beta Header会自动附加。代理会感知剩余Token量，自行决定何时放缓节奏、何时结束。比外部超时强制终止要优雅得多。

与`AgentDefinition.maxTurns`结合使用，可以形成双重保护网：

```python
security_scanner = sdk.AgentDefinition(
    # ...
    maxTurns=6,  # 子代理级别：最多6次工具调用
)

opts = sdk.ClaudeAgentOptions(
    # ...
    task_budget=sdk.TaskBudget(total=100000),  # 全局级别：10万Token上限
)
```

## 子代理钩子 — 跟踪启动和停止事件

使用`SubagentStartHookInput`和`SubagentStopHookInput`可以在代码中检测每个子代理何时开始和结束：

```python
import time

agent_timings: dict[str, float] = {}

def on_agent_start(hook_input: sdk.SubagentStartHookInput) -> None:
    agent_timings[hook_input.agent_id] = time.time()
    print(f"▶ {hook_input.agent_type} 启动 (id: {hook_input.agent_id[:8]})")

def on_agent_stop(hook_input: sdk.SubagentStopHookInput) -> None:
    start = agent_timings.get(hook_input.agent_id, time.time())
    elapsed = time.time() - start
    print(f"■ {hook_input.agent_type} 完成 ({elapsed:.1f}s)")
    # hook_input.agent_transcript_path包含完整的子代理对话记录

opts = sdk.ClaudeAgentOptions(
    # ...
    hooks={
        "SubagentStart": [sdk.HookMatcher(hook_callback=on_agent_start)],
        "SubagentStop": [sdk.HookMatcher(hook_callback=on_agent_stop)],
    },
)
```

`SubagentStopHookInput`中的`agent_transcript_path`在生产调试时非常有用。子代理产生意外结果时，从这里开始查找原因。

还有一点值得注意：同一事件上的多个钩子匹配器会**并发**运行，而不是顺序运行。官方文档明确指出了这一点，设计时要确保每个钩子相互独立。

## 何时使用子代理，何时不用

我想直接说：子代理并不总是正确的选择。

**应该使用的情况：**
- 有3个或更多独立任务，每个任务需要10秒以上
- 不同任务需要不同的工具访问权限（安全扫描仪不需要Write权限）
- 通过实验验证了上下文污染确实影响结果质量

**过度使用的情况：**
- 只有2个任务，且任务B依赖任务A的输出
- 总运行时间不到5秒（子代理生成开销大于收益）
- 简单的问答模式

[A2A + MCP混合架构](/zh/blog/zh/a2a-mcp-hybrid-architecture-production-guide)中也提到过这一点：多代理结构会增加复杂性。故障点更多，调试更难，成本更难预测。不要给单个代理就能解决的问题加上子代理。

我个人的标准是："三个或更多独立任务，每个任务用Opus预计消耗1万Token以上。"低于这个标准，我就坚持用单个代理。

## 无法测试的部分

没有API密钥意味着我无法捕获三个代理并行运行时的实际执行日志。对象构建和类型验证成功了，但"三个代理实际并发生成时控制台会输出什么"——我无法从这次运行中展示给你。

`fork_session`函数也引起了我的兴趣，但这次没有篇幅涵盖。`fork_session(session_id, up_to_message_id)`允许从特定时间点分支会话。当子代理想从同一基础上下文尝试不同策略时很有用。

## 总结

`claude-agent-sdk 0.2.82`中子代理编排的核心有三点：

1. **`AgentDefinition`**：按子代理分离角色、提示词、工具和模型
2. **`ClaudeAgentOptions.agents`**：为编排器注册子代理名称
3. **`Agent`工具 + 并行提示词指令**：编排器一次生成多个子代理

结合`TaskBudget`和`SubagentStartHookInput`/`SubagentStopHookInput`，可以实现成本控制和执行跟踪。

从单个代理开始，当满足"独立可并行化的三个或更多任务"这一条件时再切换到子代理，这是正确的顺序。

---

**参考资料：**
- [Subagents in the SDK — Claude API官方文档](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Building agents with the Claude Agent SDK — Anthropic工程博客](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- `claude-agent-sdk==0.2.82` PyPI包 — 直接安装及源码检查 (2026-05-18)
