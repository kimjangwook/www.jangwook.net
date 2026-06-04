---
title: 'Deno 2 vs Bun 1.3 — Node.js Runtime Alternatives Compared in 2026: TypeScript, Speed, and Security'
description: 'I installed both Deno 2.8.2 and Bun 1.3.14 and ran real benchmarks — startup time, HTTP throughput, npm compatibility, and security model. Here is which one I would actually use and why.'
pubDate: '2026-06-04'
heroImage: '../../../assets/blog/deno-2-vs-bun-nodejs-runtime-2026-comparison-hero.png'
tags: ['Deno', 'Bun', 'TypeScript', 'Node.js', 'runtime comparison']
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

By mid-2026, the JavaScript runtime choices have narrowed to three: Node.js, Bun, and Deno. Honestly, the reasons to stick with Node.js are shrinking. The real question is whether Bun or Deno fits your situation.

I had been watching both from a distance. I knew Bun was "fast" and that Deno 2 had made big strides in Node.js compatibility. But until I ran them on my own machine, I did not have a concrete basis for choosing. So I set up a temporary sandbox, installed Deno 2.8.2 and Bun 1.3.14, and ran actual measurements.

## What Each Runtime Is Actually Trying to Do

**Bun** aims to take the Node.js ecosystem and make it dramatically faster. Existing `package.json`, `node_modules`, and npm workflows work as-is. Migration cost is low.

**Deno 2** is a runtime rebuilt from scratch. It proposes new conventions: a permission-based security model, URL-based imports, the `npm:` specifier, and JSR (JavaScript Registry). It achieved full backward compatibility with Node.js in Deno 2, but the underlying philosophy is different.

Two tools running the same TypeScript code, but they come from completely different directions.

## Installation

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
bun --version  # 1.3.14

# Install Deno
curl -fsSL https://deno.land/install.sh | sh
deno --version  # 2.8.2 (stable, aarch64-apple-darwin), TypeScript 6.0.3
```

Both install as a single binary. `~/.bun/bin/bun` bundles runtime, package manager, bundler, and test runner. Deno gives you `~/.deno/bin/deno`. The structure looks similar, but Bun sticks with node_modules and Deno defaults to URL-based modules.

## Startup Time: Bun Is Faster, But Not Always

I tested with a simple TypeScript file that sums a 100,000-element array.

```
# Cold start (first run)
Bun:   0.243s
Deno:  0.067s

# Warm (average of runs 2–5)
Bun:   0.013s
Deno:  0.026s
```

This surprised me. Bun is not always faster. On the first run, Deno is about 3.6x faster. Bun's slow cold start is likely due to JavaScriptCore's JIT compiler initializing. After warm-up, Bun runs at about half Deno's latency.

For long-running servers, Bun's warm performance has the edge. For CLI tools or short scripts, Deno feels snappier.

## HTTP Throughput: Essentially a Tie

I measured directly with Apache Bench (n=3000, c=30, 127.0.0.1).

```
Bun Serve API:   23,794 RPS  (0.126s, 0 failures)
Deno.serve API:  22,594 RPS  (0.133s, 0 failures)
```

About 5% difference. Not practically meaningful. Both are substantially faster than Node.js's built-in HTTP module, and in real applications the bottleneck is the network or business logic, not the runtime.

<strong>I would not pick a runtime based on HTTP throughput alone.</strong> These numbers just confirm that both are fast enough.

## npm Package Compatibility: The Approaches Differ

This is where things are most meaningfully different.

**Bun**: Traditional npm workflow

```bash
bun add zod             # 91ms, creates node_modules
bun add lodash @types/lodash  # 651ms, installs 35 packages
```

`bun add` is a faster npm-compatible package manager. It uses node_modules directly, so migrating existing projects requires almost no configuration changes.

**Deno**: `npm:` specifier

```typescript
// No install needed — import directly
import { z } from "npm:zod@3";
import _ from "npm:lodash@4";
```

With the `npm:` specifier, there is no separate install step. On first run Deno downloads to its global cache, and subsequent runs work offline. Not having node_modules feels odd at first, but cloning a project and running it immediately without any install step is genuinely nice.

When I wrote the [Bun Shell scripting guide](/en/blog/en/bun-shell-scripting-practical-guide-2026), Bun's npm compatibility made it easy to pull in existing utility libraries without any friction. Deno's `npm:` approach works better for script-level experiments and greenfield projects.

## Security Model: This Is the Real Difference

This is the part where I realized I had been undervaluing Deno.

**Deno: Default sandbox**

```bash
# Try to read a file without permission
$ deno run deno-security.ts
Permission denied: Requires read access to "/etc/hosts"

# Explicitly grant permission
$ deno run --allow-read=/etc/hosts --allow-net=api.github.com deno-security.ts
File read success: ## Host Database ...
Network success: 200
```

**Bun: Open model**

```bash
$ bun run bun-security.ts
File read (Bun, no restriction): ## Host Database ...
```

Bun works like Node.js — filesystem, network, and environment variables are accessible by default. Convenient for development, but if a third-party package runs malicious code, there is nothing to stop it.

Deno requires explicit permission grants: `--allow-read`, `--allow-write`, `--allow-net`, `--allow-env`, `--allow-run`. In CI/CD or server environments where you run third-party code, Deno's sandbox is a real line of defense.

To be honest, Deno's permission flags have friction at the start. You hit errors when you forget `--allow-net` with fetch and learn through trial. That is a real cost for developers coming from Node.js.

## Node.js Compatibility: Both Work Now

In the Deno 1.x era, Node.js API compatibility was a significant gap. Deno 2 changed that.

```typescript
// Standard modules via node: prefix
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
```

I tested all of these, and both Bun and Deno handled them identically. `crypto.createHash("sha256")`, EventEmitter, `fs.existsSync` — all pass. Just like [running Hono.js on Cloudflare Workers](/en/blog/en/hono-typescript-api-2026), Hono works the same on Bun and Deno.

## TypeScript Support: The Version Gap Matters

```
Bun 1.3.14:   TypeScript (Babel-based transpiler)
Deno 2.8.2:   TypeScript 6.0.3 (V8 14.9.207.2)
```

Both execute TypeScript without a separate compilation step, but the approaches differ.

Bun does not perform type checking. It transpiles TypeScript to JavaScript and runs it. This is one reason it is fast.

Deno uses TypeScript 6.0.3 and supports full type validation with `deno check`. If you want type safety enforced in CI, Deno gives you a cleaner answer.

```bash
# Deno: type-checked execution
deno check main.ts    # type errors only
deno run main.ts      # fast run, no type checking

# Bun: transpile-only
bun run main.ts       # always skips type checking
bun typecheck         # calls tsc separately
```

## Package Ecosystem: JSR vs npm

Deno 2 also has the `jsr:` specifier. JSR (JavaScript Registry) is a registry built by the Deno team with native TypeScript support and ESM-only packages.

```typescript
// Using JSR packages
import { assertEquals } from "jsr:@std/assert@1";
import { serve } from "jsr:@hono/hono@4/deno";
```

JSR package quality is high, but the number of packages is far smaller than npm. As of 2026, JSR is growing but most production libraries are still on npm.

Bun uses npm directly, so this is not an issue.

## My Decision Framework

The measured data, summarized:

| | Bun 1.3.14 | Deno 2.8.2 |
|---|---|---|
| Cold start | 0.243s (slow) | 0.067s (fast) |
| Warm start | 0.013s (fast) | 0.026s (moderate) |
| HTTP RPS | 23,795 | 22,594 |
| Package install | bun add 91ms | npm: specifier (no install) |
| Security | Open by default | Sandboxed by default |
| Node.js compat | Very high | Much improved in Deno 2 |
| TypeScript | Transpile only | Type checking (TS 6.0.3) |
| Package ecosystem | Full npm | npm + JSR |

**Speeding up an existing Node.js project**: Bun. Low migration friction, full npm support.

**New TypeScript project**: Deno. Type safety, the security model, and the no-install `npm:` specifier make for a clean setup.

**CLI tools or short scripts**: Deno. Fast cold start and easy single-file deployment.

**Cloudflare Workers / Edge**: Both work great with Hono. Cloudflare has its own runtime, so the choice matters less there.

**Running untrusted third-party code**: Deno. Running unknown packages without a sandbox is a real risk.

## What I Was Wrong About

The "Bun is X times faster" marketing shows up everywhere. In practice, it is 5% faster on HTTP throughput. On cold start, Deno is faster. The real differences are the security model, how TypeScript type checking works, and the package management philosophy.

I was also skeptical about Deno 2's Node.js compatibility until I ran it myself. `node:fs`, `node:crypto`, and `node:events` working without any flags was genuinely impressive.

There are still things that bother me about Deno. The `--allow-*` flag system causes friction early on. You sometimes only discover which permissions you need by running and hitting errors. On complex apps, managing a long permission list gets tedious.

## Built-in Test Runners: A Genuine Difference

Both runtimes ship a test runner out of the box. No Jest or Mocha required.

**Bun test**

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
bun test                     # all tests in project
bun test counter.test.ts     # specific file
bun test --watch             # watch mode
```

`bun:test` is Jest-compatible. Existing Jest test suites often run without changes. For teams [migrating from Jest to Vitest](/en/blog/en/vitest-4-jest-migration-guide-2026), moving to Bun is a similar level of effort — the describe/test/expect API is the same.

**Deno test**

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
deno test                    # auto-discovers *_test.ts, test_*.ts
deno test counter_test.ts    # specific file
deno test --watch            # watch mode
```

Deno uses `Deno.test()` rather than Jest-style `describe/it`. Tests also respect the permission model — tests touching the filesystem need `--allow-read`. The `@std/assert` package from JSR provides type-safe assertions.

Bun's test runner wins on migration convenience from Jest. Deno's is cleaner for greenfield TypeScript projects.

## Setting Up a Real Project

Here is what actually happens when you start a new project from scratch.

**Bun project init**

```bash
mkdir my-api && cd my-api
bun init -y          # creates package.json, tsconfig.json, index.ts
bun add hono         # add a dependency
bun run index.ts     # run it
```

The generated `package.json` looks like any Node.js project. CI works with `bun install && bun run build`. Familiar.

**Deno project init**

```bash
mkdir my-api && cd my-api
deno init            # creates main.ts, deno.json, main_test.ts
```

Generated `deno.json`:

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

The `imports` field in `deno.json` handles package mapping. No `node_modules`. A `deno.lock` file pins versions. Once you internalize the pattern, it is clean — but there is a learning curve.

## Deployment Differences

**Single binary compilation**

Both runtimes support compiling to a self-contained binary — no runtime required on the target machine.

```bash
# Deno
deno compile --allow-net --output server main.ts
./server

# Bun
bun build --compile index.ts --outfile server
./server
```

This is genuinely useful for distributing CLI tools. The `--allow-*` flags in Deno's compile command also document what the binary needs, which is a nice side effect.

**Docker**

Both have official Docker images and are straightforward to containerize. Deno's image requires that you include permission flags in the `CMD` directive, which forces you to make permission decisions explicit at the infrastructure layer.

## Bottom Line

I cannot make a strong case that one runtime is decisively better. That is a cliché conclusion, but this time it comes from actual measurements.

For my own automation scripts and CLI tools, I will probably lean toward Deno. The cold start performance and the no-install `npm:` specifier are convenient for scripting. For team projects that rely heavily on npm packages, Bun's compatibility is more practical.

Both runtimes support single-binary compilation, Docker, and Hono. The framework layer is largely portable.

The reasons to stay on Node.js keep shrinking. Whichever direction you go, both alternatives are production-ready by 2026 standards.
