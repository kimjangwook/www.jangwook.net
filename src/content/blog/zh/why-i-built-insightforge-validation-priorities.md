---
title: '我为什么做InsightForge：把AI消费者研究变成验证优先级工具'
description: '这是一篇产品构建记录，说明InsightForge是什么、为什么要做，以及把synthetic panel和SSR式方法做成负责任产品时遇到的困难。'
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
faq:
  - question: "InsightForge会替代真实的市场调研吗？"
    answer: "不会。synthetic panel不替代人的回答，而是帮你整理下一步该问人什么。最终输出不是结论，而是接下来要验证的优先级。"
  - question: "为什么不能只看平均分？"
    answer: "同样的平均7分，可能是所有人都有点兴趣，可能是只有一个segment强烈反应，也可能是信任不足，每种情况要做的事完全不同。所以报告会一起看spread、disagreement、blocker和adoption readiness。"
  - question: "什么时候传统问卷更合适？"
    answer: "当你需要转化率或市场规模这类统计上可辩护的数字时，或者在监管、医疗、金融这类错误结论代价很大的领域，以真实受访者为样本的传统问卷要合适得多。"
  - question: "第一次使用时应该怎么输入？"
    answer: "与其一次分析整个市场，不如缩窄到一个产品概念、一个目标segment和一个核心问题来开始。输入太宽，结果也会流于泛泛。"
---

InsightForge是一个面向早期产品和市场假设的研究辅助服务。

用户输入产品概念、目标客户、地区、竞争替代、价格假设和一个业务问题。InsightForge会构建synthetic panel，收集persona-conditioned reactions，比较分数和理由，最后生成包含segment reaction map、trigger、blocker、evidence、confidence note和validation question的报告。

从外部看，它可以被称为AI消费者研究工具。但在构建过程中，我刻意选择了更保守的定义。

> InsightForge不是市场预测机器，而是把不确定性转化为验证优先级的工作流。

守住这一句话，比我预想的要难得多。下面是我为什么做这个服务、在哪里卡住、以及最终决定不去说哪些话的记录。

## 起点：想法很多，但验证总是太晚

一个人或小团队做产品时，经常会重复遇到同一个场景。

想法很多。landing page可以快速做出来。文案可以写。功能也可以开发。真正困难的问题马上出现。

这个message真的有效吗？目标客户对吗？价格可信吗？用户只是感兴趣，还是会采取行动？如果现在做客户访谈，应该先问什么？

这些问题很重要，但通常被处理得太晚。团队先做页面、定消息、开发功能，然后才开始确认假设是否正确。

我想要的是正式验证之前使用的工具。不是给答案的工具，而是指出哪些假设危险到值得验证的工具。一个人做SaaS的过程中，我在[个人开发者的AI SaaS之路](/zh/blog/zh/individual-developer-ai-saas-journey)里也反复遇到同样的茫然。

## 最初诱人的版本要简单得多

最简单的产品形态很明显。

用户输入产品想法。AI生成persona。每个persona给分。系统显示平均市场反应分数。用户得到一份漂亮报告和一个看似可执行的数字。

这个版本很好解释，也很好演示。加上credit、payment和PDF report之后，看起来就像一个SaaS。

但真实运行很快暴露了问题。

如果平均分是7.2，团队应该做什么？发布产品？提高价格？修改message？放弃某个segment？去采访客户？

数字存在，但决策仍然不清楚。更糟的是，因为这个数字由LLM生成并出现在报告里，它会显得比证据本身更权威。

这就是我必须改变产品方向的时刻。

## 危险的一句话：AI替代消费者

这个领域最容易卖的一句话是：

“AI可以预测真实消费者行为。”

它很强、好记，也可能带来更多点击。但我不想让InsightForge依赖这个主张。

synthetic persona不是客户。它没有为竞争产品付费，没有和经理争论预算，没有在时间压力下切换工具。它没有真实生活上下文、采购流程，也没有过去购买失败的记忆。

如果synthetic response被展示得太漂亮，它会开始像真实客户引用。这是最危险的部分。

所以我给产品设定了几条规则：

- synthetic response不能看起来像真实客户引用
- confidence不能看起来像统计置信度
- 平均分不能成为结论
- finding必须带着evidence和limitation一起出现
- report应该以validation questions结束，而不是market truth

这些规则让产品更难销售，但更容易被信任。

## 最难的部分：看起来合理不等于有用

LLM产品最难的地方是，合理的输出太便宜了。

早期报告看起来不错。文字自然，摘要连贯，表格整洁。但很多finding过于泛泛：便利性重要，信任重要，价格重要，不同segment反应不同。

这些话不是错的，只是不够。

我想要的是更具体的东西：

- 哪个segment反应不同，为什么
- 哪个objection反复出现
- feature interest是否和adoption readiness分离
- 价格反对意见是否其实是信任问题
- 哪个claim在生效前需要proof
- 下一次客户访谈应该问什么

为了接近这个目标，我必须让workflow更结构化。persona generation、question generation、response capture、scoring、insight generation和reporting不能只是一个大prompt。每个stage都需要约束、检查和明确角色。把多个agent拆成阶段来协调时遇到的试错，我在[多智能体编排改进记](/zh/blog/zh/multi-agent-orchestration-improvement)里写得更详细。

这不只是prompt engineering，而是决定每个生成物在产品里到底是什么身份。

## 我一直在和平均分对抗

最初我想把score放在中心。用户理解数字，dashboard也更容易围绕数字设计。

但测试越多，平均分越显得危险。

同样的平均分可能隐藏完全不同的现实。

| 隐藏模式 | 平均分看起来 | 团队应该做什么 |
| --- | --- | --- |
| 所有人都有一点兴趣 | 看起来可以 | 让定位更尖锐 |
| 一个segment很兴奋，其他人无感 | 看起来可以 | 缩小第一个目标群体 |
| 功能被喜欢，但信任不足 | 看起来可以 | 验证proof和risk messaging |
| 兴趣高，但紧迫性低 | 看起来积极 | 找到为什么现在行动的理由 |

所以报告必须从平均值转向spread、disagreement、blockers和adoption readiness。

这让报告没那么简单，但更有用。

## 一些运行以有用的方式失败了

不是每次research run都成功。

有些survey-style runs失败时，看起来像sample size问题。但真实原因有时不只是数量，也可能是response variance、directional confidence width，或者某个gate无法支持稳定解释。如果UI只说“sample too small”，就隐藏了真正原因。

有些输出太平滑。不同persona仍然用相似语气提出相似担忧。这看起来稳定，但也可能意味着模型收敛到了安全、泛泛的答案。

market grounding也比想象中难。加入web evidence会让报告看起来更强，但只有当evidence支持具体结论时才有意义。否则只是装饰。

还有运营问题：payments、credits、queues、provider cost、失败运行、退款、DeepSeek余额提醒、admin可视性。一个研究产品不只是报告生成器。如果它是真实服务，每次运行都有成本、失败模式和用户期待。由于一份报告由多个阶段的LLM调用组成，费用会迅速累积，这一点和我在[AI智能体的成本现实](/zh/blog/zh/ai-agent-cost-reality)里讨论的问题完全重叠。

这些困难把InsightForge从demo推向了产品。

## 把SSR式思考翻译成产品语言

InsightForge的核心方法接近Semantic Similarity Rating式思考。

有用的点不是AI神奇地知道市场，而是concept、claim、persona response、evidence和rating anchor可以在结构化语义workflow中比较。

对于一个产品message，真正有用的问题是：

- 这个message最接近哪个persona problem
- 哪个claim和哪个objection冲突
- proof requirement是否强过purchase interest
- 相比alternatives，差异化是否被理解
- 相同score是否来自不同原因

这必须变成产品报告，而不是学术论文。团队必须知道下一步做什么。

所以输出重点不是final answer，而是validation priorities。

## 正确的第一次使用方式

我不认为团队第一次应该让InsightForge“分析整个市场”。输入太宽，输出也会太宽。

第一次运行应该很窄：

- 一个产品概念
- 一个目标segment
- 一个地区或市场
- 一个价格假设
- 几个替代方案
- 一个业务问题

结果应该被当作research planning document阅读。

不是“这是否证明产品会成功”，而是“下一步应该问真实客户什么”。

不是“这个message是否正确”，而是“哪个claim没有proof就很危险”。

不是“这个segment会不会买”，而是“这个segment最大的blocker是什么”。

这才是产品最有用的地方。

## 连接到真实服务

这篇文章中描述的工作流，已经作为 [InsightForge](https://insightforge.effloow.com/) 的真实服务在运行。

服务支持Focus study和Survey study。用户可以输入产品概念、目标客户、竞争替代、价格假设、地区和一个核心业务问题，然后生成结构化报告。第一次使用时，我建议不要从整个市场分析开始，而是选择一个产品概念和一个较窄的segment。

如果想先理解方法论，可以从 [InsightForge Research Method Guide](https://insightforge.effloow.com/) 和sample report流程开始。如果想直接尝试，建议先运行一个小的Focus study，并把输出用于准备真实客户访谈或message test。

这个链接不只是产品CTA。它把本文的观点连接到实际实现：validation priorities、synthetic evidence、limitations和next validation questions并不只是营销语言，而是实际报告结构的一部分。

## 我不是在做oracle

我知道更强的说法很诱人。

AI预测市场。几分钟完成消费者研究。无需访谈即可validation。

这些话可能适合作为营销文案，但会破坏产品需要的信任。

我不是在做oracle。我想做的是帮助人们准备更好的验证。一个让早期产品团队不再盲目构建的工具，一个更早暴露危险假设、强objection和proof requirement的工具。

这个定义没那么炫，但更持久。

## 研究背景

几条研究线索影响了这个方向。

- [Out of One, Many: Using Language Models to Simulate Human Samples](https://arxiv.org/abs/2209.06899) 说明了为什么conditioned synthetic samples值得研究。
- [Large Language Models as Simulated Economic Agents](https://arxiv.org/abs/2301.07543) 把LLM放在simulated agents框架下，也让其边界更清楚。
- [Using GPT for Market Research](https://www.hbs.edu/ris/Publication%20Files/23-062_1f58623a-ee21-44b9-a262-276047bc5543.pdf) 探讨了GPT类工具在market research workflow中的使用。
- [Synthetic Replacements for Human Survey Data?](https://www.cambridge.org/core/journals/political-analysis/article/synthetic-replacements-for-human-survey-data-the-perils-of-large-language-models/B92267DC26195C7F36E63EA04A47D2FE) 警告不要把synthetic responses当作human survey data的干净替代品。

我的结论很实际。这个研究方向可以帮助产品团队，但前提是把输出当作human validation的准备，而不是替代。

## 什么时候该用，什么时候该避开

像InsightForge这样的多智能体synthetic panel并非万能。它适合某些场景，在另一些场景里却是糟糕的选择。

适合用的情况是：

- 还处于早期，没有客户名单，根本没有可以做正式访谈或问卷的对象。
- 你有多个概念、message或价格假设，需要决定先验证哪一个。
- 在写访谈提纲之前，想先筛出哪些假设是危险的。
- 想低成本、快速地获得方向感，并且明确打算之后用真实的人来确认。

不该用的情况是：

- 你需要为发布或定价的最终决策提供可辩护的依据。这应该由真实购买数据或真实用户访谈来回答。
- 你需要统计上可辩护的数字，比如转化率、市场规模或显著的segment占比。以真实受访者为样本的传统问卷要合适得多。
- 你处在监管、医疗、金融这类错误结论代价很大的领域。synthetic response的幻觉风险无法接受。
- 你已经有足够的真实用户流量，可以直接用A/B测试来测量。能测量时，实测比模拟更快也更准确。

简单说，在你还不知道该问人什么的阶段它很有用，而当你试图替代人的回答时它就变得危险。

## 这是在划边界，而不是加功能

构建InsightForge的过程，与其说是增加功能，不如说是不断划边界。

不说AI替代研究。不把synthetic responses包装成客户声音。不让scores看起来像市场真相。相反，帮助团队看到下一步需要人类验证的assumptions、segments、objections和proof requirements。

这就是我做InsightForge的原因。

核心句子仍然是：

> 一个把模糊市场不确定性转化为人类可以实际验证的优先级的工具。
