import './compile-content.mjs';import fs from 'node:fs/promises';
const posts=JSON.parse(await fs.readFile('src/lib/content/catalog.json','utf8'));const criteria=JSON.parse(await fs.readFile('docs/sources/wcag22-criteria.json','utf8')).filter(c=>c.level);const errors=[];
if(posts.length!==88)errors.push('Expected overview + 86 criteria + conclusion.');
for(const c of criteria){const matches=posts.filter(p=>p.criterion===c.id);if(matches.length!==1)errors.push('Criterion coverage '+c.id);else if(matches[0].level!==c.level||matches[0].slug!==c.slug)errors.push('Criterion metadata '+c.id);}
if(new Set(posts.map(p=>p.slug)).size!==posts.length)errors.push('Duplicate slugs.');if(new Set(posts.map(p=>p.prompt)).size!==posts.length)errors.push('Duplicate prompts.');
for(const p of posts){if(p.body.length<900||p.prompt.length<350)errors.push('Incomplete draft '+p.slug);if(!p.body.includes('## 참고 자료'))errors.push('Source references missing '+p.slug);if(p.status==='published'&&(!Number.isFinite(Date.parse(p.publishedAt))||!Number.isFinite(Date.parse(p.reviewedAt))||Date.parse(p.reviewedAt)>Date.parse(p.publishedAt)||p.approvalHash!==p.sourceHash))errors.push('Exact content approval missing '+p.slug);if(/TODO|TBD|lorem ipsum/i.test(p.body+p.prompt))errors.push('Placeholder '+p.slug);if(p.criterion&&!p.prompt.includes(p.criterion))errors.push('Prompt criterion missing '+p.slug);}
if(posts.some(p=>p.criterion==='4.1.1'))errors.push('Removed criterion present.');
const translations=JSON.parse(await fs.readFile('src/lib/content/translations.json','utf8'));const translationCounts={};
for(const lang of ['en','ja','zh']){
 const entries=translations[lang];translationCounts[lang]={metadata:entries.length,complete:entries.filter(p=>p.body&&p.prompt).length};
 if(entries.length!==posts.length||new Set(entries.map(p=>p.slug)).size!==posts.length)errors.push('Incomplete translated curriculum '+lang);
 for(const p of entries){
  if(!p.title?.trim()||!p.summary?.trim())errors.push('Missing translated metadata '+lang+'/'+p.slug);
  if(!p.hasContent)continue;
  const original=posts.find(o=>o.slug===p.slug);
  if(!p.body?.trim()||!p.prompt?.trim()||p.translationSourceHash!==original?.sourceHash)errors.push('Incomplete or stale translation '+lang+'/'+p.slug);
  const urls=s=>[...s.matchAll(/https?:\/\/[^\s)"<>]+/g)].map(m=>m[0]).sort();
  if(JSON.stringify(urls(p.body))!==JSON.stringify(urls(original.body)))errors.push('Translated source links differ '+lang+'/'+p.slug);
  if((p.body.match(/- \[ \]/g)??[]).length!==(original.body.match(/- \[ \]/g)??[]).length)errors.push('Translated checklist differs '+lang+'/'+p.slug);
  if((p.body.match(/<figure\b/g)??[]).length!==(original.body.match(/<figure\b/g)??[]).length)errors.push('Translated figures differ '+lang+'/'+p.slug);
  if(/<script\b|\son\w+\s*=|javascript:/i.test(p.body))errors.push('Unsafe translated markup '+lang+'/'+p.slug);
  for(const m of p.body.matchAll(/(?:src|href)="(\/images\/[^"]+)"/g)){try{await fs.access('static'+m[1]);}catch{errors.push('Missing translated figure '+lang+'/'+m[1]);}}
  if(p.status==='published'&&(p.approvalHash!==p.sourceHash||!Number.isFinite(Date.parse(p.reviewedAt))||!Number.isFinite(Date.parse(p.publishedAt))))errors.push('Translated approval missing '+lang+'/'+p.slug);
 }
 if(!entries.find(p=>p.slug==='overview')?.hasContent)errors.push('Translated overview missing '+lang);
}
const dateRecords=[...posts,...Object.values(translations).flat()];
for(const p of dateRecords){for(const key of ['updatedAt']){const value=p[key];if(!/^\d{4}-\d{2}-\d{2}$/.test(value??'')||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)errors.push('Invalid document date '+(p.lang??'ko')+'/'+p.slug+' '+key);}if(p.firstPublishedAt!==null&&(!Number.isFinite(Date.parse(p.firstPublishedAt))||Date.parse(p.firstPublishedAt)>Date.now()))errors.push('Invalid first publication '+(p.lang??'ko')+'/'+p.slug);if(p.status==='published'&&(!p.firstPublishedAt||Date.parse(p.firstPublishedAt)>Date.parse(p.publishedAt)))errors.push('First publication missing or after publication '+(p.lang??'ko')+'/'+p.slug);}
const report={posts:posts.length,criterionPosts:criteria.length,prompts:posts.length,levels:Object.fromEntries(['A','AA','AAA'].map(level=>[level,posts.filter(p=>p.level===level).length])),published:posts.filter(p=>p.status==='published').length,drafts:posts.filter(p=>p.status==='draft').length,bodyCharacters:posts.reduce((n,p)=>n+p.body.length,0),promptCharacters:posts.reduce((n,p)=>n+p.prompt.length,0),translationCounts,errors};await fs.writeFile('reports/content-validation.json',JSON.stringify(report,null,2));console.log(report);if(errors.length)process.exit(1);
