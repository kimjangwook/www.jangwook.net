import {loadInfo} from '$lib/server/site-pages';
import type {Language} from '$lib/series/i18n';
export const load=({url,params}:{url:URL;params:{lang:string}})=>loadInfo('services',params.lang as Language,url);
