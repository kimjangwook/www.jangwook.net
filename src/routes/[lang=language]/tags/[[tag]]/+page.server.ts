import { archiveList } from '$lib/server/archive';
export const load=({url,params}:{url:URL;params:{lang:string;tag?:string}})=>({list:archiveList(url,{lang:params.lang,tag:params.tag}),seo:{title:'아카이브 — jangwook.net',description:'주제별 기존 글 아카이브',canonical:'https://jangwook.net'+url.pathname+url.search}});
