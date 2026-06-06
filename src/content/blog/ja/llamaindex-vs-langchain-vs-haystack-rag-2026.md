---
title: 'LlamaIndex vs LangChain vs Haystack — 2026年RAGフレームワーク実践比較'
description: 'LlamaIndex 0.14、LangChain 1.3、Haystack 2.30を実際にインストール・テストした。langchain-community deprecation警告、コード複雑度測定、InMemory検索の実行結果を含む実測比較ガイド。'
pubDate: '2026-06-06'
heroImage: '../../../assets/blog/llamaindex-vs-langchain-vs-haystack-rag-2026/hero.png'
tags:
  - rag
  - llamaindex
  - langchain
  - haystack
  - python
relatedPosts:
  - slug: "vector-db-comparison-2026-qdrant-chroma-pgvector"
    score: 0.91
    reason:
      ko: "RAG 파이프라인의 두 축은 프레임워크와 벡터 DB다. 이 글이 프레임워크 선택을 도왔다면, 벡터 DB 실측 비교는 다음 결정을 위한 것이다."
      ja: "RAGパイプラインの二本柱はフレームワークとベクターDBだ。このガイドでフレームワークを選んだなら、ベクターDBの実測比較が次の決断に役立つ。"
      en: "The two pillars of RAG are framework and vector DB. If this guide helped you pick a framework, the vector DB benchmark is for your next decision."
      zh: "RAG管道的两大支柱是框架和向量DB。如果本文帮你选好了框架，向量DB实测对比就是下一个决策。"
  - slug: "python-ai-agent-library-comparison-2026"
    score: 0.84
    reason:
      ko: "RAG 프레임워크를 넘어 에이전트 오케스트레이션까지 필요하다면, Python AI 에이전트 라이브러리 비교가 연속된 결정을 도와준다."
      ja: "RAGフレームワークを超えてエージェントオーケストレーションまで必要な場合、PythonのAIエージェントライブラリ比較が連続した意思決定を助ける。"
      en: "If you need to go beyond RAG into agent orchestration, the Python AI agent library comparison helps with the next connected decision."
      zh: "如果需要超越RAG进入智能体编排领域，Python AI智能体库比较能帮助做出下一个关联决策。"
  - slug: "ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production"
    score: 0.79
    reason:
      ko: "LangChain으로 RAG를 구축하다 LangGraph로 넘어가는 시점이 생긴다. 이 비교 가이드는 그 전환 판단에 필요한 맥락을 제공한다."
      ja: "LangChainでRAGを構築していてLangGraphへ移行するタイミングが来る。この比較ガイドはその移行判断に必要なコンテキストを提供する。"
      en: "There's a moment when building RAG with LangChain you'll wonder about moving to LangGraph. This comparison gives the context needed for that transition decision."
      zh: "在用LangChain构建RAG时，会出现考虑迁移到LangGraph的时机。这份比较指南提供了做出该转型决策所需的背景信息。"
  - slug: "pydantic-ai-type-safe-agent-tutorial-2026"
    score: 0.73
    reason:
      ko: "Haystack의 타입 안전성에 매력을 느꼈다면, Pydantic AI는 에이전트 레이어에서 같은 철학을 적용한다."
      ja: "Haystackの型安全性に魅力を感じたなら、Pydantic AIはエージェントレイヤーで同じ哲学を適用する。"
      en: "If Haystack's type safety appealed to you, Pydantic AI applies the same philosophy at the agent layer."
      zh: "如果Haystack的类型安全性吸引了你，Pydantic AI在智能体层面应用了相同的理念。"
---

RAGアプリを初めて作ろうとドキュメントを開くと、三つの名前がほぼ同時に現れる。LlamaIndex、LangChain、Haystack。どれも「RAGフレームワーク」と呼ばれるが、実際に触ってみると設計思想がかなり違う。

今週、一時的なサンドボックスで三つのフレームワークをすべてインストールし、同じ条件でテストした。pipインストールからInMemory検索の実行まで、そして予期しないdeprecation警告まで、発見したことをそのままお伝えする。

## テスト環境とバージョン

```bash
# インストールバージョン
llama-index-core: 0.14.22
langchain: 1.3.4  
langchain-core: 1.4.1
haystack-ai: 2.30.0

# 環境
Python 3.12.8 / venv / macOS
```

APIキーなしでInMemoryストアを使い、基本的な検索まで実行した。実際の埋め込みなしでも、BM25検索(Haystack)、MockEmbedding(LlamaIndex)、FakeEmbeddings(LangChain)でパイプライン全体の構造を確認できる。

## LlamaIndex 0.14 — 抽象化優先

LlamaIndexは「素早く動くRAG」を作るのに最も少ないコードで済む。`VectorStoreIndex.from_documents()`がドキュメント分割、埋め込み、インデックス作成を一括処理する。

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

実際に10行だ。コード複雑度計測で意味のある行数が10だった。

`Settings`グローバルオブジェクトが核心だ。LLMと埋め込みモデルを一度設定すれば、その後のすべてのコンポーネントがそれを参照する。便利だが、複数のパイプラインが異なるモデルを使う必要がある場合には問題になる可能性がある。

```python
# MockEmbeddingでAPIキーなしに構造テスト可能
from llama_index.core.embeddings.mock_embed_model import MockEmbedding
Settings.embed_model = MockEmbedding(embed_dim=128)
Settings.llm = None

# インデックスは正常に作成される
index = VectorStoreIndex.from_documents(docs, transformations=[splitter])
retriever = index.as_retriever(similarity_top_k=2)
results = retriever.retrieve("VectorStoreIndexとは?")
```

93のトップレベルモジュールがある。何をすべきかわからないとき、`llama_index.core`で検索すれば大体出てくる。ドキュメント自体が具体的で例が豊富なので、最初の学習コストが低い。

インデックスを保存すると`docstore.json`、`default__vector_store.json`、`index_store.json`など複数ファイルに分かれる。ローカル開発での再利用には便利だが、ファイルが多いことは覚えておく必要がある。

## LangChain 1.3 — LCELと予期しない警告

LangChainはLCEL(LangChain Expression Language)というパイプ演算子ベースの構成方式でコードを組み合わせる。

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

パイプ演算子`|`でコンポーネントを接続する方式はPythonicで直感的だ。すべてのコンポーネントが`Runnable`インターフェースを実装しているため、`.invoke()`、`.stream()`、`.batch()`が同じように動作する。

しかしテスト中に予期しない警告が出た。

```
DeprecationWarning: `langchain-community` is being sunset and is 
no longer actively maintained. See 
https://github.com/langchain-ai/langchain-community/issues/674 
for details and migration guidance toward standalone integration packages.
```

**langchain-communityがdeprecatedになった。** 単なる警告ではなく「積極的なメンテナンスが終了する」という内容だ。LangChainエコシステムで数百の統合を担っていたパッケージが、独立パッケージへの分離方針に移行している。

これが何を意味するかというと：以前`langchain-community`でインストールしていたChroma、Qdrantなどのベクターストア統合が、`langchain-chroma`、`langchain-qdrant`などの別パッケージに移動する。今すぐ動作はするが、新しいプロジェクトを始めるなら、この移行方向に従う必要がある。

1.3.4時点で`langchain-core`(1.4.1)と`langchain`(1.3.4)自体は活発にメンテナンスされている。問題は既存コードで`from langchain_community import ...`をどれだけ使っているかだ。

[Python AIエージェントライブラリ比較](/ja/blog/ja/python-ai-agent-library-comparison-2026)で触れたように、LangChainのエコシステムサイズ自体は依然として圧倒的だ。このcommunityパッケージの問題がLangChain全体を捨てる理由にはならないが、知っておいて始める必要がある。

## Haystack 2.30 — 明示的グラフの利点

Haystackはパイプライン構成が最も明示的だ。すべてのコンポーネントを`add_component()`で追加し、すべての接続を`connect()`で宣言する。

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

コードは長くなるが、パイプライン構造が見える。`connect("retriever", "prompt_builder.documents")`を読めばデータの流れが即座に把握できる。

BM25検索をAPIキーなしで直接実行してみた。

```python
# 実際の実行結果
store = InMemoryDocumentStore()
store.write_documents(docs)

p = Pipeline()
p.add_component("retriever", InMemoryBM25Retriever(document_store=store, top_k=2))

result = p.run({"retriever": {"query": "which framework is best for teams"}})
# Score: 5.307 | For beginners, LlamaIndex has the lowest learning curve. For teams, Haystack wins
# Score: 4.755 | Haystack provides production-grade type-safe pipelines with YAML serialization.
```

型安全性が実際に機能する。誤った接続を試みると、ビルド時点でエラーが出る。`list[Document]`を`str`を期待するコンポーネントに接続すれば、パイプライン実行前に検証が失敗する。

HaystackのもうひとつのポイントはYAMLシリアライズだ。

```python
yaml_str = p.dumps()
# パイプライン全体がYAMLで保存される
# components:
#   cleaner:
#     init_parameters:
#       ascii_only: false
#       remove_empty_lines: true
#       ...
```

パイプライン設定をYAMLで管理できるということは、コード変更なしに設定ファイルだけ変えてデプロイできるということだ。インフラチームがパイプライン設定を扱う環境で有用だ。

## 実測数値で見る差異

直接測定した定量データだ。

| 項目 | LlamaIndex 0.14 | LangChain 1.3 | Haystack 2.30 |
|------|----------------|---------------|----------------|
| 基本RAGコード（意味ある行数） | **10行** | 18行 | 18行 |
| Core依存数 | 28個 | 9個 | 19個 |
| トップレベル公開モジュール | 93個 | - | - |
| InMemoryテスト | MockEmbedding | FakeEmbeddings | BM25直接実行 |
| パイプラインシリアライズ | 複数JSONファイル | なし(デフォルト) | **YAML 1ファイル** |
| 主な警告 | llms-openai未インストール | **community deprecated** | なし |

LlamaIndexのcore依存が28個で最多だ。音声処理、画像処理などのパッケージも基本含まれているためだ。LangChain coreは9個で最少だが、実際の使用には統合パッケージを別途インストールする必要がある。

## どの状況にどのフレームワークが合うか

正直、決まった答えはない。それでも私が見た基準を共有する。

**LlamaIndexを選ぶとき**:
- 素早くプロトタイプを作る必要があるとき
- ドキュメント中心RAG（PDF、DOCX、HTMLパース）が核心のとき
- チームメンバーがLlamaIndexドキュメントを読みながら進められるとき
- 複雑なクエリ変換（サブクエリ、再帰検索）が必要なとき

**LangChainを選ぶとき**:
- すでにLangChainのコードベースがある場合（メンテナンス慣性）
- LCELの関数型チェーニングスタイルがチームのコーディングスタイルに合うとき
- LangSmithなどLangChainエコシステムツールを一緒に使う計画があるとき
- ただし`langchain-community`依存がある場合はマイグレーション計画を立てること

**Haystackを選ぶとき**:
- パイプラインをプロダクション設定で管理する必要があるとき
- 型安全性と明示的なデータフローがチームで重要なとき
- 非技術系チームメンバーがYAMLでパイプライン設定を触る必要があるとき
- deepsetのオープンソースエコシステム（Haystack Cookbookなど）を活用したいとき

## 私の結論

三つのフレームワークをゼロから選ぶならHaystackにする。理由はシンプルだ。パイプラインが複雑になるほど、明示的な構造がメンテナンスを楽にする。`connect()`で接続を宣言する方式は最初は面倒だが、6か月後にパイプラインを修正するときに感謝することになる。

LlamaIndexはプロトタイプで本当に速い。10行でRAGを作れるのは無視できない強みだ。ただし、内部がどう動いているかを理解せずに使い続けると、何かがおかしくなったときのデバッグが難しい。

LangChainは`langchain-community`の問題があるため、今から新しいプロジェクトを始めるなら慎重に判断したい。既存のコードベースで使うのは問題ないが、新たに選ぶときはこのパッケージ分離の方向がどう落ち着くかをもう少し見守りたい。

RAGパイプラインを超えてエージェントオーケストレーションへ拡張する計画があるなら、[LangGraph、CrewAI、Daprのフレームワーク比較](/ja/blog/ja/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)を合わせて読んでおくと全体像が掴みやすい。

三つのフレームワークはいずれも活発に更新されている。このガイドのバージョン番号が時代遅れになる日は早く来るだろう。だから定期的に各フレームワークのCHANGELOGを見ることが、結局は最も大切だ。

---

*テスト環境: Python 3.12.8、llama-index-core 0.14.22、langchain 1.3.4、haystack-ai 2.30.0。2026-06-06時点。APIキーなしでInMemoryベースで実行。*
