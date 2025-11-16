# Claude Code → Gemini CLI 마이그레이션 가이드

## 목차

1. [개요](#개요)
2. [핵심 차이점](#핵심-차이점)
3. [마이그레이션 로드맵](#마이그레이션-로드맵)
4. [상세 가이드](#상세-가이드)
5. [실전 예제](#실전-예제)
6. [제한사항 및 대안](#제한사항-및-대안)

## 개요

이 문서는 Claude Code에서 Gemini CLI로 프로젝트를 마이그레이션하는 방법을 다룹니다. 두 CLI 도구는 모두 AI 기반 코딩 어시스턴트이지만, 설정 방식과 구조에 차이가 있습니다.

### Claude Code란?

- Anthropic의 공식 CLI 도구
- MCP(Model Context Protocol) 서버 통합
- 서브에이전트 시스템 (`.claude/agents/`)
- 커스텀 슬래시 커맨드 (`.claude/commands/`)
- 프로젝트 지침 파일 (`CLAUDE.md`)

### Gemini CLI란?

- Google의 오픈소스 AI 에이전트
- MCP 서버 통합 지원
- ReAct (Reason and Act) 루프 기반
- 커스텀 커맨드 및 익스텐션 시스템
- 프로젝트 컨텍스트 파일 (`GEMINI.md`)

## 핵심 차이점

### 아키텍처 비교

| 기능 | Claude Code | Gemini CLI |
|------|-------------|------------|
| **설정 파일** | `.mcp.json` | `~/.gemini/settings.json` 또는 `.gemini/settings.json` |
| **프로젝트 지침** | `CLAUDE.md` | `GEMINI.md` |
| **에이전트 시스템** | `.claude/agents/*.md` (Markdown) | 커스텀 커맨드 + 익스텐션 (TOML) |
| **슬래시 커맨드** | `.claude/commands/*.md` (Markdown) | `.gemini/commands/*.toml` (TOML) |
| **MCP 통합** | 프로젝트 레벨 (`.mcp.json`) | 사용자/프로젝트 레벨 (`settings.json`) |
| **컨텍스트 관리** | 파일 기반 | 파일 + `/memory add` 명령어 |

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

**Gemini CLI:**
```
~/.gemini/                 # 사용자 레벨 (글로벌)
├── settings.json          # 전역 설정 + MCP 서버
├── GEMINI.md              # 전역 컨텍스트
└── commands/              # 전역 커맨드

프로젝트/
├── .gemini/
│   ├── settings.json      # 프로젝트 설정 (우선순위 높음)
│   └── commands/          # 프로젝트 커맨드
└── GEMINI.md              # 프로젝트 컨텍스트
```

## 마이그레이션 로드맵

### Phase 1: 기본 설정 (필수)

1. ✅ MCP 서버 설정 마이그레이션 (`.mcp.json` → `settings.json`)
2. ✅ 프로젝트 지침 변환 (`CLAUDE.md` → `GEMINI.md`)

### Phase 2: 커맨드 시스템 (권장)

3. ✅ 슬래시 커맨드 변환 (`.claude/commands/*.md` → `.gemini/commands/*.toml`)

### Phase 3: 에이전트 시스템 (선택)

4. ⚠️ 에이전트 시스템 재구성
   - Gemini CLI는 Claude Code의 서브에이전트와 다른 접근 방식 사용
   - 커스텀 커맨드 + 프롬프트 엔지니어링으로 대체
   - 또는 Gemini CLI Extensions 개발

## 상세 가이드

각 마이그레이션 단계별 상세 가이드:

1. [MCP 서버 마이그레이션](./01-mcp-migration.md)
   - `.mcp.json` → `settings.json` 변환
   - 환경 변수 처리
   - 트랜스포트 타입 매핑

2. [프로젝트 지침 변환](./02-project-instructions.md)
   - `CLAUDE.md` → `GEMINI.md` 변환
   - 컨텍스트 계층 구조
   - `/memory add` 활용

3. [슬래시 커맨드 마이그레이션](./03-slash-commands.md)
   - Markdown → TOML 변환
   - `{{args}}` 템플릿 사용
   - 커맨드 조직화

4. [에이전트 시스템 재구성](./04-agent-system.md)
   - 에이전트 → 커스텀 커맨드 변환
   - 다중 에이전트 워크플로우
   - 익스텐션 개발 (고급)

## 실전 예제

### 현재 프로젝트 마이그레이션

이 프로젝트(`www.jangwook.net`)의 설정을 Gemini CLI로 변환:

- **MCP 서버**: 8개 (context7, sequentialthinking, playwright, notion, chrome-devtools, analytics, brave-search, browsermcp)
- **에이전트**: 17개 (writing-assistant, seo-optimizer, content-planner 등)
- **커맨드**: 7개 (write-post, analyze-posts, generate-recommendations 등)

완전한 변환 예제는 [05-complete-example.md](./05-complete-example.md) 참조.

## 제한사항 및 대안

### Gemini CLI의 제한사항

1. **서브에이전트 시스템 없음**
   - Claude Code의 `.claude/agents/` 직접 지원 없음
   - 대안: 커스텀 커맨드 + 프롬프트 조합, Extensions 개발

2. **Markdown 기반 커맨드 미지원**
   - TOML 형식만 지원
   - 변환 필요

3. **프로젝트별 MCP 설정 복잡도**
   - `.gemini/settings.json`에 설정 필요
   - 사용자 레벨 설정과 충돌 가능성

### 권장 전략

**하이브리드 접근**:
- 간단한 작업: Gemini CLI 사용
- 복잡한 멀티에이전트 워크플로우: Claude Code 유지
- 또는 두 도구 병행 사용

**점진적 마이그레이션**:
1. MCP 서버만 먼저 마이그레이션
2. 자주 사용하는 커맨드만 변환
3. 에이전트는 필요 시 수동 변환

## 참고 자료

### Gemini CLI 공식 문서

- [GitHub Repository](https://github.com/google-gemini/gemini-cli)
- [Official Documentation](https://developers.google.com/gemini-code-assist/docs/gemini-cli)
- [Hands-on Codelab](https://codelabs.developers.google.com/gemini-cli-hands-on)
- [Cheatsheet](https://www.philschmid.de/gemini-cli-cheatsheet)

### 커뮤니티 가이드

- [Gemini CLI Tutorial Series (Medium)](https://medium.com/google-cloud/gemini-cli-tutorial-series-77da7d494718)
- [Multi-Agent System with Prompts](https://aipositive.substack.com/p/how-i-turned-gemini-cli-into-a-multi)
- [Advanced Gemini CLI Series](https://medium.com/google-cloud/advanced-gemini-cli-part-3-isolated-agents-b9dbab70eeff)

---

**마지막 업데이트**: 2025-11-13
**작성자**: Claude Code Migration Research
