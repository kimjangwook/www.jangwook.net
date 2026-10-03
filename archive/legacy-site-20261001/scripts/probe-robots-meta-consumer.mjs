// Consequence probe: what do common "find the robots directive" implementations see?
// jsdom 30.x. Two selector strategies + the JS-injection case.
import { JSDOM } from 'jsdom';
import { writeFileSync } from 'node:fs';

const M = '<meta name="robots" content="noindex">';
const CASES = [
  ['A. head (baseline)',        `<!doctype html><html><head><title>t</title>${M}</head><body><p>x</p></body></html>`],
  ['C. head, after stray text', `<!doctype html><html><head><title>t</title>hello${M}</head><body><p>x</p></body></html>`],
  ['D. head, after <div>',      `<!doctype html><html><head><title>t</title><div>d</div>${M}</head><body><p>x</p></body></html>`],
  ['E. body, first child',      `<!doctype html><html><head><title>t</title></head><body>${M}<p>x</p></body></html>`],
  ['G. inside <noscript>',      `<!doctype html><html><head><title>t</title><noscript>${M}</noscript></head><body><p>x</p></body></html>`],
  ['H. inside <template>',      `<!doctype html><html><head><title>t</title><template>${M}</template></head><body><p>x</p></body></html>`],
  ['I. head, unclosed <title>', `<!doctype html><html><head><title>t${M}</head><body><p>x</p></body></html>`],
];

const rows = [];
for (const [label, html] of CASES) {
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  const d = dom.window.document;
  rows.push({
    fixture: label,
    headScoped: !!d.head.querySelector('meta[name="robots" i]'),
    documentScoped: !!d.querySelector('meta[name="robots" i]'),
  });
}

// JS-injected: appended to head after initial parse
{
  const dom = new JSDOM(`<!doctype html><html><head><title>t</title></head><body><p>x</p></body></html>`, {
    runScripts: 'dangerously',
  });
  const d = dom.window.document;
  const before = !!d.querySelector('meta[name="robots" i]');
  const s = d.createElement('script');
  s.textContent = `var m=document.createElement('meta');m.name='robots';m.content='noindex';document.head.appendChild(m);`;
  d.body.appendChild(s);
  rows.push({
    fixture: 'K. injected by JS after parse',
    headScoped: `raw HTML: ${before} / after script: ${!!d.head.querySelector('meta[name="robots" i]')}`,
    documentScoped: `raw HTML: ${before} / after script: ${!!d.querySelector('meta[name="robots" i]')}`,
  });
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('fixture', 30) + pad('document.head.querySelector', 46) + 'document.querySelector');
console.log('-'.repeat(112));
for (const r of rows) console.log(pad(r.fixture, 30) + pad(r.headScoped, 46) + r.documentScoped);

writeFileSync('robots-meta-consumer.json', JSON.stringify({ engine: 'jsdom 30.0.1', rows }, null, 2));
