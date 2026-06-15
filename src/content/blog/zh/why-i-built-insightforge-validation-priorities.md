---
title: '为什么我把InsightForge做成验证优先级工具'
description: '这是一篇构建记录，说明为什么InsightForge不是市场预测工具，而是验证优先级工作流。内容涵盖LLM synthetic panel的局限性、directional score设计思路、auditable workflow架构，以及如何把模糊的市场不确定性转化为可与真实用户验证的具体假设和问题。'
pubDate: '2026-06-15'
heroImage: ../../../assets/blog/llm-consumer-research-hero.jpg
tags: [ai, startup, product-research, insightforge, synthetic-panel]
relatedPosts:
  - slug: 'ai-agent-persona-analysis'
    score: 0.91
    reason:
      ko: 'AI persona 분석과 synthetic panel의 한계를 함께 이해할 수 있습니다.'
      ja: 'AI persona分析とsynthetic panelの限界を合わせて理解できます。'
      en: 'It connects AI persona analysis with the limits of synthetic panels.'
      zh: '可以把AI persona分析和synthetic panel的限制一起理解。'
  - slug: 'dena-llm-study-part2-structured-output'
    score: 0.84
    reason:
      ko: 'LLM 출력을 제품 기능으로 만들 때 왜 구조화가 필요한지 이어서 볼 수 있습니다.'
      ja: 'LLM出力を製品機能にする時、なぜ構造化が必要なのかを続けて読めます。'
      en: 'It explains why structured output matters when LLM results become product features.'
      zh: '说明了为什么把LLM输出产品化时需要结构化。'
  - slug: 'iterative-review-cycle-methodology'
    score: 0.8
    reason:
      ko: '반복 리뷰와 게이트를 통해 품질을 올리는 방법론이 이어집니다.'
      ja: '反復レビューとゲートで品質を上げる方法論につながります。'
      en: 'It extends the discussion into iterative review and quality gates.'
      zh: '延伸到通过迭代审查和质量门提升质量的方法。'
  - slug: 'self-healing-ai-systems'
    score: 0.76
    reason:
      ko: 'AI 시스템을 운영 가능한 제품으로 만들 때 필요한 방어적 설계를 다룹니다.'
      ja: 'AIシステムを運用可能な製品にするための防御的設計を扱います。'
      en: 'It covers defensive design for making AI systems operational.'
      zh: '讨论了让AI系统成为可运营产品所需的防御性设计。'

---
在做InsightForge的时候，我最早决定不用的一句话是：

“AI可以预测真实消费者反应。”

这句话很容易卖。它短、直接、听起来很强，也很适合放在产品介绍里。但我觉得它很危险。如果把LLM生成的synthetic response当成市场真相，产品会变得很像答案机器，却不一定能成为可靠的决策工具。

所以我把InsightForge定义得更窄：

> InsightForge不是给出市场真相的工具，而是把不确定性整理成验证优先级的工作流。

这篇文章是一个构建记录。它不是简单的产品宣传，而是我在做一个LLM研究产品时，为什么选择保守定位，以及我想守住哪些边界。

## 最诱人的产品方向

最诱人的版本其实很清楚。

用户输入一个产品想法。系统生成persona。每个persona给出评分。最后产品给出一个市场反应分数，并告诉用户这个想法是否可行。

这个版本很适合演示。页面容易做，数字容易看，用户也会觉得自己拿到了答案。

但问题马上出现：如果平均分是7.2，团队应该做什么？

发布产品？提高价格？投广告？换目标用户？去做访谈？继续开发功能？

这个数字看起来很确定，但通常不足以支持真正的决策。更麻烦的是，因为它是AI生成的，它会比证据更快制造信心。

## 平均分不是洞察

在早期产品判断里，平均分经常是最弱的信息。

同样的平均分，背后可能是完全不同的情况。

| 模式 | 是否可能得到同样平均分 | 更好的决策问题 |
| --- | --- | --- |
| 所有人都有一点兴趣 | 是 | 定位是否需要更尖锐 |
| 一个细分群体很强烈，其他人无感 | 是 | 是否存在第一个beachhead segment |
| 用户喜欢功能，但不信任采用 | 是 | 需要什么证据才能推动切换 |

平均值会压缩差异。但早期研究最需要看到的，正是差异。

所以我希望InsightForge关注的是这些问题：

- 哪些persona反应强烈，为什么
- 哪些反对理由反复出现
- 问题是价格、信任、紧迫性，还是证据不足
- 功能兴趣是否真的转化为采用意愿
- 哪个claim在投放或销售之前必须先验证
- 下一次客户访谈应该问什么

这些问题不会给出市场真相，但会让下一步验证更好。

## synthetic panel不是客户

最重要的边界是：synthetic respondent不是客户。

它没有真正使用产品。没有为替代方案付费。没有预算周期、组织政治、切换成本和真实生活上下文。它可以模拟某种反应模式，但不能变成被抽样的人类受访者。

这个边界会改变产品语言。

synthetic response不能被包装成真实客户引用。directional confidence不能看起来像统计置信区间。报告不应该以“市场想要这个”结束，而应该以“下一步要验证这些假设”结束。

这种限制会让产品没那么夸张，但会让它更值得信任。

## 研究文献给我的判断标准

synthetic human samples和simulated economic agents相关研究说明，LLM在persona和上下文约束下，可以生成某些结构化反应模式。作为pre-research tool，这已经有价值。

但关于synthetic survey data的警告同样重要。合成回答可能过于平滑，分布可能失真，少数群体和边缘情况可能被压扁，真实人类数据中的噪声和矛盾可能消失。

所以我采用的规则是：

> synthetic panel可以用来生成validation priority，但不能被称为validation result。

Semantic Similarity Rating式的思路也适合这个方向。它不是要求模型给出精确需求预测，而是比较concept、claim、response和evidence之间的语义关系。哪个claim适合哪个segment？哪个objection反复出现？哪个proof是采用前的阻碍？哪个message值得真实测试？

## 我刻意加入的限制

InsightForge里有些重要部分不是功能，而是限制。

| 风险 | 产品限制 |
| --- | --- |
| 变成泛泛的AI建议 | 使用persona-conditioned questioning |
| 制造假精确 | 使用directional score，而不是总体估计 |
| 平均值隐藏分歧 | 显示segment spread和disagreement |
| 自信总结缺乏证据 | finding必须连接evidence |
| synthetic text看起来像真实引用 | 明确标注synthetic evidence |
| 报告看起来像最终答案 | 报告以validation questions结束 |

这些限制会让产品更难做，但也让它更可防守。

AI产品最难的不是生成文本，而是决定生成文本的身份。它是草稿、假设、模拟反应、验证结果，还是最终建议？如果这些身份混在一起，产品就会变危险。

## 真正有用的时刻

我觉得这个方法有用的时刻，并不是某个概念拿到高分的时候。

更有用的是系统把interest和adoption readiness分开的时候。用户可能喜欢一个想法，但不愿意切换。经理可能理解一个功能，但不会购买。客户可能同意价值主张，但仍然需要信任、证据或社会证明。

例如，一个金融产品可能在便利性功能上得到积极反应，但用户仍然不愿意把它作为主账户。一个SaaS工作流工具可能对创始人团队很有吸引力，但operations team会更担心integration risk。

在这些情况下，有用的输出不是“正面”或“负面”，而是下一步研究问题：

- 什么证据会让它可信
- 第一个测试segment应该是谁
- 销售或客户访谈应该验证哪个objection
- 哪个message有吸引力但还不够可信
- 用户从interest走向action需要什么条件

如果AI-assisted research能产生这些问题，它就有价值。

## 为什么不只是一个ChatGPT prompt

好的prompt当然可以帮助早期探索。我不认为所有流程都必须产品化。

但产品要解决的问题不一样。

- 输出需要跨运行比较
- persona假设需要明确
- scoring不能制造假精确
- evidence需要可以审查
- limitation必须跟结论一起出现
- report必须导向下一步行动

InsightForge的差异化不是模型访问。差异化在于把LLM输出转换成auditable workflow：panel construction、structured questioning、pattern aggregation、evidence trail、confidence note、limitation和validation recommendation。[独立开发者的AI SaaS产品经历](/zh/blog/zh/individual-developer-ai-saas-journey)也得出了同样的结论——结构和可重复性比模型选择更重要。

## 我希望团队第一次怎么用

第一次使用时，不应该从“分析整个市场”开始。

应该窄一点：

- 一个产品概念
- 一个目标segment
- 一个市场或地区
- 一个业务问题
- 几个竞争替代
- 一个价格假设

然后把结果当作research planning document，而不是证据本身。

第一次成功的标准不是报告看起来很聪明，而是下一次客户访谈、message test或landing page experiment变得更清晰。

## 还没有解决的问题

还有很多难题。

如何解释directional confidence，又不让它看起来像统计意义上的置信度？同样条件下重复运行时，一个pattern需要多稳定才能成为validation priority？如何发现过于平滑的synthetic response？哪些模式会在真实客户访谈中保留下来，哪些会消失？

这些不是实现细节，而是产品完整性问题。[AI Agent实际运营成本](/zh/blog/zh/ai-agent-cost-reality)也比预期更为复杂，这是同样的道理。

我想避免的方向是“AI会帮你完成所有研究”。我更信任的方向是“AI可以帮你决定下一步应该研究什么”。

## 结论

我把InsightForge做成验证优先级工具，是因为这个定位更有用，也更诚实。

早期产品团队不需要一个假的oracle。他们需要的是把模糊的市场不确定性，转化成可以和真实用户验证的假设、反对理由、segment和问题。

synthetic panel可以帮助这件事。但一旦把它当成客户来卖，风险就会超过价值。

这是我希望InsightForge守住的边界。

## 研究背景

这篇文章是构建记录，但方向也受到几条研究线索影响。

- [Out of One, Many: Using Language Models to Simulate Human Samples](https://arxiv.org/abs/2209.06899) 说明了使用LLM生成条件化synthetic sample的可能性。
- [Large Language Models as Simulated Economic Agents](https://arxiv.org/abs/2301.07543) 把LLM放在simulated agents的框架下讨论，也让这个框架的边界更清楚。
- [Using GPT for Market Research](https://www.hbs.edu/ris/Publication%20Files/23-062_1f58623a-ee21-44b9-a262-276047bc5543.pdf) 讨论了GPT类工具在市场研究流程中的使用方式。
- [Synthetic Replacements for Human Survey Data?](https://www.cambridge.org/core/journals/political-analysis/article/synthetic-replacements-for-human-survey-data-the-perils-of-large-language-models/B92267DC26195C7F36E63EA04A47D2FE) 警告了把synthetic response当作human survey替代品的风险。

我的结论很实际。这个研究方向对产品团队有价值，但前提是把输出当作准备更好human validation的材料，而不是把它当作human validation本身。
