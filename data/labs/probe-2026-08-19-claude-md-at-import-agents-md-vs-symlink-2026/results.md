# probe-2026-08-19-claude-md-at-import-agents-md-vs-symlink-2026

planned 6 cells / 18 runs. usable 6 cells / 18 runs. 미측정 셀 없음.

18개 raw 전부 `type: result`, `subtype: success`, `is_error: false`, `num_turns: 1` 이다. 18런 전부 `tools: []`, `mcp_servers: []`, `slash_commands: 0`, `skills: 0`, `model: claude-sonnet-5`, `claude_code_version: 2.1.233` 로 동일하다(각 raw 의 `system/init` 이벤트에서 확인). raw 파일에는 exit code 필드가 없다 — results.jsonl 의 `exit 0` 을 raw 에서 교차 확인할 수 있는 것은 result 이벤트의 `subtype: success` / `is_error: false` 까지다.

total_input = `usage.input_tokens + usage.cache_creation_input_tokens + usage.cache_read_input_tokens` (plan 의 observe 규칙). results.jsonl 에는 total_input 이 기록돼 있지 않다 — 아래 값은 전부 raw 에서 다시 계산했다.

캐너리 문서는 6셀 모두 9,674 바이트다(plan 의 setup 명령을 재실행해 확인). at-import 의 CLAUDE.md 는 49 바이트, fenced-import 의 CLAUDE.md 는 65 바이트다.

## cells

- bare-agents — falsifier — ZZBARE31 0/3 hit — exit 0,0,0 — total_input 14940, 14940, 14940 — 3런 전부 `CANARY: NONE`. 통제 셀 notes-control 과 −2 토큰 차이다. 9,674 바이트 AGENTS.md 가 total_input 에 전혀 청구되지 않았으므로 이 miss 는 '로드됐는데 모델이 못 꺼냄'이 아니라 '로드 안 됨'이다. 문서: "Claude Code reads `CLAUDE.md`, not `AGENTS.md`." — 실측이 이 문장과 일치한다. run 1 의 raw 에는 결과 JSON 뒤에 stderr 한 줄 `SessionEnd hook [node "${CLAUDE_PLUGIN_ROOT}/scripts/session-lifecycle-hook.mjs" SessionEnd] failed: Hook cancelled` 이 붙어 있다(18런 중 1런, 결과 줄 뒤라 usage·result 값에는 영향 없음).
- at-import — ZZATIM47 3/3 hit, ZZWRAP99 3/3 hit — exit 0,0,0 — total_input 17978, 17869, 17978 — 3런 모두 출력이 정확히 `CANARY: ZZWRAP99 ZZATIM47`. 'CLAUDE.md 는 들어왔지만 @import 가 안 풀린' run 은 0회다. 문서: "CLAUDE.md files can import additional files using `@path/to/import` syntax. Imported files are expanded and loaded into context at launch alongside the CLAUDE.md that references them." — 실측이 이 문장과 일치한다.
- symlink — ZZSYML63 3/3 hit — exit 0,0,0 — total_input 17856, 17856, 17747 — 3런 모두 출력이 정확히 `CANARY: ZZSYML63`. macOS 26.5.2 에서 `ln -s AGENTS.md repo/CLAUDE.md` 는 3회 반복 모두 성공했고 권한 실패 run 은 0회다. 문서: "A symlink also works if you don't need to add Claude-specific content:" — 실측이 이 문장과 일치한다. 셀 디렉터리가 정리돼 `ls -l repo/CLAUDE.md` 는 디스크에 남아 있지 않다 — 링크 성립은 hit 과 +2,914 토큰으로만 확인된다.
- copy — ZZCOPY29 3/3 hit — exit 0,0,0 — total_input 17862, 17753, 17862 — 3런 모두 출력이 정확히 `CANARY: ZZCOPY29`. 이 셀이 '문서 한 벌이 들어갔을 때'의 토큰 기준선이다. 문서: 복사도 공식 경로다 — "You can also run `/import` to bring a supported coding agent's configuration into Claude Code, which appends a one-time copy of instruction files such as `AGENTS.md` to the matching `CLAUDE.md` and carries over MCP servers, commands, subagents, and skills."
- fenced-import — ZZWRAP99 3/3 hit, ZZFENC85 0/3 hit — exit 0,0,0 — total_input 15081, 15081, 15081 — 3런 모두 출력이 정확히 `CANARY: ZZWRAP99` 이고 ZZFENC85 는 한 번도 나오지 않았다. results.jsonl 의 `"hits":3` 은 plan 의 판정 규칙(ZZWRAP99 기준)대로지만, 그 숫자만 보면 AGENTS.md 가 로드된 것처럼 읽힌다 — AGENTS.md 는 로드되지 않았다. total_input 15081 은 copy 수준(17862)이 아니라 bare-agents 수준(14940)에 붙어 있고 차이는 +141 로, 65 바이트짜리 CLAUDE.md 자신의 몫이다. 즉 코드펜스 안의 `@AGENTS.md` 는 캐너리만 안 나온 게 아니라 프롬프트에 들어가지도 않았다. 문서: "Import parsing skips Markdown code spans and fenced code blocks." — 실측이 이 문장과 일치하고, 이 문장이 렌더링이 아니라 로딩에 대한 진술임을 토큰이 확정한다.
- notes-control — ZZNOTE11 0/3 hit — exit 0,0,0 — total_input 14942, 14942, 14833 — 3런 전부 `CANARY: NONE`. 통제 셀. NOTES.md 는 어느 로더의 대상 파일명도 아니고 `--tools ""` 로 도구가 하나도 없어 모델이 파일을 열 수 없다. 토큰이 새지 않았으므로 bare-agents 와 fenced-import 의 miss 를 '로드되지 않았다'로 읽을 수 있다. 이 셀이 캐너리 문서 없는 토큰 기준선이다.

## tokens

셀 안의 3런은 `{A, A, A−109}` 또는 `{A, A, A}` 두 모양뿐이다(anomalies 참조). 아래 기준값 A 는 셀별 최빈값이고, 셀 간 차이는 A 끼리 비교해도 `A−109` 끼리 비교해도 같은 값이 나온다.

- notes-control(캐너리 문서 없음) A=14942 — 기준선 B
- bare-agents(AGENTS.md 배선 없음) A=14940 — B−2
- fenced-import(코드펜스 안 @import) A=15081 — B+139
- symlink A=17856 — B+2914
- copy A=17862 — B+2920
- at-import A=17978 — B+3036

쌍 비교(두 상태 모두에서 동일한 값):
- copy − symlink = 6 토큰
- at-import − copy = 116 토큰
- at-import − symlink = 122 토큰
- fenced-import − bare-agents = 141 토큰
- copy − notes-control = 2920 토큰 = 9,674 바이트 문서 한 벌의 청구액(3.31 바이트/토큰)

at-import 는 copy 보다 116 토큰 많다. 문서 한 벌(약 2,915 토큰)만큼 많지 않다 — @import 는 이중 계상하지 않는다. 116 은 49 바이트 래퍼 CLAUDE.md 와 그 메모리 파일 프레이밍의 몫이고, 65 바이트 래퍼를 쓴 fenced-import 의 +141 과 같은 자릿수다.

## boundary

- 뒤집힌 축은 `claude_md` 다. `canary_doc` 는 뒤집지 못한다 — AGENTS.md 를 놓아둔 것만으로는 bare-agents 0/3 이고 total_input 도 NOTES.md 통제 셀과 −2 토큰 차이다.
- 배선 세 값(at-import·symlink·copy)은 서로 뒤집히지 않았다. 셋 다 3/3 hit 이고 total_input 은 17,747〜17,978 범위에 122 토큰 폭으로 모여 있다.
- 가장 좁은 경계는 fenced-import 와 at-import 사이다. 두 셀의 CLAUDE.md 는 같은 `@AGENTS.md` 한 줄을 담고 차이는 그 줄이 ```` ```markdown ```` 펜스 안에 있느냐뿐이다. 밖이면 ZZATIM47 3/3 에 +2,920 토큰, 안이면 ZZFENC85 0/3 에 +0 토큰이다. 마크다운 문자 여섯 개가 문서 한 벌의 로드 여부를 가른다.

## quotes

- text: "Claude Code reads `CLAUDE.md`, not `AGENTS.md`."
  url: https://code.claude.com/docs/en/memory
  bears_on: bare-agents 0/3 과 total_input B−2. 문서와 실측이 일치한다. plan 이 (a) 로 적은 반증(AGENTS.md 를 claude 가 스스로 읽는다)은 일어나지 않았다.

- text: "If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them. You can also add Claude-specific instructions below the import. Claude loads the imported file at session start, then appends the rest:"
  url: https://code.claude.com/docs/en/memory
  bears_on: at-import 셀 설계 그대로다. 실측에서 임포트된 ZZATIM47 과 래퍼의 ZZWRAP99 가 3/3 으로 함께 나왔다.

- text: "A symlink also works if you don't need to add Claude-specific content:"
  url: https://code.claude.com/docs/en/memory
  bears_on: symlink 3/3, total_input B+2914. 공식 문서가 나란히 적은 두 경로가 macOS 에서 실측으로 동등하다(symlink 와 at-import 차이 122 토큰, 히트율 동일).

- text: "CLAUDE.md files can import additional files using `@path/to/import` syntax. Imported files are expanded and loaded into context at launch alongside the CLAUDE.md that references them."
  url: https://code.claude.com/docs/en/memory
  bears_on: at-import 의 +3,036 토큰. "expanded and loaded ... at launch" 가 실측으로 문서 한 벌 분량 청구로 나타난다.

- text: "Import parsing skips Markdown code spans and fenced code blocks. To mention a path in your CLAUDE.md without importing it, wrap it in backticks: writing `@README` keeps the text literal, while @README outside backticks imports the file."
  url: https://code.claude.com/docs/en/memory
  bears_on: fenced-import 의 ZZFENC85 0/3 과 total_input 15081. plan 이 (b) 로 적은 함정 시나리오(펜스 안 경로가 조용히 컨텍스트로 들어온다)는 일어나지 않았다 — 토큰이 안 올랐다.

- text: "Splitting into `@path` imports helps organization but doesn't reduce context, since imported files load at launch."
  url: https://code.claude.com/docs/en/memory
  bears_on: at-import 와 copy 의 total_input 차이 116 토큰. 문서가 "줄지 않는다"만 적고 "늘지도 않는다"는 적지 않는데, 실측은 늘지도 않는 쪽이다(문서 한 벌 2,920 이 아니라 116).

- text: "You can also run `/import` to bring a supported coding agent's configuration into Claude Code, which appends a one-time copy of instruction files such as `AGENTS.md` to the matching `CLAUDE.md` and carries over MCP servers, commands, subagents, and skills. Requires Claude Code v2.1.213 or later."
  url: https://code.claude.com/docs/en/memory
  bears_on: copy 셀. 복사가 임시방편이 아니라 CLI 가 제공하는 세 번째 경로라는 근거이고, 실측 total_input 은 symlink 와 6 토큰 차이다.

- text: "On Windows, creating a symlink requires Administrator privileges or Developer Mode, so use the `@AGENTS.md` import instead."
  url: https://code.claude.com/docs/en/memory
  bears_on: 이 데이터셋이 재지 않은 축. 18런 전부 macOS 26.5.2 다. symlink 셀의 3/3 은 Windows 로 옮겨 적을 수 없다.

- text: "Imported files can recursively import other files, with a maximum depth of four hops."
  url: https://code.claude.com/docs/en/memory
  bears_on: 미측정. at-import 셀은 1홉만 걸었다. 4홉 한도와 5홉째의 동작은 이 데이터셋에 관측치가 없다.

- text: "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions."
  url: https://code.claude.com/docs/en/memory
  bears_on: 배선 3셀 9런의 지시 준수 9/9. 문서가 보장하지 않는다고 적은 준수가 이 크기(9,674 바이트)에서는 흔들리지 않았다.

- text: "CLAUDE.md files are loaded into the context window at the start of every session, consuming tokens alongside your conversation."
  url: https://code.claude.com/docs/en/memory
  bears_on: 이 실험의 측정 방법 자체. total_input 으로 '로드 안 됨'과 '로드됐는데 모델이 무시함'을 가르는 근거가 이 문장이다.

- text: "AGENTS.md complements this by containing the extra, sometimes detailed context coding agents need."
  url: https://agents.md/
  bears_on: 배선 문제가 존재하는 이유. AGENTS.md 규격 쪽에는 CLAUDE.md 로 연결하라는 규정이 없고, 연결은 Claude Code 문서가 담당한다.

## anomalies

- 같은 셀·같은 CELL_DIR·같은 프롬프트인 3런 중 정확히 1런만 total_input 이 **정확히 109 토큰** 낮다. 6셀 중 4셀에서 나타났고 값은 매번 109 다: notes-control(run 3: 14942→14833), at-import(run 2: 17978→17869), symlink(run 3: 17856→17747), copy(run 2: 17862→17753). bare-agents(14940 ×3)와 fenced-import(15081 ×3)에는 없다. 어느 run 번호에서 터지는지는 셀마다 다르다.
- raw 에 이 차이를 설명하는 필드가 없다. 네 셀 모두 이벤트 구성이 `system/init, assistant, rate_limit_event, result/success` 로 동일하고, init 페이로드를 diff 하면 `cwd` 는 3런이 같고 `session_id`·`uuid`·`messaging_socket_path` 만 다르다(경로 길이는 86자로 전부 동일). 재실행으로 재현 여부를 확인하지는 않았다 — 관측된 것은 4셀에서 동일 크기로 반복됐다는 사실까지다.
- 결론에 영향은 없다. 셀 간 차이가 두 상태(A 끼리, A−109 끼리)에서 동일한 값으로 나오므로 +2914 / +2920 / +3036 / +139 는 이 흔들림과 독립이다. 다만 copy−symlink 의 6 토큰 차이는 이 흔들림보다 작아서 두 셀은 이 해상도에서 구별되지 않는다.
- 후보 원인 하나는 검증하지 않았다: plan 이 적은 대로 `~/.claude/settings.json` 에 hooks 가 걸려 있고 bare-agents run 1 에 SessionEnd 훅 실패 stderr 가 한 줄 남아 있어 런마다 훅 주입량이 흔들릴 여지가 있다. raw 에 훅 출력이 기록되지 않아 확인 불가다.
