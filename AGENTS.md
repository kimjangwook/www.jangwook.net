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
