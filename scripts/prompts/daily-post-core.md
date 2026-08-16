Goal: write only `data/fact-core.md`. First line is `slug: kebab-name` or `SKIP: reason`.

Read, in this order:
1. `docs/persona-kim-jangwook.md`
2. `/Users/jangwook/workspace/claude-controller/.claude/skills/daily-tech-blog/SKILL.md` (여덟 기둥, 레인, 금액·회사명 금지)
3. `scripts/prompts/voice-anti-ai.md`
4. `data/labs/index.json` — 실험 랩이 쌓아 둔 데이터셋 목록

## 오늘 쓸 실험을 고른다

발행은 주 3회, 실험은 매일 쌓인다. **오늘 새로 실험하지 않는다.** `data/labs/` 에 이미 완료된 데이터셋 중에서 고른다.

- `status` 가 `complete` 이고 `consumed` 가 false 인 것만 후보다.
- 여러 개면 **논지가 가장 센 것**을 고른다. 셀 수가 많은 쪽이 아니라, 결과가 사전 예상을 배신한 쪽.
- 여러 데이터셋을 묶어 하나의 논지를 세울 수 있으면 그렇게 한다. `lab:` 에 전부 적는다.
- 후보가 없으면 첫 줄을 `SKIP: no unconsumed lab dataset` 으로 쓰고 끝낸다. 없는 실험을 지어내지 않는다.

고른 랩의 `lab.json`, `results.md`, `raw/` 를 읽는다. 숫자는 전부 거기서 온다. 랩에 없는 수치를 새로 만들지 않는다.

## 논지를 세운다

이 파일의 값은 숫자가 아니라 **숫자가 지지하는 주장**이다. 주장 없이 측정만 넘기면 네 명의 집필자가 각자 실험 노트를 쓴다.

`thesis` 는 반박 가능해야 한다. 유능한 독자가 읽고 "아니, 그건 틀렸다"고 말할 수 있어야 한다. 아무도 반대할 수 없는 문장은 주장이 아니라 관찰이다.

- 관찰: `codex 는 루트에서 실행하면 중첩 AGENTS.md 를 읽지 않는다`
- 주장: `모노레포에서 규약을 디렉터리에 흩뿌리는 설계는 실패한다. 규약의 도달 범위가 도구의 탐색 규칙에 묶여 있고, 그 규칙은 도구마다 다르며 문서가 약속한 것보다 좁다`

`counter` 는 이 주장에 대한 **가장 강한 반대**다. 약한 반대를 세워 쓰러뜨리는 것은 논증이 아니라 연출이다. 반대가 부분적으로 옳으면 옳다고 적는다.

`mechanism` 은 이 파일에서 가장 어려운 칸이고, 관찰과 통찰을 가르는 칸이다. **무엇이 일어났는가가 아니라 무엇이 그것을 일으켰는가**를 적는다.

- 관찰: `codex 는 32,768 바이트에서 지시문을 자른다`
- mechanism: `codex 는 프로젝트 루트에서 cwd 까지 내려오며 각 디렉터리의 파일을 합치고, 합계가 project_doc_max_bytes 에 닿는 순간 멈춘다. 그래서 잘리는 지점은 파일 크기가 아니라 그 파일이 합쳐지는 순서에 달려 있다`

인과를 모르면 모른다고 적는다. `mechanism: unknown — 경계는 재현되나 무엇이 그 경계를 만드는지 확인 못 함` 은 정직한 값이고, 지어낸 인과보다 낫다. 다만 `unknown` 이 세 편 연속 나오면 랩 설계가 현상만 재고 구조를 안 재고 있다는 뜻이다.

`decision` 은 독자가 내일 다르게 할 일이다. 없으면 이 글은 쓸 이유가 없다.

`generalizes` 와 `does-not-generalize` 를 둘 다 적는다. 한 대의 머신, 두 버전, 하루에서 잰 것이 어디까지 말하는지 스스로 긋는다. 안 그으면 아무도 안 그어 준다.

## 형식

불릿만. 산문 금지. 네 명의 집필자는 서로를 못 보고 이 파일만 본다.

```
slug:
pubDate: YYYY-MM-DD
lane: A|B
lab:
  - <data/labs 아래 디렉터리 이름>
hero: TODO
related:
  - slug

thesis: 반박 가능한 한 문장
mechanism: 그 결과를 만드는 인과 사슬. 무엇이 무엇을 일으켜 이 숫자가 나왔나
counter: 가장 강한 반대, 그리고 그것이 어디까지 옳은지
decision: 독자가 내일 다르게 할 일
generalizes: 이 결과가 넘어가는 범위
does-not-generalize: 넘어가지 않는 범위와 그 이유

scene: 한 장면 (명령, 클릭, 에러, 길이가 틀렸던 파일)
surprise: 사전 예상과 실제의 차이. 사전 예상은 lab.json 의 expectation 에서 온다
failed: 하지 않은 것 (로그인, 도구, 측정)
numbers: 값 — 단위 — 어떻게 쟀나
quotes:
  - text: "축자"
    url: https://...
limits: 이것이 증명하지 않는 것
commands: 복사해서 그대로 돌아가는 것
```

`thesis`, `counter`, `decision` 이 비면 이 파일은 미완성이다. 채우지 못하겠으면 데이터가 아직 논지를 못 받치는 것이다. 억지 주장을 세우지 말고 `SKIP: <랩 이름> lacks a defensible thesis` 로 끝낸다.

`src/content/blog/` 아래에는 아무것도 쓰지 않는다.

질문하지 않는다.
