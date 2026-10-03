import {loadPrompts} from '$lib/server/series';
import type {Language} from '$lib/series/i18n';
export const load=({params,url}:{params:{lang:string};url:URL})=>loadPrompts(params.lang as Language,url);
