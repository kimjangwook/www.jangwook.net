import test from 'node:test';import assert from 'node:assert/strict';import {createServer} from 'vite';
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});test.after(()=>server.close());
const {preferredLanguage}=await server.ssrLoadModule('/src/lib/server/language.ts');
const {loadHome}=await server.ssrLoadModule('/src/lib/server/home.ts');
const {catalogFor}=await server.ssrLoadModule('/src/lib/server/content.ts');
const {localizedPath,seriesLanguage}=await server.ssrLoadModule('/src/lib/series/i18n.ts');
test('language preference respects explicit selection and weighted browser languages',()=>{
 for(const [cookie,header,expected] of [['ja','en-US','ja'],['invalid','en;q=0.3,zh-CN;q=0.9','zh'],[undefined,'fr,ja-JP;q=0.8,en;q=0.2','ja'],[undefined,'en;q=0,ko;q=0.5','ko'],[undefined,'*','ko'],[undefined,'ja;q=bad,en;q=0.5','en'],[undefined,null,'ko'],['constructor','en-US','en'],[undefined,'en;q=0.8,ja;q=0.8','en']])assert.equal(preferredLanguage(cookie,header),expected);
});
test('four real localized homes provide SSR metadata, selector links and only approved reading',()=>{
 for(const lang of ['ko','en','ja','zh']){const path='/'+lang+'/';assert.equal(localizedPath('/',lang),path);assert.equal(seriesLanguage(path),lang);assert.equal(seriesLanguage(path.slice(0,-1)),lang);const data=loadHome(lang,new URL('https://jangwook.net'+path));assert.equal(data.seo.canonical,'https://jangwook.net'+path);assert.equal(data.languageLinks.length,4);assert.deepEqual(data.sample.map(p=>p.slug),['audio-only-and-video-only-prerecorded','non-text-content','overview']);assert.ok(data.sample.every(p=>!('body' in p)&&!('prompt' in p)));assert.ok(data.home.reading);assert.ok(data.sample.length<=5);}
 assert.equal(localizedPath('/series/accessibility/overview','ko'),'/series/accessibility/overview');
});
test('all 352 documents have modification dates; only published editions have a first-publication date',()=>{
 for(const lang of ['ko','en','ja','zh'])for(const post of catalogFor(lang)){assert.match(post.updatedAt,/^\d{4}-\d{2}-\d{2}$/);assert.equal(new Date(post.updatedAt).toISOString().slice(0,10),post.updatedAt);if(post.status==='published'){assert.ok(Number.isFinite(Date.parse(post.firstPublishedAt)));assert.ok(Date.parse(post.firstPublishedAt)<=Date.parse(post.publishedAt));}else assert.equal(post.firstPublishedAt,null);assert.ok(!('createdAt' in post));}
});

test('latest list is limited to five approved articles in first-publication order',()=>{
 const posts=catalogFor('ko'),saved=posts.slice(0,7).map(p=>({...p}));try{for(let i=0;i<7;i++)Object.assign(posts[i],{status:'published',approvalHash:posts[i].sourceHash,reviewedAt:'2026-09-20T00:00:00Z',publishedAt:'2026-09-30T00:00:00Z',firstPublishedAt:'2026-09-'+String(20+i).padStart(2,'0')+'T00:00:00Z'});posts[6].approvalHash='0'.repeat(64);const data=loadHome('ko',new URL('https://jangwook.net/ko/'));assert.equal(data.sample.length,5);assert.deepEqual(data.sample.map(p=>p.slug),posts.slice(1,6).reverse().map(p=>p.slug));}finally{saved.forEach((p,i)=>Object.assign(posts[i],p));}
});
