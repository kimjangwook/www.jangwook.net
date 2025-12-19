# Chapter 18: 다국어 콘텐츠 파이프라인

4개 언어 동시 콘텐츠 생성 시스템

---

## 개요

글로벌 시장을 겨냥한 콘텐츠 서비스는 다국어 지원이 필수입니다. 하지만 4개 언어(한국어, 영어, 일본어, 중국어)로 콘텐츠를 동시에 생성하고 관리하는 것은 복잡한 작업입니다. 단순히 번역하는 것을 넘어서 각 언어권의 문화적 맥락을 고려한 현지화(localization), 콘텐츠 일관성 유지, 품질 검증, 동기화 등 다양한 과제가 있습니다.

이 챕터에서는 Claude Code를 활용하여 다국어 콘텐츠 파이프라인을 구축하는 방법을 다룹니다. 단순한 번역 자동화가 아니라 언어별 SEO 최적화, 문화적 적합성 검증, 메타데이터 관리까지 포함한 종합적인 시스템을 만들어봅니다.

<strong>이 챕터에서 배울 내용:</strong>

- Content Collections 기반 다국어 구조 설계
- AI 기반 번역 에이전트 구현 (번역 vs 현지화)
- 품질 검증 자동화 (스키마 검증, SEO 체크, 문화적 적합성)
- 언어 간 동기화 및 일관성 유지 메커니즘
- 4개 언어 동시 발행 워크플로우

<strong>실전 프로젝트:</strong>

블로그 포스트를 한국어로 작성하면 자동으로 영어, 일본어, 중국어 버전이 생성되고, 각 언어별 SEO 최적화와 품질 검증을 거쳐 동시에 발행되는 시스템을 구축합니다.

---

## Recipe 18.1: 다국어 구조 설계

### 문제 (Problem)

4개 언어의 콘텐츠를 효율적으로 관리하려면 체계적인 디렉토리 구조와 메타데이터 스키마가 필요합니다. 다음과 같은 요구사항을 만족해야 합니다:

1. <strong>언어별 분리</strong>: 각 언어 콘텐츠는 독립적으로 관리되어야 함
2. <strong>일관된 식별자</strong>: 같은 콘텐츠의 언어 버전은 연결되어야 함
3. <strong>타입 안전성</strong>: TypeScript로 메타데이터 스키마 강제
4. <strong>SEO 최적화</strong>: 언어별 URL 구조 및 메타태그
5. <strong>확장 가능성</strong>: 새로운 언어 추가가 쉬워야 함

단순히 폴더를 나누는 것이 아니라 Astro Content Collections의 타입 시스템을 활용하여 컴파일 시점에 오류를 잡아내는 구조를 설계해야 합니다.

### 해결책 (Solution)

Astro Content Collections를 활용한 언어별 폴더 구조와 공통 스키마를 설계합니다.

<strong>Step 1: 디렉토리 구조 설계</strong>

```
src/content/blog/
├── ko/                 # 한국어 콘텐츠
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
├── en/                 # 영어 콘텐츠
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
├── ja/                 # 일본어 콘텐츠
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
└── zh/                 # 중국어(간체) 콘텐츠
    ├── post-1.md
    ├── post-2.md
    └── ...
```

<strong>핵심 원칙</strong>:
- <strong>동일한 파일명</strong>: 같은 콘텐츠는 모든 언어 폴더에서 동일한 파일명 사용 (예: `ko/post-1.md`, `en/post-1.md`)
- <strong>언어 코드는 폴더명</strong>: 파일명에 언어 코드를 붙이지 않음 (`post-1-ko.md` ✗)
- <strong>URL 자동 생성</strong>: `ko/post-1.md` → `/ko/blog/ko/post-1` (라우팅 구조상 언어 코드 중복은 정상)

<strong>Step 2: Content Collections 스키마 정의</strong>

`src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 지원 언어 타입
type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

// 블로그 컬렉션 스키마
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    // 필수 필드
    title: z.string()
      .min(10, "제목은 최소 10자 이상이어야 합니다")
      .max(60, "제목은 60자를 초과할 수 없습니다 (SEO)"),

    description: z.string()
      .min(50, "설명은 최소 50자 이상이어야 합니다")
      .max(160, "설명은 160자를 초과할 수 없습니다 (SEO)"),

    pubDate: z.coerce.date(),

    // 선택 필드
    updatedDate: z.coerce.date().optional(),

    heroImage: image().optional(),

    tags: z.array(z.string())
      .max(5, "태그는 최대 5개까지 허용됩니다")
      .optional(),

    // 다국어 관련 필드
    relatedPosts: z.array(z.object({
      slug: z.string(),
      score: z.number().min(0).max(1),
      reason: z.object({
        ko: z.string(),
        ja: z.string(),
        en: z.string(),
        zh: z.string(),
      }),
    })),

    // 번역 메타데이터 (선택)
    translation: z.object({
      sourceLanguage: z.enum(['ko', 'en', 'ja', 'zh']).optional(),
      translatedAt: z.coerce.date().optional(),
      reviewer: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { blog };
```

<strong>Step 3: 언어 감지 유틸리티 함수</strong>

`src/utils/i18n.ts`:

```typescript
import type { CollectionEntry } from 'astro:content';

export type Language = 'ko' | 'en' | 'ja' | 'zh';

/**
 * 포스트 ID에서 언어 코드 추출
 * @example "ko/post-1.md" → "ko"
 */
export function getLanguageFromId(id: string): Language {
  const lang = id.split('/')[0] as Language;
  if (!['ko', 'en', 'ja', 'zh'].includes(lang)) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  return lang;
}

/**
 * 포스트 ID에서 슬러그 추출 (언어 코드 제외)
 * @example "ko/post-1.md" → "post-1"
 */
export function getSlugFromId(id: string): string {
  return id.split('/')[1].replace(/\.md$/, '');
}

/**
 * 언어별 포스트 필터링
 */
export function filterByLanguage(
  posts: CollectionEntry<'blog'>[],
  lang: Language
): CollectionEntry<'blog'>[] {
  return posts.filter(post => getLanguageFromId(post.id) === lang);
}

/**
 * 같은 콘텐츠의 다른 언어 버전 찾기
 */
export function findTranslations(
  posts: CollectionEntry<'blog'>[],
  currentPost: CollectionEntry<'blog'>
): Record<Language, CollectionEntry<'blog'> | undefined> {
  const currentSlug = getSlugFromId(currentPost.id);
  const currentLang = getLanguageFromId(currentPost.id);

  const translations: Record<Language, CollectionEntry<'blog'> | undefined> = {
    ko: undefined,
    en: undefined,
    ja: undefined,
    zh: undefined,
  };

  for (const post of posts) {
    const slug = getSlugFromId(post.id);
    const lang = getLanguageFromId(post.id);

    if (slug === currentSlug && lang !== currentLang) {
      translations[lang] = post;
    }
  }

  return translations;
}

/**
 * 언어별 라벨 (UI에 표시)
 */
export const LANGUAGE_LABELS: Record<Language, { native: string; english: string }> = {
  ko: { native: '한국어', english: 'Korean' },
  en: { native: 'English', english: 'English' },
  ja: { native: '日本語', english: 'Japanese' },
  zh: { native: '简体中文', english: 'Chinese' },
};
```

<strong>Step 4: 언어 전환 컴포넌트</strong>

`src/components/LanguageSwitcher.astro`:

```astro
---
import { getCollection } from 'astro:content';
import { getLanguageFromId, getSlugFromId, findTranslations, LANGUAGE_LABELS, type Language } from '../utils/i18n';

interface Props {
  currentPostId: string;
}

const { currentPostId } = Astro.props;

// 모든 포스트 가져오기
const allPosts = await getCollection('blog');

// 현재 포스트 찾기
const currentPost = allPosts.find(p => p.id === currentPostId);
if (!currentPost) {
  throw new Error(`Post not found: ${currentPostId}`);
}

// 번역 버전 찾기
const translations = findTranslations(allPosts, currentPost);
const currentLang = getLanguageFromId(currentPost.id);
const currentSlug = getSlugFromId(currentPost.id);

// 사용 가능한 언어 목록
const availableLanguages: Language[] = ['ko', 'en', 'ja', 'zh'];
---

<div class="language-switcher">
  <span class="label">언어:</span>
  <div class="language-options">
    {availableLanguages.map(lang => {
      const isAvailable = lang === currentLang || translations[lang];
      const url = isAvailable
        ? `/${lang}/blog/${lang}/${currentSlug}`
        : null;

      return (
        <a
          href={url || '#'}
          class:list={[
            'language-option',
            { 'active': lang === currentLang },
            { 'disabled': !isAvailable }
          ]}
          aria-current={lang === currentLang ? 'page' : undefined}
          aria-disabled={!isAvailable}
        >
          {LANGUAGE_LABELS[lang].native}
        </a>
      );
    })}
  </div>
</div>

<style>
  .language-switcher {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #f9fafb;
  }

  .label {
    font-weight: 600;
    color: #374151;
  }

  .language-options {
    display: flex;
    gap: 0.5rem;
  }

  .language-option {
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    text-decoration: none;
    color: #4b5563;
    transition: all 0.2s;
  }

  .language-option:hover:not(.disabled) {
    background: #e5e7eb;
    color: #1f2937;
  }

  .language-option.active {
    background: #3b82f6;
    color: white;
    font-weight: 600;
  }

  .language-option.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
```

### 설명 (Explanation)

<strong>1. 왜 언어별 폴더 구조인가?</strong>

- <strong>명확한 분리</strong>: 각 언어 콘텐츠가 독립적으로 관리됨
- <strong>자동 언어 감지</strong>: 파일 경로만으로 언어 식별 가능 (`ko/post.md` → `ko`)
- <strong>URL 구조 일관성</strong>: `/ko/blog/ko/post`, `/en/blog/en/post` (SEO 친화적)
- <strong>Git 히스토리 추적</strong>: 언어별 변경사항 독립적으로 추적

<strong>2. Content Collections 스키마의 역할</strong>

- <strong>타입 안전성</strong>: 빌드 시점에 메타데이터 검증
- <strong>SEO 강제</strong>: `title` 60자, `description` 160자 제한
- <strong>필수 필드 보장</strong>: `title`, `description`, `pubDate` 누락 시 빌드 실패
- <strong>relatedPosts 4개 언어 필수</strong>: 모든 추천 포스트에 4개 언어 이유 강제

<strong>3. i18n 유틸리티 함수의 중요성</strong>

- <strong>`getLanguageFromId()`</strong>: 파일 경로 파싱 로직 중앙화
- <strong>`findTranslations()`</strong>: 같은 슬러그의 다른 언어 버전 자동 연결
- <strong>타입 안전성</strong>: `Language` 타입으로 오타 방지

<strong>4. 언어 전환 컴포넌트</strong>

- <strong>자동 감지</strong>: 현재 포스트의 번역 버전 자동으로 찾음
- <strong>사용 불가 표시</strong>: 번역이 없는 언어는 비활성화
- <strong>접근성</strong>: `aria-current`, `aria-disabled` 속성으로 스크린 리더 지원

### 변형 (Variations)

<strong>Variation 1: 언어별 기본 설정 (config.json)</strong>

각 언어 폴더에 설정 파일 추가:

```
src/content/blog/
├── ko/
│   ├── _config.json
│   └── *.md
├── en/
│   ├── _config.json
│   └── *.md
...
```

`ko/_config.json`:
```json
{
  "language": "ko",
  "locale": "ko-KR",
  "direction": "ltr",
  "dateFormat": "YYYY년 M월 D일",
  "seo": {
    "titleSuffix": " - 기술 블로그",
    "defaultDescription": "개발 관련 기술 블로그"
  }
}
```

<strong>Variation 2: Subpath vs Subdomain</strong>

현재 구조: `/ko/blog/ko/post` (Subpath)

대안 1 - Subdomain:
```
ko.example.com/blog/post
en.example.com/blog/post
```

대안 2 - Domain:
```
example.kr/blog/post  (한국어)
example.com/blog/post (영어)
```

<strong>선택 기준</strong>:
- <strong>Subpath</strong>: SEO 권한 공유, 관리 간편 (권장)
- <strong>Subdomain</strong>: 서버 분리, 독립적 운영
- <strong>Domain</strong>: 국가별 브랜딩, 최고 현지화

<strong>Variation 3: 언어 감지 미들웨어</strong>

사용자 브라우저 언어 자동 감지:

`src/middleware/language-redirect.ts`:
```typescript
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);

  // 루트 경로일 때만 리다이렉트
  if (url.pathname === '/') {
    const acceptLanguage = context.request.headers.get('accept-language');
    const preferredLang = parseAcceptLanguage(acceptLanguage);

    return context.redirect(`/${preferredLang}/blog`);
  }

  return next();
};

function parseAcceptLanguage(header: string | null): string {
  if (!header) return 'ko'; // 기본값

  const languages = header.split(',')
    .map(lang => {
      const [code, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', ''));
      return { code: code.split('-')[0], quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    if (['ko', 'en', 'ja', 'zh'].includes(code)) {
      return code;
    }
  }

  return 'ko'; // 기본값
}
```

---

## Recipe 18.2: 번역 에이전트 구현

### 문제 (Problem)

다국어 콘텐츠를 만들 때 가장 큰 과제는 <strong>번역(Translation)</strong>과 <strong>현지화(Localization)</strong>의 균형입니다.

<strong>단순 번역의 문제점</strong>:
- 기술 용어의 부자연스러운 번역 (예: "스레드" vs "쓰레드" vs "thread")
- 문화적 맥락 손실 (예: 한국 속담을 영어로 직역)
- SEO 키워드 불일치 (각 언어권 검색어 다름)
- 어조와 스타일 불일치 (격식체 vs 구어체)

<strong>필요한 기능</strong>:
1. 원문의 의도와 맥락 이해
2. 언어별 SEO 키워드 최적화
3. 문화적으로 적절한 표현 변환
4. 기술 용어 일관성 유지
5. 메타데이터(title, description, tags) 별도 최적화

### 해결책 (Solution)

Claude API를 활용한 "현지화 우선" 번역 에이전트를 구축합니다.

<strong>Step 1: 번역 에이전트 스킬 정의</strong>

`.claude/skills/translation-agent/SKILL.md`:

```markdown
# Translation Agent Skill

## Purpose
블로그 포스트를 4개 언어(ko, en, ja, zh)로 현지화하는 전문 번역 에이전트입니다.

## Core Principles

1. <strong>번역이 아닌 현지화</strong>
   - 단순 단어 대체가 아닌 의미 전달
   - 각 언어권 독자를 위한 재작성
   - 문화적 맥락 고려

2. <strong>SEO 최적화</strong>
   - 언어별 검색 키워드 리서치
   - title: 60자 이하, description: 150-160자
   - 각 언어권 검색 의도 반영

3. <strong>일관성 유지</strong>
   - 기술 용어는 glossary 참조
   - 브랜드명, 제품명은 원문 유지
   - 어조와 스타일 통일

## Translation Workflow

### Input
- 원문 마크다운 파일 (일반적으로 한국어)
- 대상 언어 (en, ja, zh)
- Glossary (선택)

### Output
- 번역된 마크다운 파일
- SEO 최적화된 메타데이터
- 번역 품질 리포트

### Process
1. 원문 분석 (주제, 대상 독자, 어조)
2. 언어별 SEO 키워드 조사
3. 메타데이터 현지화 (title, description, tags)
4. 본문 번역 (섹션별)
5. 기술 용어 일관성 검증
6. 최종 품질 검토

## Language-Specific Guidelines

### English (en)
- 기술 블로그 표준: 친근하지만 전문적인 어조
- 코드 주석: 명령형 (예: "Create a new file")
- SEO: Stack Overflow, GitHub 검색어 우선

### Japanese (ja)
- 경어 사용: です/ます 체 기본
- 기술 용어: 영어 그대로 vs 일본어 번역 혼용 (glossary 참조)
- SEO: Qiita, Zenn 검색어 우선

### Chinese (zh)
- 간체 중국어 사용
- 기술 용어: 영문 표기 후 중문 설명 병기
- SEO: CSDN, 知乎 검색어 우선

## Example Transformations

### Bad (직역)
```
원문 (ko): "이 방법은 일석이조입니다."
번역 (en): "This method kills two birds with one stone." ✗
```

### Good (현지화)
```
원문 (ko): "이 방법은 일석이조입니다."
현지화 (en): "This approach solves two problems at once." ✓
```

### SEO Optimization

```
원문 title (ko): "리액트 훅스 완벽 가이드"

Bad (en): "React Hooks Perfect Guide" ✗
- 검색량 낮음
- 경쟁 과다

Good (en): "React Hooks Tutorial: Complete Guide for Beginners" ✓
- "tutorial", "complete guide", "beginners" 검색어 포함
- 구체적인 대상 명시
```

## Tools

### translate_post
포스트를 번역하고 현지화합니다.

**Parameters**:
- `source_file`: 원문 파일 경로
- `target_language`: 대상 언어 (en, ja, zh)
- `glossary_file`: 용어집 파일 (선택)

**Returns**:
- 번역된 파일 경로
- 품질 점수
- 개선 제안

## Usage Example

```
@translation-agent "ko/react-hooks-guide.md를 영어로 번역해주세요.
초보자 대상이며 SEO 키워드는 'React hooks tutorial'을 중심으로 최적화해주세요."
```
```

<strong>Step 2: 번역 스크립트 구현</strong>

`.claude/skills/translation-agent/translate.py`:

```python
#!/usr/bin/env python3
"""
다국어 포스트 번역 및 현지화 스크립트
"""

import anthropic
import json
import os
import re
from pathlib import Path
from typing import Literal, Optional

Language = Literal["ko", "en", "ja", "zh"]

class TranslationAgent:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.glossary = self._load_glossary()

    def _load_glossary(self) -> dict:
        """기술 용어 glossary 로드"""
        glossary_path = Path(__file__).parent / "glossary.json"
        if glossary_path.exists():
            with open(glossary_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def translate_post(
        self,
        source_file: Path,
        target_lang: Language,
        source_lang: Language = "ko"
    ) -> dict:
        """
        블로그 포스트를 번역하고 현지화합니다.

        Returns:
            {
                "frontmatter": {...},  # 번역된 메타데이터
                "content": "...",      # 번역된 본문
                "quality_score": 0.95,
                "suggestions": [...]
            }
        """
        # 원문 읽기
        with open(source_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Frontmatter와 본문 분리
        frontmatter, body = self._split_frontmatter(content)

        # 1단계: 메타데이터 번역 (SEO 최적화)
        translated_meta = self._translate_metadata(
            frontmatter, source_lang, target_lang
        )

        # 2단계: 본문 번역 (섹션별)
        translated_body = self._translate_body(
            body, source_lang, target_lang
        )

        # 3단계: 품질 검증
        quality_report = self._validate_quality(
            translated_body, target_lang
        )

        return {
            "frontmatter": translated_meta,
            "content": translated_body,
            "quality_score": quality_report["score"],
            "suggestions": quality_report["suggestions"]
        }

    def _split_frontmatter(self, content: str) -> tuple[dict, str]:
        """Frontmatter와 본문 분리"""
        match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
        if not match:
            raise ValueError("Invalid frontmatter format")

        # YAML 파싱 (간단한 구현)
        frontmatter_text = match.group(1)
        body = match.group(2)

        frontmatter = {}
        for line in frontmatter_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                frontmatter[key.strip()] = value.strip().strip('"\'')

        return frontmatter, body

    def _translate_metadata(
        self,
        meta: dict,
        source_lang: Language,
        target_lang: Language
    ) -> dict:
        """메타데이터를 SEO 최적화하여 번역"""

        prompt = f"""당신은 SEO 전문가이자 번역가입니다.
블로그 포스트의 메타데이터를 {target_lang} 언어로 현지화하세요.

<source_metadata>
title: {meta.get('title', '')}
description: {meta.get('description', '')}
tags: {meta.get('tags', '')}
</source_metadata>

<guidelines>
1. title: {target_lang} 언어권에서 검색량이 높은 키워드 포함 (60자 이하)
2. description: 구체적이고 행동 유도형 (150-160자)
3. tags: 해당 언어권에서 실제 사용하는 태그 (최대 5개)
4. 단순 번역이 아닌 SEO 최적화된 재작성
</guidelines>

<glossary>
{json.dumps(self.glossary.get(target_lang, {}), ensure_ascii=False, indent=2)}
</glossary>

JSON 형식으로 응답하세요:
{{
  "title": "...",
  "description": "...",
  "tags": ["...", "..."]
}}
"""

        response = self.client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        # JSON 추출
        result_text = response.content[0].text
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))

        raise ValueError("Failed to parse metadata translation")

    def _translate_body(
        self,
        body: str,
        source_lang: Language,
        target_lang: Language
    ) -> str:
        """본문을 섹션별로 번역"""

        # 섹션으로 분할 (## 헤더 기준)
        sections = re.split(r'(^##\s+.+$)', body, flags=re.MULTILINE)

        translated_sections = []
        for section in sections:
            if section.strip():
                translated = self._translate_section(
                    section, source_lang, target_lang
                )
                translated_sections.append(translated)

        return '\n\n'.join(translated_sections)

    def _translate_section(
        self,
        text: str,
        source_lang: Language,
        target_lang: Language
    ) -> str:
        """개별 섹션 번역"""

        # 코드 블록 보호
        code_blocks = []
        def replace_code(match):
            code_blocks.append(match.group(0))
            return f"__CODE_BLOCK_{len(code_blocks)-1}__"

        text = re.sub(r'```.*?```', replace_code, text, flags=re.DOTALL)

        prompt = f"""당신은 기술 블로그 전문 번역가입니다.
다음 텍스트를 {target_lang} 언어로 현지화하세요.

<text>
{text}
</text>

<guidelines>
1. 현지화 우선: 단순 번역이 아닌 {target_lang} 독자를 위한 재작성
2. 기술 용어: glossary 참조하여 일관성 유지
3. 어조: {"친근하고 전문적 (영어)" if target_lang == "en" else "정중하고 전문적 (경어 사용)" if target_lang == "ja" else "전문적이고 명확함"}
4. 코드 관련 설명: 구체적이고 실용적으로
5. __CODE_BLOCK_N__ 표시는 그대로 유지
</guidelines>

<glossary>
{json.dumps(self.glossary.get(target_lang, {}), ensure_ascii=False, indent=2)}
</glossary>

번역된 텍스트만 응답하세요 (설명 불필요).
"""

        response = self.client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        translated = response.content[0].text.strip()

        # 코드 블록 복원
        for i, code in enumerate(code_blocks):
            translated = translated.replace(f"__CODE_BLOCK_{i}__", code)

        return translated

    def _validate_quality(self, text: str, lang: Language) -> dict:
        """번역 품질 검증"""

        issues = []

        # 1. 코드 블록 검증
        code_blocks = re.findall(r'```', text)
        if len(code_blocks) % 2 != 0:
            issues.append("코드 블록 쌍이 맞지 않습니다")

        # 2. 링크 검증
        broken_links = re.findall(r'\[([^\]]+)\]\(\)', text)
        if broken_links:
            issues.append(f"빈 링크 발견: {broken_links}")

        # 3. 언어별 특수 검증
        if lang == "ja" and not re.search(r'[です|ます]', text):
            issues.append("일본어 경어 사용 부족")

        # 점수 계산
        score = max(0.0, 1.0 - len(issues) * 0.1)

        return {
            "score": score,
            "suggestions": issues
        }


def main():
    """CLI 인터페이스"""
    import sys

    if len(sys.argv) < 3:
        print("Usage: python translate.py <source_file> <target_lang>")
        sys.exit(1)

    source_file = Path(sys.argv[1])
    target_lang = sys.argv[2]

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set")
        sys.exit(1)

    agent = TranslationAgent(api_key)
    result = agent.translate_post(source_file, target_lang)

    # 출력 파일 생성
    output_file = source_file.parent.parent / target_lang / source_file.name
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("---\n")
        for key, value in result["frontmatter"].items():
            if isinstance(value, list):
                f.write(f"{key}: {json.dumps(value, ensure_ascii=False)}\n")
            else:
                f.write(f'{key}: "{value}"\n')
        f.write("---\n\n")
        f.write(result["content"])

    print(f"✓ Translated to {output_file}")
    print(f"  Quality score: {result['quality_score']:.2%}")
    if result['suggestions']:
        print("  Suggestions:")
        for suggestion in result['suggestions']:
            print(f"    - {suggestion}")


if __name__ == "__main__":
    main()
```

<strong>Step 3: Glossary (용어집) 정의</strong>

`.claude/skills/translation-agent/glossary.json`:

```json
{
  "en": {
    "리액트": "React",
    "훅스": "Hooks",
    "컴포넌트": "component",
    "상태": "state",
    "프롭스": "props",
    "렌더링": "rendering",
    "라이프사이클": "lifecycle",
    "비동기": "asynchronous",
    "프로미스": "Promise",
    "콜백": "callback"
  },
  "ja": {
    "리액트": "React",
    "훅스": "フック",
    "컴포넌트": "コンポーネント",
    "상태": "状態",
    "프롭스": "Props",
    "렌더링": "レンダリング",
    "라이프사이클": "ライフサイクル",
    "비동기": "非同期",
    "프로미스": "Promise",
    "콜백": "コールバック"
  },
  "zh": {
    "리액트": "React",
    "훅스": "钩子(Hooks)",
    "컴포넌트": "组件",
    "상태": "状态",
    "프롭스": "Props",
    "렌더링": "渲染",
    "라이프사이클": "生命周期",
    "비동기": "异步",
    "프로미스": "Promise",
    "콜백": "回调"
  }
}
```

### 설명 (Explanation)

<strong>1. 번역 vs 현지화</strong>

| 번역 (Translation) | 현지화 (Localization) |
|-------------------|---------------------|
| 단어 대체 | 의미 전달 |
| "이것은 일석이조다" → "This kills two birds with one stone" | "이것은 일석이조다" → "This solves two problems at once" |
| 원문 구조 유지 | 독자 맞춤 재작성 |

<strong>2. SEO 최적화 프로세스</strong>

```
원문 title (ko): "리액트 훅스 완벽 가이드"
↓
검색 키워드 조사 (영어권)
- "react hooks" (100K/월)
- "react hooks tutorial" (50K/월)
- "react hooks guide" (30K/월)
- "react hooks for beginners" (20K/월)
↓
최적화된 title (en): "React Hooks Tutorial: Complete Guide for Beginners"
- 검색량 높은 키워드 포함
- 구체적인 대상 명시
- 60자 이하 유지
```

<strong>3. 섹션별 번역의 이점</strong>

- <strong>토큰 효율성</strong>: 전체 문서를 한 번에 보내지 않음 (컨텍스트 제한 회피)
- <strong>일관성</strong>: 각 섹션은 독립적으로 번역되지만 glossary로 용어 통일
- <strong>에러 복구</strong>: 특정 섹션 번역 실패 시 재시도 가능

<strong>4. 코드 블록 보호</strong>

```python
# 번역 전
text = "React에서 `useState`를 사용합니다.\n```js\nconst [count, setCount] = useState(0);\n```"

# 코드 블록 보호
text = "React에서 `useState`를 사용합니다.\n__CODE_BLOCK_0__"

# 번역
translated = "Use `useState` in React.\n__CODE_BLOCK_0__"

# 복원
translated = "Use `useState` in React.\n```js\nconst [count, setCount] = useState(0);\n```"
```

코드는 번역하지 않고 그대로 유지합니다.

<strong>5. 품질 검증</strong>

자동 검증 항목:
- 코드 블록 쌍 일치 (``` 개수)
- 링크 무결성 (`[]()` 빈 링크 없음)
- 언어별 특수 규칙 (일본어 경어, 중국어 간체 등)

### 변형 (Variations)

<strong>Variation 1: 배치 번역</strong>

여러 파일을 한 번에 번역:

```bash
#!/bin/bash
# batch_translate.sh

SOURCE_LANG="ko"
TARGET_LANGS=("en" "ja" "zh")

for file in src/content/blog/$SOURCE_LANG/*.md; do
  filename=$(basename "$file")

  for lang in "${TARGET_LANGS[@]}"; do
    echo "Translating $filename to $lang..."
    python .claude/skills/translation-agent/translate.py \
      "$file" "$lang"
  done
done
```

<strong>Variation 2: 번역 메모리 (Translation Memory)</strong>

이전 번역 재사용:

```python
class TranslationMemory:
    def __init__(self, db_path: str = "translations.db"):
        self.conn = sqlite3.connect(db_path)
        self._init_db()

    def _init_db(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS translations (
                source_hash TEXT,
                target_lang TEXT,
                source_text TEXT,
                translated_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (source_hash, target_lang)
            )
        """)

    def get(self, text: str, target_lang: str) -> Optional[str]:
        """캐시된 번역 조회"""
        hash_val = hashlib.md5(text.encode()).hexdigest()
        cursor = self.conn.execute(
            "SELECT translated_text FROM translations WHERE source_hash = ? AND target_lang = ?",
            (hash_val, target_lang)
        )
        row = cursor.fetchone()
        return row[0] if row else None

    def set(self, text: str, target_lang: str, translation: str):
        """번역 캐시 저장"""
        hash_val = hashlib.md5(text.encode()).hexdigest()
        self.conn.execute(
            "INSERT OR REPLACE INTO translations (source_hash, target_lang, source_text, translated_text) VALUES (?, ?, ?, ?)",
            (hash_val, target_lang, text, translation)
        )
        self.conn.commit()
```

<strong>Variation 3: 번역 리뷰 워크플로우</strong>

사람 검토자가 번역 승인:

```python
def create_review_issue(translated_file: Path, quality_score: float):
    """GitHub Issue 생성하여 번역 리뷰 요청"""
    if quality_score < 0.9:
        issue_body = f"""
## Translation Review Required

- File: `{translated_file}`
- Quality Score: {quality_score:.2%}
- Action: Please review and approve

[View Diff](https://github.com/user/repo/compare/main...translation-{translated_file.stem})
        """
        # GitHub API로 Issue 생성
        # ...
```

---

## Recipe 18.3: 품질 검증 자동화

### 문제 (Problem)

번역된 콘텐츠가 다음 기준을 만족하는지 자동으로 검증해야 합니다:

1. <strong>스키마 준수</strong>: Content Collections 스키마 (title 60자, description 160자 등)
2. <strong>SEO 품질</strong>: 메타태그, 키워드 밀도, 제목 구조
3. <strong>문화적 적합성</strong>: 부적절한 표현, 금기어, 현지 관습
4. <strong>기술적 정확성</strong>: 코드 블록 무결성, 링크 유효성
5. <strong>언어별 스타일</strong>: 경어 사용(일본어), 간체 중국어, 영어 어조

수동 검토는 시간이 오래 걸리고 일관성이 떨어집니다. 자동화된 검증 파이프라인이 필요합니다.

### 해결책 (Solution)

다층 검증 시스템을 구축합니다.

<strong>Step 1: 스키마 검증 스크립트</strong>

`scripts/validate_frontmatter.py`:

```python
#!/usr/bin/env python3
"""
Frontmatter 스키마 검증 스크립트
"""

import re
import yaml
from pathlib import Path
from typing import List, Dict, Any

class FrontmatterValidator:
    def __init__(self, content_dir: Path):
        self.content_dir = content_dir
        self.errors = []

    def validate_all(self) -> bool:
        """모든 포스트의 frontmatter 검증"""
        all_files = list(self.content_dir.glob("**/*.md"))

        for file_path in all_files:
            self.validate_file(file_path)

        if self.errors:
            print(f"\n❌ Found {len(self.errors)} errors:\n")
            for error in self.errors:
                print(f"  {error['file']}: {error['message']}")
            return False

        print(f"\n✅ All {len(all_files)} files passed validation")
        return True

    def validate_file(self, file_path: Path):
        """개별 파일 검증"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Frontmatter 추출
        match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if not match:
            self.errors.append({
                "file": str(file_path),
                "message": "Frontmatter not found"
            })
            return

        try:
            frontmatter = yaml.safe_load(match.group(1))
        except yaml.YAMLError as e:
            self.errors.append({
                "file": str(file_path),
                "message": f"Invalid YAML: {e}"
            })
            return

        # 언어 감지
        lang = file_path.parent.name
        if lang not in ['ko', 'en', 'ja', 'zh']:
            self.errors.append({
                "file": str(file_path),
                "message": f"Invalid language folder: {lang}"
            })
            return

        # 필수 필드 검증
        self._validate_required_fields(file_path, frontmatter)

        # 필드별 규칙 검증
        self._validate_title(file_path, frontmatter.get('title'), lang)
        self._validate_description(file_path, frontmatter.get('description'), lang)
        self._validate_pub_date(file_path, frontmatter.get('pubDate'))
        self._validate_tags(file_path, frontmatter.get('tags'))
        self._validate_related_posts(file_path, frontmatter.get('relatedPosts'), lang)

    def _validate_required_fields(self, file_path: Path, fm: dict):
        """필수 필드 존재 여부"""
        required = ['title', 'description', 'pubDate', 'relatedPosts']

        for field in required:
            if field not in fm:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"Missing required field: {field}"
                })

    def _validate_title(self, file_path: Path, title: str, lang: str):
        """제목 검증"""
        if not title:
            return

        # 길이 검증 (SEO)
        if len(title) > 60:
            self.errors.append({
                "file": str(file_path),
                "message": f"Title too long: {len(title)} chars (max 60)"
            })

        if len(title) < 10:
            self.errors.append({
                "file": str(file_path),
                "message": f"Title too short: {len(title)} chars (min 10)"
            })

        # 언어별 규칙
        if lang == 'en' and not re.search(r'[A-Z]', title):
            self.errors.append({
                "file": str(file_path),
                "message": "English title should have capitalization"
            })

    def _validate_description(self, file_path: Path, desc: str, lang: str):
        """설명 검증"""
        if not desc:
            return

        # 길이 검증 (SEO)
        if len(desc) > 160:
            self.errors.append({
                "file": str(file_path),
                "message": f"Description too long: {len(desc)} chars (max 160)"
            })

        if len(desc) < 50:
            self.errors.append({
                "file": str(file_path),
                "message": f"Description too short: {len(desc)} chars (min 50)"
            })

    def _validate_pub_date(self, file_path: Path, pub_date: Any):
        """발행일 검증"""
        if not pub_date:
            return

        # 날짜 형식 검증
        if not isinstance(pub_date, str):
            self.errors.append({
                "file": str(file_path),
                "message": f"pubDate must be string (YYYY-MM-DD format)"
            })
            return

        if not re.match(r'^\d{4}-\d{2}-\d{2}$', pub_date):
            self.errors.append({
                "file": str(file_path),
                "message": f"Invalid pubDate format: {pub_date} (use YYYY-MM-DD)"
            })

    def _validate_tags(self, file_path: Path, tags: Any):
        """태그 검증"""
        if not tags:
            return

        if not isinstance(tags, list):
            self.errors.append({
                "file": str(file_path),
                "message": "tags must be an array"
            })
            return

        if len(tags) > 5:
            self.errors.append({
                "file": str(file_path),
                "message": f"Too many tags: {len(tags)} (max 5)"
            })

    def _validate_related_posts(self, file_path: Path, related: Any, lang: str):
        """관련 포스트 검증"""
        if not related:
            return

        if not isinstance(related, list):
            self.errors.append({
                "file": str(file_path),
                "message": "relatedPosts must be an array"
            })
            return

        for i, post in enumerate(related):
            if not isinstance(post, dict):
                self.errors.append({
                    "file": str(file_path),
                    "message": f"relatedPosts[{i}] must be an object"
                })
                continue

            # 필수 필드
            if 'slug' not in post:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"relatedPosts[{i}] missing 'slug'"
                })

            if 'score' not in post:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"relatedPosts[{i}] missing 'score'"
                })

            if 'reason' not in post:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"relatedPosts[{i}] missing 'reason'"
                })
                continue

            # reason에 4개 언어 모두 있는지 확인
            reason = post['reason']
            for required_lang in ['ko', 'ja', 'en', 'zh']:
                if required_lang not in reason:
                    self.errors.append({
                        "file": str(file_path),
                        "message": f"relatedPosts[{i}].reason missing '{required_lang}'"
                    })


def main():
    """CLI 실행"""
    content_dir = Path("src/content/blog")
    validator = FrontmatterValidator(content_dir)

    success = validator.validate_all()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
```

<strong>Step 2: SEO 품질 검증</strong>

`scripts/validate_seo.py`:

```python
#!/usr/bin/env python3
"""
SEO 품질 검증 스크립트
"""

import re
from pathlib import Path
from collections import Counter

class SEOValidator:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.content = file_path.read_text(encoding='utf-8')
        self.issues = []

    def validate(self) -> dict:
        """SEO 품질 검증"""
        self._check_heading_structure()
        self._check_keyword_density()
        self._check_readability()
        self._check_links()
        self._check_images()

        score = max(0, 100 - len(self.issues) * 5)

        return {
            "score": score,
            "issues": self.issues
        }

    def _check_heading_structure(self):
        """제목 구조 검증"""
        # H1은 하나만
        h1_count = len(re.findall(r'^#\s+', self.content, re.MULTILINE))
        if h1_count == 0:
            self.issues.append("No H1 heading found")
        elif h1_count > 1:
            self.issues.append(f"Multiple H1 headings ({h1_count})")

        # H2 이상 존재
        h2_count = len(re.findall(r'^##\s+', self.content, re.MULTILINE))
        if h2_count == 0:
            self.issues.append("No H2 headings (poor structure)")

        # 헤딩 순서 검증 (H2 → H3 → H4, skip 금지)
        headings = re.findall(r'^(#{1,6})\s+', self.content, re.MULTILINE)
        prev_level = 0
        for heading in headings:
            level = len(heading)
            if level - prev_level > 1:
                self.issues.append(f"Heading level skip: H{prev_level} → H{level}")
            prev_level = level

    def _check_keyword_density(self):
        """키워드 밀도 검증"""
        # 본문만 추출 (코드 블록 제외)
        text = re.sub(r'```.*?```', '', self.content, flags=re.DOTALL)
        text = re.sub(r'`[^`]+`', '', text)

        # 단어 추출
        words = re.findall(r'\b\w+\b', text.lower())
        total_words = len(words)

        if total_words < 300:
            self.issues.append(f"Content too short: {total_words} words (min 300)")

        # 상위 키워드 밀도
        word_counts = Counter(words)
        most_common = word_counts.most_common(10)

        for word, count in most_common:
            density = count / total_words
            if density > 0.05:  # 5% 이상은 과도
                self.issues.append(f"Keyword '{word}' density too high: {density:.1%}")

    def _check_readability(self):
        """가독성 검증"""
        # 단락 길이
        paragraphs = re.split(r'\n\n+', self.content)
        for i, para in enumerate(paragraphs):
            if para.startswith('#'):
                continue  # 헤딩 제외

            words = len(para.split())
            if words > 150:
                self.issues.append(f"Paragraph {i+1} too long: {words} words (max 150)")

    def _check_links(self):
        """링크 검증"""
        # 내부 링크 확인
        internal_links = re.findall(r'\[([^\]]+)\]\((/[^\)]+)\)', self.content)
        external_links = re.findall(r'\[([^\]]+)\]\((https?://[^\)]+)\)', self.content)

        if len(internal_links) == 0:
            self.issues.append("No internal links (poor SEO)")

        # 외부 링크는 nofollow 권장 (수동 확인 필요)
        if len(external_links) > 10:
            self.issues.append(f"Many external links ({len(external_links)}), consider nofollow")

    def _check_images(self):
        """이미지 검증"""
        # 이미지 alt 텍스트
        images_with_alt = re.findall(r'!\[([^\]]*)\]\([^\)]+\)', self.content)
        images_without_alt = [alt for alt in images_with_alt if not alt.strip()]

        if images_without_alt:
            self.issues.append(f"{len(images_without_alt)} images missing alt text")


def main():
    """CLI 실행"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python validate_seo.py <file>")
        sys.exit(1)

    file_path = Path(sys.argv[1])
    validator = SEOValidator(file_path)
    result = validator.validate()

    print(f"\nSEO Score: {result['score']}/100")
    if result['issues']:
        print("\nIssues:")
        for issue in result['issues']:
            print(f"  - {issue}")
    else:
        print("  ✓ No issues found")


if __name__ == "__main__":
    main()
```

<strong>Step 3: 통합 검증 워크플로우</strong>

`.github/workflows/validate-content.yml`:

```yaml
name: Content Validation

on:
  pull_request:
    paths:
      - 'src/content/blog/**'
  push:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install pyyaml

      - name: Validate Frontmatter
        run: |
          python scripts/validate_frontmatter.py

      - name: Validate SEO (changed files only)
        run: |
          # 변경된 파일만 검증
          git diff --name-only origin/main | grep '\.md$' | while read file; do
            echo "Validating $file..."
            python scripts/validate_seo.py "$file"
          done

      - name: Build Test
        run: |
          npm install
          npm run astro check
          npm run build

      - name: Report
        if: failure()
        run: |
          echo "❌ Validation failed. Please fix the issues above."
          exit 1
```

### 설명 (Explanation)

<strong>1. 3계층 검증 구조</strong>

```
Layer 1: Schema Validation (빌드 전)
├─ Frontmatter 필수 필드
├─ 타입 검증 (string, date, array)
└─ 길이 제한 (title 60자, description 160자)

Layer 2: SEO Validation (빌드 전)
├─ 제목 구조 (H1 하나, H2 이상 존재)
├─ 키워드 밀도 (5% 이하)
├─ 가독성 (단락 150단어 이하)
├─ 링크 품질 (내부 링크, 외부 링크)
└─ 이미지 alt 텍스트

Layer 3: Build Validation (Astro)
├─ TypeScript 타입 체크
├─ Content Collections 스키마
└─ 이미지 경로 유효성
```

<strong>2. 자동화 파이프라인</strong>

```
PR 생성/푸시
↓
GitHub Actions 트리거
↓
Python 스크립트 실행
├─ validate_frontmatter.py (모든 파일)
└─ validate_seo.py (변경된 파일만)
↓
Astro 빌드 테스트
├─ npm run astro check
└─ npm run build
↓
결과 리포트
├─ ✅ 통과 → 머지 가능
└─ ❌ 실패 → 수정 필요
```

<strong>3. 점진적 검증 (Incremental Validation)</strong>

모든 파일을 매번 검증하지 않고 변경된 파일만:

```bash
# Git diff로 변경 파일 감지
git diff --name-only origin/main | grep '\.md$'

# 출력 예시
src/content/blog/ko/new-post.md
src/content/blog/en/new-post.md
```

이렇게 하면 대규모 블로그에서도 빠른 검증 가능.

### 변형 (Variations)

<strong>Variation 1: AI 기반 문화적 적합성 검증</strong>

Claude API로 문화적으로 부적절한 표현 감지:

```python
def validate_cultural_appropriateness(text: str, lang: str) -> dict:
    """AI로 문화적 적합성 검증"""

    prompt = f"""당신은 {lang} 언어권의 문화 전문가입니다.
다음 텍스트에서 문화적으로 부적절하거나 오해의 소지가 있는 표현을 찾아주세요.

<text>
{text}
</text>

다음 항목을 확인하세요:
1. 금기어, 비속어
2. 문화적 고정관념
3. 종교/정치적 민감성
4. 성차별, 인종차별 표현
5. 현지 관습에 어긋나는 표현

JSON 형식으로 응답:
{{
  "issues": [
    {{"text": "...", "reason": "...", "suggestion": "..."}},
    ...
  ]
}}
"""

    response = client.messages.create(
        model="claude-opus-4-5-20251101",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )

    # JSON 파싱 및 반환
    # ...
```

<strong>Variation 2: 언어 간 일관성 검증</strong>

같은 콘텐츠의 4개 언어 버전이 동일한 의미를 전달하는지 검증:

```python
def validate_translation_consistency(
    ko_file: Path,
    en_file: Path,
    ja_file: Path,
    zh_file: Path
) -> dict:
    """4개 언어 버전의 일관성 검증"""

    # 각 파일의 제목 구조 추출
    headings = {
        'ko': extract_headings(ko_file),
        'en': extract_headings(en_file),
        'ja': extract_headings(ja_file),
        'zh': extract_headings(zh_file),
    }

    # 제목 개수가 동일한지 확인
    heading_counts = [len(h) for h in headings.values()]
    if len(set(heading_counts)) > 1:
        return {
            "consistent": False,
            "issue": f"Heading count mismatch: {headings}"
        }

    # 코드 블록 개수가 동일한지 확인
    code_blocks = {
        lang: len(re.findall(r'```', file.read_text()))
        for lang, file in [('ko', ko_file), ('en', en_file), ('ja', ja_file), ('zh', zh_file)]
    }

    if len(set(code_blocks.values())) > 1:
        return {
            "consistent": False,
            "issue": f"Code block count mismatch: {code_blocks}"
        }

    return {"consistent": True}
```

---

## Recipe 18.4: 동기화 및 일관성 유지

### 문제 (Problem)

4개 언어 콘텐츠를 관리하다 보면 다음과 같은 동기화 문제가 발생합니다:

1. <strong>언어별 포스트 수 불일치</strong>: 한국어는 100개, 영어는 95개, 일본어는 98개...
2. <strong>메타데이터 불일치</strong>: 같은 포스트인데 pubDate가 다름
3. <strong>이미지 불일치</strong>: 언어별로 다른 heroImage 사용
4. <strong>업데이트 누락</strong>: 한국어 포스트를 수정했는데 영어 버전은 업데이트 안 됨

수동으로 추적하기 어렵고, 실수가 발생하기 쉽습니다.

### 해결책 (Solution)

자동 동기화 시스템을 구축합니다.

<strong>Step 1: 동기화 상태 감지</strong>

`scripts/check_sync.py`:

```python
#!/usr/bin/env python3
"""
다국어 콘텐츠 동기화 상태 확인
"""

import re
from pathlib import Path
from typing import Dict, List, Set
import yaml

class SyncChecker:
    def __init__(self, content_dir: Path):
        self.content_dir = content_dir
        self.languages = ['ko', 'en', 'ja', 'zh']

    def check_all(self) -> dict:
        """전체 동기화 상태 확인"""
        # 언어별 파일 목록
        files_by_lang = {}
        for lang in self.languages:
            lang_dir = self.content_dir / lang
            files = set(f.name for f in lang_dir.glob("*.md"))
            files_by_lang[lang] = files

        # 1. 파일 개수 확인
        file_counts = {lang: len(files) for lang, files in files_by_lang.items()}

        # 2. 누락된 번역 찾기
        all_slugs = set()
        for files in files_by_lang.values():
            all_slugs.update(files)

        missing_translations = {}
        for lang in self.languages:
            missing = all_slugs - files_by_lang[lang]
            if missing:
                missing_translations[lang] = list(missing)

        # 3. 메타데이터 일관성 확인
        metadata_issues = self._check_metadata_consistency()

        return {
            "file_counts": file_counts,
            "missing_translations": missing_translations,
            "metadata_issues": metadata_issues
        }

    def _check_metadata_consistency(self) -> List[dict]:
        """메타데이터 일관성 확인"""
        issues = []

        # 모든 슬러그 수집
        ko_files = list((self.content_dir / 'ko').glob("*.md"))

        for ko_file in ko_files:
            slug = ko_file.stem

            # 4개 언어 파일 모두 존재하는 경우만
            files = {}
            for lang in self.languages:
                file_path = self.content_dir / lang / ko_file.name
                if file_path.exists():
                    files[lang] = file_path

            if len(files) < 4:
                continue  # 일부만 있으면 skip (missing_translations에서 처리)

            # 메타데이터 추출
            metadata = {}
            for lang, file_path in files.items():
                fm = self._extract_frontmatter(file_path)
                metadata[lang] = fm

            # pubDate 일치 확인
            pub_dates = [fm.get('pubDate') for fm in metadata.values()]
            if len(set(pub_dates)) > 1:
                issues.append({
                    "slug": slug,
                    "field": "pubDate",
                    "values": {lang: metadata[lang].get('pubDate') for lang in self.languages}
                })

            # heroImage 일치 확인
            hero_images = [fm.get('heroImage') for fm in metadata.values()]
            if len(set(hero_images)) > 1:
                issues.append({
                    "slug": slug,
                    "field": "heroImage",
                    "values": {lang: metadata[lang].get('heroImage') for lang in self.languages}
                })

        return issues

    def _extract_frontmatter(self, file_path: Path) -> dict:
        """Frontmatter 추출"""
        content = file_path.read_text(encoding='utf-8')
        match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if match:
            return yaml.safe_load(match.group(1))
        return {}


def main():
    """CLI 실행"""
    content_dir = Path("src/content/blog")
    checker = SyncChecker(content_dir)
    result = checker.check_all()

    print("\n=== Multilingual Content Sync Status ===\n")

    # 파일 개수
    print("File counts:")
    for lang, count in result['file_counts'].items():
        print(f"  {lang}: {count} files")

    # 누락된 번역
    if result['missing_translations']:
        print("\n⚠️  Missing translations:")
        for lang, files in result['missing_translations'].items():
            print(f"\n  {lang} ({len(files)} files):")
            for file in files[:5]:  # 처음 5개만 표시
                print(f"    - {file}")
            if len(files) > 5:
                print(f"    ... and {len(files)-5} more")
    else:
        print("\n✅ All files have translations in all languages")

    # 메타데이터 불일치
    if result['metadata_issues']:
        print(f"\n⚠️  Metadata inconsistencies ({len(result['metadata_issues'])} issues):")
        for issue in result['metadata_issues'][:5]:
            print(f"\n  {issue['slug']} - {issue['field']}:")
            for lang, value in issue['values'].items():
                print(f"    {lang}: {value}")
        if len(result['metadata_issues']) > 5:
            print(f"\n    ... and {len(result['metadata_issues'])-5} more issues")
    else:
        print("\n✅ Metadata is consistent across all languages")


if __name__ == "__main__":
    main()
```

<strong>Step 2: 자동 동기화 스크립트</strong>

`scripts/auto_sync.py`:

```python
#!/usr/bin/env python3
"""
누락된 번역 자동 생성
"""

import os
from pathlib import Path
from check_sync import SyncChecker

# Translation Agent import (Recipe 18.2 참조)
import sys
sys.path.append(str(Path(__file__).parent.parent / '.claude/skills/translation-agent'))
from translate import TranslationAgent

def auto_sync(content_dir: Path, api_key: str):
    """누락된 번역 자동 생성"""

    checker = SyncChecker(content_dir)
    result = checker.check_all()

    if not result['missing_translations']:
        print("✅ All files are synchronized")
        return

    agent = TranslationAgent(api_key)

    for target_lang, missing_files in result['missing_translations'].items():
        print(f"\n📝 Generating {len(missing_files)} {target_lang} translations...")

        for filename in missing_files:
            # 원본 파일 찾기 (일반적으로 한국어)
            source_file = content_dir / 'ko' / filename

            if not source_file.exists():
                # 한국어가 없으면 다른 언어에서 찾기
                for lang in ['en', 'ja', 'zh']:
                    alt_source = content_dir / lang / filename
                    if alt_source.exists():
                        source_file = alt_source
                        break

            if not source_file.exists():
                print(f"  ⚠️  Skipping {filename}: no source file found")
                continue

            # 번역 생성
            print(f"  Translating {filename} → {target_lang}...")
            try:
                result = agent.translate_post(source_file, target_lang)

                # 파일 저장
                output_file = content_dir / target_lang / filename
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write("---\n")
                    for key, value in result["frontmatter"].items():
                        if isinstance(value, list):
                            import json
                            f.write(f"{key}: {json.dumps(value, ensure_ascii=False)}\n")
                        else:
                            f.write(f'{key}: "{value}"\n')
                    f.write("---\n\n")
                    f.write(result["content"])

                print(f"    ✅ Created {output_file} (quality: {result['quality_score']:.0%})")

            except Exception as e:
                print(f"    ❌ Failed: {e}")


def main():
    """CLI 실행"""
    content_dir = Path("src/content/blog")
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set")
        return

    auto_sync(content_dir, api_key)


if __name__ == "__main__":
    main()
```

<strong>Step 3: 메타데이터 동기화</strong>

`scripts/sync_metadata.py`:

```python
#!/usr/bin/env python3
"""
메타데이터 일관성 자동 수정
"""

import re
import yaml
from pathlib import Path
from check_sync import SyncChecker

def sync_metadata(content_dir: Path):
    """메타데이터 불일치 자동 수정"""

    checker = SyncChecker(content_dir)
    result = checker.check_all()

    if not result['metadata_issues']:
        print("✅ Metadata is consistent")
        return

    print(f"\n🔧 Fixing {len(result['metadata_issues'])} metadata inconsistencies...\n")

    for issue in result['metadata_issues']:
        slug = issue['slug']
        field = issue['field']
        values = issue['values']

        # 한국어 버전을 기준으로 동기화
        canonical_value = values.get('ko')

        if not canonical_value:
            # 한국어가 없으면 첫 번째 값 사용
            canonical_value = next(iter(values.values()))

        print(f"  {slug} - {field}:")
        print(f"    Canonical value: {canonical_value}")

        # 모든 언어 파일 업데이트
        for lang in ['ko', 'en', 'ja', 'zh']:
            file_path = content_dir / lang / f"{slug}.md"

            if not file_path.exists():
                continue

            if values.get(lang) == canonical_value:
                continue  # 이미 일치

            # 파일 읽기
            content = file_path.read_text(encoding='utf-8')

            # Frontmatter 업데이트
            match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
            if not match:
                continue

            frontmatter_text = match.group(1)
            body = match.group(2)

            # 필드 값 변경
            frontmatter_text = re.sub(
                rf'^{field}:.*$',
                f'{field}: "{canonical_value}"',
                frontmatter_text,
                flags=re.MULTILINE
            )

            # 파일 쓰기
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"---\n{frontmatter_text}\n---\n{body}")

            print(f"    ✅ Updated {lang}/{slug}.md")


def main():
    """CLI 실행"""
    content_dir = Path("src/content/blog")
    sync_metadata(content_dir)


if __name__ == "__main__":
    main()
```

<strong>Step 4: 통합 워크플로우</strong>

`.claude/commands/sync-content.md`:

```markdown
# /sync-content Command

## Purpose
4개 언어 콘텐츠의 동기화 상태를 확인하고 자동으로 수정합니다.

## Usage

\`\`\`bash
/sync-content [--check-only] [--fix-metadata]
\`\`\`

## Options

- `--check-only`: 상태만 확인하고 수정하지 않음
- `--fix-metadata`: 메타데이터 불일치 자동 수정

## Workflow

1. 동기화 상태 확인
   - 언어별 파일 개수
   - 누락된 번역
   - 메타데이터 불일치

2. 누락된 번역 자동 생성 (옵션)
   - Translation Agent로 번역
   - 품질 검증 후 저장

3. 메타데이터 동기화 (옵션)
   - 한국어 버전을 기준으로 통일
   - pubDate, heroImage 등

4. 최종 검증
   - Frontmatter 스키마 검증
   - 빌드 테스트

## Example

\`\`\`
/sync-content
\`\`\`

Output:
\`\`\`
=== Content Sync Status ===

File counts:
  ko: 100 files
  en: 95 files ⚠️
  ja: 98 files ⚠️
  zh: 97 files ⚠️

Missing translations:
  en (5 files): post-96.md, post-97.md, ...
  ja (2 files): post-99.md, post-100.md
  zh (3 files): post-98.md, post-99.md, post-100.md

Metadata inconsistencies:
  post-42 - pubDate:
    ko: '2025-10-01'
    en: '2025-10-02' ⚠️
    ...

🤖 Auto-fix? (y/n): y

📝 Generating 5 en translations...
  ✅ post-96.md (quality: 95%)
  ✅ post-97.md (quality: 92%)
  ...

🔧 Fixing metadata...
  ✅ Updated en/post-42.md
  ...

✅ Sync complete!
\`\`\`
```

### 설명 (Explanation)

<strong>1. 동기화 검증 3단계</strong>

```
Stage 1: File Count Check
├─ 언어별 파일 개수 세기
└─ 불일치 발견 시 누락된 파일 식별

Stage 2: Content Consistency
├─ 같은 슬러그의 4개 버전 비교
├─ pubDate, heroImage, tags 일치 확인
└─ 불일치 발견 시 리포트

Stage 3: Automated Fix
├─ 누락된 번역 자동 생성
├─ 메타데이터 한국어 기준으로 통일
└─ 최종 검증 (빌드 테스트)
```

<strong>2. 자동 vs 수동 수정</strong>

| 항목 | 자동 수정 | 수동 검토 필요 |
|------|----------|--------------|
| 누락된 번역 | ✅ AI 번역 생성 | ❌ 품질 검토 후 승인 |
| pubDate 불일치 | ✅ 한국어 기준 통일 | ✅ (논란 없음) |
| heroImage 불일치 | ✅ 한국어 기준 통일 | ✅ (논란 없음) |
| title 불일치 | ❌ | ✅ (SEO 영향) |
| description 불일치 | ❌ | ✅ (SEO 영향) |

title과 description은 언어별로 달라야 하므로 자동 수정하지 않음.

<strong>3. 동기화 주기</strong>

```
Daily:
  - 동기화 상태 확인 (check_sync.py)
  - 메타데이터 불일치 자동 수정

Weekly:
  - 누락된 번역 생성
  - 품질 검토 및 수동 수정

Monthly:
  - 전체 콘텐츠 감사
  - SEO 품질 재검증
```

### 변형 (Variations)

<strong>Variation 1: Git Hook으로 자동 동기화</strong>

커밋 전에 자동 검증:

`.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🔍 Checking content sync..."

python scripts/check_sync.py
if [ $? -ne 0 ]; then
  echo "❌ Content sync check failed"
  echo "Run 'python scripts/auto_sync.py' to fix"
  exit 1
fi

echo "✅ Content sync OK"
```

<strong>Variation 2: Dashboard로 동기화 상태 시각화</strong>

`scripts/generate_sync_dashboard.py`:

```python
def generate_dashboard(content_dir: Path) -> str:
    """HTML 대시보드 생성"""

    checker = SyncChecker(content_dir)
    result = checker.check_all()

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Content Sync Dashboard</title>
        <style>
            .status {{ padding: 20px; }}
            .ok {{ background: #d1fae5; }}
            .warning {{ background: #fef3c7; }}
        </style>
    </head>
    <body>
        <h1>Multilingual Content Sync Status</h1>

        <div class="status {'ok' if not result['missing_translations'] else 'warning'}">
            <h2>File Counts</h2>
            <ul>
                {"".join(f"<li>{lang}: {count} files</li>" for lang, count in result['file_counts'].items())}
            </ul>
        </div>

        <!-- 더 많은 섹션... -->
    </body>
    </html>
    """

    return html
```

---

## 실전 프로젝트: 완전 자동화된 다국어 파이프라인

이제 모든 레시피를 통합하여 완전 자동화된 시스템을 만들어봅니다.

### 시나리오

한국어로 블로그 포스트를 작성하면:
1. 자동으로 영어, 일본어, 중국어 번역 생성
2. 각 언어별 SEO 최적화
3. 품질 검증 (스키마, SEO, 문화적 적합성)
4. 메타데이터 동기화
5. 4개 언어 동시 발행

### 통합 명령어: `/write-post-multilingual`

`.claude/commands/write-post-multilingual.md`:

```markdown
# /write-post-multilingual Command

## Purpose
한국어 포스트를 작성하면 자동으로 4개 언어 번역을 생성하고 검증하여 발행합니다.

## Workflow

\`\`\`mermaid
graph TD
    A[한국어 포스트 작성] --> B[Frontmatter 검증]
    B --> C{검증 통과?}
    C -->|No| D[오류 수정]
    D --> B
    C -->|Yes| E[3개 언어 번역 생성]
    E --> F[SEO 최적화]
    F --> G[품질 검증]
    G --> H{품질 기준 충족?}
    H -->|No| I[수동 검토 요청]
    H -->|Yes| J[메타데이터 동기화]
    J --> K[빌드 테스트]
    K --> L{빌드 성공?}
    L -->|No| M[오류 수정]
    M --> K
    L -->|Yes| N[4개 언어 동시 발행]
\`\`\`

## Steps

### 1. 한국어 포스트 작성

사용자가 한국어로 포스트를 작성합니다.

### 2. 번역 생성

Translation Agent로 en, ja, zh 번역 생성:
- 현지화 우선 (번역이 아닌 재작성)
- SEO 키워드 최적화
- Glossary 참조하여 용어 일관성 유지

### 3. 품질 검증

3계층 검증:
- Schema: Frontmatter 필수 필드, 타입, 길이
- SEO: 제목 구조, 키워드 밀도, 링크, 이미지
- Build: Astro 빌드 테스트

### 4. 동기화 및 발행

- pubDate, heroImage 동기화
- relatedPosts 4개 언어 이유 생성
- Git 커밋 및 푸시

## Usage

\`\`\`bash
/write-post-multilingual <topic> [--skip-review]
\`\`\`

## Options

- `--skip-review`: 품질 점수 90% 이상이면 자동 승인

## Example

\`\`\`
/write-post-multilingual "React Server Components 완벽 가이드"
\`\`\`

Output:
\`\`\`
📝 Writing Korean post...
  ✅ Created ko/react-server-components-guide.md

🌍 Generating translations...
  📝 Translating to English...
    ✅ en/react-server-components-guide.md (quality: 95%)
  📝 Translating to Japanese...
    ✅ ja/react-server-components-guide.md (quality: 92%)
  📝 Translating to Chinese...
    ✅ zh/react-server-components-guide.md (quality: 94%)

🔍 Validating quality...
  ✅ Frontmatter validation passed
  ✅ SEO validation passed (scores: ko=98, en=96, ja=94, zh=95)
  ✅ Build test passed

🔧 Synchronizing metadata...
  ✅ pubDate synced: 2025-12-19
  ✅ heroImage synced: ../../../assets/blog/react-server-components.jpg

✅ All 4 languages published!

View at:
  - 🇰🇷 /ko/blog/ko/react-server-components-guide
  - 🇺🇸 /en/blog/en/react-server-components-guide
  - 🇯🇵 /ja/blog/ja/react-server-components-guide
  - 🇨🇳 /zh/blog/zh/react-server-components-guide
\`\`\`
```

### 구현

`.claude/commands/implementations/write_post_multilingual.py`:

```python
#!/usr/bin/env python3
"""
다국어 포스트 생성 및 발행 자동화
"""

import os
import sys
from pathlib import Path

# 기존 스크립트 import
sys.path.append(str(Path(__file__).parent.parent.parent / '.claude/skills/translation-agent'))
sys.path.append(str(Path(__file__).parent.parent.parent / 'scripts'))

from translate import TranslationAgent
from validate_frontmatter import FrontmatterValidator
from validate_seo import SEOValidator
from sync_metadata import sync_metadata

def write_multilingual_post(topic: str, skip_review: bool = False):
    """다국어 포스트 생성 및 발행"""

    content_dir = Path("src/content/blog")

    # 1. 한국어 포스트 작성 (기존 writing-assistant 활용)
    print(f"\n📝 Writing Korean post about '{topic}'...")
    # ... (기존 writing-assistant 로직)
    ko_file = content_dir / "ko" / "new-post.md"
    print(f"  ✅ Created {ko_file}")

    # 2. 번역 생성
    print("\n🌍 Generating translations...")
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    agent = TranslationAgent(api_key)

    translations = {}
    for lang in ['en', 'ja', 'zh']:
        print(f"  📝 Translating to {lang.upper()}...")
        result = agent.translate_post(ko_file, lang)

        # 파일 저장
        output_file = content_dir / lang / ko_file.name
        with open(output_file, 'w', encoding='utf-8') as f:
            # ... (frontmatter + content 쓰기)
            pass

        translations[lang] = {
            "file": output_file,
            "quality": result['quality_score']
        }

        print(f"    ✅ {output_file} (quality: {result['quality_score']:.0%})")

    # 3. 품질 검증
    print("\n🔍 Validating quality...")

    # Frontmatter 검증
    validator = FrontmatterValidator(content_dir)
    if not validator.validate_all():
        print("  ❌ Frontmatter validation failed")
        return False
    print("  ✅ Frontmatter validation passed")

    # SEO 검증
    seo_scores = {}
    for lang in ['ko', 'en', 'ja', 'zh']:
        file_path = content_dir / lang / ko_file.name
        seo_validator = SEOValidator(file_path)
        result = seo_validator.validate()
        seo_scores[lang] = result['score']

    avg_seo_score = sum(seo_scores.values()) / len(seo_scores)
    print(f"  ✅ SEO validation passed (scores: {', '.join(f'{k}={v}' for k, v in seo_scores.items())})")

    # 빌드 테스트
    import subprocess
    build_result = subprocess.run(['npm', 'run', 'build'], capture_output=True)
    if build_result.returncode != 0:
        print("  ❌ Build test failed")
        return False
    print("  ✅ Build test passed")

    # 4. 수동 검토 필요 여부
    min_quality = min(t['quality'] for t in translations.values())
    if min_quality < 0.9 and not skip_review:
        print(f"\n⚠️  Quality score below 90% ({min_quality:.0%}). Manual review recommended.")
        print("    Run with --skip-review to auto-approve")
        return False

    # 5. 메타데이터 동기화
    print("\n🔧 Synchronizing metadata...")
    sync_metadata(content_dir)

    # 6. Git 커밋 및 푸시
    print("\n📦 Publishing...")
    subprocess.run(['git', 'add', 'src/content/blog'])
    subprocess.run(['git', 'commit', '-m', f'feat(blog): add {topic} (4 languages)'])
    subprocess.run(['git', 'push'])

    print("\n✅ All 4 languages published!")
    print("\nView at:")
    for lang in ['ko', 'en', 'ja', 'zh']:
        slug = ko_file.stem
        print(f"  - {{'ko':'🇰🇷','en':'🇺🇸','ja':'🇯🇵','zh':'🇨🇳'}[lang]} /{lang}/blog/{lang}/{slug}")

    return True


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("topic", help="Post topic")
    parser.add_argument("--skip-review", action="store_true", help="Skip manual review")

    args = parser.parse_args()

    success = write_multilingual_post(args.topic, args.skip_review)
    sys.exit(0 if success else 1)
```

---

## 요약

이 챕터에서는 4개 언어 동시 콘텐츠 생성 시스템을 구축했습니다:

<strong>Recipe 18.1: 다국어 구조 설계</strong>
- Content Collections 기반 언어별 폴더 구조
- 타입 안전한 스키마 정의
- 언어 전환 컴포넌트

<strong>Recipe 18.2: 번역 에이전트 구현</strong>
- Claude API로 현지화 우선 번역
- SEO 최적화된 메타데이터 생성
- Glossary 기반 용어 일관성

<strong>Recipe 18.3: 품질 검증 자동화</strong>
- 3계층 검증 (Schema, SEO, Build)
- GitHub Actions 통합
- AI 기반 문화적 적합성 검증

<strong>Recipe 18.4: 동기화 및 일관성 유지</strong>
- 자동 동기화 상태 감지
- 누락된 번역 자동 생성
- 메타데이터 통일

<strong>핵심 원칙</strong>:

1. <strong>번역이 아닌 현지화</strong>: 각 언어권 독자를 위한 재작성
2. <strong>자동화 우선</strong>: 반복 작업은 스크립트로 자동화
3. <strong>품질 보장</strong>: 3계층 검증으로 일관성 유지
4. <strong>점진적 개선</strong>: Translation Memory, 리뷰 워크플로우

이제 한국어로 포스트를 작성하면 4개 언어로 자동 번역되고, 품질 검증을 거쳐 동시에 발행됩니다. 글로벌 블로그 운영이 훨씬 쉬워졌습니다.

---

## 연습 문제

1. <strong>기본</strong>: 자신의 프로젝트에 Recipe 18.1의 다국어 구조를 적용하세요.
2. <strong>중급</strong>: Translation Agent에 새로운 언어(스페인어, 프랑스어)를 추가하세요.
3. <strong>고급</strong>: AI 기반 문화적 적합성 검증 시스템을 구현하세요.
4. <strong>심화</strong>: 번역 품질을 평가하는 자동화된 A/B 테스트 시스템을 만드세요.

---

## 다음 챕터 예고

Chapter 19에서는 <strong>AI 기반 콘텐츠 추천 시스템</strong>을 다룹니다. TF-IDF가 아닌 Claude의 의미론적 이해를 활용하여 독자에게 가장 관련성 높은 포스트를 추천하는 시스템을 구축합니다.
