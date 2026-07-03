---
title: 'AI 크롤러를 robots.txt로 제대로 제어하기 — 학습은 막고 인용은 허용하는 2026 전략'
description: 'GPTBot 한 줄 막고 "AI 차단 끝"이라 믿는 사이트가 많다. 학습·검색·사용자요청 크롤러를 분리 제어하는 robots.txt를 직접 만들고 표준 파서로 검증했다. Google-Extended가 AI Overviews를 못 막는 함정과 llms.txt의 정직한 현황까지.'
pubDate: '2026-07-03'
heroImage: '../../../assets/blog/ai-crawler-control-robots-txt-llms-txt-2026/hero.png'
tags:
  - GEO
  - AIO
  - robots.txt
  - SEO
  - 웹개발
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.62
    reason:
      ko: 크롤러가 실제로 읽어가는 것이 무엇이냐를 다룬 글이다. 이 글이 "누가 읽게 할 것인가(robots.txt)"라면 저 글은 "무엇을 읽게 할 것인가(마크업)"여서 짝을 이룬다.
      ja: クローラーが実際に読み取るものは何かを扱った記事だ。本記事が「誰に読ませるか(robots.txt)」なら、あちらは「何を読ませるか(マークアップ)」で対になる。
      en: That post is about what crawlers actually read off the page. If this article is "who gets to read it (robots.txt)," that one is "what they read (markup)" — the two pair up.
      zh: 那篇文章讲的是爬虫实际读取的是什么。如果本文是"让谁来读(robots.txt)"，那篇就是"让它们读什么(标记)"，正好成对。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.55
    reason:
      ko: 이 글에서 표준 파서가 Googlebot과 다르게 답한 것처럼, 자동 도구의 통과가 실제 준수를 뜻하지 않는다는 같은 함정을 접근성에서 실측한 글이다.
      ja: 本記事で標準パーサーがGooglebotと違う答えを返したように、自動ツールの合格が実際の準拠を意味しないという同じ落とし穴を、アクセシビリティで実測した記事だ。
      en: Just as the standard parser here disagreed with Googlebot, that post measures the same trap in accessibility — a tool passing doesn't mean actual compliance.
      zh: 正如本文里标准解析器与 Googlebot 答案不一致，那篇文章在无障碍领域实测了同一个陷阱：工具通过并不等于真的合规。
  - slug: multilingual-llm-token-tax-experiment
    score: 0.5
    reason:
      ko: 내 블로그를 실측 대상으로 삼아 직접 재본 글이다. robots.txt를 표준 파서로 돌려 확인한 이 글과 "문서 말고 직접 측정한다"는 태도가 같다.
      ja: 自分のブログを実測対象にして直接測った記事だ。robots.txtを標準パーサーで回して確かめた本記事と「ドキュメントではなく自分で測る」という姿勢が同じだ。
      en: That post measured things directly, using my own blog as the testbed. It shares this article's stance of checking by running it yourself instead of trusting the docs.
      zh: 那篇文章把我自己的博客当作实测对象亲自测量。与本文用标准解析器实跑 robots.txt 一样，都是"不信文档、自己动手测"的态度。
---

많은 사이트가 robots.txt에 `User-agent: GPTBot` / `Disallow: /` 한 줄을 넣고 "AI 차단 끝"이라고 생각한다. 절반만 맞다. GPTBot은 OpenAI가 <strong>모델 학습</strong>에 쓰는 크롤러다. 그런데 OpenAI에는 학습용 말고도 크롤러가 더 있고, 그중 하나를 같이 막으면 ChatGPT 검색이 내 페이지를 인용할 기회까지 스스로 닫아버린다. 반대로 아무 생각 없이 다 열어두면, 내 콘텐츠가 학습 데이터로 통째로 빨려 들어간다.

즉 "AI를 막느냐 여느냐"는 스위치 하나가 아니다. 2026년의 robots.txt는 최소 세 종류의 봇을 서로 다르게 대해야 한다. 나는 이걸 문서로만 읽고 넘기기 싫어서, 실제로 robots.txt를 짜고 표준 파서로 규칙이 의도대로 먹는지 돌려봤다. 그 과정에서 표준 파서가 실제 Googlebot과 다르게 답하는 지점도 하나 발견했다. 순서대로 정리한다.

## AI 크롤러는 한 종류가 아니다: 학습·검색·사용자요청 3계층

먼저 크롤러를 목적별로 갈라야 한다. 같은 회사 봇이라도 하는 일이 완전히 다르기 때문이다. OpenAI 공식 문서([Overview of OpenAI Crawlers](https://developers.openai.com/api/docs/bots))가 자기 봇을 이렇게 구분한다.

- <strong>GPTBot</strong> (`GPTBot/1.3`): 생성 모델 <strong>학습</strong>용. 막으면 "내 콘텐츠를 학습에 쓰지 마라"는 신호.
- <strong>OAI-SearchBot</strong> (`OAI-SearchBot/1.3`): ChatGPT의 <strong>검색</strong> 기능이 답을 만들 때 인용할 페이지를 수집. 막으면 ChatGPT 검색 답변에서 사라진다.
- <strong>ChatGPT-User</strong> (`ChatGPT-User/1.0`): 사용자가 "이 URL 읽어줘"라고 직접 시켰을 때 그 페이지를 가져오는 봇. 공식 문서는 이건 사용자 트리거라 "robots.txt 규칙이 적용되지 않을 수 있다"고 명시한다.

Anthropic도 [공식 도움말](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)에서 같은 구조로 봇을 나눈다. `ClaudeBot`(학습), `Claude-User`(사용자 요청 fetch), `Claude-SearchBot`(검색 인덱싱). 예전에 쓰던 `anthropic-ai`, `Claude-Web`은 지원 중단(deprecated)이라 지금 이걸로만 막으면 헛방이다.

여기서 첫 번째 실무 판단이 나온다. <strong>학습 봇과 검색 봇을 한 덩어리로 취급하면 안 된다.</strong> "AI 다 싫어"라며 GPTBot·OAI-SearchBot·ClaudeBot·Claude-SearchBot을 전부 `Disallow` 하는 순간, 학습을 막는 데는 성공하지만 ChatGPT·Claude 검색 답변에서 내 사이트가 인용될 통로까지 닫는다. 트래픽을 원하는 퍼블리셔에게 이건 손해다.

## 2026년 퍼블리셔의 기본 전략: 학습은 막고 인용은 허용

그래서 내가 기본값으로 추천하는 전략은 명확하다. <strong>학습(training)은 거부, 검색·인용(search)은 허용.</strong> 콘텐츠를 공짜 학습 코퍼스로는 내주지 않되, AI 검색 답변에 인용되어 방문자가 넘어올 길은 열어둔다. 이걸 robots.txt로 옮기면 이렇게 된다.

```text
# --- AI 학습(training) 크롤러: 모델 학습에 쓰지 못하게 차단 ---
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

# Google-Extended는 "크롤러"가 아니라 학습 데이터 사용을 제어하는 토큰이다.
User-agent: Google-Extended
Disallow: /

# --- 검색/인용(search) 크롤러: ChatGPT·Claude 검색에 인용되도록 허용 ---
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

# --- 일반 검색 크롤러 ---
User-agent: Googlebot
Allow: /
Disallow: /admin/

User-agent: *
Disallow: /admin/
Disallow: /drafts/

Sitemap: https://example.com/sitemap.xml
```

`CCBot`은 Common Crawl 봇인데, 여러 오픈 데이터셋이 이걸 학습 소스로 쓰기 때문에 학습을 막고 싶다면 같이 넣는 게 맞다. 아래 표가 이 전략을 한눈에 정리한 것이다.

| 크롤러 | 소속 | 목적 | 이 전략에서 |
|--------|------|------|-------------|
| GPTBot | OpenAI | 모델 학습 | 차단 |
| OAI-SearchBot | OpenAI | ChatGPT 검색 인용 | 허용 |
| ChatGPT-User | OpenAI | 사용자 직접 요청 | robots.txt 미적용(공식) |
| ClaudeBot | Anthropic | 모델 학습 | 차단 |
| Claude-SearchBot | Anthropic | 검색 인덱싱 | 허용 |
| Google-Extended | Google | 학습 데이터 사용 제어 토큰 | 차단(단, 아래 함정 주의) |
| Googlebot | Google | 일반 검색(AI Overviews 포함) | 허용 |
| CCBot | Common Crawl | 학습 코퍼스 수집 | 차단 |
| PerplexityBot | Perplexity | 답변 엔진 인용 | 허용 |

물론 이건 "인용 트래픽을 원하는 사이트"의 기본값이다. 유료 콘텐츠나 커뮤니티 아카이브처럼 인용조차 원치 않는 사이트라면 검색 봇도 막는 게 맞다. 정답이 하나는 아니다. 다만 대부분의 블로그·문서 사이트는 이 "학습 거부 + 인용 허용" 조합이 합리적인 출발점이라고 본다.

크롤러가 페이지에 도착한 뒤 실제로 무엇을 읽어가느냐는 또 다른 층위의 문제다. 그 부분은 [LocalBusiness 구조화 데이터를 서버사이드로 내보내는 이야기](/ko/blog/ko/localbusiness-structured-data-server-side-vs-js-2026)에서 따로 다뤘다. robots.txt가 "누구를 들일까"라면, 마크업은 "들어온 봇에게 무엇을 보여줄까"다.

## 직접 검증했다: 규칙이 정말 의도대로 먹는가

robots.txt는 짜는 것보다 <strong>내가 의도한 대로 정말 동작하는지 확인하는 것</strong>이 어렵다. 오타 하나로 전체 규칙이 무력화되는 파일이라 더 그렇다. 그래서 위 robots.txt를 임시 디렉터리에 저장하고, 파이썬 표준 라이브러리 `urllib.robotparser`로 각 봇이 특정 경로를 가져갈 수 있는지 하나씩 물어봤다. 별도 설치가 필요 없는 표준 파서라 재현도 쉽다.

```python
import urllib.robotparser as rp

p = rp.RobotFileParser()
p.parse(open("robots.txt").read().splitlines())

cases = [
    ("GPTBot",           "/blog/my-article"),
    ("OAI-SearchBot",    "/blog/my-article"),
    ("ClaudeBot",        "/blog/my-article"),
    ("Claude-SearchBot", "/blog/my-article"),
    ("Google-Extended",  "/blog/my-article"),
    ("Googlebot",        "/blog/my-article"),
]
for ua, path in cases:
    print(ua, path, p.can_fetch(ua, path))
```

실행 결과는 이렇게 나왔다.

```text
user-agent         path                 allowed?  note
----------------------------------------------------------------------
GPTBot             /blog/my-article     False     학습 크롤러(OpenAI)
OAI-SearchBot      /blog/my-article     True      검색/인용 크롤러(OpenAI)
ClaudeBot          /blog/my-article     False     학습 크롤러(Anthropic)
Claude-SearchBot   /blog/my-article     True      검색 크롤러(Anthropic)
Google-Extended    /blog/my-article     False     Google 학습 토큰
Googlebot          /blog/my-article     True      일반 검색(AI Overviews 포함)
Googlebot          /admin/secret        True      일반 검색 - 민감 경로
PerplexityBot      /blog/my-article     True      Perplexity 검색
CCBot              /blog/my-article     False     Common Crawl(학습 소스)
SomeRandomBot      /drafts/wip          False     기타 봇 - 드래프트
```

의도한 대로다. 학습 봇(GPTBot, ClaudeBot, Google-Extended, CCBot)은 전부 `False`(차단), 검색 봇(OAI-SearchBot, Claude-SearchBot, PerplexityBot)은 `True`(허용). 이름을 모르는 `SomeRandomBot`은 `User-agent: *`의 `Disallow: /drafts/` 규칙에 걸려 드래프트 경로에서 막혔다. user-agent 매칭은 대소문자를 가리지 않아서, `GPTBot`이든 `gptbot`이든 같은 규칙에 걸린다. 이건 실제 크롤러 동작과도 일치한다.

여기까지는 깔끔했다. 그런데 한 줄이 눈에 걸렸다.

## 표준 파서가 실제 Googlebot과 다르게 답한 지점

위 로그에서 `Googlebot /admin/secret → True`를 보라. 나는 Googlebot 그룹에 `Disallow: /admin/`을 분명히 넣었다. 그런데 표준 파서는 `/admin/secret`을 <strong>허용</strong>이라고 답했다. 처음엔 내 오타인 줄 알고 몇 번을 다시 봤다.

원인은 규칙 우선순위 해석 차이였다. 내 Googlebot 그룹은 이렇게 생겼다.

```text
User-agent: Googlebot
Allow: /
Disallow: /admin/
```

파이썬 표준 파서는 `Allow: /`를 먼저 만족시켜 통과시켰다. 그런데 <strong>실제 Googlebot의 규칙은 다르다.</strong> Google 공식 문서에 따르면, Allow와 Disallow가 충돌하면 <strong>경로가 더 긴(더 구체적인) 규칙이 이긴다.</strong> `/admin/secret`에 대해 `Allow: /`는 길이 1, `Disallow: /admin/`은 길이 7이니, 실제 Googlebot이라면 더 긴 `Disallow: /admin/`을 적용해 <strong>차단</strong>한다.

즉 같은 robots.txt를 두고 표준 파서는 "허용", 진짜 Googlebot은 "차단"이라고 답한다. 이 불일치는 사소해 보이지만 실무에서 위험하다. 로컬 스크립트나 어떤 라이브러리로 robots.txt를 "테스트했더니 통과"라고 안심했는데, 정작 그 파서가 Google의 최장 일치 규칙을 구현하지 않았다면, 실제로는 막히거나 열려버릴 수 있다는 뜻이다.

여기서 내 결론은 이렇다. <strong>robots.txt 검증은 반드시 그 크롤러가 실제로 쓰는 규칙으로 확인해야 한다.</strong> Google이라면 Search Console의 robots.txt 테스터, OpenAI라면 공식 문서의 봇별 동작을 기준으로 봐야 한다. 범용 파서 하나로 "됐다"고 넘기지 마라. 내가 오늘 발견한 이 한 줄이 그 증거다. (참고로 이런 "도구가 통과시켰다고 다 통과가 아니다"라는 함정은 접근성에서도 똑같이 나타난다. [Lighthouse 100점이 WCAG 준수를 뜻하지 않는 것](/ko/blog/ko/a11y-lighthouse-audit-fix-2026)과 정확히 같은 종류의 착시다.)

## Google-Extended의 함정: AI Overviews는 못 막는다

위 표에서 "Google-Extended: 차단(단, 함정 주의)"이라고 적은 이유가 여기 있다. 많은 개발자가 `User-agent: Google-Extended` / `Disallow: /`를 넣고 "이제 구글 AI가 내 콘텐츠를 안 쓴다"고 안심한다. 이것도 절반만 맞다.

Google 공식 설명([AI Features and Your Website](https://developers.google.com/search/docs/appearance/ai-features))에 따르면, Google-Extended는 <strong>크롤러가 아니라</strong> 이미 크롤링된 콘텐츠를 Gemini 등 생성 모델 <strong>학습에 쓸지</strong>를 제어하는 토큰이다. 콘텐츠 자체는 여전히 Googlebot이 크롤링한다. 그리고 결정적인 부분. <strong>Google-Extended를 막아도 AI Overviews에는 계속 노출된다.</strong> AI Overviews는 별도의 학습 데이터가 아니라 Google 검색의 라이브 인덱스에서 답을 끌어오기 때문이다.

그럼 AI Overviews만 빼려면? 방법이 마땅치 않다. `nosnippet` 메타태그를 쓰면 AI Overviews 인용에서 빠질 수 있지만, 그건 <strong>일반 검색 스니펫까지 같이 죽인다.</strong> 검색 결과에 내 설명 텍스트가 안 나오는 걸 감수해야 한다는 뜻이다. 사실상 "일반 검색은 그대로 두면서 AI Overviews에서만 빠지기"는 현재 깔끔한 방법이 없다. 이건 내 추측이 아니라 Google 문서에서 확인되는 구조적 한계다.

그래서 개발자에게 필요한 건 정확한 기대치다. Google-Extended `Disallow`가 하는 일은 "Gemini 학습에 쓰지 마라"까지고, "구글의 모든 AI 기능에서 빼줘"는 아니다. 이 둘을 뭉뚱그리면, robots.txt에 한 줄 넣고 안 된 일을 됐다고 착각하게 된다.

## llms.txt는 지금 넣을 가치가 있나: 정직한 현황

여기까지 오면 자연스럽게 나오는 질문. "그럼 요즘 말 많은 `llms.txt`는?" 결론부터 말하면, 넣어서 손해는 없지만 효과를 기대하진 마라.

llms.txt는 사이트가 LLM에게 "여기 핵심 문서가 있다"고 안내하는 마크다운 파일 제안이다. 아이디어는 나쁘지 않다. 문제는 <strong>2026년 현재 아무 주요 AI 제공자도 이걸 실제로 쓰지 않는다는 것</strong>이다. Google의 John Mueller와 Gary Illyes는 공개적으로 "검색 팀은 llms.txt를 쓰지 않는다"고 밝혔고, Mueller는 이걸 폐기된 keywords 메타태그에 비유하기까지 했다. OpenAI·Anthropic·Meta·Mistral 중 프로덕션 답변에 llms.txt를 신호로 쓴다고 공식 확인한 곳도 없다.

수치도 서늘하다(아래는 제3자 조사값이라 <strong>참고용, 공식 아님</strong>). 한 업계 분석은 llms.txt를 둔 사이트의 상당수가 실제 AI 봇 방문을 거의 받지 못했다고 보고했고, 5억 건 규모의 AI 봇 방문을 관찰한 다른 모니터링에서는 llms.txt를 직접 겨냥한 요청이 극소수에 불과했다. 즉 파일은 늘어나는데 읽는 봇이 없다.

내 입장은 이렇다. llms.txt는 <strong>지금은 로또가 아니라 보험</strong> 정도다. 생성 비용이 거의 없고 표준이 자리 잡을 가능성에 대비하는 의미는 있으니 넣어도 된다. 하지만 "llms.txt 넣었으니 AI 검색에 잘 잡히겠지"는 근거 없는 기대다. 그 시간에 차라리 위에서 정리한 robots.txt의 봇별 제어와 구조화 데이터를 손보는 편이 실측 효과가 훨씬 크다.

## 그래서 오늘 할 일: 체크리스트

정리하면, AI 시대의 robots.txt는 "막느냐 여느냐"가 아니라 "봇별로 어떻게 대하느냐"의 문제다. 오늘 당장 점검할 목록.

1. <strong>봇을 목적별로 분리했는가.</strong> 학습(GPTBot, ClaudeBot, Google-Extended, CCBot)과 검색(OAI-SearchBot, Claude-SearchBot, PerplexityBot)을 같은 규칙으로 묶어 처리하고 있지 않은지 확인한다.
2. <strong>deprecated 토큰만 믿고 있지 않은가.</strong> `anthropic-ai`, `Claude-Web`만 막아뒀다면 지금 Anthropic 봇은 안 막힌다. `ClaudeBot`로 갱신한다.
3. <strong>Google-Extended에 과한 기대를 걸지 않았는가.</strong> 그건 Gemini 학습 거부까지고, AI Overviews 제외가 아니다. 기대치를 정확히 맞춘다.
4. <strong>실제 크롤러 규칙으로 검증했는가.</strong> 범용 파서의 "통과"를 믿지 말고, Google은 Search Console robots.txt 테스터로, 최장 일치 규칙까지 확인한다.
5. <strong>ChatGPT-User·Claude-User 같은 사용자 트리거 봇은 robots.txt로 안 막힐 수 있음을 안다.</strong> 이건 정책이 아니라 사용자 행동이라 통제 범위 밖이다.

robots.txt는 법적 강제가 아니라 자발적 준수 규약이다. 예의 바른 봇은 지키지만, 악성 크롤러는 무시한다. IP로 막으려다 오히려 robots.txt조차 못 읽게 만들어 역효과가 나기도 한다. 그래서 이건 "완벽한 차단벽"이 아니라 "명시적 의사 표시"에 가깝다. 그 한계를 알고 쓰면, 학습 거부와 인용 허용이라는 내 의사를 봇들에게 정확히 전달하는 가장 표준적인 수단이다.

---

구조화 데이터를 서버사이드로 확실히 내보내거나, 기존 사이트의 robots.txt·구조화 마크업·GEO 대응이 실제로 의도대로 동작하는지 점검하고 싶다면, 개인적으로 상담·구현 의뢰를 받고 있다. 프로필의 연락 경로로 편하게 문의를 남겨두면 된다.
