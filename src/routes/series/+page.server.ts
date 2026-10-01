import {loadCollection} from '$lib/server/series';
export const load=({url}:{url:URL})=>loadCollection('ko',url);
