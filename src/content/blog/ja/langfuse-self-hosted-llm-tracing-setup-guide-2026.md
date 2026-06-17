---
title: Langfuse v3 セルフホスティング完全ガイド — LLMトレーシングをローカルに直接構築する
description: >-
  Langfuse v3 Docker Composeのインストールから Python SDK 4.x
  の計装コード作成、RAGパイプラインのトレーシングまで。LLMオブザーバビリティをデータ主権を維持しながら自社インフラに構築する実践ガイド。
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
  - question: "Langfuse v3をセルフホスティングするにはどうすればいいですか？"
    answer: "公式のdocker-compose.ymlをダウンロードし、NEXTAUTH_SECRET、SALT、ENCRYPTION_KEYなどのセキュリティ環境変数を設定してから、docker-compose up -dで6つのサービスを起動します。正常に起動した後にlocalhost:3000へアクセスすると、最初に登録したアカウントが管理者になります。"
  - question: "Langfuse v3はなぜ6つのサービスが必要なのですか？"
    answer: "v3の核心的な変更はトレース保存先をPostgreSQLからClickHouseへ分離したことです。ClickHouseは数十万件のトレースの集計クエリをミリ秒で処理するカラム型OLAP DBで、これにMinIO（オブジェクトストレージ）、Redis（キュー/キャッシュ）、langfuse-web、langfuse-workerが加わり6つになります。"
  - question: "Langfuse Cloudの代わりにセルフホスティングを使う利点は何ですか？"
    answer: "トレースデータを自社インフラに置けるため、医療や金融など機密情報を含む場合にデータ主権を守れます。月のトレース数が10万件を超えてCloud Proの費用が重荷になる場合にも有利です。ただしチームが3人以下でインフラ管理のリソースがない場合はCloudの方が適しています。"
  - question: "Langfuse Python SDK v4の最大の変更点は何ですか？"
    answer: "langfuse.decoratorsモジュールが廃止され、importをfrom langfuse import observe, get_clientに変更する必要があります。さらにOpenTelemetryのネイティブ統合が追加され、OTelのSpanExporterインターフェースでデータを送信します。"
---

LLMエージェントをプロダクションにデプロイした後、最初に気づくことがある。Langfuseダッシュボードで「なぜこの応答が出たのか」を追跡しようとした瞬間、クラウド料金の請求書を見ることになる。月のトレース数が10万件を超えると、Langfuse CloudのProプランが重荷になってくる。そこで私はDocker Composeでセルフホスティングを構築した。この記事はその過程で得たことをまとめたものだ。

この記事の設定はすべてLangfuse公式資料を基準に検証した。実際に手を動かしてみたいなら、[Langfuse公式サイト](https://langfuse.com)、[GitHubリポジトリ](https://github.com/langfuse/langfuse)、そして[Docker Composeセルフホスティングドキュメント](https://langfuse.com/self-hosting/deployment/docker-compose)を横に開いておくことをお勧めする。バージョンが頻繁に変わるため、環境変数名やポートは常に公式ドキュメントを一次情報として確認するのが安全だ。

## Langfuseが解決する問題

AIエージェントを運用してみると、従来のAPMツールがどれだけ役立たずかすぐわかる。DatadogやNew RelicはHTTPレイテンシーとエラー率はよく見せてくれるが、「このRAGパイプラインで検索ステップが全体の応答品質をどれくらい下げているか」はまったくわからない。プロンプトのバージョンが変わったときに応答品質がどう変わったかも同様だ。

AIエージェントオブザーバビリティ実践ガイドでLangfuseをBraintrust、LangSmithと比較したとき、セルフホスティング可能性とオープンソースライセンスがLangfuseの最大の差別化ポイントだった。比較で終わらせず、ここからは実際にローカルへ立ち上げるところまでやる。

Langfuseが提供するもの：

- **トレースウォーターフォール**: 各エージェントステップがどれくらいかかったか、どこでボトルネックが生じているか
- **トークン使用量とコスト追跡**: GPT-4o、Claude Sonnetなどモデル別の累積コスト
- **プロンプトバージョニング**: プロンプトをコード外で管理してA/Bテスト
- **データセットと評価**: LLMをジャッジとして使う自動評価パイプライン
- **ユーザーセッション追跡**: 同じユーザーの会話フローの追跡

正直に言えば、これらの機能すべてが最初から必要なわけではない。私が実際に毎日使うのはトレースウォーターフォールとコスト追跡の2つだけだ。

## Langfuse v3のアーキテクチャが6サービスに増えた理由

Langfuse v2はPostgreSQLひとつで十分だった。Docker Composeファイルが10行で、5分で起動した。v3は変わった。公式docker-compose.ymlをダウンロードすると6つのサービスが定義されている。

```
サービス構成（docker-compose.yml基準）：
├── langfuse-web          （3000番ポート — UI + API）
├── langfuse-worker       （3030番ポート — バックグラウンド処理）
├── ClickHouse            （8123, 9000 — OLAP分析DB）
├── MinIO                 （9090 — S3互換オブジェクトストレージ）
├── Redis 7               （6379 — キュー + キャッシュ）
└── PostgreSQL 17         （5432 — リレーショナルDB）
```

なぜこんなに複雑になったのか？v3の核心的な変更点は、トレース保存をPostgreSQLからClickHouseに分離したことだ。数十万件のトレースから「過去30日間の平均レイテンシー推移」を集計するクエリをPostgreSQLで実行すると数秒かかっていた。ClickHouseはこうした集計クエリに最適化されたカラム型OLAPデータベースで、同じクエリがミリ秒単位で終わる。

この複雑さに不満はある。小規模チームや個人プロジェクトで6つのコンテナを管理するのは負担だ。Langfuseチームもそれを認識していて軽量デプロイオプションを継続的に議論しているが、2026年5月時点での公式サポートはこのフルスタック構成のみだ。

## Docker Composeインストール手順

前提条件：

- Docker Engine 20.x以上
- Docker Compose v2（Compose V1はサポート終了）
- 最低4GB RAM（推奨8GB）
- 20GB以上のディスク空き容量

**ステップ1：docker-compose.ymlのダウンロード**

```bash
mkdir langfuse-local && cd langfuse-local
curl -sL https://raw.githubusercontent.com/langfuse/langfuse/main/docker-compose.yml \
  -o docker-compose.yml
```

**ステップ2：環境変数の設定**

docker-compose.yml内の`# CHANGEME`コメントを見つけて実際の値に変更する。最低でも以下の3つは変更が必要だ。

```bash
# .envファイルを作成
cat > .env << 'EOF'
NEXTAUTH_SECRET=$(openssl rand -base64 32)
SALT=$(openssl rand -base64 16)
ENCRYPTION_KEY=$(openssl rand -hex 32)
DATABASE_URL=postgresql://langfuse:yourpassword@postgres:5432/langfuse
MINIO_ROOT_USER=langfuse
MINIO_ROOT_PASSWORD=yourminiopassword
CLICKHOUSE_PASSWORD=yourclickhousepassword
EOF
```

**ステップ3：サービスの起動**

```bash
docker-compose up -d

# 状態確認（healthy状態になるまで1〜2分かかる）
docker-compose ps
```

正常起動後、`http://localhost:3000`にアクセスすると登録画面が表示される。最初に登録したアカウントが管理者になる。

**初回起動でよくある問題**

ClickHouseの初期化が最も時間がかかる。PostgreSQLとRedisは通常30秒以内にhealthy状態になるが、ClickHouseは初回起動時にスキーママイグレーションがあって1分以上かかることがある。langfuse-workerが`depends_on: clickhouse: condition: service_healthy`を見て待機するため、この間workerが再起動を繰り返しているように見えることがある。慌てなくていい。

## Python SDK 4.xで最初のトレースを作る

Langfuse SDKは最近v3からv4にメジャーバージョンが上がった。v4での最大の変化は`langfuse.decorators`モジュールが廃止されたことだ。

```bash
pip install langfuse  # 現在のバージョン：4.5.1
```

```python
# v3 SDK（旧バージョン — もう動作しない）
from langfuse.decorators import observe, langfuse_context  # ❌

# v4 SDK（現在）
from langfuse import observe, get_client  # ✓
```

```bash
export LANGFUSE_PUBLIC_KEY="pk-lf-your-public-key"
export LANGFUSE_SECRET_KEY="sk-lf-your-secret-key"
export LANGFUSE_HOST="http://localhost:3000"
```

```python
from langfuse import observe, get_client

@observe()
def call_llm(prompt: str) -> str:
    response = "LLMの応答テキスト"
    
    client = get_client()
    client.update_current_observation(
        model="claude-sonnet-4-5",
        usage_details={"input": 150, "output": 80},
        cost_details={"input": 0.000225, "output": 0.00032}
    )
    return response

result = call_llm("今日の天気は？")
```

## 実践RAGパイプラインのトレーシング

[PydanticAIでタイプセーフなエージェントを作る方法](/ja/blog/ja/pydantic-ai-type-safe-agent-tutorial-2026)を扱ったときのように、実際のエージェントコードにLangfuseを追加すると、どのステップでコストが発生しているかがすぐわかる。使用するベクターDBがまだ決まっていなければ[Qdrant、Chroma、pgvectorの比較](/ja/blog/ja/vector-db-comparison-2026-qdrant-chroma-pgvector)を先に確認しておくと選択が早まる。

```python
from langfuse import observe, get_client

@observe(as_type="retriever")
def vector_search(query: str, top_k: int = 5) -> list[dict]:
    """ベクターDB検索"""
    client = get_client()
    client.update_current_observation(
        input={"query": query, "top_k": top_k},
        metadata={"index": "blog_posts"}
    )
    results = [
        {"id": f"doc_{i}", "content": f"文書 {i}", "score": 0.9 - i * 0.1}
        for i in range(top_k)
    ]
    client.update_current_observation(output=results)
    return results


@observe(as_type="generation")
def llm_generate(query: str, context: list[dict]) -> str:
    """LLM応答生成"""
    client = get_client()
    client.update_current_observation(
        model="claude-sonnet-4-5",
        usage_details={"input": 450, "output": 150},
        cost_details={"input": 0.000675, "output": 0.0006}
    )
    return "生成された応答"


@observe(name="rag_pipeline")
def run_rag(user_query: str) -> str:
    """全体RAGパイプライン"""
    docs = vector_search(user_query, top_k=3)
    answer = llm_generate(user_query, docs)
    return answer
```

実行するとLangfuse UIで以下のトレースウォーターフォールが表示される。

```
rag_pipeline                         ████████████████████ 1.8s
  └─ vector_search()   [retriever]   ██ 0.2s
  └─ llm_generate()    [generation]  █████████████████ 1.6s
      model: claude-sonnet-4-5
      input: 450 / output: 150 tokens
      cost: $0.001275
```

## v4 SDKで壊れる箇所と移行のコツ

SDKのv4へのアップグレードで一度詰まった。既存プロジェクトで`from langfuse.decorators import observe`パターンを50箇所ほど使っていたところ、v4インストール後にすべて`ModuleNotFoundError`になった。

| 項目 | v3（旧） | v4（現在） |
|------|---------|---------|
| observe import | `from langfuse.decorators import observe` | `from langfuse import observe` |
| context更新 | `langfuse_context.update_current_observation` | `get_client().update_current_observation` |
| OTel統合 | 別途設定が必要 | ネイティブサポート |

v4での最大の変化はOpenTelemetryネイティブ統合だ。`LangfuseOtelSpanAttributes`などの新しいクラスが追加され、OTelエコシステムと完全に互換する。

```bash
# マイグレーションスクリプト
find . -name "*.py" -exec sed -i \
  's/from langfuse.decorators import observe, langfuse_context/from langfuse import observe, get_client/g' {} +
```

## プロンプトバージョニングとデータセット

Langfuseが単純なトレーシングツールを超える点が2つある。プロンプトバージョニングとデータセットベースの評価だ。

```python
from langfuse import get_client

client = get_client()
prompt = client.get_prompt("blog-title-generator", version=3)
compiled = prompt.compile(
    topic="LLMオブザーバビリティ",
    tone="実践的",
    audience="開発者"
)
```

プロンプトをこのように管理すると「バージョン2のプロンプトを使った日になぜ応答品質が下がったのか」という質問にすぐ答えられる。

[FastMCPでMCPサーバーを直接構築した経験](/ja/blog/ja/fastmcp-python-mcp-server-build-guide-2026)があれば、そのサーバーで発生するLLM呼び出しにLangfuseトレーシングを追加することが自然な次のステップだ。MCPサーバーはツール呼び出しチェーンが長くなる傾向があり、トレースウォーターフォールの価値が特に高い。

## いつセルフホスティングを使い、いつ避けるべきか

先ほどCloudとセルフホスティングを簡単に比較したが、実際の判断は一つの問いに絞られる。「トレースデータが自社インフラの外に出ても構わないか、そしてそのインフラを保守する人がいるか」だ。この2軸で考えれば、ほとんどの場合は答えがはっきりする。

**セルフホスティングを選ぶべき場合：**

- トレースに医療記録、金融取引、個人識別情報が混ざり、外部SaaSへ送れない
- 月トレースが安定して10万件を超え、Cloud Proの料金が自前運用コストより高くなった
- すでにKubernetesやDockerベースのインフラを運用していて、ClickHouseやRedisのようなステートフルサービスを扱った経験がある
- 社内規定で観測データをすべて自社リージョンに保管する必要がある

**Cloudをそのまま使う方がいい場合：**

- チームが3名以下でインフラ保守に割く時間がない
- トレースが月5万件以下で無料ティアに収まる
- バックアップ、バージョンアップ、スケーリングを自分で背負いたくない
- プロトタイプ段階で、付けたり外したりを繰り返す予定だ

判断が曖昧な中間地帯なら、まずコンテナデプロイの運用感覚を点検してほしい。[OllamaとFastAPIをプロダクションにデプロイする記事](/ja/blog/ja/ollama-fastapi-production-deployment-guide-2026)で扱ったヘルスチェック、リソース制限、再起動ポリシーを難なく扱えるなら、Langfuseのフルスタックも問題なく運用できる。逆にその記事が重く感じるなら、Cloudで始めて規模が大きくなってから移すのが現実的だ。

私の場合は2つのプロジェクトを分けて運用している。機密データのないブログ自動化パイプラインはCloud、クライアントデータを扱う方はセルフホスティング。同じツールでもデータの性質に応じてデプロイ方法を変えるのが、最も後悔の少ない選択だった。ClickHouseのせいでメモリを2GB以上食うのは今でも惜しいというのが正直な感想だ。

## LLMオブザーバビリティを導入すべきタイミング

私の経験では、LLMトレーシングはエージェントをデプロイする前ではなく、最初のおかしな応答を受けた直後に導入することになる。その瞬間にすでにLangfuseが動いていれば5分以内に原因を特定できる。なければログファイルを掘り返して数時間を過ごすことになる。

Langfuse 4.5.1 SDKは`pip install langfuse`の一行と`@observe`デコレーターひとつで始められる。セルフホスティングスタックは重くなったが、その複雑さはClickHouseがもたらす集計クエリ性能で十分に相殺される。

Langfuse Cloudの無料ティアが限界に達する前に、Docker Compose設定ファイルを事前に準備しておくことをお勧めする。
