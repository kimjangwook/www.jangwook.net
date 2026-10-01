2026년 6~8월 실무 화제와 샌드박스 실측 가능 소재를 중심으로 X와 웹을 동시에 조사합니다. 확인된 출처만 남기겠습니다.6~8월 화제 후보가 잡혔습니다. X에서 실제 반응 규모를 확인하고, 원문·발표를 교차검증합니다.키워드가 너무 넓어 잡음이 많았습니다. 인용 가능한 원문과 고반응 포스트만 좁혀 확인합니다.1차 원문을 열어 수치와 발표일을 확인합니다. 동시에 나머지 주제의 6~8월 화제를 더 좁혀 찾습니다.원문 확인을 이어가며, 6~8월에 실제로 퍼진 포스트와 법률·하네스 발표를 교차검증합니다.남은 핵심 원문과 6~8월 반응 규모를 확인한 뒤 항목별로 정리합니다.GSC 대화 조각 분류와 cats.txt 실험은 실측 소재로 바로 쓸 수 있습니다. 해당 글과 Semrush 실험 원문을 확인합니다.조사 기간은 2026-06-01~2026-08-15. 확인한 원문·공식 문서·X 포스트만 적는다. 반응 규모는 해당 출처에서 읽은 숫자다.

---

## 1. 주제별, 2026년 6~8월에 실제로 움직인 변화

### AIO (AI Optimization / Google AI Overviews·AI Mode)

**1. Search Console에 Generative AI 전용 리포트가 생겼다.**  
Google이 6월 3일 Search/Discover용 리포트를 발표했고, 8월 11일경 대부분의 속성에 풀렸다. 노출·페이지·국가·기기·날짜만 있고 클릭·쿼리는 없다.  
무엇이 새로운지: AIO가 업체 대시보드 용어에서 Google 공식 측정 단위로 올라왔다.  
출처: [Google Search Central, 2026-06-03](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) · [SERRoundtable, 2026-08-11](https://www.seroundtable.com/google-search-console-ai-report-live-41850.html)  
반응: 공식 발표. X에서 Corey Haines 스크린샷 159 likes / 1.2만 views ([@coreyhainesco](https://x.com/coreyhainesco/status/2087273604484567427)).

**2. Google이 AEO/GEO를 “SEO의 별칭”으로 정리하고, 사이트 단위 포함 토글을 달았다.**  
5월 가이드가 6~7월에 갱신됐다(문서 Last updated 2026-07-10). RAG·query fan-out을 공식 설명하고, llms.txt·청킹·가짜 멘션을 Google Search용으로 무시하라고 적었다. Search Console에서 generative AI 피처 포함을 켜야 노출 자격이 생긴다.  
무엇이 새로운지: AIO가 별도 해킹이 아니라 인덱스·스니펫 자격 + 포함 설정 + 기존 SEO라는 입장이 문서화됐다.  
출처: [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)  
반응: Neil Patel 요약 영상 122 likes / 1.67만 views ([@neilpatel](https://x.com/neilpatel/status/2079989940692156555)).

**3. 일반 Performance 리포트에 AI Mode 대화 조각이 쿼리로 샌다.**  
“yes”, “go on”, “what about Gemini?”가 쿼리로 찍힌다. John Mueller가 메커니즘을 확인했다. AI Mode 후속 질문이 새 쿼리로 잡히고, 답에 나온 페이지에 노출이 붙는다. 전용 Generative AI 리포트에는 쿼리가 없다.  
무엇이 새로운지: AIO 가시성을 쿼리 단위로 보려면 숨겨진 대화 로그를 일반 리포트에서 꺼내야 한다.  
출처: [Suganthan, 2026-08-13/14](https://suganthan.com/blog/ai-mode-queries-search-console/) · [SERRoundtable, 2026-08-06](https://www.seroundtable.com/google-search-console-ai-mode-queries-41821.html)  
반응: Suganthan 스레드 58 likes / 3,062 views / 북마크 53 ([@suganthan](https://x.com/suganthan/status/2087836668367888618)).

**샌드박스:** 1·3. GSC에서 Generative AI 탭 노출을 페이지별로 뽑고, 일반 쿼리에서 `^(yes|yeah|ok|okay|sure)[?!,.]*$`로 reply artefact를 세면 한나절에 끝난다.

---

### GEO (Generative Engine Optimization)

**1. Search 팀과 Chrome 팀이 llms.txt를 정반대로 취급한다.**  
Search 가이드: Google Search(생성형 포함)는 llms.txt를 쓰지 않는다. 유지해도 가시성에 득실 없다.  
Lighthouse 13.3 Agentic Browsing: `/llms.txt` fetch를 검사한다. 404면 N/A, 서버 에러면 실패.  
무엇이 새로운지: “GEO 파일 하나”가 검색 랭킹 신호가 아니라 에이전트 탐색 신호인지가 쟁점이 됐다.  
출처: [Google guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) · [Lighthouse llms.txt audit](https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt) · [Search Engine Land, 2026-05-20](https://searchengineland.com/google-llms-txt-chrome-lighthouse-478246)  
반응: 8월에도 이어짐. Glenn Gabe가 cats.txt 반례를 인용(28 likes / 5,910 views, [포스트](https://x.com/glenngabe/status/2086070924600639817)).

**2. 크롤러 로그는 llms.txt를 거의 안 집는다.**  
Limy가 5.15억 LLM 봇 히트 중 `/llms.txt` 직접 요청 408건이라고 썼다. GPTBot·ClaudeBot·PerplexityBot·OAI-SearchBot·Google-Extended는 HTML을 직접 탄다.  
무엇이 새로운지: 파일 배포와 실제 fetch가 분리됐다.  
출처: [Limy, 2026-05-12](https://limy.ai/blog/llms.txt-in-2026-the-full-guide) (6~8월 논쟁의 근거로 계속 인용)

**3. Semrush 481명 설문: 전략은 바뀌었고 운영은 안 바뀌었다.**  
85%가 AI가 검색 전략을 바꿨다고 했고, SEO·AI 검색을 전략·실행·리포팅까지 통합한 팀은 22%. 통합 팀은 AI 관련 트래픽/리드를 81%가 봤고, 완전 분리 팀은 36%. 측정은 40%가 ChatGPT에 손수 프롬프트를 넣는 방식.  
무엇이 새로운지: GEO가 콘텐츠 팁이 아니라 소유권·측정 인프라 문제로 옮겨졌다.  
출처: [Semrush, 2026-06-03](https://www.semrush.com/blog/the-operational-gap-ai-seo-study/)

**샌드박스:** 1·2. 자기 서버 로그에서 `llms.txt` UA별 히트를 세고, Lighthouse Agentic Browsing과 Search Console 포함 설정을 나란히 찍으면 된다.

---

### 웹 접근성 (a11y)

**1. 연방 Title II 기한은 1년 밀렸고, 주 기준은 그대로인 곳이 있다.**  
DOJ IFR(2026-04-20): 인구 5만 이상 2026-04-24 → 2027-04-26, 그 외·특별구 2028-04-26. 의견 마감 2026-06-22, 댓글 250. 페이지뷰 131,958(2026-08-15 기준). 표준은 여전히 WCAG 2.1 AA.  
Washington USER-01: 공개 콘텐츠는 2026-04 WCAG 2.1 AA, **2026-07-01부터 WCAG 2.2 AA**. 연방 연장은 주 기한을 바꾸지 않는다고 주 형평성국이 명시했다.  
무엇이 새로운지: “2026년에 WCAG가 의무화된다”는 한 줄이 연방 2.1 / 주 2.2 / 연기된 Title II로 갈라졌다.  
출처: [Federal Register 2026-07663](https://www.federalregister.gov/documents/2026/04/20/2026-07663/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web) · [ADA.gov fact sheet](https://www.ada.gov/resources/2024-03-08-web-rule/) · [WA Office of Equity](https://equity.wa.gov/digital-accessibility)

**2. 접근성 트리가 에이전트 입력 채널로 공식화됐다.**  
web.dev: 에이전트는 스크린샷·HTML·accessibility tree를 같이 본다. 시맨틱 HTML·`role`·레이블 `for`·8px² 이상 히트영역·안정 레이아웃이 에이전트 성공률에 직접 연결된다. Lighthouse Agentic Browsing도 a11y tree 무결성을 본다.  
무엇이 새로운지: a11y가 소송 체크리스트가 아니라 AX의 기계 가독 레이어가 됐다.  
출처: [web.dev, last updated 2026-04-01](https://web.dev/articles/ai-agent-site-ux) · [Chrome WebMCP](https://developer.chrome.com/docs/ai/webmcp)

**3. 캘리포니아 AB 2190은 여름에 멈췄다.**  
Unruh 웹 접근성 소송을 제한하려는 법안. Converge Accessibility 6월 리걸 업데이트(7월 6일 게시)는 비활성 파일로 갔다고 적었다.  
무엇이 새로운지: 민간 웹 소송의 “기술 표준 + 선의의 노력 항변” 입법이 한 사이클 죽었다.  
출처: [Converge, 2026-07-06](https://convergeaccessibility.com/2026/07/06/legal-update-june-2026/) · [AB 2190 텍스트](https://legiscan.com/CA/text/AB2190/id/3415621)

**샌드박스:** 1의 2.2 신규 SC, 2. axe-core/Lighthouse로 2.1 AA vs 2.2 AA 델타를 재고, DevTools accessibility tree와 스크린샷만으로 같은 플로우를 에이전트에게 태워 성공률을 비교한다.

---

### AI를 이용한 업무 프로세스 자동화

**1. MCP 스펙 `2026-07-28`이 상태를 버렸다.**  
핸드셰이크·`Mcp-Session-Id` 폐기. 요청마다 버전·클라이언트 정보가 실리고, `Mcp-Method`/`Mcp-Name` 헤더로 게이트웨이가 라우팅한다. 중간 확인은 MRTR(`input_required`). `tools/list`에 `ttlMs`·`cacheScope`. DCR은 CIMD로 이전. Roots/Sampling/Logging 12개월 폐기. TS/Python SDK 각 10억 다운로드 누적, Tier 1 SDK 월 약 5억 다운로드라고 공식 블로그가 적었다.  
무엇이 새로운지: 업무 자동화 MCP를 “세션 있는 봇”에서 “로드밸런서 뒤 HTTP 워크로드”로 옮겼다.  
출처: [MCP Blog, 2026-07-28](https://blog.modelcontextprotocol.io/posts/2026-07-28/)

**2. GSC에 다른 사람의 에이전트 하네스 프롬프트가 쿼리로 찍힌다.**  
Suganthan 데이터: 16개월 1,127개 대화형 쿼리. 에이전트 하네스 버킷 노출 2,181. 트래커 프로브 124쿼리 / 2,902 노출. 두바이 날씨 프롬프트가 5일간 약 2,160회.  
무엇이 새로운지: 자동화 트래픽이 검색 로그의 관측 가능한 배기가 됐다.  
출처: [Suganthan](https://suganthan.com/blog/ai-mode-queries-search-console/)

**3. OpenAI가 과학 소프트웨어를 코딩 에이전트로 현대화한 필드 리포트를 냈다.**  
8개 프로젝트(생명과학 중심). 5개는 Codex만, 3개는 Codex+Claude Code.  
무엇이 새로운지: 업무 자동화가 이메일 초안에서 레거시 과학 코드베이스 개조로 범위가 넓어졌다.  
출처: [OpenAI, 2026-07-28](https://openai.com/index/scientific-computing-agentic-ai/)

**샌드박스:** 1·2. 로컬 MCP 서버를 신스펙으로 올리고 세션 없이 라운드로빈이 되는지 재고, 자기 GSC에서 “search the web for…”류 하네스 쿼리를 분류한다.

---

### AI 네이티브 팀 빌딩

**1. Claude Code 헤드 Boris Cherny가 추상화 단계를 네 줄로 잘랐다.**  
2023 직접 코딩 → 2024 프롬프트 → 2025 루프 작성 → **2026 루프를 돌리는 하네스**.  
무엇이 새로운지: 팀 스킬이 프롬프트가 아니라 환경 설계로 옮겨졌다는 현장 정의가 퍼졌다.  
출처: X [@sairahul1](https://x.com/sairahul1/status/2063547299167711308) 1,134 likes / 140 RT / 2,895 북마크 / 37만 views (2026-06-07)

**2. Nx가 Polygraph를 “메타 하네스”로 출시했다.**  
에이전트가 한 레포·한 세션에 갇히는 공간/시간 장벽을 조직 의존성 그래프 + 세션 기록으로 푼다고 했다. AI Engineer NY에서 여러 팀이 같은 고통을 확인했다고 적었다.  
무엇이 새로운지: AI 네이티브가 개인 Copilot이 아니라 멀티레포·다중 에이전트 기억 인프라 문제로 구체화됐다.  
출처: [Nx, 2026-06-26](https://nx.dev/blog/announcing-polygraph)

**3. Netlify가 자기 제품에 AXIS를 먼저 돌리고, 스킬이 점수를 평균 26점 올렸다고 공개했다.**  
Agent Runners 종합 84/100. 문서와 에이전트 컨텍스트가 어긋나면 PR에서 시나리오가 실패하게 만들겠다고 했다. Auth0이 창립 기여자.  
무엇이 새로운지: 팀 성숙도를 “도구 몇 개”가 아니라 에이전트 시나리오 점수로 재기 시작했다.  
출처: [Netlify, 2026-06-24](https://www.netlify.com/blog/how-we-measure-netlify-agent-experience/)

**샌드박스:** 3. 자기 CLI/사이트에 시나리오 2~3개를 만들고 `npx`로 AXIS 또는 동등한 “콜드 vs 스킬 있음” 점수를 잰다.

---

### AX (Agent Experience)

**1. AXIS가 AX를 Lighthouse처럼 점수화했다.**  
4축: Goal Achievement, Environment, Service, Agent. 22개 에이전트(claude-code, codex, gemini, cline, goose, cursor-agent, copilot 등).  
무엇이 새로운지: 용어 논쟁에서 재현 가능한 점수로 넘어갔다.  
출처: [axis.run](https://axis.run) · [github.com/netlify/axis](https://github.com/netlify/axis) · [Netlify 측정 글](https://www.netlify.com/blog/how-we-measure-netlify-agent-experience/)

**2. WebMCP가 Chrome 149 Origin Trial로 사이트에 툴을 노출한다.**  
선언형(HTML 폼 어노테이션) + 명령형 JS. `tools` Permissions Policy. Gemini in Chrome이 API를 쓴다고 문서가 적었다. 문서 갱신 2026-08-07.  
무엇이 새로운지: AX가 “문서를 잘 쓰라”에서 브라우저 표준 툴 호출로 내려왔다.  
출처: [developer.chrome.com/docs/ai/webmcp](https://developer.chrome.com/docs/ai/webmcp)

**3. Queen’s University: MCP 툴 설명 97.1%가 smell.**  
856 툴 / 103 서버. 목적 불명 56%. 설명 보강 시 성공률 중앙값 +5.85pp, 부분 목표 +15.12%, 실행 스텝 +67.46%, 16.67%는 회귀.  
무엇이 새로운지: AX의 병목이 UI가 아니라 툴 설명 문장이라는 측정이 나왔다.  
출처: [arXiv:2602.14878](https://arxiv.org/html/2602.14878v1)

**샌드박스:** 1·2·3. 개인 사이트에 WebMCP 데모 툴 하나, AXIS 시나리오 하나, MCP 툴 description A/B.

---

### 좋은 프롬프트 작성법 (2023 단어 목록 제외, 구조·조판)

**1. Anthropic 공식 가이드가 “문장”보다 “조판·위치·스타일 일치”를 적었다.**  
XML 태그로 역할/컨텍스트/예제를 분리. 장문 데이터는 프롬프트 **위**, 질문은 **아래**(복잡 다중문서에서 품질 최대 약 30%). 프롬프트의 마크다운 밀도가 출력 마크다운을  Mil어올린다. Prefill은 4.6+에서 400. Opus 4.5/4.6는 thinking off일 때 “think” 단어에 민감.  
무엇이 새로운지: 좋은 프롬프트가 어휘가 아니라 태그·순서·출력 스타일 미러링이 됐다.  
출처: [Claude prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

**2. Pi의 compaction이 “그냥 요약 프롬프트”임이 드러났다.**  
시스템 프롬프트·툴 콜은 남기고 중간을 LLM 요약. 손실 압축. @dotey가 그 점을 짚었다.  
무엇이 새로운지: 장기 세션 프롬프트 품질이 작성 기술이 아니라 무엇을 잘라 남기는지 문제가 됐다.  
출처: [Pi @pidotdev](https://x.com/pidotdev/status/2087879340457660721) 2,015 likes / 197,414 views · [인용](https://x.com/dotey/status/2088330456022311109) 342 likes / 85,628 views

**3. 탐지 쪽은 단어 목록 다음 층으로 문장 길이·구두점·보이지 않는 공백을 본다.**  
Pangram: 문장 길이/스타일 분산 부족, em dash 과다, 세미콜론·괄호 과소, Oxford comma, 단락 길이 균일, “Perfect grammar”, 축약 회피.  
Sean MacIntyre: ChatGPT가 non-breaking space(U+00A0)를 넣는다는 조판 신호.  
무엇이 새로운지: 2023 어휘 리스트 다음 층이 리듬·구두점·비가시 문자다.  
출처: [Pangram](https://www.pangram.com/blog/comprehensive-guide-to-spotting-ai-writing-patterns) · [LinkedIn, Sean MacIntyre](https://www.linkedin.com/posts/seanmacintyre_you-want-to-know-what-the-real-tell-of-ai-activity-7351064041752018946-QFM-)

**샌드박스:** 1·3. 같은 과제를 (a) 평문 (b) XML 태그 (c) 장문 위/질문 아래 (d) 마크다운 제거 프롬프트로 돌리고, 출력의 em dash 밀도·문장 길이 CV·NBSP 개수·XML 누출을 센다.

---

### 에이전트 하네스 설계

**1. DeepSeek Harness(`dsh`)가 8월 13일 오픈소스됐다.**  
“Everything is a plugin.” Cordis 커널. 모델·툴·세션·샌드박스·루프·UI가 런타임 플러그인. 공식: Agent = Model + Harness. Armin Ronacher(Pi)가 “이 분야에서 처음으로 다시 설계를 생각하게 했다”고 했다.  
무엇이 새로운지: 상용 CLI 일체형 대비 플러그인 런타임이 공개 기준점이 됐다.  
출처: [deepseek.com/harness](https://deepseek.com/harness/en/) · [github.com/deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)  
반응: [@mitsuhiko](https://x.com/mitsuhiko/status/2088189145952731317) 1,861 likes / 42.9만 views · [@tianyi](https://x.com/tianyi/status/2088306143772946499) 2,052 likes / 18.8만 views

**2. OpenAI가 2월에 낸 “0줄 수동 코드” 하네스 실험이 6월 HN에서 다시 싸웠다.**  
5개월, ~100만 LOC, ~1,500 PR, 엔지니어 3→7, 인당 3.5 PR/일. 인간이 짠 코드 0. AGENTS.md를 줄이고 `docs/` 정보구조를 가꿨다는 2차 정리.  
무엇이 새로운지: 하네스가 프레임워크 이름이 아니라 “에이전트가 볼 수 있는 환경”이라는 정의가 재유통됐다.  
출처: [openai.com/index/harness-engineering](https://openai.com/index/harness-engineering/) · [HN 2026-06-07](https://news.ycombinator.com/item?id=48416264)

**3. Nx Polygraph = 조직용 메타 하네스 (6월 26일).**  
위 팀 빌딩 항목과 동일 사건. 하네스 한 겹 위에 레포 그래프·세션 기억을 얹는 층.

**샌드박스:** 1. `npx @deepseek-ai/dsh web`로 로컬 띄우고, Minimal mode(bash+에디터) vs Standard의 같은 과제 성공/토큰/루프를 잰다.

---

## 2. 한나절 안에 자기 사이트·로컬에서 실측할 수 있는 것만

| 소재 | 한 줄 측정 |
|---|---|
| GSC Generative AI 탭 | Performance → Generative AI에서 16개월 페이지별 노출을 내려 일반 Web 노출과 비를 낸다. 클릭은 없다. |
| GSC 대화 조각 | 쿼리 정규식 `^(yes\|yeah\|ok\|okay\|sure)[?!,.]*$`와 “what about ”를 걸어 reply/pivot을 센다. 또는 `npx -y suganthan-gsc-mcp setup` 후 `genai_conversation_queries`. |
| llms.txt 실사용 | access 로그에서 `/llms.txt`를 UA별로 센다. GPTBot 등이 HTML만 치는지 확인. Lighthouse Agentic Browsing과 결과를 나란히 둔다. |
| 페이지 상단 비교표 | Semrush가 리스트 5개에 상단 표를 넣어 4주 후 인용 +16.1%(ChatGPT +21.6%)를 보고했다. 자기 리스트 글 1개에 표를 넣고 ChatGPT/Perplexity/AI Overviews에 동일 프롬프트 20회씩 전후 인용 여부를 센다. 출처: [Semrush, 2026-03-27](https://www.semrush.com/blog/ai-visibility/) |
| WCAG 2.1 vs 2.2 | axe-core로 2.2 신규 SC(포커스 모양, 드래그, 접근 가능한 인증, 중복 입력 등)만 필터해 실패 수를 센다. |
| a11y tree vs 스크린샷 | 같은 예약/폼 플로우를 (a) 시맨틱 HTML (b) `<div>`+ARIA (c) overlay 위젯으로 두고, Chrome 에이전트 또는 WebMCP inspector로 완주율을 센다. |
| WebMCP 툴 1개 | `chrome://flags/#enable-webmcp-testing` 후 [공식 데모](https://googlechromelabs.github.io/webmcp-tools/demos/explainer/#compare)처럼 `submit_*` 툴을 등록하고, DOM 스크랩 vs 툴 호출 스텝 수를 잰다. |
| MCP 툴 설명 A/B | 자기 MCP 툴 description을 Queen’s 6요소(목적·가이드·제한·파라미터·길이·예시)로 보강한 뒤 같은 과제 20회. 성공률과 스텝 수. |
| XML vs 평문 프롬프트 | Claude에 동일 과제. 출력 스키마 준수율, 마크다운 밀도, 내부 태그 누출. |
| 조판 신호 | 모델 출력에서 U+00A0, U+2014 밀도, 문장 길이 분산, 세미콜론/괄호 비율을 스크립트로 센다. |
| DeepSeek Minimal vs Standard | 같은 코딩 과제. 성공, 토큰, 무한루프 여부(Zhihu 리뷰어가 Flash에서 루프를 봤다고 적음). |
| AXIS 콜드 vs 스킬 | 자기 CLI에 시나리오 1개. 스킬 파일이 점수·시간·토큰을 얼마나 바꾸는지. |

---

## 3. AX와 에이전트 하네스 — 누가 무슨 뜻으로 쓰나

용어는 안 굳었다. 지금 현장에서 겹치는 네 갈래다.

### AX

| 화자 | 뜻 | 사례 |
|---|---|---|
| **Netlify / Mathias Biilmann** (2025-01 조어, 2026에도 본진) | 에이전트가 제품·플랫폼의 **사용자**일 때의 총체적 경험. 발견·호출·실패 복구. DX의 연장. | ChatGPT→Netlify 배포 GPT. 하루 1,000+ 사이트. AXIS로 자기 점수 84. [조어 글](https://biilmann.blog/articles/introducing-ax/) · [netlify.com/agent-experience](https://www.netlify.com/agent-experience/) |
| **Richard MacManus** (2026-05-05) | 1년 차는 “새 DX”, 지금은 **새 UX**. 에이전트가 사이트를 쓰는 쪽. | [ricmac.org](https://ricmac.org/2026/05/05/agent-experience-new-ux/). Liad Yosef: `UX = AX + UAX`(사람이 그 에이전트를 겪는 경험). |
| **Chrome / web.dev** | 브라우저 에이전트가 페이지를 읽고 **작동(actuation)** 하는 품질. | WebMCP, a11y tree, CLS, llms.txt. [web.dev](https://web.dev/articles/ai-agent-site-ux) |
| **Nx / Cloudflare AX 팀** | 개발 도구·CLI가 에이전트에게 주는 경험. JSON 이벤트, idempotent, informative not instructive. | [Nx 2026-03-05](https://nx.dev/blog/making-nx-agent-ready). Cloudflare [agent-experience.dev](https://agent-experience.dev) 26 패턴(toolability / recoverability / traceability). Nx가 인용. |
| **마케팅 쪽 일부** | 브랜드가 에이전트에게 어떻게 보이는지. UX의 기계판. | [MING Labs](https://www.minglabs.com/insights/concepts/what-is-agent-experience) 등. Netlify·Chrome 정의와 겹치지만 측정 도구가 다름. |

Adobe는 Semrush 인수 맥락에서 **ASO(agentic search optimization)** 를 썼다. MacManus가 기록. GEO/AEO/AIO와 같은 자리를 두고 싸운다.

### 에이전트 하네스

| 화자 | 뜻 | 사례 |
|---|---|---|
| **OpenAI (Ryan Lopopolo)** | 에이전트가 코드를 짜게 만드는 **환경**. 문서, 테스트, CI, 관찰성. 모델이 아니라 스캐폴딩. | 수동 코드 0줄, ~100만 LOC. [Harness engineering](https://openai.com/index/harness-engineering/) |
| **Boris Cherny / Anthropic** | 에이전트 위의 한 단계. 루프를 돌리는 시스템. | Claude Code. 6월 클립 37만 views. |
| **LangChain 정리(@mfishbein 인용)** | 시스템 프롬프트 + 메모리 + 툴/스킬/MCP/서브에이전트 + 인프라 + 오케스트레이션 + 훅. “에이전트 = 모델 + 하네스.” | [X, 2026-08-12](https://x.com/mfishbein/status/2087484804912590876) |
| **DeepSeek** | 플러그인 런타임. 루프 자체도 플러그인. | `dsh`, Cordis. |
| **Nx** | 단일 에이전트 런타임 위의 **메타 하네스**. 공간(멀티레포)과 시간(세션 기억). | Polygraph, 2026-06-26. |
| **Phil Schmid** | 2026에 복잡한 다일 작업을 버티게 하는 실행 환경. Claude Code·LangChain DeepAgents를 일반 하네스 희소 사례로 듦. | [philschmid.de, 2026-01-05](https://www.philschmid.de/agent-harness-2026) |
| **실무 속어** | Claude Code, Codex, Cursor, Pi, Cline 같은 **코딩 에이전트 제품 전체**. | Firecrawl 8월 비교, explainx 7월 랭킹. |

겹치는 문장: **모델은 영혼, 하네스는 환경**. AX는 그 환경이 바깥 서비스·웹을 얼마나 잘 쓰게 하는지의 품질이다. 같은 “AX”가 Netlify에선 API 점수, Chrome에선 DOM/트리, 마케터에겐 인용이다.

---

## 4. 이미 포화된 소재 / 아직 개인이 안 잰 빈칸

### 포화 (같은 글이 이미 많다)

- AEO vs GEO vs AIO vs SEO 약어 정리, “SEO는 죽지 않았다”.
- llms.txt 작성법, 템플릿, WordPress 플러그인 설치기. Google이 검색에 안 쓴다고 적은 뒤에도 동일 튜토리얼이 반복된다.
- 2023 단어 목록(delve, tapestry, “it is important to note”, tapestry/landscape/underscore).
- n8n/Make “AI 에이전트 노드로 업무 자동화” 입문 영상.
- “AI 네이티브 팀 = 도구를 많이 산 팀” 선언문. 측정 없는 역할명 교체.
- WCAG 체크리스트·overlay 위젯 찬반(FTC–accessiBe $1M은 2025-01, 2026에도 같은 문장).
- “프롬프트에 역할을 주어라, few-shot을 넣어라.”

### 빈칸 (확인한 범위에서 개인 실측이 거의 없음)

- **한국어·일본어 GSC 대화 조각.** Suganthan 분류기는 영어. 한글 “응”, “계속”, “그건 어때”가 같은 버킷인지 공개 데이터셋이 없다.
- **개인 사이트 로그의 llms.txt fetch율.** Limy는 엔터프라이즈 5억 히트. 개인 블로그 access.log를 UA별로 공개한 글은 이 조사에서 못 찾았다.
- **a11y tree vs WebMCP vs 스크린샷** 동일 과제의 성공률·토큰·시간. web.dev는 원리를 적었고 A/B 숫자는 없다.
- **조판 층 신호의 모델별 빈도.** NBSP, U+2014, 문장 길이 CV, 세미콜론/괄호, 단락 길이 균일도를 Claude/GPT/Gemini/DeepSeek에 같은 프롬프트로 잰 표가 없다. Pangram은 목록이고 모델 비교표가 아니다.
- **프롬프트 마크다운 밀도 → 출력 마크다운 밀도**의 기울기. Anthropic이  qualitatively 적었을 뿐.
- **하네스 델타.** 같은 모델에서 compaction/훅/권한만 바꾸고 held-out 과제에서 일반화되는지. 8월 15일 중문 포스트가 ALFWorld/LiveMath에서 과적합·compute를 지적했지만 개인 재현 글은 없다.
- **스킬 파일 vs 긴 MCP description**의 토큰·성공 트레이드오프. Queen’s는 description 보강이 스텝을 67% 늘린다고 했다. 스킬(점진 공개)과 맞바꾼 공개 실험이 없다.
- **GSC 하네스 쿼리로 경쟁사 트래커를 역추적.** Suganthan이 자기 사이트에서만 했다.
- **Washington 2.2 신규 SC가 개인 사이트에서 실제로 깨지는 비율.** 주 기한은 지났고, 개인 블로그 실측은 안 보인다.

확인하지 않은 것(HBS Kim & Koning 2026 헤드카운트 논문, DeepSeek 스타 수, cats.txt 원문 전문)은 쓰지 않았다.
