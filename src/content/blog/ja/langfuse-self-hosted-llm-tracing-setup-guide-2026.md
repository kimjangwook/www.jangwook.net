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
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、DevOps、架构主题进行连接。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、DevOps、架构主题进行连接。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
---

LLMエージェントをプロダクションにデプロイした後、最初に気づくことがある。Langfuseダッシュボードで「なぜこの応答が出たのか」を追跡しようとした瞬間、クラウド料金の請求書を見ることになる。月のトレース数が10万件を超えると、Langfuse CloudのProプランが重荷になってくる。そこで私はDocker Composeでセルフホスティングを構築した。この記事はその過程で得たことをまとめたものだ。

## Langfuseが解決する問題

AIエージェントを運用してみると、従来のAPMツールがどれだけ役立たずかすぐわかる。DatadogやNew RelicはHTTPレイテンシーとエラー率はよく見せてくれるが、「このRAGパイプラインで検索ステップが全体の応答品質をどれくらい下げているか」はまったくわからない。プロンプトのバージョンが変わったときに応答品質がどう変わったかも同様だ。

[AIエージェントオブザーバビリティ実践ガイド](/ja/blog/ja/ai-agent-observability-production-guide)でLangfuseをBraintrust、LangSmithと比較したが、セルフホスティング可能性とオープンソースライセンスがLangfuseの最大の差別化ポイントだった。この記事ではその比較段階を超えて、実際にローカルに構築する方法を扱う。

Langfuseが提供するもの：

- **トレースウォーターフォール**: 各エージェントステップがどれくらいかかったか、どこでボトルネックが生じているか
- **トークン使用量とコスト追跡**: GPT-4o、Claude Sonnetなどモデル別の累積コスト
- **プロンプトバージョニング**: プロンプトをコード外で管理してA/Bテスト
- **データセットと評価**: LLMをジャッジとして使う自動評価パイプライン
- **ユーザーセッション追跡**: 同じユーザーの会話フローの追跡

正直に言えば、これらの機能すべてが最初から必要なわけではない。私が実際に毎日使うのはトレースウォーターフォールとコスト追跡の2つだけだ。

## Langfuse v3アーキテクチャ — なぜこんなに複雑になったのか

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

[PydanticAIでタイプセーフなエージェントを作る方法](/ja/blog/ja/pydantic-ai-type-safe-agent-tutorial-2026)を扱ったときのように、実際のエージェントコードにLangfuseを追加すると、どのステップでコストが発生しているかがすぐわかる。

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

## v4 SDKの主な変更点と注意事項

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

[MCPサーバーを直接構築した経験](/ja/blog/ja/mcp-server-build-practical-guide-2026)があれば、そのサーバーで発生するLLM呼び出しにLangfuseトレーシングを追加することが自然な次のステップだ。MCPサーバーはツール呼び出しチェーンが長くなる傾向があり、トレースウォーターフォールの価値が特に高い。

## セルフホスティングの限界と現実的な判断

私がセルフホスティングを推奨しないケースがある。正直に書く。

**セルフホスティングが適している場合：**
- トレースデータに機密な個人情報が含まれる（医療、金融）
- 月トレース数が10万件以上でCloudコストが負担
- Kubernetesベースのインフラをすでに運用中

**Cloudをそのまま使う方がいい場合：**
- チームが3名以下でインフラ管理リソースがない
- トレースが月5万件以下（Langfuse Cloud無料ティアの範囲内）
- バックアップ、スケーリング、アップデートを自分で管理したくない

ClickHouseのせいでメモリを2GB以上食うのは今でも惜しいというのが正直な感想だ。

## まとめ — LLMオブザーバビリティを導入するタイミング

私の経験では、LLMトレーシングはエージェントをデプロイする前ではなく、最初のおかしな応答を受けた直後に導入することになる。その瞬間にすでにLangfuseが動いていれば5分以内に原因を特定できる。なければログファイルを掘り返して数時間を過ごすことになる。

Langfuse 4.5.1 SDKは`pip install langfuse`の一行と`@observe`デコレーターひとつで始められる。セルフホスティングスタックは重くなったが、その複雑さはClickHouseがもたらす集計クエリ性能で十分に相殺される。

Langfuse Cloudの無料ティアが限界に達する前に、Docker Compose設定ファイルを事前に準備しておくことをお勧めする。
