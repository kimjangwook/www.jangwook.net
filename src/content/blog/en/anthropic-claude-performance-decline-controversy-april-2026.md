---
title: The Anthropic Claude Performance Decline Controversy — What Actually Happened
description: >-
  In March 2026, Anthropic quietly lowered Claude default effort to "medium."
  This post breaks down the power user backlash, pricing controversy, and what
  it reveals about trust in AI services.
pubDate: '2026-04-17'
heroImage: >-
  ../../../assets/blog/anthropic-claude-performance-decline-controversy-april-2026-hero.jpg
tags:
  - anthropic
  - claude
  - ai-performance
  - llm
relatedPosts:
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.94
    reason:
      ko: Anthropic이 Mythos 개발에 컴퓨트를 집중하면서 기존 Claude 성능이 조정됐다는 추측이 있다. Mythos 미리보기가 궁금하다면 이 글이 그 맥락을 제공한다.
      ja: AnthropicがMythos開発にコンピュートを集中する一方、既存Claudeの性能が調整されたという推測がある。Mythosのプレビューに興味があれば、このポストがその背景を理解する助けになる。
      en: There's speculation Anthropic shifted compute toward Mythos development while quietly adjusting existing Claude performance. If you're curious about Mythos, this post provides useful context for that theory.
      zh: 有猜测称Anthropic将算力集中于Mythos开发，同时悄悄调整了现有Claude的性能。如果你对Mythos感兴趣，这篇文章为该理论提供了有用的背景。
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: 이 글에서 다룬 effort 레벨 변경이 실제 Claude Code 사용량에 어떤 영향을 주는지, 사용량 분석 글에서 더 자세히 파악할 수 있다.
      ja: このポストで扱ったeffortレベル変更が実際のClaude Code使用量にどう影響するか、使用量分析ポストでより詳しく把握できる。
      en: The effort level change discussed in this post had direct effects on Claude Code token usage. The usage analysis post breaks down exactly what that shift looked like in practice.
      zh: 这篇文章讨论的effort级别变更对Claude Code实际使用量产生了直接影响。使用量分析文章详细分析了这种变化在实践中的具体表现。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.94
    reason:
      ko: AI 코딩 도구의 실제 사용 패턴과 한계를 정량적으로 분석한 글로, Claude 성능 논란과 비교해 읽으면 AI 코딩 도구 업계 전체 흐름을 파악하는 데 도움이 된다.
      ja: AIコーディングツールの実際の使用パターンと限界を定量的に分析したポストで、Claude性能論争と比較して読むとAIコーディングツール業界全体の流れを把握するのに役立つ。
      en: This Greptile report quantifies how developers actually use AI coding tools — the limitations it documents help contextualize why the effort level change hit power users harder than casual users.
      zh: 这份Greptile报告定量分析了开发者实际使用AI编码工具的方式——它记录的局限性有助于理解为什么effort级别变更对重度用户的影响比普通用户更大。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.94
    reason:
      ko: effort 레벨을 명시적으로 설정하는 방법이 궁금하다면, Claude Opus 4.6 설정 가이드에서 구체적인 파라미터 설정 방법을 확인할 수 있다.
      ja: effortレベルを明示的に設定する方法が気になるなら、Claude Opus 4.6セットアップガイドで具体的なパラメータ設定方法を確認できる。
      en: If you want to pin effort levels explicitly as this post recommends, the Claude Opus 4.6 setup guide shows exactly which parameters to configure and how.
      zh: 如果你想按照本文建议明确设置effort级别，Claude Opus 4.6设置指南详细说明了需要配置哪些参数以及如何配置。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.94
    reason:
      ko: 단일 공급자 의존 리스크를 줄이는 방법으로 로컬 LLM 활용이 있다. Gemma 4로 오프라인 에이전트를 구축하는 방법이 대안적 선택지를 보여준다.
      ja: 単一プロバイダー依存リスクを減らす方法としてローカルLLM活用がある。Gemma 4でオフラインエージェントを構築する方法が代替的な選択肢を示している。
      en: Reducing single-provider dependency is one of this post's core recommendations. Building offline agents with Gemma 4 is a concrete example of what that alternative looks like in practice.
      zh: 减少单一提供商依赖是本文的核心建议之一。使用Gemma 4构建离线代理是该替代方案在实践中的具体示例。
---

"Why is Claude suddenly acting weird?"

That question started circulating in AI developer communities around mid-March. Similar complaints piled up on Reddit's r/ClaudeAI, Hacker News, and X. Reports trickled in of models ignoring instructions, making more mistakes on complex workflows that had previously worked fine. Most people initially assumed it was their own fault — bad prompts, unclear instructions. I was one of them.

This blog is automated with Claude — research, post writing, internal link insertion, multilingual translation, building, deploying. Starting mid-March, I noticed a clear uptick in missed instructions, translation quality dipping, internal link conditions being skipped. Every time it happened, I went back to SKILL.md and tweaked the prompt structure. I rewrote instructions more clearly, reduced file size, cleaned up context. Nothing worked.

On April 14, Fortune published a piece on the phenomenon. Two days later, Axios ran a follow-up analysis. VentureBeat joined with "Is Anthropic nerfing Claude?" Gizmodo went with the fairly direct "Anthropic Is Jacking Up the Price for Power Users Amid Complaints Its Model Is Getting Worse." The pieces clicked together.

It wasn't my prompts. And it probably wasn't yours either.

## What Anthropic Quietly Changed in March

In early March, Anthropic quietly lowered Claude's default "effort" level. The previous default was "high effort" — this was changed to "medium effort."

The person who acknowledged this publicly was Boris Cherny, the Anthropic executive leading Claude Code. He said the change was made because "users gave feedback that Claude was using too many tokens." He added that this change "was disclosed in the changelog and shown in a dialog to users" — that it was "obvious and explicit rather than sneaky."

That explanation may be technically accurate. But many users missed that dialog, or never read the changelog. That fact alone signals a communication failure. "We disclosed it" and "users actually understood it" are two different things.

What is an effort level, exactly? Claude has an internal parameter that controls how deeply it "thinks" before generating a response. <strong>High effort uses more computation, follows instructions more meticulously, and handles complex requests better.</strong> Medium effort is faster and cheaper, but more likely to simplify or skip instructions. Developers using the API could set this parameter explicitly. The problem: the default changed. Anyone who hadn't explicitly specified "high effort" was quietly downgraded to medium.

One critical point worth highlighting: think about enterprise customers. Dozens of employees using Claude across varied workflows, each assuming the API behaves consistently. In that environment, expecting everyone to notice a default value change and manually adjust settings isn't realistic. The normal assumption is: "defaults I didn't touch stay the same."

Looking at how quietly this happened — until Cherny responded on Reddit, there was no proactive communication from official Anthropic channels about what had changed. The executive only spoke up after users raised the alarm and the press covered it. That sequence gave many people the impression that something had been changed "sneakily."

## What "Medium Effort" Actually Means for Workflows

Let me make this concrete.

Say you've asked Claude Code to refactor a complex codebase. At high effort, it traces dependencies between files, maps the blast radius of changes, checks whether a type error propagates across modules, verifies tests won't break. At medium effort? "I'll just change this file, that should do it." The bugs that result are the kind you only discover when tests fail.

I experienced this firsthand. This blog's automation workflow has a fairly complex instruction system — post writing rules, internal link requirements, per-language translation standards — all spread across multiple files. Starting mid-March, I noticed these instructions being partially ignored more frequently. The "minimum 2 internal links" condition would be skipped. Translations started feeling mechanical. Posts came in shorter than required. My diagnosis at the time: "The prompt might be too long and it's not reading the back half." Looking back now, the timing aligns exactly with the early-March effort level change.

There's also an interesting paradox. Some power users reported token consumption jumping 4x to 10x during this period. The reason is simple: <strong>lower quality means more retries.</strong> If the model doesn't follow instructions correctly the first time, the user has to send the request again — burning more tokens in the process. The effort reduction intended to save tokens ended up doing the opposite in many cases. The Register separately reported "Anthropic admits Claude Code quotas running out too fast," with Anthropic acknowledging that hitting usage limits way faster than expected was the team's top priority.

This kind of degradation is hard to detect in automated pipelines. It doesn't present as a visible error on a single request — it shows up as a slow, gradual drop in output quality over time. The people who caught it quickly were mostly those who already ran their outputs through automated quality checks or periodic benchmarks.

Developers shared specific examples. Missed dependency updates in multi-file refactors. Source changes without corresponding test updates. Error handling getting simplified away. One user described it as: "edge cases that used to be handled automatically now have to be specified explicitly." The model felt less proactive.

This gap is nearly invisible on simple tasks. It shows up in complex multi-step workflows, long automation pipelines, and tasks spanning dozens of files. In other words: the people paying the most and using Claude most intensively took the biggest hit.

## Why Power Users Were Furious — The Transparency Problem

More than the technical change itself, what made people angry was the transparency issue.

Using an LLM service means accepting a certain amount of "black box." You don't need to know exactly how the model works — you build workflows, train teams, and integrate tools based on the assumption that a baseline level of performance will be maintained.

Anthropic changed that baseline without notifying users. It wasn't a setting users had configured themselves. The company lowered a default value and buried the disclosure in a changelog.

As I've detailed in my [Claude Code usage analysis](/en/blog/en/claude-code-insights-usage-analysis), the more you integrate Claude Code into production workflows, the more critical predictable model behavior becomes. When yesterday's output differs from today's, debugging whether it's your code or a model change costs real time. For automated pipelines, that cost compounds.

Cherny's pushback backfired. Calling the change "obvious and explicit" at the exact moment hundreds of users were publicly saying "I had no idea" just made the communication gap undeniable. The company might feel it did everything right procedurally. But whether it actually reached users is the more relevant question. Those are different things.

Most enterprise customers don't read weekly changelogs. They assume APIs behave consistently unless they're told otherwise. This change broke that assumption. More precisely: it revealed that the assumption was never formally guaranteed in the first place.

A notable pattern emerged in community responses. Many people described how they discovered the change: they noticed something was off in their outputs first, then backtracked to find the cause. "Code reviews felt shallower." "Summaries were missing key points." After enough of these incidents, people searched and found the effort level change. The fact that there's essentially no tooling for users to track model behavior changes was, once again, made painfully clear.

## The Price Hike Poured Fuel on the Fire

The timing could not have been worse.

On April 16, right in the middle of the performance controversy, Anthropic announced changes to enterprise subscription pricing. The previous model was up to $200 per user per month flat fee — this was switched to "$20/user/month base + compute usage-based charges."

The Register called it "Anthropic ejects bundled tokens from enterprise seat deal." Bundled tokens were removed in favor of pay-as-you-go. For teams with predictable, limited usage, this might actually be cheaper. For heavy users or teams running large-scale automation pipelines, costs could increase significantly.

Performance is down, and the billing structure is now more complex and potentially more expensive for heavy usage. Gizmodo's headline captured what many users felt: "Anthropic Is Jacking Up the Price for Power Users Amid Complaints Its Model Is Getting Worse."

I understand Anthropic's position. Flat-fee models are inherently skewed in favor of heavy users, which may not be sustainable for the provider. Transitioning to usage-based pricing is a reasonable business decision on its own. Pay-as-you-go is, in many ways, fairer to everyone. The problem is sequence. Announcing a price increase when trust is already eroded doesn't let the rationale land properly.

What if the timing had been different? Announce the effort level change clearly. Collect user feedback, adjust the defaults, show that the complaint was heard. Then, separately, announce the pricing change. Three issues wouldn't have exploded simultaneously. Each decision would have had a chance to be evaluated on its own merits. Instead, all three are now bundled into a single "Anthropic is getting worse" narrative.

## The Compute Shortage Theory and Structural Pressure on AI Services

There's a larger context to this controversy.

LLM infrastructure is expensive. Anthropic, OpenAI, Google DeepMind are all pouring billions into data center capacity. According to Fortune's reporting, there's analysis suggesting Anthropic has relatively less data center capacity compared to some competitors. I can't verify this — Anthropic's financials and infrastructure investments aren't public. But the fact that both Fortune and Axios chose to include this context is worth noting. It's not pure speculation; it's industry reporting.

The theory that emerged: Anthropic lowered effort levels partly due to compute constraints — concentrating compute on next-generation model development (like Mythos) while reducing the cost of serving existing models. Anthropic has not officially denied this theory.

I can't confirm it. But "service quality being quietly adjusted under cost pressure" is a topic that almost never gets discussed openly in this industry.

As I noted in my post on [Claude Code's five agentic workflow patterns](/en/blog/en/claude-code-agentic-workflow-patterns-5-types), the more complexity you build into an agent system, the more a small performance change in the underlying model compounds through the whole pipeline. Layer a multi-level orchestrator-subagent structure and one effort level shift can degrade end-to-end reliability significantly. Many Claude Code users confirmed this the hard way.

Users expect "model upgrades mean getting better." What's actually true is that cost pressures can lead to service quality adjustments on existing model versions — without any version change. Both things can be true simultaneously. How the AI services industry navigates that structural tension will, I think, determine its long-term trustworthiness.

## What Developers Should Do Right Now

Three practical takeaways from this episode.

First, <strong>set effort levels explicitly.</strong> If you're calling the Claude API directly, don't rely on defaults. Pin the effort level explicitly in your configuration. You can do this in Claude Code's settings via `default-model-settings` using something like `"thinking": { "type": "enabled", "budget_tokens": 10000 }` to lock in processing depth. Defaults can change. The more critical the workflow, the more important it is to specify every parameter you care about.

Second, <strong>measure output quality regularly.</strong> Detecting silent model behavior changes requires a baseline to compare against. Running a sample of key tasks on a schedule and comparing outputs against previous results would have surfaced this weeks earlier. You don't need a sophisticated evaluation system. A simple script that checks "are all the conditions I specified present in the output?" would have been enough to catch this before it became a public controversy. The goal is change detection, not perfection.

Third, <strong>seriously consider diversifying provider dependency.</strong> When your entire operation runs on a single LLM provider, their pricing decisions and performance adjustments become your infrastructure risk. Many teams are still on "Claude or OpenAI" as a single-provider setup. That's convenient in the short term, but it leaves you with no negotiating leverage and no hedging. You don't need to duplicate everything — but designing at least one critical workflow to also work on a different model gives you optionality. When a major provider changes performance defaults or pricing, having an alternative means you're not held hostage. An abstraction layer like LiteLLM can substantially reduce the cost of switching.

## My Take: Without Transparency, There's No Trust

I have a clear position on this.

<strong>The communication approach was wrong, regardless of whether the technical decision itself was justified.</strong>

I understand the rationale for reducing token usage in response to user feedback. Lowering effort does reduce tokens. I don't think this was malicious. But when a default value changes — especially one that directly affects quality — every user should be notified via email or a prominent in-product banner. A single changelog entry is not sufficient communication. Changes that reduce existing user expectations require active outreach, whatever the justification. Anthropic will likely reset this bar after this experience.

The deeper problem is structural: AI service providers can adjust the performance-cost tradeoff without user awareness. This isn't Anthropic-specific. OpenAI and Google have the same architecture. We're building AI infrastructure with deep single-provider dependency, and there's essentially no tooling for detecting when a provider quietly adjusts service quality.

This controversy will fade. Anthropic can make effort level settings more accessible, strengthen its policy for communicating default value changes, and move on. Some improvement announcements have reportedly already been made. In a few months, this will probably be a footnote.

But if you're building on AI infrastructure, treat this as a signal. Monitoring provider SLA yourself is becoming less optional. As LLM services mature into real infrastructure, the management principles we apply to infrastructure — change detection, SLA monitoring, provider diversification — should apply here too.

"AI keeps getting better" is true. "AI you're already using can quietly change" is also true. Both things coexist. That's what this controversy made visible.
