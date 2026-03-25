---
heroImage: '../../../assets/blog/anthropic-vibe-physics-ai-research-assistant-hero.jpg'
title: Vibe Physics — 물리학 교수가 Claude에게 논문을 시켜봤다
description: >-
  Anthropic Science 블로그 첫 글에서 하버드 물리학 교수 Matthew Schwartz가 Claude를 "대학원생"처럼 지도한
  실험을 분석합니다. 110번의 드래프트, 36M 토큰, 그리고 2주 만에 나온 논문.
pubDate: '2026-03-25'
tags:
  - ai-ml
  - anthropic
  - science
  - llm
relatedPosts:
  - slug: gpt52-theoretical-physics-discovery
    score: 0.96
    reason:
      ko: GPT-5.2가 이론 물리학에서 새로운 발견을 했다는 사례와 직접 비교할 수 있습니다. Claude의 G2 수준 평가와 대조해보세요.
      ja: GPT-5.2が理論物理学で新発見をした事例と直接比較できます。ClaudeのG2評価と対照してみてください。
      en: Directly comparable to the GPT-5.2 theoretical physics discovery case. Contrast it with Claude's G2-level assessment.
      zh: 可以与GPT-5.2在理论物理学中的新发现案例直接对比。请与Claude的G2水平评估进行对照。
  - slug: alphaevolve-ramsey-ai-research-partner
    score: 0.94
    reason:
      ko: AlphaEvolve가 수학 난제를 풀어낸 사례입니다. AI가 과학 연구의 파트너가 되는 흐름을 다른 각도에서 보여줍니다.
      ja: AlphaEvolveが数学の難問を解いた事例です。AIが科学研究のパートナーになる流れを別の角度から示します。
      en: The case of AlphaEvolve solving a math conjecture. Shows AI as a science research partner from a different angle.
      zh: AlphaEvolve解决数学难题的案例。从不同角度展示了AI成为科学研究伙伴的趋势。
  - slug: agents-md-effectiveness
    score: 0.92
    reason:
      ko: 이 글에서 다룬 CLAUDE.md + CHANGELOG.md 패턴의 효과를 데이터로 검증한 포스트입니다.
      ja: この記事で取り上げたCLAUDE.md + CHANGELOG.mdパターンの効果をデータで検証した記事です。
      en: Validates the CLAUDE.md + CHANGELOG.md pattern discussed here with actual effectiveness data.
      zh: 用数据验证了本文讨论的CLAUDE.md + CHANGELOG.md模式的实际效果。
  - slug: karpathy-autoresearch-overnight-ml-experiments
    score: 0.90
    reason:
      ko: Karpathy의 자동 연구 실험과 Schwartz의 물리학 실험은 "AI에게 연구를 맡기는 패턴"이라는 점에서 같은 흐름입니다.
      ja: Karpathyの自動研究実験とSchwartzの物理学実験は「AIに研究を任せるパターン」という点で同じ流れです。
      en: Karpathy's auto-research experiments and Schwartz's physics experiment share the same theme of delegating research to AI.
      zh: Karpathy的自动研究实验和Schwartz的物理学实验在"将研究委托给AI的模式"这一点上属于同一趋势。
  - slug: claude-code-best-practices
    score: 0.88
    reason:
      ko: Ralph Loop과 test oracle 패턴을 실무에 적용하려면, Claude Code 베스트 프랙티스를 함께 읽어보는 것이 좋습니다.
      ja: Ralph Loopとtest oracleパターンを実務に適用するなら、Claude Codeのベストプラクティスも併せて読むことをお勧めします。
      en: If you want to apply the Ralph Loop and test oracle patterns in practice, pair it with these Claude Code best practices.
      zh: 如果想在实际工作中应用Ralph Loop和test oracle模式，建议配合阅读Claude Code最佳实践。
---

2주 만에 이론 물리학 논문 한 편이 나왔다. 보통 1년 걸리는 작업이다.

지난 3월 23일, Anthropic이 Science 블로그를 새로 열었다. 첫 번째 글의 제목이 좀 도발적이다 — "Vibe Physics: The AI Grad Student." 하버드 물리학 교수 Matthew Schwartz가 Claude Opus 4.5를 직접 지도하며 이론 물리학 연산을 수행시킨 실험 기록이다.

솔직히 제목을 보고 "또 AI가 과학을 혁신한다는 이야기인가" 싶었는데, 읽어보니 꽤 다른 결의 글이었다. 성공담이 아니라 **지도 일지**에 가깝다.

## 110번의 드래프트, 36M 토큰

Schwartz 교수가 한 일은 간단하다. 파일을 직접 손대지 않고, Claude에게 이론 물리 계산을 시킨 것이다. 결과적으로:

- **110개 이상의 드래프트** 생성
- **36M 토큰** 소비 (GPT-4 기준 약 2,700만 단어 분량)
- **40시간 이상의 로컬 CPU 연산**
- 최종 결과물: 기술적으로 엄밀한 고에너지 이론 물리학 논문 1편

1년 걸릴 작업이 2주로 줄었다. 숫자만 보면 대단하다. 하지만 Schwartz 교수의 결론은 의외로 냉정하다.

## "G2 수준" — 대학원 2년차

Schwartz는 현재 LLM의 이론 물리 능력을 **G2(대학원 2년차)** 수준으로 평가했다. "빠르고, 지칠 줄 모르고, 시키면 열심히 한다. 하지만 꽤 허술하다." 원문 표현 그대로 "impressively capable, but also sloppy enough that domain expertise was essential."

나는 이 평가가 물리학에만 해당된다고 생각하지 않는다. 코드를 짜게 해봐도, 글을 쓰게 해봐도 비슷한 느낌을 받는다. 80%까지는 놀라울 만큼 빠른데, 나머지 20%에서 전문가의 눈이 필요해진다. "vibe coding"이라는 표현이 유행하는 것도 같은 맥락이다 — 대충 돌아가는 것 같은데, 정말 맞는지는 사람이 봐야 한다.

이건 중요한 함의가 있다. AI가 연구를 "대신"하는 게 아니라, **전문가의 생산성을 증폭**시키는 도구라는 점이다. 물리학을 모르는 사람이 Claude에게 논문을 시키면 그럴듯하지만 틀린 결과가 나올 가능성이 높다.

## 같이 공개된 실전 패턴: Ralph Loop

Science 블로그의 두 번째 글은 더 실용적이다. Anthropic Discovery 팀의 Siddharth Mishra-Sharma가 쓴 "Long-running Claude for scientific computing"인데, 여기서 소개된 **Ralph Loop** 패턴이 눈에 띈다.

```bash
# Ralph Loop — 성공 조건 충족까지 반복 실행
while true; do
  claude --print "CHANGELOG.md를 읽고, 아직 완료되지 않은
    작업을 이어서 진행하세요. 모든 테스트가 통과하면
    DONE.md 파일을 생성하세요."

  if [ -f "DONE.md" ]; then
    echo "작업 완료"
    break
  fi

  echo "아직 미완료, 재시도..."
done
```

핵심은 두 가지다:

1. **CHANGELOG.md를 장기 메모리로 활용** — 에이전트가 매 실행마다 이전 진행 상황을 읽고 이어서 작업
2. **Test Oracle** — 참조 구현이나 테스트 스위트가 있어야 에이전트가 "진행 중인지, 삽질 중인지" 판단 가능

이 패턴을 보고 나는 우리 팀에서 쓰는 CI/CD 파이프라인이 떠올랐다. 결국 에이전트에게 장시간 작업을 맡기려면 **검증 가능한 중간 체크포인트**가 필요하다는 이야기다.

## 왜 Anthropic이 "Science 블로그"를 따로 만들었을까

Anthropic에는 이미 Research 블로그가 있다. 그런데 별도로 Science 블로그를 런칭한 건 의미가 있다.

기존 Research 블로그가 "모델 자체의 연구"에 집중한다면, Science 블로그는 "모델을 도구로 쓰는 과학자들의 이야기"에 초점을 맞춘다. Claude for Life Sciences(2025년 10월), Claude for Healthcare(2026년 1월)에 이어 AI for Science 프로그램까지 — Anthropic이 "범용 AI 비서"에서 "과학 연구 인프라"로 포지셔닝을 확장하고 있다는 신호다.

개인적으로 이 방향이 기대되면서도 걱정이 된다. 과학 연구에서 AI의 "허술함"이 만드는 위험은 코딩 실수와는 차원이 다르다. 논문에 미묘한 계산 오류가 섞여 있으면, 그게 다른 연구의 기초가 되어 퍼져나갈 수 있다. Schwartz 교수처럼 도메인 전문가가 꼼꼼히 검증하는 경우는 괜찮지만, "vibe physics"가 보편화되면 검증 없이 넘어가는 케이스도 늘어날 것이다.

## 엔지니어가 가져갈 수 있는 것

물리학 논문을 쓸 일은 없더라도, 이 실험에서 배울 점은 분명하다.

**AI에게 장시간 작업을 맡기는 패턴이 정립되고 있다.** CLAUDE.md로 프로젝트 컨텍스트를 주고, CHANGELOG.md로 상태를 추적하고, test oracle로 품질을 검증하는 구조. 이건 물리 연구든, 데이터 파이프라인이든, 대규모 리팩토링이든 동일하게 적용할 수 있다.

다만 "G2 수준"이라는 평가를 잊지 말아야 한다. 열심히 하지만 감독이 필요한 대학원생. 그 전제 없이 결과물을 그대로 쓰면, 빠르게 만든 만큼 빠르게 문제가 터진다.
