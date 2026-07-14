---
title: MCP 서버 직접 만들기 — Streamable HTTP 트랜스포트로 실제 AI 도구 구현하기
description: >-
  Python FastMCP로 MCP 서버를 처음부터 구축하는 실전 튜토리얼. Streamable HTTP 트랜스포트 설정, 커스텀 AI 도구
  구현, Claude Code 클라이언트 연동, FastAPI 기반 배포까지 직접 구현한 경험을 단계별 코드 예제와 함께 공유합니다.
pubDate: '2026-04-13'
heroImage: ../../../assets/blog/mcp-server-build-practical-guide-2026-hero.jpg
tags:
  - MCP
  - Python
  - AI에이전트
  - FastMCP
  - 튜토리얼
relatedPosts:
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.93
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-insights-usage-analysis
    score: 0.93
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: google-code-wiki-guide
    score: 0.93
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: multi-agent-swe-bench-verdent
    score: 0.93
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
---

MCP 서버를 쓰는 글은 넘쳐나는데, 직접 만드는 글은 의외로 드물다.

공식 문서가 있긴 하지만, 2025년 말부터 Streamable HTTP 트랜스포트가 표준으로 자리잡으면서 예전 SSE(Server-Sent Events) 방식의 예제들이 반쯤 outdated가 됐다. 나도 처음 따라했다가 `uvicorn`을 따로 설치하라는 안내가 없어서 꽤 헤맸다.

이 글은 그 경험을 바탕으로, **2026년 기준으로 동작하는 MCP 서버 구축 과정**을 처음부터 끝까지 정리한 것이다. 특히 Streamable HTTP 트랜스포트 설정과 Claude Code에서 연동하는 부분에 집중했다.

## 왜 직접 만드는가

[MCP 서버 도구 모음 완벽 가이드](/ko/blog/ko/mcp-servers-toolkit-introduction)에서 다룬 것처럼, 이미 수백 개의 공개 MCP 서버가 있다. 그런데도 직접 만들어야 하는 이유가 있다.

첫째, 사내 시스템 연동. 공개 MCP 서버가 우리 회사의 사내 JIRA, 빌드 시스템, 배포 파이프라인을 알 리 없다.

둘째, 세밀한 권한 제어. 공개 서버는 "전부 허용" 아니면 "전부 금지"인 경우가 많다. 특정 팀만 쓸 수 있는 도구, 특정 환경에서만 실행되는 명령어 등을 구현하려면 직접 만들어야 한다.

셋째, 로직이 복잡한 경우. 여러 API를 조합해서 하나의 "도구"처럼 감싸고 싶을 때, 기존 서버를 뜯어고치는 것보다 새로 만드는 게 낫다.

## 환경 준비

```bash
# Python 3.11 이상 권장
python --version

# FastMCP 설치 (MCP Python SDK의 고수준 인터페이스)
pip install fastmcp

# Streamable HTTP 트랜스포트에 필요한 ASGI 서버
pip install uvicorn
```

FastMCP는 `mcp` 패키지에 포함된 고수준 API다. 낮은 레벨의 `Server` 클래스를 직접 쓰는 것도 가능하지만, 대부분의 경우 FastMCP면 충분하다.

## 첫 번째 MCP 서버: 최소 예제

```python
# server.py
from fastmcp import FastMCP

mcp = FastMCP("my-first-server")

@mcp.tool()
def get_word_count(text: str) -> dict:
    """
    텍스트의 단어 수, 문자 수, 줄 수를 반환합니다.

    Args:
        text: 분석할 텍스트 문자열
    """
    words = text.split()
    lines = text.splitlines()
    return {
        "words": len(words),
        "characters": len(text),
        "lines": len(lines),
        "avg_word_length": round(sum(len(w) for w in words) / len(words), 1) if words else 0
    }

@mcp.tool()
def format_list(items: list[str], style: str = "bullet") -> str:
    """
    문자열 목록을 지정한 형식으로 변환합니다.

    Args:
        items: 변환할 문자열 목록
        style: 'bullet' (기본), 'numbered', 'comma' 중 하나
    """
    if style == "numbered":
        return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
    elif style == "comma":
        return ", ".join(items)
    else:  # bullet
        return "\n".join(f"- {item}" for item in items)

if __name__ == "__main__":
    mcp.run()
```

이렇게 하면 stdio 트랜스포트로 실행된다. Claude Desktop에 직접 연결할 때는 이 방식으로도 동작하지만, 네트워크를 통해 여러 클라이언트가 접속하려면 Streamable HTTP가 필요하다.

## Streamable HTTP 트랜스포트로 전환

```python
# server_http.py
from fastmcp import FastMCP

mcp = FastMCP("my-http-server")

@mcp.tool()
def get_word_count(text: str) -> dict:
    """텍스트 통계를 반환합니다."""
    words = text.split()
    return {
        "words": len(words),
        "characters": len(text),
        "lines": len(text.splitlines())
    }

@mcp.tool()
def format_list(items: list[str], style: str = "bullet") -> str:
    """목록을 지정 형식으로 변환합니다."""
    if style == "numbered":
        return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
    elif style == "comma":
        return ", ".join(items)
    return "\n".join(f"- {item}" for item in items)

if __name__ == "__main__":
    # Streamable HTTP로 실행: 기본 포트 8000
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
```

실행:

```bash
python server_http.py
# INFO:     Started server process [12345]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

기본 엔드포인트는 `http://localhost:8000/mcp/` 다. 이 경로는 `FastMCP` 초기화 시 `streamable_http_path` 파라미터로 변경할 수 있다.

## Claude Code에서 연동하기

Claude Code의 MCP 설정 파일(`~/.claude/settings.json`)에 추가:

```json
{
  "mcpServers": {
    "my-tools": {
      "transport": {
        "type": "streamable-http",
        "url": "http://localhost:8000/mcp/"
      }
    }
  }
}
```

Claude Code를 재시작하면 `my-tools` 서버에 등록된 도구들이 사용 가능해진다.

실제로 연결 테스트를 해보면 처음에는 CORS 에러가 나는 경우가 있다. FastMCP의 기본 CORS 설정이 `localhost` 출처만 허용하기 때문인데, 다음처럼 해결한다:

```python
from fastmcp import FastMCP

mcp = FastMCP(
    "my-http-server",
    # 개발 환경에서만 모든 출처 허용
    allowed_origins=["http://localhost:*"]
)
```

프로덕션에서는 와일드카드 대신 실제 Claude Code가 실행되는 호스트를 명시해야 한다.

## 실용적인 도구 구현 예제: GitHub 이슈 조회

개인적으로 가장 많이 쓰는 패턴은 외부 API를 MCP 도구로 감싸는 것이다. GitHub API를 예로 들면:

```python
import httpx
from fastmcp import FastMCP
import os

mcp = FastMCP("github-tools")

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

@mcp.tool()
async def get_open_issues(owner: str, repo: str, limit: int = 10) -> list[dict]:
    """
    GitHub 저장소의 열린 이슈 목록을 가져옵니다.

    Args:
        owner: 저장소 소유자 (예: 'anthropics')
        repo: 저장소 이름 (예: 'claude-code')
        limit: 가져올 이슈 수 (기본 10, 최대 30)
    """
    limit = min(limit, 30)
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/issues",
            headers=headers,
            params={"state": "open", "per_page": limit}
        )
        resp.raise_for_status()
        issues = resp.json()

    return [
        {
            "number": issue["number"],
            "title": issue["title"],
            "url": issue["html_url"],
            "labels": [l["name"] for l in issue.get("labels", [])],
            "created_at": issue["created_at"]
        }
        for issue in issues
    ]

if __name__ == "__main__":
    mcp.run(transport="streamable-http", port=8000)
```

FastMCP는 `async def`를 자동으로 인식해서 비동기로 처리한다. `httpx` 같은 비동기 HTTP 클라이언트를 사용하면 서버가 I/O 대기 중에 다른 요청을 처리할 수 있어 성능이 좋아진다.

Claude Code에서 이 도구를 써보면, "anthropics/claude-code 저장소의 열린 이슈 10개 보여줘"라고 자연어로 요청하면 AI가 `get_open_issues("anthropics", "claude-code", 10)`을 자동으로 호출한다.

## 도구 리소스(Resource) 추가하기

도구(Tool) 외에도 리소스(Resource)를 정의할 수 있다. 리소스는 정적이거나 반정적인 데이터를 AI에게 제공할 때 유용하다:

```python
@mcp.resource("config://app-settings")
def get_app_settings() -> str:
    """애플리케이션 설정 정보를 반환합니다."""
    return """
    환경: production
    API 버전: v2
    허용된 모델: claude-opus-4, claude-sonnet-4
    최대 토큰: 100000
    """
```

리소스는 도구와 달리 AI가 "읽기" 용도로 참조할 수 있는 컨텍스트 데이터다.

## 운영 시 주의사항

솔직히 말하면, Streamable HTTP MCP 서버를 프로덕션에 올리는 건 아직 주의가 필요한 영역이다.

[MCP 보안 위기 — 60일 만에 30개 CVE](/ko/blog/ko/mcp-security-crisis-30-cves-enterprise-hardening)에서 다룬 것처럼, MCP 생태계는 아직 보안 측면에서 성숙하지 않았다. 직접 서버를 만들 때 특히 주의할 점들:

**인증 미구현 위험**: FastMCP 기본 설정에는 인증이 없다. 내부망에서만 쓴다면 괜찮지만, 인터넷에 노출할 경우 반드시 API 키나 OAuth를 추가해야 한다.

```python
from fastmcp import FastMCP
from fastmcp.server.auth import BearerAuthProvider

auth = BearerAuthProvider(
    public_key="...",  # JWT 검증용 공개키
    issuer="https://auth.yourcompany.com"
)
mcp = FastMCP("secure-server", auth=auth)
```

**도구 입력 검증**: 사용자 입력을 직접 시스템 명령이나 쿼리로 전달하지 않도록 주의해야 한다. Pydantic 모델로 타입을 강제하면 기본적인 입력 검증이 된다.

**로깅**: 어떤 AI 에이전트가 어떤 도구를 언제 호출했는지 반드시 로깅해야 한다. [MCP Gateway — AI 에이전트의 도구 호출을 누가 통제하고 있는가](/ko/blog/ko/mcp-gateway-agent-traffic-control)에서 다룬 것처럼, 에이전트 트래픽 모니터링은 운영 필수 요건이다.

## 빠른 로컬 테스트 방법

서버가 제대로 동작하는지 `mcp` CLI로 바로 확인할 수 있다:

```bash
# mcp CLI 설치
pip install "mcp[cli]"

# inspector UI 열기 (브라우저에서 도구 직접 호출 가능)
mcp inspector server_http.py
```

`mcp inspector`를 쓰면 웹 UI에서 등록된 도구 목록을 확인하고, 파라미터를 직접 입력해서 테스트해볼 수 있다. Claude Code에 붙이기 전에 서버 로직을 검증하기 좋다.

## 정리

MCP 서버를 처음부터 만들어보면 "생각보다 간단하다"는 느낌을 받을 것이다. FastMCP 덕분에 데코레이터 몇 개로 도구를 등록하고 Streamable HTTP로 띄우는 데 30분이면 충분하다.

어렵다고 느끼는 부분은 사실 서버 자체보다 **도구 설계**다. AI가 실수하지 않도록 파라미터 타입과 docstring을 명확하게 쓰는 것, 에러를 AI가 이해할 수 있는 형태로 반환하는 것, 한 도구가 너무 많은 일을 하지 않도록 분리하는 것 — 이런 부분들이 실제로 체감되는 난이도다.

공식 MCP Python SDK 레포([github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk))에 다양한 예제가 있으니, 위 예제를 직접 실행해보고 나서 참고하면 좋을 것 같다.
