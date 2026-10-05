import {loadMediaLab} from '$lib/server/labs';
import type {Language} from '$lib/series/i18n';
export const load=({url,params}:{url:URL;params:{lang?:string;case?:string}})=>loadMediaLab('ko',url,params.case);
