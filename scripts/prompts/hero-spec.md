Goal: write `data/hero-spec.json` for `{{SLUG}}`. Nothing else.

Read `data/fact-core.md`. The spec turns what was measured into one image that carries the article's finding on its own.

The image is shared by the ko, ja, en, and zh versions of the post, so **every string you write is in English**. Code and identifiers keep their original form.

Shape:

```json
{
  "title": "one line, under 58 characters, the finding not the topic",
  "subtitle": "source or condition, under 70 characters",
  "left":  { "heading": "...", "tone": "drop", "items": ["...", "..."] },
  "right": { "heading": "...", "tone": "keep", "items": ["...", "..."] },
  "footer": "the honest limit, under 80 characters"
}
```

Rules that decide whether the image is any good:

- **The title is the finding.** `Official GEO is a subtraction list plus one switch` works. `About GEO and Search Console` does not.
- Two columns when the article contrasts two sets. One column when it does not — omit `right` entirely rather than padding it.
- `tone` is `drop`, `keep`, or `neutral`. It only picks the color and the bullet glyph.
- Two to six items per column. Each item is under 46 characters, a noun phrase or a short clause, no trailing period.
- Every item traces to the FACT CORE. Do not invent a row to balance the columns.
- The footer carries the limit that the article is honest about, the thing the measurement does not prove.
- No colons anywhere in the strings. Same house rule as the prose.
- No emoji, no markdown, no quotation marks around whole strings.

Write only that file. Do not touch `src/`. Do not commit.

Never ask questions.
