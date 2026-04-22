---
title: 로컬 LLM으로 프라이빗 MCP 서버 구축하기 — Gemma 4 + FastMCP 완전 오프라인 AI 도구 가이드
description: >-
  Ollama + Gemma 4 + FastMCP로 인터넷 없이 동작하는 오프라인 AI 도구 파이프라인 구축법. 의료·법률·금융 환경에서
  데이터를 외부로 보내지 않고 MCP 도구를 사용하는 실전 구현 가이드.
pubDate: '2026-04-14'
heroImage: ../../../assets/blog/local-llm-private-mcp-server-gemma4-fastmcp-hero.jpg
tags:
  - Ollama
  - FastMCP
  - Gemma4
  - 로컬LLM
  - MCP
relatedPosts:
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.70
    reason:
      ko: '선행 학습 자료로 유용하며, AI/ML 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、AI/MLの基礎を扱います。
      en: 'Useful as prerequisite knowledge, covering AI/ML fundamentals.'
      zh: 作为先修知识很有用，涵盖AI/ML基础。
  - slug: prismml-bonsai-1bit-llm-edge-ai
    score: 0.70
    reason:
      ko: '선행 학습 자료로 유용하며, AI/ML 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、AI/MLの基礎を扱います。
      en: 'Useful as prerequisite knowledge, covering AI/ML fundamentals.'
      zh: 作为先修知识很有用，涵盖AI/ML基础。
  - slug: claude-code-source-leak-analysis
    score: 0.70
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: anthropic-emotion-concepts-llm-alignment
    score: 0.70
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: effloow-side-project-ai-company
    score: 0.70
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

"클라우드 AI를 쓰면 안 되는 환경에서 일한다"는 말을 처음 들었을 때, 나는 솔직히 와닿지 않았다. 그런데 병원 의무기록 처리, 법률 내부 문서 검토, 금융 고객 데이터 분석을 하는 팀이 실제로 꽤 많다. 이 팀들에게 "Claude나 GPT에 붙여넣기 해보세요"는 말이 안 된다.

지난주에 [FastMCP로 MCP 서버를 직접 만드는 글](/ko/blog/ko/mcp-server-build-practical-guide-2026)을 썼다. 그 글에서 Claude Code를 클라이언트로 연결하는 부분을 다뤘는데, 그 직후 받은 질문이 이것이었다: "Claude 대신 로컬 LLM을 클라이언트로 쓸 수 있을까요?"

이 글은 그 질문에 대한 답이다. Ollama + Gemma 4 + FastMCP로, 인터넷 연결 없이 완전히 오프라인에서 동작하는 AI 도구 파이프라인을 직접 구현해봤다.

## 구조를 먼저 잡자

표준 MCP 구조는 이렇다.

```
[Claude / GPT-4] ←→ [MCP Server] ←→ [실제 도구들]
```

클라우드 LLM이 MCP 클라이언트 역할을 한다. 문제는 이 경우 프롬프트와 컨텍스트가 Anthropic/OpenAI 서버를 거친다는 것이다.

우리가 만들 구조는 다르다.

```
[사용자 프롬프트]
        |
[Python 오케스트레이터]
   ↙            ↘
[Ollama:11434]   [FastMCP:8000]
(Gemma 4)        (로컬 도구들)
```

모든 것이 로컬에서 돈다. Ollama가 Gemma 4를 OpenAI 호환 API로 서빙하고, FastMCP가 도구 서버 역할을 하며, Python 오케스트레이터가 둘을 이어준다.

## Step 1: Ollama + Gemma 4 설정

[Gemma 4 로컬 설치 경험](/ko/blog/ko/gemma-4-local-agent-edge-ai)에서 다뤘듯, 설치 자체는 한 줄이다.

```bash
ollama pull gemma4
```

이 글에서는 함수 호출(function calling)을 써야 하므로, 모델이 제대로 로드됐는지 먼저 확인한다.

```bash
ollama run gemma4 "다음 JSON을 반환해줘: {\"status\": \"ok\"}"
```

출력이 올바른 JSON이면 준비 완료다. Ollama는 기본적으로 `http://localhost:11434`에서 OpenAI 호환 API를 서빙한다.

```bash
# Ollama API 동작 확인
curl http://localhost:11434/v1/models
```

## Step 2: FastMCP 서버 (도구 제공자)

로컬 파일 시스템을 읽고, 디렉토리를 나열하는 도구 서버를 만든다. 실제 업무에서는 사내 DB 쿼리, 사내 API 호출 등으로 바꿀 수 있다.

```python
# local_tools_server.py
from fastmcp import FastMCP
import os

mcp = FastMCP("local-tools")

@mcp.tool()
def read_file(path: str) -> str:
    """지정한 경로의 파일 내용을 읽어 반환한다."""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

@mcp.tool()
def list_directory(path: str = ".") -> list[str]:
    """디렉토리의 파일 목록을 반환한다."""
    return os.listdir(path)

@mcp.tool()
def write_summary(path: str, content: str) -> str:
    """요약 내용을 파일로 저장한다."""
    summary_path = path.replace(".txt", "_summary.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(content)
    return f"저장 완료: {summary_path}"

if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="127.0.0.1", port=8000)
```

```bash
pip install fastmcp uvicorn
python local_tools_server.py
```

서버가 `http://127.0.0.1:8000`에서 기동된다.

## Step 3: 오케스트레이터 구현

이 부분이 핵심이다. Gemma 4는 MCP 프로토콜을 직접 이해하지 못한다. 오케스트레이터가:
1. FastMCP에서 사용 가능한 도구 목록을 가져와
2. OpenAI function calling 형식으로 변환해
3. Gemma 4에 전달하고
4. Gemma 4가 툴 콜을 요청하면 FastMCP를 실행한 뒤 결과를 다시 전달한다

```python
# orchestrator.py
import json
import requests
from openai import OpenAI

# Ollama OpenAI 호환 클라이언트
llm = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # Ollama는 키 불필요, 형식만 맞추면 됨
)

MCP_SERVER = "http://127.0.0.1:8000"

def get_mcp_tools() -> list[dict]:
    """FastMCP에서 사용 가능한 도구 목록을 가져와 OpenAI 형식으로 변환."""
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
    """FastMCP 서버에 도구 실행을 요청하고 결과를 반환."""
    resp = requests.post(
        f"{MCP_SERVER}/tools/{name}",
        json={"arguments": args},
    )
    result = resp.json()
    return json.dumps(result.get("content", [{"text": str(result)}]), ensure_ascii=False)

def run(user_prompt: str) -> str:
    tools = get_mcp_tools()
    messages = [
        {"role": "system", "content": "당신은 도움이 되는 AI입니다. 필요한 경우 제공된 도구를 사용하세요."},
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
            return msg.content  # 최종 답변

        # 툴 콜 처리
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
    answer = run("현재 디렉토리의 파일 목록을 알려줘")
    print(answer)
```

## 실제로 돌려봤더니

```bash
python orchestrator.py
```

Gemma 4가 `list_directory` 도구를 호출하고, FastMCP 서버가 결과를 반환하고, Gemma 4가 그걸 정리해서 답변한다. 모든 데이터가 내 맥북 안에서만 움직인다.

조금 더 복잡한 요청을 해봤다.

```python
answer = run("README.md 파일을 읽고 핵심 내용을 3줄로 요약해줘")
```

Gemma 4는 `list_directory` → `read_file("README.md")` 순서로 호출했다. 두 번의 툴 콜을 거쳐 최종 요약을 생성했다. 오래 걸렸다(내 M2 맥북에서 약 12초). 클라우드 API에 비하면 느리다.

## 솔직한 한계

써보면서 느낀 것들이다.

**툴 콜링 신뢰도가 낮다.** Gemma 4는 [함수 호출을 어느 정도 지원](/ko/blog/ko/gemma-4-local-agent-edge-ai)하지만, 인자를 잘못 넣거나 없는 도구를 호출하는 경우가 간혹 있다. Claude나 GPT-4o 대비 안정성이 떨어진다. 이를 보완하려면 오케스트레이터에 재시도 로직과 파라미터 검증을 추가해야 한다.

**멀티스텝에서 맥락을 잃는다.** 3〜4번 이상 툴 콜이 이어지면 Gemma 4가 원래 목표를 잊는 경우가 있었다. 시스템 프롬프트에 명시적으로 "최종 목표: [X]"를 박아 넣는 게 도움이 됐다.

**속도.** 개인 맥북이면 5〜15초, 응답 길이에 따라 더 걸린다. 실시간 인터랙션에는 적합하지 않다. 배치 처리, 백그라운드 작업에 쓰는 게 현실적이다.

## 언제 이 구조를 써야 하는가

| 상황 | 선택 |
|------|------|
| 개인 데이터, 사내 문서, 규제 데이터 | ✅ 이 구조 |
| 빠른 응답이 필요한 인터랙티브 UI | ❌ 클라우드 API |
| 인터넷 연결이 없는 에어갭 환경 | ✅ 이 구조 |
| 복잡한 멀티스텝 에이전트 워크플로우 | ⚠️ 제한적으로 가능 |
| 비용 최소화 (트래픽 없음) | ✅ 이 구조 |

개인적으로는 이 구조를 "AI 기능이 있는 로컬 스크립트"의 업그레이드로 본다. 셸 스크립트나 Python 스크립트로 하던 파일 조작, 데이터 변환 작업에 자연어 인터페이스를 붙이는 용도다. 완전한 에이전트 시스템이라기보다는, 자동화 스크립트의 다음 단계에 가깝다.

## 다음 단계

더 발전시키고 싶다면:
- **모델 교체**: Gemma 4 대신 Qwen3-7B, Mistral Small 등 더 강력한 함수 호출 지원 모델로 교체
- **도구 확장**: 사내 DB 연결, REST API 래퍼, 파일 변환 도구 추가
- **팀 공유**: MCP Gateway를 앞단에 놓고 여러 사람이 같은 로컬 서버를 사용

이 파이프라인이 프로덕션으로 갈 때는, [MCP 보안 이슈](/ko/blog/ko/mcp-security-crisis-30-cves-enterprise-hardening)도 체크하길 권한다. 로컬이라도 툴 인젝션, 과도한 권한 같은 MCP 특유의 위험은 그대로 존재한다.

코드는 모두 위에 있다. 설치 의존성은 `pip install fastmcp uvicorn openai requests` 하나면 끝이다. 돌려보고 막히는 부분이 있으면 각 스텝별로 따로 테스트해보는 게 빠르다.
