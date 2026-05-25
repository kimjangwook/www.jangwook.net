---
title: 'Building Automation Scripts with Bun Shell — From Setup to Real-World Patterns'
description: 'Bun Shell guide from Bun 1.3.14 experiments: $ template literals, .nothrow() error handling, Promise.all parallelism, macOS echo pitfall, and a comparison with zx.'
pubDate: '2026-05-25'
heroImage: '../../../assets/blog/bun-shell-scripting-practical-guide-2026-hero.png'
tags: ['Bun', 'TypeScript', 'Automation', 'Shell']
relatedPosts:
  - slug: 'uv-python-ai-development-setup-guide-2026'
    score: 0.78
    reason:
      ko: 'Bun이 Node.js 생태계를 하나로 합치려는 것처럼, uv도 Python 패키지 관리를 단일 도구로 통합한다. "왜 이 도구가 이렇게 설계됐나"라는 질문에 두 글이 함께 답한다.'
      ja: 'BunがNode.jsエコシステムを統合しようとするように、uvもPythonパッケージ管理を一元化する。両記事を読むと「このツールはなぜこう設計されたのか」という問いへの答えが見えてくる。'
      en: 'Just as Bun unifies the Node.js ecosystem into one tool, uv does the same for Python. Reading both answers the question: why are modern dev tools designed this way?'
      zh: '就像Bun试图统一Node.js生态系统一样，uv也在统一Python包管理。两篇文章一起阅读，能回答"为什么现代开发工具要这样设计"这个问题。'
  - slug: 'github-actions-claude-code-ci-automation'
    score: 0.74
    reason:
      ko: 'Bun Shell로 로컬 자동화 스크립트를 만들었다면, 그 스크립트를 GitHub Actions와 연결하는 방법이 자연스러운 다음 단계다.'
      ja: 'Bun Shellでローカル自動化スクリプトを書いたなら、それをGitHub Actionsと連携させるのが次のステップだ。この記事がその橋渡しをしてくれる。'
      en: 'If you built a local automation script with Bun Shell, connecting it to GitHub Actions is the natural next step — this post shows how.'
      zh: '用Bun Shell编写了本地自动化脚本之后，将其与GitHub Actions集成是很自然的下一步。'
  - slug: 'claude-code-hooks-workflow'
    score: 0.70
    reason:
      ko: 'Claude Code 훅도 셸 명령을 실행하는 구조다. Bun Shell 스크립트와 Claude Code 훅을 조합하면 개발 워크플로 자동화의 폭이 넓어진다.'
      ja: 'Claude CodeのフックもシェルコマンドをトリガーするUIだ。Bun Shellスクリプトと組み合わせると、開発ワークフロー自動化の幅が広がる。'
      en: 'Claude Code hooks also execute shell commands — combining Bun Shell scripts with hooks unlocks a wider range of dev workflow automation.'
      zh: 'Claude Code hooks也是执行shell命令的结构。将Bun Shell脚本与Claude Code hooks结合使用，可以扩大开发工作流自动化的范围。'
  - slug: 'nextjs-16-claude-api-streaming-guide-2026'
    score: 0.62
    reason:
      ko: 'Bun을 패키지 매니저로 사용하는 Next.js 프로젝트에서 Claude API를 연동하는 실제 예제가 궁금하다면 이 글을 함께 참고하자.'
      ja: 'BunをパッケージマネージャーとするNext.jsプロジェクトでClaude APIを連携する実例が気になる場合は、この記事も一緒に参照してほしい。'
      en: 'If you want a real example of using Bun as a package manager in a Next.js project with Claude API, this companion post has you covered.'
      zh: '如果你想看在Next.js项目中使用Bun作为包管理器并集成Claude API的实际示例，可以参考这篇文章。'
---

I have a small recurring frustration when writing shell scripts. Bash works but breaks on Windows. Node.js `child_process` turns into callback soup. `zx` needs an extra package. So when Bun Shell came up, I figured it was just another zx clone. After actually running it, my opinion shifted a bit.

This article is based on real experiments I ran with Bun 1.3.14. Some things in the docs didn't match actual runtime behavior — I'm documenting those honestly.

## What Bun Shell Is and Why It's Worth Knowing

Bun is a JavaScript runtime that also serves as a package manager, bundler, and test runner. The entire project is about collapsing a fragmented ecosystem into a single tool. [Just as Python's uv consolidates pip, pyenv, and poetry into one binary](/en/blog/en/uv-python-ai-development-setup-guide-2026), Bun merges npm/yarn/pnpm, a test runner, and a bundler into one.

Bun Shell is the natural extension of this philosophy into shell scripting. Install `bun`, and you can use the `$` template literal to run shell commands directly inside TypeScript — no extra dependencies.

### How It Differs From zx

Honestly, the API surface looks similar. Both use the `` $`command` `` syntax. The meaningful difference is architectural: **Bun Shell doesn't depend on bash.**

zx invokes the system's bash (or sh) under the hood. On Windows without bash, you need WSL or Git Bash. Bun Shell ships its own shell implementation written in Rust. It runs `ls`, `rm`, `echo`, `cd`, `mkdir`, and other common commands identically across Windows, macOS, and Linux — no bash required.

If your team includes Windows developers, that difference matters.

## Installation

Installing Bun is a one-liner:

```bash
curl -fsSL https://bun.sh/install | bash
```

After installation, the installer automatically appends the `PATH` entry to your shell config (`~/.zshrc` or `~/.bashrc`). To apply it to the current session:

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
bun --version  # 1.3.14
```

Initialize a new project:

```bash
mkdir my-scripts && cd my-scripts
bun init -y
```

`bun init` generates `package.json`, `tsconfig.json`, and `index.ts`. TypeScript works out of the box — no ts-node or additional configuration needed.

## Basic Patterns — Running Commands with $ Template Literals

The core syntax: import `$` from the built-in `bun` module.

```typescript
import { $ } from "bun";

// Execute a command
await $`echo "Hello from Bun Shell"`;

// Capture output
const files = await $`ls -la`.text();
console.log(files);

// JavaScript variable interpolation — automatically escaped
const filename = "my file.txt";  // note: has a space
await $`echo "${filename}" > output.txt`;
// → output.txt contains "my file.txt" (space handled correctly)
```

The automatic escaping in variable interpolation actually works. I tested it with a filename containing a space and it was handled correctly without any manual quoting. This eliminates a whole class of bash bugs where forgetting to quote `"${var}"` causes unexpected word splitting.

### Output Format Methods

```typescript
// As a string
const text = await $`ls`.text();

// As a line-by-line array (Bun convenience method)
const lines = await $`ls`.lines();
// → ["file1.ts", "file2.ts", ...]

// As a Blob
const blob = await $`cat file.txt`.blob();
```

`.lines()` is a quality-of-life method that parses output into an array per line. Cleaner than `text().split('\n')` and handles edge cases like trailing newlines.

## Error Handling, Environment Variables, and Pipelines

### Two Error Handling Patterns

When a command fails (exit code != 0), Bun Shell throws an exception by default.

```typescript
// Pattern 1: try/catch
try {
  await $`ls /nonexistent-dir`;
} catch (e) {
  console.log("Error:", e.message); // "Failed with exit code 1"
}

// Pattern 2: .nothrow() — returns exitCode instead of throwing
const result = await $`ls /nonexistent-dir`.nothrow();
console.log(result.exitCode); // 1
console.log(result.stderr.toString()); // error message
```

In practice, I reach for `.nothrow()` most often. Checking whether a file or command exists is cleaner this way:

```typescript
const nodeResult = await $`node --version`.nothrow();
if (nodeResult.exitCode === 0) {
  console.log("Node.js:", nodeResult.stdout.toString().trim());
} else {
  console.log("Node.js is not installed");
}
```

I verified this pattern works correctly in my experiments.

### Environment Variables

```typescript
// Set global defaults
$.env({ API_KEY: "secret123", PATH: process.env.PATH! });

// Apply locally to a single command
const result = await $`echo $LOCAL_VAR`
  .env({ LOCAL_VAR: "only this command", PATH: process.env.PATH! })
  .text();
```

**Watch out:** the object you pass to `.env()` completely replaces the environment — it's not merged. If you forget `PATH`, subsequent commands won't find any executables.

### Pipelines

```typescript
// Built-in Bun Shell pipe
const sorted = await $`printf "banana\napple\ncherry\n" | sort`.text();
// → apple, banana, cherry

// Dedup + sort using file redirection
await Bun.write("input.txt", "banana\napple\ncherry\napple\n");
const unique = await $`sort < input.txt | uniq`.text();
```

There's a trap here. On macOS, `echo "banana\napple"` does not interpret `\n` as a newline. Unlike Linux bash's `echo -e`, macOS's default echo treats backslash-n literally. Use `printf` instead.

This is an important nuance: Bun Shell runs without bash, but it still uses the OS's native commands. The OS-level behavior of `echo` remains unchanged.

## Parallel Execution — Promise.all Is the Key

To run multiple commands in parallel with Bun Shell, use `Promise.all`. Commands written sequentially are executed sequentially.

```typescript
// Sequential (~200ms)
await $`sleep 0.1`;
await $`sleep 0.1`;

// Parallel (~100ms)
await Promise.all([
  $`sleep 0.1`,
  $`sleep 0.1`,
]);
```

When I measured this directly, sequential was around 471ms and parallel was around 263ms. More overhead than I expected — macOS process spawning has non-trivial cost. Still, for IO-heavy work the parallelization is meaningful.

### A Practical Build Script

Build scripts are where Bun Shell shows its real value. You can blend shell operations with TypeScript logic in the same file:

```typescript
import { $ } from "bun";

const DIST = "./dist";
const SRC = "./src";

async function build() {
  // Clean build
  await $`rm -rf ${DIST} && mkdir -p ${DIST}`;

  // Get TypeScript file list
  const tsFiles = await $`ls ${SRC}/*.ts`.text();
  const files = tsFiles.trim().split("\n");

  console.log(`Building ${files.length} files`);

  // Parallel compilation
  await Promise.all(
    files.map(async (f) => {
      const name = f.split("/").pop()!.replace(".ts", ".js");
      await $`bun build ${f} --outfile ${DIST}/${name}`;
    })
  );

  // Verify output
  const built = await $`ls ${DIST}/`.text();
  console.log("Build output:", built.trim().replace(/\n/g, ", "));
}

build().catch(console.error);
```

Save this as `scripts/build.ts` and run it with `bun run scripts/build.ts`. No Node.js or ts-node needed. [Wiring this build script into a GitHub Actions CI/CD pipeline](/en/blog/en/github-actions-claude-code-ci-automation) is a natural next step once local automation is working.

## Pitfalls I Found While Experimenting

Here's the honest part.

### Pitfall 1: `.stdin()` API Doesn't Work in 1.3.14

You may have seen examples using `` $`command`.stdin("text") ``. In Bun 1.3.14, this API doesn't exist. You'll get a `stdin is not a function` runtime error.

Alternatives:

```typescript
// ❌ Doesn't work in 1.3.14
await $`sort | uniq`.stdin("banana\napple\ncherry");

// ✅ Alternative 1: use a file
await Bun.write("/tmp/input.txt", "banana\napple\ncherry\n");
await $`sort < /tmp/input.txt | uniq`;

// ✅ Alternative 2: printf in the pipe
await $`printf "banana\napple\ncherry\n" | sort | uniq`;
```

This was the most surprising thing I found. The API appears in some documentation but doesn't actually exist in the current stable release. Worth checking the version you're on before relying on it.

### Pitfall 2: `$.env()` Replaces, Not Merges

```typescript
// ❌ Dangerous: PATH disappears
$.env({ MY_VAR: "value" });
await $`ls`;  // might error

// ✅ Safe: explicitly include PATH
$.env({ MY_VAR: "value", PATH: process.env.PATH! });
```

### Pitfall 3: macOS echo Doesn't Interpret `\n`

Already covered above, but worth restating: Bun Shell uses the OS-native `echo`. On macOS, `echo "a\nb"` prints the literal string `a\nb`, not two lines. Use `printf` if you need newlines in pipe input.

```typescript
// ❌ macOS: doesn't do what you think
await $`echo "apple\nbanana\ncherry" | sort`;
// → prints "apple\nbanana\ncherry" as one line

// ✅ Works everywhere
await $`printf "apple\nbanana\ncherry\n" | sort`;
```

## When to Use Bun Shell and When Not To

My conclusion: **if your project is already Bun-based, Bun Shell is a natural fit. Otherwise, starting with zx is more practical.**

### Use Bun Shell when:

- **Your project already uses Bun** as package manager — zero extra dependencies for shell scripting.
- **Your team includes Windows developers** — no bash dependency on any platform.
- You want to **consolidate build/deploy scripts** into TypeScript — same language, same file as your app logic.

### Skip Bun Shell when:

- Your project is Node.js + npm with no migration plans.
- You have complex bash scripts with unknown bash-isms that might not translate.
- `zx` already works and your team is comfortable with it.

I'd push back on the framing that Bun Shell is "better than zx." In terms of ecosystem maturity and download numbers, zx is ahead. Bun Shell is the right choice for Bun projects specifically — not a universal upgrade recommendation.

And honestly, the missing `.stdin()` API bothers me. Once that's stable, stdin-based pipe processing will be significantly cleaner. Until then, there's a workaround but it adds friction.

## Deployment Considerations

A few things worth knowing before you put Bun Shell scripts into production.

### Pin Your Bun Version

Differences between Bun minor versions can cause subtle behavioral changes. Pin the version in `package.json` and in CI:

```json
// package.json
{
  "engines": {
    "bun": ">=1.3.0"
  }
}
```

For GitHub Actions:

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: "1.3.14"
```

Without pinning, a minor update could silently break things if an API changes.

### Error Logging Pattern

When using `.nothrow()`, capture stderr explicitly and exit non-zero on failure so CI recognizes the script as broken:

```typescript
const result = await $`some-command`.nothrow();
if (result.exitCode !== 0) {
  console.error(`Command failed (${result.exitCode}): ${result.stderr.toString().trim()}`);
  process.exit(1);  // make CI fail visibly
}
```

Without `process.exit(1)`, a failed command might silently pass the pipeline. That's the kind of bug that surfaces at 2am on a release day.

## Wrapping Up

After actually installing and running it, Bun Shell's developer experience is better than I expected. Automatic variable escaping, the `.nothrow()` pattern, `.lines()` for line-by-line output — these are thoughtful details you don't see in zx.

That said, it's still 1.x and some APIs are not stable. I'd recommend validating thoroughly in your actual environment before putting Bun Shell scripts into production CI/CD. The same applies if you're integrating with [Claude Code hooks](/en/blog/en/claude-code-hooks-workflow) or other automation pipelines.

Bun is moving fast and the Shell API will stabilize. There's no urgent reason to drop zx, but for new Bun projects, the built-in shell deserves a first look.

---

**Experiment environment**:
- Bun: 1.3.14 (macOS arm64)
- Sandbox: `/tmp/bun-lab-final/`
- Date: 2026-05-25
