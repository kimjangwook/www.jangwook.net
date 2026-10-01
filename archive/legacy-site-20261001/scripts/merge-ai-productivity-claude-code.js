import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chaptersDir = path.resolve(
  __dirname,
  '../publish/ai-productivity-claude-code/chapters/ko',
);
const outputPath = path.join(chaptersDir, 'combined-ko.md');

// Order mirrors publish/ai-productivity-claude-code/BOOK_STRUCTURE.md
const orderedFiles = [
  '00-frontmatter.md',
  '00-toc.md',
  'chapter-01.md',
  'chapter-02.md',
  'chapter-03.md',
  'chapter-04.md',
  'chapter-05.md',
  'chapter-06.md',
  'chapter-07.md',
  'chapter-08.md',
  'chapter-09.md',
  'chapter-10.md',
  'chapter-11.md',
  'chapter-12.md',
  'chapter-13.md',
  'chapter-14.md',
  'chapter-15.md',
  'chapter-16.md',
  'chapter-17.md',
  'chapter-18.md',
  'appendix-a.md',
  'appendix-b.md',
  'appendix-c.md',
];

async function mergeChapters() {
  const merged = [];

  for (const filename of orderedFiles) {
    const filePath = path.join(chaptersDir, filename);
    const content = await fs.readFile(filePath, 'utf8');
    merged.push(content.trimEnd());
  }

  const separator = '\n\n---\n\n';
  const combined = `${merged.join(separator)}\n`;

  await fs.writeFile(outputPath, combined, 'utf8');
  console.log(`Merged ${orderedFiles.length} files into ${outputPath}`);
}

mergeChapters().catch((error) => {
  console.error('Failed to merge chapters:', error);
  process.exitCode = 1;
});
