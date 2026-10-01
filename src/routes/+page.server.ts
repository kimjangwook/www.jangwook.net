import {redirect} from '@sveltejs/kit';import type {PageServerLoad} from './$types';import {LANGUAGE_COOKIE,preferredLanguage} from '$lib/server/language';import {localizedPath} from '$lib/series/i18n';
export const load:PageServerLoad=({cookies,request,url})=>redirect(302,localizedPath('/',preferredLanguage(cookies.get(LANGUAGE_COOKIE),request.headers.get('Accept-Language')))+url.search);
