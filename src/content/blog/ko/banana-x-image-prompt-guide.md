---
title: '300개 디자인 평가 데이터로 만든 AI 이미지 프롬프트 완벽 가이드'
description: 'Banana X의 인포그래픽 평가 데이터 300건을 분석하여 만든 YAML 7-Part Structure 이미지 프롬프트 작성법. 고득점 패턴과 도메인별 템플릿 포함.'
pubDate: '2026-02-06'
heroImage: ../../../assets/blog/banana-x-image-prompt-guide-hero.png
tags:
  - ai
  - image-generation
  - prompt-engineering
  - design
relatedPosts: []
---

## 서론: "그냥 예쁜 이미지"는 이제 그만

AI 이미지 생성 도구에 "modern clean blog hero image"라고 입력해본 적 있으신가요? 결과는 어디서나 본 듯한, 특색 없는 이미지였을 겁니다. 프롬프트가 모호하면 AI도 모호한 이미지를 생성합니다.

이 문제를 해결하기 위해, **Banana X 프로젝트에서 300건 이상의 인포그래픽 디자인을 5가지 기준으로 평가한 데이터**를 분석했습니다. 그 결과, 고득점 디자인에는 뚜렷한 공통 패턴이 있었고, 이를 체계적인 프롬프트 구조로 정리한 것이 바로 **YAML 7-Part Structure**입니다.

### 5가지 평가 기준 (총 50점 만점)

| 기준 | 배점 | 설명 |
|------|------|------|
| **Legibility** (가독성) | 10점 | 정보를 명확하게 읽을 수 있는가 |
| **Hierarchy** (시각 계층) | 10점 | 정보의 우선순위가 시각적으로 구분되는가 |
| **Consistency** (일관성) | 10점 | 디자인 요소가 통일된 문법을 따르는가 |
| **Atmosphere** (분위기) | 10점 | 스타일이 콘텐츠의 의미를 강화하는가 |
| **Theme Fit** (테마 적합) | 10점 | 포스트 주제와 비주얼이 정합하는가 |

45점 이상을 받은 디자인들의 공통점을 추출하여, **누구나 따라 할 수 있는 프롬프트 작성 프레임워크**를 만들었습니다.

---

## 1. YAML 7-Part Structure: 프롬프트의 뼈대

모든 이미지 프롬프트는 다음 7개 요소를 반드시 포함해야 합니다. 각 파트가 어떤 역할을 하는지, BAD vs GOOD 예시와 함께 살펴보겠습니다.

### Part 1: Tone — 분위기 키워드 5개

```yaml
Tone: "키워드1, 키워드2, 키워드3, 키워드4, 키워드5"
```

5개의 형용사 또는 명사로 이미지의 전체 세계관을 정의합니다. **구체적일수록** 좋습니다.

**❌ BAD:**
```yaml
Tone: "modern, clean, professional"
```
→ 세상 모든 디자인에 해당하는 키워드. AI가 참고할 방향이 없습니다.

**✅ GOOD:**
```yaml
Tone: "知的, 計画的, 精密, エンジニアリング, 設計図"
```
→ "지적이고 계획적인 엔지니어링 설계도" — 명확한 세계관이 잡힙니다.

**고득점(45+점) Tone 패턴 모음:**

| 스타일 | Tone 키워드 |
|--------|------------|
| Minimal/Line Art | シンプル, 洗練, 静寂, モード, 大人 |
| Blueprint/Technical | 知的, 計画的, 精密, エンジニアリング, 設計図 |
| Paper Craft | 温かい, クラフト感, 童話的, 立体的 |
| Neumorphism | 近未来, 清潔, ソフト, UI, ミニマル |
| Cyberpunk/Circuit | 冷徹, グリッド, ネットワーク, 未来, 知性 |
| Newspaper/Classic | 報道, 重大, クラシック, 権威, インパクト |

### Part 2: Visual Identity — 색상 팔레트

```yaml
Visual Identity:
  Background: "#HEX (Color Name) — 역할 설명"
  Text Color: "#HEX (Color Name)"
  Accent Colors:
    - "#HEX (Name) — 용도"
    - "#HEX (Name) — 용도"
```

색상을 지정할 때 **반드시 HEX 코드 + 색상명**을 함께 기재합니다. AI가 색상을 정확히 해석하도록 돕는 것이죠.

**❌ BAD:**
```yaml
Visual Identity:
  Background: "blue"
  Accent Colors:
    - "yellow"
```
→ "blue"가 어떤 blue인지 AI가 판단할 수 없습니다.

**✅ GOOD:**
```yaml
Visual Identity:
  Background: "#0047AB (Cobalt Blue) — 청사진 배경"
  Text Color: "#FFFFFF (White)"
  Accent Colors:
    - "#FFD700 (Gold) — 핵심 하이라이트"
    - "#ADD8E6 (Light Blue) — 보조선"
```
→ 정확한 색상 코드 + 역할까지 명시하여 AI가 일관된 색상 체계를 유지합니다.

**고득점 색상 조합 패턴:**

| 스타일 | 배경 | 텍스트 | 악센트 |
|--------|------|--------|--------|
| Blueprint | #0047AB (Blue) | #FFFFFF (White) | #FFD700 (Yellow) |
| Minimal | #FFFFFF (White) | #000000 (Black) | #D3D3D3 (Light Gray) |
| Art Deco | #050505 (Rich Black) | #D4AF37 (Gold) | #C0C0C0 (Silver) |
| Cyberpunk | #000033 (Dark Blue) | #00FFFF (Cyan) | #1E90FF (Dodger Blue) |
| Paper Craft | Pastel 계열 | 컷아웃 스타일 | 보색 파스텔 |

### Part 3: Image Style — 핵심 비주얼 접근법

이 파트가 이미지의 실제 모습을 결정합니다. 5~6개의 하위 필드로 구성됩니다.

```yaml
Image Style:
  Features: "핵심 시각적 접근법 1문장"
  Shapes: "사용할 형태/모티프"
  Texture: "표면 질감"
  Composition: "레이아웃/구도"
  Effects: "시각 효과" (선택)
  Imagery: "구체적 이미지 요소" (선택)
```

각 필드별 BAD vs GOOD:

**Features (특징)** — 가장 중요한 1문장:

- ❌ `"Clean modern design"` → 모든 디자인에 해당
- ✅ `"電子回路基板のパターンで構成されたレイアウト"` → 이 디자인만의 고유 특징

**Shapes (형태)** — 반복적으로 사용할 시각 요소:

- ❌ `"Various shapes"` → 정보 없음
- ✅ `"直線と45度の角度で走る配線、ノード、コネクタ"` → 구체적 시각 어휘

**Texture (질감)** — 촉각적 표현:

- ❌ `"Smooth"` → 부족
- ✅ `"和紙の繊維感、版木の木目、墨の濃淡"` → 물리적 실재감

**Composition (구도)** — 시각적 계층 전략:

- ❌ `"Centered layout"` → 너무 단순
- ✅ `"圧倒的な余白の中央にわずかな線"` → 공간 활용 전략까지 포함

### Part 4: Typography — 글꼴 스타일

```yaml
Typography:
  Heading: "제목 폰트 스타일"
  Body: "본문 폰트 스타일" (선택)
  Style: "폰트 적용 방법"
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

**고득점 타이포그래피 패턴:**

| 스타일 | Heading | Style |
|--------|---------|-------|
| Blueprint | 제도용 스텐실 폰트 | 손글씨 블록체 |
| Minimal | 가는 산세리프 (Light/Thin) | 크게 써도 압박감 없는 가늘기 |
| Neumorphism | 둥근 산세리프 | 버튼에 각인된 듯한 오목 표현 |
| Paper Craft | 오려낸 글자, 둥근 폰트 | 종이에서 오려낸 듯한 문자 |
| Newspaper | 블랙레터 (신문 제호풍) | 촘촘한 문자 배치 |

### Part 5: Content Connection — 포스트 내용과 연결

```yaml
Content Connection:
  Core Concept: "이 포스트가 다루는 핵심 개념"
  Visual Metaphor: "핵심 개념을 어떤 비유로 시각화할 것인가"
  Key Elements: "포스트에서 추출한 2-3개의 핵심 시각 요소"
```

**이것이 가장 중요한 차별점입니다.** 이 섹션이 없으면 어떤 포스트에나 쓸 수 있는 generic한 이미지가 됩니다.

**❌ BAD (Content Connection 없음):**
→ "React" 포스트의 히어로 이미지가 "Vue" 포스트에도 쓸 수 있는 일반적 디자인

**✅ GOOD:**
```yaml
Content Connection:
  Core Concept: "서버와 클라이언트의 컴포넌트 분리로 번들 크기 감소"
  Visual Metaphor: "하나의 건물(앱)이 서버 층과 클라이언트 층으로 분리되는 건축 청사진"
  Key Elements: "서버 영역(청색), 클라이언트 영역(녹색), 데이터 흐름 화살표"
```
→ "React Server Components" 포스트에서만 의미 있는, 유일무이한 이미지 방향

### Part 6: Constraints — 제약 조건

```yaml
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio. No photorealistic human faces."
```

반드시 포함해야 할 **필수 제약 4가지**:

| 제약 | 이유 |
|------|------|
| `No text overlay` | AI 생성 텍스트는 높은 확률로 깨짐 |
| `No watermarks` | 워터마크 방지 |
| `2:1 aspect ratio` | 블로그 히어로 이미지 비율 |
| `No photorealistic human faces` | AI 얼굴 생성의 부자연스러움 방지 |

### Part 7: Self-Check — 3점 자가 검증

프롬프트 작성 후 반드시 다음 3가지를 확인하세요:

1. **유일성 테스트**: "이 프롬프트가 완전히 다른 포스트에도 사용될 수 있는가?" → **Yes**라면 Content Connection이 부족
2. **시각 구체성 테스트**: "이 프롬프트를 읽고 두 사람이 그리면 비슷한 이미지가 나오는가?" → **No**라면 Shapes/Texture/Composition이 부족
3. **일관성 테스트**: "Tone의 5개 키워드가 Color Palette + Image Style과 모순되지 않는가?" → 모순이 있으면 수정

---

## 2. 고득점 디자인의 공통법칙

300건 평가 데이터에서 45점 이상을 받은 디자인들의 공통 특성을 정리했습니다.

### Consistency 10/10의 비결: "디자인 문법"의 통일

만점 일관성을 달성한 디자인들은 **모든 요소에 동일한 디자인 문법을 적용**합니다:

- 선의 굵기가 전체에서 통일
- 아이콘의 추상화 수준이 동일
- 색상 사용에 규칙이 있음 (예: 빨강=강조, 파랑=보조)
- 질감이 모든 영역에서 동기화

프롬프트로 이를 구현하는 방법:

```yaml
# ❌ BAD: 질감 기술이 없음 → AI가 각 부분에서 다른 질감을 사용
Image Style:
  Features: "Modern design with icons"

# ✅ GOOD: 전체 질감 규칙을 명시
Image Style:
  Features: "균일한 굵기의 극세선만으로 구성"
  Texture: "모든 선의 웨이트가 동일 (0.5pt 상당)"
  Composition: "도형 기호의 추상화 레벨 통일"
```

### Atmosphere 10/10의 비결: "정보의 그릇"으로서의 스타일

단순한 장식이 아니라, **콘텐츠의 의미를 강화하는 비주얼**이 만점을 받습니다. 읽는 사람의 감정 상태를 변화시키는 디자인이 핵심입니다.

| 득점 | 패턴 | 왜 고득점인가 |
|------|------|-------------|
| 50/50 | Minimal/Line Art | 정보의 뺄셈을 고도로 이해하고 승화 |
| 49/50 | Blueprint/Technical | "사고의 설계도"라는 비유가 완벽 |
| 49/50 | Paper Cutout | 오려낸 입체감이 정보의 계층을 표현 |
| 49/50 | Neumorphism | 오목/볼록으로 정보의 우선도를 물리적으로 표현 |

### Theme Fit 10/10의 비결: 스타일의 본질 전용

스타일의 본질을 이해하고, 이를 정보 표현에 전용하는 것이 핵심입니다:

- **Blueprint** → "설계"라는 메타포로 정보 구축 과정을 표현
- **Newspaper** → "보도"라는 형식으로 정보의 중대성을 강조
- **Ukiyo-e** → "멋"의 미학으로 정보의 품격을 연출

### 만점(50/50) 디자인 패턴 분석

50점 만점을 받은 디자인들의 공통점:

1. **하나의 스타일에 100% 올인** — 여러 스타일을 섞지 않음
2. **Content Connection이 구체적** — 포스트 내용과 1:1 대응
3. **제약 조건을 철저히 준수** — 텍스트 오버레이 없음, 비율 정확
4. **Tone ↔ Style ↔ Color 삼각 일관성** — 세 요소가 같은 세계관을 가리킴

---

## 3. 도메인별 프롬프트 템플릿

5개 기술 도메인에 최적화된 프롬프트 템플릿입니다. 각 도메인의 특성에 맞는 비주얼 언어를 정의해두었으므로, Content Connection만 포스트에 맞게 채워 넣으면 됩니다.

### 3.1 Web Development / Frontend

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

**키포인트:** 컴포넌트 블록이 쌓이는 건축적 구성으로, 프론트엔드의 "조립" 특성을 표현합니다.

### 3.2 AI / Machine Learning

```yaml
Tone: "知性, ネットワーク, 未来, 発光, ニューラル"
Visual Identity:
  Background: "#0A0A2E (Deep Space Blue)"
  Text Color: "#E0E0FF (Light Lavender)"
  Accent Colors:
    - "#00FFCC (Cyan Glow) — 뉴럴 커넥션"
    - "#FF6B6B (Coral) — 데이터 포인트"
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

**키포인트:** 딥 스페이스 블루 배경에 발광하는 노드 네트워크. AI/ML의 "연결과 학습" 본질을 시각화합니다.

### 3.3 DevOps / Infrastructure

```yaml
Tone: "設計, 精密, 計画, 知的, 工業"
Visual Identity:
  Background: "#0047AB (Blueprint Blue)"
  Text Color: "#FFFFFF (White)"
  Accent Colors:
    - "#FFD700 (Yellow) — 하이라이트"
    - "#ADD8E6 (Light Blue) — 보조선"
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

**키포인트:** 청사진 미학. DevOps의 "인프라 설계" 본질을 건축 도면으로 표현합니다.

### 3.4 Performance / Optimization

```yaml
Tone: "速度, 効率, 軽量, 洗練, 最適化"
Visual Identity:
  Background: "#FFFFFF (White)"
  Text Color: "#000000 (Black)"
  Accent Colors:
    - "#00C853 (Success Green) — 최적화 후"
    - "#FF5252 (Error Red) — 최적화 전"
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

**키포인트:** 극한의 미니멀리즘. "최적화 = 불필요한 것을 제거"라는 본질을 여백으로 표현합니다.

### 3.5 Security

```yaml
Tone: "堅牢, 信頼, 層, 保護, 暗号"
Visual Identity:
  Background: "#0F0F0F (Almost Black)"
  Text Color: "#00FF00 (Terminal Green)"
  Accent Colors:
    - "#FF0000 (Alert Red) — 위협"
    - "#00BFFF (Cyan) — 보호층"
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

**키포인트:** 다크 배경 + 터미널 그린. 보안의 "다층 방어" 본질을 동심원 레이어로 표현합니다.

---

## 4. YAML → 영어 프롬프트 변환

YAML 구조로 설계한 프롬프트를 실제 AI 이미지 생성 API에 넣으려면 **영어 자연어 프롬프트**로 변환해야 합니다.

### 변환 규칙

| YAML 파트 | 영어 프롬프트 위치 | 변환 방법 |
|-----------|-------------------|-----------|
| **Tone** | 문장 서두 | `"A [tone1], [tone2] illustration..."` |
| **Visual Identity** | 색상 지정부 | `"...in [color1] (#HEX) and [color2] (#HEX)..."` |
| **Image Style** | 핵심 묘사부 | Features + Shapes + Texture를 1~2문장으로 압축 |
| **Composition** | 구도 지시부 | `"...with [layout description]..."` |
| **Content Connection** | 비유 묘사부 | Visual Metaphor를 핵심 문장으로 |
| **Constraints** | 문장 말미 | `"No text overlay. No watermarks. 2:1 aspect ratio."` |

### 변환 템플릿

```
A [Tone keywords] illustration of [Features description].
[Shapes description] arranged in [Composition description].
[Texture description] with [Effects if any].
Color palette: [Background] background, [Accent colors] for key elements.
[Typography style if relevant to the visual].
[Content Connection: Visual Metaphor].
No text overlay. No watermarks. Suitable for 2:1 aspect ratio blog hero image.
```

### 완성 예시: Next.js App Router 마이그레이션

**YAML 설계:**

```yaml
Tone: "構築的, モダン, 移行, 進化, アーキテクチャ"

Visual Identity:
  Background: "#FFFFFF (White) — 클린한 건축 도면풍"
  Text Color: "#000000 (Black)"
  Accent Colors:
    - "#0070F3 (Next.js Blue) — 새로운 App Router 측"
    - "#999999 (Gray) — 구 Pages Router 측"
    - "#00C853 (Green) — 성공/개선을 나타내는 화살표"

Image Style:
  Features: "건축 리모델링처럼, 구 구조에서 새 구조로 이행하는 모습을 설계도로 표현"
  Shapes: "왼쪽에 구 평면도(Pages Router), 오른쪽에 새 평면도(App Router), 중앙에 변환 화살표"
  Texture: "모눈종이 그리드, 제도용 가는 선"
  Composition: "좌우 이분할, 왼쪽=구(그레이 톤), 오른쪽=신(블루 톤), 중앙에 큰 화살표"
  Effects: "오른쪽이 약간 밝게 발광"

Content Connection:
  Core Concept: "Pages Router에서 App Router로의 단계적 마이그레이션"
  Visual Metaphor: "낡은 간취리의 건물을 새 설계로 개장하는 건축가의 작업"
  Key Elements: "구 구조의 그레이 도면, 신 구조의 블루 도면, 이행 경로의 그린 화살표"

Constraints: "No text overlay. No watermarks. 2:1 aspect ratio. Blueprint aesthetic."
```

**변환된 영어 프롬프트:**

```
An architectural blueprint illustration showing migration from old to new
structure. Left side in gray shows a legacy floor plan (Pages Router), right
side in Next.js blue (#0070F3) shows a modern floor plan (App Router). A large
green arrow connects them through the center. Grid paper background with fine
drafting lines. Left half is muted gray tones, right half is bright blue tones
with subtle glow. Technical annotation style labels. Clean, architectural,
precise. No text overlay. No watermarks. 2:1 aspect ratio.
```

YAML 구조에서 설계한 내용을 빠짐없이 자연어로 압축한 것이 포인트입니다.

---

## 마무리: 실전 적용 결과와 체크리스트

### 실제 블로그 적용 결과

이 가이드라인을 실제 블로그 히어로 이미지 생성에 적용한 결과:

- **Before**: 프롬프트 "modern tech blog hero" → 어디서나 본 듯한 그라데이션 이미지
- **After**: YAML 7-Part Structure 적용 → 포스트 내용과 정합하는, 유일무이한 이미지

특히 **Content Connection** 파트를 도입한 후 Theme Fit 점수가 평균 6점에서 9점으로 크게 향상되었습니다.

### 최종 체크리스트

프롬프트를 완성한 후, 다음 체크리스트로 최종 확인하세요:

- [ ] **Tone**: 5개 키워드가 구체적이고 서로 일관되는가?
- [ ] **Visual Identity**: HEX 코드 + 색상명 + 용도가 모두 명시되었는가?
- [ ] **Image Style**: Features/Shapes/Texture/Composition이 각각 구체적인가?
- [ ] **Typography**: 스타일과 어울리는 글꼴이 지정되었는가?
- [ ] **Content Connection**: 이 포스트에서만 의미 있는 비주얼 메타포인가?
- [ ] **Constraints**: 4가지 필수 제약(텍스트, 워터마크, 비율, 얼굴)이 포함되었는가?
- [ ] **Self-Check 3점**: 유일성 / 시각 구체성 / 일관성 테스트를 통과했는가?

이 구조를 따르면, AI가 여러분의 블로그 포스트와 완벽하게 정합하는 고품질 히어로 이미지를 생성해줄 것입니다. 더 이상 "그냥 예쁜 이미지"에 만족하지 마세요. **데이터가 증명한 고득점 패턴**으로, 정확하고 의미 있는 이미지를 만들어보세요.
