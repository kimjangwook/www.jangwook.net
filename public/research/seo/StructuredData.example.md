# StructuredData Component Usage Examples

## Organization Schema

```svelte
<script>
	import StructuredData from '$lib/components/StructuredData.svelte';
</script>

<StructuredData
	data={{
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Agent Effi Flow',
		url: 'https://agent-effi-flow.jangwook.net',
		logo: 'https://agent-effi-flow.jangwook.net/logo.png',
		description: 'AI駆動の業務効率化サービスプラットフォーム',
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'Customer Service',
			email: 'support@agent-effi-flow.jangwook.net'
		}
	}}
/>
```

## Software Application Schema

```svelte
<StructuredData
	data={{
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: '免税処理OCR',
		applicationCategory: 'BusinessApplication',
		description: 'パスポートと免税書類をAIで自動処理する業務効率化ツール',
		operatingSystem: 'Web',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'JPY',
			description: '初回100クレジット無料'
		}
	}}
/>
```

## Service Schema

```svelte
<StructuredData
	data={{
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: '経理OCR',
		description: '領収書・請求書をAI OCRで自動データ化',
		provider: {
			'@type': 'Organization',
			name: 'Agent Effi Flow'
		},
		areaServed: 'JP',
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: '経理OCR プラン',
			itemListElement: [
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Service',
						name: '経理OCR API'
					}
				}
			]
		}
	}}
/>
```

## Article/Blog Post Schema

```svelte
<StructuredData
	data={{
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: 'AI OCRの活用事例',
		description: '免税処理と経理業務におけるAI OCR導入事例',
		image: 'https://agent-effi-flow.jangwook.net/blog/ai-ocr-case-study.png',
		author: {
			'@type': 'Organization',
			name: 'Agent Effi Flow'
		},
		publisher: {
			'@type': 'Organization',
			name: 'Agent Effi Flow',
			logo: {
				'@type': 'ImageObject',
				url: 'https://agent-effi-flow.jangwook.net/logo.png'
			}
		},
		datePublished: '2025-01-15',
		dateModified: '2025-01-20'
	}}
/>
```

## FAQ Schema

```svelte
<StructuredData
	data={{
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: '免税処理OCRの処理速度は？',
				acceptedAnswer: {
					'@type': 'Answer',
					text: '1件あたり平均3秒で処理が完了します。バッチ処理にも対応しています。'
				}
			},
			{
				'@type': 'Question',
				name: '対応している言語は？',
				acceptedAnswer: {
					'@type': 'Answer',
					text: '日本語、英語、韓国語、中国語、スペイン語の5言語に対応しています。'
				}
			}
		]
	}}
/>
```

## Breadcrumb Schema

```svelte
<StructuredData
	data={{
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'ホーム',
				item: 'https://agent-effi-flow.jangwook.net'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'サービス',
				item: 'https://agent-effi-flow.jangwook.net/services'
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: '免税処理OCR',
				item: 'https://agent-effi-flow.jangwook.net/services/tax-free-ocr'
			}
		]
	}}
/>
```

## Multiple Schemas on One Page

```svelte
<script>
  import StructuredData from '$lib/components/StructuredData.svelte';
</script>

<!-- Organization Schema -->
<StructuredData
  data={{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Agent Effi Flow",
    "url": "https://agent-effi-flow.jangwook.net"
  }}
/>

<!-- Breadcrumb Schema -->
<StructuredData
  data={{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [...]
  }}
/>

<!-- Service Schema -->
<StructuredData
  data={{
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "免税処理OCR",
    "description": "パスポートと免税書類をAIで自動処理"
  }}
/>
```

## Generated Output

The component generates a `<script>` tag with `type="application/ld+json"`:

```html
<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "Organization",
		"name": "Agent Effi Flow",
		"url": "https://agent-effi-flow.jangwook.net",
		"logo": "https://agent-effi-flow.jangwook.net/logo.png"
	}
</script>
```

## Benefits

1. **SEO Enhancement**: Helps search engines understand your content
2. **Rich Snippets**: Enables Google to display rich results (stars, prices, etc.)
3. **Type Safety**: TypeScript support with proper type checking
4. **Flexibility**: Accepts any Schema.org object structure
5. **Multiple Schemas**: Can use multiple instances on one page
6. **Clean Output**: Properly formatted JSON-LD with 2-space indentation

## Resources

- [Schema.org Documentation](https://schema.org/)
- [Google Structured Data Testing Tool](https://search.google.com/test/rich-results)
- [Schema.org Full Hierarchy](https://schema.org/docs/full.html)
