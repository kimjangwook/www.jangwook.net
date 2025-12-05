---
title: Google Analytics MCP와 AI 에이전트로 블로그 분석 자동화하기
description: MCP와 AI 에이전트를 활용하여 블로그 분석을 자동화하고 데이터 기반 의사결정을 하는 방법을 알아봅니다
pubDate: '2025-10-05'
heroImage: ../../../assets/blog/google-analytics-mcp-hero.png
tags:
  - Analytics
  - MCP
  - Automation
relatedPosts:
  - slug: specification-driven-development
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-content-recommendation-system
    score: 0.93
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.92
    reason:
      ko: '선행 학습 자료로 유용하며, 자동화, AI/ML, 아키텍처 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、自動化、AI/ML、アーキテクチャの基礎を扱います。
      en: >-
        Useful as prerequisite knowledge, covering automation, AI/ML,
        architecture fundamentals.
      zh: 作为先修知识很有用，涵盖自动化、AI/ML、架构基础。
  - slug: metadata-based-recommendation-optimization
    score: 0.92
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: llm-blog-automation
    score: 0.91
    reason:
      ko: '선행 학습 자료로 유용하며, 자동화, AI/ML, 아키텍처 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、自動化、AI/ML、アーキテクチャの基礎を扱います。
      en: >-
        Useful as prerequisite knowledge, covering automation, AI/ML,
        architecture fundamentals.
      zh: 作为先修知识很有用，涵盖自动化、AI/ML、架构基础。
---

# Google Analytics MCP와 AI 에이전트로 블로그 분석 자동화하기

블로그를 운영하다 보면 가장 궁금한 것이 바로 "내 콘텐츠가 얼마나 잘 읽히고 있을까?"입니다. Google Analytics는 강력한 도구지만, 매번 대시보드에 접속해서 데이터를 확인하고 분석하는 것은 번거로운 일입니다. 이번 글에서는 **Model Context Protocol(MCP)**와 **AI 에이전트**를 활용해 블로그 분석을 완전히 자동화하는 방법을 소개합니다.

이 가이드에서는 실제 운영 중인 블로그에 적용한 분석 자동화 시스템을 단계별로 설명하고, 즉시 사용 가능한 코드와 쿼리 예제를 제공합니다.

## 왜 블로그 분석 자동화가 필요한가?

### 기존 방식의 한계

Google Analytics 대시보드는 데이터는 많지만, 실제로 필요한 인사이트를 얻기까지는 여러 단계를 거쳐야 합니다:

1. **수동 데이터 수집**: 대시보드에 접속해서 원하는 메트릭을 찾아야 함
2. **복잡한 쿼리 작성**: 커스텀 리포트를 만들려면 GA의 복잡한 인터페이스를 이해해야 함
3. **반복적인 작업**: 주간/월간 리포트를 만들 때마다 같은 작업을 반복
4. **인사이트 부족**: 숫자는 보이지만, "그래서 뭘 해야 하는가?"에 대한 답은 없음

### MCP와 AI 에이전트가 제시하는 해결책

**Model Context Protocol(MCP)**는 AI가 외부 데이터 소스와 통신할 수 있게 해주는 표준 프로토콜입니다. Google Analytics MCP를 사용하면:

- **자연어 질문**: "지난 주 가장 인기 있었던 포스트는?"이라고 물어보면 즉시 답변
- **자동화된 분석**: AI 에이전트가 정기적으로 데이터를 분석하고 리포트 생성
- **실행 가능한 인사이트**: 단순 숫자가 아닌, "다음에 무엇을 써야 할지" 제안

## Google Analytics MCP란?

### MCP의 작동 원리

MCP는 AI 모델과 데이터 소스 사이의 표준화된 통신 프로토콜입니다. 생각해보면 API와 비슷하지만, AI가 직접 이해하고 활용할 수 있도록 설계되었습니다.

```
┌─────────────┐      MCP Protocol      ┌──────────────────┐
│             │ ◄──────────────────── ► │                  │
│  AI Agent   │                         │  Google Analytics│
│  (Claude)   │                         │      MCP         │
│             │                         │                  │
└─────────────┘                         └──────────────────┘
```

### Google Analytics MCP의 기능

Google Analytics MCP는 다음과 같은 기능을 제공합니다:

- **리포트 조회**: GA4의 Data API를 통해 다양한 메트릭과 차원 조회
- **실시간 데이터**: 실시간 방문자 수, 이벤트 추적
- **커스텀 쿼리**: 복잡한 필터와 세그먼트를 자연어로 요청
- **자동 분석**: 트렌드 분석, 비교 분석 등을 AI가 수행

## 설치 및 설정 방법

### 1. Google Analytics MCP 설치

먼저 Google Analytics MCP 서버를 설치합니다. 이는 npx를 통해 실행할 수 있는 독립 서버입니다.

```bash
# MCP 서버는 별도 설치가 필요 없습니다
# Claude Desktop 또는 Claude Code의 설정 파일에 추가하면 됩니다
```

### 2. Google Cloud 프로젝트 설정

Google Analytics API를 사용하기 위해서는 Google Cloud 프로젝트가 필요합니다:

**단계별 설정:**

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Google Analytics Data API 활성화
4. 서비스 계정 생성 및 키 다운로드

```bash
# Google Cloud CLI로 자동 설정하는 방법
gcloud services enable analyticsdata.googleapis.com

# 서비스 계정 생성
gcloud iam service-accounts create ga-mcp-reader \
  --display-name="Google Analytics MCP Reader"

# 키 파일 생성 (credentials 폴더에 저장)
gcloud iam service-accounts keys create ~/credentials/ga-credentials.json \
  --iam-account=ga-mcp-reader@PROJECT_ID.iam.gserviceaccount.com
```

**중요**: `PROJECT_ID`를 실제 Google Cloud 프로젝트 ID로 변경하세요.

### 3. Google Analytics 권한 설정

서비스 계정에 GA4 속성 읽기 권한을 부여합니다:

1. GA4 속성 → 관리자 → 속성 액세스 관리
2. 우측 상단 "+" 버튼 클릭
3. 서비스 계정 이메일 주소 입력 (예: `ga-mcp-reader@PROJECT_ID.iam.gserviceaccount.com`)
4. 역할: **뷰어(Viewer)** 선택
5. 추가 클릭

**보안 팁**: 읽기 전용 권한만 부여하여 데이터 변경을 방지합니다.

### 3. Claude Code MCP 설정

`.mcp.json` 파일을 프로젝트 루트에 생성하거나 수정합니다:

```json
{
  "mcpServers": {
    "analytics-mcp": {
      "command": "npx",
      "args": ["-y", "@upenn-libraries/google-analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/ga-credentials.json"
      }
    }
  }
}
```

**중요**: `GOOGLE_APPLICATION_CREDENTIALS` 경로를 실제 서비스 계정 키 파일 경로로 변경하세요.

**보안 주의사항**:

```bash
# .gitignore에 credentials 폴더 추가 필수
echo "credentials/" >> .gitignore
echo "*.json" >> .gitignore
```

### 4. 설정 확인

Claude Code를 재시작하고 MCP 연결을 확인합니다:

```bash
# Claude Code에서 다음 명령으로 테스트
"Google Analytics 계정 정보를 보여줘"
```

성공하면 속성 ID, 속성 이름 등이 표시됩니다.

## 즉시 사용 가능한 8가지 쿼리

설정이 완료되면 다음 쿼리들을 바로 실행할 수 있습니다. 실제 블로그 운영에 필요한 핵심 인사이트를 얻을 수 있는 쿼리들입니다.

### 1. 실시간 활동 현황

**지금 이 순간 블로그에서 무슨 일이 일어나고 있는지 확인:**

```javascript
mcp__analytics -
  mcp__run_realtime_report({
    property_id: 395101361, // 본인의 속성 ID로 변경
    dimensions: ["unifiedScreenName", "country"],
    metrics: ["activeUsers"],
  });
```

**얻을 수 있는 정보:**

- 현재 접속 중인 사용자 수
- 어떤 페이지를 보고 있는지
- 어느 국가에서 접속했는지

### 2. 지난 7일 성과 요약

**주간 트래픽 트렌드 파악:**

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "7daysAgo", end_date: "today" }],
    dimensions: ["date"],
    metrics: [
      "activeUsers",
      "sessions",
      "screenPageViews",
      "averageSessionDuration",
    ],
    order_bys: [
      { dimension: { dimension_name: "date", order_type: 1 }, desc: true },
    ],
  });
```

**활용 방법:**

- 일별 트래픽 변화 추이 확인
- 요일별 패턴 분석 (주말 vs 평일)
- 전주 대비 성장률 계산

### 3. 인기 콘텐츠 Top 10 (최근 30일)

**어떤 포스트가 가장 많이 읽혔는지 확인:**

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["pagePath", "pageTitle"],
    metrics: ["screenPageViews", "activeUsers", "userEngagementDuration"],
    dimension_filter: {
      filter: {
        field_name: "pagePath",
        string_filter: {
          match_type: 2, // CONTAINS
          value: "/blog/",
          case_sensitive: false,
        },
      },
    },
    order_bys: [{ metric: { metric_name: "screenPageViews" }, desc: true }],
    limit: 10,
  });
```

**인사이트:**

- Top 10 포스트 분석 → 비슷한 주제로 콘텐츠 확장
- 평균 참여 시간이 긴 포스트 → 품질 벤치마크
- 예상보다 낮은 순위의 포스트 → SEO 최적화 필요

### 4. 트래픽 소스 분석

**방문자가 어디서 오는지 파악:**

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["sessionDefaultChannelGroup", "sessionSource"],
    metrics: ["sessions", "activeUsers", "bounceRate"],
    order_bys: [{ metric: { metric_name: "sessions" }, desc: true }],
    limit: 20,
  });
```

**전략 수립:**

- Organic Search 비율 → SEO 효과 측정
- Social 트래픽 → 어떤 플랫폼이 효과적인지
- Direct 트래픽 → 브랜드 인지도 지표
- Referral → 백링크 효과 분석

### 5. 지역별 독자 분포

**글로벌 도달 범위 확인:**

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["country", "city"],
    metrics: ["activeUsers", "sessions"],
    order_bys: [{ metric: { metric_name: "activeUsers" }, desc: true }],
    limit: 20,
  });
```

**다국어 블로그 전략:**

- 한국어 콘텐츠 → 한국 독자 비율 확인
- 영어 콘텐츠 → 미국, 인도, 유럽 독자 분석
- 일본어 콘텐츠 → 일본 독자 반응 측정

### 6. 디바이스 & 브라우저 현황

**사용자 환경 이해:**

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["deviceCategory", "browser"],
    metrics: ["sessions", "bounceRate", "averageSessionDuration"],
    order_bys: [{ metric: { metric_name: "sessions" }, desc: true }],
  });
```

**UX 최적화:**

- 모바일 비율 50% 이상 → 모바일 최적화 우선
- 특정 브라우저 이탈률 높음 → 호환성 이슈 점검
- 데스크톱 체류 시간 길면 → 심층 콘텐츠 강화

### 7. 신규 vs 재방문 독자

**충성도 높은 독자층 구축 여부 확인:**

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["newVsReturning"],
    metrics: [
      "activeUsers",
      "sessions",
      "screenPageViews",
      "averageSessionDuration",
    ],
  });
```

**목표 설정:**

- 신규 독자 비율 60-70% → 성장 중
- 재방문 독자 30-40% → 충성도 양호
- 재방문 독자 세션당 페이지뷰 높음 → 콘텐츠 탐색 활발

### 8. 랜딩 페이지 분석

**첫 진입 지점 최적화:**

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["landingPage"],
    metrics: ["sessions", "bounceRate", "averageSessionDuration"],
    order_bys: [{ metric: { metric_name: "sessions" }, desc: true }],
    limit: 15,
  });
```

**SEO 인사이트:**

- 검색 유입이 많은 랜딩 페이지 → 키워드 분석
- 이탈률 높은 랜딩 페이지 → 내용-제목 불일치 의심
- 체류 시간 긴 랜딩 페이지 → 관련 포스트 내부 링크 추가

**Tip**: 각 쿼리의 `property_id`를 본인의 GA4 속성 ID로 변경하세요. GA4 관리자 페이지에서 확인할 수 있습니다.

## AI 에이전트 기반 분석 시스템 구축

### Analytics 에이전트 설계

블로그 분석을 위한 전문 AI 에이전트를 만들어봅시다. `.claude/agents/analytics.md` 파일을 생성합니다:

```markdown
# Analytics Agent

You are a data analyst specialized in blog analytics.

## Your Role

Analyze Google Analytics data for the blog and provide:

- Traffic trends and patterns
- Content performance insights
- Audience behavior analysis
- Actionable recommendations

## Key Metrics to Track

1. **Traffic Metrics**

   - Total users, sessions, pageviews
   - New vs returning users
   - Traffic sources (organic, direct, referral, social)

2. **Content Performance**

   - Top performing posts (by pageviews, engagement)
   - Average time on page
   - Bounce rate by content type

3. **Audience Insights**
   - Geographic distribution
   - Device breakdown (mobile, desktop, tablet)
   - User journey and navigation paths

## Analysis Framework

When analyzing data:

1. Identify trends (week-over-week, month-over-month)
2. Find anomalies or interesting patterns
3. Compare against benchmarks or goals
4. Provide specific, actionable recommendations

## Report Format

Always structure reports as:

- **Executive Summary**: Key findings in 2-3 sentences
- **Metrics Overview**: Numbers with context
- **Insights**: What the data tells us
- **Action Items**: What to do next
```

### 자동화된 리포트 생성

이제 이 에이전트를 활용해 자동 리포트를 생성할 수 있습니다. 예를 들어:

**질문**: "지난 7일간 블로그 트래픽을 분석하고 인사이트를 제공해줘"

**AI 응답 예시**:

```
## 주간 트래픽 분석 리포트 (Oct 28 - Nov 3, 2025)

### Executive Summary
지난 주 총 방문자 수는 1,234명으로 전주 대비 23% 증가했습니다.
특히 "Google Analytics MCP" 관련 포스트가 급상승하며 오가닉 트래픽을 견인했습니다.

### Metrics Overview
- **Total Users**: 1,234 (↑23% vs 전주)
- **Sessions**: 1,567 (↑18%)
- **Pageviews**: 3,456 (↑31%)
- **Avg Session Duration**: 2m 34s (↑12%)
- **Bounce Rate**: 45% (↓5%p)

### Top Traffic Sources
1. Organic Search: 58% (주로 Google)
2. Direct: 25%
3. Social: 12% (Twitter가 주도)
4. Referral: 5%

### Top Performing Posts
1. "Google Analytics MCP 가이드" - 456 views (신규 포스트)
2. "Astro 블로그 만들기" - 234 views
3. "AI 에이전트 활용법" - 189 views

### Insights
✅ MCP 관련 콘텐츠가 높은 관심 받음 - SEO 효과 확인됨
✅ 평균 세션 시간 증가 - 콘텐츠 품질 개선 효과
⚠️ 모바일 트래픽 증가 중 (42%) - 모바일 UX 개선 필요

### Action Items
1. MCP 시리즈 콘텐츠 추가 제작 (높은 수요 확인)
2. 모바일 사용자를 위한 레이아웃 최적화
3. 인기 포스트에 관련 글 링크 추가 (체류 시간 증대)
```

### KPI 모니터링 자동화

실제 운영 환경에서 사용하는 자동화 스크립트들을 공유합니다.

#### 1. 일일 스냅샷 스크립트

매일 아침 전날 데이터를 요약해주는 스크립트입니다:

```javascript
// scripts/daily-snapshot.js
const { GoogleAnalyticsMCP } = require("@analytics-mcp/client");

async function dailySnapshot() {
  const analytics = new GoogleAnalyticsMCP();
  const propertyId = 395101361; // 본인의 속성 ID로 변경

  try {
    // 1. 실시간 현황
    const realtime = await analytics.runRealtimeReport({
      property_id: propertyId,
      dimensions: ["unifiedScreenName"],
      metrics: ["activeUsers"],
    });

    // 2. 오늘 vs 어제 비교
    const comparison = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [
        { start_date: "today", end_date: "today", name: "Today" },
        { start_date: "yesterday", end_date: "yesterday", name: "Yesterday" },
      ],
      dimensions: [],
      metrics: ["activeUsers", "sessions", "screenPageViews"],
    });

    // 3. 오늘의 Top 5 페이지
    const topPages = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [{ start_date: "today", end_date: "today" }],
      dimensions: ["pagePath", "pageTitle"],
      metrics: ["screenPageViews", "activeUsers"],
      order_bys: [{ metric: { metric_name: "screenPageViews" }, desc: true }],
      limit: 5,
    });

    // 결과 출력 (Slack, 이메일, 콘솔 등으로 전송 가능)
    console.log(`
📊 일일 스냅샷 - ${new Date().toLocaleDateString("ko-KR")}

🔴 실시간: ${realtime.rows ? realtime.rows.length : 0}명 온라인

오늘 vs 어제:
  사용자:    ${comparison.rows[0]?.metric_values[0] || 0} (어제: ${
      comparison.rows[1]?.metric_values[0] || 0
    })
  세션:      ${comparison.rows[0]?.metric_values[1] || 0} (어제: ${
      comparison.rows[1]?.metric_values[1] || 0
    })
  페이지뷰:  ${comparison.rows[0]?.metric_values[2] || 0} (어제: ${
      comparison.rows[1]?.metric_values[2] || 0
    })

🏆 오늘의 Top 5:
${formatTopPages(topPages)}
    `);
  } catch (error) {
    console.error("일일 스냅샷 실패:", error);
  }
}

function formatTopPages(data) {
  if (!data.rows || data.rows.length === 0) return "아직 데이터 없음";
  return data.rows
    .map(
      (row, i) =>
        `${i + 1}. ${row.dimension_values[1]} - ${row.metric_values[0]} views`
    )
    .join("\n");
}

// 실행
if (require.main === module) {
  dailySnapshot();
}

module.exports = { dailySnapshot };
```

**실행 방법:**

```bash
# 수동 실행
node scripts/daily-snapshot.js

# Cron으로 매일 오전 9시 자동 실행
# crontab -e에 추가:
0 9 * * * cd /path/to/your/blog && node scripts/daily-snapshot.js
```

#### 2. 주간 리포트 생성기

매주 월요일 자동으로 지난 주 성과를 분석하는 스크립트:

```javascript
// scripts/weekly-report.js
const { GoogleAnalyticsMCP } = require("@analytics-mcp/client");
const fs = require("fs").promises;
const path = require("path");

async function generateWeeklyReport() {
  const analytics = new GoogleAnalyticsMCP();
  const propertyId = 395101361;
  const reportDate = new Date().toISOString().split("T")[0];

  console.log("🔄 주간 리포트 생성 중...");

  try {
    // 1. 주간 메트릭 (이번 주 vs 지난 주)
    const weeklyMetrics = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [
        { start_date: "7daysAgo", end_date: "yesterday", name: "ThisWeek" },
        { start_date: "14daysAgo", end_date: "8daysAgo", name: "LastWeek" },
      ],
      dimensions: [],
      metrics: [
        "activeUsers",
        "sessions",
        "screenPageViews",
        "averageSessionDuration",
        "bounceRate",
      ],
    });

    // 2. 인기 포스트 Top 5
    const topPosts = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [{ start_date: "7daysAgo", end_date: "yesterday" }],
      dimensions: ["pagePath", "pageTitle"],
      metrics: ["screenPageViews", "activeUsers", "userEngagementDuration"],
      dimension_filter: {
        filter: {
          field_name: "pagePath",
          string_filter: {
            match_type: 2,
            value: "/blog/",
            case_sensitive: false,
          },
        },
      },
      order_bys: [{ metric: { metric_name: "screenPageViews" }, desc: true }],
      limit: 5,
    });

    // 3. 트래픽 소스
    const trafficSources = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [{ start_date: "7daysAgo", end_date: "yesterday" }],
      dimensions: ["sessionDefaultChannelGroup"],
      metrics: ["sessions"],
      order_bys: [{ metric: { metric_name: "sessions" }, desc: true }],
    });

    // 4. 지역 분포
    const geography = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [{ start_date: "7daysAgo", end_date: "yesterday" }],
      dimensions: ["country"],
      metrics: ["activeUsers"],
      order_bys: [{ metric: { metric_name: "activeUsers" }, desc: true }],
      limit: 5,
    });

    // Markdown 리포트 생성
    const report = generateMarkdownReport({
      reportDate,
      weeklyMetrics,
      topPosts,
      trafficSources,
      geography,
    });

    // reports 폴더에 저장
    const reportsDir = path.join(__dirname, "..", "reports");
    await fs.mkdir(reportsDir, { recursive: true });
    const reportPath = path.join(reportsDir, `weekly-${reportDate}.md`);
    await fs.writeFile(reportPath, report);

    console.log(`✅ 리포트 저장 완료: ${reportPath}`);
    return { report, reportPath };
  } catch (error) {
    console.error("❌ 주간 리포트 생성 실패:", error);
    throw error;
  }
}

function generateMarkdownReport(data) {
  const { reportDate, weeklyMetrics, topPosts, trafficSources, geography } =
    data;

  // 메트릭 파싱
  const thisWeek = weeklyMetrics.rows?.[0]?.metric_values || [];
  const lastWeek = weeklyMetrics.rows?.[1]?.metric_values || [];

  const metrics = [
    { name: "활성 사용자", this: thisWeek[0], last: lastWeek[0] },
    { name: "세션", this: thisWeek[1], last: lastWeek[1] },
    { name: "페이지뷰", this: thisWeek[2], last: lastWeek[2] },
    {
      name: "평균 세션 시간",
      this: formatDuration(thisWeek[3]),
      last: formatDuration(lastWeek[3]),
    },
    {
      name: "이탈률",
      this: formatPercent(thisWeek[4]),
      last: formatPercent(lastWeek[4]),
    },
  ];

  // 변화율 계산
  const metricsTable = metrics
    .map((m) => {
      const change = calculateChange(m.this, m.last);
      const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
      return `| ${m.name} | ${m.this} | ${m.last} | ${change}% ${arrow} |`;
    })
    .join("\n");

  // Top 포스트 테이블
  const postsTable =
    topPosts.rows
      ?.map((row, i) => {
        const title = row.dimension_values[1].value;
        const views = row.metric_values[0].value;
        const users = row.metric_values[1].value;
        const avgTime = formatDuration(
          row.metric_values[2].value / parseInt(views)
        );
        return `
${i + 1}. **${title}**
   - 조회수: ${views} | 사용자: ${users} | 평균 체류: ${avgTime}`;
      })
      .join("\n") || "데이터 없음";

  // 트래픽 소스 테이블
  const sourcesTable =
    trafficSources.rows
      ?.map((row) => {
        const source = row.dimension_values[0].value;
        const sessions = row.metric_values[0].value;
        const total = trafficSources.rows.reduce(
          (sum, r) => sum + parseInt(r.metric_values[0].value),
          0
        );
        const percent = ((parseInt(sessions) / total) * 100).toFixed(1);
        return `| ${source} | ${sessions} | ${percent}% |`;
      })
      .join("\n") || "| 데이터 없음 | - | - |";

  // 지역 테이블
  const geoTable =
    geography.rows
      ?.map((row, i) => {
        const country = row.dimension_values[0].value;
        const users = row.metric_values[0].value;
        const total = geography.rows.reduce(
          (sum, r) => sum + parseInt(r.metric_values[0].value),
          0
        );
        const percent = ((parseInt(users) / total) * 100).toFixed(1);
        return `${i + 1}. ${country} - ${users}명 (${percent}%)`;
      })
      .join("\n") || "데이터 없음";

  return `# 주간 분석 리포트
**주간 종료일:** ${reportDate}
**생성 시각:** ${new Date().toISOString()}

## 📊 핵심 지표 (전주 대비)

| 지표 | 이번 주 | 지난 주 | 변화 |
|------|---------|---------|------|
${metricsTable}

## 🏆 Top 5 인기 포스트
${postsTable}

## 📈 트래픽 소스

| 소스 | 세션 | 비율 |
|------|------|------|
${sourcesTable}

## 🌍 지역 분포 (Top 5)

${geoTable}

## 💡 주요 인사이트

[자동 생성된 인사이트 - AI로 분석 가능]

## ✅ 다음 주 액션 아이템

- [ ] 인기 포스트 관련 콘텐츠 추가 작성
- [ ] 트래픽 소스 변화 분석
- [ ] [데이터 기반 구체적 액션]

---
*Google Analytics MCP로 자동 생성*
`;
}

function formatDuration(seconds) {
  if (!seconds || seconds === "0") return "0:00";
  const secs = typeof seconds === "string" ? parseFloat(seconds) : seconds;
  const mins = Math.floor(secs / 60);
  const secs_remainder = Math.floor(secs % 60);
  return `${mins}:${secs_remainder.toString().padStart(2, "0")}`;
}

function formatPercent(value) {
  if (!value) return "0%";
  return `${(parseFloat(value) * 100).toFixed(1)}%`;
}

function calculateChange(current, previous) {
  if (!previous || previous === "0") return 0;
  const curr = parseFloat(current) || 0;
  const prev = parseFloat(previous) || 0;
  return (((curr - prev) / prev) * 100).toFixed(1);
}

// 직접 실행 시
if (require.main === module) {
  generateWeeklyReport()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { generateWeeklyReport };
```

**Cron 설정:**

```bash
# crontab -e 편집
# 매주 월요일 오전 9시 자동 실행
0 9 * * 1 cd /path/to/your/blog && node scripts/weekly-report.js
```

#### 3. 콘텐츠 성과 분석기

90일 데이터를 분석하여 콘텐츠 전략을 수립하는 스크립트:

```javascript
// scripts/analyze-content.js
const { GoogleAnalyticsMCP } = require("@analytics-mcp/client");

async function analyzeContentPerformance(daysBack = 90) {
  const analytics = new GoogleAnalyticsMCP();
  const propertyId = 395101361;

  console.log(`🔍 콘텐츠 성과 분석 중 (최근 ${daysBack}일)...`);

  try {
    // 모든 블로그 포스트 성과 가져오기
    const blogPosts = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [
        { start_date: `${daysBack}daysAgo`, end_date: "yesterday" },
      ],
      dimensions: ["pagePath", "pageTitle"],
      metrics: [
        "screenPageViews",
        "activeUsers",
        "userEngagementDuration",
        "bounceRate",
        "sessions",
      ],
      dimension_filter: {
        filter: {
          field_name: "pagePath",
          string_filter: {
            match_type: 2,
            value: "/blog/",
            case_sensitive: false,
          },
        },
      },
      order_bys: [{ metric: { metric_name: "screenPageViews" }, desc: true }],
      limit: 250,
    });

    // 성과 분석
    const posts =
      blogPosts.rows?.map((row) => {
        const views = parseInt(row.metric_values[0].value);
        const users = parseInt(row.metric_values[1].value);
        const engagementTime = parseFloat(row.metric_values[2].value);
        const bounceRate = parseFloat(row.metric_values[3].value);
        const avgEngagement = views > 0 ? engagementTime / views : 0;

        // 언어 추출 (경로에서)
        const language =
          row.dimension_values[0].value.match(/\/(ko|en|ja)\//)?.[1] ||
          "unknown";

        return {
          path: row.dimension_values[0].value,
          title: row.dimension_values[1].value,
          views,
          users,
          avgEngagement: Math.round(avgEngagement),
          bounceRate: Math.round(bounceRate * 100),
          language,
        };
      }) || [];

    // 80/20 분포 계산
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    let cumulativeViews = 0;

    posts.forEach((post, index) => {
      cumulativeViews += post.views;
      const cumulativePercent = (cumulativeViews / totalViews) * 100;

      if (cumulativePercent <= 20) {
        post.category = "Power Post (Top 20%)";
      } else if (cumulativePercent <= 60) {
        post.category = "Mid-Tier (20-60%)";
      } else {
        post.category = "Long Tail (60-100%)";
      }
    });

    // 결과 요약
    const analysis = {
      summary: {
        totalPosts: posts.length,
        totalViews,
        avgViewsPerPost: Math.round(totalViews / posts.length),
        avgEngagement: Math.round(
          posts.reduce((s, p) => s + p.avgEngagement, 0) / posts.length
        ),
      },
      categories: {
        powerPosts: posts.filter((p) => p.category === "Power Post (Top 20%)"),
        midTier: posts.filter((p) => p.category === "Mid-Tier (20-60%)"),
        longTail: posts.filter((p) => p.category === "Long Tail (60-100%)"),
      },
      languages: {
        ko: posts.filter((p) => p.language === "ko"),
        en: posts.filter((p) => p.language === "en"),
        ja: posts.filter((p) => p.language === "ja"),
      },
      top10: posts.slice(0, 10),
      underperformers: posts.slice(-10),
    };

    // 콘솔 출력
    console.log(`
📊 콘텐츠 성과 분석

전체 현황:
- 총 포스트: ${analysis.summary.totalPosts}개
- 총 조회수: ${analysis.summary.totalViews.toLocaleString()}
- 포스트당 평균: ${analysis.summary.avgViewsPerPost}
- 평균 참여 시간: ${Math.floor(analysis.summary.avgEngagement / 60)}분 ${
      analysis.summary.avgEngagement % 60
    }초

분포:
- Power Posts (Top 20%): ${
      analysis.categories.powerPosts.length
    }개 (${Math.round(
      (analysis.categories.powerPosts.reduce((s, p) => s + p.views, 0) /
        totalViews) *
        100
    )}% 트래픽)
- Mid-Tier (20-60%): ${analysis.categories.midTier.length}개
- Long Tail (60-100%): ${analysis.categories.longTail.length}개

언어별:
- 한국어: ${analysis.languages.ko.length}개 (${Math.round(
      (analysis.languages.ko.reduce((s, p) => s + p.views, 0) / totalViews) *
        100
    )}% 트래픽)
- 영어: ${analysis.languages.en.length}개 (${Math.round(
      (analysis.languages.en.reduce((s, p) => s + p.views, 0) / totalViews) *
        100
    )}% 트래픽)
- 일본어: ${analysis.languages.ja.length}개 (${Math.round(
      (analysis.languages.ja.reduce((s, p) => s + p.views, 0) / totalViews) *
        100
    )}% 트래픽)

Top 3 포스트:
${analysis.top10
  .slice(0, 3)
  .map(
    (p, i) =>
      `${i + 1}. ${p.title}\n   ${p.views} views, ${Math.floor(
        p.avgEngagement / 60
      )}:${(p.avgEngagement % 60).toString().padStart(2, "0")} 평균 참여`
  )
  .join("\n")}

💡 권장사항:
${generateRecommendations(analysis)}
    `);

    return analysis;
  } catch (error) {
    console.error("❌ 분석 실패:", error);
    throw error;
  }
}

function generateRecommendations(analysis) {
  const recs = [];
  const totalViews = analysis.summary.totalViews;

  // Power law 분포 체크
  const powerPostsPercent =
    (analysis.categories.powerPosts.reduce((s, p) => s + p.views, 0) /
      totalViews) *
    100;
  if (powerPostsPercent < 70) {
    recs.push(
      "- 콘텐츠가 고르게 분포되어 있습니다. Top 포스트를 더 적극적으로 홍보하세요."
    );
  } else if (powerPostsPercent > 85) {
    recs.push(
      "- Top 포스트 집중도가 너무 높습니다. 콘텐츠 다양화가 필요합니다."
    );
  }

  // 언어 균형
  const langStats = ["ko", "en", "ja"].map((lang) => ({
    lang,
    posts: analysis.languages[lang].length,
    views: analysis.languages[lang].reduce((s, p) => s + p.views, 0),
  }));
  const dominantLang = langStats.sort((a, b) => b.views - a.views)[0];
  if (dominantLang.views / totalViews > 0.7) {
    recs.push(
      `- ${dominantLang.lang.toUpperCase()} 콘텐츠가 우세합니다. 다른 언어 투자를 고려하세요.`
    );
  }

  // 참여도 분석
  if (analysis.summary.avgEngagement < 180) {
    recs.push("- 평균 참여 시간이 낮습니다. 콘텐츠 깊이와 예제를 추가하세요.");
  }

  return recs.length > 0
    ? recs.join("\n")
    : "- 주요 이슈 없음. 현재 전략을 유지하세요.";
}

// CLI
if (require.main === module) {
  const days = parseInt(process.argv[2]) || 90;
  analyzeContentPerformance(days)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { analyzeContentPerformance };
```

**사용 예:**

```bash
# 최근 90일 분석 (기본값)
node scripts/analyze-content.js

# 최근 30일 분석
node scripts/analyze-content.js 30

# 모든 데이터 분석
node scripts/analyze-content.js 365
```

## 실전 활용 예시

### 1. 트래픽 분석 자동화

**시나리오**: 매일 아침 전날 트래픽 요약을 받고 싶습니다.

```javascript
// .claude/prompts/daily-traffic.md
매일 아침 9시에 다음 분석을 수행:

1. 어제(어제 00:00 - 23:59) 데이터 조회
2. 주요 메트릭 요약:
   - 총 방문자, 세션, 페이지뷰
   - 전일 대비 변화율
   - 실시간 인기 페이지 Top 3
3. 이상 징후 확인 (트래픽 급증/급락)
4. Slack 또는 이메일로 전송

포맷:
📊 일일 트래픽 요약 (YYYY-MM-DD)
- 방문자: X명 (±Y%)
- 인기 페이지: [링크1, 링크2, 링크3]
- 특이사항: [있다면 설명]
```

**자동화 방법**:

1. GitHub Actions 또는 cron job 설정
2. Claude API 호출로 MCP 실행
3. 결과를 Slack Webhook으로 전송

### 2. 콘텐츠 성과 측정

**시나리오**: 새로 발행한 포스트의 첫 주 성과를 분석합니다.

**Claude에게 질문**:

```
"google-analytics-mcp-automation" 포스트를 분석해줘:
- 첫 7일간 트래픽
- 유입 경로 (어디서 왔는가?)
- 평균 체류 시간
- 이탈률
- 다른 포스트 대비 성과

이 데이터를 바탕으로 개선점을 제안해줘.
```

**AI의 분석 예시**:

```
## "google-analytics-mcp-automation" 포스트 분석

### 7일 성과
- Pageviews: 567
- Avg time on page: 4m 12s (블로그 평균 2m 30s 대비 68% 높음)
- Bounce rate: 32% (평균 45% 대비 우수)

### 트래픽 소스
1. Organic Search: 72% (키워드: "google analytics mcp", "블로그 분석 자동화")
2. Twitter: 18% (특정 트윗이 바이럴)
3. Direct: 10%

### 벤치마크 대비
✅ 최상위 5% 성과 (같은 기간 발행 포스트 중)
✅ SEO 최적화 효과 확인 (오가닉 트래픽 높음)
✅ 긴 체류 시간 = 콘텐츠 품질 우수

### 개선 제안
1. Twitter에서 반응이 좋았으니 후속 트윗 시리즈 작성
2. "MCP 시리즈"로 확장 - 관련 콘텐츠 수요 높음
3. 내부 링크 추가 - 다른 MCP/자동화 관련 포스트 연결
```

### 3. 인사이트 도출 및 액션 아이템 생성

**시나리오**: 월간 데이터를 분석해서 다음 달 콘텐츠 전략을 수립합니다.

**프롬프트**:

```
지난 한 달 (10월) 블로그 데이터를 종합 분석하고:

1. 가장 성과가 좋았던 콘텐츠 주제/형식 파악
2. 독자들이 찾는 키워드 트렌드 분석
3. 트래픽 소스별 특성 (어떤 채널에서 어떤 콘텐츠가 잘 되는가?)
4. 11월 콘텐츠 캘린더 제안 (주제 5개)

데이터 기반으로 구체적인 전략을 제시해줘.
```

**AI의 전략 제안**:

```
## 10월 종합 분석 및 11월 콘텐츠 전략

### 성과 분석
**Top 주제**:
1. MCP/AI 자동화 (평균 조회수 450)
2. Astro/웹 개발 (평균 조회수 320)
3. 블로그 운영 팁 (평균 조회수 280)

**키워드 트렌드**:
- "MCP", "Model Context Protocol" 검색 급증 (450% ↑)
- "블로그 자동화", "AI 에이전트" 관심 증가
- "Astro", "정적 사이트" 꾸준한 수요

**채널별 특성**:
- Organic: 기술 심화 콘텐츠 (가이드, 튜토리얼)
- Twitter: 짧고 실용적인 팁, 코드 스니펫
- Direct: 시리즈 콘텐츠 (연속 방문)

### 11월 콘텐츠 캘린더

**Week 1**: "MCP 서버 직접 만들기 - 처음부터 끝까지"
- 타겟: 개발자, MCP 심화 학습자
- 키워드: "MCP 개발", "커스텀 MCP"

**Week 2**: "Claude Code로 블로그 SEO 자동화하기"
- 타겟: 블로거, 마케터
- 키워드: "SEO 자동화", "메타태그 최적화"

**Week 3**: "AI 에이전트로 콘텐츠 아이디어 자동 생성"
- 타겟: 콘텐츠 크리에이터
- 키워드: "콘텐츠 기획", "AI 글쓰기"

**Week 4**: "Astro + MCP 통합 가이드"
- 타겟: 프론트엔드 개발자
- 키워드: "Astro MCP", "정적 사이트 자동화"

**Week 5**: "월간 회고: 블로그 분석 자동화로 얻은 인사이트"
- 타겟: 모든 독자
- 키워드: "블로그 성장", "데이터 분석"

### 실행 전략
1. **SEO 집중**: Week 1, 2 포스트에 키워드 최적화 강화
2. **소셜 미디어**: Week 3 포스트를 Twitter 스레드로 재가공
3. **시리즈화**: MCP 관련 콘텐츠를 시리즈로 묶어 내부 링크 강화
4. **실험**: Week 4에 비디오 튜토리얼 추가 (새로운 포맷 테스트)
```

## 고급 활용: 커스텀 대시보드 구축

MCP를 활용하면 자신만의 분석 대시보드를 만들 수 있습니다.

### Astro 통합 예시

```astro
---
// src/pages/analytics-dashboard.astro
import Layout from '../layouts/Layout.astro';

// 빌드 시 GA 데이터 fetch (MCP 사용)
const last7Days = await fetch('claude-mcp://analytics-mcp/run_report', {
  property_id: 'YOUR_PROPERTY_ID',
  date_ranges: [{ start_date: '7daysAgo', end_date: 'today' }],
  dimensions: ['date', 'pagePath'],
  metrics: ['screenPageViews', 'averageSessionDuration']
});

const topPages = await fetch('claude-mcp://analytics-mcp/run_report', {
  property_id: 'YOUR_PROPERTY_ID',
  date_ranges: [{ start_date: '30daysAgo', end_date: 'today' }],
  dimensions: ['pageTitle', 'pagePath'],
  metrics: ['screenPageViews'],
  order_bys: [{ metric: { metric_name: 'screenPageViews' }, desc: true }],
  limit: 10
});
---

<Layout title="Analytics Dashboard">
  <h1>블로그 분석 대시보드</h1>

  <section>
    <h2>지난 7일 트렌드</h2>
    <div class="chart">
      {/* 차트 라이브러리로 시각화 */}
    </div>
  </section>

  <section>
    <h2>Top 10 페이지</h2>
    <ul>
      {topPages.map(page => (
        <li>
          <a href={page.pagePath}>{page.pageTitle}</a>
          <span>{page.screenPageViews} views</span>
        </li>
      ))}
    </ul>
  </section>
</Layout>
```

### 실시간 알림 시스템

```typescript
// scripts/realtime-monitor.ts
import { Client } from "@modelcontextprotocol/sdk";

async function monitorRealtime() {
  const client = new Client();
  await client.connect("analytics-mcp");

  // 5분마다 실시간 데이터 확인
  setInterval(async () => {
    const realtime = await client.callTool("run_realtime_report", {
      property_id: process.env.GA_PROPERTY_ID,
      dimensions: ["unifiedScreenName"],
      metrics: ["activeUsers"],
      limit: 5,
    });

    const totalActive = realtime.metrics[0].values[0];

    // 동시 접속자 50명 이상이면 알림
    if (totalActive >= 50) {
      await sendSlackNotification({
        text: `🔥 실시간 방문자 급증! 현재 ${totalActive}명 온라인`,
        channel: "#blog-alerts",
      });
    }
  }, 5 * 60 * 1000); // 5분
}

monitorRealtime();
```

## 모범 사례 및 팁

### 1. 데이터 프라이버시

- 서비스 계정 키는 절대 Git에 커밋하지 마세요
- 환경 변수 또는 시크릿 매니저 사용
- 최소 권한 원칙: GA에서 읽기 권한만 부여

```bash
# .gitignore에 추가
credentials/
*.json
.env
```

### 2. API 할당량 관리

Google Analytics Data API는 일일 할당량이 있습니다:

- 기본: 하루 25,000 요청
- 프로젝트당 초당 10 요청

**최적화 팁**:

```typescript
// 캐싱 활용
const cache = new Map();

async function fetchWithCache(query, ttl = 3600) {
  const key = JSON.stringify(query);

  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < ttl * 1000) {
      return data;
    }
  }

  const data = await fetchAnalytics(query);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 3. 효과적인 프롬프트 작성

AI 에이전트에게 명확한 지시를 주세요:

**나쁜 예**:

```
"블로그 분석해줘"
```

**좋은 예**:

```
"지난 30일간 데이터를 분석해서:
1. Top 5 페이지를 조회수와 함께 나열
2. 주요 트래픽 소스 비율 계산
3. 전월 대비 성장률 계산
4. 개선이 필요한 영역 3가지 제안

결과는 Markdown 표로 정리해줘."
```

### 4. 정기 리포트 자동화

```yaml
# .github/workflows/weekly-analytics.yml
name: Weekly Analytics Report

on:
  schedule:
    - cron: "0 9 * * 1" # 매주 월요일 오전 9시 (UTC)

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate Report
        env:
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GA_CREDENTIALS }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx tsx scripts/generate-weekly-report.ts

      - name: Send to Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Weekly Analytics Report Ready!",
              "attachments": [
                {
                  "text": "${{ steps.report.outputs.summary }}"
                }
              ]
            }
```

## 트러블슈팅

### 인증 오류

**문제**: "Permission denied" 또는 "Invalid credentials"

**해결**:

1. 서비스 계정 키 경로 확인
2. GA 속성에서 서비스 계정 권한 확인
3. API 활성화 확인:
   ```bash
   gcloud services list --enabled | grep analytics
   ```

### 데이터 불일치

**문제**: MCP 결과와 GA UI 결과가 다름

**원인**:

- 시간대 차이 (GA UI는 속성 시간대, API는 UTC 기본)
- 샘플링 (대량 데이터에서 발생)
- 필터 차이

**해결**:

```typescript
// 시간대 명시
{
  date_ranges: [{
    start_date: '2025-10-01',
    end_date: '2025-10-31'
  }],
  // 속성의 시간대 사용
  keep_empty_rows: true
}
```

### 성능 이슈

**문제**: 쿼리가 너무 느림

**최적화**:

1. 필요한 차원/메트릭만 요청
2. 날짜 범위 제한
3. 페이지네이션 사용:
   ```typescript
   {
     limit: 100,
     offset: 0  // 다음 페이지는 100, 200, ...
   }
   ```

## 결론: 데이터 기반 블로그 운영의 시작

Google Analytics MCP와 AI 에이전트를 결합하면 블로그 운영이 완전히 달라집니다:

### 기대 효과

1. **시간 절약**: 수동 분석에 들이던 시간을 콘텐츠 제작에 투자
2. **더 나은 인사이트**: AI가 사람이 놓치기 쉬운 패턴을 발견
3. **데이터 기반 의사결정**: 감이 아닌 데이터로 콘텐츠 전략 수립
4. **자동화된 워크플로우**: 한 번 설정하면 계속 작동하는 시스템

### 확장 가능성

이 시스템은 블로그 분석을 넘어 확장할 수 있습니다:

- **A/B 테스트 자동화**: 제목, 이미지 등의 효과 자동 측정
- **경쟁사 분석**: 유사한 블로그와 비교 분석
- **예측 분석**: 과거 데이터로 미래 트래픽 예측
- **개인화**: 독자 행동 패턴에 따른 콘텐츠 추천

### 다음 단계

1. **MCP 설정**: 이 글의 가이드대로 Google Analytics MCP 연동
2. **첫 리포트 생성**: "지난 주 트래픽 분석해줘"로 시작
3. **에이전트 커스터마이징**: 자신의 블로그에 맞는 분석 로직 개발
4. **자동화 구축**: GitHub Actions로 정기 리포트 설정

### 추가 리소스

- [Google Analytics Data API 문서](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Model Context Protocol 스펙](https://modelcontextprotocol.io)
- [Claude Code 공식 문서](https://docs.anthropic.com/claude/docs)
- [@upenn-libraries/google-analytics-mcp GitHub](https://github.com/upenn-libraries/google-analytics-mcp)

---

데이터는 단순한 숫자가 아닙니다. 제대로 분석하고 활용하면 블로그 성장의 나침반이 됩니다. MCP와 AI 에이전트가 그 과정을 자동화하고 가속화해줄 것입니다.

이제 여러분의 차례입니다. 오늘부터 데이터 기반 블로그 운영을 시작해보세요!

**Questions? Feedback?**
이 가이드에 대한 질문이나 실제 적용 경험이 있다면 댓글로 공유해주세요. 함께 더 나은 블로그 자동화 시스템을 만들어갑시다.
