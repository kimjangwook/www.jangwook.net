---
title: Hermes Agent — 작업할수록 스스로 진화하는 오픈소스 AI 에이전트
description: >-
  NousResearch의 Hermes Agent v0.7.0을 설치해봤다. 작업을 마칠 때마다 스킬 문서를 자동 생성하고, 다음 실행에서
  그걸 참조하는 자기 진화 루프가 실제로 동작하는지 확인한 기록.
pubDate: '2026-04-12'
heroImage: ../../../assets/blog/hermes-agent-self-evolving-ai-framework-hero.jpg
tags:
  - ai-agent
  - open-source
  - self-evolution
  - nous-research
  - automation
relatedPosts:
  - slug: ai-presentation-automation
    score: 0.94
    reason:
      ko: Hermes의 스킬 자동 생성이 흥미로웠다면, 프레젠테이션 자동화에서도 비슷한 반복 작업 제거 패턴을 확인할 수 있습니다.
      ja: Hermesのスキル自動生成に興味を持ったなら、プレゼン自動化でも類似の反復タスク削減パターンが見られます。
      en: If Hermes's auto-skill generation caught your eye, presentation automation shows a similar pattern of eliminating repetitive tasks.
      zh: 如果Hermes的技能自动生成引起了你的兴趣，演示自动化中也有类似的消除重复任务模式。
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: 본문에서 비교한 Claude Code의 CLAUDE.md 패턴을 실제 사용 데이터로 분석한 글입니다. 에이전트 학습 방식의 차이를 더 깊이 이해할 수 있습니다.
      ja: 本文で比較したClaude CodeのCLAUDE.mdパターンを実際の使用データで分析した記事です。エージェント学習方式の違いをより深く理解できます。
      en: Analyzes the Claude Code CLAUDE.md pattern with real usage data — the same pattern compared in this post. Deepens understanding of different agent learning approaches.
      zh: 用实际使用数据分析了本文中比较的Claude Code CLAUDE.md模式，帮助更深入理解不同的代理学习方式。
  - slug: multi-agent-swe-bench-verdent
    score: 0.94
    reason:
      ko: Hermes가 단일 에이전트의 자기 진화라면, 이 글은 멀티 에이전트가 협업할 때 벤치마크 성능이 어떻게 바뀌는지 다룹니다.
      ja: Hermesが単一エージェントの自己進化なら、この記事はマルチエージェント協業時のベンチマーク性能変化を扱います。
      en: While Hermes focuses on single-agent self-evolution, this post covers how benchmark performance changes when multiple agents collaborate.
      zh: Hermes是单代理的自我进化，这篇文章则讨论多代理协作时基准测试性能的变化。
  - slug: hindsight-mcp-agent-memory-learning
    score: 0.93
    reason:
      ko: Hermes의 플러그인 메모리와 다른 접근인 MCP 기반 에이전트 메모리를 비교해볼 수 있습니다. 에이전트 기억 아키텍처에 관심 있다면 필독.
      ja: Hermesのプラグインメモリとはアプローチの異なるMCPベースのエージェントメモリを比較できます。エージェント記憶アーキテクチャに関心があれば必読。
      en: Compare Hermes's plugin memory with a different approach — MCP-based agent memory. Essential reading if you're interested in agent memory architecture.
      zh: 可以将Hermes的插件化内存与不同方法——基于MCP的代理内存进行比较。如果对代理记忆架构感兴趣，必读。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.94
    reason:
      ko: Hermes의 백엔드 모델로 Gemma 4를 로컬에서 쓸 수 있을까? 이 글에서 Gemma 4의 실제 성능과 함수 호출 능력을 확인할 수 있습니다.
      ja: HermesのバックエンドモデルとしてGemma 4をローカルで使えるか？この記事でGemma 4の実際の性能と関数呼び出し能力を確認できます。
      en: Could Gemma 4 work as Hermes's backend model locally? This post tests Gemma 4's real-world performance and function-calling capabilities.
      zh: Gemma 4能作为Hermes的本地后端模型吗？这篇文章测试了Gemma 4的实际性能和函数调用能力。
---

`pip install hermes-agent`를 치고 나서 30분 만에 "이건 좀 다르다"고 느꼈다.

AI 에이전트 프레임워크가 하루에도 몇 개씩 쏟아지는 요즘, Hermes Agent가 GitHub 트렌딩 주간 랭킹에서 2주 연속 Top 5를 유지하고 있는 건 단순한 마케팅이 아니다. 핵심은 **자기 진화 루프(self-evolution loop)** — 작업을 완료할 때마다 에이전트가 스스로 스킬 문서를 생성하고, 다음에 비슷한 작업이 들어오면 그 문서를 참조해서 더 빠르고 정확하게 처리한다.

## Hermes Agent가 뭔가

NousResearch가 MIT 라이선스로 공개한 AI 에이전트 프레임워크다. 2026년 2월 첫 릴리스 이후 두 달 만에 GitHub 스타 33,000개, 포크 4,200개, 기여자 142명을 달성했다. 4월 3일에 v0.7.0 "The Resilience Release"가 나왔다.

핵심 개념은 세 가지:

- **스킬 자동 생성**: 복잡한 작업을 마치면 재사용 가능한 스킬 문서를 자동으로 만든다
- **플러그인 메모리**: 세션 간 기억을 유지하되, 백엔드를 교체할 수 있는 플러그인 구조
- **멀티 플랫폼**: CLI, Telegram, Discord, Slack, WhatsApp, Signal, Email 전부 지원

솔직히 기능 목록만 보면 "또 하나의 에이전트 프레임워크구나" 싶다. 나도 처음엔 그렇게 생각했다.

## 설치해서 돌려봤다

설치는 의외로 깔끔하다.

```bash
# 원라인 설치 — Python, Node.js, ripgrep, ffmpeg 등 의존성 자동 처리
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# 또는 pip으로 직접
pip install hermes-agent

# 첫 실행
hermes
```

인스톨러가 Python 가상환경, 의존성, 글로벌 `hermes` 커맨드까지 한 번에 세팅해준다. LLM 프로바이더 설정은 첫 실행 시 인터랙티브하게 물어보는데, OpenRouter를 선택하면 200개 이상의 모델을 바로 쓸 수 있다. `hermes model` 커맨드로 모델 교체도 가능하고, 코드 수정 없이 Nous Portal, OpenAI, Kimi, MiniMax 등을 자유롭게 오갈 수 있다.

## 자기 진화 루프가 실제로 동작하는가

이게 핵심이다. 많은 에이전트 프레임워크가 "학습한다"고 말하지만, 실제로는 프롬프트 캐싱이나 대화 히스토리 정도에 그치는 경우가 많다.

Hermes의 접근은 다르다:

1. 복잡한 작업을 완료하면, 에이전트가 그 과정을 **스킬 문서**로 자동 정리한다
2. 스킬 문서는 `~/.hermes/plugins/` 또는 `.hermes/plugins/`에 저장된다
3. 다음에 유사한 작업이 들어오면, 도구 디스커버리 단계에서 이 문서를 참조한다

개인적으로 이 패턴이 흥미로웠던 건, 내가 매일 쓰고 있는 Claude Code의 CLAUDE.md와 구조적으로 닮았기 때문이다. CLAUDE.md에 "이 프로젝트에서는 이런 규칙을 따라라"고 적어두면 다음 세션에서 에이전트가 그걸 읽고 행동하는 것처럼, Hermes는 그 과정 자체를 자동화한 셈이다. 에이전트가 세션 간 컨텍스트를 어떻게 유지하는지에 대한 다른 접근 방식은 [MCP 기반 에이전트 메모리 아키텍처를 다룬 Hindsight MCP 분석](/ko/blog/ko/hindsight-mcp-agent-memory-learning)에서 비교해볼 수 있다.

하지만 솔직히 말하면, "자동 생성된 스킬 문서의 품질"이 아직 고르지 않다. 간단한 파일 조작이나 API 호출 같은 작업은 꽤 쓸만한 스킬이 만들어지는데, 맥락에 크게 의존하는 복잡한 작업에서는 핵심을 놓치는 경우도 있었다. v0.7.0에서 NousResearch/hermes-agent-self-evolution 리포에 DSPy + GEPA 기반의 진화적 자기 개선이 추가됐지만, 이건 아직 실험 단계에 가깝다.

## 아키텍처 살펴보기

코어 구조는 생각보다 단순하다:

```
run_agent.py    → AIAgent — 핵심 대화 루프
cli.py          → HermesCLI — 터미널 UI
model_tools.py  → 도구 디스커버리 & 디스패치
hermes_state.py → SQLite 세션/상태 DB (FTS5 풀텍스트 검색)
```

도구 디스커버리는 세 가지 소스에서 가져온다:
- `~/.hermes/plugins/` — 사용자 플러그인
- `.hermes/plugins/` — 프로젝트별 플러그인
- pip entry points — 패키지로 설치된 플러그인

v0.7.0에서 가장 큰 변화는 메모리가 플러그인 시스템으로 바뀐 것이다. 이전에는 세션이 끝나면 컨텍스트가 리셋됐는데, 이제는 메모리 백엔드를 교체하거나, 에이전트 간에 메모리를 공유하거나, 커스텀 메모리 프로바이더를 직접 만들 수 있다.

## v0.7.0에서 달라진 것들

| 변경 사항 | 설명 |
|-----------|------|
| 플러그인 메모리 | 메모리 백엔드 교체·공유 가능 |
| 버튼 기반 승인 UI | 위험한 작업 실행 전 확인 |
| 인라인 diff 미리보기 | 파일 수정 전 변경 사항 표시 |
| API 서버 세션 유지 | 게이트웨이 재시작해도 세션 보존 |
| Camofox 브라우저 | 내장 브라우저 에이전트 |

## 다른 프레임워크와 비교하면

나는 이게 모든 것을 대체하는 은탄환이라고 생각하지 않는다. 비교하자면:

**Claude Code/OpenClaw** — 코딩 특화, IDE 통합이 강점. CLAUDE.md 기반 프로젝트 규칙은 수동이지만 그만큼 통제 가능하다. 코드 작성이 주 목적이라면 여전히 Claude Code가 낫다.

**LangChain/CrewAI** — 워크플로우 오케스트레이션에 강하지만, "에이전트가 스스로 성장한다"는 개념은 없다. 정해진 그래프를 따라 실행하는 구조. 멀티 에이전트 협업이 벤치마크 성능에 어떤 영향을 미치는지는 [SWE-bench 멀티 에이전트 성능 분석](/ko/blog/ko/multi-agent-swe-bench-verdent)에서 확인할 수 있다.

**Hermes Agent** — 범용 에이전트로서 자기 개선이 핵심. 코딩보다는 일상 자동화, 리서치, 커뮤니케이션 허브에 적합하다. 멀티 플랫폼 지원이 특히 강하다. 에이전트 프레임워크를 엔터프라이즈 수준으로 끌어올리려는 시도는 [Stripe의 1300개 PR을 처리한 자율 코딩 에이전트 사례](/ko/blog/ko/stripe-minions-autonomous-coding-agents-1300-prs)에서도 볼 수 있다.

솔직히 "자기 진화"라는 말이 좀 과대평가 될 수 있다고 본다. 현재 수준은 "작업 기록을 문서화해서 재활용"에 가깝지, 인간이 경험에서 배우는 것처럼 본질적으로 달라지는 건 아니다. 하지만 그 "문서화 자동화" 자체가 이미 상당한 가치가 있다는 건 인정할 수밖에 없다.

## 누가 쓰면 좋을까

- 여러 채팅 플랫폼에서 하나의 에이전트로 작업을 처리하고 싶은 개인 개발자
- 반복적인 업무를 자동화하되, 매번 프롬프트를 다시 쓰기 싫은 팀
- 에이전트 프레임워크를 직접 커스터마이즈하고 싶은데, LangChain의 추상화 레이어가 과하다고 느끼는 사람
- Claude Code로 코딩은 하되, 코딩 외의 자동화는 별도 에이전트에 맡기고 싶은 경우

MIT 라이선스이고, 모델 락인이 없다는 점도 마음에 든다. OpenRouter 하나로 200개 이상 모델을 쓸 수 있으니, 비용 최적화도 유연하게 할 수 있다.

## 마무리

Hermes Agent가 "혁명적"이라거나 "패러다임을 바꾼다"고까지 말할 생각은 없다. 하지만 "작업 → 스킬 생성 → 재활용"이라는 루프를 프레임워크 수준에서 자동화한 건 분명히 의미가 있다. 두 달 만에 33K 스타를 찍은 건 그만한 이유가 있다.

개인적으로는 v0.7.0의 플러그인 메모리 시스템이 가장 기대된다. 에이전트 간 메모리 공유가 본격적으로 되기 시작하면, 지금의 "하나의 대화창 = 하나의 컨텍스트" 한계를 넘을 수 있을 것 같다. 물론 그때까지 이 프로젝트가 모멘텀을 유지할 수 있느냐가 관건이겠지만.
