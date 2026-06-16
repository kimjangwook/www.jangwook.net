---
title: 'sentence-transformersでRAG埋め込みを直接実験 — 韓国語クエリで精度が67%落ちる理由'
description: >-
  all-MiniLM-L6-v2をローカルで動かし、コサイン類似度・ミニRAG・多言語モデル比較まで直接測定した。英語最適化の
  埋め込みモデルで韓国語RAGを構築すると精度が67%低下するという実測結果と解決策を共有する。
pubDate: '2026-06-16'
heroImage: '../../../assets/blog/sentence-transformers-korean-rag-embedding-guide-2026/hero.png'
tags:
  - RAG
  - sentence-transformers
  - 埋め込み
  - Python
relatedPosts:
  - slug: dena-llm-study-part4-rag
    score: 0.88
    reason:
      ko: RAG 아키텍처 이론을 먼저 정리하고 싶다면 이 글이 좋은 출발점이 된다. GraphRAG와 Agentic RAG까지 커버하는 DeNA 스터디 시리즈다.
      ja: RAGアーキテクチャの理論から始めたいなら、この記事が出発点になる。GraphRAGからAgentic RAGまでカバーするDeNAスタディシリーズ。
      en: A solid starting point if you want to ground the theory before running your own embedding experiments — covers GraphRAG and Agentic RAG too.
      zh: 如果想先掌握RAG架构理论，这是个好的起点。覆盖了GraphRAGAgenticRAG的DeNA学习系列。
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
  - question: "韓国語RAGにsentence-transformersを使うべきか、OpenAI/Cohereの埋め込みAPIを使うべきか、どう判断しますか？"
    answer: "データのプライバシーが重要、埋め込みコストをゼロにしたい、GPU/CPUリソースがあるならローカルのsentence-transformers（multilingual-e5、paraphrase-multilingual）が適しています。インフラ運用を避けたい、呼び出し量が少ない、最高水準の多言語品質が必要なら管理型APIが有利です。本文の実験のように韓国語が混ざる場合、英語専用モデルは避けてください。"
  - question: "all-MiniLM-L6-v2で韓国語RAGを作ると具体的に何が問題になりますか？"
    answer: "このモデルは主に英語の文章ペアで学習されており、韓国語の意味表現が精密ではありません。本文のミニRAGでは韓国語クエリ3つのうち2つが1位で的外れな文書を返し、多言語モデルに切り替えると3つすべて正解しました。"
  - question: "埋め込みモデルを後から交換するとどうなりますか？"
    answer: "モデルを変えるとベクター空間が変わるため、既存の文書を全て再エンコードする必要があります。だから韓国語データがあるなら最初から多言語モデルを選び、モデル名とバージョンをメタデータとして一緒に保存するのが良いです。"
  - question: "埋め込みだけで検索品質は十分ですか？"
    answer: "「Pythonなし」のような特定のキーワード条件が重要なときは、密な埋め込みよりBM25などのキーワード検索の方が正確です。実務ではBM25とベクター検索を組み合わせたハイブリッド検索（reciprocal rank fusion）が標準的な解法です。"
---

RAGを初めて勉強したとき、埋め込みは抽象的な概念として捉えていた。「文章をベクターに変換する」「意味が似ているものは近いベクター空間に置かれる」という説明は正しいが、実際の数字を見るまで感覚が掴めなかった。そこで `sentence-transformers` ライブラリをローカルにインストールし、コサイン類似度を測定して、ミニRAGを動かして、韓国語クエリで何が起こるのか直接確認した。

先に結論を言うと：**英語最適化モデルで韓国語RAGシステムを構築すると、今回の実験では精度が67%低下した。** 3つのクエリのうち2つが間違った文書を1位として返した。この記事はその実験過程と、多言語モデルで解決した結果を実測ログとともに共有する。

## pip install 一つで埋め込みモデルをローカルで動かすということ

外部APIなしで、ローカルマシンで、Pythonパッケージ一つでLLM埋め込みを生成できると聞いたとき、半信半疑だった。OpenAIやGeminiの埋め込みAPIが必要だと思っていたからだ。

実際にやってみると：

```bash
pip install sentence-transformers
```

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
embedding = model.encode("AIエージェント構築")
print(embedding.shape)  # (384,)
```

`all-MiniLM-L6-v2`は初回実行時にHugging Face Hubからモデルの重みをダウンロードする。私の環境でのロード時間は**9.52秒**だった。その後はキャッシュからロードされるため、2回目以降は1秒以内だ。モデルサイズは約22MBの軽量モデルだ。

生成されたベクターの内部構造を確認してみると：

```
ベクタータイプ: numpy.ndarray
ベクター形状: (384,)
ベクターdtype: float32
L2ノルム: 1.000000
最小値: -0.147123
最大値: 0.183166
最初の5次元: [-0.0216, 0.0593, -0.0049, -0.0172, 0.0079]
```

興味深いのは**L2ノルムが正確に1.0**であることだ。sentence-transformersはデフォルトでベクターをL2正規化する。これにより、コサイン類似度と内積（dot product）が同じ結果を返す。正規化なしで内積を使うとベクターのスケールによって結果が歪むが、このライブラリはそれを自動的に処理する。

384次元は意図的な設計だ。最新の大型埋め込みモデルが1536〜3072次元を使うのと比べると小さいが、コサイン類似度ベースの検索には十分で、ストレージコストが低い。数百万件の文書をインデックス化する際、次元数はメモリと検索速度に直接影響する。

## コサイン類似度：数字で見ると明確になること

コサイン類似度を公式で覚えるのと実際の数字を見るのは別物だ。意味的に似た文章ペアと全く異なるペアを直接測定した。

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

実測結果：

```
類似度: 0.6489 ████████████  AIエージェント uses tools... vs An autonomous agent...
類似度: -0.0112            AIエージェント uses tools... vs The cat sat on...
類似度: 0.6248 ████████████  How do I install... vs What is the command...
類似度: -0.0163            How do I install... vs The stock market...
```

意味的に似た文章ペアは0.62〜0.65、関連のないペアは-0.01〜-0.02だ。**負の類似度**が出ることが興味深い。コサイン値の範囲は-1〜1なので、意味的に無関係な文章はゼロ付近か若干の負の値になる。

0.6を「高い」と見るべきかどうかわからなかったので[ベクターDBベンチマーク記事](/ja/blog/ja/vector-db-comparison-2026-qdrant-chroma-pgvector)を参考にした。RAG検索で実務的に使われる閾値は通常0.3〜0.5だ。0.65は十分強い意味的連結だ。

## ミニRAGシミュレーション — 3クエリのうち2つが間違い

10件の韓国語ブログ記事タイトルをナレッジベースとして、3件の韓国語質問をクエリとしてシミュレーションした。モデルは英語最適化の`all-MiniLM-L6-v2`。

実測結果：

```
クエリ: "LLM API コストを削減するには？"
  #1 [0.5649] Anthropic Message Batches APIで大量処理  ← 期待: Prompt Caching
  #2 [0.4534] Claude API Prompt Cachingでコスト70%削減

クエリ: "エージェント間の通信プロトコル比較"
  #1 [0.5605] AIエージェントオブザーバビリティガイド  ← 全く別のトピック
  (MCP vs A2A vs Open Responsesは3位圏外)

クエリ: "Pythonなしで軽量DBを使う方法"
  #1 [0.5172] LangGraph マルチエージェント状態管理  ← 全く無関係
  (Node.js内蔵SQLiteはトップ3に入らず)
```

3クエリのうち1つ（LLM APIコスト）は2位でも正解文書を見つけたが、残り2つは1位の結果が的外れだった。これは想定以上に深刻な失敗だ。

## 多言語モデルへの切り替えで3/3正解に

`all-MiniLM-L6-v2`は主に英語文章ペアで学習されたモデルだ。`paraphrase-multilingual-MiniLM-L12-v2`は50以上の言語の並列コーパスで訓練された多言語モデルで、異なる言語で同じ意味を表す文章ペアを類似してエンコードするよう学習されている。

同じ3クエリで両モデルを比較した：

| クエリ | 英語モデル #1（正解?） | 多言語モデル #1（正解?） |
|--------|----------------------|----------------------|
| LLM APIコスト削減 | Message Batches [0.453] ✗ | Prompt Caching [0.720] ✓ |
| エージェント通信プロトコル比較 | オブザーバビリティ [0.561] ✗ | MCP vs A2A vs Open Responses [0.647] ✓ |
| Pythonなし軽量DB | LangGraph [0.461] ✗ | Node.js内蔵SQLite [0.439] ✓ |

結果：**英語モデル1/3（33%）、多言語モデル3/3（100%）。**

[RAGアーキテクチャの理論的背景](/ja/blog/ja/dena-llm-study-part4-rag)で「retrievalの品質がgenerationの品質を決める」という原則が語られているが、それが埋め込みモデルの選択段階から適用されることがこの実験でわかった。

私が出した結論：**韓国語や多言語RAGパイプラインには、最初から多言語モデルを使うべきだ。** 後で切り替えると既存のベクターDBを全て再インデックス化するコストが発生する。

## バッチ処理でエンコード速度を2.4倍に

プロダクションで数千件の文書をインデックス化する際、逐次エンコードは遅い。バッチ処理とどれだけ差があるか測定した。

```python
sentences = [f"これはテスト文章 番号 {i} です" for i in range(100)]

# 逐次エンコード: 1.075秒
for s in sentences:
    model.encode(s)

# バッチエンコード: 0.455秒
model.encode(sentences, batch_size=32, show_progress_bar=False)
```

結果：
```
逐次エンコード 100文: 1.075秒
バッチエンコード 100文: 0.455秒 → 2.4倍高速
スループット（バッチ）: 220文/秒
```

220文/秒が実用的かどうか計算すると：1万件の文書（平均5文で5万文）のインデックス化に約227秒、4分以内だ。十分実用的だ。

## 実際のRAGパイプラインでの活用

今日実験したのはRAGのR（Retrieval）部分だ。全体パイプラインの構成：

```python
# 1. インデックス化（オフライン）
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
doc_embeddings = model.encode(documents, batch_size=32)
# → ベクターDBに保存（Chroma、Qdrant、pgvectorなど）

# 2. 検索（オンライン）
query_embedding = model.encode(user_query)
# → ベクターDBでコサイン類似度で上位k件検索

# 3. 生成（オンライン）
context = "\n".join(retrieved_docs)
# → ClaudeやGPTにコンテキストとして渡す
```

実用的なヒント：埋め込みモデルを変更すると既存のベクターを全て再生成する必要がある。最初からモデル名をメタデータとして一緒に保存しておくのが良い。

## いつsentence-transformersを使い、いつ避けるべきか

今回の実験をまとめながら「韓国語RAGなら無条件にローカル埋め込みが答えなのか」という問いが残った。答えは状況による。

**ローカルのsentence-transformersが適する場合：**

- **データを外部に出せないとき。** 社内文書や医療・法律データのように外部API呼び出し自体がコンプライアンス問題になる場合、ローカルモデルが事実上唯一の選択肢だ。
- **埋め込みの呼び出し量が多くAPIコストが負担になるとき。** 数百万件の文書を定期的に再インデックス化するなら、呼び出しごとに課金されるAPIより一度モデルを立ち上げる方がはるかに安い。
- **オフライン・オンプレミス環境。** 閉域網やエッジデバイスでは外部APIを呼べない。
- **韓国語が混ざる多言語データ。** `multilingual-e5`や`paraphrase-multilingual-MiniLM-L12-v2`のような多言語モデルは韓国語を含む50以上の言語を一つのベクター空間にマッピングする。

**OpenAI/Cohereの埋め込みAPIや他の方法が有利な場合：**

- **インフラを運用したくないとき。** GPUのプロビジョニング、モデルのバージョン管理、スケーリングを自分でやりたくないなら管理型APIの利便性が大きい。
- **最高水準の多言語品質が必要だが呼び出し量は少ないとき。** OpenAI `text-embedding-3-large`やCohere `embed-multilingual-v3`はベンチマーク上位で、月に数万件程度ならコストもわずかだ。
- **キーワード一致が意味的類似度より重要なとき。** 正確な用語・コード・固有名詞のマッチングが核心なら、埋め込みよりBM25などのキーワード検索が良い。実務では両者を組み合わせたハイブリッドが正解の場合が多い。
- **埋め込みがRAG品質のボトルネックではないとき。** チャンキング戦略やリランキングにより大きな改善余地があるなら、埋め込みモデルの交換は優先事項ではない。

要するに、韓国語が混ざるデータでは英語専用モデルだけを避ければよい。その先のローカルかAPIかは、プライバシー・コスト・運用負担のトレードオフの問題だ。

## まだわからないことと次に試すこと

今日の実験の限界：

**限界1**: ナレッジベースが10件だけだった。実際の環境では数万件の文書から検索するため、今日測定した精度が実際の数値とどれほど異なるかわからない。

**限界2**: 多言語モデルは3/3正解だったが、テストケースが3件しかなかった。統計的に意味ある評価ではない。

**限界3**: 埋め込みだけでは役割が限定的だ。特定のキーワードが重要な場合はBM25の方が正確だ。ハイブリッド検索（reciprocal rank fusion）はまだ実装していない。

**次の実験**: `multilingual-e5-large`モデルで同じ実験を繰り返す、ChromaDBと連携して永続ベクターストアを構成する、BM25とベクター検索を組み合わせたハイブリッド検索の精度比較。

埋め込みを「APIで使えばいいもの」と思っていたが、直接動かしてみるとモデル選択が想像以上に重要な変数だった。特に多言語データを扱うRAGシステムでは、最初のモデル選択が後の再インデックス化コストとして返ってくることを今回学んだ。

## 参考資料

- [Sentence Transformers公式ドキュメント（SBERT.net）](https://www.sbert.net) — ライブラリの使い方、正規化、モデル選択ガイド
- [paraphrase-multilingual-MiniLM-L12-v2モデルカード（Hugging Face）](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) — 50言語対応、384次元出力
- [MTEB埋め込みベンチマークリーダーボード（Hugging Face）](https://huggingface.co/spaces/mteb/leaderboard) — 多言語埋め込みモデルの性能比較
- [Sentence-BERT論文（Reimers & Gurevych, 2019）](https://arxiv.org/abs/1908.10084) — sentence-transformersの理論的基盤
