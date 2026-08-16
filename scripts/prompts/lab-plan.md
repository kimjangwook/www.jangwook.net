Goal: design one deep experiment and write only `{{LAB_DIR}}/plan.json`. You do not run it. Another agent executes what you write, cell by cell, and it cannot ask you anything.

## Read first

1. `/Users/jangwook/workspace/claude-controller/.claude/skills/daily-tech-blog/SKILL.md` — 여덟 기둥과 레인 정의
2. `data/labs/index.json` — 이미 돌린 실험. 같은 질문을 다시 묻지 않는다
3. `data/topic-backlog.json` — 있으면 후보

## Pick a question you cannot already answer

A topic is `AGENTS.md`. A question is `does a nested AGENTS.md reach the model when the tool is launched from the repo root, and does the answer differ between the two CLIs I actually use`.

Count the pillar distribution of the last seven entries in `index.json` and pick from the under-represented side. 웹 층(AIO·GEO·a11y)과 에이전트·조직 층(자동화·팀빌딩·AX·프롬프트·하네스) 중 적게 나온 쪽이다.

Write down what you expect **before** designing the matrix. That expectation is the spine. If the result matches it, this is a confirmation and probably not an article. If it breaks, it is.

## Design the matrix

- Cross at least two dimensions. **Twelve cells is the floor.**
- Every cell repeats. `repeats` is 3 minimum, 6 when the output is non-deterministic. Almost everything involving a model is non-deterministic.
- Include at least one cell whose only job is to **falsify** the answer you expect. Mark it `"falsifier": true`.
- Include a control cell where the effect should be absent.
- Measure the boundary. The interesting cell is the one where the behaviour flips.

## Every cell must be executable without you

The executor is a smaller model with no context beyond the cell it is handed. So each cell carries everything it needs.

- `setup` runs once before the repeats. Creating files, directories, symlinks.
- `command` is a single shell command. It runs inside `$CELL_DIR`, a fresh scratch directory the runner creates under `/tmp`.
- `observe` says, in one sentence, what to look for in the output. Prefer something a `grep` would settle: a canary token, an exit code, a byte count. Vague criteria produce vague data.
- `teardown` is optional.

Never point any command at the blog repository. Work happens under `/tmp` only.

## Output

`{{LAB_DIR}}/plan.json`:

```json
{
  "id": "{{LAB_ID}}",
  "pillar": "agent-harness",
  "question": "one sentence",
  "expectation": "what I believe before running anything, and why",
  "environment": { "os": "darwin 25.5.0", "tools": { "codex": "0.147.0" } },
  "dimensions": { "placement": ["root", "nested"], "cwd": ["root", "nested"] },
  "cells": [
    {
      "id": "root-placement-root-cwd",
      "dims": { "placement": "root", "cwd": "root" },
      "setup": "mkdir -p packages/api && printf 'canary ZZROOT7\\n' > AGENTS.md",
      "command": "codex exec 'print the canary token' --model gpt-5.6-luna --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check",
      "observe": "ZZROOT7 이 출력에 있으면 hit, 없으면 miss",
      "repeats": 3,
      "falsifier": false
    }
  ]
}
```

Record real versions in `environment`. Run `--version` yourself to get them rather than writing what you remember.

Do not create the cell directories. Do not run any cell. Do not write `results.md` or `lab.json`. Write the one file and stop.

질문하지 않는다.
