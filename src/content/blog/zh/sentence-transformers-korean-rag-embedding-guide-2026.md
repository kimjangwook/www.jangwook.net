---
title: '用sentence-transformers实测RAG嵌入 — 韩语查询准确率为何下降67%'
description: >-
  在本地安装all-MiniLM-L6-v2，直接测量余弦相似度、运行迷你RAG，并比较英语与多语言嵌入模型。
  用英语优化模型构建韩语RAG系统时，准确率下降67%的实测结果与解决方案。
pubDate: '2026-06-16'
heroImage: '../../../assets/blog/sentence-transformers-korean-rag-embedding-guide-2026/hero.png'
tags:
  - RAG
  - sentence-transformers
  - 嵌入向量
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
faq:
  - question: "韩语RAG该用sentence-transformers还是OpenAI/Cohere的嵌入API？"
    answer: "如果数据隐私重要、希望把嵌入成本降为零、且有GPU或CPU资源，本地sentence-transformers（multilingual-e5、paraphrase-multilingual）更合适。如果想避免运维基础设施、调用量较小、需要顶级多语言质量，托管API更有利。正如本文实验所示，只要涉及韩语就要避开纯英语模型。"
  - question: "用all-MiniLM-L6-v2构建韩语RAG到底哪里出错？"
    answer: "该模型主要用英语句子对训练，对韩语语义的表达精度较低。本文的迷你RAG中，3个韩语查询有2个在第1名返回了错误文档，换成多语言模型后3个全部找回正确答案。"
  - question: "以后更换嵌入模型会怎样？"
    answer: "更换模型会改变向量空间，因此必须重新编码所有文档。所以涉及韩语数据时应该一开始就选多语言模型，并把模型名称和版本作为元数据与每个向量一起存储。"
  - question: "仅靠嵌入向量检索质量够吗？"
    answer: "当某个关键词约束很重要时，例如不用Python，BM25这类关键词检索比稠密嵌入更准确。实务中标准解法是把BM25与向量结果通过reciprocal rank fusion融合的混合检索。"
---

刚开始学RAG时，我把嵌入向量当作抽象概念接受下来。"句子转换成向量"、"相似的含义在向量空间中靠近"。这些说法都对，但在真正看到数字之前，始终感觉不够直观。于是我在本地安装了`sentence-transformers`库，直接测量余弦相似度，跑了一个迷你RAG，确认了韩语查询中会发生什么。

先说结论：**用英语优化的嵌入模型构建韩语RAG系统，在我的实验中准确率下降了67%。** 3个查询中有2个返回了错误的文档作为第一名。这篇文章记录了那个实验过程，以及切换到多语言模型的解决结果，附带真实的运行日志。

## pip install一条命令就能在本地运行嵌入模型

外部API无需，本地机器，一个Python包就能生成LLM嵌入。

```bash
pip install sentence-transformers
```

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
embedding = model.encode("构建AI代理")
print(embedding.shape)  # (384,)
```

`all-MiniLM-L6-v2`在首次运行时从Hugging Face Hub下载模型权重。在我的环境中加载时间为**9.52秒**。之后从缓存加载，第二次以后在1秒以内。模型大小约22MB，真正的轻量级模型。

检查生成向量的内部结构：

```
向量类型: numpy.ndarray
向量形状: (384,)
向量dtype: float32
L2范数: 1.000000
最小值: -0.147123
最大值: 0.183166
前5维: [-0.0216, 0.0593, -0.0049, -0.0172, 0.0079]
```

有趣的是**L2范数恰好为1.0**。sentence-transformers默认对向量进行L2归一化，因此余弦相似度和内积（dot product）返回相同结果。这是一个很好的特性，计算相似度前不需要手动归一化。

384维是有意为之的设计。与最新大型嵌入模型使用的1536〜3072维相比较小，但对基于余弦相似度的检索已经足够，存储成本也低。

## 余弦相似度：数字让一切变得清晰

```python
from sentence_transformers.util import cos_sim

pairs = [
    ("AI agent uses tools to complete tasks",
     "An autonomous agent invokes functions to achieve goals"),
    ("AI agent uses tools to complete tasks",
     "The cat sat on the warm mat by the window"),
]

for s1, s2 in pairs:
    e1, e2 = model.encode(s1), model.encode(s2)
    print(f"{float(cos_sim(e1, e2)):.4f}")
```

实测结果：

```
相似度: 0.6489 ████████████  AI代理 uses tools vs autonomous agent invokes functions
相似度: -0.0112            AI代理 uses tools vs The cat sat on the mat
相似度: 0.6248 ████████████  如何安装Python包 vs 添加Python库的命令
相似度: -0.0163            如何安装Python包 vs 股市今天收高
```

语义相似的句子对在0.62〜0.65，不相关的对在-0.01〜-0.02。**出现负相似度**令人惊讶。余弦值范围是-1〜1，所以完全不相关的句子自然落在0附近，有时略微为负。

参考[向量数据库基准文章](/zh/blog/zh/vector-db-comparison-2026-qdrant-chroma-pgvector)可知，RAG检索中实际使用的阈值通常是0.3〜0.5。0.65已经是相当强的语义关联。

## 迷你RAG模拟 — 3个查询中2个失败

以10篇韩语博客文章标题为知识库，3个韩语问题为查询进行了模拟。模型使用英语优化的`all-MiniLM-L6-v2`。

实测结果：

```
查询："如何降低LLM API成本？"
  #1 [0.5649] 用Anthropic Message Batches API进行批量处理  ← 期望: Prompt Caching
  #2 [0.4534] Claude API Prompt Caching降低LLM成本70%

查询："代理间通信协议比较"
  #1 [0.5605] AI代理可观测性实战指南  ← 完全不同的主题
  (MCP vs A2A vs Open Responses 未进入前3名)

查询："不用Python的轻量级数据库"
  #1 [0.5172] LangGraph 多代理状态管理  ← 完全无关
  (Node.js内置SQLite未进入前3名)
```

3个查询中只有1个（LLM API成本）在第2名找到了正确文档，其余2个第1名结果完全错误。这比预期严重得多。

## 切换到多语言模型后的变化：3/3全部正确

`all-MiniLM-L6-v2`主要用英语句子对训练。`paraphrase-multilingual-MiniLM-L12-v2`则用50多种语言的平行语料训练，学会将不同语言中相同含义的句子对编码得相近。

同样3个查询，两个模型的比较：

| 查询 | 英语模型 #1（正确?） | 多语言模型 #1（正确?） |
|------|---------------------|----------------------|
| 降低LLM API成本 | Message Batches [0.453] ✗ | Prompt Caching [0.720] ✓ |
| 代理通信协议比较 | 可观测性 [0.561] ✗ | MCP vs A2A [0.647] ✓ |
| 不用Python的轻量级DB | LangGraph [0.461] ✗ | Node.js SQLite [0.439] ✓ |

结果：**英语模型1/3（33%），多语言模型3/3（100%）。**

[RAG架构理论文章](/zh/blog/zh/dena-llm-study-part4-rag)中提到"检索质量决定生成质量"的原则，这个实验表明，这一原则从嵌入模型选择阶段就开始适用了。

我的结论：**韩语或多语言RAG管道应该一开始就使用多语言模型。** 事后切换意味着需要对整个向量数据库重新进行索引，这对大型语料库来说是不小的运营成本。

## 批处理让编码速度提升2.4倍

```python
sentences = [f"这是测试句子编号 {i}" for i in range(100)]

# 逐条编码: 1.075秒
for s in sentences:
    model.encode(s)

# 批量编码: 0.455秒
model.encode(sentences, batch_size=32, show_progress_bar=False)
```

```
逐条编码 100句: 1.075秒
批量编码 100句: 0.455秒 → 快2.4倍
吞吐量（批量）: 220句/秒
```

220句/秒在实际应用中意味着：1万篇文档（平均5句，共5万句）的索引构建约需227秒，不到4分钟。

## 在真实RAG管道中的应用

今天的实验覆盖了RAG中的R（检索）部分。完整的管道：

```python
# 第1步：构建索引（离线，运行一次）
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
doc_embeddings = model.encode(documents, batch_size=32)
# 存入向量数据库（Chroma、Qdrant、pgvector等）

# 第2步：查询时检索（在线）
query_embedding = model.encode(user_query)
# 从向量数据库按余弦相似度检索前k项

# 第3步：生成（在线）
context = "\n".join(retrieved_docs)
# 将上下文传递给Claude或其他LLM
```

一个实用提示：请将模型名称与嵌入向量一起存储为元数据。如果以后更换模型，需要重新生成所有嵌入。没有元数据追踪的话，混合了不同嵌入空间的向量会产生隐蔽的检索质量下降，调试起来非常困难。

## 什么时候用sentence-transformers，什么时候避开

整理这次实验时，留下一个问题：韩语RAG是不是无条件该用本地嵌入？答案取决于场景。

**本地sentence-transformers适合的场景：**

- **数据不能离开内网时。** 对于公司内部文档、医疗或法律数据，调用外部API本身就是合规问题，本地模型几乎是唯一选择。
- **嵌入调用量大、API费用成为负担时。** 如果定期对数百万篇文档重新索引，启动一次模型远比按次计费的API便宜。
- **离线或本地部署环境。** 在隔离网络或边缘设备上根本无法访问外部API。
- **混有韩语的多语言数据。** `multilingual-e5`或`paraphrase-multilingual-MiniLM-L12-v2`这类多语言模型会把包括韩语在内的50多种语言映射到同一个向量空间。

**OpenAI/Cohere嵌入API或其他方法更优的场景：**

- **不想运维基础设施时。** 如果不想自己处理GPU供给、模型版本管理和扩缩容，托管API的便利性很大。
- **需要顶级多语言质量但调用量低时。** OpenAI `text-embedding-3-large`和Cohere `embed-multilingual-v3`处于基准前列，每月几万次调用成本也极小。
- **精确关键词匹配比语义相似更重要时。** 如果核心是精确的术语、代码或专有名词匹配，BM25这类关键词检索往往胜过稠密检索。实务中两者的混合常常才是答案。
- **嵌入不是RAG质量瓶颈时。** 如果分块策略或重排序有更大改进空间，更换嵌入模型并非优先事项。

简而言之，在混有韩语的数据上只要避开纯英语模型即可。之后选本地还是API，是隐私、成本和运维负担之间的权衡问题。

## 我还不知道的和接下来要尝试的

**局限1**：知识库只有10篇。在数万篇文档中检索的实际性能可能很不一样。

**局限2**：多语言模型3/3正确，但测试用例只有3个，不具备统计意义。

**局限3**：嵌入向量有已知的局限性。特定关键词很重要时，BM25比密集检索更准确。混合检索（BM25 + 向量）是标准解决方案，但我还没有实现。

**下一步**：用`multilingual-e5-large`进行同样的实验，搭建持久化ChromaDB存储，比较混合检索与纯向量检索的准确率。

我原本认为嵌入模型是可以随意替换的组件。67%的准确率差距改变了这个看法。对于非英语RAG系统，模型选择是影响整个下游管道的首要决策。

## 参考资料

- [Sentence Transformers官方文档（SBERT.net）](https://www.sbert.net) — 库的用法、归一化、模型选择指南
- [paraphrase-multilingual-MiniLM-L12-v2模型卡（Hugging Face）](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) — 支持50种语言，384维输出
- [MTEB嵌入基准排行榜（Hugging Face）](https://huggingface.co/spaces/mteb/leaderboard) — 多语言嵌入模型性能比较
- [Sentence-BERT论文（Reimers & Gurevych, 2019）](https://arxiv.org/abs/1908.10084) — sentence-transformers的理论基础
