---
title: 'The page scrolled to a clip. The accordion stayed shut'
description: 'Saturday I compared 17 hide methods. A text fragment scrolled a max-height:0 accordion to 6083px and left it closed. details and hidden=until-found opened.'
pubDate: '2026-08-15'
heroImage: '../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png'
tags:
  - HTML
  - CSS
  - accessibility
  - SEO
  - web-development
faq:
  - question: 'Is a CSS accordion closed the same way a details element is closed?'
    answer: 'Not in this Chromium. window.find returned true on the max-height:0 box, the text-fragment click scrolled to it, and data-open stayed 0. The box height stayed 0. elementFromPoint hit BODY. A closed details fired toggle, flipped open, and brought the sentence into view. Arrival is not reveal.'
  - question: "Should I replace the live FAQ details with hidden=until-found?"
    answer: "I did not. FAQ.astro already uses details.faq-item with the first item open. A #:~:text= jump to a closed answer opened the second details, scrollY 8752. The ancestor revealing algorithm already knows that door. I did not add until-found to the live FAQ and re-ship."
  - question: "Does window.find mean find-in-page will work?"
    answer: "No. I never pressed the real find-in-page UI. I called window.find and clicked #:~:text= links. WHATWG still marks window.find as unspecified (Issue 3539). A real Ctrl/Cmd+F session can differ."
  - question: "Will Google form text-fragment links into my closed answers?"
    answer: "I did not watch a search result or an AI answer emit one. The Chrome docs say Google Search will form such links. That is a vendor claim. I measured whether this Chromium would find, name, hash-scroll, or fragment-open 17 cells. I did not measure a crawler."
relatedPosts:
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.91
    reason:
      ko: 그 글은 인용 링크가 산문에서는 도착하고 pre 안에서는 깨지는 걸 쟀다. 오늘은 그 다음 문, 닫힌 디스클로저 안에 문장이 있을 때 도착이 열리는지다.
      ja: あちらは引用リンクが散文では着き、pre の中では壊れることを測った。今日はその次の扉で、閉じたディスクロージャの中の一文に着いたとき開くかどうかだ。
      en: "That run asked whether a citation link lands in prose versus pre. This one is the next door. What happens when the sentence sits in a closed disclosure."
      zh: "那篇量的是引用链接在散文里能落地、在 pre 里会断。这篇是下一扇门。句子藏在关上的 disclosure 里时，到达会不会把它打开。"
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.84
    reason:
      ko: 그때 잰 건 auto였다. 오늘은 같은 속성 이름 hidden을 저자가 직접 걸면 조상 공개 알고리즘이 거들떠도 안 본다는 쪽이다.
      ja: あちらは auto を測った。今日は同じプロパティ名 hidden を著者が自分で付けても、祖先開示アルゴリズムは見向きもしないという話だ。
      en: "That post measured content-visibility: auto. This one is the same CSS name with the author value hidden, which the ancestor revealing algorithm does not look at."
      zh: "那篇量的是 auto。这篇是作者自己写的 hidden，同一个 CSS 名，祖先展开算法根本不看。"
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.73
    reason:
      ko: FAQ 리치 결과가 끝난 뒤에도 Q&A 마크업을 남긴 이유와, 그 답을 어떤 숨김으로 닫느냐는 별 문제다. 스팸 정책은 아코디언을 숨은 텍스트 남용으로 보지 않는다. 인용 주소가 열리는지는 별 측정이다.
      ja: リッチリザルトが終わったあとも Q&A マークアップを残した理由と、その答えをどの隠し方で閉じるかは別の話だ。スパムポリシーはアコーディオンを隠しテキスト濫用と見ない。引用アドレスが開くかは別の測定だ。
      en: Keeping Q&A markup after FAQ rich results died is one decision. How you hide the answer is another. Spam policy lists accordion hide-show as not hidden-text abuse. Whether a citation address can open the panel is a separate measurement.
      zh: 富结果停了以后仍留下问答标记，是一件事。答案用哪种隐藏合上，是另一件。垃圾政策没把手风琴当成隐藏文本滥用。引用地址能不能把面板打开，得另测。
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.69
    reason:
      ko: 그 글의 inert는 포커스를 가두는 도구였다. 오늘은 같은 속성이 find와 텍스트 프래그먼트를 거절하고 id 해시는 받는 걸 봤다. 문은 두 개다.
      ja: あちらの inert はフォーカスを閉じ込める道具だった。今日は同じ属性が find とテキストフラグメントを拒み、id ハッシュは受け取るのを見た。扉は二つある。
      en: There, inert was the tool that was supposed to trap focus. Here the same attribute refuses find and the text fragment, then accepts a hash to the id. Two doors.
      zh: 那篇里 inert 是用来关住焦点的。这篇里同一个属性拒绝 find 和文本片段，却接受跳到 id 的哈希。门是两扇。
  - slug: content-on-hover-focus-1413-tooltip-2026
    score: 0.62
    reason:
      ko: 툴팁 글은 닫히는 길을 쟀다. 오늘은 닫혀 있던 문장이 검색과 프래그먼트에 열리는 길을 잰다. 숨김이 한 스위치가 아니라는 점은 같다.
      ja: ツールチップの記事は閉じる道を測った。今日は閉じていた一文が検索とフラグメントに開く道を測る。隠しが一つのスイッチではない点は同じだ。
      en: The tooltip post measured how extra content goes away. This one measures how a closed sentence becomes findable and fragment-addressable. Hide is not one switch in either case.
      zh: 工具提示那篇量的是多余内容怎么消失。这篇量的是关上的句子怎么被找到、被片段指到。两边都说明：隐藏不是一只开关。
---

I clicked `#tf-css-maxh`. The href was `#:~:text=TOKENCSSMAXH`. `window.scrollY` jumped to 6083. The accordion still had `data-open="0"`.

The box reported height 0. The paragraph inside reported height 18 and y 399.7. `elementFromPoint(640, 409)` returned `BODY`, not the sentence.

The page had scrolled to a clip. The bytes were still there. The paint was not.

Saturday I put the same unique TOKEN* sentence in 17 boxes on one fixture page and ran them through headless Chromium 143.0.7499.4, Playwright 1.57.0, Node 22.22, viewport 1280×800, local static server under `/tmp`. I expected hidden to be one switch. Boolean `hidden` takes the node out of the render. `hidden=until-found` skips paint and stays findable. `max-height:0` clips a box that is still in the tree. `aria-hidden` names it away from AT. `inert` tells find to skip a painted paragraph.

![A text fragment click scrolled to 6083. The accordion box stayed 0px and elementFromPoint hit BODY](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png)

## The page jumped. The box stayed 0px

I built the CSS accordion the way a lot of front-end code still does. Closed means `max-height: 0` and `overflow: hidden`. `window.find` on that token returned true. The accessibility name list from CDP `Accessibility.getFullAXTree` contained `TOKENCSSMAXH`. The fragment "arrived" by the only ruler I used for arrival: paragraph `getBoundingClientRect` versus the viewport after a 200ms wait.

None of that opened the panel.

A find hit and a scroll are not a <strong>reveal</strong>. The ancestor revealing algorithm only walks two kinds of ancestor: an element whose `hidden` attribute is in the Hidden Until Found state, and a `<details>` whose second slot holds the target and that does not have `open`. A `max-height` rule is not on that walk. The [August 8 run was prose versus `pre`](/en/blog/en/text-fragment-citation-deep-link-audit-2026/). This one is the sentence sitting in a closed disclosure, still painted as a 0px box.

Same token style inside a closed `<details>`. I clicked `#tf-details-closed`. A `toggle` event fired. `open` flipped to true. `scrollY` 4907. The sentence came into view (`pH` 18, `inView` true). Ancestor revealing ran. The CSS accordion never got that algorithm.

## The UA sheet is two rules

I stopped guessing which `hidden` I had shipped and asked `getComputedStyle`.

From [WHATWG HTML, Hidden elements](https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements):

```css
[hidden]:not([hidden=until-found i]):not(embed) {
  display: none;
}

[hidden=until-found i]:not(embed) {
  content-visibility: hidden;
}
```

On `#box-until` with `hidden="until-found"`, `getComputedStyle` gave `display: block` and `content-visibility: hidden`. The IDL getter `HTMLElement.hidden` returned the string `"until-found"`, not boolean `true`. `'onbeforematch' in HTMLElement.prototype` was true on this build.

Boolean `hidden` and `hidden="hidden"` computed to `display: none`. That is the default Hidden state. Empty value and the keyword `hidden` are the same family. They are not the accordion family.

From [the `hidden` attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute):

> Will not be rendered, but content inside will be accessible to find-in-page and fragment navigation.

On the same node, `innerText` did not contain the token. `window.find` returned true. Container box 0×1230. Child paragraph still reported `pH` 18.

## Seventeen hide methods, four doors

One unique token per cell so the find call could not wander. Selection cleared between calls. Four questions on each cell:

- Does `window.find(token)` return true after load
- After a click on `<a href="#:~:text=TOKEN">`, is the paragraph in view
- After a click on `<a href="#p-…">`, is it in view
- Does the CDP accessibility name list contain the TOKEN

| Cell | find | fragment in view | hash in view | AX name |
| --- | --- | --- | --- | --- |
| visible | true | true | true | yes |
| `hidden=""` / `hidden="hidden"` | false | false | false | no |
| `hidden="until-found"` | true | true | true | no |
| until-found + padding box | true | true | true | no |
| until-found + `display:none` | false | false | false | no |
| until-found + `display:inline` | true | true | true | yes |
| `<details>` closed | true | true | true | no |
| `<details>` open | true | true | true | yes |
| author `display:none` | false | false | false | no |
| `visibility:hidden` | false | false | true | no |
| author `content-visibility:hidden` | false | false | false | no |
| `aria-hidden="true"` | true | true | true | no |
| `inert` | false | false | true | no |
| `opacity:0` | true | true | true | yes |
| sr-only clip | true | true | true | yes |
| `max-height:0` | true | true | true | yes |

Ten of 17 found. Ten of 17 fragment-scrolled into view. Twelve of 17 accepted a hash to the id. Six of 17 put the TOKEN in the AX name list.

![Seventeen hide methods against find, fragment, hash, and AX name](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hide-matrix.png)

The two disagreement rows I care about at work are `visibility:hidden` and `inert`. Both accept the hash and refuse the fragment. Find and `#:~:text=` are not the same door as `#id`. I already used `inert` as a focus trap in [the modal measurement](/en/blog/en/modal-focus-escape-inert-measure-2026/). Here the same attribute is painted, box 18×1230, `innerText` true, `window.find` false, fragment `scrollY` 0. Hash to `#p-inert` still landed (`scrollY` 6085).

`aria-hidden="true"` is the other split. Painted. `innerText` true. `window.find` true. Fragment landed (`scrollY` 5542). The AX dump had no name containing `TOKENARIAHIDDEN`. Find could still point at a sentence the accessibility tree would not name.

WAI-ARIA 1.2, from [`aria-hidden`](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden):

> Indicates whether the element is exposed to an accessibility API.

I did not run a screen reader. Name-absent means the AX tree dump had no name value containing the token.

## details opened. max-height only clipped

From [Interaction with `details` and `hidden=until-found`](https://html.spec.whatwg.org/multipage/interaction.html#interaction-with-details-and-hidden=until-found):

> When find-in-page begins searching for matches, all details elements in the page which do not have their open attribute set should have the skipped contents of their second slot become accessible, without modifying the open attribute, in order to make find-in-page able to search through it. Similarly, all HTML elements with the hidden attribute in the Hidden Until Found state should have their skipped contents become accessible without modifying the hidden attribute in order to make find-in-page able to search through them.

I did not press Ctrl+F or Cmd+F. I used `window.find()`. Issue #3539 still tracks standardizing how find-in-page underlies that API. Treat the find column as a proxy, not as the UI.

From [Making collapsed content accessible with hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found):

> Collapsing content sections, sometimes described as an accordion, are a common UI pattern. However, content hidden in the collapsed sections becomes impossible to search using a find-in-page search. Also, it isn't possible to link to text fragments inside collapsed regions.

On `#box-css-maxh`, find was true, the AX name was present, the fragment scrolled, and the box height stayed 0. `max-height:0` is clipped, in the tree, named, and outside the revealing walk.

## until-found leftover size is not a bug

Chrome, same page:

> Some layout APIs such as getBoundingClientRect will report that the hidden content inside the hidden=until-found element takes up space and has a position in the page.

> Child nodes of the hidden=until-found element won't be rendered, but the hidden=until-found element itself will still have a box. This means that CSS properties such as border and explicit size will still affect the rendering.

`#box-until` with no padding: 0×1230 while still `hidden="until-found"`. Child `#p-until` still reported 18. I added 8px margin, 4px gray border, 16px padding on `#box-until-box`. While still until-found, `getBoundingClientRect` was 1214×40, an empty framed box. After the fragment click, `beforematch` fired once, the `hidden` attribute was gone, `scrollY` 4352, `inView` true, box 1214×90.

That 40→90 pair is this fixture. Change the padding and the leftover frame changes.

## display:none on until-found is the trap the spec names

I forced the case the spec calls out. From [the `hidden` attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute):

> The element needs to be affected by layout containment in order to be revealed by find-in-page. This means that if the element in the Hidden Until Found state has a 'display' value of 'none', 'contents', or 'inline', then the element will not be revealed by find-in-page.

`#box-until-none` was `hidden="until-found" style="display:none"`. `window.find` false. Text-fragment click: attribute stayed, no `beforematch`, `scrollY` 0. Hash click to `#p-until-none`: `beforematch` did fire and `hidden` was removed. Leftover was still the author `display:none`. `pH` 0. `scrollY` 0. The browser obeyed the attribute and then lost to the style sheet.

`#box-until-inline` was `hidden="until-found" style="display:inline"`. The sentence was already in `innerText` and in the a11y name list before any click. Fragment left `hidden="until-found"` in place and still scrolled (`scrollY` 4729). Hash click stripped `hidden`. Layout containment was already broken, so "hidden" was a lie.

## Same CSS property, no algorithm hook

I put `content-visibility: hidden` on `#box-cv-hidden` with no `hidden` attribute. `window.find` false. Fragment fail. Hash fail (`scrollY` 0).

That is the same CSS property the UA uses for until-found. The revealing walk looks at the attribute and at `<details>`. The property alone is a dead address. I already measured [`content-visibility: auto` as a render skip that keeps the DOM](/en/blog/en/content-visibility-auto-render-cost-measure-2026/). `hidden` is a different value and, without the attribute, a different job.

WHATWG, still on [the `hidden` attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute):

> Web browsers will use 'content-visibility: hidden' instead of 'display: none' when the hidden attribute is in the Hidden Until Found state, as specified in the Rendering section.

Google's spam policy lists accordion hide-show as not hidden-text abuse. From [Spam policies, Hidden text and link abuse](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-links):

> Accordion or tabbed content that toggle between hiding and showing additional content

That is a policy sentence. It is not a ranking promise. I did not run Rich Results Test on the FAQPage markup. I did not measure an AI crawler. `textContent` / `innerText` / CDP names are browser APIs. Closed `<details>` sitting in `textContent` does not prove the closed answer is indexed. I left the Q&A markup in place after [FAQ rich results died](/en/blog/en/faqpage-deprecation-ai-citation-2026/). How the answer is hidden is a different lever.

Chrome also writes this, and I am quoting it as a vendor claim:

> In addition to allowing find-in-page search on hidden regions, this feature will allow this hidden content to be accessible to search engines. Google Search will even form links that scroll to the revealed fragment.

I did not watch a SERP or an AI answer emit such a link.

## I pointed #:~:text= at a live closed FAQ

The fixture is a lab. The live check used the FAQ this site already ships.

Four `details.faq-item` on `/ko/blog/ko/text-fragment-citation-deep-link-audit-2026/`. HTTP 200. Index 0 already open (`open={index === 0}` in `FAQ.astro`). Indexes 1–3 closed. The sentence I typed was the live answer "코드 블록 자체를 인용 대상으로 만들기는 어렵습니다".

Before the jump, `document.body.innerText` did not contain that sentence. `textContent` did. `window.find` returned true. After `#:~:text=…`, the second details opened (`hitOpen: true`), `scrollY` 8752, `hitTop` 373.

The closed answer was already in `textContent` and `window.find` returned true. The fragment only had to open the disclosure. This site already uses the one hide method the spec knows how to open. I did not add `hidden="until-found"` to the live FAQ and re-ship.

WHATWG on inert, from [Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees):

> The user agent should ignore the node for the purposes of find-in-page.

On the live FAQ I used `<details>`, not `inert`. Hide an answer with `inert` or boolean `hidden` and this Chromium will not find it the way it found that closed item.

## Probe the hide you already shipped

I would not pick a hide method from a blog post. I would paste this on the page that already has the panel.

```js
// UA sheet on a node you think is until-found
const el = document.querySelector('[hidden="until-found"]')
getComputedStyle(el).display
getComputedStyle(el).contentVisibility
el.getBoundingClientRect()
el.firstElementChild && el.firstElementChild.getBoundingClientRect()
```

```js
// boolean hidden is a different family
const h = document.querySelector('[hidden]:not([hidden="until-found"])')
getComputedStyle(h).display
window.find('PUT-A-UNIQUE-TOKEN-HERE')
```

```js
// this site's FAQ.astro uses <details>
[...document.querySelectorAll('details.faq-item')].map((d, i) => ({
  i,
  open: d.open,
  t: d.innerText.slice(0, 60),
}))
document.body.innerText.includes('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
document.body.textContent.includes('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
window.find('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
```

```js
// Chromium: fragment into a closed FAQ answer
location.hash = ''
location.href =
  location.pathname +
  '#:~:text=' +
  encodeURIComponent('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
```

```js
// do not ship until-found as the only hide without this
if (!('onbeforematch' in HTMLElement.prototype)) {
  // closed content will stay closed in this UA
}
```

Wrong for an accordion the user may search: `<div hidden>answer</div>`. Addressable here: `<details>`, or `<div hidden="until-found">` plus a visible toggle that removes `hidden`. `max-height:0` is findable in this Chromium and is not in the ancestor revealing algorithm.

I am keeping `<details>` on this FAQ. Chromium 143 already opens it. Gecko and WebKit are unmeasured. `hidden=until-found` support is not claimed for those engines here. Fixture JSON lived under a `/tmp` lab directory and was not copied into the repo. Text-fragment clicks on the fixture needed a same-document activation. Direct `#:~:text=` navigation also opened until-found and the live closed FAQ in this Chromium. That is this UA, this build, not a crawler.

Seventeen cells. One engine. 15 August 2026. I can tell you which hide this Chromium would find, name, hash-scroll, or fragment-open. I cannot tell you which hide your team should ship.

If a citation is landing on a 0px box and you want the hide method measured against the same four doors, the inbox is on the [contact page](/en/contact/).

---

*Sources: WHATWG [The `hidden` attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute), [Hidden elements](https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements), [Interaction with `details` and `hidden=until-found`](https://html.spec.whatwg.org/multipage/interaction.html#interaction-with-details-and-hidden=until-found), [Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees), [Find-in-page](https://html.spec.whatwg.org/multipage/interaction.html#find-in-page); Chrome [Making collapsed content accessible with hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found); Google Search Central [Spam policies, Hidden text and link abuse](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-links); W3C [WAI-ARIA 1.2 `aria-hidden`](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden) (all official). Block quotes were checked against those pages at write time, with the URL next to each quote. Measurement: 17 hide-method cells on one fixture, headless Chromium 143.0.7499.4, Playwright 1.57.0, Node 22.22, viewport 1280×800, local static server in `/tmp`, plus one live FAQ page (HTTP 200). I did not press real find-in-page UI, did not run Firefox or WebKit, did not log into Search Console, did not watch a search result emit a text-fragment link, did not run Rich Results Test, and did not measure an AI crawler. `window.find` is unspecified (Issue #3539). Structured data and fragments do not guarantee a rich result or an AI citation.*
