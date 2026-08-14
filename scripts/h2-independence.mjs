// Fail posts whose 4 language files share the same H2 topic order.
// That sequence is the translation skeleton: titles change, the spine does not.
// Only pubDate >= 2026-08-14 (the day independent outlines became the contract).

export const H2_INDEPENDENCE_FROM = '2026-08-14';

const BUCKETS = [
  ['llms', /llms\.?txt/i],
  ['gsc', /search console|생성형 ai 제어|generative ai control|コンソール|父プロパティ|부모 속성|父级|父資源/i],
  ['schema', /schema|json-?ld|구조화|構造化|结构化/i],
  ['a11y', /accessib|a11y|접근성|アクセシ|无障碍|스크린 리더|screen reader|スクリーンリーダー/i],
  ['snippet', /snippet|nosnippet|스니펫|摘要/i],
  ['livegit', /라이브|live |本番|仓库|저장소|git\b|45줄|45 line|106/i],
  ['pickup', /overview|집어|拾|捡|pick up|資格|자격|eligibility/i],
  ['subtract', /지운|지우라|消した|削除|删|subtraction|delete/i],
  ['agent', /agent|에이전트|エージェント|代理/i],
  ['sprint', /sprint|백로그|月曜|monday|周一|코드 리뷰|pull request|구멍/i],
  ['robots', /robots/i],
];

export function headingSignature(h2Lines) {
  return h2Lines.map((line) => {
    const title = String(line).replace(/^##\s+/, '');
    for (const [name, pattern] of BUCKETS) {
      if (pattern.test(title)) return name;
    }
    return `lit:${title.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').slice(0, 32)}`;
  }).join('>');
}

export function findTranslatedSkeletons(groups) {
  const hits = [];
  for (const group of groups) {
    if (!group.pubDateKey || group.pubDateKey < H2_INDEPENDENCE_FROM) continue;
    const langs = Object.keys(group.byLang);
    if (langs.length < 3) continue;

    const signatures = langs.map((lang) => ({
      lang,
      sig: headingSignature(group.byLang[lang]),
    }));
    const longEnough = signatures.filter((item) => item.sig.split('>').length >= 3);
    const counts = new Map();
    for (const item of longEnough) {
      if (!counts.has(item.sig)) counts.set(item.sig, []);
      counts.get(item.sig).push(item.lang);
    }
    for (const [sig, matched] of counts) {
      if (matched.length >= 3) {
        hits.push(`${group.slug}: ${matched.join(',')} share H2 spine [${sig}]`);
      }
    }
  }
  return hits;
}

export function groupsFromPosts(posts) {
  const bySlug = new Map();
  for (const post of posts) {
    if (!bySlug.has(post.slug)) {
      bySlug.set(post.slug, {
        slug: post.slug,
        pubDateKey: post.pubDateKey,
        byLang: {},
      });
    }
    const group = bySlug.get(post.slug);
    group.byLang[post.lang] = post.h2Headings || [];
    if (post.pubDateKey && (!group.pubDateKey || post.pubDateKey < group.pubDateKey)) {
      group.pubDateKey = post.pubDateKey;
    }
  }
  return [...bySlug.values()];
}

if (String(process.argv[1] || '').endsWith('h2-independence.mjs')) {
  const same = headingSignature([
    '## 생성형 검색이 페이지를 집어 올리는 자리',
    '## 공식 문서가 지운 네 가지',
    '## Search Console에 생긴 스위치',
    '## 라이브 robots.txt가 git과 달랐다',
    '## 에이전트가 읽는 것은 접근성 트리이기도 하다',
  ]);
  const alsoSame = headingSignature([
    '## What AI Overviews actually pick up',
    '## Four backlog items the official guide deletes',
    '## The Search Console switch, and who inherits it',
    '## 45 lines in git, 106 in production',
    '## Agents also read the accessibility tree',
  ]);
  const independent = headingSignature([
    '## A pull request will not see this switch',
    '## Four items the official guide deletes',
    '## 45 lines in git, 106 in production',
    '## Agents walk the same tree as a screen reader',
    '## Monday morning',
  ]);

  const fail = findTranslatedSkeletons([
    {
      slug: 'fake-translated',
      pubDateKey: '2026-08-14',
      byLang: {
        ko: ['## 생성형 검색이 페이지를 집어 올리는 자리', '## 공식 문서가 지운 네 가지', '## Search Console에 생긴 스위치', '## 라이브 robots.txt가 git과 달랐다'],
        en: ['## What AI Overviews actually pick up', '## Four backlog items the official guide deletes', '## The Search Console switch', '## 45 lines in git'],
        ja: ['## AI Overviewがページを拾う条件', '## 公式が先に消した四つの行', '## Search Consoleのスイッチと、継承', '## リポジトリと本番の robots.txt'],
      },
    },
  ]);

  if (same.split('>').length < 3) {
    console.error('self-test: expected a long signature');
    process.exit(1);
  }
  if (fail.length !== 1) {
    console.error('self-test: expected one skeleton hit, got', fail, { same, alsoSame, independent });
    process.exit(1);
  }
  console.log('[h2-independence] self-test OK');
}
