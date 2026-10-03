#!/usr/bin/env node
/**
 * backlog-merge.mjs — 백로그와 오늘의 수집물을 맞물린다.
 *
 * 세 가지를 한다.
 *  1) 이미 발행된 백로그 항목을 done 으로 내린다. 408건이 쌓인 원인의 절반이
 *     이 드리프트다. 큐에 남아 있으면 매일 후보로 다시 올라온다.
 *  2) queued 항목에 오늘 수집물을 조인한다. 뉴스가 붙은 백로그 항목이 그날의
 *     가장 좋은 후보다 — 백로그는 "쓸 만한 주제"를, 수집물은 "지금 쓸 이유"를 준다.
 *  3) 오늘 안 쓰인 신규 수집물을 백로그에 append 한다. 매일 모으고 하루 한 편만
 *     쓰므로 잉여가 매일 생긴다. 큐가 스스로 먹고 스스로 채운다.
 *
 * Usage: backlog-merge.mjs <harvest.verified.json> [--out backlog-slate.json] [--dry]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jaccardSimilarity } from './similarity.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BACKLOG = path.join(ROOT, 'data', 'topic-backlog.json');
const BLOG_KO = path.join(ROOT, 'src', 'content', 'blog', 'ko');
const SLATE_SIZE = 12;

// similarity.js 의 jaccardSimilarity 는 Set 이 아니라 배열을 받는다.
const tokens = (s) => [
  ...new Set(
    String(s ?? '')
      .toLowerCase()
      .split(/[^a-z0-9가-힣ぁ-んァ-ヶ一-鿿.-]+/)
      .filter((t) => t.length > 1)
  ),
];

/** 오래된 백로그 항목은 source 가 빈약하다. 그런 항목이 상위로 오면 안 된다. */
function sourceQuality(topic) {
  const src = String(topic.source ?? '');
  if (!src) return 0;
  let q = Math.min(src.length / 400, 1) * 0.6;
  if (/https?:\/\//.test(src)) q += 0.25;
  if (/\d{4}-\d{2}-\d{2}/.test(src)) q += 0.15; // 확인 날짜가 박혀 있으면 신선하다
  return Math.min(q, 1);
}

async function main() {
  const args = process.argv.slice(2);
  const harvestPath = args.find((a) => !a.startsWith('--'));
  const dry = args.includes('--dry');
  const outIdx = args.indexOf('--out');
  const outPath =
    outIdx >= 0 ? args[outIdx + 1] : path.join(path.dirname(harvestPath ?? '.'), 'backlog-slate.json');

  if (!harvestPath) {
    console.error('usage: backlog-merge.mjs <harvest.verified.json> [--out F] [--dry]');
    process.exit(2);
  }

  const harvest = JSON.parse(await fs.readFile(harvestPath, 'utf8'));
  const items = (harvest.items ?? []).filter((i) => i.verified === true || i.verified === 'x-lead');
  const backlog = JSON.parse(await fs.readFile(BACKLOG, 'utf8'));

  // 1) 발행된 것 정리
  const published = new Set(
    (await fs.readdir(BLOG_KO)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
  );
  let closed = 0;
  for (const t of backlog.topics) {
    if (t.status === 'queued' && t.slug && published.has(t.slug)) {
      t.status = 'done';
      t.published_at = t.published_at ?? 'auto-detected';
      closed += 1;
    }
  }

  // 2) 조인
  const queued = backlog.topics.filter((t) => t.status === 'queued');
  const scored = queued.map((t) => {
    const key = tokens([t.target_keyword, ...(t.secondary_keywords ?? []), t.title_idea].join(' '));
    let best = 0;
    const matched = [];
    for (const it of items) {
      const s = jaccardSimilarity(key, tokens([it.claim, it.title, it.summary].join(' ')));
      if (s > 0.06) matched.push({ url: it.reference_url ?? it.url, claim: it.claim, s: +s.toFixed(3) });
      if (s > best) best = s;
    }
    const prio = typeof t.priority === 'number' ? t.priority : 2;
    const score = best * 0.55 + sourceQuality(t) * 0.30 + (1 / (1 + prio)) * 0.15;
    return { topic: t, score: +score.toFixed(4), harvest_matches: matched.sort((a, b) => b.s - a.s).slice(0, 4) };
  });

  scored.sort((a, b) => b.score - a.score);
  const slate = scored.slice(0, SLATE_SIZE).map((r) => ({
    slug: r.topic.slug,
    title_idea: r.topic.title_idea,
    content_type: r.topic.content_type,
    target_keyword: r.topic.target_keyword,
    priority: r.topic.priority,
    // source 는 자르지 않는다. 최신 항목의 source 는 1차 출처 인용문과 확인 날짜,
    // 이전 글이 남긴 미측정 갭까지 담고 있어 그 자체가 칼럼 재료다.
    source: r.topic.source,
    notes: r.topic.notes,
    score: r.score,
    harvest_matches: r.harvest_matches,
  }));

  // 3) 안 쓰인 신규 수집물을 큐에 넣는다
  const knownKeys = new Set(backlog.topics.map((t) => String(t.target_keyword ?? '').toLowerCase()));
  const today = new Date().toISOString().slice(0, 10);
  let appended = 0;
  for (const it of items) {
    const claim = String(it.claim ?? it.title ?? '').trim();
    if (!claim || knownKeys.has(claim.toLowerCase())) continue;
    const usedBySlate = slate.some((s) =>
      (s.harvest_matches ?? []).some((m) => m.url === (it.reference_url ?? it.url))
    );
    if (usedBySlate) continue;
    backlog.topics.push({
      slug: null,
      title_idea: claim.slice(0, 120),
      content_type: 'news',
      target_keyword: claim.slice(0, 80),
      secondary_keywords: [],
      search_intent: 'informational',
      priority: 2,
      source: `${it.reference_url ?? it.url} (${today} 확인, HTTP ${it.http_code ?? '?'})${it.quote ? ` — "${it.quote}"` : ''}`,
      added_at: today,
      status: 'queued',
      notes: 'scout 자동 수집. 쓰기 전에 1차 출처를 다시 연다.',
    });
    knownKeys.add(claim.toLowerCase());
    appended += 1;
  }

  if (!dry) {
    backlog.updated_at = today;
    await fs.writeFile(BACKLOG, JSON.stringify(backlog, null, 2) + '\n');
    await fs.writeFile(outPath, JSON.stringify({ generated_at: today, slate }, null, 2) + '\n');
  }

  console.log(
    `[backlog-merge] 발행 확인으로 done 처리 ${closed} · queued ${queued.length} · ` +
      `슬레이트 ${slate.length} · 신규 append ${appended}${dry ? ' (dry)' : ''}`
  );
  if (slate.length === 0) {
    console.error('[backlog-merge] 슬레이트가 비었다 — queued 항목이 없다');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('[backlog-merge]', e.message);
  process.exit(1);
});
