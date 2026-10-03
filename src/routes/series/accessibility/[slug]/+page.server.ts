import {loadArticle} from '$lib/server/series';
export const load=({params,url}:{params:{slug:string};url:URL})=>loadArticle(params.slug,'ko',url);
