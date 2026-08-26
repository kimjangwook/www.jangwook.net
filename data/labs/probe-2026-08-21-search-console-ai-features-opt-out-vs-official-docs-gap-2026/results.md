# probe-2026-08-21-search-console-ai-features-opt-out-vs-official-docs-gap-2026

planned 6 cells / 18 runs. usable 6 cells / 18 runs. 미측정 셀 없음.

18개 raw 전부 `exit 0` 이고 모든 fetch 가 `http=200` 이다. 셀 안 3런의 토큰 카운트는 전부 동일하다 — 런 간 차이는 developers.google.com 세 문서의 `size_download` 가 ±4 B 흔들린 것뿐이고(예: ai-features 177838/177842/177838) 카운트에는 영향이 없다. blog.google 과 jangwook.net 응답은 3런 바이트까지 동일하다. 받은 바이트 수는 plan 이 미리 적어 둔 기준치(177,842 / 205,974 / 74,475 / 189,367 / 379,877 / 71,340)와 모두 일치하므로 봇 차단 페이지를 받은 run 은 0회다.

판독 규칙 두 가지를 먼저 적는다. (1) `nosnippet` 카운트는 `data-nosnippet` 을 부분 문자열로 포함한다 — 순수 `nosnippet` = (nosnippet − data-nosnippet). (2) C1·C6 의 TXT 값은 좌측 내비게이션·푸터를 포함한 값이다. 본문 신호는 C6 통제값을 뺀 뒤에만 읽는다.

셀 명령의 텍스트 추출기 `perl -pe 's/^\s+|\s+$//g'` 는 각 행의 후행 개행까지 지워서 본문 전체를 1행으로 접는다. 그래서 (a) 모든 셀의 `TEXT lines=1` 은 문서 길이가 아니라 이 부작용이고, (b) `grep -o` 를 쓴 C1·C3·C4·C6 의 카운트는 출현 횟수로 정상이지만 `grep -c` 를 쓴 C5 의 `DOC` 값은 행 수라서 0/1 불린으로 잘린다. 아래 C5 줄은 그 전제로 읽는다.

## cells

- control-unrelated-doc-baseline (C6, 통제) — 3/3 판정 성립 — exit 0,0,0 — build-sitemap 200, 189,363/189,367 B, TEXT 19,689 B. TXT: nosnippet 1, data-nosnippet 1(순수 nosnippet 0), max-snippet 0, noindex 1, Google-Extended 0, preferred source 1, preferred sources 1, AI Mode 0, AI Overviews 0, Search Console 17, opt out 0, opt-out 0, exclude 0. 통제가 설계대로 작동했다 — AI 기능과 무관한 문서인데도 `preferred source(s)` 가 1 로 잡히므로 그 토큰은 좌측 내비게이션 몫이고, `max-snippet`·`AI Overviews`·`AI Mode`·`Google-Extended` 가 0 이므로 C1 의 같은 토큰은 본문 신호다. `Search Console` 은 통제값(17)이 C1(13)보다 크므로 이 토큰만은 카운트로 본문 신호를 분리할 수 없다.
- docs-exclusion-lever-inventory (C1) — exit 0,0,0 — ai-features 200, TEXT 13,811 B. TXT 원값: nosnippet 3, data-nosnippet 2, max-snippet 1, noindex 2, Google-Extended 1, preferred source 1, preferred sources 1, AI Mode 11, AI Overviews 14, Search Console 13, opt out 0, opt-out 0, exclude 0. C6 을 뺀 본문값: 순수 nosnippet 1, data-nosnippet 1, max-snippet 1, noindex 1, Google-Extended 1, preferred source(s) **0**, AI Mode 11, AI Overviews 14. results.jsonl 의 `hits 0` 은 plan 의 판정식(`preferred source`·`Search Console` 이 0 이어야 함)이 안 맞은 결과인데, 그 두 값은 전부 내비게이션 몫이라 "문서 본문에 포함 레버가 적혔다"는 뜻이 아니다. 문서: 배타 레버를 지목하는 문장은 본문에 정확히 하나이고 `nosnippet`·`data-nosnippet`·`max-snippet`·`noindex` 넷을 한 문장에 묶는다(quotes 1). `opt out`·`opt-out`·`exclude` 는 원문 HTML 에서도 0 이다. 페이지 표기 `Last updated 2025-12-10 UTC`.
- docs-inclusion-lever-absence (C2) — exit 0,0,0 — NAV total_unique_paths=154. NAV MATCH 6건: `/search/docs/appearance/ai-features`, `/featured-snippets`, **`/preferred-sources`**, `/snippet`, `/structured-data/product-snippet`, `/structured-data/review-snippet`. PROBE 200: ai-features, **preferred-sources**, robots-meta-tag / PROBE 404: `appearance/ai-features-opt-out`, `crawling-indexing/google-extended`. 즉 plan 이 "개발자 문서에는 아직 없다"고 본 Preferred sources 전용 문서가 내비게이션에도 있고 200 으로 열린다 — 검증 fetch 로 그 문서의 표기가 `Last updated 2026-08-20 UTC`, 발표문과 같은 날짜임을 확인했다(본문 토큰: preferred source 24, AI Overviews 2, AI Mode 2, Top Stories 2, opt out 0). 문서: 그 페이지는 AI 표면에서의 효과를 배지로 서술하고(quotes 5), 사이트 쪽 opt out 문구는 0건이다. GSCHELP 5개 토큰이 전부 0 으로 나왔지만 이 값은 근거로 쓸 수 없다 — support.google.com/webmasters/ 는 1,305,957〜1,305,968 B 중 태그 제거 후 가시 텍스트가 2,697 B 뿐인 script 69개짜리 JS 셸이라 부재의 증거가 아니라 무측정이다.
- announcement-inclusion-vs-exclusion-wording (C3) — exit 0,0,0, 3런 379,877 B 바이트 동일 — TEXT 9,045 B. TOKEN: preferred source 7(복수형 3 포함 → 단수 전용 4), Top Stories 1, AI Overviews 1, AI Mode 2, publisher 8, Search Console **0**, opt out 1, opt-out 0, turn off 0, exclude 0, remove 0, block 0. `opt out = 1` 은 정정한다 — 원문에서 그 1건은 뉴스레터 신청란의 "You may opt out at any time." 이고 검색 배타와 무관하다. 검색 쪽 배타 어휘는 실질 0 이므로 발표문은 포함 방향만 말한다. 문서: 발표문은 포함 효과를 Top Stories·AI Overviews·AI Mode 로 명시하고(quotes 6), 퍼블리셔를 Search Console 이 아니라 Search Central 문서로 보낸다(quotes 7). 게시일 표기 `Aug 20, 2026`, 작성자 Mrinalini Loew(General Manager, Google Search Ecosystem).
- own-deployment-lever-landing (C4) — exit 0,0,0, 3런 출력 동일 — sitemap-ko.xml 200, 71,340 B, `total_locs=351`, 결정적 표본 12(sort 후 head -12). 셀이 출력한 `urls_with_any_snippet_lever=1` 은 정정한다 — 그 1건 `https://jangwook.net/ko/blog` 의 nosnippet=2 / data-nosnippet=1 / max-snippet=1 은 블로그 목록 카드의 본문 문자열이다(포스트 제목 "AI Overview가 내 페이지를 인용할지 정하는 meta 한 줄 — robots 스니펫 지시자 실측" 과 그 설명문에 토큰이 들어 있다). 같은 페이지의 robots·googlebot meta 는 0개이고, 표본 12 URL 전부 `meta=[]` 로 robots·googlebot meta 태그 자체를 내보내지 않는다. 지시자로서 실제 착지한 URL 은 **0/12**. 문서: ai-features 가 배타 레버로 지목한 넷 중 어느 것도 표본에 없고, 같은 문서가 요구하는 "스니펫과 함께 노출될 자격"은 12/12 가 유지된 상태다(quotes 3).
- falsifier-google-extended-covers-search-ai (C5, falsifier) — **falsified = no** — exit 0,0,0 — DOC 값(0/1 불린): overview-google-crawlers 200, 74,471/74,475 B → Google-Extended 0, AI Overviews 0, AI Mode 0, Gemini 0, Vertex 0 / robots-meta-tag 200, 205,970/205,974 B → Google-Extended 0, AI Overviews 1, AI Mode 1 / ai-features 200 → Google-Extended 1, AI Overviews 1, AI Mode 1. `Google-Extended ±4행` CONTEXT 블록은 앞 두 문서에서 비어 있다 — 원문 HTML 에서도 두 문서의 Google-Extended 출현이 0 임을 재확인했고, 이는 문서 부재가 아니라 타깃 이동이다: ai-features 의 "Google-Extended" 링크는 `/search/docs/crawling-indexing/google-common-crawlers#google-extended` 를 가리키며 plan 이 추측한 슬러그와 이 셀이 고른 overview-google-crawlers 둘 다 그 자리가 아니다. 판정 근거는 두 겹이다 — (a) ai-features 본문이 Google-Extended 를 "Google's other systems" 로 밀어내 검색 배타 레버와 분리하고(quotes 2), (b) 검증 fetch 로 연 실제 Google-Extended 절(google-common-crawlers, Google-Extended 6 / AI Overviews 0 / AI Mode 0 / Gemini 4 / Vertex 8)이 Gemini·Vertex 그라운딩만 말하며 검색 포함에 영향이 없다고 못박는다(quotes 4). 전제는 살아남았다. ROBOTS(jangwook.net/robots.txt 200, 3,073 B): Google-Extended 2행(둘 다 `User-agent:` 줄이고 각 그룹이 `Disallow: /`), Content-Signal 5행(주석 4 + 지시자 1 = `Content-Signal: search=yes,ai-train=no,use=reference`), ai-input 1, ai-train 2, search=yes 1, GPTBot 2, CCBot 2. 즉 자사 배포본이 켜 둔 것은 Google-Extended 차단과 Content-Signal 이고, ai-features 가 지목한 스니펫 계열은 켜져 있지 않다.

## boundary

결과가 뒤집히는 축은 surface 가 아니라 lever_direction 이다 — 포함 레버는 발표문(preferred source 7건)과 개발자 문서(전용 페이지 `/appearance/preferred-sources`, 200, 2026-08-20 갱신) 두 표면에 모두 실물로 있는데, 배타 레버는 개발자 문서 ai-features 본문의 한 문장(순수 nosnippet 1 / data-nosnippet 1 / max-snippet 1 / noindex 1)까지만 존재하다가 own-deployment 표면으로 넘어가는 순간 12 URL 중 0 으로 사라진다.

## quotes

- text: "AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search. To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls."
  url: https://developers.google.com/search/docs/appearance/ai-features
  bears_on: C1 이 센 배타 레버 넷이 전부 이 한 문장에서 나온다. C4 의 0/12 는 이 문장이 지목한 넷 중 아무것도 배포본에 없다는 뜻이다.
- text: "To limit AI training and grounding in some of Google's other systems, read more about Google-Extended."
  url: https://developers.google.com/search/docs/appearance/ai-features
  bears_on: C5 falsifier. Google-Extended 를 검색 AI 기능이 아니라 "Google's other systems" 로 분리하는 문장이라 falsified=no 의 1차 근거다.
- text: "To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements. There are no additional technical requirements."
  url: https://developers.google.com/search/docs/appearance/ai-features
  bears_on: C1·C4. 스니펫 자격과 AI 인용 자격을 같은 조건으로 묶는 문장이라, C4 의 `meta=[]` 12/12 가 왜 "인용 대상 유지" 상태인지를 설명한다.
- text: "Google-Extended is a standalone product token that web publishers can use to manage whether content Google crawls from their sites may be used for training future generations of Gemini models that power Gemini Apps and Vertex AI API for Gemini and for grounding (providing content from the Google Search index to the model at prompt time to improve factuality and relevancy) in Gemini Apps and Grounding with Google Search on Vertex AI. Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search."
  url: https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
  bears_on: C5 falsifier 의 2차 근거이자 결정적 근거. C5 가 실제로 연 두 문서에는 이 토큰이 0건이었고, 이 문장이 있는 자리가 진짜 타깃이다. C5 의 ROBOTS 줄(Google-Extended 2행 Disallow)이 검색 AI 기능 배타와 무관함을 이 문장이 확정한다.
- text: "In AI Mode and AI Overviews, your content can be highlighted with a \"preferred\" badge for users who have selected your site as a preferred source."
  url: https://developers.google.com/search/docs/appearance/preferred-sources
  bears_on: C2. plan 이 개발자 문서에 없다고 본 포함 레버 문서가 실재함을 보이는 본문이고, PROBE 200 의 내용이다.
- text: "Readers more easily find their favorite publications in Top Stories, AI Overviews, and AI Mode, while publishers gain a more seamless way to connect with readers across Google. So far, people have already selected more than 600,000 unique sources."
  url: https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/
  bears_on: C3 의 Top Stories 1 / AI Overviews 1 / AI Mode 2 가 나온 문장이다. 600,000 이라는 수는 발표문이 낸 유일한 규모 수치다.
- text: "If you're a publisher, you can find the new \"Preferred Source\" button code in our Google Search Central documentation to get started."
  url: https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/
  bears_on: C3 의 `Search Console = 0` 과 C2 의 `preferred-sources` 200 을 잇는 문장. 발표문이 퍼블리셔를 보내는 곳이 Search Console 이 아니라 Search Central 문서다.
- text: "You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add."
  url: https://developers.google.com/search/docs/appearance/ai-features
  bears_on: C1. 이 문서가 포함 방향으로 요구하는 것이 없다고 적은 자리이고, C4 의 robots.txt Content-Signal·llms.txt 계열이 공식 레버가 아님을 가르는 기준선이다.
