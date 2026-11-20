# jangwook.net — Web for AI / Business / Everyone

Read docs/design-guide.md, docs/system-design.md, docs/editorial-guide.md before edits. The user authorized a zero-base rebuild on 2026-10-01, superseding legacy route/content preservation instructions. Legacy sources live in archive/legacy-site-20261001 and remain untouched. The user authorized restoring previously published articles on 2026-10-01: keep their original URLs and serve sanitized archived content, reachable internally through /archive only. Unpublished legacy drafts remain excluded. Preserve the archived dirty files and unrelated submodules.

Use SvelteKit and Cloudflare Workers. Content is manually selected and series-based, with a Korean canonical source and mandatory Korean, English, Japanese and Simplified Chinese editions. Professional teacher/consultant persona. Every active WCAG 2.2 success criterion has one post and one multimodal evaluation prompt. Drafts may be reviewed locally, never published or emailed as approved materials. Review approvals are bound to exact content hashes. No fabricated experiments, outcomes, customers, certifications or tool readiness.

Do not deploy, push, send external mail, modify accounts or provision paid infrastructure as part of local development. Verify type checks, content coverage, D1 lead/delivery behavior, responsive UI, keyboard and no-JS behavior. Keep deployment workflow manual and review-gated.

All 88 accessibility chapter URLs exist in all four languages. Unwritten or unapproved chapters serve localized preparation pages with curriculum, previous/next and locale links, HTTP 200 and noindex,follow. Never expose draft body/prompt data through public page payloads. Do not treat a preparation page as a published article or include it in RSS/sitemap/BlogPosting. Mark reviewReady only when a full draft is ready for local review; translated hasContent requires a real translated body and prompt.

User update 2026-10-02: publish the four-language accessibility overview; deploy authorized site changes. Localized homes and language preference redirect are required. Homepage contains only up to five actually published recent articles plus series/menu links. Personal names are shown only on /about. Remove tool menu, resource CTAs and standalone material form; future forms belong only inside final series chapters. All documents show immutable firstPublishedAt (pending for unpublished chapters) and updatedAt; never invent publication dates.


## 시리즈 상세 페이지 원칙 — 2026-10-02

사용자가 전체 학습 목록 토글, 학습 성과를 설명하는 제목 아래 요약, 글과 시리즈의 JSON-LD 연결을 승인하고 향후 작성 원칙으로 저장하도록 요청했습니다. 상세 페이지 작업 전에 [article-detail-guidelines.md](docs/article-detail-guidelines.md)를 읽고 적용합니다. 기본 접힘, 현재 글 순서와 강조, 공개/준비 상태, 네 언어 SSR 링크, PC 사이드바/모바일 요약 아래 배치, 키보드·no-JS 동작을 유지합니다. 준비 중 글에는 BlogPosting이나 발행 날짜를 만들어 넣지 않습니다.

## 발행 후 X 발표 — 2026-10-03

사용자가 승인한 블로그 갱신의 운영 배포를 확인한 뒤 @effloow에 영어 스레드로 발표한다. 영어 기사 링크는 마지막 게시물에 대한 별도 자기 답글에만 붙인다. 기존 일본어 Telegram 초안 절차 대신 [발행 후 발표 지침](docs/post-deploy-announcement.md)을 적용한다. 동일 원고의 중복 발표를 막고 실제 공개 URL·계정·본문·링크 답글을 확인해 영수증을 남긴다.

2026-10-04 reliability goal: continuously validate the overview and every criterion prompt using real evidence, frozen reference answers, normal/failure/exception/missing-input cases and isolated repetitions. Preserve hashes, actual models/tools, raw outputs and limits. See docs/editorial-guide.md. Never claim universal perfection or native media processing from derived text/images.

## 접근성 시리즈 제작 모델과 절차 — 과거 2026-10-11·10-16 배정

사용자 지정 [제작 원칙](docs/accessibility-production-workflow.md)을 새 글과 내용 갱신에 적용한다. 기초 조사: Ollama Cloud DeepSeek v4.1. 보강 조사: GPT-6.1 Sol High. 집필: 브라우저의 Gemini 4 Argon. 테스트: Claude Opus Medium. 독립 리뷰: GPT-6.1 Sol High + Fable Low. 이후 사용자 승인 범위의 네 언어 완성·커밋·푸시·배포·운영 확인·@effloow 영어 발표를 진행한다. 이전 Sol·Opus High 필수 비교 지침을 대체하며 과거 실제 실행 기록은 보존한다. 지정 모델과 effort를 실제로 확인하고 조용한 대체를 하지 않는다. 전역 Life Manager 역할과 자동 스케줄은 이 시리즈 지시로 변경하지 않는다.


## 접근성 일일 제작 재개 — 2026-11-20

사용자 승인으로 매일 09:00(Asia/Tokyo)에 이 대화의 자동화가 SC 1.2.5부터 학습 순서대로 제작을 이어간다. 집필 모델은 브라우저 Gemini 4 Neon으로 변경한다. 한국어 정본과 영어·일본어·중국어 간체의 본문·평가 프롬프트·도식·캡션을 완성하고 원문 대조·실제 테스트·독립 리뷰를 거친다. 위 2026-10-16 Argon 집필 배정보다 이 지시를 우선한다. 다른 단계의 최신 배정은 아래 GPT·Gemini 통일 지시를 따른다. 네 언어 제작은 승인되었으며 공개 승인과 구분한다. 정확한 콘텐츠에 대한 공개 승인 확인 후에만 기존 배포 절차를 진행한다. 상세 운영·진행 기록은 docs/accessibility-production-workflow.md를 따른다.


2026-11-20 Telegram 전달 추가 승인: 원고 완성 시 기존 LifeManager Telegram 수신 채팅으로 한국어 검토 PDF와 네 언어 원고 묶음을 전송한다. 테스트·독립 리뷰가 미완료인 초안을 전달할 때는 해당 범위를 명시한다. 공개 승인 후 운영 공개가 확인되면 네 언어 공개 URL을 포함한 완료 알림을 별도로 전송한다. 전송 내용 해시·구분·sent/message_id를 영수증에 기록하고 중복 발송을 막는다. sending/uncertain은 확인 없이 재시도하지 않는다. 이 전달은 승인 전 외부 전송 금지의 예외이며, 공개 승인을 대신하지 않는다.


## GPT·Gemini 통일 및 품질 유지 — 2026-11-20 최신 지시

접근성 제작은 GPT와 Gemini만 사용한다. GPT-6.1 Sol High가 조사·실습 설계와 검수를, GPT가 설명용 이미지·SVG 도식 제작을, GPT-6.1 Sol Medium과 필요 시 Gemini Neon이 실제 자료 테스트를 맡는다. 네 언어 집필은 브라우저 Gemini 4 Neon을 유지한다. GPT High와 Neon은 집필과 분리된 새 세션에서 교차 검수한다. 이전 Ollama·Opus·Fable 필수 배정을 대체하며, 과거 실행 기록은 그대로 보존한다. 이번 지시는 전역 Life Manager 모델 설정을 변경하지 않는다.

기존 GPT 상세본의 장면별 설명·정보 비교 도식·재현 가능한 실습·검증 근거를 품질 기준으로 삼는다. 일일 주기를 위해 자료와 이미지를 일반론·단순 순서도로 축소하지 않는다. 다음 실행은 전송한 SC1.2.5 초안의 보강과 GPT·Gemini 검수를 먼저 진행한다. 상세 지침은 docs/accessibility-production-workflow.md를 따른다.


## 재작성본 공개 및 다음 일일 집필 — 2026-11-20

사용자가 “배포하고, 내일부터 자동 글작성 시작”을 지시했습니다. SC 1.2.5 r2의 검수한 네 언어 본문·전체 프롬프트·도표와 글에 필요한 공통 실습 대상의 공개를 승인한 범위로 처리합니다. 2026-11-21 09:00(Asia/Tokyo)부터 기존 jangwook-net-a11y 자동화가 SC 1.2.6부터 다음 미완성 항목을 하루 한 편 작성하고 검수·Telegram 전달을 진행합니다. 완료된 SC1.2.5 보강 지시는 충족되었으며 재작성하지 않습니다. 오늘 원고의 배포 승인과 미래 일일 원고의 공개 승인은 구분합니다. 새 일일 원고는 작성·검수·전달 후 정확한 콘텐츠에 대한 공개 승인을 받습니다.
