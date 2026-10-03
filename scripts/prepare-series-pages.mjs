import fs from 'node:fs/promises';
const root='content/series/accessibility';
const copy={ko:{planned:'준비 중',message:'이 문서는 집필과 검토를 준비하고 있습니다. 본문과 항목별 평가 프롬프트는 완성 후 같은 주소에 추가합니다.',toc:'전체 학습 순서',previous:'이전 글',next:'다음 글',source:'기준 원문',prompt:'평가 프롬프트 준비 중'},en:{planned:'In preparation',message:'This chapter is being prepared for writing and review. The full article and criterion-specific evaluation prompt will be added at this address.',toc:'All chapters',previous:'Previous article',next:'Next article',source:'Source standard',prompt:'Evaluation prompt in preparation'},ja:{planned:'準備中',message:'この記事は執筆とレビューの準備中です。本文と基準別の評価プロンプトは、完成後に同じURLで公開します。',toc:'全体の学習順序',previous:'前の記事',next:'次の記事',source:'基準の原文',prompt:'評価プロンプトは準備中です'},zh:{planned:'准备中',message:'本文正在准备编写与审核。完整文章与该标准的评估提示词将在完成后添加至同一地址。',toc:'完整学习顺序',previous:'上一篇',next:'下一篇',source:'标准原文',prompt:'评估提示词准备中'}};
let created=0;
for(const lang of ['ko','en','ja','zh']){
 const dir=lang==='ko'?root:root+'/translations/'+lang,manifestPath=dir+'/manifest.json';const entries=JSON.parse(await fs.readFile(manifestPath,'utf8'));
 const originals=JSON.parse(await fs.readFile(root+'/manifest.json','utf8'));const ui=copy[lang];const prefix=lang==='ko'?'':'/'+lang;
 for(const [i,p] of entries.entries()){
  p.reviewReady??=p.slug==='overview';
  for(const folder of ['posts','prompts']){
   const filename=dir+'/'+folder+'/'+p.slug+'.md';try{await fs.access(filename);}catch(e){if(e.code!=='ENOENT')throw e;
    const source=originals.find(o=>o.slug===p.slug).source;
    const body=folder==='prompts'?'# '+ui.prompt+'\n\n'+ui.message+'\n':'# '+p.title+'\n\n'+ui.planned+'\n\n'+p.summary+'\n\n'+ui.message+'\n\n['+ui.toc+']('+prefix+'/series/accessibility)\n\n'+(entries[i-1]?'['+ui.previous+': '+entries[i-1].title+']('+prefix+'/series/accessibility/'+entries[i-1].slug+')\n\n':'')+(entries[i+1]?'['+ui.next+': '+entries[i+1].title+']('+prefix+'/series/accessibility/'+entries[i+1].slug+')\n\n':'')+'['+ui.source+']('+source+')\n';
    await fs.writeFile(filename,body);created++;
   }
  }
 }
 await fs.writeFile(manifestPath,JSON.stringify(entries,null,2)+'\n');
}
console.log({created,documents:352,languages:4});
