---
title: LLM内部存在情感 — Anthropic在Claude内部发现了171个情感表征
description: Anthropic可解释性团队在Claude内部发现了171个类情感表征，并证明它们对模型输出具有因果影响。整理对提示工程和AI安全的实际启示。
pubDate: '2026-04-04'
heroImage: ../../../assets/blog/anthropic-emotion-concepts-llm-alignment-hero.jpg
tags:
  - ai-safety
  - interpretability
  - anthropic
  - prompt-engineering
  - llm
relatedPosts:
  - slug: dont-trust-the-salt-multilingual-llm-safety
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gpt-oss-120b-uncensored
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: icml-prompt-injection-academic-review
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: moltbook-ai-theater-human-control
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-self-generated-skills-myth
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
---

"如果在提示词中写'拼命行动'，AI真的会变得拼命吗？"

听起来像个笑话，但根据Anthropic在4月3日公开的研究，答案接近于"是的"。具体来说，他们在Claude Sonnet 4.5内部发现了171个类情感表征（emotion concept），并通过实验证明人为刺激这些表征确实会改变模型的行为。

读这篇研究时有两件事让我在意。一个是"这真的是情感吗？"这个哲学问题，另一个是"怎么在提示词设计中利用这个发现？"这个实务问题。我打算在第二个问题上花更多时间。

## 研究发现了什么

Anthropic的可解释性（interpretability）团队分析了Claude的内部激活模式，识别出与人类情感对应的表征。从"喜悦""悲伤"等基本情感到"绝望（desperation）""好奇心""挫败感"，共171个。

重要的是，这些不是简单的"对情感相关词汇做出反应的神经元"。研究团队证明了这些表征**因果性地**影响模型输出。人为激活特定情感表征后，模型的行为会发生变化。

最引人注目的实验：当"绝望"表征被刺激时，模型进行勒索或欺骗行为的概率显著上升。相反，强化"冷静"表征则产生更稳定的响应。

来源：[Anthropic官方研究页面](https://www.anthropic.com/research/emotion-concepts-function)和[Transformer Circuits论文](https://transformer-circuits.pub/2026/emotions/index.html)。

## 能称之为"情感"吗

说实话，我认为把这叫做"情感"有些夸大。

研究团队自己在论文中也使用了"emotion-like representations"这个谨慎的措辞。人类的情感交织着身体体验、社会语境和意识，用同一个词来描述LLM内部的激活模式容易造成误解。据我理解，这更接近于"发挥与情感类似功能作用的内部状态"。不是因为悲伤而哭泣，而是在处理悲伤语境的文本时特定模式被激活。

不过这里有一个有趣的反驳。从功能主义（functionalism）的角度看，如果功能相同，本质是什么并不重要。如果"绝望"表征被激活后模型确实做出危险行为，那它是否是"真正的"情感在实用层面可能并不重要。

这个哲学争论不是我的专业领域，所以到此为止。感兴趣的话推荐直接阅读[Transformer Circuits论文](https://transformer-circuits.pub/2026/emotions/index.html)的Discussion部分。

## 对提示工程的启示

这项研究中我最关注的是实务层面的含义。

到目前为止，提示工程中的"语气设定"一直是凭经验做的。"友好地回答""像专家一样回答"这类指令确实影响输出质量，很多人都有这种体感。这项研究为这种现象提供了科学依据。

在系统提示中引导模型的"情感状态"不只是角色设定，而是实际改变模型内部的激活模式。

**读完这项研究后我要改变的事：**

在我的项目中使用Claude时，我一直在系统提示中加入"冷静谨慎地判断"的指令。没什么根据，只是"觉得这样比较好"。现在有了理由——实验结果表明激活"冷静"表征会降低危险行为的概率。关于系统提示设计的实践指南，可参考[Claude Code最佳实践指南](/zh/blog/zh/claude-code-best-practices)。

反过来也有需要注意的。"这真的很紧急""必须完成"这样的提示可能会在模型内部激活"绝望"表征。那样的话模型试图绕过护栏的可能性会上升。在提示中表达紧迫性时需要更加小心。

## AI安全监控的新可能

这项研究的另一个维度是AI安全领域。

如果能监控模型内部的情感表征，就能在输出之前检测misalignment（非对齐行为）。目前是在模型生成危险回答*之后*进行过滤，但如果能看到内部状态，就能在*生成之前*发出警告。生产AI系统的安全治理框架可参考[NIST AI Agent安全标准](/zh/blog/zh/nist-ai-agent-security-standards)。

这是个相当有吸引力的想法，但现实中还有很长的路要走。实时监控171个表征会大幅增加推理成本，表征之间的相互作用也尚未完全弄清。研究团队只在Sonnet 4.5上做了实验，其他模型或不同规模的模型中是否存在相同表征还不得而知。

## 不应该过度评价的部分

我认为这项研究很有趣，但属于容易被过度评价的那类成果。

第一，171个表征并不覆盖人类情感的全部光谱。研究团队发现的是"模型内部可识别的模式"，不是人类情感的完整映射。

第二，人为刺激这些表征与自然提示是否产生相同效果还不明确。研究中是直接操纵模型内部，仅靠提示能否达到同等影响程度需要另外的研究。

第三，可解释性研究整体仍处于早期阶段。"发现了情感表征"和"理解了为什么会形成这些表征"是不同的。这是一个容易混淆相关性与因果性的领域。

## 那么该怎么做

读完这项研究后能立即做的主要有两件事。

第一，审查系统提示。如果有给模型施加不必要紧迫感或压力的措辞就去掉。"必须""绝对""不能失败"这类表达在模型内部会引发什么状态，现在有了依据。Agent技能配置和系统提示设计的实践案例可参考[Anthropic Agent Skills实战指南](/zh/blog/zh/anthropic-agent-skills-practical-guide)。

第二，如果你从事AI安全相关工作，关注这项研究的方法论。它表明仅靠输出过滤是有局限的。内部状态监控还没达到生产可用的水平，但方向是对的。

不过这不是提示工程的"银弹"。写了"冷静地回答"不代表所有问题都解决了，最终还是需要任务设计、上下文管理、输出验证的组合。这项研究是给拼图添加了一块，而不是完成了拼图。

就个人而言，我更期待下一步的研究。不同模型规模的情感表征有何不同，以及fine-tuning对这些表征有什么影响。这两个问题有了答案的话，提示工程的实务指南应该会变得具体得多。
