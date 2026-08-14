Goal: publish {{SLUG}} without flattening the four voices.

Read `data/fact-core.md` and the four files under `src/content/blog/{ko,ja,en,zh}/{{SLUG}}.md`.

Check only:
- relatedPosts, heroImage, internal links, images exist
- facts and quotes stay inside the FACT CORE
- three or more languages do not share the same H2 topic order (robots → console → schema…). If they do, rewrite headings and the surrounding transitions in the copies that followed. Do not translate paragraphs to “fix” it.

Do not rewrite a file that already reads like a person. Do not make the four outlines match.

Commit today’s post, assets, and metadata only. Push `origin main`. Telegram: `/Users/jangwook/workspace/claude-controller/sh/send-telegram.sh`.

Never ask questions.
