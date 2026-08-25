## cells
- schema-surface-classify — 3/3 hit — exit 0,0,0 — 계획이 받은 세 스키마(2025-06-18 108,234B / 2025-11-25 174,323B / draft 181,474B)에서 dpop=0, progressive=0, webhook=0, ID-JAG=0, "token exchange"=0 (세 버전 전부). nextCursor 는 2025-06-18 부터 5회, 2025-11-25 6회, draft 5회. structuredContent 2/3/3. "audience" 1/1/1. tasks/ 는 2025-06-18=0, 2025-11-25=25, draft=0. CreateTaskResult 는 2025-06-18=0, 2025-11-25=6, draft=0. subscriptions/listen 은 2025-06-18=0, 2025-11-25=0, draft=17.
- schema-surface-classify (계획 축 보정, 사후 1회 실측) — 계획의 release-schema 축이 현행 릴리스 2026-07-28 을 빠뜨렸다. 사후에 받아보니 HTTP 200 / 181,474B 이고 sha256 이 draft 와 완전 동일(ef70b61f99b6d2e5e3b46863822eab08dff6a45bedc7a08914e0e5b133f40203). 즉 위 표의 "draft" 열은 현행 릴리스와 같은 파일이다. 2026-07-28 항목별: dpop=0, progressive=0, webhook=0, ID-JAG=0, subscriptions/listen=17, nextCursor=5, structuredContent=3, tasks/=0, CreateTaskResult=0.
- 위 보정에서 나오는 두 가지 정정 — (1) subscriptions/listen 은 "초안만"이 아니라 현행 릴리스 스키마에 있다. (2) tasks/ 와 CreateTaskResult 는 2025-11-25 에 25회·6회 있었으나 현행 2026-07-28 에서는 0회다. 코어 스키마에서 빠졌고 로드맵은 이를 확장(/extensions/tasks/overview, SEP-2663)으로 가리킨다.
- docs-corpus-surface-classify — 3/3 hit — exit 0,0,0 — llms-full.txt 2,369,619B. TERM=dpop PROPOSAL-ONLY spec=0 charter=3 roadmap=2 total=5 / progressive-discovery PROPOSAL-ONLY spec=0 charter=0 roadmap=2 docs=12 total=14 / subscriptions-listen IN-SPEC spec=54 roadmap=1 docs=10 other=12 total=77 / webhook PROPOSAL-ONLY spec=0 charter=2 roadmap=1 other=2 total=5 / tasks IN-SPEC spec=3 docs=7 other=166 total=176 / id-jag PROPOSAL-ONLY spec=0 charter=7 roadmap=1 other=16 total=24 / workload-identity-federation PROPOSAL-ONLY spec=0 charter=3 roadmap=1 total=4 / token-exchange PROPOSAL-ONLY spec=0 charter=1 roadmap=3 total=4 / structured-content IN-SPEC spec=16 roadmap=1 other=35 total=52 / primitive-annotations IN-SPEC spec=113 charter=44 roadmap=4 docs=1 other=7 total=169 / next-cursor IN-SPEC spec=35 other=6 total=41.
- docs-corpus-surface-classify (판정 신뢰도 주석) — primitive-annotations 는 정규식이 `\bannotations\b` 라 스키마 필드가 아닌 일반 단어까지 센다. 이 항목의 169는 다른 항목과 같은 무게로 읽으면 안 된다. tasks 는 spec=3 인데 other=166 이라 IN-SPEC 판정이 3회 언급 위에 서 있다.
- 두 셀의 판정이 어긋난 항목은 subscriptions/listen 하나뿐이다(문서=IN-SPEC spec=54 vs 스키마 셀=draft only). 위의 2026-07-28 보정으로 이 불일치는 해소된다 — 문서 쪽이 맞고, 스키마 셀의 버전 목록이 낡았던 것이다.
- claude-catalog-200-page20 — 3/3 hit — exit 0,0,0 — 3회 모두 LIST_CALLS=10, CURSORS=none,20,40,60,80,100,120,140,160,180, LIST_BYTES=62708, CANARY=1. 이 셀이 falsifier 였고 반증되지 않았다(LIST_CALLS=1 이 아니었다). claude 2.1.241 은 연결 시점에 nextCursor 를 끝까지 따라가 200개 카탈로그 전량을 선인출한다.
- codex-catalog-200-page20 — 0/3 hit — exit 1,1,1 — 3회 모두 Codex 사용량 한도로 모델 호출 전에 종료. raw 꼬리: "ERROR: You've hit your usage limit. To continue using Codex and get access to GPT-5.3-Codex, start a free trial of Plus today (https://chatgpt.com/explore/plus), or try again at Sep 15th, 2026 9:52 AM." 로그에 남은 LIST_CALLS=1 / CURSORS=none / LIST_BYTES=6253 은 MCP 초기화 직후의 첫 페이지 요청 하나이며, 세션이 그 뒤로 진행되지 않았으므로 선인출 여부의 측정치가 아니다. CANARY=0. codex 0.147.0 의 카탈로그 인출 행동은 이번 데이터로 판정 불가.
- claude-catalog-20-singlepage — 3/3 hit — exit 0,0,0 — 3회 모두 LIST_CALLS=1, CURSORS=none, LIST_BYTES=6235, CANARY=1. 20개는 nextCursor 가 발행되지 않는 단일 페이지이므로 기준선. 200개 셀 62708 ÷ 20개 셀 6235 = 10.06배. 툴 수 10배에 카탈로그 바이트도 10.06배로, 비용이 툴 개수에 선형이다.
- control-no-mcp-server — 3/3 hit — exit 0,0,0 — 3회 모두 LOG_LINES=0, CANARY=1. 다른 셀의 로그가 새어들지 않았으므로 위 바이트·호출수는 각 셀 고유값이다.
- 바이트 비교 주석 — codex 셀 로그의 첫 페이지 6253B 와 claude 20개 셀의 6235B 는 18바이트 다르다. 첫 20개 툴은 동일하고, 200개 서버만 `,"nextCursor":"20"` 을 덧붙인다(18바이트). 3/3 재현. 20개 셀의 6235B 를 200개 셀의 첫 페이지 바이트로 그대로 쓰면 이만큼 어긋난다.

## boundary
- 결과가 뒤집히는 축은 client 가 아니라 surface 다. release-schema 축에서 dpop·progressive·webhook·ID-JAG 는 네 버전(2025-06-18, 2025-11-25, 2026-07-28, draft) 전부 0인데, docs-corpus 축의 roadmap·charter 버킷에서는 같은 항목이 4~24회 등장한다. live-client 축에서는 catalog_size 20→200 을 넘을 때 LIST_CALLS 가 1→10, LIST_BYTES 가 6235→62708 로 뒤집히지만 클라이언트의 전량 선인출 정책 자체는 뒤집히지 않는다.

## quotes
- text: "**Progressive discovery**: Core Primitives WG. Clients learn a server's tools and resources as they need them instead of ingesting the full catalog up front, with a defined interaction with the caching work under [HTTP-Native Transport Unification and Hardening](#2-http-native-transport-unification-and-hardening)."
  url: https://modelcontextprotocol.io/development/roadmap
  bears_on: claude-catalog-200-page20. 로드맵이 전제한 "ingesting the full catalog up front" 가 claude 2.1.241 에서 3/3 재현됐다(LIST_CALLS=10, 62708B). 로드맵의 문제 진술 쪽은 흔들리지 않았다.
- text: "**DPoP**: Agent Identity WG (forming during this roadmap period). Finalize the specification for Demonstrating Proof of Possession (DPoP) and focus on getting widespread adoption."
  url: https://modelcontextprotocol.io/development/roadmap
  bears_on: schema-surface-classify. "Finalize the specification" 이라는 문구와 스키마 4개 버전 전부 dpop=0 이 맞물린다. docs 코퍼스에서도 spec=0, charter=3, roadmap=2 뿐이다.
- text: "**Agent identity and delegation**: Agent Identity WG. We want an opinionated way for MCP servers to be reached by agents through their own identity or a user-delegated identity. The work will focus on Workload Identity Federation ([SEP-1933](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/1933)), the Identity Assertion JWT Authorization Grant (ID-JAG)"
  url: https://modelcontextprotocol.io/development/roadmap
  bears_on: schema-surface-classify / docs-corpus-surface-classify. ID-JAG 는 스키마 4버전 전부 0, docs 는 charter=7 roadmap=1 other=16 spec=0. SEP 링크가 PR 번호로 걸려 있다는 점이 문서 표면의 위치를 그대로 보여준다.
- text: "**Server-initiated events**: [Triggers & Events WG](/community/working-groups/triggers-events). Channels and subscriptions for push delivery, including webhooks. As we take on asynchronous workloads through Tasks and other events, we need extensions that let servers tell clients when work has finished, without relying purely on expensive client-side polling."
  url: https://modelcontextprotocol.io/development/roadmap
  bears_on: schema-surface-classify. webhook 은 스키마 4버전 전부 0이고 docs 는 charter=2 roadmap=1 other=2 로 총 5회뿐이다.
- text: "Beyond these, we expect continued work on Tasks ([SEP-2663](/seps/2663-tasks-extension)) toward eventual inclusion of the extension in the core protocol."
  url: https://modelcontextprotocol.io/development/roadmap
  bears_on: schema-surface-classify 보정. "eventual inclusion of the extension in the core protocol" 은 tasks/ 가 2025-11-25 에 25회 있다가 2026-07-28 에 0회가 된 관측과 정확히 부합한다. 코어에 한 번 들어간 것이 아니라 확장으로 나가 있고 재편입이 목표다.
- text: "Agentic workloads need [messaging patterns](/specification/2026-07-28/basic/patterns) beyond request and response: work that runs for minutes, servers that push, results that stream, and a way to steer work mid-flight."
  url: https://modelcontextprotocol.io/development/roadmap
  bears_on: 로드맵이 patterns 를 릴리스 스펙 경로(/specification/2026-07-28/)로 링크한다는 사실이, subscriptions/listen 이 현행 릴리스 스키마에 17회 있다는 관측과 맞는다.
- text: "Once the tool definitions take up a significant part of the available context window, clients should switch to progressive discovery. We recommend that clients implement thresholds to determine when to switch:"
  url: https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices
  bears_on: claude-catalog-200-page20. 이어지는 항목이 "Implement a threshold as a percentage of the context window. For example, 1%-5%." 와 "Load tool definitions. Once the threshold is reached, switch to progressive discovery." 다. 이 권고는 /docs/ 경로이고 /specification/ 이 아니다(docs 코퍼스에서 progressive-discovery spec=0 docs=12).
- text: "The upfront approach consumes ~150,000 tokens on definitions alone, while progressive discovery uses ~2,000 tokens by loading only what the task requires."
  url: https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices
  bears_on: claude-catalog-20-singlepage 대 claude-catalog-200-page20 의 6235B → 62708B(10.06배). 공식 문서의 75배 주장과 이번 실측의 10.06배는 카탈로그 규모가 다르다(200개 vs 문서가 상정한 규모).
- text: "Pagination in MCP uses an opaque cursor-based approach, instead of numbered pages."
  url: https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination
  bears_on: nextCursor 가 2025-06-18 스키마부터 존재한다는 셀 1 관측의 스펙 쪽 근거.
- text: "Clients **SHOULD**: * Treat a missing `nextCursor` as the end of results * Support both paginated and non-paginated flows"
  url: https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination
  bears_on: claude-catalog-200-page20. 스펙은 커서를 끝까지 따라가라고 요구하지 않는다. 중간에 멈추는 것을 금지하는 문장도 없다. claude 가 10회 전부 따라간 것은 스펙 강제가 아니라 클라이언트 정책이다.
- text: "`tools/call` allows returning both `content` and `structuredContent` at the same time, which has confused server and client authors alike and produced diverging implementations."
  url: https://modelcontextprotocol.io/development/roadmap
  bears_on: schema-surface-classify. structuredContent 는 2025-06-18=2, 2025-11-25=3, 2026-07-28=3 으로 릴리스 스키마 안에 있다. 로드맵 항목 중 "스키마에 이미 있는데 모양을 바꾸겠다"는 유일한 부류다.
