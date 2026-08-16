Goal: write only `data/fact-core.md`. First line is `slug: kebab-name` or `SKIP: reason`.

Read, in this order:
1. /Users/jangwook/workspace/www.jangwook.net/docs/persona-kim-jangwook.md
2. /Users/jangwook/workspace/claude-controller/.claude/skills/daily-tech-blog/SKILL.md (topic gate, lanes, no money/company names)
3. scripts/prompts/voice-anti-ai.md

Research. If Lane A is possible, run the sandbox in /tmp. Collect evidence.

The file is raw material for four later writers who will never see each other. They need scenes, not a slide deck.

Use this shape. Bullets only. No article prose.

```
slug:
pubDate: YYYY-MM-DD
lane: A|B
hero: path or TODO
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

Do not write anything under src/content/blog/. If the gate fails, first line is SKIP.

Never ask questions.
