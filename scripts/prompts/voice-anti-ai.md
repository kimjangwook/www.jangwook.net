---
name: voice-anti-ai
description: Pattern file for native, non-translated daily posts. The launch prompt stays short. This file does the work.
---

# Apply this file. Do not recap it.

Writer prompts live in `scripts/prompts/daily-post-lang-{ko,ja,en,zh}.md`, written in that language. This file is the shared pattern list. Do not stuff don't-lists into the launchd plist.

Selected from X (2025-09〜2026-08):

- Short prompt + pattern file. 400-word "don't sound like AI" prompts fail. The model drops a don't-list by sentence three. (@comfortfajugbag 2026-03, 4.3만 뷰; @rubenhassid 2026-04, 2.3만 뷰)
- Name the output. Prefer positives. "Write the Korean file" beats "don't translate." Samples beat adjectives. (@AiwithAliya6 2026-08, Anthropic guide distill)
- Start from bullets. Edit sentences, do not one-shot a four-language essay. Feed a real past post. (@hosseeb 2025-09, 8.1만 뷰)
- Write in the market language from the first sentence. Translation is for readers after shipping, not for drafts. (@grok 2026-08)
- Rejected: stuffing "here's the thing / let's dive in" replacements into the prompt (@alex_prompter). Those are new tells. Rejected: write-then-translate to beat a detector (@danrobinson). This blog is for native readers.
- Requirement count is a cost. Compliance drops as a prompt piles on requirements — measured at about 19% (arXiv:2505.13360, 2025-05). That is why the per-language prompts stay short and this file carries the shared load. Adding a line here means earning it.

## The reader is not only an engineer

This is the part the 2026 research moved most, and it applies to all four languages.

**Stakes are countable consequences for named people.** Not "this matters." Who loses what: money, a deleted history, the next project, 61 lines nobody reviewed. Toss's most-shared 2026 piece led with 5,600억 vs 350억 and drew comments from a 사회과학 reader and a 금융권 practitioner. Findy's most-shared piece fixed its scope in three paragraphs — one person, one month, almost no hand-written code — before making any claim.

**A term's job comes before its name.** Never open on a definition. Show the thing failing or working in the scene, then name it, then optionally give the original spelling in parentheses. `ADB(안드로이드 기기를 명령으로 제어하는 도구)` is the shape. Jay Alammar's Illustrated Transformer states Query/Key/Value are abstract *before* computing them; Spolsky reaches "code point" only after a résumé breaks into Gimel in Israel.

**Analogy budget: one per article, and say where it breaks.** Allowed only when the analogy is shorter than the plain statement and cannot be misread. An analogy nobody corrects becomes the reader's wrong model.

**Put other roles in the room.** A PO who looked at the number, a designer who filed the bug, a 비개발자 colleague who asked the question in Slack. Report it as an event, never as a lecture aimed at them.

**Substance test, per paragraph.** After each one the reader must be able to repeat a name, a number, a date, a cause, or a trade-off. If deleting the paragraph loses nothing, it was decoration. (SlopDetector 2026-07 signal 12.)

## Patterns to rewrite on sight

**English stems:** delve, unleash, game-changing, revolutionary, transformative, leverage, unlock, it's worth noting, it's important to, in other words, at the end of the day, not just X but Y, here's the, let's dive, in today's, tapestry, landscape, realm, moreover, furthermore.

**Korean stems:** ~하는 것이다, ~에 대해, 그것은 ~이다, 먼저 용어부터, 중요한 건 이것이다, 오늘 내가 택한 쪽, 본절에서는, 이 글에서는, 말할 필요도 없이, 패러다임, 혁신적, 여정이 시작된다, 단순히 A가 아니라 B, ~되어지고 있다, 수행/진행/실시/처리, ~를 통해.

**Japanese stems:** 本節では, 重要なのは, まず用語を, 〜だ。〜だ。〜だ。, レバー, レイヤー (when they are Korean calques), つまり/要するに/このように の定型, 〜が重要です, 羅針盤・架け橋・地図の在庫比喩, 見ていきましょう.

**Chinese stems:** 先把词钉死, 划掉清单, 资格的层, 生成式资格层, 四字对仗连发, 不是A而是B(及「更是」「不只是…更是」), 进行/开展/作出/予以/得以, ……的存在, 值得警惕, 不容忽视, 从某种意义上说.

**Newer tells (2026), all languages:** a sentence ending in an -ing tail that adds fake analysis (highlighting, underscoring, reflecting); avoiding *is/has* for serves as / stands as / boasts / features; renaming the same subject every sentence to avoid repetition; long sentences joined by "and" with almost no commas, semicolons, or parentheses; a closing section shaped as "despite its X, challenges remain" or a call to action.

**Em dashes are no longer a machine mark.** The Economist's 2026-07 study (55,940 sentences) found ChatGPT uses them *less* than human writers, and Claude is the only current model that overuses them. Limit them for rhythm if you like. Do not strip them as camouflage, and do not treat their presence as evidence of anything.

**Sentence length has two failure modes, not one.** Uniform length reads as machine. So does a metronome — short, long, short, long — unrelated to the thought. Length changes when the thought changes.

## Typography (2026-08 research)

Detectors moved from vocabulary to layout, because vocabulary got cleaned up first.

- **No emoji in headings. No `---` between sections. No Title Case section headings.** Sentence case in English, noun phrases in ko/ja/zh.
- **Bold only for a proper noun's first mention.** Emphasis is a short sentence or a number, not a typeface. A page with bold in every paragraph reads as a slide deck.
- **No characters your keyboard does not have.** Box drawing, `─ ≈ ⚠ →`. Pangram measures these at 3× human rate, and box-drawing horizontals at **940×**. This is the layer that survives after someone strips the AI vocabulary, which is exactly why it identifies.

## Structure (2026-08 research)

- **Sections do not get equal weight.** Write the one that matters long and cut the rest short, or drop them. Even section lengths are a generated table of contents, not a piece of thinking.
- **Paragraphs do not share one skeleton.** Not every one is topic sentence, explanation, example, summary. Some start on the example. Some end without a summary.
- **Lists are not parallel.** Two items is fine, so is four. One item can be a word and the next a full sentence. Matched counts and matched grammar are a template.
- **When you concede, keep the concession.** Naming a counterargument and returning immediately to your original path is the shape of balance without the cost of it. Say what you gave up.
- **Do not close on balance.** Pick a side, then write one line naming the condition under which you are wrong. That line is what a balanced ending is pretending to be.
- **The last sentence is new information or an observation you never resolved.** Never a summary, never a moral.
- **No unrequested therapist mode.** "You're not imagining it", "you're not alone", "sit with that". These turn up in pricing and productivity writing where nobody asked for reassurance.

**Structure:** quote then the same sentence restated; every section is define → quote → table → hedge; four languages sharing one H2 order; a warm closer that names no layer.

A line you would not say out loud gets rewritten. Numbers and verbatim quotes stay.

## How a {{LANG}} file should sound

**ko** 해라체. Mix `~다` with noun stops and a short question. Field words stay (스프린트, 스위치, 배포). No English-metaphor calques.

**ja** だ体. Break `〜だ` runs with 体言止め. MEO stays MEO.

**en** Contractions in some sentences, not all. Active voice. Slack-to-a-coworker register.

**zh** 收录, 摘要, 抓取, 站点资源, 父级属性. 书面为主, 夹一点短句. No Korean calque.

## Process the scheduler already enforces

`scripts/daily-post-pipeline.sh` splits the day into isolated processes. Judgment runs on claude, prose runs on codex. No process writes two languages.

1. **core** — claude (opus) writes `data/column-brief.md` (bullets). Topic gate, lane, evidence. It is denied the blog tree.
2. **lang ×4** — agy (`gemini-3.7-flash-medium`), one process per language. Before each run the other three files for today's slug are moved out of the repo, so there is no draft on disk to translate from. If the writer dies, that one language falls back to claude opus at effort `xhigh`, from the 브리프, not from whatever the writer left behind. The writing model is deliberately a mid-effort one: raising reasoning makes prose more uniform, and uniformity is what reads as machine (measured 2026-08-15). `data/write-engines.txt` records who wrote what.
3. **polish** — a model different from the writer edits that one file, inside the same hold window. 20-30% shorter, no new facts, no added transitions, reproduction commands untouched. Prompts in `scripts/prompts/daily-post-polish-{ko,ja,en,zh}.md`. Writing and cutting are separate jobs; merging them into one prompt costs compliance on both.
4. **review-1** — a model different from the writer writes `data/review-gemini.md`: facts against the 브리프, quotes, frontmatter, links, H2 sequences, truncation. Mechanical layers only, no taste. Non-fatal — a missing review does not stop the day.
5. **seal-check** — claude opus at effort `xhigh` reads all four plus the first-pass notes, and writes `data/seal-check.md`: `OK`, or `REWRITE: ja,zh` with the specific problem. It fixes metadata, never prose. The first-pass notes are input, not a verdict; opus re-derives each claim and has overturned them.
6. **rewrite** — the writer redoes only the languages seal-check named, still one file at a time, then polish runs again on it.
7. **seal-publish** — claude commits, pushes, sends Telegram. `validate:publishing` fails a shared H2 spine on pubDate >= 2026-08-14.

Reviewer and editor are always a different model from the writer. A model reads past its own prose.

A human editing a post by hand is outside this. The rule is about the scheduler: whatever writes an article body is codex.
