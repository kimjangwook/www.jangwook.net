---
title: 'Claude Agent SDK サブエージェント・オーケストレーション実践ガイド — マルチエージェント並列処理を完全制覇'
description: 'claude-agent-sdk 0.2.82を実際にインストールしてAgentDefinition構造とサブエージェント並列実行パターンを検証した。オーケストレーターが3つのサブエージェントを同時にスポーンし、TaskBudgetでコストを制御する全体フローをPythonコードとともに詳しく解説する。'
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

[Tool Useガイド](/ja/blog/ja/claude-agent-sdk-tool-use-complete-guide-2026)を書いてしばらく後、コメントが届いた。「単一エージェントは理解できましたが、レビュアー・セキュリティスキャナー・ドキュメントライターを同時に動かすにはどうすればいいですか?」正直、そのタイミングでちょうど実験中だった。

`claude-agent-sdk 0.2.82`を実際にインストールしてみると答えがあった。`AgentDefinition`データクラス一つと`ClaudeAgentOptions.agents`辞書で十分だ。実際にオブジェクトを作成し、型構造を確認した。APIキーがなかったので実行まではできなかったが、コードの構造と型システムは直接触って確かめられた。

この記事はその探索結果をまとめたものだ。

## 単一エージェントの限界 — サブエージェントが必要なとき

Tool Useループは強力だ。だが3つの状況で限界が見える。

**コンテキスト汚染。** PRレビューでコード品質・セキュリティ脆弱性・テストカバレッジを単一エージェントで処理すると、コンテキストウィンドウに3つの作業の中間結果が混在する。エージェントは前のステップの推論痕跡を見ながら次の判断を下すため、初期にコードの臭いを発見したという事実がセキュリティ分析に微妙な影響を与える。

**並列化不可。** コードレビューに30秒、セキュリティスキャンに20秒、ドキュメント生成に25秒かかるとしよう。単一エージェントなら75秒。3つのエージェントを同時に動かせば30秒。独立したタスクを直列実行する理由がない。

**役割混在。** 「レビュアーとして考えてからセキュリティ専門家として考える」エージェントより、最初からレビュアーとしてのみ設定されたエージェントの方がレビューをうまくこなす。人間チームでも同じことが言える。

サブエージェントパターンはこの3つの問題を構造で解決する。

## claude-agent-sdk 0.2.82 のインストール — 直接確認したSDK構造

```bash
pip install claude-agent-sdk
```

インストール後に確認したバージョン:

```
Successfully installed claude-agent-sdk-0.2.82
```

一時的なサンドボックスで`dir(claude_agent_sdk)`の全体を出力したとき、目立ったもの:

```python
import claude_agent_sdk as sdk

sdk.AgentDefinition          # サブエージェント設定データクラス
sdk.ClaudeAgentOptions       # agentsディクショナリを含む全体オプション
sdk.TaskBudget               # トークン予算制御
sdk.SubagentStartHookInput   # サブエージェント開始フック入力
sdk.SubagentStopHookInput    # サブエージェント終了フック入力
sdk.list_subagents           # セッションのサブエージェント一覧取得
sdk.get_subagent_messages    # 特定サブエージェントのメッセージ取得
```

`inspect.getsource()`で`AgentDefinition`のソースを直接読んだ。これが0.2.82の実際のデータクラスだ:

```python
@dataclass
class AgentDefinition:
    description: str          # オーケストレーターがどのエージェントか把握するための説明
    prompt: str                # サブエージェントのシステムプロンプト
    tools: list[str] | None = None
    disallowedTools: list[str] | None = None
    model: str | None = None   # "sonnet"、"opus"、"haiku"、"inherit"、またはフルモデルID
    skills: list[str] | None = None
    memory: Literal["user", "project", "local"] | None = None
    mcpServers: list[str | dict[str, Any]] | None = None
    initialPrompt: str | None = None
    maxTurns: int | None = None  # このサブエージェントの最大ループ数
    background: bool | None = None
    effort: EffortLevel | int | None = None
    permissionMode: PermissionMode | None = None
```

`tools`フィールドのコメントに「Deprecated: passing 'Skill' here is deprecated; use `skills` instead.」と書いてあった。ドキュメントでは見かけなかった情報だ。

## AgentDefinition でサブエージェントを定義する — コードレビューパイプライン

実際のコードを見よう。PR自動レビューパイプラインを構築するなら3つの役割が必要だ:

```python
import asyncio
import claude_agent_sdk as sdk

# 各役割別のサブエージェント定義
code_reviewer = sdk.AgentDefinition(
    description="Pythonコード品質・設計レビュー専門家",
    prompt=(
        "あなたは10年のキャリアを持つPythonシニアエンジニアです。"
        "コード品質、可読性、設計パターンをレビューし、"
        "マークダウン形式で具体的な改善提案を行ってください。"
    ),
    tools=["Read", "Grep"],
    model="sonnet",
    maxTurns=8,
)

security_scanner = sdk.AgentDefinition(
    description="セキュリティ脆弱性スキャナー — インジェクション、シークレット露出、危険な操作の検出",
    prompt=(
        "あなたはセキュリティエンジニアです。"
        "SQLインジェクション、シークレットのハードコーディング、"
        "安全でないeval/exec、権限の問題を見つけ出し、"
        "深刻度とともにレポートしてください。"
    ),
    tools=["Read", "Grep", "Bash"],
    model="sonnet",
    maxTurns=6,
)

doc_writer = sdk.AgentDefinition(
    description="docstringおよびREADME作成 — コードを読んで明確なドキュメントを生成",
    prompt=(
        "あなたは技術ドキュメントライターです。"
        "関数とクラスのdocstringをGoogle Styleで書き、"
        "READMEに入る使用例を作成してください。"
    ),
    tools=["Read", "Write", "Edit"],
    model="haiku",   # ドキュメント作成はhaikuで十分でコストが低い
    maxTurns=5,
)

# オーケストレーターのオプション設定
opts = sdk.ClaudeAgentOptions(
    system_prompt=(
        "あなたはPRレビューオーケストレーターです。"
        "code-reviewer、security-scanner、doc-writerの3つのエージェントを"
        "並列で呼び出し、総合レビューレポートを作成してください。"
    ),
    allowed_tools=["Agent", "Read"],  # Agentツールがサブエージェント呼び出しの手段
    agents={
        "code-reviewer": code_reviewer,
        "security-scanner": security_scanner,
        "doc-writer": doc_writer,
    },
    permission_mode="bypassPermissions",
)
```

## 並列実行パターン — 3つのエージェントを同時に動かす方法

SDKのドキュメントで最も重要な一文を挙げるとすればこれだ:

> "Multiple subagents can run concurrently. When Claude identifies independent subtasks, it spawns multiple agents simultaneously using multiple Task tool calls in a single message."

オーケストレーターが一度のメッセージで複数の`Agent`ツールを同時に呼び出すと並列実行される。プログラマーが直接`asyncio.gather()`を書く必要はない。オーケストレータープロンプトに「3つのエージェントを並列で呼び出して」と指示するだけで十分だ。

実際のクエリフロー:

```python
async def review_pr(pr_diff: str):
    results = []

    async for message in sdk.query(
        prompt=(
            f"以下のPR diffをレビューしてください:\n\n{pr_diff}\n\n"
            "code-reviewer、security-scanner、doc-writerを"
            "同時に実行して各自の専門領域を並列で分析し、"
            "すべての結果を統合したレビューレポートを作成してください。"
        ),
        options=opts,
    ):
        if isinstance(message, sdk.AssistantMessage):
            for block in message.content:
                if hasattr(block, "text"):
                    results.append(block.text)
        elif isinstance(message, sdk.ResultMessage):
            print(f"総コスト: ${message.total_cost_usd:.4f}")
            print(f"実行時間: {message.duration_ms}ms")
            break

    return "\n".join(results)
```

各サブエージェントのコンテキストウィンドウは独立している。ドキュメントに明記されている:

> "A subagent's context window starts fresh, and the only channel from parent to subagent is the Agent tool's prompt string."

オーケストレーターはサブエージェントの中間推論を見ない。最終結果だけを受け取る。これがコンテキスト汚染を防ぐ核心だ。

## TaskBudget でコスト爆発を防ぐ

サブエージェント3つを同時に動かすとコストが3倍になるだけでなく、異常に増幅されることがある。各エージェントが「もっとよくしよう」と不必要なツール呼び出しを繰り返す場合だ。

`TaskBudget`はこの問題のAPIレベルの解決策だ:

```python
opts = sdk.ClaudeAgentOptions(
    # ... 上と同じ ...
    task_budget=sdk.TaskBudget(total=50000),  # 全体トークン予算5万
)
```

`inspect.getsource(sdk.TaskBudget)`で確認した実際の構造:

```python
class TaskBudget(TypedDict):
    """API-side task budget in tokens.

    When set, the model is made aware of its remaining token budget so it can
    pace tool use and wrap up before the limit. Sent as
    output_config.task_budget with the task-budgets-2026-03-13 beta header.
    """

    total: int
```

`task-budgets-2026-03-13`ベータヘッダーが自動で付く。エージェントは残りのトークンを認識して「まだ余裕がある」と「そろそろ終わらせなければ」を自分で判断する。

`AgentDefinition.maxTurns`と組み合わせると2段階の保護網ができる:

```python
security_scanner = sdk.AgentDefinition(
    # ...
    maxTurns=6,  # サブエージェントレベル: 最大6回のツール呼び出し
)

opts = sdk.ClaudeAgentOptions(
    # ...
    task_budget=sdk.TaskBudget(total=100000),  # 全体レベル: 10万トークン上限
)
```

## サブエージェントフック — 実行開始と終了を検知する

`SubagentStartHookInput`と`SubagentStopHookInput`を使うと、各サブエージェントがいつ開始・終了したかをコードで検知できる:

```python
agent_timings: dict[str, float] = {}

def on_agent_start(hook_input: sdk.SubagentStartHookInput) -> None:
    agent_timings[hook_input.agent_id] = time.time()
    print(f"▶ {hook_input.agent_type} 開始 (id: {hook_input.agent_id[:8]})")

def on_agent_stop(hook_input: sdk.SubagentStopHookInput) -> None:
    start = agent_timings.get(hook_input.agent_id, time.time())
    elapsed = time.time() - start
    print(f"■ {hook_input.agent_type} 完了 ({elapsed:.1f}s)")
    # agent_transcript_pathにサブエージェントの全対話記録がある
```

[Anthropic Agent Skillsの実践ガイド](/ja/blog/ja/anthropic-agent-skills-practical-guide)でも触れているが、スキルとフックを組み合わせるとエージェントの動作をかなり細かく制御できる。

## サブエージェントを使うときと使わないとき

正直に言うと、サブエージェントが常に良いわけではない。

**使うべきとき:**
- 独立したタスクが3つ以上あり、それぞれ10秒以上かかる
- タスクごとに異なるツールアクセス権限が必要
- コンテキスト汚染が結果の品質に影響することを実験で確認した

**過剰になるとき:**
- タスクが2つで順序が重要（前のタスクの結果が次のタスクの入力になる）
- 全体の実行時間が5秒以下（サブエージェントのスポーンオーバーヘッドの方が大きい）
- 単純な質問-回答パターン

## まとめ

`claude-agent-sdk 0.2.82`でのサブエージェントオーケストレーションの核心は3つだ:

1. **`AgentDefinition`**: 役割・プロンプト・ツール・モデルをサブエージェントごとに分離
2. **`ClaudeAgentOptions.agents`**: オーケストレーターでサブエージェント名を登録
3. **`Agent`ツール + 並列プロンプト**: オーケストレーターが一度に複数のサブエージェントをスポーン

`TaskBudget`と`SubagentStartHookInput`/`SubagentStopHookInput`を組み合わせると、コスト制御と実行追跡が可能になる。

単一エージェントから始め、「タスクが独立していて並列化可能な3つ以上ある」という条件を満たしたときにサブエージェントに移行するのが正しい順序だ。

---

**参考資料:**
- [Subagents in the SDK — Claude API公式ドキュメント](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Building agents with the Claude Agent SDK — Anthropicエンジニアリングブログ](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- `claude-agent-sdk==0.2.82` PyPIパッケージ直接インストール・ソース検査 (2026-05-18)
