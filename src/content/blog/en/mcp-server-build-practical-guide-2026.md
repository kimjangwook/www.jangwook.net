---
title: 'Building Your Own MCP Server — Implementing Real AI Tools with Streamable HTTP Transport'
description: 'A hands-on tutorial for building an MCP server from scratch using Python FastMCP. Covers Streamable HTTP transport setup, tool implementation, and Claude Code integration from real experience.'
pubDate: '2026-04-13'
heroImage: '../../../assets/blog/mcp-server-build-practical-guide-2026-hero.jpg'
tags: ['MCP', 'Python', 'AIAgents', 'FastMCP', 'Tutorial']
relatedPosts:
  - slug: 'mcp-servers-toolkit-introduction'
    score: 0.88
    reason:
      ko: 'MCP 서버 도구 모음을 소개한 이 글을 먼저 읽으면, 직접 서버를 만들어야 하는 이유가 더 명확해집니다.'
      ja: 'MCPサーバーツールの紹介記事を先に読むと、自分でサーバーを作る必要性がより明確になります。'
      en: 'Reading the MCP server toolkit overview first will help you understand why building your own server makes sense.'
      zh: '先阅读MCP服务器工具包介绍，可以更清楚地了解为何需要自己构建服务器。'
  - slug: 'mcp-gateway-agent-traffic-control'
    score: 0.82
    reason:
      ko: '직접 만든 MCP 서버를 프로덕션에 올릴 때, MCP Gateway로 트래픽을 제어하는 방법을 함께 보면 완성도가 높아집니다.'
      ja: '自作MCPサーバーを本番環境に投入する際、MCP Gatewayでトラフィックを制御する方法を合わせて読むと完成度が上がります。'
      en: 'When deploying your own MCP server to production, pairing it with MCP Gateway for traffic control rounds out the architecture.'
      zh: '将自制MCP服务器部署到生产环境时，结合MCP Gateway进行流量控制会让架构更完整。'
  - slug: 'mcp-open-standard-linux-foundation-engineering-guide'
    score: 0.79
    reason:
      ko: 'MCP가 Linux Foundation 표준이 된 배경을 이해하면, Streamable HTTP 트랜스포트 설계 결정의 맥락이 더 잘 보입니다.'
      ja: 'MCPがLinux Foundation標準になった経緯を理解すると、Streamable HTTPトランスポートの設計決定の背景がよく見えます。'
      en: 'Understanding why MCP joined the Linux Foundation adds context to the Streamable HTTP transport design decisions.'
      zh: '了解MCP加入Linux Foundation的背景，有助于理解Streamable HTTP传输层的设计决策。'
  - slug: 'mcp-security-crisis-30-cves-enterprise-hardening'
    score: 0.75
    reason:
      ko: 'MCP 서버를 직접 만든다면 보안 취약점 패턴을 미리 알아야 합니다. 30개 CVE 분석이 자작 서버 설계에 직접적으로 도움이 됩니다.'
      ja: 'MCPサーバーを自作するなら、セキュリティ脆弱性のパターンを事前に知っておく必要があります。30のCVE分析が自作サーバーの設計に直接役立ちます。'
      en: 'If you build your own MCP server, knowing the vulnerability patterns upfront is essential. The 30 CVE analysis directly informs server design choices.'
      zh: '自制MCP服务器时，提前了解安全漏洞模式至关重要。30个CVE分析直接指导服务器设计选择。'
  - slug: 'webmcp-chrome-146-ai-tool-server'
    score: 0.72
    reason:
      ko: 'Streamable HTTP 기반 MCP 서버를 만들고 나면, 브라우저 자체를 MCP 서버로 쓰는 WebMCP 개념과 비교해볼 만합니다.'
      ja: 'Streamable HTTPベースのMCPサーバーを作った後、ブラウザ自体をMCPサーバーとして使うWebMCPの概念と比較してみる価値があります。'
      en: 'After building your Streamable HTTP MCP server, comparing it with WebMCP — which turns the browser itself into an MCP server — is illuminating.'
      zh: '构建基于Streamable HTTP的MCP服务器后，可以与将浏览器本身用作MCP服务器的WebMCP概念进行比较。'
---

There's no shortage of articles about _using_ MCP servers. Guides to _building_ one from scratch are surprisingly rare.

The official docs exist, but since Streamable HTTP transport became the standard in late 2025, a lot of the older SSE (Server-Sent Events) examples are half-outdated. When I first followed one, I got stuck because there was no mention of installing `uvicorn` separately.

This guide is the result of working through that frustration. It covers <strong>building an MCP server that actually works as of 2026</strong>, focusing on Streamable HTTP transport setup and integration with Claude Code.

## Why build your own?

As covered in the [MCP Servers Toolkit Introduction](/en/blog/en/mcp-servers-toolkit-introduction), hundreds of public MCP servers already exist. So why build your own?

**Internal systems integration.** No public MCP server knows about your company's internal JIRA, build systems, or deployment pipelines.

**Fine-grained access control.** Public servers tend to be all-or-nothing. If you need tools accessible only to specific teams, or commands that run only in certain environments, you need to build it yourself.

**Complex composition logic.** When you want to combine multiple APIs into a single coherent "tool," it's often cleaner to build a new server than to fork and patch an existing one.

## Setup

```bash
# Python 3.11+ recommended
python --version

# Install FastMCP (high-level interface for the MCP Python SDK)
pip install fastmcp

# ASGI server required for Streamable HTTP transport
pip install uvicorn
```

FastMCP is the high-level API included in the `mcp` package. Using the low-level `Server` class directly is also possible, but FastMCP covers the majority of use cases without the boilerplate.

## Your first MCP server: minimal example

```python
# server.py
from fastmcp import FastMCP

mcp = FastMCP("my-first-server")

@mcp.tool()
def get_word_count(text: str) -> dict:
    """
    Returns word count, character count, and line count for a text string.

    Args:
        text: The text string to analyze
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
    Converts a list of strings into a formatted output.

    Args:
        items: List of strings to format
        style: One of 'bullet' (default), 'numbered', or 'comma'
    """
    if style == "numbered":
        return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
    elif style == "comma":
        return ", ".join(items)
    else:
        return "\n".join(f"- {item}" for item in items)

if __name__ == "__main__":
    mcp.run()
```

This runs with stdio transport — fine for direct Claude Desktop connections, but you need Streamable HTTP if multiple clients will connect over the network.

## Switching to Streamable HTTP transport

```python
# server_http.py
from fastmcp import FastMCP

mcp = FastMCP("my-http-server")

@mcp.tool()
def get_word_count(text: str) -> dict:
    """Returns text statistics."""
    words = text.split()
    return {
        "words": len(words),
        "characters": len(text),
        "lines": len(text.splitlines())
    }

@mcp.tool()
def format_list(items: list[str], style: str = "bullet") -> str:
    """Converts a list to a formatted string."""
    if style == "numbered":
        return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
    elif style == "comma":
        return ", ".join(items)
    return "\n".join(f"- {item}" for item in items)

if __name__ == "__main__":
    # Run with Streamable HTTP: default port 8000
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
```

Run it:

```bash
python server_http.py
# INFO:     Started server process [12345]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

The default endpoint is `http://localhost:8000/mcp/`. You can change this path via the `streamable_http_path` parameter in `FastMCP()`.

## Connecting to Claude Code

Add this to Claude Code's MCP config (`~/.claude/settings.json`):

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

Restart Claude Code and the tools from `my-tools` will be available.

One thing I ran into: CORS errors on first connect. FastMCP's default CORS only allows `localhost` origins, which can cause issues depending on how Claude Code makes requests:

```python
from fastmcp import FastMCP

mcp = FastMCP(
    "my-http-server",
    # Development-only setting
    allowed_origins=["http://localhost:*"]
)
```

In production, replace the wildcard with the actual host where Claude Code runs.

## Practical example: fetching GitHub Issues

The pattern I use most is wrapping external APIs as MCP tools. Here's a GitHub example:

```python
import httpx
from fastmcp import FastMCP
import os

mcp = FastMCP("github-tools")

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

@mcp.tool()
async def get_open_issues(owner: str, repo: str, limit: int = 10) -> list[dict]:
    """
    Fetches open issues from a GitHub repository.

    Args:
        owner: Repository owner (e.g., 'anthropics')
        repo: Repository name (e.g., 'claude-code')
        limit: Number of issues to fetch (default 10, max 30)
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

FastMCP automatically recognizes `async def` and handles it asynchronously. Using an async HTTP client like `httpx` means the server can handle other requests while waiting on I/O — important once you have multiple tools that hit external APIs.

In Claude Code, asking "show me the 10 most recent open issues in anthropics/claude-code" will automatically call `get_open_issues("anthropics", "claude-code", 10)`.

## Adding resources

Beyond tools, you can define resources — static or semi-static data for the AI to reference:

```python
@mcp.resource("config://app-settings")
def get_app_settings() -> str:
    """Returns application configuration context."""
    return """
    Environment: production
    API Version: v2
    Allowed models: claude-opus-4, claude-sonnet-4
    Max tokens: 100000
    """
```

Resources are read-only context that the AI can pull in, as opposed to tools which take action.

## Production considerations

I'll be honest: deploying a Streamable HTTP MCP server to production requires care.

As covered in [MCP Security Crisis — 30 CVEs in 60 Days](/en/blog/en/mcp-security-crisis-30-cves-enterprise-hardening), the MCP ecosystem is still maturing on the security front. Key things to watch when building your own server:

<strong>No authentication by default.</strong> FastMCP ships with no auth. Fine for internal networks, but if your server is internet-accessible, you need to add API key or OAuth validation:

```python
from fastmcp import FastMCP
from fastmcp.server.auth import BearerAuthProvider

auth = BearerAuthProvider(
    public_key="...",  # Public key for JWT verification
    issuer="https://auth.yourcompany.com"
)
mcp = FastMCP("secure-server", auth=auth)
```

<strong>Input validation.</strong> Don't pass user-controlled input directly to system commands or raw queries. Use Pydantic models to enforce types — that gives you basic validation essentially for free.

<strong>Logging.</strong> Track which AI agent called which tool, and when. As covered in [MCP Gateway — Who Controls Your Agent's Tool Calls](/en/blog/en/mcp-gateway-agent-traffic-control), monitoring agent traffic is a production requirement, not an optional extra.

## Local testing

The `mcp` CLI is the fastest way to verify your server works before connecting Claude Code:

```bash
# Install mcp CLI
pip install "mcp[cli]"

# Open the inspector UI in your browser
mcp inspector server_http.py
```

The inspector gives you a web UI where you can see registered tools and call them with custom parameters. I've found this invaluable for testing tool logic before wiring up the actual Claude Code connection.

## Takeaway

Building an MCP server from scratch feels surprisingly approachable once you try it. With FastMCP, you can register tools with a decorator and have a Streamable HTTP server running in under 30 minutes.

The real challenge isn't the server — it's <strong>tool design</strong>. Writing parameter types and docstrings clearly enough that the AI doesn't misuse them. Returning errors in a format the AI can reason about. Keeping tools focused on a single responsibility rather than cramming everything into one function. That's where most of the actual thinking goes.

The official MCP Python SDK repo ([github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)) has solid examples. I'd recommend getting the code above running first, then using it as a reference once you want to go further.
