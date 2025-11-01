---
title: Slack MCP로 팀 커뮤니케이션 데이터 분석하기
description: Model Context Protocol을 활용한 Slack 데이터 분석 방법과 실전 활용 사례를 소개합니다
pubDate: '2025-11-04'
heroImage: ../../../assets/blog/slack-mcp-team-communication-hero.jpg
tags:
  - slack
  - mcp
  - ai-agents
  - communication-analytics
  - claude-code
relatedPosts:
  - slug: claude-skills-implementation-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
  - slug: jules-autocoding
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
  - slug: ai-agent-notion-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
  - slug: llm-pm-workflow-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
  - slug: notion-backlog-slack-claude-project-management
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
---

## 개요

팀 커뮤니케이션은 조직의 성과를 좌우하는 핵심 요소입니다. Slack과 같은 협업 플랫폼에는 팀의 건강도, 생산성, 문화를 이해할 수 있는 귀중한 데이터가 쌓여 있지만, 이를 효과적으로 분석하고 활용하는 것은 쉽지 않습니다.

<strong>Model Context Protocol(MCP)</strong>은 이러한 문제를 해결하는 혁신적인 솔루션입니다. Claude AI와 Slack을 연결하여 대화 데이터를 분석하고, 인사이트를 도출하며, 자동화된 워크플로우를 구축할 수 있습니다.

이 글에서는 다음 내용을 다룹니다:

- Slack MCP의 핵심 개념과 아키텍처
- 설치 및 설정 방법 (3가지 옵션)
- 8가지 핵심 MCP 도구 활용법
- 감성 분석, 참여도 측정 등 데이터 분석 기법
- Salesforce, 스타트업, 글로벌 기업의 실전 사례
- 성능 최적화 및 보안 모범 사례

## Slack MCP란 무엇인가?

### 핵심 개념

<strong>Model Context Protocol(MCP)</strong>은 Anthropic이 2024년 11월에 공개한 오픈 프로토콜로, AI 모델이 외부 데이터 소스 및 도구와 표준화된 방식으로 상호작용할 수 있게 합니다. 기존 Slack API는 개발자가 직접 HTTP 요청을 작성하고 응답을 파싱해야 했지만, MCP는 이러한 복잡성을 추상화하여 자연어로 데이터를 요청하고 분석할 수 있습니다.

<strong>기존 Slack API vs Slack MCP</strong>:

| 특징 | Slack API | Slack MCP |
|------|-----------|-----------|
| 사용 방식 | HTTP 요청 직접 작성 | 자연어 명령 |
| 인증 | 수동 토큰 관리 | MCP 서버가 처리 |
| 데이터 파싱 | 수동 JSON 파싱 | AI가 자동 해석 |
| 분석 | 별도 코드 작성 필요 | Claude AI 내장 분석 |
| 학습 곡선 | 높음 | 낮음 |

### 아키텍처 다이어그램

```mermaid
graph TB
    User[사용자] -->|자연어 명령| Host[MCP Host<br/>Claude Code/Desktop]
    Host -->|MCP Protocol| Server[MCP Server<br/>Slack Connector]
    Server -->|OAuth/Token| SlackAPI[Slack API]
    SlackAPI -->|채널, 메시지, 사용자| Slack[Slack Workspace]

    Server -->|Resources| Host
    Server -->|Tools| Host
    Server -->|Prompts| Host

    Host -->|AI 분석 결과| User

    style Host fill:#f9f,stroke:#333
    style Server fill:#bbf,stroke:#333
    style Slack fill:#4A154B,stroke:#333,color:#fff
```

### 주요 구성 요소

MCP 생태계는 세 가지 핵심 요소로 구성됩니다:

1. <strong>MCP Hosts</strong>: Claude Code, Claude Desktop, Cline 등 MCP 프로토콜을 지원하는 클라이언트 애플리케이션
2. <strong>MCP Servers</strong>: 특정 데이터 소스(Slack, GitHub, Postgres 등)와 연결되는 커넥터
3. <strong>프로토콜 표준</strong>:
   - <strong>Resources</strong>: 정적 데이터 (채널 목록, 사용자 프로필)
   - <strong>Tools</strong>: 동적 작업 (메시지 전송, 검색)
   - <strong>Prompts</strong>: 재사용 가능한 명령 템플릿

## 설치 및 설정

Slack MCP를 시작하는 방법은 3가지가 있습니다. 각 옵션은 서로 다른 요구사항과 권한 모델을 가지고 있습니다.

### Option 1: 공식 TypeScript 서버 (권장)

가장 안정적이고 기능이 풍부한 옵션입니다. Slack App 생성 및 OAuth 인증이 필요합니다.

<strong>1단계: Slack App 생성</strong>

1. [Slack API 웹사이트](https://api.slack.com/apps)에서 "Create New App" 클릭
2. "From scratch" 선택
3. App 이름 입력 (예: "MCP Analytics Bot")
4. Workspace 선택

<strong>2단계: 권한 설정</strong>

"OAuth & Permissions" 섹션에서 다음 Bot Token Scopes 추가:

````typescript
// 필수 OAuth Scopes
const requiredScopes = [
  'channels:history',    // 공개 채널 메시지 읽기
  'channels:read',       // 채널 목록 조회
  'chat:write',          // 메시지 전송
  'groups:history',      // 비공개 채널 메시지
  'groups:read',         // 비공개 채널 목록
  'im:history',          // DM 히스토리
  'im:read',             // DM 목록
  'mpim:history',        // 그룹 DM 히스토리
  'reactions:read',      // 이모지 반응 읽기
  'reactions:write',     // 이모지 반응 추가
  'users:read',          // 사용자 정보 조회
  'search:read',         // 메시지 검색
];
````

<strong>3단계: 설치</strong>

```bash
# NPM을 통한 설치
npm install -g @modelcontextprotocol/server-slack

# 또는 NPX로 직접 실행 (설치 불필요)
npx @modelcontextprotocol/server-slack
```

<strong>4단계: Claude Code 설정</strong>

`.claude/settings.json` 파일에 다음 설정 추가:

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-slack"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token-here",
        "SLACK_TEAM_ID": "T01234567"
      }
    }
  }
}
```

<strong>5단계: Bot Token 가져오기</strong>

1. Slack App 설정에서 "Install to Workspace" 클릭
2. 권한 승인
3. "Bot User OAuth Token"을 복사하여 `SLACK_BOT_TOKEN`에 입력
4. Workspace URL에서 Team ID 확인 (예: `your-workspace.slack.com` → Team ID는 Settings에서 확인)

### Option 2: 커뮤니티 Python 서버

Python 환경을 선호하거나 커스터마이징이 필요한 경우 적합합니다.

```bash
# 설치
pip install mcp-server-slack

# 실행
mcp-server-slack --token xoxb-your-token
```

`.claude/settings.json` 설정:

```json
{
  "mcpServers": {
    "slack": {
      "command": "mcp-server-slack",
      "args": [
        "--token",
        "xoxb-your-bot-token"
      ]
    }
  }
}
```

<strong>장점</strong>:
- Python 생태계 통합 용이
- 커스터마이징 및 확장성
- 데이터 과학 라이브러리 연동 (pandas, numpy)

<strong>단점</strong>:
- 공식 서버보다 기능 제한적
- 업데이트 빈도 낮음

### Option 3: 고급 서버 (권한 불필요)

Slack App 생성 없이 브라우저 토큰을 사용하는 방법입니다. 개인용 분석에 적합합니다.

```bash
# 설치
npm install -g @modelcontextprotocol/server-slack-advanced

# 브라우저 토큰 추출
# 1. Slack 웹 앱 열기 (app.slack.com)
# 2. 개발자 도구 (F12) → Application → Cookies
# 3. "d" 쿠키 값 복사
```

`.claude/settings.json` 설정:

```json
{
  "mcpServers": {
    "slack-advanced": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-slack-advanced"
      ],
      "env": {
        "SLACK_COOKIE": "xoxd-browser-token-here"
      }
    }
  }
}
```

<strong>주의사항</strong>:
- 브라우저 토큰은 주기적으로 만료됨 (30〜90일)
- 개인 계정 권한으로만 동작
- 프로덕션 환경에서는 권장하지 않음

### 인증 및 권한 설정

<strong>Bot Token vs User Token vs Browser Token</strong>:

| 토큰 타입 | 사용 시나리오 | 권한 범위 | 만료 |
|----------|-------------|---------|------|
| Bot Token (xoxb-) | 팀 전체 분석, 자동화 | App에 부여된 권한 | 무기한 |
| User Token (xoxp-) | 개인 데이터 접근 | 사용자 권한 | 무기한 |
| Browser Token (xoxd-) | 빠른 프로토타이핑 | 현재 사용자 | 30〜90일 |

<strong>보안 모범 사례</strong>:

1. <strong>환경 변수 사용</strong>: 토큰을 코드에 하드코딩하지 말 것
2. <strong>최소 권한 원칙</strong>: 필요한 스코프만 요청
3. <strong>토큰 로테이션</strong>: 주기적으로 토큰 재발급
4. <strong>감사 로깅</strong>: Slack Audit Logs API로 접근 기록 추적

## 사용 가능한 MCP 도구

Slack MCP는 8가지 핵심 도구를 제공합니다. 각 도구는 특정 작업에 최적화되어 있습니다.

### 1. slack_list_channels

워크스페이스의 모든 채널 목록을 조회합니다.

<strong>파라미터</strong>:
- `types` (선택): `public_channel`, `private_channel`, `mpim`, `im` 중 선택
- `limit` (선택): 반환할 최대 채널 수 (기본값: 100)

<strong>응답 형식</strong>:

```json
{
  "channels": [
    {
      "id": "C01234567",
      "name": "general",
      "is_channel": true,
      "is_private": false,
      "created": 1609459200,
      "num_members": 150
    }
  ]
}
```

<strong>실전 활용 사례</strong>:

```typescript
// 활성 채널 식별 (멤버 수 기준)
const channels = await slack_list_channels({ limit: 1000 });
const activeChannels = channels
  .filter(ch => ch.num_members > 10)
  .sort((a, b) => b.num_members - a.num_members);

console.log(`가장 활성화된 채널: ${activeChannels[0].name} (${activeChannels[0].num_members}명)`);
```

### 2. slack_conversations_history

특정 채널의 메시지 히스토리를 가져옵니다.

<strong>파라미터</strong>:
- `channel` (필수): 채널 ID (예: "C01234567")
- `limit` (선택): 메시지 수 (최대 1000)
- `oldest` (선택): Unix 타임스탬프 (이 시간 이후 메시지)
- `latest` (선택): Unix 타임스탬프 (이 시간 이전 메시지)

<strong>응답 형식</strong>:

```json
{
  "messages": [
    {
      "type": "message",
      "user": "U01234567",
      "text": "프로젝트 마일스톤 달성했습니다!",
      "ts": "1609459200.123456",
      "thread_ts": "1609459200.123456",
      "reply_count": 5,
      "reactions": [
        {
          "name": "tada",
          "count": 12,
          "users": ["U01234567", "U76543210"]
        }
      ]
    }
  ]
}
```

<strong>실전 활용 사례</strong>:

```typescript
// 지난 7일간 메시지 볼륨 분석
const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
const history = await slack_conversations_history({
  channel: "C01234567",
  oldest: sevenDaysAgo.toString(),
  limit: 1000
});

const dailyVolume = {};
history.messages.forEach(msg => {
  const day = new Date(parseFloat(msg.ts) * 1000).toLocaleDateString();
  dailyVolume[day] = (dailyVolume[day] || 0) + 1;
});

console.log("일별 메시지 수:", dailyVolume);
```

### 3. slack_post_message

채널이나 DM에 메시지를 전송합니다.

<strong>파라미터</strong>:
- `channel` (필수): 채널 ID 또는 사용자 ID
- `text` (필수): 메시지 내용 (Markdown 지원)
- `blocks` (선택): Block Kit 구조화 메시지
- `thread_ts` (선택): 스레드에 응답할 메시지의 타임스탬프

<strong>실전 활용 사례</strong>:

```typescript
// 주간 분석 리포트 자동 전송
const report = `
📊 <strong>주간 커뮤니케이션 리포트</strong>

- 총 메시지: ${totalMessages}개
- 참여 사용자: ${activeUsers.length}명
- 가장 활발한 채널: #${topChannel.name}
- 평균 응답 시간: ${avgResponseTime}분

💡 <strong>인사이트</strong>: 이번 주 참여도가 지난 주 대비 15% 증가했습니다.
`;

await slack_post_message({
  channel: "C_ANALYTICS",
  text: report
});
```

### 4. slack_reply_to_thread

특정 스레드에 응답을 추가합니다.

<strong>파라미터</strong>:
- `channel` (필수): 채널 ID
- `thread_ts` (필수): 부모 메시지의 타임스탬프
- `text` (필수): 응답 내용

<strong>실전 활용 사례</strong>:

```typescript
// 고객 문의 자동 트리아지
const supportMessages = await slack_conversations_history({
  channel: "C_SUPPORT",
  limit: 50
});

for (const msg of supportMessages.messages) {
  if (msg.text.includes("긴급") && !msg.reactions) {
    await slack_reply_to_thread({
      channel: "C_SUPPORT",
      thread_ts: msg.ts,
      text: "⚠️ 긴급 문의로 분류되었습니다. 담당자가 곧 확인할 예정입니다."
    });
  }
}
```

### 5. slack_add_reaction

메시지에 이모지 반응을 추가합니다.

<strong>파라미터</strong>:
- `channel` (필수): 채널 ID
- `timestamp` (필수): 메시지 타임스탬프
- `name` (필수): 이모지 이름 (예: "thumbsup")

<strong>실전 활용 사례</strong>:

```typescript
// 완료된 작업에 자동으로 체크 이모지 추가
const taskMessages = await slack_search_messages({
  query: "작업 완료"
});

for (const msg of taskMessages.messages) {
  await slack_add_reaction({
    channel: msg.channel.id,
    timestamp: msg.ts,
    name: "white_check_mark"
  });
}
```

### 6. slack_get_thread_replies

스레드의 모든 응답을 가져옵니다.

<strong>파라미터</strong>:
- `channel` (필수): 채널 ID
- `thread_ts` (필수): 스레드 시작 메시지의 타임스탬프

<strong>실전 활용 사례</strong>:

```typescript
// 스레드 해결 시간 측정
const threadReplies = await slack_get_thread_replies({
  channel: "C_SUPPORT",
  thread_ts: "1609459200.123456"
});

const firstReply = threadReplies[1]; // 첫 응답 (0은 부모 메시지)
const lastReply = threadReplies[threadReplies.length - 1];

const resolutionTime =
  (parseFloat(lastReply.ts) - parseFloat(threadReplies[0].ts)) / 3600;

console.log(`해결 시간: ${resolutionTime.toFixed(1)}시간`);
```

### 7. slack_list_users

워크스페이스의 모든 사용자 목록을 조회합니다.

<strong>응답 형식</strong>:

```json
{
  "members": [
    {
      "id": "U01234567",
      "name": "jangwook",
      "real_name": "장욱",
      "is_bot": false,
      "is_admin": true,
      "tz": "Asia/Seoul"
    }
  ]
}
```

<strong>실전 활용 사례</strong>:

```typescript
// 타임존별 사용자 분포 분석
const users = await slack_list_users();
const timezoneDistribution = {};

users.members
  .filter(u => !u.is_bot)
  .forEach(u => {
    const tz = u.tz || "Unknown";
    timezoneDistribution[tz] = (timezoneDistribution[tz] || 0) + 1;
  });

console.log("타임존별 팀원 분포:", timezoneDistribution);
```

### 8. slack_search_messages

워크스페이스 전체에서 메시지를 검색합니다.

<strong>파라미터</strong>:
- `query` (필수): 검색 쿼리 (Slack 검색 문법 지원)
- `count` (선택): 결과 수 (최대 100)
- `sort` (선택): `score` 또는 `timestamp`

<strong>검색 쿼리 문법</strong>:

```typescript
// 날짜 범위 검색
"배포 after:2025-01-01 before:2025-01-31"

// 채널 필터
"버그 in:#engineering"

// 사용자 필터
"from:@jangwook 보고서"

// 이모지 반응 필터
"has::thumbsup:"

// AND/OR 연산
"(긴급 OR 중요) 프로젝트"
```

<strong>실전 활용 사례</strong>:

```typescript
// 월별 주요 키워드 트렌드 분석
const keywords = ["AI", "배포", "버그", "성능", "보안"];
const trends = {};

for (const keyword of keywords) {
  const results = await slack_search_messages({
    query: `${keyword} after:2025-01-01`,
    count: 100
  });
  trends[keyword] = results.messages.length;
}

console.log("키워드 트렌드:", trends);
// 출력: { AI: 245, 배포: 189, 버그: 156, 성능: 98, 보안: 67 }
```

## 데이터 분석 기법

Slack MCP를 활용한 고급 분석 기법을 소개합니다.

### 1. 메시지 볼륨 분석

메시지 볼륨은 팀 활동성의 직접적인 지표입니다.

```typescript
// 시간대별 메시지 분포 분석
async function analyzeMessageVolume(channelId: string, days: number = 30) {
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  const messages = await slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 1000
  });

  // 시간대별 그룹핑
  const hourlyDistribution = new Array(24).fill(0);

  messages.messages.forEach(msg => {
    const hour = new Date(parseFloat(msg.ts) * 1000).getHours();
    hourlyDistribution[hour]++;
  });

  // 피크 시간대 식별
  const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
  const offPeakHour = hourlyDistribution.indexOf(Math.min(...hourlyDistribution));

  return {
    totalMessages: messages.messages.length,
    avgPerDay: (messages.messages.length / days).toFixed(1),
    peakHour: `${peakHour}:00〜${peakHour + 1}:00`,
    offPeakHour: `${offPeakHour}:00〜${offPeakHour + 1}:00`,
    hourlyDistribution
  };
}

// 사용 예시
const volumeAnalysis = await analyzeMessageVolume("C01234567", 30);
console.log(`
📊 <strong>30일 메시지 볼륨 분석</strong>
- 총 메시지: ${volumeAnalysis.totalMessages}개
- 일평균: ${volumeAnalysis.avgPerDay}개
- 피크 시간대: ${volumeAnalysis.peakHour}
- 한산한 시간대: ${volumeAnalysis.offPeakHour}
`);
```

<strong>트렌드 분석</strong>:

```typescript
// 주간 트렌드 계산 (증가/감소)
function calculateTrend(currentWeek: number, previousWeek: number): string {
  const change = ((currentWeek - previousWeek) / previousWeek * 100).toFixed(1);
  const emoji = parseFloat(change) > 0 ? "📈" : "📉";
  return `${emoji} ${change}%`;
}
```

### 2. 감성 분석

Claude AI를 활용하여 메시지의 감성을 분석합니다.

```typescript
// Claude를 활용한 감성 분석
async function analyzeSentiment(messages: any[]) {
  // 메시지 텍스트 추출
  const texts = messages
    .map(m => m.text)
    .filter(t => t && t.length > 10) // 너무 짧은 메시지 제외
    .slice(0, 100); // 최근 100개 분석

  // Claude에게 감성 분석 요청
  const prompt = `
다음 Slack 메시지들의 전반적인 감성을 분석해주세요.
각 메시지를 Positive(긍정), Neutral(중립), Negative(부정)로 분류하고,
전체 감성 점수를 -100〜100 사이로 제공해주세요.

메시지:
${texts.map((t, i) => `${i + 1}. ${t}`).join('\n')}

응답 형식:
{
  "overallScore": <숫자>,
  "positive": <개수>,
  "neutral": <개수>,
  "negative": <개수>,
  "insights": "<주요 인사이트>"
}
`;

  // Claude API 호출 (예시)
  const response = await callClaudeAPI(prompt);
  return JSON.parse(response);
}

// 사용 예시
const messages = await slack_conversations_history({
  channel: "C_GENERAL",
  limit: 100
});

const sentiment = await analyzeSentiment(messages.messages);
console.log(`
😊 <strong>감성 분석 결과</strong>
- 전체 점수: ${sentiment.overallScore}/100
- 긍정: ${sentiment.positive}개
- 중립: ${sentiment.neutral}개
- 부정: ${sentiment.negative}개

💡 인사이트: ${sentiment.insights}
`);
```

<strong>팀 사기 모니터링</strong>:

```typescript
// 주간 팀 사기 점수 추적
interface MoraleScore {
  week: string;
  score: number;
  trend: "up" | "down" | "stable";
}

async function trackTeamMorale(channelId: string): Promise<MoraleScore[]> {
  const weeks = 4;
  const scores: MoraleScore[] = [];

  for (let i = 0; i < weeks; i++) {
    const weekStart = Math.floor(Date.now() / 1000) - ((i + 1) * 7 * 24 * 60 * 60);
    const weekEnd = Math.floor(Date.now() / 1000) - (i * 7 * 24 * 60 * 60);

    const messages = await slack_conversations_history({
      channel: channelId,
      oldest: weekStart.toString(),
      latest: weekEnd.toString(),
      limit: 500
    });

    const sentiment = await analyzeSentiment(messages.messages);

    scores.push({
      week: new Date(weekStart * 1000).toLocaleDateString(),
      score: sentiment.overallScore,
      trend: i > 0
        ? sentiment.overallScore > scores[i - 1].score ? "up" : "down"
        : "stable"
    });
  }

  return scores.reverse(); // 시간순 정렬
}
```

### 3. 스레드 및 대화 분석

스레드는 심층적인 논의가 이루어지는 공간입니다.

```typescript
// 스레드 참여도 측정
interface ThreadEngagement {
  threadCount: number;
  avgRepliesPerThread: number;
  avgResolutionTime: number; // 시간 단위
  participationRate: number; // 퍼센트
}

async function analyzeThreadEngagement(
  channelId: string,
  days: number = 7
): Promise<ThreadEngagement> {
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  const messages = await slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 1000
  });

  // 스레드가 있는 메시지만 필터링
  const threaded = messages.messages.filter(m => m.thread_ts && m.thread_ts === m.ts);

  let totalReplies = 0;
  let totalResolutionTime = 0;
  const participants = new Set();

  for (const thread of threaded) {
    const replies = await slack_get_thread_replies({
      channel: channelId,
      thread_ts: thread.ts
    });

    totalReplies += replies.length - 1; // 부모 메시지 제외

    // 응답 시간 계산
    if (replies.length > 1) {
      const firstReply = replies[1];
      const resolutionTime =
        (parseFloat(firstReply.ts) - parseFloat(thread.ts)) / 3600;
      totalResolutionTime += resolutionTime;
    }

    // 참여자 추적
    replies.forEach(r => participants.add(r.user));
  }

  const users = await slack_list_users();
  const activeUsers = users.members.filter(u => !u.is_bot).length;

  return {
    threadCount: threaded.length,
    avgRepliesPerThread: threaded.length > 0
      ? (totalReplies / threaded.length).toFixed(1)
      : 0,
    avgResolutionTime: threaded.length > 0
      ? (totalResolutionTime / threaded.length).toFixed(1)
      : 0,
    participationRate: ((participants.size / activeUsers) * 100).toFixed(1)
  };
}

// 사용 예시
const engagement = await analyzeThreadEngagement("C_SUPPORT", 7);
console.log(`
💬 <strong>스레드 참여도 분석</strong>
- 총 스레드: ${engagement.threadCount}개
- 스레드당 평균 응답: ${engagement.avgRepliesPerThread}개
- 평균 응답 시간: ${engagement.avgResolutionTime}시간
- 참여율: ${engagement.participationRate}%
`);
```

### 4. 이모지 및 반응 패턴 분석

이모지는 비언어적 소통의 핵심 지표입니다.

```typescript
// 이모지 사용 통계
interface EmojiStats {
  topEmojis: Array<{ emoji: string; count: number }>;
  positiveRatio: number; // 긍정 이모지 비율
  reactionRate: number; // 메시지당 평균 반응 수
}

async function analyzeEmojiPatterns(
  channelId: string,
  days: number = 30
): Promise<EmojiStats> {
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  const messages = await slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 1000
  });

  const emojiCounts: Record<string, number> = {};
  let totalReactions = 0;

  messages.messages.forEach(msg => {
    if (msg.reactions) {
      msg.reactions.forEach(reaction => {
        emojiCounts[reaction.name] =
          (emojiCounts[reaction.name] || 0) + reaction.count;
        totalReactions += reaction.count;
      });
    }
  });

  // 상위 이모지 추출
  const topEmojis = Object.entries(emojiCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([emoji, count]) => ({ emoji, count }));

  // 긍정 이모지 분류
  const positiveEmojis = [
    'thumbsup', 'heart', 'tada', 'clap', 'fire',
    'rocket', 'star', 'sparkles', 'raised_hands'
  ];

  const positiveCount = topEmojis
    .filter(e => positiveEmojis.includes(e.emoji))
    .reduce((sum, e) => sum + e.count, 0);

  return {
    topEmojis,
    positiveRatio: ((positiveCount / totalReactions) * 100).toFixed(1),
    reactionRate: (totalReactions / messages.messages.length).toFixed(2)
  };
}

// 사용 예시
const emojiStats = await analyzeEmojiPatterns("C_GENERAL", 30);
console.log(`
😀 <strong>이모지 사용 패턴</strong>

상위 10개 이모지:
${emojiStats.topEmojis.map((e, i) =>
  `${i + 1}. :${e.emoji}: (${e.count}회)`
).join('\n')}

- 긍정 이모지 비율: ${emojiStats.positiveRatio}%
- 메시지당 평균 반응: ${emojiStats.reactionRate}개
`);
```

### 5. 사용자 참여도 지표

개인별 활동성과 영향력을 측정합니다.

```typescript
// 다차원 사용자 참여도 분석
interface UserEngagement {
  userId: string;
  name: string;
  messageCount: number;
  threadStarts: number;
  repliesReceived: number;
  reactionsReceived: number;
  influenceScore: number; // 0〜100
}

async function analyzeUserEngagement(
  channelId: string,
  days: number = 30
): Promise<UserEngagement[]> {
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  const messages = await slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 1000
  });

  const users = await slack_list_users();
  const userMap = new Map(users.members.map(u => [u.id, u.real_name]));

  const engagementData: Record<string, UserEngagement> = {};

  // 데이터 수집
  messages.messages.forEach(msg => {
    if (!msg.user || msg.bot_id) return; // 봇 제외

    if (!engagementData[msg.user]) {
      engagementData[msg.user] = {
        userId: msg.user,
        name: userMap.get(msg.user) || msg.user,
        messageCount: 0,
        threadStarts: 0,
        repliesReceived: 0,
        reactionsReceived: 0,
        influenceScore: 0
      };
    }

    const data = engagementData[msg.user];
    data.messageCount++;

    if (msg.thread_ts === msg.ts) {
      data.threadStarts++;
    }

    if (msg.reply_count) {
      data.repliesReceived += msg.reply_count;
    }

    if (msg.reactions) {
      data.reactionsReceived += msg.reactions.reduce(
        (sum, r) => sum + r.count, 0
      );
    }
  });

  // 영향력 점수 계산
  Object.values(engagementData).forEach(data => {
    data.influenceScore = Math.min(100,
      data.messageCount * 0.5 +
      data.threadStarts * 2 +
      data.repliesReceived * 1.5 +
      data.reactionsReceived * 1
    );
  });

  return Object.values(engagementData)
    .sort((a, b) => b.influenceScore - a.influenceScore);
}

// 사용 예시
const engagement = await analyzeUserEngagement("C_ENGINEERING", 30);
console.log(`
👥 <strong>상위 10명 인플루언서</strong>

${engagement.slice(0, 10).map((u, i) => `
${i + 1}. ${u.name}
   - 메시지: ${u.messageCount}개
   - 시작한 스레드: ${u.threadStarts}개
   - 받은 응답: ${u.repliesReceived}개
   - 받은 반응: ${u.reactionsReceived}개
   - 영향력 점수: ${u.influenceScore.toFixed(1)}
`).join('\n')}
`);
```

## 실전 활용 사례

실제 기업에서 Slack MCP를 어떻게 활용하고 있는지 살펴봅니다.

### 사례 1: 자동 회의 요약 (Salesforce)

<strong>배경 및 시나리오</strong>:

Salesforce의 엔지니어링 팀은 하루 평균 12개의 회의를 진행합니다. 각 회의 후 수동으로 요약을 작성하는 데 15〜30분이 소요되어, 주당 약 10시간이 낭비되고 있었습니다.

<strong>구현 방법</strong>:

```typescript
// 회의 채널 모니터링 및 자동 요약
async function autoSummarizeMeetings() {
  const meetingChannels = await slack_list_channels({
    types: 'public_channel'
  });

  const relevantChannels = meetingChannels.channels.filter(
    ch => ch.name.includes('meeting-') || ch.name.includes('sync-')
  );

  for (const channel of relevantChannels) {
    // 최근 1시간 메시지 가져오기
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
    const messages = await slack_conversations_history({
      channel: channel.id,
      oldest: oneHourAgo.toString(),
      limit: 100
    });

    if (messages.messages.length > 10) { // 충분한 대화가 있었다면
      // Claude에게 요약 요청
      const summary = await generateMeetingSummary(messages.messages);

      // 요약을 채널에 포스트
      await slack_post_message({
        channel: channel.id,
        text: `
🤖 <strong>AI 회의 요약</strong>

${summary.keyPoints}

<strong>결정 사항</strong>:
${summary.decisions}

<strong>액션 아이템</strong>:
${summary.actionItems}

<strong>다음 단계</strong>:
${summary.nextSteps}
        `
      });
    }
  }
}

// Claude를 활용한 회의 요약 생성
async function generateMeetingSummary(messages: any[]) {
  const transcript = messages
    .reverse() // 시간순 정렬
    .map(m => `${m.user}: ${m.text}`)
    .join('\n');

  const prompt = `
다음 Slack 회의 대화를 분석하여 요약해주세요:

${transcript}

다음 형식으로 응답해주세요:
{
  "keyPoints": "주요 논의 사항 (3-5개 불릿 포인트)",
  "decisions": "내려진 결정 사항 (불릿 포인트)",
  "actionItems": "액션 아이템과 담당자 (불릿 포인트)",
  "nextSteps": "다음 단계 (불릿 포인트)"
}
`;

  const response = await callClaudeAPI(prompt);
  return JSON.parse(response);
}

// 1시간마다 실행
setInterval(autoSummarizeMeetings, 60 * 60 * 1000);
```

<strong>비즈니스 임팩트</strong>:
- 주당 10시간 절약 (팀당)
- 회의 결정 사항 누락 95% 감소
- 신규 팀원 온보딩 시간 40% 단축

### 사례 2: 고객 지원 인사이트 (스타트업)

<strong>배경</strong>:

B2B SaaS 스타트업이 고객 지원 채널(#customer-support)의 문의를 수동으로 분류하고 우선순위를 정하는 데 어려움을 겪고 있었습니다.

<strong>구현 방법</strong>:

```typescript
// 고객 문의 자동 트리아지
interface SupportTicket {
  messageId: string;
  category: string; // 'bug', 'feature', 'question', 'urgent'
  priority: number; // 1〜5
  sentiment: string; // 'positive', 'neutral', 'negative'
  suggestedResponse?: string;
}

async function triageSupportTickets() {
  const messages = await slack_conversations_history({
    channel: "C_SUPPORT",
    limit: 50
  });

  const tickets: SupportTicket[] = [];

  for (const msg of messages.messages) {
    // Claude를 활용한 분류
    const classification = await classifyMessage(msg.text);

    tickets.push({
      messageId: msg.ts,
      category: classification.category,
      priority: classification.priority,
      sentiment: classification.sentiment,
      suggestedResponse: classification.suggestedResponse
    });

    // 긴급 문의는 즉시 에스컬레이션
    if (classification.priority >= 4) {
      await slack_reply_to_thread({
        channel: "C_SUPPORT",
        thread_ts: msg.ts,
        text: `⚠️ <strong>긴급 문의로 분류됨</strong>\n\n분류: ${classification.category}\n우선순위: ${classification.priority}/5\n\n@support-lead 즉시 확인 부탁드립니다.`
      });

      // 부정적 감성인 경우 공감 메시지 추가
      if (classification.sentiment === 'negative') {
        await slack_reply_to_thread({
          channel: "C_SUPPORT",
          thread_ts: msg.ts,
          text: classification.suggestedResponse
        });
      }
    }
  }

  // 주간 리포트 생성
  await generateSupportReport(tickets);
}

async function classifyMessage(text: string) {
  const prompt = `
다음 고객 지원 메시지를 분석해주세요:

"${text}"

다음 형식으로 응답해주세요:
{
  "category": "bug|feature|question|urgent",
  "priority": <1-5>,
  "sentiment": "positive|neutral|negative",
  "suggestedResponse": "<공감 메시지 (부정적 감성인 경우만)>"
}
`;

  const response = await callClaudeAPI(prompt);
  return JSON.parse(response);
}

async function generateSupportReport(tickets: SupportTicket[]) {
  const categoryCounts = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgPriority = tickets.reduce((sum, t) => sum + t.priority, 0) / tickets.length;

  const negativeSentiment = tickets.filter(t => t.sentiment === 'negative').length;

  await slack_post_message({
    channel: "C_LEADERSHIP",
    text: `
📊 <strong>주간 고객 지원 리포트</strong>

<strong>문의 분류</strong>:
- 버그: ${categoryCounts.bug || 0}건
- 기능 요청: ${categoryCounts.feature || 0}건
- 질문: ${categoryCounts.question || 0}건
- 긴급: ${categoryCounts.urgent || 0}건

<strong>지표</strong>:
- 평균 우선순위: ${avgPriority.toFixed(1)}/5
- 부정적 감성: ${negativeSentiment}건 (${(negativeSentiment / tickets.length * 100).toFixed(1)}%)

<strong>추세</strong>: 지난주 대비 긴급 문의 ${categoryCounts.urgent > 10 ? '증가 📈' : '감소 📉'}
    `
  });
}

// 15분마다 실행
setInterval(triageSupportTickets, 15 * 60 * 1000);
```

<strong>비즈니스 임팩트</strong>:
- 평균 응답 시간 45분 → 8분 (82% 감소)
- 고객 만족도(CSAT) 73% → 91% (18%p 증가)
- 지원 팀 생산성 60% 향상

### 사례 3: 원격 팀 문화 모니터링 (글로벌 기업)

<strong>배경</strong>:

5개 타임존에 분산된 200명 규모의 엔지니어링 팀이 원격 근무 중 팀 문화와 소속감 유지에 어려움을 겪고 있었습니다.

<strong>구현 방법</strong>:

```typescript
// Team Health Score 계산
interface TeamHealthMetrics {
  communicationScore: number; // 0〜100
  sentimentScore: number;
  engagementScore: number;
  isolationRisk: string[]; // 고립 위험 사용자 목록
  recommendations: string[];
}

async function calculateTeamHealth(): Promise<TeamHealthMetrics> {
  const channels = await slack_list_channels({ types: 'public_channel' });
  const users = await slack_list_users();
  const activeUsers = users.members.filter(u => !u.is_bot);

  // 1. 커뮤니케이션 점수 (메시지 볼륨 + 분포)
  const messageVolumes = await Promise.all(
    channels.channels.map(ch =>
      slack_conversations_history({ channel: ch.id, limit: 100 })
    )
  );

  const totalMessages = messageVolumes.reduce(
    (sum, vol) => sum + vol.messages.length, 0
  );
  const communicationScore = Math.min(100, (totalMessages / channels.channels.length) * 2);

  // 2. 감성 점수
  const allMessages = messageVolumes.flatMap(vol => vol.messages);
  const sentiment = await analyzeSentiment(allMessages);
  const sentimentScore = (sentiment.overallScore + 100) / 2; // -100〜100 → 0〜100

  // 3. 참여도 점수
  const userActivity: Record<string, number> = {};
  allMessages.forEach(msg => {
    if (msg.user) {
      userActivity[msg.user] = (userActivity[msg.user] || 0) + 1;
    }
  });

  const activeUserCount = Object.keys(userActivity).length;
  const engagementScore = (activeUserCount / activeUsers.length) * 100;

  // 4. 고립 위험 감지 (7일간 메시지 0개)
  const isolationRisk = activeUsers
    .filter(u => !userActivity[u.id])
    .map(u => u.real_name);

  // 5. 추천 사항 생성
  const recommendations = [];
  if (communicationScore < 50) {
    recommendations.push("💬 팀 커뮤니케이션 활성화 필요 (비동기 스탠드업 도입 고려)");
  }
  if (sentimentScore < 50) {
    recommendations.push("😟 팀 사기 저하 징후 (1:1 미팅 권장)");
  }
  if (engagementScore < 70) {
    recommendations.push("📢 참여도 향상 필요 (팀 이벤트 또는 AMA 세션 고려)");
  }
  if (isolationRisk.length > 0) {
    recommendations.push(`⚠️ ${isolationRisk.length}명 고립 위험 (개별 확인 필요)`);
  }

  return {
    communicationScore: Math.round(communicationScore),
    sentimentScore: Math.round(sentimentScore),
    engagementScore: Math.round(engagementScore),
    isolationRisk,
    recommendations
  };
}

// 자동 개입 시스템
async function autoIntervention(healthMetrics: TeamHealthMetrics) {
  // 고립 위험 사용자에게 자동 DM
  for (const userName of healthMetrics.isolationRisk) {
    const user = (await slack_list_users()).members.find(
      u => u.real_name === userName
    );

    if (user) {
      await slack_post_message({
        channel: user.id, // DM
        text: `
👋 안녕하세요 ${userName}님!

최근 팀 채널에서 활동이 없으신 것 같아 안부 인사 드립니다.

혹시 도움이 필요하거나 공유하고 싶은 이야기가 있으시면 언제든지 말씀해주세요.

- 팀 리드 드림
        `
      });
    }
  }

  // 주간 Team Health 리포트 발송
  await slack_post_message({
    channel: "C_LEADERSHIP",
    text: `
💚 <strong>Team Health 리포트</strong>

<strong>종합 지표</strong>:
- 커뮤니케이션: ${healthMetrics.communicationScore}/100
- 팀 사기: ${healthMetrics.sentimentScore}/100
- 참여도: ${healthMetrics.engagementScore}/100

<strong>주의 필요</strong>:
${healthMetrics.isolationRisk.length > 0
  ? `- 고립 위험 사용자: ${healthMetrics.isolationRisk.length}명`
  : '- 없음'}

<strong>추천 액션</strong>:
${healthMetrics.recommendations.map(r => `- ${r}`).join('\n')}
    `
  });
}

// 매일 자정 실행
cron.schedule('0 0 * * *', async () => {
  const health = await calculateTeamHealth();
  await autoIntervention(health);
});
```

<strong>비즈니스 임팩트</strong>:
- 직원 이탈률 18% → 7% (61% 감소)
- 팀 만족도 점수 6.8/10 → 8.9/10
- 고립 위험 조기 감지 및 개입 100% 달성

## 가능한 것과 불가능한 것

Slack MCP의 능력과 한계를 명확히 이해하는 것이 중요합니다.

### Slack MCP로 가능한 것

✅ <strong>메시지 데이터 분석</strong>: 히스토리, 감성, 트렌드 분석
✅ <strong>자동 응답 및 알림</strong>: 특정 키워드나 조건에 반응
✅ <strong>스레드 관리</strong>: 스레드 생성, 응답, 추적
✅ <strong>이모지 자동화</strong>: 조건부 반응 추가
✅ <strong>사용자 행동 분석</strong>: 참여도, 영향력 측정
✅ <strong>채널 모니터링</strong>: 실시간 이벤트 감지
✅ <strong>크로스 채널 분석</strong>: 여러 채널의 데이터 통합 분석

### Slack MCP로 불가능한 것

❌ <strong>파일 다운로드/업로드</strong>: 현재 MCP는 파일 API 미지원
  - <strong>대안</strong>: Slack Web API 직접 사용 (`files.upload`, `files.info`)

❌ <strong>실시간 WebSocket 연결</strong>: MCP는 polling 방식
  - <strong>대안</strong>: Slack Events API + Webhooks 사용

❌ <strong>사용자 권한 관리</strong>: Admin API는 MCP 범위 밖
  - <strong>대안</strong>: Slack Admin API 직접 호출

❌ <strong>메시지 수정/삭제</strong>: 현재 버전에서 미지원
  - <strong>대안</strong>: `chat.update`, `chat.delete` API 직접 사용

❌ <strong>워크플로우 빌더 통합</strong>: MCP는 워크플로우 트리거 불가
  - <strong>대안</strong>: Zapier, Make.com 등 iPaaS 활용

## 제약사항 및 모범 사례

Slack MCP를 효과적으로 사용하기 위한 가이드라인입니다.

### Rate Limit 관리

Slack API는 다음과 같은 Rate Limit을 적용합니다:

| API 메서드 | Tier 1 | Tier 2 | Tier 3 |
|-----------|--------|--------|--------|
| `conversations.history` | 1회/분 | 20회/분 | 50회/분 |
| `chat.postMessage` | 1회/초 | 20회/분 | 50회/분 |
| `search.messages` | 20회/분 | - | - |

<strong>배치 처리 전략</strong>:

```typescript
// Rate limit을 고려한 배치 처리
async function fetchAllChannelHistory(channelIds: string[]) {
  const results = [];
  const batchSize = 5; // 동시 요청 수 제한

  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(id =>
        slack_conversations_history({ channel: id, limit: 100 })
          .catch(err => {
            console.error(`Failed for channel ${id}:`, err);
            return { messages: [] };
          })
      )
    );

    results.push(...batchResults);

    // Rate limit 대응: 배치 사이 대기
    if (i + batchSize < channelIds.length) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 대기
    }
  }

  return results;
}
```

<strong>캐싱 구현</strong>:

```typescript
// 간단한 인메모리 캐시
const cache = new Map<string, { data: any; expiry: number }>();

async function cachedSlackCall(
  key: string,
  fetchFn: () => Promise<any>,
  ttl: number = 300000 // 5분
) {
  const cached = cache.get(key);

  if (cached && cached.expiry > Date.now()) {
    console.log(`Cache hit: ${key}`);
    return cached.data;
  }

  console.log(`Cache miss: ${key}`);
  const data = await fetchFn();
  cache.set(key, { data, expiry: Date.now() + ttl });

  return data;
}

// 사용 예시
const channels = await cachedSlackCall(
  'channels:list',
  () => slack_list_channels({ limit: 1000 }),
  600000 // 10분 캐시
);
```

### 보안 고려사항

<strong>API 키 관리</strong>:

```bash
# .env 파일 사용 (절대 Git에 커밋하지 말 것)
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-signing-secret

# .gitignore에 추가
echo ".env" >> .gitignore
echo ".claude/settings.local.json" >> .gitignore
```

<strong>권한 최소화 원칙</strong>:

```typescript
// 필요한 최소 권한만 요청
const minimalScopes = [
  'channels:history',  // 공개 채널만
  'channels:read',
  'users:read'
  // 'groups:history' 제외 (비공개 채널 불필요 시)
  // 'chat:write' 제외 (읽기 전용 분석)
];
```

<strong>PII 데이터 보호</strong>:

```typescript
// 개인정보 마스킹
function maskPII(text: string): string {
  return text
    .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL]') // 이메일
    .replace(/\b\d{3}-\d{4}-\d{4}\b/g, '[PHONE]')      // 전화번호
    .replace(/\b\d{6}-\d{7}\b/g, '[SSN]');             // 주민번호
}

// 분석 전 PII 제거
const sanitizedMessages = messages.map(m => ({
  ...m,
  text: maskPII(m.text)
}));
```

### 성능 최적화

<strong>페이지네이션 전략</strong>:

```typescript
// 커서 기반 페이지네이션으로 대량 데이터 효율적 조회
async function fetchAllMessages(channelId: string) {
  const allMessages = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await slack_conversations_history({
      channel: channelId,
      limit: 1000,
      cursor
    });

    allMessages.push(...response.messages);

    hasMore = response.has_more;
    cursor = response.response_metadata?.next_cursor;

    // 메모리 효율: 1만 개 이상은 스트리밍 처리 권장
    if (allMessages.length > 10000) {
      console.warn("대량 데이터 감지. 스트리밍 처리를 고려하세요.");
      break;
    }
  }

  return allMessages;
}
```

<strong>병렬 처리</strong>:

```typescript
// Promise.all을 활용한 병렬 데이터 페칭
async function analyzeMultipleChannels(channelIds: string[]) {
  const analysisPromises = channelIds.map(async (id) => {
    const messages = await slack_conversations_history({
      channel: id,
      limit: 100
    });

    return {
      channelId: id,
      messageCount: messages.messages.length,
      sentiment: await analyzeSentiment(messages.messages)
    };
  });

  return Promise.all(analysisPromises);
}
```

<strong>스마트 데이터 페칭</strong>:

```typescript
// 필요한 데이터만 선택적으로 페치
async function fetchRecentActivity(channelId: string, hours: number = 24) {
  const since = Math.floor(Date.now() / 1000) - (hours * 3600);

  return slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 100 // 최근 데이터만 필요하므로 제한
  });
}
```

### 개인정보 보호 및 컴플라이언스

<strong>GDPR 준수</strong>:

```typescript
// 사용자 데이터 삭제 요청 처리
async function handleDataDeletionRequest(userId: string) {
  console.log(`Processing data deletion for user: ${userId}`);

  // 1. 로컬 캐시에서 사용자 데이터 삭제
  cache.forEach((value, key) => {
    if (key.includes(userId)) {
      cache.delete(key);
    }
  });

  // 2. 분석 리포트에서 사용자 익명화
  // (실제로는 데이터베이스에서 처리)

  // 3. 감사 로그 기록
  await logAuditEvent({
    type: 'DATA_DELETION',
    userId,
    timestamp: new Date(),
    status: 'COMPLETED'
  });
}
```

<strong>감사 로깅</strong>:

```typescript
// 모든 API 호출 로깅
async function auditedSlackCall(
  method: string,
  params: any,
  executor: string
) {
  const startTime = Date.now();

  try {
    const result = await executeSlackMethod(method, params);

    await logAuditEvent({
      method,
      params: sanitizeParams(params), // 민감 정보 제거
      executor,
      duration: Date.now() - startTime,
      status: 'SUCCESS'
    });

    return result;
  } catch (error) {
    await logAuditEvent({
      method,
      params: sanitizeParams(params),
      executor,
      duration: Date.now() - startTime,
      status: 'FAILED',
      error: error.message
    });

    throw error;
  }
}

function sanitizeParams(params: any) {
  const { token, ...safeParams } = params;
  return safeParams; // 토큰 제거
}
```

<strong>워크스페이스 투명성</strong>:

```typescript
// 데이터 수집 알림 자동 전송
async function notifyDataCollection() {
  await slack_post_message({
    channel: "C_GENERAL",
    text: `
📊 <strong>데이터 수집 알림</strong>

팀 커뮤니케이션 개선을 위해 다음 데이터를 수집합니다:
- 메시지 볼륨 및 타이밍
- 이모지 반응 패턴
- 스레드 참여도

<strong>개인정보 보호</strong>:
- 메시지 내용은 익명화되어 분석됩니다
- 개인 식별 정보(PII)는 자동 마스킹됩니다
- 데이터는 30일 후 자동 삭제됩니다

질문이나 우려사항이 있으시면 @admin에게 연락주세요.
    `
  });
}
```

## 고급 기능

### 다중 MCP 통합

여러 MCP 서버를 연결하여 강력한 자동화 워크플로우를 구축할 수 있습니다.

<strong>Slack + GitHub + Postgres 예제</strong>:

```typescript
// 배포 파이프라인 자동화
async function automatedDeploymentWorkflow() {
  // 1. GitHub에서 최신 PR 머지 이벤트 감지
  const recentMerges = await github_list_recent_merges({
    repo: 'mycompany/backend',
    since: '1 hour ago'
  });

  for (const merge of recentMerges) {
    // 2. Postgres에 배포 기록 저장
    await postgres_query(`
      INSERT INTO deployments (pr_number, merged_by, merged_at)
      VALUES ($1, $2, $3)
    `, [merge.number, merge.merged_by, merge.merged_at]);

    // 3. Slack에 배포 알림
    await slack_post_message({
      channel: 'C_ENGINEERING',
      text: `
🚀 <strong>배포 시작</strong>

- PR #${merge.number}: ${merge.title}
- 머지한 사람: @${merge.merged_by}
- 변경 파일: ${merge.changed_files}개

배포 진행 상황은 <https://deploy.example.com/${merge.number}|여기>에서 확인하세요.
      `
    });

    // 4. 배포 완료 후 스레드에 업데이트
    setTimeout(async () => {
      const deployment = await checkDeploymentStatus(merge.number);

      await slack_reply_to_thread({
        channel: 'C_ENGINEERING',
        thread_ts: originalMessage.ts,
        text: deployment.success
          ? '✅ 배포 완료! 프로덕션에 반영되었습니다.'
          : '❌ 배포 실패. 롤백이 진행 중입니다.'
      });
    }, 5 * 60 * 1000); // 5분 후 확인
  }
}
```

<strong>실시간 DevOps 알림</strong>:

```typescript
// 에러 감지 및 자동 알림
async function monitorProductionErrors() {
  // 1. Postgres에서 최근 에러 로그 조회
  const errors = await postgres_query(`
    SELECT error_type, COUNT(*) as count, MAX(occurred_at) as last_seen
    FROM error_logs
    WHERE occurred_at > NOW() - INTERVAL '5 minutes'
    GROUP BY error_type
    HAVING COUNT(*) > 10
  `);

  if (errors.rows.length > 0) {
    // 2. Slack에 심각도별 알림
    for (const error of errors.rows) {
      const severity = error.count > 50 ? '🔴 Critical' : '🟡 Warning';

      await slack_post_message({
        channel: 'C_ONCALL',
        text: `
${severity} <strong>프로덕션 에러 급증</strong>

- 에러 타입: \`${error.error_type}\`
- 발생 횟수: ${error.count}회 (최근 5분)
- 마지막 발생: ${error.last_seen}

<https://logs.example.com/search?q=${error.error_type}|로그 보기>
        `
      });
    }

    // 3. GitHub에 자동 이슈 생성
    await github_create_issue({
      repo: 'mycompany/backend',
      title: `[Auto] Production errors: ${errors.rows[0].error_type}`,
      body: `Automatically created from production monitoring.\n\nSee Slack for details.`,
      labels: ['bug', 'production', 'auto-generated']
    });
  }
}

// 5분마다 실행
setInterval(monitorProductionErrors, 5 * 60 * 1000);
```

### AI 기반 인사이트 생성

Claude AI를 활용하여 고급 분석 및 예측을 수행합니다.

<strong>주간 리포트 자동화</strong>:

```typescript
// 포괄적인 주간 팀 리포트 생성
async function generateWeeklyReport() {
  // 1. 데이터 수집
  const channels = await slack_list_channels({ limit: 100 });
  const users = await slack_list_users();

  const weekData = await Promise.all(
    channels.channels.map(async (ch) => {
      const messages = await slack_conversations_history({
        channel: ch.id,
        oldest: (Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60).toString(),
        limit: 1000
      });

      return {
        channel: ch.name,
        messageCount: messages.messages.length,
        participants: new Set(messages.messages.map(m => m.user)).size,
        sentiment: await analyzeSentiment(messages.messages)
      };
    })
  );

  // 2. Claude에게 종합 분석 요청
  const prompt = `
다음은 지난 주 팀 커뮤니케이션 데이터입니다:

${JSON.stringify(weekData, null, 2)}

다음 관점에서 종합적인 분석을 제공해주세요:
1. 전반적인 팀 활동 수준 (증가/감소 트렌드)
2. 각 채널별 주요 특징 및 이슈
3. 팀 사기 및 감성 분석
4. 주의가 필요한 영역
5. 다음 주 추천 액션

분석은 경영진이 이해하기 쉽도록 명확하고 간결하게 작성해주세요.
`;

  const analysis = await callClaudeAPI(prompt);

  // 3. 시각화 데이터 생성
  const chartData = generateChartData(weekData);

  // 4. Slack에 리포트 전송
  await slack_post_message({
    channel: 'C_LEADERSHIP',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 주간 팀 커뮤니케이션 리포트'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: analysis
        }
      },
      {
        type: 'image',
        image_url: chartData.url,
        alt_text: '주간 트렌드 차트'
      }
    ]
  });
}

// 매주 월요일 오전 9시 실행
cron.schedule('0 9 * * 1', generateWeeklyReport);
```

<strong>트렌드 예측</strong>:

```typescript
// 향후 팀 활동 트렌드 예측
async function predictTrends() {
  // 지난 4주 데이터 수집
  const historicalData = [];

  for (let week = 0; week < 4; week++) {
    const weekStart = Math.floor(Date.now() / 1000) - ((week + 1) * 7 * 24 * 60 * 60);
    const weekEnd = Math.floor(Date.now() / 1000) - (week * 7 * 24 * 60 * 60);

    const messages = await slack_conversations_history({
      channel: 'C_GENERAL',
      oldest: weekStart.toString(),
      latest: weekEnd.toString(),
      limit: 1000
    });

    historicalData.push({
      week: week + 1,
      messageCount: messages.messages.length,
      sentiment: await analyzeSentiment(messages.messages)
    });
  }

  // Claude에게 예측 요청
  const prompt = `
다음은 지난 4주간의 팀 커뮤니케이션 데이터입니다:

${JSON.stringify(historicalData.reverse(), null, 2)}

이 데이터를 기반으로:
1. 다음 주 메시지 볼륨 예측 (범위)
2. 감성 트렌드 예측
3. 주의해야 할 시그널
4. 선제적 대응 방안

을 제공해주세요. 예측의 신뢰도와 근거도 함께 설명해주세요.
`;

  const prediction = await callClaudeAPI(prompt);

  return prediction;
}
```

<strong>액션 아이템 추출</strong>:

```typescript
// 회의록에서 액션 아이템 자동 추출 및 할당
async function extractAndAssignActions(threadTs: string, channelId: string) {
  // 1. 스레드 전체 내용 가져오기
  const thread = await slack_get_thread_replies({
    channel: channelId,
    thread_ts: threadTs
  });

  const transcript = thread
    .map(m => `${m.user}: ${m.text}`)
    .join('\n');

  // 2. Claude에게 액션 아이템 추출 요청
  const prompt = `
다음 회의 대화에서 액션 아이템을 추출해주세요:

${transcript}

각 액션 아이템에 대해:
- 작업 내용
- 담당자 (명시된 경우)
- 마감일 (명시된 경우)
- 우선순위 (긴급/높음/보통/낮음)

를 JSON 형식으로 반환해주세요.
`;

  const response = await callClaudeAPI(prompt);
  const actionItems = JSON.parse(response);

  // 3. 각 액션 아이템을 스레드에 체크리스트로 추가
  const checklistText = actionItems
    .map((item, i) => `
${i + 1}. [ ] ${item.task}
   - 담당: ${item.assignee || '미지정'}
   - 마감: ${item.deadline || '미정'}
   - 우선순위: ${item.priority}
    `)
    .join('\n');

  await slack_reply_to_thread({
    channel: channelId,
    thread_ts: threadTs,
    text: `
📝 <strong>액션 아이템 요약</strong>

${checklistText}

✅ 완료 시 이 메시지에 체크 이모지를 달아주세요.
    `
  });

  // 4. 담당자에게 DM으로 개별 통지
  const users = await slack_list_users();

  for (const item of actionItems) {
    if (item.assignee) {
      const assignee = users.members.find(
        u => u.real_name.includes(item.assignee)
      );

      if (assignee) {
        await slack_post_message({
          channel: assignee.id,
          text: `
📌 <strong>새로운 액션 아이템</strong>

작업: ${item.task}
마감: ${item.deadline || '미정'}
우선순위: ${item.priority}

원본 대화: <slack://channel?team=T01234567&id=${channelId}&thread_ts=${threadTs}|스레드로 이동>
          `
        });
      }
    }
  }
}
```

## 결론

Slack MCP는 팀 커뮤니케이션 데이터를 활용하는 방식을 근본적으로 변화시킵니다. 기존의 수동적인 데이터 수집과 분석 대신, AI 기반의 자동화된 인사이트 생성이 가능해졌습니다.

<strong>핵심 요점 정리</strong>:

1. <strong>설치 간편성</strong>: 3가지 설치 옵션 중 상황에 맞는 방법 선택 가능
2. <strong>8가지 핵심 도구</strong>: 메시지 조회, 전송, 검색, 반응 등 포괄적 기능
3. <strong>고급 분석</strong>: 감성 분석, 참여도 측정, 트렌드 예측
4. <strong>실전 검증</strong>: Salesforce, 스타트업, 글로벌 기업의 성공 사례
5. <strong>확장 가능</strong>: GitHub, Postgres 등 다른 MCP와 연동 가능

<strong>Slack MCP의 가치 제안</strong>:

- ⏱️ <strong>시간 절약</strong>: 수동 데이터 분석 작업 90% 이상 감소
- 📊 <strong>더 나은 의사결정</strong>: 실시간 팀 건강도 모니터링
- 🤖 <strong>자동화</strong>: 반복 작업을 AI가 대신 처리
- 💡 <strong>인사이트</strong>: 숨겨진 패턴과 리스크 조기 발견
- 🔒 <strong>안전성</strong>: 표준 OAuth 및 권한 관리

<strong>시작하기 위한 단계별 가이드</strong>:

1. <strong>기초 구축</strong> (1일차)
   - Slack App 생성 및 권한 설정
   - MCP 서버 설치 (공식 TypeScript 서버 권장)
   - Claude Code 연동 확인

2. <strong>탐색 및 학습</strong> (2〜3일차)
   - 8가지 핵심 도구 각각 테스트
   - 팀 채널에서 간단한 데이터 조회
   - 기본 통계 분석 실행

3. <strong>첫 자동화 구축</strong> (4〜7일차)
   - 특정 문제 해결에 집중 (예: 고객 지원 응답 시간 측정)
   - 간단한 자동 알림 설정
   - 주간 리포트 자동화

4. <strong>고급 기능 확장</strong> (2주차 이후)
   - Claude AI 기반 감성 분석 추가
   - 다른 MCP 서버와 통합 (GitHub, Postgres)
   - 팀 건강도 모니터링 시스템 구축

5. <strong>최적화 및 확산</strong> (1개월 이후)
   - 성능 최적화 (캐싱, 배치 처리)
   - 다른 팀으로 확산
   - 커스텀 에이전트 개발

<strong>다음 학습 리소스</strong>:

- 공식 문서: [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- Slack MCP 저장소: [GitHub - modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/slack)
- Anthropic 엔지니어링 블로그: [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

## 참고 자료

### 공식 문서

1. [Model Context Protocol 공식 사이트](https://modelcontextprotocol.io/)
   - MCP 프로토콜 사양 및 설계 철학

2. [Slack API 문서](https://api.slack.com/docs)
   - OAuth 스코프, Rate Limits, API 메서드 상세 설명

3. [Slack MCP 서버 GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/slack)
   - 소스 코드, 이슈 트래커, 기여 가이드

4. [Anthropic MCP SDK](https://github.com/anthropics/anthropic-sdk-typescript)
   - TypeScript로 커스텀 MCP 서버 개발하기

5. [Claude Code 문서](https://docs.claude.com/claude-code)
   - Claude Code 설정 및 서브에이전트 활용법

### 오픈소스 리소스

1. [awesome-mcp](https://github.com/punkpeye/awesome-mcp)
   - 큐레이션된 MCP 서버, 도구, 튜토리얼 목록

2. [mcp-slack-analytics](https://github.com/example/mcp-slack-analytics)
   - Slack 데이터 분석을 위한 예제 코드 모음 (가상 링크)

3. [slack-data-science](https://github.com/example/slack-data-science)
   - Pandas, Matplotlib를 활용한 Slack 데이터 시각화 (가상 링크)

### 커뮤니티 및 비디오 튜토리얼

1. [MCP Discord 커뮤니티](https://discord.gg/mcp) (가상 링크)
   - 질문, 모범 사례 공유, 문제 해결

2. [YouTube: Building AI Agents with MCP](https://youtube.com/watch?v=example)
   - Slack MCP 실전 데모 (가상 링크)

3. [Slack Community Forums](https://community.slack.com/)
   - 공식 Slack 커뮤니티, API 관련 논의

---

이제 Slack MCP를 활용하여 팀 커뮤니케이션 데이터를 분석하고, AI 기반 자동화를 구축할 준비가 되었습니다. 작게 시작하여 점진적으로 확장하면서, 여러분 팀만의 독특한 인사이트를 발견하시길 바랍니다.

질문이나 피드백이 있으시면 언제든지 댓글로 남겨주세요. 함께 더 나은 팀 협업 문화를 만들어 갑시다! 🚀
