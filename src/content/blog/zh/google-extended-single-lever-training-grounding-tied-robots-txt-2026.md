---
title: 'Google-Extended 把 AI 训练和引用绑在同一个开关上，只有 OpenAI 的爬虫可以分开设置'
description: '想让文章继续出现在搜索结果里，同时拒绝被 AI 学习，这种组合在 OpenAI 一侧有官方文档保证。Google 的 Google-Extended 没有提供这种拆分，关掉学习的同时引用通道也会一起关闭。'
pubDate: '2026-09-03'
heroImage: ../../../assets/blog/google-extended-single-lever-training-grounding-tied-robots-txt-2026/hero.png
tags:
- robots.txt
- Google-Extended
- AI爬虫
relatedPosts:
- slug: robots-snippet-controls-ai-overviews-2026
  score: 0.7
  reason:
    en: After learning how robots.txt tokens split search from AI training, read on
      to see measured results for the snippet directives that decide whether AI Overviews
      cite your page.
    ko: robots.txt로 크롤러별 차단 정책을 잡았다면, 이번 글은 AI Overview에 내 페이지가 인용될지 결정하는 스니펫 지시자
      실측 결과까지 이어서 확인할 수 있다.
    ja: robots.txtでのクローラー別制御を理解したら、次はAI Overviewに自分のページが引用されるかを決めるスニペット指示子の実測結果を確認するとよい。
    zh: 了解 robots.txt 如何按爬虫分别控制训练与搜索后，接着实测决定 AI Overview 是否引用你页面的代码片段指令。
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: This post digs deeper into per-token differences in robots.txt, filling in
      the fine-grained decisions needed to put the earlier 2026 AI crawler control
      strategy into practice.
    ko: 이 글은 robots.txt 토큰별 차이를 더 깊게 파고들며, 앞서 소개한 2026년 AI 크롤러 제어 전략을 실제 설정으로 옮길 때
      필요한 세부 판단을 채워 줍니다.
    ja: 本記事はrobots.txtのトークンごとの違いを掘り下げ、先の2026年AIクローラー制御戦略を実際の設定に落とし込む際の細かい判断を補ってくれます。
    zh: 本文深入剖析robots.txt各令牌的差异，补充将此前2026年AI爬虫控制策略落地时所需的细粒度判断。
- slug: search-console-ai-features-opt-out-vs-official-docs-gap-2026
  score: 0.7
  reason:
    en: If this post maps how AI crawler tokens differ per provider, the follow-up
      piece shows what actually happened when the official docs were searched for
      the opt-out switch and only an inclusion lever turned up.
    ko: AI 크롤러 제어 토큰이 providers마다 어떻게 다른지 이 글에서 다뤘다면, 그 스위치를 실제 공식 문서에서 찾아 헤맨 격차의
      실체는 기존 글에서 확인할 수 있다.
    ja: robots.txtのトークンがプロバイダごとにどう違うかを本稿で解説するなら、そのスイッチを公式ドキュメントで探して見つかった「包含レバー」の実態は、既存記事で確認できる。
    zh: 本文按供应商拆解 robots.txt 令牌的差异,而既有文章记录了在官方文档中寻找退出开关时只找到“包含”杠杆的落差真相。
---

## 你发的文章会不会被 AI 学走，取决于一个叫 robots.txt 的文件

我自己写的东西，AI 能不能拿去学习，今天是可以自己定的。定的办法就是网站根目录下一个叫 robots.txt 的文本文件。这个词可以理解为"机器人守则"，就是你写给各家爬虫看的说明书。爬虫是一种自动访问网页的程序，AI 公司用它来读你网站上的内容。

想象学校门口有一份访客名单。你在名单上写：这位可以进来，那位请别来。robots.txt 就是这份名单。名单上一行写一个"访客"的名字，再写它可以去哪里、不可以去哪里。

今天打开这份名单，想找一种写法：让文章继续出现在搜索结果里，同时禁止 AI 学习。找的结果是，各家公司的答案不一样。

实际操作时你会发现，不同公司的 robots.txt 提供的控制粒度并不一样。同一条指令，在这家的 robots.txt 里写得进去，在那家的文件里却写不了。

## 我网站的 robots.txt 里，Google-Extended 只出现在注释里，没有出现在规则里

robots.txt 是一个放在网站根目录的文本文件，爬虫会先读它，再决定能拿什么。这个文件的实测结果是 HTTP 200，也就是请求成功，一共 22 行，最后一行是 sitemap 的地址。sitemap 是一份列着网站所有页面位置的清单，方便爬虫逐页查看。也就是说，文件本身是活的、能被正常读取的。

这份文件里真正管事的规则部分，只有 User-agent: * 这一组。星号的意思是“对所有爬虫”。这一组下面写的是 /ko/blog/en/ 这类跨语言路径的禁止访问规则。仅此而已。

Google-Extended 这个名字也出现在文件里，但只在注释里。注释是写给站长自己看的说明文字，爬虫不会执行它。注释里写着两件事：一是“学习阻断组（GPTBot、ClaudeBot、CCBot、Google-Extended）已经移除”，二是 Google-Extended 是把学习和引用绑在一起的单个开关。引用的意思是，AI 回答问题时给出内容出处。开关被绑在一起，意味着关闭学习的瞬间，引用通道也一起关上了。

换句话说，在摘录范围内没有一条规则真正拦住 Google-Extended。摘录里也没有看到任何一条能拦住它的规则，只看到一句提醒：别想只关学习、留住引用，Google 没给这个选项。

## 我用六种身份访问自己的网站，服务器层面没有任何一家被拦

光看文件还不够。我想确认服务器本身有没有在拦人。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c3-ua6-http-status-uniformity" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">六种机器人访问</span><span class="lm-card__text">六种机器人的开头和结尾响应都是 200,完全相同。</span><div class="lm-card__numbers"><span class="lm-card__chip">响应代码 200</span></div></div>

方法是换六种身份去请求自己的网站。每次访问，程序都会自报身份，报出来的名字叫 User-Agent。浏览器报 Mozilla/5.0 开头的名号，爬虫报自己的名字。

我用了六个名号：Google-Extended、Googlebot、GPTBot、ClaudeBot、OAI-SearchBot，再加上普通浏览器的 Mozilla/5.0。Googlebot 是 Google 的搜索爬虫，OAI-SearchBot 是 OpenAI 用来给搜索收录网页的程序。

结果很整齐。六个身份全部是首次请求返回 200，最终返回也是 200。以 Google-Extended 为例，结果是 first=200 final=200。200 就是“正常给你看”。中间也没有观察到任何一次跳转。

这排除了一个可能：拦截发生在服务器应答这一层。也就是说，六家谁都没有在 HTTP 层被拦下。剩下的可疑地点只有一个，就是 robots.txt 里的标识名称写法。

## OpenAI 的官方文档写明各开关互相独立，Anthropic 的文档我没能读到内容

既然只剩开关可用，那就要看各家文档里开关是怎么设计的。这一步我查了 OpenAI 和 Anthropic 的官方文档。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-official-docs-token-independence" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">OpenAI 说明文档</span><span class="lm-card__text">文档中写明可以分别阻止搜索机器人和训练机器人。</span><div class="lm-card__numbers"><span class="lm-card__chip">观测运行 3</span><span class="lm-card__chip">命中 0</span></div></div>

OpenAI 的文档先列出四个爬虫的说明：OAI-SearchBot 占 9 行，ChatGPT-User 占 6 行，OAI-AdsBot 占 5 行，GPTBot 占 5 行。它们各管一件事：搜索收录、用户即时调用、广告相关、模型学习。

更关键的是文档里的这句话：

> independent of the others – for example, a webmaster can allow OAI-SearchBot in order to appear in search results while disallowing GPTBot to indicate that crawled content should not be used for training OpenAI's generative AI foundation models
> （[OpenAI crawlers and fetchers](https://platform.openai.com/docs/crawlers)）

翻译过来：这些开关彼此独立。网站主可以放行 OAI-SearchBot，让内容出现在搜索结果里，同时禁止 GPTBot，表明内容不许用于训练 OpenAI 的生成式 AI 基础模型。

Anthropic 的文档我也要了三次，三次都返回 200。但抓回来的摘录里没有正文内容。所以 Anthropic 有没有把搜索和学习的开关分开，这次没有确认。

把两份结果放在一起：在这个观测里，用官方文档白纸黑字保证"允许搜索、禁止学习"这个组合的，只有 OpenAI 一家。

## 两家为什么这样设计，官方没有给出解释

OpenAI 拆成多个开关，Google-Extended 合成一个开关。为什么不一样？我找了双方的正式说明，没有找到。

Google 没有解释为什么把学习和引用放在一个开关里。OpenAI 也没有解释为什么要拆开。原因未知。

不知道原因，意味着我们做判断时手里的依据只剩观察事实本身：一个拆了，一个没拆。读这篇文章时，要记住这一条：结论只到观察事实为止。

## 有人会说：这只是你一个网站一天的观察

最强的反对意见很清楚：你的全部观察来自一个网站、一天的数据。这个批评成立吗？成立，而且要说透。

具体到我的文件：Google-Extended 的拦截组本来就是被移除的状态，规则区里也没有单独的禁止条目。"单个开关"这个说法，靠的是我文件里的注释，加上 OpenAI 文档的独立性语句，方向上被支持。但我没有做过对照实验，也就是真的把 Google-Extended 禁掉，然后观察 AI 引用会不会消失。这一步没做。

所以要把这个判断的适用范围说清楚：它只涉及 robots.txt 的开关设计和官方文档的措辞。真实的搜索页面上引用如何变化，不在本次观测范围内。

## 今天就能做的两件事：检查并记录你的 robots.txt

打开你自己网站的 robots.txt 文件（在网址后面加上 /robots.txt），花十分钟就能看清两件事。

第一，数一数文件里有几个“开关”。以本次实验的网站为例，OpenAI 的各个程序是分开控制的。官方文档明确说明，代表搜索收录的开关和代表训练的开关彼此独立。你可以只开搜索、关掉训练。而 Google 那边是另一种做法：它把“训练”和“引用”捆在同一个开关上，要么一起开，要么一起关，想只关一半是做不到的。如果你也在乎“文章可以被引用但别拿去训练”，就得先弄清每家公司给你的是分开的开关，还是绑在一起、只能一起动的一个开关。

第二，把你看到的情况记下来，包括你当时为什么那样设置。比如这次观察到的网站文件里，说明文字写着“我们移除了那组用于阻止训练的规则”，理由写在了旁边的注释里。这样做的好处是：半年后再翻看，能直接想起当时为什么这么配。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="zh"><span class="lm-card__title">结论</span><p class="lm-card__takeaway">本实验表明阻止开关可能不止一个,但由于标头验证失败,未能确认。</p></div>

## 本文未能核实的部分

- Cloudflare（一家网站防护服务）提供的 Content-Signal 响应头——服务器随网页附带的一段说明文字——里 search、ai-train、ai-input 的实际取值。三次执行全部失败，一个值都没有观测到。
- 在 Google 搜索结果顶部的 AI 生成答案摘要这类真实搜索页面上，引用会如何变化。这超出本次实验的范围。
- Anthropic 的爬虫开关是否把搜索和学习分开。文档正文没有进入摘录，无法确认。
- git（一种记录文件版本的工具）的工作目录里没有 robots.txt，线上文件和仓库原始版本为何出现差异，原因没有查明。
- 这个判断在什么条件下会错：如果 Google 开始官方提供把学习和引用分开的单独开关或设置，或者出现"禁止 Google-Extended 之后 AI 搜索引用依然保留"的对照观测，本文的主张就不成立了。

## 参考资料

1. [robots.txt](https://www.jangwook.net/robots.txt)（jangwook.net）
2. [OpenAI crawlers and fetchers](https://platform.openai.com/docs/crawlers)（OpenAI）
3. [Anthropic docs](https://docs.anthropic.com/)（Anthropic）