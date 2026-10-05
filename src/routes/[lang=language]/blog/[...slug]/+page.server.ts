import { archive,archiveArticle,archiveList } from '$lib/server/archive';
import copy from '$lib/site/copy.json';import {isLanguage} from '$lib/series/i18n';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load:PageServerLoad=async(event)=>{
 const {slug}=event.params;const lang=isLanguage(event.params.lang)?event.params.lang:'ko';
 if(!slug||/^page\/\d+$/.test(slug))return {list:archiveList(event.url,{lang,pageSize:12,page:slug?Number(slug.split('/')[1]):undefined}),post:null,html:'',translations:[],seo:{title:copy[lang].archive[0]+' — jangwook.net',description:copy[lang].archive[1],lang,canonical:'https://jangwook.net'+event.url.pathname+event.url.search}};
 const path='/'+lang+'/blog/'+slug.replace(/\/$/,'')+'/';
 const post=archive.find(p=>p.path===path)||(slug.includes('/')?undefined:archive.find(p=>p.lang===lang&&p.slug===slug));
 if(!post)error(404,'보관된 글을 찾을 수 없습니다.');
 return {...await archiveArticle(event,post),list:null};
};
