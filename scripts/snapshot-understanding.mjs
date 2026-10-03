import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const criteria=JSON.parse(await fs.readFile('docs/sources/wcag22-criteria.json','utf8')).filter(c=>c.level);
await fs.mkdir('docs/sources/understanding',{recursive:true});
let cursor=0,failed=[];
await Promise.all(Array.from({length:6},async()=>{while(cursor<criteria.length){const c=criteria[cursor++];try{const response=await fetch(c.understanding);if(!response.ok)throw new Error(String(response.status));const html=await response.text();const d=new JSDOM(html).window.document;const main=d.querySelector('main')??d.body;await fs.writeFile('docs/sources/understanding/'+c.slug+'.json',JSON.stringify({id:c.id,url:c.understanding,retrievedAt:'2026-10-01',title:d.title,text:main.textContent.replace(/\s+/g,' ').trim()},null,2));}catch(e){failed.push({id:c.id,error:String(e)});}}}));
await fs.writeFile('reports/source-snapshot.json',JSON.stringify({retrievedAt:'2026-10-01',criteria:criteria.length,success:criteria.length-failed.length,failed},null,2));console.log({success:criteria.length-failed.length,failed});
