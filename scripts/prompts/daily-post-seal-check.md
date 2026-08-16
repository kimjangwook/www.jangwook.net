Goal: judge {{SLUG}}. Write only `data/seal-check.md`. Do not edit any file under `src/content/blog/`.

You are the reviewer, not a writer. Four writers each wrote one language without seeing the others. Your job is to say what is wrong, not to fix prose.

Read `data/fact-core.md` and the four files under `src/content/blog/{ko,ja,en,zh}/{{SLUG}}.md`.

Check only:
- relatedPosts, heroImage, internal links, images exist and resolve
- facts, numbers and quotes stay inside the FACT CORE
- three or more languages do not share the same H2 topic order (robots → console → schema…)

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

Then, for each named language, the specific problem in two or three lines: which H2 spine it copied, which number it invented, which quote drifted from the FACT CORE. Be concrete enough that a writer who cannot see the other languages can act on it.

Name a language only when it must change. A file that already reads like a person stays. Do not make the four outlines match.

Never ask questions.
