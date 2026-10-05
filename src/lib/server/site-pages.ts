import copy from '$lib/site/copy.json';
import {languageLinks,localizedPath,type Language} from '$lib/series/i18n';
import {canonicalLanguage} from './series';
export const infoPages=['about','updates','privacy','services'] as const;
export type InfoPage=typeof infoPages[number];
export function loadInfo(kind:InfoPage,lang:Language,url:URL){
 canonicalLanguage(lang,url);
 const [title,heading,description,sections]=copy[lang][kind] as [string,string,string,string[][]];
 const path='/'+kind;
 return {kind,lang,title,heading,description,sections,read:copy[lang].read,labLabel:copy[lang].lab,languageLinks:languageLinks(path,lang),seo:{title:title+' — jangwook.net',description,lang,canonical:'https://jangwook.net'+localizedPath(path,lang)}};
}
