---
title: '向量数据库对比 2026 — Qdrant vs ChromaDB vs pgvector 实测基准选型指南'
description: '对Qdrant、ChromaDB、pgvector在1000个向量(dim=384)环境下进行了实际基准测试，涵盖插入速度、查询延迟和过滤性能。提供RAG应用中各场景的明确选型标准，并解释为何小规模下ChromaDB过滤查询比Qdrant更快。'
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

每次开始新的RAG项目，向量数据库的选型总会花掉比预期更多的时间。从"先用Chroma吧"出发，看到Qdrant的基准测试数据后开始动摇，再读一篇pgvector的文章又想回到PostgreSQL。这个循环不断重复，直到真正坐下来自己跑一遍数字才能得出结论。

所以我做了实测。相同条件下对三个数据库进行测量：1000个向量、dim=384、50次查询重复。规模看起来不大，但这正是关键所在——我想了解的是在原型开发到小规模生产这个阶段，各数据库的实际表现。

## 向量数据库在RAG应用中为何重要

在谈数字之前，先明确我们到底在优化什么。不只是"越快越好"这么简单。

在RAG（检索增强生成）流水线中，向量检索处于每次用户查询的关键路径上。处理顺序是：对问题做嵌入 → 向量检索 → 构建上下文 → 调用LLM。LLM调用本身占用1〜5秒，所以你可能觉得向量检索的几毫秒差异无关紧要。

但那只是简单相似度查询的情况。真实生产环境中的RAG总是带有元数据过滤：只检索特定用户的文档、按日期范围过滤、仅包含某一类别。这些带过滤的查询延迟因数据库而异，差距相当显著，这才是选型的核心。

还有架构层面的考量。选择向量数据库不只是存储决策，它决定了基础设施规模、部署复杂度、运维成本，以及日后改变主意时迁移的难度。

如果你还没确定RAG架构，建议先了解[RAG架构的整体设计](/zh/blog/zh/dena-llm-study-part4-rag)，再深入数据库选型会更有上下文。

## ChromaDB — 五分钟上手，然后呢？

ChromaDB"五分钟实现向量检索"的说法是真实的，我验证过了。

```bash
pip install chromadb
```

```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("my_docs")

# 插入向量
collection.add(
    embeddings=[[0.1, 0.2, ...] * 384],  # dim=384
    metadatas=[{"source": "doc1", "category": "tech"}],
    ids=["doc1"]
)

# 带过滤的查询
results = collection.query(
    query_embeddings=[[0.1, 0.2, ...]],
    n_results=5,
    where={"category": "tech"}
)
```

API设计简洁而实用。`add`、`query`、`delete`三个方法覆盖了基本功能。元数据过滤只需一个`where`字典，无需任何预配置。

### ChromaDB的优势

默认的内存模式使测试速度极快。切换到磁盘持久化只需`chromadb.PersistentClient(path="./db")`，切换到客户端-服务器模式是`chromadb.HttpClient(host="localhost")`。接口面积设计得有意精简。

ChromaDB与LangChain、LlamaIndex的集成在三个数据库中最为成熟。如果你在跟教程或示例代码走，大概率用的就是Chroma。这意味着更少的意外，团队上手也更快。

### 需要正视的局限

直接用过之后，我不会在超过一定规模的情况下再把ChromaDB用于生产。数据量超过几万条时，查询性能开始变得不稳定。HNSW索引是有的，但实现的成熟度不如Qdrant，对高负载场景的优化也不在一个水平。

更能说明问题的是：观察各团队的生产实践，"ChromaDB上生产"的案例相当少见。社区中"原型用Chroma、生产用Qdrant"这个模式出现频率太高，不能轻视。这不代表ChromaDB差——它是优秀的起点，只是在几十万个向量之后有明显的性能天花板。

另外，ChromaDB没有官方的集群（水平扩展）支持，单节点是上限。流量增加时，扩展方案受限。

## Qdrant — 以性能为优先

Qdrant用Rust编写，从设计之初就面向生产规模。一条Docker命令就能启动。

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant
```

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

client = QdrantClient("localhost", port=6333)

# 创建集合
client.create_collection(
    collection_name="my_docs",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

# 插入向量
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

# 带过滤的查询
results = client.search(
    collection_name="my_docs",
    query_vector=[0.1, 0.2, ...],
    query_filter=Filter(
        must=[FieldCondition(key="category", match=MatchValue(value="tech"))]
    ),
    limit=5
)
```

API比ChromaDB稍显冗长，需要显式构建`Filter`、`FieldCondition`、`MatchValue`对象。初始阶段感觉有些繁琐，但当你需要表达复杂的嵌套过滤条件时，这种明确性反而是优势。

### Qdrant的强项

HNSW索引的实现是三个数据库中最精细的。超过500万个向量后，Qdrant的查询吞吐量优势变得无可争辩。官方支持分布式集群，并提供乘积量化（Product Quantization）来降低内存占用。Payload索引的支持使得大规模元数据过滤保持高效。

内置的管理界面`localhost:6333/dashboard`确实好用，能查看集合统计、运行测试查询、实时查看数据状态，节省了不少调试时间。

### 需要正视的局限

小规模项目用Qdrant可能是过度设计。运行Docker的成本比ChromaDB内存模式高出一截，可配置参数也更多，调优需要时间。我的基准测试结果有个反直觉的发现：在1000个向量的场景下，Qdrant的过滤查询比ChromaDB慢。原因在下一节详细解释。

如果数据集不超过10万个向量，也不预计会有激进的扩展需求，那你可能在为用不上的性能余量付运维成本。

## pgvector — 已经在用PostgreSQL的话

pgvector是PostgreSQL的扩展，不是在添加新数据库，而是给现有的PostgreSQL加上向量检索能力。

```sql
-- 安装扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建表
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    category VARCHAR(50),
    embedding vector(384)
);

-- 创建HNSW索引
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 插入数据
INSERT INTO documents (content, category, embedding)
VALUES ('文档内容', 'tech', '[0.1, 0.2, ...]');

-- 带过滤的向量检索
SELECT id, content, 1 - (embedding <=> '[0.1, 0.2, ...]') AS similarity
FROM documents
WHERE category = 'tech'
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

Python中通过`psycopg2`或`asyncpg`连接，使用`pgvector`库处理数组。

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

### pgvector的优势

如果已经在用PostgreSQL，追加基础设施的成本为零。现有的ORM、迁移工具、备份策略、监控系统全部照用。SQL的丰富过滤表达能力也完整保留。需要JOIN的场景——比如通过关联用户表只检索某个用户的文档——用SQL写起来完全自然，这是ChromaDB和Qdrant做不到的。

### 需要正视的局限

我认为pgvector存在一定程度的被高估。"用现有Postgres搞定向量"的便利性是真实的，但随着规模增长，与专用向量数据库的性能差距会拉大。更关键的是网络开销问题。我的基准测试中pgvector使用numpy近似——在PostgreSQL部署在独立服务器的实际环境下，每次查询会多出10〜50ms的网络往返延迟，这与ChromaDB内存模式或Qdrant本地Docker的测量结果根本不具可比性。

HNSW索引的正确调优也需要PostgreSQL专业知识。在不调整`m`、`ef_construction`、`ef_search`等参数的情况下直接使用默认值，性能往往达不到预期。没有专职DBA的团队可能会遇到不知道如何调试的瓶颈。

## 我亲自做了实测 — 数字说话

实验环境：

- **向量数量**：1,000个
- **维度(dim)**：384（sentence-transformers标准）
- **查询重复次数**：50次
- **硬件**：MacBook Pro M2，本地运行
- **ChromaDB**：内存模式
- **Qdrant**：Docker（本地）
- **pgvector**：numpy近似（实际PostgreSQL环境需加上网络开销）

```python
import chromadb
import numpy as np
import time
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

DIM = 384
N_VECTORS = 1000
N_QUERIES = 50

# 生成测试数据
np.random.seed(42)
vectors = np.random.randn(N_VECTORS, DIM).astype(np.float32)
vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
query_vectors = np.random.randn(N_QUERIES, DIM).astype(np.float32)
categories = [f"cat_{i % 5}" for i in range(N_VECTORS)]

# ---- ChromaDB 基准测试 ----
chroma_client = chromadb.Client()
collection = chroma_client.create_collection("bench")

# 插入时间
start = time.perf_counter()
collection.add(
    embeddings=vectors.tolist(),
    metadatas=[{"category": c} for c in categories],
    ids=[str(i) for i in range(N_VECTORS)]
)
chroma_insert_time = time.perf_counter() - start

# 普通查询时间
query_times = []
for qv in query_vectors:
    t = time.perf_counter()
    collection.query(query_embeddings=[qv.tolist()], n_results=5)
    query_times.append((time.perf_counter() - t) * 1000)

# 过滤查询时间
filter_times = []
for qv in query_vectors:
    t = time.perf_counter()
    collection.query(
        query_embeddings=[qv.tolist()],
        n_results=5,
        where={"category": "cat_0"}
    )
    filter_times.append((time.perf_counter() - t) * 1000)

print(f"ChromaDB 插入: {chroma_insert_time:.3f}s")
print(f"ChromaDB 查询均值: {np.mean(query_times):.2f}ms, P95: {np.percentile(query_times, 95):.2f}ms")
print(f"ChromaDB 过滤查询均值: {np.mean(filter_times):.2f}ms")
```

### 实验结果

```
=== 插入时间 ===
ChromaDB:  0.263s
Qdrant:    0.163s

=== 普通查询（50次平均）===
ChromaDB:  均值 0.80ms | P95 0.82ms
Qdrant:    均值 0.84ms | P95 1.88ms

=== 过滤查询（50次平均）===
ChromaDB:  均值 2.00ms
Qdrant:    均值 7.02ms

pgvector: numpy近似约 1〜3ms
          （实际PostgreSQL部署需加 10〜50ms 网络开销）
```

![基准测试结果图表](../../../assets/blog/vector-db-comparison-2026-qdrant-chroma-pgvector/benchmark_chart.png)

### 如何解读这些数字

最出乎意料的结果是：<strong>在1000个向量的规模下，ChromaDB的过滤查询（2ms）比Qdrant（7ms）快了3倍以上</strong>。乍看之下反常——Qdrant明明是更复杂的系统，怎么反而更慢？

答案在于架构开销。Qdrant具备Payload索引、分布式过滤、Segment管理等为百万级向量设计的结构。在1000个向量这种小规模下，这套精细的基础设施反而变成了开销，而非优势。ChromaDB在小规模下采用更直接的过滤方式，因此更快。

插入的情况相反，Qdrant更快（0.163s vs 0.263s），Rust实现的优势在这里体现出来。

普通查询两者接近，但Qdrant的P95是1.88ms，ChromaDB是0.82ms。小规模下Qdrant的尾延迟波动更大。

结论：小规模下ChromaDB的简单性胜出。超过500万个向量后，Qdrant的HNSW优化开始真正发挥作用，结果会反转。

## 决策矩阵 — 不同场景选哪个

只看数字可能得出"ChromaDB总是更好"的结论，实际选型要复杂一些。

| 场景 | 推荐 | 原因 |
|------|------|------|
| 原型、黑客松 | ChromaDB | 零配置、API简单、内存即用 |
| 小规模生产（< 10万向量） | ChromaDB 或 pgvector | 简单优先 |
| 已在运行PostgreSQL | pgvector | 零新增基础设施 |
| 中等规模（10万〜500万向量） | Qdrant | 性能与稳定性的平衡 |
| 大规模（500万+ 向量） | Qdrant | HNSW优化、必须有集群 |
| 需要复杂SQL JOIN | pgvector | 完整的SQL表达能力 |
| 预期水平扩展 | Qdrant | 官方支持分布式集群 |
| 最小运维负担 | pgvector（已有Postgres） | 单一系统 |

### 详细选型建议

**选ChromaDB的情形**：需要快速验证概念，团队没有DevOps余力，数据量可以确定不超过几十万个向量。它是直接对接LangChain、LlamaIndex教程的最优工具。

**选Qdrant的情形**：需要承载真实生产流量，预计500万+个向量，或者需要水平扩展。从一开始就用Qdrant，规模扩大时不需要被迫迁移。不过小规模项目下Docker的运维成本相比ChromaDB是实实在在的额外开销。

**选pgvector的情形**：已有PostgreSQL基础设施、有DBA、向量检索需要与现有SQL查询结合。对于没有时间学习新数据库体系的团队，这是最现实的选择。

嵌入模型的维度选择也直接影响向量数据库的性能。[Gemini Embedding 2的多模态嵌入如何改变维度设计权衡](/zh/blog/zh/gemini-embedding-2-multimodal-rag-pipeline)值得结合本文一起阅读。

## 总结 — 我的选择

说实话，2026年的今天，我在新项目中默认选Qdrant。理由很简单：小规模下承受一点额外开销，代价低于日后被迫迁移的成本。从一开始就用Qdrant，意味着生产路径已经就绪。

话虽如此，如果团队已经在运行PostgreSQL，先试试pgvector是对的。大多数情况下够用，日后性能真成问题了再迁移到Qdrant，这个路径是可行的。

ChromaDB在原型阶段依然是首选。`pip install chromadb`一行启动的便利无可匹敌。但一旦向生产过渡，就要认真考量Qdrant了。

选定向量数据库之后，下一步是选择封装它的AI智能体库。[Python AI智能体库比较指南](/zh/blog/zh/python-ai-agent-library-comparison-2026)覆盖了这个后续决策。

"哪个数据库最好"本身是个错误的问题。正确答案取决于你当前的数据规模、团队能力、现有基础设施，以及交付的时间压力。这篇文章的数字，希望能为你的决策多提供一个具体的参考点。
