import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {chromium} from 'playwright';
const base=process.env.TEST_BASE_URL??'http://127.0.0.1:8787';
const posts=JSON.parse(await fs.readFile('src/lib/content/archive.json','utf8'));
const baseline=JSON.parse(await fs.readFile('reports/live-archive-paths.json','utf8'));
const report={base,archivePosts:posts.length,urlChecks:[],checks:[],errors:[]};
const paths=new Set(posts.map(p=>p.path));
for(const path of baseline)if(!paths.has(path))report.errors.push('Original live URL absent: '+path);
// Every old canonical URL must return real article HTML, not redirects or an empty SPA shell.
let next=0;
await Promise.all(Array.from({length:6},async()=>{while(next<posts.length){const post=posts[next++];try{
 const r=await fetch(base+post.path,{redirect:'manual'});const html=await r.text();
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/g)??[];
 const body=html.match(/<div class="prose">([\s\S]*?)<\/div>/)?.[1]??'';
 assert.equal(r.status,200);assert.equal(canonical.length,1);assert.equal(canonical[0],'<link rel="canonical" href="https://jangwook.net'+post.path+'"');assert(body.length>150);assert(html.includes('<html lang="'+post.lang+'">'));
 report.urlChecks.push({path:post.path,status:r.status,serverRenderedBodyBytes:Buffer.byteLength(body),canonical:true});
 }catch(e){report.errors.push(post.path+': '+e.message);}}}));
const sitemap=await fetch(base+'/sitemap.xml').then(r=>r.text());
for(const p of posts.filter(p=>!p.noindex))assert(sitemap.includes('<loc>https://jangwook.net'+p.path+'</loc>'));
for(const prefix of ['', '/en', '/ja', '/zh'])assert(sitemap.includes('<loc>https://jangwook.net'+prefix+'/series/accessibility/overview</loc>'));assert(!sitemap.includes('/series/accessibility/non-text-content'));
report.checks.push('Original article URLs present in sitemap; approved overview included; remaining drafts excluded');
const rss=await fetch(base+'/rss.xml').then(r=>r.text());assert(!rss.includes('/blog/'));report.checks.push('New RSS excludes archived articles');
for(const path of ['/','/series','/prompts','/archive','/about']){
 const r=await fetch(base+path);const doc=new JSDOM(await r.text()).window.document;
 assert.equal(r.status,200);assert.equal(doc.querySelectorAll('h1').length,1);assert(doc.querySelector('main').textContent.trim().length>100);assert.equal(doc.querySelectorAll('link[rel=canonical]').length,1);
 report.checks.push('SSR content and canonical: '+path);
}
for(const lang of ['ko','en','ja','zh']){
 const p=posts.find(p=>p.lang===lang&&p.slug==='salon-chatgpt-static-hosting-web-development');const doc=new JSDOM(await fetch(base+p.path).then(r=>r.text())).window.document;
 const structured=[...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>JSON.parse(s.textContent));assert(structured.some(s=>s['@type']==='BlogPosting'&&s.headline===p.title&&s.inLanguage===lang));assert.equal(doc.querySelectorAll('link[rel=alternate][hreflang]').length,4);
 for(const link of doc.querySelectorAll('.archive-toc a'))assert(doc.getElementById(decodeURIComponent(link.getAttribute('href').slice(1))));
 report.checks.push('Article schema, language alternates and heading anchors: '+lang);
}
for(const path of ['/ko/blog/','/ko/blog/page/30'])assert.equal((await fetch(base+path)).status,200);assert.equal((await fetch(base+'/ko/blog/page/31')).status,404);report.checks.push('Legacy pagination URLs preserved at original 12 posts per page');assert.equal((await fetch(base+'/ko/blog/ko/does-not-exist/')).status,404);report.checks.push('Unknown URL returns actual 404');
const browser=await chromium.launch();const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});const page=await context.newPage();await page.goto(base+'/archive');await page.locator('#archive-query').fill('salon');await page.locator('#archive-lang').selectOption('en');await Promise.all([page.waitForNavigation(),page.getByRole('button',{name:'검색',exact:true}).click()]);assert.equal(await page.locator('.archive-list li').count(),1);await page.locator('.archive-list a').click();assert((await page.locator('.prose').innerText()).length>2000);report.checks.push('No-JS archive search → original URL → full article');
await page.goto(base+'/archive?lang=ko');await page.getByRole('link',{name:'다음 페이지 →'}).click();assert(new URL(page.url()).searchParams.get('page')==='2');report.checks.push('No-JS archive pagination');
await browser.close();report.checkedAt=new Date().toISOString();await fs.writeFile('reports/archive-seo-validation.json',JSON.stringify(report,null,2));console.log({originalLiveURLs:baseline.length,checked:report.urlChecks.length,checks:report.checks.length,errors:report.errors.slice(0,10)});if(report.errors.length)process.exit(1);
