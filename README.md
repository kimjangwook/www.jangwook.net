# www.jangwook.net

Astro 5.14 기반의 다국어 기술 블로그 및 포트폴리오 사이트

## 🌟 프로젝트 개요

개발자를 위한 종합 블로그 플랫폼으로, AI 자동화, SEO 최적화, 다국어 콘텐츠 관리를 핵심으로 합니다.

**핵심 특징**:

- 🌏 **다국어 지원**: 한국어, 영어, 일본어
- ⚡ **Islands Architecture**: Astro 기반 초고속 정적 사이트
- 🤖 **AI 자동화**: Claude Code 에이전트 시스템으로 콘텐츠 생성 및 관리
- 📊 **데이터 기반**: Google Analytics MCP 통합 분석
- 🎨 **자동 이미지 생성**: Gemini API 기반 히어로 이미지 자동 생성
- 🔍 **SEO 최적화**: 사이트맵, RSS, Open Graph, Twitter Cards

## 🚀 빠른 시작

### 필수 환경

- Node.js >= 18.0.0
- npm >= 9.0.0

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:4321)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 타입 체크
npm run astro check
```

## 📝 블로그 포스트 현황

**최신 포스트 날짜**: 2025-10-10
**총 포스트 수**: 7개 (한국어 기준)

### 공개된 포스트

1. **AI 에이전트 시스템 구축 실전 가이드: Notion API MCP와 Claude Code로 자동화 파이프라인 만들기** (2025-10-10)

   - Notion API MCP 통합으로 구축하는 엔터프라이즈급 AI 자동화 시스템

2. **AI를 활용한 반기별 발표 자료 작성 자동화** (2025-10-09)

   - 60시간 업무를 10시간으로 단축한 AI 자동화 프로세스

3. **Claude Code를 활용한 대규모 웹사이트 페이지 자동 생성** (2025-10-08)

   - 31개 HTML 페이지 자동 생성 사례

4. **Claude Code Best Practices** (2025-10-07)

   - Anthropic 공식 가이드 기반 생산성 극대화

5. **블로그 런칭 분석 리포트** (2025-10-06)

   - GA4 데이터 분석 및 3개월 성장 전략

6. **Google Analytics MCP 자동화** (2025-10-05)

   - MCP와 AI 에이전트로 블로그 분석 자동화

7. **LLM과 Claude Code를 활용한 블로그 자동화** (2025-10-04)
   - 11개 전문 에이전트로 블로그 완전 자동화

---

## 📅 향후 콘텐츠 플랜

### 정기 분석 리포트 (데이터 기반)

- **2025-10-14**: 블로그 런칭 일주일 후 분석 리포트
  - GA4 초기 데이터 분석 (트래픽 패턴, 주요 유입 경로, 디바이스/브라우저 분포)

- **2025-11-07**: 블로그 런칭 한달 후 분석 리포트
  - 월간 핵심 지표 달성률, 콘텐츠별 성과 순위, 사용자 여정 맵핑

- **2026-01-07**: 분기 회고 및 2026년 전략 수립
  - 3개월 성장 분석, 콘텐츠 효과성 평가, 신규 전략 수립

### 기술 심화 시리즈

1. **MCP Server 개발 실전 가이드**
   - 커스텀 MCP Server 개발부터 배포까지

2. **Chrome DevTools MCP로 웹 성능 최적화하기**
   - Core Web Vitals 측정 및 최적화 자동화

3. **Brave Search MCP로 AI 리서치 자동화**
   - 웹 검색 자동화 및 콘텐츠 큐레이션

4. **Playwright MCP로 웹 테스팅 자동화**
   - E2E 테스트 및 스크린샷 자동화

### 실전 프로젝트 시리즈

1. **Astro Islands Architecture 완벽 가이드**
   - 정적 사이트 최적화 및 Islands 패턴 활용

2. **다국어 블로그 SEO 최적화 전략**
   - 한국어, 영어, 일본어 콘텐츠 최적화 노하우

3. **Core Web Vitals 최적화 실전**
   - LCP, FID, CLS 개선 사례 및 측정 자동화

4. **블로그 댓글 시스템 구축 (Giscus)**
   - GitHub Discussions 기반 댓글 시스템 통합

### AI 에이전트 활용 사례

1. **AI 에이전트로 소셜 미디어 관리 자동화**
   - LinkedIn, Twitter(X) 자동 포스팅 파이프라인

2. **Claude Code로 포트폴리오 자동 업데이트**
   - GitHub 프로젝트 자동 분석 및 포트폴리오 반영

3. **AI 기반 콘텐츠 추천 시스템 구축**
   - 유사 포스트 추천 및 관련 링크 자동 생성

### 개발 생산성 팁

1. **.mcp.json 환경 변수 설정 가이드**
   - `alias='set -a && source .env && set +a && claude'` 활용법

2. **Claude Code 커스텀 슬래시 커맨드 만들기**
   - 반복 작업 자동화를 위한 커스텀 커맨드

3. **AI 코드 리뷰 자동화 워크플로우**
   - 품질 검증 자동화 및 베스트 프랙티스

## 🛠 기술 스택

### Core

- **Astro 5.14.1**: Islands Architecture 기반 정적 사이트 생성
- **TypeScript**: 타입 안전한 개발
- **Tailwind CSS**: 유틸리티 기반 스타일링

### Integrations

- **@astrojs/mdx**: JSX in Markdown 지원
- **@astrojs/sitemap**: 자동 사이트맵 생성
- **@astrojs/rss**: RSS 피드 자동 생성

### AI & Automation

- **Claude Code**: AI 코딩 어시스턴트
- **Model Context Protocol (MCP)**: 외부 데이터 소스 통합
  - Notion API
  - Google Analytics
  - Chrome DevTools
  - Context7 (라이브러리 문서)
  - Playwright (웹 자동화)
- **Gemini API**: 이미지 자동 생성

### Tools & Services

- **Google Analytics 4**: 트래픽 분석
- **GitHub Actions**: CI/CD 파이프라인

## 📂 프로젝트 구조

```
www.jangwook.net/
├── .claude/              # Claude Code 설정
│   ├── agents/          # 전문 에이전트 정의
│   │   ├── content-planner.md
│   │   ├── writing-assistant.md
│   │   ├── editor.md
│   │   ├── seo-optimizer.md
│   │   ├── analytics.md
│   │   └── ...
│   ├── commands/        # 커스텀 슬래시 커맨드
│   └── settings/        # MCP 권한 설정
├── src/
│   ├── assets/          # 정적 자산 (Astro 최적화)
│   │   └── blog/       # 블로그 이미지
│   ├── components/      # Astro 컴포넌트
│   │   ├── BaseHead.astro    # SEO 메타태그
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── BlogCard.astro
│   ├── content/         # Content Collections
│   │   └── blog/
│   │       ├── ko/      # 한국어 포스트
│   │       ├── en/      # 영어 포스트
│   │       └── ja/      # 일본어 포스트
│   ├── layouts/         # 페이지 레이아웃
│   │   ├── Base.astro
│   │   └── BlogPost.astro
│   ├── pages/          # 파일 기반 라우팅
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   └── rss.xml.js
│   ├── styles/         # 전역 CSS
│   ├── consts.ts       # 전역 상수
│   └── content.config.ts  # Content Collections 스키마
├── public/             # 정적 파일 (빌드 시 그대로 복사)
├── CLAUDE.md          # Claude Code 프로젝트 가이드
├── astro.config.mjs   # Astro 설정
└── package.json
```

## 🤖 AI 에이전트 시스템

### 전문 에이전트 (11개)

1. **content-planner**: 콘텐츠 전략 및 주제 계획
2. **writing-assistant**: 블로그 포스트 작성 지원
3. **editor**: 문법, 스타일, 메타데이터 검토
4. **site-manager**: Astro 빌드, 배포, 성능 최적화
5. **seo-optimizer**: 사이트맵, 메타태그, 내부 링크 최적화
6. **analytics**: 트래픽 분석 및 성과 측정
7. **social-media-manager**: 소셜 미디어 공유 자동화
8. **portfolio-curator**: 프로젝트 포트폴리오 관리
9. **learning-tracker**: 학습 목표 및 기술 트렌드 추적
10. **image-generator**: Gemini API 기반 이미지 생성
11. **technical-writer**: 기술 문서 작성 및 코드 설명

### 사용 예시

```bash
# Claude Code에서 에이전트 호출
@writing-assistant "TypeScript 5.0 기능에 대한 블로그 포스트 작성"
@seo-optimizer "최근 포스트들의 내부 링크 최적화"
@analytics "지난 달 블로그 트래픽 분석"
```

## 📝 블로그 포스트 작성 가이드

### 다국어 파일 구조

```
src/content/blog/
├── ko/post-title.md    # 한국어
├── en/post-title.md    # 영어
└── ja/post-title.md    # 일본어
```

**중요 규칙**:

- 모든 언어 버전은 **동일한 파일명** 사용
- **pubDate는 'YYYY-MM-DD' 형식**으로 작성 (작은따옴표 필수)
- heroImage는 모든 언어 버전에서 동일한 경로 사용

### Frontmatter 템플릿

```markdown
---
title: "포스트 제목 (60자 이하 권장)"
description: "SEO 최적화된 설명 (150-160자 권장)"
pubDate: "2025-10-10"
heroImage: "../../../assets/blog/image.jpg"
tags: ["tag1", "tag2", "tag3"] # 최대 3-5개 권장
---

# 포스트 내용

Markdown 또는 MDX 형식으로 작성...
```

### 자동 이미지 생성

```bash
# Gemini API로 히어로 이미지 생성
node generate_image.js src/assets/blog/hero.jpg "Modern tech blog hero image"

# 환경 변수 필요
# GEMINI_API_KEY=your_api_key
```

## 🔧 개발 가이드

### Content Collections 스키마

`src/content.config.ts`에서 정의:

```typescript
{
  title: string           // 필수
  description: string     // 필수
  pubDate: Date          // 필수 (자동 변환)
  updatedDate?: Date     // 선택
  heroImage?: ImageMetadata  // 선택
  tags?: string[]        // 선택
}
```

### 이미지 최적화

```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/image.jpg';
---

<!-- 자동 최적화 (WebP, 반응형) -->
<Image src={myImage} alt="설명" width={600} height={400} />
```

### 타입 체크

```bash
# 빌드 전 필수
npm run astro check
```

## 🌐 배포

### 빌드 프로세스

```bash
# 타입 체크 및 빌드
npm run astro check && npm run build

# 빌드 결과: ./dist/
# - 정적 HTML
# - 최적화된 자산
# - 사이트맵 (sitemap-index.xml)
```

### 호스팅

정적 사이트이므로 다음 플랫폼에서 호스팅 가능:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## 📊 성능

- **Lighthouse 스코어**: 100/100 (Performance)
- **빌드 시간**: ~2분 (이미지 최적화 포함)
- **페이지 로딩**: < 1초 (정적 HTML)

## 🤝 Contributing

### Commit Message Convention

```
<type>(<scope>): <subject>

Types:
- feat: 새 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 리팩토링
- perf: 성능 개선
- test: 테스트
- chore: 빌드, 설정
```

**예시**:

```bash
feat(blog): add claude code best practices post
fix(seo): correct og:image path
docs(readme): update project structure
```

### Branch Strategy

```
main              # 프로덕션
├── feature/*     # 새 기능
├── fix/*         # 버그 수정
└── docs/*        # 문서
```

## 📚 참고 자료

### 공식 문서

- [Astro 문서](https://docs.astro.build)
- [Claude Code 문서](https://docs.claude.com/claude-code)
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering)

### Best Practices

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [The Think Tool](https://www.anthropic.com/engineering/claude-think-tool)

## 📄 License

MIT License

## 👤 Author

**Jangwook**

- Website: [www.jangwook.net](https://www.jangwook.net)
- GitHub: [@jangwook](https://github.com/jangwook)

---

**Last Updated**: 2025-10-10 (최신 블로그 포스트 기준)

**Built with** ❤️ **using Astro & Claude Code**
