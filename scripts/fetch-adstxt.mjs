// Mediavine 호스팅 ads.txt를 받아 dist/ads.txt로 서빙한다.
// GitHub Pages는 서버 측 301 리다이렉트가 불가능하므로, Mediavine이 허용하는
// 폴백(정적 사본 서빙)을 쓰되 매일 자동 빌드(deploy.yml cron)로 최신을 유지한다.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ADSTXT_URL =
  'https://adstxt.journeymv.com/sites/b87a8865-5f57-423f-81d5-36dd4700eafe/ads.txt';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(repoRoot, 'dist', 'ads.txt');

const RETRIES = 3;

async function fetchWithRetry() {
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(ADSTXT_URL, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (error) {
      lastError = error;
      console.warn(`ads.txt fetch 실패 (${attempt}/${RETRIES}): ${error.message}`);
      if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 2_000 * attempt));
    }
  }
  throw lastError;
}

const body = await fetchWithRetry();

// 판매자 레코드가 실제로 들어있는지 검증 — 빈 응답/에러 페이지를 그대로 서빙하면
// Mediavine 크롤러 검증에 실패하므로 빌드를 멈추는 편이 낫다.
const recordLines = body
  .split('\n')
  .filter((line) => /^[a-z0-9.-]+,\s*\S+,\s*(DIRECT|RESELLER)/i.test(line.trim()));
if (recordLines.length < 10) {
  throw new Error(`ads.txt 응답이 비정상 (판매자 레코드 ${recordLines.length}건)`);
}

await fs.writeFile(outPath, body);
console.log(`✅ dist/ads.txt 생성 (판매자 레코드 ${recordLines.length}건)`);
