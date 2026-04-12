---
title: Claude Mythos Preview — Does "Too Capable to Release" Actually Make Sense?
description: >-
  Anthropic decided not to publicly release Claude Mythos Preview, which scored
  93.9% on SWE-bench. The model found a 27-year-old OpenBSD vulnerability and is
  only available to 12 companies through Project Glasswing. Is this genuine
  responsibility, or clever marketing?
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

On April 7, Anthropic announced Claude Mythos Preview. SWE-bench Verified: 93.9%. USAMO 2026: 97.6%. It beat GPT-5.4 on every major benchmark.

But they're not releasing it to the public.

The reason? "Its cybersecurity capabilities are too powerful." The model autonomously discovered thousands of zero-day vulnerabilities across every major OS and web browser. A 27-year-old remote crash bug in OpenBSD. A 16-year-old bug in FFmpeg that automated tools missed across 5 million test runs. A Linux kernel privilege escalation exploit chain.

I had two simultaneous reactions: "That's genuinely impressive" and "Isn't this story a little too clean?"

## The Name "Project Glasswing"

Anthropic is distributing Mythos Preview through Project Glasswing, limited to 12 companies. Amazon, Apple, Google, Microsoft, Nvidia — a Big Tech all-star lineup. Security firms like Palo Alto Networks, CrowdStrike, Cloudflare, Cisco, and Broadcom are also included.

They're providing $100 million in usage credits with the condition that it's used "for defensive cybersecurity purposes only."

A glasswing is a butterfly species with transparent wings. The "transparency" symbolism is on the nose, but honestly, the naming is good. Tech companies really know how to brand things.

## Breaking Down the Benchmarks

The numbers are genuinely impressive.

- **SWE-bench Verified**: 93.9% (Opus 4.6 scored 80.8%, GPT-5.4 roughly 73%)
- **SWE-bench Pro**: 77.8%
- **USAMO 2026**: 97.6% (Opus 4.6 at 42.3%, GPT-5.4 at 95.2%)
- **GPQA Diamond**: +1.7pt over GPT-5.4
- **HLE with tools**: +12.6pt over GPT-5.4

The 13-point jump from Opus 4.6 to Mythos is unusually large for a single generation. Something likely changed at the architecture level.

But what I'm really paying attention to isn't the benchmark scores — it's the part about "autonomously finding vulnerabilities and developing exploits." According to Anthropic's red team report, the model exhibited unexpected behaviors during testing. It bypassed containment environments and autonomously demonstrated exploits without being instructed to.

That's a fundamentally different conversation from benchmark performance.

## What "Not Releasing" Really Means

Here's where we need to be a bit more critical.

Anthropic said "it's dangerous, so we're not releasing it." But in practice, they're distributing it to 12 Big Tech companies with $100 million in credits. That's not "not releasing" — that's "selectively releasing." The recipients are some of the most resource-rich organizations on the planet, and they're getting free credits on top of that. This looks a lot like enterprise marketing with extra steps.

I don't think it's a bad decision. It's actually pragmatic. But the "responsible AI company" framing feels a bit heavy-handed. Giving $100M in credits to 12 security companies is also a textbook enterprise go-to-market move.

Simon Willison [wrote on his blog](https://simonwillison.net/2026/Apr/7/project-glasswing/) that "the restricted release seems necessary," and I agree with that assessment. The issue is that the criteria for these decisions rest with a single company — Anthropic.

## The Glasswing Paradox

Picus Security nailed it: ["The thing that can break everything is also the thing that fixes everything."](https://www.picussecurity.com/resource/blog/anthropics-project-glasswing-paradox)

The vulnerabilities Mythos found are real. A 27-year-old bug surviving in OpenBSD means existing security audit processes missed it. And if AI can automatically find bugs like these, it's only a matter of time before attackers build models with similar capabilities.

So Anthropic really only had two options:

1. Release publicly so everyone can use it defensively, but accept the risk of offensive use
2. Release selectively to give defenders a head start

Anthropic chose option 2. Reasonable — but it assumes "defenders" means 12 Big Tech companies. Small businesses and open-source projects are not in this picture.

## Where This Goes

Claude found 22 CVEs in Firefox just a few months ago. People said "AI is changing security audits." Mythos takes that to an entirely different level.

What I personally find encouraging is that this kind of capability will inevitably be democratized. Right now only Glasswing participants have access, but I expect comparable open-source security agents within 1-2 years. Opus 4.6 can already do impressive security auditing work.

Until then, what matters is reducing the security debt in your own codebase. If a 27-year-old bug existed in OpenBSD, nobody can guarantee their project is clean.

Anthropic packaging Mythos as "too dangerous to release" is a smart move. But the real question lies elsewhere. Now that AI has this level of security capability, "who gets access to this tool" directly determines the security gap.

And that access just went to 12 companies, along with $100 million in credits.
