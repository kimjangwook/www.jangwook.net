---
title: 'I Authored Six of the Seven Places My Title Is Declared'
description: 'Six title channels agreed across 1,296 pages. The seventh, inbound anchor text, matched the target heading on only 0.7% of 18,296 links, and one wrapper element caused all of it.'
pubDate: '2026-08-01'
heroImage: '../../../assets/blog/title-declaration-channels-anchor-text-audit-2026/hero.png'
tags:
  - SEO
  - Accessibility
  - Anchor Text
  - Structured Data
  - Web Development
faq:
  - question: 'Does matching anchor text to the page title improve rankings?'
    answer: 'There is no basis for that claim and I am not making it. Google documentation lists anchor text and text within links pointing to a page as sources it may draw on when generating a title link. It says nothing about rankings. I fixed mine for three other reasons. A screen reader was announcing one link name that ran 367 characters, a single link was swallowing the date, title, description and tags of an entire card, and I had never once reviewed the text Google explicitly says it consults.'
  - question: 'Can I keep the whole card clickable while shortening the link text?'
    answer: 'Yes. Wrap the link around the title text only, give the card position: relative, then give the link an ::after with position: absolute and inset: 0. The click target stays the full card while the anchor text and accessible name shrink to a single title. There is a cost: body text under the overlay becomes hard to select with a mouse.'
  - question: 'Will syncing JSON-LD headline with the title change my title link?'
    answer: 'No. The headline property of Article or BlogPosting does not appear in the list of sources Google names for title links. It is a recommended property of Article structured data, and the documentation suggests keeping titles concise because long ones may be truncated on some devices. Syncing it is consistency hygiene, not a lever on the title link.'
  - question: 'How do I make this audit permanent?'
    answer: 'Parse the build output, pull title, h1, og:title, headline and the RSS title for each page, compare them as strings, and exit non-zero on any mismatch. Two more checks earn their keep: a length ceiling on anchor text pointing at content pages, and a rule that the writing system of the title matches html lang. The second one caught real bugs on my site.'
relatedPosts:
  - slug: internal-link-trailing-slash-redirect-audit-2026
    score: 0.76
    reason:
      ko: 같은 dist 전수 스윕을 쓰지만 보는 곳이 다르다. 그쪽은 링크가 가리키는 주소의 형태를 셌고, 이쪽은 그 링크 안에 들어 있는 글자를 센다.
      ja: 同じdist全数スイープを使いながら、見ている場所が違う。あちらはリンクが指す住所の形を数え、こちらはそのリンクの中に入っている文字を数えた。
      en: Same full sweep over build output, different target. That post counted the shape of the URL a link points at; this one counts the characters sitting inside the link. The language switcher shows up as structural noise in both.
      zh: 同样是对构建产物做全量扫描，看的地方却不同。那一篇数的是链接指向的地址形态，这一篇数的是链接内部装着的文字。
  - slug: accessible-name-agents-2026
    score: 0.71
    reason:
      ko: 링크의 접근성 이름이 무엇으로 계산되는지 알고 나면, 카드 전체를 감싼 앵커가 왜 367자짜리 이름을 만들어내는지가 바로 보인다.
      ja: リンクのアクセシブルネームが何から計算されるかを知ると、カード全体を包んだアンカーがなぜ367文字の名前を作るのかが一目でわかる。
      en: Once you know how a link's accessible name gets computed, it becomes obvious why an anchor wrapped around a whole card produces a 367-character name. The fix here just runs that algorithm backwards.
      zh: 一旦了解链接的可访问名称是如何计算出来的，就能立刻看懂包裹整张卡片的锚点为何会生成一个 367 字的名称。
  - slug: table-markup-a11y-llm-extraction-2026
    score: 0.64
    reason:
      ko: 마크업 하나를 바꿨을 때 접근성 트리와 텍스트 추출이 동시에 흔들린다는 점이 같다.
      ja: マークアップを一つ変えると、アクセシビリティツリーとテキスト抽出が同時に揺れる。
      en: Change one bit of markup and both the accessibility tree and text extraction shift at once. With tables it was row recovery that broke; with links it's the title that gets buried.
      zh: 改动一处标记，可访问性树和文本抽取会同时受影响。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.58
    reason:
      ko: headline이 어느 엔티티에 붙어 있는지가 이 글의 채널 정리와 이어진다.
      ja: headlineがどのエンティティに付いているのかは、本稿のチャネル整理とつながる。
      en: Which entity carries the headline, and which URL that entity claims, connects straight to the channel inventory here. The structured-data title rides on top of that entity model.
      zh: headline 挂在哪个实体上、那个实体又指向页面的哪个 URL，与本文的通道梳理是同一条线。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.55
    reason:
      ko: 언어별 파일이 한 벌로 움직이는 사이트에서는 한 언어판만 어긋나도 조용히 잘못된 신호가 나간다.
      ja: 言語別ファイルが一組で動くサイトでは、一つの言語版がずれるだけで静かに誤った信号が出る。
      en: On a site where the language files move as one set, a single drifting version quietly emits the wrong signal. This time the drift wasn't in hreflang but in the language of the title itself.
      zh: 在各语言文件成组移动的站点上，只要一个语言版本错位，就会悄悄发出错误信号。
---

Six of the seven places my site declares a title come from a single field in frontmatter. The seventh comes from the other 1,300 pages, and I had never looked at it.

When I finally pulled every internal link pointing at an article and read what was inside it, the longest one ran 367 characters.

## A title is written once and published seven times

Start with the ground floor. On the web, "page title" isn't one value. It's a bundle of channels with different consumers, and each consumer reads a different declaration.

`<title>` feeds the browser tab, the bookmark, and the raw material for a search result. W3C's WCAG 2.2 makes it a Level A requirement under Success Criterion 2.4.2 Page Titled. The criterion reads "Web pages have titles that describe topic or purpose," and the [Understanding document](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html) explains that user agents surface the title so people can identify the page, and that users with cognitive disabilities, limited short-term memory, or reading disabilities benefit from identifying content by its title. So the title is an accessibility requirement before it's ever an SEO asset.

`<h1>` is the visible heading, the top of the document outline, and the starting point for heading navigation in a screen reader. `og:title` is what social cards and messenger previews read. `twitter:title` is a variant of the same. The RSS `<title>` is what feed readers paint in a list. JSON-LD `headline` is a property of Article structured data.

One distinction is worth nailing down before going further. `headline` is not on Google's list of title link sources. [Control your title links in search results](https://developers.google.com/search/docs/appearance/title-link) names the content of `<title>` elements, the main visual title on the page, heading elements such as `<h1>`, the content of `og:title` meta tags, other content made large and prominent through styling, other text on the page, anchor text on the page, text within links pointing to the page, and `WebSite` structured data. `headline` is a recommended property of [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), where the guidance is to keep titles concise because long ones may be truncated on some devices. That same page states plainly that "Google does not guarantee that features that consume structured data will show up in search results." Keeping `headline` in sync with `<title>` is consistency work. It is not a lever on what appears in search.

Then there's the last channel. The text of every link pointing at this page from somewhere else. It isn't in the page's own file. It's scattered across 1,300 other pages, and it's usually written by a component rather than a person.

## Six channels agreed on every single page

The site publishes 324 posts per language, 1,296 across four languages. I parsed the whole `dist/` output, pulled five channels from every article page, and matched them against the separately generated RSS feed.

```js
// Pull every title channel from each built article page and compare as strings
const $ = cheerio.load(readFileSync(file, 'utf8'));
const rec = {
  title:    norm($('head > title').first().text()),
  h1:       norm($('h1').first().text()),
  ogTitle:  norm($('meta[property="og:title"]').attr('content')),
  twTitle:  norm($('meta[property="twitter:title"]').attr('content')),
  headline: null,
};
$('script[type="application/ld+json"]').each((_, el) => {
  const data = JSON.parse($(el).contents().text());
  const nodes = Array.isArray(data) ? data : (data['@graph'] ?? [data]);
  for (const n of nodes) if (n?.headline && !rec.headline) rec.headline = norm(n.headline);
});
```

The result was boring in the best way. All 1,296 articles carried all five channels, and `title == og:title`, `title == h1`, `title == headline`, and `h1 == RSS title` each came back at 100%. Lengths held steady too: 13 characters minimum, median 46, p90 of 59, maximum 70. Ninety-seven titles run past 60 characters, but 60 is a community rule of thumb, not a documented Google limit. The official page gives no character count at all. Treat it as a reference number.

That perfect agreement isn't good architecture. It's simple architecture. All five channels render from one `title` field in frontmatter, so there's nowhere for drift to enter. Flip that around and the warning becomes obvious: if your CMS or SSR template reads a different field per channel, you will not see 100%. On that kind of site, this script finds something on day one.

## Nobody was hand-writing the seventh channel

Here's where it stopped being boring. I collected the anchor text of all 18,296 internal links pointing at article pages and compared each one to the `<h1>` of the page it targets.

| Measure | Before |
|---|---|
| Internal links pointing at articles | 18,296 |
| Anchor text exactly equal to the target `<h1>` | 121 (0.7%) |
| Contains the target `<h1>` but runs longer | 5,185 (28.3%) |
| Neither | 12,990 (71%) |
| Anchor length p90 / p99 / max | 144 / 290 / 367 chars |
| Anchors over 150 characters | 1,716 |

I opened the 367-character one. Date, reading time, title, description, three tags, and "Read more." It was the entire contents of one blog card, flattened into a single link.

The cause was one wrapper.

```astro
<!-- Before: the whole card is one link -->
<article class="post-card">
  <a href={href} class="post-card__link">
    <div class="post-card__media">
      <Image src={heroImage} alt={title} ... />
    </div>
    <div class="post-card__body">
      <time>{date}</time> · <span>{readingTime} min</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div class="post-card__tags">...</div>
      <span>{readMoreLabel}</span>
    </div>
  </a>
</article>

```

This pattern is everywhere, because it's the cheapest way to make a whole card clickable. The bill arrives in three places at once.

Accessibility first. A link's accessible name is computed by concatenating the text it contains. My thumbnail also carried the title as its `alt`, so the title landed in the name twice. A screen reader user tabbing through a list of links hears one item read out as a 367-character paragraph. I've written before about [how accessible names get computed](/en/blog/en/accessible-name-agents-2026/); that time I was looking at buttons, and this time the same algorithm bit me from the other direction.

Second, this is the text Google says it consults. The documentation notes that when an issue is detected on a page, it may try to generate an improved title link from anchors, on-page text, or other sources. Every article on my site was pointing at every other article with a blob of date plus title plus description plus tags.

Third, everything that reads the link graph. For a crawler that parses HTML and never runs JavaScript, anchor text is close to the only signal describing how two documents relate. I'd measured that [AI crawlers don't render your JavaScript](/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026/) and had been careful about that channel ever since, while my own cards were flattening it.

## Wrap the link around the title, then take the click target back

The fix is well known. The anchor wraps the title text only, and a pseudo-element restores the click area you just gave up.

```astro
<article class="post-card">
  <div class="post-card__media" aria-hidden="true">
    <Image src={heroImage} alt="" ... />
  </div>
  <div class="post-card__body">
    <time>{date}</time> · <span>{readingTime} min</span>
    <h3><a href={href} class="post-card__link">{title}</a></h3>
    <p>{description}</p>
    <div class="post-card__tags">...</div>
    <span class="post-card__read" aria-hidden="true">{readMoreLabel}</span>
  </div>
</article>

<style>
  .post-card { position: relative; }

  /* The link wraps the title. The overlay carries the card-wide click target. */
  .post-card__link::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  .post-card__link:focus-visible {
    outline: 2px solid var(--flow-deep);
    outline-offset: 3px;
  }
</style>
```

Three details travel with the change. Set the thumbnail `alt` to an empty string, since the title link already states the destination and there's no reason to announce it twice. Give decorative text like "Read more" an `aria-hidden="true"`. And move your hover selectors from `.post-card__link:hover` to `.post-card:hover`, or the card goes dead under the cursor.

Declare the focus ring explicitly too. The link just shrank to the size of a heading, so the default focus indicator no longer reads as clearly inside the card.

The overlay has an honest cost. Body text underneath `inset: 0` becomes awkward to drag-select with a mouse. If people need to copy the blurb out of your card, reconsider the pattern. On a blog index I decided that almost never happens.

I applied the same change in three places: the blog index card, the related-posts list at the foot of every article, and the latest-post cards on the multilingual landing page. The related-posts list was worse than the index, because each item carries a recommendation sentence under the title, and the anchor was eating that too.

## Fixed it, then measured again

Same script, same corpus. The link count is identical at 18,296. What changed is what's inside them.

| Anchor text length | Before | After |
|---|---|---|
| 1-30 chars | 11,792 | 12,294 |
| 31-70 chars | 2,132 | 5,947 |
| 71-150 chars | 2,656 | 55 |
| 151-300 chars | 1,605 | 0 |
| Over 300 chars | 111 | 0 |
| p90 / p99 / max | 144 / 290 / 367 | 52 / 67 / 111 |
| Exactly equal to target `<h1>` | 121 (0.7%) | 5,285 (28.9%) |

![Anchor text length distribution before and after. The 1,716 links running past 150 characters dropped to zero, and anchors exactly matching the target title went from 121 to 5,285.](../../../assets/blog/title-declaration-channels-anchor-text-audit-2026/anchor-text-length.png)

I checked it in a real browser as well. Headless Chromium via Playwright, viewport 1100 pixels wide: the first card measures 1036×329, contains exactly one anchor, and `document.elementFromPoint` at 75% across and 80% down the card box, out in the tag row, resolves to the link. The overlay is holding the click target. Layout came through untouched.

![The blog index card after the change. Same two-column grid, same spacing, with the link now wrapping a single line of title text.](../../../assets/blog/title-declaration-channels-anchor-text-audit-2026/card-after.png)

One number in that table invites a bad conclusion. Only 28.9% of anchors exactly match the target `<h1>`, so 71% still differ. That isn't a defect. Split it by the component that generated each link and the picture resolves.

| 12,990 anchors that differ from the title | Count | Verdict |
|---|---|---|
| Header language switcher | 5,184 | Correct. "KO 한국어" names the destination |
| Article-page language switcher | 3,888 | Correct. Points at the same post in another language |
| Contextual links inside post bodies | 3,846 | Correct. Should describe the target in the sentence's own terms |
| Everything else | 72 | Lists and navigation |

Forcing contextual body links to repeat the target's title would make them worse, not better. Inside a sentence, "AI crawlers don't render your JavaScript" reads better as a phrase shaped for the reader. Language switchers are the same story, and they're the structural false positive I [separated out during the trailing-slash audit](/en/blog/en/internal-link-trailing-slash-redirect-audit-2026/). The goal was never "every anchor should be a title." It's "don't say something other than the title in the place that's supposed to say the title."

Fifty-five anchors still run past 70 characters after the fix. All of them are contextual links I wrote by hand inside post bodies. Not one is component output.

## What to watch, channel by channel

Sorting the seven channels by who reads them and who writes them makes the decisions easy.

| Channel | Primary consumer | Who writes it | Common failure | What to do |
|---|---|---|---|---|
| `<title>` | Browser, search, assistive tech | Human, via template | Empty, duplicated, site name repeated | WCAG 2.4.2 Level A. Unique per page |
| `<h1>` | Screen, heading navigation | Human | Missing, or several per page | Exactly one, matching the visible title |
| `og:title` | Social and messenger previews | Template | Drifts away from title | Render from the same source |
| `twitter:title` | Some clients | Template | Left stale | Mirror og:title or omit it |
| JSON-LD `headline` | Structured data consumers | Template | Mistaken for a ranking lever | Recommended property. Concise and consistent |
| RSS `<title>` | Feed readers | Feed generator | Out of step with the post heading | Render from the same field |
| Inbound anchor text | Search, crawlers, screen readers | **Components** | Swallows the whole card, runs long | Link the title only, restore clicks with an overlay |

Only the last row is genuinely dangerous. The first six sit in one file, visible to the eye, and a wrong value looks wrong. The last one is written down nowhere. Until you fix the component, it isn't even counted.

From a team perspective this is a textbook shape for technical debt. Seven declaration points, six of them in review, and the seventh changes only as a side effect of UI work. A ticket that says "make the whole card clickable" has no reason to pass through an SEO or accessibility review. Which is exactly why this class of problem needs a gate rather than someone's attention.

## A title in the wrong script is a documented rewrite trigger

The same sweep let me check WCAG 2.4.2 across all 1,336 pages. One page had an empty `<title>`: an ad network ownership-verification stub sitting in `public/`. It isn't a content page, so counting it as an accessibility failure would be a stretch, but an HTML file with no title is shipping in my build output and that's worth writing down.

The duplicates mattered more. Two groups of pages shared a byte-identical `<title>`, four pages in total.

- `en/iterative-review-cycle-methodology` had an English body with a Korean `<title>` and `description`
- `ko/barracuda-cuda-amd-compiler` had a Korean body with a Japanese `<title>`

Google's title link documentation lists a mismatch between the title and the page's primary language or writing system among the reasons it may rewrite a title link. My pages landed squarely in a case the documentation names. On a site where four language versions move as one set, that drift is unsurprising: copy one version's frontmatter, forget to swap the title, and it survives. Both are fixed, and duplicate title groups are now zero.

I checked the extraction side too. Feed an article page to Readability 0.6.0 and it returns a title identical to the `<h1>`. Convert the `<body>` alone to text and the first line is the skip link, the second is header navigation, and no title appears until the `<h1>` shows up. For any pipeline that scrapes body text only, `<h1>` is effectively the sole title signal.

## Where my evidence stops

Some honest boundaries.

I measured what my site emits, not what Google does with it. I have not observed a title link being rewritten for any of my pages, and I hold no before-and-after impression data. I'm not claiming that aligning anchor text with titles moves rankings. The official documentation does not connect title links to ranking, and it explicitly declines to guarantee that structured-data features will appear in search results at all.

The 60-character title budget is convention, not an official number. Ninety-seven of my posts exceed it, and I don't consider that a reason to rewrite them.

The accessibility side is not ambiguous. A 367-character link name is bad design under any reading. A link that recites an entire card where a title belongs is uncomfortable for a person first, whatever a search engine decides to do with it. That was reason enough for me.

## Checklist: four counts you can run today

Run these against build output. Not the dev server, the `dist/` directory. Half the problem never appears in source, because components create it.

1. **Channel diff.** Pull `title`, `h1`, `og:title`, JSON-LD `headline`, and the RSS title per page and compare them as strings. Any mismatch fails.
2. **Anchor length ceiling.** Count anchor text over your threshold (mine is 70 characters) pointing at content pages. Fails if it's component output, passes if it's a contextual link in body copy.
3. **Title uniqueness.** Empty `<title>`, or the same title on two or more pages, fails. This is where WCAG 2.4.2 Level A lands.
4. **Title language match.** Check that the writing system of `<title>` matches `html[lang]`. On a multilingual site, this one catches the most.

The skeleton of the gate is short.

```js
const fails = [];
for (const page of articles) {
  if (page.title !== page.h1) fails.push(`h1 drift: ${page.path}`);
  if (page.title !== page.ogTitle) fails.push(`og:title drift: ${page.path}`);
  if (page.title !== page.headline) fails.push(`headline drift: ${page.path}`);
}
for (const a of componentAnchors) {
  if (a.len > 70) fails.push(`anchor ${a.len} chars: ${a.from} -> ${a.to}`);
}
if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
```

How you wrap one card decides the link text of an entire site. It took me 1,296 posts to notice. If you're running a site where nobody has ever counted the text your components generate, the numbers are probably close to mine. Anyone who wants to open theirs up together can reach me through the contact path on my [profile](/en/about/).

---

*Sources: Google Search Central, [Control your title links in search results](https://developers.google.com/search/docs/appearance/title-link) and [Article (Article, NewsArticle, BlogPosting) structured data](https://developers.google.com/search/docs/appearance/structured-data/article); W3C WAI, [Understanding SC 2.4.2: Page Titled](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html). Measurement setup: my own Astro build output, 1,336-1,338 HTML pages, 1,296 article pages, parsed in full with Node 22.22 and cheerio 1.2.0. Browser verification used Playwright Chromium (headless, 1100px viewport); extractor checks used @mozilla/readability 0.6.0 and html-to-text 10.0.0. Every figure comes from this site and this build, and none of it is a statement about how Google processes anything.*
