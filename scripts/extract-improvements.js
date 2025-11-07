/**
 * Extract improvements from improvement-history.astro and save as individual JSON files
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const improvementHistoryPath = join(projectRoot, 'src/pages/[lang]/improvement-history.astro');
const outputDir = join(projectRoot, 'src/data/improvements');

// Read the file
const content = readFileSync(improvementHistoryPath, 'utf-8');

// Extract improvements array (lines 16-1872)
const lines = content.split('\n');
const improvementsLines = lines.slice(15, 1872); // 0-indexed, so 16-1872 becomes 15-1871

// Find all improvement objects
let currentImprovement = null;
let improvements = [];
let braceCount = 0;
let inImprovement = false;

for (const line of improvementsLines) {
  // Skip comments
  if (line.trim().startsWith('//')) {
    continue;
  }

  // Detect start of improvement object
  if (line.trim() === '{' && !inImprovement) {
    inImprovement = true;
    currentImprovement = [];
    braceCount = 1;
    currentImprovement.push(line);
    continue;
  }

  if (inImprovement) {
    currentImprovement.push(line);

    // Count braces
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }

    // End of improvement object
    if (braceCount === 0) {
      // Parse the improvement
      try {
        const improvementText = currentImprovement.join('\n');
        // Remove trailing comma
        let cleanedText = improvementText.replace(/,\s*$/, '');

        // Replace template literals with placeholders for sourceReport
        // Pattern: sourceReport: `/${lang}/...`
        cleanedText = cleanedText.replace(
          /sourceReport:\s*`\/\$\{lang\}([^`]+)`/g,
          'sourceReport: "/{lang}$1"'
        );

        // This is a hack to eval the object
        // We'll wrap it in parentheses to make it an expression
        const improvement = eval(`(${cleanedText})`);
        improvements.push(improvement);
      } catch (e) {
        console.error('Failed to parse improvement:', e);
        console.error('Text:', currentImprovement.slice(0, 5).join('\n'));
      }

      inImprovement = false;
      currentImprovement = null;
    }
  }
}

console.log(`Extracted ${improvements.length} improvements`);

// Create output directory
mkdirSync(outputDir, { recursive: true });

// Save each improvement as a JSON file
for (const improvement of improvements) {
  const date = improvement.date || '2025-01-01';
  const titleKo = improvement.title?.ko || 'untitled';

  // Create filename from date and title
  const slug = titleKo
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  const filename = `${date}-${slug}.json`;
  const filepath = join(outputDir, filename);

  writeFileSync(filepath, JSON.stringify(improvement, null, 2), 'utf-8');
  console.log(`Saved: ${filename}`);
}

console.log(`\nAll improvements saved to ${outputDir}`);
