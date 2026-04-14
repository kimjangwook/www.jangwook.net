---
title: Building a Private MCP Server with Local LLM — Gemma 4 + FastMCP Fully Offline AI Tool Guide
description: >-
  How to build an offline AI tool pipeline with Ollama + Gemma 4 + FastMCP, no internet required.
  A hands-on implementation guide for using MCP tools in medical, legal, and financial environments
  where data cannot leave the premises.
pubDate: '2026-04-14'
heroImage: '../../../assets/blog/local-llm-private-mcp-server-gemma4-fastmcp-hero.jpg'
tags:
  - Ollama
  - FastMCP
  - Gemma4
  - LocalLLM
  - MCP
relatedPosts:
  - slug: mcp-server-build-practical-guide-2026
    score: 0.93
    reason:
      ko: 이 글에서 만든 FastMCP 서버의 구조를 더 깊이 이해하고 싶다면, FastMCP의 Streamable HTTP 트랜스포트와 Claude Code 연동까지 다룬 이전 글이 필수 선행 학습이다.
      ja: ここで構築するFastMCPサーバーの仕組みをより深く理解したいなら、Streamable HTTPトランスポートとClaude Code連携まで解説した前の記事が不可欠な予備知識だ。
      en: To deeply understand the FastMCP server we build here, the previous post covering Streamable HTTP transport and Claude Code integration is essential prerequisite reading.
      zh: 如果想深入理解本文构建的FastMCP服务器结构，之前那篇涵盖Streamable HTTP传输和Claude Code集成的文章是必读的先修内容。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.90
    reason:
      ko: Gemma 4가 함수 호출을 어느 수준까지 해내는지 직접 테스트한 결과가 있다. 이 글의 오케스트레이터가 Gemma 4 툴 콜링에 의존하는 만큼, 그 정확도 맥락을 알면 기대치 설정이 쉬워진다.
      ja: Gemma 4がどこまで関数呼び出しをこなせるか実際にテストした結果がある。このオーケストレーターがGemma 4のツールコーリングに依存している以上、その精度の文脈を知ると期待値設定が楽になる。
      en: There's hands-on test data showing how far Gemma 4's function calling actually goes. Since our orchestrator relies on Gemma 4 tool calling, understanding that accuracy context helps set realistic expectations.
      zh: 有实际测试数据显示Gemma 4的函数调用能做到哪种程度。由于我们的编排器依赖Gemma 4的工具调用，了解其准确度背景有助于设定合理预期。
  - slug: mcp-gateway-agent-traffic-control
    score: 0.82
    reason:
      ko: 이 글의 로컬 MCP 파이프라인을 팀 단위로 확장하려면, MCP Gateway로 에이전트 트래픽을 제어하는 방법이 다음 단계가 된다.
      ja: この記事のローカルMCPパイプラインをチーム単位でスケールさせたいなら、MCP Gatewayでエージェントトラフィックを制御する方法が次のステップになる。
      en: If you want to scale this local MCP pipeline to team level, controlling agent traffic with MCP Gateway becomes the natural next step.
      zh: 如果想将本文的本地MCP管道扩展到团队规模，使用MCP Gateway控制智能体流量将成为下一步。
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.78
    reason:
      ko: 로컬 환경이라고 MCP 보안 문제가 사라지지는 않는다. 30개의 CVE가 확인된 MCP 보안 위협과 강화 방법을 다룬 글에서 로컬 배포에서도 주의해야 할 벡터를 짚어볼 수 있다.
      ja: ローカル環境だからといってMCPのセキュリティ問題が消えるわけではない。30のCVEが確認されたMCPセキュリティ脅威と強化方法を扱った記事で、ローカルデプロイでも注意すべきベクターを確認できる。
      en: Being local doesn't make MCP security issues disappear. The post covering 30 confirmed CVEs in MCP threats and hardening methods shows attack vectors that still apply to local deployments.
      zh: 在本地环境并不意味着MCP安全问题消失了。那篇涵盖30个已确认CVE的MCP安全威胁和加固方法的文章，展示了本地部署中仍需注意的攻击向量。
  - slug: ggml-llamacpp-huggingface
    score: 0.75
    reason:
      ko: Ollama 말고 llama.cpp를 직접 쓰고 싶거나, GGUF 포맷의 다른 로컬 모델로 바꿔보고 싶다면, GGML과 llama.cpp 생태계를 다룬 이 글이 참고가 된다.
      ja: Ollamaではなくllama.cppを直接使いたい、またはGGUFフォーマットの別のローカルモデルに変えてみたいなら、GGMLとllama.cppのエコシステムを扱ったこの記事が参考になる。
      en: If you want to use llama.cpp directly instead of Ollama, or swap in a different local model in GGUF format, this post covering the GGML and llama.cpp ecosystem is a useful reference.
      zh: 如果想直接使用llama.cpp而不是Ollama，或者换用GGUF格式的其他本地模型，这篇介绍GGML和llama.cpp生态系统的文章是很好的参考。
---

"We work in an environment where cloud AI is not allowed" — I honestly didn't get that at first. Then I realized how many teams actually deal with hospital medical records, legal document review, or financial customer data analysis. Telling those teams to "just paste it into Claude or GPT" isn't an option.

Last week I wrote about [building an MCP server from scratch with FastMCP](/en/blog/en/mcp-server-build-practical-guide-2026). That post showed how to connect Claude Code as the client. Right after publishing, I got a question: "Can you use a local LLM as the client instead of Claude?"

Great question. And one I wanted to try myself.

This post is the answer. Using Ollama + Gemma 4 + FastMCP, I built a fully offline AI tool pipeline that works without any internet connection.

## The Architecture First

Standard MCP looks like this:

```
[Claude / GPT-4] ←→ [MCP Server] ←→ [Actual Tools]
```

The cloud LLM acts as the MCP client. The problem is that prompts and context flow through Anthropic's or OpenAI's servers.

What we're building is different:

```
[User Prompt]
      |
[Python Orchestrator]
   ↙             ↘
[Ollama:11434]   [FastMCP:8000]
(Gemma 4)        (Local Tools)
```

Everything runs locally. Ollama serves Gemma 4 as an OpenAI-compatible API, FastMCP acts as the tool server, and a Python orchestrator bridges the two.

## Step 1: Ollama + Gemma 4 Setup

As covered in [the Gemma 4 local setup post](/en/blog/en/gemma-4-local-agent-edge-ai), installation is one line:

```bash
ollama pull gemma4
```

Since we need function calling here, verify the model loads correctly:

```bash
ollama run gemma4 'Return this exact JSON: {"status": "ok"}'
```

If the output is valid JSON, you're ready. Ollama serves an OpenAI-compatible API at `http://localhost:11434` by default.

```bash
# Confirm Ollama API is running
curl http://localhost:11434/v1/models
```

## Step 2: FastMCP Server (Tool Provider)

We'll build a tool server that reads local files and lists directories. In real-world use, swap these for internal DB queries, internal API calls, or whatever your team needs.

```python
# local_tools_server.py
from fastmcp import FastMCP
import os

mcp = FastMCP("local-tools")

@mcp.tool()
def read_file(path: str) -> str:
    """Read and return the contents of a file at the given path."""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

@mcp.tool()
def list_directory(path: str = ".") -> list[str]:
    """Return the list of files in a directory."""
    return os.listdir(path)

@mcp.tool()
def write_summary(path: str, content: str) -> str:
    """Save a summary to a file."""
    summary_path = path.replace(".txt", "_summary.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"Saved: {summary_path}"

if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="127.0.0.1", port=8000)
```

```bash
pip install fastmcp uvicorn
python local_tools_server.py
```

The server starts at `http://127.0.0.1:8000`.

## Step 3: The Orchestrator

This is the key piece. Gemma 4 doesn't natively understand the MCP protocol. The orchestrator:
1. Fetches the available tool list from FastMCP
2. Converts it to OpenAI function calling format
3. Passes it to Gemma 4
4. When Gemma 4 requests a tool call, executes it against FastMCP and passes the result back

```python
# orchestrator.py
import json
import requests
from openai import OpenAI

# Ollama OpenAI-compatible client
llm = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # Ollama doesn't need a real key
)

MCP_SERVER = "http://127.0.0.1:8000"

def get_mcp_tools() -> list[dict]:
    """Fetch available tools from FastMCP and convert to OpenAI format."""
    resp = requests.get(f"{MCP_SERVER}/tools")
    tools = resp.json().get("tools", [])
    return [
        {
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t.get("description", ""),
                "parameters": t.get("inputSchema", {"type": "object", "properties": {}}),
            },
        }
        for t in tools
    ]

def call_mcp_tool(name: str, args: dict) -> str:
    """Execute a tool on the FastMCP server and return the result."""
    resp = requests.post(
        f"{MCP_SERVER}/tools/{name}",
        json={"arguments": args},
    )
    result = resp.json()
    return json.dumps(result.get("content", [{"text": str(result)}]))

def run(user_prompt: str) -> str:
    tools = get_mcp_tools()
    messages = [
        {"role": "system", "content": "You are a helpful AI. Use the provided tools when needed."},
        {"role": "user", "content": user_prompt},
    ]

    while True:
        resp = llm.chat.completions.create(
            model="gemma4",
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )
        msg = resp.choices[0].message

        if not msg.tool_calls:
            return msg.content  # Final answer

        # Handle tool calls
        messages.append(msg)
        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            result = call_mcp_tool(tc.function.name, args)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result,
            })

if __name__ == "__main__":
    answer = run("List the files in the current directory")
    print(answer)
```

## What Actually Happened

```bash
python orchestrator.py
```

Gemma 4 called `list_directory`, FastMCP returned the result, and Gemma 4 formatted it into a clean answer. All data stayed on my MacBook.

I pushed it with something more complex:

```python
answer = run("Read README.md and summarize the key points in 3 sentences")
```

Gemma 4 went `list_directory` → `read_file("README.md")`. Two tool calls, then a final summary. It took about 12 seconds on my M2 MacBook. Slow compared to a cloud API, but it never left my machine.

## Honest Limitations

Things I noticed running this for a while:

**Tool calling reliability is lower.** Gemma 4 [has function calling support](/en/blog/en/gemma-4-local-agent-edge-ai), but it occasionally passes wrong arguments or calls tools that don't exist. It's less stable than Claude or GPT-4o. To compensate, add retry logic and parameter validation in the orchestrator.

**Context loss in multi-step tasks.** After 3〜4 consecutive tool calls, Gemma 4 sometimes forgets the original goal. Explicitly writing "Final goal: [X]" in the system prompt helped.

**Speed.** Expect 5〜15 seconds on a personal Mac, more for longer responses. Not suitable for real-time interactive use. Batch processing and background jobs are the realistic use case.

## When to Use This Pattern

| Situation | Choice |
|-----------|--------|
| Personal data, internal docs, regulated data | ✅ This pattern |
| Fast responses for interactive UI | ❌ Cloud API |
| Air-gapped environment, no internet | ✅ This pattern |
| Complex multi-step agentic workflows | ⚠️ Limited feasibility |
| Cost minimization (zero API traffic) | ✅ This pattern |

Personally, I think of this as an upgrade to "local scripts with AI features." It puts a natural language interface on the file manipulation and data transformation tasks you'd previously do with shell scripts or Python scripts. It's closer to the next step in automation scripting than to a full agentic system.

## Next Steps

To take this further:
- **Swap the model**: Replace Gemma 4 with Qwen3-7B or Mistral Small for stronger function calling support
- **Expand tools**: Add internal DB connections, REST API wrappers, file conversion utilities
- **Team deployment**: Put MCP Gateway in front so multiple team members share the same local server

Before moving this to production, check [MCP security issues](/en/blog/en/mcp-security-crisis-30-cves-enterprise-hardening) too. Being local doesn't eliminate tool injection or excessive permission risks — those are MCP-level concerns that persist regardless of deployment environment.

All the code is above. Install everything with `pip install fastmcp uvicorn openai requests` and you're set. If anything breaks, test each step in isolation — that's faster than trying to debug the whole pipeline at once.
