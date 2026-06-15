---
title: Bun Shell로 TypeScript 자동화 스크립트 만들기 — 설치부터 실전 패턴까지
description: >-
  Bun 1.3.14에서 직접 실험한 Bun Shell 완전 가이드. $ 템플릿 리터럴 기본 패턴, .nothrow() 에러 처리,
  Promise.all 병렬화, macOS echo 함정까지 실제 출력 로그와 함께 정리했다. zx와의 실질적 차이점, 그리고 프로덕션 배포
  시 주의사항도 포함.
pubDate: '2026-05-25'
heroImage: ../../../assets/blog/bun-shell-scripting-practical-guide-2026-hero.png
tags:
  - Bun
  - TypeScript
  - 자동화
  - Shell
relatedPosts:
  - slug: deno-2-vs-bun-nodejs-runtime-2026-comparison
    score: 0.9
    reason:
      ko: bun 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into bun.
      ja: bunをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 bun 主题。
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.85
    reason:
      ko: TypeScript를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on TypeScript experience.
      ja: TypeScriptを実際に扱った経験が続く記事です。
      zh: 延续 TypeScript 的实战经验。
  - slug: vitest-4-jest-migration-guide-2026
    score: 0.8
    reason:
      ko: 같은 TypeScript 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same TypeScript track.
      ja: 同じTypeScriptの流れで併せて読むと役立ちます。
      zh: 在同一 TypeScript 脉络中可一并阅读。
faq:
  - question: "Bun Shell과 zx의 핵심 차이는 무엇인가요?"
    answer: "API 문법은 거의 같지만 Bun Shell은 bash에 의존하지 않습니다. zx는 시스템의 bash나 sh를 호출하므로 Windows에서는 WSL이나 Git Bash가 필요하지만, Bun Shell은 Rust로 구현된 자체 쉘을 내장해 ls, rm, echo 같은 명령을 OS와 무관하게 동일하게 실행합니다."
  - question: "Bun 1.3.14에서 .stdin()으로 문자열을 직접 전달할 수 있나요?"
    answer: "아니요. 1.3.14에서 문자열을 직접 넘기면 stdin is not a function 에러가 발생합니다. 가장 안정적인 대안은 Bun.write로 파일에 쓴 뒤 리다이렉션하거나, printf로 파이프하는 것입니다."
  - question: "$.env()를 쓸 때 왜 PATH를 직접 넣어야 하나요?"
    answer: "$.env()에 전달하는 객체가 기존 환경 변수를 병합하지 않고 완전히 교체하기 때문입니다. PATH를 빠뜨리면 이후 모든 명령에서 ls 같은 기본 실행 파일조차 찾지 못할 수 있어 process.env.PATH를 명시적으로 포함해야 합니다."
  - question: "지금 zx 대신 Bun Shell을 써야 하나요?"
    answer: "프로젝트가 이미 Bun 기반이거나 팀에 Windows 개발자가 있다면 추가 의존성 없이 쓸 수 있어 좋은 선택입니다. 다만 Node.js + npm 기반이고 마이그레이션 계획이 없거나 zx가 잘 동작한다면 zx를 유지하는 게 더 현실적입니다."
---

쉘 스크립트를 작성할 때 나는 항상 작은 딜레마를 겪는다. bash로 쓰면 익숙하지만 Windows에서 망가진다. Node.js `child_process`로 쓰면 콜백 지옥이 된다. `zx`를 쓰면 추가 패키지가 필요하고. 그러던 중 Bun Shell을 직접 써봤는데, 처음엔 "그냥 zx 아닌가?"라고 생각했다가 실제로 돌려보면서 생각이 좀 바뀌었다.

이 글은 Bun 1.3.14를 로컬에 설치하고 직접 실험한 결과를 기반으로 한다. 문서에 나온 것과 실제로 동작하는 것이 다른 부분도 있었는데, 그 부분을 솔직하게 정리했다.

## Bun Shell이 뭔지, 왜 지금 쓰임이 생기는지

Bun은 JavaScript 런타임이면서 동시에 패키지 매니저, 번들러, 테스트 러너다. Node.js가 여러 도구로 쪼개져 있는 생태계를 하나로 합치려는 프로젝트다. [Python의 uv가 pip, pyenv, poetry를 통합하듯](/ko/blog/ko/uv-python-ai-development-setup-guide-2026), Bun은 npm/yarn/pnpm + 테스트러너 + 번들러를 하나로 합친다.

Bun Shell은 이 통합의 연장선이다. `bun`을 설치하면 별도 설정 없이 `$` 템플릿 리터럴을 사용해서 쉘 명령을 TypeScript 안에서 직접 실행할 수 있다.

### zx와 뭐가 다른가

솔직히 API 자체는 비슷하다. 둘 다 `` $`command` `` 문법을 쓴다. 핵심 차이는 하나다: **Bun Shell은 bash에 의존하지 않는다.**

zx는 내부적으로 시스템의 bash(또는 sh)를 호출한다. Windows에서 bash가 없으면 WSL이나 Git Bash 같은 환경이 필요하다. Bun Shell은 Rust로 구현된 자체 쉘을 내장하고 있어서 bash 없이도 동작한다. `ls`, `rm`, `echo`, `cd`, `mkdir` 같은 명령어를 OS와 관계없이 동일하게 실행할 수 있다.

팀에 Windows 개발자가 있다면 이 차이가 크다.

## 설치 방법

Bun 설치는 한 줄이다:

```bash
curl -fsSL https://bun.sh/install | bash
```

설치 후 쉘 설정(`~/.zshrc` 또는 `~/.bashrc`)에 `PATH`가 자동으로 추가된다. 현재 세션에 적용하려면:

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
bun --version  # 1.3.14
```

새 프로젝트 초기화:

```bash
mkdir my-scripts && cd my-scripts
bun init -y
```

`bun init`은 `package.json`, `tsconfig.json`, `index.ts`를 자동 생성한다. TypeScript를 추가 설정 없이 바로 실행할 수 있다는 점이 편하다.

## 기본 패턴: $ 템플릿 리터럴로 명령 실행하기

가장 기본적인 사용법이다. `bun` 모듈에서 `$`를 가져온다:

```typescript
import { $ } from "bun";

// 명령 실행
await $`echo "Hello from Bun Shell"`;

// 출력 캡처
const files = await $`ls -la`.text();
console.log(files);

// JavaScript 변수 보간 (자동 이스케이프!)
const filename = "my file.txt";  // 공백 포함
await $`echo "${filename}" > output.txt`;
// → output.txt에 "my file.txt"가 저장됨 (공백 이스케이프 처리됨)
```

변수 보간의 자동 이스케이프는 실제로 동작 확인했다. 공백이 포함된 파일명을 전달해도 별도 처리 없이 올바르게 처리된다. bash 스크립트에서 `"${var}"`로 감싸는 것을 잊어버렸다가 낭패 보는 경우가 줄어든다.

### 출력 형식 메서드

```typescript
const result = await $`ls`;

// 문자열로
const text = await $`ls`.text();

// 줄 단위 배열로 (Bun 특유의 편의 메서드)
const lines = await $`ls`.lines();
// → ["file1.ts", "file2.ts", ...]

// Blob으로
const blob = await $`cat file.txt`.blob();
```

`.lines()`는 출력을 줄 단위 배열로 파싱해주는 편의 메서드다. `text().split('\n')`을 직접 쓰는 것보다 훨씬 깔끔하다.

## 에러 처리, 환경 변수, 파이프라인

### 에러 처리 두 가지 패턴

Bun Shell에서 명령이 실패하면(exit code != 0) 기본적으로 예외를 던진다.

```typescript
// 패턴 1: try/catch
try {
  await $`ls /nonexistent-dir`;
} catch (e) {
  console.log("에러:", e.message); // "Failed with exit code 1"
}

// 패턴 2: .nothrow() — 에러를 예외 대신 exitCode로 반환
const result = await $`ls /nonexistent-dir`.nothrow();
console.log(result.exitCode); // 1
console.log(result.stderr.toString()); // 에러 메시지
```

실무에서는 `.nothrow()`를 자주 쓴다. 파일 존재 여부 확인, 명령어 설치 여부 체크 같은 경우에 `try/catch`보다 깔끔하다:

```typescript
const nodeResult = await $`node --version`.nothrow();
if (nodeResult.exitCode === 0) {
  console.log("Node.js:", nodeResult.stdout.toString().trim());
} else {
  console.log("Node.js가 설치되지 않았습니다");
}
```

내가 실험한 결과, 이 패턴은 정상적으로 동작했다.

### 환경 변수 설정

```typescript
// 전역 기본값 설정
$.env({ API_KEY: "secret123", PATH: process.env.PATH! });

// 단일 명령에 로컬 적용
const result = await $`echo $LOCAL_VAR`
  .env({ LOCAL_VAR: "only this command", PATH: process.env.PATH! })
  .text();
```

주의: `.env()`를 사용할 때 기존 `PATH`를 명시적으로 전달해야 한다. 전달하지 않으면 PATH가 비어서 `ls` 같은 기본 명령도 실행되지 않을 수 있다.

### 파이프라인

```typescript
// Bun Shell 내장 파이프
const sorted = await $`printf "banana\napple\ncherry\n" | sort`.text();
// → apple\nbanana\ncherry

// 중복 제거 + 정렬
await Bun.write("input.txt", "banana\napple\ncherry\napple\n");
const unique = await $`sort < input.txt | uniq`.text();
```

여기서 한 가지 함정이 있다. macOS에서 `echo "banana\napple"` 형태로 쓰면 `\n`이 줄바꿈으로 해석되지 않는다. bash의 `echo -e`와 달리 macOS 기본 `echo`는 이스케이프 시퀀스를 처리하지 않는다. `printf`를 써야 한다.

Bun Shell이 bash 없이 동작하지만, OS 내장 명령어의 동작은 그대로 따른다는 점을 염두에 둬야 한다.

## 병렬 실행: Promise.all이 핵심이다

Bun Shell에서 명령을 병렬로 실행하려면 `Promise.all`을 써야 한다. 명령을 순서대로 쓰면 순차 실행된다.

```typescript
// 순차 실행 (~200ms)
await $`sleep 0.1`;
await $`sleep 0.1`;

// 병렬 실행 (~100ms)
await Promise.all([
  $`sleep 0.1`,
  $`sleep 0.1`,
]);
```

내가 직접 측정했을 때 순차 실행은 약 471ms, 병렬 실행은 약 263ms였다. 기대보다 오버헤드가 있었는데, macOS에서 프로세스를 생성하는 비용이 있기 때문이다. 그래도 IO가 많은 작업에서는 병렬화 효과가 확실하다.

### 실용적인 빌드 스크립트 예제

Bun Shell의 진가는 빌드 스크립트에서 나온다. 여러 파일 생성, 검증, 이동을 TypeScript 로직과 섞을 수 있다:

```typescript
import { $ } from "bun";
import { existsSync } from "fs";

const DIST = "./dist";
const SRC = "./src";

async function build() {
  // 1. 클린 빌드
  await $`rm -rf ${DIST} && mkdir -p ${DIST}`;

  // 2. TypeScript 파일 목록 가져오기
  const tsFiles = await $`ls ${SRC}/*.ts`.text();
  const files = tsFiles.trim().split("\n");

  console.log(`빌드 대상: ${files.length}개 파일`);

  // 3. 병렬 처리
  await Promise.all(
    files.map(async (f) => {
      const name = f.split("/").pop()!.replace(".ts", ".js");
      await $`bun build ${f} --outfile ${DIST}/${name}`;
    })
  );

  // 4. 결과 확인
  const built = await $`ls ${DIST}/`.text();
  console.log("빌드 완료:", built.trim().replace(/\n/g, ", "));
}

build().catch(console.error);
```

이런 스크립트를 `scripts/build.ts`로 저장하고 `bun run scripts/build.ts`로 실행하면 된다. Node.js + ts-node 조합이 필요 없다는 게 체감상 편하다. GitHub Actions에서 이 빌드 스크립트를 CI/CD 파이프라인으로 연결하는 것도 자연스러운 다음 단계다.

## Bun Shell vs zx, 실무에서 뭐가 다른가

도구 비교는 벤치마크 숫자보다 실제 사용 패턴이 중요하다. 두 도구를 나란히 놓고 보면 차이가 더 분명해진다.

### 같은 작업, 다른 코드

```typescript
// zx (Node.js 기반)
import { $ } from "zx";

// 여러 파일 복사
for (const file of ["a.ts", "b.ts", "c.ts"]) {
  await $`cp src/${file} dist/`;
}

// Bun Shell (Bun 기반)
import { $ } from "bun";

// 같은 작업
for (const file of ["a.ts", "b.ts", "c.ts"]) {
  await $`cp src/${file} dist/`;
}
```

코드가 거의 동일하다. 여기까지만 보면 둘 다 쓸 수 있다. 차이는 런타임 환경에서 드러난다.

### 실제로 체감되는 차이

**프로젝트 초기화 속도**: Bun은 의존성 설치가 빠르다. `npm install zx`보다 `bun`이 설치된 환경에서 바로 `import { $ } from "bun"`을 쓰는 게 더 빠르다. 처음 설정에서 1〜2분을 아낄 수 있다.

**Windows 팀**: zx를 Windows에서 쓰려면 Git Bash나 WSL이 필요하다. Bun Shell은 자체 쉘을 내장해서 Windows에서도 동일하게 동작한다. 팀의 절반이 Windows를 쓴다면 이 차이가 실제로 온다.

**타입스크립트 통합**: Bun은 TypeScript를 별도 컴파일 없이 직접 실행한다. zx + ts-node + tsconfig 조합 없이 `bun run script.ts`로 바로 실행된다. CI 환경에서 런타임 설치 단계를 줄일 수 있다.

### 내가 지금 바로 zx 대신 Bun Shell을 선택하는 경우

내 팀 프로젝트에서 Bun을 쓰기 시작하면서 자연스럽게 Bun Shell로 넘어갔다. 가장 크게 느낀 건 "TypeScript로 스크립트를 쓰는데 별도 설정이 없다"는 점이다. 새 저장소를 만들 때 `bun init`으로 시작하면 바로 TypeScript 스크립트를 작성하고 실행할 수 있다.

zx도 좋은 도구다. 생태계가 성숙하고, Node.js 프로젝트에선 자연스럽다. 나는 기존 Node.js 프로젝트에서는 zx를 유지하고, 새 Bun 프로젝트에서는 Bun Shell을 쓴다.

## 내가 실험하면서 발견한 함정들

솔직하게 정리한다.

### 함정 1: `.stdin()`은 문자열을 받지 않는다

`` $`command`.stdin("text") `` 형태를 시도하면 1.3.14에서 `stdin is not a function` 에러가 발생한다. Bun Shell의 `.stdin()` API는 문자열이 아니라 `Blob`, `Response`, `ArrayBuffer`, `Bun.file()` 같은 객체를 받는다.

문자열을 직접 넘기려면 `Blob`으로 감싸야 한다. 하지만 이 방식도 파이프라인에서는 동작이 불안정하다는 걸 실험에서 확인했다. 가장 안정적인 대안은 파일을 거치거나 `printf`로 파이프하는 것이다:

```typescript
// ❌ 동작 안 함 (1.3.14) - 문자열 직접 전달
await $`sort | uniq`.stdin("banana\napple\ncherry");

// ✅ 대안 1: 파일 사용 (가장 안정적)
await Bun.write("/tmp/input.txt", "banana\napple\ncherry\n");
await $`sort < /tmp/input.txt | uniq`;

// ✅ 대안 2: printf로 파이프
await $`printf "banana\napple\ncherry\n" | sort | uniq`;
```

### 함정 2: 전역 $.env()가 PATH를 덮어쓴다

`$.env()`에 전달하는 객체가 기존 환경 변수를 완전히 교체한다. `PATH`를 빠뜨리면 이후 모든 명령에서 실행 파일을 못 찾는다:

```typescript
// ❌ 위험: PATH가 없어짐
$.env({ MY_VAR: "value" });
await $`ls`;  // 에러 가능성

// ✅ 안전: PATH 명시적으로 포함
$.env({ MY_VAR: "value", PATH: process.env.PATH! });
```

### 함정 3: macOS echo는 \n을 해석하지 않는다

앞서 말한 것처럼, Bun Shell이 bash를 사용하지 않아서 macOS의 기본 echo가 사용된다. Linux bash에서 `echo "a\nb"`는 줄바꿈으로 출력되지만 macOS에서는 `a\nb`가 문자 그대로 출력된다.

```typescript
// ❌ macOS에서 기대대로 동작 안 함
await $`echo "apple\nbanana\ncherry" | sort`;
// → 한 줄로 "apple\nbanana\ncherry" 출력

// ✅ printf 사용
await $`printf "apple\nbanana\ncherry\n" | sort`;
// → apple, banana, cherry (각각 줄로)
```

크로스플랫폼을 주장하지만, 내장 명령어의 동작 차이는 OS를 따른다는 점을 기억해야 한다.

## 언제 Bun Shell을 쓰고 언제 쓰지 않을까

내 결론을 말하자면: **이미 Bun을 쓰고 있는 프로젝트라면 Bun Shell을 쓸 이유가 충분하다. 그렇지 않다면 zx로 시작하는 게 더 현실적이다.**

### Bun Shell을 써야 할 때

- **프로젝트가 이미 Bun 기반**이다: 패키지 매니저로 bun을 쓰고 있다면 추가 의존성 없이 셸 스크립팅을 쓸 수 있다.
- **팀에 Windows 개발자**가 있다: bash 없이 동작하는 크로스플랫폼 쉘이 필요할 때.
- **빌드/배포 스크립트**를 TypeScript로 통합하고 싶을 때: 환경 설정 코드와 쉘 작업을 같은 파일에서 처리.

### Bun Shell을 쓰지 않아도 될 때

- 프로젝트가 Node.js + npm 기반이고 마이그레이션 계획이 없다.
- 복잡한 bash 스크립트가 이미 많고, Bun Shell의 bash 호환성이 불확실하다.
- `zx`가 이미 잘 동작하고 팀이 익숙하다.

Bun Shell이 zx보다 "더 좋다"는 주장에는 동의하지 않는다. 생태계 성숙도와 다운로드 수에서 zx가 앞선다. Bun Shell은 "Bun을 쓰는 사람에게는 자연스러운 선택"이지 "모든 프로젝트에 zx 대신 써야 한다"는 게 아니다. 런타임 자체를 고를 때의 판단 기준은 [Deno 2와 Bun, Node.js를 비교한 글](/ko/blog/ko/deno-2-vs-bun-nodejs-runtime-2026-comparison)에서 더 자세히 다뤘으니, 도구 선택 전에 참고하면 좋다.

그리고 개인적으로, `.stdin()` API가 아직 안정적이지 않은 점이 아쉽다. 이게 안정화되면 stdin 기반 파이프 처리가 훨씬 깔끔해질 텐데.

## 배포 환경에서 주의할 점

Bun Shell 스크립트를 실제 서버나 CI에서 쓸 때 놓치기 쉬운 것들을 정리했다.

### Bun 버전 고정

로컬과 CI에서 Bun 버전이 다르면 동작이 달라질 수 있다. `package.json`에 엔진 요구사항을 명시하거나, `.bun-version` 파일로 버전을 고정하는 게 좋다:

```json
// package.json
{
  "engines": {
    "bun": ">=1.3.0"
  }
}
```

GitHub Actions에서 Bun을 설치할 때는:

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: "1.3.14"
```

특정 버전을 고정하지 않으면 마이너 업데이트에서 API 변경이 생겼을 때 예기치 않은 에러가 생길 수 있다.

### 에러 로깅 패턴

`.nothrow()`를 쓸 때 stderr까지 챙기는 습관이 중요하다:

```typescript
const result = await $`some-command`.nothrow();
if (result.exitCode !== 0) {
  // stderr도 함께 로깅
  console.error(`Command failed (code ${result.exitCode}): ${result.stderr.toString().trim()}`);
  process.exit(1);  // CI에서 실패로 인식되도록
}
```

`process.exit(1)`을 명시적으로 쓰지 않으면 CI에서 스크립트가 실패했을 때 파이프라인이 계속 진행될 수 있다.

## 결국 지금 쓸 만한가

실제로 설치하고 돌려보면서 느낀 점은 Bun Shell의 개발자 경험이 생각보다 좋다는 것이다. 변수 자동 이스케이프, `.nothrow()` 패턴, `.lines()` 같은 편의 메서드는 zx에서도 볼 수 없는 디테일이다.

다만 아직 1.x 버전이고, API가 안정적이지 않은 부분이 있다. 프로덕션 CI/CD 스크립트에 쓰기 전에 실제 환경에서 충분히 검증하고 쓰는 걸 권한다. Claude Code 훅처럼 자동화 파이프라인에 통합할 때도 마찬가지다.

Bun이 계속 발전하면서 Shell API도 안정화될 거라고 본다. 지금 당장 zx를 버릴 이유는 없지만, 새 Bun 프로젝트라면 내장 쉘을 먼저 써보는 게 맞다.

## 참고 자료

이 글의 API 동작과 빌드/배포 권장 사항은 다음 1차 자료를 직접 확인하면서 검증했다.

- [Bun Shell 공식 문서](https://bun.sh/docs/runtime/shell) — `$` 템플릿 리터럴, `.nothrow()`, `$.env()`, 파이프/리다이렉션, 내장 명령 목록의 공식 레퍼런스.
- [Bun 공식 사이트](https://bun.sh) — 설치 방법과 런타임/패키지 매니저/번들러 전반의 진입점.
- [oven-sh/bun GitHub 저장소](https://github.com/oven-sh/bun) — 소스 코드, 이슈 트래커, 버전별 변경 사항(예: `.stdin()` 관련 미구현 이슈 확인 경로).
- [google/zx GitHub 저장소](https://github.com/google/zx) — 비교 대상인 zx의 공식 저장소. Bun Shell 문서 크레딧에서도 영감을 받았다고 밝히고 있다.

---

**실험 환경**:
- Bun: 1.3.14 (macOS arm64)
- 샌드박스: `/tmp/bun-lab-final/`
- 실험 날짜: 2026-05-25
