---
title: 'Deno 2 vs Bun 1.3 — 2026 Node.js Alternative Comparison'
description: >-
  Deno 2.8.2 and Bun 1.3.14 benchmarked head to head: startup time, HTTP
  throughput, npm compatibility, and security model, plus which one I actually
  use.
pubDate: '2026-06-04'
heroImage: ../../../assets/blog/deno-2-vs-bun-nodejs-runtime-2026-comparison-hero.png
tags:
  - Deno
  - Bun
  - TypeScript
  - Node.js
  - runtime comparison
relatedPosts:
  - slug: bun-shell-scripting-practical-guide-2026
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
  - slug: node-sqlite-builtin-practical-guide-2026
    score: 0.8
    reason:
      ko: 같은 node.js 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same node.js track.
      ja: 同じnode.jsの流れで併せて読むと役立ちます。
      zh: 在同一 node.js 脉络中可一并阅读。
faq:
  - question: "Is Deno or Bun faster?"
    answer: "It depends on the workload. On cold start Deno is about 3.6x faster (0.067s vs Bun's 0.243s), but after warm-up Bun is roughly 2x faster (0.013s vs Deno's 0.026s). HTTP throughput is essentially a tie: Bun hit 23,794 RPS and Deno 22,594 RPS, about a 5% difference that is not practically meaningful."
  - question: "Which should I use in production, Deno or Bun?"
    answer: "For speeding up an existing Node.js project or a service that relies heavily on npm, Bun is more practical thanks to low migration friction. For a new TypeScript project, CLI tools, or running untrusted third-party code, Deno wins with type checking and a default sandbox. Both are production-ready by 2026 standards."
  - question: "Is migrating from Node.js to Bun or Deno easy?"
    answer: "Bun keeps existing package.json, node_modules, and npm workflows working as-is, so migration cost is very low. Deno 2 also runs node:fs, node:crypto, and node:events through the node: prefix without any flags, a big compatibility improvement. The main friction with Deno is its permission flags (--allow-*) early on."
  - question: "How do the security models of Deno and Bun differ?"
    answer: "Bun works like Node.js with an open model where filesystem, network, and environment variables are accessible by default, so there is nothing to stop malicious third-party code. Deno uses a default sandbox that requires explicit grants like --allow-read and --allow-net, which becomes a real line of defense when running third-party code in CI/CD or on servers."
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

Bun works like Node.js. Filesystem, network, and environment variables are all accessible by default. Convenient for development, but if a third-party package runs malicious code, there is nothing to stop it.

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

I tested all of these, and both Bun and Deno handled them identically. `crypto.createHash("sha256")`, EventEmitter, and `fs.existsSync` all passed. Just like [running Hono.js on Cloudflare Workers](/en/blog/en/hono-typescript-api-2026), Hono works the same on Bun and Deno.

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

`bun:test` is Jest-compatible. Existing Jest test suites often run without changes. For teams [migrating from Jest to Vitest](/en/blog/en/vitest-4-jest-migration-guide-2026), moving to Bun is a similar level of effort. The describe/test/expect API is the same.

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

Deno uses `Deno.test()` rather than Jest-style `describe/it`. Tests also respect the permission model, so a test that touches the filesystem needs `--allow-read`. The `@std/assert` package from JSR provides type-safe assertions.

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

The `imports` field in `deno.json` handles package mapping. No `node_modules`. A `deno.lock` file pins versions. Once you internalize the pattern it feels clean, though there is a learning curve at first.

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

## When to Use Each, and When to Avoid It

A decision rubric is more useful than abstract comparison. Here is how I'd map the measured results to real situations.

**Use Bun when**

- You want to speed up an existing Node.js service with minimal migration cost. Your `package.json` and `node_modules` keep working.
- You have a large Jest test suite. `bun:test` is Jest-compatible, so the move is low-friction.
- Your service depends heavily on npm. If internal libraries or legacy packages live only on npm, Bun is the safe bet.

**Avoid Bun when**

- You run untrusted third-party code. There is no default sandbox, so the file system and network are open.
- You want strict type checking as a CI gate. Bun skips type checks, so you call `tsc` separately.

**Use Deno when**

- You start a new TypeScript project. Type checking, the default sandbox, and no-install `npm:` specifiers all arrive together.
- You build CLI tools or short scripts. Cold start is fast and single-binary distribution is clean. For instance, if you port [a local data tool built on Node.js's built-in SQLite](/en/blog/en/node-sqlite-builtin-practical-guide-2026) to Deno, permission flags let you scope disk access tightly.
- You run unknown third-party packages on a server or in CI/CD. The permission model is a real line of defense.

**Avoid Deno when**

- Your existing codebase leans hard on npm-only packages. Compatibility has improved, but some native addons still cause friction.
- Your team can't absorb the early friction of managing permission flags. The `--allow-*` list grows long in complex apps.

If you're also designing a type-safe data layer, it's worth validating a [Drizzle ORM and TypeScript setup](/en/blog/en/drizzle-orm-typescript-complete-guide-2026) on both runtimes. Drizzle behaves the same on Bun and Deno.

## Sources and Official Docs

The numbers here are my own measurements, but I confirmed the behavior and compatibility claims against each runtime's official documentation.

- [Deno official site](https://deno.com) — runtime overview, JSR, and the permission model
- [Deno Node and npm compatibility docs](https://docs.deno.com/runtime/fundamentals/node/) — the `node:` prefix, `npm:` specifiers, and package.json resolution
- [Deno security and permissions docs](https://docs.deno.com/runtime/fundamentals/security/) — `--allow-*` flags and the secure-by-default sandbox
- [Bun official site](https://bun.sh) and [Bun installation docs](https://bun.sh/docs/installation) — single-executable install and platform requirements
- [Node.js official site](https://nodejs.org) — the baseline runtime this comparison is measured against

## Bottom Line

I cannot make a strong case that one runtime is decisively better. That is a cliché conclusion, but this time it comes from actual measurements.

For my own automation scripts and CLI tools, I will probably lean toward Deno. The cold start performance and the no-install `npm:` specifier are convenient for scripting. For team projects that rely heavily on npm packages, Bun's compatibility is more practical.

Both runtimes support single-binary compilation, Docker, and Hono. The framework layer is largely portable.

The reasons to stay on Node.js keep shrinking. Whichever direction you go, both alternatives are production-ready by 2026 standards.
