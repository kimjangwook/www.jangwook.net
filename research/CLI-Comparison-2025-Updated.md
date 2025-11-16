# CLI 도구 비교 - 2025년 11월 최신 정보

**조사 일자**: 2025-11-13
**목적**: Claude Code, GitHub Copilot CLI, Google Gemini CLI, OpenAI Codex CLI의 최신 정보 비교

## 1. GitHub Copilot CLI

### 기본 정보
- **제공사**: GitHub (Microsoft)
- **공식 저장소**: github.com/github/copilot-cli
- **최신 버전**: v0.0.354 (2025-11-03)
- **출시일**: 2025-09-25 (Public Preview)
- **라이선스**: Proprietary (GitHub Copilot 구독 필요)

### 모델 정보 (2025년 11월 기준)

**사용 가능한 모델** (멀티벤더 지원):
- **Anthropic**: Claude Sonnet 4, Claude Sonnet 4.5, Claude Haiku 4.5
- **OpenAI**: GPT-5
- **Google**: Gemini 2.5 Pro
- **Enterprise 전용**: Claude Opus 4.1

**중요**: "GPT-4 기반" 또는 "GPT-4 계열"이라는 설명은 **완전히 구식 정보**입니다!

### 가격 정책 (2025년 11월)

| 플랜 | 가격 | 프리미엄 요청/월 | 특징 |
|------|------|----------------|------|
| **Free** | $0 | 2,000 completions + 50 chat | 기본 code completion |
| **Pro** | $10/월 ($100/년) | 300 | Claude 4.5, GPT-5, Gemini 2.5 Pro |
| **Pro+** | $20/월 | 1,500 | Pro + GitHub Spark, Codex IDE |
| **Business** | $19/user/월 | 300 (구매 가능) | 사용자 관리, IP indemnity |
| **Enterprise** | $39/user/월 | 1,000 | Claude Opus 4.1, 조직 지식 |

**프리미엄 요청이란?**
- Chat, agent mode, code review, coding agent, Copilot CLI에 적용
- 기능/모델에 따라 소비량 다름
- 무료 플랜: 50/월

### 최신 기능 (2025년 9-11월)

**2025-09-25**: Public Preview 출시
- Terminal-native AI agent
- GitHub 컨텍스트 통합
- MCP 서버 지원 (GitHub MCP 기본 포함)

**2025-10-03**: 모델 선택 및 이미지 지원
- 향상된 모델 선택 기능
- 이미지 지원
- Glob 패턴 도구 권한 (`--allow-tool`, `--deny-tool`)

**2025-10-10**: 성능 및 UI 개선
- 더 빠르고 간결한 응답
- 프록시 지원 (모든 Node 버전)
- `--screen-reader` 설정 저장

**2025-10-17**: Haiku 4.5 및 MCP 개선
- **Claude Haiku 4.5 지원 추가**
- Multiline input (Shift+Enter, Kitty protocol)
- MCP 서버 설정 간소화:
  - Command 필드: 쉘 명령어 형식 지원
  - 환경 변수: `${VARIABLE_NAME}` 형식
- `--allow-all-paths` 플래그 추가

**2025-10-28**: 커스텀 에이전트 및 Delegate
- **커스텀 에이전트 공식 지원**:
  - `.github/agents/` (프로젝트)
  - `{org}/.github/` (조직)
  - `~/.copilot/agents/` (사용자)
- **`/delegate` 명령어**:
  - 비동기 코딩 에이전트에 작업 위임
  - 자동 브랜치 생성 및 PR 작성
- **성능 개선**:
  - 토큰 스트리밍
  - 병렬 도구 실행

**2025-11-03**: 최신 안정 버전 (v0.0.354)

### MCP 서버 지원

**설정 위치**: `~/.copilot/mcp-config.json`

**환경 변수 형식**: `${VARIABLE_NAME}` (2025-10-17 업데이트)

**기본 제공**: GitHub MCP 서버 (issues, PRs, repos)

### 커스텀 에이전트

**파일 형식**:
```markdown
---
description: "Brief one-line description"
---

# Agent Name

Agent instructions...
```

**호출 방법**:
- Interactive: `/agent agent-name`
- Programmatic: `--agent=agent-name`

### 설치

```bash
npm install -g @github/copilot
gh copilot auth
copilot --version
```

### 시스템 요구사항

- Node.js 18+
- macOS, Linux, Windows (WSL)
- GitHub account
- GitHub Copilot 구독

---

## 2. Google Gemini CLI

### 기본 정보
- **제공사**: Google
- **공식 저장소**: github.com/google-gemini/gemini-cli
- **출시일**: 2025-06-25
- **라이선스**: Apache 2.0 (Open Source)
- **GitHub Stars**: 82,300+
- **상태**: Active Development (Preview)

### 모델 정보

**기본 모델**: Gemini 2.5 Pro
- **컨텍스트 윈도우**: 1M tokens
- **특징**: "Most direct path from prompt to model"

**지원 모델**:
- Gemini 2.5 Pro (기본)
- Gemini 2.5 Flash (`-m gemini-2.5-flash`)

### 가격 정책 (2025년 11월)

**FREE 티어** (두 가지 옵션):

1. **Google OAuth**:
   - 60 requests/분
   - 1,000 requests/일
   - 무료

2. **Gemini API Key**:
   - 100 requests/일 (무료)
   - Usage-based 유료 플랜 (초과 시)

**Vertex AI** (Enterprise):
- Google Cloud 통합
- Enterprise 기능
- 사용량 기반 과금

**Gemini Code Assist** (조직용):
- Individual tier
- Standard tier
- Enterprise tier
- Quota shared with Gemini CLI

### 주요 기능

**Built-in Tools**:
- File operations (create, read, modify)
- Shell commands (terminal ops)
- Web fetch (content retrieval)
- Google Search grounding

**ReAct Loop**:
- Reason and Act 루프
- 자율적 문제 해결
- Tool chaining

**MCP 서버 지원**:
- **설정 위치**: `~/.gemini/settings.json`
- 커스텀 MCP 서버 추가 가능
- 확장 시스템:
  - GitHub operations
  - Slack messaging
  - Database queries
  - Media generation (Imagen, Veo, Lyria)

**Extensions System** (2025-10-08):
- 재사용 가능한 커맨드
- MCP 서버로 공유
- 워크플로우 자동화
- 서드파티 통합 (Dynatrace, Elastic, Shopify)

**Interactive Commands** (2025년 업데이트):
- vim 편집
- top 모니터링
- git rebase -i
- 터미널 내 대화형 명령어 지원

### 설치

```bash
# npm (글로벌)
npm install -g @google/gemini-cli

# Homebrew (macOS/Linux)
brew install gemini-cli

# npx (설치 없이)
npx https://github.com/google-gemini/gemini-cli
```

**Release Tracks**:
- `@latest` - Stable
- `@preview` - Weekly updates
- `@nightly` - Nightly builds

### 사용법

```bash
# Interactive session
gemini

# Non-interactive
gemini -p "prompt"

# Model selection
gemini -m gemini-2.5-flash

# Multi-directory context
gemini --include-directories ../lib,../docs

# JSON output
gemini -p "query" --output-format json

# Streaming JSON
gemini -p "query" --output-format stream-json
```

### 시스템 요구사항

- Node.js 20+
- macOS, Linux, or Windows
- Google account (OAuth) or API key

---

## 3. OpenAI Codex CLI

### 기본 정보
- **제공사**: OpenAI
- **공식 저장소**: github.com/openai/codex
- **최신 버전**: v0.56.0 (2025-11-07)
- **상태**: Active Development
- **라이선스**: Proprietary (ChatGPT 구독 필요)

### 역사적 배경

**중요한 타임라인**:
- **2021**: 원본 Codex API 출시
- **2023-03**: 원본 Codex API 종료 (deprecated)
- **2025**: **완전히 새로운 Codex CLI 출시** (GPT-5 기반)
- **2025-09-23**: GPT-5-Codex 모델 공개
- **2025-11-07**: GPT-5-Codex-Mini 출시

**주의**: "Codex API deprecated" 정보는 2021-2023 버전에 대한 것이며, 2025년 Codex CLI는 **완전히 새로운 제품**입니다!

### 모델 정보

**사용 가능한 모델**:
- **GPT-5-Codex**: 주력 모델 (코딩 특화)
- **GPT-5-Codex-Mini**: 경량화, 비용 효율적 (2025-11-07)

**특징**:
- Local coding agent
- Cloud alternative: chatgpt.com/codex

### 가격 정책 (2025년 11월)

**ChatGPT 구독 필수**:

| 플랜 | 가격 | Codex CLI 사용량 (5시간당) | 특징 |
|------|------|--------------------------|------|
| **Plus** | $20/월 | 로컬: 45-225 메시지<br>클라우드: 10-60 tasks | 기본 |
| **Pro** | $200/월 | 로컬: 300-1,500 메시지<br>클라우드: 50-400 tasks | 우선 처리 |
| **Business** | 가변 | Plus와 동일/seat | 조직 관리 |
| **Edu** | 가변 | 우선 처리 | 교육 |
| **Enterprise** | 가변 | 우선 처리 | Enterprise |

**사용량 증가 옵션**:
- `gpt-5-codex-mini` 사용 시 약 4배 증가
- 추가 credits 구매 가능

**Alternative - API Access**:
- OpenAI API key 연결
- 표준 API 요금으로 과금
- ChatGPT 구독 제한과 별개

### 주요 기능

**로컬 에이전트**:
- Terminal-based operation
- Autonomous coding
- Sandbox & approval system

**Custom Prompts**:
- AGENTS.md 파일로 메모리 관리
- 커스텀 프롬프트 저장
- Session persistence

**MCP 서버 지원**:
- **설정 위치**: `~/.codex/config.toml`
- MCP 서버 설정 가능
- 확장 가능한 도구 시스템

**Commands**:
- `codex` - Interactive agent
- `codex exec` - Non-interactive execution
- Slash commands (interactive 내)

**Code Review** (Trial):
- 2025-11-20까지 무료
- 사용량 카운트 안 됨

### 설치

```bash
# npm
npm install -g @openai/codex

# Homebrew
brew install --cask codex

# Binary downloads (GitHub Releases)
# macOS (Apple Silicon, x86_64)
# Linux (x86_64, arm64)
```

### 인증

1. **ChatGPT Account**: 간편 로그인
2. **API Key**: 추가 설정 필요
3. Migration: 기존 API key 사용자 마이그레이션 가이드 제공

### 시스템 요구사항

- Node.js (npm 설치 시)
- macOS, Linux (바이너리 지원)
- ChatGPT Plus/Pro/Business/Edu/Enterprise 구독

---

## 4. Claude Code (참조용)

### 기본 정보
- **제공사**: Anthropic
- **가격**: $20/월
- **모델**: Claude 3.5 Sonnet
- **설정**: 프로젝트 루트 (`.mcp.json`, `CLAUDE.md`)
- **에이전트**: `.claude/agents/`
- **커맨드**: `.claude/commands/`

---

## 비교 요약표

| 항목 | GitHub Copilot CLI | Google Gemini CLI | OpenAI Codex CLI | Claude Code |
|------|-------------------|------------------|------------------|-------------|
| **제공사** | GitHub | Google | OpenAI | Anthropic |
| **모델** | Claude 4.5, GPT-5, Gemini 2.5 | Gemini 2.5 Pro/Flash | GPT-5-Codex | Claude 3.5 Sonnet |
| **가격** | $10-39/월 | **FREE** + 유료 | $20-200/월 | $20/월 |
| **라이선스** | Proprietary | **Open Source** | Proprietary | Proprietary |
| **FREE 티어** | ✓ (제한적) | ✓ (1,000/일) | ✗ | ✗ |
| **MCP 지원** | ✓ | ✓ | ✓ | ✓ |
| **커스텀 에이전트** | ✓ (2025-10-28) | Extensions | AGENTS.md | ✓ |
| **설정 위치** | `~/.copilot/` | `~/.gemini/` | `~/.codex/` | 프로젝트 루트 |
| **GitHub 통합** | ✓ (네이티브) | ✗ | ✗ | ✗ |
| **출시/업데이트** | 2025-09 (v0.0.354) | 2025-06 (Active) | 2025 (v0.56.0) | - |
| **컨텍스트** | 128K+ | 1M tokens | - | 200K |
| **사용량 제한** | 300-1,500/월 | 60/분, 1,000/일 | 45-1,500/5h | Fair Use |

---

## 주요 발견사항 및 업데이트 포인트

### 1. GitHub Copilot CLI

**가장 큰 변화**:
- ✗ "GPT-4 기반" → ✓ "Multi-vendor (Claude 4.5, GPT-5, Gemini 2.5 Pro)"
- ✗ "$10/월" → ✓ "$10-39/월 (Pro/Pro+/Business/Enterprise)"
- + Premium requests 개념 추가 (300-1,500/월)
- + Haiku 4.5 지원 (2025-10-17)
- + 커스텀 에이전트 공식화 (2025-10-28)
- + `/delegate` 기능 추가

**Migration Guide 업데이트 필요**:
- [ ] README.md - 모델, 가격 표 수정
- [ ] 01-mcp-migration.md - MCP 환경 변수 형식 업데이트 (`${VAR}`)
- [ ] 02-project-instructions.md - Premium requests 고려사항 추가
- [ ] 03-agent-system.md - Delegate 기능 추가
- [ ] 04-complete-example.md - 최신 명령어 및 워크플로우 반영

### 2. Google Gemini CLI

**가장 큰 변화**:
- **완전히 새로운 제품** (기존 가이드가 있었다면 전면 재작성 필요)
- ✓ 공식 오픈소스 프로젝트
- ✓ FREE 티어 제공 (1,000 requests/일)
- ✓ 1M token context window
- ✓ Extensions 시스템 (2025-10)

**Migration Guide 업데이트 필요**:
- [ ] README.md - 전면 재작성
- [ ] 01-mcp-migration.md - `~/.gemini/settings.json` 형식
- [ ] 02-project-instructions.md - Gemini 특화 가이드라인
- [ ] 03-slash-commands.md (있다면) - Gemini CLI 커맨드 구조
- [ ] 04-agent-system.md - Extensions vs Agents
- [ ] 05-complete-example.md - 실전 마이그레이션
- [ ] 06-limitations-comparison.md - FREE vs Paid 비교

### 3. OpenAI Codex CLI

**가장 큰 변화**:
- **2023년 deprecated ≠ 2025년 Codex CLI** (완전히 다른 제품!)
- ✓ GPT-5-Codex, GPT-5-Codex-Mini
- ✓ ChatGPT 구독 통합
- ✓ 사용량 제한 명확화 (45-1,500/5시간)
- ✓ MCP 지원 (`~/.codex/config.toml`)

**Migration Guide 업데이트 필요**:
- [ ] README.md - 역사적 배경 설명 추가 (2021 Codex ≠ 2025 Codex)
- [ ] 01-mcp-migration.md - `~/.codex/config.toml` 형식
- [ ] 02-project-instructions.md - AGENTS.md 활용
- [ ] 03-agent-system.md - Custom prompts vs Agents
- [ ] 04-automation.md - `codex exec` 활용
- [ ] 05-complete-example.md - ChatGPT 구독 기반 워크플로우

---

## 권장 사항

### 사용자별 추천

**개인 개발자 (비용 최우선)**:
1. **Google Gemini CLI** (FREE) - 1,000 req/일이면 충분
2. GitHub Copilot Pro ($10/월) - GitHub 통합 필요시
3. Claude Code ($20/월) - Claude 선호시

**팀/조직**:
1. **GitHub Copilot Business** ($19/user/월) - GitHub 생태계
2. Google Gemini CLI (FREE/Enterprise) - 비용 절감
3. OpenAI Codex CLI - ChatGPT 기존 구독자

**Enterprise**:
1. GitHub Copilot Enterprise ($39/user/월) - Claude Opus 4.1, 조직 지식
2. Vertex AI + Gemini CLI - Google Cloud 통합
3. OpenAI Codex CLI Enterprise - OpenAI 생태계

### Migration 우선순위

**마이그레이션하기 가장 쉬운 순서**:
1. **Google Gemini CLI** - FREE, 오픈소스, 간단한 설정
2. **GitHub Copilot CLI** - 잘 문서화됨, 커뮤니티 활발
3. **OpenAI Codex CLI** - ChatGPT 구독 필요, 사용량 제한

**기능 우선 순위**:
1. **GitHub Copilot CLI** - Multi-model, GitHub 통합, 커스텀 에이전트
2. **Google Gemini CLI** - 1M context, Extensions, FREE
3. **OpenAI Codex CLI** - GPT-5 최신 모델, ChatGPT 통합

---

## 다음 단계

1. [x] 최신 정보 조사 완료
2. [ ] 각 Migration Guide 업데이트:
   - [ ] Copilot CLI (5개 파일)
   - [ ] Gemini CLI (7개 파일)
   - [ ] Codex CLI (6개 파일)
3. [ ] 상호 참조 링크 업데이트
4. [ ] 실전 테스트 및 검증
5. [ ] 최종 리뷰

---

**마지막 업데이트**: 2025-11-13
**다음 리뷰 권장일**: 2025-12-01 (월간 업데이트 권장)
