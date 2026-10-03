---
title: The symlink trick that shares AGENTS.md with CLAUDE.md works today, and no
  document promises it will work tomorrow
description: A popular way to share one rules file between two AI coding tools is
  a shortcut link, but no official document backs the trick, and file-system measurement
  shows absolute links break when a folder moves. This piece explains the evidence,
  its limits, and what to do about it.
pubDate: '2026-08-31'
heroImage: ../../../assets/blog/agents-md-claude-md-symlink-sharing-unconventional-unwarranted-2026/hero.png
tags:
- agentsmd
- claudemd
- symlink
relatedPosts:
- slug: claude-md-reachability-bound-to-cwd-lazy-loaded-rules-half-obeyed-2026
  score: 0.7
  reason:
    en: The symlink fragility examined here supplies the supporting evidence for the
      previous post's finding that CLAUDE.md loading depends on the session folder,
      not just where the file sits.
    ko: 이번 글이 다룬 CLAUDE.md 심링크의 취약성은, CLAUDE.md가 세션 폴더 기준으로 로딩된다는 기존 글의 규칙 도달 범위 분석이
      없었다면 발견하기 어려웠을 뒷받침 근거를 제공한다.
    ja: 本記事で扱うCLAUDE.mdのシンボリックリンクの脆弱性は、CLAUDE.mdがセッションフォルダを基準に読み込まれるという前記事のルール到達範囲の分析があってこそ見えてくる裏付けの根拠を示す。
    zh: 本文探讨的 CLAUDE.md 符号链接脆弱性，为上一篇关于 CLAUDE.md 依会话文件夹加载的规则适用范围分析提供了支撑证据。
- slug: loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026
  score: 0.7
  reason:
    en: If the symlink trick for sharing CLAUDE.md with AGENTS.md carries no official
      guarantee and can break at any time, reading it alongside the earlier post where
      loaded CLAUDE.md rules get discarded entirely by a single contrary user request
      reveals the full fragility of rules files.
    ko: 심링크로 CLAUDE.md를 AGENTS.md와 공유하는 요령이 공식 보장 없이 언제든 깨질 수 있다면, 그 CLAUDE.md 규칙이
      실제로 로드됐다가도 사용자 반대 요청 한 번에 통째로 버려지는 기존 글과 함께 읽어야 규칙 파일의 취약성 전체가 보인다.
    ja: シムリンクで CLAUDE.md を AGENTS.md と共有する小技が公式保証なしにいつ壊れてもおかしくないなら、その CLAUDE.md ルールがユーザーの反対要求一回で丸ごと捨てられる既存記事と併せて読むことで、ルールファイルの脆さの全体像が見えてくる。
    zh: 既然用符号链接让 CLAUDE.md 与 AGENTS.md 共享的技巧没有官方保证、随时可能失效，那么把它与已有文章中 CLAUDE.md 规则被用户一句相反请求就整个丢弃的情况对照阅读，才能看清规则文件脆弱性的全貌。
---

## The shared habit of tying AGENTS.md to CLAUDE.md as one set

Two AI coding helpers need instructions from you. One tool looks for a file called AGENTS.md. That is a text file where you write the rules your assistant should follow, like "test before you finish." The other tool looks for CLAUDE.md, which serves the same purpose for a different helper.

Writing the same rules twice is annoying. So a trick spread through the community: create one file, and in the other spot put a shortcut that points at it. The shortcut is called a symlink, a small pointer on your computer that says "this name actually leads to that other file over there."

The trick works today. People use it like a settled, correct answer. Here is the catch: no document from either tool promises it will keep working. A widely used habit is not the same as a guaranteed agreement, and this piece measures exactly how wide that gap is.

## What a symlink is, and what a move does to it

Picture your front door. On it, you stick a note: "House rules are on the fridge in the kitchen." Any visitor reads the note and walks to the fridge. As long as the note and the fridge are in the same home, everything works.

Now imagine you move houses. Two things can happen, depending on how you wrote the note. If the note says "the fridge in the kitchen," and the kitchen comes with you, the note still works. If the note says "the fridge at 12 Elm Street," the note now points at a stranger's kitchen, and the rules are gone.

There is a third option too: instead of a note, you photocopy the rules and leave a plain copy. A copy has no pointer at all, so it survives any move.

A symlink is that note. And how you write it, "the kitchen" or "12 Elm Street" decides whether it survives a move. That is not a quirky behavior of either AI tool. It is a basic property of how files on your computer store pointers.

## What a check of three document surfaces found

Before trusting the door-note analogy, the question to settle was simple: does any official document promise this arrangement? We read three places.

First, the change history of Claude Code, a running log a developer keeps of every feature they add, called a changelog. If the tool had a built-in way to read AGENTS.md directly, this log would very likely mention it. A search of the entire log found 0 mentions of AGENTS.md. The same log mentions CLAUDE.md 59 times and symlink 72 times. So the tool's own history talks a lot about its file and about links, but never once about reading the shared-rules file by name.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-changelog-agents-md-native" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Direct-read entry in changelog</span><span class="lm-card__text">All three changelog queries showed 0 mentions of AGENTS.md. The same changelog had 59 mentions of CLAUDE.md and 72 mentions of symlink. No documentation entry about direct reading was found.</span><div class="lm-card__numbers"><span class="lm-card__chip">AGENTS mentions 0</span><span class="lm-card__chip">CLAUDE mentions 59</span><span class="lm-card__chip">Symlink mentions 72</span></div></div>

Second, the AGENTS.md specification, the page that defines what that file is and how it should be handled. It contains the word symlink 0 times and the word symbolicLink 1 time. We did not chase down what that single mention means, so it counts as neither a promise nor a ban. Silence is not a ban, but it is also not a promise.

Third, the official Codex documentation and its README, the instruction sheet for the other main tool. There, every relevant word came back empty: symlink 0, symbolicLink 0, and the terms for a size limit, 0 as well. The documents do not forbid the shortcut. They also do not endorse it. Nobody has signed anything.

## How we measured: four cells, twelve runs

Since the documents stayed silent, the next question was whether the trick at least behaves reliably at the level of files themselves. The answer came from a small test lab, not from asking the AI tools anything.

The method was deliberately narrow. Four test setups, called cells, were each run three times, twelve runs in total. The runs only touched documents and file pointers. No AI tool was actually launched, and every run used a plain Linux container, which is a sealed copy of a computer inside another computer. Each cell either confirmed the same result three times or failed the same way three times.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="en"><span class="lm-card__title">How we measured</span><ol class="lm-card__steps"><li class="lm-card__text">Step 1. Searched Claude Code&#x27;s official changelog for an entry saying the rules file is read directly.</li><li class="lm-card__text">Step 2. Tried a test to see whether a paired symlink appears as the same file in the 32KiB size limit check.</li><li class="lm-card__text">Step 3. Moved the rules files to another location and confirmed the symlink still connects properly.</li><li class="lm-card__text">Step 4. Looked in the rules file spec and the Codex docs for symlink provisions.</li><li class="lm-card__text">Step 5. Answered using only document reading and file inspection, without running the AI tools themselves.</li></ol></div>

Why avoid launching the tools? Because the claim being tested is about paperwork and file facts, not about what a chatbot does. Keeping the AI out made the test cheap and repeatable. But it also left a blind spot, as the last section explains.

## The survival gap after moving things around

The sharpest result came from one question: if you move the whole folder, does the shortcut still connect?

We compared three arrangements. A relative symlink stores its target the way you would say "in the kitchen." An absolute symlink stores the full street address, like "12 Elm Street." And a plain copy stores the rules themselves, with no pointer at all.

We moved each setup to a new directory, then checked whether the pointer still resolved, meaning whether following it actually reached the real file. The result matched the note analogy exactly. The relative link survived all three trials. The absolute link failed all three, with an error meaning "no such file or directory." The copy survived as a normal file, no longer a link.

| Arrangement | Still connects after the move? |
| --- | --- |
| Relative symlink (CL_rel.md) | Yes, 3 of 3 trials |
| Absolute symlink (CL_abs.md) | No, 3 of 3 trials failed with an error |
| Plain copy (CP_copy.md) | Yes, but it is a separate file, not a link |

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-symlink-survives-relocation" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Survival after move</span><span class="lm-card__text">In all three trials, relative links kept connecting after the move. Absolute links failed to find their targets, and copies became regular files rather than links.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Relative links surviving 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">Absolute links surviving 0/3</span></div></div></div>

Here is what this means for you. If your team shares rules through a link, check how the link is written. A full-address link breaks after one move, like a folder reorganization or a machine rebuild. And because no document promised otherwise, nobody owes you a fix.

## Where the 32KiB size limit check stopped

One question could not be answered at all. The rules file for one of these tools has a size cap, 32KiB here, which is a ceiling of 32,768 bytes. We wanted to know whether a linked file counts as its real size, or as the shortcut's size, or whether it gets rejected.

That cell never finished. All three attempts died with the same file-not-found error before any size was measured, giving 0 usable results out of 3 runs. The failure looks like a defect in the test setup itself, not in the tools: in a neighboring test with the same setup, links resolved fine. Still, the honest record is simple: this question is unmeasured, neither confirmed nor refuted.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-symlink-projects-through-32k-boundary" data-lang="en"><span class="lm-card__badge lm-card__badge--fail">fail</span><span class="lm-card__title">Size limit check</span><span class="lm-card__text">All three attempts stopped with a file-not-found error. The size comparison was never performed and was recorded as a failure.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">Successful attempts 0/3</span></div></div></div>

## What this article could not verify

Knowing what was tested matters less than knowing what was not, because the gap between "checked" and "assumed" is where teams get burned.

The biggest hole: no AI tool was ever launched, so whether the programs actually accept and read the linked file while the program was actually running was never observed. A program can read a file even if no changelog mentions it, and a link being ignored or accepted can only be confirmed by watching the program run. The meaning of the single symbolicLink mention in the AGENTS.md spec was also never read, and it may be the one sentence anywhere that supports or forbids this arrangement. What does hold is narrower: within "nothing on any document surface promises this arrangement," all twelve runs support the claim.

If any of these turn up, this article's conclusion should be dropped: a change-history entry showing Claude Code reads AGENTS.md directly, or a sentence in the AGENTS.md spec or Codex docs that explicitly endorses symlink use. This judgment rests only on the document surface as of 2026-08-30 plus file-system measurement.

Two closing instructions, depending on which reader you are. If a broken link has burned you before, rewrite the link to use a relative path instead of an absolute path. Or drop the shortcut and keep a real copy. If you want to make this sharing official, do one thing. Do not write the shortcut into your team rules. Write who creates it, who checks it every day, and let a script own the link.

## References

1. [Claude Code CHANGELOG (raw scan target)](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) — Anthropic (raw.githubusercontent.com)
2. [AGENTS.md spec page (symlink 규정 부재 확인 대상)](https://agents.md/) — agents.md
3. [Codex 공식 문서·README (symlink·한도 규정 부재 확인 대상)](https://raw.githubusercontent.com/openai/codex) — OpenAI