# 2026-08-16-15248

20 cells × 6 repeats = 120 runs. raw/ 에 120개 파일 전부 있다.

## cells
- 모든 exit code 는 results.jsonl 기록값이다 — raw/*.txt 에는 exit code 가 남아 있지 않다. 120개 raw 전부 답변 한 줄을 출력했고 빈 출력은 없다.
- ctl-codex-noload — 0/6 hit — exit 0,0,0,0,0,0 — 통제 셀. NOTES.md(49024 B, head 에 ZQNOLOADX) 는 codex 가 로드하지 않는 파일명이고, 6/6 전부 MISS. 모델이 디스크를 읽지 않았다
- codex-default-31k-head — 0/6 exact — exit 0,0,0,0,0,0 — 6/6 전부 `ZQCX31` 출력. 기대 캐너리는 `ZQCX31H` 로 마지막 한 글자가 빠졌다. 18개 raw 파일 어디에도 `ZQCX31H` 는 없다. 문자열 일치로는 miss 지만 head 6자를 재현했으므로 head 는 컨텍스트에 있었다 → anomalies 참조
- codex-default-31k-tail — 6/6 hit — exit 0,0,0,0,0,0 — `ZQCX31T`. AGENTS.md 31023 B, 32768 한도 아래
- codex-default-34k-head — 6/6 hit — exit 0,0,0,0,0,0 — `ZQCX34H`. AGENTS.md 34022 B. 이 셀이 falsifier 였고 head 는 예상대로 살았다 (파일째 드롭 가설이 여기서 죽는다)
- codex-default-34k-tail — 0/6 hit — exit 0,0,0,0,0,0 — 6/6 전부 `MISS`. AGENTS.md 34023 B
- codex-default-48k-head — 6/6 hit — exit 0,0,0,0,0,0 — `ZQCX48H`. AGENTS.md 49022 B
- codex-default-48k-tail — 0/6 hit — exit 0,0,0,0,0,0 — 6/6 전부 `MISS`. AGENTS.md 49023 B
- codex-raised-31k-head — 0/6 exact — exit 0,0,0,0,0,0 — 6/6 전부 `ZQCR31`, 기대 `ZQCR31H`. full token 은 6개 raw 어디에도 없다 → anomalies
- codex-raised-31k-tail — 6/6 hit — exit 0,0,0,0,0,0 — `ZQCR31T`
- codex-raised-34k-head — 0/6 exact — exit 0,0,0,0,0,0 — 6/6 전부 `ZQCR34`, 기대 `ZQCR34H` → anomalies
- codex-raised-34k-tail — 6/6 hit — exit 0,0,0,0,0,0 — `ZQCR34T`. falsifier 였다. project_doc_max_bytes=262144 로 codex-default-34k-tail 의 0/6 이 6/6 이 됐다
- codex-raised-48k-head — 6/6 hit — exit 0,0,0,0,0,0 — `ZQCR48H`
- codex-raised-48k-tail — 6/6 hit — exit 0,0,0,0,0,0 — `ZQCR48T`. falsifier 였다. codex-default-48k-tail 의 0/6 이 6/6 이 됐다
- ctl-claude-noload — 0/6 hit — exit 0,0,0,0,0,0 — 통제 셀. NOTES.md(49024 B) 6/6 전부 MISS
- claude-31k-head — 2/6 hit — exit 0,0,0,0,0,0 — run 3,4 만 `ZQCL31H`, 나머지 4런은 `MISS`. CLAUDE.md 31022 B
- claude-31k-tail — 4/6 hit — exit 0,0,0,0,0,0 — run 2,3,5,6 이 `ZQCL31T`, run 1,4 는 `MISS`. CLAUDE.md 31023 B
- claude-34k-head — 3/6 hit — exit 0,0,0,0,0,0 — run 2,3,4 가 `ZQCL34H`, run 1,5,6 은 `MISS`. CLAUDE.md 34022 B
- claude-34k-tail — 1/6 hit — exit 0,0,0,0,0,0 — run 1 만 `ZQCL34T`, 나머지 5런은 `MISS`. CLAUDE.md 34023 B
- claude-48k-head — 0/6 hit — exit 0,0,0,0,0,0 — 6/6 전부 `MISS`. CLAUDE.md 49022 B
- claude-48k-tail — 2/6 hit — exit 0,0,0,0,0,0 — run 1,4 가 `ZQCL48T`, 나머지 4런은 `MISS`. CLAUDE.md 49023 B
- claude 6개 셀 전부 ~/.claude/CLAUDE.md 10951 B 가 함께 로드된 상태다 (셀 간 상수)

## boundary
- codex-default: pos 축에서 뒤집힌다. 31023 B(한도 아래)는 tail 6/6, 34023·49023 B(한도 위)는 tail 0/6 이고 같은 크기의 head 는 6/6 — 파일이 통째로 빠지는 게 아니라 32768 바이트 경계에서 잘린다.
- codex-default → codex-raised: engine 축에서 뒤집힌다. project_doc_max_bytes 를 32768 → 262144 로 올린 것만으로 34k·48k tail 이 0/6 → 6/6.
- claude: 어느 축에서도 뒤집히지 않는다. 31k~48k, head/tail 6개 셀 전부 0/6~4/6 사이 확률값이고 결정적 경계가 없다. 유일한 단조 신호는 48k head 0/6 이 전 셀 최저라는 것.

## quotes
- text: "Codex skips empty files and stops adding files once the combined size reaches the limit defined by `project_doc_max_bytes` (32 KiB by default)."
  url: https://learn.chatgpt.com/docs/agent-configuration/agents-md
  bears_on: codex-default-34k-head·48k-head 와 부딪힌다. "stops adding files" 를 문자 그대로 읽으면 한도를 넘긴 34022·49022 B AGENTS.md 는 통째로 빠져야 하는데 head 캐너리가 6/6 살았다. 32 KiB 기본값이 명시된 유일한 페이지이기도 하다.
- text: "`project_doc_max_bytes`: how much to read from each `AGENTS.md` file"
  url: https://learn.chatgpt.com/docs/config-file/config-advanced
  bears_on: 데이터와 맞는 쪽. "each file 에서 얼마나 읽는가" 는 파일 단위 스킵이 아니라 바이트 클립이고, codex-default 34k·48k 의 head 6/6 · tail 0/6 이 정확히 그것이다. 같은 제품의 두 페이지가 서로 다른 단위를 말한다.
- text: "Maximum bytes read from `AGENTS.md` when building project instructions"
  url: https://learn.chatgpt.com/docs/config-file/config-reference
  bears_on: 위와 같은 클립 해석. 다만 이 레퍼런스 페이지는 기본값을 적지 않는다 — 32 KiB 숫자는 agents-md 페이지에만 있다.
- text: "Instructions truncated: Raise `project_doc_max_bytes` or split large files across nested directories to keep critical guidance intact."
  url: https://learn.chatgpt.com/docs/agent-configuration/agents-md
  bears_on: codex-raised-34k-tail·48k-tail 를 설명한다. 처방대로 262144 로 올리니 tail 이 0/6 → 6/6 으로 돌아왔다. 이 트러블슈팅 문구는 "truncated" 라고 쓰여 있어 클립 해석 쪽이다.
- text: "To audit which instruction files Codex loaded, opt into a plaintext TUI log with `codex -c log_dir=./.codex-log` and check `./.codex-log/codex-tui.log`, or inspect the most recent `session-*.jsonl` file if you enabled session logging."
  url: https://learn.chatgpt.com/docs/agent-configuration/agents-md
  bears_on: raw/ 120개 파일 전부를 대소문자 무시하고 grep 했을 때 "truncat" 문자열은 0건이다. codex exec 스트림은 잘렸다는 사실을 알리지 않고, 문서가 제시하는 확인 경로도 별도 로그 옵트인이다.
- text: "Codex concatenates files from the root down, joining them with blank lines. Files closer to your current directory override earlier guidance because they appear later in the combined prompt."
  url: https://learn.chatgpt.com/docs/agent-configuration/agents-md
  bears_on: 이 실험이 시험하지 않은 축. 모든 codex 셀은 AGENTS.md 파일 하나뿐이고 ~/.codex/AGENTS.md 는 0 바이트라 건너뛰어진다. "combined size" 해석은 이 데이터로 확인도 반증도 되지 않는다.
- text: "This limit applies only to `MEMORY.md`. CLAUDE.md files are loaded in full regardless of length, though shorter files produce better adherence."
  url: https://code.claude.com/docs/en/memory
  bears_on: claude-48k-head 0/6 과 부딪힌다. 전량 로드가 명시돼 있는데도 49022 B CLAUDE.md 의 첫 줄 캐너리를 6런 중 한 번도 못 짚었다. 로드 실패가 아니라 로드된 것을 못 쓴 것이다.
- text: "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions."
  url: https://code.claude.com/docs/en/memory
  bears_on: claude 6개 셀이 0/6~4/6 사이에서 흔들리는 것과 방향이 맞는다. codex 쪽 12개 셀은 6/6 아니면 0/6 으로 갈리고 중간값이 없다.
- text: "Size: target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence."
  url: https://code.claude.com/docs/en/memory
  bears_on: 가장 작은 claude 셀도 31022 B 로 권장선을 크게 넘는다. 31k head 2/6·tail 4/6 이 이미 완전하지 않다는 것이 이 문장과 같은 방향이다. 다만 문서는 "reduce adherence" 라고만 하고 숫자를 주지 않는다.

## anomalies
- codex 3개 셀에서 6/6 전 런이 캐너리의 마지막 한 글자를 뺀 프리픽스를 출력했다: codex-default-31k-head 는 `ZQCX31`(기대 `ZQCX31H`), codex-raised-31k-head 는 `ZQCR31`(기대 `ZQCR31H`), codex-raised-34k-head 는 `ZQCR34`(기대 `ZQCR34H`). 해당 18개 raw 파일 어디에도 full token 은 없다.
- 같은 형식의 다른 head 셀은 6/6 정확히 나왔다: `ZQCX34H`, `ZQCX48H`, `ZQCR48H`. 크기 축(31k 는 둘 다 실패, 34k 는 default 성공·raised 실패, 48k 는 둘 다 성공)으로도 engine 축으로도 갈리지 않는다.
- head 캐너리 셀 6개 중 3개에서만, 그리고 6런 전부에서 재현된다. tail 캐너리 셀에서는 한 번도 나타나지 않았다(`ZQCX31T`, `ZQCR31T`, `ZQCR34T`, `ZQCR48T` 모두 6/6 완전 일치). 설명 없음.
