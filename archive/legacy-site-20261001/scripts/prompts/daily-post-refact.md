Goal: rebuild `data/column-brief.md` for the already-published slug `{{SLUG}}`.
First line is `slug: {{SLUG}}`.

This post exists. Four writers are about to redo it from your file and will never
see the published text. So the brief has to carry everything that was actually
measured, or the evidence dies here.

Read, in this order:
1. `/Users/jangwook/workspace/www.jangwook.net/docs/persona-kim-jangwook.md`
2. `/Users/jangwook/workspace/claude-controller/.claude/skills/daily-tech-blog/SKILL.md`
3. `scripts/prompts/daily-post-brief.md` — the schema and the rules behind it
4. All four of `src/content/blog/{ko,ja,en,zh}/{{SLUG}}.md`

Extract, do not invent. Every number, command, and verbatim quote must already
appear in one of those four files. Where two languages disagree on a number, keep
the one that names how it was measured and record the conflict in `open_questions`.

Do not research a new topic. Do not change the subject. Do not run the sandbox again
unless a number in the published text is unverifiable without it — if it is
unverifiable and you cannot re-measure it, drop it rather than carry it forward.

## The split is the point

The published post mixed locked facts and the author's reasoning into one stream.
Your job is to pull them apart.

- `## LOCKED` — anything a reader could check against a source. Numbers, quotes,
  dates, URLs. If you cannot point at where it came from, it does not go here.
- `## OPEN` — the argument the post was making. Thesis, stance, the counter it took
  on, the mechanism it proposed. Writers may extend this and may disagree with it.

A claim in the published text with no traceable source is not a fact. It goes in
`## OPEN` as part of the argument, or it goes nowhere.

`sources[].n` numbers must be stable across all four rebuilt posts. Order them the
way the published `## 참고 자료` section ordered them, so the rebuild does not
reshuffle the references.

`tested` carries only what the published post actually claims was run, with the
command as published. If the post described a measurement without a command, put
the measurement in `facts[]` and leave `tested` empty.

Use the shape defined in `scripts/prompts/daily-post-brief.md`, with these
differences:

```
pubDate: (the pubDate already in the published frontmatter — do not move it to today)
lane: (the lane the post was written on)
hero: (the heroImage already in the published frontmatter)
hero_kind: (plate if the hero is a rendered typographic plate, else illustration)
```

Do not write anything under `src/content/blog/`. Do not commit.

Never ask questions.
