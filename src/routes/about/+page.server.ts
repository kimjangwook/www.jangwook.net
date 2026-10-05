import {loadInfo} from '$lib/server/site-pages';
export const load=({url}:{url:URL})=>loadInfo('about','ko',url);
