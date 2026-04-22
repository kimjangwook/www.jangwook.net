---
title: "Claude Code Routines 실전 구현 가이드 — 스케줄, API, GitHub 이벤트로 AI를 24/7 자동화하는 방법"
description: "Claude Code Routines는 프롬프트·저장소·커넥터를 한 번만 설정하면 Anthropic 인프라에서 자율 실행됩니다. 스케줄, API 호출, GitHub 이벤트 세 가지 트리거 방식을 실제 설정 과정과 함께 설명하고, PR 리뷰 자동화부터 문서 드리프트 감지까지 실전 사용 사례를 공유합니다."
pubDate: '2026-04-22'
heroImage: '../../../assets/blog/claude-code-routines-practical-guide-2026-hero.jpg'
tags:
  - ClaudeCode
  - 자동화
  - AI에이전트
relatedPosts:
  - slug: claude-code-agentic-workflow-patterns-5-types
    score: 0.95
    reason:
      ko: Routines가 어떤 에이전틱 패턴에 해당하는지 이해하고 싶다면, 이 글에서 다룬 자율 에이전트 패턴 5가지가 직접적인 배경 지식이 됩니다.
      ja: RoutinesがどのエージェンティックパターンになるかをClaudeの5つのワークフローパターンと照らし合わせて理解できます。
      en: Understanding which agentic pattern Routines represent is much clearer after reading this breakdown of Claude Code's five workflow patterns.
      zh: 了解 Routines 对应哪种代理模式，可以参考这篇对 Claude Code 五种工作流模式的详细解析。
  - slug: mcp-server-build-practical-guide-2026
    score: 0.90
    reason:
      ko: Routines의 커넥터가 MCP 기반이므로, MCP 서버를 직접 구축해본 경험이 있다면 커넥터 생태계를 더 깊이 활용할 수 있습니다.
      ja: RoutinesのコネクタはMCPベースなので、MCPサーバーを実際に構築した経験があればコネクタエコシステムをより深く活用できます。
      en: Since Routines connectors are MCP-based, hands-on MCP server experience lets you extend and customize the connector ecosystem beyond the defaults.
      zh: 由于 Routines 连接器基于 MCP，拥有 MCP 服务器构建经验可以让你更深层地定制连接器生态系统。
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.87
    reason:
      ko: Git Worktree로 Claude Code를 병렬 실행하는 패턴을 익혔다면, Routines는 그 병렬성을 시간 축으로 확장하는 자연스러운 다음 단계입니다.
      ja: Git Worktreeを使った並列Claude Codeセッションを習得していれば、Routinesはその並列性を時間軸に拡張する自然な次のステップです。
      en: If you've already set up parallel Claude Code sessions with git worktrees, Routines are the natural next step—extending that parallelism across time rather than space.
      zh: 如果你已掌握用 Git Worktree 并行运行 Claude Code，Routines 是将这种并行性延伸到时间维度的自然下一步。
  - slug: claude-managed-agents-production-deployment-guide
    score: 0.82
    reason:
      ko: Routines는 단순 자동화이고 Managed Agents는 더 복잡한 멀티 에이전트 조율을 다룹니다. 두 접근법의 차이와 적합한 사용 시나리오를 비교하면 선택이 쉬워집니다.
      ja: RoutinesはシンプルなスケジュールタスクでManaged Agentsはより複雑なマルチエージェント調整に対応します。両アプローチの違いを把握することで適切な選択ができます。
      en: Routines handle scheduled automation while Managed Agents coordinate complex multi-agent workflows. Comparing the two helps you pick the right tool for each scenario.
      zh: Routines 处理计划任务，而 Managed Agents 负责更复杂的多代理编排。比较两者的差异有助于为不同场景选择合适的工具。
---

지난 주 팀원이 "어젯밤에 PR이 자동으로 리뷰됐다"고 말했을 때 잠깐 멈칫했다. 아무도 리뷰를 요청하지 않았는데, Claude가 밤 사이 PR을 열고 팀의 코딩 컨벤션에 맞게 인라인 코멘트를 남기고 요약까지 달아놨다. 그게 Claude Code Routines와의 첫 만남이었다.

Anthropic이 2026년 4월 14일 리서치 프리뷰로 공개한 Routines는 아직 베타지만, 일상적인 반복 작업을 자동화하는 방식을 꽤 다르게 바꿔놓는다. 이 글에서는 Routines가 실제로 어떻게 동작하는지, 어떻게 설정하는지, 그리고 솔직히 어디서 한계를 만나는지를 직접 써본 경험을 바탕으로 정리한다.

## Claude Code Routines란? — Prompt + Repository + Connector 3요소

공식 문서에는 이렇게 적혀 있다. "루틴은 저장된 Claude Code 설정이다: 프롬프트, 하나 이상의 저장소, 그리고 커넥터 세트가 한 번 패키징되어 자동으로 실행된다."

쉽게 말하면 세 가지 조각이 있다.

**프롬프트(Prompt)**: Claude가 매 실행 시 따를 지시사항. 중요한 점은 이 프롬프트가 대화가 아니라 완전히 독립적인(self-contained) 지시여야 한다는 것이다. "이전 맥락에서 했던 것처럼"은 통하지 않는다. 실행할 때마다 처음부터 시작한다고 생각하면 된다.

**저장소(Repository)**: Claude가 클론해서 작업할 GitHub 저장소. 기본 브랜치에서 시작하며, 여러 저장소를 지정할 수도 있다. 중요한 제약이 하나 있다. 기본적으로 Routines는 `claude/`로 시작하는 브랜치에만 푸시할 수 있다. 실수로 `main`을 건드리는 걸 막기 위한 안전장치다.

**커넥터(Connector)**: MCP(Model Context Protocol) 기반의 외부 서비스 연동. Slack, Linear, Google Drive, GitHub 등이 현재 지원된다. 커넥터를 통해 루틴이 단순히 코드만 보는 게 아니라 외부 시스템에서 읽고 쓸 수 있다.

이 세 요소가 합쳐지면 "Anthropic의 서버에서 자율적으로 실행되는 AI 에이전트"가 된다. 내 노트북이나 서버 없이.

## 시작 전 준비사항

Routines를 사용하려면 다음이 필요하다.

- Claude Code가 웹에서 활성화된 Pro, Max, Team, 또는 Enterprise 플랜
- GitHub 계정 (저장소 연동용)
- 사용하려는 MCP 커넥터(Slack, Linear 등)를 미리 연결해 둘 것

**플랜별 일일 실행 한도**:

| 플랜 | 일일 루틴 실행 횟수 |
|------|-------------------|
| Pro | 5회 |
| Max | 15회 |
| Team | 25회 |
| Enterprise | 25회 |

솔직히 Pro 플랜의 5회는 좀 타이트하다고 느꼈다. 하루에 PR이 10개 넘는 팀이라면 금방 한도에 걸린다. Routines를 제대로 활용하려면 Team 플랜 이상이 현실적이다.

## Step 1 — 첫 번째 Routine 만들기

세 가지 방법으로 루틴을 만들 수 있다.

### 웹 UI 방식 (가장 직관적)

1. `claude.ai/code/routines`로 이동
2. "New routine" 클릭
3. 루틴 이름 입력 + 프롬프트 작성
4. GitHub 저장소 선택
5. 클라우드 환경 선택 (네트워크 접근, 환경 변수, 셋업 스크립트 제어)
6. 트리거 선택: 스케줄 / API / GitHub 이벤트
7. 커넥터 설정 검토
8. Create

가장 중요한 부분은 **프롬프트 작성**이다. 아래처럼 구체적이고 자기완결적으로 써야 한다.

```
당신은 이 저장소의 코드 리뷰어입니다.

오늘 새로 열린 PR을 찾아서 다음 작업을 수행하세요:
1. PR 제목과 설명이 [저장소명] 컨벤션을 따르는지 확인
2. 변경된 파일에서 명백한 버그나 보안 이슈 확인
3. 테스트 커버리지가 충분한지 확인 (신규 함수당 테스트 1개 이상)
4. 발견한 내용을 인라인 코멘트로 남기고, PR에 요약 코멘트 추가

리뷰가 완료되면 Slack #code-review 채널에 "리뷰 완료: [PR 제목]" 메시지 전송
```

모호한 표현("적절히 리뷰해", "팀 스타일로")은 피해야 한다. 루틴은 질문을 되묻지 않는다.

### CLI 방식

Claude Code 세션에서 `/schedule` 명령어로 루틴을 만들 수 있다.

```bash
/schedule daily PR review at 9am
```

Claude가 대화식으로 필요한 정보를 물어본다. 생성 후 관리 명령어:

```bash
/schedule list          # 모든 루틴 목록
/schedule update        # 기존 루틴 수정
/schedule run           # 즉시 실행 (테스트용)
```

CLI 방식은 이미 Claude Code 세션 안에 있을 때 빠르게 루틴을 추가하는 데 편하다.

### 데스크탑 앱 방식

메뉴에서 Schedule → New task → New remote task를 선택하면 웹 UI로 연결된다.

## Routine 프롬프트를 잘 쓰는 법 — 자율 실행에서 프롬프트가 전부다

Routines에서 프롬프트는 단순한 지시문이 아니다. 아무도 질문을 받아줄 사람이 없는 상황에서 Claude가 의사결정을 내릴 때 유일하게 의존하는 기준이다.

**나쁜 프롬프트의 공통점**: 모호함, 과도한 재량, 예외 처리 부재

```
# 나쁜 예 — Claude가 해석에 따라 전혀 다른 결과를 낸다
"최근 PR을 리뷰하고 문제가 있으면 코멘트를 달아라."
```

```
# 좋은 예 — 판단 기준이 명시되어 있다
"오늘 오전 9시 이후에 열린 PR 중 base 브랜치가 main인 것을 모두 찾아라.
각 PR에 대해 CONTRIBUTING.md의 체크리스트를 기준으로 검토하고,
각 항목이 준수됐는지 여부를 inline 코멘트로 구체적으로 남겨라.
인라인 코멘트 작성 후 PR 본문에 '자동 리뷰 완료 [날짜]' 형식의 요약 코멘트를 추가하라.
LGTM 판정은 내리지 말 것."
```

**예외 처리를 명시하라.** Routine이 예상치 못한 상황을 만났을 때 어떻게 행동해야 하는지를 프롬프트에 넣어야 한다.

```
"처리 중 오류가 발생하면:
- GitHub 이슈에 오류 내용을 기록하라 (제목: '[Routine Error] [날짜]')
- 에러가 발생한 PR은 건너뛰고 다음 PR로 진행하라
- Slack #alerts 채널에 요약 메시지를 보내라"
```

**범위를 제한하라.** Claude에게 저장소 전체를 분석하라고 하면 비용도 많이 들고 불필요한 결과가 나올 수 있다. "오늘 열린 PR만", "지난 7일 이내 변경된 파일만" 같이 명시적인 시간/범위 제한을 두는 것이 좋다.

직접 경험한 바로는, 처음 루틴을 만들 때 `/schedule run`으로 즉시 실행해서 프롬프트가 의도대로 동작하는지 테스트한 뒤 실제 트리거를 연결하는 게 훨씬 안전하다. 자율 실행이 시작되면 이미 수십 번의 실수가 저장소에 쌓인 뒤에야 문제를 발견할 수 있다.

## Step 2 — 트리거 설정하기

Routines는 세 가지 트리거를 지원하며, 하나의 루틴에 여러 트리거를 동시에 걸 수 있다.

### 스케줄 트리거

반복 주기를 설정한다. 옵션:
- 매시간 / 매일 / 평일 / 매주
- 커스텀 크론 표현식

```
# 매일 오전 9시 실행 (로컬 타임존 자동 변환)
cron: 0 9 * * *

# 매주 월요일 오전 10시
cron: 0 10 * * 1
```

최소 간격은 1시간이다. 5분마다 실행 같은 폴링은 지원하지 않는다.

나는 문서 드리프트 감지 루틴에 주간 스케줄을 써봤는데, 매주 월요일 아침에 지난 주 머지된 PR을 스캔하고 오래된 API 문서를 자동으로 업데이트 PR을 여는 방식이 꽤 잘 돌아갔다. 다만 API 엔드포인트 변경 내역이 코드 주석에만 반영되고 문서에는 빠진 경우를 Claude가 항상 잡아내지는 못했다. 좀 더 정교한 프롬프트가 필요하다.

### API 트리거

각 루틴은 전용 HTTP 엔드포인트를 갖는다.

```bash
# 루틴 실행 예시
curl -X POST \
  https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire \
  -H "Authorization: Bearer {routine_token}" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -H "Content-Type: application/json" \
  -d '{"text": "이번 배포에서 api/users 엔드포인트 변경됨. 관련 문서 확인 필요."}'
```

`text` 필드에 실행 시마다 다른 컨텍스트를 넘길 수 있다. 모니터링 시스템이 이상 감지 시 알림과 함께 루틴을 트리거하는 패턴에 특히 유용하다.

예를 들어, Sentry 알림을 받으면 스택 트레이스를 분석해 최근 커밋과 연관지어 수정 초안 PR을 여는 루틴을 만들 수 있다. CI/CD 파이프라인 마지막에 API 콜로 배포 검증 루틴을 트리거하는 것도 자주 쓰는 패턴이다.

### GitHub 이벤트 트리거

이 트리거가 가장 강력하다. PR이나 릴리스 이벤트가 발생하면 자동으로 루틴이 실행된다.

지원 이벤트:
- PR: opened, closed, assigned, labeled, synchronized, updated
- Release: created, published, edited, deleted

필터 옵션이 세밀하다. PR 작성자 이름, 제목/본문 텍스트, 브랜치명, 라벨, 드래프트 여부, 머지 여부, 정규식 패턴으로 필터링할 수 있다.

```yaml
# PR 리뷰 루틴 GitHub 이벤트 설정 예시
trigger:
  type: github_event
  event: pull_request.opened
  filters:
    - author_not_in: ["dependabot[bot]", "renovate[bot]"]  # 봇 PR 제외
    - base_branch: "main"
    - labels_not_contains: ["skip-review"]
```

[MCP 서버를 직접 구축해봤다면](/ko/blog/ko/mcp-server-build-practical-guide-2026), 이 커넥터 생태계가 어떻게 확장되는지 이미 느꼈을 것이다. Routines는 그 커넥터를 자동화된 실행 환경에서 그대로 활용한다.

## Step 3 — MCP 커넥터 연결로 외부 서비스 통합

커넥터는 루틴이 외부 시스템과 소통하는 통로다. 현재 지원되는 주요 커넥터:

- **Slack**: 채널 메시지 읽기/쓰기
- **Linear**: 이슈 생성/업데이트
- **Google Drive**: 문서 읽기/쓰기
- **GitHub**: PR 코멘트, 이슈 관리 (기본 포함)

루틴을 만들 때 이미 연결된 MCP 커넥터는 기본으로 포함된다. 필요 없는 커넥터는 제거해서 루틴의 접근 범위를 최소화하는 것이 좋다. 보안 측면에서 중요한 습관이다.

실전 연동 예시:

```
[Slack + Linear 연동 이슈 트리아지 루틴]

Slack #bug-reports 채널에서 지난 24시간 내 새 메시지를 읽고:
1. 재현 가능한 버그 리포트인지 판단
2. 버그이면 Linear에 이슈 생성 (심각도: 본문에서 판단)
3. Linear 이슈 링크를 Slack 스레드에 회신
4. 불분명한 경우 Slack에서 추가 정보 요청 메시지 전송
```

이 루틴 덕분에 우리 팀에서 버그 트리아지 시간이 절반 가까이 줄었다고 경험한 팀들의 이야기를 들었다. 다만 내가 직접 운영한 결과, "재현 가능한 버그인지 판단" 부분에서 Claude가 가끔 애매한 케이스를 이슈로 만들거나 명확한 버그를 스킵하는 일이 있었다. 프롬프트에 판단 기준을 더 구체적으로 써주는 게 답이다.

[Claude Code 에이전틱 워크플로우의 5가지 패턴](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types)을 알고 있다면, Routines는 그 중 "자율 에이전트(Autonomous Agent)" 패턴을 클라우드에서 예약 실행하는 방식으로 이해하면 정확하다.

## 실전 사용 사례 4가지

실제로 잘 동작하는 Routines 유형을 정리했다.

### 사례 1: PR 자동 리뷰

가장 즉각적인 효과를 볼 수 있는 사례다. `pull_request.opened` 이벤트에 트리거를 걸고 팀의 코딩 컨벤션을 프롬프트에 넣으면, Claude가 PR이 열릴 때마다 자동으로 리뷰를 시작한다.

```
[PR 리뷰 루틴 프롬프트 핵심 부분]

저장소의 CONTRIBUTING.md에 적힌 스타일 가이드를 참고해서:
- 변수명이 camelCase 또는 snake_case 컨벤션을 따르는지 확인
- 공개 API 변경 시 CHANGELOG.md 업데이트 여부 확인
- 새 엔드포인트에 OpenAPI 스펙 추가 여부 확인

발견된 이슈는 GitHub 인라인 코멘트로, 전체 요약은 PR 코멘트로 남길 것
"LGTM" 또는 "변경 요청" 판정은 내리지 말 것 (그건 사람이 결정)
```

마지막 줄이 중요하다. Claude에게 최종 판정 권한을 주면 팀원들이 불편해할 수 있다. "발견 + 설명"까지만 하고 결정은 사람에게 넘기는 게 현실적이다.

### 사례 2: 야간 백로그 트리아지

매일 밤 새로 열린 이슈를 분류하는 루틴이다.

```
매일 자정 실행:
1. 오늘 열린 GitHub 이슈 전체 조회
2. 이슈 유형 태그 추가 (bug, feature-request, question, documentation)
3. 코드 영역별 담당자 자동 assign (CODEOWNERS 파일 참고)
4. 분류 결과를 Linear 이슈로 생성 (Slack #triage 채널에도 요약 전송)
```

이걸 직접 써보면서 깨달은 점이 있다. CODEOWNERS 파일이 최신 상태를 유지하지 않으면 루틴이 엉뚱한 사람에게 assign한다. Routines가 좋은 자동화를 만들어주는 게 아니라, 좋은 기반 자료가 있을 때 그걸 활용하는 도구다.

### 사례 3: 배포 후 스모크 테스트

CD 파이프라인 마지막에 API 루틴을 트리거한다.

```bash
# CI/CD에서 배포 완료 후 실행
curl -X POST \
  https://api.anthropic.com/v1/claude_code/routines/{smoke_test_routine_id}/fire \
  -H "Authorization: Bearer {token}" \
  -H "anthropic-beta: experimental-cc-routine-2026-04-01" \
  -d '{
    "text": "v2.3.4 배포 완료. 환경: production. 배포 시각: 2026-04-22T14:30:00Z"
  }'
```

루틴은 배포된 버전의 주요 API 엔드포인트를 호출하고, 에러 로그를 스캔하고, #releases 채널에 go/no-go 판정을 전송한다.

[MCP 서버를 Kubernetes에 프로덕션 배포하는 방법](/ko/blog/ko/mcp-server-production-deployment-kubernetes-guide)을 이미 다뤘는데, 이 스모크 테스트 루틴을 그 파이프라인의 마지막 단계로 붙이면 자연스럽게 연결된다.

### 사례 4: 주간 문서 드리프트 탐지

매주 월요일 아침, 지난 주 머지된 PR을 스캔해서 API 문서가 코드와 불일치하는 부분을 찾아 업데이트 PR을 여는 루틴이다.

솔직히 이게 제일 인상적이었다. 코드 변경과 문서 업데이트 사이의 간극을 사람이 매주 수동으로 잡기는 현실적으로 어렵다. 루틴이 이 역할을 해준다면 문서 품질을 유지하는 데 큰 도움이 된다. 단, Claude가 생성한 업데이트 PR을 무조건 머지하지 말고 반드시 사람이 검토하는 단계를 유지해야 한다.

## 솔직한 평가 — 한계와 주의사항

Routines가 인상적인 건 사실이지만, 아직 리서치 프리뷰 단계라는 점을 과소평가하면 안 된다.

**프로덕션 운영에 바로 쓰기는 이르다.** API가 `experimental-cc-routine-2026-04-01` 헤더를 요구하는 것 자체가 이 기능의 성숙도를 보여준다. API 표면이 바뀔 수 있고, 이전 두 버전만 호환성을 유지한다고 명시돼 있다. 크리티컬 경로 자동화에는 아직 검증이 더 필요하다.

**감사 추적(Audit Trail)이 부족하다.** 루틴이 왜 특정 결정을 내렸는지 파악하기 어렵다. Claude가 PR에 코멘트를 남기거나 이슈를 자동으로 생성할 때, 그 판단 근거를 로그에서 완전히 재현하기는 현재 불가능에 가깝다. 팀에서 "누가 이 코멘트를 달았나"는 알아도 "왜 이 판단을 했나"는 모를 수 있다.

**승인 체크포인트가 없다.** 루틴은 완전히 자율적으로 실행된다. 실수가 이미 저장소에 반영된 뒤에야 발견할 수 있다는 뜻이다. 기본 브랜치 푸시 제한(`claude/*` 접두사)이 어느 정도 보호막 역할을 하지만, 그 안에서도 엉뚱한 변경이 쌓일 수 있다.

**GitHub 이벤트 처리량 제한이 있다.** 리서치 프리뷰 기간 동안 GitHub 이벤트는 루틴별, 계정별 시간당 한도가 있다. PR이 많은 모노레포에 이벤트 트리거를 걸면 한도에 걸려 이벤트가 드롭될 수 있다.

**세션 재사용이 안 된다.** GitHub 이벤트가 두 번 발생하면 두 개의 독립적인 세션이 시작된다. 이전 실행의 컨텍스트를 다음 실행으로 넘길 방법이 없다.

나는 Routines를 "없어도 돌아가는 작업"에만 쓰는 원칙을 유지하고 있다. 잘못 실행돼도 사람이 쉽게 되돌릴 수 있는 작업, 실패해도 다음 실행에서 자연스럽게 보완되는 작업. 그 범위에서는 충분히 유용하다.

[Claude Code를 병렬 세션으로 운영하는 방법](/ko/blog/ko/claude-code-parallel-sessions-git-worktree)을 이미 익혔다면, Routines는 그 병렬성을 시간 축으로 확장하는 개념으로 볼 수 있다. 지금 이 순간 내가 다른 작업을 하는 동안, 루틴이 다른 저장소에서 다른 작업을 처리하고 있다.

## 결론 — 어떤 팀에게 적합한가

솔직한 입장을 말하자면, Routines는 현재 단계에서 **AI 자동화에 익숙한 팀의 실험적 도구**로 가장 적합하다.

세 가지 유형의 작업에 집중해서 시작하는 걸 권한다.

<strong>첫째</strong>, 사람이 매번 해야 하지만 규칙이 명확한 반복 작업(백로그 트리아지, 태그 분류).
<strong>둘째</strong>, 실패해도 다음 실행에서 자동 보완되는 작업(문서 드리프트 탐지).
<strong>셋째</strong>, 결과물이 사람의 최종 검토를 거치는 작업(리뷰 초안, 업데이트 PR 초안).

반면 배포 자동화, 프로덕션 데이터 수정, 외부 서비스에 메시지 전송이 최종 결과인 작업은 아직 신중하게 접근해야 한다.

Anthropic이 Routines에 추가 투자를 하고 있는 건 분명하다. 로깅 강화, GitHub 이벤트 처리량 확대, 세션 연속성 지원은 근시일 내에 나올 가능성이 높다. 지금 가볍게 써보면서 팀에 맞는 패턴을 찾아두는 게 낫다. 나중에 기능이 안정화됐을 때 이미 검증된 루틴을 확장하면 된다.

---

**참고 링크**:
- [Claude Code Routines 공식 문서](https://code.claude.com/docs/en/routines)
- [Routines 소개 블로그 포스트 (Anthropic)](https://claude.com/blog/introducing-routines-in-claude-code)
