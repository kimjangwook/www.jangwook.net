Goal: publish {{SLUG}}.

Read `data/seal-check.md` and the four files under `src/content/blog/{ko,ja,en,zh}/{{SLUG}}.md`.

Do not rewrite prose. The writers are done. If something still reads wrong, note it in the Telegram message instead of editing it.

Steps:
1. Confirm the four files exist and their frontmatter is valid.
2. Commit the `{{SLUG}}` post, its assets, and its metadata only. Stage with explicit paths. Never `git add -A`, `git add .`, or `git commit -a` — this working tree carries thousands of unrelated file-mode changes and a blanket add would sweep them in.
3. Push `origin main`.
4. Telegram: `/Users/jangwook/workspace/claude-controller/sh/send-telegram.sh`. One message: title, URL, four language filenames, and anything from `data/seal-check.md` that survived unfixed.

Never ask questions.
