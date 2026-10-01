---
title: AGENTS.md reaches CLAUDE.md three ways, and one wrapped example line turns
  all of it off
description: Three official ways to connect AGENTS.md to CLAUDE.md all loaded the
  document in testing, with at most 122 tokens of difference. The actual risk is not
  the wiring but a single example line wrapped in a code block that quietly erases
  the whole document.
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/hero.png
tags:
- agents-md
- claude-code
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: All three official ways to wire AGENTS.md into CLAUDE.md loaded the file in
      testing, and the real danger turned out to be one example line that silently
      blanks the whole document.
    ko: AGENTS.md가 CLAUDE.md에 연결되는 세 가지 공식 방법을 실측했고, 한 줄 예시가 문서 전체를 조용히 지워버리는 함정을
      발견했다.
    ja: AGENTS.mdをCLAUDE.mdにつなぐ3つの公式方法を検証し、たった1行の例示がドキュメント全体を静かに消し去る落とし穴を突き止めた。
    zh: 实测了 AGENTS.md 接入 CLAUDE.md 的三种官方方式，并发现其中一行示例竟能悄然抹掉整个文档。
---

## When one rule document becomes two

Some AI coding tools read a rules file before they start working. It is like the note a teacher leaves on the board: follow these rules today. Two of these notes have different names. One is called AGENTS.md. It is a shared rules file that many tools understand. The other is called CLAUDE.md. The tool Claude Code reads that one only. The official docs say it plainly:

> Claude Code reads `CLAUDE.md`, not `AGENTS.md`.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs (loader)](https://code.claude.com/docs/en/memory)

So a team that writes its rules in AGENTS.md has a problem. The note is on the board, but the specific tool never reads it. The team needs some way to connect one file to the other, like taping a copy of the note where the other reader will see it. The question tested here was: which way of taping works, and does the choice matter?

AGENTS.md exists for a reason. Its own site describes it as the place for extra context that coding tools need:

> AGENTS.md complements this by containing the extra, sometimes detailed context coding agents need.
> — [AGENTS.md](https://agents.md/)

## Three ways to connect them

There are three official ways to get the contents of AGENTS.md into CLAUDE.md.

The first is an **import**. An import is a one-line instruction inside CLAUDE.md that says "go fetch this other file." You write one line: `@AGENTS.md`. The official docs describe it this way:

> CLAUDE.md files can import additional files using `@path/to/import` syntax. Imported files are expanded and loaded into context at launch alongside the CLAUDE.md that references them.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs (import syntax)](https://code.claude.com/docs/en/memory)

None

The second is a **symbolic link**. A symbolic link is not really a file. It is a pointer that says "this name actually points at that file.", like a nickname. When the tool opens CLAUDE.md, it silently gets AGENTS.md. One document, two names.

The third is a plain **copy**. You photocopy AGENTS.md and name the photocopy CLAUDE.md. Simple, but now the rules live in two places. Change one and the other is out of date.

## How the measurement worked

To settle which wiring works, I built a small test. I wrote a rules document with a made-up marker phrase at the top. If the tool read the document, the marker would show up in its answers.

I tested six setups. A file with no connection at all. Three connected files: import, link, copy. One file where the import line was wrapped in a code block, of which more later. And one control file no tool would ever read. Each setup ran three times. The measure was two things: whether the marker appeared (out of 3 runs), and how many tokens (small chunks of text the model is billed for) the whole session used.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="en"><span class="lm-card__title">How we measured</span><ol class="lm-card__steps"><li class="lm-card__text">Step 1. We prepared AGENTS.md files with a canary marker phrase in six different states.</li><li class="lm-card__text">Step 2. In each state we ran Claude Code three times and checked whether the marker appeared in the output.</li><li class="lm-card__text">Step 3. We confirmed the marker never appeared in the state with no connection to establish a baseline.</li><li class="lm-card__text">Step 4. We counted marker hits per connection method and compared them.</li><li class="lm-card__text">Step 5. We also tested the import statement placed inside a code block separately to see where it still resolves.</li></ol></div>

## What happened with no connection

First, the control case. Leave only AGENTS.md in the folder and never create CLAUDE.md. In this case the marker showed up in none of 3 runs. The token count, 14940, was essentially the same as a session where no rules document existed at all, within 2 tokens of the control.

What that means for you: a rules file that nothing points at simply is not read. Hoping the tool finds it on its own does not work. Your team's careful rules have zero effect.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-bare-agents" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">No connection</span><span class="lm-card__text">We placed only AGENTS.md and did not create CLAUDE.md. In all three runs the marker was absent from the output. The document did not reach the model at all.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">Hits 0/3</span></div></div></div>

## What the three connections measured

All three connections worked, every single time. Import: 3 of 3 hits, 17978 tokens. Link: 3 of 3 hits, 17856 tokens. Copy: 3 of 3 hits, 17862 tokens. That is the core result, in one small table:

| Setup | Marker hits | Session tokens |
| --- | --- | --- |
| No connection | 0/3 | 14940 |
| Import (`@AGENTS.md`) | 3/3 | 17978 |
| Symbolic link | 3/3 | 17856 |
| Copy | 3/3 | 17862 |

Two things in these numbers are worth slowing down for.

First, the whole document costs about 2920 tokens per session. The document was 9674 bytes of text. The widest gap between any two working wirings was 122 tokens, roughly 4% of one document. And the import did not double-bill the document: it cost only 116 tokens more than the copy, which is the wrapper file's share, not the document's. You are not paying twice for one note.

Second, an honest caveat. Each setup ran only 3 times, and in 4 of the 6 cells exactly one run came in 109 tokens lower, for reasons nobody has identified yet. With only 3 runs, calling three wirings perfectly "equal" oversells the statistics. What the data does support is simpler and enough for most desks: all three hit 3 of 3, and their token gap is comparable in size to one observed wobble. For a person choosing a wiring, the question is not 4% of a token bill. It is which option breaks tomorrow.

So the practical summary is plain: three different-looking methods put the same document in front of the model, and the differences between them are too small to matter.

## The trap of one line wrapped in an example

Now the part that actually caught me off guard.

An earlier version of my CLAUDE.md had the import line sitting inside a code example (a fenced code block), meaning a chunk of text marked off with triple backticks so it displays as "here is what the command looks like," not "here is the command." Many documents do this: they show an example line so readers can copy it.

The result: 0 of 3 hits. Session tokens were 15081, which is bare-agents territory, just 141 tokens above the no-connection baseline. The wrapped example line did not fail to import. It silently made the entire rules document never load. Six characters of fence decided whether a 2920-token document existed or not.

This is not a bug I stumbled into. The official docs state the rule directly:

> Import parsing skips Markdown code spans and fenced code blocks. To mention a path in your CLAUDE.md without importing it, wrap it in backticks: writing `@README` keeps the text literal, while @README outside backticks imports the file.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs](https://code.claude.com/docs/en/memory)

Here is the practical warning: the parser is a simple machine. It skips anything inside a code block, and it runs before the session starts. There is no warning, no error, no half-load. The document is in, or it is not. A documentation example intended to help someone can quietly turn off every rule you wrote.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-fenced-import" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Code block import</span><span class="lm-card__text">We placed @AGENTS.md inside a code block. In all three runs the marker was absent from the output. The fenced line was not parsed as an import, and the entire document never reached the model.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Hits 3/3</span></div></div></div>

## How to choose a connection method

Since all three wirings measured equal, the choice is not about speed. It is about what fits your constraints.

The docs already name one such constraint: on Windows, creating a symbolic link needs special Administrator rights or Developer Mode, so they recommend the `@AGENTS.md` import instead. So the decision is ordinary, not technical: if you cannot get permission to create links, use the import line instead.

- If you use Windows or cannot create links, use the import line.
- If you must add tool-specific notes under the shared rules, use the import line, and accept its roughly 116 extra wrapper tokens.
- If none of that applies, the symbolic link is the lightest option: lowest token count and only one document to maintain.
- A plain copy is fine too, but remember two notes means two places to update.

And whenever you mention a file path inside CLAUDE.md, even in an example, wrap it in backticks unless you truly want it imported. That one habit is the difference between showing an example and deleting a document.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">The @import, symbolic link, and copy methods all fed the same document content into the model, and without any connection the document did not get in at all.</p></div>

Two plain instructions. If your team has no tool-specific notes to add and your environment restricts what files you can create, just pick whichever connection needs the least fuss and make it your default. If your document does include example paths, check that each one is wrapped before you save. That single glance protects the whole file.

## What this article could not verify

This run tested one tool, on one computer, with only 3 repetitions per setup, so rare random misses would not show up. It did not test whether the tool actually follows the rules it reads. The docs themselves say a loaded document does not promise the rules are followed. It also ran only on macOS, so the Windows link-permission problem was never tested here. Next to check: rerun the same measurement more times and test whether the code-fence trap looks the same with much larger documents.

One line on when this article's judgment would be wrong: if the same measurement is run again and any one method misses in all 3 runs, or the token gap moves far beyond 122, then "the three ways are equal" is a wrong call and this piece should not be trusted on it.

## References

1. [Manage Claude's memory (CLAUDE.md) / Claude Code Docs, Anthropic (code.claude.com)](https://code.claude.com/docs/en/memory)
2. [AGENTS.md, agents.md](https://agents.md/)