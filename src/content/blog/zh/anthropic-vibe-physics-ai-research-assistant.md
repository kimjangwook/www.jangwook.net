---
title: Vibe Physics — 物理学教授让Claude写了一篇论文
description: >-
  分析Anthropic Science博客首篇文章：哈佛物理学教授Matthew
  Schwartz以"AI研究生"的方式指导Claude的实验。110次草稿、36M tokens、两周完成的论文。
pubDate: '2026-03-25'
tags:
  - ai-ml
  - anthropic
  - science
  - llm
relatedPosts:
  - slug: gpt52-theoretical-physics-discovery
    score: 0.96
    reason:
      ko: GPT-5.2가 이론 물리학에서 새로운 발견을 했다는 사례와 직접 비교할 수 있습니다. Claude의 G2 수준 평가와 대조해보세요.
      ja: GPT-5.2が理論物理学で新発見をした事例と直接比較できます。ClaudeのG2評価と対照してみてください。
      en: Directly comparable to the GPT-5.2 theoretical physics discovery case. Contrast it with Claude's G2-level assessment.
      zh: 可以与GPT-5.2在理论物理学中的新发现案例直接对比。请与Claude的G2水平评估进行对照。
  - slug: alphaevolve-ramsey-ai-research-partner
    score: 0.94
    reason:
      ko: AlphaEvolve가 수학 난제를 풀어낸 사례입니다. AI가 과학 연구의 파트너가 되는 흐름을 다른 각도에서 보여줍니다.
      ja: AlphaEvolveが数学の難問を解いた事例です。AIが科学研究のパートナーになる流れを別の角度から示します。
      en: The case of AlphaEvolve solving a math conjecture. Shows AI as a science research partner from a different angle.
      zh: AlphaEvolve解决数学难题的案例。从不同角度展示了AI成为科学研究伙伴的趋势。
  - slug: agents-md-effectiveness
    score: 0.92
    reason:
      ko: 이 글에서 다룬 CLAUDE.md + CHANGELOG.md 패턴의 효과를 데이터로 검증한 포스트입니다.
      ja: この記事で取り上げたCLAUDE.md + CHANGELOG.mdパターンの効果をデータで検証した記事です。
      en: Validates the CLAUDE.md + CHANGELOG.md pattern discussed here with actual effectiveness data.
      zh: 用数据验证了本文讨论的CLAUDE.md + CHANGELOG.md模式的实际效果。
  - slug: karpathy-autoresearch-overnight-ml-experiments
    score: 0.90
    reason:
      ko: Karpathy의 자동 연구 실험과 Schwartz의 물리학 실험은 "AI에게 연구를 맡기는 패턴"이라는 점에서 같은 흐름입니다.
      ja: Karpathyの自動研究実験とSchwartzの物理学実験は「AIに研究を任せるパターン」という点で同じ流れです。
      en: Karpathy's auto-research experiments and Schwartz's physics experiment share the same theme of delegating research to AI.
      zh: Karpathy的自动研究实验和Schwartz的物理学实验在"将研究委托给AI的模式"这一点上属于同一趋势。
  - slug: claude-code-best-practices
    score: 0.88
    reason:
      ko: Ralph Loop과 test oracle 패턴을 실무에 적용하려면, Claude Code 베스트 프랙티스를 함께 읽어보는 것이 좋습니다.
      ja: Ralph Loopとtest oracleパターンを実務に適用するなら、Claude Codeのベストプラクティスも併せて読むことをお勧めします。
      en: If you want to apply the Ralph Loop and test oracle patterns in practice, pair it with these Claude Code best practices.
      zh: 如果想在实际工作中应用Ralph Loop和test oracle模式，建议配合阅读Claude Code最佳实践。
---

两周内完成了一篇理论物理学论文。这通常需要一年的时间。

3月23日，Anthropic新开设了Science博客。第一篇文章的标题颇具挑衅性——"Vibe Physics: The AI Grad Student"。这是哈佛大学物理学教授Matthew Schwartz直接指导Claude Opus 4.5进行理论物理计算的实验记录。

说实话，看到标题时我以为又是一篇"AI革命性地改变科学"的文章，但读完发现完全不是那么回事。与其说是成功故事，不如说更像是一本**指导日志**。

## 110次草稿，36M Tokens

Schwartz教授做的事情很简单。他本人没有直接碰过任何文件，而是让Claude来执行理论物理计算。结果如下：

- 生成了**110多个草稿**
- 消耗了**36M tokens**（按GPT-4标准约2700万字）
- **40多小时的本地CPU运算**
- 最终产出：一篇技术上严谨的高能理论物理学论文

一年的工作量压缩到了两周。单看数字确实惊人。但Schwartz教授的结论却出乎意料地冷静。

## "G2水平"——研究生二年级

Schwartz将当前LLM的理论物理能力评估为**G2（研究生二年级）**水平。"快速、不知疲倦、交代什么就认真做什么。但相当粗糙。"原文表述为"impressively capable, but also sloppy enough that domain expertise was essential"。

我认为这个评价并非仅适用于物理学。让AI写代码也好、写文章也好，感觉都差不多。前80%快得惊人，但剩下的20%需要专家的眼光。"vibe coding"这个说法流行起来也是同样的道理——看起来好像能跑，但是不是真的对，还得人来看。

这里有一个重要的启示。AI不是在"代替"研究，而是在**放大专家的生产力**。如果一个不懂物理的人让Claude写论文，得到的结果很可能看似合理却是错的。

## 同步发布的实战模式：Ralph Loop

Science博客的第二篇文章更加实用。由Anthropic Discovery团队的Siddharth Mishra-Sharma撰写的"Long-running Claude for scientific computing"，其中介绍的**Ralph Loop**模式引起了我的注意。

```bash
# Ralph Loop——重复执行直到满足成功条件
while true; do
  claude --print "读取CHANGELOG.md，继续处理尚未完成的
    任务。当所有测试通过后，
    创建DONE.md文件。"

  if [ -f "DONE.md" ]; then
    echo "任务完成"
    break
  fi

  echo "尚未完成，重试..."
done
```

核心要点有两个：

1. **将CHANGELOG.md作为长期记忆使用**——Agent每次运行时读取之前的进度，从上次中断的地方继续
2. **Test Oracle**——必须有参考实现或测试套件，Agent才能判断自己"是在推进，还是在原地打转"

看到这个模式，我想到了我们团队使用的CI/CD流水线。归根结底，要让Agent承担长时间的工作，就需要**可验证的中间检查点**。

## 为什么Anthropic要单独创建"Science博客"？

Anthropic已经有Research博客了。另外开设Science博客是有深意的。

现有的Research博客聚焦于"关于模型本身的研究"，而Science博客则关注"将模型作为工具使用的科学家的故事"。继Claude for Life Sciences（2025年10月）、Claude for Healthcare（2026年1月）之后，加上AI for Science项目——Anthropic正在从"通用AI助手"向"科学研究基础设施"扩展定位。

个人而言，我对这个方向既期待又担忧。科学研究中AI"粗糙"所带来的风险，与编程错误完全不在一个量级。如果论文中混入了微妙的计算错误，它可能作为其他研究的基础被广泛传播。像Schwartz教授这样由领域专家仔细验证的情况没问题，但当"vibe physics"普及化后，不经验证就放过的案例也会随之增加。

## 工程师能带走什么

即使你不打算写物理论文，这个实验的启示也很明确。

**将长时间任务委托给AI的模式正在形成。** 通过CLAUDE.md提供项目上下文，通过CHANGELOG.md跟踪状态，通过test oracle验证质量。这个结构无论是物理研究、数据管道建设还是大规模重构，都同样适用。

但别忘了"G2水平"这个评价。一个勤奋但需要监督的研究生。没有这个前提就直接使用产出，问题出现的速度会和产出的速度一样快。
