import {loadCurriculum} from '$lib/server/series';
export const load=({url}:{url:URL})=>loadCurriculum('ko',url);
