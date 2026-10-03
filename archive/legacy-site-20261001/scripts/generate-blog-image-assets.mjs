import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'src/assets/blog');
const width = 1376;
const height = 768;

const assets = [
  {
    file: 'bayesian-teaching-llm-probabilistic-reasoning-hero.jpg',
    title: 'Bayesian Teaching',
    eyebrow: 'LLM probabilistic reasoning',
    subtitle: 'Prior -> evidence -> posterior',
    palette: ['#0f766e', '#2563eb', '#f59e0b'],
    kind: 'flow',
    nodes: ['Prior', 'Evidence', 'Posterior'],
  },
  {
    file: 'bayesian-teaching-llm-probabilistic-reasoning-workflow.jpg',
    title: 'Belief Update Workflow',
    eyebrow: 'from brittle answers to calibrated reasoning',
    subtitle: 'Teaching signal, probability estimate, domain transfer',
    palette: ['#155e75', '#7c3aed', '#22c55e'],
    kind: 'ladder',
    nodes: ['Teaching signal', 'Probability estimate', 'Domain transfer'],
  },
  {
    file: 'cognitive-debt-agentic-coding-2026-hero.jpg',
    title: 'Cognitive Debt',
    eyebrow: 'agentic coding risk map',
    subtitle: 'Velocity must preserve shared understanding',
    palette: ['#334155', '#dc2626', '#0ea5e9'],
    kind: 'balance',
    nodes: ['AI velocity', 'Review loops', 'Shared theory'],
  },
  {
    file: 'cognitive-debt-agentic-coding-2026-risk-map.jpg',
    title: 'Agentic Coding Review Map',
    eyebrow: 'where speed becomes hidden debt',
    subtitle: 'Generate, explain, review, retain ownership',
    palette: ['#1f2937', '#ea580c', '#0891b2'],
    kind: 'grid',
    nodes: ['Generate', 'Explain', 'Review', 'Retain'],
  },
  {
    file: 'llama4-maverick-scout-enterprise-strategy-hero.jpg',
    title: 'Llama 4 Strategy',
    eyebrow: 'Maverick, Scout, enterprise routing',
    subtitle: 'MoE performance with long-context deployment',
    palette: ['#14532d', '#7c2d12', '#2563eb'],
    kind: 'experts',
    nodes: ['Scout', 'Maverick', 'Router'],
  },
  {
    file: 'llama4-maverick-scout-enterprise-strategy-moe-map.jpg',
    title: 'MoE Deployment Map',
    eyebrow: 'route workload before model choice',
    subtitle: 'Long context, expert routing, cost control',
    palette: ['#064e3b', '#4338ca', '#ca8a04'],
    kind: 'grid',
    nodes: ['Context', 'Experts', 'Cost', 'Fallback'],
  },
  {
    file: 'llm-blog-automation-architecture.jpg',
    title: 'Blog Automation Loop',
    eyebrow: 'planner, writer, editor, image, publish',
    subtitle: 'Daily learning turned into repeatable publishing',
    palette: ['#0f172a', '#0d9488', '#f97316'],
    kind: 'flow',
    nodes: ['Research', 'Draft', 'Verify', 'Publish'],
  },
  {
    file: 'openclaw-openai-codex-migration-checklist.jpg',
    title: 'OpenClaw Codex Migration',
    eyebrow: 'safe switch checklist',
    subtitle: 'Backup, OAuth, model switch, verification',
    palette: ['#1e3a8a', '#0891b2', '#65a30d'],
    kind: 'ladder',
    nodes: ['Backup', 'OAuth', 'Model', 'Verify'],
  },
  {
    file: 'cursor-3-vs-claude-code-vs-windsurf-2026-version-audit.jpg',
    title: 'Version Audit',
    eyebrow: 'checked on 2026-04-26',
    subtitle: 'Cursor 3.1, Claude Code 2.1.119, Windsurf 2.0.67',
    palette: ['#4f46e5', '#0f766e', '#d97706'],
    kind: 'three',
    nodes: ['Cursor 3.1', 'Claude 2.1.119', 'Windsurf 2.0.67'],
  },
  {
    file: 'cursor-3-vs-claude-code-vs-windsurf-2026-decision-matrix.jpg',
    title: 'Tool Choice Matrix',
    eyebrow: 'match the tool to the workflow',
    subtitle: 'Autocomplete, architecture, speed',
    palette: ['#2563eb', '#7c3aed', '#059669'],
    kind: 'grid',
    nodes: ['Autocomplete', 'Architecture', 'Prototype', 'Team loop'],
  },
];

const esc = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const text = (value, x, y, size, weight = 600, fill = '#0f172a', anchor = 'start') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(value)}</text>`;

function nodeBox(label, x, y, w, h, fill, stroke = '#0f172a') {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    ${text(label, x + w / 2, y + h / 2 + 8, 32, 700, '#ffffff', 'middle')}
  `;
}

function renderShape(asset) {
  const [a, b, c] = asset.palette;
  const base = `
    <defs>
      <linearGradient id="hero-bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="48%" stop-color="#eef2ff"/>
        <stop offset="100%" stop-color="#ecfeff"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0f172a" flood-opacity="0.16"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#hero-bg)"/>
    <path d="M0 610 C220 550 300 690 520 625 C770 550 900 470 1120 520 C1250 548 1310 505 1376 470 L1376 768 L0 768 Z" fill="${a}" opacity="0.10"/>
    <circle cx="1180" cy="130" r="100" fill="${b}" opacity="0.12"/>
    <circle cx="110" cy="650" r="160" fill="${c}" opacity="0.09"/>
    <rect x="74" y="62" width="1228" height="644" rx="34" fill="#ffffff" opacity="0.88" filter="url(#shadow)"/>
    ${text(asset.eyebrow.toUpperCase(), 128, 148, 26, 800, a)}
    ${text(asset.title, 128, 226, 64, 800, '#111827')}
    ${text(asset.subtitle, 130, 280, 31, 500, '#475569')}
  `;

  if (asset.kind === 'flow') {
    const boxes = asset.nodes.map((label, i) => nodeBox(label, 150 + i * 300, 420, 220, 110, [a, b, c][i % 3])).join('');
    return `${base}
      <path d="M370 475 L442 475" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
      <path d="M670 475 L742 475" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
      <path d="M432 458 L462 475 L432 492" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M732 458 L762 475 L732 492" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      ${boxes}
    `;
  }

  if (asset.kind === 'ladder') {
    return `${base}
      ${asset.nodes.map((label, i) => `
        <line x1="220" y1="${396 + i * 70}" x2="1020" y2="${396 + i * 70}" stroke="${[a, b, c][i % 3]}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="220" cy="${396 + i * 70}" r="22" fill="${[a, b, c][i % 3]}"/>
        ${text(label, 270, 407 + i * 70, 31, 700, '#1e293b')}
      `).join('')}
    `;
  }

  if (asset.kind === 'balance') {
    return `${base}
      <line x1="300" y1="500" x2="1010" y2="500" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
      <line x1="655" y1="370" x2="655" y2="610" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
      <polygon points="420,400 565,590 275,590" fill="${a}" opacity="0.88"/>
      <polygon points="890,400 1035,590 745,590" fill="${c}" opacity="0.88"/>
      ${text(asset.nodes[0], 420, 626, 30, 800, '#1e293b', 'middle')}
      ${text(asset.nodes[1], 655, 350, 30, 800, b, 'middle')}
      ${text(asset.nodes[2], 890, 626, 30, 800, '#1e293b', 'middle')}
    `;
  }

  if (asset.kind === 'experts') {
    return `${base}
      <circle cx="650" cy="505" r="92" fill="${b}" opacity="0.92"/>
      ${text(asset.nodes[2], 650, 517, 34, 800, '#ffffff', 'middle')}
      ${asset.nodes.slice(0, 2).map((label, i) => {
        const x = i === 0 ? 360 : 940;
        return `
          <circle cx="${x}" cy="505" r="82" fill="${i === 0 ? a : c}" opacity="0.92"/>
          <line x1="${i === 0 ? 442 : 858}" y1="505" x2="${i === 0 ? 558 : 742}" y2="505" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
          ${text(label, x, 517, 34, 800, '#ffffff', 'middle')}
        `;
      }).join('')}
    `;
  }

  if (asset.kind === 'three') {
    return `${base}
      ${asset.nodes.map((label, i) => nodeBox(label, 150 + i * 305, 414, 245, 118, [a, b, c][i % 3])).join('')}
      ${text('official changelog refresh', 652, 604, 30, 700, '#334155', 'middle')}
    `;
  }

  return `${base}
    ${asset.nodes.map((label, i) => {
      const x = 160 + (i % 2) * 410;
      const y = 390 + Math.floor(i / 2) * 118;
      return nodeBox(label, x, y, 320, 78, [a, b, c, '#475569'][i % 4], '#ffffff');
    }).join('')}
  `;
}

function svg(asset) {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${renderShape(asset)}
    </svg>
  `;
}

await mkdir(outDir, { recursive: true });

for (const asset of assets) {
  await sharp(Buffer.from(svg(asset)))
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(outDir, asset.file));
  console.log(`created ${asset.file}`);
}
