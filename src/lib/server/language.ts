import {isLanguage,type Language} from '$lib/series/i18n';
export const LANGUAGE_COOKIE='site_language';
export function preferredLanguage(cookie:string|undefined,header:string|null):Language{
 if(cookie&&isLanguage(cookie))return cookie;
 const preferences=(header??'').slice(0,2048).split(',').map((item,index)=>{const [tag,...parameters]=item.trim().split(';');const qParam=parameters.map(p=>p.trim()).find(p=>p.startsWith('q='));const q=qParam?Number(qParam.slice(2)):1;return{lang:tag.toLowerCase().split('-')[0],q,index};}).filter(p=>isLanguage(p.lang)&&Number.isFinite(p.q)&&p.q>0&&p.q<=1).sort((a,b)=>b.q-a.q||a.index-b.index);
 return preferences[0]?.lang as Language??'ko';
}
