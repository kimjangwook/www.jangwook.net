---
title: Claude Mythos Preview — AI가 '너무 잘해서' 공개를 못 한다는 게 말이 되나
description: >-
  Anthropic이 SWE-bench 93.9%를 찍은 Claude Mythos Preview를 일반 공개하지 않기로 했다. 27년 된
  OpenBSD 취약점까지 찾아낸 이 모델은 Project Glasswing을 통해 12개 기업에만 제공된다. 이게 진짜 책임감인지, 아니면
  영리한 마케팅인지.
pubDate: '2026-04-09'
heroImage: ../../../assets/blog/claude-mythos-preview-glasswing-ai-cybersecurity-hero.jpg
tags:
  - anthropic
  - claude-mythos
  - cybersecurity
  - ai-governance
  - project-glasswing
relatedPosts:
  - slug: claude-firefox-22-cves-ai-security-audit
    score: 0.95
    reason:
      ko: Mythos 이전에 Claude가 Firefox에서 22개 CVE를 찾아낸 사례다. Mythos의 보안 감사 능력이 어디서 출발했는지 맥락을 잡을 수 있다.
      ja: Mythos以前にClaudeがFirefoxで22件のCVEを発見した事例です。Mythosのセキュリティ監査能力がどこから始まったのか文脈を掴めます。
      en: Before Mythos, Claude found 22 CVEs in Firefox. This gives context for where Mythos's security audit capabilities originated.
      zh: 在Mythos之前，Claude在Firefox中发现了22个CVE。这为Mythos安全审计能力的起源提供了背景。
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.88
    reason:
      ko: MCP 프로토콜에서 발견된 30개 CVE와 엔터프라이즈 하드닝 전략. Mythos급 모델이 등장하면 MCP 보안이 더 중요해진다.
      ja: MCPプロトコルで発見された30件のCVEとエンタープライズハードニング戦略。Mythos級モデルの登場でMCPセキュリティの重要性が増します。
      en: 30 CVEs found in the MCP protocol and enterprise hardening strategies. Mythos-level models make MCP security even more critical.
      zh: MCP协议中发现的30个CVE及企业加固策略。Mythos级别模型的出现使MCP安全更加重要。
  - slug: anthropic-pentagon-ai-governance-cto-lessons
    score: 0.87
    reason:
      ko: Anthropic의 펜타곤 AI 거버넌스 사례를 다뤘다. Glasswing의 제한적 공개 결정이 같은 맥락 위에 있다.
      ja: Anthropicのペンタゴン向けAIガバナンス事例を扱っています。Glasswingの制限公開の決定が同じ文脈上にあります。
      en: Covers Anthropic's Pentagon AI governance case. The Glasswing restricted release decision sits in the same governance context.
      zh: 介绍了Anthropic的五角大楼AI治理案例。Glasswing的限制发布决策处于相同的治理背景中。
  - slug: ai-distillation-attacks-enterprise-defense
    score: 0.84
    reason:
      ko: AI 모델의 IP 보호와 증류 공격 방어 전략. Mythos처럼 강력한 모델의 접근 제한이 왜 필요한지 다른 각도에서 보여준다.
      ja: AIモデルのIP保護と蒸留攻撃防御戦略。Mythosのような強力なモデルへのアクセス制限がなぜ必要かを別の角度から見せます。
      en: AI model IP protection and distillation attack defense. Shows from another angle why restricting access to powerful models like Mythos matters.
      zh: AI模型的IP保护和蒸馏攻击防御策略。从另一个角度展示了为什么限制Mythos等强大模型的访问是必要的。
  - slug: claude-sonnet-46-release
    score: 0.82
    reason:
      ko: Claude Sonnet 4.6 출시 분석. Mythos와 같은 Anthropic 모델 라인업에서 어떤 위치인지 비교할 수 있다.
      ja: Claude Sonnet 4.6のリリース分析。Mythosと同じAnthropicモデルラインナップにおける位置を比較できます。
      en: Analysis of the Claude Sonnet 4.6 release. Compare where it sits in the same Anthropic model lineup as Mythos.
      zh: Claude Sonnet 4.6发布分析。可以比较它在与Mythos相同的Anthropic模型产品线中的定位。
draft: true
---

4월 7일, Anthropic이 Claude Mythos Preview를 발표했다. SWE-bench Verified 93.9%. USAMO 2026에서 97.6%. 모든 주요 벤치마크에서 GPT-5.4를 넘었다.

그런데 이 모델을 일반 공개하지 않는다고 한다.

이유? "사이버 보안 능력이 너무 강력해서." 모든 주요 OS와 웹 브라우저에서 수천 개의 제로데이 취약점을 자동으로 찾아냈기 때문이라고 한다. OpenBSD에서 27년 동안 숨어있던 원격 크래시 버그, FFmpeg에서 자동화 도구가 500만 번 테스트해도 못 찾은 16년 된 버그, 리눅스 커널 권한 상승 익스플로잇 체인까지.

나는 이 발표를 보고 두 가지 생각이 동시에 들었다. "와, 진짜 대단하네"와 "이거 너무 깔끔한 스토리 아닌가?"

## Project Glasswing이라는 이름

Anthropic은 Mythos Preview를 Project Glasswing이라는 프로그램을 통해 12개 기업에만 제공한다. Amazon, Apple, Google, Microsoft, Nvidia — 이름만 봐도 빅테크 올스타다. Palo Alto Networks, CrowdStrike, Cloudflare, Cisco, Broadcom 같은 보안 기업도 포함됐다.

$1억 규모의 사용 크레딧을 제공하면서 "방어적 사이버 보안 용도로만 쓰라"는 조건을 붙였다.

Glasswing은 투명한 날개를 가진 나비 종류다. "투명하게 운영하겠다"는 의미를 담은 것 같은데, 솔직히 이름 짓기를 잘한다고 생각했다. 기술 기업의 브랜딩 능력은 정말 배울 게 많다.

## 벤치마크를 좀 뜯어보면

Mythos Preview의 숫자들은 확실히 인상적이다.

- **SWE-bench Verified**: 93.9% (Opus 4.6은 80.8%, GPT-5.4는 대략 73%)
- **SWE-bench Pro**: 77.8%
- **USAMO 2026**: 97.6% (Opus 4.6 42.3%, GPT-5.4 95.2%)
- **GPQA Diamond**: GPT-5.4 대비 +1.7pt
- **HLE with tools**: GPT-5.4 대비 +12.6pt

Opus 4.6에서 Mythos로의 점프가 13포인트라는 건, 한 세대 내에서 나오기 어려운 폭이다. 이 정도면 아키텍처 수준에서 뭔가 달라졌을 가능성이 높다.

그런데 내가 주목하는 건 벤치마크 숫자보다 "자율적으로 취약점을 찾고 익스플로잇까지 개발했다"는 부분이다. Anthropic의 레드팀 보고서에 따르면, 테스트 중에 모델이 예상치 못한 행동을 보였다고 한다. 격리 환경을 우회하거나, 지시 없이 익스플로잇을 자율적으로 시연한 경우도 있었다고.

이건 벤치마크 점수와는 차원이 다른 이야기다.

## "공개하지 않겠다"의 진짜 의미

여기서 좀 비판적으로 봐야 할 부분이 있다.

Anthropic은 "위험하니까 공개하지 않는다"고 했지만, 실제로는 12개 빅테크에 $1억 크레딧과 함께 배포하고 있다. 이건 "공개하지 않는" 게 아니라 "선택적으로 공개하는" 거다. 받는 쪽은 세계에서 가장 자원이 풍부한 기업들이고, 크레딧까지 받으니 사실상 무료 체험 마케팅에 가깝다.

나는 이게 나쁜 결정이라고 보지는 않는다. 오히려 현실적인 판단이라고 생각한다. 다만 "책임감 있는 AI 기업"이라는 프레이밍이 좀 과하다는 거다. 보안 기업 12곳에 1억 달러치 크레딧을 뿌리는 건, 엔터프라이즈 시장 공략의 정석이기도 하니까.

Simon Willison은 [자신의 블로그](https://simonwillison.net/2026/Apr/7/project-glasswing/)에서 "제한적 공개가 필요해 보인다"고 평가했는데, 나도 그 판단 자체에는 동의한다. 문제는 이런 결정의 기준이 Anthropic 한 회사에 있다는 점이다.

## Glasswing 패러독스

Picus Security가 이걸 잘 짚었다. ["모든 것을 부술 수 있는 것이 모든 것을 고치는 것이기도 하다."](https://www.picussecurity.com/resource/blog/anthropics-project-glasswing-paradox)

Mythos가 찾아낸 취약점들은 진짜다. 27년 된 OpenBSD 버그가 지금까지 살아있었다는 건, 기존의 보안 감사 체계가 놓치고 있었다는 뜻이다. 그리고 이런 버그를 AI가 자동으로 찾을 수 있다면, 공격자 쪽에서도 비슷한 능력을 가진 모델을 만드는 건 시간문제일 뿐이다.

그래서 Anthropic의 선택지는 사실 두 가지밖에 없었다고 본다:

1. 공개해서 모두가 방어 도구로 쓸 수 있게 하되, 공격에도 쓰일 위험을 감수한다
2. 제한 공개해서 방어자에게 먼저 시간을 준다

Anthropic은 2번을 골랐다. 합리적인 선택이지만, 이건 "방어자"가 빅테크 12곳이라는 전제가 깔려 있다. 중소기업이나 오픈소스 프로젝트의 보안은 이 구도에서 빠져 있다.

## 이 흐름이 어디로 가는지

Claude가 Firefox에서 22개 CVE를 찾아낸 게 몇 달 전이다. 그때도 "AI가 보안 감사를 바꾼다"는 이야기가 나왔는데, Mythos는 그 수준을 완전히 다른 차원으로 끌어올렸다.

개인적으로 기대되는 건, 이런 능력이 결국 민주화될 수밖에 없다는 점이다. 지금은 Project Glasswing 참여 기업만 쓸 수 있지만, 1~2년 안에 비슷한 수준의 오픈소스 보안 에이전트가 나올 거라고 본다. 이미 Opus 4.6 수준에서도 상당한 보안 감사가 가능하니까.

그때까지 해야 할 건, 자기 코드베이스의 보안 부채를 줄이는 거다. 27년 된 버그가 OpenBSD에도 있었다면, 우리 프로젝트에 없다고 장담할 수 있는 사람은 아무도 없다.

Anthropic이 Mythos를 "너무 위험해서 공개 못 한다"고 포장한 건 영리하다. 하지만 진짜 질문은 다른 데 있다. AI가 이 수준의 보안 능력을 갖게 된 지금, "누가 이 도구에 접근할 수 있는가"가 곧 보안 격차를 결정한다는 것이다.

그리고 그 접근권은 지금, $1억 크레딧과 함께 12개 기업에만 돌아갔다.
