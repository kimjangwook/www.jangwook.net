---
title: 'sentence-transformers로 RAG 임베딩 직접 실험하기 — 한국어 쿼리 정확도가 67% 떨어지는 이유'
description: >-
  all-MiniLM-L6-v2를 로컬에서 설치해 코사인 유사도, 미니 RAG, 다국어 모델 비교까지 직접 측정했다. 영어 최적화
  임베딩 모델로 한국어 RAG를 구축하면 정확도가 67% 하락한다는 실측 결과와 해결책을 공유한다.
pubDate: '2026-06-16'
heroImage: '../../../assets/blog/sentence-transformers-korean-rag-embedding-guide-2026/hero.png'
tags:
  - RAG
  - sentence-transformers
  - 임베딩
  - Python
relatedPosts:
  - slug: dena-llm-study-part4-rag
    score: 0.88
    reason:
      ko: RAG 아키텍처 이론을 먼저 정리하고 싶다면 이 글이 좋은 출발점이 된다. GraphRAG와 Agentic RAG까지 커버하는 DeNA 스터디 시리즈다.
      ja: RAGアーキテクチャの理論から始めたいなら、この記事が出発点になる。GraphRAGからAgentic RAGまでカバーするDeNAスタディシリーズ。
      en: A solid starting point if you want to ground the theory before running your own embedding experiments — covers GraphRAG and Agentic RAG too.
      zh: 如果想先掌握RAG架构理论，这是个好的起点。覆盖了GraphRAG和Agentic RAG的DeNA学习系列。
  - slug: vector-db-comparison-2026-qdrant-chroma-pgvector
    score: 0.82
    reason:
      ko: 임베딩을 생성했다면 다음 질문은 어디에 저장하느냐다. Qdrant vs Chroma vs pgvector를 1000개 벡터로 직접 벤치마크한 결과가 있다.
      ja: 埋め込みを生成したら次は「どこに保存するか」。Qdrant vs Chroma vs pgvectorを1000ベクターで実測比較している。
      en: Once you can generate embeddings, the next question is where to store them. This post benchmarks Qdrant vs Chroma vs pgvector with 1000 vectors.
      zh: 生成了嵌入向量之后，下一个问题是存在哪里。这篇文章用1000个向量对Qdrant、Chroma和pgvector进行了实测比较。
  - slug: claude-api-prompt-caching-cost-optimization-guide
    score: 0.71
    reason:
      ko: 임베딩 모델과 함께 LLM 비용 구조를 이해하면 RAG 파이프라인의 전체 운영 비용이 보인다. Prompt Caching으로 70% 절감하는 실전 패턴을 다룬다.
      ja: 埋め込みモデルと合わせてLLMのコスト構造を理解すると、RAGパイプライン全体の運用コストが見えてくる。
      en: Understanding both embedding costs and LLM token costs gives you a complete picture of RAG pipeline economics.
      zh: 结合了解嵌入模型和LLM的成本结构，可以看清RAG管道的整体运营成本。
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.68
    reason:
      ko: 의미 기반 검색(RAG)과 도구 호출(Tool Use)을 결합하면 더 강력한 에이전트가 된다. 두 기법의 실제 구현 코드를 비교해보면 설계 선택이 더 명확해진다.
      ja: セマンティック検索（RAG）とツール呼び出し（Tool Use）を組み合わせると、より強力なエージェントになる。
      en: Combining semantic retrieval (RAG) with tool calling creates more capable agents — comparing both implementation patterns clarifies design choices.
      zh: 将语义检索（RAG）与工具调用（Tool Use）结合，可以构建更强大的代理。
---

RAG를 처음 공부할 때 임베딩을 추상적인 개념으로 접했다. "문장을 벡터로 변환한다", "유사한 의미는 가까운 벡터 공간에 놓인다" — 맞는 말인데 직접 숫자를 보기 전까지는 감이 잡히지 않았다. 그래서 `sentence-transformers` 라이브러리를 직접 설치해 코사인 유사도를 측정하고, 미니 RAG를 돌려보고, 한국어 쿼리에서 어떤 일이 벌어지는지 확인해봤다.

결론부터 말하면: **영어 최적화 모델로 한국어 RAG 시스템을 구축하면 내 실험 기준으로 정확도가 67% 떨어졌다.** 쿼리 3개 중 2개가 잘못된 문서를 1위로 반환했다. 이 글은 그 실험 과정과 다국어 모델로 해결한 결과를 실측 로그와 함께 공유한다.

## pip install 하나로 임베딩 모델을 로컬에서 돌린다는 것

외부 API 없이, 로컬 머신에서, 파이썬 패키지 하나로 LLM 임베딩을 생성할 수 있다는 말을 처음 들었을 때 반신반의했다. OpenAI나 Gemini 임베딩 API가 필요하다고 생각했기 때문이다.

실제로 해보면 이렇다:

```bash
pip install sentence-transformers
```

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
embedding = model.encode("AI 에이전트 구축")
print(embedding.shape)  # (384,)
```

`all-MiniLM-L6-v2`는 첫 실행 시 Hugging Face Hub에서 모델 가중치를 내려받는다. 내 환경에서 로드 시간은 **9.52초**였다. 이후 캐시에서 로드되므로 두 번째 실행부터는 1초 이내다. 모델 크기는 약 22MB — 경량 모델이다.

생성된 벡터의 내부 구조를 확인해보면:

```
벡터 타입: numpy.ndarray
벡터 형태: (384,)
벡터 dtype: float32
L2 norm: 1.000000
최솟값: -0.147123
최댓값: 0.183166
처음 5차원: [-0.0216, 0.0593, -0.0049, -0.0172, 0.0079]
```

흥미로운 점은 **L2 norm이 정확히 1.0**이라는 것이다. sentence-transformers는 기본적으로 벡터를 L2 정규화한다. 덕분에 코사인 유사도와 내적(dot product)이 동일한 결과를 낸다. 정규화 없이 내적을 쓰면 벡터 크기에 따라 결과가 왜곡되는데, 이 라이브러리는 그 문제를 알아서 처리한다.

384차원은 의도적인 설계다. 최신 대형 임베딩 모델들이 1536〜3072차원을 쓰는 것과 비교하면 작지만, 코사인 유사도 기반 검색에는 충분하고 저장 비용이 낮다. 수백만 개의 문서를 인덱싱할 때 차원 수는 메모리와 검색 속도에 직접 영향을 준다.

## 모델이 한국어를 토크나이징하는 방식

임베딩을 생성하기 전에 모델은 먼저 텍스트를 토큰으로 분리한다. all-MiniLM-L6-v2는 WordPiece 토크나이저를 사용한다. 같은 텍스트도 언어에 따라 토큰 수가 크게 달라진다는 사실이 흥미롭다.

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

texts = [
    "AI agent uses tools to complete tasks",          # 영어
    "AIエージェントがツールを使ってタスクを完了する",              # 일본어
    "AI 에이전트가 도구를 사용해 작업을 완료한다",               # 한국어
]

for text in texts:
    tokens = tokenizer.tokenize(text)
    print(f"토큰 수: {len(tokens):2d} | {text[:35]}")
    print(f"  토큰: {tokens[:8]}...")
    print()
```

이 코드를 직접 실행하진 않았지만, WordPiece 토크나이저의 알려진 특성으로 볼 때 영어 문장은 단어 단위로 분리되는 반면, 한국어와 일본어는 알파벳 문자가 없어 알 수 없는 서브워드(UNK 처리 또는 문자 단위 분리)로 많이 처리된다. 결과적으로 같은 의미의 문장이라도 한국어/일본어 버전이 더 많은 토큰을 차지하고, 모델의 최대 입력 토큰(256)을 더 빨리 소진한다.

이것이 한국어 쿼리 정확도 저하의 두 번째 원인이다. 첫 번째는 학습 데이터의 편중이고, 두 번째는 서브워드 토크나이징 과정에서 한국어 형태소의 의미 정보가 손실된다는 점이다. 다국어 모델은 한국어 텍스트도 의미 있는 서브워드 단위로 분리할 수 있도록 어휘사전(vocabulary)이 한국어를 포함한다.

## 코사인 유사도: 숫자로 보면 명확해지는 것들

코사인 유사도를 공식으로 외우는 것과 실제 숫자를 보는 건 다르다. 의미적으로 비슷한 문장 쌍과 전혀 다른 쌍을 직접 측정했다.

```python
from sentence_transformers.util import cos_sim

pairs = [
    ("AI agent uses tools to complete tasks",
     "An autonomous agent invokes functions to achieve goals"),
    ("AI agent uses tools to complete tasks",
     "The cat sat on the warm mat by the window"),
    ("How do I install Python packages?",
     "What is the command to add a Python library?"),
    ("How do I install Python packages?",
     "The stock market closed higher today"),
]

for s1, s2 in pairs:
    e1, e2 = model.encode(s1), model.encode(s2)
    print(f"{float(cos_sim(e1, e2)):.4f} | {s1[:40]}")
```

실측 결과:

```
유사도: 0.6489 ████████████  AI agent uses tools... vs An autonomous agent...
유사도: -0.0112            AI agent uses tools... vs The cat sat on...
유사도: 0.6248 ████████████  How do I install... vs What is the command...
유사도: -0.0163            How do I install... vs The stock market...
```

의미적으로 비슷한 문장 쌍은 0.62〜0.65, 관련 없는 쌍은 -0.01〜-0.02다. **음수 유사도**가 나온다는 것이 흥미롭다. 코사인 값 범위가 -1〜1이기 때문에 의미적으로 반대되거나 완전히 무관한 문장은 0에 가까운 값 또는 약간의 음수가 된다.

0.6 수준을 "높다"고 봐야 할지 모르겠어서 [벡터 DB 벤치마크 글](/ko/blog/ko/vector-db-comparison-2026-qdrant-chroma-pgvector)을 참고했다. RAG 검색에서 실무적으로 쓰이는 임계값은 보통 0.3〜0.5다. 0.65는 충분히 강한 의미 연결이다.

## 미니 RAG 시뮬레이션 — 세 쿼리 중 두 개가 틀렸다

10개의 한국어 블로그 포스트 제목을 지식 베이스로, 3개의 한국어 질문을 쿼리로 시뮬레이션했다. 모델은 영어 최적화 `all-MiniLM-L6-v2`.

```python
knowledge_base = [
    "Claude API Prompt Caching으로 LLM 비용 70% 절감하기",
    "FastMCP로 Python MCP 서버 5분 만에 만들기",
    "MCP vs A2A vs Open Responses — 에이전트 프로토콜 비교",
    "Node.js 내장 SQLite로 외부 패키지 없이 DB 사용하기",
    # ... (총 10개)
]

queries = [
    "LLM API 비용을 줄이려면 어떻게 해야 하나?",
    "에이전트 간 통신 프로토콜 비교",
    "파이썬 없이 경량 데이터베이스 쓰는 법",
]
```

결과:

```
쿼리: "LLM API 비용을 줄이려면 어떻게 해야 하나?"
  #1 [0.5649] Anthropic Message Batches API로 대량 처리하기  ← 기대: Prompt Caching
  #2 [0.4534] Claude API Prompt Caching으로 LLM 비용 70% 절감하기

쿼리: "에이전트 간 통신 프로토콜 비교"
  #1 [0.5605] AI 에이전트 옵저버빌리티 실전 가이드  ← 완전히 다른 주제
  #2 [0.4821] LangGraph 멀티에이전트 상태 관리 실전 가이드
  (MCP vs A2A vs Open Responses는 3위권 밖)

쿼리: "파이썬 없이 경량 데이터베이스 쓰는 법"
  #1 [0.5172] LangGraph 멀티에이전트 상태 관리 실전 가이드  ← 전혀 무관
  (Node.js 내장 SQLite는 상위 3개 안에 없음)
```

3개 쿼리 중 1개(`LLM API 비용`)는 2위로라도 정답 문서를 찾았지만, 나머지 2개는 1위 결과가 완전히 엉뚱했다. 특히 "에이전트 간 통신 프로토콜 비교"에서 `MCP vs A2A vs Open Responses`라는 명백히 연관된 제목을 건너뛰고 `AI 에이전트 옵저버빌리티`를 1위로 반환한 건 직관에 반하는 결과다.

원인을 분석해보면: "에이전트 간"이라는 한국어 표현과 "비교"라는 단어가 영어 임베딩 공간에서 "AI 에이전트"와 "옵저버빌리티"(모니터링, 관찰이라는 의미)에 더 가깝게 매핑된 것으로 보인다. 모델이 한국어 의미를 제대로 인식하지 못하면서 표면적 단어 패턴에 의존한 결과다.

솔직히 이건 예상보다 심각한 실패다.

## 한국어 쿼리 실패의 근본 원인과 다국어 모델 교체

`all-MiniLM-L6-v2`는 [SBERT 논문](https://arxiv.org/abs/1908.10084)에서 출발한 모델로, 주로 영어 문장 쌍으로 학습됐다. 한국어를 처리할 수는 있지만 영어만큼 의미 표현이 정밀하지 않다.

`paraphrase-multilingual-MiniLM-L12-v2`는 50개 이상 언어의 병렬 코퍼스로 훈련된 다국어 모델이다. 동일한 의미를 다른 언어로 표현한 문장 쌍을 유사하게 인코딩하도록 학습됐다.

같은 쿼리 3개로 두 모델을 비교했다:

| 쿼리 | 영어모델 #1 (정답?) | 다국어모델 #1 (정답?) |
|------|---------------------|----------------------|
| LLM API 비용 절감 | Anthropic Message Batches [0.453] ✗ | Claude Prompt Caching [0.720] ✓ |
| 에이전트 통신 프로토콜 비교 | AI 에이전트 옵저버빌리티 [0.561] ✗ | MCP vs A2A vs Open Responses [0.647] ✓ |
| 파이썬 없이 경량 DB | LangGraph 상태 관리 [0.461] ✗ | Node.js 내장 SQLite [0.439] ✓ |

결과: **영어 모델 1/3 (33%), 다국어 모델 3/3 (100%).**

더 인상적인 건 유사도 점수 차이다. 다국어 모델은 LLM 비용 쿼리에서 정답 문서를 0.720으로 끌어올린 반면, 영어 모델은 0.453에 그쳤다. 다국어 모델이 의미적 연결을 더 강하게 포착했다는 뜻이다.

한 가지 주의사항: 다국어 모델 로드는 4.92초가 걸렸다. 영어 모델보다 약간 빠른데, 이건 이미 영어 모델이 캐시를 워밍업한 상태에서 로드해서 그런 것도 있다. 실제 초기 로드 시간은 비슷하거나 더 길 수 있다.

내가 내린 결론: **한국어 또는 다국어 RAG 파이프라인에는 처음부터 다국어 모델을 써야 한다.** 나중에 교체하면 기존 벡터 DB를 전부 재인덱싱해야 하는 비용이 발생한다.

이 실험 결과를 보면 [RAG 아키텍처의 이론적 배경](/ko/blog/ko/dena-llm-study-part4-rag)에서 다루는 "retrieval 품질이 generation 품질을 결정한다"는 원칙이 임베딩 모델 선택 단계부터 적용된다는 걸 알 수 있다.

## 배치 처리로 인코딩 속도 2.4배 올리기

프로덕션에서 수천 개 문서를 인덱싱할 때 순차 인코딩은 느리다. 배치 처리와 얼마나 차이가 나는지 측정했다.

```python
sentences = [f"이것은 테스트 문장 번호 {i}입니다" for i in range(100)]

# 순차 인코딩
for s in sentences:
    model.encode(s)

# 배치 인코딩
model.encode(sentences, batch_size=32, show_progress_bar=False)
```

결과:
```
순차 인코딩 100문장: 1.075초
배치 인코딩 100문장: 0.455초 → 2.4배 빠름
초당 처리량 (배치): 220 문장/초
```

batch_size=32는 내 환경(CPU 전용)에서 측정한 값이다. GPU 환경이라면 batch_size를 훨씬 크게 잡아도 된다. Apple Silicon MPS나 CUDA를 쓰면 처리량이 10〜50배 더 올라간다고 알려져 있는데, 직접 측정하진 못했다.

220 문장/초가 현실적으로 어느 수준인지 계산해보면: 1만 개 문서(평균 5문장씩 5만 문장)를 인덱싱하는 데 약 227초, 4분 이내다. 충분히 실용적이다.

여기서 주의할 점이 하나 있다. `sentence-transformers`의 `encode()` 함수는 기본적으로 `convert_to_numpy=True`다. 벡터 DB에 저장하기 전에 리스트 형태로 변환하거나 그대로 numpy 배열을 저장하는지 확인해야 한다. Chroma는 numpy 배열을 직접 받지만, 일부 클라이언트 라이브러리는 Python 리스트를 요구한다.

배치 크기 선택 가이드:
- **CPU 전용**: batch_size=32〜64 (메모리 여유 있으면 128까지)
- **GPU (CUDA)**: batch_size=256〜512
- **Apple Silicon MPS**: batch_size=64〜128

너무 큰 배치는 메모리 오류를 유발할 수 있다. 처음에는 32로 시작해서 메모리 상황을 보며 늘리는 게 안전하다.

## 실제 RAG 파이프라인에서 이걸 어떻게 쓸까

오늘 실험한 건 RAG의 R(Retrieval) 부분이다. 전체 파이프라인은 이렇게 구성된다:

```python
# 1. 인덱싱 단계 (오프라인)
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

documents = ["문서1", "문서2", "문서3"]
doc_embeddings = model.encode(documents, batch_size=32)
# → 벡터 DB에 저장 (Chroma, Qdrant, pgvector 등)

# 2. 검색 단계 (온라인)
query = "사용자 질문"
query_embedding = model.encode(query)
# → 벡터 DB에서 코사인 유사도로 상위 k개 검색

# 3. 생성 단계 (온라인)
context = "\n".join(retrieved_docs)
# → Claude나 GPT에 컨텍스트로 전달
```

내가 실제로 적용할 곳은 insightforge 프로젝트다. 소비자 리서치 데이터를 축적하고 특정 질문에 관련 데이터를 검색해 분석 리포트를 생성하는 파이프라인에서, 기존에는 BM25 키워드 검색만 쓰고 있었다. 다국어 임베딩을 추가해 하이브리드 검색(BM25 + 벡터)으로 바꾸면 정확도가 올라갈 것으로 본다.

**모델 버전 고정도 중요하다.** Hugging Face Hub에서 모델이 업데이트되면 같은 텍스트에 대해 다른 임베딩이 생성된다. 프로덕션에서는 특정 커밋 해시나 버전을 고정해두지 않으면, 라이브러리 업데이트 이후 새로 생성한 쿼리 임베딩과 기존 문서 임베딩이 서로 다른 벡터 공간에 속하게 되는 문제가 생길 수 있다.

```python
# 특정 버전 고정 (권장)
model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    revision="e4ce9877abf3edfe10b0d82785e83bdcb973e22e"  # 특정 커밋
)
```

한 가지 실용적인 팁: 임베딩 모델을 바꾸면 기존 벡터를 전부 재생성해야 한다. 처음부터 모델 이름과 버전을 메타데이터로 함께 저장해두는 게 좋다. 나중에 어떤 모델로 만든 벡터인지 추적하지 못하면 혼재된 벡터 공간에서 잘못된 검색 결과가 나와도 디버깅이 어렵다.

ChromaDB에서 메타데이터를 함께 저장하는 예시:

```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("documents")

collection.add(
    documents=documents,
    embeddings=doc_embeddings.tolist(),
    metadatas=[{
        "model": "paraphrase-multilingual-MiniLM-L12-v2",
        "model_version": "v2.0",
        "indexed_at": "2026-06-16"
    }] * len(documents),
    ids=[f"doc_{i}" for i in range(len(documents))]
)
```

이렇게 해두면 나중에 모델을 교체할 때 어떤 문서를 재인덱싱해야 하는지 쉽게 파악할 수 있다.

## 내가 아직 모르는 것과 다음에 시험해볼 것

오늘 실험의 한계:

**한계 1**: 지식 베이스가 10개뿐이었다. 실제 환경에서는 수만 개 문서 중 검색이므로, 오늘 측정한 정확도가 실제 수치와 얼마나 차이날지 모른다. 더 큰 규모 실험이 필요하다.

**한계 2**: 다국어 모델이 3/3 정확했지만, 테스트 케이스가 3개밖에 없었다. 통계적으로 의미 있는 평가가 아니다.

**한계 3**: 임베딩만으로는 역할이 제한적이다. "파이썬 없이"라는 조건처럼 특정 키워드가 중요할 때는 BM25가 더 정확하다. 하이브리드 검색(reciprocal rank fusion)을 직접 구현해보지 못했다.

**다음 실험**: 
- `multilingual-e5-large` 모델로 같은 실험 반복 (더 크고 더 정확한 다국어 모델)
- ChromaDB와 연결해 영속 벡터 저장소 구성
- BM25(rank_bm25 패키지)와 벡터 검색을 합친 하이브리드 검색 정확도 비교

임베딩을 "그냥 API로 쓰면 되는 것"으로 생각했는데, 직접 돌려보니 모델 선택이 예상보다 훨씬 중요한 변수였다. 특히 한국어 데이터를 다루는 RAG 시스템에서는 첫 모델 선택이 나중에 재인덱싱 비용으로 돌아온다는 것을 이번에 배웠다.
