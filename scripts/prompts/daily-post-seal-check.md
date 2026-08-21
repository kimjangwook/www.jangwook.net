Goal: judge {{SLUG}}. Write only `data/seal-check.md`. Do not edit any file under `src/content/blog/`.

You are the reviewer, not a writer. English is the Master Article (Source of Truth), and ko/ja/zh are transcreated/translated from the English master. Your job is to say what is wrong, not to fix prose.

Read `data/column-brief.md` and the four files under `src/content/blog/{ko,ja,en,zh}/{{SLUG}}.md`.

Check only:
- relatedPosts, heroImage, internal links, images exist and resolve
- facts, numbers and quotes stay inside the 브리프 `## LOCKED` block and match across languages
- translations (ko, ja, zh) read naturally without awkward machine-translation syntax or calques
- **no impersonated execution** — see below
- **no wave characters (`~`, `〜`, `～`)** in prose (outside code blocks)
- **no parenthetical dictionary glosses** (`Term(explanation)` clutter that breaks reading rhythm)
- if the brief says `hero_kind: illustration`, the body carries at least one figure
  or code block of its own. A generated illustration is decoration, not evidence.

Only `## LOCKED` is fact. The `## OPEN` block is material the writer was told to
extend, argue with, and reorder. Context, comparisons, analogies, and the writer's
own read of where this goes are **not** inventions. Do not flag them. What you flag
is a number, quote, or date that is not in `## LOCKED`.

## Impersonated execution

The writers were told not to write a paragraph confessing what they did not try.
That removes the confession, not the constraint. This check is what replaces it.

Find every first-person execution verb in the body — 돌려봤다 / 재봤다 / 확인해봤다 /
설치했다 / 直接試した / 実行した / 測った / I ran / I measured / I installed /
我运行了 / 我实测. For each one, ask whether it maps to an entry in the brief's
`## LOCKED` `tested[]`.

If it does not map, name that language in REWRITE and quote the sentence. The fix is
to write the same claim without the first person, from the source — not to add a
disclaimer paragraph.

An empty `tested[]` is normal. It means every such verb in the body is a defect.

Metadata you may fix yourself, in place: frontmatter fields, relatedPosts targets, heroImage paths, broken internal links. Those are not prose.

Prose you may not touch. If a language must change, name it and let its writer redo it.

Write `data/seal-check.md` in this shape. First line is one of:

```
OK
```

or

```
REWRITE: ja,zh
```

Then, for each named language, the specific problem in two or three lines: which number it invented, which quote drifted from the 브리프, which sentence claims a run that `tested[]` does not have, or where machine translation awkwardness breaks reader trust. Be concrete enough that the writer can act on it.

Name a language only when it must change. A file that already reads like a person stays.

Never ask questions.
