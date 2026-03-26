---
heroImage: ../../../assets/blog/anthropic-vibe-physics-ai-research-assistant-hero.jpg
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
  - slug: functiongemma-270m-tool-calling
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: agents-md-effectiveness
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-agent-cost-reality
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-self-generated-skills-myth
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: dena-perl-go-migration-ai-agents
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
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
