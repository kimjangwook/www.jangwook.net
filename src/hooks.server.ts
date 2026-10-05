import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import {isLanguage,seriesLanguage} from '$lib/series/i18n';
import {LANGUAGE_COOKIE,preferredLanguage} from '$lib/server/language';
import {localizedPath} from '$lib/series/i18n';
import {catalogFor,isVisible,isPreview} from '$lib/server/content';
export const handle:Handle=async({event,resolve})=>{
 const path=event.url.pathname;
 const legacyFeed=path.match(/^\/(rss|sitemap)-(ko|en|ja|zh)\.xml$/);if(legacyFeed)redirect(308,legacyFeed[1]==='sitemap'?'/sitemap.xml':legacyFeed[2]==='ko'?'/rss.xml':'/'+legacyFeed[2]+'/rss.xml');
 const legacyInfo=path.match(/^\/(ko|en|ja|zh)\/(contact|terms|social)\/?$/);if(legacyInfo)redirect(308,localizedPath(legacyInfo[2]==='social'?'/about':legacyInfo[2]==='contact'?'/services':'/privacy',legacyInfo[1] as 'ko'|'en'|'ja'|'zh'));
 if(/^\/(contact|terms|social)\/?$/.test(path))redirect(308,path.includes('social')?'/about':path.includes('contact')?'/services':'/privacy');
 if(path==='/'&&['GET','HEAD'].includes(event.request.method)){const lang=preferredLanguage(event.cookies.get(LANGUAGE_COOKIE),event.request.headers.get('Accept-Language'));return new Response(null,{status:302,headers:{Location:localizedPath('/',lang)+event.url.search,'Cache-Control':'private, no-store',Vary:'Accept-Language, Cookie'}});}
 if((/^\/(ko|en|ja|zh)(?:\/?$|\/(series|prompts|about|updates|privacy|services|labs|archive)(?:\/|$))/.test(path)||/^\/(series|prompts|about|updates|privacy|services|labs|archive)(?:\/|$)/.test(path))){const requested=event.url.searchParams.get('lang');const lang=path==='/archive'&&requested&&isLanguage(requested)?requested:seriesLanguage(path);if(event.cookies.get(LANGUAGE_COOKIE)!==lang)event.cookies.set(LANGUAGE_COOKIE,lang,{path:'/',maxAge:60*60*24*180,httpOnly:true,sameSite:'lax',secure:event.url.protocol==='https:'});}
 if(/^\/(ko|en|ja|zh)$/.test(path))redirect(308,path+'/'+event.url.search);
 const response=await resolve(event,{transformPageChunk:({html})=>{
  const requested=event.url.searchParams.get('lang');const lang=path==='/archive'&&requested&&isLanguage(requested)?requested:seriesLanguage(path);return html.replace('<html lang="ko">','<html lang="'+lang+'">');
 }});
 const seriesMatch=path.match(/^\/(?:(ko|en|ja|zh)\/)?series\/accessibility\/([^/]+)\/?$/);
 if(seriesMatch){const post=catalogFor(seriesLanguage(path)).find(p=>p.slug===seriesMatch[2]);if(post&&!isVisible(post,false))response.headers.set('X-Robots-Tag','noindex, follow');}
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 if(isPreview(event.url)||path.startsWith('/dev/')||path.startsWith('/downloads/')||path.startsWith('/confirm/')||path.startsWith('/unsubscribe'))response.headers.set('X-Robots-Tag','noindex, nofollow');
 if(path.startsWith('/dev/')||path.startsWith('/downloads/')||path.startsWith('/confirm/')||path.startsWith('/resources/')||path.startsWith('/unsubscribe'))response.headers.set('Cache-Control','private, no-store');
 return response;
};
