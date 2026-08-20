# MCP Streamable HTTP 서버 실험 로그
날짜: 2026-05-27
환경: Node.js v22.22.0 / @modelcontextprotocol/sdk v1.29.0 / Express

## 테스트 결과

### 서버 초기화 (stateful 모드)
```
✅ MCP Streamable HTTP 서버: http://127.0.0.1:3001/mcp
[session] 신규: d0290117-0ce6-4bc5-ab25-af536115ba93
```

### initialize 요청/응답
```
POST /mcp
Accept: application/json, text/event-stream

← event: message
← data: {"result":{"protocolVersion":"2025-03-26","capabilities":{"tools":{}},"serverInfo":{"name":"lab-tools","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
← Mcp-Session-Id: d0290117-0ce6-4bc5-ab25-af536115ba93
```

### tools/list
```
- greet: 사람 이름을 받아 인사 메시지 반환
- add: 두 숫자 덧셈
```

### tools/call greet
```
Input: { "name": "김장욱" }
Output: 안녕하세요, 김장욱! (HTTP 연결)
```

### tools/call add
```
Input: { "a": 42, "b": 58 }
Output: 42 + 58 = 100
```

### 세션 종료 (DELETE /mcp)
```
HTTP 200
```

### 종료 후 재접근
```
HTTP 400 Bad Request: Server not initialized
```

## 핵심 발견사항
1. Accept 헤더에 반드시 `application/json, text/event-stream` 모두 포함 필요
2. SSE 형태로 응답 (`event: message\ndata: {...}`)
3. stateful 모드에서 세션 종료 후 동일 세션 재접근 시 400 반환 (404 아님)
4. SDK 1.29.0에서 `StreamableHTTPServerTransport` + `Server` 조합으로 동작 확인
