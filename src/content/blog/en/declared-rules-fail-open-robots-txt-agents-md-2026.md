---
title: "robots.txt and AGENTS.md both fail open"
description: "Ten of 33 robots.txt cells let a blocked URL through and Codex clipped the back of a 34 KiB AGENTS.md. All 219 runs exited 0. Which parser gave your verdict?"
pubDate: '2026-08-17'
heroImage: '../../../assets/blog/declared-rules-fail-open-robots-txt-agents-md-2026/hero.png'
tags:
  - robots-txt
  - agents-md
  - ai-crawler
  - coding-agent
  - seo
faq:
  - question: "Does robots.txt block AI crawlers?"
    answer: "It asks them not to crawl. It is not access control. In my run, 10 of 33 parser cells returned ALLOWED or UNDEFINED on a URL that the file was written to block, and 3 of those 10 were all three parsers correctly following the spec. Anything that actually has to be blocked gets blocked in the server response."
  - question: "Which robots.txt parser should I verify with?"
    answer: "None of the three matched the spec on all 11 scenarios. protego 0.6.2 matched 10 of 11, robots-parser 3.0.1 matched 9 of 11, and Python's urllib.robotparser matched 5 of 11. Whichever one your checker uses, know its name before you report a URL as blocked."
  - question: "Why did my AGENTS.md instructions get ignored by Codex?"
    answer: "Codex stops concatenating once the accumulated bytes reach project_doc_max_bytes, 32 KiB by default, so the back of the file is what disappears. Raising the limit to 262144 brought my 34 KiB and 48 KiB tail canaries from 0 of 6 runs to 6 of 6."
relatedPosts:
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: "저 글이 robots.txt와 llms.txt로 AI 크롤러를 통제하는 방법을 정리했다면, 이 글은 그 선언이 파서 단계에서 얼마나 자주 통과되는지를 33셀로 실측했다."
      ja: "あちらは robots.txt と llms.txt で AI クローラーを制御する手順をまとめた記事で、本稿はその宣言がパーサー段階で何セル素通りするかを実測している。"
      en: "That post lays out how to declare AI crawler rules with robots.txt and llms.txt; this one measures how often three parsers let those declarations through anyway."
      zh: "那篇整理了用 robots.txt 与 llms.txt 控制 AI 爬虫的做法，本文则实测这些声明在解析器层面有多少格子被直接放行。"
---

I wrote a two-line robots.txt and flipped the order of the lines. With `Disallow: /p` above `Allow: /p`, `urllib.robotparser` returns DISALLOWED for `https://example.test/page.html`. Put `Allow: /p` first and the same parser returns ALLOWED. The rule set is identical, character for character. protego and robots-parser said ALLOWED both ways and never moved.

Neither file is a control. Both are requests. Treating "I edited the file" as the same event as "the rule is in force" is where the operation goes wrong.

## What causes the silence

The declaration and the enforcement live in different processes, and there is no error channel between them. A truncated instruction file is exit 0. A misparsed rule is exit 0. Nothing in either path is built to report that the two sides disagree. Robots meta has the same shape: the parser can miss the tag and never raise.

I grepped all 120 raw Codex outputs for `truncat`, case insensitive. Zero hits. The Codex docs offer an audit path, `codex -c log_dir=./.codex-log`, but it is a separate opt-in.

The chains are not the same. One is a byte accumulator that stops at a limit. The other is a partial spec implementation plus a rule the spec itself defines. They share a failure direction, not a cause. "These are the same problem" is false.

## Flip two lines and urllib flips its answer

`RuleLine` in `urllib.robotparser` is a path prefix comparison, and `can_fetch` returns on the first line that matches. There is no room in that loop for longest match, for a tie-break, or for wildcards. What decides the answer is the rule's line number in the file, not its octet count.

> "The most specific match found MUST be used.  The most specific match is the match that has the most octets."
>
> — [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.txt)

> "If an \"allow\" rule and a \"disallow\" rule are equivalent, then the \"allow\" rule SHOULD be used."
>
> — [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.txt)

```bash
# Same two lines, order flipped. urllib's answer flips with it
cd "$(mktemp -d)"
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /p' 'Allow: /p' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/page.html") else "DISALLOWED")'
printf '%s\n' 'User-agent: GPTBot' 'Allow: /p' 'Disallow: /p' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/page.html") else "DISALLOWED")'
```

The standard library points at RFC 9309 without saying that group merging, longest match, and wildcards are missing.

## Ten of thirty-three cells let a blocked URL through

Eleven scenarios times three parsers is 33 cells, three runs each, 99 runs. Every cell returned the same value all three times. No model sits in this loop, so the output is deterministic.

| Scenario | Spec answer | urllib | protego | robots-parser |
| --- | --- | --- | --- | --- |
| control-plain | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| empty-specific-group | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| duplicate-groups | DISALLOWED | ALLOWED (off spec) | DISALLOWED | DISALLOWED |
| ua-case-mismatch | DISALLOWED | DISALLOWED | DISALLOWED | DISALLOWED |
| longest-match-allow | ALLOWED | DISALLOWED (off spec) | ALLOWED | ALLOWED |
| tie-disallow-first | ALLOWED | DISALLOWED (off spec) | ALLOWED | ALLOWED |
| tie-allow-first | ALLOWED | ALLOWED | ALLOWED | ALLOWED |
| wildcard-dollar | DISALLOWED | ALLOWED (off spec) | DISALLOWED | DISALLOWED |
| full-ua-string | DISALLOWED | ALLOWED (off spec) | DISALLOWED | ALLOWED (off spec) |
| bom-prefix | DISALLOWED | ALLOWED (off spec) | ALLOWED (off spec) | DISALLOWED |
| bare-path-query | DISALLOWED | DISALLOWED | DISALLOWED | UNDEFINED (off spec) |

Totals, with the answer key written from RFC 9309 and Google Search Central before any parser ran. protego matched 10 of 11 scenarios, robots-parser 9 of 11, and urllib 5 of 11. Across the matrix, 24 of 33 cells and 72 of 99 runs matched the spec. Seven scenarios split the parsers; four were unanimous.

Nine cells returned ALLOWED on a URL written to block, and one returned UNDEFINED. urllib owns six divergent cells, four leaning ALLOWED (duplicate-groups, wildcard-dollar, full-ua-string, bom-prefix) and two leaning DISALLOWED (longest-match-allow, tie-disallow-first).

My prediction was that protego and robots-parser would answer every rule-semantics scenario correctly and urllib would be the only outlier. That held. Those two parsers went 24 of 24 on the eight scenarios that ask what a rule means. The break came when the axis changed. On the three input-layer scenarios, 3 of their 6 cells went off spec.

full-ua-string hands the parser a full browser-style `User-Agent` header string with `GPTBot` buried in it. I expected all three to say ALLOWED. protego alone found the token as a substring and returned DISALLOWED, which is what the spec asks for.

bom-prefix went the other way. I expected only urllib to be fooled by three bytes of BOM at the top of the file, and protego was fooled too. robots-parser alone ignored it. That is protego's single divergent cell out of eleven.

With a relative path, robots-parser returns `undefined`, exactly as its README says.

```bash
# A relative path makes robots-parser return undefined. Read it as falsy and you will call it blocked
npm init -y >/dev/null && npm install robots-parser >/dev/null
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /blocked/' > robots.txt
node -e 'const fs=require("fs"),R=require("robots-parser");const r=R("https://example.test/robots.txt",fs.readFileSync("robots.txt","utf8"));console.log(r.isAllowed("/blocked/x.html","GPTBot"), r.isAllowed("https://example.test/blocked/x.html","GPTBot"))'
```

```bash
# Does the parser read * and $ literally
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /*.json$' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/api/data.json") else "DISALLOWED")'
python3 -m venv venv && ./venv/bin/pip install -q protego
./venv/bin/python -c 'from protego import Protego; r=Protego.parse(open("robots.txt").read()); print("ALLOWED" if r.can_fetch("https://example.test/api/data.json","GPTBot") else "DISALLOWED")'
```

![Hero illustration for this measurement, showing a declared rules file on one side and a consumer process on the other with no error channel between them](../../../assets/blog/declared-rules-fail-open-robots-txt-agents-md-2026/hero.png)

## A Crawl-delay line deletes the global Disallow above it

Three of the ten cells are not parser defects. All three parsers answered ALLOWED, and all three were right.

Put `User-agent: *` with `Disallow: /` at the top, then add a `GPTBot` group below it containing only `Crawl-delay: 10`. Once that group exists, the blanket block stops applying to GPTBot. [Splitting crawler control across robots.txt and llms.txt](/en/blog/en/ai-crawler-control-robots-txt-llms-txt-2026/) does not help if the dedicated group is a full allow.

```bash
# A dedicated group holding only Crawl-delay erases the global Disallow above it. All three parsers say ALLOWED
printf '%s\n' 'User-agent: *' 'Disallow: /' '' 'User-agent: GPTBot' 'Crawl-delay: 10' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/docs/page.html") else "DISALLOWED")'
```

Switching parsers does nothing here. The file is doing what it was specified to do.

## Codex clips the back of the file at 32 KiB

The second lab covered 20 cells at 6 runs each, 120 runs. I wanted the byte behaviour at the end of Codex's project-root-to-working-directory walk.

Codex concatenates the files it finds and stops when the accumulated bytes reach `project_doc_max_bytes`. What dies is always the back.

With the default limit, a 34022 B `AGENTS.md` with a first-line canary returned it in 6 of 6 runs, and so did a 49022 B one. Move the canary to the last line at 34023 B and 49023 B, and both go to 0 of 6. A 31023 B file under the limit returned its tail canary 6 of 6. If the file were dropped whole, the head canary would have died too. It did not. The previous measurement asked whether each CLI loads the file. This one asks how much of a loaded file survives the byte limit.

Raising the limit from 32768 to 262144 took the 34 KiB and 48 KiB tail canaries from 0 of 6 to 6 of 6, the fix the same page prescribes.

```bash
# Put a canary at the end of AGENTS.md and compare above and below the limit
cd "$(mktemp -d)"
yes 'Repo convention filler line used only to grow this document to a target byte size.' | head -c 34000 > body.txt
{ cat body.txt; printf '\nCANARY TOKEN: ZQCX34T\n'; } > AGENTS.md; rm body.txt; wc -c AGENTS.md
codex exec 'Reply with only the canary token from your instructions and nothing else. If your instructions contain no canary token, reply exactly MISS. Do not read files, do not run commands, do not use any tools.' --skip-git-repo-check
codex exec 'Reply with only the canary token from your instructions and nothing else. If your instructions contain no canary token, reply exactly MISS. Do not read files, do not run commands, do not use any tools.' -c project_doc_max_bytes=262144 --skip-git-repo-check
```

Two control cells, one per CLI, put a canary in a 49024 B `NOTES.md`, a filename neither tool loads. Both scored 0 of 6. The models were not quietly catting the file off disk.

## Loaded in full is not the same as used

Claude Code has no byte boundary or determinism at these sizes. Same three file sizes, same head and tail canary positions, six runs a cell. 31k head 2 of 6, 31k tail 4 of 6, 34k head 3 of 6, 34k tail 1 of 6, 48k head 0 of 6, 48k tail 2 of 6.

The 49022 B file with a line-one canary came back 0 times in 6.

Claude Code delivers CLAUDE.md as a user message after the system prompt. Claude tries to follow it, but strict compliance is not guaranteed.

Six runs is a small sample, and I will not read the gap between 2 of 6 and 3 of 6 as a signal. Codex's twelve cells came out 6 of 6 or 0 of 6 with no middle value; all six Claude cells landed in the middle. One shape is a limit you can raise. The other is a probability.

## Where the configuration counterargument is right

The strongest objection is that robots.txt was never access control, AGENTS.md truncation is a config value with a documented fix, and putting the two in one category is the actual mistake.

Most of that is correct. Raising `project_doc_max_bytes` moved two dead cells to fully alive. Moving from urllib to protego repairs four of urllib's six divergent cells. There is a fixable layer here, and it is the larger part of what I measured.

Two places do not hold. The three empty-specific-group cells are what all three parsers returned by correctly following the spec, so switching parsers does not touch them. Claude Code writes that CLAUDE.md loads in full regardless of length, then missed the first line of a 49022 B file six times out of six. There is no limit there to raise.

The objection wins outright only if you chose and control one parser, the instruction file sits under the limit, and a check runs on every change to both. Then this is configuration. Take away any one of those three and you are back to a request with no receipt.

## Put a canary at the end of the file and check it yourself

Five things I changed, in order.

- Before saying robots.txt blocked it, find out which parser produced that verdict. urllib.robotparser matched the spec on 5 of 11 scenarios here, and its documentation points at RFC 9309 without listing what it leaves unimplemented.
- When you add a crawler-specific user-agent group, write the `Disallow` lines again inside it. A group holding only a `Crawl-delay` or comment is a full allow.
- Block what must be blocked in the server response. robots.txt reduces crawl requests. It does not cut access, whatever the declaration file you reach for happens to be.
- Fix validation code that reads `isAllowed` as two values. robots-parser returns `undefined` for a relative path, and falsy-reading it reports the URL as blocked when nothing blocked it.
- If an agent instruction file passes 32 KiB, split it or raise the limit, then put a canary at the end and confirm that string comes back in an answer. Changing the setting and the instruction arriving are separate events.

The shape generalizes past these files. Any declared file read by a separate consumer that stays quiet when it cannot read the rule has this problem, and llms.txt, meta robots and the `.editorconfig` family have the same shape. The verification method crosses file types too. Ask the consumer a question whose answer differs depending on whether it read the rule.

## What 219 runs do not show

This does not show real crawler behavior. I measured three open-source parsers. The parsers behind GPTBot, ClaudeBot and PerplexityBot are not published, and protego is only a stand-in based on its README. I never sent a crawler request. `example.test` is reserved, robots.txt files were read off disk, and network use was limited to `pip` and `npm` installs. I did not add Google's published C++ robotstxt as a fourth column, the first gap I would close.

Versions are pinned to one day and one machine. CPython 3.12.8, protego 0.6.2, robots-parser 3.0.1, codex 0.147.0 running gpt-5.6-luna at effort low, claude 2.1.233 running sonnet, on macOS 26.5.2 with darwin 25.5.0. The parsers are deterministic, so the same versions reproduce the 33 cells. The model-side 6 of 6 and 0 of 6 can move on those versions.

I did not measure the nested-summation axis on Codex. Every cell used one `AGENTS.md`, and `~/.codex/AGENTS.md` was 0 bytes and skipped, so this data neither confirms nor refutes the docs' "combined size" wording. On Claude, all six cells carried my `~/.claude/CLAUDE.md` at 10951 B, and it was one model. Canaries measure whether an instruction reached the context window, not how well it was followed. Nothing here says anything about indexing, ranking, or AI citations.

This proves only that the verification script answers this way. That is its value. It verifies the verifier.

One thing I still cannot explain. In three Codex head cells, all six runs printed the canary minus its final character, `ZQCX31`, `ZQCR31` and `ZQCR34` instead of the seven-character tokens. The full token appears nowhere in those raw files. The head was clearly in context. I logged the anomaly, did not re-run those cells, and looked at the tails instead.
