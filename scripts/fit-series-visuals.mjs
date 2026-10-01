import fs from 'node:fs';import crypto from 'node:crypto';import {chromium} from 'playwright';
const browser=await chromium.launch();const page=await browser.newPage();const report=[];
const provenance=JSON.parse(fs.readFileSync('reports/translations/accessibility-overview-provenance.json'));
for(const locale of provenance){
 const bodyPath=`content/series/accessibility/translations/${locale.lang}/posts/overview.md`;let body=fs.readFileSync(bodyPath,'utf8');
 for(const asset of locale.assets){
  const raw=fs.readFileSync('static'+asset.src,'utf8');await page.setContent('<html lang="'+locale.lang+'"><body>'+raw+'</body></html>');
  const result=await page.evaluate(({slug,lang})=>{
   const svg=document.querySelector('svg'),records=[];
   if(slug==='wcag-structure'&&lang==='en'&&svg.getAttribute('height')==='760'){
    const principleBox=[...svg.querySelectorAll('rect')].find(r=>r.getAttribute('y')==='187');principleBox.setAttribute('height','146');
    for(const e of svg.querySelectorAll('[y]')){const y=Number(e.getAttribute('y'));if(y>=303)e.setAttribute('y',String(y+30));}
    for(const e of svg.querySelectorAll('path[d]')){const d=e.getAttribute('d');if(/^M420 /.test(d))e.setAttribute('d',d.replace(/(M420 |L420 )(\d+)/g,(_,prefix,y)=>prefix+(Number(y)+30)));}
    svg.setAttribute('height','790');svg.setAttribute('viewBox','0 0 840 790');svg.querySelector('rect:not([y])').setAttribute('height','790');
   }
   for(const t of svg.querySelectorAll('text')){
    const x=Number(t.getAttribute('x'));let allowed=792-x;
    if(slug==='wcag-structure'&&lang==='en'&&x===561)t.textContent='AAA = all levels';
    if((slug==='evidence-workflow'||slug==='signup-states')&&x===150)allowed=620;
    if(slug==='image-context'&&x===328)allowed=420;
    if(slug==='image-context'&&x===494)allowed=250;
    if(slug==='wcag-structure'&&x===306)allowed=202;
    if(slug==='wcag-structure'&&x===561)allowed=211;
    if(slug==='wcag-structure'&&Number(t.getAttribute('y'))===276&&lang==='en'){
     t.setAttribute('font-size','30');t.innerHTML='<tspan x="72" y="271">Perceivable · Operable</tspan><tspan x="72" y="309">Understandable · Robust</tspan>';
    }
    const width=t.getBBox().width;
    if(width>allowed){const size=Number(t.getAttribute('font-size'));const adjusted=Math.floor(size*allowed/width);t.setAttribute('font-size',String(adjusted));records.push({label:t.textContent,before:size,after:adjusted,width,allowed});}
   }
   return{height:Number(svg.getAttribute('height')),svg:svg.outerHTML,adjustments:records,clipped:[...svg.querySelectorAll('text')].filter(t=>t.getBBox().x+t.getBBox().width>804).map(t=>t.textContent)};
  },{slug:asset.slug,lang:locale.lang});
  if(result.adjustments.some(r=>r.after<24)||result.clipped.length)throw Error('Diagram needs manual line wrapping '+JSON.stringify({lang:locale.lang,slug:asset.slug,adjustments:result.adjustments,clipped:result.clipped}));
  const sha=crypto.createHash('sha256').update(result.svg).digest('hex'),src=asset.src.replace(/-[a-f0-9]{12}\.svg$/,'-'+sha.slice(0,12)+'.svg');fs.writeFileSync('static'+src,result.svg);body=body.replace(new RegExp('(<img[^>]*src=\"'+asset.src+'\"[^>]*height=\")([0-9]+)(\")'),(_,before,height,after)=>before+result.height+after);body=body.replaceAll(asset.src,src);asset.src=src;asset.sha256=sha;report.push({lang:locale.lang,slug:asset.slug,...{adjustments:result.adjustments,clipped:result.clipped}});
 }
 fs.writeFileSync(bodyPath,body);
}
await browser.close();fs.writeFileSync('reports/translations/diagram-layout.json',JSON.stringify(report,null,2));fs.writeFileSync('reports/translations/accessibility-overview-provenance.json',JSON.stringify(provenance,null,2));console.log(JSON.stringify(report));
