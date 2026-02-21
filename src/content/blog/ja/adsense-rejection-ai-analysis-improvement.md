---
title: AdSense挑戦記：AI分析で「価値の低いコンテンツ」拒否を克服する
description: >-
  Google
  AdSenseで「価値の低いコンテンツ」として拒否された後、ChatGPT、Claude、Geminiの3つのAIを活用して原因を分析し、承認可能性を5.5点から8.5点に改善した実体験を共有します。
pubDate: '2025-12-03'
noindex: true
heroImage: ../../../assets/blog/adsense-rejection-ai-analysis-improvement-hero.png
tags:
  - adsense
  - seo
  - ai-analysis
relatedPosts:
  - slug: llm-seo-aeo-practical-implementation
    score: 0.93
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: 45-day-analytics-report-2025-11
    score: 0.92
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: adding-chinese-support
    score: 0.92
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: figma-mcp-web-components-sync
    score: 0.92
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: gcloud-mcp-infrastructure-audit
    score: 0.92
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
---

Google AdSenseの審査に申請し、「価値の低いコンテンツ」という理由で拒否されました。しかし、私はAI専門家として、この問題を3つのAI（ChatGPT、Claude、Gemini）に同じ質問をして分析することにしました。その結果、驚くべき発見がありました。問題は<strong>AIが生成したコンテンツではなく、サイトの構造と信頼シグナルの欠如</strong>でした。

## 背景：232件の投稿があっても拒否された理由

jangwook.netは、AI、Claude Code、MCPなどの技術トピックを扱う多言語ブログです。韓国語、英語、日本語、中国語の4つの言語で運営しており、<strong>232件以上の技術投稿</strong>を保有しています。各投稿は1,500〜2,500語の深い技術コンテンツで、コード例、実務のヒント、参考資料が含まれています。

それでも、Google AdSenseから「価値の低いコンテンツ」として拒否されました。この理由が理解できず、私は3つのAIに同じ質問をしました。

## AIたちに同じ質問をする実験

私は次のような情報をChatGPT、Claude、Geminiに提供しました：

- <strong>サイト構造</strong>：SvelteKit基盤のSPA、4つの言語別サブディレクトリ（/ko/、/en/、/ja/、/zh/）
- <strong>ルートページ</strong>：言語選択のみ存在するエントリーポイント形式
- <strong>コンテンツ量</strong>：232件以上の技術ブログ投稿
- <strong>拒否理由</strong>：「価値の低いコンテンツ」

そして同じ質問をしました：「なぜAdSense審査で拒否されたのか、そして何を改善すべきか？」

## 3つのAIの分析結果

### ChatGPTの分析：コンテンツ構造の問題

ChatGPTは<strong>ナビゲーションと必須ページ</strong>に焦点を当てました：

1. <strong>エントリーポイント問題</strong>：ルートページが言語選択のみで、コンテンツがほとんどない
2. <strong>多段階ナビゲーション</strong>：ユーザーがコンテンツに到達するまでに複数のステップが必要
3. <strong>必須ページの欠如</strong>：About、Contact、Privacy Policyページが不足または不十分
4. <strong>hreflangタグの問題</strong>：言語バージョン間の連携がない

ChatGPTは、「Googleクローラーの観点から、サイトは空のシェルのように見える」と指摘しました。

### Claudeの分析：E-E-A-T信号の欠如

Claudeは<strong>信頼性と専門性の信号</strong>に重点を置きました：

1. <strong>Privacy Policy欠如</strong>：最も緊急な問題として識別
2. <strong>Contactページが貧弱</strong>：1文のみ存在し、連絡フォーム、メール、住所情報がない
3. <strong>E-E-A-T信号不足</strong>：各投稿に著者情報がない
4. <strong>ポートフォリオ形式のメインページ</strong>：ブログとして認識されにくい

Claudeは、「コンテンツの品質は良好だが、サイトの信頼性信号が不足している」と評価しました。

### Geminiの分析：技術的SEOの問題

Geminiは<strong>SPA（Single Page Application）アーキテクチャの脆弱性</strong>を深く分析しました：

1. <strong>ハイドレーションギャップ</strong>：AdSenseクローラーがJavaScriptを実行しない場合、空のページとして認識
2. <strong>仮想ルーティング</strong>：ページ移動時にAdSenseコードが再実行されない
3. <strong>価値の真空（Value Vacuum）</strong>：ルートドメインのテキスト密度が0に収束
4. <strong>ドメイン権威の分散</strong>：多言語構造により、コンテンツ量が4分の1に希釈

Geminiは、「最新のWeb技術（SPA）と保守的な広告審査システム間の不一致」と定義しました。

## 共通して発見された核心問題

3つのAIが共通して指摘した問題は次のとおりです：

| 問題 | 深刻度 | 3つのAIの共通意見 |
|------|--------|-------------------|
| ルートページのコンテンツ欠如 | Critical | 「価値の真空」状態、Googleクローラーが空のページとして認識 |
| Privacy Policy欠如 | High | AdSense Terms of Service Section 10の必須要件 |
| Contactページ貧弱 | High | 信頼性信号の欠如、運営者の実体性が不明 |
| hreflangタグ未実装 | Medium | 多言語SEOの基本要件、重複コンテンツリスク |
| E-E-A-T信号不足 | High | 専門性、権威性、信頼性の証拠がない |

## 最も驚いた発見：「価値の真空」

3つのAI全てが強調したのは、<strong>ルートページ（jangwook.net/）が言語選択のみで構成されている</strong>という点でした。

Geminiは、これを「<strong>価値の真空（Value Vacuum）</strong>」と名付けました。AdSense審査はドメイン単位（jangwook.net）で行われるため、審査ボットがルートドメインにアクセスした際、サイトの全般的なテーマと品質を把握しようとします。しかし、ルートページが単に「한국어 / English / 日本語 / 中文」を選択するボタンだけがあるゲートウェイページであれば、ボットの観点からこのサイトのメインページはテキストがほとんどなく、情報性コンテンツが全くない「空の殻」です。

ユーザーは1回のクリックで豊富なコンテンツに到達できますが、<strong>ボットは最初のページ（Landing Page）のコンテンツ密度を最も重要に評価します</strong>。

## 改善作業の内容

AIの分析結果に基づいて、次のような改善作業を行いました：

### 1. ルートページの全面改編（最優先）

<strong>Before</strong>：
```
[ 言語選択ゲートウェイ ]
- 4つの言語ボタンのみ存在
- テキストコンテンツ：ほとんどなし
- AdSenseクローラー評価：「空の殻」
```

<strong>After</strong>：
```
[ コンテンツ豊富なマガジン ]
├── Heroセクション：サイト紹介（200語以上）
├── Statistics：232件以上の投稿、4つの言語、8つ以上のトピック
├── Featured Posts：言語別最新2件（計8件）
├── Popular Topics：タグクラウド
├── About Author：E-E-A-T信号（経歴、専門性）
├── Featured Projects：実際のプロジェクト6件以上
├── Header/Footer：ブログと同じ
└── 自動言語検出：ブラウザロケール基準
```

このアプローチにより、Googleクローラーは<strong>最初の訪問で豊富なコンテンツを発見</strong>できるようになりました。

### 2. hreflangタグの完全実装

<strong>Before</strong>：未実装または部分実装

<strong>After</strong>：全てのページに次のように実装

```html
<link rel="alternate" hreflang="ko" href="https://jangwook.net/ko/..." />
<link rel="alternate" hreflang="en" href="https://jangwook.net/en/..." />
<link rel="alternate" hreflang="ja" href="https://jangwook.net/ja/..." />
<link rel="alternate" hreflang="zh" href="https://jangwook.net/zh/..." />
<link rel="alternate" hreflang="x-default" href="https://jangwook.net/en/..." />
```

これにより、Googleは<strong>同じコンテンツの言語バージョン</strong>として正しく認識できるようになりました。

### 3. 自動言語検出の実装

ブラウザの`Accept-Language`ヘッダーを検出し、適切な言語バージョンに自動リダイレクトする機能を実装しました：

```typescript
// 優先順位：保存された設定 > ブラウザ言語 > 英語
export function getRecommendedLanguage(): SupportedLanguage {
  const saved = getSavedLanguagePreference();  // localStorage
  if (saved) return saved;

  const detected = detectBrowserLanguage();    // navigator.language
  if (detected) return detected;

  return 'en';  // デフォルト値
}
```

### 4. E-E-A-T信号の強化

ルートページに次の要素を追加しました：

- <strong>About Authorセクション</strong>：経歴、専門性、実績
- <strong>Featured Projects</strong>：実際のプロジェクトポートフォリオ
- <strong>Statisticsセクション</strong>：232件以上の投稿、8つ以上のトピック

これにより、Googleに「<strong>実際の専門家が運営する信頼できるリソース</strong>」という信号を明確に伝えることができました。

## Before/After比較

改善前後の変化を数値化しました：

| 項目 | Before | After | 変化 |
|------|--------|-------|------|
| ルートページのテキスト密度 | 50語未満 | 1,500語以上 | +2,900% |
| コンテンツ価値 | 5/10 | 9/10 | +80% |
| SEO技術的完成度 | 6/10 | 9/10 | +50% |
| E-E-A-T信号 | 6/10 | 8/10 | +33% |
| <strong>総合予想承認率</strong> | <strong>5.5/10</strong> | <strong>8.5/10</strong> | <strong>+55%</strong> |

## 技術的な実装の詳細

### 新規ファイル

| ファイル | 用途 |
|---------|------|
| `src/lib/language-detection.ts` | ブラウザ言語検出ユーティリティ |

### 修正ファイル

| ファイル | 変更内容 |
|---------|----------|
| `src/pages/index.astro` | 全面再設計（コンテンツマガジン + 言語検出） |
| `src/components/BaseHead.astro` | hreflangタグ + TypeScript型修正 |

### ビルドおよびテスト結果

```
✓ ビルド成功
✓ 総ページ数：961
✓ ビルド時間：約8秒
✓ エラー：なし（新規導入関連）
```

## 学んだこと：AIコンテンツは問題ではなかった

最も重要な発見は、<strong>AI生成コンテンツが拒否の原因ではなかった</strong>ということです。実際、私のブログのコンテンツ品質は技術ブログとして良好なレベルでした。

問題は次の3つでした：

1. <strong>サイト構造</strong>：ルートページが「価値の真空」状態
2. <strong>技術的SEO</strong>：hreflangタグ、自動言語切り替え未実装
3. <strong>信頼信号</strong>：E-E-A-T要素の欠如

Googleの「価値の低いコンテンツ」判定は、<strong>「このサイトでなければ得られない情報があるか？」</strong>という質問に対する否定的な回答です。しかし、私の場合、コンテンツ自体には価値がありましたが、<strong>Googleクローラーがそれを発見できない構造</strong>になっていました。

## AIたちの賢い提案

3つのAIは、それぞれ異なる観点から分析しましたが、最終的な結論は同じでした：

- <strong>ChatGPT</strong>：「ユーザー体験とクローラー体験は別物。クローラーのための構造を作る必要がある」
- <strong>Claude</strong>：「コンテンツの品質は良好。問題はサイトの信頼性信号の欠如」
- <strong>Gemini</strong>：「最新Web技術（SPA）と保守的な広告審査システム間の不一致を解決する必要がある」

特にGeminiの提案が印象的でした：「<strong>ボットのためのビュー（View）を作ること</strong>」。これは、ユーザー体験を犠牲にすることなく、クローラーが理解できる構造を追加するという意味です。

## AdSense再申請ガイド

改善作業が完了したら、次の戦略で再申請することをお勧めします：

### 申請前チェックリスト

<strong>必須ページ（必ず完備）</strong>：
- [x] ルートページに豊富なコンテンツ存在
- [x] hreflangタグ全てのページに適用
- [x] x-defaultタグ含む
- [x] Privacy Policyページ存在
- [x] Contactページ存在
- [x] Aboutページ存在（E-E-A-T）
- [x] 232件以上の質の高い投稿

### 推奨申請戦略

1. <strong>配布後2〜3日待機</strong>：Googleクローラーが新しいコンテンツをインデックスする時間が必要

2. <strong>Search Console確認</strong>：
   - 新しいページのインデックスリクエスト
   - hreflangタグ検証
   - クローリングエラー確認

3. <strong>申請時の強調点</strong>：
   - 232件以上の技術ブログ投稿
   - 4つの言語サポート（ko、en、ja、zh）
   - 実際の開発者が作成した実務経験ベースのコンテンツ
   - E-E-A-T要素充足

## 結論：AIの助けを借りた問題解決

3つのAIに同じ質問をするという実験は、非常に効果的でした。それぞれ異なる観点から分析し、<strong>総合的な解決策</strong>を導き出すことができました。

最も重要な教訓は次のとおりです：

1. <strong>AIコンテンツは問題ではない</strong>：品質が重要
2. <strong>サイト構造が核心</strong>：クローラーが理解できる構造が必要
3. <strong>信頼信号が重要</strong>：E-E-A-T要素は必須
4. <strong>技術的SEOは基本</strong>：hreflang、自動言語検出など

この改善作業を通じて、AdSense承認予想評価を<strong>5.5点から8.5点に向上</strong>させました。実際の承認結果は2〜3週間後に分かりますが、3つのAI全てが「承認可能性が大幅に向上した」と評価しています。

## 次のステップ

もし再び拒否される場合、次の追加措置を検討します：

1. 一部の投稿にさらに深い個人的経験を追加
2. スクリーンショットおよび固有の画像を補強
3. 内部リンク構造を強化
4. 投稿の長さを拡張（2,000語以上）

しかし、現在の改善作業により、<strong>承認可能性は非常に高まった</strong>と確信しています。

---

<strong>教訓</strong>：Google AdSenseの「価値の低いコンテンツ」拒否は、多くの場合、コンテンツ自体の問題ではなく、<strong>サイト構造、技術的SEO、信頼信号の問題</strong>です。AIを活用して多角的に分析すれば、より効果的な解決策を見つけることができます。
