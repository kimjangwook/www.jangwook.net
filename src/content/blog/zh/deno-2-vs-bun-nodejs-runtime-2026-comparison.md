---
title: 'Deno 2 vs Bun 1.3 — 2026年Node.js替代运行时实战对比：TypeScript、速度与安全'
description: '我实际安装了Deno 2.8.2和Bun 1.3.14，测量了启动时间、HTTP吞吐量、npm兼容性和安全模型。这是我会在哪种场景下选择哪个的具体结论。'
pubDate: '2026-06-04'
heroImage: '../../../assets/blog/deno-2-vs-bun-nodejs-runtime-2026-comparison-hero.png'
tags: ['Deno', 'Bun', 'TypeScript', 'Node.js', '运行时对比']
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

2026年中期，JavaScript运行时的选择实际上缩减到了三个：Node.js、Bun、Deno。说实话，坚持使用Node.js的理由越来越少了。真正的问题是在Bun和Deno之间做选择。

我一直在观望这两个运行时。我知道Bun"很快"，也听说Deno 2大幅改善了Node.js兼容性。但在我自己的机器上实际运行之前，选择标准并不明确。这次我在临时沙箱中安装了Deno 2.8.2和Bun 1.3.14，提取了实际数据。

## 两个运行时，一句话总结

**Bun**的目标是将Node.js生态系统原封不动地带过来，同时大幅提升速度。现有的`package.json`、`node_modules`和npm工作流程都能直接使用。迁移成本低。

**Deno 2**是从头开始重新设计的运行时。它提出了新的惯例：基于权限的安全模型、URL导入、`npm:`指定符、JSR（JavaScript Registry）。Deno 2实现了与Node.js的完整后向兼容，但设计哲学不同。

两个工具运行相同的TypeScript代码，但它们来自完全不同的方向。

## 安装

```bash
# 安装Bun
curl -fsSL https://bun.sh/install | bash
bun --version  # 1.3.14

# 安装Deno
curl -fsSL https://deno.land/install.sh | sh
deno --version  # 2.8.2 (stable, aarch64-apple-darwin), TypeScript 6.0.3
```

两者都是单二进制文件安装。`~/.bun/bin/bun`集成了运行时、包管理器、打包器和测试运行器。Deno给你`~/.deno/bin/deno`。结构看起来相似，但Bun直接支持node_modules方式，而Deno默认使用基于URL的模块系统。

## 启动时间：Bun更快，但并非总是如此

我用一个对100,000个数字数组求和的简单TypeScript文件进行了测试。

```
# 冷启动（首次运行）
Bun:   0.243s
Deno:  0.067s

# 热启动（第2〜5次平均）
Bun:   0.013s
Deno:  0.026s
```

这个结果出乎意料。Bun并非总是更快。首次运行时，Deno快约3.6倍。Bun首次运行慢的原因可能是JavaScriptCore基于JIT编译器的初始化开销。热启动后，Bun约快2倍。

对于长期运行的服务器，Bun的热启动性能更有优势。但对于CLI工具或短脚本，Deno的响应性更好。

## HTTP吞吐量：基本相当

我用Apache Bench直接测量（n=3000, c=30, 127.0.0.1）。

```
Bun Serve API:   23,794 RPS  (0.126s)
Deno.serve API:  22,594 RPS  (0.133s)
```

差距约5%。实际项目中这个差距几乎没有意义。两个运行时都比Node.js内置HTTP模块快得多，实际瓶颈来自网络或业务逻辑，而非运行时本身。

<strong>我不会仅凭HTTP性能来选择运行时。</strong>这些数字只是确认"两者都足够快"。

## npm包兼容性：方式不同

这是实质差异最大的地方。

**Bun**：传统npm方式

```bash
bun add zod             # 91ms，创建node_modules
bun add lodash @types/lodash  # 651ms，安装35个包
```

`bun add`是一个比npm更快的包管理器。直接使用node_modules结构，迁移现有项目几乎不需要额外配置。

**Deno**：`npm:`指定符方式

```typescript
// 无需安装，直接导入
import { z } from "npm:zod@3";
import _ from "npm:lodash@4";
```

使用`npm:`指定符不需要单独安装步骤。首次运行时下载到Deno的全局缓存，之后可离线使用。没有node_modules一开始会觉得陌生，但克隆项目后无需任何安装步骤就能运行的优势很大。

当我写[Bun Shell脚本指南](/zh/blog/zh/bun-shell-scripting-practical-guide-2026)时，Bun的npm兼容性让我能直接使用现有的实用工具库，没有任何障碍。Deno的`npm:`方式在脚本实验和新项目中更方便。

## 安全模型：这才是真正的区别

这是让我意识到自己低估了Deno的地方。

**Deno：默认沙箱**

```bash
# 尝试在没有权限的情况下读取文件
$ deno run deno-security.ts
Permission denied: Requires read access to "/etc/hosts"

# 明确授予权限
$ deno run --allow-read=/etc/hosts --allow-net=api.github.com deno-security.ts
File read success: ## Host Database ...
Network success: 200
```

**Bun：开放模型**

```bash
$ bun run bun-security.ts
File read (Bun, no restriction): ## Host Database ...
```

Bun像Node.js一样，默认可以访问文件系统、网络和环境变量。开发便利性高，但如果第三方包运行恶意代码，没有任何阻止手段。

Deno需要明确授予权限：`--allow-read`、`--allow-write`、`--allow-net`、`--allow-env`、`--allow-run`。在CI/CD或服务器环境中运行第三方代码时，Deno的沙箱是实质性的防线。

说实话，Deno的权限标志在开始时会有些麻烦。忘记`--allow-net`而使用fetch时遇到错误是常有的事，多踩几次坑才会习惯。对于来自Node.js的开发者，初期确实存在摩擦。

## Node.js兼容性：现在两者都支持

在Deno 1.x时代，Node.js API兼容性是重大弱点。Deno 2改变了这一状况。

```typescript
// 通过node:前缀使用标准模块
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
```

我直接测试了这段代码，Bun和Deno都能正常运行。`crypto.createHash("sha256")`、EventEmitter、`fs.existsSync`全部通过。就像[在Cloudflare Workers上运行Hono.js](/zh/blog/zh/hono-typescript-api-2026)一样，Hono在Bun和Deno上都能正常工作。

## TypeScript支持：版本差异值得关注

```
Bun 1.3.14:   TypeScript（基于Babel的转译器）
Deno 2.8.2:   TypeScript 6.0.3（V8 14.9.207.2）
```

两者都无需单独编译步骤就能运行TypeScript，但方式不同。

Bun不进行类型检查。只是将TypeScript转换为JavaScript后执行，这是其速度快的原因之一。

Deno使用TypeScript 6.0.3，支持通过`deno check`命令进行完整的类型验证。如果需要在CI中确保类型安全，Deno提供了更清晰的答案。

```bash
# Deno：带类型检查的执行
deno check main.ts    # 只检查类型错误
deno run main.ts      # 不检查类型，快速执行

# Bun：仅转译
bun run main.ts       # 始终跳过类型检查
bun typecheck         # 单独调用tsc
```

## 包生态系统：JSR vs npm

Deno 2还有`jsr:`指定符。JSR（JavaScript Registry）是Deno团队创建的新包注册中心，原生支持TypeScript，仅支持ESM。

```typescript
// 使用JSR包
import { assertEquals } from "jsr:@std/assert@1";
import { serve } from "jsr:@hono/hono@4/deno";
```

个人认为JSR上发布的包质量很高，但与npm相比包的数量还很少。截至2026年，JSR的生态系统还在成长，大多数可立即使用的库仍然在npm上。

Bun直接使用npm生态系统，因此不存在这个问题。

## 我的选择标准

将测量数据整理如下：

| 项目 | Bun 1.3.14 | Deno 2.8.2 |
|------|-----------|-----------|
| 冷启动 | 0.243s（慢） | 0.067s（快） |
| 热启动 | 0.013s（快） | 0.026s（中等） |
| HTTP RPS | 23,795 | 22,594 |
| 包安装 | bun add 91ms | npm:指定符（无需安装） |
| 安全模型 | 开放模型 | 默认沙箱 |
| Node.js兼容性 | 非常高 | Deno 2大幅改善 |
| TypeScript | 仅转译 | 支持类型检查（TS 6.0.3） |
| 包生态系统 | 完整npm | npm + JSR |

**加速现有Node.js项目**：Bun。迁移摩擦小，完整的npm支持。

**新的TypeScript项目**：Deno。类型安全、安全模型、无需安装的`npm:`指定符组合很简洁。

**CLI工具或短脚本**：Deno。冷启动快，单文件部署方便。

**Cloudflare Workers / Edge**：两者都与Hono配合良好。Cloudflare有自己的运行时，所以这里的差别不大。

**运行第三方代码**：Deno。在没有沙箱的环境中运行未知包存在真实风险。

## 我之前的误解

"Bun快X倍"的营销信息到处都是。实际上HTTP吞吐量只差5%。冷启动反而Deno更快。真正的差异在于安全模型、TypeScript类型检查方式和包管理哲学，而不是速度。

我对Deno 2 Node.js兼容性的改善也是在实际验证之前半信半疑。`node:fs`、`node:crypto`、`node:events`不需要任何标志就能正常工作，这一点确实令人印象深刻。

还有一些让我不满意的地方。Deno的`--allow-*`标志系统在开发初期会有摩擦。有时只有运行后才知道需要哪些权限，复杂应用的权限列表变长后管理也很繁琐。

## 内置测试运行器：真正的差异

两个运行时都内置了测试运行器，不需要Jest或Mocha。

**Bun测试**

```typescript
// counter.test.ts
import { expect, test, describe } from "bun:test";

describe("Counter", () => {
  test("正确递增", () => {
    let count = 0;
    count++;
    expect(count).toBe(1);
  });
  
  test("异步也能工作", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
```

```bash
bun test                     # 项目中的所有测试
bun test counter.test.ts     # 特定文件
bun test --watch             # 监视模式
```

`bun:test`与Jest兼容。现有Jest测试往往无需修改即可运行。类似于[从Jest迁移到Vitest](/zh/blog/zh/vitest-4-jest-migration-guide-2026)，迁移到Bun时describe/test/expect API是相同的。

**Deno测试**

```typescript
// counter_test.ts
import { assertEquals } from "jsr:@std/assert@1";

Deno.test("正确递增", () => {
  let count = 0;
  count++;
  assertEquals(count, 1);
});

Deno.test("异步也能工作", async () => {
  const result = await Promise.resolve(42);
  assertEquals(result, 42);
});
```

```bash
deno test                    # 自动发现*_test.ts, test_*.ts
deno test counter_test.ts    # 特定文件
deno test --watch            # 监视模式
```

Deno以`Deno.test()`为基础。测试也遵循权限模型——访问文件系统的测试需要`--allow-read`。JSR的`@std/assert`提供类型安全的断言。

从Jest迁移的话，Bun的高兼容性占优势。新项目的话，Deno的风格也很简洁。

## 实际项目搭建对比

从头开始一个新项目时，具体有什么不同。

**Bun项目初始化**

```bash
mkdir my-api && cd my-api
bun init -y          # 生成package.json、tsconfig.json、index.ts
bun add hono         # 添加依赖
bun run index.ts     # 运行
```

生成的`package.json`和普通Node.js项目一样。CI中也可以用`bun install && bun run build`这样的现有脚本。

**Deno项目初始化**

```bash
mkdir my-api && cd my-api
deno init            # 生成main.ts、deno.json、main_test.ts
```

生成的`deno.json`:

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

`deno.json`的`imports`字段负责包映射。没有node_modules，`deno.lock`固定版本。需要一些时间来适应，但理解后会觉得很整洁。

## 部署环境的差异

**单一可执行文件编译**

两者都可以编译为不需要运行时的单一二进制文件。

```bash
# Deno
deno compile --allow-net --output server main.ts
./server

# Bun
bun build --compile index.ts --outfile server
./server
```

对于分发CLI工具非常方便。Deno编译时指定`--allow-*`标志，同时也起到文档化二进制需求的作用。

**Docker**

两者都有官方Docker镜像，容器化都很简单。Deno需要在`CMD`中包含权限标志，这迫使你在基础设施层面明确权限设计。

## 结论

很难得出其中一个运行时明显更好的结论。"情况不同"这个陈腐的答案，这次确实来自实际数据。

对于我自己的自动化脚本和个人CLI工具，今后可能主要使用Deno。冷启动性能和`npm:`指定符的无安装特性在脚本工作中很方便。对于依赖大量npm包的团队项目或服务，Bun的兼容性更实用。

两个运行时都支持单一二进制编译、Docker和Hono。框架层基本上是可移植的。

继续使用Node.js的理由越来越少。无论走哪个方向，这两个替代选项在2026年标准下都已达到可用于生产的水平。
