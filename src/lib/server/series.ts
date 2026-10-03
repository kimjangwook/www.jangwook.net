import {error,redirect} from '@sveltejs/kit';
import {Marked} from 'marked';
import {catalogFor,isPreview,isVisible} from '$lib/server/content';
import {labels,languages,localizedPath,languageLinks,type Language} from '$lib/series/i18n';
export function canonicalLanguage(lang:Language,url:URL){if(lang==='ko'&&url.pathname.startsWith('/ko/'))redirect(308,url.pathname.slice(3)+url.search);}
export function loadCurriculum(lang:Language,url:URL){
 canonicalLanguage(lang,url);const ui=labels[lang],preview=isPreview(url);
 return {lang,ui,preview,chapters:catalogFor(lang).map(p=>({slug:p.slug,title:p.title,order:p.order,published:isVisible(p,false)})),posts:catalogFor(lang).map(({body,prompt,...p})=>({...p,available:isVisible({...p,body,prompt},preview)})),languageLinks:languageLinks('/series/accessibility',lang),seo:{title:ui.seriesTitle+' — jangwook.net',description:ui.seriesDescription,lang,canonical:'https://jangwook.net'+localizedPath('/series/accessibility',lang)}};
}
export function loadCollection(lang:Language,url:URL){canonicalLanguage(lang,url);const ui=labels[lang];return{lang,ui,count:catalogFor(lang).length,languageLinks:languageLinks('/series',lang),seo:{title:ui.series+' — jangwook.net',description:ui.collectionLead,lang,canonical:'https://jangwook.net'+localizedPath('/series',lang)}};}
export function loadPrompts(lang:Language,url:URL){
 canonicalLanguage(lang,url);const ui=labels[lang];return{lang,ui,query:(url.searchParams.get('q')??'').trim().slice(0,200),level:['A','AA','AAA'].includes(url.searchParams.get('level')??'')?url.searchParams.get('level')!:'all',posts:catalogFor(lang).map(({body,prompt,...p})=>({...p,available:isVisible({...p,body,prompt},isPreview(url))})),languageLinks:languageLinks('/prompts'+url.search,lang),seo:{title:ui.libraryTitle+' — jangwook.net',description:ui.libraryDescription,lang,canonical:'https://jangwook.net'+localizedPath('/prompts',lang)}};
}
export function loadArticle(slug:string,lang:Language,url:URL){
 canonicalLanguage(lang,url);const ui=labels[lang],preview=isPreview(url),sequence=catalogFor(lang);const post=sequence.find(p=>p.slug===slug);if(!post)error(404,ui.preparing);
 const prepared=isVisible(post,preview);
 const toc:{id:string;text:string}[]=[];let heading=0;
 const markdown=new Marked({renderer:{listitem(token){let content=this.parser.parse(token.tokens);if(token.task){const label=token.text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));content=content.replace('<input ','<input aria-label="'+label+'" ');}return '<li>'+content+'</li>\n';},heading(token){if(token.depth!==2)return '<h'+token.depth+'>'+this.parser.parseInline(token.tokens)+'</h'+token.depth+'>\n';const id='section-'+(++heading);toc.push({id,text:token.text.replace(/[*`]/g,'')});return '<h2 id="'+id+'">'+this.parser.parseInline(token.tokens)+'</h2>\n';}}});
 // Canonical Markdown retains source URLs; rendered learning links stay in the reader's language.
 const html=(markdown.parse(prepared?post.body:'',{async:false}) as string).replace(/href="https:\/\/jangwook\.net(\/series\/accessibility(?:\/[^"#?]*)?)"/g,(_,path:string)=>'href="'+localizedPath(path,lang)+'"');const i=sequence.indexOf(post),path=localizedPath('/series/accessibility/'+slug,lang);
 const alternatives=(Object.keys(languages) as Language[]).filter(l=>l!==lang&&catalogFor(l).some(p=>p.slug===slug)).map(l=>({lang:l,path:localizedPath('/series/accessibility/'+slug,l)}));
 const available=[{lang,path},...alternatives];
 return{lang,ui,prepared,chapters:sequence.map(p=>({slug:p.slug,title:p.title,order:p.order,group:p.group,published:isVisible(p,false)})),post:{...post,body:prepared?post.body:'',prompt:prepared?post.prompt:'',html},toc,prev:sequence[i-1]?{slug:sequence[i-1].slug,title:sequence[i-1].title}:null,next:sequence[i+1]?{slug:sequence[i+1].slug,title:sequence[i+1].title}:null,preview,path,translations:alternatives.filter(a=>catalogFor(a.lang).some(p=>p.slug===slug&&isVisible(p,preview))),languageLinks:available.sort((a,b)=>Object.keys(languages).indexOf(a.lang)-Object.keys(languages).indexOf(b.lang)).map(a=>({...a,name:languages[a.lang],current:a.lang===lang})),seo:{title:post.title,description:post.summary,lang,canonical:'https://jangwook.net'+path,noindex:!prepared||!isVisible(post,false)}};
}
