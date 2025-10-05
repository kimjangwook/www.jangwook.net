# Active Improvement TODOs

**Last Updated**: 2025-10-06
**Total Active**: 15
**Total In Progress**: 0
**Source**: Blog Launch Analysis Report (2025-10-06)

---

## 🔥 High Priority (6 items)

### TODO-001: 이벤트 트래킹 강화 (Enhanced Event Tracking)
- **Created**: 2025-10-06
- **Priority**: High
- **Category**: Technical
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.1)
- **Target Metric**: Event tracking coverage
- **Baseline**: Basic pageview tracking only
- **Goal**: Track 4+ custom events (read completion, contact clicks, social links, external links)
- **Deadline**: 2025-10-20 (2주)
- **Implementation**:
  ```javascript
  // Add these events:
  - blog_post_read_complete (스크롤 100% 도달)
  - contact_button_click (문의하기 클릭)
  - social_link_click (소셜 링크별 클릭)
  - external_link_click (외부 링크 클릭)
  ```

### TODO-002: 모바일 반응형 디자인 검증
- **Created**: 2025-10-06
- **Priority**: High
- **Category**: UX/Performance
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.1 & 2.2)
- **Target Metric**: Mobile traffic %
- **Baseline**: Very low mobile traffic observed in realtime data
- **Goal**: Optimize mobile UX, increase mobile traffic to 25-35% (industry standard)
- **Deadline**: 2025-10-20 (2주)

### TODO-003: 페이지 로딩 속도 최적화 (Core Web Vitals)
- **Created**: 2025-10-06
- **Priority**: High
- **Category**: UX/Performance
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.1)
- **Target Metric**: Core Web Vitals scores
- **Baseline**: TBD (measure current LCP, FID, CLS)
- **Goal**: LCP <2.5s, FID <100ms, CLS <0.1 (all "Good" ratings)
- **Deadline**: 2025-10-20 (2주)

### TODO-004: SEO 키워드 리서치 및 콘텐츠 최적화
- **Created**: 2025-10-06
- **Priority**: High
- **Category**: SEO
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.2)
- **Target Metric**: Organic Search %
- **Baseline**: TBD (awaiting historical data)
- **Goal**: 30% organic traffic within 3 months
- **Deadline**: 2026-01-06 (3개월)

### TODO-005: LinkedIn/Twitter(X) 소셜 미디어 활성화
- **Created**: 2025-10-06
- **Priority**: High
- **Category**: Traffic Growth
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.2)
- **Target Metric**: Social traffic %
- **Baseline**: TBD (awaiting historical data)
- **Goal**: 20% social traffic within 3 months
- **Deadline**: 2026-01-06 (3개월)

### TODO-006: 상위 10개 포스트 성과 분석 및 패턴 식별
- **Created**: 2025-10-06
- **Priority**: High
- **Category**: Content Optimization
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.2)
- **Target Metric**: Content quality patterns
- **Baseline**: TBD (need 1 month of data)
- **Goal**: Identify success patterns (주제, 길이, 구조) to replicate
- **Deadline**: 2025-11-20 (1개월 + 2주)

---

## ⚙️ Medium Priority (6 items)

### TODO-007: 구조화된 데이터(Schema.org) 추가
- **Created**: 2025-10-06
- **Priority**: Medium
- **Category**: SEO
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.1)
- **Target Metric**: SEO structured data coverage
- **Baseline**: No structured data
- **Goal**: Add Article, BreadcrumbList, Person schemas to all blog posts
- **Deadline**: 2025-10-27 (3주)

### TODO-008: 개발자 커뮤니티 참여 (Reddit, Dev.to)
- **Created**: 2025-10-06
- **Priority**: Medium
- **Category**: Traffic Growth
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.2)
- **Target Metric**: Referral traffic %
- **Baseline**: TBD (awaiting historical data)
- **Goal**: 10% referral traffic within 3 months
- **Deadline**: 2026-01-06 (3개월)

### TODO-009: Newsletter 구독 CTA 추가
- **Created**: 2025-10-06
- **Priority**: Medium
- **Category**: Conversion
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.2)
- **Target Metric**: Newsletter signup rate
- **Baseline**: 0 (no newsletter yet)
- **Goal**: Implement newsletter system, achieve 5% signup rate
- **Deadline**: 2025-12-06 (2개월)

### TODO-010: 관련 포스트 추천 알고리즘 구현
- **Created**: 2025-10-06
- **Priority**: Medium
- **Category**: Content Optimization
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.2)
- **Target Metric**: Pages per session
- **Baseline**: TBD (awaiting historical data, industry avg 1.5-2.5)
- **Goal**: Increase to 2.5+ pages per session
- **Deadline**: 2025-12-06 (2개월)

### TODO-011: 저성과 콘텐츠 개선 또는 통합
- **Created**: 2025-10-06
- **Priority**: Medium
- **Category**: Content Optimization
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.2)
- **Target Metric**: Overall content quality (avg engagement time)
- **Baseline**: TBD (need 1 month of data to identify low performers)
- **Goal**: Improve or consolidate bottom 20% performing content
- **Deadline**: 2025-12-20 (2.5개월)

### TODO-012: GA4 커스텀 디멘션 설정 (언어, 콘텐츠 타입)
- **Created**: 2025-10-06
- **Priority**: Medium
- **Category**: Technical
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 9.1 Day 2)
- **Target Metric**: Multi-language tracking capability
- **Baseline**: No custom dimensions
- **Goal**: Track content_language (ko/en/ja) and content_type (blog_post/page)
- **Deadline**: 2025-10-13 (1주)

---

## 📋 Low Priority (3 items)

### TODO-013: 댓글 시스템 도입 (Giscus 등)
- **Created**: 2025-10-06
- **Priority**: Low
- **Category**: Community
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.3)
- **Target Metric**: User engagement & community building
- **Baseline**: No commenting system
- **Goal**: Implement comment system, achieve 5% comment rate on posts
- **Deadline**: 2026-04-06 (6개월)

### TODO-014: 게스트 포스트 프로그램 시작
- **Created**: 2025-10-06
- **Priority**: Low
- **Category**: Community
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.3)
- **Target Metric**: Guest content & network expansion
- **Baseline**: 0 guest posts
- **Goal**: Publish 2-3 guest posts from industry experts
- **Deadline**: 2026-04-06 (6개월)

### TODO-015: 스폰서 콘텐츠 & 수익화 전략
- **Created**: 2025-10-06
- **Priority**: Low
- **Category**: Monetization
- **Status**: 📋 Planned
- **Assigned From**: Blog Launch Analysis Report (Section 6.3)
- **Target Metric**: Revenue generation
- **Baseline**: $0
- **Goal**: Establish monetization framework (윤리적 공개 원칙), first revenue stream
- **Deadline**: 2026-04-06 (6개월)

---

## 📝 Recurring Tasks

### RECURRING-001: 주 2-3회 기술 블로그 포스팅
- **Created**: 2025-10-06
- **Priority**: High
- **Category**: Content Creation
- **Status**: 🔄 Ongoing
- **Assigned From**: Blog Launch Analysis Report (Section 6.1)
- **Target Metric**: Content publishing velocity
- **Baseline**: Varies
- **Goal**: Maintain 2-3 quality posts per week (SEO optimized titles & meta descriptions)
- **Frequency**: Weekly

### RECURRING-002: 실시간 분석 체크 (일 5분)
- **Created**: 2025-10-06
- **Priority**: Medium
- **Category**: Analytics
- **Status**: 🔄 Ongoing
- **Assigned From**: Blog Launch Analysis Report (Section 9.2 Q4)
- **Target Metric**: Daily monitoring
- **Goal**: Daily check of realtime analytics
- **Frequency**: Daily (5 min)

### RECURRING-003: 주간 성과 리포트 (주 30분)
- **Created**: 2025-10-06
- **Priority**: Medium
- **Category**: Analytics
- **Status**: 🔄 Ongoing
- **Assigned From**: Blog Launch Analysis Report (Section 9.2 Q4)
- **Target Metric**: Weekly review
- **Goal**: Weekly analytics report & insights
- **Frequency**: Weekly (30 min)

### RECURRING-004: 월간 전략 리뷰 (월 2시간)
- **Created**: 2025-10-06
- **Priority**: High
- **Category**: Strategy
- **Status**: 🔄 Ongoing
- **Assigned From**: Blog Launch Analysis Report (Section 9.2 Q4)
- **Target Metric**: Monthly strategy alignment
- **Goal**: Monthly deep dive, strategy adjustments
- **Frequency**: Monthly (2 hours)

---

## 📅 Upcoming Milestones

### Week 1 Review (2025-10-13)
- [ ] TODO-001: Event tracking implemented
- [ ] TODO-012: Custom dimensions configured
- [ ] First historical data analysis complete
- [ ] Top 5 pages identified

### Month 1 Review (2025-11-06)
- [ ] TODO-002: Mobile optimization complete
- [ ] TODO-003: Core Web Vitals optimized
- [ ] TODO-007: Structured data added
- [ ] TODO-006: Content patterns identified
- [ ] Monthly KPIs evaluated vs targets

### Quarter 1 Review (2026-01-06)
- [ ] TODO-004: SEO strategy showing results (30% organic)
- [ ] TODO-005: Social media active (20% social traffic)
- [ ] TODO-008: Community engagement established (10% referral)
- [ ] 500 MAR target achieved or trajectory confirmed

---

## 📊 Priority Distribution
- **High Priority**: 6 items (40%)
- **Medium Priority**: 6 items (40%)
- **Low Priority**: 3 items (20%)
- **Recurring**: 4 tasks

## 🎯 Category Breakdown
- **Technical**: 2 items
- **Content**: 3 items
- **SEO**: 2 items
- **Traffic Growth**: 2 items
- **UX/Performance**: 2 items
- **Community**: 2 items
- **Conversion**: 1 item
- **Monetization**: 1 item

---

## 📝 Notes

- All TODOs extracted from **Blog Launch Analysis Report** (Oct 6, 2025)
- Baselines will be updated after first week of historical data collection
- Deadlines aligned with report's timeline: 1-2주 (short-term), 1-3개월 (medium), 3-6개월 (long-term)
- Use improvement-tracker agent to update status and record impact
- Completed items automatically moved to `completed-todos.md` with impact metrics

## Quick Actions

```bash
# View this file
cat /Users/jangwook/Documents/workspace/jangwook.net/improvement-tracking/active-todos.md

# Start working on a TODO (use improvement-tracker agent)
# @improvement-tracker start TODO-001

# Complete a TODO (use improvement-tracker agent)
# @improvement-tracker complete TODO-001 --impact "Event tracking: +40% engagement visibility"

# Update baselines after first analytics report
# @improvement-tracker update-baselines
```

---

*Last synced with analytics report: 2025-10-06*
*Next sync: After 1-week analytics review (2025-10-13)*
