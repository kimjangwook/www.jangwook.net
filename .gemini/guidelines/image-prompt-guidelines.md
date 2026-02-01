# Image Prompt Guidelines — YAML 구조 기반 정밀 프롬프트 작성법

> 출처: Banana X Infographic Evaluation (300+ 디자인 평가 데이터 분석)
> 5가지 평가 기준: Legibility(가독성), Hierarchy(시각 계층), Consistency(일관성), Atmosphere(분위기), Theme Fit(테마 적합성) — 각 10점, 총 50점

---

## 1. 프롬프트 필수 구조 (YAML 7-Part Structure)

모든 이미지 프롬프트는 다음 7개 요소를 **반드시** 포함해야 한다.

### 1.1 Tone (트ーン) — 분위기 키워드 5개

```yaml
Tone: "키워드1, 키워드2, 키워드3, 키워드4, 키워드5"
```

5개의 형용사/명사로 이미지의 전체 분위기를 정의한다. 구체적일수록 좋다.

**❌ BAD**: `"modern, clean, professional"` (너무 일반적)
**✅ GOOD**: `"知的, 計画的, 精密, エンジニアリング, 設計図"` (구체적, 세계관 전달)

**고득점 패턴 (45+/50점) 예시:**
| 스타일 | Tone 키워드 |
|--------|------------|
| Minimal/Line Art | シンプル, 洗練, 静寂, モード, 大人 |
| Blueprint/Technical | 知的, 計画的, 精密, エンジニアリング, 設計図 |
| Paper Craft | 温かい, クラフト感, 童話的, 立体的 |
| Neumorphism | 近未来, 清潔, ソフト, UI, ミニマル |
| Cyberpunk/Circuit | 冷徹, グリッド, ネットワーク, 未来, 知性 |
| Newspaper/Classic | 報道, 重大, クラシック, 権威, インパクト |

### 1.2 Visual Identity — 색상 팔레트

```yaml
Visual Identity:
  Background: "#HEX (Color Name) — 역할 설명"
  Text Color: "#HEX (Color Name)"
  Accent Colors:
    - "#HEX (Name) — 용도"
    - "#HEX (Name) — 용도"
```

**핵심 규칙:**
- **반드시 HEX 코드 + 색상명** 함께 기재 (e.g., `#0047AB (Cobalt Blue)`)
- Accent는 2~3색 이내로 제한
- 색상의 **용도**를 명시 (e.g., `#CC0000 (News Red) — 강조 포인트용`)

**고득점 색상 조합 패턴:**
| 스타일 | 배경 | 텍스트 | 악센트 |
|--------|------|--------|--------|
| Blueprint | #0047AB (Blue) | #FFFFFF (White) | #FFD700 (Yellow highlight) |
| Minimal | #FFFFFF (White) | #000000 (Black) | #D3D3D3 (Light Gray) |
| Art Deco | #050505 (Rich Black) | #D4AF37 (Gold) | #C0C0C0 (Silver) |
| Cyberpunk | #000033 (Dark Blue) | #00FFFF (Cyan) | #1E90FF (Dodger Blue) |
| Paper Craft | Pastel backgrounds | Cut-out style text | Complementary pastels |

### 1.3 Image Style — 핵심 비주얼 접근법

```yaml
Image Style:
  Features: "핵심 시각적 접근법 1문장"
  Shapes: "사용할 형태/모티프"
  Texture: "표면 질감"
  Composition: "레이아웃/구도"
  Effects: "시각 효과" (선택)
  Imagery: "구체적 이미지 요소" (선택)
```

**각 필드 작성 가이드:**

**Features (특징)** — 가장 중요한 1문장:
- ❌ `"Clean modern design"` → 모든 디자인에 해당
- ✅ `"電子回路基板のパターンで構成されたレイアウト"` → 이 디자인만의 고유 특징

**Shapes (형태)** — 반복적으로 사용할 시각 요소:
- ❌ `"Various shapes"` → 정보 없음
- ✅ `"直線と45度の角度で走る配線（トレース）、ノード、コネクタ"` → 구체적 시각 어휘

**Texture (질감)** — 촉각적 표현:
- ❌ `"Smooth"` → 부족
- ✅ `"和紙の繊維感、版木の木目、墨の濃淡"` → 물리적 실재감

**Composition (구도)** — 시각적 계층 전략:
- ❌ `"Centered layout"` → 너무 단순
- ✅ `"圧倒的な余白（ホワイトスペース）の中央にわずかな線"` → 공간 활용 전략

### 1.4 Typography Style (글꼴 스타일)

```yaml
Typography:
  Heading: "제목 폰트 스타일"
  Body: "본문 폰트 스타일" (선택)
  Style: "폰트 적용 방법"
```

**고득점 타이포그래피 패턴:**
| 스타일 | Heading | Style |
|--------|---------|-------|
| Blueprint | 製図用ステンシルフォント | 手書きのブロック体 |
| Minimal | 細いサンセリフ (Light/Thin) | 大きく使っても圧迫感のない細さ |
| Neumorphism | 丸みのあるサンセリフ | ボタンの刻印のような凹み表現 |
| Paper Craft | 切り絵文字、丸いフォント | 紙から切り出したような文字 |
| Newspaper | ブラックレター（新聞題字風） | 詰め気味の文字組み |

### 1.5 Constraints (제약 조건)

```
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio. No photorealistic human faces."
```

**必須制約:**
- `No text overlay` — AI 생성 이미지의 텍스트는 깨지므로 반드시 제외
- `No watermarks` — 워터마크 없음
- `Suitable for 2:1 aspect ratio thumbnail` — 블로그 히어로 이미지 비율
- `No photorealistic human faces` — 부자연스러운 얼굴 방지

### 1.6 Blog Content Connection (블로그 내용 연결)

```
Content Connection:
  Core Concept: "이 포스트가 다루는 핵심 개념"
  Visual Metaphor: "핵심 개념을 어떤 비유로 시각화할 것인가"
  Key Elements: "포스트 내용에서 추출한 2-3개의 핵심 시각 요소"
```

**이것이 가장 중요한 차별점이다.** 이 섹션이 없으면 generic한 이미지가 된다.

**예시 — "React Server Components 가이드" 포스트:**
```yaml
Content Connection:
  Core Concept: "서버와 클라이언트의 컴포넌트 분리로 번들 크기 감소"
  Visual Metaphor: "하나의 건물(앱)이 서버 층과 클라이언트 층으로 분리되는 건축 청사진"
  Key Elements: "서버 영역(청색), 클라이언트 영역(녹색), 데이터 흐름을 나타내는 화살표"
```

### 1.7 Self-Check (자가 검증)

프롬프트 작성 후 반드시 다음 3가지를 확인:

1. **유일성 테스트**: "이 프롬프트가 완전히 다른 블로그 포스트에도 사용될 수 있는가?" → Yes라면 Content Connection이 부족
2. **시각 구체성 테스트**: "이 프롬프트를 읽고 두 사람이 그리면 비슷한 이미지가 나오는가?" → No라면 Shapes/Texture/Composition이 부족
3. **일관성 테스트**: "Tone의 5개 키워드가 Color Palette + Image Style과 모순되지 않는가?" → 모순이 있으면 수정

---

## 2. 도메인별 프롬프트 템플릿

### 2.1 Web Development / Frontend

```yaml
Tone: "モダン, 構築的, レイヤー, コンポーネント, クリーン"
Visual Identity:
  Background: "#FFFFFF (White)"
  Text Color: "#1A1A1A (Near Black)"
  Accent Colors:
    - "#61DAFB (React Blue) — 프레임워크 대표색"
    - "#F7DF1E (JavaScript Yellow) — 보조"
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

### 2.2 AI / Machine Learning

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

### 2.3 DevOps / Infrastructure

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

### 2.4 Performance / Optimization

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

### 2.5 Security

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

---

## 3. 高得点デザインの共通法則 (45+/50点)

Banana X 評価データから抽出した、満点に近いデザインの共通特性:

### 3.1 Consistency (一貫性) で10/10を取る法則

**全パーツに同じ「デザイン文法」を適用する:**
- 線の太さが全域で統一されている
- アイコンの抽象化レベルが揃っている
- 色の使い方にルールがある (e.g., 赤=強調、青=補助)
- 質感が全ピクセルで同期している

**プロンプトでの実現法:**
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

### 3.2 Atmosphere (雰囲気) で10/10を取る法則

**「情報の器」としてスタイルを機能させる:**
- 単なる装飾ではなく、コンテンツの意味を強化するビジュアル
- 読者の感情状態を変化させるデザイン

**高得点の雰囲気パターン:**
| 得点 | パターン | なぜ高得点か |
|------|---------|-------------|
| 50/50 | Minimal/Line Art | 情報の引き算を高度に理解し昇華 |
| 49/50 | Blueprint/Technical | 思考の設計図という比喩が完璧 |
| 49/50 | Paper Cutout | 切り絵の立体感が情報の階層を表現 |
| 49/50 | Neumorphism | 凹凸で情報の優先度を物理的に表現 |

### 3.3 Theme Fit (テーマ適合) で10/10を取る法則

**スタイルの本質を理解し、情報表現に転用する:**
- Blueprint → 「設計」のメタファーで情報の構築プロセスを表現
- Newspaper → 「報道」の形式で情報の重大性を強調
- Ukiyo-e → 「粋」の美学で情報の品格を演出

---

## 4. In-Content Image (本文内画像) プロンプト指針

ヒーロー画像だけでなく、本文内の補足画像にも同じ構造を適用する。

### 4.1 Architecture Diagram (アーキテクチャ図)
```yaml
Tone: "設計, 構造, 論理, 接続, フロー"
Image Style:
  Features: "システム構成図をBlueprintスタイルで表現"
  Shapes: "角丸の箱 (サービス), 矢印 (データフロー), 雲 (クラウド)"
  Composition: "左から右への処理フロー"
```

### 4.2 Comparison Chart (比較図)
```yaml
Tone: "対比, 明確, 客観, バランス, 判断"
Image Style:
  Features: "Before/Afterの二分割構成"
  Shapes: "左右対称のパネル, 中央の分割線"
  Composition: "左=問題(暗い色調), 右=解決(明るい色調)"
```

### 4.3 Process Flow (プロセス図)
```yaml
Tone: "段階, 進行, 変化, 達成, ステップ"
Image Style:
  Features: "ステップバイステップの進行を階段のメタファーで表現"
  Shapes: "番号付きの円, 矢印, 達成マーカー"
  Composition: "左下から右上への上昇構成"
```

---

## 5. プロンプト完成例 (フルYAML)

### 例: 「Next.js App Router マイグレーション」記事のヒーロー画像

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

Typography:
  Heading: "製図文字風のサンセリフ"
  Style: "寸法線と注釈ラベルのような配置"

Content Connection:
  Core Concept: "Pages RouterからApp Routerへの段階的マイグレーション"
  Visual Metaphor: "古い間取りの建物を、新しい設計で改装する建築家の仕事"
  Key Elements: "旧構造のグレー図面, 新構造の青い図面, 移行パスの緑の矢印"

Constraints: "No text overlay. No watermarks. 2:1 aspect ratio. Blueprint aesthetic."
```

### 英語プロンプト変換 (generate_image.js用):

```
An architectural blueprint illustration showing migration from old to new structure. Left side in gray shows a legacy floor plan (Pages Router), right side in Next.js blue (#0070F3) shows a modern floor plan (App Router). A large green arrow connects them through the center. Grid paper background with fine drafting lines. Left half is muted gray tones, right half is bright blue tones with subtle glow. Technical annotation style labels. Clean, architectural, precise. No text overlay. No watermarks. 2:1 aspect ratio.
```

---

## 6. Gemini Image API 用の英語プロンプト変換ルール

`generate_image.js` は英語プロンプトに最適化されているため、YAML設計から英語プロンプトへの変換が必要:

1. **Tone → 冒頭の形容詞句**: `"A [tone1], [tone2] illustration..."`
2. **Visual Identity → 色指定**: `"...in [color1] (#HEX) and [color2] (#HEX)..."`
3. **Image Style → 核心描写**: Features + Shapes + Texture を1~2文に凝縮
4. **Composition → 構図指示**: `"...with [layout description]..."`
5. **Constraints → 末尾の制約**: `"No text overlay. No watermarks. 2:1 aspect ratio."`

**変換テンプレート:**
```
A [Tone keywords] illustration of [Features description].
[Shapes description] arranged in [Composition description].
[Texture description] with [Effects if any].
Color palette: [Background] background, [Accent colors] for key elements.
[Typography style if relevant to the visual].
[Content Connection: Visual Metaphor].
No text overlay. No watermarks. Suitable for 2:1 aspect ratio blog hero image.
```
