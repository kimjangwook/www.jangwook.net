import { archive,archiveArticle,archiveList } from '$lib/server/archive';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load:PageServerLoad=async(event)=>{
 const {lang,slug}=event.params;
 if(!slug||/^page\/\d+$/.test(slug))return {list:archiveList(event.url,{lang,pageSize:12,page:slug?Number(slug.split('/')[1]):undefined}),post:null,html:'',translations:[],seo:{title:'아카이브 — jangwook.net',description:'기존에 공개한 글을 원래 주소 그대로 보관합니다.',canonical:'https://jangwook.net'+event.url.pathname+event.url.search}};
 const path='/'+lang+'/blog/'+slug.replace(/\/$/,'')+'/';
 const post=archive.find(p=>p.path===path)||(slug.includes('/')?undefined:archive.find(p=>p.lang===lang&&p.slug===slug));
 if(!post)error(404,'보관된 글을 찾을 수 없습니다.');
 return {...await archiveArticle(event,post),list:null};
};
