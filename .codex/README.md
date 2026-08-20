# Codex 마이그레이션 맵

생성 시각: 2026-02-21T13:49:31.345Z

## 실행 명령
- `npm run codex:migrate`: .claude 에셋을 `.codex/*`로 동기화
- `npm run codex:analyze-posts`: 포스트 메타데이터 갱신
- `npm run codex:generate-recommendations`: 추천 포스트 계산
- `npm run codex:next-post-recommendation -- --count 10`: 다음 주제 추천안 생성
- `npm run codex:write-post -- "주제"`: 글 초안 스켈레톤 생성
- `npm run codex:write-ga-post -- "YYYY-MM-DD"`: GA 리포트 스켈레톤 생성
- `npm run codex:commit`: staged 파일 기준 자동 커밋
- `npm run codex:migrate -- --keep-brave-mcp`: Brave MCP를 유지하려는 경우에만 사용
- `npm run codex:migrate -- --drop-brave-mcp`: Brave MCP를 제거한 상태로 마이그레이션(기본값)

## Brave 검색 정책
- 기본 동작: Brave MCP 제거 (기본값 기준 제거)
- Codex 기본 웹 검색이 가능한 작업 흐름이면 Brave MCP가 없어도 /write-post /generate-recommendations /next-post-recommendation이 동작하도록 설계합니다.
- Brave 기반 검색이 꼭 필요한 특정 스킬은 해당 스킬 호출 전후로 별도 확인이 필요합니다.

## Codex 프로젝트 신뢰 설정
- 프로젝트 루트에서 실행 시, 전역 `~/.codex/config.toml`에 다음 항목이 있어야 신뢰 경고가 발생하지 않습니다.
  - `[projects."/Users/jangwook/Documents/workspace/www.jangwook.net"]`
  - `trust_level = "trusted"`
