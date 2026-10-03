import {dev} from '$app/environment';
import records from '$lib/content/archive.json';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
export const archive = records;
export type ArchivePost = typeof archive[number];
export const languages = {ko:'한국어',en:'English',ja:'日本語',zh:'中文'};
export function archiveList(url:URL,options:{lang?:string;page?:number;tag?:string;pageSize?:number}={}){
 const lang=options.lang??url.searchParams.get('lang')??'ko';
 const query=(url.searchParams.get('q')??'').trim().slice(0,200);
 const posts=archive.filter(p=>(lang==='all'||p.lang===lang)&&(!options.tag||p.tags.includes(options.tag))&&[p.title,p.description,...p.tags].join(' ').toLowerCase().includes(query.toLowerCase()));
 const size=options.pageSize??30;const pages=Math.max(1,Math.ceil(posts.length/size));
 const requested=options.page??Number(url.searchParams.get('page')??1);
 if(!Number.isInteger(requested)||requested<1||requested>pages)error(404,'아카이브 페이지를 찾을 수 없습니다.');
 const link=(page:number)=>{const next=new URL(url);if(options.page&&/\/page\/\d+\/?$/.test(next.pathname)){next.pathname=page===1?next.pathname.replace(/\/page\/\d+\/?$/,'/'):next.pathname.replace(/\/page\/\d+\/?$/,'/page/'+page);next.searchParams.delete('page');}else next.searchParams.set('page',String(page));return next.pathname+next.search;};
 return {posts:posts.slice((requested-1)*size,requested*size),total:posts.length,query,lang,page:requested,pages,prev:requested>1?link(requested-1):null,next:requested<pages?link(requested+1):null};
}
export async function archiveArticle(event:RequestEvent,post:ArchivePost){
 const assetURL=new URL('/archive-content/'+post.asset,event.url);
 const response=!dev && event.platform?.env.ASSETS ? await event.platform.env.ASSETS.fetch(assetURL) : await event.fetch(assetURL);
 if(!response.ok)error(500,'보관된 글을 불러올 수 없습니다.');
 const {html,toc}=await response.json() as {html:string;toc:{id:string;text:string}[]};
 return {post:{...post,toc},html,translations:archive.filter(p=>p.slug===post.slug&&p.lang!==post.lang).map(p=>({lang:p.lang,path:p.path})),seo:{canonical:'https://jangwook.net'+post.path,title:post.title,description:post.description,lang:post.lang,noindex:post.noindex}};
}
