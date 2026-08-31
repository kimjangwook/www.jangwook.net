# probe-2026-08-31-gsc-generative-ai-control-switch-document-reading-2026

question: Search Console의 2026-06-03 신설 생성형 AI 컨트롤은 스위치가 실제로 몇 개의 상태(기본 / AI 기능 제외 / 완전 제외 가설)를 갖고, 각 상태로 토글할 때 어떤 신호가 나가고 사이트 표면에 무엇이 변하는가 — 그리고 그 실물이 support 문서(16908024, "This control doesn't affect AI training" 포함)의 조항들과 어디에서 대응하고 어디에서 어긋나는가?

## cells
- c1-enum-states — hits=0/3 usable=3/3 — exit 0,0,0 — 세 번 모두 실행되어 컨트롤 존재(control_present: true)는 반환했으나 수집된 states 목록은 비어 있었고, 원본 UI 스크립트 경로에서는 curl (22) 404 오류가 나와 docs-curl-grep 대체 방식으로 전환된 결과였다.
- c2-toggle-payload — hits=0/3 usable=3/3 — exit 0,0,0 — 세 번 모두 https://search.google.com/search-console 로 http=200 을 확인했으나 states file missing/empty 로 baseline only 상태가 되어 states: 1, distinct_payloads: 2, one_to_one: false 만 기록되었다.
- c3-doc-gap-table — hits=0/3 usable=0/3 — exit 2,2,2 — 세 번 모두 diff_doc_vs_ui.py 스크립트가 존재하지 않는다(No such file or directory)는 오류로 문서-UI 격차 대응표 생성을 수행하지 못했다.
- c4-site-surface-probe — hits=0/3 usable=3/3 — exit 0,0,0 — 세 번 모두 사이트 표면(BASELINE) 스냅샷을 out/c4/snapshots 아래에 성공적으로 확보했다.
- c5-training-clause — hits=0/3 usable=0/3 — exit 1,1,1 — 세 번 모두 out/c1/states.json 파일 부재로 FileNotFoundError 가 발생하여 학습 무관 조항 검증을 수행하지 못했다.

## boundary
이 실험은 컨트롤의 상태 수를 확정하지 못했다 — c1 의 states 목록이 비어 있었고 c2 는 states file missing/empty 로 baseline only 에 머물렀다. 또한 c3 스크립트 부재로 문서 조항과 UI 의 어긋남 대응표는 전혀 만들어지지 않았고, c5 는 c1 의 states.json 에 의존하다 실패하여 '학습 무관' 조항이 스위치로 검증 가능한지도 판정하지 못했다. toggle 페이로드의 상태별 구분 역시 one_to_one: false 가 관측됐으나 baseline only 조건이라 상태 간 비교로는 해석할 수 없다.

## quotes
- text: {"property": "https://www.jangwook.net", "method": "docs-curl-grep (UI 스크립트 부재 대체)", "states": [], "control_present": true, "notes": [], "matched_sentences": ["Optimizing for generative AI search", "Generative AI fundamentals"
  url: https://www.jangwook.net
  bears_on: c1-enum-states
- text: python3: can't open file '/private/var/folders/c9/dq96xgqs6mgbxl8k80c4blb00000gn/T/probe-c3-doc-gap-table-1r-r6vwijp8/scripts/gsc/diff_doc_vs_ui.py': [Errno 2] No such file or directory
  url: https://raw.githubusercontent.com
  bears_on: c3-doc-gap-table
- text: BASELINE captured: out/c4/snapshots/20260831-091848
  url: https://www.jangwook.net
  bears_on: c4-site-surface-probe
- text: FileNotFoundError: [Errno 2] No such file or directory: 'out/c1/states.json'
  url: https://www.jangwook.net
  bears_on: c5-training-clause

## anomalies
c2 에서 states 는 1 인데 distinct_payloads 는 2 로 관측되어 one_to_one: false 가 나왔으나, states file missing/empty 로 baseline only 조건이라 이 불일치의 의미는 상태 간 비교 없이는 판정할 수 없다. c5 는 c1 의 산출물인 out/c1/states.json 을 기다리다 실패한 하류 의존 오류로, c1 실패가 c5 까지 전파된 구조다.
