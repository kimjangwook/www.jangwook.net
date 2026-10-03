import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse } from 'yaml';
import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { JSDOM } from 'jsdom';
const root=path.resolve('archive/legacy-site-20261001');
const supplement=path.resolve('content/archive-supplement-20261001');
const sourceRoots=[root,supplement];
const output=path.resolve('static/archive-content');
const media=path.resolve('static/archive-media');
await fs.mkdir(output,{recursive:true});await fs.mkdir(media,{recursive:true});await fs.mkdir('reports',{recursive:true});
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const policy=JSON.parse(await fs.readFile('content/archive-source-policy.json','utf8'));
const tracked=new Set(policy.originalFiles);
const records=[],excluded=[],issues=[];const copied=new Map();
const iso=v=>v?new Date(v).toISOString():null;
async function asset(ref,file){
 if(!ref||ref.startsWith('/archive-media/')||/^(https?:|data:|#)/.test(ref))return ref;
 const fileRoot=file.startsWith(supplement+path.sep)?supplement:root;
 const source=ref.startsWith('/')?path.join(root,'public',ref):path.resolve(path.dirname(file),ref);
 if(!source.startsWith(fileRoot+path.sep)&&!source.startsWith(root+path.sep))throw new Error('Outside archive: '+ref);
 try{const bytes=await fs.readFile(source);const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,24);const name=hash+path.extname(source).toLowerCase();if(!copied.has(source)){await fs.writeFile(path.join(media,name),bytes);copied.set(source,'/archive-media/'+name);}return copied.get(source);}catch(e){issues.push({file:path.relative(root,file),asset:ref,error:e.message});return ref;}
}
for(const sourceRoot of sourceRoots){
 const content=path.join(sourceRoot,'src/content/blog');
 for(const lang of ['ko','en','ja','zh']){
 for(const filename of (await fs.readdir(path.join(content,lang))).sort()){
 if(!/\.mdx?$/.test(filename))continue;
 if(sourceRoot===root&&!tracked.has('src/content/blog/'+lang+'/'+filename)){excluded.push({lang,slug:filename.replace(/\.mdx?$/,''),reason:'unpublished local source outside archived Git snapshot'});continue;}
 const file=path.join(content,lang,filename),raw=await fs.readFile(file,'utf8');
 const front=raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);if(!front)throw new Error('No frontmatter: '+file);
 const meta=parse(front[1]);const slug=filename.replace(/\.mdx?$/,'');
 if(meta.draft||String(meta.pubDate).slice(0,10)>today){excluded.push({lang,slug,reason:meta.draft?'draft':'future'});continue;}
 const canonicalPath='/'+lang+'/blog/'+lang+'/'+slug+'/';
 const hash=crypto.createHash('sha256').update(raw).digest('hex');
 let body=raw.slice(front[0].length);
 // Only MDX top-level imports/Image are converted. Fenced executable examples remain text.
 const imports=new Map();let inFence=false;
 const lines=[];
 for(let line of body.split('\n')){
 if(/^\s*(```|~~~)/.test(line)){inFence=!inFence;lines.push(line);continue;}
 if(!inFence){
 const declaration=line.match(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*$/);
 if(declaration&&declaration[2].startsWith('.')){imports.set(declaration[1],await asset(declaration[2],file));continue;}
 if(/^import\s+\{\s*Image\s*\}\s+from\s+['"]astro:assets['"]/.test(line))continue;
 line=line.replace(/<Image\s+([^>]+)\/>/g,(_,attrs)=>{const ref=attrs.match(/src=\{(\w+)\}/)?.[1];const alt=attrs.match(/alt="([^"]*)"/)?.[1]??'';return '<img src="'+(imports.get(ref)??'')+'" alt="'+alt+'" loading="lazy"/>';});
 }
 lines.push(line);
 }
 const markdown=new Marked();let html=markdown.parse(lines.join('\n'),{async:false});
 if(Array.isArray(meta.faq)&&meta.faq.length){
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titles={ko:'자주 묻는 질문',en:'Frequently Asked Questions',ja:'よくある質問',zh:'常见问题'};
  html+='<section><h2 id="faq-title">'+titles[lang]+'</h2>'+meta.faq.map((f,i)=>'<details'+(i===0?' open':'')+'><summary>'+esc(f.question)+'</summary><p>'+esc(f.answer)+'</p></details>').join('')+'</section>';
 }

 html=sanitizeHtml(html,{allowedTags:[...sanitizeHtml.defaults.allowedTags,'section','img','input','details','summary','figure','figcaption'],allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,'*':['id','lang','dir'],a:['href','title','hreflang'],img:['src','alt','width','height','loading'],input:['type','checked','disabled','aria-label'],details:['open'],code:['class']},allowedSchemes:['http','https','mailto','tel'],transformTags:{h1:'h2'}});
 const dom=new JSDOM(html);const doc=dom.window.document;const toc=[],seen=new Map();
 for(const h of doc.querySelectorAll('h2,h3,h4,h5,h6')){
 const base=h.textContent.trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu,'').replace(/ /g,'-');const count=seen.get(base)??0;seen.set(base,count+1);if(!h.id)h.id=base+(count?'-'+count:'');if(h.tagName==='H2')toc.push({id:h.id,text:h.textContent});
 }
 for(const table of doc.querySelectorAll('table')){const region=doc.createElement('div');region.className='table-scroll';region.setAttribute('role','region');region.setAttribute('tabindex','0');region.setAttribute('aria-label',({ko:'데이터 표 · 가로 스크롤',en:'Data table · horizontal scrolling',ja:'データ表 · 横スクロール',zh:'数据表 · 水平滚动'})[lang]);table.replaceWith(region);region.appendChild(table);}
 for(const img of doc.querySelectorAll('img')){img.setAttribute('src',await asset(img.getAttribute('src'),file));img.setAttribute('loading','lazy');img.setAttribute('decoding','async');if(!img.hasAttribute('alt'))img.setAttribute('alt','');}
 for(const box of doc.querySelectorAll('input[type=checkbox]')){box.setAttribute('disabled','');box.setAttribute('aria-label',box.closest('li')?.textContent.trim().slice(0,160)||'체크리스트 항목');}
 for(const link of doc.querySelectorAll('a[href]')){const href=link.getAttribute('href');if(/^\.\.?\//.test(href)){const target=path.resolve(path.dirname(file),href.split('#')[0]);if(/\.mdx?$/.test(target)){const rel=path.relative(content,target).replace(/\.mdx?$/,'');const targetLang=rel.split('/')[0];link.setAttribute('href','/'+targetLang+'/blog/'+rel+'/' +(href.includes('#')?'#'+href.split('#')[1]:''));}}}
 const hero=meta.heroImage?await asset(meta.heroImage,file):null;
 const post={lang,slug,path:canonicalPath,title:String(meta.title),description:String(meta.description??''),publishedAt:iso(meta.pubDate),updatedAt:iso(meta.updatedDate),noindex:!!meta.noindex,tags:meta.tags??[],sourceHash:hash,asset:hash+'.json',hero,heroAlt:meta.heroImageAlt??''};
 await fs.writeFile(path.join(output,post.asset),JSON.stringify({html:doc.body.innerHTML,toc}));dom.window.close();records.push(post);
 }
}
}
records.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||a.path.localeCompare(b.path));
await fs.mkdir('src/lib/content',{recursive:true});await fs.writeFile('src/lib/content/archive.json',JSON.stringify(records));
await fs.writeFile('reports/archive-migration.json',JSON.stringify({generatedAt:new Date().toISOString(),originalURLRule:'/{lang}/blog/{lang}/{slug}/',posts:records.length,languages:Object.fromEntries(['ko','en','ja','zh'].map(l=>[l,records.filter(p=>p.lang===l).length])),excluded,assets:copied.size,issues,paths:records.map(p=>p.path)},null,2));
// Remove obsolete generated payloads only. Original sources are never modified.
const current=new Set(records.map(p=>p.asset));for(const name of await fs.readdir(output))if(name.endsWith('.json')&&!current.has(name))await fs.unlink(path.join(output,name));
console.log({archivePosts:records.length,excluded:excluded.length,assets:copied.size,issues:issues.length});
if(issues.length)process.exitCode=1;
