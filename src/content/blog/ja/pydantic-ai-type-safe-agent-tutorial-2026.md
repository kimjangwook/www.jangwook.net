---
title: PydanticAI実践チュートリアル — FastAPI感覚で型安全なAIエージェントを作る方法
description: >-
  PydanticAI
  1.88.0を実際にインストールし、TestModel、output_type、@agent.tool、マルチプロバイダー切り替えを直接テストした結果です。result_type→output_type変更のような実際の罠とFunctionModelテスト戦略も含みます。
pubDate: '2026-04-29'
heroImage: ../../../assets/blog/pydantic-ai-type-safe-agent-tutorial-2026-hero.jpg
tags:
  - python
  - pydantic-ai
  - ai-agent
relatedPosts:
  - slug: python-ai-agent-library-comparison-2026
    score: 0.9
    reason:
      ko: Python 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into Python.
      ja: Pythonをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 Python 主题。
  - slug: google-adk-vs-langgraph-agent-framework-comparison-2026
    score: 0.85
    reason:
      ko: ai-agent를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on ai-agent experience.
      ja: ai-agentを実際に扱った経験が続く記事です。
      zh: 延续 ai-agent 的实战经验。
  - slug: fastmcp-python-mcp-server-build-guide-2026
    score: 0.8
    reason:
      ko: 같은 Python 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same Python track.
      ja: 同じPythonの流れで併せて読むと役立ちます。
      zh: 在同一 Python 脉络中可一并阅读。
faq:
  - question: "PydanticAIをAPIキーなしでテストできますか？"
    answer: "はい。TestModelは実際のAPIを呼び出さず、エージェントの構造、ツール設定、依存性注入が正しいか確認できます。CIパイプラインでAPIコストなしにエージェントロジックを検証する時に活用します。"
  - question: "v1.88.0でresult_typeを使うとなぜエラーになりますか？"
    answer: "v1.88.0でresult_typeパラメータがoutput_typeに変更されたためです。古いドキュメントのまま使うとUnknown keyword argumentsエラーが出ます。inspect.signatureで確認するとoutput_typeが正しいパラメータ名です。"
  - question: "PydanticAIでモデルプロバイダーをどう切り替えますか？"
    answer: "エージェント定義はそのままで、run_syncに渡すmodel文字列だけを変えます。anthropic:claude-sonnet-4-6、openai:gpt-4o、google-gla:gemini-2.5-flashなどに交換でき、エージェントロジックの修正は不要です。プロバイダー専用パッケージのインストールだけ注意します。"
  - question: "TestModelとFunctionModelはいつ使い分けますか？"
    answer: "TestModelはstrに'a'、intに0のような最小値を返すため構造テストには十分ですが、厳格なカスタムvalidatorがあると失敗します。validatorがある場合やツール応答をテストする時は、正確な応答を直接提供するFunctionModelを使います。"
---

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent('test', system_prompt='Pythonの専門家')
result = agent.run_sync('f-stringと.format()どっちが速いですか？', model=TestModel())
print(result.output)  # → success (no tool calls)
```

このコードがAPIキーなしで動くのを初めて見たとき、少し驚いた。FastAPIを初めて触ったときと同じ感覚だ。構造があまりにも直感的で、むしろ疑いたくなった。PydanticAIはそういうライブラリだ。

正直、最初は「Instructorにラッパーかぶせただけじゃないの？」と思っていた。実際に使ってみて考えが変わった。FastAPIのように型システムを中心に設計されたフレームワークで、AIエージェントにその哲学をそのまま持ち込んだものだ。今日は直接インストールして動かした結果をまとめる。失敗したテストも含めて。

## なぜPydanticAIなのか: 比較記事とは別の角度から

以前の[Python AIエージェントライブラリ比較](/ja/blog/ja/python-ai-agent-library-comparison-2026)でPydanticAI・Instructor・Smolagentsを扱った。あのポストが「何を選ぶか」を扱うなら、今回のポストは「PydanticAIで実際にどう作るか」だ。実装方法が目的だ。

主な違いをまとめると:

| ライブラリ | 核心的な役割 | エージェントループ | 型安全性 |
|-----------|----------|-----------------|---------|
| Instructor | LLM出力のパース | なし | 構造化出力のみ |
| PydanticAI | エージェントフレームワーク | 完全サポート | 入出力+ツール全体 |
| LangGraph | オーケストレーション | グラフベース | 弱い |
| CrewAI | マルチエージェントチーム | ロールベース | 弱い |

特に2行目が実際に使うときの違いを生む。LLMがツールを呼び出し、その結果を受け取って処理する全ループで型が維持される。ランタイムエラーが開発中のIDEエラーとして前倒しで現れる。

## インストールとPre-requisites

```bash
pip install pydantic-ai
```

今日時点(2026年4月29日)の最新バージョンは1.88.0だ。インストールは簡単。

```bash
python3 -m venv venv
source venv/bin/activate
pip install pydantic-ai
```

プロバイダー別の追加パッケージは使う時点でインストールすれば良い:

```bash
pip install pydantic-ai[anthropic]   # Claude使用時
pip install pydantic-ai[openai]       # OpenAI GPT使用時
pip install pydantic-ai[google]       # Gemini使用時
```

**Requirements**: Python 3.9以上、pydantic v2(v1は非サポート)。

## 最初のエージェント: TestModelで構造検証

エージェントを作るとき私が最初に使うパターンだ。実際のAPIを繋げる前にエージェントの構造が正しいか確認する。

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent(
    'test',
    system_prompt='あなたはPythonコードレビュアーです。簡潔に答えてください。',
)

result = agent.run_sync(
    'f-stringと.format()どっちが速いですか？',
    model=TestModel()  # APIキー不要
)

print(result.output)    # → "success (no tool calls)"
print(result.usage())   # → RunUsage(input_tokens=64, output_tokens=4, requests=1)
```

`TestModel`はAPIを呼び出さない。エージェントの構造、ツール設定、依存性注入が正しいか確認するためのテスト専用モデルだ。CIパイプラインでAPIコストなしにエージェントロジックを検証する時に活用する。

実際のClaudeを繋げるにはモデル文字列一つを変えるだけ:

```python
import os
os.environ['ANTHROPIC_API_KEY'] = 'sk-ant-...'

# 開発中: TestModel
result = agent.run_sync('コードレビューして', model=TestModel())

# 本番: 実際のClaude
result = agent.run_sync('コードレビューして', model='anthropic:claude-sonnet-4-6')
```

エージェントのコードはそのままで、モデルだけ交換する。

## 構造化出力: output_typeでPydanticモデルを返す

ここからPydanticAIの核心だ。LLMが自由テキストではなくPydanticモデルインスタンスを返すよう強制できる。

**重要 — v1.88.0 Breaking Change**: `result_type`パラメータが`output_type`に変更された。古いドキュメントやチュートリアルをそのまま使うと次のエラーが出る:

```
pydantic_ai.exceptions.UserError: Unknown keyword arguments: `result_type`
```

直接遭遇した。`inspect.signature(Agent.__init__)`で確認したら`output_type`が正しいパラメータ名だった。

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class CodeReview(BaseModel):
    severity: str = Field(description="'low', 'medium', 'high'のいずれか")
    issues: list[str] = Field(description="発見された問題のリスト")
    suggestions: list[str] = Field(description="改善提案のリスト")
    score: int = Field(ge=0, le=100, description="コード品質スコア(0-100)")

review_agent = Agent(
    'anthropic:claude-sonnet-4-6',
    output_type=CodeReview,  # ← v1.88.0: result_typeではない
    system_prompt='Pythonコードをレビューして構造化フィードバックを提供してください。',
)

result = review_agent.run_sync('''
def get_user(id):
    db = connect()
    return db.query(f"SELECT * FROM users WHERE id={id}")
''')

print(type(result.output))       # → <class '__main__.CodeReview'>
print(result.output.severity)    # → 'high'
print(result.output.score)       # → 25
print(result.output.issues[0])   # → 'SQLインジェクション脆弱性'
```

返り値がdictやstrではなくPydanticモデルインスタンスだ。`result.output.`を入力するとIDEが`severity`、`issues`などをオートコンプリートしてくれる。

自動リトライメカニズムも重要だ:

```python
review_agent = Agent(
    'anthropic:claude-sonnet-4-6',
    output_type=CodeReview,
    retries=3,       # 出力バリデーション失敗時に最大3回リトライ
    output_retries=2
)
```

3回全て失敗すると`UnexpectedModelBehavior`例外が発生する。

## @agent.toolと依存性注入: FastAPIのDepends()と同じパターン

```python
from pydantic_ai import Agent, RunContext

class AppDeps:
    def __init__(self, db_url: str, user_id: int):
        self.db_url = db_url
        self.user_id = user_id

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    deps_type=AppDeps,
    system_prompt='タスク管理エージェントです。',
)

# 非同期ツール
@agent.tool
async def get_pending_tasks(ctx: RunContext[AppDeps], limit: int = 5) -> list[dict]:
    """未完了タスクのリストを取得します"""
    return [
        {"id": f"task_{i}", "title": f"タスク {i}", "priority": "high"}
        for i in range(limit)
    ]

# 同期ツール
@agent.tool
def calculate_priority_score(
    ctx: RunContext[AppDeps],
    urgency: int,
    importance: int
) -> float:
    """タスクの優先度スコアを計算します"""
    return urgency * 0.6 + importance * 0.4

deps = AppDeps(db_url="postgresql://localhost/taskdb", user_id=42)
result = agent.run_sync("緊急タスクで最優先のものを選んで", deps=deps)
```

`@agent.tool`は関数シグネチャとdocstringを読んでLLMに渡すJSON Schemaを自動生成する。

メッセージフローは4段階で追跡できる:

```
1. ModelRequest  → system_prompt + user_prompt
2. ModelResponse → ToolCallPart(tool_name='get_pending_tasks', ...)
3. ModelRequest  → ToolReturnPart(content=[{...}])
4. ModelResponse → 最終応答
```

## TestModel vs FunctionModel: テスト戦略

サンドボックスでテストしていてTestModelの重要な制限を発見した。

TestModelは`str`フィールドに`'a'`、`int`フィールドに`0`のような最小値を返す。厳格なカスタムvalidatorがあると失敗する:

```python
from pydantic_ai.exceptions import UnexpectedModelBehavior

class UserProfile(BaseModel):
    email: str

    @field_validator('email')
    @classmethod
    def valid_email(cls, v):
        if '@' not in v:  # TestModelが'a'を返すので常に失敗
            raise ValueError('@が必要')
        return v

agent = Agent('test', output_type=UserProfile, retries=3)
try:
    result = agent.run_sync('...', model=TestModel())
except UnexpectedModelBehavior as e:
    print(f"例外: {e}")
    # → Exceeded maximum retries (3) for output validation
```

`FunctionModel`を使えば解決する:

```python
from pydantic_ai.models.function import FunctionModel
from pydantic_ai.messages import ModelMessage, ModelResponse, TextPart
from pydantic_ai.settings import ModelSettings
import json

def mock_valid_response(messages: list[ModelMessage], settings: ModelSettings) -> ModelResponse:
    data = {"email": "test@example.com", "name": "テスト"}
    return ModelResponse(parts=[TextPart(content=json.dumps(data))])

agent = Agent(FunctionModel(mock_valid_response), output_type=UserProfile)
result = agent.run_sync("...")
assert result.output.email == "test@example.com"
```

テスト戦略の整理:

```python
class TestMyAgent:
    def test_structure(self):
        """エージェント構造検証 — TestModel"""
        result = my_agent.run_sync("テスト", model=TestModel())
        assert result is not None

    def test_tool_called(self):
        """ツール呼び出し確認 — TestModel + call_tools"""
        result = my_agent.run_sync(
            "DBからデータを取得して",
            deps=test_deps,
            model=TestModel(call_tools=['query_database'])
        )
        assert 'query_database' in result.output

    def test_with_mock(self):
        """応答処理ロジック — FunctionModel"""
        def mock_fn(messages, settings):
            return ModelResponse(parts=[TextPart(content='{"email": "t@t.com"}')])

        result = my_agent.run_sync("...", model=FunctionModel(mock_fn))
        assert result.output.email == "t@t.com"
```

## マルチプロバイダー切り替え: エージェントのコードに触れずに

エージェントのコードを変えずにモデル文字列だけで別プロバイダーに切り替えられる:

```python
review_agent = Agent(
    system_prompt='シニアPython開発者としてコードをレビューします。',
    output_type=CodeReview,
)

# 実行時にモデルを指定
result_claude = review_agent.run_sync(code, model='anthropic:claude-sonnet-4-6')
result_gpt    = review_agent.run_sync(code, model='openai:gpt-4o')
result_gemini = review_agent.run_sync(code, model='google-gla:gemini-2.5-flash')
result_local  = review_agent.run_sync(code, model='ollama:llama3.3')
```

コンテキストエンジニアリングの観点から見ると、`system_prompt`と`output_type`スキーマがコンテキストの核心で、その上でモデルを交換可能にするのが良い設計だ。

## 実際に使ってみて: 率直な評価

**良かった点**:
- 型安全性が実際に差を生む。`output_type`スキーマを変更するとIDEが即座に関連エラーを捕捉する
- `@agent.tool`の自動JSON Schema生成が便利だ。ツール仕様を手動で再作成する必要がない
- TestModel + FunctionModelの組み合わせでAPIなしにエージェントロジックを完全に単体テストできる

**残念な点**:
- v1.88.0まで`result_type → output_type`のような非互換な変更が頻繁にある。ライブラリがまだ安定化段階にない。実際に`inspect.signature(Agent.__init__)`でパラメータを確認しなければならない状況が生じた
- ストリーミング構造化出力はまだベータ版だ。LLMが部分的に応答を生成している間にPydanticモデルとしてパースするのは難しく、現在の実装が安定していない
- Pydantic v2に強く結びついている。v1のレガシーコードベースならマイグレーションコストを考慮する必要がある

プロダクションAIエージェント設計原則と合わせて読むと、エージェントフレームワーク選択においてどんな基準が重要かがより明確になる。

## いつ使い、いつ避けるか

実際に動かした経験を率直にまとめる。すべてのプロジェクトに合う道具ではない。

**PydanticAIを使うべきとき**:

- 構造化出力が中心の場合。LLM応答をPydanticモデルに強制し、その上にビジネスロジックを載せるなら型安全性がそのまま利益になる。
- すでにFastAPIやPydantic v2ベースのスタックを使っている場合。`deps_type`が`Depends()`と同じメンタルモデルなので学習コストがほぼゼロだ。
- 複数のプロバイダーをA/Bテストしたり、コスト最適化でモデルを差し替える予定がある場合。エージェントのコードに触れない。
- APIコストなしにCIでエージェントロジックを単体テストしたい場合。TestModelとFunctionModelの組み合わせがここで活きる。

**避けるか保留するとき**:

- Pydantic v1のレガシーコードベース。マイグレーションコストがフレームワーク導入の利益を上回ることがある。
- ストリーミング構造化出力が製品の中核機能である場合。現在の実装はベータで安定性を保証しにくい。
- 複雑なマルチエージェントのグラフオーケストレーションが主目的の場合。その領域はLangGraph側がより成熟している。[Google ADK vs LangGraph比較](/ja/blog/ja/google-adk-vs-langgraph-agent-framework-comparison-2026)の基準が判断の助けになる。
- バージョン固定とCHANGELOG追跡を続ける余力がない場合。1.0以前なので非互換な変更が実際に発生する。

まとめると、型中心の単一・少数エージェントには現在最良の選択肢だが、大規模なグラフワークフローやv1環境では他の道具を先に検討するのが妥当だ。

## 参考資料(一次ソース)

直接確認した公式ドキュメントとリポジトリだ。バージョンが頻繁に変わるので、作業前に原文を確認することを勧める。

- [PydanticAI公式ドキュメント](https://ai.pydantic.dev) — エージェント、ツール、出力タイプの全リファレンス
- [PydanticAI Testingガイド](https://ai.pydantic.dev/testing/) — TestModel・FunctionModelの公式説明
- [pydantic/pydantic-ai (GitHub)](https://github.com/pydantic/pydantic-ai) — ソース、CHANGELOG、リリースノート
- [pydantic/pydantic (GitHub)](https://github.com/pydantic/pydantic) — 基盤となるPydantic v2ライブラリ

同じPythonスタックで続けて読むなら、[FastMCPでMCPサーバーを作る](/ja/blog/ja/fastmcp-python-mcp-server-build-guide-2026)と[FastAPI + Claude APIストリーミング本番ガイド](/ja/blog/ja/fastapi-claude-api-streaming-production-guide-2026)をおすすめする。

## 次のステップ

TypeScriptスタックならVercel AI SDKでClaudeストリーミングエージェントを作る方法がPythonと似たアプローチを提供する。

PydanticAIを実際のプロダクションに適用するなら、推奨する順番:

1. `output_type`で返却スキーマを最初に定義する
2. `deps_type`でDB接続、HTTPクライアントを依存性として管理する
3. `@agent.tool`で外部API連携を追加する
4. TestModel → FunctionModel → 実際のモデルの順で段階的にテストする
5. `retries=3`と`output_retries=2`でリトライ戦略を設定する
6. バージョンを固定する(`pydantic-ai==1.88.0`)。変更が頻繁なライブラリだ

PydanticAI GitHubリポジトリは急速に更新されている。公式ドキュメントよりCHANGELOGを先に読む習慣がプロダクティビティを向上させる。
