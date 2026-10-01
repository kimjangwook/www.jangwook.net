# Lab Evidence: uv Python AI Dev Setup (2026-05-07)

## Environment
- uv version: 0.11.11 (ed7b06001 2026-05-06)
- OS: macOS aarch64 (Apple Silicon)
- Python used: CPython 3.11.12

## Timing Results

| Command | Time |
|---|---|
| `uv init claude-agent-demo` | 0.435s |
| `uv add anthropic` (16 packages) | 0.874s |
| `uv add openai httpx python-dotenv` (3 more) | 0.555s |
| `uv run main.py` | 1.675s |
| `uv sync` (from cache, 19 packages) | **0.074s** |

## anthropic SDK
- Installed version: 0.100.0
- Import test: PASSED

## openai SDK
- Installed version: 2.35.1

## Dependency tree (partial)
```
claude-agent-demo v0.1.0
├── anthropic v0.100.0
│   ├── anyio v4.13.0
│   ├── httpx v0.28.1
│   ├── pydantic v2.13.4
│   └── ...
└── openai v2.35.1
```
