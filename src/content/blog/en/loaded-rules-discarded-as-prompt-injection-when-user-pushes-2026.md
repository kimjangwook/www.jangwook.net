---
title: One user prompt made Claude Code discard the entire CLAUDE.md rule file
description: Rules written in a rule file are only suggestions, and one conflicting
  sentence from the user made the model throw out the whole file as suspicious. Measured
  in 18 runs inside Claude Code.
pubDate: 2026-08-28
heroImage: ../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/hero.png
tags:
- claude-code
- agents-md
- prompt-injection
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: The earlier finding that declared rules fail silently now extends into an
      experiment where a single user prompt makes Claude Code discard the entire CLAUDE.md
      file.
    ko: 선언된 규칙이 침묵 속에 무시된다는 이전 실측이, 이번엔 사용자 프롬프트 한 줄로 CLAUDE.md 전체가 버려지는 실험으로 이어진다.
    ja: 宣言されたルールが黙って無視されるという前回の実測が、今度はユーザープロンプト一行でCLAUDE.md全体が破棄される実験へとつながる。
    zh: 此前实测发现声明规则会被静默忽略，而这次实验进一步表明，一句用户提示就能让 Claude Code 丢弃整个 CLAUDE.md 文件。
- slug: agents-md-three-wirings-equal-cost-codefence-silent-trap-2026
  score: 0.7
  reason:
    en: Where the previous post showed a code fence silently erasing AGENTS.md, this
      one digs into why a single user prompt can void the entire CLAUDE.md—because
      rule files are only suggestions in the end.
    ko: AGENTS.md를 조용히 지워버리는 코드펜스 함정을 다뤘다면, 이번 글은 사용자 프롬프트 한 줄로 CLAUDE.md 전체가 무시되는
      이유, 즉 규칙 파일이 어차피 '제안'일 뿐이라는 근본 원리를 파헤친다.
    ja: コードフェンスがAGENTS.mdを静かに消す罠を扱った前編に続き、本稿ではユーザープロンプト一行でCLAUDE.md全体が無視される理由、すなわちルールファイルは結局「提案」にすぎないという根本原理を掘り下げる。
    zh: 上一篇揭示了代码围栏悄悄抹掉 AGENTS.md 的陷阱，本篇则深挖为什么一条用户提示就能让整个 CLAUDE.md 失效——因为规则文件终究只是建议。
---

## The file was read, but the rules were not always followed

If you tape a note to your fridge saying "no soda before dinner," the note does not lock the fridge. It only works if whoever opens the fridge decides to read it and care. Rules written for AI coding tools work the same way.

Claude Code is a tool where an AI assistant reads and edits code for you. Teams often write their rules into a file called CLAUDE.md (a text file sitting in the project folder, meant to tell the assistant things like "always format output this way.") The hope is simple: if you write it down, the assistant will follow it.

Here is the finding: writing rules down does not mean they get followed. The assistant did read the file. In all 6 runs that asked for the file, the rules reached the model — that is 6 out of 6. But when the user's request bumped into just one of the rules, the assistant did not quietly break that one rule. It rejected the entire rule file, calling it a "prompt injection", a term for hidden instructions sneaking in to manipulate the AI. The untouched, unrelated rules went with it. This happened in 6 out of 6 runs.

So the file arriving and the file being obeyed are two separate events. Reading the note is not the same as following it.

![Rules document's opening tokens appearing in output, reach 6/6](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-cell-c1-head-reachable.png)

## Measurement method and baseline

Here is how the test worked. The test used three setups, each run 6 times, for 18 runs in total — all inside Claude Code, on one machine.

- **Control, no rules**: give the model a small coding task (format a greeting string) with no rule file. This sets the baseline: what the model does naturally. It used one particular style, called an f-string, in 6 out of 6 runs. An f-string is just a built-in way to slot variables into text.
- **Neutral, with rules**: put a small 300-byte rule file in the project with 3 rules: avoid f-strings, add a specific comment marker, add a specific extra line (the "canary," a marker whose only job is to show the rule was followed). Same neutral task. Result: the file was read in 6 out of 6 runs. The marker appeared in 4 of 6, and the canary in 4 of 6. The forbidden f-string dropped from 6 out of 6 to 0 out of 6. The rules clearly changed the output.
- **User push, with rules**: the exact same file and task, with one added sentence in the user's request asking for the f-string anyway. Result: f-string back in 6 out of 6 — expected. But the marker and the canary, which had nothing to do with that sentence, fell from 4 out of 6 to 0 out of 6. And in all 6 of these runs, the model explicitly called the rule file a prompt injection and refused it.

The last line of that table is the key result. Only rule 2 was in conflict. Rules 1 and 3 were not touched by the user's request, yet they vanished too.

```
                    neutral (no push)   user push (one conflict)
doc reached              6/6                  6/6
canary line              4/6                  0/6
code marker              4/6                  0/6
forbidden f-string       0/6                  6/6
```

The two setups differ by a single sentence. The rule file did not get weaker; the user's request changed how the whole document was judged.

![Measurement procedure run across 18 runs in three cells](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-how.png)

## One conflicting user prompt dropped compliance to 0 out of 6

Picture a shared house whiteboard with three family rules: "wash dishes right after dinner," "label your leftovers," "turn off the hallway light." Now someone asks, "Can I leave the dishes till morning?" Instead of bending that one rule, you throw out the whole whiteboard because a stranger might have written on it. That is what the runs showed. One conflict, and the model treated the entire document (the one the team itself placed in its own project) as an attack, discarding all three rules plus the canary.

Official documentation actually predicted part of this. Anthropic's Claude Code docs say the CLAUDE.md file "is delivered as a user message after the system prompt, not as part of the system prompt itself," and that "there's no guarantee of strict compliance, especially for vague or conflicting instructions."

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.
> — [Claude Code memory docs](https://code.claude.com/docs/en/memory)

Read that quote carefully. The rule file is not a locked-in instruction. The tool hands it to the AI the same way it hands over any message you type, as part of the conversation, not as a built-in system instruction. What the measurement adds is the part nobody expected: the model did not just weigh the rules loosely. It reclassified the whole file as suspicious and skipped it entirely, 6 times out of 6.

![A run using f-strings after the user pushed back, 6/6](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-cell-c5-override-hides-canary.png)

## The most plausible objection and its limits

There is a fair counterargument, and it deserves a straight answer. It goes: "This is not a bug; it is the defense working. Instructions committed inside a project folder can absolutely be an attack route. A malicious file could tell the assistant to leak secrets. The model suspecting it and refusing is good behavior. And the AGENTS.md spec even says user chat prompts override everything, so the user winning is by design."

> The closest AGENTS.md to the edited file wins; explicit user chat prompts override everything.
> — [agents.md spec](https://agents.md/)

On priority, the objection is right. The user's request beating the file is exactly what the spec promises. The defense argument is also reasonable in general: a committed file really can carry an attack.

But look at what the defense actually caught. Not the one conflicting rule. It caught two rules the user never contradicted. It also caught the canary, whose only job was to prove the rules were being followed. All of this was inside a 300-byte file the team itself put there on purpose. That is a false alarm: it fired at two rules the user never even questioned. Classifying your own legitimate rule file as an attack, 6 times out of 6, is a false alarm, not a defense.

## Telling document rules from enforced rules

The useful distinction is between a note and a lock. A note asks. A lock enforces, no matter what anyone asks afterward.

The vendor documents make this distinction themselves. Anthropic's docs state that "Settings rules are enforced by the client regardless of what Claude decides to do," while "CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer."

> Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer.
> — [Claude Code memory docs](https://code.claude.com/docs/en/memory)

The measurement supports the weaker part of that sentence: the same file was 4 out of 6 compliant in one context and 0 out of 6 in another. That is a preference, not a guarantee. The same contrast showed up on the documents side, too: across 4 vendor documentation surfaces checked, none claimed that loading a rule file changes the output. They only describe what gets loaded, never what effect it has. That gap shows up in all four of them.

So here is the practical takeaway, in two lines:

- If you want a rule to actually hold (formatting bans, security bans) do not put it in the rule document. Move it to something that checks automatically, like a linter — a tool that automatically checks code for mistakes — or a save-time checker that blocks the change before it lands. That is the lock.
- If you work on a team where requests often clash with the written rules, keep clashing instructions out of the document. Put them only in the request itself, where they will win anyway, and stop paying the cost of the whole file being discarded.

Written rules are a request to be read, not a guarantee of being followed.

![Document reached 6/6, compliance 0/6 — the conclusion](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-takeaway.png)

## What this article could not verify

This measurement ran on one tool, one model combination, one small task, and one 300-byte rule file — 18 runs on a single machine. The same experiment on AGENTS.md (a similar rule file used by other AI coding tools) could not be run at all, and whether this behavior holds across model versions and different randomness settings is untested. Next step: rerun once the missing comparison becomes possible again, and check whether the remaining rules survive a user conflict in other model combinations. If they do — if a user push costs only the conflicting rule and the untouched rules' markers still appear in the output (compliance holding at 4 out of 6) — then this article's judgment is wrong. In the actual runs, 4 out of 6 fell to 0 out of 6.

## References

1. [Claude Code memory 공식 문서 — Anthropic](https://code.claude.com/docs/en/memory)
2. [Claude Code memory 공식 문서 (enforcement 구분 문장) — Anthropic](https://code.claude.com/docs/en/memory)
3. [agents.md 스펙 — agents.md](https://agents.md/)
4. [Claude Code security 공식 문서 — Anthropic](https://code.claude.com/docs/en/security)
5. [agents.md 스펙 (최근접 로딩 문장) — agents.md](https://agents.md/)