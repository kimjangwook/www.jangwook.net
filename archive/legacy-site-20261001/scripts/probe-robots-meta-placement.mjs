// Where does <meta name="robots"> actually land after HTML parsing?
// parse5 8.x (spec-compliant tree construction), scriptingEnabled true/false.
import { parse } from 'parse5';
import { writeFileSync } from 'node:fs';

const M = '<meta name="robots" content="noindex">';

const FIXTURES = [
  ['A. head (baseline)',        `<!doctype html><html><head><title>t</title>${M}</head><body><p>x</p></body></html>`],
  ['B. head, after comment',    `<!doctype html><html><head><title>t</title><!-- c -->${M}</head><body><p>x</p></body></html>`],
  ['C. head, after stray text', `<!doctype html><html><head><title>t</title>hello${M}</head><body><p>x</p></body></html>`],
  ['D. head, after <div>',      `<!doctype html><html><head><title>t</title><div>d</div>${M}</head><body><p>x</p></body></html>`],
  ['E. body, first child',      `<!doctype html><html><head><title>t</title></head><body>${M}<p>x</p></body></html>`],
  ['F. body, last child',       `<!doctype html><html><head><title>t</title></head><body><p>x</p>${M}</body></html>`],
  ['G. inside <noscript>',      `<!doctype html><html><head><title>t</title><noscript>${M}</noscript></head><body><p>x</p></body></html>`],
  ['H. inside <template>',      `<!doctype html><html><head><title>t</title><template>${M}</template></head><body><p>x</p></body></html>`],
  ['I. head, unclosed <title>', `<!doctype html><html><head><title>t${M}</head><body><p>x</p></body></html>`],
  ['J. body, inside <div>',     `<!doctype html><html><head><title>t</title></head><body><div class="wrap">${M}</div></body></html>`],
];

function walk(node, path, out) {
  const name = node.tagName || node.nodeName;
  const here = name === '#document' ? [] : [...path, name];
  if (node.tagName === 'meta') {
    const attrs = Object.fromEntries((node.attrs || []).map((a) => [a.name, a.value]));
    if ((attrs.name || '').toLowerCase() === 'robots') {
      out.push({ where: here.join(' > '), content: attrs.content });
    }
  }
  // template content lives in a separate DocumentFragment, not childNodes
  if (node.tagName === 'template' && node.content) {
    walk(node.content, [...here, '#content-fragment'], out);
  }
  for (const c of node.childNodes || []) walk(c, here, out);
}

function textDump(node, acc) {
  if (node.nodeName === '#text') acc.push(node.value);
  for (const c of node.childNodes || []) textDump(c, acc);
  return acc;
}

const rows = [];
for (const [label, html] of FIXTURES) {
  const row = { fixture: label };
  for (const scripting of [true, false]) {
    const doc = parse(html, { scriptingEnabled: scripting });
    const found = [];
    walk(doc, [], found);
    const asText = textDump(doc, []).join('').includes('meta name="robots"');
    row[scripting ? 'scriptingOn' : 'scriptingOff'] = {
      elementFound: found.length > 0,
      location: found.length ? found[0].where : null,
      survivesAsTextOnly: found.length === 0 && asText,
    };
  }
  rows.push(row);
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('fixture', 28) + pad('scripting=ON', 42) + 'scripting=OFF');
console.log('-'.repeat(112));
for (const r of rows) {
  const f = (o) => (o.elementFound ? o.location.replace('html > ', '') : o.survivesAsTextOnly ? '(text, not an element)' : '(dropped)');
  console.log(pad(r.fixture, 28) + pad(f(r.scriptingOn), 42) + f(r.scriptingOff));
}

writeFileSync('robots-meta-placement.json', JSON.stringify({ parser: 'parse5 8.0.1', rows }, null, 2));
