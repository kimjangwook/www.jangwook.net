# probe-2026-08-30-codex-claude-shared-instruction-workaround-2026

question: AI CLI를 실행하지 않고도 symlink 공유 우회(AGENTS.md ↔ CLAUDE.md)가 성립하는지를 문서 계층과 파일시스템 계층에서만 잴 수 있는가 — Claude Code가 AGENTS.md를 네이티브로 읽는다는 문서항이 존재하는가, symlink가 32KiB 한도 검사에 동일하게 투사되는가, symlink가 이동·재배치에 견디는가, 그리고 agents.md/Codex 공식 문서가 symlink를 금지하거나 특수취급하는가

## cells
- claude-changelog-agents-md-native — hits=0/3 usable=3/3 — exit 0,0,0 — Claude Code 체인지로그 3회 모두 AGENTS.md 언급이 빈 배열(0건)로 나타나 네이티브 로딩 항목은 확인되지 않았고, 같은 스캔에서 claudeMdMentions는 59건, symlinkMentions는 72건이었다.
- symlink-projects-through-32k-boundary — hits=0/3 usable=0/3 — exit 1,1,1 — 32KiB 경계 투사 셀은 3회 모두 exit code 1로 'Error: ENOENT: no such file or directory, lstat 'AGENTS.md''에 걸려 usable_runs 0/3로 크기·경계 카나리 비교 자체를 수행하지 못했다.
- symlink-survives-relocation — hits=0/3 usable=3/3 — exit 0,0,0 — 재배치 셀 3회 모두 상대 symlink CL_rel.md는 isSymlink true, resolves true로 생존한 반면 절대 symlink CL_abs.md는 ENOENT로 resolves false, 복사본 CP_copy.md는 isSymlink false, resolves true였다.
- agents-md-spec-codex-docs-symlink-rules — hits=0/3 usable=3/3 — exit 0,0,0 — agents.md 스펙 3회 모두 symlink 0건, symbolicLink 1건이었고 codexDoc·codexReadme는 symlink·symbolicLink·override·oneFilePerDir·maxBytes가 모두 0건이어서 symlink 금지나 특수취급 규정은 발견되지 않았다.

## boundary
이 실험은 32KiB 한도 검사에서 symlink가 동일하게 투사되는지(두 경로의 크기·바이트 내용·경계 카나리 오프셋 일치)를 전혀 측정하지 못했다 — 해당 셀은 3회 모두 ENOENT로 실패해 usable_runs 0/3이었고, Claude Code가 실제로 어떤 파일을 런타임에 읽는지도 잴 수 없으며, agents.md 스펙에서 symbolicLink 1건이 무엇을 규정하는지 맥락 검증은 커버하지 못한다.

## quotes
- text: {
  "agentsMdMentions": [],
  "claudeMdMentions": 59,
  "symlinkMentions": 72
}
  url: https://jangwook.net/
  bears_on: AI CLI를 실행하지 않고도 symlink 공유 우회(AGENTS.md ↔ CLAUDE.md)가 성립하는지를 문서 계층과 파일시스템 계층에서만 잴 수 있는가 — Claude Code가 AGENTS.md를 네이티브로 읽는다는 문서항이 존재하는가, symlink가 32KiB 한도 검사에 동일하게 투사되는가, symlink가 이동·재배치에 견디는가, 그리고 agents.md/Codex 공식 문서가 symlink를 금지하거나 특수취급하는가

## anomalies
기대와 달리 32KiB 경계 셀이 3회 모두 lstat 'AGENTS.md' ENOENT로 실패해 크기·바이트·경계 카나리 일치 예측을 확인도 반증도 하지 못했다. 또한 체인지로그에서 symlinkMentions 72건이 claudeMdMentions 59건보다 많고 AGENTS.md는 0건인 비대칭이 관측되었으며, agents.md 스펙에 symbolicLink 1건만 존재해 완전한 부재는 아니었다.
