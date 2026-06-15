---
title: Mastra.ai 실전 가이드 — TypeScript로 AI 에이전트를 5분 만에 실행하는 법
description: >-
  Mastra.ai TypeScript AI 에이전트 프레임워크를 직접 설치하고 Google Gemini와 연동해 날씨 에이전트를 만들어봤다.
  설치부터 실제 툴 호출까지 실습 기록.
pubDate: '2026-06-14'
heroImage: ../../../assets/blog/mastra-ai-typescript-agent-framework-guide-2026-hero.jpg
tags:
  - mastra
  - typescript
  - ai-agent
  - gemini
  - llm
relatedPosts:
  - slug: ai-agent-cost-reality
    score: 0.9
    reason:
      ko: ai-agent 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into ai-agent.
      ja: ai-agentをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 ai-agent 主题。
  - slug: dena-llm-study-part1-fundamentals
    score: 0.85
    reason:
      ko: LLM를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on LLM experience.
      ja: LLMを実際に扱った経験が続く記事です。
      zh: 延续 LLM 的实战经验。
  - slug: dena-llm-study-part3-model-training
    score: 0.8
    reason:
      ko: 같은 LLM 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same LLM track.
      ja: 同じLLMの流れで併せて読むと役立ちます。
      zh: 在同一 LLM 脉络中可一并阅读。
faq:
  - question: "Mastra.ai는 어떤 프레임워크인가요?"
    answer: "Gatsby.js 팀이 만든 TypeScript-first AI 에이전트 프레임워크로, 에이전트·워크플로우·메모리·옵저버빌리티를 하나의 SDK로 제공합니다. 내부적으로 Vercel AI SDK를 기반으로 동작하며 2026년 1월 v1.0을 출시했습니다."
  - question: "정말 5분 만에 에이전트를 실행할 수 있나요?"
    answer: "npm create mastra@latest 명령으로 설치하는 데 약 2〜3분이 걸렸고, 첫 에이전트 실행까지 합치면 5〜10분 정도입니다. Google Gemini 연동 날씨 에이전트는 서울·도쿄 날씨 비교 응답을 약 5.8초 만에 반환했습니다."
  - question: "Mastra에서 Memory를 쓰려면 무엇이 필요한가요?"
    answer: "Memory는 LibSQL이나 DuckDB 같은 스토리지 백엔드 설정이 반드시 필요합니다. 에이전트만 단독으로 쓰면서 Memory를 포함하면 'Memory requires a storage provider' 에러가 발생합니다."
  - question: "어떤 LLM 제공자를 지원하나요?"
    answer: "OpenAI, Anthropic, Google Gemini, Meta Llama 등 Vercel AI SDK가 지원하는 거의 모든 모델을 쓸 수 있습니다. model 필드의 문자열만 바꾸면 제공자가 전환되므로, 예를 들어 google/gemini-2.5-flash를 anthropic/claude-sonnet-4-6으로 교체할 수 있습니다."
---

"TypeScript 개발자면 결국 LangChain.js 아니면 Vercel AI SDK 정도지." JavaScript로 AI 에이전트를 만들려고 할 때마다 이 말을 들었다. 나도 별 의심 없이 받아들이고 있었다. 그러다 올해 초 Mastra.ai를 알게 됐다. YC W25 배치를 거쳐 $13M 투자를 받고 v1.0을 출시한 프레임워크다.

이름만 알았지 직접 써본 적은 없었다. 오늘 큰맘 먹고 설치했다. Google Gemini와 연동해서 툴 호출이 되는 에이전트를 직접 돌려봤다. "5분 만에 실행된다"는 홍보 문구가 진짜인지가 궁금했다.

## Mastra.ai가 뭔가

Mastra는 Gatsby.js 팀이 만든 TypeScript-first AI 에이전트 프레임워크다. 2024년 10월에 공개되어 15개월 만에 GitHub stars 22,000개, 주간 npm 다운로드 30만 건을 넘겼고, 2026년 1월에 v1.0을 출시했다.

핵심 포지션은 "에이전트, 워크플로우, 메모리, 옵저버빌리티를 하나의 SDK로" 제공한다는 것이다. LangChain이 다양한 패키지의 조합이라면, Mastra는 단일 스택으로 끝내는 접근법을 택했다.

지원하는 LLM 제공자는 OpenAI, Anthropic, Google Gemini, Meta Llama 등 Vercel AI SDK가 지원하는 거의 모든 모델이다. 내부적으로 Vercel AI SDK를 기반으로 쓰기 때문에 Vercel AI SDK로 Claude 스트리밍 에이전트를 만들어본 경험이 있다면 기반 레이어는 이미 아는 셈이다.

### 왜 지금 TypeScript 에이전트 프레임워크가 나왔나

솔직히 말하면, Python 에이전트 라이브러리들에 비해 TypeScript 쪽은 항상 2〜3년 뒤처진 느낌이었다. LangGraph, CrewAI, PydanticAI는 Python 생태계에서 빠르게 성숙했는데, TypeScript 진영은 Vercel AI SDK 수준에 머물러 있었다.

Mastra는 그 공백을 채우려는 시도다. 나는 이게 과대평가될 수도 있다고 생각했는데, 직접 써보니 생각보다 완성도가 있었다. 물론 아쉬운 부분도 있다.

## 설치: `npm create mastra@latest`

공식 문서의 quickstart 방식대로 따라갔다. 내가 사용한 환경은 Node.js v22.22.0.

```bash
npm create mastra@latest mastra-lab -- --components agents,tools --llm google --example
```

`--components agents,tools`로 에이전트와 툴 컴포넌트를 포함하고, `--llm google`로 Google Gemini를 LLM 제공자로 지정했다. `--example`은 날씨 에이전트 예제를 포함한다.

설치 완료까지 약 2〜3분 걸렸다. CLI가 다음 단계를 순서대로 진행해준다:

```
◇  Project structure created
◇  npm dependencies installed
◇  Mastra CLI installed
◇  Mastra dependencies installed
◇  .gitignore added
└  Project created successfully

◇  Mastra initialized successfully!

   Rename .env.example to .env
   and add your GOOGLE_API_KEY

   To start your project:
    cd mastra-lab
    npm run dev
```

생성된 `package.json`의 주요 의존성은 다음과 같다:

```json
{
  "dependencies": {
    "@mastra/core": "^1.42.0",
    "@mastra/duckdb": "^1.4.2",
    "@mastra/libsql": "^1.13.0",
    "@mastra/loggers": "^1.1.2",
    "@mastra/memory": "^1.20.3",
    "@mastra/observability": "^1.14.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "mastra": "^1.13.0",
    "typescript": "^6.0.3"
  }
}
```

TypeScript 6.0.3, Zod v4를 사용한다는 점이 눈에 띈다. 두 패키지 모두 2026년 상반기에 메이저 버전을 올렸는데, Mastra가 최신 버전을 쫓아가고 있다는 건 좋은 신호다.

## 생성된 프로젝트 구조

```
mastra-lab/
├── src/
│   └── mastra/
│       ├── index.ts          # Mastra 인스턴스 초기화
│       ├── agents/
│       │   └── weather-agent.ts  # 에이전트 정의
│       └── tools/
│           └── weather-tool.ts   # 툴 정의
├── .env.example
├── package.json
└── tsconfig.json
```

레이어가 명확하게 분리되어 있다. `agents/`는 에이전트 정의, `tools/`는 외부 API나 데이터 소스와의 인터페이스, `index.ts`는 이것들을 조합한 Mastra 인스턴스다.

## 코드 구조: 에이전트와 툴

생성된 코드를 보면 Mastra의 설계 철학을 알 수 있다.

### 툴 정의

```typescript
// src/mastra/tools/weather-tool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async (inputData) => {
    return await getWeather(inputData.location);
  },
});
```

Zod 스키마로 입출력 타입을 정의하는 방식은 [PydanticAI의 타입 안전 에이전트](/ko/blog/ko/pydantic-ai-type-safe-agent-tutorial-2026)에서 Pydantic BaseModel을 사용하는 것과 구조적으로 비슷하다. 언어만 다를 뿐 "타입이 곧 문서이자 검증 로직"이라는 철학은 같다.

날씨 툴이 사용하는 Open-Meteo API는 무료이고 API 키가 없어서 좋다. geocoding으로 도시명 → 위경도로 변환하고, 날씨 예보 API로 현재 날씨를 가져오는 구조다.

### 에이전트 정의

```typescript
// src/mastra/agents/weather-agent.ts
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { weatherTool } from '../tools/weather-tool';

export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  instructions: `You are a helpful weather assistant...`,
  model: 'google/gemini-2.5-pro',
  tools: { weatherTool },
  memory: new Memory(),
});
```

`model` 필드에 `'google/gemini-2.5-pro'` 같은 문자열을 쓰면 Mastra가 알아서 해당 제공자의 SDK를 사용한다. `@ai-sdk/google`이 내부에서 동작한다.

## 실제 실행: 서울과 도쿄 날씨 비교

에이전트를 직접 실행해봤다. Memory 설정은 스토리지 공급자가 필요하기 때문에 우선 제외하고 기본 에이전트만 테스트했다.

```typescript
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// weatherTool 정의 생략 (위 코드와 동일)

const agent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  instructions: '간결하게 날씨 정보를 제공하는 어시스턴트',
  model: 'google/gemini-2.5-flash',
  tools: { weatherTool },
});

const result = await agent.generate(
  'Compare the current weather in Seoul and Tokyo. Which city is hotter right now?'
);
console.log(result.text);
```

**실행 결과 (2026-06-14, 응답 시간: 5866ms):**

```
It is 27.3°C and feels like 30.1°C in Seoul with mainly clear conditions.
In Tokyo, it is 25.6°C and feels like 27.1°C with overcast conditions.
Seoul is hotter right now.
```

에이전트가 두 도시에 대해 각각 `get-weather` 툴을 호출하고, 결과를 종합해 비교 답변을 만들었다. 약 6초 안에 두 번의 외부 API 호출과 LLM 추론을 완료한 것이다.

툴 호출 자체는 정확했다. 내가 걱정했던 부분 중 하나가 "도시명을 제대로 처리할까"였는데, Seoul을 서울 위경도(37.566, 126.978)로 정확히 변환했다.

### 실행 중 마주친 에러: Memory 스토리지 설정

처음에는 `Memory`를 포함해서 실행했더니 이런 에러가 났다:

```
MastraError: Memory requires a storage provider to function.
Add a storage configuration to Memory or to your Mastra instance.
https://mastra.ai/en/docs/memory/overview
```

공식 예제에는 Memory가 포함되어 있는데, Memory를 사용하려면 LibSQL이나 DuckDB 같은 스토리지 백엔드를 별도로 설정해야 한다. `create mastra`로 생성한 `index.ts`에는 이미 LibSQL + DuckDB 조합이 포함되어 있었지만, 에이전트만 단독으로 사용할 때는 그 설정이 빠져 있었던 것이다.

이 부분은 초보자한테 허들이 될 수 있다. 문서에 더 명확한 안내가 있으면 좋겠다.

## Mastra 아키텍처 구성 요소

![Mastra 아키텍처 다이어그램](../../../assets/blog/mastra-ai-architecture-diagram.png)

Mastra의 전체 구조를 보면 크게 4개 레이어로 나뉜다:

**1. Agent 레이어**
LLM을 호출하고 툴 실행 여부를 결정한다. 한 번의 `generate()` 호출로 내부적으로 여러 번 LLM과 툴을 왕복할 수 있다.

**2. Tools/Integrations**
외부 API, 데이터베이스, 파일 시스템과의 인터페이스. Zod 스키마로 타입을 정의하면 LLM이 올바른 형식으로 인자를 채운다.

**3. Memory 시스템**
대화 이력, 의미론적 검색, 작업 메모리를 관리한다. LibSQL이나 PostgreSQL을 스토리지로 사용한다.

**4. Observability**
OpenTelemetry 기반으로 에이전트 실행 추적, 스팬, 로그를 기록한다. `MastraStorageExporter`와 `MastraPlatformExporter` 두 가지 내보내기 옵션이 있다.

## Mastra Studio

`npm run dev`를 실행하면 `http://localhost:4111`에서 Mastra Studio가 열린다. 에이전트와 대화하고, 툴 호출 과정을 시각적으로 확인하고, 워크플로우를 테스트할 수 있는 웹 UI다.

실제로 실행해보니 개발 단계에서 에이전트 동작을 빠르게 확인하는 데 유용하다. 각 LLM 호출과 툴 실행이 단계별로 표시되어 어디서 무엇이 일어나는지 추적하기 쉽다.

Studio에서 가장 유용한 기능은 **툴 호출 트레이스**다. 에이전트가 어떤 툴을 어떤 인자로 호출했는지, 툴이 뭘 반환했는지, 그 결과로 LLM이 어떻게 반응했는지를 단계별로 볼 수 있다. 디버깅할 때 로그를 파헤치는 것보다 훨씬 직관적이다.

단, Studio는 어디까지나 개발 도구다. 프로덕션 배포 경로와는 분리되어 있다. `npm run build`로 빌드한 결과물을 어떻게 서버에 올리는지는 Vercel 외에는 문서가 아직 얇다.

## Mastra Workflow: 에이전트를 그래프로 조합하기

Mastra의 독특한 강점 중 하나는 워크플로우 시스템이다. 단순한 에이전트 하나가 아니라, 여러 단계를 그래프로 연결하는 복잡한 파이프라인을 구성할 수 있다.

기본 워크플로우 구조는 이렇다:

```typescript
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const step1 = createStep({
  id: 'fetch-weather',
  description: '날씨 데이터 수집',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ 
    temperature: z.number(),
    conditions: z.string()
  }),
  execute: async ({ inputData }) => {
    // 날씨 API 호출
    return { temperature: 27.3, conditions: 'Mainly clear' };
  },
});

const step2 = createStep({
  id: 'generate-advice',
  description: '날씨 기반 활동 추천',
  inputSchema: z.object({ 
    temperature: z.number(),
    conditions: z.string()
  }),
  outputSchema: z.object({ advice: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('advisorAgent');
    const result = await agent?.generate(
      `Temperature: ${inputData.temperature}°C, ${inputData.conditions}. Suggest 3 activities.`
    );
    return { advice: result?.text || '' };
  },
});

export const weatherAdviceWorkflow = createWorkflow({
  id: 'weather-advice',
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.object({ advice: z.string() }),
})
  .then(step1)
  .then(step2)
  .commit();
```

`.then()` 체이닝으로 단계를 연결하고, `.branch()`로 분기를 만들고, `.parallel()`로 병렬 실행도 가능하다. 에이전트가 단순히 LLM을 호출하는 것을 넘어, 복잡한 멀티스텝 프로세스를 타입 안전하게 구성할 수 있다는 게 핵심이다.

이 워크플로우 API가 나는 꽤 마음에 든다. LangGraph처럼 그래프 기반이지만 TypeScript 관용구에 훨씬 가깝게 표현된다. `createStep`의 `inputSchema`, `outputSchema`가 Zod로 정의되어 있어, 단계 간 데이터 흐름이 컴파일 타임에 검증된다.

## 실전 팁: Gemini 모델 선택

Mastra에서 Google Gemini를 쓸 때 모델 선택이 성능과 비용에 직접 영향을 준다.

- `google/gemini-2.5-pro`: 가장 능력이 좋지만 응답이 느리고 비용이 높다. 복잡한 추론이 필요한 에이전트에 적합.
- `google/gemini-2.5-flash`: 빠르고 저렴하다. 내가 테스트한 날씨 에이전트는 Flash로 5.8초 안에 완료됐다. 단순한 툴 호출 중심 에이전트라면 Flash로 시작하는 걸 추천한다.
- `google/gemini-2.0-flash-exp`: 아직 실험적이지만 더 빠르고, 무료 티어에서 사용 가능하다.

Anthropic API 키가 있다면 `anthropic/claude-sonnet-4-6`으로 바꿔도 그냥 동작한다. 모델 문자열만 변경하면 끝이다. 이 추상화가 Mastra의 강점 중 하나다.

## 다른 프레임워크와 비교

TypeScript 생태계에서 Mastra와 가장 가깝게 비교할 수 있는 건 Vercel AI SDK다. Vercel AI SDK가 LLM 호출과 스트리밍에 특화되어 있다면, Mastra는 그 위에 에이전트 수명주기 관리, 메모리, 옵저버빌리티를 추가한 레이어다.

[Google ADK vs LangGraph 비교](/ko/blog/ko/google-adk-vs-langgraph-agent-framework-comparison-2026)를 해봤을 때, 두 프레임워크는 모두 Python 중심이었다. Mastra는 그 공간을 TypeScript에서 메우려는 시도인데, v1.42에서 Mastra의 Workflow와 Memory가 이미 꽤 쓸만하다는 인상을 받았다.

| | Mastra | Vercel AI SDK | LangGraph.js |
|---|---|---|---|
| 언어 | TypeScript | TypeScript | TypeScript |
| 에이전트 루프 | ✅ 내장 | ⚠️ 수동 구현 | ✅ 내장 |
| 메모리 | ✅ 내장 (스토리지 필요) | ❌ | ⚠️ 수동 구현 |
| 워크플로우 | ✅ 그래프 기반 | ❌ | ✅ 그래프 기반 |
| Observability | ✅ OpenTelemetry | ❌ | ⚠️ 외부 도구 필요 |
| LLM 제공자 | 다수 | 다수 | 제한적 |
| 학습 곡선 | 중간 | 낮음 | 높음 |

## 아쉬운 점 두 가지

첫 번째는 Memory 설정의 진입 장벽이다. 앞서 말한 것처럼 에이전트만 단독으로 사용할 때 Memory를 포함하면 에러가 난다. 처음 사용하는 사람한테 이 에러 메시지는 직관적이지 않다. 공식 예제 코드와 실제 단독 실행 코드 사이의 갭이 존재한다.

두 번째는 Mastra Studio가 아직 프로덕션 배포 개념과 분리되어 있다는 점이다. Studio는 개발 도구인데, 실제로 에이전트를 프로덕션에 배포하는 방법에 대한 문서가 아직 충분하지 않다. Vercel에 배포하는 공식 가이드는 있지만 Docker나 자체 서버 배포는 직접 파악해야 한다.

## 언제 Mastra를 쓰고, 언제 피해야 하나

직접 써본 뒤 정리한 판단 기준이다. 도구 선택은 결국 상황에 달려 있다.

**Mastra가 잘 맞는 경우**

- TypeScript/JavaScript 기반 프로젝트에서 에이전트를 처음 도입할 때. 팀이 이미 Node 생태계에 익숙하다면 Python 스택을 새로 들이는 것보다 진입 비용이 낮다.
- 에이전트 루프, 메모리, 옵저버빌리티를 한 SDK 안에서 끝내고 싶을 때. 여러 라이브러리를 직접 엮는 작업을 줄여준다.
- 워크플로우(그래프 기반 멀티스텝 파이프라인)가 필요한 경우. `.then()` / `.branch()` / `.parallel()`의 타입 안전한 조합이 강점이다.
- LLM 제공자를 자주 바꿔가며 실험하는 단계. 모델 문자열만 교체하면 OpenAI, Anthropic, Gemini를 오갈 수 있다. 비용과 응답 속도 트레이드오프는 [AI 에이전트 비용의 현실](/ko/blog/ko/ai-agent-cost-reality)에서 더 자세히 다뤘다.

**피하는 게 나은 경우**

- 미션 크리티컬한 프로덕션 서비스에 당장 투입해야 할 때. v1.0이 나온 지 반년이 안 됐고, API 안정성과 서드파티 통합 생태계가 LangChain 수준에 못 미친다.
- Python 라이브러리 생태계(LangGraph, CrewAI, PydanticAI)의 성숙도와 커뮤니티 플러그인이 결정적인 경우. 선택지 비교는 [Python AI 에이전트 라이브러리 비교](/ko/blog/ko/python-ai-agent-library-comparison-2026)를 참고하면 좋다.
- Vercel 외의 환경(Docker, 자체 서버)에 복잡한 배포 파이프라인을 즉시 구축해야 할 때. 공식 배포 문서가 아직 얇다.
- 단순히 LLM 호출 한두 번이면 충분한 경우. 그럴 땐 Vercel AI SDK만으로도 충분하고, 에이전트 추상화의 오버헤드가 불필요하다.

순수하게 툴 호출 패턴만 비교하고 싶다면 [Claude Agent SDK 툴 사용 가이드](/ko/blog/ko/claude-agent-sdk-tool-use-complete-guide-2026)와 나란히 놓고 보면 설계 차이가 분명해진다.

## 지금 Mastra를 써볼 만한가

나는 Yes라고 본다. 단, 조건이 있다.

TypeScript로 새 에이전트 프로젝트를 시작한다면 Mastra는 확실히 살펴볼 가치가 있다. 설치부터 첫 에이전트 실행까지 5〜10분이면 끝난다. 프레임워크 구조도 헷갈릴 게 없다.

하지만 프로덕션에 당장 투입하기엔 아직 생태계가 얇다. 커뮤니티 플러그인이나 서드파티 통합이 LangChain 수준은 아니다. 또한 v1 출시가 반년이 채 안 됐기 때문에 API 안정성을 완전히 신뢰하기는 이른 감이 있다.

사이드 프로젝트나 내부 도구라면 지금 바로 써도 된다. 프로덕션 서비스라면 좀 더 지켜보다가 v1.5 정도에서 재평가하겠다는 게 내 판단이다.

```bash
# 시작하는 방법
npm create mastra@latest my-agent-app -- --components agents,tools --llm google --example
cd my-agent-app
# .env에 GOOGLE_API_KEY 추가
npm run dev
```

`http://localhost:4111`에서 Mastra Studio가 열리면 첫 에이전트와 대화할 수 있다. 그게 전부다.

## 참고 자료

- [Mastra 공식 사이트](https://mastra.ai/) — 프레임워크 소개, 기능 개요, 가격 정책
- [Mastra 공식 문서](https://mastra.ai/docs) — 에이전트, 워크플로우, 메모리, 옵저버빌리티 가이드
- [Mastra GitHub 저장소](https://github.com/mastra-ai/mastra) — 소스 코드, 이슈, 릴리스 노트
- [Open-Meteo API](https://open-meteo.com/) — 날씨 툴이 사용하는 무료 날씨 데이터 API
