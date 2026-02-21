#!/usr/bin/env node
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const BRAVE_SERVER_NAME = 'brave-search';

const DEFAULT_LANGUAGES = ['ko', 'ja', 'en', 'zh'];
const DEFAULT_CATEGORY_SCORES = {
  automation: 0.25,
  'web-development': 0.25,
  'ai-ml': 0.25,
  devops: 0.15,
  architecture: 0.1,
};

function usage() {
  const bin = path.basename(process.argv[1]);
  console.log(`\nCodex Migration CLI`);
  console.log(`\nUsage`);
  console.log(`  ${bin} migrate [--drop-brave-mcp] [--keep-brave-mcp] [--install-skills]`);
  console.log(`  ${bin} analyze-posts [--post <slug>] [--force] [--verify]`);
  console.log(`  ${bin} generate-recommendations`);
  console.log(`  ${bin} next-post-recommendation [--count 10] [--category <name>]`);
  console.log(`  ${bin} write-post <topic> [--tags t1,t2] [--languages ko,ja,en,zh]`);
  console.log(`  ${bin} write-ga-post <analysis-date> [--period weekly|monthly|quarterly|custom]`);
  console.log(`  ${bin} commit [--message "..."] [--amend] [--no-verify]`);
  console.log(`\nProject root: ${ROOT}`);
  process.exit(1);
}

function parseArgs(argv) {
  const positional = [];
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    const normalized = token.replace(/^--/, '');
    const [rawKey, rawValue] = normalized.split('=', 2);
    if (rawValue !== undefined) {
      options[rawKey] = rawValue;
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      options[rawKey] = next;
      i += 1;
    } else {
      options[rawKey] = true;
    }
  }
  return { positional, options };
}

function safeReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function ensureDir(target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
}

function listMdFiles(root, dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  const result = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    result.push(path.join(abs, entry.name));
  }
  return result;
}

function getSlugFromPath(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function stableSortJsonKeys(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function hashContent(rawContent, frontmatter) {
  const payload = `${JSON.stringify(frontmatter)}\n${rawContent}`;
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

function normalizeCategoryScores(input) {
  const normalized = { ...DEFAULT_CATEGORY_SCORES };
  if (!input || typeof input !== 'object') return normalized;
  for (const key of Object.keys(DEFAULT_CATEGORY_SCORES)) {
    const value = Number(input[key]);
    if (Number.isFinite(value)) {
      normalized[key] = Math.max(0, Math.min(1, value));
    }
  }
  return normalized;
}

function normalizeDifficulty(input) {
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return 3;
  return Math.max(1, Math.min(5, Math.round(parsed)));
}

function parseDate(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

async function migrate() {
  const { positional, options } = parseArgs(process.argv.slice(3));
  if (positional.length > 0 && !['--help', '-h'].includes(positional[0])) {
    usage();
  }

  const keepBrave = options['keep-brave-mcp'] === true || options['keep-brave-mcp'] === 'true';
  const dropBrave = keepBrave
    ? false
    : options['drop-brave-mcp'] === true
      || options['drop-brave-mcp'] === 'true'
      || (!('drop-brave-mcp' in options) && !('keep-brave-mcp' in options));
  const installSkills = options['install-skills'] === true || options['install-skills'] === 'true';
  const target = path.join(ROOT, '.codex');

  await fsp.rm(target, { recursive: true, force: true });
  ensureDir(target);

  const mappings = [
    { source: '.claude/commands', target: '.codex/commands', name: 'commands' },
    { source: '.claude/agents', target: '.codex/agents', name: 'agents' },
    { source: '.claude/skills', target: '.codex/skills', name: 'skills' },
    { source: '.claude/README.md', target: '.codex/claude-readme.md', name: 'README reference' },
    { source: '.claude/guidelines', target: '.codex/guidelines', name: 'guidelines' },
    { source: '.claude/patterns', target: '.codex/patterns', name: 'patterns' },
    { source: '.claude/tools', target: '.codex/tools', name: 'tools' },
    { source: '.claude/security', target: '.codex/security', name: 'security' },
  ];

  for (const item of mappings) {
    const src = path.join(ROOT, item.source);
    const dst = path.join(ROOT, item.target);
    if (!fs.existsSync(src)) continue;
    await fsp.cp(src, dst, { recursive: true });
    console.log(`✓ mirrored ${item.name} -> ${item.target}`);
  }

  const mcpSource = path.join(ROOT, '.mcp.json');
  if (fs.existsSync(mcpSource)) {
    const mcp = safeReadJson(mcpSource);
    if (mcp && typeof mcp === 'object') {
      const migrated = { ...mcp };
      if (dropBrave && migrated.mcpServers && migrated.mcpServers[BRAVE_SERVER_NAME]) {
        const next = { ...migrated.mcpServers };
        delete next[BRAVE_SERVER_NAME];
        migrated.mcpServers = next;
      }
      const outPath = path.join(ROOT, '.codex', 'mcp.json');
      await fsp.writeFile(
        outPath,
        JSON.stringify(migrated, null, 2),
        'utf-8',
      );
      console.log('✓ saved .codex/mcp.json');
    }
  }

  const settingsSource = path.join(ROOT, '.claude/settings.local.json');
  if (fs.existsSync(settingsSource)) {
    const dst = path.join(ROOT, '.codex', 'settings.local.json');
    const settings = safeReadJson(settingsSource);
    const parsedSettings =
      settings && typeof settings === 'object'
        ? { ...settings, enabledMcpjsonServers: settings.enabledMcpjsonServers }
        : {};
    if (dropBrave && Array.isArray(parsedSettings.enabledMcpjsonServers)) {
      parsedSettings.enabledMcpjsonServers = parsedSettings.enabledMcpjsonServers.filter(
        (entry) => entry !== BRAVE_SERVER_NAME,
      );
    }
    await fsp.writeFile(
      dst,
      JSON.stringify(parsedSettings, null, 2),
      'utf-8',
    );
    console.log('✓ saved .codex/settings.local.json');
  }

  const commandMap = {
    slashCommands: {
      '/analyze-posts': {
        runner: 'node scripts/codex-compat.mjs analyze-posts',
        note: '메타데이터 생성/업데이트 (V3 형식 우선 생성)',
      },
      '/generate-recommendations': {
        runner: 'node scripts/codex-compat.mjs generate-recommendations',
        note: 'scripts/generate-recommendations-v3.js 호출',
      },
      '/next-post-recommendation': {
        runner: 'node scripts/codex-compat.mjs next-post-recommendation',
        note: '트렌드/콘텐츠 갭 기반 추천안 생성',
      },
      '/write-post': {
        runner: 'node scripts/codex-compat.mjs write-post',
        note: '스켈레톤 생성 + Codex에서 작성 보강',
      },
      '/write-ga-post': {
        runner: 'node scripts/codex-compat.mjs write-ga-post',
        note: 'GA 분석 리포트 스켈레톤 생성',
      },
      '/commit': {
        runner: 'node scripts/codex-compat.mjs commit',
        note: 'Conventional Commits 기반 자동 메시지',
      },
    },
    skillSourceRoots: ['.codex/skills', '.codex/agents'],
    policy: {
      webSearch: {
        recommendation:
          'Codex 기본 웹 검색을 우선 사용하고, Brave MCP는 보조/백업 수단으로만 사용합니다.',
        braveOptional:
          '필요한 경우에만 `--keep-brave-mcp`로 Brave MCP를 유지해 마이그레이션할 수 있습니다.',
      },
    },
  };
  await fsp.writeFile(
    path.join(ROOT, '.codex', 'command-registry.json'),
    JSON.stringify(commandMap, null, 2),
    'utf-8',
  );

  const readme = [
    '# Codex 마이그레이션 맵',
    '',
    `생성 시각: ${new Date().toISOString()}`,
    '',
    '## 실행 명령',
    '- `npm run codex:migrate`: .claude 에셋을 `.codex/*`로 동기화',
    '- `npm run codex:analyze-posts`: 포스트 메타데이터 갱신',
    '- `npm run codex:generate-recommendations`: 추천 포스트 계산',
    '- `npm run codex:next-post-recommendation -- --count 10`: 다음 주제 추천안 생성',
    '- `npm run codex:write-post -- "주제"`: 글 초안 스켈레톤 생성',
    '- `npm run codex:write-ga-post -- "YYYY-MM-DD"`: GA 리포트 스켈레톤 생성',
    '- `npm run codex:commit`: staged 파일 기준 자동 커밋',
    '- `npm run codex:migrate -- --keep-brave-mcp`: Brave MCP를 유지하려는 경우에만 사용',
    '- `npm run codex:migrate -- --drop-brave-mcp`: Brave MCP를 제거한 상태로 마이그레이션(기본값)',
    '',
    '## Brave 검색 정책',
    `- 기본 동작: Brave MCP ${dropBrave ? '제거' : '유지'} (기본값 기준 ${dropBrave ? '제거' : '유지'})`,
    '- Codex 기본 웹 검색이 가능한 작업 흐름이면 Brave MCP가 없어도 /write-post /generate-recommendations /next-post-recommendation이 동작하도록 설계합니다.',
    '- Brave 기반 검색이 꼭 필요한 특정 스킬은 해당 스킬 호출 전후로 별도 확인이 필요합니다.',
    '',
    '## Codex 프로젝트 신뢰 설정',
    '- 프로젝트 루트에서 실행 시, 전역 `~/.codex/config.toml`에 다음 항목이 있어야 신뢰 경고가 발생하지 않습니다.',
    '  - `[projects."/Users/jangwook/Documents/workspace/www.jangwook.net"]`',
    '  - `trust_level = "trusted"`',
    '',
  ].join('\n');
  await fsp.writeFile(path.join(ROOT, '.codex', 'README.md'), readme, 'utf-8');

  if (installSkills) {
    const src = path.join(ROOT, '.claude/skills');
    const dstRoot = path.join(CODEX_HOME, 'skills');
    ensureDir(dstRoot);
    if (!fs.existsSync(src)) {
      console.log('⚠ .claude/skills not found, skip install');
    } else {
      const entries = await fsp.readdir(src, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const from = path.join(src, entry.name);
        const to = path.join(dstRoot, entry.name);
        if (fs.existsSync(to)) {
          console.log(`⚠ skip existing skill: ${entry.name} (${to})`);
          continue;
        }
        await fsp.cp(from, to, { recursive: true });
        console.log(`✓ installed skill: ${entry.name} -> ${to}`);
      }
    }
  }

  console.log('\nCodex migration completed.');
}

async function readPostsBySlug() {
  const root = path.join(ROOT, 'src', 'content', 'blog');
  const langs = fs.existsSync(root) ? await fsp.readdir(root, { withFileTypes: true }) : [];
  const posts = new Map();
  for (const langEntry of langs) {
    if (!langEntry.isDirectory()) continue;
    const lang = langEntry.name;
    const files = listMdFiles(root, lang);
    for (const filePath of files) {
      const slug = getSlugFromPath(filePath);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const fm = parsed.data || {};
      const pub = parseDate(fm.pubDate);
      const entry = posts.get(slug) || {
        slug,
        paths: {},
        pubDates: {},
        contents: {},
      };
      entry.paths[lang] = filePath;
      if (pub) entry.pubDates[lang] = fm.pubDate;
      entry.contents[lang] = raw;
      posts.set(slug, entry);
    }
  }
  return Array.from(posts.values());
}

function choosePubDate(pubDates) {
  const ordered = Object.values(pubDates)
    .map(parseDate)
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime());
  if (ordered.length === 0) return null;
  return ordered[0].toISOString().slice(0, 10);
}

function loadPreviousMetadata() {
  const existing = safeReadJson(path.join(ROOT, 'post-metadata.json'));
  if (!existing) return {};
  if (existing.metadata && typeof existing.metadata === 'object') return existing.metadata;
  return existing;
}

async function commandAnalyzePosts() {
  const { options, positional } = parseArgs(process.argv.slice(3));
  const force = options.force === true || options.force === 'true';
  const verify = options.verify === true || options.verify === 'true';
  const targetSlug = options.post;
  const posts = await readPostsBySlug();
  const previous = loadPreviousMetadata();
  const next = {};
  const summary = {
    total: 0,
    updated: 0,
    skipped: 0,
    issues: [],
  };

  for (const post of posts) {
    if (targetSlug && post.slug !== targetSlug) continue;
    summary.total += 1;
    const langs = Object.keys(post.contents);
    const contentSource = post.contents.ko || post.contents[langs[0]];
    const fmSource = contentSource ? matter(contentSource).data : {};
    const hash = hashContent(contentSource || '', fmSource);
    const old = previous[post.slug];
    const oldHash = old && (old._contentHash || old.contentHash);
    if (!force && oldHash && oldHash === hash) {
      summary.skipped += 1;
      continue;
    }
    const pubDate = choosePubDate(post.pubDates) || fmSource.pubDate || '';
    if (!pubDate) {
      summary.issues.push(`[WARN] ${post.slug}: pubDate missing, set empty`);
    }
    const difficulty = normalizeDifficulty(
      old && old.difficulty !== undefined ? old.difficulty : fmSource.difficulty,
    );
    const categoryScores = normalizeCategoryScores(old ? old.categoryScores : fmSource.categoryScores);

    next[post.slug] = {
      pubDate,
      difficulty,
      categoryScores,
      _contentHash: hash,
    };
    summary.updated += 1;
  }

  const output = stableSortJsonKeys(next);
  await fsp.writeFile(
    path.join(ROOT, 'post-metadata.json'),
    JSON.stringify(output, null, 2),
    'utf-8',
  );

  console.log(`\n✓ analyze-posts result: total=${summary.total}, updated=${summary.updated}, skipped=${summary.skipped}`);
  if (summary.issues.length > 0) {
    console.log('\nWarnings:');
    summary.issues.forEach((issue) => console.log(`- ${issue}`));
  }

  if (verify) {
    console.log('\nValidation:');
    for (const [slug, item] of Object.entries(output)) {
      const missing = [
        typeof item.pubDate !== 'string' || !parseDate(item.pubDate) ? 'pubDate' : null,
        typeof item.difficulty !== 'number' ? 'difficulty' : null,
        !item.categoryScores ? 'categoryScores' : null,
      ].filter(Boolean);
      if (missing.length > 0) {
        console.log(`- ${slug}: ${missing.join(', ')} 문제`);
      }
    }
    console.log('✓ verify done');
  }
}

function runCommand(cmd, args = []) {
  const result = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function commandGenerateRecommendations() {
  const source = path.join(ROOT, 'post-metadata.json');
  if (!fs.existsSync(source)) {
    console.error('post-metadata.json not found. Run: node scripts/codex-compat.mjs analyze-posts');
    process.exit(1);
  }
  runCommand('node', ['scripts/generate-recommendations-v3.js']);
}

function commandNextPostRecommendation() {
  const { options } = parseArgs(process.argv.slice(3));
  const count = Number(options.count || 10);
  const categoryFilter = options.category;
  const difficultyFilter = options.difficulty ? Number(options.difficulty) : null;
  const metadata = safeReadJson(path.join(ROOT, 'post-metadata.json'));
  if (!metadata) {
    console.error('post-metadata.json not found. Run analyze-posts first.');
    process.exit(1);
  }

  const entries = Object.entries(metadata)
    .map(([slug, item]) => ({ slug, ...(item || {}) }))
    .filter((item) => {
      if (categoryFilter && typeof item.categoryScores?.[categoryFilter] !== 'number') return false;
      if (difficultyFilter && Number(item.difficulty) !== difficultyFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const aDate = parseDate(a.pubDate)?.getTime() || 0;
      const bDate = parseDate(b.pubDate)?.getTime() || 0;
      return bDate - aDate;
    });

  const categoryAvg = {};
  const totals = {};
  for (const item of entries) {
    for (const [cat, score] of Object.entries(item.categoryScores || {})) {
      totals[cat] = (totals[cat] || 0) + (Number(score) || 0);
      categoryAvg[cat] = (categoryAvg[cat] || 0) + 0;
      categoryAvg[cat] += 1;
    }
  }
  const sortedCats = Object.keys(categoryAvg)
    .map((cat) => [cat, (totals[cat] || 0) / categoryAvg[cat]])
    .sort((a, b) => a[1] - b[1])
    .map(([cat]) => cat);

  const seedByCategory = {
    automation: ['워크플로 자동화 운영 가이드', 'MCP 도구 체인 실무 패턴', '반복 업무 제거 플레이북'],
    'web-development': ['성능 최적화 실전 체크리스트', '모던 프론트엔드 아키텍처 구성', '검색 친화적 콘텐츠 설계'],
    'ai-ml': ['실전 AI 워크플로우 설계', '임베딩 파이프라인 운영 노트', 'LLM 평가 지표 해설'],
    devops: ['CI/CD 운영 실패 대응', '관측성(Observability) 운영 패턴', '배포 안정성 체크리스트'],
    architecture: ['확장성 있는 구조 설계', '도메인 분리 전략', '장애 복원력 강화 방법'],
  };

  const suggestions = [];
  for (let i = 0; i < count; i++) {
    const cat = sortedCats[i % sortedCats.length] || Object.keys(seedByCategory)[i % 5];
    const candidates = seedByCategory[cat] || ['확장 주제'];
    const title = `${candidates[i % candidates.length]}`;
    const slug = `recommend-${i + 1}-${cat.replace(/[^a-z0-9-]/g, '')}`;
    suggestions.push({
      rank: i + 1,
      slug,
      title,
      category: cat,
      difficulty: difficultyFilter || [2, 3, 4][i % 3],
      reason: `${cat} 카테고리 갭을 보완하고 최근 발행 패턴과 연계하기 좋음`,
    });
  }

  const out = [
    `# 다음 주제 추천`,
    `생성일: ${new Date().toISOString().slice(0, 10)}`,
    '',
    `총 ${suggestions.length}개 후보`,
    '',
    ...suggestions.map((item) => `- ${item.rank}. ${item.title} (category: ${item.category}, difficulty: ${item.difficulty}, slug: ${item.slug})`),
    '',
    `근거: 최근 포스팅의 카테고리 분포 기반 + 최근 발행일 기반 가중치`,
  ].join('\n');
  const outPath = path.join(ROOT, `content-recommendations-${new Date().toISOString().slice(0, 10)}.md`);
  fsp.writeFile(outPath, out, 'utf-8').then(() => {
    console.log(`\n✓ saved: ${path.relative(ROOT, outPath)}`);
    console.log(out);
  });
}

async function commandWritePost() {
  const { positional, options } = parseArgs(process.argv.slice(3));
  if (positional.length === 0) {
    console.log('Usage: node scripts/codex-compat.mjs write-post "<topic>" --tags a,b,c [--languages ko,ja,en,zh]');
    process.exit(1);
  }
  const topic = positional.join(' ');
  const languages = (options.languages || DEFAULT_LANGUAGES.join(',')).split(',').map((x) => x.trim()).filter(Boolean);
  const tags = (options.tags || '').split(',').map((x) => x.trim()).filter(Boolean);

  const slug = topic
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!slug) {
    console.error('Invalid topic. Use alphabet/numeric/korean words.');
    process.exit(1);
  }

  const blogsRoot = path.join(ROOT, 'src', 'content', 'blog');
  const pubDate = (() => {
    let maxDate = new Date();
    maxDate.setDate(maxDate.getDate());
    for (const lang of languages) {
      const dir = path.join(blogsRoot, lang);
      if (!fs.existsSync(dir)) continue;
      for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.md')) continue;
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        const parsed = matter(raw);
        const dt = parseDate(parsed.data.pubDate);
        if (dt && dt > maxDate) maxDate = dt;
      }
    }
    maxDate.setDate(maxDate.getDate() + 1);
    return maxDate.toISOString().slice(0, 10);
  })();

  const heroImage = `../../../assets/blog/${slug}-hero.webp`;
  for (const lang of languages) {
    const outDir = path.join(blogsRoot, lang);
    ensureDir(outDir);
    const outPath = path.join(outDir, `${slug}.md`);
    if (fs.existsSync(outPath)) {
      console.log(`skip existing: ${path.relative(ROOT, outPath)}`);
      continue;
    }
    const body = [
      '---',
      `title: ${topic} (${lang})`,
      `description: ${topic}에 대한 ${lang} 가이드`,
      `pubDate: "${pubDate}"`,
      `heroImage: "${heroImage}"`,
      tags.length ? `tags: [${tags.map((t) => `"${t}"`).join(', ')}]` : 'tags: []',
      'relatedPosts: []',
      '---',
      '',
      `# ${topic}`,
      '',
      `작성 예정: ${new Date().toISOString().slice(0, 10)} (${lang})`,
    ].join('\n');
    await fsp.writeFile(outPath, body, 'utf-8');
    console.log(`✓ created: ${path.relative(ROOT, outPath)}`);
  }
}

async function commandWriteGaPost() {
  const { positional, options } = parseArgs(process.argv.slice(3));
  if (positional.length === 0) {
    console.log('Usage: node scripts/codex-compat.mjs write-ga-post "YYYY-MM-DD" [--period weekly|monthly|quarterly|custom]');
    process.exit(1);
  }
  const date = positional[0];
  const period = options.period || 'weekly';
  const languages = (options.languages || 'ko,ja,en').split(',').map((x) => x.trim()).filter(Boolean);
  const slug = `analytics-${date}`;
  const pubDate = (() => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 1);
    return dt.toISOString().slice(0, 10);
  })();
  const heroImage = `../../../assets/blog/${slug}-hero.webp`;

  for (const lang of languages) {
    const outDir = path.join(ROOT, 'src', 'content', 'blog', lang);
    ensureDir(outDir);
    const outPath = path.join(outDir, `${slug}.md`);
    if (fs.existsSync(outPath)) {
      console.log(`skip existing: ${path.relative(ROOT, outPath)}`);
      continue;
    }
    const body = [
      '---',
      `title: "${period} GA 분석 리포트 ${date}"`,
      `description: "${date} 기준 GA 데이터 분석 리포트"`,
      `pubDate: "${pubDate}"`,
      `heroImage: "${heroImage}"`,
      `tags: ["Analytics","Report","Data"]`,
      'relatedPosts: []',
      '---',
      '',
      `# ${period} GA 분석 리포트 (${lang})`,
      '',
      '## 실행 개요',
      '- 기간:',
      '- 핵심 지표:',
      '- 개선 액션:',
    ].join('\n');
    await fsp.writeFile(outPath, body, 'utf-8');
    console.log(`✓ created: ${path.relative(ROOT, outPath)}`);
  }
}

function commandCommit() {
  const { options } = parseArgs(process.argv.slice(3));
  const status = spawnSync('git', ['diff', '--cached', '--name-only'], {
    encoding: 'utf-8',
    cwd: ROOT,
  });
  const staged = status.stdout.trim().split('\n').filter(Boolean);
  if (staged.length === 0 && !options.message) {
    console.error('No staged files. Stage files with: git add <path>');
    process.exit(1);
  }

  let message = typeof options.message === 'string' ? options.message : '';
  if (!message) {
    const subject = staged[0] ? getChangedBase(staged[0]) : 'update';
    const type = inferCommitType(staged);
    const scope = inferScope(staged);
    message = `${type}(${scope}): ${subject}`;
  }
  const args = ['commit', '-m', message];
  if (options.amend) args.unshift('--amend');
  if (options['no-verify']) args.push('--no-verify');
  const result = spawnSync('git', args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

function inferCommitType(files) {
  if (files.some((file) => file.includes('post-metadata.json'))) return 'chore';
  if (files.some((file) => file.startsWith('src/content/blog/'))) return 'feat';
  if (files.some((file) => file.includes('.codex'))) return 'chore';
  return 'chore';
}

function inferScope(files) {
  if (files.every((f) => f.startsWith('src/content/blog/'))) return 'blog';
  if (files.some((f) => f.startsWith('src/components'))) return 'components';
  if (files.some((f) => f.startsWith('scripts/'))) return 'scripts';
  if (files.some((f) => f.startsWith('.claude'))) return 'claude';
  if (files.some((f) => f === 'package.json')) return 'deps';
  return 'workspace';
}

function getChangedBase(filePath) {
  const base = filePath.split('/').pop() || 'update';
  const stem = base.replace(/\.md$|\.json$|\.js$|\.ts$|\.ts$|\.css$|\.mjs$/i, '');
  return `update ${stem}`;
}

async function main() {
  const command = process.argv[2];
  if (!command) usage();

  if (command === 'migrate') return migrate();
  if (command === 'analyze-posts') return commandAnalyzePosts();
  if (command === 'generate-recommendations') return commandGenerateRecommendations();
  if (command === 'next-post-recommendation') return commandNextPostRecommendation();
  if (command === 'write-post') return commandWritePost();
  if (command === 'write-ga-post') return commandWriteGaPost();
  if (command === 'commit') return commandCommit();

  usage();
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
