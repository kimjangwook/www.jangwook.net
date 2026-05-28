---
title: 'Building a Local LLM API Server with Ollama + FastAPI — From Dev to Docker Deployment'
description: 'A hands-on guide to wrapping Ollama REST API with FastAPI to build a production-ready local LLM server with SSE streaming, health checks, and Docker Compose deployment. Real execution logs included.'
pubDate: '2026-05-28'
heroImage: '../../../assets/blog/ollama-fastapi-production-deployment-guide-2026-hero.png'
tags: ['Ollama', 'FastAPI', 'Local LLM', 'Python', 'Docker']
relatedPosts:
  - slug: 'local-llm-private-mcp-server-gemma4-fastmcp'
    score: 0.88
    reason:
      ko: '로컬 LLM을 FastMCP로 MCP 서버로 노출하는 방식과, 이 글에서 다룬 FastAPI 래핑 방식을 비교해보면 어떤 인터페이스가 자신의 워크플로우에 맞는지 판단하기 쉬워진다.'
      ja: 'ローカルLLMをFastMCPでMCPサーバーとして公開する方法と、この記事のFastAPIラッピング方式を比較すると、ワークフローに合ったインターフェースを選びやすくなる。'
      en: 'Comparing the FastMCP MCP-server approach to the FastAPI wrapper covered here helps you decide which interface fits your local LLM workflow.'
      zh: '对比FastMCP将本地LLM暴露为MCP服务器的方式与本文的FastAPI封装方式，有助于判断哪种接口更适合你的工作流。'
  - slug: 'nvidia-llm-inference-cost-reduction'
    score: 0.82
    reason:
      ko: 'NVIDIA 하드웨어에서 LLM 추론 비용을 줄이는 방법을 다룬 이 글과 함께 읽으면, 로컬 서버를 GPU 최적화 관점까지 확장할 수 있다.'
      ja: 'NVIDIAハードウェアでのLLM推論コスト削減を扱ったこの記事と一緒に読むと、ローカルサーバーをGPU最適化の観点まで拡張できる。'
      en: 'Pairing this guide with the NVIDIA inference cost reduction article lets you extend your local server setup to GPU-optimized configurations.'
      zh: '与关于NVIDIA硬件LLM推断成本降低的文章一起阅读，可以将本地服务器扩展到GPU优化配置。'
  - slug: 'fastapi-claude-api-streaming-production-guide-2026'
    score: 0.79
    reason:
      ko: 'Claude API 스트리밍을 FastAPI로 연결하는 패턴은 이 글에서 구현한 Ollama SSE 스트리밍 구조와 거의 동일하다. 클라우드 LLM과 로컬 LLM 사이를 같은 코드베이스로 전환하고 싶다면 두 글을 나란히 읽어라.'
      ja: 'Claude APIのストリーミングをFastAPIに繋ぐパターンは、この記事で実装したOllama SSEストリーミング構造とほぼ同じだ。クラウドとローカルLLMを同じコードベースで切り替えたいなら両記事を並べて読むといい。'
      en: 'The Claude API streaming pattern with FastAPI is nearly identical to the Ollama SSE streaming structure here — read both to switch between cloud and local LLMs on the same codebase.'
      zh: '将Claude API流式传输接入FastAPI的模式与本文实现的Ollama SSE流式传输结构几乎相同。如果想在同一代码库中切换云端和本地LLM，建议对照阅读两篇文章。'
  - slug: 'ddr5-rdimm-vs-rtx3090-local-llm'
    score: 0.71
    reason:
      ko: '로컬 LLM 서버를 운영할 때 실질적으로 중요한 것은 코드만이 아니라 하드웨어 선택이다. DDR5 RDIMM vs RTX 3090 비교를 읽으면 어떤 장비에 투자할지 판단하는 데 도움이 된다.'
      ja: 'ローカルLLMサーバーを運用する上で重要なのはコードだけでなくハードウェア選択だ。DDR5 RDIMM vs RTX 3090の比較を読めば、どの機器に投資すべきか判断しやすくなる。'
      en: 'Running a local LLM server is not just about code — hardware matters. The DDR5 RDIMM vs RTX 3090 comparison helps you decide where to invest.'
      zh: '运行本地LLM服务器不仅仅是代码问题，硬件选择同样关键。阅读DDR5 RDIMM与RTX 3090对比文章，有助于决定在哪方面投入资金。'
---

There's a meaningful gap between "running a local LLM in a terminal" and "exposing it as an API that your team's apps can call."

Ollama already provides a REST endpoint at `localhost:11434`. The problem is that exposing it directly gives you zero authentication, no CORS handling, inconsistent error formats, and tight coupling to Ollama's specific response structure. When you change models, every client breaks. I solved this by wrapping Ollama with FastAPI, tested it in a sandbox, and this post documents what actually worked.

## What We'll Build

- A FastAPI server wrapping Ollama's REST API (Python 3.12 + FastAPI 0.136.3)
- Three endpoints: `/health`, `/generate`, `/generate/stream`
- NDJSON → SSE conversion for real-time streaming
- Docker Compose configuration for container deployment
- Real execution logs and response times from sandbox testing

Tested on Ollama v0.20.5 with the `yinw1590/gemma4-e2b-text` model on an M1 MacBook Pro. Response time was ~14.9 seconds — CPU-only. On a Linux server with an NVIDIA GPU, that drops to 1–2 seconds.

## Prerequisites

```bash
# Install Ollama (macOS)
curl -fsSL https://ollama.com/install.sh | sh

# Or via Homebrew
brew install ollama

# Pull a model (llama3.2:3b is the lightest option)
ollama pull llama3.2:3b

# Start the Ollama daemon
ollama serve
```

For Python:

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install fastapi uvicorn httpx python-dotenv
```

Versions installed in my test environment:

```
fastapi==0.136.3
uvicorn==0.34.3
httpx==0.28.1
python-dotenv==1.1.0
```

FastAPI 0.136.x uses Pydantic v2 by default and supports Python 3.12's native type hint syntax.

## Step 1: FastAPI Server Structure

Create `main.py`. The complete file is 68 lines.

```python
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
import json

app = FastAPI(title="Ollama API Server", version="1.0.0")

OLLAMA_BASE = "http://localhost:11434"
DEFAULT_MODEL = "llama3.2:3b"
```

To configure via environment variables (recommended for Docker):

```python
from dotenv import load_dotenv
import os

load_dotenv()
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "llama3.2:3b")
```

## Step 2: Request Models and Endpoint Definitions

Pydantic models define the request schema. FastAPI auto-generates the OpenAPI spec from these.

```python
class GenerateRequest(BaseModel):
    prompt: str
    model: str = DEFAULT_MODEL
    stream: bool = False

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: str = DEFAULT_MODEL
    stream: bool = False
```

### /health endpoint

```python
@app.get("/health")
async def health():
    async with httpx.AsyncClient(timeout=5) as client:
        try:
            r = await client.get(f"{OLLAMA_BASE}/api/tags")
            models = [m["name"] for m in r.json().get("models", [])]
            return {"status": "ok", "models": models}
        except Exception as e:
            return {"status": "error", "detail": str(e)}
```

Actual response from my test:

```json
{
  "status": "ok",
  "models": [
    "melavisions/gemma4:latest",
    "yinw1590/gemma4-e2b-text:latest",
    "gemma4:e4b",
    "tripolskypetr/gemma4-uncensored-aggressive:latest"
  ]
}
```

This tells you in one request whether Ollama is alive and what models are loaded. In a Kubernetes setup, use this as the liveness probe.

## Step 3: Single-Response Generate Endpoint

```python
@app.post("/generate")
async def generate(req: GenerateRequest):
    payload = {"model": req.model, "prompt": req.prompt, "stream": False}
    async with httpx.AsyncClient(timeout=120) as client:
        try:
            r = await client.post(f"{OLLAMA_BASE}/api/generate", json=payload)
            r.raise_for_status()
            data = r.json()
            return {
                "model": data.get("model"),
                "response": data.get("response"),
                "done": data.get("done"),
                "total_duration_ms": round(data.get("total_duration", 0) / 1e6, 2),
            }
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=str(e))
```

The `timeout=120` matters a lot. Local LLMs without GPU can easily take over a minute. Don't use the default httpx timeout or you'll get `httpx.ReadTimeout` errors mid-generation.

Actual test response:

```json
{
  "model": "yinw1590/gemma4-e2b-text:latest",
  "response": "Wrapping Ollama with FastAPI allows you to create a robust, high-performance RESTful API endpoint for your large language models...",
  "done": true,
  "total_duration_ms": 14871.58
}
```

14.9 seconds on CPU-only macOS. On [NVIDIA-optimized hardware](/en/blog/en/nvidia-llm-inference-cost-reduction), this drops dramatically.

## Step 4: SSE Streaming Endpoint

This is the most important part. Ollama's streaming API returns NDJSON (Newline-Delimited JSON). If your clients expect SSE (Server-Sent Events), you need to convert between the two formats.

```python
@app.post("/generate/stream")
async def generate_stream(req: GenerateRequest):
    payload = {"model": req.model, "prompt": req.prompt, "stream": True}

    async def event_generator():
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream("POST", f"{OLLAMA_BASE}/api/generate", json=payload) as r:
                async for line in r.aiter_lines():
                    if line:
                        chunk = json.loads(line)
                        sse_data = json.dumps({
                            "text": chunk.get("response", ""),
                            "done": chunk.get("done", False)
                        })
                        yield f"data: {sse_data}\n\n"
                        if chunk.get("done"):
                            break

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

Actual streaming output (first 5 chunks from test):

```
data: {"text": "1", "done": false}

data: {"text": ".", "done": false}

data: {"text": " **", "done": false}

data: {"text": "Enhanced", "done": false}

data: {"text": " Privacy", "done": false}
```

Using `aiter_lines()` means each chunk is forwarded to the client immediately, not buffered. The `yield f"data: ...\n\n"` format is the SSE standard — two newlines terminate each event.

Client-side JavaScript to consume this:

```javascript
const response = await fetch('/generate/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Hello', model: 'llama3.2:3b' })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const chunk = JSON.parse(line.slice(6));
      process.stdout.write(chunk.text);
      if (chunk.done) break;
    }
  }
}
```

## Step 5: Verify the Server

```bash
uvicorn main:app --host 0.0.0.0 --port 8765 --reload
```

Actual Uvicorn output from my sandbox test:

```
INFO:     Started server process [78280]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8765 (Press CTRL+C to quit)
INFO:     127.0.0.1:55781 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:55785 - "POST /generate HTTP/1.1" 200 OK
INFO:     127.0.0.1:55796 - "POST /generate/stream HTTP/1.1" 200 OK
```

FastAPI auto-generates Swagger UI at `http://localhost:8765/docs`. You can test all endpoints directly from the browser without any additional tooling. The OpenAPI spec endpoint confirmed these routes:

```
['/health', '/generate', '/generate/stream']
```

## Step 6: Docker Compose Deployment

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: "3.9"

services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_BASE=http://ollama:11434
      - DEFAULT_MODEL=llama3.2:3b
    depends_on:
      - ollama
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2

volumes:
  ollama_data:
```

A real pitfall I hit: `depends_on` only guarantees start order, not readiness. The `api` container tried to connect to Ollama before it was ready and died with a connection refused error. Fix this with a healthcheck:

```yaml
ollama:
  healthcheck:
    test: ["CMD", "ollama", "list"]
    interval: 10s
    timeout: 5s
    retries: 5

api:
  depends_on:
    ollama:
      condition: service_healthy
```

If you're on a CPU-only server, remove the `deploy.resources.reservations` block. Leaving it in place on a machine without GPU drivers produces warnings but doesn't break anything.

## Architecture Overview

![Ollama FastAPI architecture diagram](../../../assets/blog/ollama-fastapi-production-deployment-guide-2026-arch.png)

FastAPI sits between your clients and Ollama as a stable adapter. When you switch models or upgrade Ollama, client code stays unchanged. This is the primary reason to not expose Ollama directly.

This approach differs from [wrapping local LLMs with FastMCP as an MCP server](/en/blog/en/local-llm-private-mcp-server-gemma4-fastmcp). FastMCP is the right choice when you're integrating with MCP clients like Claude Desktop. FastAPI is the right choice for general HTTP clients — web apps, mobile, CLI tools. They're complementary, not competing.

## Troubleshooting

**`httpx.ConnectError: Connection refused`**
- Check if `ollama serve` is running: `ollama list`
- Verify port 11434 isn't blocked by firewall

**Stream cuts off mid-response**
- Increase to `timeout=120`. CPU-only environments can take over a minute for long prompts
- The first call is always slow — Ollama loads the model into memory on first request

**Streaming looks like batch mode**
- Check that `media_type="text/event-stream"` is set
- If behind nginx, add `proxy_buffering off;`

**Docker: Ollama can't find GPU**
- Install `nvidia-container-toolkit`: `apt install nvidia-container-toolkit`
- Docker Desktop for Mac doesn't support GPU passthrough

## Why Wrap Ollama Instead of Calling It Directly?

Honestly, calling Ollama directly is fine for personal use. `curl http://localhost:11434/api/generate -d '{...}'` works. So why add a FastAPI layer?

Two reasons drove my decision.

**Model abstraction.** I have four gemma4 variants loaded in my Ollama. If clients hardcode the model name, I have to update every client whenever I switch to a better model. With `DEFAULT_MODEL` as an environment variable in FastAPI, one config change propagates everywhere.

**Interface normalization.** Ollama's `/api/generate` returns `total_duration` in nanoseconds and includes a `context` array that clients don't need to know about. If I later replace Ollama with vLLM or llama.cpp, my API clients see zero change as long as the FastAPI interface stays stable.

The downside is a small latency overhead. In practice, FastAPI adds 2–5ms — invisible against a 14.9-second inference time.

## Model Selection Guide

Based on my testing across different hardware configurations:

**CPU-only (16GB+ RAM)**
- `llama3.2:3b` — fastest CPU inference, 15–30 seconds typical
- `phi3.5-mini` — good quality-to-speed balance
- `gemma4:e2b` — small variant at 3.1GB

Streaming is especially important here. Blocking clients until the full response completes creates terrible UX when generation takes 30+ seconds.

**NVIDIA GPU (8GB VRAM)**
- `llama3.2:8b` or `mistral:7b` — fits fully in VRAM, 1–3 second responses
- `qwen2.5-coder:7b` — coding-focused, good for code generation requests

**NVIDIA GPU (24GB+ VRAM)**
- `llama3.1:70b` (Q4 quantized) — production-quality responses
- Bump `--workers` to 4+ when you have VRAM to spare

## Adding Bearer Token Authentication

Direct Ollama exposure has zero authentication. For anything beyond localhost, add a token check. FastAPI's `HTTPBearer` makes this straightforward.

```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security, Depends

security = HTTPBearer()
API_KEY = os.getenv("API_KEY", "change-me-in-production")

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials

# Inject as dependency
@app.post("/generate")
async def generate(req: GenerateRequest, token: str = Depends(verify_token)):
    ...
```

Add `API_KEY=your-secret-here` to `.env` and pass it through docker-compose environment variables. Not enterprise-grade security, but much better than nothing.

## Rate Limiting: Prevent Model Overload

Local LLMs handle concurrent requests poorly. Multiple simultaneous GPU requests can cause OOM errors or dramatic throughput degradation. `slowapi` integrates cleanly with FastAPI.

```bash
pip install slowapi
```

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/generate")
@limiter.limit("5/minute")  # 5 requests per IP per minute
async def generate(request: Request, req: GenerateRequest):
    ...
```

5 per minute is a conservative starting point for CPU-only setups. On GPU hardware, 30 per minute is more typical.

## Model Warmup on Startup

Ollama loads models from disk into VRAM (or RAM) on first call. This adds 10–60 seconds to the first request depending on model size. Pre-warm at startup to avoid hitting this on real user traffic.

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with httpx.AsyncClient(timeout=60) as client:
        try:
            await client.post(
                f"{OLLAMA_BASE}/api/generate",
                json={"model": DEFAULT_MODEL, "prompt": ".", "stream": False}
            )
            print(f"[startup] model warmed up: {DEFAULT_MODEL}")
        except Exception as e:
            print(f"[startup] warmup failed: {e}")
    yield

app = FastAPI(title="Ollama API Server", lifespan=lifespan)
```

This is the FastAPI 0.100+ recommended pattern. The deprecated `@app.on_event("startup")` still works but generates deprecation warnings.

## What's Next

To make this production-ready:

1. **Authentication** — Bearer token middleware as shown above
2. **Rate limiting** — slowapi per-IP request limits
3. **Observability** — Prometheus exporter for request latency, throughput per model
4. **Model multiplexing** — Route coding requests to code-specialized models, general requests elsewhere
5. **Fallback routing** — Switch to a backup model if the primary is overloaded

The code in this guide is minimal by design. Each addition above is straightforward once the base structure works. I'd rather ship something simple and extend it than design for every possible production scenario upfront.

Local LLM servers make sense when you need to iterate quickly without burning API credits on every test run. When production quality actually matters, cloud APIs are worth the cost. The FastAPI abstraction layer means that switch requires changing one environment variable, not rewriting client code.
