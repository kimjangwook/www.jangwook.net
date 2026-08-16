Goal: rebuild `data/fact-core.md` for the already-published slug `{{SLUG}}`. First line is `slug: {{SLUG}}`.

This post exists. Four writers are about to redo it from your file and will never see the published text. So the FACT CORE has to carry everything that was actually measured, or the evidence dies here.

Read, in this order:
1. `/Users/jangwook/workspace/www.jangwook.net/docs/persona-kim-jangwook.md`
2. `/Users/jangwook/workspace/claude-controller/.claude/skills/daily-tech-blog/SKILL.md`
3. `scripts/prompts/voice-anti-ai.md`
4. All four of `src/content/blog/{ko,ja,en,zh}/{{SLUG}}.md`

Extract, do not invent. Every number, command, and verbatim quote must already appear in one of those four files. Where two languages disagree on a number, keep the one that names how it was measured and note the conflict under `limits`.

Do not research a new topic. Do not change the subject. Do not run the sandbox again unless a number in the published text is unverifiable without it — if it is unverifiable and you cannot re-measure it, drop it rather than carry it forward.

Use this shape. Bullets only. No article prose.

```
slug: {{SLUG}}
pubDate: (the pubDate already in the published frontmatter — do not move it to today)
lane: A|B
hero: (the heroImage already in the published frontmatter)
related:
  - slug
scene: one moment (command, click, error, file that was the wrong length)
surprise: what I expected vs what the bytes did
failed: what I did not do (login, tool, measurement)
numbers: value — unit — how measured
quotes:
  - text: "verbatim"
    url: https://...
limits: what this does not prove
commands: copy-pasteable
```

Do not write anything under `src/content/blog/`. Do not commit.

Never ask questions.
