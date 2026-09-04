# probe-2026-09-04-owasp-mcp-governance-risk-inventory-2026

question: 자사 하네스에 연결된 MCP 서버들을 OWASP MCP 거버넌스 프로젝트의 인벤토리·리스크 스코어링 기준에 대입하면 몇 개가 어떤 칸(설치 스키마·권한 범위·업데이트 부재)에서 플래그되는가?

## cells
- c1-inventory-enumeration — hits=0/3 usable=3/3 — exit 0,0,0 — 3회 실행 모두 exit code 0으로 끝났으나 hits는 0이었고, 184322바이트 claude.json에서 stdio 타입 pipx 기반 analytics-mcp 서버가 열거되었다.
- c2-install-schema-scoring — hits=0/3 usable=3/3 — exit 0,0,0 — 3회 실행 모두 exit code 0, hits 0이었으며 출력에는 6376바이트 ref/owasp-mcp-readme.md 참조와 3만 표시되어 설치 스키마 점수 산출은 확인되지 않았다.
- c3-permission-scope-scoring — hits=0/3 usable=3/3 — exit 0,0,0 — 3회 실행 모두 exit code 0, hits 0이었고 출력이 비어 있어 권한 범위 점수가 어떤 서버에도 부여되지 않았다.
- c4-update-absence-remote — hits=0/3 usable=3/3 — exit 0,0,0 — 3회 실행 모두 exit code 0, hits 0이었고 snapshot/.mcp.json과 snapshot/claude.json이 MISSING_FILE로 표시되며 NO_REMOTE_URL_FOUND가 출력되었다.
- c5-owasp-rubric-crosswalk — hits=0/3 usable=3/3 — exit 0,0,0 — 3회 실행 모두 exit code 0, hits 0이었으나 jq가 results/c*.json 파일을 찾지 못하는 오류를 출력해 크로스워크 집계가 이루어지지 않았다.

## boundary
이 실험은 어떤 MCP 서버도 OWASP 기준의 어떤 칸(설치 스키마·권한 범위·업데이트 부재)에서 플래그되었는지 보여주지 못한다 — 모든 셀의 hits가 0이었고 크로스워크 집계 셀은 results/c*.json 파일 부재로 실행 자체가 실패했기 때문에, 기대했던 '최소 2개 칸에서 다수 플래그' 여부를 판정할 수 없다.

## quotes
- text: MISSING_FILE snapshot/.mcp.json
MISSING_FILE snapshot/claude.json
NO_REMOTE_URL_FOUND
  url: https://modelcontextprotocol.io
  bears_on: c4-update-absence-remote 셀에서 원격 URL을 찾지 못해 업데이트 부재 칸 평가에 필요한 근거 파일이 스냅샷에서 누락되었음을 보여준다.
- text: jq: error: Could not open file results/c*.json: No such file or directory
  url: https://docs.anthropic.com
  bears_on: c5-owasp-rubric-crosswalk 셀의 집계 실패 원인으로, exit code 0에도 결과 파일이 생성되지 않았음을 시사한다.
- text: "name": "analytics-mcp",
      "type": "stdio",
      "command": "pipx",
  url: https://code.claude.com
  bears_on: c1-inventory-enumeration 셀이 하네스 claude.json에서 열거한 서버 엔트리의 설치 스키마를 보여준다.

## anomalies
모든 셀이 exit code 0인데도 hits가 전부 0이고, c3은 출력이 완전히 비었으며 c5는 jq 파일 부재 오류를 냈다 — 성공 종료 코드와 실제 산출물 사이의 불일치가 세 셀(c2·c3·c5)에서 반복 관찰되었다.
