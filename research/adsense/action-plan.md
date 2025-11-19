# Google AdSense 승인을 위한 Action Plan

## 현재 블로그 상태 분석

### 기본 정보
- **도메인**: jangwook.net
- **프레임워크**: Astro 5.14.1
- **지원 언어**: 한국어(ko), 영어(en), 일본어(ja), 중국어(zh)
- **총 포스트 수**: 약 48개 (한국어 기준), 4개 언어로 총 약 190개 이상

### 현재 보유 페이지
| 페이지 | 상태 | 비고 |
|--------|------|------|
| About (소개) | ✅ 있음 | `/[lang]/about` |
| Contact (연락처) | ✅ 있음 | `/[lang]/contact` |
| Privacy Policy | ✅ 있음 | `/[lang]/privacy` (2025-11-19 구현) |
| Terms of Service | ✅ 있음 | `/[lang]/terms` (2025-11-19 구현) |

### 강점
- ✅ 자체 도메인 보유 (jangwook.net)
- ✅ 충분한 콘텐츠 양 (48개 포스트 > 30개 권장 기준)
- ✅ 전문적인 기술 블로그 (AI/LLM 분야)
- ✅ 독창적인 콘텐츠 (직접 작성)
- ✅ 다국어 지원으로 글로벌 도달 가능
- ✅ Astro 기반 고성능 정적 사이트

### 개선 필요 사항
- ✅ Privacy Policy 페이지 구현 완료
- ✅ Terms of Service 페이지 구현 완료
- ❌ robots.txt 파일 생성 필요
- ⚠️ 포스트별 단어 수 확인 필요 (최소 1000단어 권장)
- ⚠️ 트래픽 현황 확인 필요

---

## Google AdSense 승인 요건 체크리스트

### 1. 필수 요건 (Critical)

#### 1.1 콘텐츠 품질
- [ ] **독창적 콘텐츠**: 복사/스크래핑 콘텐츠 없음
- [ ] **최소 포스트 수**: 30〜40개 이상 (✅ 48개 보유)
- [ ] **포스트당 단어 수**: 최소 1000단어 권장
- [ ] **정기적 업데이트**: 활발한 콘텐츠 발행

#### 1.2 필수 페이지
- [x] **About 페이지**: 사이트/운영자 소개
- [x] **Contact 페이지**: 연락처 정보
- [x] **Privacy Policy**: 개인정보처리방침 ✅ **구현 완료**
- [x] **Terms of Service**: 이용약관 ✅ **구현 완료**

#### 1.3 기술적 요건
- [x] **자체 도메인**: jangwook.net
- [ ] **SSL 인증서**: HTTPS 적용 확인 필요
- [x] **모바일 반응형**: Astro + Tailwind
- [x] **사이트맵**: sitemap.xml 생성됨 (dist/ 폴더에 존재)
- [x] **robots.txt**: 크롤링 허용 설정 ✅ **생성 완료**

### 2. 콘텐츠 정책 준수

#### 2.1 금지 콘텐츠
- [ ] 성인/선정적 콘텐츠 없음
- [ ] 폭력/혐오 콘텐츠 없음
- [ ] 저작권 침해 콘텐츠 없음
- [ ] 불법 활동 관련 콘텐츠 없음
- [ ] 허위/기만적 콘텐츠 없음

#### 2.2 네비게이션 & UX
- [x] 명확한 메뉴 구조
- [x] 일관된 레이아웃
- [ ] 과도한 광고 없음 (첫 승인 전)
- [x] 빠른 로딩 속도

### 3. 추가 권장 사항

- [x] Google Search Console 등록 ✅ **완료**
- [x] Google Analytics 연동 (GA4 gtag 설정됨)
- [x] 소셜 미디어 프로필 링크 (Footer에 Twitter, Medium, LinkedIn, YouTube 링크 포함)
- [ ] 저자 프로필/신뢰도 표시

---

## 세부 작업 계획

### Phase 1: 필수 페이지 추가 (최우선)

#### Task 1.1: Privacy Policy 페이지 생성
**중요도**: ⭐⭐⭐⭐⭐ (필수)

```
위치: src/pages/[lang]/privacy.astro
```

포함 내용:
- 수집하는 개인정보 종류
- 정보 수집 목적
- 정보 보관 기간
- 제3자 공유 여부
- 쿠키 사용 정책
- Google AdSense 광고 관련 고지
- 사용자 권리 안내
- 연락처 정보

각 언어별 버전 필요:
- 한국어: 개인정보처리방침
- 영어: Privacy Policy
- 일본어: プライバシーポリシー
- 중국어: 隐私政策

#### Task 1.2: Terms of Service 페이지 생성
**중요도**: ⭐⭐⭐⭐ (강력 권장)

```
위치: src/pages/[lang]/terms.astro
```

포함 내용:
- 서비스 이용 조건
- 지적재산권 안내
- 면책 조항
- 콘텐츠 사용 제한

### Phase 2: 기술적 설정 (중요)

#### Task 2.1: Google Search Console 등록
1. Google Search Console 접속
2. jangwook.net 도메인 등록
3. 소유권 확인 (DNS 또는 HTML 파일)
4. 사이트맵 제출

#### Task 2.2: 사이트맵 확인 및 제출
```bash
# astro.config.mjs에 sitemap 설정 확인
npm run build
# sitemap-index.xml 생성 확인
```

Search Console에서 사이트맵 URL 제출:
- https://jangwook.net/sitemap-index.xml

#### Task 2.3: robots.txt 설정 확인
```
위치: public/robots.txt
```

내용:
```
User-agent: *
Allow: /

Sitemap: https://jangwook.net/sitemap-index.xml
```

#### Task 2.4: SSL/HTTPS 확인
- [ ] 모든 페이지 HTTPS로 접근 가능
- [ ] HTTP → HTTPS 리다이렉트 설정

### Phase 3: 콘텐츠 최적화 (권장)

#### Task 3.1: 포스트 단어 수 분석
각 포스트의 단어 수 확인하여 1000단어 미만인 글 보강

#### Task 3.2: 콘텐츠 품질 검토
- 문법/맞춤법 오류 수정
- 이미지에 alt 텍스트 추가
- 내부 링크 최적화

#### Task 3.3: SEO 메타데이터 완성도 확인
- 모든 포스트에 title, description 존재 여부
- 적절한 길이 (title 60자, description 150-160자)

### Phase 4: 트래픽 기반 구축 (AdSense 신청 전)

#### Task 4.1: Google Analytics 데이터 확인
- 일일 방문자 수 확인
- 유기적 트래픽 비율 확인
- 평균 체류 시간 확인

#### Task 4.2: 검색 엔진 색인 확인
```bash
site:jangwook.net
```
Google에서 검색하여 색인된 페이지 수 확인

---

## AdSense 신청 프로세스

### Step 1: 사전 준비 완료 확인
모든 Phase 1, 2 작업이 완료되었는지 확인

### Step 2: AdSense 계정 생성
1. https://www.google.com/adsense 접속
2. Google 계정으로 로그인
3. 웹사이트 URL 입력: jangwook.net
4. 국가/지역 선택: 대한민국

### Step 3: 광고 코드 삽입
AdSense에서 제공하는 코드를 `<head>` 태그에 추가

```astro
// src/components/BaseHead.astro 수정
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXX"
     crossorigin="anonymous"></script>
```

### Step 4: 자동 광고 설정
AdSense 대시보드에서 자동 광고 활성화

### Step 5: 심사 대기
- 일반적으로 2〜4주 소요
- 최대 2주 내 1차 결과 통보

---

## 체크리스트 요약

### 신청 전 필수 완료 항목

| # | 항목 | 상태 | 우선순위 |
|---|------|------|----------|
| 1 | Privacy Policy 페이지 | ✅ 완료 | 🔴 Critical |
| 2 | Terms of Service 페이지 | ✅ 완료 | 🟡 High |
| 3 | robots.txt 생성 | ✅ 완료 | 🟡 High |
| 4 | 사이트맵 제출 | ✅ 완료 (Search Console 제출됨) | 🟡 High |
| 5 | Google Search Console 등록 | ✅ 완료 | 🟡 High |
| 6 | SSL/HTTPS 확인 | ⏳ 확인 필요 | 🟡 High |
| 7 | 콘텐츠 품질 검토 | ⏳ | 🟢 Medium |
| 8 | 단어 수 최적화 | ⏳ | 🟢 Medium |

### 예상 소요 시간

| Phase | 작업 | 예상 소요 |
|-------|------|-----------|
| Phase 1 | 필수 페이지 추가 | 1〜2일 |
| Phase 2 | 기술적 설정 | 0.5〜1일 |
| Phase 3 | 콘텐츠 최적화 | 2〜3일 |
| Phase 4 | 트래픽 기반 구축 | 지속적 |

---

## 승인 거절 시 대응 방안

### 흔한 거절 사유
1. **콘텐츠 불충분**: 더 많은 고품질 포스트 필요
2. **정책 위반**: 금지 콘텐츠 제거
3. **낮은 가치 콘텐츠**: 독창성/깊이 향상
4. **기술적 문제**: 네비게이션/접근성 개선

### 재신청
- 거절 후 최소 2주 대기
- 지적된 문제 완전히 해결
- 개선 사항 문서화

---

## 참고 자료

### 공식 문서
- [Google AdSense 자격 요건](https://support.google.com/adsense/answer/9724)
- [AdSense 프로그램 정책](https://support.google.com/adsense/answer/48182)
- [웹마스터 품질 가이드라인](https://developers.google.com/search/docs/advanced/guidelines/webmaster-guidelines)

### 추가 리소스
- [AdSense 승인 체크리스트 2025](https://www.adpushup.com/blog/google-adsense-approval/)
- [한국어 AdSense 도움말](https://support.google.com/adsense/?hl=ko)

---

## 작성 정보

- **작성일**: 2025-11-19
- **최종 업데이트**: 2025-11-19
- **연구자**: Claude Code
- **상태**: Phase 1 진행 중 (Privacy Policy, Terms of Service 완료)

---

## 다음 단계

### 완료된 작업
- ✅ Privacy Policy 페이지 생성 (4개 언어)
- ✅ Terms of Service 페이지 생성 (4개 언어)
- ✅ Footer 및 메인 페이지에 링크 추가
- ✅ Google Analytics 연동 확인
- ✅ 사이트맵 생성 확인
- ✅ robots.txt 생성 완료
- ✅ Google Search Console 등록 완료

### 즉시 실행 필요
1. **SSL/HTTPS 확인**: 배포 환경에서 HTTPS 작동 확인
2. **배포**: robots.txt 포함하여 사이트 재배포

### 이후 작업
3. **콘텐츠 품질 검토**: 포스트별 단어 수 분석
4. **AdSense 신청**: 위 작업 완료 후 진행
5. **지속적**: 트래픽 모니터링 및 콘텐츠 발행
