# Claude Code → GitHub Copilot CLI 마이그레이션 가이드

> **⚠️ 최근 업데이트 (2025-11-13)**:
> GitHub Copilot CLI의 최신 정보를 반영하여 가이드를 업데이트했습니다.
> - ✨ **Multi-vendor 모델 지원**: Claude Sonnet 4/4.5, GPT-5, Gemini 2.5 Pro, Claude Opus 4.1
> - 💰 **Pro+ 티어 추가**: $20/월 (1,500 premium requests/월)
> - 🚀 **신기능**: `/delegate` (비동기 코딩 에이전트), 토큰 스트리밍, 병렬 실행
> - 📅 **최신 버전**: v0.0.354 (2025-11-03)

## 목차

1. [개요](#개요)
2. [핵심 차이점](#핵심-차이점)
3. [마이그레이션 로드맵](#마이그레이션-로드맵)
4. [가이드 구성](#가이드-구성)
5. [빠른 시작](#빠른-시작)

## 개요

이 가이드는 Claude Code의 설정 및 워크플로우를 **GitHub Copilot CLI**로 마이그레이션하는 방법을 제공합니다.

### Claude Code란?

Anthropic의 CLI 도구로, Claude AI를 터미널에서 사용:
- `.mcp.json`: MCP 서버 설정
- `CLAUDE.md`: 프로젝트 컨텍스트 및 가이드라인
- `.claude/agents/`: 전문화된 AI 에이전트
- `.claude/commands/`: 재사용 가능한 슬래시 커맨드

### GitHub Copilot CLI란?

GitHub의 공식 AI 코딩 어시스턴트 CLI:
- **제공사**: GitHub (Microsoft)
- **모델**: **Multi-vendor** (Claude Sonnet 4/4.5, GPT-5, Gemini 2.5 Pro, Claude Opus 4.1)
- **가격**: Pro $10/월, Pro+ $20/월, Business $19/user/월, Enterprise $39/user/월
- **출시**: 2025년 9월 25일 Public Preview
- **최신 버전**: v0.0.354 (2025-11-03)
- **특징**: Multi-model, GitHub 통합, 커스텀 에이전트, MCP 지원, /delegate 기능

## 핵심 차이점

### 아키텍처 비교

| 기능 | Claude Code | GitHub Copilot CLI |
|------|-------------|---------------------|
| **제공사** | Anthropic | GitHub (Microsoft) |
| **LLM** | Claude 3.5 Sonnet | **Multi-vendor**: Claude 4.5, GPT-5, Gemini 2.5 Pro |
| **가격** | $20/월 | **Pro** $10/월, **Pro+** $20/월, **Business** $19/user/월 |
| **프리미엄 요청** | Fair Use (무제한) | **Pro** 300/월, **Pro+** 1,500/월, **Enterprise** 1,000/월 |
| **설정 위치** | 프로젝트 루트 | `~/.copilot/` (전역) |
| **설정 형식** | JSON (`.mcp.json`) | JSON (`config.json`, `mcp-config.json`) |
| **MCP 환경변수** | `${VAR}` | `${VAR}` (2025-10-17 업데이트) |
| **프로젝트 지침** | `CLAUDE.md` | `.github/copilot-instructions.md` |
| **에이전트 시스템** | `.claude/agents/*.md` | `.github/agents/*.md` 또는 `~/.copilot/agents/*.md` |
| **커스텀 에이전트** | ✅ 기본 지원 | ✅ 공식 지원 (2025-10-28) |
| **슬래시 커맨드** | `.claude/commands/*.md` | 커스텀 에이전트로 구현 |
| **Delegate 기능** | ❌ 없음 | ✅ `/delegate` (비동기 코딩 에이전트, 2025-10-28) |
| **MCP 지원** | ✅ 완전 지원 | ✅ 완전 지원 (`mcp-config.json`) |
| **GitHub 통합** | ❌ 없음 | ✅ 네이티브 (기본 MCP 서버) |
| **대화형 모드** | ✅ 주요 기능 | ✅ Interactive mode (기본) |
| **비대화형 모드** | 제한적 | ✅ Programmatic mode (`-p` 플래그) |
| **파일 참조** | 컨텍스트 자동 | `@파일경로` 문법 |
| **도구 승인** | 자동 | 수동 승인 (보안 강화) |
| **토큰 스트리밍** | ✅ | ✅ (2025-10-28) |
| **병렬 도구 실행** | ❌ | ✅ (2025-10-28) |

### 설정 파일 구조

**Claude Code**:
```
프로젝트/
├── .mcp.json                    # MCP 서버 설정
├── CLAUDE.md                    # 프로젝트 가이드라인
└── .claude/
    ├── agents/                  # AI 에이전트
    │   ├── writing-assistant.md
    │   └── seo-optimizer.md
    └── commands/                # 슬래시 커맨드
        ├── write-post.md
        └── analyze-posts.md
```

**GitHub Copilot CLI**:
```
~/.copilot/                      # 전역 설정
├── config.json                  # 일반 설정
├── mcp-config.json             # MCP 서버 설정
└── agents/                      # 사용자 레벨 에이전트
    ├── writing-assistant.md
    └── seo-optimizer.md

프로젝트/
└── .github/
    ├── copilot-instructions.md # 프로젝트 가이드라인
    └── agents/                  # 프로젝트 레벨 에이전트
        └── project-specific.md
```

### 주요 개념 매핑

| Claude Code 개념 | Copilot CLI 대응 | 변환 방법 |
|------------------|------------------|----------|
| `.mcp.json` | `~/.copilot/mcp-config.json` | JSON 구조 조정 |
| `CLAUDE.md` | `.github/copilot-instructions.md` | Markdown 그대로 사용 가능 |
| `.claude/agents/` | `.github/agents/` 또는 `~/.copilot/agents/` | YAML frontmatter 추가 |
| `.claude/commands/` | 커스텀 에이전트 | 에이전트로 재구성 |
| `@agent-name` | `/agent agent-name` 또는 `--agent=agent-name` | 호출 방식 변경 |
| `/command` | `/agent command-name` | 슬래시 커맨드 → 에이전트 |

## 마이그레이션 로드맵

### Phase 1: 기본 설정 (2-3시간)

**목표**: Copilot CLI 작동 시작

**작업**:
1. ✅ GitHub Copilot CLI 설치
2. ✅ 인증 및 초기 설정
3. ✅ MCP 서버 마이그레이션 (`.mcp.json` → `mcp-config.json`)
4. ✅ 기본 프로젝트 지침 작성 (`.github/copilot-instructions.md`)

**결과**:
- Copilot CLI 사용 가능
- 모든 MCP 서버 작동
- 프로젝트 컨텍스트 인식

### Phase 2: 에이전트 시스템 (4-6시간)

**목표**: 전문화된 에이전트 복원

**작업**:
5. ✅ 커스텀 에이전트 생성 (`.github/agents/`)
6. ✅ 슬래시 커맨드를 에이전트로 변환
7. ✅ 에이전트 테스트 및 검증

**결과**:
- 모든 에이전트 기능 유지
- `/agent` 명령으로 호출 가능

### Phase 3: 워크플로우 최적화 (선택, 3-4시간)

**목표**: GitHub 통합 및 자동화

**작업**:
8. ⚠️ GitHub Actions 통합
9. ⚠️ `/delegate` 기능 활용 (Copilot coding agent)
10. ⚠️ 팀 협업 설정 (조직 레벨 에이전트)

**결과**:
- CI/CD 자동화
- GitHub 이슈/PR과 연동
- 팀 전체 일관성

### 총 예상 시간: 9-13시간

## 가이드 구성

### 1. [MCP 서버 마이그레이션](./01-mcp-migration.md)

**내용**:
- `.mcp.json` → `mcp-config.json` 변환
- MCP 서버 설정 형식 차이
- 환경 변수 처리
- Python 자동 변환 스크립트

**예상 시간**: 1-2시간

### 2. [프로젝트 지침 변환](./02-project-instructions.md)

**내용**:
- `CLAUDE.md` → `.github/copilot-instructions.md`
- 경로별 지침 (`.instructions.md` 파일)
- YAML frontmatter 활용
- 베스트 프랙티스

**예상 시간**: 1-2시간

### 3. [에이전트 시스템 재구성](./03-agent-system.md)

**내용**:
- `.claude/agents/` → `.github/agents/` 변환
- 커스텀 에이전트 생성 (YAML frontmatter)
- 슬래시 커맨드를 에이전트로 변환
- 에이전트 계층 구조 (user/repo/org)
- 실전 변환 예제 (17개 에이전트)

**예상 시간**: 4-6시간

### 4. [완전한 마이그레이션 예제](./04-complete-example.md)

**내용**:
- jangwook.net 프로젝트 완전 마이그레이션
- Step-by-step 실행 가이드
- Before/After 비교
- 검증 및 테스트
- 트러블슈팅

**예상 시간**: 3-4시간 (참조용)

## 빠른 시작

### 1. 설치

```bash
# npm으로 설치
npm install -g @github/copilot

# 버전 확인
copilot --version
```

### 2. 인증

```bash
# GitHub 로그인
copilot

# 프롬프트에서 /login 입력
/login
```

### 3. MCP 서버 설정

`~/.copilot/mcp-config.json` 생성:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@upstash/brave-mcp"],
      "env": {
        "BRAVE_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### 4. 프로젝트 지침 작성

`.github/copilot-instructions.md` 생성:

```markdown
# Project Guidelines

This is an Astro 5.14.1 blog project.

## Architecture
- Framework: Astro (Islands Architecture)
- Content: Content Collections in `src/content/`
- Styling: Tailwind CSS

## Key Rules
- All blog posts must follow the schema in `src/content.config.ts`
- Use `'YYYY-MM-DD'` format for `pubDate`
- Multi-language support: ko, en, ja, zh

## Testing
- Run `npm run astro check` before commits
- Run `npm run build` to verify production build
```

### 5. 커스텀 에이전트 생성

`.github/agents/writing-assistant.md`:

```markdown
---
name: writing-assistant
description: Technical blog post writing assistant
tools: ["read", "edit", "search"]
---

You are an expert technical blog post writing assistant.

## Your Expertise
- Technical writing for developers
- Multi-language content (ko, en, ja, zh)
- SEO optimization

## Process
1. Research the topic
2. Create outline
3. Write engaging content
4. Generate proper frontmatter
5. Optimize for SEO
```

### 6. 사용

```bash
# 대화형 모드
copilot
# 프롬프트에서:
/agent writing-assistant
# 또는:
# "Act as writing-assistant. Create a post about Astro 5.0"

# 프로그래밍 모드
copilot --agent=writing-assistant -p "Create a blog post about TypeScript 5.3"

# 파일 참조
copilot -p "Fix the bug in @src/app.js"
```

## 핵심 기능 비교

### 1. MCP 서버

**Claude Code**:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

**Copilot CLI**:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

→ **거의 동일** (약간의 구조 차이만 존재)

### 2. 프로젝트 컨텍스트

**Claude Code**:
```markdown
# CLAUDE.md
프로젝트 가이드라인...
```

**Copilot CLI**:
```markdown
# .github/copilot-instructions.md
프로젝트 가이드라인...
```

→ **파일 위치만 변경**, 내용은 거의 그대로 사용 가능

### 3. 에이전트/커맨드

**Claude Code**:
```markdown
# .claude/agents/writing-assistant.md
전문 에이전트 정의...
```

**Copilot CLI**:
```markdown
---
name: writing-assistant
description: Blog writing assistant
tools: ["read", "edit"]
---
전문 에이전트 정의...
```

→ **YAML frontmatter 추가 필요**

### 4. 호출 방식

**Claude Code**:
```
@writing-assistant "Create a blog post"
/write-post
```

**Copilot CLI**:
```
/agent writing-assistant
# 또는:
copilot --agent=writing-assistant -p "Create a blog post"
```

→ **문법 변경, 기능은 동일**

## 장단점 비교

### Claude Code 장점

✅ **더 나은 컨텍스트 이해**: Claude 3.5 Sonnet의 강력한 추론
✅ **간단한 설정**: 프로젝트 단위 설정
✅ **유연한 에이전트**: 네이티브 서브에이전트 시스템

### Copilot CLI 장점

✅ **저렴한 가격**: $10/월 (Claude Code $20/월)
✅ **GitHub 통합**: Issues, PRs, 레포지토리 네이티브 접근
✅ **기업 지원**: GitHub Enterprise 통합
✅ **팀 협업**: 조직 레벨 에이전트 및 지침
✅ **안정성**: Microsoft/GitHub 공식 지원
✅ **/delegate 기능**: GitHub Copilot coding agent로 세션 전환

### Copilot CLI 단점

❌ **도구 승인 필요**: 보안을 위해 매번 승인 (번거로울 수 있음)
❌ **제한적 커스터마이징**: Claude Code보다 유연성 낮음
❌ **GPT-4 제약**: Claude 3.5 Sonnet보다 코드 이해도 낮을 수 있음

## 마이그레이션 의사결정 가이드

### Copilot CLI를 선택해야 하는 경우

✅ **GitHub 중심 워크플로우**: GitHub Issues, PRs 자주 사용
✅ **팀 협업 중요**: 조직 전체 표준화 필요
✅ **비용 민감**: 월 $10 vs $20 차이 중요
✅ **기업 환경**: GitHub Enterprise 사용 중
✅ **안정성 우선**: 공식 지원 및 장기 유지보수 보장

### Claude Code를 유지해야 하는 경우

✅ **복잡한 추론 필요**: Claude 3.5 Sonnet의 우수한 추론 능력 필수
✅ **독립적 워크플로우**: GitHub 통합 불필요
✅ **유연한 커스터마이징**: 에이전트 시스템 고도화 필요
✅ **Claude 선호**: Claude의 안전성 및 응답 스타일 선호

### 하이브리드 접근

💡 **두 가지 모두 사용**:
- **Copilot CLI**: GitHub 관련 작업 (PR 리뷰, 이슈 관리)
- **Claude Code**: 복잡한 코딩 작업 (아키텍처 설계, 리팩토링)

## 다음 단계

1. **[MCP 서버 마이그레이션](./01-mcp-migration.md)** 시작
2. **[프로젝트 지침 변환](./02-project-instructions.md)** 진행
3. **[에이전트 시스템 재구성](./03-agent-system.md)** 완료
4. **[완전한 예제](./04-complete-example.md)** 참조

## 참고 자료

### 공식 문서

- [GitHub Copilot CLI 공식 문서](https://docs.github.com/copilot)
- [Copilot CLI 사용 가이드](https://docs.github.com/copilot/using-github-copilot/using-github-copilot-in-the-command-line)
- [커스텀 에이전트 생성](https://docs.github.com/copilot/customizing-copilot/creating-a-custom-copilot-agent)
- [MCP 서버 설정](https://docs.github.com/copilot/customizing-copilot/using-model-context-protocol)

### 커뮤니티 자료

- [GitHub Blog: Copilot CLI 101](https://github.blog/ai-and-ml/github-copilot-cli-101-how-to-use-github-copilot-from-the-command-line/)
- [Awesome GitHub Copilot Customizations](https://github.com/github/awesome-copilot-customizations)

---

**마지막 업데이트**: 2025-11-13
**작성자**: Claude Code Migration Guide Series
**다음 문서**: [01-mcp-migration.md](./01-mcp-migration.md)
