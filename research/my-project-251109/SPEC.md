# 프로젝트 사양서 (Specification)

**프로젝트명**: `.claude/` 디렉토리 구조 분석 및 문서화
**작성일**: 2025-11-09
**작성자**: Claude Code Research Team
**버전**: 1.0

---

## 1. 프로젝트 개요

### 1.1 목적
본 프로젝트는 현재 블로그 프로젝트에 적용된 `.claude/` 디렉토리 구조를 심층 분석하여, agents, skills, commands의 관계와 사용 방법을 이해하고, 현재 구조의 강점과 개선점을 평가하는 것을 목표로 합니다.

### 1.2 범위
- `.claude/agents/` 디렉토리의 17개 에이전트 분석
- `.claude/skills/` 디렉토리의 9개 스킬 패키지 분석
- `.claude/commands/` 디렉토리의 7개 커맨드 분석
- 각 요소 간의 관계 및 상호작용 패턴 도출
- Claude Code 공식 베스트 프랙티스와의 비교 평가

### 1.3 제외 사항
- 실제 코드 구현 변경 (분석만 수행)
- `.claude/guidelines/` 및 `.claude/temp-agents/` 디렉토리 분석
- 개인 설정 파일(`settings.local.json`) 세부 내용

---

## 2. 주요 개념 정의

### 2.1 Agents (에이전트)
**정의**: 특정 도메인에 전문화된 독립 실행형 AI 어시스턴트

**특징**:
- `.claude/agents/` 디렉토리에 마크다운 파일로 저장
- Skills와 Commands를 호출 가능
- 병렬 실행 지원
- 전문 지식을 가진 "시니어 개발자" 역할

**호출 방식**:
```
@agent-name "작업 설명"
```

### 2.2 Skills (스킬)
**정의**: 모듈화된 기능 패키지로, Claude가 자동으로 발견하고 사용하는 능력

**특징**:
- `.claude/skills/skill-name/` 디렉토리 구조
- `SKILL.md` 파일 필수 (YAML frontmatter 포함)
- 지원 파일 포함 가능 (스크립트, 템플릿, 문서)
- **모델 호출형** (Model-Invoked): Claude가 자동으로 활성화
- 전역(`~/.claude/skills/`) 또는 프로젝트(`.claude/skills/`) 레벨

**SKILL.md 구조**:
```yaml
---
name: skill-name
description: 스킬 설명 및 사용 시점
allowed-tools: Read, Grep, Glob  # 선택사항
---

# Skill Name
스킬 사용 방법 및 예제
```

### 2.3 Commands (커맨드)
**정의**: 사용자가 명시적으로 호출하는 재사용 가능한 프롬프트 템플릿

**특징**:
- `.claude/commands/` 디렉토리에 마크다운 파일로 저장
- **사용자 호출형** (User-Invoked): `/command-name`으로 실행
- `$ARGUMENTS` 플레이스홀더 지원
- 반복적인 작업 자동화에 최적

**호출 방식**:
```
/command-name [arguments]
```

---

## 3. 현재 시스템 구성

### 3.1 디렉토리 구조 개요

```
.claude/
├── agents/              # 17개 파일
│   ├── analytics-reporter.md
│   ├── analytics.md
│   ├── backlink-manager.md
│   ├── content-planner.md
│   ├── content-recommender.md
│   ├── editor.md
│   ├── image-generator.md
│   ├── improvement-tracker.md
│   ├── learning-tracker.md
│   ├── portfolio-curator.md
│   ├── post-analyzer.md
│   ├── prompt-engineer.md
│   ├── seo-optimizer.md
│   ├── site-manager.md
│   ├── social-media-manager.md
│   ├── web-researcher.md
│   └── writing-assistant.md
│
├── skills/              # 9개 디렉토리
│   ├── blog-automation/
│   ├── blog-writing/
│   ├── content-analysis/
│   ├── content-analyzer/
│   ├── git-automation/
│   ├── recommendation-generator/
│   ├── trend-analyzer/
│   └── web-automation/
│
├── commands/            # 7개 파일
│   ├── analyze-posts.md
│   ├── commit.md
│   ├── generate-recommendations.md
│   ├── next-post-recommendation.md
│   ├── write-ga-post.md
│   ├── write-post-ko.md
│   └── write-post.md
│
├── commands.backup/     # 백업 디렉토리
├── guidelines/          # 가이드라인 디렉토리
├── temp-agents/         # 임시 에이전트
└── settings.local.json  # 로컬 설정
```

### 3.2 통계 요약

| 카테고리 | 개수 | 총 크기 | 평균 크기 |
|---------|------|---------|-----------|
| Agents  | 17   | ~200KB  | ~11.8KB   |
| Skills  | 9    | TBD     | TBD       |
| Commands| 7    | ~128KB  | ~18.3KB   |

---

## 4. 분석 요구사항

### 4.1 기능적 요구사항
1. **에이전트 분석**
   - 각 에이전트의 역할 및 책임 파악
   - 에이전트 간 협업 패턴 도출
   - 중복 기능 식별

2. **스킬 분석**
   - 각 스킬의 SKILL.md 구조 검증
   - 스킬 발견 메커니즘 분석
   - 스킬 간 의존성 파악

3. **커맨드 분석**
   - 각 커맨드의 사용 목적 및 시나리오
   - 커맨드 재사용성 평가
   - $ARGUMENTS 활용 패턴

4. **관계 분석**
   - Agent → Skill → Command 호출 체인
   - 상호 참조 및 의존성 맵핑
   - 워크플로우 시각화

### 4.2 비기능적 요구사항
1. **유지보수성**: 구조의 이해 용이성, 확장 가능성
2. **일관성**: 네이밍, 포맷, 문서화 스타일
3. **성능**: 컨텍스트 효율성, 파일 크기
4. **보안**: 민감 정보 처리, 권한 관리

---

## 5. 성공 기준

### 5.1 완료 조건
- [ ] 모든 agents, skills, commands 파일 분석 완료
- [ ] 구조 관계 다이어그램 작성
- [ ] 베스트 프랙티스 비교 문서 작성
- [ ] 평가 보고서 작성
- [ ] 종합 요약 및 개선 제안

### 5.2 품질 기준
- 문서화: 모든 분석 결과가 마크다운 형식으로 명확히 기록
- 정확성: 공식 문서 기반 사실 검증
- 실용성: 실제 개선 가능한 구체적 제안
- 재현성: 다른 팀원이 동일한 분석 수행 가능

---

## 6. 제약사항

### 6.1 기술적 제약
- Claude Code 버전: 최신 (2025년 10월 Skills 도입)
- Astro 버전: 5.14.1
- 분석 도구: 코드 검색, 파일 읽기, 웹 검색만 사용

### 6.2 시간적 제약
- 작업 기간: 1일 (2025-11-09)
- 단계별 진행 (탐색 → 계획 → 분석 → 평가)

### 6.3 범위 제약
- 읽기 전용 분석 (코드 수정 없음)
- 공개 문서만 참조 (비공개 설정 제외)

---

## 7. 참고 자료

### 7.1 공식 문서
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)

### 7.2 커뮤니티 자료
- [Daniel Miessler: Skills vs Commands vs Agents](https://danielmiessler.com/blog/when-to-use-skills-vs-commands-vs-agents)
- [Simon Willison: Claude Skills](https://simonwillison.net/2025/Oct/16/claude-skills/)
- [Reverse Engineering Claude Code](https://levelup.gitconnected.com/reverse-engineering-claude-code-how-skills-different-from-agents-commands-and-styles-b94f8c8f9245)

---

**승인**: 작성자 확인
**날짜**: 2025-11-09
