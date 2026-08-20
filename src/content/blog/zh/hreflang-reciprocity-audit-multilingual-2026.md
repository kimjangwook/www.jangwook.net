---
title: 'hreflang必须双向 — 审计自己的四语言博客，揪出首页的一个漏洞'
description: '我把一个30行的检查器直接跑在自己网站的构建产物上。248篇博客文章的hreflang集群全部通过，唯独首页没过。本文梳理Google官方的相互链接规则、实测日志、三种实现方式的对比，以及开发者可以直接套用的修复代码。'
pubDate: '2026-07-04'
heroImage: '../../../assets/blog/hreflang-reciprocity-audit-multilingual-2026/hero.png'
tags:
  - hreflang
  - SEO
  - 多语言
  - Web开发
  - 结构化数据
faq:
  - question: '加了hreflang能提升搜索排名吗？'
    answer: '不能。Google官方文档把hreflang描述为一个把用户引导到匹配其语言或地区版本的路由装置，而不是排名信号。错误的hreflang不会凭空造出排名，反过来，一旦相互链接断裂，该注释会被直接忽略。'
  - question: '相互链接（return link）到底是什么意思？'
    answer: '如果A页面把B指定为替代版本，B也必须反过来指定A。用Google的话说是"如果两个页面没有互相指向，标签就会被忽略"。此外每个页面还必须自指（self-reference），把自己也列入自己的hreflang集合。'
  - question: 'HTML标签、HTTP头、站点地图，该用哪一个？'
    answer: 'Google明确表示三种方式等价。HTML对静态站点最简单，HTTP头用于PDF等非HTML文件，站点地图适合页面数量大或难以改动标记的情况。三者不要混用、只选一种，这样验证和维护都更省心。'
  - question: '中文用hreflang="zh"就够了吗？'
    answer: 'bare zh有效，但无法区分简体（zh-Hans）和繁体（zh-Hant）。如果同时面向台湾或香港读者，用脚本子标签（zh-Hans、zh-Hant）更精确。地区代码方面，不要用UK、EU这类保留词，应使用ISO 3166-1 Alpha 2（如GB）。'
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.62
    reason:
      ko: 둘 다 "화면이 아니라 크롤러가 읽는 마크업이 승부처"라는 같은 관점이다. 그쪽은 LocalBusiness JSON-LD를 서버가 확실히 내보내는 문제를, 이 글은 hreflang을 서버가 올바르게 짝지어 내보내는 문제를 다룬다.
      ja: どちらも「画面ではなくクローラーが読むマークアップが勝負どころ」という同じ視点だ。あちらはLocalBusiness JSON-LDをサーバーが確実に出す問題を、本記事はhreflangをサーバーが正しく相互リンクさせる問題を扱う。
      en: Both take the view that the real battleground is the markup crawlers read, not the screen. That post is about emitting LocalBusiness JSON-LD reliably server-side; this one is about pairing hreflang correctly server-side.
      zh: 两篇都持"关键在于爬虫读取的标记，而非屏幕"这一视角。那篇讲如何在服务端可靠输出LocalBusiness JSON-LD，本文讲如何在服务端正确地相互链接hreflang。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.55
    reason:
      ko: 자동 검사기를 내 페이지에 돌려 통과/실패를 숫자로 확인하고 하나씩 고친 흐름이 똑같다. 그쪽은 Lighthouse 접근성 점수를, 이 글은 hreflang 리시프로시티를 실측했다.
      ja: 自動チェッカーを自分のページに走らせ、合否を数字で確認して一つずつ直す流れが同じだ。あちらはLighthouseのアクセシビリティスコアを、本記事はhreflangの相互リンクを実測した。
      en: The same loop of running an automated checker against my own pages, confirm pass/fail with numbers, fix one at a time. That post measured Lighthouse accessibility scores; this one measured hreflang reciprocity.
      zh: 同样的流程：把自动检查器跑在自己的页面上，用数字确认通过与否，再逐个修复。那篇实测Lighthouse无障碍分数，本文实测hreflang相互链接。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.5
    reason:
      ko: robots.txt 한 줄로 "AI 차단 끝"이라 믿는 흔한 오해를 실제 파서로 깨봤듯, 이 글도 "hreflang만 뿌리면 끝"이라는 오해를 실측으로 깬다. 둘 다 크롤러가 규칙을 어떻게 읽는지가 핵심이다.
      ja: robots.txt一行で「AIブロック完了」と思い込む誤解を実パーサーで崩したように、本記事も「hreflangを撒けば終わり」という誤解を実測で崩す。どちらもクローラーがルールをどう読むかが核心だ。
      en: Just as that post used a real parser to break the myth that one robots.txt line means "AI blocked," this one uses measurement to break the myth that sprinkling hreflang is enough. Both hinge on how crawlers actually read the rules.
      zh: 正如那篇用真实解析器打破"robots.txt一行就等于屏蔽AI"的误解，本文用实测打破"撒上hreflang就完事"的误解。两者的核心都是爬虫如何真正读取规则。
  - slug: multilingual-llm-token-tax-experiment
    score: 0.5
    reason:
      ko: 그 글도 내 블로그 285편을 통째로 실측 대상으로 삼아 언어별 토큰 비용을 쟀다. 빌드 결과물을 감사한 이 글과 "내 사이트를 데이터로 놓고 직접 잰다"는 태도가 같다.
      ja: あの記事もブログ285本をまるごと実測対象にして言語別のトークンコストを測った。ビルド成果物を監査した本記事と「自分のサイトをデータとして直接測る」姿勢が共通する。
      en: That post also treats all 285 posts of my blog as the measurement target and weighs token cost per language. Like this article auditing the build output, both share the stance of measuring my own site as data.
      zh: 那篇同样把博客285篇整个当作实测对象，测量各语言的token成本。正如本文审计构建产物，两者都秉持"把自己的网站当数据来亲自测量"的态度。
---

我把一个30行的脚本对准自己网站的`dist/`目录。248篇博客文章全是绿灯。恰好有一篇是红灯，偏偏是首页。

```text
[PASS] return-link reciprocity    broken pairs : 0   （一篇文章的四种语言）
...
[FAIL] return-link reciprocity    broken pairs : 4   （全站249个页面）
[FAIL] self-referencing hreflang   missing      : 1
```

hreflang是多语言站点里用来告诉搜索引擎"这个页面的中文版、英文版在这里"的标签。加它很容易。问题在于，它是一份<strong>双向契约</strong>。只有一方伸手，握手就不成立，Google会把这条注释整个丢弃。这条规则我只在文档里读过，但我很想知道自己的站点是否真的守住了，于是亲手测了一遍。结果如上。我按顺序拆解。

## hreflang保证什么，不保证什么

先把期待降下来。hreflang不会提升排名。Google Search Central的文档把它描述为一个"按语言或地区把用户引导到最合适版本"的工具。它是<strong>路由信号</strong>，不是排名加成。

这个区分在实战里很关键。我以前曾模糊地以为，把hreflang做干净，各语言版本就会在各自市场里排名上升。这是个错误的期待。hreflang真正做的是：当一位中国用户搜索时，它把已经进入排名的结果<strong>替换</strong>成正确的语言，让中文版而非英文版出现。它不会造出原本不存在的排名。

反过来，做错了，损失是确定的。相互链接断裂的注释会被忽略，最坏时搜索引擎会搞不清哪个是正本，端出错误的语言版本。所以hreflang更接近"做得完全正确才保本，做错就亏"，而不是"加了就赚、不加就保本"。理解了这种不对称，你就不会觉得花时间做验证是多余的。

## 双向（return link）规则 — 为什么单向不行

Google文档的那句话短而果断："如果两个页面没有互相指向，标签就会被忽略（If two pages don't both point to each other, the tags will be ignored）。"

拆开就是三点。

1. <strong>Return link</strong>：A把B指定为替代版本，B也必须反过来指定A。
2. <strong>Self-reference</strong>：每个页面把自己也列入hreflang清单。中文版的清单里必须有自己（zh）。
3. <strong>绝对URL</strong>：`href`要是含协议和域名的完整地址。

这条规则为何如此严格，我自己想通后觉得合理。hreflang必须防止不可信的第三方擅自把我的页面声称为它的替代版本。如果承认单向声明，任何站点都能宣布"我的西班牙语版就是你那个知名的英文页面"，从而污染信号。要求双方互相指名才认可，等于一次相互签名。从反垃圾的角度看，这反而是干净的设计。

麻烦在于，这条规则靠人手很难守住。四种语言乘以数百篇文章，就是数百个集群。哪怕一个页面清单错位，那个集群就被悄悄忽略，屏幕上还不会报错。所以我写了一个检查器。

## 我直接审计了自己的站点

这个脚本读取构建产物（`dist/`）里所有的`index.html`，抽出hreflang链接，建成一张图，核查return link是否真的存在。RSS订阅源上带的`hreflang`不是HTML页面，我把它们过滤掉了。

````javascript
// hreflang-audit.mjs（核心部分）
function extractHreflang(html) {
  const out = [];
  const linkRe = /<link\b[^>]*rel=["']alternate["'][^>]*>/gi;
  for (const m of html.match(linkRe) || []) {
    if (/type=["']application\/rss\+xml["']/i.test(m)) continue; // 排除RSS
    const lang = (m.match(/hreflang=["']([^"']+)["']/i) || [])[1];
    const href = (m.match(/href=["']([^"']+)["']/i) || [])[1];
    if (lang && href) out.push({ lang, href });
  }
  return out;
}
// 每条注释的target是否反过来指向我们？
const target = pages.get(a.href);
if (target && !target.alts.some(t => t.href === url)) brokenReturn++;
````

先只检查一篇文章的四种语言版本。我拿讲无障碍审计的[Lighthouse无障碍那篇](/zh/blog/zh/a11y-lighthouse-audit-fix-2026/)做对象。

```text
$ node hreflang-audit.mjs dist a11y-lighthouse-audit-fix-2026
pages with hreflang annotations : 4
----------------------------------------------------
[PASS] return-link reciprocity    broken pairs : 0
[PASS] self-referencing hreflang   missing      : 0
[PASS] x-default present            missing      : 0
[PASS] absolute URLs                relative     : 0
[PASS] language code format         invalid      : 0
```

干净。打开实际的标签，四种语言精确地互相指名，也指向自己。

```html
<!-- /zh/blog/zh/a11y-.../ 输出的内容 -->
<link rel="canonical" href="https://jangwook.net/zh/blog/zh/a11y-lighthouse-audit-fix-2026/">
<link rel="alternate" hreflang="ko" href="https://jangwook.net/ko/blog/ko/a11y-lighthouse-audit-fix-2026/">
<link rel="alternate" hreflang="en" href="https://jangwook.net/en/blog/en/a11y-lighthouse-audit-fix-2026/">
<link rel="alternate" hreflang="ja" href="https://jangwook.net/ja/blog/ja/a11y-lighthouse-audit-fix-2026/">
<link rel="alternate" hreflang="zh" href="https://jangwook.net/zh/blog/zh/a11y-lighthouse-audit-fix-2026/">
<link rel="alternate" hreflang="x-default" href="https://jangwook.net/en/blog/en/a11y-lighthouse-audit-fix-2026/">
```

到这里我很满意。可一旦把范围扩到全站，画面就变了。

```text
$ node hreflang-audit.mjs dist
pages with hreflang annotations : 249
----------------------------------------------------
[FAIL] return-link reciprocity    broken pairs : 4
[FAIL] self-referencing hreflang   missing      : 1
[PASS] x-default present            missing      : 0
[PASS] absolute URLs                relative     : 0
[PASS] language code format         invalid      : 0

first broken return links:
  https://jangwook.net/
    → https://jangwook.net/ko/ (ko) has NO return link
  https://jangwook.net/
    → https://jangwook.net/en/ (en) has NO return link
  https://jangwook.net/
    → https://jangwook.net/ja/ (ja) has NO return link
  https://jangwook.net/
    → https://jangwook.net/zh/ (zh) has NO return link
```

断裂的四组全都指向同一处：没有语言代码的<strong>裸根</strong>`https://jangwook.net/`。248篇文章都完美，只有一张首页在扰乱集群。

## 为什么只有首页坏了

把两个页面的实际标签并排放，原因立刻显现。

```html
<!-- 裸根 / 输出的内容 -->
<link rel="canonical" href="https://jangwook.net/">
<link rel="alternate" hreflang="ko" href="https://jangwook.net/ko/">
<link rel="alternate" hreflang="en" href="https://jangwook.net/en/">
<link rel="alternate" hreflang="ja" href="https://jangwook.net/ja/">
<link rel="alternate" hreflang="zh" href="https://jangwook.net/zh/">
<link rel="alternate" hreflang="x-default" href="https://jangwook.net/en/">

<!-- /zh/ 首页输出的内容 -->
<link rel="canonical" href="https://jangwook.net/zh/">
<link rel="alternate" hreflang="ko" href="https://jangwook.net/ko/">
<link rel="alternate" hreflang="en" href="https://jangwook.net/en/">
<link rel="alternate" hreflang="ja" href="https://jangwook.net/ja/">
<link rel="alternate" hreflang="zh" href="https://jangwook.net/zh/">
<link rel="alternate" hreflang="x-default" href="https://jangwook.net/en/">
```

裸根`/`把自己声明为正本（`canonical`），又把`/ko/` `/en/` `/ja/` `/zh/`指定为替代版本。可偏偏`/zh/`的清单里没有`/`。`/zh/`只指名自己和其余三种语言。也就是说，根向语言首页伸手，而语言首页里没有一个向根伸手。握手失败。加上根没把自己（`/`）放进自己的清单，也就没有self-reference。检查器抓到的"missing self : 1"正是这个根。

老实说，这是个常见的坑。多语言站点里，没有语言代码的"中立根"通常会重定向到某个语言首页，或充当语言选择页。可一旦这个根<strong>像一个独立正本页面那样，另外输出自己的hreflang枢纽</strong>，它就成了闯入者，挤进语言首页早已彼此完结的集群。语言首页不知道根的存在，自然没有理由为它建return link。

还有一点。x-default指向`/en/`。这本身不算错。Google明确允许x-default指向某个特定语言版本。但x-default的用意是"面向任何语言都不匹配的用户的页面"，也就是语言选择界面或自动重定向的首页。最贴合这个角色的，恰恰是中立根`/`。当前结构是个尴尬的中间态：有一个中立根，x-default却指向英文，而那个中立根在集群里悬着。

我用最小复现又确认了一遍这个机制。造两个页面，枢纽A指向B，但B不指向A，然后跑检查器。

```text
===== BROKEN =====
[FAIL] return-link reciprocity    broken pairs : 1
[FAIL] self-referencing hreflang   missing      : 1

===== FIXED（每个页面都指名自己+全部变体，且相互指名） =====
[PASS] return-link reciprocity    broken pairs : 0
[PASS] self-referencing hreflang   missing      : 0
[PASS] x-default present            missing      : 0
```

修复方向有三选一。(1) 把根301重定向到某个语言首页，让它彻底退出集群；(2) 把根的`canonical`让给语言首页，理清重复信号；(3) 把根当作真正的x-default目标，让所有语言首页都用x-default指向根，恢复相互性。我认为(3)在语义上最诚实。不过它动的是线上站点的canonical和重定向，所以我打算先在预发环境复核那248个健康集群不受影响，再单独上线。这篇文章里我没有临时改动线上SEO行为。检查器会充当回归测试：修完之后再跑一次同样的脚本，确认绿灯即可。

<strong>2026-07-04 后续</strong>：该修复已上线。按方法(3)把首页集群的x-default改为中立根`/`，并把上面的检查器常设为构建流水线的postbuild门禁。重跑结果：253个页面，broken pairs 0，missing self 0 — 全部绿灯。

把修复前后画在一起，问题一目了然。

```mermaid
graph TD
    subgraph BROKEN["修复前 — 握手失败"]
        R1["/ 根"] -->|"hreflang 指向"| K1["/ko/ · /en/ · /ja/ · /zh/"]
        K1 -.->|"没有 return link"| R1
    end
    subgraph FIXED["修复后 — 相互性成立"]
        K2["/ko/ · /en/ · /ja/ · /zh/"] -->|"x-default"| R2["/ 根 = 语言选择页"]
        R2 -->|"ko·en·ja·zh + x-default 自我引用"| K2
    end
```

## 三种实现方式 — 何时用哪个

输出hreflang有三种方式，Google坚决表示"三种方式等价"。等价应当理解为<strong>任选其一，但绝不混用</strong>。如果对同一个页面，HTML标签和站点地图说的不一样，你只是给自己造了一个验证地狱。

| 方式 | 放在哪 | 优势 | 劣势 | 适用场景 |
|------|-------|------|------|---------|
| HTML `<link>`标签 | 每页`<head>` | 实现与检查最简单；静态构建自动生成 | 每页N个标签；页面多时HTML变重 | 静态博客、数百页规模 |
| HTTP `Link:`头 | 响应头 | 可用于PDF、图片等非HTML文件 | 需服务器/CDN配置；肉眼核查麻烦 | 非HTML资源、易于控制头的环境 |
| 站点地图 `xhtml:link` | XML站点地图 | 不动HTML；大规模有利，集中管理 | 站点地图膨胀；需要生成流水线 | 数万页、难改标记的CMS |

我的博客是静态构建，所以HTML标签方式合适。在数百页的当下，标签方式"HTML变重"的劣势还不成负担。若长到数万页，我会考虑改用站点地图方式。那种情况下，正如[把LocalBusiness结构化数据在服务端输出](/zh/blog/zh/localbusiness-structured-data-server-side-vs-js-2026/)那次一样，在构建时点确定性地打出信号，比人手管理安全得多。

## 常踩的雷 — 尤其是中文

我的站点语言代码过了关，但规则本身有几个常见的坑，用清单记下来。

- <strong>地区代码用错</strong>：英国是`GB`，不是`UK`。`EU`、`UN`也不是ISO 3166-1 Alpha 2，因此无效。这是Google官方点名的典型错误。
- <strong>语言与地区混淆</strong>：`hreflang="us"`是错的。`us`是地区，不是语言。要把语言写在前面，如`en-US`。
- <strong>中文子标签</strong>：我的站点用bare `zh`。它有效，但无法区分简体和繁体。如果只面向大陆读者，`zh`就够；如果也面向台湾、香港，用`zh-Hans` / `zh-Hant`明示脚本更精确。这个博客在后来加中文支持时，是从单一简体起步的，现在回看，至少该明示为`zh-Hans`。这一点我记为自己的失误。
- <strong>相对路径</strong>：`href="/en/..."`不行，必须是绝对URL。
- <strong>与noindex同用</strong>：如果hreflang的目标是`noindex`，信号之间就自相矛盾。你一边说别收录，一边又把用户引向它作为替代版本。

最后一条尤其和[用robots.txt控制AI爬虫那篇](/zh/blog/zh/ai-crawler-control-robots-txt-llms-txt-2026/)相连。收录、抓取、语言这些信号分散在不同的文件和标签里，一旦彼此矛盾，爬虫要么按最保守的方式解读，要么干脆忽略。加信号不难，<strong>让信号之间不打架</strong>才是实战的一半。

## 所以开发者现在该做什么

归纳起来，顺序是这样。

1. <strong>检查构建产物。</strong>看真正发出去的HTML，而不是源模板。把上面那个30行脚本对准`dist/`，五秒内一次性抓出return link、self-reference、绝对URL和代码格式。
2. <strong>别漏掉self-reference。</strong>每个页面的hreflang清单里都要有自己。忘掉这一点是最常见的错。
3. <strong>理清中立根。</strong>检查没有语言代码的`/`是否在另外输出自己的canonical和hreflang枢纽。把它重定向、把canonical让给语言首页，或让它当x-default目标以建立相互性。
4. <strong>统一用一种方式。</strong>不要混用HTML标签、HTTP头和站点地图。
5. <strong>把检查器接进CI。</strong>每次构建后自动跑，broken pair不为0就让构建失败。我打算就这么用这个脚本。等哪天再加一门语言，它能阻止新语言悄悄弄坏既有集群。

若只留一句，就是这句：hreflang不是"加了"就算完，而是"在构建产物里双向咬合"才算完。而这个确认要用脚本做，不是用眼睛。连我这个把文档背得滚瓜烂熟的人，首页坏了都没察觉。

---

如果你想检查一个多语言站点的hreflang、canonical和结构化数据是否真的在构建产物里咬合，或者想搭一套从静态／服务端渲染确定性地输出这些信号的结构，我个人承接咨询与实现。像上面这样一个小小的回归装置，就能防住数百页里的沉默错误。可通过博客个人资料里的联系方式找到我。
