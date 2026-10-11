import {chromium,webkit} from 'playwright';import fs from 'node:fs/promises';import crypto from 'node:crypto';
const base=process.argv[2]??'http://127.0.0.1:8811',prefix=process.argv[3]??'local',out='reports/releases/chapters-03-04-20261011';
const catalog=JSON.parse(await fs.readFile('src/lib/content/catalog.json')),translations=JSON.parse(await fs.readFile('src/lib/content/translations.json'));
const report={base,articles:[],responsive:[],nativePlayback:[],practice:[],noJS:[],errors:[]};
const ensure=(x,m)=>{if(!x)throw Error(m)},hash=x=>crypto.createHash('sha256').update(x).digest('hex');
try{
for(const lang of ['ko','en','ja','zh']){
 for(const slug of ['audio-only-and-video-only-prerecorded','captions-prerecorded']){
  const entry=(lang==='ko'?catalog:translations[lang]).find(p=>p.slug===slug),path=(lang==='ko'?'':'/'+lang)+'/series/accessibility/'+slug;
  const response=await fetch(base+path),html=await response.text();ensure(response.status===200,'article status '+path);ensure(html.includes(entry.sourceHash),'article approved source '+path);ensure(html.includes('"@type":"BlogPosting"')&&html.includes(entry.firstPublishedAt),'SSR publication metadata '+path);ensure(html.includes('article-source-sha256'),'identity meta '+path);ensure(!html.includes('name="robots" content="noindex'),'published indexing '+path);ensure((html.match(/scripts\.scriptwrapper\.com\/tags\/b87a8865-5f57-423f-81d5-36dd4700eafe\.js/g)||[]).length===1,'one Journey tag '+path);report.articles.push({lang,slug,path,sourceHash:entry.sourceHash,firstPublishedAt:entry.firstPublishedAt,updatedAt:entry.updatedAt,SSR:true});
 }
 const prep=await fetch(base+(lang==='ko'?'':'/'+lang)+'/series/accessibility/audio-description-or-media-alternative-prerecorded'),html=await prep.text();ensure(prep.status===200&&html.includes('noindex')&&!html.includes('"@type":"BlogPosting"'),'next chapter private '+lang);
 const home=await fetch(base+'/'+lang+'/'),h=await home.text();ensure(h.includes('/series/accessibility/captions-prerecorded'),'latest chapter home '+lang);
 for(const name of ['complete','sound-omitted','negation','shifted','open','transcript-only','speaker-omitted','condensed','text-alternative','unlabeled-text-alternative','extra-information','partial','unavailable-source','no-target']){
  const path=`/labs/accessibility/captions/${lang}/${name}.html`,res=await fetch(base+path),text=await res.text();ensure(res.status===200&&text.includes(`lang="${lang}"`),'localized practice '+path);ensure(text.includes('noindex'),'practice excluded '+path);report.practice.push({lang,path,status:res.status});
 }
}
for(const file of ['compatible.mp4','open.mp4']){
 const path='/labs/accessibility/captions/ko/'+file,raw=await fs.readFile('static'+path),res=await fetch(base+path);ensure(res.status===200&&res.headers.get('content-type')?.includes('video/mp4'),'video type '+file);ensure(hash(Buffer.from(await res.arrayBuffer()))===hash(raw),'video bytes '+file);const range=await fetch(base+path,{headers:{Range:'bytes=0-63'}});ensure(range.status===206&&range.headers.get('content-range')===`bytes 0-63/${raw.length}`,'video range '+file);
}
const ads=await fetch(base+'/ads.txt');ensure(ads.status===200&&ads.headers.get('content-type')?.includes('text/plain'),'ads preserved');ensure(hash(Buffer.from(await ads.arrayBuffer()))===hash(await fs.readFile('static/ads.txt')),'ads same build');
for(const engine of [chromium,webkit]){
 const browser=await engine.launch();
 for(const article of report.articles){
  console.log('Verifying',engine.name(),article.lang,article.slug);
  const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();await page.goto(base+article.path,{waitUntil:'domcontentloaded'});ensure(await page.locator('#evaluation-prompt pre').count()===1,'prompt rendered '+article.path);const tailNames={ko:'다음 글로 이어가기',en:'Continue to the next article',ja:'次の記事へ',zh:'继续阅读下一篇'};ensure(await page.getByRole('heading',{name:tailNames[article.lang],exact:true}).count()===1,'consistent closing '+article.path);const is04=article.slug==='captions-prerecorded';
  const selector=is04?'.caption-practice iframe':'[data-practice-case="K63"] iframe';const iframe=page.locator(selector);await iframe.scrollIntoViewIfNeeded();const video=page.frameLocator(selector).locator('video').first();await video.waitFor({state:'visible'});await video.evaluate(v=>new Promise(resolve=>{if(v.readyState>=1)resolve(true);else v.addEventListener('loadedmetadata',()=>resolve(true),{once:true});}));await page.waitForTimeout(500);
  // Native controls, then a seek. No synthetic rewrite of evaluated video content.
  if(engine===webkit){const height=await video.evaluate(v=>v.getBoundingClientRect().height);await video.click({position:{x:35,y:height-16}});}else{await video.focus();await video.press('Space');}
  await page.waitForTimeout(1200);const state=await video.evaluate(v=>({paused:v.paused,time:v.currentTime,duration:v.duration,error:v.error?.message??null}));ensure(!state.paused&&state.time>0&&!state.error,'native playback '+engine.name()+' '+article.path+' '+JSON.stringify(state));await video.evaluate(v=>{v.pause();v.currentTime=9});await page.waitForTimeout(300);ensure(await video.evaluate(v=>v.currentTime)>8,'seek '+article.path);
  if(is04){const track=await video.evaluate(v=>({tracks:v.textTracks.length,mode:v.textTracks[0]?.mode,cues:v.textTracks[0]?.cues?.length,active:v.textTracks[0]?.activeCues?.[0]?.text}));ensure(track.tracks===1&&track.cues>=5&&track.active,'caption delivery '+article.lang);report.nativePlayback.push({engine:engine.name(),...article,...state,track,seek:true});}else report.nativePlayback.push({engine:engine.name(),...article,...state,seek:true});
  if(engine===chromium){
   for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:900});ensure(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'article overflow '+article.path+' '+width);const imgs=await page.locator('.learning-figure img').evaluateAll(xs=>xs.map(x=>({loaded:x.complete&&x.naturalWidth>0,alt:!!x.alt})));ensure(imgs.length===4&&imgs.every(x=>x.loaded&&x.alt),'all figures '+article.path);await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});const result=await page.evaluate(async()=>await axe.run(document.querySelector('.article-shell'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));ensure(!result.violations.length,'article axe '+article.path+' '+width+JSON.stringify(result.violations.map(x=>x.id)));report.responsive.push({lang:article.lang,slug:article.slug,width,overflow:false,figures:4,axeViolations:0});
   }
   if(is04){await page.setViewportSize({width:1100,height:950});await page.locator('.caption-practice').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${prefix}-practice-${article.lang}.png`});}
  }
  await context.close();
 }
 for(const lang of ['ko','en','ja','zh']){const context=await browser.newContext(),page=await context.newPage();await page.goto(base+'/labs/accessibility/captions/'+lang+'/open.html');const v=page.locator('video');await v.evaluate(v=>new Promise(resolve=>{if(v.readyState>=1)resolve(true);else v.addEventListener('loadedmetadata',()=>resolve(true),{once:true});}));await page.waitForTimeout(500);if(engine===webkit){const h=await v.evaluate(v=>v.getBoundingClientRect().height);await v.click({position:{x:35,y:h-16}});}else{await v.focus();await v.press('Space');}await page.waitForTimeout(1000);const state=await v.evaluate(v=>({time:v.currentTime,paused:v.paused,error:v.error?.message??null}));ensure(state.time>0&&!state.paused&&!state.error,'open caption playback '+engine.name()+' '+lang);report.nativePlayback.push({engine:engine.name(),lang,fixture:'open',...state});await context.close();}
 if(engine===chromium){for(const article of report.articles){const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();await page.goto(base+article.path);ensure(await page.locator('#evaluation-prompt pre').count()===1,'noJS prompt');const toggle=page.locator('details').first();await toggle.locator('summary').click();ensure(await toggle.getAttribute('open')!==null,'noJS curriculum');report.noJS.push({path:article.path,prompt:true,curriculum:true});await context.close();}}
 await browser.close();
}
}catch(e){report.errors.push(e.stack??String(e));}
await fs.writeFile(`${out}/${prefix}-validation.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({base,articles:report.articles.length,practice:report.practice.length,responsive:report.responsive.length,nativePlayback:report.nativePlayback.length,errors:report.errors}));if(report.errors.length)process.exit(1);
