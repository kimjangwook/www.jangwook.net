# Lab Evidence: ollama-fastapi-production-deployment-guide-2026

## Sandbox Test Date: 2026-05-28

## Environment
- Ollama v0.20.5 (macOS, /usr/local/bin/ollama)
- FastAPI 0.136.3
- Python 3.12

## Models Tested
- yinw1590/gemma4-e2b-text:latest (3.1GB)

## Test Results

### Health Endpoint
```
GET /health
{"status": "ok", "models": ["melavisions/gemma4:latest", "yinw1590/gemma4-e2b-text:latest", "gemma4:e4b", ...]}
```

### Generate Endpoint  
```
POST /generate
{"prompt": "What is the benefit of wrapping Ollama with FastAPI?..."}
Response: {"model": "yinw1590/gemma4-e2b-text:latest", "response": "Wrapping Ollama with FastAPI allows you to create a robust, high-performance RESTful API endpoint...", "done": true, "total_duration_ms": 14871.58}
```

### Streaming Endpoint
```
POST /generate/stream
data: {"text": "1", "done": false}
data: {"text": ".", "done": false}
data: {"text": " **", "done": false}
data: {"text": "Enhanced", "done": false}
data: {"text": " Privacy", "done": false}
...
```

### Uvicorn Log
```
INFO:     Started server process [78280]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8765
INFO:     127.0.0.1:55781 - "GET /health HTTP/1.1" 200 OK
INFO:     127.0.0.1:55785 - "POST /generate HTTP/1.1" 200 OK
INFO:     127.0.0.1:55796 - "POST /generate/stream HTTP/1.1" 200 OK
```

## Result: LAB PUBLISH ✓
