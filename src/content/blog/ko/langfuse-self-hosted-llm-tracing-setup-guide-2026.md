---
title: Langfuse v3 셀프호스팅 완전 가이드 — LLM 트레이싱을 로컬에서 직접 구축하기
description: >-
  Langfuse v3를 Docker Compose로 셀프호스팅하는 완전한 실전 가이드. Python SDK 4.x 계측 코드 작성부터 RAG
  파이프라인 트레이싱, 비용·지연 모니터링 대시보드 구성까지. 데이터 주권을 지키며 LLM 옵저버빌리티를 자체 인프라에 구축하세요.
pubDate: '2026-05-03'
heroImage: >-
  ../../../assets/blog/langfuse-self-hosted-llm-tracing-setup-guide-2026-hero.png
tags:
  - llm-observability
  - langfuse
  - docker
relatedPosts:
  - slug: ollama-fastapi-production-deployment-guide-2026
    score: 0.9
    reason:
      ko: docker 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into docker.
      ja: dockerをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 docker 主题。
faq:
  - question: "Langfuse v3를 셀프호스팅하려면 어떻게 하나요?"
    answer: "공식 docker-compose.yml을 다운로드하고 NEXTAUTH_SECRET, SALT, ENCRYPTION_KEY 등 보안 환경 변수를 설정한 뒤 docker-compose up -d로 6개 서비스를 띄웁니다. 정상 기동 후 localhost:3000에 접속하면 첫 등록 계정이 관리자가 됩니다."
  - question: "Langfuse v3는 왜 6개 서비스가 필요한가요?"
    answer: "v3의 핵심 변경점은 트레이스 저장소를 PostgreSQL에서 ClickHouse로 분리한 것입니다. ClickHouse는 수십만 건 트레이스의 집계 쿼리를 밀리초 단위로 처리하는 컬럼형 OLAP DB이며, 여기에 MinIO(오브젝트 스토리지), Redis(큐/캐시), langfuse-web, langfuse-worker가 더해져 6개가 됩니다."
  - question: "Langfuse Cloud 대신 셀프호스팅을 쓰면 어떤 장점이 있나요?"
    answer: "트레이스 데이터를 자체 인프라에 두므로 의료, 금융처럼 민감 정보가 포함된 경우 데이터 주권을 지킬 수 있습니다. 월 트레이스가 10만 건을 넘어 Cloud Pro 비용이 부담스러울 때도 셀프호스팅이 유리합니다. 다만 팀이 3명 이하이거나 인프라 관리 리소스가 없다면 Cloud가 더 낫습니다."
  - question: "Langfuse Python SDK v4에서 가장 큰 변경점은 무엇인가요?"
    answer: "langfuse.decorators 모듈이 사라져 import 경로를 from langfuse import observe, get_client로 바꿔야 합니다. 또한 OpenTelemetry 네이티브 통합이 추가되어 OTel SpanExporter 인터페이스로 데이터를 전송합니다."
---

LLM 에이전트를 프로덕션에 올리고 나서 처음으로 확인하게 되는 것이 있다. Langfuse 대시보드에서 "왜 이 응답이 나왔지?"를 추적하려다가 클라우드 요금 청구서를 보게 되는 것이다. 월 트레이스 수가 10만 건을 넘는 순간부터 Langfuse Cloud의 Pro 플랜이 부담스러워진다. 그래서 나는 직접 Docker Compose로 셀프호스팅을 구축했고, 이 글은 그 과정에서 겪은 것들을 정리한 기록이다.

## Langfuse가 해결하는 문제

AI 에이전트를 운영해보면 전통적인 APM 도구가 얼마나 쓸모없는지 금방 체감한다. Datadog이나 New Relic은 HTTP 레이턴시와 에러율을 잘 보여주지만, "이 RAG 파이프라인에서 검색 단계가 전체 응답 품질을 얼마나 떨어뜨렸는지"는 전혀 알 수 없다. 프롬프트 버전이 바뀌었을 때 응답 품질이 어떻게 달라졌는지도 마찬가지다.

AI 에이전트 옵저버빌리티 실전 가이드에서 Langfuse를 Braintrust, LangSmith와 함께 비교했는데, 셀프호스팅 가능성과 오픈소스 라이선스가 Langfuse의 가장 큰 차별화 포인트였다. 이 글에서는 그 비교 단계를 넘어서 실제로 로컬에 구축하는 방법을 다룬다.

Langfuse가 제공하는 것:

- **트레이스 워터폴**: 각 에이전트 스텝이 얼마나 걸렸는지, 어디서 병목이 생기는지
- **토큰 사용량과 비용 추적**: GPT-4o, Claude Sonnet 등 모델별 누적 비용
- **프롬프트 버저닝**: 프롬프트를 코드 외부에서 관리하고 A/B 테스트
- **데이터셋과 평가**: LLM을 judge로 쓰는 자동 평가 파이프라인
- **사용자 세션 트래킹**: 같은 사용자의 대화 흐름 추적

솔직히 말하면, 이 기능 전부가 처음부터 필요한 건 아니다. 내가 실제로 매일 쓰는 것은 트레이스 워터폴과 비용 추적 두 가지다. 나머지는 팀이 커지거나 평가 자동화가 필요해졌을 때 붙이면 된다.

## Langfuse v3 아키텍처가 6개 서비스로 늘어난 이유

Langfuse v2는 PostgreSQL 하나면 충분했다. Docker Compose 파일이 10줄이었고 5분이면 떴다. v3는 달라졌다. 공식 docker-compose.yml을 내려받아보면 6개의 서비스가 정의되어 있다.

```
서비스 구성 (docker-compose.yml 기준):
├── langfuse-web          (3000번 포트 — UI + API)
├── langfuse-worker       (3030번 포트 — 백그라운드 작업)
├── ClickHouse            (8123, 9000 — OLAP 분석 DB)
├── MinIO                 (9090 — S3 호환 오브젝트 스토리지)
├── Redis 7               (6379 — 큐 + 캐시)
└── PostgreSQL 17         (5432 — 관계형 DB)
```

왜 이렇게 복잡해졌을까? v3의 핵심 변경점은 트레이스 저장소를 PostgreSQL에서 ClickHouse로 분리한 것이다. 수십만 건의 트레이스에서 "지난 30일간 평균 레이턴시 추이"를 집계하는 쿼리를 PostgreSQL로 돌리면 몇 초씩 걸렸다. ClickHouse는 이런 집계 쿼리에 최적화된 컬럼형 OLAP 데이터베이스라 같은 쿼리가 밀리초 단위로 끝난다.

MinIO는 프롬프트 이미지, 응답 미디어 등 큰 용량의 파일을 저장하기 위한 오브젝트 스토리지다. Redis는 langfuse-worker가 처리할 작업을 큐에 넣고 꺼내는 데 쓴다.

개인적으로 이 아키텍처 복잡도에 불만이 있다. 소규모 팀이나 개인 프로젝트에서 6개 컨테이너를 관리하는 것은 부담이다. Langfuse 팀도 이를 알고 있어서 경량 배포 옵션을 지속적으로 논의 중이지만, 2026년 5월 기준으로 공식 지원은 이 풀스택 구성뿐이다.

## Docker Compose 설치 단계별 가이드

사전 요구사항:

- Docker Engine 20.x 이상
- Docker Compose v2 (Compose V1은 지원 종료)
- 최소 4GB RAM (권장 8GB)
- 20GB 이상 디스크 여유 공간

**1단계: docker-compose.yml 다운로드**

```bash
mkdir langfuse-local && cd langfuse-local
curl -sL https://raw.githubusercontent.com/langfuse/langfuse/main/docker-compose.yml \
  -o docker-compose.yml
```

**2단계: 환경 변수 설정**

docker-compose.yml 안의 `# CHANGEME` 주석을 찾아서 실제 값으로 교체한다. 최소한 다음 세 가지는 바꿔야 한다.

```bash
# .env 파일 생성
cat > .env << 'EOF'
# 필수 보안 변수
NEXTAUTH_SECRET=$(openssl rand -base64 32)
SALT=$(openssl rand -base64 16)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# DB 인증 정보 (기본값 변경 권장)
DATABASE_URL=postgresql://langfuse:yourpassword@postgres:5432/langfuse

# MinIO 인증
MINIO_ROOT_USER=langfuse
MINIO_ROOT_PASSWORD=yourminiopassword

# ClickHouse 인증
CLICKHOUSE_PASSWORD=yourclickhousepassword
EOF
```

**3단계: 서비스 시작**

```bash
docker-compose up -d

# 상태 확인 (healthy 상태가 될 때까지 1~2분 소요)
docker-compose ps
```

정상 기동 후 `http://localhost:3000`으로 접속하면 회원가입 화면이 나타난다. 첫 번째 등록한 계정이 관리자가 된다.

**첫 기동에서 마주칠 수 있는 문제들**

ClickHouse 초기화가 가장 오래 걸린다. PostgreSQL과 Redis는 보통 30초 안에 healthy 상태가 되지만, ClickHouse는 첫 기동 시 스키마 마이그레이션 때문에 1분 이상 걸리기도 한다. langfuse-worker가 `depends_on: clickhouse: condition: service_healthy`를 보고 기다리기 때문에, 이 시간 동안 worker가 계속 재시작처럼 보일 수 있다. 패닉할 필요 없다.

포트 3000이 이미 사용 중이라면 docker-compose.yml에서 langfuse-web의 ports를 `"3001:3000"`으로 바꾸면 된다.

## Python SDK 4.x로 첫 트레이스 만들기

Langfuse SDK는 최근 v3에서 v4로 메이저 버전이 올라갔다. v4에서 가장 큰 변화는 `langfuse.decorators` 모듈이 사라진 것이다. 기존에 `from langfuse.decorators import observe, langfuse_context`로 쓰던 코드를 전부 바꿔야 한다.

```bash
pip install langfuse  # 현재 버전: 4.5.1
```

```python
# v3 SDK (구버전 — 더 이상 동작 안 함)
from langfuse.decorators import observe, langfuse_context  # ❌

# v4 SDK (현재)
from langfuse import observe, get_client  # ✓
```

환경 변수로 설정하는 방식이 가장 권장된다.

```bash
export LANGFUSE_PUBLIC_KEY="pk-lf-your-public-key"
export LANGFUSE_SECRET_KEY="sk-lf-your-secret-key"
export LANGFUSE_HOST="http://localhost:3000"  # 셀프호스팅
```

기본적인 트레이싱은 `@observe` 데코레이터 하나로 시작할 수 있다.

```python
from langfuse import observe, get_client

@observe()
def call_llm(prompt: str) -> str:
    # 여기서 실제 LLM 호출
    response = "LLM 응답 텍스트"
    
    # 현재 observation에 메타데이터 추가
    client = get_client()
    client.update_current_observation(
        model="claude-sonnet-4-5",
        usage_details={"input": 150, "output": 80},
        cost_details={"input": 0.000225, "output": 0.00032}
    )
    return response

# 이 함수를 호출하면 자동으로 트레이스가 Langfuse 서버로 전송됨
result = call_llm("오늘 날씨 어때?")
```

## 실전 RAG 파이프라인 트레이싱

[PydanticAI로 타입 안전한 에이전트를 만드는 방법](/ko/blog/ko/pydantic-ai-type-safe-agent-tutorial-2026)을 다뤘을 때처럼, 실제 에이전트 코드에 Langfuse를 붙이면 어느 단계에서 비용이 발생하는지 바로 파악할 수 있다. 아래 코드가 내가 프로젝트에서 실제로 쓰는 패턴이다.

```python
from langfuse import observe, get_client
from typing import Any

@observe(as_type="retriever")
def vector_search(query: str, top_k: int = 5) -> list[dict]:
    """벡터 DB 검색 — retriever 타입으로 마킹하면 UI에서 구분됨"""
    client = get_client()
    client.update_current_observation(
        input={"query": query, "top_k": top_k},
        metadata={"index": "blog_posts", "model": "text-embedding-3-small"}
    )
    
    # 실제 검색 로직
    results = [
        {"id": f"doc_{i}", "content": f"문서 {i}", "score": 0.9 - i * 0.1}
        for i in range(top_k)
    ]
    
    client.update_current_observation(output=results)
    return results


@observe(as_type="generation")
def llm_generate(query: str, context: list[dict]) -> str:
    """LLM 응답 생성 — generation 타입으로 마킹하면 토큰/비용 집계가 됨"""
    client = get_client()
    
    prompt = f"컨텍스트: {context}\n질문: {query}"
    
    # Claude/OpenAI API 호출...
    response_text = "생성된 응답"
    
    client.update_current_observation(
        model="claude-sonnet-4-5",
        input=prompt,
        output=response_text,
        usage_details={"input": 450, "output": 150},
        cost_details={"input": 0.000675, "output": 0.0006}
    )
    return response_text


@observe(name="rag_pipeline")
def run_rag(user_query: str) -> str:
    """최상위 파이프라인 — 하위 단계를 감싸서 전체 트레이스를 하나로 묶음"""
    docs = vector_search(user_query, top_k=3)
    answer = llm_generate(user_query, docs)
    return answer
```

이 코드를 실행하면 Langfuse UI에서 다음과 같은 트레이스 워터폴이 보인다.

```
rag_pipeline                         ████████████████████ 1.8s
  └─ vector_search()   [retriever]   ██ 0.2s
  └─ llm_generate()    [generation]  █████████████████ 1.6s
      model: claude-sonnet-4-5
      input tokens: 450 / output tokens: 150
      cost: $0.001275
```

`as_type` 파라미터가 핵심이다. `generation`으로 마킹하면 자동으로 토큰 사용량이 집계되고 모델별 비용 분석이 된다. `retriever`로 마킹하면 검색 레이턴시를 별도로 볼 수 있다.

## v4 SDK의 주요 변경점과 주의사항

솔직히 SDK v4 업그레이드에서 한 번 막혔다. 기존 프로젝트에서 `from langfuse.decorators import observe` 패턴을 50군데쯤 쓰고 있었는데, v4 설치 후 전부 `ModuleNotFoundError`가 떴다.

**변경 사항 요약:**

| 항목 | v3 (구) | v4 (현재) |
|------|---------|---------|
| observe import | `from langfuse.decorators import observe` | `from langfuse import observe` |
| langfuse_context | `from langfuse.decorators import langfuse_context` | `from langfuse import get_client` |
| OTel 통합 | 별도 설정 필요 | 네이티브 지원 |
| as_type 값 | 문자열 제한 | `generation`, `embedding`, `span`, `agent`, `tool`, `chain`, `retriever`, `evaluator`, `guardrail` |

v4에서 가장 큰 변화는 OpenTelemetry 네이티브 통합이다. 기존에는 Langfuse SDK가 자체 HTTP 클라이언트로 데이터를 전송했는데, v4에서는 OTel `SpanExporter` 인터페이스를 구현해서 OpenTelemetry 생태계와 완전히 호환된다. `LangfuseOtelSpanAttributes` 같은 새 클래스가 추가된 것도 이 때문이다.

마이그레이션이 필요하다면 단순 검색/치환으로 해결된다.

```bash
# 마이그레이션 스크립트
find . -name "*.py" -exec sed -i \
  's/from langfuse.decorators import observe, langfuse_context/from langfuse import observe, get_client/g' {} +
  
# langfuse_context.update_current_observation → get_client().update_current_observation 로 수동 변경 필요
```

`langfuse_context` 직접 치환은 안 된다. `langfuse_context.update_current_observation(...)`을 `get_client().update_current_observation(...)`으로 바꿔야 하는데, 이 부분은 grep으로 찾아서 손으로 수정하는 게 안전하다.

## LangChain, OpenAI SDK 통합

v4 SDK는 LangChain과 OpenAI SDK 통합도 유지한다.

```python
# LangChain 통합
from langfuse.langchain import CallbackHandler

handler = CallbackHandler()
chain = your_langchain_chain

result = chain.invoke(
    {"query": "질문"},
    config={"callbacks": [handler]}
)
```

```python
# OpenAI SDK 래핑
from langfuse.openai import openai

# 기존 openai 클라이언트를 그대로 교체
client = openai.OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "안녕"}]
)
# 자동으로 트레이스가 Langfuse로 전송됨
```

이 통합 방식이 실제로 편하다. 코드 구조를 바꾸지 않고 import 한 줄만 바꾸면 모든 LLM 호출이 자동으로 트레이싱된다.

## 셀프호스팅을 권하지 않는 경우

내가 셀프호스팅을 권장하지 않는 경우가 있다. 솔직히 적는다.

**셀프호스팅이 맞는 경우:**
- 트레이스 데이터에 민감한 사용자 정보가 포함됨 (의료, 금융)
- 월 트레이스 수가 10만 건 이상이어서 Cloud 비용이 부담됨
- Kubernetes 기반 인프라를 이미 운영 중

**Cloud를 그냥 쓰는 게 나은 경우:**
- 팀이 3명 이하이고 인프라 관리 리소스가 없음
- 트레이스가 월 5만 건 이하 (Langfuse Cloud 무료 티어 범위)
- 백업, 스케일링, 업데이트를 직접 관리하기 싫음

나는 두 가지 프로젝트를 동시에 운영하면서 하나는 Cloud, 하나는 셀프호스팅을 쓴다. ClickHouse 때문에 메모리를 2GB 이상 잡아먹는 게 여전히 아깝게 느껴지는 게 솔직한 감상이다.

MCP 서버를 직접 구축해본 경험이 있다면, 그 서버에서 발생하는 LLM 호출에 Langfuse 트레이싱을 붙이는 것이 자연스러운 다음 단계다. MCP 서버는 도구 호출 체인이 길어지는 경향이 있어서 트레이스 워터폴의 가치가 특히 높다.

## 트러블슈팅 FAQ

**Q. docker-compose up 후 langfuse-web이 계속 재시작됨**

ClickHouse나 Redis 초기화가 완료되기 전에 web이 뜨려고 하는 경우다. 1~2분 기다리면 대부분 해결된다. 그래도 안 되면 `docker-compose logs langfuse-web`으로 에러 메시지를 확인한다.

**Q. 데이터가 Langfuse UI에 나타나지 않음**

SDK의 flush가 완료되기 전에 프로세스가 종료된 경우가 많다. 스크립트 끝에 `get_client().flush()`를 명시적으로 호출하거나, 비동기 환경에서는 `await get_client().async_flush()`를 쓴다.

**Q. 프로덕션 배포 시 NEXTAUTH_SECRET 설정**

셀프호스팅에서 `NEXTAUTH_SECRET`을 기본값으로 두면 보안 위험이 있다. `openssl rand -base64 32`로 생성한 값을 반드시 환경 변수에 넣어야 한다.

**Q. ClickHouse 디스크 사용량이 빠르게 증가함**

Langfuse가 기본적으로 모든 트레이스의 입출력 텍스트를 저장하기 때문이다. SDK에서 `capture_input=False`, `capture_output=False`로 특정 span의 데이터를 생략하거나, `mask` 파라미터로 민감 정보를 마스킹할 수 있다.

## 트레이싱을 넘어서는 두 기능: 프롬프트 버저닝과 데이터셋

Langfuse가 단순한 트레이싱 도구를 넘어서는 지점이 두 곳이다. 프롬프트 버저닝과 데이터셋 기반 평가다.

**프롬프트 버저닝**은 프롬프트를 코드 저장소 밖에서 관리하게 해준다. 현재 내 개인 블로그 자동화 파이프라인에서 이 기능을 쓴다.

```python
from langfuse import get_client

client = get_client()

# 프롬프트 서버에서 불러오기 (캐싱 적용)
prompt = client.get_prompt("blog-title-generator", version=3)
compiled = prompt.compile(
    topic="LLM 옵저버빌리티",
    tone="실용적",
    audience="개발자"
)

# 이 프롬프트로 LLM 호출하면 자동으로 어떤 버전을 썼는지 트레이싱됨
```

프롬프트를 이렇게 관리하면 "버전 2 프롬프트를 쓴 날 응답 품질이 왜 떨어졌지?" 같은 질문에 바로 답할 수 있다. Langfuse UI에서 프롬프트 버전별 평균 품질 점수를 집계해서 볼 수 있다.

**데이터셋과 자동 평가**는 LLM을 judge로 써서 응답 품질을 자동으로 채점하는 워크플로우다. 예를 들어 RAG 파이프라인이 바뀌었을 때 기존 100개의 질문에 대한 응답이 품질이 떨어지지 않았는지 자동으로 검증할 수 있다.

```python
from langfuse import get_client
from langfuse.evaluator import LangfuseEvaluator

client = get_client()

# 평가 데이터셋 생성
dataset = client.create_dataset(
    name="rag_eval_set",
    description="RAG 파이프라인 품질 평가용 데이터셋"
)

# 평가 항목 추가
client.create_dataset_item(
    dataset_name="rag_eval_set",
    input={"question": "LangGraph와 AutoGen의 차이점은?"},
    expected_output="LangGraph는 그래프 기반 워크플로우..."
)

# 자동 평가 실행
# Langfuse UI에서 평가 점수와 트레이스가 연결되어 표시됨
```

이 기능은 코드 배포 전 CI 파이프라인에서 LLM 품질을 자동으로 게이팅하는 데 쓸 수 있다. 내가 아직 이걸 실제로 구축하지 않은 건, 솔직히 평가 데이터셋을 만드는 데 드는 초기 비용이 만만치 않기 때문이다.

## LLM 옵저버빌리티는 언제 도입해야 하나

내 경험상, LLM 트레이싱은 에이전트를 배포하기 전이 아니라 첫 번째 이상한 응답을 받은 직후에 도입하게 된다. 그 순간이 왔을 때 이미 Langfuse가 돌아가고 있으면 5분 안에 원인을 찾을 수 있다. 없으면 로그 파일을 뒤지며 몇 시간을 보낸다.

Langfuse 4.5.1 SDK는 `pip install langfuse` 한 줄과 `@observe` 데코레이터 하나로 시작할 수 있다. 셀프호스팅 스택은 무거워졌지만, 그 복잡도는 ClickHouse가 가져다주는 집계 쿼리 성능으로 충분히 상쇄된다.

Langfuse Cloud 무료 티어가 한계에 닿기 전에 Docker Compose 설정 파일을 미리 준비해두는 것을 권장한다.
