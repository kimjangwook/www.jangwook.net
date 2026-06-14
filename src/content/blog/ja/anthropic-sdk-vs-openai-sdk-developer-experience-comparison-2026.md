---
draft: true
title: 'Anthropic SDK vs OpenAI SDK 開発者体験比較 — 型安全性・エラー処理・ストリーミングパターンを実測'
description: 'anthropic 0.100.0とopenai 2.36.0をサンドボックスで実際にインストールして比較。型数408 vs 230、エラー階層、ストリーミング実装、ツール呼び出しフォーマット、SDK固有機能をコードレベルで分析した実践的比較ガイド。'
pubDate: '2026-05-09'
heroImage: '../../../assets/blog/anthropic-sdk-vs-openai-sdk-developer-experience-comparison-2026/hero.png'
tags: ['Anthropic', 'OpenAI', 'Python', 'SDK', 'LLM']
relatedPosts:
  - slug: 'claude-api-prompt-caching-cost-optimization-guide'
    score: 0.91
    reason:
      ko: '이 글에서 다룬 Anthropic SDK의 CacheControlEphemeral 타입을 실제 프로젝트에 적용해 비용을 70% 낮추는 구체적 패턴이 궁금하다면 이 글을 읽어볼 만하다.'
      ja: 'Anthropic SDK特有のCacheControlEphemeralを本番環境で活用してコストを70%削減する具体的なパターンを解説している。'
      en: 'If the CacheControlEphemeral type introduced here sparked your curiosity, this post shows how to apply it in production and cut costs by 70%.'
      zh: '如果本文介绍的Anthropic SDK专有CacheControlEphemeral类型让你感兴趣，这篇文章详细讲解了如何在生产环境中降低70%成本。'
  - slug: 'vercel-ai-sdk-claude-streaming-agent-2026'
    score: 0.84
    reason:
      ko: '스트리밍 패턴 비교를 읽고 나서 실제 Claude 스트리밍 에이전트를 Vercel AI SDK로 구축하고 싶다면 이 튜토리얼이 자연스러운 다음 단계다.'
      ja: 'ストリーミングパターン比較の後、実際にVercel AI SDKでClaudeストリーミングエージェントを作りたい場合の実践チュートリアル。'
      en: 'After the streaming pattern comparison, this tutorial is the natural next step for building a real Claude streaming agent with Vercel AI SDK.'
      zh: '在了解了流式模式比较之后，如果想用Vercel AI SDK构建真实的Claude流式代理，这个教程是自然的下一步。'
  - slug: 'llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek'
    score: 0.79
    reason:
      ko: 'SDK 선택 기준을 잡았다면 실제 과금 구조와 토큰당 비용을 비교한 이 글이 최종 선택에 도움이 된다.'
      ja: 'SDK選択の基準を把握したら、実際の課金体系とトークンあたりのコスト比較でファイナルな判断材料を得られる。'
      en: 'Once you know which SDK fits, this pricing breakdown helps finalize the cost side of the decision.'
      zh: '确定了SDK选择标准之后，这篇关于实际计费结构和每token成本比较的文章将帮助你做出最终决定。'
  - slug: 'pydantic-ai-type-safe-agent-tutorial-2026'
    score: 0.76
    reason:
      ko: '이 글에서 두 SDK의 타입 시스템을 비교했다면, PydanticAI가 그 타입 안전성을 에이전트 레벨로 끌어올리는 방법이 궁금할 것이다.'
      ja: '両SDKのタイプシステムを比較した後、PydanticAIがそのタイプ安全性をエージェントレベルまで引き上げる方法が気になるなら。'
      en: 'After comparing both SDKs'' type systems, PydanticAI shows how to bring that type safety up to the agent layer.'
      zh: '比较了两个SDK的类型系统之后，如果好奇PydanticAI如何将类型安全性提升到代理层面，这篇文章给出了答案。'
---

`pip install anthropic openai` を実行して、2つのパッケージを並べて調べたことがこの記事の出発点だ。anthropic 0.100.0、openai 2.36.0 — バージョン番号からして雰囲気が違う。Anthropicはまだ0.x台で、OpenAIはすでに2.xを走っている。数字自体より、その背後に隠れた設計哲学の違いが興味深い。

私は2つのSDKを一時的なサンドボックスにインストールし、型ツリーからエラー階層、ストリーミング実装コードまで直接確認した。この記事はその結果をまとめたものだ。

## 第一印象：バージョン番号が語るもの

anthropic 0.100.0 — 0.x台ながら100番目のマイナーリリースという点が興味深い。まだ1.0を出していないということは、API安定化を慎重に判断しているということかもしれない。openai 2.36.0はすでにmajor version bumpを一度経験している。

2つのSDKはどちらも内部的に`httpx`ベースで、`SSE(Server-Sent Events)`方式でストリーミングを処理する。最上位クライアント初期化パラメータを比較すると、哲学の違いが見えてくる。

```python
# anthropic.Anthropic() 固有パラメータ
client = anthropic.Anthropic(
    api_key=None,
    auth_token=None,
    credentials=None,    # エンタープライズ認証情報
    config=None,         # プロファイルベース設定
    profile=None,        # named profile
    webhook_key=None,
    _token_cache=NOT_GIVEN,
)

# openai.OpenAI() 固有パラメータ
client = openai.OpenAI(
    api_key=None,
    admin_api_key=None,       # 管理者APIキー
    workload_identity=None,   # IAMベース認証
    organization=None,        # 組織ID
    project=None,             # プロジェクトID
    webhook_secret=None,
    websocket_base_url=None,  # Realtime API用
    _enforce_credentials=True,
)
```

Anthropicは`credentials`、`config`、`profile` — エンタープライズ環境で複数アカウントを設定ファイルで管理するパターンをサポートする。OpenAIは`organization`、`project`、`workload_identity` — チーム単位の課金とIAMベース認証に焦点を当てている。

共通パラメータは`max_retries=2`、`timeout`、`default_headers`、`http_client` — どちらも同じデフォルト値を使う。

## 型システム比較：408 vs 230

サンドボックスで確認した数値が最も驚きだった。

```
anthropic.types モジュール内 exported types: 408
openai.types モジュール内 exported types: 230
```

差が大きい。理由はAnthropicのモデルがより多様なコンテンツブロック型を持つからだ。Claudeはテキスト以外に`ToolUseBlock`、`ThinkingBlock`、`CitationContentBlockLocation`、`BashCodeExecutionOutputBlock`などを応答メッセージとして返すことができる。それぞれに対応するTypedDict param型が別々に存在するため、型数が多くなる。

一方OpenAIは`ChatCompletion`を中心とするシンプルな構造だ。応答フォーマットがより一貫しているため型数が少ない。これは悪いことではない — シンプルさにはメリットがある。

Anthropic SDKにのみ存在する型たち：

| 型 | 機能 |
|------|------|
| `ThinkingBlock` / `ThinkingConfigParam` | 拡張思考（Extended Thinking） |
| `CacheControlEphemeralParam` | プロンプトキャッシング（TTL: '5m' / '1h'） |
| `CitationContentBlockLocation` | AI応答引用位置追跡 |
| `BashCodeExecutionOutputBlock` | コード実行ツール結果 |
| `MemoryTool20250818Param` | エージェントメモリツール |
| `ServerToolCaller20260120Param` | サーバーサイドツール実行機 |
| `AnthropicBetaParam` | Beta機能ヘッダー制御 |

OpenAI SDKにのみ存在するもの：

| 機能 | 説明 |
|------|------|
| `AssistantEventHandler` | Assistants APIイベントストリーミング |
| Realtime API | WebSocketベースリアルタイムストリーミング |
| Fine-tuning types | `fine_tuning`モジュール |
| `OAuthError` | `AuthenticationError`のサブタイプ |

正直、Anthropicの型数が多いのはClaudeの機能が多いからでもあるが、API設計がより複雑だということでもある。ツール結果型が`BashCodeExecutionToolResultBlockParam`、`BashCodeExecutionToolResultErrorParam`のように細分化されると、自動補完は精緻になるが学習曲線も上がる。

## ツール呼び出しフォーマット：input_schema vs function.parameters

2つのSDKで最も目立つAPI設計の違いがここだ。

```python
# Anthropic: ツール定義
anthropic_tool = {
    "name": "get_weather",
    "description": "現在の天気を取得する",
    "input_schema": {              # これがJSON Schemaのルート
        "type": "object",
        "properties": {
            "location": {"type": "string"}
        },
        "required": ["location"]
    }
}

# OpenAI: ツール定義
openai_tool = {
    "type": "function",            # ラッパーレイヤーが一つ多い
    "function": {
        "name": "get_weather",
        "description": "現在の天気を取得する",
        "parameters": {            # functionの中にネスト
            "type": "object",
            "properties": {
                "location": {"type": "string"}
            },
            "required": ["location"]
        }
    }
}
```

結果を返す時もフォーマットが異なる。

```python
# Anthropic: ツール結果をuserメッセージのcontentブロックとして渡す
messages.append({
    "role": "user",
    "content": [
        {
            "type": "tool_result",
            "tool_use_id": "toolu_01A...",
            "content": "15°C 晴れ"
        }
    ]
})

# OpenAI: ツール結果をtool roleメッセージとして渡す
messages.append({
    "role": "tool",
    "tool_call_id": "call_abc123",
    "content": "15°C 晴れ"
})
```

Anthropicはすべてを`content`ブロックの配列で統一している。OpenAIはtoolを別roleで処理する。どちらが優れているとは一概に言えないが、Anthropicの方式がメッセージ構造をより一貫して維持するという印象がある。

## エラー処理アーキテクチャ：共通点と決定的な差異

2つのSDKのエラー階層をサンドボックスで直接出力した。

![エラー階層比較ダイアグラム](../../../assets/blog/anthropic-sdk-vs-openai-sdk-developer-experience-comparison-2026/error-hierarchy.png)

```
# Anthropic エラー階層 (0.100.0)
APIError
├─ APIStatusError
│   ├─ BadRequestError
│   ├─ RequestTooLargeError     ← Anthropic固有
│   ├─ ServiceUnavailableError  ← Anthropic固有
│   ├─ OverloadedError          ← Anthropic固有 (HTTP 529)
│   └─ DeadlineExceededError    ← Anthropic固有
└─ APIConnectionError
    └─ APITimeoutError

# OpenAI エラー階層 (2.36.0)
APIError
├─ APIStatusError
│   ├─ AuthenticationError
│   │   └─ OAuthError          ← OpenAI固有
│   └─ (他の標準エラー)
└─ APIConnectionError
    └─ APITimeoutError
```

Anthropicにのみ存在するエラーが興味深い。`OverloadedError`はHTTP 529で、Claudeサーバーがトラフィック過負荷状態の時に返される。`DeadlineExceededError`はタイムアウトよりも具体的な状況を表現する。`RequestTooLargeError`はコンテキスト長の超過とは別に、リクエスト自体のサイズが大きすぎる時のものだ。

本番エラーハンドリングを書く時、この区別が重要だ。`OverloadedError`はバックオフ再試行が適切で、`DeadlineExceededError`は再試行よりタイムアウト設定を増やす方が適切かもしれない。

```python
import anthropic
from anthropic import OverloadedError, RateLimitError, DeadlineExceededError

def safe_call(client, **kwargs):
    try:
        return client.messages.create(**kwargs)
    except OverloadedError:
        # サーバー過負荷 — exponential backoff
        time.sleep(10)
        return client.messages.create(**kwargs)
    except RateLimitError as e:
        wait = int(e.response.headers.get('retry-after', 60))
        time.sleep(wait)
        return client.messages.create(**kwargs)
    except DeadlineExceededError:
        # 処理時間超過 — より短いリクエストに分けて再試行
        raise
```

## ストリーミングパターン：コアは同じ、表面は異なる

2つのSDKのストリーミングコア実装を直接ソースで確認した。`Stream`クラスの`__iter__`実装がほぼ同一だ。

```python
# anthropic._streaming.Stream — 実際のソース
class Stream(Generic[_T], metaclass=_SyncStreamMeta):
    def __iter__(self) -> Iterator[_T]:
        for item in self._iterator:
            yield item
    def _iter_events(self) -> Iterator[ServerSentEvent]:
        yield from self._decoder.iter_bytes(self.response.iter_bytes())

# openai._streaming.Stream — ほぼ同一
class Stream(Generic[_T]):
    def __iter__(self) -> Iterator[_T]:
        for item in self._iterator:
            yield item
    def _iter_events(self) -> Iterator[ServerSentEvent]:
        yield from self._decoder.iter_bytes(self.response.iter_bytes())
```

使用インターフェースは異なる。

```python
# Anthropic ストリーミング
with client.messages.stream(
    model="claude-opus-4-7",
    max_tokens=1024,
    messages=[{"role": "user", "content": "こんにちは"}]
) as stream:
    for text in stream.text_stream:   # テキストを直接抽出
        print(text, end="", flush=True)

# OpenAI ストリーミング
with client.chat.completions.stream(
    model="gpt-5",
    messages=[{"role": "user", "content": "こんにちは"}]
) as stream:
    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta.content:             # より深くアクセス
            print(delta.content, end="", flush=True)
```

Anthropicは`stream.text_stream`でテキストを直接抽出できる。OpenAIは`chunk.choices[0].delta.content`まで直接掘り下げる必要がある。シンプルなテキストストリーミングならAnthropicの方が使いやすい。

[Vercel AI SDKでClaudeストリーミングエージェントを構築する](/ja/blog/ja/vercel-ai-sdk-claude-streaming-agent-2026)ガイドもこのストリーミングパターンを応用した事例だ。

## Anthropic SDKだけの機能：プロンプトキャッシングと拡張思考

2つのSDKを比較していて最も注目したのがAnthropicの固有機能だ。

**プロンプトキャッシング**

`CacheControlEphemeralParam`に`ttl`フィールドがある — `'5m'`または`'1h'`。これは予期していなかった発見だった。以前はephemeralキャッシュ一つだけだったが、今は有効期限を指定できる。

```python
client.messages.create(
    model="claude-opus-4-7",
    system=[
        {
            "type": "text",
            "text": "非常に長いシステムプロンプト...",
            "cache_control": {"type": "ephemeral", "ttl": "1h"}
        }
    ],
    messages=[{"role": "user", "content": "要約して"}]
)
```

**拡張思考（Extended Thinking）**

`ThinkingConfigParam`と`ThinkingBlock`型がSDKにある。OpenAIにはない機能だ。Claudeが推論過程を段階的に出力するのを構造化された型で受け取れる。

```python
response = client.messages.create(
    model="claude-opus-4-7",
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{"role": "user", "content": "複雑な数学問題"}]
)

for block in response.content:
    if block.type == "thinking":
        print("推論過程:", block.thinking)
    elif block.type == "text":
        print("最終回答:", block.text)
```

## OpenAI SDKだけの機能：Assistants APIとRealtime

OpenAIにもAnthropicにないものがある。

**Assistants API** — `AssistantEventHandler`により、ファイル検索・コードインタープリター・カスタム関数を組み合わせた状態維持型エージェントを作れる。

**Realtime API** — `websocket_base_url`パラメータがそのためにある。WebSocketベースのリアルタイム双方向通信をSDKがサポートする。音声エージェントや対話型アプリケーションに適している。

**Fine-tuning内蔵サポート** — OpenAI SDKの`fine_tuning`モジュールでファインチューニング作業をSDKから直接制御できる。AnthropicのファインチューニングはSDKに公式インターフェースがない。

## 選択基準：プロジェクト種別ガイド

| 項目 | Anthropic SDK 0.100.0 | OpenAI SDK 2.36.0 |
|------|----------------------|-------------------|
| 型数 | 408 | 230 |
| エラークラス | 16個（529含む） | 13個 |
| デフォルト最大再試行 | 2 | 2 |
| ストリーミングコア | httpx + SSE | httpx + SSE |
| プロンプトキャッシング | ✓（SDK レベル） | ✗ |
| 拡張思考 | ✓ | ✗ |
| Realtime API | ✗ | ✓ |
| Assistants API | ✗ | ✓ |
| ファインチューニング内蔵 | ✗ | ✓ |
| 引用システム | ✓ | ✗ |

**Anthropic SDKを選ぶべき時**: 長文コンテキスト処理（プロンプトキャッシングでコスト削減）、複雑な推論の追跡（Extended Thinking）、文書QAで引用元追跡（Citations）、型安全性最優先のチーム。

**OpenAI SDKを選ぶべき時**: 音声インターフェースやリアルタイムインタラクション（Realtime API）、Assistants APIのファイル検索・コードインタープリター組み合わせ、組織/プロジェクト単位の課金分離、特定ドメインへのファインチューニング管理。

マルチモデルアーキテクチャを運営するなら、[PydanticAI](/ja/blog/ja/pydantic-ai-type-safe-agent-tutorial-2026)のようにSDKを抽象化するレイヤーを置くのが管理しやすい。

## SDK戦争の本当の意味

2つのSDKを直接比較してわかったのは、これが単なるAPIラッパー競争ではないということだ。SDKはその会社がLLMで何をしようとしているかを示すインターフェースだ。

Anthropicは推論品質、コスト最適化、エンタープライズ文書処理に重きを置いている。OpenAIはマルチモーダルインターフェース、リアルタイム通信、ファインチューニングエコシステムへ拡張している。

SDK選択よりも重要なのは、そのモデルが自分のワークロードに適しているかどうかを先に判断することだ。SDKはその次だ。
