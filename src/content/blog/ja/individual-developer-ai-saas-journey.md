---
title: 個人開発者のAI活用SaaS構築記：3日間でプロダクションローンチ
description: >-
  SvelteKit、Supabase、Google Gemini APIで構築したB2B AI
  OCRサービスの実践開発記。技術選定理由、実装プロセス、ビジネス戦略までソロ開発者の生々しい経験談。
pubDate: '2025-11-27'
heroImage: ../../../assets/blog/individual-developer-ai-saas-journey-hero.png
tags:
  - svelte
  - ai
  - saas
  - supabase
relatedPosts:
  - slug: claude-code-parallel-testing
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: llm-page-migration-standardization
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: ai-content-recommendation-system
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: google-analytics-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: metadata-based-recommendation-optimization
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

## 概要

3日間でAIベースのB2B SaaSをプロダクションまでローンチしました。<a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">Agent Effi Flow</a>という名前のこのサービスは、免税処理OCRと経理OCRという2つのAI自動化ツールを提供し、日本のインバウンド観光ビジネスと中小企業の経理チームをターゲットにしています。

この記事は「理論的に可能だ」ではなく<strong>実際に実装した</strong>経験を共有します。技術スタック選定理由、核心実装事項、直面した課題、そして3ヶ月のKPI目標まで正直に記録しました。

## なぜこのSaaSを作ったのか

### 課題定義

日本で働きながら発見したB2B自動化ニーズ:

1. <strong>免税処理業務の手作業依存</strong>: パスポートと免税書類を目視確認し手入力
2. <strong>経理業務の反復作業</strong>: レシートOCR後の手動データ整理
3. <strong>既存ソリューションの限界</strong>: 高価なエンタープライズソリューションか精度の低い汎用OCR

個人開発者としての差別化ポイントは<strong>AIを活用した構造化データ抽出</strong>です。単純なテキストOCRを超えて、Google Gemini APIのStructured Output機能で型安全なJSON応答を受け取り、即座にビジネスロジックに活用可能なデータを提供します。

## 技術スタック選定

### SvelteKitを選んだ理由

Next.jsではなくSvelteKitを選んだ理由:

<strong>1. Svelte 5の革新的なリアクティビティシステム</strong>

```typescript
// Svelte 5 Runes: $stateと$derived
let count = $state(0);
let doubled = $derived(count * 2);

// React hooksより直感的でボイラープレートコード削減
```

<strong>2. バンドルサイズとパフォーマンス</strong>

- Svelteはコンパイル時にフレームワークコードを削除
- クライアントバンドルがReact比40%小さい
- Time to Interactiveが目に見えて速い

<strong>3. 開発者体験</strong>

- 学習曲線が低くコードが読みやすい
- TypeScriptサポート優秀
- Viteベースで HMRが速い

### Supabaseをバックエンドに選んだ理由

FirebaseではなくSupabase:

<strong>1. PostgreSQLの強力さ</strong>

```sql
-- Row Level Securityでマルチテナント実装
CREATE POLICY "Users can only access their own data"
ON credits FOR SELECT
USING (auth.uid() = user_id);
```

<strong>2. 統合された機能</strong>

- Auth: メール/ソーシャルログイン即座に使用
- Database: PostgreSQL with real-time subscriptions
- Storage: ファイルアップロードとCDN
- Edge Functions: Serverless関数 (Denoベース)

<strong>3. オープンソースと価格</strong>

- 完全オープンソース (self-hosting可能)
- 無料ティアが寛容 (50,000 MAU、500MB DB)
- ベンダーロックイン心配なし

### Google Gemini APIをAIモデルに選んだ理由

OpenAI GPTではなくGemini:

<strong>1. コスト効率</strong>

```
Gemini 2.5 Flash:
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

GPT-4 Turbo:
- Input: $10 / 1M tokens
- Output: $30 / 1M tokens

→ 約100倍安い
```

<strong>2. Structured Output対応</strong>

```typescript
const responseSchema = {
  type: Type.OBJECT,
  required: ['store_name', 'items', 'tax', 'total_with_tax'],
  properties: {
    store_name: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit_price: { type: Type.NUMBER }
        }
      }
    },
    tax: { type: Type.NUMBER },
    total_with_tax: { type: Type.NUMBER }
  }
};

// レスポンスがスキーマに準拠するよう強制
const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema
  }
});
```

<strong>3. マルチモーダル性能</strong>

- 画像OCR品質が優秀 (OmniDocBenchベンチマーク1位)
- パスポート、レシートのような複雑なレイアウト処理に強み

### Vercelをデプロイプラットフォームに選んだ理由

<strong>1. SvelteKit最適化</strong>

- SvelteKitを作ったVercelが直接サポート
- 自動SSR/Edge Functionデプロイ
- ビルドキャッシングでデプロイ速度速い

<strong>2. Serverlessアーキテクチャ</strong>

- APIルートが自動でserverless functionとしてデプロイ
- 使用量ベース課金 (トラフィックなければコストほぼなし)
- 全世界Edge Network

## 核心実装

### 1. OCR API with Structured Output

<strong>実際のコード</strong> (`src/routes/api/receipt-ocr/+server.ts`):

```typescript
import { GoogleGenerativeAI, SchemaType as Type } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp'
});

// スキーマ定義で型安全性確保
const responseSchema = {
  type: Type.OBJECT,
  required: ['store_name', 'purchase_date', 'items', 'tax', 'total_with_tax'],
  properties: {
    store_name: {
      type: Type.STRING,
      description: '店舗名'
    },
    purchase_date: {
      type: Type.STRING,
      description: 'YYYY-MM-DD形式の購入日'
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit_price: { type: Type.NUMBER },
          total_price: { type: Type.NUMBER }
        }
      }
    },
    subtotal: { type: Type.NUMBER },
    tax: { type: Type.NUMBER },
    total_with_tax: { type: Type.NUMBER }
  }
};

// 画像をbase64にエンコード
const imageBase64 = await fileToBase64(imageFile);

const result = await model.generateContent({
  contents: [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: imageBase64
          }
        },
        {
          text: `次のレシート画像を分析して構造化JSONで返してください。

          要件:
          1. 店舗名、購入日、品目リスト抽出
          2. 各品目の名前、数量、単価、合計
          3. 消費税と最終合計
          4. 日付はYYYY-MM-DD形式に変換
          `
        }
      ]
    }
  ],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema
  }
});

const parsedData = JSON.parse(result.response.text());
// parsedDataは既にスキーマに準拠する型安全オブジェクト
```

<strong>核心メリット</strong>:

- <strong>型安全性</strong>: スキーマでレスポンス構造強制
- <strong>パースエラー除去</strong>: JSONパース失敗ほぼなし
- <strong>即活用可能</strong>: DB保存やAPIレスポンスに直接使用

### 2. Credit System (クレジットシステム)

<strong>Stripe Checkout統合</strong>:

```typescript
// src/routes/agents/credits/+page.server.ts
import Stripe from 'stripe';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const actions = {
  purchase: async ({ request, locals }) => {
    const data = await request.formData();
    const planId = data.get('plan_id');

    const plans = {
      starter: { price: 2000, credits: 1000 },
      pro: { price: 10000, credits: 5500 },
      business: { price: 40000, credits: 23000 }
    };

    const selectedPlan = plans[planId];

    // Stripe Checkoutセッション生成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${planId.toUpperCase()} プラン - ${selectedPlan.credits} クレジット`
            },
            unit_amount: selectedPlan.price
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${url.origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/credits`,
      metadata: {
        user_id: locals.user.id,
        credits: selectedPlan.credits,
        plan_id: planId
      }
    });

    return { session_url: session.url };
  }
};
```

<strong>Webhookでクレジット付与</strong>:

```typescript
// src/routes/api/webhooks/stripe/+server.ts
export const POST = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  // Stripe webhook検証
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, credits } = session.metadata;

    // Supabaseにクレジット追加
    await supabase
      .from('credits')
      .insert({
        user_id,
        amount: parseInt(credits),
        type: 'purchase',
        description: `Purchased ${credits} credits`
      });
  }

  return new Response(JSON.stringify({ received: true }));
};
```

### 3. API Authentication (API認証)

<strong>APIキー発行と検証</strong>:

```typescript
// APIキー生成
export const actions = {
  createApiKey: async ({ locals }) => {
    const apiKey = `effi_${crypto.randomUUID()}`;

    await supabase
      .from('api_keys')
      .insert({
        user_id: locals.user.id,
        key: apiKey,
        created_at: new Date().toISOString()
      });

    return { apiKey };
  }
};

// APIキー検証 (すべてのAPIリクエストで実行)
async function validateApiKey(request: Request) {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    throw error(401, 'API key required');
  }

  const { data: keyData } = await supabase
    .from('api_keys')
    .select('user_id, is_active')
    .eq('key', apiKey)
    .single();

  if (!keyData || !keyData.is_active) {
    throw error(401, 'Invalid or inactive API key');
  }

  return keyData.user_id;
}

// クレジット控除前残高確認
async function checkAndDeductCredits(userId: string, amount: number) {
  const { data: balance } = await supabase
    .rpc('get_credit_balance', { user_id: userId });

  if (balance < amount) {
    throw error(402, 'Insufficient credits');
  }

  await supabase
    .from('credits')
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'usage',
      description: 'OCR API call'
    });
}
```

### 4. Multi-language Support (多言語対応)

<strong>Paraglideを使ったi18n</strong>:

```typescript
// src/lib/i18n.ts
import { paraglide } from '@inlang/paraglide-sveltekit';

export const i18n = paraglide({
  project: './project.inlang',
  outdir: './src/paraglide',
  defaultLocale: 'ja'
});

// サポート言語: ko, en, ja, zh, es
```

<strong>言語別ルーティング</strong>:

```typescript
// src/routes/[lang]/+layout.server.ts
export const load = async ({ params }) => {
  const lang = params.lang || 'ja';

  return {
    lang,
    translations: await import(`../../locales/${lang}.json`)
  };
};
```

## トークン使用量追跡とコスト最適化

<strong>リアルタイムトークンモニタリング</strong>:

```typescript
const result = await model.generateContent({...});

// Gemini APIはトークン使用量を返す
const usage = result.response.usageMetadata;

await supabase
  .from('api_usage')
  .insert({
    user_id,
    input_tokens: usage.promptTokenCount,
    output_tokens: usage.candidatesTokenCount,
    total_tokens: usage.totalTokenCount,
    estimated_cost: calculateCost(usage)
  });

function calculateCost(usage) {
  const INPUT_COST = 0.075 / 1_000_000; // $0.075 per 1M tokens
  const OUTPUT_COST = 0.30 / 1_000_000; // $0.30 per 1M tokens

  return (
    usage.promptTokenCount * INPUT_COST +
    usage.candidatesTokenCount * OUTPUT_COST
  );
}
```

## ビジネス戦略

### Target Customers (ターゲット顧客)

1. <strong>日本インバウンド観光ビジネス</strong>
   - 免税店、ドラッグストア、百貨店
   - 月1,000件以上の免税処理

2. <strong>中小企業経理チーム</strong>
   - 月500件以上のレシート処理
   - 会計ソフト連携ニーズ

3. <strong>税理士事務所</strong>
   - 顧客企業の経理代行
   - 正確なデータ必要

### SEO/AEO-Driven Acquisition (検索ベース顧客獲得)

<strong>コンテンツマーケティング戦略</strong>:

1. <strong>jangwook.netブログ活用</strong>
   - 技術ブログを通じたブランド信頼度構築
   - OCR、AI自動化関連キーワードターゲティング
   - この記事もその一環

2. <strong>日本語キーワード最適化</strong>
   - "免税 OCR"
   - "経理 自動化"
   - "領収書 AI"

3. <strong>FAQページでAEO対応</strong>
   - "OCR精度は?" → 構造化された回答
   - "API連携方法は?" → 開発者ドキュメント
   - "価格は?" → 透明な価格表

### 3-Month KPI Targets (3ヶ月KPI目標)

<strong>現実的なソロ開発者目標</strong>:

| 指標 | 目標 | 測定方法 |
|-----|-----|---------|
| 月間訪問者 | 500+ | Google Analytics |
| 会員登録 | 30名 | Supabase Authテーブル |
| 有料転換 | 5名 | Stripe Dashboard |
| MRR | ¥30,000 | Stripe購読合計 |
| OCR API呼び出し | 1,000回 | api_usageテーブル |

<strong>Why These Numbers?</strong>

- 500訪問者 → SEOで達成可能な現実的数値
- 6% 転換率 (30/500) → B2B SaaS平均
- 16.7% 有料転換 (5/30) → プレミアムでターゲティング
- ¥6,000 ARPU → 中小企業予算に適合

## 開発スケジュール

### Day 1 (2025-11-24): Foundation

<strong>完了項目</strong>:
- プロジェクト初期化 (SvelteKit + TypeScript)
- Supabase連携 (Auth + Database)
- 最初のサービス実装: Receipt OCR for Tax Refund
- パスポート + 免税書類自動認識
- Structured Outputスキーマ検証

<strong>コード作成量</strong>: 〜800 lines

### Day 2 (2025-11-25): Payment & Second Service

<strong>完了項目</strong>:
- Accounting OCRサービス追加
- Stripe Checkout統合
- クレジットシステム実装
- Webhookで自動チャージ
- 法的ページ作成
  - 特定商取引法
  - プライバシーポリシー
  - 利用規約
- Google Analytics連携

<strong>コード作成量</strong>: 〜1,200 lines

### Day 3 (2025-11-26): Polish & Launch

<strong>完了項目</strong>:
- サービス説明ページ
- APIドキュメント作成
- ランディングページ最適化
- プロダクションデプロイ (Vercel)
- DNS設定

<strong>コード作成量</strong>: 〜600 lines

<strong>合計</strong>: 3日、〜2,600 lines of code

## 学んだこと

### 1. SvelteKit 5のReactivityはゲームチェンジャー

<strong>Before (React hooks)</strong>:

```typescript
const [credits, setCredits] = useState(0);

useEffect(() => {
  const doubled = credits * 2;
  setDoubled(doubled);
}, [credits]);
```

<strong>After (Svelte 5 runes)</strong>:

```typescript
let credits = $state(0);
let doubled = $derived(credits * 2);
// 自動でリアクティビティ処理、useEffect不要
```

<strong>実感したメリット</strong>:
- ボイラープレートコード70%削減
- デバッグが簡単 (明示的依存性不要)
- パフォーマンス向上 (不要な再レンダリングなし)

### 2. Supabase RLSでマルチテナントが簡単に

<strong>Row Level Securityポリシー</strong>:

```sql
-- 各ユーザーは自分のクレジットのみ照会可能
CREATE POLICY "Users can view own credits"
ON credits FOR SELECT
USING (auth.uid() = user_id);

-- クレジット控除はサーバーのみ
CREATE POLICY "Only service role can deduct"
ON credits FOR INSERT
USING (auth.role() = 'service_role');
```

<strong>メリット</strong>:
- アプリケーションコードで権限チェック不要
- SQLレベルでデータ隔離保証
- セキュリティ脆弱性根本遮断

### 3. Gemini APIコスト最適化

<strong>プロンプト最適化</strong>:

```typescript
// Before: 長いプロンプト
const prompt = `
あなたは専門OCRシステムです。
次の画像を分析して...
(500字以上の指示事項)
`;
// → Input tokens: ~150

// After: 簡潔なプロンプト
const prompt = `Extract receipt data as JSON:
- store_name, date, items[], tax, total`;
// → Input tokens: ~25

// コスト削減: 83%
```

<strong>画像サイズ最適化</strong>:

```typescript
// 画像を1024px以内にリサイズ
import sharp from 'sharp';

const optimized = await sharp(imageBuffer)
  .resize(1024, 1024, { fit: 'inside' })
  .png({ quality: 80 })
  .toBuffer();

// トークン使用量: 70%削減
```

### 4. Solo Developer Productivity Tips

<strong>生産性を最大化した方法</strong>:

1. <strong>Supabase CLIでローカル開発</strong>
   ```bash
   supabase start
   # ローカルPostgreSQL + Auth + Storage
   # プロダクションと同じ環境
   ```

2. <strong>Claude Codeでボイラープレート自動生成</strong>
   - CRUD APIスキャフォールディング
   - TypeScript型定義
   - Zodスキーマ検証

3. <strong>Vercel Preview Deployments</strong>
   - PRごとに自動デプロイURL
   - クライアントに即座にデモ可能

## 次のステップ

### 即時実行 (1週間以内)

1. <strong>日本語キーワードSEO最適化</strong>
   - Meta description日本語で作成
   - Open Graph画像最適化
   - Schema.orgマークアップ追加

2. <strong>FAQページ作成</strong>
   - "OCR精度は?" → 実際のデータで回答
   - "どんなレシート形式対応?" → サンプル画像
   - "API制限は?" → Rate limit明示

3. <strong>Google Search Console提出</strong>
   - サイトマップ登録
   - インデックスリクエスト

### 短期目標 (1ヶ月以内)

1. <strong>新サービス追加</strong>
   - ビジネス文書処理の拡大

2. <strong>最初のB2B顧客獲得</strong>
   - 免税店1箇所契約目標
   - クレジットベース課金モデル

3. <strong>APIドキュメント高度化</strong>
   - OpenAPIスペック作成
   - Postman Collection提供
   - SDKサンプルコード (Python、Node.js)

### 中期目標 (3ヶ月以内)

1. <strong>MRR ¥30,000達成</strong>
   - 5名有料顧客
   - 月500回API呼び出し

2. <strong>使用事例共有</strong>
   - 顧客成功事例ブログポスト
   - 実際の活用事例ドキュメント化

3. <strong>プレミアム機能追加</strong>
   - Batch processing (一括処理)
   - Custom schema support
   - Webhook integration

## 参考資料

### Official Documentation

- [SvelteKit Documentation](https://kit.svelte.dev/docs) - SvelteKit公式ドキュメント
- [Supabase Guides](https://supabase.com/docs) - Supabaseガイド
- [Google Gemini API Docs](https://ai.google.dev/docs) - Gemini APIドキュメント
- [Stripe Integration Guide](https://stripe.com/docs/checkout) - Stripe Checkoutガイド

### Key Articles Referenced

- [Gemini 3 for developers](https://blog.google/technology/developers/gemini-3-developers/) - Gemini 3価格とパフォーマンス
- [Solo Developer SaaS Success Stories](https://dev.to/dev_tips/the-solo-dev-saas-stack-powering-10kmonth-micro-saas-tools-in-2025-pl7) - ソロ開発者成功事例
- [B2B SaaS Go-to-Market Strategies](https://martal.ca/b2b-saas-marketing-strategies-lb/) - B2B SaaSマーケティング戦略
- [Stripe Credits for Usage-Based Billing](https://stripe.com/blog/introducing-credits-for-usage-based-billing) - Stripeクレジットシステム

## 結びの言葉

3日間でプロダクションSaaSをローンチすることは<strong>可能です</strong>。しかし「速く作る」が目標ではなく<strong>「速く検証する」</strong>が目標であるべきです。

核心は次の3つでした:

1. <strong>適切なツール選択</strong>: SvelteKit + Supabase + Gemini API
2. <strong>スコープ制限</strong>: 2サービスでスタート、完璧さよりローンチ優先
3. <strong>ビジネス優先</strong>: 技術より顧客課題解決に集中

今、本当の旅が始まります。最初の有料顧客を獲得し、フィードバックを受け、改善するプロセス。3ヶ月後この記事を更新する時「MRR ¥30,000達成」と書けることを願います。

ソロ開発者の皆さん、一緒に作りましょう。
