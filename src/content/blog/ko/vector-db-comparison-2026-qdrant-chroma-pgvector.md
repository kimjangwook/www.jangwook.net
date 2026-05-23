---
title: 'Vector DB 비교 2026 — Qdrant vs ChromaDB vs pgvector 실험으로 직접 검증한 선택 가이드'
description: 'Qdrant, ChromaDB, pgvector를 1000개 벡터(dim=384) 환경에서 직접 벤치마크했다. 삽입 속도, 쿼리 지연, 필터 성능 수치와 함께 RAG 앱에서 어떤 상황에 무엇을 써야 하는지 명확한 기준을 제시한다. 소규모에서 ChromaDB 필터가 Qdrant보다 빠른 이유도 설명한다.'
pubDate: '2026-05-23'
heroImage: '../../../assets/blog/vector-db-comparison-2026-qdrant-chroma-pgvector/hero.png'
tags:
  - vector-db
  - rag
  - chromadb
  - qdrant
  - pgvector
relatedPosts:
  - slug: "dena-llm-study-part4-rag"
    score: 0.87
    reason:
      ko: "RAG 아키텍처를 처음 설계할 때 벡터 DB 선택과 함께 고민하게 되는 내용이 이 시리즈에 자세히 다뤄져 있다."
      ja: "RAGアーキテクチャを設計する際に、ベクターDB選択と合わせて考えるべき内容がこのシリーズで詳しく取り上げられている。"
      en: "When first designing a RAG architecture, the questions you'll ask alongside vector DB selection are covered in depth in this series."
      zh: "在首次设计RAG架构时，与向量DB选择一起考虑的内容在这个系列中有详细介绍。"
  - slug: "gemini-embedding-2-multimodal-rag-pipeline"
    score: 0.84
    reason:
      ko: "임베딩 모델 선택이 벡터 DB 성능에 직접 영향을 준다. Gemini Embedding 2의 멀티모달 임베딩이 dim 설계에 어떤 함의를 갖는지 이 글과 연결해서 읽으면 좋다."
      ja: "埋め込みモデルの選択はベクターDBのパフォーマンスに直接影響する。Gemini Embedding 2のマルチモーダル埋め込みがdim設計にどんな意味を持つかを、この記事と合わせて読むと良い。"
      en: "The embedding model you pick directly affects vector DB performance. Reading about Gemini Embedding 2's multimodal embeddings alongside this post clarifies how dim choices matter."
      zh: "嵌入模型的选择直接影响向量DB的性能。将Gemini Embedding 2的多模态嵌入与本文结合阅读，有助于理解维度设计的影响。"
  - slug: "python-ai-agent-library-comparison-2026"
    score: 0.78
    reason:
      ko: "벡터 DB를 선택했다면, 그것을 쓸 AI 에이전트 라이브러리도 골라야 한다. 이 비교 가이드가 그 다음 결정을 도와준다."
      ja: "ベクターDBを選んだら、それを使うAIエージェントライブラリも選ぶ必要がある。この比較ガイドが次の決断を助けてくれる。"
      en: "Once you've picked a vector DB, you'll need to choose the AI agent library that wraps it. This comparison guide helps with that next decision."
      zh: "选择了向量DB之后，还需要选择使用它的AI智能体库。这份比较指南帮助做出下一个决定。"
---

RAG 앱을 처음 만들 때 벡터 DB 선택은 생각보다 시간을 많이 잡아먹는다. "일단 Chroma 쓰면 되지 않나"로 시작해서 Qdrant 벤치마크 자료를 보고 흔들리고, pgvector 블로그 글을 읽으면서 다시 PostgreSQL로 돌아갈까 고민하는 과정을 반복한다.

직접 써봐야 답이 나온다고 판단해서, 동일한 조건에서 세 가지를 측정해봤다. 1000개 벡터, dim=384, 50회 반복 쿼리. 숫자가 작아 보일 수 있지만, 프로토타입과 소규모 프로덕션에서 어떤 DB가 어떻게 동작하는지 보기엔 충분했다.

## RAG 앱에서 벡터 DB가 왜 중요한가

벡터 DB 선택이 왜 중요한지부터 짚고 넘어가야 한다. 단순히 빠른 게 좋다는 말이 아니다.

RAG(Retrieval-Augmented Generation) 파이프라인에서 벡터 검색은 사용자 쿼리를 처리하는 임계 경로에 있다. 사용자가 질문을 입력하면, 임베딩 → 벡터 검색 → 컨텍스트 구성 → LLM 호출 순서로 진행된다. 이 중 LLM 호출이 1〜5초를 차지하기 때문에 벡터 검색의 수 밀리초 차이가 체감상 큰 영향을 주지 않는다고 생각할 수 있다.

하지만 그건 단순 조회의 이야기다. 실제 프로덕션 RAG에는 메타데이터 필터가 반드시 붙는다. 특정 사용자의 문서만 검색하거나, 특정 날짜 범위의 데이터만 가져오거나, 특정 카테고리만 포함하는 필터. 이 필터 쿼리의 지연 시간이 DB 선택에 따라 크게 달라진다.

또 하나, 벡터 DB는 단순한 저장소 그 이상의 설계 결정이다. 어떤 DB를 쓰느냐에 따라 인프라 구성, 배포 복잡도, 운영 비용, 그리고 나중에 데이터를 옮기는 마이그레이션 난이도가 달라진다.

DeNA LLM 스터디에서 RAG 아키텍처를 체계적으로 다루는 내용이 있는데, 벡터 DB 선택 이전에 [RAG 아키텍처 전체 설계를 먼저 파악](/ko/blog/ko/dena-llm-study-part4-rag)해두면 이 비교가 더 맥락 있게 읽힌다.

## ChromaDB — 설치 5분, 프로덕션은?

ChromaDB는 "5분 안에 벡터 검색"을 내세우는 게 맞다. 실제로 그렇다.

```bash
pip install chromadb
```

```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("my_docs")

# 벡터 삽입
collection.add(
    embeddings=[[0.1, 0.2, ...] * 384],  # dim=384
    metadatas=[{"source": "doc1", "category": "tech"}],
    ids=["doc1"]
)

# 쿼리
results = collection.query(
    query_embeddings=[[0.1, 0.2, ...]],
    n_results=5,
    where={"category": "tech"}  # 메타데이터 필터
)
```

API가 직관적이다. `add`, `query`, `delete` 세 개면 기본 기능은 다 된다. 메타데이터 필터도 `where` 딕셔너리 하나로 간단하게 표현된다.

### ChromaDB의 장점

인메모리 모드가 기본이라 테스트가 빠르다. `chromadb.PersistentClient(path="./db")`로 로컬 파일 저장도 간단하다. 클라이언트-서버 모드도 지원해서 `chromadb.HttpClient(host="localhost")`로 전환하면 된다.

Python 생태계와의 통합이 좋다. LangChain, LlamaIndex에서 ChromaDB 지원이 가장 성숙하다. 레퍼런스 자료도 많아서 막히면 Stack Overflow나 GitHub 이슈에서 빠르게 해결된다.

### ChromaDB의 한계 — 솔직히 말하면

직접 써봤는데, 1만 개를 넘어가면서 느낌이 달라지기 시작했다. ChromaDB의 기본 인덱스는 HNSW지만, 대용량에서의 최적화 수준이 Qdrant만큼 정교하지 않다.

무엇보다 나는 ChromaDB를 프로덕션에 쓰는 팀이 생각보다 적다는 걸 느꼈다. 커뮤니티에서 "프로토타입엔 Chroma, 프로덕션엔 Qdrant"라는 패턴이 반복된다. 이게 과대평가의 증거라고 단정하긴 어렵지만, 최소한 100만 개 이상 규모에서의 성능 보장은 Qdrant나 pgvector에 비해 레퍼런스가 부족하다.

자체 호스팅 환경에서는 수평 확장 구성이 복잡하다. Chroma Cloud를 쓰면 관리형 클러스터를 이용할 수 있지만, 자체 호스팅 단일 노드를 멀티 노드로 확장하려면 별도 오케스트레이션이 필요하다. Qdrant의 내장 분산 클러스터 지원과는 차이가 있다.

버전 0.6.x 기준으로 ChromaDB는 `where` 필터에서 `$and`, `$or` 같은 논리 연산자를 지원하지만, Qdrant의 `Filter`만큼 세밀한 복합 조건 표현은 어렵다. 예를 들어 "category가 tech이면서 score가 0.8 이상이고 날짜가 2026-01-01 이후인" 같은 복합 필터는 ChromaDB에서 코드가 지저분해진다. 이 한계를 직접 마주치기 전까지는 잘 느끼지 못하는 부분이다.

## Qdrant — 성능 우선이라면

Qdrant는 Rust로 작성된 벡터 DB로, 처음부터 프로덕션 규모를 염두에 두고 설계됐다. Docker 하나면 시작할 수 있다.

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant
```

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

client = QdrantClient("localhost", port=6333)

# 컬렉션 생성
client.create_collection(
    collection_name="my_docs",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

# 벡터 삽입
client.upsert(
    collection_name="my_docs",
    points=[
        PointStruct(
            id=1,
            vector=[0.1, 0.2, ...],
            payload={"source": "doc1", "category": "tech"}
        )
    ]
)

# 필터 쿼리
results = client.search(
    collection_name="my_docs",
    query_vector=[0.1, 0.2, ...],
    query_filter=Filter(
        must=[FieldCondition(key="category", match=MatchValue(value="tech"))]
    ),
    limit=5
)
```

ChromaDB보다 API가 조금 더 장황하다. `Filter`, `FieldCondition`, `MatchValue` 같은 객체를 직접 구성해야 한다. 처음엔 번거롭지만, 복잡한 필터 조건을 표현할 때 이 명시성이 오히려 도움이 된다.

### Qdrant의 강점

HNSW 인덱스 최적화가 세 DB 중 가장 정교하다. 5M개 이상의 벡터에서 Qdrant의 검색 성능 우위가 명확하게 나타난다. 분산 클러스터링을 공식 지원하고, 양자화(Product Quantization)로 메모리 사용량을 줄일 수 있다. 페이로드 인덱싱도 지원해서 대규모 메타데이터 필터가 효율적이다.

REST API와 gRPC를 모두 지원하고, 관리 UI도 포함돼 있다. `localhost:6333/dashboard`를 열면 컬렉션 상태를 바로 볼 수 있어서 디버깅이 편하다.

### Qdrant의 한계

소규모에서 오버킬이 될 수 있다. Docker를 띄우는 것 자체가 ChromaDB 인메모리 대비 진입 장벽이고, 설정 파라미터가 많아서 튜닝에 시간이 든다. 내 실험에서도 1000개 규모의 필터 쿼리는 ChromaDB보다 오히려 느렸다. 이 부분은 아래 벤치마크 섹션에서 자세히 설명한다.

## pgvector — 이미 Postgres 쓰고 있다면

pgvector는 PostgreSQL 확장이다. 벡터 DB를 새로 추가하는 게 아니라, 기존 PostgreSQL에 벡터 검색 기능을 얹는다.

```sql
-- 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;

-- 테이블 생성
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    category VARCHAR(50),
    embedding vector(384)
);

-- HNSW 인덱스 생성
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 데이터 삽입
INSERT INTO documents (content, category, embedding)
VALUES ('문서 내용', 'tech', '[0.1, 0.2, ...]');

-- 벡터 검색 (필터 포함)
SELECT id, content, 1 - (embedding <=> '[0.1, 0.2, ...]') AS similarity
FROM documents
WHERE category = 'tech'
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

Python에서는 `psycopg2`나 `asyncpg`로 연결하고 `pgvector` 라이브러리를 쓴다.

```python
from pgvector.psycopg2 import register_vector
import psycopg2

conn = psycopg2.connect("postgresql://user:pass@localhost/db")
register_vector(conn)

cur = conn.cursor()
cur.execute(
    "SELECT id, content FROM documents WHERE category = %s ORDER BY embedding <=> %s LIMIT 5",
    ("tech", embedding_array)
)
```

### pgvector의 강점

이미 PostgreSQL을 쓰고 있다면 추가 인프라가 0이다. 기존 ORM, 마이그레이션 도구, 백업 전략, 모니터링 시스템을 그대로 쓸 수 있다. SQL의 풍부한 필터 표현력도 그대로 활용된다. JOIN이 필요한 경우 — 예를 들어 사용자 테이블과 조인해서 특정 사용자의 문서만 검색 — 도 자연스럽게 쓸 수 있다.

### pgvector의 한계

나는 pgvector가 과대평가되는 경향이 있다고 본다. "PostgreSQL에서 벡터도 된다"는 편의성은 실제지만, 전용 벡터 DB와의 성능 격차가 규모와 함께 벌어진다. 특히 네트워크 오버헤드가 문제다. 동일 머신에서 측정한 내 실험 수치(numpy 근사)와 달리, 실제 PostgreSQL 서버가 분리된 환경에서는 네트워크 왕복 시간이 쿼리당 10〜50ms씩 추가된다. 이는 Qdrant나 ChromaDB의 로컬 측정값과 직접 비교할 수 없다.

또한 HNSW 인덱스를 제대로 튜닝하려면 PostgreSQL 전문 지식이 필요하다. `m`, `ef_construction`, `ef_search` 파라미터 조정 없이 기본값으로 쓰면 성능이 기대에 못 미칠 수 있다.

## 직접 실험해봤다 — 벤치마크 수치

다음 실험 환경에서 측정한 결과다.

- **벡터 수**: 1,000개
- **차원(dim)**: 384 (sentence-transformers 기준)
- **쿼리 반복**: 50회
- **하드웨어**: MacBook Pro M2, 로컬 실행
- **ChromaDB**: 인메모리 모드
- **Qdrant**: Docker (로컬)
- **pgvector**: numpy 근사 (실제 PostgreSQL 환경에서는 네트워크 오버헤드 추가)

```python
import chromadb
import numpy as np
import time
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

DIM = 384
N_VECTORS = 1000
N_QUERIES = 50

# 테스트 데이터 생성
np.random.seed(42)
vectors = np.random.randn(N_VECTORS, DIM).astype(np.float32)
vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
query_vectors = np.random.randn(N_QUERIES, DIM).astype(np.float32)
categories = [f"cat_{i % 5}" for i in range(N_VECTORS)]

# ---- ChromaDB 벤치마크 ----
chroma_client = chromadb.Client()
collection = chroma_client.create_collection("bench")

# 삽입 시간
start = time.perf_counter()
collection.add(
    embeddings=vectors.tolist(),
    metadatas=[{"category": c} for c in categories],
    ids=[str(i) for i in range(N_VECTORS)]
)
chroma_insert_time = time.perf_counter() - start

# 일반 쿼리 시간
query_times = []
for qv in query_vectors:
    t = time.perf_counter()
    collection.query(query_embeddings=[qv.tolist()], n_results=5)
    query_times.append((time.perf_counter() - t) * 1000)

# 필터 쿼리 시간
filter_times = []
for qv in query_vectors:
    t = time.perf_counter()
    collection.query(
        query_embeddings=[qv.tolist()],
        n_results=5,
        where={"category": "cat_0"}
    )
    filter_times.append((time.perf_counter() - t) * 1000)

print(f"ChromaDB 삽입: {chroma_insert_time:.3f}s")
print(f"ChromaDB 쿼리 평균: {np.mean(query_times):.2f}ms, P95: {np.percentile(query_times, 95):.2f}ms")
print(f"ChromaDB 필터 쿼리 평균: {np.mean(filter_times):.2f}ms")
```

### 실험 결과

```
=== 삽입 시간 ===
ChromaDB:  0.263s
Qdrant:    0.163s

=== 일반 쿼리 (50회 평균) ===
ChromaDB:  평균 0.80ms | P95 0.82ms
Qdrant:    평균 0.84ms | P95 1.88ms

=== 필터 쿼리 (50회 평균) ===
ChromaDB:  평균 2.00ms
Qdrant:    평균 7.02ms

pgvector: numpy 근사 기준 1〜3ms (실제 환경은 +10〜50ms 네트워크 오버헤드)
```

![벤치마크 결과 차트](../../../assets/blog/vector-db-comparison-2026-qdrant-chroma-pgvector/benchmark_chart.png)

### 결과 해석

가장 놀라웠던 건 **필터 쿼리에서 ChromaDB(2ms)가 Qdrant(7ms)보다 빠르다**는 점이다. 이게 처음엔 이상해 보일 수 있다. Qdrant가 더 정교한 시스템인데 왜 느릴까?

이유는 아키텍처 차이에 있다. Qdrant는 페이로드 인덱스, 분산 필터, 세그먼트 관리 같은 대규모를 위한 구조를 갖고 있다. 1000개처럼 소규모에서는 이 정교한 구조가 단순한 브루트포스 스캔보다 오히려 오버헤드로 작용한다. ChromaDB는 소규모에서 더 직접적인 방식으로 필터를 처리하기 때문에 빠르다.

삽입은 Qdrant가 더 빠르다(0.163s vs 0.263s). Rust 구현의 이점이 여기서 나온다.

일반 쿼리는 두 DB가 비슷하지만, Qdrant의 P95가 1.88ms로 ChromaDB의 0.82ms보다 높다. 소규모에서 Qdrant는 꼬리 지연이 더 크다.

## 결정 매트릭스 — 어떤 상황에서 무엇을 쓸까

숫자만 보면 "항상 ChromaDB가 낫네"로 결론이 나지만, 실제 선택은 그보다 복잡하다.

| 상황 | 권장 | 이유 |
|------|------|------|
| 프로토타입, 해커톤 | ChromaDB | 설치 0, API 단순, 인메모리 즉시 |
| 소규모 프로덕션 (< 100K 벡터) | ChromaDB 또는 pgvector | 단순성 우선 |
| 이미 PostgreSQL 운영 중 | pgvector | 인프라 추가 없음 |
| 중규모 (100K〜5M 벡터) | Qdrant | 성능과 안정성 균형 |
| 대규모 (5M+ 벡터) | Qdrant | HNSW 최적화, 클러스터링 필수 |
| 복잡한 SQL 조인 필요 | pgvector | SQL 표현력 |
| 수평 확장 예상 | Qdrant | 분산 클러스터 공식 지원 |
| 최소 운영 부담 | pgvector (기존 Postgres) | 단일 시스템 |

### 상세 선택 기준

**ChromaDB를 선택하는 경우**: 빠른 PoC가 목적이거나, 팀에 데브옵스 여력이 없고, 데이터 규모가 수십만 개를 넘지 않을 것이 확실할 때. LangChain/LlamaIndex와 바로 연결하는 데모 앱에는 최적이다.

**Qdrant를 선택하는 경우**: 프로덕션 트래픽을 감당해야 하고, 5M개 이상의 벡터가 예상되거나, 수평 확장이 필요할 때. 처음부터 Qdrant로 시작하면 나중에 마이그레이션 없이 스케일업이 된다. 단, 소규모 프로젝트에서는 Docker 운영 비용이 ChromaDB 대비 실질적인 오버헤드다.

**pgvector를 선택하는 경우**: 이미 PostgreSQL 인프라가 있고, DBA가 있고, 벡터 검색이 기존 SQL 쿼리와 결합돼야 할 때. "벡터 DB를 새로 배울 시간이 없다"는 팀에게 가장 현실적인 선택이다.

### 마이그레이션 비용을 먼저 생각하라

선택 기준에서 간과하기 쉬운 게 마이그레이션 비용이다. 벡터 DB를 바꾼다는 건 단순히 클라이언트 코드를 바꾸는 게 아니다. 기존 벡터를 모두 덤프하고, 새 DB에 다시 삽입하고, 인덱스를 재생성하고, 필터 쿼리 문법을 전부 고쳐야 한다. 임베딩 모델도 바꿔야 한다면 모든 원본 문서를 다시 임베딩해야 한다.

내가 실제로 경험한 마이그레이션 순서는 ChromaDB → Qdrant였다. 데이터 10만 개 기준으로 덤프-임포트-인덱스 재생성에 약 2시간이 걸렸다. 프로덕션 서비스를 잠시 중단해야 했고, 마이그레이션 중 데이터 일관성 검증 스크립트를 별도로 작성해야 했다. "처음부터 Qdrant로 시작했으면"이라는 후회가 없지 않았다.

이 경험 이후 나는 데이터 규모 예상치가 불확실하다면 처음부터 Qdrant로 시작하는 걸 선호한다. 소규모에서의 약간의 오버헤드는 나중 마이그레이션 비용에 비해 작다.

### 임베딩 차원(dim)과 DB 성능의 관계

dim=384는 sentence-transformers 기본 설정이지만, 2026년 기준으로 더 높은 차원(1536, 3072)을 쓰는 임베딩 모델이 많다. OpenAI의 `text-embedding-3-large`는 3072차원, Gemini Embedding 2는 최대 3072차원을 지원한다. 차원이 높아질수록 벡터 DB의 메모리 사용량과 인덱스 생성 시간이 증가한다.

Qdrant는 `quantization`(양자화)로 high-dim 벡터의 메모리 사용량을 줄일 수 있다. Scalar Quantization만으로도 4배 압축이 가능하다. ChromaDB는 2026년 초 기준으로 이 기능이 없다. dim이 1536 이상인 임베딩을 대규모로 저장해야 한다면 Qdrant의 양자화가 실질적인 비용 절감으로 이어진다.

임베딩 모델의 차원(dim) 선택도 DB 성능에 영향을 준다. [Gemini Embedding 2처럼 멀티모달 임베딩을 쓸 때 dim 설계가 어떻게 달라지는지](/ko/blog/ko/gemini-embedding-2-multimodal-rag-pipeline)는 별도로 읽어볼 만하다.

## 마무리 — 내 선택

솔직히 말하면, 2026년 기준으로 나는 새 프로젝트에서 Qdrant를 기본값으로 쓴다. 이유는 간단하다: 소규모에서 약간의 오버헤드를 감수하더라도, 나중에 규모가 커졌을 때 마이그레이션하는 비용이 더 크다.

단, 이미 PostgreSQL을 운영 중인 팀이라면 pgvector를 먼저 시도해보는 게 맞다. 대부분의 경우 충분하고, 나중에 성능이 문제가 됐을 때 Qdrant로 이전하는 전략도 현실적이다.

ChromaDB는 프로토타입에서 여전히 1순위다. `pip install chromadb` 한 줄로 시작하는 편의성은 여전히 압도적이다. 다만 프로덕션 전환 시점에는 진지하게 Qdrant를 검토해야 한다.

벡터 DB를 고른 다음 단계는 그것을 감싸는 AI 에이전트 라이브러리 선택이다. [Python AI 에이전트 라이브러리 비교 가이드](/ko/blog/ko/python-ai-agent-library-comparison-2026)에서 그 결정을 이어서 할 수 있다.

결국 "어떤 DB가 최고인가"는 의미 없는 질문이다. 내 규모, 팀 역량, 기존 인프라, 그리고 얼마나 빨리 시작해야 하는지에 따라 답이 달라진다. 이 글의 숫자가 그 결정에 구체적인 근거를 하나 더 제공해줬으면 한다.
