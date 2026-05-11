---
title: 'FastAPI + Claude API: Production Streaming API — SSE & Retry'
description: 'A production FastAPI streaming guide with Anthropic SDK. SSE endpoints, exponential backoff retry, error classification, and Docker deployment covered.'
pubDate: '2026-05-11'
heroImage: ../../../assets/blog/fastapi-claude-api-streaming-production-guide-2026-hero.png
tags:
  - FastAPI
  - Claude API
  - Python
  - Streaming
  - AI Backend
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

When building an AI backend, you eventually hit the same question: "Can I make users wait until the whole response is generated?" Most of the time the answer is no. When a model like Claude is producing a long piece of text, buffering everything and sending it all at once kills the UX.

Having integrated this into actual services, what I found is that streaming itself isn't the hard part. The real complexity is around it: what to do when you hit a rate limit, how to classify errors and handle each one differently, which headers you need to make SSE flow properly behind Nginx. This guide covers those production patterns — implemented and tested against FastAPI 0.136 and Anthropic SDK 0.97.

## Prerequisites

- Python 3.11 or later (3.12 recommended)
- Anthropic API key (`ANTHROPIC_API_KEY`)
- Basic understanding of FastAPI and asyncio

You only need four dependencies:

```bash
pip install fastapi uvicorn anthropic httpx
```

If you're new to Python environment setup, [setting up a Python AI development environment with uv](/en/blog/en/uv-python-ai-development-setup-guide-2026) is a good first read. It cleanly solves virtual environment and dependency conflict issues.

## Step 1: Project Structure and Basic Setup

Start with a clean directory layout:

```
claude-streaming-api/
├── main.py          # FastAPI app + endpoints
├── retry.py         # retry logic
├── .env             # API key (gitignored)
├── Dockerfile
└── docker-compose.yml
```

The skeleton of `main.py`:

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

Defining the request schema with Pydantic's `BaseModel` gives you automatic input validation and OpenAPI docs from FastAPI for free. As you can see in the screenshot below, the Swagger UI generates automatically.

![FastAPI Swagger UI — Claude Streaming API endpoints](../../../assets/blog/fastapi-claude-api-streaming-production-guide-2026-swagger.png)

Running `uvicorn main:app --reload` locally and opening `/docs` gives you a live Swagger UI you can test directly. That convenience is one of the main reasons I reach for FastAPI.

## Step 2: Implementing the SSE Streaming Endpoint

Server-Sent Events (SSE) is the simplest way to push a one-directional real-time stream over HTTP. It's simpler to implement than WebSocket and fits perfectly for the pattern of streaming text from server to client — exactly what Claude does.

The key is combining FastAPI's `StreamingResponse` with Anthropic SDK's `stream()` context manager:

```python
import asyncio
import json
from typing import AsyncGenerator


async def stream_claude(request: ChatRequest) -> AsyncGenerator[str, None]:
    """Claude API streaming → SSE event generator"""
    try:
        with client.messages.stream(
            model="claude-opus-4-7-20251101",
            max_tokens=request.max_tokens,
            system=request.system,
            messages=[{"role": "user", "content": request.message}],
        ) as stream:
            for text in stream.text_stream:
                # SSE format: "data: {...}\n\n"
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
            "X-Accel-Buffering": "no",  # Disable Nginx buffering — critical
        },
    )
```

Testing with curl against a live server, the SSE stream looks like this:

```
$ curl -sN -X POST http://localhost:8000/chat/stream \
       -H "Content-Type: application/json" \
       -d '{"message": "Explain FastAPI and Claude integration"}'

data: {"type": "delta", "text": "FastAPI"}
data: {"type": "delta", "text": " and "}
data: {"type": "delta", "text": "Claude"}
...
data: {"type": "done"}
```

The SSE format rules are simple: `data:` prefix + JSON + two newlines (`\n\n`). Follow that format and the browser's `EventSource` API or most SSE clients will parse it automatically.

One thing to watch: `anthropic.Anthropic()`'s `messages.stream()` is a synchronous context manager. To avoid blocking uvicorn's event loop inside an async FastAPI route, use `AsyncAnthropic` instead:

```python
client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

async def stream_claude(request: ChatRequest) -> AsyncGenerator[str, None]:
    async with client.messages.stream(...) as stream:
        async for text in stream.text_stream:
            yield f"data: {json.dumps({'text': text, 'type': 'delta'})}\n\n"
```

With `AsyncAnthropic`, you won't block uvicorn's event loop. The sync client works fine for low-traffic early-stage projects, but production warrants the async client.

## Step 3: Error Classification and Retry Strategy

Don't handle all AI API errors the same way. Each error type calls for a different response:

| Error Type | Classification | Correct Action |
|---|---|---|
| `RateLimitError` | `rate_limit` | Retry with exponential backoff |
| `AuthenticationError` | `auth_error` | Fail immediately, check API key |
| `BadRequestError` | `token_limit` | Fail immediately, shorten message |
| `APIConnectionError` | `network_error` | Retry with limits |
| Other | `unknown` | Fail immediately, log the event |

An exponential backoff function that only retries rate limits and network errors:

```python
MAX_RETRIES = 3
BASE_DELAY = 1.0  # seconds


async def call_with_retry(fn, *args, **kwargs):
    """Exponential backoff retry — only for rate_limit and network_error"""
    for attempt in range(MAX_RETRIES):
        try:
            return await fn(*args, **kwargs)
        except anthropic.RateLimitError as e:
            if attempt == MAX_RETRIES - 1:
                raise
            delay = BASE_DELAY * (2 ** attempt)
            print(f"[retry] rate_limit, waiting {delay}s (attempt {attempt + 1}/{MAX_RETRIES})")
            await asyncio.sleep(delay)
        except anthropic.APIConnectionError:
            if attempt == MAX_RETRIES - 1:
                raise
            await asyncio.sleep(BASE_DELAY * (2 ** attempt))
        except (anthropic.AuthenticationError, anthropic.BadRequestError):
            raise  # No point retrying these — propagate immediately
```

When I tested this pattern locally — simulating a flaky API that fails twice before succeeding — the result was `Result: success (after 3 attempts)`. The backoff worked as expected.

Honestly, the part of this I'm most uncertain about is the `MAX_RETRIES` and `BASE_DELAY` values. Rate limits differ per Anthropic plan, and if your retry interval is too short, you'll hit the same rate limit again. I'd recommend externalizing these values as environment variables based on your API plan.

## Step 4: Health Checks and Production Deployment

In container environments like Kubernetes or ECS, a health check endpoint is non-negotiable:

```python
import time


@app.get("/health")
async def health_check():
    """For K8s readiness / liveness probes"""
    return {"status": "ok", "timestamp": time.time()}
```

Docker image:

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

For Nginx reverse proxy, you must disable buffering to let SSE flow properly:

```nginx
location /chat/stream {
    proxy_pass         http://backend:8000;
    proxy_buffering    off;           # Critical: disable SSE buffering
    proxy_cache        off;
    proxy_set_header   Connection     '';
    proxy_http_version 1.1;
    proxy_read_timeout 300s;          # Allow long streaming sessions
    chunked_transfer_encoding on;
}
```

Leaving out `proxy_buffering off` means Nginx collects the entire stream in its buffer and sends it all at once. That's not streaming — it's just a slow response. This is a mistake nearly everyone makes the first time they put SSE behind Nginx.

## Step 5: Client Integration — Browser EventSource and Python

**Browser (JavaScript)**:

```javascript
// EventSource is GET-only — for POST requests, use fetch + ReadableStream
const response = await fetch('/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' }),
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

**Python (httpx)**:

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

If you have a frontend using the Vercel AI SDK, [building a Claude streaming agent with the Vercel AI SDK](/en/blog/en/vercel-ai-sdk-claude-streaming-agent-2026) shows how to wire this up on the frontend side. The `useChat` hook handles SSE parsing for you, which makes client-side code much simpler.

## Limitations and Where You'll Actually Get Stuck

Here are the honest limitations I hit when using this stack in real projects.

**First, combining streaming with prompt caching is tricky.** Claude's prompt caching reduces input token costs significantly. But when using streaming and caching together, you can't know mid-stream whether the cache was hit. The `usage` object is available after streaming completes, but if you need to reflect cache status in real time, the implementation gets complex. Read [Claude API prompt caching cost optimization](/en/blog/en/claude-api-prompt-caching-cost-optimization-guide) before you design your architecture around caching.

**Second, uvicorn worker count and connection management is more involved than it looks.** SSE keeps connections open for a long time. With `--workers 4`, you can handle at most 4 concurrent long-running streaming connections. When real traffic exceeds that, requests queue. You'll need horizontal scaling on Kubernetes or the `gunicorn + uvicorn worker class` combination.

**Third, retry logic mid-stream is a hard problem.** What do you do when a network error hits halfway through a stream? Restarting the request from scratch means the client gets duplicate text. The practical solution — having the client track `last-event-id` so the server can resume — is outside this guide's scope, but worth planning for early.

This pattern is also overkill for bulk processing where streaming isn't the point. If you're processing 1,000 documents in batch, the [Anthropic Message Batches API](/en/blog/en/anthropic-message-batches-api-production-guide) is far cheaper and more appropriate.

## Troubleshooting FAQ

**Q: SSE arrives all at once instead of streaming**

`proxy_buffering off` is missing from Nginx in most cases. Also check that the `Content-Type: text/event-stream` header is present — without it, browsers won't recognize the response as SSE.

**Q: Intermittent `asyncio.CancelledError`**

When a client disconnects mid-stream, FastAPI cancels the generator. Adding `except asyncio.CancelledError: return` inside `stream_claude` exits cleanly.

**Q: `RuntimeError: Event loop is closed`**

This can happen when using the synchronous `anthropic.Anthropic()` client inside an async context. Switching to `anthropic.AsyncAnthropic()` is the root fix.

**Q: Rate limited, retries keep failing**

Either `BASE_DELAY` is too short or burst traffic is hammering the same window. Check Anthropic's Rate Limits page for your plan's TPM/RPM limits and set `BASE_DELAY` to at least 5 seconds.

## Closing: When to Choose This Stack

FastAPI + AsyncAnthropic + uvicorn is a good fit when:

- You have a Python team and want to avoid the cost of adopting a new language stack
- Streaming is a core UX element — AI chat, code generation, document drafting
- You want OpenAPI documentation auto-generation and Pydantic validation out of the box

To be honest, this isn't the right stack for every situation. If you have a Node.js team, the Vercel AI SDK is faster to ship. If you need massive concurrent real-time connections, WebSocket or gRPC Streaming might be better. But for getting a Python AI streaming backend running quickly, this is the most practical starting point I've personally verified.

Next steps: apply prompt caching to cut costs, add OpenTelemetry tracing to your streaming responses, and make latency and token usage visible.
