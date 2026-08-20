import jsonld from 'jsonld';
import { readFileSync } from 'node:fs';

// Build an adjacency graph from expanded JSON-LD: node @id -> set of referenced @ids
async function analyze(label, doc) {
  const expanded = await jsonld.expand(doc);
  const flat = await jsonld.flatten(doc);
  const graph = flat['@graph'] || flat;
  const nodes = graph.filter(n => n['@id'] && !n['@id'].startsWith('_:') ? true : true);
  const named = graph.filter(n => n['@id'] && !n['@id'].startsWith('_:'));

  // Count cross-references: any value that is an object with only @id pointing to another node in the set
  const ids = new Set(graph.map(n => n['@id']));
  let refEdges = 0;
  const adj = new Map();
  for (const n of graph) adj.set(n['@id'], new Set());
  for (const n of graph) {
    for (const [k, v] of Object.entries(n)) {
      if (k.startsWith('@')) continue;
      const vals = Array.isArray(v) ? v : [v];
      for (const item of vals) {
        if (item && typeof item === 'object' && item['@id'] && ids.has(item['@id'])) {
          refEdges++;
          adj.get(n['@id'])?.add(item['@id']);
          adj.get(item['@id'])?.add(n['@id']); // undirected for connectivity
        }
      }
    }
  }

  // Connected components over undirected edges
  const visited = new Set();
  let components = 0;
  for (const start of adj.keys()) {
    if (visited.has(start)) continue;
    components++;
    const stack = [start];
    while (stack.length) {
      const cur = stack.pop();
      if (visited.has(cur)) continue;
      visited.add(cur);
      for (const nb of adj.get(cur) || []) if (!visited.has(nb)) stack.push(nb);
    }
  }

  console.log(`\n[${label}]`);
  console.log(`  total nodes (after flatten): ${graph.length}`);
  console.log(`  nodes with a stable @id:     ${named.length}`);
  console.log(`  @id reference edges:         ${refEdges}`);
  console.log(`  connected components:        ${components}  ${components === 1 ? '=> ONE entity graph' : '=> ' + components + ' disconnected islands'}`);
  return { nodes: graph.length, named: named.length, refEdges, components };
}

const disconnected = JSON.parse(readFileSync('disconnected.json', 'utf8'));
const connected = JSON.parse(readFileSync('connected.json', 'utf8'));

const a = await analyze('disconnected islands', disconnected);
const b = await analyze('connected @graph', connected);

console.log('\n=== SUMMARY ===');
console.log(JSON.stringify({ disconnected: a, connected: b }, null, 2));
