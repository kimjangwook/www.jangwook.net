2025-09~2026-08 자료와 반응 규모가 확인되는 출처만 모으기 위해 X와 웹을 동시에 검색한다.반응 규모가 확인된 X 포스트는 몇 개 잡혔다. 웹에서 부정 지시 실패 이유, 2026년 신규 tell, 기술글 구성 사례를 더 깐다.핵심 원문을 열어 반응 규모와 2026년 신규 패턴을 확인한다.2026년 신규 tell과 부정 지시 실패 근거를 원문에서 더 뽑고, 널리 읽힌 기술글 구성 사례를 찾는다.근거 등급을 먼저 박아 둔다. 아래 ‘검증’은 실험실 A/B가 아니라, (A) 벤더 공식 문서, (B) 2026 계량 조사, (C) 위키 편집자 필드 가이드, (D) 2025-09~2026-08 X에서 반응 규모가 확인된 실무 프롬프트다. 좋아요 한 자리 포스트는 쓰지 않았다.

## 1. 프롬프트 기법 11개

### 1) 부정지시 「AI처럼 쓰지 마」를 버리고, 원하는 산문을 긍정문으로 지정한다
**왜 먹히는지.** Anthropic 공식 문서가 출력 형식 조종의 첫 규칙으로 적는다. “Do not use markdown” 대신 “Your response should be composed of smoothly flowing prose paragraphs.” 부정은 금지 집합만 줄이고, 모델이 고를 다음 토큰을 올려 주지 않는다. 같은 문서의 다른 예: “NEVER use ellipses”보다 “Your response will be read aloud by a text-to-speech engine, so never use ellipses…”처럼 **왜인지**를 붙이면 일반화가 된다.
**출처.** [Anthropic Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) (공식 문서, 페이지뷰 미공개). 같은 논리를 2025-07 실무 글이 InstructGPT/NeQA 논문을 들어 재진술한다: “Don’t uppercase names”는 자주 무시되고 “Always lowercase names”가 따른다. [gadlet, 2025-07-02](https://gadlet.com/posts/negative-prompting/) / 논문 [arXiv:2209.12711](https://arxiv.org/abs/2209.12711), [arXiv:2305.17311](https://arxiv.org/abs/2305.17311), [arXiv:2306.08189](https://arxiv.org/abs/2306.08189) (논문 자체는 2022–23, 2025 글이 재인용).

### 2) 「사람처럼」 대신 구체적인 재작성 직무를 준다
**왜 먹히는지.** “Write like a human / let this sound human”은 목표 분포가 없다. 2026-06 X 스레드는 그걸 여섯 개 직무로 바꾼다. 예: “every sentence feels believable… Replace vague claims with specific details, realistic examples”; “from the perspective of someone who has actually done the work”; “showing how a real person would think… observations, tradeoffs, questions, doubts”.
**출처.** [AYO @sepril23NG, 2026-06-27](https://x.com/sepril23NG/status/2070990946552947151) — 좋아요 687, 리포스트 181, 북마크 1,347, 조회 27,015.

### 3) don’t 14개를 프롬프트에 나열하지 말고, 패턴 카탈로그 파일을 먼저 읽힌다
**왜 먹히는지.** 같은 스레드가 실패 원인을 이렇게 적는다. “Don’t sound like an AI / Don’t sound robotic”을 나열하면 “It forgets half by sentence three.” 대체문은 29단어: “Read my anti-AI writing style file first… Apply these as rules.” 파일은 Wikipedia *Signs of AI writing* 전문을 붙여 1,168줄 패턴을 내부화한다고 주장한다.
**출처.** [Comfort Fajugbagbe @comfortfajugbag, 2026-03-06](https://x.com/comfortfajugbag/status/2029823481802559643) — 좋아요 1,045, 리포스트 134, 북마크 1,362, 조회 43,940. 동일 파일 전략을 Ruben Hassid가 Claude Cowork 워크플로로 재현: 초안 후 `Audit it against the anti-ai-writing-style md.` [Substack, 2026-04-29](https://ruben.substack.com/p/its-not-x-its-y) — 하트 957, restack 168, 댓글 77.

### 4) 금지어가 아니라 문장 **모양**을 금지하고, 고칠 때는 긍정 절만 남긴다
**왜 먹히는지.** “It’s not [X], it’s [Y]”(negative parallelism)는 2026년에 단어 목록보다 더 강하게 잡힌다. Ruben 파일의 고침 규칙: 거부한 반쪽을 지우고 주장만 직설로. “It is not about the prompt. It is about the context.” → “Context controls the output.” 허용 대조는 사실·날짜·숫자·법률 구분뿐.
**출처.** 위 Ruben 글. X 쪽 압축본: [Michael Taiwo @AskMichaelTaiwo, 2026-08-06](https://x.com/AskMichaelTaiwo/status/2085369629082300742) — “no em dashes, no ‘it’s not just X, it’s Y’, no opening with ‘here’s the,’ no rule of three… If I paste a sample of my own writing below, match that voice.” 좋아요 204, 북마크 583, 조회 48,304.

### 5) 자기 글 샘플을 붙여 few-shot으로 목소리를 고정한다
**왜 먹히는지.** Anthropic: “Examples are one of the most reliable ways to steer… format, tone, and structure.” 권장 3–5개, `<example>`로 감싸기, 실제 용례와 가깝고 다양해야 한다. 모호한 “premium, Apple-like tone”보다 샘플 문장을 주는 쪽이 패턴을 잡는다.
**출처.** 위 Anthropic 문서. X에서 같은 규칙을 집필에 적용한 문장: Taiwo 위 포스트(“If I paste a sample…”). Kit Ledru는 “lead by example rather than incantation; show, don’t tell”과 “Write for Ken Thompson reading it, but a smart 15 yo understanding it”를 2025초부터 썼다고 한다. [Kit Ledru @kitledru, 2026-08-11](https://x.com/kitledru/status/2087000195280019734) — 좋아요 1, 조회 341. 반응은 작아서 **보조 사례**로만 적는다.

### 6) 역할은 캐릭터 연기가 아니라 제약 묶음이다
**왜 먹히는지.** Anthropic: 시스템 프롬프트 한 문장 역할만으로 톤이 바뀐다. 2026-02 바이럴 프롬프트는 역할을 “200 IQ + Mike Ehrmantraut”로 고정한 뒤, 금지 목록을 역할의 행동으로 바꾼다. “You don’t perform enthusiasm. You say what needs saying and stop.” / “No ‘Great question!’… No hedging preambles… Just say the thing.”
**출처.** [Machina @EXM7777, 2026-02-23](https://x.com/EXM7777/status/2025956575832420507) — 좋아요 1,770, 리포스트 84, 북마크 2,761, 조회 126,860.

### 7) 추상 형용사 대신 숫자·이름·제약·트레이드오프를 쓰라고 강제한다
**왜 먹히는지.** SlopDetector(2026-07-31)의 12번 신호가 가장 신뢰할 만하다고 적는다. 단락을 읽고 이름·숫자·날짜·원인·트레이드오프를 다시 말할 수 없으면 슬롭. 예: “Nutrition plays a crucial role…”는 지워도 정보가 안 줄고, “Swap the 6 p.m. soda for water and you cut roughly 40,000 calories a year”는 지울 수 없다. sepril23NG의 “MAKE IT BELIEVABLE / REAL EXPERIENCE VOICE”와 Ruben §7 Specificity가 같은 규칙을 프롬프트로 옮긴다.
**출처.** [SlopDetector, 2026-07-31](https://slopdetector.org/blog/signs-of-ai-writing). X: sepril23NG 위. Ruben 위.

### 8) 초안 후 별도 감사(audit) 패스를 한 번 더 돌린다
**왜 먹히는지.** Ruben 워크플로의 핵심은 생성 프롬프트가 아니라 사후 한 줄이다. `Audit your text using the anti-ai-writing-style.md`. 생성과 감사를 같은 토큰 예산에서 섞으면 금지 목록이 희석된다(아래 9번).
**출처.** Ruben 위. Comfort 스레드도 “The file does the heavy lifting. Not your prompt.”

### 9) 지시문을 늘리지 않는다. 요구사항이 늘면 준수율이 떨어진다
**왜 먹히는지.** 2025-05 논문: 요구사항을 프롬프트에 다 넣는 전략은 “performance can drop by 19% as we specify more requirements.” 2026-07 X 요약: Anthropic 엔지니어는 긴 프롬프트가 아니라 “intent, define boundaries, require proof” 네 가지. “Every unnecessary instruction increases cost, adds ambiguity.”
**출처.** [arXiv:2505.13360](https://arxiv.org/html/2505.13360v3). [Dami-Defi @DamiDefi, 2026-07-03](https://x.com/DamiDefi/status/2073035278852452404) — 좋아요 267, 리포스트 24, 북마크 133, 조회 37,965.

### 10) 문장 길이 분산(burstiness)을 숫자로 지시한다
**왜 먹히는지.** SlopDetector는 burstiness = 문장 길이 표준편차÷평균. GPTZero 인용 구간: 사람 0.6–1.2, 모델 0.2–0.4. 임계값 0.4 미만을 다양성 플래그로 쓴다. Taiwo/Ruben/Barr_OluT 프롬프트는 이를 “Vary the sentence lengths”로 옮긴다. Ruben은 한 박자 더: 짧은 문장, 긴 문장, 조각문 허용. 모든 문장을 짧게 만들라는 지시는 반대로 메트로놈이 된다(파일 §9 Anti-overfitting).
**출처.** SlopDetector 위. [GPTZero burstiness 설명](https://gptzero.me/news/perplexity-and-burstiness-what-is-it/). X: [Big Sis @The_Barr_OluT, 2025-09-03](https://x.com/The_Barr_OluT/status/1963155825502896398) — 좋아요 467, 리포스트 44, 북마크 2,466, 조회 53,121.

### 11) 금지는 ‘옆에’ 두고, 대체 형식을 같이 준다
**왜 먹히는지.** 부정 제약이 **전혀** 안 먹히는 것은 아니다. 2026-03 바이럴 스레드는 “negative prompting”을 한 문장 추가로  Mil고, 조회 53만이다. 다만 그 스레드의 본문은 이미지라 여기서 기법 내용을 재진술하지 않는다. 확인된 작동 형태는 Anthropic+Ruben 쪽이다. 금지를 쓸 때는 (a) 구체 패턴, (b) 바로 옆의 긍정 대체, (c) 사실 대조만 예외. “Don’t sound like AI”는 패턴이 아니라 평가라서 실패한다.
**출처.** [Louis Gleeson @aigleeson, 2026-03-07](https://x.com/aigleeson/status/2030204422970851444) — 좋아요 1,381, 북마크 4,731, 조회 532,107 (기법 세부는 미확인). 작동 형태는 Anthropic·Ruben·Comfort 위.

---

## 2. 2026년 기준으로 새로 잡히는 tell

2023 단어장(delve, tapestry 등)은 Wikipedia도 “2025에 급감”이라고 적는다. 아래는 그 이후이거나, 2026 계량이 옛 체크리스트를 **뒤집는** 항목만.

| 패턴 | 무엇이 새로운지 | 출처·규모 |
|---|---|---|
| **엠대시 단독은 더 이상 신호가 약하다** | Economist가 ChatGPT·Claude·Gemini·Grok vs 자사·NYT·WaPo·CNN·1950–2022 소설, **55,940문장 / 120만 단어** 비교. 현대 모델 중 사람보다 엠대시를 많이 쓰는 것은 Claude뿐. ChatGPT는 연구 대상 중 **가장 적게** 씀. Wikipedia도 2026-07 연구를 인용해 GPT-5.1이 엠대시를 억누른다고 적음. | [Economist, 2026-07-30](https://www.economist.com/culture/2026/07/30/how-to-spot-ai-writing). 공식 X [55좋아요 / 17RT / 45북마크 / 47,737조회](https://x.com/TheEconomist/status/2083910702230606073). 요약 [Fast Company, 2026-08-03](https://www.fastcompany.com/91584243/how-to-identify-ai-generated-writing-viral-report-has-surprising-new-clues-economist). [WP:AIDASH](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Overuse_of_em_dashes) |
| **구두점 부족 + 긴 문장 + and 남용** | LLM은 쉼표·세미콜론·괄호가 사람보다 적다. 문장이 더 길고, 가장 과잉인 단어가 “and”. 인용·괄호 삽입이 없어 구두점이 더 줄어든다. Fast Company 표현: “a lack of punctuation is a better indicator”. | Economist·Fast Company 위. Wikipedia가 같은 2026-07 연구를 각주 [19]로 인용 |
| **It’s not just X, it’s Y (및 15개 변장)** | Barron’s(Shaina Mishkin, 2026-04-14)가 대형 미국 기업 문서에서 이 구조가 **2024→2025 대략 2배**라고 집계. 원문 페이월. 재인용: [Slow Reveal Graphs, 2026-05-13](https://slowrevealgraphs.com/2026/05/13/its-not-just-a-trend-its-a-phenomenon-ai-signifying-sentence-structure-in-corporate-documents-doubled-from-2024-to-2025/). Ruben은 같은 기사를 2023년 50회 → 2025년 200+회로 인용(원문 수치는 여기서 미확인). Wikipedia가 하위 절로 독립 수록. | Barron’s [기사](https://www.barrons.com/articles/ai-corporate-communications-shareholders-red-flag-63211618). [WP:AIPARALLEL](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Negative_parallelisms). Ruben 위(하트 957) |
| **“has been profiled in” / “active social media presence” / Media coverage 절** | Wikipedia: “This is more common in text from AI tools released in **2025 or later**.” 토크 아카이브는 GPT-5 이후 3–4단어 구로 `has been profiled in`, `been featured in national`, `== Media coverage ==`, `== Online presence ==`가 뜬다고 적음. | [WP:AIATTR](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Canned_emphasis_on_notability,_attribution,_and_media_coverage). [Talk Archive 3](https://en.wikipedia.org/wiki/Wikipedia_talk:Signs_of_AI_writing/Archive_3) |
| **is/has 회피 (serves as / stands as / boasts / features)** | “is/are” 대체. Huang 등: 2023 학술문에서 is/are 10%+ 감소. 최근 출력은 `ventured into politics as a candidate`처럼 더 장식적. | [WP:AINOCOPULA](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Avoidance_of_basic_copulatives_(%22is%22/%22are%22_phrases)) |
| **우아한 변주 (같은 대상을 매 문장 개명)** | 반복 패널티. Claude → the assistant → the model → the chatbot. | [WP:AIELEVAR](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Lexical_diversity/elegant_variation). Ruben §8E |
| **GPT-5기 어휘는 단어가 아니라 동사-ing + 유명성 레토릭** | Wikipedia 시대 구분. 2023–24중: delve 등. 2024중–2025중: align with, showcasing, fostering. **2025중 이후(GPT-5): emphasizing, enhance, highlighting, showcasing + 유명성 절 언어.** delve는 2025에 급락. | [WP:AIVOCAB](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#High_density_of_%22AI_vocabulary%22_words) (페이지 배너: 2026-08, 최신 모델 부분은 갱신 필요) |
| **Grok 특유** | 2026 시점에도 underscore 과잉. 겉보기 과학 단어 causal, empirical, correlate. 대조는 “X rather than Y”가 특히 흔함(Grokipedia 2026-04 예). | 같은 Wikipedia 어휘·“X rather than Y” 절 |
| **문장 끝 -ing 꼬리 (highlighting / underscoring / reflecting / contributing to)** | 사실 뒤에 가짜 분석을 붙임. 2026-07 위키 AI 게시판 댓글까지 동일 템플릿. | [WP:SUPERFICIAL](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Superficial_analyses) |
| **Despite its X, faces challenges / Future Outlook 결말** | 개요형 결론. 도식 자체가 신호. | [WP:FACESCHALLENGES](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#Outline-like_conclusions_about_challenges_and_future_prospects) |
| **“Awards and recognition” 절 제목** | “X and Y” 헤더, 특히 Awards and recognition이 AI 초안에 거의 기본. | [WP:AISIGNS 해당 절](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) |
| **모델 발 마크업** | ChatGPT `oaicite`/`turn0search0`, Gemini `[cite: 1]`, **Grok `grok_card` / `grok_render_citation_card_json`**, DeepSeek 렌티큘러 괄호, Perplexity `ppl-ai-file-upload`. 2025–26 도구 흔적. | Wikipedia Markup 절 |
| **Title Case 헤더, Here’s the…, The result?** | 사람 헤더는 sentence case. “Here’s the thing / Here’s why that matters / The result? Transformation.” | Ruben §8G. Taiwo. SlopDetector #8. [huntingthemuse, 2025-09-20](https://huntingthemuse.net/library/how-to-tell-if-writing-is-ai) |
| **물질 부재 (삭제 테스트)** | 단어·구두점을 다 지워도 슬롭이면 슬롭. “Punctuation is a keystroke. Substance is a thought.” | SlopDetector #12 |

Wikipedia는 2025 연구 두 개를 들어, 일반 사람의 AI 판별이 거의 동전 던지기이고, **헤비 유저만 약 90%**라고 적는다. 탐지기 점수 단독은 G15 삭제 근거가 아니다. [WP:AIDETECTION](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing#AI_detection_tools). MakeUseOf(2026-05-25)는 이 페이지를 “15,000단어 필드 가이드”로 소개했다. [기사](https://www.makeuseof.com/wikipedia-best-ai-writing-detection-guide/).

---

## 3. 엔지니어 밖 독자에게 읽힌 기술글이 한 일

### 장면으로 추상 스케일을  sensate하게 — Tim Urban, Wait But Why
**한 일.** 2015-01 「The AI Revolution」은 ANI/AGI/ASI 정의로 시작하지 않는다. 1750년 사람을 2015로 데려오는 장면, 그다음 “Die Progress Unit”이라는 자작 단위, 「Back to the Future」 1955 vs 1985로 가속 감각을 만든 뒤에야 용어를 푼다. 신경망은 “infant brain”으로 한 단락. 이해관계는 제목과 본문에 그대로 있다. “immortality”와 “extinction”, 마지막 문장 “Will it be a nice God?”
**규모.** 사이트 소개 수치(20VC 인터뷰 설명): 구독 60만+, 월 방문 약 50만. Urban TED 본공연 6,600만 회. [Wait But Why](https://waitbutwhy.com/2015/01/artificial-intelligence-revolution-1.html). [Future of Life Institute가 비전공 입문으로 추천](https://futureoflife.org/ai/wait-but-why-the-ai-revolution/).

### 블랙박스를 열고, 한 문장으로 개념을 고정 — Jay Alammar, The Illustrated Transformer
**한 일.** 첫 그림은 번역 입출력 상자. 그다음 인코더/디코더를 한 겹씩. 수식 전에 영어 문장 하나: “The animal didn't cross the street because it was too tired” — “it”이 animal인지 street인지. Query/Key/Value는 “추상”이라고 먼저 말하고 계산을 보여 준다. 저자 문장: “we will attempt to oversimplify things a bit and introduce the concepts one by one.”
**규모.** 저자 나레이션(영상)에서 약 100만 페이지뷰. Google Scholar 인용 618. MIT·Stanford·Harvard·Princeton·CMU 강의 자료, 11개 이상 번역. [원문](https://jalammar.github.io/illustrated-transformer/).

### 이미 쓰는 사람의 지식 구멍만 메운다 — Julia Evans
**한 일.** 「Teaching by filling in knowledge gaps」(2021-09-20): 처음부터 HTTP를 가르치지 않는다. Apache로 사이트를 띄운 지 3년 뒤에야 HTTP를 배운 자기 순서를 그대로 교수법으로 쓴다. 규칙 세 개. (1) 독자가 이미 아는 것을 가정한다. (2) 한 개념만. (3) 버그로 추상화를 벗긴다. Bite Size Bash는 bash가 무엇인지 설명하지 않는다. 이미 스크립트를 짜는 사람이 빠지는 `[`, `${}`, 인용만 설명한다. 블로그 운영 노트(2016): 거의 모든 글에 “I don’t know $thing”을 넣고, 기준은 “would this have helped me a year ago?”
**규모.** jvns.ca는 수년째 엔지니어 교육의 기본 링크로 쓰인다. 조회수는 이 세션에서 확인하지 않았다. 기법은 본문에 명시되어 있다. [지식 구멍](https://jvns.ca/blog/2021/09/20/teaching-by-filling-in-knowledge-gaps/). [블로그 조언](https://jvns.ca/blog/2016/05/22/how-do-you-write-blog-posts/).

### 실패 장면 → 역사 → 한 문장 정의 — Joel Spolsky, Unicode
**한 일.** 불가리아 메일 제목 “????”, FogBUGZ 일본어 베타, PHP의 8비트 문자. 이해관계: “if I catch you… peel onions for 6 months in a submarine.” 그다음 ASCII→OEM→DBCS→code point→encoding 연대기. 용어는 정의로 시작하지 않고, 깨진 이력서가 이스라엘에서 Gimel이 되는 장면 뒤에 나온다. 남기는 한 줄: “There Ain’t No Such Thing As Plain Text.”
**규모.** Joel on Software Top 10·신입 개발자 필독 목록에 남아 있는 2003-10-08 글. 페이지뷰는 미확인. [원문](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/).

네 글이 공통으로 하는 일: 비유는 **한 개념당 하나**, 이해관계는 **누가 무엇을 잃는지**로, 장면은 **용어 앞**, 용어는 **실패한 직관 다음**. Ruben 파일의 비유 허가 테스트(생소·더 짧음·오해 없음·소리 내어 읽힘)와 맞는다.

---

## 4. 집필 프롬프트에 넣을 지시문 초안

```
유용한 답부터 쓰고, 이 글이 무엇을 할지 예고하지 마라.
내 샘플 글의 리듬·어휘·한 문장 길이를 맞춰라. 샘플이 없으면 짧게, 길게, 조각문을 섞되 문장 길이 평균 대비 표준편차가 사람 글처럼 벌어지게 하라.
각 단락이 끝나면 독자가 이름·숫자·날짜·원인·트레이드오프 중 하나를 다시 말할 수 있어야 한다. 없으면 그 단락을 구체 사실로 다시 써라.
용어는 정의로 열지 마라. 먼저 깨지는 장면이나 누가 무엇을 잃는지 한 줄을 쓰고, 그다음에 이름을 붙여라.
비유는 글 전체에 최대 하나. 생소하고, 직설보다 짧고, 오해되지 않을 때만.
is/has를 써라. serves as, stands as, boasts, features, highlighting/underscoring/reflecting로 끝내지 마라. 같은 대상을 매 문장 개명하지 마라.
It’s not X, it’s Y / Not just / No X, just Y / Here’s the… / The result? / Despite its X, faces challenges 로 전환하거나 끝내지 마라. 대조는 날짜·숫자·범위가 틀렸을 때만.
헤더는 문장 대소문자. 세 항목 병렬을 기본 리듬으로 쓰지 마라. 필요한 개수만큼만.
쓰지 말 것을 나열하는 대신, 위 규칙을 지킨 산문으로 써라. 초안 뒤에 같은 규칙으로 한 번 더 감사하고 고쳐라.
확인하지 않은 권위(“studies show”, “experts agree”)와 의의 부풀리기(pivotal, broader implications, lasting legacy)는 빼라. 근거가 없으면 문장을 삭제하라.
```

확인하지 않은 것: Barron’s 원문의 50→200 숫자, aigleeson 스레드 이미지 속 프롬프트 전문, Wikipedia·Wait But Why·Spolsky의 정확한 페이지뷰, Comfort 파일의 1,168줄이 위키 페이지와 글자 단위로 일치하는지.
