import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

// jangwook 루프 틱 — 컴팩트 JSON 상태만 출력한다 (ops/LOOP.md의 트리거 매트릭스 참조).
// 원칙: 이 스크립트는 "무엇이 due인가"만 판정하고, 실작업은 루프가 스폰하는 에이전트가 한다.
// due 플래그는 보고와 동시에 상태 파일에 마킹된다 (중복 스폰 방지 — 에이전트 실패 시 수동 재실행).

const repoRoot = process.cwd();
const statePath = path.join(repoRoot, 'ops/loop_state.json');
const effloow = path.join(process.env.HOME, 'Documents/workspace/web.effloow.com');

// JST 성분을 Intl로 직접 추출 (Date 왕복 변환은 머신 타임존에 따라 오차 — 2026-07-18 수정)
const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short',
});
const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
const today = `${parts.year}-${parts.month}-${parts.day}`;
const ymd = today.slice(2).replaceAll('-', '');
const hour = Number(parts.hour) % 24;
const minute = Number(parts.minute);
const dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday];

let state = {};
try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { /* 첫 실행 */ }

const out = { ts: `${today}T${parts.hour}:${parts.minute}`, flags: [] };
const mark = (key, value = today) => { state[key] = value; };

// ── xqa_due: 07:00 X 생성 후 첫 틱 ──────────────────────────────
const xDir = path.join(effloow, `contents/${ymd}/x/daily`);
let xCount = 0;
try { xCount = fs.readdirSync(xDir).filter((f) => /^post-\d+\.md$/.test(f)).length; } catch { /* 미생성 */ }
out.x_queue_today = xCount;
if (hour >= 7 && xCount >= 10 && state.last_xqa !== today) {
  out.flags.push('xqa_due');
  mark('last_xqa');
}
if (hour >= 8 && xCount < 10 && state.last_xgen_alert !== today) {
  out.flags.push('xgen_missing'); // 07:00 생성 실패 의심 — morning-daily-x 로그 확인 필요
  mark('last_xgen_alert');
}

// ── catchup_due: 08시/18시 이후 각 1회 ──────────────────────────
const slot = hour >= 18 ? 'pm' : hour >= 8 ? 'am' : null;
if (slot && state[`last_catchup_${slot}`] !== today) {
  out.flags.push(`catchup_due:${slot}`);
  mark(`last_catchup_${slot}`);
}

// ── post_qa_due: 15:23 발행 후 신규 블로그 글 커밋 감지 ─────────
let head = '';
try { head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot }).toString().trim(); } catch { /* */ }
out.head = head.slice(0, 7);
if (state.last_head && state.last_head !== head) out.flags.push('repo_changed');
if (hour >= 16 && state.last_post_qa !== today) {
  let newPost = '';
  try {
    newPost = execFileSync(
      'git',
      ['log', `--since=${today} 15:00`, '--oneline', '--grep=feat(blog): add', '-1'],
      { cwd: repoRoot }
    ).toString().trim();
  } catch { /* */ }
  if (newPost) {
    out.flags.push('post_qa_due');
    out.new_post = newPost;
    mark('last_post_qa');
  }
}
mark('last_head', head);

// ── queue_low: 토픽 백로그 잔량 ─────────────────────────────────
try {
  const backlog = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/topic-backlog.json'), 'utf8'));
  const queued = backlog.topics.filter((t) => t.status === 'queued').length;
  out.backlog_queued = queued;
  if (queued < 5 && state.last_replenish !== today) {
    out.flags.push('queue_low');
    mark('last_replenish');
  }
} catch { out.backlog_queued = null; }

// ── review_due: 23:30 이후 1회 ──────────────────────────────────
if ((hour === 23 && minute >= 30) || (hour < 7 && state.last_review !== today)) {
  // 23:30 이후 또는 자정 넘긴 첫 틱 (전날 리뷰 미실행분 회수)
  const reviewKey = hour < 7 ? yesterdayOf(today) : today;
  if (state.last_review !== reviewKey) {
    out.flags.push('review_due');
    mark('last_review', reviewKey);
  }
}
function yesterdayOf(d) {
  const t = new Date(d); t.setDate(t.getDate() - 1);
  return t.toISOString().slice(0, 10);
}

// ── 주간: improve(수) / service_pulse(월) ───────────────────────
const week = `${today.slice(0, 7)}-W${Math.ceil(Number(parts.day) / 7)}`;
if (dow === 3 && state.last_improve !== week) { out.flags.push('improve_due'); mark('last_improve', week); }
if (dow === 1 && state.last_service_pulse !== week) { out.flags.push('service_pulse_due'); mark('last_service_pulse', week); }

fs.mkdirSync(path.dirname(statePath), { recursive: true });
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
console.log(JSON.stringify(out));
