# jangwook.net · Web for AI / Business / Everyone

주제를 직접 선정하고 기준을 가르치며 실무 적용을 컨설팅하는 시리즈 중심 웹사이트입니다. SvelteKit과 Cloudflare Workers·D1으로 재구성했습니다. 사이트는 **운영 배포 완료** 상태입니다. 새 시리즈 본문은 편집 초안이며, 공개 사이트에서는 352개 준비 페이지와 기존 글 아카이브를 제공합니다.

## 로컬 실행

Node.js 24 이상을 사용합니다.

```sh
npm ci
npm run db:migrate
npm run dev
```

http://127.0.0.1:5173 에서 확인합니다. `/resources/accessibility`에서 테스트 신청 후 `/dev/inbox`의 메일 링크로 전체 자료를 받습니다. 로컬에서는 외부 메일을 보내지 않습니다.

배포용 `npm run build`와 preview/Worker는 미승인 초안을 숨깁니다. 개발 서버의 loopback에서 reviewReady=true인 초안을 검토할 수 있습니다. 미완성·미승인 글의 주소는 준비 중 안내로 유지하며 검색 색인에서 제외합니다.

## 정본과 문서

- [전체 시스템 설계](docs/system-design.md)
- [편집·교육·컨설팅 기준](docs/editorial-guide.md)
- [디자인 가이드](docs/design-guide.md)
- [로컬 검토와 검증 결과](docs/local-review.md)
- [배포와 운영 절차](docs/deployment-runbook.md)
- [접근성 시리즈 순서: 88편](content/series/accessibility/outline.md)
- [글 정본](content/series/accessibility/posts/) · [프롬프트 정본](content/series/accessibility/prompts/)
- [전체 프롬프트 검토용 모음집](content/series/accessibility/prompt-collection.draft.md)

개요 + WCAG 2.2 활성 성공 기준 86개 + 에이전트 통합 마무리로 88편과 88개 프롬프트입니다. A 31개·AA 24개·AAA 31개이며 제거된 4.1.1은 제외합니다. 모든 글은 현재 draft이고 실제 모델 성능 검증은 후속 편집 단계입니다.

홈, 시리즈 허브·목차, 글·프롬프트, 검색·필터, 전문가 소개, 서비스 구조, 자료 신청, 개인정보, 업데이트를 구현했습니다. JavaScript 없이 글과 신청 폼을 이용할 수 있습니다. 리드 DB·동의 이력·중복 방지·outbox·Email Service 어댑터·만료 링크·구독 확인/해지·보관 기간 정리 작업도 구현했습니다.

원격 DB·실제 메일 발송 설정은 아직 연결하지 않았습니다. 멀티모달 진단 에이전트, 결제·예약, 구독자 캠페인 발송은 후속 제품 범위입니다. 현재 서비스 페이지와 마지막 글은 그 구조를 설명합니다.

## 검증

```sh
npm run check
npm test
npm run build
npm run worker:check
```

개발 서버를 켜고 브라우저 검사도 실행합니다.

```sh
npx playwright install chromium
npm run test:browser
```

배포용 실행 검증은 `npm run worker:dev -- --test-scheduled`를 켠 뒤 `npm run test:worker`를 실행합니다.

검증은 로컬 QA 리드를 생성하고 자기 데이터만 삭제합니다. 결과는 reports/에 기록합니다.

## 이전 구성

기존 소스와 미커밋 글·이미지·설정은 `archive/legacy-site-20261001/`에 보존했습니다. 기존 공개 글 1,424개는 원래 URL을 유지하고 아카이브에서 탐색합니다. 미발행 로컬 원본 16개는 공개에서 제외합니다. 언어별 홈은 새 홈으로 이동합니다. 루트 ssr=true, prerender=false이며 보관 글 본문은 Static Assets에서 읽어 서버 렌더링합니다. **현재 공개 jangwook.net은 변경하지 않았습니다.**

기존 자동 발행 진입점은 로컬에서 종료하도록 바꿨고 배포 workflow는 수동 실행만 허용합니다. Life Manager 관련 daemon은 확인 시 이미 비활성화되어 있었으며 수정하지 않았습니다. 다른 하위 프로젝트와 기존 데이터 변경도 보존했습니다. 커밋·push·배포·원격 계정 변경은 수행하지 않았습니다.

아카이브 빌드는 `content/archive-source-policy.json`의 공개 원본 목록을 사용합니다. Git shallow checkout에서도 동작합니다. `npm run test:archive`로 기존 URL 전수·SSR·canonical·sitemap·no-JS 검색을 검증합니다.

## 네 언어와 전체 시리즈 경로

새 시리즈는 한국어·영어·일본어·중국어 간체를 제공합니다. 한국어 URL은 유지하며 나머지는 /en, /ja, /zh 접두어를 사용합니다. 첫 개요는 네 언어 본문·프롬프트·도식을 작성했습니다. 88편의 제목·요약과 352개 문서 경로를 준비했으며, 후속 87편은 준비 중 안내와 상호 링크를 제공합니다.

- `npm run content:prepare`: 누락된 번역 준비 문서와 프롬프트 파일을 생성합니다. 기존 파일은 덮어쓰지 않습니다.
- `npm run test:locales`: 네 언어의 SSR·모바일·no-JS·키보드·메타데이터 및 전체 문서 연결을 점검합니다.
- 실제 번역을 작성한 뒤 `hasContent=true`, 로컬 검토할 완성 초안은 `reviewReady=true`를 지정합니다. 번역의 `translationSourceHash`를 정본의 현재 해시에 맞추고 검토합니다.
- 원문과 별도로 언어별 정확한 해시·검토/발행 날짜 승인 후 공개합니다. 준비 안내는 승인된 본문이나 프롬프트로 간주하지 않습니다.
