<script lang="ts">
	/**
	 * StructuredData コンポーネント
	 *
	 * Schema.org の JSON-LD 構造化データを注入します。
	 *
	 * @example
	 * ```svelte
	 * <StructuredData data={{
	 *   "@context": "https://schema.org",
	 *   "@type": "Organization",
	 *   "name": "Agent Effi Flow",
	 *   "url": "https://agent-effi-flow.jangwook.net",
	 *   "logo": "https://agent-effi-flow.jangwook.net/logo.png"
	 * }} />
	 * ```
	 *
	 * @example
	 * ```svelte
	 * <StructuredData data={{
	 *   "@context": "https://schema.org",
	 *   "@type": "SoftwareApplication",
	 *   "name": "免税処理OCR",
	 *   "applicationCategory": "BusinessApplication",
	 *   "offers": {
	 *     "@type": "Offer",
	 *     "price": "0",
	 *     "priceCurrency": "JPY"
	 *   }
	 * }} />
	 * ```
	 */

	interface Props {
		/** Schema.org の構造化データオブジェクト */
		data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	let { data }: Props = $props();

	/**
	 * JSON-LD 形式に変換
	 * - 適切にエスケープされた JSON 文字列を生成
	 * - インデントは2スペース（可読性向上）
	 */
	const jsonLd = $derived(JSON.stringify(data, null, 2));
</script>

<svelte:head>
	<!-- Schema.org JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
