import {loadHome} from '$lib/server/home';import type {PageServerLoad} from './$types';import type {Language} from '$lib/series/i18n';
export const load:PageServerLoad=({params,url})=>loadHome(params.lang as Language,url);
