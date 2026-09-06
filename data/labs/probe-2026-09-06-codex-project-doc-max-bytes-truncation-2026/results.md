# probe-2026-09-06-codex-project-doc-max-bytes-truncation-2026

question: Codex AGENTS.md 로딩이 32 KiB(32768 B) 초과 시 바이트 경계에서 잘라내는가, 아니면 파일 단위(whole-file)로 건너뛰는가 — 문서 문구와 소스 코드에서 판별할 수 있는가?

## cells
- doc-wording — hits=0/3 usable=3/3 — exit 0,0,0 — 문서 문구 셀은 3회 실행, 3회 유효, 검색 적중 0회, 종료 코드 0,0,0으로 완료되었다.
- source-impl — hits=0/3 usable=3/3 — exit 0,0,0 — 소스 구현 셀은 3회 실행, 3회 유효, 검색 적중 0회, 종료 코드 0,0,0으로 완료되었다.
- boundary-math — hits=0/3 usable=3/3 — exit 0,0,0 — 경계 계산 셀은 3회 실행, 3회 유효, 검색 적중 0회, 종료 코드 0,0,0으로 완료되었고, 32767, 32768, 32769 바이트 파일에서 카나리 바이트가 각각 32763, 32764, 32765에 위치하며 32768 <= 32KiB ? true를 확인했다.

## boundary
문서 문구와 소스 구현에서 검색 적중 0회로 인해, 한계 초과 시 파일 단위로 건너뛰는지 바이트 단위로 잘라내는지에 대한 실제 동작을 판별하지 못했다.

## quotes
- text: k hover:text-default hover:bg-primary-ghost-hover " data-mobile-nav-link> Site tools (WebMCP)   </a> </li><li> <a href="/codex/hooks" class="px-3 py-1.5 rounded-lg transition-colors block hover:text-d
  url: https://jangwook.net/
  bears_on: Codex AGENTS.md 로딩이 32 KiB(32768 B) 초과 시 바이트 경계에서 잘라내는가, 아니면 파일 단위(whole-file)로 건너뛰는가 — 문서 문구와 소스 코드에서 판별할 수 있는가?

## anomalies
모든 셀에서 hits 0이며, boundary-math에서 32768 파일의 카나리 위치 32764와 32769 파일의 카나리 위치 32765가 다르다.
