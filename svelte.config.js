import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { readFileSync,writeFileSync,existsSync } from 'node:fs';
// The adapter writes to config.main. Give it a generated app entry while keeping
// Wrangler's deployment entry under worker/ intact (fetch + scheduled handler).
const configPath='wrangler.svelte.jsonc';
const settings=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
settings.main='.svelte-kit/cloudflare/_worker.js';
const generated=JSON.stringify(settings,null,2)+'\n';
if(!existsSync(configPath)||readFileSync(configPath,'utf8')!==generated)writeFileSync(configPath,generated);
export default { preprocess: vitePreprocess(), kit: { adapter: adapter({config:configPath}) } };
