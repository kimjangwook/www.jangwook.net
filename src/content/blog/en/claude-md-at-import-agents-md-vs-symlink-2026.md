---
title: "Claude Code's @import vs symlink for CLAUDE.md, tested"
description: "Anthropic docs treat @AGENTS.md imports and a symlink as interchangeable for CLAUDE.md. Across 21 headless runs, that import failed silently off-repo."
pubDate: '2026-08-19'
heroImage: '../../../assets/blog/claude-md-at-import-agents-md-vs-symlink-2026/hero.png'
tags: ['claude-code', 'agents-md', 'ai-coding-agent', 'developer-tools', 'devops']
relatedPosts:
  - slug: agents-md-vs-claude-md-loading-measured-2026
    score: 0.9
    reason:
      ko: "그 글은 두 CLI가 지시 파일을 로드하는지를 측정했고, 이 글은 그 파일을 두 도구에 동시에 물리는 세 가지 방법 중 하나가 조용히 깨지는 지점을 잡았다."
      ja: "あちらは二つのCLIが指示ファイルを読み込むかを測り、本稿は同じファイルを両ツールに渡す三つの方法のうち一つが静かに壊れる地点を特定した。"
      en: "That post measured whether two CLIs load an instruction file at all; this one finds where one of three ways to feed both tools the same file breaks silently."
      zh: "那篇测量两个 CLI 是否加载指令文件，本文则找出向两个工具同时传递同一文件的三种方式中，哪一种会悄悄失效。"
  - slug: declared-rules-fail-open-robots-txt-agents-md-2026
    score: 0.7
    reason:
      ko: "선언된 규칙이 강제 없이 실패로 열리는 패턴을 robots.txt와 AGENTS.md에서 비교한 글로, 이번 CLAUDE.md 실패 모드와 같은 계열이다."
      ja: "宣言されたルールが強制力なしにフェイルオープンするパターンをrobots.txtとAGENTS.mdで比較しており、今回のCLAUDE.md失敗モードと同系統だ。"
      en: "Compares how declared rules fail open without enforcement across robots.txt and AGENTS.md, the same family of failure as this CLAUDE.md gap."
      zh: "比较了 robots.txt 与 AGENTS.md 中声明规则在无强制力时如何默认失效，与本文 CLAUDE.md 的失败模式同属一类。"
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.62
    reason:
      ko: "에이전트가 규칙을 놓쳐도 아무도 모르는 상태가 팀에 어떤 인지 부채로 쌓이는지 이어서 볼 수 있다."
      ja: "エージェントが規約を見落としても誰も気づかない状態が、チームにどんな認知的負債として積み上がるかを続けて読める。"
      en: "Follows the thread of what it costs a team when an agent silently misses its rules and nobody notices."
      zh: "延续了 Agent 默默漏读规则却无人察觉，会给团队积累哪些认知负债这一主题。"
---
A teammate asked me last week whether pointing Claude Code at an `AGENTS.md` file mattered — import it, symlink it, copy it once, whatever's fastest. I said probably not. Then I ran the three routes against each other, and one fails in a way that leaves zero evidence on disk.

`@AGENTS.md` imports and symlinks both get instructions into context in standard setups. But "probably not" turned out to do heavy lifting. `@AGENTS.md` imports and symlinks resolve at different layers of the system, meaning they break under different conditions, and both fail silently. A declared rule that slips through without raising anything is the same shape I found when [measuring robots.txt and AGENTS.md](/en/blog/en/declared-rules-fail-open-robots-txt-agents-md-2026). Point an import at a file outside the repository and run Claude Code unattended — a nightly CI job, say — and the tool drops instructions without a warning.

## What Anthropic's docs say

Claude Code's memory page draws a clean line: Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If a repository already standardizes on `AGENTS.md` for other agents, the documentation recommends creating a `CLAUDE.md` that imports `AGENTS.md`.

> "Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them."
>
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

Below that, the same page offers a second route: "A symlink also works if you don't need to add Claude-specific content." The published command is a one-liner:

```bash
ln -s AGENTS.md CLAUDE.md
```

A third route exists: the `/import` slash command, available since v2.1.213 — a one-time copy that also carries MCP servers, commands, subagents, and skills. I treated it as a third condition in the test below, approximated with a manual copy since I cannot script the interactive command.

Three routes to the same destination, presented on one page as interchangeable. In a [previous post](/en/blog/en/agents-md-vs-claude-md-loading-measured-2026/), I measured whether `AGENTS.md` and `CLAUDE.md` load at all — symlink scored 3/3, leaving `@import` unmeasured. That gap sent me back to the terminal.

## The layer where they diverge

The filesystem resolves a symlink. By the time Claude Code's memory loader opens `CLAUDE.md`, the kernel has followed the link and handed over the target file's bytes — the loader never gets a vote. What the loader sees is one ordinary file sitting at the project root. Whatever the file's origin was — a path outside the repo, a shared config in the home directory — that information disappears before Claude Code opens the file.

An `@` import works differently: Claude Code's memory loader resolves the path directly. The loader holds the path as a string until deciding what to do with it. At that moment, the loader checks whether the path leaves the working directory, placing external paths behind an approval gate.

> "The first time Claude Code encounters external imports in a project, it shows an approval dialog listing the files. If you decline, the imports stay disabled and the dialog doesn't appear again."
>
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

Two of my seven test conditions pin down this boundary. An absolute import pointing inside the repository loaded reliably (3/3). An absolute symlink pointing outside the repository also loaded reliably (3/3). Neither absolute path syntax nor an out-of-repo destination trips the gate on its own. What triggers the gate is whether the loader, at resolution time, still detects that the path crossed a boundary. The filesystem discards that origin; the loader retains it.

## Checking the numbers myself

Documentation describes intended behavior without detailing every edge. On 2026-08-19, I set up seven conditions and ran each three times — 21 runs total — on Claude Code 2.1.233, macOS, in headless mode. Each `AGENTS.md` carried a canary token, `ZQ7CANARY`; its appearance in the reply confirmed the instruction file reached context.

```
a  CLAUDE.md = "@AGENTS.md", relative path, inside the repo          3/3
b  CLAUDE.md -> AGENTS.md, symlink inside the repo                   3/3
c  CLAUDE.md = one-time copy of AGENTS.md (/import output, approx.)  3/3
d  AGENTS.md only, no CLAUDE.md (control)                            0/3
e  CLAUDE.md = "@/tmp/claudemd-lab-ext/AGENTS.md", absolute, outside 0/3
f  CLAUDE.md = "@<absolute path inside the repo>/AGENTS.md"          3/3
g  CLAUDE.md -> file outside the repo, symlink                       3/3
```

```bash
claude -p 'Reply with exactly the word OK and nothing else.'
```

Condition d is the control — no `CLAUDE.md` at all — confirming the test harness does not leak the canary through another channel. Condition e is the critical case: an out-of-repo `@import` run headless, with no operator present to approve a dialog that never appears in this mode. Result: 0/3.

To inspect what happened in condition e, I asked the model without tools to print the project instructions it received verbatim:

```bash
claude -p 'Without using any tools, print verbatim the project instructions text you received for this repository at session start.'
```

The model returned one line: `@/tmp/claudemd-lab-ext/AGENTS.md`. The literal import syntax remained unexpanded as plain text. No warning appeared; no error was raised. The target file's content never entered context, with zero indication in the output.

Looking for a paper trail turned up no `.claude/` directory in the project and no path entry in the home configuration. Because approval state stays off disk and out of version control, every fresh clone starts from zero.

## Where the three routes diverge

| Criterion | @import | symlink | /import one-time copy |
| --- | --- | --- | --- |
| in-repo loading | 3/3 | 3/3 | 3/3 |
| out-of-repo reference | approval gate, 0/3 headless | 3/3 | frozen at copy time |
| stays in sync with source | yes | yes | broken |
| Windows portability | fine | privilege + checkout variables | fine |
| can append Claude-only section | yes | no | yes |
| signal on failure | silence | broken link = file missing | none, it just goes stale |

Every row but the first splits three ways. "Either one works" holds only for in-repo loading where all three routes agree — the single scenario developers test interactively by hand.

The Windows row warrants attention because official documentation highlights it directly. Creating a symlink on Windows requires Administrator privileges or Developer Mode, which is why Anthropic directs Windows users toward `@` imports. While I did not run a Windows test box in this lab run, git behavior creates a known edge case: a Windows checkout with `core.symlinks=false` materializes a symlink as a plain text file containing the raw path string, which Claude Code then loads as the entire instruction set. Because this reflects git and filesystem mechanics rather than a measured run, verify `core.symlinks` in your team's onboarding setup.

## The counter-argument, taken seriously

The objection to these findings is straightforward: condition e failed only because headless mode has no dialog to display. For a solo developer working interactively on a single machine, approval is genuinely one-time; once approved, an import matches symlink loading while allowing Claude-specific rules appended below.

That premise breaks down in three operational environments:
1. Unattended execution: CI pipelines, git hooks, cron jobs, and spawned subagents have no operator to approve prompts, so the gate never opens.
2. Machine-scoped trust: Approval binds to a user and machine rather than the repository. Every new teammate meets the dialog again, and a single decline disables imports permanently under official documentation.
3. Ephemeral state: Approval state is not committed to the repository. Measured directly: no `.claude/` directory or configuration file records approval in the repo. A new clone drops external instructions on unattended paths without notice.

## Putting this into practice

For a single developer working exclusively through the interactive CLI on one machine, import once, approve once, and move on. The failure modes described here do not apply to that workflow.

If any part of a pipeline runs Claude Code unattended, audit the configuration: `grep -n '^@' CLAUDE.md`. If any path resolves outside the repository, either move the target file inside the repository and switch to a relative import, or replace the line with a symlink and add `core.symlinks` to the onboarding checklist.

When neither change is immediately possible, plant a canary in `AGENTS.md` and verify it from CI:

```bash
claude -p 'Reply with exactly the word OK and nothing else.' | grep -q 'ZQ7CANARY' && echo alive || echo silent
```

In an interactive session, the equivalent verification is `/context`, which lists `CLAUDE.md` under Memory files when loaded. The documentation provides no equivalent screen for headless runs, making canary verification necessary. Counting what a config declares separately from what actually loaded is the same split I hit while [counting robots directives in the file and in the rendered output](/en/blog/en/search-console-ai-features-opt-out-vs-official-docs-gap-2026).

Financial cost is zero across all three routes. Token overhead could not be isolated in these runs: prompt token counts fluctuated across conditions because cache-creation and cache-read variation exceeded file-size differences. Documentation is explicit on one related point: splitting `CLAUDE.md` into `@path` imports does not reduce context consumption, because imported files load in full at session launch. Splitting files aids organization, not token efficiency.

## Who this fits

For cross-platform teams on Windows, macOS, and Linux sharing an in-repo `AGENTS.md` across coding agents, `@import` avoids Windows symlink privilege requirements entirely. It requires neither elevation nor developer mode, while preserving the ability to append Claude-specific rules below the shared file. This is the primary use case for `@import`: a repository where the shared instruction file sits inside the project tree and multiple tools read it.

Symlinks fit automated pipelines and cross-repo personal configs. A shared convention located in a user home directory bypasses the memory loader's approval gate when symlinked. The same applies to `claude -p` in git hooks or cron jobs: unattended processes cannot respond to interactive dialogs and should not depend on them.

Configurations to avoid:
- An `@` import pointing outside the repository on a headless execution path.
- A symlink on a Windows checkout with `core.symlinks=false`.
- Any configuration lacking automated verification that instructions loaded, since both routes fail silently.

When a repository depends on an external instruction file, the most reliable setup is moving the target file inside the repository and referencing it with a relative `@import`. That avoids relying on symlink workarounds or interactive approval gates. If a future Claude Code release commits approval state to repository configuration, the out-of-repo `@import` limitation disappears.

The Claude Code 2.1.232 changelog indicates these boundaries remain under active development: the release that restricted external `@` import inlining for Cowork sessions simultaneously patched symlink traversal hijacks and sandbox escapes.

## References
- [How Claude remembers your project (Claude Code memory)](https://code.claude.com/docs/en/memory)
- [Claude Code CHANGELOG — 2.1.232](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
