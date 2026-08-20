# Chapter 8: 内容智能体实现

## 开篇: 如果 AI 能写博客?

> "如果每天 1 小时就能用 3 种语言写出完美的技术博客,会怎样?"

这个问题不再是想象。利用 Claude Code 和专业化的智能体系统,可以实现从创意构思到部署的整个内容制作工作流的自动化。

本章将基于实际运营的博客自动化系统,分步构建四个核心内容智能体。每个配方都可独立阅读,并可直接应用到你的项目中。

### 本章学习内容

- **Recipe 8.1**: Content Planner - 基于趋势的主题发掘系统
- **Recipe 8.2**: Writing Assistant - 高质量内容生成引擎
- **Recipe 8.3**: Image Generator - 自动图片生成集成
- **Recipe 8.4**: Editor - 自动审核及质量管理系统

### 前提条件

学习本章需要:

- Astro 项目 (参考 Chapter 4)
- Claude Code 安装及基本配置 (参考 Chapter 2)
- MCP 服务器设置 (Context7, Playwright)
- TypeScript 基础知识

---

## Recipe 8.1: Content Planner 实现

### 问题 (Problem)

运营博客时首先面临的问题是"写什么?"。要找到好主题需要:

- 掌握最新技术趋势 (耗时)
- 分析关键词竞争度 (需要专业工具)
- 了解目标读者兴趣 (需要数据分析)
- 保持内容一致性 (需要策略)

手动完成所有这些过程需要**每天 2-3 小时**,而且结果一致性差。

### 解决方案 (Solution)

构建 Content Planner 智能体,自动化以下任务:

1. **趋势自动搜索**: 通过 MCP Context7 查询最新技术文档
2. **竞争分析**: 通过 Playwright 爬取竞品博客
3. **主题推荐**: 利用 Claude 的分析能力提取最佳主题
4. **内容大纲生成**: 自动生成结构化大纲

### 分步实施

#### Step 1: 创建智能体文件

```bash
# 目录结构
mkdir -p .claude/agents
touch .claude/agents/content-planner.md
```

#### Step 2: 编写 Content Planner 提示词

将 `.claude/agents/content-planner.md` 文件编写如下:

```markdown
# Content Planner Agent

## 角色

你是一位有 10 年经验的专业内容策略专家。为技术博客发掘最佳主题,制定读者导向的内容策略。

## 核心职责

1. <strong>趋势分析</strong>: 掌握最新技术动向
2. <strong>主题发掘</strong>: 考虑搜索量和竞争度推荐主题
3. <strong>大纲生成</strong>: 制作逻辑结构的内容大纲
4. <strong>关键词研究</strong>: 考虑 SEO 的关键词策略

## 工作流程

### 1. 趋势调研

**使用工具**: Context7 MCP

```typescript
// 搜索最新文档
const trends = await mcp.context7.getLibraryDocs({
  context7CompatibleLibraryID: "/trending-tech",
  topic: "ai, llm, automation",
  tokens: 5000,
});
```

**输出**: 前 5 个热门技术 + 各自的搜索量估算

### 2. 竞品分析

**使用工具**: Playwright MCP

```typescript
// 分析竞品博客
const competitors = [
  "https://blog.openai.com",
  "https://www.anthropic.com/blog",
];

for (const url of competitors) {
  const titles = await browser.evaluate(`
    Array.from(document.querySelectorAll('h2.post-title'))
      .map(el => el.textContent)
  `);
  // 分析主题模式
}
```

**输出**: 竞品未涉及的细分主题 3-5 个

### 3. 主题推荐

**评估标准**:

- 搜索量: 高 / 中 / 低
- 竞争度: 高 / 中 / 低
- 适配度: 与我们博客目标读者的匹配度
- 时效性: 趋势可持续性

**输出格式**:

```markdown
## 推荐主题

### 1. [主题标题]

- <strong>搜索量</strong>: 高 (月 10k+)
- <strong>竞争度</strong>: 中
- <strong>适配度</strong>: ★★★★★ (5/5)
- <strong>推荐理由</strong>: [具体依据]

### 2. [下一个主题]

...
```

### 4. 内容大纲生成

为选定主题生成以下结构的大纲:

```markdown
## 内容大纲: [主题名]

### 目标读者

- 经验水平: [初级/中级/高级]
- 兴趣点: [具体需求]
- 预期背景知识: [必备先修知识]

### 文章结构

#### 1. 引言 (200字)

- Hook: [吸引读者的问题/事实]
- 问题提出: [要解决的问题]
- 承诺: [读完本文能获得什么]

#### 2. 正文 (1800-2000字)

##### 第 1 节: [标题]

- 核心概念说明
- 实用示例 1-2 个
- 常见错误和解决方案

##### 第 2 节: [标题]

- [相同模式重复]

#### 3. 结论 (300字)

- 核心总结 (3-5 个要点)
- 下一步骤 (Call-to-Action)
- 相关资源链接

### SEO 策略

- <strong>主要关键词</strong>: [关键词 1], [关键词 2], [关键词 3]
- <strong>长尾关键词</strong>: [具体搜索词]
- <strong>内部链接</strong>: [相关文章 3-5 个]
```

## 质量标准

生成的主题和大纲应满足以下标准:

- [ ] 目标读者明确定义
- [ ] 各部分包含可执行信息
- [ ] SEO 关键词自然融入
- [ ] 整体结构逻辑连贯
- [ ] 预计文章长度在 2000-3000 字范围内

## 使用示例

```bash
# 调用智能体
@content-planner "基于 2025 年 AI 趋势推荐 5 个博客主题"

# 或使用斜杠命令
/plan-content "主题: Claude Code, 目标: 中级开发者"
```
```

#### Step 3: MCP 集成配置

在 `.mcp.json` 文件中添加所需的 MCP 服务器:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@automatalabs/mcp-server-playwright"]
    }
  }
}
```

#### Step 4: 创建斜杠命令

`.claude/commands/plan-content.md`:

```markdown
# /plan-content 命令

## 目的

接收主题关键词并生成完整的内容计划。

## 用法

```
/plan-content "<主题关键词>" [选项]
```

## 选项

- `--audience`: 目标读者 (beginner, intermediate, advanced)
- `--length`: 预期文章长度 (short: 1500w, medium: 2500w, long: 4000w)
- `--urgency`: 时效性 (high, medium, low)

## 执行流程

1. 调用 Content Planner 智能体
2. 趋势分析及竞品调研
3. 生成主题推荐列表 (5 个)
4. 为用户选择的主题生成详细大纲
5. 将大纲保存为文件 (`drafts/outline-{slug}.md`)

## 输出示例

```markdown
✓ 趋势分析完成 (发现 5 个热门主题)
✓ 竞品分析完成 (调研 3 个网站)
✓ 主题推荐生成完成

## 推荐主题 Top 5

1. "用 Claude Code 实现博客自动化" (搜索量: 高, 竞争: 低) ⭐
2. "MCP 服务器构建完整指南" (搜索量: 中, 竞争: 中)
3. "AI 智能体设计模式" (搜索量: 中, 竞争: 高)
   ...

选择哪个主题? (1-5)
```

```
```

### 代码/示例 (Code)

#### 实际使用场景

```bash
# 运行 Claude Code
claude

# 生成内容计划
> /plan-content "AI 提示工程" --audience intermediate --length long
```

**输出**:

```markdown
🔍 分析趋势中... (Context7)
✓ 发现 125 个 "prompt engineering" 相关文档
✓ 确认 GPT-4, Claude 3.5 官方文档最新更新

📊 竞品分析中... (Playwright)
✓ OpenAI Blog: 发现 3 篇相关文章
✓ Anthropic Blog: 发现 2 篇相关文章
✓ 提取细分主题: "利用 Constitutional AI 实现安全提示"

## 推荐主题

### 1. "LLM 提示工程实战指南 - 5 个核心原则"

- <strong>搜索量</strong>: 高 (月 15k+)
- <strong>竞争度</strong>: 中
- <strong>适配度</strong>: ★★★★★
- <strong>推荐理由</strong>:
  - 实战导向内容需求高
  - 可用 Before/After 示例差异化
  - 与目标读者完美匹配

[详细大纲已生成 → drafts/outline-prompt-engineering.md]
```

#### 生成的大纲文件示例

`drafts/outline-prompt-engineering.md`:

```markdown
# 内容大纲: LLM 提示工程实战指南

## 目标读者

- <strong>经验水平</strong>: 中级 (有 ChatGPT/Claude 基本使用经验)
- <strong>兴趣点</strong>: 获得更好结果的实用技巧
- <strong>背景知识</strong>: LLM 基本概念, API 使用经验

## 文章结构

### 1. 引言 (200字)

**Hook**: "为什么你的 ChatGPT 没有预期那么聪明?"

**问题提出**:

- 即使是同一个 LLM,提示词不同结果天差地别
- 好提示词 vs 坏提示词的实际案例

**承诺**: 读完本文可将提示词质量提升 3 倍

### 2. 正文 (2000字)

#### 第 1 节: 明确性 (Clarity) - 500字

**核心概念**: 模糊的指令产生模糊的结果

**Before/After 示例**:

```
Before: "请写博客文章"
After: "为有 10 年经验的开发者撰写一篇关于 TypeScript 类型推断的
      2500 字教程。包含 10 个可运行的代码示例。"
```

**常见错误**: 抽象请求、隐式假设

#### 第 2 节: 提供上下文 (Context) - 500字

[相同模式]

#### 第 3 节: 约束条件 (Constraints) - 500字

[相同模式]

#### 第 4 节: 示例应用 (Examples) - Few-shot Learning - 500字

[相同模式]

### 3. 实战模板 (500字)

#### 模板 1: 代码生成

```
你是 [语言] 专家。

**需求**: [具体功能]
**约束**: [性能、安全、样式指南]
**预期输入**: [示例数据]
**预期输出**: [结果格式]

编写代码并为每部分添加注释说明。
```

[模板 2, 3...]

### 4. 结论 (300字)

**核心总结**:

- 明确性: 具体请求
- 上下文: 提供充分背景信息
- 约束: 设置明确条件
- 示例: 通过 Few-shot 学习模式
- 迭代: 提示词在不断进化

**下一步**:

1. 今天用 5 个原则改进一个常用提示词
2. 对比 Before/After 结果并记录
3. 将常用提示词模板化

## SEO 策略

- <strong>主要关键词</strong>: 提示工程, LLM, ChatGPT, Claude
- <strong>长尾关键词</strong>: "提示工程实战示例", "LLM 提示词编写方法"
- <strong>内部链接</strong>:
  - "Claude Code 入门" (先修学习)
  - "AI 智能体设计模式" (进阶学习)

## 预期成效

- <strong>撰写时间</strong>: 使用智能体 1 小时
- <strong>预期浏览量</strong>: 月 500-800 (3 个月后)
- <strong>目标关键词排名</strong>: 前 10 名
```

### 说明 (Explanation)

这个 Content Planner 之所以有效:

#### 1. 数据驱动决策

通过 MCP 收集实时数据而非手动调研:

- **Context7**: 最新官方文档、趋势分析
- **Playwright**: 竞品实际内容分析
- **Claude 分析**: 模式识别及细分发现

#### 2. 结构化输出

所有推荐遵循一致格式,决策迅速:

```
搜索量 + 竞争度 + 适配度 + 推荐理由 = 明确选择标准
```

#### 3. 立即可执行

生成的大纲可直接传递给 Writing Assistant。

### 变体 (Variations)

#### 变体 1: 社交媒体内容规划师

针对 Twitter/LinkedIn 而非博客:

```markdown
## Social Media Planner

### 平台策略

- <strong>Twitter</strong>: 280 字限制, 必须配图
- <strong>LinkedIn</strong>: 1300 字最佳, 强调专业性

### 内容组合 (1 周基准)

- 40% 教育内容
- 30% 娱乐
- 20% 个人故事
- 10% 推广
```

#### 变体 2: 系列内容规划师

规划连载而非单篇:

```markdown
## 系列计划: "Claude Code 精通之路" (共 10 集)

### Episode 1: 基础配置 (难度: ★☆☆☆☆)

- 目标: 初学者
- 先修知识: 无

### Episode 2: 构建首个智能体 (难度: ★★☆☆☆)

- 目标: 初级
- 先修知识: Episode 1

[继续...]

### 连载时间表

- 每周 2 次发布 (周一、周四)
- 共需 5 周
```

#### 变体 3: 多语言内容策略

同一主题针对不同语言定制:

```markdown
## 多语言策略

### 中文 (zh)

- 语气: 礼貌、详细说明
- 示例: 中国开发者熟悉的案例

### 英语 (en)

- 语气: 简洁、直接
- 示例: 全球标准案例

### 日语 (ja)

- 语气: 郑重、循序渐进
- 示例: 适配日本 IT 环境
```

---

## Recipe 8.2: Writing Assistant 实现

### 问题 (Problem)

有了内容大纲,但实际撰写文章是另一个挑战:

- 难以保持一致的语气
- 编写代码示例耗时
- 段落间自然过渡困难
- 填充 2000-3000 字本身就是负担

即使专业作者也需要**3-4 小时**撰写初稿。

### 解决方案 (Solution)

Writing Assistant 智能体执行以下任务:

1. **基于大纲生成初稿**: 用逻辑流程撰写全文
2. **自动生成代码示例**: 可运行且包含注释的代码
3. **保持语气一致性**: 遵守预定义的样式指南
4. **SEO 优化**: 自然融入关键词

### 分步实施

#### Step 1: 编写 Writing Assistant 提示词

`.claude/agents/writing-assistant.md`:

```markdown
# Writing Assistant Agent

## 角色

你是一位有 10 年经验的技术博客作者。擅长将复杂技术清晰有趣地讲解。

## 写作原则

### 1. 读者导向

- 让读者始终理解"为什么这很重要?"
- 专业术语首次出现时说明
- 禁止无实战示例的概念说明

### 2. 结构与流程

```
引言 (提出问题)
  ↓
问题分析 (为什么困难?)
  ↓
解决方案 (如何解决?)
  ↓
实战示例 (立即应用)
  ↓
结论 (核心总结 + 下一步)
```

### 3. 语气指南

- <strong>中文</strong>: 礼貌、亲和且专业
- <strong>句子长度</strong>: 平均 15-20 字 (可读性)
- <strong>段落长度</strong>: 3-5 句 (移动端优化)
- <strong>示例比例</strong>: 说明 60% + 示例 40%

### 4. 代码示例标准

所有代码应满足以下条件:

```typescript
// ✓ 好示例: 注释、类型、可运行
async function fetchUserData(userId: string): Promise<User> {
  // 1. 输入验证
  if (!userId) throw new Error("userId is required");

  // 2. API 调用
  const response = await fetch(`/api/users/${userId}`);

  // 3. 错误处理
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  // 4. 返回数据
  return response.json();
}

// ✗ 坏示例: 无注释、无错误处理
async function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`).then((r) => r.json());
}
```

## 撰写流程

### Input: 内容大纲

```markdown
# 大纲

## 主题: [标题]

## 目标读者: [读者定义]

## 结构: [各节内容]

## SEO 关键词: [关键词列表]
```

### Process: 分节撰写

#### Step 1: 引言 (200-300字)

**构成要素**:

1. Hook (1-2句): 精准点出读者的痛点

```markdown
"为什么你的 ChatGPT 没有预期那么聪明?"
```

2. 问题扩展 (2-3句): 这是多么普遍的问题

```markdown
许多开发者在使用 LLM 时都有这样的经历。
同样的问题,结果却参差不齐,有时甚至完全错误。
```

3. 承诺 (1-2句): 读完本文能获得什么

```markdown
本文将学习将提示词质量提升 3 倍的<strong>5 个核心原则</strong>。
每个原则都配有实战示例,可立即应用。
```

#### Step 2: 正文各节 (每节 400-500字)

**模板**:

```markdown
## [节标题]: [核心概念]

### 概念说明 (100字)

[是什么? 为什么重要?]

### Before/After 示例 (200字)

**Before (坏示例)**:

\`\`\`
[有问题的代码/提示词]
\`\`\`

问题点:

- [问题 1]
- [问题 2]

**After (好示例)**:

\`\`\`
[改进的代码/提示词]
\`\`\`

改进点:

- [解决 1]
- [解决 2]

结果: [可测量的改进 - "响应准确度提升 80%"]

### 实战技巧 (100字)

- <strong>技巧 1</strong>: [具体建议]
- <strong>技巧 2</strong>: [具体建议]

### 常见错误 (100字)

⚠️ <strong>错误 1</strong>: [常见失误]
✓ <strong>解决</strong>: [正确方法]
```

#### Step 3: 结论 (200-300字)

1. 核心总结 (要点列表)
2. 实践任务 (3 项)
3. 相关资源链接

### Output: 完成的 Markdown

```yaml
---
title: [60字以内, 包含 SEO 关键词]
description: [150-160字, 包含行动导向语句]
pubDate: [YYYY-MM-DD]
heroImage: [图片路径]
tags: [关键词数组]
---
[全文正文]
```

## 质量检查清单

撰写完成后验证以下内容:

- [ ] 首段吸引读者兴趣
- [ ] 各节包含可执行示例
- [ ] 代码均可运行且包含注释
- [ ] 段落长度为 3-5 句 (移动端可读性)
- [ ] SEO 关键词自然出现 3-5 次
- [ ] 结论包含明确的 Call-to-Action
- [ ] 整体语气一致 (礼貌、亲和)
- [ ] 所有专业术语都已说明

## 高级技巧

### Few-shot Learning

提供 2-3 个好示例可学习样式:

```markdown
**样式参考示例**:

1. [现有博客文章 1 - 引言示例]
2. [现有博客文章 2 - 代码示例]
3. [现有博客文章 3 - 结论示例]

按照上述样式撰写新文章。
```

### Chain-of-Thought

复杂概念采用逐步思考过程:

```markdown
## 说明复杂概念时

1. <strong>简化</strong>: 从最简单的比喻开始
2. <strong>具体化</strong>: 实际代码示例
3. <strong>扩展</strong>: 高级用例
4. <strong>连接</strong>: 与之前学习内容连接
```

## 使用示例

```bash
# 用大纲文件撰写博客
@writing-assistant "阅读 drafts/outline-prompt-engineering.md 并撰写完整博客文章"

# 或使用斜杠命令
/write-from-outline drafts/outline-prompt-engineering.md
```
```

#### Step 2: 创建斜杠命令

`.claude/commands/write-from-outline.md`:

```markdown
# /write-from-outline 命令

## 目的

读取内容大纲文件并撰写完整的博客文章。

## 用法

```
/write-from-outline <大纲文件路径> [选项]
```

## 选项

- `--style`: 样式参考文章路径
- `--lang`: 语言 (ko, en, ja)
- `--output`: 输出文件路径 (默认: auto-generate)

## 执行流程

1. 读取大纲文件
2. 调用 Writing Assistant 智能体
3. 分节生成草稿
4. 验证代码示例 (检查语法错误)
5. 生成 SEO 元数据
6. 保存最终文件

## 示例

```bash
/write-from-outline drafts/outline-prompt-engineering.md --lang ko --style src/content/blog/ko/claude-code-best-practices.md
```

输出:

```
✓ 读取大纲文件完成
✓ 分析样式参考文章完成

📝 生成草稿中...
  ✓ 引言 (285字)
  ✓ 第 1 节: 明确性 (520字)
  ✓ 第 2 节: 提供上下文 (495字)
  ✓ 第 3 节: 约束条件 (510字)
  ✓ 第 4 节: 示例应用 (505字)
  ✓ 第 5 节: 迭代改进 (480字)
  ✓ 结论 (310字)

📊 统计:
  - 总字数: 3,105
  - 代码示例: 12 个
  - 图片 placeholder: 3 个

💾 保存完成: src/content/blog/ko/prompt-engineering-guide.md
```

```
```

### 代码/示例 (Code)

#### 实际生成的博客文章示例

```bash
/write-from-outline drafts/outline-prompt-engineering.md
```

**生成结果** (`src/content/blog/ko/prompt-engineering-guide.md`):

```markdown
---
title: "LLM 提示工程实战指南 - 5 个核心原则"
description: "让 ChatGPT 和 Claude 提升 10 倍智能的提示工程技巧。包含 Before/After 示例和可直接使用的模板。"
pubDate: "2025-01-15"
heroImage: "../../../assets/blog/prompt-engineering-hero.png"
tags:
  - llm
  - prompt-engineering
  - chatgpt
  - claude
  - ai
  - tutorial
---

# LLM 提示工程实战指南

## 为什么你的 ChatGPT 没有预期那么聪明?

许多开发者在使用 ChatGPT 或 Claude 时都有这样的经历。同样的问题,结果却参差不齐,有时甚至完全错误。"AI 原本就是这样吗?" 然后就放弃了。

但问题不在 AI,而在<strong>提示词</strong>。即使是同一个 LLM,提示词质量不同,结果天差地别。就像同样的食材,根据食谱不同,能做出完全不同的菜一样。

本文将学习将提示词质量提升 3 倍的<strong>5 个核心原则</strong>。每个原则都配有 Before/After 示例,可立即应用。现在就让你的 ChatGPT 真正变聪明。

## 1. 明确性 (Clarity): 具体请求

### 模糊的指令产生模糊的结果

提示工程的第一原则是<strong>明确性</strong>。"请写博客文章"和"撰写一篇关于 TypeScript 类型推断的 2500 字教程"是完全不同的请求。

### Before/After 示例

<strong>Before (坏示例)</strong>:

```
请写博客文章。主题是 AI。
```

问题点:

- 过于模糊 (AI 的哪个方面?)
- 语气、长度、结构不明确
- 目标读者未定义
- 结果: 泛泛而谈、表面化的文章

<strong>After (好示例)</strong>:

```
你是一位有 10 年经验的技术博客作者。

**主题**: AI 时代的提示工程

**目标读者**:
- 对 AI 感兴趣的中级开发者
- 有 ChatGPT/Claude 基本使用经验
- 想要实战示例的实务人员

**需求**:
1. 语气: 礼貌、专业但亲和
2. 长度: 2,500-3,000 字
3. 结构:
   - 引言: 精准点出读者痛点
   - 正文: 5 个核心原则 + 各自的 Before/After 示例
   - 结论: 3 个可实践的行动项
4. 代码示例: 至少 10 个,包含注释

**样式指南**:
- 专业术语首次出现时说明
- 段落限制在 3-5 句
- 每节末尾核心总结
```

结果: <strong>输出质量提升 3 倍</strong>, 修改次数减少 80%

### 实战技巧

- <strong>技巧 1</strong>: 明确 5W1H (Who, What, When, Where, Why, How)
- <strong>技巧 2</strong>: 具体呈现预期输出格式
- <strong>技巧 3</strong>: 用"2500字、10个代码"等可测量方式而非"写得好"

### 常见错误

⚠️ <strong>错误</strong>: "写得好"、"做得棒"等抽象请求
✓ <strong>解决</strong>: "2500字、礼貌语气、10个代码示例"等具体标准

## 2. 提供上下文 (Context): 充分的背景信息

### LLM 无法读取你的想法

第二原则是<strong>提供上下文</strong>。你了解项目情况,但 AI 不知道。必须提供充分的背景信息才能获得准确答案。

[以下各节按相同模式生成...]

## 结论: 今天就开始应用

### 核心总结

本文学习的 5 个核心原则:

- <strong>明确性</strong>: 具体请求 (利用 5W1H)
- <strong>上下文</strong>: 提供充分背景信息
- <strong>约束</strong>: 设置明确条件
- <strong>示例</strong>: 通过 Few-shot Learning 学习模式
- <strong>迭代</strong>: 提示词在不断进化

### 下一步: 今天实践 3 件事

1. <strong>审计</strong>: 用 5 个原则改进今天使用的一个提示词
2. <strong>对比</strong>: 记录 Before/After 结果并测量改进度
3. <strong>模板化</strong>: 将常用提示词制作成模板以便复用

### 相关资源

- [Claude Code 入门](/blog/claude-code-getting-started) - 先修学习
- [AI 智能体设计模式](/blog/ai-agent-patterns) - 进阶学习
- [提示词库](https://github.com/awesome-prompts) - 模板集合

提示工程既是技术也是艺术。从今天开始一点点改进,3 个月后你将拥有完全不同水平的 AI 应用能力。祝你成功! 🚀
```

#### 样式一致性验证

Writing Assistant 通过分析样式参考文章来保持一致性:

```bash
/write-from-outline drafts/new-post.md --style src/content/blog/ko/existing-post.md
```

**分析结果**:

```
📊 样式分析完成

参考文章: claude-code-best-practices.md
- 平均句子长度: 18 字
- 平均段落长度: 4 句
- 代码示例比例: 35%
- 主要语气: 礼貌、亲和、实用

✓ 新文章也应用相同模式
```

### 说明 (Explanation)

#### 为什么这个结构有效?

1. <strong>基于模板的一致性</strong>

所有章节遵循相同模式:

```
概念说明 → Before/After → 实战技巧 → 常见错误
```

读者在可预测的结构中学习更快。

2. <strong>Before/After 的力量</strong>

具体对比比抽象说明效果好 10 倍:

```
"写得清楚" (抽象) < "包含 5W1H" (具体)
```

3. <strong>可测量的改进</strong>

所有改进用数字表达:

```
"质量提升" (X) → "准确度提升 80%" (O)
```

4. <strong>立即可执行</strong>

结论的"下一步 3 件事"引导读者立即行动。

#### 代码示例自动生成原理

Writing Assistant 通过以下流程生成代码:

```typescript
// 1. 理解概念
const concept = "类型安全的 API 调用";

// 2. Before 代码 (有问题的版本)
const badCode = generateBadExample(concept);

// 3. After 代码 (改进版本)
const goodCode = improveCode(badCode, {
  addTypes: true,
  addComments: true,
  addErrorHandling: true,
  followBestPractices: true,
});

// 4. 说明差异
const explanation = explainDifferences(badCode, goodCode);
```

### 变体 (Variations)

#### 变体 1: 多语言 Writing Assistant

按语言优化语气:

```markdown
## 各语言写作风格

### 中文 (zh)

- 语气: 礼貌 (正式但亲和)
- 示例: "您是否有过这样的经历?"
- 句子: 简洁明确

### 英语 (en)

- 语气: 直接、简洁
- 示例: "Have you experienced this?"
- 句子: 偏好主动语态、简短

### 日语 (ja)

- 语气: 郑重、循序渐进
- 示例: "皆様はこのような経験がありますか?"
- 句子: 重视语境、详细说明
```

#### 变体 2: Tutorial vs Opinion 风格

按内容类型分类:

```markdown
## Tutorial 风格

- 结构: 分步指南
- 示例: 以可运行代码为中心
- 语气: 客观、教育性

**示例**:

```
## Step 1: 环境配置

首先安装必要的包:

\`\`\`bash
npm install @anthropic-ai/sdk
\`\`\`

接下来...
```

```

## Opinion 风格

- 结构: 主张 → 依据 → 反驳 → 结论
- 示例: 实际经验案例
- 语气: 主观、说服性

**示例**:

```markdown
## 我认为 TypeScript 是必需的

过去 5 年进行了 10 个项目,我的感受是...
虽然有"类型会降低生产力"的反对意见,但...
```

```
```

#### 变体 3: SEO 增强模式

专注搜索引擎优化:

```markdown
## SEO Writing Mode

### 关键词布局策略

- <strong>Title</strong>: 主要关键词靠前
- <strong>H1</strong>: 准确包含关键词
- <strong>前 100 字</strong>: 主要关键词 2-3 次
- <strong>H2 节</strong>: 利用长尾关键词
- <strong>图片 Alt</strong>: 关键词 + 说明

### 自动插入内部链接

```typescript
// 自动链接相关文章
const relatedPosts = findRelatedPosts({
  currentTags: post.tags,
  minSimilarity: 0.7,
  limit: 3,
});

// 自然地插入文章中
insertInternalLinks(postContent, relatedPosts);
```

### 自动生成 FAQ

```markdown
## 常见问题

### Q: 提示工程难吗?

A: 只需了解 5 个基本原则,任何人都能做到...

[优化为 Google Rich Snippet 格式]
```

```
```

---

## Recipe 8.3: Image Generator 集成

### 问题 (Problem)

博客文章需要视觉素材。但是:

- 使用设计工具耗时 (Figma, Canva 等)
- 难以保持一致风格
- 版权问题 (库存图片)
- 定制图片制作成本

制作一张主图需要**30分钟〜1小时**。

### 解决方案 (Solution)

通过 Image Generator 智能体自动化以下任务:

1. **基于提示词的图片生成**: 符合主题的主图
2. **品牌一致性**: 预定义的色板和风格
3. **多种格式**: Hero、Thumbnail、Social Media 版本
4. **自动优化**: WebP 转换、响应式尺寸

### 分步实施

#### Step 1: Image Generator 提示词

`.claude/agents/image-generator.md`:

```markdown
# Image Generator Agent

## 角色

你是专业 UI/UX 设计师。为技术博客生成视觉素材。

## 品牌指南

### 色板

```css
/* Primary Colors */
--color-primary: #3b82f6; /* Blue */
--color-secondary: #10b981; /* Green */
--color-accent: #f59e0b; /* Orange */

/* Neutral Colors */
--color-bg: #f3f4f6; /* Light Gray */
--color-text: #1f2937; /* Dark Gray */
```

### 设计原则

- <strong>风格</strong>: 扁平设计、极简
- <strong>构图</strong>: 中心聚焦、充足留白
- <strong>字体</strong>: Sans-serif、高可读性
- <strong>图标</strong>: 清晰简洁

## 各类型图片规格

### 1. Hero Image (博客顶部)

```yaml
分辨率: 1920x1080 (16:9)
格式: PNG → WebP 转换
文件大小: < 500KB
用途: 博客文章顶部、OG 图片
```

**构成要素**:

- 中心: 象征主题的图标/插画
- 背景: 渐变或纯色
- 文字: 标题覆盖空间
- 强调: 使用品牌色

### 2. Thumbnail (列表用)

```yaml
分辨率: 800x450 (16:9)
格式: WebP
文件大小: < 100KB
用途: 博客列表、相关文章
```

### 3. Social Media Share

```yaml
分辨率:
  - Twitter: 1200x675
  - LinkedIn: 1200x627
  - Facebook: 1200x630
格式: PNG
用途: SNS 分享时的缩略图
```

## 提示词生成流程

### Input: 博客主题

```typescript
interface ImageRequest {
  topic: string; // "提示工程"
  keywords: string[]; // ["LLM", "ChatGPT", "AI"]
  mood: "professional" | "playful" | "serious";
  type: "hero" | "thumbnail" | "social";
}
```

### Process: 提示词撰写

```markdown
## 图片生成提示词模板

Create a {type} image for a technical blog post about "{topic}".

**Style Requirements**:

- Aesthetic: Modern, minimalist, flat design
- Color Palette:
  - Primary: #3B82F6 (Blue)
  - Accent: #10B981 (Green)
  - Background: #F3F4F6 (Light Gray)
- Composition: Center-focused with generous white space

**Key Elements**:

1. Central icon representing {main_concept}
2. Supporting elements: {supporting_concepts}
3. Typography area for title overlay
4. High contrast for readability

**Technical Specs**:

- Resolution: {resolution}
- Format: PNG with transparency
- File size target: {size_limit}

**Mood**: {mood} - {mood_description}

**Reference**: Similar to Vercel, Stripe, Linear design aesthetics

**Avoid**: Cluttered layouts, too many colors, generic stock photo look
```

### Output: 生成及优化

```bash
# 1. 生成图片 (MCP 或外部 API)
generate_image(prompt) → raw_image.png

# 2. 优化
convert raw_image.png -resize 1920x1080 -quality 90 hero.png
cwebp -q 85 hero.png -o hero.webp

# 3. 响应式版本
convert hero.png -resize 800x450 hero-md.webp
convert hero.png -resize 400x225 hero-sm.webp
```

## 集成方法

### 方法 1: Gemini API (免费)

```typescript
// .env
GEMINI_API_KEY=your_api_key

// generate-image.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateImage(prompt: string, outputPath: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const result = await model.generateContent([prompt]);
  const image = result.response.image();

  await fs.writeFile(outputPath, image);
  console.log(`✓ 图片生成: ${outputPath}`);
}
```

### 方法 2: DALL-E 3 (付费、高质量)

```typescript
import OpenAI from "openai";

async function generateImage(prompt: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1792x1024",
    quality: "hd",
  });

  return response.data[0].url;
}
```

### 方法 3: Playwright + Ideogram (自动化)

```typescript
// Playwright 浏览器自动化
async function generateViaPlaywright(prompt: string) {
  await browser.navigate("https://ideogram.ai");
  await browser.fill("#prompt", prompt);
  await browser.click("#generate");

  // 等待生成完成
  await browser.waitForSelector(".generated-image");

  // 下载图片
  const imageUrl = await browser.evaluate(`
    document.querySelector('.generated-image').src
  `);

  return imageUrl;
}
```

## 使用示例

```bash
# 调用智能体
@image-generator "为提示工程博客生成 Hero 图片"

# 斜杠命令
/generate-image --topic "prompt engineering" --type hero --mood professional
```
```

#### Step 2: 图片生成脚本

`scripts/generate-image.ts`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp"; // 图片优化

interface ImageOptions {
  topic: string;
  keywords: string[];
  mood: "professional" | "playful" | "serious";
  type: "hero" | "thumbnail" | "social";
}

async function generateImagePrompt(options: ImageOptions): Promise<string> {
  const { topic, keywords, mood, type } = options;

  // 各类型规格
  const specs = {
    hero: { resolution: "1920x1080", size: "500KB" },
    thumbnail: { resolution: "800x450", size: "100KB" },
    social: { resolution: "1200x675", size: "200KB" },
  };

  const spec = specs[type];

  return `
Create a ${type} image for a technical blog post about "${topic}".

**Style Requirements**:
- Aesthetic: Modern, minimalist, flat design
- Color Palette:
  - Primary: #3B82F6 (Blue)
  - Accent: #10B981 (Green)
  - Background: #F3F4F6 (Light Gray)
- Composition: Center-focused with generous white space

**Key Elements**:
1. Central icon representing ${keywords[0]}
2. Supporting elements: ${keywords.slice(1).join(", ")}
3. Typography area for title overlay
4. High contrast for readability

**Technical Specs**:
- Resolution: ${spec.resolution}
- Mood: ${mood}

**Reference**: Vercel, Stripe design aesthetics
**Avoid**: Cluttered layouts, too many colors
  `.trim();
}

async function generateImage(
  options: ImageOptions,
  outputDir: string
): Promise<string> {
  // 1. 生成提示词
  const prompt = await generateImagePrompt(options);
  console.log("📝 提示词:", prompt);

  // 2. 调用 Gemini API
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  console.log("🎨 生成图片中...");
  const result = await model.generateContent([prompt]);

  // 3. 保存图片
  const imageBuffer = Buffer.from(result.response.image(), "base64");
  const filename = `${options.topic.replace(/\s+/g, "-")}-${options.type}.png`;
  const filepath = path.join(outputDir, filename);

  await fs.writeFile(filepath, imageBuffer);
  console.log(`✓ 保存原图: ${filepath}`);

  // 4. 优化及 WebP 转换
  const webpPath = filepath.replace(".png", ".webp");

  await sharp(filepath)
    .resize({
      width: parseInt(options.type === "hero" ? "1920" : "800"),
      height: parseInt(options.type === "hero" ? "1080" : "450"),
      fit: "cover",
    })
    .webp({ quality: 85 })
    .toFile(webpPath);

  console.log(`✓ WebP 转换: ${webpPath}`);

  // 5. 生成响应式版本 (仅 Hero)
  if (options.type === "hero") {
    const sizes = [
      { suffix: "md", width: 800 },
      { suffix: "sm", width: 400 },
    ];

    for (const size of sizes) {
      const responsivePath = webpPath.replace(".webp", `-${size.suffix}.webp`);
      await sharp(filepath)
        .resize({ width: size.width })
        .webp({ quality: 80 })
        .toFile(responsivePath);

      console.log(`✓ 响应式 (${size.suffix}): ${responsivePath}`);
    }
  }

  return webpPath;
}

// CLI 接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const topic = args[0];

  if (!topic) {
    console.error("Usage: ts-node generate-image.ts <topic>");
    process.exit(1);
  }

  generateImage(
    {
      topic,
      keywords: [topic, "AI", "automation"],
      mood: "professional",
      type: "hero",
    },
    "src/assets/blog"
  ).then((path) => {
    console.log(`\n🎉 完成! 图片: ${path}`);
  });
}
```

#### Step 3: 斜杠命令集成

`.claude/commands/generate-image.md`:

```markdown
# /generate-image 命令

## 目的

根据博客主题自动生成 Hero 图片。

## 用法

```
/generate-image --topic "<主题>" [选项]
```

## 选项

- `--type`: hero (默认), thumbnail, social
- `--mood`: professional (默认), playful, serious
- `--keywords`: 附加关键词 (逗号分隔)

## 执行流程

1. 调用 Image Generator 智能体
2. 生成优化的图片提示词
3. 通过 Gemini API 生成图片
4. WebP 转换及生成响应式版本
5. 返回文件路径

## 示例

```bash
/generate-image --topic "提示工程" --keywords "LLM,ChatGPT,Claude"
```

输出:

```
📝 提示词生成完成
🎨 图片生成中... (Gemini API)
✓ 保存原图: src/assets/blog/prompt-engineering-hero.png
✓ WebP 转换: src/assets/blog/prompt-engineering-hero.webp
✓ 响应式 (md): src/assets/blog/prompt-engineering-hero-md.webp
✓ 响应式 (sm): src/assets/blog/prompt-engineering-hero-sm.webp

🎉 完成! 路径: ../../../assets/blog/prompt-engineering-hero.webp
```

```
```

### 代码/示例 (Code)

#### 实际使用场景

```bash
# Writing Assistant 撰写文章后自动调用
/write-post "提示工程指南"

# 内部执行的流程:
# 1. Content Planner → 主题分析
# 2. Writing Assistant → 撰写草稿
# 3. Image Generator → 生成 Hero 图片 ← 这里!
# 4. Editor → 最终审核
```

**Image Generator 执行日志**:

```
🎨 Image Generator 启动

📋 输入信息:
  - 主题: 提示工程指南
  - 关键词: prompt engineering, LLM, ChatGPT, Claude
  - 类型: hero
  - 氛围: professional

📝 优化提示词中...

生成的提示词:
---
Create a hero image for a technical blog post about "prompt engineering".

**Style Requirements**:
- Modern, minimalist flat design
- Colors: #3B82F6 (Blue primary), #10B981 (Green accent)
- Center-focused composition with generous white space

**Key Elements**:
1. Central: Brain/AI icon with circuit patterns
2. Supporting: Code snippets, chat bubbles in background
3. Typography: Clean sans-serif title overlay area
4. Contrast: High readability, professional aesthetic

**Mood**: Professional, innovative, approachable
**Reference**: Vercel, Stripe design
---

🔄 调用 Gemini API... (预计时间: 10-15秒)
✓ 图片生成完成

📦 优化中...
  ✓ 1920x1080 调整大小
  ✓ WebP 转换 (85% 质量)
  ✓ 文件大小: 412KB (目标: 500KB 以下)

📱 生成响应式版本...
  ✓ Medium (800x450): 89KB
  ✓ Small (400x225): 28KB

💾 保存完成:
  - src/assets/blog/prompt-engineering-hero.webp
  - src/assets/blog/prompt-engineering-hero-md.webp
  - src/assets/blog/prompt-engineering-hero-sm.webp

🎉 总耗时: 18秒
```

#### Astro 中使用图片

```astro
---
// src/pages/blog/[...slug].astro
import { Image } from 'astro:assets';
import { getEntry } from 'astro:content';

const post = await getEntry('blog', Astro.params.slug);
const { heroImage } = post.data;

// heroImage: "../../../assets/blog/prompt-engineering-hero.webp"
---

<article>
  <!-- Hero 图片 (自动优化) -->
  <Image
    src={heroImage}
    alt={post.data.title}
    width={1920}
    height={1080}
    format="webp"
    loading="eager"
    decoding="async"
  />

  <!-- 正文 -->
  <Content />
</article>

<style>
  /* 响应式图片 */
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
</style>
```

### 说明 (Explanation)

#### 为什么自动化很重要?

1. <strong>节省时间</strong>: 30分钟 → 20秒

手动操作:

- 打开 Figma/Canva (1分钟)
- 选择模板 (3分钟)
- 布局文字/元素 (10分钟)
- 调整颜色 (5分钟)
- 导出及优化 (5分钟)
- 生成响应式版本 (6分钟)

自动化:

- 执行命令 (5秒)
- 生成图片 (15秒)

2. <strong>一致性</strong>: 自动应用品牌指南

所有图片遵循相同的色板、风格、构图。

3. <strong>优化</strong>: WebP 转换 + 自动生成响应式

SEO 和性能必备要素自动处理。

#### Sharp 库的作用

```typescript
// Sharp: Node.js 图片处理库
import sharp from "sharp";

// 1. 调整大小 + 裁剪
await sharp(input)
  .resize({ width: 1920, height: 1080, fit: "cover" })
  .toFile(output);

// 2. WebP 转换 (文件大小减少 30-50%)
await sharp(input).webp({ quality: 85 }).toFile(output);

// 3. 移除元数据 (进一步减小文件)
await sharp(input).withMetadata(false).toFile(output);
```

### 变体 (Variations)

#### 变体 1: 自动生成图表

用 Mermaid 生成代码架构图:

```markdown
## Diagram Generator

### 输入: 系统描述

```
"用户 → API Gateway → Lambda → DynamoDB"
```

### 输出: Mermaid 图表

````mermaid
flowchart TD
    A[用户] --> B[API Gateway]
    B --> C[Lambda]
    C --> D[DynamoDB]
````

### 自动渲染

用 Playwright 自动化 Mermaid Live Editor:

```typescript
await browser.navigate("https://mermaid.live");
await browser.fill("#code", mermaidCode);
await browser.screenshot({ selector: "#preview", path: "diagram.png" });
```

```
```

#### 变体 2: 生成 GIF/动画

自动生成演示用 GIF:

```typescript
// 用 Playwright 录制浏览器操作
const frames = [];

await browser.navigate("https://my-app.com");

for (let step of demoSteps) {
  await browser.click(step.selector);
  const screenshot = await browser.screenshot();
  frames.push(screenshot);
  await sleep(1000);
}

// 生成 GIF
await createGIF(frames, "demo.gif", { fps: 2, loop: true });
```

#### 变体 3: 社交媒体自动变体

将一张 Hero 图片转换为所有平台:

```typescript
const platforms = {
  twitter: { width: 1200, height: 675, format: "jpg" },
  linkedin: { width: 1200, height: 627, format: "png" },
  facebook: { width: 1200, height: 630, format: "jpg" },
  instagram: { width: 1080, height: 1080, format: "jpg" }, // 正方形
};

for (const [platform, specs] of Object.entries(platforms)) {
  await sharp(heroImage)
    .resize(specs.width, specs.height, { fit: "cover" })
    .toFormat(specs.format)
    .toFile(`social/${platform}-share.${specs.format}`);
}
```

---

## Recipe 8.4: Editor 自动审核系统

### 问题 (Problem)

撰写内容后审核阶段发现的问题:

- 拼写/语法错误
- 术语使用不一致
- SEO 元数据缺失
- 代码示例语法错误
- 链接失效

手动审核需要**1小时以上**,而且容易因人为失误遗漏。

### 解决方案 (Solution)

Editor 智能体自动验证以下内容:

1. **语法及风格**: 拼写、语气一致性、段落长度
2. **技术准确性**: 代码语法、库版本、API 签名
3. **SEO 优化**: 元数据、关键词密度、内部链接
4. **可访问性**: Alt 文本、标题层次、可读性

### 分步实施

#### Step 1: Editor 提示词

`.claude/agents/editor.md`:

```markdown
# Editor Agent

## 角色

你是一位有 10 年经验的技术编辑。在发布前最终审核博客文章。

## 审核检查清单

### 1. 语法及风格 (Grammar & Style)

#### 拼写检查

- [ ] 中文拼写 (空格、错字)
- [ ] 英语拼写 (技术术语)
- [ ] 一致表记 (例: "库" vs "library")

#### 语气一致性

- [ ] 礼貌语气一致性 ("请" vs "吧")
- [ ] 句子结尾一致性
- [ ] 保持专业性 (避免过多表情符号)

#### 可读性

- [ ] 平均句子长度 15-20 字
- [ ] 段落长度 3-5 句
- [ ] 长句建议分割

### 2. 技术准确性 (Technical Accuracy)

#### 代码验证

```typescript
// 对每个代码块:
async function validateCode(code: string, language: string) {
  // 1. 语法检查
  const syntaxErrors = await lintCode(code, language);

  // 2. 确认可执行性
  const runnable = await tryExecute(code);

  // 3. 注释充分性
  const commentRatio = countComments(code) / countLines(code);

  return {
    hasErrors: syntaxErrors.length > 0,
    isRunnable: runnable,
    wellDocumented: commentRatio >= 0.2, // 20% 以上注释
  };
}
```

#### 版本信息确认

- [ ] 明确库版本 ("React 18", "Node.js 20+")
- [ ] 使用最新 API (无废弃方法)
- [ ] 依赖兼容性

#### 外部链接验证

```typescript
// 确认所有链接有效性
async function validateLinks(markdown: string) {
  const links = extractLinks(markdown);

  for (const link of links) {
    const response = await fetch(link, { method: "HEAD" });
    if (response.status >= 400) {
      console.warn(`⚠️ 链接失效: ${link}`);
    }
  }
}
```

### 3. SEO 优化 (SEO Optimization)

#### 元数据验证

```yaml
title:
  - 长度: 50-60字 (推荐)
  - 包含关键词: 主要关键词靠前
  - 点击诱导: 数字、行动动词

description:
  - 长度: 150-160字
  - 行动导向语句 (CTA)
  - 核心价值主张

tags:
  - 数量: 5-8个
  - 相关性: 与主题直接相关
  - 多样性: 通用 + 具体关键词混合
```

#### 关键词密度

```typescript
// 检查主要关键词密度
function checkKeywordDensity(content: string, keywords: string[]) {
  const totalWords = content.split(/\s+/).length;

  for (const keyword of keywords) {
    const count = (content.match(new RegExp(keyword, "gi")) || []).length;
    const density = (count / totalWords) * 100;

    // 理想: 1-2%
    if (density < 0.5) {
      console.warn(`⚠️ "${keyword}" 密度低 (${density.toFixed(2)}%)`);
    } else if (density > 3) {
      console.warn(`⚠️ "${keyword}" 密度过高 (${density.toFixed(2)}%)`);
    }
  }
}
```

#### 内部链接

- [ ] 3-5 个相关文章链接
- [ ] Anchor 文本自然
- [ ] 链接符合语境

### 4. 可访问性 (Accessibility)

#### 图片 Alt 文本

```markdown
<!-- ✗ 坏示例 -->

![image](hero.png)

<!-- ✓ 好示例 -->

![Claude Code 智能体架构图: 展示用户、编排器、11 个专业智能体关系的流程图](hero.png)
```

#### 标题层次结构

```markdown
# H1 (每页仅 1 个)

## H2 (主要部分)

### H3 (子部分)

#### H4 (详细项目)

<!-- ✗ 错误的层次 -->

# H1

### H3 (跳过 H2)
```

#### 可读性评分

```typescript
// Flesch Reading Ease 计算
function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\s+/).length;
  const syllables = countSyllables(text);

  const score =
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

  // 60-70: 标准 (目标)
  // 70+: 容易
  // 50-: 困难
  return score;
}
```

## 审核流程

### Input: 完成的博客文章

```markdown
src/content/blog/ko/post-slug.md
```

### Process: 自动验证

```typescript
async function reviewPost(filepath: string) {
  const content = await readFile(filepath);
  const { frontmatter, body } = parseFrontmatter(content);

  const issues = [];

  // 1. Frontmatter 验证
  issues.push(...validateFrontmatter(frontmatter));

  // 2. 正文验证
  issues.push(...validateBody(body));

  // 3. 代码验证
  const codeBlocks = extractCodeBlocks(body);
  for (const block of codeBlocks) {
    issues.push(...(await validateCode(block.code, block.language)));
  }

  // 4. 链接验证
  issues.push(...(await validateLinks(body)));

  // 5. SEO 验证
  issues.push(...validateSEO(frontmatter, body));

  return issues;
}
```

### Output: 审核报告

```markdown
## 审核报告: prompt-engineering-guide.md

### ✅ 通过 (12/15)

- 拼写检查: 无错误
- 语气一致性: 礼貌语气一致
- 代码语法: 12 个块全部有效
- 链接验证: 8 个链接全部有效
- Title 长度: 58字 (最佳)

### ⚠️ 警告 (2)

1. <strong>关键词密度</strong>: "提示工程" 0.8% (推荐: 1-2%)

   - 建议: 正文中增加 2-3 次使用

2. <strong>内部链接</strong>: 仅发现 1 个相关文章链接 (推荐: 3-5 个)
   - 建议链接:
     - [Claude Code 入门](/blog/claude-code-getting-started)
     - [AI 智能体模式](/blog/ai-agent-patterns)

### ❌ 错误 (1)

1. <strong>图片 Alt 缺失</strong>: Line 45

   ```markdown
   当前: ![](example.png)
   修正: ![提示工程 Before/After 对比示例](example.png)
   ```

### 📊 统计

- 总字数: 3,105
- 平均句子长度: 17.8字 ✓
- 平均段落长度: 4.2句 ✓
- 可读性评分: 65 (标准) ✓
- 预计阅读时间: 12分钟

### 🎯 行动项

1. 添加 Alt 文本 (必须)
2. 增加关键词 2 次 (推荐)
3. 添加内部链接 2 个 (推荐)
```

## 使用示例

```bash
# 调用智能体
@editor "审核 src/content/blog/ko/prompt-engineering-guide.md"

# 斜杠命令
/review src/content/blog/ko/prompt-engineering-guide.md --auto-fix
```
```

#### Step 2: 自动修复脚本

`scripts/auto-fix.ts`:

```typescript
import fs from "fs/promises";
import matter from "gray-matter";

interface ReviewIssue {
  type: "error" | "warning" | "info";
  category: string;
  line?: number;
  message: string;
  suggestion?: string;
  autoFixable: boolean;
}

async function autoFix(filepath: string, issues: ReviewIssue[]) {
  let content = await fs.readFile(filepath, "utf-8");
  const { data: frontmatter, content: body } = matter(content);

  let fixed = 0;

  for (const issue of issues) {
    if (!issue.autoFixable) continue;

    switch (issue.category) {
      case "alt-text-missing":
        // ![](image.png) → ![说明](image.png)
        content = content.replace(
          /!\[\]\((.*?)\)/g,
          (match, url) => {
            const filename = url.split("/").pop().replace(/\.[^.]+$/, "");
            const alt = filename.replace(/-/g, " ");
            return `![${alt}](${url})`;
          }
        );
        fixed++;
        break;

      case "title-too-long":
        // Title 60字限制
        if (frontmatter.title.length > 60) {
          frontmatter.title = frontmatter.title.substring(0, 57) + "...";
          fixed++;
        }
        break;

      case "description-too-short":
        // Description 最少 120字
        if (frontmatter.description.length < 120) {
          console.warn(
            "⚠️ Description too short - manual fix recommended"
          );
        }
        break;

      case "keyword-density-low":
        // 自动插入关键词 (谨慎)
        // 过于激进会看起来像垃圾邮件
        console.warn("⚠️ Keyword density - manual review recommended");
        break;
    }
  }

  // 保存修改内容
  const newContent = matter.stringify(body, frontmatter);
  await fs.writeFile(filepath, newContent);

  return fixed;
}
```

#### Step 3: 斜杠命令

`.claude/commands/review.md`:

```markdown
# /review 命令

## 目的

自动审核博客文章并提供改进建议。

## 用法

```
/review <文件路径> [选项]
```

## 选项

- `--auto-fix`: 立即修复可自动修复的项目
- `--strict`: 严格模式 (警告也视为错误)
- `--report`: 生成详细报告文件

## 执行流程

1. 调用 Editor 智能体
2. 执行 15 项验证
3. 分类问题 (错误 / 警告 / 信息)
4. 修复可自动修复的项目
5. 生成审核报告

## 示例

```bash
/review src/content/blog/ko/my-post.md --auto-fix --report
```

输出:

```
🔍 审核开始: my-post.md

✅ 自动检查 (15/15 完成)
  ✓ 拼写 (0 错误)
  ✓ 语气一致性 (OK)
  ✓ 代码语法 (8 块验证)
  ⚠️ Alt 文本 (3 个缺失)
  ⚠️ 关键词密度 (低)

🔧 自动修复 (3/5)
  ✓ 添加 Alt 文本 3 个
  ✓ 调整 Title 长度
  ✓ 修正标题层次

⚠️ 需手动审核 (2)
  - 调整关键词密度
  - 添加内部链接

📄 详细报告: reviews/my-post-review.md

📊 最终评分: 87/100 (Good)
```

```
```

### 代码/示例 (Code)

#### 集成工作流: /write-post 完整流程

所有智能体协同工作的完全自动化场景:

```bash
/write-post "LLM 提示工程实战指南"
```

**执行过程**:

```
🚀 博客自动化启动

[1/6] Content Planner
  🔍 分析趋势中... (Context7)
  📊 竞品分析中... (Playwright)
  ✓ 生成 5 个主题推荐
  ✓ 撰写详细大纲完成

  📄 生成: drafts/outline-prompt-engineering.md

[2/6] Writing Assistant
  📝 撰写草稿中...
  ✓ 引言 (285字)
  ✓ 正文 5 节 (2,400字)
  ✓ 结论 (310字)
  ✓ 生成 SEO 元数据

  📄 生成: src/content/blog/ko/prompt-engineering-guide.md

[3/6] Image Generator
  🎨 生成 Hero 图片中...
  ✓ 优化提示词
  ✓ 调用 Gemini API
  ✓ WebP 转换 (412KB)
  ✓ 响应式版本 (md, sm)

  🖼️ 生成: src/assets/blog/prompt-engineering-hero.webp

[4/6] Editor
  🔍 审核中...
  ✓ 语法检查 (0 错误)
  ✓ 代码验证 (12 块)
  ⚠️ 需添加 Alt 文本 3 个
  ⚠️ 建议调整关键词密度

  🔧 自动修复 (3 项)
  📄 报告: reviews/prompt-engineering-review.md

[5/6] SEO Optimizer
  🔍 SEO 优化中...
  ✓ 元数据验证
  ✓ 调整关键词密度 (1.2% → 1.8%)
  ✓ 添加内部链接 3 个
  ✓ 更新 Sitemap

[6/6] Build & Deploy
  🏗️ 构建中...
  ✓ npm run astro check (通过)
  ✓ npm run build (成功)
  ✓ 性能评分: 98/100

🎉 完成!

📊 总结:
  - 总耗时: 3分 42秒
  - 生成的文件: 4 个
  - 字数: 3,105
  - 质量评分: 92/100

🔗 预览: http://localhost:4321/blog/prompt-engineering-guide

下一步:
  1. 确认预览
  2. 处理 2 个手动审核项
  3. 用 /deploy 部署
```

### 说明 (Explanation)

#### 为什么需要自动审核?

1. <strong>人会犯错</strong>

```
手动审核易遗漏:
- 链接失效 (不点击就不知道)
- 关键词密度 (难以直观判断)
- 可读性评分 (主观评估)
- 代码语法错误 (复制粘贴失误)
```

2. <strong>保持一致性</strong>

```
自动化样式指南:
- 防止礼貌/非礼貌混用
- 统一术语表记 ("数据库" vs "DB")
- 均衡段落长度
```

3. <strong>SEO 优化</strong>

```
搜索引擎喜欢的结构:
- 适当的关键词密度 (1-2%)
- 遵守标题层次 (H1 → H2 → H3)
- 内部链接网络
- 元数据优化
```

#### 审核流程详解

```typescript
// 1. 语法检查
async function grammarCheck(text: string): Promise<Issue[]> {
  // 调用拼写检查 API
  const response = await fetch("https://api.grammar.com/check", {
    method: "POST",
    body: JSON.stringify({ text, language: "ko" }),
  });

  return response.json();
}

// 2. 代码验证
async function validateCode(
  code: string,
  language: string
): Promise<Issue[]> {
  const issues = [];

  // 语法检查 (ESLint, TypeScript 等)
  if (language === "typescript" || language === "javascript") {
    const lintResults = await eslint.lintText(code);
    issues.push(...lintResults);
  }

  // 确认可执行性
  try {
    eval(code); // 注意: 仅在沙箱环境
  } catch (error) {
    issues.push({ type: "error", message: `Runtime error: ${error}` });
  }

  return issues;
}

// 3. SEO 验证
function validateSEO(frontmatter: any, body: string): Issue[] {
  const issues = [];

  // Title 长度
  if (frontmatter.title.length > 60) {
    issues.push({
      type: "warning",
      category: "seo",
      message: `Title too long (${frontmatter.title.length} chars)`,
      suggestion: "Keep under 60 characters",
    });
  }

  // Description 长度
  if (
    frontmatter.description.length < 120 ||
    frontmatter.description.length > 160
  ) {
    issues.push({
      type: "warning",
      category: "seo",
      message: "Description should be 120-160 characters",
    });
  }

  // 关键词密度
  const keywords = frontmatter.tags || [];
  for (const keyword of keywords) {
    const density = calculateKeywordDensity(body, keyword);
    if (density < 0.5 || density > 3) {
      issues.push({
        type: "info",
        category: "seo",
        message: `Keyword "${keyword}" density: ${density.toFixed(2)}% (optimal: 1-2%)`,
      });
    }
  }

  return issues;
}
```

### 变体 (Variations)

#### 变体 1: 实时审核 (IDE 集成)

VSCode 扩展提供实时反馈:

```typescript
// VSCode Extension
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // 保存文件时自动审核
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (document.fileName.endsWith(".md")) {
      const issues = await reviewPost(document.fileName);

      // 显示内联警告
      const diagnostics = issues.map((issue) => ({
        range: new vscode.Range(issue.line, 0, issue.line, 100),
        message: issue.message,
        severity: vscode.DiagnosticSeverity.Warning,
      }));

      diagnosticCollection.set(document.uri, diagnostics);
    }
  });
}
```

#### 变体 2: 多语言审核

按语言定制验证:

```markdown
## 多语言 Editor

### 中文验证

- 拼写: 新华词典 API
- 空格: 中文规范规则
- 礼貌语气一致性

### 英语验证

- Grammar: Grammarly API
- Readability: Hemingway Score
- 主动语态 vs 被动语态

### 日语验证

- 语法: MeCab 形态素分析
- 敬语一致性
- 汉字使用适当性
```

#### 变体 3: A/B 测试自动化

对比两个版本并选择最佳:

```typescript
// Title A/B 测试
const titleVariants = [
  "LLM 提示工程实战指南",
  "让 ChatGPT 提升 10 倍智能的 5 个提示技巧",
  "提示工程完全指南 - 初学者也能跟上的",
];

async function selectBestTitle(variants: string[]) {
  const scores = await Promise.all(
    variants.map(async (title) => {
      // 1. SEO 评分
      const seoScore = calculateSEOScore(title);

      // 2. 点击率预测 (ML 模型)
      const ctrPrediction = await predictCTR(title);

      // 3. 情感分析
      const sentimentScore = analyzeSentiment(title);

      return {
        title,
        totalScore: seoScore * 0.4 + ctrPrediction * 0.4 + sentimentScore * 0.2,
      };
    })
  );

  return scores.sort((a, b) => b.totalScore - a.totalScore)[0];
}
```

---

## 结语: 内容自动化的未来

### 核心总结

本章构建的 4 个核心智能体:

1. <strong>Content Planner</strong>: 基于数据的主题发掘 (趋势 + 竞争分析)
2. <strong>Writing Assistant</strong>: 一致质量的内容生成 (3000字/1分钟)
3. <strong>Image Generator</strong>: 保持品牌识别的图片自动生成 (20秒)
4. <strong>Editor</strong>: 15 项自动验证及修复

### 可测量的成果

```
传统工作流:
  - 创意构思: 30分钟
  - 资料调研: 1-2小时
  - 撰写草稿: 2-3小时
  - 制作图片: 1小时
  - 编辑校对: 1小时
  - SEO 优化: 30分钟
  总计: 6-8小时

自动化工作流:
  - 执行 /write-post: 5秒
  - 智能体自动工作: 3-4分钟
  - 手动审核: 20分钟
  总计: 25分钟

节省时间: 93% ⏱️
```

### 下一步

1. <strong>实践</strong>: 在你的项目中逐个添加智能体

   ```bash
   # 从最简单的开始
   1. Writing Assistant (Chapter 8.2)
   2. Content Planner (Chapter 8.1)
   3. Image Generator (Chapter 8.3)
   4. Editor (Chapter 8.4)
   ```

2. <strong>定制</strong>: 反映你的样式指南

   ```markdown
   # 修改 .claude/agents/writing-assistant.md

   ## 我们博客的语气

   - 表情符号使用: 每节仅 1-2 个
   - 代码示例: 始终使用 TypeScript
   - 句子长度: 平均 15 字 (重视简洁)
   ```

3. <strong>扩展</strong>: Chapter 9 学习更高级技巧
   - 多智能体编排
   - 智能体间协作模式
   - 性能优化及成本降低

### 实践任务

今天就可以开始的 3 件事:

1. <strong>构建 Writing Assistant</strong> (30分钟)

   - 创建 `.claude/agents/writing-assistant.md`
   - 定义你的写作风格
   - 测试首个文章自动生成

2. <strong>文档化样式指南</strong> (20分钟)

   - 分析现有博客文章 3 篇
   - 提取共同模式 (语气、结构、示例比例)
   - 撰写指南文档

3. <strong>测量自动化</strong> (10分钟)
   - 记录手动工作所需时间
   - 对比自动化后的时间
   - 追踪改进指标

### 最后建议

> "不要等待完美的自动化。从小处开始,逐步改进。"

第一个自动化的博客文章可能只有 80 分。但随着提示词的改进,会提升到 90 分、95 分。重要的是<strong>开始</strong>。

下一章将学习编排多个智能体的编排模式。了解如何用单个命令让 10 个智能体协作构建完整博客网站。

**祝你的内容自动化之旅成功!** 🚀

---

**下一章预告**: Chapter 9 - 多智能体编排
