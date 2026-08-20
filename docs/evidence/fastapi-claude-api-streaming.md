# 샌드박스 실험 로그: FastAPI + Claude API Streaming

## 환경
- Date: 2026-05-11
- Python: 3.12.8
- FastAPI: 0.136.1
- Anthropic SDK: 0.97.0
- Uvicorn: (latest)

## 설치
```
pip3 install fastapi uvicorn anthropic httpx
```

## 테스트 결과

### 서버 기동
```
INFO:     Started server process [44655]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:18001
```

### Health Check
```json
{"status": "ok", "timestamp": 1778480829.828316}
```

### OpenAPI Schema 확인
```
Title: Claude Streaming API
Version: 1.0.0
Endpoints:
  POST /chat/stream
  GET /health
  GET /
```

### SSE 스트리밍 출력 (mock)
```
data: {"type": "delta", "text": "FastAPI", "index": 0}
data: {"type": "delta", "text": "와 ", "index": 1}
data: {"type": "delta", "text": "Claude", "index": 2}
...
data: {"type": "done", "usage": {"input_tokens": 12, "output_tokens": 13}, "stop_reason": "end_turn"}
```

### 재시도 로직 검증
- 2번 실패 후 3번째 시도에서 성공 확인
- 지수 백오프 동작 확인

### 에러 분류 매핑
| Error Type | 분류 | 행동 |
|---|---|---|
| RateLimitError | rate_limit | 재시도 가능 (지수 백오프) |
| AuthenticationError | auth_error | 즉시 실패 (API 키 확인) |
| BadRequestError | token_limit | 즉시 실패 (메시지 축소 필요) |
| APIConnectionError | network_error | 재시도 가능 (연결 재시도) |
| Unknown | unknown | 즉시 실패 (로그 기록) |

## 결론
- Claude API를 직접 호출하려면 ANTHROPIC_API_KEY 필요
- 서버 구조, SSE 포맷, 재시도 로직은 모두 정상 동작 확인
- 실제 스트리밍은 mock으로 시연 완료
