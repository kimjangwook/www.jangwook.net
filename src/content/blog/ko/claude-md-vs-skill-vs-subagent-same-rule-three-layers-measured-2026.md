---
title: "같은 규칙을 CLAUDE.md, 스킬, 서브에이전트로 옮겨보니 결정 기준은 비용이 아니었다"
description: "CLAUDE.md, SKILL.md, 서브에이전트는 적용 범위와 수명이 서로 다른 문제를 푼다. 세 계층을 가르는 진짜 경계는 강제력이며, 셋 중 어느 것도 통제 평면이 아니다."
pubDate: 2026-08-24
heroImage: '../../../assets/blog/claude-md-vs-skill-vs-subagent-same-rule-three-layers-measured-2026/hero.png'
tags:
  - AI Engineering
  - Agent Architecture
  - Developer Productivity
relatedPosts: []
---

같은 규칙을 CLAUDE.md에서 스킬로, 다시 서브에이전트로 옮기면 컨텍스트 비용이 실제로 줄어드는지 알고 싶었다. 문서에 적힌 로딩 경로를 따라가 보고, 토큰 수치를 믿기 전에 측정 하네스부터 검증하려고 Claude CLI 명령을 통제된 조건에서 한 번 돌렸다. 결론은 이렇다. 계층 선택은 비용을 깎는 수단이 아니라 적용 범위, 수명, 격리, 강제력을 정하는 결정이다.

이게 중요한 이유는 팀들이 에이전트 지시문을 사실상 프로덕션 운영 절차로 쓰기 시작했기 때문이다. 내 결론은 단순하다. 배치 규칙을 정하고, 중복된 지침을 걷어내고, 타협 불가능한 통제는 훅으로 내린다.

## 문제는 규칙을 어디에 쓸지가 아니다

아키텍처 현대화 작업을 하다 보면 이 질문이 늘 같은 형태로 온다. 에이전트가 이 지시를 따르게 하려면 어디에 넣어야 하나.

프로젝트 규칙 하나가 CLAUDE.md에 추가된다. 그게 불어난다. 누군가 긴 절차를 SKILL.md로 옮긴다. 그래도 절차가 미덥지 않으니 전용 서브에이전트가 생긴다. 몇 번 반복하고 나면 같은 지시가 세 군데에 존재하고, 특정 실행에서 어느 사본이 실제로 로드됐는지 아무도 말하지 못하며, 나중의 수정 하나가 모순을 만든다.

이건 토큰 효율 문제로 끝나지 않는다. 신원, 금융 기록, 개인정보를 다루는 시스템에서는 감사 가능성 문제가 된다. "로그에 PII를 쓰지 마라"가 컨텍스트에 들어 있다는 사실은 그 행동이 차단됐다는 증거가 아니다. 프롬프트에 놓인 규칙은 행동에 영향을 주려는 시도다. 행동을 막는 통제는 성격이 다른 시스템 구성요소다.

Claude Code 문서는 그 구분을 분명히 적어둔다.

> "Both are loaded at the start of every conversation. Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead."

> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

EM 입장에서는 리뷰의 질문이 달라진다. 지시문이 잘 쓰였는지만 묻지 마라. 비즈니스가 그걸 조언으로 기대는지, 워크플로 안내로 기대는지, 격리로 기대는지, 아니면 실제 예방 통제로 기대고 있는지를 물어야 한다.

## 세 계층은 서로 다른 경로로 로드된다

CLAUDE.md는 상주 컨텍스트다. 세션 시작 시점에 로드되고 대화와 나란히 토큰을 소모한다.

> "CLAUDE.md files are loaded into the context window at the start of every session, consuming tokens alongside your conversation."

> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

그래서 CLAUDE.md는 짧고 안정적인 프로젝트 사실에 어울린다. 저장소 관례, 타협 불가능한 아키텍처 제약, 작업 내내 정말로 필요한 소수의 규칙 정도다. 다만 시스템 프롬프트는 아니다. 문서는 그 내용이 시스템 프롬프트 이후 사용자 메시지로 전달된다고 말한다. 강제 설정이 아니라 컨텍스트라는 뜻이다.

스킬은 비용의 모양이 다르다. 에이전트가 발견할 수 있도록 설명만 노출되고, 본문 지시는 호출될 때 로드된다.

> "Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

점진적 공개이고, 쓸모 있는 성질이다. 하지만 "필요하기 전까지 거의 공짜"가 "필요한 다음에도 거의 공짜"라는 뜻은 아니다. 한 번 호출되면 렌더된 스킬 내용은 남은 세션 내내 대화에 남는다. 문서는 그 경제적 귀결을 직접 못 박는다.

> "Once a skill loads, its content stays in context across turns, so every line is a recurring token cost."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

그러니 스킬은 본질적으로 싼 물건이 아니다. 비용이 시작되는 시점을 미룰 뿐이다. 컴팩션 시 Claude Code는 각 스킬의 최근 호출본을 요약 뒤에 다시 붙이는데, 합산 25,000 토큰 예산 안에서 스킬마다 앞부분 5,000 토큰을 유지한다. 호출된 스킬이 많으면 오래된 것은 통째로 빠질 수 있다.

서브에이전트는 또 다른 범주다. 부모 대화를 물려받는 대신 격리된 컨텍스트에서 시작한다.

> "Each subagent starts with a fresh, isolated context window. It doesn't see your conversation history, the skills you've already invoked, or the files Claude has already read."

> — [Subagents](https://code.claude.com/docs/en/sub-agents)

작업이 메인 컨텍스트를 오염시킬 상황이라면 이 격리가 유용하다. 그렇다고 서브에이전트가 빈 손으로 출발한다는 뜻은 아니다.

## 최적화 논리는 상속이 시작되는 지점에서 무너진다

흔한 이주 서사는 이렇게 말한다. CLAUDE.md는 비싸고, 스킬은 지연 로드되고, 서브에이전트는 격리돼 있다. 그러니 지시를 아래로 내리면 비용이 떨어진다.

공식 문서의 동작 방식은 그걸 일반 규칙으로 뒷받침하지 않는다.

포크가 아닌 서브에이전트는 자기 작업 메시지와 시스템 컨텍스트로 시작하지만, 메인 대화가 로드하는 CLAUDE.md 계층도 함께 받는다. 그 계층이 무인 실행에서 실제로 무엇을 읽어오는지는 @import와 심볼릭 링크를 21번 돌려 확인한 기록에 정리해 뒀다. 사용자 수준, 프로젝트, 로컬, 관리 정책 파일이 여기에 들어간다. 내장 Explore와 Plan 에이전트가 명시된 예외다.

기동 경로는 사전 로드된 스킬의 의미도 바꾼다. 일반 세션에서 스킬은 필요할 때까지 열리지 않을 수 있다. 스킬이 설정된 서브에이전트에서는 스킬 전문이 기동 시점에 주입된다.

> "Subagents with preloaded skills work differently: the full skill content is injected at startup."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

리더가 기억할 아키텍처 요점이 여기다. 점진적 공개는 파일 포맷의 속성이 아니다. 로딩 경로의 속성이다.

SKILL.md 포맷은 [개방 표준으로 공개](/ko/blog/ko/anthropic-agent-skills-standard)되고 여러 에이전트 제품이 채택하면서 이식성이 좋아졌다. 재사용 절차를 두기에 합리적인 자리라는 뜻이다. 그렇다고 모든 런타임이, 특히 서브에이전트 구현마다, 동일한 지연 로딩 동작을 보존한다는 보장은 아니다.

> "Discovery: At startup, agents load only the name and description of each available skill... Full instructions load only when a task calls for them, so agents can keep many skills on hand with only a small context footprint."

> — [Agent Skills Overview](https://agentskills.io/home)

아키텍처 거버넌스 문서에서 "무엇이 상속되는가"와 "언제 로드되는가"는 별도의 열로 적어야 한다. 이 둘을 한 덩어리로 이해한 팀은 비용 사고와 컴플라이언스 사각지대를 함께 만든다.

## 가장 강한 반론은 특정 구간에서 옳다

가장 강한 반론은 서브에이전트가 부모 대화 이력을 받지 않는다는 점이다. 오래 돌아간 세션이라면 그 이력은 짧은 CLAUDE.md보다 훨씬 클 수 있다. 서브에이전트가 짧은 요약만 돌려준다면, 긴 이력을 옮기지 않아 아낀 양이 상속된 프로젝트 지시를 크게 웃돈다.

이 반론은 세 조건이 동시에 성립할 때 옳다.

- 부모 세션에 이미 상당한 대화 이력이 쌓여 있다.
- CLAUDE.md가 200줄이라는 운영 기준 안에서 절제돼 있다.
- 서브에이전트가 상세 기록이 아니라 간결한 결과를 돌려준다.

이 조건 아래에서는 서브에이전트가 경제적으로 더 나은 선택이 될 수 있다. 탐색 자료, 소란스러운 저장소 조사, 중간 추론을 본 작업 컨텍스트에서 떼어놓으니 결과 품질도 좋아진다.

하지만 이 반론이 "규칙을 서브에이전트로 옮기면 대체로 싸다"를 증명하지는 않는다. 세션 초반의 짧은 위임, CLAUDE.md가 계층마다 비대해진 모노레포, 서브에이전트가 상세 결과를 돌려주는 경우에는 힘을 잃는다. 반환 경로가 중요한 이유는 완료된 서브에이전트 결과가 메인 대화로 들어오기 때문이다.

문서는 그 왕복을 직접 경고한다.

> "When subagents complete, their results return to your main conversation. Running many subagents that each return detailed results can consume significant context."

> — [Subagents](https://code.claude.com/docs/en/sub-agents)

그러므로 서브에이전트 결정은 워크플로 트랜잭션으로 평가해야 한다. 기동 컨텍스트, 격리 상태에서 수행한 작업, 부모로 돌아오는 결과까지 묶어서 본다. 새 컨텍스트 창만 보는 건 분산 서비스를 요청 핸들러 비용만으로 평가하면서 직렬화와 네트워크 전송, 응답 페이로드를 빼놓는 것과 같다.

## 토큰 측정에는 프로덕션 텔레메트리와 같은 엄밀함이 필요하다

계층별 토큰 측정치는 내놓을 게 없다. 계획했던 실행 묶음은 종료 코드 0으로 끝났지만, 파서가 최상위를 JSON 객체로 가정한 탓에 CLI가 배열을 돌려준 뒤로 쓸 만한 수치가 하나도 나오지 않았다. 올바른 결론은 어떤 계층이 쌌다 비쌌다가 아니라, 측정이 수집되지 않았다는 것이다.

Claude CLI 2.1.241로 명령을 한 번 통제해 돌렸을 때 `claude --output-format json`은 딕셔너리가 아니라 최상위 리스트를 반환했다. 리스트에는 `system`, `assistant`, `rate_limit_event`, `result` 요소가 들어 있었고 사용량 데이터는 `result` 요소 안에 있었다. 헤드리스 모드 문서는 형식을 다르게 설명한다.

> "json: structured JSON with result, session ID, and metadata"

> — [Headless mode](https://code.claude.com/docs/en/headless)

평범한 실패지만 경영 관점에서 의미가 있다. AI 비용 거버넌스가 최상위 타입도 확인하지 않고 출력 스키마를 가정하는 스크립트 위에 서 있으면 안 된다. 대시보드는 측정되지 않은 실행을 두고도 정확해 보이는 0을 띄운다. 데이터가 없는 것보다 나쁘다. 잘못된 확신 위에서 결정을 내리게 만들기 때문이다.

공식 서브에이전트 문서도 2026-08-24 기준으로 스폰당 토큰 수치를 밝히지 않는다. 한 2차 자료가 멀티 에이전트 워크플로에 4-7배 배수를 붙이지만, 그 자료가 내세운 공식 출처는 대응하는 공식 페이지나 발언으로 확인되지 않았다. 참고점이지 예산 모델이 아니다.

> "Anthropic's own documentation notes that multi-agent workflows use roughly 4-7x more tokens than single-agent sessions"

> — [Claude Code Agents & Subagents — What They Actually Unlock](https://www.ksred.com/claude-code-agents-and-subagents-what-they-actually-unlock/)

CFO와 CTO는 클라우드 단위 경제성에 적용하던 기준을 그대로 요구해야 한다. 관측된 소비, 문서화된 한계, 모델 가정, 외부 주장은 서로 바꿔 쓸 수 있는 물건이 아니다.

## 계층 배치를 팀의 운영 체계로 만든다

실무적 답은 풀 리퀘스트에서 리뷰할 수 있는 네 갈래 배치 정책이다.

| 필요 | 배치 | 리뷰 질문 |
| --- | --- | --- |
| 작업 전반에 필요한 안정된 프로젝트 사실 | CLAUDE.md | 정말 모든 세션에 필요한가 |
| 특정 작업에 쓰이는 다단계 절차 | SKILL.md | 절차를 더 줄일 수 있고, 관련될 때만 호출되는가 |
| 요약 결과로 끝나는 격리된 조사 | 서브에이전트 | 격리 이득이 기동과 반환 컨텍스트 비용을 넘는가 |
| 행동을 반드시 막아야 하는 규칙 | PreToolUse 훅 | 모델의 준수 여부와 무관하게 테스트하고 감사할 수 있는가 |

정책은 선언이 아니라 굴러가는 물건이어야 한다.

첫째, CLAUDE.md를 200줄로 묶는다. 팀 규율이다. 숫자가 신비로운 게 아니라 상한을 둔다는 결정이 핵심이다. 상주하는 모든 줄은 이 도전을 견뎌야 한다. 모든 세션이 이걸 필요로 하는가, 아니면 빠진 절차나 테스트, 린터 규칙, 훅을 문장으로 때우고 있는가.

둘째, 서브에이전트가 스킬을 사전 로드할 때는 길이를 명시하게 한다. PR 설명에 스폰마다 스킬 본문이 기동 시점에 주입된다는 사실을 적게 한다. 가장 비싼 오해를 프로덕션 워크플로에 도달하기 전에 잡는다.

셋째, CLAUDE.md와 스킬, 서브에이전트 프롬프트를 훑어 중복 규칙을 찾는다. 중복 지시는 반복 컨텍스트 비용을 만들지만 더 심각한 건 분기다. 두 사본이 갈라지는 순간 팀은 문서화되지 않은 우선순위 체계를 하나 만든 셈이다.

넷째, 컨텍스트 점검을 온보딩에 넣는다. 엔지니어는 저장소 구조에서 짐작하지 말고 실제로 로드된 메모리 파일을 확인해야 한다. 규율은 간단하다. 로드하려던 것과 실제로 로드된 것을 구분한다.

마지막으로, 측정 하네스를 프로덕션 도구처럼 버전 관리한다. 출력은 방어적으로 파싱하고, 원본 산출물을 보관하고, 스키마 불일치는 비용 0이 아니라 실패한 측정으로 처리한다.

## CEO와 CTO가 내릴 결정은 프롬프트 최적화가 아니라 거버넌스다

이 규율의 비즈니스 근거는 토큰을 몇 퍼센트 줄여준다는 약속이 아니다. 통제 없이 번지는 운영 행동을 줄인다는 데 있다.

배치 정책이 없으면 지시문 총량이 팀 규모를 따라 늘어난다. 새 엔지니어는 가장 눈에 띄는 파일에 규칙을 더한다. 전문 인력은 병렬 스킬을 만든다. 자동화 담당자는 그걸 서브에이전트에 사전 로드한다. 비용 귀속이 어려워지고, 중요한 워크플로가 돌던 시점에 어떤 정책이 살아 있었는지 아무도 증명하지 못한다.

배치 정책이 있으면 세 가지가 동시에 나아진다.

단위 경제성이 리뷰 가능해진다. 상주 컨텍스트, 호출된 절차, 스폰된 작업에 각각 이름 붙은 주인과 보이는 경계가 생기기 때문이다. 사용량이 늘면 비용도 늘겠지만, 조용한 중복이 아니라 관측 가능한 결정을 거쳐 늘어난다.

컴플라이언스 방어가 쉬워진다. 팀이 컨텍스트 지시를 통제로 착각하지 않게 되기 때문이다. 민감 데이터 제한, 프로덕션 명령 게이트, 시크릿 취급 규칙은 [훅으로 옮겨](/ko/blog/ko/claude-code-hooks-workflow) 시스템이 요청 대신 차단하게 만들 수 있다.

출시 속도도 빨라진다. 에이전트 관련 PR마다 배치를 원점에서 논쟁하지 않아도 되기 때문이다. 운영 모델이 명확하면 설계 churn이 줄고 팀의 주의는 실제 제품이나 마이그레이션 작업으로 돌아간다.

내 권고는 CLAUDE.md, SKILL.md, 서브에이전트를 세 단계 요금제처럼 다루지 말라는 것이다. CLAUDE.md는 짧은 상시 컨텍스트에, 스킬은 선택적으로 호출되는 절차에, 서브에이전트는 격리에, 훅은 강제에 쓴다. 이 권고를 바꿀 조건은 하나다. 믿을 만한 계층별 텔레메트리가 중복되고 상속된 지시를 그대로 두는 편이 걷어내는 편보다 일관되게 싸다고 보여줄 때다.

## 참고 자료

1. [Extend Claude with skills](https://code.claude.com/docs/en/skills)
2. [Subagents](https://code.claude.com/docs/en/sub-agents)
3. [How Claude remembers your project](https://code.claude.com/docs/en/memory)
4. [Agent Skills Overview](https://agentskills.io/home)
5. [Headless mode](https://code.claude.com/docs/en/headless)
6. [Claude Code Agents & Subagents — What They Actually Unlock](https://www.ksred.com/claude-code-agents-and-subagents-what-they-actually-unlock/)
