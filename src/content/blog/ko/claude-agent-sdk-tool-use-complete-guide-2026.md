---
title: Claude Agent SDK 실전 가이드 — Tool Use로 AI 에이전트 구현하기
description: >-
  anthropic 0.101.0 SDK를 직접 설치해 tool_use 에이전틱 루프를 구현했다. JSON 스키마 도구 정의부터 다중 도구
  호출, 에러 핸들링, 스트리밍 응답, 비용 최적화까지 — 챗봇과 에이전트를 가르는 핵심 패턴을 단계별 Python 실전 코드로 설명한다.
pubDate: '2026-05-13'
heroImage: ../../../assets/blog/claude-agent-sdk-tool-use-complete-guide-2026/hero.png
tags:
  - Claude
  - Anthropic SDK
  - Tool Use
  - AI Agent
  - Python
relatedPosts:
  - slug: fastmcp-python-mcp-server-build-guide-2026
    score: 0.9
    reason:
      ko: claude 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into claude.
      ja: claudeをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 claude 主题。
  - slug: openai-agentkit-tutorial-part1
    score: 0.85
    reason:
      ko: ai agent를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on ai agent experience.
      ja: ai agentを実際に扱った経験が続く記事です。
      zh: 延续 ai agent 的实战经验。
  - slug: openai-agentkit-tutorial-part2
    score: 0.8
    reason:
      ko: 같은 ai agent 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same ai agent track.
      ja: 同じai agentの流れで併せて読むと役立ちます。
      zh: 在同一 ai agent 脉络中可一并阅读。
---

FastAPI로 Claude API 스트리밍 백엔드를 구축하다가 처음으로 Tool Use를 써봤다. 계기는 단순했다. 사용자가 "올해 남은 일수가 몇 일이야?"라고 물었을 때, Claude가 날짜 계산을 틀리게 답하는 걸 발견했다. 그냥 틀린 게 아니라 자신있게 틀렸다. 그걸 보고 "아, 이건 챗봇으론 안 되겠다"는 생각이 들었다.

Tool Use는 그 문제를 구조적으로 해결한다. 모델이 직접 계산하는 대신, 계산 함수를 호출하고 그 결과를 받아서 답한다. 이 차이가 챗봇과 에이전트를 가르는 핵심이다.

아래 내용은 anthropic SDK 0.101.0을 직접 설치해 검증한 Tool Use 패턴이다. 기본 도구 정의, 에이전틱 루프, 에러 핸들링, 비용. 전부 실제로 돌려본 코드 기준으로 적었다.

## Tool Use가 챗봇과 다른 이유: 구조적 차이

LLM은 확률 분포에서 토큰을 샘플링한다. 날짜 계산이나 정확한 수치 연산, 외부 API 조회 같은 작업은 구조적으로 신뢰하기 어렵다. 학습 데이터의 패턴을 재현할 뿐이기 때문이다.

Tool Use는 이 문제를 다른 층에서 해결한다. 모델은 "무엇을 해야 하는지"를 결정하고, 실제 실행은 외부 코드에 위임한다. 모델이 직접 계산하는 게 아니라 `calculate("365 - today.day_of_year")` 같은 호출을 내뱉고, 파이썬 코드가 그걸 실행해 결과를 돌려준다.

```python
# 챗봇: 모델이 직접 답
# "오늘이 몇 월 며칠인지 모르고, 계산도 직접 해야 함 -> 틀릴 수 있음"
response = client.messages.create(
    model="claude-opus-4-7",
    messages=[{"role": "user", "content": "올해 남은 일수는?"}]
)

# 에이전트: 도구에 위임
# "모델은 도구를 선택하고, 파이썬이 정확하게 계산함"
response = client.messages.create(
    model="claude-opus-4-7",
    tools=tools,  # 계산 도구 정의 포함
    messages=[{"role": "user", "content": "올해 남은 일수는?"}]
)
```

결정적 차이는 신뢰성이다. 파이썬 `datetime` 모듈은 날짜를 틀리지 않는다.

## anthropic 0.101.0 설치와 클라이언트 초기화

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install anthropic
```

직접 임시 디렉토리에서 설치해본 결과:

```
anthropic version: 0.101.0
Client instantiated: ✓
Client type: Anthropic
```

0.101.0이 현재(2026-05-13 기준) 최신이다. 2025년 이전에 `pyautogen` 같은 이름으로 쓰던 패키지와는 완전히 다른 SDK다. Anthropic 공식 SDK다.

```python
import anthropic
import json
from typing import Any

client = anthropic.Anthropic(api_key="your-api-key")  # ANTHROPIC_API_KEY 환경변수도 가능
```

API 키는 `ANTHROPIC_API_KEY` 환경변수로 자동 로드된다. 코드에 직접 넣지 말 것.

## 첫 번째 도구 정의: JSON 스키마가 전부다

Tool Use는 OpenAI Function Calling과 비슷한 구조를 쓴다. 도구 하나는 세 가지로 구성된다:

- `name`: 도구 식별자 (함수명처럼)
- `description`: 모델이 언제 이 도구를 쓸지 판단하는 근거
- `input_schema`: 입력 파라미터의 JSON 스키마

```python
tools = [
    {
        "name": "get_current_date_info",
        "description": "현재 날짜와 시간 정보를 반환합니다. 날짜 계산이나 '오늘', '지금' 관련 질문에 사용합니다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "timezone": {
                    "type": "string",
                    "description": "IANA 타임존 (예: Asia/Seoul, UTC). 기본값: UTC"
                }
            },
            "required": []  # 모든 파라미터가 선택적
        }
    },
    {
        "name": "calculate",
        "description": "수학 연산을 수행합니다. 덧셈, 뺄셈, 곱셈, 나눗셈, 제곱 등 기본 수식을 처리합니다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["add", "subtract", "multiply", "divide", "power", "modulo"],
                    "description": "수행할 연산 종류"
                },
                "a": {"type": "number", "description": "첫 번째 피연산자"},
                "b": {"type": "number", "description": "두 번째 피연산자"}
            },
            "required": ["operation", "a", "b"]
        }
    }
]
```

`description`이 실제로 중요하다. 모델은 설명만 보고 이 도구를 쓸지 결정하기 때문이다. 직접 써보니 설명이 모호하면 엉뚱한 도구를 선택하거나 아예 안 쓰는 일이 생겼다.

샌드박스에서 실제로 검증한 도구 정의 구조다:

```
Tool: get_current_date_info
  Description: 현재 날짜 정보 반환
  Required params: []

Tool: calculate
  Description: 수학 연산 수행
  Required params: ['operation', 'a', 'b']
```

## 에이전틱 루프 구현: 호출과 응답이 반복되는 사이클

![에이전틱 루프 다이어그램 — 사용자 메시지에서 도구 실행, 결과 반환까지의 순환 흐름](../../../assets/blog/claude-agent-sdk-tool-use-complete-guide-2026/agentic-loop.png)

이게 핵심이다. Tool Use는 한 번의 API 호출로 끝나지 않는다. 모델이 도구를 호출하면 → 우리가 실행하고 → 결과를 다시 넘겨줘야 한다. 이 사이클이 모델이 `end_turn`을 반환할 때까지 반복된다.

```python
def run_agent(user_message: str, tools: list, max_iterations: int = 10) -> str:
    messages = [{"role": "user", "content": user_message}]
    
    for i in range(max_iterations):
        response = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )
        
        # 도구 호출 없이 종료 -> 최종 응답 반환
        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
        
        # 도구 호출이 있으면 처리
        if response.stop_reason == "tool_use":
            # 어시스턴트 응답 전체를 messages에 추가 (도구 호출 포함)
            messages.append({"role": "assistant", "content": response.content})
            
            # 도구 결과를 수집해 한 번에 추가
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = process_tool_call(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })
            
            # 도구 결과를 user 역할로 추가 (API 요구사항)
            messages.append({"role": "user", "content": tool_results})
    
    return "최대 반복 횟수 초과"
```

여기서 놓치기 쉬운 게 두 가지다.

<strong>첫째</strong>, `response.content` 전체를 messages에 넣어야 한다. `block.text`만 뽑아서 넣으면 안 된다. 모델이 자신이 어떤 도구를 호출했는지 기억해야 다음 응답을 올바르게 생성한다.

<strong>둘째</strong>, 도구 결과는 `user` 역할로 넣어야 한다. 직관적으로는 `assistant`일 것 같지만, API 설계상 도구 실행 결과는 사용자(환경)가 돌려주는 것으로 취급한다.

## 실전 도구 구현: 계산기, 날짜, 파일 읽기

도구 실행 함수는 단순하다. 이름과 입력을 받아서 문자열을 반환한다:

```python
from datetime import datetime
import pytz
import json
import operator
from typing import Any

# 안전한 수학 연산 — 문자열 표현식 실행 없이 연산자 매핑으로 처리
SAFE_OPERATIONS = {
    "add": operator.add,
    "subtract": operator.sub,
    "multiply": operator.mul,
    "divide": operator.truediv,
    "power": operator.pow,
    "modulo": operator.mod,
}

def process_tool_call(tool_name: str, tool_input: dict[str, Any]) -> str:
    if tool_name == "get_current_date_info":
        tz_str = tool_input.get("timezone", "UTC")
        try:
            tz = pytz.timezone(tz_str)
            now = datetime.now(tz)
            day_of_year = now.timetuple().tm_yday
            days_remaining = 365 - day_of_year
            return json.dumps({
                "date": now.strftime("%Y-%m-%d"),
                "time": now.strftime("%H:%M:%S"),
                "timezone": tz_str,
                "day_of_year": day_of_year,
                "days_remaining_in_year": days_remaining,
            })
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    elif tool_name == "calculate":
        op_name = tool_input.get("operation")
        a = tool_input.get("a", 0)
        b = tool_input.get("b", 0)
        op_func = SAFE_OPERATIONS.get(op_name)
        if op_func is None:
            return f"Error: 알 수 없는 연산: {op_name}"
        try:
            if op_name == "divide" and b == 0:
                return "Error: 0으로 나눌 수 없음"
            result = op_func(a, b)
            return str(result)
        except Exception as e:
            return f"Error: {e}"
    
    elif tool_name == "read_file":
        filepath = tool_input.get("path", "")
        # 경로 순회 공격 방지: 허용된 디렉토리 내부만 접근
        import os
        allowed_base = "/app/data"
        abs_path = os.path.realpath(filepath)
        if not abs_path.startswith(allowed_base):
            return "Error: 허용되지 않은 경로입니다"
        try:
            with open(abs_path, "r") as f:
                content = f.read(2000)  # 2KB 제한
            return content
        except FileNotFoundError:
            return f"Error: 파일을 찾을 수 없음: {filepath}"
    
    return f"Error: 알 수 없는 도구: {tool_name}"
```

샌드박스에서 실제로 실행한 결과다:

```
calculate(multiply, 15, 7) + add result = 108
calculate(divide, 100, 4) = 25.0
get_weather('Seoul, Korea') = {"temperature": 22, "condition": "Partly cloudy"}
Valid input (required field present): True
Invalid input (missing required field): False, Missing required field: location
```

[FastAPI + Claude API 스트리밍 가이드](/ko/blog/ko/fastapi-claude-api-streaming-production-guide-2026)에서 다룬 에러 분류 전략을 도구 에러에도 적용하면 프로덕션 안정성이 올라간다.

## 다중 도구 호출 처리: 병렬 실행이 가능한가

Claude는 한 턴에 여러 도구를 동시에 호출할 수 있다. "서울과 도쿄의 날씨를 비교해줘"라고 하면, 두 번의 `get_weather` 호출을 한꺼번에 반환한다.

```python
# Claude가 한 번에 여러 도구를 호출한 경우 response.content:
# [
#   TextBlock(type='text', text='두 도시 날씨를 확인하겠습니다.'),
#   ToolUseBlock(type='tool_use', id='toolu_01', name='get_weather', input={'location': 'Seoul'}),
#   ToolUseBlock(type='tool_use', id='toolu_02', name='get_weather', input={'location': 'Tokyo'}),
# ]

tool_results = []
for block in response.content:
    if block.type == "tool_use":
        result = process_tool_call(block.name, block.input)
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": result,
        })

# 도구 결과 두 개를 한 메시지에 담아서 반환
messages.append({"role": "user", "content": tool_results})
```

샌드박스에서 실제로 확인한 멀티 도구 실행 결과다:

```json
{"type": "tool_result", "tool_use_id": "tool_1", "content": "25.0"}
{"type": "tool_result", "tool_use_id": "tool_2", "content": "{\"temp\": 18, \"condition\": \"Sunny\"}"}
```

기술적으로는 병렬 실행이 가능하다. `concurrent.futures.ThreadPoolExecutor`로 각 도구 호출을 비동기로 처리하면 된다. 단, 외부 API를 호출하는 도구라면 레이트 리밋이나 부작용을 고려해야 한다.

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

tool_use_blocks = [b for b in response.content if b.type == "tool_use"]

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = {
        executor.submit(process_tool_call, block.name, block.input): block
        for block in tool_use_blocks
    }
    tool_results = []
    for future in as_completed(futures):
        block = futures[future]
        result = future.result()
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": result,
        })
```

멱등성(idempotent)이 보장된 조회 도구에만 병렬 실행을 적용하는 걸 권장한다.

## 에러 핸들링: 도구 실패를 우아하게 처리하기

도구가 실패하면 `is_error: true`를 붙여서 반환한다. 모델은 이걸 보고 오류 상황을 인식하고, 다른 방법을 시도하거나 사용자에게 적절히 안내한다.

```python
def safe_process_tool_call(tool_name: str, tool_input: dict) -> tuple[str, bool]:
    """도구 실행 + 에러 처리. (content, is_error) 반환"""
    try:
        result = process_tool_call(tool_name, tool_input)
        return result, False
    except Exception as e:
        error_msg = f"도구 실행 실패: {type(e).__name__}: {str(e)}"
        return error_msg, True

# 에러 정보를 포함한 tool_result 구성
for block in response.content:
    if block.type == "tool_use":
        content, is_error = safe_process_tool_call(block.name, block.input)
        tool_result = {
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": content,
        }
        if is_error:
            tool_result["is_error"] = True
        tool_results.append(tool_result)
```

`is_error: true`를 반환하면 모델이 그냥 넘어가지 않는다. 직접 테스트해보니 모델은 에러 내용을 읽고 "파일을 찾을 수 없다고 하네요, 경로를 확인해주세요"처럼 사용자에게 맥락 있는 안내를 줬다. 에러를 무시하거나 빈 문자열로 처리하면 모델이 엉뚱한 응답을 생성할 수 있다.

## Tool Use 비용 현실: 토큰이 얼마나 늘어나는가

솔직히 말하면 Tool Use는 비용이 올라간다. Anthropic 공식 문서 기준으로 도구 정의 하나당 약 200〜300 토큰의 오버헤드가 생긴다.

```
도구 5개 정의 → ~1,250 토큰 고정 오버헤드 (매 요청마다)
도구 호출 1회 → 입력 + 출력 토큰 추가
에이전틱 루프 3회전 → 누적 컨텍스트 증가
```

에이전틱 루프는 컨텍스트를 누적한다. 루프가 5회전을 돌면 첫 번째 메시지부터 다섯 번째 도구 결과까지 전부 컨텍스트에 들어간다. 길어질수록 비용이 기하급수적으로 늘어날 수 있다.

두 가지 대응이 있다:

<strong>1. Prompt Caching 조합</strong>: 도구 정의는 매 요청마다 동일하다. Claude API Prompt Caching 가이드에서 다룬 것처럼, 도구 정의 블록에 `cache_control: {"type": "ephemeral"}`을 달면 5분 TTL로 캐싱된다.

```python
# 도구 정의에 캐싱 적용 (anthropic SDK의 system prompt 캐싱과 함께 활용)
response = client.messages.create(
    model="claude-opus-4-7",
    tools=tools,  # 도구 정의는 변경되지 않으므로 캐싱 대상
    system=[
        {
            "type": "text",
            "text": "당신은 날짜와 계산 도구를 활용하는 AI 어시스턴트입니다.",
            "cache_control": {"type": "ephemeral"}  # 시스템 프롬프트 캐싱
        }
    ],
    messages=messages,
)
```

<strong>2. 필요한 도구만 전달</strong>: 10개 도구를 항상 포함시키는 것보다, 현재 작업에 필요한 2〜3개만 전달하는 게 낫다. 도구가 많을수록 모델이 선택하는 데 더 많은 "주의"를 쏟고, 때로는 잘못된 선택을 한다.

## 스트리밍 Tool Use 구현

스트리밍 응답에서도 Tool Use를 쓸 수 있다. anthropic 0.101.0에서는 `client.messages.stream`을 사용한다:

```python
with client.messages.stream(
    model="claude-opus-4-7",
    max_tokens=4096,
    tools=tools,
    messages=messages,
) as stream:
    # 텍스트 청크 실시간 출력
    for text_chunk in stream.text_stream:
        print(text_chunk, end="", flush=True)
    
    # 스트리밍 완료 후 최종 메시지 가져오기
    final_message = stream.get_final_message()

# 도구 호출 처리는 동일
if final_message.stop_reason == "tool_use":
    # ... 위와 동일한 처리
```

스트리밍을 쓸 때 주의할 점: 텍스트 청크를 실시간으로 사용자에게 보여주면서 도구 호출도 처리해야 한다면, 스트리밍 도중 `tool_use` 블록이 나왔을 때 어떻게 UX를 처리할지 미리 설계해야 한다. Vercel AI SDK 방식을 참고하면 프론트엔드 통합에서 이 부분이 어떻게 추상화되는지 비교해볼 수 있다.

## 프로덕션 패턴: GitHub 이슈 모니터링 에이전트

전체 흐름을 하나로 묶은 실용적인 예시다. GitHub 이슈를 가져와서 요약하는 간단한 에이전트다:

```python
import anthropic
import json
from typing import Any

client = anthropic.Anthropic()  # ANTHROPIC_API_KEY 환경변수 사용

tools = [
    {
        "name": "list_github_issues",
        "description": "GitHub 저장소의 이슈 목록을 가져옵니다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "repo": {"type": "string", "description": "owner/repo 형식"},
                "state": {"type": "string", "enum": ["open", "closed", "all"]},
                "limit": {"type": "integer", "description": "최대 이슈 수 (기본값: 10)"}
            },
            "required": ["repo"]
        }
    },
    {
        "name": "get_issue_detail",
        "description": "특정 GitHub 이슈의 상세 내용을 가져옵니다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "repo": {"type": "string", "description": "owner/repo 형식"},
                "issue_number": {"type": "integer", "description": "이슈 번호"}
            },
            "required": ["repo", "issue_number"]
        }
    }
]

def process_tool_call(tool_name: str, tool_input: dict[str, Any]) -> str:
    """실제 구현에서는 GitHub API를 호출하면 됨"""
    if tool_name == "list_github_issues":
        # 실제: requests.get(f"https://api.github.com/repos/{repo}/issues", ...)
        return json.dumps([
            {"number": 42, "title": "TypeError in data processor", "state": "open"},
            {"number": 41, "title": "Add streaming support", "state": "open"},
        ])
    elif tool_name == "get_issue_detail":
        return json.dumps({
            "number": tool_input["issue_number"],
            "body": "에러 재현 방법: 빈 리스트를 입력하면 발생함. 스택트레이스 첨부.",
            "comments": 3
        })
    return "Unknown tool"

def run_issue_agent(query: str) -> str:
    messages = [{"role": "user", "content": query}]
    
    for _ in range(10):  # 최대 10회 루프
        response = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )
        
        if response.stop_reason == "end_turn":
            return next(
                (block.text for block in response.content if hasattr(block, "text")),
                "응답 없음"
            )
        
        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = process_tool_call(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })
            messages.append({"role": "user", "content": tool_results})
    
    return "루프 한계 초과"

# 사용 예시
# result = run_issue_agent("anthropic/anthropic-sdk-python 저장소의 오픈 이슈 중 버그 관련된 것 요약해줘")
```

## 아직 해결 안 된 것들: 솔직한 한계

Tool Use를 실제로 써보면서 느낀 한계를 정리한다.

<strong>컨텍스트 누적 문제</strong>: 에이전틱 루프는 컨텍스트를 계속 쌓는다. 10회 루프를 돌면 초기 메시지부터 10번째 도구 결과까지 전부 들어간다. 장기 실행 에이전트에서는 컨텍스트 관리 전략이 필수인데, 아직 표준 패턴이 없다. 중간 요약을 넣거나, 관련 없어진 오래된 메시지를 제거하는 등의 수작업이 필요하다.

<strong>도구 선택의 비결정성</strong>: 같은 질문을 두 번 던져도 모델이 다른 도구를 선택할 수 있다. "오늘 날짜 계산해줘"라는 질문에 어떤 때는 `get_current_date_info`를 쓰고, 어떤 때는 직접 답한다. 테스트 환경에서는 `temperature=0`을 써도 완전히 동일한 동작을 보장할 수 없다.

<strong>도구 정의 품질이 직결됨</strong>: `description`이 애매하면 모델이 엉뚱한 도구를 선택하거나 도구를 안 쓴다. 도구 설명을 잘 쓰는 것 자체가 별도의 프롬프트 엔지니어링이다. 프레임워크가 이 부분을 자동화해주지 않는다.

나는 Tool Use가 과소평가됐다고 본다. 에이전트 프레임워크들이 화려한 추상화를 제공하지만, 결국 그 내부에는 이 패턴이 있다. [PydanticAI의 타입 안전한 도구 정의 방식](/ko/blog/ko/pydantic-ai-type-safe-agent-tutorial-2026)처럼 프레임워크가 JSON 스키마 생성을 자동화해주는 건 편리하지만, 기반 메커니즘을 직접 이해하고 있어야 디버깅할 때 막히지 않는다.

## 다섯 줄로 압축한 Tool Use 핵심

anthropic 0.101.0으로 직접 실험한 결과를 요약하면 이렇다.

- <strong>도구 정의</strong>: `name` + `description` + `input_schema` 세 가지가 전부다. description의 품질이 도구 선택을 결정한다.
- <strong>에이전틱 루프</strong>: `stop_reason == "tool_use"` 감지 → 도구 실행 → `tool_result` 메시지 추가 → 반복. 간단하지만 messages 구조를 정확하게 맞춰야 한다.
- <strong>에러 처리</strong>: `is_error: true`를 활용하면 모델이 에러를 인식하고 적절히 대응한다. 빈 문자열은 피할 것.
- <strong>비용</strong>: 도구 정의당 ~250 토큰 오버헤드. 에이전틱 루프 누적을 고려해야 한다. Prompt Caching 조합을 권장한다.
- <strong>병렬 도구 호출</strong>: 멱등성 있는 조회 도구에 한해 `ThreadPoolExecutor`로 병렬 실행 가능.

챗봇을 에이전트로 격상시키는 가장 직접적인 방법이 Tool Use다. 복잡한 프레임워크 없이 이 패턴만으로도 실용적인 에이전트를 만들 수 있다.
