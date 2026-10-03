---
title: 'AI 학습만 거부하고 검색 노출과 인용을 유지하는 robots.txt 설정은 OpenAI 봇 토큰에서는 공식 문서로 보장되지만, Google-Extended는 학습과 인용을 한 토큰에 묶어 그 분리를 제공하지 않는다'
description: 'robots.txt 파일 하나로 AI 로봇의 방문을 통제할 때, 검색에는 나오면서 학습만 막는 설정이 제공사마다 가능 여부가 다르다. 이 글은 내 사이트의 실제 파일과 여섯 로봇의 응답 실험, OpenAI와 Anthropic의 공식 문서를 대조해 어디서 분리 설정이 보장되는지 좁혀 본다.'
pubDate: '2026-09-03'
heroImage: ../../../assets/blog/google-extended-single-lever-training-grounding-tied-robots-txt-2026/hero.png
tags:
- robots-txt
- ai-crawler
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

## 내 글을 AI가 학습하는 것은 robots.txt 한 파일로 정해진다

웹사이트 운영자가 AI 로봇의 방문을 통제하는 창구는 robots.txt라는 파일 하나다. 이 파일은 사이트 최상위 폴더에 놓인 평범한 텍스트 문서다. 이 파일은 학교 현관의 방문자 명단과 같다. 누구는 들어오라고, 누구는 오지 말라고 적어 둔다. 로봇은 도착하면 먼저 이 명단을 읽고, 자기 이름이 오지 말라는 칸에 있으면 돌아간다.

문제는 명단에 적을 수 있는 칸이 서비스를 제공하는 회사마다 다르다는 점이다. 나는 검색 결과에는 계속 나오면서, AI 학습에만 내 글이 쓰이지 않기를 원한다. 이 조합을 명단에 적을 수 있는가. 오늘 내 사이트의 파일과 여러 제공사의 공식 문서를 열어 그 답을 확인해 보았다. 같은 명단 방식인데 제공사마다 적을 수 있는 칸이 달라서, 같은 의도가 어디서는 되고 어디서는 안 된다.

## 내 사이트 파일에서 Google-Extended는 규칙이 아니라 주석에만 등장한다

먼저 내 사이트에 실제로 서비스 중인 robots.txt를 확인했다. 파일은 HTTP 200, 즉 정상 응답으로 내려왔고 총 22줄이었다. 마지막 줄은 사이트에 글이 얼마나 있는지 알려 주는 목록 파일의 주소를 적은 줄로 끝났다. 파일은 존재하고, 서버도 정상이다.

그런데 파일을 읽어 보면 Google-Extended라는 이름이 규칙 칸에는 없고 주석에만 적혀 있었다. Google-Extended는 구글의 AI가 내 글을 학습하고 인용하는 두 행동을 한꺼번에 가리키는 이름이다. 주석은 파일 안에 사람이 남기는 메모다. 로봇이 지키는 규칙이 아니라 운영자가 자기 결정을 적어 둔 글이다. 그 주석에는 이렇게 적혀 있었다.

> Google-Extended는 학습과 그라운딩(인용)을 묶은 단일 레버라 인용 통로까지 함께 닫혔다.
> — [robots.txt](https://www.jangwook.net/robots.txt)

여기서 그라운딩은 AI가 답을 지어낼 때 근거로 내 글을 직접 읽고 출처로 인용하는 일을 가리킨다. 즉 이 주석은 Google-Extended를 차단하면 학습 차단과 인용 차단이 한꺼번에 일어난다는 뜻이다.

또 하나 확인한 것은 규칙 칸의 모습이다. 파일에는 '학습 차단 그룹(GPTBot·ClaudeBot·CCBot·Google-Extended)을 제거했다'는 주석이 있었다. 규칙 본문인 User-agent: *, 즉 모든 로봇을 가리키는 표시 아래에는 /ko/blog/en/ 같은 교차 언어 경로만 오지 말라고 적혀 있었다. 별도의 Google-Extended 차단 규칙 그룹은 발췌한 범위에서 발견되지 않았다. 참고로 git이라 불리는 코드 기록용 작업 폴더에는 robots.txt 자체가 없어서, 실제 서비스 중인 파일과 원본의 차이를 대조해 보지는 못했다.

이 사이트의 파일은 Google-Extended를 막는 규칙이 없고, 남은 것은 학습과 인용이 함께 닫힌다는 주석뿐이다.

## 여섯 로봇에게 직접 요청했더니 서버 차원에서는 아무도 막혀 있지 않았다

robots.txt는 글을 읽는 로봇에게 보내는 약속 문서일 뿐이다. 실제로 로봇이 문을 두드렸을 때 서버가 문을 잠그는지는 따로 확인해야 한다. 그래서 여섯 가지 신분으로 이 사이트에 직접 접속을 시도했다. 여섯 신분은 이렇다. Google-Extended, Googlebot, GPTBot, ClaudeBot, OAI-SearchBot, 그리고 Mozilla/5.0으로 시작하는 일반 브라우저 신분이다. 결과는 단순했다. 여섯 신분 모두 처음 요청에서 200을 받았고, 최종 도착 지점에서도 200을 받았다. 200은 서버가 문서를 정상적으로 건네주었다는 신호다. 중간에 다른 주소로 돌려보내진 경우도 하나도 없었다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c3-ua6-http-status-uniformity" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">여섯 로봇 접속</span><span class="lm-card__text">여섯 로봇 모두 처음과 끝 응답이 200으로 같았다.</span><div class="lm-card__numbers"><span class="lm-card__chip">응답 코드 200</span></div></div>

이 결과가 말해주는 것은 명확하다. 서버 응답 차원에서는 여섯 로봇 모두 막힌 곳이 없다. 어느 로봇도 문 앞에서 돌아가지 않았다. 그래서 차단이 일어날 수 있는 곳은 robots.txt의 토큰뿐이다. 토큰은 robots.txt에서 로봇 이름 하나하나를 가리키는 표시다. 이 사이트의 운명은 결국 그 토큰을 어떻게 적느냐로 갈린다.

다른 층위도 시험했다. 이 사이트는 Cloudflare라는 웹사이트의 문지기 역할을 하는 서비스를 통해 제공되는데, 이 서비스는 사이트가 검색·학습·입력 같은 신호를 각각 선언할 수 있게 해주는 Content-Signal이라는 헤더를 지원한다. 헤더는 문서 본문에 앞서 서버가 던지는 부가 정보다. 여기에 search, ai-train, ai-input 세 값이 적혀 있다면 인용과 학습의 분리 여부를 헤더 차원에서도 확인할 수 있었을 것이다. 그러나 시험을 세 번 실행했지만 세 번 모두 실패했다. 종료 코드는 1이었고, 얻은 결과는 0개였으며, 출력은 비어 있었다. 세 값 중 하나도 관측하지 못했다.

그래서 이 실험으로 확정할 수 있는 것은 두 가지뿐이다. 서버 문은 다 열려 있다는 것, 그리고 헤더라는 또 하나의 단서는 잡지 못했다는 것이다. 남은 유일한 통제 지점은 robots.txt 토큰이다.

## 검색 허용과 학습 거부를 나눠 적을 수 있다고 공식 문서로 보장하는 제공사는 OpenAI뿐이었다

서버 문은 열려 있고 결정은 파일에 적힌 로봇 이름 규칙에 달려 있다면, 이제 제공사들이 자기 토큰을 어떻게 설명하는지 문서로 확인할 차례다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-official-docs-token-independence" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">OpenAI 안내문</span><span class="lm-card__text">검색 로봇과 학습 로봇을 따로 막을 수 있다고 문서에 적혔다.</span><div class="lm-card__numbers"><span class="lm-card__chip">관측 실행 3</span><span class="lm-card__chip">히트 0</span></div></div>

OpenAI의 공식 문서는 네 개의 로봇 이름을 나열한다. OAI-SearchBot은 9행, ChatGPT-User는 6행, OAI-AdsBot은 5행, GPTBot은 5행에 걸쳐 설명되어 있다. 각 이름의 역할은 나뉘어 있다. 검색 결과에 등장하는 일을 맡는 봇과, 학습에 쓰이는 일을 맡는 봇이 다른 이름이다. 이어서 결정적인 문구가 나온다.

> independent of the others – for example, a webmaster can allow OAI-SearchBot in order to appear in search results while disallowing GPTBot to indicate that crawled content should not be used for training OpenAI's generative AI foundation models

> — [OpenAI crawlers and fetchers](https://platform.openai.com/docs/crawlers)

이 문구는 각 토큰이 서로 독립적이라고 선언한다. 검색 결과에 등장하려면 OAI-SearchBot을 허용한다. 학습에 쓰이지 말라고 GPTBot은 거부한다. 이 조합이 공식적으로 가능하다는 뜻이다.

Anthropic의 문서도 같은 방식으로 확인을 시도했다. 문서 페이지는 200을 3회 모두 돌려 주었지만, 발췌에 문서 본문 내용이 담기지 않았다. 즉 Anthropic이 자기 봇 토큰을 검색과 학습으로 나눠 설정할 수 있다고 명시하는지를 이 실행으로는 확인하지 못했다.

검색 허용과 학습 거부의 조합을 공식 문서로 보장하는 제공사는 이 관측에서 OpenAI뿐이다.

## 두 제공사가 왜 다르게 설계했는지 공식 설명은 없다

OpenAI는 검색과 학습을 다른 토큰으로 나눴다. Google은 Google-Extended 하나에 학습과 인용을 함께 묶었다. 그렇다면 왜 이런 차이가 생겼을까.

이유를 찾아 두 제공사의 공식 자료를 다시 살폈다. Google이 학습과 인용을 한 토큰에 묶은 제품적·정책적 판단에 대한 설명은 어디에서도 확인하지 못했다. OpenAI 쪽에도 분리의 이유를 따로 설명하는 문구는 없었다. 양쪽 모두 설계의 결과는 문서에 적혀 있지만, 왜 그렇게 설계했는지는 설명하지 않았다.

이유를 알 수 없으니, 근거로 남는 것은 설계 차이를 관측한 사실뿐이다. 여기가 이 글의 한계다.

## 사이트 하나의 하루 관측이라는 반론은 어디까지 타당한가

여기까지의 주장을 가장 세게 깎을 수 있는 반론부터 받아 보자. 이 결론은 웹 전체를 조사한 것이 아니라 내 사이트 하나, 2026-09-03 하루의 관측 위에 서 있다는 지적이다. 실제로 내 파일에서는 Google-Extended 차단 그룹이 이미 제거된 상태였고, 별도의 차단 규칙도 발견되지 않았다.

이 지적은 타당하다. Google-Extended를 실제로 차단한 뒤 AI 인용이 사라지는지를 대조해 본 결과가 아니기 때문이다. 학습과 인용이 한 스위치에 묶여 있다는 주장은 내 파일의 주석과 OpenAI 문서의 독립성 문구로 방향이 지지된 것이지, 실제 검색 화면에서의 동작 차이를 측정한 것이 아니다.

반론을 감안한 뒤에 남는 결론의 범위는 이렇다. Google-Extended가 학습과 인용을 한 스위치에 묶는다는 사실은 파일의 주석으로 확인되었다. OpenAI가 두 스위치를 나눈다는 사실은 공식 문서로 확인되었다. 이 판단은 robots.txt 토큰 설계와 공식 문서 문구 수준에서만 유효하다.

## 오늘 자기 robots.txt에서 확인하고 기록할 일

실험의 답은 이렇다: OpenAI 봇은 문을 여는 것과 닫는 것을 따로 적을 수 있고, Google은 한 묶음으로 전부 받거나 전부 닫을 수밖에 없다. 다만 그 결정의 근거를 기록으로 남겨야 나중에 다시 볼 수 있다.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ko"><span class="lm-card__title">결론</span><p class="lm-card__takeaway">이 실험은 차단 스위치가 여럿 존재함을 시사하지만 헤더 검증이 실패해 확정하지 못했다.</p></div>

오늘 해볼 일은 세 가지다.

**1. 파일을 열어 지금 어떤 봇이 어떻게 적혀 있는지 눈으로 확인하기.** 자기 사이트의 robots.txt는 브라우저 주소창에 `내주소/robots.txt`를 입력하면 바로 볼 수 있다. 예컨대 22줄짜리 파일이 정상 응답으로 열린다면, 그 안에 어떤 봇 이름이 어떤 규칙으로 언급되어 있는지 눈으로 확인할 수 있을 것이다. 검색 결과에 나오게 할 봇과 학습에 쓰이지 않게 할 봇이 지금 어떻게 되어 있는지 적어 둔다.

**2. 검색용과 학습용을 나눌 수 있는지 확인하기.** OpenAI 쪽은 공식 문서에 명시되어 있다. 검색용 봇인 OAI-SearchBot은 허용하면서 학습용 봇인 GPTBot은 차단하는 조합이 가능하다는 것이다. 즉 검색 노출을 살리면서 AI 학습은 막는 선택지가 있다. 반면 Google의 Google-Extended는 실제 서비스 중인 robots.txt 주석에 학습과 인용(그라운딩)을 묶은 단일 레버로 기록되어 있다. 그래서 차단하면 검색 인용 통로까지 함께 닫힌다. 어느 쪽 성격인지 자기 파일에서 확인하고, 둘을 분리하려는 의도가 있다면 그것이 실제로 가능한 봇인지 대조해 둔다.

**3. 바꿀 계획이 있다면 근거를 기록으로 남기기.** 예를 들어 "학습 차단 그룹을 제거했다" 같은 문장을 파일 안 주석으로 남겨 두면, 나중에 "왜 이 봇을 열었지?"라는 질문에 파일 자체가 답이 된다. 이번 실험에서도 실제 서비스 중인 파일의 주석이 그 근거를 알려 주었다. 별도의 차단 그룹은 보이지 않았고, 주석만이 제거 사실을 말해 주고 있었다.

한 가지 유의할 점: 이번 검사에서는 서버가 봇에게 알려 주는 신호(헤더)를 읽는 데 실패해, 그 경로로는 아무것도 확정하지 못했다. 그러니 오늘 확인해야 할 근거는 결국 파일 안의 줄과 주석뿐이다. 눈에 보이는 이 기록을 직접 확인하고 남겨 두는 것이 확실한 방법이다.

## 이 글이 확인하지 못한 것

- Cloudflare가 제공하는 검색·학습·입력 허용 표시 값, 세 번 실행 모두 실패해 하나도 관측하지 못했다
- 구글 검색 결과 위에 AI가 만들어 주는 답변에서 인용이 어떻게 바뀌는지 — 이 실험의 범위 밖이다
- Anthropic 봇 토큰이 검색과 학습을 분리하는지 — 문서 본문이 발췌에 담기지 않아 확인하지 못했다
- 코드 기록용 작업 폴더에 robots.txt 사본이 없어 라이브 파일과 원본의 차이 원인은 규명하지 못했다

이 판단이 틀릴 조건은 다음과 같다. Google이 학습과 인용을 따로 설정할 수 있는 별도 토큰이나 설정을 공식 제공하기 시작하거나, Google-Extended를 차단한 뒤에도 AI 검색 인용이 그대로 유지되는 대조 관측이 나오면 이 주장은 틀린 것이다.

## 참고 자료

1. [robots.txt](https://www.jangwook.net/robots.txt) — jangwook.net
2. [OpenAI crawlers and fetchers](https://platform.openai.com/docs/crawlers) — OpenAI
3. [Anthropic docs](https://docs.anthropic.com/) — Anthropic