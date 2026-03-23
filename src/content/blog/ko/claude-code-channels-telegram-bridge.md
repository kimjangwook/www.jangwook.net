---
title: Claude Code Channels로 텔레그램에서 코딩 시키기 — OpenClaw 사용자가 본 솔직한 비교
description: >-
  Claude Code에 Channels 기능이 추가됐다. 텔레그램에서 메시지를 보내면 로컬 터미널의 Claude가 코드를 실행하고 답장한다.
  OpenClaw의 채널 개념을 가져오면서도 보안 모델을 완전히 다르게 설계한 점이 흥미롭다.
pubDate: '2026-03-21'
heroImage: ../../../assets/blog/claude-code-channels-telegram-bridge-hero.jpg
tags:
  - claude-code
  - ai-agents
  - automation
relatedPosts:
  - slug: llm-pm-workflow-automation
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: claude-agent-teams-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: effiflow-automation-analysis-part3
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: jules-autocoding
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
---

지난 3월 20일, Claude Code v2.1.80에 `--channels`라는 플래그가 하나 추가됐다. 이게 뭔가 했더니, 텔레그램이나 디스코드에서 메시지를 보내면 내 로컬 터미널에서 돌고 있는 Claude가 그걸 받아서 코드를 실행하고, 결과를 다시 메신저로 보내주는 기능이다.

솔직히 처음 봤을 때 "이거 OpenClaw이 하던 거 아닌가?" 싶었다. 맞다. 개념적으로는 거의 같다. 하지만 실제로 세팅해서 써보니 접근 방식이 상당히 다르다.

---

## 채널이 뭔데?

간단하게 말하면, 외부 메시징 플랫폼과 Claude Code 세션 사이의 **양방향 브릿지**다.

```
텔레그램에서 "빌드 로그 확인해줘" →
  → Claude Code 세션이 메시지 수신 →
  → 로컬 파일시스템에서 로그 읽기 →
  → 분석 결과를 텔레그램으로 회신
```

핵심은 **로컬 실행**이라는 점이다. 클라우드 샌드박스가 아니라 내 맥북에서 돌아간다. git, 파일시스템, MCP 서버 전부 접근 가능. 그래서 "CI 실패했어, 원인 찾아줘"라고 텔레그램에서 보내면 실제로 로그를 읽고 코드를 수정하는 것까지 된다.

실행도 간단하다:

```bash
claude --channels plugin:telegram@claude-plugins-official
```

플래그 하나 붙이면 끝. 텔레그램 봇 토큰 세팅하고 페어링 코드로 인증하면 바로 사용 가능하다.

---

## OpenClaw에서 가져온 것, 바꾼 것

나는 OpenClaw을 꽤 오래 써왔다. 크론 연동, 멀티채널 설정 등을 이 블로그에서도 여러 번 다뤘다. 그래서 Claude Code Channels를 보는 눈이 좀 다를 수밖에 없다.

**가져온 핵심 개념:**
- 메시징 플랫폼 → AI 에이전트로의 메시지 주입
- 채널 어댑터 패턴 (플랫폼별 메시지 정규화)
- 양방향 통신 (요청 → 처리 → 회신)

**Claude만의 변경점:**

첫째, **MCP 서버 기반 아키텍처**. OpenClaw은 자체 어댑터 프레임워크를 쓰지만, Claude Code는 이미 생태계가 있는 MCP 표준 위에 채널을 올렸다. `claude/channel` capability 플래그를 선언하는 MCP 서버가 곧 채널 플러그인이다. 기존 MCP 인프라를 재활용한 셈인데, 이 판단은 꽤 현명하다고 본다. 새로운 프로토콜을 학습할 필요가 없으니까.

둘째, **보안 모델이 완전히 다르다**. 이게 가장 큰 차이점이다.

OpenClaw은 웹훅 기반이라 인바운드 포트를 열어야 하는 경우가 있다. Claude Code Channels는 **아웃바운드 폴링만 사용**한다. 내 머신에서 외부로 나가는 연결뿐이라 인바운드 포트가 열리지 않는다. 여기에 allowlist 기반 발신자 인증까지 붙어있어서, 등록된 사용자만 메시지를 보낼 수 있다.

나처럼 집 맥미니에서 에이전트를 돌리는 사람에게는 이 차이가 체감된다. OpenClaw 쓸 때는 ngrok이나 Cloudflare Tunnel을 통해서 외부 접근을 열어줬는데, 그 과정이 통째로 사라졌다.

셋째, **세션 단위 동작**. OpenClaw은 독립 데몬으로 항상 떠 있지만, Claude Code Channels는 세션이 열려 있을 때만 작동한다. 이건 장점이자 단점인데, 뒤에서 더 얘기하겠다.

---

## 베타에서 부딪힌 한계들

"research preview"라는 라벨이 붙어있는 만큼, 실사용에서 걸리는 부분이 있다.

**플랫폼이 2개뿐이다.** 텔레그램과 디스코드. Slack이 없다는 게 가장 크다. 업무용으로 쓰려면 Slack 연동은 거의 필수인데, 현재로선 방법이 없다. OpenClaw이 50개 이상의 플랫폼을 지원하는 것과 비교하면 초라한 수준. 다만 MCP 기반이니 커스텀 채널을 만들 수는 있는데, 베타 기간에는 `--dangerously-load-development-channels` 플래그를 써야 해서 프로덕션 감은 아니다.

**세션이 닫히면 끝이다.** 가장 아쉬운 부분. 텔레그램에서 메시지를 보냈는데 Claude Code 세션이 꺼져 있으면 그 메시지는 유실된다. 큐잉이 없다. launchd나 systemd로 백그라운드 프로세스를 띄워서 해결할 수 있지만, "always-on"이 기본이 아니라 직접 구성해야 한다는 점이 불편하다.

**퍼미션 프롬프트가 세션을 멈춘다.** Claude Code는 위험한 작업(파일 삭제, git push 등)을 할 때 사용자 승인을 요청한다. 문제는 텔레그램에서 원격으로 작업을 시켰는데, 퍼미션 프롬프트가 뜨면 로컬 터미널에서 직접 승인해야 한다는 것. `--dangerously-skip-permissions`로 우회할 수 있지만, 이름에 "dangerously"가 붙은 건 이유가 있다.

**Personal Max 플랜 버그.** 일부 사용자가 `--channels` 플래그가 무시되는 문제를 보고했다. 자동 생성된 orgId가 Enterprise 계정으로 잘못 인식되는 버그라고 한다. 아직 패치되지 않은 것 같다.

---

## 그래서 실제로 뭘 할 수 있나

나는 현재 이 블로그의 자동 포스팅 파이프라인을 Claude Code + launchd 크론으로 돌리고 있다. 여기에 Channels를 연결하면 재밌어지는 시나리오가 몇 가지 있다.

**1. CI/CD 알림 → 즉시 디버깅**

GitHub Actions에서 빌드 실패 시 웹훅으로 텔레그램에 알림이 온다. 지금은 그걸 보고 터미널을 열어서 수동으로 확인하는데, Channels가 있으면 텔레그램에서 바로 "빌드 로그 보고 원인 분석해줘"라고 보내면 된다. Claude가 로그를 읽고, 관련 코드를 찾고, 수정안까지 제안한다.

**2. 모바일에서 경량 코딩 요청**

외출 중에 "블로그 포스트 빌드 돌려봐" 또는 "어제 커밋 revert 해줘"를 텔레그램으로 보낼 수 있다. 노트북을 열 필요가 없다.

**3. 모니터링 이벤트 기반 자동 대응**

크론 작업이 실패하면 에러 로그를 채널로 포워딩하고, Claude가 자동으로 원인을 분석해서 텔레그램으로 보고하는 플로우. 이건 OpenClaw에서도 비슷하게 구성했던 건데, Claude Code의 파일시스템 접근이 직접적이라 중간 API 호출 없이 로그를 바로 읽을 수 있다는 게 다르다.

---

## OpenClaw vs Claude Code Channels, 솔직한 선택 기준

둘 다 써본 입장에서, 이건 "어느 게 더 좋냐"의 문제가 아니다.

**OpenClaw을 유지해야 하는 경우:**
- Slack, WhatsApp 등 텔레그램/디스코드 이외 플랫폼이 필요할 때
- Claude 외 다른 LLM(GPT, Gemini 등)을 함께 쓸 때
- 무료로 운용하고 싶을 때 (Claude Code는 구독 필요)
- 이미 OpenClaw 기반으로 파이프라인이 구축되어 있을 때

**Claude Code Channels가 나은 경우:**
- 로컬 파일시스템 직접 접근이 핵심일 때
- 보안이 중요하고 인바운드 포트를 열고 싶지 않을 때
- 이미 Claude Code를 주력으로 쓰고 있을 때
- 세팅에 시간을 최소화하고 싶을 때 (플래그 하나로 끝)

개인적으로 나는 두 가지를 병행할 생각이다. 크론 기반 자동화는 기존 OpenClaw 파이프라인을 유지하고, 텔레그램 기반 대화형 코딩 요청은 Claude Code Channels로 전환하는 게 현실적이다.

---

## 앞으로 지켜볼 것

Channels가 베타를 졸업하면 커스텀 채널 플러그인 생태계가 핵심이 된다. MCP 서버 구조라서 누구나 채널을 만들 수 있는데, Anthropic이 이걸 얼마나 열어줄지가 관건이다. 지금은 공식 플러그인만 허용하고 커스텀은 `dangerously-` 플래그가 필요한 상태.

Slack 채널 플러그인이 나오는 시점이 실질적인 채택 분기점이 될 거라고 본다. 개인 개발자는 텔레그램으로 충분하지만, 팀 단위로 쓰려면 Slack은 필수니까.

그리고 퍼미션 모델 개선도 중요하다. 원격에서 작업을 시키는데 로컬 터미널에서 승인해야 하는 건 UX 병목이다. 텔레그램 인라인 버튼으로 승인/거부를 처리하는 방식 같은 게 나올 수 있을 것 같은데, 보안과 편의 사이의 줄타기가 쉽지 않을 것이다.

---

## 참고 자료

- [Claude Code Channels 공식 문서](https://code.claude.com/docs/en/channels)
- [VentureBeat: Anthropic just shipped an OpenClaw killer called Claude Code Channels](https://venturebeat.com/orchestration/anthropic-just-shipped-an-openclaw-killer-called-claude-code-channels)
- [The Decoder: Anthropic turns Claude Code into an always-on AI agent](https://the-decoder.com/anthropic-turns-claude-code-into-an-always-on-ai-agent-with-new-channels-feature/)
- [OpenClaw 공식 문서 — Channels](https://docs.openclaw.ai/cli/channels)
