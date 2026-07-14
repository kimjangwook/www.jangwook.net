---
title: AutoGen 0.7.x マルチエージェント実践 — AssistantAgent·GraphFlow一から構築
description: >-
  AutoGen
  0.7.xの新APIでマルチエージェントシステムを一から実装する実践ガイド。RoundRobinGroupChat、SelectorGroupChat、GraphFlow、FunctionToolを実際にコードで動かしながら0.2.xとの違いを比較する。
pubDate: '2026-05-19'
heroImage: ../../../assets/blog/microsoft-autogen-1-0-production-agent-tutorial-hero.png
tags:
  - autogen
  - multi-agent
  - python
relatedPosts:
  - slug: sqlite-ai-swarm-build
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nist-ai-agent-security-standards
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: adl-agent-definition-language-governance
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: google-adk-vs-langgraph-agent-framework-comparison-2026
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

マルチエージェントフレームワークを初めて使おうとしたとき、AutoGen 0.2.xの例コードと0.4.xの例コードが同じGoogle検索結果に混在していてかなり混乱した。`llm_config={"model": "gpt-4"}` で設定するコードもあれば、`model_client=OpenAIChatCompletionClient(...)` 方式もある。この2つのコードが動くAutoGenバージョンはまったく異なる。

現在の最新安定版は **0.7.5** 系の `autogen-agentchat` だ。このバージョンは0.2.xとAPIが完全に変わったため、古いチュートリアルをそのまま追うと動かない。この記事はmacOSで直接インストールして実行した結果をベースに、0.7.xの新APIを一から解説する。

## AutoGen 0.7.xがなぜAPIを完全に刷新したか

0.2.xで `AssistantAgent` を作るときはこんな形だった。

```python
# 0.2.x の書き方（現在は動かないパターン）
from autogen import AssistantAgent

assistant = AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4", "api_key": "..."}
)
```

0.7.xではモデルクライアントが別オブジェクトに分離された。

```python
# 0.7.x の書き方
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(model="gpt-4o", api_key="...")
assistant = AssistantAgent(name="assistant", model_client=model_client)
```

この変更の理由は**複数モデルバックエンドのサポート**だ。0.7.xではAnthropic Claude、Azure OpenAI、Ollama（ローカルLLM）、LLaMA.cppまで同じインターフェースで切り替えられる。エージェントのコードを触らずにモデルだけ差し替えが可能だ。

## インストール（5分あれば十分）

```bash
python3 -m pip install autogen-agentchat autogen-ext
```

自分の環境（macOS、Python 3.12.8）では `autogen-agentchat-0.7.5`、`autogen-core-0.7.5`、`autogen-ext-0.7.5` が一緒にインストールされた。3つのパッケージはレイヤード構造で連動している。

- `autogen-core`: メッセージルーティング、ランタイム、基本抽象化
- `autogen-agentchat`: 使いやすい高レベルエージェント/チームAPI
- `autogen-ext`: モデルクライアント（OpenAI、Anthropic、Ollamaなど）+ CodeExecutorなど

Anthropic Claudeをバックエンドに使う場合、追加インストール不要で `autogen_ext.models.anthropic` をインポートできる。すでに `autogen-ext` の中に含まれている。

## コアビルディングブロック3つ

### 1. AssistantAgent — 最も基本的な単位

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

developer = AssistantAgent(
    name="Developer",
    model_client=model_client,
    system_message="あなたはPythonシニアエンジニアです。質問に簡潔に答えてください。",
    tools=[],           # FunctionToolのリスト（オプション）
    handoffs=[],        # Swarmで他のエージェントに渡すとき（オプション）
)
```

`AssistantAgent` は3つのことをする。LLM呼び出し、ツール実行、メッセージバッファ管理。状態を内部で持ち、チームに参加するとチームがメッセージルーティングを管理する。

### 2. FunctionTool — エージェントに実際の能力を与える方法

```python
from autogen_core.tools import FunctionTool

def get_weather(city: str) -> str:
    """都市の天気を返します。"""
    return f"{city}: 22°C、曇り"

weather_tool = FunctionTool(
    get_weather,
    name="get_weather",
    description="都市の現在の天気を取得します"
)
```

関数シグネチャのタイプヒントとdocstringが自動的にJSON Schemaに変換される。実際に実行してスキーマがどう生成されるか確認した結果がこうだ。

```
Tool Schema:
  name: get_weather
  description: 都市の現在の天気を取得します
  parameters: {
    'city': {'description': 'city', 'title': 'City', 'type': 'string'}
  }
```

正直なところ、descriptionはdocstringからそのまま引用されるので明確に書くことが重要だ。曖昧な説明はLLMがツールを誤って使う原因になる。

### 3. 終了条件 — 会話が永遠に回らないように

```python
from autogen_agentchat.conditions import (
    MaxMessageTermination,
    TextMentionTermination,
    TokenUsageTermination,
    TimeoutTermination,
)

# AND / OR の組み合わせが可能
termination = (
    MaxMessageTermination(max_messages=10) | TextMentionTermination("TERMINATE")
)
```

`|` でOR、`&` でANDを表現できる。実務では `MaxMessageTermination` を安全網として、タスク完了シグナル（`TextMentionTermination`）を基本終了条件にする組み合わせが無難だ。

## チームタイプ4種類 — どの状況に何を使うか

AutoGen 0.7.xでチームはエージェントたちがどんな順序と方法で会話するかを決める構造体だ。

![AutoGen 0.7.x 実行ログ — マルチエージェントコードレビューセッション](../../../assets/blog/microsoft-autogen-1-0-production-agent-tutorial-log.png)

### RoundRobinGroupChat

エージェントたちが順番に一度ずつ発言する。最も予測可能なパターン。

```python
from autogen_agentchat.teams import RoundRobinGroupChat

team = RoundRobinGroupChat(
    participants=[developer, reviewer],
    termination_condition=MaxMessageTermination(4),
)
result = await team.run(task="このコードをレビューしてください: def add(a, b): return a + b")
```

実際に実行した結果がこうだった。

```
[USER] Is `def add(a, b): return a + b` production-ready Python?

[DEVELOPER]
...type hintsの追加、docstring、入力バリデーションを提案...

[CODEREVIEWER]
...Union[int, float]のPython 3.9互換性... TERMINATE

[RESULT] Stop reason: Text 'TERMINATE' mentioned
[RESULT] Total messages: 3
```

Developer → Reviewer の順序が明確に守られる。

### SelectorGroupChat

次に誰が発言するかをLLMが動的に選択する。役割が明確に区分されたチームに適している。

```python
from autogen_agentchat.teams import SelectorGroupChat

team = SelectorGroupChat(
    participants=[planner, coder, tester, reviewer],
    model_client=model_client,
    termination_condition=termination,
)
```

RoundRobinより柔軟だが予測が難しい。エージェント数が3以上のときに効果が高く、2つなら素直にRoundRobinのほうがいい。

### GraphFlow — 0.7.xで最も目立つ新機能

DAG（有向非巡回グラフ）ベースのルーティングだ。条件によって次のエージェントを分岐できる。

```python
from autogen_agentchat.teams import GraphFlow, DiGraphBuilder

builder = DiGraphBuilder()
builder.add_node(planner)
builder.add_node(coder)
builder.add_node(tester)

builder.add_edge(planner, coder)
builder.add_edge(coder, tester)

graph = builder.build()
team = GraphFlow(
    participants=[planner, coder, tester],
    graph=graph,
)
```

条件付きエッジもサポートしている。testerが失敗判定を出したらcoderに戻すフィードバックループをグラフで表現できる。

正直に言うとGraphFlowのAPIはまだ少しverboseな感じがある。LangGraphの `add_conditional_edges` のような便利メソッドがなくてエッジ定義が長くなる。でもPythonエージェントフレームワークの中でグラフベースルーティングを明示的にサポートしているのはAutoGenだけだ。[AIエージェントフレームワークをLangGraph、CrewAI、Daprと比較した記事](/ja/blog/ja/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)でこの部分をより詳しく扱っている。

### Swarm

ハンドオフ（Handoff）ベースルーティング。エージェント自身が「この仕事は自分じゃなくXがやるべきだ」と判断して渡す。

```python
from autogen_agentchat.teams import Swarm
from autogen_agentchat.conditions import HandoffTermination

triage_agent = AssistantAgent(
    name="Triage",
    model_client=model_client,
    handoffs=["billing_agent", "technical_agent"],
)

team = Swarm(
    participants=[triage_agent, billing_agent, technical_agent],
    termination_condition=HandoffTermination(target="human") | MaxMessageTermination(10),
)
```

カスタマーサポートのようにリクエストの種類によって担当エージェントが変わる場合に自然だ。

## 階層型エージェント: SocietyOfMindAgent

AutoGen 0.7.xで最も興味深いと思った機能だ。エージェントチームを一つのエージェントとして別のチームにプラグインできる。

```python
from autogen_agentchat.agents import SocietyOfMindAgent

inner_team = RoundRobinGroupChat(
    participants=[developer, tester],
    termination_condition=MaxMessageTermination(6),
)

coding_unit = SocietyOfMindAgent(
    name="CodingUnit",
    team=inner_team,
    model_client=model_client,
    response_prompt="内部チームの議論を一段落で要約してください。",
)

outer_team = RoundRobinGroupChat(
    participants=[coding_unit, product_manager],
    termination_condition=MaxMessageTermination(4),
)
```

外から見ると `coding_unit` は単純なエージェントのように見えるが、内部では developer → tester ループが動いている。[Claude Agent SDKでサブエージェントをオーケストレーションする方法](/ja/blog/ja/claude-agent-sdk-subagents-orchestration-tutorial-2026)と概念は似ているが、AutoGenはチーム構造をより明示的にコードで表現する。

## 実際に使って感じた限界

**1. 状態管理がセッション単位**  
AutoGen 0.7.xのエージェントメモリは会話セッション内でしか維持されない。長期記憶（cross-session memory）は内蔵サポートがなく、外部DBや別途メモリレイヤーを自分で繋げる必要がある。

**2. デバッグがまだ不便**  
`run_stream()` でストリーミングすると各エージェントの発言は見えるが、中間ツール呼び出し結果を一目で見るのが難しい。[Langfuse셀프ホスティングガイド](/ja/blog/ja/langfuse-self-hosted-llm-tracing-setup-guide-2026)で設定方法を扱った。

**3. 非同期コードのみサポート**  
全APIが `async/await` ベースだ。同期コードで使うには `asyncio.run()` で包む必要がある。

## 完全なコード — コピーしてすぐ使える2エージェントレビューチーム

```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_ext.models.anthropic import AnthropicChatCompletionClient

async def main():
    model_client = AnthropicChatCompletionClient(
        model="claude-haiku-4-5-20251001",
    )
    
    developer = AssistantAgent(
        name="Developer",
        model_client=model_client,
        system_message="""Pythonシニアエンジニアです。
コード品質改善提案を3つ以内で簡潔に説明してください。""",
    )
    
    reviewer = AssistantAgent(
        name="Reviewer",
        model_client=model_client,
        system_message="""コードレビュアーです。
Developerの提案をレビューして追加意見を述べた後、TERMINATEをつけて会話を終了してください。""",
    )
    
    termination = (
        MaxMessageTermination(max_messages=6) |
        TextMentionTermination("TERMINATE")
    )
    
    team = RoundRobinGroupChat(
        participants=[developer, reviewer],
        termination_condition=termination,
    )
    
    async for message in team.run_stream(
        task="次のコードをレビューしてください: def add(a, b): return a + b"
    ):
        from autogen_agentchat.base import TaskResult
        if not isinstance(message, TaskResult):
            print(f"[{message.source}]\n{message.content}\n")
        else:
            print(f"終了理由: {message.stop_reason}")
    
    await model_client.close()

asyncio.run(main())
```

## APIキーなしでテストする方法: ReplayChatCompletionClient

APIコストを気にせずロジックをテストするには `ReplayChatCompletionClient` が使える。

```python
from autogen_ext.models.replay import ReplayChatCompletionClient
from autogen_core.models import CreateResult, RequestUsage

model_client = ReplayChatCompletionClient(
    [
        CreateResult(
            finish_reason="stop",
            content="タイプヒントとdocstringの追加を勧めます。",
            usage=RequestUsage(prompt_tokens=50, completion_tokens=20),
            cached=False,
        ),
        CreateResult(
            finish_reason="stop",
            content="同意します。Union型も検討してみてください。TERMINATE",
            usage=RequestUsage(prompt_tokens=70, completion_tokens=18),
            cached=False,
        ),
    ]
)
```

このクライアントは単体テストとCIパイプラインで役立つ。実際のAPIなしでチームルーティングロジックだけを検証できる。

## 0.2.xから0.7.xへの移行チェックリスト

既存の0.2.xコードがある場合は以下の手順で対処できる。

1. **パッケージ置換**: `pyautogen`/`autogen` → `autogen-agentchat autogen-ext`
2. **import パス変更**: `from autogen import AssistantAgent` → `from autogen_agentchat.agents import AssistantAgent`
3. **llm_config削除**: すべての `llm_config` ディクショナリを `model_client` オブジェクトに置き換える
4. **UserProxyAgentの役割整理**: 0.7.xで `UserProxyAgent` はコード実行を担当しない。コード実行は `CodeExecutorAgent` が担う
5. **非同期への変換**: すべての `initiate_chat()` 呼び出しを `await team.run()` または `await team.run_stream()` に置き換える
6. **終了条件の明示**: 0.2.xの `human_input_mode="NEVER"` 方式は廃止。チームに `termination_condition` を必ず明示する

## AutoGenをいつ使い、いつ使わないか

率直に言うと、**エージェント間の協調プロトコルが複雑な場合**にAutoGenが強い。チーム構成、チーム間ルーティング、階層的エージェント構造を明示的にコードで表現できる。

一方、単一エージェントにツールをたくさん付けて使うだけなら [PydanticAI](/ja/blog/ja/pydantic-ai-type-safe-agent-tutorial-2026) のほうがコードがより簡潔だ。[Python AIエージェントライブラリ比較記事](/ja/blog/ja/python-ai-agent-library-comparison-2026)で各ライブラリのポジションをまとめている。

## まとめ

AutoGen 0.7.xは0.2.x時代とはまったく異なるフレームワークだ。新APIはより明示的でタイプセーフだ。GraphFlowとSocietyOfMindは複雑なマルチエージェントワークフローを実装する際に実際に有用なツールだと思う。

まだエコシステムが安定化の途中だ。公式ドキュメントとサンプルコードがバージョンによって混在しているため、最初の参入障壁が高い。検索結果が0.2.xのサンプルか0.7.xのサンプルかをまず確認する習慣が必要だ。

---

**実験環境**: macOS、Python 3.12.8、autogen-agentchat 0.7.5 (2026-05-19)  
**パッケージ**: `pip install autogen-agentchat autogen-ext`
