---
title: 'Google ADK vs LangGraph 2026: 両方を実際にインストールして比較してみた'
description: >-
  Google ADK v1.32.0とLangGraph
  v1.1.10をサンドボックスで直接インストールし、コード構造、依存パッケージ数、状態管理の実装、条件分岐のアーキテクチャ、デプロイCLIの違いを実験で比較しました。どのユースケースにどちらが適しているかを実測データで明確に解説します。
pubDate: '2026-05-04'
heroImage: ../../../assets/blog/google-adk-vs-langgraph-hero.png
tags:
  - google-adk
  - langgraph
  - ai-agent
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
  - slug: ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-source-leak-analysis
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
---

新しいAIエージェントフレームワークが登場するたびに「今回は何が本当に違うのか」を確認するのが習慣になっている。GoogleがADK（Agent Development Kit）をオープンソースとして公開したときも同じだった。今週末、サンドボックス環境を作ってGoogle ADK v1.32.0とLangGraph v1.1.10を並べてインストールし、実際にコードを動かしてみた。この記事はその結果をまとめたものだ。

![ADKとLangGraphのサンドボックス実行ログ比較](../../../assets/blog/google-adk-vs-langgraph-logs.png)

## まず、設計思想の違いを理解する

Google ADKのメッセージは「ソフトウェア開発の原則をAIエージェントに適用する」だ。実際に使ってみるとその意味がよくわかる。ADKはエージェントをPythonのクラスと関数で直接定義する。`SequentialAgent`、`ParallelAgent`、`LoopAgent`といった組み込みオーケストレーターがあり、フローをコードの中で自然に宣言できる。

```python
from google.adk.agents import Agent, SequentialAgent

weather_agent = Agent(
    name="weather_agent",
    model="gemini-2.5-flash",
    instruction="get_weatherツールを使って天気データを取得する",
    tools=[get_weather],
)

analysis_agent = Agent(
    name="analysis_agent",
    model="gemini-2.5-flash",
    instruction="天気データを分析して予報を作成する",
)

# 順次実行: weather → analysis
pipeline = SequentialAgent(
    name="weather_pipeline",
    sub_agents=[weather_agent, analysis_agent],
)
```

グラフの定義もエッジの宣言も不要。Pythonのコードがそのままフローを表現している。

LangGraphは方向性が違う。エージェントワークフローを**明示的なグラフ**としてモデル化する。ノードは処理段階を意味し、エッジはノード間の遷移を定義する。まずグラフを設計し、その上にロジックを乗せる。

```python
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import AIMessage

class State(TypedDict):
    messages: Annotated[list, add_messages]

def greet_node(state):
    return {"messages": [AIMessage(content="Hello from LangGraph!")]}

builder = StateGraph(State)
builder.add_node("greet", greet_node)
builder.add_node("analyze", analyze_node)
builder.set_entry_point("greet")
builder.add_edge("greet", "analyze")
builder.add_edge("analyze", END)

graph = builder.compile()
```

私はこの2つを「パイプラインをコードで組み立てる（ADK）」と「ステートマシンを設計する（LangGraph）」として捉えている。どちらが優れているかではなく、どちらが自分の問題に対して自然かという話だ。

## 依存パッケージ数の差が大きい

```bash
pip install google-adk langgraph
```

どちらもインストールできるが、`pip show`で依存関係を確認すると大きな差がある。

**Google ADK v1.32.0の直接依存パッケージ数: 45個**
```
google-cloud-aiplatform, google-cloud-bigquery,
google-cloud-spanner, google-cloud-speech,
google-cloud-storage, opentelemetry-exporter-gcp-*,
fastapi, uvicorn, sqlalchemy, mcp ... (計45個)
```

**LangGraph v1.1.10の直接依存パッケージ数: 6個**
```
langchain-core, langgraph-checkpoint,
langgraph-prebuilt, langgraph-sdk,
pydantic, xxhash
```

39個の差だ。ADKがこれほど重い理由は明確で、Google Cloudスタック全体（BigQuery、Spanner、Pub/Sub、Speech等）を最初から含んでいるからだ。Google Cloudを使わないプロジェクトでは、これらの依存パッケージはすべて無駄な重荷になる。

LangGraphは「必要なものだけ持ってくる」哲学だ。LLMクライアントも自分で注入し、チェックポイントのバックエンドも選択する。軽量だが設定することも多い。

## マルチエージェントパターン比較 — 条件分岐が決定的な差

**ADKの並列実行**（実際に動かしたコード）:

```python
parallel_research = ParallelAgent(
    name="parallel_research",
    sub_agents=[google_researcher, arxiv_researcher],
)

pipeline = SequentialAgent(
    name="research_pipeline",
    sub_agents=[parallel_research, synthesizer],
)
```

実行結果: `research_pipeline (SequentialAgent)` → `parallel_research (ParallelAgent)` → `synthesizer`。直感的で読みやすい。

**LangGraphの条件付きエッジ**（ADKにはない機能）:

```python
def should_retry(state: State) -> str:
    if state.get("quality_score", 0) < 80:
        return "generate"  # 品質不足 → 再生成
    return END              # 品質OK → 終了

builder.add_conditional_edges("evaluate", should_retry)
```

実際に動かした結果:
```
=== 条件付きエッジ テスト結果 ===
  [evaluate] iteration=1, score=60 → generate へルーティング
  [evaluate] iteration=2, score=80 → END へルーティング
最終スコア: 80, 実行回数: 2
```

品質がしきい値を超えるまで自動的に再試行する。ADKの`LoopAgent`も反復をサポートするが、終了条件は`max_iterations`に依存する。「この条件なら here へ、そうでなければ there へ」という動的な分岐ロジックはLangGraphの条件付きエッジが格段に強力だ。

## ADKの差別化ポイント — CLIと組み込み評価フレームワーク

ADKをインストールすると`adk` CLIも一緒に入る。これが予想以上に使える。

```
$ adk --help
Commands:
  api_server   エージェント用FastAPIサーバーを起動
  create       サンプルコード付きのアプリを作成
  deploy       ホスト環境にエージェントをデプロイ
  eval         評価セットでエージェントを評価
  eval_set     評価セットの管理
  run          エージェントのインタラクティブCLI
  web          Web UI付きのFastAPIサーバーを起動
```

`adk web`は特に便利だ。エージェントコードのパスを指定すると、FastAPIベースのWeb UIが自動的に起動してローカルでビジュアルテストができる。`adk eval`は評価セットファイルを定義すればエージェントの回帰テストを自動実行できる。LangGraphにはこのような組み込みCLIがない。

`adk deploy`はGoogle Cloud RunやVertex AI Agent Builderへの直接デプロイをサポートする。GCPを使っているチームなら開発からデプロイまで同じツールで完結できる。

ただ、このCLI群が完全にGoogleエコシステムに縛られているのが残念な点だ。AWSやAzureを使うチームには`adk deploy`は使えない。内蔵トレーシングもGCPのCloud Traceに出力するよう設計されているため、他のオブザーバビリティスタックと連携するには別途設定が必要になる。

その点では、[LangfuseによるLLMトレーシング](/ja/blog/ja/langfuse-self-hosted-llm-tracing-setup-guide-2026)のような独立したツールとより自然に組み合わせられるLangGraphの方が柔軟性は高い。

## 状態管理の比較 — セッションvsチェックポイント

**ADKの状態管理**はセッションベース:

```python
from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()
runner = InMemoryRunner(agent=root_agent, app_name="my_app")
```

ADKは`session_id`でマルチターン会話の状態を維持する。プロダクションでは`VertexAiSessionService`に切り替えて永続的な状態管理が可能だ。

**LangGraphの状態管理**はTypedDict＋チェックポイントベース:

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "user-123"}}
result = graph.invoke({"messages": [HumanMessage(content="こんにちは")]}, config)
```

LangGraphのチェックポイントシステムはより柔軟だ。`MemorySaver`からPostgreSQL、Redis、SQLiteバックエンドに切り替えられる。過去のチェックポイントへの巻き戻し（タイムトラベルデバッグ）もサポートしている。

チェックポイントバックエンドを交換できるだけで、開発環境とプロダクションを同じコードで動かせる。特定のクラウドベンダーに縛られない点でLangGraphが優位だと思う。

一方、ADKは[MCPツールサーバー](/ja/blog/ja/mcp-server-build-practical-guide-2026)との統合では優位だ。`MCPToolset`がすぐに使えるため、MCP対応ツールの利用が格段に楽だ。LangGraphでMCPを使うには別途パッケージとアダプターコードが必要になる。

## 比較表

| 項目 | Google ADK v1.32.0 | LangGraph v1.1.10 |
|------|-------------------|-------------------|
| 直接依存パッケージ数 | 45個 | 6個 |
| オーケストレーション | Sequential/Parallel/LoopAgent (コード宣言) | StateGraph＋ノード/エッジ (明示的グラフ) |
| 条件分岐 | LoopAgent max_iterations (限定的) | conditional_edges (強力) |
| 標準LLM | Gemini (他モデルも対応) | モデル非依存 (任意LLMを注入) |
| CLI | adk create/run/web/eval/deploy ✓ | なし |
| 組み込みWeb UI | adk web ✓ | なし |
| 組み込み評価フレームワーク | adk eval ✓ | なし（外部ツール必要） |
| MCPサポート | MCPToolset内蔵 ✓ | 別途パッケージ必要 |
| 状態管理 | セッションベース (VertexAIバックエンド) | TypedDict＋Checkpoint (バックエンド交換可) |
| デプロイ先 | Google Cloud Run / Vertex AI | クラウド非依存 |
| OpenTelemetry | GCPエクスポーター内蔵 | 手動設定 |
| タイムトラベルデバッグ | なし | ✓ |
| 対応言語SDK | Python, Go, Java, TypeScript | Python (主力) |
| ライセンス | Apache 2.0 | MIT |

## どんなチームにどちらが合うか

**Google ADKが向いているケース**:
- Google Cloudにすでに投資しているインフラがある
- Geminiモデルをメインで使っている
- プロトタイプからデプロイまで一つのツールチェーンで完結させたい
- エージェント評価パイプラインを別途構築したくない
- Go、Java、TypeScriptのメンバーがいる混合チーム

**LangGraphが向いているケース**:
- 複雑な分岐ロジックが必要なエージェントワークフロー
- AWSやAzure、マルチクラウド環境
- OpenAI、Anthropic、Mistralなど複数のLLMを混用する場合
- 既存のLangChainベースのコードベースがある
- タイムトラベルデバッグや特定チェックポイントの再実行が必要な開発フロー
- 依存を最小化したいエッジデプロイ

今日新規プロジェクトを始めるとしたら、私はLangGraphを選ぶと思う。理由はシンプルで、条件分岐とチェックポイントの柔軟性はプロダクション規模のエージェントでは結局必要になる機能で、それを後から追加しようとすると構造全体を設計し直す羽目になりかねない。

ただ、GCPをすでに使っているチームにとってADKのツールチェーンは本当に魅力的だ。`adk deploy`でCloud Runに上げて`adk eval`で回帰テストまで回せるのは、LangGraphエコシステムで同じことをしようとするとかなりの手間がかかる。

## 結論 — 設計思想の違いが選択を決める

2026年の時点で両フレームワークともプロダクション利用に耐えうるレベルだ。違いは何を最適化しているかだ。

ADKは「エージェントシステムを素早く作ってGCPにデプロイする」に最適化されている。LangGraphは「エージェントの状態遷移を精密に制御する」に最適化されている。

エージェントフレームワーク比較でよく見る間違いは、機能の多さで優劣をつけることだ。でも私が重要だと思うのは、「自分のエージェントの複雑さの増加方向とフレームワークの拡張方向が一致しているか」だ。

シンプルなパイプラインが複雑な分岐に進化していく予定なら最初からLangGraphを選べ。Google Cloudエコシステム内での速い納品が目標ならADKが摩擦を大幅に減らしてくれる。

ADKが登場する前のLangGraph vs CrewAI vs Daprの比較については[こちらのプロダクション比較記事](/ja/blog/ja/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)も参照してほしい。プロダクションKPIで三者を比較しており、LangGraph選択の文脈を広げてくれる。
