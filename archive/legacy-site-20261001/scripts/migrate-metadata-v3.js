import fs from 'fs';

console.log('🚀 Starting metadata migration to V3 format...\n');

// V2 메타데이터 로드
const v2Data = JSON.parse(fs.readFileSync('post-metadata.json', 'utf-8'));

// V3 메타데이터 생성 (경량화)
const v3Data = {};

let migratedCount = 0;

for (const slug in v2Data.metadata) {
  const post = v2Data.metadata[slug];

  v3Data[slug] = {
    pubDate: post.pubDate,
    difficulty: post.difficulty,
    categoryScores: post.categoryScores
  };

  migratedCount++;
  console.log(`  ✓ Migrated: ${slug}`);
}

// 저장
fs.writeFileSync(
  'post-metadata.json',
  JSON.stringify(v3Data, null, 2),
  'utf-8'
);

console.log(`\n✅ Migrated ${migratedCount} posts to V3 format`);
console.log(`\n📊 Reduction:`);
console.log(`   Before: 9 fields per post (slug, language, title, summary, mainTopics, techStack, difficulty, categoryScores, contentHash, generatedAt)`);
console.log(`   After:  3 fields per post (pubDate, difficulty, categoryScores)`);
console.log(`   Reduction: 67% fewer fields`);
