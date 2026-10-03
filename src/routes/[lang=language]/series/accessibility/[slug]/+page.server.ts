import {loadArticle} from '$lib/server/series';
import type {Language} from '$lib/series/i18n';
export const load=({params,url}:{params:{slug:string;lang:string};url:URL})=>loadArticle(params.slug,params.lang as Language,url);
