Goal: turn the executed cells into a dataset the publish pipeline can build an argument on. Write `{{LAB_DIR}}/results.md` and `{{LAB_DIR}}/lab.json`, and update `data/labs/index.json`.

Read `{{LAB_DIR}}/plan.json`, `{{LAB_DIR}}/results.jsonl`, and enough of `{{LAB_DIR}}/raw/` to know the numbers are real. Open the raw files. A cell that reports 3 of 3 and whose raw output does not show it is a cell you correct, not a cell you copy.

## results.md

Bullets. One line per cell, plus what the official documentation says about the result.

```
## cells
- root/root — 3/3 hit — exit 0,0,0
- root/nested — 0/3 hit — exit 0,0,0
- nested/root — 0/3 hit — 이 셀이 falsifier 였고 예상대로 miss

## boundary
- 어느 축을 넘을 때 결과가 뒤집혔는지 한 줄

## quotes
- text: "축자 인용"
  url: https://...
  bears_on: 어느 셀과 부딪히거나 설명하는지

## anomalies
- 재시도해도 재현되는데 설명 못 하는 것. 없으면 이 절을 지운다
```

No prose, no argument, no recommendation. The publish pipeline builds the claim later and it can only use what is written here. Numbers you leave out are numbers the article cannot cite.

Quotes are verbatim from official documentation, with the URL. This is where a later post gets its citations, so a quote without a URL is worthless here.

## lab.json

```json
{
  "id": "{{LAB_ID}}",
  "pillar": "from plan.json",
  "question": "from plan.json",
  "expectation": "from plan.json",
  "environment": { "...": "from plan.json" },
  "dimensions": { "...": "from plan.json" },
  "runs": 76,
  "cells": 14,
  "status": "complete",
  "consumed": false,
  "surprised": true,
  "headline": "one line, what the data says"
}
```

`status` is `complete` only when every planned cell has its full repeats and the raw output is on disk. Otherwise `partial`, and name the missing cells in `results.md`. A partial dataset is useful and honest. A partial dataset labelled complete poisons an article three days from now.

`surprised` is whether the result contradicted `expectation`. Answer it against what the plan actually predicted, not against what now seems obvious. The publish pipeline prefers surprising datasets, so an inflated `surprised` steals a slot from a better experiment.

`headline` states what the data says, not what it implies. Implication is the article's job.

Finally append this object to `data/labs/index.json` (a flat array; create it as `[]` if missing). Do not rewrite other entries.

Do not write anything under `src/`. Do not commit. Do not push.

질문하지 않는다.
