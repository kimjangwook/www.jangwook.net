---
title: 'MCP 路线图上的功能在 MCP 规范里还不存在'
description: '本文实测了两件事：一个程序连接服务器的那一刻会把多大一份工具清单搬进来，以及官方路线图上写着的功能在正式规范文件里出现了几次。结论是：菜单上写的东西，不等于厨房里真的有。'
pubDate: '2026-09-02'
heroImage: ../../../assets/blog/mcp-roadmap-vs-schema-catalog-prefetch-measured-2026/hero.png
tags:
- MCP
- 实测
- 规范
---

先说这件事对用电脑工作的你意味着什么。你在软件里看到一句“官方计划里写着这个功能”，和你真正能用上它，中间隔着一段没人告诉你的距离。这篇文章用数字量出了这段距离。

先解释一个名字。MCP 是一种让程序和外部工具互相说话的通用接口，就像餐厅前厅和后厨之间的传菜口。它有两类文件：一类叫路线图，是官方写的“我们打算做什么”；另一类叫规范，是白纸黑字写死的“现在到底是什么样子”。菜单是菜单，厨房是厨房。菜单上写了，不代表厨房今天就有这道菜。

## 测量方法与测量对象

这次实际测了两件事。

第一件，量一个程序在“连接的一瞬间”搬进来多少东西。这里说的程序，指的是替你操作工具的助手类客户端，这次实测用的是其中一个名叫 claude 的产品。连接的时刻，它会向对方要一份工具清单，也就是“这家店到底卖哪些东西”的目录。

第二件，数路线图上的功能在规范文件里出现了几次。把规范的历史版本（2025-06-18、2025-11-25、2026-07-28 和草稿版，一共四个版本）拿出来，一个一个数关键词。数的是 DPoP、渐进式发现、webhook、ID-JAG 这四项，外加一项叫 tasks 的。这些名字不用记，只要知道它们都是路线图上写过优先级的条目。

具体步骤是逐项测量并清点结果。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="zh"><span class="lm-card__title">测量步骤</span><ol class="lm-card__steps"><li class="lm-card__text">步骤 1. 运行 schema-surface-classify 并清点结果。</li><li class="lm-card__text">步骤 2. 运行 docs-corpus-surface-classify 3次并清点结果。</li><li class="lm-card__text">步骤 3. 运行 claude-catalog-200-page20 3次并清点结果。</li><li class="lm-card__text">步骤 4. 运行 codex-catalog-200-page20 3次并清点结果。</li><li class="lm-card__text">步骤 5. 运行 claude-catalog-20-singlepage 3次并清点结果。</li></ol></div>

## 连接时刻目录大小实测

这里要说的数字，代表程序一进门就端上来的分量。

claude 连接时就是这种做法：目录里有 200 个工具，它一次全部搬走。实测里有一个装着 200 个工具的目录，claude 连接时把清单从头翻到最后一页，一共搬进 62,708 字节的内容。作对比的是小目录：只有 20 个工具时，一份清单是 6,235 字节。大目录的搬进量正好是小目录的 10.06 倍。3 次测量全部是这个结果。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-catalog-200-page20" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">claude-catalog-200-p</span><span class="lm-card__text">可用运行 3/3 次,条件满足 3 次。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">运行成功 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">条件满足 3/3</span></div></div></div>

关键在这里：规范本身允许分页，也就是“先看一页，想看再翻”。这个功能从 2025-06-18 的版本起就写在规范里了。也就是说，分页这个做法是有规范依据的。要不要一口气翻完，是客户端自己决定的做法，不是规范要求它这么做。同一份规范，可以支持两种客户端：一种一页一页地取，一种连上就一次取完。对你实际有影响的是：装了 200 个工具的服务器一接上，就有大约 10 倍于小目录的内容占着资源，装之前就该把这笔开销算进去。

## 四个版本规范中的关键词统计

这一节说的是：路线图上写了的东西，规范里到底有没有。

数出来的结果很干净。DPoP 这类身份验证技术、渐进式发现、webhook 这类服务器主动通知的技术、ID-JAG 这类安全凭证，这四项在四个版本的规范里出现次数全部是 0 次。它们只活在路线图和章程这类说明文字里。也就是说，菜单上印了四道菜，厨房四个版本里连一次都没出现过。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-schema-surface-classify" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">schema-surface-class</span><span class="lm-card__text">可用运行 3/3 次,条件满足 3 次。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">运行成功 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">条件满足 3/3</span></div></div></div>

这里得替路线图说一句公道话。路线图本来就是写“还没来的东西”的文档，把它当规范来读，是读者的问题，不是路线图的错。但是，最后落到我身上的判断是，实测里有一项确实进过厨房，说明这些条目的“到货距离”各不相同，而文档表面上看不出差别。

## tasks 在规范中的进出

这一节讲唯一真的写进过规范的那一项。

tasks 这一项，在 2025-11-25 的规范里出现了 25 次。到了现在的 2026-07-28 版本，出现次数变成 0 次。它进了规范，又出去了。而路线图在 2026-08-22 更新时，还把它和 DPoP 等项一起列为优先事项。原因是重新设计还是挪去了别的地方，这次没有查到。

你需要留意的是：同样一句“计划里有”，有的是从未写进过规范的，有的是写进去之后又被移除的。五道菜用同一种笔迹写在同一张菜单上，但离灶台的距离完全不同。只看菜单，你分不出来。

## 引用之前，先看这份文档是哪一层

这一节给出这篇文章希望读者带走的一个做法。

以后读到“官方文档里说了 XX”这样的句子，第一句该问的是：这份文档是哪一层的？同一个组织管理的文档，其实分成好几层：路线图是打算，章程是理念，规范是定稿，程序实现是真实。四层更新得有快有慢，约束力有大有小。要引用，就引最硬的那层——具体哪个版本的规范里出现了几次。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="zh"><span class="lm-card__title">结论</span><p class="lm-card__takeaway">未能生成自动摘要,仅载入测量数字。</p></div>

想退出的人，也就是正在提供工具清单的一方，那就这样做：清单接通那一刻会被一次性全部读走，这个大小要当成固定开销提前算进去。清单有 200 个工具，就要按首份清单约 10 倍、也就是 62,708 字节的量来算。

想进入的人，也就是读文档决定要不要采用的一方，那就这样做：把“计划里写着”这行字划掉，换成“在第几个版本的规范里出现了几次”再写进材料。

## 本文未能核实的部分

这次没有量的东西有三个。另一个叫 codex 的客户端因为用量限制一次都没跑成，所以“各家程序都这样搬”这种复数说法没有依据。字节数折算成实际占用比例的数字没有算。这份 62,708 字节的提前搬运对回答质量和速度的影响也没有量。接下来要核实的是：什么条件下客户端会停在第 1 页，以及 tasks 被移出规范的经过。这个判断在什么条件下会错：如果现在的规范文件里真能找到路线图上的某项功能，或者规范里有要求客户端必须把清单翻到最后一页的句子，这篇文章的判断就作废。

## 参考资料

1. [MCP Roadmap](https://modelcontextprotocol.io/development/roadmap) — modelcontextprotocol.io
2. [MCP JSON Schema (2025-06-18, 2025-11-25, 2026-07-28, draft)](https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2026-07-28/schema.json) — github.com/modelcontextprotocol
3. [MCP 문서 코퍼스 (llms-full.txt, 약 2.37MB)](https://modelcontextprotocol.io/llms-full.txt) — modelcontextprotocol.io