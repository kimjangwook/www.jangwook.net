# AdSense 승인을 위한 사이트 개선 프로젝트 계획서

## 프로젝트 개요

- **프로젝트명**: jangwook.net AdSense 승인 최적화
- **시작일**: 2025-12-01
- **목표**: "가치가 없는 콘텐츠" 거절 사유 해결 및 AdSense 재승인

---

## 1. 문제 분석 요약

### 1.1 AI 분석 결과 종합 (ChatGPT, Claude, Gemini)

| 분석 항목 | 현재 상태 | 문제 심각도 |
|----------|---------|------------|
| 루트 페이지 | 언어 선택만 존재, 콘텐츠 없음 | **Critical** |
| Privacy Policy | 구현됨 | OK |
| Contact 페이지 | 구현됨 (확인 필요) | OK |
| hreflang 태그 | 부분 구현 | Medium |
| 콘텐츠 가치 표현 | 탑 페이지에서 미노출 | **Critical** |
| 자동 언어 전환 | 미구현 | Medium |

### 1.2 핵심 문제점

1. **루트 도메인의 "가치 진공" 상태**
   - AdSense 크롤러는 루트 페이지(/)를 먼저 평가
   - 현재: 언어 선택 버튼만 존재 → 텍스트 밀도 0
   - 결과: "콘텐츠가 없는 빈 껍데기"로 판단

2. **콘텐츠 가치의 비가시성**
   - 232개의 양질의 포스트가 있지만 탑 페이지에서 노출 안됨
   - 포트폴리오 형식으로 인해 블로그 사이트로 인식 어려움

3. **기술적 SEO 미비**
   - hreflang 태그 완전 구현 필요
   - 루트 페이지의 Accept-Language 기반 자동 전환 미구현

---

## 2. 개선 전략

### 2.1 핵심 전략: "콘텐츠 가치 즉시 노출"

```
현재: jangwook.net → 언어 선택 → /[lang]/ → 블로그 접근
개선: jangwook.net → 즉시 콘텐츠 + 자동 언어 감지
```

### 2.2 구현 방안

#### A. 탑 페이지 전면 개편

**Before**: 언어 선택 게이트웨이
**After**: 콘텐츠 매거진 + 자동 언어 감지

**새로운 탑 페이지 구성**:
1. Header (블로그와 동일)
2. Hero Section - 사이트 소개 (텍스트 풍부)
3. Featured Posts - 언어별 최신/인기 포스트 (Accept-Language 기반)
4. Statistics Section - 콘텐츠 가치 증명
5. Categories Section - 주제별 포스트 탐색
6. About Author - E-E-A-T 신호
7. Footer (블로그와 동일)

#### B. 다국어 자동 전환

**구현 로직**:
```
1. 서버사이드: Accept-Language 헤더 감지
2. 지원 언어 매칭: ko, en, ja, zh
3. 기본값: en (국제 표준)
4. 콘텐츠 즉시 렌더링 (리다이렉트 없음)
```

#### C. hreflang 완전 구현

모든 페이지에 상호 참조 태그 추가:
```html
<link rel="alternate" hreflang="ko" href="https://jangwook.net/ko/..." />
<link rel="alternate" hreflang="en" href="https://jangwook.net/en/..." />
<link rel="alternate" hreflang="ja" href="https://jangwook.net/ja/..." />
<link rel="alternate" hreflang="zh" href="https://jangwook.net/zh/..." />
<link rel="alternate" hreflang="x-default" href="https://jangwook.net/en/..." />
```

---

## 3. 작업 체크리스트

### Phase 4: 탑 페이지 개선

- [x] 4.1 새로운 탑 페이지 디자인 설계
- [x] 4.2 Hero Section 컴포넌트 구현
- [x] 4.3 Featured Posts 섹션 구현 (언어별 최신 포스트)
- [x] 4.4 Statistics Section 구현 (포스트 수, 카테고리 등)
- [x] 4.5 Categories/Topics 섹션 구현
- [x] 4.6 Author Introduction 섹션 구현
- [x] 4.7 기존 Header/Footer 컴포넌트 재사용
- [x] 4.8 반응형 디자인 확인

### Phase 5: 다국어 자동 전환

- [x] 5.1 Accept-Language 헤더 파싱 유틸리티 구현
- [x] 5.2 언어 매칭 로직 구현
- [x] 5.3 탑 페이지에 자동 언어 감지 적용
- [x] 5.4 쿠키/localStorage 기반 언어 설정 저장
- [x] 5.5 수동 언어 전환 기능 유지

### Phase 6: hreflang 완전 구현

- [x] 6.1 BaseHead.astro에 hreflang 태그 추가
- [x] 6.2 모든 페이지 타입에 적용 (index, blog, about 등)
- [x] 6.3 블로그 포스트 개별 페이지 hreflang 구현
- [x] 6.4 x-default 태그 추가
- [ ] 6.5 Search Console에서 hreflang 검증 (배포 후 진행)

### Phase 7: 리뷰 및 피드백

- [x] 7.1 빌드 테스트 (npm run build)
- [ ] 7.2 로컬 프리뷰 테스트 (npm run preview) - 선택사항
- [ ] 7.3 Lighthouse SEO 점수 확인 - 배포 후 진행
- [x] 7.4 모바일 반응형 테스트 (Tailwind 기반)
- [ ] 7.5 크롤러 시뮬레이션 (JS 비활성화 테스트) - 배포 후 진행
- [x] 7.6 피드백 반영 및 수정 (Critical 이슈 3개 해결)

### Phase 8: 최종 레포트

- [x] 8.1 작업 완료 보고서 작성
- [x] 8.2 Before/After 비교 문서화
- [x] 8.3 AdSense 재신청 가이드 작성

---

## 4. 서브에이전트 작업 분담

| 에이전트 | 담당 작업 | 병렬 실행 |
|---------|---------|----------|
| frontend-developer | 탑 페이지 UI 구현, 컴포넌트 개발 | Yes |
| seo-analyzer | hreflang 구현, SEO 검증 | Yes |
| code-reviewer | 구현 코드 리뷰 | After implementation |
| test-engineer | 빌드 테스트, 기능 테스트 | After implementation |

---

## 5. 예상 결과물

1. **개선된 탑 페이지** (src/pages/index.astro)
   - 풍부한 텍스트 콘텐츠
   - 최신 블로그 포스트 노출
   - Accept-Language 기반 자동 언어 전환

2. **완전한 hreflang 구현**
   - 모든 페이지에 상호 참조 태그
   - x-default 태그 포함

3. **문서화**
   - PLAN.md: 작업 계획서 (현재 문서)
   - CHANGELOG.md: 작업 이력
   - REPORT.md: 최종 결과 보고서

---

## 6. 성공 기준

- [ ] 루트 페이지에서 즉시 콘텐츠 노출
- [ ] JS 비활성화 상태에서도 콘텐츠 렌더링 확인
- [ ] hreflang 태그 모든 페이지 적용
- [ ] Lighthouse SEO 점수 90+ 유지
- [ ] 빌드 에러 없음
- [ ] 모바일 반응형 정상 작동

---

**작성일**: 2025-12-01
**작성자**: Claude Code Orchestrator
