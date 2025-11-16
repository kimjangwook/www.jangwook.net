# 제한사항 및 비교 분석

## 개요

Claude Code와 Gemini CLI의 기능, 제한사항, 사용 사례를 비교하여 각 도구를 언제 사용해야 하는지 가이드합니다.

## 핵심 차이점 요약

| 기능 | Claude Code | Gemini CLI | 승자 |
|------|-------------|------------|------|
| **LLM 모델** | Claude 3.5 Sonnet | Gemini 1.5 Pro/Flash | 동등 |
| **비용** | 유료 플랜 필요 | 무료 티어 available | Gemini CLI ✅ |
| **에이전트 시스템** | 네이티브 서브에이전트 | 커맨드 + 프롬프트 | Claude Code ✅ |
| **MCP 통합** | 프로젝트 레벨 (.mcp.json) | 사용자/프로젝트 레벨 (settings.json) | 동등 |
| **커맨드 시스템** | Markdown (자유 형식) | TOML (고정 형식) | Claude Code ✅ |
| **문서화** | CLAUDE.md (Markdown) | GEMINI.md (Markdown + import) | Gemini CLI ✅ |
| **오픈소스** | ❌ (Proprietary) | ✅ (Open source) | Gemini CLI ✅ |
| **확장성** | 제한적 | Extensions 지원 | Gemini CLI ✅ |
| **학습 곡선** | 낮음 (직관적) | 중간 (프롬프트 엔지니어링 필요) | Claude Code ✅ |
| **복잡한 워크플로우** | 뛰어남 (멀티에이전트) | 제한적 (통합 커맨드 필요) | Claude Code ✅ |
| **성숙도** | 높음 (안정적) | 중간 (발전 중) | Claude Code ✅ |

## 기능별 상세 비교

### 1. 에이전트 시스템

#### Claude Code

**장점**:
- 네이티브 서브에이전트 지원
- 명시적 에이전트 호출: `@agent-name "task"`
- 에이전트 간 통신 간편
- 복잡한 멀티에이전트 워크플로우 지원

**예시**:
```markdown
@writing-assistant "Write blog post"
  ↓ delegates to
@web-researcher "Research topic"
  ↓ delegates to
@image-generator "Create hero image"
```

**제한사항**:
- 에이전트 정의 파일이 길어질 수 있음
- 팀 공유 시 에이전트 수정 어려움

---

#### Gemini CLI

**장점**:
- 유연한 역할 정의 (GEMINI.md)
- Extensions로 재사용 가능
- 커뮤니티 공유 용이

**예시**:
```toml
# .gemini/commands/write.toml
prompt = """
Act as Writing Assistant.
1. Research (internal)
2. Write content
3. Generate image
All in one workflow.
"""
```

**제한사항**:
- 에이전트 호출이 명시적이지 않음
- 멀티에이전트 통신 복잡
- Isolated Agents 구현 필요 (고급)

**극복 방법**:
- 통합 커맨드 (워크플로우 포함)
- GEMINI.md 역할 정의
- Extensions 개발

---

### 2. 커맨드 시스템

#### Claude Code

**형식**: Markdown (`.claude/commands/*.md`)

**장점**:
- 자유로운 문서화
- 상세한 파라미터 설명
- 복잡한 워크플로우 정의 가능
- 읽기 쉬움

**예시**:
```markdown
# Write Post Command

## Description
...

## Usage
/write-post <topic> [--tags tag1,tag2]

## Parameters
- topic (required): ...
- --tags (optional): ...

## Workflow
1. Research
2. Write
3. ...
[수백 줄의 상세 지침]
```

**제한사항**:
- 파일이 길어질 수 있음 (1000+ lines)
- 구조화 부족 (자유 형식)

---

#### Gemini CLI

**형식**: TOML (`.gemini/commands/*.toml`)

**장점**:
- 간결하고 구조화
- 빠른 파싱
- 표준 형식 (TOML)

**예시**:
```toml
description = "Generate blog post"
prompt = """
Task: {{args}}
Workflow: ...
Details: see docs/
"""
```

**제한사항**:
- 고정 형식 (description, prompt만)
- 복잡한 로직 표현 어려움
- 파라미터 시스템 없음 (자연어 파싱 필요)

**극복 방법**:
- 상세 문서는 별도 파일 (`.gemini/docs/*.md`)
- GEMINI.md에 워크플로우 정의
- 프롬프트 엔지니어링으로 파라미터 파싱

---

### 3. MCP 서버 통합

#### Claude Code

**설정 파일**: `.mcp.json` (프로젝트 루트)

**장점**:
- 프로젝트별 설정 명확
- 버전 관리 용이 (Git commit)
- 팀 공유 간편

**예시**:
```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    }
  }
}
```

**제한사항**:
- 프로젝트마다 설정 필요 (중복 가능)
- 사용자 레벨 설정 없음

---

#### Gemini CLI

**설정 파일**: `~/.gemini/settings.json` (사용자) 또는 `.gemini/settings.json` (프로젝트)

**장점**:
- 사용자 레벨 설정 가능 (모든 프로젝트 공유)
- 프로젝트 레벨 설정으로 오버라이드
- 추가 옵션 (trust, timeout, includeTools 등)

**예시**:
```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "$NOTION_TOKEN"
      },
      "trust": true,
      "timeout": 5000
    }
  }
}
```

**제한사항**:
- 환경 변수 참조 문법 다름 (`${VAR}` → `$VAR`)
- 계층 구조 이해 필요 (user < project < system)

**극복 방법**:
- 변환 스크립트 사용
- 하이브리드 접근 (공통 서버는 user, 프로젝트 전용은 project)

---

### 4. 프로젝트 지침 파일

#### Claude Code

**파일**: `CLAUDE.md`

**장점**:
- 단일 파일로 관리
- 읽기 쉬움
- Claude에 최적화

**예시**:
```markdown
# CLAUDE.md

This file provides guidance to Claude Code...

## 프로젝트 개요
...

## 명령어
...

## 아키텍처
...
```

**제한사항**:
- 파일이 길어질 수 있음
- 모듈화 어려움

---

#### Gemini CLI

**파일**: `GEMINI.md` + import 시스템

**장점**:
- 모듈화 가능 (`@file.md` import)
- 계층 구조 (global, project, component)
- 동적 추가 (`/memory add`)

**예시**:
```markdown
# Project: www.jangwook.net

@.gemini/docs/astro-guide.md
@.gemini/docs/seo-guide.md

## Project-Specific Rules
...
```

**제한사항**:
- import 경로 관리 필요
- 계층 로딩 순서 이해 필요

**극복 방법**:
- 체계적인 docs/ 폴더 구조
- `/memory show`로 로드된 컨텍스트 확인

---

### 5. 비용

#### Claude Code

**가격**:
- Claude API 사용 (종량제)
- 또는 Claude Pro 구독 ($20/월)

**예상 비용** (월간, 중간 사용):
- API: $50-100/월
- Pro: $20/월 (제한적)

---

#### Gemini CLI

**가격**:
- Gemini 1.5 Pro: 무료 티어 (일일 제한)
- 또는 종량제 (낮은 비용)

**예상 비용** (월간, 중간 사용):
- 무료 티어: $0/월 (일일 제한 내)
- 종량제: $10-30/월

**승자**: Gemini CLI ✅ (무료 티어 활용 시)

---

## 사용 사례별 권장 도구

### 사용 사례 1: 개인 프로젝트 + 비용 민감

**권장**: Gemini CLI ✅

**이유**:
- 무료 티어 활용 가능
- 오픈소스 (커뮤니티 지원)
- 충분한 기능

---

### 사용 사례 2: 복잡한 멀티에이전트 워크플로우

**권장**: Claude Code ✅

**이유**:
- 네이티브 서브에이전트 시스템
- 에이전트 간 통신 간편
- 복잡한 로직 표현 용이

**예시 워크플로우**:
```
Blog Post Creation:
  Writing Assistant
    ↓ delegates
  Web Researcher (2초 딜레이)
    ↓ returns research
  Writing Assistant
    ↓ delegates
  Image Generator
    ↓ returns image
  Writing Assistant
    ↓ delegates (parallel)
  4 × Language Writers (ko, ja, en, zh)
    ↓ returns posts
  Backlink Manager
  SEO Optimizer
```

Gemini CLI에서는 이런 복잡한 워크플로우 구현이 어려움.

---

### 사용 사례 3: 팀 협업 + 설정 공유

**권장**: 하이브리드 ⚖️

**전략**:
- MCP 서버: 프로젝트 레벨 설정 (Git commit)
- 지침: GEMINI.md + docs/ (모듈화)
- 커맨드: 자주 사용하는 것만 TOML 변환

**Claude Code 유지**:
- 복잡한 에이전트 워크플로우
- 팀원이 익숙한 작업

**Gemini CLI 추가**:
- 간단한 작업
- 비용 절감이 필요한 경우

---

### 사용 사례 4: 빠른 프로토타이핑

**권장**: Gemini CLI ✅

**이유**:
- 빠른 설정 (커맨드 간단)
- 무료 티어 사용 가능
- Extensions로 확장 용이

---

### 사용 사례 5: 엔터프라이즈 환경

**권장**: Claude Code ✅ 또는 Gemini CLI (Pro)

**Claude Code 이점**:
- Anthropic 엔터프라이즈 지원
- 안정적인 API
- SOC2 컴플라이언스

**Gemini CLI 이점**:
- Google Cloud 통합
- 저렴한 비용
- 오픈소스 (커스터마이징 가능)

---

## 주요 제한사항

### Claude Code 제한사항

1. **비용**
   - 유료 플랜 필수
   - API 종량제 높음

2. **확장성**
   - Extensions 시스템 없음
   - 커뮤니티 공유 제한적

3. **오픈소스**
   - Proprietary (소스 코드 비공개)
   - 커스터마이징 불가

4. **플랫폼 종속**
   - Anthropic Claude에 종속
   - 다른 LLM 사용 불가

---

### Gemini CLI 제한사항

1. **에이전트 시스템**
   - 네이티브 서브에이전트 없음
   - 복잡한 멀티에이전트 어려움

2. **커맨드 형식**
   - TOML 고정 형식 (자유도 낮음)
   - 파라미터 시스템 없음

3. **성숙도**
   - 비교적 신생 프로젝트
   - 버그 가능성
   - 문서화 부족 (일부)

4. **학습 곡선**
   - 프롬프트 엔지니어링 필요
   - 계층 구조 이해 필요
   - Extensions 개발 복잡

---

## 극복 전략

### Claude Code 제한사항 극복

**비용 문제**:
- 무료 티어가 있는 다른 LLM API 사용 (불가능)
- 사용량 최적화 (프롬프트 간소화)

**확장성 문제**:
- 커스텀 스크립트로 보완
- 외부 도구 통합 (MCP 서버)

---

### Gemini CLI 제한사항 극복

**에이전트 시스템**:
- 통합 커맨드 (워크플로우 포함)
- GEMINI.md 역할 정의
- Isolated Agents 구현
- Extensions 개발

**커맨드 형식**:
- 상세 문서는 별도 파일
- 프롬프트 엔지니어링
- 자연어 파라미터 파싱

**성숙도**:
- 커뮤니티 기여
- 이슈 리포팅
- 직접 수정 (오픈소스)

---

## 마이그레이션 권장 사항

### 완전 마이그레이션 (Gemini CLI 100%)

**추천 대상**:
- 개인 프로젝트
- 비용에 민감한 팀
- 간단한 워크플로우

**장점**:
- 비용 절감
- 도구 단일화
- 오픈소스 활용

**단점**:
- 복잡한 워크플로우 제한
- 학습 시간 필요

---

### 하이브리드 접근 (Claude Code + Gemini CLI)

**추천 대상**:
- 대부분의 프로젝트 ✅
- 복잡한 에이전트 워크플로우 사용
- 비용 최적화 필요

**전략**:
- **Claude Code**: 복잡한 멀티에이전트 작업
- **Gemini CLI**: 간단한 작업, 리서치, 최적화

**장점**:
- 각 도구의 강점 활용
- 점진적 전환 가능
- 리스크 최소화

**단점**:
- 두 도구 관리 필요
- 설정 중복

---

### 단계적 마이그레이션

**권장 단계**:
1. **Phase 1**: MCP 서버만 Gemini CLI 테스트 (1주)
2. **Phase 2**: 간단한 커맨드 추가 (1개월)
3. **Phase 3**: 복잡한 워크플로우 평가 (3개월)
4. **Phase 4**: 완전 전환 또는 하이브리드 결정

---

## 결론

### 핵심 요약

| 측면 | Claude Code | Gemini CLI | 권장 |
|------|-------------|------------|------|
| **비용** | 높음 | 낮음/무료 | Gemini CLI |
| **복잡한 워크플로우** | 뛰어남 | 제한적 | Claude Code |
| **학습 곡선** | 낮음 | 중간 | Claude Code |
| **확장성** | 제한적 | 높음 | Gemini CLI |
| **오픈소스** | ❌ | ✅ | Gemini CLI |

### 최종 권장사항

**대부분의 사용자**: 하이브리드 접근 ✅
- Claude Code: 복잡한 작업
- Gemini CLI: 간단한 작업, 비용 절감

**비용 민감**: Gemini CLI 100%
- 무료 티어 활용
- Extensions로 기능 확장

**엔터프라이즈**: 상황에 따라
- Claude Code: 안정성 우선
- Gemini CLI: 비용 우선 + 커스터마이징 필요

---

## 참고 자료

- [Claude Code 공식 문서](https://docs.claude.com/claude-code)
- [Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli)
- [Gemini CLI vs Claude Code 비교 (Community)](https://www.reddit.com/r/GoogleGeminiAI/comments/1lkol0m/gemini_cli_a_comprehensive_guide_to_understanding/)
- [Multi-Agent Systems](https://aipositive.substack.com/p/how-i-turned-gemini-cli-into-a-multi)
