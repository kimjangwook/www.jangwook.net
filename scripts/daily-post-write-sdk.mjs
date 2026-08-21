// daily-post 집필을 Claude Agent SDK 편집부로 돌린다 — subagent 구조.
//
// 세션은 하나다: 편집장(sonnet, medium)이 Task 도구로 서브에이전트를 위임 호출한다.
//   writer         집필자 (sonnet, effort low)  — 원고를 쓰고 고치는 유일한 손
//   editor-style   문체·리듬 편집자 (sonnet, medium) — 읽기 전용
//   editor-pattern 정형구·구조 편집자 (sonnet, medium) — 읽기 전용
// 라운드 수(최대 2)와 "수정이 충분한가"의 판단은 편집장 몫이다. 스크립트가 강제하는
// 것은 바깥 계약뿐이다: 종료코드 0 + 산출 파일 존재 + 전체 타임아웃.
//
// 집필 effort 가 low 인 이유는 daily-post-pipeline.sh §CODEX_EFFORT 의 2026-08-15 A/B 와
// 같다 — 추론량을 올릴수록 산문이 균일해지고 그 균일함이 AI 문체로 읽힌다. 편집자·
// 편집장은 대조와 판정이 일이라 medium 을 줘도 문체가 상하지 않는다.
//
// 편집자 둘의 분담은 2026-08-19 프롬프트 감사의 결론이다: review·seal-check 가 문체를
// 명시적으로 배제해 "문체 책임자"가 없었고, 어휘 층은 voice-anti-ai.md 가 잡지만
// 정형구·인지 리듬은 아무도 안 봤다.
//
// 호출: node scripts/daily-post-write-sdk.mjs --lang ko --slug <slug> --prompt-file <f>
// 성공 판정: 종료코드 0 + src/content/blog/$lang/$slug.md 존재 (파이프라인과 동일 계약).
import { query } from '@anthropic-ai/claude-agent-sdk';
import { existsSync } from 'node:fs';

const PROJECT_DIR = process.env.PROJECT_DIR ?? '/Users/jangwook/workspace/www.jangwook.net';
const WRITE_EFFORT = process.env.SDK_WRITE_EFFORT ?? 'low';
const EDIT_EFFORT = process.env.SDK_EDIT_EFFORT ?? 'low';
const MODEL = process.env.SDK_WRITE_MODEL ?? 'sonnet';
const TIMEOUT_MIN = Number(process.env.SDK_TEAM_TIMEOUT_MIN ?? 45);

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const { lang, slug, 'prompt-file': promptFile } = args;
if (!lang || !slug || !promptFile) {
  console.error('usage: daily-post-write-sdk.mjs --lang <l> --slug <s> --prompt-file <f>');
  process.exit(2);
}
const target = `${PROJECT_DIR}/src/content/blog/${lang}/${slug}.md`;

const log = (m) => console.log(`[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] sdk-team ${lang}: ${m}`);

const EDITOR_COMMON = `사실 관계는 판정하지 마라 — 그건 뒤 단계(seal-check)의 일이고, 사실 기준은 data/column-brief.md 의 ## LOCKED 블록이다.
scripts/prompts/voice-anti-ai.md 를 먼저 읽고, 지목된 원고를 읽고, 핵심 지적만 남겨라.
지적은 "원문 인용 → 왜 문제인가 → 고치는 방향 한 줄" 형식으로 최대 3~5개만 간결하게. 사소한 자잘한 트집은 피하고 가독성과 핵심 톤앤매너만 본다. 지적이 없으면 "지적 없음"이라고만 답하라.
원고를 고칠 권한은 너에게 없다. 너의 최종 텍스트가 그대로 편집장에게 보고된다.`;

// 편집자 A: 문체·리듬
const EDITOR_STYLE = `${lang} 원고의 문체·리듬 편집자다.
${EDITOR_COMMON}
너만 보는 기준:
- 인지 리듬: 관찰→유보→단정→재관찰이 순환하는가. 장문 단정 3연속 구간을 찾아라.
- 사전식 괄호 설명 제거: "Search Console(웹사이트 검색 노출을 확인하는 도구)" 같은 부자연스러운 단어 괄호 풀이가 있으면 전량 삭제하고 자연스럽게 풀도록 지적하라.
- 언어 고유 티 및 번역투: ko 는 "~에 대하여", "~를 통해", "~에 의해", "-되어지고 있다", 문두 "그리고" 반복·명사형 종결("-함", "-라는 점") 남발, ja 는 体言止め 연타·「...だ。...だ。...だ。」, en 은 3항 병렬 리스트 연발, zh 는 四字対仗 연발.
- 특수문자: 물결표(~, 〜, ～)가 남아있는가. 하이픈(-)이나 "A에서 B", "A부터 B까지"로 바꾸라고 지적하라.
- 도입: 첫 단락이 목적(무엇이 궁금했나)→행동(무엇을 했나)→결과 요지 순으로 명확한가.`;

// 편집자 B: 정형구·구조
const EDITOR_PATTERN = `${lang} 원고의 정형구·구조 편집자다.
${EDITOR_COMMON}
너만 보는 기준:
- 제목: "무엇을 했더니 어땠다"가 읽히는가. 목적도 결과도 없는 제목이면 지적하라.
- 발행 이력의 기계적 반복 문구("결론부터 말한다", "판단은 이렇다" 등 리터럴 반복) 점검.
- 마무리: 인위적 요약·교훈 나열 없이 핵심 판단이나 열린 관찰로 자연스럽게 닫혔는가.`;

const WRITER = `daily-post 의 ${lang} 집필자다. 원고를 쓰고 고치는 손은 이 편집부에서 너뿐이다.
- 첫 위임에서는 편집장이 알려 주는 집필 지시 파일을 읽고 그 지시를 그대로 따라 ${target} 에 원고를 쓴다.
- 수정 위임에서는 ${target} 과 data/column-brief.md 를 다시 읽고, 전달받은 지적 중 필수적인 것만 반영한다.
  사실·숫자·인용(LOCKED)은 절대 바꾸지 않는다. 새 사실을 더하지 않는다. 지적받지 않은 문장은 건드리지 않는다.
- 완료 보고는 두세 줄: 무엇을 수정했는지.`;

const CHIEF = `너는 daily-post ${lang} 편집부의 편집장이다. 직접 산문을 쓰지 않는다 — 위임하고 판정한다.

절차:
1. writer 에게 위임한다: "집필 지시 파일 ${promptFile} 을 읽고 그대로 따라 원고를 써라."
2. ${target} 이 생겼는지 확인한다. 없으면 writer 에게 한 번 더 위임하고, 그래도 없으면 "FAIL: <이유>" 로 끝낸다.
3. editor-style 과 editor-pattern 에게 **같은 턴에 병렬로** 위임한다: "원고 ${target} 을 검토하라."
4. 두 지적 중 명확한 결함(물결표, 어색한 번역투, 심각한 리듬 붕괴)만 골라 writer 에게 1회 수정을 위임한다. 사소한 트집은 기각한다.
5. 수정본이 생성되면 바로 종료한다 (최대 1라운드 수정). 과도한 편집은 오히려 산문을 경직되게 만든다.
6. 최종 보고: "DONE round=1 adopted=<채택 수> rejected=<기각 수>".`;

원고를 네가 직접 고치는 것은 금지다. 고치는 손은 writer 하나여야 어디까지가 누구 문장인지 남는다.`;

const abort = new AbortController();
const timer = setTimeout(() => abort.abort(), TIMEOUT_MIN * 60_000);

// settingSources 를 비운다 — 'project' 는 툴 108개를 실어 비용이 붙고(life-manager
// CLAUDE.md 실측), 읽을 파일은 프롬프트가 전부 지정한다.
const options = {
  cwd: PROJECT_DIR,
  model: MODEL,
  effort: EDIT_EFFORT, // 편집장. 판정이 일이라 medium — 집필 effort 는 writer 정의에 있다
  settingSources: [],
  systemPrompt: { type: 'preset', preset: 'claude_code', append: CHIEF },
  permissionMode: 'bypassPermissions',
  allowDangerouslySkipPermissions: true,
  // 편집장은 위임(Task)과 확인(Read)만 한다. Write/Edit 가 없어 "직접 고치기"가
  // 프롬프트 규범이 아니라 툴 표면에서 막힌다.
  allowedTools: ['Task', 'Read', 'Glob', 'Grep'],
  maxTurns: 40,
  abortController: abort,
  agents: {
    writer: {
      description: `${lang} 원고를 쓰고 고치는 집필자. 초고 집필과 지적 반영 수정 모두 이 에이전트에게 위임한다.`,
      prompt: WRITER,
      tools: ['Read', 'Write', 'Edit', 'Glob', 'Grep'],
      model: MODEL,
      effort: WRITE_EFFORT,
      maxTurns: 80,
    },
    'editor-style': {
      description: '문체·리듬 편집자. 완성된 원고의 인지 리듬과 언어 고유 AI 티를 읽기 전용으로 검토한다.',
      prompt: EDITOR_STYLE,
      tools: ['Read', 'Glob', 'Grep'],
      model: MODEL,
      effort: EDIT_EFFORT,
      maxTurns: 30,
    },
    'editor-pattern': {
      description: '정형구·구조 편집자. 발행 이력의 반복 문구와 글 골격의 정형성을 읽기 전용으로 검토한다.',
      prompt: EDITOR_PATTERN,
      tools: ['Read', 'Glob', 'Grep'],
      model: MODEL,
      effort: EDIT_EFFORT,
      maxTurns: 30,
    },
  },
};

try {
  log(`chief start (${MODEL}: chief/${EDIT_EFFORT}, writer/${WRITE_EFFORT}, editors/${EDIT_EFFORT})`);
  let report = '', cost = 0, ok = false;
  for await (const msg of query({ prompt: `${lang} 원고 한 편을 편집부 절차대로 만들어라. slug: ${slug}`, options })) {
    // 위임이 언제 어디로 갔는지는 파이프라인 로그의 유일한 진행 표식이다.
    if (msg.type === 'assistant') {
      for (const b of msg.message?.content ?? []) {
        if (b.type === 'tool_use' && b.name === 'Task') log(`delegate → ${b.input?.subagent_type ?? '?'}`);
      }
    }
    if (msg.type === 'result') {
      cost = msg.total_cost_usd ?? 0;
      ok = msg.subtype === 'success';
      report = ok ? (msg.result ?? '') : `session ended ${msg.subtype}`;
    }
  }
  clearTimeout(timer);
  log(`chief done ($${cost.toFixed(4)}) — ${report.split('\n')[0] ?? ''}`);
  if (!ok) { log(`failed: ${report}`); process.exit(1); }
  if (/^FAIL/.test(report.trim())) { log(`chief 판정 실패: ${report.split('\n')[0]}`); process.exit(1); }
  if (!existsSync(target)) { log(`chief 는 성공을 보고했으나 ${target} 없음`); process.exit(1); }
  process.exit(0);
} catch (e) {
  clearTimeout(timer);
  log(`failed: ${e?.message ?? e}`);
  process.exit(1);
}
