---
title: 规则文件能否被 Claude Code 读到,取决于会话从哪个文件夹启动,而不是规则放在哪里
description: CLAUDE.md 规则文件放的位置一样,会话启动的文件夹不一样,被读到的结果就完全不同。对话中途才被读到的规则文件,遵守率只有一半。
pubDate: '2026-08-30'
heroImage: ../../../assets/blog/claude-md-reachability-bound-to-cwd-lazy-loaded-rules-half-obeyed-2026/hero.png
tags:
- claude-code
- claude-md
- ai-agents
relatedPosts:
- slug: loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026
  score: 0.7
  reason:
    en: If a rules file reaches or misses the model depending on where the session
      starts, pairing that with the earlier finding that a single contrary user request
      makes Claude Code discard the entire CLAUDE.md completes the full picture of
      how fragile those rules are.
    ko: 규칙이 세션 시작 위치에 따라 모델에 도달하기도 하고 놓치기도 한다면, 그 규칙이 일단 도달한 뒤 사용자 요청 하나로 통째로 버려지는
      이전 실험의 결과와 이어서 규칙의 취약점 전체 그림이 완성된다.
    ja: ルールがセッション開始場所によってモデルに届いたり届かなかったりするなら、届いた後そのルールがユーザーの一言で丸ごと捨てられるという前回の実験結果と合わせて、ルールの脆弱性の全体像が見えてくる。
    zh: 既然规则文件能否送达模型取决于会话从哪个目录启动,再结合此前发现的用户一句反对就会让 Claude Code 丢弃整份 CLAUDE.md,就能拼出规则脆弱性的完整图景。
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: If the session's launch folder decides whether CLAUDE.md reaches the model,
      reading this alongside the companion post — where 219 runs show declared rules
      like robots.txt and AGENTS.md failing silently with no error — explains why
      no rules file should ever be trusted just because it exists.
    ko: 세션 시작 폴더에 따라 CLAUDE.md가 모델에 도달하느냐 마느냐가 갈린다면, 이번 실험은 규칙 파일이 도달했더라도 내용이 잘려도
      에러 없이 조용히 무시되는仙境을 219런으로 검증한 선임 글과 나란히 읽어야 왜 모든 규칙 파일이 '선언됐다=적용됐다'가 아닌지 완성됩니다.
    ja: セッション開始フォルダでCLAUDE.mdの到達が決まる本実験と並べて読むと、本編の219ラン実測が明かす「ルールファイルが宣言されてもエラーなしで静かに無視される」仕組みがなぜすべてのルールファイルに当てはまるのかがつながります。
    zh: 如果说会话启动目录决定 CLAUDE.md 能否抵达模型，那么结合姊妹篇用 219 次实测证明 robots.txt 与 AGENTS.md 等声明规则会静默失效且不报错的结论，你就能完整理解为什么“声明了规则”绝不等于“规则生效”。
---

先说结论,再说这对你的生活和工作意味着什么:给 AI 编程助手写一份规则文件,写得再好也没用,关键是看你在哪个文件夹里启动它。事情发生在 2026 年 8 月的一次实测里。规则文件在对话开始时就已经在的,36 次里 36 次都被遵守了。规则文件是聊到一半才被打开看到的,6 次里只有 3 次被遵守。同样是那份文件,待遇差了一倍。

## 规则文件的摆放位置和会话的启动位置

Claude Code 是一个 AI 编程助手。你在电脑上一个文件夹里启动它,跟它对话,让它帮你写代码、改代码。

CLAUDE.md 是一种规则文件。你可以把"我们的代码要怎么写、什么不能做"之类的约定写进去,Claude 每次干活时会参考它。

很多人以为,只要把规则文件放在项目里的某个位置,AI 就会自动看到。这次实测发现不是这样。决定规则能不能被读到的,不是文件放在哪里,而是你在哪个文件夹里打开程序。

打个比方。办公室墙上贴了一张通知,经过的人都能看到。同样的内容,如果由同事在走廊里口头转达一句,很多人会当耳旁风。文字没变,送达方式和送达时机变了,待遇就变了。

对用这类工具的人来说,结论是:想让一条规则被遵守,就要保证它在对话开始时就出现在 AI 面前。

## 测量过程

实测的做法很朴素。搭了一个四层深的文件夹结构:外面一个目录,里面是仓库,也就是存放一个项目全部代码的文件夹,再里面是 packages 文件夹,最里面是 api 文件夹。把同一种规则文件分别放在 5 个位置:仓库的外面上方、仓库根目录、中间层、最深层,以及一个故意不会被当作规则文件的假文件 NOTES.md。

在每个位置,分别在仓库根目录和最深层文件夹启动程序,各跑 6 次,一共 60 次。每次都会问 AI 一个问题:如果你看到某个约定,就把约定里的一句暗号复述出来。暗号出现在回答里,就判定规则确实到了 AI 手上。

用 NOTES.md 做对照是必要的。它不会被任何读取流程认领,如果它也偶尔"到达",说明判断标准本身有问题。结果 NOTES.md 是 0 次/6 次,这个 0 才能证明"没读到"的判断标准站得住。

机器环境是 macOS 26.5.2,claude 2.1.233 搭配 sonnet 模型,git 2.50.1。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="zh"><span class="lm-card__title">测量步骤</span><ol class="lm-card__steps"><li class="lm-card__text">步骤 1. 将指令文件分别放在仓库上方、仓库根目录、中间和最深层文件夹四处。</li><li class="lm-card__text">步骤 2. 分别在仓库根目录和最深层文件夹启动程序,各执行六次。</li><li class="lm-card__text">步骤 3. 如果模型说出文件内的密码字符串,则判定为已到达。</li><li class="lm-card__text">步骤 4. 通过在相同文件夹下运行不会被当作指令文件读取的假文件,确认没有泄漏。</li><li class="lm-card__text">步骤 5. 另外确认了最深层文件夹的文件需要发生文件读取才会加载的规则。</li></ol></div>

## 启动位置改变了规则的到达结果

第一个发现:程序会一路向上,把启动文件夹的所有上层祖先里的 CLAUDE.md 全部读进来,甚至越过仓库的根,读到仓库外面的文件。放在仓库外面上方的文件,6 次里 6 次都到达;放在仓库根目录的,两种启动位置下都是 6/6。

第二种情况更有意思。同一个文件 repo/packages/CLAUDE.md,也就是说在仓库中间那一层——结果完全取决于从哪儿启动:

- 从仓库根目录启动:0 次/6 次,一次都没到。
- 从最深层文件夹启动:6 次/6 次,全部到达。

同一个文件,一个字没改,只是启动的文件夹不同,结果从零变成全部。也就是说,决定规则到不到的是启动位置,不是文件位置。

落到你身上,意思是:如果你的自动化流程从仓库根目录启动 AI,而规则放在 packages 里,那这条规则对它来说就等于不存在。

## 对话中途才到达的规则文件受到的待遇

第二个发现更微妙。放在最深层的文件,当你只是提问时,0 次/6 次,完全没到。但当 AI 实际打开那个文件夹里的文件干活时,规则就到了——6 次/6 次全部到达。这叫延迟加载:文件不提前进来,用到的那一刻才进来。

问题在后面。这 6 次延迟到达的规则,全部被模型归类为"提示注入"。提示注入是 AI 安全里的一个担心:有人把不该说的话塞进 AI 看到的内容里,诱导它不听主人的话。模型把这份规则文件当成了这种可疑内容。分类归分类,实际遵守呢?6 次里只有 3 次。

对比一下启动时就加载的规则:36 次里 36 次遵守,而且 36 次里没有一次被怀疑。

同样的文字,一开始就拿到手的是权威,干活路上顺手捡到的是嫌疑对象。文件本身没有任何变化,变化的是它到达的时机和通道。

这就是为什么"放到位"还不保险。如果你的规则需要强制力——比如安全红线——放在深处靠延迟加载送达,就等于让规则带着可疑的身份到达,有一半的概率被无视。

## codex 连一条数据都没能留下的原因

这次实验原本还想对比另一个工具 codex 0.147.0。它一共试了 10 组共 60 次,全部因为用量限额而失败——模型连一句话都没能回答,没有任何可判定的数据。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-codex-mid-leafcwd" data-lang="zh"><span class="lm-card__badge lm-card__badge--fail">失败</span><span class="lm-card__title">codex 中间文件,深层运行</span><span class="lm-card__text">六次全部是程序无响应崩溃,没有可判定的数据。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">无响应 6/6</span></div></div></div>

所以"不同工具找规则的规矩是不是不一样"这个问题,这次的数据完全答不了。60 次实验的成本花了,comparison 这条轴是空的。

## 结论

两件事可以确定。规则文件到不到,看的是会话从哪个文件夹启动,不是文件放在哪里。放在中间层 packages 的文件,从根目录启动就是 0/6,从深层启动就是 6/6。对话中途才到达的规则,即使到了,也只有 3/6 被遵守,而一开始就在的 36/36 全部遵守。

Claude 只认 CLAUDE.md 这个文件名,不认 AGENTS.md——官方文档写得很直白:

> Claude Code reads `CLAUDE.md`, not `AGENTS.md`.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs (loader)](https://code.claude.com/docs/en/memory)

AGENTS.md 是另一套社区通用的约定文件名:

> AGENTS.md complements this by containing the extra, sometimes detailed context coding agents need.
> — [AGENTS.md](https://agents.md/)

换句话说,连给规则文件取什么名字,本身就是它能否被读到的条件。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="zh"><span class="lm-card__title">结论</span><p class="lm-card__takeaway">Claude 总是读取启动文件夹及其祖先文件夹的指令,而下方子文件夹的指令只有在该文件夹打开或读取文件时才被读取;Codex 在本次实验中完全没有响应,无法进行比较。</p></div>

具体怎么做,分两种情况:

- 想省掉麻烦的人——你的自动化流程总是从同一个文件夹启动 AI,而且那些任务不会打开别的文件夹的文件。那么守得住的规则,只放在从启动位置向上能看到的文件里。
- 想加规则的人——你平时在各个子文件夹之间跑来跑去,想往子文件夹的规则文件里塞重要约定:那么必须遵守的规则往上提,子文件夹里的文档只当参考资料。

## 本文未能核实的部分

这次没有测,或测不了的东西有三样。一是 codex 那 60 次全死了,它到底是什么行为,这个数据答不了,计划 2026-09-15 重试。二是每次只跑 6 次,"一半被丢掉"这个 3/6,样本太小,只能当一个方向性的观察,不能当成精确比例。三是延迟到达的规则被怀疑,到底是因为它到得晚,还是因为它是"打开文件"这个通道进来的,这次的设计分不开这两件事,下回需要单独隔离——接下来要核实的就是这个,外加 3 次遵守和 3 次丢弃的分界点在哪。

这个判断会在什么条件下错。如果不管从哪个文件夹启动,规矩都在,规则就照样到。这种情况下,本文的判断就是错的。实际上它是 36/36 对 3/6,没有走到那一步。

## 参考资料

1. [Manage Claude's memory (CLAUDE.md) / Claude Code Docs (loader)](https://code.claude.com/docs/en/memory) — Anthropic (code.claude.com)
2. [AGENTS.md](https://agents.md/) — agents.md