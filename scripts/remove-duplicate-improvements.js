/**
 * Find and remove duplicate improvements, keeping the one with the latest date
 */
import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const improvementsDir = join(projectRoot, 'src/data/improvements');

// Read all JSON files
const files = readdirSync(improvementsDir).filter(f => f.endsWith('.json'));

console.log(`Found ${files.length} improvement files\n`);

// Load all improvements with their filenames
const improvements = files.map(filename => {
  const filepath = join(improvementsDir, filename);
  const content = JSON.parse(readFileSync(filepath, 'utf-8'));
  return {
    filename,
    filepath,
    ...content
  };
});

// Group by title (ko)
const groupedByTitle = {};

for (const improvement of improvements) {
  const titleKo = improvement.title?.ko || 'untitled';

  if (!groupedByTitle[titleKo]) {
    groupedByTitle[titleKo] = [];
  }

  groupedByTitle[titleKo].push(improvement);
}

// Find duplicates and remove old ones
let duplicatesFound = 0;
let filesDeleted = 0;

for (const [title, group] of Object.entries(groupedByTitle)) {
  if (group.length > 1) {
    console.log(`\n📌 중복 발견: "${title}"`);
    console.log(`   총 ${group.length}개 파일:`);

    // Sort by date (descending - latest first)
    group.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    // Keep the first one (latest date), delete the rest
    const toKeep = group[0];
    const toDelete = group.slice(1);

    console.log(`   ✅ 유지: ${toKeep.filename} (날짜: ${toKeep.date})`);

    for (const item of toDelete) {
      console.log(`   ❌ 삭제: ${item.filename} (날짜: ${item.date})`);
      unlinkSync(item.filepath);
      filesDeleted++;
    }

    duplicatesFound++;
  }
}

console.log(`\n\n📊 요약:`);
console.log(`   - 중복 그룹 수: ${duplicatesFound}`);
console.log(`   - 삭제된 파일 수: ${filesDeleted}`);
console.log(`   - 남은 파일 수: ${files.length - filesDeleted}`);
