---
title: GitHub Copilot 4月起将用你的代码训练AI — 不退出就等于同意
description: 'GitHub宣布从4月24日起，Copilot Free/Pro/Pro+用户的代码片段、内联建议采纳及对话交互等数据将默认用于AI模型训练。未主动关闭此选项即视为同意接受数据采集。整理具体退出步骤、所采集数据的类型与范围，以及企业和涉密项目开发者的实际应对建议，还包括团队管理员的组织策略设置要点。'
pubDate: '2026-03-27'
heroImage: ../../../assets/blog/github-copilot-data-policy-opt-out-guide-hero.jpg
tags:
  - github
  - copilot
  - privacy
  - ai
  - developer-tools
relatedPosts:
  - slug: ai-era-career-advice-for-juniors
    score: 0.92
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gemini-31-pro-release
    score: 0.92
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: kanitts2-voice-cloning
    score: 0.91
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: openrouter-oss-dominance
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/MLのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML
        topics.
      zh: 适合作为下一步学习资源，通过AI/ML主题进行连接。
  - slug: windsurf-arena-mode-speed-over-accuracy
    score: 0.91
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
draft: true
---

3月25日，GitHub博客上静悄悄地发布了一篇文章。标题很克制 — "Updates to our Privacy Statement and Terms of Service." 但内容相当直接。**从4月24日起，Copilot Free、Pro和Pro+用户的交互数据将默认用于训练AI模型。**

我是从The Register的报道中先看到这个消息的，坦白说第一反应是"终于来了"。提供免费方案却不使用数据，本来就有点不自然。

## 具体变了什么

GitHub明确要收集的数据类型比想象中要广泛：

- 代码片段（输入和输出）
- 用户接受或修改的代码建议
- 光标周围的代码上下文
- 注释和文档
- 文件名和仓库结构
- Copilot Chat、内联建议等功能的交互数据
- 对建议的反馈（👍/👎）

关键在于，这是**默认开启（opt-out方式）**的。如果不主动关闭，就视为同意。

不过GitHub也澄清了几点：

1. **Business和Enterprise方案不受影响** — 组织管理员现有的策略设置保持不变
2. **不会使用私有仓库中静态存储的源代码进行训练** — 意思是"at rest"状态的代码不在范围内
3. **不会与第三方AI模型提供商共享数据** — 仅用于GitHub/Microsoft内部学习

第2点有些微妙。他们说"at rest"的代码不用，但Copilot在读取代码并生成建议过程中产生的数据是要收集的。实质上私有代码可能间接参与了模型训练。这一点我个人觉得有些不安。

## 如何退出

步骤很简单：

1. 登录GitHub
2. 进入 **Settings → Copilot → Features**
3. 在Privacy部分禁用 **"Allow GitHub to use my data for AI model training"**

如果你之前已经拒绝了"用于产品改进的数据收集"，那个设置会保留。但如果从未动过这个设置，4月24日起就会默认开启。

注意一点 — 如果你的个人账号属于某个Organization，根据组织策略，这个设置可能不可见。建议向组织管理员确认。

## 为什么这是个问题（以及为什么可能没那么严重）

**认为有问题的视角：**

你写的代码片段进入模型训练，意味着你的代码模式可能会出现在给其他人的建议中。如果包含专有算法或业务逻辑，不得不在意。特别是在私有仓库工作的开发者，"不使用源代码本身"这句话并不能完全让人安心。

**认为没问题的视角：**

现实中，Copilot已经用数十亿行公开代码训练过了，你的几行代码片段对模型产生统计学上显著影响的可能性很低。而且交互数据训练的目的是改进"哪些建议有用"，这有助于提升整体工具质量。

我个人项目不打算退出。算是为Copilot变得更好做贡献吧。但公司代码一定会确认。

## 从更大的背景来看

这个策略变更不只是GitHub的事。以免费或低价提供AI工具，同时用用户数据改进模型的模式，正在成为行业标准。Google的Gemini、Anthropic的[Claude Code](/zh/blog/zh/claude-code-best-practices)都有或即将有类似的策略。

在开发者工具市场，这件事特别敏感的原因是，代码就是知识产权。这与[AI代码归属追踪](/zh/blog/zh/cursor-agent-trace-ai-code-attribution)的讨论也有相通之处。文本对话和代码的性质完全不同。

最终还是每个人自己判断的问题。有退出选项本身是好事，但**默认选择收集同意而非主动同意**，必然会招来批评。选择让用户主动禁用而非主动启用，是一个刻意的设计决策 — 而且不是站在用户一边的。

## 清单：现在该做的事

- [ ] 在GitHub Settings → Copilot → Features检查数据学习设置
- [ ] 如果是组织管理员，在Organization策略中审查Copilot数据政策
- [ ] 向团队成员分享4月24日的变更
- [ ] 在私有仓库使用Copilot时，重新评估敏感代码暴露范围

4月24日前确认一次就够了。5分钟的事。
