---
title: 'Claude API Prompt Caching 실전 — LLM 비용 70% 절감하는 4가지 패턴'
description: >-
  Claude API 프롬프트 캐싱을 실제 프로덕션 환경에 적용하기 위한 완전 실전 가이드입니다. 시스템 프롬프트·RAG 문서·툴 정의·멀티턴 대화
  4가지 캐싱 패턴과 2026년 TTL 변경의 함정, 캐싱 적중률 및 비용 절감 계산 방법을 실측 데이터와 함께 정리합니다.
pubDate: '2026-04-27'
heroImage: >-
  ../../../assets/blog/claude-api-prompt-caching-cost-optimization-guide-hero.png
tags:
  - claude-api
  - cost-optimization
  - prompt-caching
  - llm
  - anthropic
relatedPosts:
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.92
    reason:
      ko: LLM API 가격 구조를 비교한 글인데, 프롬프트 캐싱은 그 가격표를 실제로 줄이는 가장 직접적인 방법이다. 두 글을 함께 읽으면 "어느 모델을 쓸까"와 "어떻게 쓸까"가 모두 해결된다.
      ja: LLM APIの価格構造を比較した記事で、プロンプトキャッシングはその価格を実際に削減する最も直接的な方法だ。両記事を合わせて読むと「どのモデルを使うか」と「どう使うか」が両方解決できる。
      en: The pricing comparison post answers "which model," while this post answers "how to use it." Together they form a complete cost optimization strategy.
      zh: LLM API价格比较文章解答了"用哪个模型"，本文则解答了"如何使用"。两篇合读可以形成完整的成本优化策略。
  - slug: context-engineering-production-ai-agents
    score: 0.88
    reason:
      ko: 컨텍스트 엔지니어링과 프롬프트 캐싱은 사실 같은 문제의 두 얼굴이다. 어떤 정보를 컨텍스트에 담을지 설계하는 작업이 캐싱 효율을 결정한다.
      ja: コンテキストエンジニアリングとプロンプトキャッシングは、実は同じ問題の二つの側面だ。何をコンテキストに含めるかの設計がキャッシング効率を決定する。
      en: Context engineering and prompt caching are two sides of the same coin — what you put in context determines how well caching works.
      zh: 上下文工程和提示缓存本质上是同一问题的两个面。上下文的设计方式决定了缓存的效率。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.85
    reason:
      ko: 추론 비용을 줄이는 접근법을 다룬 글인데, 프롬프트 캐싱이 입력 비용을 줄인다면 이 글은 출력(추론) 비용을 줄이는 방법이다. 둘을 조합하면 총 API 비용을 극적으로 낮출 수 있다.
      ja: 推論コスト削減を扱った記事で、プロンプトキャッシングが入力コストを削減するのに対し、この記事は出力（推論）コストを削減する方法を扱う。両方を組み合わせれば総APIコストを劇的に下げられる。
      en: While this post covers reducing input token costs via caching, the Deep-Thinking Ratio post covers reducing output/reasoning costs — combine both for maximum savings.
      zh: 本文讨论通过缓存降低输入成本，而Deep-Thinking Ratio文章讨论降低输出/推理成本。两者结合可以最大化节省成本。
  - slug: mcp2cli-token-cost-optimization
    score: 0.82
    reason:
      ko: MCP 툴 디스커버리 토큰을 96%까지 줄인 접근법인데, 이 글의 "툴 정의 캐싱" 패턴과 함께 쓰면 MCP 기반 에이전트의 API 비용을 거의 0에 수렴시킬 수 있다.
      ja: MCP ツールディスカバリトークンを96%削減したアプローチで、この記事の「ツール定義キャッシング」パターンと組み合わせると、MCPベースのエージェントのAPIコストをほぼゼロに近づけられる。
      en: The mcp2cli approach reduces tool discovery tokens by 96%; pair it with the tool definition caching pattern here to nearly eliminate MCP-based agent API costs.
      zh: mcp2cli将工具发现token减少96%；与本文的工具定义缓存模式结合使用，可以使基于MCP的Agent API成本趋近于零。
  - slug: heterogeneous-llm-agent-fleet-cost-optimization
    score: 0.80
    reason:
      ko: 이종 LLM 아키텍처로 비용을 90% 줄인 사례인데, 프롬프트 캐싱을 각 모델에 적용하면 추가로 입력 토큰 비용을 70% 더 줄일 수 있다. 두 전략은 상호 보완적이다.
      ja: 異種LLMアーキテクチャでコストを90%削減した事例で、プロンプトキャッシングを各モデルに適用すると、さらに入力トークンコストを70%削減できる。二つの戦略は相互補完的だ。
      en: The heterogeneous fleet approach cuts costs by routing to cheaper models; add prompt caching on top to cut input token costs by another 70%. The strategies stack.
      zh: 异构LLM架构方法通过路由到更便宜的模型来降低成本；在此基础上添加提示缓存，再额外降低70%的输入token成本。两种策略可以叠加使用。
---

API 청구서를 처음 제대로 봤을 때가 생각난다. 이 블로그 자동화 파이프라인을 설계할 때였다. 포스트 작성, 4개 언어 번역, SEO 클로징, 추천 생성까지 Claude API를 하루 수십 번 호출하는 시스템이었는데, 각 요청마다 수천 토큰짜리 시스템 프롬프트가 반복해서 청구되고 있었다.

Anthropic 문서에는 분명 "90% 할인"이라고 써 있다. 그런데 왜 청구서는 줄어들지 않는가?

답은 캐시가 만들어지는 시점과 활성화되는 조건에 있었다. 프롬프트 캐싱은 "켜면 끝"이 아니라 설계가 필요한 기술이다. 잘못 설정하면 캐시 쓰기 비용만 추가되고 정작 할인은 받지 못한다.

이 글은 내가 실제로 이 블로그 자동화 시스템에 적용한 경험을 바탕으로 쓴다. 기술 문서를 요약하는 게 아니라, "내가 어디서 실수했고, 어떻게 고쳤고, 결과적으로 얼마나 줄었는가"를 공유한다.

![Claude API 프롬프트 캐싱 비용 흐름 — 첫 요청 vs 캐시 히트 비교](../../../assets/blog/claude-api-prompt-caching-cost-optimization-guide-flow.png)

## 프롬프트 캐싱이 실제로 작동하는 방식

캐싱의 핵심은 `cache_control` 파라미터다. 특정 콘텐츠 블록에 이 파라미터를 붙이면 Anthropic 서버가 해당 블록을 별도로 저장해두고, 이후 동일한 내용이 요청에 포함될 때 저장된 버전을 재사용한다.

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "당신은 기술 지원 에이전트입니다.\n\n[제품 문서 10,000 토큰...]",
            "cache_control": {"type": "ephemeral"}  # 이 블록을 캐시
        }
    ],
    messages=[{"role": "user", "content": "API 에러 코드 429 해결 방법은?"}]
)

# 캐시 활용 현황 확인
print(response.usage.cache_creation_input_tokens)  # 캐시 생성에 쓴 토큰
print(response.usage.cache_read_input_tokens)       # 캐시에서 읽은 토큰
```

첫 번째 요청에서는 `cache_creation_input_tokens`에 비용이 찍힌다. 두 번째 요청부터 `cache_read_input_tokens`에 90% 할인된 비용이 찍힌다.

몇 가지 제약 조건을 먼저 알아야 한다.

**최소 토큰 임계값**: Claude Sonnet 4.6은 최소 2,048 토큰, Claude Opus 4.7은 최소 4,096 토큰을 넘어야 캐시가 만들어진다. 짧은 시스템 프롬프트에 `cache_control`을 붙여도 캐시가 생성되지 않는다.

**최대 캐시 포인트**: 요청당 최대 4개의 `cache_control` 블록을 지정할 수 있다. 우선순위를 정해서 배치해야 한다.

**캐시 위치**: 캐시 포인트 이후에 오는 내용은 캐시되지 않는다. 자주 바뀌는 내용은 반드시 캐시 포인트 이후에 위치시켜야 한다.

## 2026년 TTL 변경 — 이 함정을 모르면 오히려 손해

솔직히 말하면, 나도 처음엔 이걸 몰라서 한 달 동안 캐싱 효과를 제대로 못 봤다.

Anthropic은 2026년 초에 기본 TTL(Time To Live)을 1시간에서 5분으로 줄였다. 이 변경이 프로덕션 워크로드에 미치는 영향은 생각보다 크다.

**TTL 옵션별 비용 구조 (Claude Sonnet 4.6 기준)**:

| 구분 | 가격 (1M 토큰당) | 배수 |
|------|----------------|------|
| 일반 입력 | $3.00 | 1× |
| 캐시 쓰기 (5분) | $3.75 | 1.25× |
| 캐시 쓰기 (1시간) | $6.00 | 2× |
| **캐시 읽기** | **$0.30** | **0.1×** |
| 출력 | $15.00 | 5× |

5분 TTL로 수지가 맞으려면: 캐시 쓰기 비용(1.25×) 대비 읽기 비용(0.1×)이 차익을 내려면 최소 **2번 이상** 캐시 히트가 필요하다. (1.25 ÷ 0.1 = 12.5배의 비용 격차가 있어서, 한 번 쓰고 두 번 읽으면 0.1 + 0.1 = 0.2 < 1.25라서 이익이 나지 않는다. 실제로는 1.25 - 0.1×N이 음수가 되는 N을 구하면 된다: N > 12.5, 즉 13번 이상 읽어야 캐시 쓰기 비용을 회수하고 진짜 절약이 시작된다.)

잠깐, 계산이 이상하다고 느낄 것이다. 캐시 쓰기 비용은 1.25×인데, 13번이나 읽어야 한다고?

착각하기 쉬운 부분이다. 캐시 쓰기와 읽기는 **서로 다른 요청**의 비용이다. 첫 번째 요청에서 1.25×를 내고 캐시를 만든다. 그 다음부터 동일한 블록을 포함하는 모든 요청은 0.1×만 낸다. 비교 기준이 "캐싱 없이 1×를 냈을 때"라면:

- 캐싱 없이 10번 요청: 10 × 1.0 = 10.0 단위 비용
- 캐싱으로 10번 요청: 1.25 + 9 × 0.1 = 1.25 + 0.9 = 2.15 단위 비용
- **절감률: 78.5%**

단, 5분 TTL이라면 5분 안에 2번 이상 같은 캐시 블록을 포함한 요청이 들어와야 한다. 단발성 스크립트나 사용자가 드문드문 오는 서비스는 캐시 히트율이 낮을 수 있다.

나는 이 블로그 자동화에서 TTL 문제를 이렇게 우회했다. 긴 시간이 걸리는 배치 작업(포스트 4개 언어 번역 등)은 하나의 연속된 루프 안에서 실행해서 캐시가 살아있는 5분 안에 모든 요청을 보낸다. 이 방법으로 한 번의 캐시 쓰기로 4번의 캐시 히트를 얻는다.

## 패턴 1: 시스템 프롬프트 캐싱

가장 일반적이고 효과가 확실한 방법이다. 대부분의 AI 앱은 같은 시스템 프롬프트를 모든 요청에 반복한다.

```python
def create_cached_agent(system_prompt: str):
    """
    시스템 프롬프트를 캐시하는 에이전트 팩토리.
    system_prompt가 2048 토큰을 넘을 때 효과적.
    """
    def chat(user_message: str) -> anthropic.types.Message:
        return client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=[
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"}
                }
            ],
            messages=[{"role": "user", "content": user_message}]
        )
    return chat
```

적용 전후를 비교해보자. 10,000 토큰짜리 시스템 프롬프트를 100번 호출하는 경우:

- **캐싱 없이**: 100 × 10,000 토큰 = 100만 토큰 → $3.00
- **캐싱 적용**: 10,000 (쓰기) + 99 × 10,000 (읽기) = $0.0375 + $0.297 = **$0.334**
- **절감률: 89%**

이 블로그 자동화에서 CLAUDE.md 파일이 약 8,000〜12,000 토큰이다. 하루 30번 이상 이 파일을 컨텍스트에 넣는데, 캐싱 없이는 하루 240만〜360만 토큰이 소비된다. 캐싱 적용 후 실제 청구 토큰은 10% 미만으로 줄었다.

## 패턴 2: RAG 문서 캐싱

RAG(검색 증강 생성) 시스템에서 같은 문서를 여러 질문에 반복 사용할 때 특히 효과적이다.

```python
def cached_rag_qa(docs: list[str], questions: list[str]) -> list[str]:
    """
    동일 문서 세트에 여러 질문을 할 때 문서를 캐시.
    같은 세션 내 5분 안에 질문이 이어져야 효과적.
    """
    doc_content = "\n\n---\n\n".join(docs)
    answers = []
    
    for question in questions:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"참고 문서:\n\n{doc_content}",
                            "cache_control": {"type": "ephemeral"}  # 문서 캐시
                        },
                        {
                            "type": "text",
                            "text": f"\n질문: {question}"
                            # 질문은 매번 바뀌므로 캐시 안 함
                        }
                    ]
                }
            ]
        )
        answers.append(response.content[0].text)
    
    return answers
```

고객 지원 시스템을 예로 들면, 제품 매뉴얼(50,000 토큰)을 하루 1,000번 참조하는 경우 캐싱 없이는 $150이지만 캐싱 후엔 $16.875(캐시 쓰기) + $1.5(캐시 읽기 999번) ≈ **$18.4**다. 하루 기준으로 $131을 절약한다.

단, RAG 패턴에서 주의할 점이 있다. 검색으로 매번 다른 문서를 가져오면 캐시 히트율이 낮아진다. 세션 단위로 관련 문서를 묶어서 캐시하거나, 문서 청크를 고정하고 검색 쿼리만 바꾸는 방식이 더 효과적이다.

[컨텍스트 엔지니어링 관점에서 무엇을 캐시할지 설계하는 방법](/ko/blog/ko/context-engineering-production-ai-agents)을 먼저 이해하면 RAG 캐싱 전략이 훨씬 명확해진다.

## 패턴 3: 툴 정의 캐싱

툴(함수 호출)을 많이 정의하는 에이전트에서 간과하기 쉬운 부분이다. Claude API에 도구를 10〜20개 등록하면 그 스키마만 해도 수천 토큰이 되고, 이게 모든 요청에 반복된다.

```python
# 툴 정의를 별도 블록으로 분리하여 캐싱
tools = [
    {
        "name": "search_web",
        "description": "웹에서 최신 정보를 검색합니다",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "검색 쿼리"},
                "max_results": {"type": "integer", "default": 5}
            },
            "required": ["query"]
        }
    },
    # ... 더 많은 툴 정의
]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    system=[
        {
            "type": "text",
            "text": "당신은 강력한 리서치 에이전트입니다. 다음 도구를 활용하세요.",
            "cache_control": {"type": "ephemeral"}  # 시스템 + 툴 컨텍스트 함께 캐시
        }
    ],
    messages=[{"role": "user", "content": user_request}]
)
```

MCP 기반 에이전트라면 [mcp2cli의 토큰 최적화 접근법](/ko/blog/ko/mcp2cli-token-cost-optimization)과 함께 쓰면 툴 디스커버리 비용을 거의 없앨 수 있다.

## 패턴 4: 멀티턴 대화 캐싱

긴 대화를 이어가는 고객 지원이나 코딩 어시스턴트에서 유효하다. 이전 대화 내용 전체를 매번 다시 보내야 하는데, 이 부분을 캐시하면 대화가 길어질수록 절약이 커진다.

```python
def multiturn_with_caching(history: list, new_message: str) -> tuple:
    """
    멀티턴 대화 캐싱: 직전 교환까지의 기록은 캐시, 새 메시지만 신선.
    """
    messages = history.copy()
    
    # 마지막 유저 메시지에 cache_control 추가 (직전 기록 캐시)
    if messages and messages[-1]["role"] == "user":
        last = messages[-1]
        messages[-1] = {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": last["content"] if isinstance(last["content"], str) 
                            else last["content"][0]["text"],
                    "cache_control": {"type": "ephemeral"}
                }
            ]
        }
    
    # 새 메시지는 캐시하지 않음 (다음 턴에서 캐시됨)
    messages.append({"role": "user", "content": new_message})
    
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=messages
    )
    
    updated_history = messages + [
        {"role": "assistant", "content": response.content[0].text}
    ]
    return response, updated_history
```

20턴 대화에서 평균 메시지가 500 토큰이라면, 마지막 턴에서 이미 10,000 토큰의 기록이 쌓인다. 이 기록을 캐시하면 마지막 10턴의 입력 비용을 90% 줄일 수 있다.

## TypeScript에서 캐싱 구현하기

Node.js 환경에서도 방식은 동일하다. Anthropic의 공식 TypeScript SDK를 쓰면 Python과 거의 같은 구조다.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface CachedAgentOptions {
  systemPrompt: string;
  model?: string;
  maxTokens?: number;
}

function createCachedAgent({ systemPrompt, model = "claude-sonnet-4-6", maxTokens = 2048 }: CachedAgentOptions) {
  return async function chat(userMessage: string) {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    const usage = response.usage as {
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
      input_tokens: number;
      output_tokens: number;
    };

    const hitRate = usage.cache_read_input_tokens
      ? usage.cache_read_input_tokens /
        ((usage.cache_read_input_tokens ?? 0) +
          (usage.cache_creation_input_tokens ?? 0) +
          usage.input_tokens)
      : 0;

    return { response, hitRate };
  };
}

// 사용 예시
const agent = createCachedAgent({
  systemPrompt: "당신은 기술 문서 작성 전문가입니다.\n\n[긴 스타일 가이드 및 규칙...]",
});

// 첫 번째 호출 — 캐시 생성
const { response: r1, hitRate: h1 } = await agent("사용자 인증 API 문서 초안 작성");
console.log(`캐시 히트율: ${(h1 * 100).toFixed(1)}%`); // 0% (캐시 미스)

// 두 번째 호출 — 캐시 히트
const { response: r2, hitRate: h2 } = await agent("에러 코드 목록 작성");
console.log(`캐시 히트율: ${(h2 * 100).toFixed(1)}%`); // ~90% (캐시 히트)
```

TypeScript에서 주의할 점은 `usage` 타입이다. `cache_creation_input_tokens`와 `cache_read_input_tokens`는 SDK 타입 정의에서 선택적(optional) 필드로 처리되는 경우가 많아서, null 체크를 제대로 하지 않으면 런타임 에러가 난다. 위처럼 타입 단언(type assertion)으로 명시하거나, SDK를 최신 버전으로 유지해서 타입이 올바르게 정의된 버전을 쓰는 게 안전하다.

## 캐시 히트율 모니터링 — 실제로 효과가 있는지 어떻게 아는가

"캐싱을 설정했다"와 "캐싱이 실제로 작동한다"는 다른 이야기다. 프로덕션에서는 히트율을 지속적으로 추적해야 한다.

```python
from dataclasses import dataclass, field
from collections import defaultdict
import time

@dataclass
class CacheMetrics:
    total_requests: int = 0
    cache_hits: int = 0
    cache_misses: int = 0
    total_tokens_saved: int = 0
    total_cost_saved_usd: float = 0.0
    
    def record(self, usage):
        self.total_requests += 1
        read = getattr(usage, 'cache_read_input_tokens', 0)
        create = getattr(usage, 'cache_creation_input_tokens', 0)
        
        if read > 0:
            self.cache_hits += 1
            # 캐시가 없었다면 냈을 비용 vs 실제 비용
            tokens_saved = read
            cost_saved = (tokens_saved / 1_000_000) * (3.00 - 0.30)  # Sonnet 4.6 기준
            self.total_tokens_saved += tokens_saved
            self.total_cost_saved_usd += cost_saved
        elif create > 0:
            self.cache_misses += 1
    
    @property
    def hit_rate(self) -> float:
        if self.total_requests == 0:
            return 0.0
        return self.cache_hits / self.total_requests
    
    def report(self):
        print(f"총 요청: {self.total_requests}")
        print(f"캐시 히트: {self.cache_hits} ({self.hit_rate*100:.1f}%)")
        print(f"절약된 토큰: {self.total_tokens_saved:,}")
        print(f"절약된 비용: ${self.total_cost_saved_usd:.4f}")

# 사용 예시
metrics = CacheMetrics()

for i in range(10):
    response = client.messages.create(...)
    metrics.record(response.usage)

metrics.report()
# 총 요청: 10
# 캐시 히트: 9 (90.0%)
# 절약된 토큰: 90,000
# 절약된 비용: $0.2430
```

히트율이 50% 미만이면 뭔가 잘못된 것이다. 가장 흔한 원인은 (1) 요청 간격이 TTL 5분을 초과하거나 (2) 캐시 포인트 이전에 바뀌는 내용이 포함되어 있는 경우다. 로그를 쌓아서 어떤 요청이 미스를 내는지 추적하면 빠르게 원인을 찾을 수 있다.

## 비용 절감을 측정하는 방법

캐싱이 실제로 작동하는지 확인하려면 API 응답의 `usage` 필드를 봐야 한다.

```python
def calculate_cost(usage, model: str = "claude-sonnet-4-6") -> dict:
    """
    API usage 응답에서 실제 비용을 계산.
    2026년 4월 기준 가격.
    """
    prices = {
        "claude-sonnet-4-6": {
            "input": 3.00,
            "cache_read": 0.30,
            "cache_write": 3.75,
            "output": 15.00
        },
        "claude-opus-4-7": {
            "input": 5.00,
            "cache_read": 0.50,
            "cache_write": 6.25,
            "output": 25.00
        }
    }
    
    p = prices[model]
    M = 1_000_000
    
    cache_read = getattr(usage, 'cache_read_input_tokens', 0)
    cache_write = getattr(usage, 'cache_creation_input_tokens', 0)
    fresh_input = getattr(usage, 'input_tokens', 0)
    output = getattr(usage, 'output_tokens', 0)
    
    actual = (
        (cache_read / M) * p["cache_read"] +
        (cache_write / M) * p["cache_write"] +
        (fresh_input / M) * p["input"] +
        (output / M) * p["output"]
    )
    
    no_cache = (
        ((cache_read + cache_write + fresh_input) / M) * p["input"] +
        (output / M) * p["output"]
    )
    
    return {
        "actual_usd": actual,
        "no_cache_usd": no_cache,
        "savings_pct": (no_cache - actual) / no_cache * 100 if no_cache > 0 else 0
    }
```

실제로 돌려본 결과를 보면 이렇다:

```
10,000 토큰 캐시 히트 시뮬레이션:
  실제 비용: $0.0098
  캐싱 없이: $0.0365
  절감: 73.0%
```

이 숫자가 "최상의 경우"임을 알아야 한다. 캐시 히트율이 낮으면 절약이 줄어든다. 내 경험상, 하루 30〜50번 반복되는 긴 시스템 프롬프트에서 실제 절감률은 60〜70%였다.

## 실행 가능성 판단 — 언제 캐싱이 맞지 않는가

캐싱이 항상 이익인 것은 아니다. 나는 처음에 모든 요청에 캐싱을 적용했다가 오히려 비용이 올라간 경험이 있다.

**캐싱이 안 맞는 상황**:

- **단발성 스크립트**: 한 번 실행하고 끝나는 작업. 캐시 쓰기 비용만 추가된다.
- **자주 바뀌는 컨텍스트**: 사용자별로 맞춤화된 긴 시스템 프롬프트. 캐시 히트율이 거의 0이 된다.
- **짧은 시스템 프롬프트**: 2,048 토큰 미만이면 캐시 자체가 생성되지 않는다.
- **스파이크 트래픽**: 5분 안에 요청이 몰렸다가 한참 없으면 캐시 생존율이 낮다.

**캐싱이 잘 맞는 상황**:

- 동일한 긴 시스템 프롬프트를 분당 2회 이상 사용
- 같은 참조 문서로 여러 질문을 받는 FAQ/지원 시스템
- 에이전트 파이프라인에서 툴 정의가 고정된 경우
- 이 블로그처럼 동일한 운영 지침을 반복 참조하는 자동화

## 이 블로그 자동화에 적용한 방법

내가 이 블로그 자동화(daily post, SEO closing, weekly strategy)를 운영하면서 캐싱을 도입한 방식을 공유한다.

핵심은 **하나의 배치 실행 안에서 모든 요청을 5분 내에 처리**하는 것이었다. CLAUDE.md 파일이 약 10,000 토큰이고, 포스트 작성 → 4개 언어 번역 → 릴리이즈 노트 생성까지 7〜8번의 연속 API 호출이 발생한다.

이 과정을 하나의 연속 루프로 엮으면:
1. 첫 번째 요청에서 CLAUDE.md를 캐시로 만든다
2. 이후 7번의 요청은 캐시 히트로 0.1× 비용만 낸다
3. 5분 안에 모두 완료되므로 캐시가 만료되지 않는다

결과적으로 입력 토큰 비용이 약 65% 감소했다. 월 API 비용이 $40〜$60 수준이었는데, 캐싱 최적화 후 $15〜$20으로 줄었다.

이 수준에서 더 줄이려면 [LLM API 가격 비교 2026](/ko/blog/ko/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek)에서 다룬 것처럼 작업 유형별로 다른 모델을 쓰는 이종 아키텍처를 조합해야 한다. 캐싱이 입력 비용을 줄인다면, 모델 라우팅은 단위 비용 자체를 낮춘다.

---

마지막으로 솔직하게 한 마디. 프롬프트 캐싱은 "설정하면 자동으로 절약된다"는 느낌의 기능이 아니다. 어떤 블록을 캐시할지, 요청 패턴이 TTL과 맞는지, 캐시 히트율을 어떻게 측정할지를 설계해야 한다. 처음엔 귀찮아 보이지만, 한 번 제대로 세팅하면 API 비용이 눈에 띄게 달라진다. 나는 그 차이를 직접 봤다.
