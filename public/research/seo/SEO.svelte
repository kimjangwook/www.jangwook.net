<script lang="ts">
	/**
	 * SEO コンポーネント
	 *
	 * メタタグ、OGP、Twitter Card、canonical、hreflang タグを設定します。
	 *
	 * @example
	 * ```svelte
	 * <SEO
	 *   title="サービス名"
	 *   description="サービスの説明"
	 *   canonical="https://agent-effi-flow.jangwook.net/services"
	 *   ogType="website"
	 *   ogImage="https://agent-effi-flow.jangwook.net/og-image.png"
	 * />
	 * ```
	 */

	interface Props {
		/** ページタイトル（サイト名は自動追加されます） */
		title: string;
		/** ページの説明文 */
		description: string;
		/** カノニカルURL（絶対パス） */
		canonical: string;
		/** OGP type（デフォルト: website） */
		ogType?: string;
		/** OGP画像URL（絶対パス） */
		ogImage?: string;
		/** 検索エンジンにインデックスさせない場合 true */
		noindex?: boolean;
	}

	let {
		title,
		description,
		canonical,
		ogType = 'website',
		ogImage = 'https://agent-effi-flow.jangwook.net/og/og-default.png',
		noindex = false
	}: Props = $props();

	// サイト名
	const SITE_NAME = 'Agent Effi Flow';
	const BASE_URL = 'https://agent-effi-flow.jangwook.net';

	// タイトルにサイト名を追加（既に含まれていない場合）
	const fullTitle = $derived(title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`);

	// サポート言語
	const languages = ['ja', 'en', 'ko', 'zh', 'es'];

	/**
	 * canonical URLから言語別URLを生成
	 * @param lang - 言語コード
	 */
	function getHreflangUrl(lang: string): string {
		// canonical URLがベースURLから始まる場合
		if (canonical.startsWith(BASE_URL)) {
			const path = canonical.substring(BASE_URL.length);
			// パスが言語コードで始まっていない場合のみ追加
			if (!path.startsWith(`/${lang}`)) {
				return `${BASE_URL}/${lang}${path}`;
			}
		}
		return canonical;
	}

	/**
	 * OGP locale形式に変換
	 * @param lang - 言語コード
	 */
	function getOgLocale(lang: string): string {
		const localeMap: Record<string, string> = {
			ja: 'ja_JP',
			en: 'en_US',
			ko: 'ko_KR',
			zh: 'zh_CN',
			es: 'es_ES'
		};
		return localeMap[lang] || 'ja_JP';
	}
</script>

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<!-- Robots Meta Tag -->
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<!-- Open Graph Protocol (OGP) -->
	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="ja_JP" />

	<!-- Alternate Locales for OGP -->
	{#each languages.filter((lang) => lang !== 'ja') as lang}
		<meta property="og:locale:alternate" content={getOgLocale(lang)} />
	{/each}

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />

	<!-- Hreflang Tags -->
	{#each languages as lang}
		<link rel="alternate" hreflang={lang} href={getHreflangUrl(lang)} />
	{/each}
	<!-- x-default for international users -->
	<link rel="alternate" hreflang="x-default" href={canonical} />
</svelte:head>
