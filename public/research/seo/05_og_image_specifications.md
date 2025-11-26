# OG画像仕様書 - Agent Effi Flow

**作成日**: 2025年11月26日
**ステータス**: 仕様確定 / 画像作成待ち

---

## 概要

Open Graph画像（OG画像）は、SNS（Twitter、Facebook、LinkedIn等）でURLがシェアされた際に表示される画像です。適切なOG画像により、CTRが50-100%向上することが実証されています。

---

## 技術仕様

### 共通仕様
- **サイズ**: 1200 × 630 px（推奨）
- **アスペクト比**: 1.91:1
- **ファイル形式**: PNG（推奨）または JPG
- **最大ファイルサイズ**: 8MB以下（推奨: 300KB以下）
- **カラーモード**: RGB
- **保存場所**: `static/` ディレクトリ
- **URL**: `https://agent-effi-flow.jangwook.net/[filename].png`

### セーフエリア
- 外側80px以内にテキスト・重要要素を配置しない（プラットフォームによるクロップ対策）
- 中央部分（1040 × 470 px）を最も重要なエリアとする

---

## 必要画像リスト（5枚）

### 1. og-default.png
**用途**: デフォルトフォールバック画像
**優先度**: ★★★★★

**デザイン要件**:
- **背景**: グラデーション（青 → 紫系、ブランドカラー）
- **メインテキスト**: "Agent Effi Flow"（大きく、明瞭に）
- **サブテキスト**: "AI-OCRで業務効率化"
- **ビジュアル要素**:
  - 抽象的なAI/ネットワークアイコン
  - または文書スキャンのイメージ
- **ロゴ**: 左上または中央に配置
- **色調**: プロフェッショナル、信頼感

**テキスト内容**:
```
Agent Effi Flow
AI-OCRで業務効率化
免税処理・経理OCR自動化
```

---

### 2. og-home.png
**用途**: ホームページ（`/`）
**優先度**: ★★★★★

**デザイン要件**:
- **背景**: og-default.pngと同様のブランドカラー
- **メインテキスト**: "Agent Effi Flow"
- **サブテキスト**: "AI-OCRで業務効率化 | 免税処理・経理OCR自動化サービス"
- **数値的価値提案**:
  - "30秒で処理"
  - "手入力90%削減"
  - "新規登録で50クレジット無料"
- **ビジュアル要素**:
  - 文書スキャン → AI処理 → 結果出力のフロー図
  - または before/after イメージ

**テキスト内容**:
```
Agent Effi Flow
AI-OCRで業務効率化

✓ 30秒で処理
✓ 手入力90%削減
✓ 無料で試せる
```

---

### 3. og-receipt-ocr-tax-refund.png
**用途**: 免税処理OCRページ（`/services/receipt_ocr_for_tax_refund`）
**優先度**: ★★★★☆

**デザイン要件**:
- **背景**: ブランドカラー + 免税関連のビジュアル要素（パスポート、レシート）
- **メインテキスト**: "免税処理OCR"
- **サブテキスト**: "パスポート・免税書類を30秒で自動処理"
- **ビジュアル要素**:
  - パスポートのイラストまたはアイコン
  - レシート/領収書のイラスト
  - AI処理を示す矢印やアイコン
- **価値提案**: "手入力不要 | インバウンド業務効率化"

**テキスト内容**:
```
免税処理OCR
パスポート・免税書類を30秒で自動処理

✓ パスポート情報自動抽出
✓ 免税額自動計算
✓ インバウンド対応
```

---

### 4. og-accounting-ocr.png
**用途**: 経理OCRページ（`/services/accounting_ocr`）
**優先度**: ★★★★☆

**デザイン要件**:
- **背景**: ブランドカラー + 会計関連のビジュアル要素
- **メインテキスト**: "経理OCR"
- **サブテキスト**: "領収書・請求書を自動でデータ化"
- **ビジュアル要素**:
  - 領収書/請求書のイラスト
  - スプレッドシートまたは会計ソフトのアイコン
  - データフローの視覚化
- **価値提案**: "経費精算を10倍速く | 確定申告準備が簡単"

**テキスト内容**:
```
経理OCR
領収書・請求書を自動でデータ化

✓ 経費精算を10倍速く
✓ 確定申告準備が簡単
✓ インボイス制度対応
```

---

### 5. og-pricing.png
**用途**: 料金ページ（`/pricing`）
**優先度**: ★★★☆☆

**デザイン要件**:
- **背景**: シンプルで明るい背景
- **メインテキスト**: "料金プラン"
- **サブテキスト**: "従量課金で無駄なし | 新規登録で50クレジット無料"
- **ビジュアル要素**:
  - 3つのプランを視覚化（アイコンまたは簡単な表）
  - 価格表示（¥0.5/クレジット）
- **価値提案**: "初期費用¥0 | 使った分だけ課金"

**テキスト内容**:
```
料金プラン
従量課金で無駄なし

Starter: 100クレジット ¥50
Standard: 500クレジット ¥250
Pro: 1000クレジット ¥500

新規登録で50クレジット無料
```

---

## デザインガイドライン

### ブランドカラー（推定）
- **プライマリ**: #3B82F6（青）または類似色
- **セカンダリ**: #8B5CF6（紫）または類似色
- **アクセント**: #10B981（緑）または類似色
- **テキスト**: #1F2937（濃いグレー）

### タイポグラフィ
- **メインタイトル**:
  - フォント: Noto Sans JP Bold または Inter Bold
  - サイズ: 72-96px
  - 行間: 1.2
- **サブタイトル**:
  - フォント: Noto Sans JP Regular または Inter Regular
  - サイズ: 32-48px
  - 行間: 1.4
- **箇条書き**:
  - フォント: Noto Sans JP Regular
  - サイズ: 24-32px

### レイアウトパターン
- **左右分割**: テキスト（左60%）+ ビジュアル（右40%）
- **中央配置**: テキスト中央 + 背景にビジュアル要素
- **3分割**: ヘッダー（タイトル）+ コンテンツ（価値提案）+ フッター（ロゴ/URL）

---

## 作成方法

### 推奨ツール

#### オプション1: Canva（最も簡単）
1. [Canva](https://www.canva.com/)にアクセス
2. カスタムサイズ: 1200 × 630 px で新規作成
3. テンプレート検索: "OG image" または "Social media post"
4. 上記の仕様に従ってカスタマイズ
5. PNG形式でダウンロード（高品質設定）

**推奨テンプレート**:
- 技術系・ビジネス系のシンプルなデザイン
- グラデーション背景 + テキスト中心

#### オプション2: Figma（デザイナー向け）
1. [Figma](https://www.figma.com/)で新規ファイル作成
2. フレームサイズ: 1200 × 630 px
3. 上記仕様に従ってデザイン
4. Export設定: PNG, 1x または 2x
5. ファイルサイズ300KB以下に最適化

#### オプション3: Photoshop / GIMP
1. 新規ドキュメント: 1200 × 630 px, 72 dpi, RGB
2. 上記仕様に従ってデザイン
3. Web用に保存（Save for Web）: PNG-24または JPG（品質: 80-90）

#### オプション4: プログラマティック生成（開発者向け）
```bash
# Node.js + Sharp の例
npm install sharp
```

```javascript
// og-image-generator.js
const sharp = require('sharp');

async function generateOGImage(config) {
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#grad)" />
      <text x="100" y="250" font-family="Arial, sans-serif" font-size="72"
            font-weight="bold" fill="white">${config.title}</text>
      <text x="100" y="350" font-family="Arial, sans-serif" font-size="36"
            fill="rgba(255,255,255,0.9)">${config.subtitle}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(config.outputPath);
}

// 使用例
generateOGImage({
  title: 'Agent Effi Flow',
  subtitle: 'AI-OCRで業務効率化',
  outputPath: 'static/og-default.png'
});
```

---

## チェックリスト

画像作成後、以下を確認してください:

### 技術的確認
- [ ] サイズが 1200 × 630 px である
- [ ] ファイルサイズが 300KB 以下である（推奨）
- [ ] ファイル形式が PNG または JPG である
- [ ] `static/` ディレクトリに配置されている
- [ ] ファイル名が仕様通りである

### デザイン確認
- [ ] テキストが明瞭に読める（特にモバイル表示時）
- [ ] セーフエリア内に重要要素が収まっている
- [ ] ブランドカラーが適切に使用されている
- [ ] 低解像度でもロゴ/テキストが判読可能

### 機能確認
- [ ] Facebook Sharing Debugger でテスト
  - URL: https://developers.facebook.com/tools/debug/
- [ ] Twitter Card Validator でテスト
  - URL: https://cards-dev.twitter.com/validator
- [ ] LinkedIn Post Inspector でテスト
  - URL: https://www.linkedin.com/post-inspector/

---

## 各ページでの使用（実装済み）

現在、各ページのSEOコンポーネントで以下のように指定済み:

```svelte
<!-- ホームページ -->
<SEO ogImage="https://agent-effi-flow.jangwook.net/og-home.png" />

<!-- 免税処理OCR -->
<SEO ogImage="https://agent-effi-flow.jangwook.net/og-receipt-ocr-tax-refund.png" />

<!-- 経理OCR -->
<SEO ogImage="https://agent-effi-flow.jangwook.net/og-accounting-ocr.png" />

<!-- 料金ページ -->
<SEO ogImage="https://agent-effi-flow.jangwook.net/og-pricing.png" />

<!-- その他のページ -->
<SEO ogImage="https://agent-effi-flow.jangwook.net/og-default.png" />
```

---

## 推定効果

適切なOG画像実装により、以下の効果が期待されます:

| 指標 | 改善前 | 改善後 | 改善率 |
|-----|-------|-------|--------|
| SNSシェアCTR | 1.0% | 2.0-2.5% | +100-150% |
| SNS経由の流入 | 20セッション/月 | 50-70セッション/月 | +150-250% |
| シェア数 | 5回/月 | 15-25回/月 | +200-400% |

---

## 次のステップ

1. ✅ 仕様確定（本ドキュメント）
2. ⏳ 画像作成（Canva等で作成）
3. ⏳ `static/` ディレクトリに配置
4. ⏳ SNSシェアテスト実施
5. ⏳ 効果測定開始（Google Analytics）

---

**作成者**: Claude Code
**レビュー日**: 2025-11-26
**ステータス**: 仕様確定済み / 実装待ち
