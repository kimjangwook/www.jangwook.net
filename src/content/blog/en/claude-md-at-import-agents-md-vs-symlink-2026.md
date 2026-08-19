---
title: "Wiring AGENTS.md into CLAUDE.md: import, symlink, or copy"
description: "Claude Code reads CLAUDE.md, not AGENTS.md. I measured the three official bridges between them across seven conditions; one fails silently in headless runs."
pubDate: '2026-08-19'
heroImage: '../../../assets/blog/claude-md-at-import-agents-md-vs-symlink-2026/hero.png'
tags:
  - ai
  - coding-agent
  - agents-md
  - claude-code
  - developer-tools
relatedPosts:
  - slug: agents-md-vs-claude-md-loading-measured-2026
    score: 0.9
    reason:
      ko: "8월 16일의 76런 로딩 실측에서 미측정으로 남겨둔 @AGENTS.md import 칸을 이 글이 닫는다. 두 글이 한 세트다."
      ja: "8月16日の76ラン実測で未測定のまま残した@AGENTS.mdインポートの欄を本稿が埋める。二本で一組の記事だ。"
      en: "This post closes the cell the 76-run loading measurement left open: the @AGENTS.md import route. The two read as one set."
      zh: "本文补上了 8 月 16 日 76 次加载实测中留空的 @AGENTS.md 导入一栏，两篇文章互为一组。"
  - slug: declared-rules-fail-open-robots-txt-agents-md-2026
    score: 0.74
    reason:
      ko: "선언형 규칙이 강제 없이 조용히 무시되는 구조를 다뤘고, 이 글의 '에러 없는 침묵 실패'는 그 연장선이다."
      ja: "宣言型ルールが強制力なしに静かに無視される構造を扱っており、本稿の「エラーなき沈黙の失敗」はその延長線上にある。"
      en: "That post maps how declared rules fail open without enforcement; the silent, error-free import failure here is the same pattern one layer down."
      zh: "那篇分析了声明式规则在缺乏强制力时被静默忽略的结构，本文中无报错的导入失败正是同一模式。"
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.65
    reason:
      ko: "지시문이 조용히 빠진 채 도는 에이전트가 팀에 쌓는 인지 부채를 다룬다. 이 글의 캐너리 점검이 그 예방책이다."
      ja: "指示が静かに欠落したまま動くエージェントがチームに積み上げる認知的負債を扱う。本稿のカナリア検査はその予防策だ。"
      en: "Covers the cognitive debt a team accrues when agents run with silently missing rules; the canary check here is one way to catch it early."
      zh: "探讨 Agent 在规则静默缺失的状态下运行时给团队累积的认知负债，本文的金丝雀检测正是早期发现手段。"
---

On 2026-08-16 I published [loading measurements for AGENTS.md and CLAUDE.md](/en/blog/en/agents-md-vs-claude-md-loading-measured-2026/) and left one cell open. The symlink route scored 3 out of 3, but the `@AGENTS.md` import that Anthropic documentation recommends first went unmeasured. I marked the gap and moved on. That open cell lingered for three days; on 2026-08-19 I built seven test directories under `/tmp` to resolve it.

Bottom line first: the official memory documentation presents the import and the symlink side by side, like two spellings of the same idea. They are not. The two routes resolve at different layers and fail in different, quiet ways. An import pointing outside your working directory must clear a trust gate; without a human present, that gate remains shut and silent. If your repository runs `claude -p` from CI, hooks, or cron, the choice between these routes decides whether your rules exist at all.

## Three routes in the docs

The Claude Code memory documentation states the problem plainly:

> "Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them."
>
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

The recommended `CLAUDE.md` contains a single line: `@AGENTS.md`. The same page offers a symlink as an alternative if you do not need Claude-specific content: `ln -s AGENTS.md CLAUDE.md`. Since v2.1.213, a third route exists: the `/import` command appends a one-time copy of `AGENTS.md` into `CLAUDE.md` and carries over MCP servers, commands, subagents, and skills.

Two details in the fine print matter: on Windows, creating a symlink requires Administrator privileges or Developer Mode, so the documentation directs Windows users to use `@AGENTS.md` imports. Imports accept both relative and absolute paths, resolve relative to the file containing them, and recurse up to four hops deep.

## Seven directories, one canary word

The test environment used `/tmp/claudemd-lab-20260819` on macOS, running Claude Code 2.1.233 headless via `claude -p --output-format json`. Each condition used the same `AGENTS.md` instruction, directing the agent to include the token `ZQ7CANARY` in every reply. The test prompt conflicted intentionally:

```bash
claude -p 'Reply with exactly the word OK and nothing else.'
```

When the reply contained the canary token, the instruction file reached context and overrode the prompt. Each condition ran three times. A user-scope `~/.claude/CLAUDE.md` remained present throughout as a constant.

| Condition | What CLAUDE.md is | Canary loaded |
| --- | --- | --- |
| a | `@AGENTS.md`, relative path, inside the repo | 3/3 |
| b | symlink to AGENTS.md in the repo | 3/3 |
| c | one-time copy of AGENTS.md | 3/3 |
| d | absent; only AGENTS.md exists | 0/3 |
| e | `@/tmp/claudemd-lab-ext/AGENTS.md`, absolute, outside the repo | 0/3 |
| f | `@` import with an absolute path that stays inside the repo | 3/3 |
| g | symlink to a file outside the repo | 3/3 |

Condition d acts as the control, confirming that Claude Code ignores a bare `AGENTS.md`. Conditions e and f isolate the path location: both use absolute paths, but condition f (resolving inside the working directory) loads 3/3, while condition e (resolving outside) loads 0/3. Absolute syntax is not the variable; destination is. Condition g provides the critical contrast: a symlink pointing at an out-of-repo target—the exact target condition e failed to read—loads consistently at 3/3.

## The failure isn't an error, it's a literal line

To inspect condition e from the inside, I ran a second probe in that directory:

```bash
claude -p 'Without using any tools, print verbatim the project instructions text you received for this repository at session start.'
```

The model reported that its project instructions consisted of one unexpanded literal line: `@/tmp/claudemd-lab-ext/AGENTS.md`. No warning appeared; no error was raised. The import target's content never reached context. The agent simply saw a literal string starting with an `@` character.

That silence extends to the logs. The init event in the JSON output contains a `memory_paths` field, but across all conditions it listed only the auto-memory directory, never `CLAUDE.md`. A headless run provides no log confirmation that instructions loaded. That blindness makes canary tokens necessary: the only reliable signal is planting a distinctive string and checking whether it returns.

The failed condition left no persistent traces. After the condition e runs, no `.claude/` directory existed in the project, and the home configuration recorded no entry for the path. Whatever state interactive approval records, the repository never receives a commit.

## Why the symlink never sees the gate

The documentation defines external imports: an import in a project memory file is external when its path resolves outside the working directory.

> "The first time Claude Code encounters external imports in a project, it shows an approval dialog listing the files. If you decline, the imports stay disabled and the dialog doesn't appear again."
>
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

An approval prompt requires an interactive user. In `claude -p`, no operator exists to respond. The gate cannot open, the import remains an unexpanded literal string, and condition e fails silently.

The symlink bypasses this gate because the operating system resolves it at the filesystem layer. When Claude Code's memory loader opens `CLAUDE.md`, the operating system has already traversed the link and delivered the target file. By the time an application-level trust check could run, the metadata showing that this content originated outside the repository no longer exists. The loader perceives a standard file at the project root. Conditions e, f, and g isolate this boundary: the trust gate evaluates resolved path strings, whereas a symlink presents no external path string to evaluate.

Whether this bypass represents intended architecture or an omission remains open. The 2.1.232 changelog highlights Anthropic's current direction:

> "Cowork sessions no longer inline external @-imports from user-scope memory files"
>
> — [Claude Code CHANGELOG, 2.1.232](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

The same release rejects symlink hijacks and blocks sandbox escapes. Anthropic is systematically tightening security around external content entering agent context.

## "You approve it once and you're done"

A reasonable objection arises: condition e failed because headless mode cannot display an interactive dialog. In everyday interactive sessions, the dialog appears once, the developer approves it, and the import functions reliably thereafter.

That argument holds for a solo developer working interactively on a single machine. In that workflow, the external import matches documentation, approval happens once, and headless failure is an irrelevant corner case. Developers working strictly in that mode can use the import without issue.

The assumption breaks down in three operational environments. First, automated execution paths without human operators: CI pipelines, git hooks, scheduled cron tasks, and subagents spawned into fresh contexts. Without an interactive operator, these executions receive truncated instructions. Second, authorization binds to a user and machine rather than the repository. A new teammate's initial session prompts for approval again, and the documentation notes that declining is permanent: the imports stay disabled and the dialog does not reappear. An accidental keystroke during setup leaves that teammate working without project conventions. Third, the repository stores no approval state: the project root receives no `.claude/` metadata, nothing committable, and nothing teammates can inherit. 'Works on my machine' is not an accidental side effect of this trust model; it is built into the architecture.

## What this costs

Financial cost: zero; all three configurations are free. Token overhead: prompt token counts fluctuated across conditions because cache creation and cache read variations exceeded the difference in file sizes, preventing isolated measurement.

The documentation clarifies the token question directly: splitting into `@path` imports helps organization but does not reduce context, since imported files load at session launch. Engineering teams expecting `@import` directives to shrink token consumption will find no cost advantage.

## Which route for which repo

The relative import, `@AGENTS.md`, fits repositories where the shared instruction file lives inside the working tree and the team includes Windows machines. It avoids symlink privilege constraints on Windows and permits appending Claude-specific sections below the import line—a capability symlinks lack. Because the target stays inside the repository trust boundary, the approval gate never engages, including in headless executions. Condition a's 3/3 measurement confirms this behavior.

The symlink fits two use cases where `@import` fails: referencing shared conventions outside the repository (such as a central standards file in a home directory) and headless pipelines running `claude -p` against external files. The operational cost lies in Git configuration: a Windows checkout with `core.symlinks=false` materializes the link as a plain text file containing the raw path string, which Claude Code then loads as the entire instruction set. Adopting symlinks requires enforcing `core.symlinks` as part of repository setup.

Two approaches remain ill-advised for long-term use: treating the `/import` one-time copy as a synchronization strategy (as updates to `AGENTS.md` will not propagate to `CLAUDE.md`), and deploying external `@` imports on headless paths, where instruction loading fails without diagnostic output.

For teams running agents in CI workflows or git hooks, audit `CLAUDE.md` files for `@` import directives and verify whether target paths resolve outside the repository. When external paths exist, replace them with symlinks or internal copies, or insert a canary token to verify headless rule propagation. Interactive sessions can verify loaded memory files by running `/context`, but headless runs require canary verification.

My recommendation divides along operating constraints: for in-repo targets across mixed operating systems, use relative imports; for external shared conventions or headless pipelines requiring guaranteed rule injection, use symlinks with `core.symlinks` managed as production configuration. The assumption that `@import` and symlinks are interchangeable does not survive empirical testing across these seven directory configurations.

Two technical shifts could alter these tradeoffs. If a future Claude Code release stores external-import authorizations in a committable configuration file, repositories could declare trusted paths across automated environments, resolving the headless limitation and making imports universally preferable. Conversely, if security hardening extends to filesystem-level symlink traversal, the symlink workaround will close immediately. Neither outcome has landed yet.

Consolidating agent rules into a single source of truth begins as a documentation organization task. Examined at the system layer, it reveals a deeper question of authorization boundaries: who is entitled to trust the instruction payload? Every configuration file supplied to an agent is quietly becoming a credential.

## References

- [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [Claude Code CHANGELOG, 2.1.232](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

