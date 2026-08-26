---
pubDate: '2026-08-26'
title: Three AGENTS.md wirings into Claude Code cost the same; a code fence in CLAUDE.md
  is what silently kills the import
description: 'Measured three methods of wiring AGENTS.md into Claude Code. The 116-token
  spread is noise. The real trap: a markdown code fence around @AGENTS.md in CLAUDE.md
  zeros the load with no error, no token spike, no signal.'
heroImage: ../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/hero.png
---

I needed to know whether @import, symlink, and file copy are interchangeable for wiring AGENTS.md into Claude Code. I ran six cells, eighteen runs, with all tools and MCP servers disabled so the model could not open any file on its own. The three wirings differ by 116 tokens on a 2,920-token document; the code fence in CLAUDE.md is the only import-style cell where the document never loads.

If your team has a CLAUDE.md with a code fence that mentions @AGENTS.md, that import is dead. You will not see an error. You will not see a token spike. You will just have every new session start without the 2,920 tokens of context you wrote. I would rather grep for that pattern on a Tuesday morning than debate which wiring is prettier.

## The parser does not look inside fences

> "You can also reference other files using the @ syntax. For example, you can add @AGENTS.md to your CLAUDE.md file to import its contents."
> — [Memory files — Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/memory)

The loader reads CLAUDE.md at session start. It scans for the @filename pattern and treats each match as an import directive. That scan happens outside markdown code fences and code spans. Text inside a fence is an inert string to the parser. So when @AGENTS.md sits between fence markers, the loader does not open the file. It does not log a warning. It does not retry. The @ symbol is just a character in a paragraph, the way a dollar sign inside a code block is not currency.

The 141-token rise in the fenced cell is the fence markers and the literal @AGENTS.md string themselves, ingested as inert text. The 2,920-token document never enters the prompt. No error path exists for "found an @ inside a fence" because the parser has no concept of a missed fence. It did not fail to find the file. It did not look there.

## 116 tokens on a 2,920-token document

> "bare-agents 0/3 hit, total_input −2 vs control. at-import 3/3, 17978. symlink 3/3, 17856. copy 3/3, 17862. fenced-import ZZFENC85 0/3, total_input 15081."
> — [probe-2026-08-19 — lab.json + results](data/labs/probe-2026-08-19-claude-md-at-import-agents-md-vs-symlink-2026/)

| Cell | Hit rate | total_input | Delta vs copy |
|---|---|---|---|
| bare-agents (no wiring) | 0/3 | control −2 | — |
| @import | 3/3 | 17,978 | +116 |
| symlink | 3/3 | 17,856 | −6 |
| copy | 3/3 | 17,862 | 0 |
| fenced @import | 0/3 | 15,081 | −2,781 |

The canary document is 9,674 bytes, which bills as 2,920 tokens at 3.31 bytes per token. @import bills 116 tokens more than copy. Symlink bills 6 tokens less. On a 2,920-token document, that is a 4 percent spread. The three methods are functionally identical. They all put the same 2,920 tokens into the prompt. The spread is the import mechanism's own overhead, not a quality difference.

## Three wirings, one function

The official documentation lists @import, symlink, and copy as three ways to reference AGENTS.md. In practice, the three differ only in how the loader or filesystem resolves the path. @import is a string the loader expands at parse time. Symlink is a filesystem entry the loader follows. Copy is a literal file the loader reads. The prompt the model receives is the same 2,920 tokens in all three cases.

This means the choice is a maintenance preference, not a functional one. You pick one, you commit, you do not revisit. A team that switches from symlink to @import because someone read a blog post is spending review time on a 116-token difference.

## Where "equivalent" stops being true

The strongest objection: this is 9,674 bytes, three runs per cell, one macOS machine, one version of Claude Code. A lab from 2026-08-16 showed the same loader producing probabilistic omission at 31 to 48 KiB. Whether the three wirings still land within 116 tokens of each other at 50 KiB or above is unconfirmed.

And the codex axis. The previous lab on 2026-08-18 killed all 60 codex runs on the usage limit. The limit lifts on 2026-09-15. Teams that run both codex and claude in the same repository: this dataset answers half the question. "How do you wire AGENTS.md" is not a single-tool question for those teams.

I grant the range. If your AGENTS.md exceeds 32 KiB, or you run codex and claude side by side, "equivalent" is a claim I have not yet verified. For a 9,674-byte document in a single claude session, the three wirings are the same.

## The grep and the lint rule

What I told the team: run `grep -n '@' CLAUDE.md` and look for any @ path that sits inside a code fence. One line in the documentation template lint: no @ paths between fence markers. That is a 30-second check.

The fence trap is not version-specific. It is not OS-specific. It is a parse rule. The loader will not look inside a fence on 2.1.233, and it will not look inside a fence on whatever ships next quarter. The trap is structural, not a bug a patch will fix.

Any markdown formatter, any prettier config, any CI lint that reformats CLAUDE.md can introduce a fence around an example line. The next person who opens a new session after that reformat will not know the import is dead. There is no signal. No error. No degraded performance metric. The 2,920 tokens simply are not there.

## What a dead import costs per quarter

A team of eight engineers, each opening a new session three times a day, is 1,440 sessions per quarter. If the rules document is 2,920 tokens and it is not in the prompt, every one of those sessions starts without the context. The model will guess. It will ask clarifying questions that waste turns. It will produce code that violates the conventions you wrote.

You do not see this in a dashboard. You see it as a slower code review, as a PR that needs two extra rounds because the model did not know the naming convention, as a junior who asks a question the document already answered. The 2,920 tokens are cheap. The review time they prevent is not.

## What this dataset does not answer

Four-hop recursive import: the documentation says maximum depth of four hops. I measured one hop. Whether the fence rule applies at depth two, three, four is untested.

Insertion position: the total_input tells me the document is in the prompt. It does not tell me where. After the system prompt? Before the first user message? The raw data has a 109-token variance in two of the six cells that I cannot explain from the fields available.

50 KiB and above. Codex axis. Both open.

Here is my read. If your team has not wired AGENTS.md into Claude Code yet, pick any of the three methods, commit, and do not revisit. The 116-token spread is not a decision axis. If you have already wired it, grep CLAUDE.md for @ paths inside fences this week. That is the only check that matters.

The 32 KiB boundary and the codex axis are open questions. I will re-measure when the usage limit lifts on 2026-09-15. What you can say from a 9,674-byte, three-run, single-version dataset and what you can say after a quarter of production use are different things.

Three lines of fence markers determine whether a 2,920-token document loads. The document format is the load protocol. There is no manifest. There is no config file. The markdown grammar of CLAUDE.md itself is the import mechanism. Which means every tool that reformats your CLAUDE.md is a load-path dependency, and none of them will warn you when they introduce a fence.

## References
- [Memory files — Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/memory)
- [probe-2026-08-19 — lab.json + results](data/labs/probe-2026-08-19-claude-md-at-import-agents-md-vs-symlink-2026/)