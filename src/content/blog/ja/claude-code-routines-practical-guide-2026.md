---
title: "Claude Code Routines 実践ガイド — スケジュール・API・GitHubイベントでAIを24/7自動化する方法"
description: "Claude Code Routinesはプロンプト・リポジトリ・コネクタを一度設定するだけで、Anthropicのインフラ上で自律実行されます。スケジュール・API呼び出し・GitHubイベントという3種類のトリガー方式を実際の設定手順とともに解説し、PRレビュー自動化からドキュメントドリフト検出まで実践的なユースケースを紹介します。"
pubDate: '2026-04-22'
heroImage: '../../../assets/blog/claude-code-routines-practical-guide-2026-hero.jpg'
tags:
  - ClaudeCode
  - 自動化
  - AIエージェント
relatedPosts:
  - slug: claude-code-agentic-workflow-patterns-5-types
    score: 0.95
    reason:
      ko: Routines가 어떤 에이전틱 패턴에 해당하는지 이해하고 싶다면, 이 글에서 다룬 자율 에이전트 패턴 5가지가 직접적인 배경 지식이 됩니다.
      ja: RoutinesがどのエージェンティックパターンになるかをClaudeの5つのワークフローパターンと照らし合わせて理解できます。
      en: Understanding which agentic pattern Routines represent is much clearer after reading this breakdown of Claude Code's five workflow patterns.
      zh: 了解 Routines 对应哪种代理模式，可以参考这篇对 Claude Code 五种工作流模式的详细解析。
  - slug: mcp-server-build-practical-guide-2026
    score: 0.90
    reason:
      ko: Routines의 커넥터가 MCP 기반이므로, MCP 서버를 직접 구축해본 경험이 있다면 커넥터 생태계를 더 깊이 활용할 수 있습니다.
      ja: RoutinesのコネクタはMCPベースなので、MCPサーバーを実際に構築した経験があればコネクタエコシステムをより深く活用できます。
      en: Since Routines connectors are MCP-based, hands-on MCP server experience lets you extend and customize the connector ecosystem beyond the defaults.
      zh: 由于 Routines 连接器基于 MCP，拥有 MCP 服务器构建经验可以让你更深层地定制连接器生态系统。
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.87
    reason:
      ko: Git Worktree로 Claude Code를 병렬 실행하는 패턴을 익혔다면, Routines는 그 병렬성을 시간 축으로 확장하는 자연스러운 다음 단계입니다.
      ja: Git Worktreeを使った並列Claude Codeセッションを習得していれば、Routinesはその並列性を時間軸に拡張する自然な次のステップです。
      en: If you've already set up parallel Claude Code sessions with git worktrees, Routines are the natural next step—extending that parallelism across time rather than space.
      zh: 如果你已掌握用 Git Worktree 并行运行 Claude Code，Routines 是将这种并行性延伸到时间维度的自然下一步。
  - slug: claude-managed-agents-production-deployment-guide
    score: 0.82
    reason:
      ko: Routines는 단순 자동화이고 Managed Agents는 더 복잡한 멀티 에이전트 조율을 다룹니다. 두 접근법의 차이와 적합한 사용 시나리오를 비교하면 선택이 쉬워집니다.
      ja: RoutinesはシンプルなスケジュールタスクでManaged Agentsはより複雑なマルチエージェント調整に対応します。両アプローチの違いを把握することで適切な選択ができます。
      en: Routines handle scheduled automation while Managed Agents coordinate complex multi-agent workflows. Comparing the two helps you pick the right tool for each scenario.
      zh: Routines 处理计划任务，而 Managed Agents 负责更复杂的多代理编排。比较两者的差异有助于为不同场景选择合适的工具。
---

先週、チームメンバーが「昨夜PRが自動でレビューされた」と言ったとき、一瞬止まった。誰もレビューを依頼していないのに、Claudeが夜の間にPRを開き、チームのコーディング規約に沿ってインラインコメントを残し、サマリーまで添えていた。それがClaude Code Routinesとの初対面だった。

Anthropicが2026年4月14日にリサーチプレビューとして公開したRoutinesは、まだベータ段階だが、日常的な繰り返し作業を自動化する方法をかなり変えてしまう。この記事では、Routinesが実際にどう動くのか、どう設定するのか、そして正直どこで限界に当たるかを、実際に使ってみた経験をもとに整理する。

## Claude Code Routinesとは? — Prompt + Repository + Connector の3要素

公式ドキュメントにはこう書かれている。「ルーティンは保存されたClaude Code設定だ: プロンプト、1つ以上のリポジトリ、そしてコネクタセットが一度パッケージ化されて自動的に実行される。」

シンプルに言えば、3つのピースがある。

**プロンプト(Prompt)**: Claudeが毎回の実行時に従う指示。重要なのは、このプロンプトが会話ではなく完全に独立した(self-contained)指示である必要があるということだ。「前回と同じように」は通用しない。実行のたびに最初から始まると考えると理解しやすい。

**リポジトリ(Repository)**: Claudeがクローンして作業するGitHubリポジトリ。デフォルトブランチから始まり、複数リポジトリを指定することもできる。重要な制約が一つある。デフォルトでは、Routinesは`claude/`で始まるブランチにのみプッシュできる。誤って`main`を変更してしまうのを防ぐ安全装置だ。

**コネクタ(Connector)**: MCP(Model Context Protocol)ベースの外部サービス連携。Slack、Linear、Google Drive、GitHubなどが現在サポートされている。コネクタを通じて、ルーティンが単純にコードを見るだけでなく、外部システムへの読み書きができる。

この3要素が組み合わさると、「Anthropicのサーバーで自律的に実行されるAIエージェント」になる。自分のノートPCやサーバーなしで。

## 始める前の準備

Routinesを使うには以下が必要だ。

- Claude Codeがウェブで有効になっているPro、Max、Team、またはEnterpriseプラン
- GitHubアカウント（リポジトリ連携用）
- 使用するMCPコネクタ（Slack、Linearなど）を事前に接続しておくこと

**プランごとの1日の実行上限**:

| プラン | 1日のルーティン実行回数 |
|------|-------------------|
| Pro | 5回 |
| Max | 15回 |
| Team | 25回 |
| Enterprise | 25回 |

正直、Proプランの5回は少し窮屈に感じた。1日にPRが10件を超えるチームなら、すぐに上限に達してしまう。Routinesを本格的に活用するなら、Teamプラン以上が現実的だ。

## Step 1 — 初めてのRoutineを作る

3つの方法でルーティンを作成できる。

### ウェブUI方式（最も直感的）

1. `claude.ai/code/routines`にアクセス
2. 「New routine」をクリック
3. ルーティン名の入力とプロンプトの作成
4. GitHubリポジトリの選択
5. クラウド環境の選択（ネットワークアクセス、環境変数、セットアップスクリプトを制御）
6. トリガーの選択: スケジュール / API / GitHubイベント
7. コネクタ設定の確認
8. 作成

最も重要な部分は**プロンプトの作成**だ。次のように具体的で自己完結的に書く必要がある。

```
あなたはこのリポジトリのコードレビュワーです。

今日新しく開かれたPRを見つけて、以下の作業を行ってください:
1. PRのタイトルと説明が[リポジトリ名]の規約に従っているか確認
2. 変更されたファイルで明らかなバグやセキュリティ問題を確認
3. テストカバレッジが十分か確認（新しい関数ごとにテスト1件以上）
4. 発見した内容をインラインコメントで残し、PRにサマリーコメントを追加

レビューが完了したら、Slack #code-review チャンネルに「レビュー完了: [PRタイトル]」を送信
```

曖昧な表現（「適切にレビューして」「チームスタイルで」）は避けるべきだ。ルーティンは質問を聞き返さない。

### CLI方式

Claude Codeセッション内で `/schedule` コマンドでルーティンを作成できる。

```bash
/schedule daily PR review at 9am
```

Claudeが対話式で必要な情報を聞いてくれる。作成後の管理コマンド:

```bash
/schedule list          # すべてのルーティン一覧
/schedule update        # 既存ルーティンの変更
/schedule run           # 即時実行（テスト用）
```

CLI方式は、すでにClaude Codeセッション内にいるときに素早くルーティンを追加するのに便利だ。

### デスクトップアプリ方式

メニューからSchedule → New task → New remote taskを選択するとウェブUIに接続される。

## Step 2 — トリガーを設定する

Routinesは3種類のトリガーをサポートしており、1つのルーティンに複数のトリガーを同時に設定できる。

### スケジュールトリガー

繰り返し周期を設定する。オプション:
- 毎時 / 毎日 / 平日 / 毎週
- カスタムcron式

```
# 毎日午前9時実行（ローカルタイムゾーンを自動変換）
cron: 0 9 * * *

# 毎週月曜日午前10時
cron: 0 10 * * 1
```

最小間隔は1時間だ。5分ごとの実行のようなポーリングはサポートされていない。

ドキュメントドリフト検出ルーティンに週次スケジュールを使ってみたが、毎週月曜日の朝に先週マージされたPRをスキャンし、古いAPIドキュメントを自動更新するPRを開く方式がかなりうまく動いた。ただし、APIエンドポイントの変更がコードコメントにのみ反映されてドキュメントに漏れている場合を、Claudeが常に見つけてくれるわけではなかった。より精緻なプロンプトが必要だ。

### APIトリガー

各ルーティンは専用のHTTPエンドポイントを持つ。

```bash
# ルーティン実行例
curl -X POST \
  https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire \
  -H "Authorization: Bearer {routine_token}" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -H "Content-Type: application/json" \
  -d '{"text": "今回のデプロイでapi/usersエンドポイントが変更された。関連ドキュメントの確認が必要。"}'
```

`text`フィールドに実行ごとに異なるコンテキストを渡すことができる。モニタリングシステムが異常を検知したときにアラートとともにルーティンをトリガーするパターンに特に有用だ。

例えば、Sentryアラートを受け取ったらスタックトレースを分析して最近のコミットと関連付け、修正案のドラフトPRを開くルーティンを作ることができる。

[MCP サーバーを直接構築したことがある](/ja/blog/ja/mcp-server-build-practical-guide-2026)なら、このコネクタエコシステムがどのように拡張されるかすでに体感しているはずだ。Routinesはそのコネクタを自動化された実行環境でそのまま活用する。

### GitHubイベントトリガー

このトリガーが最も強力だ。PRやリリースイベントが発生すると、自動的にルーティンが実行される。

サポートされているイベント:
- PR: opened, closed, assigned, labeled, synchronized, updated
- Release: created, published, edited, deleted

フィルターオプションが細かい。PR作成者名、タイトル/本文のテキスト、ブランチ名、ラベル、ドラフト状態、マージ状態、正規表現パターンでフィルタリングできる。

```yaml
# PRレビュールーティングのGitHubイベント設定例
trigger:
  type: github_event
  event: pull_request.opened
  filters:
    - author_not_in: ["dependabot[bot]", "renovate[bot]"]  # ボットPRを除外
    - base_branch: "main"
    - labels_not_contains: ["skip-review"]
```

## Step 3 — MCPコネクタ連携で外部サービスを統合

コネクタはルーティンが外部システムと通信するための通路だ。現在サポートされている主なコネクタ:

- **Slack**: チャンネルメッセージの読み書き
- **Linear**: イシューの作成/更新
- **Google Drive**: ドキュメントの読み書き
- **GitHub**: PRコメント、イシュー管理（デフォルト含む）

ルーティン作成時、すでに接続されているMCPコネクタはデフォルトで含まれる。不要なコネクタを削除してルーティンのアクセス範囲を最小化することが重要だ。セキュリティ面で大切な習慣だ。

実際の連携例:

```
[Slack + Linear連携イシュートリアージルーティング]

Slack #bug-reportsチャンネルで過去24時間以内の新しいメッセージを読み:
1. 再現可能なバグレポートかどうかを判断
2. バグであればLinearにイシューを作成（深刻度: 本文から判断）
3. LinearイシューのリンクをSlackスレッドに返信
4. 不明瞭な場合はSlackで追加情報を求めるメッセージを送信
```

[Claude Codeのエージェンティックワークフローの5つのパターン](/ja/blog/ja/claude-code-agentic-workflow-patterns-5-types)を知っているなら、Routinesはその中の「自律エージェント(Autonomous Agent)」パターンをクラウドで予約実行する方式と理解すれば正確だ。

## 実践ユースケース4選

実際によく動くRoutinesのタイプをまとめた。

### ケース1: PR自動レビュー

最も即効性があるケースだ。`pull_request.opened`イベントにトリガーを設定し、チームのコーディング規約をプロンプトに入れると、PRが開かれるたびにClaudeが自動でレビューを始める。

```
[PRレビュールーティングのプロンプト核心部分]

リポジトリのCONTRIBUTING.mdに書かれたスタイルガイドを参照して:
- 変数名がcamelCaseまたはsnake_caseの規約に従っているか確認
- 公開APIの変更時にCHANGELOG.mdが更新されているか確認
- 新しいエンドポイントにOpenAPIスペックが追加されているか確認

発見された問題はGitHubインラインコメントで、全体サマリーはPRコメントで残すこと
「LGTM」または「変更リクエスト」の判定はしないこと（それは人間が決める）
```

最後の行が重要だ。Claudeに最終判定の権限を与えるとチームメンバーが不快に感じることがある。「発見+説明」までにとどめ、決定は人間に委ねるのが現実的だ。

### ケース2: 夜間バックログトリアージ

毎晩新しく開かれたイシューを分類するルーティングだ。

```
毎日深夜実行:
1. 今日開かれたGitHubイシューをすべて取得
2. イシューのタイプタグを追加 (bug, feature-request, question, documentation)
3. コードエリアごとの担当者を自動アサイン (CODEOWNERSファイル参照)
4. 分類結果をLinearイシューとして作成 (Slack #triageチャンネルにもサマリーを送信)
```

これを直接使ってみてわかったことがある。CODEOWNERSファイルが最新の状態でないと、ルーティングが的外れな人にアサインしてしまう。Routinesが良い自動化を作ってくれるのではなく、良いベースデータがあるときにそれを活用するツールだ。

### ケース3: デプロイ後スモークテスト

CD パイプラインの最後にAPIルーティングをトリガーする。

```bash
# CI/CDでデプロイ完了後に実行
curl -X POST \
  https://api.anthropic.com/v1/claude_code/routines/{smoke_test_routine_id}/fire \
  -H "Authorization: Bearer {token}" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -d '{
    "text": "v2.3.4デプロイ完了。環境: production。デプロイ時刻: 2026-04-22T14:30:00Z"
  }'
```

ルーティングはデプロイされたバージョンの主要APIエンドポイントを呼び出し、エラーログをスキャンし、#releasesチャンネルにgo/no-go判定を送信する。

[MCP サーバーをKubernetes にプロダクションデプロイする方法](/ja/blog/ja/mcp-server-production-deployment-kubernetes-guide)をすでに扱ったが、このスモークテストルーティングをそのパイプラインの最後のステップとして組み込むと自然につながる。

### ケース4: 週次ドキュメントドリフト検出

毎週月曜日の朝、先週マージされたPRをスキャンして、APIドキュメントがコードと不一致な箇所を見つけて更新PRを開くルーティングだ。

正直、これが最も印象的だった。コード変更とドキュメント更新の間のギャップを人間が毎週手動でチェックするのは、現実的に難しい。ルーティングがこの役割を担ってくれれば、ドキュメント品質を維持するのに大いに役立つ。ただし、Claudeが生成した更新PRを無条件にマージせず、必ず人間がレビューするステップを維持する必要がある。

## 正直な評価 — 限界と注意点

Routinesが印象的なのは事実だが、まだリサーチプレビュー段階だという点を過小評価してはならない。

**プロダクション運用にすぐ使うのは早い。** APIが`experimental-cc-routine-2026-04-01`ヘッダーを要求していること自体がこの機能の成熟度を示している。APIサーフェスが変わる可能性があり、過去2つのバージョンのみ互換性を維持すると明示されている。クリティカルパスの自動化にはまだ検証が必要だ。

**監査証跡(Audit Trail)が不十分だ。** ルーティングがなぜ特定の決定を下したかを把握するのが難しい。Claudeがプルリクエストにコメントしたりイシューを自動作成したりするとき、その判断根拠をログから完全に再現するのは現状ほぼ不可能だ。

**承認チェックポイントがない。** ルーティングは完全に自律的に実行される。ミスがリポジトリに反映された後でのみ発見できる可能性があることを意味する。

**GitHubイベント処理量の制限がある。** リサーチプレビュー期間中、GitHubイベントはルーティングごと、アカウントごとに時間当たりの上限がある。PRが多いモノレポにイベントトリガーを設定すると、上限に達してイベントがドロップされる可能性がある。

**セッションの再利用ができない。** GitHubイベントが2回発生すると、2つの独立したセッションが開始される。前回実行のコンテキストを次の実行に引き継ぐ方法がない。

[Claude Codeを並列セッションで運用する方法](/ja/blog/ja/claude-code-parallel-sessions-git-worktree)をすでに習得しているなら、Routinesはその並列性を時間軸に拡張する概念として捉えることができる。今この瞬間自分が別の作業をしている間、ルーティングが別のリポジトリで別の作業を処理している。

## 結論 — どのチームに適しているか

正直な立場を言えば、Routinesは現段階で**AI自動化に慣れたチームの実験的ツール**として最も適している。

3種類の作業に絞って始めることをお勧めする。

<strong>第一</strong>、人間が毎回やる必要があるが規則が明確な繰り返し作業（バックログトリアージ、タグ分類）。
<strong>第二</strong>、失敗しても次の実行で自動補完される作業（ドキュメントドリフト検出）。
<strong>第三</strong>、結果物が人間の最終レビューを経る作業（レビュー草稿、更新PRの草稿）。

Routinesに積極的に投資を続けているAnthropicの動きは明確だ。ログの強化、GitHubイベント処理量の拡大、セッション継続性のサポートは近い将来実現する可能性が高い。今から軽く試しながらチームに合ったパターンを見つけておく方が賢明だ。

---

**参考リンク**:
- [Claude Code Routines公式ドキュメント](https://code.claude.com/docs/en/routines)
- [Routines紹介ブログポスト (Anthropic)](https://claude.com/blog/introducing-routines-in-claude-code)
