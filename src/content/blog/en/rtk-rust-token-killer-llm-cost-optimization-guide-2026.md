---
title: 'I Tried RTK (Rust Token Killer) — A CLI Proxy That Cuts LLM Token Costs 60–90%'
description: >-
  RTK (Rust Token Killer) is a CLI proxy that compresses Bash command output before sending it to LLMs in AI coding agents. After real installation, I measured 90% reduction on find and 50% on ls commands. Here's what actually works, what doesn't, how to integrate with Claude Code, and the honest limitations.
pubDate: '2026-05-22'
heroImage: >-
  ../../../assets/blog/rtk-rust-token-killer-hero.png
tags:
  - llm-cost
  - claude-code
  - developer-tools
  - rust
  - token-optimization
relatedPosts:
  - slug: claude-api-prompt-caching-cost-optimization-guide
    score: 0.91
    reason:
      ko: 프롬프트 캐싱이 LLM API 호출 비용을 줄인다면, RTK는 에이전트가 실행하는 명령어의 출력 토큰을 줄인다. 두 방식은 다른 레이어를 공략하므로 함께 쓰면 시너지가 있다.
      ja: プロンプトキャッシングがAPIコストを削減するなら、RTKはエージェントのコマンド出力トークンを削減する。異なるレイヤーへのアプローチなので、併用するとシナジーが生まれる。
      en: Prompt caching reduces API call costs; RTK reduces output tokens from shell commands. They target different layers and work well together.
      zh: 提示缓存减少API调用成本，RTK减少命令输出的token。两者针对不同层级，结合使用效果更好。
  - slug: mcp2cli-token-cost-optimization
    score: 0.88
    reason:
      ko: mcp2cli가 MCP 툴 스키마 주입 토큰을 줄인다면, RTK는 셸 명령어 출력 토큰을 줄인다. LLM 에이전트 비용 최적화의 두 축을 나란히 비교해볼 만하다.
      ja: mcp2cliがMCPツールスキーマのトークンを削減するなら、RTKはシェルコマンド出力トークンを削減する。LLMエージェントコスト最適化の両軸を比較してみるとよい。
      en: While mcp2cli cuts MCP schema injection tokens, RTK cuts shell command output tokens — two complementary axes of LLM agent cost optimization.
      zh: mcp2cli削减MCP工具schema注入token，RTK削减shell命令输出token——LLM代理成本优化的两个互补方向。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.83
    reason:
      ko: 이 글에서 다룬 thinking budget 최적화처럼, RTK도 LLM이 소비하는 "불필요한" 토큰을 줄이는 전략이다. 비용 절감의 접근 방식이 상호 보완적이다.
      ja: thinking budget最適化と同様に、RTKもLLMが消費する「不要な」トークンを削減する戦略だ。コスト削減アプローチが相互補完的だ。
      en: Like thinking budget optimization in that post, RTK also reduces "unnecessary" tokens LLMs consume — complementary cost-reduction strategies.
      zh: 与thinking budget优化一样，RTK也是减少LLM消耗"不必要"token的策略，两种成本削减方法相互补充。
  - slug: claude-code-hooks-workflow
    score: 0.80
    reason:
      ko: RTK가 Claude Code에 통합되는 방식이 PreToolUse 훅이다. 이 글에서 훅의 작동 원리를 먼저 이해하면 RTK 통합이 왜 그렇게 설계됐는지 납득이 된다.
      ja: RTKがClaude Codeに統合される仕組みはPreToolUseフックだ。このフックの動作原理を理解すると、RTKの統合設計の意図がよくわかる。
      en: RTK integrates into Claude Code via PreToolUse hooks. Understanding how hooks work explains why RTK is designed the way it is.
      zh: RTK通过PreToolUse hook集成到Claude Code。了解hook工作原理有助于理解RTK的集成设计。
  - slug: ai-agent-cost-reality
    score: 0.79
    reason:
      ko: AI 에이전트를 프로덕션에 돌리면 실제 비용이 예상보다 훨씬 크다는 걸 이 글에서 다뤘다. RTK는 그 비용 중 셸 명령어 출력 부분을 줄이는 구체적인 해법 중 하나다.
      ja: AIエージェントをプロダクションで動かすと実際のコストが予想より大きいことをこの記事で扱った。RTKはそのコストのうちシェルコマンド出力部分を削減する具体的な解法の一つだ。
      en: That post covered how AI agent costs exceed expectations in production. RTK is one concrete solution for the shell command output portion of that cost.
      zh: 那篇文章讨论了AI代理在生产环境中的实际成本远超预期。RTK是减少其中shell命令输出成本的具体解决方案之一。
---

A month into using Claude Code, I opened the bill and flinched. The real culprit wasn't the API calls themselves — it was **Bash command output** packing the context window. `find . -name "*.ts"` spitting out hundreds of lines, `cargo test` dumping thousands — all tokens, all billable.

RTK (Rust Token Killer) directly targets that problem. It sits between your AI coding agent and the shell, compressing command output before it ever reaches the LLM. The claim: 60–90% token savings. I ran actual tests to see if that holds up.

## What RTK Actually Does

One sentence: **command output filter**. It takes the results of `git status`, `find`, `ls -la` and strips everything the LLM doesn't need to understand the state of your project.

Four strategies do the work:

- **Smart Filtering**: removes irrelevant lines (progress bars, timestamps, repeated headers)
- **Grouping**: condenses similar items (`28 .ts files` instead of 28 individual lines)
- **Truncation**: cuts output above a threshold, marks it `...(truncated)`
- **Deduplication**: removes repeated output patterns

Integration with Claude Code happens via a `PreToolUse` hook. If you understand [how Claude Code hooks work](/en/blog/en/claude-code-hooks-workflow), the design clicks immediately — `rtk init -g` registers it automatically under `~/.claude/hooks/`. After that, when Claude Code runs `git status`, the hook intercepts it and rewrites it as `rtk git status`. Claude Code never knows.

Supported agents: Claude Code, Cursor, Windsurf, Cline, GitHub Copilot CLI, Gemini CLI, Antigravity, Hermes. Single Rust binary, zero runtime dependencies.

## I Installed It and Measured

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

Requires Rust toolchain. On my M3 Mac it took about 1 minute 40 seconds to compile. Verify:

```bash
rtk --version
# rtk 0.40.0
```

Before integrating with Claude Code, I ran manual benchmarks against my blog repository (Astro-based, 258 files).

**Test 1: `find` command**

```
find src/content/blog/ko/ -name "*.md" -type f
```

- Original: **15,360 chars**
- RTK: **2,070 chars**
- Savings: **86.5% (99.9% in tokens)**

Here's what RTK's find output looks like:

```
28F 1D:

./ claude-agent-sdk-subagents-orchestration-tutorial-2026.md
claude-api-prompt-caching-cost-optimization-guide.md
claude-code-agentic-workflow-patterns-5-types.md
...
```

It summarizes the count (`28F 1D: 28 files, 1 directory`) and compresses path prefixes. The dramatic savings come from the fact that find output is mostly repeated path segments.

**Test 2: `ls -la` (large directory)**

```
ls -la src/content/blog/ko/
```

- Original: **23,848 chars** (full permissions, owner, timestamps)
- RTK: **12,069 chars**
- Savings: **49.4%**

Drops the permissions string (`drwxr-xr-x`), owner (`jangwook staff`), and exact timestamps. Leaves filename and size. Reasonable — that's usually what the LLM actually needs.

**Test 3: `git status` (small output)**

- Original: **274 chars**
- RTK: Actually grew larger (expanded tracked file list)
- Savings: **None (counterproductive)**

This is important. Small outputs like `git status` get *inflated* by RTK rather than compressed.

**Test 4: `git log --oneline -20`**

- Savings: **0%** (passthrough)

Short, already-structured output passes through untouched.

**Full stats (`rtk gain`)**:

```
RTK Token Savings (Global Scope)
════════════════════════════════════════════════════════════

Total commands:    6
Input tokens:      9.1K
Output tokens:     3.8K
Tokens saved:      5.5K (60.6%)
Total exec time:   153ms (avg 25ms)
Efficiency meter: ███████████████░░░░░░░░░ 60.6%

By Command
  rtk ls:    49.4% saved
  rtk find:  99.9% saved (in tokens)
  rtk git:   0% saved
```

60.6% average across 6 commands. But this test was skewed toward large-output commands (find, ls), so the headline number looks better than a real mixed workload would.

## Where It Works and Where It Doesn't

Honestly, the advertised "60–90%" doesn't show up for every command. The effect splits sharply by command type.

**Commands where RTK helps a lot**:

| Command | Why |
|---------|-----|
| `find` | Mostly repeated path prefixes → dramatic compression on summary |
| `ls -la` (large dirs) | Permissions and owner removal adds up |
| `cargo test` | Strips success cases, shows only failures |
| `npm test` / `jest` | Test summary compression |
| `docker ps` | Long container IDs and port info compressed |
| `grep -r` (large) | Context line removal |

**Commands where RTK barely helps**:

| Command | Why |
|---------|-----|
| `git status` (small changes) | Already short → nothing to compress |
| `git log --oneline` | Already condensed format |
| `cat` (single file) | Content is the point — can't compress |
| `echo`, `pwd`, simple commands | Passthrough |

Project shape matters. TypeScript monorepo with frequent `tsc --noEmit` runs? RTK probably helps noticeably. Mostly API calls and small file edits? Savings will be minimal.

## How to Integrate with Claude Code

Two steps.

**Step 1: Install**

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

**Step 2: Register the Claude Code hook**

```bash
rtk init -g
```

`-g` means global (`~/.claude/`). Drop `-g` if you only want per-project application. It asks:

- Whether to auto-patch `~/.claude/settings.json` (say y)
- Whether to create `~/.claude/RTK.md` (Claude's awareness file for rtk usage)

Restart Claude Code. After that, all Bash tool calls are automatically rewritten through RTK. Run `git status` through Claude Code and check `rtk gain` — if it shows a new record, the integration worked.

One caveat: the hook only fires on **Bash tool calls**. Claude Code's built-in Read, Grep, and Glob tools bypass the hook entirely. Actual savings depend on how often your agent uses Bash for file exploration vs. native tools.

Another thing: there's a different Rust tool also named `rtk` — [reachingforthejack/rtk](https://github.com/reachingforthejack/rtk) (Rust Type Kit). If `rtk gain` doesn't work after installation, check for a name collision.

## Putting RTK in Context

Three layers where you can cut LLM agent costs:

1. **Model selection**: switch to cheaper models (Haiku, Flash)
2. **API layer**: [prompt caching](/en/blog/en/claude-api-prompt-caching-cost-optimization-guide), batch API, [MCP schema compression](/en/blog/en/mcp2cli-token-cost-optimization)
3. **Shell layer**: RTK (command output compression)

RTK is layer 3. If you haven't touched this layer yet, there's likely real savings here. If you've already optimized model choice and caching, RTK's marginal contribution gets smaller.

What I genuinely like: **it's transparent**. `rtk init -g` once, done. No changing how you write prompts. No manually prepending `rtk` to every command. Just use Claude Code the same way you always have. That kind of zero-behavior-change optimization has very low psychological friction.

## Honest Limitations

A few things frustrated me after a few days of real use.

**First**: RTK's compression can strip important information. I had a failed test where the error stack trace was partially truncated. You can access raw output with `rtk err <command>` or `rtk proxy <command>`, but Claude Code can't automatically decide when it needs the full output.

**Second**: Installation requires Rust toolchain. No official binary releases as of v0.40.0. For teams without Rust in their stack, onboarding friction is real.

**Third**: Don't let the benchmark numbers mislead you. My actual Claude Code costs are dominated by Read, Grep, and code generation — areas RTK doesn't touch. The "60–90%" figure applies to find/ls-heavy tests. In a mixed real-world workload, 10–30% is the more honest estimate.

I wouldn't call RTK overhyped. But "cuts your Claude Code bill in half" is too much to expect. For projects with heavy file traversal or frequent test runs, it's genuinely useful. For everything else, single-digit savings is the likely outcome.

## Finding Missed Savings: `rtk discover`

One underrated feature is `discover`. It analyzes your existing Claude Code session history and back-calculates how much you *would have* saved if those commands had run through RTK.

```bash
rtk discover
```

In my case, the biggest token wasters in my history were `find`, `npm install` (verbose logs), and `docker logs`. Of those, only `find` typically ran through Claude Code's Bash tool — the others I'd been running directly in terminal, outside the hook's reach.

You can also check per-session stats:

```bash
rtk session
```

This shows token savings and hook rewrite rates per Claude Code session. Oddly useful for understanding your own Bash-heavy vs. native-tool usage patterns.

## RTK for Teams

Solo use is easy — install, `rtk init -g`, done. Team adoption needs more thought.

**You'll want an onboarding script**: guiding everyone from Rust install → RTK install → Claude Code hook registration. Put it in your `Makefile` or `scripts/setup.sh`:

```bash
#!/bin/bash
# scripts/setup-rtk.sh
if ! command -v cargo &> /dev/null; then
    echo "Rust required: https://rustup.rs"
    exit 1
fi

cargo install --git https://github.com/rtk-ai/rtk
rtk init -g --auto-patch
echo "RTK installed. Restart Claude Code."
```

**Document it in CLAUDE.md**: Noting RTK setup in the team's CLAUDE.md helps new members understand what's happening when commands get auto-rewritten. RTK's absence on any individual machine doesn't break Claude Code — it just means that person isn't saving tokens.

**CI/CD: don't bother**: RTK only matters for local dev environments where a developer is working with an AI agent. Don't add it to your CI pipeline.

The honest blocker for team adoption is Rust. "Install Rust and wait 1:40 for a compile" is a real ask for Python or Node.js teams. Official binary releases would fix this — but they don't exist as of v0.40.0.

## How RTK Compares to Other Token Optimization Approaches

Where does RTK fit in the cost optimization stack?

| Method | Layer | Applies To | Complexity | Expected Savings |
|--------|-------|-----------|-----------|-----------------|
| Model downgrade (Haiku/Flash) | Pricing | All API calls | Low | 5–20x (price diff) |
| Prompt caching | API | Repeated system prompts | Medium | 40–70% |
| MCP schema compression (mcp2cli) | API | MCP tool injection | Medium | 96–99% |
| RTK | Shell | Bash command output | Low | 0–90% (varies) |

Model downgrades have the biggest absolute impact but come with quality trade-offs. [Prompt caching](/en/blog/en/claude-api-prompt-caching-cost-optimization-guide) is powerful for repetitive workflows. [MCP schema compression](/en/blog/en/mcp2cli-token-cost-optimization) delivers dramatic savings if you're running many MCP tools. RTK has the lowest implementation friction and zero workflow change requirement.

As covered in [the real cost of AI agents in production](/en/blog/en/ai-agent-cost-reality), agent costs accumulate across multiple factors. RTK addresses one slice of that — shell command output — and does it transparently. The right framing is "another layer in the cost stack," not a silver bullet.

## Should You Install It?

My take: **try it, but set realistic expectations.** A 1 minute 40 second `cargo install` and one `rtk init -g` command. Check `rtk gain` after a week — if you're saving 10%+ keep it running, if not, `rtk init -g --uninstall` and move on.

RTK is a well-built tool. 50+ supported commands, clean agent integration, solid tracking. The expectation adjustment is the key thing: this is a "nice optimization layer," not a "cut your bill in half" move.

MIT license, free, open source. Nothing to lose.

GitHub: [rtk-ai/rtk](https://github.com/rtk-ai/rtk)  
Official site: [rtk-ai.app](https://www.rtk-ai.app/)
