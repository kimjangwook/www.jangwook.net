import { defaultLang, type Language, languages } from './languages';

export function getStaticPaths() {
	return Object.keys(languages).map((lang) => ({
		params: { lang },
	}));
}

export function getRouteFromUrl(pathname: string): string {
	const [, lang, ...rest] = pathname.split('/');
	if (lang in languages) {
		// Replace all occurrences of the current language code in the path
		const route = '/' + rest.join('/');
		// Replace language codes in the path segments (e.g., /blog/ko/... -> /blog/{newLang}/...)
		const languagePattern = new RegExp(`/(${Object.keys(languages).join('|')})/`, 'g');
		return route.replace(languagePattern, '/{LANG}/');
	}
	return pathname;
}

export function getAlternateLinks(route: string) {
	return Object.keys(languages).map((lang) => ({
		lang,
		url: `/${lang}${route.replace(/{LANG}/g, lang)}`,
	}));
}
