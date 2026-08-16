import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  calculateSimilarity,
  determineType,
  generateReason
} from './similarity.js';

function toJstDateKey(date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function normalizeDateKey(value) {
  if (!value) return null;
  if (value instanceof Date) return toJstDateKey(value);

  const stringValue = String(value).trim();
  const dateOnly = stringValue.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) return dateOnly[1];

  const parsed = new Date(stringValue);
  if (Number.isNaN(parsed.valueOf())) return null;
  return toJstDateKey(parsed);
}

/**
 * 추천 후보로 허용되는 슬러그 집합.
 * validate-publishing.mjs의 indexable 기준과 동일:
 * draft 아님, noindex 아님, JST 기준 오늘 이전 발행.
 */
function loadIndexableSlugs() {
  const todayJst = toJstDateKey(new Date());
  const indexable = new Set();
  const koDir = path.join('src', 'content', 'blog', 'ko');

  for (const file of fs.readdirSync(koDir)) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const parsed = matter(fs.readFileSync(path.join(koDir, file), 'utf-8'));
    const pubDateKey = normalizeDateKey(parsed.data.pubDate);
    if (parsed.data.draft === true) continue;
    if (parsed.data.noindex === true) continue;
    if (!pubDateKey || pubDateKey > todayJst) continue;
    indexable.add(file.replace(/\.(md|mdx)$/, ''));
  }

  return indexable;
}

/**
 * V3 추천 생성 메인 함수
 */
async function generateRecommendationsV3() {
  console.log('🚀 Starting V3 recommendation generation...\n');

  // 1. 메타데이터 로드
  const metadata = JSON.parse(fs.readFileSync('post-metadata.json', 'utf-8'));
  console.log(`✓ Loaded metadata for ${Object.keys(metadata).length} posts\n`);

  const indexableSlugs = loadIndexableSlugs();
  console.log(`✓ ${indexableSlugs.size} indexable posts eligible as recommendation targets\n`);

  // 2. 각 포스트마다 추천 계산
  const recommendations = {};

  for (const slug in metadata) {
    const source = metadata[slug];
    const sourcePubDate = new Date(source.pubDate);

    // 후보 포스트 필터링 (시간 역행 방지 + draft/noindex/미래 발행 글 제외)
    const candidates = Object.entries(metadata)
      .filter(([candidateSlug, _]) => candidateSlug !== slug)
      .filter(([candidateSlug, _]) => indexableSlugs.has(candidateSlug))
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
  const languages = ['ko', 'ja', 'en', 'zh'];
  let updatedCount = 0;

  for (const slug in recommendations) {
    const recs = recommendations[slug];

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
