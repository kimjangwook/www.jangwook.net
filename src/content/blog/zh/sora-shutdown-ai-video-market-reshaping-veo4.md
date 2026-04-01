---
title: Sora关停与AI视频市场的急剧重塑 — Google Veo 4瞄准空白
description: >-
  OpenAI宣布关停Sora应用。日亏100万美元、用户跌破50万的全貌，以及Google Veo
  4即将发布、Runway·Kling的崛起如何重塑AI视频市场， 从实战工作流角度进行分析。
pubDate: '2026-04-01'
heroImage: ../../../assets/blog/sora-shutdown-ai-video-market-reshaping-veo4-hero.jpg
tags:
  - ai-video
  - sora
  - google-veo
  - content-creation
  - workflow
relatedPosts:
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: multi-agent-swe-bench-verdent
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: openai-agentkit-tutorial-part1
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-presentation-automation
    score: 0.93
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

OpenAI将于4月26日关停Sora应用。API将维持到9月24日，但这实际上已是撤退宣言。

说实话，看到这个消息我的第一反应是"果然如此"。Sora首次公开时的demo视频确实令人震惊，但实际使用起来完全是另一回事。生成时间长，要获得满意的结果需要太多试错。更关键的是，月费$20的订阅很难生成令人满意质量的视频。

## 日亏100万美元的真相

据TechCrunch报道，Sora在高峰期付费用户也未超过50万。日运营成本约100万美元，仅GPU基础设施成本就难以为继。

有趣的是OpenAI的战略转向。他们从消费者视频生成领域撤出，转而专注于企业级编程代理（Codex）。配合GPT-5.4的发布，向"平台型公司"的转型正在加速。

我个人认为这是合理的判断。AI视频生成距离成为独立"产品"还为时尚早。任何人都能用一行文字制作电影级视频的愿景很吸引人，但现实是：提示词工程30分钟、生成5分钟、修改又30分钟。

## Google Veo 4瞄准空白

时机很微妙。就在Sora宣布关停之后，有传言称Google DeepMind将在I/O 2026前后发布Veo 4。NotebookLM的Video Overview功能已搭载Veo 3，质量相当不错。

当前AI视频生成工具的格局如下：

| 工具 | 状态 | 优势 | 劣势 |
|------|------|------|------|
| Sora | 4/26应用关停，9/24 API关停 | 高视频质量 | 生成慢、成本高 |
| Google Veo 3/4 | Veo 3运行中，Veo 4即将发布 | Google生态整合、NotebookLM联动 | 尚无独立应用 |
| Runway Gen-4 | 运行中 | 编辑器整合、精细控制 | 价格昂贵 |
| Kling 2.0 | 运行中 | 性价比高、生成快 | 质量波动大 |
| Pika 2.5 | 运行中 | 易用性 | 长视频能力弱 |

## "产品 vs 功能" — Sora失败的结构性原因

很难简单地用"技术不够"来解释Sora的失败。技术本身令人印象深刻。问题在于商业模式。

AI视频生成作为**集成到现有工作流中的功能**，其价值远大于作为独立产品。NotebookLM将Video Overview作为"功能"嵌入，Runway在视频编辑工具中包含AI生成，都是这个方向的例证。

而Sora则是将"文本→视频"这个单一功能作为独立应用提供。这就像只为"AI图像生成"构建一个独立应用一样——对比DALL-E通过集成到ChatGPT中获得成功。Sora没有深度集成到ChatGPT中而是保持独立，最终在用户留存上失败了。

不过这种分析也有局限。Runway同样是独立应用但运营良好。差别在于Runway将AI融入了视频编辑这个明确的工作流中。

## 从Sora迁移的开发者/创作者工作流

如果你在使用Sora API，需要在9月前完成迁移。我推荐的替代方案因用途而异：

**技术内容制作（博客→视频）**
- NotebookLM Video Overview + Gemini TTS自动生成
- Remotion添加品牌片头/片尾
- 这个组合不需要专门的视频生成AI也能产出相当不错的成果

**营销/广告视频**
- Runway Gen-4目前最稳定
- 需要精细帧控制时的唯一选择

**社交媒体短视频**
- Kling 2.0性价比最高
- 15秒以下的片段质量完全足够

```bash
# NotebookLM + Remotion 工作流示例
# 1. 通过NotebookLM生成视频
nlm studio_create --notebook-id $NB_ID --artifact-type video

# 2. 等待生成完成
nlm studio_status --notebook-id $NB_ID --artifact-id $ART_ID

# 3. 下载后用Remotion合成片头/片尾
nlm download_artifact --notebook-id $NB_ID --artifact-id $ART_ID
npx remotion render src/index.ts MainVideo --props='{"videoPath":"./downloaded.mp4"}'
```

## 未来6个月的看点

坦率地说，AI视频市场仍处于早期阶段，预测赢家为时尚早。但有几个确定的趋势：

1. **集成胜于独立**：嵌入现有平台的AI视频功能比独立应用更能存活
2. **实时生成是关键**：等5分钟才能得到一个视频的体验难以实现大众化
3. **Google的有利位置**：YouTube + NotebookLM + Veo的垂直整合非常强大

我并不期望Veo 4会成为颠覆者。但Google显然处于最能快速填补Sora空白的位置。特别是NotebookLM已经提供Video Overview，这意味着Google无需发布独立应用就能自然地吸收现有用户。

如果你正在生产环境中使用AI视频生成工具，现在的明智之举是**标准化输出格式，构建易于更换工具的管道**，而不是把所有筹码押在某个特定供应商上。正如Sora的案例所示，没人知道这个市场中哪个工具能活到明年。
