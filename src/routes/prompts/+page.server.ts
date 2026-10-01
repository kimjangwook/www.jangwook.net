import {loadPrompts} from '$lib/server/series';
export const load=({url}:{url:URL})=>loadPrompts('ko',url);
