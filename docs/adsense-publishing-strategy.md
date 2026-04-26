# AdSense, Publishing, and Visual Quality Strategy

Last updated: 2026-04-26

## 1. 현재 판단

이 사이트의 AdSense 실패 가능성은 단순히 "AI 글이 많다"보다 기술적 품질 신호의 혼선이 더 컸다. 특히 RSS와 sitemap이 draft/noindex 성격의 URL을 노출하면, 검색엔진과 AdSense 심사 입장에서는 실제 공개 콘텐츠보다 많은 유령 URL을 보게 된다. 또한 AdSense 스크립트가 404, 법적 고지, 연락처 같은 비콘텐츠 페이지까지 전부 삽입되면 페이지 목적과 광고 목적이 섞인다.

이번 적용의 기준은 다음이다.

- 광고 스크립트는 콘텐츠 소비 페이지에만 로드한다.
- 404는 명시적으로 noindex 처리하고 광고를 싣지 않는다.
- RSS/sitemap은 draft, noindex, 미래 발행 글을 내보내지 않는다.
- daily automation은 매일 한 편의 공개 글을 목표로 하되, 샌드박스 실험 또는 공식 자료 기반 검토처럼 근거가 남는 방식으로 운용한다.
- 이미지는 단일 히어로 이미지에서 벗어나, 글의 핵심 증거와 이해 포인트를 보여주는 supporting image를 추가한다.

## 2. 코드 레벨 원칙

### AdSense 노출 범위

`BaseHead.astro`는 `enableAds`를 받은 페이지에서만 AdSense 스크립트를 로드한다. Google 계정 메타 태그는 검증 신호로 남기되, 광고 실행 스크립트는 홈, 블로그 목록, 블로그 글처럼 실제 콘텐츠 소비가 일어나는 페이지에만 켠다.

권장 상태:

- 광고 허용: `/`, `/{lang}/`, `/{lang}/blog`, `/{lang}/blog/{lang}/{slug}`
- 광고 비허용: `404`, `privacy`, `terms`, `contact`, `social`, `about`, 운영/히스토리성 페이지
- noindex 글: 접근은 가능해도 광고와 RSS/sitemap 노출은 막는다.

### RSS/sitemap

RSS와 언어별 sitemap은 `filterIndexablePosts()`를 통해서만 URL을 만든다.

필터 조건:

- `draft !== true`
- `pubDate <= today` in JST
- `noindex !== true`

빌드 전에 `npm run validate:publishing`을 실행해 이 조건이 깨졌는지 확인한다.

## 3. daily launchd 발행 전략

현재처럼 launchd가 매일 실행되는 구조는 유지한다. 목표는 매일 한 편의 공개 글을 만드는 것이다. 다만 글의 근거를 "무조건 뉴스 요약"이 아니라 "샌드박스 실험 또는 자료 기반 검토"로 바꾼다.

기존 해석에서 버릴 부분:

- 매일 아무 주제나 새 글 1개를 기계적으로 발행한다.
- 실제 확인 없이 실행 결과나 사용 경험을 만들어낸다.

권장 해석:

- 매일 현재 유효성이 높은 실험, 자동화 도구, 개발 도구, 소프트웨어 제작 기법을 찾는다.
- repo 밖 임시 샌드박스에서 설치, 실행, 최소 재현을 시도한다.
- 재현 가능한 주제는 Lab Publish 글로 발행한다.
- 유료 계정, API 키, 대기열, 비공개 베타 등으로 직접 사용이 불가능하면 Source Review 글로 발행한다.
- Source Review 글은 공식 문서, 릴리스 노트, GitHub 예제, 이슈, 공개 데모를 모아 1인칭 분석으로 쓴다. 다만 실행하지 않은 기능을 실행했다고 쓰지는 않는다.

### 발행 레인

1. Lab Publish lane
   - 기본 레인이다.
   - 샌드박스에서 실제 설치, 실행, 최소 재현을 수행한다.
   - 실행 로그, 화면, 파일 구조, 코드 조각, 실패 원인 중 최소 하나를 글의 근거로 남긴다.

2. Source Review lane
   - 실제 서비스 사용이 불가능한 경우 사용한다.
   - 공식 자료와 공개 예제를 기준으로 도입 가능성, 비용, 제약, 대체안을 분석한다.
   - "내가 재현 가능한 범위"와 "문서 기준 판단"을 구분한다.

3. Improve/Refresh fallback
   - 새 글 발행이 빌드/리서치/네트워크 문제로 불가능할 때만 기존 글을 보강한다.
   - 가능하면 updatedDate를 추가해 그날의 공개 산출물로 만든다.

### ready 조건

launchd가 생성한 글은 아래 조건을 만족해야 한다.

- 4개 언어 파일이 같은 slug로 존재한다.
- `npm run validate:publishing`이 통과한다.
- `npm run astro check`와 `npm run build`가 통과한다.
- 히어로 이미지가 존재한다.
- 본문에 최소 1개 이상의 supporting image, 실행 화면, 로그 캡처, 구조 이미지, 또는 재현 코드가 있다.
- Lab Publish 글은 실제 로그, 실행 화면, 코드 조각, 또는 재현 절차 중 하나를 포함한다.
- Source Review 글은 공식 문서/원 출처/공개 예제와 실행 가능성 판단을 포함한다.
- 최신 정보 글은 공식 문서나 원 출처를 우선 확인한다.
- `relatedPosts`가 모든 언어에 들어 있다.

### launchd 운영 메모

`scripts/jangwook-scheduler.sh`는 task name에 `daily`, `publish`, `post`, `blog`, `write`가 들어가면 Claude 실행 후 `npm run validate:publishing`을 자동 실행한다. 빌드까지 launchd에서 강제하고 싶으면 launchd 환경에 다음 값을 넣는다.

```bash
PUBLISHING_BUILD_GATE=1
```

검증 실패 시 작업 exit code를 1로 바꾸고 Telegram 알림을 보낸다.

현재 jangwook.net 관련 LaunchAgent는 다음 세 개로 운영한다.

- `net.jangwook.daily-post`: 매일 하나의 글을 목표로 하는 daily lab article pipeline이다. 먼저 Lab Publish를 시도하고, 직접 사용이 불가능하면 Source Review로 발행한다.
- `net.jangwook.daily-closing`: 내부 링크, 메타데이터, 다음 주제 후보를 정리한다.
- `net.jangwook.sunday-strategy`: 주간 콘텐츠 믹스와 스타일 피로도를 점검한다.

세 작업 모두 `PUBLISHING_BUILD_GATE=1`을 설정해 `validate:publishing`, `astro check`, `build`까지 통과해야 한다. 작업 트리가 깨끗하지 않아도 launchd 실행 자체는 허용하지만, 원격 동기화 실패 시 `git reset --hard` 같은 파괴적 복구는 수행하지 않고 Telegram 알림 후 중단한다.

`com.effloow.*` LaunchAgent들은 `www.effloow.com`을 대상으로 하는 별도 서비스 자동화다. jangwook.net 개인 블로그 운영 정책과 혼동하지 않는다.

## 4. 이미지 전략

### 기본 방향

기존의 "글당 히어로 이미지 하나"는 AdSense와 독자 경험 모두에서 약하다. 앞으로는 Codex 이미지 생성을 기본으로 사용해 글마다 다음 자산을 만든다.

- `[slug]-hero.webp`: 글의 첫 인상을 만드는 사실적/상징적 히어로
- `[slug]-architecture.webp`: 구조 설명용 이미지
- `[slug]-workflow.webp`: 절차와 흐름 설명용 이미지
- `[slug]-execution-example.webp`: 실행 예시나 결과 화면
- `[slug]-ui-example.webp`: 제품/대시보드/설정 화면 예시

### Codex 생성 vs 실제 캡처

Codex 이미지 생성이 적합한 경우:

- 아키텍처 개념을 시각화할 때
- 워크플로우나 운영 상황을 사실적으로 보여줄 때
- 실제 화면이 없지만 독자가 장면을 이해해야 할 때
- 글의 핵심 메타포를 히어로 이미지로 만들 때

실제 스크린샷이 더 적합한 경우:

- CLI 출력, 로컬 대시보드, 설정 화면처럼 사실성이 중요한 경우
- 특정 제품의 UI를 설명하는 경우
- 에러 메시지나 실행 결과가 증거 역할을 하는 경우

공식 이미지를 사용할 수 있는 경우:

- 공식 문서 이미지가 설명에 꼭 필요하고, 출처 표기가 가능한 경우
- 제품 로고나 공식 아키텍처 다이어그램이 사실 검증의 일부인 경우

주의:

- 실제 제품 UI처럼 보이는 가짜 화면을 생성하지 않는다.
- 생성 이미지 안에 긴 텍스트나 코드 스니펫을 넣지 않는다.
- 텍스트 설명은 Markdown, Mermaid, 캡션으로 처리한다.

## 5. 디자인 분석 및 정돈 방향

현재 디자인은 Astro 기반이라 성능상 장점이 있고, 다국어 전환과 카드형 목록도 기본 기능은 충분하다. 다만 AdSense 심사와 장기 브랜딩 관점에서는 아래를 정리하는 편이 좋다.

### 현재 강점

- 정적 HTML 중심이라 속도와 안정성이 좋다.
- 다국어 구조가 명확하다.
- 글 상세 페이지에 author, schema, relatedPosts, progress UI 등 신뢰 신호를 붙일 수 있는 기반이 있다.
- 법적 고지와 연락처 페이지가 존재한다.

### 개선이 필요한 부분

- 루트 페이지의 강한 보라/파랑 gradient는 기술 블로그보다 마케팅 랜딩처럼 보일 수 있다.
- 카드와 둥근 컨테이너가 많아 글 자체보다 UI 장식이 먼저 보이는 구간이 있다.
- 긴 기술 글에서 실제 실행 결과 이미지가 부족해 "경험 기반 글"이라는 증거가 약해진다.
- 목록 페이지는 필터, 시리즈, 주제별 허브가 약해서 사이트가 "많은 글 묶음"처럼 보일 수 있다.

### 권장 디자인 방향

목표 톤은 "technical editorial workspace"가 적합하다. 즉, 과한 랜딩 페이지보다 잘 정리된 기술 매거진과 운영 노트의 중간이 좋다.

우선순위:

1. 홈 첫 화면
   - 최신 글 나열만이 아니라 "AI automation", "local agents", "developer tooling" 같은 주제 허브를 노출한다.
   - hero는 큰 마케팅 문구보다 최근 검증/실험/운영 사례를 보여준다.

2. 글 상세
   - 히어로 아래에 "What changed", "Tested environment", "Key takeaway" 같은 짧은 정보 박스를 넣는다.
   - 본문 중간에는 실행 화면, 구조 이미지, 결과 비교 이미지를 배치한다.

3. 블로그 목록
   - 태그와 시리즈를 더 명확하게 만든다.
   - 카드 설명은 2〜3줄로 제한하고, 날짜/업데이트 여부/읽는 시간을 더 안정적으로 배치한다.

4. 색과 장식
   - 보라/파랑 gradient 의존도를 낮춘다.
   - 흰 배경, 먹색 텍스트, 절제된 accent color, 실제 이미지 중심으로 간다.
   - decorative orb나 의미 없는 배경 장식보다 실제 콘텐츠 이미지와 표/다이어그램을 우선한다.

## 6. 현재 콘텐츠 부채 기준선

`npm run validate:publishing` 기준 현재 확인된 보강 대상:

- 공개 가능 글 수: 언어별 116개
- 과거 draft/noindex라 RSS/sitemap에서 제외되어야 하는 글: 464개
- 히어로 이미지가 없는 공개 글: 12개
- supporting image가 없는 공개 글: 441개
- `relatedPosts`가 없는 공개 글: 8개

AdSense 재심사 전에는 새 글 생산보다 다음 순서가 더 효율적이다.

1. 히어로 이미지 없는 글 12개 보강
2. `relatedPosts` 없는 글 8개 보강
3. GA 상위 20개 글에 supporting image와 실제 실행 예시 추가
4. AdSense/SEO 관련 글에 구조 이미지와 전후 비교 이미지 추가
5. 이후 daily automation에서 새 글과 보강 작업을 1:1 또는 1:2 비율로 섞기

## 7. 운영 체크리스트

발행 전:

```bash
npm run validate:publishing
npm run astro check
npm run build
```

발행 후:

- `/rss.xml`과 언어별 RSS에 새 공개 글만 들어갔는지 확인한다.
- `/sitemap.xml`이 언어별 sitemap을 정상 연결하는지 확인한다.
- 새 글 URL이 200인지 확인한다.
- draft/noindex URL이 RSS/sitemap에 없는지 확인한다.
- 이미지가 `src/assets/blog/`에서 Astro 최적화 대상인지 확인한다.

AdSense 재심사 전:

- 404에 광고가 없는지 확인한다.
- noindex 글에 광고가 없는지 확인한다.
- privacy/terms/contact가 접근 가능하고 광고 스크립트가 없는지 확인한다.
- ads.txt가 Google publisher ID를 유지하는지 확인한다.
