import { defaultLang, type Language, languages } from './languages';

export function getStaticPaths() {
	return Object.keys(languages).map((lang) => ({
		params: { lang },
	}));
}

export function getRouteFromUrl(pathname: string): string {
	const [, lang, ...rest] = pathname.split('/');
	if (lang in languages) {
		return '/' + rest.join('/');
	}
	return pathname;
}

export function getAlternateLinks(route: string) {
	return Object.keys(languages).map((lang) => ({
		lang,
		url: `/${lang}${route}`,
	}));
}
