import fs from 'fs';
import path from 'path';
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
