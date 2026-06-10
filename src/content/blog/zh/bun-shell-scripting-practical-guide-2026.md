---
title: 用Bun Shell构建TypeScript自动化脚本 — 从安装到实战模式
description: >-
  基于Bun 1.3.14实际实验的Bun Shell完整指南。涵盖$模板字面量、.nothrow()错误处理、Promise.all并行化及macOS
  echo陷阱，附真实执行日志。还包含与zx的实质差异及生产环境部署的注意事项。
pubDate: '2026-05-25'
heroImage: ../../../assets/blog/bun-shell-scripting-practical-guide-2026-hero.png
tags:
  - Bun
  - TypeScript
  - 自动化
  - Shell
relatedPosts:
  - slug: weekly-analytics-2025-10-14
    score: 0.93
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: astro-scheduled-publishing
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, web development, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、Web开发、DevOps主题进行连接。
  - slug: blog-launch-analysis-report
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, web development, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、Web开发、DevOps主题进行连接。
  - slug: chrome-devtools-mcp-performance
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, web development, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、Web开发、DevOps主题进行连接。
  - slug: claude-code-web-automation
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, web development, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、Web开发、DevOps主题进行连接。
---

写shell脚本的时候，我总有个小烦恼。用bash写虽然熟悉但在Windows上会出问题。Node.js的`child_process`写起来回调满天飞。用`zx`又需要额外安装包。就在这时我试了试Bun Shell，起初以为不过是个zx的翻版，真正跑起来之后，想法有些改变了。

这篇文章基于我在Bun 1.3.14上实际实验的结果。文档里写的和实际运行的有出入的地方，我如实记录了下来。

## Bun Shell是什么，为什么现在值得关注

Bun是JavaScript运行时，同时也是包管理器、打包工具和测试运行器。整个项目的目标是把碎片化的生态系统整合成一个工具。[就像Python的uv整合了pip、pyenv和poetry一样](/zh/blog/zh/uv-python-ai-development-setup-guide-2026)，Bun把npm/yarn/pnpm加测试运行器加打包工具合并成了一个。

Bun Shell是这种整合哲学在shell脚本领域的延伸。安装`bun`之后，不需要额外配置，就可以在TypeScript内用`$`模板字面量直接执行shell命令。

### 和zx的区别

说实话，API表面上很像。两者都用`` $`command` ``语法。核心区别只有一个：**Bun Shell不依赖bash。**

zx在内部调用系统的bash（或sh）。Windows上没有bash的话，就需要WSL或Git Bash。Bun Shell内置了用Rust实现的自有shell，不需要bash也能运行。`ls`、`rm`、`echo`、`cd`、`mkdir`等常用命令在Windows、macOS、Linux上的运行结果完全一致。

如果团队里有Windows开发者，这个区别就很重要了。

## 安装方法

安装Bun只需一行命令：

```bash
curl -fsSL https://bun.sh/install | bash
```

安装完成后，`PATH`会自动添加到shell配置文件（`~/.zshrc`或`~/.bashrc`）中。在当前会话中生效：

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
bun --version  # 1.3.14
```

初始化新项目：

```bash
mkdir my-scripts && cd my-scripts
bun init -y
```

`bun init`会自动生成`package.json`、`tsconfig.json`和`index.ts`。TypeScript无需额外配置就能直接运行，这点很方便。

## 基本模式 — 用$模板字面量执行命令

最基本的用法：从内置`bun`模块导入`$`：

```typescript
import { $ } from "bun";

// 执行命令
await $`echo "Hello from Bun Shell"`;

// 捕获输出
const files = await $`ls -la`.text();
console.log(files);

// JavaScript变量插值（自动转义！）
const filename = "my file.txt";  // 含空格
await $`echo "${filename}" > output.txt`;
// → output.txt中保存"my file.txt"（空格被正确转义）
```

变量插值的自动转义确实有效。我测试了含空格的文件名，无需额外处理就能正确识别。这减少了bash脚本中因忘记给`"${var}"`加引号而出错的情况。

### 输出格式方法

```typescript
// 以字符串返回
const text = await $`ls`.text();

// 以行数组返回（Bun特有的便利方法）
const lines = await $`ls`.lines();
// → ["file1.ts", "file2.ts", ...]

// 以Blob返回
const blob = await $`cat file.txt`.blob();
```

`.lines()`是把输出按行解析成数组的便利方法，比手写`text().split('\n')`更简洁。

## 错误处理、环境变量和管道

### 两种错误处理模式

Bun Shell中命令失败（exit code != 0）时，默认会抛出异常。

```typescript
// 模式1：try/catch
try {
  await $`ls /nonexistent-dir`;
} catch (e) {
  console.log("错误:", e.message); // "Failed with exit code 1"
}

// 模式2：.nothrow() — 用exitCode代替抛出异常
const result = await $`ls /nonexistent-dir`.nothrow();
console.log(result.exitCode); // 1
console.log(result.stderr.toString()); // 错误信息
```

实际工作中我更常用`.nothrow()`。检查文件是否存在、命令是否安装等场景比`try/catch`更简洁：

```typescript
const nodeResult = await $`node --version`.nothrow();
if (nodeResult.exitCode === 0) {
  console.log("Node.js:", nodeResult.stdout.toString().trim());
} else {
  console.log("Node.js未安装");
}
```

这个模式在我的实验中验证可以正常使用。

### 设置环境变量

```typescript
// 设置全局默认值
$.env({ API_KEY: "secret123", PATH: process.env.PATH! });

// 仅对单个命令生效
const result = await $`echo $LOCAL_VAR`
  .env({ LOCAL_VAR: "only this command", PATH: process.env.PATH! })
  .text();
```

注意：`.env()`传入的对象会完全替换现有环境变量，而不是合并。如果忘了带`PATH`，后续所有命令都找不到可执行文件。

### 管道

```typescript
// Bun Shell内置管道
const sorted = await $`printf "banana\napple\ncherry\n" | sort`.text();
// → apple, banana, cherry

// 去重+排序（使用文件重定向）
await Bun.write("input.txt", "banana\napple\ncherry\napple\n");
const unique = await $`sort < input.txt | uniq`.text();
```

这里有个陷阱。在macOS上，`echo "banana\napple"`中的`\n`不会被解释为换行符。与Linux bash的`echo -e`不同，macOS默认的`echo`不处理转义序列。需要用`printf`代替。

Bun Shell虽然不依赖bash运行，但内置命令的行为仍然遵循所在操作系统的规范，这一点要牢记。

## 并行执行 — Promise.all是关键

在Bun Shell中并行执行多个命令需要使用`Promise.all`。顺序写的命令会顺序执行。

```typescript
// 顺序执行（~200ms）
await $`sleep 0.1`;
await $`sleep 0.1`;

// 并行执行（~100ms）
await Promise.all([
  $`sleep 0.1`,
  $`sleep 0.1`,
]);
```

我直接测量了一下，顺序执行约471ms，并行执行约263ms。overhead比预期大，这是因为macOS进程创建本身有成本。不过对于IO密集型任务，并行化效果还是明显的。

### 实用构建脚本示例

Bun Shell在构建脚本中最能体现价值。可以将shell操作与TypeScript逻辑混合在同一个文件中：

```typescript
import { $ } from "bun";

const DIST = "./dist";
const SRC = "./src";

async function build() {
  // 清理构建目录
  await $`rm -rf ${DIST} && mkdir -p ${DIST}`;

  // 获取TypeScript文件列表
  const tsFiles = await $`ls ${SRC}/*.ts`.text();
  const files = tsFiles.trim().split("\n");

  console.log(`构建目标：${files.length}个文件`);

  // 并行处理
  await Promise.all(
    files.map(async (f) => {
      const name = f.split("/").pop()!.replace(".ts", ".js");
      await $`bun build ${f} --outfile ${DIST}/${name}`;
    })
  );

  // 检验结果
  const built = await $`ls ${DIST}/`.text();
  console.log("构建完成:", built.trim().replace(/\n/g, ", "));
}

build().catch(console.error);
```

将这个脚本保存为`scripts/build.ts`，用`bun run scripts/build.ts`执行。不需要Node.js或ts-node，体感上轻松很多。[将这个构建脚本接入GitHub Actions CI/CD流水线](/zh/blog/zh/github-actions-claude-code-ci-automation)是本地自动化跑通后自然的下一步。

## 实验中发现的陷阱

诚实地说。

### 陷阱1：`.stdin()` API在1.3.14中不可用

你可能见过`` $`command`.stdin("text") ``这样的写法。在Bun 1.3.14中，这个API并不存在，运行时会报`stdin is not a function`错误。

替代方案：

```typescript
// ❌ 1.3.14中不可用
await $`sort | uniq`.stdin("banana\napple\ncherry");

// ✅ 替代方案1：使用文件
await Bun.write("/tmp/input.txt", "banana\napple\ncherry\n");
await $`sort < /tmp/input.txt | uniq`;

// ✅ 替代方案2：用printf构建管道
await $`printf "banana\napple\ncherry\n" | sort | uniq`;
```

这是我发现的最意外的地方。部分文档里有这个API的示例，但当前稳定版本里根本没有，使用前要确认所用版本。

### 陷阱2：`$.env()`是替换而非合并

```typescript
// ❌ 危险：PATH会消失
$.env({ MY_VAR: "value" });
await $`ls`;  // 可能报错

// ✅ 安全：明确包含PATH
$.env({ MY_VAR: "value", PATH: process.env.PATH! });
```

### 陷阱3：macOS的echo不解释`\n`

前面已经说过，但值得再强调一遍：Bun Shell使用系统原生的`echo`。macOS上`echo "a\nb"`输出的是字面量`a\nb`，而不是两行。需要换行的管道输入请用`printf`。

```typescript
// ❌ macOS上不如预期
await $`echo "apple\nbanana\ncherry" | sort`;
// → 输出一行 "apple\nbanana\ncherry"

// ✅ 各平台通用
await $`printf "apple\nbanana\ncherry\n" | sort`;
```

## 什么时候用Bun Shell，什么时候不用

我的结论：**项目已经基于Bun，就有足够理由用Bun Shell；否则从zx开始更现实。**

### 适合用Bun Shell的场景

- **项目已经用Bun**作为包管理器：无需额外依赖就能用shell脚本。
- **团队有Windows开发者**：需要不依赖bash的跨平台shell。
- 希望把**构建/部署脚本统一成TypeScript**：配置代码和shell操作在同一个文件里处理。

### 不必用Bun Shell的场景

- 项目基于Node.js + npm，没有迁移计划。
- 已有复杂bash脚本，Bun Shell的兼容性不确定。
- `zx`已经运行良好，团队也很熟悉。

我不认同"Bun Shell比zx更好"这种说法。从生态成熟度和下载量来看，zx更占优。Bun Shell是"用Bun的人的自然选择"，而不是"所有项目都应该弃用zx"。

还有一点，`.stdin()` API尚不稳定让我觉得遗憾。一旦稳定下来，基于stdin的管道处理会简洁很多，现在还需要绕路。

## 总结

实际安装运行之后，Bun Shell的开发体验比我想象的好。变量自动转义、`.nothrow()`模式、`.lines()`这样的便利方法——这些细节设计在zx里也见不到。

不过目前仍是1.x版本，部分API还不稳定。在生产CI/CD脚本中使用之前，建议在实际环境中充分验证。与[Claude Code hooks](/zh/blog/zh/claude-code-hooks-workflow)等自动化流水线集成时也同样如此。

Bun在快速发展，Shell API也会逐渐稳定。现在没有迫切需要放弃zx的理由，但新的Bun项目不妨先试试内置shell。

---

**实验环境**：
- Bun：1.3.14（macOS arm64）
- 沙箱：`/tmp/bun-lab-final/`
- 实验日期：2026-05-25
