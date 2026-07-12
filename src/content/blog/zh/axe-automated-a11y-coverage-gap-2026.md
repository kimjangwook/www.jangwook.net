---
title: 自动无障碍检测亮了绿灯，仍留下的四道墙
description: 我往一张结账页面里故意埋了八处WCAG障碍，再用axe-core跑一遍。规则型的四处被抓住，需要人来判断的四处却在绿灯背后原样留着。本文用实测日志说清楚自动化在结构上看不到什么，以及补上这块缺口的人工复查清单。
pubDate: '2026-07-12'
heroImage: ../../../assets/blog/axe-automated-a11y-coverage-gap-2026/hero.png
tags:
  - a11y
  - wcag
  - accessibility
  - web-development
relatedPosts:
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.83
    reason:
      ko: "이 글이 '자동화가 구조적으로 못 잡는 것'을 다뤘다면, 저 글은 그 자동화를 CI에 어떻게 2단으로 넣느냐를 실측한 짝이다. color-contrast가 jsdom에서 왜 빠지는지 궁금하면 저기로."
      ja: "本稿が『自動化が構造的に取りこぼすもの』なら、あちらはその自動化をCIに二段で組む実測。color-contrastがjsdomで抜ける理由はあちらへ。"
      en: "This post is about what automation structurally can't catch; that one measures how to wire that automation into CI in two stages. For why color-contrast drops out under jsdom, go there."
      zh: "本文讲自动化在结构上抓不到的东西；那篇实测如何把这套自动化分两段接进CI。想知道color-contrast为何在jsdom里掉队，去那篇。"
  - slug: accessible-name-agents-2026
    score: 0.8
    reason:
      ko: "여기서 'axe가 못 잡는 것' 중 하나가 접근성 이름의 품질이다. 접근성 이름이 왜, 어떻게 틀어지는지 한 케이스만 깊게 판 글이 저기다."
      ja: "本稿で『axeが取りこぼすもの』の一つがアクセシブルネームの質。それがなぜどう狂うかを一例だけ深掘りしたのがあちら。"
      en: "One of the things axe misses here is the quality of the accessible name. That post drills into a single case of how it goes wrong."
      zh: "本文里axe抓不到的其中一项就是无障碍名称的质量。那篇只挑一个案例，深挖它是怎么错的。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.72
    reason:
      ko: "자동 도구로 접근성 위반을 잡아 고치는 전체 흐름을 먼저 보고 싶다면 저 글이 출발점이다. 이 글은 그 흐름이 끝난 뒤 남는 사각지대를 다룬다."
      ja: "自動ツールでアクセシビリティ違反を捕まえて直す全体像を先に見たいなら、あちらが出発点。本稿はその後に残る死角を扱う。"
      en: "If you want the full flow of catching and fixing a11y violations with tooling first, that's the starting point. This post covers the blind spot that remains after."
      zh: "想先看用自动工具抓取并修复无障碍问题的完整流程，那篇是起点。本文讲的是那套流程跑完之后仍留下的盲区。"
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.66
    reason:
      ko: "크롤러는 텍스트를, 스크린 리더는 접근성 트리를 읽는다. 둘 다 서버가 내보낸 마크업이 전부라는 점에서, 접근성과 크롤러빌리티는 같은 뿌리를 공유한다."
      ja: "クローラーはテキストを、スクリーンリーダーはアクセシビリティツリーを読む。どちらもサーバーが出したマークアップが全て、という点で根は同じ。"
      en: "Crawlers read text, screen readers read the accessibility tree. Both live off the markup your server ships, so accessibility and crawlability share a root."
      zh: "爬虫读文本，屏幕阅读器读无障碍树。两者都只吃你服务器输出的标记，所以无障碍与可抓取性同根。"
---

我做了一张结账页面，往里面故意埋了八道墙，再用axe-core跑了一遍。四道亮红灯被拦下，四道悄悄放行。放行的这四道，全是会实实在在把屏幕阅读器用户挡在门外的真墙。工具没把它们叫作问题。

这就是自动无障碍检测的真实面目。不是说工具不好。axe-core很出色，我每天都在用。问题出在你把绿灯读成"无障碍达标"的那一刻。想用CI里的一行把无障碍收尾，这心情我懂，我也这么干过。可那一行检查的层，和用户真正撞上的层，根本不是同一层，这事得亲眼看一遍才有感觉。今天就把八道埋墙、逐一核对的日志原样摊开。

## 打底：自动工具看的是"违规"，不是"体验"

无障碍检测器做的事，说到底只有一件。它遍历DOM，找出触到机器可判定规则的节点。这个`<img>`有没有`alt`？这个`<button>`有没有可访问名称？`<html>`带不带`lang`？这些非真即假。没属性就是违规，代码判完，结束。

可WCAG的成功准则里，很大一部分不能这么一刀两断。机器能看到`alt`属性**在不在**，却看不出这个alt有没有把图片的意思传达清楚。它能看到链接**有没有**文字，却判断不了"点这里"有没有说明链接去哪。这不是违规，是语义问题。得有人读了画面和上下文才给得出答案。

于是无障碍分成两层。下层是机器能扫的规则型违规，上层是要人来判断的体验型障碍。自动工具把下层扫得又快又准，上层却碰都碰不到。麻烦在于，两层同样会把屏幕阅读器用户挡住。对用户来说，"机器能不能抓到"根本无所谓。

用数字找找感觉：WCAG 2.2的成功准则横跨好几类，其中能完全自动判真伪的只是一部分。其余的，要么自动工具只能标一句"这里可疑，得人来确认"，要么干脆无从下手。哪条落在哪一边，各家工具略有出入，但"光靠自动就验完整个WCAG"这件事，没有任何一款工具做得到。这不是工具性能不够，是准则本身的性质决定的。

只在脑子里知道这条，很容易忘。所以我干脆自己埋一遍。

## 埋了八道墙的结账页面

我在仓库外的临时沙盒里写了一张`page.html`，一个再普通不过的结账表单。往里面有意放了八道墙。四道规则型（机器理应抓到），四道体验型（只有人能抓到）。

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Checkout</title></head>
<body>
  <h1>Checkout</h1>

  <!-- #1 规则型：没有 alt 的图片 -->
  <img src="/logo.png">

  <!-- #2 规则型：没有标签的输入框 -->
  <input type="email" name="email">

  <!-- #3 规则型：没有名称的空按钮 -->
  <button></button>

  <!-- #4 体验型：alt 存在但毫无意义 -->
  <img src="/chart-q3.png" alt="image">

  <!-- #5 体验型：不说明去向的链接 -->
  <p>退款政策请<a href="/refund">点这里</a>。</p>

  <!-- #6 体验型：仅靠颜色传达含义 -->
  <p><span style="color:red">红色</span>项为必填。</p>

  <!-- #7 体验型：标签指向了错误的字段 -->
  <label for="zip">卡号</label>
  <input id="zip" name="postal" type="text">

  <!-- #8 规则型：跳级标题 h1 -> h3 -->
  <h3>配送</h3>
</body>
</html>
```

也许你已经发现`<html>`没写`lang`。那道不是我埋的，是我不小心漏了。axe后面会抓到它，我索性留着，当作工具确实干活的凭证。

检测用的是axe-core 4.12.1，跑在jsdom上，无头模式。之所以不开真浏览器，是因为这次实验的焦点在"能不能用规则判定"，而不是"环境差异"。如果你关心的是环境差异（浏览器对jsdom），我在[把axe-core放进CI后为何只有color-contrast悄悄消失](/zh/blog/zh/axe-core-ci-a11y-jsdom-vs-browser-2026)里单独实测过那一块。

```javascript
import { JSDOM } from 'jsdom';
import fs from 'fs';
import axeSource from 'axe-core';

const html = fs.readFileSync('page.html', 'utf8');
const dom = new JSDOM(html, { pretendToBeVisual: true });
const { window } = dom;
window.eval(axeSource.source);           // 把 axe 注入 jsdom 的 window
const results = await window.axe.run(window.document, {
  resultTypes: ['violations', 'incomplete'],
});
```

## axe-core抓到了什么

先看结果里的violations。去掉噪声（landmark/region那一类），只留下对应埋墙的部分，是这样：

```text
[image-alt]     impact=critical  img[src$="logo.png"]  Images must have alternative text
[label]         impact=critical  input[type="email"]   Form elements must have labels
[button-name]   impact=critical  button                Buttons must have discernible text
[html-has-lang] impact=serious   html                  <html> element must have a lang attribute
[heading-order] impact=moderate  h3                     Heading levels should only increase by one
```

干净利落。埋的四道规则型（#1没alt、#2没标签、#3空按钮、#8跳级标题）全数抓住，连我漏掉的`lang`也顺手咬下。这正是自动工具真正的价值：人在评审里最容易放过的机械性遗漏，它几秒钟就一个不落地扫完。我认为用手去查这一层是浪费时间，这块工具强得多。

老实补一句，真实输出可不止这五行。`region`违规（所有内容都应放在地标之内）几乎每个节点都挂一条，十几行往下排。它与其说是真缺陷，不如说是"这页没有`<main>`这类地标"的结构信号。工具第一次对上一张页面时，这类低严重度的项会把报告塞满，反倒把真正的critical埋掉。所以我把结果按impact排序，把best-practice那一类单拎出来看。要是把工具吐的东西全当成必修清单，只会把自己耗垮。先看哪个，同样是人的活。

看到这儿，页面还处在"五处违规，改完就绿"的状态。想象你把这五处全改了：填上alt，加上标签，给按钮加文字，补上lang，理顺标题。axe这就宣布通过。可那张页面，照样是坏的。

## axe-core没能抓到的四道

对埋的四道体验型（#4到#7），axe**连一条违规、一条"需复查"都没给**。彻底沉默。逐个看。

**#4 · `alt="image"`。** axe只确认`alt`属性存不存在。值是"image"也好、"asdf"也好，只要非空就通过。可把季度业绩图读成"image"，屏幕阅读器用户什么信息都拿不到，甚至比压根没有alt还糟。空alt好歹是"装饰图片"的信号，"image"却是拿假信息盖住真信息。WCAG 1.1.1要求"等效的替代文本"，而等不等效，机器判不了。

**#5 · "点这里"。** 链接有文字，所以`link-name`规则通过。但屏幕阅读器用户常常单把链接抽成一份列表来浏览页面。当"点这里""点这里""点这里"一条条排开，根本没法知道哪条通向哪里。WCAG 2.4.4要求链接的用途能仅凭链接文字（或其上下文）看懂。读上下文，是人的活。

**#6 · 只靠颜色传达。** "红色项为必填"，对看不见颜色的用户毫无意义。色觉不同的用户和屏幕阅读器用户，都会漏掉"必填"这条信息。WCAG 1.4.1禁的正是这个。可axe判断不了那句话是否只依赖颜色。`color:red`这条样式它看得见，但这颜色是不是唯一的信息通道，是上下文的事。

**#7 · 标签指向错误字段。** 这道最阴。`<label for="卡号">`跟`id="zip"`的输入框规规矩矩连着，关联本身完美无缺，所以`label`规则通过。问题是那个输入框的`name`是`postal`。标签念的是"卡号"，实际却是邮编字段。屏幕阅读器用户听到"请输入卡号"的提示，却填进了另一个框。关联**存不存在**，机器看得到；关联**对不对**，它看不到。

看出这四道的共同点了吗？全是"属性或元素都在位，可里面的内容错了"这一型。自动工具查的是结构，不是语义。而现实里真正把用户挡住的墙，很大一部分恰恰长在这层语义上。我认为这是围绕自动无障碍工具最大的误解。绿灯的意思是"没有规则违规"，不是"可无障碍访问"。

具体画一遍就懂了。用屏幕阅读器从上到下读这页，大致会听到："Checkout，标题级别1。图片。编辑，邮箱。按钮。图片，image。退款政策请链接，点这里。红色项为必填。卡号，编辑。"就算你填好alt、加上标签、把axe刷成绿，用户听到的句子照旧是"图片 image""链接 点这里"，以及一个被念作"卡号"的邮编框。工具的通过和用户的体验之间，就裂开这么宽。

### 团队为何误读绿灯

这种误读，多半不是出于恶意，而是流程使然。当无障碍在冲刺末尾以"axe通过"这条一行验收标准进来，通过就固化成完成。报告上显示违规为0，谁也不会再往后看。数字给的那份安心太强了。我也曾把一张绿色截图贴进PR就翻篇。过了好一阵才肯承认，我只看了规则型那一层。

工具厂商的营销也掺了一脚。"自动保证无障碍"这句话好卖，却不是事实，是标准化组织公开否认过的说法（后面会引）。把自动化能做和不能做的界线划准，本身就是一项实务能力。不用工具是错的，只信工具同样是错的。

![埋下的八道墙与axe-core检测结果对照表。五道规则型标为CAUGHT，四道体验型标为MISSED](../../../assets/blog/axe-automated-a11y-coverage-gap-2026/coverage-diagram.png)

## color-contrast为何落到了"需复查"

除了violations，还出了一份incomplete（需复查）清单。其中一条就是`color-contrast`。

```text
--- INCOMPLETE / needs review ---
[color-contrast]      h1    Elements must meet minimum color contrast ratio thresholds
[page-has-heading-one] html  Page should contain a level-one heading
```

色彩对比本来是axe自动抓的招牌项。可这里它落到了"需复查"，而不是违规。原因很简单：jsdom并不真的把页面画出来。要算对比，得有渲染后像素的真实前景色和背景色，没有渲染就无从计算。于是axe把它推给"判不了，让人看"。

这跟前面那四道体验型漏检性质不同。那四道，开不开浏览器都永远抓不到。色彩对比呢，一旦在真浏览器里跑就自动抓得到。容易混淆的正是这里：同样看着像"抓不到"，一边换个环境就解决，一边永远解决不了。把这两者搅在一起想，就会滑进另一种绿灯误读："我在浏览器里跑了，那现在应该全抓到了吧。"所以搭CI流水线时，这个区分很关键。那套设计我另写在[color-contrast为何在CI里悄悄消失](/zh/blog/zh/axe-core-ci-a11y-jsdom-vs-browser-2026)里，这儿不再重复。只讲要点：把"需复查"当成空行处理，你的实际覆盖率就会破个洞。

## W3C的官方说法，与"57%"这个参考值

这不是我的一家之言。W3C WAI在官方文档里把话钉死了。无障碍评估工具的选型指南写道，评估工具"无法判定无障碍，只能协助判定（cannot determine accessibility, they can only assist in doing so）"，并明确指出，要判断一个站点是否可无障碍访问，"需要有知识的人来评估"。任何工具都不能单独判定合规——这是标准化组织的官方立场。

有个数字常被引用：Deque的调查说自动工具能抓到约57%的无障碍问题。这数字带着条件。这个57%是**按问题条数计（by volume）**的。缺alt、色彩对比这类高频问题主导了审计条数，而这恰恰是自动工具的强项。所以按条数算，数字就大。换个口径去量，可能掉到30%上下。它是参考值，不是官方标准。我认为每次引这57%，都得同一口气补上一句"57%的什么"。它不是WCAG成功准则的57%，而是常见问题条数的57%。若按成功准则的覆盖率算，能完全自动验证的那部分，比这少得多。

再老实补一个局限。我这实验就一张页面、八道墙，是展示原理的复现，不是基准测试。要是拿"抓四漏四，所以自动化是50%"去一般化，那也一样错。比例随你埋哪些墙而无限浮动。这实验说的不是比例，而是**种类**。抓不到的那些，不是碰巧抓不到，是结构上抓不到。

## 在自动绿灯背后要跑的人工复查清单

那该怎么办。自动工具照用，放进CI，每次提交都跑。这是守住下层最便宜的办法。在此之上，绿灯亮完之后，由人来扫上层。每次都做全量审计不现实，所以给评审附一份清单，只保留自动化在结构上看不到的那些项。

- **图片alt的质量**：读它有没有替代掉图片的含义，而不是它"存不存在"。信息型图片（图表、示意图）承载数据，装饰型图片用空alt。"image""photo"和文件名，一律算失败。
- **把链接、按钮文字从上下文里剥出来**：单把链接文字抽成一份列表来读。若"这里""点击""查看更多"看不出去向，就改。你是在模拟屏幕阅读器的链接列表浏览。
- **只靠颜色或形状的信息**：搜出那些仅凭颜色或位置给出含义的句子，比如"红色项""绿色徽章""上方的图"。用文字或图标标签给颜色加一重冗余。
- **标签与字段的真实对应**：查的不是标签有没有连上，而是标签所说的和字段所收的是否一致。留意autocomplete属性和`name`有没有跟标签错位。
- **朗读顺序与标题语义**：看标题有没有被拿来当视觉字号调节，看Tab顺序是否顺着逻辑流。这里机器看得到结构，看不到意图。
- **只用键盘走完整个流程**：把鼠标收起来，只用Tab、回车、方向键把表单从头提交到尾。五分钟就能逼出大多数自动工具抓不到的焦点陷阱：看不见焦点在哪、打开弹窗后Tab却漏到了背后的页面、顺序跟视觉排布打架。这五分钟里几乎全会现形。

把这六行放进PR模板，就算自动检测亮了绿，也总有人把上层扫过一遍才发版。它不完美。但能挡住最贵的那个误解：绿等于无障碍。

想把整份清单也自动化的冲动，你多半也会冒出来。现在确实有工具去问LLM"这条alt合不合适"。方向挺有意思，但我还不把它当门禁来信。LLM会煞有介事地回答"红色项"是不是只靠颜色，可没人担保这判断吃透了整页的上下文和设计意图。当辅助工具够用，拿来替代人的最后一判，还太早。想用又一层自动化去盖住上层，弄不好只是新引进一批误报和漏报。规则在这儿也一样：用自动化，得清楚它看不到什么。

无障碍不是一个交给工具替你打勾的复选框，而是你的代码和内容到底怎么抵达真实用户的问题。若你想查一查现有站点在自动绿灯背后究竟被堵到哪一步，或者想搭一条把规则型和体验型分开验证的流水线，我个人接受咨询与实现委托。可通过我资料页上的联系入口找我。

---

*来源：[W3C WAI: Selecting Web Accessibility Evaluation Tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/)（官方）。自动检出率约57%出自[Deque](https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues/)按条数计的调查，为参考值，非官方标准。运行环境：axe-core 4.12.1 · jsdom · 无头。*
