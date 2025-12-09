import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * WebP 이미지 변환 스크립트
 *
 * 사용법:
 *   node scripts/convert-to-webp.js <경로> [옵션]
 *
 * 예시:
 *   node scripts/convert-to-webp.js src/assets/blog/image.png
 *   node scripts/convert-to-webp.js src/assets/blog/
 *   node scripts/convert-to-webp.js src/assets/blog/ --quality 85
 *   node scripts/convert-to-webp.js src/assets/blog/ --replace
 *
 * 옵션:
 *   --quality <숫자>  WebP 품질 (1-100, 기본값: 80)
 *   --replace         변환 후 원본 삭제
 *   --recursive       하위 폴더 포함 (기본: true)
 *   --dry-run         실제 변환 없이 대상 파일만 출력
 */

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp', '.avif'];
const DEFAULT_QUALITY = 80;

/**
 * 옵션 파싱
 */
function parseArgs(args) {
  const options = {
    path: null,
    quality: DEFAULT_QUALITY,
    replace: false,
    recursive: true,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--quality' && args[i + 1]) {
      options.quality = parseInt(args[++i], 10);
      if (isNaN(options.quality) || options.quality < 1 || options.quality > 100) {
        console.error('❌ 품질 값은 1-100 사이여야 합니다.');
        process.exit(1);
      }
    } else if (arg === '--replace') {
      options.replace = true;
    } else if (arg === '--no-recursive') {
      options.recursive = false;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (!arg.startsWith('--')) {
      options.path = arg;
    }
  }

  return options;
}

/**
 * 디렉토리에서 이미지 파일 목록 가져오기
 */
function getImageFiles(dirPath, recursive = true) {
  const files = [];

  function scanDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory() && recursive) {
        scanDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  scanDir(dirPath);
  return files;
}

/**
 * 단일 파일 WebP 변환
 */
async function convertToWebp(inputPath, options) {
  const ext = path.extname(inputPath).toLowerCase();

  if (!SUPPORTED_FORMATS.includes(ext)) {
    console.log(`⏭️  건너뜀 (미지원 형식): ${inputPath}`);
    return null;
  }

  const dir = path.dirname(inputPath);
  const basename = path.basename(inputPath, ext);
  const outputPath = path.join(dir, `${basename}.webp`);

  // 이미 WebP인 경우 건너뛰기
  if (ext === '.webp') {
    console.log(`⏭️  건너뜀 (이미 WebP): ${inputPath}`);
    return null;
  }

  // 출력 파일이 이미 존재하는 경우
  if (fs.existsSync(outputPath) && !options.replace) {
    console.log(`⏭️  건너뜀 (이미 존재): ${outputPath}`);
    return null;
  }

  if (options.dryRun) {
    console.log(`🔍 [dry-run] ${inputPath} → ${outputPath}`);
    return { input: inputPath, output: outputPath, size: { before: 0, after: 0 } };
  }

  try {
    const inputStats = fs.statSync(inputPath);

    await sharp(inputPath)
      .webp({ quality: options.quality })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`✅ ${inputPath}`);
    console.log(`   → ${outputPath}`);
    console.log(`   📊 ${formatBytes(inputStats.size)} → ${formatBytes(outputStats.size)} (${reduction}% 감소)`);

    // 원본 삭제 옵션
    if (options.replace) {
      fs.unlinkSync(inputPath);
      console.log(`   🗑️  원본 삭제됨`);
    }

    return {
      input: inputPath,
      output: outputPath,
      size: {
        before: inputStats.size,
        after: outputStats.size
      }
    };
  } catch (error) {
    console.error(`❌ 변환 실패: ${inputPath}`);
    console.error(`   ${error.message}`);
    return null;
  }
}

/**
 * 바이트를 읽기 쉬운 형식으로 변환
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
📸 WebP 이미지 변환 스크립트

사용법:
  node scripts/convert-to-webp.js <경로> [옵션]

예시:
  node scripts/convert-to-webp.js src/assets/blog/image.png
  node scripts/convert-to-webp.js src/assets/blog/
  node scripts/convert-to-webp.js src/assets/blog/ --quality 85
  node scripts/convert-to-webp.js src/assets/blog/ --replace

옵션:
  --quality <숫자>   WebP 품질 (1-100, 기본값: ${DEFAULT_QUALITY})
  --replace          변환 후 원본 삭제
  --no-recursive     하위 폴더 제외
  --dry-run          실제 변환 없이 대상 파일만 출력
  --help, -h         도움말 표시

지원 형식: ${SUPPORTED_FORMATS.join(', ')}
`);
    process.exit(0);
  }

  const options = parseArgs(args);

  if (!options.path) {
    console.error('❌ 변환할 파일 또는 폴더 경로를 지정해주세요.');
    process.exit(1);
  }

  const targetPath = path.resolve(options.path);

  if (!fs.existsSync(targetPath)) {
    console.error(`❌ 경로를 찾을 수 없습니다: ${targetPath}`);
    process.exit(1);
  }

  console.log('🚀 WebP 변환 시작\n');
  console.log(`📁 경로: ${targetPath}`);
  console.log(`🎨 품질: ${options.quality}`);
  console.log(`🗑️  원본 삭제: ${options.replace ? '예' : '아니오'}`);
  if (options.dryRun) {
    console.log('🔍 모드: dry-run (실제 변환 없음)');
  }
  console.log('');

  const stats = fs.statSync(targetPath);
  let files = [];

  if (stats.isDirectory()) {
    files = getImageFiles(targetPath, options.recursive);
    console.log(`📋 발견된 이미지: ${files.length}개\n`);
  } else {
    files = [targetPath];
  }

  if (files.length === 0) {
    console.log('⚠️  변환할 이미지가 없습니다.');
    process.exit(0);
  }

  const results = [];
  for (const file of files) {
    const result = await convertToWebp(file, options);
    if (result) {
      results.push(result);
    }
  }

  // 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 변환 완료 요약');
  console.log('='.repeat(50));
  console.log(`✅ 성공: ${results.length}개`);
  console.log(`⏭️  건너뜀: ${files.length - results.length}개`);

  if (results.length > 0 && !options.dryRun) {
    const totalBefore = results.reduce((sum, r) => sum + r.size.before, 0);
    const totalAfter = results.reduce((sum, r) => sum + r.size.after, 0);
    const totalReduction = ((1 - totalAfter / totalBefore) * 100).toFixed(1);

    console.log(`\n💾 총 용량 변화:`);
    console.log(`   ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}`);
    console.log(`   ${formatBytes(totalBefore - totalAfter)} 절약 (${totalReduction}% 감소)`);
  }
}

main().catch(console.error);
