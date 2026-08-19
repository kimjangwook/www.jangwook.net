---
title: '@import 与软链接实测：CLAUDE.md 读 AGENTS.md 谁在无人值守时失效'
description: '21次运行三路对比 @import、软链接、/import 一次性复制。@import 在仓库外目标上无头模式全部失败，软链接3/3全过——原因不是写法，是解析发生在哪一层。附CI存活检测命令。'
pubDate: '2026-08-19'
heroImage: '../../../assets/blog/claude-md-at-import-agents-md-vs-symlink-2026/hero.png'
tags:
  - claude-code
  - ai-agents
  - developer-tools
  - ci-cd
  - monorepo
relatedPosts:
  - slug: agents-md-vs-claude-md-loading-measured-2026
    score: 0.93
    reason:
      ko: '같은 CLAUDE.md/AGENTS.md 로딩을 다룬 전편. 그때 미측정으로 남긴 @import를 이번 글이 21런으로 채운다.'
      ja: '同じCLAUDE.md/AGENTS.md読み込みを扱った前編。そこで未測定だった@importを今回21回の実行で埋めた。'
      en: 'The prior post on the same CLAUDE.md/AGENTS.md loading question, which left @import unmeasured — this post fills that gap with 21 runs.'
      zh: '同样探讨 CLAUDE.md/AGENTS.md 加载问题的前篇，当时留白的 @import 由本文的 21 次运行补上。'
  - slug: declared-rules-fail-open-robots-txt-agents-md-2026
    score: 0.85
    reason:
      ko: '선언형 규칙이 실패할 때 조용히 통과된 것처럼 보인다는 관찰. @import가 승인 거부 후에도 경고 없이 넘어가는 것과 같은 패턴이다.'
      ja: '宣言的ルールが失敗すると静かに通過したように見えるという観察。@importが承認拒否後も警告なく通り過ぎるのと同じ形だ。'
      en: 'Declared rules that fail open look like they passed — the same shape as @import moving on without a warning after approval is declined.'
      zh: '声明式规则失败时表现得像悄悄通过了——与 @import 在批准被拒后仍不报警地继续运行，是同一种形状。'
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.74
    reason:
      ko: '팀이 에이전트 규칙 파일에 의존할 때 쌓이는 인지 부채를 다룬다. 규칙이 실제로 로드됐는지 아무도 확인하지 않는 상태와 맞닿아 있다.'
      ja: 'チームがエージェントのルールファイルに依存する際に積み上がる認知負債を扱う。ルールが実際に読み込まれたか誰も確認しない状態と地続きだ。'
      en: 'Covers the cognitive debt that builds when a team leans on an agent rule file — the same blind spot as nobody checking whether the rules actually loaded.'
      zh: '探讨团队依赖智能体规则文件时累积的认知负债，与没人核实规则是否真正加载的状态是同一条脉络。'
---

上周有个团队在 Slack 里问我：仓库里已经有给别的智能体用的 AGENTS.md，现在要接入 Claude Code，是该在 CLAUDE.md 里写一行 `@AGENTS.md` 导入，还是干脆建个软链接？我当时答不上来，因为没实测过。Anthropic 官方文档把两条路径并排列出来，语气像是"随便选"。

这两条路径解析发生在不同的层：操作系统在文件系统层解开软链接，Claude Code 在加载器层解开 `@import`。21 次运行给出了数字：目标在仓库外时，`@import` 在无头模式下 0/3 全灭，软链接 3/3 全过。

## 官方给的两条路

Anthropic 的内存文档写得很直白。

> Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them.
>
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

同一页紧接着给出第二条路。

> A symlink also works if you don't need to add Claude-specific content
>
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

命令就是 `ln -s AGENTS.md CLAUDE.md`。第三条路是 `/import` 斜杠命令，Claude Code v2.1.213 以上才有，一次性把内容连同 MCP 服务器、命令、子智能体和技能复制过来，之后源文件改了也不会同步。

三条路径听起来像是同一件事的三种写法。[前篇](/zh/blog/zh/agents-md-vs-claude-md-loading-measured-2026/)里 @import 这一格留了空白，这次跑完 21 次之后我不这么想了。

## 机制：一个在文件系统层解析，一个在加载器层解析

操作系统解析软链接。Claude Code 的内存加载器打开 CLAUDE.md 的那一刻，内核早就顺着链接走完了，把目标文件的字节直接递过来——加载器看到的是项目根目录下的普通文件，"目标文件来自仓库外"这件事，到这一步加载器根本拿不到任何标记。

`@import` 导入由加载器自己解析。加载器手里攥着的是一串路径字符串，所以它能判断这条路径会不会走出当前工作目录，一旦越界，就把它挡在审批弹窗前面。谁手里有路径信息，谁才能拿它做判断——文件系统拿不到，加载器拿得到。

条件 f 和条件 g 这两组交叉对照把结论锁死了：绝对路径但仍在仓库内的导入，3/3 全过；软链接指向仓库外的文件，同样 3/3 全过。如果真正的变量是路径写法或者目标在不在仓库内，这两组结果的胜负应该互换才对——它们没有互换，能解释这一点的变量只剩一个：谁来做这次解析。

## 21次运行说了什么

跑法很直接：`/tmp/claudemd-lab-20260819` 下七个目录，每个目录跑三次 `claude -p 'Reply with exactly the word OK and nothing else.'`，AGENTS.md 里预埋标记词 ZQ7CANARY，回复里出现它就证明规则文件进了上下文。

```
a  CLAUDE.md = "@AGENTS.md"，相对路径，仓库内            3/3
b  CLAUDE.md -> AGENTS.md，软链接，仓库内                3/3
c  CLAUDE.md = AGENTS.md 的一次性复制（近似 /import 输出） 3/3
d  只有 AGENTS.md，没有 CLAUDE.md（对照组）              0/3
e  CLAUDE.md = "@/tmp/claudemd-lab-ext/AGENTS.md"，绝对路径，仓库外 0/3
f  CLAUDE.md = "@<仓库内绝对路径>/AGENTS.md"              3/3
g  CLAUDE.md -> 仓库外的文件，软链接                      3/3
```

环境：macOS，Claude Code 2.1.233，无头模式，`--output-format json`，`~/.claude/CLAUDE.md` 在七个条件下保持不变，仓库外目标放在 `/tmp/claudemd-lab-ext`。

条件 e 最值得停下来看。让模型不借助任何工具、原样打印它在会话开始时收到的项目指示，它只回了一行没展开的字面文本：`@/tmp/claudemd-lab-ext/AGENTS.md`。没有警告，没有报错。目标文件的内容从头到尾没进过上下文。

事后我检查了运行痕迹：项目里没有生成 `.claude/` 目录，用户主目录的配置里也没有多出路径记录。审批状态不会提交进仓库——这不是推测，是检查完的结果。

## 六个维度，三条路径

| 维度 | @import | 软链接 | /import 一次性复制 |
|---|---|---|---|
| 仓库内加载 | 3/3 | 3/3 | 3/3 |
| 仓库外引用 | 需要审批弹窗，无头模式下 0/3 | 3/3 | 复制那一刻就冻结 |
| 与源文件保持同步 | 是 | 是 | 否，会漂移 |
| Windows 可移植性 | 没问题 | 受权限和检出设置影响 | 没问题 |
| 能否追加仅供 Claude 使用的段落 | 能 | 不能 | 能 |
| 失败时的信号 | 静默 | 链接断了=文件缺失，能感知 | 没有信号，只是慢慢过期 |

除了第一行，每行三条路径的值都不同。这就是官方文档"随便选一个"这句潜台词站不住的地方——真正拉开差距的是最后一行：链接断了会报文件缺失，人能直接看到；`@import` 和 `/import` 失败时都不出声，只能靠人去查。

Windows 那一格背后还有一层。官方文档写着 Windows 上建软链接需要管理员权限或开发者模式开启，所以文档转而建议 Windows 用户走 `@AGENTS.md` 导入。这条我没在 Windows 上跑过，是把文档原文当结论列出来的，不是测出来的格子——放进这篇是因为它决定了"团队里有没有 Windows 机器"这句判断，不能略过。

## 反方：交互式会话里审批只弹一次，这不就够了吗

有个反驳我预料到了：条件 e 之所以失败，只是因为无头模式没有弹窗可点。真正干活的时候是交互式会话，你点一次批准，之后就一直有效了。

对单机交互场景，这个反驳确实成立。一个人在自己机器上交互式工作，批准确实只需要一次，之后 `@import` 的行为就跟软链接没什么两样，还多一个能追加 Claude 专属段落的好处。这个反驳站得住的范围我认得清楚。

它在三个地方站不住。第一，部署 hook、cron 巡检脚本、CI 流水线里临时起的子智能体——这些场景里根本没有操作者坐在屏幕前，弹窗永远没人点，审批闸门就永远关着。第二，审批绑定在用户和机器上，新来的同事第一次跑就会重新遇到这个弹窗，而按文档说法，一次不小心的拒绝是永久性的。第三，前面已经确认过：审批状态不提交进仓库。今天全靠交互式跑的仓库，明天加个 hook 或接个 cron，规则就会在无人值守路径上静默丢失。

## 明天早上能做什么

给已经把智能体接进 CI 或 git hook 的人一个具体动作：跑 `grep -n '^@' CLAUDE.md`，看看路径有没有指向仓库外。指向仓库外的，要么换成软链接，要么把源文件挪进仓库。

如果今天两条都做不了，至少埋一个金丝雀、从 CI 里测存活。在 AGENTS.md 末尾加一行让智能体输出标记词，然后：

```bash
claude -p 'Reply with exactly the word OK and nothing else.' | grep -q 'ZQ7CANARY' && echo alive || echo silent
```

交互式会话里等价的检查是 `/context`，CLAUDE.md 应该出现在 Memory files 下面。这是官方文档给出的唯一验证方式，无头模式没有这个界面，只能靠上面这行命令。

## 三条路径分别适合谁

拿条件 f 举例：AGENTS.md 和 CLAUDE.md 都在仓库内，用绝对路径写 `@import`，3/3 全过，跟条件 a 的相对路径写法没有差别。这类单体仓库——AGENTS.md 同时喂给别的工具，Claude Code 只是多读一份——`@import` 没有理由不用，还能在导入之外再叠一段 Claude 专属规则，条件 b 的软链接做不到这一点。团队里 Windows 和 macOS/Linux 混跑时，这条路同样成立，因为它从源头上绕开了软链接在 Windows 上要管理员权限这件事。

条件 e 是 0/3，条件 g 换一种链接方式、同样目标在仓库外，结果变成 3/3。主目录里存一份个人惯例、软链接到好几个仓库里用，走的就是这条路，全程碰不到审批弹窗。在 CI、hook、cron 里跑 `claude -p` 的流水线，只要目标在仓库外，就该用条件 g 而不是条件 e。

剩下没测但能推出来的组合：长期靠 `/import` 一次性复制的配置，早晚会偏离前面表格里提到的同步状态；靠拆分导入省 token，官方文档写明了行不通；而在 `core.symlinks` 关闭的 Windows 检出上，软链接必须作为新人入职配置来显式管理。

目标文件在仓库外、又跑在 CI、hook、cron、子智能体等无人值守环境时，`@import` 会在无声中失效，软链接不会；目标在仓库内、团队里有 Windows 机器时，情况反过来。

## 没测的部分

交互式审批弹窗本身，这次实测里一次也没见过，只是从文档推断有这个弹窗，并读到"拒绝后永久禁用"这句话。批准一次能维持多久、拒绝之后有没有恢复路径，官方文档没写，硬盘上也没找到状态文件。Windows 上软链接创建权限、`core.symlinks=false` 检出下的实际表现，没有环境可跑，留白。四跳递归导入的边界没有测。`/import` 命令本身也没跑，条件 c 是用手动一次性复制去近似它的行为。token 开销这次没能单独测出来——缓存创建和缓存读取的波动，比文件大小本身的差异还大，没法把三条路径在 token 上分开。测试数据全部基于 macOS、Claude Code 2.1.233。

把智能体规则收拢成一个文件，一开始像是在整理文档，走着走着就变成了一个授权问题：真正决定规则能不能进到上下文的，是谁有资格解析这条路径。交给智能体的每一份配置文件，都在悄悄变成一种凭证。今天能绕过审批闸门的软链接，没有任何文档承诺它在下一个版本里还能这样走过去。

## 参考资料
- [How Claude remembers your project（Claude Code memory）](https://code.claude.com/docs/en/memory)
- [Claude Code CHANGELOG — 2.1.232](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
