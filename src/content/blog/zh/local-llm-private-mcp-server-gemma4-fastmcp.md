---
title: 用本地LLM构建私有MCP服务器 — Gemma 4 + FastMCP 完全离线AI工具指南
description: >-
  使用Ollama + Gemma 4 + FastMCP构建无需互联网的离线AI工具管道。适用于医疗、法律、金融环境中数据不能外发的实战实现指南。
pubDate: '2026-04-14'
heroImage: '../../../assets/blog/local-llm-private-mcp-server-gemma4-fastmcp-hero.jpg'
tags:
  - Ollama
  - FastMCP
  - Gemma4
  - 本地LLM
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

"在不允许使用云端AI的环境中工作" — 第一次听到这句话时，我老实说没什么感触。但实际上，处理医院病历、审查法律文件、分析金融客户数据的团队真的不少。对这些团队说"粘贴到Claude或GPT里试试"根本行不通。

上周我写了一篇[用FastMCP从零构建MCP服务器](/zh/blog/zh/mcp-server-build-practical-guide-2026)的文章，展示了如何将Claude Code作为客户端连接。文章发布后马上收到了一个问题："能用本地LLM代替Claude作为客户端吗？"

好问题。我也想试试。

这篇文章就是那个问题的答案。用Ollama + Gemma 4 + FastMCP，我构建了一个完全不需要互联网连接的离线AI工具管道。

## 先理清架构

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

正如[Gemma 4本地安装经验](/zh/blog/zh/gemma-4-local-agent-edge-ai)中所述，安装本身只需一行命令：

```bash
ollama pull gemma4
```

由于我们需要使用函数调用，先验证模型是否正确加载：

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

## Step 3：编排器实现

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

**工具调用可靠性较低。** Gemma 4[具备一定的函数调用支持](/zh/blog/zh/gemma-4-local-agent-edge-ai)，但偶尔会传入错误参数或调用不存在的工具。与Claude或GPT-4o相比稳定性较差。要弥补这一点，需要在编排器中添加重试逻辑和参数验证。

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

## 下一步

如果想进一步发展：
- **更换模型**：将Gemma 4替换为函数调用支持更强的Qwen3-7B、Mistral Small等模型
- **扩展工具**：添加内部DB连接、REST API包装器、文件转换工具
- **团队共享**：在前端部署MCP Gateway，让多人共享同一个本地服务器

将这个管道投入生产前，也请检查[MCP安全问题](/zh/blog/zh/mcp-security-crisis-30-cves-enterprise-hardening)。即使是本地部署，工具注入、过度权限等MCP特有的风险依然存在。

代码全部在上面。安装依赖只需`pip install fastmcp uvicorn openai requests`一条命令。如果运行时遇到问题，分步骤单独测试会比调试整个管道更快。
