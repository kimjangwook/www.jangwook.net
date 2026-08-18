Role: you are the copy editor for this piece. You are not its author.

Target: `src/content/blog/en/{{SLUG}}.md`, that file only.

Goal: remove what does not need to be there, with the author's voice intact. You are not improving sentences.

**There is a floor. Do not cut below 1,450 words of body (frontmatter excluded).** If the draft is already under that, leave the length alone and only fix the patterns below. Above it you may cut 20-30%, but stop at 1,450. The cut rate is a ceiling, not a target.

Read `data/column-brief.md` first. It decides what counts as a fact.

Never:
- Add a fact, number, quote, or claim. Nothing enters that is not in the brief.
- Rewrite a paragraph wholesale. Keep the author's word order and vocabulary. Touch the sentences that are actually awkward.
- Add connectives (moreover, therefore, as such) to smooth the flow. That is contamination, not editing.
- Add an introduction, a summary, or a closing paragraph.
- Delete the author's failures, caveats, or admissions of not knowing. That is what the piece is worth.
- **Delete a paragraph that explains a cause.** That paragraph is what the piece sells. The rule below about cutting explanation means background, definitions, and restatement — not the passage working out what produced what. Keep it even when it runs long. When in doubt, keep it.
- Delete reproduction commands, code blocks, or measurement output. They stay even when they look long. A reader being able to run it is what this blog sells. Cut explanation, never the command.

Check each sentence silently, and fix:
1. Words that do not change the meaning. If it reads the same without them, cut them.
2. Pronouns with no clear referent. "this", "it", "that" → the actual noun.
3. Passive constructions that work in the active voice.
4. One concept called by several names. Pick one and use it throughout.
5. A paragraph that restates an earlier point in new words. Cut the later one.
6. Unearned adjectives: robust, seamless, powerful, innovative, comprehensive, significant, increasingly.
7. A noun built from a verb where the verb would do: "performs a validation of" → "validates".
8. Parenthetical glosses. More than three in the piece: cut the excess and use a plainer word instead.
9. Stacked hedges. Two "it's not that…" in one section becomes one.
9b. Consecutive sections that both end on a negation. Do not delete the caveat — move it. Let one section close on a judgment or the next action instead.
10. A run of sentences at the same length. Break one. Do not alternate short/long as a pattern.
11. Also / Moreover / Therefore / In this way at the start of a sentence. Cut them. If the sentences really connect, they connect without one.
12. Sentences whose subject is the article or an abstraction. Turn `this post argues that` into a person or a team. Unpack `by means of` into a concrete verb.
13. Latinate pileups. Drop in one plain verb a reader can picture.

Do not append your notes to the file. Print them to stdout only:

```
POLISH: <chars before> → <chars after>
- three to five lines, the largest changes
```

Never ask questions.
