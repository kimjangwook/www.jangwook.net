---
heroImage: '../../../assets/blog/anthropic-vibe-physics-ai-research-assistant-hero.jpg'
title: Vibe Physics — A Physics Professor Had Claude Write a Paper
description: >-
  Analyzing Anthropic's Science blog debut where Harvard physicist Matthew
  Schwartz supervised Claude as an 'AI grad student.' 110 drafts, 36M tokens,
  and a paper completed in two weeks.
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

A theoretical physics paper was completed in two weeks. That's work that normally takes a year.

On March 23, Anthropic launched its new Science blog. The first post has a provocative title — "Vibe Physics: The AI Grad Student." It's an experiment log from Harvard physics professor Matthew Schwartz, who directly supervised Claude Opus 4.5 through theoretical physics calculations.

I'll be honest — when I saw the title, I thought it'd be another "AI is revolutionizing science" piece. But it turned out to be something quite different. Less a success story, more a **supervision journal**.

## 110 Drafts, 36M Tokens

What Schwartz did was straightforward. He never touched a file himself — he had Claude do the theoretical physics calculations. The results:

- Over **110 separate drafts** generated
- **36M tokens** consumed (roughly 27 million words by GPT-4 standards)
- **40+ hours of local CPU computation**
- Final output: one technically rigorous high-energy theoretical physics paper

A year's work compressed into two weeks. The numbers are impressive. But Schwartz's conclusion is surprisingly measured.

## "G2 Level" — A Second-Year Grad Student

Schwartz rated current LLMs' theoretical physics capability at the **G2 (second-year graduate student) level**. "Fast, indefatigable, and eager to please. But pretty sloppy." His exact words: "impressively capable, but also sloppy enough that domain expertise was essential."

I don't think this assessment applies only to physics. I get the same feeling when having AI write code or prose. It's impressively fast up to 80%, but that last 20% requires an expert's eye. The popularity of "vibe coding" stems from the same dynamic — things seem to work, but you need a human to verify they actually do.

The implication is significant. AI isn't "replacing" research — it's **amplifying expert productivity**. If someone without physics knowledge asks Claude to write a paper, the output would likely be plausible but wrong.

## A Practical Pattern Released Alongside: The Ralph Loop

The Science blog's second post is more hands-on. Written by Siddharth Mishra-Sharma from Anthropic's Discovery team, "Long-running Claude for scientific computing" introduces the **Ralph Loop** pattern, which caught my attention.

```bash
# Ralph Loop — repeat until success criteria are met
while true; do
  claude --print "Read CHANGELOG.md and continue working on
    any incomplete tasks. When all tests pass,
    create a DONE.md file."

  if [ -f "DONE.md" ]; then
    echo "Task complete"
    break
  fi

  echo "Not done yet, retrying..."
done
```

Two key ideas here:

1. **CHANGELOG.md as long-term memory** — the agent reads previous progress at each run and picks up where it left off
2. **Test Oracle** — a reference implementation or test suite is needed so the agent can tell whether it's making progress or spinning its wheels

This pattern reminded me of the CI/CD pipelines we use on our team. Ultimately, delegating long-running tasks to an agent requires **verifiable intermediate checkpoints**.

## Why Did Anthropic Create a Separate "Science Blog"?

Anthropic already has a Research blog. Launching a separate Science blog signals something deliberate.

While the Research blog focuses on "research about models themselves," the Science blog spotlights "scientists using models as tools." Following Claude for Life Sciences (October 2025), Claude for Healthcare (January 2026), and the AI for Science program — Anthropic is expanding its positioning from "general AI assistant" to "scientific research infrastructure."

Personally, I find this direction exciting but also concerning. The risks of AI "sloppiness" in scientific research are in a different league from coding bugs. If a subtle calculation error makes it into a paper, it could propagate as the foundation for other research. Cases like Schwartz's, with a domain expert meticulously verifying every step, are fine. But as "vibe physics" becomes mainstream, cases without proper verification will inevitably increase.

## What Engineers Can Take Away

You probably won't be writing physics papers, but the lessons from this experiment are clear.

**Patterns for delegating long-running tasks to AI are being established.** Provide project context via CLAUDE.md, track state via CHANGELOG.md, verify quality with a test oracle. This structure applies equally whether you're doing physics research, building data pipelines, or tackling a large-scale refactoring.

Just don't forget the "G2 level" assessment. An eager but supervision-required grad student. Use the output without that premise, and problems will surface as fast as the work was produced.
