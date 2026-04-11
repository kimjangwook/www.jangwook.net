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
  - slug: claude-firefox-22-cves-ai-security-audit
    score: 0.95
    reason:
      ko: Mythos 이전에 Claude가 Firefox에서 22개 CVE를 찾아낸 사례다. Mythos의 보안 감사 능력이 어디서 출발했는지 맥락을 잡을 수 있다.
      ja: Mythos以前にClaudeがFirefoxで22件のCVEを発見した事例です。Mythosのセキュリティ監査能力がどこから始まったのか文脈を掴めます。
      en: Before Mythos, Claude found 22 CVEs in Firefox. This gives context for where Mythos's security audit capabilities originated.
      zh: 在Mythos之前，Claude在Firefox中发现了22个CVE。这为Mythos安全审计能力的起源提供了背景。
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.88
    reason:
      ko: MCP 프로토콜에서 발견된 30개 CVE와 엔터프라이즈 하드닝 전략. Mythos급 모델이 등장하면 MCP 보안이 더 중요해진다.
      ja: MCPプロトコルで発見された30件のCVEとエンタープライズハードニング戦略。Mythos級モデルの登場でMCPセキュリティの重要性が増します。
      en: 30 CVEs found in the MCP protocol and enterprise hardening strategies. Mythos-level models make MCP security even more critical.
      zh: MCP协议中发现的30个CVE及企业加固策略。Mythos级别模型的出现使MCP安全更加重要。
  - slug: anthropic-pentagon-ai-governance-cto-lessons
    score: 0.87
    reason:
      ko: Anthropic의 펜타곤 AI 거버넌스 사례를 다뤘다. Glasswing의 제한적 공개 결정이 같은 맥락 위에 있다.
      ja: Anthropicのペンタゴン向けAIガバナンス事例を扱っています。Glasswingの制限公開の決定が同じ文脈上にあります。
      en: Covers Anthropic's Pentagon AI governance case. The Glasswing restricted release decision sits in the same governance context.
      zh: 介绍了Anthropic的五角大楼AI治理案例。Glasswing的限制发布决策处于相同的治理背景中。
  - slug: ai-distillation-attacks-enterprise-defense
    score: 0.84
    reason:
      ko: AI 모델의 IP 보호와 증류 공격 방어 전략. Mythos처럼 강력한 모델의 접근 제한이 왜 필요한지 다른 각도에서 보여준다.
      ja: AIモデルのIP保護と蒸留攻撃防御戦略。Mythosのような強力なモデルへのアクセス制限がなぜ必要かを別の角度から見せます。
      en: AI model IP protection and distillation attack defense. Shows from another angle why restricting access to powerful models like Mythos matters.
      zh: AI模型的IP保护和蒸馏攻击防御策略。从另一个角度展示了为什么限制Mythos等强大模型的访问是必要的。
  - slug: claude-sonnet-46-release
    score: 0.82
    reason:
      ko: Claude Sonnet 4.6 출시 분석. Mythos와 같은 Anthropic 모델 라인업에서 어떤 위치인지 비교할 수 있다.
      ja: Claude Sonnet 4.6のリリース分析。Mythosと同じAnthropicモデルラインナップにおける位置を比較できます。
      en: Analysis of the Claude Sonnet 4.6 release. Compare where it sits in the same Anthropic model lineup as Mythos.
      zh: Claude Sonnet 4.6发布分析。可以比较它在与Mythos相同的Anthropic模型产品线中的定位。
draft: true
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
