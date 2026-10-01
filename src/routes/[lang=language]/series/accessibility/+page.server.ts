import {loadCurriculum} from '$lib/server/series';
import type {Language} from '$lib/series/i18n';
export const load=({params,url}:{params:{lang:string};url:URL})=>loadCurriculum(params.lang as Language,url);
