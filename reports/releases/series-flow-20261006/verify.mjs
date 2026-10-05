import {chromium,webkit} from 'playwright';import fs from 'node:fs/promises';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const base=process.argv[2]||'http://127.0.0.1:8801',prefix=process.argv[3]||'local',out='reports/releases/series-flow-20261006';
const report={base,articles:[],responsive:[],noJS:[],nativePlayback:[],artifacts:[],preservation:[],errors:[]};
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const cases=['K17','K42','K08','K63','K25','K91','K34','K56','K79','K03'];
function ensure(b,msg){if(!b)throw Error(msg)}
const catalog=JSON.parse(await fs.readFile('src/lib/content/catalog.json','utf8'));const translations=JSON.parse(await fs.readFile('src/lib/content/translations.json','utf8'));
try {
for(const lang of ['ko','en','ja','zh']){
 const entry=(lang==='ko'?catalog:translations[lang]).find(p=>p.slug==='audio-only-and-video-only-prerecorded');const p=(lang==='ko'?'':'/'+lang)+'/series/accessibility/'+entry.slug;const res=await fetch(base+p);const html=await res.text();ensure(res.status===200,'article status '+lang);ensure(html.includes(entry.sourceHash),'approved identity '+lang);ensure((html.match(/data-practice-case=/g)||[]).length===2,'two inline practice pages '+lang);const a=html.indexOf('data-practice-case="K63"'),b=html.indexOf('data-practice-case="K25"'),c=html.indexOf('id="evaluation-prompt"');ensure(a<b&&b<c,'practice before final prompt '+lang);ensure(!/Hyperframes|初期本文|초기 본문|initial body|初始正文/.test(html),'public production/history prose '+lang);report.articles.push({lang,path:p,sourceHash:entry.sourceHash,firstPublishedAt:entry.firstPublishedAt,inlineCaseOrder:['K63','K25'],promptAfterResults:true,SSR:true});
 const body='content/series/accessibility/'+(lang==='ko'?'prompts/':`translations/${lang}/prompts/`)+entry.slug+'.md';const current=await fs.readFile(body);const before=execFileSync('git',['show','15dadaf7:'+body]);ensure(hash(current)===hash(before),'executed prompt unchanged '+lang);report.preservation.push({lang,promptSHA:hash(current),unchanged:true});
}
const oldCatalog=JSON.parse(execFileSync('git',['show','15dadaf7:src/lib/content/catalog.json'],{encoding:'utf8'}));const oldTranslations=JSON.parse(execFileSync('git',['show','15dadaf7:src/lib/content/translations.json'],{encoding:'utf8'}));
for(const lang of ['ko','en','ja','zh'])for(const slug of ['overview','non-text-content','audio-only-and-video-only-prerecorded']){const now=(lang==='ko'?catalog:translations[lang]).find(x=>x.slug===slug),old=(lang==='ko'?oldCatalog:oldTranslations[lang]).find(x=>x.slug===slug);ensure(now.firstPublishedAt===old.firstPublishedAt,'first publication preserved '+lang+' '+slug);ensure(now.sourceHash!==old.sourceHash,'revised article identity '+lang+' '+slug);report.preservation.push({lang,slug,firstPublishedAtUnchanged:true,articleIdentity:'updated'});}
for(const file of await fs.readdir('static/lab-fixtures/media-1.2.1/results')){
 if(!file.endsWith('.json'))continue;const path='/lab-fixtures/media-1.2.1/results/'+file;const raw=await fs.readFile('static'+path);const res=await fetch(base+path);ensure(res.status===200,'result status '+file);ensure(hash(Buffer.from(await res.arrayBuffer()))===hash(raw),'result hash '+file);const pub=JSON.parse(raw);const source=await fs.readFile(`reports/validation/media-1.2.1-20261004/final-v02/outputs/claude-${pub.case_id}-r${pub.round}-result.json`,'utf8');const redacted=JSON.parse(source.replaceAll('/Users/jangwook/workspace/www.jangwook.net/reports/validation/media-1.2.1-20261004','{{fixture_root}}'));ensure(JSON.stringify(pub.result)===JSON.stringify(redacted),'actual output fidelity '+file);ensure(hash(source)===pub.original_output_sha256,'source hash '+file);ensure(!raw.toString().includes('/Users/'),'private root '+file);report.artifacts.push({path,hashMatch:true,recordedDecision:pub.result.scope.decision,allResultFieldsPreserved:true});
}
for(const caseId of cases){const path='/lab-fixtures/media-1.2.1/results/inputs/'+caseId+'.txt';const raw=await fs.readFile('static'+path);const res=await fetch(base+path);ensure(res.status===200&&hash(Buffer.from(await res.arrayBuffer()))===hash(raw),'input delivery '+caseId);report.artifacts.push({path,hashMatch:true});}
report.navigation=[];report.preparation=[];
const heads={ko:'다음 글로 이어가기',en:'Continue to the next article',ja:'次の記事へ',zh:'继续阅读下一篇'};
const guides={ko:'평가 프롬프트를 사용하기 전에',en:'Before using the evaluation prompt',ja:'評価プロンプトを使う前に',zh:'使用评估提示词之前'};
const slugs=['overview','non-text-content','audio-only-and-video-only-prerecorded'];
const flowBrowser=await chromium.launch();
for(const lang of ['ko','en','ja','zh']){
 for(const [index,slug] of slugs.entries()){
  const entry=(lang==='ko'?catalog:translations[lang]).find(x=>x.slug===slug),path=(lang==='ko'?'':'/'+lang)+'/series/accessibility/'+slug;
  const bodyPath='content/series/accessibility/'+(lang==='ko'?'':`translations/${lang}/`)+'prompts/'+slug+'.md';
  ensure(hash(await fs.readFile(bodyPath))===hash(execFileSync('git',['show','15dadaf7:'+bodyPath])),'validated prompt bytes '+lang+' '+slug);
  const response=await fetch(base+path),html=await response.text();ensure(response.status===200&&html.includes(entry.sourceHash),'SSR article identity '+lang+' '+slug);
  ensure(html.includes('BlogPosting')&&html.includes(entry.firstPublishedAt),'SSR publication metadata '+lang+' '+slug);
  const context=await flowBrowser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();await page.goto(base+path,{waitUntil:'domcontentloaded'});
  const flow=await page.locator('.article-content').evaluate((el,args)=>{
   const h=[...el.querySelectorAll('.prose h2')],closing=h.find(x=>x.textContent===args.heading),guide=h.find(x=>x.textContent===args.guide),refs=h.at(-1),prompt=el.querySelector('#evaluation-prompt');
   const links=closing?.nextElementSibling?.nextElementSibling;
   return {headings:h.map(x=>x.textContent),tailLinks:links?.tagName==='UL'?[...links.querySelectorAll('a')].map(a=>({name:a.textContent,href:a.getAttribute('href')})):[],guideBeforeClosing:!!guide&&!!closing&&!!(guide.compareDocumentPosition(closing)&Node.DOCUMENT_POSITION_FOLLOWING),closingBeforeReferences:!!closing&&!!refs&&!!(closing.compareDocumentPosition(refs)&Node.DOCUMENT_POSITION_FOLLOWING),referencesBeforePrompt:!!refs&&!!prompt&&!!(refs.compareDocumentPosition(prompt)&Node.DOCUMENT_POSITION_FOLLOWING),body:[...el.querySelectorAll('.prose')].map(x=>x.textContent).join(' '),promptCount:el.querySelectorAll('#evaluation-prompt').length};
  },{heading:heads[lang],guide:guides[lang]});
  ensure(flow.guideBeforeClosing&&flow.closingBeforeReferences&&flow.referencesBeforePrompt&&flow.promptCount===1,'chapter02 tail order '+lang+' '+slug);
  ensure(!/준비\s*중|in preparation|coming soon|準備中|准备中/i.test(flow.body),'no static preparation prose '+lang+' '+slug);
  const suffixes=index===0?['/series/accessibility','/series/accessibility/non-text-content']:['/series/accessibility/'+slugs[index-1],'/series/accessibility','/series/accessibility/'+(index===1?slugs[2]:'captions-prerecorded')];
  ensure(JSON.stringify(flow.tailLinks.map(x=>x.href))===JSON.stringify(suffixes.map(x=>(lang==='ko'?'':'/'+lang)+x)),'localized tail links/order '+lang+' '+slug);
  if(index===2){const practiceIndex=flow.headings.findIndex(x=>/실습 페이지|Results of evaluating|実習ページ|用提示词评估/.test(x));const checkIndex=flow.headings.findIndex(x=>/실무 체크|Practical checklist|実務チェック|实务检查/.test(x));ensure(practiceIndex>=0&&practiceIndex<checkIndex,'results before checklist '+lang);}
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});ensure(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'flow overflow '+lang+' '+slug+' '+width);
   await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});const result=await page.evaluate(async()=>await axe.run(document.querySelector('.article-shell'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));ensure(!result.violations.length,'flow axe '+lang+' '+slug+' '+width+JSON.stringify(result.violations.map(x=>x.id)));
  }
  await page.setViewportSize({width:1100,height:900});await page.getByRole('heading',{name:heads[lang],exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${prefix}-closing-${lang}-${index+1}.png`});
  report.navigation.push({lang,slug,path,sourceHash:entry.sourceHash,headings:flow.headings,tailLinks:flow.tailLinks,chapter02Order:true,promptUnchanged:true,widths:[1440,390,320],axeViolations:0});await context.close();
  const nojs=await flowBrowser.newContext({javaScriptEnabled:false}),np=await nojs.newPage();await np.goto(base+path,{waitUntil:'domcontentloaded'});ensure(await np.locator('#evaluation-prompt pre').count()===1,'flow noJS prompt '+lang+' '+slug);const outline=np.locator('details').first();await outline.locator('summary').click();ensure(await outline.getAttribute('open')!==null,'noJS outline toggle '+lang+' '+slug);ensure(await np.getByRole('heading',{name:heads[lang],exact:true}).count()===1,'noJS closing '+lang+' '+slug);await nojs.close();
 }
 const res=await fetch(base+(lang==='ko'?'':'/'+lang)+'/series/accessibility/captions-prerecorded'),html=await res.text();ensure(res.status===200&&html.includes('noindex')&&!html.includes('"@type":"BlogPosting"'),'unpublished page honest '+lang);report.preparation.push({lang,noindex:true,notPublished:true});
}
await flowBrowser.close();
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
