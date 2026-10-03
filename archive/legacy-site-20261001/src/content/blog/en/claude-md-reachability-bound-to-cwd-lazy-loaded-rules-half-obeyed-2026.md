---
title: 'CLAUDE.md in Claude Code: Whether a Rule Reaches the Model Depends on Where
  You Start the Session, Not Where the File Sits'
description: A test with 60 runs shows that the same rules file can reach the AI helper
  from one folder but not from another, and a rules file handed over mid-conversation
  was followed only half the time. The launch folder decides the first part; the arrival
  time decides the second.
pubDate: '2026-08-30'
heroImage: ../../../assets/blog/claude-md-reachability-bound-to-cwd-lazy-loaded-rules-half-obeyed-2026/hero.png
tags:
- claude-code
- ai-agents
relatedPosts:
- slug: loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026
  score: 0.7
  reason:
    en: If a rules file reaches or misses the model depending on where the session
      starts, pairing that with the earlier finding that a single contrary user request
      makes Claude Code discard the entire CLAUDE.md completes the full picture of
      how fragile those rules are.
    ko: 규칙이 세션 시작 위치에 따라 모델에 도달하기도 하고 놓치기도 한다면, 그 규칙이 일단 도달한 뒤 사용자 요청 하나로 통째로 버려지는
      이전 실험의 결과와 이어서 규칙의 취약점 전체 그림이 완성된다.
    ja: ルールがセッション開始場所によってモデルに届いたり届かなかったりするなら、届いた後そのルールがユーザーの一言で丸ごと捨てられるという前回の実験結果と合わせて、ルールの脆弱性の全体像が見えてくる。
    zh: 既然规则文件能否送达模型取决于会话从哪个目录启动,再结合此前发现的用户一句反对就会让 Claude Code 丢弃整份 CLAUDE.md,就能拼出规则脆弱性的完整图景。
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: If the session's launch folder decides whether CLAUDE.md reaches the model,
      reading this alongside the companion post — where 219 runs show declared rules
      like robots.txt and AGENTS.md failing silently with no error — explains why
      no rules file should ever be trusted just because it exists.
    ko: 세션 시작 폴더에 따라 CLAUDE.md가 모델에 도달하느냐 마느냐가 갈린다면, 이번 실험은 규칙 파일이 도달했더라도 내용이 잘려도
      에러 없이 조용히 무시되는仙境을 219런으로 검증한 선임 글과 나란히 읽어야 왜 모든 규칙 파일이 '선언됐다=적용됐다'가 아닌지 완성됩니다.
    ja: セッション開始フォルダでCLAUDE.mdの到達が決まる本実験と並べて読むと、本編の219ラン実測が明かす「ルールファイルが宣言されてもエラーなしで静かに無視される」仕組みがなぜすべてのルールファイルに当てはまるのかがつながります。
    zh: 如果说会话启动目录决定 CLAUDE.md 能否抵达模型，那么结合姊妹篇用 219 次实测证明 robots.txt 与 AGENTS.md 等声明规则会静默失效且不报错的结论，你就能完整理解为什么“声明了规则”绝不等于“规则生效”。
---

## The Folder Where You Put the Rules File and the Folder Where You Start the Session

Many people keep a small instruction file next to their work. When you use Claude Code (a helper program that works inside your project folders), it looks for a file named CLAUDE.md. A CLAUDE.md file is a short sheet of house rules for the AI helper: how to write code, what to avoid, that sort of thing. Claude Code reads CLAUDE.md, not AGENTS.md. That detail matters. There is another popular rules format named AGENTS.md, meant to hold "the extra, sometimes detailed context coding agents need." But based on Anthropic's own documentation, Claude Code simply does not pick it up. So even the *name* of the file is part of whether your rules arrive.

Here is the finding. Whether a rules file actually reaches the helper does not depend on where you put the file. It depends on which folder you open the helper in. Think of a family home. A letter left on the front table gets read every single morning, because everyone passes that table on the way to breakfast. The exact same letter, handed over later in the day while someone is busy, may be set aside unopened. Same paper, same words, but the two are treated differently because of when and how they arrived.

That is half the story. The other half: even when the late-arriving letter *was* opened and read, the helper followed it only half the time. Rules that were in front of the helper from the very start were followed every single time. The rest of this article walks through how that was measured and what it means for you.

## How We Measured

We built a test setup with four nested folders, like an address: a street (the outer folder), a building (the top-level project), a floor (a packages folder), and one apartment (the deepest folder, called api). One identical rules file was placed at each level, one at a time. Each file contained a made-up secret string, a "canary," like a tiny identification card the file carries. If the AI's answer contained the secret string, the file counted as *reached*. If not, it counted as missed.

We started the helper from two different places: the top of the project and the deepest folder. That starting place is called the working directory, or cwd for short. In plain words: it is the folder you happen to be standing in when you open the helper. Then we ran each combination six times. In total, 60 runs of the test. Each run asked the helper to repeat the secret string from the file, so a "hit" was impossible to fake by luck.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="en"><span class="lm-card__title">How we measured</span><ol class="lm-card__steps"><li class="lm-card__text">Step 1. Placed instruction files in four locations: above the repo, repo root, middle, and deepest folder.</li><li class="lm-card__text">Step 2. Ran the program six times each when launched from the repo root and from the deepest folder.</li><li class="lm-card__text">Step 3. Judged the file as reached if the model revealed a secret string inside it.</li><li class="lm-card__text">Step 4. Used fake files that are not read as instruction files to check for no leakage even when run in the same folder.</li><li class="lm-card__text">Step 5. Separately verified the rule that the deepest folder&#x27;s file loads only when the file is read.</li></ol></div>

One more piece of the setup matters: a control file. We made a file called NOTES.md, a name that *no* rules-reading process ever looks for, and ran it the same way. It scored 0 out of 6. That run is what makes the misses believable. Without a control, a missed file could just mean our test was broken. When a file that nobody reads scores zero while real rules files score six, a miss means the file genuinely was not loaded. That is the whole job of the control, and one paragraph is enough for it.

## How the Launching Folder Changed Whether the Rules Arrived

The clearest result came from the middle floor of our four-story building. We put the rules file in the packages folder (the floor between the building entrance and the top apartment) and started the helper from the building entrance. Result: 0 out of 6. The helper never saw the file. Same file, same folder. Then we moved the *starting place* down to the deepest folder, under packages. Result: 6 out of 6. Every run reached it.

Nothing about the file changed. Only the starting folder changed. It is like putting a reminder on the wrong shelf in the kitchen. The note itself was fine. People just never looked there.

The top of the chain behaved differently. When the rules file sat at the top floor of the project, both starting places reached it, 6 out of 6 from each. The helper also walked *above* the project, past its outer boundary, all the way to the street-level folder. That scored 6 out of 6 too. So the reaching rule, in plain terms: when the helper opens, it walks upward from the folder you are standing in, gathering every CLAUDE.md it passes, even past the project's own edge. Rules above you always arrive. Rules below you wait.

## The Rules File That Arrived Late Got a Different Treatment

What about the file in the deepest folder when you start from the top? Here something subtle happens. Starting from higher up, the helper does not load the deep folder's file at the start. It only loads it if it opens a file inside that deep folder during the conversation. This is called lazy loading: the rule does not arrive at the start; it arrives late, only when a file in that area is opened.

We tested this two ways. First we simply *asked* the helper about the deep rules file. Result: 0 out of 6. Never reached. Then we had the helper actually *open a file* in that deep tree. Result: 6 out of 6. The rule arrived. The rule arrived only because the test gave the helper a reason to open a file in that folder first.

Now the surprising part. Once those 6 late arrivals had the rule in hand, all 6 of them *classified* the rule as a prompt injection. That means the model treated text from a file as untrusted material. It acted like a stranger's note slipped into your mailbox rather than a letter from your own family. And the rule was actually followed in only 3 of the 6 runs.

Compare that with the rules that were present from the very start of the conversation. Across all 36 runs where a rules file loaded at launch time, the rule was followed 36 out of 36 times, and the helper showed suspicion in 0 of those runs. Same file, same words, same size. Early arrival: trusted and obeyed, 36 of 36. Late arrival: treated as suspicious, obeyed 3 of 6. The file did not change. What changed was only when the same words arrived, and that alone changed how the helper treated them.

What does this change for you? If a rule really must be followed (a safety rule, a naming rule, anything with teeth), handing it over mid-conversation means it will be followed, at best, half the time.

## Why Codex Left Not a Single Data Point

We also ran the whole test against Codex, a second AI coding helper, to see whether different helpers have different rules-reading habits. It produced nothing. Codex never returned results. All runs ended before the model could answer, so there were no numbers to judge. The failing runs looked like this: the program started, and then closed without any response at all.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-codex-mid-leafcwd" data-lang="en"><span class="lm-card__badge lm-card__badge--fail">fail</span><span class="lm-card__title">Codex mid file, deep run</span><span class="lm-card__text">All six times the program died without responding, leaving no data to judge.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">No response 6/6</span></div></div></div>

The honest lesson here is a limit, not a finding. Because Codex gave zero data, this experiment cannot say whether other tools read rules the same way or differently. Whether a second helper would even pick up a rule file the way Claude Code does remains untested here. What you can trust is the Claude Code result alone. One caveat about its size is coming at the end.

## Conclusion

Put the two halves together. Written rules reach Claude Code based on where you *start* the session, not where you put the file. Rules above your starting folder always arrive and are always followed, 36 out of 36. Rules below your starting folder arrive late, only if a file in their area gets opened, and late arrivals were suspected every time and followed only half the time. Where the file physically sits, by itself, tells you nothing.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">Claude always reads instructions from the launch folder and its ancestors, but reads lower subfolder instructions only when opened from that folder or when the file is read, while Codex never responded in this experiment so no comparison was possible.</p></div>

If you want out of these details, you are someone who always opens your work sessions in the same folder, like a review process that runs on a schedule. Then do this: a rules file can sit right next to your work folder, but if the session never opens any file inside that folder, the rules never arrive. Put the rules that must be obeyed in a place visible from where the session starts.

If you want in, you are someone who moves between subfolders and works directly inside them. Then do this: the rules file in a subfolder only arrives when a file there is opened, and it gets trusted at half strength when it does. Promote the rules that must always hold to the top of the folder chain, and keep the subfolder documents as reference material only.

One condition would make this whole judgment wrong: every folder giving the same reach for the same rules file, and late rules being followed as faithfully as early ones. In reality, the results split 36 out of 36 for start-time rules against 3 out of 6 for late arrivals. That is why this argument stands.

## What This Article Could Not Verify

Not everything below the top was confirmed. First, the second helper left no data, so no claim is made about how other tools handle rules. Second, this design cannot separate two possible causes of the late-arrival suspicion. It may be the timing of the arrival. Or it may simply be that the text came through a file being opened. The test cannot tell those apart. Third, six runs per setup is a small sample, so "half the time" is a directional observation, not a precise rate. Also, a hit only means the secret string appeared in the answer. It cannot tell "loaded but ignored" from "never loaded." The next steps are to rerun the second-helper tests once its usage limits allow, and to rerun the late-arrival test with a variant that feeds the same file's contents at the start, so timing and delivery route can be separated.

## References

1. [Manage Claude's memory (CLAUDE.md) / Claude Code Docs (loader)](https://code.claude.com/docs/en/memory) — Anthropic (code.claude.com)
2. [AGENTS.md](https://agents.md/) — agents.md