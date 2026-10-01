---
title: 'The MCP roadmap lists features the MCP schema does not contain'
description: 'Roadmap promises and the published specification are two different things. This article measures how much data a program loads the moment it connects, and checks which roadmap features exist in the published specification.'
pubDate: '2026-09-02'
heroImage: ../../../assets/blog/mcp-roadmap-vs-schema-catalog-prefetch-measured-2026/hero.png
tags:
- mcp
- measurement
---

When a store tapes a flyer to its door, the flyer promises things. The shelf inside holds things. Those are two different lists, and it matters which one you are reading. This article is about MCP, short for Model Context Protocol: a published rulebook that lets programs hand each other lists of tools. We measured two numbers in one day: 6,235 bytes and 62,708 bytes.

The one thing to carry away: "it is planned" and "it is in the specification" are two different claims. Also, a program may load an entire list the moment it connects.

## What we measured and how

I measured two things, to answer two questions. First, when a program connects to a server that offers a catalog of tools, how much of that catalog arrives at once? Second, do the items named in the official roadmap actually appear in the specification? A roadmap is a public wishlist of what the team wants to build next. A specification is the versioned document that says what is real right now.

The method was simple. For the first question, we connected a program called claude 2.1.241 to a server offering 200 tools. We watched the network traffic three times. A small catalog of 20 tools was measured for comparison. For the second question, we searched four published versions of the specification by keyword. The versions were dated 2025-06-18, 2025-11-25, 2026-07-28, and one draft. We counted how many times each roadmap item appeared. A third test used a program called codex 0.147.0. It hit usage limits and produced 0 out of 3 runs, so the results tell us nothing.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="en"><span class="lm-card__title">How we measured</span><ol class="lm-card__steps"><li class="lm-card__text">Step 1. Ran schema-surface-classify and counted results.</li><li class="lm-card__text">Step 2. Ran docs-corpus-surface-classify 3 times and counted results.</li><li class="lm-card__text">Step 3. Ran claude-catalog-200-page20 3 times and counted results.</li><li class="lm-card__text">Step 4. Ran codex-catalog-200-page20 3 times and counted results.</li><li class="lm-card__text">Step 5. Ran claude-catalog-20-singlepage 3 times and counted results.</li></ol></div>

## Measured catalog size at connection time

Some programs ask for a list one page at a time, like reading a menu one page at a time. This program asked for the whole menu, every page, all at once.

With a catalog of 20 tools, the response is a single page weighing 6,235 bytes (bytes being the small units that text is measured in). With a catalog of 200 tools, claude 2.1.241 did not stop at the first page. The specification includes a marker called nextCursor, which is simply a note at the end of a page saying "more pages follow." Claude followed that note every time, pulling all 10 pages, for a total of 62,708 bytes. That is 10.06 times the small catalog's size, and it happened in 3 out of 3 runs.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-catalog-200-page20" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">claude-catalog-200-p</span><span class="lm-card__text">3/3 runs available, condition met 3 times.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">runs succeeded 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">condition met 3/3</span></div></div></div>

One caveat about this finding before you use it. The specification offers pagination, the option to fetch a list one page at a time. It does not force any program to grab every page. The program chose to follow the cursor to the end. The rulebook does not force this. So waiting for a future standard to fix "catalog bloat" may be unnecessary. The fix is already technically possible today: a program could stop at the first page. This one does not.

## Keyword counts across four schema versions

Now the second question: the roadmap versus the specification. The roadmap is prose, sentences about priorities. The schema is the same rulebook written in a format programs read, and it is dated, so it says what is real right now.

We searched for four roadmap items across all four schema versions: DPoP, which is a method for proving who sent a request. Progressive discovery, which means loading a list bit by bit instead of all at once. Webhooks, which are callbacks a server can send on its own; and ID-JAG, a kind of access token. The count came back the same for every item, in every version: 0.

That is not a small footnote. It means four items written in the same confident prose as everything else on the roadmap have never appeared in any released specification. The roadmap and the specification disagree, and the roadmap gives no hint of how far behind the specification is.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-schema-surface-classify" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">schema-surface-class</span><span class="lm-card__text">3/3 runs available, condition met 3 times.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">runs succeeded 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">condition met 3/3</span></div></div></div>

A fair objection: a roadmap is, by definition, a list of things that have not arrived yet. Reading it as if it were a specification is the reader's mistake, not the roadmap's. That is partly right, and the timeline shows a more uncomfortable detail. Tasks, one roadmap item, actually entered the released schema once and then left. So the items are not all equally far away, yet they are written in one uniform voice.

## How the tasks item entered and left the schema

The tasks entry teaches the most in this measurement. In the 2025-11-25 schema version, the keyword "tasks" appeared 25 times. In the current 2026-07-28 schema, it appears 0 times. The feature was in the schema once, then was removed.

So anyone who wrote a feature down as "available" was correct for a while, and incorrect after that. This is why the version date matters. "It is in the spec" is only true of a specific dated version, never of the document in general. A roadmap item can go backward, not just forward. The reason tasks left the core schema (redesign, or a move to a separate document) is not known from this measurement.

## Schema version notation instead of roadmap quotes

The habit is small and mechanical. Before citing a roadmap item as the basis for a design decision or a purchase, count how many times it appears in the current schema version. Write the result down as "schema version 2026-07-28: 0 occurrences" rather than "on the official roadmap."

Why bother with such a fussy line? Because documents travel. Summaries, blog posts, and slide decks strip the roadmap's hedging away, and by the time a claim reaches a decision meeting, "planned" has quietly become "supported." A counted number freezes the claim at the moment it was checked. The upshot for you: the gap between the roadmap and the specification becomes visible on paper, instead of living only in someone's memory.

The takeaway in one line: the two catalog sizes measured in this article, 20 and 200, show that the difference is not theoretical. At the larger size, 62,708 bytes arrive in one delivery.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">Could not generate an automatic summary, so only the measurement numbers are included.</p></div>

Two kinds of readers, two lines of advice. If you build or run the servers that hand over tool catalogs, do two things. First, measure how many bytes your catalog delivers at the moment of connection. Second, put that fixed cost into your budget before adopting anything with hundreds of tools. If you read the documents and decide what to adopt: delete any line that cites the roadmap as evidence, and replace it with the version number and the count.

## What this article could not verify

This run measured one program, claude 2.1.241, on one machine, on one day: 2026-08-25. The codex cell failed 0 out of 3 runs due to usage limits, so no plural claim about "clients in general" is supported here. Whether claude's full prefetch is an intended design or an implementation choice is unknown, as is whether a setting exists that would make it stop at the first page. Outside scope: the cost of those 62,708 bytes converted into tokens, and any effect on response quality or delay. Tokens are the small pieces of text that AI programs read and are billed for. Next to check: run the codex cell again, and test whether a mid-size catalog changes the pattern; the two sizes measured, 20 and 200, do not license extrapolation to 1,000 tools.

One closing condition, stated plainly: this article's judgment can be proved wrong in two ways, and both can be settled by counting in the schema itself. One way is finding a roadmap item in the current specification. The other is finding a sentence in the specification that tells programs to read the whole list to the end.

## References

1. [MCP Roadmap](https://modelcontextprotocol.io/development/roadmap), modelcontextprotocol.io, fetched 2026-08-25
2. [MCP JSON Schema (2025-06-18, 2025-11-25, 2026-07-28, draft)](https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2026-07-28/schema.json), github.com/modelcontextprotocol, fetched 2026-08-25
3. [MCP documentation corpus (llms-full.txt, about 2.37MB)](https://modelcontextprotocol.io/llms-full.txt), modelcontextprotocol.io, fetched 2026-08-25