import {chromium,webkit} from 'playwright';import fs from 'node:fs/promises';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const base=process.argv[2]||'http://127.0.0.1:8801',prefix=process.argv[3]||'local',out='reports/releases/media-practice-20261006';
const report={base,articles:[],responsive:[],noJS:[],nativePlayback:[],artifacts:[],preservation:[],errors:[]};
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const cases=['K17','K42','K08','K63','K25','K91','K34','K56','K79','K03'];
function ensure(b,msg){if(!b)throw Error(msg)}
const catalog=JSON.parse(await fs.readFile('src/lib/content/catalog.json','utf8'));const translations=JSON.parse(await fs.readFile('src/lib/content/translations.json','utf8'));
try {
for(const lang of ['ko','en','ja','zh']){
 const entry=(lang==='ko'?catalog:translations[lang]).find(p=>p.slug==='audio-only-and-video-only-prerecorded');const p=(lang==='ko'?'':'/'+lang)+'/series/accessibility/'+entry.slug;const res=await fetch(base+p);const html=await res.text();ensure(res.status===200,'article status '+lang);ensure(html.includes(entry.sourceHash),'approved identity '+lang);ensure((html.match(/data-practice-case=/g)||[]).length===2,'two inline practice pages '+lang);const a=html.indexOf('data-practice-case="K63"'),b=html.indexOf('data-practice-case="K25"'),c=html.indexOf('id="evaluation-prompt"');ensure(a<b&&b<c,'practice before final prompt '+lang);ensure(!/Hyperframes|初期本文|초기 본문|initial body|初始正文/.test(html),'public production/history prose '+lang);report.articles.push({lang,path:p,sourceHash:entry.sourceHash,firstPublishedAt:entry.firstPublishedAt,inlineCaseOrder:['K63','K25'],promptAfterResults:true,SSR:true});
 const body='content/series/accessibility/'+(lang==='ko'?'prompts/':`translations/${lang}/prompts/`)+entry.slug+'.md';const current=await fs.readFile(body);const before=execFileSync('git',['show','f93bf827:'+body]);ensure(hash(current)===hash(before),'executed prompt unchanged '+lang);report.preservation.push({lang,promptSHA:hash(current),unchanged:true});
}
const oldCatalog=JSON.parse(execFileSync('git',['show','f93bf827:src/lib/content/catalog.json'],{encoding:'utf8'}));const oldTranslations=JSON.parse(execFileSync('git',['show','f93bf827:src/lib/content/translations.json'],{encoding:'utf8'}));
for(const lang of ['ko','en','ja','zh'])for(const slug of ['overview','non-text-content','audio-only-and-video-only-prerecorded']){const now=(lang==='ko'?catalog:translations[lang]).find(x=>x.slug===slug),old=(lang==='ko'?oldCatalog:oldTranslations[lang]).find(x=>x.slug===slug);ensure(now.firstPublishedAt===old.firstPublishedAt,'first publication preserved '+lang+' '+slug);if(slug!=='audio-only-and-video-only-prerecorded')ensure(now.sourceHash===old.sourceHash,'prior article preserved '+lang+' '+slug);report.preservation.push({lang,slug,firstPublishedAtUnchanged:true,priorArticleIdentity:slug!=='audio-only-and-video-only-prerecorded'?'unchanged':'updated'});}
for(const file of await fs.readdir('static/lab-fixtures/media-1.2.1/results')){
 if(!file.endsWith('.json'))continue;const path='/lab-fixtures/media-1.2.1/results/'+file;const raw=await fs.readFile('static'+path);const res=await fetch(base+path);ensure(res.status===200,'result status '+file);ensure(hash(Buffer.from(await res.arrayBuffer()))===hash(raw),'result hash '+file);const pub=JSON.parse(raw);const source=await fs.readFile(`reports/validation/media-1.2.1-20261004/final-v02/outputs/claude-${pub.case_id}-r${pub.round}-result.json`,'utf8');const redacted=JSON.parse(source.replaceAll('/Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004','{{fixture_root}}'));ensure(JSON.stringify(pub.result)===JSON.stringify(redacted),'actual output fidelity '+file);ensure(hash(source)===pub.original_output_sha256,'source hash '+file);ensure(!raw.toString().includes('/Users/'),'private root '+file);report.artifacts.push({path,hashMatch:true,recordedDecision:pub.result.scope.decision,allResultFieldsPreserved:true});
}
for(const caseId of cases){const path='/lab-fixtures/media-1.2.1/results/inputs/'+caseId+'.txt';const raw=await fs.readFile('static'+path);const res=await fetch(base+path);ensure(res.status===200&&hash(Buffer.from(await res.arrayBuffer()))===hash(raw),'input delivery '+caseId);report.artifacts.push({path,hashMatch:true});}
for(const engine of [chromium,webkit]){
 const browser=await engine.launch();const context=await browser.newContext({viewport:{width:1440,height:900}});
 for(const article of report.articles){
  const page=await context.newPage();await page.goto(base+article.path,{waitUntil:'domcontentloaded'});ensure(await page.locator('#evaluation-prompt').count()===1,'one prompt '+article.lang);ensure(await page.locator('.media-lab-embed').count()===2,'frame count '+article.lang);
  for(const caseId of ['K63','K25']){
   const selector=`[data-practice-case="${caseId}"] iframe`;await page.locator(selector).scrollIntoViewIfNeeded();const v=page.frameLocator(selector).locator('video');await v.waitFor({state:'visible'});await v.evaluate(el=>el.scrollIntoView({block:'center'}));
   if(engine===webkit){const rect=await v.evaluate(el=>({height:el.getBoundingClientRect().height}));await v.click({position:{x:35,y:rect.height-16}});}else{await v.focus();await v.press('Space');}
   await page.waitForTimeout(1200);const state=await v.evaluate(el=>({paused:el.paused,time:el.currentTime,error:el.error?.message||null,duration:el.duration}));ensure(!state.paused&&state.time>0&&!state.error,`native playback ${engine.name()} ${article.lang} ${caseId}`);await v.evaluate(el=>{el.pause();el.currentTime=16});await page.waitForTimeout(350);const t=await v.evaluate(el=>el.currentTime);ensure(t>15,`seek ${engine.name()} ${article.lang} ${caseId}`);report.nativePlayback.push({engine:engine.name(),lang:article.lang,caseId,...state,seek16:true});
  }
  if(engine===chromium){
   for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:900});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);ensure(!overflow,'overflow '+article.lang+' '+width);await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});const axe=await page.evaluate(async()=>await axe.run(document.querySelector('.article-shell'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));const violations=axe.violations.map(x=>({id:x.id,nodes:x.nodes.length}));ensure(!violations.length,'axe '+article.lang+' '+width+JSON.stringify(violations));report.responsive.push({lang:article.lang,width,overflow,axeViolations:violations});
   }
   await page.setViewportSize({width:1100,height:1000});await page.locator('[data-practice-case="K63"]').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${prefix}-practice-${article.lang}.png`});
  }
  await page.close();
 }
 await context.close();
 if(engine===chromium){const c=await browser.newContext({javaScriptEnabled:false});for(const a of report.articles){const p=await c.newPage();await p.goto(base+a.path);ensure(await p.locator('.media-lab-embed').count()===2&&await p.locator('#evaluation-prompt pre').count()===1,'no-JS '+a.lang);report.noJS.push({lang:a.lang,inlinePractice:true,promptReadable:true});await p.close();}await c.close();}
 await browser.close();
}
}catch(e){report.errors.push(e.stack||String(e));}
await fs.writeFile(`${out}/${prefix}-validation.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({base,articles:report.articles.length,artifacts:report.artifacts.length,native:report.nativePlayback.length,responsive:report.responsive.length,errors:report.errors}));if(report.errors.length)process.exit(1);
