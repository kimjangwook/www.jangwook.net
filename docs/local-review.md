# 로컬 검토와 완료 범위

2026-10-01. 사이트 개발과 접근성 시리즈의 내부 1차 초안을 보존했습니다. 현재 실제 집필·검토 범위는 첫 개요이며, 나머지 항목별 글과 마무리는 준비 중으로 제공합니다. 외부 배포·실제 메일 발송·모델 평가 실험은 수행하지 않았습니다.

## 볼 순서

1. `/`에서 브랜드와 디자인을 확인합니다.
2. `/series/accessibility`에서 개요 → 기준별 86편 → 마무리 흐름을 봅니다.
3. `/series/accessibility/overview`에서 본문·도식·전체 프롬프트를 검토합니다. `/series/accessibility/non-text-content`에서 준비 중 안내와 이전/다음 연결을 봅니다.
4. `/prompts`에서 기준 번호·주제를 검색합니다.
5. `/resources/accessibility`에서 테스트 신청 후 `/dev/inbox`의 링크로 자료를 받습니다.
6. `/services`에서 향후 서비스 구조를 봅니다. 마지막 글은 아직 준비 중입니다.

## 초안

88편과 88개 프롬프트에 기준별 고유 사례·판단 조건·입력·평가 절차·구현 조언을 포함했습니다. 전체 본문 약 22만 문자, 프롬프트 약 13.6만 문자입니다. 사례는 교육용 가상 상황이며 실제 고객 성과로 표현하지 않습니다.

[시리즈 순서](../content/series/accessibility/outline.md), [전체 프롬프트](../content/series/accessibility/prompt-collection.draft.md), [편집 원칙](editorial-guide.md)이 검토 정본입니다. W3C 기준과 86개 Understanding 해설을 로컬 참고 자료로 수집했습니다. 공식 번역 정본이나 모델 성능 검증 결과를 주장하지 않습니다.

## 디자인과 검증

확정 참고 시안에 맞춰 화이트·차콜, Noto Sans KR, 읽기 중심의 단정한 레이아웃과 공통 컴포넌트를 전체 페이지에 적용했습니다. 검색과 키보드 데모는 실제로 작동합니다. 자체 호스팅 폰트의 라이선스는 static/font-licenses에 보관합니다.

- `npm run check`: Svelte/TypeScript 오류·경고 0.
- `npm test`: 실제 로컬 D1 기반 10개 테스트 통과. 중복·병렬 신청, 제한, 만료 후 재신청, 공개 승인, 모의 메일 접수·실패·receipt 저장 실패를 포함합니다.
- `npm run build`: 콘텐츠 커버리지와 프로덕션 빌드 검증.
- `npm run worker:check`: 실제 배포 없이 Worker 패키징 검증.
- `npm run test:worker`: 배포용 로컬 Worker의 운영 진입점 점검. 초안·메일함 숨김, 기존 글 200·언어 홈 308, 새 초안 RSS·sitemap 제외, 비공개 자료 링크, 신청 잠금, 실제 scheduled 리드/제한 버킷 정리 검증.
- `npm run test:browser`: 1440·390·320px 45개 화면의 axe 검사·가로 넘침·제목 구조, 키보드 skip link, 검색·필터, 텍스트 확대, no-JS 신청, 다운로드·확인·해지 흐름 검증.

reports/content-validation.json, source-snapshot.json, browser-validation.json, worker-validation.json에 결과를 기록합니다. 자동 검사 통과는 전체 WCAG 적합성 선언이 아닙니다. 보조 기술·실사용자 검토와 프롬프트 성능 실험은 별도로 진행합니다.

## 기존 사이트 복원

archive/legacy-site-20261001/migration-manifest.json에 원래 HEAD와 미커밋 상태가 있습니다. 기존 소스·public·scripts·설정·package 파일을 아카이브에서 복원할 수 있습니다. 먼저 새 작업을 다른 디렉터리에 복사하고 원래 파일들을 기존 경로에 복사한 뒤 이전 lockfile로 npm ci를 실행합니다. 로컬 secrets는 커밋하지 않습니다. 배포를 하지 않았으므로 현재 공개 사이트의 복원은 필요하지 않습니다.

기존 데이터 변경과 하위 프로젝트의 dirty 상태는 이번 작업과 구분해 보존했습니다. 대규모 삭제/추가 diff는 기존 콘텐츠를 새 빌드에서 분리한 결과입니다.

## URL 보존과 SSR 확인

현재 공개 sitemap의 원래 URL 1,424개를 로컬 Worker에서 전수 요청해 200·원래 canonical·서버 렌더링된 본문·HTML 언어를 검사합니다. 보고서는 reports/archive-seo-validation.json입니다. 초안은 별도로 비공개로 유지하고 기존 글은 새 RSS·추천 목록에 섞지 않습니다. 아카이브 내부 검색·페이지 이동·원래 URL의 본문은 JavaScript 없이 확인합니다. 기존 FAQ와 MDX 이미지도 보관합니다. Mermaid 그림은 원문 코드를 SSR로 보존하고, 독자가 원할 때 자체 호스팅 모듈을 지연 로드해 표시합니다.

## 네 언어 및 사전 문서 생성

첫 개요는 한국어·영어·일본어·중국어 간체의 본문·프롬프트·도식·대체 텍스트·캡션을 검토할 수 있습니다. /en, /ja, /zh 접두어를 사용하고 한국어 원래 경로는 유지합니다. 각 언어에 88개 본문 파일과 88개 프롬프트 파일을 갖추었습니다. 번역 후속 87편은 준비 안내 파일이며 본문 번역 완료를 뜻하지 않습니다. 한국어의 기존 내부 초안은 보존합니다.

모든 352개 문서 페이지에서 목차·이전/다음·네 언어를 연결합니다. 로컬 검토 가능한 첫 개요만 reviewReady=true이고 나머지는 준비 중입니다. 배포용 Worker에서는 미승인 개요도 준비 안내로 제공하며 모든 미승인 본문과 프롬프트를 SSR/페이지 데이터에서 제거합니다. 준비 안내의 noindex,follow와 RSS/sitemap 제외를 확인했습니다.

reports/series-language-validation.json은 네 언어 × 네 화면 × 세 너비의 48개 브라우저 점검과 352개 경로를 기록합니다. reports/series-worker-validation.json은 로컬 배포용 Worker의 전체 352개 준비 경로·네 언어 아카이브 URL·한국어 별칭 리다이렉트를 기록합니다. 자동 axe 점검, 키보드 건너뛰기, no-JS 언어 전환·검색과 200% 글자 확대를 확인했습니다. 전체 WCAG 준수 인증을 뜻하지 않습니다. 자료 신청·메일은 아직 한국어 흐름입니다.


## 2026-10-02 공개 및 UI 정책

루트 `/`는 선택 언어 쿠키(`site_language`, 180일)를 우선하고 브라우저 `Accept-Language`를 참고해 `/ko/`, `/en/`, `/ja/`, `/zh/` 홈으로 302 이동합니다. 응답은 `private, no-store`, `Vary: Accept-Language, Cookie`입니다. 홈은 실제 승인·공개된 최신 글을 발행 시각 내림차순으로 최대 5편 표시하고, 시리즈와 메뉴 링크만 제공합니다. 현재 공개 글은 접근성 개요 한 편이므로 준비 중 글을 채워 넣지 않습니다. 네 언어 홈은 SSR·고유 canonical·상호 hreflang·x-default와 언어 선택기를 제공합니다. 한국어 시리즈의 기존 무접두 경로와 아카이브 URL은 유지합니다.

개인 이름은 `/about` 소개 페이지에서만 표시합니다. 공통 작성자 표시, 푸터 이름, 홈 소개, 도구 메뉴, 자료받기 CTA와 독립 신청 폼은 제거합니다. 기존 `/resources/accessibility` 주소는 선택 언어의 마지막 글 `/series/accessibility/agentic-accessibility`로 308 이동합니다. 신청 폼은 마지막 글이 완성되고 모음집이 승인될 때 그 글 안에 추가할 예정입니다. 현재 마지막 글은 준비 중이며 폼과 메일 전송을 제공하지 않습니다. 이전 독립 폼 기반 브라우저 검증 기록은 이전 버전의 이력입니다.

접근성 개요의 네 언어 본문·평가 프롬프트·도식 4개를 사용자 지시로 공개합니다. 정확한 sourceHash 승인과 번역 원본 일치 검증을 유지하고, RSS·sitemap·BlogPosting에 공개 글만 포함합니다. 나머지 87편 × 4언어는 본문 없는 준비 중 문서이며 noindex,follow입니다.

모든 문서에 ‘초판 공개일’(`firstPublishedAt`)과 ‘최종 수정일’(`updatedAt`)을 표시합니다. 초판 공개일은 첫 실제 발행 때만 기록하며 수정 후에도 유지합니다. 준비 중 문서는 공개일을 만들지 않고 ‘공개 예정’이라고 표시합니다. 수정일은 보존된 본문·프롬프트·참조 도식 파일의 수정 기록에서 복원했습니다. compiler는 내용 해시가 변경되면 최종 수정일을 Asia/Tokyo 날짜로 갱신하며 초판 공개일은 덮어쓰지 않습니다. 내용 변경 시 기존 해시 승인은 자동으로 무효화됩니다. 최종 수정일은 공개 글의 dateModified, article:modified_time, sitemap lastmod에도 동일하게 제공합니다. 초판 공개일은 datePublished와 article:published_time에 사용합니다. 날짜 표기를 위한 메타데이터는 본문 승인 해시를 변경하지 않습니다.
