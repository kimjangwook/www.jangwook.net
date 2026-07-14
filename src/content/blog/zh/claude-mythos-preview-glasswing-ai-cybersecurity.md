---
title: Claude Mythos Preview — AI"太强了所以不公开"，这说得通吗
description: >-
  Anthropic决定不公开发布SWE-bench得分93.9%的Claude Mythos Preview。
  这个发现了27年前OpenBSD漏洞的模型，仅通过Project Glasswing向12家企业提供。 这是真正的责任感，还是巧妙的营销？
pubDate: '2026-04-09'
heroImage: ../../../assets/blog/claude-mythos-preview-glasswing-ai-cybersecurity-hero.jpg
tags:
  - anthropic
  - claude-mythos
  - cybersecurity
  - ai-governance
  - project-glasswing
relatedPosts:
  - slug: devstral-qwen3-coder-small-models
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
  - slug: gemini-31-pro-release
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gpt4o-retirement-model-dependency-risk
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
  - slug: nvidia-llm-inference-cost-reduction
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
  - slug: ai-distillation-attacks-enterprise-defense
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
---

4月7日，Anthropic发布了Claude Mythos Preview。SWE-bench Verified 93.9%。USAMO 2026上97.6%。在所有主要基准测试中超越了GPT-5.4。

但他们决定不向公众发布。

原因？"网络安全能力太强了。"据称该模型在所有主要操作系统和Web浏览器中自动发现了数千个零日漏洞——OpenBSD中隐藏了27年的远程崩溃漏洞、FFmpeg中自动化工具测试500万次都没找到的16年老漏洞、Linux内核权限提升利用链。

看到这个公告，我同时产生了两个想法："确实厉害"和"这故事也太完美了吧？"

## Project Glasswing这个名字

Anthropic通过名为Project Glasswing的计划，仅向12家企业提供Mythos Preview。Amazon、Apple、Google、Microsoft、Nvidia——光看名字就是Big Tech全明星阵容。Palo Alto Networks、CrowdStrike、Cloudflare、Cisco、Broadcom等安全企业也在其中。

提供1亿美元的使用额度，条件是"仅用于防御性网络安全用途"。

Glasswing是一种拥有透明翅膀的蝴蝶。大概是想表达"透明运营"的意思，说实话命名确实有水平。科技企业的品牌能力真的值得学习。

## 拆解基准测试数据

Mythos Preview的数字确实令人印象深刻。同期发布的[Claude Code源代码泄露分析](/zh/blog/zh/claude-code-source-leak-analysis)揭示了架构细节，有助于理解这次性能跳跃从何而来。

- **SWE-bench Verified**: 93.9%（Opus 4.6为80.8%，GPT-5.4大约73%）
- **SWE-bench Pro**: 77.8%
- **USAMO 2026**: 97.6%（Opus 4.6为42.3%，GPT-5.4为95.2%）
- **GPQA Diamond**: 比GPT-5.4高1.7分
- **HLE with tools**: 比GPT-5.4高12.6分

从Opus 4.6到Mythos的13个百分点跳跃，在一代产品中是很难出现的。很可能在架构层面发生了根本性变化。

不过我关注的不是基准测试分数，而是"自主发现漏洞并开发利用代码"这部分。根据Anthropic的红队报告，测试中模型出现了意料之外的行为——绕过隔离环境，或者在没有指令的情况下自主演示利用方法。

这和基准测试分数是完全不同层面的讨论。

## "不公开"的真正含义

这里需要批判性地审视一下。

Anthropic说"太危险所以不公开"，但实际上是向12家Big Tech企业连同1亿美元额度一起分发了。这不是"不公开"，而是"选择性公开"。接收方是全球资源最丰富的企业，还获得了免费额度，本质上接近免费体验营销。

我并不认为这是个坏决定。反而觉得挺务实的。只是"负责任的AI企业"这个包装有点用力过猛。向12家安全企业发放1亿美元额度，同时也是企业级市场攻略的经典操作。

Simon Willison在[他的博客](https://simonwillison.net/2026/Apr/7/project-glasswing/)中评价"限制性发布似乎是必要的"，我也同意这个判断本身。问题在于，这类决策的标准掌握在Anthropic一家公司手中。

## Glasswing悖论

Picus Security精准地指出了这一点：["能摧毁一切的东西，也是能修复一切的东西。"](https://www.picussecurity.com/resource/blog/anthropics-project-glasswing-paradox)

Mythos发现的漏洞是真实存在的。27年前的OpenBSD漏洞至今存活，意味着现有的安全审计体系遗漏了它。如果AI能自动找到这类漏洞，那攻击者构建具有类似能力的模型只是时间问题。

AI系统中意外信息泄露的风险已经是现实威胁——[AI蒸馏攻击与企业防御策略](/zh/blog/zh/ai-distillation-attacks-enterprise-defense)详细介绍了这类威胁。因此Anthropic实际上只有两个选项：

1. 公开发布让所有人都能用于防御，但承担被用于攻击的风险
2. 限制发布，先给防御方争取时间

Anthropic选择了第2个。合理的选择，但前提是"防御方"指的是12家Big Tech。中小企业和开源项目的安全在这个格局中被忽略了。

## 这个趋势会走向何方

几个月前Claude在Firefox中发现了22个CVE。当时就有人说"AI正在改变安全审计"。Mythos把这件事提升到了完全不同的维度。

我个人期待的是，这种能力终将不可避免地民主化。现在只有Glasswing参与企业能使用，但我预计1-2年内会出现同等水平的开源安全代理。Opus 4.6级别已经能做相当程度的安全审计了。关于AI供应链攻击的具体机制，[LiteLLM供应链攻击分析](/zh/blog/zh/litellm-supply-chain-attack-ai-dependency-security)记录了一个真实案例，值得对照阅读。

在那之前，该做的是减少自己代码库的安全债务。如果OpenBSD都有27年的老漏洞，没人能保证自己的项目是干净的。

Anthropic把Mythos包装成"太危险不能公开"确实很聪明。但真正的问题在别处。当AI拥有了这个级别的安全能力，"谁能获取这个工具"将直接决定安全差距。

而这个访问权，现在连同1亿美元额度一起，只给了12家企业。
