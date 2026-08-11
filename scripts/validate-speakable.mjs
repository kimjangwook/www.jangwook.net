#!/usr/bin/env node
/**
 * speakable(SpeakableSpecification)의 cssSelector가 빌드 산출물에서 실제로 해석되는지 검사한다.
 *
 * 배경: cssSelector는 값을 담는 마크업이 아니라 DOM을 가리키는 포인터다.
 * 클래스명이 바뀌거나 선택자 의미를 오해하면 아무 오류 없이 조용히 썩는다.
 * 실제로 `.article-summary`는 DOM에 없는 채 1,332장에 실려 나갔고,
 * `article p:first-of-type`은 리드 문단 1개가 아니라 페이지당 13개 안팎을 가리켰다.
 *
 * 판정:
 *  - 각 선택자는 표본의 모든 페이지에서 1개 이상 매치해야 한다(0이면 실패).
 *  - 문단 선택자는 페이지당 MAX_PARAGRAPH_MATCHES개를 넘지 않아야 한다(과다 지시 방지).
 */
import { readFileSync, globSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const SAMPLE_PER_LANG = 5;
const MAX_PARAGRAPH_MATCHES = 2;

function pickSample(files) {
  const byLang = {};
  for (const file of files) {
    const lang = file.match(/dist\/(ko|ja|en|zh)\//)?.[1];
    if (lang) (byLang[lang] ||= []).push(file);
  }
  return Object.values(byLang).flatMap((group) => {
    const step = Math.max(1, Math.ceil(group.length / SAMPLE_PER_LANG));
    return group.filter((_, i) => i % step === 0).slice(0, SAMPLE_PER_LANG);
  });
}

function extractSelectors(html) {
  const match = html.match(/"cssSelector":\s*(\[[^\]]*\])/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

const pages = globSync('dist/**/blog/**/index.html')
  .sort()
  .filter((file) => readFileSync(file, 'utf8').includes('SpeakableSpecification'));

if (pages.length === 0) {
  console.log('validate-speakable: SpeakableSpecification 없음 — 검사 생략');
  process.exit(0);
}

const failures = [];
const sample = pickSample(pages);

for (const file of sample) {
  const html = readFileSync(file, 'utf8');
  const selectors = extractSelectors(html);
  if (!selectors) {
    failures.push(`${file}: cssSelector를 파싱하지 못했다`);
    continue;
  }
  const dom = new JSDOM(html);
  for (const selector of selectors) {
    let count;
    try {
      count = dom.window.document.querySelectorAll(selector).length;
    } catch {
      failures.push(`${file}: 선택자 구문 오류 "${selector}"`);
      continue;
    }
    if (count === 0) {
      failures.push(`${file}: "${selector}" 가 아무것도 매치하지 않는다`);
    } else if (/\bp\b|paragraph/.test(selector) && count > MAX_PARAGRAPH_MATCHES) {
      failures.push(`${file}: "${selector}" 가 ${count}개를 매치한다 (허용 ${MAX_PARAGRAPH_MATCHES})`);
    }
  }
  dom.window.close();
}

if (failures.length > 0) {
  console.error(`❌ validate-speakable 실패 (${failures.length}건)`);
  for (const line of failures.slice(0, 20)) console.error(`  - ${line}`);
  process.exit(1);
}

console.log(
  `✅ validate-speakable 통과 — speakable 페이지 ${pages.length}장 중 표본 ${sample.length}장, 선택자 전부 해석됨`
);
