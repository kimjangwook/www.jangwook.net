---
title: Anthropic Code Execution with MCP：AIエージェントの効率を98.7%向上させる革新技術
description: >-
  Model Context
  Protocolを活用したコード実行により、トークン使用量を150,000から2,000に削減。開発者向けに技術詳細と実装方法を解説します。
pubDate: '2025-11-18'
heroImage: ../../../assets/blog/anthropic-code-execution-mcp-hero.jpg
tags:
  - mcp
  - anthropic
  - ai-agent
  - automation
relatedPosts:
  - slug: openai-agentkit-tutorial-part2
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: langgraph-multi-agent
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: google-analytics-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: specification-driven-development
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: bigquery-mcp-prefix-filtering
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

## 概要

2025年11月、AnthropicはAIエージェントの効率性を劇的に向上させる革新的なアプローチ「Code Execution with MCP（Model Context Protocol）」を発表しました。この技術は、従来のツール呼び出し方式の根本的な問題を解決し、<strong>トークン使用量を98.7%削減</strong>（150,000トークンから2,000トークンへ）することに成功しました。

従来のAIエージェントは、複数のツールを使用する際に膨大なコンテキストデータをやり取りする必要がありました。しかし、Code Execution with MCPは、AIモデルがツールを直接呼び出す代わりに<strong>ツールを呼び出すコードを生成し、サンドボックス環境で実行する</strong>という新しいパラダイムを提示します。

本記事では、この革新的な技術の仕組み、アーキテクチャ、実装方法、そしてセキュリティ上の考慮事項について、開発者向けに詳しく解説します。

## Model Context Protocol (MCP)とは

Model Context Protocol（MCP）は、2024年11月にAnthropicが発表した、AIシステムとデータソースを統合するための標準化されたインターフェースです。MCPの主な目的は以下の通りです：

- <strong>統一されたインターフェース</strong>：異なるツールやデータソースに対して一貫した接続方法を提供
- <strong>相互運用性</strong>：さまざまなAIアプリケーション間でツールを共有可能
- <strong>拡張性</strong>：新しいツールやデータソースを簡単に追加可能

MCPは、AIエージェントが外部システムと対話するための「共通言語」を確立することで、開発者が一度ツールを作成すれば、複数のAIアプリケーションで再利用できる環境を実現します。

発表から1年で、すでに<strong>10,000以上のMCPサーバー</strong>が作成され、Zed、Replit、Codeium、Sourcegraphなどの主要開発ツールに統合されています。

## 従来の手法の限界

従来のAIエージェントは、ツールを使用する際に「直接ツール呼び出し」方式を採用していました。この方式には、以下のような深刻な問題がありました：

### トークン消費の爆発的増加

AIモデルがツールを呼び出すたびに、すべての中間結果をコンテキストウィンドウに保持する必要がありました。例えば：

1. データベースから100件の顧客レコードを取得（50,000トークン）
2. 各レコードをフィルタリング（30,000トークン）
3. 統計情報を計算（20,000トークン）
4. レポートを生成（50,000トークン）

合計150,000トークンのコンテキストが必要となり、コストとレイテンシが大幅に増加します。

### 逐次的な実行による遅延

各ツール呼び出しがAPIラウンドトリップを必要とするため、15回のツール呼び出しで15回のネットワーク往復が発生します。これにより、実行時間が大幅に増加しました。

### コンテキストウィンドウの浪費

中間結果の多くは最終的な回答には不要ですが、モデルがすべてのデータを「見る」必要があるため、コンテキストウィンドウが無駄に消費されていました。

## Code Execution with MCPの核心アイデア

Code Execution with MCPは、この問題を根本的に解決する革新的なアプローチです。その核心的なアイデアは以下の通りです：

### パラダイムシフト

<strong>従来の方式</strong>：
```
AIモデル → ツール1を呼び出し → 結果をコンテキストに追加
         → ツール2を呼び出し → 結果をコンテキストに追加
         → ツール3を呼び出し → 結果をコンテキストに追加
         ...（繰り返し）
```

<strong>新しい方式</strong>：
```
AIモデル → ツールを呼び出すコードを生成
         → サンドボックス環境でコードを実行
         → 要約された結果のみを返す
```

### 具体的な動作フロー

1. <strong>ツール検索</strong>：AIモデルが利用可能なツールを確認
2. <strong>コード生成</strong>：必要なツールを呼び出すTypeScriptコードを生成
3. <strong>サンドボックス実行</strong>：生成されたコードを安全な環境で実行
4. <strong>結果の要約</strong>：実行結果を要約して、必要な情報のみをモデルに返す

このアプローチにより、中間結果はサンドボックス内に保持され、モデルのコンテキストウィンドウを消費しません。

## 技術アーキテクチャ

Code Execution with MCPの技術アーキテクチャは、以下の3つの主要コンポーネントで構成されています。

### ファイルシステムベースのツール検索

従来のMCPでは、ツールの仕様をすべてコンテキストウィンドウに読み込む必要がありました。Code Execution with MCPは、<strong>ファイルシステムベースの段階的検索</strong>を導入しました：

```typescript
// ツールディレクトリの構造
/mcp-server/
  /tools/
    /database/
      query.ts          // データベースクエリツール
      update.ts         // データベース更新ツール
    /file-system/
      read.ts           // ファイル読み込みツール
      write.ts          // ファイル書き込みツール
    /api/
      http-request.ts   // HTTP リクエストツール
```

AIモデルは、必要なときにディレクトリを探索し、関連するツールのみを読み込みます。例えば、データベース操作が必要な場合は `/tools/database/` ディレクトリのみを確認します。

### ツールラッパーの生成

各ツールは、TypeScriptの関数として公開されます。MCPサーバーは、ツールの仕様から自動的にラッパーコードを生成します：

```typescript
// 元のツール定義（MCPサーバー側）
{
  name: "database_query",
  description: "データベースにSQLクエリを実行",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "実行するSQLクエリ" },
      params: { type: "array", description: "クエリパラメータ" }
    },
    required: ["query"]
  }
}

// 自動生成されるラッパー関数
async function database_query(args: {
  query: string;
  params?: any[];
}): Promise<QueryResult> {
  // MCPサーバーへのリクエストを送信
  const response = await mcpClient.callTool("database_query", args);
  return response.result;
}
```

AIモデルは、この生成されたラッパー関数を呼び出すコードを書くだけで、ツールを使用できます。

### サンドボックス実行環境

生成されたコードは、<strong>隔離されたサンドボックス環境</strong>で実行されます。Anthropicは、オープンソースの[Sandbox Runtime](https://github.com/anthropic-experimental/sandbox-runtime)を提供しています：

```typescript
// サンドボックスの設定例
const sandbox = new SandboxRuntime({
  // Linux環境ではbubblewrap、macOS環境ではseatbeltを使用
  isolationMethod: "auto",

  // リソース制限
  limits: {
    cpuTime: 30000,        // 最大CPU時間（ミリ秒）
    memory: 512 * 1024,    // 最大メモリ（KB）
    processes: 10,         // 最大プロセス数
  },

  // ネットワークアクセスの制限
  network: {
    allowOutbound: false,  // 外部ネットワークアクセスを禁止
    allowedHosts: []       // 許可されたホストのリスト
  },

  // ファイルシステムアクセスの制限
  filesystem: {
    readonly: ["/usr", "/lib"],  // 読み取り専用パス
    readwrite: ["/tmp"]          // 読み書き可能パス
  }
});

// コードの実行
const result = await sandbox.execute(generatedCode, {
  timeout: 30000  // タイムアウト（ミリ秒）
});
```

このサンドボックスは以下のセキュリティ機能を提供します：

- <strong>プロセス隔離</strong>：ホストシステムから完全に分離
- <strong>リソース制限</strong>：CPU、メモリ、プロセス数の制限
- <strong>ネットワーク制限</strong>：外部通信の制御
- <strong>ファイルシステム制限</strong>：アクセス可能なパスの制御

## 劇的なパフォーマンス向上

Code Execution with MCPは、従来の手法と比較して劇的なパフォーマンス向上を実現しました。

### トークン使用量98.7%削減

Anthropicの公式ベンチマークによると、典型的な複数ツール呼び出しタスクにおいて：

- <strong>従来の方式</strong>：150,000トークン
- <strong>Code Execution with MCP</strong>：2,000トークン
- <strong>削減率</strong>：98.7%

これは、以下の要因によって実現されました：

1. <strong>中間結果の除外</strong>：サンドボックス内に保持され、コンテキストに含まれない
2. <strong>段階的ツールロード</strong>：必要なツールの仕様のみを読み込む
3. <strong>結果の要約</strong>：実行結果を要約して、必要な情報のみを返す

### コスト削減の具体例

Claude 3.5 Sonnetの料金（入力トークン：$3/百万トークン）で計算すると：

- <strong>従来の方式</strong>：150,000トークン × $3/百万 = $0.45/リクエスト
- <strong>新しい方式</strong>：2,000トークン × $3/百万 = $0.006/リクエスト
- <strong>コスト削減</strong>：98.7%（$0.444の節約）

1日1,000リクエストの場合、年間約$162,000の節約になります。

### 実行速度60%改善

従来の方式では、15回のツール呼び出しで15回のAPIラウンドトリップが必要でした（各300ms〜500ms）。合計4.5秒〜7.5秒かかります。

Code Execution with MCPでは、すべてのツール呼び出しがサンドボックス内で完結するため、1回のAPIラウンドトリップのみが必要です。実行時間は約1.8秒〜3秒に短縮されます。

## 主要機能とメリット

Code Execution with MCPは、以下の主要機能とメリットを提供します。

### 段階的ツールロード（Progressive Disclosure）

従来のMCPでは、すべてのツールの仕様を事前に読み込む必要がありました。Code Execution with MCPは、<strong>必要なツールのみを段階的に読み込む</strong>ことができます：

```typescript
// AIモデルの思考プロセス
// 1. まず、利用可能なツールカテゴリを確認
const categories = await listToolCategories();
// 結果: ["database", "file-system", "api", "email"]

// 2. 必要なカテゴリ（例：database）のツールのみを読み込む
const databaseTools = await listTools("database");
// 結果: ["query", "update", "delete"]

// 3. 必要なツール（例：query）の詳細仕様のみを読み込む
const querySpec = await getToolSpec("database", "query");

// 4. ツールを使用するコードを生成
const code = `
const results = await database_query({
  query: "SELECT * FROM customers WHERE country = ?",
  params: ["Japan"]
});
`;
```

この段階的アプローチにより、コンテキストウィンドウを効率的に使用できます。

### ローカル制御フロー

従来の方式では、条件分岐やループなどの制御フローを実装するために、複数回のモデル呼び出しが必要でした。Code Execution with MCPでは、<strong>制御フローをコード内で直接実装</strong>できます：

```typescript
// 従来の方式（複数回のモデル呼び出しが必要）
// 1回目：顧客リストを取得
const customers = await getCustomers();

// 2回目：各顧客について判断
for (const customer of customers) {
  // モデルを呼び出して、メール送信の判断を依頼
  const shouldSend = await askModel(`Should I send email to ${customer.email}?`);
  if (shouldSend) {
    await sendEmail(customer.email, message);
  }
}

// Code Execution with MCP（1回のコード生成で完結）
const code = `
const customers = await getCustomers();

for (const customer of customers) {
  // ローカルで条件判断を実行
  if (customer.lastPurchase > thirtyDaysAgo && customer.emailOptIn) {
    await sendEmail(customer.email, promotionMessage);
  }
}

return { sent: customers.filter(c => c.lastPurchase > thirtyDaysAgo).length };
`;
```

これにより、APIラウンドトリップの回数が大幅に削減されます。

### プライバシー保護

中間結果はサンドボックス内に保持され、モデルのコンテキストに含まれないため、<strong>機密情報の露出を最小限</strong>に抑えられます：

```typescript
// 例：機密性の高い顧客データの処理
const code = `
// 1. データベースから顧客データを取得（機密情報を含む）
const customers = await database_query({
  query: "SELECT name, email, ssn, credit_card FROM customers"
});
// この結果はサンドボックス内にのみ存在し、モデルには送信されない

// 2. ローカルで集計処理を実行
const summary = {
  totalCustomers: customers.length,
  emailDomains: [...new Set(customers.map(c => c.email.split('@')[1]))],
  // 機密情報（SSN、クレジットカード番号）は除外
};

// 3. 要約のみを返す
return summary;
`;

// モデルが受け取る結果
// { totalCustomers: 1523, emailDomains: ["gmail.com", "yahoo.co.jp", ...] }
// 機密情報は含まれない
```

### 状態の保持

サンドボックス内で状態を保持できるため、<strong>複雑なワークフローを効率的に実行</strong>できます：

```typescript
const code = `
// 1. データベース接続を確立（状態として保持）
const db = await createDatabaseConnection({
  host: "localhost",
  database: "sales"
});

// 2. トランザクションを開始
await db.beginTransaction();

try {
  // 3. 複数の操作を実行（すべて同じ接続を使用）
  await db.query("UPDATE inventory SET quantity = quantity - 1 WHERE product_id = ?", [123]);
  await db.query("INSERT INTO orders (customer_id, product_id) VALUES (?, ?)", [456, 123]);
  await db.query("UPDATE customers SET points = points + 100 WHERE id = ?", [456]);

  // 4. トランザクションをコミット
  await db.commit();

  return { success: true };
} catch (error) {
  // 5. エラー時はロールバック
  await db.rollback();
  return { success: false, error: error.message };
} finally {
  // 6. 接続を閉じる
  await db.close();
}
`;
```

従来の方式では、各ステップで接続を再確立する必要がありましたが、Code Execution with MCPでは接続を保持できます。

## 実践的な活用事例

Code Execution with MCPは、さまざまな領域で実用化されています。

### 開発ツール統合

<strong>Zed Editor</strong>では、Code Execution with MCPを使用して、以下の機能を実装しています：

```typescript
// ファイル検索と一括編集のワークフロー
const code = `
// 1. プロジェクト内のすべてのTypeScriptファイルを検索
const files = await filesystem_search({
  pattern: "**/*.ts",
  exclude: ["node_modules", "dist"]
});

// 2. 各ファイルで古いAPIの使用を検出
const filesToUpdate = [];
for (const file of files) {
  const content = await filesystem_read({ path: file.path });
  if (content.includes("oldAPI.method()")) {
    filesToUpdate.push(file);
  }
}

// 3. 検出されたファイルを一括更新
for (const file of filesToUpdate) {
  const content = await filesystem_read({ path: file.path });
  const updated = content.replaceAll("oldAPI.method()", "newAPI.method()");
  await filesystem_write({ path: file.path, content: updated });
}

return {
  filesScanned: files.length,
  filesUpdated: filesToUpdate.length
};
`;
```

これにより、開発者は複雑なリファクタリング作業を自然言語で指示できます。

### エンタープライズデータ処理

<strong>Block社</strong>（旧Square）では、Code Execution with MCPを使用して、複数のデータソースを統合した分析を実現しています：

```typescript
const code = `
// 1. Salesforceから顧客データを取得
const customers = await salesforce_query({
  query: "SELECT Id, Name, Industry FROM Account WHERE CreatedDate = LAST_MONTH"
});

// 2. 各顧客の取引履歴をStripeから取得
const enrichedCustomers = [];
for (const customer of customers) {
  const transactions = await stripe_list_charges({
    customer: customer.stripeId,
    limit: 100
  });

  enrichedCustomers.push({
    name: customer.Name,
    industry: customer.Industry,
    totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length
  });
}

// 3. 業界別の集計を計算
const byIndustry = {};
for (const customer of enrichedCustomers) {
  if (!byIndustry[customer.industry]) {
    byIndustry[customer.industry] = { revenue: 0, customers: 0 };
  }
  byIndustry[customer.industry].revenue += customer.totalRevenue;
  byIndustry[customer.industry].customers += 1;
}

return {
  totalCustomers: customers.length,
  byIndustry
};
`;
```

従来の方式では、このワークフローに数百回のAPI呼び出しが必要でしたが、Code Execution with MCPでは1回で完結します。

### ドキュメントおよびデータベース操作

<strong>Google Drive → Salesforce</strong> の自動同期ワークフロー：

```typescript
const code = `
// 1. Google Driveから特定フォルダ内のスプレッドシートを取得
const files = await google_drive_list({
  folder: "Monthly Reports",
  type: "spreadsheet"
});

// 2. 各スプレッドシートの内容を読み込み
for (const file of files) {
  const data = await google_sheets_read({
    fileId: file.id,
    range: "A1:Z1000"
  });

  // 3. データをパースして検証
  const leads = data.slice(1).map(row => ({
    name: row[0],
    email: row[1],
    company: row[2],
    phone: row[3]
  })).filter(lead => lead.email && lead.email.includes("@"));

  // 4. Salesforceに新規リードとして登録
  for (const lead of leads) {
    await salesforce_create({
      type: "Lead",
      fields: lead
    });
  }
}

return { filesProcessed: files.length };
`;
```

### リアルタイムデータ処理

<strong>Apollo GraphQL</strong>では、Code Execution with MCPを使用して、リアルタイムのAPI監視とアラートを実装しています：

```typescript
const code = `
// 1. 過去1時間のAPIメトリクスを取得
const metrics = await apollo_get_metrics({
  timeRange: "1h",
  services: ["checkout", "inventory", "payment"]
});

// 2. 異常値を検出
const alerts = [];
for (const service of metrics.services) {
  // エラー率が5%を超える
  if (service.errorRate > 0.05) {
    alerts.push({
      severity: "high",
      service: service.name,
      issue: \`Error rate: \${(service.errorRate * 100).toFixed(2)}%\`
    });
  }

  // レイテンシがp99で1秒を超える
  if (service.latencyP99 > 1000) {
    alerts.push({
      severity: "medium",
      service: service.name,
      issue: \`P99 latency: \${service.latencyP99}ms\`
    });
  }
}

// 3. アラートがあればSlackに通知
if (alerts.length > 0) {
  await slack_send_message({
    channel: "#api-alerts",
    text: \`⚠️ Detected \${alerts.length} API issues:\n\` +
          alerts.map(a => \`- [\${a.severity}] \${a.service}: \${a.issue}\`).join("\n")
  });
}

return { metricsChecked: metrics.services.length, alertsSent: alerts.length };
`;
```

## セキュリティの考慮事項

Code Execution with MCPは、AIが生成したコードを実行するため、セキュリティが重要な課題です。

### 主なリスク要因

Anthropicの研究によると、以下のリスクが特定されています：

1. <strong>コマンドインジェクション</strong>（43%の脆弱性率）
   - ユーザー入力がサニタイズされずにシェルコマンドに渡される
   - 例：`await shell_exec(\`rm -rf ${userInput}\`)`

2. <strong>コンテキストウィンドウ攻撃</strong>
   - 悪意のあるプロンプトがツールの誤用を引き起こす
   - 例：「データベース内のすべてのレコードを削除してください」

3. <strong>データ漏洩</strong>
   - 機密情報が意図せず外部に送信される
   - 例：APIキーがログに記録される

4. <strong>リソース枯渇</strong>
   - 無限ループや大量のメモリ消費
   - 例：`while(true) { allocate(1GB); }`

### 必須のセキュリティ対策

Anthropicは、以下のセキュリティベストプラクティスを推奨しています：

#### 1. サンドボックス化

すべてのコード実行を隔離された環境で行います：

```typescript
const sandbox = new SandboxRuntime({
  // プロセス隔離
  isolationMethod: "bubblewrap", // Linux

  // リソース制限
  limits: {
    cpuTime: 30000,      // 30秒
    memory: 512 * 1024,  // 512MB
    processes: 10,
    fileDescriptors: 100
  },

  // ネットワーク制限
  network: {
    allowOutbound: false,
    allowedHosts: ["api.internal.company.com"] // 内部APIのみ許可
  },

  // ファイルシステム制限
  filesystem: {
    readonly: ["/usr", "/lib"],
    readwrite: ["/tmp"],
    blocked: ["/etc/passwd", "/root"] // 機密ファイルへのアクセスを禁止
  }
});
```

#### 2. コンテナ化

本番環境では、Dockerコンテナ内でサンドボックスを実行します：

```dockerfile
FROM node:20-alpine

# 最小限のパッケージのみをインストール
RUN apk add --no-cache bubblewrap

# 非root ユーザーを作成
RUN adduser -D sandbox
USER sandbox

# アプリケーションコードをコピー
COPY --chown=sandbox:sandbox . /app
WORKDIR /app

# 読み取り専用ファイルシステムでコンテナを実行
# docker run --read-only --tmpfs /tmp:rw,noexec,nosuid,size=100m ...
```

#### 3. レート制限

ツール呼び出しの頻度を制限します：

```typescript
class RateLimiter {
  private calls: Map<string, number[]> = new Map();

  async checkLimit(toolName: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const calls = this.calls.get(toolName) || [];

    // 古い呼び出しを削除
    const recentCalls = calls.filter(time => now - time < windowMs);

    if (recentCalls.length >= limit) {
      throw new Error(`Rate limit exceeded for ${toolName}: ${limit} calls per ${windowMs}ms`);
    }

    recentCalls.push(now);
    this.calls.set(toolName, recentCalls);
    return true;
  }
}

// 使用例
const rateLimiter = new RateLimiter();

async function database_query(args: any) {
  // 1分間に最大10回のクエリ
  await rateLimiter.checkLimit("database_query", 10, 60000);

  return await actualDatabaseQuery(args);
}
```

#### 4. 入力の検証とサニタイズ

すべてのユーザー入力を検証します：

```typescript
function sanitizeShellInput(input: string): string {
  // 危険な文字を除去
  return input.replace(/[;&|`$()]/g, "");
}

async function shell_exec(command: string): Promise<string> {
  // ホワイトリスト方式のコマンド検証
  const allowedCommands = ["ls", "cat", "grep", "find"];
  const cmd = command.split(" ")[0];

  if (!allowedCommands.includes(cmd)) {
    throw new Error(`Command not allowed: ${cmd}`);
  }

  // 引数をサニタイズ
  const args = command.split(" ").slice(1).map(sanitizeShellInput);

  return await execCommand(cmd, args);
}
```

#### 5. 集中型ガバナンス

エンタープライズ環境では、中央管理されたMCPゲートウェイを使用します：

```typescript
class MCPGateway {
  async executeTool(toolName: string, args: any, user: User): Promise<any> {
    // 1. ユーザー認証
    if (!await this.authenticate(user)) {
      throw new Error("Authentication failed");
    }

    // 2. 権限チェック
    if (!await this.authorize(user, toolName)) {
      throw new Error(`User ${user.id} not authorized to use ${toolName}`);
    }

    // 3. 監査ログ記録
    await this.auditLog({
      timestamp: new Date(),
      user: user.id,
      tool: toolName,
      args: args
    });

    // 4. レート制限
    await this.rateLimiter.checkLimit(user.id, toolName);

    // 5. ツール実行
    const result = await this.executeInSandbox(toolName, args);

    // 6. 結果のフィルタリング（機密情報の除去）
    return this.filterSensitiveData(result);
  }
}
```

## 実装ガイド

実際にCode Execution with MCPを実装する手順を説明します。

### MCPサーバーの設定

まず、基本的なMCPサーバーを作成します：

```typescript
import { MCPServer } from "@anthropic-ai/mcp-sdk";

// MCPサーバーのインスタンスを作成
const server = new MCPServer({
  name: "my-tools-server",
  version: "1.0.0",

  // ツールディレクトリのパス
  toolsDirectory: "./tools",

  // Code Executionを有効化
  codeExecution: {
    enabled: true,
    sandbox: {
      runtime: "bubblewrap", // または "docker"
      limits: {
        cpuTime: 30000,
        memory: 512 * 1024
      }
    }
  }
});

// サーバーを起動
await server.start();
console.log("MCP Server started on stdio");
```

### ツールラッパーの作成

次に、個別のツールを作成します：

```typescript
// tools/database/query.ts
import { Tool } from "@anthropic-ai/mcp-sdk";

export const databaseQueryTool: Tool = {
  name: "database_query",
  description: "データベースにSQLクエリを実行し、結果を返します",

  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "実行するSQLクエリ（SELECT文のみ許可）"
      },
      params: {
        type: "array",
        description: "クエリパラメータ（プレースホルダーの値）",
        items: { type: "string" }
      }
    },
    required: ["query"]
  },

  async execute(args: { query: string; params?: string[] }) {
    // クエリの検証（SELECTのみ許可）
    if (!args.query.trim().toUpperCase().startsWith("SELECT")) {
      throw new Error("Only SELECT queries are allowed");
    }

    // データベース接続（実際の実装では接続プールを使用）
    const db = await connectToDatabase();

    try {
      const results = await db.query(args.query, args.params || []);
      return {
        rows: results.rows,
        rowCount: results.rowCount
      };
    } finally {
      await db.close();
    }
  }
};
```

### サンドボックスの有効化

クライアント側でサンドボックス実行を設定します：

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,

  // Code Executionを有効化
  tools: [{
    type: "code_execution",
    mcp_server: {
      // MCPサーバーの接続情報
      transport: "stdio",
      command: "node",
      args: ["./mcp-server.js"]
    },

    // サンドボックス設定
    sandbox: {
      enabled: true,
      limits: {
        cpuTime: 30000,
        memory: 512 * 1024
      }
    }
  }],

  messages: [{
    role: "user",
    content: "データベースから日本の顧客を検索して、メールアドレスのドメイン別に集計してください"
  }]
});

console.log(response.content);
```

## 現在の制限事項

Code Execution with MCPは革新的な技術ですが、以下の制限事項があります：

### 1. インフラストラクチャの複雑性

サンドボックス環境の構築と管理には、追加のインフラストラクチャが必要です：

- Linux環境ではbubblewrap、macOS環境ではseatbeltの設定
- Dockerコンテナの管理（本番環境）
- リソース監視とスケーリング

### 2. 単純なタスクでのオーバーヘッド

単一のツール呼び出しのみが必要な場合、従来の方式の方が効率的です：

```typescript
// 単純なタスク：1つのツール呼び出しのみ
// 従来の方式：1回のAPI呼び出し（500ms）
const result = await callTool("get_weather", { city: "Tokyo" });

// Code Execution：コード生成 + サンドボックス起動 + 実行（800ms）
const code = `const result = await get_weather({ city: "Tokyo" }); return result;`;
const result = await executeSandbox(code);
```

<strong>推奨</strong>：3回以上のツール呼び出しが必要な場合にCode Executionを使用します。

### 3. セキュリティ脆弱性のリスク

AIが生成したコードを実行するため、慎重なセキュリティ対策が必要です：

- コマンドインジェクション攻撃
- リソース枯渇攻撃
- データ漏洩のリスク

### 4. リモートサーバーの制限

現在のバージョンでは、MCPサーバーは同一マシン上で実行する必要があります。リモートMCPサーバーのサポートは2025年第2四半期に予定されています。

## 今後の展望

Anthropicは、Code Execution with MCPの今後のロードマップを発表しています。

### 2025年ロードマップ

<strong>2025年第1四半期</strong>：
- リモートMCPサーバーのサポート（HTTPSトランスポート）
- OAuth 2.1による認証・認可
- エンタープライズ向けガバナンス機能（監査ログ、アクセス制御）

<strong>2025年第2四半期</strong>：
- 複数言語のサンドボックスサポート（Python、Java、Go）
- 分散実行（複数のサンドボックスでの並列実行）
- パフォーマンス最適化（起動時間の短縮）

<strong>2025年第3〜4四半期</strong>：
- Kubernetesネイティブ統合
- エッジ環境での実行サポート
- WebAssemblyサンドボックス

### SDK拡張

現在、TypeScript/JavaScript SDKのみがサポートされていますが、以下の言語のSDKが開発中です：

- Python SDK（2025年第1四半期）
- Java SDK（2025年第2四半期）
- Go SDK（2025年第2四半期）
- Rust SDK（2025年第3四半期）

### 業界の採用状況

2025年11月時点で、以下の統計が報告されています：

- <strong>10,000以上のMCPサーバー</strong>が作成されている
- <strong>主要なパートナーシップ</strong>：Zed、Replit、Codeium、Sourcegraph、Block、Apollo、Cognizant
- <strong>市場の成長予測</strong>：2026年までに50,000サーバー、2027年までに200,000サーバー

エンタープライズ採用も加速しており、金融、ヘルスケア、小売業界での導入事例が増加しています。

## まとめ

Code Execution with MCPは、AIエージェントの効率性を根本的に変革する革新的な技術です。主なポイントをまとめます：

### パラダイムシフト

- <strong>従来の方式</strong>：モデルが直接ツールを呼び出す
- <strong>新しい方式</strong>：モデルがツールを呼び出すコードを生成し、サンドボックスで実行

### 劇的な効率向上

- <strong>トークン削減</strong>：98.7%（150,000 → 2,000トークン）
- <strong>コスト削減</strong>：年間数十万ドルの節約が可能
- <strong>速度向上</strong>：実行時間が60%短縮

### セキュリティのベストプラクティス

- サンドボックス化による隔離
- コンテナ化による追加の保護層
- レート制限と入力検証
- 集中型ガバナンス

### 使用タイミング

<strong>Code Executionが適している場合</strong>：
- 3回以上のツール呼び出しが必要
- 複雑な制御フロー（ループ、条件分岐）が必要
- 中間結果が大量（数千行のデータなど）
- プライバシー保護が重要

<strong>従来の方式が適している場合</strong>：
- 単一のツール呼び出しのみ
- リアルタイムの対話が必要
- サンドボックスのセットアップが困難

### 今後の発展

Code Execution with MCPは、AIエージェントの未来を形作る重要な技術です。リモートサーバーサポート、複数言語対応、エンタープライズ機能の追加により、さらに多くのユースケースで採用されることが期待されます。

開発者の皆様には、この技術を積極的に試し、フィードバックをコミュニティと共有することをお勧めします。AIエージェントの新しい時代が始まっています。

## 参考資料

- [Anthropic公式発表：Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [MCP公式ドキュメント](https://modelcontextprotocol.io)
- [Sandbox Runtime GitHub](https://github.com/anthropic-experimental/sandbox-runtime)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/sdk-typescript)
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering)
- [Claude API Documentation](https://docs.anthropic.com)
