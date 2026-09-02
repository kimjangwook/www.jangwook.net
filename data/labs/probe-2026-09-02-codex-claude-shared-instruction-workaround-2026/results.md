# probe-2026-09-02-codex-claude-shared-instruction-workaround-2026

question: 하나의 AGENTS.md를 심mlink로 CLAUDE.md(및 홈 전역 경로)에 물려 Codex와 Claude Code가 같은 지침 파일을 읽게 만드는 우회는, 파일 해상도·상위 디렉터리 도달성·override 섀도·32KiB 예산의 어느 칸에서 실제로 성립하고 어느 칸에서 무너지는가

## cells
- c3-subdir-reachability-of-root-symlink — hits=0/3 usable=3/3 — exit 0,0,0 — 3회 실행 모두 exit code 0으로 종료되었고, 하위 디렉터리에서 AGENTS.md와 CLAUDE.md 모두 reachable_at_up=3으로 상위 워크스페이스 루트의 심mlink에 도달했으며 marker_via_walk=1로 워크 방향 탐색에서도 마커가 확인되었다.
- c4-override-and-home-shadowing — hits=0/3 usable=3/3 — exit 0,0,0 — 3회 실행 모두 exit code 0으로 종료되었고, 가정용 홈 경로의 .codex/AGENTS.md 심mlink가 shared.md를 가리키는 것이 exists=yes로 확인되었으며 .claude/CLAUDE.md 심mlink도 동일 shared.md 대상으로 기록되었다.
- c5-shared-size-budget-32kib — hits=0/3 usable=3/3 — exit 0,0,0 — 3회 실행 모두 exit code 0으로 종료되었고, v31은 bytes=31769로 under_limit이었으나 v33은 bytes=33817로 over_limit_by=1049였으며, 심mlink 경유 읽기인 symlink_reads_full=33817로 v33의 전체 크기와 일치했다.

## boundary
이 실험은 c1-symlink-claude-to-agents-local과 c2-symlink-agents-to-claude-md-local이 LLM CLI 의존으로 P20 범위 제외되어 실행되지 않았으므로, 심mlink로 물린 지침 파일을 Codex와 Claude Code가 실제로 읽어 들이는지는 검증하지 못한다. 또한 모든 실행 셀에서 hits=0이어서 override 파일 존재 시 Codex 쪽 픽이 override로 넘어가 공유가 깨진다는 expectation의 섀도 동작은 관측되지 않았다.

## quotes
- text: AGENTS.md is a simple and open format for providing instructions to AI coding agents. It is supported by a wide range of tools.
  url: https://agents.md/
  bears_on: AGENTS.md를 단일 공유 지침 파일로 삼는 이 실험의 전제가 되는 파일 규약
- text: Claude Code reads memory files from the project root and parent directories, so instructions placed in an ancestor directory remain reachable from subdirectories.
  url: https://code.claude.com/docs/en/memory
  bears_on: c3에서 하위 디렉터리에서 상위 루트 심mlink가 reachable_at_up=3으로 도달 가능한 결과의 문서상 근거
- text: Codex reads AGENTS.md files, and a file named AGENTS.override.md takes precedence over AGENTS.md in the same directory.
  url: https://platform.openai.com/docs/codex
  bears_on: c4의 override 섀도 시나리오와 expectation에서 말하는 공유 깨짐 조건의 문서상 근거

## anomalies
expectation과 달리 관측되지 않은 부분이 있는데, 모든 실행 셀의 hits가 0이라 override 존재 시 섀도 전환은 확인할 수 없었다. 또한 c5에서 심mlink 경유 읽기(symlink_reads_full=33817)가 over_limit 상태의 v33 전체 크기와 정확히 일치해, 예산 초과 파일이라도 심mlink 자체는 파일 전체를 그대로 읽어 전달하는 것으로 나타났다.

## missing cells
- c1-symlink-claude-to-agents-local — LLM CLI 의존 — P20 범위 제외
- c2-symlink-agents-to-claude-md-local — LLM CLI 의존 — P20 범위 제외
