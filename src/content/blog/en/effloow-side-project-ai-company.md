---
title: Effloow — I Built a Company Run by 14 AI Agents as a Side Project
description: >-
  I built a content business powered by 14 AI agents on top of Paperclip. Here
  is how the site runs itself using Laravel, Markdown, and Git, plus lessons
  learned from Day 1 of operating this experiment.
pubDate: '2026-04-02'
heroImage: ../../../assets/blog/effloow-side-project-ai-company-hero.png
tags:
  - side-project
  - ai-agents
  - paperclip
relatedPosts:
  - slug: adding-chinese-support
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: llm-blog-automation
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: agent-effi-flow-pivot-omotenashi-bot
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-plugins-complete-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

In my last post, I installed Paperclip — an AI agent orchestration platform — and took it for a spin. I got as far as hiring agents, assigning issues, and committing code. But stopping there felt like a waste.

So I went ahead and built an actual company.

## What Is Effloow

[Effloow](https://www.effloow.com) is a side project that bills itself as "a content business operated entirely by AI agents." Sounds grandiose, but the reality is pretty straightforward:

- One Laravel-based website
- 14 AI agents connected through Paperclip
- Agents push Markdown files to Git, and the site renders them automatically

No CMS. No admin panel. Agents create `.md` files and commit them; Laravel reads those files and spits out HTML. That's the whole thing.

![Effloow homepage — content is rendered automatically](../../../assets/blog/effloow-side-project-ai-company-home.png)

## Why I Built This

After setting up Paperclip, my thinking was simple: "I need to actually build something with this to really get it." Running a single agent from the CLI is one thing. Operating 14 of them like an organization is an entirely different problem. For practical examples of agent skill configuration and orchestration strategies, see the [Anthropic Agent Skills Practical Guide](/en/blog/en/anthropic-agent-skills-practical-guide).

I was also curious. <strong>Can a company actually run on AI alone?</strong> Revenue could be zero — that was fine. I wanted to know whether the loop of producing content, maintaining a site, and managing quality could keep spinning without a human in the mix.

## Org Structure: 5 Teams, 14 Agents

Effloow's agents are organized into five business units.

![Paperclip agent list — 14 agents arranged in a hierarchy under the CEO](../../../assets/blog/effloow-side-project-ai-company-agents.png)

<strong>Media Team</strong> — Posts operations logs, weekly roundups, and company news to the blog. The Editor-in-Chief oversees everything, and the Publisher handles deployment like a DevOps engineer.

<strong>Content Factory</strong> — Produces long-form, SEO-targeted articles. The Trend Scout identifies topics, the Writer drafts them, and the Lead Researcher handles fact-checking.

<strong>Tool Forge</strong> — Builds free web tools. The only one so far is the twMerge Playground — an interactive tool for debugging Tailwind CSS class conflicts. The Builder agent owns this. For adding real-time streaming to interactive AI tools, see [Building a Claude Streaming Agent with Vercel AI SDK](/en/blog/en/vercel-ai-sdk-claude-streaming-agent-2026).

<strong>Experiment Lab</strong> — Runs monetization experiments. It was designed for A/B testing things like AdSense and affiliate links, but so far the experiment count is zero.

<strong>Web Dev</strong> — Manages the site itself. Routing, SEO, the deployment pipeline, and GA4 integration.

Here is what it looks like on the Paperclip dashboard:

![Paperclip issue board — 12 issues created and processed](../../../assets/blog/effloow-side-project-ai-company-issues.png)

## What Makes the Tech Stack Interesting

My favorite part of Effloow's architecture is that Markdown <strong>is</strong> the database.

When an agent writes an article, here is what it does:

```markdown
---
title: "How We Built a Company Powered by 14 AI Agents"
slug: "how-we-built-ai-company"
category: articles
tags: [ai, paperclip, orchestration]
---

Body content...
```

Commit this `.md` file to Git, and you're done. Laravel's `ContentController` parses the frontmatter to build listings and renders the body. Since it's built on Blade templates, interactive tools work within the same structure — just add a `blade: tools.twmerge-playground` key to the frontmatter, and it routes to a Blade view.

What makes this architecture great is that from the agent's perspective, "create one file and it's deployed." No API calls needed. No database migrations. Git push <strong>is</strong> the deployment.

## Live Dashboard: Watching the Company in Real Time

There's a `/live` page. It shows visitor counts, Lighthouse scores, and content stats in real time.

![Live Dashboard — visitor counts, performance, and content status at a glance via GA4](../../../assets/blog/effloow-side-project-ai-company-live.png)

Right now the visitor count is zero. Obviously — I built this yesterday. The GA4 integration was implemented by the Web Dev Lead agent, and the Lighthouse measurement calls the CLI via `proc_open()`. The agent wrote that code itself, and I noticed it used the array argument approach to prevent shell injection. If I had written it, I probably would have just slapped together a string and called it a day.

## What Actually Happened on Day 1

I created 12 issues in Paperclip and assigned them to agents. Here's how it went:

- <strong>EFF-1</strong> (Content rendering system): The agent confirmed I had already built this and closed the issue
- <strong>EFF-3</strong> (Blade-based tool system): A refactor to integrate interactive tools into the same structure as Markdown. Added a `blade` key to `ContentService.list()`
- <strong>EFF-8</strong> (First article): The Writer agent produced "How We Built a Company Powered by 14 AI Agents"
- <strong>EFF-11</strong> (AdSense pages): Generated Contact and Privacy Policy pages
- <strong>EFF-12</strong> (Live dashboard data collection): GA4 API integration, Lighthouse CLI integration

Ten out of twelve issues were resolved in a single day. The only ones where a human got involved were EFF-1 (I had already implemented it) and EFF-3 (I jumped in and wrote the code first).

## What's Still Missing

To call this a "company," quite a few things are lacking.

<strong>Revenue is zero.</strong> AdSense approval is still pending, and there's no traffic. The Experiment Lab is supposed to run monetization experiments, but there are literally no experiments yet.

<strong>There's no content quality gate.</strong> Who reviews what the Writer produces? The Lead Researcher is supposed to fact-check, but in practice, the Writer's draft gets published almost as-is. A human probably needs to review at least once.

<strong>Collaboration between agents is limited.</strong> Paperclip's issue system follows a "one agent handles one issue" model. Two agents discussing a single issue or exchanging code reviews isn't possible yet.

The thing that bothers me most personally is <strong>the balance between agent autonomy and control</strong>. If I write issues too specifically, I might as well be coding myself. If I write them too abstractly, agents go off in unexpected directions. When I said "add the pages needed for AdSense approval," the agent put my email on a Contact page and generated a Privacy Policy. Technically correct, but the content was pretty thin.

## What I Learned from This Project

After running this for a day, my takeaway is that building a "company" with AI agents is technically feasible, but <strong>management cost doesn't disappear — it changes shape</strong>.

When you manage people, you do 1-on-1s and code reviews. When you manage agents, you write precisely scoped issues and inspect the output. The latter is faster, sure, but when "10 minutes to write one good issue" adds up, you end up spending roughly the same amount of time.

What's undeniable, though, is that <strong>the initial build speed is overwhelming</strong>. In a single day, I had a site + content + tools + GA4 integration + a live dashboard. Doing this solo would have taken at least a week.

I plan to keep running Effloow. The next goal is having agents generate their own issues — the Trend Scout finds topics, the Board creates issues, and they get auto-assigned to the Writer. Right now I still have to create every issue myself, so it's a long way from a truly "unmanned company." For implementing agent automation loops combining schedules and API events, see the [Claude Code Routines Practical Guide](/en/blog/en/claude-code-routines-practical-guide-2026).

The code isn't open-sourced yet, but you can see the site at [effloow.com](https://www.effloow.com). I'll be documenting progress in a weekly Effloow Weekly series.
