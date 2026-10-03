/**
 * List all improvements with their titles
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const improvementsDir = join(projectRoot, 'src/data/improvements');

// Read all JSON files
const files = readdirSync(improvementsDir).filter(f => f.endsWith('.json'));

const improvements = files.map(filename => {
  const filepath = join(improvementsDir, filename);
  const content = JSON.parse(readFileSync(filepath, 'utf-8'));
  return {
    filename,
    date: content.date,
    titleKo: content.title?.ko || 'untitled',
    status: content.status
  };
});

// Sort by date
improvements.sort((a, b) => {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();
  return dateA - dateB;
});

console.log('\n📋 모든 개선사항 목록:\n');

for (const imp of improvements) {
  const statusIcon = imp.status === 'completed' ? '✅' :
                     imp.status === 'planned' ? '📅' :
                     '🔄';
  console.log(`${statusIcon} ${imp.date} | ${imp.titleKo}`);
  console.log(`   파일: ${imp.filename}\n`);
}

console.log(`\n총 ${improvements.length}개 개선사항`);
