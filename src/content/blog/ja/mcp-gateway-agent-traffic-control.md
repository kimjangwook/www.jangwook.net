---
title: MCP Gateway — AIエージェントのツール呼び出しを誰がコントロールしているのか
description: >-
  MCPが月間9,700万ダウンロードを突破し事実上の標準になったが、エージェントがどのツールをどれだけ呼び出すかを制御するレイヤーは欠けている。MCP
  Gatewayパターンでこの課題を解決する。
pubDate: '2026-04-02'
heroImage: ../../../assets/blog/mcp-gateway-agent-traffic-control-hero.jpg
tags:
  - mcp
  - security
  - ai-agent
  - architecture
relatedPosts:
  - slug: sqlite-ai-swarm-build
    score: 0.94
    reason:
      ko: MCP Gateway가 에이전트의 도구 호출을 중앙에서 통제하듯, 멀티 에이전트 스웜에서도 각 에이전트의 리소스 접근과 작업 범위를 제어하는 오케스트레이션이 핵심입니다.
      ja: MCP Gatewayがエージェントのツール呼び出しを一元管理するように、マルチエージェントスウォームでも各エージェントのリソースアクセスと作業範囲を制御するオーケストレーションが鍵になります。
      en: Just as MCP Gateway centralizes control over agent tool calls, multi-agent swarms face the same challenge of orchestrating resource access and task boundaries for each agent.
      zh: 正如MCP Gateway集中控制Agent的工具调用，多Agent蜂群同样需要编排每个Agent的资源访问和任务边界。
  - slug: nist-ai-agent-security-standards
    score: 0.94
    reason:
      ko: MCP Gateway의 인증/인가, 감사 로그, 정책 적용은 결국 NIST가 정의한 AI 에이전트 보안 표준을 런타임에서 구현하는 것과 같습니다.
      ja: MCP Gatewayの認証・認可、監査ログ、ポリシー適用は、NISTが定義したAIエージェントセキュリティ標準をランタイムで実装することに他なりません。
      en: The authentication, audit logging, and policy enforcement in MCP Gateway are essentially a runtime implementation of the AI agent security standards defined by NIST.
      zh: MCP Gateway的认证授权、审计日志和策略执行，本质上是在运行时落地NIST定义的AI Agent安全标准。
  - slug: adl-agent-definition-language-governance
    score: 0.94
    reason:
      ko: MCP Gateway가 런타임에서 도구 호출을 통제한다면, ADL은 에이전트의 권한과 행동 범위를 선언적으로 정의하는 설계 시점의 거버넌스입니다. 둘을 조합하면 완전한 에이전트 통제 체계가 됩니다.
      ja: MCP Gatewayがランタイムでツール呼び出しを制御するなら、ADLはエージェントの権限と行動範囲を宣言的に定義する設計時のガバナンスです。両者を組み合わせれば完全なエージェント制御体系になります。
      en: If MCP Gateway controls tool calls at runtime, ADL defines agent permissions and behavioral boundaries declaratively at design time. Combining both creates a complete agent governance stack.
      zh: 如果MCP Gateway在运行时控制工具调用，ADL则在设计时以声明式方式定义Agent的权限和行为边界。两者结合才构成完整的Agent治理体系。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.94
    reason:
      ko: 엔터프라이즈 에이전트 플랫폼에서 MCP Gateway 같은 통제 레이어가 어떻게 제품화되는지 보여주는 사례입니다. 개인 프록시 vs 상용 플랫폼의 차이를 비교해볼 수 있습니다.
      ja: エンタープライズエージェントプラットフォームにおいて、MCP Gatewayのような制御レイヤーがどのように製品化されるかを示す事例です。個人プロキシと商用プラットフォームの違いを比較できます。
      en: Shows how an enterprise agent platform productizes the kind of control layer that MCP Gateway provides. Useful for comparing a DIY proxy approach against a commercial platform solution.
      zh: 展示了企业级Agent平台如何将MCP Gateway式的控制层产品化。可以对比自建代理与商业平台方案的差异。
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.94
    reason:
      ko: Dapr Agents가 CNCF 생태계 위에서 에이전트를 운영하듯, MCP Gateway도 클라우드 네이티브 인프라 패턴(사이드카, 서비스 메시)을 활용합니다. 프로덕션 배포 아키텍처의 공통점이 많습니다.
      ja: Dapr AgentsがCNCFエコシステム上でエージェントを運用するように、MCP Gatewayもクラウドネイティブインフラパターン（サイドカー、サービスメッシュ）を活用します。プロダクション配置アーキテクチャの共通点が多いです。
      en: Just as Dapr Agents runs agents on the CNCF ecosystem, MCP Gateway leverages cloud-native infrastructure patterns like sidecars and service meshes. The two share significant overlap in production deployment architecture.
      zh: Dapr Agents在CNCF生态上运行Agent，MCP Gateway也利用Sidecar和服务网格等云原生基础设施模式。两者在生产部署架构上有很多共同点。
---

私のClaude Codeセッション一つが、7つのMCPサーバーに接続されている。GitHub、Notion、Google Calendar、Gmail、Chrome DevTools、NotebookLM、そしてTelegram。このエージェントは私のメールを読み、カレンダーに予定を作り、Notionページを編集し、Chromeタブを開くことができる。

で、これを誰が監視しているのか？

誰もいない。少なくとも今の私のローカル環境では。

## MCPは成功した。セキュリティレイヤーはまだだ

MCP（Model Context Protocol）の成長は凄まじい。Python + TypeScript SDKの合計月間ダウンロード数が9,700万を超え、Anthropic、OpenAI、Google、Microsoft、Amazonがすべてサポートしている。2024年末にAnthropicが作り、2025年12月にLinux FoundationのAAIFに寄付されて以来、事実上「AIエージェントが外部ツールを呼び出す方法」の標準となった。

問題は、このプロトコルが**接続**にフォーカスしていて、**制御**にはあまり関心がないということだ。

MCPサーバーを作るとツール（tool）を定義し、クライアントがそのツールを呼び出す。認証？OAuth 2.1がスペックに入った。しかし「このエージェントがこのツールを1日に何回まで呼び出せるか」「機密データを返すツールは承認なしで呼び出してはならない」といったポリシーレイヤーはMCPプロトコル自体にはない。それは実装側の責任だ。

そこで出てきた概念がMCP Gatewayだ。

## MCP Gatewayとは何か

API Gatewayを想像すればいい。KongやAWS API Gatewayのようにバックエンドの前にプロキシを置くように、MCPサーバー群の前にプロキシを一つ置く。

エージェント → **MCP Gateway** → MCPサーバー群

Gatewayがやること：
- **認証/認可**：どのエージェントがどのツールにアクセスできるか
- **レートリミット**：ツール呼び出し頻度の制限
- **監査ログ**：誰がいつどのツールを呼んだか全て記録
- **ポリシー適用**：特定のツールは人間の承認後にのみ実行
- **トラフィックルーティング**：リクエストを適切なMCPサーバーに転送

私はこれをローカル環境で簡単にテストしてみた。Node.jsでMCPプロキシを一つ作り、Claude Codeと実際のMCPサーバーの間に挟む方式だ。

```typescript
// 最もシンプルなMCP Gatewayの骨格
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const gateway = new Server({ name: "mcp-gateway", version: "0.1.0" }, {
  capabilities: { tools: {} }
});

// ポリシーエンジン — ここで呼び出しを許可/拒否する
const policy = {
  "gmail_read_message": { rateLimit: 10, requireApproval: false },
  "gmail_create_draft": { rateLimit: 5, requireApproval: true },
  "gcal_delete_event": { rateLimit: 2, requireApproval: true },
  "notion-update-page": { rateLimit: 20, requireApproval: false },
};

const callCount: Record<string, number> = {};

gateway.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const rule = policy[toolName];
  
  // レートリミットチェック
  callCount[toolName] = (callCount[toolName] || 0) + 1;
  if (rule && callCount[toolName] > rule.rateLimit) {
    return {
      content: [{ type: "text", text: `Rate limit exceeded for ${toolName}` }],
      isError: true,
    };
  }
  
  // 承認が必要なツールはブロック
  if (rule?.requireApproval) {
    console.error(`[GATEWAY] Approval required for: ${toolName}`);
    // 実際にはここでSlack/Telegramに承認リクエストを送る
  }
  
  // 監査ログ
  console.error(`[AUDIT] ${new Date().toISOString()} | ${toolName} | args: ${JSON.stringify(request.params.arguments)}`);
  
  // 実際のMCPサーバーにフォワード（ここでは省略）
  return await forwardToUpstream(toolName, request.params.arguments);
});
```

このコードが実際にプロダクションで使えるか？正直まだだ。しかしコアアイデアはこれだけで十分伝わる。エージェントのツール呼び出しは必ず一箇所を経由すべきで、その一箇所でポリシーを適用できなければならない。

## 実際に動かしてみたら足りないものが見えた

上のコードをClaude Codeに挟んで動かしてみた。結論から言うと——そのままでは動かない。

最初の問題は<strong>ツールリストの同期</strong>だ。Gatewayが`CallToolRequest`をインターセプトするには、まずクライアント（Claude Code）に「これらのツールがある」と伝える必要がある。上のコードには`listTools`ハンドラーがない。upstream MCPサーバーに接続してツールリストを取得し、それをそのままクライアントに伝えるパートを自分で作る必要がある。

```typescript
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

gateway.setRequestHandler(ListToolsRequestSchema, async () => {
  const upstreamTools = await fetchToolsFromUpstream();
  return { tools: upstreamTools };
});
```

これだけで動くには動くが、upstreamサーバーが複数あるとツール名が衝突する可能性がある。私の環境ではGmailとGoogle Calendarが両方とも`list`のようなgenericなツール名を公開していたので、ネームスペースを付ける必要があった。

2つ目の問題は<strong>レートリミットの寿命</strong>だ。上のコードの`callCount`はメモリ上にある。プロセスを再起動するとカウントが0に戻る。Claude CodeはセッションごとにMCPサーバーを新しく起動するので、セッションが変わるたびにリミットがリセットされる。「1日10回」というポリシーをちゃんと守れないということだ。

3つ目に、`requireApproval`を`console.error`で出力するのは全く意味がなかった。stderrログをリアルタイムで見ている人がいないから。実際に承認を得るには外部チャネル（Telegram、Slack）にリクエストを送って応答が来るまでブロックする必要があるが、stdio基盤のMCPで非同期待機を実装するのはかなり面倒だ。

この3つを一度に解決する方法は何かと考えたが、少なくとも1つ目と2つ目の答えはシンプルだ。<strong>監査ログをファイルやメモリではなくSQLiteに書けばいい。</strong>

## 監査ログをSQLiteへ

`console.error`で流していた監査ログをSQLiteテーブルに保存すれば、レートリミットの寿命問題も同時に解決する。プロセスが再起動してもDBは残るから。

```typescript
import Database from "better-sqlite3";

const db = new Database("mcp-audit.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    tool_name TEXT NOT NULL,
    args TEXT,
    result_status TEXT DEFAULT 'ok',
    latency_ms INTEGER,
    blocked INTEGER DEFAULT 0,
    block_reason TEXT
  )
`);

const insertLog = db.prepare(`
  INSERT INTO audit_log (tool_name, args, result_status, latency_ms, blocked, block_reason)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const countToday = db.prepare(`
  SELECT COUNT(*) as cnt FROM audit_log
  WHERE tool_name = ? AND timestamp > datetime('now', '-1 day') AND blocked = 0
`);
```

既存の`callCount`ディクショナリの代わりに`countToday`クエリを使えば、セッションが変わっても「今日Gmailの読み取りを何回呼んだか」を正確に追跡できる。Gatewayのハンドラーはこう変わる：

```typescript
gateway.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const rule = policy[toolName];
  const start = Date.now();

  if (rule) {
    const { cnt } = countToday.get(toolName) as { cnt: number };
    if (cnt >= rule.rateLimit) {
      insertLog.run(toolName,
        JSON.stringify(request.params.arguments),
        "blocked", 0, 1, "rate_limit");
      return {
        content: [{ type: "text",
          text: `Rate limit exceeded: ${toolName} (${cnt}/${rule.rateLimit} today)` }],
        isError: true,
      };
    }
  }

  const result = await forwardToUpstream(
    toolName, request.params.arguments);
  const latency = Date.now() - start;

  insertLog.run(toolName,
    JSON.stringify(request.params.arguments),
    "ok", latency, 0, null);
  return result;
});
```

## 溜まったログで何ができるか

数日動かすと`mcp-audit.db`にデータが溜まった。これで出来ることが思った以上に多い。

<strong>ツール別呼び出し頻度</strong>——どのツールが最も多く呼ばれているか一目で分かる。

```sql
SELECT tool_name, COUNT(*) as calls, ROUND(AVG(latency_ms)) as avg_ms
FROM audit_log WHERE blocked = 0
GROUP BY tool_name ORDER BY calls DESC LIMIT 10;
```

私の場合`notion-search`が圧倒的1位だった。エージェントが何かをする前にまずNotionを検索するパターンがあるようだ。これを見てNotion検索結果のキャッシングが意味あるかもと思った。

<strong>ブロック率</strong>——レートリミットに引っかかった呼び出しが全体の何パーセントか。

```sql
SELECT tool_name,
  SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked,
  COUNT(*) as total,
  ROUND(100.0 * SUM(blocked) / COUNT(*), 1) as block_rate
FROM audit_log GROUP BY tool_name HAVING blocked > 0;
```

ブロック率が高ければ2つのうちどちらかだ。リミットが厳しすぎるか、エージェントが同じツールを繰り返し呼ぶ非効率なパターンを持っているか。後者ならプロンプトを見直すべきだ。

<strong>時間帯別パターン</strong>——エージェントが最も活発な時間帯はいつか。

```sql
SELECT strftime('%H', timestamp) as hour, COUNT(*) as calls
FROM audit_log GROUP BY hour ORDER BY hour;
```

当然の結果ではあるが、私のcronジョブが走る11時〜12時に呼び出しが集中する。チーム環境ならこのデータでMCPサーバーの負荷分散タイミングを決められるだろう。

このデータの本当の価値は<strong>ポリシーチューニングの根拠</strong>になるということだ。「Gmailの読み取りは1日10回で足りるか？」という問いに勘で答えるのではなく、実際の利用パターンを見て判断できる。私の場合`gmail_read_message`は1日平均3回しか使っておらず、リミット10は余裕だった。一方`notion-search`は1日40回近く呼ばれていてリミット20では足りず、30に上げた。

## 実際に必要になる瞬間

「うちのチームはまだMCPをそんなに使ってないですけど」——この言い訳が通じる時代が終わりつつある。

私が実際に経験したケースを一つ挙げると、Claude CodeでNotion MCPを使ってページを編集中に、意図せず別チームのページに触れてしまったことがある。エージェントが検索結果から似たタイトルのページを選び、私は承認ボタンを何も考えずに押した。データが消えたわけではないが、気まずかった。

これが1人の開発者のローカルで起きれば気まずい程度だ。しかし50人のチームがエージェントを使い、各エージェントが5〜10個のMCPサーバーに接続されていたら？監査ログもなしに？誰がどのツールを呼んだか追跡もできないなら？

エンタープライズでMCP Gatewayが必要な本当の理由はセキュリティよりも**可視性**だ。エージェントが何をしているのか見えなければならない。

## すでに登場しているソリューション

MCP Gatewayという名前で登場しているオープンソースと商用プロジェクトがすでにある。調べた限りでは大きく2つのアプローチがある。

**1. プロキシ方式** — エージェントとMCPサーバーの間にリバースプロキシを置く。既存のAPI Gatewayとアーキテクチャが同じだ。設定がシンプルで既存インフラを再利用できるのがメリット。

**2. サイドカー方式** — 各MCPサーバーにポリシーエンジンを付ける。サービスメッシュ（Istio、Linkerd）のサイドカーパターンと同一だ。より細かい制御が可能だが運用の複雑さが上がる。

小規模チームならプロキシ方式で十分だと私は思う。サイドカーまで行くのはMCPサーバーが20個以上あり、チームごとに異なるポリシーが必要な場合だが、その規模なら既に専任のプラットフォームエンジニアがいるはずだ。

## ただし、これは過渡期の解法だ

ここで批判的に考えるべきことがある。

MCP Gatewayが必要だということは、MCPプロトコル自体にガバナンスレイヤーが欠けているということだ。HTTPの上にAPI Gatewayを載せるのはHTTPに認証がないからではなく、ビジネスロジックとトラフィック管理が必要だからだ。MCPも同様に、プロトコルレベルでポリシーを定義できる拡張が出る可能性が高い。

その時、今作ったGatewayがレガシーになる。

個人的には6ヶ月以内にMCPスペックにpolicy extensionのようなものが追加されると見ている。Linux Foundationに寄付された後、ガバナンス関連の議論が活発なのを見ると、方向性はすでに固まっているようだ。しかしその6ヶ月間ノーコントロールでエージェントを動かすのはリスキーなので、Gatewayはその間を埋める**ブリッジソリューション**だ。

もう一つ——Gatewayを導入するとエージェントのレスポンス速度が遅くなる。プロキシを一段経由するので当然だ。ローカルでテストしたところ、ツール呼び出し1回あたり50〜100msのオーバーヘッドが追加された。ほとんどの場合は体感できないが、LLMが1タスクでツールを20〜30回呼ぶパターンでは全体で1〜2秒追加され、ユーザー体験に影響しうる。

## まだ解決していないこと

SQLiteでログを溜めてポリシーをチューニングするところまでは一人でもできる。しかし`requireApproval`——人間の承認を得るパートはまだちゃんと実装できていない。

次に試すのはTelegramボット連携だ。`requireApproval: true`のツール呼び出しが来たらTelegramで承認リクエストを送り、ユーザーが「OK」を押すまでGatewayがリクエストをホールドする方式。アイデアはシンプルだが、stdio基盤のMCPでこれを非同期処理するには構造を変える必要がある。今はリクエストが来たらすぐレスポンスを返す同期構造なので。

そして根本的に、これは個人開発者のローカル環境でしか意味のないレベルだ。チーム単位で使うにはGateway自体の認証、マルチテナンシー、ポリシー管理UIなどが必要で、そこまで来ると自作ではなくプロダクトを使うのが正解だ。

AIエージェントにツールを渡す時、「何ができるか」と同じくらい「何をさせないか」が重要だ。MCP Gatewayは後者のための最も現実的な出発点であり、SQLite一つ付けるだけで「自分のエージェントが何をしているか」が見え始める。そこからポリシーはデータで決められる。
