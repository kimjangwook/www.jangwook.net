---
title: UX心理学でフロントエンドデザインスキルを強化する
description: >-
  Claude Codeのfrontend-designスキルにUX心理学40の概念とLaws of UX
  30の法則を統合し、美しく効果的なインターフェースを作る方法を紹介します。
pubDate: '2025-12-13'
heroImage: ../../../assets/blog/ux-psychology-skill.png
tags:
  - ux
  - claude-code
  - frontend
relatedPosts:
  - slug: adsense-rejection-ai-analysis-improvement
    score: 0.93
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: aeo-implementation-experience
    score: 0.93
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: llm-seo-aeo-practical-implementation
    score: 0.92
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: 45-day-analytics-report-2025-11
    score: 0.91
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: dena-llm-study-part1-fundamentals
    score: 0.91
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
---

## 背景：AIが生成するUIの限界

Claude Codeを使ったことがある開発者なら、AIが生成するUIに「AI臭」がすることに気づいたかもしれません。Interフォント、紫のグラデーション、予測可能なレイアウト...機能的には動作しますが、どこか味気なく記憶に残らないデザイン。

この問題を解決するため、Qiitaの[nori0724さんの記事](https://qiita.com/nori0724/items/5c1aa2a5d5327bb68b6c)からヒントを得ました。UX心理学のコンテキストをAIに提供すると、生成されるUIの品質が画期的に向上するということです。

## 調査：70以上のUX心理学原則

2つの主要なソースを調査しました：

### 1. shokasonjuku.com - 40のUX心理学概念

日本語ソースから以下のカテゴリの概念を整理しました：

| カテゴリ | 主要概念 |
|---------|----------|
| 認知 | 認知負荷、選択的注意、バナー無視現象 |
| 意思決定 | アンカー効果、おとり効果、デフォルトバイアス |
| 動機付け | 損失回避、希少性、ゲーミフィケーション |
| ユーザー体験 | ドハティ閾値、労働錯覚、ピーク・エンドの法則 |
| 信頼 | 社会的証明、ハロー効果、保有効果 |

### 2. Laws of UX - 30の法則

Jon Yablonskiがまとめた科学的根拠のあるUX法則：

- <strong>ドハティ閾値</strong>：0.4秒以内の応答が没入を維持
- <strong>ヒックの法則</strong>：選択肢が多いほど決定時間が増加
- <strong>ミラーの法則</strong>：作業記憶の容量は7±2個
- <strong>フィッツの法則</strong>：大きく近いターゲットはクリックしやすい
- <strong>ゲシュタルト原則</strong>：近接、類似、連続、閉合

## 分析：既存スキルの問題点

既存の`frontend-design`スキルを分析した結果：

### 強み
- クリエイティブな視覚デザインガイドライン
- 「AI slop」回避の指針
- 大胆な美的決定の奨励

### 弱み（欠けている原則）

```
認知（Cognition）        ❌ 未含有
応答性（Responsiveness） ❌ 未含有
フィードバック（Feedback）⚠️ 部分的
ユーザー心理（Psychology）❌ 未含有
アクセシビリティ          ❌ 未含有
```

<strong>核心問題</strong>：美しいが使いにくいUIが生成される可能性がありました。

## 実装：UX心理学統合スキル

### 新しいスキル構造

````markdown
## Design Thinking Framework
1. Purpose & Context - 目的と成功指標
2. Aesthetic Direction - 美的方向性（既存維持）
3. UX Psychology Strategy - 心理学戦略（新規）

## UX Psychology Toolkit
1. Responsiveness（ドハティ閾値、スケルトンローディング）
2. Cognitive Load（ミラーの法則、チャンキング）
3. Visual Hierarchy（F/Zパターン、近接性）
4. Persuasion（社会的証明、希少性、アンカー効果）
5. Motivation（目標勾配、ツァイガルニク、ピーク・エンド）
6. Accessibility（WCAG AA、キーボードナビゲーション）
````

### 主な追加事項

#### 1. 応答性ガイドライン

```tsx
// 時間閾値
const THRESHOLDS = {
  INSTANT: 100,      // 直接反応
  FAST: 400,         // ドハティ閾値
  ACCEPTABLE: 1000,  // ローディング表示
  SLOW: 10000,       // 進行率表示
};

// スケルトンローディングパターン
const ProductCard = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }
  // ...
};
```

#### 2. 説得心理学パターン

```tsx
// 社会的証明
<div className="flex items-center gap-2 text-sm">
  <span className="pulse-dot bg-green-500" />
  <span>過去24時間で127人が購入</span>
</div>

// 希少性
{stockCount <= 10 && (
  <span className="text-orange-600 font-medium">
    🔥 残り{stockCount}個のみ
  </span>
)}

// アンカー効果（価格）
<span className="line-through text-gray-400">$199</span>
<span className="text-4xl font-bold text-blue-600">$99</span>
```

#### 3. ページ別チェックリスト

| ページタイプ | チェック項目 |
|-------------|-------------|
| ランディング | 0.4秒以内に最初のコンテンツ、社会的証明、単一CTA |
| 商品 | アンカリング、希少性、スケルトンローディング |
| フォーム | 多段階分割、進行状況表示、成功画面 |
| ダッシュボード | 情報チャンキング、段階的開示、未完了強調 |

## 期待効果

### 定量的改善予想

- コンバージョン率（CVR）：+20〜40%
- フォーム完了率：+30%
- 離脱率：-25%
- 平均注文金額：+15%

### 定性的改善

- ユーザー満足度向上
- アクセシビリティ改善による包括性拡大
- 開発者体験向上（明確なガイドライン）

## 結論

<strong>Beauty without usability is art. Usability without beauty is engineering. Great design is both.</strong>

UX心理学をfrontend-designスキルに統合することで：

1. 既存の強み（クリエイティブな視覚デザイン）を維持
2. 科学的根拠のあるUX原則を追加
3. 実用的なコード例とチェックリストを提供
4. 測定可能な成果指標を定義

これでClaude Codeが生成するUIは単に「きれい」なだけでなく「効果的」になります。

## 参考資料

- [Laws of UX](https://lawsofux.com/)
- [shokasonjuku UX Psychology](https://www.shokasonjuku.com/ux-psychology)
- [Qiita - Claude Code UX統合事例](https://qiita.com/nori0724/items/5c1aa2a5d5327bb68b6c)
- [Nielsen Norman Group](https://www.nngroup.com/topic/psychology-and-ux/)
