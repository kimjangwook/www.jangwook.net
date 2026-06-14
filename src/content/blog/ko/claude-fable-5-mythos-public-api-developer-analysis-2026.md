---
draft: true
title: "Claude Fable 5 출시 분석 — Mythos가 공개됐다, API 비용 두 배는 낼 가치가 있나"
description: "Anthropic이 2026년 6월 9일 Claude Fable 5를 출시했다. SWE-bench Pro 80.3%, 비용 $10/$50/MTok. Mythos Preview의 대중화 버전인 Fable 5가 실제 개발 워크플로우에서 Opus 4.8보다 가치 있는지 API 변경사항, 안전 라우팅 메커니즘, 비용 구조를 기준으로 분석한다."
pubDate: '2026-06-12'
heroImage: '../../../assets/blog/claude-fable-5-mythos-public-api-developer-analysis-2026-hero.png'
tags:
  - anthropic
  - claude-fable-5
  - ai-model
  - llm-api
relatedPosts:
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.95
    reason:
      ko: "Mythos Preview가 제한 공개였을 때 왜 일반 배포가 불가능하다고 했는지 알면, Fable 5가 그 문제를 어떻게 해결했는지 직접 비교할 수 있다"
      ja: "Mythos Previewが制限公開だった理由を知ることで、Fable 5がその問題をどう解決したかを直接比較できる"
      en: "Understanding why Mythos Preview was restricted-access helps you directly compare how Fable 5 resolved those concerns"
      zh: "了解Mythos Preview为何限制访问，有助于直接比较Fable 5如何解决了那些顾虑"
  - slug: claude-opus-4-8-dynamic-workflows-parallel-agents-guide
    score: 0.91
    reason:
      ko: "Fable 5로 업그레이드할지 고민 중이라면, 현재 Opus 4.8의 Dynamic Workflows와 병렬 에이전트 성능을 먼저 파악하는 것이 전환 비용 계산에 직접적인 기준이 된다"
      ja: "Fable 5へのアップグレードを検討しているなら、Opus 4.8のDynamic WorkflowsとパラレルAgent性能を把握することが切り替えコスト計算の基準になる"
      en: "If you're considering upgrading to Fable 5, understanding Opus 4.8's Dynamic Workflows and parallel agent performance is the direct baseline for calculating migration cost"
      zh: "如果考虑升级到Fable 5，了解Opus 4.8的Dynamic Workflows和并行Agent性能是计算迁移成本的直接基准"
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.87
    reason:
      ko: "Fable 5의 $10/$50 요금이 경쟁사 대비 어느 위치에 있는지, 성능 대비 비용 효율을 가장 넓은 시야로 보고 싶다면 이 비교 가이드가 출발점이다"
      ja: "Fable 5の$10/$50料金が競合他社と比較してどの位置にあるか、パフォーマンス対コスト効率を最も広い視点で見たいなら、この比較ガイドが出発点になる"
      en: "To see where Fable 5's $10/$50 pricing sits against competitors and evaluate cost-per-performance at the widest view, this comparison guide is the starting point"
      zh: "要了解Fable 5的$10/$50定价在竞争对手中的位置，并从最广视角评估性能成本比，这份比较指南是起点"
  - slug: anthropic-claude-opus-4-7-managed-agents-2026
    score: 0.82
    reason:
      ko: "Opus 4.7에서 Fable 5로 이어지는 Anthropic 모델 진화를 이해하면, task_budget 설계나 managed agent 아키텍처가 새 모델에서 어떻게 달라지는지 파악하기 쉽다"
      ja: "Opus 4.7からFable 5へのAnthropicモデル進化を理解することで、task_budgetの設計やmanaged agentアーキテクチャが新モデルでどう変わるかが把握しやすくなる"
      en: "Understanding the Anthropic model evolution from Opus 4.7 to Fable 5 makes it easier to grasp how task_budget design and managed agent architecture change in the new model"
      zh: "了解Anthropic模型从Opus 4.7到Fable 5的演进，有助于掌握新模型中task_budget设计和managed agent架构的变化"
---

[Anthropic이 2026년 4월에 Project Glasswing을 통해 Mythos Preview를 공개했을 때](/ko/blog/ko/claude-mythos-preview-glasswing-ai-cybersecurity), 나는 솔직히 이 모델이 언제 일반 공개될지 반신반의했다. SWE-bench 93.9%라는 수치를 들고 나왔는데도 12개 기업에만 제한 배포한다는 결정이 영리한 마케팅인지 진짜 안전 우려인지 확신하기 어려웠다.

그로부터 두 달. 2026년 6월 9일, Anthropic이 <strong>Claude Fable 5</strong>를 일반 공개했다. Mythos의 대중화 버전이다. `claude-fable-5`라는 모델 ID로 API에서 바로 쓸 수 있다.

공개 직후 트위터와 Hacker News에는 "드디어"와 "벌써"가 뒤섞였다. 나는 공식 릴리스 노트, API 문서, 벤치마크 데이터를 이틀간 들여다봤다. **API 비용이 Opus 4.8의 두 배인데, 그 돈을 낼 가치가 있는지**를 판단하는 게 이 글의 목적이다.

실제로 API를 호출해서 비교하지는 못했다. 대신 공식 문서, SDK 마이그레이션 가이드, 개발자 커뮤니티 반응을 기준으로 "내가 지금 Fable 5로 전환해야 하는가"를 분석했다.

## Fable 5의 실체: 안전판이 얹힌 Mythos

`claude-fable-5`와 `claude-mythos-5`는 동일한 기반 모델이다. 가중치가 같고, 추론 능력도 같다. 차이는 단 하나, <strong>안전 라우팅</strong>이다.

Fable 5에는 사이버보안, 생물/화학 합성, AI 모델 증류(distillation) 관련 요청을 감지하는 분류기가 얹혀 있다. 이 분류기에 걸리는 쿼리는 Fable 5가 직접 응답하지 않고 자동으로 <strong>Claude Opus 4.8로 라우팅</strong>된다. 응답은 Opus 4.8이 생성하고, 요금도 Opus 4.8 기준($5/$25/MTok)으로 청구된다. 라우팅 여부는 응답 헤더에 기록되므로 코드에서 감지할 수 있다.

Mythos 5는 이 분류기 없이 동작한다. Project Glasswing에 등록된 사이버방어·핵심 인프라 기업에만 접근이 허용되며, 2026년 6월 기준 여전히 초대제다.

이 설계의 논리는 이해할 만하다. Fable 5의 코딩과 추론 능력이 너무 뛰어나서 취약점 익스플로잇 코드 작성이나 생화학 합성 경로 설계 같은 위험한 작업에 쓰일 수 있다. Anthropic의 대응은 모델을 제한하는 대신 특정 영역의 쿼리를 덜 강력한 모델로 리디렉트하는 것이다. Fable 5 요금을 내면서도 특정 쿼리는 Opus 4.8이 처리한다.

개발자 관점에서 불편한 점은 <strong>라우팅 기준의 불투명성</strong>이다. 어떤 쿼리가 분류기에 걸리는지 사전에 알기 어렵다. 보안 감사 코드, CVE 분석 파이프라인, 단백질 구조 데이터 처리, 모델 압축 실험처럼 합법적이고 일반적인 작업이 분류기에 걸릴 가능성이 있다. 비용을 두 배 내고 있는데 실제로는 Opus 4.8 응답을 받는 상황이 발생할 수 있다.

## 벤치마크 95%의 맥락과 함정

Anthropic이 공개한 주요 수치를 정리하면 다음과 같다.

| 모델 | SWE-bench Verified | SWE-bench Pro |
|------|-------------------|---------------|
| Claude Fable 5 | 95.0% | 80.3% |
| Claude Opus 4.8 | 88.6% | 69.2% |
| GPT-5.5 | 78.2% | 58.6% |
| Gemini 3.1 Pro | 80.6% | 54.2% |

SWE-bench Pro 기준으로 Fable 5와 Opus 4.8의 차이는 11.1%포인트다. SWE-bench Pro는 실제 오픈소스 PR에서 추출한 문제들로, 단순한 코드 완성이 아니라 복잡한 버그 수정과 리팩토링을 요구한다. 이 격차가 진짜 코딩 능력 차이를 반영한다면, 멀티파일 코드베이스에서의 복잡한 수정 작업에서 체감 차이가 클 것이다.

그런데 벤치마크 수치를 그대로 믿기 전에 몇 가지를 짚어야 한다.

우선 <strong>벤치마크 특화 튜닝 문제</strong>다. SWE-bench 리더보드 경쟁이 치열해지면서 일부 모델이 벤치마크 패턴에 과적합됐다는 의혹이 커뮤니티에서 꾸준히 제기된다. 테스트 세트에 최적화된 성능과 실제 프로덕션 코드베이스에서의 성능이 다를 수 있다. 95%가 내 레거시 코드베이스에서도 그 수준으로 나올지는 직접 확인 전까지 모른다.

또 Hebbia Finance Benchmark에서 문서 기반 추론, 차트/표 해석, 문제 해결에서 큰 격차를 보였다는 점은 <strong>금융, 법무, 연구 문서 분석 에이전트</strong>에 더 의미 있는 수치다. 순수 코딩 에이전트에서 동일한 격차가 나오는지는 별개 문제다.

Cognition의 FrontierCode 평가에서 Fable 5가 최고 점수를 기록했다는 데이터도 있다. 이 벤치마크는 어려운 코딩 문제를 푸는 것을 넘어 "고품질 프로덕션 코드베이스의 표준을 충족하는지"를 함께 평가한다. 단순히 동작하는 코드가 아니라 리뷰 통과 가능한 코드를 작성할 수 있는지 테스트한다는 점에서 일반 SWE-bench보다 실무 적합성이 높다.

## API에서 반드시 확인해야 할 변경사항

Fable 5는 Opus 계열과 API 인터페이스가 다르다. 마이그레이션 전에 놓치면 프로덕션에서 바로 에러가 난다.

<strong>Thinking 파라미터 변경:</strong>
Opus 4.8에서는 `thinking: {type: "disabled"}`로 추론을 끌 수 있었다. Fable 5에서는 이 설정이 <strong>400 에러</strong>를 반환한다. Thinking은 항상 켜져 있다. `{type: "adaptive"}`만 허용되거나 파라미터를 아예 생략해야 한다. `temperature`, `top_p`, `top_k`도 전부 제거됐다. 기존 Opus용 코드를 그대로 가져다 쓰면 바로 에러가 난다.

```python
# ❌ Opus 4.8에서는 되지만 Fable 5에서는 400 에러
client.messages.create(
    model="claude-fable-5",
    thinking={"type": "disabled"},  # 400 에러!
    temperature=0.7,                # 400 에러!
    max_tokens=4096,
    messages=[...]
)

# ✅ Fable 5 올바른 방식
client.messages.create(
    model="claude-fable-5",
    # thinking 파라미터 생략 (항상 adaptive)
    output_config={"effort": "high"},
    max_tokens=4096,
    messages=[...]
)
```

<strong>refusal stop_reason 추가:</strong>
Fable 5는 안전 분류기가 요청을 거부할 때 HTTP 200에 `stop_reason: "refusal"`을 반환한다. `content` 배열이 비어 있다. 기존 코드가 `response.content[0]`을 그냥 읽으면 인덱스 에러가 난다. 응답을 처리하기 전에 반드시 `stop_reason` 체크를 먼저 해야 한다. 또한 스트리밍 중에 거부되면 이미 스트리밍된 부분까지의 출력 토큰은 청구된다.

```python
response = client.messages.create(model="claude-fable-5", ...)

# ✅ stop_reason 먼저 확인
if response.stop_reason == "refusal":
    # stop_details에 거부 카테고리 기록됨
    handle_refusal(response.stop_details)
else:
    result = response.content[0].text
```

<strong>30일 데이터 보존 의무:</strong>
Fable 5는 ZDR(Zero Data Retention) 설정 조직에서 사용할 수 없다. 데이터 보존 요건을 충족하지 않으면 400 에러다. 의료, 금융 등 ZDR 계약을 맺은 기업은 바로 쓸 수 없다. Anthropic은 이 30일 데이터를 학습에 쓰지 않지만, 새로운 공격 패턴 방어를 위해 보존한다고 밝혔다.

<strong>토크나이저 차이로 인한 비용 재계산 필요:</strong>
Fable 5는 Opus 계열과 다른 토크나이저를 쓴다. 동일한 프롬프트가 Fable 5에서 약 30% 더 많은 토큰으로 처리된다. 단순히 요금 단가가 2배인 게 아니라 토큰 수까지 늘어난다. Opus 4.8 기준으로 측정한 `max_tokens` 값을 그대로 쓰면 안 된다. Fable 5로 전환할 때는 `count_tokens` API로 실제 토큰 수를 재측정해야 한다.

<strong>Effort 파라미터로 비용 제어:</strong>
Fable 5에서 비용을 줄이는 실질적 방법은 `output_config.effort`다. `low`〜`xhigh`까지 단계가 있다. 단순 태스크에는 `low`나 `medium`을 쓰면 토큰 낭비를 줄일 수 있다. [Claude Opus 4.8의 Dynamic Workflows처럼 병렬 에이전트를 운영할 때](/ko/blog/ko/claude-opus-4-8-dynamic-workflows-parallel-agents-guide)는 서브에이전트에 `effort: "low"`를 적용하고 최종 합성 단계에만 `high`를 쓰는 전략이 현실적이다.

## Fable 5 vs Opus 4.8: 전환 비용 현실적으로 계산하기

비용 구조를 구체적으로 보면:

| 항목 | Opus 4.8 | Fable 5 | 비율 |
|------|----------|---------|------|
| 입력 /1M 토큰 | $5.00 | $10.00 | 2배 |
| 출력 /1M 토큰 | $25.00 | $50.00 | 2배 |
| 토크나이저 오버헤드 | 기준 | +30% | — |
| 실효 입력 비용 비교 | 기준 | ~2.6배 | — |
| ZDR 지원 | ✓ | ✗ | — |
| 데이터 보존 | 0일 | 30일 | — |

토크나이저 차이를 반영하면 실효 비용은 단순 2배가 아니라 2.6배 수준이다. 월 Opus 4.8 비용이 $500이었다면 Fable 5로 전면 교체하면 $1,300 이상이 된다는 계산이 나온다.

그래도 Fable 5가 명확히 유리한 케이스가 있다.

<strong>전환할 가치가 있는 경우:</strong>
- 컨텍스트가 100K 토큰을 넘는 대형 코드베이스에서 복잡한 리팩토링을 자동화하는 경우
- 금융 문서, 법률 계약서, 연구 논문을 분석하고 정밀도가 핵심인 경우
- 한 번의 에이전트 실행 실패가 수동 수정 비용보다 비쌀 때 (모델 비용 < 실패 비용)
- Claude Code처럼 장시간 툴 헤비 에이전트로 실제 PR을 자동 생성하는 경우

<strong>아직 기다릴 이유가 있는 경우:</strong>
- RAG 파이프라인의 단순 요약, 분류, 감정 분석처럼 반복 작업
- 토큰 수가 많은 배치 처리 (비용 충격이 가장 크다)
- ZDR 계약 조직 (사용 불가)
- 보안 취약점 분석, 화학 DB 쿼리, 모델 증류 관련 워크플로우 (안전 라우팅으로 Opus 4.8로 전환될 수 있음)
- 응답 속도가 중요한 인터랙티브 UI (Fable 5는 명시적 추론으로 인해 지연이 더 길 수 있다)

## 에이전트 워크플로우에서 Fable 5 활용 패턴

Fable 5가 Opus 4.8 대비 가장 뚜렷한 가치를 낼 수 있는 영역은 <strong>장시간 멀티스텝 에이전트 작업</strong>이다. 단일 API 호출보다 에이전트가 수십〜수백 번 툴을 호출하며 장시간 자율 실행하는 경우, 스텝당 오류율 차이가 최종 결과 품질에 복리처럼 쌓인다.

예를 들어 코드베이스 리팩토링 에이전트가 100스텝을 실행할 때 스텝당 성공률이 99%이면 최종 성공률은 37%, 99.5%이면 61%다. 모델 품질이 1%포인트 높아지는 것만으로도 실제 성공률 차이는 크다.

Fable 5 공식 문서에서 에이전트 설계 관련 권장 사항을 정리하면:

1. <strong>Task Budget 활용</strong>: `output_config.task_budget`으로 에이전트 전체 루프에 토큰 예산을 설정할 수 있다. 서브에이전트들이 예산을 낭비하지 않도록 조율하는 역할이다. Opus 4.7부터 지원된 기능이지만 Fable 5에서 특히 유용하다. 한 번의 긴 자율 실행에 얼마를 쓸지 상한을 미리 정해두면 예상 밖의 토큰 폭탄을 막을 수 있다.

2. <strong>Effort 단계별 차등 적용</strong>: 에이전트 루프 안에서 모든 스텝에 동일한 `effort`를 쓸 필요가 없다. 탐색이나 메모리 검색 같은 단순 스텝에는 `effort: "low"`, 코드 생성이나 최종 결정 스텝에는 `effort: "high"` 또는 `"xhigh"`를 적용하면 비용 효율이 높아진다.

3. <strong>Thinking 표시 설정</strong>: Fable 5는 기본적으로 thinking 블록이 빈 문자열로 스트리밍된다(`display: "omitted"` 기본값). 사용자에게 추론 과정을 보여주고 싶다면 명시적으로 `display: "summarized"`를 설정해야 한다. 그렇지 않으면 긴 침묵 후 갑자기 출력이 쏟아지는 UX가 된다.

```python
# 에이전트 루프에서 Fable 5 활용 패턴
response = client.messages.create(
    model="claude-fable-5",
    output_config={
        "effort": "high",
        "task_budget": {"type": "tokens", "total": 200_000}
    },
    thinking={"type": "adaptive", "display": "summarized"},  # 추론 요약 표시
    max_tokens=16_000,
    tools=[...],
    messages=conversation_history
)
```

Fable 5의 1M 컨텍스트 창은 대형 코드베이스 전체를 한 번에 주입하는 전략에 유리하다. 청킹 없이 전체 맥락을 유지할 수 있어서 참조 오류가 줄어든다. 다만 토크나이저 차이로 인해 같은 코드베이스가 Opus 4.8보다 30% 더 많은 입력 토큰을 소비한다는 점은 계산에 넣어야 한다.

## 실행 가능성 판단

**직접 API 호출 여부:** 이 분석에서는 Fable 5 API를 직접 호출하지 않았다. Opus 4.8 대비 실제 코딩 품질 차이, 라우팅 분류기가 어떤 쿼리에 트리거되는지, 응답 지연 차이 등은 실제 환경에서 재현 가능한 범위 밖이다.

**내가 재현 가능했던 범위:** API 문서에서 breaking change를 확인하고, SDK 마이그레이션 가이드의 에러 패턴을 분석했다. `thinking: {type: "disabled"}`이 400을 반환한다는 것, `stop_reason: "refusal"` 처리가 필요하다는 것, 토크나이저 차이로 인한 비용 재측정 필요성은 공식 문서에서 명확히 확인된 내용이다.

**실제로 도입한다면 막힐 지점:** 토큰 비용 재측정 없이 기존 `max_tokens` 값을 그대로 쓰는 것, ZDR 조직에서 쓰려다 400을 받는 것, 보안 관련 쿼리가 Opus 4.8로 라우팅되는지 파악하지 못하고 비용을 내는 것. 이 세 가지가 첫 번째 장벽이 될 가능성이 높다.

## 내 판단: 지금 당장 쓸 사람과 아직 기다릴 사람

솔직히 말하면, <strong>지금 당장 Opus 4.8을 Fable 5로 전면 교체할 이유는 별로 없다고 본다.</strong>

Opus 4.8은 불과 3주 전에 나온 모델이다. SWE-bench Pro 69.2%도 6개월 전 기준으로는 프론티어 성능이었다. 이미 상당한 수준이다. 두 모델의 11%포인트 차이가 실제 작업에서 체감될지는 직접 A/B 테스트 없이 모른다.

API 변경사항도 만만치 않다. thinking 파라미터, stop_reason 처리, 토크나이저 차이, effort 설정 재조정까지. 마이그레이션 작업 자체가 공짜가 아니다. 운영 중인 파이프라인이 있다면 테스트 비용과 엔지니어링 시간이 든다.

무엇보다 <strong>안전 라우팅의 불투명성</strong>이 내가 가장 불편하게 생각하는 부분이다. 어떤 쿼리가 Opus 4.8로 빠지는지 사전에 알 방법이 없다. 에이전트를 돌리다 보면 보안 코드, 화학 DB 쿼리 같은 것들이 자연스럽게 섞인다. 비용을 2.6배 내고 있는데 알고 보니 일부는 Opus 4.8이 처리한 상황이 생길 수 있다. 이건 사용자가 제어할 수 없는 부분이라 더 불편하다.

<strong>내 권장 접근법</strong>은 전면 교체가 아닌 선택적 사용이다. 구체적으로:

1. Pro/Max/Team 구독자라면 6월 22일까지 무료로 쓸 수 있다. 지금이 Fable 5를 체험할 가장 비용 효율적인 시점이다. 내가 쓰는 가장 복잡한 태스크 하나에 Fable 5를 써보고 Opus 4.8 대비 차이를 직접 느껴보라.
2. 차이가 체감되면 그 특정 태스크에만 Fable 5를 적용한다. 전체 파이프라인을 바꾸는 것보다 선택적으로 쓰는 게 비용 효율이 높다.
3. ZDR 조직이거나 보안/화학 관련 워크플로우가 핵심이라면 일단 패스다.

Anthropic이 6월 22일 이후 크레딧 요금제로 전환한 뒤 실제 사용 패턴이 어떻게 나오는지 커뮤니티 데이터가 쌓이면, 그때 판단을 다시 해도 늦지 않는다.

## Fable 5 마이그레이션 체크리스트

Opus 계열 코드를 Fable 5로 옮기기 전에 확인해야 할 항목들을 정리했다. 스텝별로 적용하면 예상치 못한 에러를 줄일 수 있다.

**1단계: API 파라미터 점검**
- `thinking: {type: "disabled"}` → 파라미터 전체 제거
- `temperature`, `top_p`, `top_k` → 전부 제거
- `output_config.effort`를 명시적으로 설정할지 결정

**2단계: 에러 처리 업데이트**
- `stop_reason === "refusal"` 케이스 추가
- 스트리밍 시 중간 거부 처리 (이미 스트리밍된 내용 버리기)
- `stop_details.category`로 거부 이유 로깅

**3단계: 토큰 예산 재측정**
- 기존 프롬프트를 `count_tokens` API로 Fable 5 기준 재측정
- `max_tokens` 값 업데이트 (대략 30% 상향 고려)
- 예상 월 비용 재계산 (단순 2배가 아닌 약 2.6배)

**4단계: ZDR 상태 확인**
- 조직의 데이터 보존 정책 확인
- ZDR 계약이 있으면 Fable 5 사용 불가 — 대안 없음

**5단계: 안전 라우팅 모니터링 설정**
- 응답 헤더에서 라우팅 여부 감지하는 로깅 추가
- 어떤 쿼리 유형이 Opus 4.8로 빠지는지 데이터 수집

이 체크리스트를 통과하면 마이그레이션을 단계적으로 진행할 준비가 된다. 처음에는 프로덕션 트래픽의 5〜10%만 Fable 5로 라우팅해서 실제 비용과 품질 차이를 측정한 뒤 점진적으로 확대하는 방식이 안전하다.

한 가지 추가로 고려할 점은 **프롬프트 재튜닝**이다. Anthropic의 마이그레이션 가이드에 따르면 Fable 5는 이전 모델 대비 지나치게 지시적인 프롬프트에서 오히려 품질이 떨어질 수 있다고 명시한다. "단계별로 다음을 하라"는 식의 과도하게 구조화된 프롬프트보다는 목표를 명확히 주고 모델이 경로를 결정하게 두는 방식이 더 효과적이다. Opus 계열에서 최적화한 프롬프트를 그대로 쓰면 Fable 5의 성능을 충분히 끌어내지 못할 수 있다. 마이그레이션은 코드만의 작업이 아니라 프롬프트 엔지니어링 재작업도 포함한다는 점을 미리 계획에 넣어두는 것이 좋다.

## Source Review 한계 고지

이 글은 Anthropic 공식 릴리스 노트, API 문서, SDK 마이그레이션 가이드, 커뮤니티 벤치마크 데이터를 종합하여 기반으로 작성했다. Fable 5 API를 직접 호출해서 Opus 4.8과 비교하지는 못했다. "벤치마크상 11%포인트 차이가 내 실제 코드베이스에서도 나온다"는 주장은 내가 검증할 수 없다. 성능 차이를 판단하려면 자신의 실제 쿼리로 A/B 테스트를 직접 해봐야 한다.

아래 참고 소스를 직접 확인할 것을 권한다: [Anthropic 공식 발표](https://www.anthropic.com/news/claude-fable-5-mythos-5), [API 문서](https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5), [SWE-bench Pro 리더보드](https://www.morphllm.com/swe-bench-pro), [GitHub Copilot Changelog](https://github.blog/changelog/2026-06-09-claude-fable-5-is-generally-available-for-github-copilot/)
