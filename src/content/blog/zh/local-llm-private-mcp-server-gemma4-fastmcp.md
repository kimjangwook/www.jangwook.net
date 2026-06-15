---
title: 用本地LLM构建私有MCP服务器 — Gemma 4 + FastMCP 完全离线AI工具指南
description: 使用Ollama + Gemma 4 + FastMCP构建无需互联网的离线AI工具管道。适用于医疗、法律、金融环境中数据不能外发的实战实现指南。
pubDate: '2026-04-14'
heroImage: ../../../assets/blog/local-llm-private-mcp-server-gemma4-fastmcp-hero.jpg
tags:
  - Ollama
  - FastMCP
  - Gemma4
  - 本地LLM
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
  - question: "为什么用本地LLM + MCP架构而不是云端AI?"
    answer: "在处理医院病历、法律内部文件、金融客户数据等不能外发数据的环境中，粘贴到Claude或GPT本身就不是一个选项。这种架构将Ollama + Gemma 4 + FastMCP全部在本地运行，提示词和上下文不经过外部服务器，即使在无网络的隔离环境中也能工作。"
  - question: "Gemma 4能直接理解MCP协议吗?"
    answer: "不能。Gemma 4无法直接理解MCP协议。因此由Python编排器来衔接：它从FastMCP获取工具列表并转换为OpenAI函数调用格式传递给Gemma 4，当模型请求工具调用时在FastMCP上执行并将结果返回。"
  - question: "在本地运行时响应速度如何?"
    answer: "在个人M2 MacBook上，经过两次工具调用的摘要任务约花费12秒，通常在5〜15秒范围内，响应越长耗时越多。不适合实时交互场景，批处理和后台任务才是现实的使用场景。"
  - question: "这种架构有哪些局限性?"
    answer: "Gemma 4具备一定的函数调用支持，但偶尔会传入错误参数或调用不存在的工具，稳定性不如Claude或GPT-4o。此外连续3〜4次工具调用后有时会忘记最初的目标，因此添加重试逻辑和参数验证、并在系统提示词中明确写入最终目标会有帮助。"
---

"在不允许使用云端AI的环境中工作。"第一次听到这句话时，我老实说没什么感触。可后来真的接触下来，处理医院病历的团队、审查法律文件的团队、分析金融客户数据的团队，比我以为的多得多。对这些团队说"粘贴到Claude或GPT里试试"，从一开始就不是个选项。

上周我写了一篇[用FastMCP从零构建MCP服务器的文章](/zh/blog/zh/fastmcp-python-mcp-server-build-guide-2026)，展示了如何将Claude Code作为客户端连接。文章发布后马上收到了一个问题："能用本地LLM代替Claude作为客户端吗？"

好问题。我也想试试。

这篇文章就是那个问题的答案。用Ollama + Gemma 4 + FastMCP，我构建了一个完全不需要互联网连接的离线AI工具管道。用Ollama服务Gemma 4的运维层面，我在[Ollama + FastAPI 生产部署指南](/zh/blog/zh/ollama-fastapi-production-deployment-guide-2026)中讲得更深入，可以配合阅读。

> **先读一手资料。** 这里整理了本文用到的工具的官方参考。开始前请确认各项目当前推荐的配置。
> - Ollama 官方网站：[ollama.com](https://ollama.com)
> - FastMCP 官方文档：[gofastmcp.com](https://gofastmcp.com)
> - Model Context Protocol(MCP) 官方规范：[modelcontextprotocol.io](https://modelcontextprotocol.io)
> - Gemma 模型(Google DeepMind)：[deepmind.google/models/gemma](https://deepmind.google/models/gemma)

## 先看清数据流向哪里

标准MCP结构是这样的：

```
[Claude / GPT-4] ←→ [MCP服务器] ←→ [实际工具]
```

云端LLM充当MCP客户端。问题在于，这种情况下提示词和上下文会经过Anthropic或OpenAI的服务器。

我们要构建的结构不同：

```
[用户提示词]
      |
[Python编排器]
   ↙          ↘
[Ollama:11434]  [FastMCP:8000]
(Gemma 4)       (本地工具)
```

一切都在本地运行。Ollama将Gemma 4作为OpenAI兼容API提供服务，FastMCP充当工具服务器，Python编排器将两者连接起来。

## Step 1：Ollama + Gemma 4 配置

正如Gemma 4本地安装经验中所述，安装本身只需一行命令：

```bash
ollama pull gemma4
```

这里函数调用是关键。所以先验证一下模型是否正确加载：

```bash
ollama run gemma4 '请返回这个JSON: {"status": "ok"}'
```

如果输出是有效的JSON，准备工作完成。Ollama默认在`http://localhost:11434`提供OpenAI兼容API。

```bash
# 确认Ollama API正常运行
curl http://localhost:11434/v1/models
```

## Step 2：FastMCP服务器（工具提供方）

我们构建一个读取本地文件和列出目录的工具服务器。在实际使用中，可以替换为内部DB查询、内部API调用等。

```python
# local_tools_server.py
from fastmcp import FastMCP
import os

mcp = FastMCP("local-tools")

@mcp.tool()
def read_file(path: str) -> str:
    """读取指定路径的文件内容并返回。"""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

@mcp.tool()
def list_directory(path: str = ".") -> list[str]:
    """返回目录中的文件列表。"""
    return os.listdir(path)

@mcp.tool()
def write_summary(path: str, content: str) -> str:
    """将摘要内容保存到文件。"""
    summary_path = path.replace(".txt", "_summary.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"保存完成：{summary_path}"

if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="127.0.0.1", port=8000)
```

```bash
pip install fastmcp uvicorn
python local_tools_server.py
```

服务器在`http://127.0.0.1:8000`启动。

## Step 3：把两端粘起来的编排器

这是核心部分。Gemma 4无法直接理解MCP协议。编排器负责：
1. 从FastMCP获取可用工具列表
2. 转换为OpenAI函数调用格式
3. 传递给Gemma 4
4. 当Gemma 4请求工具调用时，在FastMCP上执行并将结果返回

```python
# orchestrator.py
import json
import requests
from openai import OpenAI

# Ollama OpenAI兼容客户端
llm = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # Ollama不需要真实密钥
)

MCP_SERVER = "http://127.0.0.1:8000"

def get_mcp_tools() -> list[dict]:
    """从FastMCP获取可用工具列表并转换为OpenAI格式。"""
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
    """向FastMCP服务器请求工具执行并返回结果。"""
    resp = requests.post(
        f"{MCP_SERVER}/tools/{name}",
        json={"arguments": args},
    )
    result = resp.json()
    return json.dumps(result.get("content", [{"text": str(result)}]), ensure_ascii=False)

def run(user_prompt: str) -> str:
    tools = get_mcp_tools()
    messages = [
        {"role": "system", "content": "你是一个有用的AI。需要时请使用提供的工具。"},
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
            return msg.content  # 最终回答

        # 处理工具调用
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
    answer = run("告诉我当前目录的文件列表")
    print(answer)
```

## 实际运行结果

```bash
python orchestrator.py
```

Gemma 4调用了`list_directory`工具，FastMCP服务器返回结果，Gemma 4整理后给出回答。所有数据都在我的MacBook内部流转。

我尝试了更复杂的请求：

```python
answer = run("读取README.md文件，用3句话总结核心内容")
```

Gemma 4按`list_directory` → `read_file("README.md")`的顺序调用。经过两次工具调用，生成了最终摘要。花了一些时间（M2 MacBook约12秒）。与云端API相比较慢，但数据从未离开我的机器。

## 坦诚的局限性

使用过程中注意到的问题：

**工具调用可靠性较低。** Gemma 4具备一定的函数调用支持，但偶尔会传入错误参数或调用不存在的工具。与Claude或GPT-4o相比稳定性较差。要弥补这一点，需要在编排器中添加重试逻辑和参数验证。

**多步骤中丢失上下文。** 连续3〜4次工具调用后，Gemma 4有时会忘记最初的目标。在系统提示词中明确写入"最终目标：[X]"有所帮助。

**速度问题。** 个人MacBook上需要5〜15秒，响应越长耗时越多。不适合实时交互场景，批处理和后台任务才是现实的使用场景。

## 何时使用这种架构

| 情况 | 选择 |
|------|------|
| 个人数据、内部文档、受监管数据 | ✅ 此架构 |
| 需要快速响应的交互式UI | ❌ 云端API |
| 无网络的隔离环境 | ✅ 此架构 |
| 复杂的多步骤智能体工作流 | ⚠️ 有限可行 |
| 最小化成本（零API流量） | ✅ 此架构 |

我个人将这种架构视为"带AI功能的本地脚本"的升级版。它为原本用Shell脚本或Python脚本完成的文件操作、数据转换任务提供了自然语言接口。与其说是完整的智能体系统，不如说更接近自动化脚本的下一步演进。

## 何时使用，何时避免

上面的表格用于快速判断，真正考虑是否落地时还需要更具体的标准。这是我运行几个月后划出的判断线。

**本地LLM + MCP适合的场景**

- **数据绝对不能外流的环境。** 诊疗记录、法律内部文档、金融客户信息等合规要求禁止外部传输的情况。此时云端API再聪明也根本不是选项。隔离环境下这个选择就更明确了。
- **批处理型任务。** 夜间分类内部文档、汇总日志、转换文件这类无人等待响应的作业。5〜15秒的延迟不成问题。
- **调用量大、成本有压力的重复任务。** 如果同类处理每天要跑数千次，把按token计费换成固定的本地硬件成本会更划算。
- **工具数量少、流程简单的场景。** 对于一两次工具调用就结束的任务，Gemma 4的函数调用足够好用。

**最好避免的场景**

- **实时交互式UI。** 对于用户盯着屏幕等答案的聊天机器人或搜索框，这种延迟会直接转化为流失。用云端API更合适。
- **复杂的多步骤智能体。** 在连续五六次工具调用的工作流中，Gemma 4丢失目标或弄错参数的频率会上升。需要稳定的函数调用时，Claude或GPT-4o仍然领先。
- **数据敏感度低的常规任务。** 如果数据外发也没问题，就没必要背上本地硬件和运维负担。云端API在质量和速度上通常更胜一筹。
- **以最新最强推理质量为关键指标时。** 本地开源模型进步很快，但与前沿模型的推理差距仍然存在。

判断的核心归根结底是两个维度："这份数据能不能外发"和"这个任务会不会让人等待"。两边都苛刻就用这种架构，两边都宽松就用云端。

## 下一步

如果想进一步发展：
- **更换模型**：将Gemma 4替换为函数调用支持更强的Qwen3-7B、Mistral Small等模型
- **扩展工具**：添加内部DB连接、REST API包装器、文件转换工具
- **团队共享**：在前端部署MCP Gateway，让多人共享同一个本地服务器

将这个管道投入生产前，也请检查MCP安全问题。即使是本地部署，工具注入、过度权限等MCP特有的风险依然存在。

代码全部在上面。安装依赖只需`pip install fastmcp uvicorn openai requests`一条命令。如果运行时遇到问题，分步骤单独测试会比调试整个管道更快。
