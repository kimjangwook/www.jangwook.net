---
title: Jest에서 Vitest 4로 마이그레이션하기 — 설치부터 실전 테스트까지 완전 가이드
description: >-
  Vitest 4.1.7 기준으로 Jest 프로젝트를 단계별로 마이그레이션하는 실전 가이드. 설치, 설정 전환, jest→vitest 코드
  변환 패턴, Browser Mode stable, 신규 매처(toSatisfy, toBeOneOf)까지 직접 실험한 결과를 담았다.
pubDate: '2026-05-26'
heroImage: ../../../assets/blog/vitest-4-jest-migration-guide-2026-hero.png
tags:
  - Vitest
  - Jest
  - TypeScript
relatedPosts:
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.9
    reason:
      ko: TypeScript 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into TypeScript.
      ja: TypeScriptをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 TypeScript 主题。
  - slug: hono-typescript-api-2026
    score: 0.85
    reason:
      ko: TypeScript를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on TypeScript experience.
      ja: TypeScriptを実際に扱った経験が続く記事です。
      zh: 延续 TypeScript 的实战经验。
  - slug: bun-shell-scripting-practical-guide-2026
    score: 0.8
    reason:
      ko: 같은 TypeScript 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same TypeScript track.
      ja: 同じTypeScriptの流れで併せて読むと役立ちます。
      zh: 在同一 TypeScript 脉络中可一并阅读。
faq:
  - question: "Jest를 꼭 Vitest 4로 마이그레이션해야 하나요?"
    answer: "TypeScript와 Vite 기반 프로젝트라면 권장합니다. ts-jest 같은 변환 레이어 설정과 tsconfig 충돌, 모듈 해석 오류를 계속 디버깅하는 비용이 크기 때문입니다. 다만 Next.js나 Express 기반 대형 서버 테스트 스위트라면 Vitest가 Vite 생태계에 최적화돼 있어 신중하게 판단하는 것이 좋습니다."
  - question: "globals: true 옵션은 왜 중요한가요?"
    answer: "이 옵션을 켜면 기존 Jest 코드의 describe, test, expect를 import 없이 그대로 쓸 수 있습니다. 마이그레이션 초기에 모든 테스트 파일을 한꺼번에 바꾸지 않아도 됩니다. 설정하지 않으면 describe is not defined 에러가 발생합니다."
  - question: "vi.importActual()을 쓸 때 자주 하는 실수는 무엇인가요?"
    answer: "jest.requireActual()과 달리 vi.importActual()은 비동기라서 mock 팩토리를 async로 만들고 await를 붙여야 합니다. await를 빼면 모듈 export 대신 Promise 객체가 펼쳐져 들어가 잘못 동작합니다. 부분 mock 마이그레이션에서 가장 흔한 실수입니다."
  - question: "Vitest 마이그레이션은 시간이 얼마나 걸리나요?"
    answer: "필자 경험상 소규모 TypeScript 프로젝트 기준 30〜60분이면 충분했습니다. 가장 오래 걸리는 작업은 vi.importActual() 패턴을 찾는 것과 moduleNameMapper를 resolve.alias로 옮기는 것입니다. 이 두 가지만 미리 파악하면 나머지는 거의 자동입니다."
---

지난달부터 사이드 프로젝트 테스트 파이프라인을 정비하면서, 오랫동안 써온 Jest를 Vitest로 전환했다. 이유는 간단했다. TypeScript 프로젝트에서 Jest를 유지하려면 `ts-jest`나 `babel-jest` 같은 변환 레이어가 필요한데, 이게 설정 항목이 늘수록 에러 메시지가 암호처럼 읽히기 시작한다.

Vitest는 Vite와 같은 변환 파이프라인을 쓰기 때문에 TypeScript를 별도 설정 없이 그냥 이해한다. 게다가 Vitest 4에서 Browser Mode가 stable로 격상되면서, 예전엔 jest-dom + JSDOM 조합으로 흉내냈던 DOM 테스트를 실제 Chromium에서 돌릴 수 있게 됐다.

이 글은 실제로 샌드박스에서 `vitest@4.1.7`을 설치하고 16개 테스트를 통과시킨 결과를 토대로 작성했다. 설정 파일 하나하나를 설명하는 게 아니라, "Jest에서 온 사람이 막히는 지점"을 중심으로 정리했다.

## Vitest가 Jest보다 나은 이유, 속도가 아니라 설정 복잡도

"Vitest가 3〜8배 빠르다"는 벤치마크 수치를 자주 본다. 직접 측정하지는 않았지만, 속도보다 내가 더 체감한 건 **설정 복잡도의 차이**다.

Jest로 TypeScript를 쓰려면 보통 이런 패키지가 필요하다.

```bash
npm install --save-dev jest @types/jest ts-jest @jest/globals
```

그리고 `jest.config.ts`에:

```ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
```

Vitest는:

```bash
npm install --save-dev vitest
```

끝이다. `vitest.config.ts`에 Vite 설정을 그대로 가져올 수도 있고, `defineConfig`로 처음부터 쓸 수도 있다.

다만 아쉬운 점도 있다. **Vitest는 Node.js 생태계 전체를 지원하는 게 아니라 Vite 생태계에 최적화**되어 있다. Next.js나 Express 같은 서버 중심 프레임워크에서 Jest를 쓰던 사람이라면, 프로젝트 규모에 따라 마이그레이션 비용이 생각보다 클 수 있다. Browser Mode를 쓰지 않는 순수 Node.js 테스트라면 마이그레이션 장점이 줄어든다는 점도 솔직히 말해두고 싶다.

## Prerequisites

- Node.js 18 이상 (22 권장)
- 기존 Jest 프로젝트 (Jest 27〜30 모두 해당)
- TypeScript 사용 프로젝트 기준으로 설명 (JS 프로젝트도 동일 흐름)

확인:

```bash
node --version  # v22.22.0
npm --version   # 10.9.4
```

## Step 1: Vitest 4 설치

기존 Jest 의존성을 먼저 제거한다.

```bash
npm uninstall jest @types/jest ts-jest babel-jest @jest/globals jest-environment-jsdom
```

Vitest 4 설치:

```bash
npm install --save-dev vitest@4
```

UI 대시보드가 필요하다면:

```bash
npm install --save-dev @vitest/ui
```

설치 확인:

```bash
npx vitest --version
# vitest/4.1.7 darwin-arm64 node-v22.22.0
```

52개 패키지가 설치되는 데 8초 걸렸다. Jest + ts-jest 조합을 설치할 때와 비교하면 패키지 수가 절반 이하다.

## Step 2: vitest.config.ts 작성

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,          // describe/test/expect를 import 없이 사용 (Jest 호환)
    environment: 'node',    // 'jsdom' | 'happy-dom' | 'browser' 선택 가능
    include: ['**/*.{test,spec}.{ts,js}'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',       // Jest: 'babel' 대신 v8 기반
      include: ['src/**'],
      exclude: ['**/*.test.ts'],
    },
  },
})
```

**`globals: true`가 핵심이다.** 이 옵션을 켜면 기존 Jest 코드에서 `import { describe, test, expect } from '@jest/globals'` 라인을 제거하지 않아도 동작한다. 마이그레이션 초기에 코드를 한꺼번에 바꾸지 않아도 된다는 뜻이다.

`package.json`에 스크립트 추가:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

기존 `"test": "jest"`를 교체한다.

## Step 3: Jest → Vitest 코드 변환 패턴

대부분의 테스트 코드는 **그대로 동작한다.** `globals: true`를 설정했기 때문에 `describe`, `test`, `expect`, `beforeEach`, `afterEach`는 변환이 필요 없다.

변환이 필요한 패턴:

### jest.fn() → vi.fn()

```ts
// Before (Jest)
const mockFn = jest.fn((x: number) => x * 2)

// After (Vitest)
import { vi } from 'vitest'
const mockFn = vi.fn((x: number) => x * 2)
```

직접 실험한 결과, `vi.fn()`의 동작은 `jest.fn()`과 동일했다.

```
✓ vi.fn() mocking > tracks calls with vi.fn() 2ms
✓ vi.fn() mocking > toHaveBeenCalledExactlyOnceWith 0ms
```

### jest.mock() → vi.mock()

```ts
// Before (Jest)
jest.mock('./api-service')

// After (Vitest)
vi.mock('./api-service', () => ({
  fetchUser: vi.fn(),
  createUser: vi.fn(),
}))
```

Vitest에서 `vi.mock()`은 호이스팅이 적용된다. Jest처럼 파일 상단에서 동작한다.

### jest.requireActual() → vi.importActual()

이게 가장 헷갈리는 부분이다. Jest에서 일부만 mock하는 패턴:

```ts
// Before (Jest)
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  formatDate: jest.fn(),
}))

// After (Vitest)
vi.mock('./utils', async () => ({
  ...(await vi.importActual('./utils')),
  formatDate: vi.fn(),
}))
```

`vi.importActual()`은 **비동기**다. `async/await`를 잊으면 에러가 난다. 처음에 여기서 막히는 사람이 많다.

### jest.spyOn() → vi.spyOn()

```ts
// 거의 동일하게 사용 가능
const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
console.log('test')
expect(spy).toHaveBeenCalledWith('test')
spy.mockRestore()
```

### jest.clearAllMocks() → vi.clearAllMocks()

`beforeEach`에서 자주 쓰는 패턴:

```ts
beforeEach(() => {
  vi.clearAllMocks()  // jest.clearAllMocks() 대체
})
```

## Step 4: Vitest 3〜4에서 추가된 신규 매처

이 매처들은 Jest에 없다. 마이그레이션 후 추가로 쓸 수 있는 기능들이다.

### toHaveBeenCalledExactlyOnceWith

mock이 정확히 한 번, 특정 인수로 호출됐는지 검증한다.

```ts
const fn = vi.fn()
fn('hello')

expect(fn).toHaveBeenCalledExactlyOnceWith('hello')
// ✓ 한 번 호출, 인수도 일치

fn('world')
expect(fn).toHaveBeenCalledExactlyOnceWith('hello')
// ✗ 두 번 호출됐으므로 실패
```

### toSatisfy

커스텀 조건 함수로 검증한다. 범위, 패턴, 복잡한 조건을 간결하게 표현할 수 있다.

```ts
expect(42).toSatisfy((n: number) => n > 0 && n < 100)
expect('vitest').toSatisfy((s: string) => s.startsWith('vi'))
```

### toBeOneOf

값이 배열 중 하나인지 확인한다. 환경 변수, 상태값 검증에 유용하다.

```ts
const env = process.env.NODE_ENV
expect(env).toBeOneOf(['development', 'staging', 'production'])
```

실제로 이 세 매처를 테스트해본 결과:

```
✓ toHaveBeenCalledExactlyOnceWith 0ms
✓ toSatisfy 0ms
✓ toBeOneOf 0ms
```

모두 통과했다.

## Step 5: 라인 번호로 특정 테스트만 실행하기

Vitest 3에서 추가된 기능 중 내가 가장 자주 쓰게 된 건 **라인 번호 필터링**이다.

```bash
# 특정 테스트 파일의 19번 라인 테스트만 실행
npx vitest run "src/vitest4-features.test.ts:19"
```

실행 결과:

```
↓ src/vitest4-features.test.ts:6  > tracks calls with vi.fn()     [skipped]
✓ src/vitest4-features.test.ts:19 > toHaveBeenCalledExactlyOnceWith  1ms
↓ src/vitest4-features.test.ts:28 > spies on console.log          [skipped]
...
Tests  1 passed | 7 skipped (8)
Duration  106ms
```

19번 라인의 테스트 하나만 실행하고 나머지는 skip했다. `--testNamePattern` 같은 긴 옵션 없이 IDE에서 "이 줄로 이동 후 실행"이 된다. VS Code의 Vitest Extension과 함께 쓰면 테스트 클릭 한 번으로 실행된다.

존재하지 않는 라인 번호를 지정하면:

```
Error: No test found in src/vitest4-features.test.ts in line 32
```

명확한 에러 메시지를 반환한다. 이런 부분이 DX(개발자 경험) 차이다.

## Step 6: Inline Workspace (Vitest 3+)

모노레포나 여러 환경에서 테스트를 나눠 실행해야 할 때, 예전엔 별도 `vitest.workspace.ts` 파일이 필요했다. Vitest 3부터는 `vitest.config.ts` 안에서 바로 정의할 수 있다.

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    workspace: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.unit.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: ['src/**/*.integration.test.ts'],
          globalSetup: './test/setup.ts',
        },
      },
    ],
  },
})
```

별도 워크스페이스 파일 없이 한 파일에서 관리할 수 있어서 설정 파일이 줄어든다.

## Step 7: Browser Mode (Vitest 4 stable)

Vitest 4의 가장 큰 변화는 Browser Mode가 experimental에서 stable로 격상된 것이다. 컴포넌트 테스트를 JSDOM 시뮬레이션 없이 실제 Chromium에서 실행할 수 있다.

설치:

```bash
npm install --save-dev @vitest/browser-playwright playwright
```

설정:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },  // 멀티 브라우저 설정 가능
      ],
    },
  },
})
```

나는 Browser Mode를 이번 포스트 범위에서 직접 실험하지 않았다 — 브라우저 환경 테스트는 별도 CI 셋업이 필요하고, 단순 Node.js 마이그레이션보다 훨씬 큰 작업이다. 다만 안정화됐다는 점에서, Playwright AI 기반 E2E 테스트를 Vitest로 통합하는 시도가 의미있어진 건 맞다.

## Step 8: CI 설정 (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

Jest와 다른 점은 없다. `npm test`가 `vitest run`을 실행하도록 스크립트를 바꿔놨으면 그대로 쓰면 된다.

## globals부터 jest.config 충돌까지, 막히기 쉬운 4가지

**1. globals: true 없이 실행하면 `describe is not defined`**

`vitest.config.ts`에 `globals: true`를 넣지 않으면 기존 Jest 코드에서 `describe`, `test`, `expect`를 찾을 수 없다는 에러가 난다. 마이그레이션 초기에 이 옵션 먼저 켜두면 대부분의 코드가 그냥 통과한다.

**2. vi.importActual()을 동기로 쓰면 빈 객체 반환**

```ts
// 잘못된 예
vi.mock('./utils', () => ({
  ...vi.importActual('./utils'),  // async 아님 → Promise 객체가 들어감
}))

// 올바른 예
vi.mock('./utils', async () => ({
  ...(await vi.importActual('./utils')),
}))
```

**3. moduleNameMapper 대체**

Jest에서 `moduleNameMapper`로 별칭(alias)을 설정했다면, Vitest에서는 `resolve.alias`를 쓴다.

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
  },
})
```

**4. jest.config.ts가 남아있으면 충돌**

Vitest는 `jest.config.*` 파일을 무시하지 않고 충돌을 일으키는 경우가 있다. 마이그레이션 완료 후 `jest.config.ts`를 삭제하는 걸 잊지 말자.

## 타입스크립트 글로벌 타입 설정

`globals: true`를 켜면 런타임에서는 `describe`와 `expect` 등이 글로벌로 주입되지만, TypeScript가 타입을 모르는 경우가 있다. `tsconfig.json`에 다음을 추가한다.

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

이렇게 하면 `describe`, `it`, `expect`, `vi`를 import 없이 타입 안전하게 쓸 수 있다. `@types/jest`를 지우고 이것으로 교체하면 된다.

## 커버리지 설정

Vitest는 v8 기반 커버리지를 기본으로 지원한다. Jest는 기본적으로 Istanbul(babel 기반)을 쓰는데, V8은 Node.js 런타임 내장 기능을 활용해서 babel transform 없이도 동작한다.

```bash
# 커버리지 패키지 설치
npm install --save-dev @vitest/coverage-v8

# 실행
npm run test:coverage
```

`vitest.config.ts`에 임계값 설정:

```ts
coverage: {
  provider: 'v8',
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80,
  },
  reporter: ['text', 'json', 'html'],
}
```

`html` 리포터를 쓰면 `coverage/index.html`에 시각적 리포트가 생성된다. 브라우저에서 열어보면 어떤 라인이 커버되지 않았는지 바로 보인다.

## UI 모드 (개발 중 테스트 피드백)

`vitest --ui`를 실행하면 브라우저에서 테스트를 관리할 수 있는 대시보드가 열린다. `@vitest/ui` 패키지가 설치되어 있어야 한다.

```bash
npx vitest --ui
# http://localhost:51204/__vitest__/ 로 열림
```

테스트 트리, 실행 시간, 에러 스택트레이스가 시각화된다. 긴 테스트 스위트에서 특정 파일만 집중적으로 돌릴 때 유용하다. 개인적으로는 `--ui`보다 CLI + Claude Code를 활용한 병렬 테스트 자동화를 선호하지만, 협업 환경에서 UI가 더 직관적인 경우가 있다.

## 전체 실행 결과 (샌드박스 검증)

실제로 샌드박스에서 16개 테스트를 돌린 결과:

```
 RUN  v4.1.7

 ✓ src/math.jest-style.test.ts  (6 tests)  →  Jest 스타일 코드 그대로 통과
 ✓ src/api-service.test.ts      (2 tests)  →  vi.mock() 패턴
 ✓ src/vitest4-features.test.ts (8 tests)  →  신규 매처, vi.fn, vi.spyOn

 Test Files  3 passed (3)
      Tests  16 passed (16)
   Start at  15:26:44
   Duration  157ms (transform 67ms, setup 0ms, import 91ms, tests 15ms)
```

157ms. 테스트 16개가 0.16초. Jest라면 여기에 ts-jest 변환 시간이 더해진다.

## 그래서, 마이그레이션할 가치가 있나

내 판단은 **TypeScript 프로젝트라면 예스, 그렇지 않으면 케이스 바이 케이스**다.

TypeScript를 쓰는 Vite 기반 프로젝트에서 Jest를 유지하는 건 점점 역방향이 되고 있다. 변환 레이어 설정에 tsconfig 충돌, 거기에 모듈 해석 오류까지. 이 문제들을 계속 디버깅하는 시간이 아깝다.

반면 Next.js나 Express 기반의 대형 서버 테스트 스위트라면 신중해야 한다. Vitest가 Vite 생태계에 최적화된 만큼, Node.js 모듈 시스템의 복잡한 케이스에서 예상치 못한 동작이 나올 수 있다. 실제로 npm 주간 다운로드가 4.8M에서 7.7M으로 늘었다는 건 그만큼 많은 프로젝트가 갈아탔다는 뜻이지만, 모두가 쉽게 전환한 건 아닐 것이다.

[Bun으로 TypeScript 스크립트를 자동화](/ko/blog/ko/bun-shell-scripting-practical-guide-2026)하면서 Vitest를 Bun으로 돌리는 조합을 시도 중인데, 이건 다음 포스트에서 다룰 예정이다.

Vitest 5.0 beta가 이미 npm에 올라와 있다. 안정화되면 또 한 번 주요 변화가 있을 것 같다. 지금은 4.x로 마이그레이션해두는 게 무난한 선택이다.

마이그레이션 자체는 생각보다 빠르게 끝난다. 내 경험으로는 소규모 TypeScript 프로젝트 기준으로 30〜60분이면 충분했다. 가장 오래 걸리는 건 `vi.importActual()` 패턴 찾기와 `moduleNameMapper`를 `resolve.alias`로 옮기는 작업이다. 이 두 가지만 미리 파악하고 들어가면 나머지는 거의 자동이다.
