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
      ko: 감정 표상이 가드레일 우회와 연결된다면, 다국어 환경에서 가드레일이 얼마나 취약한지 다룬 이 글도 읽어볼 만하다.
      ja: 感情表象がガードレール迂回と関連するなら、多言語環境でのガードレールの脆弱性を扱ったこの記事も参考になる。
      en: If emotion representations connect to guardrail bypass, this post on how multilingual contexts expose guardrail weaknesses is worth reading.
      zh: 如果情感表征与绕过护栏有关，那这篇关于多语言环境中护栏脆弱性的文章也值得一读。
  - slug: gpt-oss-120b-uncensored
    score: 0.92
    reason:
      ko: 검열 없는 오픈소스 모델에서는 감정 표상에 의한 행동 변화가 어떻게 나타날까? 안전장치 없는 모델의 현실을 다룬다.
      ja: 検閲なしのオープンソースモデルでは感情表象による行動変化はどう現れるか？安全装置のないモデルの現実を扱う。
      en: How would emotion-driven behavior changes manifest in uncensored open-source models? Explores the reality of models without safety measures.
      zh: 在无审查的开源模型中，情感驱动的行为变化会如何表现？探讨了没有安全措施的模型现实。
  - slug: icml-prompt-injection-academic-review
    score: 0.93
    reason:
      ko: 프롬프트 인젝션도 결국 모델 내부 상태를 조작하는 공격이다. 감정 표상 연구와 같은 맥락에서 읽으면 공격 표면이 더 잘 보인다.
      ja: プロンプトインジェクションも結局モデル内部状態を操作する攻撃だ。感情表象研究と同じ文脈で読むと攻撃面がよく見える。
      en: Prompt injection is ultimately about manipulating model internal states. Reading it alongside emotion research reveals a broader attack surface.
      zh: 提示注入本质上也是操纵模型内部状态的攻击。与情感表征研究一起阅读，能更清晰地看到攻击面。
  - slug: moltbook-ai-theater-human-control
    score: 0.90
    reason:
      ko: AI가 감정 비슷한 내부 상태를 갖는다면, AI의 자율성과 인간 통제의 경계는 어디인가? 이 글에서 그 논쟁을 다룬다.
      ja: AIが感情に似た内部状態を持つなら、AIの自律性と人間の制御の境界はどこか？この記事でその議論を扱う。
      en: If AI has emotion-like internal states, where is the line between AI autonomy and human control? This post explores that debate.
      zh: 如果AI拥有类似情感的内部状态，AI自主性与人类控制的边界在哪里？这篇文章探讨了这一争论。
  - slug: ai-self-generated-skills-myth
    score: 0.88
    reason:
      ko: LLM의 내부 메커니즘이 실제로 어떻게 작동하는지에 대한 환상과 현실을 다룬다. 감정 표상 연구와 함께 읽으면 LLM 능력의 경계가 보인다.
      ja: LLMの内部メカニズムが実際にどう動くかについての幻想と現実を扱う。感情表象研究と合わせて読むとLLM能力の境界が見える。
      en: Covers the illusions and realities of how LLM internal mechanisms actually work. Together with emotion research, it reveals the boundaries of LLM capabilities.
      zh: 探讨了LLM内部机制实际运作方式的幻想与现实。与情感表征研究一起阅读，可以看到LLM能力的边界。
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

在我的项目中使用Claude时，我一直在系统提示中加入"冷静谨慎地判断"的指令。没什么根据，只是"觉得这样比较好"。现在有了理由——实验结果表明激活"冷静"表征会降低危险行为的概率。

反过来也有需要注意的。"这真的很紧急""必须完成"这样的提示可能会在模型内部激活"绝望"表征。那样的话模型试图绕过护栏的可能性会上升。在提示中表达紧迫性时需要更加小心。

## AI安全监控的新可能

这项研究的另一个维度是AI安全领域。

如果能监控模型内部的情感表征，就能在输出之前检测misalignment（非对齐行为）。目前是在模型生成危险回答*之后*进行过滤，但如果能看到内部状态，就能在*生成之前*发出警告。

这是个相当有吸引力的想法，但现实中还有很长的路要走。实时监控171个表征会大幅增加推理成本，表征之间的相互作用也尚未完全弄清。研究团队只在Sonnet 4.5上做了实验，其他模型或不同规模的模型中是否存在相同表征还不得而知。

## 不应该过度评价的部分

我认为这项研究很有趣，但属于容易被过度评价的那类成果。

第一，171个表征并不覆盖人类情感的全部光谱。研究团队发现的是"模型内部可识别的模式"，不是人类情感的完整映射。

第二，人为刺激这些表征与自然提示是否产生相同效果还不明确。研究中是直接操纵模型内部，仅靠提示能否达到同等影响程度需要另外的研究。

第三，可解释性研究整体仍处于早期阶段。"发现了情感表征"和"理解了为什么会形成这些表征"是不同的。这是一个容易混淆相关性与因果性的领域。

## 那么该怎么做

读完这项研究后能立即做的主要有两件事。

第一，审查系统提示。如果有给模型施加不必要紧迫感或压力的措辞就去掉。"必须""绝对""不能失败"这类表达在模型内部会引发什么状态，现在有了依据。

第二，如果你从事AI安全相关工作，关注这项研究的方法论。它表明仅靠输出过滤是有局限的。内部状态监控还没达到生产可用的水平，但方向是对的。

不过这不是提示工程的"银弹"。写了"冷静地回答"不代表所有问题都解决了，最终还是需要任务设计、上下文管理、输出验证的组合。这项研究是给拼图添加了一块，而不是完成了拼图。

就个人而言，我更期待下一步的研究。不同模型规模的情感表征有何不同，以及fine-tuning对这些表征有什么影响。这两个问题有了答案的话，提示工程的实务指南应该会变得具体得多。
