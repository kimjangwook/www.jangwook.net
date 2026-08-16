---
title: 'AGENTS.md 与 CLAUDE.md 加载实测，两套工具怎么读你的规则'
description: '76次执行实测。codex与Claude Code互不读取对方的说明文件。codex 的嵌套配置在父级目录运行时完全失效，Claude遇到标记指令甚至当成隐藏提示词注入拒绝执行。附完整复现命令与双CLI配置方案。版本为 claude 2.1.233 与 codex 0.147.0，附软链接与 fallback。'
pubDate: '2026-08-16'
heroImage: '../../../assets/blog/agents-md-vs-claude-md-loading-measured-2026/hero.png'
tags:
  - ai-agents
  - developer-tools
  - codex
  - claude-code
  - monorepo
relatedPosts:
  - slug: agents-md-effectiveness
    score: 0.94
    reason:
      ko: 'AGENTS.md가 코드 성공률에 미치는 영향을 다룬 실증 논문 분석 글이다. 이번 글이 다룬 로딩 메커니즘과 바로 이어진다.'
      ja: 'AGENTS.mdがコード成功率に与える影響を扱った実証論文の分析記事だ。今回の読み込み検証と直結する。'
      en: 'Analyzes the empirical paper on how AGENTS.md affects code success rates, directly connecting to this loading mechanism audit.'
      zh: '分析 AGENTS.md 对代码成功率影响的实证论文，直接衔接本文测试的加载机制。'
  - slug: modern-web-guidance-agent-skill-coverage-2026
    score: 0.88
    reason:
      ko: '웹 표준 가이드라인과 에이전트 스킬 커버리지를 다룬 글이다. 지시문 구성의 상위 설계를 볼 때 함께 읽기 좋다.'
      ja: 'Web標準ガイドラインとエージェントスキルの網羅性を扱った記事だ。指示文設計を考える際に役立つ。'
      en: 'Covers web standards guidance and agent skill coverage, pairing well when designing prompt hierarchies.'
      zh: '探讨 Web 标准指南与智能体技能覆盖度，适合在设计指示文层级时对照阅读。'
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.82
    reason:
      ko: '에이전트 코딩에서 발생하는 인지 부채를 다룬 글이다. 규칙 파일이 실제로 안 읽힐 때 생기는 팀 차원의 위험을 연결한다.'
      ja: 'エージェントコーディングで生じる認知負荷と負債を扱った記事だ。ルールが読まれない組織リスクとつながる。'
      en: 'Explores cognitive debt in agentic coding, connecting the team risks when instruction files are silently skipped.'
      zh: '探讨智能体编程中的认知负债，关联规则文件未被静默加载时的团队风险。'
---

一个干净的空仓库，根目录放 **AGENTS.md**，子目录 `packages/api/note.txt` 只有一行。规则文件要求所有回答末尾附上标记词 `ZZROOT7`。我在根目录下给两个命令行工具输入相同提示词，让它们只打印目标文件的第一行。

`codex exec` 跑了 12.1 秒，打印出第一行文本，并在下一行老老实实带上了 `ZZROOT7`。`claude -p` 跑了 10.1 秒，打印完同一行文本就停了。根目录下的规则文件完好无损地躺在那里，Claude 一行也没读。

我在本地沙箱跑了 76 次有效执行，记下两套工具读取配置文件的边界。

## 离开当前工作目录，嵌套规则直接失效

> Agents automatically read the nearest file in the directory tree, so the closest one takes precedence and every subproject can ship tailored instructions.
>
> 来源 [agents.md 官方规范](https://agents.md/)

我删掉根目录规则，在 `packages/api/AGENTS.md` 里放入 `ZZNEST7`。根目录执行 codex 3 次都没有，切到 `packages/api` 后 3 次全有。

> Starting at the project root (typically the Git root), Codex walks down to your current working directory.
>
> 来源 [OpenAI Codex 文档](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

它从 Git 根目录走到当前工作目录就停，不扫描下面的子文件夹。根目录执行时，根标记 3/3，子目录标记 0。最近文件生效受 cwd 限制。

两套工具默认不互认文件名。codex 读根目录 `CLAUDE.md` 为 0/3（额外 0/2），Claude 读根目录 `AGENTS.md` 也是 0/3。默认各读各的。

## Claude 读取子目录规则取决于它调用了什么工具

> Claude Code reads `CLAUDE.md`, not `AGENTS.md`.
>
> 来源 [Claude Code 内存机制文档](https://code.claude.com/docs/en/memory)

> Claude also discovers `CLAUDE.md` and `CLAUDE.local.md` files in subdirectories under your current working directory. Instead of loading them at launch, they are included when Claude reads files in those subdirectories.
>
> 来源 [Claude Code 内存机制文档](https://code.claude.com/docs/en/memory)

它读取子目录文件时才引入。我把规则放进 `packages/api/CLAUDE.md`，根目录执行 12 次只有 7 次遵守。改成普通项目编码规范后依然是 4/6。

> 我在执行日志中看到，packages/api/CLAUDE.md 里要求每条回复带上特定标记，但用户提示词要求了除第一行外不要输出任何多余内容，同时该规则看起来很像文件中隐藏的提示词注入，因此选择不执行该规则。
>
> 来源 本地运行日志

根目录 `CLAUDE.md` 里的同样指令，Claude 9 次全部照办。规则下沉后既有工具选择差异，也引发模型警惕。文档所说的读取文件指 `Read` 工具。

禁用 Bash、强制使用 `Read` 工具时，4 次运行全部带上标记词（4/4）。禁用 `Read`、强制通过终端执行 `sed` 或 `cat` 时，命中率是 0/4。通过系统命令读取文件不会触发所在目录规则文件的注入逻辑。把团队规范拆成技能注入的[覆盖度实测](/zh/blog/zh/modern-web-guidance-agent-skill-coverage-2026/)，落在同一层。文件没读进去，技能也是空壳。

调试这个机制时我还报废了 8 次运行。`--disallowedTools` 是可变参数，直接在后面跟提示词会把提示词吞掉，报错找不到名为 Print 的工具。提示词必须放在 `-p` 参数后面。

## 完整复现实验的命令

版本分别是 `claude` 2.1.233 和 `codex` 0.147.0，单次执行耗时 8.8〜16.0 秒。

```bash
# 准备沙箱环境
SANDBOX_DIR="$(mktemp -d "${TMPDIR:-/tmp}/agents-md-lab.XXXXXX")"
trap 'rm -rf "$SANDBOX_DIR"' EXIT
mkdir -p "$SANDBOX_DIR/repo/packages/api"
cd "$SANDBOX_DIR/repo" && git init -q .
printf 'BLUEBERRY-9182\nsecond line\n' > packages/api/note.txt

# 1. 测试根目录 AGENTS.md
printf '# Repo rules\n\nEvery reply must end with the exact token ZZROOT7 on its own line.\n' > AGENTS.md
codex exec --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet

# 2. 测试子目录 AGENTS.md 在不同工作目录下的表现
rm -f AGENTS.md
printf '# Package rules\n\nEvery reply must end with the exact token ZZNEST7 on its own line.\n' > packages/api/AGENTS.md
codex exec --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
(cd packages/api && codex exec --skip-git-repo-check -C . "Print the first line of note.txt. Nothing else.")

# 3. 验证工具选择对子目录 CLAUDE.md 的影响
printf '# Package rules\n\nEvery reply must end with the exact token ZZNEST7 on its own line.\n' > packages/api/CLAUDE.md
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet --disallowedTools Bash
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet --disallowedTools Read
```

无规则文件的对照组测试中，两款工具都没有输出任何标记词，排除了环境污染的可能。

## 双工具共存时的折中配置

```bash
ln -s AGENTS.md CLAUDE.md
```

Claude 官方建议用软链接，建立后读取规则的成功率从 0/3 恢复到 3/3。

```bash
codex exec -c 'project_doc_fallback_filenames=["CLAUDE.md"]' --skip-git-repo-check -C . "..."
```

只有 `CLAUDE.md` 的仓库加上这行参数后，codex 也跑出 3/3。

多包结构的仓库在根目录运行时，codex 会跳过子包规则，Claude 的子目录规则也不稳定。关键构建指令或代码风格，现阶段应提到根目录统一声明。规则被静默跳过时，[团队里堆起来的认知负债](/zh/blog/zh/cognitive-debt-agentic-coding-2026/)就是从这里开始的。

## 本次测量的边界与未覆盖项

每个测试单元为 3 到 6 次，只摸清机制方向，不做统计普查。我只测试了 codex 0.147.0 与 Claude Code 2.1.233 在 2026 年 8 月 16 日的表现，模型固定为 `gpt-5.6-luna` 与 sonnet。Cursor、Windsurf、Copilot 等没有纳入测试。

测试只验证了指令是否被读取并体现在回答末尾，并不代表这些规则能提高代码质量或最终测试通过率。规则对交付质量的具体影响可以参考之前整理的 [AGENTS.md 实证研究](/zh/blog/zh/agents-md-effectiveness/)。

我没有测试超过 32 KiB 默认上限时的截断行为，也没有测试带有 `@AGENTS.md` 导入语法的写法。在所有 Claude 的运行中，我的用户级全局配置一直处于加载状态。

如果在未来的小版本更新中，某一方修改了向下扫描子目录的机制，或者统一了智能体上下文协议的载入逻辑，这里的结论就会随之改变。
