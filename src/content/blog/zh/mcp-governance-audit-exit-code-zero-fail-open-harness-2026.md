---
title: 'MCP治理审计中"成功退出"并不证明成功 — 15次运行全部以exit 0结束，但测量实际失败了'
description: '你的验证管道今天又亮起了绿灯，但那个绿灯可能什么都没测到。15次运行全部以exit 0结束，却没有产生任何实际测量结果——成功信号与真实结果之间出现了断裂。'
pubDate: '2026-09-06'
heroImage: ../../../assets/blog/mcp-governance-audit-exit-code-zero-fail-open-harness-2026/hero.png
tags:
- MCP
- 治理审计
- 验证管道
- exit code
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    ko: '''규칙이 잘려도 에러는 나지 않는다 robots.txt와 AGENTS.md 219런 실측''와 같은 문제를 다른 측정으로 다시 잰
      글이다.'
    ja: '「ルールが届かないとき処理は止まらず素通りする: robots.txtとAGENTS.mdの実測」と同じ問題を別の実測で捉え直した記事。'
    en: Revisits the same problem as 'robots.txt and AGENTS.md both fail open' with
      a different measurement.
    zh: 用另一组实测重新审视与《规则没有生效，为什么两边都当成通过了》相同的问题。
- slug: mcp-builtin-vs-external-harness-cost-28x-measured-2026
  score: 0.7
  reason:
    en: This piece on exit code 0 masking failed measurements forces a re-check of
      the earlier claim that harness choice drives the 28x cost gap.
    ko: 측정 실패를 성공으로 위장하는 exit code의 함정을 다룬 이번 글이, 하네스 선택이 비용 격차를 만든다는 기존 분석의 신뢰성을
      다시 검증하게 만든다.
    ja: 終了コード0が測定失敗を隠す問題を扱う本稿は、ハーネス選定がコスト差を生むという既存分析の信頼性を再検証させる。
    zh: 本文揭示退出码0掩盖测量失败的问题，促使你重新审视此前关于工具链选择导致28倍成本差异的结论。
---

## 你的验证管道今天又亮了绿灯，但那个绿灯可能什么都没测到

你的验证管道今天又亮了绿灯。屏幕上写着"成功"，日志里是干净的exit 0。你松了一口气，觉得一切正常。

但那个绿灯可能什么都没测到。

想象一个学生交了白卷，却在试卷上写了"已全部作答"。老师看到"已作答"三个字，就给了通过。这个学生确实完成了"交卷"这个动作，但答案一个字都没写。

验证管道也会这样。它报告"成功"，但这个成功可能只意味着"程序跑完了"，不意味着"测量做完了"。

这次实验里，一个治理审计管道连续15次报告成功。每次运行都以exit 0结束——这是程序正常退出的标准信号。但仔细检查后发现，这15次"成功"没有一次真正完成了测量。

你的验证管道可能也在做同样的事。它告诉你"没问题"，但也许它根本没看。

## 15次运行全部显示hits=0，这个数字可能不是测量结果，而是空结果

这次实验把治理审计拆成5个单元格，每个单元格运行3次，一共15次运行。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="zh"><span class="lm-card__title">测量步骤</span><ol class="lm-card__steps"><li class="lm-card__text">步骤 1. 从测试框架配置文件中列举已连接的MCP服务器列表。</li><li class="lm-card__text">步骤 2. 将各服务器代入OWASP标准的安装架构格进行评分。</li><li class="lm-card__text">步骤 3. 尝试以同样方式评估权限范围格。</li><li class="lm-card__text">步骤 4. 更新缺失格尝试查找远程地址依据文件来评估。</li><li class="lm-card__text">步骤 5. 最后尝试将整体结果对应到OWASP标准表进行汇总。</li></ol></div>

15次运行全部以exit 0结束。15次运行全部显示hits=0。hits是"命中数"，意思是审计发现了多少个问题。OWASP是一个专门研究软件安全风险的国际组织，它制定了一套评估MCP服务器安全性的标准。MCP是"模型上下文协议"，是AI助手连接外部工具和数据的标准方式。这次审计就是拿OWASP的标准去检查MCP服务器的配置是否安全。

15次运行，hits全是0。一个警告标志都没有。

看起来像是"没发现问题"。但真的是这样吗？

第一个单元格做的是服务器清单枚举，就是列出配置文件里有哪些MCP服务器。3次运行，exit 0，hits=0。它确实找到了一个叫analytics-mcp的服务器，配置信息来自一个184322字节的claude.json文件。这个文件是Claude Code的配置文件，184322字节说明它包含大量设置。

第二个单元格做的是安装模式评分，就是检查服务器的安装方式是否符合安全标准。3次运行，exit 0，hits=0。但它只读了一个6376字节的说明文件，根本没有算出任何分数。

第三个单元格做的是权限范围评分，就是检查服务器被授予了多大的权限。3次运行，exit 0，hits=0。但它的输出完全是空的。一个字都没有。

第四个单元格做的是远程更新检查，就是看服务器有没有遗漏安全更新。3次运行，exit 0，hits=0。但它连检查所需的文件都没找到。

第五个单元格做的是综合汇总，就是把前四个单元格的结果汇总起来。3次运行，exit 0，hits=0。但它报错说找不到结果文件。

15次运行，全部exit 0，全部hits=0。但仔细看，没有一个单元格真正完成了测量。

hits=0这个数字，可能不是"没发现问题"，而是"根本没看"。

## 快照文件缺失和汇总失败，都伴随着成功退出码一起出现



<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-owasp-rubric-crosswalk" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">标准表汇总</span><span class="lm-card__text">3次均正常退出,但没有结果文件,汇总工具无法打开文件而失败。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">正常退出 3/3</span></div><span class="lm-card__chip">标记 0</span></div></div>

第四个单元格需要检查远程服务器有没有安全更新。它先要读取两个快照文件，snapshot/.mcp.json和snapshot/claude.json。这两个文件是之前保存的配置备份，用来对比当前配置有没有变化。

但这两个文件都不存在。系统显示MISSING_FILE，意思是"文件缺失"。接着又显示NO_REMOTE_URL_FOUND，意思是"没有找到远程地址"。没有文件，没有地址，这个检查根本没有依据。

但它还是以exit 0结束了。

第五个单元格更明显。它要做综合汇总，需要读取前四个单元格生成的结果文件。它尝试打开results/c1.json、results/c2.json这些文件，但系统报错：jq: error: Could not open file results/c*.json: No such file or directory。jq是一个处理JSON数据的工具，它说找不到这些文件。

结果文件根本没生成。但第五个单元格还是以exit 0结束了。

这就像做菜。菜谱上写着需要鸡蛋、面粉、糖。你打开冰箱，发现什么都没有。但你对着空冰箱说"菜做好了"，然后关上了冰箱门。

exit 0的意思是"程序正常结束"。但程序正常结束，不代表它做了该做的事。它可能什么都没做，只是走完了流程。

## 成功退出码和实际产出之间的不一致，为什么会反复出现

为什么程序报告成功，却什么都没做？

看这次实验的结构。整个审计被拆成5个单元格，每个单元格独立运行。每个单元格都有自己的脚本，脚本负责两件事：执行检查，返回退出码。

问题出在这里：脚本的退出码和脚本的产出是分开的。脚本可能返回exit 0，表示"我跑完了"，但它的产出——结果文件、输出内容——可能是空的，甚至根本不存在。

这次实验里，这种不一致在3个单元格里反复出现。第二个单元格只读了一个说明文件，没有算出分数。第三个单元格输出完全是空的。第五个单元格报错说找不到结果文件。但它们都返回了exit 0。

一个可能的原因是：脚本把"运行完成"和"运行成功"混为一谈。脚本只要跑完了，就返回exit 0。至于跑的过程中有没有真正完成检查，有没有生成结果文件，脚本不管。

也可能是快照步骤失败了，但后续步骤没有停下来。第四个单元格需要快照文件，但文件缺失。按理说，文件缺失应该让整个流程停下来。但流程没有停，后面的单元格继续运行，继续返回exit 0。

具体到第三个单元格为什么输出完全是空的，这次实验无法确定原因。没有管道代码，不能下结论。但可以确定的是：exit 0和空输出同时出现，这个组合本身就是危险的信号。

## hits=0可能被解读为"安全"，但这种解读只在特定条件下成立

有人会说：hits=0不是好事吗？一个警告都没有，说明服务器很安全。

这个说法在一种情况下是对的：如果测量真的完成了，hits=0确实意味着没发现问题。

但这次实验里，测量没有完成。快照文件缺失，汇总失败，输出为空。在这种情况下，hits=0不意味着"安全"，只意味着"没测到"。

问题在于：你无法区分"没发现问题"和"没测到"。两者都显示hits=0，都显示exit 0。

这次实验原本的预期是：在至少2个评估维度上发现多个警告标志。但实际结果是：一个标志都没有，而且测量过程本身失败了。所以，预期中的"是否发现多个警告"这个问题，根本没法回答。

把hits=0解读为"安全"，在测量正常完成的管道里是合理的。但在这次实验这种测量失败的管道里，这种解读是危险的。它让你以为系统是安全的，实际上你什么都不知道。

## 明天就去检查你的管道：exit 0但产出为空的情况，你的管道能发现吗



<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="zh"><span class="lm-card__title">结论</span><p class="lm-card__takeaway">所有格子的标记均为0,汇总也失败,因此无法通过本实验判定哪个服务器在哪个格子有问题。</p></div>

如果你所在的团队靠exit 0来判断验证是否通过，请先做一个测试：故意让一个验证步骤不生成结果文件，或者让输出为空，然后看管道会不会报错。如果管道照样显示"成功"，那你的管道就有同样的问题。

修复方法很简单：在判断成功之前，先检查结果文件是否真的生成了，输出是否真的非空。这个检查只需要一行命令，成本几乎为零。

如果你所在的团队已经明确规定了产出文件的路径和最少警告数量，那这次实验对你来说只是确认了你的做法是对的。你的管道已经基于实际产出做判断，不需要改变。

这次实验的发现是：exit 0只是一个信号，不是证明。真正的证明，是结果文件存在，输出非空，测量完成。

## 本文未能核实的部分

- OWASP标准下的实际警告判定没有被测量到。汇总步骤没有完成，所以无法知道按OWASP标准应该发出哪些警告。
- 其他管道、其他审计脚本是否也存在同样的"假成功"问题，这次实验无法证明。这次实验只观察了一个管道、一个配置文件、一天之内的15次运行。
- 这个判断在什么条件下会错：如果某个管道在返回exit 0的同时，结果文件总是存在且内容总是非空，那这个管道就不存在"假成功"问题。

## 参考资料

1. [OWASP MCP Governance and Risk Project](https://github.com/OWASP/OWASP-MCP-Governance-and-Risk-Project)（OWASP）
2. [Model Context Protocol documentation](https://modelcontextprotocol.io)（modelcontextprotocol.io）
3. [Anthropic Claude Code documentation](https://docs.anthropic.com)（docs.anthropic.com）
4. [Claude Code settings and configuration](https://code.claude.com)（code.claude.com）