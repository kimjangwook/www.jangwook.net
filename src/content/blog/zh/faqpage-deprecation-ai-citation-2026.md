---
title: 'FAQ富媒体结果已经结束，但别急着删掉Q&A标记'
description: Google在2026年5月7日彻底停用了FAQ富媒体结果。把FAQPage JSON-LD丢进离线校验器，schema能通过，可富媒体结果返回的是DEPRECATED。就在"通过"与"可见"分岔的这个点上，本文依据Google官方文档，梳理Web开发者现在该如何改代码和内容。
pubDate: '2026-07-25'
heroImage: ../../../assets/blog/faqpage-deprecation-ai-citation-2026/hero.png
tags:
  - SEO
  - 结构化数据
  - JSON-LD
  - GEO
  - AIO
relatedPosts:
  - slug: restaurant-jsonld-opening-hours-validation-2026
    score: 0.72
    reason:
      ko: 저 글은 Restaurant JSON-LD가 검증기를 통과해도 값이 엉터리일 수 있다는 걸 쟀고, 이 글은 검증을 통과해도 리치 결과가 안 나오는 경우를 다룬다. "통과 ≠ 목적 달성"이라는 같은 함정의 두 얼굴이다.
      ja: あちらはRestaurant JSON-LDが検証を通っても値が出鱈目でありうると測った記事、本記事は検証を通ってもリッチリザルトが出ない場合を扱う。「通過≠目的達成」という同じ罠の裏表だ。
      en: That post measured how Restaurant JSON-LD can pass validation while holding garbage values; this one covers markup that passes validation yet produces no rich result. Two faces of the same "valid ≠ done" trap.
      zh: 那篇测的是Restaurant JSON-LD即便通过校验、值也可能是错的；本文讲的是通过校验却拿不到富媒体结果。同一个"通过≠达标"陷阱的两面。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.68
    reason:
      ko: CI에서 JSON-LD를 자동 검증하는 파이프라인을 만들었다면, 그 게이트가 "스키마 유효성"만 보고 "실제 노출 가치"는 못 본다는 이 글의 지적이 바로 다음 질문이다.
      ja: CIでJSON-LDを自動検証するパイプラインを組んだなら、そのゲートが「スキーマ有効性」だけ見て「実際の露出価値」を見ないという本記事の指摘が次の問いになる。
      en: If you built a CI pipeline that auto-validates JSON-LD, this post's point — that the gate checks schema validity but not real-world value — is your next question.
      zh: 如果你已经搭好CI里自动校验JSON-LD的流水线，那么本文的提醒——门禁只看"schema有效性"却看不到"实际曝光价值"——正是下一个问题。
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.6
    reason:
      ko: 리치 결과가 사라진 자리를 AI Overviews가 채우는 흐름이라면, 스니펫과 AI 노출을 robots 지시로 통제하는 저 글이 이 글의 GEO 파트와 짝을 이룬다.
      ja: リッチリザルトが消えた場所をAI Overviewsが埋める流れなら、スニペットとAI露出をrobots指示で制御するあの記事が本記事のGEOパートと対になる。
      en: If AI Overviews are filling the space rich results left behind, that post on controlling snippets and AI exposure via robots directives pairs with this article's GEO section.
      zh: 如果AI Overviews正在填补富媒体结果退场后的空位，那篇用robots指令控制摘要与AI曝光的文章，正好与本文的GEO部分配套。
  - slug: structured-data-syntax-comparison-jsonld-microdata-rdfa-2026
    score: 0.55
    reason:
      ko: FAQPage를 어떤 문법으로 넣든(JSON-LD/Microdata) 리치 결과 종료는 동일하게 적용된다. 문법 선택을 다룬 저 글과 함께 읽으면 "어떻게 넣나"와 "넣어서 뭐가 남나"가 이어진다.
      ja: FAQPageをどの構文で入れても(JSON-LD/Microdata)リッチリザルト終了は同じく適用される。構文選択を扱ったあの記事と併読すると「どう入れるか」と「入れて何が残るか」が繋がる。
      en: Whatever syntax you use for FAQPage (JSON-LD or Microdata), the rich-result shutdown applies equally. Read alongside that syntax-comparison post to connect "how to mark up" with "what's left after you do."
      zh: 无论用哪种语法写FAQPage（JSON-LD还是Microdata），富媒体结果的关停同样适用。与那篇讲语法选择的文章合读，就把"怎么写"和"写了还剩什么"串起来了。
---

到现在还有不少站点在往页面里塞FAQPage JSON-LD，等着搜索结果里展开一个折叠问答。2026年的今天，那个折叠框不会出现了。因为Google从2026年5月7日起，彻底停止了FAQ富媒体结果的展示。

但要说"富媒体结果没了，那就把FAQPage标记全删掉"，我不认同。富媒体结果的死亡，和Q&A结构的失效，是两码事。这篇文章就是把这两者拆开来看的记录。我在临时沙箱里真的跑了一遍FAQPage的离线校验，亲眼确认"schema通过、可什么都不展示"这个分岔点在哪，再依据官方文档，理清现在代码和内容该怎么动。

## FAQPage和QAPage，当初到底差在哪

先把地基打好。就当读到这里的你是第一次碰结构化数据。

结构化数据，是在给人看的HTML之上，另外叠一层给机器读的语义信息。schema.org定义这套词汇，通常以 `<script type="application/ld+json">` 块的形式放进页面。搜索引擎会参考这些提示，为搜索结果做出一种特殊样式（富媒体结果）。关键词是"会"，不是"一定"。今天要讲的全部，就卡在这个区别上。

FAQPage表示的，是"一个问题对应发布者定下的一个官方答案"的页面。产品帮助、价格说明、配送政策这类页面最典型。它的表亲QAPage性格不同：那是给社区页面用的，用户贴出多个答案、其中一个被采纳，比如论坛或问答板。发布者单一答案就是FAQPage，多个用户答案就是QAPage。这个区分至今有效，今天结束的是FAQPage那一侧的富媒体结果。

FAQPage JSON-LD最小骨架长这样：

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "配送需要几天？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "按工作日计2到3天。"
      }
    }
  ]
}
```

必填很简单。`FAQPage` 下一个 `mainEntity` 数组，每项是 `Question`，带 `name`（问题文本）和 `acceptedAnswer`（`Answer` 加 `text`）。这个骨架自2019年推出以来就没变过。变的是你放进去之后，Google替你做的那份活。

## 到底发生了什么：2023年的缩减，2026年的终结

Google对FAQ富媒体结果动手，这不是头一回。按时间顺序捋一遍。

2023年8月，Google公告了[HowTo和FAQ富媒体结果的变更](https://developers.google.com/search/blog/2023/08/howto-faq-changes)。官方原话是：FAQ富媒体结果只对"知名且权威的政府和医疗（government and health）网站"展示，其余站点不再常规出现。HowTo富媒体结果则被整个取消。到那时，大多数普通站点上的FAQ折叠框其实已经消失了。

随后到2026年，剩下的流程走完。依据Google官方changelog和FAQPage文档整理，是这样：

| 时间 | 停用了什么 |
|---|---|
| 2023-08 | FAQ富媒体结果限定给政府/医疗权威站点，HowTo整体移除 |
| 2026-05-07 | FAQ富媒体结果在Google搜索中完全停止展示（官方文档标注停用） |
| 2026-06 | Search Console富媒体结果报告、Rich Results Test、搜索呈现筛选中的FAQ支持停止，FAQPage官方文档被删除 |
| 2026-08 | Search Console API对FAQ富媒体结果数据的支持停止 |

结论是：如今任何站点都无法再靠FAQPage JSON-LD拿到搜索结果里的折叠框。连测试工具都不再报告这个类型了。

这里有一条必须钉牢的官方边界。Google从一开始就写明："结构化数据不保证富媒体结果，也不保证排名。"FAQPage的没落，正是这条原则被推到极端的案例。你完全照规范写好，展不展示，全在搜索引擎一念之间。作个参考，某业界分析（SearchEngineLand，非官方）统计，2023年缩减刚过，FAQ富媒体结果的出现率从约54%的SERP掉到约17%。数字本身当参考，但方向和官方终结一致。

## 通过校验，也换不来曝光：我实测了

光嘴上说"通过也没用"太空。所以我在临时沙箱里，把FAQPage JSON-LD直接喂给一个离线校验器：一段约40行的Node脚本，不联网，只查schema.org的必填结构。我放了一个正常样本，一个故意弄坏的样本。

检查逻辑的核心是这样：

```javascript
function validateFaqPage(doc) {
  const errors = [];
  if (doc["@type"] !== "FAQPage") errors.push('@type 不是 "FAQPage"');
  const items = Array.isArray(doc.mainEntity) ? doc.mainEntity : [];
  if (items.length === 0) errors.push("mainEntity 里没有 Question");
  items.forEach((q, i) => {
    if (!q.name?.trim()) errors.push(`mainEntity[${i}] 缺 name — 必填`);
    const a = q.acceptedAnswer;
    if (!a) errors.push(`mainEntity[${i}] 缺 acceptedAnswer — 必填`);
    else if (!a.text?.trim()) errors.push(`mainEntity[${i}] 缺 answer.text — 必填`);
  });
  return errors;
}
```

跑出来是这样：

```text
[faqpage-sample.jsonld]
  schema-structure   : PASS
  google-rich-result : DEPRECATED (2026-05-07 停止展示富媒体结果)

[faqpage-broken.jsonld]
  schema-structure   : FAIL
  google-rich-result : DEPRECATED (2026-05-07 停止展示富媒体结果)
    - mainEntity[0] 缺 acceptedAnswer — 必填
    - mainEntity[1] 缺 name — 必填
```

正常样本过了结构检查（`PASS`）。可紧挨着的那一行是 `DEPRECATED`。你的校验器再怎么亮绿灯，Google搜索去渲染它的那道口子已经关了。这就是全文的一句话总结：schema有效性和曝光价值是两条轴，而CI门禁只看得到前一条。谁在跑[CI里自动校验结构化数据的流水线](/zh/blog/zh/validate-structured-data-ci-jsonld-2026)，谁就越要记住这个盲区。门禁通过，不等于流量价值附上来。校验器漏掉的还有第二条轴：值本身讲不讲得通。我[把餐厅营业时间的标记过了三层校验](/zh/blog/zh/restaurant-jsonld-opening-hours-validation-2026)，`opens: "eleven"` 这种值一层都没被拦下。

第二个样本里还有一点要看。校验器照样能精准抓出必填字段缺失。也就是说，结构检查本身没死。死的是它后面原本挂着的Google富媒体结果这份奖励。这个区分，决定了下一步怎么判断。

## 那到底删还是留：Google的官方答案和我的判断

最常见的问题："富媒体结果都没了，是不是该把FAQPage标记全扒掉？"

Google官方指引很明确：没必要主动删除。没被用到的结构化数据不会给搜索带来问题，但也没有可见效果。留着无害，删了也不亏。单看Google富媒体结果这一条轴，FAQPage JSON-LD如今就是一段中性的死代码。

换我，新页面不会再费劲为Google去加FAQPage JSON-LD。视觉回报是零的标记，没理由让它进我的维护清单。反过来，老站点里已经大批埋着的，我也不急着搞一次大迁移去扒掉。Google都说了无害，删除动作本身反而引入回归风险。说实话，这是少见的"积极地什么都不做才最好"的情况。

不过有个前提。别删，说的是JSON-LD块本身。而块里装的Q&A内容，走的是完全另一条路。恰恰相反，它从现在起会更值钱。

## 富媒体结果死掉的位置，AI在读

这才是我写这篇的真正原因。

FAQ富媒体结果退场后腾出的搜索结果空间，正被AI Overviews这类生成式回答迅速填满。而AI回答引擎从页面里抽取信息的方式，跟Google富媒体结果根本不同。富媒体结果读的是JSON-LD这条独立通道。而大多数AI爬虫，是从[渲染出来的真实HTML正文](/zh/blog/zh/ai-crawlers-dont-render-javascript-csr-2026)里抽语义。在这里，"问题 → 就地收尾的简短回答"这个模式，恰好是机器最好引用的形状。

所以FAQPage里真正的资产，从来不是JSON-LD那个类型名，而是它逼你养成的纪律：一句清晰的问题，一段就地收尾的简洁回答。别把这份纪律锁在JSON-LD里，把它拉到看得见的语义HTML中，这才是当下的正解。具体做法：

- 问题用真正的标题元素（`<h2>`/`<h3>`）或定义列表（`<dl><dt>`）标记。AI爬虫直接从正文读到。
- 回答就放在问题紧后面，在一个段落里自我收尾。像"如上文所述"这种依赖上下文的回答，一旦被切成抽取单元就散架。
- 一问一答。把FAQPage原本的性格（发布者单一官方答案）在内容层面保留下来。

但边界要老实钉住。AI引擎实际上更愿意引用这种结构，这是我的实务判断加上多方观察的综合，而不是Google保证过的官方数字（参考值，非官方）。AI Overviews背后的选择逻辑并不公开，我也不去断言排名系统的内部机制。我能笃定的只有一条：机器读的通道已经从JSON-LD挪到了渲染正文，那么投入也该跟着挪过去，这才合理。

## 小结：站在FAQ标记前，现在该下的判断

压成一句：冲着Google富媒体结果去的FAQPage JSON-LD结束了，但Q&A这种内容结构，在AI时代反而在升值。

用一份能立刻照做的清单收尾。

- **新页面**：别为Google富媒体结果去新加FAQPage JSON-LD，视觉回报是零。
- **既有JSON-LD**：别急着扒。Google说无害，删除才是更大的回归风险。若为Bing等其他引擎或schema.org完整性，留着也行。
- **Q&A内容**：别藏进JSON-LD，用能渲染的语义HTML（`<h2>`、`<dl>`）暴露出来。这是AI爬虫读的通道。
- **回答形态**：在问题紧后面就地收尾。依赖上下文的回答，抽取时会碎。
- **校验门禁**：CI的schema校验只担保"结构有效"。要跟团队讲清楚，曝光与被引用的价值是另一条轴。
- **预期管理**：结构化数据既不保证排名，也不保证曝光（Google官方）。FAQPage就是活证据。

把结构化数据稳妥地从服务端输出，或者对照富媒体结果的关停与AI引用的走向，去审一遍现有站点的Q&A结构和schema，这类事我以个人身份接咨询和实现委托。如果你需要有人帮你判断，现有标记里哪些该留、哪些该提到内容层，profile里有联系方式，欢迎来问。
