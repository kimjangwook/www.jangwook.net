---
draft: true
title: 'Claude Agent SDK 서브에이전트 오케스트레이션 실전 가이드 — 멀티 에이전트 병렬 처리 완전 정복'
description: 'claude-agent-sdk 0.2.82를 직접 설치해 AgentDefinition 구조와 서브에이전트 병렬 실행 패턴을 직접 검증했다. 오케스트레이터가 3개 서브에이전트를 동시에 스폰하고 TaskBudget으로 비용을 제어하는 전체 흐름을 Python 코드와 함께 설명한다.'
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

[Tool Use 가이드](/ko/blog/ko/claude-agent-sdk-tool-use-complete-guide-2026)를 쓰고 나서 얼마 지나지 않아 댓글이 달렸다. "단일 에이전트는 이제 알겠는데, 리뷰어·보안 스캐너·문서 작성기를 동시에 돌리려면 어떻게 해요?" 솔직히 나도 그 시점에 막 실험하던 중이었다.

`claude-agent-sdk 0.2.82`를 직접 설치해보니 답이 있었다. `AgentDefinition` 데이터클래스 하나와 `ClaudeAgentOptions.agents` 딕셔너리면 된다. 실제로 객체를 생성하고 타입 구조를 확인해봤다. API 키가 없어서 실행까지는 못 했지만, 코드 구조와 타입 시스템은 손으로 만져볼 수 있었다.

이 글은 그 탐색 결과다.

## 단일 에이전트의 벽 — 언제 서브에이전트가 필요한가

Tool Use 루프는 강력하다. 하지만 세 가지 상황에서 한계가 보인다.

**컨텍스트 오염.** PR 하나를 리뷰할 때 코드 품질, 보안 취약점, 테스트 커버리지를 단일 에이전트로 처리하면 컨텍스트 윈도우에 세 작업의 중간 결과가 섞인다. 에이전트는 이전 단계의 추론 흔적을 보면서 다음 판단을 내리기 때문에, 초기에 코드 냄새를 발견했다는 사실이 보안 분석에 미묘하게 영향을 준다.

**병렬화 불가.** 코드 리뷰에 30초, 보안 스캔에 20초, 문서 생성에 25초가 걸린다고 하자. 단일 에이전트라면 75초. 세 에이전트를 동시에 돌리면 30초. 독립적인 작업을 직렬 실행할 이유가 없다.

**역할 혼재.** "리뷰어처럼 생각했다가 보안 전문가처럼 생각하는" 에이전트보다, 처음부터 리뷰어로만 훈련된 에이전트가 리뷰를 더 잘한다. 이건 인간 팀에서도 마찬가지다.

서브에이전트 패턴은 이 세 문제를 구조로 해결한다.

## claude-agent-sdk 0.2.82 설치 — 직접 확인한 SDK 구조

```bash
pip install claude-agent-sdk
```

설치 후 확인한 버전:

```
Successfully installed claude-agent-sdk-0.2.82
```

임시 샌드박스에서 `dir(claude_agent_sdk)` 전체를 뽑아봤을 때 눈에 띈 것들:

```python
import claude_agent_sdk as sdk

# 서브에이전트 관련 주요 클래스
sdk.AgentDefinition          # 서브에이전트 설정 데이터클래스
sdk.ClaudeAgentOptions       # agents 딕셔너리를 포함한 전체 옵션
sdk.TaskBudget               # 토큰 예산 제어
sdk.SubagentStartHookInput   # 서브에이전트 시작 훅 입력
sdk.SubagentStopHookInput    # 서브에이전트 종료 훅 입력
sdk.list_subagents           # 세션의 서브에이전트 목록 조회
sdk.get_subagent_messages    # 특정 서브에이전트의 메시지 조회
```

`inspect.getsource()`로 `AgentDefinition` 소스를 직접 읽었다. 이게 실제 0.2.82의 데이터클래스다:

```python
@dataclass
class AgentDefinition:
    """Agent definition configuration."""

    description: str          # 오케스트레이터가 어떤 에이전트인지 파악할 때 쓰는 설명
    prompt: str                # 서브에이전트 시스템 프롬프트
    tools: list[str] | None = None
    disallowedTools: list[str] | None = None
    model: str | None = None   # "sonnet", "opus", "haiku", "inherit", 또는 전체 모델 ID
    skills: list[str] | None = None
    memory: Literal["user", "project", "local"] | None = None
    mcpServers: list[str | dict[str, Any]] | None = None
    initialPrompt: str | None = None
    maxTurns: int | None = None  # 이 서브에이전트의 최대 루프 수
    background: bool | None = None
    effort: EffortLevel | int | None = None
    permissionMode: PermissionMode | None = None
```

`tools` 필드의 주석에 "Deprecated: passing 'Skill' here is deprecated; use `skills` instead."라고 나와 있었다. 문서에서 보지 못한 내용이다. `skills` 필드가 별도로 있다는 걸 코드에서 처음 알았다.

## AgentDefinition으로 서브에이전트 정의하기 — 코드 리뷰 파이프라인

실제 코드를 보자. PR 자동 리뷰 파이프라인을 구축한다고 하면 세 역할이 필요하다:

```python
import asyncio
import claude_agent_sdk as sdk

# 1. 각 역할별 서브에이전트 정의
code_reviewer = sdk.AgentDefinition(
    description="Python 코드 품질 및 설계 검토 전문가",
    prompt=(
        "너는 10년 경력 Python 시니어 엔지니어야. "
        "코드 품질, 가독성, 설계 패턴을 검토하고 "
        "구체적인 개선 방향을 마크다운 형식으로 제시해."
    ),
    tools=["Read", "Grep"],
    model="sonnet",
    maxTurns=8,
)

security_scanner = sdk.AgentDefinition(
    description="보안 취약점 스캐너 — 인젝션, 시크릿 노출, 위험 연산 탐지",
    prompt=(
        "너는 시큐리티 엔지니어야. "
        "SQL 인젝션, 시크릿 하드코딩, 안전하지 않은 eval/exec, "
        "권한 문제를 찾아내고 심각도와 함께 리포트해."
    ),
    tools=["Read", "Grep", "Bash"],
    model="sonnet",
    maxTurns=6,
)

doc_writer = sdk.AgentDefinition(
    description="docstring 및 README 작성 — 코드를 읽고 명확한 문서 생성",
    prompt=(
        "너는 기술 문서 작가야. "
        "함수와 클래스의 docstring을 Google Style로 작성하고 "
        "README에 들어갈 사용 예제를 만들어."
    ),
    tools=["Read", "Write", "Edit"],
    model="haiku",   # 문서 작성은 haiku로 충분하고 비용이 낮다
    maxTurns=5,
)

# 2. 오케스트레이터 옵션 설정
opts = sdk.ClaudeAgentOptions(
    system_prompt=(
        "너는 PR 리뷰 오케스트레이터야. "
        "code-reviewer, security-scanner, doc-writer 세 에이전트를 "
        "병렬로 호출해서 종합 리뷰 리포트를 만들어."
    ),
    allowed_tools=["Agent", "Read"],  # Agent 툴이 서브에이전트 호출 수단
    agents={
        "code-reviewer": code_reviewer,
        "security-scanner": security_scanner,
        "doc-writer": doc_writer,
    },
    permission_mode="bypassPermissions",
)
```

`ClaudeAgentOptions.agents` 딕셔너리의 키가 오케스트레이터가 서브에이전트를 부를 때 쓰는 이름이다. 시스템 프롬프트에 "code-reviewer를 호출해"라고 쓰면 Claude가 `Agent` 툴로 그 에이전트를 스폰한다.

## 병렬 실행 패턴 — 세 에이전트를 동시에 돌리는 방법

SDK 문서에서 가장 중요한 문장을 뽑으면 이것이다:

> "Multiple subagents can run concurrently. When Claude identifies independent subtasks, it spawns multiple agents simultaneously using multiple Task tool calls in a single message."

오케스트레이터가 한 번의 메시지에서 여러 `Agent` 툴을 동시에 호출하면 병렬 실행된다. 프로그래머가 직접 `asyncio.gather()`를 쓸 필요가 없다. 오케스트레이터 프롬프트에 "세 에이전트를 병렬로 호출해"라고 지시하는 것으로 충분하다.

실제 쿼리 흐름:

```python
async def review_pr(pr_diff: str):
    results = []

    async for message in sdk.query(
        prompt=(
            f"다음 PR diff를 검토해줘:\n\n{pr_diff}\n\n"
            "code-reviewer, security-scanner, doc-writer를 "
            "동시에 실행해서 각자의 전문 영역을 병렬로 분석하고, "
            "모든 결과를 종합한 리뷰 리포트를 작성해."
        ),
        options=opts,
    ):
        if isinstance(message, sdk.AssistantMessage):
            for block in message.content:
                if hasattr(block, "text"):
                    results.append(block.text)
        elif isinstance(message, sdk.ResultMessage):
            print(f"총 비용: ${message.total_cost_usd:.4f}")
            print(f"실행 시간: {message.duration_ms}ms")
            break

    return "\n".join(results)
```

`sdk.query()`는 비동기 제너레이터를 반환한다. `ResultMessage`가 올 때 루프를 종료하면 된다. `total_cost_usd`와 `duration_ms`가 자동으로 들어온다.

각 서브에이전트의 컨텍스트 윈도우는 독립적이다. 문서에 명시된 내용이다:

> "A subagent's context window starts fresh, and the only channel from parent to subagent is the Agent tool's prompt string."

오케스트레이터는 서브에이전트의 중간 추론을 보지 못한다. 최종 결과만 받는다. 이게 컨텍스트 오염을 막는 핵심이다.

## TaskBudget으로 비용 폭발 막기

서브에이전트 세 개를 동시에 돌리면 비용이 세 배로 뛰는 게 아니라 이상하게 증폭될 수 있다. 각 에이전트가 "더 잘 하려고" 불필요한 툴 호출을 반복하는 경우다.

`TaskBudget`은 이 문제의 API 레벨 해결책이다:

```python
from claude_agent_sdk import TaskBudget

opts = sdk.ClaudeAgentOptions(
    # ... 위와 동일 ...
    task_budget=TaskBudget(total=50000),  # 전체 토큰 예산 5만
)
```

`inspect.getsource(sdk.TaskBudget)`으로 확인한 실제 구조:

```python
class TaskBudget(TypedDict):
    """API-side task budget in tokens.

    When set, the model is made aware of its remaining token budget so it can
    pace tool use and wrap up before the limit. Sent as
    output_config.task_budget with the task-budgets-2026-03-13 beta header.
    """

    total: int
```

`task-budgets-2026-03-13` 베타 헤더가 자동으로 붙는다. 에이전트가 남은 토큰을 인식하고 "아직 여유 있다"와 "이제 마무리해야 한다"를 스스로 판단한다. 외부에서 타임아웃을 걸거나 루프를 강제 종료하는 것보다 훨씬 자연스럽다.

`AgentDefinition.maxTurns`와 조합하면 두 단계 보호망이 생긴다:

```python
security_scanner = sdk.AgentDefinition(
    description="...",
    prompt="...",
    tools=["Read", "Grep", "Bash"],
    model="sonnet",
    maxTurns=6,  # 서브에이전트 레벨: 최대 6번 툴 호출
)

opts = sdk.ClaudeAgentOptions(
    # ...
    task_budget=TaskBudget(total=100000),  # 전체 레벨: 10만 토큰 상한
)
```

## 서브에이전트 훅 — 실행 시작과 종료를 감지하는 법

`SubagentStartHookInput`과 `SubagentStopHookInput`을 쓰면 각 서브에이전트가 언제 시작되고 끝났는지를 코드에서 감지할 수 있다.

실제 소스에서 확인한 구조:

```python
class SubagentStartHookInput(BaseHookInput):
    hook_event_name: Literal["SubagentStart"]
    agent_id: str       # 이 실행의 고유 ID
    agent_type: str     # "code-reviewer", "security-scanner" 등 AgentDefinition 키

class SubagentStopHookInput(BaseHookInput):
    hook_event_name: Literal["SubagentStop"]
    stop_hook_active: bool
    agent_id: str
    agent_transcript_path: str  # 서브에이전트 전체 대화록 경로
    agent_type: str
```

훅을 등록하면 서브에이전트 실행 로그를 수집할 수 있다:

```python
import time
from claude_agent_sdk import HookMatcher, SubagentStartHookInput, SubagentStopHookInput

agent_timings: dict[str, float] = {}

def on_agent_start(hook_input: SubagentStartHookInput) -> None:
    agent_timings[hook_input.agent_id] = time.time()
    print(f"▶ {hook_input.agent_type} 시작 (id: {hook_input.agent_id[:8]})")

def on_agent_stop(hook_input: SubagentStopHookInput) -> None:
    start = agent_timings.get(hook_input.agent_id, time.time())
    elapsed = time.time() - start
    print(f"■ {hook_input.agent_type} 완료 ({elapsed:.1f}s)")

opts = sdk.ClaudeAgentOptions(
    # ...
    hooks={
        "SubagentStart": [
            HookMatcher(hook_callback=on_agent_start)
        ],
        "SubagentStop": [
            HookMatcher(hook_callback=on_agent_stop)
        ],
    },
)
```

`agent_transcript_path`는 서브에이전트가 내부적으로 무엇을 했는지 전체 기록을 담은 파일 경로다. 프로덕션 디버깅에서 "왜 이 서브에이전트가 이상한 결과를 냈지?"를 추적할 때 쓸 수 있다.

## 세션 저장 — InMemorySessionStore로 실행 결과 보관

여러 에이전트가 분산 실행됐을 때 결과를 한곳에 모으려면 세션 스토어가 필요하다:

```python
store = sdk.InMemorySessionStore()

opts = sdk.ClaudeAgentOptions(
    # ...
    session_store=store,
    session_store_flush="immediate",  # "batched"는 성능 우선, "immediate"는 안정성 우선
)

# 실행 후 서브에이전트 목록 조회
async def get_review_details(session_id: str):
    subagents = sdk.list_subagents(session_id)  # ["agent_xxx", "agent_yyy", ...]
    for agent_id in subagents:
        messages = sdk.get_subagent_messages(
            session_id=session_id,
            agent_id=agent_id,
            limit=50
        )
        print(f"에이전트 {agent_id[:8]}: {len(messages)}개 메시지")
```

`InMemorySessionStore`는 테스트와 개발용이다. 공식 주석에 "Not suitable for production — data is lost when the process exits."라고 명시돼 있다. 프로덕션이면 Redis나 PostgreSQL 기반 커스텀 `SessionStore`를 구현해야 한다.

## 서브에이전트를 쓸 때와 쓰지 않을 때

솔직히 말하면, 서브에이전트가 항상 좋은 건 아니다.

**써야 할 때:**
- 독립적인 작업 3개 이상이 있고 각각 10초 이상 걸린다
- 작업별로 다른 도구 접근 권한이 필요하다 (보안 스캐너에게 Write 도구는 필요 없다)
- 컨텍스트 오염이 결과 품질에 영향을 준다는 걸 실험으로 확인했다

**과잉일 때:**
- 작업이 2개이고 순서가 중요하다 (선행 결과가 후행 작업의 입력)
- 전체 실행 시간이 5초 이하다 (서브에이전트 스폰 오버헤드가 더 크다)
- 단순한 질문-답변 패턴이다

[A2A + MCP 하이브리드 아키텍처를 다룬 포스트](/ko/blog/ko/a2a-mcp-hybrid-architecture-production-guide)에서도 나왔지만, 멀티에이전트 구조는 복잡성을 추가한다. 디버깅이 어렵고, 실패 지점이 늘고, 비용 예측이 어렵다. 단일 에이전트로 충분한 문제에 서브에이전트를 붙이면 코드만 복잡해진다.

개인적으로는 "세 작업이 독립적이고, 각각 Opus 기준 1만 토큰 이상 쓴다"가 서브에이전트를 도입하는 내 기준이다.

## fork_session — 특정 시점에서 에이전트 분기하기

`fork_session`은 이번 포스트에서 깊게 다루지 못했지만, 멀티에이전트 실험에서 실용적인 패턴이다.

```python
from claude_agent_sdk import fork_session

# 세션의 특정 메시지 시점에서 새 브랜치 생성
forked = fork_session(
    session_id="session-abc123",
    up_to_message_id="msg-xyz789",  # 이 메시지까지만 복사
    title="PR 리뷰 전략 B",
)
# => ForkSessionResult(session_id="session-new456", ...)
```

실제로 이게 유용한 상황은 "오케스트레이터가 세 서브에이전트를 쓰는 전략 A와 두 서브에이전트를 쓰는 전략 B를 동시에 비교하고 싶을 때"다. 포크 시점 이전의 컨텍스트를 재사용하면서 다른 에이전트 구성을 실험할 수 있다.

단, 소스코드 주석에 "Forked sessions start without undo history (file-history snapshots are not copied)."라고 되어 있다. 파일 변경 히스토리는 따라오지 않는다. 읽기 전용 분석 작업에는 문제없지만, 파일을 수정하는 서브에이전트를 포크하면 히스토리가 끊긴다는 점은 알아둬야 한다.

## 아직 아쉬운 점

API 키가 없어서 실제 실행 로그를 못 남긴 건 솔직히 아쉽다. 객체 생성과 타입 검증은 됐지만, "세 에이전트가 실제로 병렬 실행되면 콘솔에 어떻게 찍히는지"는 직접 보여주지 못했다.

`SubagentStopHookInput.agent_transcript_path`에 서브에이전트 전체 대화록이 남는다고 소스에 나와 있다. 이걸 실제로 열어서 세 에이전트가 각자 어떤 추론 과정을 거쳤는지 비교해보고 싶었다. 다음에 API 키가 있는 환경에서 실제 실행 결과와 transcript 예시를 추가할 계획이다.

## Managed Agents vs SDK 서브에이전트 — 무엇을 선택할까

[Managed Agents의 Dreaming과 Orchestration 발표](/ko/blog/ko/claude-managed-agents-dreaming-outcomes-code-with-claude-2026)를 봤다면 비슷한 기능처럼 느껴질 수 있다. 실제로 하는 일은 같다. 에이전트가 에이전트를 스폰한다. 차이는 어디서 실행되느냐다.

SDK 서브에이전트는 내 Python 프로세스 안에서 동작한다. API 키와 Claude Code 런타임만 있으면 된다. 컨트롤이 전부 내 코드에 있다. 세션 스토어를 직접 고를 수 있고, 훅으로 실행을 감시하고, 비용 예산을 코드에서 제어한다.

Managed Agents는 Anthropic 클라우드에서 실행된다. 내 서버가 없어도 된다. 대신 Managed Agents 크레딧을 쓰고 (2026년 6월 15일부터 별도 월별 크레딧 체계), Anthropic 인프라에 의존한다. 보안상 완전히 내 통제권 안에 있어야 하는 데이터라면 선택지가 좁아진다.

어느 쪽이 낫냐는 "얼마나 인프라를 직접 관리하고 싶냐"의 문제다. 빠르게 프로토타입을 만들고 싶다면 Managed Agents가 간단하다. 프로덕션에서 세션 데이터를 직접 저장하고 커스텀 모니터링을 붙이고 싶다면 SDK 방식이 맞다.

## 정리

`claude-agent-sdk 0.2.82`에서 서브에이전트 오케스트레이션의 핵심은 세 가지다:

1. **`AgentDefinition`**: 역할, 프롬프트, 도구, 모델을 서브에이전트별로 분리
2. **`ClaudeAgentOptions.agents`**: 오케스트레이터에서 서브에이전트 이름 등록
3. **`Agent` 툴 + 병렬 프롬프트**: 오케스트레이터가 한 번에 여러 서브에이전트 스폰

`TaskBudget`과 `SubagentStartHookInput`/`SubagentStopHookInput`을 조합하면 비용 제어와 실행 추적이 가능하다.

단일 에이전트로 시작하고, "작업이 독립적이고 병렬화 가능한 3개 이상이다"라는 조건을 만족할 때 서브에이전트로 전환하는 게 맞는 순서다.

---

**참고 자료:**
- [Subagents in the SDK — Claude API 공식 문서](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Building agents with the Claude Agent SDK — Anthropic 엔지니어링 블로그](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [claude-agent-sdk-python GitHub](https://github.com/anthropics/claude-agent-sdk-python)
- `claude-agent-sdk==0.2.82` PyPI 패키지 직접 설치 및 소스 검사 (2026-05-18)
