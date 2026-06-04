---
title: 'Deno 2 vs Bun 1.3 — 2026년 Node.js 대안 런타임 실전 비교: TypeScript, 속도, 보안'
description: 'Deno 2.8.2와 Bun 1.3.14를 직접 설치해서 startup 시간, HTTP 처리량, npm 호환성, 보안 모델을 실측했다. 어느 쪽이 내 프로젝트에 맞는지 결론을 내려본다.'
pubDate: '2026-06-04'
heroImage: '../../../assets/blog/deno-2-vs-bun-nodejs-runtime-2026-comparison-hero.png'
tags: ['Deno', 'Bun', 'TypeScript', 'Node.js', '런타임 비교']
relatedPosts:
  - slug: 'bun-shell-scripting-practical-guide-2026'
    score: 0.92
    reason:
      ko: 'Bun의 전체 그림이 궁금해졌다면, Bun Shell의 $`` 템플릿 리터럴로 TypeScript 자동화 스크립트를 만드는 법을 이 글에서 깊게 다뤘다.'
      ja: 'Bunの全体像が気になったなら、BunShellの$``テンプレートリテラルでTypeScript自動化スクリプトを作る方法をこの記事で詳しく扱っている。'
      en: 'If you want to go deeper on Bun, this post covers Bun Shell scripting with the $`` template literal — a practical guide with real output logs.'
      zh: '如果你想深入了解Bun，这篇文章详细介绍了使用$``模板字面量编写Bun Shell TypeScript自动化脚本的方法。'
  - slug: 'hono-typescript-api-2026'
    score: 0.88
    reason:
      ko: 'Deno와 Bun 모두 Hono.js와 궁합이 좋다. 어느 런타임을 선택하든 Hono로 엣지 API를 만드는 실전 패턴이 그대로 적용된다.'
      ja: 'DenoもBunもHono.jsと相性が良い。どのランタイムを選んでも、HonoでエッジAPIを作る実践パターンはそのまま使える。'
      en: 'Both Deno and Bun work great with Hono.js. Whichever runtime you pick, the edge API patterns from this post apply directly.'
      zh: 'Deno和Bun都与Hono.js配合良好。无论选择哪个运行时，这篇文章中的边缘API实践模式都直接适用。'
  - slug: 'vitest-4-jest-migration-guide-2026'
    score: 0.72
    reason:
      ko: 'Bun은 bun test라는 자체 테스트 러너가 있고, Deno는 deno test를 내장한다. TypeScript 테스트 생태계 전환을 고려하고 있다면 이 글도 참고할 만하다.'
      ja: 'Bunはbun testというテストランナーを内蔵し、Denodeno testを持っている。TypeScriptテスト移行を検討しているならこの記事も参考になる。'
      en: 'Bun ships with bun test, Deno with deno test. If you are considering a TypeScript test ecosystem switch, this migration guide is worth a read.'
      zh: 'Bun内置bun test，Deno内置deno test。如果你在考虑TypeScript测试生态系统的迁移，这篇迁移指南值得参考。'
  - slug: 'uv-python-ai-development-setup-guide-2026'
    score: 0.65
    reason:
      ko: '"개발 도구 하나가 패키지 매니저, 런타임, 테스트 러너를 통합한다"는 흐름은 Bun과 uv가 공유하는 설계 철학이다. Python 진영의 같은 움직임이 궁금하다면 읽어볼 만하다.'
      ja: '「開発ツール一つがパッケージマネージャー、ランタイム、テストランナーを統合する」という流れはBunとuvが共有する設計哲学だ。Python陣営の同じ動きが気になるなら読む価値がある。'
      en: 'The idea of one tool unifying package manager, runtime, and test runner is a design philosophy shared by both Bun and uv. If you are curious about the same trend in Python, this post is the answer.'
      zh: '"一个工具统一包管理器、运行时和测试运行器"这一趋势是Bun和uv共享的设计哲学。如果你对Python领域的同样趋势感到好奇，这篇文章能给你答案。'
---

2026년 중반, JavaScript 런타임 선택지는 셋으로 좁혀졌다. Node.js, Bun, Deno. 그리고 솔직히 말하면, Node.js를 고집할 이유가 점점 사라지고 있다. 문제는 Bun과 Deno 사이에서다.

나는 이 둘을 오래 관망해왔다. Bun이 "빠르다"는 건 알고 있었고, Deno 2가 Node.js 호환성을 크게 개선했다는 것도 알고 있었다. 그런데 실제로 내 맥에서 돌려보기 전까지는 선택 기준이 명확하지 않았다. 이번에 직접 Deno 2.8.2와 Bun 1.3.14를 임시 샌드박스에 설치해서 수치를 뽑았다.

## 두 런타임, 한 줄 요약

**Bun**은 Node.js 생태계를 그대로 가져오면서 속도를 극적으로 올리는 걸 목표로 한다. 기존 `package.json`, `node_modules`, npm 워크플로우가 그대로 동작한다. 갈아탈 비용이 낮다.

**Deno 2**는 처음부터 다시 설계한 런타임이다. 보안 모델, URL 기반 import, `npm:` 지정자, JSR(JavaScript Registry) 등 새로운 관행을 제안한다. Node.js와 완전한 역호환이 됐지만, 철학은 다르다.

같은 TypeScript 코드를 실행하는 두 도구지만, 어느 방향에서 왔는지가 완전히 다르다.

## 설치부터 시작

```bash
# Bun 설치
curl -fsSL https://bun.sh/install | bash
bun --version  # 1.3.14

# Deno 설치
curl -fsSL https://deno.land/install.sh | sh
deno --version  # 2.8.2 (stable, aarch64-apple-darwin), TypeScript 6.0.3
```

Bun은 `~/.bun/bin/bun` 하나가 생긴다. 런타임, 패키지 매니저, 번들러, 테스트 러너가 이 하나에 다 들어있다. Deno는 `~/.deno/bin/deno` 하나다. 구조적으로는 비슷해 보이지만, Bun은 node_modules 방식을 그대로 지원하고 Deno는 URL 기반 모듈 시스템을 기본으로 쓴다.

## Startup 시간: Bun이 빠르지만, 항상 그런 건 아니다

100,000개 숫자 배열의 합계를 구하는 간단한 TypeScript 파일(`hello.ts`)로 실측했다.

```
# cold start (첫 실행)
Bun:   0.243s
Deno:  0.067s

# warm (2~5회차 평균)
Bun:   0.013s
Deno:  0.026s
```

이 결과가 예상과 달랐다. Bun이 항상 더 빠른 게 아니었다. 첫 실행은 Deno가 약 3.6배 빠르다. Bun의 첫 실행이 느린 이유는 JavaScriptCore 기반 JIT 컴파일러가 초기화되는 비용 때문으로 보인다. 반면 워밍업 이후엔 Bun이 2배 빠르다.

실제 서버나 긴 프로세스에서는 Bun의 warm 성능이 유리하다. 하지만 CLI 도구나 짧게 실행되는 스크립트라면 Deno가 더 반응성이 좋다.

## HTTP 처리량: 거의 동등

Apache Bench로 직접 측정했다 (n=3000, c=30, 127.0.0.1).

```
Bun Serve API:   23,794 RPS  (0.126s)
Deno.serve API:  22,594 RPS  (0.133s)
```

차이가 약 5%다. 실무에서 의미 있는 차이라고 보기 어렵다. 두 런타임 모두 Node.js의 기본 HTTP 모듈 대비 현저히 빠르고, 병목은 네트워크나 비즈니스 로직에서 생기지 런타임에서 생기지 않는다.

<strong>내가 HTTP 성능만 보고 런타임을 고르겠다는 생각은 없다.</strong> 이 수치는 "둘 다 충분히 빠르다"는 것을 확인하는 데 의미가 있다.

## npm 패키지 호환성: 방식이 다르다

여기가 실질적으로 가장 다른 부분이다.

**Bun**: 전통적인 npm 방식

```bash
bun add zod            # 91ms, node_modules 생성
bun add lodash @types/lodash  # 651ms, 35개 패키지 설치
```

`bun add`는 npm보다 빠른 패키지 매니저다. node_modules 구조를 그대로 사용하므로 기존 프로젝트를 마이그레이션할 때 추가 설정이 거의 없다.

**Deno**: npm: 지정자 방식

```typescript
// 설치 없음, 직접 import
import { z } from "npm:zod@3";
import _ from "npm:lodash@4";
```

`npm:` 지정자를 쓰면 패키지를 별도로 설치하지 않아도 된다. 첫 실행 시 Deno의 글로벌 캐시에 다운로드되고, 이후에는 오프라인도 가능하다. node_modules가 없다는 게 처음엔 어색하지만, 새 환경에서 클론 후 바로 실행된다는 장점이 크다.

내가 [Bun Shell 스크립트 가이드](/ko/blog/ko/bun-shell-scripting-practical-guide-2026)를 쓸 때는 Bun의 npm 호환성 덕분에 기존 유틸리티 라이브러리를 그대로 가져올 수 있었다. Deno의 `npm:` 방식은 스크립트 단위 실험이나 새 프로젝트에서 더 편리하다.

## 보안 모델: 이게 진짜 차이다

이 부분은 내가 Deno를 과소평가하고 있었다는 걸 깨달은 지점이다.

**Deno: 기본 샌드박스**

```bash
# 권한 없이 파일 읽기 시도
$ deno run deno-security.ts
Permission denied: Requires read access to "/etc/hosts"

# 명시적 권한 부여
$ deno run --allow-read=/etc/hosts --allow-net=api.github.com deno-security.ts
File read success: ## Host Database ...
Network success: 200
```

**Bun: 열린 모델**

```bash
$ bun run bun-security.ts
File read (Bun, no restriction): ## Host Database ...
```

Bun은 Node.js처럼 파일 시스템, 네트워크, 환경변수에 기본으로 접근 가능하다. 개발 편의성은 높지만, 서드파티 패키지가 악성 코드를 실행하더라도 막을 방법이 없다.

Deno는 `--allow-read`, `--allow-write`, `--allow-net`, `--allow-env`, `--allow-run` 등 권한을 명시적으로 허용해야 한다. CI/CD나 서버 환경에서 서드파티 코드를 실행할 때 Deno의 샌드박스가 실질적인 방어선이 된다.

솔직히 말하면, Deno의 권한 플래그는 처음엔 번거롭다. `--allow-net` 없이 fetch를 쓰다가 에러가 나는 경험을 몇 번 하고 나면 익숙해지지만, 기존 Node.js 개발자라면 초기에 마찰이 있다.

## Node.js 호환성: 이제 둘 다 된다

Deno 1.x 시절에는 Node.js API 호환성이 큰 약점이었다. Deno 2에서는 상황이 바뀌었다.

```typescript
// node: prefix로 표준 모듈 사용
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
```

직접 테스트한 결과, Bun과 Deno 모두 위 코드가 동일하게 동작했다. `crypto.createHash("sha256")`, EventEmitter, `fs.existsSync` 모두 통과. [Hono.js를 Cloudflare Workers에서 실행하는 것처럼](/ko/blog/ko/hono-typescript-api-2026), Hono는 Bun과 Deno 어디서든 동일하게 동작한다.

## TypeScript 지원: 버전 차이에 주목

```
Bun 1.3.14:   TypeScript (Babel 기반 트랜스파일러)
Deno 2.8.2:   TypeScript 6.0.3 (V8 14.9.207.2)
```

둘 다 TypeScript를 별도 컴파일 없이 실행하지만, 방식이 다르다.

Bun은 타입 체크를 수행하지 않는다. TypeScript를 JavaScript로 변환만 하고 실행한다. 속도가 빠른 이유 중 하나다.

Deno는 TypeScript 6.0.3을 사용하며 `deno check` 명령으로 완전한 타입 검증이 가능하다. CI에서 타입 안전성을 보장하고 싶다면 Deno가 더 명확한 선택지다.

```bash
# Deno: 타입 체크 포함 실행
deno check main.ts    # 타입 에러만 검사
deno run main.ts      # 타입 체크 없이 빠른 실행

# Bun: 타입 체크 없는 트랜스파일
bun run main.ts       # 항상 타입 체크 스킵
bun typecheck         # tsc를 별도로 호출
```

## 패키지 생태계: JSR vs npm

Deno 2에는 `jsr:` 지정자도 있다. JSR(JavaScript Registry)은 Deno 팀이 만든 새 패키지 레지스트리로, TypeScript를 네이티브로 지원하고 ESM 전용이다.

```typescript
// JSR 패키지 사용
import { assertEquals } from "jsr:@std/assert@1";
import { serve } from "jsr:@hono/hono@4/deno";
```

개인적으로 JSR에서 배포된 패키지 품질은 높지만, npm 대비 패키지 수가 적다. 2026년 현재 JSR의 생태계는 성장 중이지만, 즉시 쓸 수 있는 대부분의 라이브러리는 여전히 npm에 있다.

Bun은 npm 생태계를 그대로 쓰기 때문에 이 문제가 없다.

## 내 선택 기준

실측 데이터를 정리하면 이렇다.

| 항목 | Bun 1.3.14 | Deno 2.8.2 |
|------|-----------|-----------|
| 초기 실행 | 0.243s (느림) | 0.067s (빠름) |
| 워밍업 후 | 0.013s (빠름) | 0.026s (보통) |
| HTTP RPS | 23,795 | 22,594 |
| 패키지 설치 | bun add 91ms | npm: 지정자 (설치 없음) |
| 보안 모델 | 열린 모델 | 기본 샌드박스 |
| Node.js 호환성 | 매우 높음 | Deno 2에서 크게 개선됨 |
| TypeScript | 트랜스파일만 | 타입 체크 지원 (TS 6.0.3) |
| 패키지 생태계 | npm 전체 | npm + JSR |

**기존 Node.js 프로젝트 속도 개선**: Bun. 마이그레이션 비용이 낮고 npm 생태계를 그대로 쓴다.

**새 TypeScript 프로젝트**: Deno. 타입 안전성, 보안 모델, 설치 없는 npm: 지정자 조합이 깔끔하다.

**CLI 도구나 짧은 스크립트**: Deno. cold start가 빠르고 단일 파일로 배포하기 좋다.

**Cloudflare Workers / Edge**: 둘 다 Hono와 잘 맞는다. Cloudflare는 자체 런타임이 있어서 여기서는 크게 차이가 없다.

**서드파티 코드 실행**: Deno. 샌드박스가 없는 환경에서 알 수 없는 패키지를 실행하는 건 위험하다.

## 내가 과대평가했던 것

"Bun이 몇 배 빠르다"는 마케팅 메시지를 자주 봤다. 실제로는 HTTP 처리량에서 5% 차이다. cold start에서는 오히려 Deno가 빠르다. 진짜 차이는 속도가 아니라 보안 모델, TypeScript 타입 체킹 방식, 패키지 관리 철학이다.

Deno 2가 Node.js 호환성을 개선했다는 것도 실제로 확인하기 전까지 반신반의했다. `node:fs`, `node:crypto`, `node:events`가 플래그 없이 그냥 동작하는 게 인상적이었다.

아직 불만족스러운 점도 있다. Deno의 `--allow-*` 플래그 시스템은 개발 시작 단계에서 마찰이 있다. 어떤 권한이 필요한지 실행해봐야 알게 되는 경우가 있고, 복잡한 앱에서 권한 목록이 길어지면 관리하기 번거롭다.

## 내장 테스트 러너: 빌드 도구 통합의 차이

둘 다 외부 라이브러리 없이 테스트를 실행할 수 있다. 사용 방식이 약간 다르다.

**Bun 테스트**

```typescript
// counter.test.ts
import { expect, test, describe } from "bun:test";

describe("Counter", () => {
  test("increments correctly", () => {
    let count = 0;
    count++;
    expect(count).toBe(1);
  });
  
  test("async works", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
```

```bash
bun test                    # 프로젝트 내 모든 테스트
bun test counter.test.ts    # 특정 파일만
bun test --watch            # 감시 모드
```

`bun:test`는 Jest API와 호환된다. 기존 Jest 테스트를 거의 수정 없이 실행할 수 있는 경우가 많다. [Jest에서 Vitest로 마이그레이션하는 것과 비슷한 맥락으로](/ko/blog/ko/vitest-4-jest-migration-guide-2026), Bun으로 이동할 때도 describe/test/expect 패턴은 그대로다.

**Deno 테스트**

```typescript
// counter_test.ts
import { assertEquals } from "jsr:@std/assert@1";

Deno.test("increments correctly", () => {
  let count = 0;
  count++;
  assertEquals(count, 1);
});

Deno.test("async works", async () => {
  const result = await Promise.resolve(42);
  assertEquals(result, 42);
});
```

```bash
deno test                   # 현재 디렉터리 내 *_test.ts, test_*.ts
deno test counter_test.ts   # 특정 파일만
deno test --watch           # 감시 모드
```

Deno는 Jest 스타일의 `describe/it` 대신 `Deno.test()`를 기본으로 쓴다. JSR의 `@std/assert`를 사용하면 타입 안전한 assertion이 가능하다. 테스트도 Deno의 권한 모델을 따르기 때문에 파일 시스템을 건드리는 테스트는 `--allow-read` 같은 플래그가 필요하다.

나는 Bun의 테스트 러너가 기존 Jest 코드와 호환성이 높아서 마이그레이션 경로가 더 부드럽다고 본다. 새 프로젝트라면 Deno의 `Deno.test` 스타일도 깔끔하지만, 기존 코드베이스를 옮기는 상황이라면 Bun이 유리하다.

## 실제 프로젝트 세팅 비교

구체적인 프로젝트를 새로 시작한다면 어떻게 다른지 비교해본다.

**Bun 프로젝트 초기화**

```bash
mkdir my-api && cd my-api
bun init -y          # package.json, tsconfig.json, index.ts 생성
bun add hono         # 의존성 추가
bun run index.ts     # 실행
```

생성된 `package.json`:

```json
{
  "name": "my-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch index.ts",
    "start": "bun run index.ts"
  },
  "dependencies": {
    "hono": "^4.7.0"
  }
}
```

Node.js에서 옮겨온 개발자라면 익숙한 구조다. CI에서도 `bun install && bun run build`처럼 기존 스크립트가 그대로 동작한다.

**Deno 프로젝트 초기화**

```bash
mkdir my-api && cd my-api
deno init            # main.ts, deno.json, main_test.ts 생성
# 의존성은 import map 또는 deno.json에 관리
```

생성된 `deno.json`:

```json
{
  "tasks": {
    "dev": "deno run --watch --allow-net main.ts",
    "test": "deno test"
  },
  "imports": {
    "hono": "npm:hono@^4.7.0"
  }
}
```

`deno.json`의 `imports` 필드가 패키지 매핑을 담당한다. 별도의 node_modules가 없고 `deno.lock`이 버전을 고정한다. 처음엔 어색하지만 익숙해지면 깔끔하다는 느낌이 있다.

## 배포 환경에서의 차이

로컬 개발 환경에서는 비슷해 보여도 배포 단계에서 차이가 드러난다.

**Docker 이미지 크기**

```dockerfile
# Bun
FROM oven/bun:1.3-alpine
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY . .
CMD ["bun", "run", "index.ts"]
```

```dockerfile
# Deno
FROM denoland/deno:2.8.2
WORKDIR /app
COPY deno.json deno.lock ./
RUN deno cache main.ts
COPY . .
CMD ["deno", "run", "--allow-net", "main.ts"]
```

Bun의 Alpine 기반 이미지는 약 90〜120MB다. Deno 이미지는 공식 이미지 기준 약 100〜150MB다. Deno는 `--allow-*` 플래그를 Dockerfile에도 명시해야 한다는 점에서, 권한 설계를 애플리케이션 수준에서 미리 문서화하는 효과가 있다.

**단일 실행 파일 컴파일**

Deno는 `deno compile`로 단일 바이너리를 만들 수 있다.

```bash
deno compile --allow-net --output server main.ts
./server  # 런타임 없이 실행 가능
```

Bun도 `bun build --compile`으로 같은 기능을 제공한다.

```bash
bun build --compile index.ts --outfile server
./server
```

CLI 도구를 배포할 때 런타임 설치 없이 단일 바이너리를 배포할 수 있다는 건 두 런타임 모두 가진 강점이다.

## 결론

두 런타임 중 하나가 압도적으로 낫다는 결론은 내리기 어렵다. 상황에 따라 다르다는 진부한 말이지만, 이번엔 실제 데이터에서 나온 결론이다.

내 블로그 자동화나 개인 CLI 도구에는 앞으로 Deno를 주로 쓸 것 같다. cold start 성능과 `npm:` 지정자의 설치 불필요함이 스크립트 작업에서 편리하다. 팀 프로젝트나 npm 패키지에 많이 의존하는 서비스라면 Bun의 호환성이 더 실용적이다.

배포 단계에서는 두 런타임 모두 단일 바이너리 컴파일, Docker 지원, Cloudflare Workers 호환을 제공한다. Hono 같은 웹 프레임워크는 어디서나 동작한다.

Node.js를 계속 써야 할 이유는 줄어들고 있다. 어떤 방향으로 가든, 지금 선택할 수 있는 두 대안 모두 2026년 기준으로 프로덕션에서 쓸 만한 수준이다.
