---
title: 'opens: "eleven" 三层校验全放行 — 餐厅营业时间 JSON-LD 的实测记录'
description: 给自己运营的餐厅推荐PWA补上Restaurant结构化数据：把按天存储的营业时间字符串转换成openingHoursSpecification，再把同样三个缺陷依次喂给类型检查、schema.org校验器和运行时门禁，逐层测量谁能抓住什么。并引用官方文档，诚实划清它对本地排名的作用边界。
pubDate: '2026-07-22'
heroImage: ../../../assets/blog/restaurant-jsonld-opening-hours-validation-2026/hero.png
tags:
  - SEO
  - 结构化数据
  - 本地SEO
  - JSON-LD
  - TypeScript
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.81
    reason:
      ko: 저 글은 LocalBusiness JSON-LD를 어떤 경로로 내보낼 것인가(SSR vs JS 주입)를 쟀고, 이 글은 그 안에 무엇을 어떻게 담을 것인가를 다룬다. 전달과 내용, 두 글이 한 세트다.
      ja: あちらはLocalBusiness JSON-LDをどう届けるか(SSRかJS注入か)を測った記事で、本記事は中身をどう設計するかを扱う。配信と内容、二つで一組だ。
      en: That post measured how to deliver LocalBusiness JSON-LD (SSR vs JS injection); this one covers what to put inside it. Delivery and payload, two halves of the same problem.
      zh: 那篇文章测的是LocalBusiness JSON-LD该怎么输出（SSR还是JS注入），本文讲的是里面该装什么。传输与内容，两篇正好配成一套。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.63
    reason:
      ko: 개별 페이지의 Restaurant 마크업을 완성했다면, 다음 단계는 사이트 전체의 JSON-LD 노드를 하나의 그래프로 잇는 일이다. 부유 노드가 어떻게 생기고 어떻게 잡는지를 실측했다.
      ja: 個別ページのRestaurantマークアップができたら、次はサイト全体のJSON-LDノードを一つのグラフに繋ぐ番だ。浮遊ノードの発生と検出を実測した記事。
      en: Once a single page's Restaurant markup is done, the next step is linking every JSON-LD node on the site into one graph. That post measured how orphan nodes appear and how to catch them.
      zh: 单页的Restaurant标记完成后，下一步是把全站JSON-LD节点连成一张图。那篇文章实测了游离节点如何产生、如何捕获。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.55
    reason:
      ko: 도구가 무엇을 잡고 무엇을 놓치는지를 계층별로 재서 CI 게이트를 설계한다는 접근이 이 글과 같다. 대상이 a11y 검사기라는 점만 다르다.
      ja: ツールが何を捕まえ何を見逃すかを層ごとに測り、CIゲートを設計するという発想が本記事と同じ。対象がa11yチェッカーである点だけが違う。
      en: Same approach as this article — measure what each tool layer catches and misses, then design the CI gate around the gaps. Only the subject differs, axe-core instead of schema validators.
      zh: 思路与本文一致：逐层测量工具能抓住什么、漏掉什么，再据此设计CI门禁。区别只在对象是a11y检查器。
---

先看一行日志。我故意弄坏了一段 Restaurant JSON-LD，提交给 validator.schema.org，返回是这样的：

```text
prop opens=eleven errors=[]   ← 根本不是时间，零投诉
nodeProp adress → INVALID_PREDICATE (isSevere: true)
prop dayOfWeek=http://schema.org/Monday errors=[]  ← 输入是小写，被悄悄改正
```

属性名拼错（`adress`）被标成 severe 级错误；`opens` 里放的不是时间而是英文单词 "eleven"，却一路绿灯。小写的 `"monday"` 更有意思：既不算错误也不算通过，校验器一声不吭地帮你改成 `schema.org/Monday` 再展示。这种不对称就是本文的主题。结构化数据的校验从来不是一道关卡，而最致命的缺陷，恰恰没有任何现成关卡负责。

## grep 的结果是零

我业余开发并运营着一个面向访日游客的餐厅推荐 PWA，SvelteKit 加地图加多语言店铺信息。这次想把结构化数据补齐，先 grep 了一下 `ld+json`，命中零条。一个做餐厅信息的服务，连一行 Restaurant 标记都没有。说来惭愧，我在这个博客上实测过不少别人网站的结构化数据，自己的服务却是空白。

服务内部的营业时间是这么存的：

```json
{"monday":"11:00-22:00","tuesday":"11:00-22:00","wednesday":"11:00-22:00",
 "thursday":"11:00-22:00","friday":"11:00-23:00","saturday":"11:00-23:00",
 "sunday":"11:00-21:00"}
```

按天存一条展示用字符串，界面渲染完全够用。但这是<strong>展示格式，不是结构化数据</strong>。机器要回答"现在营业吗"，需要 opens 和 closes 拆开的机器可读形式，而 schema.org 早就定义好了这套词汇。我猜很多本地商户类网站都是这么起步的，因为第一天只需要展示。账单在后面：等到需要结构化数据时，就得付出把字符串还原成结构的成本。这次我用自己的数据，把这笔成本具体在哪儿踩了一遍。

## 打底：openingHoursSpecification 这套词汇

进代码之前先铺地基。一手来源是 [Google Search Central 的 LocalBusiness 文档](https://developers.google.com/search/docs/appearance/structured-data/local-business)。Google 读取 LocalBusiness 结构化数据，作为知识面板、搜索结果里营业时间与位置展示的素材。属性要求浓缩成一张表：

| 级别 | 属性 | 备注 |
|---|---|---|
| 必需 | `name`、`address` | 缺了就不在讨论范围 |
| 推荐 | `geo` | 坐标精度<strong>至少小数点后5位</strong> |
| 推荐 | `openingHoursSpecification` | 营业时间的机器可读形式 |
| 推荐 | `priceRange` | 达到100字符就不展示 |
| 推荐 | `servesCuisine`、`url`、`telephone`、`menu` | 餐厅的话基本都该填 |

官方指引说类型要用尽可能具体的 LocalBusiness 子类型，文档里举的例子正是 `Restaurant`。营业时间用 `OpeningHoursSpecification` 对象表达：时段相同的日子合并进一个对象的 `dayOfWeek` 数组，不同的各开一个对象。深夜营业（周六 18:00 开门、凌晨 03:00 打烊）写在同一个对象里跨过午夜；全天营业写 00:00〜23:59；休息日把 opens 和 closes 都写成 "00:00"；节假日等临时变更用带 `validFrom`/`validThrough` 的独立规格叠加。每种写法官方文档里都有现成示例。

先泼一盆冷水：加了这段标记，地图排名不会因此上升。这件事我在"诚实的边界"一节里引官方文档细说。

## 把平文字符串搬进 schema 的转换器

转换器用 TypeScript 写，类型来自 Google 开源的 [schema-dts](https://github.com/google/schema-dts) 2.0.0，它把整个 schema.org 词汇表做成了 TypeScript 类型。核心三十行左右：

```typescript
import type { OpeningHoursSpecification, DayOfWeek } from "schema-dts";

const DAY_MAP: Record<string, DayOfWeek> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toOpeningHours(raw: string): OpeningHoursSpecification[] {
  const parsed: Record<string, string> = JSON.parse(raw);
  const groups = new Map<string, DayOfWeek[]>();
  for (const [day, hours] of Object.entries(parsed)) {
    const dow = DAY_MAP[day.toLowerCase()];
    if (!dow) throw new Error(`unknown day key: ${day}`);
    // "11:00-14:00,17:00-22:00" 这类午晚两段营业按逗号拆成独立规格
    const ranges = hours.trim().toLowerCase() === "closed"
      ? ["00:00-00:00"] : hours.split(",");
    for (const range of ranges) {
      const key = range.trim();
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(dow);
    }
  }
  return [...groups.entries()].map(([hours, days]) => {
    const [opens, closes] = hours.split("-").map(s => s.trim());
    if (!TIME_RE.test(opens) || !TIME_RE.test(closes))
      throw new Error(`unparseable hours "${hours}"`);
    return { "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: days.length === 1 ? days[0] : days, opens, closes };
  });
}
```

灌进真实存储数据，七天合并成三个对象：周一到周四 11:00-22:00，周五周六 11:00-23:00，周日 11:00-21:00，和 Google 文档示例的合并方式一致。拼上 name、address、geo 之后的最终标记如下：

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "新宿ラーメン通り",
  "alternateName": "Shinjuku Ramen Street",
  "address": { "@type": "PostalAddress", "streetAddress": "東京都新宿区西新宿1-1-1",
               "addressLocality": "新宿区", "addressRegion": "東京都", "addressCountry": "JP" },
  "geo": { "@type": "GeoCoordinates", "latitude": 35.6919, "longitude": 139.7038 },
  "servesCuisine": "Ramen",
  "priceRange": "$$",
  "url": "https://example.com/restaurants/mock-1",
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday"], "opens": "11:00", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Friday","Saturday"], "opens": "11:00", "closes": "23:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "11:00", "closes": "21:00" }
  ]
}
```

多语言服务还得定一条店名策略：本地写法（日文店名）放 `name`，罗马字写法放 `alternateName`，因为地图和本地搜索实际比对的是本地写法。整段标记提交 schema.org 官方校验器，结果零错误、零警告。

输出位置只考虑服务端。SvelteKit 里就是在店铺详情页的 server load 里跑转换器，序列化后塞进 `svelte:head`，并把 `<` 转义成 `\u003c`，防止店名或简介里的字符破坏 script 标签。为什么不用客户端注入？[之前实测过](/zh/blog/zh/localbusiness-structured-data-server-side-vs-js-2026/)：不在原始 HTML 里的结构化数据，对任何跳过渲染的采集方来说等于不存在。

## 模型说不出口的事：两段营业、最后点单、坐标精度

转换器第一版在 `"11:00-14:00,17:00-22:00"` 这种午晚两段营业上直接抛异常。我起初以为是 schema 的限制，错了。schema.org 用<strong>同一天挂两个 OpeningHoursSpecification</strong>就能干净地表达两段营业：周一 11:00-14:00 一个对象，周一 17:00-22:00 再一个。表达不了的不是 schema，而是我自己"一天一条字符串"的内部模型。第二版按逗号拆分，问题解决。

但确实也有 schema 里没有的东西。日本餐厅信息里几乎必备的"最后点单"（L.O. 21:30）就是。schema.org 的营业时间词汇里没有对应属性，Google 文档也不提。塞在字符串里的 `"11:00-22:00 (L.O. 21:30)"`，转换时要么丢弃、要么退回展示层。我选了后者：结构化数据里只放真实的 22:00 打烊，最后点单留在界面和 `description` 里。把 closes 提前写成 21:30 属于与事实不符的标记，不做。

节假日变更正好相反：schema 准备充分，我的模型却没有位置。官方写法很紧凑：

```json
{ "@type": "OpeningHoursSpecification",
  "opens": "00:00", "closes": "00:00",
  "validFrom": "2026-12-30", "validThrough": "2027-01-03" }
```

平时的规格原样保留，把这个对象叠上去即可，比"一天一条字符串"灵活得多。给内部模型加一张临时歇业表、让转换器生成这类规格，已经排进后续任务。

坐标上也栽了一下。Google 建议 `geo` 精度至少小数点后5位，我手里的数据全是4位。4位约等于11米，5位约1.1米。在东京的小巷里，11米就是隔壁楼。转换器现在会把所有4位坐标打上标记。更扎心的是：精度在地理编码那一刻就定死了，采集阶段不强制5位，标记阶段无从补救。

## 同样三个缺陷，喂给三层

接下来是本文的核心实测。手头有三层校验：schema-dts 的编译期类型检查、schema.org 官方校验器、转换器里的运行时正则门禁。顺带一提，校验器不需要浏览器界面，把 HTML 直接 POST 过去就返回 JSON，很适合进 CI：

```bash
curl -s -X POST "https://validator.schema.org/validate" \
  --data-urlencode "html@dist/restaurants/mock-1/index.html"
# 去掉响应开头的 )]}' 之后，tripleGroups[].nodes[] 里
# 有按属性的 errors 以及 numErrors/numWarnings
```

同样三个缺陷逐层投放，结果如下。

![Validation matrix — which layer catches which defect](../../../assets/blog/restaurant-jsonld-opening-hours-validation-2026/validation-matrix.png)

| 植入的缺陷 | tsc --strict + schema-dts | validator.schema.org | 谁能救你 |
|---|---|---|---|
| `dayOfWeek: "monday"`（小写） | <strong>TS2820</strong>: Did you mean "Monday"? | 无错误，悄悄归一化成 `schema.org/Monday` | 类型检查 |
| `"adress"`（属性拼写错误） | <strong>TS2561</strong>: Did you mean 'address'? | <strong>INVALID_PREDICATE</strong>（severe） | 两边都行 |
| `opens: "eleven"` | 放行（Time 本质就是 string） | 放行（零错误） | <strong>没人</strong> |

三行结论各有分量。

小写星期正是我的数据最容易漏出去的错误，毕竟内部全部存成 `"monday"`。能在编译期拦下它的只有 schema-dts。校验器不报错，默默改好了给你看。看着贴心，但我选择不信任这个行为：归一化是校验器自己的实现细节，我没有找到任何文档依据证明 Google 真正的摄取管线有同样的宽容。按官方文档写 `"Monday"` 才是安全解。

属性名拼写错误两层都能抓，还都附赠"是不是想写 address"的提示，修复成本最低，符合预期。

第三行才是麻烦。`opens: "eleven"`，一个压根不是时间的值，<strong>三层里没有一层拦截</strong>。schema-dts 里 `Time` 归根结底是 string 的别名，类型检查无能为力；校验器不检查值的格式。营业时间标记里杀伤力最大的缺陷（时间不是时间），反而穿透力最强。所以转换器里那条 `TIME_RE` 正则不是装饰，是<strong>唯一的防线</strong>。拿掉它，"eleven" 能通过编译、通过校验、一路进到线上 HTML。

这个格局和[对比 axe-core 在 jsdom 与真实浏览器下的表现](/zh/blog/zh/axe-core-ci-a11y-jsdom-vs-browser-2026/)时一模一样：每个工具抓的缺陷各不相同，谁漏了什么只有实测才知道，而漏洞所在之处只能自己立门禁、进 CI 常驻。

## 诚实的边界：这段标记不会抬高你的本地排名

先把期望砍到文档支持的高度。第一，Google 原文写明 "Google does not guarantee that features that consume structured data will show up in search results"，结构化数据给你的是富结果的入场资格，不是保证。第二，关于地图搜索、本地包（local pack）的排名要更冷静。[Google 商家资料的本地排名官方文档](https://support.google.com/business/answer/7091)列出的因素是相关性、距离、知名度三项，整个页面<strong>一次都没有出现"结构化数据"这个词</strong>。本地包的主战场是商家资料的完整度和评价，不是你网站上的 JSON-LD。

那为什么还要做？我的判断：Restaurant 标记的职责不是推排名，而是把<strong>网页这一侧的信息变成机器可读</strong>。它是常规搜索里知识面板、营业时间展示这类富结果的原料；而在读网页的不再只有爬虫的今天，它也是 AI 搜索、生成引擎准确抓取店铺事实的底座。有人问 AI"这家店周日开门吗"的时候，我宁愿做那个 opens/closes 机器可读的页面，而不是只有展示字符串的页面。不过这句话是判断，不是测量——它对 AI 引用的实际影响，我留作另一个待跑的实验，先立此存照。

最后一条边界也记下：本次验证覆盖到 schema-dts 类型检查和校验器的 POST API 为止。Google 的富结果测试需要浏览器界面，进不了这条无头管线，上线前的最终确认仍然要手动过一遍[富结果测试](https://search.google.com/test/rich-results)，这也是官方推荐路径。

## 上线前门禁：营业时间标记检查清单

这次实测沉淀下来的清单，不限餐厅，任何实体店业务都能直接套用。

- [ ] 类型用尽可能具体的子类型（`Restaurant` 而非裸的 `LocalBusiness`），官方指引
- [ ] 营业时间在内部按 opens/closes 拆开存储，不要存展示字符串
- [ ] 时段相同的日子合并进 `dayOfWeek` 数组，两段营业在同一天挂两个规格
- [ ] 休息日 opens=closes="00:00"，跨夜营业在一个对象里跨午夜，临时变更用 `validFrom`/`validThrough`
- [ ] 最后点单这类 schema 没有的信息不要去扭曲 closes，放在标记之外
- [ ] `geo` 至少小数点后5位，而且只能在采集时强制，事后无法补救
- [ ] 用 schema-dts 做类型检查（抓星期、属性名拼写），时间格式要<strong>自建正则门禁</strong>，现成的哪一层都不管
- [ ] 把 validator.schema.org 的 POST API 挂进 CI 盯结构错误，最终用富结果测试收尾

结构化数据最糟的状态不是没有，而是错着挂在线上。错误的营业时间出现在搜索结果里，白跑一趟的顾客会把不信任记在提供信息的页面头上。搞清楚每层校验漏什么、在漏洞处立好门禁，这本身就是实现的一部分。

---

如果你的门店或本地业务网站需要设计结构化数据，或想用这种实测方式审计现有的标记管线，我个人承接相关咨询与实现委托。[联系方式在这里](/zh/contact/)。
