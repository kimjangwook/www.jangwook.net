---
title: LlamaIndex vs LangChain vs Haystack — RAG Framework Comparison 2026
description: >-
  I installed and tested LlamaIndex 0.14, LangChain 1.3, and Haystack 2.30 in a
  real sandbox. A hands-on comparison covering langchain-community deprecation
  warnings, code complexity, InMemory retrieval results, and a clear decision
  guide.
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
---

Every time you start a RAG project in Python, three names come up almost immediately: LlamaIndex, LangChain, and Haystack. They're all described as "RAG frameworks." But once you actually install them and give them the same job, the design philosophies pull apart.

So I built a throwaway sandbox and installed all three. Same conditions, same data. I went from pip install through InMemory retrieval and code complexity measurements, and somewhere in there I hit a deprecation warning I wasn't expecting. Anyone starting a new LangChain project needs to know about it.

## Test environment and installation

```bash
# Versions tested
llama-index-core: 0.14.22
langchain: 1.3.4  
langchain-core: 1.4.1
haystack-ai: 2.30.0

# Environment
Python 3.12.8 / venv / macOS
```

A few things came up during installation. After installing `llama-index-core`, importing it immediately warns you that `llama-index-llms-openai` is missing. Running without an LLM requires using `MockEmbedding` or similar stub implementations.

LangChain threw a deprecation warning the moment I installed `langchain-community`. I'll cover that in detail below. Haystack installed cleanly with no warnings.

No API keys required. I used InMemory stores throughout. BM25 retrieval (Haystack), MockEmbedding (LlamaIndex), and FakeEmbeddings (LangChain) let you validate the full pipeline structure without spending on model calls.

## LlamaIndex 0.14: abstraction-first design

LlamaIndex needs the fewest lines for a working RAG pipeline. `VectorStoreIndex.from_documents()` handles splitting, embedding, and indexing in one call.

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

That's 10 meaningful lines. My code complexity measurement landed at exactly 10.

The `Settings` global object is the centerpiece. Set the LLM and embedding model once, and every component that follows picks them up automatically. Convenient. But if you have multiple pipelines needing different models, that global state becomes a problem.

### Testing without an API key

```python
from llama_index.core.embeddings.mock_embed_model import MockEmbedding
from llama_index.core.node_parser import SentenceSplitter

Settings.embed_model = MockEmbedding(embed_dim=128)
Settings.llm = None  # No LLM needed for indexing

splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
index = VectorStoreIndex.from_documents(docs, transformations=[splitter])
retriever = index.as_retriever(similarity_top_k=2)
results = retriever.retrieve("What is VectorStoreIndex?")
```

Persistence creates five separate files: `docstore.json`, `default__vector_store.json`, `index_store.json`, `image__vector_store.json`, `graph_store.json`. More files than the other two frameworks, but each has a clear purpose.

93 top-level modules live in `llama_index.core`. When you're not sure what you need, it's in there somewhere. `SubQuestionQueryEngine`, `RouterQueryEngine`, `RecursiveRetriever`: the advanced retrieval patterns are implemented and ready to use.

### Strengths and weaknesses

Strengths:
- Lowest code count: 10 lines for complete RAG
- Rich document loaders: 80+ readers (PDF, DOCX, HTML, images, video)
- Advanced retrieval patterns: SubQuestion, HyDE, RAG Fusion built in
- Dense documentation and examples for every use case

Weaknesses:
- `Settings` global state can conflict across multiple pipelines in the same process
- Deep abstraction makes debugging non-obvious failures harder
- 28 core dependencies pull in packages you may never use

## LangChain 1.3: LCEL and a deprecation you need to know about

LangChain builds chains using LCEL (LangChain Expression Language). It's a pipe-operator syntax that connects components together.

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o-mini")
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(documents, embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

prompt = ChatPromptTemplate.from_template(
    "Context: {context}\n\nQuestion: {question}"
)

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
result = chain.invoke("What is the main topic?")
```

The `|` pipe operator is genuinely Pythonic. Every component implements the `Runnable` interface, so `.invoke()`, `.stream()`, and `.batch()` work identically across the chain. That uniformity is a real practical benefit.

### The langchain-community deprecation

Then I ran into this during testing:

```
DeprecationWarning: `langchain-community` is being sunset and is 
no longer actively maintained. See 
https://github.com/langchain-ai/langchain-community/issues/674 
for details and migration guidance toward standalone integration packages.
```

**langchain-community is being deprecated.** This isn't just a soft warning. The package that handled hundreds of integrations is being sunset in favor of standalone packages.

What was:
```python
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
```

Is now:
```bash
pip install langchain-chroma
pip install langchain-huggingface
```

```python
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
```

For existing codebases, everything still runs. For new projects, skip `langchain-community` entirely and install integration packages individually. If your codebase is heavy on `from langchain_community import ...`, now is a good time to plan a migration.

As of 1.3.4, the package breakdown:
- `langchain-core` 1.4.1 — Runnable interface, base abstractions (actively maintained)
- `langchain` 1.3.4 — chain implementations (actively maintained)
- `langchain-community` 0.4.2 — **deprecated**, migrating to standalone packages

I covered this ecosystem in [Python AI agent library comparison 2026](/en/blog/en/python-ai-agent-library-comparison-2026). LangChain's integration breadth is still unmatched. The community sunset is turbulence, not a death sentence.

### InMemory test

```python
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.embeddings import FakeEmbeddings
from langchain_core.runnables import RunnableLambda

fake_embeddings = FakeEmbeddings(size=128)
vectorstore = InMemoryVectorStore.from_documents(splits, fake_embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

results = retriever.invoke("LCEL pipe operator")
# Result: LangChain 1.3 uses LCEL (LangChain Expression Language) with pipe operator.
```

`InMemoryVectorStore` lives in `langchain-core`, so no extra packages are needed for basic testing.

### Strengths and weaknesses

Strengths:
- LCEL pipe syntax is intuitive and Pythonic
- Largest ecosystem: most integrations, community resources, Stack Overflow answers
- LangSmith, LangServe ecosystem for tracing and serving
- Lightest core dependency footprint (9 packages)

Weaknesses:
- **langchain-community deprecated**, so new projects need to avoid it
- Rapid API churn between versions causes compatibility surprises
- Deep stack traces make error messages hard to parse

## Haystack 2.30: explicit graphs and YAML serialization

Haystack is the most explicit of the three. Every component gets `add_component()`, every connection gets `connect()`.

```python
from haystack import Pipeline
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.preprocessors import DocumentCleaner, DocumentSplitter
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.components.builders import PromptBuilder
from haystack.components.generators import OpenAIGenerator

template = """
Context:
{% for doc in documents %}{{ doc.content }}{% endfor %}

Question: {{ question }}
Answer:
"""

document_store = InMemoryDocumentStore()

p = Pipeline()
p.add_component("cleaner", DocumentCleaner())
p.add_component("splitter", DocumentSplitter(split_by="word", split_length=200))
p.add_component("retriever", InMemoryBM25Retriever(document_store=document_store))
p.add_component("prompt_builder", PromptBuilder(template=template))
p.add_component("llm", OpenAIGenerator(model="gpt-4o-mini"))

p.connect("cleaner.documents", "splitter.documents")
p.connect("retriever", "prompt_builder.documents")
p.connect("prompt_builder", "llm.prompt")
```

More lines, but the data flow is readable. `connect("retriever", "prompt_builder.documents")` tells you exactly how data moves through the system.

### Live BM25 retrieval test

I ran BM25 retrieval without any API key:

```python
store = InMemoryDocumentStore()
store.write_documents([
    Document(content="LlamaIndex excels at document-centric RAG with rich query abstractions."),
    Document(content="LangChain LCEL is best for chaining multiple AI components with pipe syntax."),
    Document(content="Haystack provides production-grade type-safe pipelines with YAML serialization."),
    Document(content="For beginners, LlamaIndex has the lowest learning curve. For teams, Haystack wins."),
])

p = Pipeline()
p.add_component("retriever", InMemoryBM25Retriever(document_store=store, top_k=2))

result = p.run({"retriever": {"query": "which framework is best for teams"}})
# Score: 5.307 | For beginners, LlamaIndex has the lowest learning curve. For teams, Haystack wins.
# Score: 4.755 | Haystack provides production-grade type-safe pipelines with YAML serialization.
```

BM25 picked up "teams" correctly and ranked the relevant document first.

### YAML serialization in practice

```python
yaml_str = p.dumps()
with open("rag_pipeline.yaml", "w") as f:
    f.write(yaml_str)

# Later, load and run
from haystack import Pipeline
loaded_p = Pipeline.loads(yaml_str)
```

The output looks like this:
```yaml
components:
  cleaner:
    init_parameters:
      ascii_only: false
      remove_empty_lines: true
      remove_extra_whitespaces: true
    type: haystack.components.preprocessors.document_cleaner.DocumentCleaner
connections:
  - receiver: splitter.documents
    sender: cleaner.documents
```

A YAML-serialized pipeline means you can version configuration separately from code. Infra teams can modify pipeline parameters without touching Python, and config changes ship without a code review. You won't care about any of this until the day you suddenly do. Then you'll wish you'd had it from the start.

### Type safety actually works

```python
# Try to connect incompatible types
p.connect("retriever", "prompt_builder.wrong_input")
# PipelineConnectError: 
# Cannot connect 'retriever.documents' (list[Document]) to 
# 'prompt_builder.wrong_input' — no such input
```

Incorrect connections fail at build time, not execution time. This catches integration bugs before they become production incidents.

### Strengths and weaknesses

Strengths:
- Pipeline YAML serialization for production config management
- Type safety: connection errors caught before execution
- Explicit graph makes data flow readable directly from code
- deepset's enterprise support, Haystack Cookbook, Hayhooks

Weaknesses:
- More boilerplate: same functionality requires roughly 2x LlamaIndex's code
- Steeper initial setup and learning curve
- Smaller ecosystem than LangChain

## Quantitative comparison

Numbers I measured directly:

| Metric | LlamaIndex 0.14 | LangChain 1.3 | Haystack 2.30 |
|--------|----------------|---------------|----------------|
| RAG pipeline code (meaningful lines) | **10** | 18 | 18 |
| Core dependencies | 28 | **9** | 19 |
| Top-level public modules | 93 | — | — |
| Pipeline serialization | 5 JSON files | None (default) | **Single YAML** |
| InMemory testing | MockEmbedding | FakeEmbeddings | **BM25 live run** |
| Type safety | Weak | Medium | **Strong** |
| Notable warnings | Missing llms-openai | **community deprecated** | None |

![Radar and bar comparison chart from sandbox measurements](../../../assets/blog/llamaindex-vs-langchain-vs-haystack-rag-2026/comparison-chart.png)

## Vector store integration status

All three support the major vector stores, but the integration paths differ:

**LlamaIndex**: Separate packages per store:
```bash
pip install llama-index-vector-stores-qdrant
pip install llama-index-vector-stores-chroma
```

**LangChain**: Moving from `langchain-community` to standalone packages:
```bash
pip install langchain-chroma    # ✅ standalone (recommended)
pip install langchain-qdrant    # ✅ standalone (recommended)
# from langchain_community.vectorstores import Chroma  # ⚠️ deprecated
```

**Haystack**: Official integrations via `haystack-integrations`:
```bash
pip install chroma-haystack
pip install qdrant-haystack
```

I benchmarked Qdrant, ChromaDB, and pgvector directly in the [Vector DB comparison 2026](/en/blog/en/vector-db-comparison-2026-qdrant-chroma-pgvector). Whichever framework you choose, the vector store decision is a separate concern that matters a lot.

## Decision guide

No single right answer, but here's my decision framework.

**Choose LlamaIndex when**:
- You need a prototype running today
- Document-centric RAG (PDF, DOCX, HTML parsing) is the core use case
- Advanced retrieval patterns like sub-queries and recursive retrieval are needed
- Small team or solo developer where speed-to-prototype matters most

**Choose LangChain when**:
- You already have a LangChain codebase (migration cost is real)
- LCEL's functional chaining style fits your team's patterns
- You're invested in LangSmith or other LangChain ecosystem tooling
- If you have `langchain-community` dependencies, audit them and migrate now

**Choose Haystack when**:

```python
# Pipeline config lives in YAML, deployed separately from code
pipeline = Pipeline.load("production_rag.yaml")
result = pipeline.run({"retriever": {"query": query}})
```

- Pipeline config needs to be managed as production infrastructure
- Type safety and explicit data flow matter to your team
- Non-engineers need to modify pipeline behavior via config files
- Medium to large teams planning for long-term maintenance

## Community and ecosystem

Rough GitHub star counts (June 2026):
- LangChain: 90,000+
- LlamaIndex: 35,000+
- Haystack: 18,000+

LangChain dominates on ecosystem size. But numbers aren't everything. Haystack is backed by deepset as a full-time engineering team, which means consistent maintenance and enterprise support. LlamaIndex grew rapidly through 2024 and has an active community. All three are shipping updates regularly.

## My take

If I were choosing from scratch today, I'd go with Haystack. As pipelines grow more complex, explicit structure makes maintenance easier. The `connect()` declarations feel verbose initially, but six months in, when you're debugging a production issue at 2am, you'll appreciate being able to read the data flow directly from the code. The YAML serialization feels like overkill early on. Then your infra and code change cycles diverge, and you'll wish you had it from the start.

LlamaIndex is genuinely fast for prototypes. 10 lines to a working RAG is a real advantage. But without understanding what's happening under the abstraction, debugging gets hard when things break in unexpected ways.

LangChain's `langchain-community` situation makes me cautious about starting new projects with it right now. Existing codebases are fine to maintain. For greenfield projects, I'd want to see how the community-to-standalone migration lands before making a long-term bet.

If you're planning to extend beyond RAG into agent orchestration, the LangGraph, CrewAI, Dapr agent framework comparison gives the context for the next connected decision.

All three frameworks update frequently. These version numbers will be outdated before long. That's why checking each framework's CHANGELOG regularly matters more than any comparison article.

---

*Test environment: Python 3.12.8, llama-index-core 0.14.22, langchain 1.3.4, haystack-ai 2.30.0. As of 2026-06-06. All retrieval tested without API keys using InMemory stores.*
