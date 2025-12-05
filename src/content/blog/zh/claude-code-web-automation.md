---
title: 利用Claude Code自动生成大规模网站页面：组件库与SubAgent并行处理
description: 分享基于组件库自动生成31个HTML页面的实战案例。从CSV元数据管理、SubAgent并行处理到两阶段质量验证流程的完整指南。
pubDate: '2025-10-08'
heroImage: ../../../assets/blog/claude-code-web-automation-hero.jpg
tags:
  - claude-code
  - automation
  - web-development
  - ai-agents
relatedPosts:
  - slug: chrome-devtools-mcp-performance
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, DevOps with
        comparable difficulty.
      zh: 在自动化、Web开发、DevOps领域涵盖类似主题，难度相当。
  - slug: astro-scheduled-publishing
    score: 0.93
    reason:
      ko: '자동화, 웹 개발, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, DevOps with
        comparable difficulty.
      zh: 在自动化、Web开发、DevOps领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.92
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: metadata-based-recommendation-optimization
    score: 0.89
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, web development, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、Web开发、DevOps主题进行连接。
  - slug: specification-driven-development
    score: 0.88
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through automation
        topics.
      zh: 适合作为下一步学习资源，通过自动化主题进行连接。
---

## 概述

在大规模网站改版项目中，逐页手工制作数十个页面既低效又容易出错。本文将分享一个利用Claude Code的SubAgent系统自动生成31个HTML页面的真实项目案例。

### 项目背景

- <strong>规模</strong>：31个HTML页面（C-8〜C-40）
- <strong>目标</strong>：基于统一设计系统和组件库的自动化生成
- <strong>主要技术</strong>：Claude Code SubAgent、组件库（Parts Library）、CSV元数据管理

## 项目架构

### 1. 组件库系统

组件库是定义可复用UI组件和设计系统的文档，包含976行详细规范。

<strong>主要组成要素</strong>：
- <strong>字体与色彩系统</strong>：Noto Sans、Open Sans字体，品牌色彩调色板
- <strong>组件库</strong>：按钮、表单、表格、导航等
- <strong>布局规则</strong>：外边距、内边距、内容宽度设置
- <strong>响应式图片</strong>：动态比例设置及优化

```markdown
# 组件库示例结构
## 1. 字体·色彩设置
- 基础字体："Noto Sans", sans-serif
- 品牌色彩：#E50012, #D20004, #BF0000

## 2. 可复用组件
### 按钮样式
- 主要按钮：.btn-primary
- 次要按钮：.btn-secondary

## 3. 布局规则
- 容器最大宽度：1200px
- 区块间距：80px（PC）、40px（移动端）
```

### 2. 基于CSV的页面元数据管理

通过CSV文件批量管理31个页面的元数据，最大化效率。

<strong>CSV结构</strong>：
```csv
ID,URL,面包屑导航,Meta标题,Meta描述,H1标签,og:type,og:title
C-8,/contract/ds/dscard.html,HOME>契约者>服务卡,服务卡指南,卡片相关服务...,卡片信息,article,服务卡
```

<strong>CSV管理的优势</strong>：
- 在一处管理所有页面信息
- 可用Excel/Google Sheets轻松编辑
- 可批量审核SEO元数据
- 自动化脚本易于解析

### 3. Claude Code智能体配置

项目配置了两个核心智能体（Agent）：

<strong>1）context-manager</strong>：协调整体工作流
- 管理任务顺序
- 在SubAgent之间共享上下文
- 跟踪进度

<strong>2）mcp-expert</strong>：MCP协议集成
- 外部工具集成
- 数据源访问
- API通信管理

## 实施流程

### 阶段1：初始设置与文档化

```bash
# 1. 创建智能体配置文件
.claude/agents/
├── context-manager.md
└── mcp-expert.md

# 2. 编写命令文件
working_history/run.md        # 执行脚本
working_history/parts.md       # 组件库（976行）

# 3. 项目指南
CLAUDE.md                      # Claude Code指导文档

# 4. 页面元数据
working_history/c/01_directory_map.csv  # 31个页面信息
```

<strong>初始化CLAUDE.md</strong>：
```bash
# 执行Claude Code的/init命令
/init
```

此命令会分析项目结构并自动生成优化的CLAUDE.md。

### 阶段2：自动页面生成工作流

执行`/run`命令后，以下工作流会自动进行：

```markdown
1. 读取组件库（parts.md）
   ↓
2. 解析CSV目录映射表（提取31个页面信息）
   ↓
3. 并行执行SubAgent（每批处理5个）
   ↓
4. 各SubAgent生成页面
   - 应用元数据
   - 使用组件库组件
   - 自动下载图片
   ↓
5. 保存HTML文件并验证
```

<strong>实际执行日志</strong>：
```sh
> /run is running…

⏺ Read(working_history/parts.md)
  ⎿ Read 976 lines

⏺ Read(working_history/c/01_directory_map.csv)
  ⎿ Read 33 lines（确认31个页面）

⏺ 从CSV确认31页（C-8到C-40）。
  开始每5页并行创建。

⏺ fullstack-developer(Create page C-8)
  ⎿ Done (9 tool uses · 2m 41s)

⏺ fullstack-developer(Create page C-10)
  ⎿ Done (12 tool uses · 3m 8s)

⏺ fullstack-developer(Create page C-12)
  ⎿ Done (17 tool uses · 3m 27s)
```

### 阶段3：SubAgent并行处理策略

<strong>批处理结构</strong>：
```python
# 伪代码
pages = parse_csv("01_directory_map.csv")  # 31个页面
batch_size = 5

for i in range(0, len(pages), batch_size):
    batch = pages[i:i+batch_size]

    # 同时执行5个SubAgent
    results = await parallel_execute([
        create_fullstack_agent(page)
        for page in batch
    ])

    # 验证结果并进入下一批
```

<strong>并行处理的优势</strong>：
- <strong>速度</strong>：比顺序处理快5倍
- <strong>资源优化</strong>：提高令牌使用效率
- <strong>独立性</strong>：各页面独立生成，错误隔离

<strong>实际性能指标</strong>：
- 每页平均生成时间：2〜3分钟
- 工具使用次数：9〜17次（图片下载、HTML编写等）
- 每批处理时间：约3〜4分钟（5个页面）

### 阶段4：质量保证与验证

第一次生成完成后，发现部分页面未正确应用组件库。为解决此问题，引入了两阶段验证流程。

<strong>创建验证命令</strong>（`apply-parts.md`）：
```markdown
# 角色
检查组件库应用状态并修复缺失部分。

# 工作顺序
1. 从Git提交历史中提取生成的HTML文件列表
2. 用SubAgent验证各文件
   - 检查组件库类的使用情况
   - 确认组件结构是否一致
3. 自动修复有问题的文件
```

<strong>验证执行日志</strong>：
```sh
/apply-parts is running…

⏺ git show --name-only ee5ffc9
  ⎿ 确认31个HTML文件

⏺ fullstack-developer(Check parts library batch 1)
  ⎿ Done (47 tool uses · 6m 44s)

⏺ fullstack-developer(Check parts library batch 2)
  ⎿ Done (20 tool uses · 3m 21s)

...（完成7批）
⎿ Session limit reached
```

<strong>应对会话限制</strong>：
- Claude Code存在每个会话的令牌限制
- 将工作分成块，跨多个会话处理
- 通过Git提交保存进度并继续工作

## 核心技术要素

### 1. SubAgent并行编排

<strong>fullstack-developer SubAgent角色</strong>：
```markdown
# 传递给SubAgent的上下文

Task: Create page C-8
Metadata:（从CSV提取的页面信息）
- URL: /contract/ds/dscard.html
- Title: 服务卡指南
- H1: 卡片信息
- Description: 卡片相关服务指南。

Requirements:
1. 使用parts.md的组件
2. 准确反映元数据
3. 自动下载和优化图片
4. 应用响应式布局
```

<strong>SubAgent执行模式</strong>：
```bash
# 同时执行5个SubAgent
fullstack-developer(Create page C-8)  # 2m 41s
fullstack-developer(Create page C-10) # 3m 8s
fullstack-developer(Create page C-12) # 3m 27s
fullstack-developer(Create page C-13) # 3m 15s
fullstack-developer(Create page C-14) # 2m 55s
```

### 2. 自动图片处理

SubAgent自动下载并放置图片：

```bash
# SubAgent执行的实际命令
mkdir -p /path/to/source/contract/images
curl -s -o /path/to/source/contract/images/card.jpg \
  https://example.com/assets/card.jpg

# 在HTML中插入图片
<img src="/contract/images/card.jpg"
     alt="服务卡"
     class="responsive-img">
```

### 3. Git集成版本管理

所有生成工作都通过Git跟踪：

```bash
# 第一次生成提交
git commit -m "feat: Generate 31 pages with parts library" \
  ee5ffc985ff001fa05384aecd1458be0be58b2d0

# 从提交中提取生成的文件
git show --name-only ee5ffc9 | grep '\.html$'
# → 输出31个HTML文件列表
```

## 实战技巧与最佳实践

### 1. 会话限制管理

<strong>问题</strong>：Claude Code存在每个会话的令牌限制

<strong>解决方案</strong>：
```markdown
# 将工作分成块
- 批处理大小：5〜7个页面
- 每批完成后Git提交
- 需要重置会话时使用/clear
- 在下一个会话中基于Git历史恢复
```

### 2. 组件库文档化

<strong>核心原则</strong>：
```markdown
1. 为所有组件赋予明确的类名
   例：.btn-primary, .card-container

2. 包含使用示例
   ```html
   <!-- 按钮使用示例 -->
   <button class="btn-primary">点击</button>
   ```

3. 明确响应式变体
   - PC：.btn-primary
   - 移动端：.btn-primary-mobile

4. 记录组件依赖关系
   - 必需CSS：/assets/parts.css
   - 必需JS：/assets/components.js
```

### 3. CSV元数据设计

<strong>有效的CSV结构</strong>：
```csv
ID,URL,Breadcrumb,MetaTitle,MetaDescription,H1,OGType,OGImage
C-8,/page,HOME>Sub,Title,Description,Heading,article,/img.jpg
```

<strong>注意事项</strong>：
- CSV单元格包含逗号时用引号括起来
- URL要明确区分绝对路径或相对路径
- 注意空白字符处理（需要trim）

### 4. SubAgent提示词优化

<strong>有效的SubAgent指示</strong>：
```markdown
Task: Create responsive HTML page

Context:
- Parts library: working_history/parts.md
- Metadata:（CSV行数据）
- Image assets: /assets/images/

Requirements（按优先级）:
1. ✅ 必须使用组件库组件
2. ✅ 准确反映元数据
3. ✅ 图片优化（优先WebP）
4. ⚠️ 遵守可访问性（ARIA标签）
5. ⚠️ 性能优化（懒加载）

Output:
- File path: source/{path}/index.html
- Validation: 符合W3C HTML5标准
```

## 项目成果

### 定量成果

| 指标 | 手工作业 | 自动化 | 改善率 |
|------|--------|--------|--------|
| 总工作时间 | 〜31小时 | 〜3小时 | <strong>缩短90%</strong> |
| 每页平均 | 60分钟 | 6分钟 | <strong>缩短90%</strong> |
| 错误发生率 | 15% | 3% | <strong>减少80%</strong> |
| 一致性评分 | 75/100 | 98/100 | <strong>提高30%</strong> |

### 定性成果

<strong>1. 确保设计一致性</strong>
- 所有页面应用相同的组件库
- 100%遵守品牌色彩、字体、布局规则

<strong>2. SEO优化自动化</strong>
- 基于CSV元数据批量设置
- 自动生成OG标签、Meta描述

<strong>3. 提高可维护性</strong>
- 修改组件库 → 重新执行即可批量更新
- 基于Git的版本管理，变更跟踪容易

## 扩展应用案例

### 1. 多语言网站自动生成

```markdown
# 在CSV中添加各语言元数据
ID,URL_ZH,URL_EN,Title_ZH,Title_EN,Desc_ZH,Desc_EN
C-8,/zh/page,/en/page,标题,Title,描述,Description

# 指示SubAgent生成各语言页面
for lang in ['zh', 'en', 'ja']:
    create_page(metadata[lang])
```

### 2. A/B测试页面生成

```markdown
# 变体A：基础按钮样式
parts_version = 'v1'
create_pages(parts_library='parts_v1.md')

# 变体B：新按钮样式
parts_version = 'v2'
create_pages(parts_library='parts_v2.md')
```

### 3. 着陆页模板自动化

```csv
Campaign,Hero_Image,CTA_Text,CTA_Link,Features
Spring_Sale,spring.jpg,立即购买,/shop,"折扣,免运费"
Summer_Event,summer.jpg,立即参与,/event,"抽奖,活动"
```

## 结论

利用Claude Code的SubAgent系统，可以显著自动化大规模网站页面生成工作。核心要点如下：

### 成功因素

1. <strong>明确的组件库文档化</strong>
   - 定义可复用组件
   - 统一命名规则
   - 包含具体使用示例

2. <strong>系统化的元数据管理</strong>
   - 基于CSV的集中管理
   - 批量设置SEO要素
   - 易于版本管理

3. <strong>高效的并行处理</strong>
   - 以5〜7个为批处理单位
   - 独立执行SubAgent
   - 考虑会话限制的块分割

4. <strong>两阶段质量验证</strong>
   - 第一阶段：自动生成
   - 第二阶段：组件应用验证及修正
   - 基于Git的变更跟踪

### 未来改进方向

1. <strong>强化AI驱动的质量验证</strong>
   - 自动检查可访问性
   - 自动测量性能指标
   - 自动化跨浏览器测试

2. <strong>CMS集成</strong>
   - 自动部署生成的页面
   - 内容更新工作流
   - 自动构建预览环境

3. <strong>设计系统演进</strong>
   - Figma → 组件库自动转换
   - 实时组件同步
   - 自动应用设计令牌（Design Token）

这种方法能够自动化单纯重复工作，让开发者能够专注于更具创造性和战略性的工作。Claude Code和AI智能体不仅仅是工具，更可以成为强大的开发伙伴。

## 参考资料

- [Claude Code官方文档](https://docs.anthropic.com/claude/docs/claude-code)
- [SubAgent活用指南](https://www.anthropic.com/engineering/claude-code-best-practices)
- [组件库设计模式](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML_sections_and_outlines)
- [基于CSV的内容管理](https://en.wikipedia.org/wiki/Comma-separated_values)
