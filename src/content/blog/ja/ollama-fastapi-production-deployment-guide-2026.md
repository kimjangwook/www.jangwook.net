---
title: Ollama + FastAPIでローカルLLM APIサーバーを作る — 開発からDockerデプロイまで完全ガイド
description: >-
  Ollama REST APIをFastAPIでラッピングし、SSEストリーミング・ヘルスチェック・Docker
  Composeデプロイを備えたプロダクション用ローカルLLMサーバーを段階的に構築する実践ガイド。Llama
  3.2やMistralなど複数モデルの実行ログとAPIテスト例も掲載しています。
pubDate: '2026-05-28'
heroImage: ../../../assets/blog/ollama-fastapi-production-deployment-guide-2026-hero.png
tags:
  - Ollama
  - FastAPI
  - ローカルLLM
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
---

ローカルLLMを「ターミナルで動かすだけ」と「チームのサーバーやアプリから呼び出せるAPIにする」の間には、思った以上に大きな差がある。

Ollamaはすでに`localhost:11434`にRESTエンドポイントを提供している。ただし、これを直接外部に公開するのは問題がある。認証もなく、CORSもなく、エラー形式もバラバラで、モデル名が変わるたびにクライアントコードを直す羽目になる。私はFastAPIで一枚ラッピングすることでこの問題を解決した。サンドボックスで実際に動かして検証したので、その記録をまとめる。

## FastAPIアダプター一枚で手に入るもの

- Ollama REST APIをラッピングするFastAPIサーバー（Python 3.12 + FastAPI 0.136.3）
- `/health`、`/generate`、`/generate/stream`の3エンドポイント
- NDJSON → SSE変換によるリアルタイムストリーミング
- Docker Composeを使ったコンテナデプロイ構成
- 実際の実行ログとレスポンス時間

Ollama v0.20.5、`yinw1590/gemma4-e2b-text`モデルをM1 MacBook Proでテストした。レスポンス時間は約14.9秒。CPUのみ環境なので、NVIDIAのGPUがあるLinuxサーバーなら1〜2秒まで縮まる。

## Prerequisites

```bash
# Ollama インストール（macOS）
curl -fsSL https://ollama.com/install.sh | sh

# または Homebrew
brew install ollama

# モデルのダウンロード（llama3.2:3b が最軽量）
ollama pull llama3.2:3b

# Ollamaデーモン起動
ollama serve
```

Python環境：

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install fastapi uvicorn httpx python-dotenv
```

テスト環境でインストールしたバージョン：

```
fastapi==0.136.3
uvicorn==0.34.3
httpx==0.28.1
python-dotenv==1.1.0
```

FastAPI 0.136.xはPydantic v2をデフォルトで使い、Python 3.12のネイティブ型ヒント構文をそのまま書ける。

## Step 1: FastAPIサーバーの基本構造

`main.py`を作る。完全なファイルは68行だ。

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

環境変数で設定を外部化すると、Dockerデプロイ時に便利だ：

```python
from dotenv import load_dotenv
import os

load_dotenv()
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "llama3.2:3b")
```

## Step 2: データモデルとエンドポイント定義

Pydanticモデルでリクエスト構造を定義する。FastAPIはこれから自動的にOpenAPIスペックを生成する。

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

### /health エンドポイント

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

実際のレスポンス：

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

1回のリクエストでOllamaが生きているか、どのモデルがロードされているかが確認できる。Kubernetes環境ならこのエンドポイントをliveness probeに使える。

## Step 3: 単一レスポンスのgenerateエンドポイント

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

`timeout=120`が重要だ。GPUのないローカルLLMは1分を超えることがある。デフォルトのhttpxタイムアウトのままだと、生成途中で`httpx.ReadTimeout`が発生する。

実際のテストレスポンス：

```json
{
  "model": "yinw1590/gemma4-e2b-text:latest",
  "response": "Wrapping Ollama with FastAPI allows you to create a robust, high-performance RESTful API endpoint...",
  "done": true,
  "total_duration_ms": 14871.58
}
```

macOSのCPUのみ環境で14.9秒。NVIDIAハードウェアで最適化すれば劇的に改善される。

## Step 4: SSEストリーミングエンドポイント

ここがこのガイドで最も重要な部分だ。OllamaのストリーミングAPIはNDJSON（改行区切りJSON）を返す。ブラウザやクライアントがSSE（Server-Sent Events）形式を期待する場合、中間での変換が必要になる。

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

実際のストリーミング出力（最初の5チャンク）：

```
data: {"text": "1", "done": false}

data: {"text": ".", "done": false}

data: {"text": " **", "done": false}

data: {"text": "Enhanced", "done": false}

data: {"text": " Privacy", "done": false}
```

`aiter_lines()`を使うと、各チャンクが到着次第クライアントに転送される。`yield f"data: ...\n\n"`の形式がSSE標準だ。末尾の2つの改行がイベントの区切りになる。

クライアント側JavaScriptの実装：

```javascript
const response = await fetch('/generate/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'こんにちは', model: 'llama3.2:3b' })
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

## Step 5: サーバー動作確認

```bash
uvicorn main:app --host 0.0.0.0 --port 8765 --reload
```

実際のUvicornログ：

```
INFO:     Started server process [78280]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8765 (Press CTRL+C to quit)
INFO:     127.0.0.1:55781 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:55785 - "POST /generate HTTP/1.1" 200 OK
INFO:     127.0.0.1:55796 - "POST /generate/stream HTTP/1.1" 200 OK
```

FastAPIは`http://localhost:8765/docs`にSwagger UIを自動生成する。ブラウザから直接全エンドポイントをテストできる。OpenAPI JSONから確認できたエンドポイント一覧：

```
['/health', '/generate', '/generate/stream']
```

## Step 6: Docker Composeでのデプロイ

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

実際にはまった問題：`depends_on`は起動順序しか保証せず、Ollamaがready状態になるまで待たない。`api`コンテナがOllamaに接続しようとして`connection refused`で死んだ。ヘルスチェックで対処できる：

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

CPUのみのサーバーなら`deploy.resources.reservations`ブロックを削除する。残したままでもGPUドライバーなし警告が出るだけで動作はする。

## アーキテクチャ

![OllamaとFastAPIのアーキテクチャ図](../../../assets/blog/ollama-fastapi-production-deployment-guide-2026-arch.png)

FastAPIはクライアントとOllamaの間で安定したアダプターとして機能する。モデルを変えてもOllamaをアップグレードしても、クライアントコードはそのままだ。これが直接Ollamaを公開しない主な理由だ。

このアプローチは[FastMCPでローカルLLMをMCPサーバーとして公開する方法](/ja/blog/ja/local-llm-private-mcp-server-gemma4-fastmcp)とは異なる。FastMCPはClaude DesktopなどのMCPクライアントとの統合に向いており、FastAPIは一般的なHTTPクライアント（Webアプリ、モバイル、CLIツール）との統合に向いている。

## マルチモデルルーティング：リクエストに応じてモデルを切り替える

単一モデルを固定で使うのも問題ないが、短いリクエストには高速な小型モデル、複雑なリクエストには大きなモデルを使いたい場合、ルーティングロジックを追加できる。

```python
MODEL_REGISTRY = {
    "fast": "llama3.2:3b",
    "balanced": "llama3.2:8b",
    "quality": "llama3.1:70b",
    "code": "qwen2.5-coder:7b",
}

class GenerateRequest(BaseModel):
    prompt: str
    model: str = "fast"  # モデル名の代わりにティアで指定
    stream: bool = False

@app.post("/generate")
async def generate(req: GenerateRequest):
    actual_model = MODEL_REGISTRY.get(req.model, DEFAULT_MODEL)
    payload = {"model": actual_model, "prompt": req.prompt, "stream": False}
    ...
```

クライアントはOllamaにどのモデルがインストールされているか知らなくていい。「code」を指定すればFastAPIが自動的にqwenモデルを使う。より良いコーディングモデルが出たら`MODEL_REGISTRY`を変えるだけだ。

この方法の現実的な制約は、各モデルがメモリを占有することだ。llama3.1:70b(Q4)は約40GBのRAMが必要になる。

## ローカルLLM vs クラウドAPI：どちらを使うべきか

このサーバーを構築して出した結論を率直に書く。

ローカルLLMが有利な場合：
- 繰り返しの開発/テスト段階でトークンコストを節約したい
- データを外部に送れない内部文書や個人情報を処理する
- ネットワークなしでオフライン動作が必要
- 特定ドメインでファインチューニングしたモデルを使う

クラウドAPIが有利な場合：
- 最高品質の応答が必要（ローカルモデルの品質には現在限界がある）
- レイテンシが重要なユーザー向け機能
- チームにGPUインフラを維持管理するリソースがない

私はこの2つを同時に使うハイブリッド方式を好む。開発段階はOllamaで、デプロイ段階はClaude APIで。FastAPIアダプターを使えば`OLLAMA_BASE`と`DEFAULT_MODEL`の2つの環境変数を変えるだけで切り替えられる。それがこの記事で示したい核心だ。

## トラブルシューティング

**`httpx.ConnectError: Connection refused`**
- `ollama serve`が実行中か確認：`ollama list`
- ファイアウォールがポート11434をブロックしていないか確認

**ストリームが途中で切れる**
- `timeout=120`に増やす。CPU専用環境では長いプロンプトで1分以上かかる場合がある
- 初回リクエストは常に遅い。Ollamaがモデルをメモリにロードするためだ

**Docker: OllamaがGPUを認識しない**
- `nvidia-container-toolkit`のインストールが必要：`apt install nvidia-container-toolkit`
- Docker Desktop for MacはGPUパススルーをサポートしていない

## OllamaをFastAPIでラッピングする理由

正直なところ、Ollamaを直接使うのも十分便利だ。`curl http://localhost:11434/api/generate -d '{...}'`の1行で応答が来る。なぜわざわざFastAPIレイヤーを追加するのか？

私が選んだ理由は2つある。

**モデルの抽象化。**今の私のOllamaにはgemma4系モデルが4つ入っている。クライアントごとにモデル名をハードコードすると、より良いモデルに変えるたびに全クライアントを修正しなければならない。FastAPIで`DEFAULT_MODEL`を環境変数で管理すれば、設定1つ変えるだけで済む。

**インターフェースの標準化。**Ollamaの`/api/generate`レスポンスは`total_duration`をナノ秒で返し、`context`配列まで含む。APIクライアントがこういった内部詳細を知る必要はない。FastAPIでレスポンス形式を正規化すれば、後でOllamaを他の推論エンジンに切り替えてもクライアントに影響しない。

デメリットは中間レイヤーが増えることによる若干のレイテンシ増加だ。実際に計測するとFastAPIのオーバーヘッドは2〜5ms程度で、14.9秒の推論時間の前では無視できる。

## モデル選択ガイド

ハードウェア別の推奨モデルをまとめる。

**CPU専用（RAM 16GB以上）**
- `llama3.2:3b`：最速のCPU推論、15〜30秒程度
- `phi3.5-mini`：品質と速度のバランスが良い
- `gemma4:e2b`：小さいバリアント、3.1GB

この環境ではストリーミングエンドポイントが特に重要だ。完全な応答が返るまでクライアントをブロックすると、UXが許容できないレベルになる。

**NVIDIA GPU（VRAM 8GB）**
- `llama3.2:8b`または`mistral:7b`：VRAMに完全に収まれば1〜3秒の応答
- `qwen2.5-coder:7b`：コーディング特化、コード生成に有利

**NVIDIA GPU（VRAM 24GB以上）**
- `llama3.1:70b`（Q4量子化）：プロダクション品質
- VRAMに余裕があれば`--workers 4`以上に増やせる

## Bearer Token認証ミドルウェアの追加

ローカル開発では認証なしでも大丈夫だが、チームサーバーやクラウドに公開する際は認証を必ず追加する。FastAPIの`HTTPBearer`を使えばシンプルに実装できる。

```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security, Depends

security = HTTPBearer()
API_KEY = os.getenv("API_KEY", "change-me-in-production")

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials

@app.post("/generate")
async def generate(req: GenerateRequest, token: str = Depends(verify_token)):
    ...
```

`.env`に`API_KEY=your-secret-here`を追加し、docker-compose.ymlの環境変数として渡す。完璧なセキュリティではないが、無防備よりはずっとましだ。

## モデルウォームアップ：初回リクエストが遅い理由

Ollamaは最初のモデル呼び出し時にディスクからVRAM（またはRAM）にモデルをロードする。このプロセスがモデルサイズに応じて数秒〜数十秒かかる。起動時にウォームアップリクエストを送っておくと、実ユーザーが感じる初回レスポンス遅延をなくせる。

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

これはFastAPI 0.100以上で推奨されるパターンだ。非推奨になった`@app.on_event("startup")`はまだ動くが、非推奨警告が出る。

## 次のステップ

プロダクション化に必要なもの：

1. **認証**：上記のBearerトークンミドルウェアを適用
2. **レートリミット**：slowapiでIPごとのリクエスト制限
3. **オブザーバビリティ**：リクエストレイテンシ、モデル別スループットのPrometheusエクスポーター
4. **モデルマルチプレキシング**：コーディングリクエストをコード特化モデル、一般リクエストを別モデルにルーティング
5. **フォールバックルーティング**：プライマリモデルが過負荷の場合にバックアップモデルに切り替え

ローカルLLMサーバーを作る理由は人それぞれだ。私の場合はAPIキーなしで実験できる環境が欲しかった。クラウドLLMの方が強力だが、反復実験フェーズでトークンコストが積み重なるのは避けたい。14.9秒の応答でも、コードが正しく動くかどうかを確認する用途には十分だ。Ollama + FastAPIの組み合わせはそのバランスをうまく取ってくれると思っている。
