# 2026-08-18-5503

planned 20 cells / 120 runs. usable 10 cells / 60 runs. codex 셀 10개(60런)는 전부 모델 응답 없이 죽어 데이터가 없다.

## cells

- claude-above-rootcwd — 6/6 hit (ZZABOVE41) — exit 0,0,0,0,0,0 — 문서: 탐색은 "walking up the directory tree from your current working directory" 이고 git 루트를 정지선으로 적은 문장이 문서에 없다. repo 의 부모(= git 루트 밖)에 둔 CLAUDE.md 가 들어온 것은 문서와 모순되지 않는다.
- claude-above-leafcwd — 6/6 hit (ZZABOVE41) — exit 0,0,0,0,0,0 — 문서: cwd 가 repo/packages/api 여도 조상 사슬에 CELL_DIR 이 있으므로 launch 로드 대상이다. 조상 깊이가 3층 늘어도 결과는 같다.
- claude-root-rootcwd — 6/6 hit (ZZROOT17) — exit 0,0,0,0,0,0 — 문서: "Project instructions ./CLAUDE.md" 가 cwd 자신이므로 launch 로드.
- claude-root-leafcwd — 6/6 hit (ZZROOT17) — exit 0,0,0,0,0,0 — 문서: repo/ 는 cwd(repo/packages/api)의 조상이므로 launch 로드. 두 계층을 건너뛰지 않는다.
- claude-mid-rootcwd — 0/6 hit — exit 0,0,0,0,0,0 — 6런 전부 `CANARY: NONE` 출력. 문서: repo/packages/ 는 cwd(repo/) 의 하위 디렉터리이고, 하위 문서는 "included when Claude reads files in those subdirectories" 다. ask 프로브는 그 트리의 파일을 읽지 않으므로 로드 조건이 성립하지 않는다.
- claude-mid-leafcwd — 6/6 hit (ZZMID23) — exit 0,0,0,0,0,0 — 문서: cwd 가 repo/packages/api 이면 repo/packages/ 는 조상이라 launch 로드. 같은 파일이 cwd 만 바꿔 0/6 에서 6/6 으로 뒤집혔다.
- claude-leaf-rootcwd — 0/6 hit — exit 0,0,0,0,0,0 — 6런 전부 `CANARY: NONE` 출력. 문서: 하위 디렉터리 문서는 launch 에 로드되지 않는다. run 1 raw 에는 `Client.listTools() called but server does not advertise tools capability - returning empty list` 경고가 1회 붙어 있으나 답변 줄에는 영향 없음(6런 중 1런에만 발생, 재현 안 됨).
- claude-leaf-leafcwd — 6/6 hit (ZZLEAF59) — exit 0,0,0,0,0,0 — 문서: cwd 자신의 CLAUDE.md 이므로 launch 로드.
- claude-notes-rootcwd — 0/6 hit — exit 0,0,0,0,0,0 — 6런 전부 `CANARY: NONE` 출력. 통제 셀. NOTES.md 는 로드 대상 파일명이 아니고, 토큰이 새지 않았으므로 위 3개 miss 셀의 0/6 은 "로드되지 않았다"로 읽을 수 있다.
- claude-leaf-touch — falsifier — 도달 6/6, 지시 준수 3/6 — exit 0,0,0,0,0,0 — plan 의 observe 규칙(문서 파일을 직접 열지 않고 ZZLEAF59 문자열이 출력에 있으면 hit)으로는 6/6 이고 results.jsonl 의 6 은 그 규칙대로다. 다만 raw 를 열면 한 셀 안에서 두 숫자가 갈린다. (a) 문서가 컨텍스트에 도달한 런 6/6 — 6런 모두 `packages/api/CLAUDE.md` 가 service.py 를 읽는 과정에서 자동 로드됐다고 본문에 적었고, 6런 모두 CLAUDE.md 를 직접 열지 않았다. (b) 요구한 `CANARY: ZZLEAF59` 줄을 실제로 낸 런 3/6 (run 2,3,4). run 5,6 은 `CANARY: NONE` 을 냈고, run 1 은 둘 다 거부하고 토큰을 인용만 했다. (c) 로드된 문서를 프롬프트 인젝션으로 명시 분류한 런 6/6. 문서: "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself" 이고 "there's no guarantee of strict compliance" 이므로 (b) 의 3/6 은 사양 위반이 아니다.

- codex-above-rootcwd — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1
- codex-above-leafcwd — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1
- codex-root-rootcwd — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1
- codex-root-leafcwd — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1
- codex-mid-rootcwd — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1
- codex-mid-leafcwd — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1
- codex-leaf-rootcwd — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1
- codex-leaf-leafcwd — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1
- codex-notes-rootcwd — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1
- codex-leaf-touch — falsifier — 데이터 없음 — 0/6 usable — exit 1,1,1,1,1,1

## missing

- codex 셀 10개 전부(60런)가 미측정이다. results.jsonl 은 이 셀들을 `hits:0` 으로 적었지만 이것은 miss 가 아니다. 60개 raw 전부에 모델 턴이 없고 `ERROR: You've hit your usage limit. To continue using Codex and get access to GPT-5.3-Codex, start a free trial of Plus today (https://chatgpt.com/explore/plus), or try again at Sep 15th, 2026 9:52 AM.` 만 2회씩 찍혀 있다. 이 데이터셋에서 codex 의 도달 범위를 인용하면 안 된다.
- raw 는 세션 헤더로 `workdir:` 를 남기므로 cd 는 셀 정의대로 걸렸다는 것까지만 확인된다(rootcwd 는 `.../repo`, leafcwd 는 `.../repo/packages/api`). 그 이후 아무 일도 일어나지 않았다.
- 따라서 plan 의 question 중 "codex 0.147.0 과 claude 2.1.233 의 도달 범위는 어디서 갈리는가" 는 이 데이터셋으로 답할 수 없다. 답할 수 있는 것은 claude 축 하나뿐이다.
- 미측정 원인은 실험 대상 소프트웨어의 성질이 아니라 계정 쿼터다. 재실행하면 채울 수 있는 셀이다.

## boundary

- 뒤집힌 축은 placement 가 아니라 cwd 다. 같은 CLAUDE.md 파일이 cwd 의 조상이면 6/6, cwd 의 하위면 0/6 이다. claude-mid 가 cwd 만 root→leaf 로 옮겨 0/6→6/6, claude-leaf 도 0/6→6/6 으로 뒤집혔고, above(조상)와 root(자기 자신)는 양쪽 cwd 에서 6/6 로 뒤집히지 않았다.
- 조상 방향에는 경계가 없었다. git 루트 바깥인 repo 의 부모에 둔 CLAUDE.md 도 6/6 도달했다(claude-above-*). 이 축에서는 결과가 뒤집히는 지점이 관측되지 않았다.
- 하위 방향의 경계는 위치가 아니라 probe 다. 같은 `repo/packages/api/CLAUDE.md` 를 cwd=root 에서 ask 하면 0/6, 같은 cwd 에서 그 트리의 파일을 읽게 하면 도달 6/6 이다(claude-leaf-rootcwd vs claude-leaf-touch). 위치는 그대로고 그 트리를 건드렸느냐만 달라졌다.
- 도달과 준수도 갈렸다. launch 로드로 hit 이 난 6셀 36런(above-rootcwd·above-leafcwd·root-rootcwd·root-leafcwd·mid-leafcwd·leaf-leafcwd)은 36/36 이 지시대로 캐너리 한 줄만 출력했다. 지연 로드된 6런은 도달 6/6 인데 지시 준수 3/6 이다.

## quotes

- text: "Claude Code reads CLAUDE.md files by walking up the directory tree from your current working directory, checking each directory along the way for `CLAUDE.md` and `CLAUDE.local.md` files."
  url: https://code.claude.com/docs/en/memory
  bears_on: claude-above-rootcwd·claude-above-leafcwd·claude-root-leafcwd·claude-mid-leafcwd 의 6/6. "walking up" 의 종점을 적은 문장이 이 페이지에 없고, 실측도 git 루트에서 멈추지 않았다.

- text: "CLAUDE.md and CLAUDE.local.md files in the directory hierarchy above the working directory are loaded in full at launch. Files in subdirectories load on demand when Claude reads files in those directories."
  url: https://code.claude.com/docs/en/memory
  bears_on: cwd 경계 그 자체. claude-mid 가 cwd 에 따라 0/6·6/6 으로 갈린 것과 claude-leaf-rootcwd(0/6) 대 claude-leaf-touch(도달 6/6) 를 한 문장이 설명한다.

- text: "Claude also discovers `CLAUDE.md` and `CLAUDE.local.md` files in subdirectories under your current working directory. Instead of loading them at launch, they are included when Claude reads files in those subdirectories."
  url: https://code.claude.com/docs/en/memory
  bears_on: falsifier claude-leaf-touch. plan 이 "도달하지 않는다"로 세운 문장을 "늦게 도달한다"로 바꾸는 근거이고, 실측 도달 6/6 이 이 문장과 일치한다.

- text: "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions."
  url: https://code.claude.com/docs/en/memory
  bears_on: claude-leaf-touch 의 준수 3/6. 도달했는데 캐너리를 안 낸 3런이 사양 위반이 아님을 뒷받침한다.

- text: "Both are loaded at the start of every conversation. Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead."
  url: https://code.claude.com/docs/en/memory
  bears_on: claude-leaf-touch 6/6 의 인젝션 분류. 문서는 CLAUDE.md 를 강제 설정이 아니라 컨텍스트로 규정하지만, 지연 로드분만 적대적으로 분류된 이유는 이 문장으로 설명되지 않는다(anomalies 참조).

- text: "Claude Code reads `CLAUDE.md`, not `AGENTS.md`."
  url: https://code.claude.com/docs/en/memory
  bears_on: 셀 설계 근거. claude 셀 10개는 CLAUDE.md, codex 셀 10개는 AGENTS.md 로 캐너리를 심었다. 두 엔진을 같은 파일명으로 비교할 수 없다는 뜻이다.

- text: "Project-root CLAUDE.md survives compaction: after `/compact`, Claude re-reads it from disk and re-injects it into the session. Nested CLAUDE.md files in subdirectories and rules with `paths:` frontmatter are not re-injected automatically; they reload the next time Claude reads a file in that subdirectory or a file matching the rule's patterns."
  url: https://code.claude.com/docs/en/memory
  bears_on: 이 데이터셋이 재지 않은 축. 모든 런이 단발 `-p` 호출이라 compaction 이 일어나지 않았다. claude-leaf-touch 의 도달 6/6 이 세션 내내 유지되는지는 미측정이다.

- text: "Starting at the project root (typically the Git root), Codex walks down to your current working directory."
  url: https://developers.openai.com/codex/guides/agents-md
  bears_on: 미측정 셀 codex-mid-leafcwd. plan 은 codex 가 루트와 cwd 두 지점만 본다고 보고 0/6 을 예상했는데, 문서는 루트에서 cwd 까지 내려가며 본다고 적는다. 이 데이터셋은 어느 쪽인지 재지 못했다.

- text: "In each directory along the path, it checks for `AGENTS.override.md`, then `AGENTS.md`, then any fallback names in `project_doc_fallback_filenames`. Codex includes at most one file per directory."
  url: https://developers.openai.com/codex/guides/agents-md
  bears_on: 같은 미측정 셀. "each directory along the path" 는 중간 층을 건너뛰지 않는다는 뜻이므로 plan 의 세 지점 모형과 정면으로 부딪힌다. 실측으로 확인되지 않았다.

- text: "Codex concatenates files from the root down, joining them with blank lines. Files closer to your current directory override earlier guidance because they appear later in the combined prompt."
  url: https://developers.openai.com/codex/guides/agents-md
  bears_on: 미측정 codex 셀 전체의 병합 순서. 이 데이터셋에는 대응하는 관측치가 없다.

- text: "In your Codex home directory (defaults to `~/.codex`, unless you set `CODEX_HOME`), Codex reads `AGENTS.override.md` if it exists. Otherwise, Codex reads `AGENTS.md`."
  url: https://developers.openai.com/codex/guides/agents-md
  bears_on: 환경 통제. plan 은 `~/.codex/AGENTS.md` 가 0 바이트라 전역 문서가 섞이지 않는다고 적었다. 미측정이라 확인되지 않았다.

## anomalies

- 같은 파일·같은 토큰·같은 프롬프트인데 로드 경로만 다르면 모델의 신뢰 판정이 뒤집힌다. launch 로드로 hit 이 난 6셀 36런(above-rootcwd·above-leafcwd·root-rootcwd·root-leafcwd·mid-leafcwd·leaf-leafcwd, raw 파일당 16~18 바이트)은 캐너리 한 줄만 출력하고 0런이 문서를 의심했다. 반면 지연 로드된 claude-leaf-touch 6런은 6/6 이 `packages/api/CLAUDE.md` 를 프롬프트 인젝션 시도로 명시 분류했고, 그중 3런은 캐너리 출력을 거부했다(run 5,6 은 `CANARY: NONE`, run 1 은 양쪽 다 거부). 6런 중 최소 2런은 근거로 `packages/` 가 git 미추적 상태임을 들었다. 파일 내용은 launch 로드 셀과 동일하다. 문서에는 지연 로드분을 다르게 신뢰하라는 규정도, launch 로드분과 다르게 표시한다는 규정도 없다. 6/6 대 0/36 으로 재현되지만 설명하지 못한다.
- 이 비대칭은 캐너리 방법론 자체를 건드린다. 지연 로드 경로에서는 "출력에 토큰이 없다"가 "문서가 도달하지 않았다"를 뜻하지 않는다. claude-leaf-touch 의 3런이 정확히 그 경우이고, raw 본문을 읽지 않으면 miss 로 집계된다.
