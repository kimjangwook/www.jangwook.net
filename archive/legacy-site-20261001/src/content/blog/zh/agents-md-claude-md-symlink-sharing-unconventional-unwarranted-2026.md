---
title: 用符号链接让 AGENTS.md 和 CLAUDE.md 共用一份文档今天仍然有效，但没有任何文档为此提供保证
description: 两种 AI 编程工具共用一份规则说明书的常用做法，目前只靠文件本身的运气在运转。本文讲清它在什么情况下会失灵，以及哪些部分这次没能核实。
pubDate: '2026-08-31'
heroImage: ../../../assets/blog/agents-md-claude-md-symlink-sharing-unconventional-unwarranted-2026/hero.png
tags:
- AGENTS.md
- CLAUDE.md
- symlink
- AI工具
relatedPosts:
- slug: claude-md-reachability-bound-to-cwd-lazy-loaded-rules-half-obeyed-2026
  score: 0.7
  reason:
    en: The symlink fragility examined here supplies the supporting evidence for the
      previous post's finding that CLAUDE.md loading depends on the session folder,
      not just where the file sits.
    ko: 이번 글이 다룬 CLAUDE.md 심링크의 취약성은, CLAUDE.md가 세션 폴더 기준으로 로딩된다는 기존 글의 규칙 도달 범위 분석이
      없었다면 발견하기 어려웠을 뒷받침 근거를 제공한다.
    ja: 本記事で扱うCLAUDE.mdのシンボリックリンクの脆弱性は、CLAUDE.mdがセッションフォルダを基準に読み込まれるという前記事のルール到達範囲の分析があってこそ見えてくる裏付けの根拠を示す。
    zh: 本文探讨的 CLAUDE.md 符号链接脆弱性，为上一篇关于 CLAUDE.md 依会话文件夹加载的规则适用范围分析提供了支撑证据。
- slug: loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026
  score: 0.7
  reason:
    en: If the symlink trick for sharing CLAUDE.md with AGENTS.md carries no official
      guarantee and can break at any time, reading it alongside the earlier post where
      loaded CLAUDE.md rules get discarded entirely by a single contrary user request
      reveals the full fragility of rules files.
    ko: 심링크로 CLAUDE.md를 AGENTS.md와 공유하는 요령이 공식 보장 없이 언제든 깨질 수 있다면, 그 CLAUDE.md 규칙이
      실제로 로드됐다가도 사용자 반대 요청 한 번에 통째로 버려지는 기존 글과 함께 읽어야 규칙 파일의 취약성 전체가 보인다.
    ja: シムリンクで CLAUDE.md を AGENTS.md と共有する小技が公式保証なしにいつ壊れてもおかしくないなら、その CLAUDE.md ルールがユーザーの反対要求一回で丸ごと捨てられる既存記事と併せて読むことで、ルールファイルの脆さの全体像が見えてくる。
    zh: 既然用符号链接让 CLAUDE.md 与 AGENTS.md 共享的技巧没有官方保证、随时可能失效，那么把它与已有文章中 CLAUDE.md 规则被用户一句相反请求就整个丢弃的情况对照阅读，才能看清规则文件脆弱性的全貌。
---

## 一份说明书喂给两个工具的流行做法

先说这件事和普通上班族有什么关系：很多团队现在靠一套书面规则管住两个 AI 助手，而这套规则今天全靠一个没人担保的"纸条"在撑着。哪天搬家，纸条可能说断就断。

背景是这样的。市面上有工具帮程序员写代码，比如 Claude Code 和 Codex。工具开工前会先读一份说明文件，里面写着"本项目的规矩"。这份文件有两个常见名字：AGENTS.md（给一部分工具看的）和 CLAUDE.md（给 Claude 看的）。内容常常一模一样，于是很多人想了个省事的办法：只写一份，另一份做成"符号链接"。符号链接就是电脑里的便利贴，上面不写内容，只写"真文件在隔壁，去那儿拿"。对使用者来说，两份文件看起来都在，其实只有一份真身。

这个办法目前能用。问题是，它只是今天恰好能用。

## 查了三处文件，都没有找到担保

我这次实际做了什么？翻了三份公开文档：Claude Code 的变更记录（相当于软件的日记本，改动一条条记在里面）、AGENTS.md 的官方标准页、还有 Codex 的官方说明。我想找一句话，写明"链接这种用法我们支持"。结果没有。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-changelog-agents-md-native" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">变更记录中的直接读取条目</span><span class="lm-card__text">三次查询变更记录中,AGENTS.md的提及均为0次。同一记录中CLAUDE.md提及59次,symlink提及72次。未发现直接读取的文档条目。</span><div class="lm-card__numbers"><span class="lm-card__chip">AGENTS提及 0</span><span class="lm-card__chip">CLAUDE提及 59</span><span class="lm-card__chip">链接提及 72</span></div></div>

简单说：软件的日记本里从没写过"链接这种用法我们支持"。现在能用，只是相关文件今天还站在原位。哪天软件换了检查方式，链接就可能突然失效。CLAUDE.md 被记录提到 59 次，AGENTS.md 是 0 次，也就是说日记本里从没出现过"我们会直接读那个文件"的痕迹。当然，日记没写不等于一定没做，这一点后面单独说。

## 测量方法：四组实验，共跑 12 次

为了不只凭印象说话，2026 年 8 月 30 日我在一个隔离的电脑环境里做了实验，全程没有调用 AI 工具本身，只用文档检查和文件操作。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="zh"><span class="lm-card__title">测量步骤</span><ol class="lm-card__steps"><li class="lm-card__text">步骤 1. 在Claude Code的官方变更记录中查找是否有直接读取规则文件的条目。</li><li class="lm-card__text">步骤 2. 尝试测试成对的symlink在32KiB大小限制检查中是否被视为同一个文件。</li><li class="lm-card__text">步骤 3. 将规则文件移动到其他位置后,确认symlink是否仍然正常连接。</li><li class="lm-card__text">步骤 4. 在规则文件标准文档和Codex文档中查找是否有symlink规定。</li><li class="lm-card__text">步骤 5. 不运行AI工具本身,仅通过阅读文档和检查文件得出答案。</li></ol></div>

其中一组要测的是：工具规则文件有 32KiB 的大小上限（32KiB（32768 字节）的容量限制），链接的文件在算大小时会不会被当成同一份。这一组三次全部因为环境故障没能测出结果，属于空白。

## 搬家之后的存活差距

最关键的实验是"搬家"。把整个文件夹从 A 位置搬到 B 位置之后，链接还找得到真文件吗？

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-symlink-survives-relocation" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">移动后的存续</span><span class="lm-card__text">三次中,相对路径链接在移动后均正常连接。而绝对路径链接找不到目标,复制的文件则变成了普通文件而非链接。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">相对链接存续 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">绝对链接存续 0/3</span></div></div></div>

结果分三种。便利贴有两种写法：一种写"真文件在我隔壁那间房"，另一种写"真文件在某某路 351 号"。前者是相对路径，跟着整个文件夹一起走，搬家后 3 次尝试全部正常。后者是绝对路径，把搬家前的老地址原样钉死在纸上，搬完家 3 次尝试全部找不到目标，系统报出"文件不存在"的错误。第三种是干脆复制一份真文件，没有链接问题，但从此要维护两份。

这对大部分用电脑的上班族都有关系：只要项目有一天换了位置（换电脑、换服务器、换目录），用绝对路径链接的那份说明书会悄无声息地断掉。

## 32KiB 大小上限检查停在了哪里

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-symlink-projects-through-32k-boundary" data-lang="zh"><span class="lm-card__badge lm-card__badge--fail">失败</span><span class="lm-card__title">大小限制检查</span><span class="lm-card__text">三次尝试均因文件不存在的错误而中止。大小比较一次也未能执行,被记录为失败。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">成功尝试 0/3</span></div></div></div>

链接的文件到底算不算超长，一次都没测成。原因不是内容问题，是我自己的测试脚本在启动时就报"找不到文件"，三次都死在同一个地方。所以"链接会不会被当成同一个文件来算大小"这个问题，目前既没有证实也没有否定。

## 本文未能核实的部分

这次没有测的：32KiB 上限下链接的真实行为，以及两个 AI 工具运行时到底会不会顺着链接读文件——本文只查了文字，没有调用过工具本身。还有两个细节没读到上下文：变更记录里 72 次提到链接指的都是什么，标准页里唯一一次出现 symbolicLink（也就是'符号链接'的英文原词）的那句话说的是禁止还是允许。下一步就是把这几个空补上，重跑失败的实验，并读一下那句话的完整内容。

## 这件事最后落到哪儿

把判断先亮出来：这个流行的共用办法，不是任何厂商承诺过的功能，只是文件今天还站在原位。相对路径的链接跟着文件夹走，绝对路径的链接一搬家就死——这是文件系统本身的规矩，不是谁的设计。另外要诚实一句：查了日记没找到，不能反过来证明一定没有，真正的答案要看软件实际运行时读不读。

什么情况下我会认输：如果 Claude Code 的变更记录里出现了直接读取 AGENTS.md 的条目，或者在 AGENTS.md 标准页或 Codex 文档里找到一句明确担保链接用法的文字，上面的结论就得收回。本文只依据 2026-08-30 那天的文档快照和文件测量。

最后给你两条具体建议。想退出的人：如果链接断过一次，要么换成"跟着文件夹走"的那种写法，要么干脆复制一份真文件，不要再赌便利贴。想引入的人：如果打算把这套做法定成团队规矩，规矩里别写死"用链接"这一步。可以改用一个自动程序负责创建链接，并且每天检查它还通不通。谁担保谁负责。

## 参考资料

1. [Claude Code CHANGELOG (raw scan target)](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) — Anthropic (raw.githubusercontent.com)
2. [AGENTS.md spec page (symlink 규정 부재 확인 대상)](https://agents.md/) — agents.md
3. [Codex 공식 문서·README (symlink·한도 규정 부재 확인 대상)](https://raw.githubusercontent.com/openai/codex) — OpenAI