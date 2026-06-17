---
title: 'Ollama構造化出力実践ガイド — PydanticでローカルLLMのレスポンスを型安全に受け取る方法'
description: >-
  Ollama 0.3+のJSONスキーマ強制モードとPydanticを組み合わせ、ローカルLLMのレスポンスを型安全にパースする実践ガイド。
  直接測定した結果、構造化出力は通常テキストより6倍速く、パース成功率もほぼ100%。
pubDate: '2026-06-17'
heroImage: '../../../assets/blog/ollama-structured-outputs-pydantic-local-llm-guide-2026/hero.png'
tags:
  - Ollama
  - Pydantic
  - ローカルLLM
  - Python
relatedPosts:
  - slug: ollama-fastapi-production-deployment-guide-2026
    score: 0.88
    reason:
      ko: Ollama를 프로덕션 FastAPI 서버에 붙이는 방법을 다룬다. 구조화 출력 패턴을 익힌 뒤 REST API로 노출하려면 이 글이 이어지는 실전이다.
      ja: OllamaをプロダクションのFastAPIサーバーに接続する方法を扱う。構造化出力パターンを習得した後にREST APIとして公開したいなら、この記事が実践の続きになる。
      en: Covers wiring Ollama to a production FastAPI server — the natural next step after you have structured outputs working locally.
      zh: 介绍如何将Ollama连接到生产FastAPI服务器。掌握结构化输出模式后，若要通过REST API对外暴露，这篇文章是实战的延续。
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.83
    reason:
      ko: Pydantic AI 프레임워크 자체를 에이전트 구조로 확장한 포스트다. 이 글에서 Pydantic 데이터 검증을 익혔다면 에이전트 전체를 Pydantic으로 감싸는 다음 단계다.
      ja: Pydantic AIフレームワーク自体をエージェント構造に拡張したポスト。このガイドでPydanticデータ検証を学んだら、エージェント全体をPydanticでラップする次のステップ。
      en: Shows how to extend Pydantic beyond validation into a full agent framework — a logical next step from using Pydantic to parse LLM outputs.
      zh: 展示了如何将Pydantic扩展到完整的代理框架——在用Pydantic解析LLM输出之后的自然延伸。
  - slug: local-llm-private-mcp-server-gemma4-fastmcp
    score: 0.79
    reason:
      ko: 같은 Ollama + Gemma 4 스택으로 완전 오프라인 MCP 서버를 구축한다. 구조화 출력으로 받은 데이터를 FastMCP 도구로 노출하는 다음 단계로 이어진다.
      ja: 同じOllama + Gemma 4スタックで完全オフラインのMCPサーバーを構築する。構造化出力で受け取ったデータをFastMCPツールとして公開する次の段階につながる。
      en: Builds a fully offline MCP server on the same Ollama and Gemma 4 stack — a natural next step for exposing your structured outputs as FastMCP tools.
      zh: 用同样的Ollama + Gemma 4技术栈构建完全离线的MCP服务器。可作为将结构化输出数据通过FastMCP工具对外暴露的下一步。
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.74
    reason:
      ko: Claude API에서 Tool Use를 구현하는 패턴과 이 글의 에이전트 도구 디스패치 패턴을 비교하면, 클라우드 LLM과 로컬 LLM의 설계 차이가 보인다.
      ja: Claude APIでのTool Use実装パターンと本記事のエージェントツールディスパッチパターンを比較すると、クラウドLLMとローカルLLMの設計の違いが見えてくる。
      en: Comparing Claude's Tool Use implementation with this post's local tool dispatch patterns reveals key design differences between cloud and local LLM agent architectures.
      zh: 将Claude API的Tool Use实现模式与本文的本地工具分发模式进行比较，可以看出云端LLM和本地LLM的架构设计差异。
faq:
  - question: "Ollamaのformatパラメーターはどのバージョンから使えますか？"
    answer: "JSONスキーマを受け取るformatパラメーターはOllama 0.3.0以上で動作します。本記事の例は0.30.7でテストしており、ollama --versionで導入済みのバージョンを確認できます。"
  - question: "構造化出力は通常のテキスト生成より本当に速いのですか？"
    answer: "直接測定した結果、同一プロンプトでformatなしが31.84秒、format適用時が4.99秒と約6.4倍速くなりました。constrained decodingがフォーマット用の不要なトークン生成を防ぐためです。"
  - question: "PydanticモデルをJSONスキーマに変換するにはどうしますか？"
    answer: "Pydantic BaseModelのmodel_json_schema()メソッドがスキーマのdictを自動生成します。これをOllamaのformatに渡し、レスポンスはmodel_validate_json()でパースと検証を一度に処理します。"
  - question: "小型ローカルモデルで複雑なネストスキーマがうまくいかないのはなぜですか？"
    answer: "Gemma4:e4bのような4B級の量子化モデルでは、3段階以上のネストスキーマで中間レベルが空配列になることがあります。構造を平坦に保つか、gemma4:12b-it-qatのような大きいモデルを使うと改善します。"
---

`json.loads(response)` が失敗する瞬間がある。プロンプトに「JSONだけ返して」と書いたのに、モデルが ` ```json ` マークダウンコードフェンスを付けてきた。簡単な正規表現で除去できるが、その正規表現がまたエッジケースを生み、そのエッジケースがproductionで爆発する。

Ollama 0.3.0から `format` パラメーターにJSONスキーマを渡すと、この問題が根本的に消える。モデルの推論自体がスキーマを強制するため、コードフェンスも、日本語の説明も、途中の思考の痕跡も出てこない。パース可能なJSONだけが返ってくる。

今日はローカルでGemma4とOllama 0.30.7を使って直接検証した。

## なぜLLMのレスポンスパースが難しいのか

クラウドLLM APIなしにOllamaでローカル実行するとき、最もよく遭遇する問題がJSONパースだ。理由は二つある。

一つ目は、テキスト生成モデルの基本的な性向だ。モデルは「自然なテキスト」を生成するように訓練されている。JSONだけ要求しても ` ```json ... ``` ` コードブロックで囲んだり、「もちろんです！こちらがご要望のJSONです。」のような前置き文を付けたりするケースが頻繁にある。以下は実際に再現した結果だ。

```
入力: 'Pythonの初心者向けのヒント3つをtips(配列)、difficulty(1-5)キーのJSONで返して'
モデル出力 (formatなし):
```json
{
  "tips": [
    "Master the fundamentals first...",
    ...
  ]
}
```
JSONパース: 失敗
```

Pythonの `json.loads()` はマークダウンラッパーを処理できない。結果として「JSONだけ」という指示はproductionで100%信頼するのが難しい。

二つ目は速度問題だ。直接測定した結果、同じクエリでフォーマット説明をモデルが自分で生成するケースでは32秒かかった。構造化出力モードでは5秒だった。なぜこの差が出るのかは後で説明する。

## Ollama formatパラメーターの仕組み

Ollamaの `/api/generate` エンドポイントには `format` フィールドがある。JSONスキーマオブジェクトを渡すと、Ollamaがモデル推論過程で **constrained decoding（制約付きデコーディング）** を適用する。

```python
import json
import urllib.request

def ollama_structured(prompt, schema, model="gemma4:e4b"):
    payload = {
        "model": model,
        "prompt": prompt,
        "format": schema,     # ← JSONスキーマオブジェクトを直接渡す
        "stream": False,
        "options": {"temperature": 0}
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        "http://localhost:11434/api/generate",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read())
    return result["response"]
```

constrained decodingは各トークン生成時点でスキーマを満たさないトークンの確率を0にする。つまり、モデルがマークダウンコードフェンスを「好んで」生成しようとしても、スキーマが許可しなければ物理的に生成できない。これが速度差の原因でもある。フォーマットについての「考え」が不要なのでトークンの無駄がない。

実際に確認するとすぐ差がわかる。

```bash
# 直接測定結果 (Ollama 0.30.7, Gemma4:e4b, MacBook)
# 同一プロンプト、formatあり vs なし

Without structured output:
  Raw (first 200 chars): ```json\n{\n  "tips": ["Master the fundamentals first...
  Time: 31.84s
  JSONパース: 失敗 (マークダウンラッパーのため)

With structured output:
  Structured: {"tips": ["Understand the concept of indentation...", ...], "difficulty": 2}
  Time: 4.99s
  JSONパース: 成功
```

6.4倍の差だ。ローカルLLMはもともと遅い傾向があるので、ここでさらに遅くなると体感が大きい。

## Pydanticモデルとの連携

直接JSONスキーマオブジェクトを書くのは手間がかかる。Pydanticモデルを使えば `model_json_schema()` メソッドでスキーマを自動生成できる。

```python
from pydantic import BaseModel
from typing import List, Dict, Any, Literal

class CodeReview(BaseModel):
    severity: str  # "critical", "warning", "info"
    file: str
    line: int
    message: str
    suggestion: str

class ReviewResult(BaseModel):
    total_issues: int
    critical_count: int
    reviews: List[CodeReview]

# Pydantic → JSONスキーマ自動変換
schema = ReviewResult.model_json_schema()

# Ollama呼び出し
raw = ollama_structured(prompt, schema)

# Pydantic検証（型エラー時はValidationErrorを投げる）
result = ReviewResult.model_validate_json(raw)
```

`model_validate_json` は文字列JSONをパースしながら同時にPydantic検証を行う。`severity` に整数が入ったり、`line` に文字列が入ったりすると `ValidationError` を投げる。これをcatchして再試行ロジックを追加するのが実際のエージェントでよく使うパターンだ。

実際の実行結果はこうなった。

```bash
# セキュリティ脆弱性があるPythonコードをレビュー要求したとき

=== Code Review Output ===
Total issues: 3
Critical: 2
  [CRITICAL] process_user_data:2 - SQL Injection Vulnerability (Direct String Formatting)
  [CRITICAL] process_user_data:3 - Storing Passwords in Plain Text (Data Leakage)
  [HIGH] process_user_data:4 - Potential Unused/Incomplete Database Interaction
```

`total_issues: 3`、`critical_count: 2` が整数として直接入ってくる。Pythonコードで `result.critical_count > 0` の条件分岐が安全に動作する。

## 実践パターン: エージェントのツールディスパッチ

構造化出力が最も強力に活きるのがエージェントの次ツール選択だ。LLMにツールリストと現在の状況を渡し、「どのツールを呼ぶか」を型安全に受け取るパターンだ。

```python
from typing import Literal, Dict, Any

class ToolCall(BaseModel):
    tool_name: Literal["web_search", "read_file", "write_file", "execute_code"]
    parameters: Dict[str, Any]
    reasoning: str

schema = ToolCall.model_json_schema()

user_task = "Find the current Bitcoin price and save it to btc_price.txt"
prompt = f"""You are an AI agent. Decide which tool to call next.
Available tools: web_search, read_file, write_file, execute_code
Task: {user_task}
Choose ONE tool call."""

raw = ollama_structured(prompt, schema)
tool_call = ToolCall.model_validate_json(raw)

print(f"Tool: {tool_call.tool_name}")
print(f"Params: {tool_call.parameters}")
```

```bash
# 実行結果

=== Agent tool dispatch ===
Tool: web_search
Params: {'query': 'current Bitcoin price'}
Reasoning: The task requires finding real-time information...

Dispatch: OK (type-safe)
```

`Literal["web_search", "read_file", ...]` で宣言しているため、`tool_call.tool_name` は必ずその4つの値のどれかだ。存在しないツールをモデルが作り出しても、Pydanticが `ValidationError` を投げる。`if tool_call.tool_name == "web_search"` の分岐が安全に動作する理由はここにある。

このパターンはCloud APIでfunction callingを使うのと根本的に同じだ。ローカルでは[Claude Agent SDKのTool Useパターン](/ja/blog/ja/claude-agent-sdk-tool-use-complete-guide-2026)と比較すると、クラウドLLMとローカルLLMの設計上の違いが興味深い。

## Gemma4とスキーマ複雑度: 見つけた限界

正直に言うと、すべてのケースで完璧なわけではない。Gemma4:e4b（4ビット量子化4Bパラメーター）で実験した結果、いくつかの制約があった。

**ネストしたスキーマの限界。** 3段階以上ネストしたJSONスキーマ（例: `List[Dict[str, List[BaseModel]]]`）では、中間レベルが空の配列で返ってくることがあった。12Bパラメーターモデル（`gemma4:12b-it-qat`）ではこの現象が減ったが消えはしなかった。モデルのコンテキスト処理能力自体の限界だ。

**オプショナルフィールドの扱い。** `Optional[str]` と宣言されたフィールドをモデルが `null` の代わりに空文字列 `""` で埋めることがある。Pydantic検証は通るが意味上の差が生じる。`@validator` での後処理が必要だ。

**スキーマサイズ。** 大きなPydanticモデルのJSONスキーマは数百トークンに達する。これ自体がコンテキストを占有するので、実際のプロンプトに使えるスペースが減る。複雑なスキーマほど強力なモデルが必要になる。

[OllamaをFastAPI本番環境で使う方法](/ja/blog/ja/ollama-fastapi-production-deployment-guide-2026)で扱った通りOllamaをAPIサーバーとして配備した後にこのパターンを使う場合、スキーマ複雑度によってモデルをランタイムで切り替えることも検討できる。

## パターン整理: いつ何を使うか

| 状況 | 推奨方法 | 理由 |
|------|----------|------|
| 単純なデータ抽出（1〜2レベル） | `format` + `json.loads()` | オーバーヘッドなしで高速 |
| 型検証が必要 | `format` + Pydantic | ValidationErrorで早期発見 |
| エージェントのツール選択 | `format` + Pydantic `Literal` | 不正なツール名を遮断 |
| 複雑なネストスキーマ | 大型モデル検討 | 小型ローカルモデルの限界 |
| 単純なテキスト応答 | `format`なし | 不要なconstrained decodingオーバーヘッド回避 |

私はこのパターンを「JSONパース信頼度を0から100に上げるスイッチ」と見ている。以前はプロンプトの末尾に「JSON only please」と書いていた時期があったが、それがいかに不安定なアプローチだったか、直接測定してみて明らかになった。

## 全体コード: コピペで使えるスターター

```python
import json
import urllib.request
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

def ollama_structured(prompt: str, model_cls: type[BaseModel], 
                      model: str = "gemma4:e4b") -> BaseModel:
    """
    Ollama構造化出力 + Pydantic検証を一つにまとめたヘルパー。
    """
    schema = model_cls.model_json_schema()
    payload = {
        "model": model,
        "prompt": prompt,
        "format": schema,
        "stream": False,
        "options": {"temperature": 0}
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        "http://localhost:11434/api/generate",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read())
    return model_cls.model_validate_json(result["response"])


# 使用例
class SentimentAnalysis(BaseModel):
    sentiment: str       # "positive", "negative", "neutral"
    confidence: float    # 0.0 〜 1.0
    key_phrases: List[str]

result = ollama_structured(
    "Analyze sentiment: 'This new MacBook is amazing but too expensive'",
    SentimentAnalysis
)
print(f"Sentiment: {result.sentiment} ({result.confidence:.0%})")
print(f"Key phrases: {result.key_phrases}")
```

## 次のステップ

ここまで最も基本的な形のみ見てきた。実際のエージェントで使うにはもう少し必要だ。

**再試行ロジック。** Pydantic `ValidationError` が発生したらプロンプトを少し変えて再試行するロジックがあると良い。エラーメッセージをプロンプトに含めると、モデルがなぜ間違えたかを理解して修正するケースが多い。

**ストリーミング。** `stream: true` に設定すると、生成中のJSONを段階的に受け取れる。`ijson` のようなストリーミングJSONパーサーと組み合わせると、大きなレスポンスもメモリ効率よく処理できる。

**モデル選択戦略。** シンプルな抽出は `gemma4:e4b`（速い）、複雑なネストスキーマは `gemma4:12b-it-qat`（正確）でランタイムに分岐するパターンがコスト品質のバランス上有利だ。[Pydantic AIでエージェント全体を構造化する方法](/ja/blog/ja/pydantic-ai-type-safe-agent-tutorial-2026)を見ると、この判断をフレームワークレベルで抽象化する方法が確認できる。

Gemma4ベースのエージェントを実行しているなら、今日すぐ `format` パラメーター一つ追加するだけでパース安定性が大きく変わる。特にエージェントのツール選択のように、間違ったレスポンスがすぐエラーにつながるパスでより顕著だ。

## 参考資料

- [Ollama Structured outputs（公式ブログ）](https://ollama.com/blog/structured-outputs) — `format` パラメーターとJSONスキーマ、Pydantic例を扱う一次資料
- [Ollama APIドキュメント — Generate a completion / Structured outputs](https://github.com/ollama/ollama/blob/main/docs/api.md) — `/api/generate` エンドポイントと `format` フィールドの仕様
- [Pydantic JSON Schema ドキュメント](https://docs.pydantic.dev/latest/concepts/json_schema/) — `model_json_schema()` の動作とカスタマイズ
- [Ollama公式サイト](https://ollama.com) — インストールとモデルのダウンロード
