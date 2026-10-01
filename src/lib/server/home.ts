import {catalogFor,canPublish,hasBody} from './content';
import {labels,languageLinks,localizedPath,type Language} from '$lib/series/i18n';
import {homeLabels} from '$lib/series/home-i18n';
export function loadHome(lang:Language,url:URL){const posts=catalogFor(lang),ui=labels[lang],home=homeLabels[lang];return{lang,ui,home,chapters:posts.length,criteria:posts.filter(p=>p.criterion).length,sample:posts.filter(p=>hasBody(p)&&canPublish(p)).sort((a,b)=>Date.parse(b.firstPublishedAt!)-Date.parse(a.firstPublishedAt!)||a.order-b.order).slice(0,5).map(({body,prompt,...p})=>p),languageLinks:languageLinks('/',lang),seo:{title:'jangwook.net — '+home.title,description:home.description,lang,canonical:'https://jangwook.net'+localizedPath('/',lang)}};}
