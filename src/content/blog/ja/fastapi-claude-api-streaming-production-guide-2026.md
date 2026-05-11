---
title: 'FastAPI + Claude API ストリーミングバックエンド — SSE・リトライ・エラー復旧 実践ガイド'
description: 'FastAPIとAnthropic SDKでプロダクションレベルのストリーミングAIバックエンドを構築する完全ガイド。SSEストリーミングエンドポイント実装、レートリミット指数バックオフリトライ、エラー分類戦略、トークンストリーミング最適化、Dockerコンテナデプロイをステップごとにコード例付きで解説します。'
pubDate: '2026-05-11'
heroImage: ../../../assets/blog/fastapi-claude-api-streaming-production-guide-2026-hero.png
tags:
  - FastAPI
  - Claude API
  - Python
  - ストリーミング
  - AIバックエンド
relatedPosts:
  - slug: anthropic-sdk-vs-openai-sdk-developer-experience-comparison-2026
    score: 0.91
    reason:
      ko: Anthropic Python SDK의 스트리밍 API 설계 철학을 이 글과 함께 비교하면 어떤 패턴이 프로덕션에 적합한지 판단하는 데 도움이 됩니다.
      ja: Anthropic Python SDKのストリーミングAPI設計思想をこの記事と組み合わせると、どのパターンがプロダクションに適しているか判断しやすくなります。
      en: Comparing the Anthropic Python SDK streaming API design philosophy alongside this guide helps you decide which pattern fits production best.
      zh: 将Anthropic Python SDK的流式API设计理念与本文结合比较，有助于判断哪种模式最适合生产环境。
  - slug: claude-api-prompt-caching-cost-optimization-guide
    score: 0.87
    reason:
      ko: 스트리밍 API를 쓸 때 프롬프트 캐싱을 함께 적용하면 입력 토큰 비용을 최대 90% 줄일 수 있습니다. 이 글의 다음 단계로 읽기 좋습니다.
      ja: ストリーミングAPIにプロンプトキャッシュを併用すると入力トークンコストを最大90%削減できます。この記事の次のステップとして読むのに適しています。
      en: Applying prompt caching alongside the streaming API can cut input token costs by up to 90%. A natural next read after this guide.
      zh: 将提示词缓存与流式API结合使用，可将输入令牌成本降低高达90%。读完本文后的自然延伸阅读。
  - slug: anthropic-message-batches-api-production-guide
    score: 0.83
    reason:
      ko: 스트리밍이 필요 없는 대량 처리 시나리오라면 Batch API가 훨씬 저렴합니다. 이 글과 쌍으로 읽으면 어떤 API를 선택할지 기준이 생깁니다.
      ja: ストリーミングが不要な大量処理シナリオではBatch APIの方がはるかに安価です。この記事とセットで読むとAPIの選択基準が明確になります。
      en: For bulk processing where streaming isn't needed, Batch API is far cheaper. Read alongside this guide to know which API to pick.
      zh: 对于不需要流式传输的批量处理场景，Batch API要便宜得多。与本文配合阅读，可以明确API选择标准。
  - slug: vercel-ai-sdk-claude-streaming-agent-2026
    score: 0.79
    reason:
      ko: 프론트엔드에서 직접 Claude 스트리밍을 연동하고 싶다면 Vercel AI SDK 방식도 있습니다. 백엔드(FastAPI)와 프론트엔드(Next.js) 각각 어떻게 다른지 비교해볼 수 있습니다.
      ja: フロントエンドから直接Claudeストリーミングを連携したい場合はVercel AI SDK方式もあります。バックエンド(FastAPI)とフロントエンド(Next.js)でどう違うか比較できます。
      en: If you want to wire Claude streaming directly from the frontend, the Vercel AI SDK approach is an option. Compare how backend (FastAPI) and frontend (Next.js) differ.
      zh: 如果想从前端直接集成Claude流式传输，还有Vercel AI SDK方式可选。可以比较后端(FastAPI)和前端(Next.js)各自的差异。
  - slug: uv-python-ai-development-setup-guide-2026
    score: 0.75
    reason:
      ko: FastAPI 프로젝트를 시작하기 전에 uv로 Python 환경을 구성하면 의존성 충돌 없이 빠르게 셋업됩니다. 선행 읽기 추천.
      ja: FastAPIプロジェクトを始める前にuvでPython環境を構築しておくと、依存関係の競合なく素早くセットアップできます。事前読み推奨。
      en: Setting up your Python environment with uv before starting a FastAPI project avoids dependency conflicts and speeds up setup. Recommended prerequisite reading.
      zh: 在开始FastAPI项目前使用uv配置Python环境，可以避免依赖冲突并加快设置速度。推荐预先阅读。
---

AIバックエンドを構築していると、必ず一つの問いに突き当たる。「レスポンスが全部生成されるまでユーザーを待たせてもいいのか？」答えはほとんどの場合「ノー」だ。特にClaudeのような言語モデルが長いテキストを生成するとき、全体が完成してから一気に返す方式はUXを壊す。

実際のサービスに組み込んでみて感じたのは、ストリーミング自体は難しくないということだ。本当の問題はその周辺にある。レートリミットに引っかかったときどうするか、エラーをどう分類してそれぞれ違う処理をするか、NginxのうしろでSSEを正しく流すにはどのヘッダーが必要か。この記事はFastAPI 0.136とAnthropic SDK 0.97をベースに、その実践パターンを自分で実装・検証した結果をまとめたものだ。

## Prerequisites

- Python 3.11以上（3.12推奨）
- Anthropic APIキー（`ANTHROPIC_API_KEY`）
- 基本的なFastAPI / asyncioの知識

依存関係は4つだけ：

```bash
pip install fastapi uvicorn anthropic httpx
```

Python環境の構成が初めてなら、[uvでPython AI開発環境をセットアップする方法](/ja/blog/ja/uv-python-ai-development-setup-guide-2026)を先に読むといい。仮想環境と依存関係の衝突問題をきれいに解決してくれる。

## Step 1: プロジェクト構造と基本設定

まずディレクトリを整理する：

```
claude-streaming-api/
├── main.py          # FastAPIアプリ + エンドポイント
├── retry.py         # リトライロジック
├── .env             # APIキー（gitignore）
├── Dockerfile
└── docker-compose.yml
```

`main.py`の基本骨格：

```python
import os
import anthropic
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="Claude Streaming API", version="1.0.0")

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


class ChatRequest(BaseModel):
    message: str
    max_tokens: int = 1024
    system: str = "You are a helpful assistant."
```

PydanticのBaseModelでリクエストスキーマを定義すると、FastAPIが自動で入力バリデーションとOpenAPIドキュメントを生成する。下の画像のようにSwagger UIが自動生成されるのを確認できる。

![FastAPI Swagger UI — Claude Streaming APIエンドポイント](../../../assets/blog/fastapi-claude-api-streaming-production-guide-2026-swagger.png)

ローカルで`uvicorn main:app --reload`を実行すると、`/docs`のSwagger UIから直接テストできる。この手軽さがFastAPIを選んだ主な理由の一つだ。

## Step 2: SSEストリーミングエンドポイントの実装

Server-Sent Events（SSE）はHTTP上で単方向リアルタイムストリームを送る最もシンプルな方法だ。WebSocketより実装が簡単で、Claudeのようにサーバーからクライアントへテキストを流すパターンにぴったり合う。

ポイントはFastAPIの`StreamingResponse`とAnthropic SDKの`stream()`コンテキストマネージャを組み合わせることだ：

```python
import asyncio
import json
from typing import AsyncGenerator


async def stream_claude(request: ChatRequest) -> AsyncGenerator[str, None]:
    """Claude API ストリーミング → SSEイベントジェネレーター"""
    try:
        with client.messages.stream(
            model="claude-opus-4-7-20251101",
            max_tokens=request.max_tokens,
            system=request.system,
            messages=[{"role": "user", "content": request.message}],
        ) as stream:
            for text in stream.text_stream:
                # SSEフォーマット: "data: {...}\n\n"
                yield f"data: {json.dumps({'text': text, 'type': 'delta'})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except anthropic.RateLimitError:
        yield f"data: {json.dumps({'type': 'error', 'error': 'rate_limit', 'retry_after': 30})}\n\n"
    except anthropic.AuthenticationError:
        yield f"data: {json.dumps({'type': 'error', 'error': 'auth_error'})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'error': 'unknown', 'message': str(e)})}\n\n"


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    return StreamingResponse(
        stream_claude(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Nginxバッファリング無効化必須
        },
    )
```

実際のSSEレスポンスストリームをcurlでテストするとこう流れる：

```
$ curl -sN -X POST http://localhost:8000/chat/stream \
       -H "Content-Type: application/json" \
       -d '{"message": "FastAPIとClaudeを組み合わせる方法を教えて"}'

data: {"type": "delta", "text": "FastAPI"}
data: {"type": "delta", "text": "と "}
data: {"type": "delta", "text": "Claude"}
...
data: {"type": "done"}
```

SSEイベントのフォーマット規則はシンプルだ：`data:` プレフィックス + JSON + 2回の改行（`\n\n`）。このフォーマットさえ守れば、ブラウザの`EventSource` APIや大抵のSSEクライアントが自動でパースしてくれる。

一点注意：`anthropic.Anthropic()`クライアントの`messages.stream()`は同期コンテキストマネージャだ。非同期FastAPIルート内でブロッキングなしに実行するには、`AsyncAnthropic`を使う方が正確だ：

```python
client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

async def stream_claude(request: ChatRequest) -> AsyncGenerator[str, None]:
    async with client.messages.stream(...) as stream:
        async for text in stream.text_stream:
            yield f"data: {json.dumps({'text': text, 'type': 'delta'})}\n\n"
```

`AsyncAnthropic`を使えばuvicornのイベントループをブロックしない。トラフィックが少ない初期プロジェクトでは同期クライアントも問題なく動くが、プロダクションでは非同期クライアントが正解だ。

## Step 3: エラー分類とリトライ戦略

AI APIのエラーを全部同じ方法で処理してはいけない。エラーごとに正しい行動が違うからだ：

| エラー種別 | 分類 | 正しい行動 |
|---|---|---|
| `RateLimitError` | `rate_limit` | 指数バックオフ後にリトライ |
| `AuthenticationError` | `auth_error` | 即失敗、APIキー確認 |
| `BadRequestError` | `token_limit` | 即失敗、メッセージ削減 |
| `APIConnectionError` | `network_error` | 制限付きリトライ |
| その他 | `unknown` | 即失敗、ログ記録 |

レートリミットとネットワークエラーのみリトライする指数バックオフ関数：

```python
MAX_RETRIES = 3
BASE_DELAY = 1.0  # seconds


async def call_with_retry(fn, *args, **kwargs):
    """指数バックオフリトライ — rate_limitとnetwork_errorのみリトライ"""
    for attempt in range(MAX_RETRIES):
        try:
            return await fn(*args, **kwargs)
        except anthropic.RateLimitError as e:
            if attempt == MAX_RETRIES - 1:
                raise  # 最後の試みでも失敗なら伝播
            delay = BASE_DELAY * (2 ** attempt)
            print(f"[retry] rate_limit, waiting {delay}s (attempt {attempt + 1}/{MAX_RETRIES})")
            await asyncio.sleep(delay)
        except anthropic.APIConnectionError:
            if attempt == MAX_RETRIES - 1:
                raise
            await asyncio.sleep(BASE_DELAY * (2 ** attempt))
        except (anthropic.AuthenticationError, anthropic.BadRequestError):
            raise  # リトライしても意味のないエラーはすぐ伝播
```

このパターンを自分でテストしたとき、2回失敗後に3回目で成功するflakyなAPIをシミュレーションした結果、`Result: success (after 3 attempts)`で正常動作を確認した。

正直に言うと、リトライロジックで一番気になる部分は`MAX_RETRIES`と`BASE_DELAY`の値だ。レートリミットはAnthropicのプランによって異なり、リトライ間隔が短すぎると同じレートリミットにまた引っかかる。自分はAPIプランに応じてこれらの値を環境変数で外部化することを推奨している。

## Step 4: ヘルスチェックとプロダクションデプロイ

KubernetesやECSのようなコンテナ環境ではヘルスチェックエンドポイントが必須だ：

```python
import time


@app.get("/health")
async def health_check():
    """K8s readiness / liveness probe用"""
    return {"status": "ok", "timestamp": time.time()}
```

Dockerイメージ：

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

NginxリバースプロキシでSSEを正しく流すには、バッファリングを必ず無効にする必要がある：

```nginx
location /chat/stream {
    proxy_pass         http://backend:8000;
    proxy_buffering    off;           # SSEバッファリング無効化必須
    proxy_cache        off;
    proxy_set_header   Connection     '';
    proxy_http_version 1.1;
    proxy_read_timeout 300s;          # 長いストリーミングセッション許容
    chunked_transfer_encoding on;
}
```

`proxy_buffering off`を忘れると、Nginxがストリームをすべてバッファにためてからまとめて返す。それはストリーミングではなく、ただの遅いレスポンスになる。この設定は初めてSSEをNginxの後ろにつける人がほぼ確実に一度は経験する問題だ。

## Step 5: クライアント連携 — ブラウザEventSourceとPython

**ブラウザ（JavaScript）**：

```javascript
// EventSourceはGET専用 — POSTリクエストはfetch + ReadableStream必要
const response = await fetch('/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'こんにちは' }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value);
  const lines = text.split('\n\n').filter(l => l.startsWith('data:'));
  
  for (const line of lines) {
    const data = JSON.parse(line.slice(6));
    if (data.type === 'delta') {
      outputElement.textContent += data.text;
    }
  }
}
```

**Python（httpx）**：

```python
import httpx
import json

async def stream_chat(message: str):
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            "http://localhost:8000/chat/stream",
            json={"message": message},
            timeout=60.0,
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data:"):
                    event = json.loads(line[6:])
                    if event["type"] == "delta":
                        print(event["text"], end="", flush=True)
```

Vercel AI SDKを使うフロントエンドがある場合、[Vercel AI SDKでClaudeストリーミングエージェントを作る](/ja/blog/ja/vercel-ai-sdk-claude-streaming-agent-2026)を参照するとフロントエンド連携をより速く進められる。`useChat`フックがSSEのパースを代わりにやってくれて、クライアントコードがずっとシンプルになる。

## 残念な点と実際に詰まるポイント

このスタックを実際のプロジェクトで使って感じた限界を正直に整理する。

**一つ目、ストリーミングとプロンプトキャッシュの組み合わせが難しい。** Claude APIのプロンプトキャッシュは入力トークンコストを大きく削減する。しかしストリーミングとキャッシュを同時に使うとき、キャッシュヒット有無をストリーム途中に知ることができない。ストリーミング完了後の`usage`オブジェクトで確認できるが、リアルタイムでキャッシュ状態を反映するUIが必要なら実装が複雑になる。[Claude APIプロンプトキャッシュでコスト最適化する方法](/ja/blog/ja/claude-api-prompt-caching-cost-optimization-guide)でキャッシュ戦略を事前に把握しておくといい。

**二つ目、uvicornのワーカー数とコネクション管理が思ったより複雑だ。** SSEは接続を長く保持する。`--workers 4`で4ワーカーを使うなら、同時に最大4つの長いストリーミング接続しかできない。実際のトラフィックがこれを超えるとリクエストが待機する。Kubernetesで水平スケールするか、`gunicorn + uvicorn worker class`の組み合わせが必要だ。

**三つ目、リトライロジックがストリーミング途中に入ると処理が複雑になる。** ストリーミングが半分進んだときにネットワークエラーが起きたらどうするか。最初からリクエストし直すと、クライアントはすでに受け取ったテキストが重複する。実用的な解決策はクライアント側で`last-event-id`を管理し、サーバーがそれを受け取って続きから生成することだが、この実装はこの記事の範囲を超える。

このパターンはストリーミングレスポンスが不要な大量処理シナリオにはオーバーエンジニアリングだ。1,000件のドキュメントをバッチ処理するなら[Anthropic Message Batches API](/ja/blog/ja/anthropic-message-batches-api-production-guide)の方がずっと安くて適切だ。

## トラブルシューティング FAQ

**Q: SSEがクライアントに届かず一気に来る**

Nginxの`proxy_buffering off`が抜けている場合がほとんどだ。もしくは`Content-Type: text/event-stream`ヘッダーがなければブラウザがSSEとして認識しない。

**Q: `asyncio.CancelledError`が断続的に発生する**

クライアントがストリーミング途中で接続を切ると、FastAPIがジェネレーターをキャンセルする。`stream_claude`の中で`except asyncio.CancelledError: return`を処理するときれいに終了できる。

**Q: `RuntimeError: Event loop is closed` エラー**

同期の`anthropic.Anthropic()`クライアントを非同期コンテキストで使うと発生することがある。`anthropic.AsyncAnthropic()`に置き換えるのが根本解決策だ。

**Q: レートリミットに引っかかり、リトライしても失敗し続ける**

`BASE_DELAY`が短すぎるか、短時間にリクエストが集中するバーストトラフィックが原因だ。AnthropicのRate LimitsページでプランごとのTPM/RPM上限を確認し、`BASE_DELAY`を最低5秒以上に上げることを推奨する。

## まとめ：このスタックをいつ選ぶか

FastAPI + AsyncAnthropic + uvicornの組み合わせは次の状況によく合う：

- Pythonチームがすでにあり、新しい言語スタック導入コストを避けたいとき
- ストリーミングがコアUX要素であるAIチャット、コード生成、文書作成サービス
- OpenAPIドキュメント自動化とPydanticバリデーションが必要なチーム

正直に言うと、このスタックがすべての状況で最善ではない。Node.jsチームならVercel AI SDKの方が速く、大規模なリアルタイム接続が必要ならWebSocketやgRPC Streamingが良い選択肢になる。しかしPython AIバックエンドを素早く立ち上げたいなら、このパターンは自分が実際に検証した最も実用的な出発点だ。

次のステップとしては、プロンプトキャッシュを適用してコストを下げ、ストリーミングレスポンスにOpenTelemetryトレーシングをつけてレイテンシとトークン使用量を可視化する作業を推奨する。
