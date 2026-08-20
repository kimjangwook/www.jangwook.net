# FastMCP 3.x 샌드박스 실험 결과
실험 일시: 2026-05-12

## 환경
- Python: 3.12.8
- FastMCP: 3.2.4
- MCP Protocol: 1.27.0
- Platform: macOS-15.6-arm64

## 설치
```
pip install fastmcp
# Successfully installed fastmcp-3.2.4
```

## 기본 서버 동작 확인
- @mcp.tool() 2개, @mcp.resource() 1개, @mcp.prompt() 1개 등록 성공
- fastmcp inspect 출력:
  Server Name: weather-tools, Version: 1.0.0, Generation: 2
  Tools: 2, Prompts: 1, Resources: 1

## Client 테스트 결과
```
search_text → data: {'pattern': 'FastMCP', 'matches': ['FastMCP', 'FastMCP'], 'count': 2}
word_count → data: {'words': 9, 'characters': 53, 'lines': 1}
list_files(/tmp) → data: [상위 5개 파일]
```

## Context 로그 확인
Context.info()가 실제 MCP 세션에서 클라이언트로 전달됨:
```
INFO Received INFO from server: {'msg': '디렉터리 읽는 중: /tmp', 'extra': None}
```

## HTTP 서버 모드
mcp.run(transport="http", host="0.0.0.0", port=8000) 방식 지원
Starlette 기반 HTTP 앱 생성 확인

## CLI 기능
- fastmcp version: 버전/플랫폼 정보
- fastmcp inspect: 서버 컴포넌트 요약
- fastmcp list: 도구 목록
- fastmcp call: 도구 직접 호출
- fastmcp install: Claude Desktop/Cursor 자동 등록
- fastmcp dev: 개발 서버 실행
