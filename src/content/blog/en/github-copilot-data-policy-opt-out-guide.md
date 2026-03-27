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
  - slug: roguepilot-copilot-prompt-injection-security
    score: 0.88
    reason:
      ko: "Copilot의 데이터 정책이 걱정된다면, 이 글에서 다룬 Copilot 프롬프트 인젝션 보안 취약점도 함께 읽어보세요."
      ja: "Copilotのデータポリシーが気になるなら、この記事で取り上げたCopilotプロンプトインジェクションの脆弱性も併せてお読みください。"
      en: "If Copilot's data policy concerns you, also check out this analysis of Copilot prompt injection security vulnerabilities."
      zh: "如果你关心Copilot的数据政策，也建议阅读这篇关于Copilot提示注入安全漏洞的分析。"
  - slug: llm-deanonymization-privacy-risk-defense
    score: 0.82
    reason:
      ko: "AI 도구의 데이터 수집이 걱정된다면, LLM이 익명성을 무너뜨리는 메커니즘을 다룬 이 글도 관련이 있습니다."
      ja: "AIツールのデータ収集が心配なら、LLMが匿名性を崩すメカニズムを扱ったこの記事も関連があります。"
      en: "If AI tool data collection worries you, this article on how LLMs can break anonymity is directly relevant."
      zh: "如果担心AI工具的数据收集，这篇关于LLM如何打破匿名性的文章也很相关。"
  - slug: patent-strategy-llm-era
    score: 0.78
    reason:
      ko: "코드의 지적 재산권 보호에 관심이 있다면, LLM 시대의 특허 전략 변화도 읽어볼 만합니다."
      ja: "コードの知的財産権保護に関心があるなら、LLM時代の特許戦略の変化も一読の価値があります。"
      en: "If you're concerned about code IP protection, the evolving patent strategies in the LLM era are worth reading."
      zh: "如果你关注代码知识产权保护，LLM时代专利策略的变化也值得一读。"
  - slug: gpt-oss-120b-uncensored
    score: 0.75
    reason:
      ko: "GitHub의 데이터 정책 변경과 오픈소스 AI 모델의 무검열 논쟁은 'AI 학습 데이터의 윤리'라는 같은 축에서 연결됩니다."
      ja: "GitHubのデータポリシー変更とオープンソースAIモデルの無検閲論争は、「AI学習データの倫理」という同じ軸で繋がります。"
      en: "GitHub's data policy change and the uncensored open-source AI debate connect on the same axis of AI training data ethics."
      zh: "GitHub的数据政策变更与开源AI模型的无审查争论，在'AI训练数据伦理'这同一轴线上相互关联。"
  - slug: ai-distillation-attacks-enterprise-defense
    score: 0.72
    reason:
      ko: "Copilot이 코드 데이터를 수집하는 것과 AI 모델 증류 공격은 모두 'AI가 학습한 데이터의 소유권' 문제를 다룹니다."
      ja: "CopilotがコードデータをCollectするのとAIモデル蒸留攻撃は、どちらも「AIが学習したデータの所有権」問題を扱います。"
      en: "Copilot collecting code data and AI distillation attacks both deal with the ownership of data AI models learn from."
      zh: "Copilot收集代码数据与AI模型蒸馏攻击，都涉及'AI学习数据的所有权'问题。"
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
