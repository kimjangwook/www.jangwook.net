# probe-2026-08-24-claude-md-vs-skill-vs-subagent-same-rule-three-layers-measured-2026

## status
- 계획 6셀 × 3반복 = 18런. 18런 모두 실행됨. 측정값 0건.
- 18런 전부 `parse.py` 7행에서 동일하게 죽음: `AttributeError: 'list' object has no attribute 'get'`. `claude` CLI 는 exit 0 으로 정상 종료했고, out.json 도 만들어졌으나 파서가 최상위를 dict 로 가정했다.
- `RESULT hit_md=... total_in=...` 한 줄은 어느 런에서도 찍히지 않았다. 따라서 hit 플래그도, total_in 도, control 대비 델타도 존재하지 않는다.
- 셀 임시 디렉터리(`/private/var/folders/.../jangwook-lab-cell.*`)는 이미 삭제됨. out.json 원본 회수 불가.
- results.jsonl 의 `"hits":0` 은 측정 결과가 아니라 파서가 죽어 아무 값도 못 낸 상태다. 아래에서는 0/3 hit 가 아니라 0/3 measured 로 기록한다.

## cells
- control-no-rule — 0/3 measured — exit 1,1,1 — raw 3개 모두 parse.py AttributeError, RESULT 줄 없음. 기준선 total_in 미확보 → 나머지 5셀의 델타 전부 계산 불가
- layer-claude-md — 0/3 measured — exit 1,1,1 — 동일 AttributeError. hit_md 판정 없음. 공식 문서는 "CLAUDE.md files are loaded into the context window at the start of every session" 라고 하지만 이 실험은 그것을 확인도 반증도 하지 못했다
- layer-skill-passive — 0/3 measured — exit 1,1,1 — 동일 AttributeError. hit_skl 판정 없음. 공식 문서는 passive 조건에서 본문이 안 실린다고 명시하지만("full skill content only loads when invoked") 실측 대조 없음
- layer-skill-explicit — 0/3 measured — exit 1,1,1 — 이 셀이 falsifier 였다. 예상을 깨지도 확인하지도 못했다. 파서가 죽어 hit_skl 이 관측되지 않았을 뿐, miss 가 관측된 것이 아니다
- layer-subagent — 0/3 measured — exit 1,1,1 — 동일 AttributeError. 이 실험의 핵심 수치인 '스폰당 토큰 델타'는 산출되지 않았다. '약 20,000토큰' 통설은 확인도 반증도 되지 않았다
- all-three-idle — 0/3 measured — exit 1,1,1 — 동일 AttributeError. 세 캐너리 중 어느 것이 이기는지에 대한 관측 없음

## boundary
- 어느 축도 뒤집히지 않았다. layer 축(none/claude-md/skill/subagent/all-three)과 invocation 축(passive/explicit) 모두 6셀 전부가 harness 실패로 동일하게 끝나, 축 경계는 이 데이터로 그을 수 없다.

## quotes
- text: "CLAUDE.md files are loaded into the context window at the start of every session, consuming tokens alongside your conversation."
  url: https://code.claude.com/docs/en/memory
  bears_on: layer-claude-md 및 all-three-idle 이 검증하려던 상주 가정. 문서는 상주를 명시하나 이 실험은 대응 실측을 내지 못했다.
- text: "In a regular session, skill descriptions are loaded into context so Claude knows what's available, but full skill content only loads when invoked."
  url: https://code.claude.com/docs/en/skills
  bears_on: layer-skill-passive(본문 미로드 예상)와 layer-skill-explicit(호출 시 로드 예상) 두 셀의 전제. 두 셀 모두 미측정.
- text: "Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it."
  url: https://code.claude.com/docs/en/skills
  bears_on: skill 층과 claude-md 층의 토큰 비용 차이 — 이 실험이 숫자로 재려던 바로 그 주장.
- text: "Once a skill loads, its content stays in context across turns, so every line is a recurring token cost."
  url: https://code.claude.com/docs/en/skills
  bears_on: layer-skill-explicit 의 '1회 로드 실비용' 델타 정의. 단발 -p 런에서는 turn 누적이 없으므로 이 비용 축은 애초에 관측 불가였다.
- text: "Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions."
  url: https://code.claude.com/docs/en/sub-agents
  bears_on: layer-subagent 의 토큰 델타가 왜 큰지에 대한 문서상 근거.
- text: "CLAUDE.md files: every level of the CLAUDE.md hierarchy the main conversation loads, including ~/.claude/CLAUDE.md, project rules, CLAUDE.local.md, and managed policy files. The built-in Explore and Plan agents skip this."
  url: https://code.claude.com/docs/en/sub-agents
  bears_on: layer-subagent 셀의 설계 결함을 가리킨다 — 서브에이전트가 CLAUDE.md 계층을 그대로 상속하므로, 이 셀에서 hit_md 와 hit_sub 는 서로 독립 신호가 아니다.
- text: (없음) 공식 서브에이전트 문서에는 스폰당 토큰 수를 명시한 문장이 존재하지 않는다. 2026-08-24 시점 https://code.claude.com/docs/en/sub-agents 전문에서 토큰 수치를 담은 문장 0건.
  url: https://code.claude.com/docs/en/sub-agents
  bears_on: '서브에이전트 스폰당 약 20,000토큰' 통설. 공식 출처 없음은 확인되나, 실측 반증은 이 데이터에 없다.
- text: "json: structured JSON with result, session ID, and metadata"
  url: https://code.claude.com/docs/en/headless
  bears_on: 아래 anomalies 항목. 문서의 이 서술과 jq 예시(`jq -r '.result'`)는 최상위가 단일 객체임을 함의하는데, 실측은 배열이었다.

## anomalies
- `claude --output-format json` (claude 2.1.241, macOS darwin 25.5.0) 의 stdout 최상위가 **JSON 배열**이다. 2026-08-24 재현 1회: exit 0, 최상위 `list`, 길이 4, 원소 `type` 이 순서대로 `system` / `assistant` / `rate_limit_event` / `result`. `usage` dict 는 `result` 원소 안에 있고 키는 `input_tokens, cache_creation_input_tokens, cache_read_input_tokens, output_tokens, output_tokens_details, server_tool_use, service_tier, cache_creation, inference_geo, iterations, speed`.
  공식 문서는 `--output-format json` 을 "structured JSON with result, session ID, and metadata" 로 서술하고 `claude -p ... | jq -r '.result'`, `jq -r '.session_id'` 예시를 제시한다 — 둘 다 최상위 단일 객체를 전제한다. 이 문서-실측 불일치가 18런 전부를 죽인 원인이며, 왜 문서와 다른지는 설명하지 못한다.
- 위 불일치를 확인한 재현 런은 계획된 6셀 중 어느 것도 아니다(캐너리 미배치, 파서 미사용). 셀 측정값으로 쓰면 안 된다.
