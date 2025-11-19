# Claude Code → Codex CLI 마이그레이션 가이드

## 목차

1. [개요](#개요)
2. [핵심 차이점](#핵심-차이점)
3. [마이그레이션 로드맵](#마이그레이션-로드맵)
4. [상세 가이드](#상세-가이드)
5. [실전 예제](#실전-예제)
6. [제한사항 및 대안](#제한사항-및-대안)

## 개요

이 문서는 Claude Code에서 Codex CLI로 프로젝트를 마이그레이션하는 방법을 다룹니다.

### Claude Code란?

- Anthropic의 공식 CLI 도구
- Claude 3.5 Sonnet 기반
- MCP(Model Context Protocol) 서버 통합
- 서브에이전트 시스템 (`.claude/agents/`)
- 커스텀 슬래시 커맨드 (`.claude/commands/`)
- 프로젝트 지침 파일 (`CLAUDE.md`)

### Codex CLI란?

- OpenAI의 오픈소스 코딩 에이전트
- OpenAI o3/o4-mini 모델 기반
- MCP 서버 통합 지원
- 터미널 네이티브 인터페이스
- Rust로 구현 (빠르고 효율적)
- TypeScript SDK 제공 (자동화)

## 핵심 차이점

### 아키텍처 비교

| 기능 | Claude Code | Codex CLI |
|------|-------------|-----------|
| **설정 파일** | `.mcp.json` | `~/.codex/config.toml` |
| **형식** | JSON | TOML |
| **프로젝트 지침** | `CLAUDE.md` (Markdown) | 커스텀 프롬프트 (TOML) |
| **에이전트 시스템** | `.claude/agents/*.md` | `AGENTS.md` + 슬래시 커맨드 |
| **슬래시 커맨드** | `.claude/commands/*.md` | 내장 슬래시 커맨드 |
| **MCP 통합** | 프로젝트 레벨 | 사용자 레벨 (전역) |
| **LLM** | Claude 3.5 Sonnet | OpenAI o3/o4-mini |
| **비용** | API 종량제 또는 Pro ($20/월) | API 종량제 |
| **오픈소스** | ❌ Proprietary | ✅ Apache 2.0 |

### 설정 파일 위치

**Claude Code:**
```
프로젝트/
├── .mcp.json              # MCP 서버 설정
├── CLAUDE.md              # 프로젝트 지침
├── .claude/
│   ├── agents/            # 서브에이전트
│   └── commands/          # 슬래시 커맨드
```

**Codex CLI:**
```
~/.codex/                  # 사용자 레벨 (전역)
└── config.toml            # 모든 설정 (MCP, 프롬프트, 에이전트)

프로젝트/
└── .codex.toml           # 프로젝트별 설정 (선택사항)
```

## 마이그레이션 로드맵

### Phase 1: 기본 설정 (필수)

1. ✅ MCP 서버 설정 마이그레이션 (`.mcp.json` → `config.toml`)
2. ✅ 프로젝트 지침 변환 (`CLAUDE.md` → 커스텀 프롬프트)

### Phase 2: 커맨드 및 에이전트 (권장)

3. ✅ 에이전트 시스템 재구성 (`AGENTS.md` 활용)
4. ✅ 슬래시 커맨드 통합 (내장 커맨드 사용)

### Phase 3: 자동화 (선택)

5. ⚠️ TypeScript SDK 통합 (CI/CD, GitHub Actions)
6. ⚠️ 비대화형 모드 활용 (스크립트 자동화)

## 상세 가이드

각 마이그레이션 단계별 상세 가이드:

1. [MCP 서버 마이그레이션](./01-mcp-migration.md)
   - `.mcp.json` → `config.toml` 변환
   - 환경 변수 처리
   - STDIO vs HTTP 서버 설정

2. [프로젝트 지침 변환](./02-project-instructions.md)
   - `CLAUDE.md` → 커스텀 프롬프트 변환
   - 프로젝트별 vs 전역 설정
   - 컨텍스트 관리

3. [에이전트 시스템 재구성](./03-agent-system.md)
   - `.claude/agents/` → `AGENTS.md` 변환
   - 슬래시 커맨드 활용
   - 메모리 및 컨텍스트 관리

4. [자동화 및 고급 기능](./04-automation.md)
   - TypeScript SDK 사용
   - GitHub Actions 통합
   - 비대화형 모드 (`codex exec`)

## 실전 예제

### 현재 프로젝트 마이그레이션

이 프로젝트(`jangwook.net`)의 설정을 Codex CLI로 변환:

- **MCP 서버**: 8개 (context7, sequentialthinking, playwright, notion, chrome-devtools, analytics, brave-search, browsermcp)
- **에이전트**: 17개 (writing-assistant, seo-optimizer, content-planner 등)
- **커맨드**: 7개 (write-post, analyze-posts, generate-recommendations 등)

완전한 변환 예제는 [05-complete-example.md](./05-complete-example.md) 참조.

## 제한사항 및 대안

### Codex CLI의 제한사항

1. **프로젝트별 MCP 설정 제한적**
   - 주로 사용자 레벨 (전역) 설정
   - `.codex.toml`로 프로젝트별 오버라이드 가능

2. **커스텀 커맨드 시스템**
   - Claude Code만큼 유연하지 않음
   - 내장 슬래시 커맨드 + 커스텀 프롬프트 조합 필요

3. **에이전트 시스템**
   - 명시적 서브에이전트 없음
   - `AGENTS.md` + 메모리 시스템으로 대체

### 권장 전략

**하이브리드 접근**:
- 간단한 작업: Codex CLI 사용
- 복잡한 멀티에이전트 워크플로우: Claude Code 유지
- 또는 두 도구 병행 사용

**점진적 마이그레이션**:
1. MCP 서버만 먼저 마이그레이션
2. 자주 사용하는 워크플로우만 변환
3. 복잡한 에이전트는 필요 시 재구성

## Codex CLI vs Claude Code vs Gemini CLI

### 간단 비교

| 특징 | Claude Code | Codex CLI | Gemini CLI |
|------|-------------|-----------|------------|
| **LLM** | Claude 3.5 Sonnet | OpenAI o3/o4 | Gemini 1.5 Pro |
| **비용** | $20/월 (Pro) | API 종량제 | 무료 티어 ✅ |
| **오픈소스** | ❌ | ✅ | ✅ |
| **설정 형식** | JSON | TOML | JSON |
| **에이전트** | 네이티브 | 제한적 | 제한적 |
| **MCP** | 프로젝트 레벨 | 전역 레벨 | 프로젝트/전역 |
| **자동화** | 제한적 | TypeScript SDK ✅ | 제한적 |
| **성숙도** | 높음 | 중간 | 중간 |

### 언제 Codex CLI를 사용하는가?

**추천 상황**:
- OpenAI 모델 선호 (o3/o4-mini)
- 오픈소스 필요 (커스터마이징, 기여)
- TypeScript 자동화 필요
- 빠른 성능 중요 (Rust 구현)

**비추천 상황**:
- 복잡한 멀티에이전트 워크플로우
- Claude 모델 선호
- 무료 티어 필요 (→ Gemini CLI)

## 참고 자료

### Codex CLI 공식 문서

- [GitHub Repository](https://github.com/openai/codex)
- [Official Documentation](https://developers.openai.com/codex/cli/)
- [MCP Integration Guide](https://developers.openai.com/codex/mcp/)
- [Configuration Reference](https://developers.openai.com/codex/cli/reference/)

### 튜토리얼

- [DataCamp Tutorial](https://www.datacamp.com/tutorial/open-ai-codex-cli-tutorial)
- [Net Ninja Video Series](https://www.youtube.com/watch?v=tIb_TzVNbDM)
- [Comprehensive Guide (Skywork AI)](https://skywork.ai/blog/how-to-use-openai-codex-cli-a-comprehensive-guide/)

### 커뮤니티

- [Reddit Discussion](https://www.reddit.com/r/singularity/comments/1k0qc67/openai_releases_codex_cli_an_ai_coding_assistant/)
- [Comparison: Claude Code vs Codex CLI](https://www.youtube.com/watch?v=M7Roz9JEfhU)

---

**마지막 업데이트**: 2025-11-13
**작성자**: Claude Code Migration Research
