---
title: 300件のデザイン評価データから作ったAI画像プロンプト完全ガイド
description: Banana Xのインフォグラフィック評価データ300件を分析して作成したYAML 7-Part Structure画像プロンプト作成法。高得点パターンとドメイン別テンプレート付き。
pubDate: '2026-02-06'
heroImage: ../../../assets/blog/banana-x-image-prompt-guide-hero.png
tags:
  - ai
  - image-generation
  - prompt-engineering
  - design
relatedPosts: []
---

## はじめに：「なんとなく綺麗な画像」はもう卒業

AI画像生成ツールに「modern clean blog hero image」と入力したことはありませんか？ 結果はどこかで見たような、特徴のない画像だったはずです。プロンプトが曖昧だと、AIも曖昧な画像を生成します。

この問題を解決するために、**Banana Xプロジェクトで300件以上のインフォグラフィックデザインを5つの基準で評価したデータ**を分析しました。その結果、高得点デザインには明確な共通パターンがあり、それを体系的なプロンプト構造にまとめたのが**YAML 7-Part Structure**です。

### 5つの評価基準（合計50点満点）

| 基準 | 配点 | 説明 |
|------|------|------|
| **Legibility**（可読性） | 10点 | 情報を明確に読み取れるか |
| **Hierarchy**（視覚階層） | 10点 | 情報の優先順位が視覚的に区別されるか |
| **Consistency**（一貫性） | 10点 | デザイン要素が統一された文法に従っているか |
| **Atmosphere**（雰囲気） | 10点 | スタイルがコンテンツの意味を強化しているか |
| **Theme Fit**（テーマ適合） | 10点 | 投稿テーマとビジュアルが一致しているか |

45点以上を獲得したデザインの共通点を抽出し、**誰でも実践できるプロンプト作成フレームワーク**を構築しました。

---

## 1. YAML 7-Part Structure：プロンプトの骨格

すべての画像プロンプトは、以下の7つの要素を必ず含める必要があります。各パートの役割を、BAD vs GOODの例とともに見ていきましょう。

### Part 1: Tone — 雰囲気キーワード5つ

```yaml
Tone: "キーワード1, キーワード2, キーワード3, キーワード4, キーワード5"
```

5つの形容詞・名詞で画像全体の世界観を定義します。**具体的であるほど**良いです。

**❌ BAD:**
```yaml
Tone: "modern, clean, professional"
```
→ あらゆるデザインに当てはまるキーワード。AIが参考にする方向性がありません。

**✅ GOOD:**
```yaml
Tone: "知的, 計画的, 精密, エンジニアリング, 設計図"
```
→ 「知的で計画的なエンジニアリングの設計図」— 明確な世界観が固まります。

**高得点（45点以上）Toneパターン集：**

| スタイル | Toneキーワード |
|---------|--------------|
| Minimal/Line Art | シンプル, 洗練, 静寂, モード, 大人 |
| Blueprint/Technical | 知的, 計画的, 精密, エンジニアリング, 設計図 |
| Paper Craft | 温かい, クラフト感, 童話的, 立体的 |
| Neumorphism | 近未来, 清潔, ソフト, UI, ミニマル |
| Cyberpunk/Circuit | 冷徹, グリッド, ネットワーク, 未来, 知性 |
| Newspaper/Classic | 報道, 重大, クラシック, 権威, インパクト |

### Part 2: Visual Identity — カラーパレット

```yaml
Visual Identity:
  Background: "#HEX (Color Name) — 役割説明"
  Text Color: "#HEX (Color Name)"
  Accent Colors:
    - "#HEX (Name) — 用途"
    - "#HEX (Name) — 用途"
```

色を指定する際は**必ずHEXコード＋色名**を併記します。AIが色を正確に解釈できるようにするためです。

**❌ BAD:**
```yaml
Visual Identity:
  Background: "blue"
  Accent Colors:
    - "yellow"
```
→ 「blue」がどのblueなのか、AIには判断できません。

**✅ GOOD:**
```yaml
Visual Identity:
  Background: "#0047AB (Cobalt Blue) — ブループリント背景"
  Text Color: "#FFFFFF (White)"
  Accent Colors:
    - "#FFD700 (Gold) — ハイライト"
    - "#ADD8E6 (Light Blue) — 補助線"
```
→ 正確な色コード＋役割まで明示し、AIが一貫したカラースキームを維持します。

**高得点カラー組み合わせパターン：**

| スタイル | 背景 | テキスト | アクセント |
|---------|------|---------|----------|
| Blueprint | #0047AB (Blue) | #FFFFFF (White) | #FFD700 (Yellow) |
| Minimal | #FFFFFF (White) | #000000 (Black) | #D3D3D3 (Light Gray) |
| Art Deco | #050505 (Rich Black) | #D4AF37 (Gold) | #C0C0C0 (Silver) |
| Cyberpunk | #000033 (Dark Blue) | #00FFFF (Cyan) | #1E90FF (Dodger Blue) |
| Paper Craft | パステル系 | カットアウトスタイル | 補色パステル |

### Part 3: Image Style — コアビジュアルアプローチ

このパートが画像の実際の見た目を決定します。5～6個のサブフィールドで構成されます。

```yaml
Image Style:
  Features: "核心的な視覚アプローチ1文"
  Shapes: "使用する形状・モチーフ"
  Texture: "表面質感"
  Composition: "レイアウト・構図"
  Effects: "視覚効果"（任意）
  Imagery: "具体的な画像要素"（任意）
```

各フィールドのBAD vs GOOD：

**Features（特徴）** — 最も重要な1文：

- ❌ `"Clean modern design"` → あらゆるデザインに該当
- ✅ `"電子回路基板のパターンで構成されたレイアウト"` → このデザイン固有の特徴

**Shapes（形状）** — 繰り返し使う視覚要素：

- ❌ `"Various shapes"` → 情報なし
- ✅ `"直線と45度の角度で走る配線、ノード、コネクタ"` → 具体的な視覚語彙

**Texture（質感）** — 触覚的な表現：

- ❌ `"Smooth"` → 不十分
- ✅ `"和紙の繊維感、版木の木目、墨の濃淡"` → 物理的な実在感

**Composition（構図）** — 視覚的階層戦略：

- ❌ `"Centered layout"` → 単純すぎる
- ✅ `"圧倒的な余白の中央にわずかな線"` → 空間活用戦略まで含む

### Part 4: Typography — フォントスタイル

```yaml
Typography:
  Heading: "見出しフォントスタイル"
  Body: "本文フォントスタイル"（任意）
  Style: "フォント適用方法"
```

**❌ BAD:**
```yaml
Typography:
  Heading: "Sans-serif"
```

**✅ GOOD:**
```yaml
Typography:
  Heading: "製図用ステンシルフォント"
  Style: "手書きのブロック体、寸法線と注釈ラベルのような配置"
```

**高得点タイポグラフィパターン：**

| スタイル | Heading | Style |
|---------|---------|-------|
| Blueprint | 製図用ステンシルフォント | 手書きのブロック体 |
| Minimal | 細いサンセリフ (Light/Thin) | 大きく使っても圧迫感のない細さ |
| Neumorphism | 丸みのあるサンセリフ | ボタンの刻印のような凹み表現 |
| Paper Craft | 切り絵文字、丸いフォント | 紙から切り出したような文字 |
| Newspaper | ブラックレター（新聞題字風） | 詰め気味の文字組み |

### Part 5: Content Connection — 記事内容との接続

```yaml
Content Connection:
  Core Concept: "この記事が扱う核心概念"
  Visual Metaphor: "核心概念をどんな比喩で視覚化するか"
  Key Elements: "記事から抽出した2-3個の核心視覚要素"
```

**これが最も重要な差別化ポイントです。** このセクションがないと、どの記事にも使えるgenericな画像になってしまいます。

**❌ BAD（Content Connectionなし）：**
→ 「React」記事のヒーロー画像が「Vue」記事にも使える汎用デザイン

**✅ GOOD：**
```yaml
Content Connection:
  Core Concept: "サーバーとクライアントのコンポーネント分離でバンドルサイズ削減"
  Visual Metaphor: "一つのビル（アプリ）がサーバー階とクライアント階に分離する建築設計図"
  Key Elements: "サーバー領域（青色）、クライアント領域（緑色）、データフローの矢印"
```
→ 「React Server Components」の記事でしか意味をなさない、唯一無二の画像方向

### Part 6: Constraints — 制約条件

```yaml
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio. No photorealistic human faces."
```

必ず含めるべき**必須制約4つ**：

| 制約 | 理由 |
|------|------|
| `No text overlay` | AI生成テキストは高確率で崩れる |
| `No watermarks` | ウォーターマーク防止 |
| `2:1 aspect ratio` | ブログヒーロー画像の比率 |
| `No photorealistic human faces` | AI顔生成の不自然さ防止 |

### Part 7: Self-Check — 3点自己検証

プロンプト作成後、必ず以下の3つを確認してください：

1. **唯一性テスト**：「このプロンプトがまったく別の記事にも使えるか？」→ **Yes**ならContent Connectionが不足
2. **視覚具体性テスト**：「このプロンプトを読んで二人が描いたら似た画像になるか？」→ **No**ならShapes/Texture/Compositionが不足
3. **一貫性テスト**：「Toneの5キーワードがColor Palette＋Image Styleと矛盾しないか？」→ 矛盾があれば修正

---

## 2. 高得点デザインの共通法則

300件の評価データから45点以上を獲得したデザインの共通特性を整理しました。

### Consistency 10/10の秘訣：「デザイン文法」の統一

満点の一貫性を達成したデザインは、**すべての要素に同じデザイン文法を適用**しています：

- 線の太さが全域で統一されている
- アイコンの抽象化レベルが揃っている
- 色の使い方にルールがある（例：赤＝強調、青＝補助）
- 質感が全ピクセルで同期している

プロンプトでの実現方法：

```yaml
# ❌ BAD: 質感の記述がない → AIが各部分で別の質感を使う
Image Style:
  Features: "Modern design with icons"

# ✅ GOOD: 全域の質感ルールを明示
Image Style:
  Features: "均一な太さの極細線のみで構成"
  Texture: "すべての線のウェイトが同一 (0.5pt相当)"
  Composition: "図記号の抽象化レベルを統一"
```

### Atmosphere 10/10の秘訣：「情報の器」としてのスタイル

単なる装飾ではなく、**コンテンツの意味を強化するビジュアル**が満点を獲得します。読者の感情状態を変化させるデザインが鍵です。

| 得点 | パターン | なぜ高得点か |
|------|---------|-------------|
| 50/50 | Minimal/Line Art | 情報の引き算を高度に理解し昇華 |
| 49/50 | Blueprint/Technical | 「思考の設計図」という比喩が完璧 |
| 49/50 | Paper Cutout | 切り絵の立体感が情報の階層を表現 |
| 49/50 | Neumorphism | 凹凸で情報の優先度を物理的に表現 |

### Theme Fit 10/10の秘訣：スタイルの本質を転用

スタイルの本質を理解し、情報表現に転用することが鍵です：

- **Blueprint** → 「設計」のメタファーで情報の構築プロセスを表現
- **Newspaper** → 「報道」の形式で情報の重大性を強調
- **Ukiyo-e** → 「粋」の美学で情報の品格を演出

### 満点（50/50）デザインのパターン分析

50点満点を獲得したデザインの共通点：

1. **一つのスタイルに100%コミット** — 複数スタイルを混ぜない
2. **Content Connectionが具体的** — 記事内容と1:1対応
3. **制約条件を徹底遵守** — テキストオーバーレイなし、比率正確
4. **Tone ↔ Style ↔ Color三角一貫性** — 3要素が同じ世界観を指す

---

## 3. ドメイン別プロンプトテンプレート

5つの技術ドメインに最適化されたプロンプトテンプレートです。各ドメインの特性に合った視覚言語を定義しているので、Content Connectionだけを記事に合わせて埋めればOKです。

### 3.1 Web Development / Frontend

```yaml
Tone: "モダン, 構築的, レイヤー, コンポーネント, クリーン"
Visual Identity:
  Background: "#FFFFFF (White)"
  Text Color: "#1A1A1A (Near Black)"
  Accent Colors:
    - "#61DAFB (React Blue) — フレームワーク代表色"
    - "#F7DF1E (JavaScript Yellow) — 補助"
Image Style:
  Features: "コンポーネントのブロックが積み重なる建築的な構成"
  Shapes: "角丸の矩形ブロック, 接続線, ネストされた構造"
  Texture: "フラットでクリーンなデジタル表面"
  Composition: "左から右へのデータフロー, またはコンポーネントツリー"
Typography:
  Heading: "モダンなサンセリフ (Inter, SF Pro)"
  Style: "コードエディタのようなモノスペースのアクセント"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

**ポイント：** コンポーネントブロックの積み重ねによる建築的構成で、フロントエンドの「組み立て」特性を表現。

### 3.2 AI / Machine Learning

```yaml
Tone: "知性, ネットワーク, 未来, 発光, ニューラル"
Visual Identity:
  Background: "#0A0A2E (Deep Space Blue)"
  Text Color: "#E0E0FF (Light Lavender)"
  Accent Colors:
    - "#00FFCC (Cyan Glow) — ニューラルコネクション"
    - "#FF6B6B (Coral) — データポイント"
Image Style:
  Features: "ニューラルネットワークのノードと接続を抽象的に表現"
  Shapes: "光る球体のノード, 曲線の接続線, データの流れ"
  Texture: "暗い空間に浮かぶ発光パーティクル"
  Composition: "中央集約型, 放射状に広がるネットワーク"
  Effects: "グロー効果, 微かなボケ"
Typography:
  Heading: "細い未来的サンセリフ (Exo, Audiowide)"
  Style: "発光するテキスト"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

**ポイント：** ディープスペースブルー背景に発光するノードネットワーク。AI/MLの「接続と学習」の本質を視覚化。

### 3.3 DevOps / Infrastructure

```yaml
Tone: "設計, 精密, 計画, 知的, 工業"
Visual Identity:
  Background: "#0047AB (Blueprint Blue)"
  Text Color: "#FFFFFF (White)"
  Accent Colors:
    - "#FFD700 (Yellow) — ハイライト"
    - "#ADD8E6 (Light Blue) — 補助線"
Image Style:
  Features: "建築図面（ブループリント）の美学"
  Shapes: "方眼グリッド, 寸法線, 断面図, 矢印"
  Texture: "感光紙, 製図用紙"
  Composition: "厳格なグリッドベース, 整理された情報密度"
Typography:
  Heading: "製図文字 (Architect's Daughter風)"
  Style: "全大文字, 規律正しい配置"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

**ポイント：** ブループリント美学。DevOpsの「インフラ設計」の本質を建築図面で表現。

### 3.4 Performance / Optimization

```yaml
Tone: "速度, 効率, 軽量, 洗練, 最適化"
Visual Identity:
  Background: "#FFFFFF (White)"
  Text Color: "#000000 (Black)"
  Accent Colors:
    - "#00C853 (Success Green) — 最適化後"
    - "#FF5252 (Error Red) — 最適化前"
Image Style:
  Features: "極限まで削ぎ落としたミニマリズム"
  Shapes: "極細線, 幾何学図形, グラフの曲線"
  Texture: "マットで滑らか"
  Composition: "圧倒的な余白, Before/Afterの対比"
Typography:
  Heading: "細いサンセリフ (Light / Thin)"
  Style: "数字を大きく, 他は控えめに"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

**ポイント：** 究極のミニマリズム。「最適化＝不要なものを削除」という本質を余白で表現。

### 3.5 Security

```yaml
Tone: "堅牢, 信頼, 層, 保護, 暗号"
Visual Identity:
  Background: "#0F0F0F (Almost Black)"
  Text Color: "#00FF00 (Terminal Green)"
  Accent Colors:
    - "#FF0000 (Alert Red) — 脅威"
    - "#00BFFF (Cyan) — 保護層"
Image Style:
  Features: "電子回路基板と暗号化のメタファー"
  Shapes: "盾, 鍵, ロック, 多層の同心円"
  Texture: "暗い金属面, 微かな回路パターン"
  Composition: "中央の保護対象を多層が囲む"
  Effects: "微かなスキャンラインの走査"
Typography:
  Heading: "モノスペース (Fira Code)"
  Style: "ターミナル出力のような表示"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

**ポイント：** ダーク背景＋ターミナルグリーン。セキュリティの「多層防御」の本質を同心円レイヤーで表現。

---

## 4. YAML → 英語プロンプト変換

YAML構造で設計したプロンプトを実際のAI画像生成APIに投入するには、**英語の自然言語プロンプト**に変換する必要があります。

### 変換ルール

| YAMLパート | 英語プロンプト位置 | 変換方法 |
|-----------|-------------------|---------|
| **Tone** | 文頭 | `"A [tone1], [tone2] illustration..."` |
| **Visual Identity** | 色指定部 | `"...in [color1] (#HEX) and [color2] (#HEX)..."` |
| **Image Style** | 核心描写部 | Features + Shapes + Textureを1～2文に凝縮 |
| **Composition** | 構図指示部 | `"...with [layout description]..."` |
| **Content Connection** | 比喩描写部 | Visual Metaphorを核心文に |
| **Constraints** | 文末 | `"No text overlay. No watermarks. 2:1 aspect ratio."` |

### 変換テンプレート

```
A [Tone keywords] illustration of [Features description].
[Shapes description] arranged in [Composition description].
[Texture description] with [Effects if any].
Color palette: [Background] background, [Accent colors] for key elements.
[Typography style if relevant to the visual].
[Content Connection: Visual Metaphor].
No text overlay. No watermarks. Suitable for 2:1 aspect ratio blog hero image.
```

### 完成例：Next.js App Routerマイグレーション

**YAML設計：**

```yaml
Tone: "構築的, モダン, 移行, 進化, アーキテクチャ"

Visual Identity:
  Background: "#FFFFFF (White) — クリーンな建築図面風"
  Text Color: "#000000 (Black)"
  Accent Colors:
    - "#0070F3 (Next.js Blue) — 新しいApp Router側"
    - "#999999 (Gray) — 旧Pages Router側"
    - "#00C853 (Green) — 成功・改善を示す矢印"

Image Style:
  Features: "建築の改修工事のように、古い構造から新しい構造へ移行する様子を設計図で表現"
  Shapes: "左側に古いフロアプラン(Pages Router), 右側に新しいフロアプラン(App Router), 中央に変換の矢印"
  Texture: "方眼紙のグリッド, 製図用の細い線"
  Composition: "左右二分割, 左=旧(グレートーン), 右=新(ブルートーン), 中央に大きな矢印"
  Effects: "右側がわずかに明るく発光"

Content Connection:
  Core Concept: "Pages RouterからApp Routerへの段階的マイグレーション"
  Visual Metaphor: "古い間取りの建物を、新しい設計で改装する建築家の仕事"
  Key Elements: "旧構造のグレー図面, 新構造の青い図面, 移行パスの緑の矢印"

Constraints: "No text overlay. No watermarks. 2:1 aspect ratio. Blueprint aesthetic."
```

**変換後の英語プロンプト：**

```
An architectural blueprint illustration showing migration from old to new
structure. Left side in gray shows a legacy floor plan (Pages Router), right
side in Next.js blue (#0070F3) shows a modern floor plan (App Router). A large
green arrow connects them through the center. Grid paper background with fine
drafting lines. Left half is muted gray tones, right half is bright blue tones
with subtle glow. Technical annotation style labels. Clean, architectural,
precise. No text overlay. No watermarks. 2:1 aspect ratio.
```

YAML構造で設計した内容を漏れなく自然言語に圧縮するのがポイントです。

---

## まとめ：実践適用の結果とチェックリスト

### 実際のブログへの適用結果

このガイドラインを実際のブログヒーロー画像生成に適用した結果：

- **Before**：プロンプト「modern tech blog hero」→ どこにでもあるグラデーション画像
- **After**：YAML 7-Part Structure適用 → 記事内容と整合する唯一無二の画像

特に**Content Connection**パートの導入後、Theme Fitスコアが平均6点から9点へ大幅に向上しました。

### 最終チェックリスト

プロンプト完成後、以下のチェックリストで最終確認してください：

- [ ] **Tone**：5つのキーワードが具体的で互いに一貫しているか？
- [ ] **Visual Identity**：HEXコード＋色名＋用途がすべて明示されているか？
- [ ] **Image Style**：Features/Shapes/Texture/Compositionがそれぞれ具体的か？
- [ ] **Typography**：スタイルに合ったフォントが指定されているか？
- [ ] **Content Connection**：この記事でしか意味をなさないビジュアルメタファーか？
- [ ] **Constraints**：4つの必須制約（テキスト、透かし、比率、顔）が含まれているか？
- [ ] **Self-Check 3点**：唯一性／視覚具体性／一貫性テストをパスしたか？

この構造に従えば、AIがあなたのブログ記事と完璧に整合する高品質なヒーロー画像を生成してくれます。もう「なんとなく綺麗な画像」で妥協しないでください。**データが証明した高得点パターン**で、正確で意味のある画像を作りましょう。
