# probe-2026-09-03-google-extended-one-token-training-and-grounding-2026

question: Google-Extended가 학습과 grounding을 하나의 토큰으로 묶는 '유일 레버 = robots.txt 토큰'이라는 주장을 자사 robots.txt 토큰 대조와 UA 6종 응답으로 반증하거나 확인할 수 있는가

## cells
- c1-live-robots-google-token-solitude — hits=0/3 usable=3/3 — exit 0,0,0 — 라이브 robots.txt 발췌에서 Google-Extended는 '학습 차단 그룹(GPTBot·ClaudeBot·CCBot·Google-Extended)을 제거했다'와 '학습과 그라운딩(인용)을 묶은 단일 레버'라는 주석에만 등장하고, User-agent: * 아래에는 /ko/blog/en/ 등 교차 언어 경로의 Disallow만 확인되어 별도의 Google-Extended Disallow 그룹은 발췌 범위에서 관측되지 않았다.
- c2-git-vs-live-drift-source — hits=0/3 usable=3/3 — exit 0,0,0 — 라이브 robots.txt는 HTTP 200에 22줄(Sitemap: https://jangwook.net/sitemap.xml로 종료)이었고 git working copy에는 robots.txt가 없어 라이브 전체 관측으로 대체되었으며, 기대했던 git-라이브 줄수 드리프트나 Cloudflare 삽입 블록은 이 관측에서 나타나지 않았다.
- c3-ua6-http-status-uniformity — hits=0/3 usable=3/3 — exit 0,0,0 — Google-Extended, Googlebot, GPTBot, ClaudeBot, OAI-SearchBot, Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 여섯 UA의 본문 요청이 모두 first=200 final=200으로 균일하여 HTTP 단 차단이 없음이 확인되었으나, 기대와 달리 리다이렉트 단계는 관측되지 않았다.
- c4-content-signal-header-ai-input — hits=0/3 usable=0/3 — exit 1,1,1 — Content-Signal 헤더 셀은 3회 실행 모두 exit 코드 1로 usable_runs 0이고 출력이 비어 있어 search·ai-train·ai-input 값을 전혀 관측하지 못했고, 이에 따라 헤더가 grounding 분리 레버가 아니라는 기대는 검증되지 못했다.
- c5-official-docs-token-independence — hits=0/3 usable=3/3 — exit 0,0,0 — OpenAI 공식 문서 발췌에서 OAI-SearchBot(9행)·ChatGPT-User(6행)·OAI-AdsBot(5행)·GPTBot(5행) 토큰이 나열되고 'independent of the others – for example, a webmaster can allow OAI-SearchBot in order to appear in search results while disallowing GPTBot'라는 문장이 확인되어 검색·학습 토큰의 독립 설정이 문서화되어 있었다.
- c6-anthropic-docs-token-split — hits=0/3 usable=3/3 — exit 0,0,0 — Anthropic 문서 요청은 exit-relevance 200을 3회 모두 반환했으나 발췌에 문서 본문 내용이 담기지 않아 토큰 분리('독립 설정') 명시를 이 결과만으로 확인하지 못했다.

## boundary
이 실험이 보여주지 못하는 것: (1) c4가 3회 모두 실패(exit 1, usable 0, 빈 출력)하여 Cloudflare Content-Signal 헤더의 실제 값을 관측할 수 없고, 따라서 헤더 차원에서 grounding 분리 레버의 부재를 입증하지 못한다. (2) robots.txt 발췌가 18행 근처에서 잘려 있어 Google-Extended 자체의 Disallow 그룹 포함 여부와, OAI-SearchBot·Claude-SearchBot·PerplexityBot 같은 인용 허용 그룹에 Google 몫의 대응 검색 토큰이 없다는 대조를 발췌만으로 확정하지 못한다. (3) c6 발췌는 상태 코드 200뿐이라 Anthropic 문서가 토큰 분리를 명시한다는 내용 자체는 담고 있지 않다. (4) git working copy에 robots.txt가 없어 git 기준 원본과 라이브의 드리프트 원인 규명은 이번 실행으로 불가능했다.

## quotes
- text: Google-Extended는 학습과 그라운딩(인용)을 묶은 단일 레버라 인용 통로까지 함께 닫혔다.
  url: https://www.jangwook.net/robots.txt
  bears_on: c1-live-robots-google-token-solitude
- text: HTTP 200, live lines:       22
  url: https://jangwook.net/robots.txt
  bears_on: c2-git-vs-live-drift-source
- text: Google-Extended first=200 final=200
  url: https://jangwook.net/robots.txt
  bears_on: c3-ua6-http-status-uniformity
- text: independent of the others – for example, a webmaster can allow OAI-SearchBot in order to appear in search results while disallowing GPTBot to indicate that crawled content should not be used for training OpenAI’s generative AI foundation models
  url: https://platform.openai.com/docs/crawlers
  bears_on: c5-official-docs-token-independence
- text: 200
  url: https://docs.anthropic.com/
  bears_on: c6-anthropic-docs-token-split

## anomalies
기대를 벗어난 지점이 다수 있다: (1) 라이브 robots.txt는 22줄이었고 git working copy에는 robots.txt 자체가 없어, 기대했던 git-라이브 줄수 차이와 Cloudflare 삽입 블록 드리프트는 관측되지 않았다. (2) UA 6종 요청이 모두 first=200 final=200으로 균일하여 중간 리다이렉트 단계가 나타나지 않았다. (3) c4만 exit 코드 1이 3회 반복되어 유일하게 데이터를 전혀 산출하지 못한 셀이 되었다. (4) 라이브 robots.txt 주석은 Google-Extended 그룹이 '제거'되었음을 선언하고 있어, 기대가 전제한 'Google-Extended가 Disallow 그룹에 있음' 상태와 관측된 파일 상태(주석 언급만) 사이에 간극이 있다.
