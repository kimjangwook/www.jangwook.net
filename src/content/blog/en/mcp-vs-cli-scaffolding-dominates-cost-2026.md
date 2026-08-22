---
title: I regrouped our agent cost report by harness instead of by model, and the noise I had blamed on MCP moved
description: A controlled study across seven agent scaffoldings and five models found the harness, not the MCP-versus-CLI interface, dominated cost by 5.0x to 28x. Here is what that changes for how an engineering org budgets, audits, and approves agent tooling.
pubDate: '2026-08-22'
heroImage: ../../../assets/blog/mcp-vs-cli-scaffolding-dominates-cost-2026/hero.png
tags:
  - mcp
  - ai-agent
  - llm-cost
relatedPosts:
  - slug: mcp2cli-token-cost-optimization
    score: 0.94
    reason:
      ko: 이 글이 진단 오류로 지목하는 "MCP 토큰 비용은 인터페이스 문제다"라는 프레이밍의 원본이다. 함께 읽어야 논지 전환이 보인다.
      ja: 本稿が診断の誤りとして名指しする「MCPのトークンコストはインターフェースの問題だ」という枠組みの原典。併読して初めて論の転換が見える。
      en: "The original framing this post names as a misdiagnosis: that MCP token cost is an interface problem. Read together, the shift in position is visible."
      zh: 本文指为诊断错误的那套框架的原始出处，即"MCP的token成本是接口问题"。对照阅读才能看清立场的转变。
  - slug: llm-coding-harness-optimization
    score: 0.91
    reason:
      ko: 하네스 계층 자체를 최적화 대상으로 다룬 글. 이 글의 처방(하네스 단일화)의 실행편에 해당한다.
      ja: ハーネス層そのものを最適化対象として扱った記事。本稿の処方(ハーネス単一化)の実行編に当たる。
      en: Treats the harness layer itself as the optimization target, which is the execution side of this post's prescription to standardize on one harness.
      zh: 把harness层本身当作优化对象的文章，对应本文"统一harness"处方的落地部分。
  - slug: anthropic-code-execution-mcp
    score: 0.85
    reason:
      ko: MCP 도구 호출을 코드 실행으로 우회해 컨텍스트를 줄인 사례. CLI 등가물이 없는 도메인에서 쓸 수 있는 제3의 길이다.
      ja: MCPのツール呼び出しをコード実行で迂回し、コンテキストを削った事例。CLI等価物がない領域で使える第三の道。
      en: A case of routing MCP tool calls through code execution to shrink context, which is the third path for domains with no CLI equivalent.
      zh: 用代码执行绕过MCP工具调用以压缩上下文的案例，是无CLI等价物领域可走的第三条路。
---

I wanted to know whether pulling MCP servers out of our agent setup would actually cut the bill, because that is the lever two of my teams kept reaching for. So I went looking for a controlled measurement instead of another practitioner anecdote, and I found one: a paper submitted to arXiv on August 9, 2026, running one fixed software task across seven agent scaffoldings and five language models. The answer is that I had been pulling the wrong lever. The interface barely mattered; the harness sitting above it moved cost by 5.0x to 28x.

That matters to you if the agent line item has your name on it. My call: regroup your cost report by harness name rather than by model name, and stop treating "MCP is N times more expensive than CLI" as a number that means anything until you have fixed the harness. I'm including my own writing in the indictment here. I published a piece a few months back framing MCP token cost as an interface problem, and the framing was wrong at the diagnostic layer even where the arithmetic held.

## What the study actually measured

The design is narrow on purpose. One task, held fixed: six operations against a private online git repository. Seven scaffoldings, five models, and every cell run.

> The dominant effect was the scaffolding. Two of the seven ship no MCP support at all; they completed every run using only the CLI, which shows that MCP is unnecessary for this class of work, and they were 5.0x to 28x cheaper than the five scaffoldings that do support MCP, comparing CLI runs alone with no MCP server attached anywhere.

> — [The Scaffolding Matters More Than the Interface](https://arxiv.org/abs/2608.08654)

Read that comparison carefully, because the shape of it is doing work. It is not MCP runs against CLI runs. It is CLI-only runs on scaffoldings that cannot speak MCP against CLI-only runs on scaffoldings that can, with no server attached on either side. The expensive group was expensive while doing exactly the same thing the cheap group was doing.

The strictly interface-paired comparison, the one the authors set out to make, fell apart: "thirteen strictly paired MCP-to-CLI ratios span 0.43x to 29x, with outliers on both sides." Outliers on both sides. In some pairs MCP was cheaper. Anyone quoting you a single multiplier for MCP overhead is quoting one cell of that spread.

The harness, the task, the verification and the full dataset are open source, which is more than can be said for the estimates this replaces. The paper is blunt about what it is replacing: published estimates that "disagree by more than an order of magnitude while resting on practitioner reports that cannot be reproduced."

## The measurement change that broke the old numbers

Two findings here are causal and the rest is inference, so let me keep them apart.

First, the authors "verified completion by inspecting the repository state rather than trusting the agent's self-report." That single change is where the old consensus died. If you score agent runs by what the agent says it did, you are measuring a model's willingness to declare victory, and that willingness varies by harness. Much of the variance previously attributed to interfaces was variance in how completion got judged.

Second, and this is the finding I found genuinely unsettling: "Agents frequently ignored the interface they were assigned." So an A/B that does not verify the tool calls that actually fired is measuring an unknown blend of both arms. Every MCP-versus-CLI cost comparison I have seen circulated internally, including ones I nodded along to, was built without that verification.

What I cannot tell you is why the MCP-capable scaffoldings cost more while running CLI. The plausible story is that MCP plumbing, tool schema slots, a discovery layer, an approval flow, gets re-resident in context every turn whether or not a server is attached. That story fits, and I have no evidence for it. The paper does not decompose cost into turn count and per-turn input tokens, so the mechanism is open. Same for the most extreme result: a 27-billion-parameter model running locally saw cost vary 139x across scaffoldings while completing the task under all of them. The dispersion is reported. The cause is not known.

## Three axes, and the one everyone is turning

There are three variables in the study, and it is worth ranking them by how much they moved versus how much control you have over them.

**Interface, MCP against CLI.** The axis the paper was built to measure, and it separated on almost nothing. Failure frequency was identical in both arms, in the original runs and the repetitions. It split on one thing only: what failure costs. "12.9 per cent of the money spent on MCP runs bought no completed work against 2.2 per cent on CLI runs." Same failure rate, six times the waste per failure. If your dashboard tracks completion rate, this difference is invisible to you.

**Scaffolding, the seven harnesses.** The axis that dominated. 5.0x to 28x, holding model and task fixed.

**Model, the five of them.** Mattered mostly as a sensitivity multiplier. Smaller models were more exposed to harness choice, hence the 139x on the 27B.

The order you can actually control is scaffolding first, interface second, model third. Most teams I talk to are working the list backwards, negotiating model rates and tuning prompts while the harness floats free.

## The objection I take seriously: the arena was built for CLI to win

The strongest argument against all of this is that the sample chose the conclusion. One task. Six git operations against a repository. Git has had twenty years of command line refinement and it is arguably the single most CLI-mature surface in our field. Showing that a CLI wins at git is close to showing that a hammer wins at nails.

I want to grant this more than a paragraph, because it is not a quibble and the paper hands you the ammunition itself. The 5.0x to 28x figure is not an interface comparison at all; it is a comparison between two groups of scaffoldings, the two that lack MCP support against the five that have it. Group membership correlates with MCP support, and it also correlates with everything else about how those seven tools were built, their default context handling, their retry logic, their system prompt size. The paired comparison that would isolate the interface came back at 0.43x to 29x, which is not a finding, it is a shrug.

So here is what I concede, and I am conceding capability, not wording. Three regions where you should not port this paper's prescription:

Domains with no CLI equivalent, which is most of what my data services team wants to open to agents. Member records, profile data, consent history. The authorization decision for those calls lives outside the filesystem boundary, and building a CLI that reaches them would be building a credential-holding binary on someone's laptop. That is not a cost decision.

Teams without harness authority. If security review or procurement has already designated your harness, the dominant variable in this study is not yours to touch, and the paper's advice reduces to a complaint.

Tasks unlike six git operations. Long multi-service orchestration, workflows where approval round-trips and interactive confirmation belong in the tool layer. Out of sample. In those, interface choice is a user experience decision wearing a cost decision's clothes.

What survives the objection is the part that does not depend on git at all: the harness dominated the interface by roughly an order of magnitude on a task where interface effects should have been at their most visible, and completion was verified by artifact rather than self-report. Even if you believe git rigged the interface comparison, it did not rig the ranking of variables. My call stands, narrowed: for work where a mature CLI already exists, standardize on a CLI-only harness. Everywhere else, keep MCP and fix the harness first anyway.

## Where the real architecture question sits

The same request arrives from both of my teams in different clothes. The renewal team wants agents running repository operations, builds, lint. The data services team wants agents reading member and consent data. Our reflex answer to both had been the same: stand up an MCP server.

The paper splits that reflex, but it took a second source to tell me what the split actually is.

> The harness guides what an agent tries. The infrastructure controls what an agent can do. Both are necessary; only one is authoritative.

> — [Where Security Fits in an AI Agent Stack](https://developer.nvidia.com/blog/where-security-fits-in-an-ai-agent-stack)

MCP processes, plugins, and model-directed code all run inside the harness boundary. A layer designed to be modified cannot reliably enforce controls against its own modification. Which reframes the whole question. It was never MCP against CLI. It is whether the authorization decision for a given tool call sits inside the harness or outside it. Inside, and what you have built is guidance that looks like control, and it will read as control in an audit until the day it doesn't.

For repository operations, authorization already lives outside: the git credential, the branch protection rule, the CI gate. Shell history is the audit trail. Adding an MCP server there buys one more thing to maintain and narrows your harness options for no gain in control. For member and consent data, authorization has to live outside the harness too, which means the API boundary and its own logging, with MCP or something like it as the transport. The transport is not the control. That distinction is what I had been collapsing.

## Three gates I am putting in

Not tips. Gates, because the failure mode of an insight like this is that one senior engineer applies it and nobody else notices.

Harness standardization comes first. One harness per team, version pinned. This is the boring one and it is the whole finding. While the harness floats, no cost report is readable and no A/B you run means anything, because you are re-measuring the dominant variable every time someone upgrades a tool.

Tool registration review is the second. Adding a new MCP server now requires a one-pager answering two questions. Is there a mature CLI for this work? If yes, rejected, use it. Is the authorization decision outside the harness? If it is inside, this goes back to the infrastructure layer before it goes anywhere near a tool definition.

Completion verification is the third, and it is the one I expect to hurt. Our CI aggregates agent run outcomes from what the runs report about themselves. The paper's conclusions changed the moment it stopped doing that, and the same weakness is sitting in our pipeline unexamined. Completion gets judged on artifact state: repository diff, tests passing, schema validation.

Alongside those, one new metric on the team dashboard, promoted to first class: share of tokens burned without completed work. The 12.9 against 2.2 split is the entire practical difference between the two interfaces, and it is precisely the thing a success-rate chart hides. Our reports currently have no line for money spent on failure.

## What a CTO should take from this

The conclusion is not "drop MCP." It is that your cost diagnosis is aimed one layer too low.

If swapping the scaffolding moves spend 5x to 28x on an identical model and task, and 139x on a small local model, then the largest available lever on your agent budget is not vendor rate negotiation and not prompt tuning. It is harness standardization. And the corollary is uncomfortable: if every team picks its own harness, your cost variance across teams will span a single-digit multiple, and that variance will show up in the finance report as model pricing volatility. You will be looking for the leak in the wrong column.

Time to market points the same direction, and here the evidence comes from a vendor with no reason to make this argument:

> Harness design can materially change results: on ARC-AGI-3, retained reasoning and context compaction raised GPT-5.6 Sol's score from 13.3% to 38.3% while reducing output tokens sixfold.

> — [Codex as a platform: build on the open agent harness](https://developers.openai.com/blog/codex-as-a-platform)

Same model. Harness changes only. Nearly triple the score at a sixth of the output tokens. Two independent sources, one academic and one commercial, converging on the layer almost nobody has an owner for.

Compliance cuts the other way, and I want to be explicit about it rather than let the cost argument carry the whole piece. Put the authorization decision in the harness and you have guidance, not control. Auditable enforcement belongs in the infrastructure layer. That is a reason to keep a properly bounded MCP path for sensitive systems even when it costs more, and the cost multiple is not an argument against it.

If you change one thing tomorrow, change the grouping key on your agent cost report from model name to harness name. That is a query edit. It will tell you within a day whether the variance you have been attributing to models was ever about models.

My position, stated plainly. For agent work on surfaces where a mature command line already exists, git, containers, cloud tooling, build chains, MCP is overhead and I would not attach it. For internal systems where authorization lives outside the filesystem boundary, keep it, pin the harness, and budget for failure separately.

What would prove me wrong: run the same comparison on a long multi-service orchestration task, verify the tool calls that actually fired, and find that scaffolding spread collapses to well under an order of magnitude while interface spread widens. Then the dominant variable was the task all along and I was generalizing from git.

The thing this paper shook hardest was not MCP's reputation. It was the habit of grading agents on their own testimony. Most of what our industry calls a measurement is one uncontrolled run with a story attached, and I have written some of it.

## References
- [The Scaffolding Matters More Than the Interface: A Controlled Comparison of MCP and CLI Tool Use Across Seven Agent Scaffoldings, Five Language Models, and One Software Task](https://arxiv.org/abs/2608.08654)
- [Where Security Fits in an AI Agent Stack](https://developer.nvidia.com/blog/where-security-fits-in-an-ai-agent-stack)
- [Codex as a platform: build on the open agent harness](https://developers.openai.com/blog/codex-as-a-platform)
