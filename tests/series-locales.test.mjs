import test from 'node:test';import assert from 'node:assert/strict';import {createServer} from 'vite';
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
const {catalogFor,canPublish,isVisible}=await server.ssrLoadModule('/src/lib/server/content.ts');
const {loadArticle,loadCurriculum}=await server.ssrLoadModule('/src/lib/server/series.ts');
const {publishedVariants,rss}=await server.ssrLoadModule('/src/lib/server/series-feed.ts');
const {localizedPath,isLanguage}=await server.ssrLoadModule('/src/lib/series/i18n.ts');
test.after(()=>server.close());
test('localized overview has a real translated body, prompt, four figures and reciprocal paths',()=>{
 for(const lang of ['ko','en','ja','zh']){
  const path=localizedPath('/series/accessibility/overview',lang);const data=loadArticle('overview',lang,new URL('http://127.0.0.1:5175'+path));
  assert.equal(data.lang,lang);assert.ok(data.post.body.length>3000);assert.ok(data.post.prompt.length>500);assert.equal((data.post.body.match(/<figure\b/g)??[]).length,4);assert.equal(data.languageLinks.length,4);assert.equal(data.translations.length,3);assert.equal(data.seo.canonical,'https://jangwook.net'+path);
 }
 assert.equal(isLanguage('constructor'),false);assert.equal(localizedPath('/series','ko'),'/series');
});
test('all chapters have four-language preparation pages without a Korean fallback',()=>{
 for(const lang of ['en','ja','zh']){
  const url=new URL('http://127.0.0.1:5175'+localizedPath('/series/accessibility',lang));const data=loadCurriculum(lang,url);
  assert.equal(data.posts.length,88);assert.equal(data.posts.filter(p=>p.available).length,2);for(const p of data.posts){const article=loadArticle(p.slug,lang,url);assert.equal(article.languageLinks.length,4);if(!['overview','non-text-content'].includes(p.slug)){assert.equal(article.prepared,false);assert.equal(article.post.body,'');assert.equal(article.post.prompt,'');assert.equal(article.post.html,'');assert.equal(article.seo.noindex,true);assert.equal(!!article.prev,p.order>1);assert.equal(!!article.next,p.order<88);}}assert.throws(()=>loadArticle('unknown',lang,url),e=>e.status===404);
 }
});
test('exact translation approval and current Korean source are required outside preview',()=>{
 const original=catalogFor('en')[0];const post={...original,status:'published',reviewedAt:new Date(Date.now()-20000).toISOString(),publishedAt:new Date(Date.now()-10000).toISOString(),approvalHash:original.sourceHash};
 assert.equal(canPublish(post),true);assert.equal(isVisible(post,false),true);assert.equal(canPublish({...post,translationStale:true}),false);assert.equal(isVisible({...post,translationStale:true},false),false);assert.equal(isVisible({...post,body:'',prompt:''},true),false);assert.equal(canPublish({...post,approvalHash:'0'.repeat(64)}),false);
});
test('RSS and multilingual sitemap expose only approved chapters and exclude stale approvals',async()=>{
 assert.deepEqual(publishedVariants('overview').map(p=>p.lang),['ko','en','ja','zh']);
 for(const lang of ['ko','en','ja','zh']){const xml=await rss(lang).text();assert.equal((xml.match(/<item>/g)??[]).length,2);assert.ok(xml.includes(localizedPath('/series/accessibility/overview',lang)));assert.ok(xml.includes('<pubDate>'));assert.ok(xml.includes(localizedPath('/series/accessibility/non-text-content',lang)));assert.ok(!xml.includes('/keyboard'));}
 const en=catalogFor('en')[0],saved={...en};try{en.translationStale=true;assert.deepEqual(publishedVariants('overview').map(p=>p.lang),['ko','ja','zh']);assert.ok(!(await rss('en').text()).includes('/overview'));assert.ok((await rss('en').text()).includes('/non-text-content'));const data=loadArticle('overview','en',new URL('https://jangwook.net/en/series/accessibility/overview'));assert.equal(data.prepared,false);assert.equal(data.post.html,'');}finally{Object.assign(en,saved);}
});
test('article learning navigation exposes only ordered metadata and honest publication state',()=>{
 for(const lang of ['ko','en','ja','zh']){const data=loadArticle('keyboard',lang,new URL('https://jangwook.net'+localizedPath('/series/accessibility/keyboard',lang)));assert.equal(data.prepared,false);assert.equal(data.chapters.length,88);assert.deepEqual(data.chapters.map(p=>p.order),Array.from({length:88},(_,i)=>i+1));assert.equal(data.chapters.filter(p=>p.published).length,2);for(const chapter of data.chapters){assert.deepEqual(Object.keys(chapter).sort(),['group','order','published','slug','title']);assert.ok(chapter.title.trim());}assert.equal(data.post.body,'');assert.equal(data.post.prompt,'');assert.equal(data.post.html,'');}
});
