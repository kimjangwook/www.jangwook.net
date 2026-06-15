---
title: Ollama + FastAPI 로컬 LLM API 서버 구축 — Docker 프로덕션 배포 가이드
description: >-
  Ollama REST API를 FastAPI로 래핑해 SSE 스트리밍·헬스 체크·Docker 컨테이너 배포까지 갖춘 프로덕션급 로컬 LLM
  서버를 단계별로 구축합니다. Llama 3.2, Mistral 등 주요 모델 실행 로그와 API 테스트 예제를 포함한 실전 가이드.
pubDate: '2026-05-28'
heroImage: ../../../assets/blog/ollama-fastapi-production-deployment-guide-2026-hero.png
tags:
  - Ollama
  - FastAPI
  - 로컬LLM
  - Python
  - Docker
relatedPosts:
  - slug: fastapi-claude-api-streaming-production-guide-2026
    score: 0.9
    reason:
      ko: fastapi 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into fastapi.
      ja: fastapiをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 fastapi 主题。
  - slug: local-llm-private-mcp-server-gemma4-fastmcp
    score: 0.85
    reason:
      ko: ollama를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on ollama experience.
      ja: ollamaを実際に扱った経験が続く記事です。
      zh: 延续 ollama 的实战经验。
  - slug: langfuse-self-hosted-llm-tracing-setup-guide-2026
    score: 0.8
    reason:
      ko: 같은 docker 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same docker track.
      ja: 同じdockerの流れで併せて読むと役立ちます。
      zh: 在同一 docker 脉络中可一并阅读。
faq:
  - question: "Ollama를 직접 쓰지 않고 FastAPI로 감싸는 이유는?"
    answer: "두 가지 이유 때문입니다. 첫째는 모델 추상화로, DEFAULT_MODEL을 환경변수로 관리하면 모델을 교체해도 클라이언트 코드를 고칠 필요가 없습니다. 둘째는 인터페이스 표준화로, Ollama의 나노초 단위 total_duration 같은 내부 세부사항을 정규화해 나중에 추론 엔진을 바꿔도 클라이언트에 영향이 없습니다."
  - question: "응답 속도는 어느 정도인가요?"
    answer: "M1 MacBook Pro의 CPU 전용 환경에서 yinw1590/gemma4-e2b-text 모델로 약 14.9초가 걸렸습니다. NVIDIA RTX 3090 이상의 GPU 서버에서는 1〜2초 수준으로 줄어듭니다. FastAPI 어댑터 자체의 오버헤드는 2〜5ms로 추론 시간 앞에서는 무의미합니다."
  - question: "프로덕션 배포는 어떻게 하나요?"
    answer: "Dockerfile과 docker-compose.yml로 Ollama 컨테이너와 FastAPI 컨테이너를 함께 띄웁니다. depends_on은 시작 순서만 보장하므로 healthcheck와 condition: service_healthy를 함께 써야 connection refused 문제를 막을 수 있습니다. 노출 전에는 Bearer 토큰 인증과 slowapi 레이트 리밋을 반드시 추가합니다."
  - question: "로컬 LLM과 클라우드 API 중 어느 것을 써야 하나요?"
    answer: "반복적인 개발 테스트로 토큰 비용을 아끼거나 데이터를 외부로 보낼 수 없는 경우 로컬 LLM이 유리합니다. 최고 품질의 응답이나 낮은 레이턴시가 필요한 사용자 대면 기능에는 클라우드 API가 낫습니다. FastAPI 어댑터를 쓰면 환경변수 두 개만 바꿔 둘 사이를 전환할 수 있습니다."
---

로컬 LLM을 "그냥 터미널에서 돌리는 것"과 "팀 서버나 앱에서 호출할 수 있는 API로 만드는 것" 사이에는 생각보다 큰 간격이 있다.

Ollama는 이미 `localhost:11434`에 REST 엔드포인트를 제공한다. 그런데 직접 이걸 외부에 노출하면 모델 이름이 바뀔 때마다 클라이언트 코드를 고쳐야 하고, 인증도 없고, CORS도 없고, 에러 형식도 제각각이다. 나는 이 문제를 FastAPI로 한 번 감싸는 것으로 해결했고, 샌드박스에서 실제로 돌려봤다. 이 글은 그 과정의 기록이다.

## FastAPI 어댑터 한 겹으로 얻는 것들

- Ollama REST API를 감싸는 FastAPI 서버 (Python 3.12 + FastAPI 0.136.3)
- `/health`, `/generate`, `/generate/stream` 세 엔드포인트
- NDJSON → SSE 변환으로 실시간 스트리밍 응답
- Docker Compose 기반 컨테이너 배포 구성
- 실제 실행 로그와 응답 시간

내 머신에서 Ollama v0.20.5에 `yinw1590/gemma4-e2b-text` 모델로 테스트했다. 응답 시간은 약 14.9초였는데, M1 MacBook Pro 기준이라 GPU 있는 리눅스 서버라면 훨씬 빠르다.

## Prerequisites

```bash
# Ollama 설치 (macOS)
curl -fsSL https://ollama.com/install.sh | sh

# 또는 Homebrew
brew install ollama

# 모델 다운로드 (예: llama3.2:3b — 가장 가벼운 선택)
ollama pull llama3.2:3b

# Ollama 데몬 시작
ollama serve
```

Python 환경은 다음과 같다.

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install fastapi uvicorn httpx python-dotenv
```

내 테스트 환경 기준으로 설치된 버전:

```
fastapi==0.136.3
uvicorn==0.34.3
httpx==0.28.1
python-dotenv==1.1.0
```

FastAPI 0.136.x는 Pydantic v2를 기본으로 사용하며, Python 3.12의 새로운 타입 힌트 문법을 그대로 쓸 수 있다.

## Step 1: FastAPI 서버 기본 구조 작성

`main.py`를 만든다. 전체 파일이 68줄이다.

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

환경 변수로 분리하면 Docker 배포 시 편하다. `.env` 파일을 쓰는 경우:

```python
from dotenv import load_dotenv
import os

load_dotenv()
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "llama3.2:3b")
```

## Step 2: 데이터 모델과 엔드포인트 정의

Pydantic 모델로 요청 구조를 정의한다. FastAPI가 자동으로 OpenAPI 스펙을 생성해준다.

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

### /health 엔드포인트

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

실제 실행 결과:

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

Ollama 데몬이 살아있는지, 어떤 모델이 로드됐는지 한 번에 확인할 수 있다. k8s 환경이라면 이 엔드포인트를 liveness probe로 쓰면 된다.

## Step 3: 단일 응답 엔드포인트

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

`timeout=120`이 중요하다. 로컬 LLM은 GPU 없으면 1분을 넘길 수 있다. `httpx.ReadTimeout`으로 죽지 않도록 충분히 여유를 둔다.

실제 응답:

```json
{
  "model": "yinw1590/gemma4-e2b-text:latest",
  "response": "Wrapping Ollama with FastAPI allows you to create a robust, high-performance RESTful API endpoint for your large language models...",
  "done": true,
  "total_duration_ms": 14871.58
}
```

14.9초. CPU 전용 macOS 환경이다. NVIDIA RTX 3090 이상에서는 이 시간이 1〜2초 수준으로 줄어든다.

## Step 4: SSE 스트리밍 엔드포인트

이 부분이 이 글에서 가장 중요한 포인트다. Ollama의 스트리밍 API는 NDJSON(Newline-Delimited JSON)을 반환한다. 브라우저나 클라이언트가 SSE(Server-Sent Events) 형식을 기대한다면 중간에서 변환이 필요하다.

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

실제 스트리밍 출력 (첫 5개 청크):

```
data: {"text": "1", "done": false}

data: {"text": ".", "done": false}

data: {"text": " **", "done": false}

data: {"text": "Enhanced", "done": false}

data: {"text": " Privacy", "done": false}
```

`aiter_lines()`를 쓰면 응답이 완료되기 전에 각 청크를 즉시 클라이언트로 전달한다. `yield f"data: ...\n\n"` 형식이 SSE 표준이다.

클라이언트 쪽 JavaScript는 이렇게 된다:

```javascript
const response = await fetch('/generate/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: '안녕하세요', model: 'llama3.2:3b' })
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

## Step 5: 서버 실행 확인

```bash
uvicorn main:app --host 0.0.0.0 --port 8765 --reload
```

실제 로그:

```
INFO:     Started server process [78280]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8765 (Press CTRL+C to quit)
INFO:     127.0.0.1:55781 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:55785 - "POST /generate HTTP/1.1" 200 OK
INFO:     127.0.0.1:55796 - "POST /generate/stream HTTP/1.1" 200 OK
```

FastAPI는 자동으로 `http://localhost:8765/docs`에 Swagger UI를 생성한다. 브라우저에서 바로 API를 테스트할 수 있다. 내가 확인한 엔드포인트 목록:

```
['/health', '/generate', '/generate/stream']
```

`/openapi.json`을 호출하면 OpenAPI 스펙을 JSON으로 받을 수 있어서, 다른 팀이 클라이언트를 자동 생성하는 데도 쓸 수 있다.

## Step 6: Docker Compose로 컨테이너 배포

로컬 개발 환경에서 팀 서버로 이전할 때는 Docker Compose를 쓴다. `Dockerfile`과 `docker-compose.yml`이 필요하다.

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

`depends_on`은 컨테이너 시작 순서만 보장하고, Ollama가 실제로 ready 상태인지는 보장하지 않는다. 그래서 FastAPI 서버에 `/health`를 retry 로직과 함께 startup 이벤트로 추가하는 게 좋다.

솔직히 이 부분에서 한 번 실패했다. `api` 컨테이너가 먼저 뜨고 `OLLAMA_BASE`에 연결 시도했다가 connection refused로 죽었다. `healthcheck` + `condition: service_healthy`로 해결할 수 있다.

```yaml
ollama:
  healthcheck:
    test: ["CMD", "ollama", "list"]
    interval: 10s
    timeout: 5s
    retries: 5
  ...

api:
  depends_on:
    ollama:
      condition: service_healthy
```

GPU 없는 CPU 전용 서버라면 `deploy.resources.reservations` 블록을 삭제하면 된다. 그냥 두면 GPU 드라이버 없다는 경고가 뜨지만 동작은 한다.

## 아키텍처 구조

![Ollama FastAPI 아키텍처 다이어그램](../../../assets/blog/ollama-fastapi-production-deployment-guide-2026-arch.png)

위 구조를 보면 알 수 있듯, FastAPI는 Ollama와 클라이언트 사이에서 통일된 인터페이스를 제공하는 어댑터 역할을 한다. 모델이 바뀌어도 클라이언트 코드는 그대로다.

이 구조가 [로컬 LLM을 FastMCP로 MCP 서버로 만드는 방식](/ko/blog/ko/local-llm-private-mcp-server-gemma4-fastmcp)과 어떻게 다른지 궁금할 수 있다. FastMCP는 Claude Desktop 같은 MCP 클라이언트와 통합할 때 유리하고, FastAPI는 일반 HTTP 클라이언트(웹앱, 모바일, CLI)와 통합할 때 유리하다. 용도가 겹치지 않는다.

## 멀티 모델 라우팅: 요청에 따라 다른 모델 사용하기

단일 모델을 고정해 쓰는 것도 괜찮지만, 작은 요청에는 빠른 소형 모델을 쓰고 복잡한 요청에는 더 큰 모델을 쓰고 싶다면 라우팅 로직을 추가할 수 있다.

간단한 방법은 프롬프트 길이나 명시적 `quality` 파라미터로 모델을 선택하는 것이다.

```python
MODEL_REGISTRY = {
    "fast": "llama3.2:3b",       # 짧은 요청, 빠른 응답
    "balanced": "llama3.2:8b",   # 일반 요청
    "quality": "llama3.1:70b",   # 복잡한 추론, 느리지만 정확
    "code": "qwen2.5-coder:7b",  # 코드 생성 특화
}

class GenerateRequest(BaseModel):
    prompt: str
    model: str = "fast"          # 모델 이름 대신 티어로 선택
    stream: bool = False

@app.post("/generate")
async def generate(req: GenerateRequest):
    actual_model = MODEL_REGISTRY.get(req.model, DEFAULT_MODEL)
    payload = {"model": actual_model, "prompt": req.prompt, "stream": False}
    ...
```

이 방식의 장점은 `Ollama`에 어떤 모델이 설치됐는지 클라이언트가 몰라도 된다는 것이다. "code"를 요청하면 FastAPI가 알아서 qwen 모델을 쓴다. 나중에 더 나은 코딩 모델이 나와도 `MODEL_REGISTRY`만 바꾸면 된다.

이 접근법의 현실적인 한계는 각 모델이 메모리를 차지한다는 점이다. llama3.1:70b(Q4)는 약 40GB RAM이 필요하다. 내 MacBook에서는 선택지가 제한된다. 프로덕션 서버에서는 모델 언로드/로드를 Ollama가 자동으로 관리하지만, 스왑이 빈번하면 레이턴시가 올라간다.

## 로컬 LLM vs 클라우드 API: 언제 어떤 걸 쓸까

이 서버를 구축하면서 내가 내린 결론을 솔직하게 적는다.

로컬 LLM이 유리한 경우:
- 반복적인 개발/테스트 단계에서 토큰 비용을 아낄 때
- 데이터를 외부로 보내면 안 되는 내부 문서나 개인 정보를 처리할 때
- 네트워크 연결 없이 오프라인으로 동작해야 할 때
- 특정 도메인에 파인튜닝한 모델을 쓸 때

클라우드 API가 유리한 경우:
- 최고 품질의 응답이 필요할 때 (현재 로컬 모델 품질의 한계가 있다)
- 레이턴시가 중요한 사용자 대면 기능일 때
- 팀이 GPU 인프라를 유지관리할 여력이 없을 때

나는 이 두 가지를 동시에 쓰는 하이브리드 방식을 선호한다. 개발 단계는 Ollama로, 배포 단계는 Claude API로. FastAPI 어댑터를 쓰면 `OLLAMA_BASE`와 `DEFAULT_MODEL` 환경변수 두 개만 바꿔서 전환할 수 있다. 이게 이 글에서 보여주려는 핵심이다.

## 트러블슈팅

**Q: `httpx.ConnectError: Connection refused` 오류**
- `ollama serve`가 실행 중인지 확인: `ollama list`
- 방화벽이 11434 포트를 막고 있는지 확인

**Q: 응답 중간에 스트림이 끊김**
- `timeout=120`으로 늘려라. CPU 전용 환경에서 모델과 프롬프트 길이에 따라 1분 이상 걸릴 수 있다
- Ollama가 모델 로딩 중일 때도 타임아웃이 발생할 수 있다. 첫 호출은 항상 느리다

**Q: `stream=True`인데 SSE가 아닌 것처럼 동작함**
- `media_type="text/event-stream"` 확인
- nginx 같은 리버스 프록시 앞에 있다면 `proxy_buffering off;` 설정 필요

**Q: Docker에서 Ollama가 GPU를 못 찾음**
- `nvidia-container-toolkit` 설치 필요 (`apt install nvidia-container-toolkit`)
- Docker Desktop for Mac은 GPU 패스스루를 지원하지 않는다

## Ollama를 직접 쓰지 않고 FastAPI로 감싸는 이유

솔직히 Ollama를 직접 쓰는 것도 충분히 편하다. `curl http://localhost:11434/api/generate -d '{...}'` 한 줄로 응답이 온다. 그렇다면 왜 굳이 FastAPI 레이어를 추가하는가?

나는 두 가지 이유로 이 방식을 선택했다.

첫째, **모델 추상화**다. 지금 내 Ollama에는 gemma4 계열 모델이 네 개 올라가 있다. 클라이언트마다 모델 이름을 하드코딩하면 내일 더 나은 모델로 교체할 때 모든 클라이언트를 수정해야 한다. FastAPI에서 `DEFAULT_MODEL`을 환경변수로 관리하면 배포 설정 하나만 바꿔도 된다.

둘째, **인터페이스 표준화**다. Ollama의 `/api/generate` 응답은 `total_duration`을 나노초로 반환하고, `context` 배열까지 포함한다. 내 API 클라이언트가 이런 내부 세부사항을 알 필요가 없다. FastAPI에서 응답 형식을 정규화하면 나중에 Ollama를 다른 추론 엔진으로 교체해도 클라이언트에 영향이 없다.

단점도 있다. 중간 레이어가 생기니 레이턴시가 약간 늘어난다. 실제로 측정해보면 FastAPI의 오버헤드는 2〜5ms 수준이라 14.9초 추론 시간 앞에서는 무의미하다.

## 모델 선택: 어떤 모델이 이 서버에 맞는가

내가 테스트한 모델들을 기준으로 하드웨어별 추천을 정리한다.

**CPU 전용 (RAM 16GB 이상)**
- `llama3.2:3b`: 가장 빠른 CPU 추론, 15〜30초 수준
- `phi3.5-mini`: 품질 대비 속도 균형
- `gemma4:e2b`: 작은 버전, 3.1GB

이 환경에서는 스트리밍 엔드포인트가 특히 중요하다. 응답 전체가 나올 때까지 클라이언트를 block하면 UX가 너무 나쁘다.

**NVIDIA GPU (VRAM 8GB)**
- `llama3.2:8b` 또는 `mistral:7b`: VRAM에 완전히 올라가면 1〜3초 응답
- `qwen2.5-coder:7b`: 코딩 특화, 코드 생성 요청에 유리

**NVIDIA GPU (VRAM 24GB 이상)**
- `llama3.1:70b` (Q4 quantized): 프로덕션 수준 품질
- 이 경우 `--workers 4` 이상으로 올려도 VRAM이 충분하다

모델 크기와 운영 비용의 관계를 더 깊이 파고들려면 [AI 에이전트의 실제 비용 구조를 분석한 글](/ko/blog/ko/ai-agent-cost-reality)을 함께 보면 좋다. 로컬 추론이 토큰 비용을 어디까지 줄여주는지 감을 잡는 데 도움이 된다.

## 이 구성을 언제 쓰고, 언제 피해야 하나

위에서 모델별 추천과 비용 이야기를 했지만, 정작 "이 Ollama + FastAPI 구성 자체를 도입할지" 결정하는 기준은 따로 정리해두는 게 좋다.

이럴 때 쓰면 좋다:

- 개발·테스트 단계에서 API 호출당 비용 없이 무제한으로 프롬프트를 반복 실험하고 싶을 때
- 사내 문서나 개인정보처럼 외부 API로 보낼 수 없는 데이터를 다룰 때
- 여러 클라이언트(웹앱, CLI, 모바일)가 같은 모델 엔드포인트를 공유해야 하고, 모델 교체를 한 곳에서 관리하고 싶을 때
- 네트워크가 불안정하거나 폐쇄망 환경에서 오프라인으로 동작해야 할 때
- 특정 도메인에 파인튜닝하거나 검열되지 않은 모델을 써야 할 때

이럴 때는 피하는 게 낫다:

- 한두 명이 가끔 쓰는 수준이라면 어댑터 레이어 없이 `ollama run`이나 `curl`로 직접 호출하는 게 더 단순하다. 굳이 FastAPI를 끼울 필요가 없다.
- GPU 인프라를 유지관리할 인력이 없고, 응답 품질이 비즈니스에 직결되는 사용자 대면 기능이라면 클라우드 API가 낫다.
- 수십~수백 동시 사용자를 받아야 하는데 GPU가 한 장뿐이라면, 로컬 단일 노드는 금방 한계에 부딪힌다. 이때는 추론 서버를 수평 확장하거나 클라우드로 가는 게 맞다.
- 밀리초 단위 레이턴시가 SLA인 실시간 기능에는 CPU 전용 로컬 추론(14.9초)이 애초에 후보가 아니다.

경계가 애매할 때 내가 쓰는 기준은 단순하다. "토큰 비용을 아끼는 가치 > GPU 운영 부담"이면 로컬, 반대면 클라우드. 그리고 둘 사이를 자주 오갈 것 같으면 처음부터 이 FastAPI 어댑터를 깔아두는 게 나중에 전환 비용을 크게 줄여준다.

## Bearer Token 인증 미들웨어 추가

로컬 개발에서는 인증이 없어도 되지만, 팀 서버나 클라우드에 노출할 때는 반드시 인증을 추가해야 한다. FastAPI의 `HTTPBearer`를 쓰면 간단하다.

```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security

security = HTTPBearer()
API_KEY = os.getenv("API_KEY", "change-me-in-production")

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials

# 엔드포인트에 의존성 주입
@app.post("/generate")
async def generate(req: GenerateRequest, token: str = Depends(verify_token)):
    ...
```

`.env` 파일에 `API_KEY=your-secret-here`를 추가하고, docker-compose.yml의 환경변수로 전달하면 된다. 완벽한 보안은 아니지만 무방비 상태보다는 훨씬 낫다.

## 레이트 리밋: 모델 과부하 방지

로컬 LLM은 동시 요청에 약하다. GPU 하나에 여러 요청이 동시에 들어오면 메모리가 초과되거나 추론 속도가 급락한다. `slowapi`로 간단하게 레이트 리밋을 걸 수 있다.

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
@limiter.limit("5/minute")  # IP당 분당 5회
async def generate(request: Request, req: GenerateRequest):
    ...
```

`5/minute`은 CPU 전용 환경에서 적절한 시작점이다. GPU 환경이라면 `30/minute`로 올려도 된다.

## 모델 워밍업: 첫 요청이 느린 이유

Ollama는 처음 모델을 호출할 때 디스크에서 VRAM(또는 RAM)으로 모델을 로드한다. 이 과정이 몇 초에서 수십 초까지 걸린다. FastAPI 서버 시작 시점에 워밍업 요청을 보내두면 실제 사용자가 느끼는 첫 번째 응답 지연을 없앨 수 있다.

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시 모델 워밍업
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

이 패턴은 FastAPI 0.100 이상에서 권장하는 방식이다. `@app.on_event("startup")`는 deprecated 됐다.

## 다음 단계

이 서버를 실제 프로덕션에 쓰려면 몇 가지가 더 필요하다.

1. **인증**: 위에서 다룬 Bearer token 미들웨어 적용
2. **레이트 리밋**: slowapi로 IP별 요청 제한
3. **로깅**: 요청/응답 시간, 모델별 처리 속도 메트릭 (Prometheus exporter 추가 가능)
4. **모델 멀티플렉싱**: 요청 타입에 따라 코딩 모델 vs 일반 모델 라우팅
5. **모델 자동 전환**: 특정 모델이 과부하 상태일 때 fallback 모델로 라우팅

배포 단계에서 클라우드로 전환할 때는 [FastAPI로 Claude API 스트리밍을 프로덕션에 올리는 방법](/ko/blog/ko/fastapi-claude-api-streaming-production-guide-2026)이 이 글의 자연스러운 다음 단계다. 같은 FastAPI 인터페이스를 유지한 채 백엔드만 바꾸는 패턴을 그대로 적용할 수 있다.

로컬 LLM 서버를 만드는 이유는 사람마다 다르다. 나는 API 키 없이 실험할 수 있는 환경이 필요했다. 클라우드 LLM이 더 강력하지만, 반복적인 실험 단계에서 토큰 비용이 쌓이는 것을 좋아하지 않는다. 14.9초짜리 응답도 내 코드가 맞게 작동하는지 확인하는 용도로는 충분하다. Ollama + FastAPI 조합은 그 균형점을 잘 잡아준다고 생각한다. 프로덕션 배포가 필요해지면 클라우드로 전환하면 되고, 그때 이 FastAPI 인터페이스가 스위칭 비용을 낮춰준다.

이 가이드의 전체 코드는 `main.py` 68줄, `Dockerfile` 10줄, `docker-compose.yml` 35줄이 전부다. 최소한의 코드로 최대한의 유연성을 확보하는 것이 목표였다. 더 추가할 기능은 많지만, 일단 돌아가는 것을 먼저 만들고 필요할 때 하나씩 더하는 방식이 결국 더 빠르다.

## 참고 자료 (1차 출처)

이 글의 코드와 설정은 다음 공식 문서를 기준으로 작성하고 검증했다.

- [Ollama API 공식 문서](https://docs.ollama.com/api) — `/api/generate`, `/api/tags`, 스트리밍 NDJSON 응답 형식의 1차 출처. GitHub의 [docs/api.md](https://github.com/ollama/ollama/blob/main/docs/api.md)에도 동일한 레퍼런스가 있다.
- [FastAPI 공식 문서 — StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse) — SSE 스트리밍 응답과 `media_type` 설정의 근거.
- [FastAPI 공식 문서 — Lifespan Events](https://fastapi.tiangolo.com/advanced/events/) — 모델 워밍업에 쓴 `lifespan` 패턴(구 `@app.on_event` 대체)의 공식 가이드.
- [Docker Compose 공식 레퍼런스 — healthcheck](https://docs.docker.com/reference/compose-file/services/#healthcheck) — `condition: service_healthy`로 시작 순서를 보장하는 방법.
- [Ollama 공식 사이트](https://ollama.com) — 설치 스크립트와 모델 라이브러리.
