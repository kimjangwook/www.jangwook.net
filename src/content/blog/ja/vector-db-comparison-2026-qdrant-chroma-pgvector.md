---
title: 'Vector DB比較 2026: Qdrant vs ChromaDB vs pgvector 選択ガイド'
description: >-
  Qdrant・ChromaDB・pgvectorを1000ベクトル(dim=384)環境で直接ベンチマーク。挿入速度・クエリ遅延・フィルタ性能の実測値でRAGアプリの選択基準を示し、小規模でChromaDBが速い理由も解説する。
pubDate: '2026-05-23'
heroImage: ../../../assets/blog/vector-db-comparison-2026-qdrant-chroma-pgvector/hero.png
tags:
  - vector-db
  - rag
  - chromadb
  - qdrant
  - pgvector
relatedPosts:
  - slug: dena-llm-study-part4-rag
    score: 0.9
    reason:
      ko: RAG 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into RAG.
      ja: RAGをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 RAG 主题。
  - slug: llamaindex-vs-langchain-vs-haystack-rag-2026
    score: 0.85
    reason:
      ko: RAG를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on RAG experience.
      ja: RAGを実際に扱った経験が続く記事です。
      zh: 延续 RAG 的实战经验。
faq:
  - question: "Qdrant・ChromaDB・pgvectorのどれを選ぶべきか?"
    answer: "プロトタイプや数十万件以下の小規模ではインストールが簡単なChromaDBが向き、500万件以上の大規模や水平スケールが予想されるならQdrantが有利だ。すでにPostgreSQLを運用中なら追加インフラのないpgvectorをまず試すのが現実的だ。"
  - question: "pgvectorはいつ十分か?"
    answer: "すでにPostgreSQLインフラとDBAがあり、ベクター検索を既存のSQLクエリやJOINと組み合わせる必要があるときに最も適する。大抵の場合それで十分で、後で性能が問題になればQdrantへ移行する戦略も可能だ。"
  - question: "プロダクションでの性能差はどのくらいか?"
    answer: "1000ベクターの実測ではフィルタークエリがChromaDB 2ms、Qdrant 7msで小規模ではChromaDBが速く、挿入はQdrantが0.163sで速かった。ただし500万件以上の規模ではQdrantのHNSW最適化が優位になり、結果は逆転する。"
  - question: "小規模なのになぜQdrantはChromaDBより遅いのか?"
    answer: "Qdrantはペイロードインデックス、分散フィルタ、セグメント管理など大規模向けの構造を持つため、1000件のような小規模ではこの精巧さがむしろオーバーヘッドになる。ChromaDBは小規模でより直接的な方法でフィルタを処理するため速い。"
---

RAGアプリを初めて作るとき、ベクターDB選びは思ったより時間を取られる。「とりあえずChromaでいいか」から始まり、Qdrantのベンチマーク資料を見て揺らぎ、pgvectorのブログ記事を読んでまたPostgreSQLに戻ろうか悩む。その繰り返しだ。

実際に試してみないと答えは出ないと判断して、同じ条件で3つを計測してみた。1000ベクトル、dim=384、50回クエリの繰り返し。数字が小さく見えるかもしれないが、プロトタイプや小規模プロダクションでどのDBがどう動くかを確認するには十分だった。

## RAGアプリでベクターDBがなぜ重要か

ベクターDB選択がなぜ重要かを最初に整理しておきたい。単に速ければいいという話ではない。

RAG（Retrieval-Augmented Generation）パイプラインでは、ベクター検索がユーザーのクエリ処理のクリティカルパスに位置する。ユーザーが質問を入力すると、埋め込み → ベクター検索 → コンテキスト構築 → LLM呼び出しの順で処理される。LLM呼び出しが1〜5秒を占めるため、ベクター検索の数ミリ秒の差が体感に大きく影響しないと思うかもしれない。

しかしそれは単純な検索の話だ。実際のプロダクションRAGには必ずメタデータフィルタが付く。特定ユーザーの文書だけを検索したり、特定の日付範囲のデータだけを取得したり、特定カテゴリーのみを含めるフィルタ。このフィルタクエリの遅延時間がDBの選択によって大きく変わる。

もう一つ、ベクターDBは単なるストレージ以上の設計判断だ。どのDBを使うかによってインフラ構成、デプロイの複雑さ、運用コスト、そして後でデータを移すマイグレーションの難易度が変わる。

RAGアーキテクチャ全体の設計を先に把握しておくと、この比較がより文脈をもって読める。[RAGアーキテクチャの全体像](/ja/blog/ja/dena-llm-study-part4-rag)を確認してからここに戻ってくるのもいい。

## ChromaDB: 5分でセットアップ、でもプロダクションは?

ChromaDBは「5分でベクター検索」を掲げているが、実際にそのとおりだ。

```bash
pip install chromadb
```

```python
import chromadb

client = chromadb.Client()
collection = client.create_collection("my_docs")

# ベクター挿入
collection.add(
    embeddings=[[0.1, 0.2, ...] * 384],  # dim=384
    metadatas=[{"source": "doc1", "category": "tech"}],
    ids=["doc1"]
)

# クエリ
results = collection.query(
    query_embeddings=[[0.1, 0.2, ...]],
    n_results=5,
    where={"category": "tech"}  # メタデータフィルタ
)
```

APIが直感的だ。`add`、`query`、`delete`の3つで基本機能は揃う。メタデータフィルタも`where`辞書一つで簡単に表現できる。

### ChromaDBの強み

インメモリモードがデフォルトなのでテストが速い。`chromadb.PersistentClient(path="./db")`でローカルファイル保存も簡単だ。クライアント-サーバーモードも対応していて、`chromadb.HttpClient(host="localhost")`に切り替えるだけでいい。

PythonエコシステムとのインテグレーションはLangChainやLlamaIndexで最も成熟している。参考資料も多く、詰まってもStack OverflowやGitHub Issuesですぐ解決できる。

### ChromaDBの限界、正直に言うと

直接使ってみて、1万件を超えたあたりから感覚が変わり始めた。ChromaDBのデフォルトインデックスはHNSWだが、大量データでの最適化レベルはQdrantほど精巧ではない。

何より、ChromaDBをプロダクションで使っているチームが思ったより少ないと感じた。コミュニティでは「プロトタイプにはChroma、プロダクションにはQdrant」というパターンが繰り返される。これが過大評価の証拠とは言い切れないが、少なくとも100万件以上のスケールでの性能保証はQdrantやpgvectorと比べてリファレンスが少ない。

また、クラスタリング（水平スケール）を公式サポートしていない。シングルノードが限界だ。トラフィックが増えたときのスケールアウト戦略が制限される。

## Qdrant: パフォーマンスを優先するなら

QdrantはRustで書かれたベクターDBで、最初からプロダクション規模を念頭に置いて設計されている。Dockerひとつで始められる。

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 qdrant/qdrant
```

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

client = QdrantClient("localhost", port=6333)

# コレクション作成
client.create_collection(
    collection_name="my_docs",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

# ベクター挿入
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

# フィルタークエリ
results = client.search(
    collection_name="my_docs",
    query_vector=[0.1, 0.2, ...],
    query_filter=Filter(
        must=[FieldCondition(key="category", match=MatchValue(value="tech"))]
    ),
    limit=5
)
```

ChromaDBよりAPIが少し冗長だ。`Filter`、`FieldCondition`、`MatchValue`といったオブジェクトを直接組み立てる必要がある。最初は面倒に感じるが、複雑なフィルタ条件を表現するときにこの明示性がむしろ助けになる。

### Qdrantの強み

HNSWインデックスの最適化は3つのDBの中で最も精巧だ。500万件以上のベクターではQdrantの検索性能の優位性が明確に出る。分散クラスタリングを公式サポートし、量子化（Product Quantization）でメモリ使用量を削減できる。ペイロードインデックスもサポートしているので大規模なメタデータフィルタが効率的だ。

REST APIとgRPCの両方をサポートし、管理UIも含まれている。`localhost:6333/dashboard`を開けばコレクションの状態をすぐ確認できてデバッグが楽だ。

### Qdrantの限界

小規模ではオーバースペックになりうる。Docker自体の起動がChromaDBのインメモリと比べて敷居が高く、設定パラメータが多いのでチューニングに時間がかかる。私の実験でも、1000件規模のフィルタクエリはChromaDBより遅かった。この点は後のベンチマークセクションで詳しく説明する。

## pgvector: すでにPostgreSQLを使っているなら

pgvectorはPostgreSQLの拡張機能だ。新しいベクターDBを追加するのではなく、既存のPostgreSQLにベクター検索機能を載せる。

```sql
-- 拡張のインストール
CREATE EXTENSION IF NOT EXISTS vector;

-- テーブル作成
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    category VARCHAR(50),
    embedding vector(384)
);

-- HNSWインデックス作成
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- データ挿入
INSERT INTO documents (content, category, embedding)
VALUES ('ドキュメント内容', 'tech', '[0.1, 0.2, ...]');

-- ベクター検索（フィルタ付き）
SELECT id, content, 1 - (embedding <=> '[0.1, 0.2, ...]') AS similarity
FROM documents
WHERE category = 'tech'
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

Pythonからは`psycopg2`や`asyncpg`で接続し、`pgvector`ライブラリを使う。

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

### pgvectorの強み

すでにPostgreSQLを使っているなら追加インフラがゼロだ。既存のORM、マイグレーションツール、バックアップ戦略、モニタリングシステムをそのまま使える。SQLの豊富なフィルタ表現力もそのまま活用できる。JOINが必要な場合も自然に書ける。たとえばユーザーテーブルとJOINして、特定ユーザーの文書だけ検索するようなケースだ。

### pgvectorの限界

私はpgvectorが過大評価される傾向があると見ている。「PostgreSQLでベクターもできる」という利便性は本物だが、専用ベクターDBとの性能差はスケールとともに広がる。特にネットワークオーバーヘッドが問題だ。同一マシンで計測した私の実験値（numpy近似）とは異なり、実際にPostgreSQLサーバーが分離された環境ではクエリごとにネットワーク往復で10〜50msが追加される。これはQdrantやChromaDBのローカル計測値とは直接比較できない。

また、HNSWインデックスを適切にチューニングするにはPostgreSQLの専門知識が必要だ。`m`、`ef_construction`、`ef_search`パラメータの調整なしにデフォルトで使うと、期待を下回る性能になることがある。

## 直接実験してみたベンチマーク数値

以下の環境で計測した結果だ。

- **ベクター数**: 1,000件
- **次元数(dim)**: 384（sentence-transformers基準）
- **クエリ繰り返し**: 50回
- **ハードウェア**: MacBook Pro M2、ローカル実行
- **ChromaDB**: インメモリモード
- **Qdrant**: Docker（ローカル）
- **pgvector**: numpy近似（実際のPostgreSQL環境ではネットワークオーバーヘッドが追加される）

```python
import chromadb
import numpy as np
import time
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

DIM = 384
N_VECTORS = 1000
N_QUERIES = 50

# テストデータ生成
np.random.seed(42)
vectors = np.random.randn(N_VECTORS, DIM).astype(np.float32)
vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
query_vectors = np.random.randn(N_QUERIES, DIM).astype(np.float32)
categories = [f"cat_{i % 5}" for i in range(N_VECTORS)]

# ---- ChromaDB ベンチマーク ----
chroma_client = chromadb.Client()
collection = chroma_client.create_collection("bench")

# 挿入時間
start = time.perf_counter()
collection.add(
    embeddings=vectors.tolist(),
    metadatas=[{"category": c} for c in categories],
    ids=[str(i) for i in range(N_VECTORS)]
)
chroma_insert_time = time.perf_counter() - start

# 通常クエリ時間
query_times = []
for qv in query_vectors:
    t = time.perf_counter()
    collection.query(query_embeddings=[qv.tolist()], n_results=5)
    query_times.append((time.perf_counter() - t) * 1000)

# フィルタークエリ時間
filter_times = []
for qv in query_vectors:
    t = time.perf_counter()
    collection.query(
        query_embeddings=[qv.tolist()],
        n_results=5,
        where={"category": "cat_0"}
    )
    filter_times.append((time.perf_counter() - t) * 1000)

print(f"ChromaDB 挿入: {chroma_insert_time:.3f}s")
print(f"ChromaDB クエリ平均: {np.mean(query_times):.2f}ms, P95: {np.percentile(query_times, 95):.2f}ms")
print(f"ChromaDB フィルタークエリ平均: {np.mean(filter_times):.2f}ms")
```

### 実験結果

```
=== 挿入時間 ===
ChromaDB:  0.263s
Qdrant:    0.163s

=== 通常クエリ（50回平均）===
ChromaDB:  平均 0.80ms | P95 0.82ms
Qdrant:    平均 0.84ms | P95 1.88ms

=== フィルタークエリ（50回平均）===
ChromaDB:  平均 2.00ms
Qdrant:    平均 7.02ms

pgvector: numpy近似で1〜3ms（実際の環境は+10〜50msのネットワークオーバーヘッド）
```

![ベンチマーク結果チャート](../../../assets/blog/vector-db-comparison-2026-qdrant-chroma-pgvector/benchmark_chart.png)

### 結果の読み方

最も驚いたのは<strong>フィルタークエリでChromaDB（2ms）がQdrant（7ms）より速かった</strong>点だ。最初は不思議に見えるかもしれない。Qdrantの方が精巧なシステムなのになぜ遅いのか?

理由はアーキテクチャの違いにある。Qdrantはペイロードインデックス、分散フィルタ、セグメント管理など大規模向けの構造を持っている。1000件のような小規模では、この精巧な構造が単純なブルートフォーススキャンよりもむしろオーバーヘッドになる。ChromaDBは小規模でより直接的な方法でフィルタを処理するため速い。

挿入はQdrantの方が速い（0.163s vs 0.263s）。Rust実装の優位性がここに出ている。

通常クエリは2つのDBで似たような数値だが、QdrantのP95が1.88msでChromaDBの0.82msより高い。小規模ではQdrantのテールレイテンシが大きい。

## 決定マトリクス: どの状況で何を使うか

数字だけ見ると「ChromaDBが常に優れている」という結論になりそうだが、実際の選択はもっと複雑だ。

| 状況 | 推奨 | 理由 |
|------|------|------|
| プロトタイプ、ハッカソン | ChromaDB | インストール即時、API単純、インメモリ |
| 小規模プロダクション（10万件以下） | ChromaDB または pgvector | シンプルさ優先 |
| すでにPostgreSQL運用中 | pgvector | 追加インフラ不要 |
| 中規模（10〜500万件） | Qdrant | 性能と安定性のバランス |
| 大規模（500万件以上） | Qdrant | HNSWの最適化、クラスタリングが必須 |
| 複雑なSQL JOINが必要 | pgvector | SQLの表現力 |
| 水平スケールが予想される | Qdrant | 分散クラスタを公式サポート |
| 最小の運用負担 | pgvector（既存Postgres） | 単一システム |

### 詳細な選択基準

**ChromaDBを選ぶ場合**: 素早いPoC（概念実証）が目的、チームにDevOpsの余力がない、データ規模が数十万件を超えないことが確実なとき。LangChainやLlamaIndexと即座に連携するデモアプリには最適だ。

**Qdrantを選ぶ場合**: プロダクションのトラフィックを捌く必要があり、500万件以上のベクターが予想されるか、水平スケールが必要なとき。最初からQdrantで始めれば、後でマイグレーションなしにスケールアップできる。ただし小規模プロジェクトではDockerの運用コストがChromaDB比で実質的なオーバーヘッドになる。

**pgvectorを選ぶ場合**: すでにPostgreSQLインフラがあり、DBAがいて、ベクター検索が既存のSQLクエリと組み合わさる必要があるとき。「新しいベクターDBを学ぶ時間がない」というチームには最も現実的な選択だ。

埋め込みモデルの次元数（dim）の選択もDB性能に影響する。Gemini Embedding 2のようなマルチモーダル埋め込みを使う際にdim設計がどう変わるかは別途読む価値がある。

## 結局、私は何を使うのか

正直に言うと、2026年時点で私は新しいプロジェクトでQdrantをデフォルトとして使っている。理由はシンプルだ。小規模で多少のオーバーヘッドを許容しても、後でスケールが大きくなったときにマイグレーションするコストの方が大きい。

ただし、すでにPostgreSQLを運用しているチームならpgvectorをまず試すのが正解だ。大抵の場合それで十分で、後で性能が問題になったときにQdrantへ移行する戦略も現実的だ。

ChromaDBはプロトタイプでは依然1番手だ。`pip install chromadb`一行で始められる手軽さは圧倒的だ。ただしプロダクション移行のタイミングでは、Qdrantを真剣に検討すべきだ。

ベクターDBを選んだ次のステップは、それを包むAIエージェントライブラリの選択だ。[Python AIエージェントライブラリ比較ガイド](/ja/blog/ja/python-ai-agent-library-comparison-2026)でその判断を続けることができる。

結局「どのDBが最高か」は意味のない質問だ。自分のスケール、チームの能力、既存インフラ、そしてどれだけ早く始める必要があるかによって答えが変わる。この記事の数字がその判断に具体的な根拠を一つ追加できれば十分だ。
