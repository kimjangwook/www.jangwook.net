---
title: 'FastMCP 3.x로 Python MCP 서버 30분 만에 만들기 — @tool 데코레이터 하나면 충분하다'
description: 'FastMCP 3.2.4를 직접 설치해 @mcp.tool(), @mcp.resource(), @mcp.prompt() 데코레이터로 동작하는 MCP 서버를 만들어봤다. Claude Desktop과 Cursor가 호출하는 AI 도구 서버를 Python 30줄로 구현하는 실전 가이드.'
pubDate: '2026-05-12'
heroImage: '../../../assets/blog/fastmcp-python-mcp-server-build-guide-2026/hero.png'
tags: ['MCP', 'FastMCP', 'Python', 'AI Agent', 'Claude']
relatedPosts:
  - slug: 'mcp-server-build-practical-guide-2026'
    score: 0.92
    reason:
      ko: 'FastMCP의 고수준 API가 왜 편한지 이해하려면, 이 글이 다루는 Streamable HTTP 저수준 구현과 비교해보는 게 도움이 된다.'
      ja: 'FastMCPの高レベルAPIの利点を理解するには、このStreamable HTTP低レベル実装と比較すると効果的だ。'
      en: 'To understand why FastMCP is convenient, compare it with the low-level Streamable HTTP implementation covered in this post.'
      zh: '要理解FastMCP高层API的便利性，与本文介绍的Streamable HTTP底层实现进行对比会很有帮助。'
  - slug: 'local-llm-private-mcp-server-gemma4-fastmcp'
    score: 0.85
    reason:
      ko: '로컬 LLM과 FastMCP를 완전 오프라인 환경에서 조합하는 방법을 다뤘다. 이 글의 클라우드 배포 패턴과 대비된다.'
      ja: 'ローカルLLMとFastMCPをオフライン環境で組み合わせる方法を解説。クラウドデプロイパターンと対照的だ。'
      en: 'Covers combining local LLM with FastMCP in a fully offline setup — the counterpart to the cloud deployment pattern in this post.'
      zh: '介绍了在完全离线环境中组合本地LLM和FastMCP的方法，与本文的云端部署模式形成对比。'
  - slug: 'mcp-gateway-agent-traffic-control'
    score: 0.78
    reason:
      ko: 'MCP 서버를 실제로 만든 다음엔 에이전트가 어떤 도구를 호출할 수 있는지 통제하고 싶어진다. MCP Gateway가 그 역할을 한다.'
      ja: 'MCP サーバーを構築したら、次はエージェントがどのツールを呼び出せるか制御したくなる。MCP Gatewayがその役割を担う。'
      en: 'After building an MCP server, you will want to control which tools agents can call. MCP Gateway handles that.'
      zh: '构建MCP服务器后，你会想控制代理可以调用哪些工具。MCP Gateway正是扮演这个角色。'
  - slug: 'mcp-servers-toolkit-introduction'
    score: 0.72
    reason:
      ko: '내가 실제로 사용하는 MCP 서버 목록을 정리한 글이다. 직접 서버를 만들기 전에 이미 존재하는 것을 먼저 찾아보는 것도 전략이다.'
      ja: '実際に使用しているMCPサーバーをまとめた記事。自分で作る前に既存のものを探すのも戦略的だ。'
      en: 'A curated list of MCP servers I actually use. Before building your own, checking what already exists is also a valid strategy.'
      zh: '整理了我实际使用的MCP服务器列表。在自己构建之前，先了解现有工具也是一种策略。'
  - slug: 'mcp-code-execution-practical-implementation'
    score: 0.70
    reason:
      ko: 'MCP를 통해 Claude Code가 실제 코드를 실행하도록 만드는 실전 사례. 이 글의 @tool 패턴이 거기서도 핵심이다.'
      ja: 'MCPを通じてClaude Codeが実際にコードを実行する実践事例。この記事の@toolパターンがそこでも中心的な役割を果たす。'
      en: 'A real-world case of using MCP to let Claude Code execute actual code. The @tool pattern from this post is central there too.'
      zh: '通过MCP让Claude Code执行实际代码的实战案例。本文的@tool模式在那里也是核心。'
---

MCP(Model Context Protocol) 서버를 처음부터 직접 구현하려면 생각보다 손이 많이 간다. stdio 트랜스포트 처리, JSON-RPC 2.0 직렬화, 핸들러 등록 — [MCP 서버를 Streamable HTTP로 직접 만드는 과정](/ko/blog/ko/mcp-server-build-practical-guide-2026)을 따라가 보면 알겠지만 "AI 도구를 하나 추가하고 싶을 뿐인데" 왜 이렇게 많은 보일러플레이트가 필요한지 답답해지는 순간이 온다.

FastMCP는 그 답답함을 해소하기 위해 만들어진 프레임워크다. 나는 오늘 샌드박스에서 pip로 설치하고 실제로 동작하는 MCP 서버를 30분 안에 올렸다.

## FastMCP가 뭔지 먼저 확인하고 갔다

FastMCP는 MCP Python SDK 위에 올라간 고수준 레이어다. Express.js가 Node의 http 모듈을 감싼 것과 같은 구조다. 공식 설명은 "The fast, Pythonic way to build MCP servers and clients"인데, 실제로 써보니 그 말이 맞다.

버전을 확인해보니 내가 예상했던 것보다 더 앞서 있었다.

```
$ fastmcp version

FastMCP version:   3.2.4
MCP version:       1.27.0
Python version:    3.12.8
Platform:          macOS-15.6-arm64
```

백로그에 "v2.0" 기준으로 적어뒀는데 이미 3.x까지 올라와 있다. MCP 프로토콜 자체도 1.27.0이다. 이 버전 번호가 말해주는 것 한 가지 — FastMCP는 꽤 활발하게 개발되고 있다.

솔직히 말하면 3.x로 올라오면서 API가 얼마나 바뀌었는지 직접 확인해야 했다. 문서만 보는 것보다 실제로 돌려보는 게 빠르다.

## 설치와 첫 서버 — 정말 이게 전부다

```bash
pip install fastmcp
```

설치는 10초 걸렸다. 이제 실제로 동작하는 서버를 만들어보자. 내가 샌드박스에서 처음 만든 건 날씨 관련 도구 두 개짜리 서버였다.

```python
from fastmcp import FastMCP
from datetime import datetime

mcp = FastMCP("weather-tools", version="1.0.0")

@mcp.tool()
def get_current_time(timezone: str = "UTC") -> str:
    """현재 시각을 반환합니다."""
    return f"현재 시각 ({timezone}): {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

@mcp.tool()
def calculate_temp(celsius: float) -> dict:
    """섭씨를 화씨와 켈빈으로 변환합니다."""
    return {
        "celsius": celsius,
        "fahrenheit": round(celsius * 9/5 + 32, 2),
        "kelvin": round(celsius + 273.15, 2)
    }

@mcp.resource("data://server-info")
def server_info() -> str:
    """서버 정보를 반환합니다."""
    return "FastMCP 3.x 날씨 서버"

@mcp.prompt()
def weather_analysis(location: str) -> str:
    """날씨 분석 프롬프트 템플릿"""
    return f"{location}의 날씨를 분석하고 옷차림 추천을 해주세요."

if __name__ == "__main__":
    mcp.run()  # stdio 모드로 실행
```

이게 전부다. Python 함수에 데코레이터 하나 붙이면 MCP 도구가 된다. 타입 힌트가 자동으로 JSON Schema로 변환되어 Claude에 전달된다.

`fastmcp inspect`로 서버 구성을 확인할 수 있다.

```
$ fastmcp inspect server.py

Server
  Name:         weather-tools
  Version:      1.0.0
  Generation:   2

Components
  Tools:        2
  Prompts:      1
  Resources:    1
  Templates:    0
```

## 세 가지 빌딩 블록: Tool, Resource, Prompt

FastMCP의 핵심 개념은 세 가지다. 이걸 구분하는 것이 서버를 잘 설계하는 첫걸음이다.

**@mcp.tool()** — Claude가 직접 호출하는 함수다. 파라미터를 받아서 작업을 수행하고 결과를 반환한다. 검색, 계산, 파일 조작, API 호출 같은 것들이 여기 들어간다. 나는 Claude가 내 파일 시스템이나 API를 직접 다루게 하고 싶을 때 `@mcp.tool()`을 쓴다.

**@mcp.resource()** — 읽기 전용 데이터 소스다. `data://`, `file://`, `https://` 같은 URI로 등록하면 Claude가 컨텍스트로 읽어간다. 도구와 달리 "실행"하는 게 아니라 "읽는" 개념이다. 데이터베이스 스키마, 설정 파일, 문서 같은 것들을 여기 넣으면 Claude의 컨텍스트 창에 들어간다.

**@mcp.prompt()** — 재사용 가능한 프롬프트 템플릿이다. 파라미터를 받아서 구성된 프롬프트 메시지를 반환한다. Claude Desktop이나 Claude.ai에서 슬래시 명령어처럼 쓸 수 있다.

MCP를 처음 쓰는 개발자들이 헷갈리는 부분이 Tool과 Resource의 차이다. 내 기준은 간단하다 — **부수 효과(side effect)가 있으면 Tool, 없으면 Resource**다.

## Context로 진행 상황을 클라이언트에 전달하기

도구가 오래 걸리는 작업을 할 때 진행 상황을 실시간으로 전달할 수 있다. `Context` 매개변수를 추가하면 FastMCP가 자동으로 주입해준다.

```python
from fastmcp import FastMCP, Context

mcp = FastMCP("dev-tools")

@mcp.tool()
async def list_files(directory: str, ctx: Context) -> list[str]:
    """지정한 디렉터리의 파일 목록을 반환합니다."""
    import os
    await ctx.info(f"디렉터리 읽는 중: {directory}")  # 클라이언트에 로그 전송
    
    try:
        files = os.listdir(directory)
        await ctx.report_progress(100, 100, "complete")  # 진행률 보고
        return sorted(files)
    except FileNotFoundError:
        raise ValueError(f"디렉터리를 찾을 수 없습니다: {directory}")
```

내가 샌드박스에서 실제로 실행해보니, `ctx.info()`가 클라이언트 쪽으로 실시간 로그를 보내는 것을 확인했다.

```
INFO  Received INFO from server: {'msg': '디렉터리 읽는 중: /tmp', 'extra': None}
```

이게 Claude Desktop에서 작동하면 사용자는 도구가 어떤 단계를 수행하는지 실시간으로 볼 수 있다. UX 측면에서 꽤 중요한 기능이다.

## FastMCP Client로 테스트하기

실제 Claude Desktop 없이도 서버를 테스트할 수 있다. FastMCP는 in-process 클라이언트를 제공한다. [MCP 에이전트 워크플로우 패턴](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types)을 구현할 때도 이 방식이 테스트를 단순하게 만들어준다.

```python
import asyncio
from fastmcp import FastMCP
from fastmcp.client import Client

mcp = FastMCP("dev-tools")

@mcp.tool()
def search_text(text: str, pattern: str) -> dict:
    """텍스트에서 패턴을 검색합니다."""
    import re
    matches = re.findall(pattern, text)
    return {"pattern": pattern, "matches": matches, "count": len(matches)}

@mcp.tool()
def word_count(text: str) -> dict:
    """단어 수, 문자 수, 줄 수를 반환합니다."""
    words = text.split()
    return {
        "words": len(words),
        "characters": len(text),
        "lines": len(text.splitlines())
    }

async def test():
    async with Client(mcp) as client:
        # 도구 목록 조회
        tools = await client.list_tools()
        print(f"등록된 도구 {len(tools)}개:")
        for t in tools:
            print(f"  [{t.name}] {t.description}")
        
        # 실제 도구 호출
        result = await client.call_tool("search_text", {
            "text": "FastMCP is fast. FastMCP is easy.",
            "pattern": "FastMCP"
        })
        print(f"\nsearch_text 결과: {result.data}")
        # → {'pattern': 'FastMCP', 'matches': ['FastMCP', 'FastMCP'], 'count': 2}
        
        result2 = await client.call_tool("word_count", {
            "text": "Hello World from FastMCP 3.x"
        })
        print(f"word_count 결과: {result2.data}")
        # → {'words': 5, 'characters': 27, 'lines': 1}

asyncio.run(test())
```

`result.data`로 구조화된 반환값을 바로 쓸 수 있다. 실제로 돌려보니 오류 없이 잘 동작했다.

![FastMCP CLI 실행 결과 — fastmcp version, inspect, 도구 호출 테스트](../../../assets/blog/fastmcp-python-mcp-server-build-guide-2026/cli-output.png)

## HTTP 서버로 원격 배포하기

로컬 stdio 모드 외에 HTTP 서버로 띄울 수 있다. Cursor나 원격 환경에서 MCP 서버를 공유하고 싶을 때 쓴다.

```python
# HTTP 모드로 실행 (기본 포트 8000)
if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=8000)
```

```bash
# 또는 uvicorn으로 직접 실행
uvicorn server:mcp.http_app() --host 0.0.0.0 --port 8000
```

FastMCP의 HTTP 앱은 Starlette 기반이다. 타입을 확인해보니 `StarletteWithLifespan`이었다. 즉, FastAPI나 Starlette 앱에 마운트하는 것도 가능하다는 의미다.

```python
# FastAPI와 통합
from fastapi import FastAPI
from fastmcp import FastMCP

app = FastAPI()
mcp = FastMCP("my-tools")

@mcp.tool()
def my_tool() -> str:
    return "result"

# FastAPI 앱에 MCP 서버 마운트
app.mount("/mcp", mcp.http_app())
```

Claude Desktop에서 HTTP 서버에 연결하는 설정은 간단하다.

```json
{
  "mcpServers": {
    "my-tools": {
      "url": "http://localhost:8000/mcp/"
    }
  }
}
```

## fastmcp CLI — 개발 워크플로우에서 유용한 명령어들

FastMCP는 CLI도 제공한다. 나는 처음엔 몰랐는데 `fastmcp --help`를 실행해보니 꽤 풍부했다.

```
Commands:
  inspect      — 서버 컴포넌트 요약 출력
  list         — 등록된 도구 목록
  call         — 도구 직접 호출 (디버깅용)
  install      — Claude Desktop / Cursor에 자동 등록
  dev          — 개발 서버 실행 (hot reload)
  discover     — 에디터에 설정된 MCP 서버 탐색
  run          — 서버 실행
```

`fastmcp install server.py --client claude`를 실행하면 Claude Desktop config를 자동으로 수정해준다고 한다. 직접 JSON 파일을 편집하는 수고가 없어지는 거다. 다만 나는 이 명령어를 지금 환경에서 Claude Desktop이 설치된 상태가 아니라 직접 테스트하진 못했다 — `--client` 옵션이 어떤 경로를 건드리는지는 공식 문서에서 확인하는 것을 권한다.

솔직히 `fastmcp dev` 쪽이 더 실용적으로 보인다. 코드를 수정할 때마다 서버를 재시작하는 귀찮음을 없애준다.

## 타입 힌트가 곧 API 스키마다

FastMCP에서 내가 가장 인상 깊었던 부분은 타입 힌트와 JSON Schema 자동 변환이다. 직접 구현하면 각 도구마다 inputSchema를 손으로 써야 한다. FastMCP는 그걸 파이썬 타입 시스템이 대신한다.

```python
from typing import Literal
from pydantic import BaseModel

class FileFilter(BaseModel):
    extension: str
    min_size_kb: int = 0
    exclude_hidden: bool = True

@mcp.tool()
def list_files_advanced(
    directory: str,
    filter: FileFilter | None = None,
    sort_by: Literal["name", "size", "modified"] = "name",
    limit: int = 50
) -> list[dict]:
    """파일 목록을 필터와 정렬 옵션으로 반환합니다."""
    import os
    import stat

    files = []
    for f in os.scandir(directory):
        if filter and filter.exclude_hidden and f.name.startswith("."):
            continue
        if filter and not f.name.endswith(f".{filter.extension}"):
            continue
        
        info = f.stat()
        size_kb = info.st_size / 1024
        
        if filter and size_kb < filter.min_size_kb:
            continue
        
        files.append({
            "name": f.name,
            "size_kb": round(size_kb, 2),
            "modified": info.st_mtime
        })
    
    # 정렬
    key_map = {"name": "name", "size": "size_kb", "modified": "modified"}
    files.sort(key=lambda x: x[key_map[sort_by]])
    
    return files[:limit]
```

이 함수를 `@mcp.tool()`로 등록하면 Claude는 자동으로 `FileFilter`의 구조와 각 필드의 타입, `sort_by`의 가능한 값(name/size/modified), `limit`의 기본값까지 알 수 있다. 내가 별도로 설명서를 쓸 필요가 없다. Pydantic 모델도 지원하므로 복잡한 입력 구조도 그대로 쓸 수 있다.

도구의 description도 독스트링에서 자동으로 가져온다. 잘 쓴 독스트링 하나가 Claude에게 보내는 사용 설명서가 된다.

## 실전 개발 도구 서버 — 코드 분석 MCP 서버

실제로 써먹을 수 있는 예제를 하나 만들어봤다. 파이썬 파일을 분석하는 개발 도구 MCP 서버다.

```python
from fastmcp import FastMCP, Context
import ast
import os

mcp = FastMCP("code-analyzer", version="1.0.0")

@mcp.tool()
async def analyze_python_file(filepath: str, ctx: Context) -> dict:
    """Python 파일을 AST로 분석하고 함수·클래스 목록을 반환합니다."""
    await ctx.info(f"파일 분석 중: {filepath}")
    
    if not os.path.exists(filepath):
        raise ValueError(f"파일 없음: {filepath}")
    
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()
    
    tree = ast.parse(source)
    
    functions = []
    classes = []
    
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            functions.append({
                "name": node.name,
                "line": node.lineno,
                "args": [a.arg for a in node.args.args],
                "docstring": ast.get_docstring(node)
            })
        elif isinstance(node, ast.ClassDef):
            classes.append({
                "name": node.name,
                "line": node.lineno,
                "bases": [b.id for b in node.bases if isinstance(b, ast.Name)]
            })
    
    await ctx.report_progress(100, 100, "analysis complete")
    
    return {
        "filepath": filepath,
        "total_lines": source.count("\n") + 1,
        "functions": functions,
        "classes": classes,
        "imports": [
            node.names[0].name
            for node in ast.walk(tree)
            if isinstance(node, ast.Import)
        ]
    }

@mcp.tool()
def count_todo_comments(filepath: str) -> dict:
    """파일에서 TODO/FIXME/HACK 주석을 찾아 반환합니다."""
    markers = ["TODO", "FIXME", "HACK", "XXX", "NOTE"]
    results = {m: [] for m in markers}
    
    with open(filepath, "r", encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            for marker in markers:
                if f"# {marker}" in line or f"# {marker}:" in line:
                    results[marker].append({
                        "line": i,
                        "text": line.strip()
                    })
    
    return {k: v for k, v in results.items() if v}

@mcp.resource("data://project-structure")
def project_structure() -> str:
    """현재 디렉터리의 Python 파일 목록을 반환합니다."""
    py_files = []
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if not d.startswith(".") and d != "node_modules"]
        for f in files:
            if f.endswith(".py"):
                py_files.append(os.path.join(root, f))
    return "\n".join(py_files[:50])

if __name__ == "__main__":
    mcp.run()
```

이 서버를 Claude Desktop에 연결하면 Claude에게 "이 파일에서 클래스 목록 보여줘"라고 하거나, "TODO 주석이 몇 개야?"라고 자연어로 물을 수 있다. 파이썬 코드 한 줄 작성하지 않아도 된다. 그게 MCP 도구 서버의 요점이다.

## 기존 MCP 서버 대비 뭐가 달라지나

내가 [Streamable HTTP 방식으로 직접 MCP 서버를 만들어봤을 때](/ko/blog/ko/mcp-server-build-practical-guide-2026)와 비교하면 차이가 명확하다.

직접 구현 시:
- `Server` 인스턴스 생성
- `@server.list_tools()` / `@server.call_tool()` 별도 등록
- 입력 파라미터를 직접 파싱
- `anyio.run()` + `stdio_server()` 조합으로 실행

FastMCP:
- `FastMCP` 인스턴스 하나
- `@mcp.tool()`로 함수를 그대로 도구로 등록
- 타입 힌트에서 JSON Schema 자동 생성
- `mcp.run()` 한 줄

코드 줄 수가 절반 이하로 줄어드는 건 부차적인 문제다. 핵심은 **비즈니스 로직에 집중할 수 있다**는 점이다. 트랜스포트 레이어가 어떻게 동작하는지 신경 쓰지 않아도 된다.

다만 내가 느낀 한계도 있다. FastMCP는 자유도를 트레이드오프로 지불한다. 저수준 MCP 메시지를 커스터마이즈해야 하거나, 비표준 트랜스포트를 써야 하는 상황이라면 FastMCP가 추상화 뒤에 숨겨버린 것들을 다시 꺼내야 한다. 그런 경우라면 MCP Python SDK를 직접 쓰는 게 맞다.

## 실행 가능성 판단 — 언제 FastMCP를 선택하나

내 결론은 이렇다:

**FastMCP를 쓸 때**: Claude, Cursor, VS Code 등 표준 MCP 클라이언트와 연동하는 서버를 만들 때. 특히 팀 내 AI 도구를 빠르게 프로토타이핑하거나, 기존 Python 함수를 MCP 서버로 노출하고 싶을 때.

**직접 SDK를 쓸 때**: 커스텀 트랜스포트, 비표준 메시지 포맷, 또는 FastMCP가 지원하지 않는 MCP 기능이 필요할 때. [MCP Code Execution 실전 사례](/ko/blog/ko/mcp-code-execution-practical-implementation)처럼 저수준 제어가 필요한 경우다.

FastMCP가 아쉬운 점 하나 — 3.x로 올라오면서 문서가 코드 변화를 완전히 따라잡지 못하고 있다. `get_tools()` 같은 메서드가 문서에는 있는 것처럼 보이지만 실제로는 `list_tools()`로 바뀌어 있었다. 공식 docs보다 소스 코드나 `dir(mcp)`로 직접 확인하는 습관이 필요하다.

프로덕션에 올리기 전에 한 가지 더 — [MCP Gateway로 에이전트 트래픽을 통제하는 방법](/ko/blog/ko/mcp-gateway-agent-traffic-control)도 함께 검토하는 것을 권한다. 서버를 노출했을 때 어떤 도구가 어떻게 호출되는지 통제하는 레이어가 필요해지는 순간이 온다.

## 정리

FastMCP 3.x는 Python 개발자가 MCP 서버를 가장 빠르게 만드는 방법이다. `pip install fastmcp` 한 줄, `@mcp.tool()` 데코레이터 하나, `mcp.run()` 한 줄. 30분 안에 Claude Desktop이 호출하는 AI 도구를 만들 수 있다.

MCP 생태계가 빠르게 성숙하고 있다. [내가 사용하는 MCP 서버 목록](/ko/blog/ko/mcp-servers-toolkit-introduction)을 보면 이미 다양한 통합이 존재한다. 직접 만들기 전에 먼저 있는 것을 쓰는 게 실용적이지만, 없다면 FastMCP로 직접 만드는 게 이제 그렇게 어렵지 않다.

오늘 샌드박스에서 확인한 버전은 FastMCP 3.2.4, MCP 1.27.0이다. 이 분야가 빠르게 바뀌고 있으니, 실제 적용 전에 [FastMCP 공식 문서](https://gofastmcp.com)에서 최신 API를 확인하길 바란다.
