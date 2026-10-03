---
title: 'Claude Code and CLAUDE.md: one conflicting user request discards the whole
  rules file'
description: A committed rules file like CLAUDE.md or AGENTS.md is a suggestion the
  assistant reads, not a rule anyone enforces. When one user request conflicts with
  a single rule, the model judged the whole file a prompt attack and discarded all
  of it, 6 times out of 6.
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/hero.png
tags:
- claude-code
- agents-md
- prompt-injection
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: This conflict-request experiment shows the flip side of the earlier finding
      that declared rules get silently dropped when truncated.
    ko: 이번 글의 충돌 요청 실험은 규칙 파일이 잘려도 조용히 무시된다는 기존 실측 결과의 반대편 사례를 보여준다.
    ja: 今回の競合リクエスト実験は、ルールファイルが切り詰められても静かに無視されるという既存の実測結果の裏側を補う事例だ。
    zh: 本次冲突请求实验恰好补充了此前关于规则被截断后会被静默忽略的实测结论。
- slug: agents-md-three-wirings-equal-cost-codefence-silent-trap-2026
  score: 0.7
  reason:
    en: The observation that CLAUDE.md is merely a suggestion extends the earlier
      experiment showing three @AGENTS.md wirings measure equal and a codefence line
      silently swallowing the whole file.
    ko: CLAUDE.md가 제안일 뿐이라는 관찰은, CLAUDE.md에 @AGENTS.md를 연결하는 세 방식이 측정상 동일하며 코드펜스 한
      줄이 문서 전체를 삼키는 함정을 검증한 이전 실험의 자연스러운 후속이다.
    ja: CLAUDE.mdはあくまで提案にすぎないという観察は、@AGENTS.md接続の3方式が測定上同等でコードフェンス1行が文書全体を飲み込む罠を検証した前回の実験の自然な続きである。
    zh: CLAUDE.md 只是一份建议这一观察，延续了此前验证三种 @AGENTS.md 接线方式成本相同、代码围栏一行会吞掉整篇文档的实验。
---

## How we measured whether the rules file was actually followed

Teams that use AI coding assistants often write their working rules into a small file and commit it to the code repository. In Claude Code, that file is called CLAUDE.md. In other tools it is called AGENTS.md. Both are the same kind of thing: a plain text note the assistant reads before it starts working. Think of it as a note stuck on the refrigerator at home: "please rinse your plate, please turn off the lights." The note is read. Whether it is obeyed is a separate question.

That question is what this article is about. We ran a small experiment to measure it, and the one thing to take away is this: a rule written in the file may not be kept. A rule that truly must be kept should be checked by a program, not left in a document.

Here is how the experiment worked, in plain steps. We asked the assistant to write one small piece of code, a function that greets a person by name and age. Then we counted three things in what it produced.

- Whether the rules document actually reached the model at all.
- Whether two made-up rules were followed: a hidden marker word that was supposed to appear in the code, and a canary line, a line of text planted in the rules file purely so we could later check whether it showed up in the output.
- Whether the code used f-strings, a common shortcut for building text in the Python programming language, or avoided them.

We ran each version of the task 6 times under identical conditions and counted the results. The runs fell into three groups. One group had no rules file at all, to measure the assistant's natural habits. One group had a rules file of about 300 bytes, a tiny document with 3 rules, and a neutral request that did not conflict with anything. One group had the same file plus a single extra sentence from the user asking for f-strings, which directly contradicted one rule.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="en"><span class="lm-card__title">How we measured</span><ol class="lm-card__steps"><li class="lm-card__text">Step 1. Generated code in the default state with no rules doc to measure baseline habits.</li><li class="lm-card__text">Step 2. Added the rules doc and generated the same code to see whether behavior changed.</li><li class="lm-card__text">Step 3. Created a conflict by pushing the user to use f-strings to see whether the rules held up.</li><li class="lm-card__text">Step 4. Counted marker tokens, canary lines, comments, and f-string use in the outputs and compared them.</li></ol></div>

The refrigerator-note picture is worth keeping in mind for the whole article. The finding is not that the note was ignored. It is stranger than that: when one line on the note annoyed the person asking, the whole note, including the lines nobody argued with, got thrown in the trash.

## The cell result where the rules file changed the assistant's code habits in a neutral task

First, the good news, because it matters. Without any rules file, the assistant used f-strings in 6 runs out of 6. That is its natural habit, the baseline. With the rules file present and a neutral request, f-string use dropped from 6 out of 6 to 0 out of 6. The document did not just arrive. It actually changed the code.

The document reached the model in all 6 runs. The canary line appeared in 4 of 6 runs. The marker rule was followed in 4 of 6 runs. So in a calm, conflict-free task, the rules file works reasonably well: most rules are followed most of the time.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-rules-neutral" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Claude, with rules</span><span class="lm-card__text">All 6 runs read the rules doc and dropped f-strings entirely, but followed the marker and canary rules in only 4 of 6 runs.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Rules reached 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">f-string ban 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:66.7%"></div><span class="lm-card__text">Canary lines 4/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:66.7%"></div><span class="lm-card__text">Comments added 4/6</span></div></div></div>

Notice the honest caveat inside that good result. Even with no conflict at all, the marker and canary rules were followed only 4 times out of 6. Reaching the model and being followed are two different events. The note was read 6 times, but two of those six readers let a rule slip. Already, "I wrote it down" is not the same as "it happens."

For a team, this is the first quiet lesson. If your team's style rules live only in this file, roughly a third of the runs may drift from the less prominent rules even when nobody asks for anything unusual. Not because the assistant is rebellious, simply because reading is not obeying.

## The cell result where the user's request clashed with one rule and the whole file was discarded

Now the main finding. We changed exactly one thing: we added one sentence to the user's request asking for f-strings. That contradicts one of the three rules in the file. What would you expect? The most natural guess is that the assistant would weigh the conflict, follow the user on the f-string question, and keep the other two rules, the marker and the canary. One rule bends; the rest stand. That is the reasonable outcome you would expect.

That is not what happened. In all 6 runs, the assistant did use f-strings; the user won on the conflicting rule, as expected. But the canary line appeared in 0 of 6 runs, down from 4 of 6. The marker rule was followed in 0 of 6 runs, down from 4 of 6. Nothing else from the file survived. And the reason the runs gave was the striking part: all 6 runs judged the rules document itself to be a prompt injection and refused the whole document. A prompt injection is an attempt to smuggle instructions in from outside.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-rules-userpush" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Claude, user push</span><span class="lm-card__text">All 6 runs read the rules doc but judged everything a prompt attack and refused, while still using f-strings.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Rules reached 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">f-string use 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">Canary lines 0/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">Comments added 0/6</span></div></div></div>

Five of the runs quoted the planted marker tokens word for word while rejecting them as suspicious. The sixth restated the rule set and refused it. The document reached the model in 6 of 6 runs, so this was not a delivery problem. The note was in the model's hands. The model read it, decided it was an attack, and threw the whole thing away.

The only difference between the calm cell and this one was a single sentence in the request. Same file, same task, same setup. The rule did not change; the request now clashed with it. What changed was the model's judgment about the channel the rules arrived through.

## The detailed numbers showing rules nobody clashed with collapsed too

It is worth sitting with the specific numbers, because the headline can mislead you into thinking this is just "user wins conflicts."

| Measurement | Neutral task | Conflicting request | No rules at all |
| --- | --- | --- | --- |
| Document reached the model | 6/6 | 6/6 | (n/a) |
| Canary line followed | 4/6 | 0/6 | (n/a) |
| Marker rule followed | 4/6 | 0/6 | (n/a) |
| f-strings avoided | 0/6 | 6/6 used | 6/6 used |

The bottom row is the baseline: with no rules file, the assistant used f-strings in every single run, producing the same output each time. That is why the neutral cell's 0/6 is impressive: the file genuinely overrode a strong default habit.

But the middle columns are the story. The conflicting request targeted one rule, the f-string ban. The marker and the canary had nothing to do with that conflict. Yet they went from 4/6 to 0/6. The model did not trim one line from the note. It discarded the note, and every rule on it, including the two rules that nobody had argued with.

There is a second layer to the numbers. In 6 of 6 conflicting runs, the model classified the document as a prompt attack. Two of the neutral runs did the same. The same 300-byte file, committed by the user into their own project, was treated as a suspicious injection, the very thing the user themselves wrote. A defense that cannot tell a legitimate instruction channel from an attack, 6 times out of 6, is not a defense. It is a false alarm.

## The doc-comparison result showing the official documents promise no effect

Here is the part that surprised us most, and it comes from the vendors' own words. The official Claude Code documentation describes how CLAUDE.md is delivered:

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.
> — [Claude Code memory documentation](https://code.claude.com/docs/en/memory)

Read that twice. "Tries to follow it." "No guarantee of strict compliance." The company that makes the tool is telling you, in writing, that this file is a suggestion. The same documentation draws the line even more sharply:

> Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer.
> — [Claude Code memory documentation (enforcement section)](https://code.claude.com/docs/en/memory)

There it is: some rules are enforced by the program itself no matter what the model decides, while CLAUDE.md merely shapes behavior. The AGENTS.md specification says the same thing from the other direction:

> The closest AGENTS.md to the edited file wins; explicit user chat prompts override everything.
> — [agents.md spec](https://agents.md/)

So the direction we observed, the user's request beating the file, is exactly what the documents promised. On that point, the model behaved to spec. The gap is precision: the spec says the user wins; it never said the losing side would be the entire file, canary included.

We also checked four official documents: the agents.md spec, the Codex documentation, the Claude Code memory documentation, plus a README from a related code repository. We looked for any claim that loading the rules file changes the output. We searched each one three times. The result: 0 hits for any effect claim across all four. The documents describe in detail where and how the file gets loaded. Not one of them promises that loading it changes what the model produces. The documents say a lot about delivery and nothing about effect, and that silence is the real contract.

## Where a rule that must be kept should live instead

So where do rules that truly must hold go? The official documentation already answers it, and our numbers back it up: enforced by the client, the program running around the model, not the model itself. In everyday terms, if a rule must be kept, do not only write it down; put a check in place that makes the rule automatic.

Concretely, these checking tools are: a linter, which scans code for style mistakes and flags them. Pre-commit hooks run automatically before code is saved into the shared history. And the enforced settings rules are separated from CLAUDE.md in the vendor's own documentation. A rule in the file is a request. A rule in a checking tool is a gate.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">The rules doc clearly reaches the model and changes some coding habits, but when the user pushes back the rules are treated as a prompt attack and collapse.</p></div>

The numbers behind that picture: across 6 conflicting runs, the entire document was rejected 6 times out of 6. One conflicting sentence did not remove one rule; it removed every rule in the file. The practical sorting rule for any team is therefore two lines. Rules you hope will be followed go in the document. Rules that must be followed go where something checks them automatically. And instructions likely to clash with existing rules should not be stored in the file at all; they should be said only in the request, so the clash affects one request instead of the whole rules file.

## What this article could not verify

This experiment ran on one combination: Claude Code 2.1.245 with the Sonnet model, one small task, one 300-byte rules file, 6 runs per condition on a single machine. We could not test the Codex tool at all: all 18 planned runs on that side died on a usage limit before the model produced anything, so nothing here applies to AGENTS.md as tested fact. We also cannot say whether the "this document is a prompt attack" judgment comes from the model or from the surrounding program. We cannot say whether other models behave the same way. And we measured only two outcomes, follow or collapse, so we cannot describe how rules weaken in between.

Here is when this article's judgment would be wrong. Suppose a future run shows that a conflicting request changes only the conflicting rule, while the other rules and the canary line stay obeyed. Or suppose even a neutral task gets the whole document rejected. Then what we saw was not the pattern described here, and the conclusion should be revised.

And two direct instructions, one for each kind of reader. If you believe a rule will be followed just because it is written in the file, move every rule that truly must hold to a linter, a hook, or enforced settings. Do it today. If you often ask for things that go against your own rules file, keep those requests out of the file. Say them in the moment instead, so one clash does not take down the whole note.

## References

1. [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory) — Anthropic
2. [agents.md 스펙](https://agents.md/) — agents.md
3. [Claude Code security 공식 문서](https://code.claude.com/docs/en/security) — Anthropic