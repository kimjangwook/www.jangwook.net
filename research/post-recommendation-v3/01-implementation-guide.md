# Implementation Guide: Post Recommendation V3

## Phase 1: 메타데이터 경량화

### 1.1 현재 메타데이터 백업

```bash
# 작업 전 백업 필수
cp post-metadata.json post-metadata.v2.backup.json
```

### 1.2 경량화된 메타데이터 구조

**Before (V2)**: 9개 필드
```json
{
  "metadata": {
    "claude-code-best-practices": {
      "slug": "claude-code-best-practices",
      "language": "ko",
      "pubDate": "2025-10-05",
      "title": "Claude Code Best Practices...",
      "summary": "Anthropic의 공식 Best Practices...",
      "mainTopics": ["Claude Code", "Best Practices", ...],
      "techStack": ["Claude Code", "Anthropic AI", ...],
      "difficulty": 3,
      "categoryScores": {...}
    }
  }
}
```

**After (V3)**: 3개 필드만
```json
{
  "claude-code-best-practices": {
    "pubDate": "2025-10-05",
    "difficulty": 3,
    "categoryScores": {
      "automation": 0.8,
      "web-development": 0.6,
      "ai-ml": 0.9,
      "devops": 0.4,
      "architecture": 0.7
    }
  }
}
```

### 1.3 변환 스크립트

```javascript
// scripts/migrate-metadata-v3.js
import fs from 'fs';

// V2 메타데이터 로드
const v2Data = JSON.parse(fs.readFileSync('post-metadata.json', 'utf-8'));

// V3 메타데이터 생성 (경량화)
const v3Data = {};

for (const slug in v2Data.metadata) {
  const post = v2Data.metadata[slug];

  v3Data[slug] = {
    pubDate: post.pubDate,
    difficulty: post.difficulty,
    categoryScores: post.categoryScores
  };
}

// 저장
fs.writeFileSync(
  'post-metadata.json',
  JSON.stringify(v3Data, null, 2),
  'utf-8'
);

console.log(`✓ Migrated ${Object.keys(v3Data).length} posts to V3 format`);
```

**실행**:
```bash
node scripts/migrate-metadata-v3.js
```

---

## Phase 2: Content Collections 스키마 확장

### 2.1 content.config.ts 수정

**파일**: `src/content.config.ts`

**Before**:
```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

**After (V3)**:
```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// V3: Related Post 타입 정의
const relatedPostSchema = z.object({
  slug: z.string(),
  score: z.number().min(0).max(1),
  reason: z.object({
    ko: z.string(),
    ja: z.string(),
    en: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),

      // V3: 추천 데이터 (선택적)
      relatedPosts: z.array(relatedPostSchema).optional(),
    }),
});

export const collections = { blog };
```

### 2.2 타입 검증

**테스트 포스트 생성**:
```yaml
---
title: 'Test Post'
description: 'Test description'
pubDate: '2025-10-30'
relatedPosts:
  - slug: 'claude-code-best-practices'
    score: 0.85
    reason:
      ko: '테스트 이유'
      ja: 'テスト理由'
      en: 'Test reason'
---

Test content
```

**빌드 테스트**:
```bash
npm run astro check
```

---

## Phase 3: 추천 생성 스크립트 개발

### 3.1 유사도 계산 알고리즘 (재사용)

**파일**: `scripts/similarity.js`

```javascript
/**
 * Jaccard Similarity: 집합 유사도 (0.0 ~ 1.0)
 */
export function jaccardSimilarity(setA, setB) {
  const intersection = setA.filter(item => setB.includes(item));
  const union = [...new Set([...setA, ...setB])];
  return union.length === 0 ? 0 : intersection.length / union.length;
}

/**
 * Cosine Similarity: 벡터 유사도 (0.0 ~ 1.0)
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return magA * magB === 0 ? 0 : dotProduct / (magA * magB);
}

/**
 * Category Vector 변환
 */
export function getCategoryVector(scores) {
  return [
    scores.automation,
    scores['web-development'],
    scores['ai-ml'],
    scores.devops,
    scores.architecture
  ];
}

/**
 * 다차원 유사도 계산 (V3 버전: categoryScores만 사용)
 */
export function calculateSimilarity(source, candidate) {
  // 1. Category Alignment (70% 가중치) - 주요 지표
  const categorySim = cosineSimilarity(
    getCategoryVector(source.categoryScores),
    getCategoryVector(candidate.categoryScores)
  );

  // 2. Difficulty Match (20% 가중치)
  const difficultyDiff = Math.abs(source.difficulty - candidate.difficulty);
  const difficultySim = Math.max(0, 1 - difficultyDiff * 0.25);

  // 3. Complementary Relationship (10% 가중치)
  let complementarySim = 0.5;
  if (candidate.difficulty === source.difficulty + 1) {
    complementarySim = 0.8; // Next level
  } else if (candidate.difficulty === source.difficulty - 1) {
    complementarySim = 0.7; // Prerequisite
  }

  // 가중치 적용하여 최종 점수 계산
  return (
    categorySim * 0.70 +
    difficultySim * 0.20 +
    complementarySim * 0.10
  );
}

/**
 * 추천 타입 결정
 */
export function determineType(source, candidate) {
  const difficultyDiff = candidate.difficulty - source.difficulty;

  if (difficultyDiff === 1) return 'next-step';
  if (difficultyDiff === -1) return 'prerequisite';
  if (difficultyDiff === 0) return 'similar-topic';
  return 'complementary';
}

/**
 * 추천 이유 생성 (간단한 템플릿, 추후 LLM 생성 가능)
 */
export function generateReason(source, candidate, score, type) {
  // 카테고리별 유사도 계산
  const sourceCat = getCategoryVector(source.categoryScores);
  const candidateCat = getCategoryVector(candidate.categoryScores);
  const catSim = cosineSimilarity(sourceCat, candidateCat);

  // 주요 카테고리 찾기
  const categories = ['automation', 'web-development', 'ai-ml', 'devops', 'architecture'];
  const categoryLabels = {
    ko: {
      'automation': '자동화',
      'web-development': '웹 개발',
      'ai-ml': 'AI/ML',
      'devops': 'DevOps',
      'architecture': '아키텍처'
    },
    ja: {
      'automation': '自動化',
      'web-development': 'Web開発',
      'ai-ml': 'AI/ML',
      'devops': 'DevOps',
      'architecture': 'アーキテクチャ'
    },
    en: {
      'automation': 'automation',
      'web-development': 'web development',
      'ai-ml': 'AI/ML',
      'devops': 'DevOps',
      'architecture': 'architecture'
    }
  };

  // 공통 주요 카테고리 찾기 (둘 다 0.6 이상)
  const commonCategories = categories.filter(cat =>
    source.categoryScores[cat] >= 0.6 && candidate.categoryScores[cat] >= 0.6
  );

  // 템플릿 기반 이유 생성
  const templates = {
    'next-step': {
      ko: (cats) => `다음 단계 학습으로 적합하며, ${cats.map(c => categoryLabels.ko[c]).join(', ')} 주제에서 연결됩니다.`,
      ja: (cats) => `次のステップの学習に適しており、${cats.map(c => categoryLabels.ja[c]).join('、')}のトピックで繋がります。`,
      en: (cats) => `Suitable as a next-step learning resource, connecting through ${cats.map(c => categoryLabels.en[c]).join(', ')} topics.`
    },
    'prerequisite': {
      ko: (cats) => `선행 학습 자료로 유용하며, ${cats.map(c => categoryLabels.ko[c]).join(', ')} 기초를 다룹니다.`,
      ja: (cats) => `事前学習資料として有用であり、${cats.map(c => categoryLabels.ja[c]).join('、')}の基礎を扱います。`,
      en: (cats) => `Useful as prerequisite knowledge, covering ${cats.map(c => categoryLabels.en[c]).join(', ')} fundamentals.`
    },
    'similar-topic': {
      ko: (cats) => `${cats.map(c => categoryLabels.ko[c]).join(', ')} 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.`,
      ja: (cats) => `${cats.map(c => categoryLabels.ja[c]).join('、')}分野で類似したトピックを扱い、同程度の難易度です。`,
      en: (cats) => `Covers similar topics in ${cats.map(c => categoryLabels.en[c]).join(', ')} with comparable difficulty.`
    },
    'complementary': {
      ko: (cats) => `${cats.map(c => categoryLabels.ko[c]).join(', ')} 관점에서 보완적인 내용을 제공합니다.`,
      ja: (cats) => `${cats.map(c => categoryLabels.ja[c]).join('、')}の観点から補完的な内容を提供します。`,
      en: (cats) => `Provides complementary content from ${cats.map(c => categoryLabels.en[c]).join(', ')} perspective.`
    }
  };

  const cats = commonCategories.length > 0 ? commonCategories : [categories[0]];
  const template = templates[type] || templates['similar-topic'];

  return {
    ko: template.ko(cats),
    ja: template.ja(cats),
    en: template.en(cats)
  };
}
```

### 3.2 추천 생성 및 Frontmatter 작성

**파일**: `scripts/generate-recommendations-v3.js`

```javascript
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';
import {
  calculateSimilarity,
  determineType,
  generateReason
} from './similarity.js';

/**
 * V3 추천 생성 메인 함수
 */
async function generateRecommendationsV3() {
  console.log('🚀 Starting V3 recommendation generation...\n');

  // 1. 메타데이터 로드
  const metadata = JSON.parse(fs.readFileSync('post-metadata.json', 'utf-8'));
  console.log(`✓ Loaded metadata for ${Object.keys(metadata).length} posts\n`);

  // 2. 각 포스트마다 추천 계산
  const recommendations = {};

  for (const slug in metadata) {
    const source = metadata[slug];
    const sourcePubDate = new Date(source.pubDate);

    // 후보 포스트 필터링 (시간 역행 방지)
    const candidates = Object.entries(metadata)
      .filter(([candidateSlug, _]) => candidateSlug !== slug)
      .filter(([_, candidate]) => new Date(candidate.pubDate) <= sourcePubDate)
      .map(([candidateSlug, candidate]) => ({
        slug: candidateSlug,
        ...candidate
      }));

    // 유사도 계산 및 정렬
    const scored = candidates.map(candidate => {
      const score = calculateSimilarity(source, candidate);
      const type = determineType(source, candidate);
      const reason = generateReason(source, candidate, score, type);

      return {
        slug: candidate.slug,
        score: Math.round(score * 100) / 100, // 소수점 2자리
        type,
        reason
      };
    });

    // 점수 순 정렬 및 상위 5개 선택
    scored.sort((a, b) => b.score - a.score);
    recommendations[slug] = scored.slice(0, 5);

    console.log(`✓ Generated ${recommendations[slug].length} recommendations for: ${slug}`);
  }

  console.log(`\n✓ Total recommendations generated for ${Object.keys(recommendations).length} posts\n`);

  // 3. 각 포스트의 frontmatter에 추천 작성
  await writeFrontmatterRecommendations(recommendations);

  console.log('\n🎉 V3 recommendation generation complete!');
}

/**
 * Frontmatter에 추천 데이터 작성
 */
async function writeFrontmatterRecommendations(recommendations) {
  const languages = ['ko', 'ja', 'en'];
  let updatedCount = 0;

  for (const slug in recommendations) {
    const recs = recommendations[slug];

    // 추천 데이터를 YAML 형식으로 변환
    const relatedPostsYaml = recs.map(rec => {
      return `  - slug: '${rec.slug}'
    score: ${rec.score}
    reason:
      ko: '${rec.reason.ko}'
      ja: '${rec.reason.ja}'
      en: '${rec.reason.en}'`;
    }).join('\n');

    // 각 언어 버전 파일 수정
    for (const lang of languages) {
      const filePath = path.join('src', 'content', 'blog', lang, `${slug}.md`);

      if (!fs.existsSync(filePath)) {
        console.warn(`  ⚠ File not found: ${filePath}`);
        continue;
      }

      // 파일 읽기
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(fileContent);

      // relatedPosts 필드 추가/업데이트
      parsed.data.relatedPosts = recs.map(rec => ({
        slug: rec.slug,
        score: rec.score,
        reason: rec.reason
      }));

      // 파일 다시 작성 (gray-matter stringify)
      const updatedContent = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(filePath, updatedContent, 'utf-8');

      updatedCount++;
    }

    console.log(`  ✓ Updated frontmatter for: ${slug} (${languages.length} languages)`);
  }

  console.log(`\n✓ Updated ${updatedCount} files total`);
}

// 실행
generateRecommendationsV3().catch(console.error);
```

### 3.3 패키지 설치

```bash
npm install --save-dev gray-matter
```

### 3.4 실행

```bash
node scripts/generate-recommendations-v3.js
```

**예상 출력**:
```
🚀 Starting V3 recommendation generation...

✓ Loaded metadata for 13 posts

✓ Generated 5 recommendations for: claude-code-best-practices
✓ Generated 5 recommendations for: metadata-based-recommendation-optimization
✓ Generated 4 recommendations for: self-healing-ai-systems
...

✓ Total recommendations generated for 13 posts

  ✓ Updated frontmatter for: claude-code-best-practices (3 languages)
  ✓ Updated frontmatter for: metadata-based-recommendation-optimization (3 languages)
  ...

✓ Updated 39 files total

🎉 V3 recommendation generation complete!
```

---

## Phase 4: RelatedPosts 컴포넌트 리팩토링

### 4.1 컴포넌트 수정

**파일**: `src/components/RelatedPosts.astro`

**Before (V2)**: ~90줄 (파일 I/O 포함)
**After (V3)**: ~60줄 (Props만 사용)

```astro
---
import { getEntry } from 'astro:content';
import { Image } from 'astro:assets';

// V3: Props 정의
interface RelatedPostItem {
  slug: string;
  score: number;
  reason: {
    ko: string;
    ja: string;
    en: string;
  };
}

interface Props {
  items: RelatedPostItem[];
  language: 'ko' | 'ja' | 'en';
}

const { items, language } = Astro.props;

// Language-specific headings
const headings = {
  ko: '관련 글',
  ja: '関連記事',
  en: 'Related Articles'
};

const heading = headings[language];

// Fetch full post data for each recommendation
const relatedPosts = await Promise.all(
  items.slice(0, 3).map(async (item) => {
    try {
      const fullPostId = `${language}/${item.slug}`;
      const post = await getEntry('blog', fullPostId);

      if (!post) {
        console.warn(`[RelatedPosts] Post not found: ${fullPostId}`);
        return null;
      }

      return {
        slug: item.slug,
        score: item.score,
        title: post.data.title,
        description: post.data.description,
        heroImage: post.data.heroImage,
        url: `/${language}/blog/${language}/${item.slug}`,
        reason: item.reason[language]
      };
    } catch (error) {
      console.error(`[RelatedPosts] Error fetching post ${item.slug}:`, error);
      return null;
    }
  })
);

// Filter out null entries
const validPosts = relatedPosts.filter(post => post !== null);

// Don't render if no recommendations
if (validPosts.length === 0) {
  return null;
}
---

<section class="related-posts">
  <h3 class="section-title">{heading}</h3>
  <ul class="recommendations-list">
    {validPosts.map((post) => (
      <li class="recommendation-item">
        <a
          href={post.url}
          onclick={`gtag('event', 'related_post_click', {
            'target_post': '${post.slug}',
            'similarity_score': ${post.score}
          })`}
        >
          <div class="item-content">
            <h4 class="item-title">{post.title}</h4>
            {post.reason && (
              <p class="item-reason">{post.reason}</p>
            )}
          </div>
          {post.heroImage && (
            <div class="item-image">
              <Image
                src={post.heroImage}
                alt={post.title}
                width={120}
                height={80}
                loading="lazy"
              />
            </div>
          )}
        </a>
      </li>
    ))}
  </ul>
</section>

<style>
  /* 기존 스타일 유지 (변경 없음) */
  .related-posts {
    margin: 3.5rem 0 2.5rem;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(var(--gray-light), 0.2);
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: rgb(var(--gray-dark));
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(var(--gray-light), 0.3);
  }

  .recommendations-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .recommendation-item {
    border-bottom: 1px solid rgba(var(--gray-light), 0.2);
  }

  .recommendation-item:last-child {
    border-bottom: none;
  }

  .recommendation-item a {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.25rem 0;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
  }

  .recommendation-item:hover a {
    opacity: 0.8;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.0625rem;
    font-weight: 600;
    color: rgb(var(--gray-dark));
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .recommendation-item:hover .item-title {
    color: rgb(var(--accent));
  }

  .item-reason {
    margin: 0;
    font-size: 0.8125rem;
    color: rgb(var(--gray));
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .item-image {
    flex-shrink: 0;
    width: 120px;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
    background: rgba(var(--gray-light), 0.1);
  }

  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .related-posts {
      margin: 2.5rem 0 2rem;
      padding: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      margin-bottom: 1.25rem;
    }

    .recommendation-item a {
      gap: 1rem;
      padding: 1rem 0;
    }

    .item-title {
      font-size: 0.9375rem;
      margin-bottom: 0.375rem;
    }

    .item-reason {
      font-size: 0.75rem;
    }

    .item-image {
      width: 90px;
      height: 60px;
    }
  }
</style>
```

**주요 변경사항**:
- ❌ `readFileSync()` 제거
- ❌ `recommendations.json` 의존성 제거
- ✅ Props로 `items` + `language` 받기
- ✅ 단순화된 로직

---

## Phase 5: BlogPost 레이아웃 수정

### 5.1 레이아웃 수정

**파일**: `src/layouts/BlogPost.astro`

**Before (V2)** (140번째 줄):
```astro
<!-- Related Posts -->
{postId && <RelatedPosts currentSlug={postId} />}
```

**After (V3)**:
```astro
<!-- Related Posts -->
{relatedPosts && relatedPosts.length > 0 && (
  <RelatedPosts items={relatedPosts} language={lang} />
)}
```

### 5.2 Props 타입 수정

**Before (V2)** (14-18번째 줄):
```astro
type Props = CollectionEntry<'blog'>['data'] & {
  lang: Language;
  tags?: string[];
  postId?: string;
};

const { title, description, pubDate, updatedDate, heroImage, lang, tags, postId } = Astro.props;
```

**After (V3)**:
```astro
type Props = CollectionEntry<'blog'>['data'] & {
  lang: Language;
  tags?: string[];
  postId?: string;
  relatedPosts?: Array<{
    slug: string;
    score: number;
    reason: { ko: string; ja: string; en: string };
  }>;
};

const { title, description, pubDate, updatedDate, heroImage, lang, tags, postId, relatedPosts } = Astro.props;
```

---

## Phase 6: 페이지 라우터 수정

### 6.1 [lang]/blog/[...slug].astro 수정

**파일**: `src/pages/[lang]/blog/[...slug].astro`

**Before (V2)** (27번째 줄):
```astro
<BlogPost {...post.data} lang={lang} tags={post.data.tags} postId={post.id}>
  <Content />
</BlogPost>
```

**After (V3)**:
```astro
<BlogPost
  {...post.data}
  lang={lang}
  tags={post.data.tags}
  postId={post.id}
  relatedPosts={post.data.relatedPosts}
>
  <Content />
</BlogPost>
```

---

## Phase 7: 마이그레이션 및 테스트

### 7.1 전체 마이그레이션 실행

```bash
# 1. 메타데이터 백업
cp post-metadata.json post-metadata.v2.backup.json

# 2. 메타데이터 경량화
node scripts/migrate-metadata-v3.js

# 3. 추천 생성 및 frontmatter 작성
node scripts/generate-recommendations-v3.js

# 4. 타입 체크
npm run astro check

# 5. 빌드 테스트
npm run build

# 6. 로컬 미리보기
npm run preview
```

### 7.2 검증 체크리스트

- [ ] 모든 포스트에 `relatedPosts` 필드 추가됨
- [ ] 3개 언어 버전 모두 동일한 추천 데이터
- [ ] 타입 체크 통과 (`npm run astro check`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 추천 섹션 정상 표시 (3개 언어)
- [ ] 추천 링크 클릭 동작
- [ ] Google Analytics 이벤트 트래킹

### 7.3 롤백 절차 (문제 발생 시)

```bash
# 메타데이터 롤백
cp post-metadata.v2.backup.json post-metadata.json

# recommendations.json 복원
git checkout recommendations.json

# 포스트 frontmatter 롤백
git checkout src/content/blog/**/*.md

# 컴포넌트 롤백
git checkout src/components/RelatedPosts.astro
git checkout src/layouts/BlogPost.astro
git checkout src/pages/[lang]/blog/[...slug].astro
```

---

## Phase 8: recommendations.json 제거

### 8.1 파일 제거

```bash
# 백업 후 제거
cp recommendations.json recommendations.v2.backup.json
rm recommendations.json
```

### 8.2 Git 커밋

```bash
git add .
git commit -m "feat(recommendation): migrate to V3 frontmatter-embedded system

- Remove recommendations.json (1750 lines)
- Lightweight metadata (3 fields only)
- Embed recommendations in frontmatter
- Update RelatedPosts component
- Update BlogPost layout
- 100% runtime file I/O removal
"
```

---

## 성능 측정

### Before (V2)

```bash
# 빌드 시간 측정
time npm run build

# 결과 예시:
# real    0m45.230s
# user    0m42.103s
# sys     0m3.127s
```

### After (V3)

```bash
# 빌드 시간 측정
time npm run build

# 예상 결과:
# real    0m43.100s  # ~2초 단축 예상
# user    0m40.850s
# sys     0m2.250s
```

**개선 효과**:
- 빌드 시간: ~5% 단축
- 파일 수: -1 (recommendations.json 제거)
- 메타데이터 크기: -60%

---

**다음 문서**: `02-migration-log.md` (실제 마이그레이션 과정 기록)
