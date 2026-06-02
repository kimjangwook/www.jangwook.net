---
title: 'TypeScript Zod v4 + Claude API 구조화 출력 완전 가이드 — 타입 안전한 LLM 응답 파싱 실전'
description: 'Zod v4 safeParse()와 변경된 스키마 API로 Claude API 응답을 타입 안전하게 파싱하는 패턴을 직접 검증했다. v3 대비 성능 수치, z.string().check() 신규 API, 중첩 스키마 설계 전략을 Claude API 통합 코드와 함께 정리한다.'
pubDate: '2026-06-02'
heroImage: '../../../assets/blog/typescript-zod-v4-claude-api-structured-output-guide-2026/typescript-zod-v4-claude-api-structured-output-guide-2026-hero.png'
tags: ['TypeScript', 'Zod', 'Claude API']
relatedPosts:
  - slug: 'mcp-server-typescript-sdk-step-by-step-2026'
    score: 0.88
    reason:
      ko: 'MCP 서버에서 도구 입력값을 검증할 때 Zod v4 스키마가 직접 쓰인다. 이 글의 safeParse 패턴이 MCP 도구 핸들러 안에서 그대로 동작한다.'
      ja: 'MCPサーバーでツール入力値を検証するとき、Zod v4スキーマが直接使われる。この記事のsafeParseパターンがMCPツールハンドラー内でそのまま動く。'
      en: 'When validating tool inputs in an MCP server, Zod v4 schemas apply directly. The safeParse patterns in this article work inside MCP tool handlers as-is.'
      zh: '在 MCP 服务器中验证工具输入值时，Zod v4 模式直接可用。这篇文章的 safeParse 模式在 MCP 工具处理程序中直接运行。'
  - slug: 'vitest-4-ai-agent-testing-patterns-2026'
    score: 0.84
    reason:
      ko: 'Zod 스키마로 파싱한 LLM 응답을 단위 테스트할 때 Vitest 4의 모킹 패턴이 필요하다. Claude API 응답을 모킹하고 safeParse 결과를 단언하는 방법이 이 글과 연결된다.'
      ja: 'Zodスキーマでパースしたレスポンスを単体テストするとき、Vitest 4のモッキングパターンが必要になる。Claude APIレスポンスをモッキングしてsafeParse結果をアサートする方法がこの記事と繋がる。'
      en: 'Unit testing LLM responses parsed through Zod schemas requires Vitest 4 mocking patterns. Mocking Claude API responses and asserting safeParse results links directly to this article.'
      zh: '对通过 Zod 模式解析的 LLM 响应进行单元测试时，需要 Vitest 4 的模拟模式。模拟 Claude API 响应并断言 safeParse 结果与这篇文章直接相关。'
  - slug: 'claude-agent-sdk-tool-use-complete-guide-2026'
    score: 0.79
    reason:
      ko: 'Tool Use 응답의 input 필드를 안전하게 파싱하려면 Zod 스키마가 필수다. tool_use 블록의 JSON 입력을 타입 안전하게 처리하는 패턴을 이 글과 함께 보면 완성된다.'
      ja: 'Tool Use レスポンスのinputフィールドを安全にパースするにはZodスキーマが必須だ。tool_useブロックのJSON入力をタイプセーフに処理するパターンをこの記事と一緒に見ると完成する。'
      en: 'Safely parsing the input field of Tool Use responses requires a Zod schema. Reading this article alongside the Tool Use guide completes the pattern for type-safe JSON handling in tool_use blocks.'
      zh: '安全解析 Tool Use 响应的 input 字段需要 Zod 模式。将这篇文章与 Tool Use 指南一起阅读，就完成了类型安全处理 tool_use 块 JSON 输入的完整模式。'
  - slug: 'pydantic-ai-type-safe-agent-tutorial-2026'
    score: 0.72
    reason:
      ko: 'Python 쪽에서 같은 문제를 Pydantic으로 해결하는 접근이 궁금하다면 비교가 된다. TypeScript Zod와 Python Pydantic의 설계 철학 차이를 보는 시각이 생긴다.'
      ja: 'Python側で同じ問題をPydanticで解決するアプローチが気になるなら比較になる。TypeScript ZodとPython Pydanticの設計思想の違いを見る視点が生まれる。'
      en: 'If you are curious how the same problem is solved in Python with Pydantic, this offers a useful comparison. It reveals the design philosophy differences between TypeScript Zod and Python Pydantic.'
      zh: '如果你好奇 Python 端如何用 Pydantic 解决同样的问题，这是一个很好的对比。可以看出 TypeScript Zod 和 Python Pydantic 在设计理念上的差异。'
---

Claude API에서 받은 JSON 문자열을 `JSON.parse()`만으로 믿고 쓰다가 런타임 오류를 만난 적이 있다. `content[0].text`를 파싱해서 꺼낸 객체가 예상 필드를 갖고 있다는 보장이 없다. LLM은 프롬프트를 무시하거나, 필드 이름을 살짝 바꾸거나, 타입을 섞는다. Zod v4는 그 문제를 타입 레벨에서 막아준다.

이 글에서는 Zod 4.4.3과 `@anthropic-ai/sdk 0.100.1`을 기준으로, Claude API 응답을 안전하게 파싱하는 실전 패턴을 정리한다. 직접 100,000번 파싱 벤치마크를 돌려봤고, v3에서 바뀐 API가 실제로 어떻게 달라졌는지 코드로 확인했다.

## Zod v4가 v3와 실제로 무엇이 달라졌나

공식 발표에서 헤드라인 수치는 인상적이다. 문자열 파싱 14배, 배열 7배, 객체 6.5배 빠름. 번들 크기는 57% 감소. TypeScript 타입 인스턴스화 최대 100배 감소. 그런데 수치가 좋아 보인다고 바로 마이그레이션을 결정할 필요는 없다.

직접 써봤는데, 체감되는 변화는 세 가지다.

**첫째, 에러 메시지가 더 명확해졌다.** v3에서 `required_error`로 커스텀 메시지를 넣던 패턴이 단일 `error` 파라미터로 통합됐다. 그리고 기본 에러 메시지 포맷도 바뀌었다. v3에서 `"String must contain at least 1 character(s)"`였던 것이 v4에서는 `"Too small: expected string to have >=1 characters"`로 바뀐다. 코드베이스에서 에러 메시지 문자열을 직접 테스트하고 있다면 깨진다.

**둘째, 숫자 유효성 검사가 더 엄격해졌다.** `Infinity`와 `-Infinity`가 v3에서는 `z.number()`를 통과했다. v4에서는 `success: false`를 반환한다. `Number.MAX_SAFE_INTEGER`를 넘는 정수도 `z.number().int()`에서 거부된다. 외부 API나 LLM 응답에서 극단값이 들어올 가능성이 있는 코드라면 주의해야 한다.

**셋째, API 설계가 정리됐다.** `z.string().email()` 대신 `z.email()`을 쓰는 것이 v4 스타일이다. `.and()` 대신 `z.intersection(A, B)`. 그리고 인라인 커스텀 검증을 위한 `.check()` 메서드가 새로 생겼다.

솔직히 말하면, v4가 v3보다 항상 빠른 것은 아니다. 커뮤니티 벤치마크에서 복잡하게 중첩된 스키마 일부 시나리오에서는 v3가 오히려 빠른 케이스가 나왔다. 헤드라인 수치는 일반적인 패턴 기준이고, 모든 코드에 적용되지는 않는다.

### v4에서 공식 제거됐지만 아직 존재하는 API

`.and()` 메서드는 공식 문서에서 제거됐다고 나와 있다. 그런데 4.4.3에서 실제로 테스트해보면 아직 존재하고 정상 동작한다. 마이그레이션 가이드가 실제 릴리즈보다 앞서 나간 것 같다. `required_error` 파라미터도 마찬가지다. 기술적으로 동작은 하지만 메시지 포맷이 달라졌다. 하드 제거가 아니라 조용한 deprecated 처리로 보인다.

마이그레이션 계획을 세울 때 문서보다 실제 버전에서 확인하는 것이 안전하다.

## 설치와 기본 설정

```bash
npm install zod@^4.4.3
npm install @anthropic-ai/sdk@^0.100.1
```

TypeScript 프로젝트라면 `tsconfig.json`에 `strict: true`가 켜져 있어야 Zod의 타입 추론이 제대로 작동한다.

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

설치 직후 기본 동작을 확인하는 최소 코드다.

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),         // v4 스타일: z.string().email() 대신
  age: z.number().int().min(0).max(150),
  role: z.enum(['admin', 'user', 'viewer'])
});

type User = z.infer<typeof UserSchema>;

const result = UserSchema.safeParse({
  name: 'Jangwook',
  email: 'kim.jangwook@example.com',
  age: 30,
  role: 'admin'
});

if (result.success) {
  console.log(result.data.name); // 타입: string
} else {
  console.log(result.error.issues);
}
```

실행 결과는 예상대로다.

```
success: true
parsed data: {"name":"Jangwook","email":"kim.jangwook@example.com","age":30,"role":"admin"}
```

### @zod/mini는 별도 패키지

공식 발표에 `@zod/mini`가 포함됐다. 약 1.9KB gzip 기준의 트리셰이커블 배포판이다. 프론트엔드 번들 크기가 중요한 경우에 유용하다. 단, API 표면이 메인 `zod` 패키지와 다르다. 이 글에서는 Claude API와의 서버 사이드 통합을 다루기 때문에 메인 패키지 기준으로 설명한다.

## LLM 응답에 맞는 스키마 설계

LLM 응답을 파싱하는 스키마는 일반 폼 데이터 스키마와 설계 방향이 다르다. 핵심 차이는 **방어적 선택적 필드 처리**다.

LLM은 요청한 필드를 모두 반환하지 않을 수 있다. 응답 품질이 일정하지 않고, 프롬프트 변경으로 구조가 바뀔 수 있다. 이 현실을 반영한 스키마 설계가 필요하다.

### 기본 LLM 응답 스키마

```typescript
import { z } from 'zod';

// 블로그 포스트 분석 응답 스키마
const BlogAnalysisSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(10),
  tags: z.array(z.string()).min(1).max(10),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  readingTimeMinutes: z.number().int().min(1).max(60),
  // LLM이 항상 반환하지 않을 수 있는 선택적 필드
  seoScore: z.number().min(0).max(1).optional(),
  suggestedImprovements: z.array(z.string()).optional()
});

type BlogAnalysis = z.infer<typeof BlogAnalysisSchema>;
```

### 메타데이터 포함 중첩 스키마

Claude API가 실제로 구조화된 데이터를 반환할 때 응답 자체에 대한 메타정보가 필요한 경우가 있다. 신뢰도 점수나 모델 정보를 함께 받고 싶을 때다.

```typescript
const LLMResponseSchema = z.object({
  // 실제 콘텐츠
  content: z.object({
    title: z.string().min(1),
    tags: z.array(z.string()),
    body: z.string()
  }),
  // 응답 메타데이터 (선택적)
  metadata: z.object({
    model: z.string(),
    confidence: z.number().min(0).max(1),
    processingTimeMs: z.number().int().positive()
  }).optional()
});
```

직접 테스트에서 `.optional()`이 붙은 중첩 객체는 예상대로 동작했다. `metadata` 필드가 없어도 파싱이 성공한다.

```
LLM response (with metadata) success: true
title: Zod v4: A Deep Dive into Schema Validation
confidence: 0.92
LLM response (no metadata) success: true
```

### z.string().check()로 LLM 응답 형식 검증

v4에서 새로 생긴 `.check()` API가 유용한 케이스가 있다. LLM이 특정 프리픽스나 포맷을 지켜야 하는 응답을 반환할 때다.

```typescript
// LLM이 항상 "RESULT:" 프리픽스를 붙여야 하는 응답
const LLMResultSchema = z.string().check((ctx) => {
  if (!ctx.value.startsWith('RESULT:')) {
    ctx.issues.push({
      code: 'custom',
      message: 'LLM 응답은 "RESULT:"로 시작해야 합니다',
      input: ctx.value
    });
  }
});

const valid = LLMResultSchema.safeParse('RESULT: 분석 완료');
const invalid = LLMResultSchema.safeParse('분석 완료');

console.log(valid.success);   // true
console.log(invalid.success); // false
```

주의할 점이 있다. `.check()` 콜백 안에서 `ctx.issues.push()`에 넣는 이슈 객체의 형태에 대한 TypeScript 자동완성이 부족하다. `code: 'custom'`과 `message`, `input` 필드는 필수인데, 편집기에서 힌트가 잘 안 나온다. 처음 쓰는 사람이 실수하기 쉬운 부분이다.

## Claude API 응답을 Zod로 파싱하기

### Pattern 1: 프롬프트로 JSON 응답 요청 후 파싱

가장 단순한 패턴이다. 시스템 프롬프트에서 JSON 형식을 지정하고, 응답 텍스트를 `JSON.parse()`한 후 Zod로 검증한다.

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const client = new Anthropic();

// 원하는 응답 구조 정의
const ArticleAnalysisSchema = z.object({
  title: z.string().min(1),
  mainTopics: z.array(z.string()).min(1).max(5),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedReadTime: z.number().int().positive(),
  hasCodeExamples: z.boolean()
});

type ArticleAnalysis = z.infer<typeof ArticleAnalysisSchema>;

async function analyzeArticle(content: string): Promise<ArticleAnalysis> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `당신은 기술 문서 분석기입니다. 
반드시 다음 JSON 형식으로만 응답하세요:
{
  "title": "문서 제목",
  "mainTopics": ["주제1", "주제2"],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedReadTime": 숫자(분),
  "hasCodeExamples": true | false
}
JSON 외의 텍스트는 포함하지 마세요.`,
    messages: [
      { role: 'user', content: `다음 문서를 분석하세요:\n\n${content}` }
    ]
  });

  // 응답 텍스트 추출
  const textContent = response.content.find(block => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('텍스트 응답이 없습니다');
  }

  // JSON 파싱
  let parsed: unknown;
  try {
    parsed = JSON.parse(textContent.text);
  } catch {
    throw new Error(`JSON 파싱 실패: ${textContent.text}`);
  }

  // Zod 검증
  const result = ArticleAnalysisSchema.safeParse(parsed);
  if (!result.success) {
    const errorSummary = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`스키마 검증 실패: ${errorSummary}`);
  }

  return result.data;
}
```

이 패턴의 약점은 LLM이 JSON 블록 앞뒤에 마크다운 코드 펜스나 설명 텍스트를 붙일 때 `JSON.parse()`가 실패한다는 것이다. 실용적인 처리가 필요하다.

```typescript
function extractJsonFromResponse(text: string): string {
  // ```json ... ``` 블록에서 JSON 추출
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }

  // 중괄호로 시작하고 끝나는 부분 추출
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return text;
}
```

### Pattern 2: Tool Use로 구조화된 출력 강제

[Claude Agent SDK Tool Use 완전 가이드](/ko/blog/ko/claude-agent-sdk-tool-use-complete-guide-2026)에서 다루는 것처럼, `tool_use`를 활용하면 JSON 형식을 강제할 수 있다. LLM이 도구를 "호출"하는 형태로 구조화된 데이터를 반환하게 만드는 패턴이다.

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const client = new Anthropic();

// Zod 스키마를 Tool 정의의 입력 스키마로 변환
const ArticleMetadataSchema = z.object({
  title: z.string().describe('문서의 핵심 제목'),
  tags: z.array(z.string()).describe('관련 태그 목록 (최대 5개)'),
  confidence: z.number().min(0).max(1).describe('분석 신뢰도 (0~1)')
});

// Anthropic Tool 형식으로 스키마 정의
// (zodToJsonSchema 라이브러리 없이 직접 작성하는 예시)
const extractMetadataTool: Anthropic.Messages.Tool = {
  name: 'extract_metadata',
  description: '문서에서 메타데이터를 추출합니다',
  input_schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: '문서의 핵심 제목'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: '관련 태그 목록 (최대 5개)'
      },
      confidence: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: '분석 신뢰도 (0~1)'
      }
    },
    required: ['title', 'tags', 'confidence']
  }
};

async function extractMetadata(content: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: [extractMetadataTool],
    tool_choice: { type: 'auto' },
    messages: [
      {
        role: 'user',
        content: `다음 내용에서 메타데이터를 추출하세요:\n\n${content}`
      }
    ]
  });

  // tool_use 블록 찾기
  const toolUseBlock = response.content.find(
    block => block.type === 'tool_use' && block.name === 'extract_metadata'
  );

  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    throw new Error('도구가 호출되지 않았습니다');
  }

  // tool_use의 input은 unknown 타입 — Zod로 검증
  const result = ArticleMetadataSchema.safeParse(toolUseBlock.input);

  if (!result.success) {
    throw new Error(
      `tool_use 입력 검증 실패: ${JSON.stringify(result.error.format())}`
    );
  }

  return result.data;
}
```

Tool Use 패턴이 Pattern 1보다 안정적인 이유가 있다. Claude는 도구 `input`에 JSON을 직접 구조화하여 반환한다. 마크다운 코드 펜스나 설명 텍스트가 끼어들 공간이 없다. SDK가 내부적으로 JSON 파싱까지 처리하므로 `JSON.parse()` 실패를 별도로 처리할 필요가 없다.

단, Tool Use도 Zod 검증을 건너뛰면 안 된다. `toolUseBlock.input`의 타입은 `unknown`이다. Claude가 잘못된 타입을 반환했을 때 타입 에러가 런타임까지 숨어 있다가 터진다.

## 프로덕션 에러 처리 패턴

LLM 응답 파싱에서 에러는 두 레이어에서 발생한다. JSON 파싱 단계와 Zod 검증 단계. 두 레이어를 구분해서 처리해야 디버깅이 편하다.

### 에러 레이어 분리

```typescript
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; stage: 'json' | 'schema'; error: string; raw?: string };

function parseLLMResponse<T>(
  text: string,
  schema: z.ZodType<T>
): ParseResult<T> {
  // 레이어 1: JSON 파싱
  let parsed: unknown;
  try {
    const jsonText = extractJsonFromResponse(text);
    parsed = JSON.parse(jsonText);
  } catch (err) {
    return {
      success: false,
      stage: 'json',
      error: err instanceof Error ? err.message : String(err),
      raw: text
    };
  }

  // 레이어 2: Zod 스키마 검증
  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      stage: 'schema',
      error: formatZodError(result.error),
      raw: text
    };
  }

  return { success: true, data: result.data };
}

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map(issue => {
      const path = issue.path.length > 0
        ? `[${issue.path.join('.')}]`
        : '[root]';
      return `${path} ${issue.message}`;
    })
    .join('; ');
}
```

### error.format()으로 구조화된 에러 반환

v4에서도 `error.format()`이 존재한다. 필드별로 에러를 구조화해서 반환한다.

```typescript
const result = BlogAnalysisSchema.safeParse(badData);

if (!result.success) {
  const formatted = result.error.format();
  // 반환 예시:
  // {
  //   _errors: [],
  //   title: { _errors: ['Too small: expected string to have >=1 characters'] },
  //   tags: { _errors: ['Too small: expected array to have >=1 items'] }
  // }

  // 특정 필드의 에러만 꺼내기
  const titleErrors = formatted.title?._errors ?? [];
  const tagsErrors = formatted.tags?._errors ?? [];
}
```

클라이언트에 에러를 반환하거나 로그로 남길 때 필드별로 정리된 형태가 필요하면 `error.format()`이 편하다. 단순히 에러 목록만 필요하면 `error.issues` 배열을 직접 쓰는 것이 더 간단하다.

### 재시도 로직과 폴백

LLM 응답 파싱이 실패했을 때 재시도하는 패턴이 있다. 프롬프트에 에러 메시지를 포함해서 LLM에게 수정을 요청하는 방식이다.

```typescript
async function analyzeWithRetry(
  content: string,
  schema: z.ZodType<unknown>,
  maxRetries = 2
): Promise<unknown> {
  let lastError = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const systemPrompt = attempt === 0
      ? BASE_SYSTEM_PROMPT
      : `${BASE_SYSTEM_PROMPT}\n\n이전 응답에서 다음 오류가 발생했습니다: ${lastError}\n정확히 요청한 JSON 형식으로만 응답하세요.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') continue;

    const parseResult = parseLLMResponse(textBlock.text, schema);
    if (parseResult.success) return parseResult.data;

    lastError = parseResult.error;
    console.warn(`Attempt ${attempt + 1} failed: ${lastError}`);
  }

  throw new Error(`${maxRetries + 1}번 시도 후 파싱 실패: ${lastError}`);
}
```

재시도 횟수를 너무 늘리면 API 비용이 올라간다. 2회 이하가 현실적이다.

## 성능: Zod v4의 실제 속도는

직접 Apple Silicon에서 벤치마크를 돌렸다. 4개 필드 객체 스키마 기준으로 100,000번 `safeParse()`를 반복했다.

```typescript
const UserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  age: z.number().int().min(0).max(150),
  role: z.enum(['admin', 'user', 'viewer'])
});

const testData = {
  name: 'Jangwook',
  email: 'kim.jangwook@example.com',
  age: 30,
  role: 'admin'
};

const iterations = 100_000;
const start = performance.now();

for (let i = 0; i < iterations; i++) {
  UserSchema.safeParse(testData);
}

const duration = performance.now() - start;
const parsesPerSecond = Math.round(iterations / (duration / 1000));
console.log(`duration: ${duration.toFixed(2)}ms`);
console.log(`parses/second: ${parsesPerSecond.toLocaleString()}`);
```

결과는 다음과 같았다.

```
iterations: 100,000
duration: 45.78ms
parses/second: 2,184,481
```

초당 218만 번 파싱. Claude API 응답을 처리하는 용도로는 과잉이다. API 응답 시간 자체가 수백 밀리초에서 수 초 단위이기 때문에 Zod의 파싱 속도가 병목이 되는 일은 없다.

이 숫자가 의미 있는 케이스는 배치 처리다. 수백만 건의 로그나 이벤트 데이터를 Zod로 검증하는 파이프라인이라면 v4의 속도 향상이 눈에 띄게 체감된다. LLM 응답 파싱 단독 용도로는 v3에서 v4로 넘어가는 성능 이유가 크지 않다.

나는 지금 신규 프로젝트라면 Zod v4를 선택한다. 기존 v3 코드베이스를 지금 당장 마이그레이션할 이유는 크지 않다. v4가 프로덕션에 쓰기 충분히 성숙했다는 판단이지만, v3 코드가 잘 작동하고 있다면 서두를 필요가 없다.

### 환경별 성능 편차

Apple Silicon M-시리즈에서 측정한 수치다. AWS나 GCP의 Linux x86 인스턴스에서는 다르게 나온다. CI 환경에서 성능을 보장해야 한다면 직접 측정해야 한다. 공식 수치를 그대로 믿는 것은 권장하지 않는다.

## 실전 통합 예시: 블로그 포스트 메타데이터 추출기

앞에서 설명한 패턴을 조합한 실제 사용 가능한 예시다.

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const client = new Anthropic();

// 블로그 포스트 메타데이터 스키마
const PostMetadataSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(50).max(200),
  tags: z.array(z.string().min(1)).min(1).max(5),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedReadingTime: z.number().int().min(1).max(60),
  hasCodeExamples: z.boolean(),
  targetAudience: z.string().min(10).max(100)
});

type PostMetadata = z.infer<typeof PostMetadataSchema>;

async function extractPostMetadata(
  markdownContent: string
): Promise<PostMetadata> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `기술 블로그 포스트를 분석하여 메타데이터를 JSON으로 반환하세요.
반드시 다음 형식을 지켜야 합니다:
{
  "title": "포스트 핵심 제목 (100자 이하)",
  "description": "SEO용 설명 (50~200자)",
  "tags": ["태그1", "태그2"],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimatedReadingTime": 숫자(분),
  "hasCodeExamples": true | false,
  "targetAudience": "대상 독자 설명 (10~100자)"
}`,
    messages: [
      {
        role: 'user',
        content: `다음 마크다운 콘텐츠를 분석하세요:\n\n${markdownContent}`
      }
    ]
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('텍스트 응답이 없습니다');
  }

  const parseResult = parseLLMResponse(textBlock.text, PostMetadataSchema);

  if (!parseResult.success) {
    throw new Error(
      `메타데이터 추출 실패 [${parseResult.stage}]: ${parseResult.error}`
    );
  }

  return parseResult.data;
}
```

[TypeScript로 나만의 MCP 서버 만들기](/ko/blog/ko/mcp-server-typescript-sdk-step-by-step-2026)에서 MCP 도구를 구현할 때도 이 패턴을 그대로 쓸 수 있다. 도구 핸들러 함수에서 LLM을 호출하고, 응답을 Zod로 검증한 후 구조화된 결과를 반환하면 된다.

[Vitest 4로 AI 에이전트 테스트하기](/ko/blog/ko/vitest-4-ai-agent-testing-patterns-2026)에서 다룬 것처럼, 이 함수를 단위 테스트할 때는 `client.messages.create()`를 모킹하고 `safeParse()`의 결과를 단언하면 된다. Zod 스키마가 있으면 테스트 픽스처를 스키마 기준으로 만들 수 있어서 편하다.

### v3에서 v4로 마이그레이션할 때 체크리스트

1. `Infinity`, `-Infinity` 값을 `z.number()`로 검증하던 코드 확인
2. `required_error`, `invalid_type_error` 파라미터 → `error`로 통합
3. 에러 메시지 문자열을 테스트에서 직접 비교하는 코드 수정
4. `z.string().email()` → `z.email()`로 점진적 변경 (구버전도 동작하지만 v4 스타일로)
5. `.and()` → `z.intersection(A, B)` 변경 (아직 동작하지만 공식 지원 종료 예정)
6. 커뮤니티 codemod `zod-v3-to-v4` 활용 검토 (대형 코드베이스 기준)

마이그레이션이 부담스럽다면 `z.number()` 관련 breaking change만 먼저 확인하는 것으로 충분하다. 나머지는 점진적으로 처리할 수 있다.

## 마치며

Zod v4는 LLM 응답 파싱에 쓸 만하다. `safeParse()`의 타입 안전성, 중첩 스키마 지원, 통합된 에러 API가 Claude API와 잘 맞물린다. 성능 향상은 LLM 응답 파싱 용도로는 체감하기 어렵지만, TypeScript 컴파일 속도 개선은 대형 프로젝트에서 실질적인 차이를 만든다.

한 가지 불편한 점을 꼽자면, `.check()` API의 TypeScript 지원이 아직 완전하지 않다는 것이다. 커스텀 이슈를 `ctx.issues.push()`로 넣을 때 자동완성 없이 작성해야 한다. 이 부분은 앞으로 개선이 필요하다.

신규 프로젝트라면 Zod v4를 쓰고, 기존 v3 코드베이스라면 breaking change 목록을 확인한 후 점진적으로 마이그레이션하는 것을 권한다.
