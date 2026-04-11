---
title: >-
  GitHub Copilot Will Train AI on Your Code Starting April — Opt Out or You
  Agreed
description: >-
  GitHub announced on March 25 that Copilot Free/Pro/Pro+ user interaction data
  will be used for AI model training by default. Here is how to opt out and what
  it actually means.
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

On March 25, a blog post quietly appeared on GitHub's changelog. The title was polite — "Updates to our Privacy Statement and Terms of Service." The content was less so. **Starting April 24, interaction data from Copilot Free, Pro, and Pro+ users will be used to train AI models by default.**

I first saw this through The Register's coverage, and my honest first reaction was "well, that was inevitable." Offering a free tier without using the data never quite made sense.

## What Exactly Is Changing

The data types GitHub plans to collect are broader than you might expect:

- Code snippets (both inputs and outputs)
- Code suggestions accepted or modified by users
- Code context surrounding the cursor position
- Comments and documentation
- File names and repository structure
- Feature-specific interactions (Copilot Chat, inline suggestions, etc.)
- Feedback on suggestions (👍/👎)

The key issue: this is **opt-out by default**. If you don't actively disable it, you've agreed.

GitHub did clarify a few things:

1. **Business and Enterprise plans are unaffected** — existing org-level policies remain intact
2. **Private repository source code at rest is not used for training** — meaning the stored code itself isn't a training input
3. **Data won't be shared with third-party AI model providers** — it's for GitHub/Microsoft internal training only

Point 2 is a bit subtle. They say "at rest" code isn't used, but the data generated when Copilot reads that code and generates suggestions *is* collected. So private code can still contribute indirectly to model training. That part personally makes me a little uneasy.

## How to Opt Out

The process is straightforward:

1. Log into GitHub
2. Go to **Settings → Copilot → Features**
3. Under the Privacy section, disable **"Allow GitHub to use my data for AI model training"**

If you previously opted out of data collection for product improvements, your preference is preserved. But if you've never touched this setting, it'll be enabled by default starting April 24.

One caveat — if your personal account belongs to an Organization, this setting may not be visible depending on org policies. Check with your org admin.

## Why This Matters (and Why It Might Not)

**The case for concern:**

Your code snippets entering the training pipeline means patterns from your code could surface in suggestions to other developers. If you're working on proprietary algorithms or sensitive business logic, that's worth thinking about. For developers working in private repos, "we don't use your source code at rest" isn't fully reassuring.

**The case for calm:**

Realistically, Copilot is already trained on billions of lines of public code. A few snippets from your interactions are statistically unlikely to have a meaningful impact on the model. And interaction-based training is about improving *which suggestions are useful*, which makes the tool better for everyone.

For my personal projects, I'm not going to opt out. I'm fine contributing to Copilot getting better. But for company code, I'll absolutely be checking.

## The Bigger Picture

This policy change isn't unique to GitHub. The pattern of offering AI tools for free or cheap while using interaction data to improve models is becoming an industry standard. Google's Gemini, Anthropic's Claude — similar policies exist or are coming.

What makes this especially sensitive in the developer tools space is that code is intellectual property. Text conversations and code are fundamentally different in nature.

Ultimately, it's a personal decision. Having an opt-out setting at all is a positive. But **choosing opt-out as the default rather than opt-in** will inevitably draw criticism. Requiring users to actively disable collection, rather than actively enable it, is a deliberate design choice — and not one that favors the user.

## Checklist: What to Do Now

- [ ] Check your settings at GitHub Settings → Copilot → Features
- [ ] If you're an org admin, review Copilot data policies at the Organization level
- [ ] Share the April 24 changes with your team
- [ ] Re-evaluate sensitive code exposure when using Copilot in private repos

It's a one-time check before April 24. Takes five minutes.
