---
title: 'Cloudflare Agents Week 2026分析 — AIエージェントがクラウドインフラを自律的にプロビジョニングする'
description: 'Cloudflareが4月のAgents Week行事で20件以上の発表を行った。Sandboxes GA、Artifacts、Dynamic Workers、さらにエージェントが直接Cloudflareアカウントを作成してドメインを購入する機能まで。@cloudflare/agents SDKをローカルで実際に動かした結果をまとめた。'
pubDate: '2026-05-15'
heroImage: '../../../assets/blog/cloudflare-agents-week-2026-autonomous-infrastructure-hero.png'
tags: ['Cloudflare', 'AIエージェント', 'エージェントインフラ', 'Webプラットフォーム']
relatedPosts:
  - slug: 'ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production'
    score: 0.87
    reason:
      ko: 'Cloudflare의 에이전트 인프라 방식이 LangGraph, CrewAI, Dapr와 어떻게 다른지 비교하고 싶다면 이 글이 직접적인 참조가 된다.'
      ja: 'CloudflareのアプローチがLangGraph、CrewAI、Daprとどう異なるかを具体的に比較したい場合、この記事が直接の参照になる。'
      en: 'If you want to compare how Cloudflare stacks up against LangGraph, CrewAI, and Dapr for agent infrastructure, this post is the direct reference.'
      zh: '如果想了解Cloudflare的方式与LangGraph、CrewAI、Dapr有何不同，这篇文章是直接的参照。'
  - slug: 'dapr-agents-v1-cncf-production-ai-framework'
    score: 0.83
    reason:
      ko: 'Dapr Agents v1이 Kubernetes에서 상태와 메시징을 어떻게 처리하는지 알면, Cloudflare의 Durable Object 기반 접근과 어느 쪽이 팀에 맞는지 판단하기 훨씬 쉽다.'
      ja: 'Dapr AgentsがKubernetesでどう動作するかを把握すると、Cloudflareのアプローチとの違いが具体的に見えてきて選択が楽になる。'
      en: "Understanding how Dapr Agents v1 handles state and messaging on Kubernetes gives you a concrete basis for deciding whether Cloudflare's Durable Object approach is the better fit."
      zh: '了解Dapr Agents v1在Kubernetes中如何处理状态和消息，有助于判断Cloudflare的Durable Object方式哪个更适合你的团队。'
  - slug: 'claude-agent-sdk-tool-use-complete-guide-2026'
    score: 0.80
    reason:
      ko: 'Cloudflare Agents SDK는 Workers 런타임 전용이다. 런타임 제약 없이 Python/Node에서 에이전트를 만들고 싶다면 Claude Agent SDK가 그 대안이다.'
      ja: 'CloudflareのSDKはWorkersランタイム専用だ。制約なしにPython/Nodeでエージェントを作りたいなら、Claude Agent SDKがその代替として評価できる。'
      en: "Cloudflare's SDK is Workers-runtime-only. If you want to build agents in Python or standard Node without that constraint, the Claude Agent SDK is the direct alternative to evaluate."
      zh: 'Cloudflare的SDK只能在Workers运行时中使用。如果你想在Python/Node中不受运行时限制地构建智能体，Claude Agent SDK是直接的替代选项。'
  - slug: 'mcp-server-production-deployment-kubernetes-guide'
    score: 0.76
    reason:
      ko: 'Cloudflare에서 벤더 락인이 싫어서 컨테이너 기반 에이전트 인프라를 고려한다면, MCP 서버를 Kubernetes에 올리는 이 가이드가 비교 기준이 된다.'
      ja: 'CloudflareのロックインではなくKubernetesベースのアプローチを検討するなら、このMCPサーバーデプロイガイドが比較の土台になる。'
      en: 'If vendor lock-in concerns push you toward container-based agent infrastructure instead of Cloudflare, this Kubernetes MCP deployment guide gives you the concrete alternative.'
      zh: '如果Cloudflare的厂商锁定让你倾向于基于容器的智能体基础设施，这篇Kubernetes上部署MCP服务器的指南可以作为对比基准。'
---

去年の今ごろ、AIエージェントインフラの話をすればKubernetes + LangGraphの組み合わせが定番だった。ところがCloudflareが4月のAgents Weekで見せた絵は少し違った。エージェントが単にAPIを呼ぶだけでなく、Cloudflareアカウントを自分で作り、ドメインを購入して、コードをデプロイする。「エージェントがクラウドの顧客になる」という言葉が誇張に聞こえるかもしれないが、今回は本当にそういう作りにした。

全体の発表を見渡して、私が最も印象を受けた点と半信半疑な点を合わせてまとめる。

## Agents Week 2026とは

Cloudflareが2026年4月に「エージェント専用の一週間」を宣言し、毎日複数件の発表を繰り出したイベントだ。最終集計で20件以上の新機能とGA移行が発表された。会社全体が「エージェントがインターネットの主要なアクターになる」という前提のもとでインフラ全域を再編した印象がある。

発表リストは膨大なので、実際の開発に影響を与える項目を中心に絞った。

## 最も挑発的な発表 — エージェントがCloudflareアカウントを直接作る

正直、最初に読んだとき「これ本当?」と思った。内容はこうだ。ユーザーがCloudflareの利用規約に最初に同意しておけば、以後はエージェントが自律的にCloudflareアカウントの作成、有料サブスクリプションの開始、ドメイン登録、APIトークン発行、コードデプロイまで完了する。Stripeとのパートナーシップで決済トークン化が可能になり、OAuth + OIDCでエージェントを「信頼できるアクター」として認証する。

これが意味するところはかなり大きい。これまでAIエージェントの役割は「人間がアカウントを作っておいたインフラで作業する」ことだった。今回はエージェント自身がインフラをプロビジョニングする主体となる。SaaSを作るチームなら「エージェントが新規顧客のオンボーディングを代わりに処理する」シナリオが現実的に可能になる。

ただし、私が不安に思う点がある。エージェントが決済まで紐づいたアカウントを作るということは、コスト制御の仕組みが明確でなければリスクが大きい。Cloudflareの新しい`task_budget`概念と組み合わせる必要がありそうだが、まだこの組み合わせの実践パターンはほとんどない。また、エージェントが作ったアカウントの法的責任の帰属も先例がない。利用規約にユーザーが同意していても、エージェントが誤ったドメインを登録した場合の責任が誰にあるのかは依然として曖昧だ。

## 開発者が実際に使える3つの発表

華やかな発表より、私にとってより実用的に見えたものがある。

**Sandboxes GA**: 2025年6月のベータから9ヶ月でGAになった。エージェント専用の隔離Linux环境だ。シェル、ファイルシステム、バックグラウンドプロセスがあり、on-demandで起動する。注目すべき点は「picks up exactly where it left off」という動作 — エージェントが中断後に再開するとき、同じ環境の状態を引き継ぐ。コンテナのスピンアップがミリ秒単位という点も利点だ。コード生成エージェントが実際にコードを実行してテストするサイクルが可能になる。

[LangGraphやCrewAIのようなフレームワークでエージェントのコード実行環境を別途構成](/ja/blog/ja/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)していたなら、Sandboxesはその部分をCloudflareが管理してくれる方式だ。フレームワークを選ぶよりもインフラ層を選ぶ決断に近い。

**Artifacts**: Git互換バージョン管理ストレージだ。数千万のリポジトリを作成でき、リモートソースからフォークもでき、標準のGitクライアントでアクセス可能だ。Private betaから5月初めにpublic betaになった。エージェントが作ったコードを永続的に保存してバージョン管理する用途だ。コンテキストが消えても成果物が残る。

**Dynamic Workers**: AIが生成したコードを実行する隔離ランタイムだ。既存のコンテナ比でミリ秒単位のスピンアップが可能だという。エージェントがコードを生成して、すぐに実行結果を受け取り次のステップに進むループが可能になる。

## @cloudflare/agents SDKを実際に入れてみた

理論は十分なので実際に動かしてみた。

```bash
mkdir cloudflare-agent-demo && cd cloudflare-agent-demo
npm init -y
npm install @cloudflare/agents
```

インストールはすぐできる。`@cloudflare/agents@0.0.16`時点での主要なexportは`Agent`、`AIChatAgent`、`routeAgentRequest`の三つだ。

基本的なエージェントコードを書いた:

```typescript
// src/index.ts
import { Agent, routeAgentRequest } from "@cloudflare/agents";

interface TaskState {
  processedCount: number;
  lastHeartbeat: string;
}

interface Env {
  TASK_AGENT: DurableObjectNamespace<TaskAgent>;
}

export class TaskAgent extends Agent<Env, TaskState> {
  async onStart() {
    this.setState({ processedCount: 0, lastHeartbeat: new Date().toISOString() });
    await this.schedule("0 * * * *", "heartbeat", {});
  }

  async heartbeat() {
    const count = this.sql<{ n: number }>`SELECT COUNT(*) as n FROM tasks`;
    this.setState({
      processedCount: count[0]?.n ?? 0,
      lastHeartbeat: new Date().toISOString()
    });
  }

  async onRequest(request: Request): Promise<Response> {
    return Response.json({ state: this.state });
  }

  async onEmail(email: ForwardableEmailMessage) {
    this.sql`
      INSERT INTO tasks (id, content, created_at)
      VALUES (${crypto.randomUUID()}, ${email.from}, ${Date.now()})
    `;
  }
}

export default {
  fetch: async (req: Request, env: Env): Promise<Response> => {
    const routed = await routeAgentRequest(req, env);
    return routed ?? new Response("OK", { status: 200 });
  }
};
```

`wrangler dev`を実行するとローカルですぐに動く:

```
⛅️ wrangler 4.91.0
Your Worker has access to the following bindings:
  env.TASK_AGENT (TaskAgent)   Durable Object   local

⎔ Starting local server...
[wrangler:info] Ready on http://localhost:9998
[wrangler:info] GET / 200 OK (7ms)
```

Cloudflareのアカウントなしでもローカル開発はできる。重要な点が一つ: `@cloudflare/agents`は`cloudflare:workers`ランタイム専用なので通常のNode.jsでは実行できない。`ERR_UNSUPPORTED_ESM_URL_SCHEME`エラーが出る。Wrangler経由でのみ実行可能だ。[Claude Agent SDKのようにPython/Node.jsから直接importする方式](/ja/blog/ja/claude-agent-sdk-tool-use-complete-guide-2026)に慣れた開発者には最初は戸惑うかもしれない。

## アーキテクチャ的に興味深い設計選択

コードを見ていてCloudflareの設計意図がいくつか見えてきた。

**SQLite内蔵**: `new_sqlite_classes`一つ宣言するだけでAgentインスタンスごとにSQLiteが付く。別途DB設定なしで`this.sql`でクエリできる。Durable Objectの隔離性のおかげでマルチテナンシー構造が自然にできる。Agentインスタンスごとに独立したDBを持つのは最初は無駄に見えるが、状態隔離の面ではかなりすっきりしている。

**スケジューリング内蔵**: `cron`形式のスケジュールをエージェント内部から直接登録する。外部のcronサービスが不要だ。Durable Objectのアラームアピを薄くラップしたもので、エージェントコード内でスケジュールと状態管理が一緒になっているので凝集度が高い。

**メールハンドラー**: `onEmail`メソッド一つでメールを直接処理できる。Workers Email Routingとの連携だ。エージェントがメールを受け取ってタスクにするパターンが自然に書ける。

[DaprエージェントがKubernetesでサイドカーパターンで状態とメッセージを管理する方式](/ja/blog/ja/dapr-agents-v1-cncf-production-ai-framework)と比べると、Cloudflareのアプローチはインフラをあまり触らずにコードに集中する方向性だ。どちらもトレードオフがある。

## 正直な評価

良いところから言う。エージェントのためのインフラ層を最初から新しく設計したという点が一貫していて見える。Durable Objectの上に状態、スケジュール、メール、SQLite、スケジューリングを乗せた構造が「エージェントに何が必要かを理解して設計した」という感じを与える。ローカル開発環境がすぐ立ち上がるのも利点だ。

不安な点が二つある。

一つ目は**ベンダーロックインが強い**こと。`cloudflare:workers`でしか動かず、Durable Objectの設計をそのまま踏まえる。後でプラットフォームを変えたいとなるとエージェントコードをかなり書き直す必要がある。[MCPサーバーをKubernetesに乗せる方式](/ja/blog/ja/mcp-server-production-deployment-kubernetes-guide)のようにコンテナベースで行けばこの問題はないが、その代わりインフラの複雑度が上がる。

二つ目は**エージェント間通信のパターンがまだ薄い**こと。発表内容を見ると単一エージェントが大幅に強化されたが、複数エージェントが複雑に協力するパターンはSDKレベルでまだ薄い。マルチエージェントオーケストレーションを本格的に作るには追加の構造が必要だ。この部分はProject Thinkフレームワークで改善中とのことだが、まだ初期段階だ。

## どんな場合にCloudflareを選ぶべきか

私の整理はこうだ。

**合うケース**: エッジのレスポンス速度が重要なエージェント、Cloudflare Workersベースで既に何かを運用しているチーム、「デプロイはできる限りシンプルに、コードに集中したい」という方向性、多数の独立したエージェントがそれぞれ状態を持つマルチテナンシー構造。

**合わないケース**: 複雑なマルチエージェントオーケストレーション（すでにLangGraphチームなら）、特定クラウドインフラ（AWS、GCP）に縛られているチーム、Node.jsやPythonランタイムで直接実行する必要がある要件。

Agents Weekの全体的な方向性は明確だ。CloudflareはAIエージェントインフラの標準の座を狙っている。KubernetesがコンテナerみたいにエージェントJidaの基盤になろうという意図だ。SDKがまだv0レベルなのでプロダクション適用には慎重さが必要だが、方向性に一貫性はある。直接試してみる価値はある。

## Signed Agents：エージェントトラフィックへの暗号学的アイデンティティ

あまり注目されなかった発表だが、私には興味深かった：Signed Agentsだ。エージェントが送るHTTPリクエストに暗号学的な署名を付け、「これはエージェントが送ったもの」であることを証明できる仕組みだ。

現在、インターネットではエージェントのトラフィックと人間のトラフィックを区別する標準的な方法がない。User-Agentの文字列やIPパターンはあくまで推測だ。Signed Agentsはサーバー側が検証できるシグナルを提供する。署名を確認してエージェント専用のレート制限、課金、アクセス制御を適用できる。まだ初期段階の仕組みだが、方向性は正しい。エージェントが一般的なトラフィックとして扱われる時代になれば、暗号学的なアイデンティティはフィーチャーではなくインフラになる。

## メールサービス パブリックベータ

Workers Email ServiceがAgents Weekでパブリックベータに移行した。SendGridやAWS SESのようなサードパーティのメールサービスを使わずに、エージェントが直接メールを送信できるようになった。

SDKに既に含まれている`onEmail`ハンドラーと組み合わせることで、受信と送信の両方をCloudflareのスタック内だけで処理できる。顧客サポートエージェント、通知パイプライン、メールベースのタスク管理に直接活用できる。

## まとめ

Agents Weekを全体として見ると、機能リリースというよりもポジショニング宣言に近い。20件以上の発表がすべて同じ方向を向いている：CloudflareはエージェントのためのKubernetesになろうとしている。

このWeekから実際に作るとしたら、まずSandboxesを選ぶ。「エージェントがアカウントを作る」というヘッドラインよりも、エージェントのコード実行に使える永続的な隔離Linux環境の方が、今すぐ使える実用価値が高い。

`@cloudflare/agents@0.0.16`はプロダクション適用の余地をまだ問う必要がある段階だ。しかし、エージェントインフラの選択肢を真剣に評価しているなら、ローカル環境を立ち上げて実際に確認してみることを勧める。20分、アカウント不要で試せる。

---

**テスト環境**: `@cloudflare/agents@0.0.16`、`wrangler@4.91.0`、Node.js v22.22.0、macOS 14  
**備考**: エージェント自律アカウント作成機能は実際のCloudflareアカウントとStripe連携が必要でありローカルテストの範囲外だ。  
**原発表**: [Cloudflare Agents Week 2026](https://blog.cloudflare.com/agents-week-in-review/)
