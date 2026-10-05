import {error} from '@sveltejs/kit';
import copy from '$lib/labs/copy.json';
import {languageLinks,localizedPath,type Language} from '$lib/series/i18n';
import {canonicalLanguage} from './series';
export const mediaCaseIds=['K17','K42','K08','K63','K25','K91','K34','K56','K79','K03'] as const;
export const mediaLabPath='/labs/accessibility/media-alternatives';
export function loadMediaLab(lang:Language,url:URL,caseId='K63'){
 canonicalLanguage(lang,url);
 const index=mediaCaseIds.indexOf(caseId as typeof mediaCaseIds[number]);if(index<0)error(404,'Unknown practice case');
 const ui=copy[lang],path=mediaLabPath+(url.pathname.endsWith(caseId)?'/'+caseId:'');
 const cases=mediaCaseIds.map((id,i)=>({id,name:ui.names[i],reason:ui.reasons[i],path:localizedPath(mediaLabPath+'/'+id,lang)}));
 return {lang,ui,cases,selected:cases[index],frame:'/lab-fixtures/media-1.2.1/'+lang+'/'+caseId+'.html',original:caseId==='K17'?'/series/accessibility/non-text-content':'/lab-fixtures/media-1.2.1/original/cases/'+caseId+'/index.html',languageLinks:languageLinks(path,lang),seo:{title:ui.title+' — jangwook.net',description:ui.lead,lang,canonical:'https://jangwook.net'+localizedPath(path,lang),noindex:path!==mediaLabPath}};
}
