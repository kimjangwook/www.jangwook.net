# 블로그 분석 레포트 & 사이트 개선 추적 시스템

**jangwook.net 데이터 기반 개선 자동화**

---

## 📋 시스템 개요

이 시스템은 두 가지 핵심 기능을 제공합니다:

### 1. 자동 분석 레포트 생성 (analytics-reporter)
- Google Analytics 4 데이터를 수집하고 분석
- 블로그 포스트 형식의 전문적인 리포트 자동 생성
- 데이터 기반 인사이트 도출 및 액션 플랜 제안

### 2. 개선 사항 추적 & 히스토리 관리 (improvement-tracker)
- 액션 플랜을 구조화된 TODO로 변환
- 개선 작업 진행 상황 추적
- Before/After 효과 측정 및 ROI 계산
- 사이트 개선 히스토리 자동 문서화

---

## 🤖 전문 에이전트

### Analytics Reporter Agent
**파일**: `.claude/agents/analytics-reporter.md`

**역할**:
- GA4 MCP 도구를 활용한 데이터 수집
- 기존 리포트 형식을 따른 블로그 포스트 생성
- KPI 대비 성과 분석
- 실행 가능한 인사이트 및 액션 플랜 도출

**참고 문서**:
- `src/content/blog/ko/google-analytics-mcp-automation.md`
- `src/content/blog/ko/blog-launch-analysis-report.md`
- `analytics-strategy.md`
- `ANALYTICS-TODO.md`
- `analytics-quickstart.md`
- `ANALYTICS-SUMMARY.md`

### Improvement Tracker Agent
**파일**: `.claude/agents/improvement-tracker.md`

**역할**:
- 액션 플랜 → TODO 변환
- 진행 상황 추적 및 업데이트
- 완료 후 효과 측정 및 기록
- 개선 히스토리 페이지 자동 업데이트

**관리 파일**:
- `improvement-tracking/active-todos.md` - 진행 중인 TODO
- `improvement-tracking/completed-todos.md` - 완료된 개선사항 아카이브
- `improvement-tracking/improvement-history.md` - 전체 히스토리
- `improvement-tracking/impact-dashboard.md` - 효과 대시보드

---

## 🚀 사용 방법

### 커맨드 1: 분석 리포트 생성

**목적**: 정기적인 블로그 성과 분석 및 레포트 발행

**실행 방법**:
```
User: "지난 주 블로그 분석 리포트를 작성해줘"
또는
User: "지난 30일 블로그 성과를 분석하고 리포트를 작성해줘"
```

**에이전트 동작**:
1. GA4 데이터 수집 (8가지 필수 쿼리 실행)
2. 데이터 분석 및 인사이트 도출
3. 블로그 포스트 형식으로 리포트 생성
4. 액션 플랜 제안 (우선순위별)

**출력 예시**:
```markdown
파일: src/content/blog/ko/weekly-analytics-2025-10-12.md

내용:
- Executive Summary
- KPI 성과 분석
- 트래픽 분석
- 콘텐츠 성과
- 주요 인사이트 3-5개
- 📋 액션 플랜 (High/Medium/Low Priority)
- 다음 주 목표
```

---

### 커맨드 2: 액션 플랜 → TODO 변환 및 추적

**목적**: 리포트의 액션 플랜을 실행 가능한 TODO로 관리

#### Step 1: TODO 생성

**실행 방법**:
```
User: "weekly-analytics-2025-10-12 리포트의 액션 플랜을 TODO로 변환해줘"
또는
User: "이번 주 리포트의 High Priority 액션을 TODO로 추가해줘"
```

**에이전트 동작**:
1. 리포트에서 액션 플랜 추출
2. 각 액션을 구조화된 TODO로 변환
3. `active-todos.md`에 추가
4. 우선순위별 정렬

**출력 예시**:
```markdown
### TODO: Mobile UX Optimization
- Created: 2025-10-12
- Priority: High
- Category: UX
- Status: 📋 Planned
- Target Metric: Mobile Bounce Rate
- Baseline: 68%
- Goal: <50%
- Deadline: 2025-10-19

Implementation Steps:
1. [ ] Lighthouse mobile audit
2. [ ] Optimize images
3. [ ] Improve tap targets
...
```

#### Step 2: 진행 상황 업데이트

**실행 방법**:
```
User: "Mobile UX Optimization TODO를 진행 중으로 변경해줘"
또는
User: "TODO #3 첫 번째 단계 완료했어"
```

**에이전트 동작**:
- 상태 업데이트 (📋 → 🚧 → ✅)
- 타임스탬프 기록
- 진행 단계 체크

#### Step 3: 완료 및 효과 측정

**실행 방법**:
```
User: "Mobile UX Optimization 완료. Mobile bounce rate가 68%에서 47%로 감소했어"
```

**에이전트 동작**:
1. TODO를 완료 상태로 변경
2. 실제 결과 기록
3. 효과 계산 (% 변화, ROI)
4. `completed-todos.md`로 아카이브
5. `improvement-history.md` 업데이트
6. `improvement-history.astro` 페이지 자동 업데이트

#### Step 4: 개선 효과 리포트

**실행 방법**:
```
User: "이번 달 개선 효과 리포트 생성해줘"
또는
User: "impact dashboard 업데이트해줘"
```

**에이전트 동작**:
- 완료된 개선사항 집계
- ROI 계산 및 순위 산정
- 카테고리별 효과 분석
- `impact-dashboard.md` 업데이트
- 트렌드 및 인사이트 도출

---

## 📁 파일 구조

```
/Users/jangwook/Documents/workspace/jangwook.net/

├── .claude/
│   └── agents/
│       ├── analytics-reporter.md      # 분석 리포트 생성 에이전트
│       └── improvement-tracker.md     # 개선사항 추적 에이전트
│
├── improvement-tracking/
│   ├── README.md                      # 이 파일
│   ├── active-todos.md                # 진행 중인 TODO 목록
│   ├── completed-todos.md             # 완료된 개선사항 아카이브
│   ├── improvement-history.md         # 전체 개선 히스토리 (내부용)
│   └── impact-dashboard.md            # 효과 분석 대시보드
│
├── src/
│   ├── content/blog/ko/
│   │   ├── weekly-analytics-*.md      # 주간 분석 리포트
│   │   ├── monthly-analytics-*.md     # 월간 분석 리포트
│   │   └── quarterly-analytics-*.md   # 분기 분석 리포트
│   │
│   └── pages/
│       └── improvement-history.astro  # 개선 히스토리 웹페이지
│
└── analytics-strategy.md              # 전체 분석 전략 문서
```

---

## 🔄 전체 워크플로우

### 주간 사이클 (권장)

**월요일 오전 (30분)**:
1. 📊 **리포트 생성**:
   ```
   "지난 주 블로그 분석 리포트를 작성해줘"
   ```

2. 📋 **TODO 변환**:
   ```
   "이번 주 리포트의 액션 플랜을 TODO로 변환해줘"
   ```

3. 🎯 **우선순위 확인**:
   ```
   "High Priority TODO 목록 보여줘"
   ```

**평일 (진행 중)**:
4. 🚧 **작업 시작**:
   ```
   "TODO '[제목]'을 진행 중으로 변경해줘"
   ```

5. ✅ **작업 완료**:
   ```
   "TODO '[제목]' 완료. [메트릭]이 [Before]에서 [After]로 변경됨"
   ```

**금요일 오후 (15분)**:
6. 📈 **주간 회고**:
   ```
   "이번 주 완료된 개선사항 요약해줘"
   ```

### 월간 사이클

**매월 첫째 주**:
1. 📊 **월간 리포트**:
   ```
   "지난 달 블로그 성과를 분석하고 월간 리포트를 작성해줘"
   ```

2. 📈 **효과 분석**:
   ```
   "지난 달 개선 효과 리포트 생성해줘"
   ```

3. 🔄 **전략 조정**:
   ```
   "impact dashboard 기반으로 다음 달 우선순위 제안해줘"
   ```

---

## 📊 웹 페이지 확인

개선 히스토리를 웹에서 확인:

**URL**: `http://localhost:4321/improvement-history`

**페이지 구성**:
- 📈 Summary Stats (총 개선 건수, 평균 효과, 최다 카테고리)
- 🔍 카테고리 필터 (Traffic/Content/SEO/UX/Technical)
- 📅 Timeline View (시간순 개선 사항)
- 🎯 Before/After 비교 시각화
- 💡 배운 점 (Lessons Learned)
- 📄 출처 리포트 링크

**자동 업데이트**:
- improvement-tracker 에이전트가 TODO 완료 시 자동으로 페이지 업데이트
- 실시간 빌드 없이 정적 페이지로 제공

---

## 💡 사용 팁

### 효과적인 TODO 관리

1. **명확한 목표 설정**:
   ```
   ❌ "SEO 개선"
   ✅ "Top 3 포스트의 메타 설명 최적화하여 Organic CTR 2.3% → 3.5% 달성"
   ```

2. **측정 가능한 메트릭**:
   ```
   ❌ "성능 개선"
   ✅ "Lighthouse 모바일 점수 78 → 90 이상"
   ```

3. **현실적인 데드라인**:
   ```
   High Priority: 1주 이내
   Medium Priority: 2-3주
   Low Priority: 1개월
   ```

### 효과 측정 베스트 프랙티스

1. **Before 데이터 기록 필수**:
   - TODO 생성 시 현재 값 반드시 기록
   - 가능하면 스크린샷/증거 첨부

2. **충분한 측정 기간**:
   - 최소 7일 (트래픽 변화)
   - 최소 14일 (SEO 효과)
   - 최소 30일 (콘텐츠 성과)

3. **외부 요인 고려**:
   - 계절성, 이벤트, 경쟁사 변화 기록
   - "순수 개선 효과"와 "외부 요인" 분리

### 히스토리 활용

1. **패턴 발견**:
   - "어떤 종류의 개선이 ROI가 높은가?"
   - "어떤 카테고리에 집중해야 하는가?"

2. **학습 라이브러리**:
   - 성공/실패 사례 축적
   - 재사용 가능한 솔루션 문서화

3. **컨텐츠 소스**:
   - 개선 히스토리를 블로그 포스트로 변환
   - 투명성과 신뢰 구축

---

## ⚙️ 고급 기능

### 커스텀 메트릭 추적

**예시: 특정 포스트 성과 추적**:
```
User: "React 튜토리얼 포스트의 주간 성과를 TODO로 추가하고, 매주 자동 업데이트되도록 설정해줘"
```

### 자동 알림 설정

**예시: 데드라인 리마인더**:
```
User: "High Priority TODO 중 데드라인이 3일 이내인 항목 알려줘"
```

### 비교 분석

**예시: A/B 테스트 결과**:
```
User: "제목 변경 전후 CTR 비교해서 TODO 효과 측정해줘"
```

---

## 🚨 문제 해결

### 리포트 생성 실패

**증상**: 데이터 수집 오류
**해결**:
1. GA4 MCP 연결 확인
2. Property ID 확인 (395101361)
3. 날짜 범위 조정 (데이터가 없는 기간인지 확인)

### TODO 상태 업데이트 안 됨

**증상**: 상태 변경이 파일에 반영 안 됨
**해결**:
1. TODO 제목 정확히 입력
2. `active-todos.md` 파일 직접 확인
3. 에이전트에게 "active-todos.md 파일 내용 보여줘" 요청

### 히스토리 페이지 업데이트 안 됨

**증상**: 웹페이지에 최신 개선사항 안 보임
**해결**:
1. `improvement-history.astro` 파일의 `improvements` 배열 확인
2. 에이전트에게 "improvement-history 페이지 업데이트해줘" 요청
3. 개발 서버 재시작: `npm run dev`

---

## 📈 성공 지표

이 시스템이 제대로 작동하는지 확인:

### 1주일 후
- [ ] 첫 주간 리포트 발행됨
- [ ] 최소 3개 TODO 생성됨
- [ ] 최소 1개 TODO 완료 및 효과 측정됨

### 1개월 후
- [ ] 4개 주간 리포트 발행됨
- [ ] 1개 월간 리포트 발행됨
- [ ] 최소 5개 개선사항 완료 및 아카이브됨
- [ ] improvement-history 페이지에 5개 이상 항목 표시됨

### 3개월 후
- [ ] 모든 KPI에 대한 Before/After 추적 완료
- [ ] 카테고리별 ROI 패턴 식별됨
- [ ] 재사용 가능한 Best Practice 3개 이상 문서화됨
- [ ] 블로그 성장 스토리를 데이터로 증명 가능

---

## 🎯 다음 단계

### 지금 바로 시작하기

1. **첫 리포트 생성** (10분):
   ```
   "지난 7일간 블로그 성과를 분석하고 첫 리포트를 작성해줘"
   ```

2. **첫 TODO 추가** (5분):
   ```
   "리포트의 High Priority 액션을 TODO로 변환해줘"
   ```

3. **첫 개선 완료** (작업 시간에 따라):
   - TODO 시작 → 작업 진행 → 완료 및 효과 측정

4. **히스토리 확인** (1분):
   ```
   http://localhost:4321/improvement-history
   ```

### 자동화 확장

- **GitHub Actions**: 주간 리포트 자동 생성
- **Slack 연동**: TODO 데드라인 알림
- **대시보드**: Grafana/Looker Studio 연동

---

## 📚 참고 자료

- **GA4 MCP 문서**: `src/content/blog/ko/google-analytics-mcp-automation.md`
- **분석 전략**: `analytics-strategy.md`
- **빠른 시작**: `analytics-quickstart.md`
- **에이전트 가이드**: `.claude/agents/`

---

## ✅ 체크리스트

### 시스템 준비 완료
- [x] analytics-reporter 에이전트 생성
- [x] improvement-tracker 에이전트 생성
- [x] TODO 관리 파일 구조 생성
- [x] improvement-history 웹페이지 생성
- [x] 사용 가이드 문서 작성

### 시작하기 전 확인
- [ ] GA4 MCP 연결 테스트
- [ ] 첫 분석 리포트 생성
- [ ] 첫 TODO 추가 및 테스트
- [ ] 웹페이지 접근 확인

### 주간 루틴 설정
- [ ] 월요일 오전 리포트 생성 습관화
- [ ] 진행 중인 TODO 매일 확인
- [ ] 금요일 주간 회고 습관화

---

**🚀 이제 데이터 기반의 체계적인 블로그 개선을 시작하세요!**

모든 개선사항이 추적되고, 모든 노력이 측정되며, 모든 성장이 기록됩니다.

*Created: 2025-10-05*
*For: jangwook.net*
