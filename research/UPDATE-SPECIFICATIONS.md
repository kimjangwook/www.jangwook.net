# CLI 마이그레이션 가이드 업데이트 사양서

**조사 완료일**: 2025-11-13
**목적**: Claude Code, GitHub Copilot CLI, Google Gemini CLI, OpenAI Codex CLI 마이그레이션 가이드의 최신 정보 반영

---

## 📊 요약

### 완료된 작업
- ✅ GitHub Copilot CLI 최신 정보 조사 (v0.0.354, 2025-11-03)
- ✅ Google Gemini CLI 최신 정보 조사 (Open Source, 2025-06 출시)
- ✅ OpenAI Codex CLI 최신 정보 조사 (v0.56.0, 2025-11-07, GPT-5-Codex)
- ✅ 상세 비교 문서 생성 (`CLI-Comparison-2025-Updated.md`)
- ✅ Copilot CLI README.md 주요 섹션 업데이트

### 남은 작업
- ⏳ Copilot CLI 나머지 파일 업데이트 (01-04)
- ⏳ Gemini CLI 전체 가이드 업데이트/재작성 (01-06)
- ⏳ Codex CLI 전체 가이드 업데이트 (01-05)

---

## 1. GitHub Copilot CLI 업데이트 사양

### 파일 목록
1. ✅ `README.md` - **부분 완료** (모델, 가격 정보 업데이트 완료)
2. ⏳ `01-mcp-migration.md`
3. ⏳ `02-project-instructions.md`
4. ⏳ `03-agent-system.md`
5. ⏳ `04-complete-example.md`

### 주요 변경사항

#### 모델 정보
**AS-IS** (구식):
```markdown
- **LLM**: GPT-4 기반 (OpenAI)
- **모델**: GPT-4 계열
```

**TO-BE** (최신):
```markdown
- **LLM**: Multi-vendor (Claude Sonnet 4/4.5, GPT-5, Gemini 2.5 Pro, Claude Opus 4.1)
- **모델**:
  - Claude Sonnet 4, Claude Sonnet 4.5, Claude Haiku 4.5 (Anthropic)
  - GPT-5 (OpenAI)
  - Gemini 2.5 Pro (Google)
  - Claude Opus 4.1 (Enterprise only)
```

#### 가격 정보
**AS-IS**:
```markdown
- **가격**: $10/월 (Pro)
```

**TO-BE**:
```markdown
- **가격**:
  - Free: $0 (2,000 completions + 50 chat/월)
  - Pro: $10/월 (300 premium requests/월)
  - Pro+: $20/월 (1,500 premium requests/월)
  - Business: $19/user/월 (300 premium requests/월)
  - Enterprise: $39/user/월 (1,000 premium requests/월)
- **프리미엄 요청**: Chat, agent mode, code review, coding agent, Copilot CLI에 적용
```

### 파일별 업데이트 내용

#### ✅ README.md (완료)
- [x] Multi-vendor 모델 정보 추가
- [x] 가격 티어 업데이트 (Pro+, Business, Enterprise)
- [x] 프리미엄 요청 개념 추가
- [x] 비교표 업데이트
- [x] 최근 업데이트 공지 추가

#### ⏳ 01-mcp-migration.md

**업데이트 필요**:
1. MCP 환경 변수 형식 확인
   - 2025-10-17 업데이트: `${VARIABLE_NAME}` 형식 지원
   - 기존 가이드가 이미 올바른 형식이면 변경 불필요

2. MCP 서버 리스트에 "GitHub MCP" 추가
   ```markdown
   **기본 제공 MCP 서버**:
   - `github`: GitHub issues, PRs, repos (자동 포함)
   ```

3. 버전 정보 업데이트
   - 최신 버전: v0.0.354 (2025-11-03)

#### ⏳ 02-project-instructions.md

**업데이트 필요**:
1. Premium requests 고려사항 추가
   ```markdown
   ## 사용량 최적화

   Copilot CLI는 프리미엄 요청 제한이 있습니다:
   - Pro: 300/월
   - Pro+: 1,500/월
   - Enterprise: 1,000/월

   **최적화 팁**:
   - `gpt-5-codex-mini` 사용 시 4배 더 많은 요청 가능
   - 간단한 작업은 Free 티어 활용
   - 복잡한 작업에만 premium 모델 사용
   ```

2. 모델 선택 가이드
   ```markdown
   ## 모델 선택 가이드

   | 작업 유형 | 추천 모델 | 이유 |
   |---------|----------|------|
   | 코드 생성 | GPT-5 | 코딩 특화 |
   | 긴 컨텍스트 | Gemini 2.5 Pro | 1M context window |
   | 빠른 응답 | Claude Haiku 4.5 | 속도 우선 |
   | 복잡한 추론 | Claude Opus 4.1 | Enterprise only |
   ```

#### ⏳ 03-agent-system.md

**업데이트 필요**:
1. `/delegate` 기능 추가 (2025-10-28)
   ```markdown
   ## Delegate 기능

   Copilot CLI의 비동기 코딩 에이전트에 작업을 위임할 수 있습니다.

   **사용법**:
   \`\`\`bash
   copilot /delegate "Refactor the authentication module to use JWT"
   \`\`\`

   **프로세스**:
   1. Uncommitted changes → 새 브랜치로 커밋
   2. Draft PR 자동 생성
   3. Coding agent가 백그라운드에서 작업
   4. Review request 전송
   5. 터미널에 PR 링크 표시

   **장점**:
   - 비동기 작업 (터미널 block 안 됨)
   - GitHub PR 워크플로우 자동화
   - 코드 리뷰 프로세스 통합
   ```

2. 토큰 스트리밍 및 병렬 실행 언급
   ```markdown
   ## 성능 개선 (2025-10-28)

   - **토큰 스트리밍**: 응답이 character-by-character로 표시되어 더 빠른 피드백
   - **병렬 도구 실행**: 여러 도구 호출이 동시에 실행되어 작업 완료 시간 단축
   ```

#### ⏳ 04-complete-example.md

**업데이트 필요**:
1. 최신 명령어 반영
   - `/delegate` 예제 추가
   - Multi-model 선택 예제 추가

2. Premium requests 고려한 워크플로우
   ```markdown
   ## Premium Requests 관리

   ### 사용량 확인
   \`\`\`bash
   # Pro 플랜: 300/월
   # 현재 사용량 확인 (GitHub Copilot 설정에서)
   \`\`\`

   ### 최적화 전략
   - 초안 작성: Free 티어 또는 Haiku 4.5 사용
   - 최종 리뷰: GPT-5 또는 Claude Sonnet 4.5 사용
   - 리팩토링: `/delegate`로 비동기 처리
   ```

---

## 2. Google Gemini CLI 업데이트 사양

### 파일 목록
1. `README.md`
2. `01-mcp-migration.md`
3. `02-project-instructions.md`
4. `03-slash-commands.md`
5. `04-agent-system.md`
6. `05-complete-example.md`
7. `06-limitations-comparison.md`

### 현재 상태 분석

**가능성 1**: 기존 가이드가 오래된 정보로 작성됨
- 2021-2023년 Bard CLI 또는 비공식 도구 기준
- Gemini API 초기 버전 기준

**가능성 2**: Gemini CLI가 2025-06 출시이므로 기존 가이드는 예측/계획 기반

**결론**: 전체 재작성 권장

### 새로 작성할 내용

#### README.md

```markdown
# Claude Code → Google Gemini CLI 마이그레이션 가이드

> **✨ Google Gemini CLI는 2025년 6월 공식 출시된 오픈소스 프로젝트입니다**
> - **무료**: Google OAuth (1,000 requests/일) 또는 API Key (100 requests/일)
> - **1M Context**: Gemini 2.5 Pro의 1M 토큰 컨텍스트 윈도우
> - **오픈소스**: Apache 2.0 라이선스
> - **Extensions**: 2025-10월 출시, 커스텀 MCP 서버 통합

## 개요

### Google Gemini CLI란?

Google의 공식 오픈소스 AI 코딩 어시스턴트 CLI:
- **제공사**: Google
- **모델**: Gemini 2.5 Pro (1M context), Gemini 2.5 Flash
- **가격**: **FREE** (OAuth 1,000/일, API Key 100/일) + 유료 (usage-based)
- **출시**: 2025-06-25
- **GitHub**: github.com/google-gemini/gemini-cli (82K+ stars)
- **특징**: ReAct loop, Built-in tools, MCP support, Extensions

## 핵심 차이점

| 기능 | Claude Code | Google Gemini CLI |
|------|-------------|-------------------|
| **제공사** | Anthropic | Google |
| **LLM** | Claude 3.5 Sonnet | Gemini 2.5 Pro/Flash |
| **가격** | $20/월 | **FREE** (1,000/일) + Paid |
| **컨텍스트** | 200K tokens | **1M tokens** |
| **라이선스** | Proprietary | **Open Source (Apache 2.0)** |
| **설정 위치** | 프로젝트 루트 | `~/.gemini/` (전역) |
| **MCP 설정** | `.mcp.json` | `~/.gemini/settings.json` |
| **Built-in Tools** | MCP 서버 필요 | File, Shell, Web, Google Search |
| **Extensions** | ❌ | ✅ (2025-10) |
| **Release Tracks** | ❌ | stable, preview, nightly |

## 왜 Gemini CLI인가?

**장점**:
- ✅ **완전 무료** (1,000 requests/일)
- ✅ **1M 컨텍스트** (Claude의 5배)
- ✅ **오픈소스** (투명성, 커뮤니티 기여)
- ✅ **Google Search 통합** (실시간 정보)
- ✅ **빠른 업데이트** (nightly builds)

**단점**:
- ❌ Claude 모델 미지원
- ⚠️ Free 티어 rate limit (60/분, 1,000/일)
- ⚠️ 커스텀 에이전트 시스템 없음 (Extensions로 대체)
```

#### 01-mcp-migration.md

```markdown
# MCP 서버 마이그레이션

## 설정 파일 위치

**Claude Code**: `.mcp.json` (프로젝트 루트)
**Gemini CLI**: `~/.gemini/settings.json` (전역)

## 설정 형식 차이

### Claude Code (`.mcp.json`)
\`\`\`json
{
  "mcpServers": {
    "brave-search": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
\`\`\`

### Gemini CLI (`~/.gemini/settings.json`)
\`\`\`json
{
  "mcpServers": {
    "brave-search": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
      "env": {
        "BRAVE_API_KEY": "$BRAVE_API_KEY"
      }
    }
  }
}
\`\`\`

**차이점**: 환경 변수 `${VAR}` → `$VAR`

## 자동 변환 스크립트

\`\`\`python
#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path

def convert_mcp_config():
    # Read Claude Code config
    with open('.mcp.json', 'r') as f:
        config = json.load(f)

    # Convert env vars: ${VAR} → $VAR
    def replace_env(obj):
        if isinstance(obj, dict):
            return {k: replace_env(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [replace_env(item) for item in obj]
        elif isinstance(obj, str):
            return re.sub(r'\$\{(\w+)\}', r'$\1', obj)
        return obj

    converted = replace_env(config)

    # Write to Gemini CLI config
    gemini_dir = Path.home() / '.gemini'
    gemini_dir.mkdir(exist_ok=True)

    with open(gemini_dir / 'settings.json', 'w') as f:
        json.dump(converted, f, indent=2)

    print(f"✅ Converted to {gemini_dir / 'settings.json'}")

if __name__ == '__main__':
    convert_mcp_config()
\`\`\`
```

#### 03-slash-commands.md → Extensions

```markdown
# 슬래시 커맨드 → Extensions 변환

Gemini CLI는 슬래시 커맨드를 직접 지원하지 않습니다. 대신 **Extensions** 시스템을 사용합니다.

## Extensions란?

2025-10월 출시된 Gemini CLI의 확장 시스템:
- 재사용 가능한 커맨드
- MCP 서버로 배포
- 서드파티 통합 (Dynatrace, Elastic, Shopify)

## 변환 방법

Claude Code의 슬래시 커맨드를 Gemini CLI Extension(MCP 서버)로 변환:

### 1. MCP 서버 생성

\`\`\`javascript
// mcp-server-blog.js
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const server = new Server({
  name: "blog-commands",
  version: "1.0.0"
});

server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "write_post",
    description: "Create a new blog post",
    inputSchema: {
      type: "object",
      properties: {
        topic: { type: "string" },
        language: { type: "string", enum: ["ko", "ja", "en", "zh"] }
      }
    }
  }]
}));

server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "write_post") {
    // 블로그 포스트 생성 로직
    return { /* result */ };
  }
});

server.connect();
\`\`\`

### 2. Gemini CLI에 등록

\`\`\`json
// ~/.gemini/settings.json
{
  "mcpServers": {
    "blog-commands": {
      "command": "node",
      "args": ["/path/to/mcp-server-blog.js"]
    }
  }
}
\`\`\`

### 3. 사용

\`\`\`bash
gemini -p "Use the write_post tool to create a TypeScript tutorial in Korean"
\`\`\`
```

#### 04-agent-system.md → Extensions 활용

```markdown
# 에이전트 시스템 → Extensions 활용

## 차이점

| Claude Code | Gemini CLI |
|------------|------------|
| `.claude/agents/*.md` | MCP Extensions |
| Markdown 기반 프롬프트 | Tool-based approach |
| `@agent-name` 호출 | 자동 tool selection |

## Extensions로 에이전트 구현

Gemini CLI는 에이전트를 **MCP 도구**로 구현합니다.

### 예제: Writing Assistant Extension

\`\`\`javascript
// writing-assistant-mcp.js
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const SYSTEM_PROMPT = \`
You are an expert technical writer...
(Claude Code의 writing-assistant.md 내용)
\`;

server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "writing_assistant") {
    const { task, languages } = request.params.arguments;

    // Gemini API 호출 with system prompt
    const result = await callGeminiWithPrompt(SYSTEM_PROMPT, task);

    return { result };
  }
});
\`\`\`

### ReAct Loop 활용

Gemini CLI는 ReAct (Reason and Act) loop를 사용:
1. **Reason**: 작업 분석
2. **Act**: 적절한 tool 선택 및 실행
3. **Observe**: 결과 확인
4. **Repeat**: 필요시 반복

에이전트를 tool로 등록하면 Gemini가 자동으로 적절한 시점에 호출합니다.
```

---

## 3. OpenAI Codex CLI 업데이트 사양

### 파일 목록
1. `README.md`
2. `01-mcp-migration.md`
3. `02-project-instructions.md`
4. `03-agent-system.md`
5. `04-automation.md`
6. `05-complete-example.md`

### 주요 변경사항

#### 역사적 배경 설명 필수

**중요**: 많은 사용자가 "Codex deprecated"라고 알고 있음. 명확한 설명 필요.

```markdown
# 중요: Codex API와 Codex CLI의 차이

## 타임라인

- **2021년**: OpenAI Codex API 출시 (GPT-3 기반)
- **2023년 3월**: **Codex API 종료** (deprecated)
  - 이유: GPT-3.5/GPT-4로 대체
  - 영향: API 접근 불가

- **2025년**: **완전히 새로운 Codex CLI 출시** (GPT-5 기반)
  - 2025-09-23: GPT-5-Codex 공개
  - 2025-11-07: GPT-5-Codex-Mini 출시
  - 상태: **Active Development**

## 차이점

| 항목 | 2021 Codex API | 2025 Codex CLI |
|------|---------------|----------------|
| **모델** | Codex (GPT-3 기반) | GPT-5-Codex |
| **접근 방법** | API endpoint | CLI + ChatGPT 통합 |
| **가격** | 사용량 기반 | ChatGPT 구독 포함 |
| **상태** | ❌ Deprecated (2023) | ✅ Active (2025) |

**결론**: "Codex deprecated" 정보는 2021 API에 대한 것이며, 2025 Codex CLI는 **완전히 새로운 제품**입니다!
```

#### README.md 업데이트

```markdown
# Claude Code → OpenAI Codex CLI 마이그레이션 가이드

> **⚠️ 중요: Codex API (2021-2023) ≠ Codex CLI (2025)**
>
> 2023년 deprecated된 Codex API와 2025년 출시된 Codex CLI는 **완전히 다른 제품**입니다.
> - **2021 Codex API**: GPT-3 기반, API 접근, **2023년 종료**
> - **2025 Codex CLI**: GPT-5-Codex 기반, CLI + ChatGPT 통합, **현재 활발히 개발 중**

## 개요

### OpenAI Codex CLI란?

OpenAI의 최신 로컬 코딩 에이전트 (2025):
- **제공사**: OpenAI
- **모델**: GPT-5-Codex, GPT-5-Codex-Mini
- **가격**: ChatGPT Plus ($20/월), Pro ($200/월)
- **출시**: 2025년 (GPT-5-Codex: 2025-09-23, Mini: 2025-11-07)
- **최신 버전**: v0.56.0 (2025-11-07)
- **특징**: Local agent, AGENTS.md, MCP support, `codex exec`
- **GitHub**: github.com/openai/codex

## 핵심 차이점

| 기능 | Claude Code | OpenAI Codex CLI |
|------|-------------|------------------|
| **제공사** | Anthropic | OpenAI |
| **LLM** | Claude 3.5 Sonnet | GPT-5-Codex, GPT-5-Codex-Mini |
| **가격** | $20/월 | **ChatGPT Plus** $20/월, **Pro** $200/월 |
| **사용량 제한** | Fair Use | **Plus** 45-225/5h, **Pro** 300-1,500/5h |
| **설정 위치** | 프로젝트 루트 | `~/.codex/` (전역) |
| **MCP 설정** | `.mcp.json` | `~/.codex/config.toml` (TOML!) |
| **에이전트** | `.claude/agents/*.md` | `AGENTS.md` (custom prompts) |
| **실행 모드** | Interactive | **Interactive** + `codex exec` (non-interactive) |
| **Cloud Alternative** | ❌ | ✅ chatgpt.com/codex |

## 가격 및 사용량

### ChatGPT 구독 필수

| 플랜 | 가격 | 로컬 메시지 (5시간) | 클라우드 Tasks (5시간) |
|------|------|---------------------|----------------------|
| **Plus** | $20/월 | 45-225 | 10-60 |
| **Pro** | $200/월 | 300-1,500 | 50-400 |
| **Business** | 가변 | Plus와 동일/seat | Plus와 동일/seat |

**사용량 증가 팁**:
- `gpt-5-codex-mini` 사용 시 약 4배 증가
- 추가 credits 구매 가능
- API key 연결 시 별도 과금 (ChatGPT 제한과 독립적)
```

#### 01-mcp-migration.md 업데이트

```markdown
# MCP 서버 마이그레이션

## 설정 파일 형식 차이

**중요**: Codex CLI는 **TOML 형식**을 사용합니다!

### Claude Code (`.mcp.json`)
\`\`\`json
{
  "mcpServers": {
    "brave-search": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
\`\`\`

### Codex CLI (`~/.codex/config.toml`)
\`\`\`toml
[mcpServers.brave-search]
command = "docker"
args = ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"]

[mcpServers.brave-search.env]
BRAVE_API_KEY = "$BRAVE_API_KEY"
\`\`\`

## 자동 변환 스크립트

\`\`\`python
#!/usr/bin/env python3
import json
import toml
import re
from pathlib import Path

def json_to_toml_mcp():
    # Read Claude Code config
    with open('.mcp.json', 'r') as f:
        config = json.load(f)

    # Convert to TOML structure
    toml_config = {"mcpServers": {}}

    for name, server in config["mcpServers"].items():
        toml_config["mcpServers"][name] = {
            "command": server["command"],
            "args": server["args"]
        }

        if "env" in server:
            # Convert ${VAR} → $VAR
            env = {}
            for k, v in server["env"].items():
                env[k] = re.sub(r'\$\{(\w+)\}', r'$\1', v)
            toml_config["mcpServers"][name]["env"] = env

    # Write to Codex config
    codex_dir = Path.home() / '.codex'
    codex_dir.mkdir(exist_ok=True)

    with open(codex_dir / 'config.toml', 'w') as f:
        toml.dump(toml_config, f)

    print(f"✅ Converted to {codex_dir / 'config.toml'}")

if __name__ == '__main__':
    json_to_toml_mcp()
\`\`\`
```

#### 03-agent-system.md → AGENTS.md

```markdown
# 에이전트 시스템 → AGENTS.md 변환

## 차이점

| Claude Code | Codex CLI |
|------------|-----------|
| `.claude/agents/*.md` | `AGENTS.md` (single file) |
| 여러 에이전트 파일 | 하나의 메모리 파일 |
| `@agent-name` 호출 | 자동 context 로딩 |

## AGENTS.md란?

Codex CLI의 **메모리 시스템**:
- 프로젝트별 커스텀 프롬프트
- Session persistence
- 자동으로 모든 대화에 포함

## 변환 방법

Claude Code의 여러 에이전트를 하나의 `AGENTS.md`로 통합:

### Before (Claude Code)
\`\`\`
.claude/agents/
├── writing-assistant.md
├── seo-optimizer.md
└── web-researcher.md
\`\`\`

### After (Codex CLI)
\`\`\`markdown
<!-- AGENTS.md -->

# Project Agents and Guidelines

## Writing Assistant

You are an expert technical writer...
(writing-assistant.md 내용)

## SEO Optimizer

You are an SEO specialist...
(seo-optimizer.md 내용)

## Web Researcher

You are a research specialist...
(web-researcher.md 내용)

---

When the user asks for blog post writing, use the Writing Assistant guidelines.
When the user asks for SEO optimization, use the SEO Optimizer guidelines.
When the user asks for research, use the Web Researcher guidelines.
\`\`\`

## 사용법

\`\`\`bash
# AGENTS.md는 자동으로 로딩됨
codex

> "Write a blog post about TypeScript 5.5"
# → Writing Assistant 가이드라인 자동 적용

> "Optimize the SEO for recent posts"
# → SEO Optimizer 가이드라인 자동 적용
\`\`\`
```

---

## 4. 우선순위 및 실행 계획

### Phase 1: Copilot CLI 완료 (1-2시간)
1. [x] README.md 업데이트 (완료)
2. [ ] 01-mcp-migration.md - GitHub MCP 추가
3. [ ] 02-project-instructions.md - Premium requests 가이드
4. [ ] 03-agent-system.md - /delegate 기능 추가
5. [ ] 04-complete-example.md - 최신 워크플로우 반영

### Phase 2: Gemini CLI 재작성 (3-4시간)
1. [ ] README.md - 완전 재작성
2. [ ] 01-mcp-migration.md - `settings.json` 형식
3. [ ] 02-project-instructions.md - Gemini 특화
4. [ ] 03-slash-commands.md → Extensions 변환 가이드
5. [ ] 04-agent-system.md - MCP tools로 에이전트 구현
6. [ ] 05-complete-example.md - 실전 예제
7. [ ] 06-limitations-comparison.md - FREE vs Paid

### Phase 3: Codex CLI 업데이트 (2-3시간)
1. [ ] README.md - 역사적 배경 추가
2. [ ] 01-mcp-migration.md - TOML 형식 변환
3. [ ] 02-project-instructions.md - AGENTS.md 활용
4. [ ] 03-agent-system.md - 통합 가이드라인
5. [ ] 04-automation.md - `codex exec` 활용
6. [ ] 05-complete-example.md - ChatGPT 구독 워크플로우

### Phase 4: 최종 검증 (1시간)
1. [ ] 상호 참조 링크 업데이트
2. [ ] CLI-Comparison-2025-Updated.md와 일관성 확인
3. [ ] 실제 CLI로 테스트 (가능한 경우)
4. [ ] 최종 리뷰 및 교정

---

## 5. 자동화 스크립트

### 일괄 업데이트 스크립트

\`\`\`bash
#!/bin/bash
# update-all-guides.sh

echo "=== CLI Migration Guides Update Script ==="
echo ""

# Copilot CLI
echo "📝 Updating GitHub Copilot CLI guides..."
# ... Copilot CLI 업데이트 명령어들 ...

# Gemini CLI
echo "📝 Updating Google Gemini CLI guides..."
# ... Gemini CLI 재작성 명령어들 ...

# Codex CLI
echo "📝 Updating OpenAI Codex CLI guides..."
# ... Codex CLI 업데이트 명령어들 ...

echo ""
echo "✅ All guides updated!"
echo "📊 Summary: CLI-Comparison-2025-Updated.md"
\`\`\`

---

## 6. 검증 체크리스트

### Copilot CLI
- [ ] Multi-vendor 모델 정보 정확성
- [ ] 가격 티어 및 premium requests 설명
- [ ] /delegate 기능 설명 완전성
- [ ] MCP 환경 변수 형식 (`${VAR}`)

### Gemini CLI
- [ ] FREE 티어 강조
- [ ] 1M context 강조
- [ ] Extensions vs Agents 차이 명확히
- [ ] ReAct loop 설명

### Codex CLI
- [ ] 2021 API vs 2025 CLI 차이 명확히
- [ ] TOML 형식 변환 정확성
- [ ] AGENTS.md 활용법
- [ ] ChatGPT 구독 요구사항 강조

---

**다음 단계**: Phase 1 (Copilot CLI 완료)부터 시작
**예상 총 소요 시간**: 7-10시간
**마지막 업데이트**: 2025-11-13
