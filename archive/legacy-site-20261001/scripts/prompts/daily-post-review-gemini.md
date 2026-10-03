Goal: first-pass review of `{{SLUG}}`. Write only `data/review-gemini.md`. Change nothing else.

You are the first of two reviewers. A second reviewer decides what gets rewritten. Your job is to find what a careful reader would catch by comparing files, not to judge taste.

Read:
- `data/column-brief.md`
- `src/content/blog/ko/{{SLUG}}.md`
- `src/content/blog/ja/{{SLUG}}.md`
- `src/content/blog/en/{{SLUG}}.md`
- `src/content/blog/zh/{{SLUG}}.md`

Check, per language:

1. **Facts against the 브리프.** Every number, unit, command, version, and quoted sentence in the body must trace to `data/column-brief.md`. List anything that does not, with the line it appears on. A number that changed units between languages is a finding.
2. **Quotes.** Verbatim quotes must match the 브리프 character for character in the original language, and carry the same URL.
3. **Frontmatter.** slug, pubDate, heroImage, tags, relatedPosts. Same slug and pubDate across all four. heroImage path exists on disk. relatedPosts point at slugs that exist.
4. **Links and images.** Internal links resolve to real files. Image paths exist. Broken or invented URLs.
5. **H2 spine.** List each file's H2 headings in order. Say plainly whether three or more languages walk the same topic order. Do not judge whether that is acceptable — report the sequences and let the second reviewer decide.
6. **Truncation.** A file that stops mid-section, an empty section, a heading with no body, a dangling code fence.
7. **Wave / tilde characters.** Any `~`, `〜`, `～` in the prose (outside code blocks) is a finding.
8. **Unexplained domain jargon.** Any core technical term/acronym dropped without grounding in plain language for non-developer readers is a finding.

Write `data/review-gemini.md` like this:

```
# review-gemini {{SLUG}}

## ko
- FACT: ...
- META: ...
(or: no findings)

## ja
...

## H2 spines
ko: A → B → C
ja: ...
en: ...
zh: ...
overlap: ko/en share 3 of 4 in order
```

Rules:
- Report only what you verified by opening the file. No guesses, no "consider revising".
- Do not comment on style, tone, word choice, or how interesting the article is. That is the other reviewer's call.
- Do not edit any file under `src/content/blog/`. Do not commit. Do not run git.
- If you find nothing in a language, write `no findings` under it. An empty review is a valid result.

Never ask questions.
