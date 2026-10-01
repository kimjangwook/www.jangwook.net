# jangwook.net design guide

jangwook.net is a contemporary editorial column for technical questions, evidence, and decisions. The visual language is spacious and restrained: serif headings, readable sans-serif interface text, thin paper rules, and one brick-red accent. The page should feel like a carefully edited field note rather than a dashboard.

## Tokens

- Paper: `#F4F0E8`; surface: `#FBF9F4`; ink: `#242621`; muted: `#62665D`; accent: `#A33A24`; decorative rule: `#D8D1C5`.
- Controls use `--control-border`; keyboard focus uses a visible 2px `--focus-ring` with offset. The decorative rule never carries state by itself.
- Dark mode remains supported with the semantic variables in `src/styles/global.css`; keep text contrast readable and the accent restrained.

## Type and layout

- Load only the current locale's two families and three weights: Noto Serif/Sans KR, JP, or SC for CJK; Newsreader 500 and Geist 400/600 for English. The neutral root hub may load the four sans families plus Newsreader for its language list. Use the native monospace stack for code.
- Page width is at most 1240px. Keep mobile side padding at 20px, or 16px at 320px. Article reading measure is 720px.
- Body copy is 19px with a 1.85 line height. Headings use serif weight 500, balance naturally, and never clamp, ellipsize, or reserve a fixed height.
- Links remain identifiable with underlines or an equivalent active treatment and a clear focus state. Content remains visible without JavaScript. Keep motion to a few quiet transitions and honor reduced motion.
- Use one native language select with localized names and a label. Preserve equivalent-page URLs and a working link fallback without JavaScript. On mobile, keep brand and tools together and the four navigation links on one uninterrupted row, including at 320px. Do not let a sticky header cover content on short viewports.

## Reading surfaces

- Article reading uses a 720px measure, 19px/1.85 body copy on desktop, and 18px/1.88 on mobile. Preserve the source prose and paragraph order.
- Show a table of contents when an article has at least four second- or third-level headings. Use native `<details>` for the mobile TOC; keep all article paragraphs visible without JavaScript.
- Put long code and wide tables inside labelled, focusable regions with scoped horizontal scrolling so the document itself never scrolls sideways.
- Reading progress is a noninteractive 2px bar at the viewport edge. Its fill stays inside that container; never apply viewport-fixed positioning to the fill. Verify the bar halfway through an article at mobile widths, not just at the top where its width is zero.

## Content and routes

- Keep the homepage opening focused on the headline and introduction; do not restore the removed pricing diagram. Write author copy in natural, concrete language rather than translated slogans.
- Call tag navigation "태그" (Tags / タグ / 标签). Home tag discovery uses every unique tag from the latest five published columns in the current language, with the same stable ordering as the archive. Exclude drafts and future posts. Any displayed counts refer to those five columns; the full tag directory remains available.
- Preserve all locale routes, downloads, publication-date guards, canonical/hreflang/schema metadata, source-hash markers, tag routes, and archive no-JS/infinite-loading behavior.
- Prototype specimen labels, benchmark drafts, fabricated counts, testimonials, green verification badges, purple/neon/blue glow, and decorative code do not belong in production.

Personal article authoring follows the separately documented manual workflow and requires the user's publishing authorization.
