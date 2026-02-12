---
title: '基于300个设计评估数据的AI图像提示词完全指南'
description: '分析Banana X的300多条信息图设计评估数据，打造YAML 7-Part Structure图像提示词写作法。包含高分模式和领域专属模板。'
pubDate: '2026-02-06'
heroImage: ../../../assets/blog/banana-x-image-prompt-guide-hero.png
tags:
  - ai
  - image-generation
  - prompt-engineering
  - design
relatedPosts: []
---

## 前言：别再满足于"看起来还行"的图片了

你有没有在AI图像生成工具里输入过"modern clean blog hero image"？结果大概是一张哪里都见过的、毫无特色的图片。提示词越模糊，AI生成的图片就越模糊。

为了解决这个问题，我们分析了<strong>Banana X项目中300多个信息图设计的5维度评估数据</strong>。结果发现，高分设计有着明确的共同规律，我们将这些规律整理成了系统化的提示词框架——<strong>YAML 7-Part Structure</strong>。

### 5项评估标准（满分50分）

| 标准 | 分值 | 说明 |
|------|------|------|
| <strong>Legibility</strong>（可读性） | 10分 | 信息是否能清晰识读 |
| <strong>Hierarchy</strong>（视觉层次） | 10分 | 信息优先级是否有视觉区分 |
| <strong>Consistency</strong>（一致性） | 10分 | 设计元素是否遵循统一语法 |
| <strong>Atmosphere</strong>（氛围感） | 10分 | 风格是否强化了内容含义 |
| <strong>Theme Fit</strong>（主题契合） | 10分 | 视觉是否与文章主题匹配 |

通过提取45分以上设计的共同特征，我们构建了一套<strong>任何人都能上手的提示词写作框架</strong>。

---

## 1. YAML 7-Part Structure：提示词的骨架

每个图像提示词都必须包含以下7个要素。我们用BAD和GOOD的对比来看看每个部分的作用。

### Part 1：Tone — 5个氛围关键词

```yaml
Tone: "关键词1, 关键词2, 关键词3, 关键词4, 关键词5"
```

用5个形容词或名词定义图像的整体世界观。<strong>越具体越好。</strong>

<strong>❌ BAD：</strong>
```yaml
Tone: "modern, clean, professional"
```
→ 适用于所有设计的关键词，AI没有任何方向参考。

<strong>✅ GOOD：</strong>
```yaml
Tone: "知性, 规划, 精密, 工程, 蓝图"
```
→ "知性而精密的工程蓝图"——清晰的世界观立刻浮现。

<strong>高分（45+）Tone模式汇总：</strong>

| 风格 | Tone关键词 |
|------|-----------|
| 极简/线条画 | 简洁, 洗练, 静谧, 格调, 成熟 |
| 蓝图/技术 | 知性, 规划, 精密, 工程, 蓝图 |
| 纸艺 | 温暖, 手工质感, 童话, 立体 |
| 新拟态 | 近未来, 洁净, 柔软, UI, 极简 |
| 赛博朋克/电路 | 冷峻, 网格, 网络, 未来, 智慧 |
| 报纸/经典 | 新闻, 重大, 经典, 权威, 冲击 |

### Part 2：Visual Identity — 色彩方案

```yaml
Visual Identity:
  Background: "#HEX (Color Name) — 角色说明"
  Text Color: "#HEX (Color Name)"
  Accent Colors:
    - "#HEX (Name) — 用途"
    - "#HEX (Name) — 用途"
```

指定颜色时，<strong>必须同时写上HEX代码和颜色名称</strong>，确保AI准确理解。

<strong>❌ BAD：</strong>
```yaml
Visual Identity:
  Background: "blue"
  Accent Colors:
    - "yellow"
```
→ "blue"可以是深蓝、天蓝、钴蓝……AI只能靠猜。

<strong>✅ GOOD：</strong>
```yaml
Visual Identity:
  Background: "#0047AB (Cobalt Blue) — 蓝图背景"
  Text Color: "#FFFFFF (White)"
  Accent Colors:
    - "#FFD700 (Gold) — 关键高亮"
    - "#ADD8E6 (Light Blue) — 辅助线"
```
→ 精确的色彩代码+用途说明，让AI保持一致的配色体系。

<strong>高分色彩组合模式：</strong>

| 风格 | 背景 | 文字 | 强调色 |
|------|------|------|--------|
| 蓝图 | #0047AB (Blue) | #FFFFFF (White) | #FFD700 (Yellow) |
| 极简 | #FFFFFF (White) | #000000 (Black) | #D3D3D3 (Light Gray) |
| 装饰艺术 | #050505 (Rich Black) | #D4AF37 (Gold) | #C0C0C0 (Silver) |
| 赛博朋克 | #000033 (Dark Blue) | #00FFFF (Cyan) | #1E90FF (Dodger Blue) |
| 纸艺 | 粉彩色系 | 剪纸风格 | 互补粉彩 |

### Part 3：Image Style — 核心视觉方法

这个部分决定了图像的实际样貌，由5~6个子字段组成。

```yaml
Image Style:
  Features: "核心视觉方法一句话"
  Shapes: "使用的形状/主题元素"
  Texture: "表面质感"
  Composition: "布局/构图"
  Effects: "视觉效果"（可选）
  Imagery: "具体图像元素"（可选）
```

各字段的BAD vs GOOD：

<strong>Features（特征）</strong> — 最重要的一句话：

- ❌ `"Clean modern design"` → 适用于一切设计
- ✅ `"由PCB电路板图案构成的布局"` → 仅属于该设计的独特特征

<strong>Shapes（形状）</strong> — 重复使用的视觉元素：

- ❌ `"Various shapes"` → 零信息
- ✅ `"直线和45度角的走线、节点、连接器"` → 具体的视觉词汇

<strong>Texture（质感）</strong> — 触觉般的表达：

- ❌ `"Smooth"` → 太笼统
- ✅ `"和纸纤维感、木版纹理、墨的浓淡"` → 物理存在感

<strong>Composition（构图）</strong> — 视觉层次策略：

- ❌ `"Centered layout"` → 过于简单
- ✅ `"大量留白中央的几条细线"` → 包含空间运用策略

### Part 4：Typography — 字体风格

```yaml
Typography:
  Heading: "标题字体风格"
  Body: "正文字体风格"（可选）
  Style: "字体应用方式"
```

<strong>❌ BAD：</strong>
```yaml
Typography:
  Heading: "Sans-serif"
```

<strong>✅ GOOD：</strong>
```yaml
Typography:
  Heading: "制图模板字体"
  Style: "手写块体，像尺寸线和标注标签般排布"
```

<strong>高分字体模式：</strong>

| 风格 | Heading | Style |
|------|---------|-------|
| 蓝图 | 制图模板字体 | 手写块体 |
| 极简 | 细体无衬线 (Light/Thin) | 大字号也不会有压迫感的纤细 |
| 新拟态 | 圆角无衬线 | 按钮上凹刻般的效果 |
| 纸艺 | 剪纸文字、圆润字体 | 像从纸上剪出来的文字 |
| 报纸 | 黑体字（报头风格） | 紧凑排版 |

### Part 5：Content Connection — 与文章内容的关联

```yaml
Content Connection:
  Core Concept: "本文的核心概念"
  Visual Metaphor: "用什么比喻来视觉化核心概念"
  Key Elements: "从文章中提取的2-3个关键视觉元素"
```

<strong>这是最重要的差异化要素。</strong> 没有这个部分，生成的就是任何文章都能用的通用图片。

<strong>❌ BAD（没有Content Connection）：</strong>
→ "React"文章的封面图也能用在"Vue"文章上——毫无区分度

<strong>✅ GOOD：</strong>
```yaml
Content Connection:
  Core Concept: "服务端与客户端组件分离以减小包体积"
  Visual Metaphor: "一栋建筑（应用）分为服务器层和客户端层的建筑蓝图"
  Key Elements: "服务器区域（蓝色）、客户端区域（绿色）、数据流箭头"
```
→ 只对"React Server Components"文章有意义的、独一无二的图像方向

### Part 6：Constraints — 约束条件

```yaml
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio. No photorealistic human faces."
```

<strong>4项必须约束：</strong>

| 约束 | 原因 |
|------|------|
| `No text overlay` | AI生成的文字大概率会乱码 |
| `No watermarks` | 防止水印伪影 |
| `2:1 aspect ratio` | 博客封面图比例 |
| `No photorealistic human faces` | 避免恐怖谷效应的面孔 |

### Part 7：Self-Check — 3项自检

提示词写完后，务必确认以下3点：

1. <strong>唯一性测试</strong>："这个提示词能用在完全不同的文章上吗？"→ <strong>能</strong>的话说明Content Connection不足
2. <strong>视觉具体性测试</strong>："两个人读完这个提示词画出来的图会相似吗？"→ <strong>不会</strong>的话说明Shapes/Texture/Composition不足
3. <strong>一致性测试</strong>："Tone的5个关键词和Color Palette + Image Style矛盾吗？"→ 有矛盾就需要修改

---

## 2. 高分设计的共同法则

从300条评估数据中，我们提取了45分以上设计的共同特征。

### Consistency 10/10的秘诀：统一的"设计语法"

获得满分一致性的设计，<strong>所有元素都遵循同一套设计语法</strong>：

- 线条粗细全局统一
- 图标抽象化程度一致
- 色彩使用有规则（如：红色=强调，蓝色=辅助）
- 质感在所有区域同步

在提示词中如何实现：

```yaml
# ❌ BAD：没有质感描述 → AI在各部分使用不同质感
Image Style:
  Features: "Modern design with icons"

# ✅ GOOD：明确全局质感规则
Image Style:
  Features: "全部由统一粗细的极细线条构成"
  Texture: "所有线条权重一致（相当于0.5pt）"
  Composition: "图形符号的抽象化程度统一"
```

### Atmosphere 10/10的秘诀：风格作为"信息的容器"

不是简单的装饰，而是<strong>强化内容含义的视觉</strong>才能拿满分。关键在于设计能改变读者的情感状态。

| 得分 | 模式 | 为什么高分 |
|------|------|-----------|
| 50/50 | 极简/线条画 | 对信息的减法有高度理解并升华 |
| 49/50 | 蓝图/技术 | "思维的设计图"这个比喻堪称完美 |
| 49/50 | 纸雕剪纸 | 剪纸的立体感表达了信息的层次 |
| 49/50 | 新拟态 | 凹凸效果物理地表现了信息优先级 |

### Theme Fit 10/10的秘诀：活用风格的本质

理解风格的本质，然后将其转用于信息表达：

- <strong>蓝图</strong> → 用"设计/规划"隐喻来表达信息的构建过程
- <strong>报纸</strong> → 用"新闻报道"格式来强调信息的重要性
- <strong>浮世绘</strong> → 用"雅致"美学来提升信息的品格

### 满分（50/50）设计的模式分析

50分满分设计的共同点：

1. <strong>100%专注于一种风格</strong> — 不混搭多种风格
2. <strong>Content Connection具体</strong> — 与文章内容一一对应
3. <strong>严格遵守约束条件</strong> — 无文字叠加、比例精准
4. <strong>Tone ↔ Style ↔ Color三角一致性</strong> — 三个要素指向同一个视觉世界

---

## 3. 领域专属提示词模板

以下是5个技术领域的优化提示词模板。每个模板已定义好领域特有的视觉语言，只需根据文章填写Content Connection即可。

### 3.1 Web开发 / 前端

```yaml
Tone: "现代, 构建性, 分层, 组件化, 简洁"
Visual Identity:
  Background: "#FFFFFF (White)"
  Text Color: "#1A1A1A (Near Black)"
  Accent Colors:
    - "#61DAFB (React Blue) — 框架代表色"
    - "#F7DF1E (JavaScript Yellow) — 辅助"
Image Style:
  Features: "组件块层层堆叠的建筑式构图"
  Shapes: "圆角矩形块、连接线、嵌套结构"
  Texture: "扁平且干净的数字表面"
  Composition: "从左到右的数据流，或组件树结构"
Typography:
  Heading: "现代无衬线体 (Inter, SF Pro)"
  Style: "代码编辑器风格的等宽字体点缀"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

<strong>要点：</strong> 组件块的堆叠式建筑构图，表达前端"组装"的本质特征。

### 3.2 AI / 机器学习

```yaml
Tone: "智慧, 网络, 未来, 发光, 神经"
Visual Identity:
  Background: "#0A0A2E (Deep Space Blue)"
  Text Color: "#E0E0FF (Light Lavender)"
  Accent Colors:
    - "#00FFCC (Cyan Glow) — 神经连接"
    - "#FF6B6B (Coral) — 数据点"
Image Style:
  Features: "抽象化表现的神经网络节点与连接"
  Shapes: "发光球体节点、曲线连接线、数据流"
  Texture: "暗色空间中漂浮的发光粒子"
  Composition: "中心聚合型，放射状展开的网络"
  Effects: "辉光效果、微弱散景"
Typography:
  Heading: "纤细的未来风无衬线体 (Exo, Audiowide)"
  Style: "发光文字"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

<strong>要点：</strong> 深空蓝背景下的发光节点网络——视觉化AI/ML"连接与学习"的本质。

### 3.3 DevOps / 基础设施

```yaml
Tone: "设计, 精密, 规划, 知性, 工业"
Visual Identity:
  Background: "#0047AB (Blueprint Blue)"
  Text Color: "#FFFFFF (White)"
  Accent Colors:
    - "#FFD700 (Yellow) — 高亮"
    - "#ADD8E6 (Light Blue) — 辅助线"
Image Style:
  Features: "建筑图纸（蓝图）美学"
  Shapes: "方格网格、尺寸线、剖面图、箭头"
  Texture: "感光纸、制图纸"
  Composition: "严格的网格基准，有序的信息密度"
Typography:
  Heading: "制图字体 (Architect's Daughter风)"
  Style: "全大写，规整排列"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

<strong>要点：</strong> 蓝图美学。用建筑图纸表达DevOps"基础设施设计"的本质。

### 3.4 性能 / 优化

```yaml
Tone: "速度, 效率, 轻量, 洗练, 优化"
Visual Identity:
  Background: "#FFFFFF (White)"
  Text Color: "#000000 (Black)"
  Accent Colors:
    - "#00C853 (Success Green) — 优化后"
    - "#FF5252 (Error Red) — 优化前"
Image Style:
  Features: "削减到极致的极简主义"
  Shapes: "极细线、几何图形、图表曲线"
  Texture: "哑光且光滑"
  Composition: "压倒性的留白、Before/After对比"
Typography:
  Heading: "纤细无衬线体 (Light / Thin)"
  Style: "数字放大、其余克制"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

<strong>要点：</strong> 极致极简主义——用留白来表达"优化=去除不必要的东西"这一本质。

### 3.5 安全

```yaml
Tone: "坚固, 信赖, 层级, 防护, 加密"
Visual Identity:
  Background: "#0F0F0F (Almost Black)"
  Text Color: "#00FF00 (Terminal Green)"
  Accent Colors:
    - "#FF0000 (Alert Red) — 威胁"
    - "#00BFFF (Cyan) — 防护层"
Image Style:
  Features: "电路板与加密的隐喻"
  Shapes: "盾牌、钥匙、锁、多层同心圆"
  Texture: "暗色金属面、微弱的电路纹理"
  Composition: "中央保护对象被多层环绕"
  Effects: "微弱的扫描线扫过效果"
Typography:
  Heading: "等宽字体 (Fira Code)"
  Style: "终端输出风格的展示"
Constraints: "No text overlay. No watermarks. 2:1 aspect ratio."
```

<strong>要点：</strong> 暗色背景+终端绿。用同心圆层层叠加来表达安全的"纵深防御"本质。

---

## 4. YAML → 英文提示词转换

用YAML结构设计好的提示词，要实际输入AI图像生成API时，需要<strong>转换为英文自然语言提示词</strong>。

### 转换规则

| YAML部分 | 英文提示词位置 | 转换方法 |
|---------|--------------|---------|
| <strong>Tone</strong> | 开头 | `"A [tone1], [tone2] illustration..."` |
| <strong>Visual Identity</strong> | 色彩指定 | `"...in [color1] (#HEX) and [color2] (#HEX)..."` |
| <strong>Image Style</strong> | 核心描述 | 将Features + Shapes + Texture压缩为1~2句 |
| <strong>Composition</strong> | 构图指示 | `"...with [layout description]..."` |
| <strong>Content Connection</strong> | 比喻描述 | Visual Metaphor作为核心句 |
| <strong>Constraints</strong> | 末尾 | `"No text overlay. No watermarks. 2:1 aspect ratio."` |

### 转换模板

```
A [Tone keywords] illustration of [Features description].
[Shapes description] arranged in [Composition description].
[Texture description] with [Effects if any].
Color palette: [Background] background, [Accent colors] for key elements.
[Typography style if relevant to the visual].
[Content Connection: Visual Metaphor].
No text overlay. No watermarks. Suitable for 2:1 aspect ratio blog hero image.
```

### 完整示例：Next.js App Router迁移

<strong>YAML设计：</strong>

```yaml
Tone: "构建性, 现代, 迁移, 进化, 架构"

Visual Identity:
  Background: "#FFFFFF (White) — 简洁的建筑图纸风"
  Text Color: "#000000 (Black)"
  Accent Colors:
    - "#0070F3 (Next.js Blue) — 新App Router侧"
    - "#999999 (Gray) — 旧Pages Router侧"
    - "#00C853 (Green) — 表示成功/改进的箭头"

Image Style:
  Features: "如同建筑改造，用设计图展现从旧结构向新结构迁移的过程"
  Shapes: "左侧旧平面图(Pages Router)，右侧新平面图(App Router)，中央转换箭头"
  Texture: "方格纸网格、制图细线"
  Composition: "左右二分，左=旧(灰色调)，右=新(蓝色调)，中央大箭头"
  Effects: "右侧微微发光"

Content Connection:
  Core Concept: "从Pages Router到App Router的渐进式迁移"
  Visual Metaphor: "建筑师用新设计图改造旧建筑的工作"
  Key Elements: "旧结构灰色图纸、新结构蓝色图纸、迁移路径绿色箭头"

Constraints: "No text overlay. No watermarks. 2:1 aspect ratio. Blueprint aesthetic."
```

<strong>转换后的英文提示词：</strong>

```
An architectural blueprint illustration showing migration from old to new
structure. Left side in gray shows a legacy floor plan (Pages Router), right
side in Next.js blue (#0070F3) shows a modern floor plan (App Router). A large
green arrow connects them through the center. Grid paper background with fine
drafting lines. Left half is muted gray tones, right half is bright blue tones
with subtle glow. Technical annotation style labels. Clean, architectural,
precise. No text overlay. No watermarks. 2:1 aspect ratio.
```

关键是将YAML结构中设计的所有内容，无遗漏地压缩为自然语言。

---

## 总结：实践成果与检查清单

### 实际博客应用效果

将本指南应用于实际博客封面图生成后：

- <strong>Before</strong>：提示词"modern tech blog hero" → 到处都能见到的渐变图片
- <strong>After</strong>：应用YAML 7-Part Structure → 与文章内容完美契合的独一无二图片

特别是引入<strong>Content Connection</strong>后，Theme Fit得分从平均6分跃升至9分。

### 最终检查清单

完成提示词后，请用以下清单做最终确认：

- [ ] <strong>Tone</strong>：5个关键词是否具体且彼此一致？
- [ ] <strong>Visual Identity</strong>：HEX代码+颜色名+用途是否全部明确？
- [ ] <strong>Image Style</strong>：Features/Shapes/Texture/Composition是否各自具体？
- [ ] <strong>Typography</strong>：是否指定了与风格匹配的字体？
- [ ] <strong>Content Connection</strong>：视觉隐喻是否只对本文有意义？
- [ ] <strong>Constraints</strong>：是否包含4项必须约束（文字、水印、比例、面孔）？
- [ ] <strong>Self-Check 3项</strong>：是否通过了唯一性/视觉具体性/一致性测试？

遵循这个结构，AI就能为你的博客文章生成完美契合的高质量封面图。不要再满足于"看起来还行"的图片了。用<strong>数据验证的高分模式</strong>，创造精准而有意义的图像吧。
