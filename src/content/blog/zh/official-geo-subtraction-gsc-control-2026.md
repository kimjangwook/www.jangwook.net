---
title: 'GEO 控制：开关在 Search Console'
description: '线上 robots.txt 比仓库多 61 行，llms.txt 返回 404。生成式 AI 搜索的控制项在 Search Console。'
pubDate: '2026-08-14'
heroImage: '../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png'
tags:
  - geo
  - seo
  - google-search-console
  - robots-txt
  - ai-search
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.96
    reason:
      ko: 'robots.txt와 스니펫 제어가 AI 검색 노출에 미치는 영향을 함께 다룹니다.'
      ja: robots.txtとスニペット制御がAI検索の表示に与える影響を扱います。
      en: Covers how robots.txt and snippet controls affect visibility in AI search.
      zh: 同样讨论 robots.txt 和摘要控制对 AI 搜索可见性的影响。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.95
    reason:
      ko: 'AI 크롤러 제어와 llms.txt의 실제 역할을 비교합니다.'
      ja: AIクローラー制御とllms.txtの実際の役割を比較します。
      en: Compares AI crawler controls with the actual role of llms.txt.
      zh: 比较 AI 抓取控制和 llms.txt 的实际作用。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.89
    reason:
      ko: '구조화 데이터와 AI 인용에 대한 공식 기준을 이어서 확인할 수 있습니다.'
      ja: 構造化データとAI引用に関する公式基準を続けて確認できます。
      en: Continues with official guidance on structured data and AI citations.
      zh: 可以继续查看结构化数据与 AI 引用的官方标准。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.87
    reason:
      ko: 'JSON-LD를 CI에서 검증하는 실무 흐름으로 이어집니다.'
      ja: JSON-LDをCIで検証する実務フローにつながります。
      en: Follows up with a practical CI workflow for validating JSON-LD.
      zh: 延伸到在 CI 中验证 JSON-LD 的实际流程。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.84
    reason:
      ko: 'JSON-LD 그래프와 엔티티 연결을 더 깊게 다룹니다.'
      ja: JSON-LDグラフとエンティティのリンクを深掘りします。
      en: Goes deeper into JSON-LD graphs and entity linking.
      zh: 进一步讨论 JSON-LD 图和实体关联。
---

8月14日早上我对着 `curl` 发愣：仓库 `public/robots.txt` 45 行，线上 `https://jangwook.net/robots.txt` 106 行。

我以为审完仓库 diff 就够了。错在假设“线上文件一定等于仓库文件”。多出的 61 行不会出现在 pull request 里。

## 先看线上，别先看 GEO 清单

从公开 URL 开始，没登录任何后台。

```bash
curl -sL https://jangwook.net/robots.txt | wc -l
# 106

curl -sI https://jangwook.net/llms.txt
# HTTP/2 404
```

仓库文件 45 行、1,101 字节，线上 106 行、2,937 字节。发布链路里有一段配置没回到 Git。

对比线上响应与本地文件，多出的内容来自 CDN 前缀：`User-agent: *` 下有 `Content-Signal: search=yes,ai-train=no,use=reference`，以及针对训练和 extended 抓取的 `Disallow: /`。线上 Google-Extended 拒绝组出现 2 次，仓库里只有 1 次。

我只确认这些文本在响应里。当天读到的 Search Central robots.txt 文档无法确认 Googlebot 支持 `Content-Signal`。文件里有这行字，不等于 Google 会读。

## `llms.txt` 返回 404，页面照样有另一条路

第三方 GEO 检查表常把 `llms.txt` 放在开头。我对根域名和 `www` 主机发请求，全是 404，文件并未部署。

Google 的官方指南原文写得很直接：

> “Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.”（[Google Search：生成式 AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)）

我没补空文件，也没列入修复项。写它增加维护负担，且没有来自 Google 官方文档的收益证据。

这不代表所有系统都忽略它。Google 只说明 Google Search 的处理方式；若服务其他读取 `llms.txt` 的系统，需单独验证。

## 我抓了 8 个页面，问题不在一个标签

我抓了首页、`/ko/`、`/en/`、`/ko/blog/`、3 篇文章和 `/ko/contact/`，8 个 URL 均返回 HTTP 200。

HTML 解析结果：0 个 `<meta name="robots">`，0 个 `data-nosnippet` 属性。正文仅出现 1 次 `nosnippet`，属于普通文字而非控制标签。

首页 JSON-LD 有 Organization、ImageObject、Person、WebSite；`/ko/` 与 `/en/` 增加 FAQPage；文章页增加 WebPage、SpeakableSpecification、BreadcrumbList、BlogPosting。有结构化数据，不等于 AI 搜索会引用这些页面。

Google 未给生成式 AI 搜索设立单独的结构化数据类型。页面需先被收录且允许展示摘要；即便满足条件，Google 也不保证抓取、收录或展示。

## 真正的开关在 Search Console

Search Console 新增的 Search generative AI control，控制站点是否进入 AI Overviews、AI Mode 以及 Discover 的生成式 AI 功能。

官方提供 3 个状态：包含、排除、沿用父级属性。包含为默认状态；子资源默认继承父级。控制项正逐步向部分网站开放。

设为排除后，站点链接与内容不会出现在生成式 AI 功能中，也不作为回答或预览的输入。生效通常需 1〜2 天，缓存可能让部分内容延迟消失。

官方原文限定了范围：

> “This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.”（[Search Console Help：Search generative AI control](https://support.google.com/webmasters/answer/16908024)）

我没登录 Search Console，无法确认站点当前能否看到控制菜单，也不清楚实际处于哪个状态。文档只能确认规则，不能代替实际查看设置。

## 给产品、设计和开发的本周取舍

若要保持进入 AI Overviews 或 AI Mode 的资格，先做三件事：对比线上与仓库的 `robots.txt`；检查 HTML 是否误放 `noindex`、`nosnippet` 或 `data-nosnippet`；在 Search Console 中核对 Search generative AI control 与父级继承关系。

产品看 106 与 45：线上与仓库之间有 61 行审查空白。设计无需为 AI 拆页面或切碎文案，官方未作要求。开发需将 CDN 前缀纳入发布检查，避免线上脱离仓库。

若目标是靠 `llms.txt` 换取引用，或购买声称能看 Google 内部指标的 GEO 工具，这篇测量结果帮不上忙。两件事均无验证过的收益数据。我也未测量排名、展示、引用、点击、停留时间或转化。

这次测量只证明了一点：决定站点能否进入生成式 AI 搜索的开关，不在 `robots.txt` 或页面标签，而在 Search Console 设置中。至于开关对 jangwook.net 带来多少流量，目前没有数据，不作结论。

## 参考资料

- [Google Search：生成式 AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Search Console Help：Search generative AI control](https://support.google.com/webmasters/answer/16908024)
