# プロジェクト構造調査レポート

**調査日**: 2025-11-26
**対象**: Agent Effi Flow (https://agent-effi-flow.jangwook.net/)

---

## 1. ページ一覧

### パブリックページ（認証不要）

| URL | ファイルパス | 目的 |
|-----|-----------|------|
| `/` | `/src/routes/+page.svelte` | ホームページ・サービス紹介 |
| `/login` | `/src/routes/login/+page.svelte` | ログイン/新規登録 |
| `/pricing` | `/src/routes/pricing/+page.svelte` | 料金プラン |
| `/services/receipt_ocr_for_tax_refund` | `/src/routes/services/receipt_ocr_for_tax_refund/+page.svelte` | 免税処理OCR紹介 |
| `/services/accounting_ocr` | `/src/routes/services/accounting_ocr/+page.svelte` | 経理OCR紹介 |
| `/legal/terms` | `/src/routes/legal/terms/+page.svelte` | 利用規約 |
| `/legal/privacy` | `/src/routes/legal/privacy/+page.svelte` | プライバシーポリシー |
| `/legal/tokushoho` | `/src/routes/legal/tokushoho/+page.svelte` | 特商法表示 |

### プロテクテッドページ（認証必要）

| URL | ファイルパス | 目的 |
|-----|-----------|------|
| `/agents` | `/src/routes/agents/+page.svelte` | ダッシュボード |
| `/agents/receipt-ocr` | `/src/routes/agents/receipt-ocr/+page.svelte` | レシートOCRツール |
| `/agents/accounting-ocr` | `/src/routes/agents/accounting-ocr/+page.svelte` | 経理OCRツール |
| `/agents/api_keys` | `/src/routes/agents/api_keys/+page.svelte` | APIキー管理 |
| `/agents/credits` | `/src/routes/agents/credits/+page.svelte` | クレジット管理 |

---

## 2. API エンドポイント

| パス | メソッド | 目的 | 消費クレジット |
|------|---------|------|----------|
| `/api/receipt-ocr` | `POST` | 免税処理OCR | 1クレジット |
| `/api/accounting-ocr` | `POST` | 経理OCR | 2クレジット |
| `/api/stripe/webhook` | `POST` | Stripe Webhook | - |

---

## 3. 多言語対応

### 対応言語
- 日本語 (`ja`) ← デフォルト
- 韓国語 (`ko`)
- 英語 (`en`)
- 中国語 (`zh`)
- スペイン語 (`es`)

### 実装方式
- **フレームワーク**: Paraglide (自動言語ルーティング)
- **メッセージファイル**: `src/lib/paraglide/messages/`

---

## 4. SEO 最適化対象ページ（優先順位順）

### 高優先度（集客重要ページ）
1. `/` - ホームページ
2. `/services/receipt_ocr_for_tax_refund` - 免税処理OCR
3. `/services/accounting_ocr` - 経理OCR
4. `/pricing` - 料金プラン

### 中優先度
5. `/login` - ログイン（CVR影響）
6. `/legal/terms` - 利用規約
7. `/legal/privacy` - プライバシーポリシー
8. `/legal/tokushoho` - 特商法表示

### 今後追加予定
- `/faq` - よくある質問（AEO対応）
- `/use-cases` - 使用事例
- `/blog/*` - ブログ記事

---

## 5. 技術スタック

- **Frontend**: SvelteKit + Svelte 5 + Tailwind CSS
- **Backend**: SvelteKit API Routes (Vercel Serverless)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google GenAI API
- **Payment**: Stripe
- **i18n**: Paraglide

---

## 6. SEO 最適化における課題

### 現状の問題点
- [ ] メタタグ（title, description, OG）が未設定または不十分
- [ ] Schema.org 構造化データが未実装
- [ ] サイトマップが未生成
- [ ] 日本語キーワード最適化が未実施
- [ ] FAQ ページが未構築
- [ ] 使用事例ページが未構築

### 改善方針
1. 日本語キーワード調査（免税処理、経理OCR）
2. 各ページのメタタグ最適化
3. Schema.org データ実装（Organization, Product, WebSite）
4. サイトマップ生成と Google Search Console 登録
5. FAQ/使用事例ページ構築

---

**次のステップ**: 日本語キーワード調査を実施
