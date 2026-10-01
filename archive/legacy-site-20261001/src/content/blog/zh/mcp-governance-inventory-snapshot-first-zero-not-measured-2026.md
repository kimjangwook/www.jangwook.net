---
title: 'MCP 服务器风险检查在没有结果文件时记录为零，先建立区分零风险与无法测量的存储规则'
description: '风险检查工具在结果文件缺失时会把所有项目记录为零分，但零分可能意味着"没有风险"也可能意味着"根本没测成"。在引入评分工具之前，必须先建立"文件不存在就记为失败"的存储规则。'
pubDate: '2026-09-06'
heroImage: ../../../assets/blog/mcp-governance-inventory-snapshot-first-zero-not-measured-2026/hero.png
tags:
- MCP
- 风险检查
- OWASP
- AI安全
relatedPosts:
- slug: mcp-governance-audit-exit-code-zero-fail-open-harness-2026
  score: 0.7
  reason:
    ko: '''MCP 거버넌스 감사에서 exit code 0은 안전을 증명하지 않는다''와 같은 문제를 다른 측정으로 다시 잰 글이다.'
    ja: 「MCPガバナンス監査でexit code 0は安全性を証明しない」と同じ問題を別の実測で捉え直した記事。
    en: Revisits the same problem as 'Exit code 0 does not prove safety in MCP governance audits'
      with a different measurement.
    zh: 用另一组实测重新审视与《MCP治理审计中，退出码0不能证明安全性》相同的问题。
- slug: mcp-server-production-deployment-kubernetes-guide
  score: 0.7
  reason:
    en: If the deployment guide focuses on keeping servers alive, this article shows
      why a live server's score can still signal false safety.
    ko: 배포 가이드가 서버를 살리는 데 집중했다면, 이 글은 살아난 서버의 점수가 왜 거짓 안전을 부를 수 있는지 보여준다.
    ja: デプロイガイドがサーバーを生かすことに焦点を当てたなら、この記事は生きたサーバーのスコアがなぜ偽りの安全を招くかを示す。
    zh: 若部署指南专注于让服务器存活，本文则揭示存活服务器的评分为何仍可能带来虚假的安全感。
---

## 今天你运行了安全检查，屏幕上全是成功，但什么都没留下

你运行了一个安全检查脚本，想看看自己系统里连接的 AI 工具是否安全。屏幕上每一行都显示成功，所有项目都通过了。但当你打开结果文件夹时，里面什么都没有。

这不是小事。安全检查的目的就是留下记录，证明你查过了、查到了什么。如果结果文件是空的，那这次检查等于没做。

这次检查一共运行了 15 次——5 个检查项目，每个项目跑 3 遍。15 次全部显示“成功结束”，但没有任何一次产生一条风险标记。用技术术语说，就是 15 次运行的退出代码都是 0，但风险命中数全是 0。

这就像餐厅卫生检查员去后厨转了一圈，回来在检查表上盖了个“检查完毕”的章，但表上什么都没写。没有勾选任何项目，没有记录任何发现，甚至没有写检查了哪家店。这个章盖得再漂亮，也没人知道后厨到底干不干净。

你真正需要知道的是：这些 AI 工具到底有没有风险？如果没风险，那很好。但如果只是没查出来，那问题就大了。而现在的输出根本分不清这两种情况。

你会明白：安全检查工具显示“成功”，并不等于检查真的完成了。

## 检查工具实际找到的：一个服务器，四个空格

检查工具跑完以后，屏幕上每一行都写着“成功”。但仔细看输出，真正有内容的只有一格。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c1-inventory-enumeration" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">服务器清点</span><span class="lm-card__text">3次运行均正常退出,但没有标记,只列举了analytics-mcp一个服务器的配置项。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">正常退出 3/3</span></div><span class="lm-card__chip">标记 0</span></div></div>

那一格是服务器清单。工具在配置文件里找到了一个叫 analytics-mcp 的服务器。这个文件有 184322 字节，里面记录了 AI 助手可以连接哪些外部工具。analytics-mcp 是唯一被找到的服务器，它的安装方式是 pipx（一种安装程序的工具），连接类型是 stdio。stdio 是一种连接方式，意思是这个服务器和 AI 助手在同一台电脑上直接对话，不经过网络。

除了这一格，剩下四格全是空的。

安装方式评分那一格，参考了一份 6376 字节的说明文件，但最终没有算出任何分数。权限范围评分那一格，输出完全空白，没有给任何服务器打出权限分数。更新检查那一格，需要读取两个快照文件来判断服务器有没有远程更新地址，但这两个文件都不存在。最后汇总那一格，负责把前面所有结果合并成最终报告，结果因为找不到结果文件，直接报错。

这五个格子，每一格都跑了三次，总共十五次。十五次运行，每一次的退出代码都是 0。退出代码是 0，意思是程序正常结束，没有出错。但十五次运行，没有一次产生任何有效发现。工具报告说“全部成功”，实际上什么也没检查出来。

这就好比你去餐厅做卫生检查，手里拿着检查表，但表上什么都没填，只在最后一页盖了个“检查通过”的章。餐厅老板看到章，以为卫生合格了。你也觉得自己完成了工作。但事实上，厨房干不干净、食材新不新鲜，你根本不知道。

检查工具找到的，只是一个服务器的名字。其他所有评估，都是空白。

## 为什么结果全是空的：不是标准太严，是文件根本不存在

检查结果为空，不是因为你的系统太安全，而是因为检查需要的输入文件根本不在那里。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c4-update-absence-remote" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">更新缺失</span><span class="lm-card__text">3次均正常退出,但评估依据文件缺失,未能找到远程地址。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">正常退出 3/3</span></div><span class="lm-card__chip">标记 0</span></div></div>

第四个检查项目是"更新缺失评估"，它需要查看两个快照文件来判断 AI 工具是否有远程更新地址。快照文件就像系统在某个时间点的照片，记录了当时的配置情况。这两个文件——snapshot/.mcp.json 和 snapshot/claude.json——都显示为"文件缺失"，系统输出了一条信息说"没有找到远程 URL"。

第五个检查项目需要汇总前四个项目的结果，它使用一个叫 jq 的工具来读取结果文件。jq 是一个用来读取和整理数据文件的工具，JSON（一种电脑存储数据的常见格式） 是电脑存储数据的一种常见格式。jq 报错说：无法打开 results/c*.json 文件，因为该文件不存在。c* 表示所有以字母 c 开头的文件。结果文件一个都没有生成，所以汇总自然无法进行。

空白结果的真正原因不是评估标准有问题，而是评估所需的输入文件缺失了。

## 最有力的反驳：服务器只有一个，零风险难道不是正常的吗？

你可能会说：我的系统里只连接了一个 MCP（一种让 AI 工具连接外部服务的协议） 服务器（一种让 AI 工具连接外部服务的程序），风险本来就很小，检查结果为零分难道不是正常的吗？

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-owasp-rubric-crosswalk" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">标准表汇总</span><span class="lm-card__text">3次均正常退出,但没有结果文件,汇总工具无法打开文件而失败。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">正常退出 3/3</span></div><span class="lm-card__chip">标记 0</span></div></div>

这个说法在特定情况下是对的。如果你的系统确实只有一台机器、一个服务器、运行了一天，那风险面确实很小。在这种情况下，零分可能是真实的结果。

但问题在于第五个检查项目。即使服务器只有一个，汇总步骤也应该正常执行，生成一份汇总报告。而实际发生的是：汇总工具因为找不到结果文件而直接报错。这不是"零风险"，这是"汇总无法执行"。

换句话说，即使是最有力的反驳，也需要一个前提：结果文件必须正常生成。而这个前提恰恰是这次检查没有满足的。所以，反驳意见本身反而证明了存储规则的必要性——没有文件，连"零风险是正常的"这句话都无从验证。

即使服务器只有一个，汇总步骤的失败也说明这不是正常的零分，而是测量失败。

## 行动指南：先定规则，再谈分数

现在回到最初的问题：为什么成功结束的检查没有留下任何结果？答案已经清楚了——因为检查工具把"没有文件"和"零风险"记成了同一个东西。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="zh"><span class="lm-card__title">结论</span><p class="lm-card__takeaway">所有格子的标记均为0,汇总也失败,因此无法通过本实验判定哪个服务器在哪个格子有问题。</p></div>

如果你已经在运行风险检查工具，今天就去查看检查日志。看看有没有这样的情况：程序显示成功结束，但结果文件是空的。如果有，把这种情况标记为"无法测量"，而不是"零风险"。

如果你正准备引入风险检查工具，先不要急着选评分标准。第一步是建立存储规则：检查所需的配置文件快照必须保存，每个检查项目的结果必须写入文件。文件不存在，就记为失败。这个规则不建立，任何评分工具都会把"没测成"伪装成"零风险"。

在引入风险评分工具之前，先确保检查输入和结果都能以文件形式留存。

## 本文未能核实的部分

- 快照文件为什么没有生成——是生成步骤缺失，还是保存路径不同——本次测量无法确定。
- 本次实验是在单台机器、只有一个服务器的环境中进行的一次测量，不适用于有多台远程服务器的环境。
- 这个判断出错的条件是：在结果文件正常生成的情况下，所有检查项目仍然全部显示零风险标记，那时"零分等于零风险"才能成立。

## 参考资料

1. [OWASP MCP Governance and Risk Project](https://github.com/OWASP/OWASP-MCP-Governance-and-Risk-Project)（OWASP）
2. [Model Context Protocol documentation](https://modelcontextprotocol.io)（modelcontextprotocol.io）
3. [Claude Code documentation — settings and MCP（一种让 AI 工具连接外部服务的协议） configuration](https://code.claude.com)（code.claude.com）