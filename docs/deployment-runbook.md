# 배포와 운영 절차

사용자 승인에 따라 사이트 배포를 진행합니다. 초안 본문과 전체 자료는 별도 발행 승인 전까지 비공개이며, 준비 페이지는 공개합니다.

## 콘텐츠 검토

posts·prompts의 Markdown을 수정하고 `npm run content:bundle`로 검토 모음집을 갱신합니다. 최초 생성 스크립트는 기존 초안을 보호하며 빌드에서 실행하지 않습니다.

사용자가 글과 프롬프트를 검토한 뒤 manifest.json에 status=published, reviewedAt, publishedAt, 정확한 approvalHash를 기록합니다. hash는 `npm run check`로 만든 catalog.json의 sourceHash에서 가져옵니다. 날짜는 ISO 형식, 검토일 ≤ 공개일입니다. 미래 공개일은 해당 시각 이후 노출됩니다. 본문·프롬프트·주요 metadata 변경 시 재승인합니다.

개별 승인 글은 먼저 공개할 수 있지만 **전체 자료 신청은 88개 모두 승인된 이후 활성화**합니다. 수정에 맞춰 시리즈 버전을 올리고 manifest에서 일관되게 관리합니다. 오래된 자료 링크는 새 버전 신청을 안내합니다. /updates에도 변경 이유·검증 상태를 기록합니다.

## Cloudflare 연결

Workers Paid와 D1을 사용합니다. wrangler.jsonc의 production D1은 jangwook-leads에 연결합니다. 실제 계정 DB를 생성하고 0001~0003 migration을 적용했습니다. MAIL_MODE는 disabled이고 EMAIL binding은 아직 연결하지 않습니다. 검증된 발신 도메인과 Email Service 권한 및 실제 전달 테스트 이후에만 cloudflare로 전환합니다. 공식 문서는 Email Sending을 Beta로 표시하므로 계정의 사용 가능 여부를 확인합니다. [Workers Email API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)

로컬과 production 설정을 구분하고 LEADS_DB·EMAIL·ASSETS·SITE_URL·FROM_EMAIL을 확인합니다. SPF/DKIM과 수신함 검증도 공개 작업 단계입니다. 운영 DB에 migrations를 순서대로 적용하고 이미 적용한 migration은 수정하지 않습니다. 2026-10-01 사용자 배포 승인에 따라 원격 DB를 생성하고 migration 3개를 적용했습니다.

## 릴리스

```sh
npm ci
npm run db:migrate
npm run check
npm test
npm run build
npm run worker:check
```

개발 서버에서 test:browser도 실행합니다. worker:dev를 켠 뒤 test:worker로 운영 진입점과 실제 정리 작업도 검사합니다. 배포용 preview/worker:dev에서 초안과 /dev/inbox가 숨겨져야 합니다. 미승인 글의 RSS·sitemap 제외, test:archive로 기존 글 URL 전체의 200·canonical·SSR 본문을 확인합니다.

리뷰한 작업을 깨끗한 커밋으로 정리하고 사용자 배포 승인을 받은 후에만 JANGWOOK_APPROVED_RELEASE_SHA를 HEAD로 지정해 npm run deploy를 사용합니다. Actions는 수동 실행과 일치하는 승인 SHA를 요구합니다. GitHub production environment의 reviewer 설정은 계정에서 별도 확인합니다.

기존 Worker 이름·도메인과 새 연결을 확인하고 이전 배포 버전 ID를 기록한 뒤 적용합니다. 기존 Worker를 로컬에서 바꾸지 않았으므로 자동 전환을 가정하지 않습니다. 문제 발생 시 이전 배포 버전으로 롤백하고 DB migration의 호환성도 확인합니다.

## 메일과 리드 운영

업데이트 수신 대상은 lead_consents.granted=1 AND confirmed_at IS NOT NULL만 사용합니다. verified_at만으로 동의를 추정하지 않습니다. 캠페인 발송 기능은 후속 제품 범위입니다.

accepted는 provider 접수이며 수신함 배달 완료가 아닙니다. provider_id와 실제 로그로 배달·반송을 확인합니다. sending이 오래 남으면 receipt와 DB 오류를 확인합니다. 실패를 무조건 pending으로 바꾸면 중복 발송할 수 있습니다.

deliver 함수는 재처리 진입점을 제공하지만 관리자 재발송 API/CLI는 노출하지 않았습니다. 초기 운영은 provider 로그 확인 후 범위를 제한한 작업으로 재처리하고 필요하면 감사 기록을 갖춘 관리자 도구를 추가합니다. 자동 재발송·캠페인을 구현 완료로 광고하지 않습니다.

로컬 /dev/inbox에는 주소·링크가 있으므로 개발 서버를 loopback으로 유지합니다. 수신 거부는 GET 확인 화면·POST 변경입니다. 삭제 요청은 운영자가 본인 확인 후 lead를 삭제하며 관계 데이터는 cascade됩니다.

scheduled handler는 매일 18:17 UTC에 12개월 지난 리드와 만료 제한 버킷을 정리하도록 구성했습니다. 실제 cron 실행은 공개 이후 확인합니다. 비용과 이메일·DB 실패율을 함께 관찰합니다.

## 현재 릴리스 방식

원래 checkout의 미커밋 변경과 다른 작업의 submodule을 보존하기 위해 검토한 사이트 파일을 독립 로컬 Git 릴리스 디렉터리에 복사합니다. 그 디렉터리에서 빌드·테스트 후 깨끗한 snapshot commit을 만들고 승인 SHA를 지정해 기존 deploy guard를 통과합니다. 원본 checkout은 자동 reset/commit/push하지 않습니다. 이전 운영 버전·설정·도메인을 reports/predeploy-worker-*.json에 보존하고, 실제 배포 영수증과 운영 URL 검증을 별도로 기록합니다.

## 2026-10-02 운영 배포 결과

접근성 이름을 실제 Chromium 접근성 트리로 확인한 후 사용자가 승인한 사이트 상태를 운영에 배포했습니다. Worker 버전은 `3d5be1be-304e-4443-a1fb-0d41b1691515`, 릴리스 snapshot SHA는 `1ed2c210a7b5fbe8d161076e20e2f8ae6d2faeb0`입니다. 이전 롤백 버전은 `6698daa8-8c41-4db9-b395-3ab17fc7dfc7`입니다. jangwook.net 및 www.jangwook.net에 연결했습니다.

새 시리즈 352개 준비 경로와 네 언어의 UI 이름, 기존 글 1,424개 원래 URL·canonical·SSR 본문을 운영 응답에서 확인했습니다. 새 개요 본문·프롬프트는 여전히 미발행 초안이며 준비 페이지로 제공됩니다. 전체 자료 신청 및 메일 발송은 비활성입니다. 운영 D1은 생성·migration 3개 적용을 완료했고 cron은 17 18 * * *입니다.

상세 영수증은 reports/production-deployment-receipt.json, URL 확인은 reports/production-series-validation.json 및 reports/archive-seo-validation.json, 실제 접근성 이름은 reports/accessible-names-validation.json입니다. 후속 변경은 이 배포 승인을 재사용하여 자동 발행하지 않습니다.

기존 원격 GitHub 배포 workflow `195145307`은 disabled_manually 상태로 전환했습니다. 예전 Astro snapshot의 예약/푸시 배포가 새 운영 사이트를 덮어쓰는 것을 막기 위한 조치입니다. 필요 시 `gh workflow enable 195145307 --repo kimjangwook/www.jangwook.net`으로 복구할 수 있지만, 새 소스를 반영하기 전에는 기존 사이트를 재배포하므로 주의합니다. 본 배포에서 원래 Git checkout의 변경을 일괄 commit/push하지 않았습니다.
