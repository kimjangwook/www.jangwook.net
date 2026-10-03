import {redirect} from '@sveltejs/kit';import {rss} from '$lib/server/series-feed';import type {Language} from '$lib/series/i18n';
export const GET=({params}:{params:{lang:string}})=>{if(params.lang==='ko')redirect(308,'/rss.xml');return rss(params.lang as Language);};
