import fs from 'node:fs/promises';import crypto from 'node:crypto';
const revisionDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function trackRevision(entry,sourceHash){if(entry.contentRevisionHash&&entry.contentRevisionHash!==sourceHash)entry.updatedAt=revisionDate;entry.contentRevisionHash=sourceHash;}
const root='content/series/accessibility';const manifest=JSON.parse(await fs.readFile(root+'/manifest.json','utf8'));
const posts=await Promise.all(manifest.map(async p=>{const body=await fs.readFile(root+'/posts/'+p.slug+'.md','utf8');const prompt=await fs.readFile(root+'/prompts/'+p.slug+'.md','utf8');const metadata={title:p.title,summary:p.summary,criterion:p.criterion,level:p.level,order:p.order,source:p.source,version:p.version};const sourceHash=crypto.createHash('sha256').update(JSON.stringify(metadata)+'\n'+body+'\n'+prompt).digest('hex');trackRevision(p,sourceHash);return{...p,sourceHash,body,prompt};}));
await fs.writeFile(root+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile('src/lib/content/catalog.json',JSON.stringify(posts,null,2)+'\n');console.log('Compiled '+posts.length+' edited posts and prompts.');
const translated={};
for(const lang of ['en','ja','zh']){
 let entries=[];try{entries=JSON.parse(await fs.readFile(root+'/translations/'+lang+'/manifest.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 translated[lang]=await Promise.all(entries.map(async entry=>{
  const original=posts.find(p=>p.slug===entry.slug);if(!original)throw Error('Unknown translated slug '+entry.slug);
  let body='',prompt='';if(entry.hasContent){body=await fs.readFile(root+'/translations/'+lang+'/posts/'+entry.slug+'.md','utf8');prompt=await fs.readFile(root+'/translations/'+lang+'/prompts/'+entry.slug+'.md','utf8');}
  const metadata={title:entry.title,summary:entry.summary,criterion:original.criterion,level:original.level,order:original.order,source:original.source,version:original.version,lang,translationSourceHash:entry.translationSourceHash};
  const sourceHash=crypto.createHash('sha256').update(JSON.stringify(metadata)+'\n'+body+'\n'+prompt).digest('hex');
  trackRevision(entry,sourceHash);return{...original,...entry,lang,body,prompt,sourceHash,translationStale:entry.translationSourceHash!==original.sourceHash,status:entry.status??'draft',approvalHash:entry.approvalHash??null,reviewedAt:entry.reviewedAt??null,publishedAt:entry.publishedAt??null};
 }));
 await fs.writeFile(root+'/translations/'+lang+'/manifest.json',JSON.stringify(entries,null,2)+'\n');
}
await fs.writeFile('src/lib/content/translations.json',JSON.stringify(translated,null,2)+'\n');
