---
title: 'Python AIエージェントライブラリ比較2026 — Pydantic AI vs Instructor vs Smolagents 実践選択ガイド'
description: 'Pydantic AI、Instructor、Smolagentsを実際のコードを交えて比較します。構造化出力、エージェントアーキテクチャ、プロダクション準備度を基準に、どのプロジェクトに何を使うべきかの判断基準を提示します。'
pubDate: '2026-04-20'
heroImage: '../../../assets/blog/python-ai-agent-library-comparison-2026-hero.jpg'
tags:
  - python
  - pydantic-ai
  - instructor
  - smolagents
relatedPosts:
  - slug: ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production
    score: 0.92
    reason:
      ko: 이 글에서 다룬 라이브러리 레이어(Pydantic AI, Instructor)를 오케스트레이션 프레임워크 레이어(LangGraph, CrewAI)와 어떻게 조합할지 궁금하다면, 상위 프레임워크 비교 가이드가 다음 단계다.
      ja: このポストで扱ったライブラリ層をオーケストレーションフレームワーク（LangGraph、CrewAI）と組み合わせる方法を知りたければ、上位フレームワーク比較ガイドが次のステップだ。
      en: If you're wondering how to combine the library layer covered here (Pydantic AI, Instructor) with orchestration frameworks like LangGraph or CrewAI, the upper-layer comparison guide is the logical next read.
      zh: 如果想了解如何将本文介绍的库层（Pydantic AI、Instructor）与LangGraph、CrewAI等编排框架组合使用，上层框架比较指南就是下一步。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.85
    reason:
      ko: Instructor의 재시도 비용과 Smolagents의 코드 생성 루프 비용을 사전에 추정하려면 모델별 토큰 가격 데이터가 필요하다. 이 가이드가 그 계산의 출발점이다.
      ja: InstructorのリトライコストやSmolagentsのコード生成ループコストを事前に見積もるには、モデル別トークン価格データが必要だ。このガイドがその計算の出発点となる。
      en: Estimating Instructor's retry costs and Smolagents' code-generation loop overhead requires model pricing data. This guide is the starting point for that calculation.
      zh: 预估Instructor的重试成本和Smolagents的代码生成循环成本，需要各模型的token价格数据。这份指南是进行这类计算的起点。
  - slug: production-grade-ai-agent-design-principles
    score: 0.83
    reason:
      ko: 세 라이브러리 중 하나를 골랐다면, 다음은 그 위에 에이전트 시스템 전체를 어떻게 설계할지다. 프로덕션 수준의 AI 에이전트 설계 원칙이 그 답을 제시한다.
      ja: 3つのライブラリのどれかを選んだら、次はその上にエージェントシステム全体をどう設計するかだ。プロダクション品質のAIエージェント設計原則がその答えを示す。
      en: Once you've picked a library, the next question is how to design the full agent system on top of it. Production-grade AI agent design principles offers that answer.
      zh: 选定库之后，下一个问题是如何在其基础上设计完整的智能体系统。生产级AI智能体设计原则为此提供了答案。
  - slug: dena-llm-study-part2-structured-output
    score: 0.78
    reason:
      ko: Instructor와 Pydantic AI가 해결하는 "구조화 출력" 문제의 이론적 배경을 더 깊이 이해하고 싶다면, DeNA 사내 LLM 스터디 2편이 좋은 기초다.
      ja: InstructorとPydantic AIが解決する「構造化出力」問題の理論的背景を深く理解したければ、DeNA社内LLMスタディ第2弾が良い基礎となる。
      en: To understand the theoretical foundation behind the "structured output" problem that Instructor and Pydantic AI solve, the DeNA in-house LLM study part 2 is a solid foundation.
      zh: 想深入理解Instructor和Pydantic AI所解决的"结构化输出"问题的理论背景，DeNA内部LLM学习第2篇是很好的基础。
---

先月、新しいプロジェクトを始めるにあたって一つの決断を迫られた。PythonでLLMベースのエージェントを構築するのだが、どのライブラリを使うべきか？LangGraph、CrewAIといった重厚なオーケストレーションフレームワークはすでに把握していた。しかしそれより一段下のレイヤー — LLMの呼び出しを直接制御したいが、生のOpenAI SDKでは煩わしすぎる — を埋めるライブラリが2025〜2026年にかけて急成長した。

Pydantic AI、Instructor、Smolagents。3つのライブラリを実際に使った結果をまとめる。

## まずレイヤーを整理しよう — この3つは競合しない

最初に押さえておきたいのは、この3つのライブラリが異なるレイヤーを担当しているという点だ。

- **Instructor**: LLMクライアントを「パッチ」してPydanticオブジェクトで構造化出力を保証するレイヤー。エージェントループはない。
- **Pydantic AI**: ツール呼び出し、依存性注入、マルチエージェントを含む型安全なエージェントフレームワーク。Pydanticチームが開発。
- **Smolagents**: HuggingFaceのコード生成エージェントフレームワーク。JSONのツール呼び出しの代わりにPythonコードを生成して実行する。

したがって「どれが最も優れているか」ではなく「自分の状況に何が合っているか」が正しい問いだ。それを明らかにするのがこの記事の目的だ。

## Instructor — LLMクライアントを変えず、パッチせよ

### 思想

Instructorは既存のLLMクライアント（OpenAI、Anthropic、Geminiなど）を新しいSDKで置き換えない。代わりに`instructor.from_openai(client)`の1行で「パッチ」して、`response_model`パラメータを追加する。

```python
import instructor
from openai import OpenAI
from pydantic import BaseModel

client = instructor.from_openai(OpenAI())

class UserProfile(BaseModel):
    name: str
    age: int
    skills: list[str]

profile = client.chat.completions.create(
    model="gpt-4o-mini",
    response_model=UserProfile,
    messages=[{"role": "user", "content": "田中太郎、30代、PythonとGoのエンジニア"}]
)
# profileはUserProfileインスタンス。Pydantic検証済み。
print(profile.name)  # "田中太郎"
```

検証が失敗した場合、エラーメッセージと共にモデルへ自動で再リクエストする。`max_retries`パラメータで最大リトライ回数を調整できる。

### メリット

**1. 学習コストがほぼゼロ。** すでにOpenAI SDKを使っているなら`instructor.from_openai()`の1行を加えるだけだ。新しいパラダイムを習得する必要はない。

**2. マルチプロバイダーのサポートが充実。** OpenAI、Anthropic、Google Gemini、Mistral、Cohere、Ollama、DeepSeekを含む15以上のプロバイダーをサポート。プロバイダーを変えてもコード構造がほぼそのままだ。

**3. 構造化抽出の信頼性が高い。** 月間ダウンロード数300万件、GitHub スター11k+。プロダクションで検証されたライブラリだ。複雑なネストスキーマ、リスト抽出、ユニオン型もすべて処理できる。

**4. ストリーミング対応。** `Iterable[Model]`で型を指定すれば、構造化されたオブジェクトをストリーミングで受け取れる。

### 率直な限界

Instructorはエージェントフレームワークではない。繰り返しループ、ツール呼び出し、メモリ管理 — これらは存在しない。単一のLLM呼び出しで構造化データを取り出すことに特化している。エージェントループが必要なら他の選択肢を検討するべきだ。

また、検証失敗時のリトライコストは全て呼び出し元が負担する。モデルが繰り返し誤ったフォーマットを返すと、コストが想定以上に膨らむ可能性がある。複雑なネストスキーマでリトライが3〜5回発生するケースを私も実際に経験した。`max_retries`を1〜2に制限し、それでも失敗した場合のフォールバックロジックを用意するのが現実的だ。

## Pydantic AI — 型安全なエージェントを求めるなら

### 思想

Pydantic AIはPydanticチームが直接開発したエージェントフレームワークだ。Pythonの型ヒントをエージェント設計の核心に置く。ツールを型安全に定義し、依存性注入（Dependency Injection）で外部サービスをエージェントに接続する。

```python
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from pydantic import BaseModel
import httpx

# エージェントが返す型を定義
class ResearchResult(BaseModel):
    summary: str
    sources: list[str]
    confidence: float

model = OpenAIModel("gpt-4o")
agent = Agent(model, output_type=ResearchResult)

# ツールを型安全に登録
@agent.tool
async def fetch_url(ctx, url: str) -> str:
    """指定されたURLのコンテンツを取得する"""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.text[:2000]

result = await agent.run("Python 3.13の新機能を調べて")
print(result.output.confidence)  # 0.0〜1.0の範囲、検証済み
```

### 依存性注入の魅力

Pydantic AIで私が最も気に入ったのは依存性注入パターンだ。データベース接続、HTTPクライアント、APIキーなどをエージェントの初期化時に注入できるため、テストが容易になる。

```python
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext

@dataclass
class AppDeps:
    db: Database
    http_client: httpx.AsyncClient

agent = Agent(model, deps_type=AppDeps, output_type=str)

@agent.tool
async def query_user(ctx: RunContext[AppDeps], user_id: int) -> dict:
    # ctx.deps.db、ctx.deps.http_clientでアクセス
    return await ctx.deps.db.get_user(user_id)
```

テスト時に`AppDeps`にモックオブジェクトを渡せば、LLM呼び出しなしでツールのロジックを検証できる。このような構造的アプローチがプロダクションのコードベースで真価を発揮する。

### 5つの出力モード

Pydantic AIは構造化出力のために5つのモードを提供する：

| モード | 説明 | 使用タイミング |
|--------|------|--------------|
| `text` | 通常のテキスト返却 | 自由形式の回答 |
| `tool` | ツール呼び出しで構造化（デフォルト） | ほとんどの場合 |
| `native` | モデルネイティブのstructured output | OpenAI o1、GPT-4o |
| `prompted` | システムプロンプトで誘導 | ツール非対応モデル |
| `auto` | モデルの機能に応じて自動選択 | 推奨デフォルト値 |

### 率直な限界

まだv1.0ではない。急速に変化するAPIがプロダクション導入をためらわせる理由だ。0.x系バージョンということはbreaking changeがいつでも来る可能性があることを意味する。Pydanticチームの品質基準は信頼しているが、急ぐよりも安定化を見届ける方が賢明だと考える。

また、マルチエージェントシナリオはまだ制限がある。複雑なオーケストレーションが必要なら、LangGraphの上でPydantic AIを構造化出力レイヤーとしてのみ使う組み合わせの方が現実的だ。上位レイヤーについては[LangGraph vs CrewAI vs Dapr 比較ガイド](/ja/blog/ja/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)で詳しく解説しているので参考にしてほしい。

## Smolagents — LLMにコードを書かせよ

### 思想

Smolagentsは最もユニークなアプローチを取る。一般的なエージェントは「どのツールをどの引数で呼び出すか」をJSONで決定する。SmolAgentsのCodeAgentは代わりに**Pythonコードを直接生成して実行**する。

```python
from smolagents import CodeAgent, DuckDuckGoSearchTool
from smolagents.models import LiteLLMModel

model = LiteLLMModel(model_id="gpt-4o")
agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()],
    model=model
)

result = agent.run(
    "2026年のPython 3.14の主要変更点を調べてまとめて"
)
```

エージェントが実行するのは`{"tool": "search", "query": "Python 3.14"}`のようなJSONではなく：

```python
results = web_search("Python 3.14 changes 2026")
summary = "\n".join([r["snippet"] for r in results[:3]])
final_answer(summary)
```

のような実際のPythonコードだ。

### コード生成が有利な理由

HuggingFaceチームのベンチマークによれば：
- 従来のJSONツール呼び出しと比較して**LLM呼び出しを約30%削減** — 複数のツールを順次呼び出す際に毎回LLMに問い合わせず、コードで一括処理
- GAIAベンチマークでGPT-4o使用時**44.2%達成**（当時の検証セット1位）
- コードで条件分岐、ループ、エラー処理を直接表現可能

### コアの設計 — 1,000行のコード

smolagentsのコアロジックは約1,000行だ。これは意図的な設計決定だ。フレームワークを理解・修正しやすく、不要な抽象化なしに作られている。研究チームやフレームワークの内部を深く掘り下げる必要がある場合に、この点が大きな利点となる。

### 率直な限界

コード実行はセキュリティリスクを伴う。`CodeAgent`はデフォルトで`E2BSandbox`や`LocalPythonInterpreter`を使うが、プロダクションでユーザー入力がエージェントを通じてコード実行に影響を与える可能性があるなら、サンドボックス化を必ず検討しなければならない。

また、オープンソースモデルを使用する場合はコード品質が大きく変わる。GPT-4oやClaude Sonnet相当のモデルでは問題なく動くが、7B以下のモデルではコードにバグが混入するケースが多い。これがSmolagentsの最大の限界だと私は考える — モデル品質への依存度がInstructorやPydantic AIよりはるかに高い。

[プロダクション品質のAIエージェント設計原則](/ja/blog/ja/production-grade-ai-agent-design-principles)では、エージェントシステムの全体アーキテクチャを設計する観点からこれらのパターンを解説している。エージェントシステム全体を設計する際に合わせて読むことをお勧めする。

## 3つのライブラリ総合比較表

| 項目 | Instructor | Pydantic AI | Smolagents |
|------|-----------|-------------|------------|
| **核心目的** | 構造化抽出 | 型安全エージェント | コード生成エージェント |
| **エージェントループ** | ❌ | ✅ | ✅ |
| **構造化出力** | ✅ コア機能 | ✅ 出力モード5種 | ⚠️ 部分サポート |
| **マルチプロバイダー** | ✅ 15以上 | ✅ 主要プロバイダー | ✅ LiteLLM経由 |
| **型安全性** | ✅ Pydantic | ✅✅ 完全型付け | ⚠️ 限定的 |
| **コード実行** | ❌ | ❌ | ✅ コア機能 |
| **学習コスト** | 低い | 中程度 | 中程度 |
| **プロダクション準備度** | ✅ 高い | ⚠️ v0.x | ⚠️ 実験的 |
| **マルチエージェント** | ❌ | ⚠️ 基本サポート | ⚠️ 限定的 |
| **コア複雑度** | 低い | 中程度 | 低い（1,000行） |
| **月間DL数** | 300万+ | 急成長中 | 急成長中 |

## シナリオ別判断ガイド

### Instructorを選ぶべき時

- **すでにOpenAI/Anthropic SDKを使っており**、構造化出力だけが必要な場合
- エージェントループなしで単一のLLM呼び出しからPydanticオブジェクトを取り出す必要がある場合
- プロダクションの安定性が最優先の場合（300万DLの実績あり）
- チームがすでに使っているSDKの知識をそのまま活用したい場合

### Pydantic AIを選ぶべき時

- エージェントのロジックを**型安全に**設計したい場合
- 依存性注入でテスト可能なコード構造を求める場合
- チームがPydanticに慣れており、同じパラダイムでエージェントも作りたい場合

ただし、まだv1.0ではないのでbreaking changeのリスクは受け入れなければならない。私の判断では、新規プロジェクトなら試す価値がある。既存のプロダクションコードのマイグレーションはまだ時期尚早だ。

### Smolagentsを選ぶべき時

- **コード実行エージェント**が必要で、セキュリティサンドボックスを処理できる場合
- 複数のツールを順次連結する複雑なワークフローを実装する場合
- フレームワークの内部を理解しカスタマイズする必要がある場合
- オープンソースモデルをローカルで実行してエージェントの実験をする場合

重要な前提：**GPT-4oまたはClaude Sonnet以上のモデルを使用すること。** コード生成品質がエージェントのパフォーマンスを左右するためだ。

## 私の結論 — 状況に応じて3つ全部使う

率直に言うと、私はこの3つのライブラリを全て使っている。それぞれ得意なことが違うからだ。

**Instructor**は今すぐプロダクションで使っても安全だ。LLMのレスポンスから構造化データを取り出す必要がある時に毎回取り出すツールだ。

**Pydantic AI**は方向性が正しく興味深い。まだv0.xというリスクはあるが、新しいプロジェクトのエージェントレイヤーとして実験中だ。v1.0がリリースされたら本格的にメインで使う予定だ。

**Smolagents**はコード実行エージェントが必要な特定の状況で取り出す。ただし、モデルへの依存度が高く、プロダクションインフラを自前で構築するコストを考慮しなければならない。

「どれが最も優れているか」と問われれば、私の答えはこうだ。構造化抽出が必要ならInstructor、型安全なエージェントループが必要ならPydantic AI、コード実行エージェントが必要ならSmolagents。それだけだ。

[LLM APIの価格比較](/ja/blog/ja/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek)も参考になる。どのライブラリを使ってもモデルの選択によってコストは大きく変わる。特にInstructorのリトライコストやSmolagentsのコード生成ループのコストを事前に見積もる際に役立つ。
