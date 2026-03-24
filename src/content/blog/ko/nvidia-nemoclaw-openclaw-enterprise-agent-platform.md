---
title: NemoClaw — NVIDIA가 OpenClaw에 엔터프라이즈 보안을 입혔다
description: >-
  GTC 2026에서 발표된 NVIDIA NemoClaw는 OpenClaw를 기업 환경에서 안전하게 운용하기 위한 오픈소스 레퍼런스 스택이다.
  알파 단계의 현실적 한계와 가능성을 짚어본다.
pubDate: '2026-03-24'
heroImage: >-
  ../../../assets/blog/nvidia-nemoclaw-openclaw-enterprise-agent-platform-hero.png
tags:
  - nvidia
  - openclaw
  - nemoclaw
  - ai-agent
  - enterprise
  - security
relatedPosts:
  - slug: claude-agent-teams-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: sqlite-ai-swarm-build
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: adl-agent-definition-language-governance
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-cost-reality
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

```bash
nemoclaw init --model local:nemotron-3-nano-4b --policy strict
```

지난주 GTC 2026 키노트에서 젠슨 황이 이 한 줄을 라이브로 실행했다. "다운로드하면 AI 에이전트가 만들어집니다"라는 설명과 함께. 188K 스타를 찍은 OpenClaw를 NVIDIA가 엔터프라이즈용으로 감싼 프로젝트, NemoClaw의 등장이다.

솔직히 처음 들었을 때 반응은 "또 래퍼(wrapper)인가"였다. OpenClaw 위에 보안 레이어 하나 얹어서 NVIDIA 브랜드를 붙인 거 아닌가 싶었다. 그런데 실제 구조를 들여다보니, 생각보다 기업 환경에서 필요한 부분을 정확히 건드리고 있었다.

## OpenClaw의 엔터프라이즈 문제

OpenClaw를 팀에서 써본 사람이라면 알 텐데, 개인용으로는 훌륭하지만 회사에서 쓰려면 몇 가지 벽에 부딪힌다.

첫째, **데이터 유출 리스크**. OpenClaw 에이전트가 외부 API를 호출할 때 내부 데이터가 모델 제공자 서버로 나갈 수 있다. 둘째, **정책 제어 부재**. 에이전트가 무엇을 할 수 있고 없는지에 대한 거버넌스가 사실상 없다. 셋째, **감사 로그**. 에이전트가 어떤 액션을 취했는지 추적하기가 어렵다.

우리 팀에서도 OpenClaw를 내부 도구로 검토했다가 보안팀에서 "외부 모델 호출 시 데이터가 어디로 가는지 보장할 수 없다"는 이유로 보류된 적이 있다. 아마 비슷한 경험을 한 팀이 적지 않을 것이다.

## NemoClaw가 추가하는 것

NemoClaw의 핵심은 세 가지다.

**1. 로컬 모델 우선 아키텍처**

에이전트가 사용하는 LLM을 로컬에서 실행할 수 있다. Nemotron 3 Nano 4B나 Nemotron 3 Super 120B 같은 NVIDIA 자체 모델뿐 아니라, Qwen 3.5나 Mistral Small 4도 지원한다. 클라우드 모델을 쓸 때도 프록시 레이어를 거쳐서 내부 데이터가 외부로 노출되지 않도록 격리한다.

**2. 정책 엔진(Policy Engine)**

에이전트의 행동 범위를 YAML로 정의할 수 있다.

```yaml
# nemoclaw-policy.yaml
agent:
  allowed_tools:
    - file_read
    - web_search
    - code_execution
  blocked_tools:
    - file_delete
    - system_command
  data_policy:
    pii_detection: true
    external_api_allowlist:
      - api.github.com
      - api.slack.com
  audit:
    log_level: detailed
    retention_days: 90
```

이게 나는 꽤 실용적이라고 본다. 에이전트한테 "이건 해도 되고 이건 안 돼"를 선언적으로 정의할 수 있다는 건, 보안팀과의 대화를 훨씬 구체적으로 만들어준다. "에이전트 도입하고 싶은데 괜찮을까요?"보다 "이 정책 파일 기준으로 에이전트가 동작합니다"가 훨씬 설득력 있다.

**3. 감사 로그와 옵저버빌리티**

모든 에이전트 액션이 구조화된 로그로 남는다. 누가(어떤 에이전트가), 언제, 어떤 도구를, 어떤 데이터와 함께 호출했는지. 기존 SIEM이나 모니터링 시스템과 연동도 지원한다.

## 하드웨어 불가지론이라는 주장

NVIDIA가 흥미로운 포지셔닝을 했다. NemoClaw는 **NVIDIA 하드웨어가 필수가 아니다**. AMD GPU든 CPU든 돌아간다고 한다.

나는 이 부분이 좀 의심스럽다. 물론 기술적으로는 가능하겠지만, 로컬 모델 성능 최적화가 CUDA 기반으로 되어 있을 텐데 비-NVIDIA 환경에서 실용적인 성능이 나올지는 두고 봐야 한다. "지원한다"와 "잘 돌아간다"는 다른 이야기니까. DGX Spark에서 NemoClaw 데모를 보여준 것도 우연이 아닐 것이다.

## OpenClaw vs NemoClaw 비교

| 항목 | OpenClaw | NemoClaw |
|------|----------|----------|
| 대상 사용자 | 개인·개발자 | 기업·팀 |
| 모델 실행 | 로컬 + 클라우드 | 로컬 우선, 클라우드는 프록시 경유 |
| 정책 제어 | 없음 | YAML 기반 정책 엔진 |
| 감사 로그 | 기본적 | 구조화된 감사 로그 + SIEM 연동 |
| PII 감지 | 없음 | 내장 |
| 설치 | `openclaw install` | `nemoclaw init` (OpenClaw 포함) |
| 성숙도 | 프로덕션 사용 중 | 알파 단계 |
| 라이선스 | Apache 2.0 | Apache 2.0 |

## 알파라는 현실

가장 중요한 건 이거다. **NemoClaw는 아직 알파 단계**이고, NVIDIA도 이를 명시하고 있다.

GTC 키노트의 화려한 데모와 "한 줄로 에이전트 생성"이라는 메시지에 흥분하기 쉽지만, 프로덕션에 바로 올릴 수 있는 상태는 아니다. 정책 엔진의 엣지 케이스 처리, 대규모 에이전트 플릿 관리, 멀티테넌시 지원 같은 엔터프라이즈 필수 기능들이 아직 로드맵에 있다.

개인적으로는 정책 엔진의 방향성이 기대된다. 지금은 단순한 allowlist/blocklist 수준이지만, 이게 "특정 조건에서만 특정 도구 허용" 같은 조건부 정책으로 발전하면 실무에서 꽤 강력해질 수 있다. 예를 들어 "업무 시간에만 외부 API 호출 허용"이나 "시니어 엔지니어의 에이전트만 프로덕션 DB 접근 가능" 같은 시나리오.

## 엔지니어링 팀에서의 의미

NemoClaw가 성숙해지면, 에이전트 도입의 가장 큰 장벽이었던 "보안팀 설득"이 한결 수월해질 수 있다. 정책 파일 하나로 에이전트의 행동 범위를 정의하고, 감사 로그로 사후 추적이 가능하다는 건, 컴플라이언스 요구사항을 충족하는 명확한 경로가 생긴다는 뜻이다.

다만, 지금 당장 NemoClaw를 도입하겠다고 나서기보다는 **정책 파일 설계를 미리 시작하는 것**이 현실적이다. 우리 팀의 에이전트가 어떤 도구에 접근해야 하고, 어떤 데이터는 건드리면 안 되는지를 정리해두면, NemoClaw든 다른 솔루션이든 도입 시점에 바로 적용할 수 있다.

젠슨 황이 에이전트를 "다음 컴퓨팅 플랫폼"이라고 부른 건 과장일 수 있다. 하지만 에이전트가 개인 도구에서 기업 인프라로 넘어가려면 NemoClaw 같은 거버넌스 레이어가 반드시 필요하다는 건 맞는 말이다. 문제는 속도인데, 알파에서 프로덕션 레디까지 NVIDIA가 얼마나 빠르게 갈 수 있을지가 관건이다.
