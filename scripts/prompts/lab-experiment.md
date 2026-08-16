Goal: run one deep experiment today and leave a dataset behind. You are not writing an article. Nobody publishes today because of you.

This is the half of the system that has time. The publish pipeline runs three times a week and cannot afford to discover things; you can. Spend the hours.

## What to read first

1. `/Users/jangwook/workspace/claude-controller/.claude/skills/daily-tech-blog/SKILL.md` — 여덟 기둥과 레인 정의
2. `data/labs/index.json` — 이미 돌린 실험. 같은 질문을 다시 묻지 않는다
3. `data/topic-backlog.json` — 있으면 후보

## Pick a question, not a topic

A topic is `AGENTS.md`. A question is `does a nested AGENTS.md reach the model when the tool is launched from the repo root, and does the answer differ between the two CLIs I actually use`.

The question has to be one where **you do not already know the answer**. Write the answer you expect down before you run anything. That expectation is the experiment's spine — if the result matches it, you have a confirmation, and if it does not, you have an article.

Pick from the eight pillars. Count the pillar distribution of the last seven entries in `index.json` and pick from the under-represented side.

## Depth is the point

This is what separates a dataset worth publishing from a demo.

- **A matrix, not a case.** Cross at least two dimensions. Twelve cells is a floor, not a target. One measurement of one thing is a screenshot.
- **Repeat every cell.** `n` of 3 minimum, 6 where the output is non-deterministic. A single run cannot distinguish a behaviour from a coincidence, and with models almost nothing is deterministic.
- **Design one cell to break your own claim.** As the pattern emerges, add the condition that would falsify it. If you cannot think of one, you do not yet understand what you are measuring.
- **Pin the environment.** Versions, OS, model ids, dates, working directory. Record them, do not describe them.
- **Keep the raw output.** Every run's stdout goes under `raw/`. A number nobody can re-derive is a number nobody should trust.
- **Measure the boundary, not just the centre.** Where does the behaviour change? The interesting row is the one where the answer flips.

Take as long as this needs. There is no publish deadline on this job. If the matrix takes four hours, take four hours. What you may not do is stop halfway and leave a dataset that implies more than it measured.

## Where to work

```bash
LAB_ID="$(date +%Y-%m-%d)-<short-kebab-question>"
LAB_DIR="/Users/jangwook/workspace/www.jangwook.net/data/labs/$LAB_ID"
mkdir -p "$LAB_DIR/raw"
```

Do the actual work in a scratch directory under `/tmp`, and copy only the evidence into `$LAB_DIR`. Never run the experiment inside the blog repo. Never touch `src/`.

## What to leave behind

`$LAB_DIR/lab.json`:

```json
{
  "id": "2026-08-17-nested-agents-md-reach",
  "pillar": "agent-harness",
  "question": "the question, one sentence",
  "expectation": "what I believed before running anything",
  "environment": { "os": "...", "tools": { "codex": "0.147.0" }, "date": "2026-08-17" },
  "dimensions": { "placement": ["root", "nested"], "cwd": ["root", "nested"] },
  "runs": 76,
  "cells": 14,
  "status": "complete",
  "consumed": false,
  "surprised": true,
  "headline": "one line, what the data says"
}
```

`status` is `complete` only when every cell has its repeats and the raw output is on disk. If you ran out of time, write `partial` and say which cells are missing. A partial dataset is useful and honest. A partial dataset labelled complete poisons an article three days from now.

`surprised` is whether the result contradicted `expectation`. The publish pipeline prefers the surprising ones, so this field decides what gets written.

`$LAB_DIR/results.md`: the numbers as bullets, one line per cell, plus the quotes from official docs with URLs that bear on the result. No prose, no argument. The publish pipeline builds the argument later, and it can only use what is in here.

`$LAB_DIR/raw/`: every run's output.

Finally, add or update this lab's entry in `data/labs/index.json` (create the file as `[]` if missing). Keep it a flat array of the `lab.json` objects.

## Rules

- Do not write anything under `src/`. Do not commit. Do not push. Do not send Telegram.
- Do not invent a number. If a run failed, the cell is a failure and that is data.
- If the service cannot actually be used today (paid plan, region lock, queue), stop and write `status: blocked` with the reason. Do not simulate the result.

Never ask questions.
