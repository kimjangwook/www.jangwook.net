---
title: Claude Managed Agentsを試した — インフラなしでAIエージェントを30分でデプロイ
description: >-
  Anthropicが4月に公開したClaude Managed Agentsを実際に試してみた正直なレビュー。API
  3ステップチェーン、$0.08/時間の実際のコスト計算、ベンダーロックインリスクまでカバー。
pubDate: '2026-04-16'
heroImage: >-
  ../../../assets/blog/claude-managed-agents-production-deployment-guide-hero.jpg
tags:
  - claude
  - managed-agents
  - ai-agent
  - anthropic
relatedPosts:
  - slug: claude-agent-teams-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: dena-perl-go-migration-ai-agents
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-cost-reality
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

```python
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security and performance.",
    tools=[{"type": "agent_toolset_20260401"}],
)
```

これで全部です。エージェント作成完了。

もちろん、このコード1行がすべてなら記事を書く理由はありません。本当の問題はその先にあります。環境設定、セッション管理、ストリーミングイベント処理、そして何より「これをプロダクションで使ったら実際にいくらかかるのか」。ここから話が複雑になります。

Anthropicが4月8日にClaude Managed Agentsのパブリックベータを公開しました。エージェントインフラを自前で構築しなくても使えるマネージド型サービスです。エージェントループを自分で書いたことがある人なら、この言葉の重みが違って聞こえるはずです。私もその一人なのでAPIを直接試してみました。結論から言うと — インフラからの解放は本物ですが、その自由に付いている価格表をちゃんと読む必要があります。

## エージェントループを自作した経験があれば、このサービスが生まれた理由がわかる

エージェントを作ると言えば、普通はモデル呼び出し → ツール実行 → 結果返却 → 再度モデル呼び出しというループを思い浮かべます。シンプルに見えます。実際にシンプルなのはここまでです。

プロダクションに載せた瞬間、別世界が広がります。ツール実行結果をモデルに戻すループの状態管理、途中でネットワークが切れたときのリカバリ戦略、コンテキストウィンドウが溢れたときにどのメッセージを捨ててどれを残すかの圧縮ロジック、APIタイムアウト処理、そしてエージェントが `rm -rf /` のようなコマンドを実行できないようにするサンドボックス分離。これが全部「エージェントを作る」前に解決すべきインフラの問題です。

私の経験では、実際のエージェントロジック — 「このPRのセキュリティ脆弱性を見つけろ」といったビジネスコード — よりも、この周辺インフラのコードに3倍は時間がかかりました。[Claude Codeエージェンティックワークフローパターン5種類](/ja/blog/ja/claude-code-agentic-workflow-patterns-5-types)でオーケストレーター・サブエージェントパターンを扱ったことがありますが、パターンがどれだけきれいでも、それを保守可能なコードに落とし込むのはまったく別の問題です。特にエラーハンドリングが地獄でした。ツール呼び出しが失敗したときにリトライするのか、ユーザーに聞くのか、そのままスキップするのか — こうした分岐を何十個も書いていると、エージェントロジックが条件文の中に埋もれていきます。

Managed Agentsは、このインフラレイヤーをAnthropicが引き受けるという宣言です。あなたはビジネスロジックだけ書けばいい。

## 動作原理：Agent → Environment → Session 3ステップチェーン

核心概念は3つです。<strong>エージェント（Agent）</strong>、<strong>環境（Environment）</strong>、<strong>セッション（Session）</strong>。

エージェントは、システムプロンプト＋許可ツールセットの再利用可能な定義です。一度作っておけばIDで繰り返し呼び出せます。環境は、エージェントが実行される隔離されたコンテナです。ネットワークアクセス範囲やファイルシステムマウントなどの実行条件をここで設定します。セッションは実際の実行単位 — エージェント＋環境の組み合わせの上で動く一つのタスクです。

```python
from anthropic import Anthropic

client = Anthropic()

# ステップ1：エージェント定義（一度作って再利用）
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security issues and performance problems.",
    tools=[{"type": "agent_toolset_20260401"}],
)

# ステップ2：実行環境の作成
environment = client.beta.environments.create(
    name="prod-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)

# ステップ3：セッション開始（実際の実行単位）
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Review PR #482",
)
```

セッションが作成されると、SSE（Server-Sent Events）ストリームでメッセージをやり取りします。この部分が従来のMessages APIと最も大きく異なる点です。リクエスト-レスポンスではなく、リアルタイムイベントストリームです。

```python
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{
            "type": "user.message",
            "content": [{"type": "text", "text": "このPythonファイルをレビューして: ..."}],
        }],
    )
    for event in stream:
        if event.type == "agent.message":
            print(event.content)
```

実際に試してみてすぐ気づいたことがあります。セッションは接続が切れても生き続けるという点です。ノートPCを閉じてまた開いても、セッションは動き続けていて、ストリームを再接続すればその間のイベントを続けて受け取れます。長時間実行されるエージェントタスクにとって、これはかなり意味のある機能です。私が自作したエージェントループでは、この部分が最も脆弱でした — WebSocketが切れたら状態をRedisに保存して復旧するコードを別途書く必要がありました。

すべてのエンドポイントには `managed-agents-2026-04-01` ベータヘッダーが必要ですが、Python SDKが `client.beta.*` ネームスペースを通じて自動的に処理してくれます。

## 内蔵ツールセット解剖：agent_toolset_20260401に何が入っているか

エージェント作成時に `tools` パラメータに `agent_toolset_20260401` を渡すと、内蔵ツールセット全体が一括で有効化されます。これが便利な点であると同時に、不安な点でもあります。

公式ドキュメント基準で含まれるツール：

- <strong>Bash</strong> — シェルコマンド実行。パッケージインストール、テスト実行、CLI呼び出しまで可能
- <strong>ファイル操作</strong> — 読み取り、書き込み、修正、検索（grep）、パターンマッチング（glob）
- <strong>ウェブ検索</strong> — リアルタイムウェブ検索（別途課金：$10/1,000件）
- <strong>ウェブフェッチ</strong> — URLからコンテンツを取得
- <strong>コード実行</strong> — Python/JSコードをサンドボックスで実行

実際に使ってみて便利だったのはBash＋ファイル操作の組み合わせです。「このリポジトリをクローンしてテストを実行し、失敗するテストを分析して」というリクエストをセッション一つで処理できます。以前はこうした作業のためにツールスキーマを一つずつ定義し、実行結果のパースロジックを書き、エラー処理を入れる必要がありました。そのプロセスがまるごと消えます。

一つ注意点があります。<strong>ウェブ検索は別途課金</strong>です。agent_toolsetに含まれていますが、使用するたびに$10/1,000件が別途かかります。エージェントがリサーチ作業をしながらウェブ検索を過度に呼び出すと、コストが急速に膨らみます。最初はこれを見落としていて、テストセッション1回で検索47件が飛んでいたのを見て驚きました。システムプロンプトに「ウェブ検索はどうしても必要なときだけ」のような制約を入れるのが現実的です。

そして公式発表で言及された<strong>Computer Use（画面操作）</strong>と<strong>マルチエージェント調整</strong>はパブリックベータに含まれていません。別途リサーチプレビューアクセスを申請する必要があります。この点は下で詳しく触れます。

## コストの現実：3つのシナリオで実際に計算してみた

$0.08/時間という数字だけ見ると安く見えます。しかし実際にはランタイムコスト＋トークンコスト＋ウェブ検索コストが別々にかかる構造です。ランタイムはミリ秒単位で測定され、セッションの状態が「running」のときだけ課金されるのは幸いです。3つのシナリオで計算してみました。

<strong>シナリオ1：コードレビューエージェント（オンデマンド）</strong>

1日10件のPRレビュー。セッションあたり平均5分、Sonnet 4.6使用。

| 項目 | 計算 | 月額コスト |
|------|------|---------|
| ランタイム | 50分/日 × 22日 = 約18時間 | $1.44 |
| トークン（入力） | 〜5Kトークン/セッション × 220件 × $3/1M | $3.30 |
| トークン（出力） | 〜2Kトークン/セッション × 220件 × $15/1M | $6.60 |
| ウェブ検索 | 使用なし | $0 |
| <strong>合計</strong> | | <strong>〜$11/月</strong> |

この程度ならかなりリーズナブルです。ジュニア開発者一人のコードレビュー時間を削減できると考えれば、投資対効果は明確です。

<strong>シナリオ2：リサーチエージェント（週3回バッチ）</strong>

週3回の技術トレンドリサーチ。セッションあたり平均20分、ウェブ検索込み、Opus 4.6使用。

| 項目 | 計算 | 月額コスト |
|------|------|---------|
| ランタイム | 20分 × 12回 = 4時間 | $0.32 |
| トークン（入力） | 〜20Kトークン/セッション × 12 × $5/1M | $1.20 |
| トークン（出力） | 〜10Kトークン/セッション × 12 × $25/1M | $3.00 |
| ウェブ検索 | 〜30件/セッション × 12 × $10/1000 | $3.60 |
| <strong>合計</strong> | | <strong>〜$8/月</strong> |

ウェブ検索コストがトークンコストに匹敵する点に注目してください。リサーチエージェントは検索回数を制御しないと、ここでコストが爆発します。

<strong>シナリオ3：モニタリングエージェント（24/7常時稼働）</strong>

24時間稼働、Sonnet 4.6、10分ごとにチェック。

| 項目 | 計算 | 月額コスト |
|------|------|---------|
| ランタイム | 24h × 30日 = 720時間 | $57.60 |
| トークン（入力） | 〜1Kトークン × 4,320回 × $3/1M | $12.96 |
| トークン（出力） | 〜500トークン × 4,320回 × $15/1M | $32.40 |
| <strong>合計</strong> | | <strong>〜$103/月</strong> |

常時稼働はそれなりのコストになります。ランタイムだけで月$58、そこにトークンが積み上がります。この場合はイベントドリブンアーキテクチャで、セッションを必要なときだけ生成してすぐ終了する設計が必須です。

もう一つ — <strong>Batch APIの割引はManaged Agentsには適用されません</strong>。既存のBatch APIで50%割引を受けていた場合、Managed Agentsに移行した瞬間にその割引がなくなります。これは公式ドキュメントに明記されていますが、目立たない場所に書いてあります。

## 良い点：実際に時間を節約できる部分

コストの話を先にしたのでネガティブに見えるかもしれませんが、使ってみると確実に良い部分があります。

<strong>インフラコードがゼロに。</strong>エージェントループを自作していたときに、ツール実行 → 結果パース → モデル再呼び出し → 状態管理 → エラー復旧に費やしていたコードがまるごと消えます。体感で800〜1,000行のインフラコードが、上記のAPI呼び出し数行に置き換わります。

<strong>セッションの永続性。</strong>上で触れましたが、改めて強調する価値があります。クライアント接続が切れてもセッションは動き続けます。エージェントに30分のコード分析タスクを任せて、別の作業をしても大丈夫です。戻ってきてストリームを再接続すれば、その間のイベントを受信できます。

<strong>サンドボックス分離。</strong>エージェントがBashコマンドを実行できるというのは、セキュリティ面では怖いことです。Managed Agentsは各環境を隔離されたコンテナで実行し、ネットワークアクセス範囲も環境設定で制限できます。これを自前で実装しようとすると、Docker＋ネットワークポリシー＋ファイルシステムマウント制御をセットアップする必要があります。この部分だけでも十分な価値があります。

## 残念な点：ベンダーロックインリスクとベータの限界

良い点だけなら「とりあえず使えばいい」が答えになりますが、現実はそうではありません。

<strong>ベンダーロックインが深い。</strong>エージェント定義、環境設定、セッション管理APIがすべてAnthropic専用です。OpenAI Assistants APIとも互換性がなく、LangChainやCrewAIのようなフレームワークとも直接接続されません。将来GeminiやGPTベースに移行しようとすると、エージェントロジックの再実装が必要になります。

これは理論上のリスクではありません。実際に今月、AnthropicはClaude Pro/Maxサブスクライバーのサードパーティツールアクセスポリシーを変更しました。インフラを任せるということは、こうしたポリシー変更まで一緒に受け入れるということです。NVIDIA NemoClawのような[自社インフラベースのエージェントプラットフォーム](/ja/blog/ja/nvidia-nemoclaw-openclaw-enterprise-agent-platform)が代替として登場するのも、こうした文脈からです。

<strong>マルチエージェント調整が欠けている。</strong>発表で最も興味を引いた機能 — エージェントが別のエージェントを生成し、並列にタスクを分配する機能 — がパブリックベータにありません。リサーチプレビューアクセスを別途申請する必要があり、承認までどのくらいかかるかも不透明です。現在のManaged Agentsは単一エージェントのマネージド実行がすべてです。[エージェントチームを自前で構成して運用する方法](/ja/blog/ja/claude-agent-teams-guide)と比較すると、機能的な範囲は狭くなります。

<strong>Batch API割引の非適用。</strong>大量処理のためにBatch APIを使っていた場合は注意が必要です。Managed Agentsセッション内のトークン消費にはBatch APIの50%割引が適用されません。バッチジョブをManaged Agentsに移行すると、トークンコストが2倍に跳ね上がる可能性があります。

<strong>プロンプトキャッシングの効果が薄れる。</strong>セッションベースなので、同じシステムプロンプトを繰り返し使っても、セッションが新しく作成されるたびにキャッシュのウォーミングが再度必要になります。短いセッションを頻繁に作るパターンでは、プロンプトキャッシングのコスト削減効果が落ちます。キャッシュ読み取りコストが基本入力価格の10%だとしても、キャッシュミスが多ければ意味がありません。

## 誰に向いていて、誰は待つべきか

<strong>今すぐ試す価値がある場合：</strong>

- エージェントインフラに投資するエンジニアがいない2〜5人のチーム。インフラ保守の時間をプロダクト開発に回せます。
- 単一エージェントで解決できるタスク — コードレビュー、ドキュメント生成、データ分析のような独立したタスク
- エージェントPOC（概念実証）を素早く作る必要がある状況。30分で動くプロトタイプができます。
- 既存のAPI顧客であれば、ベータを無料で利用できます（ランタイム＋トークンコストのみ支払い）

<strong>急がなくてもいい場合：</strong>

- マルチモデル戦略を採用している、または特定ベンダーに縛られたくないチーム
- すでに自前のエージェントオーケストレーションコードがあり、うまく動いている場合
- マルチエージェント調整がコア要件の場合 — まだパブリックベータにはありません
- Batch API割引に依存した大量処理パイプラインを運用中の場合

私はまだプロダクションでは使っていません。理由はシンプルです。私が動かしているエージェントは[tmuxベースで複数を同時に走らせる構成](/ja/blog/ja/claude-agent-teams-guide)なのですが、Managed Agentsの現在のパブリックベータは単一エージェントしかサポートしていません。マルチエージェント機能が一般公開されたら、改めて評価するつもりです。

## 次にやること

リサーチプレビューアクセスを申請済みです。マルチエージェント調整が実際に使えるレベルなのか、それともマーケティングデモレベルなのか、自分の目で確かめたいと思っています。承認が下りたら、現在のtmuxベースのワークフローと同じタスクをManaged Agentsのマルチエージェントで回してみて、コスト、速度、安定性を比較する予定です。

そしてもう一つ気になっているのは、AnthropicがManaged Agentsの価格をどこまで維持するかです。パブリックベータ中の$0.08/時間がGA後も維持されるのか、それとも引き上げられるのか。AWS Lambdaが初期の低価格で市場を獲得し、後から価格を引き上げた前例があります。インフラへの依存度を高める前に、この点は注視しておく必要があります。

## 参考資料

- [Claude Managed Agents公式ドキュメント](https://platform.claude.com/docs/en/managed-agents/overview)
- [Managed Agentsクイックスタート](https://platform.claude.com/docs/en/managed-agents/quickstart)
- [ツールリファレンス](https://platform.claude.com/docs/en/managed-agents/tools)
- [Anthropic公式発表](https://claude.com/blog/claude-managed-agents)
