---
title: Claude Code 并行会话运行指南 — 使用 Git Worktree 同时处理多项任务
description: >-
  将 Git Worktree 与 Claude Code 结合，实现多功能并行开发的方法。涵盖 Plan Mode
  应用、会话隔离、无冲突并行工作模式，基于实际使用经验整理。
pubDate: '2026-04-13'
heroImage: ../../../assets/blog/claude-code-parallel-sessions-git-worktree-hero.jpg
tags:
  - ClaudeCode
  - Git
  - 生产力
  - 教程
  - AI编程
relatedPosts:
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.9
    reason:
      ko: 튜토리얼 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into 튜토리얼.
      ja: 튜토리얼をもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 튜토리얼 主题。
  - slug: claude-code-masterclass-series-1-prompt-to-agent
    score: 0.85
    reason:
      ko: claudecode를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on claudecode experience.
      ja: claudecodeを実際に扱った経験が続く記事です。
      zh: 延续 claudecode 的实战经验。
faq:
  - question: "可以在同一个分支上运行多个 Claude Code 会话吗?"
    answer: "在同一分支上同时运行两个会话，一旦一个会话修改了文件，另一个会话的上下文就会被污染。会出现文件状态不一致、意外的合并冲突以及无法追踪哪个会话做了什么的问题。用 worktree 把每个分支放到独立目录，冲突和污染就消失了。"
  - question: "worktree 之间会共享 node_modules 和 package.json 吗?"
    answer: "不会。package.json、package-lock.json 和 node_modules 在原始目录与 worktree 之间不共享，可能需要在每个 worktree 中单独运行 npm install，尤其是在功能分支添加了新包时。"
  - question: "在多个 worktree 中同时启动开发服务器会怎样?"
    answer: "如果多个 worktree 同时启动连接到同一端口本地数据库的开发服务器，会产生端口冲突。需要在各 worktree 的 .env.local 中配置不同端口，或共享数据库但只从一侧执行迁移。"
  - question: "worktree 并行模式总是有效吗?"
    answer: "它不是万能的。任务之间修改不同文件时效果最好；如果两个会话都需要修改同一组件，反而会产生更多合并冲突。会话超过三个后，追踪各会话进度会产生额外开销，因此建议先从两个开始。"
---

同时打开多个 Claude Code 标签页感觉像是在并行工作。实际上并不是。

在同一个分支上同时运行两个 Claude Code 会话，一旦一个会话修改了文件，另一个会话的上下文就会被污染。文件状态不一致、意外的合并冲突、无法追踪哪个会话做了什么。我亲历了这些问题之后，才认真研究起 git worktree。

结论是：**git worktree + Claude Code 的组合运行起来比预想的自然得多**。配置也并不复杂。本文涉及的内容都可以在一手来源中核实：Git 官方文档的 [git-worktree](https://git-scm.com/docs/git-worktree) 页面、Claude Code 官方文档的 [Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees) 章节，以及汇集日常工作配方的 [Common workflows](https://code.claude.com/docs/en/common-workflows) 指南。

## Git Worktree 是什么

git worktree 允许从单个 git 仓库同时将多个分支检出到不同目录。这个功能从 2016 年起就内置于 git，但知道的人出乎意料地少。用[官方文档](https://git-scm.com/docs/git-worktree)的原话说，该命令"管理附加到同一仓库的多个工作树（Manage multiple working trees attached to the same repository）"。每个工作树都有自己的 `HEAD` 和索引。

核心区别只有一点：切换分支（`git checkout`）会替换当前工作目录中的文件。使用 worktree，每个分支存在于**各自独立的物理目录**中。

```bash
# 传统方式：切换分支时文件被整体替换
git checkout feature/new-login  # 当前目录的文件全部被换掉

# worktree 方式：目录本身分离
git worktree add ../project-feature feature/new-login  # 分离到独立目录
```

这对 Claude Code 为何重要？因为**可以在每个 worktree 目录中运行独立的 Claude Code 会话**。无文件冲突，无上下文污染。

## 实际配置方法

假设项目在 `~/project/my-app`。

```bash
# 1. 确认起始状态
cd ~/project/my-app
git status  # main 分支，干净状态

# 2. 添加 worktree（分支名与目录名对应便于管理）
git worktree add ../my-app-feature feature/add-oauth
git worktree add ../my-app-bugfix fix/login-redirect

# 3. 验证
git worktree list
```

输出：

```
/Users/jangwook/project/my-app         abc1234 [main]
/Users/jangwook/project/my-app-feature def5678 [feature/add-oauth]
/Users/jangwook/project/my-app-bugfix  ghi9012 [fix/login-redirect]
```

三个目录**共享同一个 git 仓库**，各自检出不同的分支。`.git` 文件夹只在原始目录中，其余目录有一个指向它的 `.git` 文件（链接）。

## 启动并行 Claude Code 会话

为每个目录打开独立终端，启动 Claude Code。

```bash
# 终端1：主要工作
cd ~/project/my-app
claude

# 终端2：OAuth 功能开发
cd ~/project/my-app-feature
claude

# 终端3：登录 Bug 修复
cd ~/project/my-app-bugfix
claude
```

每个会话完全独立。终端 2 修改 `src/auth/oauth.ts`，终端 3 的 Claude Code 对此一无所知。毕竟是不同分支的文件。

如果已经熟悉 Claude Code 最佳实践，这个模式可以直接应用。

### `--worktree` 标志：一步到位

除了上面那种手动方式（`git worktree add`，再 `cd`，再 `claude`），Claude Code 还提供一个内置标志，把 worktree 创建和会话启动合并到一条命令里。根据官方文档（[Worktrees](https://code.claude.com/docs/en/worktrees)），传入 `--worktree`（或 `-w`）会在仓库根目录的 `.claude/worktrees/<名称>/` 下创建 worktree，在新的 `worktree-<名称>` 分支上，并在其中启动 Claude。

```bash
# 创建 worktree + 启动会话，一行搞定
claude --worktree feature-auth

# 在另一个终端用不同名称启动第二个隔离会话
claude --worktree bugfix-123

# 省略名称时会自动生成类似 bright-running-fox 的名字
claude --worktree
```

默认从远程的默认分支（`origin/HEAD`）分叉，因此总是从干净的工作树开始。有一点要注意：worktree 是全新检出，所以 `.env`、`.env.local` 这类未被追踪的文件不会带过来。在项目根目录放一个 `.worktreeinclude` 文件（使用 `.gitignore` 语法），就能在每次创建新 worktree 时自动复制这些文件。另外建议把 `.claude/worktrees/` 加入 `.gitignore`。

退出会话时，如果没有改动，worktree 和分支会被自动清理；如果有提交或未保存的修改，Claude 会询问保留还是删除。手动创建的 worktree 不在这个自动清理范围内，需要自己用 `git worktree remove` 删除。

## 使用 Plan Mode 分配任务

有效利用并行会话需要**先制定计划再分配**。盲目地打开多个会话并不能提升效率。

我使用的模式：

**第一步：在主会话中使用 Plan Mode 制定整体计划**

在主目录的 Claude Code 会话中启用 Plan Mode（`Shift+Tab` 或 `/plan`），分析全部工作内容。

```
我：这个迭代需要添加 OAuth 登录、修复登录跳转 Bug、更新 API 文档。
    想在独立的 worktree 中并行进行这些任务，应该如何拆分？

Claude：[分析各任务的文件依赖关系，识别潜在冲突点]
```

**第二步：向每个 worktree 传递具体上下文**

基于 Plan Mode 的结果，向每个会话给出明确的指令。模糊的指令会让 Claude Code 有修改意外文件的空间。

```bash
# 在 my-app-feature 会话中
我：这是 feature/add-oauth 分支。只专注于 src/auth/ 目录，
    添加 Google OAuth 支持。其他目录不需要动。
```

**第三步：完成后在主会话中合并**

```bash
git merge feature/add-oauth
git merge fix/login-redirect
```

## 实例：三项任务同时进行

这是我最近实际使用的案例。在博客项目中：

- `main`：日常内容管理（保持已部署状态稳定）
- `feature/recommendation-v4`：改进内容推荐算法
- `fix/og-image-path`：修复 OG 图片路径 Bug

没有 worktree 的话，在开发推荐算法时遇到 OG 图片 Bug，就需要切换分支或使用 stash。有了 worktree，直接切到另一个终端窗口立刻修复。

配置 Claude Code Hook 实现自动化审查系统后，可以设置在 worktree 切换时自动更新上下文的 Hook，让工作流更加顺畅。

## 注意事项与实际局限

### 共享资源注意事项

`package.json`、`package-lock.json` 和 `node_modules/` 在原始目录和 worktree 之间不共享。可能需要在每个 worktree 中单独运行 `npm install`——尤其是在功能分支添加了新包时。

### 数据库连接冲突

如果多个 worktree 同时启动连接到同一端口本地数据库的开发服务器，会产生端口冲突。需要在各 worktree 的 `.env.local` 中配置不同端口，或共享数据库但只从一侧执行迁移。

### 清理 worktree

工作完成后要删除 worktree，否则 `.git/worktrees/` 会悄悄膨胀。

```bash
# 分支合并后删除 worktree
git worktree remove ../my-app-feature

# 强制删除（即使有未提交的修改）
git worktree remove --force ../my-app-feature

# 清理已删除目录的引用
git worktree prune
```

### 诚实的局限性

我很喜欢这个模式，但它不是万能的。任务之间修改不同文件时效果最好；如果两个会话都需要修改同一组件，反而会产生更多合并冲突。另外，会话超过三个后，开始追踪各会话进度时就会产生额外的管理开销。

与多智能体 PR 审查模式结合，可以自动审查从各 worktree 分支产生的 PR。在团队规模的使用中，这种组合是我发现的最实用的配置。官方文档还进一步介绍了如何把子智能体隔离到各自的 worktree 中运行：在自定义子智能体的 frontmatter 里加上 `isolation: worktree`，每个智能体就会获得一个临时 worktree，在没有改动地结束时自动删除。[如果你搭建过智能体团队](/zh/blog/zh/claude-agent-teams-guide)，会立刻体会到这个隔离选项对并行工作冲突的削减有多明显。

## 何时使用，何时避免

我不会无条件推荐这个模式。实际用起来，效果明显的场景和反而吃亏的场景是分开的。

**并行 worktree 有利的情形：**

- 任务之间修改**不同的文件和目录**时。如果 OAuth 在 `src/auth/`、Bug 修复在 `src/routes/`，区域分开，合并冲突几乎不会发生。
- 长任务进行中突然来了**紧急热修复**时。无需 stash 或切换分支，在另一个终端直接修好，完成后回到原本的工作。
- 想对同一段代码**尝试多种方案**时。开两个目录并行，比较哪一个更好。
- 想**隔离**子智能体或后台作业，保持主检出干净时。

**最好避免并行 worktree 的情形：**

- 两个任务都需要修改**同一个组件或同一个文件**时。这时 worktree 不但不减少冲突，反而增加。顺序处理更好。
- 会话**超过三个**之后。追踪每个会话进度的开销会开始吞掉你省下的时间。先从两个开始。
- 像数据库迁移那样**共享状态（本地 DB 等）顺序很重要**的工作。同时运行会把数据搞乱。
- 几下就完成的小修改，**隔离的搭建成本大于任务本身**时。

把判断标准压成一句话：任务在文件层面是否独立？是，则 worktree 大放异彩；否，就别硬拆。配合[Claude Code 大师课第一篇](/zh/blog/zh/claude-code-masterclass-series-1-prompt-to-agent)里讲的提示词分配原则一起读，更容易判断哪些工作该如何拆分。

## 命令速查

```bash
# 创建 worktree
git worktree add <路径> <分支名>
git worktree add <路径> -b <新分支名>  # 创建新分支的同时检出

# 查看列表
git worktree list

# 删除
git worktree remove <路径>
git worktree prune  # 清理已删除目录的引用
```

## 先从两个开始，再逐步扩展

说实话，最初的反应是"真的有必要这么做吗？"用过一次之后，需要并行开发的场景就自然而然地想到它了。

核心思路很简单：**独立分支 → 独立目录 → 独立 Claude Code 会话**。三者对齐，会话间互不干扰，并行推进。

建议从两个 worktree 开始，熟悉模式后再扩展到三个。如果想进一步构建系统化的多智能体模式，[Claude Code Agent Teams 指南](/zh/blog/zh/claude-agent-teams-guide)是自然的下一步。
