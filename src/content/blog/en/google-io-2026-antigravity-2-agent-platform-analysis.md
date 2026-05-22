---
title: 'Google I/O 2026 Antigravity 2.0 — Gemini CLI Shutdown and Agent IDE War'
description: >-
  Google announced Antigravity 2.0 at I/O 2026 and is shutting down Gemini CLI on June 18. I dug into the installed app's extension structure and analyzed the Gemini 3.5 Flash API — here's what it all means for developers.
pubDate: '2026-05-21'
heroImage: ../../../assets/blog/google-io-2026-antigravity-hero.png
tags:
  - google
  - antigravity
  - ai
  - developer-tools
  - gemini
relatedPosts:
  - slug: cursor-3-vs-claude-code-vs-windsurf-2026
    score: 0.92
    reason:
      ko: AI 코딩 IDE 3파전(Cursor, Claude Code, Windsurf)을 다룬 이 글을 읽었다면, Antigravity 2.0이 새 경쟁자로 어떻게 자리잡는지 맥락이 생긴다.
      ja: AIコーディングIDE 3社対決(Cursor, Claude Code, Windsurf)を扱った記事を読んでいれば、Antigravity 2.0が新たな競合としてどう位置づけられるかの文脈が生まれる。
      en: If you read this piece on the three-way AI coding IDE battle (Cursor, Claude Code, Windsurf), Antigravity 2.0's entry as a new contender makes much more sense in context.
      zh: 如果你读过这篇关于AI编码IDE三强争霸（Cursor、Claude Code、Windsurf）的文章，就能更好理解Antigravity 2.0作为新竞争者的定位。
  - slug: gemini-31-pro-release
    score: 0.88
    reason:
      ko: Gemini 3.1 Pro를 분석한 이 글과 이어서 읽으면, Gemini 모델이 3.1→3.5로 이동하면서 API 가격과 성능이 어떻게 변화했는지 추적할 수 있다.
      ja: Gemini 3.1 Proを分析したこの記事と併せて読むと、Geminiモデルが3.1→3.5へ移行する中でAPIの価格と性能がどう変化したか追跡できる。
      en: Read alongside this Gemini 3.1 Pro analysis to track how the model's API pricing and performance evolved from 3.1 to 3.5.
      zh: 与这篇Gemini 3.1 Pro分析文章一起阅读，可以追踪Gemini模型从3.1到3.5的API价格和性能变化。
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.85
    reason:
      ko: Claude Code로 병렬 에이전트를 실행하는 방법을 이미 알고 있다면, Antigravity 2.0의 parallel subagent 설계가 어디서 다르고 어디서 비슷한지 더 정확히 판단할 수 있다.
      ja: Claude Codeで並列エージェントを実行する方法を知っていれば、Antigravity 2.0のparallel subagent設計がどこで違いどこで似ているかをより正確に判断できる。
      en: If you already know how to run parallel agents in Claude Code, you can more precisely judge where Antigravity 2.0's parallel subagent design diverges and where it converges.
      zh: 如果你已经了解如何在Claude Code中运行并行代理，就能更准确地判断Antigravity 2.0的并行子代理设计在哪里不同、哪里相似。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.83
    reason:
      ko: 2026년 주요 LLM API 가격을 비교한 이 글과 함께 보면, Gemini 3.5 Flash의 $1.50/MTok이 경쟁 가격 대비 어떤 위치인지 직접 숫자로 비교할 수 있다.
      ja: 2026年の主要LLM API価格を比較したこの記事と合わせると、Gemini 3.5 Flashの$1.50/MTokが競合価格対比でどの位置にあるか直接数字で比較できる。
      en: Read alongside this 2026 LLM API pricing comparison to place Gemini 3.5 Flash's $1.50/MTok in direct numerical context against competitors.
      zh: 与这篇2026年主要LLM API价格对比文章一起看，可以直接用数字比较Gemini 3.5 Flash的$1.50/MTok在竞争价格中的位置。
  - slug: multi-agent-orchestration-routing
    score: 0.81
    reason:
      ko: 멀티 에이전트 오케스트레이션 라우팅 패턴을 다룬 이 글의 개념들이 Antigravity 2.0의 parallel subagent 설계에 그대로 적용된다.
      ja: マルチエージェントオーケストレーションのルーティングパターンを扱ったこの記事の概念が、Antigravity 2.0のparallel subagent設計にそのまま適用される。
      en: The multi-agent orchestration routing patterns covered here map directly onto Antigravity 2.0's parallel subagent design.
      zh: 本文中关于多代理编排路由模式的概念直接适用于Antigravity 2.0的并行子代理设计。
---

It's been two days since Google I/O 2026. I was rewatching the keynote and got curious — is Antigravity already installed on my machine?

```bash
$ defaults read /Applications/Antigravity.app/Contents/Info.plist CFBundleShortVersionString
1.23.2
```

It was. Version 1.23.2. So I opened it up. This post is what I found.

## What Is Antigravity 2.0 — The Short Version

Announced at Google I/O 2026, Antigravity 2.0 is an "agent-first development platform." It bundles a desktop IDE, a CLI (`agy`), an SDK, a Managed Agents API tier, and an enterprise deployment path through the Gemini Enterprise Agent Platform into a single product family.

Where the original Antigravity was essentially a Cursor clone with Gemini under the hood, version 2.0 aims to integrate multi-agent orchestration at the platform level.

And Gemini CLI is shutting down on June 18, 2026. AI Pro, AI Ultra, and free-tier users all get the same message. Google is forcing a migration from open source to closed software with a usage cap and a hard deadline.

### Three Things That Actually Matter

I almost wrote this off as "another Cursor clone with a new skin." Three things changed my mind.

**Gemini CLI retirement**: Gemini CLI was open source. Tens of thousands of developers contributed to it, forked it, built on it. Replacing it with a closed product is a strategic signal — Google is moving developer tooling into its monetization stack.

**GEMINI.md and `.agents/` directory**: If you've used Claude Code, you know `CLAUDE.md` and `.claude/agents/`. Antigravity uses the same pattern. Agent definition files live in the project directory and behave like a build system. This convention is converging across platforms.

**Gemini 3.5 Flash pricing**: $1.50/MTok input, $9.00/MTok output. 1M token context. This price table determines whether Antigravity is actually cost-competitive.

## What I Found Inside the App

Antigravity is an Electron app built on VS Code 1.107.

```bash
$ cat /Applications/Antigravity.app/Contents/Resources/app/product.json
# version: 1.107.0
# nameShort: Antigravity
```

The extension list:

```
/extensions/antigravity/              ← Core agent extension (v0.2.0)
/extensions/antigravity-code-executor/    ← Executes code generated by Cascade
/extensions/antigravity-dev-containers/   ← Remote container support
/extensions/antigravity-remote-openssh/   ← SSH remote work
```

The `jsonValidation` entry in `package.json` was the most interesting thing I found:

```json
{
  "fileMatch": "**/mcp_config.json",
  "url": "./schemas/mcp_config.schema.json"
}
```

MCP config schema baked in. Antigravity natively supports the MCP ecosystem for agent tool extensions.

The command list also had notable entries:

```
antigravity.importCursorSettings
antigravity.importWindsurfSettings
antigravity.importVSCodeSettings
antigravity.importCiderSettings
```

Four competitor products' settings can be imported out of the box. "Remove migration friction" is the obvious intent — and it works. Anyone who's spent an afternoon re-configuring keybindings after switching IDEs will appreciate this.

The Cascade panel (`cascade-panel.html`) is the agent interface. The `antigravity-code-executor` extension runs the code Cascade generates.

The `agy` CLI is not yet publicly available. `npm install -g @google/antigravity` returns a 404. Homebrew Cask installs the desktop app only. I'm switching to Source Review for the feature analysis below.

## Antigravity 2.0 Features — Based on Docs and Official Examples

### Multi-Agent Parallel Execution

A lead agent takes a high-level goal and delegates to specialist subagents running in parallel. Each subagent has its own context window, model, prompt, and tool set. Google's public examples describe four subagent types:

- **Architect Agent**: Structure and design patterns
- **Coding Agent**: Implementation details
- **Testing Agent**: Unit and regression tests
- **Documentation Agent**: Auto-updating technical docs

This is essentially the same pattern as [running parallel agents with Claude Code using Git worktrees](/en/blog/en/claude-code-parallel-sessions-git-worktree). The difference is that Google wraps it in a GUI where you can watch the agents work side-by-side.

### GEMINI.md and the .agents/ Directory

`GEMINI.md` at the project root gives all agents shared context. `.agents/agents.md` defines subagent behaviors. `.agents/skills.md` declares reusable capabilities across agents.

If you've been following [multi-agent orchestration routing patterns](/en/blog/en/multi-agent-orchestration-routing), these conventions are familiar. The industry appears to be converging on this file-based agent configuration model regardless of which platform you're on.

### The agy CLI — Announced, Not Yet Deployed

Google announced `agy` as the replacement for Gemini CLI. Theoretically you'll be able to type `agy new-agent` at a terminal and spin up an Antigravity agent from the command line. Agent Skills, Hooks, Subagents, and Extensions from Gemini CLI are all supposed to carry over.

The problem: as of May 21, 2026, `agy` doesn't exist on any public package manager. The Register's headline put it plainly: "[Bye-bye, Gemini CLI; Google nudges devs toward Antigravity](https://www.theregister.com/ai-ml/2026/05/20/bye-bye-gemini-cli-google-nudges-devs-toward-antigravity/5243605)." The feature replacement isn't ready, but the shutdown date is set.

## Gemini 3.5 Flash API — Price Analysis

The engine powering Antigravity 2.0 is Gemini 3.5 Flash, which went generally available on May 19, 2026.

| Metric | Value |
|--------|-------|
| Input price | $1.50 / 1M tokens |
| Output price | $9.00 / 1M tokens |
| Context window | 1,048,576 tokens (~786K words) |
| Max output | 65,536 tokens |
| Speed | ~4x faster than comparable frontier models |

Compare that to Claude Opus 4.7 at $15/$75 per MTok — that's 10x cheaper on input. The model capability gap is real, but Gemini 3.5 Flash outperforms Gemini 3.1 Pro on five separate benchmarks: Terminal-Bench 2.1 (76.2%), GDPval-AA (1656 Elo), and MCP Atlas (83.6%).

For coding agents that make many small calls — writing tests, fixing linting errors, generating boilerplate — Gemini 3.5 Flash's price point starts to look compelling. This is where I think Antigravity's actual competitive advantage sits.

## GEMINI.md vs CLAUDE.md — Same Pattern, Different Ecosystem

I use Claude Code daily. The `CLAUDE.md` / `.claude/agents/` / `.claude/skills/` structure is my normal workflow. Antigravity's `GEMINI.md` / `.agents/` / `skills.md` is structurally identical.

The execution model differs:

**Claude Code**: Terminal-first CLI. No GUI. Compose agents through code and prompts. High transparency — you can read exactly what each agent is doing.

**Antigravity**: GUI-first IDE. Parallel agents are visualized in the interface. Better for onboarding non-terminal users; worse for power users who want fine-grained control.

**MCP support**: Both platforms support MCP, but Antigravity bakes the schema validation in at the extension level. From what I saw in the file structure, it's more first-class than in Claude Code.

## Cascade by Another Name — Not a Coincidence

Antigravity's agent panel is called Cascade. Windsurf's is also called Cascade. I confirmed this in the official docs of both products.

Windsurf (originally Codeium) built its market position on Cascade — agentic coding differentiated from Cursor's autocomplete-focused approach. Antigravity using the same name is a direct signal that Google is targeting Windsurf's user base. The `antigravity.importWindsurfSettings` command in the built-in list confirms the intent.

[When I compared Cursor, Claude Code, and Windsurf](/en/blog/en/cursor-3-vs-claude-code-vs-windsurf-2026), I wrote about a three-way competition. That analysis needs updating now. The IDE war just added a fourth serious player backed by Google infrastructure and Gemini model pricing.

## Enterprise Users Get a Pass

One important carve-out: the Gemini CLI shutdown does not apply to organizations with Gemini Code Assist Standard or Enterprise licenses. Google Cloud's Gemini Code Assist for GitHub is similarly unaffected.

This matters because it tells you where Google's priorities are. Enterprise contract revenue is protected. The migration pressure falls on individual developers, small teams, and startups — exactly the population that built Gemini CLI's open-source community.

I find this more troubling than the technical decisions. Open source tooling thrives when the community of builders trusts the platform. Once that trust is broken by a forced migration, it doesn't come back easily.

## My Take: This Is Progress, With Real Caveats

Antigravity 2.0 is a serious product in a way that the original wasn't. Multi-agent orchestration baked into the IDE, a competitive model with strong pricing, and MCP-native tooling are the right moves.

The execution is the problem. Deprecating Gemini CLI without a ready replacement. Usage caps on a product replacing an unlimited open-source tool. A hard June 18 deadline before the CLI ships. This is a go-to-market decision that prioritizes conversion metrics over developer trust.

My plan: I'm not switching from Claude Code as my primary environment. But I'm going to start using Gemini 3.5 Flash API for cost-sensitive pipelines immediately — $1.50/MTok input is hard to argue with for high-volume, lower-stakes tasks. Antigravity 2.0 itself gets a proper evaluation once `agy` ships and the usage policy stabilizes.

Google entering the agent IDE market seriously is ultimately good for developers. Competition between Claude Code, Cursor, Windsurf, and now Antigravity means all four will keep improving. But the way you enter matters. The open-source reversal is a mistake that will take time to forgive, even if the product turns out to be excellent.

---

**Executability Assessment (Source Review Lane):**

- Antigravity 2.0 desktop app: Installed (v1.23.2), internal structure directly analyzed
- `agy` CLI: Not yet publicly distributed as of 2026-05-21
- Gemini 3.5 Flash API: Official pricing ($1.50/$9.00 per MTok) confirmed via Google DeepMind
- Multi-agent features: Based on official announcements and Google Codelabs; not directly executed

**Sources:**
- [Google I/O 2026 Developer Highlights](https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/)
- [Gemini CLI → Antigravity Migration Guide](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)
- [Gemini 3.5 Flash — Google DeepMind](https://deepmind.google/models/gemini/flash/)
- [Google Cloud: I/O '26 for Agent Developers](https://cloud.google.com/blog/topics/developers-practitioners/io26-news-for-agent-developers-on-google-cloud)
