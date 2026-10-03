import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {JSDOM} from 'jsdom';
const root='content/series/accessibility';const input=process.argv[2];if(!input)throw Error('Pass the local translation result directory');
const original=JSON.parse(fs.readFileSync('src/lib/content/catalog.json'));const figures=JSON.parse(fs.readFileSync('reports/drafts/accessibility-overview-visuals.json')).figures;
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const reports=[];
for(const lang of ['en','ja','zh']){
 const read=name=>JSON.parse(fs.readFileSync(path.join(input,lang+'-'+name+'.json'),'utf8'));
 const draft=read('overview'),review=read('review'),metadata=read('metadata');
 for(const fix of review.replacements){if(!['title','summary','body','prompt'].includes(fix.field)||!draft[fix.field].includes(fix.old))throw Error('Review correction mismatch '+lang);draft[fix.field]=draft[fix.field].replace(fix.old,fix.new);}
 // Output-language instructions are intentionally localized for each reader.
 const promptEnds={en:['Write the output in Korean.','Write the output in English.'],ja:['出力は韓国語で作成してください。','出力は日本語で作成してください。'],zh:['请用韩语编写输出。','请用简体中文撰写输出。']};
 const outputLanguageChange=promptEnds[lang];
 if(!draft.prompt.includes(outputLanguageChange[0]))throw Error('Check localized prompt output instruction '+lang+'\n'+draft.prompt.slice(-250));
 draft.prompt=draft.prompt.replace(...outputLanguageChange);
 const base=root+'/translations/'+lang;fs.mkdirSync(base+'/posts',{recursive:true});fs.mkdirSync(base+'/prompts',{recursive:true});
 const assetDir='static/images/series/accessibility/overview/'+lang;fs.mkdirSync(assetDir,{recursive:true});const assetRecords=[];
 for(const figure of figures){
  const data=metadata.figures[figure.slug];let raw=fs.readFileSync('static'+figure.src,'utf8');let count=0;
  raw=raw.replace(/(<text\b[^>]*>)([\s\S]*?)(<\/text>)/g,(_,open,old,close)=>{const label=data.labels[count++];if(typeof label!=='string')throw Error('Missing diagram label '+lang+'/'+figure.slug);return open+xml(new JSDOM(label).window.document.body.textContent)+close;});
  if(count!==data.labels.length)throw Error('Diagram label count '+lang+'/'+figure.slug);
  raw=raw.replace(/<title id="title">[^]*?<\/title>/,'<title id="title">'+xml(data.title)+'</title>').replace(/<desc id="desc">[^]*?<\/desc>/,'<desc id="desc">'+xml(data.alt)+'</desc>').replace('<svg xmlns=',`<svg lang="${lang}" xml:lang="${lang}" xmlns=`);
  const name=figure.slug+'-'+sha(raw).slice(0,12)+'.svg';const src='/images/series/accessibility/overview/'+lang+'/'+name;fs.writeFileSync(assetDir+'/'+name,raw);draft.body=draft.body.replaceAll(figure.src,src);assetRecords.push({slug:figure.slug,src,sha256:sha(raw)});
 }
 fs.writeFileSync(base+'/posts/overview.md',draft.body.trim()+'\n');fs.writeFileSync(base+'/prompts/overview.md',draft.prompt.trim()+'\n');
 if(metadata.posts.length!==original.length||new Set(metadata.posts.map(p=>p.slug)).size!==original.length)throw Error('Incomplete curriculum '+lang);
 const entries=original.map(p=>{const m=metadata.posts.find(m=>m.slug===p.slug);if(!m)throw Error('Missing curriculum title');return{slug:p.slug,title:p.slug==='overview'?draft.title:m.title,summary:p.slug==='overview'?draft.summary:m.summary,translationSourceHash:p.sourceHash,hasContent:p.slug==='overview',reviewReady:p.slug==='overview',status:'draft',approvalHash:null,publishedAt:null,reviewedAt:null};});
 fs.writeFileSync(base+'/manifest.json',JSON.stringify(entries,null,2)+'\n');
 reports.push({lang,sourceHash:original[0].sourceHash,overviewTranslation:read('overview.receipt'),metadataTranslation:read('metadata.receipt'),review:read('review.receipt'),reviewFindings:review,appliedCorrections:review.replacements.length,intentionalAdaptation:'Prompt output language localized to '+lang,assets:assetRecords,published:false});
}
fs.writeFileSync('reports/translations/accessibility-overview-provenance.json',JSON.stringify(reports,null,2)+'\n');console.log(JSON.stringify(reports.map(({lang,appliedCorrections,assets})=>({lang,appliedCorrections,assets:assets.length}))));
