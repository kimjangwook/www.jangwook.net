---
title: LlamaIndex vs LangChain vs Haystack — 2026年RAG框架实测对比
description: >-
  亲自安装测试了LlamaIndex 0.14、LangChain 1.3和Haystack
  2.30。包含langchain-community弃用警告、代码复杂度测量和InMemory检索实际运行结果的实测比较指南。
pubDate: '2026-06-06'
heroImage: ../../../assets/blog/llamaindex-vs-langchain-vs-haystack-rag-2026/hero.png
tags:
  - rag
  - llamaindex
  - langchain
  - haystack
  - python
relatedPosts:
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.9
    reason:
      ko: Python 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into Python.
      ja: Pythonをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 Python 主题。
  - slug: python-ai-agent-library-comparison-2026
    score: 0.85
    reason:
      ko: Python를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on Python experience.
      ja: Pythonを実際に扱った経験が続く記事です。
      zh: 延续 Python 的实战经验。
  - slug: dena-llm-study-part4-rag
    score: 0.8
    reason:
      ko: 같은 RAG 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same RAG track.
      ja: 同じRAGの流れで併せて読むと役立ちます。
      zh: 在同一 RAG 脉络中可一并阅读。
faq:
  - question: "RAG用LlamaIndex、LangChain还是Haystack更好?"
    answer: "答案取决于具体场景。基础RAG的代码行数LlamaIndex为10行，LangChain和Haystack各为18行。如果让我从零开始三选一，我会选Haystack，因为管线越复杂，显式结构越能让维护变得轻松。"
  - question: "对初学者推荐哪个框架?"
    answer: "推荐LlamaIndex。VectorStoreIndex.from_documents()一次性完成切分、嵌入和索引，仅用10行就能构建完整的RAG，学习曲线最平缓。它在以文档为中心的RAG和快速原型方面尤其出色。"
  - question: "生产环境适合哪个框架?"
    answer: "Haystack更合适。它能把整条管线序列化为单个YAML文件，使配置与代码分离管理，并具备在执行前的构建阶段验证错误连接的类型安全。deepset的企业级支持也是优势。"
  - question: "现在可以用LangChain新建项目吗?"
    answer: "需要谨慎。测试中我遇到了警告，提示langchain-community正在被淘汰、不再积极维护。langchain-core和langchain本身仍在活跃维护，因此新建项目时最好跳过community，只安装langchain-chroma这类独立包。"
---

每次开始Python RAG项目，几乎同时会冒出三个名字：LlamaIndex、LangChain和Haystack。它们都被称为"RAG框架"。可一旦真正装上、交给它们同一份活儿，设计理念的差异就显出来了。

于是我搭了个一次性沙盒，把三个框架全装上。条件相同，数据相同。从pip安装一路跑到InMemory检索，中途撞上一个没料到的弃用警告。任何打算用LangChain新建项目的人，都该先知道这件事。

## 测试环境与版本

```bash
# 安装版本
llama-index-core: 0.14.22
langchain: 1.3.4  
langchain-core: 1.4.1
haystack-ai: 2.30.0

# 环境
Python 3.12.8 / venv / macOS
```

全程无需API密钥，靠InMemory存储就能完成测试。BM25检索(Haystack)、MockEmbedding(LlamaIndex)和FakeEmbeddings(LangChain)让你在不花一分钱模型调用费的情况下，验证完整的管道结构。

## LlamaIndex 0.14: 抽象优先

LlamaIndex构建有效RAG管道所需的代码最少。`VectorStoreIndex.from_documents()`一次性处理文档分割、嵌入和索引化。

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

Settings.llm = OpenAI(model="gpt-4o-mini")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(similarity_top_k=3)

response = query_engine.query("What is the main topic?")
print(response)
```

确实只有10行。代码复杂度测量得出的有意义行数就是10。

`Settings`全局对象是核心。LLM和嵌入模型只需设置一次，之后所有组件自动引用。方便，但如果多个管道需要不同模型，这个全局状态就会成为问题。

```python
# 用MockEmbedding无需API密钥测试结构
from llama_index.core.embeddings.mock_embed_model import MockEmbedding
Settings.embed_model = MockEmbedding(embed_dim=128)
Settings.llm = None

# 索引正常创建
index = VectorStoreIndex.from_documents(docs, transformations=[splitter])
retriever = index.as_retriever(similarity_top_k=2)
results = retriever.retrieve("VectorStoreIndex是什么?")
```

`llama_index.core`中有93个顶级模块。当你不确定需要什么时，搜索一下基本都能找到。文档具体、示例丰富，三者中学习曲线最平缓。

索引持久化后分割为多个文件：`docstore.json`、`default__vector_store.json`、`index_store.json`等。本地开发复用方便，但要记清楚这些文件各自的作用。

## LangChain 1.3：LCEL与意外的弃用警告

LangChain使用LCEL(LangChain表达式语言)。它是一种基于管道运算符的语法，用来把组件串起来。

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(model="gpt-4o-mini")
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
result = chain.invoke("What is the main topic?")
```

`|`管道运算符非常Pythonic直观。所有组件都实现`Runnable`接口，因此`.invoke()`、`.stream()`和`.batch()`在整个链中表现一致。

但测试过程中出现了意外警告：

```
DeprecationWarning: `langchain-community` is being sunset and is 
no longer actively maintained. See 
https://github.com/langchain-ai/langchain-community/issues/674 
for details and migration guidance toward standalone integration packages.
```

**langchain-community已被弃用。** 这不只是一句软性提醒。这个负责数百个集成(Chroma、Qdrant、Pinecone、数十个LLM提供商)的包，正在被`langchain-chroma`、`langchain-qdrant`这类独立包所取代。

实际意义是：使用`from langchain_community import ...`的代码现在还能运行，但LangChain在告诉你迁移。新项目应该完全跳过`langchain-community`，单独安装各集成包。

截至1.3.4，`langchain-core`(1.4.1)和主`langchain`包都在积极维护。community包的废弃并不意味着LangChain本身即将消亡。但如果你有大量`langchain-community`导入，现在就值得制定迁移计划。

在[Python AI智能体库对比2026](/zh/blog/zh/python-ai-agent-library-comparison-2026)中我讨论过更广泛的Python AI生态。LangChain的集成广度仍然无可匹敌，community包废弃只是一个动荡点，而非终结信号。

## Haystack 2.30：显式图的优势

Haystack是三者中最显式的。每个组件通过`add_component()`添加，每个连接通过`connect()`声明。

```python
from haystack import Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.components.builders import PromptBuilder
from haystack.components.generators import OpenAIGenerator

p = Pipeline()
p.add_component("retriever", InMemoryBM25Retriever(document_store=store, top_k=3))
p.add_component("prompt_builder", PromptBuilder(template=template))
p.add_component("llm", OpenAIGenerator(model="gpt-4o-mini"))

p.connect("retriever", "prompt_builder.documents")
p.connect("prompt_builder", "llm.prompt")

result = p.run({"retriever": {"query": "What is the main topic?"}})
```

代码更长，但管道结构一目了然。读`connect("retriever", "prompt_builder.documents")`就能立即了解数据流向。

我无需任何API密钥直接运行了BM25检索：

```python
store = InMemoryDocumentStore()
store.write_documents(docs)

p = Pipeline()
p.add_component("retriever", InMemoryBM25Retriever(document_store=store, top_k=2))

result = p.run({"retriever": {"query": "which framework is best for teams"}})
# Score: 5.307 | For beginners, LlamaIndex has the lowest learning curve. For teams, Haystack wins
# Score: 4.755 | Haystack provides production-grade type-safe pipelines with YAML serialization.
```

类型安全性确实管用。尝试错误连接时，构建阶段就会报错，根本到不了执行那一步。这能及早把集成错误抓出来。

YAML序列化是个被低估的特性：

```python
yaml_str = p.dumps()
# 整个管道序列化为YAML：
# components:
#   cleaner:
#     init_parameters:
#       ascii_only: false
#       remove_empty_lines: true
#       ...
```

能用YAML管理管道配置，意味着无需修改Python代码就能部署配置变更。这在基础设施团队需要处理管道配置的环境中非常有价值。

## 量化对比

直接测量的数据：

| 指标 | LlamaIndex 0.14 | LangChain 1.3 | Haystack 2.30 |
|------|----------------|---------------|----------------|
| RAG管道代码（有意义行数） | **10行** | 18行 | 18行 |
| Core依赖数量 | 28个 | 9个 | 19个 |
| 顶级公开模块 | 93个 | — | — |
| InMemory测试 | MockEmbedding | FakeEmbeddings | BM25直接运行 |
| 管道序列化 | 多个JSON文件 | 无(默认) | **单一YAML** |
| 主要警告 | llms-openai未安装 | **community已弃用** | 无 |

LlamaIndex的28个core依赖最多，因为默认就带上了音频和图像处理支持。LangChain core只有9个，看着精简，可实际使用时还得单独装好几个集成包。

![三个框架的雷达图和柱状图对比](../../../assets/blog/llamaindex-vs-langchain-vs-haystack-rag-2026/comparison-chart.png)

## 选择指南

没有唯一正确答案，但以下是我的思考框架。

**选择LlamaIndex当**：
- 需要快速搭建原型
- 文档中心RAG（PDF、DOCX、HTML解析）是核心用例
- 团队成员能通过LlamaIndex的文档和示例自学
- 需要复杂查询转换（子查询、递归检索）

**选择LangChain当**：
- 已有LangChain代码库（迁移成本真实存在）
- LCEL的函数式链式风格符合团队编码习惯
- 计划使用LangSmith等LangChain生态工具
- 如果有`langchain-community`依赖，请制定迁移计划

**选择Haystack当**：
- 管道配置需要作为生产基础设施管理
- 团队重视类型安全性和显式数据流
- 非工程师需要通过配置文件修改管道行为
- 想要使用deepset的生态系统（Haystack Cookbook等）

## 我的结论

如果今天从零开始选择，我会选Haystack。理由很简单：随着管道变得复杂，显式结构让维护变得更容易。`connect()`声明起初感觉繁琐，但六个月后在调试生产问题时，你会庆幸能直接读懂数据流向。

LlamaIndex在原型阶段确实很快。10行搭建出可用的RAG是真实优势。但如果不理解抽象层下的工作原理，出现问题时调试会很困难。

因为`langchain-community`的问题，我现在对开始新的LangChain项目持谨慎态度。已有代码库继续用没问题，但对于新项目，我想等包整合方案落定后再做决定。

如果计划从RAG扩展到智能体编排，LangGraph、CrewAI、Dapr框架对比提供了下一步决策所需的背景信息。

三个框架都在频繁更新。这些版本号很快就会过时。这就是为什么定期查看各框架的CHANGELOG，比任何比较文章都更重要。

---

*测试环境：Python 3.12.8、llama-index-core 0.14.22、langchain 1.3.4、haystack-ai 2.30.0。截至2026-06-06。全程使用InMemory存储，无需API密钥。*
