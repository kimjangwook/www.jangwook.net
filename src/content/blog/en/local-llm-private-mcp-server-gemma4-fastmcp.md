---
title: >-
  Building a Private MCP Server with Local LLM — Gemma 4 + FastMCP Fully Offline
  AI Tool Guide
description: >-
  Run an offline AI tool pipeline with Ollama, Gemma 4, and FastMCP, no internet
  needed. Built for medical, legal, and finance where data stays on the
  premises.
pubDate: '2026-04-14'
heroImage: ../../../assets/blog/local-llm-private-mcp-server-gemma4-fastmcp-hero.jpg
tags:
  - Ollama
  - FastMCP
  - Gemma4
  - LocalLLM
  - MCP
relatedPosts:
  - slug: fastmcp-python-mcp-server-build-guide-2026
    score: 0.9
    reason:
      ko: fastmcp 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into fastmcp.
      ja: fastmcpをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 fastmcp 主题。
  - slug: ollama-fastapi-production-deployment-guide-2026
    score: 0.85
    reason:
      ko: ollama를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on ollama experience.
      ja: ollamaを実際に扱った経験が続く記事です。
      zh: 延续 ollama 的实战经验。
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.8
    reason:
      ko: 같은 MCP 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same MCP track.
      ja: 同じMCPの流れで併せて読むと役立ちます。
      zh: 在同一 MCP 脉络中可一并阅读。
faq:
  - question: "Why use a local LLM + MCP setup instead of cloud AI?"
    answer: "In environments handling hospital medical records, internal legal documents, or financial customer data, pasting into Claude or GPT is never an option because data cannot leave the premises. This setup runs Ollama + Gemma 4 + FastMCP entirely locally, so prompts and context never flow through external servers, and it works even in air-gapped environments with no internet."
  - question: "Does Gemma 4 understand the MCP protocol directly?"
    answer: "No. Gemma 4 does not natively understand the MCP protocol. A Python orchestrator bridges the gap: it fetches the tool list from FastMCP, converts it to OpenAI function calling format, passes it to Gemma 4, and when the model requests a tool call it executes that call against FastMCP and passes the result back."
  - question: "How fast is it when running locally?"
    answer: "On a personal M2 MacBook, a summary task involving two tool calls took about 12 seconds, and responses generally fall in the 5 to 15 second range, longer for longer outputs. It is not suitable for real-time interactive use; batch processing and background jobs are the realistic use case."
  - question: "What are the limitations of this setup?"
    answer: "Gemma 4 supports function calling to some degree but occasionally passes wrong arguments or calls tools that do not exist, making it less stable than Claude or GPT-4o. It can also forget the original goal after 3 to 4 consecutive tool calls, so adding retry logic and parameter validation plus stating the final goal in the system prompt helps."
---

"We work in an environment where cloud AI is not allowed." I honestly didn't get that at first. Then I started meeting the teams who live with it: people handling hospital medical records, reviewing legal documents, analyzing financial customer data. There are more of them than I assumed. Telling those teams to "just paste it into Claude or GPT" was never going to fly.

Last week I wrote about [building an MCP server from scratch with FastMCP](/en/blog/en/fastmcp-python-mcp-server-build-guide-2026). That post showed how to connect Claude Code as the client. Right after publishing, I got a question: "Can you use a local LLM as the client instead of Claude?"

Great question. And one I wanted to try myself.

This post is the answer. Using Ollama + Gemma 4 + FastMCP, I built a fully offline AI tool pipeline that works without any internet connection. For the operational side of serving Gemma 4 with Ollama, my [Ollama + FastAPI production deployment guide](/en/blog/en/ollama-fastapi-production-deployment-guide-2026) goes deeper and pairs well with this.

> **Read the primary sources first.** Here are the official references for the tools used in this post. Check each project's current recommended setup before you start.
> - Ollama official site: [ollama.com](https://ollama.com)
> - FastMCP official docs: [gofastmcp.com](https://gofastmcp.com)
> - Model Context Protocol (MCP) official spec: [modelcontextprotocol.io](https://modelcontextprotocol.io)
> - Gemma models (Google DeepMind): [deepmind.google/models/gemma](https://deepmind.google/models/gemma)

## Tracing Where the Data Goes

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

As covered in the Gemma 4 local setup post, installation is one line:

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

## Step 3: The Orchestrator That Glues It Together

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

**Tool calling reliability is lower.** Gemma 4 has function calling support, but it occasionally passes wrong arguments or calls tools that don't exist. It's less stable than Claude or GPT-4o. To compensate, add retry logic and parameter validation in the orchestrator.

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

## When to Use It, When to Avoid It

The table above is for a quick gut check. When you're actually deciding whether to adopt this, you need sharper criteria. Here's the line I've drawn after running it for a few months.

**Cases where local LLM + MCP fits well**

- **Data that absolutely cannot leave the premises.** Medical records, internal legal documents, financial customer data, anywhere compliance blocks external transmission. Here a smarter cloud API isn't even on the table. Air-gapped environments make the choice obvious.
- **Batch-style work.** Classifying internal documents overnight, summarizing logs, converting files, anything where nobody is waiting on the response. A 5 to 15 second delay doesn't matter.
- **Repetitive, high-volume work where API cost adds up.** If you run the same kind of processing thousands of times a day, trading per-token pricing for fixed local hardware cost can pay off.
- **Few tools and a simple flow.** For tasks that finish in one or two tool calls, Gemma 4's function calling is good enough.

**Cases where you should avoid it**

- **Real-time interactive UI.** For a chatbot or search box where the user is staring at the screen, that latency turns straight into churn. A cloud API is the better call.
- **Complex multi-step agents.** In workflows chaining five or six tool calls, Gemma 4 loses the goal or botches arguments more often. When you need reliable function calling, Claude or GPT-4o is still ahead.
- **General tasks with low data sensitivity.** If the data is fine to send out, there's little reason to take on the local hardware and operational burden. Cloud APIs usually win on quality and speed.
- **When top-tier reasoning quality is the key metric.** Local open models are improving fast, but a reasoning gap with frontier models still exists.

It really comes down to two axes: can this data leave the building, and does this task make a person wait. If both answers are tight, this pattern fits. If both are relaxed, go cloud.

## Next Steps

To take this further:
- **Swap the model**: Replace Gemma 4 with Qwen3-7B or Mistral Small for stronger function calling support
- **Expand tools**: Add internal DB connections, REST API wrappers, file conversion utilities
- **Team deployment**: Put MCP Gateway in front so multiple team members share the same local server

Before moving this to production, check MCP security issues too. Being local doesn't eliminate tool injection or excessive permission risks — those are MCP-level concerns that persist regardless of deployment environment.

All the code is above. Install everything with `pip install fastmcp uvicorn openai requests` and you're set. If anything breaks, test each step in isolation — that's faster than trying to debug the whole pipeline at once.
